// js/managers/BattleGridManager.js

export class BattleGridManager {
    constructor(measureManager) {
        console.log("\ud83d\udcdc BattleGridManager initialized. Ready to draw the battlefield grid. \ud83d\udcdc");
        this.measureManager = measureManager;
        this.gridRows = 10;
        this.gridCols = 15;
    }

    draw(ctx) {
        const tileSize = this.measureManager.get('tileSize');
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;

        const totalGridWidth = this.gridCols * tileSize;
        const totalGridHeight = this.gridRows * tileSize;
        const offsetX = (canvasWidth - totalGridWidth) / 2;
        const offsetY = (canvasHeight - totalGridHeight) / 2;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= this.gridCols; i++) {
            ctx.beginPath();
            ctx.moveTo(offsetX + i * tileSize, offsetY);
            ctx.lineTo(offsetX + i * tileSize, offsetY + totalGridHeight);
            ctx.stroke();
        }

        for (let i = 0; i <= this.gridRows; i++) {
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY + i * tileSize);
            ctx.lineTo(offsetX + totalGridWidth, offsetY + i * tileSize);
            ctx.stroke();
        }

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX, offsetY, totalGridWidth, totalGridHeight);
    }
}
