/**
 * This is the mongoose "Review" model.
 * 
 * First create the "reviewSchema".
 * 
 * Then export the "Review" model that uses "reviewSchema" schema.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
});

module.exports = mongoose.model("Review", reviewSchema);