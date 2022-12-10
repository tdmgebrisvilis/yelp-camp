// These are the controllers for the campgrounds routes.

// MODELS

const Campground = require('../models/campground');
const Review = require('../models/review');

// CRUD: CREATE

// This is a controller for creating a new review on an individual campground.
// The form itself for creating the review is in the views/campgrounds/show.ejs.
// review.author is added for authorization purposes.
// Flash is added to display a flash message when a review is successfully created.
module.exports.createReview = async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
};

// CRUD: DELETE

// This is a controller for deleting a review.
// The form itself for deleting the review is in the views/campgrounds/show.ejs.
// The "$pull" is used here to pull the specific review's (the one that is being deleted) ID from the "reviews" array 
// in the campground document.
// Flash is added to display a flash message when a review is successfully deleted.
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
};