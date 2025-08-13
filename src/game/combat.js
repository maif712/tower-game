/**
 * @module game/combat
 * Handles combat calculations, damage, and entity death.
 */

import * as ecs from '../engine/ecs.js';
import { addCurrency } from './state.js';

/**
 * Applies damage to a target entity.
 * @param {number} targetId The ID of the entity to damage.
 * @param {number} damage The amount of damage to deal.
 */
export function dealDamage(targetId, damage) {
    const health = ecs.getComponent(targetId, 'health');
    if (!health) return; // Target might already be dead

    health.current -= damage;

    if (health.current <= 0) {
        // Handle death
        const value = ecs.getComponent(targetId, 'value');
        if (value && value.currency) {
            addCurrency(value.currency);
            console.log(`Awarded ${value.currency} currency. Total: ${addCurrency(0)}`);
        }

        ecs.destroyEntity(targetId);
        console.log(`Entity ${targetId} destroyed.`);
    }
}
