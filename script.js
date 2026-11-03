/**
 * Super Car Snake: Hazard Run
 * 100% Pure Vanilla JavaScript (ES6+) Game Engine
 * Compatible with GitHub Pages root deployment with ZERO build tools.
 */

// --- 1. Web Audio API Retro Arcade Synthesizer ---
class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(m) {
    this.muted = m;
  }

  playFuel() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.08);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  playSlowItem() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playTrimItem() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [0, 0.06, 0.12].forEach((offset, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440 + idx * 160, now + offset);
      osc.frequency.exponentialRampToValueAtTime(900 + idx * 100, now + offset + 0.05);
      gain.gain.setValueAtTime(0.15, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.05);
    });
  }

  playShieldItem() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.2, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.25);
    });
  }

  playShieldDeflect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.18);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playHazardAlert() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.setValueAtTime(950, now + 0.12);
    osc.frequency.setValueAtTime(750, now + 0.24);
    osc.frequency.setValueAtTime(950, now + 0.36);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.48);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.48);
  }

  playCrash() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }
}

const sounds = new SoundController();

// --- 2. DOM Elements ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreDisplay = document.getElementById('scoreDisplay');
const highScoreDisplay = document.getElementById('highScoreVal');
const timeDisplay = document.getElementById('timeDisplay');
const lengthDisplay = document.getElementById('lengthDisplay');

const hazardAlertBanner = document.getElementById('hazardAlertBanner');
const hazardAlertText = document.getElementById('hazardAlertText');
const buffBar = document.getElementById('buffBar');
const countdownNotice = document.getElementById('countdownNotice');
const barrierCountdownVal = document.getElementById('barrierCountdownVal');

const startOverlay = document.getElementById('startOverlay');
const pauseOverlay = document.getElementById('pauseOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const gameOverReasonText = document.getElementById('gameOverReasonText');
const finalScoreVal = document.getElementById('finalScoreVal');
const finalTimeVal = document.getElementById('finalTimeVal');
const finalItemVal = document.getElementById('finalItemVal');

const startBtn = document.getElementById('startBtn');
const resumeBtn = document.getElementById('resumeBtn');
const returnToTitleBtn = document.getElementById('returnToTitleBtn');
const quickRestartBtn = document.getElementById('quickRestartBtn');
const gameOverDownloadBtn = document.getElementById('gameOverDownloadBtn');

const muteBtn = document.getElementById('muteBtn');
const muteIcon = document.getElementById('muteIcon');
const pauseBtn = document.getElementById('pauseBtn');
const pauseIcon = document.getElementById('pauseIcon');

const guideModal = document.getElementById('guideModal');
const navGuideBtn = document.getElementById('navGuideBtn');
const mobileGuideBtn = document.getElementById('mobileGuideBtn');
const closeGuideModalBtn = document.getElementById('closeGuideModalBtn');
const confirmGuideModalBtn = document.getElementById('confirmGuideModalBtn');

// 4 Fuel Canister Colors: Red, Blue, Purple, Green
const FUEL_COLORS = [
  { id: 'RED', hex: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)', name: '빨강' },
  { id: 'BLUE', hex: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', name: '파랑' },
  { id: 'PURPLE', hex: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', name: '보라' },
  { id: 'GREEN', hex: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', name: '초록' }
];

// --- 3. Game State Variables ---
let gridCount = 26; // Fixed 26x26 arena as requested
let cellSize = 0;

let car = [];
let direction = 'RIGHT';
let nextDirection = 'RIGHT';

let fuels = [];
let items = [];
let obstacles = [];
let floatingTexts = [];
let particles = [];

let isPlaying = false;
let isPaused = false;
let isGameOver = false;

let score = 0;
let fuelCount = 0;
let highScore = parseInt(localStorage.getItem('snakekaHighScore_v1') || '0', 10);
highScoreDisplay.innerText = highScore;

let itemsCollectedCount = 0;
let startTime = 0;
let elapsedSeconds = 0;
let lastTickTime = 0;
let baseInterval = 150;

let shieldUntil = 0; // 5s invincibility
let slowUntil = 0;   // 6s speed reduction
let initialObstaclesSpawned = false;
let lastObstacleAddedSec = 0;

let animId = null;

// --- 4. Utilities ---
function formatTime(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function resizeCanvas() {
  const width = canvas.parentElement.clientWidth;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = width * dpr;
  cellSize = canvas.width / gridCount;
  drawScene();
}
window.addEventListener('resize', resizeCanvas);

// Safe empty position finder
function getSafeRandomPosition(avoidHeadDist = 0) {
  const head = car[0];
  for (let attempts = 0; attempts < 300; attempts++) {
    const rx = Math.floor(Math.random() * gridCount);
    const ry = Math.floor(Math.random() * gridCount);

    if (car.some(s => s.x === rx && s.y === ry)) continue;
    if (fuels.some(f => f.x === rx && f.y === ry)) continue;
    if (items.some(i => i.x === rx && i.y === ry)) continue;
    if (obstacles.some(o => o.x === rx && o.y === ry)) continue;

    if (avoidHeadDist > 0 && head) {
      const dist = Math.abs(head.x - rx) + Math.abs(head.y - ry);
      if (dist < avoidHeadDist) continue;
    }
    return { x: rx, y: ry };
  }
  return null;
}

// Non-clustering safe obstacle placement algorithm
function getNonClusteredObstaclePos(existingObstacles, avoidHeadDist = 5) {
  const head = car[0];
  const candidateDistances = [3.8, 3.2, 2.7, 2.3];

  for (const minDist of candidateDistances) {
    for (let attempts = 0; attempts < 180; attempts++) {
      const rx = Math.floor(Math.random() * (gridCount - 2)) + 1;
      const ry = Math.floor(Math.random() * (gridCount - 2)) + 1;

      if (car.some(s => s.x === rx && s.y === ry)) continue;
      if (fuels.some(f => f.x === rx && f.y === ry)) continue;
      if (items.some(i => i.x === rx && i.y === ry)) continue;
      if (existingObstacles.some(o => o.x === rx && o.y === ry)) continue;

      if (head) {
        const distToHead = Math.hypot(head.x - rx, head.y - ry);
        if (distToHead < avoidHeadDist) continue;
      }

      const isClustered = existingObstacles.some(obs => {
        return Math.hypot(obs.x - rx, obs.y - ry) < minDist;
      });

      if (!isClustered) {
        return { x: rx, y: ry };
      }
    }
  }
  return null;
}

// Fuel progression: 2 initially, 3 after 16, 4 after 30
// Each fuel is randomly assigned one of the 4 colors: 빨강, 파랑, 보라, 초록
function spawnFuels() {
  let targetCount = 2;
  if (fuelCount >= 30) {
    targetCount = 4;
  } else if (fuelCount >= 16) {
    targetCount = 3;
  }

  while (fuels.length < targetCount) {
    const pos = getSafeRandomPosition(2);
    if (pos) {
      const colorObj = FUEL_COLORS[Math.floor(Math.random() * FUEL_COLORS.length)];
      fuels.push({
        x: pos.x,
        y: pos.y,
        color: colorObj.hex,
        colorData: colorObj
      });
    } else {
      break;
    }
  }
}

// Random item spawn (30% frequency, max 1 on field)
function spawnRandomItem() {
  if (items.length >= 1) return;
  const pos = getSafeRandomPosition(3);
  if (!pos) return;

  const types = ['SLOW', 'TRIM', 'SHIELD'];
  const type = types[Math.floor(Math.random() * types.length)];

  items.push({
    id: Math.random().toString(36).substring(2, 9),
    type,
    x: pos.x,
    y: pos.y,
    spawnTime: Date.now(),
    lifeMs: 13000,
  });

  addParticles(pos.x, pos.y, type === 'SHIELD' ? '#c084fc' : type === 'SLOW' ? '#38bdf8' : '#34d399', 8);
}

// Initial obstacles at 30s: exactly 5 obstacles (spaced out, not clustered)
function spawnInitialObstacles() {
  if (initialObstaclesSpawned) return;
  initialObstaclesSpawned = true;
  lastObstacleAddedSec = 30;

  for (let i = 0; i < 5; i++) {
    const pos = getNonClusteredObstaclePos(obstacles, 5);
    if (pos) {
      obstacles.push(pos);
      addParticles(pos.x, pos.y, '#f59e0b', 12);
    }
  }

  sounds.playHazardAlert();
  showHazardBanner(`⚠️ 30초 도달: 도로 공사 차단벽 5개 분산 설치!`);
  addFloatingText(Math.floor(gridCount / 2), Math.floor(gridCount / 2), `⚠️ 도로 공사 차단벽 5개 설치!`, '#f87171', 2400);
}

// Progressively add obstacles after 30s up to a maximum of 20
function addProgressiveObstacles(currentSec) {
  if (obstacles.length >= 20) return;
  if (currentSec - lastObstacleAddedSec < 12) return;

  lastObstacleAddedSec = currentSec;
  const addCount = Math.min(3, 20 - obstacles.length);
  let added = 0;

  for (let i = 0; i < addCount; i++) {
    const pos = getNonClusteredObstaclePos(obstacles, 5);
    if (pos) {
      obstacles.push(pos);
      addParticles(pos.x, pos.y, '#f59e0b', 10);
      added++;
    }
  }

  if (added > 0) {
    sounds.playHazardAlert();
    addFloatingText(Math.floor(gridCount / 2), Math.floor(gridCount / 2), `🚧 차단벽 추가 (${obstacles.length}/20개)`, '#f59e0b', 1800);
  }
}

function showHazardBanner(text) {
  hazardAlertText.innerText = text;
  hazardAlertBanner.classList.remove('hidden');
  setTimeout(() => {
    hazardAlertBanner.classList.add('hidden');
  }, 4500);
}

// Particle & Text helpers
function addParticles(gridX, gridY, color, count = 10) {
  const px = (gridX + 0.5) * cellSize;
  const py = (gridY + 0.5) * cellSize;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 2.5 + 1) * (window.devicePixelRatio || 1);
    particles.push({
      x: px,
      y: py,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      alpha: 1,
      life: 0,
      maxLife: Math.random() * 20 + 20,
      size: (Math.random() * 3 + 2) * (window.devicePixelRatio || 1),
    });
  }
}

function addFloatingText(gridX, gridY, text, color, durationMs = 1200) {
  floatingTexts.push({
    id: Math.random().toString(36).substring(2, 9),
    text,
    color,
    x: gridX,
    y: gridY,
    createdAt: Date.now(),
    durationMs,
  });
}

// --- 5. Game Loop & Logic ---
function startGame() {
  sounds.playClick();
  const startX = Math.floor(gridCount / 3);
  const startY = Math.floor(gridCount / 2);

  car = [
    { x: startX, y: startY, color: '#0ea5e9' },
    { x: startX - 1, y: startY, color: '#06b6d4' },
    { x: startX - 2, y: startY, color: '#0284c7' },
  ];
  direction = 'RIGHT';
  nextDirection = 'RIGHT';

  fuels = [];
  items = [];
  obstacles = [];
  floatingTexts = [];
  particles = [];

  score = 0;
  fuelCount = 0;
  itemsCollectedCount = 0;
  elapsedSeconds = 0;
  shieldUntil = 0;
  slowUntil = 0;
  initialObstaclesSpawned = false;
  lastObstacleAddedSec = 0;

  startTime = Date.now();
  lastTickTime = Date.now();
  baseInterval = 150;

  isPlaying = true;
  isPaused = false;
  isGameOver = false;

  updateHUD();
  pauseBtn.disabled = false;
  pauseBtn.classList.remove('opacity-50', 'cursor-not-allowed');

  startOverlay.classList.add('hidden');
  pauseOverlay.classList.add('hidden');
  gameOverOverlay.classList.add('hidden');

  resizeCanvas();
  spawnFuels();
}

// Return to Initial Start Screen
function returnToTitle() {
  sounds.playClick();
  isPlaying = false;
  isPaused = false;
  isGameOver = false;

  score = 0;
  fuelCount = 0;
  elapsedSeconds = 0;
  shieldUntil = 0;
  slowUntil = 0;
  obstacles = [];
  fuels = [];
  items = [];
  car = [];

  updateHUD();
  pauseBtn.disabled = true;
  pauseBtn.classList.add('opacity-50', 'cursor-not-allowed');

  startOverlay.classList.remove('hidden');
  pauseOverlay.classList.add('hidden');
  gameOverOverlay.classList.add('hidden');

  resizeCanvas();
}

function togglePause() {
  if (!isPlaying || isGameOver) return;
  sounds.playClick();
  isPaused = !isPaused;
  if (isPaused) {
    pauseOverlay.classList.remove('hidden');
    pauseIcon.className = 'fa-solid fa-play';
  } else {
    pauseOverlay.classList.add('hidden');
    pauseIcon.className = 'fa-solid fa-pause';
    lastTickTime = Date.now();
  }
}

function handleDirection(newDir) {
  if (!isPlaying || isPaused) return;
  if (newDir === 'UP' && direction !== 'DOWN') nextDirection = 'UP';
  else if (newDir === 'DOWN' && direction !== 'UP') nextDirection = 'DOWN';
  else if (newDir === 'LEFT' && direction !== 'RIGHT') nextDirection = 'LEFT';
  else if (newDir === 'RIGHT' && direction !== 'LEFT') nextDirection = 'RIGHT';
}

function handleGameOver(reason) {
  sounds.playCrash();
  isPlaying = false;
  isGameOver = true;
  pauseBtn.disabled = true;
  pauseBtn.classList.add('opacity-50', 'cursor-not-allowed');

  gameOverReasonText.innerText = reason;
  finalScoreVal.innerText = score;
  finalTimeVal.innerText = formatTime(elapsedSeconds);
  finalItemVal.innerText = `${itemsCollectedCount}개`;

  gameOverOverlay.classList.remove('hidden');
}

// Movement & Collision Tick
function gameTick() {
  if (!isPlaying || isPaused) return;

  const now = Date.now();
  const isShieldActive = now < shieldUntil;

  direction = nextDirection;
  const head = { ...car[0] };

  if (direction === 'UP') head.y -= 1;
  else if (direction === 'DOWN') head.y += 1;
  else if (direction === 'LEFT') head.x -= 1;
  else if (direction === 'RIGHT') head.x += 1;

  // 1. Boundary Check
  if (head.x < 0 || head.x >= gridCount || head.y < 0 || head.y >= gridCount) {
    handleGameOver('외곽 방호벽에 충돌했습니다!');
    return;
  }

  // 2. Obstacle Check
  const obstacleIndex = obstacles.findIndex(o => o.x === head.x && o.y === head.y);
  if (obstacleIndex !== -1) {
    if (isShieldActive) {
      sounds.playShieldDeflect();
      addParticles(head.x, head.y, '#fbbf24', 20);
      addFloatingText(head.x, head.y, '🛡️ 방어막으로 차단벽 돌파!', '#38bdf8', 1600);
      obstacles.splice(obstacleIndex, 1);
      score += 25;
      updateHUD();
    } else {
      handleGameOver('도로 공사 차단벽에 충돌했습니다!');
      return;
    }
  }

  // 3. Body Collision Check
  const hitBody = car.some(seg => seg.x === head.x && seg.y === head.y);
  if (hitBody) {
    if (isShieldActive) {
      sounds.playShieldDeflect();
      addFloatingText(head.x, head.y, '🛡️ 무적 차체 통과!', '#c084fc', 1200);
    } else {
      handleGameOver('자신의 차량 몸체에 충돌했습니다!');
      return;
    }
  }

  // Save previous tail position before movement
  const tail = { ...car[car.length - 1] };

  // Move body segments forward, keeping each segment's individual fuel color
  for (let i = car.length - 1; i > 0; i--) {
    car[i].x = car[i - 1].x;
    car[i].y = car[i - 1].y;
  }
  car[0].x = head.x;
  car[0].y = head.y;

  // 4. Fuel Pickup
  const fuelIndex = fuels.findIndex(f => f.x === head.x && f.y === head.y);
  if (fuelIndex !== -1) {
    const eatenFuel = fuels[fuelIndex];
    sounds.playFuel();
    score += 10;
    fuelCount++;
    fuels.splice(fuelIndex, 1);

    // Car growth: new vehicle segment takes the exact color of the collected fuel
    car.push({
      x: tail.x,
      y: tail.y,
      color: eatenFuel.color
    });

    addParticles(head.x, head.y, eatenFuel.color, 16);
    addFloatingText(head.x, head.y, `+10 ${eatenFuel.colorData?.name || ''} 연료`, eatenFuel.color, 1100);

    if (score > highScore) {
      highScore = score;
      localStorage.setItem('snakekaHighScore_v1', score.toString());
      highScoreDisplay.innerText = highScore;
    }

    updateHUD();
    spawnFuels();
  }

  // 5. Special Item Pickup
  const itemIndex = items.findIndex(i => i.x === head.x && i.y === head.y);
  if (itemIndex !== -1) {
    const item = items[itemIndex];
    items.splice(itemIndex, 1);
    itemsCollectedCount++;

    if (item.type === 'SLOW') {
      sounds.playSlowItem();
      slowUntil = now + 6000;
      addParticles(head.x, head.y, '#38bdf8', 16);
      addFloatingText(head.x, head.y, '❄️ 감속 주행 발동 (6초)', '#38bdf8', 1800);
    } else if (item.type === 'TRIM') {
      sounds.playTrimItem();
      const minLength = 3;
      const currentLength = car.length;
      const trimAmount = Math.min(3, Math.max(0, currentLength - minLength));
      if (trimAmount > 0) {
        car.splice(car.length - trimAmount, trimAmount);
      }
      score += 30;
      addParticles(head.x, head.y, '#34d399', 18);
      addFloatingText(head.x, head.y, `🔧 꼬리 ${trimAmount}칸 단축! (+30점)`, '#34d399', 1800);
    } else if (item.type === 'SHIELD') {
      sounds.playShieldItem();
      shieldUntil = now + 5000; // Exact 5 seconds
      addParticles(head.x, head.y, '#c084fc', 22);
      addFloatingText(head.x, head.y, '🛡️ 5초 무적 쉴드 발동!', '#c084fc', 2000);
    }
    updateHUD();
  }
}

// Update HUD & Buff Bar
function updateHUD() {
  scoreDisplay.innerText = score;
  lengthDisplay.innerText = car.length || 3;
  timeDisplay.innerText = formatTime(elapsedSeconds);

  const now = Date.now();
  let buffHtml = '';

  if (now < shieldUntil) {
    const rem = ((shieldUntil - now) / 1000).toFixed(1);
    buffHtml += `
      <div class="flex-1 flex items-center justify-between px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/50 text-xs font-bold text-purple-300">
        <span class="flex items-center gap-1.5"><i class="fa-solid fa-shield-halved animate-spin text-purple-400"></i> 5초 무적 쉴드</span>
        <span class="font-mono text-purple-200 tabular-nums">${rem}s</span>
      </div>`;
  }

  if (now < slowUntil) {
    const rem = ((slowUntil - now) / 1000).toFixed(1);
    buffHtml += `
      <div class="flex-1 flex items-center justify-between px-3 py-1 rounded-lg bg-sky-500/20 border border-sky-500/50 text-xs font-bold text-sky-300">
        <span class="flex items-center gap-1.5"><i class="fa-solid fa-snowflake animate-pulse text-sky-400"></i> 쿨링 감속 주행</span>
        <span class="font-mono text-sky-200 tabular-nums">${rem}s</span>
      </div>`;
  }

  if (obstacles.length > 0) {
    buffHtml += `
      <div class="px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-xs font-bold text-amber-300 flex items-center gap-1.5">
        <i class="fa-solid fa-triangle-exclamation text-amber-400"></i>
        <span>도로 차단벽 ${obstacles.length}개</span>
      </div>`;
  }

  if (elapsedSeconds < 30 && isPlaying && !isGameOver) {
    buffHtml += `
      <div class="flex-1 text-center py-1 px-2 text-[11px] font-medium text-slate-500 bg-slate-900/40 rounded-lg border border-slate-800/60">
        🚧 도로 공사 차단벽 생성까지 <span class="text-amber-400 font-mono font-bold">${30 - elapsedSeconds}초</span>
      </div>`;
  }

  buffBar.innerHTML = buffHtml;
}

// Continuous Render & Game Loop
function gameLoop() {
  const now = Date.now();

  if (isPlaying && !isPaused) {
    const currentSec = Math.floor((now - startTime) / 1000);
    if (currentSec !== elapsedSeconds) {
      elapsedSeconds = currentSec;
      updateHUD();
    }

    // 30s Obstacle Trigger: 5 to start, up to 20
    if (elapsedSeconds >= 30) {
      if (!initialObstaclesSpawned) {
        spawnInitialObstacles();
      } else {
        addProgressiveObstacles(elapsedSeconds);
      }
    }

    // Item spawn: 30% frequency of original (0.0036)
    if (Math.random() < 0.0036) {
      spawnRandomItem();
    }

    items = items.filter(i => now - i.spawnTime < i.lifeMs);

    // Speed calculation - Max speed reduced to ~0.85x of previous top speed (min interval 88ms vs 75ms)
    let currentInterval = Math.max(88, baseInterval - Math.floor(fuelCount / 2) * 4);
    if (now < slowUntil) {
      currentInterval += 65; // Slow item buffer
    }

    if (now - lastTickTime >= currentInterval) {
      lastTickTime = now;
      gameTick();
    }
  }

  drawScene();
  animId = requestAnimationFrame(gameLoop);
}

// --- 6. Canvas 2D Drawing ---
function drawScene() {
  if (!cellSize) return;
  const now = Date.now();
  const isShieldActive = now < shieldUntil;
  const isSlowActive = now < slowUntil;

  // Clear Arena Asphalt
  ctx.fillStyle = '#060a12';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid Lines
  ctx.strokeStyle = '#111b2b';
  ctx.lineWidth = 1;
  for (let i = 0; i <= gridCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(canvas.width, i * cellSize);
    ctx.stroke();
  }

  // Glowing Track Border
  ctx.strokeStyle = isShieldActive ? '#a855f7' : isSlowActive ? '#38bdf8' : '#1e293b';
  ctx.lineWidth = 2 * (window.devicePixelRatio || 1);
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

  // Car Headlights Beam
  if (car.length > 0) {
    const head = car[0];
    const hx = (head.x + 0.5) * cellSize;
    const hy = (head.y + 0.5) * cellSize;

    ctx.save();
    const grad = ctx.createRadialGradient(hx, hy, cellSize * 0.5, hx, hy, cellSize * 4.5);
    grad.addColorStop(0, isShieldActive ? 'rgba(192, 132, 252, 0.25)' : 'rgba(56, 189, 248, 0.28)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(hx, hy);
    let beamAngle = 0;
    if (direction === 'RIGHT') beamAngle = 0;
    else if (direction === 'DOWN') beamAngle = Math.PI / 2;
    else if (direction === 'LEFT') beamAngle = Math.PI;
    else if (direction === 'UP') beamAngle = -Math.PI / 2;

    ctx.arc(hx, hy, cellSize * 4.5, beamAngle - 0.45, beamAngle + 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Obstacles (Heavy Industrial Hazard Barricades - Distinct High-Contrast Warning Colors)
  obstacles.forEach(obs => {
    const ox = obs.x * cellSize;
    const oy = obs.y * cellSize;
    const pad = 2 * (window.devicePixelRatio || 1);

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(ox + pad, oy + pad, cellSize - pad * 2, cellSize - pad * 2, 4);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.rect(ox + pad, oy + pad, cellSize - pad * 2, cellSize - pad * 2);
    ctx.clip();

    // High visibility safety yellow warning background
    ctx.fillStyle = '#facc15';
    ctx.fillRect(ox + pad, oy + pad, cellSize - pad * 2, cellSize - pad * 2);

    // Bold charcoal black diagonal stripes
    ctx.fillStyle = '#09090b';
    const stripeWidth = cellSize * 0.25;
    for (let s = -cellSize; s < cellSize * 2; s += stripeWidth * 2) {
      ctx.beginPath();
      ctx.moveTo(ox + s, oy);
      ctx.lineTo(ox + s + stripeWidth, oy);
      ctx.lineTo(ox + s + stripeWidth - cellSize, oy + cellSize);
      ctx.lineTo(ox + s - cellSize, oy + cellSize);
      ctx.closePath();
      ctx.fill();
    }

    // High intensity flashing red hazard strobe
    const beaconPulse = Math.sin(now * 0.009) * 0.45 + 0.55;
    ctx.fillStyle = `rgba(239, 68, 68, ${beaconPulse})`;
    ctx.beginPath();
    ctx.arc(ox + cellSize / 2, oy + cellSize / 2, cellSize * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Heavy red danger outline
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2 * (window.devicePixelRatio || 1);
    ctx.strokeRect(ox + pad, oy + pad, cellSize - pad * 2, cellSize - pad * 2);
  });

  // Fuels (Jerrycans with 4 Distinct Colors: 빨강, 파랑, 보라, 초록)
  fuels.forEach(fuel => {
    const fx = fuel.x * cellSize;
    const fy = fuel.y * cellSize;
    const pulse = Math.sin(now * 0.006 + (fuel.x * 3 + fuel.y)) * 1.5;
    const pad = Math.max(3, cellSize * 0.15) - pulse * 0.3;
    const color = fuel.color || '#ef4444';
    const glow = fuel.colorData?.glow || 'rgba(239, 68, 68, 0.35)';

    // Outer colored glow aura
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(fx + cellSize / 2, fy + cellSize / 2, cellSize * 0.58, 0, Math.PI * 2);
    ctx.fill();

    // Jerrycan main canister
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(fx + pad, fy + pad, cellSize - pad * 2, cellSize - pad * 2, 4);
    ctx.fill();

    // Jerrycan white nozzle & handle
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx + cellSize / 2 - 2, fy + pad + 1, 4, cellSize * 0.26);

    // Canister embossed accent
    ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
    ctx.fillRect(fx + cellSize * 0.33, fy + cellSize * 0.48, cellSize * 0.34, cellSize * 0.18);
  });

  // Special Items
  items.forEach(item => {
    const ix = item.x * cellSize;
    const iy = item.y * cellSize;
    const center = cellSize / 2;
    const remainingLife = item.lifeMs - (now - item.spawnTime);

    if (remainingLife < 3500 && Math.floor(now / 150) % 2 === 0) return;

    const hover = Math.sin(now * 0.007 + item.x) * 2;
    const cx = ix + center;
    const cy = iy + center + hover;

    ctx.save();
    if (item.type === 'SLOW') {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.arc(cx, cy, cellSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(cx, cy, cellSize * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `bold ${cellSize * 0.55}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('❄️', cx, cy);
    } else if (item.type === 'TRIM') {
      ctx.fillStyle = 'rgba(52, 211, 153, 0.25)';
      ctx.beginPath();
      ctx.arc(cx, cy, cellSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(cx, cy, cellSize * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `bold ${cellSize * 0.55}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔧', cx, cy);
    } else if (item.type === 'SHIELD') {
      const rot = now * 0.003;
      ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.beginPath();
      ctx.arc(cx, cy, cellSize * 0.55, 0, Math.PI * 2);
      ctx.fill();
      const ox = cx + Math.cos(rot) * (cellSize * 0.45);
      const oy = cy + Math.sin(rot) * (cellSize * 0.45);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7c3aed';
      ctx.beginPath();
      ctx.arc(cx, cy, cellSize * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `bold ${cellSize * 0.55}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🛡️', cx, cy);
    }
    ctx.restore();
  });

  // Car Snake
  car.forEach((segment, index) => {
    const sx = segment.x * cellSize;
    const sy = segment.y * cellSize;
    if (index === 0) {
      drawCarHead(sx, sy, cellSize, direction, isShieldActive, isSlowActive);
    } else {
      drawCarBody(sx, sy, cellSize, segment, index, isShieldActive, isSlowActive);
    }
  });

  // 5s Invincibility Shield Aura Dome
  if (isShieldActive && car.length > 0) {
    const head = car[0];
    const hx = (head.x + 0.5) * cellSize;
    const hy = (head.y + 0.5) * cellSize;
    const shieldRadius = cellSize * 1.6;

    ctx.save();
    const shieldGrad = ctx.createRadialGradient(hx, hy, cellSize * 0.3, hx, hy, shieldRadius);
    shieldGrad.addColorStop(0, 'rgba(192, 132, 252, 0.15)');
    shieldGrad.addColorStop(0.8, 'rgba(168, 85, 247, 0.4)');
    shieldGrad.addColorStop(1, 'rgba(234, 179, 8, 0.8)');
    ctx.fillStyle = shieldGrad;
    ctx.beginPath();
    ctx.arc(hx, hy, shieldRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2 * (window.devicePixelRatio || 1);
    ctx.setLineDash([6, 4]);
    ctx.lineDashOffset = -now * 0.05;
    ctx.beginPath();
    ctx.arc(hx, hy, shieldRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life++;
    p.alpha = Math.max(0, 1 - p.life / p.maxLife);
    if (p.life >= p.maxLife) {
      particles.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Floating Texts
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    const age = now - ft.createdAt;
    if (age >= ft.durationMs) {
      floatingTexts.splice(i, 1);
      continue;
    }
    const progress = age / ft.durationMs;
    const alpha = 1 - progress;
    const floatY = (ft.y + 0.5) * cellSize - progress * 24 * (window.devicePixelRatio || 1);
    const floatX = (ft.x + 0.5) * cellSize;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = ft.color;
    ctx.font = `bold ${Math.max(12, cellSize * 0.65)}px 'Outfit', sans-serif`;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 6;
    ctx.fillText(ft.text, floatX, floatY);
    ctx.restore();
  }
}

function drawCarHead(px, py, cSize, dir, isShield, isSlow) {
  const pad = 2 * (window.devicePixelRatio || 1);
  ctx.save();
  ctx.translate(px + cSize / 2, py + cSize / 2);

  let angle = 0;
  if (dir === 'DOWN') angle = Math.PI / 2;
  else if (dir === 'LEFT') angle = Math.PI;
  else if (dir === 'UP') angle = -Math.PI / 2;

  ctx.rotate(angle);

  // Futuristic Cyan/Blue Sports Car Chassis (completely distinct from yellow/black hazard barrier)
  ctx.fillStyle = isShield ? '#9333ea' : isSlow ? '#0284c7' : '#0ea5e9';
  ctx.beginPath();
  ctx.roundRect(-cSize / 2 + pad, -cSize / 2 + pad, cSize - pad * 2, cSize - pad * 2, 5);
  ctx.fill();

  // Racing Center Stripe
  ctx.fillStyle = isShield ? '#e9d5ff' : '#ffffff';
  ctx.fillRect(-cSize / 2 + pad, -cSize * 0.08, cSize - pad * 2, cSize * 0.16);

  // Tinted Cockpit Windshield (Deep Midnight Tint)
  ctx.fillStyle = isShield ? '#581c87' : '#082f49';
  ctx.beginPath();
  ctx.roundRect(0, -cSize * 0.28, cSize * 0.28, cSize * 0.56, 3);
  ctx.fill();

  // Brilliant Xenon White LED Headlights
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cSize / 2 - pad - 3, -cSize * 0.35, 3, 3);
  ctx.fillRect(cSize / 2 - pad - 3, cSize * 0.35 - 3, 3, 3);

  // Wheels
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-cSize * 0.32, -cSize / 2, cSize * 0.22, 3);
  ctx.fillRect(cSize * 0.12, -cSize / 2, cSize * 0.22, 3);
  ctx.fillRect(-cSize * 0.32, cSize / 2 - 3, cSize * 0.22, 3);
  ctx.fillRect(cSize * 0.12, cSize / 2 - 3, cSize * 0.22, 3);

  ctx.restore();
}

function drawCarBody(px, py, cSize, segment, index, isShield, isSlow) {
  const pad = 3 * (window.devicePixelRatio || 1);
  ctx.save();

  // Use the segment's individual fuel color (Red, Blue, Purple, Green)!
  let baseColor = segment?.color || (index % 2 === 0 ? '#06b6d4' : '#0284c7');
  if (isShield) {
    baseColor = index % 2 === 0 ? '#c084fc' : '#a855f7';
  } else if (isSlow) {
    baseColor = index % 2 === 0 ? '#38bdf8' : '#0284c7';
  }

  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.roundRect(px + pad, py + pad, cSize - pad * 2, cSize - pad * 2, 4);
  ctx.fill();

  // Luminous outline
  ctx.strokeStyle = isShield ? '#7e22ce' : isSlow ? '#0369a1' : 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(px + pad + 2, py + pad + 2, cSize - (pad + 2) * 2, cSize - (pad + 2) * 2);

  // Subtle interior cyber highlight
  ctx.fillStyle = isShield ? 'rgba(233, 213, 255, 0.4)' : isSlow ? 'rgba(186, 230, 253, 0.4)' : 'rgba(255, 255, 255, 0.28)';
  ctx.fillRect(px + cSize * 0.35, py + cSize * 0.35, cSize * 0.3, cSize * 0.3);

  ctx.restore();
}

// --- 7. Event Listeners ---
startBtn.addEventListener('click', startGame);
resumeBtn.addEventListener('click', togglePause);
returnToTitleBtn.addEventListener('click', returnToTitle);
quickRestartBtn.addEventListener('click', startGame);

muteBtn.addEventListener('click', () => {
  sounds.muted = !sounds.muted;
  if (sounds.muted) {
    muteIcon.className = 'fa-solid fa-volume-xmark text-rose-400';
  } else {
    muteIcon.className = 'fa-solid fa-volume-high text-emerald-400';
  }
  sounds.playClick();
});

pauseBtn.addEventListener('click', togglePause);

// Modals
navGuideBtn.addEventListener('click', () => { guideModal.classList.remove('hidden'); sounds.playClick(); });
mobileGuideBtn.addEventListener('click', () => { guideModal.classList.remove('hidden'); sounds.playClick(); });
closeGuideModalBtn.addEventListener('click', () => { guideModal.classList.add('hidden'); sounds.playClick(); });
confirmGuideModalBtn.addEventListener('click', () => { guideModal.classList.add('hidden'); sounds.playClick(); });

// Mobile D-Pad
document.getElementById('dpadUp').addEventListener('click', () => handleDirection('UP'));
document.getElementById('dpadDown').addEventListener('click', () => handleDirection('DOWN'));
document.getElementById('dpadLeft').addEventListener('click', () => handleDirection('LEFT'));
document.getElementById('dpadRight').addEventListener('click', () => handleDirection('RIGHT'));

// Keyboard input
window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'KeyW'].includes(e.code)) {
    e.preventDefault();
    handleDirection('UP');
  } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
    e.preventDefault();
    handleDirection('DOWN');
  } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
    e.preventDefault();
    handleDirection('LEFT');
  } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
    e.preventDefault();
    handleDirection('RIGHT');
  } else if (e.code === 'Space') {
    e.preventDefault();
    if (isGameOver) returnToTitle();
    else if (!isPlaying) startGame();
    else togglePause();
  } else if (e.code === 'KeyR') {
    e.preventDefault();
    if (isGameOver) returnToTitle();
    else startGame();
  } else if (e.code === 'KeyM') {
    e.preventDefault();
    muteBtn.click();
  }
});

// Touch swipe gestures on canvas
let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length > 0) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
  if (e.changedTouches.length > 0) {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
      if (Math.abs(dx) > Math.abs(dy)) {
        handleDirection(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        handleDirection(dy > 0 ? 'DOWN' : 'UP');
      }
    }
  }
}, { passive: true });

// --- 8. Initialize ---
window.onload = () => {
  resizeCanvas();
  gameLoop();
};