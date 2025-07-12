// js/managers/BattleCalculationManager.js

export class BattleCalculationManager {
    constructor(eventManager, battleSimulationManager) {
        console.log("\ud83d\udcca BattleCalculationManager initialized. Delegating heavy calculations to worker. \ud83d\udcca");
        this.eventManager = eventManager;
        this.battleSimulationManager = battleSimulationManager;
        this.worker = new Worker('./js/workers/battleCalculationWorker.js');

        this.worker.onmessage = this._handleWorkerMessage.bind(this);
        this.worker.onerror = (e) => {
            console.error("[BattleCalculationManager] Worker Error:", e);
        };
    }

    _handleWorkerMessage(event) {
        const { type, unitId, newHp, damageDealt } = event.data;

        if (type === 'DAMAGE_CALCULATED') {
            console.log(`[BattleCalculationManager] Received damage calculation result for ${unitId}: New HP = ${newHp}, Damage = ${damageDealt}`);
            const unitToUpdate = this.battleSimulationManager.unitsOnGrid.find(unit => unit.id === unitId);
            if (unitToUpdate) {
                unitToUpdate.currentHp = newHp;
                if (newHp <= 0) {
                    this.eventManager.emit('unitDeath', { unitId: unitId, unitName: unitToUpdate.name, unitType: unitToUpdate.type });
                    console.log(`[BattleCalculationManager] Unit '${unitId}' has died.`);
                }
            } else {
                console.warn(`[BattleCalculationManager] Could not find unit '${unitId}' to update HP.`);
            }
        }
    }

    requestDamageCalculation(attackerUnitId, targetUnitId, skillData = null) {
        const attackerUnit = this.battleSimulationManager.unitsOnGrid.find(unit => unit.id === attackerUnitId);
        const targetUnit = this.battleSimulationManager.unitsOnGrid.find(unit => unit.id === targetUnitId);

        if (!attackerUnit || !targetUnit) {
            console.error("[BattleCalculationManager] Cannot request damage calculation: Attacker or target unit not found.");
            return;
        }

        const payload = {
            attackerStats: attackerUnit.fullUnitData.baseStats,
            targetStats: targetUnit.fullUnitData.baseStats,
            currentTargetHp: targetUnit.currentHp,
            skillData: skillData,
            targetUnitId: targetUnitId
        };

        this.worker.postMessage({ type: 'CALCULATE_DAMAGE', payload });
        console.log(`[BattleCalculationManager] Requested damage calculation: ${attackerUnitId} attacks ${targetUnitId}.`);
    }

    terminateWorker() {
        if (this.worker) {
            this.worker.terminate();
            console.log("[BattleCalculationManager] Worker terminated.");
        }
    }
}
