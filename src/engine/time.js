/**
 * @module engine/time
 * Manages time-related functionalities like delta time.
 */

let lastTime = 0;
let deltaTime = 0;

/**
 * Updates the time module. Should be called once per frame.
 * @param {number} timestamp - The current timestamp from requestAnimationFrame.
 */
export function updateTime(timestamp) {
    if (lastTime === 0) {
        lastTime = timestamp;
    }
    deltaTime = (timestamp - lastTime) / 1000; // Delta time in seconds
    lastTime = timestamp;
}

/**
 * Gets the delta time since the last frame.
 * @returns {number} The delta time in seconds.
 */
export function getDeltaTime() {
    return deltaTime;
}
