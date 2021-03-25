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

$db = new AdminDatabaseConnection();
$db->connect();
$words = $db->getAllBannedWords();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Music Together!</title>
    <link rel="stylesheet" href="../style/hover-min.css">
    <link rel="stylesheet" href="style/dist/dashboard.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script>
        var access_token = "<?php echo $_SESSION["admin_token"] ?>";
        var admin_id = "<?php echo $_SESSION["admin_id"] ?>";
    </script>
    <script src="../js/dist/socket.io.prod.js"></script>
</head>
<body>
    <div id="settings-container" class="anim">
        <img src="img/settings.svg">
    </div>
    <ul id="settings-dropdown">
        <a href="dashboard.php"><li>Online users</li></a>
        <a href="manageUsers.php"><li>Manage users</li></a>
        <?php echo ($_SESSION["admin_level"] == 0 ? '<a href="manageAdmins.php"><li>Manage admins</li></a>' : "") ?>
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
        Banned words (<?php echo ($words == 0 ? "0" : count($words)) ?>)
    </div>
    <?php
        if ($words == 0) {
            echo '
            <table id="table" class="data-table">
                <tr id="no-users">
                    <th>No online users</th>
                </tr>
            </table>
            ';
        }
    ?>
    <?php
        if ($words != 0) {
            echo '
            <div class="table-container">
            <table id="table" class="data-table">
                <tr>
                    <th>Word</th>
                    <th>Added by</th>
                    <th>Date added</th>
                    <th>Uses</th>
                    <th>Remove</th>
                </tr>
                <tr class="line first"><td colspan=5><div class="first"></div></td></tr>
            ';
            foreach ($words as $word) {
                echo '
                <tr data-id="' . $word["id"] . '">
                    <td>' . $word["word"] . '</td>
                    <td>' . $word["addedBy"] . '</td>
                    <td>' . $word["addedDate"] . '</td>
                    <td data-word="' . $word["word"] . '" data-id="' . $word["id"] . '" class="yellow-btn no-anim uses-btn">' . $word["useCount"] . '</td>
                    <td data-id="' . $word["id"] . '" class="yellow-btn no-anim remove-btn">Remove</td>
                </tr>
                <tr class="line"><td colspan=5><div></div></td></tr>
                ';
            }
            echo '</table><div id="btn-show-all" class="hvr-shrink btn">Show all messages containing banned words</div>
            <div id="btn-new" class="hvr-shrink btn" style="margin-left: 30px">New banned word</div></div>';
        }
    ?>
</body>
</html>
<script src="js/ui.js"></script>
<script>
// When uses button is clicked show all uses in message log
function usesClick() {
    window.location.href = "messageLog.php?limit=50&page=1&banned_word="
    + $(this).data("id") + "&banned_word_desc=" + $(this).data("word")
}
$(".uses-btn").click(usesClick)

// Add a new row to the table
function addToTable(word, addedBy, date, uses, id) {
    $("#table").append(
        '<tr data-id="' + id + '"><td>' + word + '</td><td>' + addedBy + '</td>'
        + '<td>' + date + '</td><td data-word="' + word + '" data-id="' + id
        + '" class="yellow-btn no-anim uses-btn">' + uses + '</td><td data-id="'
        + id + '" class="yellow-btn no-anim remove-btn">Remove</td></tr>'
        + '<tr class="line"><td colspan=5><div></div></td></tr>'
    )
    $(".uses-btn").click(usesClick)
    $(".remove-btn").click(removeClick)
}

// When new banned word is clicked
$("#btn-new").click(function() {
    $dialog = prompt("Enter a new banned word:")
    $dialog = $dialog.trim();
    if ($dialog.length == 0) {
        makePopup("Enter a valid word", true)
    } else {
        $.ajax("createBannedWord.php?access_token=" + access_token
        + "&admin_id=" + admin_id + "&word=" + $dialog)
            .done(function(d) {
                data = JSON.parse(d)
                $("#no-users").remove()
                console.log(data)
                addToTable(data.word, data.addedBy, data.addedDate, data.useCount, data.id)
                makePopup("Added new banned word")
                serverRefresh()
            })
            .fail(function(jqXHR) {
                // Check for error codes
                if (jqXHR.status == 403) {
                    makePopup("Insufficient privilges", true)
                } else if (jqXHR.status == 500) {
                    makePopup("Internal server error", true)
                } else if (jqXHR.status == 400) {
                    makePopup("Word exists already", true)
                } else {
                    makePopup("Unknown error occured", true)
                }
            })
    }
})

// Refresh the server's banned words
var socket = io.connect("https://morahman.me:3000")
function serverRefresh() {
    socket.emit("refreshBannedWords")
}

// When a user clicks the remove button
function removeClick() {
    let id = $(this).data("id")
    let dialog = confirm("Are you sure you want to remove this banned word?")
    if (dialog == true) {
        $.ajax("removeBannedWord.php?access_token=" + access_token + "&id=" + id)
        .done(function() {
            // Remove the user from the UI
            $("tr[data-id='" + id + "']").next().remove()
            $("tr[data-id='" + id + "']").remove()
            makePopup("Word removed successfully")
            serverRefresh()
        })
        .fail(function(jqXHR) {
            // Check for error codes
            if (jqXHR.status == 403) {
                makePopup("Insufficient privilges", true)
            } else if (jqXHR.status == 500) {
                makePopup("Internal server error", true)
            } else if (jqXHR.status == 400) {
                makePopup("Word not found", true)
            } else {
                makePopup("Unknown error occured", true)
            }
        })
    }
}
$(".remove-btn").click(removeClick)

// When show all button is clicked
$("#btn-show-all").click(function() {
    window.location.href = "messageLog.php?limit=50&page=1&banned_word=all&banned_word_desc=all"
})
</script>