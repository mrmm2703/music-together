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
        echo "<br><br>";
        // var_dump($result->fetch_assoc());
        
        if ($result->num_rows == 0) {
            return "no user";
        } else {
            // Get the user record from DB
            $user = $result->fetch_assoc();
            $pass_attempt = password_hash($password, PASSWORD_DEFAULT, [
                "salt" => $this->createHashSalt($user["adminDateCreated"], $user["adminEmail"], $username)
            ]);
            echo "<br>ATTEMPT:<br>";
            echo $pass_attempt;
            echo "<br>ACTUAL:<br>";
            echo $user["adminPassword"];
            if ($pass_attempt == $user["adminPassword"]) {
                // User login was successful
                $userData = array($user["adminID"], $user["adminLevel"]);
                return $userData;
            } else {
                return "incorrect password";
            }
        }
    }

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
}

$db = new AdminDatabaseConnection();

?>
