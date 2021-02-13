<?php

Namespace MusicTogether;

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

require_once "../db/db.php";

// Connect to the database
$db = new DatabaseConnection();
$db->connect();

// The place to store the file
$file_name = $_POST["id"] . "." . pathinfo($_FILES["file"]["name"])["extension"];
$target_file = "/var/www/html/musictogether/userupload/" . $file_name;
$imgFileType = $_FILES["file"]["type"];

// Check the file size is less than 500KB
if ($_FILES["file"]["size"] > 500000) {
    die("Too large");
}

// Check the file type
if($imgFileType != "image/jpg" && $imgFileType != "image/png" && $imgFileType != "image/jpeg" && $imgFileType != "image/gif" ) {
  die("Invalid file type");
}

// Attempt to upload the file
if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file) == false) {
    die("Server error");
}

if ($db->updateProfPic(null, "https://morahman.me/musictogether/userupload/" . $file_name, $_POST["id"])) {
    echo "https://morahman.me/musictogether/userupload/" . $file_name;
} else {
    die("Server error");
}

?>