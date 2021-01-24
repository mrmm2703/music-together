<?php
Namespace MusicTogether;
session_destroy();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style/dist/index.css">
    <link rel="stylesheet" href="../style/hover-min.css">
    <title>Music Together!</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/js-sha256/0.9.0/sha256.min.js"></script>
    <script>
        $(document).ready(function() {
            if (window.matchMedia("(max-width: 767px)").matches) {
                alert("This website may not work properly on mobile.")
            }
        })
    </script>
    <script src="js/dist/ui.prod.js"></script>
    <script>
    $(document).ready(function() {
        <?php
            if (isset($_GET["error"])) {
                if ($_GET["error"] == "password") {
                    echo "makePopup('Incorrect password', true)";
                } else if ($_GET["error"] == "nouser") {
                    echo "makePopup('Incorrect username', true)";
                } else if ($_GET["error"] == "unknown") {
                    echo "makePopup('An error occured', true)";
                } else if ($_GET["error"] == "db") {
                    echo "makePopup('A database error occured', true)";
                } else if ($_GET["error"] == "session") {
                    echo "makePopup('Session expired', true)";
                } else {
                    echo "makePopup('Something went wrong', true)";
                }
            } else if (isset($_GET["logout"])) {
                echo "makePopup('Successfully logged out')";
            }
        ?>
    })
    </script>
</head>
<body>
    <div id="header">
        Music Together!
    </div>
    <form id="form" method="post" action="login.php">
        <input id="username-input" name="username" type="text" placeholder="Username">
        <input id="password-input" name="password" type="password" placeholder="Password">
    </form>
        <div id="btn-continue" class="hvr-shrink">
            Authenticate
        </div>
    <div class="footer">
        Copyright © 2020 Muhammad Rahman. All right reserved.
    </div>
</body>
</html>
<script>
var username_input = document.getElementById("username-input")
var password_input = document.getElementById("password-input")
var form = document.getElementById("form")
$("#btn-continue").click(function() {
    let username = username_input.value
    let password = password_input.value

    // Data validation
    if (username.trim() == "" || password.trim() == "") {
        makePopup("Inputs cannot be empty", true)
    } else {
        username = username.trim()
        if (username.length < 5) {
            makePopup("Username too short", true)
        } else {
            if (password.length < 8) {
                makePopup("Password is too short", true)
            } else {
                // Send login request
                password_input.value = sha256(password)
                form.submit()
            }
        }
    }
})
</script>