// js/managers/BattleGridManager.js

export class BattleGridManager {
    constructor(measureManager, uiEngine) {
        console.log("\ud83d\udcdc BattleGridManager initialized. Ready to draw the battlefield grid. \ud83d\udcdc");
        this.measureManager = measureManager;
        this.uiEngine = uiEngine;
        this.gridRows = 10; // \uACE0\uc815\ub41c \uADF8\ub9AC\ub4dc \ud589 \uc218
        this.gridCols = 15; // \uACE0\uc815\ub41c \uADF8\ub9AC\ub4dc \uc5f4 \uc218
    }

    /**
     * \uc804\ud22c \uadf8\ub9ac\ub4dc\ub97c \uadf8\ub9b4\ub2e4.
     * @param {CanvasRenderingContext2D} ctx - \uce90\ub9ad\uc2a4 2D \ub80c\ub354\ub9c1 \ucf58\ud150\uce20
     */
    draw(ctx) {
        // UI \uc0c1\ud0dc\uac00 'combatScreen'\uc77c \ub54c\ub9cc \uadf8\ub9ac\ub2e4.
        if (this.uiEngine.getUIState() === 'combatScreen') {
            const tileSize = this.measureManager.get('tileSize');
            const canvasWidth = ctx.canvas.width;
            const canvasHeight = ctx.canvas.height;

            // \uADF8\ub9ac\ub4dc\uAC00 \uce90\ub9ad\uc2a4 \uc911\uc559\uc5d0 \uc624\ub3cc\ub9ac\ub3c4\ub85d \uc624\ud504\uc14b \uacc4\uc0b0
            const totalGridWidth = this.gridCols * tileSize;
            const totalGridHeight = this.gridRows * tileSize;
            const offsetX = (canvasWidth - totalGridWidth) / 2;
            const offsetY = (canvasHeight - totalGridHeight) / 2;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;

            // \uc138\ub85c\uc120 \uadf8\ub9ac\uae30
            for (let i = 0; i <= this.gridCols; i++) {
                ctx.beginPath();
                ctx.moveTo(offsetX + i * tileSize, offsetY);
                ctx.lineTo(offsetX + i * tileSize, offsetY + totalGridHeight);
                ctx.stroke();
            }

            // \uac00\ub85c\uc120 \uadf8\ub9ac\uae30
            for (let i = 0; i <= this.gridRows; i++) {
                ctx.beginPath();
                ctx.moveTo(offsetX, offsetY + i * tileSize);
                ctx.lineTo(offsetX + totalGridHeight, offsetY + i * tileSize); // totalGridWidth\uac00 \uc544\ub2cc totalGridHeight\ub85c \uc218\uc815\ud574\uc11c \ub9f5 \uc804\uccb4\ub97c \ucee4\ubc84
                ctx.stroke();
            }

            // \uADF8\ub9ac\ub4dc \uc601\uc5ed \ud14c\ub450\ub9ac
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.strokeRect(offsetX, offsetY, totalGridWidth, totalGridHeight);
        }
    }
}
