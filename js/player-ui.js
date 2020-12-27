// Get reference to HTML elements
const users_container = $(".group-users-container")
const messages_container = $(".messages-container")

// Add a user to the My Group panel
function addUser(id, name, prof_pic) {
    users_container.append("" + 
    "<div id='group-user-" + id + "' class='group-user-container'>" + 
        "<div class='group-user-image'>" +
            "<img src='" + prof_pic + "'>" +
        "</div>" +
        "<div class='group-user-text-container'>" +
            "<div class='group-user-text-name'>" +
                name + 
                "</div>" + 
            "<div class='group-user-text-typing'>" +
                "typing..." +
            "</div>" +
        "</div>" +
    "</div>" +
    "")
}

// Remove a user from the My Group panel
function removeUser(id) {
    $("#group-user-" + id).remove()
}

// Add a chat to the Messages panel
function addMessage(id, message, emphasise=false) {
    // Check if the message is from the current user or other user
    let person = "other"
    if (id == user_id) {
        person = "me"
    }

    // Get the time in a pretty format
    let now = new Date()
    let time = now.getHours() + ":" + now.getMinutes()

    // Get the name from the My Group panel
    let name = $("#group-user-"+id+" .group-user-text-name").text()

    if (!emphasise) {
        messages_container.append("" +
        '<div class="message ' + person + ' message-' + id + '">' +
            '<div class="message-name">' +
                name +
            '</div>'+
            '<div class="message-text">' +
                message +
            '</div>' +
            '<div class="message-time">' +
                time +
            '</div>' +
        '</div>'
        )
    } else {
        messages_container.append("" +
        '<div class="message ' + person + ' message-' + id + '">' +
            '<div class="message-name">' +
                name +
            '</div>'+
            '<div class="message-text">' +
                "<em>" + message + "</em>" + 
            '</div>' +
            '<div class="message-time">' +
                time +
            '</div>' +
        '</div>'
        )
    }
}