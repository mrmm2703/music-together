<?php
Namespace MusicTogether;
require "../db/db.php";

// Check if access_token is given
if (!isset($_GET["access_token"])) {
    header("HTTP/1.1 403 Forbidden");
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
            // Generate a random group ID which isn't in use
            $existing_groups = $db_con->getActiveGroups();
            if ($existing_groups === false) {
                header("HTTP/1.1 500 Internal Server Error");
                exit();
            }
            if (count($existing_groups) == 9000) {
                echo "full";
                exit();
            }
            while (TRUE) {
                $group_id = mt_rand(1000, 9999);
                if (!in_array($group_id, $existing_groups)) {
                    break;
                }
            }
            echo $group_id;
        }
    }
}

?>