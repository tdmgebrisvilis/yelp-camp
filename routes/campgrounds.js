// This is a router for campgrounds

// ====================
// PACKAGES
// ====================

const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
// this is my own middleware
const { isLoggedIn } = require('../middleware');

// ====================
// MODELS
// ====================

const Campground = require('../models/campground');

// ====================
// SCHEMAS:
// ====================

// This is a schema for "joi" validation.

const { campgroundSchema } = require('../schemas');

// ====================
// MIDDLEWARE
// ====================

// This function is for validating req.body when posting/putting (creating / editing) campgrounds.

// If there is an error,send it to the next error handling middleware (with message and error code).

// If there are no errors, call the next function in the stack (i.e. the request).

// req.body is validated with using the "campgroundSchema" "Joi" validation, and "error" is destructured from it.

// "message" parameter is mapped from each element (el) of "error.details" array, and returned as a string ( join() ).

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

// Get request, page with form for new campground creation. 

// "isLoggedIn" middleware checks whether the user is logged in. If that's false, enterance will be prohibited.

// This would've conflicted with "/campgrounds/:id" if it went after it. 

 router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})

// Post request, to create a campground. With "validateCampground" for validation and "catchAsync" for catching errors.

// "isLoggedIn" middleware checks whether the user is logged in. If that's false, enterance will be prohibited.

// The new campground is created with information provided from req.body.campground.

// Flash is added to display a flash message when a campground is successfully created.

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
        const campground = new Campground(req.body.campground);
        await campground.save();
        req.flash('success', 'Successfully made a new campground!')
        res.redirect(`/campgrounds/${campground._id}`);
}))

// ====================
// CRUD: READ
// ====================

// Get request, to show all campgrounds.

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

// Get request, to show individual campgrounds.

// "campground" will be populated with all data from "reviews" that are in it.

// Flash message added in case there was an arror

router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}))

// ====================
// CRUD: UPDATE
// ====================

// Get request, to edit individual campgrounds.

// "isLoggedIn" middleware checks whether the user is logged in. If that's false, enterance will be prohibited.

// A flash message will be shown if there was an error

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))


// Put request, to edit individual campgrounds. With "validateCampground" for validation and "catchAsync" for catching errors.

// "isLoggedIn" middleware checks whether the user is logged in. If that's false, enterance will be prohibited.
 
// Campground is found by using "id" from req.params, then updated by ...SPREADING new updated data 
// from req.body.campground (the data from the submitted form) into the found object.

// Flash is added to display a flash message when a campground is successfully updated.

router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// ====================
// CRUD: DELETE
// ====================

// Delete request, to delete individual campgrounds.

// "isLoggedIn" middleware checks whether the user is logged in. If that's false, enterance will be prohibited.

// Flash is added to display a flash message when a campground is successfully deleted.

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}))

// ====================
// EXPORTS
// ====================

module.exports = router;