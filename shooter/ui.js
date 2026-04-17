'use strict';

function pixelText(ctx, text, x, y, size, color, align) {
  ctx.save();
  ctx.font = `bold ${size}px "Courier New", monospace`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  // Glow layers
  ctx.fillStyle = 'rgba(0,255,60,0.18)';
  ctx.fillText(text, x + 3, y + 3);
  ctx.fillStyle = 'rgba(0,255,60,0.1)';
  ctx.fillText(text, x - 2, y - 2);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawHUD(ctx) {
  const p = G.player;
  const W = G.canvas.width;

  // Health bar
  const bw = 180, bh = 16, bx = 14, by = 14;
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = '#2a4a2a';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx, by, bw, bh);
  const ratio = p.hp / p.maxHp;
  const hpColor = ratio > 0.5 ? '#22ee22' : ratio > 0.25 ? '#eeee22' : '#ee2222';
  ctx.fillStyle = hpColor;
  ctx.fillRect(bx + 1, by + 1, Math.floor((bw - 2) * ratio), bh - 2);
  // Segment lines
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  for (let i = 1; i < 10; i++) {
    ctx.fillRect(bx + Math.floor(bw * i / 10), by, 1, bh);
  }
  pixelText(ctx, 'HP', bx + bw + 8, by + bh / 2, 12, '#44cc44');
  pixelText(ctx, Math.ceil(p.hp) + '', bx + bw + 28, by + bh / 2, 12, '#88ff88');

  // Score
  pixelText(ctx, 'SCORE', W / 2, 14, 11, '#aaaaaa', 'center');
  pixelText(ctx, String(G.score).padStart(6, '0'), W / 2, 30, 18, '#ffdd44', 'center');

  // Level / Wave
  const totalWaves = LEVELS[G.level - 1].waves.length;
  pixelText(ctx, `LVL ${G.level}  WAVE ${G.wave}/${totalWaves}`, W - 14, 22, 12, '#88cc88', 'right');

  // Wave banner
  if (G.waveBannerTimer > 0) {
    const alpha = Math.min(1, G.waveBannerTimer / 0.4);
    ctx.save();
    ctx.globalAlpha = alpha;
    pixelText(ctx, `-- WAVE ${G.wave} --`, W / 2, G.canvas.height / 2 - 60, 26, '#ffdd44', 'center');
    ctx.restore();
  }
}

function drawMenuScreen(ctx, W, H) {
  // Animated background enemies
  for (const e of G.menuEnemies) {
    drawWalkerSprite(ctx, e.x, e.y, e.angle, Math.floor(e.animTimer) % 4, 0);
  }

  // Title panel
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(W / 2 - 230, H / 2 - 130, 460, 260);
  ctx.strokeStyle = '#1a4a1a';
  ctx.lineWidth = 2;
  ctx.strokeRect(W / 2 - 230, H / 2 - 130, 460, 260);

  pixelText(ctx, 'WOMBAT WARS', W / 2, H / 2 - 75, 38, '#44ff44', 'center');
  pixelText(ctx, 'A TOP-DOWN SURVIVOR', W / 2, H / 2 - 35, 14, '#448844', 'center');

  ctx.fillStyle = '#1a3a1a';
  ctx.fillRect(W / 2 - 200, H / 2 - 10, 400, 1);

  pixelText(ctx, 'MOVE: ARROW KEYS / WASD', W / 2, H / 2 + 18, 13, '#66aa66', 'center');
  pixelText(ctx, 'AIM: TRACKPAD/MOUSE  SHOOT: CLICK/SPACE', W / 2, H / 2 + 38, 11, '#66aa66', 'center');
  pixelText(ctx, 'SURVIVE ALL 10 LEVELS', W / 2, H / 2 + 60, 13, '#66aa66', 'center');

  // Blink effect for press enter
  const blink = Math.floor(Date.now() / 500) % 2 === 0;
  if (blink) {
    pixelText(ctx, '[ PRESS ENTER TO START ]', W / 2, H / 2 + 98, 15, '#88ff88', 'center');
  }

  pixelText(ctx, `HI-SCORE: ${String(G.highScore).padStart(6,'0')}`, W / 2, H / 2 + 118, 12, '#ffdd44', 'center');
}

function drawLevelTransitionScreen(ctx, W, H) {
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#224422';
  ctx.lineWidth = 2;
  const bx = W / 2 - 210, by = H / 2 - 110;
  ctx.fillStyle = 'rgba(4,12,4,0.95)';
  ctx.fillRect(bx, by, 420, 220);
  ctx.strokeRect(bx, by, 420, 220);

  pixelText(ctx, `LEVEL ${G.level - 1} COMPLETE!`, W / 2, H / 2 - 65, 26, '#44ff44', 'center');

  const stars = '* '.repeat(Math.min(G.level - 1, 5)).trim();
  pixelText(ctx, stars, W / 2, H / 2 - 32, 18, '#ffdd44', 'center');

  pixelText(ctx, `SCORE: ${String(G.score).padStart(6,'0')}`, W / 2, H / 2, 18, '#ffdd44', 'center');

  if (G.level <= LEVELS.length) {
    pixelText(ctx, `NEXT: LEVEL ${G.level}`, W / 2, H / 2 + 38, 16, '#88cc88', 'center');
    const blink = Math.floor(Date.now() / 500) % 2 === 0;
    if (blink) {
      pixelText(ctx, '[ PRESS ENTER TO CONTINUE ]', W / 2, H / 2 + 72, 13, '#88ff88', 'center');
    }
  }
}

function drawGameOverScreen(ctx, W, H) {
  ctx.fillStyle = 'rgba(0,0,0,0.82)';
  ctx.fillRect(0, 0, W, H);

  const bx = W / 2 - 210, by = H / 2 - 120;
  ctx.fillStyle = 'rgba(10,2,2,0.97)';
  ctx.fillRect(bx, by, 420, 240);
  ctx.strokeStyle = '#4a1a1a';
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, 420, 240);

  pixelText(ctx, 'GAME OVER', W / 2, H / 2 - 72, 36, '#ff3333', 'center');
  pixelText(ctx, `YOU REACHED LEVEL ${G.level}`, W / 2, H / 2 - 28, 15, '#aa4444', 'center');
  pixelText(ctx, `SCORE: ${String(G.score).padStart(6,'0')}`, W / 2, H / 2 + 6, 20, '#ffdd44', 'center');

  const newHi = G.score >= G.highScore && G.score > 0;
  pixelText(ctx,
    newHi ? `NEW HI-SCORE!` : `HI-SCORE: ${String(G.highScore).padStart(6,'0')}`,
    W / 2, H / 2 + 38, 14,
    newHi ? '#ff88ff' : '#888844', 'center');

  const blink = Math.floor(Date.now() / 500) % 2 === 0;
  if (blink) {
    pixelText(ctx, '[ PRESS ENTER TO RETRY ]', W / 2, H / 2 + 78, 14, '#ff8888', 'center');
  }
}

function drawWinScreen(ctx, W, H) {
  ctx.fillStyle = 'rgba(0,0,0,0.82)';
  ctx.fillRect(0, 0, W, H);

  const bx = W / 2 - 240, by = H / 2 - 140;
  ctx.fillStyle = 'rgba(2,10,2,0.97)';
  ctx.fillRect(bx, by, 480, 280);
  ctx.strokeStyle = '#224422';
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, 480, 280);

  pixelText(ctx, 'YOU SURVIVED!', W / 2, H / 2 - 90, 34, '#44ff44', 'center');
  pixelText(ctx, 'ALL 10 LEVELS CONQUERED', W / 2, H / 2 - 48, 15, '#88cc88', 'center');
  pixelText(ctx, '* * * * * * * * * *', W / 2, H / 2 - 20, 16, '#ffdd44', 'center');
  pixelText(ctx, `FINAL SCORE: ${String(G.score).padStart(6,'0')}`, W / 2, H / 2 + 16, 22, '#ffdd44', 'center');

  const newHi = G.score >= G.highScore;
  pixelText(ctx,
    newHi ? '** NEW HIGH SCORE! **' : `HI-SCORE: ${String(G.highScore).padStart(6,'0')}`,
    W / 2, H / 2 + 52, 15,
    newHi ? '#ff88ff' : '#888844', 'center');

  const blink = Math.floor(Date.now() / 500) % 2 === 0;
  if (blink) {
    pixelText(ctx, '[ PRESS ENTER TO PLAY AGAIN ]', W / 2, H / 2 + 96, 14, '#88ff88', 'center');
  }
}
