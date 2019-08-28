import React from 'react';
import { StyleSheet, Text, Dimensions, Platform } from 'react-native';
import { View } from 'react-native-animatable';
import PropTypes from 'prop-types';
import { GiftedChat } from 'react-native-gifted-chat';
import NavigationBar from './NavigationBar';

const { height, width } = Dimensions.get('window');
const totalSize = num => (Math.sqrt((height * height) + (width * width)) * num) / 100;

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      onlineStatus: false,
      typingText: null,
      users: {
        system: {
          name: 'system',
          _id: 'system',
        },
      },
    };
    GLOBAL.visitorSDK.on('new_message', this.handleNewMessage.bind(this));
    GLOBAL.visitorSDK.on('agent_changed', this.handleAgentChanged.bind(this));
    GLOBAL.visitorSDK.on('status_changed', this.handleStateChange.bind(this));
    GLOBAL.visitorSDK.on('typing_indicator', this.handleTypingIndicator.bind(this));
    GLOBAL.visitorSDK.on('chat_ended', this.handleChatEnded.bind(this));
    GLOBAL.visitorSDK.on('visitor_data', this.hendleVisitorData.bind(this));

    this.handleInputTextChange = this.handleInputTextChange.bind(this);
    this.handleSend = this.handleSend.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
  }

  getVisitor = () => {
    const visitorId = Object.keys(this.state.users).find(userId => this.state.users[userId].type === 'visitor');
    return this.state.users[visitorId];
  };

  handleNewMessage = (newMessage) => {
    this.addMessage(newMessage);
  };

  addMessage = (message) => {
    this.setState({
      messages: [{
        text: message.text,
        _id: message.id,
        createdAt: message.timestamp,
        user: this.state.users[message.authorId],
      }, ...this.state.messages],
    });
  };

  handleAgentChanged = (newAgent) => {
    this.addUser(newAgent, 'agent');
  };

  hendleVisitorData = (visitorData) => {
    this.addUser(visitorData, 'visitor');
  };

  handleStateChange = (statusData) => {
    this.setState({
      onlineStatus: statusData.status === 'online',
    });
  };

  handleInputTextChange = (text) => {
    GLOBAL.visitorSDK.setSneakPeek({ text });
  };

  handleChatEnded = () => {
    this.setState({
      messages: [{
        text: 'Chat is closed',
        _id: String(Math.random()),
        createdAt: Date.now(),
        user: {
          _id: 'system',
        },
      }, ...this.state.messages],
    });
  };

  handleSend = (messages) => {
    GLOBAL.visitorSDK.sendMessage({
      customId: String(Math.random()),
      text: messages[0].text,
    });
  };

  handleTypingIndicator = (typingData) => {
    this.setState({
      typingText: typingData.isTyping ? 'Agent is typing...' : null,
    });
  };

  addUser = (newUser, type) => {
    this.setState({
      users: Object.assign({}, this.state.users, {
        [newUser.id]: {
          _id: newUser.id,
          type: type,
          name: newUser.name || newUser.type,
          avatar: newUser.avatarUrl ? 'https://' + newUser.avatarUrl : null,
        },
      }),
    });
  };

  closeChat = () => {
    this.chat.lightSpeedOut(500).then(() => {
      this.props.closeChat();
    });
  };

  renderFooter = () => {
    if (this.state.typingText) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            {this.state.typingText}
          </Text>
        </View>
      );
    }
    return null;
  };

  render() {
    if (this.props.isChatOn) {
      return (
        <View
          animation="lightSpeedIn"
          style={styles.container}
          ref={(ref) => { this.chat = ref; }}
        >
          <NavigationBar chatTitle={this.props.chatTitle} closeChat={this.closeChat} />
          <Text style={styles.status}>
            { this.state.onlineStatus ? this.props.greeting : this.props.noAgents }
          </Text>
          <GiftedChat
            messages={this.state.messages}
            renderFooter={this.renderFooter}
            onSend={this.handleSend}
            onInputTextChanged={this.handleInputTextChange}
            user={this.getVisitor()}
            {...this.props}
          />
        </View>
      );
    }
    return null;
  }
}

Chat.propTypes = {
  license: PropTypes.string.isRequired,
  chatTitle: PropTypes.string.isRequired,
  closeChat: PropTypes.func.isRequired,
  isChatOn: PropTypes.bool.isRequired,
  greeting: PropTypes.string.isRequired,
  noAgents: PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
  hide: {
    width: 0,
    height: 0,
    position: 'absolute',
  },
  container: {
    width,
    height: Platform.OS === 'ios' ? height : height - height / 25,
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
});
