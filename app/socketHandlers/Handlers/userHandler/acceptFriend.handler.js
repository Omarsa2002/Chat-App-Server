
module.exports = (client, thisClient, findRecipientSocket) => {
    client.on('acceptFriendRequest', async (data)=>{
        const recipient = findRecipientSocket(data.friendId)
        recipient.emit('newFriend', {
            message: `${thisClient.userName} just accepted your friend request`,
            userId: thisClient.userId
        })
    })
};