<?php
require '../vendor/autoload.php';
require "../functions.php";
require "../constants.php";

session_start();

use GuzzleHttp\Client;

// Check if user session exists
checkSessionExists();

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
            
            // Parse the response object, e.g. read the headers, body, etc.
            $headers = $response->getHeaders();
            $body = json_decode($response->getBody()->getContents());
            
            $_SESSION["access_token"] = $body->{"access_token"};

            header("Location: {$homepage}/auth/login.php");
            exit();
        }
    }
}
?>

