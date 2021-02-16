"use strict";

var deviceId;
var spotifyPlayer;
var currentTrack; // Connect to Node.js server

var socket = io.connect("https://morahman.me:3000");
var urlParams = new URLSearchParams(window.location.search);

window.onSpotifyWebPlaybackSDKReady = function () {
  spotifyPlayer = new Spotify.Player({
    name: "Music Together!",
    getOAuthToken: function getOAuthToken(callback) {
      callback(accessToken);
    }
  }); // Errors

  spotifyPlayer.addListener("initialization_error", function (_ref) {
    var error = _ref.error;
    console.error(error);
  });
  spotifyPlayer.addListener("authentication_error", function (_ref2) {
    var error = _ref2.error;
    console.error(error);
  });
  spotifyPlayer.addListener("account_error", function (_ref3) {
    var error = _ref3.error;
    console.error(error);
  });
  spotifyPlayer.addListener("playback_error", function (_ref4) {
    var error = _ref4.error;
    console.error(error);
    makePopup("Playback error", true);
  }); // Event listeners

  spotifyPlayer.addListener("player_state_changed", function (state) {
    updateMediaSession();
    updatePlayer();
    updateLikedButton(); // Check only check for song changes

    if (state.track_window.current_track.uri != currentTrack) {
      changedSong();
      updatePlayer();
      addSongChangeMessage(user_id); // Update seek bar

      seekBar.attr("max", state.track_window.current_track.duration_ms);
    }

    paused = state.paused;

    if (state.paused != paused) {
      if (state.paused) {
        playbackPause();
        socket.emit("pause");
        addMessage(user_id, "Paused playback", true);
      } else {
        playbackResume();
        socket.emit("resume");
        addMessage(user_id, "Resumed playback", true);
      }

      paused = !paused;
    }

    seekBarTotalText.text(msToMinutesSeconds(seekBar.attr("max")));
    seekBar.val(state.position);
  });
  spotifyPlayer.addListener("ready", function (_ref5) {
    var device_id = _ref5.device_id;
    deviceId = device_id;
    console.log("READY! DEVICE ID: " + device_id);

    if (socket.disconnected) {
      console.error("NO SERVER CONNECTION");
      window.location.replace("dashboard.php?error=server_connection");
      return;
    }

    initSocketListeners();
    socket.emit("joinedGroup", {
      group: group_id,
      name: user_name,
      prof_pic: user_prof_pic,
      id: user_id
    });

    if (urlParams.get("action") == "join") {
      socket.emit("whereAreWe");
      initScreenBlock();
    } else {
      if (urlParams.has("startSong")) {
        if (urlParams.get("startContext") == "null") {
          spotifyPlay(urlParams.get("startSong"));
        } else {
          spotifyPlay(urlParams.get("startSong"), urlParams.get("startContext"));
        }

        makePopup("Web player ready");
        initScreenBlock();
      } else {
        makePopup("Player ready! Play a song to get the party started!");
        fadeInSearch();
      }
    }

    fadeOutLoading();
    seekBarBegin();
  });
  spotifyPlayer.addListener("not_ready", function (_ref6) {
    var device_id = _ref6.device_id;
    console.log("NOT READY! DEVICE ID: " + device_id);
  }); // Connect the Spotify Player

  spotifyPlayer.connect();
};