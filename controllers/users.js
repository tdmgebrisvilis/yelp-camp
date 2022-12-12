// MODELS

const User = require('../models/user');

// "REGISTER" ROUTES:

// CRUD: READ

// Controller for showing user registration form (which is in the register.ejs file). 
module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

// CRUD: CREATE

// Controller for user creation.
module.exports.register = async (req, res, next) => {
    try {
        // Afer the form is submitted, destructure email, username and password from req.body.
        const { email, username, password } = req.body;
        // Create a new user on the database, append the email and username to it.
        const user = new User({ email, username });
        // Register the user using the user and password and save it as "registeredUser" (.register() is a function from "possport").
        const registeredUser = await User.register(user, password);
        // Login the user (.login() is a "passport" function).
        req.login(registeredUser, err => {
            // If there is an error, go to next() middleware. 
            if (err) return next(err);
            // If there are no errors, show success flash message and redirect to /campgrounds.
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
        // If something is wrong, show error flash message and redirect to /register.
    }   catch (e) {
        req.flash('error', e.message);
        //? 'register' or '/register' ? 
        res.redirect('/register');
    }
};

// "LOGIN" & "LOGOUT" ROUTES:

// CRUD: READ

// Controller for showing user login form (which is in the login.ejs file). 
module.exports.renderLogin = (req, res) => {
    // IF returnTo is in the query string, put it into session.
    if (req.query.returnTo) {
        req.session.returnTo = req.query.returnTo
    }
    res.render('users/login');
};

// CRUD: CREATE

// Controller for logging in.
module.exports.login = (req, res) => {
    // Show success flash message.
    req.flash('success', 'welcome back!');
    // "redirectUrl" is where client will be redirected. So he will be redirected to where he came from or /campgrounds.
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    //// Delete the session info in the database.
    // delete req.session.returnTo;
    // Redirect to redirectUrl.
    res.redirect(redirectUrl);
};

// Controller for logging out.
module.exports.logout = (req, res) => {
    // .logout() is a passport function.
    req.logout(err => {
        if (err) return next(err)
    })
    // Show flash message, redirect.
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
};