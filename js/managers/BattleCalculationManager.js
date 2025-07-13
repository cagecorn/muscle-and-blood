// js/managers/BattleCalculationManager.js

export class BattleCalculationManager {
    constructor(eventManager, battleSimulationManager, diceRollManager) {
        console.log("\ud83d\udcca BattleCalculationManager initialized. Delegating heavy calculations to worker. \ud83d\udcca");
        this.eventManager = eventManager;
        this.battleSimulationManager = battleSimulationManager;
        this.diceRollManager = diceRollManager;
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

            const unitToUpdate = this.battleSimulationManager.unitsOnGrid.find(u => u.id === unitId);
            if (unitToUpdate) {
                unitToUpdate.currentHp = newHp;

                // ✨ Emit event so VFXManager can display floating damage numbers
                this.eventManager.emit('displayDamage', { unitId: unitId, damage: damageDealt });

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
        const attackerUnit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === attackerUnitId);
        const targetUnit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === targetUnitId);

        if (!attackerUnit || !targetUnit) {
            console.error("[BattleCalculationManager] Cannot request damage calculation: Attacker or target unit not found.");
            return;
        }

        // ✨ DiceRollManager를 사용하여 데미지 굴림 수행
        const attackerCalculatedStats = attackerUnit.baseStats;
        const finalDamageRoll = this.diceRollManager.performDamageRoll(
            attackerCalculatedStats,
            skillData
        );
        console.log(`[BattleCalculationManager] Final damage roll from DiceRollManager: ${finalDamageRoll}`);

        const payload = {
            attackerStats: attackerUnit.fullUnitData ? attackerUnit.fullUnitData.baseStats : attackerUnit.baseStats,
            targetStats: targetUnit.fullUnitData ? targetUnit.fullUnitData.baseStats : targetUnit.baseStats,
            currentTargetHp: targetUnit.currentHp,
            skillData: skillData,
            targetUnitId: targetUnitId,
            preCalculatedDamageRoll: finalDamageRoll
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
