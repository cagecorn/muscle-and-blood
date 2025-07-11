// js/managers/InputManager.js

export class InputManager {
    constructor(canvas, cameraManager) {
        console.log("\ud83d\udcbb InputManager initialized. Ready to listen inputs. \ud83d\udcbb");
        this.canvas = canvas;
        this.cameraManager = cameraManager;

        this.canvas.addEventListener('mousedown', this._onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this._onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this._onMouseUp.bind(this));
        this.canvas.addEventListener('mouseout', this._onMouseUp.bind(this));

        this.canvas.addEventListener('wheel', this._onWheel.bind(this));

        this.canvas.addEventListener('touchstart', this._onTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this._onTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this._onTouchEnd.bind(this));
        this.canvas.addEventListener('touchcancel', this._onTouchEnd.bind(this));
    }

    _onMouseDown(event) {
        if (event.button === 0) {
            this.cameraManager.startDrag(event.clientX, event.clientY);
        }
    }

    _onMouseMove(event) {
        if (this.cameraManager.isDragging) {
            this.cameraManager.doDrag(event.clientX, event.clientY);
        }
    }

    _onMouseUp(event) {
        this.cameraManager.endDrag();
    }

    _onWheel(event) {
        event.preventDefault();
        const delta = Math.sign(event.deltaY);
        const zoomDelta = -delta;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        this.cameraManager.zoomAt(zoomDelta, mouseX, mouseY);
    }

    _onTouchStart(event) {
        event.preventDefault();
        this.cameraManager.onTouchStart(event.touches);
    }

    _onTouchMove(event) {
        event.preventDefault();
        this.cameraManager.onTouchMove(event.touches);
    }

    _onTouchEnd(event) {
        this.cameraManager.onTouchEnd(event.changedTouches);
    }
}
