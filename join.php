<?php

Namespace MusicTogether;

// Go home
function goHome() {
    header("Location: index.php");
    exit();
}

// Group ID data validation
if (!(isset($_GET["group_id"]))) {
    goHome();
}
if (!(is_numeric($_GET["group_id"]))) {
    goHome();
}
if (strlen($_GET["group_id"]) != 4) {
    goHome();
}

// Store group ID in session and initiate login procedure
session_start();
$_SESSION["join_group_id"] = $_GET["group_id"];
header("Location: auth/initialise.php");
exit();

?>