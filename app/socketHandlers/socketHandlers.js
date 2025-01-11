const addFriendHandler = require('./Handlers/userHandler/addFriend.handler')
const acceptFriendHandler = require('./Handlers/userHandler/acceptFriend.handler')
const refuseFriendHandler = require('./Handlers/userHandler/refuseFriend.handler')
const cancelFriendHandler = require('./Handlers/userHandler/cancelFriend.handler')
const removeFriendHandler = require('./Handlers/userHandler/removeFriend.handler')
const userModel = require('../db/models/user.schema')
module.exports = (io) => {
    const userSockets = {}
    function findRecipientSocket(userId) {
        return userSockets[userId] || null;
    }
    io.on('connection',async (client) => {
        client.handshake.auth.user.isOnline = true
        const thisClient = client.handshake.auth.user;
        console.log('Client connected:', thisClient);
        userSockets[thisClient.userId] = client;
        try {
            await userModel.findOneAndUpdate(
                { userId: thisClient.userId },
                { $set: { isOnline: true } }
            );
            io.emit('onlineUser', { userId: thisClient.userId });
            // ----------------------------------------------------
            addFriendHandler(client, thisClient, findRecipientSocket);
            acceptFriendHandler(client, thisClient, findRecipientSocket);
            refuseFriendHandler(client, thisClient, findRecipientSocket);
            cancelFriendHandler(client, thisClient, findRecipientSocket);
            removeFriendHandler(client, thisClient, findRecipientSocket);
            // ----------------------------------------------------
            client.on('disconnect', async (reason) => {
                try {
                    delete userSockets[thisClient.userId]
                    await userModel.findOneAndUpdate(
                        { userId: thisClient.userId },
                        { $set: { isOnline: false } }
                    );
                    io.emit('offlineUser', { userId: thisClient.userId });
                    console.log('Client disconnected:', thisClient.userId, 'Reason:', reason);
                } catch (err) {
                    console.error('Error updating user status on disconnect:', err);
                }
            });
            client.on('error', (err) => {
                console.error('Socket error:', err);
            });
        } catch (err) {
            console.error('Error updating user status on connection:', err);
        }
    });
};