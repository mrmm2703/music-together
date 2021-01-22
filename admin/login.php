<?php
Namespace MusicTogether;
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
session_start();
require_once "adminDb.php";

// Function to go to page within admin root folder
function goPage($end) {
    Header("Location: https://morahman.me/musictogether/admin/" . $end);
    die();
}

$db = new AdminDatabaseConnection();
if ($db->connect() != true) {
    goPage("index.php?error=db");
} else {
    $res = $db->checkPassword($_POST["username"], $_POST["password"]);
    if (is_array($res) == 1) {
        // If the login was successful
        $_SESSION["admin_id"] = $res[0];
        $_SESSION["admin_level"] = $res[1];
        if ($res[1] == 0) {
            $_SESSION["admin_level_desc"] = "superuser";
        } else if ($res[1] == 1) {
            $_SESSION["admin_level_desc"] = "administrator";
        } else {
            $_SESSION["admin_level_desc"] = "viewer";
        }
        $_SESSION["admin_username"] = $_POST["username"];
        goPage("dashboard.php");
    } else if ($res == "incorrect password") {
        goPage("index.php?error=password");
    } else if ($res = "no user") {
        goPage("index.php?error=nouser");
    } else {
        goPage("index.php?error=unknown");
    }
}


?>