// js/managers/CompatibilityManager.js

export class CompatibilityManager {
    constructor(measureManager, renderer, uiEngine, mapManager, logicManager, mercenaryPanelManager, battleLogManager) { // ✨ 새 매니저들 추가
        console.log("\ud83d\udcf1 CompatibilityManager initialized. Adapting to screen changes. \ud83d\udcf1");
        this.measureManager = measureManager;
        this.renderer = renderer; // Main game canvas renderer
        this.uiEngine = uiEngine;
        this.mapManager = mapManager;
        this.logicManager = logicManager;
        this.mercenaryPanelManager = mercenaryPanelManager; // ✨ 용병 패널 매니저
        this.battleLogManager = battleLogManager;     // ✨ 전투 로그 매니저

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

            // MeasureManager와 Renderer에 최소 해상도 설정 (CSS 크기)
            this.measureManager.updateGameResolution(minRes.minWidth, minRes.minHeight);
            this.renderer.canvas.style.width = `${minRes.minWidth}px`; // CSS 크기 설정
            this.renderer.canvas.style.height = `${minRes.minHeight}px`; // CSS 크기 설정
            this.renderer.resizeCanvas(minRes.minWidth, minRes.minHeight); // Renderer의 내부 해상도 조정

            // 다른 캔버스들도 최소값으로 설정 (필요하다면)
            // ... (기존 용병 패널 및 전투 로그 캔버스 크기 조정 로직 유지)
            // 중요한 점은, 이 캔버스들의 CSS width/height를 설정한 후
            // 각 매니저 (MercenaryPanelManager, BattleLogManager) 내에서 자체 캔버스의
            // getContext('2d')를 다시 얻거나, 캔버스 요소를 매니저에 전달할 때 이미 컨텍스트를 얻었으므로
            // 해당 캔버스의 내부 해상도를 직접 조정해 주어야 합니다.
            // MercenaryPanelManager와 BattleLogManager는 이미 canvas와 ctx를 직접 가지고 있으므로,
            // 이들의 draw 메서드에서 pixelRatio를 고려하거나,
            // 별도의 resize 메서드를 추가하여 resizeCanvas처럼 처리해야 합니다. (이 예시에서는 생략)

            // 매니저들의 내부 치수 재계산 호출
            // ... (기존 recalculateUIDimensions 등 유지)
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

        // 1. 메인 게임 캔버스 CSS 해상도 업데이트
        this.measureManager.updateGameResolution(newGameWidth, newGameHeight);
        this.renderer.canvas.style.width = `${newGameWidth}px`;  // CSS 크기 설정
        this.renderer.canvas.style.height = `${newGameHeight}px`; // CSS 크기 설정
        // ✨ Renderer의 내부 해상도(width/height 속성)를 CSS 크기에 맞춰 재설정하고 pixelRatio 적용
        this.renderer.resizeCanvas(newGameWidth, newGameHeight);
        console.log(`[CompatibilityManager] Main Canvas adjusted to: ${newGameWidth}x${newGameHeight}`);

        // 2. 용병 패널 캔버스 해상도 업데이트
        if (this.mercenaryPanelManager && this.mercenaryPanelManager.canvas) {
            const mercenaryPanelHeight = Math.floor(newGameHeight * this.measureManager.get('mercenaryPanel.heightRatio'));
            this.mercenaryPanelManager.canvas.style.width = `${newGameWidth}px`;
            this.mercenaryPanelManager.canvas.style.height = `${mercenaryPanelHeight}px`;
            // ✨ MercenaryPanelManager의 내부 캔버스 해상도도 조정해야 합니다.
            // MercenaryPanelManager 내부에 resizeCanvas() 같은 메서드를 구현하고 호출하거나,
            // 직접 캔버스 width/height 속성과 ctx.scale을 조정해야 합니다.
            // 여기서는 단순히 CSS 크기만 조정합니다. (별도 구현 필요)
            console.log(`[CompatibilityManager] Mercenary Panel Canvas adjusted to: ${newGameWidth}x${mercenaryPanelHeight}`);
        }

        // 3. 전투 로그 캔버스 해상도 업데이트
        if (this.battleLogManager && this.battleLogManager.canvas) {
            const combatLogHeight = Math.floor(newGameHeight * this.measureManager.get('combatLog.heightRatio'));
            this.battleLogManager.canvas.style.width = `${newGameWidth}px`;
            this.battleLogManager.canvas.style.height = `${combatLogHeight}px`;
            // ✨ BattleLogManager의 내부 캔버스 해상도도 조정해야 합니다. (MercenaryPanelManager와 동일)
            // 여기서는 단순히 CSS 크기만 조정합니다. (별도 구현 필요)
            console.log(`[CompatibilityManager] Combat Log Canvas adjusted to: ${newGameWidth}x${combatLogHeight}`);
        }

        // 모든 관련 매니저들의 내부 치수 재계산 호출
        if (this.uiEngine && this.uiEngine.recalculateUIDimensions) {
            this.uiEngine.recalculateUIDimensions();
        }
        if (this.mapManager && this.mapManager.recalculateMapDimensions) {
            this.mapManager.recalculateMapDimensions();
        }
        // ✨ 용병 패널 매니저의 내부 재계산 메서드 호출
        if (this.mercenaryPanelManager && this.mercenaryPanelManager.recalculatePanelDimensions) {
            this.mercenaryPanelManager.recalculatePanelDimensions();
        }
        // ✨ 전투 로그 매니저의 내부 재계산 메서드 호출
        if (this.battleLogManager && this.battleLogManager.recalculateLogDimensions) {
            this.battleLogManager.recalculateLogDimensions();
        }
    }
}

