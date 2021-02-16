"use strict";

// SERVER EVENT LISTENERS
function initSocketListeners() {
  // Event handler when received usersInGroup message
  socket.on("usersInGroup", function (data) {
    console.log("usersInGroup:");

    for (var user in data["users"]) {
      console.log(user);
      addUser(user, data["users"][user]["name"], data["users"][user]["prof_pic"]);
    }
  }); // When a new user joins

  socket.on("newUser", function (data) {
    console.log("newUser: " + data);
    addUser(data.id, data.name, data.prof_pic);
    addMessage(data.id, "Joined the group", true);
  }); // When a user leaves

  socket.on("userLeft", function (data) {
    console.log("userLeft: " + data);
    addMessage(data, "Left the group", true);
    removeUser(data);
  }); // When the user is banned

  socket.on("userBanned", function () {
    window.location.href = "logout.php?action=banned";
  }); // When client sends a banned word

  socket.on("messageBanned", function (word) {
    alert("The message you sent is banned for containing the word \"".concat(word, "\""));
  }); // When a new message is received

  socket.on("newMessage", function (data) {
    addMessage(data.id, data.message, false);
  }); // When a user is typing

  socket.on("typing", function (data) {
    userTyping(data);
  }); // When a user changes the song

  socket.on("changeSong", function (data) {
    spotifyPlay(data.uri, data.context, null, null);
    setTimeout(function () {
      if (data.paused) {
        playbackPause();
      } else {
        playbackResume();
      }

      addSongChangeMessage(data.id);
    }, 500);
  }); // When a pause message is received from the server

  socket.on("pause", function (id) {
    if (!paused) {
      playbackPause();
      addMessage(id, "Paused playback", true);
    }
  }); // When a resume message is received from the server

  socket.on("resume", function (id) {
    if (paused) {
      playbackResume();
      addMessage(id, "Resumed playback", true);
    }
  }); // When a song's position is seeked

  socket.on("seek", function (data) {
    console.log("SEEK REC");
    spotifyPlayer.seek(data.pos).then(function () {
      addMessage(data.id, "Seeked to " + msToMinutesSeconds(data.pos), true);
      seekBarCurText.val(msToMinutesSeconds(data.pos));
    });
  }); // When another user wants to know where the group is at

  socket.on("whereAreWe", function (socketId) {
    spotifyPlayer.getCurrentState().then(function (state) {
      if (!state) {
        console.error("No music playing.");
        return;
      }

      currentTrack = state.track_window.current_track.uri;
      socket.emit("weAreHere", {
        uri: state.track_window.current_track.uri,
        context: state.context.uri,
        position: state.position,
        paused: state.paused,
        socketId: socketId,
        duration: state.track_window.current_track.duration_ms
      });
    });
  }); // Response from whereAreWe

  socket.on("weAreHere", function (data) {
    // So the state event listener does not trigger an emit
    currentTrack = data.uri;
    spotifyPlay(data.uri, data.context, data.position, null);
    setTimeout(function () {
      updatePlayer();

      if (data.paused) {
        playbackPause();
      } else playbackResume();
    }, 1500);
    setTimeout(function () {
      data.queue.forEach(function (uri) {
        addToSpotifyQueue(uri);
      });
    }, 5000);
    makePopup("All caught up!");
    seekBar.val(data.position);
    seekBar.attr("max", data.duration);
    seekBarTotalText.text(msToMinutesSeconds(seekBar.attr("max")));
  }); // When a request to add to queue is received

  socket.on("addToQueue", function (data) {
    addToSpotifyQueue(data.uri);
    addMessage(data.id, "Added " + data.name + " by " + data.artist + " to the queue", true);
  }); // When no collab playlist exists, make one

  socket.on("noCollabPlaylist", function (songId) {
    var date = new Date();
    createPlaylist("Collab (" + group_id + ")", "Music Together session on ".concat(date.getDate(), "/") + "".concat(date.getMonth() + 1, "/").concat(date.getFullYear(), ". Group ID: ").concat(group_id)).then(function (result) {
      socket.emit("newPlaylist", {
        songId: songId,
        collabUri: result["id"]
      });
    }, function (error) {
      makePopup("Could not create collab playlist", true);
    });
  }); // When someone else makes a new collab playlist, follow it

  socket.on("followPlaylist", function (collabUri) {
    console.log("FOLLOW PLAYLIST");
    console.log(collabUri);
    followPlaylist(collabUri).then(function (result) {}, function (error) {
      makePopup("Could not follow collab playlist", true);
    });
  }); // When the collab URI is returned from the server to add a song to collab

  socket.on("collabUri", function (data) {
    addToPlaylist(data.songId, data.collabUri).then(function (result) {
      socket.emit("newPlaylistItem");
      makePopup("Added to collab playlist");
      globCollabUri = data.collabUri;
      updateCollabPlaylist(data.collabUri);
    }, function (error) {
      makePopup("Could not add to collaborative playlist", true);
    });
  }); // When an update playlist request is received

  socket.on("updatePlaylist", function (collabId) {
    globCollabUri = collabId;
    updateCollabPlaylist(collabId);
  }); // When a user changes their name

  socket.on("updateName", function (data) {
    console.log("Change name");
    console.log(data);
    $("#group-user-" + data.id + " .group-user-text-name").text(data.name);
    $(".message-" + data.id + " .message-name").text(data.name);
  }); // When a user changes their profile picture

  socket.on("updateProfPic", function (data) {
    $("#group-user-" + data.id + " .group-user-image img").attr("src", data.profPic);
  });
}