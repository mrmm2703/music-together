"use strict";var d,muteBtn=$("#mute-btn"),groupIdInput=document.getElementById("group-id-entry");function checkGroupExists(t){if(t=t.trim(),isNaN(t))throw"Invalid";if(4!=t.length)throw"Group ID must be 4 characters";try{t=parseInt(t,10)}catch(t){throw"Invalid"}if(t<0)throw"Invalid";var e=null;return $.ajax({url:"api/checkGroupExists.php?access_token="+accessToken+"&group_id="+t,type:"get",dataType:"html",async:!1,success:function(t){e=t}}),"EXISTS"==e||"DOES NOT EXIST"!=d&&void 0}function joinBtn(){try{1==checkGroupExists(groupIdInput.value)?window.location.href="player.php?action=join&group_id="+groupIdInput.value:alert("Group does not exist.")}catch(t){"Invalid"==t?alert("Invalid Group ID entered."):"GET request error"==t?alert("An internal error occured. Error: GET_REQUEST_ERROR"):"Group ID must be 4 characters"==t?alert(t):alert("An unknown error occured. Error: "+t),groupIdInput.value=""}}function createBtn(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:null,a=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null;$.ajax({url:"api/createGroupID.php?access_token="+accessToken,type:"get",dataType:"html",success:function(t){window.location.href=null==e?"player.php?action=create&group_id="+t:"player.php?action=create&group_id="+t+"&startSong=spotify:track:"+e+"&startContext="+a}})}$.ajaxSetup({cache:!1}),$(document).ready(function(){for(var t=document.getElementsByClassName("preview-sound"),e=0;e<t.length;e++)t[e].volume=0;dashboardMuted?muteBtn.css("background-image",'url("https://morahman.me/musictogether/img/muted.png'):muteBtn.css("background-image",'url("https://morahman.me/musictogether/img/unmuted.png')}),muteBtn.click(function(){dashboardMuted?muteBtn.css("background-image",'url("https://morahman.me/musictogether/img/unmuted.png'):muteBtn.css("background-image",'url("https://morahman.me/musictogether/img/muted.png'),dashboardMuted=!dashboardMuted,$.get("api/updateDashboardMuted.php",{access_token:accessToken,muted:dashboardMuted})}),$(".song-cover").hover(function(){dashboardMuted||(document.getElementById(this.id+"-audio").play(),$("#"+this.id+"-audio").stop(!0,!1),$("#"+this.id+"-audio").animate({volume:.25},500))},function(){var t;dashboardMuted||(t=document.getElementById(this.id+"-audio"),$("#"+this.id+"-audio").stop(!0,!1),$("#"+this.id+"-audio").animate({volume:0},500,function(){t.pause()}))}),$(".song-cover").click(function(){createBtn($(this).attr("id"),$(this).data("context"))}),"number"==typeof sess_val&&(groupIdInput.value=sess_val,joinBtn());