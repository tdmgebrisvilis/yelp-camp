const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

// Extension for "Joi" safety
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

// This is a schema for "joi" validation of campgrounds that are to be created / modified or deleted. Any object that will be validated with using this
// schema will have to have { campground { title: xxx, price: xxx, ...etc... } } with all requirenments met (type, min value, required, ...etc...).
module.exports.campgroundSchema = Joi.object({
    // This is for creation:
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
    }).required(),
    // This is for deletion:
    deleteImages: Joi.array()
});

// This is a schema for "joi" validation of campground REVIEWS.
// Same rules apply as in above example with campground validation.
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        body: Joi.string().required().escapeHTML(),
    }).required()
});