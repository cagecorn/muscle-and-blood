// js/managers/MercenaryPanelManager.js

import { Renderer } from '../Renderer.js';

export class MercenaryPanelManager {
    constructor(mercenaryCanvasId, measureManager, battleSimulationManager) {
        console.log("\uD83D\uDC65 MercenaryPanelManager initialized. Ready to display mercenary details. \uD83D\uDC65");
        this.renderer = new Renderer(mercenaryCanvasId);
        this.canvas = this.renderer.canvas;
        this.ctx = this.renderer.ctx;
        this.measureManager = measureManager;
        this.battleSimulationManager = battleSimulationManager;

        this.gridRows = 2; // 세로로 2줄
        this.gridCols = 6; // 가로로 6칸
        this.numSlots = this.gridRows * this.gridCols; // 총 12칸

        this.recalculatePanelDimensions();

        window.addEventListener('resize', this.recalculatePanelDimensions.bind(this));
    }

    recalculatePanelDimensions() {
        // CSS 크기와 캔버스 해상도를 동기화
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.slotWidth = this.canvas.width / this.gridCols;
        this.slotHeight = this.canvas.height / this.gridRows;
        console.log(`[MercenaryPanelManager] Panel dimensions recalculated. Slot size: ${this.slotWidth}x${this.slotHeight}`);
    }

    /**
     * 용병 패널과 그리드를 그립니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트 (이 매니저의 캔버스 컨텍스트)
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
