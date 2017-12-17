import React, { Component } from 'react';
import { View, Dimensions, StyleSheet, Image, Platform } from 'react-native';
import PropTypes from 'prop-types';
import ChatBubble from './ChatBubble/ChatBubble';
import Chat from './Chat/Chat';

const chatIcon = require('../assets/chat.png');

const { height, width } = Dimensions.get('window');

export default class LiveChat extends Component {
  constructor(props) {
    super(props);
    this.defineStyles();
    this.state = {
      isChatOn: false,
      bubble: props.bubble ? props.bubble : (
        <View style={this.styles.bubbleStyle}>
          <Image source={chatIcon} style={this.styles.icon} />
        </View>
      ),
    };
    if (!GLOBAL.visitorSDK) {
      GLOBAL.visitorSDK = init({
        license: props.license,
      });
    }
    props.onLoaded(GLOBAL.visitorSDK);
  }

  defineStyles() {
    this.styles = StyleSheet.create({
      bubbleStyle: {
        width: width / 5,
        height: width / 5,
        backgroundColor: this.props.bubbleColor,
        borderRadius: width / 10,
        alignItems: 'center',
        justifyContent: 'center',
      },
      icon: {
        width: width / 7, height: width / 7,
      },
      container: {
        position: 'absolute',
      },
    });
  }

  openChat = () => {
    this.setState({ isChatOn: true });
  };

  closeChat = () => {
    this.setState({ isChatOn: false });
  };

  render() {
    return (
      <View style={this.styles.container}>
        <ChatBubble
          left={this.props.bubbleLeft}
          top={this.props.bubbleTop}
          openChat={this.openChat}
          bubble={this.state.bubble}
          disabled={this.props.movable}
        />
        <Chat {...this.props} isChatOn={this.state.isChatOn} closeChat={this.closeChat} />
      </View>
    );
  }
}

LiveChat.propTypes = {
  license: PropTypes.number.isRequired,
  movable: PropTypes.bool,
  bubble: PropTypes.element,
  bubbleColor: PropTypes.string,
  bubbleLeft: PropTypes.number,
  bubbleTop: PropTypes.number,
  chatTitle: PropTypes.string,
  greeting: PropTypes.string,
  noAgents: PropTypes.string,
  onLoaded: PropTypes.func,
};

LiveChat.defaultProps = {
  bubbleColor: '#2196F3',
  movable: true,
  onLoaded: () => {},
  bubbleLeft: width - (width / 5) - (width / 50),
  bubbleTop: Platform.OS === 'ios' ? height - (width / 5) - (width / 50) : height - (width / 5) - (width / 20),
  chatTitle: 'Chat with us!',
  greeting: 'Welcome to our LiveChat!\nHow may We help you?',
  noAgents: 'Our agents are not available right now.',
};
