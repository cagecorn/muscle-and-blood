// js/managers/VFXManager.js

export class VFXManager {
    // animationManager를 추가로 받아 유닛의 애니메이션 위치를 참조합니다.
    constructor(renderer, measureManager, cameraEngine, battleSimulationManager, animationManager, eventManager) {
        console.log("\u2728 VFXManager initialized. Ready to render visual effects. \u2728");
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.cameraEngine = cameraEngine;
        this.battleSimulationManager = battleSimulationManager; // 유닛 데이터를 가져오기 위함
        this.animationManager = animationManager; // ✨ AnimationManager 저장
        this.eventManager = eventManager;

        this.activeDamageNumbers = [];

        // ✨ subscribe to damage display events
        this.eventManager.subscribe('displayDamage', (data) => {
            this.addDamageNumber(data.unitId, data.damage);
        });
    }

    /**
     * 특정 유닛 위에 데미지 숫자를 표시하도록 큐에 추가합니다.
     * @param {string} unitId
     * @param {number} damageAmount
     */
    addDamageNumber(unitId, damageAmount) {
        const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === unitId);
        if (!unit) {
            console.warn(`[VFXManager] Cannot show damage for unknown unit: ${unitId}`);
            return;
        }

        this.activeDamageNumbers.push({
            unitId: unitId,
            damage: damageAmount,
            startTime: performance.now(),
            duration: 1000,
            floatSpeed: 0.05
        });
        console.log(`[VFXManager] Added damage number: ${damageAmount} for ${unit.name}`);
    }

    /**
     * ✨ 활성 데미지 숫자의 상태를 업데이트합니다.
     * @param {number} deltaTime
     */
    update(deltaTime) {
        const currentTime = performance.now();
        this.activeDamageNumbers = this.activeDamageNumbers.filter(dmgNum => {
            return currentTime - dmgNum.startTime < dmgNum.duration;
        });
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
     * ✨ 특정 유닛의 배리어 바를 그립니다 (HP 바 아래에 노란색 게이지).
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     * @param {object} unit - 배리어 바를 그릴 유닛 객체
     * @param {number} effectiveTileSize - 유닛이 그려지는 타일의 유효 크기
     * @param {number} actualDrawX - 유닛의 실제 렌더링 x 좌표 (애니메이션이 적용된)
     * @param {number} actualDrawY - 유닛의 실제 렌더링 y 좌표 (애니메이션이 적용된)
     */
    drawBarrierBar(ctx, unit, effectiveTileSize, actualDrawX, actualDrawY) {
        if (!unit || unit.currentBarrier === undefined || unit.maxBarrier === undefined) {
            return;
        }

        const currentBarrier = unit.currentBarrier;
        const maxBarrier = unit.maxBarrier;
        const barrierRatio = maxBarrier > 0 ? currentBarrier / maxBarrier : 0;

        const barWidth = effectiveTileSize * 0.8;
        const barHeight = effectiveTileSize * 0.05;
        const barOffsetY = effectiveTileSize * 0.1 + 8;

        const barrierBarDrawX = actualDrawX + (effectiveTileSize - barWidth) / 2;
        const barrierBarDrawY = actualDrawY + barOffsetY;

        ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        ctx.fillRect(barrierBarDrawX, barrierBarDrawY, barWidth, barHeight);

        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(barrierBarDrawX, barrierBarDrawY, barWidth * barrierRatio, barHeight);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1;
        ctx.strokeRect(barrierBarDrawX, barrierBarDrawY, barWidth, barHeight);
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
            this.drawBarrierBar(ctx, unit, effectiveTileSize, drawX, drawY); // ✨ 배리어 바 그리기 호출
        }

        // ✨ 데미지 숫자 그리기
        const currentTime = performance.now();
        for (const dmgNum of this.activeDamageNumbers) {
            const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === dmgNum.unitId);
            if (!unit) continue;

            const { drawX, drawY } = this.animationManager.getRenderPosition(
                unit.id,
                unit.gridX,
                unit.gridY,
                effectiveTileSize,
                gridOffsetX,
                gridOffsetY
            );

            const elapsed = currentTime - dmgNum.startTime;
            const progress = elapsed / dmgNum.duration;

            const currentYOffset = dmgNum.floatSpeed * elapsed;
            const alpha = Math.max(0, 1 - progress);

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = (dmgNum.damage > 0) ? '#FF4500' : '#ADFF2F';
            ctx.font = `bold ${20 + (1 - progress) * 5}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(
                dmgNum.damage.toString(),
                drawX + effectiveTileSize / 2,
                drawY - currentYOffset - 5
            );
            ctx.restore();
        }
    }
}
