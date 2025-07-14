// js/main.js
import { GameEngine } from './GameEngine.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        const gameEngine = new GameEngine('gameCanvas');
        gameEngine.eventManager.setGameRunningState(true); // ✨ 게임 시작 시 상태 설정
        gameEngine.start();

        // 영웅 패널 버튼 클릭 이벤트 리스너 추가
        const toggleHeroPanelBtn = document.getElementById('toggleHeroPanelBtn');
        if (toggleHeroPanelBtn) {
            toggleHeroPanelBtn.addEventListener('click', () => {
                gameEngine.getUIEngine().toggleHeroPanel();
            });
        } else {
            console.warn("Hero Panel toggle button not found in main.js.");
        }
    } catch (error) {
        console.error("Fatal Error: Game Engine failed to start.", error);
        alert("\uAC8C\uC784 \uC2DC\uC791 \uC911 \uCE58\uBA85\uC801\uC778 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uCF58\uC194\uC744 \uD655\uC778\uD574\uC8FC\uC138\uC694.");
    }
});
