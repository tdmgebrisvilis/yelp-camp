// ====================
// PACKAGES, IMPORTS
// ====================
const mongoose = require('mongoose'); // require mongoose.
const cities = require('./cities'); // require "cities" from ./cities.js.
const { places, descriptors } = require('./seedHelpers'); // require "places" and "descriptors" arrays from ./seedHelpers.js.
const Campground = require('../models/campground'); // require "Camphround" model.
const axios = require('axios'); // require axios (npm). (for now this is needed just for seeds).


mongoose.connect('mongodb://localhost:27017/yelp-camp'); // open Mongoose's default connection to MongoDB. "yelp-camp" is the database.

const db = mongoose.connection; // assign "db" variable to Mongoose module's default connection. Variable assigned to make things shorter.

db.on("error", console.error.bind(console, "connection error:")); // run when error occurs.
db.once("open", () => { // run when connected.
    console.log("Database connected");
});

// ====================
// UNSPLASH API // from udemy comments, lesson 430
// ====================
async function seedImgs() { // function to seed images using "unsplash" API.
    try { // error handler
        const resp = await axios.get('https://api.unsplash.com/photos/random', { // axios get request from "unsplash" API. "resp" stands for response.
            params: { // params of the request.
                client_id: 'wOBlfa0DKXIZ12IAl81esmebb8t5NpYteDsSjL2eBRE', // my access key to "unsplash" API.
                collections: '483251, 1114848, 429524', // ***NEW*** this string is a comma separated value.  
                orientation: 'landscape',
                count: 30, // "count" param is the number of photos to return per request. Max count allowed by "unsplash" API is 30.
            },
        })
        // the response ("resp") will now have an array of the data object. This can be checked in "postman" aswell.
        return resp.data.map((a) => a.urls.small); // map the urls to an array and return it.
    } catch (err) {
        console.log(err);
    }
}

// ====================
// sample function
// ====================
const sample = array => array[Math.floor(Math.random() * array.length)]; // "sample" is a function. This function's argument will be an array. From that array a 
// random available element will be selected (index is any random number from 0 to array.length-1).

// ====================
// seedDB function
// ====================
const seedDB = async () => { // create "seedDB" async function.
    const imgs = await seedImgs(); // assign variable to seedImgs() function.
    await Campground.deleteMany({}); // delete all previous documents from "campgrounds" collection (in "yelp-camp" db). 
    for (let i = 0; i < 50; i++) { // repeat the following for 50 times.
        const random1000 = Math.floor(Math.random() * 1000); // create variable "random1000" that is any random whole number from 0 to 999.
        const price = Math.floor(Math.random() * 20) + 10; // asingn variable for random price. 
        const camp = new Campground({ // create new document (camp) based on the "Campground" model.
            location: `${cities[random1000].city}, ${cities[random1000].state}`, // location: "cities" array index of random nr from 0 to 999 .city + "cities" array index of random nr from 0 to 999 .state.
            title: `${sample(descriptors)} ${sample(places)}`, // title: "random element from "descriptors" array + random element from "places" array".
            image: sample(imgs), // iterate over "imgs" and randomly select one.
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Accusantium ipsum, ea illum earum repellendus commodi tempora ratione, quasi ad pariatur tenetur iste nobis dicta deserunt placeat. Voluptate necessitatibus dolorum sunt?',
            price // ***NEW*** it can be done just like this, with no value, only key (if there is a variable of the same name).
        })
        await camp.save(); // save the document.
    }
}

// ====================
// execution
// ====================
seedDB().then(() => { // run "seedDB" function, then close the connection.
    mongoose.connection.close();
})