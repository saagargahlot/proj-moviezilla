const mongoose = require('mongoose')
const {disconnect} = require("mongoose")

const {dbUrl} = require('../config')

function getDbConnection() {
    if (mongoose.connection.readyState == 0) {
        console.log(`Connecting to MongoDB at ${dbUrl}`)
        mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    }

    return mongoose.connection
}

const dbConn = getDbConnection()

const closeOrDisconnectMsg = `MongoDB connection to "${dbUrl}" is now`

const normalConnectionClose = function() {
    dbConn.close(function () {
        console.log(`${closeOrDisconnectMsg}" closed...`);
        process.exit(0);
    });
}

// In case of an error when connecting
dbConn.on('error', error => {
    // console.error.bind(console, 'MongoDB connection error', error)
    disconnect()
    // normalConnectionClose()
})

// In case of a disconnect
dbConn.on('disconnected', () => {
    console.log(`${closeOrDisconnectMsg} disconnected...`);
})

// Handle interrupts (control+c) or any other way to kill the program by closing the DB connection
process.on('SIGINT', normalConnectionClose)
    .on('SIGTERM', normalConnectionClose);

module.exports = getDbConnection()
