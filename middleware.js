// These are schemas for "joi" validation.
const { campgroundSchema, reviewSchema } = require('./schemas.js');

const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

// This middleware checks whether a user is logged in.
module.exports.isLoggedIn = (req, res, next) => {
    // Check whether the request is authenticated (passport function).
    if (!req.isAuthenticated()) {
        // If it isn't authenticated, return session to the original url (before submitting).
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        // Redirect to /login.
        return res.redirect('/login');
    }
    // If no errors, go to next().
    next();
};

// This middleware will check wether there is a req.session.returnTo and put it into res.locals.returnTo, so 
// that after logging in client would be redirected to the original url.
module.exports.checkReturnTo = (req, res, next) => {
    // IF returnTo is in the session, put it into locals.
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

// This function is for validating req.body when posting/putting (creating / editing) campgrounds.
module.exports.validateCampground = (req, res, next) => {
    // req.body is validated with using the "campgroundSchema" "Joi" validation, and "error" is destructured from it.
    const { error } = campgroundSchema.validate(req.body);
    // If there is an error,send it to the next error handling middleware (with message and error code).
    if (error) {
        // "message" parameter is mapped from each element (el) of "error.details" array, and returned as a string.
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        // If there are no errors, call the next function in the stack (i.e. the request).
        next();
    }
}

// This middleware checks wether the user is the author of the campground. 
module.exports.isAuthor = async (req, res, next) => {
    // Take campground id from url 
    const { id } = req.params;
    // find it in the database and assign to variable campground
    const campground = await Campground.findById(id);
    // If the campground.author is not the same as req.user._id, flash error message, redirect and run next().
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// This middleware checks wether the user is the author of the review. 
module.exports.isReviewAuthor = async (req, res, next) => {
    // Take review id from url, find it in the database.
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    console.log(reviewId);
    // If the review.author is not the same as req.user._id, flash error message, redirect and run next().
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// This middleware is for validating req.body when posting/putting (creating/editing) reviews for campgrounds.
module.exports.validateReview = (req, res, next) => {
    // req.body is validated with using the "reviewSchema" "Joi" validation, and "error" is destructured from it.
    const { error } = reviewSchema.validate(req.body);
    // If there is an error,send it to the next error handling middleware (with message and error code).
    if (error) {
        // "message" parameter is mapped from each element (el) of "error.details" array, and returned as a string.
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        // If there are no errors, call the next function in the stack (i.e. the request).
        next();
    }
}
