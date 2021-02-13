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
    <script>
        // Function to make slide in popups
        let popupIndex = 0
        function makePopup(message, error=false) {
            let id = popupIndex
            popupIndex ++
            let src = "img/check-mark.png"
            if (error) {
                src = "img/error.png"
            }
            let item = "" +
            '<div style="z-index: ' + (250+id) + '" id="popup-' + id + '" class="popup-container">' +
                '<img src="' + src + '">' +
                '<div>' + message + '</div>' +
            '</div>'
            $("body").append(item)
            $("#popup-" + id).animate({top: "30px"}, 250).delay(3000).animate({top: "50px", opacity: 0}, 150)
            setTimeout(() => {
                $("#popup-" + id).remove()
            }, 3500);
        }
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
        echo "<script>makePopup('" . $msg . "', true)</script>";
    }
    
    function showSuccessAlert($msg) {
        echo "<script>makePopup('" . $msg . "')</script>";
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

    if (isset($_GET["action"])) {
        if ($_GET["action"] == "banned") {
            showErrorAlert("You have been banned");
        } elseif ($_GET["action"] == "logout") {
            showSuccessAlert("Successfully logged out");
        } elseif ($_GET["action"] == "reset") {
            showSuccessAlert("Account reset");
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