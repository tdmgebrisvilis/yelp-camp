/**
 * This is a schema for "joi" validation of campgrounds that are to be created. 
 * 
 * Any object that will be validated with using this schema will have to 
 * have { campground { title: xxx, price: xxx, ...etc... } } with 
 * all requirenments met (type, min value, required, ...etc...).
 * 
 * It must be exported, and "joi" must be required.
 */

const Joi = require('joi')

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required(),
    }).required()
})

/**
 * This is a schema for "joi" validation of campground REVIEWS that are to be created. 
 * 
 * Same rules apply as in above example with campground validation.
 */
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        body: Joi.string().required(),
    }).required()
})