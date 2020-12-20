<?php

class User {
    public $id;
    public $name;
    public $nickname;
    public $email;
    public $prof_pic;
    public $banned;
    protected $access_token;
    
    public function __construct($access_token, $db_con) {
        // Get the user's data from Spotify
        $this->access_token = $access_token;
        $user_data = $this->getUserData();
        echo "<br><br>USER DATA<br><br><br><br>";
        var_dump($user_data);
        $id = $user_data->{"id"};
        $db_data = $db_con->getUser($id);
        if (!($db_data)) {
            // If db_con error occured
            errorToHome("db_data_is_false");
        } else if ($db_data == "not_found") {
            // If the user is not found
            // Attempt to insert user
            if (!($db_con->insertUser($user_data))) {
                errorToHome("db_con_insert_user_1");
            }
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
        // Set session variables to setup the dashboard
        $this->id = $id;
        $this->name = $user_data->{"display_name"};

        // Set the nickname session variable depending on whether new user or not
        if ($db_data == "not_found") {
            $this->nickname = NULL;
        } else {
            $this->nickname = $db_data["nickname"];
        }

        $this->email = $user_data->{"email"};

        // Set the profile picture
        if (count($user_data->{"images"}) == 0) {
            $userProfPic = "defaultProfilePicture.png";
        } else {
            $userProfPic = $user_data->{"images"}[0]->{"url"};
        }
        $this->prof_pic = $userProfPic;
    }

    public function logLogin($db_con) {
        $db_con->insertLogin("user", $this->id);
    }

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

    function getUserData() { 
        //  "functions.php";

        $response = $this->getRequest("me");

        // Return an object of the JSON response
        return json_decode($response->getBody()->getContents());
    }

    public function getRecentTracks($limit) {
        require_once "track.php";

        // Store an array of Track objects to be returned
        $tracks = array();
        
        $response = json_decode($this->getRequest("me/player/recently-played?limit=" . $limit)->getBody()->getContents());

        foreach ($response->{"items"} as $track) {
            array_push($tracks, new Track($track, $this->access_token));
        }

        return $tracks;
    }
}

?>