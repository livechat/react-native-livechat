export const parseNewAgent = (newAgent) => ({
	_id: newAgent.id,
	type: newAgent.type,
	name: newAgent.name,
	avatar: newAgent.avatar,
})

export const parseNewMessage = (user, newMessage) => ({
	text: newMessage.text,
	_id: newMessage.id,
	createdAt: newMessage.timestamp,
	user,
})

export const parseVisitorData = (visitorData) => ({
	_id: visitorData.id,
	type: 'customer',
	name: 'Customer',
})
