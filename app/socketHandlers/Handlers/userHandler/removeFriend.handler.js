
module.exports = (client, thisClient, findRecipientSocket) => {
    client.on('removeFriend', async (data)=>{
        const recipient = findRecipientSocket(data.friendId)
        recipient.emit('removeThisFriend', {
            userId: thisClient.userId
        })
    })
};