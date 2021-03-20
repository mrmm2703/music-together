<?php
Namespace MusicTogether;
// ini_set('display_errors', '1');
// ini_set('display_startup_errors', '1');
// error_reporting(E_ALL);
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
                $userData = array($user["adminID"], $user["adminLevel"], $user["adminPassword"]);
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
        // Differ SQL statement depending on whether to get online users or not
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
                // Get name depending on nickname availability
                if ($row["userNickname"] == null) {
                    $curName = $row["userName"];
                } else {
                    $curName = $row["userNickname"];
                }
                // Add user to users array
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

    /**
     * Get a user's details
     * 
     * Get all the data about a user from the database.
     * 
     * @param string $id The Spotify ID of the user to get details of.
     * @return array An associative array containing details about the user.
     */
    public function getUserDetails($id) {
        $sql = "SELECT userSpotifyID, userName, userNickname, userEmail, "
         . "userProfilePicture, userGroupID, userDateCreated, userBanned FROM users "
         . "WHERE userSpotifyID='" . $id . "'";
        $res = $this->mysqli->query($sql);
        if ($res->num_rows == 0) {
            return 0;
        }
        $row = $res->fetch_assoc();
        // Set user name to show accordingly
        if ($row["userNickname"] == null) {
            $curName = $row["userName"];
        } else {
            $curName = $row["userNickname"];
        }
        
        $curUser = array(
            "originalName" => $row["userName"],
            "profPic" => $row["userProfilePicture"],
            "dateCreated" => $row["userDateCreated"],
            "name" => $curName,
            "groupID" => $row["userGroupID"],
            "banned" => (bool)$row["userBanned"],
            "id" => $row["userSpotifyID"],
            "email" => $row["userEmail"]
        );
        return $curUser;
    }

    /**
     * Get banned words use by a user
     * 
     * Get the banned words usage of a user of ID provided from the last
     * 7 days.
     * 
     * @param string $id The user's Spotify ID
     * @return array|int Returns 0 if no words found. Else returns an array of
     * an associative array containing details about each usage.
     */
    public function getBannedWords($id) {
        $stmt = $this->mysqli->prepare("SELECT banUsgDate AS date, "
         . "banUsgGroupID AS groupID, (SELECT word FROM bannedWords "
         . "WHERE bannedWords.wordID=bannedWordsUse.banUsgWordID) "
         . "AS word FROM bannedWordsUse WHERE banUsgSenderID=? AND "
         . "banUsgDate >= DATE_ADD(CURRENT_DATE(), INTERVAL -7 DAY)");
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $res = $stmt->get_result();

        if ($res->num_rows == 0) {
            return 0;
        } else {
            $words = array();
            while ($row = $res->fetch_assoc()) {
                $curWord = array(
                    "date" => $row["date"],
                    "group" => $row["groupID"],
                    "word" => $row["word"]
                );
                array_push($words, $curWord);
            }
            return $words;
        }
    }

    /**
     * Get a user's login logs
     * 
     * Get the specified number of login logs for a user.
     * 
     * @param string $id The Spotify ID of the user.
     * @param int $lim The number of logs to get. Defaults to 5.
     * @return array|int 0 if no records found. Otherwise an array
     * of dates is returned.
     */
    public function getLoginLogs($id, $lim=5) {
        $stmt = $this->mysqli->prepare("SELECT llogDate AS date FROM loginLogs "
         . "WHERE llogSpotifyID=? ORDER BY llogDate DESC LIMIT " . $lim);
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $res = $stmt->get_result();
        
        if ($res->num_rows == 0) {
            return 0;
        } else {
            $logs = array();
            while ($row = $res->fetch_assoc()) {
                array_push($logs, $row["date"]);
            }
            return $logs;
        }
    }

    /**
     * Get group logs of a user.
     * 
     * Get all the enter group logs for a user from the database.
     * 
     * @param string $id The user's Spotify ID.
     * @param int $lim The number of records to get. Defaults to 5.
     * @return array|int If no records, 0 is returned. Else an array of
     * an associative array is returned.
     */
    public function getGroupLogs($id, $lim=5) {
        $stmt = $this->mysqli->prepare('SELECT glogGroupID AS "group", glogDate AS '
         . '"date" FROM groupLogs WHERE glogSpotifyID=? AND glogAction="ENTER" '
         . 'ORDER BY glogDate DESC LIMIT ' . $lim);
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $res = $stmt->get_result();
        
        if ($res->num_rows == 0) {
            return 0;
        } else {
            $logs = array();
            while ($row = $res->fetch_assoc()) {
                $curLog = array(
                    "group" => $row["group"],
                    "date" => $row["date"]
                );
                array_push($logs, $curLog);
            }
            return $logs;
        }
    }

    /**
     * Get messages log from database.
     * 
     * Get all the messages sent from the database or get messages with
     * a specific banned word in them, or all banned words.
     * 
     * @param int $lim The number of records to get. Defaults to 50.
     * @param int $offset The offset to get records from. Defaults to 0.
     * @param int $bannedWordId The ID of the banned word to get all messages
     * for. Defaults to null, where this will be ignored. Can also have a value
     * of "all" to get all of the messages with any banned word.
     * @return array|int If no records, 0 is returned. Else an array
     * of an associative array is returned.
     */
    public function getMessageLog($lim=50, $offset=0, $bannedWordId=null) {
        // Get the correct data depending on bannedWordId
        if ($bannedWordId == null) {
            $stmt = $this->mysqli->prepare('SELECT (SELECT COALESCE(userNickname, userName) 
            FROM users WHERE users.userSpotifyID=messages.msgSenderID) AS "user", 
            msgContent AS "message", msgGroupID AS "group", msgDateSent AS "date",
            msgSenderID AS id FROM messages ORDER BY msgDateSent DESC LIMIT ? OFFSET ?');
            $stmt->bind_param("ii", $lim, $offset);  
        } else if ($bannedWordId == "all") {
            $stmt = $this->mysqli->prepare("SELECT (SELECT (SELECT COALESCE(userNickname, 
            userName) FROM users WHERE users.userSpotifyID=messages.msgSenderID) AS 'user' 
            FROM messages WHERE messages.msgID=bannedWordsUse.banUsgMsgID) AS 'user', 
            (SELECT msgContent FROM messages WHERE messages.msgID=bannedWordsUse.banUsgMsgID) 
            AS 'message', (SELECT msgGroupID FROM messages WHERE messages.msgID=bannedWordsUse.banUsgMsgID) 
            AS 'group', (SELECT msgDateSent FROM messages WHERE messages.msgID=bannedWordsUse.banUsgMsgID) 
            AS 'date', (SELECT msgSenderID FROM messages WHERE messages.msgID=bannedWordsUse.banUsgMsgID) 
            AS 'id' FROM bannedWordsUse ORDER BY banUsgDate DESC LIMIT ? OFFSET ?");
            $stmt->bind_param("ii", $lim, $offset);
        } else {
            $stmt = $this->mysqli->prepare("SELECT (SELECT (SELECT COALESCE(userNickname, 
            userName) FROM users WHERE users.userSpotifyID=messages.msgSenderID) AS 'user' 
            FROM messages WHERE messages.msgID=bannedWordsUse.banUsgMsgID) AS 'user', 
            (SELECT msgContent FROM messages WHERE messages.msgID=bannedWordsUse.banUsgMsgID) 
            AS 'message', (SELECT msgGroupID FROM messages WHERE messages.msgID=bannedWordsUse.banUsgMsgID) 
            AS 'group', (SELECT msgDateSent FROM messages WHERE messages.msgID=bannedWordsUse.banUsgMsgID) 
            AS 'date', (SELECT msgSenderID FROM messages WHERE messages.msgID=bannedWordsUse.banUsgMsgID) 
            AS 'id' FROM bannedWordsUse WHERE banUsgWordID=? ORDER BY banUsgDate DESC LIMIT ? OFFSET ?");
            $stmt->bind_param("iii", $bannedWordId, $lim, $offset);
        }
        $stmt->execute();
        $res = $stmt->get_result();

        if ($res->num_rows == 0) {
            return 0;
        } else {
            $msgs = array();
            while ($row = $res->fetch_assoc()) {
                $curMsg = array(
                    "message" => $row["message"],
                    "group" => $row["group"],
                    "user" => $row["user"],
                    "date" => $row["date"],
                    "id" => $row["id"]
                );
                array_push($msgs, $curMsg);
            }
            return $msgs;
        }
    }

    /**
     * Check if admin access token is valid.
     * 
     * Used to check if an access token provided by a request from
     * external applications is authenticated to happen. Also used to
     * figure out which user record to affect with requests.
     * 
     * @param string $access_token The admin's access token.
     * @return boolean Whether the access token is valid or not.
     */
    public function checkAdminAccessToken($access_token) {
        // Use SQL prepared statements to prevent SQL injection
        $statement = $this->mysqli->prepare("SELECT adminLevel
        FROM adminUsers WHERE adminToken=?");
        $statement->bind_param("s", $access_token);
        $statement->execute();
        $result = $statement->get_result();
        if ($result->num_rows == 0) {
            return false;
        } else {
            return $result->fetch_assoc()["adminLevel"];
        }
    }

    /**
     * Toggle the ban status for a user.
     * 
     * Change the userBanned field for a given user. If the user is banned,
     * they will be unbanned and vice versa. Used by API.
     * 
     * @param string $id The user's Spotify ID
     * @return bool Whether the operation was successful or not.
     */
    public function toggleBan($id) {
        $stmt = $this->mysqli->prepare('UPDATE users SET userBanned =NOT userBanned WHERE userSpotifyID=?');
        $stmt->bind_param("s", $id);
        $stmt->execute();
        if (!($stmt->affected_rows)) {
            // No user was found with that ID
            return false;
        } else {
            return true;
        }
    }

    /**
     * Get all admin users.
     * 
     * Get the ID, level, descriptive level and username of every
     * admin user in the database.
     * 
     * @return array|int 0 if no records were found. Otherwise, returns
     * an array of associative arrays containing admin details.
     */
    public function getAdminUsers() {
        $sql = "SELECT adminID AS 'id', adminUsername AS 
        'username', adminEmail AS 'email', adminLevel AS 'level' FROM adminUsers";
        $res = $this->mysqli->query($sql);
        if ($res->num_rows == 0) {
            return 0;
        } else {
            $users = array();
            while ($row = $res->fetch_assoc()) {
                if ($row["level"] == 0) {
                    $curLvl = "Superuser";
                } else if ($row["level"] == 1) {
                    $curLvl = "Administrator";
                } else {
                    $curLvl = "Viewer";
                }
                $curUser = array(
                    "username" => $row["username"],
                    "id" => $row["id"],
                    "level" => $row["level"],
                    "level_desc" => $curLvl,
                    "email" => $row["email"]
                );
                array_push($users, $curUser);
            }
            return $users;
        }
    }

    /**
     * Insert a new admin user.
     * 
     * Insert a new admin user into the adminUsers table
     * of the database.
     * 
     * @param string $username The admin's username.
     * @param string $password THe SHA-256 hashed value of the password.
     * @param string $email The admin's email.
     * @param int $level The admin level (0=superuser, 1=administrator, 2=viewer).
     * @return bool Whether the operation was successful or not.
     */
    public function insertAdminUser($username, $password, $email, $level) {
        // Insert admin username, email and level
        $stmt = $this->mysqli->prepare("INSERT INTO adminUsers (adminUsername, 
        adminEmail, adminLevel) VALUES (?, ?, ?)");
        $stmt->bind_param("ssi", $username, $email, $level);
        $stmt->execute();
        // Get the admin inserted
        $id = $this->mysqli->insert_id;
        $sql = "SELECT adminDateCreated FROM adminUsers WHERE adminID='" . $id . "'";
        $res = $this->mysqli->query($sql);
        if ($res->num_rows == 0) {
            return false;
        }
        $user = $res->fetch_assoc();
        // Create a hashed password and access token
        $password_hash = password_hash($password, PASSWORD_DEFAULT, [
            "salt" => $this->createHashSalt($user["adminDateCreated"], $email, $username)
        ]);
        $access_token = hash("sha256", $password_hash);
        // Update password hash and access token in database
        $sql = "UPDATE adminUsers SET adminPassword='" . $password_hash . "', adminToken='"
         . $access_token . "' WHERE adminID=" . $id;
        $this->mysqli->query($sql);
        if ($this->mysqli->affected_rows == 0) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Check if admin details exist.
     * 
     * Check if the username or password supplied exists.
     * 
     * @param string $username The username to check.
     * @param string $email The email to exist.
     * @return bool|string False if no admin users found. Otherwise a 
     * string of "username_exists" or "email_exists" is returned.
     */
    public function checkAdminExists($username, $email) {
        $stmt = $this->mysqli->prepare("SELECT adminUsername, 
        adminEmail FROM adminUsers WHERE adminUsername=? OR adminEmail=?");
        $stmt->bind_param("ss", $username, $email);
        $stmt->execute();
        $res = $stmt->get_result();
        // Check if no admin users found
        if ($res->num_rows == 0) {
            return false;
        } else {
            // Check if username or email exists
            $user = $res->fetch_assoc();
            if ($username == $user["adminUsername"]) {
                return "username_exists";
            } else {
                return "email_exists";
            }
        }
    }

    /**
     * Remove an admin user.
     * 
     * Remove an admin user from the adminUsers database table
     * by using their ID.
     * 
     * @param int $id The admin user's ID.
     * @return bool Whether the operation was successful or not.
     */
    public function removeAdminUser($id) {
        $stmt = $this->mysqli->prepare("DELETE FROM adminUsers WHERE adminID=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        var_dump($stmt);
        if ($this->mysqli->affected_rows == -1) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Change an admin's password.
     * 
     * @param int $id The admin's user ID.
     * @param string $password The SHA-256 hashed value of the password.
     * @return bool Whether the operation was successful or not.
     */
    public function changeAdminPassword($id, $password) {
        // Check if admin exists
        $stmt = $this->mysqli->prepare("SELECT adminEmail, adminDateCreated, " .
        "adminLevel, adminUsername FROM adminUsers WHERE adminID=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        var_dump($stmt);
        $res = $stmt->get_result();
        if ($res->num_rows == 0) {
            return "no_user";
        }
        // Generate hashed password and access token
        $user = $res->fetch_assoc();
        $password_hash = password_hash($password, PASSWORD_DEFAULT, [
            "salt" => $this->createHashSalt($user["adminDateCreated"],
            $user["adminEmail"], $user["adminUsername"])
        ]);
        $access_token = hash("sha256", $password_hash);
        // Update database values
        $stmt = $this->mysqli->prepare("UPDATE adminUsers SET 
        adminPassword=?, adminToken=? WHERE adminID=?");
        $stmt->bind_param("ssi", $password_hash, $access_token, $id);
        $stmt->execute();
        if ($this->mysqli->affected_rows == 0) {
            return "db_error";
        } else {
            return true;
        }
    }

    /**
     * Get all banned words in the database
     * 
     * @param bool|null Whether to get custom banned words only or not. Set
     * to null to get all words that were used only.
     * 
     * @return array|int 0 if no banned words. Otherwise an array of
     * an associative array containing all the banned words and their details.
     */
    public function getAllBannedWords($custom = null) {
        // Get the required data
        $sql = "SELECT wordID AS 'id', word AS 'word', wordAddedDate 
        AS 'addedDate', (SELECT COUNT(banUsgID) FROM bannedWordsUse 
        WHERE bannedWords.wordID=bannedWordsUse.banUsgWordID) AS 
        'useCount', (SELECT adminUsername FROM adminUsers WHERE 
        adminUsers.adminID=wordAddedByID) AS 'addedBy' FROM bannedWords WHERE 
        (wordCustom = 0 AND (SELECT COUNT(banUsgID) FROM bannedWordsUse 
        WHERE bannedWords.wordID=bannedWordsUse.banUsgWordID) > 0)";
        if ($custom === false) {
            $sql = $sql . " AND wordCustom=0";
        } else if ($custom === true) {
            $sql = $sql . " AND wordCustom=1";
        } else if ($custom === null) {
            $sql = $sql . " OR wordCustom=1";
        }

        // Check the results of the query
        $res = $this->mysqli->query($sql);
        if ($res->num_rows == 0) {
            return 0;
        } else {
            $words = array();
            while ($row = $res->fetch_assoc()) {
                array_push($words, array(
                    "id" => $row["id"],
                    "word" => $row["word"],
                    "addedDate" => $row["addedDate"],
                    "useCount" => $row["useCount"],
                    "addedBy" => $row["addedBy"]
                ));
            }
            return $words;
        }
    }

    /**
     * Insert a new banned word.
     * 
     * Insert a new banned word into the database table.
     * 
     * @param string $word The word to insert.
     * @param int $int The ID of the admin adding the word.
     * @return stdClass|bool False if the request failed. Otherwise
     * a generic object containing the word's details is returned.
     */
    public function insertBannedWord($word, $admin_id) {
        // Try to insert the word
        mysqli_report(MYSQLI_REPORT_ALL);
        $stmt = $this->mysqli->prepare('INSERT INTO bannedWords (word, wordAddedByID) 
        SELECT * FROM (SELECT ? AS banWord, ? AS banAddedBy) AS temp WHERE NOT EXISTS (SELECT word FROM 
        bannedWords WHERE word=?)');
        $stmt->bind_param("sis", $word, $admin_id, $word);
        $stmt->execute();
        // Check if it was successful
        if ($this->mysqli->affected_rows == 0) {
            return false;
        }
        // Get inserted record
        $word_id = $this->mysqli->insert_id;
        $sql = "SELECT wordID AS 'id', word AS 'word', wordAddedDate 
        AS 'addedDate', (SELECT COUNT(banUsgID) FROM bannedWordsUse 
        WHERE bannedWords.wordID=bannedWordsUse.banUsgWordID) AS 
        'useCount', (SELECT adminUsername FROM adminUsers WHERE 
        adminUsers.adminID=wordAddedByID) AS 'addedBy' FROM bannedWords
        WHERE wordID=" . $word_id;
        $res = $this->mysqli->query($sql);
        if ($res->num_rows == 0) {
            return false;
        }
        // Construct JSON object
        $curWord = $res->fetch_assoc();
        $word_obj->id = $curWord["id"];
        $word_obj->word = $curWord["word"];
        $word_obj->addedDate = $curWord["addedDate"];
        $word_obj->useCount = $curWord["useCount"] ;
        $word_obj->addedBy = $curWord["addedBy"];
        return $word_obj;
    }

    /**
     * Remove a banned word.
     * 
     * @param int $id The ID of banned word to remove.
     * @return bool Whether the operation was successful or not.
     */
    public function removeBannedWord($id) {
        $stmt = $this->mysqli->prepare("DELETE FROM bannedWords WHERE wordID=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        var_dump($stmt);
        if ($this->mysqli->affected_rows == -1) {
            return false;
        } else {
            return true;
        }
    }
}

?>
