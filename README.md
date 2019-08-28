# LiveChat for React Native

This is a React Native component to easily add [LiveChat widget](https://www.livechatinc.com/) to your application.

It works for both iOS and Android.

![LiveChat for React Native demo](https://raw.githubusercontent.com/venits/react-native-router-flux/master/livechatdemo.gif)

## Getting Started

### Prerequisites

To use LiveChat in your React application, you will need LiveChat license ID. 

If you already have a LiveChat account, get your **license_id** [here](https://my.livechatinc.com/settings/code).

![LiveChat license ID](https://github.com/livechat/react-livechat/blob/master/license.png)

If you don't have an account, you can create one [here](https://www.livechatinc.com/).

### Installation

To import LiveChat for React Native, run the following command:

```javascript
npm install react-native-livechat --save
```

## User Guide

### Start

Having imported LiveChat for React Native, put it in your render method:

```javascript
import LiveChat from 'react-native-livechat'

...

<LiveChat license="your_license_id" />
```

You can also pass 'group' as a prop, to assign chat to chosen LiveChat group.
```javascript
<LiveChat group={2} license="your_license_id" />
```


### Customization

#### Chat bubble

Chat bubble is the round icon (chat trigger) in the bottom right corner of the screen.

##### Position

You can control the position of the bubble with `bubbleStyles` prop:

```javascript
const styles = StyleSheet.create({
  bubbleStyles: {
    position: "absolute",
    left: 24,
    bottom: 24
  }
});

<LiveChat license="your_license_id" bubbleStyles={styles.bubbleStyles} />
```

##### Draggability

By default, the bubble component is draggable and movable. You can disable this option by sending `movable` prop with `false` value:

*Example:*
```javascript
<LiveChat movable={false} license="your_license_id" />
```

##### Color

You can change the color of the bubble by passing `bubbleColor` prop:

```javascript
<LiveChat bubbleColor='red' license="your_license_id" />
```
##### Custom bubble

If you don't like the default bubble, you can send `bubble` prop with your own component:

```javascript
<LiveChat license="your_license_id"
  bubble={
  <View style={{ width: 60, height: 60, backgroundColor: 'green' }} />
  }
/>
```

#### Chat window

This module uses [react-native-gifted-chat](https://github.com/FaridSafi/react-native-gifted-chat) for chat UI.

You can customise your chat widget by sending props to LiveChat component (like you would normally do with GiftedChat component).

For example, if you want `onPressAvatar` to show agent's details, you can do it like this:

```javascript
<LiveChat license="your_license_id"
  onPressAvatar={ info => console.warn(info) } />
```

You can find all props in the official [react-native-gifted-chat documentation](https://github.com/FaridSafi/react-native-gifted-chat).


### Methods

This module uses [LiveChat Customer SDK](https://docs.livechatinc.com/visitor-sdk/). All methods are described [here](https://docs.livechatinc.com/visitor-sdk/#methods).

To use LiveChat Visitor SDK method, you have to create LiveChat reference:

```javascript
<LiveChat onLoaded={ ref => this.livechat = ref } 
	license="your_license_id"/>
```

Let's say you want to close the current chat. You can do it in two ways:
```javascript
 this.livechat.closeChat();
 // is the same as:
 GLOBAL.visitorSDK.closeChat();
```

#### Available methods

|Name|Note|
|---|---|
| closeChat | Closes the chat. |
| sendMessage | Sends a message. More information about message format you can find [here](https://docs.livechatinc.com/visitor-sdk/#sendmessage). |
| rateChat | Enables chat ratings. More info [here](https://docs.livechatinc.com/visitor-sdk/#ratechat).  |
|setSneakPeek | Enables sneak peeks to see what the visitor is typing in before they actually send the message. More info [here](https://docs.livechatinc.com/visitor-sdk/#setsneakpeek). |
| getVisitorData | Collects the visitor information. More info [here](https://docs.livechatinc.com/visitor-sdk/#getvisitordata). |
|setVisitorData | Set the visitor information. More info [here](https://docs.livechatinc.com/visitor-sdk/#setvisitordata).|
|getTicketForm | Get ticket form fields configured in chat window settings section in agent app. |
| sendTicketForm | Send ticket form filled in by visitor. Ticket form should be rendered using fields fetched by getTicketForm method. More info [here](https://docs.livechatinc.com/visitor-sdk/#sendticketform).|
| disconnect | Disconnect Visitor SDK. A visitor won't be tracked, and you won't be notified about agent's availability status. You will be automatically connected again after using sendMessage or setVisitorData methods. |
| destroy | Disconnect Visitor SDK and unsubscribe from all callbacks. |


## Support
If you need any help, you can chat with us [here](https://www.chat.io/live-chat-guide/).

I hope you will find this module useful. Happy coding!
