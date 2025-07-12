// js/managers/BindingManager.js

export class BindingManager {
    constructor() {
        console.log("\ud83d\udd17 BindingManager initialized. Ready to bind visual components to units. \ud83d\udd17");
        this.unitBindings = new Map();
    }

    bindUnit(unitId, components) {
        if (this.unitBindings.has(unitId)) {
            console.warn(`[BindingManager] Unit '${unitId}' already has existing bindings. Overwriting.`);
        }
        this.unitBindings.set(unitId, components);
        console.log(`[BindingManager] Bound components to unit '${unitId}'.`);
    }

    getBindings(unitId) {
        return this.unitBindings.get(unitId);
    }

    unbindUnit(unitId) {
        if (this.unitBindings.has(unitId)) {
            this.unitBindings.delete(unitId);
            console.log(`[BindingManager] Unbound components from unit '${unitId}'.`);
            return true;
        }
        console.warn(`[BindingManager] No bindings found for unit '${unitId}'.`);
        return false;
    }

    clearAllBindings() {
        this.unitBindings.clear();
        console.log("[BindingManager] All unit bindings cleared.");
    }
}
