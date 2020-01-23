const parseRichMessage = (event, user) => {
    const [ element ] = event.elements
    return {
      _id: String(event.id),
      user,
      createdAt: event.createdAt,
      thread: event.thread,
      text: `${element.title ? element.title : ''}${element.subtitle ? '\n' + element.subtitle : ''}`,
      system: event.type === 'system_message',
      sent: true,
      pending: false,
      ...(element.image && { image: element.image.url }),
      ...(event.template === 'quick_replies' && {
        quickReplies: {
          type: 'radio',
          keepIt: false,
          values: element.buttons.map(quickReply => ({
            title: quickReply.text,
            value: quickReply.value,
            postback: quickReply.postback,
          }))
        }
      })
    }
  }

export const parseEvent = (event, user) => {
    if (event.type === 'rich_message') {
      return parseRichMessage(event, user)
    }
    if (!['message', 'system_message', 'file'].includes(event.type)) {
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
