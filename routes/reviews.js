// PACKAGES, MIDDLEWARE MODELS, UTILS, CONTROLLERS

const express = require('express');
// to get access to req.params, "mergeParams" is set to true, otherwise there will be an error.
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');

// Post request for creating a new review for an individual camp.
 router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// Delete request for deleting an individual review from an individual camp.
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

// EXPORTS
module.exports = router;