import React from 'react'
import PropTypes from 'prop-types'
import { GiftedChat } from 'react-native-gifted-chat'

export default class Chat extends React.Component {
	constructor(props) {
		super(props)
	}

	handleSend = ([message]) => {
		this.props.handleSendMessage(message.text)
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

		if (isChatOn) {
			return (
					<GiftedChat
						inverted={false}
						messages={messages}
						scrollToBottom
						onSend={this.handleSend}
						onInputTextChanged={onInputChange}
						user={customer}
						isTyping={isTyping}
						onQuickReply={onQuickReply}
						disableComposer={disableComposer}
						showAvatarForEveryMessage={false}
						{...restProps}
					/>
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
