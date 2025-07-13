// tests/unit/compatibilityManagerUnitTests.js

export function runCompatibilityManagerUnitTests(compatibilityManagerClass) {
    console.log("--- CompatibilityManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // \ubaa8\uc758 MeasureManager
    const mockMeasureManager = {
        _resolution: { width: 1280, height: 720 },
        get: (keyPath) => {
            if (keyPath === 'gameResolution.width') return mockMeasureManager._resolution.width;
            if (keyPath === 'gameResolution.height') return mockMeasureManager._resolution.height;
            if (keyPath === 'mercenaryPanel.heightRatio') return 0.25;
            if (keyPath === 'combatLog.heightRatio') return 0.15;
            return undefined;
        },
        updateGameResolution: function(width, height) {
            this._resolution.width = width;
            this._resolution.height = height;
        }
    };

    // \ubaa8\uc758 Renderer
    const mockRenderer = {
        canvas: { width: 0, height: 0 }
    };

    // mock LogicManager with minimum resolution info
    const mockLogicManager = {
        getMinGameResolution: () => ({ minWidth: 800, minHeight: 600 })
    };

    // \ubaa8\uc758 UIEngine, MapManager
    const mockUIEngine = {
        recalculateUIDimensionsCalled: false,
        recalculateUIDimensions: function() { this.recalculateUIDimensionsCalled = true; }
    };
    const mockMapManager = {
        recalculateMapDimensionsCalled: false,
        recalculateMapDimensions: function() { this.recalculateMapDimensionsCalled = true; }
    };

    // \ud14c\uc2a4\ud2b8 \ud658\uacbd \uc124\uc815 (window.innerWidth/Height \ubaa8\uc758)
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;

    function setViewport(width, height) {
        Object.defineProperty(window, 'innerWidth', { writable: true, value: width });
        Object.defineProperty(window, 'innerHeight', { writable: true, value: height });
    }

    function computeExpectedResolution(vw, vh) {
        const totalPadding = 20;
        const totalMarginBetweenCanvases = 20;
        const totalVertical = totalPadding + totalMarginBetweenCanvases;
        const aspect = mockMeasureManager._resolution.width / mockMeasureManager._resolution.height;
        const mercenaryPanelHeightRatio = 0.25;
        const combatLogHeightRatio = 0.15;
        const maxWidth = vw - totalPadding;
        const maxHeight = vh - totalVertical;
        const totalUnits = 1 + mercenaryPanelHeightRatio + combatLogHeightRatio;
        let heightFromWidth = maxWidth / aspect;
        let heightFromHeight = maxHeight / totalUnits;
        let mainHeight = Math.floor(Math.min(heightFromWidth, heightFromHeight));
        let mainWidth = Math.floor(mainHeight * aspect);
        if (mainWidth <= 0 || mainHeight <= 0) {
            mainWidth = 800;
            mainHeight = 600;
        }
        if (mainWidth < 800 || mainHeight < 600) {
            const scaleW = 800 / mainWidth;
            const scaleH = 600 / mainHeight;
            const scale = Math.max(scaleW, scaleH);
            mainWidth = Math.floor(mainWidth * scale);
            mainHeight = Math.floor(mainHeight * scale);
            mainWidth = Math.max(mainWidth, 800);
            mainHeight = Math.max(mainHeight, 600);
        }
        return { width: mainWidth, height: mainHeight };
    }

    // \ud14c\uc2a4\ud2b8 1: \ucd08\uae30\ud654 \ubc0f \ucd08\uae30 \uc870\uc815 \ud655\uc778 (Landscape)
    testCount++;
    setViewport(1920, 1080);
    const compatibilityManager1 = new compatibilityManagerClass(mockMeasureManager, mockRenderer, mockUIEngine, mockMapManager, mockLogicManager);
    compatibilityManager1.adjustResolution();

    const expected1 = computeExpectedResolution(1920, 1080);
    if (mockMeasureManager._resolution.width === expected1.width && mockMeasureManager._resolution.height === expected1.height) {
        console.log("CompatibilityManager: Initial adjustment (Landscape) correct. [PASS]");
        passCount++;
    } else {
        console.error("CompatibilityManager: Initial adjustment (Landscape) failed. [FAIL]", mockMeasureManager._resolution);
    }
    mockUIEngine.recalculateUIDimensionsCalled = false;
    mockMapManager.recalculateMapDimensionsCalled = false;

    // \ud14c\uc2a4\ud2b8 2: \uc138\ub85c \ubaa8\ub4dc (Portrait) - \ub108\ube44\uc5d0 \ub9de\ucf1c \ub192\uc774 \uc2a4\ucf04
    testCount++;
    setViewport(720, 1280);
    compatibilityManager1.adjustResolution();

    const expected2 = computeExpectedResolution(720, 1280);
    if (mockMeasureManager._resolution.width === expected2.width && mockMeasureManager._resolution.height === expected2.height) {
        console.log("CompatibilityManager: Adjustment (Portrait) correct. [PASS]");
        passCount++;
    } else {
        console.error("CompatibilityManager: Adjustment (Portrait) failed. [FAIL]", mockMeasureManager._resolution);
    }
    if (mockUIEngine.recalculateUIDimensionsCalled && mockMapManager.recalculateMapDimensionsCalled) {
        console.log("CompatibilityManager: UIEngine and MapManager recalculation called. [PASS]");
        passCount++;
    } else {
        console.error("CompatibilityManager: UIEngine and MapManager recalculation NOT called. [FAIL]");
    }
    mockUIEngine.recalculateUIDimensionsCalled = false;
    mockMapManager.recalculateMapDimensionsCalled = false;

    // \ud14c\uc2a4\ud2b8 3: \uac70\ubd80 \ubaa8\ub4dc (Landscape) - \ub192\uc774\uc5d0 \ub9de\ucf1c \ub108\ube44 \uc2a4\ucf04
    testCount++;
    setViewport(1000, 500);
    compatibilityManager1.adjustResolution();

    const expected3 = computeExpectedResolution(1000, 500);
    if (mockMeasureManager._resolution.width === expected3.width && mockMeasureManager._resolution.height === expected3.height) {
        console.log("CompatibilityManager: Adjustment (Landscape small) correct. [PASS]");
        passCount++;
    } else {
        console.error("CompatibilityManager: Adjustment (Landscape small) failed. [FAIL]", mockMeasureManager._resolution);
    }

    // \ud14c\uc2a4\ud2b8 4: \ubdf0\ud3ec\ud2b8\uac00 0\uc77c \ub54c (\uc608\uc81c \ucc98\ub9ac)
    testCount++;
    setViewport(0, 0);
    const originalWarn = console.warn;
    let warnCalled = false;
    console.warn = (msg) => {
        if (msg.includes("Calculated main game resolution is zero or negative")) {
            warnCalled = true;
        }
        originalWarn(msg);
    };
    try {
        compatibilityManager1.adjustResolution();
        const expectedZero = computeExpectedResolution(0, 0);
        if (mockMeasureManager._resolution.width === expectedZero.width && mockMeasureManager._resolution.height === expectedZero.height && warnCalled) {
            console.log("CompatibilityManager: Handles zero viewport gracefully. [PASS]");
            passCount++;
        } else {
            console.error("CompatibilityManager: Failed to handle zero viewport. [FAIL]", mockMeasureManager._resolution);
        }
    } catch (e) {
        console.error("CompatibilityManager: Threw unexpected error with zero viewport. [FAIL]", e);
    } finally {
        console.warn = originalWarn;
    }

    // \ubdf0\ud3ec\ud2b8 \uc6d0\ubcf8\uc73c\ub85c \ubcf5\uc6d0
    setViewport(originalInnerWidth, originalInnerHeight);

    console.log(`--- CompatibilityManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}

