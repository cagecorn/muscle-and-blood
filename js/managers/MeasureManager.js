// js/managers/MeasureManager.js

export class MeasureManager {
    constructor() {
        console.log(" 측정 매니저 초기화됨. 모든 것을 측정할 준비 완료. 🎛️");

        // 게임의 모든 사이즈 관련 설정을 이곳에 정의
        this._measurements = {
            tileSize: 512, // 맵 타일의 기본 사이즈 (이 값은 이제 BattleGridManager에서 직접 사용되지 않고, 기본 타일 사이즈의 개념으로 유지)
            mapGrid: { rows: 9, cols: 16 }, // ✨ 그리드 비율을 16:9로 변경
            gameResolution: {
                width: 1280,
                height: 720
            },
            ui: {
                mapPanelWidthRatio: 0.7,
                mapPanelHeightRatio: 0.9,
                buttonHeight: 50, // 이전 절대값, 하위 비율 설정과 함께 유지
                buttonWidth: 200,
                buttonMargin: 10,
                // ✨ 비율 기반 UI 크기 정의
                buttonHeightRatio: 0.07,  // 게임 높이의 7%
                buttonWidthRatio: 0.20,   // 게임 너비의 20%
                buttonMarginRatio: 0.015, // 게임 높이의 1.5%
                fontSizeRatio: 0.03       // 폰트 크기 비율 (게임 높이의 3%)
            },
            // 새로운 설정: 배틀 스테이지 관련
            battleStage: {
                // widthRatio, heightRatio는 이제 LogicManager에서 캔버스 전체로 간주합니다.
                // 이 값들은 더 이상 BattleStageManager에서 직접 사용되지 않지만, 다른 곳에서 참조될 수 있으므로 유지합니다.
                widthRatio: 1.0, // 논리적으로 캔버스 전체를 채움
                heightRatio: 1.0, // 논리적으로 캔버스 전체를 채움
                padding: 40 // 배틀 스테이지 내부 여백 (그리드가 이 여백 안에 그려짐)
            },
            // ✨ 용병 패널 관련 설정 업데이트
            mercenaryPanel: {
                baseSlotSize: 100,
                gridRows: 2,
                gridCols: 6,
                heightRatio: 0.25,
                // ✨ 패널 내부 텍스트 크기 비율
                unitTextFontSizeRatio: 0.04
            },
            // ✨ 전투 로그 관련 설정 추가
            combatLog: {
                heightRatio: 0.15,
                lineHeight: 20, // 절대값 (호환용)
                padding: 10,
                // ✨ 줄 높이를 게임 높이 비율로 표현
                lineHeightRatio: 0.025
            },
            // ✨ 시각 효과 관련 설정 추가
            vfx: {
                hpBarWidthRatio: 0.8,
                hpBarHeightRatio: 0.1,
                hpBarVerticalOffset: 5,
                barrierBarWidthRatio: 0.8,
                barrierBarHeightRatio: 0.05,
                barrierBarVerticalOffset: 0.1,
                damageNumberFloatSpeed: 0.05,
                damageNumberBaseFontSize: 20,
                damageNumberScaleFactor: 5,
                damageNumberVerticalOffset: 5,
                weaponDropScale: 0.5,
                weaponDropStartOffsetY: 0.5,
                weaponDropEndOffsetY: 0.8,
                weaponDropPopDuration: 300,
                weaponDropFallDuration: 500,
                weaponDropFadeDuration: 500,
                weaponDropTotalDuration: 1300
            },
            // ✨ 새로운 게임 설정 섹션
            gameConfig: {
                enableDisarmSystem: true // 무장해제 시스템 활성화 여부
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

    /**
     * 게임의 해상도(캔버스 크기)를 업데이트합니다.
     * @param {number} width - 새로운 너비
     * @param {number} height - 새로운 높이
     */
    updateGameResolution(width, height) {
        this._measurements.gameResolution.width = width;
        this._measurements.gameResolution.height = height;
        console.log(`[MeasureManager] Game resolution updated to: ${width}x${height}`);
    }
}
