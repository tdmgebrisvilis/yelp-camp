// Require "mongoose"
const mongoose = require('mongoose');

// Require "Review" from "review" file
const Review = require('./review');

// This is simply "mongoose.Schema" shortened to just "Schema"
const Schema = mongoose.Schema;

/**
 * This is a mongoose schema for creating a campground.
 * 
 * "author" is the user ID from the "User" model? S52L520 
 * 
 * "reviews" is an array of documents (their IDs) from the "Review" model.
 */
const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        },
    ],
});

/**
 * After a campground is deleted, do this:
 * 
 * IF something (doc) was found and deleted, delete the reviews that 
 * are in ($in) that document's "reviews" array.
 */
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
});


// Create and export the "Campground" model that uses "CampgroundSchema" schema.
module.exports = mongoose.model('Campground', CampgroundSchema);
