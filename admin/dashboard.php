<?php
Namespace MusicTogether;
require "adminDb.php";
session_start();
if (!(isset($_SESSION["admin_id"]))) {
    header("Location: index.php?error=session");
    exit();
}

$db = new AdminDatabaseConnection();
$db->connect();
$onlineUsers = $db->getUsers(true);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Music Together!</title>
    <link rel="stylesheet" href="style/dist/dashboard.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script>
        var access_token = "<?php echo $_SESSION["admin_token"] ?>";
    </script>
</head>
<body>
    <div id="settings-container" class="anim">
        <img src="img/settings.svg">
    </div>
    <ul id="settings-dropdown">
        <a href="manageUsers.php"><li>Manage users</li></a>
        <?php echo ($_SESSION["admin_level"] == 0 ? '<a href="manageAdmins.php"><li>Manage admins</li></a>' : "") ?>
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
        Online users (<?php echo ($onlineUsers == 0 ? "0" : count($onlineUsers)) ?>)
    </div>
    <?php
        if ($onlineUsers == 0) {
            echo '
            <table class="data-table">
                <tr>
                    <th>No online users</th>
                </tr>
            </table>
            ';
        }
    ?>
    <?php
        if ($onlineUsers != 0) {
            echo '
            <div class="table-container">
            <table class="data-table">
                <tr>
                    <th>Nickname</th>
                    <th>Group ID</th>
                    <th>Email</th>
                    <th>Ban</th>
                    <th>Details</th>
                </tr>
                <tr class="line first"><td colspan=5><div class="first"></div></td></tr>
            ';
            foreach ($onlineUsers as $user) {
                if ($user["banned"] == true) {
                    $ban = "Unban";
                } else {
                    $ban = "Ban";
                }
                echo '
                <tr data-banned="' . ($user["banned"] == true ? "1" : "0") . '" data-id="' . $user["id"] . '">
                    <td>' . $user["name"] . '</td>
                    <td>' . $user["groupID"] . '</td>
                    <td>' . $user["email"] . '</td>
                    <td data-id="' . $user["id"] . '"data-banned="' . ($user["banned"] == true ? "1" : "0") . '" class="yellow-btn no-anim ban-btn">' . $ban .'</td>
                    <td data-id="' . $user["id"] . '" class="yellow-btn no-anim details-btn">Details</td>
                </tr>
                <tr class="line"><td colspan=5><div></div></td></tr>
                ';
            }
            echo "</table></div>";
        }
    ?>
</body>
</html>
<script src="js/ui.js"></script>
<?php

if (isset($_GET["error"])) {
    if ($_GET["error"] == "forbidden") {
        echo '<script>makePopup("Insufficient privileges", true)</script>';
    }
}


?>