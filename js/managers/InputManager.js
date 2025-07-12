// js/managers/InputManager.js

export class InputManager {
    constructor(renderer, cameraEngine, uiEngine) {
        console.log("\ud83c\udfae InputManager initialized. Ready to process user input. \ud83c\udfae");
        this.renderer = renderer;
        this.cameraEngine = cameraEngine;
        this.uiEngine = uiEngine;

        this.canvas = this.renderer.canvas;

        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this._addEventListeners();
    }

    _addEventListeners() {
        this.canvas.addEventListener('mousedown', this._onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this._onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this._onMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this._onMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this._onMouseWheel.bind(this), { passive: false });
        this.canvas.addEventListener('click', this._onClick.bind(this));
    }

    _onMouseDown(event) {
        if (this.uiEngine.getUIState() === 'mapScreen' && this.uiEngine.isClickOnButton(event.clientX, event.clientY)) {
            this.isDragging = false;
            return;
        }

        this.isDragging = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        this.canvas.style.cursor = 'grabbing';
    }

    _onMouseMove(event) {
        if (this.isDragging) {
            const dx = event.clientX - this.lastMouseX;
            const dy = event.clientY - this.lastMouseY;
            this.cameraEngine.pan(dx, dy);
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
        }
    }

    _onMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
    }

    _onMouseWheel(event) {
        event.preventDefault();

        const zoomAmount = event.deltaY > 0 ? -0.1 : 0.1;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        this.cameraEngine.zoomAt(zoomAmount, mouseX, mouseY);
    }

    _onClick(event) {
        if (this.uiEngine.isClickOnButton(event.clientX, event.clientY)) {
            this.uiEngine.handleBattleStartClick();
        }
    }
}
