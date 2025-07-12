// js/managers/BattleGridManager.js

export class BattleGridManager {
    constructor(measureManager) {
        console.log("\uD83D\uDCDC BattleGridManager initialized. Ready to draw the battlefield grid. \uD83D\uDCDC");
        this.measureManager = measureManager;
        this.gridRows = 10; // 고정된 그리드 행 수
        this.gridCols = 15; // 고정된 그리드 열 수
    }

    /**
     * 전투 그리드를 그립니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     */
    draw(ctx) {
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;

        // 1. 배틀 스테이지의 실제 크기와 위치는 이제 캔버스 전체입니다 (논리 2 적용).
        // 그리드 여백은 MeasureManager에서 가져옵니다.
        const stagePadding = this.measureManager.get('battleStage.padding');

        // 2. 그리드가 그려질 수 있는 유효 영역 계산 (캔버스 전체에서 패딩을 제외)
        const gridDrawableWidth = canvasWidth - 2 * stagePadding;
        const gridDrawableHeight = canvasHeight - 2 * stagePadding;

        // 3. 15x10 그리드가 이 유효 영역에 딱 맞도록 유효 타일 크기 계산
        const effectiveTileSize = Math.min(
            gridDrawableWidth / this.gridCols,
            gridDrawableHeight / this.gridRows
        );

        const totalGridWidth = this.gridCols * effectiveTileSize;
        const totalGridHeight = this.gridRows * effectiveTileSize;

        // 4. 그리드를 캔버스의 유효 영역 내 중앙에 배치
        // (캔버스 시작점 0,0 + 패딩 + 남은 공간 중앙 정렬)
        const gridOffsetX = stagePadding + (gridDrawableWidth - totalGridWidth) / 2;
        const gridOffsetY = stagePadding + (gridDrawableHeight - totalGridHeight) / 2;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;

        // 세로선 그리기
        for (let i = 0; i <= this.gridCols; i++) {
            ctx.beginPath();
            ctx.moveTo(gridOffsetX + i * effectiveTileSize, gridOffsetY);
            ctx.lineTo(gridOffsetX + i * effectiveTileSize, gridOffsetY + totalGridHeight);
            ctx.stroke();
        }

        // 가로선 그리기
        for (let i = 0; i <= this.gridRows; i++) {
            ctx.beginPath();
            ctx.moveTo(gridOffsetX, gridOffsetY + i * effectiveTileSize);
            ctx.lineTo(gridOffsetX + totalGridWidth, gridOffsetY + i * effectiveTileSize);
            ctx.stroke();
        }

        // 그리드 영역 테두리 (확인용)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(gridOffsetX, gridOffsetY, totalGridWidth, totalGridHeight);
    }
}
