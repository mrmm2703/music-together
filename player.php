<?php
Namespace MusicTogether;
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

require_once "constants.php";
require_once "functions.php";
require_once "user.php";

session_start();

if (!isset($_GET["group_id"])) {
    header("Location: " . $homepage . "/dashboard.php");
    exit();
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php
        // Store the user's data in JavaScript
        echo '<script>
        var group_id = "';
        echo $_GET["group_id"];
        echo '"</script>';
        echo '<script>
        var user_name = "';
        echo $_SESSION["current_user"]->name;
        echo '"</script>';
        echo '<script>
        var user_prof_pic = "';
        echo $_SESSION["current_user"]->prof_pic;
        echo '"</script>';
        echo '<script>
        var user_id = "';
        echo $_SESSION["current_user"]->id;
        echo '"</script>';
        echo '<script>
        var accessToken = "';
        echo $_SESSION["current_user"]->access_token;
        echo '"</script>';
        echo '<script>
        var refreshToken = "';
        echo $_SESSION["refresh_token"];
        echo '"</script>';

    ?>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Music Together!</title>
    <link rel="stylesheet" href="style/dist/player.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="js/dist/socket.io.prod.js"></script>
</head>
<body>
    <!-- SPOTIFY WEB PLAYER -->
    <script src="https://sdk.scdn.co/spotify-player.js"></script>
    <script src="js/dist/spotify-player.prod.js"></script>

    <!-- SEARCH OVERLAY -->
    <div class="screen-block"></div>
    <div class="search-overlay">
        <div class="search-input-container">
            <input id="search-input-input" type="text" placeholder="Search">
            <img src="img/search.svg">
        </div>
        <div class="search-results-container">

            <div class="search-title" id="search-songs-title">
                Songs
            </div>
            <div class="search-type-container" id="search-songs-container"></div>

            <div class="search-title" id="search-artists-title">
                Artists
            </div>
            <div class="search-type-container" id="search-artists-container"></div>

            <div class="search-title" id="search-albums-title">
                Albums
            </div>
            <div class="search-type-container" id="search-albums-container"></div>

            <div class="search-title" id="search-playlists-title">
                Playlists
            </div>
            <div class="search-type-container" id="search-playlists-container"></div>

        </div>
    </div>

    <!-- MAIN PLAYER CONTENT -->
    <div class="grid-container">

        <div class="grid-group">
            <div class="grid-title">
                My group
            </div>
            <div class="group-id">
                Group ID: <?php echo $_GET["group_id"] ?>
            </div>
            <div class="yellow-btn group-invite-btn">
                Invite users
            </div>

            <div class="group-users-container">
<!-- 
                <div class="group-user-container">
                    <div class="group-user-image">
                        <img src="PROF_PIC">
                    </div>
                    <div class="group-user-text-container">
                        <div class="group-user-text-name">
                            NAME HERE
                        </div>
                        <div class="group-user-text-typing">
                            typing...
                        </div>
                    </div>
                </div>
-->

            </div>

        </div>

        <div class="grid-messages">
            <div class="grid-title">
                Messages
            </div>
            <div class="messages-container">

                <!-- <div class="message other">
                    <div class="message-name">
                        Carol Anne
                    </div>
                    <div class="message-text">
                        Hi there blah blah blah.
                    </div>
                    <div class="message-time">
                        15:09
                    </div>
                </div>

                <div class="message me">
                    <div class="message-name">
                        Carol Anne
                    </div>
                    <div class="message-text">
                        Hi there blah blah blah.
                    </div>
                    <div class="message-time">
                        15:09
                    </div>
                </div> -->

            </div>
            <div class="messages-input-container">
                <input id="messages-input" type="text" spellcheck="true" placeholder="Message">
                <a class="messages-input-btn yellow-btn" href="#">
                    Send
                </a>
            </div>
        </div>

        <div class="grid-recent">
            <div class="grid-title">
                Recently played
            </div>
            <div class="recent-tracks-container">

                <div class="recent-track-container">
                    <div class="recent-track-image-container">
                        <img class="recent-track-image" src="defaultProfilePicture.png">
                        <div class="recent-track-image-likes-container">
                            <img class="recent-track-image-likes-icon" src="img/like.png">
                            <div class="recent-track-image-likes-number">7</div>
                        </div>
                    </div>
                    <div class="recent-track-text-container">
                        <div class="recent-track-name">
                            The Sound
                        </div>
                        <div class="recent-track-artist">
                            The 1975
                        </div>
                    </div>
                </div>

                <div class="recent-track-container">
                    <div class="recent-track-image-container">
                        <img class="recent-track-image" src="defaultProfilePicture.png">
                        <div class="recent-track-image-likes-container">
                            <img class="recent-track-image-likes-icon" src="img/like.png">
                            <div class="recent-track-image-likes-number">7</div>
                        </div>
                    </div>
                    <div class="recent-track-text-container">
                        <div class="recent-track-name">
                            The Sound
                        </div>
                        <div class="recent-track-artist">
                            The 1975
                        </div>
                    </div>
                </div>

                <div class="recent-track-container">
                    <div class="recent-track-image-container">
                        <img class="recent-track-image" src="defaultProfilePicture.png">
                        <div class="recent-track-image-likes-container">
                            <img class="recent-track-image-likes-icon" src="img/like.png">
                            <div class="recent-track-image-likes-number">7</div>
                        </div>
                    </div>
                    <div class="recent-track-text-container">
                        <div class="recent-track-name">
                            The Sound
                        </div>
                        <div class="recent-track-artist">
                            The 1975
                        </div>
                    </div>
                </div>

            </div>

        </div>

        <div class="grid-player">

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

            <div class="player-container">
                <div class="player-search-container">
                    <div class="search-input-container">
                        <input type="text" placeholder="Search" id="dummy-search">
                        <img src="img/search.svg">
                    </div>
                </div>
                <div class="player-image-container">
                    <img src="defaultProfilePicture.png" class="player-image" id="player-image">
                </div>
                <div class="player-text-container">
                    <div class="player-text-name" id="player-name">Martin & Gina</div>
                    <div class="player-text-artist" id="player-artist">Polo G</div>
                </div>
                <div class="player-controls-container">
                    <div class="player-control" id="player-control-back"></div>
                    <div class="player-control" id="player-control-pause"></div>
                    <div class="player-control" id="player-control-forward"></div>
                </div>
                <div class="player-share-container">
                        <div class="player-share-playlist"></div>
                        <div class="player-share-like"></div>
                        <div class="player-share-share"></div>
                    </div>
            </div>

        </div>
    </div>
</body>
<script src="js/player.js"></script>
<script src="js/player-ui.js"></script>
</html>