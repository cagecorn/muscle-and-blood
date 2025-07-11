// js/managers/MeasureManager.js

export class MeasureManager {
    constructor() {
        console.log("\ud83d\udccf MeasureManager initialized. Ready to measure all things. \ud83d\udccf");

        // 게임의 모든 사이즈 관련 설정을 이곳에 정의
        this._measurements = {
            tileSize: 512,
            mapGrid: { rows: 10, cols: 15 },
            gameResolution: {
                width: 1280,
                height: 720
            },
            ui: {
                mapPanelWidthRatio: 0.7,
                mapPanelHeightRatio: 0.9,
                buttonHeight: 50,
                buttonWidth: 200,
                buttonMargin: 10,
                mapPanelColor: 'rgba(50, 50, 200, 0.7)'
            },
            gridPaddingY: 100,
            colors: {
                gameScreen: 'yellow',
                grid: 'red',
                background: '#333'
            }
        };
    }

    /**
     * 특정 측정값을 반환합니다.
     * 예: get('tileSize'), get('mapGrid.rows'), get('ui.mapPanelWidthRatio')
     * @param {string} keyPath - 접근할 측정값의 키 경로
     * @returns {*} 해당 측정값 또는 undefined
     */
    get(keyPath) {
        const path = keyPath.split('.');
        let current = this._measurements;
        for (let i = 0; i < path.length; i++) {
            if (current[path[i]] === undefined) {
                console.warn(`[MeasureManager] Measurement key '${keyPath}' not found. Path segment: '${path[i]}'`);
                return undefined;
            }
            current = current[path[i]];
        }
        return current;
    }

    /**
     * 측정값을 설정합니다. 신중히 사용해야 합니다.
     * @param {string} keyPath - 설정할 측정값의 키 경로
     * @param {*} value - 설정할 값
     * @returns {boolean} 성공 여부
     */
    set(keyPath, value) {
        const path = keyPath.split('.');
        let current = this._measurements;
        for (let i = 0; i < path.length - 1; i++) {
            if (current[path[i]] === undefined) {
                console.warn(`[MeasureManager] Cannot set measurement. Path '${keyPath}' does not exist.`);
                return false;
            }
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
        console.log(`[MeasureManager] Set '${keyPath}' to ${value}`);
        return true;
    }
}
