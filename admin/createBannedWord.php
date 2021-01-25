<?php
Namespace MusicTogether;
// ini_set('display_errors', '1');
// ini_set('display_startup_errors', '1');
// error_reporting(E_ALL);
require_once "adminDb.php";

// Check if access_token is given
if (!isset($_GET["access_token"])) {
    header("HTTP/1.1 403 Forbidden");
    exit();
} else {
    // Check if a user ID is given
    if (!isset($_GET["word"]) || !isset($_GET["admin_id"])) {
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
            $adminLevel = $db_con->checkAdminAccessToken($_GET["access_token"]);
            if ($adminLevel === false) {
                header("HTTP/1.1 403 Forbidden");
                exit();
            } else {
                if ($adminLevel == 2) {
                    header("HTTP/1.1 403 Forbidden");
                    exit();
                } else {
                    // Attempt to insert word
                    $res = $db_con->insertBannedWord($_GET["word"], $_GET["admin_id"]);
                    if ($res == false) {
                        header("HTTP/1.1 400 Bad Request");
                        exit();
                    } else {
                        echo json_encode($res);
                    }
                }
            }
        }
    }
}

?>