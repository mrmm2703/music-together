"use strict";function initSocketListeners(){socket.on("connect",function(){firstRun||window.location.replace("player.php?action=join&group_id="+group_id)}),socket.on("disconnect",function(){fadeInLoading(),playbackPause(),makePopup("Disconnected from server",!0),console.log("Disconnected from server")}),socket.on("usersInGroup",function(e){for(var o in console.log("usersInGroup:"),e.users)console.log(o),addUser(o,e.users[o].name,e.users[o].prof_pic)}),socket.on("newUser",function(e){console.log("newUser: "+e),addUser(e.id,e.name,e.prof_pic),addMessage(e.id,"Joined the group",!0)}),socket.on("userLeft",function(e){console.log("userLeft: "+e),addMessage(e,"Left the group",!0),removeUser(e)}),socket.on("userBanned",function(){window.location.href="logout.php?action=banned"}),socket.on("messageBanned",function(e){makePopup('The message you sent is banned for containing the word "'.concat(e,'"'),!0)}),socket.on("newMessage",function(e){addMessage(e.id,e.message,!1)}),socket.on("typing",function(e){userTyping(e)}),socket.on("changeSong",function(e){spotifyPlay(e.uri,e.context,null,null),setTimeout(function(){(e.paused?playbackPause:playbackResume)(),addSongChangeMessage(e.id)},500)}),socket.on("pause",function(e){paused||(playbackPause(),addMessage(e,"Paused playback",!0))}),socket.on("resume",function(e){paused&&(playbackResume(),addMessage(e,"Resumed playback",!0))}),socket.on("seek",function(e){console.log("SEEK REC"),spotifyPlayer.seek(e.pos).then(function(){addMessage(e.id,"Seeked to "+msToMinutesSeconds(e.pos),!0),seekBarCurText.val(msToMinutesSeconds(e.pos))})}),socket.on("whereAreWe",function(o){spotifyPlayer.getCurrentState().then(function(e){e?(currentTrack=e.track_window.current_track.uri,socket.emit("weAreHere",{uri:e.track_window.current_track.uri,context:e.context.uri,position:e.position,paused:e.paused,socketId:o,duration:e.track_window.current_track.duration_ms})):console.error("No music playing.")})}),socket.on("weAreHere",function(e){currentTrack=e.uri,spotifyPlay(e.uri,e.context,e.position,null),setTimeout(function(){updatePlayer(),(e.paused?playbackPause:playbackResume)()},1500),setTimeout(function(){e.queue.forEach(function(e){addToSpotifyQueue(e)})},5e3),makePopup("All caught up!"),seekBar.val(e.position),seekBar.attr("max",e.duration),seekBarTotalText.text(msToMinutesSeconds(seekBar.attr("max")))}),socket.on("addToQueue",function(e){addToSpotifyQueue(e.uri),addMessage(e.id,"Added "+e.name+" by "+e.artist+" to the queue",!0)}),socket.on("noCollabPlaylist",function(o){var e=new Date;createPlaylist("Collab ("+group_id+")","Music Together session on ".concat(e.getDate(),"/")+"".concat(e.getMonth()+1,"/").concat(e.getFullYear(),". Group ID: ").concat(group_id)).then(function(e){socket.emit("newPlaylist",{songId:o,collabUri:e.id})},function(e){makePopup("Could not create collab playlist",!0)})}),socket.on("followPlaylist",function(e){console.log("FOLLOW PLAYLIST"),console.log(e),followPlaylist(e).then(function(e){},function(e){makePopup("Could not follow collab playlist",!0)})}),socket.on("collabUri",function(o){addToPlaylist(o.songId,o.collabUri).then(function(e){socket.emit("newPlaylistItem"),makePopup("Added to collab playlist"),globCollabUri=o.collabUri,updateCollabPlaylist(o.collabUri)},function(e){makePopup("Could not add to collaborative playlist",!0)})}),socket.on("updatePlaylist",function(e){globCollabUri=e,updateCollabPlaylist(e)}),socket.on("updateName",function(e){console.log("Change name"),console.log(e),$("#group-user-"+e.id+" .group-user-text-name").text(e.name),$(".message-"+e.id+" .message-name").text(e.name),$(".user-name-"+e.id).text(e.name)}),socket.on("updateProfPic",function(e){$("#group-user-"+e.id+" .group-user-image img").attr("src",e.profPic),$(".user-image-"+e.id).attr("src",e.profPic)}),socket.on("updateLikes",function(o){console.log(o),$(".recent-track-image-likes-number[data-id='"+o.songId+"']").text(o.users.length),$(".users-container[data-id='"+o.songId+"']").empty(),o.users.forEach(function(e){$(".users-container[data-id='"+o.songId+"']").append(likedByUserItem(e))})})}