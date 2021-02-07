<?php
Namespace MusicTogether;
require "adminDb.php";

session_start();
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

if (!(isset($_SESSION["admin_id"]))) {
    header("Location: index.php?error=session");
    exit();
}

if (!(isset($_GET["id"]))) {
    Header("Location: dashboard.php");
    exit();
}

$db = new AdminDatabaseConnection();
$db->connect();
$user = $db->getUserDetails($_GET["id"]);
$bannedWords = $db->getBannedWords($_GET["id"]);
$loginLogs = $db->getLoginLogs($_GET["id"]);
$groupLogs = $db->getGroupLogs($_GET["id"]);

if ($user["banned"] == true) {
    $ban = "Unban";
} else {
    $ban = "Ban";
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Music Together!</title>
    <link rel="stylesheet" href="../style/hover-min.css">
    <link rel="stylesheet" href="style/dist/userDetails.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="../js/dist/socket.io.prod.js"></script>
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
    <main>
        <div class="left-pane">
            <div class="details-container">
                <img src="<?php echo ($user["profPic"] == "defaultProfilePicture.png") ? "../defaultProfilePicture.png" : $user["profPic"] ?>">
                <div class="name">
                    <?php echo $user["name"] ?>
                </div>
            </div>
            <div class="details-text">
                Original name: <?php echo $user["originalName"] ?><br>
                Spotify ID: <?php echo $user["id"] ?><br>
                Last Login: <?php echo $loginLogs[0] ?><br>
                Email: <?php echo $user["email"] ?>
            </div>
            <div data-id="<?php echo $user['id'] ?>" data-banned="<?php echo ($user["banned"] == true ? "1" : "0") ?>" id="btn-continue" class="hvr-shrink ban-btn"><?php echo $ban ?></div>
        </div>
        <div class="right-pane">
            <div class="title">Banned word usage</div>
            <div class="table-container">
    
                <table class="data-table">
                    <?php
                    if ($bannedWords == 0) {
                        echo "<tr>
                        <th>No banned words</th>
                        </tr>";
                    } else {
                    echo '
                        <tr>
                            <th>Word</th>
                            <th>Group ID</th>
                            <th>Date</th>
                        </tr><tr class="line first"><td colspan="3"><div class="first"></div></td></tr>';
                        foreach ($bannedWords as $word) {
                            echo '
                            <tr>
                                <td>' . $word["word"] . '</td>
                                <td>' . $word["group"] . '</td>
                                <td>' . $word["date"] . '</td>
                            </tr>
                            <tr class="line"><td colspan="3"><div></div></td></tr>';
                        }
                    }
                    ?>
                </table>
            </div>


            <div class="title">Login logs</div>
            <div class="table-container">
    
                <table class="data-table">
                    <?php
                    if ($loginLogs == 0) {
                        echo "<tr>
                        <th>No login logs</th>
                        </tr>";
                    } else {
                        echo '
                            <tr>
                                <th>Date</th>
                            </tr><tr class="line first"><td><div class="first"></div></td></tr>';
                            foreach ($loginLogs as $log) {
                                echo '
                                <tr>
                                    <td>' . $log . '</td>
                                </tr>
                                <tr class="line"><td><div></div></td></tr>';
                            }
                        }
                    ?>
                </table>
            </div>

            <div class="title">Group logs</div>
            <div class="table-container">
    
                <table class="data-table">
                    <?php
                    if ($groupLogs == 0) {
                        echo "<tr>
                        <th>No group logs</th>
                        </tr>";
                    } else {
                    echo '
                        <tr>
                            <th>Group ID</th>
                            <th>Date</th>
                        </tr><tr class="line first"><td colspan="2"><div class="first"></div></td></tr>';
                        foreach ($groupLogs as $log) {
                            echo '
                            <tr>
                                <td>' . $log["group"] . '</td>
                                <td>' . $log["date"] . '</td>
                            </tr>
                            <tr class="line"><td colspan="2"><div></div></td></tr>';
                        }
                    }
                    ?>
                </table>
            </div>



        </div>
    </main>
</body>
</html>
<script src="js/ui.js"></script>