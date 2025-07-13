// js/main.js
import { GameEngine } from './GameEngine.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        const gameEngine = new GameEngine('gameCanvas');

        // 타일 크기를 94로 조정하여 게임 해상도는 그대로 유지합니다.
        const measureManager = gameEngine.getMeasureManager();
        const mapManager = gameEngine.getMapManager();
        measureManager.set('tileSize', 94);
        mapManager.recalculateMapDimensions();
        console.log('타일 크기가 94로 조정되었습니다.');

        gameEngine.eventManager.setGameRunningState(true); // ✨ 게임 시작 시 상태 설정
        gameEngine.start();
    } catch (error) {
        console.error("Fatal Error: Game Engine failed to start.", error);
        alert("\uAC8C\uC784 \uC2DC\uC791 \uC911 \uCE58\uBA85\uC801\uC778 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uCF58\uC194\uC744 \uD655\uC778\uD574\uC8FC\uC138\uC694.");
    }
});
