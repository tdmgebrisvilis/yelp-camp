// PACKAGES, MODELS, CONTROLLERS, MIDDLEWARE, UTILS
const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const Campground = require('../models/campground');

// All campgrounds routes.
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

// New campground route. This would've conflicted with "/campgrounds/:id" if it went after it.
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// Individual campground routes
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

// Get request reoute, to edit individual campgrounds. This is where the form for editing will be.
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

// EXPORTS
module.exports = router;