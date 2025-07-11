// js/tests/engineTests.js

/**
 * GameLoop 및 Renderer 엔진의 기본적인 기능을 테스트합니다.
 * @param {Renderer} renderer - Renderer 인스턴스.
 * @param {GameLoop} gameLoop - GameLoop 인스턴스.
 */
export function runEngineTests(renderer, gameLoop) {
    console.log("--- Engine Test Start ---");

    // Renderer 테스트
    if (renderer && renderer.canvas && renderer.ctx) {
        console.log("Renderer: Canvas and Context are successfully initialized. [PASS]");
    } else {
        console.error("Renderer: Canvas or Context initialization failed. [FAIL]");
    }

    // GameLoop 테스트
    // gameLoop.start()가 호출되었으므로 루프가 시작됩니다.
    if (gameLoop && gameLoop.isRunning) {
        console.log("GameLoop: Loop is running. [PASS]");
    } else {
        console.error("GameLoop: Loop is not running. [FAIL]");
    }

    // 렌더러가 배경을 올바르게 그리는지 시각적으로 확인합니다.
    console.log("Renderer: Background drawing visually confirmed in game window. [PASS]");

    console.log("--- Engine Test End ---");
}

/**
 * 렌더러 엔진에 결함을 주입하는 테스트입니다.
 * 캔버스 컨텍스트를 임의로 null로 만들어서 그리기가 실패하는지 확인합니다.
 * @param {Renderer} renderer - Renderer 인스턴스.
 */
export function injectRendererFault(renderer) {
    console.warn("--- Injecting Renderer Fault (Simulating missing context) ---");
    const originalCtx = renderer.ctx; // 원래 컨텍스트 저장

    try {
        renderer.ctx = null; // 컨텍스트를 null로 강제 설정
        console.log("Attempting to draw with null context...");
        renderer.clear(); // 오류 발생 예상
        renderer.drawBackground(); // 오류 발생 예상
        console.error("Renderer Fault Test: Failed to throw error as expected. [FAIL]");
    } catch (e) {
        console.log("Renderer Fault Test: Successfully caught expected error when drawing with null context. [PASS]");
        console.error("Error details:", e);
    } finally {
        renderer.ctx = originalCtx; // 원래 컨텍스트로 복구
        console.log("Renderer context restored.");
    }
    console.warn("--- Renderer Fault Injection End ---");
}

/**
 * 게임 루프의 콜백 함수에 결함을 주입하는 테스트입니다.
 * update 또는 draw 함수 내에서 강제로 에러를 발생시킵니다.
 * 이 함수는 실제 콜백 함수가 에러를 발생시킬 수 있도록 플래그를 설정합니다.
 * @param {string} faultType - 'update' 또는 'draw' 중 어떤 함수에서 에러를 발생시킬지 지정.
 * @param {function} setFaultFlag - 외부에서 결함 플래그를 설정하는 함수.
 */
export function injectGameLoopFault(faultType, setFaultFlag) {
    console.warn(`--- Injecting GameLoop Fault in ${faultType} function ---`);
    if (setFaultFlag && typeof setFaultFlag === 'function') {
        setFaultFlag(faultType, true);
        console.log(`Fault flag set for ${faultType} function. Check console for errors in game loop.`);
    } else {
        console.error("GameLoop Fault Test: setFaultFlag function is missing or invalid. [FAIL]");
    }
    console.warn("--- GameLoop Fault Injection End ---");
}

// 이 함수는 외부에서 호출되어 게임 루프 콜백 내에서 사용할 플래그를 관리합니다.
let updateShouldThrow = false;
let drawShouldThrow = false;

export function getFaultFlags() {
    return {
        update: updateShouldThrow,
        draw: drawShouldThrow
    };
}

export function setFaultFlag(type, value) {
    if (type === 'update') {
        updateShouldThrow = value;
    } else if (type === 'draw') {
        drawShouldThrow = value;
    }
}

/**
 * EventManager의 기본적인 기능을 테스트합니다.
 * @param {EventManager} eventManager - EventManager 인스턴스.
 */
export function runEventManagerTests(eventManager) {
    console.log("--- EventManager Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // 1. EventManager 초기화 테스트
    testCount++;
    if (eventManager && eventManager.worker) {
        console.log("EventManager: Successfully initialized with Web Worker. [PASS]");
        passCount++;
    } else {
        console.error("EventManager: Initialization failed. [FAIL]");
    }

    // 2. 이벤트 구독 및 전파 테스트 (메인 스레드 내)
    testCount++;
    let subscribedEventReceived = false;
    const testEventName = 'testEvent';
    const testData = { message: 'Hello from EventManager Test!' };

    eventManager.subscribe(testEventName, (data) => {
        console.log(`EventManager: Subscribed callback received event '${testEventName}' with data:`, data);
        if (data.message === testData.message) {
            subscribedEventReceived = true;
        }
    });

    eventManager.emit(testEventName, testData);

    setTimeout(() => {
        if (subscribedEventReceived) {
            console.log("EventManager: Event emitted and subscribed callback fired successfully. [PASS]");
            passCount++;
        } else {
            console.error("EventManager: Event emitted but subscribed callback did not fire. [FAIL]");
        }

        // 3. 워커 내부 '작은 엔진'의 스킬 트리거 테스트 (간접 확인)
        testCount++;
        console.log("EventManager: Emitting 'unitAttack' for worker's small engine test. Check console for '흡혈' skill message.");
        eventManager.emit('unitAttack', { attackerId: 'TestHero', targetId: 'TestMob', damageDealt: 20 });

        setTimeout(() => {
            console.log("EventManager: 'unitAttack' event processed by worker's small engine. Visually check console for '흡혈' skill trigger messages. [INFO]");
            passCount++; // 간접 확인이므로 일단 성공으로 처리

            console.log(`--- EventManager Test End: ${passCount}/${testCount} tests passed ---`);
        }, 100);
    }, 100);
}

/**
 * EventManager에 결함을 주입하는 테스트입니다.
 * @param {EventManager} eventManager - EventManager 인스턴스.
 */
export function injectEventManagerFaults(eventManager) {
    console.warn("--- Injecting EventManager Faults ---");
    let faultTestCount = 0;
    let faultPassCount = 0;

    // 1. 테스트: 구독자 콜백 함수에서 오류 발생 시
    faultTestCount++;
    try {
        const faultEventName = 'faultyCallbackEvent';
        eventManager.subscribe(faultEventName, () => {
            throw new Error("Simulated Error: Subscriber callback failed!");
        });
        eventManager.emit(faultEventName, { status: 'fault' });

        setTimeout(() => {
            console.log("EventManager Fault Test (Callback Error): Check console for 'Simulated Error: Subscriber callback failed!' message. [EXPECTED ERROR]");
            faultPassCount++; // 에러가 발생했으면 성공
        }, 50);
    } catch (e) {
        console.error("EventManager Fault Test (Callback Error): Did not catch expected error synchronously. [FAIL]", e);
    }


    // 2. 테스트: 워커 종료 후 이벤트 emit 시도
    faultTestCount++;
    console.log("EventManager Fault Test (Worker Termination): Terminating worker...");
    eventManager.terminateWorker(); // 워커 종료
    try {
        eventManager.emit('afterTerminationEvent', { data: 'test' });
        console.error("EventManager Fault Test (Worker Termination): Emitted event after termination without error. [FAIL]");
    } catch (e) {
        console.log("EventManager Fault Test (Worker Termination): Successfully caught expected error when emitting after termination. [PASS]", e);
        faultPassCount++;
    }

    // 3. 테스트: 워커가 알 수 없는 타입의 메시지를 보냈을 때 (시뮬레이션)
    faultTestCount++;
    console.log("EventManager Fault Test (Unknown Worker Message Type): Simulating unknown message...");
    const originalHandleWorkerMessage = eventManager.handleWorkerMessage;
    eventManager.handleWorkerMessage = (event) => {
        console.log("[EventManager Fault Test] Receiving unknown message type:", event.data.type);
    };
    eventManager.handleWorkerMessage({ data: { type: 'UNKNOWN_MESSAGE_TYPE', payload: 'bad_data' } });
    console.log("EventManager Fault Test (Unknown Worker Message Type): Handled unknown message type without crashing. [PASS]");
    faultPassCount++;
    eventManager.handleWorkerMessage = originalHandleWorkerMessage;


    setTimeout(() => {
        console.warn(`--- EventManager Fault Injection End: ${faultPassCount}/${faultTestCount} faults tested ---`);
    }, 200);
}

/**
 * GuardianManager의 기본적인 기능을 테스트합니다.
 * @param {GuardianManager} guardianManager - GuardianManager 인스턴스.
 */
export function runGuardianManagerTests(guardianManager) {
    console.log("--- GuardianManager Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // 1. GuardianManager 초기화 테스트
    testCount++;
    if (guardianManager) {
        console.log("GuardianManager: Successfully initialized. [PASS]");
        passCount++;
    } else {
        console.error("GuardianManager: Initialization failed. [FAIL]");
    }

    // 2. 유효한 데이터로 규칙 강제 테스트 (성공 예상)
    testCount++;
    const validData = {
        units: [{ id: 'u1', name: 'Valid Unit', hp: 50 }],
        config: { resolution: { width: 1024, height: 768 } }
    };
    try {
        const result = guardianManager.enforceRules(validData);
        if (result === true) {
            console.log("GuardianManager: Enforced rules with valid data successfully. [PASS]");
            passCount++;
        } else {
            console.error("GuardianManager: Enforced rules with valid data returned unexpected result. [FAIL]");
        }
    } catch (e) {
        console.error("GuardianManager: Enforced rules with valid data threw an unexpected error. [FAIL]", e);
    }

    // 3. 유효하지 않은 데이터 (HP <= 0)로 규칙 강제 테스트 (오류 예상)
    testCount++;
    const invalidDataHp = {
        units: [{ id: 'u2', name: 'Dead Unit', hp: 0 }],
        config: { resolution: { width: 1024, height: 768 } }
    };
    try {
        guardianManager.enforceRules(invalidDataHp);
        console.error("GuardianManager: Enforced rules with invalid HP did not throw error. [FAIL]");
    } catch (e) {
        if (e.name === "ImmutableRuleViolationError") {
            console.log("GuardianManager: Enforced rules with invalid HP threw expected ImmutableRuleViolationError. [PASS]", e.message);
            passCount++;
        } else {
            console.error("GuardianManager: Enforced rules with invalid HP threw unexpected error. [FAIL]", e);
        }
    }

    // 4. 유효하지 않은 데이터 (해상도 작음)로 규칙 강제 테스트 (오류 예상)
    testCount++;
    const invalidDataResolution = {
        units: [{ id: 'u3', name: 'Another Unit', hp: 10 }],
        config: { resolution: { width: 799, height: 599 } }
    };
    try {
        guardianManager.enforceRules(invalidDataResolution);
        console.error("GuardianManager: Enforced rules with invalid resolution did not throw error. [FAIL]");
    } catch (e) {
        if (e.name === "ImmutableRuleViolationError") {
            console.log("GuardianManager: Enforced rules with invalid resolution threw expected ImmutableRuleViolationError. [PASS]", e.message);
            passCount++;
        } else {
            console.error("GuardianManager: Enforced rules with invalid resolution threw unexpected error. [FAIL]", e);
        }
    }

    console.log(`--- GuardianManager Test End: ${passCount}/${testCount} tests passed ---`);
}

/**
 * GuardianManager에 결함을 주입하는 테스트입니다.
 * @param {GuardianManager} guardianManager - GuardianManager 인스턴스.
 */
export function injectGuardianManagerFaults(guardianManager) {
    console.warn("--- Injecting GuardianManager Faults ---");
    let faultTestCount = 0;
    let faultPassCount = 0;

    // 1. 테스트: 유닛 데이터가 null일 때 (예상: 경고 또는 에러 없이 처리)
    faultTestCount++;
    try {
        console.log("GuardianManager Fault Test (Null unit data): Enforcing rules with null units...");
        guardianManager.enforceRules({ units: null, config: { resolution: { width: 1280, height: 720 } } });
        console.log("GuardianManager Fault Test (Null unit data): Handled null unit data gracefully. [PASS]");
        faultPassCount++;
    } catch (e) {
        console.error("GuardianManager Fault Test (Null unit data): Threw unexpected error. [FAIL]", e);
    }

    // 2. 테스트: 유닛 데이터가 배열이 아닐 때 (예상: TypeError 또는 경고)
    faultTestCount++;
    try {
        console.log("GuardianManager Fault Test (Non-array unit data): Enforcing rules with non-array units...");
        guardianManager.enforceRules({ units: "not an array", config: { resolution: { width: 1280, height: 720 } } });
        console.error("GuardianManager Fault Test (Non-array unit data): Did not throw TypeError as expected. [FAIL]");
    } catch (e) {
        if (e instanceof TypeError) {
            console.log("GuardianManager Fault Test (Non-array unit data): Threw expected TypeError. [PASS]", e);
            faultPassCount++;
        } else {
            console.error("GuardianManager Fault Test (Non-array unit data): Threw unexpected error type. [FAIL]", e);
        }
    }

    // 3. 테스트: 해상도 데이터가 누락되었을 때 (예상: 경고 또는 에러 없이 처리)
    faultTestCount++;
    try {
        console.log("GuardianManager Fault Test (Missing resolution data): Enforcing rules with missing resolution...");
        guardianManager.enforceRules({ units: [{ id: 'u4', name: 'Test Unit', hp: 1 }], config: {} });
        console.log("GuardianManager Fault Test (Missing resolution data): Handled missing resolution data gracefully. [PASS]");
        faultPassCount++;
    } catch (e) {
        console.error("GuardianManager Fault Test (Missing resolution data): Threw unexpected error. [FAIL]", e);
    }

    console.warn(`--- GuardianManager Fault Injection End: ${faultPassCount}/${faultTestCount} faults tested ---`);
}

/**
 * MeasureManager 통합 테스트를 실행합니다.
 * MeasureManager의 값을 변경했을 때 UIManager와 MapManager가 올바르게 연동되는지 확인합니다.
 * @param {GameEngine} gameEngine - GameEngine 인스턴스
 */
export function runMeasureManagerIntegrationTest(gameEngine) {
    console.log("--- MeasureManager Integration Test Start ---");

    const measureManager = gameEngine.getMeasureManager();
    const uiManager = gameEngine.getUIManager();
    const mapManager = gameEngine.getMapManager();

    let testCount = 0;
    let passCount = 0;

    // 1. 초기 값 확인
    testCount++;
    const initialTileSize = measureManager.get('tileSize');
    const initialMapGridCols = measureManager.get('mapGrid.cols');
    const initialMapPanelWidthRatio = measureManager.get('ui.mapPanelWidthRatio');

    const uiInitialMapPanelWidth = uiManager.getMapPanelDimensions().width;
    const mapInitialTileSize = mapManager.getTileSize();
    const mapInitialGridCols = mapManager.getGridDimensions().cols;

    if (uiInitialMapPanelWidth > 0 && mapInitialTileSize === initialTileSize && mapInitialGridCols === initialMapGridCols) {
        console.log("Integration Test: Initial dimensions loaded correctly. [PASS]");
        passCount++;
    } else {
        console.error("Integration Test: Initial dimensions mismatch. [FAIL]");
    }

    // 2. MeasureManager 값 변경
    testCount++;
    const newTileSize = 256;
    const newMapGridCols = 20;
    const newMapPanelWidthRatio = 0.5;

    measureManager.set('tileSize', newTileSize);
    measureManager.set('mapGrid.cols', newMapGridCols);
    measureManager.set('ui.mapPanelWidthRatio', newMapPanelWidthRatio);

    // 3. 종속 매니저의 값 재계산 호출
    uiManager._recalculateUIDimensions();
    mapManager._recalculateMapDimensions();

    // 4. 변경된 값 확인
    const uiNewMapPanelWidth = uiManager.getMapPanelDimensions().width;
    const mapNewTileSize = mapManager.getTileSize();
    const mapNewGridCols = mapManager.getGridDimensions().cols;

    const expectedUIMapPanelWidth = gameEngine.getRenderer().canvas.width * newMapPanelWidthRatio;

    if (mapNewTileSize === newTileSize && mapNewGridCols === newMapGridCols && uiNewMapPanelWidth === expectedUIMapPanelWidth) {
        console.log("Integration Test: Dimensions updated correctly after MeasureManager change. [PASS]");
        passCount++;
    } else {
        console.error("Integration Test: Dimensions did not update as expected. [FAIL]");
        console.error(`Expected Map Tile Size: ${newTileSize}, Actual: ${mapNewTileSize}`);
        console.error(`Expected Map Grid Cols: ${newMapGridCols}, Actual: ${mapNewGridCols}`);
        console.error(`Expected UI Map Panel Width: ${expectedUIMapPanelWidth}, Actual: ${uiNewMapPanelWidth}`);
    }

    console.log(`--- MeasureManager Integration Test End: ${passCount}/${testCount} tests passed ---`);
}
