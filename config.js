require('dotenv').config()

module.exports = {
    port: process.env.PORT,
    dbUrl: process.env.MONGO_DB_SERVER,
    adminUser: process.env.DB_ADMIN_USER,
    adminPass: process.env.DB_ADMIN_PASS,
    dbCollectionUser: process.env.DB_USER_COLLECTION,
    dbCollectionMovie: process.env.DB_MOVIE_COLLECTION,
    movieApiKey: process.env.MOVIE_API_KEY,
    movieSearchUrl: process.env.MOVIE_SEARCH_URL
}
