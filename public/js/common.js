const serverPort = 3000
const serverBaseUrl = `http://localhost:${serverPort}`
const movieSmallImageUrl = 'https://image.tmdb.org/t/p/w92/'
const movieBigImageUrl = 'https://image.tmdb.org/t/p/w185/'
const searchMovieResultLimit = 10
const getLoginPath = '/'
const getSignUpPath = '/sign-up'
const getUserPath = '/user'
const getMoviesPath = '/movies'
const getAllUsersPath = '/users'
const postLoginPath = '/login'
const postCreateAccountPath = '/create-account'
const postAddMoviePath = '/add-movie'
const postRemoveMoviePath = '/remove-movie'
const postToggleUserEnabledPath = '/toggle-user-enabled'
const sessionCurrentUserKey = 'currentUser'


const ENTER=13

let favMovies = new Map()
let allUsers = new Map()

function handleKeyUp(event, buttonId) {
    event.preventDefault()

    if (event.keyCode === ENTER) {
        document.getElementById(buttonId).click()
    }
}

// This function is also used to signIn (or sending a user to signIn page)
function signOut() {
    favMovies.clear()   // clear out the movies map
    allUsers.clear()    // clear out all users map

    clearSession()

    location.href = getLoginPath
}

function storeUser(username, serverInfo) {
    console.log(`Saving user in session: (user=${username}, key=${serverInfo})`)
    let users = []
    const user = {
        name: username,
        key: serverInfo
    }
    users.push(user)

    // store the given user in session
    sessionStorage.setItem(sessionCurrentUserKey, JSON.stringify(user))
}

function clearSession() {
    sessionStorage.clear()
}

function getUser() {
    const userJson = sessionStorage.getItem(sessionCurrentUserKey)
    const user = JSON.parse(userJson)
    console.log(`Retrieving user from session: (user=${user.name}, key=${user.key})`)
    return user
}

function getErrorField() {
    return document.getElementById('error')
}

// setting up the error field with the given error text
function setupErrorField(errorText) {
    let errorField = getErrorField()

    let newLi = document.createElement('li')
    newLi.innerHTML = errorText
    errorField.appendChild(newLi);

    errorField.style.visibility = 'visible'
}

function resetErrorField() {
    let errorField = getErrorField()
    errorField.innerHTML = ''
    errorField.style.visibility = 'hidden'
}
