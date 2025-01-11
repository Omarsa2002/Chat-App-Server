
module.exports = (client, thisClient, findRecipientSocket) => {
    client.on('refuseFriendRequest', async (data)=>{
        const recipient = findRecipientSocket(data.requesterId)
        recipient.emit('refuseFriend', {
            userId: thisClient.userId
        })
    })
};