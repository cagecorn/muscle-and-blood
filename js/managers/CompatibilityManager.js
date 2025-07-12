// js/managers/CompatibilityManager.js

export class CompatibilityManager {
    constructor(measureManager, renderer, uiEngine, mapManager) {
        console.log("\ud83d\udcf1 CompatibilityManager initialized. Adapting to screen changes. \ud83d\udcf1");
        this.measureManager = measureManager;
        this.renderer = renderer;
        this.uiEngine = uiEngine;
        this.mapManager = mapManager;

        this.baseGameWidth = this.measureManager.get('gameResolution.width');
        this.baseGameHeight = this.measureManager.get('gameResolution.height');
        this.baseAspectRatio = this.baseGameWidth / this.baseGameHeight;

        this._setupEventListeners();
        this.adjustResolution();
    }

    _setupEventListeners() {
        window.addEventListener('resize', this.adjustResolution.bind(this));
        console.log("[CompatibilityManager] Listening for window resize events.");
    }

    adjustResolution() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let newGameWidth;
        let newGameHeight;

        const currentViewportAspectRatio = viewportWidth / viewportHeight;

        if (currentViewportAspectRatio > this.baseAspectRatio) {
            newGameHeight = viewportHeight;
            newGameWidth = newGameHeight * this.baseAspectRatio;
        } else {
            newGameWidth = viewportWidth;
            newGameHeight = newGameWidth / this.baseAspectRatio;
        }

        newGameWidth = Math.floor(newGameWidth);
        newGameHeight = Math.floor(newGameHeight);

        this.measureManager.updateGameResolution(newGameWidth, newGameHeight);

        this.renderer.canvas.width = newGameWidth;
        this.renderer.canvas.height = newGameHeight;

        console.log(`[CompatibilityManager] Canvas adjusted to: ${newGameWidth}x${newGameHeight}`);

        if (this.uiEngine && this.uiEngine.recalculateUIDimensions) {
            this.uiEngine.recalculateUIDimensions();
        }
        if (this.mapManager && this.mapManager.recalculateMapDimensions) {
            this.mapManager.recalculateMapDimensions();
        }
    }
}

