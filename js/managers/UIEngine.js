// js/managers/UIEngine.js

// MapManager와 GridManager를 불러옵니다.
import { MapManager } from './MapManager.js';
import { GridManager } from './GridManager.js';

export class UIEngine {
    // 생성자에서 mapManager와 gridManager를 추가로 받습니다.
    constructor(renderer, measureManager, eventManager, mapManager, gridManager) {
        console.log("\ud83d\udcbb UIEngine initialized. Ready to draw interfaces. \ud83d\udcbb");
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.eventManager = eventManager;

        // MapManager와 GridManager 인스턴스 저장
        this.mapManager = mapManager;
        this.gridManager = gridManager;

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

        // UI 상태를 관리하는 내부 "작은 엔진"
        this.uiStateEngine = this._createUIStateEngine();
    }

    /**
     * UI 요소들의 크기와 위치를 MeasureManager로부터 다시 계산합니다.
     * 캔버스 크기 변화나 측정값 변경 시 호출됩니다.
     */
    _recalculateUIDimensions() {
        console.log("[UIEngine] Recalculating UI dimensions based on MeasureManager...");
        // 맵 패널 크기를 계산하고 중앙에 배치하기 위한 좌표도 저장
        this.mapPanelWidth = this.canvas.width * this.measureManager.get('ui.mapPanelWidthRatio');
        this.mapPanelHeight = this.canvas.height * this.measureManager.get('ui.mapPanelHeightRatio');
        this.mapPanelX = (this.canvas.width - this.mapPanelWidth) / 2;
        this.mapPanelY = (this.canvas.height - this.mapPanelHeight) / 2;
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
                this.uiStateEngine.setState('combatScreen');
            }
        }
    }

    draw() {
        // 전체 화면의 반투명 배경 (모든 UI 인터페이스의 공통 배경)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.uiStateEngine.getState() === 'mapScreen') {
            // 맵 패널 배경 (아파트 A동의 외부 형태)
            this.ctx.fillStyle = 'lightblue';
            this.ctx.fillRect(
                this.mapPanelX,
                this.mapPanelY,
                this.mapPanelWidth,
                this.mapPanelHeight
            );

            // 1층 게임 화면 매니저 (MapManager) 호출
            this.mapManager.draw(this.ctx, this.mapPanelX, this.mapPanelY, this.mapPanelWidth, this.mapPanelHeight);

            // 2층 그리드 매니저 (GridManager) 호출
            this.gridManager.draw(this.ctx, this.mapPanelX, this.mapPanelY, this.mapPanelWidth, this.mapPanelHeight);

            // 맵 화면 텍스트 (옵션, 맵과 그리드 위에 그려집니다)
            this.ctx.fillStyle = 'black';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('맵 화면 (지도 영역)', this.canvas.width / 2, this.canvas.height / 2);

            // '전투 시작' 버튼 (UI 요소)
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
