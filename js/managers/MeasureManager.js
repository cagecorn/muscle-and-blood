// js/managers/MeasureManager.js

export class MeasureManager {
    constructor() {
        console.log("\ud83d\udccf MeasureManager initialized. Ready to measure all things. \ud83d\udccf");

        // 게임의 모든 사이즈 관련 설정을 이곳에 정의
        this._measurements = {
            tileSize: 512, // 맵 타일의 기본 사이즈
            mapGrid: { rows: 10, cols: 15 }, // 맵 그리드의 행/열
            gameResolution: {
                width: 1280,
                height: 720
            },
            ui: {
                mapPanelWidthRatio: 0.7,
                mapPanelHeightRatio: 0.9,
                buttonHeight: 50,
                buttonWidth: 200,
                buttonMargin: 10
            },
            // 새로 추가된 배틀 스테이지 크기와 내부 여백 설정
            battleStage: {
                widthRatio: 0.9, // 캔버스 너비 대비 배틀 스테이지 너비 비율
                heightRatio: 0.8, // 캔버스 높이 대비 배틀 스테이지 높이 비율
                padding: 40 // 배틀 스테이지 내부 여백 (그리드가 이 여백 안에 그려진다)
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
