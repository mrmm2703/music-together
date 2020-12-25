<?php
Namespace MusicTogether;
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
// Import the required files
require_once "../vendor/autoload.php";
require_once "../db/db.php";
require_once "../constants.php";
require_once "../functions.php";
require_once "../user.php";

session_start();

$db_con = new DatabaseConnection();
if ($db_con->connect()) {
    // Create a new User object
    $_SESSION["current_user"] = new User($_SESSION["access_token"], $db_con);
    if ($_SESSION["current_user"]->premium == False) {
        errorToHome("no_premium");
    }
    // Log a login in the database
    $_SESSION["current_user"]->logLogin($db_con);
    // Update the access token in the database
    $_SESSION["current_user"]->pushAccessTokenToDB($db_con);
    var_dump($_SESSION["current_user"]);
    // Redirect to dashboard
    header("Location: {$homepage}/dashboard.php");
    exit();
} else {
    // Couldn't connect to the database
    errorToHome("db_con_is_false_major");
}

?>