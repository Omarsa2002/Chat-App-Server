const userModel = require("../db/models/user.schema.js");
const { sendResponse, randomNumber, currentDate, validateExpiry,  paginationWrapper } = require("../utils/util.service.js");
const constants=require("../utils/constants.js")
const { v4: uuidv4 } = require("uuid");
const { sendConfirmEmail } = require("./helper.js");
const passport = require('passport');
const jwtGenerator = require("../utils/jwt.generator.js");
const tokenSchema = require('./token.schema');
const bcrypt = require ('bcrypt');
const CONFIG = require('../../config/config.js')
const { token } = require("morgan");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CONFIG.GOOGLE_CLIENT_ID);
const {setTokenWithCookies} = require('../utils/setCookies.js');
const companyModel = require("../db/models/company.schema.js");
const { imageKit } = require("../utils/imagekit.js");

const newRegisteredCompanies = async (req, res, next)=>{
    try {
        const {skip, size} = req.query
        const { limit, offset } = paginationWrapper(skip, size);
        const companies = await companyModel.find({activateAccount:false, activateEmail: true}).skip(offset).limit(limit)
        .select('')
    } catch (error) {
        
    }
}




module.exports = {
    newRegisteredCompanies
}