const express 			= require('express');
const router 			= express.Router();
const adminRoute =require("./admin.controller.js")
const {validation} = require('../middleware/validation.js')
const validators = require('./auth.validation.js')
const {myMullter, HME} = require('../utils/multer')
const { roles, roleMiddleware } = require('../middleware/authrization.js');
const passport = require('passport');
const { passportAuth } = require("../utils/passport.js");
passportAuth(passport);
const authGuard = passport.authenticate("appAuth", { session: false });

router.get('/newregisteredcompanies', authGuard, roleMiddleware(roles.Admin), adminRoute.newRegisteredCompanies)

module.exports = router;