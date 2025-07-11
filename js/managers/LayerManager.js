// js/managers/LayerManager.js

export class LayerManager {
    constructor(renderer, measureManager, gridManager, uiManager, cameraManager) {
        console.log("\uD83C\uDFA8 LayerManager initialized. Orchestrating drawing order. \uD83C\uDFA8");
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.gridManager = gridManager;
        this.uiManager = uiManager;
        this.cameraManager = cameraManager;

        this.ctx = renderer.ctx;
        this.canvas = renderer.canvas;

        // 색상 및 레이아웃 설정 값을 MeasureManager로부터 가져옴
        this.gameScreenColor = measureManager.get('colors.gameScreen');
        this.mapPanelColor = measureManager.get('ui.mapPanelColor');
        this.mapPanelRect = uiManager.getMapPanelRect();

        // 그리드 정보는 GridManager가 보유한 MapManager에서 참조
        this.mapManager = gridManager.mapManager;
        this.mapPixelWidth = this.mapManager.getGridDimensions().cols * this.mapManager.getTileSize();
        this.mapPixelHeight = this.mapManager.getGridDimensions().rows * this.mapManager.getTileSize();
        this.gridPaddingY = this.measureManager.get('gridPaddingY');
    }

    drawLayers() {
        // Layer 0: 기본 배경 지우기
        this.renderer.clear();
        this.renderer.drawBackground();

        // Layer 1: 맵 패널 자체(검정색) - 게임 화면의 컨테이너 역할
        this.ctx.save();
        this.ctx.fillStyle = this.mapPanelColor;
        this.ctx.fillRect(
            this.mapPanelRect.x,
            this.mapPanelRect.y,
            this.mapPanelRect.width,
            this.mapPanelRect.height
        );
        this.ctx.restore();

        // Layer 2: 카메라가 움직이는 게임 세계 배경 (노랑색)
        const cameraTransform = this.cameraManager.getTransform();
        this.ctx.save();
        this.ctx.translate(cameraTransform.x, cameraTransform.y);
        this.ctx.scale(cameraTransform.zoom, cameraTransform.zoom);

        this.ctx.fillStyle = this.gameScreenColor;
        const totalGameWorldWidth = this.mapManager.getGridDimensions().cols * this.mapManager.getTileSize();
        const totalGameWorldHeight = (this.mapManager.getGridDimensions().rows * this.mapManager.getTileSize()) + (this.gridPaddingY * 2);
        this.ctx.fillRect(0, 0, totalGameWorldWidth, totalGameWorldHeight);

        // Layer 3: 그리드(빨간색) - GridManager가 자체적으로 카메라 변환을 적용함
        this.gridManager.draw(cameraTransform);

        this.ctx.restore();

        // Layer 4: UI 요소들 - 카메라 변환과 독립적으로 그려짐
        this.uiManager.draw();
    }
}
