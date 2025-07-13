// js/managers/BattleStageManager.js

export class BattleStageManager {
    constructor() {
        console.log("🏟️ BattleStageManager initialized. Preparing the arena. 🏟️");
    }

    /**
     * \uc804\ud22c \uc2a4\ud14c\uc774\uc9c0\ub97c \uadf8\ub9bd\ub2c8\ub2e4.
     * @param {CanvasRenderingContext2D} ctx - \uce90\ub098\uc2a4 2D \ub80c\ub354\ub9c1 \ucee8\ud14d\uc2a4\ud2b8
     */
    draw(ctx) {
        // 캔버스의 논리적(CSS) 너비와 높이를 가져옵니다.
        // ctx.canvas.width는 실제 픽셀 너비이므로, pixelRatio로 나누어 논리적 너비를 얻습니다.
        const logicalWidth = ctx.canvas.width / (window.devicePixelRatio || 1);
        const logicalHeight = ctx.canvas.height / (window.devicePixelRatio || 1);

        ctx.fillStyle = '#6A5ACD'; // 전투 스테이지 배경색 (보라색)
        ctx.fillRect(0, 0, logicalWidth, logicalHeight); // 논리적 크기를 사용하여 배경 채움

        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // 텍스트를 캔버스 중앙에 배치 (논리적 크기 사용)
        ctx.fillText('전투가 시작됩니다!', logicalWidth / 2, logicalHeight / 2);
    }
}
