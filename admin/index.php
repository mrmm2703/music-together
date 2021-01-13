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
    <link rel="stylesheet" href="../style/hover-min.css">
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
    <div id="header">
        Music Together!
    </div>
    <form action="login.php" method="post">
        <input id="username-input" type="text" placeholder="Username">
        <input id="password-input" type="password" placeholder="Password">
    </form>
    <a href="index.php" id="btn-continue" class="hvr-shrink">
        <div>
            Authenticate
        </div>
    </a>
    <div class="footer">
        Copyright © 2020 Muhammad Rahman. All right reserved.
    </div>
</body>
</html>