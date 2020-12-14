<?php
require '../vendor/autoload.php';
require "../functions.php";
require "../constants.php";

session_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

use GuzzleHttp\Client;

// Check if user session exists
checkSessionExists();

// Check if query parameters exist
if (isset($_GET["state"])) {
    // Check state to prevent CSRF attacks
    if ($_GET["state"] != $_SESSION["state"]) {
        header("Location: {$homepage}/index.php?error=state");
        exit();
    } else {
        // Check if an error occured with Spotify
        if (isset($_GET["error"])) {
            header("Location: {$homepage}/index.php?error=spotify");
            exit();
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
                header("Location: {$homepage}/index.php?error=post");
                exit();
            }
            
            // Parse the response object, e.g. read the headers, body, etc.
            $headers = $response->getHeaders();
            $body = json_decode($response->getBody()->getContents());

            // Output headers and body for debugging purposes
            var_dump($body->{"access_token"});
        }
    }
}
?>

