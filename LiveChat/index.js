import React, { Component } from 'react';
import { View, Dimensions, StyleSheet, Image } from 'react-native';
import PropTypes from 'prop-types';
import ChatBubble from './components/ChatBubble';
import Chat from './components/Chat';
GLOBAL.cookie = '';
import { init } from "./sdk/livechat-visitor-sdk.min";
// import { AuthWebView } from "@livechat/customer-auth";
// import { init as CustomerSdkInit } from "@livechat/customer-sdk";

const chatIcon = require('./../assets/chat.png');
const { width } = Dimensions.get('window');

// const initCustomerSdk = (license, clientId, redirectUri) => {
//   const customerSDK = CustomerSdkInit({
//     license,
//     clientId,
//     redirectUri,
//   });
//   customerSDK.on("new_event", newEvent => {
//     console.want('> event', newEvent);
//   });
// }

export default class LiveChat extends Component {
  constructor(props) {
    super(props);
    GLOBAL.cookie = '';
    this.defineStyles();

    this.state = {
      isChatOn: false,
      bubble: props.bubble ? props.bubble : (
        <View style={this.styles.bubbleStyle}>
          <Image source={chatIcon} style={this.styles.icon} />
        </View>
      ),
    };

    GLOBAL.visitorSDK = init({
      license: props.license,
      group: props.group,
    });

    GLOBAL.visitorSDK.on('protocol_upgraded', () => {
      console.warn('>> protocol upgraded')
      // initCustomerSdk(props.license, props.clientId, props.redirectUri)
    })

    props.onLoaded(GLOBAL.visitorSDK);

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
        width: width / 10, height: width / 10,
      }
    });
  };

  openChat = () => {
    this.setState({ isChatOn: true });
  };

  closeChat = () => {
    this.setState({ isChatOn: false });
  };

  render() {
    const { isChatOn } = this.state;

    return [
      <ChatBubble
        key="bubble"
        openChat={this.openChat}
        bubble={this.state.bubble}
        disabled={this.props.movable}
        styles={this.props.bubbleStyles}
      />,
      <Chat
        key="chat"
        {...this.props}
        isChatOn={isChatOn}
        closeChat={this.closeChat}
      />,
      // <AuthWebView />
    ];
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
};

LiveChat.defaultProps = {
  bubbleColor: '#2962FF',
  bubbleStyles: {
    position: "absolute",
    bottom: 12,
    right: 12,
  },
  movable: true,
  onLoaded: () => {
  },
  group: 0,
  chatTitle: 'Chat with us!',
  greeting: 'Welcome to our LiveChat!\nHow may We help you?',
  noAgents: 'Our agents are not available right now.',
};
