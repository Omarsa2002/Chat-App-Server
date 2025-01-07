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
            return sendResponse(res, constants.RESPONSE_SUCCESS, "you are friens already", {}, []);
        }
        if(isHaveRequest){
            return sendResponse(res, constants.RESPONSE_SUCCESS, "you are already sent a friend request to this person", {}, []);
        }
        requestedFriend.friendsRequests.push({ userId, requestedAt: currentDate() })
        await requestedFriend.save()
        sendResponse(res, constants.RESPONSE_SUCCESS, "done", {}, []);
    }catch(error){
        sendResponse(res,constants.RESPONSE_INT_SERVER_ERROR,error.message,{},constants.UNHANDLED_ERROR);
    }
}

const acceptFriendRequest = async (req, res, next)=>{
    try{
        const {friendId} = req.body
        const {userId} = req.user
        const user = await userModel.findOne({userId});
        const friend = await userModel.findOne({userId:friendId})
        const requestIndex = user.friendsRequests.findIndex(
            (request) => request.userId === friendId
        );
        if (requestIndex !== -1) {
            // Add to friends
            user.friends.push({ userId: friendId, addedAt: currentDate() });
            friend.friends.push({userId, addedAt: currentDate()});
            // Remove from friend requests
            user.friendsRequests.splice(requestIndex, 1);
            await user.save();
            await friend.save();
            return sendResponse(res, constants.RESPONSE_SUCCESS, "done", {}, {});
        }
        sendResponse(res, constants.RESPONSE_SUCCESS, "you dont have any friends requests", {}, {});
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
        if (result.modifiedCount === 0) {
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
        if (result.modifiedCount === 0) {
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



