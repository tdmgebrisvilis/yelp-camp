// campground model
/**
 * This is the mongoose "Campground" model.
 * First create the schema ("CampgroundSchema").
 * Then export the "Campground" model that uses "CampgroundSchema" schema.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String
})

module.exports = mongoose.model('Campground', CampgroundSchema);