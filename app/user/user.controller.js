const userModel = require("../db/models/user.schema.js");
const friendRequestModel = require('../db/models/friendRequest.schema.js');
const chatModel = require('../db/models/chat.schema.js')
const { sendResponse, randomNumber, currentDate, validateExpiry, paginationWrapper} = require("../utils/util.service.js");
const constants=require("../utils/constants.js")
const CONFIG = require('../../config/config.js');
const aggrrgateQuery = require('./user.aggregateQuery.js')


const users = async (req, res, next)=>{
    try{
        const {userId} = req.user
        const {skip, size} = req.query
        const { limit, offset } = paginationWrapper(skip, size);
        const users = await userModel.find({activateEmail:true, userId:{ $ne: userId }}).select('-_id userId userName isOnline').skip(offset).limit(limit);
        sendResponse(res, constants.RESPONSE_SUCCESS, "done", users, []);
    }catch(error){
        sendResponse(res,constants.RESPONSE_INT_SERVER_ERROR,error.message,{},constants.UNHANDLED_ERROR);
    }
}

const userData = async (req, res, next)=>{
    try{
        const {userId} = req.user
        const user = await userModel.aggregate(aggrrgateQuery.userDetailsQuery(userId));
        sendResponse(res, constants.RESPONSE_SUCCESS, "done", user, []);
    }catch(error){
        sendResponse(res,constants.RESPONSE_INT_SERVER_ERROR,error.message,{},constants.UNHANDLED_ERROR);
    }
}

const sendFriendRequest = async (req, res, next)=>{
    try{
        const {userId} = req.user
        const {requestId} = req.body
        const user = await userModel.findOne({userId});
        const requestedFriend = await userModel.findOne({userId:requestId});
        const isFriends = user.friends.find((friend)=> friend.userId===requestId)
        if(isFriends){
            return sendResponse(res, constants.RESPONSE_CONFLICT, "you are friens already", {}, []);
        }
        const isHaveRequest = await friendRequestModel.findOne({$or:[{from: userId, to:requestId},{from:requestId, to: userId}]});
        if(isHaveRequest){
            return sendResponse(res, constants.RESPONSE_CONFLICT, "you are already (sent/have) a friend request (to/from) this person", {}, []);
        }
        const newFriendRequest = new friendRequestModel({
            from: userId,
            to: requestId,
            createdAt: currentDate()
        })
        await newFriendRequest.save();
        requestedFriend.friendsRequests.push({ requestId:newFriendRequest.requestId })
        user.friendsRequests.push({ requestId:newFriendRequest.requestId })
        await requestedFriend.save()
        await user.save()
        sendResponse(res, constants.RESPONSE_SUCCESS, "done", newFriendRequest.requestId, []);
    }catch(error){
        sendResponse(res,constants.RESPONSE_INT_SERVER_ERROR,error.message,{},constants.UNHANDLED_ERROR);
    }
}

const acceptFriendRequest = async (req, res, next)=>{
    try{
        const {friendId} = req.body
        const {userId} = req.user
        const user = await userModel.findOne({ userId });
        // Check if they are already friends
        const isAlreadyFriends = user.friends.some(friend => friend.userId === friendId);
        if (isAlreadyFriends) {
            return sendResponse(res,constants.RESPONSE_CONFLICT,"You are already friends with this user",{},{});
        }
        const friendRequest = await friendRequestModel.findOne({from: friendId, to: userId})
        // Check if there is a friend request
        if (!friendRequest) {
            return sendResponse(res,constants.RESPONSE_NOT_FOUND,"No friend request found from this user",{},{});
        }
        const newChat = new chatModel() 
        await newChat.save();
        console.log(newChat);
        const pullRequestResult = await userModel.updateOne(
            { userId },
            { $pull: { friendsRequests: { requestId: friendRequest.requestId } } }
        );
        const pushFriendResult = await userModel.updateOne(
            { userId },
            { $push: { friends: { userId: friendId, chatId: newChat.chatId } } }
        );
        const pullRequestedResult = await userModel.updateOne(
            { userId: friendId },
            { $pull: { friendsRequests: { requestId: friendRequest.requestId } } }
        );
        const pushCurrentUserResult = await userModel.updateOne(
            { userId: friendId },
            { $push: { friends: { userId, chatId: newChat.chatId } } }
        );
        if (
            pullRequestResult.modifiedCount &&
            pushFriendResult.modifiedCount &&
            pullRequestedResult.modifiedCount &&
            pushCurrentUserResult.modifiedCount
        ) {
            await friendRequestModel.deleteOne({requestId: friendRequest.requestId});
            return sendResponse(res, constants.RESPONSE_SUCCESS, "done", {}, {});
        }
        sendResponse(res, constants.RESPONSE_CONFLICT, "Failed to accept friend request", {}, {});
    }catch(error){
        sendResponse(res,constants.RESPONSE_INT_SERVER_ERROR,error.message,{},constants.UNHANDLED_ERROR);
    }
}

const cancelFriendRequest = async (req, res, next)=>{
    try{
        const { userId } = req.user;
        const { requestId } = req.body;
        const friendRequest = await friendRequestModel.findOne({from: userId, to: requestId})
        if(!friendRequest){
            return sendResponse(res,constants.RESPONSE_NOT_FOUND,"No friend request found to this user",{},{});
        }
        const result = await userModel.updateOne(
            { userId: requestId },
            { $pull: { friendsRequests: { requestId:friendRequest.requestId } } }
        );
        const result2 = await userModel.updateOne(
            { userId },
            { $pull: { friendsRequests: { requestId:friendRequest.requestId } } }
        );
        if (result.modifiedCount === 0 && result2.modifiedCount === 0) {
            return sendResponse(res, constants.RESPONSE_NOT_FOUND, "Request not found", {},[]);
        }
        await friendRequestModel.deleteOne({requestId: friendRequest.requestId});
        sendResponse(res, constants.RESPONSE_SUCCESS, "Friend request canceled successfully", {}, []);
    }catch(error){
        sendResponse(res,constants.RESPONSE_INT_SERVER_ERROR,error.message,{},constants.UNHANDLED_ERROR);
    }
}
const refuseFriendRequest = async (req, res, next)=>{
    try{
        const { requestId } = req.body;
        const { userId } = req.user;
        const friendRequest = await friendRequestModel.findOne({from: requestId, to: userId})
        if(!friendRequest){
            return sendResponse(res,constants.RESPONSE_NOT_FOUND,"No friend request found from this user",{},{});
        }
        const result = await userModel.updateOne(
            { userId },
            { $pull: { friendsRequests: { requestId: friendRequest.requestId } } }
        );
        const result2 = await userModel.updateOne(
            { userId: requestId },
            { $pull: { friendsRequests: { requestId: friendRequest.requestId } } }
        );
        if (result.modifiedCount === 0 && result2.modifiedCount === 0) {
            return sendResponse(res, constants.RESPONSE_NOT_FOUND, "Request not found", {},[]);
        }
        await friendRequestModel.deleteOne({requestId: friendRequest.requestId});
        sendResponse(res, constants.RESPONSE_SUCCESS, "Friend request canceled successfully", {}, []);
    }catch(error){
        sendResponse(res,constants.RESPONSE_INT_SERVER_ERROR,error.message,{},constants.UNHANDLED_ERROR);
    }
}
const removeFriend = async (req, res, next)=>{
    try{
        const { friendId } = req.body;
        const { userId } = req.user;
        const user = await userModel.findOne({userId});
        const chat = user.friends.find((friend)=>friend.friendId === friendId)
        const result = await userModel.updateOne(
            {userId},
            { $pull: { friends: { userId: friendId } } }
        );
        const result2 = await userModel.updateOne(
            {userId:friendId},
            { $pull: { friends: { userId } } }
        )
        if (result.modifiedCount === 0 && result2.modifiedCount === 0) {
            return sendResponse(res, constants.RESPONSE_NOT_FOUND, "Friend relationship not found", {},[]);
        }
        if(chat)
        await chatModel.deleteOne({chatId: chat.chatId});
        sendResponse(res, constants.RESPONSE_SUCCESS, "Friend  removed successfully",{}, []);
    }catch(error){
        sendResponse(res,constants.RESPONSE_INT_SERVER_ERROR,error.message,{},constants.UNHANDLED_ERROR);
    }
}

module.exports = {
    userData,
    users,
    sendFriendRequest,
    acceptFriendRequest,
    cancelFriendRequest,
    refuseFriendRequest,
    removeFriend
}



