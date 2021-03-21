const changeNicknameBtn = $("#change-nickname")
const changeProfPicBtn = $("#change-pic")
const resetProfPicBtn = $("#reset-pic")
const resetAccountBtn = $("#reset-btn")
const logoutBtn = $("#logout")

const nicknameInput = $("#nickname-input")
const fileInput = $("#fileUpload")
const fileForm = $("#imgUpload")

const bigName = $("#nickname")
const smallName = $("#orig-name")

const profImages = $(".prof-pic")

changeNicknameBtn.click(function() {
    let newNickname = nicknameInput.val().trim()
    if (newNickname.length == 0) {
        alert("Nickname cannot be empty!")
        return
    }
    $.ajax({
        url: `api/changeNickname.php?access_token=${accessToken}&nickname=${newNickname}`,
        method: "GET",
        success: function(res) {
            bigName.text(newNickname)
            smallName.text("(" + origName  + ")")
            window.top.postMessage("changeNickname-" + newNickname, "*")
        },
        error: function(err) {
            console.error(err)
            alert("Could not change nickname")
        }
    })
})

// Change profile picture button
changeProfPicBtn.click(function() {
    document.getElementById("fileUpload").click()
})

fileForm.on("submit", function(e) {
    e.preventDefault()
    fadeInLoading()
    let data = new FormData(this)

    $.ajax({
        url: "api/uploadImg.php",
        method: "POST",
        data: data,
        processData: false,
        contentType: false,
        success: function(res) {
            console.log(res)
            if (res == "Invalid file type") {
                window.top.postMessage("settingsError-Image must be JPEG, GIF or PNG")
            } else if (res == "Server error") {
                window.top.postMessage("settingsError-Internal server error")
            } else if (res == "Too large") {
                window.top.postMessage("settingsError-Image must be under 500KB")
            } else if (res == "Corrupt image") {
                window.top.postMessage("settingsError-Image is corrupt")
            } else {
                console.log(typeof res)
                if (res.slice(-4) != ".png" && res.slice(-4) != ".jpg" && res.slice(-4) != ".gif" && res.slice(-5) != ".jpeg") {
                    window.top.postMessage("settingsError-Internal server error")
                    fadeOutLoading()
                    return
                }
                profImages.attr("src", res + "?" + new Date().getTime())
                window.top.postMessage("newProfPic-" + res + "?" + new Date().getTime(), "*")   
            }
            fadeOutLoading()
        },
        error: function(err) {
            console.error(err)
            window.top.postMessage("settingsError-An unknown error occured.")
            fadeOutLoading()
        }
    })
})

fileInput.change(function(e) {
    console.log(fileInput.val())
    if (fileInput.val() == "") {
        return
    }
    fileForm.submit()
})

// Reset profile picture button
resetProfPicBtn.click(function() {
    fadeInLoading()
    $.ajax({
        url: `api/resetProfPic.php?access_token=${accessToken}`,
        method: "GET",
        success: function(res) {
            profImages.attr("src", res + "?" + new Date().getTime())
            window.top.postMessage("newProfPic-" + res + "?" + new Date().getTime(), "*")
            fadeOutLoading()
        },
        error: function(err) {
            console.error(err)
            alert("Could not reset image")
            fadeOutLoading()
        }
    })
})

// Reset account button
resetAccountBtn.click(function() {
    $.ajax({
        url: `api/resetAccount.php?access_token=${accessToken}`,
        method: "GET",
        success: function(res) {
            window.top.postMessage("resetAccount", "*")
            window.top.postMessage("newProfPic-" + res, "*")
        },
        error: function(err) {
            console.error(err)
            alert("Could not reset image")
        }
    })
})

// Logout button
logoutBtn.click(function() {
    window.top.postMessage("logout", "*")
})