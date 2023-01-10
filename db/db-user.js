const {User} = require("./model/user")
const dbConn = require("./mongoDb");
const {adminUser, adminPass} = require("../config");

async function findUser(name) {
    const dbUser = await User.findOne({username: name})
    return dbUser
}

async function findUserByNameAndPassword(name, password) {
    const dbUser = await User.findOne({username: name, password: password})
    return dbUser
}

// This method checks if a user exists or not and creates a new user if it does not exist
async function createUser(user) {
    console.log('Trying to find user (before creating one)...')
    let dbUser = await User.exists({username: user.username})

    if (dbUser) {
        // console.log(`User already exists with id=${dbUser._id}`)
        return {error: null, message: 'user already exists', userInfo: {id: dbUser._id, name: user.username}, exists: true, created: false}
    } else {
        try {
            dbUser = await user.save()
            return {error: null, message: 'user created', userInfo: {id: dbUser._id, name: dbUser.username}, created: true, exists: false}
        } catch (e) {
            return {error: e, message: 'Error while creating user', created: false, exists: false}
        }
    }
}

function createNewUser(userInfo) {
    // Create user model
    const newUser = new User({
        username: userInfo.username,
        password: userInfo.password,
        userType: 'non-admin',
        lastLoginTime: new Date()
    })

    return createUser(newUser)
}

// checking if the user is admin or not
async function isAdmin(name) {
    findUser(name).then((dbUser) => {
        if (dbUser) {
            if (dbUser.userType === 'admin') {
                return {admin: true, found: true}
            } else {
                return {admin: false, found: true}
            }
        } else {
            return {admin: false, found: false}
        }
    })
}

// This method returns all the users except the admin user
async function getAllNonAdminUsers(adminUserName) {
    // return following fields except "_id" by adding "-" before "_id" field
    const dbUsers = await User.find({username: {$ne: adminUserName}}).select('-_id username created enabled lastLoginTime')
    return dbUsers
}


module.exports = {
    createUser,
    createNewUser,
    findUser,
    findUserByNameAndPassword,
    isAdmin,
    getAllNonAdminUsers
}
