/**
 * @module game/wave
 * Manages enemy waves.
 */

import wavesData from './data/waves.json' with { type: 'json' };
import { createEnemy } from './entities.js';
import * as state from './state.js';

let currentWaveIndex = -1;
let currentWave = null;
let spawnIndex = 0;
let spawnTimer = 0;
let isWaveActive = false;

/**
 * Initializes the wave manager.
 */
export function initWaves() {
    currentWaveIndex = -1;
    isWaveActive = false;
}

/**
 * Starts the next wave.
 * @returns {boolean} True if the next wave was started, false if there are no more waves.
 */
export function startNextWave() {
    if (isWaveActive) {
        console.warn("Cannot start a new wave while one is already active.");
        return false;
    }

    const nextWaveIndex = currentWaveIndex + 1;
    if (nextWaveIndex >= wavesData.length) {
        console.log("All waves completed!");
        return false;
    }

    currentWaveIndex = nextWaveIndex;
    currentWave = wavesData[currentWaveIndex];
    spawnIndex = 0;
    spawnTimer = 0;
    isWaveActive = true;

    console.log(`Starting Wave ${currentWave.wave}`);
    return true;
}

/**
 * Updates the wave manager, spawning enemies as needed.
 * @param {number} dt Delta time in seconds.
 */
export function updateWaves(dt) {
    if (!isWaveActive || !currentWave) {
        return;
    }

    spawnTimer += dt;

    if (spawnIndex < currentWave.spawns.length) {
        const nextSpawn = currentWave.spawns[spawnIndex];
        if (spawnTimer >= nextSpawn.delay) {
            createEnemy(nextSpawn.enemyId);
            spawnTimer = 0; // Reset timer for the next spawn
            spawnIndex++;
        }
    } else {
        // Wave is finished spawning, need to check if all enemies are gone
        // For now, we'll just mark it as inactive.
        // A more robust check for wave completion will be added later.
        isWaveActive = false;
        console.log(`Wave ${currentWave.wave} finished spawning.`);
    }
}

/**
 * Checks if a wave is currently active.
 * @returns {boolean}
 */
export function isWaveInProgress() {
    return isWaveActive;
}
