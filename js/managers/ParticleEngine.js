// js/managers/ParticleEngine.js

export class ParticleEngine {
    constructor(measureManager, cameraEngine, battleSimulationManager) {
        console.log("\u2728 ParticleEngine initialized. Ready to create visual sparks. \u2728");
        this.measureManager = measureManager;
        this.cameraEngine = cameraEngine;
        this.battleSimulationManager = battleSimulationManager; // 유닛 위치 정보를 얻기 위함

        this.activeParticles = [];
    }

    /**
     * 특정 유닛의 위치에서 파티클을 생성하여 추가합니다.
     * @param {string} unitId - 파티클을 생성할 유닛의 ID
     * @param {string} color - 파티클의 색상 (예: 'red')
     */
    addParticles(unitId, color) {
        const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === unitId);
        if (!unit) {
            console.warn(`[ParticleEngine] Cannot add particles for unknown unit: ${unitId}`);
            return;
        }

        const sceneContentDimensions = this.battleSimulationManager.logicManager.getCurrentSceneContentDimensions();
        const canvasWidth = this.measureManager.get('gameResolution.width');
        const canvasHeight = this.measureManager.get('gameResolution.height');

        const gridContentWidth = sceneContentDimensions.width;
        const gridContentHeight = sceneContentDimensions.height;
        const effectiveTileSize = gridContentWidth / this.battleSimulationManager.gridCols;

        const totalGridWidth = gridContentWidth;
        const totalGridHeight = gridContentHeight;
        const gridOffsetX = (canvasWidth - totalGridWidth) / 2;
        const gridOffsetY = (canvasHeight - totalGridHeight) / 2;

        const baseParticleSize = this.measureManager.get('particle.baseSize');
        const particleCount = this.measureManager.get('particle.count');
        const particleDuration = this.measureManager.get('particle.duration');
        const particleSpeedY = this.measureManager.get('particle.speedY');
        const particleSpread = this.measureManager.get('particle.spread');

        for (let i = 0; i < particleCount; i++) {
            const startX = gridOffsetX + unit.gridX * effectiveTileSize + effectiveTileSize / 2;
            const startY = gridOffsetY + unit.gridY * effectiveTileSize + effectiveTileSize / 2;

            const particle = {
                x: startX + (Math.random() * particleSpread - particleSpread / 2),
                y: startY,
                size: baseParticleSize * (0.8 + Math.random() * 0.4), // 크기 변화
                color: color,
                speedX: (Math.random() - 0.5) * 2, // -1에서 1 사이의 랜덤 값
                speedY: particleSpeedY * (0.8 + Math.random() * 0.4), // 위로 솟구치는 속도
                alpha: 1,
                startTime: performance.now(),
                duration: particleDuration,
                initialY: startY // 초기 y 위치 저장 (재계산을 위해)
            };
            this.activeParticles.push(particle);
        }
        console.log(`[ParticleEngine] Added ${particleCount} particles for unit ${unitId}.`);
    }

    /**
     * 모든 활성 파티클의 상태를 업데이트합니다.
     * @param {number} deltaTime - 지난 프레임과의 시간 차이 (ms)
     */
    update(deltaTime) {
        const currentTime = performance.now();
        this.activeParticles = this.activeParticles.filter(particle => {
            const elapsed = currentTime - particle.startTime;
            if (elapsed > particle.duration) {
                return false; // 파티클 수명 만료
            }

            // 위치 업데이트
            particle.x += particle.speedX * (deltaTime / 16); // 16ms를 기준으로 속도 조정
            particle.y -= particle.speedY * (deltaTime / 16);

            // 투명도 업데이트 (점점 사라지게)
            particle.alpha = Math.max(0, 1 - (elapsed / particle.duration));
            return true;
        });
    }

    /**
     * 모든 활성 파티클을 그립니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     */
    draw(ctx) {
        ctx.save();
        // CameraEngine 변환은 LayerEngine에서 이미 적용될 것이므로 여기서 다시 적용하지 않습니다.
        // 파티클은 배경 레이어 위에 그려지므로, 카메라 변환을 따라야 합니다.

        for (const particle of this.activeParticles) {
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;

            // 파티클은 사각형으로 그립니다.
            ctx.fillRect(
                particle.x - particle.size / 2,
                particle.y - particle.size / 2,
                particle.size,
                particle.size
            );
        }
        ctx.restore();
    }
}
