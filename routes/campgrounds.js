// ====================
// PACKAGES
// ====================

const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

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

// This would've conflicted with "/campgrounds/:id" if it went after it. 

 router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

// Post request, to create a campground. With "validateCampground" for validation and "catchAsync" for catching errors.

// The new campground is created with information provided from req.body.campground.

router.post('/', validateCampground, catchAsync(async (req, res, next) => {
        const campground = new Campground(req.body.campground);
        await campground.save();
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

router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
}))

// ====================
// CRUD: UPDATE
// ====================

// Get request, to edit individual campgrounds.

router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}))


// Put request, to edit individual campgrounds. With "validateCampground" for validation and "catchAsync" for catching errors.
 
// Campground is found by using "id" from req.params, then updated by ...SPREADING new updated data 
// from req.body.campground (the data from the submitted form) into the found object.

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
}))

// ====================
// CRUD: DELETE
// ====================

// Delete request, to delete individual campgrounds.

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

// ====================
// EXPORTS
// ====================

module.exports = router;