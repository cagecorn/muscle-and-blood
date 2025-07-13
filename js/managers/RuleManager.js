// js/managers/RuleManager.js

export class RuleManager {
    constructor() {
        console.log("\uD83D\uDCD6 RuleManager initialized. Enforcing game rules. \uD83D\uDCD6");
        this.rules = new Map();
        this._loadBasicRules();
    }

    _loadBasicRules() {
        // 기본 규칙을 정의합니다.
        this.addRule('unitActionPerTurn', '유닛은 한 턴 당 [이동 + 공격 or 스킬]을 할 수 있다.');
        // ✨ 용맹 시스템 규칙 추가
        this.addRule('valorBarrierCalculation', '유닛의 용맹 수치에 따라 전투 시작 시 초기 배리어 양이 결정됩니다.');
        this.addRule('valorDamageAmplification', '현재 배리어 양이 높을수록 적에게 주는 피해가 증가합니다. 배리어가 깎일수록 데미지가 감소합니다.');
        // ✨ 무게 시스템 규칙 추가
        this.addRule('weightTurnOrderImpact', '유닛의 총 무게(유닛 자체 무게 + 장착 아이템 무게)가 클수록 행동 순서가 느려집니다.');
        this.addRule('strengthWeightEffect', '힘 스탯이 높을수록 유닛의 무게 가중치가 증가합니다.');
        this.addRule('itemWeightInfluence', '아이템마다 고유 무게가 존재하며, 무게 총합이 턴 순서에 영향을 줍니다.');
        console.log("[RuleManager] Basic rules loaded.");
    }

    /**
     * 새로운 게임 규칙을 추가합니다.
     * @param {string} ruleId - 규칙의 고유 ID
     * @param {string} description - 규칙에 대한 설명
     */
    addRule(ruleId, description) {
        if (this.rules.has(ruleId)) {
            console.warn(`[RuleManager] Rule '${ruleId}' already exists. Overwriting.`);
        }
        this.rules.set(ruleId, description);
        console.log(`[RuleManager] Added rule: ${ruleId} - "${description}"`);
    }

    /**
     * 특정 규칙의 설명을 가져옵니다.
     * @param {string} ruleId - 가져올 규칙의 ID
     * @returns {string | undefined} 규칙 설명 또는 undefined
     */
    getRule(ruleId) {
        return this.rules.get(ruleId);
    }
}
