<?php
require "constants.php";

// Function to redirect user if no session exists
function checkSessionExists() {
    if (session_status() != PHP_SESSION_ACTIVE) {
        header("Location: {$homepage}");
        exit();
    }
}
?>