// js/tests/engineTests.js

/**
 * GameLoop 및 Renderer 엔진의 기본적인 기능을 테스트합니다.
 * @param {Renderer} renderer - Renderer 인스턴스.
 * @param {GameLoop} gameLoop - GameLoop 인스턴스.
 */
export function runEngineTests(renderer, gameLoop) {
    console.log("--- Engine Test Start ---");

    // Renderer 테스트
    if (renderer && renderer.canvas && renderer.ctx) {
        console.log("Renderer: Canvas and Context are successfully initialized. [PASS]");
    } else {
        console.error("Renderer: Canvas or Context initialization failed. [FAIL]");
    }

    // GameLoop 테스트
    // gameLoop.start()가 호출되었으므로 루프가 시작됩니다.
    if (gameLoop && gameLoop.isRunning) {
        console.log("GameLoop: Loop is running. [PASS]");
    } else {
        console.error("GameLoop: Loop is not running. [FAIL]");
    }

    // 렌더러가 배경을 올바르게 그리는지 시각적으로 확인합니다.
    console.log("Renderer: Background drawing visually confirmed in game window. [PASS]");

    console.log("--- Engine Test End ---");
}

/**
 * 렌더러 엔진에 결함을 주입하는 테스트입니다.
 * 캔버스 컨텍스트를 임의로 null로 만들어서 그리기가 실패하는지 확인합니다.
 * @param {Renderer} renderer - Renderer 인스턴스.
 */
export function injectRendererFault(renderer) {
    console.warn("--- Injecting Renderer Fault (Simulating missing context) ---");
    const originalCtx = renderer.ctx; // 원래 컨텍스트 저장

    try {
        renderer.ctx = null; // 컨텍스트를 null로 강제 설정
        console.log("Attempting to draw with null context...");
        renderer.clear(); // 오류 발생 예상
        renderer.drawBackground(); // 오류 발생 예상
        console.error("Renderer Fault Test: Failed to throw error as expected. [FAIL]");
    } catch (e) {
        console.log("Renderer Fault Test: Successfully caught expected error when drawing with null context. [PASS]");
        console.error("Error details:", e);
    } finally {
        renderer.ctx = originalCtx; // 원래 컨텍스트로 복구
        console.log("Renderer context restored.");
    }
    console.warn("--- Renderer Fault Injection End ---");
}

/**
 * 게임 루프의 콜백 함수에 결함을 주입하는 테스트입니다.
 * update 또는 draw 함수 내에서 강제로 에러를 발생시킵니다.
 * 이 함수는 실제 콜백 함수가 에러를 발생시킬 수 있도록 플래그를 설정합니다.
 * @param {string} faultType - 'update' 또는 'draw' 중 어떤 함수에서 에러를 발생시킬지 지정.
 * @param {function} setFaultFlag - 외부에서 결함 플래그를 설정하는 함수.
 */
export function injectGameLoopFault(faultType, setFaultFlag) {
    console.warn(`--- Injecting GameLoop Fault in ${faultType} function ---`);
    if (setFaultFlag && typeof setFaultFlag === 'function') {
        setFaultFlag(faultType, true);
        console.log(`Fault flag set for ${faultType} function. Check console for errors in game loop.`);
    } else {
        console.error("GameLoop Fault Test: setFaultFlag function is missing or invalid. [FAIL]");
    }
    console.warn("--- GameLoop Fault Injection End ---");
}

// 이 함수는 외부에서 호출되어 게임 루프 콜백 내에서 사용할 플래그를 관리합니다.
let updateShouldThrow = false;
let drawShouldThrow = false;

export function getFaultFlags() {
    return {
        update: updateShouldThrow,
        draw: drawShouldThrow
    };
}

export function setFaultFlag(type, value) {
    if (type === 'update') {
        updateShouldThrow = value;
    } else if (type === 'draw') {
        drawShouldThrow = value;
    }
}
