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
        $user_data = $this->getUserData($access_token);
        $id = $user_data->{"id"};
        $this->access_token = $access_token;
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

    function getUserData($access_token) {
        // Use guzzle only for this function
        require '../vendor/autoload.php';
        require "constants.php";
    
        // Check if an access token exists
        if (!(isset($access_token))) {
            return false;
        }
    
        // Create a new client and do a GET request to API
        $client = new GuzzleHttp\Client();
        try {
            $response = $client->request(
                "GET",
                $api_endpoint . "me",
                [
                    "headers" => [
                        "Authorization" => "Bearer " . $access_token
                    ]
                ]
            );
        } catch (Exception $e) {
            // If an error occured in the request
            return var_dump($e);
        }
    
        // Return an object of the JSON response
        return json_decode($response->getBody()->getContents());
    }
}

?>