"use strict";var changeNicknameBtn=$("#change-nickname"),changeProfPicBtn=$("#change-pic"),resetProfPicBtn=$("#reset-pic"),resetAccountBtn=$("#reset-btn"),logoutBtn=$("#logout"),nicknameInput=$("#nickname-input"),fileInput=$("#fileUpload"),fileForm=$("#imgUpload"),bigName=$("#nickname"),smallName=$("#orig-name"),profImages=$(".prof-pic");changeNicknameBtn.click(function(){var e=nicknameInput.val().trim();0!=e.length?$.ajax({url:"api/changeNickname.php?access_token=".concat(accessToken,"&nickname=").concat(e),method:"GET",success:function(){bigName.text(e),smallName.text("("+origName+")"),window.top.postMessage("changeNickname-"+e,"*")},error:function(e){console.error(e),alert("Could not change nickname")}}):alert("Nickname cannot be empty!")}),changeProfPicBtn.click(function(){document.getElementById("fileUpload").click()}),fileForm.on("submit",function(e){e.preventDefault();var n=new FormData(this);$.ajax({url:"api/uploadImg.php",method:"POST",data:n,processData:!1,contentType:!1,success:function(e){console.log(e),profImages.attr("src",e+"?"+(new Date).getTime()),window.top.postMessage("newProfPic-"+e+"?"+(new Date).getTime(),"*")},error:function(e){console.error(e),"Invalid file type"==e?alert("Invalid file type"):"Server error"==e?alert("Server error occured"):"Too large"==e?alert("File is too large"):alert("Unknown error")}})}),fileInput.change(function(e){console.log(fileInput.val()),""!=fileInput.val()&&fileForm.submit()}),resetProfPicBtn.click(function(){$.ajax({url:"api/resetProfPic.php?access_token=".concat(accessToken),method:"GET",success:function(e){profImages.attr("src",e+"?"+(new Date).getTime()),window.top.postMessage("newProfPic-"+e+"?"+(new Date).getTime(),"*")},error:function(e){console.error(e),alert("Could not reset image")}})}),resetAccountBtn.click(function(){$.ajax({url:"api/resetAccount.php?access_token=".concat(accessToken),method:"GET",success:function(e){window.top.postMessage("resetAccount","*"),window.top.postMessage("newProfPic-"+e,"*")},error:function(e){console.error(e),alert("Could not reset image")}})}),logoutBtn.click(function(){window.top.postMessage("logout","*")});