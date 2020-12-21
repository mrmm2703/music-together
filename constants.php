<?php
Namespace MusicTogether;
// Constants used for the authentication flow

/**
 * The client ID from the Spotify API.
 * @var string $client_id
 */
$client_id = "4a8fd972e1764fb8ac898d19335a9081";
/**
 * The endpoint to the accounts authorisation flow for Spotify.
 * @var string $accounts_endpoint
 */
$accounts_endpoint = "https://accounts.spotify.com/";
/**
 * The API endpoint to make request to for Spotify.
 * @var string $api_endpoint
 */
$api_endpoint = "https://api.spotify.com/v1/";
/**
 * The redirect URI for the authentication flow
 * @var string $auth_redirect_uri
 */
$auth_redirect_uri = "https://morahman.me/musictogether/auth/auth_code_callback.php";
/**
 * The required scopes during the authorisation flow, seperated by spaces.
 * @var string $auth_scopes
 */
$auth_scopes = "streaming user-read-email user-read-private user-read-recently-played";

// Some general constants

/**
 * The homepage of the where the website is located.
 * @var string $homepage
 */
$homepage = "https://morahman.me/musictogether";
?>