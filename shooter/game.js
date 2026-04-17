'use strict';

var G = {
  canvas: null,
  ctx: null,
  state: 'MENU', // MENU, PLAYING, LEVEL_TRANSITION, GAME_OVER, WIN
  score: 0,
  highScore: parseInt(localStorage.getItem('wombatHiScore') || '0', 10),
  level: 1,
  wave: 0,
  player: null,
  enemies: [],
  bullets: [],
  particles: [],
  keys: {},
  mouse: { x: 400, y: 300, down: false },
  screenShake: { timer: 0, mag: 0, ox: 0, oy: 0 },
  waveDelay: 0,
  waveBannerTimer: 0,
  levelDelay: 0,
  menuEnemies: [],
  menuTimer: 0,
  lastTime: 0,
};

// ---- Input ----

function onKeyDown(e) {
  G.keys[e.key] = true;
  if (e.key === 'Enter') {
    if (G.state === 'MENU') startGame();
    else if (G.state === 'LEVEL_TRANSITION') beginLevel();
    else if (G.state === 'GAME_OVER') returnToMenu();
    else if (G.state === 'WIN') returnToMenu();
  }
  // Prevent arrow key scrolling
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
}

function onKeyUp(e) { G.keys[e.key] = false; }

function onMouseMove(e) {
  const rect = G.canvas.getBoundingClientRect();
  const scaleX = G.canvas.width / rect.width;
  const scaleY = G.canvas.height / rect.height;
  G.mouse.x = (e.clientX - rect.left) * scaleX;
  G.mouse.y = (e.clientY - rect.top) * scaleY;
}

function onMouseDown(e) { if (e.button === 0) G.mouse.down = true; }
function onMouseUp(e)   { if (e.button === 0) G.mouse.down = false; }

// ---- State transitions ----

function startGame() {
  G.score = 0;
  G.level = 1;
  G.state = 'PLAYING';
  G.player = createPlayer();
  G.enemies = [];
  G.bullets = [];
  G.particles = [];
  G.wave = 0;
  G.waveDelay = 1.2;
}

function beginLevel() {
  G.state = 'PLAYING';
  G.player = createPlayer();
  G.enemies = [];
  G.bullets = [];
  G.particles = [];
  G.wave = 0;
  G.waveDelay = 1.2;
}

function returnToMenu() {
  G.state = 'MENU';
  G.enemies = [];
  G.bullets = [];
  G.particles = [];
  G.menuTimer = 0;
  initMenuEnemies();
}

function initMenuEnemies() {
  G.menuEnemies = [];
  for (let i = 0; i < 8; i++) {
    G.menuEnemies.push({
      x: Math.random() * G.canvas.width,
      y: Math.random() * G.canvas.height,
      angle: Math.random() * Math.PI * 2,
      animTimer: Math.random() * 4,
      speed: 30 + Math.random() * 25,
    });
  }
}

function spawnNextWave() {
  const levelData = LEVELS[G.level - 1];
  if (G.wave < levelData.waves.length) {
    spawnWaveEnemies(levelData.waves[G.wave]);
    G.wave++;
    G.waveBannerTimer = 1.8;
  } else {
    // Level complete
    G.level++;
    if (G.level > LEVELS.length) {
      G.state = 'WIN';
      if (G.score > G.highScore) {
        G.highScore = G.score;
        localStorage.setItem('wombatHiScore', G.highScore);
      }
    } else {
      G.state = 'LEVEL_TRANSITION';
    }
  }
}

// ---- Update / Draw ----

function updateMenu(dt) {
  G.menuTimer += dt;
  for (const e of G.menuEnemies) {
    e.animTimer += dt * 6;
    e.x += Math.cos(e.angle) * e.speed * dt;
    e.y += Math.sin(e.angle) * e.speed * dt;
    const W = G.canvas.width, H = G.canvas.height;
    if (e.x < -20) { e.x = W + 20; }
    if (e.x > W + 20) { e.x = -20; }
    if (e.y < -20) { e.y = H + 20; }
    if (e.y > H + 20) { e.y = -20; }
  }
}

function updateGame(dt) {
  if (G.state !== 'PLAYING') return;

  // Screen shake
  if (G.screenShake.timer > 0) {
    G.screenShake.timer -= dt;
    const m = G.screenShake.mag * (G.screenShake.timer / 0.2);
    G.screenShake.ox = (Math.random() - 0.5) * m * 2;
    G.screenShake.oy = (Math.random() - 0.5) * m * 2;
  } else {
    G.screenShake.ox = 0;
    G.screenShake.oy = 0;
  }

  if (G.waveBannerTimer > 0) G.waveBannerTimer -= dt;

  // Spawn next wave when all enemies dead
  if (G.enemies.length === 0 && G.state === 'PLAYING') {
    if (G.waveDelay > 0) {
      G.waveDelay -= dt;
    } else {
      spawnNextWave();
      if (G.state === 'PLAYING') G.waveDelay = 2.5;
    }
  }

  updatePlayer(dt);
  updateEnemies(dt);
  updateBullets(dt);
  updateParticles(dt);
}

function drawGame() {
  const ctx = G.ctx;
  const W = G.canvas.width, H = G.canvas.height;

  drawBackground(ctx, W, H);

  ctx.save();
  ctx.translate(Math.round(G.screenShake.ox), Math.round(G.screenShake.oy));

  drawEnemies(ctx);
  drawPlayerEntity(ctx);
  drawBullets(ctx);
  drawParticles(ctx);

  ctx.restore();

  drawScanlines(ctx, W, H);
  drawHUD(ctx);
}

function gameLoop(timestamp) {
  const dt = Math.min((timestamp - G.lastTime) / 1000, 0.05);
  G.lastTime = timestamp;

  const ctx = G.ctx;
  const W = G.canvas.width, H = G.canvas.height;

  if (G.state === 'MENU') {
    updateMenu(dt);
    drawBackground(ctx, W, H);
    drawMenuScreen(ctx, W, H);
    drawScanlines(ctx, W, H);
  } else if (G.state === 'PLAYING') {
    updateGame(dt);
    drawGame();
  } else if (G.state === 'LEVEL_TRANSITION') {
    drawBackground(ctx, W, H);
    drawScanlines(ctx, W, H);
    drawLevelTransitionScreen(ctx, W, H);
  } else if (G.state === 'GAME_OVER') {
    updateParticles(dt);
    drawBackground(ctx, W, H);
    drawParticles(ctx);
    drawScanlines(ctx, W, H);
    drawGameOverScreen(ctx, W, H);
  } else if (G.state === 'WIN') {
    drawBackground(ctx, W, H);
    drawScanlines(ctx, W, H);
    drawWinScreen(ctx, W, H);
  }

  requestAnimationFrame(gameLoop);
}

// ---- Init ----

function init() {
  G.canvas = document.getElementById('gameCanvas');
  G.ctx = G.canvas.getContext('2d');
  G.highScore = parseInt(localStorage.getItem('wombatHiScore') || '0', 10);

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  G.canvas.addEventListener('mousemove', onMouseMove);
  G.canvas.addEventListener('mousedown', onMouseDown);
  G.canvas.addEventListener('mouseup', onMouseUp);
  G.canvas.addEventListener('contextmenu', e => e.preventDefault());

  initMenuEnemies();

  requestAnimationFrame(ts => { G.lastTime = ts; requestAnimationFrame(gameLoop); });
}

document.addEventListener('DOMContentLoaded', init);
