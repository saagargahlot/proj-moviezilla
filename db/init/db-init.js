const {User} = require("../model/user")
const dbConn = require("../mongoDb")
const {createUser} = require('../db-user')
const {adminUser, adminPass} = require('../../config')


function createAdminUser() {
    const dbAdminUser = new User({
        username: adminUser,
        password: adminPass,
        userType: 'admin'
    })

    createUser(dbAdminUser).then(result => {
        console.log(`Admin user creation result: ${JSON.stringify(result)}`)
        dbConn.close()
    })
}

createAdminUser()
