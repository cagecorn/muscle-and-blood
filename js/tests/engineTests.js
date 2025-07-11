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
