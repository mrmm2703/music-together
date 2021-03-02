"use strict";var deviceId,spotifyPlayer,currentTrack,firstRun=!0,socket=io.connect("https://morahman.me:3000"),urlParams=new URLSearchParams(window.location.search);window.onSpotifyWebPlaybackSDKReady=function(){(spotifyPlayer=new Spotify.Player({name:"Music Together!",getOAuthToken:function(r){getRefreshedToken(accessToken,refreshToken).then(function(e){document.cookie="access_token="+e.access_token+"; path=/",document.cookie="refresh_token="+e.refresh_token+"; path=/",accessToken=e.access_token,refreshToken=e.refresh_token,$("#settings").attr("src","settings.php?access_token="+accessToken),r(accessToken)},function(e){console.error(e),window.location.href="dashboard.php?error=spotify_auth"})}})).addListener("initialization_error",function(e){var r=e.error;console.error(r)}),spotifyPlayer.addListener("authentication_error",function(e){var r=e.error;console.error(r)}),spotifyPlayer.addListener("account_error",function(e){var r=e.error;console.error(r)}),spotifyPlayer.addListener("playback_error",function(e){var r=e.error;console.error(r),makePopup("Playback error",!0)}),spotifyPlayer.addListener("player_state_changed",function(e){updateMediaSession(),updatePlayer(),e.track_window.current_track.uri!=currentTrack&&(changedSong(),updatePlayer(),addSongChangeMessage(user_id),updateLikedButton(),"pointer"!=screenBlock.css("cursor")&&(initScreenBlock(),fadeOutSearch()),seekBar.attr("max",e.track_window.current_track.duration_ms)),e.paused!=paused&&(e.paused?(playbackPause(),socket.emit("pause"),addMessage(user_id,"Paused playback",!0)):(playbackResume(),socket.emit("resume"),addMessage(user_id,"Resumed playback",!0))),paused=e.paused,seekBarTotalText.text(msToMinutesSeconds(seekBar.attr("max"))),seekBar.val(e.position),seekBarCurText.text(msToMinutesSeconds(e.position))}),spotifyPlayer.addListener("ready",function(e){var r=e.device_id;if(deviceId=r,console.log("READY! DEVICE ID: "+r),firstRun){if(socket.disconnected)return console.error("NO SERVER CONNECTION"),void window.location.replace("dashboard.php?error=server_connection");initSocketListeners(),socket.emit("joinedGroup",{group:group_id,name:user_name,prof_pic:user_prof_pic,id:user_id}),"join"==urlParams.get("action")?(socket.emit("whereAreWe"),initScreenBlock()):urlParams.has("startSong")?("null"==urlParams.get("startContext")?spotifyPlay(urlParams.get("startSong")):spotifyPlay(urlParams.get("startSong"),urlParams.get("startContext")),makePopup("Web player ready"),initScreenBlock()):(makePopup("Player ready! Play a song to get the party started!"),fadeInSearch())}else window.location.replace("player.php?action=join&group_id="+group_id);fadeOutLoading(),seekBarBegin(),firstRun=!1}),spotifyPlayer.addListener("not_ready",function(e){var r=e.device_id;console.log("NOT READY! DEVICE ID: "+r)}),spotifyPlayer.connect()};