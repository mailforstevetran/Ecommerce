'use strict';

function spawnMuzzleFlash(x, y, angle) {
  const tipX = x + Math.cos(angle) * 34;
  const tipY = y + Math.sin(angle) * 34;
  for (let i = 0; i < 5; i++) {
    const spread = (Math.random() - 0.5) * 1.2;
    const a = angle + spread;
    const speed = 60 + Math.random() * 80;
    G.particles.push({
      x: tipX, y: tipY,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      life: 0.07 + Math.random() * 0.05,
      maxLife: 0.12,
      color: Math.random() < 0.5 ? '#ffee44' : '#ff8800',
      size: 2 + Math.random() * 3,
      type: 'spark',
    });
  }
}

function spawnHitSpark(x, y) {
  for (let i = 0; i < 6; i++) {
    const a = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 100;
    G.particles.push({
      x, y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      life: 0.1 + Math.random() * 0.15,
      maxLife: 0.25,
      color: Math.random() < 0.6 ? '#ff4400' : '#ffcc00',
      size: 2 + Math.random() * 3,
      type: 'spark',
    });
  }
}

function spawnExplosion(x, y, type) {
  const count = type === 'tank' ? 18 : type === 'runner' ? 10 : 12;
  const colors = type === 'walker'
    ? ['#4aee2a', '#2ab21a', '#88ff44']
    : type === 'runner'
    ? ['#ff4400', '#ee2200', '#ff8844']
    : ['#888888', '#aaaaaa', '#666666'];

  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const speed = 40 + Math.random() * 140;
    G.particles.push({
      x, y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      life: 0.3 + Math.random() * 0.4,
      maxLife: 0.7,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 3 + Math.random() * 5,
      type: 'debris',
    });
  }
  // Bright flash
  for (let i = 0; i < 8; i++) {
    const a = Math.random() * Math.PI * 2;
    G.particles.push({
      x, y,
      vx: Math.cos(a) * (20 + Math.random() * 40),
      vy: Math.sin(a) * (20 + Math.random() * 40),
      life: 0.08,
      maxLife: 0.08,
      color: '#ffffff',
      size: 4 + Math.random() * 4,
      type: 'spark',
    });
  }
}

function updateParticles(dt) {
  for (let i = G.particles.length - 1; i >= 0; i--) {
    const p = G.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.92;
    p.vy *= 0.92;
    p.life -= dt;
    if (p.life <= 0) G.particles.splice(i, 1);
  }
}

function drawParticles(ctx) {
  for (const p of G.particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    const s = p.size * (p.type === 'debris' ? 1 : alpha);
    ctx.fillRect(snap(p.x - s / 2), snap(p.y - s / 2), Math.ceil(s), Math.ceil(s));
  }
  ctx.globalAlpha = 1;
}

