/**
 * This is the mongoose "Review" model.
 * The "mongoose.Schema" shortening to just "Schema" is optional
 * Firs create the "reviewSchema".
 * Then export the "Review" model that uses "reviewSchema" schema.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
});

module.exports = mongoose.model("Review", reviewSchema);