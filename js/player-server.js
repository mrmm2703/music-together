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

    // When the user is banned
    socket.on("userBanned", () => {
        window.location.href = "logout.php?action=banned"
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
        spotifyPlay(data.uri, data.context, null, null)
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
        if (!paused) {
            playbackPause()
            addMessage(id, "Paused playback", true)
        }
    })

    // When a resume message is received from the server
    socket.on("resume", (id) => {
        if (paused) {
            playbackResume()
            addMessage(id, "Resumed playback", true)
        }
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
        spotifyPlay(data.uri, data.context, data.position, null)

        setTimeout(() => {
            updatePlayer()
            if (data.paused) {
                playbackPause()
            } else (
                playbackResume()
            )
        }, 1500);
        setTimeout(() => {
            data.queue.forEach(function(uri) {
                addToSpotifyQueue(uri)
            })
        }, 5000);

        makePopup("All caught up!")
    })

    // When a request to add to queue is received
    socket.on("addToQueue", (data) => {
        addToSpotifyQueue(data.uri)
        addMessage(data.id, "Added " + data.name + " by " + data.artist + " to the queue", true)
    })
}