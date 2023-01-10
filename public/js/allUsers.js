function loadAllUsersData() {
    getAllUsers()

    document.getElementById('signOut').addEventListener('click', signOut)
}

// This method gets all users from the server and displays them in the table
function getAllUsers() {
    const user = getUser()

    // call the server to get all users
    $.ajax({
        type: 'GET',
        url: `${getAllUsersPath}/${user.name}/${user.key}`,
        success: function (result, status) {
            console.log(`Response from the server (for getting all users) -> status: ${status}, result: ${JSON.stringify(result)}`)

            if (!result.users || result.users.length === 0) {
                // display no users found
                $(".all-users-body")
                    .append("<tr><td colspan='5' align='center'>No users found</td></tr>")
            } else {
                $(".all-users-body").html('')  // empty out the table

                // show all users
                result.users.forEach( (user, index) => {
                    allUsers.set(`${user.username}`, user)

                    const buttonId = `enable-disable-btn-${index}`
                    const enabledId = `enable-disable-id-${index}`
                    let buttonValue = 'Disable'
                    if (!user.enabled) {
                        buttonValue = 'Enable'
                    }
                    console.log(`Adding user(${index}) - ${user.username}`)

                    // add the user row to the table
                    $(".all-users-body")
                        .append(getUserRow(user, index, buttonId, buttonValue, enabledId))

                    // Add listener for the newly added button to enable or disable the user
                    document.getElementById(`${buttonId}`).addEventListener('click', () => {
                        enableOrDisableUser(user, index, buttonId, enabledId)
                    })
                })
            }

        },
        error: handleSignupServerError
    })
}

// This method returns a new row for the given user
function getUserRow(user, rowIndex, buttonId, buttonValue, enabledId) {
    return `<tr class="user-row" id="user-${rowIndex}">
        ${addColumn(user.username)}
        ${addColumn(user.createdDate)}
        ${addColumn(user.lastLoginTime)}
        ${getEnabledOrDisabledColumn(enabledId, user.enabled)}
        ${addColumn(getEnabledOrDisabledButton(buttonId, buttonValue))}
        </tr>`;
}

function addColumn(elem) {
    return `<td>${elem}</td>`;
}

function getEnabledOrDisabledColumn(id, value) {
    return `<td id="${id}">${value}</td>`
}

function getEnabledOrDisabledButton(buttonId, buttonValue) {
    return `<button id="${buttonId}">${buttonValue}</button>`
}

// This method enables or disables the given user and also the text of the button and the enabled column
function enableOrDisableUser(user, rowIndex, buttonId, enabledId) {
    let enableOrDisable = 'Enable'
    if (user.enabled) {
        enableOrDisable = 'Disable'
    }
    console.log(`${enableOrDisable} user => username=${user.username}, current enable=${user.enabled} <- (row=${rowIndex})`);

    const sessionUser = getUser()

    // send not of current enabled value that will make it disable if enabled or enable if currently disabled
    const userInfo = {'username' : sessionUser.name, 'key' : sessionUser.key, userToUpdate: user.username}
    $.ajax({
        type: 'POST',
        url: `${postToggleUserEnabledPath}`,
        contentType: 'application/json',
        data: JSON.stringify(userInfo),
        dataType: 'json',
        success: function (result, status) {
            let userFromMap = allUsers.get(user.username)
            userFromMap.enabled = result.newEnable

            console.log(`Response from the server -> status: ${status}, result: ${JSON.stringify(result)}`)
            allUsers.set(user.username, userFromMap)

            // Change the column enabled to reflect current enabled state of this user
            $("#" + enabledId).html(result.newEnable.toString())

            // Change the button text to reflect opposite enabled state of this user
            // if user is enabled, button will show Disable and if user is disabled, button will show Enable
            let newState = 'Disabled'
            if (!result.newEnable) {
                newState = 'Enable'
            }
            $("#" + buttonId).html(newState)
        },
        error: handleSignupServerError
    })
}

