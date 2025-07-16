// js/managers/ClassAIManager.js

import { WARRIOR_SKILLS } from '../../data/warriorSkills.js';
import { GAME_DEBUG_MODE } from '../constants.js';

export class ClassAIManager {
    constructor(idManager, battleSimulationManager, measureManager, basicAIManager, warriorSkillsAI, diceEngine, targetingManager) {
        console.log("\uD83D\uDD33 ClassAIManager initialized. Ready to define class-based AI. \uD83D\uDD33");
        this.idManager = idManager;
        this.battleSimulationManager = battleSimulationManager;
        this.measureManager = measureManager;
        this.basicAIManager = basicAIManager;
        this.warriorSkillsAI = warriorSkillsAI;
        this.diceEngine = diceEngine;
        this.targetingManager = targetingManager;
    }

    /**
     * 주어진 유닛의 클래스에 따른 기본 행동을 결정합니다.
     * @param {object} unit - 현재 턴을 진행하는 유닛 (fullUnitData 포함)
     * @param {object[]} allUnits - 현재 전장에 있는 모든 유닛
     * @returns {{actionType: string, targetId?: string, moveTargetX?: number, moveTargetY?: number} | null}
     */
    async getBasicClassAction(unit, allUnits) {
        const unitClass = await this.idManager.get(unit.classId);
        if (!unitClass) {
            console.warn(`[ClassAIManager] Class data not found for unit ${unit.name} (${unit.classId}). Cannot determine action.`);
            return null;
        }

        // 1. 결정된 스킬이 있는지 먼저 확인
        const skillToUse = this.decideSkillToUse(unit);
        if (skillToUse) {
            if (GAME_DEBUG_MODE) console.log(`[ClassAIManager] ${unit.name} decided to use skill: ${skillToUse.name}`);
            await this.executeSkillAI(unit, skillToUse);
            return null;
        }

        if (GAME_DEBUG_MODE) console.log(`[ClassAIManager] No skill was chosen for ${unit.name}, proceeding with basic AI.`);
        switch (unitClass.id) {
            case 'class_warrior':
                return this._getWarriorAction(unit, allUnits, unitClass);
            default:
                const defaultMoveRange = unitClass.moveRange || 1;
                const defaultAttackRange = unitClass.attackRange || 1;
                return this.basicAIManager.determineMoveAndTarget(unit, allUnits, defaultMoveRange, defaultAttackRange);
        }
    }

    decideSkillToUse(unit) {
        if (!unit.skillSlots || unit.skillSlots.length === 0) {
            return null;
        }

        const roll = this.diceEngine.getRandomFloat() * 100;
        let cumulativeProbability = 0;

        for (const skillId of unit.skillSlots) {
            const skillData = Object.values(WARRIOR_SKILLS).find(s => s.id === skillId);
            if (skillData && (skillData.type === 'active' || skillData.type === 'buff')) {
                cumulativeProbability += skillData.probability;
                if (roll < cumulativeProbability) {
                    return skillData;
                }
            }
        }

        return null;
    }

    async executeSkillAI(userUnit, skillData) {
        let targetUnit = null;

        if (skillData.id === WARRIOR_SKILLS.CHARGE.id) {
            targetUnit = this.targetingManager.getLowestHpUnit('enemy');
            if (targetUnit) {
                await this.warriorSkillsAI.charge(userUnit, targetUnit, skillData);
            } else if (GAME_DEBUG_MODE) {
                console.log(`[ClassAIManager] Charge skill for ${userUnit.name} has no target.`);
            }
        } else if (skillData.id === WARRIOR_SKILLS.BATTLE_CRY.id) {
            await this.warriorSkillsAI.battleCry(userUnit, skillData);
        } else if (GAME_DEBUG_MODE) {
            console.warn(`[ClassAIManager] No specific AI execution logic found for skill: ${skillData.name}`);
        }
    }

    /**
     * 전사 클래스의 AI 로직을 구현합니다. 가까운 적에게 근접하여 공격합니다.
     * @param {object} warriorUnit
     * @param {object[]} allUnits
     * @param {object} warriorClassData
     * @returns {{actionType: string, targetId?: string, moveTargetX?: number, moveTargetY?: number}}
     */
    _getWarriorAction(warriorUnit, allUnits, warriorClassData) {
        const moveRange = warriorClassData.moveRange || 1;
        const attackRange = 1;

        const action = this.basicAIManager.determineMoveAndTarget(warriorUnit, allUnits, moveRange, attackRange);

        return action;
    }
}
