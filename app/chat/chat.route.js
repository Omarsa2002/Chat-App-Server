const express 			= require('express');
const router 			= express.Router();
const chatRoute =require("./chat.controller.js")
const {validation} = require('../middleware/validation.js')
//const validators = require('./user.validation.js')
const {myMullter, HME} = require('../utils/multer')
const passport = require('passport');
const { passportAuth } = require("../utils/passport.js");
passportAuth(passport);
const authGuard = passport.authenticate("appAuth", { session: false });


router.get('/chatmessages/:chatId', authGuard, chatRoute.getChatMessages);



module.exports = router