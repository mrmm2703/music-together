"use strict";

// Get reference to HTML elements
var users_container = $(".group-users-container");
var messages_container = $(".messages-container");
var songs_container = $("#search-songs-container");
var artists_container = $("#search-artists-container");
var albums_container = $("#search-albums-container");
var playlists_container = $("#search-playlists-container"); // Add a user to the My Group panel

function addUser(id, name, prof_pic) {
  users_container.append("" + "<div id='group-user-" + id + "' class='group-user-container'>" + "<div class='group-user-image'>" + "<img src='" + prof_pic + "'>" + "</div>" + "<div class='group-user-text-container'>" + "<div class='group-user-text-name'>" + name + "</div>" + "<div class='group-user-text-typing'>" + "typing..." + "</div>" + "</div>" + "</div>" + "");
} // Remove a user from the My Group panel


function removeUser(id) {
  $("#group-user-" + id).remove();
} // Add a chat to the Messages panel


function addMessage(id, message) {
  var emphasise = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  // Check if the message is from the current user or other user
  var person = "other";

  if (id == user_id) {
    person = "me";
  } // Get the time in a pretty format


  var now = new Date();
  var time = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0"); // Get the name from the My Group panel

  var name = $("#group-user-" + id + " .group-user-text-name").text();

  if (!emphasise) {
    messages_container.append("" + '<div class="message ' + person + ' message-' + id + '">' + '<div class="message-name">' + name + '</div>' + '<div class="message-text">' + message + '</div>' + '<div class="message-time">' + time + '</div>' + '</div>');
  } else {
    messages_container.append("" + '<div class="message ' + person + ' message-' + id + '">' + '<div class="message-name">' + name + '</div>' + '<div class="message-text">' + "<em>" + message + "</em>" + '</div>' + '<div class="message-time">' + time + '</div>' + '</div>');
  }

  messages_container.scrollTop(messages_container[0].scrollHeight);
} // Update user typing indicator for an ID


function userTyping(id) {
  $("#group-user-" + id + " .group-user-text-typing").stop(true, true).animate({
    opacity: 1
  }, 25).animate({
    opacity: 1
  }, 500).animate({
    opacity: 0
  }, 500);
} // Add search results for songs


function addSongsResults(response) {
  songs_container.empty();
  var tracks = response["items"];

  if (!tracks.length == 0) {
    tracks.forEach(function (track) {
      var img = "defaultProfilePicture.png";

      if (!track["album"]["images"].length == 0) {
        img = track["album"]["images"][0]["url"];
      }

      var element = makeSearchItem(track["name"], track["artists"][0]["name"], img, "song", track["id"], track["album"]["id"]);
      songs_container.append(element);
    });
  } else {
    songs_container.append("<div class='no-results'>No results.</div>");
  }
} // Add search results for artists


function addArtistResults(response) {
  artists_container.empty();
  var artists = response["items"];

  if (!artists.length == 0) {
    artists.forEach(function (artist) {
      var img = "defaultProfilePicture.png";

      if (!artist["images"].length == 0) {
        img = artist["images"][0]["url"];
      }

      var element = makeSearchItem(artist["name"], "", img, "artist", artist["id"]);
      artists_container.append(element);
    });
  } else {
    artists_container.append("<div class='no-results'>No results.</div>");
  }
} // Add search results for albums


function addAlbumsResults(response) {
  albums_container.empty();
  var albums = response["items"];

  if (!albums.length == 0) {
    albums.forEach(function (album) {
      var img = "defaultProfilePicture.png";

      if (!album["images"].length == 0) {
        img = album["images"][0]["url"];
      }

      var element = makeSearchItem(album["name"], album["artists"][0]["name"], img, "album", album["id"]);
      albums_container.append(element);
    });
  } else {
    albums_container.append("<div class='no-results'>No results.</div>");
  }
} // Add search results for playlists


function addPlaylistsResults(response) {
  playlists_container.empty();
  var playlists = response["items"];

  if (!playlists.length == 0) {
    playlists.forEach(function (playlist) {
      var img = "defaultProfilePicture.png";

      if (!playlist["images"].length == 0) {
        img = playlist["images"][0]["url"];
      }

      var element = makeSearchItem(playlist["name"], playlist["owner"]["display_name"], img, "playlist", playlist["id"]);
      playlists_container.append(element);
    });
  } else {
    playlists_container.append("<div class='no-results'>No results.</div>");
  }
} // Make a search query item


function makeSearchItem(heading, subheading, imageUrl, type, id) {
  var extra = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : "";
  var item = "" + '<div data-extra="' + extra + '" data-type="' + type + '" data-id="' + id + '" class="search-item-container">' + '<div data-extra="' + extra + '" data-type="' + type + '" data-id="' + id + '" class="search-item-image-container">' + '<img data-extra="' + extra + '" data-type="' + type + '" data-id="' + id + '" class="search-item-image" src="' + imageUrl + '">' + '<div data-extra="' + extra + '" data-type="' + type + '" data-id="' + id + '" class="search-item-fan">' + (type != "artist" ? '<div data-extra="' + extra + '" data-type="' + type + '" data-id="' + id + '" class="search-item-play"></div>' : '') + (type == "song" ? '<div data-extra="' + extra + '" data-type="' + type + '" data-id="' + id + '" class="search-item-queue"></div>' : '') + '<div data-extra="' + extra + '" data-type="' + type + '" data-id="' + id + '" class="search-item-share"></div>' + '</div>' + '</div>' + '<div data-extra="' + extra + '" data-type="' + type + '" data-id="' + id + '" class="search-item-text-container">' + '<div data-extra="' + extra + '" data-type="' + type + '" data-id="' + id + '" class="search-item-name">' + heading + '</div>' + '<div data-extra="' + extra + '" data-type="' + type + '" data-id="' + id + '" class="search-item-artist">' + subheading + '</div>' + '</div>' + '</div>';
  return item;
}