"use strict";

// Add settings.php iframe to page
$("body").append("\n<iframe id=\"settings\" src=\"settings.php?access_token=".concat(accessToken, "\" \ntitle=\"Settings\" sandbox=\"allow-same-origin allow-scripts\"></iframe>\n<div id=\"settings-block\"></div>\n")); // Add styling

$("#settings").css({
  "position": "fixed",
  "top": 0,
  "bottom": 0,
  "right": "-35em",
  "width": "30em",
  "height": "100%",
  "border": "none",
  "border-radius": "21px 0 0 21px",
  "z-index": "99999999",
  "box-shadow": "0px 4px 10px 0px rgba(0,0,0,0.3)"
});
$("#settings-block").css({
  "position": "fixed",
  "height": "100%",
  "width": "100%",
  "top": 0,
  "right": "0",
  "left": "0",
  "bottom": 0,
  "background-color": "black",
  "opacity": "0.4",
  "display": "none",
  "cursor": "pointer"
}); // Slide in settings

function showSettings() {
  $("#settings").animate({
    "right": 0
  }, 500);
  $("#settings-block").fadeIn(500);
} // Fade out settings background block


$("#settings-block").click(function () {
  $("#settings").animate({
    "right": "-35em"
  }, 500);
  $(this).fadeOut(500);
}); // Handle events sent from the iframe

window.onmessage = function (event) {
  if (typeof event.data != "string") {
    return;
  }

  if (event.data == "logout") {
    window.location.href = "logout.php?action=logout";
  } else if (event.data == "resetAccount") {
    window.location.href = "logout.php?action=reset";
  } else if (event.data.substr(0, 14) == "changeNickname") {
    $(".nickname-text").text(event.data.substr(15));
    makePopup("Nickname changed");

    if (typeof socket != "undefined") {
      socket.emit("changeName", event.data.substr(15));
    }
  } else if (event.data.substr(0, 10) == "newProfPic") {
    $(".prof-pic").attr("src", event.data.substr(11));
    makePopup("Profile picture updated");

    if (typeof socket != "undefined") {
      socket.emit("changeProfPic", event.data.substr(11));
    }
  } else if (event.data.substr(0, 13) == "settingsError") {
    makePopup(event.data.substr(14), true);
  }
};