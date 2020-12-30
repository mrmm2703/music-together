"use strict";

var deviceId;
var spotifyPlayer;
var currentTrack;

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
  }); // Event listeners

  spotifyPlayer.addListener("player_state_changed", function (state) {
    // Check only check for song changes
    if (state.track_window.current_track.uri != currentTrack) {
      changedSong(state.paused);
      updatePlayer();
    }
  });
  spotifyPlayer.addListener("ready", function (_ref5) {
    var device_id = _ref5.device_id;
    deviceId = device_id;
    console.log("READY! DEVICE ID: " + device_id);
  });
  spotifyPlayer.addListener("not_ready", function (_ref6) {
    var device_id = _ref6.device_id;
    console.log("NOT READY! DEVICE ID: " + device_id);
  }); // Connect the Spotify Player

  spotifyPlayer.connect();
};