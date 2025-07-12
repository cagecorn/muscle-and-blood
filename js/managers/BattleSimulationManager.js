// js/managers/BattleSimulationManager.js

export class BattleSimulationManager {
    constructor(measureManager, assetLoaderManager, idManager, logicManager) {
        console.log("\u2694\ufe0f BattleSimulationManager initialized. Preparing units for battle. \u2694\ufe0f");
        this.measureManager = measureManager;
        this.assetLoaderManager = assetLoaderManager;
        this.idManager = idManager;
        this.logicManager = logicManager;
        this.unitsOnGrid = [];
        this.gridRows = 10; // BattleGridManager와 동일한 그리드 차원
        this.gridCols = 15;
    }

    /**
     * 유닛을 특정 그리드 타일에 배치합니다.
     * @param {string} unitId
     * @param {number} gridX
     * @param {number} gridY
     * @param {object} [additionalData={}]
     */
    addUnit(unitId, gridX, gridY, additionalData = {}) {
        const unitData = { unitId, gridX, gridY, ...additionalData };
        this.unitsOnGrid.push(unitData);
        console.log(`[BattleSimulationManager] Added unit '${unitId}' at (${gridX}, ${gridY}).`);
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
            this.idManager.get(unit.unitId).then(fullUnitData => {
                if (fullUnitData && fullUnitData.spriteId) {
                    const image = this.assetLoaderManager.getImage(fullUnitData.spriteId);
                    if (image) {
                        const drawX = gridOffsetX + unit.gridX * effectiveTileSize;
                        const drawY = gridOffsetY + unit.gridY * effectiveTileSize;

                        const imageSize = effectiveTileSize;
                        const imgOffsetX = (effectiveTileSize - imageSize) / 2;
                        const imgOffsetY = (effectiveTileSize - imageSize) / 2;

                        ctx.drawImage(image, drawX + imgOffsetX, drawY + imgOffsetY, imageSize, imageSize);
                    } else {
                        console.warn(`[BattleSimulationManager] Image for spriteId '${fullUnitData.spriteId}' not loaded for unit '${unit.unitId}'.`);
                    }
                } else {
                    console.warn(`[BattleSimulationManager] Full unit data or spriteId not found for unit '${unit.unitId}'.`);
                }
            }).catch(error => {
                console.error(`[BattleSimulationManager] Error retrieving unit data for '${unit.unitId}':`, error);
            });
        }
    }
}
