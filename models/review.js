// This is the mongoose "Review" model.

// First create the "reviewSchema".

// author is a reference which is a reference to a User instance (model)

// Then export the "Review" model that uses "reviewSchema" schema.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
});

module.exports = mongoose.model("Review", reviewSchema);