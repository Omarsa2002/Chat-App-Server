const chatModel = require('../../../db/models/chat.schema');

module.exports = (client, thisClient, findRecipientSocket) => {
    client.on('sendMessageToFriend', async (data) => {
        try {
            const { chatId, friendId, message } = data;
            if (!message || !message.content || !message.senderId || !message.sentAt) {
                console.error('Invalid message object:', message);
                return;
            }
            const chat = await chatModel.findOne({ chatId });
            if (!chat) {
                console.error('Chat not found for chatId:', chatId);
                return;
            }
            chat.messages.push(message);
            await chat.save();
            const friend = findRecipientSocket(friendId);
            if (friend) {
                console.log(friend.handshake.auth.user);
                friend.emit('newMessage', { note: `${thisClient.userName} sent you a message`, message });
            } else {
                console.error('Recipient not found or offline:', friendId);
            }
        } catch (err) {
            console.error('Error sending message:', err);
        }
    });
};