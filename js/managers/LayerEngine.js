// js/managers/LayerEngine.js

export class LayerEngine {
    constructor(renderer) {
        console.log("\uD83C\uDCC3 LayerEngine initialized. Ready to manage rendering layers. \uD83C\uDCC3");
        this.renderer = renderer;
        this.layers = [];
    }

    registerLayer(name, drawFunction, zIndex) {
        const existingLayerIndex = this.layers.findIndex(layer => layer.name === name);
        if (existingLayerIndex !== -1) {
            console.warn(`[LayerEngine] Layer '${name}' already exists. Overwriting.`);
            this.layers[existingLayerIndex] = { name, drawFunction, zIndex };
        } else {
            this.layers.push({ name, drawFunction, zIndex });
        }
        this.layers.sort((a, b) => a.zIndex - b.zIndex);
        console.log(`[LayerEngine] Registered layer: ${name} with zIndex: ${zIndex}`);
    }

    draw() {
        this.renderer.clear();
        this.renderer.drawBackground();

        for (const layer of this.layers) {
            layer.drawFunction(this.renderer.ctx);
        }
    }
}
