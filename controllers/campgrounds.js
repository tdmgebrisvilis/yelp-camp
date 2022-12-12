// MODELS

const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary");

// CRUD: CREATE

// Controller of "new campground" page where there's a form to create a new campground (GET).
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

// Controller of new campground creation (POST).
module.exports.createCampground = async (req, res, next) => {
    // The new campground is created with information provided from req.body.campground (which is accessible after submitting the form.)
    const campground = new Campground(req.body.campground);
    // campground.images are mapped images that are found in req.files thanks to multer package.
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    // author is req.user._id for authentication.
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

// CRUD: READ

// Controller of "index" page where all campgrounds are (GET).
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

// Controller of individual campground page (GET).
module.exports.showCampground = async (req, res) => {
    // Find the campground by it's id from req.params (url).
    const campground = await Campground.findById(req.params.id)
    // Populate campground with "reviews"
    .populate({
        path: 'reviews',
        // populate the reviews with "author".
        populate: {
            path: 'author'
        }
        // Populate campground with "author".
        }).populate('author');
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
};

// CRUD: UPDATE

// Controller of "edit campground" page where there's a form to update individual campground (GET).
module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
};

// Controller for updating an individual campground (PUT).
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    //// console.log(req.body);
    // Campground is found by using "id" from req.params, then updated by ...SPREADING new updated data
    // from req.body.campground (the data from the submitted form) into the found object.
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    // imgs is an array of a mapped array of images that are found in req.files thanks to multer package.
    // This will make ann array with objects that have the key:value pairs that are required in the campground model. 
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    // spread the imgs array and push them into the campground.images array, this way new images can be added without removing the old ones.  
    campground.images.push(...imgs);
    await campground.save();
    // This is for deleting images from a campground. 
    // If there is deleteImages in req.body,
    if (req.body.deleteImages) {
        // for each filename of req.body.deleteImages
        for (let filename of req.body.deleteImages) {
            // destroy the file with that filename from cloudinary.
            await cloudinary.uploader.destroy(filename);
        }
        // update the campground in the db. "$pull" pulls out elements out of an array (deletes them). So in this case, pull images from the images array whose 
        // filename is in ($in) req.body.deleteImages (which is availble when the PUT request is sent when updating the campground).
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    console.log(campground);
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

// Controllerr for deleting an individual campground.
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    // for each image in campground.images array
    campground.images.forEach(img => {
        // destroy that image from cloudinary.
        cloudinary.uploader.destroy(img.filename);
    });
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
};