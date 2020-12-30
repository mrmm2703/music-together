// Some HTML elements
const message_input = document.getElementById("messages-input")

// Send a joinedGroup message to the Node.js server
$(document).ready(function() {
})

// SERVER EVENT LISTENERS

function initSocketListeners() {
    // Event handler when received usersInGroup message
    socket.on("usersInGroup", (data) => {
        console.log("usersInGroup:")
        for (const user in data["users"]) {
            console.log(user)
            addUser(user, data["users"][user]["name"], data["users"][user]["prof_pic"])
        }
    })

    // When a new user joins
    socket.on("newUser", (data) => {
        console.log("newUser: " + data)
        addUser(data.id, data.name, data.prof_pic)
        addMessage(data.id, "Joined the group", true)
    })

    // When a user leaves
    socket.on("userLeft", (data) => {
        console.log("userLeft: " + data)
        addMessage(data, "Left the group", true)
        removeUser(data)
    })

    // When client sends a banned word
    socket.on("messageBanned", (word) => {
        alert(`The message you sent is banned for containing the word "${word}"`)
    })

    // When a new message is received
    socket.on("newMessage", (data) => {
        addMessage(data.id, data.message, false)
    })

    // When a user is typing
    socket.on("typing", (data) => {
        userTyping(data)
    })

    // When a user changes the song
    socket.on("changeSong", (data) => {
        spotifyPlay(data.uri, data.context)
        setTimeout(() => {
            if (data.paused) {
                playbackPause()
            } else {
                playbackResume()
            }
            addSongChangeMessage(data.id)
        }, 500);
    })

    // When a pause message is received from the server
    socket.on("pause", (id) => {
        playbackPause()
        addMessage(id, "Paused playback", true)
    })

    // When a resume message is received from the server
    socket.on("resume", (id) => {
        playbackResume()
        addMessage(id, "Resumed playback", true)
    })

    // When another user wants to know where the group is at
    socket.on("whereAreWe", (socketId) => {
        spotifyPlayer.getCurrentState().then(state => {
            if (!state) {
                console.error("No music playing.")
                return
            }
            currentTrack = state.track_window.current_track.uri
            socket.emit("weAreHere", {
                uri: state.track_window.current_track.uri,
                context: state.context.uri,
                position: state.position,
                paused: state.paused,
                socketId: socketId
            })
        })
    })

    // Response from whereAreWe
    socket.on("weAreHere", (data) => {
        // So the state event listener does not trigger an emit
        currentTrack = data.uri
        spotifyPlay(data.uri, data.context, data.position)

        setTimeout(() => {
            updatePlayer()
            if (data.paused) {
                playbackPause()
            } else (
                playbackResume()
            )
        }, 1500);
    })

    // When a request to add to queue is received
    socket.on("addToQueue", (data) => {
        addToSpotifyQueue(data.uri)
        addMessage(data.id, "Added " + data.name + " by " + data.artist + " to the queue", true)
    })
}

// CLIENT EVENT LISTENERS

const dummySearch = document.getElementById("dummy-search")
const actualSearch = document.getElementById("search-input-input")
var searchQuery = ""
const screenBlock = $(".screen-block") 
const searchOverlay = $(".search-overlay")

// When a user presses a key in the message input
document.getElementById("messages-input").addEventListener("keyup", function(e) {
    // When enter key is pressed
    if (e.keyCode === 13) {
        e.preventDefault()
        socket.emit("message", message_input.value)
        message_input.value = ""
    } else { // When any other is pressed
        socket.emit("typing")
    }
})

// Player search input event
dummySearch.addEventListener("keyup", function(e) {
    // When enter key is pressed
    if (e.keyCode === 13) {
        e.preventDefault()
        searchQuery = dummySearch.value;
        actualSearch.value = searchQuery;
        fadeInSearch()
        setTimeout(() => {
            dummySearch.value = ""
        }, 500);
        searchSpotify(searchQuery)
    }
})

// When enter is pressed on the dummy search box
actualSearch.addEventListener("keyup", function(e) {
    if (e.keyCode === 13) {
        e.preventDefault()
        searchQuery = actualSearch.value
        searchSpotify(searchQuery)
    }
})

// When screen block is pressed
screenBlock.click(function() {
    fadeOutSearch()
})

// PLAYER UI FUNCTIONS

// Fade in search overlay
function fadeInSearch() {
    screenBlock.css("display", "block")
    screenBlock.animate({opacity: 1}, 250)
    searchOverlay.css("display", "grid")
    searchOverlay.animate({opacity: 1}, 250)
}

// Fade out search overlay
function fadeOutSearch() {
    screenBlock.animate({opacity: 0}, 250)
    searchOverlay.animate({opacity: 0}, 250)
    setTimeout(() => {
        screenBlock.css("display", "none")
        searchOverlay.css("display", "none")
    }, 250);
}

// Add a message in the message panel when song changes
function addSongChangeMessage(personId) {
    console.log("ADD SONG CHANGE MESSAGE")
    spotifyPlayer.getCurrentState().then(state => {
        if (!state) {
            console.error("No music playing.")
            return
        }
        addMessage(personId, "Now playing " + state.track_window.current_track.name, true)
    })
}

// UTILITY FUNCTIONS

// Convert milliseconds into seconds
function msToMinutesSeconds(ms) {
    let seconds = ms / 1000
    let min = Math.floor(ms / 60)
    let sec = Math.floor(seconds - min)
    return min.toString() + ":" + sec.toString().padStart(2, "0")
}

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

// Handle a search query result
function searchSpotifyResponse(result) {
    console.log(result)
    addSongsResults(result["tracks"])
    addArtistResults(result["artists"])
    addAlbumsResults(result["albums"])
    addPlaylistsResults(result["playlists"])
    // Add the event handlers everytime a new set of search results is made
    $(".search-item-image-container").hover(
        function() {
            console.log($(this).data("id"))
            $(".search-item-fan[data-id='" + $(this).data("id") + "']").stop(true, true);
            $(".search-item-fan[data-id='" + $(this).data("id") + "']")
                .animate({
                    width: "18em",
                    paddingLeft: "4em",
                    paddingRight: "1em"
                }, 150)
            $(".search-item-text-container[data-id='" + $(this).data("id") + "']").stop(true, true)
            $(".search-item-text-container[data-id='" + $(this).data("id") + "']")
                .animate({
                    marginLeft: "-4em",
                    opacity: 0
                }, 150)
        }, function() {
            $(".search-item-fan[data-id='" + $(this).data("id") + "']").stop(true, true);
            $(".search-item-fan[data-id='" + $(this).data("id") + "']")
                .animate({
                    width: "0",
                    paddingLeft: "0",
                    paddingRight: "0"
                }, 150)
            $(".search-item-text-container[data-id='" + $(this).data("id") + "']").stop(true, true)
            $(".search-item-text-container[data-id='" + $(this).data("id") + "']")
                .animate({
                    marginLeft: "1.6vw",
                    opacity: 1
                }, 150)
        }
    )
    // Add click listeners to the play buttons in search
    $(".search-item-play").click(function() {
        socket.emit("makeMeHost")
        if ($(this).data("type") == "song") {
            spotifyPlay("spotify:track:"+$(this).data("id"), "spotify:album:"+$(this).data("extra"))
        } else if ($(this).data("type") == "playlist") {
            spotifyPlayPlaylistAlbum("spotify:playlist:"+$(this).data("id"))
        } else if ($(this).data("type") == "artist") {
            spotifyPlayArtist("spotify:artist:"+$(this).data("id"))
        } else if ($(this).data("type") == "album") {
            spotifyPlayPlaylistAlbum("spotify:album:"+$(this).data("id"))
        }
        setTimeout(() => {
            changedSong()
            updatePlayer()
            addSongChangeMessage(user_id)
        }, 500);
    })
    // Add to queue button handler
    $(".search-item-queue").click(function() {
        // Extract song information using HTML elements contents
        let songUri = "spotify:track:"+$(this).data("id")
        let songName = $(".search-item-name[data-id='"+$(this).data("id")+"']").html()
        let songArtist = $(".search-item-artist[data-id='"+$(this).data("id")+"']").html()
        let songImage =  $(".search-item-image[data-id='"+$(this).data("id")+"']").attr("src")
        // Add to queue and send to other clients
        addToSpotifyQueue(songUri)
        socket.emit("addToQueue", {
            uri: songUri,
            name: songName,
            artist: songArtist,
            image: songImage
        })
        addMessage(user_id, "Added " + songName + " by " + songArtist + " to the queue.", true)
    })
    // Initialise the slide-out fans in the unhidden state
    $(".search-item-fan").css("width", "0")
    $(".search-item-fan").css("padding-left", "0")
    $(".search-item-fan").css("padding-right", "0")
}

// Play a track
function spotifyPlay(track, context=null, position=null) {
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
            },
            error: function(error) {
                console.error("PLAY RESULT FAILED:")
                console.error(error)
            }
        })
    } else {
        let bodyData
        if (position != null) {
            JSON.stringify({
                "uris": [track],
                "position_ms": position
            })
        } else {
            JSON.stringify({
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
            },
            error: function(error) {
                console.error("PLAY RESULT FAILED:")
                console.error(error)
            }
        })
    }
}

// Play an artist
function spotifyPlayArtist(artist) {
    $.ajax({
        url: "https://api.spotify.com/v1/me/player/play?device_id="+deviceId,
        data: JSON.stringify({
            "context_uri": artist
        }),
        type: "PUT",
        headers: {
            "Authorization": "Bearer " + accessToken
        },
        success: function(result) {
            console.log("PLAY REQUEST SUCCESSFUL")
        },
        error: function(error) {
            console.error("PLAY RESULT FAILED:")
            console.error(error)
        }
    })
}

// Play an album
function spotifyPlayPlaylistAlbum(x) {
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
        },
        error: function(error) {
            console.error("PLAY RESULT FAILED:")
            console.error(error)
        }
    })
}

// Add a song to the user's queue
function addToSpotifyQueue(uri) {
    $.ajax({
        url: "https://api.spotify.com/v1/me/player/queue?uri=" +
            uri + "&device_id=" + deviceId,
        type: "POST",
        headers: {
            "Authorization": "Bearer " + accessToken
        },
        success: function(result) {
            console.log("ADD TO QUEUE SUCCESSFUL")
        },
        error: function(error) {
            console.error("ADD TO QUEUE FAILED:")
            console.error(error)
        }
    })
}

// PLAYER FUNCTIONS

var paused = false

// Play/Pause button
$("#player-control-pause").click(function() {
    paused = !paused
    if (paused) {
        playbackPause()
        socket.emit("pause")
        addMessage(user_id, "Paused playback", true)
    } else {
        playbackResume()
        socket.emit("resume")
        addMessage(user_id, "Resumed playback", true)
    }
})

// When the song changes
function changedSong(addMsg = false) {
    $("#player-control-pause").css("background-image", "url('img/control-pause.svg')")
    spotifyPlayer.getCurrentState().then(state => {
        if (!state) {
            console.error("No music playing.")
            return
        }
        console.log("CONTEXT: " + state.context.uri)
        console.log("URI: " + state.track_window.current_track.uri)
        currentTrack = state.track_window.current_track.uri
        socket.emit("changeSong", {
            uri: state.track_window.current_track.uri,
            context: state.context.uri,
            name: state.track_window.current_track.name,
            paused: state.paused
        })
        if (state.paused) {
            playbackPause()
        } else {
            playbackResume()
        }
    })
    console.log("CHANGED SONG CALLED")
}

// Back button
$("#player-control-back").click(function() {
    socket.emit("makeMeHost")
    spotifyPlayer.previousTrack()
    setTimeout(() => {
        changedSong(true)
        updatePlayer()
        addSongChangeMessage(user_id)
    }, 250);
})

// Forward button
$("#player-control-forward").click(function() {
    socket.emit("makeMeHost")
    spotifyPlayer.nextTrack()
    setTimeout(() => {
        changedSong(true)
        updatePlayer()
        addSongChangeMessage(user_id)
    }, 250);
})

const playerImg = $("#player-image")
const playerName = $("#player-name")
const playerArtist = $("#player-artist")

// Update the player
function updatePlayer() {
    spotifyPlayer.getCurrentState().then(state => {
        if (!state) {
            console.error("No music playing.")
            return
        }
        playerImg.attr("src", state.track_window.current_track.album.images[0].url)
        playerName.html(state.track_window.current_track.name)
        playerArtist.html(state.track_window.current_track.artists[0].name)

    })
}

function playbackPause() {
    spotifyPlayer.pause()
    $("#player-control-pause").css("background-image", "url('img/control-play.svg')")
    paused = true
}

function playbackResume() {
    spotifyPlayer.resume()
    $("#player-control-pause").css("background-image", "url('img/control-pause.svg')")
    paused = false;
}