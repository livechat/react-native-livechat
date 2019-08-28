import React, { Component } from 'react';
import { TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { View } from 'react-native-animatable';

export default class ChatBubble extends Component {
  render() {
    return (
      <TouchableOpacity
        onPress={this.props.openChat}
        activeOpacity={0.75}
        style={this.props.styles}
      >
        <View animation="fadeIn">
          {this.props.bubble}
        </View>
      </TouchableOpacity>
    );
  }
}

ChatBubble.propTypes = {
  bubble: PropTypes.element.isRequired,
  disabled: PropTypes.bool.isRequired,
  openChat: PropTypes.func.isRequired,
};
