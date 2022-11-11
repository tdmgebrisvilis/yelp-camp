// ====================
// PACKAGES
// ====================

/**
 * These packages are required to run this app.
 * 
 * Note: not all packages that are required to run this app were required 
 * in this file, e.g. "joi" was required in the "./schemas.js".
 */
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

// ====================
// SCHEMAS:
// ====================

/**
 * These are schemas for "joi" validation.
 */
const { campgroundSchema, reviewSchema } = require('./schemas');

// ====================
// MODELS
// ====================

const Campground = require('./models/campground');
const Review = require('./models/review');

// ====================
// ROUTES
// ====================

const campgrounds = require('./routes/campgrounds');

// ====================
// MONGOOSE CONNECTION TO MONGO
// ====================

/**
 * Open Mongoose's default connection to MongoDB. 
 * 
 * "yelp-camp" is the database. If it doesn't exist yet, it'll be created.
 */
mongoose.connect('mongodb://localhost:27017/yelp-camp'); 
const db = mongoose.connection; 
db.on('error', console.error.bind(console, 'connection error:')); 
db.once('open', () => { 
    console.log('Database connected');
})

// ====================
// MIDDLEWARE
// ====================

// (From ejs-mate) - Use "ejs-mate" engine for "ejs" instead of the default one:
app.engine('ejs', ejsMate);

// (From express) - Set "view engine" as "ejs":
app.set('view engine', 'ejs');

// (From express) - Set "views" directory (for rendering) to be available from anywhere:
app.set('views', path.join(__dirname, 'views')); 

// (From express) - Parse bodies from urls when there is POST request and where Content-Type header matches type option:
app.use(express.urlencoded({ extended: true })); 

// (From method-override) - Override the "post" method and use it as "put" or "delete" etc. where needed:
app.use(methodOverride('_method')); 




/**
 * This function is for validating req.body when posting/putting (creating/editing) 
 * reviews for campgrounds.
 * 
 * Same methods apply as to the function "validateCampground".
 */
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

/**
 * ROUTE STUFF
 */

app.use('/campgrounds', campgrounds);

/**
 * Get request for path "/".
 */
 app.get('/', (req, res) => {
    res.render('home');
});

// ====================
// CRUD (NOT FULL) FOR "REVIEWS"
// ====================

/**
 * Post request for creating a new review for an individual camp.
 * 
 * The form itself for creating the review is in the views/campgrounds/show.ejs.
 */
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

/**
 * Delete request for deleting an individual review from an individual camp.
 * 
 * The form itself for deleting the review is in the views/campgrounds/show.ejs.
 * 
 * The "pull" is used here to pull the specific review's (the one that is 
 * being deleted) ID from the "reviews" array in the campground document.
 */
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

// ====================
// ERROR HANDLING MIDDLEWARE
// ====================

/**
 * On every single request, for every path, if nothing else that was 
 * supposed to match did not do so (there was no such page, etc), 
 * run the "next" error handling middleware, send 'Page Not Found' as 
 * the message & send 404 as the statusCode.
 */
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
}) 

/**
 * This is an express error handling middleware function. (4 params are required). Any 
 * error (err) will be sent sent into this middleware.
 * 
 * Destructure "statusCode" from "err" (default 500).
 * 
 * If there is no message, then it's 'Oh No, Something Went Wrong'.
 * 
 * Respond with status code in console ("statusCode" from "err"); render "views/error" 
 * with "err" passed to it.
 */
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong'
    res.status(statusCode).render('error', { err });
})

// ====================
// CONNECTION TO THE SERVER
// ====================

/**
 * Set up the server (express).
 */
app.listen(3000, () => {
    console.log('SERVING ON PORT 3000');
});