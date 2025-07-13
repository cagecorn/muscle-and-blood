// js/Renderer.js
export class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas with ID "${canvasId}" not found.`);
            return;
        }
        this.ctx = this.canvas.getContext('2d');

        // 캔버스 크기 설정은 CompatibilityManager를 통해 동적으로 결정됩니다.

        console.log("Renderer initialized.");
    }

    /**
     * 캔버스를 지웁니다. 매 프레임마다 새로운 내용을 그리기 전에 호출됩니다.
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * 배경을 그립니다.
     */
    drawBackground() {
        this.ctx.fillStyle = '#333'; // 배경 색상 (조절 가능)
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 향후 유닛, 스프라이트 등을 그리는 메서드들이 추가될 예정입니다.
    // 예를 들어, drawImage(image, x, y, width, height) 등.
}
