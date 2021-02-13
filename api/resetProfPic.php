<?php
Namespace MusicTogether;
require "../db/db.php";
require "../user.php";

// ini_set('display_errors', '1');
// ini_set('display_startup_errors', '1');
// error_reporting(E_ALL);  

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
            // Reset profile picture
            $user = new User($_GET["access_token"], $db_con);
            $prof_pic = $user->getProfPic();
            if ($prof_pic == null) {
                $prof_pic = "defaultProfilePicture.png";
            }
            // Update profile picture and return it to client
            if (!$db_con->updateProfPic($_GET["access_token"], $prof_pic)) {
                header("HTTP/1.1 500 Internal Server Error");
                exit();
            } else {
                echo $prof_pic;
                exit();
            }
        }
    }
}

?>