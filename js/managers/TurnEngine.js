// js/managers/TurnEngine.js

export class TurnEngine {
    constructor(eventManager, battleSimulationManager) {
        console.log("\uD83D\uDD01 TurnEngine initialized. Ready to manage game turns. \uD83D\uDD01");
        this.eventManager = eventManager;
        this.battleSimulationManager = battleSimulationManager; // 턴에 참여하는 유닛 정보 등에 접근할 수 있도록

        this.currentTurn = 0;
        this.activeUnitIndex = -1;
        this.turnOrder = []; // 유닛들의 턴 순서 배열

        // 턴 시작 시 실행할 콜백 큐 (예: 유닛의 턴 로직)
        this.turnPhaseCallbacks = {
            startOfTurn: [],
            unitActions: [],
            endOfTurn: []
        };
    }

    /**
     * 턴 순서를 초기화하거나 재계산합니다. (예: 속도 스탯 기반)
     */
    initializeTurnOrder() {
        // 실제 게임에서는 유닛들의 속도, 상태 등에 따라 동적으로 턴 순서를 결정합니다.
        // 여기서는 BattleSimulationManager에 등록된 유닛들을 기준으로 임시 턴 순서를 생성합니다.
        // 현재는 단순히 unitsOnGrid 배열의 순서를 따릅니다.
        this.turnOrder = [...this.battleSimulationManager.unitsOnGrid];
        console.log("[TurnEngine] Turn order initialized:", this.turnOrder.map(unit => unit.name));
    }

    /**
     * 턴 진행을 시작합니다.
     */
    async startBattleTurns() {
        console.log("[TurnEngine] Battle turns are starting!");
        this.currentTurn = 0;
        this.initializeTurnOrder(); // 새로운 전투 시작 시 턴 순서 초기화
        this.nextTurn();
    }

    /**
     * 다음 턴으로 진행합니다.
     */
    async nextTurn() {
        if (this.turnOrder.length === 0) {
            console.warn("[TurnEngine] No units in turn order. Ending turn sequence.");
            this.eventManager.emit('battleEnd', { reason: 'noUnits' });
            return;
        }

        this.currentTurn++;
        console.log(`\n--- Turn ${this.currentTurn} Starts ---`);
        this.eventManager.emit('turnStart', { turn: this.currentTurn });

        // 1. 턴 시작 단계 콜백 실행
        for (const callback of this.turnPhaseCallbacks.startOfTurn) {
            await callback(); // 비동기 콜백을 기다립니다.
        }

        // 2. 각 유닛의 행동 처리
        for (let i = 0; i < this.turnOrder.length; i++) {
            const unit = this.turnOrder[i];
            this.activeUnitIndex = i;
            console.log(`[TurnEngine] Processing turn for unit: ${unit.name} (ID: ${unit.id})`);
            this.eventManager.emit('unitTurnStart', { unitId: unit.id, unitName: unit.name });

            // 유닛의 행동 로직을 여기에 추가하거나, 별도 매니저에 위임할 수 있습니다.
            // 임시로, 첫 번째 유닛이 두 번째 유닛을 공격하는 시뮬레이션
            if (unit.type === 'mercenary' && this.turnOrder.find(u => u.type === 'enemy')) {
                const targetEnemy = this.turnOrder.find(u => u.type === 'enemy');
                if (targetEnemy) {
                    console.log(`[TurnEngine] ${unit.name} attacks ${targetEnemy.name}!`);
                    // BattleCalculationManager에 대미지 계산 요청
                    this.eventManager.emit('unitAttackAttempt', {
                        attackerId: unit.id,
                        targetId: targetEnemy.id,
                        attackType: 'melee'
                    });
                }
            } else if (unit.type === 'enemy' && this.turnOrder.find(u => u.type === 'mercenary')) {
                const targetAlly = this.turnOrder.find(u => u.type === 'mercenary');
                if (targetAlly) {
                    console.log(`[TurnEngine] ${unit.name} attacks ${targetAlly.name}!`);
                    this.eventManager.emit('unitAttackAttempt', {
                        attackerId: unit.id,
                        targetId: targetAlly.id,
                        attackType: 'melee'
                    });
                }
            }

            for (const callback of this.turnPhaseCallbacks.unitActions) {
                await callback(unit);
            }
            this.eventManager.emit('unitTurnEnd', { unitId: unit.id, unitName: unit.name });

            // 유닛 사망 처리 (간단화)
            this.turnOrder = this.turnOrder.filter(u => u.currentHp > 0);
            if (this.turnOrder.length === 0) {
                console.log("[TurnEngine] All units defeated! Battle Over.");
                this.eventManager.emit('battleEnd', { reason: 'allUnitsDefeated' });
                return;
            }
        }

        // 3. 턴 종료 단계 콜백 실행
        for (const callback of this.turnPhaseCallbacks.endOfTurn) {
            await callback();
        }

        console.log(`--- Turn ${this.currentTurn} Ends ---\n`);

        // 다음 턴을 예약 (예: 짧은 지연 후)
        setTimeout(() => {
            if (this.eventManager.getGameRunningState()) { // 게임이 계속 실행 중일 때만 다음 턴 진행
                this.nextTurn();
            } else {
                console.log("[TurnEngine] Game is paused or ended, not proceeding to next turn.");
            }
        }, 1000); // 각 턴 사이에 1초 지연
    }

    /**
     * 특정 턴 단계에 실행될 콜백 함수를 등록합니다.
     * @param {'startOfTurn'|'unitActions'|'endOfTurn'} phase - 턴 단계
     * @param {function} callback - 실행할 콜백 함수
     */
    addTurnPhaseCallback(phase, callback) {
        if (this.turnPhaseCallbacks[phase]) {
            this.turnPhaseCallbacks[phase].push(callback);
            console.log(`[TurnEngine] Registered callback for '${phase}' phase.`);
        } else {
            console.warn(`[TurnEngine] Invalid turn phase: ${phase}`);
        }
    }
}
