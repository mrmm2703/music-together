<?php

// Function to redirect user if no session exists
function checkSessionExists() {
    require "constants.php";
    if (session_status() != PHP_SESSION_ACTIVE) {
        header("Location: {$homepage}");
        exit();
    }
}

function errorToHome($error) {
    // header("Location: " . $homepage . "/musictogether/index.php?error=" . $error);
    exit();
}
?>