// js/engines/BattleEngine.js

import { BattleSimulationManager } from '../managers/BattleSimulationManager.js';
import { ValorEngine } from '../managers/ValorEngine.js';
import { WeightEngine } from '../managers/WeightEngine.js';
import { StatManager } from '../managers/StatManager.js';
import { DiceEngine } from '../managers/DiceEngine.js';
import { DiceBotManager } from '../managers/DiceBotManager.js';
import { HeroManager } from '../managers/HeroManager.js';
import { BattleFormationManager } from '../managers/BattleFormationManager.js';
import { MonsterSpawnManager } from '../managers/MonsterSpawnManager.js';
import { StageDataManager } from '../managers/StageDataManager.js';
import { DelayEngine } from '../managers/DelayEngine.js';
import { TimingEngine } from '../managers/TimingEngine.js';
import { CoordinateManager } from '../managers/CoordinateManager.js';
import { TurnOrderManager } from '../managers/TurnOrderManager.js';
import { BasicAIManager } from '../managers/BasicAIManager.js';
import { ClassAIManager } from '../managers/ClassAIManager.js';
import { TargetingManager } from '../managers/TargetingManager.js';
import { TurnEngine } from '../managers/TurnEngine.js';
import { ConditionalManager } from '../managers/ConditionalManager.js';
import { DiceRollManager } from '../managers/DiceRollManager.js';
import { BattleCalculationManager } from '../managers/BattleCalculationManager.js';
import { TurnCountManager } from '../managers/TurnCountManager.js';
import { StatusEffectManager } from '../managers/StatusEffectManager.js';
import { CLASSES } from '../../data/class.js'; // ◀◀◀ **이 부분을 추가해주세요!**

/**
 * 전투 시뮬레이션과 턴 진행을 담당하는 엔진입니다.
 */
export class BattleEngine {
    constructor(eventManager, measureManager, assetEngine, renderEngine) {
        console.log("\u2694\ufe0f BattleEngine initialized.");

        const idManager = assetEngine.getIdManager();
        const assetLoaderManager = assetEngine.getAssetLoaderManager();
        this.assetLoaderManager = assetLoaderManager;
        const animationManager = renderEngine.getAnimationManager();
        this.stageDataManager = new StageDataManager();

        this.valorEngine = new ValorEngine();
        this.weightEngine = new WeightEngine();
        this.statManager = new StatManager(this.valorEngine, this.weightEngine);
        this.diceEngine = new DiceEngine();
        this.diceBotManager = new DiceBotManager(this.diceEngine);

        this.battleSimulationManager = new BattleSimulationManager(
            measureManager,
            assetLoaderManager,
            idManager,
            null,
            animationManager,
            this.valorEngine
        );
        assetEngine.getUnitSpriteEngine().battleSimulationManager = this.battleSimulationManager;

        this.turnCountManager = new TurnCountManager();
        this.diceRollManager = new DiceRollManager(this.diceEngine, this.valorEngine, null);

        this.delayEngine = new DelayEngine();
        this.timingEngine = new TimingEngine(this.delayEngine);
        this.coordinateManager = new CoordinateManager(this.battleSimulationManager, null);
        this.turnOrderManager = new TurnOrderManager(eventManager, this.battleSimulationManager, this.weightEngine);

        this.conditionalManager = new ConditionalManager(this.battleSimulationManager, idManager);
        this.battleCalculationManager = new BattleCalculationManager(
            eventManager,
            this.battleSimulationManager,
            this.diceRollManager,
            this.delayEngine,
            this.conditionalManager
        );
        this.statusEffectManager = new StatusEffectManager(
            eventManager,
            idManager,
            this.turnCountManager,
            this.battleCalculationManager
        );
        this.diceRollManager.statusEffectManager = this.statusEffectManager;

        this.basicAIManager = new BasicAIManager(this.battleSimulationManager);
        this.targetingManager = new TargetingManager(this.battleSimulationManager);
        this.classAIManager = new ClassAIManager(idManager, this.battleSimulationManager, measureManager, this.basicAIManager, null, this.diceEngine, this.targetingManager);

        this.turnEngine = new TurnEngine(
            eventManager,
            this.battleSimulationManager,
            this.turnOrderManager,
            this.classAIManager,
            this.delayEngine,
            this.timingEngine,
            measureManager,
            animationManager,
            this.battleCalculationManager,
            this.statusEffectManager
        );

        this.heroManager = new HeroManager(idManager, this.diceEngine, assetLoaderManager, this.battleSimulationManager, assetEngine.getUnitSpriteEngine());
        this.battleFormationManager = new BattleFormationManager(this.battleSimulationManager);
        this.monsterSpawnManager = new MonsterSpawnManager(
            idManager,
            assetLoaderManager,
            this.battleSimulationManager,
            this.stageDataManager
        );
    }

    async setupBattle() {
        await this.assetLoaderManager.loadImage('sprite_warrior_default', 'assets/images/warrior.png');
        await this.assetLoaderManager.loadImage('sprite_zombie_default', 'assets/images/zombie.png');

        // static 데이터를 직접 HeroManager에 전달하여 IdManager 의존성을 제거합니다.
        const heroes = await this.heroManager.createWarriors(3, CLASSES.WARRIOR);
        this.battleFormationManager.placeAllies(heroes);
        await this.monsterSpawnManager.spawnMonstersForStage('stage1');
    }

    async startBattle() {
        await this.turnEngine.startBattleTurns();
    }

    update(deltaTime) {
        this.conditionalManager.update();
        this.turnEngine.update();
    }

    getBattleSimulationManager() { return this.battleSimulationManager; }
    getStageDataManager() { return this.stageDataManager; }
}
