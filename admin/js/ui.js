// Function to make slide in popups
let popupIndex = 0
function makePopup(message, error=false) {
    let id = popupIndex
    popupIndex ++
    let src = "../img/check-mark.png"
    if (error) {
        src = "../img/error.png"
    }
    let item = "" +
    '<div style="z-index: ' + (250+id) + '" id="popup-' + id + '" class="popup-container">' +
        '<img src="' + src + '">' +
        '<div>' + message + '</div>' +
    '</div>'
    $("body").append(item)
    $("#popup-" + id).animate({top: "30px"}, 250).delay(3000).animate({top: "50px", opacity: 0}, 150)
    setTimeout(() => {
        $("#popup-" + id).remove()
    }, 3500);
}

// Settings dropdown click handler
var settingsOpen = false;
$("#settings-container").click(function() {
    if (settingsOpen) {
        $("#settings-dropdown").css("display", "none")
    } else {
        $("#settings-dropdown").css("display", "flex")
    }
    settingsOpen = !settingsOpen;
})

// Click listener for all details button clicks
$(".details-btn").click(function() {
    window.location.href = "userDetails.php?id=" + $(this).data("id")
})

// Click listener for all ban buttons
$(".ban-btn").click(function() {
    let id = $(this).data("id")
    let group = $(this).data("group")
    let thisBtn = $(".ban-btn[data-id='" + id + "']")
    // Send request to API
    $.ajax("toggleBan.php?access_token=" + access_token + "&user_id=" + id)
        .done(function() {
            // Change button depending on current state
            if (thisBtn.attr("data-banned") == "1") {
                makePopup("User unbanned successfully")
                thisBtn.attr("data-banned", "0")
                thisBtn.html("Ban")
            } else {
                makePopup("User banned successfully")
                thisBtn.attr("data-banned", "1")
                thisBtn.html("Unban")
                sendBan(id)
            }
        })
        .fail(function(jqXHR) {
            // Check for error codes
            if (jqXHR.status == 403) {
                makePopup("Insufficient privilges", true)
            } else if (jqXHR.status == 500) {
                makePopup("Internal server error", true)
            } else if (jqXHR.status == 400) {
                makePopup("User not found", true)
            } else {
                makePopup("Unknown error occured", true)
            }
        })
})

function sendBan(user_id) {
    let socket = io.connect("https://morahman.me:3000")
    console.log(socket)
    socket.on("connect", () => {
        socket.emit("banUser", {
            accessToken: access_token,
            id: user_id
        })
        socket.close()
    })
}