// js/managers/BattleLogManager.js

export class BattleLogManager {
    constructor(canvasElement, eventManager) {
        console.log("\uD83D\uDCDC BattleLogManager initialized. Ready to record battle events. \uD83D\uDCDC");
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.eventManager = eventManager;

        this.logMessages = [];
        this.maxLogLines = 5;
        this.lineHeight = 20;
        this.padding = 10;

        this._setupEventListeners();
    }

    _setupEventListeners() {
        this.eventManager.subscribe('unitAttackAttempt', (data) => {
            this.addLog(`${data.attackerId}\uAC00 ${data.targetId}\uB97C \uACF5\uACA9 \uC2DC\uB3C4!`);
        });
        this.eventManager.subscribe('DAMAGE_CALCULATED', (data) => {
            this.addLog(`${data.unitId}\uAC00 ${data.damageDealt} \uD53C\uD574\uB97C \uC785\uACE0 HP ${data.newHp}\uAC00 \uB418\uBA74.`);
        });
        this.eventManager.subscribe('unitDeath', (data) => {
            this.addLog(`${data.unitName} (ID: ${data.unitId})\uC774(\uAC00) \uC4F0\uB7EC\uC84C\uC2B5\uB2C8\uB2E4!`);
        });
        this.eventManager.subscribe('turnStart', (data) => {
            this.addLog(`--- \uD134 ${data.turn} \uC2DC\uC791 ---`);
        });
        this.eventManager.subscribe('battleStart', (data) => {
            this.addLog(`[\uC804\uD22C \uC2DC\uC791] \uB9F5: ${data.mapId}, \uB09C\uC774\uB3C4: ${data.difficulty}`);
        });
        this.eventManager.subscribe('battleEnd', (data) => {
            this.addLog(`[\uC804\uD22C \uC885\uB8CC] \uC774\uC720: ${data.reason}`);
        });
    }

    addLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.logMessages.push(`[${timestamp}] ${message}`);
        if (this.logMessages.length > this.maxLogLines) {
            this.logMessages.shift();
        }
        console.log(`[BattleLog] ${message}`);
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textBaseline = 'top';

        for (let i = 0; i < this.logMessages.length; i++) {
            const message = this.logMessages[i];
            const y = this.padding + i * this.lineHeight;
            ctx.fillText(message, this.padding, y);
        }
    }
}
