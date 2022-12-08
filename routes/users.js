// This is a router for campgrounds

// ====================
// PACKAGES & MIDDLEWARE
// ====================

const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const {checkReturnTo} = require('../middleware');


// ====================
// MODELS
// ====================

const User = require('../models/user');

// ====================
// "REGISTER" ROUTES
// ====================

// CRUD: READ

// When on this path, render the register.ejs file, where the registration form will be

router.get('/register', (req, res) => {
    res.render('users/register');
});

// CRUD: CREATE

// This is the post route for user creation.

// Afer the form is submitted, destructure email, username and password from req.body

// Create a new user on the database, append the email and username to it

// Register the user using the user and password and save it as "registeredUser" (.register() is a function from "possport").

// Login the user (.login() is a "passport" function).

// If there is an error, go to next() middleware. If there are no errors, show success flash message and redirect to /campgrounds.

// If something is wrong, show error flash message and redirect to /register

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
//? 'register' or '/register' ? 
        res.redirect('/register');
    }
}));



// ====================
// "LOGIN" & "LOGOUT" ROUTES
// ====================

// CRUD: READ

// When on this path, render the login.ejs file, where the login form will be

// IF returnTo is in the query string, put it into session

router.get('/login', (req, res) => {
    if (req.query.returnTo) {
        req.session.returnTo = req.query.returnTo
    }
    res.render('users/login');
})

// CRUD: CREATE

// This is the post route for logging in

// passport.authenticate() is a "passport" function

// Show success flash message

// "redirectUrl" is where client will be redirected. So he will be redirected to where he came from or /campgrounds.

// Delete the session info in the database

// Redirect to /campgrounds

router.post('/login', checkReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    // delete req.session.returnTo;
    res.redirect(redirectUrl);
})

// CRUD: READ Get route for logging out

// .logout() is a passport function

// show flash message, redirect

router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) return next(err)
    })
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
})

// ====================
// EXPORTS
// ====================

module.exports = router;