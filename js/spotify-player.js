var deviceId
var spotifyPlayer
var currentTrack

// Connect to Node.js server
var socket = io.connect("https://morahman.me:3000")

const urlParams = new URLSearchParams(window.location.search)

window.onSpotifyWebPlaybackSDKReady = () => {
    spotifyPlayer = new Spotify.Player({
        name: "Music Together!",
        getOAuthToken: callback => {
            callback(accessToken)
        }
    })

    // Errors
    spotifyPlayer.addListener("initialization_error", ({error}) => {
        console.error(error)
    })

    spotifyPlayer.addListener("authentication_error", ({error}) => {
        console.error(error)
    })

    spotifyPlayer.addListener("account_error", ({error}) => {
        console.error(error)
    })

    spotifyPlayer.addListener("playback_error", ({error}) => {
        console.error(error)
        makePopup("Playback error", true)
    })

    // Event listeners
    spotifyPlayer.addListener("player_state_changed", state => {
        updateMediaSession()
        updatePlayer()
        updateLikedButton()
        // Check only check for song changes
        if (state.track_window.current_track.uri != currentTrack) {
            changedSong()
            updatePlayer()
            addSongChangeMessage(user_id)
        }
        if (state.paused != paused)  {
            if (state.paused) {
                playbackPause()
                socket.emit("pause")
                addMessage(user_id, "Paused playback", true)
            } else {
                playbackResume()
                socket.emit("resume")
                addMessage(user_id, "Resumed playback", true)
            }
            paused = !paused

        }

    })

    spotifyPlayer.addListener("ready", ({device_id}) => {
        deviceId = device_id
        console.log("READY! DEVICE ID: " + device_id)
        if (socket.disconnected) {
            console.error("NO SERVER CONNECTION")
            window.location.replace("dashboard.php?error=server_connection")
            return
        }
        initSocketListeners()
        socket.emit("joinedGroup", {
            group: group_id,
            name: user_name,
            prof_pic: user_prof_pic,
            id: user_id
        })
        if (urlParams.get("action") == "join") {
            socket.emit("whereAreWe")
        } else {
            if (urlParams.has("startSong")) {
                if (urlParams.get("startContext") == "null") {
                    spotifyPlay(urlParams.get("startSong"))
                } else {
                    spotifyPlay(urlParams.get("startSong"), urlParams.get("startContext"))
                }
                makePopup("Web player ready")
                fadeOutSearch()
            } else {
                makePopup("Player ready! Play a song to get the party started!")
            }
        }
    })

    spotifyPlayer.addListener("not_ready", ({device_id}) => {
        console.log("NOT READY! DEVICE ID: " + device_id)
    })

    // Connect the Spotify Player
    spotifyPlayer.connect()
}



