const joi = require("joi");
const { param } = require("../auth/auth.route");
const { query } = require("express");
const { limit } = require("../utils/util.service");


const users = {
    query:joi.object().required().keys({
        skip: joi.number()
        .optional()
        .messages({'number.base': 'skip must be a number.',}),
        size: joi.number()
        .optional()
        .messages({'number.base': 'size must be a number.',}),
    })
}

module.exports = {
    users
}