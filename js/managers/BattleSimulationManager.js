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
            image: unitImage,
            gridX,
            gridY,
            currentHp: fullUnitData.currentHp !== undefined ? fullUnitData.currentHp : fullUnitData.baseStats.hp,
            fullUnitData: fullUnitData,
            type: fullUnitData.type
        };
        this.unitsOnGrid.push(unitInstance);
        console.log(`[BattleSimulationManager] Added unit '${unitInstance.id}' at (${gridX}, ${gridY}).`);
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
