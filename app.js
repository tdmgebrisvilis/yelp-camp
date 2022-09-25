// ====================
// PACKAGES
// ====================

// These packages were installed via npm: "express", "mongoose", "ejs-mate", "method-override".
// This module is from node: "path".
// These modules were created by me: "catchAsync", "ExpressError".
// NOTE** Not all packages required to run this app were required in this file. E.g. "joi" was required in the "./schemas.js".
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

// This mongoose schema was created by me.
const { campgroundSchema } = require('./schemas');

// ====================
// MODELS
// ====================

// This campground model was created by me.
const Campground = require('./models/campground');

// ====================
// MONGOOSE CONNECTION TO MONGO
// ====================

// Open Mongoose's default connection to MongoDB. "yelp-camp" is the database.
mongoose.connect('mongodb://localhost:27017/yelp-camp'); 
// Assign "db" variable to Mongoose module's default connection. Variable was assigned to make things shorter.
const db = mongoose.connection; 
// Run if an error occurs.
db.on('error', console.error.bind(console, 'connection error:')); 
// Run when connected successfully.
db.once('open', () => { 
    console.log('Database connected');
})

// ====================
// MIDDLEWARE
// ====================

// Use "ejs-mate" engine for "ejs" instead of the default one.
app.engine('ejs', ejsMate);
// Set "view engine" as "ejs". (from express).
app.set('view engine', 'ejs');
// Set "views" directory (for rendering) to be available from anywhere. (from express).
app.set('views', path.join(__dirname, 'views')); 
// Parse bodies from urls when there is POST request and where Content-Type header matches type option. (from express).
app.use(express.urlencoded({ extended: true })); 
// Override the "post" method and use it as "put" or "delete" etc. where needed.
app.use(methodOverride('_method')); 

// ====================
// ERROR HANDLING ON THE SERVER SIDE
// ====================

// The function "validateCampground" is for validating req.body when posting/putting campgrounds.
const validateCampground = (req, res, next) => {
    // Validate with req.body using the "campgroundSchema", and destructure "error" from it.
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        // Map "message" parameter from each element (el) of "error.details" array, and return it as a string ( join() ).
        const msg = error.details.map((el) => el.message).join(',')
        // Throw an error based on "ExpressError" (with "msg" as message and "400" as statuCode). 
        // This error with the information will now be sent to the next error handling middleware.
        throw new ExpressError(msg, 400)
        // Else, if there are no errors, call the next function in the stack.
    } else {
        next();
    }
}
// ====================
// CRUD: CREATE
// ====================

// Get request, page with form for new campground creation. This would've conflicted with "/campgrounds/:id" if it went after it. 
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

// Post request, to create a campground. With "validateCampground" for validation and "catchAsync" for catching errors.
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
        // Make a new campground, with information provided from req.body.campground.
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

// Get request, to show all campgrounds. Wrapped in "catchAsync".
app.get('/campgrounds', catchAsync(async (req, res) => {
    // Find all campgrounds:
    const campgrounds = await Campground.find({});
    // Render "views/campgrounds/index", transfer "campgrounds" to it.
    res.render('campgrounds/index', { campgrounds });
}))

// Get request, to show individual campgrounds. Wrapped in "catchAsync".
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    // Find (by id) an individual campground. "Id" taken from req.params. 
    const campground = await Campground.findById(req.params.id);
    // Render "views/campgrounds/show", transfer "campground" to it.
    res.render('campgrounds/show', { campground });
}))

// ====================
// CRUD: EDIT
// ====================

 // Get request, to edit individual campgrounds. Wrapped in "catchAsync".
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    // Find (by id) an individual campground. "Id" taken from req.params. 
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}))

// Put request, to edit individual campgrounds. With "validateCampground" for validation and "catchAsync" for catching errors.
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    // Destructure "id" from req.params.
    const { id } = req.params;
    // Find (by id) an individual campground using "id" from req.params, then update it by ....SPREADING new updated 
    // data from req.body.campground (the data from the submitted form) into the found object.
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
}))

// ====================
// CRUD: DELETE
// ====================

// Delete request, to delete individual campgrounds.
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    // Destructure "id" from req.params.
    const { id } = req.params;
    // Use "id" to find and delete the campground.
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

// ====================
// ERROR HANDLING MIDDLEWARE
// ====================

// On every single request, for every path, if nothing else that was supposed to match did not do so (there was no such page, etc), run 
// the "next" error handling middleware, send 'Page Not Found' as the message & send 404 as the statusCode.
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
}) 

// This is an express error handling middleware function. (4 params are required). 
app.use((err, req, res, next) => {
    // Destructure "statusCode" from "err" (default 500).
    const { statusCode = 500 } = err;
    // If there is no message, then it's 'Oh No, Something Went Wrong'.
    if(!err.message) err.message = 'Oh No, Something Went Wrong'
    // Respond with status code in console ("statusCode" from ExpressError class); render "views/error" with "err" passed to it.
    res.status(statusCode).render('error', { err });
})

// ====================
// CONNECTION TO THE SERVER
// ====================

// Set up the server (express).
app.listen(3000, () => {
    console.log('SERVING ON PORT 3000');
});