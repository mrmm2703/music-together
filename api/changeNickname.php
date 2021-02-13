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
} elseif (!isset($_GET["nickname"])) { // Check if nickname is given
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
            // Check if nickname value is empty
            if (strlen(trim($_GET["nickname"])) != 0) {
                if (!$db_con->updateNickname($_GET["access_token"], trim($_GET["nickname"]))) {
                    header("HTTP/1.1 500 Internal Server Error");
                    exit();
                } else {
                    header("HTTP/1.1 200 OK");
                    exit();
                }
            } else {
                header("HTTP/1.1 400 Bad Request");
                exit();
            }
        }
    }
}

?>