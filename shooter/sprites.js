'use strict';

function snap(n) { return Math.round(n); }

function drawBackground(ctx, W, H) {
  ctx.fillStyle = '#080e08';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#0c160c';
  ctx.lineWidth = 1;
  const gs = 40;
  for (let x = 0; x < W; x += gs) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += gs) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

function drawScanlines(ctx, W, H) {
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  for (let y = 0; y < H; y += 3) {
    ctx.fillRect(0, y, W, 1);
  }
}

function drawPlayerSprite(ctx, x, y, angle, frame, invTimer) {
  x = snap(x); y = snap(y);
  ctx.save();

  // Blink when invincible
  if (invTimer > 0 && Math.floor(invTimer * 12) % 2 === 0) {
    ctx.globalAlpha = 0.35;
  }

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(x + 3, y + 6, 13, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gun arm (drawn before body so body covers part of arm)
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = '#1c3a1c';
  ctx.fillRect(4, -5, 14, 9);
  // Gun body
  ctx.fillStyle = '#444';
  ctx.fillRect(8, -3, 22, 6);
  ctx.fillStyle = '#5a5a5a';
  ctx.fillRect(9, -2, 18, 4);
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(28, -2, 6, 4);
  // Grip
  ctx.fillStyle = '#3a2a14';
  ctx.fillRect(10, 3, 7, 6);
  ctx.restore();

  // Body
  ctx.fillStyle = '#1c3c1c';
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a5a2a';
  ctx.beginPath();
  ctx.arc(x - 1, y - 1, 10, 0, Math.PI * 2);
  ctx.fill();

  // Jacket stripe
  ctx.fillStyle = '#1a341a';
  ctx.fillRect(x - 8, y - 3, 16, 6);
  ctx.fillStyle = '#244824';
  ctx.fillRect(x - 6, y - 2, 12, 4);

  // Face
  ctx.fillStyle = '#c8946a';
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();

  // Helmet
  ctx.fillStyle = '#162616';
  ctx.beginPath();
  ctx.arc(x, y - 1, 8, -Math.PI * 0.92, -0.18);
  ctx.lineTo(x, y - 1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1e321e';
  ctx.fillRect(x - 9, y - 6, 18, 3);

  // Eye direction dot
  const ex = x + Math.cos(angle) * 3.5, ey = y + Math.sin(angle) * 3.5;
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(snap(ex), snap(ey), 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawWalkerSprite(ctx, x, y, angle, frame, hitFlash) {
  x = snap(x); y = snap(y);
  ctx.save();

  const flash = hitFlash > 0;
  const body = flash ? '#ffffff' : '#3aaa2a';
  const dark = flash ? '#dddddd' : '#268a18';

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 5, 13, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Arms (animate with frame)
  const bob = frame % 2 === 0 ? 3 : -3;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = body;
  ctx.fillRect(9, -4 + bob, 13, 6);
  ctx.fillRect(9, -4 - bob, 13, 6);
  ctx.fillStyle = dark;
  ctx.fillRect(10, -3 + bob, 10, 4);
  ctx.fillRect(10, -3 - bob, 10, 4);
  ctx.restore();

  // Body
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(x, y, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.arc(x + 1, y - 1, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = flash ? '#eeeeee' : '#4abd38';
  ctx.beginPath();
  ctx.arc(x + 1, y - 1, 5, 0, Math.PI * 2);
  ctx.fill();

  // Face (rotated toward player)
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  // X eyes
  const ec = flash ? '#600' : '#dd1111';
  ctx.strokeStyle = ec;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(3, -6); ctx.lineTo(7, -2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(7, -6); ctx.lineTo(3, -2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(3, 2); ctx.lineTo(7, 6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(7, 2); ctx.lineTo(3, 6); ctx.stroke();
  // Jagged mouth
  ctx.strokeStyle = flash ? '#944' : '#cc2200';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(4, -1); ctx.lineTo(6, 1); ctx.lineTo(8, -1); ctx.lineTo(10, 1);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

function drawRunnerSprite(ctx, x, y, angle, frame, hitFlash) {
  x = snap(x); y = snap(y);
  ctx.save();

  const flash = hitFlash > 0;
  const body = flash ? '#ffffff' : '#cc2200';
  const light = flash ? '#eeeeee' : '#ee4422';

  // Shadow (squished)
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 4, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body (elongated in movement direction)
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(1.3, 0.8);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.arc(-1, -1, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Face
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  // Yellow eyes
  const eyeC = flash ? '#aa8800' : '#ffcc00';
  ctx.fillStyle = eyeC;
  ctx.beginPath(); ctx.arc(5, -4, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5, 4, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(6, -4, 1.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(6, 4, 1.3, 0, Math.PI * 2); ctx.fill();
  // Angry brows
  ctx.strokeStyle = flash ? '#660' : '#880000';
  ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(3, -7); ctx.lineTo(8, -5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(3, 7); ctx.lineTo(8, 5); ctx.stroke();
  // Teeth
  ctx.strokeStyle = flash ? '#aaa' : '#ffaaaa';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(5, -1); ctx.lineTo(9, 0); ctx.lineTo(5, 1); ctx.stroke();
  ctx.restore();

  ctx.restore();
}

function drawTankSprite(ctx, x, y, angle, frame, hitFlash) {
  x = snap(x); y = snap(y);
  ctx.save();

  const flash = hitFlash > 0;
  const body = flash ? '#ffffff' : '#4a5a4a';
  const light = flash ? '#eeeeee' : '#6a7a6a';
  const dark = flash ? '#cccccc' : '#2a3a2a';

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(x + 4, y + 8, 22, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spikes
  ctx.fillStyle = dark;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + angle;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a - 0.22) * 18, y + Math.sin(a - 0.22) * 18);
    ctx.lineTo(x + Math.cos(a) * 25, y + Math.sin(a) * 25);
    ctx.lineTo(x + Math.cos(a + 0.22) * 18, y + Math.sin(a + 0.22) * 18);
    ctx.closePath();
    ctx.fill();
  }

  // Outer body
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2); ctx.fill();
  // Armor ring
  ctx.fillStyle = dark;
  ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = light;
  ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();

  // Face
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const eyeRed = flash ? '#ff4444' : '#ff2200';
  ctx.fillStyle = eyeRed;
  ctx.beginPath(); ctx.arc(4, -4, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(4, 4, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = flash ? '#ffaaaa' : '#ff8844';
  ctx.beginPath(); ctx.arc(5, -4, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5, 4, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  ctx.restore();
}

function drawBulletSprite(ctx, x, y, angle) {
  ctx.save();
  ctx.translate(snap(x), snap(y));
  ctx.rotate(angle);
  // Trail
  ctx.fillStyle = 'rgba(255,220,0,0.25)';
  ctx.fillRect(-18, -3, 18, 6);
  ctx.fillStyle = 'rgba(255,220,0,0.12)';
  ctx.fillRect(-28, -4, 12, 8);
  // Bullet
  ctx.fillStyle = '#ffdd00';
  ctx.fillRect(-4, -2, 12, 4);
  ctx.fillStyle = '#ffffaa';
  ctx.fillRect(6, -1, 5, 2);
  ctx.restore();
}
