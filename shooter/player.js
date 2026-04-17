'use strict';

function createPlayer() {
  return {
    x: G.canvas.width / 2,
    y: G.canvas.height / 2,
    hp: 100, maxHp: 100,
    speed: 185,
    radius: 14,
    angle: 0,
    shootCooldown: 0,
    invTimer: 0,
    animFrame: 0,
    animTimer: 0,
    moving: false,
  };
}

function updatePlayer(dt) {
  const p = G.player;
  const W = G.canvas.width, H = G.canvas.height;

  // Movement
  let dx = 0, dy = 0;
  if (G.keys['ArrowLeft']  || G.keys['a'] || G.keys['A']) dx -= 1;
  if (G.keys['ArrowRight'] || G.keys['d'] || G.keys['D']) dx += 1;
  if (G.keys['ArrowUp']    || G.keys['w'] || G.keys['W']) dy -= 1;
  if (G.keys['ArrowDown']  || G.keys['s'] || G.keys['S']) dy += 1;

  p.moving = dx !== 0 || dy !== 0;

  if (p.moving) {
    const len = Math.sqrt(dx * dx + dy * dy);
    p.x += (dx / len) * p.speed * dt;
    p.y += (dy / len) * p.speed * dt;
    p.animTimer -= dt;
    if (p.animTimer <= 0) {
      p.animFrame = (p.animFrame + 1) % 4;
      p.animTimer = 0.12;
    }
  }

  // Clamp to canvas
  p.x = Math.max(p.radius, Math.min(W - p.radius, p.x));
  p.y = Math.max(p.radius, Math.min(H - p.radius, p.y));

  // Aim toward mouse
  const mx = G.mouse.x - p.x, my = G.mouse.y - p.y;
  p.angle = Math.atan2(my, mx);

  // Shoot
  if (p.shootCooldown > 0) p.shootCooldown -= dt;
  if ((G.mouse.down || G.keys[' ']) && p.shootCooldown <= 0) {
    createBullet(p.x, p.y, p.angle);
    spawnMuzzleFlash(p.x, p.y, p.angle);
    p.shootCooldown = 0.18;
  }

  // Invincibility cooldown
  if (p.invTimer > 0) p.invTimer -= dt;
}

function drawPlayerEntity(ctx) {
  drawPlayerSprite(ctx, G.player.x, G.player.y, G.player.angle, G.player.animFrame, G.player.invTimer);
}
