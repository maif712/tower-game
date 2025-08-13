/**
 * @module game/ui/panels
 * Manages UI panels like the hero inspector.
 */

import * as ecs from '../../engine/ecs.js';
import heroesData from '../data/heroes.json' with { type: 'json' };
import { upgradeHero } from '../heroes.js';
import { setSelectedEntity } from '../state.js';

let uiContainer = null;
let inspectorPanel = null;

export function initPanels() {
    uiContainer = document.getElementById('ui-container');
    if (!uiContainer) return;

    inspectorPanel = document.createElement('div');
    inspectorPanel.id = 'inspector-panel';
    inspectorPanel.style.display = 'none';
    uiContainer.appendChild(inspectorPanel);
}

export function hideInspector() {
    if (inspectorPanel) {
        inspectorPanel.style.display = 'none';
    }
}

export function showInspector(entityId) {
    if (!inspectorPanel) return;

    const hero = ecs.getComponent(entityId, 'hero');
    if (!hero) {
        hideInspector();
        return;
    }

    const heroData = heroesData.find(h => h.id === hero.id);
    const currentLevel = hero.level || 0;

    let upgradeInfo = '';
    if (currentLevel < 3) {
        const nextLevelData = heroData.levels[currentLevel];
        upgradeInfo = `
            <div class="upgrade-section">
                <h4>Next Upgrade (Lvl ${currentLevel + 1})</h4>
                <p>${nextLevelData.desc}</p>
                <button id="upgrade-btn">Upgrade (💰 ${nextLevelData.cost})</button>
            </div>
        `;
    } else {
        upgradeInfo = `<p>Max level reached.</p>`;
    }

    inspectorPanel.innerHTML = `
        <div class="panel-header">
            <h3>${heroData.name}</h3>
            <button id="close-inspector-btn">X</button>
        </div>
        <div class="panel-content">
            <p>Level: ${currentLevel}</p>
            <p>Damage: ${hero.damage.toFixed(1)}</p>
            <p>Range: ${hero.range.toFixed(0)}</p>
            <p>Rate: ${hero.rate.toFixed(2)}/s</p>
            ${upgradeInfo}
        </div>
    `;

    inspectorPanel.style.display = 'block';

    // Add event listeners
    document.getElementById('close-inspector-btn').onclick = () => {
        hideInspector();
        setSelectedEntity(null);
    };

    if (currentLevel < 3) {
        const upgradeBtn = document.getElementById('upgrade-btn');
        upgradeBtn.onclick = () => {
            if (upgradeHero(entityId)) {
                // Refresh the panel if upgrade was successful
                showInspector(entityId);
            }
        };
    }
}
