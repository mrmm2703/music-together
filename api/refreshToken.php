<?php
Namespace MusicTogether;

require "../db/db.php";
require_once "../constants.php";
require_once '../vendor/autoload.php';

use GuzzleHttp;

// ini_set('display_errors', '1');
// ini_set('display_startup_errors', '1');
// error_reporting(E_ALL);

// Check if access_token is given
if (!isset($_GET["access_token"])) {
    header("HTTP/1.1 403 Forbidden");
    exit();
} elseif (!isset($_GET["refresh_token"])) { // Check if refresh_token is given
    header("HTTP/1.1 400 Bad Request");
    exit();
} elseif (!isset($_GET["id"])) {
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
            // Check if refresh_token value is empty
            if (strlen(trim($_GET["refresh_token"])) != 0) {
                // Refresh token POST request
                $client = new GuzzleHttp\Client();
                try {
                    $res = $client->request(
                        "POST",
                        $accounts_endpoint . "api/token",
                        [
                            "form_params" => [
                                "grant_type" => "refresh_token",
                                "refresh_token" => $_GET["refresh_token"],
                                "client_id" => $client_id
                            ]
                        ]
                    );
                } catch (Exception $e) {
                    header("HTTP/1.1 400 Bad Request");
                    exit();
                }
                
                // Get the access_token and refresh_token
                $body = json_decode($res->getBody()->getContents());
                $obj->access_token = $body->{"access_token"};
                $obj->refresh_token = $body->{"refresh_token"};

                // Update access token in database
                $db_con->updateUserAccessToken($obj->access_token, $_GET["id"]);

                echo json_encode($obj);

            } else {
                header("HTTP/1.1 400 Bad Request");
                exit();
            }
        }
    }
}

?>