const alphaCharactersAllowed = '~!@#?$%^&*-_'
const reSpecialChars = /[~!@#?$%^&*\-_]/
const reUpperChars = /[A-Z]/
const reLowerChars = /[a-z]/
const reNumber = /[0-9]/

// This method checks if the given password is valid
function isPasswordValid(password) {
    let isValid = true
    console.log(`Validating password (${password})...`)
    if (password && password.length >= 8) {
        if (!reSpecialChars.test(password)) {
            console.log(`password does NOT contain special character`)
            isValid = false
            setupErrorField(`Password must contain at least one special char from ${alphaCharactersAllowed}`)
        }
        if (!reUpperChars.test(password)) {
            console.log(`password does NOT contain uppercase char`)
            isValid = false
            setupErrorField(`Password must contain at least one uppercase character`)
        }
        if (!reLowerChars.test(password)) {
            console.log(`password does NOT contain lowercase char`)
            isValid = false
            setupErrorField(`Password must contain at least one lowercase character`)
        }
        if (!reNumber.test(password)) {
            console.log(`password does NOT contain number`)
            isValid = false
            setupErrorField(`Password must contain at least one number`)
        }
    } else {
        console.log(`password does NOT match minimum length`)
        isValid = false
        setupErrorField('Password minimum length is 8')
    }

    return isValid
}

// This method handles the server error by displaying it in the erorr field
function handleSignupServerError(result, status, error) {
    console.log(typeof (result))
    console.log(`ERROR:: - status=${status}, error=${error},\n JSON Response from the server: ${JSON.stringify(result)}`)

    const res = result.responseJSON
    console.log(`responseText=${JSON.stringify(res)}`)
    if (res && res.message) {
        let errorField = getErrorField()
        errorField.innerText = res.message
        if (res.error) {
            errorField.innerText += '<br>' + res.error
        }

        errorField.style.visibility = 'visible'
    }
}

function validateUsername(username) {
    let isValid = true
    if (!username || username.length < 8) {
        console.log(`username (${username}) is NOT valid. Setting error field`)
        isValid = false
        setupErrorField('Username minimum length is 8')
    } else {
        console.log(`username (${username}) is valid. Resetting error field`)
        resetErrorField()
    }

    return isValid
}

function showCreateNewAccount() {
    console.log('Retrieving create new Account page...')
    location.href = `${getSignUpPath}`
}

// This method validates the username and password to be non-empty and calls the server to log in the user
function loginUser(){
    console.log("Validating the user for login")
    let username = document.getElementById("username").value
    let password = document.getElementById("password").value

    let isValid = true
    if (!username) {
        console.log(`username (${username}) is empty. Setting error field`)
        isValid = false
        setupErrorField('Username is required')
    } else {
        console.log(`username (${username}) is provided. Resetting error field`)
        resetErrorField()
    }

    if (!password) {
        console.log(`password (${password}) is empty. Setting error field`)
        isValid = false
        setupErrorField('Password is required')
    } else {
        console.log(`password (${password}) is provided.`)
    }

    if (isValid) {
        let userInfo = {'username' : username, 'password' : password};

        // Call the server to login the user
        $.ajax({
            type: 'POST',
            url: `${postLoginPath}`,
            contentType: 'application/json',
            data: JSON.stringify(userInfo),
            success: function (result, status) {
                console.log(`LOGIN: response=${JSON.stringify(result)}`)
                const serverKey = result.key
                storeUser(username, serverKey)
                location.href = `${getUserPath}/${username}/${serverKey}`
            },
            error: handleSignupServerError
        })
    }
}

// This method validates the username and password and calls the server to create a new user
function createUser(){
    console.log("Creating new user")
    let username = document.getElementById("username").value
    let password = document.getElementById("password").value
    let confirmPassword = document.getElementById("reEnterPassword").value

    let isValid = validateUsername(username)

    if (!isPasswordValid(password)) {
        console.log(`password (${password}) is NOT valid. Setting error field`)
        isValid = false
    }

    if (password !== confirmPassword) {
        isValid = false
        setupErrorField('Passwords should match')
    }

    if (isValid) {
        resetErrorField()

        const userInfo = {'username' : username, 'password' : password}
        console.log(`Creating user with: ${JSON.stringify(userInfo)}`)

        // cal the server to create a new user
        $.ajax({
            type: 'POST',
            url: `${postCreateAccountPath}`,
            contentType: 'application/json',
            data: JSON.stringify(userInfo),
            dataType: 'json',
            success: function (result, status) {
                // console.log(typeof(result))
                console.log(`Response from the server -> status: ${status}, result: ${JSON.stringify(result)}`)

                storeUser(username, result.key)
                // console.log(`Server key=${result.key}`)
                location.href = `${getUserPath}/${username}/${result.key}`
            },
            error: handleSignupServerError
        })
    }

}
