export { runRendererTests } from './unit/rendererTests.js';
export { runGameLoopTests } from './unit/gameLoopTests.js';
export { runEventManagerTests } from './unit/eventManagerUnitTests.js';
export { runGuardianManagerTests } from './unit/guardianManagerUnitTests.js';
export { runMeasureManagerUnitTests } from './unit/measureManagerUnitTests.js';
export { runMapManagerUnitTests } from './unit/mapManagerUnitTests.js';
export { runUIEngineUnitTests } from './unit/uiEngineUnitTests.js';

// new unit tests
export { runSceneManagerUnitTests } from './unit/sceneManagerUnitTests.js';
export { runLogicManagerUnitTests } from './unit/logicManagerUnitTests.js';
export { runCompatibilityManagerUnitTests } from './unit/compatibilityManagerUnitTests.js';

export { runMeasureManagerIntegrationTest } from './integration/measureManagerIntegrationTests.js';

export { injectRendererFault } from './fault_injection/rendererFaults.js';
export { injectGameLoopFault, getFaultFlags, setFaultFlag } from './fault_injection/gameLoopFaults.js';
export { injectEventManagerFaults } from './fault_injection/eventManagerFaults.js';
export { injectGuardianManagerFaults } from './fault_injection/guardianManagerFaults.js';
export { injectSceneManagerFaults } from './fault_injection/sceneManagerFaults.js';
export { injectLogicManagerFaults } from './fault_injection/logicManagerFaults.js';
export { injectCompatibilityManagerFaults } from './fault_injection/compatibilityManagerFaults.js';

export function runEngineTests(renderer, gameLoop) {
    runRendererTests(renderer);
    runGameLoopTests(gameLoop);
}
