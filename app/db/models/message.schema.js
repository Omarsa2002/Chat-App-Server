const mongoose = require('mongoose');
const addPrefixedIdPlugin = require("../db.helper.js");
// Define the Message Schema
const messageSchema = new mongoose.Schema({
    messageId: {
        type: String,
        required: true
    },
    senderId: {
        type: String,
    },
    content: {
        type: String,
        required: true
    },
},{
    timestamps:true
});

messageSchema.plugin(addPrefixedIdPlugin, { prefix: 'Message', field: 'messageId' }); 

// const messageModel= mongoose.model('Message', messageSchema);

module.exports = messageSchema;
