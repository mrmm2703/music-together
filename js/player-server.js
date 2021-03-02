// SERVER EVENT LISTENERS

function initSocketListeners() {
    // When the user connects to the server
    socket.on("connect", () => {
        if (!firstRun) {
            window.location.replace("player.php?action=join&group_id=" + group_id)
        }
    })

    // When the user disconnects from the server
    socket.on("disconnect", () => {
        fadeInLoading()
        playbackPause()
        makePopup("Disconnected from server", true)
        console.log("Disconnected from server")
    })

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

    // When a song's position is seeked
    socket.on("seek", (data) => {
        console.log("SEEK REC")
        spotifyPlayer.seek(data.pos).then(() => {
            addMessage(data.id, "Seeked to " + msToMinutesSeconds(data.pos), true)
            seekBarCurText.val(msToMinutesSeconds(data.pos))
        })
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
                socketId: socketId,
                duration: state.track_window.current_track.duration_ms
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
        seekBar.val(data.position)
        seekBar.attr("max", data.duration)
        seekBarTotalText.text((msToMinutesSeconds(seekBar.attr("max"))))
    })

    // When a request to add to queue is received
    socket.on("addToQueue", (data) => {
        addToSpotifyQueue(data.uri)
        addMessage(data.id, "Added " + data.name + " by " + data.artist + " to the queue", true)
    })

    // When no collab playlist exists, make one
    socket.on("noCollabPlaylist", (songId) => {
        let date = new Date()
        createPlaylist("Collab (" + group_id + ")",
        `Music Together session on ${date.getDate()}/` +
        `${date.getMonth()+1}/${date.getFullYear()}. Group ID: ${group_id}`).then(
            function(result) {
                socket.emit("newPlaylist", {
                    songId: songId,
                    collabUri: result["id"]
                })
            },
            function(error) {
                makePopup("Could not create collab playlist", true)
            }
        )
    })

    // When someone else makes a new collab playlist, follow it
    socket.on("followPlaylist", (collabUri) => {
        console.log("FOLLOW PLAYLIST")
        console.log(collabUri)
        followPlaylist(collabUri).then(
            function(result) { },
            function(error) {
                makePopup("Could not follow collab playlist", true)
            }
        )
    })

    // When the collab URI is returned from the server to add a song to collab
    socket.on("collabUri", (data) => {
        addToPlaylist(data.songId, data.collabUri).then(
            function(result) {
                socket.emit("newPlaylistItem")
                makePopup("Added to collab playlist")
                globCollabUri = data.collabUri
                updateCollabPlaylist(data.collabUri)
            },
            function(error) {
                makePopup("Could not add to collaborative playlist", true)
            }
        )
    })

    // When an update playlist request is received
    socket.on("updatePlaylist", (collabId) => {
        globCollabUri = collabId
        updateCollabPlaylist(collabId)
    })

    // When a user changes their name
    socket.on("updateName", (data) => {
        console.log("Change name")
        console.log(data)
        $("#group-user-" + data.id + " .group-user-text-name").text(data.name)
        $(".message-" + data.id + " .message-name").text(data.name)
        $(".user-name-" + data.id).text(data.name)
    })

    // When a user changes their profile picture
    socket.on("updateProfPic", (data) => {
        $("#group-user-" + data.id + " .group-user-image img").attr("src", data.profPic)
        $(".user-image-" + data.id).attr("src", data.profPic)
    })

    // Update the collab playlist likes
    socket.on("updateLikes", (data) => {
        console.log(data)
        $(".recent-track-image-likes-number[data-id='" + data.songId + "']")
            .text(data.users.length)
        $(".users-container[data-id='" + data.songId + "']").empty()
        data.users.forEach(user => {
            $(".users-container[data-id='" + data.songId + "']").append(likedByUserItem(user))
        })
    })
}