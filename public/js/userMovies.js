function loadUserData() {
    getFavoriteMovies()

    // add the listener for the search and sign out buttons
    document.getElementById('search').addEventListener('click', searchMovie)
    document.getElementById('signOut').addEventListener('click', signOut)

    // Add listener for default button
    document.addEventListener('keyup', () => handleKeyUp(event, 'search') )
}

// This method gets the user's favorite movies from the server
function getFavoriteMovies() {
    const user = getUser()

    // call the server to get all movies for the user
    $.ajax({
        type: 'GET',
        url: `${getMoviesPath}/${user.name}/${user.key}`,
        success: function (result, status) {
            console.log(`Response from the server (for getting all movies) -> status: ${status}, result: ${JSON.stringify(result)}`)

            if (!result.movies || result.movies.length === 0) {
                $(".movieListContainer").css('visibility', 'collapse').css('height', 'auto')
            } else {

                let movieListContainerHeight = 'auto'
                if (result.movies.length > 5) {
                    // enable the scroll bar for the table
                    movieListContainerHeight = '300px'
                }

                // make the div containing the movie table visible and set its height
                $(".movieListContainer").css('visibility', 'visible').css('height', movieListContainerHeight);
                $(".fav-movies-body").html('')  // empty out the table

                // show movie results
                result.movies.forEach( (movie, index) => {
                    favMovies.set(`${movie.title}-${movie.posterPath}`, true)

                    const overviewId = `fav-overview-${index}`
                    const buttonId = `fav-delete-btn-${index}`
                    const buttonValue = ' - '
                    const movieImage = getMovieImageElement(movie, index)
                    console.log(`Adding movie(${index}) for FAVS - ${movie.title}`)

                    // add the movie row to the table
                    $(".fav-movies-body")
                        .append(getMovieRow(movie, index, movieImage, buttonId, buttonValue, overviewId))

                    // Add listener for the newly added button
                    $(`#${buttonId}`).click( () => {
                        removeMovieFromFavorites(movie, index)
                    })
                })
            }

        },
        error: handleSignupServerError
    })
}

// This method calls the server to search the movie by title and displays the results
function searchMovie() {
    let movieTitle = document.getElementById("searchMovie").value

    if (movieTitle) {
        console.log(`Searching movies by title "${movieTitle}"`)

        const user = getUser()

        // call the server to search the movie
        $.ajax({
            type: 'GET',
            url: `${getMoviesPath}/${movieTitle}/${searchMovieResultLimit}/${user.name}/${user.key}`,
            success: function (result, status) {
                console.log(`Response from the server -> status: ${status}, result: ${result}`)

                if (result.length === 0) {
                    setupErrorField(`No movies found for title "${movieTitle}"`)

                    // hide the div containing the movie table, since there are no movies to show
                    $(".movieSearchResultContainer").css('visibility', 'collapse');
                    $(".movies-body").html('')  // empty out the table
                } else {
                    resetErrorField()

                    $(".movieSearchResultContainer").css('visibility', 'visible');
                    $(".movies-body").html('')  // empty out the table

                    // // show movie results and make it visible
                    result.forEach( (movie, index) => {
                        const overviewId = `fav-overview-${index}`
                        const buttonId = `fav-add-btn-${index}`
                        const buttonValue = ' + '
                        const movieImage = getMovieImageElement(movie, index)
                        console.log(`Adding movie(${index}) - ${movie.title}`)

                        // adding the movie row to the table
                        $(".movies-body")
                            .append(getMovieRow(movie, index, movieImage, buttonId, buttonValue, overviewId))

                        // Add listener for the newly added button
                        $(`#${buttonId}`).click( () => {
                            addMovieToFavorites(movie, index, movieImage)
                        })
                    })
                }

            },
            error: handleSignupServerError
        })
    }
}

// This method returns a new row for the given movie
function getMovieRow(movie, rowIndex, movieImage, buttonId, buttonValue, overviewId) {
    let movieLanguage = movie.language
    if (!movieLanguage) {
        movieLanguage = 'en'
    }
    return `<tr class="movie-row" id="movie-${rowIndex}">
        ${addColumn(movie.title)}
        ${addColumn(movieLanguage)}
        ${addColumn(movie.releaseDate)}
        ${addOverviewColumn(overviewId, movie.overview)}
        ${addColumn(movieImage)}
        ${addColumn(getAddButton(buttonId, buttonValue))}
        </tr>`;
}

function addOverviewColumn(overviewId, value) {
    let overview = value

    if (overview) {

        // truncate the overview to 80 characters
        if (overview.length > 80) {
            overview = overview.substring(0, 80) + "...";
        }

        // add a span element to show the full overview when the user hovers over the overview
        return `<td id="${overviewId}">${overview}<span class="movie-details">${value}</span></td>`;
    }
    return `<td>${value}</td>`;
}

function addColumn(elem) {
    return `<td>${elem}</td>`;
}

function getMovieImageElement(movie, index) {
    // if the movie has a poster image, then return the image element using the poster path
    if (movie.posterPath) {
        const imageUrl = movieBigImageUrl + movie.posterPath;
        return `<img 
                    id="movie-img-${index}"
                    class="movie-thumbnail"
                    src="` + imageUrl
            + `" alt="${movie.title} poster image">`
    }
    return ""
}

function getAddButton(buttonId, buttonValue) {
    return `<button id="${buttonId}">${buttonValue}</button>`
}

function addMovieToFavorites(movie, rowIndex, movieImage) {
    const alreadyInFavorites = favMovies.get(`${movie.title}-${movie.posterPath}`)

    // if the movie is already in the favorites, then do nothing
    if (alreadyInFavorites) {
        console.log(`Movie already in favorites => title=${movie.title}, poster=${movie.posterPath} <- (row=${rowIndex})`);
    } else {
        console.log(`ADD MOVIE TO FAVS:: Clicked for => title=${movie.title}, poster=${movie.posterPath} <- (row=${rowIndex})`);
        const user = getUser()
        const userInfo = {'username' : user.name, 'key' : user.key, movie: movie}

        // call the server to add the movie for the user in the database
        $.ajax({
            type: 'POST',
            url: `${postAddMoviePath}`,
            contentType: 'application/json',
            data: JSON.stringify(userInfo),
            dataType: 'json',
            success: function (result, status) {
                // console.log(typeof(result))
                console.log(`Response from the server -> status: ${status}, result: ${JSON.stringify(result)}`)

                // refresh the table for the favorite movies
                getFavoriteMovies()
            },
            error: handleSignupServerError
        })
    }
}

function removeMovieFromFavorites(movie, rowIndex) {
    console.log(`REMOVE MOVIE FROM FAVS:: Clicked for => title=${movie.title}, poster=${movie.posterPath} <- (row=${rowIndex})`)

    const user = getUser()
    const userInfo = {'username' : user.name, 'key' : user.key, movie: movie}

    // call the server to remove the movie for the user in the database
    $.ajax({
        type: 'POST',
        url: `${postRemoveMoviePath}`,
        contentType: 'application/json',
        data: JSON.stringify(userInfo),
        dataType: 'json',
        success: function (result, status) {
            favMovies.delete(`${movie.title}-${movie.posterPath}`)

            console.log(`Response from the server -> status: ${status}, result: ${JSON.stringify(result)}`)

            // refresh the table for the favorite movies
            getFavoriteMovies()
        },
        error: handleSignupServerError
    })
}

