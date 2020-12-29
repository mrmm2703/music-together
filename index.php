<?php
Namespace MusicTogether;
session_destroy();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style/dist/index.min.css">
    <link rel="stylesheet" href="style/hover-min.css">
    <title>Music Together!</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script>
        $(document).ready(function() {
            if (window.matchMedia("(max-width: 767px)").matches) {
                alert("This website may not work properly on mobile.")
            }
        })
    </script>
</head>
<body>
    <?php
    /**
     * Show a JavaScript alert
     * 
     * @param string $msg The message to show to the user
     * @return void
     */
    function showErrorAlert($msg) {
        echo '<script type="text/javascript">alert("' . $msg . '")</script>';
    }

    if (isset($_GET["error"])) {
        if ($_GET["error"] == "no_premium") {
            showErrorAlert("You need a Spotify Premium subscription to use Music Together!");
        } elseif (substr($_GET["error"], 0, 2) == "db") {
            showErrorAlert("A database error occured. Error: " . $_GET["error"]);
        } elseif (substr($_GET["error"], 0, 6) == "guzzle") {
            showErrorAlert("An error occured while connecting to Spotify. Error: " . $_GET["error"]);
        } elseif ($_GET["error"] == "banned") {
            showErrorAlert("You are banned!");
        } else {
            showErrorAlert("An unknown error occured. Error: " . $_GET["error"]);
        }
    }

    ?>
    <div id="header">
        Music Together!
    </div>
    <a href="auth/initialise.php" id="btn-continue" class="hvr-shrink">
        <div>
            Continue with Spotify   
        </div>
    </a>
    <div class="footer">
        Copyright © 2020 Muhammad Rahman. All right reserved.
    </div>
</body>
</html>