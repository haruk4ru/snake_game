/**
 * Standalone offline HTML exporter for Super Car Snake: Hazard Run
 * Packs all rules, assets, audio synth, and game loop into a self-contained HTML file.
 */

export function downloadStandaloneHTML(highScore: number) {
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>슈퍼 카 스네이크: 해저드 런 (Super Car Snake)</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-tap-highlight-color: transparent; }
        body {
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
            background-color: #030712;
            color: #f3f4f6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 16px;
        }
        header { text-align: center; margin-bottom: 12px; }
        h1 { font-size: 1.85rem; font-weight: 800; color: #fbbf24; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .sub-title { color: #94a3b8; font-size: 0.825rem; margin-top: 4px; }
        .scoreboard {
            width: 100%; max-width: 520px;
            background-color: #111827; border: 1px solid #1f2937;
            border-radius: 12px; padding: 12px 16px; margin-bottom: 12px;
            display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; text-align: center;
        }
        .score-item { display: flex; flex-direction: column; }
        .score-label { font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; font-weight: 600; }
        .score-val { font-size: 1.3rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
        .buff-bar {
            width: 100%; max-width: 520px; min-height: 28px;
            display: flex; gap: 8px; margin-bottom: 10px;
        }
        .buff-tag {
            flex: 1; padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;
            display: flex; align-items: center; justify-content: space-between;
        }
        .game-wrapper {
            position: relative; width: 100%; max-width: 520px; aspect-ratio: 1 / 1;
            background-color: #030712; border-radius: 16px; overflow: hidden;
            border: 2px solid #1f2937; box-shadow: 0 12px 35px -5px rgba(0, 0, 0, 0.7);
        }
        canvas { width: 100%; height: 100%; display: block; }
        .overlay {
            position: absolute; inset: 0; background: rgba(3, 7, 18, 0.93);
            backdrop-filter: blur(6px); display: flex; flex-direction: column;
            align-items: center; justify-content: center; padding: 20px; text-align: center;
        }
        .overlay.hidden { display: none !important; }
        .start-btn {
            padding: 12px 32px; background: #f59e0b; color: #030712;
            font-weight: 800; font-size: 1.05rem; border: none; border-radius: 12px;
            cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
        }
        .start-btn:hover { background: #fbbf24; transform: translateY(-2px); }
        .rules-card {
            background: #111827; border: 1px solid #1f2937; border-radius: 12px;
            padding: 12px 16px; margin: 12px 0 16px; font-size: 0.78rem; text-align: left;
            max-width: 360px; line-height: 1.5; color: #cbd5e1;
        }
        .rules-title { font-weight: 700; color: #fbbf24; text-align: center; margin-bottom: 6px; }
        .item-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
        .dpad-container {
            display: grid; grid-template-columns: repeat(3, 52px); grid-template-rows: repeat(2, 46px);
            gap: 6px; margin-top: 14px;
        }
        .dpad-btn {
            background: #1f2937; border: 1px solid #374151; color: #f3f4f6;
            border-radius: 10px; font-size: 1.1rem; display: flex; align-items: center; justify-content: center;
            cursor: pointer;
        }
        .dpad-btn:active { background: #374151; transform: scale(0.95); }
    </style>
</head>
<body>
    <header>
        <h1><i class="fa-solid fa-car-side"></i> 슈퍼 카 스네이크: 해저드 런</h1>
        <p class="sub-title">26x26 필드 (3배 확장) · 3종 특수 아이템 · 30초 도로 차단벽 서바이벌</p>
    </header>

    <div class="scoreboard">
        <div class="score-item"><span class="score-label">Score</span><span id="score" class="score-val" style="color:#fbbf24">0</span></div>
        <div class="score-item"><span class="score-label">High</span><span id="highScore" class="score-val" style="color:#10b981">${highScore}</span></div>
        <div class="score-item"><span class="score-label">Time</span><span id="timer" class="score-val" style="color:#38bdf8">00:00</span></div>
        <div class="score-item"><span class="score-label">Length</span><span id="carLength" class="score-val" style="color:#ec4899">3</span></div>
    </div>

    <div id="buffBar" class="buff-bar"></div>

    <div class="game-wrapper">
        <canvas id="gameCanvas"></canvas>
        <div id="overlay" class="overlay">
            <h2 id="overlayTitle" style="font-size:1.5rem;font-weight:800;color:#fbbf24;margin-bottom:8px">주행 준비 완료</h2>
                <div class="rules-title">🎮 신규 업데이트 규칙</div>
                <div>• <b>필드 면적 3배 확장</b>: 26 × 26 그리드 (충분한 회전 공간 제공)</div>
                <div>• <b>연료통 단계 확장</b>: 초기 2개 → 16개 후 3개 → 30개 후 4개</div>
                <div class="item-row"><span>❄️ <b>속도 감소</b>: 6초간 차량 감속 주행으로 안정적 코너링</span></div>
                <div class="item-row"><span>🔧 <b>길이 3칸 감소</b>: 꼬리 3칸 즉시 제거 & 차체 슬림화</span></div>
                <div class="item-row"><span>🛡️ <b>5초 무적</b>: 5초간 차체·몸통·장애물 충돌 완전 방어!</span></div>
                <div style="margin-top:6px; color:#f87171">• <b>30초 생존 시</b>: 차단벽 5개로 시작해 최대 20개까지 분산 설치</div>
            </div>
            <p id="overlayMsg" style="color:#94a3b8;font-size:0.85rem;margin-bottom:14px;display:none;"></p>
            <button id="startBtn" onclick="startGame()" class="start-btn">주행 시작하기</button>
        </div>
    </div>

    <div class="dpad-container">
        <div></div>
        <button class="dpad-btn" onclick="handleDpad('UP')"><i class="fa-solid fa-arrow-up"></i></button>
        <div></div>
        <button class="dpad-btn" onclick="handleDpad('LEFT')"><i class="fa-solid fa-arrow-left"></i></button>
        <button class="dpad-btn" onclick="handleDpad('DOWN')"><i class="fa-solid fa-arrow-down"></i></button>
        <button class="dpad-btn" onclick="handleDpad('RIGHT')"><i class="fa-solid fa-arrow-right"></i></button>
    </div>

    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('score');
        const highScoreEl = document.getElementById('highScore');
        const timerEl = document.getElementById('timer');
        const carLenEl = document.getElementById('carLength');
        const buffBar = document.getElementById('buffBar');
        const overlay = document.getElementById('overlay');
        const overlayTitle = document.getElementById('overlayTitle');
        const overlayMsg = document.getElementById('overlayMsg');
        const startBtn = document.getElementById('startBtn');
        const rulesCard = document.getElementById('rulesCard');

        const GRID_COUNT = 26; // 26x26 (approx 3x field size of 15x15)
        let CELL_SIZE = 0;

        let audioCtx = null;
        function playTone(freq, duration, type='sine', gainVal=0.1) {
            try {
                if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                if (audioCtx.state === 'suspended') audioCtx.resume();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + duration);
            } catch(e) {}
        }

        let car = [];
        let direction = 'RIGHT';
        let nextDirection = 'RIGHT';
        let fuels = [];
        let items = [];
        let obstacles = [];
        let isPlaying = false;
        let score = 0;
        let fuelCount = 0;
        let highScore = localStorage.getItem('carSnakeHighScore') || ${highScore};
        let startTime = 0;
        let elapsedMs = 0;
        let gameLoop = null;
        let initialObstaclesSpawned = false;
        let lastObstacleAddedSec = 0;

        // Buffs
        let shieldUntil = 0; // 5초 무적
        let slowUntil = 0;   // 6초 속도 감소

        function resize() {
            const width = canvas.parentElement.clientWidth;
            canvas.width = width * 2;
            canvas.height = width * 2;
            CELL_SIZE = canvas.width / GRID_COUNT;
            draw();
        }
        window.addEventListener('resize', resize);

        function initGame() {
            car = [
                { x: 8, y: 13 },
                { x: 7, y: 13 },
                { x: 6, y: 13 }
            ];
            direction = 'RIGHT';
            nextDirection = 'RIGHT';
            score = 0;
            fuelCount = 0;
            fuels = [];
            items = [];
            obstacles = [];
            shieldUntil = 0;
            slowUntil = 0;
            initialObstaclesSpawned = false;
            lastObstacleAddedSec = 0;
            startTime = Date.now();
            elapsedMs = 0;

            scoreEl.innerText = score;
            highScoreEl.innerText = highScore;
            carLenEl.innerText = car.length;
            spawnFuel();
        }

        // Fuel progression: 2 initially, 3 after 16, 4 after 30
        function spawnFuel() {
            let target = 2;
            if (fuelCount >= 30) target = 4;
            else if (fuelCount >= 16) target = 3;
            while (fuels.length < target) {
                const p = getRandomEmptyPos();
                if (p) fuels.push(p);
                else break;
            }
        }

        function getRandomEmptyPos(avoidNearHead = false) {
            for (let tries = 0; tries < 200; tries++) {
                const x = Math.floor(Math.random() * GRID_COUNT);
                const y = Math.floor(Math.random() * GRID_COUNT);
                if (car.some(s => s.x === x && s.y === y)) continue;
                if (fuels.some(f => f.x === x && f.y === y)) continue;
                if (items.some(i => i.x === x && i.y === y)) continue;
                if (obstacles.some(o => o.x === x && o.y === y)) continue;
                if (avoidNearHead && car[0]) {
                    const dist = Math.abs(car[0].x - x) + Math.abs(car[0].y - y);
                    if (dist < 4) continue;
                }
                return { x, y };
            }
            return null;
        }

        // Safe non-clustering obstacle position finder
        function getNonClusteredObstaclePos() {
            const candidateDistances = [3.5, 3.0, 2.5, 2.0];
            for (const minDist of candidateDistances) {
                for (let tries = 0; tries < 150; tries++) {
                    const x = Math.floor(Math.random() * (GRID_COUNT - 2)) + 1;
                    const y = Math.floor(Math.random() * (GRID_COUNT - 2)) + 1;
                    if (car.some(s => s.x === x && s.y === y)) continue;
                    if (fuels.some(f => f.x === x && f.y === y)) continue;
                    if (items.some(i => i.x === x && i.y === y)) continue;
                    if (obstacles.some(o => o.x === x && o.y === y)) continue;
                    if (car[0] && (Math.hypot(car[0].x - x, car[0].y - y) < 5)) continue;
                    const clustered = obstacles.some(o => Math.hypot(o.x - x, o.y - y) < minDist);
                    if (!clustered) return { x, y };
                }
            }
            return null;
        }

        function spawnRandomItem() {
            if (items.length >= 1) return;
            const pos = getRandomEmptyPos();
            if (!pos) return;
            const types = ['SLOW', 'TRIM', 'SHIELD'];
            const type = types[Math.floor(Math.random() * types.length)];
            items.push({ x: pos.x, y: pos.y, type, expires: Date.now() + 13000 });
        }

        function spawnObstacles() {
            // Starts with 5 obstacles, spaced out
            for (let i = 0; i < 5; i++) {
                const pos = getNonClusteredObstaclePos();
                if (pos) obstacles.push(pos);
            }
            initialObstaclesSpawned = true;
            lastObstacleAddedSec = 30;
            playTone(850, 0.4, 'square', 0.2);
        }

        function addMoreObstacles(sec) {
            if (obstacles.length >= 20) return;
            if (sec - lastObstacleAddedSec < 12) return;
            lastObstacleAddedSec = sec;
            const count = Math.min(3, 20 - obstacles.length);
            for (let i = 0; i < count; i++) {
                const pos = getNonClusteredObstaclePos();
                if (pos) obstacles.push(pos);
            }
        }

        function startGame() {
            initGame();
            isPlaying = true;
            overlay.classList.add('hidden');
            resize();
            if (gameLoop) clearInterval(gameLoop);
            gameLoop = setInterval(update, 120);
        }

        function returnToTitle() {
            isPlaying = false;
            if (gameLoop) clearInterval(gameLoop);
            overlayTitle.innerText = '주행 준비 완료';
            overlayTitle.style.color = '#fbbf24';
            rulesCard.style.display = 'block';
            overlayMsg.style.display = 'none';
            startBtn.innerText = '주행 시작하기';
            startBtn.onclick = startGame;
            score = 0; fuelCount = 0;
            scoreEl.innerText = '0';
            timerEl.innerText = '00:00';
            buffBar.innerHTML = '';
            obstacles = [];
            fuels = [];
            items = [];
            overlay.classList.remove('hidden');
            draw();
        }

        function handleDpad(dir) {
            if (!isPlaying) return;
            if (dir === 'UP' && direction !== 'DOWN') nextDirection = 'UP';
            if (dir === 'DOWN' && direction !== 'UP') nextDirection = 'DOWN';
            if (dir === 'LEFT' && direction !== 'RIGHT') nextDirection = 'LEFT';
            if (dir === 'RIGHT' && direction !== 'LEFT') nextDirection = 'RIGHT';
        }

        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'KeyW'].includes(e.code) && direction !== 'DOWN') nextDirection = 'UP';
            if (['ArrowDown', 'KeyS'].includes(e.code) && direction !== 'UP') nextDirection = 'DOWN';
            if (['ArrowLeft', 'KeyA'].includes(e.code) && direction !== 'RIGHT') nextDirection = 'LEFT';
            if (['ArrowRight', 'KeyD'].includes(e.code) && direction !== 'LEFT') nextDirection = 'RIGHT';
        });

        function update() {
            const now = Date.now();
            elapsedMs = now - startTime;
            const sec = Math.floor(elapsedMs / 1000);
            const m = String(Math.floor(sec / 60)).padStart(2, '0');
            const s = String(sec % 60).padStart(2, '0');
            timerEl.innerText = \`\${m}:\${s}\`;

            // 30-sec obstacle spawn trigger: starts with 5, grows up to 20
            if (sec >= 30) {
                if (!initialObstaclesSpawned) {
                    spawnObstacles();
                } else {
                    addMoreObstacles(sec);
                }
            }

            // Random item spawn (30% frequency of original, max 1 item)
            if (Math.random() < 0.0036 && items.length < 1) {
                spawnRandomItem();
            }
            items = items.filter(it => it.expires > now);

            // Speed calculation
            let baseSpeed = Math.max(70, 200 - Math.floor(fuelCount / 2) * 8);
            if (now < slowUntil) {
                baseSpeed += 65; // Slow item effect
            }
            clearInterval(gameLoop);
            gameLoop = setInterval(update, baseSpeed);

            // Move
            direction = nextDirection;
            const head = { ...car[0] };
            if (direction === 'UP') head.y -= 1;
            else if (direction === 'DOWN') head.y += 1;
            else if (direction === 'LEFT') head.x -= 1;
            else if (direction === 'RIGHT') head.x += 1;

            const isShielded = now < shieldUntil;

            // Wall collision
            if (head.x < 0 || head.x >= GRID_COUNT || head.y < 0 || head.y >= GRID_COUNT) {
                gameOver('경계 벽에 충돌했습니다!');
                return;
            }

            // Obstacle collision
            const hitObstacleIdx = obstacles.findIndex(o => o.x === head.x && o.y === head.y);
            if (hitObstacleIdx !== -1) {
                if (isShielded) {
                    playTone(900, 0.2, 'sine', 0.2); // Shield break
                    obstacles.splice(hitObstacleIdx, 1);
                } else {
                    gameOver('도로 공사 차단벽에 충돌했습니다!');
                    return;
                }
            }

            // Body collision
            const hitBody = car.some(s => s.x === head.x && s.y === head.y);
            if (hitBody) {
                if (!isShielded) {
                    gameOver('차량 몸통에 충돌했습니다!');
                    return;
                }
            }

            car.unshift(head);

            // Check Fuel
            const fuelIdx = fuels.findIndex(f => f.x === head.x && f.y === head.y);
            if (fuelIdx !== -1) {
                score += 10;
                fuelCount++;
                fuels.splice(fuelIdx, 1);
                playTone(600, 0.1, 'triangle', 0.15);
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('carSnakeHighScore', highScore);
                    highScoreEl.innerText = highScore;
                }
                spawnFuel();
            } else {
                car.pop();
            }

            // Check Item
            const itemIdx = items.findIndex(it => it.x === head.x && it.y === head.y);
            if (itemIdx !== -1) {
                const item = items[itemIdx];
                items.splice(itemIdx, 1);
                if (item.type === 'SLOW') {
                    slowUntil = now + 6000;
                    playTone(320, 0.25, 'sine', 0.2);
                } else if (item.type === 'TRIM') {
                    if (car.length > 3) {
                        car.splice(Math.max(3, car.length - 3));
                    }
                    score += 30;
                    playTone(720, 0.15, 'sawtooth', 0.2);
                } else if (item.type === 'SHIELD') {
                    shieldUntil = now + 5000; // 5초 무적
                    playTone(880, 0.35, 'triangle', 0.25);
                }
            }

            carLenEl.innerText = car.length;
            scoreEl.innerText = score;
            updateBuffUI(now);
            draw();
        }

        function updateBuffUI(now) {
            let html = '';
            if (now < shieldUntil) {
                const rem = ((shieldUntil - now) / 1000).toFixed(1);
                html += \`<div class="buff-tag" style="background:#7c3aed;color:#fff">🛡️ 5초 무적<span>\${rem}s</span></div>\`;
            }
            if (now < slowUntil) {
                const rem = ((slowUntil - now) / 1000).toFixed(1);
                html += \`<div class="buff-tag" style="background:#0284c7;color:#fff">❄️ 감속 주행<span>\${rem}s</span></div>\`;
            }
            if (obstacles.length > 0) {
                html += \`<div class="buff-tag" style="background:#dc2626;color:#fff">⚠️ 차단벽 \${obstacles.length}개<span>주의</span></div>\`;
            }
            buffBar.innerHTML = html;
        }

        function gameOver(reason) {
            isPlaying = false;
            clearInterval(gameLoop);
            playTone(150, 0.45, 'sawtooth', 0.3);
            overlayTitle.innerText = '게임 오버';
            overlayTitle.style.color = '#ef4444';
            rulesCard.style.display = 'none';
            overlayMsg.innerText = \`\${reason} | 최종 점수: \${score}점 (연료: \${fuelCount}개)\`;
            startBtn.innerText = '다시 주행하기 (초기화면으로)';
            startBtn.onclick = returnToTitle;
            overlay.classList.remove('hidden');
        }

        function draw() {
            if (!CELL_SIZE) return;
            ctx.fillStyle = '#030712';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Grid
            ctx.strokeStyle = '#111827';
            ctx.lineWidth = 1;
            for (let i = 0; i <= GRID_COUNT; i++) {
                ctx.beginPath();
                ctx.moveTo(i * CELL_SIZE, 0); ctx.lineTo(i * CELL_SIZE, canvas.height);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * CELL_SIZE); ctx.lineTo(canvas.width, i * CELL_SIZE);
                ctx.stroke();
            }

            // Obstacles
            obstacles.forEach(o => {
                const px = o.x * CELL_SIZE; const py = o.y * CELL_SIZE;
                ctx.fillStyle = '#eab308';
                ctx.fillRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.moveTo(px, py + CELL_SIZE); ctx.lineTo(px + CELL_SIZE, py); ctx.lineTo(px + CELL_SIZE - 4, py); ctx.lineTo(px, py + CELL_SIZE - 4);
                ctx.fill();
            });

            // Fuels
            fuels.forEach(f => {
                const px = f.x * CELL_SIZE; const py = f.y * CELL_SIZE;
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.roundRect(px + 3, py + 3, CELL_SIZE - 6, CELL_SIZE - 6, 4);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(px + CELL_SIZE/2 - 2, py + 5, 4, 6);
            });

            // Items
            const now = Date.now();
            items.forEach(it => {
                const px = it.x * CELL_SIZE; const py = it.y * CELL_SIZE;
                ctx.save();
                ctx.font = \`bold \${CELL_SIZE * 0.7}px sans-serif\`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const emoji = it.type === 'SLOW' ? '❄️' : it.type === 'TRIM' ? '🔧' : '🛡️';
                ctx.fillText(emoji, px + CELL_SIZE/2, py + CELL_SIZE/2);
                ctx.restore();
            });

            // Car
            const isInvincible = now < shieldUntil;
            car.forEach((seg, idx) => {
                const px = seg.x * CELL_SIZE; const py = seg.y * CELL_SIZE;
                if (idx === 0) {
                    ctx.fillStyle = isInvincible ? '#a855f7' : '#f59e0b';
                    ctx.beginPath();
                    ctx.roundRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4, 6);
                    ctx.fill();
                    ctx.fillStyle = '#38bdf8';
                    ctx.fillRect(px + CELL_SIZE/4, py + CELL_SIZE/4, CELL_SIZE/2, CELL_SIZE/2);
                } else {
                    ctx.fillStyle = isInvincible ? '#c084fc' : (idx % 2 === 0 ? '#d97706' : '#b45309');
                    ctx.beginPath();
                    ctx.roundRect(px + 3, py + 3, CELL_SIZE - 6, CELL_SIZE - 6, 4);
                    ctx.fill();
                }
            });
        }

        window.onload = resize;
    </script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'super_car_snake_hazard_run.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
