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
        defult: "system"
    },
    isOnline:Boolean,
    friends:[String],
    groubs:[String]
},{
    timestamps: true
})

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
        this.encryptedPassword =  bcrypt.hashSync(this.password, parseInt(CONFIG.BCRYPT_SALT));  
    }
    next();
});

// Password comparison method
userSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.encryptedPassword);
};

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;