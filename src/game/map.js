/**
 * @module game/map
 * Manages loading and rendering the game map and path.
 */

import mapsData from './data/maps.json';
import { getContext } from '../engine/renderer.js';

let currentMap = null;

/**
 * Loads a map by its ID.
 * @param {string} mapId The ID of the map to load.
 * @returns {boolean} True if the map was loaded successfully, false otherwise.
 */
export async function loadMap(mapId) {
    // In a real scenario, we might fetch this. For now, we import it directly.
    const mapData = mapsData.find(m => m.id === mapId);
    if (!mapData) {
        console.error(`Map with ID "${mapId}" not found.`);
        return false;
    }
    currentMap = mapData;
    // Here you could pre-calculate path lengths, etc.
    console.log(`Map "${currentMap.name}" loaded.`);
    return true;
}

/**
 * Draws the current map, including its path.
 */
export function drawMap() {
    if (!currentMap) return;

    const ctx = getContext();
    const canvas = ctx.canvas;

    // Set canvas size to map dimensions (or scale it)
    // For now, let's assume they match the initial canvas size
    canvas.width = currentMap.width;
    canvas.height = currentMap.height;

    // Draw background
    ctx.fillStyle = currentMap.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the path
    if (currentMap.waypoints && currentMap.waypoints.length > 1) {
        ctx.strokeStyle = currentMap.pathColor;
        ctx.lineWidth = 40; // The width of the path
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(currentMap.waypoints[0].x, currentMap.waypoints[0].y);
        for (let i = 1; i < currentMap.waypoints.length; i++) {
            ctx.lineTo(currentMap.waypoints[i].x, currentMap.waypoints[i].y);
        }
        ctx.stroke();
    }
}

/**
 * Gets the waypoints for the current map.
 * @returns {Array<object> | null} An array of waypoint objects ({x, y}), or null if no map is loaded.
 */
export function getWaypoints() {
    return currentMap ? currentMap.waypoints : null;
}

/**
 * Gets the starting position for enemies.
 * @returns {object | null} The first waypoint {x, y}, or null.
 */
export function getStartPosition() {
    if (currentMap && currentMap.waypoints && currentMap.waypoints.length > 0) {
        return currentMap.waypoints[0];
    }
    return null;
}

/**
 * Checks if a tower can be placed at the given world coordinates.
 * @param {number} x The world x-coordinate.
 * @param {number} y The world y-coordinate.
 * @returns {boolean} True if the location is valid for placement.
 */
export function isPlaceable(x, y) {
    if (!currentMap || !currentMap.towerPlacement) {
        return false;
    }

    const { tileSize, grid } = currentMap.towerPlacement;
    const gridX = Math.floor(x / tileSize);
    const gridY = Math.floor(y / tileSize);

    if (gridY < 0 || gridY >= grid.length || gridX < 0 || gridX >= grid[0].length) {
        return false; // Out of bounds
    }

    return grid[gridY][gridX] === '1';
}
