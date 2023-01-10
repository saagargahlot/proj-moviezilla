const mongoose = require("mongoose")

const Schema = mongoose.Schema
const {movieSchema} = require('./movie')
const {dbCollectionUser} = require('../../config')

// https://mongoosejs.com/docs/validation.html#built-in-validators
const userSchema = new Schema({
    username: {
        type: String,
        unique: true,    // usernames are unique
        required: true
    },
    password: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        enum: {
            values: ['admin', 'non-admin'],
            message: '{VALUE} is not supported'
        }
    },
    created: { type: Date, default: Date.now() },
    lastLoginTime: { type: Date },
    enabled: {type: Boolean, default: true},   // whether a user is enabled to use the system or not
    movies: [movieSchema],    // embedded (or subdocument) Movies
})

// Create and export User model
const User = mongoose.model("User", userSchema, dbCollectionUser)
module.exports = {
    userSchema,
    User
}
