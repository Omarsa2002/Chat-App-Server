const express 			= require('express');
const router 			= express.Router();
const userRoute =require("./user.controller.js")
const {validation} = require('../middleware/validation.js')
const validators = require('./user.validation.js')
const {myMullter, HME} = require('../utils/multer')
const passport = require('passport');
const { passportAuth } = require("../utils/passport.js");
passportAuth(passport);
const authGuard = passport.authenticate("appAuth", { session: false });


router.get('/userdata', authGuard, userRoute.userData);
router.get('/users', authGuard, validation(validators.users), userRoute.users);
router.patch('/sendfriendrequest', authGuard, userRoute.sendFriendRequest)
router.patch('/acceptfriendrequest', authGuard, userRoute.acceptFriendRequest)
router.patch('/cancelfriendrequest', authGuard, userRoute.cancelFriendRequest)
router.patch('/refusefriendrequest', authGuard, userRoute.refuseFriendRequest)
router.patch('/removefriend', authGuard, userRoute.removeFriend)


module.exports = router