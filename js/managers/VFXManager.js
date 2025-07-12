// js/managers/VFXManager.js

export class VFXManager {
    constructor(renderer, measureManager, cameraEngine, battleSimulationManager) {
        console.log("\u2728 VFXManager initialized. Ready to render visual effects. \u2728");
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.cameraEngine = cameraEngine;
        this.battleSimulationManager = battleSimulationManager;
    }

    /**
     * 특정 유닛의 HP 바를 그립니다.
     * @param {CanvasRenderingContext2D} ctx
     * @param {object} unit
     * @param {number} effectiveTileSize
     * @param {number} gridOffsetX
     * @param {number} gridOffsetY
     */
    drawHpBar(ctx, unit, effectiveTileSize, gridOffsetX, gridOffsetY) {
        if (!unit || !unit.fullUnitData) {
            console.warn("[VFXManager] Cannot draw HP bar: unit or fullUnitData is missing.", unit);
            return;
        }

        const maxHp = unit.fullUnitData.baseStats.hp;
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
     * 모든 활성 시각 효과를 그립니다.
     * @param {CanvasRenderingContext2D} ctx
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
