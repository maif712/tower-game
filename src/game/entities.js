/**
 * @module game/entities
 * Factory functions for creating game entities.
 */

import * as ecs from '../engine/ecs.js';
import enemiesData from './data/enemies.json' with { type: 'json' };
import heroesData from './data/heroes.json' with { type: 'json' };
import { getStartPosition } from './map.js';

/**
 * Creates an enemy entity based on its ID.
 * @param {string} enemyId The ID of the enemy to create (from enemies.json).
 * @returns {number | null} The entity ID if created successfully, otherwise null.
 */
export function createEnemy(enemyId) {
    const enemyData = enemiesData.find(e => e.id === enemyId);
    if (!enemyData) {
        console.error(`Enemy data not found for ID: ${enemyId}`);
        return null;
    }

    const startPosition = getStartPosition();
    if (!startPosition) {
        console.error('Cannot create enemy, no start position found on map.');
        return null;
    }

    const entity = ecs.createEntity();

    // Position component
    ecs.addComponent(entity, 'position', { ...startPosition });

    // Renderable component
    ecs.addComponent(entity, 'renderable', { ...enemyData.render });

    // Enemy component - for pathfinding and stats
    ecs.addComponent(entity, 'enemy', {
        speed: enemyData.speed,
        waypointIndex: 0,
    });

    // Health component
    ecs.addComponent(entity, 'health', {
        current: enemyData.health,
        max: enemyData.health,
    });

    // Targetable component (so towers can find it)
    ecs.addComponent(entity, 'targetable', {});

    // Value component
    ecs.addComponent(entity, 'value', {
        currency: enemyData.currency
    });


    console.log(`Created enemy ${enemyId} with entity ID ${entity}`);
    return entity;
}

/**
 * Creates a hero entity based on its ID.
 * @param {string} heroId The ID of the hero to create (from heroes.json).
 * @param {number} x The x-coordinate to place the hero.
 * @param {number} y The y-coordinate to place the hero.
 * @returns {number | null} The entity ID if created successfully, otherwise null.
 */
export function createHero(heroId, x, y) {
    const heroData = heroesData.find(h => h.id === heroId);
    if (!heroData) {
        console.error(`Hero data not found for ID: ${heroId}`);
        return null;
    }

    const entity = ecs.createEntity();

    // Position component
    ecs.addComponent(entity, 'position', { x, y });

    // Renderable component
    // For now, just use the base shape. We'll handle layers later.
    ecs.addComponent(entity, 'renderable', {
        shape: heroData.shape.base.type,
        size: heroData.shape.base.size,
        color: heroData.shape.base.color,
        // We'll need to update the renderer to handle triangles
    });

    // Hero component - for targeting, stats
    ecs.addComponent(entity, 'hero', {
        id: heroData.id,
        level: 0,
        ...heroData.base,
        attackCooldown: 0, // Ready to fire immediately
    });

    console.log(`Created hero ${heroId} with entity ID ${entity}`);
    return entity;
}
