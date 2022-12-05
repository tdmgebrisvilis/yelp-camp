// This is a "mongoose" user schema

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// passport-local-mongoose is required for security
const passportLocalMongoose = require('passport-local-mongoose');

// Create UserSchema
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// Plug in the UserSchema to "passportLocalMongoose"
UserSchema.plugin(passportLocalMongoose);

// Export the model
module.exports = mongoose.model('User', UserSchema);