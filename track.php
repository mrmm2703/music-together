<?php

class Track {
    public $id;
    public $name;
    public $artists = array();
    public $context;
    public $cover_image;
    public $preview_sound;
    public $href;

    public function __construct($spotify_response, $access_token) {
        $this->id = $spotify_response->{"track"}->{"id"};
        $this->name = $spotify_response->{"track"}->{"name"};
        $this->context = $spotify_response->{"context"}->{"uri"};
        $this->preview_sound = $spotify_response->{"track"}->{"preview_url"};
        $this->href = $spotify_response->{"track"}->{"href"};

        // Loop through all the artists
        foreach ($spotify_response->{"track"}->{"artists"} as $artist) {
            array_push($this->artists, $artist->{"name"});
        }

        $this->cover_image = $this->getCoverImage($access_token);
    }

    function getCoverImage($access_token) {
        require_once "./vendor/autoload.php";
        require_once "constants.php";

        $client = new GuzzleHttp\Client();

        // Do a GET request
        try {
            $response = $client->request(
                "GET",
                $this->href,
                [
                    "headers" => [
                        "Authorization" => "Bearer " . $access_token
                    ]
                ]
            );
        } catch (Exception $e) {
            // If an error occured in the request
            return false;
        }
        $response = json_decode($response->getBody()->getContents())->{"album"}->{"images"}[0]->{"url"};
        return $response;
    }
}

?>