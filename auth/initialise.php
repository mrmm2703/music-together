<?php

require "../constants.php";

// Initialise PHP session
session_start();
$_SESSION["state"] = hash("sha256", session_id());

function generate_code_verifier($length) {
    return bin2hex(random_bytes($length / 2));
}

function generate_code_challenge($code_verifier) {
    $chl = hash('sha256', $code_verifier, true);
    $chl = base64_encode($chl);
    $chl = strtr($chl, '+/', '-_');
    $chl = rtrim($chl, '=');
    return $chl;
}

// Create code verifier and code challenge
$_SESSION["auth_code_verifier"] = generate_code_verifier(128);
$_SESSION["auth_code_challenge"] = generate_code_challenge($_SESSION["auth_code_verifier"]);

// Construct authorization URI
$url = "{$accounts_endpoint}authorize?response_type=code&client_id={$client_id}&redirect_uri={$auth_redirect_uri}";
$url .= "&scope={$auth_scopes}&code_challenge={$_SESSION["auth_code_challenge"]}&code_challenge_method=S256&state={$_SESSION["state"]}";

// Redirect user to Spotify for authentication
header("Location: {$url}");
exit();
?>