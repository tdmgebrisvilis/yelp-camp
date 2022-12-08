// This is a router for reviews

// ====================
// PACKAGES
// ====================

const express = require('express');

// to get access to req.params, "mergeParams" is set to true, otherwise there will be an error
const router = express.Router({mergeParams: true});

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

// ====================
// MIDDLEWARE
// ====================

const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');


// ====================
// MODELS
// ====================

const Campground = require('../models/campground');
const Review = require('../models/review');

// ====================
// CRUD: CREATE
// ====================

// Post request for creating a new review for an individual camp.
 
// The form itself for creating the review is in the views/campgrounds/show.ejs.

// review.author is added for authorization purposes

// Flash is added to display a flash message when a review is successfully created.

 router.post('/', isLoggedIn, validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
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

// With isLoggedIn & isReviewAuthor middleware for authentication and authorization
 
// The "pull" is used here to pull the specific review's (the one that is being deleted) ID from the "reviews" array 
// in the campground document.

// Flash is added to display a flash message when a review is successfully deleted.

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
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