const mongoose = require('mongoose');
const messageSchema = require('./message.schema.js');
const addPrefixedIdPlugin = require("../db.helper.js");

const chatSchema = new mongoose.Schema({
    chatId: {type:String, require: true},
    //friendsId: { type: String, required: true },
    messages: { type: [messageSchema], default: [] },
},{
    toJSON: { virtuals: true,versionKey:false },
    toObject: { virtuals: true,versionKey:false },
    timestamps:true
});

chatSchema.plugin(addPrefixedIdPlugin, { prefix: 'Chat', field: 'chatId' }); 

const chatModel=mongoose.model('Chat',chatSchema);

module.exports=chatModel;