<?php
Namespace MusicTogether;
require_once '../vendor/autoload.php';
require_once "../functions.php";
require_once "../constants.php";
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
session_start();

use GuzzleHttp;


// Check if query parameters exist
if (isset($_GET["state"])) {
    // Check state to prevent CSRF attacks
    if ($_GET["state"] != $_SESSION["state"]) {
        errorToHome("state");
    } else {
        // Check if an error occured with Spotify
        if (isset($_GET["error"])) {
            errorToHome("spotify");
        } else {
            // Store the authorisation code in the session
            $_SESSION["auth_code"] = $_GET["code"];

            // Send POST request to Spotify
            $client = new GuzzleHttp\Client();
            try {
                $response = $client->request(
                    "POST",
                    $accounts_endpoint . "api/token",
                    [
                        "form_params" => [
                            "client_id" => $client_id,
                            "grant_type" => "authorization_code",
                            "code" => $_GET["code"],
                            "redirect_uri" => $auth_redirect_uri,
                            "code_verifier" => $_SESSION["auth_code_verifier"]
                        ]
                    ]
                );
            } catch (Exception $e) {
                // Error with the POST request
                errorToHome("post");
            }
            
            // Parse the response object
            $body = json_decode($response->getBody()->getContents());
            
            $_SESSION["access_token"] = $body->{"access_token"};
            $_SESSION["refresh_token"] = $body->{"refresh_token"};
            setcookie("access_token", $_SESSION["access_token"], 0, "/");
            setcookie("refresh_token", $_SESSION["refresh_token"], 0, "/");

            var_dump($_SESSION);
            var_dump($_COOKIE);

            header("Location: {$homepage}/auth/login.php");
            exit();
        }
    }
}
?>

