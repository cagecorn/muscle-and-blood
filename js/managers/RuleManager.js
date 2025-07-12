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
