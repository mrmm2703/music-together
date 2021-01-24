<?php

Namespace MusicTogether;
session_start();
session_unset();
header("Location: index.php?logout=true");
exit();

?>