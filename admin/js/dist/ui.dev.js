"use strict";

// Function to make slide in popups
var popupIndex = 0;

function makePopup(message) {
  var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var id = popupIndex;
  popupIndex++;
  var src = "../img/check-mark.png";

  if (error) {
    src = "../img/error.png";
  }

  var item = "" + '<div style="z-index: ' + (250 + id) + '" id="popup-' + id + '" class="popup-container">' + '<img src="' + src + '">' + '<div>' + message + '</div>' + '</div>';
  $("body").append(item);
  $("#popup-" + id).animate({
    top: "30px"
  }, 250).delay(3000).animate({
    top: "50px",
    opacity: 0
  }, 150);
  setTimeout(function () {
    $("#popup-" + id).remove();
  }, 3500);
} // Settings dropdown click handler


var settingsOpen = false;
$("#settings-container").click(function () {
  if (settingsOpen) {
    $("#settings-dropdown").css("display", "none");
  } else {
    $("#settings-dropdown").css("display", "flex");
  }

  settingsOpen = !settingsOpen;
}); // Click listener for all details button clicks

$(".details-btn").click(function () {
  window.location.href = "userDetails.php?id=" + $(this).data("id");
}); // Click listener for all ban buttons

$(".ban-btn").click(function () {
  var id = $(this).data("id");
  var thisBtn = $(".ban-btn[data-id='" + id + "']"); // Send request to API

  $.ajax("toggleBan.php?access_token=" + access_token + "&user_id=" + id).done(function () {
    // Change button depending on current state
    if (thisBtn.attr("data-banned") == "1") {
      makePopup("User unbanned successfully");
      thisBtn.attr("data-banned", "0");
      thisBtn.html("Ban");
    } else {
      makePopup("User banned successfully");
      thisBtn.attr("data-banned", "1");
      thisBtn.html("Unban");
    }
  }).fail(function (jqXHR) {
    // Check for error codes
    if (jqXHR.status == 403) {
      makePopup("Insufficient privilges", true);
    } else if (jqXHR.status == 500) {
      makePopup("Internal server error", true);
    } else if (jqXHR.status == 400) {
      makePopup("User not found", true);
    } else {
      makePopup("Unknown error occured", true);
    }
  });
});