<?php
Namespace MusicTogether;
require "adminDb.php";
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
session_start();
// Check if user is logged in
if (!(isset($_SESSION["admin_id"]))) {
    header("Location: index.php?error=session");
    exit();
}

// Check if limit and page exist
if (!(isset($_GET["limit"])) || !(isset($_GET["page"]))) {
    header("Location: dashboard.php");
    exit();
}

// Connect to database
$db = new AdminDatabaseConnection();
$db->connect();

// Check fro banned_word in URL parameter
$lim = $_GET["limit"];
$offset = ($_GET["page"]-1) * ($_GET["limit"]);
if (isset($_GET["banned_word"])) {
    $msgs = $db->getMessageLog($lim, $offset, $_GET["banned_word"]);
} else {
    $msgs = $db->getMessageLog($lim, $offset);
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Music Together!</title>
    <link rel="stylesheet" href="../style/hover-min.css">
    <link rel="stylesheet" href="style/dist/messageLog.css">
    <script>
        var page = <?php echo $_GET["page"] ?>;
        var limit = <?php echo $_GET["limit"] ?>
    </script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
</head>
<body>
    <div id="settings-container" class="anim">
        <img src="img/settings.svg">
    </div>
    <ul id="settings-dropdown">
        <a href="dashboard.php"><li>Online users</li></a>
        <a href="manageUsers.php"><li>Manage users</li></a>
        <?php echo ($_SESSION["admin_level"] == 0 ? '<a href="manageAdmins.php"><li>Manage admins</li></a>' : "") ?>
        <a href="bannedWords.php"><li>Banned words</li></a>
        <a href="logout.php"><li>Logout</li></a>
    </ul>
    <div id="header">
        Music Together!
    </div>
    <div id="subheader">
        Logged in as <?php echo $_SESSION["admin_level_desc"] ?>
    </div>
    <div class="top-container">
        <div class="title">
            Message log
        </div>
        <div class="page-btn-container">
            <div class="page-btn <?php echo ($_GET["page"] == 1 ? "" : "enabled hvr-shrink") ?>" id="back"><img src="img/back.svg"></div>
            <div class="page-btn <?php echo ($_GET["limit"] == count($msgs) ? "enabled hvr-shrink" : "") ?>" id="forward"><img src="img/forward.svg"></div>
        </div>
    </div>
    <?php
        if ($msgs == 0) {
            echo '
            <table class="data-table">
                <tr>
                    <th>No messages</th>
                </tr>
            </table>
            ';
        }
    ?>
    <div class="table-container">
    <?php
        if ($msgs != 0) {
            echo '
            <table class="data-table">
                <tr>
                    <th>User</th>
                    <th>Group ID</th>
                    <th>Date</th>
                    <th>Message</th>
                </tr>
                <tr class="line first"><td colspan=5><div class="first"></div></td></tr>
            ';
            foreach ($msgs as $msg) {
                echo '
                <tr>
                    <td><a class="yellow-btn no-anim" href="userDetails.php?id=' . $msg["id"] . '">'. $msg["user"] . '</a></td>
                    <td>' . $msg["group"] . '</td>
                    <td>' . $msg["date"] . '</td>
                    <td>' . $msg["message"] . '</td>
                </tr>
                <tr class="line"><td colspan=5><div></div></td></tr>
                ';
            }
            echo "</table>";
        }
    ?>
    </div>
</body>
</html>
<script src="js/ui.js"></script>
<script>
$(".page-btn.enabled").click(function() {
    if ($(this).attr("id") == "back") {
        page = page - 1
    } else {
        page = page + 1
    }
    window.location.replace("messageLog.php?limit=" + limit + "&page=" + page)
})
</script>
<?php

if (isset($_GET["banned_word_desc"])) {
    if ($_GET["banned_word_desc"] == "all") {
        echo "<script>makePopup('Showing messages containing any banned word')</script>";
    } else {
        echo "<script>makePopup('Showing messages containing \""
         . $_GET["banned_word_desc"] . "\"')</script>";
    }
}

?>