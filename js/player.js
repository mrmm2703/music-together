// Some HTML elements
const message_input = document.getElementById("messages-input")

// Connect to Node.js server
var socket = io.connect("https://morahman.me:3000")

// Send a joinedGroup message to the Node.js server
$(document).ready(function() {
    socket.emit("joinedGroup",
    {
        group: group_id,
        name: user_name,
        prof_pic: user_prof_pic,
        id: user_id
    })
})

// SERVER EVENT LISTENERS

// Event handler when received usersInGroup message
socket.on("usersInGroup", (data) => {
    console.log("usersInGroup:")
    for (const user in data["users"]) {
        console.log(user)
        addUser(user, data["users"][user]["name"], data["users"][user]["prof_pic"])
    }
})

// When a new user joins
socket.on("newUser", (data) => {
    console.log("newUser: " + data)
    addUser(data.id, data.name, data.prof_pic)
})

// When a user leaves
socket.on("userLeft", (data) => {
    console.log("userLeft: " + data)
    removeUser(data)
})

// When client sends a banned word
socket.on("messageBanned", (word) => {
    alert(`The message you sent is banned for containing the word "${word}"`)
})

// When a new message is received
socket.on("newMessage", (data) => {
    addMessage(data.id, data.message, false)
})

// CLIENT EVENT LISTENERS

// When a user presses a key in the message input
document.getElementById("messages-input").addEventListener("keyup", function(e) {
    console.log("PRESS")
    // When enter key is pressed
    if (e.keyCode === 13) {
        e.preventDefault()
        socket.emit("message", message_input.value)
        message_input.value = ""
    } else { // When any other is pressed
        socket.emit("typing")
    }
})