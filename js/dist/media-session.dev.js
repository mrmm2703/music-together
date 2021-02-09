"use strict";

// MEDIA SESSION API
// Set event handlers for media buttons
if ("mediaSession" in navigator) {
  console.log("ADDING MEDIA HADNLERS"); // When media pause button is clicked

  navigator.mediaSession.setActionHandler("pause", function () {
    playbackPause();
    socket.emit("pause");
    addMessage(user_id, "Paused playback", true); // navigator.mediaSession.playbackState = "paused"

    dummyAudio.pause();
  }); // When media play button is clicked

  navigator.mediaSession.setActionHandler("play", function () {
    playbackResume();
    socket.emit("resume");
    addMessage(user_id, "Resumed playback", true); // navigator.mediaSession.playbackState = "playing"

    dummyAudio.play();
  }); // When media next is clicked

  navigator.mediaSession.setActionHandler("nexttrack", function () {
    socket.emit("makeMeHost");
    spotifyPlayer.nextTrack();
    setTimeout(function () {
      changedSong(true);
      updatePlayer();
      addSongChangeMessage(user_id);
    }, 250);
  }); // When media previous is clicked

  navigator.mediaSession.setActionHandler("previoustrack", function () {
    socket.emit("makeMeHost");
    spotifyPlayer.previousTrack();
    setTimeout(function () {
      changedSong(true);
      updatePlayer();
      addSongChangeMessage(user_id);
    }, 250);
  });
} // Update the media session


function updateMediaSession() {
  if ("mediaSession" in navigator) {
    spotifyPlayer.getCurrentState().then(function (state) {
      var images = []; // Add each image into the list for MediaMetadata

      state.track_window.current_track.album.images.forEach(function (img) {
        images.push({
          src: img.url,
          sizes: img.width + "x" + img.height,
          type: "image/jpeg"
        });
      });
      navigator.mediaSession.metadata = new MediaMetadata({
        title: state.track_window.current_track.name,
        artist: state.track_window.current_track.artists[0].name,
        album: state.track_window.current_track.album.name,
        artwork: images
      });
    });
  }
}