document.addEventListener('DOMContentLoaded', function() {
  //This is called after the browser has loaded the web page

  //add listener for "Sign Up" button
  document.getElementById('signUp').addEventListener('click', createUser)

  // add listener for "enter" key
  document.addEventListener('keyup', () => handleKeyUp(event, 'signUp') )
})
