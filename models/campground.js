// campground model

const mongoose = require('mongoose') // require mongoose.
const Schema = mongoose.Schema; // asign variable to mongoose schema (this is a shortcut, "mongoose.Schema" is now available as Schema).

const CampgroundSchema = new Schema({ // create new "CampgroundSchema" Schema.
    title: String,
    price: String,
    description: String,
    location: String
})

module.exports = mongoose.model('Campground', CampgroundSchema); // export "Campground" model that uses "CampgroundSchema" schema.