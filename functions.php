<?php
Namespace MusicTogether;
/**
 * Check if the user's session exists
 * 
 * Check if the user's session is valid and they are authenticated to view the webpage.
 * Return them to the homepage otherwise.
 * 
 * @return void
 */
function checkSessionExists() {
    require_once "constants.php";
    if (session_status() != PHP_SESSION_ACTIVE) {
        header("Location: {$homepage}");
        exit();
    }
}

/**
 * Redirect the user to the homepage due to an error.
 * 
 * Redirect the user to the homepage with an error in the URL paramater and stop
 * program execution.
 * 
 * @param string $error An error code.
 * @return void
 */
function errorToHome($error) {
    header("Location: " . $homepage . "/musictogether/index.php?error=" . $error);
    exit();
}
?>