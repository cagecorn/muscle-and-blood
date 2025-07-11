// js/main.js
// GameLoop와 Renderer 모듈을 불러옵니다.
import { Renderer } from './Renderer.js';
import { GameLoop } from './GameLoop.js';
import { EventManager } from './managers/EventManager.js'; // <-- EventManager 불러오기

document.addEventListener('DOMContentLoaded', () => {
    // 1. 렌더러 엔진 초기화
    const renderer = new Renderer('gameCanvas');
    if (!renderer.canvas) {
        console.error("Failed to initialize Renderer. Game cannot start.");
        return;
    }
    const ctx = renderer.ctx;

    // 1. 이벤트 매니저 초기화
    const eventManager = new EventManager();

    // 예시: 메인 스레드에서 'unitDeath' 이벤트를 구독
    eventManager.subscribe('unitDeath', (data) => {
        console.log(`[Main] Oh no! Unit ${data.unitId} (${data.unitName}) has died!`);
    });
    // 예시: 메인 스레드에서 'skillExecuted' 이벤트를 구독 (워커가 스킬 발동 요청 후 발생)
    eventManager.subscribe('skillExecuted', (data) => {
        console.log(`[Main] Skill '${data.skillName}' was executed.`);
        // 추가적인 시각 효과나 상태 변화 로직을 여기서 처리할 수 있습니다.
    });


    // 게임 업데이트 함수 정의
    const update = (deltaTime) => {
        // 이곳에서 게임의 논리를 업데이트합니다.
        // 테스트용 이벤트 발생 (매 5초마다)
        if (Math.floor(performance.now() / 1000) % 5 === 0 && Math.floor(performance.now() / 1000) !== update.lastEmittedSecond) {
            eventManager.emit('unitAttack', { attackerId: 'Hero', targetId: 'Goblin', damageDealt: 15 });
            eventManager.emit('unitDeath', { unitId: 'Goblin', unitName: '고블린', unitType: 'normal' }); // 일반 유닛 사망
            eventManager.emit('unitDeath', { unitId: 'OgreBoss', unitName: '오우거 보스', unitType: 'elite' }); // 엘리트 유닛 사망
            update.lastEmittedSecond = Math.floor(performance.now() / 1000); // 중복 방지
        }
    };
    update.lastEmittedSecond = -1; // 초기값 설정

    // 게임 그리기 함수 정의
    const draw = () => {
        renderer.clear();
        renderer.drawBackground();

        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Muscle & Blood', renderer.canvas.width / 2, renderer.canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText('이벤트 매니저 작동 중...', renderer.canvas.width / 2, renderer.canvas.height / 2 + 50);
    };

    const gameLoop = new GameLoop(update, draw);
    gameLoop.start();
});
