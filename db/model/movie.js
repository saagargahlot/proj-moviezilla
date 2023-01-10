const mongoose = require("mongoose")

const {dbCollectionMovie} = require('../../config')

const Schema = mongoose.Schema

const movieSchema = new Schema({
    id: Number,
    title: String,
    language: String,
    posterPath: String,
    popularity: mongoose.Types.Decimal128,
    releaseDate: Date,
    overview: String,
    runTime: Number,
    created: { type: Date, default: Date.now() },
})

// Create and export Movie model
const Movie = mongoose.model("Movie", movieSchema, dbCollectionMovie)
module.exports = {
    movieSchema,
    Movie
}
