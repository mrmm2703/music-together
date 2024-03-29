<?php
Namespace MusicTogether;
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

require_once "user.php";
require_once "track.php";
require_once "constants.php";
require_once "functions.php";

session_start();
checkSessionExists();

// var_dump($_COOKIE);
$_SESSION["current_user"]->access_token = $_COOKIE["access_token"];
$_SESSION["access_token"] = $_COOKIE["access_token"];
[$recent_tracks, $next_recent_tracks_href] = $_SESSION["current_user"]->getRecentTracks(10);

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php
        // Store the dashboardMuted value
        echo '<script>
        var dashboardMuted = ';
        if ($_SESSION["current_user"]->dashboard_muted == "1")  {
            echo "true";
        } else {
            echo "false";
        }
        echo '</script>';
        // Store the access token as a variable
        echo '<script>
        var accessToken = "';
        echo $_SESSION["current_user"]->access_token;
        echo '"</script>';
        // Store the next href for recently played as a variable
        echo '<script>
        var nextRecentlyPlayedHref = "';
        echo $next_recent_tracks_href;
        echo '"</script>';
    ?>
    <?php
    if (isset($_SESSION["join_group_id"])) {
        echo("<script>var sess_val = " . $_SESSION["join_group_id"]  . "</script>");
    }
    ?>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Music Together! - Dashboard</title>
    <link rel="stylesheet" href="style/dist/dashboard.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
</head>
<body>
    <div id="loading-block"></div>
    <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
    <lottie-player src="https://assets6.lottiefiles.com/packages/lf20_Q2FX6B.json" background="transparent"
    speed="1" style="width: 300px; height: 300px;" loop autoplay></lottie-player>
    
    <?php if ($_SESSION["current_user"]->first_login) : ?>
    <div class="tutorial-container">
        <img id="1" src="img/tutorial/dashboard.png">
        <img id="2" style="top: -100%" src="img/tutorial/settings.png">
        <img id="3" style="top: -200%" src="img/tutorial/player.png">
        <img id="4" style="top: -300%" src="img/tutorial/collab_share.png">
        <img id="5" style="top: -400%" src="img/tutorial/search.png">
    </div>
    <div class="tut-btn-cont">
        <div id="tut-back" class="yellow-btn tut-btn">Back</div>
        <div id="tut-next" class="yellow-btn tut-btn">Next</div>
    </div>

    <script>
        var currentImg = 1
        $("#tut-next").click(function() {
            $(`.tutorial-container img:nth-of-type(${currentImg})`)
                .animate({left: "-110%"}, 500)
            currentImg += 1
            $(`.tutorial-container img:nth-of-type(${currentImg})`)
                .animate({left: "0"}, 500)
            if (currentImg == 6) {
                $(".tutorial-container, #tut-next, #tut-back").fadeOut(500)
            }
        })

        $("#tut-back").click(function() {
            if (currentImg != 1) {
                $(`.tutorial-container img:nth-of-type(${currentImg})`)
                .animate({left: "110%"}, 500)
                currentImg -= 1
                $(`.tutorial-container img:nth-of-type(${currentImg})`)
                    .animate({left: "0"}, 500)
            }
        })
    </script>
    <?php endif; ?>
    
    <div class="header">
        Music Together!
    </div>

    <div class="sub-header">
        Dive right back in...
    </div>

    <div class="upper-container">
        <div class="songs-container">

        <?php
            if (count($recent_tracks) == 0) {
                echo 'No recently played tracks';
            }
            foreach ($recent_tracks as $track) {
                echo '
                <div class="song-container" id="' . $track->id . '-cont">
                    <audio class="preview-sound" id="' . $track->id . '-audio" preload="auto" loop src="' . $track->preview_sound . '"></audio>
                    <a class="song-cover" id="' . $track->id . '" data-context="' . $track->context . '">
                        <img src="' . $track->cover_image .'" class="hvr-grow"/>
                    </a>
                    <div class="song-details-container">
                        <div class="song-name">
                            ' . $track->name .'
                        </div>
                        <div class="song-artist">
                            ' . $track->artists[0] . '
                        </div>
                    </div>
                </div>
                ';
            }
            
        ?>
        <sth class="fade-to-blue scroll" id="scroll-forward">
            <img src="img/control-forward.svg">
        </sth>
        <sth class="fade-to-blue scroll back" id="scroll-back">
            <img src="img/control-back.svg">
        </sth>
        </div>

        <div class="settings-container">
            <div class="settings-inner-container">
                <div class="settings-text-container">
                    <div class="settings-name nickname-text">
                        <?php echo ($_SESSION["current_user"]->nickname == null ? $_SESSION["current_user"]->name : $_SESSION["current_user"]->nickname); ?>
                    </div>
                    <a class="settings-btn yellow-btn" onclick="showSettings()">
                        Settings
                    </a>
                </div>
                <div class="settings-image">
                    <img class="prof-pic" src="<?php echo $_SESSION["current_user"]->prof_pic; ?>" />
                </div>
            </div>
        </div>
    </div>

    <div class="group-id-container">
        <div class="group-id-inner-container">
            <input id="group-id-entry" type="text" placeholder="Group ID"/>
            <a class="yellow-btn" onclick="joinBtn()">Join</a>
        </div>
    </div>
    <div class="create-group-btn-container">
        <a class="create-group-btn yellow-btn" onclick="createBtn()">
            Create new group
        </a>
    </div> 

    <div id="mute-btn"></div>
</body>
<script src="js/dashboard.js"></script>
<script src="js/player-ui.js"></script>
<script src="js/create-settings.js"></script>
</html>

<?php

if (isset($_SESSION["join_group_id"])) {
    unset($_SESSION["join_group_id"]);
}

if (isset($_GET["error"])) {
    if ($_GET["error"] == "server_connection") {
        echo '<script>makePopup("Could not connect to server", true)</script>';
    } elseif ($_GET["error"] == "spotify_auth") {
        echo '<script>makePopup("Could not authorise with Spotify", true)</script>';
    }
}
?>
<script>
$(document).ready(function() {
    fadeOutLoading()
})
</script>

<script>
<?php

$_SESSION["current_user"]->first_login = false;

?>