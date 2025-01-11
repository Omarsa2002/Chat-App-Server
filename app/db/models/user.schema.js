const { default: mongoose } = require("mongoose");
const { AddressSchema, ImageSchema } = require("../../utils/utils.schema.js");
const bcrypt = require('bcrypt');
const CONFIG = require("../../../config/config.js");
const addPrefixedIdPlugin = require("../db.helper.js");

const userSchema=new mongoose.Schema({
    userId:{
        type:String,
        required:true,
        unique:true
    },
    userName:String,
    encryptedPassword:String,
    phone: String,
    email:{
        type:String,
        required:true,
        unique:true
    },
    activateEmail: {
        type: Boolean,
        default: false,
    },
    verificationCode:String,
    verificationCodeDate:Date,
    recoveryCode: String,
    recoveryCodeDate: Date,
    role:{
        type:String,
        enum: ['user', 'admin'],
        default:"user"
    },
    accountType:{
        type: String,
        enum : ['system'],
        default: 'system',
    },
    isOnline:{
        type:Boolean,
        default: false
    },
    friends:[{
        userId:{ type: String, ref: 'User' },
        addedAt: { type: Date, default: Date.now },
    }],
    friendsRequests:[{
        requestId:{ type: String, ref: 'FriendRequest' },
    }],
    groubs:[String]
},{
    timestamps: true
})

userSchema.index({ 'friends.userId': 1 });
userSchema.index({ 'friendsRequests.userId': 1 });

userSchema.plugin(addPrefixedIdPlugin, { prefix: 'User', field: 'userId' }); 

//this function to add virtual field to schema 
userSchema.virtual('password')
    .set(function(password) {
    this._password = password; 
})
.get(function() {
    return this._password;
});

userSchema.pre('save', async function (next) {
    if (this.password) {         
        try {
            this.encryptedPassword = await bcrypt.hash(this.password, parseInt(CONFIG.BCRYPT_SALT));
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Password comparison method
userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.encryptedPassword);
};

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;