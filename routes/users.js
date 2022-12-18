// PACKAGES, MIDDLEWARE, MODELS, UTILS, CONTROLLERS
const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const {checkReturnTo} = require('../middleware');
const User = require('../models/user');
const users = require('../controllers/users');

// Register a new user routes
router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

// Login with an existing user routes
router.route('/login')
    .get(users.renderLogin)
    .post(checkReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

// Logout route
router.get('/logout', users.logout);

// EXPORTS
module.exports = router;