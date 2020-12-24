<?php
Namespace MusicTogether;
require "../db/db.php";

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

if (!isset($_GET["access_token"])) {
    header("HTTP/1.1 403 Forbidden");
    exit();
} elseif (!isset($_GET["muted"])) {
    header("HTTP/1.1 400 Bad Request");
    exit();
} else {
    $db_con = new DatabaseConnection();
    if (!$db_con->connect()) {
        header("HTTP/1.1 500 Interal Server Error");
        exit();
    } else {
        if (!$db_con->checkAccessToken($_GET["access_token"])) {
            header("HTTP/1.1 403 Forbidden");
            exit();
        } else {
            if ($_GET["muted"] == "true" || $_GET["muted"] == "false") {
                if (!$db_con->updateDashboardMuted($_GET["access_token"], $_GET["muted"])) {
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