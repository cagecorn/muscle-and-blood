// js/GameEngine.js
import { Renderer } from './Renderer.js';
import { GameLoop } from './GameLoop.js';
import { EventManager } from './managers/EventManager.js';
import { GuardianManager } from './managers/GuardianManager.js';

export class GameEngine {
    constructor(canvasId) {
        console.log("\u2699\ufe0f GameEngine initializing... \u2699\ufe0f");

        // 핵심 엔진 및 매니저들 초기화
        this.renderer = new Renderer(canvasId);
        if (!this.renderer.canvas) {
            console.error("GameEngine: Failed to initialize Renderer. Game cannot proceed.");
            throw new Error("Renderer initialization failed.");
        }
        this.eventManager = new EventManager();
        this.guardianManager = new GuardianManager();

        // 게임의 핵심 로직과 렌더링 함수 정의 (GameLoop에 전달될 콜백)
        this._update = this._update.bind(this); // `this` 컨텍스트 바인딩
        this._draw = this._draw.bind(this);     // `this` 컨텍스트 바인딩

        this.gameLoop = new GameLoop(this._update, this._draw);

        // 초기 게임 데이터 및 규칙 검증
        const initialGameData = {
            units: [
                { id: 'u1', name: 'Knight', hp: 100 },
                { id: 'u2', name: 'Archer', hp: 70 }
            ],
            config: {
                resolution: { width: this.renderer.canvas.width, height: this.renderer.canvas.height },
                difficulty: 'normal'
            }
        };

        try {
            this.guardianManager.enforceRules(initialGameData);
            console.log("[GameEngine] Initial game data passed GuardianManager rules. \u2728");
        } catch (e) {
            if (e.name === "ImmutableRuleViolationError") {
                console.error("[GameEngine] CRITICAL ERROR: Game initialization failed due to immutable rule violation!", e.message);
                throw e; // 게임 초기화 중단
            } else {
                console.error("[GameEngine] An unexpected error occurred during rule enforcement:", e);
                throw e;
            }
        }

        // EventManager 초기 구독 설정 (예시)
        this.eventManager.subscribe('unitDeath', (data) => {
            console.log(`[GameEngine] Notification: Unit ${data.unitId} (${data.unitName}) has died.`);
        });
        this.eventManager.subscribe('skillExecuted', (data) => {
            console.log(`[GameEngine] Notification: Skill '${data.skillName}' was executed.`);
        });

        console.log("\u2699\ufe0f GameEngine initialized successfully. \u2699\ufe0f");
    }

    /**
     * 게임 루프의 업데이트 단계에서 호출될 핵심 게임 논리 함수입니다.
     * @param {number} deltaTime - 마지막 프레임 이후 경과된 시간 (ms)
     */
    _update(deltaTime) {
        // 이곳에서 모든 게임 논리(유닛 이동, AI, 스킬 쿨다운, 물리 등)를 업데이트합니다.
        // 다른 매니저들의 update 메서드를 호출할 수도 있습니다.
        // 예: this.combatManager.update(deltaTime);
    }

    /**
     * 게임 루프의 그리기 단계에서 호출될 핵심 렌더링 함수입니다.
     */
    _draw() {
        // 렌더러를 사용하여 모든 시각적 요소를 그립니다.
        this.renderer.clear();
        this.renderer.drawBackground();

        // 테스트용 텍스트 (나중에 제거하거나 실제 게임 요소로 대체)
        this.renderer.ctx.fillStyle = 'white';
        this.renderer.ctx.font = '48px Arial';
        this.renderer.ctx.textAlign = 'center';
        this.renderer.ctx.fillText('Muscle & Blood', this.renderer.canvas.width / 2, this.renderer.canvas.height / 2);
        this.renderer.ctx.font = '24px Arial';
        this.renderer.ctx.fillText('Game Engine is Running!', this.renderer.canvas.width / 2, this.renderer.canvas.height / 2 + 50);
    }

    /**
     * 게임 엔진을 시작합니다.
     */
    start() {
        console.log("\ud83d\ude80 GameEngine starting game loop... \ud83d\ude80");
        this.gameLoop.start();
    }

    // 테스트 및 디버깅을 위해 내부 매니저 인스턴스를 외부에 노출하는 getter 메서드
    getRenderer() {
        return this.renderer;
    }

    getEventManager() {
        return this.eventManager;
    }

    getGuardianManager() {
        return this.guardianManager;
    }
}
