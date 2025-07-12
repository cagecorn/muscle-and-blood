// tests/unit/sceneManagerUnitTests.js

export function runSceneManagerUnitTests(sceneManager) {
    console.log("--- SceneManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // \ubaa8\uc758 \ub9e4\ub2c8\uc800 (SceneManager\uc5d0 \ub4f1\ub85d\ub420 \ub9e4\ub2c8\uc800\ub4e4)
    const mockTerritoryManager = {
        name: "MockTerritoryManager",
        drawCalled: false,
        updateCalled: false,
        draw: function(ctx) { this.drawCalled = true; },
        update: function(deltaTime) { this.updateCalled = true; }
    };
    const mockBattleStageManager = {
        name: "MockBattleStageManager",
        drawCalled: false,
        updateCalled: false,
        draw: function(ctx) { this.drawCalled = true; },
        update: function(deltaTime) { this.updateCalled = true; }
    };
    const mockBattleGridManager = {
        name: "MockBattleGridManager",
        drawCalled: false,
        updateCalled: false,
        draw: function(ctx) { this.drawCalled = true; },
        update: function(deltaTime) { this.updateCalled = true; }
    };

    // \ud14c\uc2a4\ud2b8 1: SceneManager \ucd08\uae30\ud654 \ubc0f \uc2fc \ub4f1\ub85d
    testCount++;
    try {
        sceneManager.registerScene('testTerritoryScene', [mockTerritoryManager]);
        sceneManager.registerScene('testBattleScene', [mockBattleStageManager, mockBattleGridManager]);
        if (sceneManager.scenes.has('testTerritoryScene') && sceneManager.scenes.has('testBattleScene')) {
            console.log("SceneManager: Scenes registered successfully. [PASS]");
            passCount++;
        } else {
            console.error("SceneManager: Scene registration failed. [FAIL]");
        }
    } catch (e) {
        console.error("SceneManager: Error during scene registration. [FAIL]", e);
    }

    // \ud14c\uc2a4\ud2b8 2: \ud604\uc7ac \uc2fc \uc124\uc815
    testCount++;
    try {
        sceneManager.setCurrentScene('testTerritoryScene');
        if (sceneManager.getCurrentSceneName() === 'testTerritoryScene') {
            console.log("SceneManager: Current scene set to territory. [PASS]");
            passCount++;
        } else {
            console.error("SceneManager: Failed to set current scene to territory. [FAIL]");
        }
    } catch (e) {
        console.error("SceneManager: Error setting current scene. [FAIL]", e);
    }

    // \ud14c\uc2a4\ud2b8 3: \uc2fc \uc5c5\ub370\uc774\ud2b8 (\uc601\uc9c0 \uc2fc)
    testCount++;
    try {
        mockTerritoryManager.updateCalled = false; // \ud50c\ub798\uadf8 \ucd08\uae30\ud654
        sceneManager.update(16); // deltaTime
        if (mockTerritoryManager.updateCalled) {
            console.log("SceneManager: Territory scene managers updated successfully. [PASS]");
            passCount++;
        } else {
            console.error("SceneManager: Territory scene managers update failed. [FAIL]");
        }
    } catch (e) {
        console.error("SceneManager: Error during scene update. [FAIL]", e);
    }

    // \ud14c\uc2a4\ud2b8 4: \uc2fc \uadf8\ub9ac\uae30 (\uc601\uc9c0 \uc2fc)
    testCount++;
    try {
        mockTerritoryManager.drawCalled = false; // \ud50c\ub798\uadf8 \ucd08\uae30\ud654
        // \ubaa8\uc758 \uce90\ubc84\uc2a4 \ucee8\ud14c\ud2b8\uc2a4
        const mockCtx = {
            canvas: { width: 800, height: 600 },
            fillRect: () => {}, fillText: () => {},
            save: () => {}, restore: () => {},
            translate: () => {}, scale: () => {}
        };
        sceneManager.draw(mockCtx);
        if (mockTerritoryManager.drawCalled) {
            console.log("SceneManager: Territory scene managers drawn successfully. [PASS]");
            passCount++;
        } else {
            console.error("SceneManager: Territory scene managers draw failed. [FAIL]");
        }
    } catch (e) {
        console.error("SceneManager: Error during scene draw. [FAIL]", e);
    }

    // \ud14c\uc2a4\ud2b8 5: \ud604\uc7ac \uc2fc \ubcc0\uacbd \ubc0f \uc5c5\ub370\uc774\ud2b8 (\ubc30\ud2c0 \uc2fc)
    testCount++;
    try {
        sceneManager.setCurrentScene('testBattleScene');
        mockBattleStageManager.updateCalled = false;
        mockBattleGridManager.updateCalled = false;
        sceneManager.update(16);
        if (mockBattleStageManager.updateCalled && mockBattleGridManager.updateCalled) {
            console.log("SceneManager: Battle scene managers updated successfully. [PASS]");
            passCount++;
        } else {
            console.error("SceneManager: Battle scene managers update failed. [FAIL]");
        }
    } catch (e) {
        console.error("SceneManager: Error during battle scene update. [FAIL]", e);
    }

    // \ud14c\uc2a4\ud2b8 6: \uc2fc \uadf8\ub9ac\uae30 (\ubc30\ud2c0 \uc2fc)
    testCount++;
    try {
        mockBattleStageManager.drawCalled = false;
        mockBattleGridManager.drawCalled = false;
        const mockCtx = {
            canvas: { width: 800, height: 600 },
            fillRect: () => {}, fillText: () => {}, strokeRect: () => {},
            save: () => {}, restore: () => {},
            translate: () => {}, scale: () => {},
            beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {}
        };
        sceneManager.draw(mockCtx);
        if (mockBattleStageManager.drawCalled && mockBattleGridManager.drawCalled) {
            console.log("SceneManager: Battle scene managers drawn successfully. [PASS]");
            passCount++;
        } else {
            console.error("SceneManager: Battle scene managers draw failed. [FAIL]");
        }
    } catch (e) {
        console.error("SceneManager: Error during battle scene draw. [FAIL]", e);
    }

    console.log(`--- SceneManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}

