
/*
  =================
  Read the dotenv config
  =================
 */
require('dotenv').config()

const express = require('express')
const path = require('path')
const {port, movieSearchUrl, adminUser} = require('./config') || 3000
const app = express()
const cryto = require('crypto')
const {createNewUser, findUser, findUserByNameAndPassword, getAllNonAdminUsers} = require('./db/db-user')
const dbConn = require("./db/mongoDb");

const statusOk = 200
const adminUserType = 'admin'
const statusBadRequest = 400      // https://www.rfc-editor.org/rfc/rfc7231#section-6.5.1


let userMap = new Map()

/*
  =================
  Setup app to use:
    - views dir
    - template engine
  =================
 */

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// to serve static assets using express middleware func
app.use(express.static(path.join(__dirname, 'public/js')))
app.use(express.static(path.join(__dirname, 'public/style')))

//Convert any JSON stringified strings in a POST request to JSON.
app.use(express.json())

function generateUserKey(username) {
    // store username with server generated id in the map
    const serverKey = cryto.randomUUID()
    userMap.set(username, serverKey)

    return serverKey
}

function doesUserKeyMatch(username, userKey) {
    console.log(`Key for user (${username}) => (${userMap.get(username)})`)
    return userMap.get(username) === userKey
}

function isAdminUser(dbUser) {
    return dbUser && dbUser.userType === adminUserType;
}


/*
  =================
  Routes
  =================
 */

// homepage
app.get("/", (req, res) => {
    res.status(statusOk).render('signIn', {title: 'Sign in'})
})

// sign up the new user
app.get("/sign-up", (req, res) => {
    console.log('returning sign-up page...')
    res.status(statusOk).render('signUp', {title: 'Sign up'})
})

// login the user   
app.post('/login', (req, res) => {
    let userInfo = req.body
    console.log(`Type of request: ${typeof (userInfo)}`)
    console.log(`Logging in user using ${JSON.stringify(userInfo)}`)

    // find user in DB based off username and password
    findUserByNameAndPassword(userInfo.username, userInfo.password).then((result) => {
        if (result && result._id) {
            console.log(`login:: DB Search for user (${userInfo.username}) => ${result._id}`)
            // store username with server generated id in the map
            const serverKey = generateUserKey(userInfo.username)

            res.status(statusOk).json({login: "success", message: "user found", key: serverKey});
        } else {
            res.status(statusBadRequest).json({login: "failure", message: "no match found"});
        }
    })
})

// create a new user account
app.post("/create-account", (req, res) => {
    let userInfo = req.body
    console.log(`Type of request: ${typeof (userInfo)}`)
    console.log(`Creating a new user account using ${JSON.stringify(userInfo)}`)

    // creating a new user in DB
    createNewUser(userInfo).then(result => {
        console.log(`User creation result: ${JSON.stringify(result)}`)
        if (result.error || result.exists) {
            // return a 404 error incase of an error or if user already exists
            res.status(statusBadRequest).json(result)
        } else {
            // store username with server generated id in the map
            const serverKey = generateUserKey(userInfo.username)
            console.log(`Sending key=${serverKey} for user=${userInfo.username} `)

            res.status(statusOk).json({userInfo: {username: result.userInfo.name, message: result.message}, key: serverKey});
        }
    })
})

// add movie to user's movie list
app.post("/add-movie", (req, res) => {
    let userAndMovieInfo = req.body
    console.log(`Type of request: ${typeof (userAndMovieInfo)}`)
    console.log(`Adding movies to user using ${JSON.stringify(userAndMovieInfo)}`)

    const name = userAndMovieInfo.username
    const userKey = userAndMovieInfo.key

    // checking if the user key matches the server generated key
    if (doesUserKeyMatch(name, userKey)) {
        findUser(name).then((dbUser) => {
            // checking if the user exists in DB
            if (dbUser) {
                // check if user is enabled
                if (dbUser.enabled) {
                    console.log(`addMovie:: DB Search for user (${name}) => ${dbUser._id}`);

                    // add the given movie to the user's movie list
                    dbUser.movies.push(userAndMovieInfo.movie)

                    // save the user for the new movie
                    dbUser.save().then(savedUser => {
                        console.log(`Saved user for the new movie`)

                        const newMovie = savedUser.movies[savedUser.movies.length - 1]    // get the last movie added
                        userAndMovieInfo.movie.created = newMovie.created

                        res.status(statusOk).json({userAndMovieInfo: userAndMovieInfo})
                    })
                } else {
                    res.status(statusBadRequest).render('errorPage', {errorMessage: 'User not enabled. Please contact Admin'})
                }
            } else {
                res.status(statusBadRequest).json({message: 'user not found'})
            }
        });
    } else {
        console.log(`Either key is not provided or is unmatched...`)
        res.status(statusBadRequest).render('errorPage', {errorMessage: 'User unauthorized'})
    }
})

// remove a movie from the user's movie list
app.post("/remove-movie", (req, res) => {
    let userAndMovieInfo = req.body
    console.log(`Type of request: ${typeof (userAndMovieInfo)}`)
    console.log(`Removing movie to user using ${JSON.stringify(userAndMovieInfo)}`)

    const name = userAndMovieInfo.username
    const userKey = userAndMovieInfo.key

    // checking if the user key matches the server generated key
    if (doesUserKeyMatch(name, userKey)) {
        findUser(name).then((dbUser) => {
            // if user exists in DB
            if (dbUser) {
                // check if user is enabled
                if (dbUser.enabled) {
                    console.log(`removeMovie:: DB Search for user (${name}) => ${dbUser._id}`);

                    // remove the given movie from the user's movie list
                    dbUser.movies.pull({title: userAndMovieInfo.movie.title, posterPath: userAndMovieInfo.movie.posterPath})

                    dbUser.save().then(savedUser => {
                        console.log(`Saved user after deleting movie`)

                        res.status(statusOk).json({deleted: true})
                    })
                } else {
                    res.status(statusBadRequest).render('errorPage', {errorMessage: 'User not enabled. Please contact Admin'})
                }
            } else {
                res.status(statusBadRequest).json({message: 'User not found'})
            }
        });
    } else {
        console.log(`Either key is not provided or is unmatched...`)
        res.status(statusBadRequest).render('errorPage', {errorMessage: 'User unauthorized'})
    }
})

// render admin or non-admin page 
app.get('/user/:name/:key', (req, res) => {
    const name = req.params.name
    const userKey = req.params.key

    // checking if the user key matches the server generated key
    if (doesUserKeyMatch(name, userKey)) {
        findUser(name).then(dbUser => {
            // if user exists in DB
            if (dbUser) {
                // check if user is an admin
                if (isAdminUser(dbUser)) {
                    console.log(`retrieveUserData:: Found ADMIN user (${name}) => ${dbUser._id}`)

                    // render the admin page
                    res.status(statusOk).render('usersAll', {username: name})
                } else if (dbUser.enabled) {
                    console.log(`retrieveUserData:: Found non-admin user (${name}) => ${dbUser._id}`);

                    // render the user page
                    res.status(statusOk).render('user', {username: name})
                } else {
                    // render the error page
                    res.status(statusBadRequest).render('errorPage', {errorMessage: 'User not enabled. Please contact Admin'})
                }
            } else {
                res.status(statusBadRequest).json({message: 'User not found'})
            }
        });
    } else {
        console.log(`Either key is not provided or is unmatched...`)
        // render the error page
        res.status(statusBadRequest).render('errorPage', {errorMessage: 'User unauthorized'})
    }

})

// get the user movies from the DB
app.get('/movies/:name/:key', (req, res) => {
    const name = req.params.name
    const userKey = req.params.key

    // checking if the user key matches the server generated key
    if (doesUserKeyMatch(name, userKey)) {
        findUser(name).then((dbUser) => {
            if (dbUser) {
                if (dbUser.enabled) {
                    console.log(`retrieveUserData:: DB Search for user (${name}) => ${dbUser._id}`);

                    // create a list of movies to send to the client
                    let movies = []

                    // add the movies from the DB to the list
                    dbUser.movies.forEach(movie => {
                        console.log(`Adding movie for the user -> ${movie.title}`)
                        movies.push({title: movie.title,
                            language: movie.language,
                            releaseDate: new Date(movie.releaseDate).toISOString().slice(0,10),    // get only the date part
                            overview: movie.overview,
                            posterPath: movie.posterPath,
                            created: movie.created
                        })
                    })
                    res.status(statusOk).json({username: name, key: userKey, movies: movies})
                } else {
                    res.status(statusBadRequest).render('errorPage', {errorMessage: 'User not enabled. Please contact Admin'})
                }
            } else {
                res.status(statusBadRequest).json({message: 'User not found'})
            }
        });
    } else {
        console.log(`Either key is not provided or is unmatched...`)
        res.status(statusBadRequest).render('errorPage', {errorMessage: 'User unauthorized'})
    }

})

// get the search result for the movie
app.get('/movies/:title/:limit/:user/:key', (req, res) => {
    const name = req.params.user
    const userKey = req.params.key

    // checking if the user key does not match the server generated key
    if (!doesUserKeyMatch(name, userKey)) {
        console.log(`User=${name} with key=${userKey} does not match existing key for the user`)
        res.status(statusBadRequest).render('errorPage', {errorMessage: 'user unauthorized'})
    } else {
        console.log(`User (${name}) matches...`)
        if (!req.params.title) {
            res.json({message: 'Please enter Song Title'})
            return
        }

        findUser(name).then((dbUser) => {
            if (dbUser) {
                if (dbUser.enabled) {
                    const title = req.params.title.trim().replace(/\s/g, '+')   // replace all spaces with "+" sign
                    const searchResultsLimit = req.params.limit
                    console.log(`Invoking [${movieSearchUrl}${title}] for finding movies...`)
                    console.log(`Results will be limited to ${searchResultsLimit} movies`)

                    const movies = (title) => {
                        // using fetch to get the data from the TMDB API
                        fetch(`${movieSearchUrl}${title}`)
                            .then(response => response.json())
                            .then(data => {
                                let movies = []

                                // add the movies to the list
                                data.results.forEach( (movie, index) => {
                                    if (index < searchResultsLimit) {
                                        const movieObj = {title: movie.original_title,
                                            id: movie.id,
                                            language: movie.original_language,
                                            releaseDate: movie.release_date,
                                            overview: movie.overview,
                                            posterPath: movie.poster_path};

                                        movies.push(movieObj)
                                        console.log(`Added movie: ${movieObj.title}...`)
                                    }
                                })

                                return movies
                            })
                            .then(movies => {
                                console.log(`Trying to return the result by rendering movies...`)
                                res.status(statusOk).json(movies)
                            })
                    }

                    movies(title)
                } else {
                    res.status(statusBadRequest).render('errorPage', {errorMessage: 'User not enabled. Please contact Admin'})
                }
            } else {
                res.status(statusBadRequest).json({message: 'User not found'})
            }
        });
    }
})

// endpoint to get all the non-admin users for the admin page
app.get('/users/:name/:key', (req, res) => {
    const name = req.params.name
    const userKey = req.params.key

    if (doesUserKeyMatch(name, userKey)) {
        findUser(name).then(dbUser => {
            // if the user is found in the DB and is an admin user
            if (dbUser && isAdminUser(dbUser)) {
                let users = []

                // get all non-admin users from the DB and populate the users array
                getAllNonAdminUsers(adminUser).then(result => {
                    console.log(`DB result for ${name} -> ${result}`)
                    result.forEach(nonAdminUser => {
                        let createdDate = ''
                        if (nonAdminUser.created) {
                            createdDate = new Date(nonAdminUser.created).toISOString().slice(0,10)
                        }

                        let lastLoginTime = '';
                        if (nonAdminUser.lastLoginTime) {
                            const dbLastLoginTime = new Date(nonAdminUser.lastLoginTime).toISOString()
                            lastLoginTime = dbLastLoginTime.slice(0,10) + " " + dbLastLoginTime.slice(11,19);
                        }

                        users.push({
                            username: nonAdminUser.username,
                            createdDate: createdDate,
                            lastLoginTime: lastLoginTime,
                            enabled: nonAdminUser.enabled
                        })
                    })

                    res.status(statusOk).json({users: users})
                })

            } else {
                res.status(statusBadRequest).json({message: 'user not found'})
            }
        });
    } else {
        console.log(`Either key is not provided or is unmatched...`)
        res.status(statusBadRequest).render('errorPage', {errorMessage: 'user unauthorized'})
    }

})

// endpoint to enable or disable a user
app.post("/toggle-user-enabled", (req, res) => {
    let userInfo = req.body
    console.log(`Type of request: ${typeof (userInfo)}`)
    console.log(`Enabling or disabling user ${JSON.stringify(userInfo)}`)

    const name = userInfo.username
    const userKey = userInfo.key

    if (doesUserKeyMatch(name, userKey)) {
        findUser(name).then(dbUser => {
            // if the user is found in the DB and is an admin user
            if (isAdminUser(dbUser)) {
                findUser(userInfo.userToUpdate).then(dbUserToUpdate => {
                    if (dbUserToUpdate) {
                        // Update user for either enabling or disabling
                        // Using not of current enabled value that will make it disable if enabled or enable if currently disabled
                        const currentEnable = dbUserToUpdate.enabled
                        dbUserToUpdate.enabled = !dbUserToUpdate.enabled
                        dbUserToUpdate.save().then(savedUser => {
                            console.log(`Updated user. old enable=${currentEnable}, new enable=${savedUser.enabled}`)
                            res.status(statusOk).json({newEnable: savedUser.enabled})
                        })
                    } else {
                        res.status(statusBadRequest).json({message: 'user not found'})
                    }
                })
            } else {
                res.status(statusBadRequest).render('errorPage', {errorMessage: 'Unauthorized access to list users'})
            }
        });

    } else {
        console.log(`Either key is not provided or is unmatched...`)
        res.status(statusBadRequest).render('errorPage', {errorMessage: 'user unauthorized'})
    }
})

/*
  =================
  Start the server
  =================
 */

app.listen(port, err => {
    if(err) {
        console.log(err)
    } else {
        console.log(`Server listening on port: ${port}`)
        console.log(`To Test:`)
        console.log(`http://localhost:${port}`)
    }
})

