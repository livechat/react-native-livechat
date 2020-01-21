const parseRichMessage = (event, user) => {
    const elements = event.elements[0]
    return {
      _id: String(event.id),
      user,
      createdAt: event.createdAt,
      thread: event.thread,
      text: `${elements.title ? elements.title : ''}${elements.subtitle ? '\n' + elements.subtitle : ''}`,
      system: event.type === 'system_message',
      sent: true,
      pending: false,
      ...(elements.image && { image: elements.image.url }),
      ...(event.template === 'quick_replies' && {
        quickReplies: {
          type: 'radio',
          keepIt: false,
          values: elements.buttons.map(_quickReply => ({
            title: _quickReply.text,
            value: _quickReply.value,
            postback: _quickReply.postback,
          }))
        }
      })
    }
  }

export const parseEvent = (event, user) => {
    if (event.type === 'rich_message') {
      return parseRichMessage(event, user)
    }
    if (event.type !== 'message' && event.type !== 'system_message' && event.type !== 'file') {
      return null
    }
    return {
      _id: String(event.id),
      user,
      createdAt: event.createdAt,
      thread: event.thread,
      text: event.text,
      system: event.type === 'system_message',
      sent: true,
      pending: false,
      ...(event.type === 'file' && event.thumbnails && { image: event.thumbnails.default.url }),
    }
  }

export const parseUserData = userData => ({
  _id: userData.id,
  type: userData.type,
  name: userData.name,
  avatar: userData.avatar,
})
