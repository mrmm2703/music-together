<?php
Namespace MusicTogether;
require_once "db/db.php";
require_once "user.php";

// ini_set('display_errors', '1');
// ini_set('display_startup_errors', '1');
// error_reporting(E_ALL);

// Check if access_token is available
if (!(isset($_GET["access_token"]))) {
    die("Authorisation required");
}

// Connect to database
$db = new DatabaseConnection();
if ($db->connect() !== true) {
    die("Database error");
}

// // Check if access_token is valid
if ($db->checkAccessToken($_GET["access_token"]) == false) {
    die("Invalid access token");
}

$user = new User($_GET["access_token"], $db);

?>

<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Settings</title>
    <script>
        const accessToken = "<?php echo $_GET["access_token"] ?>"
        const origName = "<?php echo $user->name ?>"
    </script>
    <link rel="stylesheet" href="style/dist/settings.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
</head>
<body>
    <div id="loading-block"></div>
    <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
    <lottie-player src="https://assets6.lottiefiles.com/packages/lf20_Q2FX6B.json"  background="transparent"  speed="1"  style="width: 300px; height: 300px;"  loop  autoplay></lottie-player>
    <div class="top">
        <div class="details">
            <div id="nickname"><?php echo ($user->nickname == null ? $user->name : $user->nickname) ?></div>
            <div id="orig-name"><?php echo ($user->nickname == null ? "" : "(" . $user->name . ")")?></div>
        </div>
        <img class="prof-pic" src="<?php echo $user->prof_pic ?>">
    </div>

    <div class="label">
        Nickname:
    </div>
    <div class="inp-cont">
        <input autocomplete="off" id="nickname-input" value="<?php echo $user->nickname ?>" placeholder="Enter nickname">
        <div class="yellow-btn" id="change-nickname">Change</div>
    </div>
    <div class="sub-text">
        This is the name other users will see in group sessions in Music Together! Your Spotify name will be unchanged.
    </div>

    <div class="label">
        Profile picture:
    </div>
    <div class="pic-container">
        <img class="prof-pic" src="<?php echo $user->prof_pic ?>">
        <div class="pic-btn-cont">
            <form id="imgUpload">
                <input type="text" value="<?php echo $user->id ?>" style="display:none" name="id">
                <input name="file" id="fileUpload" accept=".png,.jpg,.jpeg" type="file" style="display:none">
            </form>
            <div class="yellow-btn" id="change-pic">Change</div>
            <div class="yellow-btn" id="reset-pic">Reset</div>
        </div>
    </div>
    <div class="sub-text">
    This is the profile picture which users in Music Together will see. Your Spotify profile picture will be unchanged. Pressing reset will reset your profile picture to the image currently set on Spotify.
    </div>

    <div class="yellow-btn" id="reset-btn">
        Reset account
    </div>
    <div class="sub-text">This will reset your account. However, your logs will still remain on the server.</div>

    <div class="yellow-btn" id="logout">
        Logout
    </div>
</body>
</html>
<script src="js/player-ui.js"></script>
<script src="js/settings.js"></script>
<script>
$(document).ready(function() {
    fadeOutLoading()
})
</script>