// CLIENT EVENT LISTENERS
var searchQuery = ""

// When a user presses a key in the message input
document.getElementById("messages-input").addEventListener("keyup", function(e) {
    // When enter key is pressed
    if (e.keyCode === 13) {
        e.preventDefault()
        socket.emit("message", message_input.value)
        message_input.value = ""
    } else { // When any other is pressed
        socket.emit("typing")
    }
})

// Player search input event
dummySearch.addEventListener("keyup", function(e) {
    // When enter key is pressed
    if (e.keyCode === 13) {
        e.preventDefault()
        searchQuery = dummySearch.value;
        actualSearch.value = searchQuery;
        fadeInSearch()
        setTimeout(() => {
            dummySearch.value = ""
        }, 500);
        searchSpotify(searchQuery)
    }
})

// When enter is pressed on the dummy search box
actualSearch.addEventListener("keyup", function(e) {
    if (e.keyCode === 13) {
        e.preventDefault()
        searchQuery = actualSearch.value
        searchSpotify(searchQuery)
    }
})

// When search screen block is pressed
screenBlock.click(function() {
    fadeOutSearch()
})

// When the share screen block is pressed
screenBlockShare.click(function() {
    fadeOutShare()
})

// Add a song to collaborative playlist
function addToCollab() {
    spotifyPlayer.getCurrentState().then(state => {
        socket.emit("doesCollabExist", state.track_window.current_track.id)
    })
}