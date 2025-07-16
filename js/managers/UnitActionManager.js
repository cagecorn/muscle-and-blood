// js/managers/UnitActionManager.js

import { GAME_EVENTS, GAME_DEBUG_MODE } from '../constants.js';

export class UnitActionManager {
    /**
     * UnitActionManager를 초기화합니다.
     * @param {EventManager} eventManager - 게임 이벤트를 구독하기 위한 인스턴스
     * @param {UnitSpriteEngine} unitSpriteEngine - 스프라이트 변경을 요청할 엔진 인스턴스
     * @param {DelayEngine} delayEngine - 행동 후 기본 상태로 돌아오기 위한 지연 처리 인스턴스
     */
    constructor(eventManager, unitSpriteEngine, delayEngine) {
        if (GAME_DEBUG_MODE) console.log("\uD83D\uDD75\uFE0F UnitActionManager initialized. Detecting unit actions. \uD83D\uDD75\uFE0F");
        this.eventManager = eventManager;
        this.unitSpriteEngine = unitSpriteEngine;
        this.delayEngine = delayEngine;

        this._setupEventListeners();
    }

    _setupEventListeners() {
        // 유닛 공격 시도 이벤트 구독
        this.eventManager.subscribe(GAME_EVENTS.UNIT_ATTACK_ATTEMPT, this._onUnitAttack.bind(this));
        // 유닛 피해 표시 이벤트 구독
        this.eventManager.subscribe(GAME_EVENTS.DISPLAY_DAMAGE, this._onUnitHitted.bind(this));
        // 유닛 사망 이벤트 구독
        this.eventManager.subscribe(GAME_EVENTS.UNIT_DEATH, this._onUnitDeath.bind(this));

        if (GAME_DEBUG_MODE) console.log("[UnitActionManager] Subscribed to unit action events.");
    }

    _onUnitAttack({ attackerId }) {
        if (GAME_DEBUG_MODE) console.log(`[UnitActionManager] Attack detected from ${attackerId}.`);
        this.unitSpriteEngine.setUnitSprite(attackerId, 'attack');

        // 공격 애니메이션 시간만큼 기다린 후 기본 상태로 복귀
        this.delayEngine.waitFor(800).then(() => {
            this.unitSpriteEngine.setUnitSprite(attackerId, 'idle');
        });
    }

    _onUnitHitted({ unitId, damage }) {
        if (damage > 0) {
            if (GAME_DEBUG_MODE) console.log(`[UnitActionManager] Unit ${unitId} was hitted.`);
            this.unitSpriteEngine.setUnitSprite(unitId, 'hitted');

            // 피격 애니메이션 시간만큼 기다린 후 기본 상태로 복귀
            this.delayEngine.waitFor(800).then(() => {
                this.unitSpriteEngine.setUnitSprite(unitId, 'idle');
            });
        }
    }

    _onUnitDeath({ unitId }) {
        if (GAME_DEBUG_MODE) console.log(`[UnitActionManager] Death detected for ${unitId}.`);
        this.unitSpriteEngine.setUnitSprite(unitId, 'finish');
        // 죽은 후에는 기본 상태로 돌아가지 않습니다.
    }
}

