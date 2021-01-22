<?php
Namespace MusicTogether;
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
require_once "../db/db.php";

/**
 * Admin operations on a database
 * 
 * Special database operations for the admin interface. Extends the 
 * {@see DatabaseConnection} class.
 */
class AdminDatabaseConnection extends DatabaseConnection {
    /**
     * Constructor method to setup database connection
     * @return AdminDatabaseConnection A database connection for admin interface
     */
    function __construct() {
        parent::__construct();
    }

    /**
     * Get a user's password
     * 
     * Get the BCRYPT hashed and SHA-256 hashed password of
     * the admin user specified.
     * 
     * @param string $username The username of the admin user
     * @param string $password The SHA-256 hashed value of the password
     * @return string|array "no user" if no user by username is found. "incorrect
     * password" if password is wrong. Or array containing [adminID, adminLevel]
     * is returned.
     */
    public function checkPassword($username, $password) {
        $statement = $this->mysqli->prepare("SELECT adminEmail, adminDateCreated, " .
        "adminPassword, adminID, adminLevel FROM adminUsers WHERE adminUsername=?");
        $statement->bind_param("s", $username);
        $statement->execute();
        $result = $statement->get_result();
        
        if ($result->num_rows == 0) {
            return "no user";
        } else {
            // Get the user record from DB
            $user = $result->fetch_assoc();
            $pass_attempt = password_hash($password, PASSWORD_DEFAULT, [
                "salt" => $this->createHashSalt($user["adminDateCreated"], $user["adminEmail"], $username)
            ]);
            if ($pass_attempt == $user["adminPassword"]) {
                // User login was successful
                $userData = array($user["adminID"], $user["adminLevel"]);
                return $userData;
            } else {
                return "incorrect password";
            }
        }
    }

    /**
     * Create a hash salt for a user
     * 
     * @param string $date_created The date created value from the database
     * @param string $email The user's email from the database
     * @param string $username The user's login username
     * @return string A string represetning the salt for the user
     */
    public function createHashSalt($date_created, $email, $username) {
        // Extract components of DATETIME returned from DB
        $year = substr($date_created, 0, 4);
        $month = substr($date_created, 5, 2);
        $day = substr($date_created, 8, 2);
        $hour = substr($date_created, 11, 2);
        $min = substr($date_created, 14, 2);
        $sec = substr($date_created, 17, 2);
        // Salt algorithm
        $numSalt = floor((($year * $day) / $month) * 1.742 * ($hour / $sec) / $min * 14 * $min * $day);
        $salt = substr($email, 0, 3) . strval($numSalt) . substr($email, -2) . substr($username, 0, 2)
            . $username . substr($username, -3);
        return $salt;
    }
    /**
     * Get a list of all (online) users.
     * 
     * Get all the currently online users (users with non-null group IDs) or get all
     * the users regardless of online status.
     * Gets following details about users: name, group ID, email, banned status and ID.
     * 
     * @param bool $online Whether to get only online users or not. Defaults to false.
     * @return array|int An array of an associative array consisting of all the
     * parameters listed above about each user. Can return 0 if there are no users found.
     */
    public function getUsers($online = false) {
        if ($online) {
            $sql = "SELECT userName, userNickname, userGroupID, "
            . "userEmail, userBanned, userSpotifyID FROM users WHERE userGroupID IS NOT NULL";
        } else {
            $sql = "SELECT userName, userNickname, userGroupID, "
            . "userEmail, userBanned, userSpotifyID FROM users";
        }
        $res = $this->mysqli->query($sql);
        if ($res->num_rows == 0) {
            return 0;
        } else {
            $users = array();
            while ($row = $res->fetch_assoc()) {
                $curName = "poo";
                if ($row["userNickname"] == null) {
                    $curName = $row["userName"];
                } else {
                    $curName = $row["userNickname"];
                }
                $curUser = array(
                    "name" => $curName,
                    "groupID" => $row["userGroupID"],
                    "banned" => (bool)$row["userBanned"],
                    "id" => $row["userSpotifyID"],
                    "email" => $row["userEmail"]
                );
                array_push($users, $curUser);
            }
            return $users;
        }

    }
}

?>
