<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

class DatabaseConnection {
    protected $db_name;
    protected $db_username;
    protected $db_password;
    protected $db_host;

    protected $mysqli;

    // Constructor method to setup the db_config variables inside the class
    function __construct() {
        require "db_config.php";
        $this->db_name = $db_name;
        $this->db_username = $db_username;
        $this->db_password = $db_password;
        $this->db_host = $db_host;
    }

    // Method to initiate a mysqli object
    public function connect() {
        // Initiate a MySQL connection
        $this->mysqli = new mysqli(
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

    // Function to run a select SQL statement
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

    // Function to get the user info from a database
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
                "banned" => $result["userBanned"]
            );
            return $obj;
        }
    }

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
}
?>