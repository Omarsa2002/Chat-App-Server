const groupModel = require('../../../db/models/group.schema.js');

module.exports = (client, thisClient, findRecipientSocket, io) => {
    client.on('createGroup', async (data) => {
        try {
            const { groupName, members } = data;
            const newGroup = new groupModel({
                createdBy: thisClient.userId,
                admins: [thisClient.userId],
                members: members.map(member => ({ userId: member.userId, userName: member.userName }))
            });
            await newGroup.save();
            client.join(newGroup.groupId);
            members.forEach(member => {
                const recipient = findRecipientSocket(member.userId);
                if (recipient) {
                    recipient.join(newGroup.groupId);
                    recipient.emit('groupCreated', {
                        groupId: newGroup.groupId,
                        groupName: newGroup.groupName,
                        createdBy: thisClient.userName
                    });
                }
            });
            client.emit('groupCreated', {
                groupId: newGroup.groupId,
                groupName: newGroup.groupName,
                createdBy: thisClient.userName
            });
        } catch (error) {
            console.error('Error creating group:', error);
        }
    });
    client.on('sendGroupMessage', async (data) => {
        try {
            const { groupId, message } = data;
            const group = await groupModel.findOne({ groupId });
            if (!group) {
                console.error('Group not found:', groupId);
                return;
            }
            group.messages.push({
                senderId: thisClient.userId,
                content: message.content,
                sentAt: new Date()
            });
            await group.save();
            io.to(groupId).emit('newGroupMessage', {
                groupId: group.groupId,
                message: {
                    senderId: thisClient.userId,
                    content: message.content,
                    sentAt: new Date()
                }
            });
        } catch (error) {
            console.error('Error sending group message:', error);
        }
    });
};