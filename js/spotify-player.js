var deviceId
var spotifyPlayer
var currentTrack
var firstRun = true

// Connect to Node.js server
var socket = io.connect("https://morahman.me:3000")

const urlParams = new URLSearchParams(window.location.search)

window.onSpotifyWebPlaybackSDKReady = () => {
    spotifyPlayer = new Spotify.Player({
        name: "Music Together!",
        getOAuthToken: callback => {
            getRefreshedToken(accessToken, refreshToken).then((result) => {
                document.cookie = "access_token=" + result.access_token + "; path=/"
                document.cookie = "refresh_token=" + result.refresh_token + "; path=/"
                accessToken = result.access_token
                refreshToken = result.refresh_token
                $("#settings").attr("src", "settings.php?access_token=" + accessToken)
                callback(accessToken)
            }, (error) => {
                console.error(error)
                window.location.href = "dashboard.php?error=spotify_auth"
            })
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
        // Check only check for song changes
        if (state.track_window.current_track.uri != currentTrack) {
            changedSong()
            updatePlayer()
            addSongChangeMessage(user_id)
            updateLikedButton()
            if (screenBlock.css("cursor") != "pointer") {
                initScreenBlock()
                fadeOutSearch()
            }
            // Update seek bar
            seekBar.attr("max", state.track_window.current_track.duration_ms)
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
        }

        paused = state.paused

        seekBarTotalText.text((msToMinutesSeconds(seekBar.attr("max"))))
        seekBar.val(state.position)
        seekBarCurText.text(msToMinutesSeconds(state.position))
    })

    spotifyPlayer.addListener("ready", ({device_id}) => {
        deviceId = device_id
        console.log("READY! DEVICE ID: " + device_id)
        if (firstRun) {
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
                initScreenBlock()
            } else {
                if (urlParams.has("startSong")) {
                    if (urlParams.get("startContext") == "null") {
                        spotifyPlay(urlParams.get("startSong"))
                    } else {
                        spotifyPlay(urlParams.get("startSong"), urlParams.get("startContext"))
                    }
                    makePopup("Web player ready")
                    initScreenBlock()
                } else {
                    makePopup("Player ready! Play a song to get the party started!")
                    fadeInSearch()
                }
            }
        } else {
            window.location.replace("player.php?action=join&group_id=" + group_id)
        }
        fadeOutLoading()
        seekBarBegin()
        firstRun = false
    })

    spotifyPlayer.addListener("not_ready", ({device_id}) => {
        console.log("NOT READY! DEVICE ID: " + device_id)
    })

    // Connect the Spotify Player
    spotifyPlayer.connect()
}



