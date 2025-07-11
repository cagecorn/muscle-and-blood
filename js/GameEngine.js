// js/GameEngine.js
import { Renderer } from './Renderer.js';
import { GameLoop } from './GameLoop.js';
import { EventManager } from './managers/EventManager.js';
import { GuardianManager } from './managers/GuardianManager.js';
import { MeasureManager } from './managers/MeasureManager.js';
import { MapManager } from './managers/MapManager.js';
import { UIManager } from './managers/UIManager.js';

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
        this.measureManager = new MeasureManager();

        // MeasureManager를 통해 Renderer의 해상도 설정
        this.renderer.canvas.width = this.measureManager.get('gameResolution.width');
        this.renderer.canvas.height = this.measureManager.get('gameResolution.height');

        // MapManager 및 UIManager 초기화
        this.mapManager = new MapManager(this.measureManager);
        this.uiManager = new UIManager(this.renderer, this.measureManager, this.eventManager);

        // 게임의 핵심 로직과 렌더링 함수 정의 (GameLoop에 전달될 콜백)
        this._update = this._update.bind(this); // `this` 컨텍스트 바인딩
        this._draw = this._draw.bind(this);     // `this` 컨텍스트 바인딩

        this.gameLoop = new GameLoop(this._update, this._draw);

        // 초기 게임 데이터 및 규칙 검증 (MeasureManager 값 활용)
        const initialGameData = {
            units: [
                { id: 'u1', name: 'Knight', hp: 100 },
                { id: 'u2', name: 'Archer', hp: 70 }
            ],
            config: {
                resolution: this.measureManager.get('gameResolution'),
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
        this.eventManager.subscribe('battleStart', (data) => {
            console.log(`[GameEngine] Battle started for map: ${data.mapId}, difficulty: ${data.difficulty}`);
            // TODO: 실제 전투 준비 및 시작 로직
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
        // 렌더러를 사용하여 기본 배경과 맵 정보를 그립니다.
        this.renderer.clear();
        this.renderer.drawBackground();

        const mapRenderData = this.mapManager.getMapRenderData();
        this.renderer.ctx.fillStyle = 'gray';
        this.renderer.ctx.font = '20px Arial';
        this.renderer.ctx.textAlign = 'left';
        this.renderer.ctx.fillText(`Map: ${mapRenderData.gridCols}x${mapRenderData.gridRows} Grid, Tile Size: ${mapRenderData.tileSize}`, 10, 30);

        // UI 매니저가 UI를 그립니다.
        this.uiManager.draw();
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

    getMeasureManager() {
        return this.measureManager;
    }

    getMapManager() {
        return this.mapManager;
    }

    getUIManager() {
        return this.uiManager;
    }
}
