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

        // 1. 배틀 스테이지의 실제 크기와 위치 계산
        const stageWidthRatio = this.measureManager.get('battleStage.widthRatio');
        const stageHeightRatio = this.measureManager.get('battleStage.heightRatio');
        const stagePadding = this.measureManager.get('battleStage.padding');

        const stageWidth = canvasWidth * stageWidthRatio;
        const stageHeight = canvasHeight * stageHeightRatio;
        const stageX = (canvasWidth - stageWidth) / 2;
        const stageY = (canvasHeight - stageHeight) / 2;

        // 2. 그리드가 그려질 수 있는 유효 영역 계산 (스테이지 내부 여백을 제외)
        const gridDrawableWidth = stageWidth - 2 * stagePadding;
        const gridDrawableHeight = stageHeight - 2 * stagePadding;

        // 3. 15x10 그리드가 이 유효 영역에 딱 맞도록 유효 타일 크기 계산
        const effectiveTileSize = Math.min(
            gridDrawableWidth / this.gridCols,
            gridDrawableHeight / this.gridRows
        );

        const totalGridWidth = this.gridCols * effectiveTileSize;
        const totalGridHeight = this.gridRows * effectiveTileSize;

        // 4. 그리드를 배틀 스테이지의 유효 영역 내 중앙에 배치
        const gridOffsetX = stageX + stagePadding + (gridDrawableWidth - totalGridWidth) / 2;
        const gridOffsetY = stageY + stagePadding + (gridDrawableHeight - totalGridHeight) / 2;

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
