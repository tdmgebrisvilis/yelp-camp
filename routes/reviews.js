// ====================
// PACKAGES
// ====================

const express = require('express');

// to get access to req.params, "mergeParams" is set to true, otherwise there will be an error
const router = express.Router({mergeParams: true});

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

// ====================
// MODELS
// ====================

const Campground = require('../models/campground');
const Review = require('../models/review');

// ====================
// SCHEMAS:
// ====================

// This is a schema for "joi" validation.

const { reviewSchema } = require('../schemas');

// ====================
// MIDDLEWARE
// ====================

// This function is for validating req.body when posting/putting (creating/editing) reviews for campgrounds.

// If there is an error,send it to the next error handling middleware (with message and error code).

// If there are no errors, call the next function in the stack (i.e. the request).

// req.body is validated with using the "reviewSchema" "Joi" validation, and "error" is destructured from it.

// "message" parameter is mapped from each element (el) of "error.details" array, and returned as a string ( join() ).

 const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// ====================
// CRUD: CREATE
// ====================

// Post request for creating a new review for an individual camp.
 
// The form itself for creating the review is in the views/campgrounds/show.ejs.

// Flash is added to display a flash message when a review is successfully created.

 router.post('/', validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// ====================
// CRUD: DELETE
// ====================

// Delete request for deleting an individual review from an individual camp.
 
// The form itself for deleting the review is in the views/campgrounds/show.ejs.
 
// The "pull" is used here to pull the specific review's (the one that is being deleted) ID from the "reviews" array 
// in the campground document.

// Flash is added to display a flash message when a review is successfully deleted.

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}))

// ====================
// EXPORTS
// ====================

module.exports = router;