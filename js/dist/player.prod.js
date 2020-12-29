"use strict";var message_input=document.getElementById("messages-input"),socket=io.connect("https://morahman.me:3000");$(document).ready(function(){socket.emit("joinedGroup",{group:group_id,name:user_name,prof_pic:user_prof_pic,id:user_id})}),socket.on("usersInGroup",function(e){for(var a in console.log("usersInGroup:"),e.users)console.log(a),addUser(a,e.users[a].name,e.users[a].prof_pic)}),socket.on("newUser",function(e){console.log("newUser: "+e),addUser(e.id,e.name,e.prof_pic)}),socket.on("userLeft",function(e){console.log("userLeft: "+e),removeUser(e)}),socket.on("messageBanned",function(e){alert('The message you sent is banned for containing the word "'.concat(e,'"'))}),socket.on("newMessage",function(e){addMessage(e.id,e.message,!1)}),socket.on("typing",function(e){userTyping(e)}),document.getElementById("messages-input").addEventListener("keyup",function(e){13===e.keyCode?(e.preventDefault(),socket.emit("message",message_input.value),message_input.value=""):socket.emit("typing")});var searchQuery="",dummySearch=document.getElementById("dummy-search"),actualSearch=document.getElementById("search-input-input"),screenBlock=$(".screen-block"),searchOverlay=$(".search-overlay");function fadeInSearch(){screenBlock.css("display","block"),screenBlock.animate({opacity:1},250),searchOverlay.css("display","grid"),searchOverlay.animate({opacity:1},250)}function fadeOutSearch(){screenBlock.animate({opacity:0},250),searchOverlay.animate({opacity:0},250),setTimeout(function(){screenBlock.css("display","none"),searchOverlay.css("display","none")},250)}function searchSpotify(e){$.ajax({url:"https://api.spotify.com/v1/search?type=album,artist,track,playlist&limit=8&q="+e,type:"GET",dataType:"json",headers:{Authorization:"Bearer "+accessToken},success:function(e){searchSpotifyResponse(e)},error:function(e){alert("An error occured while searching."),console.log(e)}})}function searchSpotifyResponse(e){console.log(e),addSongsResults(e.tracks),addArtistResults(e.artists),addAlbumsResults(e.albums),addPlaylistsResults(e.playlists),$(".search-item-image-container").hover(function(){console.log($(this).data("id")),$(".search-item-fan[data-id='"+$(this).data("id")+"']").stop(!0,!0),$(".search-item-fan[data-id='"+$(this).data("id")+"']").animate({width:"18em",paddingLeft:"4em",paddingRight:"1em"},150),$(".search-item-text-container[data-id='"+$(this).data("id")+"']").stop(!0,!0),$(".search-item-text-container[data-id='"+$(this).data("id")+"']").animate({marginLeft:"-4em",opacity:0},150)},function(){$(".search-item-fan[data-id='"+$(this).data("id")+"']").stop(!0,!0),$(".search-item-fan[data-id='"+$(this).data("id")+"']").animate({width:"0",paddingLeft:"0",paddingRight:"0"},150),$(".search-item-text-container[data-id='"+$(this).data("id")+"']").stop(!0,!0),$(".search-item-text-container[data-id='"+$(this).data("id")+"']").animate({marginLeft:"1.6vw",opacity:1},150)}),$(".search-item-fan").css("width","0"),$(".search-item-fan").css("padding-left","0"),$(".search-item-fan").css("padding-right","0")}dummySearch.addEventListener("keyup",function(e){13===e.keyCode&&(e.preventDefault(),searchQuery=dummySearch.value,actualSearch.value=searchQuery,fadeInSearch(),setTimeout(function(){dummySearch.value=""},500),searchSpotify(searchQuery))}),actualSearch.addEventListener("keyup",function(e){13===e.keyCode&&(e.preventDefault(),searchSpotify(searchQuery=actualSearch.value))}),screenBlock.click(function(){fadeOutSearch()});