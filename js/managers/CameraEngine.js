// js/managers/CameraEngine.js

export class CameraEngine {
    constructor(renderer, logicManager, sceneManager) {
        console.log("\ud83d\udcf8 CameraEngine initialized. Ready to control the view. \ud83d\udcf8");
        this.renderer = renderer;
        this.logicManager = logicManager;
        this.sceneManager = sceneManager;

        this.x = 0;
        this.y = 0;
        this.zoom = 1;
    }

    applyTransform(ctx) {
        ctx.translate(this.x, this.y);
        ctx.scale(this.zoom, this.zoom);
    }

    pan(dx, dy) {
        this.x += dx;
        this.y += dy;
        const clampedPos = this.logicManager.applyPanConstraints(this.x, this.y, this.zoom);
        this.x = clampedPos.x;
        this.y = clampedPos.y;
    }

    zoomAt(zoomAmount, mouseX, mouseY) {
        const oldZoom = this.zoom;
        let newZoom = this.zoom + zoomAmount;
        const zoomLimits = this.logicManager.getZoomLimits();
        newZoom = Math.max(zoomLimits.minZoom, Math.min(newZoom, zoomLimits.maxZoom));
        if (newZoom === oldZoom) return;

        const worldX = (mouseX - this.x) / oldZoom;
        const worldY = (mouseY - this.y) / oldZoom;

        this.x -= worldX * (newZoom - oldZoom);
        this.y -= worldY * (newZoom - oldZoom);
        this.zoom = newZoom;

        const clampedPos = this.logicManager.applyPanConstraints(this.x, this.y, this.zoom);
        this.x = clampedPos.x;
        this.y = clampedPos.y;
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
        const clampedPos = this.logicManager.applyPanConstraints(this.x, this.y, this.zoom);
        this.x = clampedPos.x;
        this.y = clampedPos.y;
    }
}
