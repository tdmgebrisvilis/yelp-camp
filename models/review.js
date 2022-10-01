/**
 * This is the mongoose "Review" model.
 * Before creating the model mongoose must be required.
 * The "mongoose.Schema" shortening to just "Schema" is optional
 * Create the "reviewSchema".
 * Finally export the "Review" model that uses "reviewSchema" schema.
 * 
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
});

module.exports = mongoose.model("Review", reviewSchema);