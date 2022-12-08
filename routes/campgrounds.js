// This is a router for campgrounds

// ====================
// PACKAGES
// ====================

const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
// This is my own middleware
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

// ====================
// MODELS
// ====================

const Campground = require('../models/campground');

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

// author is req.user._id for authentication

// Flash is added to display a flash message when a campground is successfully created.

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
        const campground = new Campground(req.body.campground);
        campground.author = req.user._id;
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

// Populate campground with "reviews", populate the reviews with "author"

// Populate campground with "author"

// "campground" will be populated with all data from "reviews" that are in it and with the 'author' information.

// Flash message added in case there was an arror

router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
        // console.log(campground);
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

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
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

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
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

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}))

// ====================
// EXPORTS
// ====================

module.exports = router;