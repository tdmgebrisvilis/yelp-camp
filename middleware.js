// These are schemas for "joi" validation.
const { campgroundSchema, reviewSchema } = require('./schemas.js');

const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

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

// This middleware will check wether there is a req.session.returnTo and put it into res.locals.returnTo, so that after logging in client would
// be redirected to the original url

// IF returnTo is in the session, put it into locals

module.exports.checkReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

// This function is for validating req.body when posting/putting (creating / editing) campgrounds.

// If there is an error,send it to the next error handling middleware (with message and error code).

// If there are no errors, call the next function in the stack (i.e. the request).

// req.body is validated with using the "campgroundSchema" "Joi" validation, and "error" is destructured from it.

// "message" parameter is mapped from each element (el) of "error.details" array, and returned as a string ( join() ).

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// This middleware checks wether the user is the author of the campground. 

// Take campground id from url, find it in the database

// If the campground.author is not the same as req.user._id, flash error message, redirect and run next().

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// This middleware checks wether the user is the author of the review. 

// Take review id from url, find it in the database

// If the review.author is not the same as req.user._id, flash error message, redirect and run next().

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// This middleware is for validating req.body when posting/putting (creating/editing) reviews for campgrounds.

// If there is an error,send it to the next error handling middleware (with message and error code).

// If there are no errors, call the next function in the stack (i.e. the request).

// req.body is validated with using the "reviewSchema" "Joi" validation, and "error" is destructured from it.

// "message" parameter is mapped from each element (el) of "error.details" array, and returned as a string ( join() ).

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
