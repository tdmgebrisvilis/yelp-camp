// ====================
// PACKAGES, IMPORTS
// ====================

const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
const axios = require('axios');

// ====================
// MONGOOSE CONNECTION TO MONGO
// ====================

/**
 * Open Mongoose's default connection to MongoDB. "yelp-camp" is the database.
 * 
 * Assign "db" variable to Mongoose module's default connection. Variable assigned to make things shorter.
 */
mongoose.connect('mongodb://localhost:27017/yelp-camp');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// ====================
// UNSPLASH API // from udemy comments, lesson 430
// ====================

/**
 * This is a function to seed images using "unsplash" API.
 * 
 * "resp" is a response for an "axios" get request from "unsplash" API.
 * 
 * There are a few params for this request:
    * client_id - my access key to "unsplash" API.
    * collections - collections of images that were used as seeds. The sring i used is a comma separated value.
    * orientation - orientation of immage.
    * count - the number of photos to return per request. Max count allowed by "unsplash" API is 30.
    * 
 * The response ("resp") will now have an array of the data object. This can be checked in "postman" aswell.
 * 
 * Then map the urls to an array and return it.
 */
async function seedImgs() {
    try {
        const resp = await axios.get('https://api.unsplash.com/photos/random', {
            params: {
                client_id: 'wOBlfa0DKXIZ12IAl81esmebb8t5NpYteDsSjL2eBRE',
                collections: '483251, 1114848, 429524',
                orientation: 'landscape',
                count: 30,
            },
        })
        return resp.data.map((a) => a.urls.small);
    } catch (err) {
        console.log(err);
    }
}

// ====================
// "sample" function; random numbers
// ====================

/**
 * The purpose of this function is to select a random element from an array that is put into this function as an argument.
 * 
 * The range of [index] will be any random number from 0 to array.length-1.
 */
const sample = array => array[Math.floor(Math.random() * array.length)];

/**
 * "random100" is any random whole number from 0 to 999.
 * 
 * "price" is any  random whole number from 10 to 30.
 */
const random1000 = Math.floor(Math.random() * 1000);
const price = Math.floor(Math.random() * 20) + 10;

// ====================
// "seedDB" function
// ====================

/**
 * The purpose of this function is to: 
    * Delete all previous documents from "campgrounds" collection (in "yelp-camp" db). 
    * Seed the database with (50) new documents (camps) based on the "Campground" model.
 * Notes:
    * "imgs" is a variable for the images from "unsplash" API. 
    * added specific author (acc:foo pwd:bar). now all campgrounds will belong to this acc. After adding this, run this file.
    * "location" of "camp" is "cities" array index of random nr from 0 to 999 .city + "cities" array index of random nr from 0 to 999 .state.
    * "title" of "camp" is a "random element from "descriptors" array + random element from "places" array".
    * "image" of "camp" is a randomly selected image from the "imgs" array that is iterated over.
    * the "price" can be left with no value, if there is a variable of the same name.
 */
const seedDB = async () => {
    const imgs = await seedImgs();
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const loc = sample(cities)
        const camp = new Campground({
            author: '638f90cc5be14c21222a665e',
            location: `${loc.city}, ${loc.state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: sample(imgs),
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Accusantium ipsum, ea illum earum repellendus commodi tempora ratione, quasi ad pariatur tenetur iste nobis dicta deserunt placeat. Voluptate necessitatibus dolorum sunt?',
            price
        })
        await camp.save();
    }
}

// ====================
// execution
// ====================

/**
 * Run "seedDB" function, then close the connection.
 */
seedDB().then(() => {
    mongoose.connection.close();
});