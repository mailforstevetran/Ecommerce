# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Game

No build tools or dependencies. Open `shooter/index.html` directly in a browser to play.

There is also a standalone `tictactoe.html` game at the repo root, unrelated to the shooter.

## Architecture

**Wombat Wars** is a browser-based top-down shooter built with vanilla JS and HTML5 Canvas (800×600, fixed resolution). No frameworks, no transpilation, no npm.

### Global State

All game logic reads from and writes to a single global object `G` defined in `game.js`. It holds: canvas context, game mode, player state, enemy/bullet/particle arrays, score, level, wave, and input state.

### Module Responsibilities

| File | Responsibility |
|---|---|
| `game.js` | Main loop, state machine (`MENU → PLAYING → LEVEL_TRANSITION → GAME_OVER/WIN`), input wiring, wave management |
| `player.js` | 8-directional movement, shooting cooldown, health, animation frames |
| `enemies.js` | Three enemy types (walker/runner/tank), spawning, AI behavior |
| `bullets.js` | Projectile creation, update, collision with enemies |
| `levels.js` | 10-level definitions, each with 2 waves of escalating enemy counts |
| `sprites.js` | All canvas drawing (procedural pixel art — no image assets) |
| `particles.js` | Hit sparks and explosion effects |
| `collision.js` | Circle-based proximity collision detection |
| `ui.js` | HUD, menus, health bar, score display |

### Rendering Pattern

All graphics are drawn procedurally with canvas 2D primitives. `sprites.js` contains stateless draw functions that read from `G`. A CRT scanline filter and grid background are rendered each frame. High score is persisted via `localStorage`.

### Extending the Game

New gameplay features should:
1. Add state to `G` in `game.js`
2. Hook update logic into the main loop's update phase
3. Add draw calls in `sprites.js` or `ui.js`, invoked from the draw phase
4. Use circle-based collision detection (radius comparisons, see `collision.js`)
