// js/managers/BattleSimulationManager.js

export class BattleSimulationManager {
    constructor(measureManager, assetLoaderManager, idManager, logicManager) {
        console.log("\u2694\ufe0f BattleSimulationManager initialized. Preparing units for battle. \u2694\ufe0f");
        this.measureManager = measureManager;
        this.assetLoaderManager = assetLoaderManager;
        this.idManager = idManager; // Keep for other potential uses, though not directly in draw
        this.logicManager = logicManager;
        this.unitsOnGrid = [];
        this.gridRows = 10; // BattleGridManager와 동일한 그리드 차원
        this.gridCols = 15;
    }

    /**
     * 유닛을 특정 그리드 타일에 배치합니다.
     * @param {object} fullUnitData - IdManager로부터 완전히 로드된 유닛 데이터
     * @param {HTMLImageElement} unitImage - 로드된 유닛의 스프라이트 이미지
     * @param {number} gridX
     * @param {number} gridY
     */
    addUnit(fullUnitData, unitImage, gridX, gridY) {
        // 유닛의 모든 필요한 데이터를 한 번에 저장합니다.
        const unitInstance = {
            id: fullUnitData.id,
            name: fullUnitData.name,
            spriteId: fullUnitData.spriteId,
            image: unitImage, // ✨ 로드된 이미지 객체를 직접 저장합니다.
            classId: fullUnitData.classId,
            gridX,
            gridY,
            // 필요한 경우 다른 데이터도 여기에 추가할 수 있습니다.
            baseStats: fullUnitData.baseStats,
            type: fullUnitData.type,
            fullUnitData: fullUnitData,
            currentHp: fullUnitData.currentHp !== undefined ? fullUnitData.currentHp : fullUnitData.baseStats.hp
        };
        this.unitsOnGrid.push(unitInstance);
        console.log(`[BattleSimulationManager] Added unit '${unitInstance.id}' at (${gridX}, ${gridY}).`);
    }

    /**
     * 유닛의 그리드 위치를 업데이트합니다.
     * @param {string} unitId - 이동할 유닛의 ID
     * @param {number} newGridX - 새로운 그리드 X 좌표
     * @param {number} newGridY - 새로운 그리드 Y 좌표
     * @returns {boolean} 이동 성공 여부
     */
    moveUnit(unitId, newGridX, newGridY) {
        const unit = this.unitsOnGrid.find(u => u.id === unitId);
        if (unit) {
            const oldX = unit.gridX;
            const oldY = unit.gridY;

            if (newGridX >= 0 && newGridX < this.gridCols &&
                newGridY >= 0 && newGridY < this.gridRows) {
                if (this.isTileOccupied(newGridX, newGridY, unitId)) {
                    console.warn(`[BattleSimulationManager] Destination tile (${newGridX}, ${newGridY}) is occupied. Move cancelled.`);
                    return false;
                }
                unit.gridX = newGridX;
                unit.gridY = newGridY;
                console.log(`[BattleSimulationManager] Unit '${unitId}' moved from (${oldX}, ${oldY}) to (${newGridX}, ${newGridY}).`);
                return true;
            } else {
                console.warn(`[BattleSimulationManager] Unit '${unitId}' attempted to move out of bounds to (${newGridX}, ${newGridY}).`);
                return false;
            }
        } else {
            console.warn(`[BattleSimulationManager] Cannot move unit '${unitId}'. Unit not found.`);
            return false;
        }
    }

    /**
     * 특정 타일이 다른 유닛에 의해 점유되어 있는지 확인합니다.
     * @param {number} gridX
     * @param {number} gridY
     * @param {string} [ignoreUnitId] - 점유 여부 확인에서 제외할 유닛 ID
     * @returns {boolean} 타일 점유 여부
     */
    isTileOccupied(gridX, gridY, ignoreUnitId = null) {
        return this.unitsOnGrid.some(u =>
            u.gridX === gridX &&
            u.gridY === gridY &&
            u.id !== ignoreUnitId &&
            u.currentHp > 0
        );
    }

    /**
     * 배틀 그리드에 배치된 모든 유닛을 그립니다.
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        const sceneContentDimensions = this.logicManager.getCurrentSceneContentDimensions();
        const contentWidth = sceneContentDimensions.width;
        const contentHeight = sceneContentDimensions.height;

        const stagePadding = this.measureManager.get('battleStage.padding');

        const gridDrawableWidth = contentWidth - 2 * stagePadding;
        const gridDrawableHeight = contentHeight - 2 * stagePadding;

        const effectiveTileSize = Math.min(
            gridDrawableWidth / this.gridCols,
            gridDrawableHeight / this.gridRows
        );

        const totalGridWidth = this.gridCols * effectiveTileSize;
        const totalGridHeight = this.gridRows * effectiveTileSize;

        const gridOffsetX = stagePadding + (gridDrawableWidth - totalGridWidth) / 2;
        const gridOffsetY = stagePadding + (gridDrawableHeight - totalGridHeight) / 2;

        for (const unit of this.unitsOnGrid) {
            // ✨ 이제 unit 객체에 이미지 자체가 포함되어 있으므로 비동기 호출 없이 바로 사용합니다.
            const image = unit.image;
            if (!image) {
                console.warn(`[BattleSimulationManager] Image not available for unit '${unit.id}'. Skipping draw.`);
                continue;
            }

            const drawX = gridOffsetX + unit.gridX * effectiveTileSize;
            const drawY = gridOffsetY + unit.gridY * effectiveTileSize;

            const imageSize = effectiveTileSize;
            const imgOffsetX = (effectiveTileSize - imageSize) / 2;
            const imgOffsetY = (effectiveTileSize - imageSize) / 2;

            ctx.drawImage(image, drawX + imgOffsetX, drawY + imgOffsetY, imageSize, imageSize);
        }
    }
}
