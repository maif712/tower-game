/**
 * @module engine/ecs
 * A simple Entity-Component-System implementation.
 */

let nextEntityId = 0;
const entities = new Map();
const componentStores = new Map();

/**
 * Creates a new entity.
 * @returns {number} The ID of the new entity.
 */
export function createEntity() {
    const id = nextEntityId++;
    entities.set(id, new Map());
    return id;
}

/**
 * Destroys an entity and all its components.
 * @param {number} entityId The ID of the entity to destroy.
 */
export function destroyEntity(entityId) {
    if (!entities.has(entityId)) return;

    for (const componentName of entities.get(entityId).keys()) {
        const store = componentStores.get(componentName);
        if (store) {
            store.delete(entityId);
        }
    }
    entities.delete(entityId);
}

/**
 * Adds a component to an entity.
 * @param {number} entityId The entity's ID.
 * @param {string} componentName The name of the component (e.g., 'position').
 * @param {object} componentData The component's data.
 */
export function addComponent(entityId, componentName, componentData) {
    if (!entities.has(entityId)) {
        console.warn(`Entity ${entityId} does not exist. Cannot add component ${componentName}.`);
        return;
    }

    // Get or create the store for this component type
    if (!componentStores.has(componentName)) {
        componentStores.set(componentName, new Map());
    }
    const store = componentStores.get(componentName);
    store.set(entityId, componentData);

    // Register the component on the entity
    entities.get(entityId).set(componentName, componentData);
}

/**
 * Gets a component's data for an entity.
 * @param {number} entityId The entity's ID.
 * @param {string} componentName The name of the component.
 * @returns {object | undefined} The component's data, or undefined if not found.
 */
export function getComponent(entityId, componentName) {
    const entity = entities.get(entityId);
    return entity ? entity.get(componentName) : undefined;
}

/**
 * Removes a component from an entity.
 * @param {number} entityId The entity's ID.
 * @param {string} componentName The name of the component.
 */
export function removeComponent(entityId, componentName) {
    const entity = entities.get(entityId);
    if (entity) {
        entity.delete(componentName);
    }

    const store = componentStores.get(componentName);
    if (store) {
        store.delete(entityId);
    }
}

/**
 * Finds all entities that have a given set of components.
 * @param {...string} componentNames The names of the components to query for.
 * @returns {number[]} An array of entity IDs.
 */
export function getEntitiesWithComponents(...componentNames) {
    if (componentNames.length === 0) {
        return Array.from(entities.keys());
    }

    const results = [];
    const firstStore = componentStores.get(componentNames[0]);
    if (!firstStore) return [];

    for (const entityId of firstStore.keys()) {
        let hasAllComponents = true;
        for (let i = 1; i < componentNames.length; i++) {
            const store = componentStores.get(componentNames[i]);
            if (!store || !store.has(entityId)) {
                hasAllComponents = false;
                break;
            }
        }
        if (hasAllComponents) {
            results.push(entityId);
        }
    }
    return results;
}
