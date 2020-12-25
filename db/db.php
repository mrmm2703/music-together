<?php
Namespace MusicTogether;
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
/**
 * Connect to and query a database.
 * 
 * This class is used to create and run queries on a database. All database communication
 * should be done through this class.
 */
class DatabaseConnection {
    /**
     * The database name.
     * @var string $db_name
     */
    protected $db_name;
    /**
     * The username to use to login to the databaes.
     * @var string $db_username
     */
    protected $db_username;
    /**
     * The password to use when connecting to the database.
     * @var string $db_password
     */
    protected $db_password;
    /**
     * The host name or IP address of the MySQL server.
     * @var string $db_host
     */
    protected $db_host;
    /**
     * The mysqli object used to query the database.
     * @var mysqli $mysqli;
     */
    protected $mysqli;

    /** Constructor method to setup the database config properties.
     * 
     * @return DatabaseConnection An object which can be used to query the database.
     */
    function __construct() {
        require "db_config.php";
        $this->db_name = $db_name;
        $this->db_username = $db_username;
        $this->db_password = $db_password;
        $this->db_host = $db_host;
    }

    /** Method to initiate a mysqli object and connect to the database.
     * @return boolean|string True if connection was successful or the error if unsuccessful.
     * @see mysqli::$connect_error
     */
    public function connect() {
        // Initiate a MySQL connection
        $this->mysqli = new \mysqli(
            $this->db_host,
            $this->db_username,
            $this->db_password,
            $this->db_name
        );

        // Check for an error
        if ($this->mysqli->connect_errno) {
            $_SESSION["latest_error"] = "DBCon_Connect_ConnectErrno";
            return $this->mysqli->connect_error;
        } else {
            return true;
        }
    }

    /** Run a SQL SELECT statement.
     * 
     * @param string $sql The SQL SELECT statement to run.
     * @return boolean|int|mysqli_result If query was unsuccessful, returns false. Otherwise,
     *                                   returns 0 if no results were found or a mysql_result
     *                                   object containing the results of the query.
     */
    public function runSqlSelect($sql) {
        if (!(isset($this->mysqli))) {
            $_SESSION["latest_error"] = "DBCon_RunSqlSelect_MysqliNotInitialised";
            return false;
        }
        $result = $this->mysqli->query($sql);
        // If SQL query failed
        if (!($result)) {
            $_SESSION["latest_error"] = "DBCon_RunSqlInsert_QueryFail";
            return false;
        } else {
            // If there were no results
            if ($result->num_rows == 0) {
                return 0;
            } else {
                return $result;
            }
        }
    }

    /**
     * Run a SQL INSERT statement.
     * 
     * @param string $sql The SQL INSERT statement to run.
     * @return boolean Whether the query was successful or not.
     */
    public function runSqlInsert($sql) {
        if (!(isset($this->mysqli))) {
            echo "mysqli not set";
            $_SESSION["latest_error"] = "DBCon_RunSqlInsert_MysqliNotInitialised";
            return false;
        }
        if ($this->mysqli->query($sql) == TRUE) {
            echo "TRUE";
            return true;
        } else {
            echo "insert failed error";
            echo "<br>Attemped following SQL statement<br>";
            echo $sql;
            echo "<br>";
            $_SESSION["latest_error"] = "DBCon_RunSqlInsert_InsertFailed";
            return false;
        }
    }

    /** Get the user info from the database.
     * 
     * @param string $spotify_id The Spotify ID of the user to query in the database
     * @return boolean|string|mixed[] Returns false if the SQL query failed, "not_found" if
     *                                the user doesn't exist in the database or an array of
     *                                database values if the user does exist.
     * @see Database::runSqlSelect()
     */
    public function getUser($spotify_id) {
        $result = $this->runSqlSelect(
            "SELECT * FROM users WHERE userSpotifyID='" . $spotify_id . "'"
        );
        if ($result === FALSE) {
            $_SESSION["latest_error"] = "DBCon_GetUser_ResultIsFalse";
            return false;
        } else if ($result == 0) {
            return "not_found";
        } else {
            $result = $result->fetch_assoc();
            $obj = array(
                "spotifyID" => $result["userSpotifyID"],
                "name" => $result["userName"],
                "nickname" => $result["userNickname"],
                "email" => $result["userEmail"],
                "profilePicture" => $result["userProfilePicture"],
                "online" => $result["userOnline"],
                "groupID" => $result["userGroupID"],
                "dateCreatd" => $result["userDateCreated"],
                "banned" => $result["userBanned"],
                "dashboardMuted" => $result["dashboardMuted"]
            );
            return $obj;
        }
    }

    /**
     * Insert a user into the database.
     * @param mixed $user_data_obj The JSON response from the Spotify API for
     *                             details about the current user.
     * @return boolean Whether the user was successfully inserted or not.
     * @see DatabaseConnection::runSqlInsert() Run a SQL INSERT query.
     */
    public function insertUser($user_data_obj) {
        // Check if image exists
        if (count($user_data_obj->{"images"}) == 0) {
            $userProfPic = "defaultProfilePicture.png";
        } else {
            $userProfPic = $user_data_obj->{"images"}[0]->{"url"};
        }
        $sql = "INSERT INTO users (userSpotifyID, userName, userEmail, ";
        $sql .= "userProfilePicture) VALUES ('" . $user_data_obj->{"id"} . "', '";
        $sql .= $user_data_obj->{"display_name"} . "', '" . $user_data_obj->{"email"};
        $sql .= "', '" . $userProfPic . "')";
        if ($this->runSqlInsert($sql)) {
            return true;
        } else {
            $_SESSION["latest_error"] = "DBCon_InsertUser_SqlInsertFailed";
            return false;
        }
    }

    /**
     * Get if the user is banned or not from the database.
     * 
     * @param string $spotify_id The Spotify ID of the user to check against.
     * @return string|boolean Returns false if query failed, or returns "yes" or "no"
     *                        depending on whether the user is banned or not.
     * @see DatabaseConnection::getUser()
     */
    public function getUserBanned($spotify_id) {
        $res = $this->getUser($spotify_id)->{"banned"};
        if (!($res)) {
            $_SESSION["latest_error"] = "DBCon_GetUserBanned_ResIsFalse";
            return false;
        } elseif ($res == "yes"){
            return "yes";
        } else {
            return "no";
        }

    }

    /**
     * Insert a login log into the database.
     * 
     * Insert a login log into the loginLogs table. Works for both admins
     * and normal users.
     * @param string $user_type Either "admin" or "user".
     * @param string $id The admin ID or Spotify ID of user to log a login for.
     * @return boolean Whether the insertion of a login log was successful or not.
     */
    public function insertLogin($user_type, $id) {
        if ($user_type == "user") {
            $sql = "INSERT INTO loginLogs (llogSpotifyID) VALUES ('";
            $sql .= $id . "')";
        } elseif ($user_Type == "admin") {
            $sql = "INSERT INTO loginLogs (llogAdminID) VALUES (";
            $sql .= $id . ")";
        } else {
            $_SESSION["latest_error"] = "DBCon_InsertLogin_InvalidUserType";
            return false;
        }
        return $this->runSqlInsert($sql);
    }

    /**
     * Check if access token is valid.
     * 
     * Used to check if an access token provided by a request from
     * external applications is authenticated to happen. Also used to
     * figure out which user record to affect with requests.
     * 
     * @param string $access_token The user's access token from Spotify.
     * @return boolean Whether the access token is valid or not.
     */
    public function checkAccessToken($access_token) {
        // Use SQL prepared statements to prevent SQL injection
        $statement = $this->mysqli->prepare("SELECT userSpotifyID FROM users WHERE userAccessToken=?");
        $statement->bind_param("s", $access_token);
        $statement->execute();
        $result = $statement->get_result();
        if ($result->num_rows == 0) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Run a SQL UPDATE statement.
     * 
     * @param string $sql The SQL UPDATE statement to run.
     * @return boolean Whether the query was successful or not.
     */
    public function runSqlUpdate($sql) {
        if (!(isset($this->mysqli))) {
            echo "mysqli not set";
            $_SESSION["latest_error"] = "DBCon_RunSqlUpdate_MysqliNotInitialised";
            return false;
        }
        if ($this->mysqli->query($sql) == TRUE) {
            return true;
        } else {
            $_SESSION["latest_error"] = "DBCon_RunSqlUpdate_InsertFailed";
            return false;
        }
    }

    /**
     * Update dashboardMuted inside of users table.
     * 
     * Update the dashboardMuted field for any user inside of the
     * users table in the database.
     * 
     * @param string $access_token The user's Spotify access token.
     * @param boolean $state Whether the user prefers the dashboard muted or not.
     * @return boolean Whether the operation was successful or not.
     * @see DashboardConnection::runSqlUpdate()
     */
    public function updateDashboardMuted($access_token, $state) {
        return $this->runSqlUpdate("UPDATE users SET dashboardMuted=" .
        $state . " WHERE userAccessToken='" . $access_token . "'");
    }

    /**
     * Update a user's access token in the database.
     * 
     * Update the userAccessToken inside of the users table in the
     * MySQL database. This access token is used for calls to the
     * endpoints inside of MusicTogether!
     * 
     * @param string $access_token The user's access token from Spotify.
     * @param string $spotify_id The user's Spotify ID.
     * @return boolean Whether the operation was successful or not.
     * @see DashboardConnection::runSqlUpdate()
     */
    public function updateUserAccessToken($access_token, $spotify_id) {
        return $this->runSqlUpdate("UPDATE users SET userAccessToken='" .
        $access_token . "' WHERE userSpotifyID='" . $spotify_id . "'");
    }

    public function checkGroupExists($group_id) {
        // Use SQL prepared statements to prevent SQL injection
        $statement = $this->mysqli->prepare("SELECT userSpotifyID FROM users WHERE userGroupID=?");
        $statement->bind_param("s", $group_id);
        $statement->execute();
        $result = $statement->get_result();
        if ($result->num_rows == 0) {
            return false;
        } else {
            return true;
        }
    }
}
?>