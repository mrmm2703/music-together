// UTILITY FUNCTIONS

// Convert milliseconds into seconds
function msToMinutesSeconds(ms) {
    let min = Math.floor(ms / 60000)
    let sec = ((ms % 60000) / 1000).toFixed(0)
    return min + ":" + (sec < 10 ? "0" : "") + sec
}