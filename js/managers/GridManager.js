// js/managers/GridManager.js

export class GridManager {
    constructor(renderer, measureManager, mapManager) {
        console.log("\ud83d\udcc0 GridManager initialized. Ready to draw grids. \ud83d\udcc0");
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.mapManager = mapManager;

        this.ctx = renderer.ctx;
        this.gridCols = mapManager.getGridDimensions().cols;
        this.gridRows = mapManager.getGridDimensions().rows;
        this.tileSize = measureManager.get('tileSize');
        this.gridPaddingY = measureManager.get('gridPaddingY');
        this.gridColor = measureManager.get('colors.grid');
    }

    /**
     * 맵 화면에 그리드 선을 그립니다.
     * CameraManager의 변환 정보를 적용하여 현재 카메라 뷰에 맞춰 그립니다.
     * @param {{x: number, y: number, zoom: number}} cameraTransform - CameraManager로부터 받은 카메라 변환 정보
     */
    draw(cameraTransform) {
        const ctx = this.ctx;
        const totalMapWidth = this.gridCols * this.tileSize;
        const totalMapHeight = this.gridRows * this.tileSize;

        ctx.save();

        ctx.translate(cameraTransform.x, cameraTransform.y);
        ctx.scale(cameraTransform.zoom, cameraTransform.zoom);

        ctx.translate(0, this.gridPaddingY / cameraTransform.zoom);

        ctx.strokeStyle = this.gridColor;
        ctx.lineWidth = 1 / cameraTransform.zoom;

        for (let i = 0; i <= this.gridCols; i++) {
            const x = i * this.tileSize;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, totalMapHeight);
            ctx.stroke();
        }

        for (let i = 0; i <= this.gridRows; i++) {
            const y = i * this.tileSize;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(totalMapWidth, y);
            ctx.stroke();
        }

        // TODO: 타일 타입에 따른 배경색이나 이미지 그리기

        ctx.restore();
    }
}
