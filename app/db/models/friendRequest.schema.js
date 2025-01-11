const mongoose = require('mongoose');
const addPrefixedIdPlugin = require("../db.helper.js");

const friendRequestSchema = new mongoose.Schema({
    requestId: {type: String, require: true},
    from: { type: String, required: true, ref:"User" },
    to: { type: String, required: true, ref:"User"},
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }, // Request status
    createdAt: { type: Date, default: Date.now }, // Timestamp
});
friendRequestSchema.plugin(addPrefixedIdPlugin, { prefix: 'Request', field: 'requestId' }); 
const friendRequestModel = mongoose.model('FriendRequest', friendRequestSchema);

module.exports = friendRequestModel;