// Get reference to HTML elements
const users_container = $(".group-users-container")
const messages_container = $(".messages-container")

const likeBtn = $(".player-share-like")
const shareBtn = $(".player-share-share")
const playlistBtn = $(".player-share-playlist")
const playlistChooser = $(".playlist-chooser")

const songs_container = $("#search-songs-container")
const artists_container = $("#search-artists-container")
const albums_container = $("#search-albums-container")
const playlists_container = $("#search-playlists-container")

const tracks_container = $(".recent-tracks-container")

const seekBar = $("#seek-bar")
const seekBarCurText = $("#seek-left")
const seekBarTotalText = $("#seek-right")

// Add a user to the My Group panel
function addUser(id, name, prof_pic) {
    users_container.append("" + 
    "<div id='group-user-" + id + "' class='group-user-container'>" + 
        "<div class='group-user-image'>" +
            "<img src='" + prof_pic + "'>" +
        "</div>" +
        "<div class='group-user-text-container'>" +
            "<div class='group-user-text-name'>" +
                name + 
                "</div>" + 
            "<div class='group-user-text-typing'>" +
                "typing..." +
            "</div>" +
        "</div>" +
    "</div>" +
    "")
}

// Remove a user from the My Group panel
function removeUser(id) {
    $("#group-user-" + id).remove()
}

function getNameFromId(id) {
    return $("#group-user-" + id + " .group-user-text-name").text()
}

function getImgFromId(id) {
    return $("#group-user-" + id + " img").attr("src")
}

// Add a chat to the Messages panel
function addMessage(id, message, emphasise=false) {
    // Check if the message is from the current user or other user
    let person = "other"
    if (id == user_id) {
        person = "me"
    }

    // Get the time in a pretty format
    let now = new Date()
    let time = now.getHours().toString().padStart(2, "0") + ":" +
        now.getMinutes().toString().padStart(2, "0")

    // Get the name from the My Group panel
    let name = getNameFromId(id)

    if (!emphasise) {
        messages_container.append("" +
        '<div class="message ' + person + ' message-' + id + '">' +
            '<div class="message-name">' +
                name +
            '</div>'+
            '<div class="message-text">' +
                message +
            '</div>' +
            '<div class="message-time">' +
                time +
            '</div>' +
        '</div>'
        )
    } else {
        // Check if emp message already sent
        if (!($(".message-text em").last().text() == message &&
            $(".message-name").last().text() == name)) {
            messages_container.append("" +
            '<div class="message ' + person + ' message-' + id + '">' +
                '<div class="message-name">' +
                    name +
                '</div>'+
                '<div class="message-text">' +
                    "<em>" + message + "</em>" + 
                '</div>' +
                '<div class="message-time">' +
                    time +
                '</div>' +
            '</div>'
            )
        }
    }

    messages_container.scrollTop(messages_container[0].scrollHeight)
}

// Update user typing indicator for an ID
function userTyping(id) {
    $("#group-user-"+id+" .group-user-text-typing")
        .stop(true, true)
        .animate({opacity: 1}, 25)
        .animate({opacity: 1}, 500)
        .animate({opacity: 0}, 500)
}

// Handle a search query result
function searchSpotifyResponse(result) {
    console.log(result)
    if (result != null) {
        addSongsResults(result["tracks"])
        addArtistResults(result["artists"])
        addAlbumsResults(result["albums"])
        addPlaylistsResults(result["playlists"])
        $(".search-type-container").css("display", "flex")
        $(".search-title").css("display", "block")
    }
    // Add the event handlers everytime a new set of search results is made
    $(".search-item-image-container").hover(
        function() {
            $(".search-item-fan[data-id='" + $(this).data("id") + "']").stop(true, true);
            $(".search-item-fan[data-id='" + $(this).data("id") + "']")
                .animate({
                    width: "18em",
                    paddingLeft: "4em",
                    paddingRight: "1em"
                }, 150)
            $(".search-item-text-container[data-id='" + $(this).data("id") + "']").stop(true, true)
            $(".search-item-text-container[data-id='" + $(this).data("id") + "']")
                .animate({
                    marginLeft: "-4em",
                    opacity: 0
                }, 150)
        }, function() {
            $(".search-item-fan[data-id='" + $(this).data("id") + "']").stop(true, true);
            $(".search-item-fan[data-id='" + $(this).data("id") + "']")
                .animate({
                    width: "0",
                    paddingLeft: "0",
                    paddingRight: "0"
                }, 150)
            $(".search-item-text-container[data-id='" + $(this).data("id") + "']").stop(true, true)
            $(".search-item-text-container[data-id='" + $(this).data("id") + "']")
                .animate({
                    marginLeft: "1.6vw",
                    opacity: 1
                }, 150)
        }
    )
    // Add click listeners to the play buttons in search
    $(".search-item-play").click(function() {
        initScreenBlock()
        socket.emit("makeMeHost")
        if ($(this).data("type") == "song") {
            spotifyPlay("spotify:track:"+$(this).data("id"), "spotify:album:"+$(this).data("extra"), null, true)
        } else if ($(this).data("type") == "playlist") {
            spotifyPlayPlaylistAlbum("spotify:playlist:"+$(this).data("id"), true)
        } else if ($(this).data("type") == "artist") {
            spotifyPlayArtist("spotify:artist:"+$(this).data("id"))
        } else if ($(this).data("type") == "album") {
            spotifyPlayPlaylistAlbum("spotify:album:"+$(this).data("id"), true)
        }
        setTimeout(() => {
            changedSong()
            updatePlayer()
            addSongChangeMessage(user_id)
        }, 500);
        dummyAudio.play()
    })
    // Add to queue button handler
    $(".search-item-queue").click(function() {
        // Extract song information using HTML elements contents
        let songUri = "spotify:track:"+$(this).data("id")
        let songName = $(".search-item-name[data-id='"+$(this).data("id")+"']").html()
        let songArtist = $(".search-item-artist[data-id='"+$(this).data("id")+"']").html()
        let songImage =  $(".search-item-image[data-id='"+$(this).data("id")+"']").attr("src")
        // Add to queue and send to other clients
        addToSpotifyQueue(songUri, true)
        socket.emit("addToQueue", {
            uri: songUri,
            name: songName,
            artist: songArtist,
            image: songImage
        })
        addMessage(user_id, "Added " + songName + " by " + songArtist + " to the queue.", true)
    })
    // Share button handler
    $(".search-item-share").click(function() {
        fadeInShare($(this).data("href"), $(this).data("type"))
    })
    // Add to playlist button handler
    $(".search-item-add").click(function() {
        spotifyPlayer.getCurrentState().then(state => {
            if (!state) {
                makePopup("No song playing")
                return
            }
            addToPlaylist(state.track_window.current_track.id, $(this).data("id")).then(
                function(result) {
                    makePopup("Added to playlist")
                },
                function(error) {
                    makePopup("Could not add to playlist")
                }
            )
        })
    })
    // Initialise the slide-out fans in the unhidden state
    $(".search-item-fan").css("width", "0")
    $(".search-item-fan").css("padding-left", "0")
    $(".search-item-fan").css("padding-right", "0")
    fadeOutLoading()
}

// Add search results for songs
function addSongsResults(response) {
    songs_container.empty()
    let tracks = response["items"]
    if (!tracks.length == 0) {
        tracks.forEach(function(track) {
            let img = "defaultProfilePicture.png"
            if (!track["album"]["images"].length == 0) {
                img = track["album"]["images"][0]["url"]
            }
            let element = makeSearchItem(
                track["name"],
                track["artists"][0]["name"],
                img,
                "song",
                track["id"],
                track["album"]["id"],
                track["external_urls"]["spotify"]
            )
            songs_container.append(element)
        })
    } else {
        songs_container.append("<div class='no-results'>No results.</div>")
    }
}

// Add search results for artists
function addArtistResults(response) {
    artists_container.empty()
    let artists = response["items"]
    if (!artists.length == 0) {
        artists.forEach(function(artist) {
            let img = "defaultProfilePicture.png"
            if (!artist["images"].length == 0) {
                img = artist["images"][0]["url"]
            }
            let element = makeSearchItem(
                artist["name"],
                "",
                img,
                "artist",
                artist["id"],
                "",
                artist["external_urls"]["spotify"]
            )
            artists_container.append(element)
        })
    } else {
        artists_container.append("<div class='no-results'>No results.</div>")
    }
}

// Add search results for albums
function addAlbumsResults(response) {
    albums_container.empty()
    let albums = response["items"]
    if (!albums.length == 0) {
        albums.forEach(function(album) {
            let img = "defaultProfilePicture.png"
            if (!album["images"].length == 0) {
                img = album["images"][0]["url"]
            }
            let element = makeSearchItem(
                album["name"],
                album["artists"][0]["name"],
                img,
                "album",
                album["id"],
                "",
                album["external_urls"]["spotify"]
            )
            albums_container.append(element)
        })
    } else {
        albums_container.append("<div class='no-results'>No results.</div>")
    }
}

// Add search results for playlists
function addPlaylistsResults(response) {
    playlists_container.empty()
    let playlists = response["items"]
    if (!playlists.length == 0) {
        playlists.forEach(function(playlist) {
            console.log("GLOB: " + globCollabUri)
            console.log("CUR: " + playlist["id"])
            if (playlist["id"] == globCollabUri) {
                return
            }
            let img = "defaultProfilePicture.png"
            if (!playlist["images"].length == 0) {
                img = playlist["images"][0]["url"]
            }
            let element = makeSearchItem(
                playlist["name"],
                playlist["owner"]["display_name"],
                img,
                "playlist",
                playlist["id"],
                "",
                playlist["external_urls"]["spotify"]
            )
            playlists_container.append(element)
        })
    } else {
        playlists_container.append("<div class='no-results'>No results.</div>")
    }
}

// Make a search query item
function makeSearchItem(heading, subheading, imageUrl, type, id, extra="", href="") {
    let item = "" +
    '<div data-extra="' + extra + '" data-type="' + type + '" data-id="' + id + '" class="search-item-container">' +
        '<div data-extra="' + extra + '" data-type="' + type + '" data-id="' + id + '" class="search-item-image-container">' +
            '<img data-extra="' + extra + '" data-type="' + type + '" data-id="' + id + '" class="search-item-image" src="' + imageUrl + '">' +
            '<div data-extra="' + extra + '" data-type="' + type + '" data-id="' + id + '" class="search-item-fan">' +
                ((type != "artist") ? '<div data-extra="' + extra + '" data-type="' + type + '" data-id="' + id + '" class="search-item-play"></div>' : '') +
                ((type == "song") ? '<div data-extra="' + extra + '" data-type="' + type + '" data-id="' + id + '" class="search-item-queue"></div>' : '') +
                '<div data-extra="' + extra + '" data-type="' + type + '" data-id="' + id + '" data-href="' + href + '"class="search-item-share"></div>' +
                ((type == "playlist") ? '<div data-extra="' + extra + '" data-type="' + type + '" data-id="' + id + '" class="search-item-add"></div>' : '') +
            '</div>' +
        '</div>' +
        '<div data-extra="' + extra + '" data-type="' + type + '" data-id="' + id + '" class="search-item-text-container">' +
            '<div data-extra="' + extra + '" data-type="' + type + '" data-id="' + id + '" class="search-item-name">' +
                heading +
            '</div>' +
            '<div data-extra="' + extra + '" data-type="' + type + '" data-id="' + id + '" class="search-item-artist">' +
                subheading +
            '</div>' +
        '</div>' +
    '</div>'
    return item
}

// Function to make slide in popups
let popupIndex = 0
function makePopup(message, error=false) {
    let id = popupIndex
    popupIndex ++
    let src = "img/check-mark.png"
    if (error) {
        src = "img/error.png"
    }
    let item = "" +
    '<div style="z-index: ' + (999999999999+id) + '" id="popup-' + id + '" class="popup-container">' +
        '<img src="' + src + '">' +
        '<div>' + message + '</div>' +
    '</div>'
    $("body").append(item)
    $("#popup-" + id).animate({top: "30px"}, 250).delay(3000).animate({top: "50px", opacity: 0}, 150)
    setTimeout(() => {
        $("#popup-" + id).remove()
    }, 3500);
}

// PLAYER UI FUNCTIONS

// Fade in search overlay
function fadeInSearch(playlist=false) {
    screenBlock.css("display", "block")
    screenBlock.animate({opacity: 1}, 250)
    searchOverlay.css("display", "grid")
    if (playlist) {
        $(".search-type-container:not(#search-playlists-container)").css("display", "none")
        $(".search-title:not(#search-playlists-title)").css("display", "none")
    }
    searchOverlay.animate({opacity: 1}, 250)
}

// Fade out search overlay
function fadeOutSearch() {
    screenBlock.animate({opacity: 0}, 250)
    searchOverlay.animate({opacity: 0}, 250)
    setTimeout(() => {
        screenBlock.css("display", "none")
        searchOverlay.css("display", "none")
        $(".search-type-container").css("display", "flex")
        $(".search-title").css("display", "block")
    }, 250);
}

// Fade in share popup
function fadeInShare(link, media=false) {
    screenBlockShare.css("display", "block")
    screenBlockShare.animate({opacity: 1}, 250)
    shareContainer.css("display", "flex")
    shareContainer.animate({opacity: 1}, 250)
    if (media) {
        shareContainer.find(".grid-title").html("Share " + media)
        $("#twitter").attr("href", "https://twitter.com/intent/tweet?url=" + link + "&text=Checkout this " + media + " on Spotify:")
        $("#email").attr("href", "mailto:?subject=Checkout%20this%20" + media + "&body=Hey!%0D%0A%0D%0ACheckout%20this%20" + media + "%20on%20Spotify!%0D%0A" + link)
        $("#link").html(link)
        $("#fb").attr("href", "https://www.facebook.com/sharer/sharer.php?u=" + link)
    } else {
        shareContainer.find(".grid-title").html("Invite users")
        $("#twitter").attr("href", "https://twitter.com/intent/tweet?url=https://morahman.me/musictogether/join.php?group_id=" + link + "&text=Join my Music Together group:")
        $("#email").attr("href", "mailto:?subject=Join%20my%20Music%20Together%20group!&body=Hey!Join%20my%20Music%20Together%20group%20session%20here%3Ahttps%3A%2F%2Fmorahman.me%2Fmusictogether%2Fjoin.php%3Fgroup_id%3D" + link)
        $("#link").html("https://morahman.me/musictogether/join.php?group_id=" + link)
        $("#fb").attr("href", "https://www.facebook.com/sharer/sharer.php?u=https://morahman.me/musictogether/join.php?group_id=" + link)
    }
}

// Fade out search overlay
function fadeOutShare() {
    screenBlockShare.animate({opacity: 0}, 250)
    shareContainer.animate({opacity: 0}, 250)
    setTimeout(() => {
        screenBlockShare.css("display", "none")
        shareContainer.css("display", "none")
    }, 250);
}

// Fade out loading overlay
function fadeInLoading() {
    $("#loading-block, lottie-player").fadeIn(300);
}

function fadeOutLoading() {
    $("#loading-block, lottie-player").fadeOut(300);
}

// Add a message in the message panel when song changes
function addSongChangeMessage(personId) {
    console.log("ADD SONG CHANGE MESSAGE")
    spotifyPlayer.getCurrentState().then(state => {
        if (!state) {
            console.error("No music playing.")
            return
        }
        addMessage(personId, "Now playing " + state.track_window.current_track.name, true)
    })
}

// Update the collaborative playlist
function updateCollabPlaylist(id) {
    // Get playlist from Spotify add elements
    getPlaylist(id).then(
        function(result) {
            result.tracks.items.forEach(function(item) {
                if (tracks_container.find($(".recent-track-container[data-id='" + item.track.id + "']")).length == 0) {
                    tracks_container.append(trackListItem(
                        item.track.name,
                        item.track.artists[0].name,
                        item.track.album.images[0].url,
                        item.track.id,
                        item.added_by.id
                    ))
                }
            })

            // Add event listener for like button
            $(".recent-track-image-likes-container").click(function() {
                if ($(this).attr("data-liked") == "1") {
                    socket.emit("unlikeSong", $(this).attr("data-id"))
                    $(this).attr("data-liked", "0")
                } else {
                    socket.emit("likeSong", $(this).attr("data-id"))
                    $(this).attr("data-liked", "1")
                    $(".liked-users-container[data-id='" + $(this).attr("data-id") + "']").fadeIn(250)
                }
            })

            $(".recent-track-image-likes-container").hover(function() {
                console.log($(this).find("div").text())
                if ($(this).find("div").text() != "0") {
                    $(".liked-users-container[data-id='" + $(this).attr("data-id") + "']").finish()
                    $(".liked-users-container[data-id='" + $(this).attr("data-id") + "']").fadeIn(250)
                }
            }, function() {
                if ($(this).find(".div").text() != "0") {
                    $(".liked-users-container[data-id='" + $(this).attr("data-id") + "']").finish()
                    $(".liked-users-container[data-id='" + $(this).attr("data-id") + "']").fadeOut(250)
                }
            })
        },
        function(error) {
            makePopup("Could not update collab playlist", true)
        }
    )
}

// Create a new recent-track-container object
function trackListItem(name, artist, img, songId, addedById) {
    let addedByName = getNameFromId(addedById)
    return `
        <div data-added-by="${addedById}" data-id="${songId}" class="recent-track-container">
            <div class="recent-track-image-container">
                <img class="recent-track-image" src="${img}">
                <div class="recent-track-image-likes-container" data-id="${songId}" data-liked="0">
                    <img class="recent-track-image-likes-icon" src="img/like.png">
                    <div data-id="${songId}" class="recent-track-image-likes-number">0</div>
                </div>
            </div>
            <div class="recent-track-text-container">
                <div class="recent-track-name">
                    ${name}
                </div>
                <div class="recent-track-artist">
                    ${artist}
                </div>
            </div>
            <div data-id="${songId}" class="liked-users-container">
                <div class="inner">
                    <div class="header">
                        Liked by
                    </div>
                    <div data-id="${songId}" class="users-container">
  
                    </div>
                </div>
            </div>
        </div>
    `
}

function likedByUserItem(userId) {
    let addedByName = getNameFromId(userId)
    let addedByImg = getImgFromId(userId)
    return `
        <div class="user">
            <img class="user-image=${userId}"src="${addedByImg}">
            <div class="user-name-${userId}">${addedByName}</div>
        </div>
    `
}

// Seek bar updater
var seekBarUpdateLoop = null;
function seekBarBegin() {
    console.log("hi")
    seekBarUpdateLoop = setInterval(function() {
        if (!paused) {
            let s = parseInt(seekBar.val())
            seekBar.val(s + 100)
            seekBarCurText.text((msToMinutesSeconds(s + 100)))
        }
    }, 100)
}