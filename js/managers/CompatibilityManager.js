// js/managers/CompatibilityManager.js

export class CompatibilityManager {
    constructor(measureManager, renderer, uiEngine, mapManager, logicManager, mercenaryPanelManager, battleLogManager) {
        console.log("\ud83d\udcf1 CompatibilityManager initialized. Adapting to screen changes. \ud83d\udcf1");
        this.measureManager = measureManager;
        this.renderer = renderer;
        this.uiEngine = uiEngine;
        this.mapManager = mapManager;
        this.logicManager = logicManager;
        this.mercenaryPanelManager = mercenaryPanelManager;
        this.battleLogManager = battleLogManager;

        // 캔버스 참조 보관
        this.mercenaryPanelCanvas = mercenaryPanelManager ? mercenaryPanelManager.canvas : null;
        this.combatLogCanvas = battleLogManager ? battleLogManager.canvas : null;

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

        const totalPadding = 20; // #gameContainer padding (10px top + 10px bottom)
        const totalMarginBetweenCanvases = 20; // 10px below mercenaryPanelCanvas + 10px above combatLogCanvas
        const totalVerticalSpaceForCanvasElements = totalPadding + totalMarginBetweenCanvases;

        const mainGameAspectRatio = this.baseGameWidth / this.baseGameHeight;
        const maxAvailableWidthForCanvases = viewportWidth - totalPadding;
        const maxAvailableHeightForCanvases = viewportHeight - totalVerticalSpaceForCanvasElements;

        const mercenaryPanelHeightRatio = this.measureManager.get('mercenaryPanel.heightRatio');
        const combatLogHeightRatio = this.measureManager.get('combatLog.heightRatio');

        const totalRelativeHeightUnits = 1 + mercenaryPanelHeightRatio + combatLogHeightRatio;

        let calculatedMainGameCanvasWidth;
        let calculatedMainGameCanvasHeight;

        const possibleMainCanvasHeightFromWidth = maxAvailableWidthForCanvases / mainGameAspectRatio;
        const possibleMainCanvasHeightFromHeight = maxAvailableHeightForCanvases / totalRelativeHeightUnits;

        calculatedMainGameCanvasHeight = Math.floor(Math.min(possibleMainCanvasHeightFromWidth, possibleMainCanvasHeightFromHeight));
        calculatedMainGameCanvasWidth = Math.floor(calculatedMainGameCanvasHeight * mainGameAspectRatio);

        if (calculatedMainGameCanvasWidth <= 0 || calculatedMainGameCanvasHeight <= 0) {
            console.warn("[CompatibilityManager] Calculated main game resolution is zero or negative. Falling back to minimums.");
            const minRes = this.logicManager.getMinGameResolution();
            calculatedMainGameCanvasWidth = minRes.minWidth;
            calculatedMainGameCanvasHeight = minRes.minHeight;
        }

        const minRequiredResolution = this.logicManager.getMinGameResolution();

        if (calculatedMainGameCanvasWidth < minRequiredResolution.minWidth || calculatedMainGameCanvasHeight < minRequiredResolution.minHeight) {
            console.warn(`[CompatibilityManager] Calculated main game resolution ${calculatedMainGameCanvasWidth}x${calculatedMainGameCanvasHeight} is below minimum requirement ${minRequiredResolution.minWidth}x${minRequiredResolution.minHeight}. Forcing minimums.`);

            const scaleFactorWidth = minRequiredResolution.minWidth / calculatedMainGameCanvasWidth;
            const scaleFactorHeight = minRequiredResolution.minHeight / calculatedMainGameCanvasHeight;
            const finalScaleFactor = Math.max(scaleFactorWidth, scaleFactorHeight);

            calculatedMainGameCanvasWidth = Math.floor(calculatedMainGameCanvasWidth * finalScaleFactor);
            calculatedMainGameCanvasHeight = Math.floor(calculatedMainGameCanvasHeight * finalScaleFactor);

            calculatedMainGameCanvasWidth = Math.max(calculatedMainGameCanvasWidth, minRequiredResolution.minWidth);
            calculatedMainGameCanvasHeight = Math.max(calculatedMainGameCanvasHeight, minRequiredResolution.minHeight);
        }

        this.measureManager.updateGameResolution(calculatedMainGameCanvasWidth, calculatedMainGameCanvasHeight);
        this.renderer.canvas.style.width = `${calculatedMainGameCanvasWidth}px`;
        this.renderer.canvas.style.height = `${calculatedMainGameCanvasHeight}px`;
        this.renderer.resizeCanvas(calculatedMainGameCanvasWidth, calculatedMainGameCanvasHeight);
        console.log(`[CompatibilityManager] Main Canvas adjusted to: ${calculatedMainGameCanvasWidth}x${calculatedMainGameCanvasHeight}`);

        if (this.mercenaryPanelCanvas) {
            const mercenaryPanelHeight = Math.floor(calculatedMainGameCanvasHeight * mercenaryPanelHeightRatio);
            this.mercenaryPanelCanvas.style.width = `${calculatedMainGameCanvasWidth}px`;
            this.mercenaryPanelCanvas.style.height = `${mercenaryPanelHeight}px`;
            if (this.mercenaryPanelManager && this.mercenaryPanelManager.resizeCanvas) {
                this.mercenaryPanelManager.resizeCanvas(calculatedMainGameCanvasWidth, mercenaryPanelHeight);
            }
            console.log(`[CompatibilityManager] Mercenary Panel Canvas adjusted to: ${calculatedMainGameCanvasWidth}x${mercenaryPanelHeight}`);
        }

        if (this.combatLogCanvas) {
            const combatLogHeight = Math.floor(calculatedMainGameCanvasHeight * combatLogHeightRatio);
            this.combatLogCanvas.style.width = `${calculatedMainGameCanvasWidth}px`;
            this.combatLogCanvas.style.height = `${combatLogHeight}px`;
            if (this.battleLogManager && this.battleLogManager.resizeCanvas) {
                this.battleLogManager.resizeCanvas(calculatedMainGameCanvasWidth, combatLogHeight);
            }
            console.log(`[CompatibilityManager] Combat Log Canvas adjusted to: ${calculatedMainGameCanvasWidth}x${combatLogHeight}`);
        }

        this.callRecalculateDimensions();
    }

    // 모든 매니저의 재계산 메서드를 호출하는 헬퍼 함수
    callRecalculateDimensions() {
        if (this.uiEngine && this.uiEngine.recalculateUIDimensions) {
            this.uiEngine.recalculateUIDimensions();
        }
        if (this.mapManager && this.mapManager.recalculateMapDimensions) {
            this.mapManager.recalculateMapDimensions();
        }
        if (this.mercenaryPanelManager && this.mercenaryPanelManager.recalculatePanelDimensions) {
            this.mercenaryPanelManager.recalculatePanelDimensions();
        }
        if (this.battleLogManager && this.battleLogManager.recalculateLogDimensions) {
            this.battleLogManager.recalculateLogDimensions();
        }
    }
}

