// js/managers/UIManager.js

export class UIManager {
    constructor(renderer, measureManager, eventManager) {
        console.log("\ud83d\udcbb UIManager initialized. Ready to draw interfaces. \ud83d\udcbb");
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

        this.uiStateEngine = this._createUIStateEngine();
    }

    /**
     * UI 요소들의 크기와 위치를 MeasureManager로부터 다시 계산합니다.
     * 캔버스 크기 변화나 측정값 변경 시 호출됩니다.
     */
    _recalculateUIDimensions() {
        console.log("[UIManager] Recalculating UI dimensions based on MeasureManager...");
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
        console.log("[UIManager] Small Engine: UI State Engine created.");
        return {
            getState: () => this.uiState,
            setState: (newState) => {
                console.log(`[UIManager] UI State changed from '${this.uiState}' to '${newState}'`);
                this.uiState = newState;
            }
        };
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
                console.log("[UIManager] '전투 시작' 버튼 클릭됨!");
                this.eventManager.emit('battleStart', { mapId: 'currentMap', difficulty: 'normal' });
                this.uiStateEngine.setState('combatScreen');
            }
        }
    }

    draw() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.uiStateEngine.getState() === 'mapScreen') {
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
        } else if (this.uiStateEngine.getState() === 'combatScreen') {
            this.ctx.fillStyle = 'red';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('전투 중!', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    /**
     * 맵 화면 패널이 캔버스 내에서 차지하는 영역의 정보를 반환합니다.
     * CameraManager가 이를 참조하여 맵의 초기 줌 및 드래그 경계를 계산합니다.
     * @returns {{x: number, y: number, width: number, height: number}} 맵 패널의 픽셀 좌표와 크기
     */
    getMapPanelRect() {
        const x = (this.canvas.width - this.mapPanelWidth) / 2;
        const y = (this.canvas.height - this.mapPanelHeight) / 2;
        return {
            x: x,
            y: y,
            width: this.mapPanelWidth,
            height: this.mapPanelHeight
        };
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
