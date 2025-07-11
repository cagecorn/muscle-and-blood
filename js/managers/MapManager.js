// js/managers/MapManager.js

export class MapManager {
    constructor(measureManager) {
        console.log("\ud83d\udddc\ufe0f MapManager initialized. Ready to build worlds. \ud83d\udddc\ufe0f");
        this.measureManager = measureManager;

        // 측정값을 기반으로 초기 맵 크기를 계산
        this._recalculateMapDimensions();

        this.mapData = this._generateRandomMap();
        this.pathfindingEngine = this._createPathfindingEngine();

        console.log(`[MapManager] Map grid: ${this.gridCols}x${this.gridRows}, Tile size: ${this.tileSize}`);
    }

    /**
     * 맵의 그리드 및 타일 크기를 MeasureManager로부터 다시 계산합니다.
     * 측정값이 변경된 경우 호출됩니다.
     */
    _recalculateMapDimensions() {
        console.log("[MapManager] Recalculating map dimensions based on MeasureManager...");
        this.gridRows = this.measureManager.get('mapGrid.rows');
        this.gridCols = this.measureManager.get('mapGrid.cols');
        this.tileSize = this.measureManager.get('tileSize');
    }

    _createPathfindingEngine() {
        console.log("[MapManager] Small Engine: Pathfinding Engine created.");
        return {
            findPath: (startX, startY, endX, endY) => {
                if (startX === endX || startY === endY) {
                    console.log(`[PathfindingEngine] Found a simple path from (${startX},${startY}) to (${endX},${endY}).`);
                    return true;
                } else {
                    console.warn(`[PathfindingEngine] No simple path found from (${startX},${startY}) to (${endX},${endY}).`);
                    return false;
                }
            },
            isValidTile: (x, y) => {
                return x >= 0 && x < this.gridCols && y >= 0 && y < this.gridRows && this.mapData[y][x] !== 'obstacle';
            }
        };
    }

    _generateRandomMap() {
        const map = [];
        for (let y = 0; y < this.gridRows; y++) {
            const row = [];
            for (let x = 0; x < this.gridCols; x++) {
                row.push(Math.random() < 0.1 ? 'obstacle' : 'grass');
            }
            map.push(row);
        }
        console.log("[MapManager] Random map generated.");
        return map;
    }

    getTileType(x, y) {
        if (this.pathfindingEngine.isValidTile(x, y)) {
            return this.mapData[y][x];
        }
        return null;
    }

    getMapRenderData() {
        return {
            mapData: this.mapData,
            gridCols: this.gridCols,
            gridRows: this.gridRows,
            tileSize: this.tileSize
        };
    }

    /**
     * 맵 패널에 배경과 타일을 그립니다. UIEngine에서 호출되어
     * "1층 게임 화면"을 담당합니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 렌더링 컨텍스트
     * @param {number} offsetX - 그리기 시작할 X 오프셋
     * @param {number} offsetY - 그리기 시작할 Y 오프셋
     * @param {number} panelWidth - 맵 패널의 너비
     * @param {number} panelHeight - 맵 패널의 높이
     */
    draw(ctx, offsetX, offsetY, panelWidth, panelHeight) {
        // 맵 패널 전체를 채우는 기본 배경색
        ctx.fillStyle = '#6B8E23';
        ctx.fillRect(offsetX, offsetY, panelWidth, panelHeight);

        // 타일 단위로 맵을 그림
        const tileWidth = panelWidth / this.gridCols;
        const tileHeight = panelHeight / this.gridRows;

        for (let y = 0; y < this.gridRows; y++) {
            for (let x = 0; x < this.gridCols; x++) {
                const tileType = this.mapData[y][x];
                const tileX = offsetX + x * tileWidth;
                const tileY = offsetY + y * tileHeight;

                if (tileType === 'obstacle') {
                    ctx.fillStyle = '#8B4513';
                } else {
                    ctx.fillStyle = '#A0C060';
                }
                ctx.fillRect(tileX, tileY, tileWidth, tileHeight);
            }
        }

        console.log('[MapManager] Map drawn.');
    }

    // 테스트를 위해 그리드 크기와 타일 크기를 반환합니다.
    getGridDimensions() {
        return {
            rows: this.gridRows,
            cols: this.gridCols
        };
    }

    getTileSize() {
        return this.tileSize;
    }
}
