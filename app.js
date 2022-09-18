// ====================
// PACKAGES
// ====================
/**
 * These packages were installed via npm: "express", "mongoose", "ejs-mate", "method-override".
 * This module is from node: "path".
 * These modules were created by me: "catchAsync", "ExpressError".
 * NOTE** Not all packages required to run this app were required in this file. E.g. "joi" was required in the "./schemas.js".
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
 * These schemas were created by me.
 */
const { campgroundSchema } = require('./schemas');

// ====================
// MODELS
// ====================
// The following is a campground model that I created and required here:
const Campground = require('./models/campground');

// ====================
// MONGOOSE CONNECTION TO MONGO
// ====================
/**
 * Open Mongoose's default connection to MongoDB. "yelp-camp" is the database.
 * Assign "db" variable to Mongoose module's default connection. Variable was assigned to make things shorter.
 * Run if an error occurs.
 * Run when connected successfully.
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
/**
 * The following are the the middleware for this app. These middleware are here to:
 * Use "ejs-mate" engine for "ejs" instead of the default one.
 * Set "view engine" as "ejs". (from express).
 * Set "views" directory (for rendering) to be available from anywhere. (from express).
 * Parse bodies from urls when there is POST request and where Content-Type header matches type option. (from express).
 * Override the "post" method and use it as "put" or "delete" etc. where needed.
 */
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 
app.use(express.urlencoded({ extended: true })); 
app.use(methodOverride('_method')); 

// ====================
// ERROR HANDLING ON THE SERVER SIDE
// ====================
/**
 * The function "validateCampground" is for validating req.body when posting/putting campgrounds.
 * Then validate with req.body using the "campgroundSchema", and destructure "error" from it.
 * IF there is an error:
 *   Map "message" parameter from each element (el) of "error.details" array, and return it as a string ( join() ).
 *   Throw an error based on "ExpressError" (with "msg" as message and "400" as statuCode ). This error with the information will now be 
 *   sent to the next error handling middleware.
 * Else, if there are no errors, call the next function in the stack.
 */
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map((el) => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// ====================
// CRUD: CREATE
// ====================
/**
 * Get request, page with form for new campground creation. This would've conflicted with "/campgrounds/:id" if it went after it. 
 * When this request is sent, render views/campgrounds/new.
 */
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})
/**
 * Post request, to create a campground. With "validateCampground" for validation and "catchAsync" for catching errors.
 * Make a new campground, with information provided from req.body
 * Save.
 * Redirect.
 */
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
}))

// ====================
// CRUD: READ
// ====================

app.get('/', (req, res) => {
    res.render('home');
});

/**
 * Get request, to show all campgrounds. Wrapped in "catchAsync".
 * Find all campgrounds. 
 * Render "views/campgrounds/index", transfer "campgrounds" to it.
 */
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

/**
 * Get request, to show individual campgrounds. Wrapped in "catchAsync".
 * Find (by id) an individual campground. "Id" taken from req.params. 
 * Render "views/campgrounds/show", transfer "campground" to it.
 */
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
}))

// ====================
// CRUD: EDIT
// ====================
/**
 * Get request, to edit individual campgrounds. Wrapped in "catchAsync".
 * Find (by id) an individual campground. "Id" taken from req.params. 
 * Render "views/campgrounds/edit", transfer "campgrounds" to it.
 */
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}))

/**
 * Put request, to edit individual campgrounds. With "validateCampground" for validation and "catchAsync" for catching errors.
 * Destructure "id" from req.params.
 * Find (by id) an individual campground using "id" from req.params, then update it by ....SPREADING new updated 
 * data from req.body.campground (the data from the submitted form) into the found object.
 * Redirect.
 */
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
}))

// ====================
// CRUD: DELETE
// ====================
/**
 * Delete request, to delete individual campgrounds.
 * Destructure "id" from req.params.
 * Use "id" to find and delete the campground.
 * Redirect.
 */
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

// ====================
// ERROR HANDLING MIDDLEWARE
// ====================
/**
 * On every single request, for every path, if nothing else that was supposed to match did not do so (there was no such page, etc), run 
 * the "next" error handling middleware, send 'Page Not Found' as the message & send 404 as the statusCode.
 */
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
}) 

/**
 * This is an express error handling middleware function. (4 params are required). 
 * Destructure "statusCode" from "err" (default 500).
 * If there is no message, then it's 'Oh No, Something Went Wrong'.
 * Respond with status code in console ("statusCode" from ExpressError class); render "views/error" with "err" passed to it.
 */
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong'
    res.status(statusCode).render('error', { err });
})

// ====================
// CONNECTION TO THE SERVER
// ====================
// Set up the server (express).
app.listen(3000, () => {
    console.log('SERVING ON PORT 3000');
});