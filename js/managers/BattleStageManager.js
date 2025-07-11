// js/managers/BattleStageManager.js

export class BattleStageManager {
    constructor(uiEngine) {
        console.log("\ud83c\udfdf\ufe0f BattleStageManager initialized. Preparing the arena. \ud83c\udfdf\ufe0f");
        this.uiEngine = uiEngine;
    }

    /**
     * \uc804\ud22c \uc2a4\ud14c\uc774\uc9c0\ub97c \uadf8\ub9b4\ub2e4.
     * @param {CanvasRenderingContext2D} ctx - \uce90\ub9ad\uc2a4 2D \ub80c\ub354\ub9c1 \ucf58\ud150\uce20
     */
    draw(ctx) {
        // UI \uc0c1\ud0dc\uac00 'combatScreen'\uc77c \ub54c\ub9cc \uadf8\ub9ac\ub2e4.
        if (this.uiEngine.getUIState() === 'combatScreen') {
            ctx.fillStyle = '#6A5ACD';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            ctx.fillStyle = 'white';
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('\uc804\ud22c\uac00 \uc2dc\uc791\ub429\ub2c8\ub2e4!', ctx.canvas.width / 2, ctx.canvas.height / 2);
        }
    }
}
