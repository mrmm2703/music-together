var deviceId
var spotifyPlayer
var currentTrack
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
            changedSong(state.paused)
            updatePlayer()
        }

    })

    spotifyPlayer.addListener("ready", ({device_id}) => {
        deviceId = device_id
        console.log("READY! DEVICE ID: " + device_id)
    })

    spotifyPlayer.addListener("not_ready", ({device_id}) => {
        console.log("NOT READY! DEVICE ID: " + device_id)
    })

    // Connect the Spotify Player
    spotifyPlayer.connect()
}



