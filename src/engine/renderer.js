/**
 * @module engine/renderer
 * Manages the HTML5 Canvas and provides drawing functions.
 */

let canvas = null;
let context = null;

/**
 * Initializes the renderer.
 * @param {HTMLCanvasElement} canvasElement - The canvas element to draw on.
 */
export function initRenderer(canvasElement) {
    canvas = canvasElement;
    context = canvas.getContext('2d');

    if (!context) {
        throw new Error('2D context not supported or canvas not found.');
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

/**
 * Resizes the canvas to fill the window.
 */
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/**
 * Clears the entire canvas.
 */
export function clear() {
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Returns the canvas context.
 * @returns {CanvasRenderingContext2D}
 */
export function getContext() {
    return context;
}

/**
 * Returns the canvas element.
 * @returns {HTMLCanvasElement}
 */
export function getCanvas() {
    return canvas;
}

/**
 * Draws a rectangle.
 * @param {number} x - The x-coordinate of the top-left corner.
 * @param {number} y - The y-coordinate of the top-left corner.
 * @param {number} width - The width of the rectangle.
 * @param {number} height - The height of the rectangle.
 * @param {string} color - The fill color of the rectangle.
 */
export function drawRect(x, y, width, height, color) {
    if (!context) return;
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
}

/**
 * Draws a circle.
 * @param {number} x - The x-coordinate of the center.
 * @param {number} y - The y-coordinate of the center.
 * @param {number} radius - The radius of the circle.
 * @param {string} color - The fill color of the circle.
 */
export function drawCircle(x, y, radius, color) {
    if (!context) return;
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
}

/**
 * Draws an equilateral triangle.
 * @param {number} x - The x-coordinate of the center.
 * @param {number} y - The y-coordinate of the center.
 * @param {number} size - The side length of the triangle.
 * @param {string} color - The fill color of the triangle.
 */
export function drawTriangle(x, y, size, color) {
    if (!context) return;
    const h = size * (Math.sqrt(3) / 2); // Height of equilateral triangle

    context.fillStyle = color;
    context.beginPath();
    context.moveTo(x, y - h / 2); // Top vertex
    context.lineTo(x - size / 2, y + h / 2); // Bottom left vertex
    context.lineTo(x + size / 2, y + h / 2); // Bottom right vertex
    context.closePath();
    context.fill();
}

/**
 * Draws a line between two points.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {string} color
 * @param {number} width
 */
export function drawLine(x1, y1, x2, y2, color, width) {
    if (!context) return;
    context.strokeStyle = color;
    context.lineWidth = width;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

/**
 * Draws a square centered at a point.
 * @param {number} x - The x-coordinate of the center.
 * @param {number} y - The y-coordinate of the center.
 * @param {number} size - The side length of the square.
 * @param {string} color - The fill color.
 */
export function drawSquare(x, y, size, color) {
    drawRect(x - size / 2, y - size / 2, size, size, color);
}

/**
 * Draws a regular hexagon centered at a point.
 * @param {number} x - The x-coordinate of the center.
 * @param {number} y - The y-coordinate of the center.
 * @param {number} size - The radius (distance from center to vertex).
 * @param {string} color - The fill color.
 */
export function drawHexagon(x, y, size, color) {
    if (!context) return;
    context.fillStyle = color;
    context.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i + Math.PI / 6; // Add offset to make it flat-topped
        const vertexX = x + size * Math.cos(angle);
        const vertexY = y + size * Math.sin(angle);
        if (i === 0) {
            context.moveTo(vertexX, vertexY);
        } else {
            context.lineTo(vertexX, vertexY);
        }
    }
    context.closePath();
    context.fill();
}
