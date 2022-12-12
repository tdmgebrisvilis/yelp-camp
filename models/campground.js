// This is the mongoose "Campground" model.

// PACKAGES AND MODELS
const mongoose = require('mongoose');
const Review = require('./review');
// This is simply "mongoose.Schema" shortened to just "Schema"
const Schema = mongoose.Schema;

// Image schema, moved it here separately from the CampgroundSchema so that it could be used in different places.
const ImageSchema = new Schema({
    url: String,
    filename: String
});

// On every image set up a virtual "thumbnail"  
ImageSchema.virtual('thumbnail').get(function () {
    // "this" refers to a particular image;
    //in that image, in its url, replace "/upload" with "/upload/w_200".
    return this.url.replace('/upload', '/upload/w_200');
});

// This is a mongoose schema for creating a campground.
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    // "author" is the user ID from the "User" model? S52L520.
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    // "reviews" is an array of documents (their IDs) from the "Review" model.
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        },
    ],
});

// After a campground is deleted, delete all reviews that are associeted with it.
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    // IF something (doc) was found and deleted, delete the reviews that are in ($in) that document's "reviews" array.
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