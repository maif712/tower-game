/**
 * @module game/state
 * Manages the global game state.
 */

const gameState = {
    lives: 20,
    currency: 100,
    wave: 0,
    isPaused: false,
    isGameOver: false,
    isGameWon: false,
    gameSpeed: 1,
    selectedHeroId: null, // For building
    selectedEntityId: null, // For inspecting
};

/**
 * Returns a copy of the current game state.
 * @returns {object} The current game state.
 */
export function getGameState() {
    return { ...gameState };
}

/**
 * Decreases player lives by a certain amount.
 * @param {number} amount The number of lives to lose.
 */
export function decreaseLives(amount = 1) {
    if (gameState.isGameOver) return;
    gameState.lives -= amount;
    if (gameState.lives <= 0) {
        gameState.lives = 0;
        gameState.isGameOver = true;
        console.log("Game Over!");
    }
}

/**
 * Increases player currency by a certain amount.
 * @param {number} amount The amount of currency to add.
 */
export function addCurrency(amount) {
    if (gameState.isGameOver) return;
    gameState.currency += amount;
}

/**
 * Decreases player currency by a certain amount.
 * @param {number} amount The amount of currency to spend.
 * @returns {boolean} True if the purchase was successful, false otherwise.
 */
export function spendCurrency(amount) {
    if (gameState.currency >= amount) {
        gameState.currency -= amount;
        return true;
    }
    return false;
}

/**
 * Toggles the pause state of the game.
 */
export function togglePause() {
    gameState.isPaused = !gameState.isPaused;
}

/**
 * Resets the game state to its initial values.
 */
/**
 * Sets the currently selected hero for placement.
 * @param {string | null} heroId The ID of the hero to select, or null to deselect.
 */
export function setSelectedHero(heroId) {
    gameState.selectedHeroId = heroId;
    if (heroId !== null) {
        gameState.selectedEntityId = null; // Deselect entity when selecting from shop
    }
    console.log(`Hero selected for building: ${heroId}`);
}

/**
 * Gets the ID of the currently selected hero.
 * @returns {string | null}
 */
export function getSelectedHero() {
    return gameState.selectedHeroId;
}


export function setWinState() {
    gameState.isGameWon = true;
    console.log("Player has won the game!");
}

/**
 * Sets the currently selected entity for inspection.
 * @param {number | null} entityId The ID of the entity to select, or null to deselect.
 */
export function setSelectedEntity(entityId) {
    gameState.selectedEntityId = entityId;
    if (entityId !== null) {
        gameState.selectedHeroId = null; // Deselect from shop when selecting entity
    }
    console.log(`Entity selected for inspection: ${entityId}`);
}

/**
 * Gets the ID of the currently selected entity.
 * @returns {number | null}
 */
export function getSelectedEntity() {
    return gameState.selectedEntityId;
}

export function resetState() {
    gameState.lives = 20;
    gameState.currency = 100;
    gameState.wave = 0;
    gameState.isPaused = false;
    gameState.isGameOver = false;
    gameState.isGameWon = false;
    gameState.gameSpeed = 1;
    gameState.selectedHeroId = null;
    gameState.selectedEntityId = null;
}
