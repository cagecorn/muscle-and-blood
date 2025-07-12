// js/managers/UIEngine.js

export class UIEngine {
    constructor(renderer, measureManager, eventManager) {
        console.log("\ud83c\udf9b UIEngine initialized. Ready to draw interfaces. \ud83c\udf9b");
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.eventManager = eventManager;

        this.canvas = renderer.canvas;
        this.ctx = renderer.ctx;

        this._currentUIState = 'mapScreen';

        this._recalculateUIDimensions();

        this.battleStartButton = {
            x: (this.canvas.width - this.buttonWidth) / 2,
            y: this.canvas.height - this.buttonHeight - this.buttonMargin,
            width: this.buttonWidth,
            height: this.buttonHeight,
            text: '전투 시작'
        };

        console.log("[UIEngine] Initialized for overlay UI rendering.");
    }

    _recalculateUIDimensions() {
        console.log("[UIEngine] Recalculating UI dimensions based on MeasureManager...");
        this.mapPanelWidth = this.canvas.width * this.measureManager.get('ui.mapPanelWidthRatio');
        this.mapPanelHeight = this.canvas.height * this.measureManager.get('ui.mapPanelHeightRatio');
        this.buttonHeight = this.measureManager.get('ui.buttonHeight');
        this.buttonWidth = this.measureManager.get('ui.buttonWidth');
        this.buttonMargin = this.measureManager.get('ui.buttonMargin');

        this.battleStartButton = {
            x: (this.canvas.width - this.buttonWidth) / 2,
            y: this.canvas.height - this.buttonHeight - this.buttonMargin,
            width: this.buttonWidth,
            height: this.buttonHeight,
            text: '전투 시작'
        };
    }

    getUIState() {
        return this._currentUIState;
    }

    setUIState(newState) {
        this._currentUIState = newState;
        console.log(`[UIEngine] Internal UI state updated to: ${newState}`);
    }

    isClickOnButton(clientX, clientY) {
        if (this._currentUIState !== 'mapScreen') {
            return false;
        }

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        const button = this.battleStartButton;

        return (
            mouseX >= button.x && mouseX <= button.x + button.width &&
            mouseY >= button.y && mouseY <= button.y + button.height
        );
    }

    handleBattleStartClick() {
        console.log("[UIEngine] '전투 시작' 버튼 클릭 처리됨!");
        this.eventManager.emit('battleStart', { mapId: 'currentMap', difficulty: 'normal' });
    }

    draw(ctx) {
        if (this._currentUIState === 'mapScreen') {
            ctx.fillStyle = 'darkgreen';
            ctx.fillRect(
                this.battleStartButton.x,
                this.battleStartButton.y,
                this.battleStartButton.width,
                this.battleStartButton.height
            );
            ctx.fillStyle = 'white';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                this.battleStartButton.text,
                this.battleStartButton.x + this.battleStartButton.width / 2,
                this.battleStartButton.y + this.battleStartButton.height / 2 + 8
            );
        } else if (this._currentUIState === 'combatScreen') {
            ctx.fillStyle = 'white';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('전투 진행 중!', this.canvas.width / 2, 50);
        }
    }

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
