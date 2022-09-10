const mongoose = require('mongoose'); // require mongoose.
const cities = require('./cities'); // require "cities" from ./cities.js.
const { places, descriptors } = require('./seedHelpers'); // require "places" and "descriptors" arrays from ./seedHelpers.js.
const Campground = require('../models/campground'); // require "Camphround" model.

mongoose.connect('mongodb://localhost:27017/yelp-camp'); // open Mongoose's default connection to MongoDB. "yelp-camp" is the database.

const db = mongoose.connection; // assign "db" variable to Mongoose module's default connection. Variable assigned to make things shorter.

db.on("error", console.error.bind(console, "connection error:")); // run when error occurs.
db.once("open", () => { // run when connected.
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)]; // "sample" is a function. This function's argument will be an array. From that array a 
// random available element will be selected (index is any random number from 0 to array.length-1).


const seedDB = async () => { // create "seedDB" async function.
    await Campground.deleteMany({}); // delete all previous documents from "campgrounds" collection (in "yelp-camp" db). 
    for (let i = 0; i < 50; i++) { // repeat the following for 50 times.
        const random1000 = Math.floor(Math.random() * 1000); // create variable "random1000" that is any random whole number from 0 to 999.
        const camp = new Campground({ // create new document (camp) based on the "Campground" model.
            location: `${cities[random1000].city}, ${cities[random1000].state}`, // location: "cities" array index of random nr from 0 to 999 .city + "cities" array index of random nr from 0 to 999 .state.
            title: `${sample(descriptors)} ${sample(places)}` // title: "random element from "descriptors" array + random element from "places" array".
        })
        await camp.save(); // save the document.
    }
}

seedDB().then(() => { // run "seedDB" function, then close the connection.
    mongoose.connection.close();
})