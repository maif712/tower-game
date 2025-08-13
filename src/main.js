import { initRenderer, drawCircle, drawTriangle, drawLine } from './engine/renderer.js';
import { updateTime, getDeltaTime } from './engine/time.js';
import * as ecs from './engine/ecs.js';
import { getGameState, decreaseLives } from './game/state.js';
import { loadMap, drawMap, getWaypoints, isPlaceable } from './game/map.js';
import { initWaves, updateWaves, startNextWave } from './game/wave.js';
import { initInput, getMousePosition, consumeClick } from './engine/input.js';
import { createHero } from './game/entities.js';
import { dealDamage } from './game/combat.js';
import { initHUD, updateHUD } from './game/ui/hud.js';
import { initShop } from './game/ui/shop.js';
import { getSelectedHero, spendCurrency, setSelectedHero } from './game/state.js';
import heroesData from './game/data/heroes.json' with { type: 'json' };

console.log("Game starting...");

// --- Systems ---

function handlePlacement() {
    if (!consumeClick()) return;

    const selectedHeroId = getSelectedHero();
    if (!selectedHeroId) return;

    const mousePos = getMousePosition();
    const heroData = heroesData.find(h => h.id === selectedHeroId);

    if (!heroData) {
        console.error(`Data for selected hero ${selectedHeroId} not found.`);
        return;
    }

    if (isPlaceable(mousePos.x, mousePos.y)) {
        if (spendCurrency(heroData.base.cost)) {
            console.log(`Placing hero ${selectedHeroId} at ${mousePos.x}, ${mousePos.y}`);
            createHero(selectedHeroId, mousePos.x, mousePos.y);
            // Deselect after placement for better UX
            // This requires a bit more work in the UI to update the style
            // For now, we'll leave it selected.
            // setSelectedHero(null);
        } else {
            console.log("Not enough currency!");
            // Here we could flash the currency display red
        }
    } else {
        console.log("Cannot place hero here.");
    }
}

function targetingSystem(dt) {
    const heroes = ecs.getEntitiesWithComponents('hero', 'position');
    const enemies = ecs.getEntitiesWithComponents('targetable', 'position');

    for (const heroId of heroes) {
        const hero = ecs.getComponent(heroId, 'hero');
        const heroPos = ecs.getComponent(heroId, 'position');

        hero.attackCooldown -= dt;

        if (hero.attackCooldown <= 0) {
            let closestEnemy = null;
            let minDistance = hero.range * hero.range; // Use squared distance for efficiency

            for (const enemyId of enemies) {
                const enemyPos = ecs.getComponent(enemyId, 'position');
                const distanceSq = (heroPos.x - enemyPos.x)**2 + (heroPos.y - enemyPos.y)**2;

                if (distanceSq < minDistance) {
                    minDistance = distanceSq;
                    closestEnemy = enemyId;
                }
            }

            if (closestEnemy) {
                const enemyPos = ecs.getComponent(closestEnemy, 'position');
                dealDamage(closestEnemy, hero.damage);
                hero.attackCooldown = 1 / hero.rate;

                // Create a temporary entity for the attack visual
                const visualId = ecs.createEntity();
                ecs.addComponent(visualId, 'attack_visual', {
                    from: heroPos,
                    to: enemyPos,
                    duration: 0.1 // seconds
                });
            }
        }
    }
}

function visualsSystem(dt) {
    const visuals = ecs.getEntitiesWithComponents('attack_visual');
    for (const visualId of visuals) {
        const visual = ecs.getComponent(visualId, 'attack_visual');
        visual.duration -= dt;
        if (visual.duration <= 0) {
            ecs.destroyEntity(visualId);
        }
    }
}

function pathfindingSystem(dt) {
    const waypoints = getWaypoints();
    if (!waypoints) return;

    const entities = ecs.getEntitiesWithComponents('position', 'enemy');
    for (const entityId of entities) {
        const pos = ecs.getComponent(entityId, 'position');
        const enemy = ecs.getComponent(entityId, 'enemy');

        if (enemy.waypointIndex >= waypoints.length) {
            decreaseLives(1);
            ecs.destroyEntity(entityId);
            continue;
        }

        const targetWaypoint = waypoints[enemy.waypointIndex];
        const dirX = targetWaypoint.x - pos.x;
        const dirY = targetWaypoint.y - pos.y;
        const dist = Math.sqrt(dirX*dirX + dirY*dirY);

        if (dist < 5) {
            enemy.waypointIndex++;
        } else {
            pos.x += (dirX / dist) * enemy.speed * dt;
            pos.y += (dirY / dist) * enemy.speed * dt;
        }
    }
}

function renderSystem() {
    drawMap();

    const entities = ecs.getEntitiesWithComponents('position', 'renderable');
    for (const entityId of entities) {
        const pos = ecs.getComponent(entityId, 'position');
        const renderable = ecs.getComponent(entityId, 'renderable');

        if (renderable.shape === 'circle') {
            drawCircle(pos.x, pos.y, renderable.radius, renderable.color);
        } else if (renderable.shape === 'triangle') {
            drawTriangle(pos.x, pos.y, renderable.size, renderable.color);
        }
    }

    // Render attack visuals
    const visuals = ecs.getEntitiesWithComponents('attack_visual');
    for (const visualId of visuals) {
        const visual = ecs.getComponent(visualId, 'attack_visual');
        drawLine(visual.from.x, visual.from.y, visual.to.x, visual.to.y, '#fff', 2);
    }
}

// --- Game Loop ---
function gameLoop(timestamp) {
    updateTime(timestamp);
    const dt = getDeltaTime();
    const state = getGameState();

    if (!state.isPaused && !state.isGameOver) {
        update(dt);
    }

    render();
    requestAnimationFrame(gameLoop);
}

function update(dt) {
    handlePlacement();
    pathfindingSystem(dt);
    targetingSystem(dt);
    visualsSystem(dt);
    updateWaves(dt);
}

function render() {
    renderSystem();
    updateHUD();
}

async function init() {
    console.log("Initializing game...");
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error("Canvas not found!");
        return;
    }
    initRenderer(canvas);
    initInput(canvas);
    initHUD();
    initShop();

    await loadMap('simple_loop');
    initWaves();

    setTimeout(() => startNextWave(), 1000);

    requestAnimationFrame(gameLoop);
}

window.addEventListener('load', init);
