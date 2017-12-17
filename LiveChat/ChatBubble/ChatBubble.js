import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { View } from 'react-native-animatable';
import MovableView from 'react-native-movable-view';

export default class ChatBubble extends Component {
  render() {
    return (
      <MovableView
        disabled={!this.props.disabled}
        ref={(ref) => { this.move = ref; }}
        style={styles.move}
      >
        <View animation="fadeIn" style={{ left: this.props.left, top: this.props.top }}>
          <TouchableOpacity onPress={this.props.openChat} activeOpacity={0.75}>
            {this.props.bubble}
          </TouchableOpacity>
        </View>
      </MovableView>
    );
  }
}

const styles = StyleSheet.create({
  move: {
    position: 'absolute',
  },
});

ChatBubble.propTypes = {
  bubble: PropTypes.element.isRequired,
  disabled: PropTypes.bool.isRequired,
  openChat: PropTypes.func.isRequired,
  left: PropTypes.number.isRequired,
  top: PropTypes.number.isRequired,
};
