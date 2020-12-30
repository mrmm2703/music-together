"use strict";

// Some HTML elements
var message_input = document.getElementById("messages-input"); // Send a joinedGroup message to the Node.js server

$(document).ready(function () {}); // SERVER EVENT LISTENERS

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
  }); // When a user leaves

  socket.on("userLeft", function (data) {
    console.log("userLeft: " + data);
    removeUser(data);
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
    spotifyPlay(data.uri, data.context);

    if (data.paused) {
      playbackPause();
    } else {
      playbackResume();
    }
  });
  socket.on("pause", function () {
    playbackPause();
  });
  socket.on("resume", function () {
    playbackResume();
  });
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
        socketId: socketId
      });
    });
  });
  socket.on("weAreHere", function (data) {
    // So the state event listener does not trigger an emit
    currentTrack = data.uri;
    spotifyPlay(data.uri, data.context, data.position);
    setTimeout(function () {
      updatePlayer();
    }, 250);
  });
} // CLIENT EVENT LISTENERS
// When a user presses a key in the message input


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
}); // NON-CLIENT-SERVER THINGS

var searchQuery = "";
var dummySearch = document.getElementById("dummy-search");
var actualSearch = document.getElementById("search-input-input");
var screenBlock = $(".screen-block");
var searchOverlay = $(".search-overlay"); // Fade in search overlay

function fadeInSearch() {
  screenBlock.css("display", "block");
  screenBlock.animate({
    opacity: 1
  }, 250);
  searchOverlay.css("display", "grid");
  searchOverlay.animate({
    opacity: 1
  }, 250);
} // Fade out search overlay


function fadeOutSearch() {
  screenBlock.animate({
    opacity: 0
  }, 250);
  searchOverlay.animate({
    opacity: 0
  }, 250);
  setTimeout(function () {
    screenBlock.css("display", "none");
    searchOverlay.css("display", "none");
  }, 250);
} // Player search input event


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
    searchSpotify(searchQuery);
  }
}); // When enter is pressed on the dummy search box

actualSearch.addEventListener("keyup", function (e) {
  if (e.keyCode === 13) {
    e.preventDefault();
    searchQuery = actualSearch.value;
    searchSpotify(searchQuery);
  }
}); // When screen block is pressed

screenBlock.click(function () {
  fadeOutSearch();
}); // Search Spotify with a search query

function searchSpotify(query) {
  $.ajax({
    url: "https://api.spotify.com/v1/search" + "?type=album,artist,track,playlist" + "&limit=8" + "&q=" + query,
    type: "GET",
    dataType: "json",
    headers: {
      "Authorization": "Bearer " + accessToken
    },
    success: function success(result) {
      searchSpotifyResponse(result);
    },
    error: function error(_error) {
      alert("An error occured while searching.");
      console.log(_error);
    }
  });
} // Handle a search query result


function searchSpotifyResponse(result) {
  console.log(result);
  addSongsResults(result["tracks"]);
  addArtistResults(result["artists"]);
  addAlbumsResults(result["albums"]);
  addPlaylistsResults(result["playlists"]);
  $(".search-item-image-container").hover(function () {
    console.log($(this).data("id"));
    $(".search-item-fan[data-id='" + $(this).data("id") + "']").stop(true, true);
    $(".search-item-fan[data-id='" + $(this).data("id") + "']").animate({
      width: "18em",
      paddingLeft: "4em",
      paddingRight: "1em"
    }, 150);
    $(".search-item-text-container[data-id='" + $(this).data("id") + "']").stop(true, true);
    $(".search-item-text-container[data-id='" + $(this).data("id") + "']").animate({
      marginLeft: "-4em",
      opacity: 0
    }, 150);
  }, function () {
    $(".search-item-fan[data-id='" + $(this).data("id") + "']").stop(true, true);
    $(".search-item-fan[data-id='" + $(this).data("id") + "']").animate({
      width: "0",
      paddingLeft: "0",
      paddingRight: "0"
    }, 150);
    $(".search-item-text-container[data-id='" + $(this).data("id") + "']").stop(true, true);
    $(".search-item-text-container[data-id='" + $(this).data("id") + "']").animate({
      marginLeft: "1.6vw",
      opacity: 1
    }, 150);
  });
  $(".search-item-play").click(function () {
    socket.emit("makeMeHost");

    if ($(this).data("type") == "song") {
      spotifyPlay("spotify:track:" + $(this).data("id"), "spotify:album:" + $(this).data("extra"));
    } else if ($(this).data("type") == "playlist") {
      spotifyPlayPlaylistAlbum("spotify:playlist:" + $(this).data("id"));
    } else if ($(this).data("type") == "artist") {
      spotifyPlayArtist("spotify:artist:" + $(this).data("id"));
    } else if ($(this).data("type") == "album") {
      spotifyPlayPlaylistAlbum("spotify:album:" + $(this).data("id"));
    }

    setTimeout(function () {
      changedSong();
      updatePlayer();
    }, 500);
  });
  $(".search-item-fan").css("width", "0");
  $(".search-item-fan").css("padding-left", "0");
  $(".search-item-fan").css("padding-right", "0");
} // UTILITY FUNCTIONS
// Convert milliseconds into seconds


function msToMinutesSeconds(ms) {
  var seconds = ms / 1000;
  var min = Math.floor(ms / 60);
  var sec = Math.floor(seconds - min);
  return min.toString() + ":" + sec.toString().padStart(2, "0");
} // Play a track


function spotifyPlay(track) {
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var position = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  if (context != null) {
    var bodyData;

    if (position != null) {
      bodyData = JSON.stringify({
        "context_uri": context,
        "offset": {
          "uri": track
        },
        "position_ms": position
      });
    } else {
      bodyData = JSON.stringify({
        "context_uri": context,
        "offset": {
          "uri": track
        }
      });
    }

    $.ajax({
      url: "https://api.spotify.com/v1/me/player/play?device_id=" + deviceId,
      data: bodyData,
      type: "PUT",
      headers: {
        "Authorization": "Bearer " + accessToken
      },
      success: function success(result) {
        console.log("PLAY REQUEST SUCCESSFUL");
      },
      error: function error(_error2) {
        console.error("PLAY RESULT FAILED:");
        console.error(_error2);
      }
    });
  } else {
    var _bodyData;

    if (position != null) {
      JSON.stringify({
        "uris": [track],
        "position_ms": position
      });
    } else {
      JSON.stringify({
        "uris": [track]
      });
    }

    $.ajax({
      url: "https://api.spotify.com/v1/me/player/play?device_id=" + deviceId,
      data: _bodyData,
      type: "PUT",
      headers: {
        "Authorization": "Bearer " + accessToken
      },
      success: function success(result) {
        console.log("PLAY REQUEST SUCCESSFUL");
      },
      error: function error(_error3) {
        console.error("PLAY RESULT FAILED:");
        console.error(_error3);
      }
    });
  }
}

function spotifyPlayArtist(artist) {
  $.ajax({
    url: "https://api.spotify.com/v1/me/player/play?device_id=" + deviceId,
    data: JSON.stringify({
      "context_uri": artist
    }),
    type: "PUT",
    headers: {
      "Authorization": "Bearer " + accessToken
    },
    success: function success(result) {
      console.log("PLAY REQUEST SUCCESSFUL");
    },
    error: function error(_error4) {
      console.error("PLAY RESULT FAILED:");
      console.error(_error4);
    }
  });
}

function spotifyPlayPlaylistAlbum(x) {
  $.ajax({
    url: "https://api.spotify.com/v1/me/player/play?device_id=" + deviceId,
    data: JSON.stringify({
      "context_uri": x,
      "offset": {
        "position": 0
      }
    }),
    type: "PUT",
    headers: {
      "Authorization": "Bearer " + accessToken
    },
    success: function success(result) {
      console.log("PLAY REQUEST SUCCESSFUL");
    },
    error: function error(_error5) {
      console.error("PLAY RESULT FAILED:");
      console.error(_error5);
    }
  });
} // PLAYER CONTROL LISTENERS


var paused = false; // Play/Pause button

$("#player-control-pause").click(function () {
  paused = !paused;

  if (paused) {
    playbackPause();
    socket.emit("pause");
  } else {
    playbackResume();
    socket.emit("resume");
  }
}); // When the song changes

function changedSong() {
  $("#player-control-pause").css("background-image", "url('img/control-pause.svg')");
  spotifyPlayer.getCurrentState().then(function (state) {
    if (!state) {
      console.error("No music playing.");
      return;
    }

    currentTrack = state.track_window.current_track.uri;
    socket.emit("changeSong", {
      uri: state.track_window.current_track.uri,
      context: state.context.uri,
      paused: state.paused
    });
  });
} // Back button


$("#player-control-back").click(function () {
  socket.emit("makeMeHost");
  spotifyPlayer.previousTrack();
  setTimeout(function () {
    changedSong();
    updatePlayer();
  }, 250);
}); // Forward button

$("#player-control-forward").click(function () {
  socket.emit("makeMeHost");
  spotifyPlayer.nextTrack();
  setTimeout(function () {
    changedSong();
    updatePlayer();
  }, 250);
});
var playerImg = $("#player-image");
var playerName = $("#player-name");
var playerArtist = $("#player-artist"); // Update the player

function updatePlayer() {
  spotifyPlayer.getCurrentState().then(function (state) {
    if (!state) {
      console.error("No music playing.");
      return;
    }

    playerImg.attr("src", state.track_window.current_track.album.images[0].url);
    playerName.html(state.track_window.current_track.name);
    playerArtist.html(state.track_window.current_track.artists[0].name);
  });
}

function playbackPause() {
  spotifyPlayer.pause();
  $("#player-control-pause").css("background-image", "url('img/control-play.svg')");
  paused = true;
}

function playbackResume() {
  spotifyPlayer.resume();
  $("#player-control-pause").css("background-image", "url('img/control-pause.svg')");
  paused = false;
}