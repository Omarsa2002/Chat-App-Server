const userModel = require("../db/models/user.schema.js");
const { sendResponse, randomNumber, currentDate, validateExpiry, paginationWrapper} = require("../utils/util.service.js");
const constants=require("../utils/constants.js")
const CONFIG = require('../../config/config.js');


const users = async (req, res, next)=>{
    try{
        const {skip, size} = req.query
        const { limit, offset } = paginationWrapper(skip, size);
        const users = await userModel.find({activateEmail:true}).select('-_id userId userName isOnline').skip(offset).limit(limit);
        sendResponse(res, constants.RESPONSE_SUCCESS, "done", users, []);
    }catch(error){
        sendResponse(res,constants.RESPONSE_INT_SERVER_ERROR,error.message,{},constants.UNHANDLED_ERROR);
    }
}


const userData = async (req, res, next)=>{
    try{
        const {userId} = req.user
        const user = await userModel.findOne({userId}).select('-_id userId userName phone email isOnline friends groubs friendsRequests');
        sendResponse(res, constants.RESPONSE_SUCCESS, "done", user, []);
    }catch(error){
        sendResponse(res,constants.RESPONSE_INT_SERVER_ERROR,error.message,{},constants.UNHANDLED_ERROR);
    }
}


module.exports = {
    userData,
    users
}



