"use strict";var message_input=document.getElementById("messages-input");function initSocketListeners(){socket.on("usersInGroup",function(e){for(var t in console.log("usersInGroup:"),e.users)console.log(t),addUser(t,e.users[t].name,e.users[t].prof_pic)}),socket.on("newUser",function(e){console.log("newUser: "+e),addUser(e.id,e.name,e.prof_pic),addMessage(e.id,"Joined the group",!0)}),socket.on("userLeft",function(e){console.log("userLeft: "+e),addMessage(e,"Left the group",!0),removeUser(e)}),socket.on("messageBanned",function(e){alert('The message you sent is banned for containing the word "'.concat(e,'"'))}),socket.on("newMessage",function(e){addMessage(e.id,e.message,!1)}),socket.on("typing",function(e){userTyping(e)}),socket.on("changeSong",function(e){spotifyPlay(e.uri,e.context),setTimeout(function(){(e.paused?playbackPause:playbackResume)(),addSongChangeMessage(e.id)},500)}),socket.on("pause",function(e){playbackPause(),addMessage(e,"Paused playback",!0)}),socket.on("resume",function(e){playbackResume(),addMessage(e,"Resumed playback",!0)}),socket.on("whereAreWe",function(t){spotifyPlayer.getCurrentState().then(function(e){e?(currentTrack=e.track_window.current_track.uri,socket.emit("weAreHere",{uri:e.track_window.current_track.uri,context:e.context.uri,position:e.position,paused:e.paused,socketId:t})):console.error("No music playing.")})}),socket.on("weAreHere",function(e){currentTrack=e.uri,spotifyPlay(e.uri,e.context,e.position),setTimeout(function(){updatePlayer(),(e.paused?playbackPause:playbackResume)()},1500)}),socket.on("addToQueue",function(e){addToSpotifyQueue(e.uri),addMessage(e.id,"Added "+e.name+" by "+e.artist+" to the queue",!0)})}$(document).ready(function(){});var dummySearch=document.getElementById("dummy-search"),actualSearch=document.getElementById("search-input-input"),searchQuery="",screenBlock=$(".screen-block"),searchOverlay=$(".search-overlay");function fadeInSearch(){screenBlock.css("display","block"),screenBlock.animate({opacity:1},250),searchOverlay.css("display","grid"),searchOverlay.animate({opacity:1},250)}function fadeOutSearch(){screenBlock.animate({opacity:0},250),searchOverlay.animate({opacity:0},250),setTimeout(function(){screenBlock.css("display","none"),searchOverlay.css("display","none")},250)}function addSongChangeMessage(t){console.log("ADD SONG CHANGE MESSAGE"),spotifyPlayer.getCurrentState().then(function(e){e?addMessage(t,"Now playing "+e.track_window.current_track.name,!0):console.error("No music playing.")})}function msToMinutesSeconds(e){var t=e/1e3,a=Math.floor(e/60),s=Math.floor(t-a);return a.toString()+":"+s.toString().padStart(2,"0")}function searchSpotify(e){$.ajax({url:"https://api.spotify.com/v1/search?type=album,artist,track,playlist&limit=8&q="+e,type:"GET",dataType:"json",headers:{Authorization:"Bearer "+accessToken},success:function(e){searchSpotifyResponse(e)},error:function(e){alert("An error occured while searching."),console.log(e)}})}function searchSpotifyResponse(e){console.log(e),addSongsResults(e.tracks),addArtistResults(e.artists),addAlbumsResults(e.albums),addPlaylistsResults(e.playlists),$(".search-item-image-container").hover(function(){console.log($(this).data("id")),$(".search-item-fan[data-id='"+$(this).data("id")+"']").stop(!0,!0),$(".search-item-fan[data-id='"+$(this).data("id")+"']").animate({width:"18em",paddingLeft:"4em",paddingRight:"1em"},150),$(".search-item-text-container[data-id='"+$(this).data("id")+"']").stop(!0,!0),$(".search-item-text-container[data-id='"+$(this).data("id")+"']").animate({marginLeft:"-4em",opacity:0},150)},function(){$(".search-item-fan[data-id='"+$(this).data("id")+"']").stop(!0,!0),$(".search-item-fan[data-id='"+$(this).data("id")+"']").animate({width:"0",paddingLeft:"0",paddingRight:"0"},150),$(".search-item-text-container[data-id='"+$(this).data("id")+"']").stop(!0,!0),$(".search-item-text-container[data-id='"+$(this).data("id")+"']").animate({marginLeft:"1.6vw",opacity:1},150)}),$(".search-item-play").click(function(){socket.emit("makeMeHost"),"song"==$(this).data("type")?spotifyPlay("spotify:track:"+$(this).data("id"),"spotify:album:"+$(this).data("extra")):"playlist"==$(this).data("type")?spotifyPlayPlaylistAlbum("spotify:playlist:"+$(this).data("id")):"artist"==$(this).data("type")?spotifyPlayArtist("spotify:artist:"+$(this).data("id")):"album"==$(this).data("type")&&spotifyPlayPlaylistAlbum("spotify:album:"+$(this).data("id")),setTimeout(function(){changedSong(),updatePlayer(),addSongChangeMessage(user_id)},500)}),$(".search-item-queue").click(function(){var e="spotify:track:"+$(this).data("id"),t=$(".search-item-name[data-id='"+$(this).data("id")+"']").html(),a=$(".search-item-artist[data-id='"+$(this).data("id")+"']").html(),s=$(".search-item-image[data-id='"+$(this).data("id")+"']").attr("src");addToSpotifyQueue(e),socket.emit("addToQueue",{uri:e,name:t,artist:a,image:s}),addMessage(user_id,"Added "+t+" by "+a+" to the queue.",!0)}),$(".search-item-fan").css("width","0"),$(".search-item-fan").css("padding-left","0"),$(".search-item-fan").css("padding-right","0")}function spotifyPlay(e){var t,a=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null,s=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null;console.log("SPOTIFY PLAY:"),console.log("TRACK: "+e),console.log("CONTEXT: "+a),null!=a?("artist"==a.substring(8,14)&&(t=JSON.stringify({context_uri:a})),t=null!=s?JSON.stringify({context_uri:a,offset:{uri:e},position_ms:s}):JSON.stringify({context_uri:a,offset:{uri:e}}),$.ajax({url:"https://api.spotify.com/v1/me/player/play?device_id="+deviceId,data:t,type:"PUT",headers:{Authorization:"Bearer "+accessToken},success:function(){console.log("PLAY REQUEST SUCCESSFUL")},error:function(e){console.error("PLAY RESULT FAILED:"),console.error(e)}})):(null!=s?JSON.stringify({uris:[e],position_ms:s}):JSON.stringify({uris:[e]}),$.ajax({url:"https://api.spotify.com/v1/me/player/play?device_id="+deviceId,data:void 0,type:"PUT",headers:{Authorization:"Bearer "+accessToken},success:function(){console.log("PLAY REQUEST SUCCESSFUL")},error:function(e){console.error("PLAY RESULT FAILED:"),console.error(e)}}))}function spotifyPlayArtist(e){$.ajax({url:"https://api.spotify.com/v1/me/player/play?device_id="+deviceId,data:JSON.stringify({context_uri:e}),type:"PUT",headers:{Authorization:"Bearer "+accessToken},success:function(){console.log("PLAY REQUEST SUCCESSFUL")},error:function(e){console.error("PLAY RESULT FAILED:"),console.error(e)}})}function spotifyPlayPlaylistAlbum(e){$.ajax({url:"https://api.spotify.com/v1/me/player/play?device_id="+deviceId,data:JSON.stringify({context_uri:e,offset:{position:0}}),type:"PUT",headers:{Authorization:"Bearer "+accessToken},success:function(){console.log("PLAY REQUEST SUCCESSFUL")},error:function(e){console.error("PLAY RESULT FAILED:"),console.error(e)}})}function addToSpotifyQueue(e){$.ajax({url:"https://api.spotify.com/v1/me/player/queue?uri="+e+"&device_id="+deviceId,type:"POST",headers:{Authorization:"Bearer "+accessToken},success:function(){console.log("ADD TO QUEUE SUCCESSFUL")},error:function(e){console.error("ADD TO QUEUE FAILED:"),console.error(e)}})}document.getElementById("messages-input").addEventListener("keyup",function(e){13===e.keyCode?(e.preventDefault(),socket.emit("message",message_input.value),message_input.value=""):socket.emit("typing")}),dummySearch.addEventListener("keyup",function(e){13===e.keyCode&&(e.preventDefault(),searchQuery=dummySearch.value,actualSearch.value=searchQuery,fadeInSearch(),setTimeout(function(){dummySearch.value=""},500),searchSpotify(searchQuery))}),actualSearch.addEventListener("keyup",function(e){13===e.keyCode&&(e.preventDefault(),searchSpotify(searchQuery=actualSearch.value))}),screenBlock.click(function(){fadeOutSearch()});var paused=!1;function changedSong(){$("#player-control-pause").css("background-image","url('img/control-pause.svg')"),spotifyPlayer.getCurrentState().then(function(e){e?(console.log("CONTEXT: "+e.context.uri),console.log("URI: "+e.track_window.current_track.uri),currentTrack=e.track_window.current_track.uri,socket.emit("changeSong",{uri:e.track_window.current_track.uri,context:e.context.uri,name:e.track_window.current_track.name,paused:e.paused}),(e.paused?playbackPause:playbackResume)()):console.error("No music playing.")}),console.log("CHANGED SONG CALLED")}$("#player-control-pause").click(function(){(paused=!paused)?(playbackPause(),socket.emit("pause"),addMessage(user_id,"Paused playback",!0)):(playbackResume(),socket.emit("resume"),addMessage(user_id,"Resumed playback",!0))}),$("#player-control-back").click(function(){socket.emit("makeMeHost"),spotifyPlayer.previousTrack(),setTimeout(function(){changedSong(!0),updatePlayer(),addSongChangeMessage(user_id)},250)}),$("#player-control-forward").click(function(){socket.emit("makeMeHost"),spotifyPlayer.nextTrack(),setTimeout(function(){changedSong(!0),updatePlayer(),addSongChangeMessage(user_id)},250)});var playerImg=$("#player-image"),playerName=$("#player-name"),playerArtist=$("#player-artist");function updatePlayer(){spotifyPlayer.getCurrentState().then(function(e){e?(playerImg.attr("src",e.track_window.current_track.album.images[0].url),playerName.html(e.track_window.current_track.name),playerArtist.html(e.track_window.current_track.artists[0].name)):console.error("No music playing.")})}function playbackPause(){spotifyPlayer.pause(),$("#player-control-pause").css("background-image","url('img/control-play.svg')"),paused=!0}function playbackResume(){spotifyPlayer.resume(),$("#player-control-pause").css("background-image","url('img/control-pause.svg')"),paused=!1}