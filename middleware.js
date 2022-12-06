// This middleware checks whether a user is logged in

// Check whether the request is authenticated (passport function)

// If it isn't authenticated, return session to the original url (before submitting)

// Show flash message

// Redirect to /login

// If no errors, go to next()

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
};

// This middleware 

// IF returnTo is in the session, put it into locals

module.exports.checkReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};