// js/GameEngine.js

import { AssetEngine } from './engines/AssetEngine.js';
import { BattleEngine } from './engines/BattleEngine.js';
import { RenderEngine } from './engines/RenderEngine.js';
import { GameLoop } from './GameLoop.js';
import { EventManager } from './managers/EventManager.js';
import { MeasureManager } from './managers/MeasureManager.js';
import { RuleManager } from './managers/RuleManager.js';
import { SceneEngine } from './managers/SceneEngine.js';
import { LogicManager } from './managers/LogicManager.js';

export class GameEngine {
    constructor(canvasId) {
        console.log("\u2699\ufe0f GameEngine initializing...");

        // 1. 핵심 매니저
        this.eventManager = new EventManager();
        this.measureManager = new MeasureManager();
        this.ruleManager = new RuleManager();

        // 2. 전문 엔진
        this.assetEngine = new AssetEngine(this.eventManager);
        this.renderEngine = new RenderEngine(canvasId, this.eventManager, this.measureManager);
        this.battleEngine = new BattleEngine(this.eventManager, this.measureManager, this.assetEngine, this.renderEngine);

        // 3. 장면 및 로직
        this.sceneEngine = new SceneEngine();
        this.logicManager = new LogicManager(this.measureManager, this.sceneEngine);
        this.renderEngine.injectDependencies(this.battleEngine.getBattleSimulationManager(), this.logicManager, this.sceneEngine);

        // 게임 루프 설정
        this.gameLoop = new GameLoop(this._update.bind(this), this._draw.bind(this));

        // 비동기 매니저 초기화 후 게임 시작
        this._initAsyncManagers().then(() => {
            this.start();
        });
    }

    async _initAsyncManagers() {
        await this.assetEngine.getIdManager().initialize();
        await this.battleEngine.setupBattle();
    }

    _update(deltaTime) {
        this.battleEngine.update(deltaTime);
        this.renderEngine.update(deltaTime);
    }

    _draw() {
        this.renderEngine.draw();
    }

    start() {
        this.gameLoop.start();
        this.battleEngine.startBattle();
    }

    // Getter helpers
    getEventManager() { return this.eventManager; }
    getMeasureManager() { return this.measureManager; }
    getRuleManager() { return this.ruleManager; }
    getSceneEngine() { return this.sceneEngine; }
    getLogicManager() { return this.logicManager; }
    getAssetEngine() { return this.assetEngine; }
    getRenderEngine() { return this.renderEngine; }
    getBattleEngine() { return this.battleEngine; }
}
