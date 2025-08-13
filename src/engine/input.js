/**
 * @module engine/input
 * Handles mouse and keyboard input.
 */

const mouse = {
    x: 0,
    y: 0,
    isDown: false,
    isClicked: false,
};

let canvas = null;

/**
 * Initializes the input manager.
 * @param {HTMLCanvasElement} canvasElement The game canvas.
 */
export function initInput(canvasElement) {
    canvas = canvasElement;

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
}

function onMouseDown(event) {
    mouse.isDown = true;
}

function onMouseUp(event) {
    mouse.isDown = false;
    // Set a flag that a click happened on this frame
    mouse.isClicked = true;
}

/**
 * Returns the current mouse position.
 * @returns {{x: number, y: number}}
 */
export function getMousePosition() {
    return { x: mouse.x, y: mouse.y };
}

/**
 * Checks if a click occurred in the current frame.
 * This is consumed (reset) after being read.
 * @returns {boolean}
 */
export function consumeClick() {
    const clicked = mouse.isClicked;
    mouse.isClicked = false;
    return clicked;
}

// We can add keyboard handlers here later if needed.
// export function isKeyDown(key) { ... }
