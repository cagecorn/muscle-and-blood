// js/managers/VFXManager.js

export class VFXManager {
    constructor(renderer, measureManager, cameraEngine, battleSimulationManager) {
        console.log("\u2728 VFXManager initialized. Ready to render visual effects. \u2728");
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.cameraEngine = cameraEngine;
        this.battleSimulationManager = battleSimulationManager; // 유닛 데이터를 가져오기 위함
    }

    /**
     * 특정 유닛의 HP 바를 그립니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     * @param {object} unit - HP 바를 그릴 유닛 객체
     * @param {number} effectiveTileSize - 유닛이 그려지는 타일의 유효 크기
     * @param {number} gridOffsetX - 그리드 전체의 x 오프셋
     * @param {number} gridOffsetY - 그리드 전체의 y 오프셋
     */
    drawHpBar(ctx, unit, effectiveTileSize, gridOffsetX, gridOffsetY) {
        if (!unit || !unit.baseStats) {
            console.warn("[VFXManager] Cannot draw HP bar: unit data is missing.", unit);
            return;
        }

        const maxHp = unit.baseStats.hp;
        const currentHp = unit.currentHp !== undefined ? unit.currentHp : maxHp;
        const hpRatio = currentHp / maxHp;

        const barWidth = effectiveTileSize * 0.8;
        const barHeight = effectiveTileSize * 0.1;
        const barOffsetY = -barHeight - 5;

        const drawX = gridOffsetX + unit.gridX * effectiveTileSize;
        const drawY = gridOffsetY + unit.gridY * effectiveTileSize;

        const hpBarDrawX = drawX + (effectiveTileSize - barWidth) / 2;
        const hpBarDrawY = drawY + barOffsetY;

        ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        ctx.fillRect(hpBarDrawX, hpBarDrawY, barWidth, barHeight);

        ctx.fillStyle = hpRatio > 0.5 ? 'lightgreen' : hpRatio > 0.2 ? 'yellow' : 'red';
        ctx.fillRect(hpBarDrawX, hpBarDrawY, barWidth * hpRatio, barHeight);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1;
        ctx.strokeRect(hpBarDrawX, hpBarDrawY, barWidth, barHeight);
    }

    /**
     * 모든 활성 시각 효과를 그립니다. 이 메서드는 LayerEngine에 의해 호출됩니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     */
    draw(ctx) {
        const sceneContentDimensions = this.battleSimulationManager.logicManager.getCurrentSceneContentDimensions();
        const contentWidth = sceneContentDimensions.width;
        const contentHeight = sceneContentDimensions.height;

        const stagePadding = this.measureManager.get('battleStage.padding');

        const gridDrawableWidth = contentWidth - 2 * stagePadding;
        const gridDrawableHeight = contentHeight - 2 * stagePadding;

        const effectiveTileSize = Math.min(
            gridDrawableWidth / this.battleSimulationManager.gridCols,
            gridDrawableHeight / this.battleSimulationManager.gridRows
        );

        const totalGridWidth = this.battleSimulationManager.gridCols * effectiveTileSize;
        const totalGridHeight = this.battleSimulationManager.gridRows * effectiveTileSize;

        const gridOffsetX = stagePadding + (gridDrawableWidth - totalGridWidth) / 2;
        const gridOffsetY = stagePadding + (gridDrawableHeight - totalGridHeight) / 2;

        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            this.drawHpBar(ctx, unit, effectiveTileSize, gridOffsetX, gridOffsetY);
        }
    }
}
