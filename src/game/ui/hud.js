/**
 * @module game/ui/hud
 * Manages the Heads-Up Display (lives, currency, etc.).
 */

import { getGameState } from '../state.js';

let uiContainer = null;
let livesDisplay = null;
let currencyDisplay = null;
let waveDisplay = null; // Will add later

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

    hudElement.appendChild(livesDisplay);
    hudElement.appendChild(currencyDisplay);
    uiContainer.appendChild(hudElement);

    updateHUD(); // Initial update
}

/**
 * Updates the HUD with the latest game state.
 */
export function updateHUD() {
    if (!livesDisplay || !currencyDisplay) return;

    const state = getGameState();

    // Using innerHTML to easily include icons/symbols
    livesDisplay.innerHTML = `❤️ <span class="hud-value">${state.lives}</span>`;
    currencyDisplay.innerHTML = `💰 <span class="hud-value">${state.currency}</span>`;
}
