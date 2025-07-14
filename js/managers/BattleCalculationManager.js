// js/managers/BattleCalculationManager.js
import { DelayEngine } from './DelayEngine.js';
import { GAME_EVENTS, ATTACK_TYPES } from '../constants.js';

export class BattleCalculationManager {
    constructor(eventManager, battleSimulationManager, diceRollManager, delayEngine, getVFXManager, getStatusEffectManager) {
        console.log("\ud83d\udcca BattleCalculationManager initialized. Delegating heavy calculations to worker. \ud83d\udcca");
        this.eventManager = eventManager;
        this.battleSimulationManager = battleSimulationManager;
        this.diceRollManager = diceRollManager;
        this.delayEngine = delayEngine;
        this.getVFXManager = getVFXManager;
        this.getStatusEffectManager = getStatusEffectManager;
        this.worker = new Worker('./js/workers/battleCalculationWorker.js');

        this.worker.onmessage = this._handleWorkerMessage.bind(this);
        this.worker.onerror = (e) => {
            console.error("[BattleCalculationManager] Worker Error:", e);
        };
    }

    async _handleWorkerMessage(event) {
        const { type, unitId, attackerUnitId, newHp, newBarrier, hpDamageDealt, barrierDamageDealt } = event.data;

        if (type === GAME_EVENTS.DAMAGE_CALCULATED) {
            console.log(`[BattleCalculationManager] Received damage calculation result for ${unitId}: New HP = ${newHp}, New Barrier = ${newBarrier}, HP Damage = ${hpDamageDealt}, Barrier Damage = ${barrierDamageDealt}`);

            const unitToUpdate = this.battleSimulationManager.unitsOnGrid.find(u => u.id === unitId);
            const attackerUnit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === attackerUnitId);

            if (unitToUpdate) {
                unitToUpdate.currentHp = newHp;
                unitToUpdate.currentBarrier = newBarrier;

                if (newHp <= 0) {
                    const statusEffectManager = this.getStatusEffectManager();
                    const activeEffects = statusEffectManager.getUnitActiveEffects(unitId);
                    const isDisarmed = activeEffects?.has('status_disarmed');

                    if (isDisarmed && attackerUnit && attackerUnit.type === ATTACK_TYPES.MERCENARY) {
                        console.log(`[BattleCalculationManager] Unit '${unitId}' is disarmed and defeated by a mercenary ('${attackerUnit.name}'). Initiating capture animation.`);
                        const vfxManager = this.getVFXManager();
                        await vfxManager.startCaptureAnimation(attackerUnit, unitToUpdate);
                        return;
                    } else {
                        this.eventManager.emit(GAME_EVENTS.UNIT_DEATH, { unitId: unitId, unitName: unitToUpdate.name, unitType: unitToUpdate.type });
                        console.log(`[BattleCalculationManager] Unit '${unitId}' has died.`);
                    }
                }

                if (barrierDamageDealt > 0) {
                    this.eventManager.emit(GAME_EVENTS.DISPLAY_DAMAGE, { unitId: unitId, damage: barrierDamageDealt, color: 'yellow' });
                    if (hpDamageDealt > 0) {
                        await this.delayEngine.waitFor(100);
                    }
                }
                if (hpDamageDealt > 0) {
                    this.eventManager.emit(GAME_EVENTS.DISPLAY_DAMAGE, { unitId: unitId, damage: hpDamageDealt, color: 'red' });
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

        // ✨ DiceRollManager를 사용하여 데미지 굴림 수행 (공격자의 현재 배리어 상태를 전달)
        const finalDamageRoll = this.diceRollManager.performDamageRoll(
            attackerUnit,
            skillData
        );
        console.log(`[BattleCalculationManager] Final damage roll from DiceRollManager: ${finalDamageRoll}`);

        const payload = {
            attackerUnitId: attackerUnitId,
            attackerStats: attackerUnit.fullUnitData ? attackerUnit.fullUnitData.baseStats : attackerUnit.baseStats,
            targetStats: targetUnit.fullUnitData ? targetUnit.fullUnitData.baseStats : targetUnit.baseStats,
            currentTargetHp: targetUnit.currentHp,
            currentTargetBarrier: targetUnit.currentBarrier,
            maxBarrier: targetUnit.maxBarrier,
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
