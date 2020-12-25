<?php
Namespace MusicTogether;
require_once "../constants.php";
require_once "../functions.php";

// Initialise PHP session
session_start();

$_SESSION["state"] = hash("sha256", session_id());

/**
 * Generate a code verifier for authorisation flow.
 * 
 * Generate a code verifier of the length specified. Generate random bytes in hexadecimal.
 * @param int $length The length of the code verifier to generate.
 * @return string A code verifier.
 */
function generate_code_verifier($length) {
    return bin2hex(random_bytes($length / 2));
}

/**
 * Generate a code challenge for authorisation flow.
 * 
 * Generate a code challenge using the code verifier supplied. The function hashes the code
 * verifier using SHA256 and then bas64url encodes it.
 * 
 * @param string A code verifier.
 * @return string The code challenge for the code verifier supplied.
 * @see generate_code_verifier() To generate a code verifier.
 */
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