'use strict';

function createBullet(x, y, angle) {
  const speed = 600;
  G.bullets.push({
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    angle,
    damage: 10,
    radius: 4,
    life: 1.6,
  });
}

function updateBullets(dt) {
  const W = G.canvas.width, H = G.canvas.height;
  for (let i = G.bullets.length - 1; i >= 0; i--) {
    const b = G.bullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (b.life <= 0 || b.x < -40 || b.x > W + 40 || b.y < -40 || b.y > H + 40) {
      G.bullets.splice(i, 1);
      continue;
    }
    // Bullet-enemy collision
    for (let j = G.enemies.length - 1; j >= 0; j--) {
      const e = G.enemies[j];
      if (circleCollides(b.x, b.y, b.radius, e.x, e.y, e.radius)) {
        e.hp -= b.damage;
        e.hitFlash = 0.1;
        spawnHitSpark(b.x, b.y);
        G.bullets.splice(i, 1);
        if (e.hp <= 0) {
          spawnExplosion(e.x, e.y, e.type);
          G.score += e.points;
          G.enemies.splice(j, 1);
        }
        break;
      }
    }
  }
}

function drawBullets(ctx) {
  for (const b of G.bullets) {
    drawBulletSprite(ctx, b.x, b.y, b.angle);
  }
}
