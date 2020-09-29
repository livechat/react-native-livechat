import React, { Component } from 'react'
import { View, Dimensions, StyleSheet, Image } from 'react-native'
import PropTypes from 'prop-types'
import ChatBubble from './components/ChatBubble'
import Chat from './components/Chat'
import { init } from '@livechat/livechat-visitor-sdk'
import { AuthWebView } from '@livechat/customer-auth'
import { init as CustomerSdkInit } from '@livechat/customer-sdk'
import * as lc3Parsers from './lc3Parsers'
import * as lc2Parsers from './lc2Parsers'

const chatIcon = require('./../assets/chat.png')
const { width } = Dimensions.get('window')

export default class LiveChat extends Component {
	constructor(props) {
		super(props)
		this.defineStyles()

		this.state = {
			isChatOn: false,
			protocol: 'lc2',
			messages: [],
			users: {},
			queued: false,
			queueData: {},
			isTyping: false,
			onlineStatus: false,
			connectionState: 'not_connected',
			bubble: props.bubble ? (
				props.bubble
			) : (
				<View style={this.styles.bubbleStyle}>
					<Image source={chatIcon} style={this.styles.icon} />
				</View>
			),
		}
	}

	componentDidMount() {
		const visitorSDK = init({
			license: this.props.license,
			group: this.props.group,
			appName: 'ReactNative',
		})

		this.initVisitorSdk(visitorSDK)

		visitorSDK.on('protocol_upgraded', () => {
			this.setState({
				protocol: 'lc3',
				users: {},
				messages: [],
			})
			this.initCustomerSdk({
				licenseId: this.props.license,
				clientId: this.props.clientId,
				redirectUri: this.props.redirectUri,
				region: this.props.region,
			})
			visitorSDK.destroy()
		})

		this.props.onLoaded(visitorSDK)
		this.visitorSDK = visitorSDK
	}

	getCustomer = () => {
		const customerId = Object.keys(this.state.users).find((userId) => this.state.users[userId].type === 'customer')
		const user = this.state.users[customerId]
		return user
	}

	getUser = (id) => {
		const userId = Object.keys(this.state.users).find((_userId) => _userId === id)
		return this.state.users[userId]
	}

	addSystemMessage = (text) => {
		this.setState({
			messages: [
				...this.state.messages,
				{
					text,
					_id: String(Math.random()),
					createdAt: Date.now(),
					user: {
						_id: 'system',
					},
					system: true,
				},
			],
		})
	}

	updateEvent = (id, data) => {
		const eventIndex = this.state.messages.findIndex(({ _id }) => _id === id)
		this.setState({
			messages: [
				...this.state.messages.map((_event, index) => {
					if (index !== eventIndex) {
						return _event
					}
					return {
						...this.state.messages[eventIndex],
						...data,
					}
				}),
			],
		})
	}

	handleInputChange = (text) => {
		if (this.state.protocol === 'lc2') {
			this.visitorSDK.setSneakPeek({ text })
		} else {
			if (!this.state.chatId) {
				return
			}
			this.customerSDK.setSneakPeek({
				chatId: this.state.chatId,
				sneakPeekText: text,
			})
		}
	}

	sendNewMessageLc2 = (message, customId) => {
		return this.visitorSDK.sendMessage({
			customId,
			text: message,
		})
	}

	sendNewMessageLc3 = (message, quickReply, customId) => {
		let postBack = null
		if (quickReply) {
			const sourceEvent = this.state.messages.find((_message) => _message._id === quickReply.messageId)
			postBack = {
				id: quickReply.postback,
				type: 'message',
				value: quickReply.value,
				event_id: sourceEvent._id,
				thread_id: sourceEvent.thread,
			}
		}
		const newEvent = {
			type: 'message',
			text: message,
			customId,
			...(postBack && { postBack }),
		}
		if (!this.state.chatId) {
			return this.customerSDK
				.startChat({
					chat: {
						thread: {
							events: [newEvent],
						},
					},
					continuous: true,
				})
				.then((chat) => {
					this.setState({
						chatId: chat.chat,
						chatActive: true,
					})
				})
		}
		if (!this.state.chatActive) {
			return this.customerSDK
				.activateChat({
					chat: {
						id: this.state.chatId,
						thread: {
							events: [newEvent],
						},
					},
					continuous: true,
				})
				.then((chat) => {
					this.setState({
						chatActive: true,
					})
				})
		}
		return this.customerSDK.sendEvent({
			chatId: this.state.chatId,
			event: newEvent,
		})
	}

	handleSendMessage = (message, quickReply) => {
		const newEventId = String(Math.random())
		this.setState({
			messages: [
				...this.state.messages,
				{
					_id: newEventId,
					user: {
						_id: this.getCustomer()._id,
					},
					createdAt: Date.now(),
					text: message,
					pending: true,
				},
			],
		})
		let sendMessagePromise
		if (this.state.protocol === 'lc3') {
			sendMessagePromise = this.sendNewMessageLc3(message, quickReply, newEventId)
		} else {
			sendMessagePromise = this.sendNewMessageLc2(message, newEventId)
		}
		sendMessagePromise
			.then(() => {
				this.updateEvent(newEventId, {
					sent: true,
					pending: false,
				})
			})
			.catch(() => {
				this.addSystemMessage('Sending message failed')
			})
	}

	initVisitorSdk(visitorSdk) {
		visitorSdk.on('connection_status_changed', ({ status }) => {
			this.setState({
				connectionState: status,
			})
		})
		visitorSdk.on('new_message', (newMessage) => {
			const hasEvent = this.state.messages.some(
				(_stateEvent) => _stateEvent._id === newMessage.id || _stateEvent._id === newMessage.customId,
			)
			if (hasEvent) {
				return
			}
			const user = this.state.users[newMessage.authorId]
			this.setState({
				messages: [...this.state.messages, lc2Parsers.parseNewMessage(user, newMessage)],
			})
		})
		visitorSdk.on('chat_started', (chatData) => {
			this.setState({
				queued: false,
				chatActive: true,
			})
		})
		visitorSdk.on('agent_changed', (newAgent) => {
			this.setState({
				users: {
					...this.state.users,
					[newAgent.id]: lc2Parsers.parseNewAgent(newAgent),
				},
			})
		})
		visitorSdk.on('status_changed', (statusData) => {
			this.setState({
				onlineStatus: statusData.status === 'online',
			})
		})
		visitorSdk.on('visitor_queued', (queueData) => {
			this.setState({
				queued: true,
				queueData,
			})
		})
		visitorSdk.on('typing_indicator', (typingData) => {
			this.setState({
				isTyping: typingData.isTyping,
			})
		})
		visitorSdk.on('chat_ended', () => {
			this.addSystemMessage('Chat is closed')
			this.setState({
				chatActive: false,
			})
		})
		visitorSdk.on('visitor_data', (visitorData) => {
			this.setState({
				users: {
					...this.state.users,
					[visitorData.id]: lc2Parsers.parseVisitorData(visitorData),
				},
			})
		})
	}

	initCustomerSdk({ licenseId, clientId, redirectUri, region }) {
		const config = {
			licenseId: Number(licenseId, 10),
			clientId,
			redirectUri,
		}
		if (this.props.group !== null) {
			config.groupId = this.props.group
		}
		if (region) {
			config.region = region
		}
		const customerSDK = CustomerSdkInit(config)
		this.customerSDK = customerSDK
		customerSDK.on('incoming_event', ({ event }) => {
			const hasEvent = this.state.messages.some(
				(_stateEvent) => _stateEvent._id === event.id || _stateEvent._id === event.customId,
			)
			if (hasEvent) {
				return
			}
			const parsed = lc3Parsers.parseEvent(event, this.getUser(event.authorId))
			if (parsed) {
				this.setState({
					messages: [...this.state.messages, parsed],
					isTyping: false,
				})
			}
		})
		customerSDK.on('user_data', (user) => {
			this.setState({
				users: {
					...this.state.users,
					[user.id]: lc3Parsers.parseUserData(user),
				},
			})
		})
		customerSDK.on('incoming_typing_indicator', ({ typingIndicator }) => {
			this.setState({
				isTyping: typingIndicator.isTyping,
			})
		})
		customerSDK.on('availability_updated', (data) => {
			const { availability } = data
			this.setState({
				onlineStatus: availability === 'online',
			})
		})
		customerSDK.on('customer_id', (customerId) => {
			this.setState({
				users: {
					...this.state.users,
					[customerId]: {
						_id: customerId,
						type: 'customer',
						name: 'Customer',
					},
				},
			})
		})
		customerSDK.on('connected', ({ availability }) => {
			this.setState({
				connectionState: 'connected',
				onlineStatus: availability === 'online',
			})
			customerSDK.updateCustomer(this.props.customerData);
			customerSDK.listChats().then((data) => {
				const { chatsSummary, totalChats } = data
				if (totalChats) {
					this.setState({
						chatId: chatsSummary[0].id,
						chatActive: chatsSummary[0].active,
					})
					customerSDK
						.getChatHistory({ chatId: chatsSummary[0].id })
						.next()
						.then((historyData) => {
							const { value, done } = historyData
							const newThreadEvents = value.threads.map((thread) => {
								const { events } = thread
								const newEvents = events.filter(
									({ id }) => !this.state.messages.some((_stateEvent) => _stateEvent._id === id),
								)
								return {
									events: newEvents,
								}
							})
							const eventsToAdd = newThreadEvents.reduce((acc, current) => {
								return [...acc, ...current.events]
							}, [])
							if (!eventsToAdd) {
								return
							}
							const parsed = eventsToAdd
								.map((_event) => {
									return lc3Parsers.parseEvent(_event, this.getUser(_event.authorId))
								})
								.filter(Boolean)
							this.setState({
								messages: [...parsed, ...this.state.messages],
							})
						})
				}
			})
		})
		customerSDK.on('connection_lost', () => {
			this.setState({
				connectionState: 'connection_lost',
			})
		})
		customerSDK.on('disconnected', () => {
			this.setState({
				connectionState: 'disconnected',
			})
		})

		customerSDK.on('chat_deactivated', () => {
			this.setState({
				chatActive: false,
			})
		})

		customerSDK.on('incoming_chat', () => {
			this.setState({
				chatActive: true,
			})
		})
	}

	defineStyles = () => {
		this.styles = StyleSheet.create({
			bubbleStyle: {
				width: width / 6,
				height: width / 6,
				backgroundColor: this.props.bubbleColor,
				borderRadius: width / 12,
				alignItems: 'center',
				justifyContent: 'center',
			},
			icon: {
				width: width / 10,
				height: width / 10,
			},
		})
	}

	openChat = () => {
		this.setState({ isChatOn: true })
	}

	closeChat = () => {
		this.setState({ isChatOn: false })
	}

	getHeaderText = () => {
		if (this.state.messages.length && this.state.chatActive) {
			return null
		}
		return this.state.onlineStatus ? this.props.greeting : this.props.noAgents
	}

	shouldDisableComposer = () => {
		if (!this.state.onlineStatus && !this.state.chatActive) {
			return true
		}
		if (this.state.queued) {
			return true
		}
		return this.state.connectionState !== 'connected'
	}

	render() {
		const { isChatOn } = this.state

		return [
			<ChatBubble
				key="bubble"
				openChat={this.openChat}
				bubble={this.state.bubble}
				disabled={this.props.movable}
				styles={this.props.bubbleStyles}
			/>,
			this.visitorSDK && (
				<Chat
					key="chat"
					{...this.props}
					isChatOn={isChatOn}
					closeChat={this.closeChat}
					handleSendMessage={this.handleSendMessage}
					messages={this.state.messages}
					users={this.state.users}
					customer={this.getCustomer()}
					isTyping={this.state.isTyping}
					onQuickReply={(data) => this.handleSendMessage(data[0].title, data[0])}
					onlineStatus={this.state.onlineStatus}
					connectionState={this.state.connectionState}
					onInputChange={this.handleInputChange}
					disableComposer={this.shouldDisableComposer()}
					headerText={this.getHeaderText()}
				/>
			),
			<AuthWebView key="auth" />,
		]
	}
}

LiveChat.propTypes = {
	license: PropTypes.string.isRequired,
	movable: PropTypes.bool,
	bubble: PropTypes.element,
	bubbleColor: PropTypes.string,
	bubbleStyles: PropTypes.object,
	chatTitle: PropTypes.string,
	greeting: PropTypes.string,
	noAgents: PropTypes.string,
	onLoaded: PropTypes.func,
	clientId: PropTypes.string,
	redirectUri: PropTypes.string,
	customerData: PropTypes.object
}

LiveChat.defaultProps = {
	bubbleColor: '#2962FF',
	bubbleStyles: {
		position: 'absolute',
		bottom: 12,
		right: 12,
	},
	movable: true,
	onLoaded: () => {},
	group: 0,
	chatTitle: 'Chat with us!',
	greeting: 'Welcome to our LiveChat!\nHow may We help you?',
	noAgents: 'Our agents are not available right now.',
}
