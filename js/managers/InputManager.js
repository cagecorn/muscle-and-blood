// js/managers/InputManager.js

export class InputManager {
    constructor(renderer, cameraEngine, uiEngine) {
        console.log("\ud83c\udfae InputManager initialized. Ready to process user input. \ud83c\udfae");
        this.renderer = renderer;
        this.cameraEngine = cameraEngine;
        this.uiEngine = uiEngine;

        this.canvas = this.renderer.canvas;

        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this._addEventListeners();
    }

    _addEventListeners() {
        this.canvas.addEventListener('mousedown', this._onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this._onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this._onMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this._onMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this._onMouseWheel.bind(this), { passive: false });
        this.canvas.addEventListener('click', this._onClick.bind(this)); // 클릭 이벤트 리스너
    }

    _onMouseDown(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (this.uiEngine.getUIState() === 'mapScreen' && this.uiEngine.isClickOnButton(mouseX, mouseY)) {
            this.isDragging = false;
            // ✨ 추가: 마우스 다운 시 버튼 클릭 시도 감지
            console.log(`[InputManager Debug] MouseDown on Button detected: ClientX=${event.clientX}, ClientY=${event.clientY}`);
            return;
        }

        this.isDragging = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        this.canvas.style.cursor = 'grabbing';
    }

    _onMouseMove(event) {
        if (this.isDragging) {
            const dx = event.clientX - this.lastMouseX;
            const dy = event.clientY - this.lastMouseY;
            this.cameraEngine.pan(dx, dy);
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
        }
    }

    _onMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
    }

    _onMouseWheel(event) {
        event.preventDefault();

        const zoomAmount = event.deltaY > 0 ? -0.1 : 0.1;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        this.cameraEngine.zoomAt(zoomAmount, mouseX, mouseY);
    }

    _onClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left; // 캔버스 내부 논리적 X 좌표 (이 부분이 올바르게 계산됨)
        const mouseY = event.clientY - rect.top;   // 캔버스 내부 논리적 Y 좌표 (이 부분이 올바르게 계산됨)

        console.log(`[InputManager Debug] Click event received: ClientX=${event.clientX}, ClientY=${event.clientY}`);
        console.log(`[InputManager Debug] Canvas Local Mouse: X=${mouseX}, Y=${mouseY}`);
        console.log(`[InputManager Debug] Current UI State: ${this.uiEngine.getUIState()}`);

        // ✨ 핵심 수정 부분입니다.
        // isClickOnButton에 raw event.clientX/Y 대신 계산된 mouseX/Y를 전달합니다.
        if (this.uiEngine.isClickOnButton(mouseX, mouseY)) { // <--- 여기가 핵심 변경 사항
            console.log(`[InputManager Debug] isClickOnButton returned TRUE. Attempting to handle battle start.`);
            this.uiEngine.handleBattleStartClick();
        } else {
            console.log(`[InputManager Debug] isClickOnButton returned FALSE. Not a button click.`);
        }
    }
}
