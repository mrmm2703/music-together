"use strict";

$("body").append("\n<iframe id=\"settings\" src=\"settings.php?access_token=".concat(accessToken, "\" \ntitle=\"Settings\" sandbox=\"allow-same-origin allow-scripts\"></iframe>\n<div id=\"settings-block\"></div>\n"));
$("#settings").css({
  "position": "fixed",
  "top": 0,
  "bottom": 0,
  "right": "-30em",
  "width": "30em",
  "height": "100%",
  "border": "none",
  "border-radius": "21px 0 0 21px",
  "z-index": "99999999"
});
$("#settings-block").css({
  "position": "fixed",
  "height": "100%",
  "width": "100%",
  "top": 0,
  "right": 0,
  "left": 0,
  "bottom": 0,
  "background-color": "black",
  "opacity": "0.4",
  "display": "none",
  "cursor": "pointer"
});

function showSettings() {
  $("#settings").animate({
    "right": 0
  }, 500);
  $("#settings-block").fadeIn(500);
}

$("#settings-block").click(function () {
  $("#settings").animate({
    "right": "-30em"
  }, 500);
  $(this).fadeOut(500);
});

window.onmessage = function (event) {
  if (event.data == "logout") {
    window.location.href = "logout.php?action=logout";
  } else if (event.data == "resetAccount") {
    window.location.href = "logout.php?action=reset";
  } else if (event.data.substr(0, 14) == "changeNickname") {
    $(".nickname-text").text(event.data.substr(15));

    if (typeof socket != "undefined") {
      socket.emit("changeName", event.data.substr(15));
    }
  } else if (event.data.substr(0, 10) == "newProfPic") {
    $(".prof-pic").attr("src", event.data.substr(11));

    if (typeof socket != "undefined") {
      socket.emit("changeProfPic", event.data.substr(11));
    }
  }
};