// js/managers/TerritoryManager.js

export class TerritoryManager {
    constructor(uiEngine) {
        console.log("\ud83c\udf33 TerritoryManager initialized. Ready to oversee the domain. \ud83c\udf33");
        this.uiEngine = uiEngine;
    }

    /**
     * \uC601\uC9C0 \uD654\uBA74\uC744 \uADF8\uB9B4\uB2E4.
     * @param {CanvasRenderingContext2D} ctx - \uCE90\uB9AD\uC2A4 2D \uB80C\uB354\uB9C1 \uCF58\uD150\uCE20
     */
    draw(ctx) {
        // UI \uC0C1\uD0DC\uAC00 'mapScreen'\uC77C \uB54C\uB9CC \uADF8\uB9AC\uB294\uB2E4.
        if (this.uiEngine.getUIState() === 'mapScreen') {
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            ctx.fillStyle = 'white';
            ctx.font = '60px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('\ub098\uc758 \uc601\uc9c0', ctx.canvas.width / 2, ctx.canvas.height / 2 - 50);

            ctx.font = '24px Arial';
            ctx.fillText('\uc601\uc9c0\uc5d0\uc11c \ubaa8\ud5d8\uc744 \uc900\ube44\ud558\uc138\uc694!', ctx.canvas.width / 2, ctx.canvas.height / 2 + 30);
        }
    }
}
