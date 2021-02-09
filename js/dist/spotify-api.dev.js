"use strict";

// SPOTIFY API FUNCTIONS
// Search Spotify with a search query
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
} // Play a track


function spotifyPlay(track) {
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var position = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var showPopup = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  console.log("SPOTIFY PLAY:");
  console.log("TRACK: " + track);
  console.log("CONTEXT: " + context);

  if (context != null) {
    var bodyData;

    if (context.substring(8, 14) == "artist") {
      bodyData = JSON.stringify({
        "context_uri": context
      });
    }

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

        if (showPopup) {
          makePopup("Playing song");
        }
      },
      error: function error(_error2) {
        console.error("PLAY RESULT FAILED:");
        console.error(_error2);

        if (showPopup) {
          makePopup("Could not play song", true);
        }
      }
    });
  } else {
    var _bodyData;

    if (position != null) {
      _bodyData = JSON.stringify({
        "uris": [track],
        "position_ms": position
      });
    } else {
      _bodyData = JSON.stringify({
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

        if (showPopup) {
          makePopup("Playing song");
        }
      },
      error: function error(_error3) {
        console.error("PLAY RESULT FAILED:");
        console.error(_error3);

        if (showPopup) {
          makePopup("Could not play song", true);
        }
      }
    });
  }
} // Play an album


function spotifyPlayPlaylistAlbum(x) {
  var showPopup = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
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

      if (showPopup) {
        makePopup("Playing successfully");
      }
    },
    error: function error(_error4) {
      console.error("PLAY RESULT FAILED:");
      console.error(_error4);
      makePopup("Couldn't play", true);
    }
  });
} // Add a song to the user's queue


function addToSpotifyQueue(uri) {
  var showMessage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var ret = false;
  console.log(uri);
  console.log("addToSpotifyQueue");
  console.log("https://api.spotify.com/v1/me/player/queue?uri=" + uri + "&device_id=" + deviceId);
  console.log("Bearer " + accessToken);
  $.ajax({
    url: "https://api.spotify.com/v1/me/player/queue?uri=" + uri + "&device_id=" + deviceId,
    type: "POST",
    headers: {
      "Authorization": "Bearer " + accessToken
    },
    success: function success(result) {
      console.log("ADD TO QUEUE SUCCESSFUL");
      console.log(result);

      if (showMessage) {
        makePopup("Added to queue");
      }
    },
    error: function error(_error5) {
      console.error("ADD TO QUEUE FAILED:");
      console.error(_error5);

      if (showMessage) {
        makePopup("Could not add to queue", true);
      }
    }
  });
} // Check if a song is liked by the user


function checkLiked(songId) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: "https://api.spotify.com/v1/me/tracks/contains?ids=" + songId,
      type: "GET",
      headers: {
        "Authorization": "Bearer " + accessToken
      },
      success: function success(result) {
        resolve(result[0]);
      },
      error: function error(_error6) {
        console.error("CHECK LIKED FAILED");
        console.error(_error6);
        makePopup("Error while getting saved tracks", true);
        reject();
      }
    });
  });
} // Get a user's playlists


function getPlaylists() {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: "https://api.spotify.com/v1/me/playlists",
      type: "GET",
      headers: {
        "Authorization": "Bearer " + accessToken
      },
      success: function success(result) {
        resolve(result);
      },
      error: function error(_error7) {
        console.error("GET PLAYLISTS FAIELD");
        console.error(_error7);
        makePopup("Error while getting playlists", true);
        reject();
      }
    });
  });
} // Add to playlist


function addToPlaylist(songId, playlistId) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks?uris=spotify:track:" + songId,
      type: "POST",
      headers: {
        "Authorization": "Bearer " + accessToken
      },
      success: function success(result) {
        resolve(result);
      },
      error: function error(_error8) {
        console.error("ADD TO PLAYYLIST FAILED");
        console.error(_error8);
        reject(_error8);
      }
    });
  });
}