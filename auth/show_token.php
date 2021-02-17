<?php
echo "Server initiated.<br><br>Authorisation code:</br>";
echo $_GET["code"]
?>  
<html>

<script src="../js/socket.io.js"></script>
<script>

var socket = io.connect("https://morahman.me:3000")
socket.emit("auth_code", "<?php echo $_GET["code"] ?>")

</script>
</html>


