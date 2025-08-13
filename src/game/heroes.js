/**
 * @module game/heroes
 * Contains logic related to hero actions, like upgrading.
 */

import * as ecs from '../engine/ecs.js';
import heroesData from './data/heroes.json' with { type: 'json' };
import { spendCurrency } from './state.js';

/**
 * Attempts to upgrade a hero entity.
 * @param {number} entityId The entity ID of the hero to upgrade.
 * @returns {boolean} True if the upgrade was successful, false otherwise.
 */
export function upgradeHero(entityId) {
    const hero = ecs.getComponent(entityId, 'hero');
    if (!hero) {
        console.error(`Entity ${entityId} is not a hero or has no hero component.`);
        return false;
    }

    const heroData = heroesData.find(h => h.id === hero.id);
    if (!heroData) {
        console.error(`Could not find hero data for ${hero.id}`);
        return false;
    }

    const currentLevel = hero.level || 0;
    if (currentLevel >= 3) {
        console.log("Hero is already at max level.");
        return false;
    }

    const nextLevelData = heroData.levels[currentLevel];
    if (!nextLevelData) {
        console.error(`No upgrade data found for level ${currentLevel + 1}`);
        return false;
    }

    if (spendCurrency(nextLevelData.cost)) {
        // Apply stat boosts
        for (const stat in nextLevelData.stats) {
            if (hero.hasOwnProperty(stat)) {
                hero[stat] += nextLevelData.stats[stat];
                console.log(`Upgraded ${stat} by ${nextLevelData.stats[stat]}. New value: ${hero[stat]}`);
            }
        }

        // Increment level
        hero.level = currentLevel + 1;
        console.log(`Hero ${hero.id} upgraded to level ${hero.level}`);
        return true;
    } else {
        console.log("Not enough currency to upgrade.");
        return false;
    }
}
