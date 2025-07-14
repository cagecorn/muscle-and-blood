// js/managers/UIEngine.js

export class UIEngine {
    constructor(renderer, measureManager, eventManager, mercenaryPanelManager, buttonEngine) { // ✨ buttonEngine 추가
        console.log("\ud83c\udf9b UIEngine initialized. Ready to draw interfaces. \ud83c\udf9b");
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.eventManager = eventManager;
        this.mercenaryPanelManager = mercenaryPanelManager; // MercenaryPanelManager 인스턴스 저장
        this.buttonEngine = buttonEngine; // ✨ ButtonEngine 인스턴스 저장

        this.canvas = renderer.canvas;
        this.ctx = renderer.ctx;

        this._currentUIState = 'mapScreen';
        this.heroPanelVisible = false; // 영웅 패널 가시성 상태

        this.recalculateUIDimensions();

        const pixelRatio = window.devicePixelRatio || 1;
        this.battleStartButton = {
            x: (this.canvas.width / pixelRatio - this.buttonWidth) / 2,
            y: (this.canvas.height / pixelRatio) - this.buttonHeight - this.buttonMargin,
            width: this.buttonWidth,
            height: this.buttonHeight,
            text: '전투 시작'
        };

        // ButtonEngine을 통해 버튼을 등록합니다.
        if (this.buttonEngine) {
            this.buttonEngine.registerButton(
                'battleStartButton',
                this.battleStartButton.x,
                this.battleStartButton.y,
                this.battleStartButton.width,
                this.battleStartButton.height,
                this.handleBattleStartClick.bind(this)
            );
        }

        console.log("[UIEngine] Initialized for overlay UI rendering.");
    }

    recalculateUIDimensions() {
        console.log("[UIEngine] Recalculating UI dimensions based on MeasureManager...");
        // measureManager에서 가져오는 값들이 올바른지 확인합니다.
        this.mapPanelWidth = this.canvas.width * this.measureManager.get('ui.mapPanelWidthRatio');
        this.mapPanelHeight = this.canvas.height * this.measureManager.get('ui.mapPanelHeightRatio');
        this.buttonHeight = this.measureManager.get('ui.buttonHeight');
        this.buttonWidth = this.measureManager.get('ui.buttonWidth');
        this.buttonMargin = this.measureManager.get('ui.buttonMargin');

        const pixelRatio = window.devicePixelRatio || 1;
        this.battleStartButton = {
            x: (this.canvas.width / pixelRatio - this.buttonWidth) / 2, // 논리적 캔버스 너비 사용
            y: (this.canvas.height / pixelRatio) - this.buttonHeight - this.buttonMargin, // 논리적 캔버스 높이 사용
            width: this.buttonWidth,
            height: this.buttonHeight,
            text: '전투 시작'
        };

        // ButtonEngine에 저장된 버튼 위치도 업데이트합니다.
        if (this.buttonEngine) {
            this.buttonEngine.updateButtonRect(
                'battleStartButton',
                this.battleStartButton.x,
                this.battleStartButton.y,
                this.battleStartButton.width,
                this.battleStartButton.height
            );
        }

        // ✨ 추가: 버튼 계산 후 최종 위치 및 크기 로그
        console.log(`[UIEngine Debug] Battle Start Button: X=${this.battleStartButton.x}, Y=${this.battleStartButton.y}, Width=${this.battleStartButton.width}, Height=${this.battleStartButton.height}`);
        console.log(`[UIEngine Debug] Canvas Logical Dimensions: ${this.canvas.width / pixelRatio}x${this.canvas.height / pixelRatio}`);
    }

    getUIState() {
        return this._currentUIState;
    }

    setUIState(newState) {
        this._currentUIState = newState;
        console.log(`[UIEngine] Internal UI state updated to: ${newState}`);
    }

    // 영웅 패널 가시성 토글
    toggleHeroPanel() {
        this.heroPanelVisible = !this.heroPanelVisible;
        console.log(`[UIEngine] Hero Panel Visibility: ${this.heroPanelVisible ? 'Visible' : 'Hidden'}`);
        // 필요에 따라 UI 상태를 변경할 수 있지만, 오버레이는 현재 UI 상태와 별개로 표시될 수 있습니다.
    }


    handleBattleStartClick() {
        console.log("[UIEngine] '전투 시작' 버튼 클릭 처리됨!");
        this.eventManager.emit('battleStart', { mapId: 'currentMap', difficulty: 'normal' });
    }

    draw(ctx) {
        // ButtonEngine에서 최신 버튼 위치 정보를 가져와 그립니다.
        const battleStartButtonRect = this.buttonEngine ? this.buttonEngine.getButtonRect('battleStartButton') : null;

        if (this._currentUIState === 'mapScreen' && battleStartButtonRect) {
            ctx.fillStyle = 'darkgreen';
            ctx.fillRect(
                battleStartButtonRect.x,
                battleStartButtonRect.y,
                battleStartButtonRect.width,
                battleStartButtonRect.height
            );
            ctx.fillStyle = 'white';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                this.battleStartButton.text,
                battleStartButtonRect.x + battleStartButtonRect.width / 2,
                battleStartButtonRect.y + battleStartButtonRect.height / 2 + 8
            );
        } else if (this._currentUIState === 'combatScreen') {
            // 전투 화면에서는 현재 별도의 상단 텍스트를 표시하지 않습니다.
        }

        // 영웅 패널이 활성화되어 있으면 오버레이로 그립니다.
        if (this.heroPanelVisible && this.mercenaryPanelManager) {
            // 오버레이 배경 (반투명)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, this.canvas.width / (window.devicePixelRatio || 1), this.canvas.height / (window.devicePixelRatio || 1));

            // 영웅 패널이 그려질 중앙 영역 계산
            const panelWidth = this.measureManager.get('gameResolution.width') * 0.8; // 캔버스 너비의 80%
            const panelHeight = this.measureManager.get('gameResolution.height') * 0.7; // 캔버스 높이의 70%
            const panelX = (this.measureManager.get('gameResolution.width') - panelWidth) / 2;
            const panelY = (this.measureManager.get('gameResolution.height') - panelHeight) / 2;

            // MercenaryPanelManager의 draw 메서드를 호출하여 메인 캔버스에 그립니다.
            this.mercenaryPanelManager.draw(ctx, panelX, panelY, panelWidth, panelHeight);
        }
    }

    getMapPanelDimensions() {
        return {
            width: this.mapPanelWidth,
            height: this.mapPanelHeight
        };
    }

    getButtonDimensions() {
        const rect = this.buttonEngine ? this.buttonEngine.getButtonRect('battleStartButton') : null;
        return rect ? { width: rect.width, height: rect.height } : { width: 0, height: 0 };
    }
}
