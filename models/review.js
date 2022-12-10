// This is the mongoose "Review" model.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create the "reviewSchema".
// author is a reference which is a reference to a User instance (model).
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
});

// Export the "Review" model that uses "reviewSchema" schema.
module.exports = mongoose.model("Review", reviewSchema);