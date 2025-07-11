// js/main.js
// GameLoop와 Renderer 모듈을 불러옵니다.
import { Renderer } from './Renderer.js';
import { GameLoop } from './GameLoop.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. 렌더러 엔진 초기화
    const renderer = new Renderer('gameCanvas');
    if (!renderer.canvas) {
        console.error("Failed to initialize Renderer. Game cannot start.");
        return;
    }
    const ctx = renderer.ctx;

    // 2. 게임 업데이트 함수 정의 (게임 논리 담당)
    const update = (deltaTime) => {
        // TODO: 게임 로직을 이곳에 추가합니다.
        // deltaTime 값을 이용하여 시간 기반 계산을 수행하면 프레임 속도와 무관한 동작이 가능합니다.
    };

    // 3. 게임 그리기 함수 정의 (화면 렌더링 담당)
    const draw = () => {
        renderer.clear();
        renderer.drawBackground();

        // 임시 데모 텍스트
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Muscle & Blood', renderer.canvas.width / 2, renderer.canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText('엔진이 정상적으로 작동 중입니다!', renderer.canvas.width / 2, renderer.canvas.height / 2 + 50);
    };

    // 4. 게임 루프 엔진 초기화 및 시작
    const gameLoop = new GameLoop(update, draw);
    gameLoop.start();
});
