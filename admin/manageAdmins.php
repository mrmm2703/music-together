<?php
Namespace MusicTogether;
require "adminDb.php";
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
session_start();
if (!(isset($_SESSION["admin_id"]))) {
    header("Location: index.php?error=session");
    exit();
}

if ($_SESSION["admin_level"] != 0) {
    header("Location: dashboard.php?error=forbidden");
    exit();
}

$db = new AdminDatabaseConnection();
$db->connect();
$users = $db->getAdminUsers();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Music Together!</title>
    <link rel="stylesheet" href="../style/hover-min.css">
    <link rel="stylesheet" href="style/dist/manageAdmins.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/js-sha256/0.9.0/sha256.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script>
        var access_token = "<?php echo $_SESSION["admin_token"] ?>";
        var admin_id = "<?php echo $_SESSION["admin_id"] ?>";
    </script>
</head>
<body>
    <div id="settings-container" class="anim">
        <img src="img/settings.svg">
    </div>
    <ul id="settings-dropdown">
        <a href="dashboard.php"><li>Online users</li></a>
        <a href="manageUsers.php"><li>Manage users</li></a>
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
        Admin users (<?php echo ($users == 0 ? "0" : count($users)) ?>)
    </div>
    <?php
        if ($users == 0) {
            echo '
            <table class="data-table">
                <tr>
                    <th>No admin users</th>
                </tr>
            </table>
            ';
        }
    ?>
    <div class="table-container">
    <?php
        if ($users != 0) {
            echo '
            <table class="data-table">
                <tr>
                    <th>Username</th>
                    <th>Security level</th>
                    <th>Email</th>
                    <th>Remove</th>
                    <th>Change password</th>
                </tr>
                <tr class="line first"><td colspan=5><div class="first"></div></td></tr>
            ';
            foreach ($users as $user) {
                echo '
                <tr data-id="' . $user["id"] . '">
                    <td>' . $user["username"] . '</td>
                    <td>' . $user["level_desc"] . '</td>
                    <td>' . $user["email"] . '</td>';
                if ($user["username"] == "super" || $user["username"] == $_SESSION["admin_username"]) {
                    echo "<td></td>";
                } else {
                    echo '<td data-id="' . $user["id"] . '" class="yellow-btn no-anim remove-btn">Remove</td>';
                }
                echo '<td data-id="' . $user["id"] . '" class="yellow-btn no-anim change-btn">Change</td>
                </tr>
                <tr class="line"><td colspan=5><div></div></td></tr>
                ';
            }
            echo "</table>";
        }
    ?>
    <a href="addAdmin.php" id="btn-continue" class="hvr-shrink">Add admin</a>
    </div>
</body>
</html>
<script src="js/ui.js"></script>
<script>
// When the remove button is clicked
$(".remove-btn").click(function() {
    let id = $(this).data("id")
    let dialog = confirm("Are you sure you want to remove this user? All data related to them will be removed, including banned words.")
    if (dialog == true) {
        $.ajax("removeAdmin.php?access_token=" + access_token + "&id=" + id)
        .done(function() {
            // Remove the user from the UI
            $("tr[data-id='" + id + "']").next().remove()
            $("tr[data-id='" + id + "']").remove()
            makePopup("User removed successfully")
        })
        .fail(function(jqXHR) {
            // Check for error codes
            if (jqXHR.status == 403) {
                makePopup("Insufficient privilges", true)
            } else if (jqXHR.status == 500) {
                makePopup("Internal server error", true)
            } else if (jqXHR.status == 400) {
                makePopup("User not found", true)
            } else {
                makePopup("Unknown error occured", true)
            }
        })
    }
})

// When the change password button is clicked
$(".change-btn").click(function() {
    let id = $(this).data("id")
    let dialog = prompt("Enter a new password:")
    // Check password's length
    if (!(dialog.length < 8)) {
        $.post(
            "changePassword.php",
            {
                "access_token": access_token,
                "id": id,
                "password": sha256(dialog)
            }
        ).done(function() {
            makePopup("Password changed")
            if (id == admin_id) {
                window.location.href = "logout.php"
            }
        })
        .fail(function(jqXHR, text) {
            console.log(text)
            // Check for error codes
            if (jqXHR.status == 403) {
                makePopup("Insufficient privilges", true)
            } else if (jqXHR.status == 500) {
                makePopup("Internal server error", true)
            } else if (jqXHR.status == 400) {
                makePopup("User not found", true)
            } else {
                makePopup("Unknown error occured", true)
            }
        })
    } else {
        makePopup("Password too short", true)
    }
})
</script>
<?php

if (isset($_GET["origin"])) {
    if ($_GET["origin"] == "create_success") {
        echo '<script>makePopup("Created new admin user")</script>';
    } else if ($_GET["prigin"] == "create_error") {
        echo '<script>makePopup("Could not create new admin user", true)</script>';
    }
}
?>