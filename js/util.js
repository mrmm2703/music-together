// UTILITY FUNCTIONS

// Convert milliseconds into seconds
function msToMinutesSeconds(ms) {
    let seconds = ms / 1000
    let min = Math.floor(ms / 60)
    let sec = Math.floor(seconds - min)
    return min.toString() + ":" + sec.toString().padStart(2, "0")
}