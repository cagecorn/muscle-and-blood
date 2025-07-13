// js/GameEngine.js
import { Renderer } from './Renderer.js';
import { GameLoop } from './GameLoop.js';
import { EventManager } from './managers/EventManager.js';
import { GuardianManager } from './managers/GuardianManager.js';
import { MeasureManager } from './managers/MeasureManager.js';
import { MapManager } from './managers/MapManager.js';
import { UIEngine } from './managers/UIEngine.js';
import { LayerEngine } from './managers/LayerEngine.js';
import { SceneEngine } from './managers/SceneEngine.js';
import { CameraEngine } from './managers/CameraEngine.js';
import { InputManager } from './managers/InputManager.js';
import { LogicManager } from './managers/LogicManager.js';
import { CompatibilityManager } from './managers/CompatibilityManager.js';
import { IdManager } from './managers/IdManager.js';
import { AssetLoaderManager } from './managers/AssetLoaderManager.js';
import { BattleSimulationManager } from './managers/BattleSimulationManager.js';
import { AnimationManager } from './managers/AnimationManager.js';
import { VFXManager } from './managers/VFXManager.js';
import { BindingManager } from './managers/BindingManager.js';
import { BattleCalculationManager } from './managers/BattleCalculationManager.js';
import { MercenaryPanelManager } from './managers/MercenaryPanelManager.js'; // ✨ MercenaryPanelManager 추가
import { PanelEngine } from './managers/PanelEngine.js'; // ✨ PanelEngine 추가
import { RuleManager } from './managers/RuleManager.js'; // ✨ RuleManager 추가

import { TurnEngine } from './managers/TurnEngine.js'; // ✨ TurnEngine 추가
import { DelayEngine } from './managers/DelayEngine.js'; // ✨ DelayEngine 추가
import { TimingEngine } from './managers/TimingEngine.js'; // ✨ TimingEngine 추가
import { BattleLogManager } from './managers/BattleLogManager.js'; // ✨ 새롭게 추가
import { TurnOrderManager } from './managers/TurnOrderManager.js'; // ✨ 새롭게 추가
import { ClassAIManager } from './managers/ClassAIManager.js';   // ✨ 새롭게 추가
import { BasicAIManager } from './managers/BasicAIManager.js'; // ✨ 새롭게 추가

import { TerritoryManager } from './managers/TerritoryManager.js';
import { BattleStageManager } from './managers/BattleStageManager.js';
import { BattleGridManager } from './managers/BattleGridManager.js';

import { UNITS } from '../data/unit.js';
import { CLASSES } from '../data/class.js';

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
        // 게임 규칙을 관리하는 RuleManager 초기화
        this.ruleManager = new RuleManager();

        // SceneEngine 초기화 (LogicManager보다 먼저 초기화되어야 함)
        this.sceneEngine = new SceneEngine();

        // LogicManager 초기화
        this.logicManager = new LogicManager(this.measureManager, this.sceneEngine);

        // IdManager 및 AssetLoaderManager 초기화
        this.idManager = new IdManager();
        this.assetLoaderManager = new AssetLoaderManager();

        // AnimationManager는 BattleSimulationManager의 렌더링에 사용됩니다.
        this.animationManager = new AnimationManager(this.measureManager);

        // 전투 시뮬레이션 매니저 초기화
        this.battleSimulationManager = new BattleSimulationManager(
            this.measureManager,
            this.assetLoaderManager,
            this.idManager,
            this.logicManager,
            this.animationManager
        );
        // 생성 후 상호 참조 설정
        this.animationManager.battleSimulationManager = this.battleSimulationManager;

        // 패널과 로그 캔버스 요소 준비 및 매니저 초기화
        const mercenaryPanelCanvasElement = document.getElementById('mercenaryPanelCanvas');
        if (!mercenaryPanelCanvasElement) {
            console.error("GameEngine: Mercenary Panel Canvas not found. Game cannot proceed without it.");
            throw new Error("Mercenary Panel Canvas initialization failed.");
        }
        this.mercenaryPanelManager = new MercenaryPanelManager(
            mercenaryPanelCanvasElement,
            this.measureManager,
            this.battleSimulationManager,
            this.logicManager
        );

        const combatLogCanvasElement = document.getElementById('combatLogCanvas');
        if (!combatLogCanvasElement) {
            console.error("GameEngine: Combat Log Canvas not found. Game cannot proceed without it.");
            throw new Error("Combat Log Canvas initialization failed.");
        }
        this.battleLogManager = new BattleLogManager(
            combatLogCanvasElement,
            this.eventManager,
            this.measureManager
        );
        // 이벤트 리스너는 명시적으로 설정
        this.battleLogManager._setupEventListeners();

        // PanelEngine 초기화 및 패널 등록
        this.panelEngine = new PanelEngine();
        this.panelEngine.registerPanel('mercenaryPanel', this.mercenaryPanelManager);

        // CompatibilityManager 초기화 (LogicManager와 패널, 로그 매니저 전달)
        this.compatibilityManager = new CompatibilityManager(
            this.measureManager,
            this.renderer,
            null, // UIEngine (temp null)
            null,  // MapManager (temp null)
            this.logicManager,
            this.mercenaryPanelManager,
            this.battleLogManager
        );

        // UIEngine과 MapManager 초기화 (CompatibilityManager가 재계산 메서드를 호출할 수 있도록)
        this.mapManager = new MapManager(this.measureManager);
        this.uiEngine = new UIEngine(this.renderer, this.measureManager, this.eventManager);

        // CompatibilityManager에 UIEngine과 MapManager 참조 설정 (생성 후)
        this.compatibilityManager.uiEngine = this.uiEngine;
        this.compatibilityManager.mapManager = this.mapManager;
        // 초기 캔버스 크기 조정 및 다른 매니저 재계산 트리거 (모든 매니저가 초기화된 후 한 번 더 호출)
        this.compatibilityManager.adjustResolution();

        this.cameraEngine = new CameraEngine(this.renderer, this.logicManager, this.sceneEngine);
        this.inputManager = new InputManager(this.renderer, this.cameraEngine, this.uiEngine);

        this.layerEngine = new LayerEngine(this.renderer, this.cameraEngine);

        this.territoryManager = new TerritoryManager();
        this.battleStageManager = new BattleStageManager();
        this.battleGridManager = new BattleGridManager(this.measureManager, this.logicManager);
        // VFXManager에 AnimationManager를 전달하여 HP 바 위치를 애니메이션과 동기화합니다.
        this.vfxManager = new VFXManager(
            this.renderer,
            this.measureManager,
            this.cameraEngine,
            this.battleSimulationManager,
            this.animationManager // ✨ AnimationManager 추가
        );
        this.bindingManager = new BindingManager();
        this.battleCalculationManager = new BattleCalculationManager(this.eventManager, this.battleSimulationManager);

        // ✨ 새로운 엔진들 초기화
        this.delayEngine = new DelayEngine();
        this.timingEngine = new TimingEngine(this.delayEngine);

        // ✨ BasicAIManager 초기화
        this.basicAIManager = new BasicAIManager(this.battleSimulationManager);

        // ✨ 새로운 매니저 초기화
        this.turnOrderManager = new TurnOrderManager(this.eventManager, this.battleSimulationManager);
        this.classAIManager = new ClassAIManager(this.idManager, this.battleSimulationManager, this.measureManager, this.basicAIManager);

        // ✨ TurnEngine에 새로운 의존성 전달
        this.turnEngine = new TurnEngine(
            this.eventManager,
            this.battleSimulationManager,
            this.turnOrderManager,
            this.classAIManager,
            this.delayEngine,
            this.timingEngine,
            this.animationManager
        );

        this.sceneEngine.registerScene('territoryScene', [this.territoryManager]);
        this.sceneEngine.registerScene('battleScene', [
            this.battleStageManager,
            this.battleGridManager,
            this.battleSimulationManager,
            this.vfxManager
        ]);

        this.sceneEngine.setCurrentScene('territoryScene');

        this.layerEngine.registerLayer('sceneLayer', (ctx) => {
            this.sceneEngine.draw(ctx);
        }, 10);

        this.layerEngine.registerLayer('uiLayer', (ctx) => {
            this.uiEngine.draw(ctx);
        }, 100);


        this._update = this._update.bind(this);
        this._draw = this._draw.bind(this);

        this.gameLoop = new GameLoop(this._update, this._draw);

        // 초기화 과정의 비동기 처리
        this._initAsyncManagers().then(() => {
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
            this.eventManager.subscribe('battleStart', async (data) => {
                console.log(`[GameEngine] Battle started for map: ${data.mapId}, difficulty: ${data.difficulty}`);
                this.sceneEngine.setCurrentScene('battleScene');
                this.uiEngine.setUIState('combatScreen');
                this.cameraEngine.reset();

                // 전투 시작 후 TurnEngine 구동
                await this.turnEngine.startBattleTurns();
            });

            console.log("\u2699\ufe0f GameEngine initialized successfully. \u2699\ufe0f");
        }).catch(error => {
            console.error("Fatal Error: Async manager initialization failed.", error);
            alert("\uAC8C\uC784 \uC2DC\uC791 \uC911 \uCE58\uBA85\uC801\uC778 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uCF58\uC194\uC744 \uD655\uC778\uD574\uC8FC\uC138\uC694.");
        });
    }

    /**
     * \ube44\ub3d9\uae30\ub85c \ucd08\uae30\ud654\ub418\uc5b4\uc57c \ud558\ub294 \ub9e4\ub2c8\uc800\ub97c \ucc98\ub9ac\ud569\ub2c8\ub2e4.
     */
    async _initAsyncManagers() {
        await this.idManager.initialize();

        // 1. IdManager에 전사 유닛과 클래스 ID 등록
        await this.idManager.addOrUpdateId(UNITS.WARRIOR.id, UNITS.WARRIOR);
        await this.idManager.addOrUpdateId(CLASSES.WARRIOR.id, CLASSES.WARRIOR);
        // ✨ 새롭게 추가된 해골 클래스도 등록
        await this.idManager.addOrUpdateId(CLASSES.SKELETON.id, CLASSES.SKELETON);

        // 2. AssetLoaderManager로 전사 스프라이트 로드
        await this.assetLoaderManager.loadImage(
            UNITS.WARRIOR.spriteId,
            'assets/images/warrior.png'
        );

        console.log(`[GameEngine] Registered unit ID: ${UNITS.WARRIOR.id}`);
        console.log(`[GameEngine] Loaded warrior sprite: ${UNITS.WARRIOR.spriteId}`);

        // 샘플 ID 조회 및 이미지 로드 (동기적 접근을 위해)
        const warriorData = await this.idManager.get(UNITS.WARRIOR.id);
        const warriorImage = this.assetLoaderManager.getImage(UNITS.WARRIOR.spriteId);

        // ✨ BattleSimulationManager에 유닛 배치 시 currentHp 초기화
        // 전사를 그리드의 더 왼쪽에 배치 (gridX: 3)
        this.battleSimulationManager.addUnit({ ...warriorData, currentHp: warriorData.baseStats.hp }, warriorImage, 3, 4);

        const mockEnemyUnitData = {
            id: 'unit_skeleton_001',
            name: '해골 병사',
            classId: 'class_skeleton',
            type: 'enemy',
            baseStats: { hp: 80, attack: 15, defense: 5, speed: 30 },
            spriteId: 'sprite_skeleton_default'
        };
        await this.idManager.addOrUpdateId(mockEnemyUnitData.id, mockEnemyUnitData);
        await this.assetLoaderManager.loadImage(mockEnemyUnitData.spriteId, 'assets/images/skeleton.png');

        const enemyData = await this.idManager.get(mockEnemyUnitData.id);
        const enemyImage = this.assetLoaderManager.getImage(mockEnemyUnitData.spriteId);
        // 해골을 그리드의 더 오른쪽에 배치 (gridX: 10)
        this.battleSimulationManager.addUnit({ ...enemyData, currentHp: enemyData.baseStats.hp }, enemyImage, 10, 4);
    }

    _update(deltaTime) {
        this.sceneEngine.update(deltaTime);
        this.animationManager.update(deltaTime);
    }

    _draw() {
        this.layerEngine.draw();
        // 메인 캔버스와는 별도로 관리되는 패널도 그립니다.
        if (this.panelEngine) {
            this.panelEngine.drawPanel('mercenaryPanel', this.mercenaryPanelManager.ctx);
        }
        if (this.battleLogManager) {
            this.battleLogManager.draw(this.battleLogManager.ctx);
        }
    }

    start() {
        console.log("\ud83d\ude80 GameEngine starting game loop... \ud83d\ude80");
        this.gameLoop.start();
    }

    getRenderer() { return this.renderer; }
    getEventManager() { return this.eventManager; }
    getGuardianManager() { return this.guardianManager; }
    getRuleManager() { return this.ruleManager; }
    getMeasureManager() { return this.measureManager; }
    getMapManager() { return this.mapManager; }
    getUIEngine() { return this.uiEngine; }
    getLayerEngine() { return this.layerEngine; }
    getSceneEngine() { return this.sceneEngine; }
    getCameraEngine() { return this.cameraEngine; }
    getInputManager() { return this.inputManager; }
    getLogicManager() { return this.logicManager; }
    getCompatibilityManager() { return this.compatibilityManager; }
    getIdManager() { return this.idManager; }
    getAssetLoaderManager() { return this.assetLoaderManager; }
    getBattleSimulationManager() { return this.battleSimulationManager; }
    getBattleCalculationManager() { return this.battleCalculationManager; }
    getMercenaryPanelManager() { return this.mercenaryPanelManager; }
    getPanelEngine() { return this.panelEngine; }
    getBattleLogManager() { return this.battleLogManager; }
    getBindingManager() { return this.bindingManager; }

    // 새로운 엔진들에 대한 getter 메서드
    getDelayEngine() { return this.delayEngine; }
    getTimingEngine() { return this.timingEngine; }
    getTurnEngine() { return this.turnEngine; }
    getTurnOrderManager() { return this.turnOrderManager; }
    getBasicAIManager() { return this.basicAIManager; }
    getClassAIManager() { return this.classAIManager; }
    getAnimationManager() { return this.animationManager; }
}
