"use strict";var users_container=$(".group-users-container"),messages_container=$(".messages-container"),likeBtn=$(".player-share-like"),shareBtn=$(".player-share-share"),playlistBtn=$(".player-share-playlist"),playlistChooser=$(".playlist-chooser"),songs_container=$("#search-songs-container"),artists_container=$("#search-artists-container"),albums_container=$("#search-albums-container"),playlists_container=$("#search-playlists-container"),tracks_container=$(".recent-tracks-container");function addUser(a,t,e){users_container.append("<div id='group-user-"+a+"' class='group-user-container'><div class='group-user-image'><img src='"+e+"'></div><div class='group-user-text-container'><div class='group-user-text-name'>"+t+"</div><div class='group-user-text-typing'>typing...</div></div></div>")}function removeUser(a){$("#group-user-"+a).remove()}function getNameFromId(a){return $("#group-user-"+a+" .group-user-text-name").text()}function addMessage(a,t){var e=2<arguments.length&&void 0!==arguments[2]&&arguments[2],i="other";a==user_id&&(i="me");var s=new Date,n=s.getHours().toString().padStart(2,"0")+":"+s.getMinutes().toString().padStart(2,"0"),r=getNameFromId(a);e?$(".message-text em").last().text()==t&&$(".message-name").last().text()==r||messages_container.append('<div class="message '+i+" message-"+a+'"><div class="message-name">'+r+'</div><div class="message-text"><em>'+t+'</em></div><div class="message-time">'+n+"</div></div>"):messages_container.append('<div class="message '+i+" message-"+a+'"><div class="message-name">'+r+'</div><div class="message-text">'+t+'</div><div class="message-time">'+n+"</div></div>"),messages_container.scrollTop(messages_container[0].scrollHeight)}function userTyping(a){$("#group-user-"+a+" .group-user-text-typing").stop(!0,!0).animate({opacity:1},25).animate({opacity:1},500).animate({opacity:0},500)}function searchSpotifyResponse(a){console.log(a),null!=a&&(addSongsResults(a.tracks),addArtistResults(a.artists),addAlbumsResults(a.albums),addPlaylistsResults(a.playlists),$(".search-type-container").css("display","flex"),$(".search-title").css("display","block")),$(".search-item-image-container").hover(function(){$(".search-item-fan[data-id='"+$(this).data("id")+"']").stop(!0,!0),$(".search-item-fan[data-id='"+$(this).data("id")+"']").animate({width:"18em",paddingLeft:"4em",paddingRight:"1em"},150),$(".search-item-text-container[data-id='"+$(this).data("id")+"']").stop(!0,!0),$(".search-item-text-container[data-id='"+$(this).data("id")+"']").animate({marginLeft:"-4em",opacity:0},150)},function(){$(".search-item-fan[data-id='"+$(this).data("id")+"']").stop(!0,!0),$(".search-item-fan[data-id='"+$(this).data("id")+"']").animate({width:"0",paddingLeft:"0",paddingRight:"0"},150),$(".search-item-text-container[data-id='"+$(this).data("id")+"']").stop(!0,!0),$(".search-item-text-container[data-id='"+$(this).data("id")+"']").animate({marginLeft:"1.6vw",opacity:1},150)}),$(".search-item-play").click(function(){socket.emit("makeMeHost"),"song"==$(this).data("type")?spotifyPlay("spotify:track:"+$(this).data("id"),"spotify:album:"+$(this).data("extra"),null,!0):"playlist"==$(this).data("type")?spotifyPlayPlaylistAlbum("spotify:playlist:"+$(this).data("id"),!0):"artist"==$(this).data("type")?spotifyPlayArtist("spotify:artist:"+$(this).data("id")):"album"==$(this).data("type")&&spotifyPlayPlaylistAlbum("spotify:album:"+$(this).data("id"),!0),setTimeout(function(){changedSong(),updatePlayer(),addSongChangeMessage(user_id)},500),dummyAudio.play()}),$(".search-item-queue").click(function(){var a="spotify:track:"+$(this).data("id"),t=$(".search-item-name[data-id='"+$(this).data("id")+"']").html(),e=$(".search-item-artist[data-id='"+$(this).data("id")+"']").html(),i=$(".search-item-image[data-id='"+$(this).data("id")+"']").attr("src");addToSpotifyQueue(a,!0),socket.emit("addToQueue",{uri:a,name:t,artist:e,image:i}),addMessage(user_id,"Added "+t+" by "+e+" to the queue.",!0)}),$(".search-item-share").click(function(){fadeInShare($(this).data("href"),$(this).data("type"))}),$(".search-item-add").click(function(){var t=this;spotifyPlayer.getCurrentState().then(function(a){a?addToPlaylist(a.track_window.current_track.id,$(t).data("id")).then(function(a){makePopup("Added to playlist")},function(a){makePopup("Could not add to playlist")}):makePopup("No song playing")})}),$(".search-item-fan").css("width","0"),$(".search-item-fan").css("padding-left","0"),$(".search-item-fan").css("padding-right","0")}function addSongsResults(a){songs_container.empty();var t=a.items;0==!t.length?t.forEach(function(a){var t="defaultProfilePicture.png";0==!a.album.images.length&&(t=a.album.images[0].url);var e=makeSearchItem(a.name,a.artists[0].name,t,"song",a.id,a.album.id,a.external_urls.spotify);songs_container.append(e)}):songs_container.append("<div class='no-results'>No results.</div>")}function addArtistResults(a){artists_container.empty();var t=a.items;0==!t.length?t.forEach(function(a){var t="defaultProfilePicture.png";0==!a.images.length&&(t=a.images[0].url);var e=makeSearchItem(a.name,"",t,"artist",a.id,"",a.external_urls.spotify);artists_container.append(e)}):artists_container.append("<div class='no-results'>No results.</div>")}function addAlbumsResults(a){albums_container.empty();var t=a.items;0==!t.length?t.forEach(function(a){var t="defaultProfilePicture.png";0==!a.images.length&&(t=a.images[0].url);var e=makeSearchItem(a.name,a.artists[0].name,t,"album",a.id,"",a.external_urls.spotify);albums_container.append(e)}):albums_container.append("<div class='no-results'>No results.</div>")}function addPlaylistsResults(a){playlists_container.empty();var t=a.items;0==!t.length?t.forEach(function(a){var t,e;console.log("GLOB: "+globCollabUri),console.log("CUR: "+a.id),a.id!=globCollabUri&&(t="defaultProfilePicture.png",0==!a.images.length&&(t=a.images[0].url),e=makeSearchItem(a.name,a.owner.display_name,t,"playlist",a.id,"",a.external_urls.spotify),playlists_container.append(e))}):playlists_container.append("<div class='no-results'>No results.</div>")}function makeSearchItem(a,t,e,i,s){var n=5<arguments.length&&void 0!==arguments[5]?arguments[5]:"";return'<div data-extra="'+n+'" data-type="'+i+'" data-id="'+s+'" class="search-item-container"><div data-extra="'+n+'" data-type="'+i+'" data-id="'+s+'" class="search-item-image-container"><img data-extra="'+n+'" data-type="'+i+'" data-id="'+s+'" class="search-item-image" src="'+e+'"><div data-extra="'+n+'" data-type="'+i+'" data-id="'+s+'" class="search-item-fan">'+("artist"!=i?'<div data-extra="'+n+'" data-type="'+i+'" data-id="'+s+'" class="search-item-play"></div>':"")+("song"==i?'<div data-extra="'+n+'" data-type="'+i+'" data-id="'+s+'" class="search-item-queue"></div>':"")+'<div data-extra="'+n+'" data-type="'+i+'" data-id="'+s+'" data-href="'+(6<arguments.length&&void 0!==arguments[6]?arguments[6]:"")+'"class="search-item-share"></div>'+("playlist"==i?'<div data-extra="'+n+'" data-type="'+i+'" data-id="'+s+'" class="search-item-add"></div>':"")+'</div></div><div data-extra="'+n+'" data-type="'+i+'" data-id="'+s+'" class="search-item-text-container"><div data-extra="'+n+'" data-type="'+i+'" data-id="'+s+'" class="search-item-name">'+a+'</div><div data-extra="'+n+'" data-type="'+i+'" data-id="'+s+'" class="search-item-artist">'+t+"</div></div></div>"}var popupIndex=0;function makePopup(a){var t=popupIndex;popupIndex++;var e="img/check-mark.png";1<arguments.length&&void 0!==arguments[1]&&arguments[1]&&(e="img/error.png");var i='<div style="z-index: '+(250+t)+'" id="popup-'+t+'" class="popup-container"><img src="'+e+'"><div>'+a+"</div></div>";$("body").append(i),$("#popup-"+t).animate({top:"30px"},250).delay(3e3).animate({top:"50px",opacity:0},150),setTimeout(function(){$("#popup-"+t).remove()},3500)}function fadeInSearch(){var a=0<arguments.length&&void 0!==arguments[0]&&arguments[0];screenBlock.css("display","block"),screenBlock.animate({opacity:1},250),searchOverlay.css("display","grid"),a&&($(".search-type-container:not(#search-playlists-container)").css("display","none"),$(".search-title:not(#search-playlists-title)").css("display","none")),searchOverlay.animate({opacity:1},250)}function fadeOutSearch(){screenBlock.animate({opacity:0},250),searchOverlay.animate({opacity:0},250),setTimeout(function(){screenBlock.css("display","none"),searchOverlay.css("display","none"),$(".search-type-container").css("display","flex"),$(".search-title").css("display","block")},250)}function fadeInShare(a){var t=1<arguments.length&&void 0!==arguments[1]&&arguments[1];screenBlockShare.css("display","block"),screenBlockShare.animate({opacity:1},250),shareContainer.css("display","flex"),shareContainer.animate({opacity:1},250),t?(shareContainer.find(".grid-title").html("Share "+t),$("#twitter").attr("href","https://twitter.com/intent/tweet?url="+a+"&text=Checkout this "+t+" on Spotify:"),$("#email").attr("href","mailto:?subject=Checkout%20this%20"+t+"&body=Hey!%0D%0A%0D%0ACheckout%20this%20"+t+"%20on%20Spotify!%0D%0A"+a),$("#link").html(a),$("#fb").attr("href","https://www.facebook.com/sharer/sharer.php?u="+a)):(shareContainer.find(".grid-title").html("Invite users"),$("#twitter").attr("href","https://twitter.com/intent/tweet?url=https://morahman.me/musictogether/join.php?group_id="+a+"&text=Join my Music Together group:"),$("#email").attr("href","mailto:?subject=Join%20my%20Music%20Together%20group!&body=Hey!Join%20my%20Music%20Together%20group%20session%20here%3Ahttps%3A%2F%2Fmorahman.me%2Fmusictogether%2Fjoin.php%3Fgroup_id%3D"+a),$("#link").html("https://morahman.me/musictogether/join.php?group_id="+a),$("#fb").attr("href","https://www.facebook.com/sharer/sharer.php?u=https://morahman.me/musictogether/join.php?group_id="+a))}function fadeOutShare(){screenBlockShare.animate({opacity:0},250),shareContainer.animate({opacity:0},250),setTimeout(function(){screenBlockShare.css("display","none"),shareContainer.css("display","none")},250)}function addSongChangeMessage(t){console.log("ADD SONG CHANGE MESSAGE"),spotifyPlayer.getCurrentState().then(function(a){a?addMessage(t,"Now playing "+a.track_window.current_track.name,!0):console.error("No music playing.")})}function updateCollabPlaylist(a){getPlaylist(a).then(function(a){tracks_container.empty(),a.tracks.items.forEach(function(a){tracks_container.append(trackListItem(a.track.name,a.track.artists[0].name,a.track.album.images[0].url,a.track.id,a.added_by.id))})},function(a){makePopup("Could not update collab playlist",!0)})}function trackListItem(a,t,e,i,s){getNameFromId(s);return'\n        <div data-added-by="'.concat(s,'" data-id="').concat(i,'" class="recent-track-container">\n            <div class="recent-track-image-container">\n                <img class="recent-track-image" src="').concat(e,'">\n                <div class="recent-track-image-likes-container">\n                    <img class="recent-track-image-likes-icon" src="img/like.png">\n                    <div class="recent-track-image-likes-number">7</div>\n                </div>\n            </div>\n            <div class="recent-track-text-container">\n                <div class="recent-track-name">\n                    ').concat(a,'\n                </div>\n                <div class="recent-track-artist">\n                    ').concat(t,"\n                </div>\n            </div>\n        </div>\n    ")}