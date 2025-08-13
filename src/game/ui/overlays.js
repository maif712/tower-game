/**
 * @module game/ui/overlays
 * Manages the "Game Over" and "You Win" UI overlays.
 */

let uiContainer = null;
let winOverlay = null;
let gameOverOverlay = null;

/**
 * Creates the overlay elements and adds them to the DOM, initially hidden.
 */
export function initOverlays() {
    uiContainer = document.getElementById('ui-container');
    if (!uiContainer) {
        console.error("UI container not found!");
        return;
    }

    // Win Overlay
    winOverlay = document.createElement('div');
    winOverlay.id = 'win-overlay';
    winOverlay.className = 'game-end-overlay';
    winOverlay.innerHTML = `
        <div class="overlay-content">
            <h2>You Win!</h2>
            <p>You have defeated all the waves.</p>
            <button onclick="window.location.reload()">Play Again</button>
        </div>
    `;
    uiContainer.appendChild(winOverlay);

    // Game Over Overlay
    gameOverOverlay = document.createElement('div');
    gameOverOverlay.id = 'game-over-overlay';
    gameOverOverlay.className = 'game-end-overlay';
    gameOverOverlay.innerHTML = `
        <div class="overlay-content">
            <h2>Game Over</h2>
            <p>The enemies have breached your defenses.</p>
            <button onclick="window.location.reload()">Try Again</button>
        </div>
    `;
    uiContainer.appendChild(gameOverOverlay);
}

/**
 * Shows the "You Win" screen.
 */
export function showWinOverlay() {
    if (winOverlay) {
        winOverlay.style.display = 'flex';
    }
}

/**
 * Shows the "Game Over" screen.
 */
export function showGameOverOverlay() {
    if (gameOverOverlay) {
        gameOverOverlay.style.display = 'flex';
    }
}
