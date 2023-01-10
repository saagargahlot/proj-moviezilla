
document.addEventListener('DOMContentLoaded', function() {
  //This is called after the browser has loaded the web page

  //add listener for "Sign In" button
  document.getElementById('signIn').addEventListener('click', loginUser)

  //add listener to "create new account" button
  document.getElementById('createNewAccount').addEventListener('click', showCreateNewAccount)

  // add listener for "enter" key
  document.addEventListener('keyup', () => handleKeyUp(event, 'signIn') )
})
