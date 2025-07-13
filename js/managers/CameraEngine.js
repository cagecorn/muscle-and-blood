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
        // 중요: 여기로 전달되는 컨텍스트(ctx)는 Renderer.js에서 이미 pixelRatio만큼 스케일링되어 있습니다.
        // 카메라 변환(논리적 픽셀 기반)을 적용하기 전에 이 스케일링을 일시적으로 '취소'하고,
        // 변환 적용 후 다시 pixelRatio 스케일링을 재적용해야 합니다.

        const pixelRatio = window.devicePixelRatio || 1;

        // 1. pixelRatio 스케일링 되돌리기 (카메라 변환 적용을 위해 잠시 네이티브 픽셀 공간으로 이동)
        ctx.scale(1 / pixelRatio, 1 / pixelRatio);

        // 2. 카메라 변환 적용 (논리적 픽셀 단위로 계산된 this.x, this.y, this.zoom 사용)
        ctx.translate(this.x, this.y);
        ctx.scale(this.zoom, this.zoom);

        // 3. pixelRatio 스케일링 재적용 (이후의 그리기 명령들이 다시 논리적 픽셀 단위로 작동하도록)
        ctx.scale(pixelRatio, pixelRatio);
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
        // 화면에 콘텐츠 전체가 보이도록 최소 줌 값을 가져와 적용합니다.
        const { minZoom } = this.logicManager.getZoomLimits();
        this.zoom = minZoom;
        // ✨ 추가: reset 후 Pan Constraints 적용 전 값 확인
        console.log(`[CameraEngine Debug] Resetting camera: initial X=${this.x}, Y=${this.y}, calculated Zoom=${this.zoom.toFixed(2)}`);

        const clampedPos = this.logicManager.applyPanConstraints(this.x, this.y, this.zoom);
        this.x = clampedPos.x;
        this.y = clampedPos.y;
        // ✨ 추가: reset 후 Pan Constraints 적용 후 값 확인
        console.log(`[CameraEngine Debug] After clamping: final X=${this.x.toFixed(2)}, Y=${this.y.toFixed(2)}, Zoom=${this.zoom.toFixed(2)}`);
    }
}
