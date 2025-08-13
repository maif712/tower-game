import { initRenderer, drawCircle, drawTriangle, drawLine, drawRect, drawSquare, drawHexagon } from './engine/renderer.js';
import { updateTime, getDeltaTime } from './engine/time.js';
import * as ecs from './engine/ecs.js';
import { getGameState, decreaseLives, spendCurrency, setSelectedHero, getSelectedHero, setWinState, setSelectedEntity, getSelectedEntity } from './game/state.js';
import { loadMap, drawMap, getWaypoints, isPlaceable } from './game/map.js';
import { initWaves, updateWaves, startNextWave, isWaveSpawning, isLastWave } from './game/wave.js';
import { initInput, getMousePosition, consumeClick } from './engine/input.js';
import { createHero, upgradeHero } from './game/entities.js';
import { dealDamage } from './game/combat.js';
import { initHUD, updateHUD, showStartWaveButton, hideStartWaveButton } from './game/ui/hud.js';
import { initShop } from './game/ui/shop.js';
import { initOverlays, showWinOverlay, showGameOverOverlay } from './game/ui/overlays.js';
import { initPanels, showInspector, hideInspector } from './game/ui/panels.js';
import heroesData from './game/data/heroes.json' with { type: 'json' };

console.log("Game starting...");

let waitingForNextWave = true;

// --- Systems ---

function handleClicks() {
    if (!consumeClick()) return;

    const mousePos = getMousePosition();

    // 1. Check if a hero was clicked
    const heroes = ecs.getEntitiesWithComponents('hero', 'position', 'renderable');
    let heroClicked = false;
    for (const heroId of heroes) {
        const heroPos = ecs.getComponent(heroId, 'position');
        const renderable = ecs.getComponent(heroId, 'renderable');
        const clickRadius = (renderable.size || renderable.radius || 15);
        const distanceSq = (mousePos.x - heroPos.x)**2 + (mousePos.y - heroPos.y)**2;

        if (distanceSq < clickRadius * clickRadius) {
            setSelectedEntity(heroId);
            showInspector(heroId);
            // In shop.js, we should add logic to deselect cards when an entity is selected
            heroClicked = true;
            break;
        }
    }

    if (heroClicked) return;

    // 2. If no hero was clicked, it's a click on the map.
    hideInspector();
    setSelectedEntity(null);

    // 3. Check if we should place a hero
    const selectedHeroId = getSelectedHero();
    if (!selectedHeroId) return;

    const heroData = heroesData.find(h => h.id === selectedHeroId);
    if (!heroData) return;

    if (isPlaceable(mousePos.x, mousePos.y)) {
        if (spendCurrency(heroData.base.cost)) {
            createHero(selectedHeroId, mousePos.x, mousePos.y);
        } else {
            console.log("Not enough currency!");
        }
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
            let minDistance = hero.range * hero.range;
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
                const visualId = ecs.createEntity();
                ecs.addComponent(visualId, 'attack_visual', { from: heroPos, to: enemyPos, duration: 0.1 });
            }
        }
    }
}

function visualsSystem(dt) {
    const visuals = ecs.getEntitiesWithComponents('attack_visual');
    for (const visualId of visuals) {
        const visual = ecs.getComponent(visualId, 'attack_visual');
        visual.duration -= dt;
        if (visual.duration <= 0) ecs.destroyEntity(visualId);
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

function handleWaveControl() {
    if (waitingForNextWave) return;

    if (!isWaveSpawning() && ecs.getEntitiesWithComponents('enemy').length === 0) {
        if (isLastWave()) {
            setWinState();
        } else {
            waitingForNextWave = true;
            showStartWaveButton(triggerNextWave);
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
        } else if (renderable.shape === 'square') {
            drawSquare(pos.x, pos.y, renderable.size, renderable.color);
        } else if (renderable.shape === 'hexagon') {
            drawHexagon(pos.x, pos.y, renderable.size, renderable.color);
        }
        const health = ecs.getComponent(entityId, 'health');
        if (health) {
            const healthBarWidth = 30;
            const healthBarHeight = 5;
            const yOffset = (renderable.radius || renderable.size / 2 || 10) + 10;
            const healthPercentage = health.current / health.max;
            drawRect(pos.x - healthBarWidth / 2, pos.y - yOffset, healthBarWidth, healthBarHeight, '#555');
            drawRect(pos.x - healthBarWidth / 2, pos.y - yOffset, healthBarWidth * healthPercentage, healthBarHeight, '#0f0');
        }

        // Draw level indicator if the entity is a hero and has a level
        const hero = ecs.getComponent(entityId, 'hero');
        if (hero && hero.level > 0) {
            const levelIndicatorYOffset = (renderable.radius || renderable.size / 2 || 10) + 5;
            const indicatorRadius = 3;
            const indicatorSpacing = 8;
            const totalWidth = (hero.level - 1) * indicatorSpacing;
            const startX = pos.x - totalWidth / 2;

            for (let i = 0; i < hero.level; i++) {
                drawCircle(startX + i * indicatorSpacing, pos.y + levelIndicatorYOffset, indicatorRadius, '#ffd700');
            }
        }
    }
    const visuals = ecs.getEntitiesWithComponents('attack_visual');
    for (const visualId of visuals) {
        const visual = ecs.getComponent(visualId, 'attack_visual');
        drawLine(visual.from.x, visual.from.y, visual.to.x, visual.to.y, '#fff', 2);
    }
}

// --- Game Loop ---
function triggerNextWave() {
    waitingForNextWave = false;
    startNextWave();
    hideStartWaveButton();
}

function gameLoop(timestamp) {
    updateTime(timestamp);
    const dt = getDeltaTime();
    const state = getGameState();

    if (state.isGameWon) {
        showWinOverlay();
        return;
    }
    if (state.isGameOver) {
        showGameOverOverlay();
        return;
    }

    if (!state.isPaused) {
        update(dt);
    }

    render();
    requestAnimationFrame(gameLoop);
}

function update(dt) {
    handleClicks();
    handleWaveControl();

    if (!waitingForNextWave) {
        pathfindingSystem(dt);
        targetingSystem(dt);
        visualsSystem(dt);
        updateWaves(dt);
    }
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
    initOverlays();
    initPanels();
    initWaves();

    await loadMap('simple_loop');

    showStartWaveButton(triggerNextWave);

    requestAnimationFrame(gameLoop);
}

window.addEventListener('load', init);
