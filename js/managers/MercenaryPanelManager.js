// js/managers/MercenaryPanelManager.js

// Renderer는 이제 PanelEngine 또는 상위 GameEngine에서 관리되므로 여기서는 필요 없습니다.

export class MercenaryPanelManager {
    // 생성자에서 캔버스 ID 대신 캔버스 요소를 직접 받도록 변경합니다.
    constructor(mercenaryCanvasElement, measureManager, battleSimulationManager, logicManager) {
        console.log("\uD83D\uDC65 MercenaryPanelManager initialized. Ready to display mercenary details. \uD83D\uDC65");
        this.canvas = mercenaryCanvasElement; // ✨ 캔버스 요소를 직접 받습니다.
        this.ctx = this.canvas.getContext('2d'); // ✨ 컨텍스트를 직접 얻습니다.
        this.measureManager = measureManager;
        this.battleSimulationManager = battleSimulationManager; // 유닛 데이터를 가져오기 위함
        this.logicManager = logicManager; // ✨ LogicManager 추가

        // ✨ MeasureManager에서 그리드 행/열 정보를 가져옴
        this.gridRows = this.measureManager.get('mercenaryPanel.gridRows');
        this.gridCols = this.measureManager.get('mercenaryPanel.gridCols');
        this.numSlots = this.gridRows * this.gridCols;

        this.recalculatePanelDimensions();

        // ✨ 캔버스 크기가 MeasureManager에 의해 고정되므로, window.resize 이벤트 리스너는 제거합니다.
    }

    recalculatePanelDimensions() {
        // ✨ MeasureManager에서 패널의 고정된 너비와 높이를 가져와 캔버스 속성으로 설정
        const panelWidth = this.measureManager.get('mercenaryPanel.width');
        const panelHeight = this.measureManager.get('mercenaryPanel.height');

        this.canvas.width = panelWidth; // 캔버스 내부 드로잉 버퍼의 너비 설정
        this.canvas.height = panelHeight; // 캔버스 내부 드로잉 버퍼의 높이 설정

        this.slotWidth = this.canvas.width / this.gridCols;
        this.slotHeight = this.canvas.height / this.gridRows;
        console.log(`[MercenaryPanelManager] Panel dimensions recalculated and canvas size set to: ${this.canvas.width}x${this.canvas.height}. Slot size: ${this.slotWidth}x${this.slotHeight}`);
    }

    /**
     * 용병 패널과 그리드를 그립니다.
     * 이 메서드는 PanelEngine에 의해 호출되며, 해당 패널 캔버스의 컨텍스트를 받습니다.
     * @param {CanvasRenderingContext2D} ctx - 패널 캔버스의 2D 렌더링 컨텍스트
     */
    draw(ctx) {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;

        for (let i = 0; i <= this.gridCols; i++) {
            ctx.beginPath();
            ctx.moveTo(i * this.slotWidth, 0);
            ctx.lineTo(i * this.slotWidth, this.canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i <= this.gridRows; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * this.slotHeight);
            ctx.lineTo(this.canvas.width, i * this.slotHeight);
            ctx.stroke();
        }

        const units = this.battleSimulationManager ? this.battleSimulationManager.unitsOnGrid : [];
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < this.numSlots; i++) {
            const row = Math.floor(i / this.gridCols);
            const col = i % this.gridCols;
            const x = col * this.slotWidth + this.slotWidth / 2;
            const y = row * this.slotHeight + this.slotHeight / 2;

            if (units[i]) {
                const unit = units[i];
                ctx.fillText(`${unit.name}`, x, y - 10);
                ctx.fillText(`HP: ${unit.currentHp}/${unit.baseStats.hp}`, x, y + 10);
                if (unit.image) {
                    const imgSize = Math.min(this.slotWidth, this.slotHeight) * 0.7;
                    const imgX = col * this.slotWidth + (this.slotWidth - imgSize) / 2;
                    const imgY = row * this.slotHeight + (this.slotHeight - imgSize) / 2 - 25;
                    ctx.drawImage(unit.image, imgX, imgY, imgSize, imgSize);
                }
            } else {
                ctx.fillText(`Slot ${i + 1}`, x, y);
            }
        }
    }
}
