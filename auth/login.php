<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
// Import the required files
require_once "../vendor/autoload.php";
require_once "../db/db.php";
require "../constants.php";
require_once "../functions.php";
require_once "../user.php";

session_start();
// Get the logged in user's data
// $user_data = getUserData($_SESSION["access_token"]);

$db_con = new DatabaseConnection();
if ($db_con->connect()) {
    $_SESSION["current_user"] = new User($_SESSION["access_token"], $db_con);
    $_SESSION["current_user"]->logLogin($db_con);
    header("Location: {$homepage}/dashboard.php");
    exit();
} else {
    // Couldn't connect to the database
    errorToHome("db_con_is_false_major");
}

?>