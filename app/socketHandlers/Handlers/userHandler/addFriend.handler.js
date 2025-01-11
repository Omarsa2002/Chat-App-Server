const friendRequestModel = require('../../../db/models/friendRequest.schema')
module.exports = (client, thisClient, findRecipientSocket) => {
    client.on('AddFrind', async (data)=>{
        //console.log(data);
        const friendRequest = await friendRequestModel.findOne(data);
        if(friendRequest){
            const recipient = findRecipientSocket(friendRequest.to)
            recipient.emit("friendRequestNote",{
                message: `you have a new friend request from ${thisClient.userName}`,
                userId: thisClient.userId
            } )
        }
    })
};