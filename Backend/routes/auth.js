const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');

const authController = require("../controllers/auth");

const router = express.Router();

// /auth/signup
router.put('/signup',[
    body('email').isEmail()
    .withMessage('Please enter a valid email')
    .custom((value, {req}) => {
        return User.findOne({email: value})
        .then(userDoc => {
            if(userDoc){
                return Promise.reject('E-Mail address already exists!');
            }
        });
    })
    .normalizeEmail(),
    body('password', 'Please enter a password with at least 5 characters')
    .isLength({min: 5})
    .trim(),
    body('name')
    .not()
    .isEmpty()
    .trim()
], authController.signup);

//  /auth/login
router.post('/login', authController.postLogin);

module.exports = router;