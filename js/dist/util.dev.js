"use strict";

// UTILITY FUNCTIONS
// Convert milliseconds into seconds
function msToMinutesSeconds(ms) {
  var seconds = ms / 1000;
  var min = Math.floor(ms / 60);
  var sec = Math.floor(seconds - min);
  return min.toString() + ":" + sec.toString().padStart(2, "0");
}