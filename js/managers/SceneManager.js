// js/managers/SceneManager.js

export class SceneManager {
    constructor() {
        console.log("\ud83c\udf9c SceneManager initialized. Ready to manage game scenes. \ud83c\udf9c");
        this.scenes = new Map();
        this.currentSceneName = null;
    }

    registerScene(name, managers) {
        this.scenes.set(name, managers);
        console.log(`[SceneManager] Scene '${name}' registered with ${managers.length} managers.`);
    }

    setCurrentScene(sceneName) {
        if (this.scenes.has(sceneName)) {
            this.currentSceneName = sceneName;
            console.log(`[SceneManager] Current scene set to: ${sceneName}`);
        } else {
            console.warn(`[SceneManager] Scene '${sceneName}' not found.`);
        }
    }

    update(deltaTime) {
        if (this.currentSceneName) {
            const managers = this.scenes.get(this.currentSceneName);
            for (const manager of managers) {
                if (manager.update && typeof manager.update === 'function') {
                    manager.update(deltaTime);
                }
            }
        }
    }

    draw(ctx) {
        if (this.currentSceneName) {
            const managers = this.scenes.get(this.currentSceneName);
            for (const manager of managers) {
                if (manager.draw && typeof manager.draw === 'function') {
                    manager.draw(ctx);
                }
            }
        }
    }

    getCurrentSceneName() {
        return this.currentSceneName;
    }
}
