// ====================
// PACKAGES
// ====================

// Note: not all packages that are required to run this app were required in this file, e.g. "joi" was required in the "./schemas.js".

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const session = require('express-session');

// ====================
// ROUTES
// ====================

// campgrounds route
const campgrounds = require('./routes/campgrounds');

// reviews route
const reviews = require('./routes/reviews');

// ====================
// MONGOOSE CONNECTION TO MONGO
// ====================

// Open Mongoose's default connection to MongoDB. 

// "yelp-camp" is the database. If it doesn't exist yet, it'll be created.

mongoose.connect('mongodb://localhost:27017/yelp-camp'); 
const db = mongoose.connection; 
db.on('error', console.error.bind(console, 'connection error:')); 
db.once('open', () => { 
    console.log('Database connected');
})

// ====================
// MIDDLEWARE
// ====================

// (ejs-mate) - Use "ejs-mate" engine for "ejs" instead of the default one:

app.engine('ejs', ejsMate);

// (express) - Set "view engine" as "ejs":

app.set('view engine', 'ejs');

// (express) - Set "views" directory (for rendering) to be available from anywhere:

app.set('views', path.join(__dirname, 'views')); 

// (express) - Parse bodies from urls when there is POST request and where Content-Type header matches type option:

app.use(express.urlencoded({ extended: true })); 

// (method-override) - Override the "post" method and use it as "put" or "delete" etc. where needed:

app.use(methodOverride('_method')); 

// (express) - When path is /campgrounds, use the "campgrounds" router

app.use('/campgrounds', campgrounds);

// (express) - When path is /reviews, use the "reviews" router

app.use('/campgrounds/:id/reviews', reviews);

// (express) - express.static is a built-in middleware function in Express. It serves static files and is based on serve-static.
// This will make the "public" folder easily accessible.

app.use(express.static(path.join(__dirname, 'public')));

// (express-session) - these are the settings for this app's sessions, that go into the sessions middleware below
 
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
}
// This is the sessions middleware with the settings applied. 
app.use(session(sessionConfig))

// ====================
// ERROR HANDLING MIDDLEWARE
// ====================

// On every single request, for every path, if nothing else that was supposed to match did not do so (there was no such page, etc), 
// run the "next" error handling middleware, send 'Page Not Found' as the message & send 404 as the statusCode.

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
}) 

// This is an express error handling middleware function. (4 params are required). Any error (err) will be sent sent into this middleware.

// Destructure "statusCode" from "err" (default 500).

// If there is no message, then it's 'Oh No, Something Went Wrong'.

// Respond with status code in console ("statusCode" from "err"); render "views/error"  with "err" passed to it.

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
