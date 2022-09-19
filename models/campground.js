/**
 * This is the mongoose "Campground" model.
 * Before creating the model mongoose must be required; the "mongoose.Schema" shortening to just "Schema" is optional.
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