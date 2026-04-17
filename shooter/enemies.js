'use strict';

const ENEMY_DEFS = {
  walker: { hp: 20,  speed: 60,  damage: 10, points: 10, radius: 13 },
  runner: { hp: 12,  speed: 130, damage: 15, points: 20, radius:  9 },
  tank:   { hp: 80,  speed: 35,  damage: 25, points: 50, radius: 20 },
};

function randomEdgePos() {
  const W = G.canvas.width, H = G.canvas.height, m = 35;
  const edge = Math.floor(Math.random() * 4);
  switch (edge) {
    case 0: return { x: Math.random() * W, y: -m };
    case 1: return { x: Math.random() * W, y: H + m };
    case 2: return { x: -m, y: Math.random() * H };
    default: return { x: W + m, y: Math.random() * H };
  }
}

function createEnemy(type) {
  const def = ENEMY_DEFS[type];
  const pos = randomEdgePos();
  return {
    type,
    x: pos.x, y: pos.y,
    vx: 0, vy: 0,
    hp: def.hp, maxHp: def.hp,
    speed: def.speed,
    damage: def.damage,
    points: def.points,
    radius: def.radius,
    angle: 0,
    animFrame: Math.floor(Math.random() * 4),
    animTimer: Math.random() * 0.15,
    hitFlash: 0,
    jitter: (Math.random() - 0.5) * 0.4,
  };
}

function spawnWaveEnemies(waveData) {
  for (const group of waveData) {
    for (let i = 0; i < group.count; i++) {
      G.enemies.push(createEnemy(group.type));
    }
  }
}

function updateEnemies(dt) {
  const p = G.player;
  for (const e of G.enemies) {
    // Animate
    e.animTimer -= dt;
    if (e.animTimer <= 0) {
      e.animFrame = (e.animFrame + 1) % 4;
      e.animTimer = 0.15;
    }
    if (e.hitFlash > 0) e.hitFlash -= dt;

    // Steer toward player
    const dx = p.x - e.x, dy = p.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    e.angle = Math.atan2(dy, dx);
    const jitterA = e.angle + e.jitter * Math.sin(Date.now() * 0.003 + e.jitter * 10);
    e.vx = Math.cos(jitterA) * e.speed;
    e.vy = Math.sin(jitterA) * e.speed;
    e.x += e.vx * dt;
    e.y += e.vy * dt;
  }

  // Separation: push overlapping enemies apart
  for (let i = 0; i < G.enemies.length; i++) {
    for (let j = i + 1; j < G.enemies.length; j++) {
      const a = G.enemies[i], b = G.enemies[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const dSq = dx * dx + dy * dy;
      const minD = a.radius + b.radius;
      if (dSq < minD * minD && dSq > 0.01) {
        const d = Math.sqrt(dSq);
        const push = (minD - d) * 0.45 / d;
        a.x -= dx * push; a.y -= dy * push;
        b.x += dx * push; b.y += dy * push;
      }
    }
  }

  // Player contact damage
  if (p.invTimer <= 0) {
    for (const e of G.enemies) {
      if (circleCollides(p.x, p.y, p.radius, e.x, e.y, e.radius)) {
        p.hp -= e.damage * dt;
        p.invTimer = 0.18;
        G.screenShake.timer = 0.2;
        G.screenShake.mag = 5;
        if (p.hp <= 0) {
          p.hp = 0;
          G.state = 'GAME_OVER';
          if (G.score > G.highScore) {
            G.highScore = G.score;
            localStorage.setItem('wombatHiScore', G.highScore);
          }
        }
        break;
      }
    }
  }
}

function drawEnemies(ctx) {
  // Draw HP bars above enemies with low health
  for (const e of G.enemies) {
    if (e.hp < e.maxHp) {
      const bw = e.radius * 2 + 4, bh = 4;
      const bx = Math.round(e.x - bw / 2), by = Math.round(e.y - e.radius - 9);
      ctx.fillStyle = '#111';
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = e.hp / e.maxHp > 0.5 ? '#44cc44' : '#cc4444';
      ctx.fillRect(bx + 1, by + 1, Math.floor((bw - 2) * e.hp / e.maxHp), bh - 2);
    }
  }
  // Draw enemies
  for (const e of G.enemies) {
    switch (e.type) {
      case 'walker': drawWalkerSprite(ctx, e.x, e.y, e.angle, e.animFrame, e.hitFlash); break;
      case 'runner': drawRunnerSprite(ctx, e.x, e.y, e.angle, e.animFrame, e.hitFlash); break;
      case 'tank':   drawTankSprite(ctx,   e.x, e.y, e.angle, e.animFrame, e.hitFlash); break;
    }
  }
}
