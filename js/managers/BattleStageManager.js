// js/managers/BattleStageManager.js

export class BattleStageManager {
    constructor() {
        console.log("\ud83c\udfdf\ufe0f BattleStageManager initialized. Preparing the arena. \ud83c\udfdf\ufe0f");
    }

    draw(ctx) {
        ctx.fillStyle = '#6A5ACD';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('전투가 시작됩니다!', ctx.canvas.width / 2, ctx.canvas.height / 2);
    }
}
