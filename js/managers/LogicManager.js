// js/managers/LogicManager.js

export class LogicManager {
    constructor(measureManager, sceneManager) {
        console.log("\ud83e\uddd0 LogicManager initialized. Ready to enforce common sense. \ud83e\uddd0");
        this.measureManager = measureManager;
        this.sceneManager = sceneManager;
    }

    /**
     * \ud604\uc7ac \ud65c\uc131\ud654\ub41c \uc2fc\uc758 \uc2e4\uc81c \ucf58\ud150\uce20 \ud06c\uae30\ub97c \ubc18\ud658\ud569\ub2c8\ub2e4.
     * \uc774 \ud06c\uae30\ub294 \uce74\uba54\ub77c\uac00 \ud654\uba74\uc758 \ube48\ud73c \uc5c6\uc774 \ubcf4\uc5ec \uc788\ub294 \ubmax \uc601\uc5ed\uc744 \uc815\uc758\ud569\ub2c8\ub2e4.
     * @returns {{width: number, height: number}} \ud604\uc7ac \uc2fc \ucf58\ud150\uce20\uc758 \ub5a8\uae30 \ubc0f \ub192\uc774
     */
    getCurrentSceneContentDimensions() {
        const canvasWidth = this.measureManager.get('gameResolution.width');
        const canvasHeight = this.measureManager.get('gameResolution.height');
        const currentSceneName = this.sceneManager.getCurrentSceneName();

        // 논리 2 적용: 영지 화면과 배틀 스테이지 화면은 맵 화면 박스(캔버스)와 똑같게 한다.
        // 따라서 두 씬 모두 콘텐츠 크기는 캔버스 전체입니다.
        if (currentSceneName === 'territoryScene' || currentSceneName === 'battleScene') {
            return { width: canvasWidth, height: canvasHeight };
        }
        // 기본값 (예외 처리)
        console.warn(`[LogicManager] Unknown scene name '${currentSceneName}'. Returning canvas dimensions as content dimensions.`);
        return { width: canvasWidth, height: canvasHeight };
    }

    /**
     * \uce74\uba54\ub77c\uc758 \ubmax\/\ubc18\uc18c \uc90c \ub808\ubca8\uc744 \ubc18\ud658\ud569\ub2c8\ub2e4.
     * \ucd5c\uc18c \uc90c \ub808\ubca8\uc740 \ucf58\ud150\uce20\uac00 \ud654\uba74\uc744 \ube48\ud73c\uc5c6\uc774 \ucc44\uc6cc \ub0a8\uc544\uc788\b294\uc9c0 \ubcfc\uc218 \uc788\uac8c \ud569\ub2c8\ub2e4.
     * @returns {{minZoom: number, maxZoom: number}} \uc90c \ubc94\uc704
     */
    getZoomLimits() {
        const canvasWidth = this.measureManager.get('gameResolution.width');
        const canvasHeight = this.measureManager.get('gameResolution.height');
        const contentDimensions = this.getCurrentSceneContentDimensions();

        // 콘텐츠가 화면의 어느 한 축이라도 넘치지 않게 하는 최소 줌
        const minZoomX = canvasWidth / contentDimensions.width;
        const minZoomY = canvasHeight / contentDimensions.height;

        // 화면에 빈틈이 보이지 않도록, 콘텐츠가 화면을 완전히 덮는 최소 줌을 선택 (둘 중 큰 값)
        // 콘텐츠 크기가 캔버스 크기와 같아졌으므로, minZoom은 기본적으로 1.0이 됩니다.
        const minZoom = Math.max(minZoomX, minZoomY); // 콘텐츠가 화면보다 작을 때도 최소 줌 1.0 유지 (빈틈 방지)

        // 최대 줌은 기존 CameraEngine의 maxZoom 값을 유지 (또는 MeasureManager에서 설정 가능)
        const maxZoom = 3.0; // 임의의 최대 줌 값 (필요에 따라 MeasureManager에서 가져올 수 있음)

        return { minZoom: minZoom, maxZoom: maxZoom };
    }

    /**
     * \uc8fc\uc5b4\uc9c4 \uce74\uba54\ub77c \uc704\uce58(x, y)\ub97c \ub180\ub9c8\uc790\uc801 \uc81c\uc57d \uc870\uac74\uc5d0 \ub9de\uac8c \uc870\uc815\ud569\ub2c8\ub2e4.
     * \uc774\ub294 \ud654\uba74\uc5d0 \ube48\ud73c\uc774 \ubcf4\uc774\uc9c0 \uc54a\ub3c4\ub85d \uce74\uba54\ub77c \uc774\ub3d9\uc744 \uc81c\ud55c\ud569\ub2c8\ub2e4.
     * @param {number} currentX - \ud604\uc7ac \uce74\uba54\ub77c x \uc704\uce58
     * @param {number} currentY - \ud604\uc7ac \uce74\uba54\ub77c y \uc704\uce58
     * @param {number} currentZoom - \ud604\uc7ac \uce74\uba54\ub77c \uc90c \ub808\ubca8
     * @returns {{x: number, y: number}} \uc870\uc815\ub41c \uce74\uba54\ub77c \uc704\uce58
     */
    applyPanConstraints(currentX, currentY, currentZoom) {
        const canvasWidth = this.measureManager.get('gameResolution.width');
        const canvasHeight = this.measureManager.get('gameResolution.height');
        const contentDimensions = this.getCurrentSceneContentDimensions();

        const effectiveContentWidth = contentDimensions.width * currentZoom;
        const effectiveContentHeight = contentDimensions.height * currentZoom;

        let clampedX = currentX;
        let clampedY = currentY;

        // X축 제약
        if (effectiveContentWidth < canvasWidth) {
            // 콘텐츠가 화면보다 작으면 중앙 정렬 (이 경우 LogicManager가 캔버스 크기를 콘텐츠로 정의했으므로, 이 조건은 currentZoom < 1.0일 때만 발생)
            clampedX = (canvasWidth - effectiveContentWidth) / 2;
        } else {
            // 콘텐츠가 화면보다 크면 이동 범위 제한
            clampedX = Math.min(0, Math.max(currentX, canvasWidth - effectiveContentWidth));
        }

        // Y축 제약
        if (effectiveContentHeight < canvasHeight) {
            // 콘텐츠가 화면보다 작으면 중앙 정렬
            clampedY = (canvasHeight - effectiveContentHeight) / 2;
        } else {
            // 콘텐츠가 화면보다 크면 이동 범위 제한
            clampedY = Math.min(0, Math.max(currentY, canvasHeight - effectiveContentHeight));
        }

        return { x: clampedX, y: clampedY };
    }
}
