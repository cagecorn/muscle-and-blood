// js/managers/ClassAIManager.js

export class ClassAIManager {
    constructor(idManager, battleSimulationManager, measureManager) {
        console.log("\ud83d\udcbb ClassAIManager initialized. Ready to define class-based AI. \ud83d\udcbb");
        this.idManager = idManager;
        this.battleSimulationManager = battleSimulationManager;
        this.measureManager = measureManager;
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

        switch (unitClass.id) {
            case 'class_warrior':
                return this._getWarriorAction(unit, allUnits, unitClass);
            default:
                console.warn(`[ClassAIManager] No specific AI defined for class: ${unitClass.name} (${unitClass.id}).`);
                return null;
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
        const enemies = allUnits.filter(u => u.type === 'enemy' && u.currentHp > 0);
        if (enemies.length === 0) {
            console.log(`[ClassAIManager] Warrior ${warriorUnit.name}: No enemies to attack.`);
            return null;
        }

        let closestEnemy = null;
        let minDistance = Infinity;

        for (const enemy of enemies) {
            const dist = Math.abs(warriorUnit.gridX - enemy.gridX) + Math.abs(warriorUnit.gridY - enemy.gridY);
            if (dist < minDistance) {
                minDistance = dist;
                closestEnemy = enemy;
            }
        }

        if (!closestEnemy) {
            return null;
        }

        const attackRange = 1;
        const dx = Math.abs(warriorUnit.gridX - closestEnemy.gridX);
        const dy = Math.abs(warriorUnit.gridY - closestEnemy.gridY);

        if (dx <= attackRange && dy <= attackRange && dx + dy <= attackRange * 2) {
            console.log(`[ClassAIManager] Warrior ${warriorUnit.name}: Enemy ${closestEnemy.name} is in attack range.`);
            return {
                actionType: 'attack',
                targetId: closestEnemy.id
            };
        } else {
            console.log(`[ClassAIManager] Warrior ${warriorUnit.name}: Moving towards ${closestEnemy.name}.`);
            let targetMoveX = warriorUnit.gridX;
            let targetMoveY = warriorUnit.gridY;

            const moveRange = warriorClassData.moveRange || 1;
            let remainingMoves = moveRange;

            while (remainingMoves > 0 && (Math.abs(targetMoveX - closestEnemy.gridX) > 0 || Math.abs(targetMoveY - closestEnemy.gridY) > 0)) {
                let moved = false;
                if (targetMoveX < closestEnemy.gridX) {
                    targetMoveX++;
                    moved = true;
                } else if (targetMoveX > closestEnemy.gridX) {
                    targetMoveX--;
                    moved = true;
                }

                if (remainingMoves > 0 && !moved) {
                    if (targetMoveY < closestEnemy.gridY) {
                        targetMoveY++;
                        moved = true;
                    } else if (targetMoveY > closestEnemy.gridY) {
                        targetMoveY--;
                        moved = true;
                    }
                }

                if (moved) {
                    remainingMoves--;
                    const currentDx = Math.abs(targetMoveX - closestEnemy.gridX);
                    const currentDy = Math.abs(targetMoveY - closestEnemy.gridY);
                    if (currentDx <= attackRange && currentDy <= attackRange && currentDx + currentDy <= attackRange * 2) {
                        console.log(`[ClassAIManager] Warrior ${warriorUnit.name}: Moved to (${targetMoveX},${targetMoveY}) and now in attack range.`);
                        return {
                            actionType: 'moveAndAttack',
                            targetId: closestEnemy.id,
                            moveTargetX: targetMoveX,
                            moveTargetY: targetMoveY
                        };
                    }
                } else {
                    break;
                }
            }

            console.log(`[ClassAIManager] Warrior ${warriorUnit.name}: Only moved to (${targetMoveX},${targetMoveY}), not in attack range.`);
            return {
                actionType: 'move',
                moveTargetX: targetMoveX,
                moveTargetY: targetMoveY
            };
        }
    }
}
