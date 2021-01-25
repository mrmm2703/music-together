<?php
Namespace MusicTogether;
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
require_once "adminDb.php";

// Check if access_token is given
if (!isset($_POST["access_token"])) {
    header("HTTP/1.1 403 Forbidden");
    exit();
} else {
    // Check if a user ID is given
    if (!isset($_POST["id"]) || !isset($_POST["password"])) {
        header("HTTP/1.1 400 Bad Request");
        exit();
    } else {
        // Try connecting to the database
        $db_con = new AdminDatabaseConnection();
        if (!$db_con->connect()) {
            header("HTTP/1.1 500 Interal Server Error");
            exit();
        } else {
            // Check if the access_token is valid
            $adminLevel = $db_con->checkAdminAccessToken($_POST["access_token"]);
            if ($adminLevel === false) {
                header("HTTP/1.1 403 Forbidden");
                exit();
            } else {
                if ($adminLevel == 2 || $adminLevel == 1) {
                    header("HTTP/1.1 403 Forbidden");
                    echo $adminLevel;
                    exit();
                } else {
                    // Check if password was updated
                    $result = $db_con->changeAdminPassword($_POST["id"], $_POST["password"]);
                    if ($result != true) {
                        if ($result == "no_user") {
                            header("HTTP/1.1 400 Bad Request");
                            echo "poo";
                            exit();
                        } else {
                            header("HTTP/1.1 500 Interal Server Error");
                            exit();
                        }
                    } else {
                        header("HTTP/1.1 200 OK");
                        exit();
                    }
                }
            }
        }
    }
}

?>