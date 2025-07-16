export class RevertManager {
    constructor(battleSimulationManager, timingEngine, delayEngine) {
        console.log("\u21a9\ufe0f RevertManager initialized. Ready to restore previous states. \u21a9\ufe0f");
        this.battleSimulationManager = battleSimulationManager;
        this.timingEngine = timingEngine;
        this.delayEngine = delayEngine;
        this.originalStates = new Map(); // key: unitId, value: { originalImage: HTMLImageElement }
    }

    /**
     * \uc720\ub2c8\ud2b8\uc758 \ud604\uc7ac \uc0c1\ud0dc(\uc608: \uc774\ubbf8\uc9c0)\ub97c \uc800\uc7a5\ud569\ub2c8\ub2e4.
     * @param {string} unitId - \uc0c1\ud0dc\ub97c \uc800\uc7a5\ud560 \uc720\ub2c8\ud2b8\uc758 ID
     * @param {HTMLImageElement} originalImage - \uc800\uc7a5\ud560 \uc6d0\ubcf8 \uc774\ubbf8\uc9c0 \uac1d\uccb4
     */
    saveState(unitId, originalImage) {
        this.originalStates.set(unitId, { originalImage });
        console.log(`[RevertManager] Saved original state for unit '${unitId}'.`);
    }

    /**
     * \uc800\uc7a5\ub41c \uc0c1\ud0dc\ub85c \uc720\ub2c8\ud2b8\ub97c \ubc18\ud658\ud569\ub2c8\ub2e4.
     * @param {string} unitId - \uc0c1\ud0dc\ub97c \ubc18\ud658\ud560 \uc720\ub2c8\ud2b8\uc758 ID
     * @param {number} delayMs - \uc774\ubbf8\uc9c0\ub97c \ubc18\ud658\ud558\uae30 \uc804 \ub300\uae30\ud560 \uc2dc\uac04 (\ubc00\ub9ac\ucd08)
     */
    revertState(unitId, delayMs = 300) {
        const savedState = this.originalStates.get(unitId);
        const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === unitId);

        if (savedState && unit) {
            this.timingEngine.addTimedAction(async () => {
                await this.delayEngine.waitFor(delayMs);
                unit.image = savedState.originalImage;
                this.originalStates.delete(unitId);
                console.log(`[RevertManager] Reverted unit '${unitId}' to original state.`);
            }, 500, `Revert ${unitId} Image`);
        } else {
            console.warn(`[RevertManager] No saved state or unit found for '${unitId}'. Cannot revert.`);
        }
    }
}
