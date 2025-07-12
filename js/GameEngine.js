// js/GameEngine.js
import { Renderer } from './Renderer.js';
import { GameLoop } from './GameLoop.js';
import { EventManager } from './managers/EventManager.js';
import { GuardianManager } from './managers/GuardianManager.js';
import { MeasureManager } from './managers/MeasureManager.js';
import { MapManager } from './managers/MapManager.js';
import { UIEngine } from './managers/UIEngine.js';
import { LayerEngine } from './managers/LayerEngine.js';
import { SceneManager } from './managers/SceneManager.js';
import { CameraEngine } from './managers/CameraEngine.js';
import { InputManager } from './managers/InputManager.js';
import { LogicManager } from './managers/LogicManager.js';
import { CompatibilityManager } from './managers/CompatibilityManager.js';

import { TerritoryManager } from './managers/TerritoryManager.js';
import { BattleStageManager } from './managers/BattleStageManager.js';
import { BattleGridManager } from './managers/BattleGridManager.js';

export class GameEngine {
    constructor(canvasId) {
        console.log("\u2699\ufe0f GameEngine initializing... \u2699\ufe0f");

        this.renderer = new Renderer(canvasId);
        if (!this.renderer.canvas) {
            console.error("GameEngine: Failed to initialize Renderer. Game cannot proceed.");
            throw new Error("Renderer initialization failed.");
        }
        this.eventManager = new EventManager();
        this.guardianManager = new GuardianManager();
        this.measureManager = new MeasureManager();

        // SceneManager 초기화 (LogicManager보다 먼저 초기화되어야 함)
        this.sceneManager = new SceneManager();

        // LogicManager 초기화
        this.logicManager = new LogicManager(this.measureManager, this.sceneManager);

        // CompatibilityManager 초기화 (LogicManager를 전달)
        this.compatibilityManager = new CompatibilityManager(
            this.measureManager,
            this.renderer,
            null, // UIEngine (temp null)
            null,  // MapManager (temp null)
            this.logicManager // LogicManager 전달
        );

        // UIEngine과 MapManager 초기화 (CompatibilityManager가 재계산 메서드를 호출할 수 있도록)
        this.mapManager = new MapManager(this.measureManager);
        this.uiEngine = new UIEngine(this.renderer, this.measureManager, this.eventManager);

        // CompatibilityManager에 UIEngine과 MapManager 참조 설정 (생성 후)
        this.compatibilityManager.uiEngine = this.uiEngine;
        this.compatibilityManager.mapManager = this.mapManager;
        // 초기 캔버스 크기 조정 및 다른 매니저 재계산 트리거 (모든 매니저가 초기화된 후 한 번 더 호출)
        this.compatibilityManager.adjustResolution();

        this.cameraEngine = new CameraEngine(this.renderer, this.logicManager, this.sceneManager);
        this.inputManager = new InputManager(this.renderer, this.cameraEngine, this.uiEngine);

        this.layerEngine = new LayerEngine(this.renderer, this.cameraEngine);

        this.territoryManager = new TerritoryManager();
        this.battleStageManager = new BattleStageManager(); // measureManager 인수 제거
        this.battleGridManager = new BattleGridManager(this.measureManager);

        this.sceneManager.registerScene('territoryScene', [this.territoryManager]);
        this.sceneManager.registerScene('battleScene', [this.battleStageManager, this.battleGridManager]);

        this.sceneManager.setCurrentScene('territoryScene');

        this.layerEngine.registerLayer('sceneLayer', (ctx) => {
            this.sceneManager.draw(ctx);
        }, 10);

        this.layerEngine.registerLayer('uiLayer', (ctx) => {
            this.uiEngine.draw(ctx);
        }, 100);

        this._update = this._update.bind(this);
        this._draw = this._draw.bind(this);

        this.gameLoop = new GameLoop(this._update, this._draw);

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
            if (e.name === 'ImmutableRuleViolationError') {
                console.error("[GameEngine] CRITICAL ERROR: Game initialization failed due to immutable rule violation!", e.message);
                throw e;
            } else {
                console.error("[GameEngine] An unexpected error occurred during rule enforcement:", e);
                throw e;
            }
        }

        this.eventManager.subscribe('unitDeath', (data) => {
            console.log(`[GameEngine] Notification: Unit ${data.unitId} (${data.unitName}) has died.`);
        });
        this.eventManager.subscribe('skillExecuted', (data) => {
            console.log(`[GameEngine] Notification: Skill '${data.skillName}' was executed.`);
        });
        this.eventManager.subscribe('battleStart', (data) => {
            console.log(`[GameEngine] Battle started for map: ${data.mapId}, difficulty: ${data.difficulty}`);
            this.sceneManager.setCurrentScene('battleScene');
            this.uiEngine.setUIState('combatScreen');
            this.cameraEngine.reset();
        });

        console.log("\u2699\ufe0f GameEngine initialized successfully. \u2699\ufe0f");
    }

    _update(deltaTime) {
        this.sceneManager.update(deltaTime);
    }

    _draw() {
        this.layerEngine.draw();
    }

    start() {
        console.log("\ud83d\ude80 GameEngine starting game loop... \ud83d\ude80");
        this.gameLoop.start();
    }

    getRenderer() { return this.renderer; }
    getEventManager() { return this.eventManager; }
    getGuardianManager() { return this.guardianManager; }
    getMeasureManager() { return this.measureManager; }
    getMapManager() { return this.mapManager; }
    getUIEngine() { return this.uiEngine; }
    getLayerEngine() { return this.layerEngine; }
    getSceneManager() { return this.sceneManager; }
    getCameraEngine() { return this.cameraEngine; }
    getInputManager() { return this.inputManager; }
    getLogicManager() { return this.logicManager; }
    getCompatibilityManager() { return this.compatibilityManager; }
}
