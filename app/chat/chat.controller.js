
const chatModel = require('../db/models/chat.schema.js')
const { sendResponse, randomNumber, currentDate, validateExpiry, paginationWrapper} = require("../utils/util.service.js");
const constants=require("../utils/constants.js")
const CONFIG = require('../../config/config.js');

const getChatMessages = async (req, res, next)=>{
    try{
        const {chatId} = req.params
        const messages = await chatModel.findOne({chatId})
        if(messages){
            sendResponse(res, constants.RESPONSE_SUCCESS, "done", messages, []);
        }else{
            sendResponse(res, constants.RESPONSE_NOT_FOUND, "not found", {}, []);
        }
    }catch(error){
        sendResponse(res,constants.RESPONSE_INT_SERVER_ERROR,error.message,{},constants.UNHANDLED_ERROR);
    }
}


module.exports = {
    getChatMessages
}