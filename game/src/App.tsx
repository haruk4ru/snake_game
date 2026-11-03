/**
 * Super Car Snake: Hazard Run
 * Extended grid (2-3x), 3 special items (Speed Slow, Trim 3 tiles, 5-sec Shield),
 * and 30-second Road Hazard Obstacles (<= 5 barriers).
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Trophy, 
  RotateCcw, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  Shield, 
  Snowflake, 
  Wrench, 
  AlertTriangle, 
  Flame, 
  Timer, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Info,
  Car,
  FolderDown,
  GitBranch,
  Copy,
  Check
} from 'lucide-react';
import { Direction, Point, GameItem, ItemType, Obstacle, FloatingText, Particle } from './types';
import { sounds } from './sound';
import { downloadStandaloneHTML } from './utils/exportHtml';

// Grid size options (original was 15x15 = 225 cells)
// 26x26 is 676 cells (approx 3.0x larger area, matching requirement 1)
const GRID_SIZES = [
  { label: '22 × 22 (2.1배)', value: 22 },
  { label: '26 × 26 (3.0배 기본 추천)', value: 26 },
  { label: '30 × 30 (4.0배 대형)', value: 30 },
];

export default function App() {
  // Game Configuration State
  const [gridCount, setGridCount] = useState<number>(26);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [showGithubModal, setShowGithubModal] = useState<boolean>(false);
  const [copiedGitCmd, setCopiedGitCmd] = useState<boolean>(false);

  // Score & Metrics State
  const [score, setScore] = useState<number>(0);
  const [fuelCount, setFuelCount] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('carSnakeHighScore_v2');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [carLength, setCarLength] = useState<number>(3);
  const [itemsCollectedCount, setItemsCollectedCount] = useState<number>(0);
  const [obstaclesClearedCount, setObstaclesClearedCount] = useState<number>(0);

  // Active Buffs State (for UI meters)
  const [shieldRemainingMs, setShieldRemainingMs] = useState<number>(0);
  const [slowRemainingMs, setSlowRemainingMs] = useState<number>(0);
  const [obstacleCount, setObstacleCount] = useState<number>(0);
  const [hazardAlertActive, setHazardAlertActive] = useState<boolean>(false);

  // Canvas & Game Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mutable Game Loop State
  const gameStateRef = useRef({
    car: [] as Point[],
    direction: 'RIGHT' as Direction,
    nextDirection: 'RIGHT' as Direction,
    fuels: [] as Point[],
    items: [] as GameItem[],
    obstacles: [] as Obstacle[],
    floatingTexts: [] as FloatingText[],
    particles: [] as Particle[],
    startTime: 0,
    lastTickTime: 0,
    fuelCount: 0,
    score: 0,
    highScore: 0,
    shieldUntil: 0, // 5초 무적 타임스탬프
    slowUntil: 0,   // 일시적 감속 타임스탬프
    initialObstaclesSpawned: false,
    lastObstacleAddedSec: 0,
    baseInterval: 140, // Base tick speed ms
    isPlaying: false,
    isPaused: false,
    gridSize: 26,
    cellSize: 0,
  });

  // Sound Mute Toggle
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.setMuted(next);
    sounds.playClick();
  };

  // Download GitHub package ZIP
  const downloadGameZip = () => {
    sounds.playClick();
    const link = document.createElement('a');
    link.href = '/game.zip';
    link.download = 'game.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Git commands to clipboard
  const copyGitCommands = () => {
    sounds.playClick();
    const commands = `git init\ngit add .\ngit commit -m "feat: Super Car Snake initial release"\ngit branch -M main\ngit remote add origin https://github.com/YOUR_GITHUB_ID/YOUR_REPO_NAME.git\ngit push -u origin main`;
    navigator.clipboard.writeText(commands);
    setCopiedGitCmd(true);
    setTimeout(() => setCopiedGitCmd(false), 2500);
  };

  // Helper: Find a safe empty position on the grid
  const getSafeRandomPosition = useCallback((avoidHeadDist = 0): Point | null => {
    const { car, fuels, items, obstacles, gridSize } = gameStateRef.current;
    const head = car[0];

    for (let attempts = 0; attempts < 300; attempts++) {
      const rx = Math.floor(Math.random() * gridSize);
      const ry = Math.floor(Math.random() * gridSize);

      // Check collision with car body
      if (car.some(seg => seg.x === rx && seg.y === ry)) continue;
      // Check collision with fuels
      if (fuels.some(f => f.x === rx && f.y === ry)) continue;
      // Check collision with items
      if (items.some(i => i.x === rx && i.y === ry)) continue;
      // Check collision with obstacles
      if (obstacles.some(o => o.x === rx && o.y === ry)) continue;

      // Avoid spawning directly right in front of the car head
      if (avoidHeadDist > 0 && head) {
        const manhattan = Math.abs(head.x - rx) + Math.abs(head.y - ry);
        if (manhattan < avoidHeadDist) continue;
      }

      return { x: rx, y: ry };
    }
    return null;
  }, []);

  // Spawn fuels (2 initially, 3 when fuel >= 16, 4 when fuel >= 30)
  const spawnFuels = useCallback(() => {
    const { fuels, fuelCount } = gameStateRef.current;
    let targetCount = 2;
    if (fuelCount >= 30) {
      targetCount = 4;
    } else if (fuelCount >= 16) {
      targetCount = 3;
    }

    while (fuels.length < targetCount) {
      const pos = getSafeRandomPosition(2);
      if (pos) fuels.push(pos);
      else break;
    }
  }, [getSafeRandomPosition]);

  // Helper: Find a safe non-clustered position for an obstacle (Requirement: do not cluster)
  const getNonClusteredObstaclePos = useCallback((existingObstacles: Obstacle[], avoidHeadDist = 5): Point | null => {
    const { car, fuels, items, gridSize } = gameStateRef.current;
    const head = car[0];

    // Priority distances to ensure obstacles are spread out cleanly across the arena
    const candidateDistances = [3.8, 3.2, 2.7, 2.3];

    for (const minDist of candidateDistances) {
      for (let attempts = 0; attempts < 180; attempts++) {
        // Keep 1 grid border padding so edge lanes remain drivable
        const rx = Math.floor(Math.random() * (gridSize - 2)) + 1;
        const ry = Math.floor(Math.random() * (gridSize - 2)) + 1;

        if (car.some(seg => seg.x === rx && seg.y === ry)) continue;
        if (fuels.some(f => f.x === rx && f.y === ry)) continue;
        if (items.some(i => i.x === rx && i.y === ry)) continue;
        if (existingObstacles.some(o => o.x === rx && o.y === ry)) continue;

        // Check distance to car head
        if (head) {
          const distToHead = Math.hypot(head.x - rx, head.y - ry);
          if (distToHead < avoidHeadDist) continue;
        }

        // Check distance to all other obstacles to strictly avoid clustering
        const isClustered = existingObstacles.some(obs => {
          const dist = Math.hypot(obs.x - rx, obs.y - ry);
          return dist < minDist;
        });

        if (!isClustered) {
          return { x: rx, y: ry };
        }
      }
    }
    return null;
  }, []);

  // Spawn random items (Requirement: reduce frequency to 30%, max 1 item on field)
  const spawnRandomItem = useCallback(() => {
    const { items } = gameStateRef.current;
    if (items.length >= 1) return; // Keep max 1 item on field to avoid clutter

    const pos = getSafeRandomPosition(3);
    if (!pos) return;

    const types: ItemType[] = ['SLOW', 'TRIM', 'SHIELD'];
    const chosenType = types[Math.floor(Math.random() * types.length)];

    const newItem: GameItem = {
      id: Math.random().toString(36).substring(2, 9),
      type: chosenType,
      x: pos.x,
      y: pos.y,
      spawnTime: Date.now(),
      lifeMs: 13000,
    };

    items.push(newItem);

    // Add spawn sparkles
    addParticles(pos.x, pos.y, chosenType === 'SHIELD' ? '#c084fc' : chosenType === 'SLOW' ? '#38bdf8' : '#34d399', 8);
  }, [getSafeRandomPosition]);

  // Initial obstacles at 30s: exactly 5 obstacles (spaced out, not clustered)
  const spawnInitialObstacles = useCallback(() => {
    const state = gameStateRef.current;
    if (state.initialObstaclesSpawned) return;
    state.initialObstaclesSpawned = true;
    state.lastObstacleAddedSec = 30;

    const newObstacles: Obstacle[] = [];
    const countToSpawn = 5; // Starts with 5 as requested

    for (let i = 0; i < countToSpawn; i++) {
      const pos = getNonClusteredObstaclePos(newObstacles, 5);
      if (pos) {
        newObstacles.push({
          x: pos.x,
          y: pos.y,
          spawnOrder: i + 1,
        });
        addParticles(pos.x, pos.y, '#f59e0b', 12);
      }
    }

    state.obstacles = newObstacles;
    setObstacleCount(newObstacles.length);

    sounds.playHazardAlert();
    setHazardAlertActive(true);
    setTimeout(() => setHazardAlertActive(false), 4500);

    addFloatingText(
      Math.floor(state.gridSize / 2),
      Math.floor(state.gridSize / 2),
      `⚠️ 30초 도달: 도로 공사 차단벽 5개 분산 설치!`,
      '#f87171',
      2400
    );
  }, [getNonClusteredObstaclePos]);

  // Progressively add obstacles after 30s up to a maximum of 20
  const addProgressiveObstacles = useCallback((currentSec: number) => {
    const state = gameStateRef.current;
    if (state.obstacles.length >= 20) return;
    if (currentSec - state.lastObstacleAddedSec < 12) return; // Add every 12 seconds

    state.lastObstacleAddedSec = currentSec;
    // Add 2~3 more obstacles up to max 20
    const addCount = Math.min(3, 20 - state.obstacles.length);
    let added = 0;

    for (let i = 0; i < addCount; i++) {
      const pos = getNonClusteredObstaclePos(state.obstacles, 5);
      if (pos) {
        state.obstacles.push({
          x: pos.x,
          y: pos.y,
          spawnOrder: state.obstacles.length + 1,
        });
        addParticles(pos.x, pos.y, '#f59e0b', 10);
        added++;
      }
    }

    if (added > 0) {
      setObstacleCount(state.obstacles.length);
      sounds.playHazardAlert();
      addFloatingText(
        Math.floor(state.gridSize / 2),
        Math.floor(state.gridSize / 2),
        `🚧 차단벽 추가 (${state.obstacles.length}/20개)`,
        '#f59e0b',
        1800
      );
    }
  }, [getNonClusteredObstaclePos]);

  // Particle helper
  const addParticles = (gridX: number, gridY: number, color: string, count = 10) => {
    const { cellSize } = gameStateRef.current;
    const px = (gridX + 0.5) * cellSize;
    const py = (gridY + 0.5) * cellSize;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.5 + 1;
      gameStateRef.current.particles.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 20 + 20,
        size: Math.random() * 3 + 2,
      });
    }
  };

  // Floating text helper
  const addFloatingText = (gridX: number, gridY: number, text: string, color: string, durationMs = 1200) => {
    gameStateRef.current.floatingTexts.push({
      id: Math.random().toString(36).substring(2, 9),
      text,
      color,
      x: gridX,
      y: gridY,
      createdAt: Date.now(),
      durationMs,
    });
  };

  // Start / Reset Game
  const startGame = useCallback(() => {
    sounds.playClick();
    const startX = Math.floor(gridCount / 3);
    const startY = Math.floor(gridCount / 2);

    gameStateRef.current = {
      car: [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY },
      ],
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      fuels: [],
      items: [],
      obstacles: [],
      floatingTexts: [],
      particles: [],
      startTime: Date.now(),
      lastTickTime: Date.now(),
      fuelCount: 0,
      score: 0,
      highScore: highScore,
      shieldUntil: 0,
      slowUntil: 0,
      initialObstaclesSpawned: false,
      lastObstacleAddedSec: 0,
      baseInterval: 145,
      isPlaying: true,
      isPaused: false,
      gridSize: gridCount,
      cellSize: 0,
    };

    setScore(0);
    setFuelCount(0);
    setElapsedSeconds(0);
    setCarLength(3);
    setItemsCollectedCount(0);
    setObstaclesClearedCount(0);
    setShieldRemainingMs(0);
    setSlowRemainingMs(0);
    setObstacleCount(0);
    setHazardAlertActive(false);
    setGameOver(false);
    setGameOverReason('');
    setIsPaused(false);
    setIsPlaying(true);

    spawnFuels();
  }, [gridCount, highScore, spawnFuels]);

  // Return to Initial Start Screen (Requirement: 다시 주행하기를 눌렀을 때 초기화면으로 이동)
  const returnToTitle = useCallback(() => {
    sounds.playClick();
    setGameOver(false);
    setIsPlaying(false);
    setIsPaused(false);
    setScore(0);
    setFuelCount(0);
    setElapsedSeconds(0);
    setCarLength(3);
    setObstacleCount(0);
    setShieldRemainingMs(0);
    setSlowRemainingMs(0);
    setHazardAlertActive(false);

    gameStateRef.current.isPlaying = false;
    gameStateRef.current.isPaused = false;
    gameStateRef.current.car = [];
    gameStateRef.current.obstacles = [];
    gameStateRef.current.fuels = [];
    gameStateRef.current.items = [];
    gameStateRef.current.initialObstaclesSpawned = false;
    gameStateRef.current.lastObstacleAddedSec = 0;
  }, []);

  // Pause / Resume
  const togglePause = useCallback(() => {
    if (!isPlaying || gameOver) return;
    sounds.playClick();
    setIsPaused(prev => {
      const next = !prev;
      gameStateRef.current.isPaused = next;
      return next;
    });
  }, [isPlaying, gameOver]);

  // Direction Handler
  const handleDirectionChange = useCallback((newDir: Direction) => {
    if (!gameStateRef.current.isPlaying || gameStateRef.current.isPaused) return;
    const current = gameStateRef.current.direction;

    if (newDir === 'UP' && current !== 'DOWN') gameStateRef.current.nextDirection = 'UP';
    else if (newDir === 'DOWN' && current !== 'UP') gameStateRef.current.nextDirection = 'DOWN';
    else if (newDir === 'LEFT' && current !== 'RIGHT') gameStateRef.current.nextDirection = 'LEFT';
    else if (newDir === 'RIGHT' && current !== 'LEFT') gameStateRef.current.nextDirection = 'RIGHT';
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        handleDirectionChange('UP');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        handleDirectionChange('DOWN');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        handleDirectionChange('LEFT');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        handleDirectionChange('RIGHT');
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (gameOver) returnToTitle();
        else togglePause();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        if (gameOver) returnToTitle();
        else startGame();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDirectionChange, togglePause, startGame, gameOver]);

  // Main Game Tick (logic update)
  const gameTick = useCallback(() => {
    const state = gameStateRef.current;
    if (!state.isPlaying || state.isPaused) return;

    const now = Date.now();
    const isShieldActive = now < state.shieldUntil;

    // Advance direction
    state.direction = state.nextDirection;
    const head = { ...state.car[0] };

    if (state.direction === 'UP') head.y -= 1;
    else if (state.direction === 'DOWN') head.y += 1;
    else if (state.direction === 'LEFT') head.x -= 1;
    else if (state.direction === 'RIGHT') head.x += 1;

    // 1. Boundary Check
    if (head.x < 0 || head.x >= state.gridSize || head.y < 0 || head.y >= state.gridSize) {
      handleGameOver('외곽 방호벽에 충돌했습니다!');
      return;
    }

    // 2. Obstacle Check (Requirement 3)
    const obstacleIndex = state.obstacles.findIndex(o => o.x === head.x && o.y === head.y);
    if (obstacleIndex !== -1) {
      if (isShieldActive) {
        // Shield smashes obstacle safely!
        sounds.playShieldDeflect();
        addParticles(head.x, head.y, '#fbbf24', 20);
        addFloatingText(head.x, head.y, '🛡️ 방어막으로 차단벽 돌파!', '#38bdf8', 1600);
        state.obstacles.splice(obstacleIndex, 1);
        setObstacleCount(state.obstacles.length);
        setObstaclesClearedCount(c => c + 1);
        state.score += 25;
        setScore(state.score);
      } else {
        handleGameOver('도로 공사 차단벽에 충돌했습니다!');
        return;
      }
    }

    // 3. Self-Body Collision Check
    const hitBody = state.car.some(seg => seg.x === head.x && seg.y === head.y);
    if (hitBody) {
      if (isShieldActive) {
        // Shield prevents body collision!
        sounds.playShieldDeflect();
        addFloatingText(head.x, head.y, '🛡️ 무적 차체 통과!', '#c084fc', 1200);
      } else {
        handleGameOver('자신의 차량 몸체에 충돌했습니다!');
        return;
      }
    }

    // Move car forward
    state.car.unshift(head);

    // 4. Check Fuel pickup
    const fuelIndex = state.fuels.findIndex(f => f.x === head.x && f.y === head.y);
    if (fuelIndex !== -1) {
      sounds.playFuel();
      state.score += 10;
      state.fuelCount++;
      state.fuels.splice(fuelIndex, 1);
      addParticles(head.x, head.y, '#ef4444', 12);
      addFloatingText(head.x, head.y, '+10 연료', '#f59e0b', 1000);

      if (state.score > state.highScore) {
        state.highScore = state.score;
        setHighScore(state.score);
        localStorage.setItem('carSnakeHighScore_v2', state.score.toString());
      }

      setScore(state.score);
      setFuelCount(state.fuelCount);
      setCarLength(state.car.length);

      spawnFuels();
    } else {
      state.car.pop();
    }

    // 5. Check Item pickup (Requirement 2)
    const itemIndex = state.items.findIndex(i => i.x === head.x && i.y === head.y);
    if (itemIndex !== -1) {
      const item = state.items[itemIndex];
      state.items.splice(itemIndex, 1);
      setItemsCollectedCount(c => c + 1);

      if (item.type === 'SLOW') {
        // Item 1: 일시적 속도 감소 (6초간 지속)
        sounds.playSlowItem();
        state.slowUntil = now + 6000;
        addParticles(head.x, head.y, '#38bdf8', 16);
        addFloatingText(head.x, head.y, '❄️ 감속 주행 발동 (6초)', '#38bdf8', 1800);
      } else if (item.type === 'TRIM') {
        // Item 2: 길이 3칸 감소 (최소 3칸 유지)
        sounds.playTrimItem();
        const minLength = 3;
        const currentLength = state.car.length;
        const trimAmount = Math.min(3, Math.max(0, currentLength - minLength));
        
        if (trimAmount > 0) {
          state.car.splice(state.car.length - trimAmount, trimAmount);
        }
        state.score += 30; // bonus score for trimming
        setScore(state.score);
        setCarLength(state.car.length);
        addParticles(head.x, head.y, '#34d399', 18);
        addFloatingText(head.x, head.y, `🔧 꼬리 ${trimAmount}칸 단축! (+30점)`, '#34d399', 1800);
      } else if (item.type === 'SHIELD') {
        // Item 3: 일시적 무적 (정확히 5초 지속 - 요구사항 준수)
        sounds.playShieldItem();
        state.shieldUntil = now + 5000; // 5초 무적
        addParticles(head.x, head.y, '#c084fc', 22);
        addFloatingText(head.x, head.y, '🛡️ 5초 무적 쉴드 발동!', '#c084fc', 2000);
      }
    }

    setCarLength(state.car.length);
  }, [spawnFuels]);

  // Handle Game Over
  const handleGameOver = (reason: string) => {
    sounds.playCrash();
    gameStateRef.current.isPlaying = false;
    setIsPlaying(false);
    setGameOver(true);
    setGameOverReason(reason);
  };

  // Continuous animation & game loop
  useEffect(() => {
    let animId: number;

    const loop = () => {
      const state = gameStateRef.current;
      const now = Date.now();

      if (state.isPlaying && !state.isPaused) {
        // Update elapsed time
        const currentElapsedSec = Math.floor((now - state.startTime) / 1000);
        setElapsedSeconds(currentElapsedSec);

        // Requirement: 30초 후 5개로 시작해서 최대 20개까지 분산 설치 (밀집 방지)
        if (currentElapsedSec >= 30) {
          if (!state.initialObstaclesSpawned) {
            spawnInitialObstacles();
          } else {
            addProgressiveObstacles(currentElapsedSec);
          }
        }

        // Requirement: 아이템 등장 빈도를 30%로 낮춤 (0.012 -> 0.0036)
        if (Math.random() < 0.0036) {
          spawnRandomItem();
        }

        // Filter expired field items (13s life)
        state.items = state.items.filter(item => now - item.spawnTime < item.lifeMs);

        // Update buff timers for HUD
        setShieldRemainingMs(Math.max(0, state.shieldUntil - now));
        setSlowRemainingMs(Math.max(0, state.slowUntil - now));

        // Speed calculation
        // Base: 145ms. Faster every 2 fuels down to 75ms.
        let currentInterval = Math.max(75, state.baseInterval - Math.floor(state.fuelCount / 2) * 5);
        if (now < state.slowUntil) {
          // Slow item: adds 65ms delay to make car smoothly navigable
          currentInterval += 65;
        }

        if (now - state.lastTickTime >= currentInterval) {
          state.lastTickTime = now;
          gameTick();
        }
      }

      // Render Frame
      drawScene();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameTick, spawnInitialObstacles, addProgressiveObstacles, spawnRandomItem]);

  // Canvas resize and render logic
  const drawScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;
    const { gridSize, car, direction, fuels, items, obstacles, particles, floatingTexts, shieldUntil, slowUntil } = state;
    const now = Date.now();
    const isShieldActive = now < shieldUntil;
    const isSlowActive = now < slowUntil;

    // Retina DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const width = displayWidth;
    const height = displayHeight;
    const cellSize = width / gridSize;
    state.cellSize = cellSize;

    // 1. Clear Arena Asphalt
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle Grid Lines
    ctx.strokeStyle = '#111b2b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(width, i * cellSize);
      ctx.stroke();
    }

    // 3. Glowing Track Outer Border
    ctx.strokeStyle = isShieldActive ? '#a855f7' : isSlowActive ? '#38bdf8' : '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    // 4. Car Headlights projection (cool cinematic cone)
    if (car.length > 0) {
      const head = car[0];
      const hx = (head.x + 0.5) * cellSize;
      const hy = (head.y + 0.5) * cellSize;

      ctx.save();
      const grad = ctx.createRadialGradient(hx, hy, cellSize * 0.5, hx, hy, cellSize * 4.5);
      grad.addColorStop(0, isShieldActive ? 'rgba(192, 132, 252, 0.25)' : 'rgba(251, 191, 36, 0.22)');
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

    // 5. Draw 30s Obstacles (Concrete Hazard Barriers)
    obstacles.forEach((obs) => {
      const ox = obs.x * cellSize;
      const oy = obs.y * cellSize;
      const pad = 2;

      // Concrete block base
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(ox + pad, oy + pad, cellSize - pad * 2, cellSize - pad * 2, 4);
      ctx.fill();

      // Yellow & black hazard stripes
      ctx.save();
      ctx.beginPath();
      ctx.rect(ox + pad, oy + pad, cellSize - pad * 2, cellSize - pad * 2);
      ctx.clip();

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(ox + pad, oy + pad, cellSize - pad * 2, cellSize - pad * 2);

      ctx.fillStyle = '#090d16';
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

      // Pulsing red danger beacon on top
      const beaconPulse = Math.sin(now * 0.008) * 0.4 + 0.6;
      ctx.fillStyle = `rgba(239, 68, 68, ${beaconPulse})`;
      ctx.beginPath();
      ctx.arc(ox + cellSize / 2, oy + cellSize / 2, cellSize * 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ox + pad, oy + pad, cellSize - pad * 2, cellSize - pad * 2);
    });

    // 6. Draw Fuels (Jerrycans)
    fuels.forEach((fuel) => {
      const fx = fuel.x * cellSize;
      const fy = fuel.y * cellSize;
      const pulse = Math.sin(now * 0.006) * 1.5;
      const pad = Math.max(3, cellSize * 0.15) - pulse * 0.3;

      // Glowing halo
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.beginPath();
      ctx.arc(fx + cellSize / 2, fy + cellSize / 2, cellSize * 0.55, 0, Math.PI * 2);
      ctx.fill();

      // Red Jerrycan body
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(fx + pad, fy + pad, cellSize - pad * 2, cellSize - pad * 2, 4);
      ctx.fill();

      // White cap & handle
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(fx + cellSize / 2 - 2, fy + pad + 2, 4, cellSize * 0.25);

      // Gas pump icon symbol
      ctx.fillStyle = '#fecaca';
      ctx.fillRect(fx + cellSize * 0.35, fy + cellSize * 0.48, cellSize * 0.3, cellSize * 0.18);
    });

    // 7. Draw Special Items (Requirement 2)
    items.forEach((item) => {
      const ix = item.x * cellSize;
      const iy = item.y * cellSize;
      const center = cellSize / 2;
      const itemAge = now - item.spawnTime;
      const remainingLife = item.lifeMs - itemAge;

      // Flashing alert when expiring (< 3.5s)
      if (remainingLife < 3500 && Math.floor(now / 150) % 2 === 0) {
        return; // Flash blink
      }

      const hover = Math.sin(now * 0.007 + item.x) * 2;
      const cx = ix + center;
      const cy = iy + center + hover;

      ctx.save();

      if (item.type === 'SLOW') {
        // ❄️ 속도 감소 (Cyan Frost)
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.beginPath();
        ctx.arc(cx, cy, cellSize * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(cx, cy, cellSize * 0.38, 0, Math.PI * 2);
        ctx.fill();

        // Snowflake icon
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${cellSize * 0.55}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❄️', cx, cy);

      } else if (item.type === 'TRIM') {
        // 🔧 길이 3칸 감소 (Emerald Mechanic Wrench)
        ctx.fillStyle = 'rgba(52, 211, 153, 0.25)';
        ctx.beginPath();
        ctx.arc(cx, cy, cellSize * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.arc(cx, cy, cellSize * 0.38, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${cellSize * 0.55}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔧', cx, cy);

      } else if (item.type === 'SHIELD') {
        // 🛡️ 일시적 무적 5초 (Violet/Gold Shield)
        const rot = now * 0.003;
        ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
        ctx.beginPath();
        ctx.arc(cx, cy, cellSize * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // Rotating orbit dot
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

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${cellSize * 0.55}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🛡️', cx, cy);
      }

      ctx.restore();
    });

    // 8. Draw Car Snake
    car.forEach((segment, index) => {
      const sx = segment.x * cellSize;
      const sy = segment.y * cellSize;

      if (index === 0) {
        // Car Head (Sports Racer)
        drawCarHead(ctx, sx, sy, cellSize, direction, isShieldActive, isSlowActive);
      } else {
        // Car Trailer/Body Segments
        drawCarBody(ctx, sx, sy, cellSize, index, isShieldActive, isSlowActive);
      }
    });

    // 9. Invincibility Shield Dome Aura (when 5s shield active)
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

      // Pulsing shield ring
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.lineDashOffset = -now * 0.05;
      ctx.beginPath();
      ctx.arc(hx, hy, shieldRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 10. Draw Particles
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

    // 11. Draw Floating Texts
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      const age = now - ft.createdAt;
      if (age >= ft.durationMs) {
        floatingTexts.splice(i, 1);
        continue;
      }

      const progress = age / ft.durationMs;
      const alpha = 1 - progress;
      const floatY = (ft.y + 0.5) * cellSize - progress * 24;
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

    ctx.restore();
  };

  // Helper: Draw detailed car head
  const drawCarHead = (
    ctx: CanvasRenderingContext2D,
    px: number,
    py: number,
    cellSize: number,
    dir: Direction,
    isShield: boolean,
    isSlow: boolean
  ) => {
    const pad = 2;
    ctx.save();
    ctx.translate(px + cellSize / 2, py + cellSize / 2);

    let angle = 0;
    if (dir === 'DOWN') angle = Math.PI / 2;
    else if (dir === 'LEFT') angle = Math.PI;
    else if (dir === 'UP') angle = -Math.PI / 2;

    ctx.rotate(angle);

    // Chassis color (Red racer, purple if shield, cyan if slow)
    ctx.fillStyle = isShield ? '#9333ea' : isSlow ? '#0284c7' : '#ef4444';
    ctx.beginPath();
    ctx.roundRect(-cellSize / 2 + pad, -cellSize / 2 + pad, cellSize - pad * 2, cellSize - pad * 2, 5);
    ctx.fill();

    // Racing stripe
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-cellSize / 2 + pad, -cellSize * 0.08, cellSize - pad * 2, cellSize * 0.16);

    // Front Windshield
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.roundRect(0, -cellSize * 0.28, cellSize * 0.28, cellSize * 0.56, 3);
    ctx.fill();

    // Headlights
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(cellSize / 2 - pad - 3, -cellSize * 0.35, 3, 3);
    ctx.fillRect(cellSize / 2 - pad - 3, cellSize * 0.35 - 3, 3, 3);

    // Wheels
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-cellSize * 0.32, -cellSize / 2, cellSize * 0.22, 3);
    ctx.fillRect(cellSize * 0.12, -cellSize / 2, cellSize * 0.22, 3);
    ctx.fillRect(-cellSize * 0.32, cellSize / 2 - 3, cellSize * 0.22, 3);
    ctx.fillRect(cellSize * 0.12, cellSize / 2 - 3, cellSize * 0.22, 3);

    ctx.restore();
  };

  // Helper: Draw trailer body segment
  const drawCarBody = (
    ctx: CanvasRenderingContext2D,
    px: number,
    py: number,
    cellSize: number,
    index: number,
    isShield: boolean,
    isSlow: boolean
  ) => {
    const pad = 3;
    ctx.save();

    // Body alternate tone
    const isEven = index % 2 === 0;
    let baseColor = isEven ? '#f59e0b' : '#d97706';
    if (isShield) baseColor = isEven ? '#c084fc' : '#a855f7';
    else if (isSlow) baseColor = isEven ? '#38bdf8' : '#0284c7';

    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.roundRect(px + pad, py + pad, cellSize - pad * 2, cellSize - pad * 2, 4);
    ctx.fill();

    // Inner panel detail
    ctx.strokeStyle = isShield ? '#7e22ce' : isSlow ? '#0369a1' : '#92400e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px + pad + 2, py + pad + 2, cellSize - (pad + 2) * 2, cellSize - (pad + 2) * 2);

    ctx.restore();
  };

  // Format MM:SS
  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-3 sm:p-5 select-none font-sans">
      
      {/* 1. Header (Top Bar Contract: 3 zones) */}
      <header className="w-full max-w-4xl flex items-center justify-between gap-4 py-2 px-3 border-b border-slate-900 mb-3">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-amber-400 flex items-center gap-1.5 leading-tight">
              슈퍼 카 스네이크 <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300">해저드 런</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">3배 확장 필드 · 3종 특수 아이템 · 30초 도로 차단벽</p>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden sm:flex items-center gap-3 text-xs font-medium text-slate-400">
          <button 
            onClick={() => setShowGuide(true)} 
            className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" /> 게임 규칙
          </button>
          <button 
            onClick={() => downloadStandaloneHTML(highScore)} 
            className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
            title="인터넷 없이 플레이 가능한 단일 HTML 파일로 저장"
          >
            <Download className="w-3.5 h-3.5" /> HTML 받기
          </button>
          <button 
            onClick={() => setShowGithubModal(true)} 
            className="hover:text-cyan-300 text-cyan-400 font-bold transition-colors flex items-center gap-1 cursor-pointer px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30"
            title="GitHub 업로드용 game 폴더 ZIP 파일 다운로드"
          >
            <FolderDown className="w-3.5 h-3.5 text-cyan-400" /> GitHub game 폴더 받기
          </button>
        </nav>

        {/* Zone 3: Quick Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isMuted ? '음소거 해제' : '음소거'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={togglePause}
            disabled={!isPlaying || gameOver}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              !isPlaying || gameOver 
                ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-600'
                : isPaused
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="일시정지 / 재개 (Space)"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="w-full max-w-xl flex flex-col items-center gap-3">

        {/* Score & Telemetry Dashboard */}
        <section className="w-full grid grid-cols-4 gap-2 bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg">
          <div className="flex flex-col items-center justify-center p-1.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 tabular-nums font-mono">{score}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-1.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">High</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 tabular-nums font-mono flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 inline text-emerald-500" />
              {highScore}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-1.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-0.5">
              <Timer className="w-3 h-3 text-cyan-400" /> 생존 시간
            </span>
            <span className="text-xl sm:text-2xl font-black text-cyan-400 tabular-nums font-mono">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-1.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-0.5">
              <Flame className="w-3 h-3 text-pink-400" /> 차량 길이
            </span>
            <span className="text-xl sm:text-2xl font-black text-pink-400 tabular-nums font-mono">{carLength}</span>
          </div>
        </section>

        {/* 30-Second Hazard Alert & Active Buff Status Strip */}
        <div className="w-full flex flex-col gap-1.5">
          {/* 30-sec Hazard Banner */}
          {hazardAlertActive && (
            <div className="w-full py-1.5 px-3 rounded-lg bg-rose-500/20 border border-rose-500/50 flex items-center justify-between text-xs text-rose-300 font-bold animate-pulse">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                ⚠️ 30초 생존 경보: 도로 공사 차단벽 {obstacleCount}개 설치 완료!
              </span>
              <span className="text-[10px] bg-rose-500/30 px-2 py-0.5 rounded text-rose-100">충돌 주의</span>
            </div>
          )}

          {/* Buff Indicators */}
          <div className="w-full flex items-center gap-2 min-h-[30px]">
            {/* Shield Meter (5s Invincible) */}
            {shieldRemainingMs > 0 ? (
              <div className="flex-1 flex items-center justify-between px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/50 text-xs font-bold text-purple-300">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-400 animate-spin" /> 5초 무적 쉴드 가동
                </span>
                <span className="font-mono text-purple-200 tabular-nums">
                  {(shieldRemainingMs / 1000).toFixed(1)}s
                </span>
              </div>
            ) : null}

            {/* Slow Meter */}
            {slowRemainingMs > 0 ? (
              <div className="flex-1 flex items-center justify-between px-3 py-1 rounded-lg bg-sky-500/20 border border-sky-500/50 text-xs font-bold text-sky-300">
                <span className="flex items-center gap-1.5">
                  <Snowflake className="w-3.5 h-3.5 text-sky-400 animate-pulse" /> 쿨링 감속 주행
                </span>
                <span className="font-mono text-sky-200 tabular-nums">
                  {(slowRemainingMs / 1000).toFixed(1)}s
                </span>
              </div>
            ) : null}

            {/* 30s Obstacle Status */}
            {obstacleCount > 0 && (
              <div className="px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>도로 차단벽 {obstacleCount}개</span>
              </div>
            )}

            {/* 30s Countdown notice before 30s */}
            {elapsedSeconds < 30 && isPlaying && !gameOver && (
              <div className="flex-1 text-center py-1 px-2 text-[11px] font-medium text-slate-500 bg-slate-900/40 rounded-lg border border-slate-800/60">
                🚧 도로 공사 차단벽 생성까지 <span className="text-amber-400 font-mono font-bold">{30 - elapsedSeconds}초</span>
              </div>
            )}
          </div>
        </div>

        {/* Game Canvas Container */}
        <div 
          ref={containerRef}
          className="relative w-full aspect-square max-w-[540px] bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl"
        >
          <canvas 
            ref={canvasRef} 
            className="w-full h-full block" 
            tabIndex={0}
          />

          {/* Title / Start / Game Over Overlay */}
          {(!isPlaying || isPaused || gameOver) && (
            <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10 transition-all">
              
              {/* Game Over Screen */}
              {gameOver ? (
                <div className="max-w-md flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-2xl mb-2.5 border border-rose-500/30">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black text-rose-400 mb-1">충돌 발생!</h2>
                  <p className="text-xs text-rose-300/80 mb-3 font-medium">{gameOverReason}</p>

                  {/* Summary Card */}
                  <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 mb-4 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">최종 점수</span>
                      <span className="text-lg font-black text-amber-400 font-mono">{score}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">생존 시간</span>
                      <span className="text-lg font-black text-cyan-400 font-mono">{formatTime(elapsedSeconds)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">수집 아이템</span>
                      <span className="text-lg font-black text-purple-400 font-mono">{itemsCollectedCount}개</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    <button
                      onClick={returnToTitle}
                      className="w-full py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" /> 다시 주행하기 (초기화면으로)
                    </button>
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={startGame}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        title="초기화면을 거치지 않고 바로 시작"
                      >
                        <Play className="w-3.5 h-3.5" /> 즉시 재시작
                      </button>
                      <button
                        onClick={() => downloadStandaloneHTML(highScore)}
                        className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        title="HTML 파일 다운로드"
                      >
                        <Download className="w-3.5 h-3.5" /> HTML 다운로드
                      </button>
                    </div>
                  </div>
                </div>
              ) : isPaused ? (
                /* Paused Screen */
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 border border-amber-500/30">
                    <Pause className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-amber-400 mb-1">일시 정지</h2>
                  <p className="text-xs text-slate-400 mb-4">스페이스바 또는 아래 버튼을 눌러 계속 주행하세요.</p>
                  <button
                    onClick={togglePause}
                    className="py-2.5 px-8 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-sm transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" /> 계속 주행하기
                  </button>
                </div>
              ) : (
                /* Initial Title / Welcome Screen */
                <div className="max-w-sm flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/10">
                    <Car className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black text-amber-400 tracking-tight mb-1">슈퍼 카 스네이크</h2>
                  <p className="text-xs text-slate-400 mb-3.5">확장된 필드에서 3종 아이템을 수집하고 장애물을 돌파하세요!</p>

                  {/* Rules summary box */}
                  <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-left text-xs space-y-1.5 mb-4 text-slate-300">
                    <div className="text-[11px] font-bold text-amber-400 border-b border-slate-800 pb-1 flex items-center justify-between">
                      <span>🎮 핵심 시스템 안내</span>
                      <span className="text-slate-500">26×26 필드</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-amber-400 font-bold">⛽ 연료통</span>: 초기 2개 → 16개 후 3개 → 30개 후 4개 등장
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-sky-400 font-bold">❄️ 속도 감소</span>: 6초간 주행 속도 감속 (안정적 코너링)
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-emerald-400 font-bold">🔧 길이 -3칸</span>: 꼬리 3칸 즉시 제거 & 차체 슬림화 (+30점)
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-purple-400 font-bold">🛡️ 5초 무적</span>: 5초간 몸체 & 도로 장애물 완전 돌파!
                    </div>
                    <div className="flex items-center gap-2 text-rose-400 font-semibold pt-1 border-t border-slate-800/60">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>30초 생존 시: 차단벽 5개로 시작해 최대 20개까지 분산 설치</span>
                    </div>
                  </div>

                  {/* Field Size Option Selector */}
                  <div className="w-full mb-4">
                    <label className="text-[11px] font-bold text-slate-400 block mb-1.5 text-left">
                      경기장 필드 크기 선택:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {GRID_SIZES.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setGridCount(opt.value)}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                            gridCount === opt.value
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={startGame}
                    className="w-full py-3 px-8 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-extrabold text-base transition-all shadow-lg shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5 fill-slate-950" /> 주행 시작하기 (Space)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Mobile / Tactile Virtual Controls (Clean D-Pad) */}
        <div className="w-full flex items-center justify-between pt-1 pb-2">
          {/* Keyboard tip */}
          <div className="hidden sm:flex flex-col text-[11px] text-slate-500 font-mono">
            <span>조작: 방향키 / WASD</span>
            <span>일시정지: Space · 재시작: R</span>
          </div>

          {/* Touch D-Pad */}
          <div className="sm:hidden mx-auto grid grid-cols-3 gap-1.5 w-44">
            <div />
            <button
              onClick={() => handleDirectionChange('UP')}
              className="h-12 bg-slate-900 active:bg-amber-500/20 border border-slate-800 active:border-amber-500 rounded-xl flex items-center justify-center text-slate-200 active:text-amber-400 transition-colors"
              aria-label="위쪽"
            >
              <ChevronUp className="w-6 h-6" />
            </button>
            <div />
            <button
              onClick={() => handleDirectionChange('LEFT')}
              className="h-12 bg-slate-900 active:bg-amber-500/20 border border-slate-800 active:border-amber-500 rounded-xl flex items-center justify-center text-slate-200 active:text-amber-400 transition-colors"
              aria-label="왼쪽"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleDirectionChange('DOWN')}
              className="h-12 bg-slate-900 active:bg-amber-500/20 border border-slate-800 active:border-amber-500 rounded-xl flex items-center justify-center text-slate-200 active:text-amber-400 transition-colors"
              aria-label="아래쪽"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleDirectionChange('RIGHT')}
              className="h-12 bg-slate-900 active:bg-amber-500/20 border border-slate-800 active:border-amber-500 rounded-xl flex items-center justify-center text-slate-200 active:text-amber-400 transition-colors"
              aria-label="오른쪽"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Quick rules guide toggle button on mobile */}
          <div className="sm:hidden flex items-center gap-1.5">
            <button
              onClick={() => setShowGuide(true)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center gap-1"
              title="게임 규칙"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowGithubModal(true)}
              className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 text-xs flex items-center gap-1"
              title="GitHub game 폴더"
            >
              <FolderDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => downloadStandaloneHTML(highScore)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center gap-1"
              title="HTML 다운로드"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

      </main>

      {/* 4. Footer */}
      <footer className="w-full max-w-4xl py-3 border-t border-slate-900 text-center text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2 mt-2">
        <span>슈퍼 카 스네이크: 해저드 런 v2.0 · HTML5 Canvas Arcade</span>
        <div className="flex items-center gap-4 text-slate-500">
          <button 
            onClick={() => setShowGithubModal(true)}
            className="text-cyan-400/80 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-medium"
          >
            <FolderDown className="w-3.5 h-3.5" /> 바탕화면용 game 폴더 받기
          </button>
          <span>·</span>
          <span>5초 무적 시 장애물 안전 돌파</span>
        </div>
      </footer>

      {/* 5. Detailed Rules & Item Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Info className="w-4 h-4" /> 게임 상세 가이드 & 아이템 도감
              </h3>
              <button
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="font-bold text-amber-300 block mb-1">1. 게임필드 2-3배 확장</span>
                <p className="text-slate-400 leading-relaxed">
                  기존 15×15(225칸)에서 3배에 달하는 <b className="text-slate-200">26×26(676칸)</b>으로 대폭 넓어졌습니다.
                  긴 차체를 회전시키고 장애물을 회피할 충분한 여유 공간을 제공합니다.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <span className="font-bold text-amber-300 block">2. 무작위 3종 아이템 시스템</span>
                
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                    <Snowflake className="w-4 h-4" />
                  </div>
                  <div>
                    <b className="text-sky-300 block">일시적 속도 감소 (쿨링 브레이크)</b>
                    <p className="text-slate-400">6초 동안 이동 틱 딜레이가 늘어나 차량이 천천히 주행합니다. 고속 상황에서 꼬임 위험을 안전하게 풀어줍니다.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <b className="text-emerald-300 block">길이 3칸 감소 (섀시 정비)</b>
                    <p className="text-slate-400">획득 즉시 꼬리 3칸이 깔끔하게 잘려나가며 차체가 가벼워집니다 (최소 3칸 유지). 보너스 30점 지급!</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <b className="text-amber-300 block">연료통 단계별 확장</b>
                    <p className="text-slate-400">초기 2개로 시작하여, 연료 16개 수집 후 3개, 30개 수집 후 4개가 동시 등장하여 빠른 득점과 성장이 가능합니다.</p>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="font-bold text-rose-400 block mb-1">3. 도로 공사 차단벽 (5개 시작 ~ 최대 20개 분산)</span>
                <p className="text-slate-400 leading-relaxed">
                  게임 시작 후 <b>30초가 경과하면 통과할 수 없는 콘크리트 차단벽이 5개로 시작해 최대 20개까지 분산 설치</b>됩니다 (차단벽끼리 뭉치지 않도록 밀집 방지 안전 거리 유지). 일반 상태에서 부딪히면 게임오버되지만, <b className="text-purple-300">5초 무적 상태</b>에서는 방어막으로 파괴하며 안전하게 돌파할 수 있습니다!
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowGuide(false)}
                className="py-2 px-5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                확인 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. GitHub Upload & game.zip Download Modal */}
      {showGithubModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-cyan-400 flex items-center gap-2">
                <FolderDown className="w-5 h-5 text-cyan-400" />
                GitHub 업로드용 game 폴더 패키지
              </h3>
              <button
                onClick={() => setShowGithubModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              {/* Main Download Button */}
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-center space-y-2">
                <p className="text-xs text-cyan-200 font-medium">
                  GitHub에 올릴 수 있도록 <b className="text-cyan-400">package.json, src, index.html, README.md, .gitignore</b> 등 모든 파일이 포함된 압축 파일입니다.
                </p>
                <button
                  onClick={downloadGameZip}
                  className="w-full py-3 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-cyan-500/25 cursor-pointer flex items-center justify-center gap-2"
                >
                  <FolderDown className="w-4 h-4" /> game.zip 다운로드 (바탕화면에 압축 해제)
                </button>
              </div>

              {/* Instructions */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-amber-300 block">📁 바탕화면에 저장 및 GitHub 업로드 4단계 안내:</span>
                
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400 leading-relaxed">
                  <li>
                    위 <b className="text-cyan-300">game.zip</b> 버튼을 눌러 파일을 다운로드합니다.
                  </li>
                  <li>
                    다운로드 폴더의 <b className="text-slate-200">game.zip</b> 압축을 풀어 <b className="text-amber-300">바탕화면(Desktop)</b>의 <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">game</code> 폴더로 배치합니다.
                  </li>
                  <li>
                    바탕화면의 <b className="text-slate-200">game 폴더 안</b>에서 마우스 우클릭 후 <b>'터미널 열기'</b>(또는 Git Bash)를 실행합니다.
                  </li>
                  <li>
                    아래의 Git 명령어를 복사하여 터미널에 붙여넣기 실행합니다.
                  </li>
                </ol>
              </div>

              {/* Git Commands Box */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between pb-1">
                  <span className="font-mono text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-cyan-400" /> Git 업로드 명령어
                  </span>
                  <button
                    onClick={copyGitCommands}
                    className="flex items-center gap-1 text-[11px] py-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer font-medium transition-colors"
                  >
                    {copiedGitCmd ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" /> 복사 완료!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" /> 명령어 복사
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 font-mono text-[11px] text-cyan-300 overflow-x-auto select-all leading-relaxed">
{`git init
git add .
git commit -m "feat: Super Car Snake initial release"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_ID/YOUR_REPO.git
git push -u origin main`}
                </pre>
                <p className="text-[10px] text-slate-500">
                  * <code className="text-slate-400">YOUR_GITHUB_ID/YOUR_REPO</code> 부분을 본인의 GitHub 리포지토리 주소로 변경하세요.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setShowGithubModal(false)}
                className="py-2 px-5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
