"use strict";var users_container=$(".group-users-container"),messages_container=$(".messages-container"),songs_container=$("#search-songs-container"),artists_container=$("#search-artists-container"),albums_container=$("#search-albums-container"),playlists_container=$("#search-playlists-container");function addUser(a,e,s){users_container.append("<div id='group-user-"+a+"' class='group-user-container'><div class='group-user-image'><img src='"+s+"'></div><div class='group-user-text-container'><div class='group-user-text-name'>"+e+"</div><div class='group-user-text-typing'>typing...</div></div></div>")}function removeUser(a){$("#group-user-"+a).remove()}function addMessage(a,e){var s=2<arguments.length&&void 0!==arguments[2]&&arguments[2],t="other";a==user_id&&(t="me");var i=new Date,r=i.getHours().toString().padStart(2,"0")+":"+i.getMinutes().toString().padStart(2,"0"),n=$("#group-user-"+a+" .group-user-text-name").text();s?messages_container.append('<div class="message '+t+" message-"+a+'"><div class="message-name">'+n+'</div><div class="message-text"><em>'+e+'</em></div><div class="message-time">'+r+"</div></div>"):messages_container.append('<div class="message '+t+" message-"+a+'"><div class="message-name">'+n+'</div><div class="message-text">'+e+'</div><div class="message-time">'+r+"</div></div>"),messages_container.scrollTop(messages_container[0].scrollHeight)}function userTyping(a){$("#group-user-"+a+" .group-user-text-typing").stop(!0,!0).animate({opacity:1},25).animate({opacity:1},500).animate({opacity:0},500)}function addSongsResults(a){songs_container.empty();var e=a.items;0==!e.length?e.forEach(function(a){var e="defaultProfilePicture.png";0==!a.album.images.length&&(e=a.album.images[0].url);var s=makeSearchItem(a.name,a.artists[0].name,e,"song",a.id,a.album.id);songs_container.append(s)}):songs_container.append("<div class='no-results'>No results.</div>")}function addArtistResults(a){artists_container.empty();var e=a.items;0==!e.length?e.forEach(function(a){var e="defaultProfilePicture.png";0==!a.images.length&&(e=a.images[0].url);var s=makeSearchItem(a.name,"",e,"artist",a.id);artists_container.append(s)}):artists_container.append("<div class='no-results'>No results.</div>")}function addAlbumsResults(a){albums_container.empty();var e=a.items;0==!e.length?e.forEach(function(a){var e="defaultProfilePicture.png";0==!a.images.length&&(e=a.images[0].url);var s=makeSearchItem(a.name,a.artists[0].name,e,"album",a.id);albums_container.append(s)}):albums_container.append("<div class='no-results'>No results.</div>")}function addPlaylistsResults(a){playlists_container.empty();var e=a.items;0==!e.length?e.forEach(function(a){var e="defaultProfilePicture.png";0==!a.images.length&&(e=a.images[0].url);var s=makeSearchItem(a.name,a.owner.display_name,e,"playlist",a.id);playlists_container.append(s)}):playlists_container.append("<div class='no-results'>No results.</div>")}function makeSearchItem(a,e,s,t,i){var r=5<arguments.length&&void 0!==arguments[5]?arguments[5]:"";return'<div data-extra="'+r+'" data-type="'+t+'" data-id="'+i+'" class="search-item-container"><div data-extra="'+r+'" data-type="'+t+'" data-id="'+i+'" class="search-item-image-container"><img data-extra="'+r+'" data-type="'+t+'" data-id="'+i+'" class="search-item-image" src="'+s+'"><div data-extra="'+r+'" data-type="'+t+'" data-id="'+i+'" class="search-item-fan"><div data-extra="'+r+'" data-type="'+t+'" data-id="'+i+'" class="search-item-play"></div><div data-extra="'+r+'" data-type="'+t+'" data-id="'+i+'" class="search-item-queue"></div><div data-extra="'+r+'" data-type="'+t+'" data-id="'+i+'" class="search-item-share"></div></div></div><div data-extra="'+r+'" data-type="'+t+'" data-id="'+i+'" class="search-item-text-container"><div data-extra="'+r+'" data-type="'+t+'" data-id="'+i+'" class="search-item-name">'+a+'</div><div data-extra="'+r+'" data-type="'+t+'" data-id="'+i+'" class="search-item-artist">'+e+"</div></div></div>"}