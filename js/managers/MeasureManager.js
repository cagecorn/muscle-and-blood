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
                // 새로운 UI 비율 정의 (게임 해상도에 대한 비율)
                buttonHeightRatio: 0.07,
                buttonWidthRatio: 0.20,
                buttonMarginRatio: 0.015,
                fontSizeRatio: 0.03
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
                unitTextFontSizeRatio: 0.04,
                // ✨ 새로운 용병 패널 내부 매직 넘버 상수화
                unitHpFontSizeScale: 0.8, // HP 폰트 크기 비율 (기본 텍스트 폰트의 80%)
                unitTextOffsetYScale: 0.8, // 유닛 이름 텍스트 y 오프셋 비율
                unitImageScale: 0.7, // 유닛 이미지 크기 비율 (슬롯 크기의 70%)
                unitImageOffsetYScale: 1.5 // 유닛 이미지 y 오프셋 비율
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
                // HP/Barrier Bar 관련
                hpBarWidthRatio: 0.8,      // HP 바 너비 (타일 크기의 80%)
                hpBarHeightRatio: 0.1,     // HP 바 높이 (타일 크기의 10%)
                hpBarVerticalOffset: 5,    // HP 바 수직 오프셋 (픽셀)
                barrierBarWidthRatio: 0.8, // 배리어 바 너비 (타일 크기의 80%)
                barrierBarHeightRatio: 0.05, // 배리어 바 높이 (타일 크기의 5%)
                barrierBarVerticalOffset: 8, // 배리어 바 수직 오프셋 (픽셀)

                // 데미지 숫자 팝업 관련
                damageNumberDuration: 1000,     // 데미지 숫자 팝업 지속 시간 (ms)
                damageNumberFloatSpeed: 0.05,   // 데미지 숫자 부유 속도
                damageNumberBaseFontSize: 20,   // 데미지 숫자 기본 폰트 크기
                damageNumberScaleFactor: 5,     // 데미지 숫자 스케일링 팩터
                damageNumberVerticalOffset: 5,  // 데미지 숫자 수직 오프셋

                // 무기 드롭 애니메이션 관련
                weaponDropScale: 0.5,           // 드롭된 무기 크기 (타일 크기의 50%)
                weaponDropStartOffsetY: 0.5,    // 무기 드롭 시작 Y 오프셋 (타일 높이의 50% 위)
                weaponDropEndOffsetY: 0.8,      // 무기 드롭 끝 Y 오프셋 (타일 높이의 80% 아래)
                weaponDropPopDuration: 300,     // 무기 튀어 오르는 시간 (ms)
                weaponDropFallDuration: 500,    // 무기 떨어지는 시간 (ms)
                weaponDropFadeDuration: 500,    // 무기 사라지는 시간 (ms)
                weaponDropTotalDuration: 1300   // 무기 애니메이션 총 지속 시간 (ms)
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
