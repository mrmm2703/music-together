<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Music Together!</title>
    <link rel="stylesheet" href="style/dist/player.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
</head>
<body>
    <div class="grid-container">

        <div class="grid-group">
            <div class="grid-title">
                My group
            </div>
            <div class="group-id">
                Group ID: 5259
            </div>
            <div class="yellow-btn group-invite-btn">
                Invite users
            </div>

            <div class="group-users-container">
                <div class="group-user-container">
                    <div class="group-user-image">
                        <img src="defaultProfilePicture.png">
                    </div>
                    <div class="group-user-text-container">
                        <div class="group-user-text-name">
                            Brent Ross
                        </div>
                        <div class="group-user-text-typing">
                            typing...
                        </div>
                    </div>
                </div>
    
                <div class="group-user-container">
                    <div class="group-user-image">
                        <img src="defaultProfilePicture.png">
                    </div>
                    <div class="group-user-text-container">
                        <div class="group-user-text-name">
                            Brent Ross
                        </div>
                        <div class="group-user-text-typing">
                            typing...
                        </div>
                    </div>
                </div>
    
                <div class="group-user-container">
                    <div class="group-user-image">
                        <img src="defaultProfilePicture.png">
                    </div>
                    <div class="group-user-text-container">
                        <div class="group-user-text-name">
                            Brent Ross
                        </div>
                        <div class="group-user-text-typing">
                            typing...
                        </div>
                    </div>
                </div>

            </div>

        </div>

        <div class="grid-messages">
            <div class="grid-title">
                Messages
            </div>
            <div class="messages-container">

                <div class="message other">
                    <div class="message-name">
                        Carol Anne
                    </div>
                    <div class="message-text">
                        Hi there blah blah blah.
                    </div>
                    <div class="message-time">
                        15:09
                    </div>
                </div>

                <div class="message me">
                    <div class="message-name">
                        Carol Anne
                    </div>
                    <div class="message-text">
                        Hi there blah blah blah.
                    </div>
                    <div class="message-time">
                        15:09
                    </div>
                </div>

            </div>
            <div class="messages-input-container">
                <input type="text" placeholder="Message">
                <a class="messages-input-btn yellow-btn" href="#">
                    Send
                </a>
            </div>
        </div>

        <div class="grid-recent">
            <div class="grid-title">
                Recently played
            </div>
            <div class="recent-tracks-container">

                <div class="recent-track-container">
                    <div class="recent-track-image-container">
                        <img class="recent-track-image" src="defaultProfilePicture.png">
                        <div class="recent-track-image-likes-container">
                            <img class="recent-track-image-likes-icon" src="img/like.png">
                            <div class="recent-track-image-likes-number">7</div>
                        </div>
                    </div>
                    <div class="recent-track-text-container">
                        <div class="recent-track-name">
                            The Sound
                        </div>
                        <div class="recent-track-artist">
                            The 1975
                        </div>
                    </div>
                </div>

                <div class="recent-track-container">
                    <div class="recent-track-image-container">
                        <img class="recent-track-image" src="defaultProfilePicture.png">
                        <div class="recent-track-image-likes-container">
                            <img class="recent-track-image-likes-icon" src="img/like.png">
                            <div class="recent-track-image-likes-number">7</div>
                        </div>
                    </div>
                    <div class="recent-track-text-container">
                        <div class="recent-track-name">
                            The Sound
                        </div>
                        <div class="recent-track-artist">
                            The 1975
                        </div>
                    </div>
                </div>

                <div class="recent-track-container">
                    <div class="recent-track-image-container">
                        <img class="recent-track-image" src="defaultProfilePicture.png">
                        <div class="recent-track-image-likes-container">
                            <img class="recent-track-image-likes-icon" src="img/like.png">
                            <div class="recent-track-image-likes-number">7</div>
                        </div>
                    </div>
                    <div class="recent-track-text-container">
                        <div class="recent-track-name">
                            The Sound
                        </div>
                        <div class="recent-track-artist">
                            The 1975
                        </div>
                    </div>
                </div>

            </div>

        </div>

        <div class="grid-player">

            <div class="settings-container">
                <div class="settings-inner-container">
                    <div class="settings-text-container">
                        <div class="settings-name">
                            Brent Ross
                        </div>
                        <a class="settings-btn yellow-btn" href="#">
                            Settings
                        </a>
                    </div>
                    <div class="settings-image">
                        <img id="prof-pic" src="defaultProfilePicture.png" />
                    </div>
                </div>
            </div>

            <div class="player-container">
                <div class="player-image-container">
                    <img src="defaultProfilePicture.png" class="player-image">
                </div>
                <div class="player-text-container">
                    <div class="player-text-name">Martin & Gina</div>
                    <div class="player-text-artist">Polo G</div>
                </div>
                <div class="player-controls-container">
                    <div class="player-control" id="player-control-back"></div>
                    <div class="player-control" id="player-control-pause"></div>
                    <div class="player-control" id="player-control-forward"></div>
                </div>
                <div class="player-share-container">
                        <div class="player-share-playlist"></div>
                        <div class="player-share-like"></div>
                        <div class="player-share-share"></div>
                    </div>
            </div>

        </div>
    </div>
</body>