// js/managers/CameraManager.js

export class CameraManager {
    constructor(renderer, measureManager, mapManager, uiManager) {
        console.log("\ud83d\udcf8 CameraManager initialized. Ready for dynamic views. \ud83d\udcf8");
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.mapManager = mapManager;
        this.uiManager = uiManager;

        this.canvas = renderer.canvas;

        this.x = 0;
        this.y = 0;
        this.zoom = 1;

        this.minZoom = 0.1;
        this.maxZoom = 3.0;
        this.gridPaddingY = measureManager.get('gridPaddingY');

        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.touches = {};
        this.lastPinchDistance = 0;

        this._initializeCameraView();
    }

    _initializeCameraView() {
        console.log("[CameraManager] Initializing camera view to fit map panel...");
        const mapPixelWidth = this.mapManager.getGridDimensions().cols * this.mapManager.getTileSize();
        const mapPixelHeight = this.mapManager.getGridDimensions().rows * this.mapManager.getTileSize();
        // '전체 게임 세계'의 높이 = 맵 높이 + 위아래 패딩
        const totalGameWorldHeight = mapPixelHeight + (this.gridPaddingY * 2);

        const mapPanelRect = this.uiManager.getMapPanelRect();
        const panelWidth = mapPanelRect.width;
        const panelHeight = mapPanelRect.height;

        // 패널 영역을 가득 채울 수 있는 초기 줌 계산
        const zoomX = panelWidth / mapPixelWidth;
        const zoomY = panelHeight / totalGameWorldHeight;
        this.zoom = Math.min(zoomX, zoomY);

        // 너무 작게 축소되지 않도록 최소 줌 보정
        this.minZoom = Math.min(this.minZoom, this.zoom);

        // 패널 중앙 배치를 위한 위치 계산
        const scaledGameWorldWidth = mapPixelWidth * this.zoom;
        const scaledGameWorldHeight = totalGameWorldHeight * this.zoom;

        this.x = mapPanelRect.x + (panelWidth - scaledGameWorldWidth) / 2;
        this.y = mapPanelRect.y + (panelHeight - scaledGameWorldHeight) / 2;

        console.log(`[CameraManager] Initial Camera: x=${this.x.toFixed(2)}, y=${this.y.toFixed(2)}, zoom=${this.zoom.toFixed(4)}`);

        this._clampCameraPosition();
    }

    pan(dx, dy) {
        this.x += dx;
        this.y += dy;
        this._clampCameraPosition();
    }

    zoomAt(delta, mouseX, mouseY) {
        const oldZoom = this.zoom;
        let newZoom = this.zoom * (1 + delta * 0.1);
        newZoom = Math.max(this.minZoom, Math.min(newZoom, this.maxZoom));

        const zoomRatio = newZoom / oldZoom;

        this.x = mouseX - (mouseX - this.x) * zoomRatio;
        this.y = mouseY - (mouseY - this.y) * zoomRatio;
        this.zoom = newZoom;

        this._clampCameraPosition();
        console.log(`[CameraManager] Zoomed to: ${this.zoom.toFixed(4)} at (${this.x.toFixed(2)}, ${this.y.toFixed(2)})`);
    }

    _clampCameraPosition() {
        const mapPixelWidth = this.mapManager.getGridDimensions().cols * this.mapManager.getTileSize();
        const mapPixelHeight = this.mapManager.getGridDimensions().rows * this.mapManager.getTileSize();
        // 전체 게임 세계 높이 계산 (패딩 포함)
        const totalGameWorldHeight = mapPixelHeight + (this.gridPaddingY * 2);

        const mapPanelRect = this.uiManager.getMapPanelRect();
        const viewWidth = mapPanelRect.width;
        const viewHeight = mapPanelRect.height;

        const scaledGameWorldWidth = mapPixelWidth * this.zoom;
        const scaledGameWorldHeight = totalGameWorldHeight * this.zoom;

        let minX = mapPanelRect.x + viewWidth - scaledGameWorldWidth;
        let maxX = mapPanelRect.x;
        let minY = mapPanelRect.y + viewHeight - scaledGameWorldHeight;
        let maxY = mapPanelRect.y;

        if (scaledGameWorldWidth < viewWidth) {
            minX = mapPanelRect.x + (viewWidth - scaledGameWorldWidth) / 2;
            maxX = minX;
        }
        if (scaledGameWorldHeight < viewHeight) {
            minY = mapPanelRect.y + (viewHeight - scaledGameWorldHeight) / 2;
            maxY = minY;
        }

        this.x = Math.max(minX, Math.min(this.x, maxX));
        this.y = Math.max(minY, Math.min(this.y, maxY));
    }

    getTransform() {
        return {
            x: this.x,
            y: this.y,
            zoom: this.zoom
        };
    }

    startDrag(mouseX, mouseY) {
        this.isDragging = true;
        this.lastMouseX = mouseX;
        this.lastMouseY = mouseY;
    }

    doDrag(mouseX, mouseY) {
        if (this.isDragging) {
            const dx = mouseX - this.lastMouseX;
            const dy = mouseY - this.lastMouseY;
            this.pan(dx, dy);
            this.lastMouseX = mouseX;
            this.lastMouseY = mouseY;
        }
    }

    endDrag() {
        this.isDragging = false;
    }

    onTouchStart(touches) {
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            this.touches[touch.identifier] = { x: touch.clientX, y: touch.clientY };
        }

        if (Object.keys(this.touches).length === 2) {
            const [id1, id2] = Object.keys(this.touches);
            const touch1 = this.touches[id1];
            const touch2 = this.touches[id2];
            this.lastPinchDistance = this._getDistance(touch1, touch2);
        } else if (Object.keys(this.touches).length === 1) {
            const touch = touches[0];
            this.startDrag(touch.clientX, touch.clientY);
        }
    }

    onTouchMove(touches) {
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            this.touches[touch.identifier] = { x: touch.clientX, y: touch.clientY };
        }

        if (Object.keys(this.touches).length === 2) {
            const [id1, id2] = Object.keys(this.touches);
            const touch1 = this.touches[id1];
            const touch2 = this.touches[id2];
            const currentPinchDistance = this._getDistance(touch1, touch2);

            const zoomDelta = (currentPinchDistance - this.lastPinchDistance) * 0.005;
            const centerX = (touch1.x + touch2.x) / 2;
            const centerY = (touch1.y + touch2.y) / 2;

            this.zoomAt(zoomDelta, centerX, centerY);
            this.lastPinchDistance = currentPinchDistance;
        } else if (Object.keys(this.touches).length === 1 && this.isDragging) {
            const touch = touches[0];
            this.doDrag(touch.clientX, touch.clientY);
        }
    }

    onTouchEnd(touches) {
        const endedTouchIds = new Set(Object.keys(this.touches));
        for (let i = 0; i < touches.length; i++) {
            endedTouchIds.delete(touches[i].identifier);
        }
        endedTouchIds.forEach(id => delete this.touches[id]);

        if (Object.keys(this.touches).length < 2) {
            this.lastPinchDistance = 0;
        }

        if (Object.keys(this.touches).length === 0 && this.isDragging) {
            this.endDrag();
        }
    }

    _getDistance(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
