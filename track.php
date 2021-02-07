<?php
Namespace MusicTogether;
use GuzzleHttp;
/**
 * Holds information about a Spotify track
 */
class Track {
    /**
     * The Spotify ID of the track.
     * @var string $id
     */
    public $id;
    /**
     * The name of the track.
     * @var string $name
     */
    public $name;
    /**
     * An array of the artists' names.
     * @var string[] $artists
     */
    public $artists = array();
    /**
     * The context in which the song was played by the user.
     * @var string|null $context
     */
    public $context;
    /**
     * The URL to the cover image of the song from Spotify.
     * @var string $cover_image
     */
    public $cover_image;
    /**
     * The URL to a sound file for a 30 second preview of the song.
     * @var string $preview_sound
     */
    public $preview_sound;
    /**
     * The URL to use to find out more about the track using the Spotify API.
     * @var string href;
     */
    public $href;

    /**
     * Constructor method for Track class.
     * @param mixed $spotify_response The response from Spotify about the track.
     * @param string $access_token A valid access token to use to make further GET
     *                             requests to the API
     * @return Track A track object containing information about a single track.
     */
    public function __construct($spotify_response, $access_token) {
        $this->id = $spotify_response->{"track"}->{"id"};
        $this->name = $spotify_response->{"track"}->{"name"};
        if (is_object($spotify_response->{"context"})) {
            $this->context = $spotify_response->{"context"}->{"uri"};
        } else {
            $this->context = "null";
        }
        $this->preview_sound = $spotify_response->{"track"}->{"preview_url"};
        $this->href = $spotify_response->{"track"}->{"href"};

        // Loop through all the artists
        foreach ($spotify_response->{"track"}->{"artists"} as $artist) {
            array_push($this->artists, $artist->{"name"});
        }

        $this->cover_image = $this->getCoverImage($access_token);
    }

    /**
     * Get the cover image of current Track object from Spotify.
     * 
     * @param string $access_token A valid access token to make request to Spotify API.
     * @return string|boolean A URL pointing to the location of an image of the track's cover or
     *                        false if the request failed.
     * @see GuzzleHttp\Client::request()
     */
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