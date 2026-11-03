export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Point {
  x: number;
  y: number;
}

export type ItemType = 'SLOW' | 'TRIM' | 'SHIELD';

export interface GameItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  spawnTime: number;
  lifeMs: number; // Duration on field before despawning (e.g., 14000ms)
}

export interface Obstacle {
  x: number;
  y: number;
  spawnOrder: number;
}

export interface FloatingText {
  id: string;
  text: string;
  color: string;
  x: number; // grid coordinate
  y: number; // grid coordinate
  createdAt: number;
  durationMs: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  size: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  fuelCollected: number;
  itemsCollected: number;
  elapsedSeconds: number;
  tailLength: number;
  maxSpeedMs: number;
  obstaclesBlocked: number;
}
