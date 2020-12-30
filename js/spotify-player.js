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
    })

    // Event listeners
    spotifyPlayer.addListener("player_state_changed", state => {
        // Check only check for song changes
        if (state.track_window.current_track.uri != currentTrack) {
            changedSong()
            updatePlayer()
        }

    })

    spotifyPlayer.addListener("ready", ({device_id}) => {
        deviceId = device_id
        console.log("READY! DEVICE ID: " + device_id)
        initSocketListeners()
        socket.emit("joinedGroup", {
            group: group_id,
            name: user_name,
            prof_pic: user_prof_pic,
            id: user_id
        })
        if (urlParams.get("action") == "join") {
            socket.emit("whereAreWe")
        }
    })

    spotifyPlayer.addListener("not_ready", ({device_id}) => {
        console.log("NOT READY! DEVICE ID: " + device_id)
    })

    // Connect the Spotify Player
    spotifyPlayer.connect()
}



