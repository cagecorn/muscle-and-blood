// js/managers/BattleGridManager.js

export class BattleGridManager {
    constructor(measureManager, logicManager) {
        console.log("\uD83D\uDCDC BattleGridManager initialized. Ready to draw the battlefield grid. \uD83D\uDCDC");
        this.measureManager = measureManager;
        this.logicManager = logicManager;
        this.gridRows = 10;
        this.gridCols = 15;
    }

    /**
     * 전투 그리드를 그립니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     */
    draw(ctx) {
        const sceneContentDimensions = this.logicManager.getCurrentSceneContentDimensions();
        const contentWidth = sceneContentDimensions.width;
        const contentHeight = sceneContentDimensions.height;

        const stagePadding = this.measureManager.get('battleStage.padding');

        const gridDrawableWidth = contentWidth - 2 * stagePadding;
        const gridDrawableHeight = contentHeight - 2 * stagePadding;

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
