// js/managers/LayerManager.js

export class LayerManager {
    constructor(renderer, measureManager, gridManager, uiManager, cameraManager) {
        console.log("\uD83C\uDFA8 LayerManager initialized. Orchestrating drawing order. \uD83C\uDFA8");
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.gridManager = gridManager;
        this.uiManager = uiManager;
        this.cameraManager = cameraManager;

        this.ctx = renderer.ctx;
        this.canvas = renderer.canvas;

        this.gameScreenColor = measureManager.get('colors.gameScreen');
        this.mapPanelRect = uiManager.getMapPanelRect();
    }

    drawLayers() {
        this.renderer.clear();
        this.renderer.drawBackground();

        this.ctx.save();
        this.ctx.fillStyle = this.gameScreenColor;
        this.ctx.fillRect(
            this.mapPanelRect.x,
            this.mapPanelRect.y,
            this.mapPanelRect.width,
            this.mapPanelRect.height
        );
        this.ctx.restore();

        this.gridManager.draw(this.cameraManager.getTransform());
        this.uiManager.draw();
    }
}
