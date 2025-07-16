// js/managers/HeroManager.js

import { ATTACK_TYPES } from '../constants.js';
import { UNITS } from '../../data/unit.js';
import { CLASSES } from '../../data/class.js';
import { WARRIOR_SKILLS } from '../../data/warriorSkills.js';

export class HeroManager {
    constructor(idManager, diceEngine, assetLoaderManager, battleSimulationManager, unitSpriteEngine) {
        console.log("✨ HeroManager initialized. Ready to create legendary heroes. ✨");
        this.idManager = idManager;
        this.diceEngine = diceEngine;
        this.assetLoaderManager = assetLoaderManager;
        this.battleSimulationManager = battleSimulationManager;
        this.unitSpriteEngine = unitSpriteEngine;
        this.heroNameList = [
            '레오닉', '아서스', '가로쉬', '스랄', '제이나', '안두인',
            '바리안', '실바나스', '그롬마쉬', '렉사르', '알렉스트라자', '이렐리아'
        ];
    }

    /**
     * 지정된 수만큼의 전사 클래스 영웅 데이터를 생성하여 반환합니다.
     * @param {number} count - 생성할 영웅의 수
     * @param {object} warriorClassData - IdManager를 거치지 않고 직접 받은 전사 클래스 데이터
     * @returns {Promise<object[]>} 생성된 영웅 데이터 배열
     */
    async createWarriors(count, warriorClassData) {
        console.log(`[HeroManager] Creating data for ${count} new warriors...`);
        
        // idManager에서 데이터를 비동기적으로 가져오는 대신,
        // BattleEngine으로부터 직접 받은 데이터를 사용합니다.
        if (!warriorClassData) {
            console.error('[HeroManager] warriorClassData was not provided to createWarriors. Aborting.');
            return [];
        }

        const warriorImage = this.assetLoaderManager.getImage(UNITS.WARRIOR.spriteId);

        // 데이터가 없어도 오류가 나지 않도록 기본값을 항상 보장합니다.
        const statRanges = warriorClassData.statRanges || {};
        const availableSkills = warriorClassData.availableSkills || [];
        const tags = warriorClassData.tags || [];

        // 이름 목록이 없으면 기본 이름을 사용하여 오류를 방지합니다.
        const heroNames = Array.isArray(this.heroNameList) && this.heroNameList.length > 0
            ? this.heroNameList
            : ['Warrior'];

        if (!warriorImage) {
            console.error('[HeroManager] Warrior image not found. Cannot create warriors.');
            return [];
        }

        const createdHeroes = [];

        for (let i = 0; i < count; i++) {
            const unitId = `hero_warrior_${Date.now()}_${i}`;
            const randomName = heroNames[this.diceEngine.getRandomInt(0, heroNames.length - 1)];

            const baseStats = {};
            for (const stat in statRanges) {
                // statRanges가 비어있지 않다면 값을 생성합니다.
                if (statRanges[stat] && Array.isArray(statRanges[stat])) {
                    baseStats[stat] = this.diceEngine.getRandomInt(statRanges[stat][0], statRanges[stat][1]);
                }
            }
             // HP가 생성되지 않은 경우를 대비한 안전장치
            if (!baseStats.hp) {
                baseStats.hp = 100;
            }

            const randomSkills = new Set();
            while (randomSkills.size < 3 && availableSkills.length > randomSkills.size) {
                const randomIndex = this.diceEngine.getRandomInt(0, availableSkills.length - 1);
                randomSkills.add(availableSkills[randomIndex]);
            }

            const heroUnitData = {
                id: unitId,
                name: randomName,
                classId: warriorClassData.id,
                type: ATTACK_TYPES.MERCENARY,
                spriteId: UNITS.WARRIOR.spriteId,
                gridX: 0,
                gridY: 0,
                baseStats: baseStats,
                currentHp: baseStats.hp,
                skillSlots: [...randomSkills],
                tags: [...tags]
            };

            await this.idManager.addOrUpdateId(unitId, heroUnitData);
            await this.unitSpriteEngine.registerUnitSprites(unitId, {
                idle: 'assets/images/warrior.png',
                attack: 'assets/images/warrior-attack.png',
                hitted: 'assets/images/warrior-hitted.png',
                finish: 'assets/images/warrior-finish.png',
                status: 'assets/images/warrior-status-effects.png'
            });

            createdHeroes.push(heroUnitData);
            console.log(`[HeroManager] Created data for warrior: ${heroUnitData.name}`);
        }
        return createdHeroes;
    }
}
