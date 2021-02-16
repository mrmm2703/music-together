"use strict";var message_input=document.getElementById("messages-input"),dummyAudio=document.getElementById("dummyAudio"),screenBlock=$(".screen-block"),screenBlockShare=$(".screen-block-share"),searchOverlay=$(".search-overlay"),shareContainer=$("#share-container"),dummySearch=document.getElementById("dummy-search"),actualSearch=document.getElementById("search-input-input"),playerImg=$("#player-image"),playerName=$("#player-name"),playerArtist=$("#player-artist"),globCollabUri="";"join"==urlParams.get("action")&&fadeOutSearch();var paused=!0;function changedSong(){$("#player-control-pause").css("background-image","url('img/control-pause.svg')"),spotifyPlayer.getCurrentState().then(function(e){e?(console.log("CONTEXT: "+e.context.uri),console.log("URI: "+e.track_window.current_track.uri),currentTrack=e.track_window.current_track.uri,socket.emit("changeSong",{uri:e.track_window.current_track.uri,context:e.context.uri,name:e.track_window.current_track.name,paused:e.paused}),(e.paused?playbackPause:playbackResume)()):console.error("No music playing.")}),console.log("CHANGED SONG CALLED")}function updatePlayer(){spotifyPlayer.getCurrentState().then(function(e){e?(playerImg.attr("src",e.track_window.current_track.album.images[0].url),playerName.html(e.track_window.current_track.name),playerArtist.html(e.track_window.current_track.artists[0].name)):console.error("No music playing.")})}function playbackPause(){spotifyPlayer.pause(),dummyAudio.pause(),$("#player-control-pause").css("background-image","url('img/control-play.svg')"),paused=!0}function playbackResume(){spotifyPlayer.resume(),dummyAudio.play(),$("#player-control-pause").css("background-image","url('img/control-pause.svg')"),paused=!1}function updateLikedButton(){spotifyPlayer.getCurrentState().then(function(e){e?checkLiked(e.track_window.current_track.id).then(function(e){e?(console.log("LIKED"),likeBtn.css("background-image","url('img/share-like.svg')")):(console.log("UNLIKED"),likeBtn.css("background-image","url('img/share-unlike.svg')")),likeBtn.attr("data-liked",e)}):console.error("No music playing.")})}function likeUnlikeSong(e){like=likeBtn.attr("data-liked"),console.log("LIKEEEEE: "+like),req="true"==like?"DELETE":"PUT",$.ajax({url:"https://api.spotify.com/v1/me/tracks?ids="+e,type:req,headers:{Authorization:"Bearer "+accessToken},success:function(){updateLikedButton(),"true"==like?makePopup("Song removed from library"):makePopup("Song added to library")},error:function(){makePopup("Could not add song to library",!0)}})}$("#player-control-pause").click(function(){(paused=!paused)?(playbackPause(),socket.emit("pause"),addMessage(user_id,"Paused playback",!0)):(playbackResume(),socket.emit("resume"),addMessage(user_id,"Resumed playback",!0))}),$("#player-control-back").click(function(){socket.emit("makeMeHost"),spotifyPlayer.previousTrack(),setTimeout(function(){changedSong(!0),updatePlayer(),addSongChangeMessage(user_id)},250)}),$("#player-control-forward").click(function(){socket.emit("makeMeHost"),spotifyPlayer.nextTrack(),setTimeout(function(){changedSong(!0),updatePlayer(),addSongChangeMessage(user_id)},250)}),likeBtn.click(function(){spotifyPlayer.getCurrentState().then(function(e){e||makePopup("Play a song first",!0),likeUnlikeSong(e.track_window.current_track.id)})}),shareBtn.click(function(){spotifyPlayer.getCurrentState().then(function(e){e||makePopup("Play a song first",!0),fadeInShare("https://open.spotify.com/track/"+e.track_window.current_track.id,"song")})}),playlistBtn.mouseover(function(){playlistChooser.finish(),playlistChooser.fadeIn(250)}),playlistBtn.mouseleave(function(){playlistChooser.finish(),playlistChooser.fadeOut(250)}),$("#collab-choice").click(function(){addToCollab()}),$("#other-choice").click(function(){getPlaylists().then(function(e){console.log(e),addPlaylistsResults(e),fadeInSearch(!0),searchSpotifyResponse(null),makePopup("Choose a playlist to add song to")})});