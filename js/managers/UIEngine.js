// js/managers/UIEngine.js

export class UIEngine {
    constructor(renderer, measureManager, eventManager) {
        console.log("\ud83d\udcbb UIEngine initialized. Ready to draw interfaces. \ud83d\udcbb");
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.eventManager = eventManager;

        this.canvas = renderer.canvas;
        this.ctx = renderer.ctx;

        this.uiState = 'mapScreen';

        // 초기 UI 크기 설정을 MeasureManager 값에 맞추어 계산
        this._recalculateUIDimensions();

        // UI 요소 초기화 (버튼 위치 계산)
        this.battleStartButton = {
            x: (this.canvas.width - this.buttonWidth) / 2,
            y: this.canvas.height - this.buttonHeight - this.buttonMargin,
            width: this.buttonWidth,
            height: this.buttonHeight,
            text: '전투 시작'
        };

        this.canvas.addEventListener('click', this._handleClick.bind(this));

        // 내부적으로 uiState를 관리하는 작은 엔진
        this.uiStateEngine = this._createUIStateEngine();
    }

    /**
     * UI 요소들의 크기와 위치를 MeasureManager로부터 다시 계산합니다.
     * 캔버스 크기 변화나 측정값 변경 시 호출됩니다.
     */
    _recalculateUIDimensions() {
        console.log("[UIEngine] Recalculating UI dimensions based on MeasureManager...");
        this.mapPanelWidth = this.canvas.width * this.measureManager.get('ui.mapPanelWidthRatio');
        this.mapPanelHeight = this.canvas.height * this.measureManager.get('ui.mapPanelHeightRatio');
        this.buttonHeight = this.measureManager.get('ui.buttonHeight');
        this.buttonWidth = this.measureManager.get('ui.buttonWidth');
        this.buttonMargin = this.measureManager.get('ui.buttonMargin');

        // 버튼 위치도 새로 계산
        this.battleStartButton = {
            x: (this.canvas.width - this.buttonWidth) / 2,
            y: this.canvas.height - this.buttonHeight - this.buttonMargin,
            width: this.buttonWidth,
            height: this.buttonHeight,
            text: '전투 시작'
        };
    }

    _createUIStateEngine() {
        console.log("[UIEngine] Small Engine: UI State Engine created.");
        return {
            getState: () => this.uiState,
            setState: (newState) => {
                console.log(`[UIEngine] UI State changed from '${this.uiState}' to '${newState}'`);
                this.uiState = newState;
            }
        };
    }

    // 외부에서 UI 상태를 가져갈 수 있도록 헬퍼 메서드 추가
    getUIState() {
        return this.uiStateEngine.getState();
    }

    _handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (this.uiStateEngine.getState() === 'mapScreen') {
            if (
                mouseX >= this.battleStartButton.x && mouseX <= this.battleStartButton.x + this.battleStartButton.width &&
                mouseY >= this.battleStartButton.y && mouseY <= this.battleStartButton.y + this.battleStartButton.height
            ) {
                console.log("[UIEngine] '전투 시작' 버튼 클릭됨!");
                this.eventManager.emit('battleStart', { mapId: 'currentMap', difficulty: 'normal' });
                this.uiStateEngine.setState('combatScreen'); // 전투 화면으로 상태 변경
            }
        }
        // 다른 UI 상태에서의 클릭 처리는 여기에 추가할 수 있습니다.
    }

    // UIEngine의 draw 메서드를 LayerEngine에 등록된 drawLayer 함수가 대신하도록 변경
    draw(ctx) { // LayerEngine으로부터 ctx를 받습니다.
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 현재 UI 상태가 'mapScreen'일 때만 '맵 화면' 관련 UI를 그립니다.
        if (this.getUIState() === 'mapScreen') {
            this.ctx.fillStyle = 'lightblue';
            this.ctx.fillRect(
                (this.canvas.width - this.mapPanelWidth) / 2,
                (this.canvas.height - this.mapPanelHeight) / 2,
                this.mapPanelWidth,
                this.mapPanelHeight
            );
            this.ctx.fillStyle = 'black';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('맵 화면 (지도 영역)', this.canvas.width / 2, this.canvas.height / 2);

            this.ctx.fillStyle = 'darkgreen';
            this.ctx.fillRect(
                this.battleStartButton.x,
                this.battleStartButton.y,
                this.battleStartButton.width,
                this.battleStartButton.height
            );
            this.ctx.fillStyle = 'white';
            this.ctx.font = '24px Arial';
            this.ctx.fillText(
                this.battleStartButton.text,
                this.battleStartButton.x + this.battleStartButton.width / 2,
                this.battleStartButton.y + this.battleStartButton.height / 2 + 8
            );
        }
        // 'combatScreen' 상태에서는 UIEngine이 직접 그리는 UI 요소는 없을 수 있습니다.
        // 전투 중 필요한 UI 요소는 해당 매니저(예: CombatUI, UnitHealthBar 등)에서 그리거나,
        // UIEngine 내부에 'combatScreen' 전용 UI 그리기 로직을 추가할 수 있습니다.
        else if (this.getUIState() === 'combatScreen') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // 배경 불투명하게
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('전투 진행 중!', this.canvas.width / 2, 50); // 상단에 표시
        }
    }

    // 테스트를 위해 맵 패널 크기와 버튼 크기를 반환합니다.
    getMapPanelDimensions() {
        return {
            width: this.mapPanelWidth,
            height: this.mapPanelHeight
        };
    }

    getButtonDimensions() {
        return {
            width: this.battleStartButton.width,
            height: this.battleStartButton.height
        };
    }
}
