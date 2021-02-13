// Some HTML elements constants
const message_input = document.getElementById("messages-input")
const dummyAudio = document.getElementById("dummyAudio")
const screenBlock = $(".screen-block") 
const screenBlockShare = $(".screen-block-share")
const searchOverlay = $(".search-overlay")
const shareContainer = $("#share-container")
const dummySearch = document.getElementById("dummy-search")
const actualSearch = document.getElementById("search-input-input")
const playerImg = $("#player-image")
const playerName = $("#player-name")
const playerArtist = $("#player-artist")

var globCollabUri = ""

if (urlParams.get("action") == "join") {
    fadeOutSearch()
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

// Pause the playback
function playbackPause() {
    spotifyPlayer.pause()
    dummyAudio.pause()
    $("#player-control-pause").css("background-image", "url('img/control-play.svg')")
    paused = true
}

// Resume the playback
function playbackResume() {
    spotifyPlayer.resume()
    dummyAudio.play()
    $("#player-control-pause").css("background-image", "url('img/control-pause.svg')")
    paused = false;
}

// Update the like button on the player
function updateLikedButton() {
    spotifyPlayer.getCurrentState().then(state => {
        if (!state) {
            console.error("No music playing.")
            return
        }
        checkLiked(state.track_window.current_track.id).then(
            function(liked) {
                if (liked) {
                    console.log("LIKED")
                    likeBtn.css("background-image", "url('img/share-like.svg')")
                } else {
                    console.log("UNLIKED")
                    likeBtn.css("background-image", "url('img/share-unlike.svg')")
                }
                likeBtn.attr("data-liked", liked)
            }
        )
    })
}

// When the like button is clicked
likeBtn.click(function() {
    spotifyPlayer.getCurrentState().then(state => {
        if (!state) {
            makePopup("Play a song first", true)
        }
        likeUnlikeSong(state.track_window.current_track.id)
    })    
})

// Like or unlike a song
function likeUnlikeSong(songId) {
    like = likeBtn.attr("data-liked")
    console.log("LIKEEEEE: " + like)
    if (like == "true") {
        req = "DELETE"
    } else {
        req = "PUT"
    }
    $.ajax({
            url: "https://api.spotify.com/v1/me/tracks?ids=" + songId,
            type: req,
            headers: {
                "Authorization": "Bearer " + accessToken
            },
            success: function(result) {
                updateLikedButton()
                if (like == "true") {
                    makePopup("Song removed from library")
                } else {
                    makePopup("Song added to library")
                }
            },
            error: function(error) {
                makePopup("Could not add song to library", true)
            }
        })
}

// Share button
shareBtn.click(function() {
    spotifyPlayer.getCurrentState().then(state => {
        if (!state) {
            makePopup("Play a song first", true)
        }
        fadeInShare("https://open.spotify.com/track/" + state.track_window.current_track.id, "song")
    })
})

// Add to playlist button hover listeners
playlistBtn.mouseover(function() {
    playlistChooser.finish()
    playlistChooser.fadeIn(250)
})

playlistChooser.mouseleave(function() {
    playlistChooser.finish()
    playlistChooser.fadeOut(250)
})

// Playlist choice
$("#collab-choice").click(function() {
    addToCollab()
})

$("#other-choice").click(function() {
    getPlaylists().then(result => {
        console.log(result)
        addPlaylistsResults(result)
        fadeInSearch(true)
        searchSpotifyResponse(null)
        makePopup("Choose a playlist to add song to")
    })
})