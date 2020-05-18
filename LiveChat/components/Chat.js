import React from 'react'
import { StyleSheet, Text, Dimensions, Platform } from 'react-native'
import { View } from 'react-native-animatable'
import PropTypes from 'prop-types'
import { GiftedChat } from 'react-native-gifted-chat'
import NavigationBar from './NavigationBar'

const { height, width } = Dimensions.get('window')
const totalSize = (num) => (Math.sqrt(height * height + width * width) * num) / 100

export default class Chat extends React.Component {
	constructor(props) {
		super(props)

		this.renderFooter = this.renderFooter.bind(this)
	}

	handleSend = ([message]) => {
		this.props.handleSendMessage(message.text)
	}

	renderFooter = () => {
		if (this.props.isTyping) {
			return (
				<View style={styles.footerContainer}>
					<Text style={styles.footerText}>Agent is typing...</Text>
				</View>
			)
		}
		return null
	}

	render() {
		const {
			messages,
			onInputChange,
			customer,
			isTyping,
			isChatOn,
			onQuickReply,
			disableComposer,
			chatTitle,
			closeChat,
			headerText,
			...restProps
		} = this.props
		const isReconnecting = this.props.connectionState !== 'connected'
		if (isChatOn) {
			return (
				<View
					animation="fadeInUp"
					style={styles.container}
					ref={(ref) => {
						this.chat = ref
					}}
				>
					<NavigationBar chatTitle={chatTitle} closeChat={closeChat} />
					{isReconnecting && <Text style={styles.connectionStatus}>Reconnecting...</Text>}
					{headerText && <Text style={styles.status}>{headerText}</Text>}
					<GiftedChat
						inverted={false}
						messages={messages}
						scrollToBottom
						renderFooter={this.renderFooter}
						onSend={this.handleSend}
						onInputTextChanged={onInputChange}
						user={customer}
						isTyping={isTyping}
						onQuickReply={onQuickReply}
						disableComposer={disableComposer}
						showAvatarForEveryMessage={false}
						{...restProps}
					/>
				</View>
			)
		}
		return null
	}
}

Chat.propTypes = {
	license: PropTypes.string.isRequired,
	chatTitle: PropTypes.string.isRequired,
	closeChat: PropTypes.func.isRequired,
	isChatOn: PropTypes.bool.isRequired,
	greeting: PropTypes.string.isRequired,
	noAgents: PropTypes.string.isRequired,
	messages: PropTypes.array.isRequired,
	customer: PropTypes.object,
	onInputChange: PropTypes.func.isRequired,
	isTyping: PropTypes.bool.isRequired,
	connectionState: PropTypes.string.isRequired,
}

const styles = StyleSheet.create({
	hide: {
		width: 0,
		height: 0,
		position: 'absolute',
	},
	container: {
		width,
		height: '100%',
		position: 'absolute',
		top: 0,
		left: 0,
		flexDirection: 'column',
		backgroundColor: '#fff',
	},
	navigation: {
		flex: 1,
	},
	systemMessage: {
		backgroundColor: '#fff',
		alignSelf: 'center',
	},
	footerContainer: {
		marginTop: 5,
		marginLeft: 10,
		marginRight: 10,
		marginBottom: 10,
	},
	footerText: {
		fontSize: 14,
		color: '#aaa',
	},
	status: {
		textAlign: 'center',
		fontSize: totalSize(2.1),
		fontWeight: '500',
		color: '#444',
		padding: 5,
	},
	connectionStatus: {
		textAlign: 'center',
		fontWeight: '500',
		color: '#000',
		backgroundColor: '#edbe25',
		padding: 10,
	},
})
