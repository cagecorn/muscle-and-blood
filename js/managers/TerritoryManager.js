// js/managers/TerritoryManager.js

export class TerritoryManager {
    constructor() {
        console.log("\ud83c\udf33 TerritoryManager initialized. Ready to oversee the domain. \ud83c\udf33");
    }

    draw(ctx) {
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('나의 영지', ctx.canvas.width / 2, ctx.canvas.height / 2 - 50);

        ctx.font = '24px Arial';
        ctx.fillText('영지에서 모험을 준비하세요!', ctx.canvas.width / 2, ctx.canvas.height / 2 + 30);
    }
}
