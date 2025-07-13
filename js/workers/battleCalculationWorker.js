// js/workers/battleCalculationWorker.js

self.onmessage = (event) => {
    const { type, payload } = event.data;

    switch (type) {
        case 'CALCULATE_DAMAGE': {
            const { attackerStats, targetStats, skillData, currentTargetHp, preCalculatedDamageRoll } = payload;

            let damage = preCalculatedDamageRoll - targetStats.defense;
            if (damage < 0) damage = 0;

            if (skillData && skillData.type === 'magic') {
                // 이미 preCalculatedDamageRoll에 마법 공격력이 포함되었다면 추가 처리 불필요
            }

            const newTargetHp = Math.max(0, currentTargetHp - damage);

            self.postMessage({
                type: 'DAMAGE_CALCULATED',
                unitId: payload.targetUnitId,
                newHp: newTargetHp,
                damageDealt: damage
            });
            break;
        }
        default:
            console.warn(`[BattleCalculationWorker] Unknown message type received: ${type}`);
    }
};

console.log("[Worker] BattleCalculationWorker initialized. Ready for heavy calculations.");
