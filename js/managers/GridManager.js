// js/managers/GridManager.js

export class GridManager {
    constructor(measureManager) {
        console.log("\u25a3 GridManager initialized. Ready to draw grids. \u25a3");
        this.measureManager = measureManager;
    }

    /**
     * 맵 위에 그리드 라인을 그립니다. UIEngine에서 호출되어 "2층 그리드" 역할을 합니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 렌더링 컨텍스트
     * @param {number} offsetX - 그리기 시작할 X 오프셋
     * @param {number} offsetY - 그리기 시작할 Y 오프셋
     * @param {number} panelWidth - 맵 패널의 너비
     * @param {number} panelHeight - 맵 패널의 높이
     */
    draw(ctx, offsetX, offsetY, panelWidth, panelHeight) {
        const gridRows = this.measureManager.get('mapGrid.rows');
        const gridCols = this.measureManager.get('mapGrid.cols');

        if (!gridRows || !gridCols) {
            console.warn("[GridManager] Cannot draw grid: mapGrid dimensions not found in MeasureManager.");
            return;
        }

        const tileWidth = panelWidth / gridCols;
        const tileHeight = panelHeight / gridRows;

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= gridCols; i++) {
            ctx.beginPath();
            ctx.moveTo(offsetX + i * tileWidth, offsetY);
            ctx.lineTo(offsetX + i * tileWidth, offsetY + panelHeight);
            ctx.stroke();
        }

        for (let i = 0; i <= gridRows; i++) {
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY + i * tileHeight);
            ctx.lineTo(offsetX + panelWidth, offsetY + i * tileHeight);
            ctx.stroke();
        }
        console.log("[GridManager] Grid drawn.");
    }
}
