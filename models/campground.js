/**
 * This is the mongoose "Campground" model.
 * Before creating the model mongoose must be required.
 * The "mongoose.Schema" shortening to just "Schema" is optional.
 * Create the "CampgroundSchema".
 * "reviews" is an array of documents (their IDs) from the "Review" model.
 * Finally export the "Campground" model that uses "CampgroundSchema" schema.
 * 
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

module.exports = mongoose.model('Campground', CampgroundSchema);