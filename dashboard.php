<?php

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

require_once "user.php";
require_once "track.php";
require_once "constants.php";

session_start();

$recent_tracks = $_SESSION["current_user"]->getRecentTracks(3);
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
    ?>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Music Together! - Dashboard</title>
    <link rel="stylesheet" href="style/dist/dashboard.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
</head>
<body>
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
                    <a class="song-cover" href="#" id="' . $track->id . '">
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
        
        </div>

        <div class="settings-container">
            <div class="settings-inner-container">
                <div class="settings-text-container">
                    <div class="settings-name">
                        <?php echo $_SESSION["current_user"]->name; ?>
                    </div>
                    <a class="settings-btn yellow-btn" href="#">
                        Settings
                    </a>
                </div>
                <div class="settings-image">
                    <img id="prof-pic" src="<?php echo $_SESSION["current_user"]->prof_pic; ?>" />
                </div>
            </div>
        </div>
    </div>

    <div class="group-id-container">
        <div class="group-id-inner-container">
            <input type="text" placeholder="Group ID"/>
            <a href="#" class="yellow-btn">Join</a>
        </div>
    </div>
    <div class="create-group-btn-container">
        <a class="create-group-btn yellow-btn" href="#">
            Create new group
        </a>
    </div>

    <div id="mute-btn"></div>
</body>
<script>
    var muteBtn = $("#mute-btn");
    $(document).ready(function() {
        // Initialise volume of preview-sound to 0.0
        let audioPlayers = document.getElementsByClassName("preview-sound")
        let i
        for (i=0; i<audioPlayers.length; i++) {
            audioPlayers[i].volume = 0.0
        }

        // Initialise the mute button
        if (dashboardMuted) {
            muteBtn.css("background-image", 'url("https://morahman.me/musictogether/img/muted.png')
        } else {
            muteBtn.css("background-image", 'url("https://morahman.me/musictogether/img/unmuted.png')
        }
    })

    // Event handler for mute-btn
    muteBtn.click(function() {
        if (dashboardMuted) {
            muteBtn.css("background-image", 'url("https://morahman.me/musictogether/img/unmuted.png')
        } else {
            muteBtn.css("background-image", 'url("https://morahman.me/musictogether/img/muted.png')
        }
        dashboardMuted = !dashboardMuted
        // Send a request to update the database
        $.get(
            "api/updateDashboardMuted.php",
            {
                access_token: accessToken,
                muted: dashboardMuted
            }
        )
    })

    // Event handler for on hover
    $(".song-cover").hover(function() {
        if (!dashboardMuted) {
            let audioPlayer = document.getElementById(this.id + "-audio")
            audioPlayer.play()
            $("#" + this.id + "-audio").stop(true, false)
            $("#" + this.id + "-audio").animate({volume: 0.5}, 500)
        }
    }, function() {
        if (!dashboardMuted) {
            let audioPlayer = document.getElementById(this.id + "-audio")
            $("#" + this.id + "-audio").stop(true, false);
            $("#" + this.id + "-audio").animate({volume: 0}, 500, function() {
                audioPlayer.pause();
            })
        }
    })
</script>
</html>