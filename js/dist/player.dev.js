"use strict";

// Some HTML elements
var message_input = document.getElementById("messages-input"); // Connect to Node.js server

var socket = io.connect("https://morahman.me:3000"); // Send a joinedGroup message to the Node.js server

$(document).ready(function () {
  socket.emit("joinedGroup", {
    group: group_id,
    name: user_name,
    prof_pic: user_prof_pic,
    id: user_id
  });
}); // SERVER EVENT LISTENERS
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
}); // CLIENT EVENT LISTENERS
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
  $(".search-item-fan").css("width", "0");
  $(".search-item-fan").css("padding-left", "0");
  $(".search-item-fan").css("padding-right", "0");
}