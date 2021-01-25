<?php
Namespace MusicTogether;
require "adminDb.php";
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
session_start();
if (!(isset($_SESSION["admin_id"]))) {
    header("Location: index.php?error=session");
    exit();
}

if ($_SESSION["admin_level"] != 0) {
    header("Location: dashboard.php?error=forbidden");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Music Together!</title>
    <link rel="stylesheet" href="../style/hover-min.css">
    <link rel="stylesheet" href="style/dist/manageAdmins.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/js-sha256/0.9.0/sha256.min.js"></script>
    <script>
        var access_token = "<?php echo $_SESSION["admin_token"] ?>";
    </script>
</head>
<body>
    <div id="settings-container" class="anim">
        <img src="img/settings.svg">
    </div>
    <ul id="settings-dropdown">
        <a href="dashboard.php"><li>Online users</li></a>
        <a href="manageUsers.php"><li>Manage users</li></a>
        <a href="bannedWords.php"><li>Banned words</li></a>
        <a href="messageLog.php?limit=50&page=1"><li>Message log</li></a>
        <a href="logout.php"><li>Logout</li></a>
    </ul>
    <div id="header">
        Music Together!
    </div>
    <div id="subheader">
        Logged in as <?php echo $_SESSION["admin_level_desc"] ?>
    </div>
    <div class="title">
        Add an admin
    </div>
    <form id="form1" autocomplete="off" method="post" action="createAdmin.php">
        <input id="username-input" name="username" type="text" placeholder="Username"/>
        <input id="password-input" name="password" type="password" placeholder="Password"/>
        <input id="email-input" name="email" type="email" placeholder="Email"/>
        <select name="level">
            <option value="0">Superuser</option>
            <option value="1">Administrator</option>
            <option value="2">Viewer</option>
        </select>
        <div href="addAdmin.php" id="btn-continue" class="hvr-shrink">Create user</div>
    </form>
</body>
</html>
<script src="js/ui.js"></script>
<script>

// Function from ui.dev by Tyler McGinnis
function emailIsValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Get a reference to all inputs
var usernameInput = document.getElementById("username-input")
var passwordInput = document.getElementById("password-input")
var emailInput = document.getElementById("email-input")
var form = document.getElementById("form1")

// Create user button click listener
$("#btn-continue").click(function() {
    // Check the inputs
    if (usernameInput.value.length < 5) {
        makePopup("Username too short", true)
    } else if (passwordInput.value.length < 8) {
        makePopup("Password too short", true)
    } else if (!emailIsValid(emailInput.value)) {
        makePopup("Invalid email", true)
    } else {
        // If the inputs are all okay
        passwordInput.value = sha256(passwordInput.value)
        form.submit()
    }
})
</script>
<?php

if (isset($_GET["error"])) {
    if ($_GET["error"] == "username_exists") {
        echo '<script>makePopup("Username exists", true)</script>';
    } else if ($_GET["error"] == "email_exists") {
        echo '<script>makePopup("Email exists", true)</script>';
    }
}


?>