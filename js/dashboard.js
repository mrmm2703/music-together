// Get some HTML elements
var muteBtn = $("#mute-btn");
var groupIdInput = document.getElementById("group-id-entry")

var d

function checkGroupExists(groupId) {
    // Input validation
    groupId = groupId.trim()
    if (isNaN(groupId)) {
        throw "Invalid"
    }
    if (groupId.length != 4) {
        throw "Group ID must be 4 characters"
    }
    try {
        groupId = parseInt(groupId, 10)
    } catch (error) {
        throw "Invalid"
    }
    if (groupId < 0) {
        throw "Invalid"
    }
    // GET request to the API
    var result = null
    $.ajax({
        url: "api/checkGroupExists.php?access_token="
            + accessToken + "&group_id=" + groupId,
        type: "get",
        dataType: "html",
        async: false,
        success: function(data) {
            result = data
        }
    })
    // Check the result
    if (result == "EXISTS") {
        return true
    } else if (d == "DOES NOT EXIST") {
        return false
    }
}

$.ajaxSetup({
    // Disable caching of AJAX responses
    cache: false
});

// Run when the page loads
$(document).ready(function() {
    // Initialise volume of preview-sound to 0.0
    let audioPlayers = document.getElementsByClassName("preview-sound")
    let i
    for (i=0; i<audioPlayers.length; i++) {
        audioPlayers[i].volume = 0.0
    }

    // Initialise the mute button
    if (dashboardMuted) {
        muteBtn.css("background-image", 'url("https://morahman.me/musictogether/img/muted.png')
    } else {
        muteBtn.css("background-image", 'url("https://morahman.me/musictogether/img/unmuted.png')
    }
})

// Event handler for mute-btn
muteBtn.click(function() {
    if (dashboardMuted) {
        muteBtn.css("background-image", 'url("https://morahman.me/musictogether/img/unmuted.png')
    } else {
        muteBtn.css("background-image", 'url("https://morahman.me/musictogether/img/muted.png')
    }
    dashboardMuted = !dashboardMuted
    // Send a request to update the database
    $.get(
        "api/updateDashboardMuted.php",
        {
            access_token: accessToken,
            muted: dashboardMuted
        }
    )
})

// Event handler for on hover
$(".song-cover").hover(function() {
    if (!dashboardMuted) {
        let audioPlayer = document.getElementById(this.id + "-audio")
        audioPlayer.play()
        $("#" + this.id + "-audio").stop(true, false)
        $("#" + this.id + "-audio").animate({volume: 0.25}, 500)
    }
}, function() {
    if (!dashboardMuted) {
        let audioPlayer = document.getElementById(this.id + "-audio")
        $("#" + this.id + "-audio").stop(true, false);
        $("#" + this.id + "-audio").animate({volume: 0}, 500, function() {
            audioPlayer.pause();
        })
    }
})

function joinBtn() {
    try {
        if (checkGroupExists(groupIdInput.value) == true) {
            window.location.href = "https://morahman.me/player.php?group_id=" + groupIdInput.value
        } else {
            alert("Group does not exist.")
        }
    } catch (error) {
        if (error == "Invalid") {
            alert("Invalid Group ID entered.")
        } else if (error == "GET request error") {
            alert("An internal error occured. Error: GET_REQUEST_ERROR")
        } else if (error == "Group ID must be 4 characters") {
            alert(error)
        } else {
            alert("An unknown error occured. Error: " + error)
        }
    }
}

function createBtn() {
    // GET request to the API
    var result = null
    $.ajax({
        url: "api/createGroupID.php?access_token="
            + accessToken,
        type: "get",
        dataType: "html",
        success: function(data) {
            window.location.href = "player.php?group_id=" + data
        }
    })
}