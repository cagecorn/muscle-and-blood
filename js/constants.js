export const GAME_EVENTS = {
    UNIT_DEATH: 'unitDeath',
    SKILL_EXECUTED: 'skillExecuted',
    BATTLE_START: 'battleStart',
    BATTLE_END: 'battleEnd',
    TURN_START: 'turnStart',
    UNIT_TURN_START: 'unitTurnStart',
    UNIT_TURN_END: 'unitTurnEnd',
    UNIT_ATTACK_ATTEMPT: 'unitAttackAttempt',
    DAMAGE_CALCULATED: 'DAMAGE_CALCULATED',
    DISPLAY_DAMAGE: 'displayDamage',
    STATUS_EFFECT_APPLIED: 'statusEffectApplied',
    STATUS_EFFECT_REMOVED: 'statusEffectRemoved',
    LOG_MESSAGE: 'logMessage',
    WEAPON_DROPPED: 'weaponDropped',
    UNIT_DISARMED: 'unitDisarmed',
    UNIT_CAPTURED: 'unitCaptured',
    REQUEST_STATUS_EFFECT_APPLICATION: 'requestStatusEffectApplication',
    DRAG_START: 'dragStart',
    DRAG_MOVE: 'dragMove',
    DROP: 'drop',
    DRAG_CANCEL: 'dragCancel'
};

export const UI_STATES = {
    MAP_SCREEN: 'mapScreen',
    COMBAT_SCREEN: 'combatScreen',
    HERO_PANEL_OVERLAY: 'heroPanelOverlay'
};

export const BUTTON_IDS = {
    // 캔버스에 그려지는 버튼 ID (현재는 사용하지 않음)
    // BATTLE_START: 'battleStartButton',

    // HTML 버튼 ID
    TOGGLE_HERO_PANEL: 'toggleHeroPanelBtn',
    BATTLE_START_HTML: 'battleStartHtmlBtn'
};

export const ATTACK_TYPES = {
    MELEE: 'melee',
    PHYSICAL: 'physical',
    MAGIC: 'magic',
    STATUS_EFFECT: 'statusEffect',
    MERCENARY: 'mercenary',
    ENEMY: 'enemy'
};
