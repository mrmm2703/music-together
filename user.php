<?php
Namespace MusicTogether;
use GuzzleHttp;
/**
 * This class holds information on a user object.
 * 
 * This class initialises a User object with all of their details.
 * It connects to the Spotify API and MySQL database to properly
 * setup a user to use Music Together!
 */
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
     * A URL to the user's profile picture on Spotify.
     * @var string $prof_pic_orig
     */
    public $prof_pic_orig;
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
    /**
     * Whether it is the user's first logon or not.
     * @var bool $first_login
     */
    public $first_login = false;

    /**
     * Constructor method for User class.
     * 
     * @param string $access_token An access token to access the
     *                             Spotify API with.
     * @param MusicTogether\DatabaseConnection $db_con A DatabaseConnection object
     *                                             with a valid connection to
     *                                             connect to the database with.
     * 
     * @return User A User object containing information about a User.
     */
    public function __construct($access_token, $db_con) {
        // Get the user's data from Spotify
        $this->access_token = $access_token;
        $user_data = $this->getUserData();
        // echo "<br><br>USER DATA<br><br><br><br>";
        // var_dump($user_data);
        $id = $user_data->{"id"};
        if ($user_data->{"product"} == "premium") {
            $this->premium = True;
            $db_data = $db_con->getUser($id);
            if (!($db_data)) {
                // If db_con error occured
                errorToHome("db_data_is_false");
            } else if ($db_data == "not_found") {
                // If the user is not found, attempt to insert user
                if (!($db_con->insertUser($user_data))) {
                    errorToHome("db_con_insert_user_1");
                }
                $this->first_login = true;
                $this->banned = false;
            } else {
                // If user exists in the database
                // Get the database entry for if the user is banned
                $this->banned = $db_data["banned"];
                if ($this->banned == "1") {
                    // If the user is banned
                    $this->banned = true;
                    errorToHome("banned");
                } else {
                    $this->banned = false;
                }
            }
            // Set properties to setup the dashboard
            $this->id = $id;
            $this->name = $user_data->{"display_name"};

            // Set the nickname and muted property depending on whether new user or not
            if ($db_data == "not_found") {
                $this->nickname = NULL;
                $this->dashboard_muted = False;
            } else {
                $this->nickname = $db_data["nickname"];
                // echo $db_data["dashboardMuted"];
                $this->dashboard_muted = $db_data["dashboardMuted"];
            }

            $this->email = $user_data->{"email"};

            // Set the profile picture
            if ($db_data["profilePicture"] == "defaultProfilePicture.png" ||
            substr($db_data["profilePicture"], 0, 20) != "https://morahman.me/") {
                if (count($user_data->{"images"}) == 0) {
                    $userProfPic = "defaultProfilePicture.png";
                } else {
                    $userProfPic = $user_data->{"images"}[0]->{"url"};
                }
            } else {
                $userProfPic = $db_data["profilePicture"];
            }

            $this->prof_pic = $userProfPic;
            $db_con->updateUser($this);
        } else {
            $this->premium = False;
        }
    }

    /**
     * Update a user's nickname and profile picture.
     * 
     * Get the latest nickname and profile picture from the datbase.
     * 
     * @param DatabaseConnection $db_con
     */
    public function update($db_con) {
        $db_data = $db_con->getUser($this->id);
        $this->nickname = $db_data["nickname"];
        $this->prof_pic = $db_data["profilePicture"];
    }

    /**
     * Logs a login on the databse.
     * 
     * This function connects to the database and logs a login of the current
     * User using {@see DatabaseConnection::insertLogin()}.
     * 
     * @param DatabaseConnection $db_con
     * @return void
     */
    public function logLogin($db_con) {
        $db_con->insertLogin("user", $this->id);
    }

    /**
     * Performa a GET request using Guzzle using the provided endpoint.
     * 
     * @param string $url The endpoint to request. Only include the URL
     *                    after "v1/", for example "me".
     * 
     * @return \Psr\Http\Message\ResponseInterface The response from {@see GuzzleHttp\Client::request()}.
     */
    function getRequest($url) {
        // Require Guzzle
        require_once 'vendor/autoload.php';
        require "constants.php";

        $client = new GuzzleHttp\Client();

        // Do a GET request
        try {
            $response = $client->request(
                "GET",
                $api_endpoint . $url,
                [
                    "headers" => [
                        "Authorization" => "Bearer " . $this->access_token
                    ]
                ]
            );
        } catch (Exception $e) {
            // If an error occured in the request
            echo "<br><br>GUZZLE ERROR<br><br><br><br>";
            var_dump($e);
            $_SESSION["latest_error"] = $e;
            errorToHome("guzzle_getRequest_caughtException");
        }

        return $response;
    }

    /**
     * Get the user's data from the Spotify API
     * 
     * @see User::getRequest() Do a GET request using Guzzle.
     * @return mixed|null A JSON object representing the response from Spotify.
     */
    function getUserData() { 
        //  "functions.php";

        $response = $this->getRequest("me");

        // Return an object of the JSON response
        return json_decode($response->getBody()->getContents());
    }

    /**
     * Get the user's image from Spotify API
     * 
     * @return string|null The image from the user's profile. Null if none set.
     */
    public function getProfPic() {
        $response = $this->getRequest("me");
        $response = json_decode($response->getBody()->getContents());
        
        if (count($response->{"images"}) == 0) {
            return null;
        } else {
            return $response->{"images"}[0]->{"url"};
        }
    }

    /**
     * Get the user's recently played tracks
     * 
     * @param int $limit The number of tracks to receive.
     * @return mixed[] An array containing an array of Track objects of the length specified in paramter
     * at index 0 and a string containing the next href at index 1.
     * @see User::getRequest() Method to handle GET request.
     */
    public function getRecentTracks($limit) {
        require_once "track.php";

        // Store an array of Track objects to be returned
        $tracks = array();
        
        $response = json_decode($this->getRequest("me/player/recently-played?limit=" . $limit)->getBody()->getContents());

        foreach ($response->{"items"} as $track) {
            array_push($tracks, new Track($track, $this->access_token));
        }

        return array($tracks, $response->{"next"});
    }

    /**
     * Update the access token inside the database for current User.
     * 
     * Push the access token of the current user to the the users table
     * inside of the datbabase.
     * 
     * @param DatabaseConnection $db_con The database connection to use.
     * @return boolean Whether the operation was successful or not.
     * @see DatabaseConnection::updateUserAccessToken()
     */
    public function pushAccessTokenToDB($db_con) {
        return $db_con->updateUserAccessToken($this->access_token, $this->id);
    }
}

?>