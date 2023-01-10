# Overview
This project is a Movie favorites application that allows following features:
* a user to
    * sign-up with the application
    * log in to the application
* User can search for movies
* User can add a movie to their favorites list
* User can delete a movie from their favorites list
* Admin user can view all the users and
    * can enable or disable a user

All the users and their favorite movies are stored in the database, which provides a persistence storage.

The technology stack used for this application is:
* Nodejs
* Mongo DB
* Templating system
    * pug
* Mongoose


# Instructions to setup MovieZilla
To setup this application, please run following commands:
* `npm install`
* Setup admin user in the database by running following command:
    * `node db/init/db-init.js`
* Start the server by running following command:
    * `node server.js`
* Open the browser and go to:
    * http://localhost:3000

* To use the system as a non-admin user, follow these steps:
```
    sign up a user by clicking on the sign up link
    Once inside the application, search for any movie and add or delete movies from the favorites list 
```

* To use the system as a admin user, follow these steps:
    * username: `movie-adm`
    * password: `Mad-$$98-min`
