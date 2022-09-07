// ====================
// PACKAGES
// ====================
const express = require('express'); // require express.
const app = express(); // asign variable "app" to express().
const path = require('path'); // require path (node).
const mongoose = require('mongoose') // require mongoose.

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
app.set('views', path.join(__dirname, 'views')); // set "views" directory to be available from anywhere (express).


// ====================
// CRUD: READ
// ====================
app.get('/', (req, res) => { // get request (express).
    res.render('home');
});

app.get('/makecampground', async (req, res) => { 
    const camp = new Campground({title: 'My Backyard', description: 'cheap camping!'});
    await camp.save();
    res.send(camp)
});


// ====================
// CONNECTION TO THE SERVER
// ====================
app.listen(3000, () => { // set up server (express).
    console.log('SERVING ON PORT 3000');
});