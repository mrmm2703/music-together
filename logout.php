<?php

Namespace MusicTogether;
session_start();
session_unset();

// Pass through the action parameter
if (isset($_GET["action"])) {
    header("Location: index.php?action=" . $_GET["action"]);
} else {
    header("Location: index.php");
}

exit();

?>