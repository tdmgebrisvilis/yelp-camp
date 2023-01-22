if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
};

// PACKAGES, UTILS, MODELS

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const Campground = require('./models/campground');
const { cloudinary, storage } = require("./cloudinary");
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

// Database URL: (run mongoDB url first, if that doesn't work, run localhost)
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';


// ROUTES

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

// MONGOOSE CONNECTION TO MONGO

mongoose.connect(dbUrl); 
const db = mongoose.connection; 
db.on('error', console.error.bind(console, 'connection error:')); 
db.once('open', () => { 
    console.log('Database connected');
})

// MIDDLEWARE

// Execute express
const app = express();
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
// (express) - express.static is a built-in middleware function in Express. It serves static files and is based on serve-static.
// This will make the "public" folder easily accessible.
app.use(express.static(path.join(__dirname, 'public')));
// activate express-mongo-sanitize package
app.use(mongoSanitize({
    replaceWith: '_'
}));

// first pick secret for mongoDB, if that doesn't work use the other secret
const secret = process.env.SECRET || 'verysecretsecret';

// mongo store creation for storing cookies in mongoDB
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60, // 24h in seconds
    crypto: {
        secret,
    }
});

store.on('error', function (e) {
    console.log('SESSION STORE ERROR', e);
})

// (express-session) - settings for this app's sessions, that go into the sessions middleware below
const sessionConfig = {
    // session data will now be stored in mongoDB
    store, // same as store: store
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week in miliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
}
// sessions middleware with the settings applied. 
app.use(session(sessionConfig));
// flash middleware
app.use(flash());
// "helmet" activation
app.use(helmet());

// Allowed URLs for CSP
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [
    "https://fonts.gstatic.com"
];

// "helmet" SCP settings
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/drrm0uwdp/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// PASSPORT MIDDLEWARE

// passport.initialize() intializes Passport for incoming requests, allowing authentication strategies to be applied.
app.use(passport.initialize());
// passport.session() alters the request object and change the 'user' value 
// that is currently the session id (from the client cookie) into the true deserialized user object.
app.use(passport.session());
// user will be authenticated with passport's local strategy "authenticate"
passport.use(new LocalStrategy(User.authenticate()));
// serializeUser is used to persist user data (after successful authentication) into session.
passport.serializeUser(User.serializeUser());
// deserializeUser is used to retrieve user data from session.
passport.deserializeUser(User.deserializeUser());

// Variables "currentUser", "success", and "error" will be available in all files, like ejs files, from res.locals (from express docs). 
// Therefore e.g. in the ejs files, they will be accessible as "currentUser", "success" and "error".
app.use(async(req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.URL = req.url;
    // If there are no campgrounds at all, delete all photos from "YelpCamp" folder in Cloudinary, in case there are some leftovers.
    if (req.url === '/campgrounds') {
        const campgrounds = await Campground.find({});
        if(!campgrounds.length){
            cloudinary.api.delete_resources_by_prefix('YelpCamp/');
            console.log('DELETED ALL PHOTOS (IF THERE WERE ANY) FROM YELPCAMP FOLDER IN CLOUDINARY BECAUSE THERE ARE NO CAMPS.');
        } 
    } 
    next();
})

// ROUTES MIDDLEWARE 

// When path is "/", use the "userRoutes" router
app.use('/', userRoutes);
// When path is /campgrounds, use the "campgrounds" router
app.use('/campgrounds', campgroundRoutes);
// When path is /reviews, use the "reviews" router
app.use('/campgrounds/:id/reviews', reviewRoutes);
// "Home" route
app.get('/', (req, res) => {
    res.render('home')
});

// ERROR HANDLING MIDDLEWARE

// On every single request, for every path, if nothing else that was supposed to match did not do so (there was no such page, etc), 
// run the "next" error handling middleware, send 'Page Not Found' as the message & send 404 as the statusCode.
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
}) 

// This is an express error handling middleware function. Any error (err) will be sent sent into this middleware.
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong'
    // Respond with status code in console ("statusCode" from "err"); render "views/error.ejs"  with "err" passed to it.
    res.status(statusCode).render('error', { err });
})

// CONNECTION TO THE SERVER

// Port on which the app will run will be whatever is in "render's" process.env.PORT || OR 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})