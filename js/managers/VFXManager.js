// js/managers/VFXManager.js

export class VFXManager {
    // animationManager를 추가로 받아 유닛의 애니메이션 위치를 참조합니다.
    constructor(renderer, measureManager, cameraEngine, battleSimulationManager, animationManager) {
        console.log("\u2728 VFXManager initialized. Ready to render visual effects. \u2728");
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.cameraEngine = cameraEngine;
        this.battleSimulationManager = battleSimulationManager; // 유닛 데이터를 가져오기 위함
        this.animationManager = animationManager; // ✨ AnimationManager 저장
    }

    /**
     * 특정 유닛의 HP 바를 그립니다.
     * 실제 그리기 위치는 AnimationManager로 계산된 값을 사용합니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     * @param {object} unit - HP 바를 그릴 유닛 객체
     * @param {number} effectiveTileSize - 유닛이 그려지는 타일의 유효 크기
     * @param {number} actualDrawX - 애니메이션이 적용된 x 좌표
     * @param {number} actualDrawY - 애니메이션이 적용된 y 좌표
     */
    drawHpBar(ctx, unit, effectiveTileSize, actualDrawX, actualDrawY) {
        if (!unit || !unit.baseStats) {
            console.warn("[VFXManager] Cannot draw HP bar: unit data is missing.", unit);
            return;
        }

        const maxHp = unit.baseStats.hp;
        const currentHp = unit.currentHp !== undefined ? unit.currentHp : maxHp;
        const hpRatio = currentHp / maxHp;

        const barWidth = effectiveTileSize * 0.8;
        const barHeight = effectiveTileSize * 0.1;
        const barOffsetY = -barHeight - 5; // 유닛 이미지 위에 위치

        const hpBarDrawX = actualDrawX + (effectiveTileSize - barWidth) / 2;
        const hpBarDrawY = actualDrawY + barOffsetY;

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
            // ✨ AnimationManager를 통해 현재 애니메이션이 적용된 위치를 조회합니다.
            const { drawX, drawY } = this.animationManager.getRenderPosition(
                unit.id,
                unit.gridX,
                unit.gridY,
                effectiveTileSize,
                gridOffsetX,
                gridOffsetY
            );
            this.drawHpBar(ctx, unit, effectiveTileSize, drawX, drawY);
        }
    }
}
