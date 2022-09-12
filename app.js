// ====================
// PACKAGES
// ====================
const express = require('express'); // require express. (npm).
const app = express(); // asign variable "app" to express().
const path = require('path'); // require path (node).
const mongoose = require('mongoose') // require mongoose. (npm).
const methodOverride = require('method-override'); // require method-override. (npm). (For put delete etc).

// ====================
// MODELS
// ====================
const Campground = require('./models/campground'); // require "Campground" model from ./models/campground.js.

// ====================
// MONGOOSE CONNECTION TO MONGO
// ====================
mongoose.connect('mongodb://localhost:27017/yelp-camp'); // open Mongoose's default connection to MongoDB. "yelp-camp" is the database.

const db = mongoose.connection; // assign "db" variable to Mongoose module's default connection. Variable assigned to make things shorter.
db.on('error', console.error.bind(console, 'connection error:')); // run if error occurs.
db.once('open', () => { // run when connected.
    console.log('Database connected');
})

// ====================
// MIDDLEWARE
// ====================
app.set('view engine', 'ejs'); // set "view engine" as "ejs" (express, for ejs files).
app.set('views', path.join(__dirname, 'views')); // set "views" directory (for rendering) to be available from anywhere (express).
app.use(express.urlencoded({ extended: true })) // parse bodies from urls when there is POST request and where Content-Type header matches type option. (express).
app.use(methodOverride('_method')); // for method-override (put delete etc).

// ====================
// CRUD: CREATE
// ====================
app.get('/campgrounds/new', (req, res) => { // get request, page with form for new campground creation. This would've conflicted with "/campgrounds/:id" if it went after.
    res.render('campgrounds/new'); // render this file.
})

app.post('/campgrounds', async (req, res) => { // post request
    const campground = new Campground(req.body.campground); // "campground" = new document based on "Campground" model, properties will be taken 
// from req.body.campground (.campground is here because the names of inputs are under "campground[someName]" in the "new.ejs" file).  
    await campground.save(); // save the newly created document.
    res.redirect(`/campgrounds/${campground._id}`); // redirect to this page.
})

// ====================
// CRUD: READ
// ====================
app.get('/', (req, res) => { // get request (express).
    res.render('home');
});

app.get('/campgrounds', async (req, res) => { // get request, page for all campgrounds.
    const campgrounds = await Campground.find({}); // variable for all documents from "Campground" model.
    res.render('campgrounds/index', { campgrounds }) // render this file, transfer variable "campgrounds" to it.
})

app.get('/campgrounds/:id', async (req, res) => { // get request, page for individual camps.
    const campground = await Campground.findById(req.params.id) // variable for individual campground (id taken from req.params).
    res.render('campgrounds/show', { campground }) // render this file, transfer variable "campgrounds" to it.
})

// ====================
// CRUD: EDIT
// ====================
app.get('/campgrounds/:id/edit', async (req, res) => { // get request, page with form for editing individual camps.
    const campground = await Campground.findById(req.params.id) // variable for individual campground (id taken from req.params).
    res.render('campgrounds/edit', { campground }) // render this file, transfer variable "campgrounds" to it.
})

app.put('/campgrounds/:id', async (req, res) => { // put request (edit campground).
    const { id } = req.params; // destructure id from req.params (url).
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); // update the document, ...SPREAD new updated data to object from req.body.campground.
    res.redirect(`/campgrounds/${campground._id}`); // redirect to this page.
})

// ====================
// CRUD: DELETE
// ====================
app.delete('/campgrounds/:id', async (req, res) => { // delete request.
    const { id } = req.params; // destructure id from req.params (url).
    await Campground.findByIdAndDelete(id); //  // find by id (from the url) and delete.
    // console.log(deletedCampground); // show deleted document.
    res.redirect('/campgrounds'); // redirect to this page.
})

// ====================
// CONNECTION TO THE SERVER
// ====================
app.listen(3000, () => { // set up server (express).
    console.log('SERVING ON PORT 3000');
});