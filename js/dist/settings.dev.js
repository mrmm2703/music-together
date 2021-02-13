"use strict";

var changeNicknameBtn = $("#change-nickname");
var changeProfPicBtn = $("#change-pic");
var resetProfPicBtn = $("#reset-pic");
var resetAccountBtn = $("#reset-btn");
var logoutBtn = $("#logout");
var nicknameInput = $("#nickname-input");
var fileInput = $("#fileUpload");
var fileForm = $("#imgUpload");
var bigName = $("#nickname");
var smallName = $("#orig-name");
var profImages = $(".prof-pic");
changeNicknameBtn.click(function () {
  var newNickname = nicknameInput.val().trim();

  if (newNickname.length == 0) {
    alert("Nickname cannot be empty!");
    return;
  }

  $.ajax({
    url: "api/changeNickname.php?access_token=".concat(accessToken, "&nickname=").concat(newNickname),
    method: "GET",
    success: function success(res) {
      bigName.text(newNickname);
      smallName.text("(" + origName + ")");
      window.top.postMessage("changeNickname-" + newNickname, "*");
    },
    error: function error(err) {
      console.error(err);
      alert("Could not change nickname");
    }
  });
}); // Change profile picture button

changeProfPicBtn.click(function () {
  document.getElementById("fileUpload").click();
});
fileForm.on("submit", function (e) {
  e.preventDefault();
  var data = new FormData(this);
  $.ajax({
    url: "api/uploadImg.php",
    method: "POST",
    data: data,
    processData: false,
    contentType: false,
    success: function success(res) {
      console.log(res);
      profImages.attr("src", res + "?" + new Date().getTime());
      window.top.postMessage("newProfPic-" + res + "?" + new Date().getTime(), "*");
    },
    error: function error(err) {
      console.error(err);

      if (err == "Invalid file type") {
        alert("Invalid file type");
      } else if (err == "Server error") {
        alert("Server error occured");
      } else if (err == "Too large") {
        alert("File is too large");
      } else {
        alert("Unknown error");
      }
    }
  });
});
fileInput.change(function (e) {
  console.log(fileInput.val());

  if (fileInput.val() == "") {
    return;
  }

  fileForm.submit();
}); // Reset profile picture button

resetProfPicBtn.click(function () {
  $.ajax({
    url: "api/resetProfPic.php?access_token=".concat(accessToken),
    method: "GET",
    success: function success(res) {
      profImages.attr("src", res + "?" + new Date().getTime());
      window.top.postMessage("newProfPic-" + res + "?" + new Date().getTime(), "*");
    },
    error: function error(err) {
      console.error(err);
      alert("Could not reset image");
    }
  });
}); // Reset account button

resetAccountBtn.click(function () {
  $.ajax({
    url: "api/resetAccount.php?access_token=".concat(accessToken),
    method: "GET",
    success: function success(res) {
      window.top.postMessage("resetAccount", "*");
      window.top.postMessage("newProfPic-" + res, "*");
    },
    error: function error(err) {
      console.error(err);
      alert("Could not reset image");
    }
  });
}); // Logout button

logoutBtn.click(function () {
  window.top.postMessage("logout", "*");
});