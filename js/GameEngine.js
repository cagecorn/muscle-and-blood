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
import { DisarmManager } from './managers/DisarmManager.js'; // ✨ DisarmManager 임포트
import { CanvasBridgeManager } from './managers/CanvasBridgeManager.js'; // ✨ CanvasBridgeManager 추가
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
import { ValorEngine } from './managers/ValorEngine.js';   // ✨ ValorEngine 추가
import { WeightEngine } from './managers/WeightEngine.js'; // ✨ WeightEngine 추가
import { StatManager } from './managers/StatManager.js'; // ✨ StatManager 추가
import { DiceEngine } from './managers/DiceEngine.js';
import { DiceRollManager } from './managers/DiceRollManager.js';
import { DiceBotManager } from './managers/DiceBotManager.js';
import { TurnCountManager } from './managers/TurnCountManager.js';
import { StatusEffectManager } from './managers/StatusEffectManager.js';
import { WorkflowManager } from './managers/WorkflowManager.js';
import { STATUS_EFFECTS } from '../data/statusEffects.js';

import { TerritoryManager } from './managers/TerritoryManager.js';
import { BattleStageManager } from './managers/BattleStageManager.js';
import { BattleGridManager } from './managers/BattleGridManager.js';
import { ButtonEngine } from './managers/ButtonEngine.js'; // ✨ ButtonEngine 임포트

// ✨ 상수 파일 임포트
import { GAME_EVENTS, UI_STATES, BUTTON_IDS, ATTACK_TYPES } from './constants.js';

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
        // GameEngine에서 각 매니저 인스턴스에 대한 getter를 추가하여 순환 참조를 피합니다.
        this.getVFXManager = () => this.vfxManager;
        this.getStatusEffectManager = () => this.statusEffectManager;
        this.getBattleCalculationManager = () => this.battleCalculationManager;
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

        // ✨ ValorEngine을 먼저 초기화하여 BattleSimulationManager에 전달합니다.
        this.valorEngine = new ValorEngine();

        // 전투 시뮬레이션 매니저 초기화
        this.battleSimulationManager = new BattleSimulationManager(
            this.measureManager,
            this.assetLoaderManager,
            this.idManager,
            this.logicManager,
            this.animationManager,
            this.valorEngine // ✨ valorEngine 추가
        );
        // 생성 후 상호 참조 설정
        this.animationManager.battleSimulationManager = this.battleSimulationManager;

        // MercenaryPanelManager는 별도 캔버스를 사용하지 않고 UIEngine을 통해 그려집니다.
        this.mercenaryPanelManager = new MercenaryPanelManager(
            this.measureManager,
            this.battleSimulationManager,
            this.logicManager,
            this.eventManager
        );

        // ✨ 클릭 가능한 UI 버튼을 관리하는 ButtonEngine 초기화
        this.buttonEngine = new ButtonEngine();

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
        // mercenaryPanel은 이제 메인 캔버스 위에 UIEngine이 직접 그릴 것이므로 PanelEngine에 등록하지 않습니다.
        this.panelEngine.registerPanel('combatLog', this.battleLogManager);

        // UIEngine과 MapManager를 먼저 초기화
        this.mapManager = new MapManager(this.measureManager);
        // UIEngine 초기화 시 mercenaryPanelManager와 buttonEngine을 함께 전달
        this.uiEngine = new UIEngine(this.renderer, this.measureManager, this.eventManager, this.mercenaryPanelManager, this.buttonEngine);

        // CompatibilityManager 초기화 (필요 매니저들을 모두 전달)
        this.compatibilityManager = new CompatibilityManager(
            this.measureManager,
            this.renderer,
            this.uiEngine,
            this.mapManager,
            this.logicManager,
            null, // mercenaryPanelManager는 이제 별도 캔버스를 갖지 않으므로 null로 전달
            this.battleLogManager
        );

        this.cameraEngine = new CameraEngine(this.renderer, this.logicManager, this.sceneEngine);
        // ✨ InputManager 초기화 시 buttonEngine을 함께 전달
        this.inputManager = new InputManager(this.renderer, this.cameraEngine, this.uiEngine, this.buttonEngine);

        const mainGameCanvasElement = document.getElementById(canvasId);
        this.canvasBridgeManager = new CanvasBridgeManager(
            mainGameCanvasElement,
            null, // mercenaryPanelCanvasElement는 이제 없습니다.
            combatLogCanvasElement,
            this.eventManager,
            this.measureManager
        );

        this.layerEngine = new LayerEngine(this.renderer, this.cameraEngine);

        this.territoryManager = new TerritoryManager();
        this.battleStageManager = new BattleStageManager(this.assetLoaderManager); // ✨ assetLoaderManager 전달
        this.battleGridManager = new BattleGridManager(this.measureManager, this.logicManager);
        // VFXManager에 AnimationManager를 전달하여 HP 바 위치를 애니메이션과 동기화합니다.
        this.vfxManager = new VFXManager(
            this.renderer,
            this.measureManager,
            this.cameraEngine,
            this.battleSimulationManager,
            this.animationManager,
            this.eventManager // ✨ eventManager 추가
        );
        this.bindingManager = new BindingManager();

        // ✨ 새로운 엔진들 초기화
        this.delayEngine = new DelayEngine();
        this.timingEngine = new TimingEngine(this.delayEngine);
        this.weightEngine = new WeightEngine(); // ✨ WeightEngine 초기화
        this.statManager = new StatManager(this.valorEngine, this.weightEngine); // ✨ StatManager 초기화

        // ✨ DiceEngine 및 관련 매니저 초기화
        this.diceEngine = new DiceEngine();
        this.diceRollManager = new DiceRollManager(this.diceEngine, this.valorEngine);
        this.diceBotManager = new DiceBotManager(this.diceEngine);

        // BattleCalculationManager는 DiceRollManager가 준비된 이후에 초기화합니다.
        this.battleCalculationManager = new BattleCalculationManager(
            this.eventManager,
            this.battleSimulationManager,
            this.diceRollManager,
            this.delayEngine,
            this.getVFXManager.bind(this),
            this.getStatusEffectManager.bind(this)
        );

        // Status effect 관련 매니저 초기화
        this.turnCountManager = new TurnCountManager();
        this.statusEffectManager = new StatusEffectManager(
            this.eventManager,
            this.idManager,
            this.turnCountManager,
            this.getBattleCalculationManager.bind(this)
        );
        this.workflowManager = new WorkflowManager(
            this.eventManager,
            this.statusEffectManager,
            this.battleSimulationManager
        );

        // ✨ DisarmManager 초기화 (StatusEffectManager가 먼저 초기화되어야 함)
        this.disarmManager = new DisarmManager(
            this.eventManager,
            this.statusEffectManager,
            this.battleSimulationManager,
            this.measureManager
        );

        // ✨ BasicAIManager 초기화
        this.basicAIManager = new BasicAIManager(this.battleSimulationManager);

        // ✨ 새로운 매니저 초기화
        this.turnOrderManager = new TurnOrderManager(
            this.eventManager,
            this.battleSimulationManager,
            this.weightEngine // ✨ weightEngine 추가
        );
        this.classAIManager = new ClassAIManager(this.idManager, this.battleSimulationManager, this.measureManager, this.basicAIManager);

        // ✨ TurnEngine에 새로운 의존성 전달
        this.turnEngine = new TurnEngine(
            this.eventManager,
            this.battleSimulationManager,
            this.turnOrderManager,
            this.classAIManager,
            this.delayEngine,
            this.timingEngine,
            this.animationManager,
            this.battleCalculationManager,
            this.statusEffectManager
        );

        // ✨ sceneEngine에 UI_STATES 상수 사용
        this.sceneEngine.registerScene(UI_STATES.MAP_SCREEN, [this.territoryManager]);
        this.sceneEngine.registerScene(UI_STATES.COMBAT_SCREEN, [
            this.battleStageManager,
            this.battleGridManager,
            this.battleSimulationManager,
            this.vfxManager
        ]);

        // ✨ sceneEngine 초기 상태 설정에 UI_STATES 상수 사용
        this.sceneEngine.setCurrentScene(UI_STATES.MAP_SCREEN);

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

            // 초기 카메라 위치와 줌을 설정하여 모든 콘텐츠가 화면에 들어오도록 합니다.
            this.cameraEngine.reset();
            // ✨ 추가: 카메라 엔진의 초기 상태 확인
            console.log(`[GameEngine Debug] Camera Initial State: X=${this.cameraEngine.x}, Y=${this.cameraEngine.y}, Zoom=${this.cameraEngine.zoom}`);

            // ✨ 이벤트 구독에 GAME_EVENTS 상수 사용
            this.eventManager.subscribe(GAME_EVENTS.UNIT_DEATH, (data) => {
                console.log(`[GameEngine] Notification: Unit ${data.unitId} (${data.unitName}) has died.`);
            });
            this.eventManager.subscribe(GAME_EVENTS.SKILL_EXECUTED, (data) => {
                console.log(`[GameEngine] Notification: Skill '${data.skillName}' was executed.`);
            });
            this.eventManager.subscribe(GAME_EVENTS.BATTLE_START, async (data) => {
                console.log(`[GameEngine] Battle started for map: ${data.mapId}, difficulty: ${data.difficulty}`);
                this.sceneEngine.setCurrentScene(UI_STATES.COMBAT_SCREEN); // ✨ UI_STATES 상수 사용
                this.uiEngine.setUIState(UI_STATES.COMBAT_SCREEN); // ✨ UI_STATES 상수 사용
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
        // ✨ 포획 애니메이션에 사용될 전사 마무리 이미지 로드
        await this.assetLoaderManager.loadImage(
            'sprite_warrior_finish',
            'assets/images/warrior-finish.png'
        );
        // ✨ 전투 배경 이미지 로드
        await this.assetLoaderManager.loadImage('sprite_battle_stage_forest', 'assets/images/battle-stage-forest.png');

        console.log(`[GameEngine] Registered unit ID: ${UNITS.WARRIOR.id}`);
        console.log(`[GameEngine] Loaded warrior sprite: ${UNITS.WARRIOR.spriteId}`);

        // 샘플 ID 조회 및 이미지 로드 (동기적 접근을 위해)
        const warriorData = await this.idManager.get(UNITS.WARRIOR.id);
        const warriorImage = this.assetLoaderManager.getImage(UNITS.WARRIOR.spriteId);

        // ✨ BattleSimulationManager에 유닛 배치 시 currentHp 초기화
        // 첫 번째 전사를 그리드의 더 왼쪽에 배치 (gridX: 3)
        this.battleSimulationManager.addUnit({ ...warriorData, currentHp: warriorData.baseStats.hp }, warriorImage, 3, 4);

        // 두 번째 전사 유닛을 생성하여 바로 옆 타일에 배치합니다.
        const secondWarriorId = 'unit_warrior_002';
        const secondWarriorData = { ...warriorData, id: secondWarriorId };
        await this.idManager.addOrUpdateId(secondWarriorId, secondWarriorData);
        this.battleSimulationManager.addUnit({ ...secondWarriorData, currentHp: secondWarriorData.baseStats.hp }, warriorImage, 3, 5);

        const mockEnemyUnitData = {
            id: 'unit_zombie_001', // ID 변경
            name: '좀비', // 이름 변경
            classId: 'class_skeleton', // 기존 해골 클래스 재사용
            type: ATTACK_TYPES.ENEMY, // ✨ ATTACK_TYPES 상수 사용
            baseStats: {
                hp: 80,
                attack: 15,
                defense: 5,
                speed: 30,
                valor: 10,
                strength: 10,
                endurance: 8,
                agility: 12,
                intelligence: 5,
                wisdom: 5,
                luck: 15,
                weight: 10
            },
            spriteId: 'sprite_zombie_default'
        };
        await this.idManager.addOrUpdateId(mockEnemyUnitData.id, mockEnemyUnitData);
        // ✨ 좀비 기본 이미지 로드
        await this.assetLoaderManager.loadImage(mockEnemyUnitData.spriteId, 'assets/images/zombie.png');
        // ✨ 무장해제 상태의 좀비 이미지 로드
        await this.assetLoaderManager.loadImage('sprite_zombie_empty_default', 'assets/images/zombie-empty.png');
        // ✨ 좀비 무기 이미지 로드
        await this.assetLoaderManager.loadImage('sprite_zombie_weapon_default', 'assets/images/zombie-weapon.png');

        const enemyData = await this.idManager.get(mockEnemyUnitData.id);
        const enemyImage = this.assetLoaderManager.getImage(mockEnemyUnitData.spriteId);
        // 첫 번째 좀비를 그리드의 더 오른쪽에 배치 (gridX: 10)
        this.battleSimulationManager.addUnit({ ...enemyData, currentHp: enemyData.baseStats.hp }, enemyImage, 10, 4);

        // 두 번째 좀비 유닛을 생성하여 그 옆 타일에 배치합니다.
        const secondZombieId = 'unit_zombie_002';
        const secondZombieData = { ...mockEnemyUnitData, id: secondZombieId };
        await this.idManager.addOrUpdateId(secondZombieId, secondZombieData);
        const enemyImage2 = this.assetLoaderManager.getImage(secondZombieData.spriteId);
        this.battleSimulationManager.addUnit({ ...secondZombieData, currentHp: secondZombieData.baseStats.hp }, enemyImage2, 10, 5);
    }

    _update(deltaTime) {
        this.sceneEngine.update(deltaTime);
        this.animationManager.update(deltaTime);
        this.vfxManager.update(deltaTime);
    }

    _draw() {
        this.layerEngine.draw();
        // mercenaryPanelManager는 이제 UIEngine이 직접 그립니다.
        // combatLogManager만 PanelEngine을 통해 그립니다.
        if (this.panelEngine) {
            this.panelEngine.drawPanel('combatLog', this.battleLogManager.ctx);
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
    getValorEngine() { return this.valorEngine; }
    getWeightEngine() { return this.weightEngine; }
    getStatManager() { return this.statManager; }
    getTurnEngine() { return this.turnEngine; }
    getTurnOrderManager() { return this.turnOrderManager; }
    getBasicAIManager() { return this.basicAIManager; }
    getClassAIManager() { return this.classAIManager; }
    getAnimationManager() { return this.animationManager; }
    getCanvasBridgeManager() { return this.canvasBridgeManager; }
    getTurnCountManager() { return this.turnCountManager; }
    getStatusEffectManager() { return this.statusEffectManager; }
    getWorkflowManager() { return this.workflowManager; }
    getDisarmManager() { return this.disarmManager; }

    getButtonEngine() { return this.buttonEngine; }

    // Dice 관련 엔진/매니저에 대한 getter
    getDiceEngine() { return this.diceEngine; }
    getDiceRollManager() { return this.diceRollManager; }
    getDiceBotManager() { return this.diceBotManager; }
}
