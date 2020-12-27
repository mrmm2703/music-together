<?php

Namespace MusicTogether;

class User {
    /**
     * The user's Spotify ID.
     * @var string $id
     */
    public $id;
    /**
     * The user's original name as set inside of Spotify.
     * @var string $name
     */
    public $name;
    /**
     * The user's nickname set inside of Music Together!
     * Defaults to NULL when the user is first created.
     * @var string|null $nickname
     */
    public $nickname;
    /** 
     * The user's email address from Spotify.
     * @var string $email
     */
    public $email;
    /**
     * A URL to the user's profile picture. Set to "defaultProfPic.png"
     * if none exists from Spotify.
     * @var string $prof_pic
     */
    public $prof_pic;
    /**
     * Whether the user is banned or not.
     * @var boolean $banned
     */
    public $banned;
    /**
     * Whether the user has a Spotify Premium subscription or not.
     * @var boolean $premium
     */
    public $premium;
    /**
     * Whether the user prefers to mute the dashboard preview sound or not.
     * @var boolean $dashboard_muted
     */
    public $dashboard_muted;
    /**
     * An access token to make requests to the Spotify API with. Used by
     * methods part of this class.
     * @var string $access_token
     */
    public $access_token;
}

session_destroy();
session_start();

$_SESSION["current_user"] = new User("foo" ,"bar");
$_SESSION["current_user"]->id = mt_rand(10000, 99999);
$_SESSION["current_user"]->name = $_GET["name"];
$_SESSION["current_user"]->nickname = null;
$_SESSION["current_user"]->email = "test@musictogether.com";
$_SESSION["current_user"]->prof_pic = "defaultProfilePicture.png";
$_SESSION["current_user"]->banned = false;
$_SESSION["current_user"]->premium = true;
$_SESSION["current_user"]->dashboard_muted = false;
$_SESSION["current_user"]->access_token = "foobar";

header("Location: https://morahman.me/musictogether/player.php?group_id=" . $_GET["group_id"]);


?>


