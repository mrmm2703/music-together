<?php
Namespace MusicTogether;

require_once "adminDb.php";
$db = new AdminDatabaseConnection();
$db->connect();

// Check if username or email exists already
$res = $db->checkAdminExists($_POST["username"], $_POST["password"]);
if ($res != false) {
    header("Location: addAdmin.php?error=" . $res);
    exit();
}

// Insert the user
$res = $db->insertAdminUser(
    $_POST["username"],
    $_POST["password"],
    $_POST["email"],
    $_POST["level"]
);

if ($res) {
    header("location: manageAdmins.php?origin=create_success");
    exit();
} else {
    header("location: manageAdmins.php?origin=create_error");
    exit();
}
?>


