const mongoose = require('mongoose');
const messageSchema = require('./message.schema.js');
const addPrefixedIdPlugin = require("../db.helper.js");

const groupSchema = new mongoose.Schema({
    groupId: { type: String, required: true },
    createdBy: { type: String, required: true },
    admins: [{ type: String }],
    members: [{ 
        userId: { type: String, required: true },
        userName: { type: String, required: true }
    }],
    messages: { type: [messageSchema], default: [] }
}, {
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
    timestamps: true
});

groupSchema.plugin(addPrefixedIdPlugin, { prefix: 'Group', field: 'groupId' });

const groupModel = mongoose.model('Group', groupSchema);

module.exports = groupModel;