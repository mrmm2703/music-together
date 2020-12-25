<?php
Namespace MusicTogether;
require "../db/db.php";

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

// Check if access_token is given
if (!isset($_GET["access_token"])) {
    header("HTTP/1.1 403 Forbidden");
    exit();
} elseif (!isset($_GET["muted"])) { // Check if muted is given
    header("HTTP/1.1 400 Bad Request");
    exit();
} else {
    // Try connecting to the database
    $db_con = new DatabaseConnection();
    if (!$db_con->connect()) {
        header("HTTP/1.1 500 Interal Server Error");
        exit();
    } else {
        // Check if the access_token is valid
        if (!$db_con->checkAccessToken($_GET["access_token"])) {
            header("HTTP/1.1 403 Forbidden");
            exit();
        } else {
            // Check if group ID is valid format
            if (!is_numeric($_GET["group_id"])) {
                header("HTTP/1.1 400 Bad Request");
                exit();
            } else {
                if ($db_con->checkGroupExists($_GET["group_id"])) {
                    echo "EXISTS";
                } else {
                    echo "DOES NOT EXIST";
                }
            }
        }
    }
}

?>