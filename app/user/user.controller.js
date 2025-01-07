const userModel = require("../db/models/user.schema.js");
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
        const isHaveRequest = requestedFriend.friendsRequests.find(request=> request.userId === userId)
        if(isFriends){
            return sendResponse(res, constants.RESPONSE_CONFLICT, "you are friens already", {}, []);
        }
        if(isHaveRequest){
            return sendResponse(res, constants.RESPONSE_CONFLICT, "you are already sent a friend request to this person", {}, []);
        }
        requestedFriend.friendsRequests.push({ userId, requestedAt: currentDate() })
        user.requestedFriends.push({userId:requestId, requestedAt: currentDate()})
        await requestedFriend.save()
        await user.save()
        sendResponse(res, constants.RESPONSE_SUCCESS, "done", {}, []);
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
        // Check if there is a friend request
        const hasFriendRequest = user.friendsRequests.some(request => request.userId === friendId);
        if (!hasFriendRequest) {
            return sendResponse(res,constants.RESPONSE_NOT_FOUND,"No friend request found from this user",{},{});
        }
        const pullRequestResult = await userModel.updateOne(
            { userId },
            { $pull: { friendsRequests: { userId: friendId } } }
        );
        const pushFriendResult = await userModel.updateOne(
            { userId },
            { $push: { friends: { userId: friendId } } }
        );
        const pullRequestedResult = await userModel.updateOne(
            { userId: friendId },
            { $pull: { requestedFriends: { userId } } }
        );
        const pushCurrentUserResult = await userModel.updateOne(
            { userId: friendId },
            { $push: { friends: { userId } } }
        );
        if (
            pullRequestResult.modifiedCount &&
            pushFriendResult.modifiedCount &&
            pullRequestedResult.modifiedCount &&
            pushCurrentUserResult.modifiedCount
        ) {
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
        const result = await userModel.updateOne(
            { userId: requestId },
            { $pull: { friendsRequests: { userId: userId } } }
        );
        const result2 = await userModel.updateOne(
            { userId },
            { $pull: { requestedFriends: { userId: requestId } } }
        );
        if (result.modifiedCount === 0 && result2.modifiedCount === 0) {
            return sendResponse(res, constants.RESPONSE_NOT_FOUND, "Request not found", {},[]);
        }
        sendResponse(res, constants.RESPONSE_SUCCESS, "Friend request canceled successfully", {}, []);
    }catch(error){
        sendResponse(res,constants.RESPONSE_INT_SERVER_ERROR,error.message,{},constants.UNHANDLED_ERROR);
    }
}
const refuseFriendRequest = async (req, res, next)=>{
    try{
        const { requestId } = req.body;
        const { userId } = req.user;
        const result = await userModel.updateOne(
            { userId },
            { $pull: { friendsRequests: { userId: requestId } } }
        );
        const result2 = await userModel.updateOne(
            { userId: requestId },
            { $pull: { requestedFriends: { userId } } }
        );
        if (result.modifiedCount === 0 && result2.modifiedCount === 0) {
            return sendResponse(res, constants.RESPONSE_NOT_FOUND, "Request not found", {},[]);
        }
        sendResponse(res, constants.RESPONSE_SUCCESS, "Friend request canceled successfully", {}, []);
    }catch(error){
        sendResponse(res,constants.RESPONSE_INT_SERVER_ERROR,error.message,{},constants.UNHANDLED_ERROR);
    }
}
const removeFriend = async (req, res, next)=>{
    try{
        const { friendId } = req.body;
        const { userId } = req.user;
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



