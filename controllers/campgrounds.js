// MODELS

const Campground = require('../models/campground');

// CRUD: CREATE

// Controller of "new campground" page where there's a form to create a new campground (GET).
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

// Controller of new campground creation (POST).
// The new campground is created with information provided from req.body.campground.
// author is req.user._id for authentication.
// Flash is added to display a flash message when a campground is successfully created.
module.exports.createCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`);
};

// CRUD: READ

// Controller of "index" page where all campgrounds are (GET).
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

// Controller of individual campground page (GET).
// Find the campground by it's id from req.params (url).
// Populate campground with "reviews", populate the reviews with "author".
// Populate campground with "author".
// "campground" will be populated with all data from "reviews" that are in it and with the 'author' information.
// Flash message in case of error.
module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
};

// CRUD: UPDATE

// Controller of "edit campground" page where there's a form to update individual campground (GET).
// Flash message added in case of error.
module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
};

// Controller for updating an individual campground (PUT).
// Campground is found by using "id" from req.params, then updated by ...SPREADING new updated data.
// from req.body.campground (the data from the submitted form) into the found object.
// Flash is added to display a flash message when a campground is successfully updated.
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

// Controllerr for deleting an individual campground.
// Flash is added to display a flash message when a campground is successfully deleted.
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
};
