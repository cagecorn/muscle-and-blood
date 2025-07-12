// js/managers/CameraEngine.js

export class CameraEngine {
    constructor(renderer) {
        console.log("\ud83d\udcf8 CameraEngine initialized. Ready to control the view. \ud83d\udcf8");
        this.renderer = renderer;

        this.x = 0; // camera offset x
        this.y = 0; // camera offset y
        this.zoom = 1; // zoom level

        this.minZoom = 0.5;
        this.maxZoom = 3;
    }

    applyTransform(ctx) {
        ctx.translate(this.x, this.y);
        ctx.scale(this.zoom, this.zoom);
    }

    pan(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    zoomAt(zoomAmount, mouseX, mouseY) {
        const oldZoom = this.zoom;
        let newZoom = this.zoom + zoomAmount;
        newZoom = Math.max(this.minZoom, Math.min(newZoom, this.maxZoom));
        if (newZoom === oldZoom) return;

        const worldX = (mouseX - this.x) / oldZoom;
        const worldY = (mouseY - this.y) / oldZoom;

        this.x -= worldX * (newZoom - oldZoom);
        this.y -= worldY * (newZoom - oldZoom);
        this.zoom = newZoom;
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
    }
}
