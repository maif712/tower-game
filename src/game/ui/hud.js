/**
 * @module game/ui/hud
 * Manages the Heads-Up Display (lives, currency, etc.).
 */

import { getGameState } from '../state.js';
import { getCurrentWaveNumber } from '../wave.js';

let uiContainer = null;
let livesDisplay = null;
let currencyDisplay = null;
let waveDisplay = null;
let startWaveButton = null;

/**
 * Creates and injects the HUD into the DOM.
 */
export function initHUD() {
    uiContainer = document.getElementById('ui-container');
    if (!uiContainer) {
        console.error("UI container not found!");
        return;
    }

    const hudElement = document.createElement('div');
    hudElement.id = 'hud';

    livesDisplay = document.createElement('div');
    livesDisplay.id = 'hud-lives';
    livesDisplay.className = 'hud-item';

    currencyDisplay = document.createElement('div');
    currencyDisplay.id = 'hud-currency';
    currencyDisplay.className = 'hud-item';

    waveDisplay = document.createElement('div');
    waveDisplay.id = 'hud-wave';
    waveDisplay.className = 'hud-item';

    hudElement.appendChild(livesDisplay);
    hudElement.appendChild(currencyDisplay);
    hudElement.appendChild(waveDisplay);
    uiContainer.appendChild(hudElement);

    // Create the start wave button, but don't add it yet
    startWaveButton = document.createElement('button');
    startWaveButton.id = 'start-wave-btn';
    startWaveButton.textContent = 'Start Wave';

    updateHUD(); // Initial update
}

/**
 * Updates the HUD with the latest game state.
 */
export function updateHUD() {
    if (!livesDisplay || !currencyDisplay || !waveDisplay) return;

    const state = getGameState();

    livesDisplay.innerHTML = `❤️ <span class="hud-value">${state.lives}</span>`;
    currencyDisplay.innerHTML = `💰 <span class="hud-value">${state.currency}</span>`;
    waveDisplay.innerHTML = `🌊 <span class="hud-value">${getCurrentWaveNumber()}</span>`;
}

export function showStartWaveButton(callback) {
    if (!startWaveButton || !uiContainer) return;
    startWaveButton.onclick = callback; // Assign the callback
    uiContainer.appendChild(startWaveButton);
}

export function hideStartWaveButton() {
    if (startWaveButton && startWaveButton.parentElement) {
        startWaveButton.parentElement.removeChild(startWaveButton);
    }
}
