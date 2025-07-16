// js/managers/HeroManager.js

import { ATTACK_TYPES } from '../constants.js';
import { UNITS } from '../../data/unit.js';
import { CLASSES } from '../../data/class.js';
import { WARRIOR_SKILLS } from '../../data/warriorSkills.js';

export class HeroManager {
    constructor(idManager, diceEngine, assetLoaderManager, battleSimulationManager, unitSpriteEngine) {
        console.log("\u2728 HeroManager initialized. Ready to create legendary heroes. \u2728");
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
     * @returns {Promise<object[]>} 생성된 영웅 데이터 배열
     */
    async createWarriors(count) {
        console.log(`[HeroManager] Creating data for ${count} new warriors...`);
        let warriorClassData = await this.idManager.get(CLASSES.WARRIOR.id);
        const warriorImage = this.assetLoaderManager.getImage(UNITS.WARRIOR.spriteId);

        if (!warriorClassData) {
            console.warn('[HeroManager] Warrior class not registered in IdManager, falling back to static data.');
            warriorClassData = CLASSES.WARRIOR;
            try {
                await this.idManager.addOrUpdateId(CLASSES.WARRIOR.id, warriorClassData);
            } catch (e) {
                console.error('[HeroManager] Failed to register warrior class to IdManager:', e);
            }
        }

        const statRanges = warriorClassData.statRanges || {};
        const availableSkills = warriorClassData.availableSkills || [];

        if (!warriorImage) {
            console.error('[HeroManager] Warrior image not found. Cannot create warriors.');
            return [];
        }

        const createdHeroes = [];

        for (let i = 0; i < count; i++) {
            const unitId = `hero_warrior_${Date.now()}_${i}`;
            const randomName = this.heroNameList[this.diceEngine.getRandomInt(0, this.heroNameList.length - 1)];

            const baseStats = {};
            for (const stat in statRanges) {
                baseStats[stat] = this.diceEngine.getRandomInt(statRanges[stat][0], statRanges[stat][1]);
            }

            const randomSkills = new Set();
            while (randomSkills.size < 3 && availableSkills.length > randomSkills.size) {
                const randomIndex = this.diceEngine.getRandomInt(0, availableSkills.length - 1);
                randomSkills.add(availableSkills[randomIndex]);
            }

            const heroUnitData = {
                id: unitId,
                name: randomName,
                classId: CLASSES.WARRIOR.id,
                type: ATTACK_TYPES.MERCENARY,
                spriteId: UNITS.WARRIOR.spriteId,
                gridX: 0,
                gridY: 0,
                baseStats: baseStats,
                currentHp: baseStats.hp,
                skillSlots: [...randomSkills],
                tags: [...CLASSES.WARRIOR.tags]
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
