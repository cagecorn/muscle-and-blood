// js/managers/BattleStageManager.js

export class BattleStageManager {
    constructor(measureManager) {
        console.log("\uD83C\uDFDF\uFE0F BattleStageManager initialized. Preparing the arena. \uD83C\uDFDF\uFE0F");
        this.measureManager = measureManager;
    }

    /**
     * \uc804\ud22c \uc2a4\ud14c\uc774\uc9c0\ub97c \uadf8\ub9bd\ub2c8\ub2e4.
     * @param {CanvasRenderingContext2D} ctx - \uce90\ub098\uc2a4 2D \ub80c\ub354\ub9c1 \ucee8\ud14d\uc2a4\ud2b8
     */
    draw(ctx) {
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;

        const stageWidthRatio = this.measureManager.get('battleStage.widthRatio');
        const stageHeightRatio = this.measureManager.get('battleStage.heightRatio');

        const stageWidth = canvasWidth * stageWidthRatio;
        const stageHeight = canvasHeight * stageHeightRatio;

        const stageX = (canvasWidth - stageWidth) / 2;
        const stageY = (canvasHeight - stageHeight) / 2;

        ctx.fillStyle = '#6A5ACD';
        ctx.fillRect(stageX, stageY, stageWidth, stageHeight);

        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('전투가 시작됩니다!', stageX + stageWidth / 2, stageY + stageHeight / 2);
    }
}
