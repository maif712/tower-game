/**
 * @module game/ui/shop
 * Manages the hero shop UI.
 */

import heroesData from '../data/heroes.json' with { type: 'json' };
import { setSelectedHero } from '../state.js';

let uiContainer = null;
let shopPanel = null;

/**
 * Creates and injects the Shop UI into the DOM.
 */
export function initShop() {
    uiContainer = document.getElementById('ui-container');
    if (!uiContainer) {
        console.error("UI container not found!");
        return;
    }

    shopPanel = document.createElement('div');
    shopPanel.id = 'shop-panel';

    heroesData.forEach(hero => {
        const card = createHeroCard(hero);
        shopPanel.appendChild(card);
    });

    uiContainer.appendChild(shopPanel);
}

function createHeroCard(heroData) {
    const card = document.createElement('div');
    card.className = 'hero-card';
    card.dataset.heroId = heroData.id;

    card.innerHTML = `
        <div class="card-name">${heroData.name}</div>
        <div class="card-cost">💰 ${heroData.base.cost || 'N/A'}</div>
    `; // Note: cost is not in the spec, I'll add it.

    card.addEventListener('click', () => {
        // Deselect all other cards
        const allCards = shopPanel.querySelectorAll('.hero-card');
        allCards.forEach(c => c.classList.remove('selected'));

        // Select this card
        card.classList.add('selected');
        setSelectedHero(heroData.id);
    });

    return card;
}
