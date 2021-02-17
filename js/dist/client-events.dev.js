"use strict";

// CLIENT EVENT LISTENERS
var searchQuery = ""; // When a user presses a key in the message input

document.getElementById("messages-input").addEventListener("keyup", function (e) {
  // When enter key is pressed
  if (e.keyCode === 13) {
    e.preventDefault();
    socket.emit("message", message_input.value);
    message_input.value = "";
  } else {
    // When any other is pressed
    socket.emit("typing");
  }
});
document.getElementById("send-btn").addEventListener("click", function () {
  socket.emit("message", message_input.value);
  message_input.value = "";
}); // Player search input event

dummySearch.addEventListener("keyup", function (e) {
  // When enter key is pressed
  if (e.keyCode === 13) {
    e.preventDefault();
    searchQuery = dummySearch.value;
    actualSearch.value = searchQuery;
    fadeInSearch();
    setTimeout(function () {
      dummySearch.value = "";
    }, 500);
    fadeInLoading();
    searchSpotify(searchQuery);
  }
}); // When enter is pressed on the dummy search box

actualSearch.addEventListener("keyup", function (e) {
  if (e.keyCode === 13) {
    e.preventDefault();
    searchQuery = actualSearch.value;
    fadeInLoading();
    searchSpotify(searchQuery);
  }
}); // When search screen block is pressed

function initScreenBlock() {
  screenBlock.css("cursor", "pointer");
  screenBlock.click(function () {
    fadeOutSearch();
  });
} // When the share screen block is pressed


screenBlockShare.click(function () {
  fadeOutShare();
}); // Add a song to collaborative playlist

function addToCollab() {
  spotifyPlayer.getCurrentState().then(function (state) {
    socket.emit("addToPlaylist", state.track_window.current_track.id);
  });
} // Seek bar events


seekBar.change(function () {
  var _this = this;

  console.log($(this).val());
  spotifyPlayer.seek($(this).val()).then(function () {
    socket.emit("seek", $(_this).val());
    addMessage(user_id, "Seeked to " + msToMinutesSeconds($(_this).val()), true);
  });
});
seekBar.on("input", function () {
  seekBarCurText.text(msToMinutesSeconds($(this).val()));
});