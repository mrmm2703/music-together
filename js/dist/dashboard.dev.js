"use strict";

// Get some HTML elements
var muteBtn = $("#mute-btn");
var groupIdInput = document.getElementById("group-id-entry");
var d;

function checkGroupExists(groupId) {
  // Input validation
  groupId = groupId.trim();

  if (isNaN(groupId)) {
    throw "Invalid";
  }

  if (groupId.length != 4) {
    throw "Group ID must be 4 characters";
  }

  try {
    groupId = parseInt(groupId, 10);
  } catch (error) {
    throw "Invalid";
  }

  if (groupId < 0) {
    throw "Invalid";
  } // GET request to the API


  var result = null;
  $.ajax({
    url: "api/checkGroupExists.php?access_token=" + accessToken + "&group_id=" + groupId,
    type: "get",
    dataType: "html",
    async: false,
    success: function success(data) {
      result = data;
    }
  }); // Check the result

  if (result == "EXISTS") {
    return true;
  } else if (d == "DOES NOT EXIST") {
    return false;
  }
}

$.ajaxSetup({
  // Disable caching of AJAX responses
  cache: false
}); // Run when the page loads

$(document).ready(function () {
  // Initialise volume of preview-sound to 0.0
  var audioPlayers = document.getElementsByClassName("preview-sound");
  var i;

  for (i = 0; i < audioPlayers.length; i++) {
    audioPlayers[i].volume = 0.0;
  } // Initialise the mute button


  if (dashboardMuted) {
    muteBtn.css("background-image", 'url("https://morahman.me/musictogether/img/muted.png');
  } else {
    muteBtn.css("background-image", 'url("https://morahman.me/musictogether/img/unmuted.png');
  }
}); // Event handler for mute-btn

muteBtn.click(function () {
  if (dashboardMuted) {
    muteBtn.css("background-image", 'url("https://morahman.me/musictogether/img/unmuted.png');
  } else {
    muteBtn.css("background-image", 'url("https://morahman.me/musictogether/img/muted.png');
  }

  dashboardMuted = !dashboardMuted; // Send a request to update the database

  $.get("api/updateDashboardMuted.php", {
    access_token: accessToken,
    muted: dashboardMuted
  });
}); // Event handler for on hover

function setHoverPreviewListener() {
  var audioPlayers = document.getElementsByClassName("preview-sound");
  var i;

  for (i = 0; i < audioPlayers.length; i++) {
    audioPlayers[i].volume = 0.0;
  }

  $(".song-cover").hover(function () {
    if (!dashboardMuted) {
      var audioPlayer = document.getElementById(this.id + "-audio");
      audioPlayer.play();
      $("#" + this.id + "-audio").stop(true, false);
      $("#" + this.id + "-audio").animate({
        volume: 0.25
      }, 500);
    }
  }, function () {
    if (!dashboardMuted) {
      var audioPlayer = document.getElementById(this.id + "-audio");
      $("#" + this.id + "-audio").stop(true, false);
      $("#" + this.id + "-audio").animate({
        volume: 0
      }, 500, function () {
        audioPlayer.pause();
      });
    }
  });
  $(".song-cover").click(function () {
    createBtn($(this).attr("id"), $(this).data("context"));
  });
}

setHoverPreviewListener();

function joinBtn() {
  try {
    if (checkGroupExists(groupIdInput.value) == true) {
      window.location.href = "player.php?action=join&group_id=" + groupIdInput.value;
    } else {
      alert("Group does not exist.");
    }
  } catch (error) {
    if (error == "Invalid") {
      alert("Invalid Group ID entered.");
    } else if (error == "GET request error") {
      alert("An internal error occured. Error: GET_REQUEST_ERROR");
    } else if (error == "Group ID must be 4 characters") {
      alert(error);
    } else {
      alert("An unknown error occured. Error: " + error);
    }

    groupIdInput.value = "";
  }
}

function createBtn() {
  var startSong = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var startContext = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  // GET request to the API
  $.ajax({
    url: "api/createGroupID.php?access_token=" + accessToken,
    type: "get",
    dataType: "html",
    success: function success(data) {
      if (startSong == null) {
        window.location.href = "player.php?action=create&group_id=" + data;
      } else {
        window.location.href = "player.php?action=create&group_id=" + data + "&startSong=spotify:track:" + startSong + "&startContext=" + startContext;
      }
    }
  });
}

if (typeof sess_val == "number") {
  groupIdInput.value = sess_val;
  joinBtn();
}

var songsContainer = $(".songs-container");
var scrollForward = $("#scroll-forward");
var scrollBack = $("#scroll-back");
var speed = 0.5; // Hover handler for back and forward scroll buttons

scrollForward.hover(function () {
  scrollBack.fadeIn(250);
  var totalScrollDistance = songsContainer.get(0).scrollWidth - songsContainer.outerWidth();
  var duration = (totalScrollDistance - songsContainer.scrollLeft()) / speed;
  songsContainer.animate({
    scrollLeft: totalScrollDistance
  }, duration, "linear", function () {
    scrollForward.fadeOut(250);
  });
}, function () {
  songsContainer.stop(true, false);
});
scrollBack.hover(function () {
  scrollForward.fadeIn(250);
  var totalScrollDistance = songsContainer.get(0).scrollWidth - songsContainer.outerWidth();
  var duration = (totalScrollDistance - (totalScrollDistance - songsContainer.scrollLeft())) / speed;
  songsContainer.animate({
    scrollLeft: 0
  }, duration, "linear", function () {
    scrollBack.fadeOut(250);
  });
}, function () {
  songsContainer.stop(true, false);
});
songsContainer.scroll(function () {
  var totalScrollDistance = songsContainer.get(0).scrollWidth - songsContainer.outerWidth();

  if (songsContainer.scrollLeft() == 0) {
    scrollBack.fadeOut(250);
    scrollForward.fadeIn(250);
  } else if (songsContainer.scrollLeft() == totalScrollDistance) {
    scrollBack.fadeIn(250);
    scrollForward.fadeOut(250);
    addNewTracks();
  } else {
    scrollBack.fadeIn(250);
    scrollForward.fadeIn(250);
  }
});
scrollBack.fadeOut(0);

function getNextTracks(url) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: url,
      method: "GET",
      dataType: "json",
      headers: {
        "Authorization": "Bearer " + accessToken
      },
      success: function success(result) {
        resolve(result);
      },
      error: function error(e) {
        reject(e);
      }
    });
  });
}

function createRecentlyPlayedSong(data) {
  var context = "null";

  if (data["context"] != null) {
    context = data["context"]["uri"];
  }

  console.log(data["track"]);
  songsContainer.append("\n            <div style=\"opacity: 0\" class=\"song-container ".concat(data["track"]["id"], "-cont\" id=\"").concat(data["track"]["id"], "-cont\">\n                    <audio class=\"preview-sound\" id=\"").concat(data["track"]["id"], "-audio\" preload=\"auto\" loop=\"\" src=\"").concat(data["track"]["preview_url"], "\"></audio>\n                    <a class=\"song-cover\" id=\"").concat(data["track"]["id"], "\" data-context=\"null\">\n                        <img src=\"").concat(data["track"]["album"]["images"][0]["url"], "\" class=\"hvr-grow\">\n                    </a>\n                    <div class=\"song-details-container\">\n                        <div class=\"song-name\">\n                            ").concat(data["track"]["name"], "\n                        </div>\n                        <div class=\"song-artist\">\n                            ").concat(data["track"]["artists"][0]["name"], "\n                        </div>\n                    </div>\n                </div>\n        "));
  $(".".concat(data["track"]["id"], "-cont")).animate({
    opacity: 1
  }, 250);
}

function addNewTracks() {
  return new Promise(function (resolve, reject) {
    getNextTracks(nextRecentlyPlayedHref).then(function (result) {
      console.log(result);
      nextRecentlyPlayedHref = result["next"];
      result["items"].forEach(function (item) {
        createRecentlyPlayedSong(item);
      });
      scrollForward.fadeIn(250);
      $(".song-cover").unbind("mouseenter mouseleave");
      setHoverPreviewListener();
      resolve();
    }, function (e) {
      console.error(e);
      reject(e);
    });
  });
}