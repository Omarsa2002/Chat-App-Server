
module.exports = (client, thisClient, findRecipientSocket) => {
    client.on('cancelFriendRequest', async (data)=>{
        const recipient = findRecipientSocket(data.recipientId)
        recipient.emit('cancelFriend', {
            userId: thisClient.userId
        })
    })
};