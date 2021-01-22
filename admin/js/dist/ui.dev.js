"use strict";

var settingsOpen = false;
$("#settings-container").click(function () {
  if (settingsOpen) {
    $("#settings-dropdown").css("display", "none");
  } else {
    $("#settings-dropdown").css("display", "flex");
  }

  settingsOpen = !settingsOpen;
});