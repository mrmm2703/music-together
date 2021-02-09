// SPOTIFY API FUNCTIONS

// Search Spotify with a search query
function searchSpotify(query) {
    $.ajax({
        url: "https://api.spotify.com/v1/search" +
            "?type=album,artist,track,playlist"  +
            "&limit=8" +
            "&q=" + query,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + accessToken
        },
        success: function(result) {
            searchSpotifyResponse(result)
        },
        error: function(error) {
            alert("An error occured while searching.")
            console.log(error)
        }
    })
}

// Play a track
function spotifyPlay(track, context=null, position=null, showPopup=false) {
    console.log("SPOTIFY PLAY:")
    console.log("TRACK: " + track)
    console.log("CONTEXT: " + context)


    if (context != null) {
        let bodyData
        if (context.substring(8,14) == "artist") {
            bodyData = JSON.stringify({
                "context_uri": context,

            })
        }
        if (position != null) {
            bodyData = JSON.stringify({
                "context_uri": context,
                "offset": {"uri": track},
                "position_ms": position
            })
        } else {
            bodyData = JSON.stringify({
                "context_uri": context,
                "offset": {"uri": track}
            })
        }
        $.ajax({
            url: "https://api.spotify.com/v1/me/player/play?device_id="+deviceId,
            data: bodyData,
            type: "PUT",
            headers: {
                "Authorization": "Bearer " + accessToken
            },
            success: function(result) {
                console.log("PLAY REQUEST SUCCESSFUL")
                if (showPopup) {
                    makePopup("Playing song")
                }
            },
            error: function(error) {
                console.error("PLAY RESULT FAILED:")
                console.error(error)
                if (showPopup) {
                    makePopup("Could not play song", true)
                }
            }
        })
    } else {
        let bodyData
        if (position != null) {
            bodyData = JSON.stringify({
                "uris": [track],
                "position_ms": position
            })
        } else {
            bodyData = JSON.stringify({
                "uris": [track]
            })
        }
        $.ajax({
            url: "https://api.spotify.com/v1/me/player/play?device_id="+deviceId,
            data: bodyData,
            type: "PUT",
            headers: {
                "Authorization": "Bearer " + accessToken
            },
            success: function(result) {
                console.log("PLAY REQUEST SUCCESSFUL")
                if (showPopup) {
                    makePopup("Playing song")
                }
            },
            error: function(error) {
                console.error("PLAY RESULT FAILED:")
                console.error(error)
                if (showPopup) {
                    makePopup("Could not play song", true)
                }
            }
        })
    }
}

// Play an album
function spotifyPlayPlaylistAlbum(x, showPopup=false) {
    $.ajax({
        url: "https://api.spotify.com/v1/me/player/play?device_id="+deviceId,
        data: JSON.stringify({
            "context_uri": x,
            "offset": {"position": 0}
        }),
        type: "PUT",
        headers: {
            "Authorization": "Bearer " + accessToken
        },
        success: function(result) {
            console.log("PLAY REQUEST SUCCESSFUL")
            if (showPopup) {
                makePopup("Playing successfully")
            }
        },
        error: function(error) {
            console.error("PLAY RESULT FAILED:")
            console.error(error)
            makePopup("Couldn't play", true)
        }
    })
}

// Add a song to the user's queue
function addToSpotifyQueue(uri, showMessage=false) {
    let ret = false;
    console.log(uri)
    console.log("addToSpotifyQueue")
    console.log("https://api.spotify.com/v1/me/player/queue?uri=" +
            uri + "&device_id=" + deviceId)
    console.log("Bearer " + accessToken)
    $.ajax({
        url: "https://api.spotify.com/v1/me/player/queue?uri=" +
            uri + "&device_id=" + deviceId,
        type: "POST",
        headers: {
            "Authorization": "Bearer " + accessToken
        },
        success: function(result) {
            console.log("ADD TO QUEUE SUCCESSFUL")
            console.log(result)
            if (showMessage) {
                makePopup("Added to queue")
            }
        },
        error: function(error) {
            console.error("ADD TO QUEUE FAILED:")
            console.error(error)
            if (showMessage) {
                makePopup("Could not add to queue", true)
            }
        }
    })
}

// Check if a song is liked by the user
function checkLiked(songId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "https://api.spotify.com/v1/me/tracks/contains?ids=" + songId,
            type: "GET",
            headers: {
                "Authorization": "Bearer " + accessToken
            },
            success: function(result) {
                resolve(result[0])
            },
            error: function(error) {
                console.error("CHECK LIKED FAILED")
                console.error(error)
                makePopup("Error while getting saved tracks", true)
                reject()
            }
        })
    })
}

// Get a user's playlists
function getPlaylists() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "https://api.spotify.com/v1/me/playlists",
            type: "GET",
            headers: {
                "Authorization": "Bearer " + accessToken
            },
            success: function(result) {
                resolve(result)
            },
            error: function(error) {
                console.error("GET PLAYLISTS FAIELD")
                console.error(error)
                makePopup("Error while getting playlists", true)
                reject()
            }
        })
    })
}

// Add to playlist
function addToPlaylist(songId, playlistId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url:"https://api.spotify.com/v1/playlists/" + playlistId + "/tracks?uris=spotify:track:" + songId,
            type: "POST",
            headers: {
                "Authorization": "Bearer " + accessToken
            },
            success: function(result) {
                resolve(result)
            },
            error: function(error) {
                console.error("ADD TO PLAYYLIST FAILED")
                console.error(error)
                reject(error)
            }
        })
    })
}