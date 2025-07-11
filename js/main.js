/**
 * 초기 Canvas 설정 및 간단한 환영 메시지 출력
 * DOMContentLoaded 이후 실행되도록 export 함수를 제공합니다.
 */
export function startGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size (can be adjusted)
    canvas.width = 1280;
    canvas.height = 720;

    // Draw simple text
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Muscle & Blood', canvas.width / 2, canvas.height / 2);
    ctx.font = '24px Arial';
    ctx.fillText('게임을 시작합니다...', canvas.width / 2, canvas.height / 2 + 50);
}

// Automatically initialize when DOM is ready
window.addEventListener('DOMContentLoaded', startGame);
