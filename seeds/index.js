// This is a seeder file to seed the database with new campgrounds. It will delete old campgrounds and will add new ones.
// based on what is put into the seedDB function. 
// Run this file through node.

// For .env secret files
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
};

// PACKAGES, IMPORTS, MODELS

const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
const Review = require('../models/review');
const axios = require('axios');
// Geocoder:
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

// MONGOOSE CONNECTION TO MONGO

// Open Mongoose's default connection to MongoDB. "yelp-camp" is the database.
mongoose.connect('mongodb://localhost:27017/yelp-camp');
// Assign "db" variable to Mongoose module's default connection. Variable assigned to make things shorter.
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// This is a function to seed images using "unsplash" API. // from udemy comments, lesson 430
async function seedImgs() {
    try {
        // "resp" is a response for an "axios" get request from "unsplash" API.
        const resp = await axios.get('https://api.unsplash.com/photos/random', {
            params: {
                // client_id - my access key to "unsplash" API.
                client_id: process.env.UNSPLASH_CLIENT_ID,
                // collections of images that were used as seeds. The string I used is a comma separated value.
                collections: '483251, 1114848, 429524',
                orientation: 'landscape',
                // the number of photos to return per request. Max count allowed by "unsplash" API is 30.
                count: 30,
            },
        })
        // The response ("resp") will now have an array of the data object (resp.data). This can be checked in "postman" aswell. 
        // Resp.data will have all 30 images with all information about them (including urls of different sizes).
        // Then map the urls to an array and return it. What this means: Leave only the data from urls.small in the objects of the resp.data array. 
        return resp.data.map((array) => array.urls.small);
    } catch (err) {
        console.log(err);
    }
};
// Function for picking up an element from an array, then removing that element from the array.
// If this function is in a loop, it allows picking one new element without repetition.
// Currently not using this function.
const pickImg = function(array){
    const firstElement = array[0];
    array.splice(0, 1);
    return firstElement
};

// This function will make an array of 3 images that do not repeat. It will also delete the first element of the array.
// This way, when this function is in a loop, there will not be repetition.
const pickImgs = function(array){
    const threeImgs = array.slice(0, 3);
    array.splice(0, 1);
    let images = [];
    for (let i = 0; i < threeImgs.length; i++){
        images.push({url: threeImgs[i]})
    }
    return images
};

// This function selects a random element from an array that is put into this function as an argument.
// The range of [index] will be any random number from 0 to array.length-1.
const sample = array => array[Math.floor(Math.random() * array.length)];

// This function: 1) deletes all previous documents from "campgrounds" collection (in "yelp-camp" db); 2) seeds the database with (50) new 
// documents (camps) based on the "Campground" model.
const seedDB = async () => {
    // "imgs" is a variable for the images from "unsplash" API. 
    const imgs = await seedImgs();
    const imgsCopy = imgs.slice();
    // uncomment these 2 if running seedDB once. If more than once, these must be commented out. 
    //! await Campground.deleteMany({});
    //! await Review.deleteMany({});
    for (let i = 0; i < 30; i++) {
        const loc = sample(cities);
        const camp = new Campground({
            // added specific author (acc:foo pwd:bar). now all campgrounds will belong to this acc.
            author: '63973015f8e1d3534f48a1ff',
            // "location" of "camp" is "cities" array index of random nr from 0 to the array.length & state of the same city.
            location: `${loc.city}, ${loc.state}`,
            // "title" of "camp" is a "random element from "descriptors" array + random element from "places" array".
            title: `${sample(descriptors)} ${sample(places)}`,
            // "images" will be added with using the "pickImgs" function.
            images: pickImgs(imgsCopy),
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Accusantium ipsum, ea illum earum repellendus commodi tempora ratione, quasi ad pariatur tenetur iste nobis dicta deserunt placeat. Voluptate necessitatibus dolorum sunt?',
            // random number from 20 to 30
            price: Math.floor(Math.random() * 11) + 20,
        });
        // forwardGeocode function to get coordinates geojson from the "camp" location
        const geoData = await geocoder.forwardGeocode({
            query: camp.location,
            limit: 1
          }).send();  
        // camp.geometry will be what we got from the geoData function, at geoData.body.features[0].geometry.
        camp.geometry = geoData.body.features[0].geometry;
        await camp.save();
    }
}

// Execution

// // Run "seedDB" function, then close the connection.
// seedDB().then(() => {
//     mongoose.connection.close();
// });

const threeHunderedCamps = async function () {
    for (let i = 0; i < 10; i++) {
        await seedDB();
    };
    seedDB().then(() => {
        mongoose.connection.close();
    });
};
threeHunderedCamps();