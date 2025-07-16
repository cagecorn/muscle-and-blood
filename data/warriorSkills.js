// data/warriorSkills.js

// 스킬 타입 상수는 필요에 따라 별도의 constants.js 파일로 이동 가능
export const SKILL_TYPES = {
    ACTIVE: 'active',
    PASSIVE: 'passive',
    DEBUFF: 'debuff',
    REACTION: 'reaction',
    BUFF: 'buff'
};

export const WARRIOR_SKILLS = {
    // 액티브 스킬 (첫 번째 슬롯에 있으면 좋은 스킬 예시)
    CHARGE: {
        id: 'skill_warrior_charge',
        name: '돌격',
        type: SKILL_TYPES.ACTIVE,
        probability: 40, // 이 확률은 RuleManager에 정의된 슬롯 확률에 따라 재조정될 수 있습니다.
        description: '적에게 돌진하여 물리 피해를 입힙니다. 이동과 공격을 동시에 수행합니다.',
        requiredUserTags: ['근접'], // 근접 태그를 가진 유닛만 사용 가능
        effect: {
            damageMultiplier: 1.5,
            stunChance: 0.2 // 20% 확률로 기절
        }
    },
    // 버프 스킬 (한 턴에 스킬 + 일반 공격 예시)
    BATTLE_CRY: {
        id: 'skill_warrior_battle_cry',
        name: '전투의 외침',
        type: SKILL_TYPES.BUFF,
        probability: 30,
        description: '자신의 공격력을 일시적으로 증가시키고 일반 공격을 수행합니다.',
        requiredUserTags: ['전사_클래스'],
        effect: {
            statBuff: { type: 'attack', amount: 10, duration: 1 }, // 공격력 10 증가, 1턴 지속
            allowAdditionalAttack: true // 버프 후 추가 공격 가능 (이것이 이 스킬 타입의 핵심)
        }
    },
    // 디버프 스킬 (일반 공격 시 묻어남 예시)
    RENDING_STRIKE: {
        id: 'skill_warrior_rending_strike',
        name: '찢어발기기',
        type: SKILL_TYPES.DEBUFF,
        probability: 20,
        description: '일반 공격 시 적에게 출혈 디버프를 부여할 확률이 있습니다.',
        requiredUserTags: ['근접'],
        effect: {
            statusEffectId: 'status_bleed', // 출혈 상태 이상 ID
            applyChance: 0.5 // 50% 확률로 적용
        }
    },
    // 리액션 스킬 (공격 받을 시 발동 예시)
    RETALIATE: {
        id: 'skill_warrior_retaliate',
        name: '반격',
        type: SKILL_TYPES.REACTION,
        probability: 30, // 이 확률은 공격받을 때마다 다시 계산됩니다.
        description: '공격을 받을 시 일정 확률로 즉시 반격합니다.',
        requiredUserTags: ['방어'],
        effect: {
            counterAttackDamageMultiplier: 0.8 // 80% 공격력으로 반격
        }
    },
    // 패시브 스킬 (상시 발동 예시)
    IRON_WILL: {
        id: 'skill_warrior_iron_will',
        name: '강철 의지',
        type: SKILL_TYPES.PASSIVE,
        probability: 0, // 패시브는 확률 없음
        description: '받는 마법 피해가 감소합니다.',
        requiredUserTags: ['방어'],
        effect: {
            magicDamageReduction: 0.15 // 마법 피해 15% 감소
        }
    }
};
