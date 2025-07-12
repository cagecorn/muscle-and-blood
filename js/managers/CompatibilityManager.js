// js/managers/CompatibilityManager.js

export class CompatibilityManager {
    constructor(measureManager, renderer, uiEngine, mapManager, logicManager) {
        console.log("\ud83d\udcf1 CompatibilityManager initialized. Adapting to screen changes. \ud83d\udcf1");
        this.measureManager = measureManager;
        this.renderer = renderer;
        this.uiEngine = uiEngine;
        this.mapManager = mapManager;
        this.logicManager = logicManager;

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

    /**
     * 현재 뷰포트에 맞춰 게임 해상도를 조정합니다.
     * 원본 게임의 가로세로 비율을 유지하면서 화면에 "포함(contain)"되도록 합니다.
     * GuardianManager의 최소 해상도 요구 사항을 충족하도록 보장합니다.
     */
    adjustResolution() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // 뷰포트가 0이거나 유효하지 않으면 기본 해상도로 돌아가거나 경고
        if (viewportWidth === 0 || viewportHeight === 0) {
            console.warn("[CompatibilityManager] Viewport dimensions are zero, cannot adjust resolution.");
            const minRes = this.logicManager.getMinGameResolution();
            this.measureManager.updateGameResolution(minRes.minWidth, minRes.minHeight);
            this.renderer.canvas.width = minRes.minWidth;
            this.renderer.canvas.height = minRes.minHeight;
            return;
        }

        let newGameWidth;
        let newGameHeight;

        const currentViewportAspectRatio = viewportWidth / viewportHeight;

        if (currentViewportAspectRatio > this.baseAspectRatio) {
            // 뷰포트가 게임 기본 비율보다 가로로 넓다면, 높이에 맞춰 스케일
            newGameHeight = viewportHeight;
            newGameWidth = newGameHeight * this.baseAspectRatio;
        } else {
            // 뷰포트가 게임 기본 비율보다 세로로 길거나 가로로 좁다면, 너비에 맞춰 스케일
            newGameWidth = viewportWidth;
            newGameHeight = newGameWidth / this.baseAspectRatio;
        }

        // 소수점 제거
        newGameWidth = Math.floor(newGameWidth);
        newGameHeight = Math.floor(newGameHeight);

        // GuardianManager의 최소 해상도 요구 사항 가져오기
        const minRequiredResolution = this.logicManager.getMinGameResolution();

        // 계산된 해상도가 최소 요구 사항보다 작을 경우 조정
        if (newGameWidth < minRequiredResolution.minWidth || newGameHeight < minRequiredResolution.minHeight) {
            console.warn(`[CompatibilityManager] Calculated resolution ${newGameWidth}x${newGameHeight} is below minimum requirement ${minRequiredResolution.minWidth}x${minRequiredResolution.minHeight}. Forcing minimums.`);

            const scaleToFitMinWidth = minRequiredResolution.minWidth / newGameWidth;
            const scaleToFitMinHeight = minRequiredResolution.minHeight / newGameHeight;

            const forcedScale = Math.max(scaleToFitMinWidth, scaleToFitMinHeight);

            newGameWidth = Math.floor(newGameWidth * forcedScale);
            newGameHeight = Math.floor(newGameHeight * forcedScale);

            newGameWidth = Math.max(newGameWidth, minRequiredResolution.minWidth);
            newGameHeight = Math.max(newGameHeight, minRequiredResolution.minHeight);
        }

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

