# Snake-Pedia 🐍

[![Play Game](https://img.shields.io/badge/Play-Live_Demo-success?style=for-the-badge)](https://nirmalya-c.github.io/Snake-Pedia/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Tech-Vanilla_JS-yellow.svg)]()

**Snake-Pedia** is a highly polished, single-player evolution of the classic Snake arcade game. It runs entirely in the browser without any heavy frameworks, relying strictly on clean Vanilla JavaScript, responsive CSS, and native HTML5 Canvas rendering. 

It features dynamic difficulty scaling, fully responsive mobile touch controls, natively synthesized retro audio, and visually engaging dynamic rendering.

---

## 🎮 Play Live Right Now!

**[Click here to play Snake-Pedia instantly in your browser!](https://nirmalya-c.github.io/Snake-Pedia/)**

## ✨ Features

- **Interactive Dynamic Rendering:** The snake's entire body path is tethered to a beautiful, smoothly animated rainbow spectrum that responds perfectly to the browser's global clock (`performance.now()`), creating a living, breathing neon visual effect.
- **Auto-Scaling Difficulty:** The game begins at a manageable `0.5x` speed. For every apple consumed, the snake speed increases by precisely `0.1x`—keeping you constantly on your toes.
- **Native Web Audio Synthesis:** Snake-Pedia utilizes the browser's native **Web Audio API** to generate all retro 8-bit sound effects mathematically (such as "eating blips" and "death booms"). **Zero external audio files (`.mp3` / `.wav`) are required.**
- **Persistent High-Scores:** High scores are cleanly processed and stored directly in your browser's `localStorage`. Try and beat your past self!
- **Wrap-around Matrix:** Unlike early cell phone games, crashing into the walls won't kill you here. Your snake will logically wrap around to the other side of the board!
- **Fully Responsive & Cross Platform:** Playable with Keyboard (`WASD` / `Arrows`), Mobile Touch Swiping, or on-screen D-pad toggles.
- **Pause System:** Gracefully pause the game logic loop securely at any time using `P` or `Escape`.

## 📜 Complete Rules of the Game

1. **Objective:** Guide your snake around the grid to eat the glowing red apple blocks. Doing so increases your length and points.
2. **Speed Thresholds:** The board gets faster and more chaotic every single time you eat an apple.
3. **Boundaries:** The top, bottom, and side walls act as teleportation edges. If you exit the top, you re-enter via the bottom.
4. **Game Over Condition:** The game will immediately end if your snake's head crashes into *any* segment of its own body. Once dead, you must click **Restart Game**.

---

## ⚙️ Working Algorithm & Game Mechanics

### The Core Loop
Snake-Pedia is driven by a `requestAnimationFrame` master loop ensuring absolutely smooth rendering directly synced to the monitor's refresh rate. However, the game state updates are inherently decoupled from visual frame rendering. 
A dynamically scaling interval logic (the `currentTick()`) checks logic states roughly every `X` milliseconds. As the user eats, that millisecond interval shrinks, driving the velocity up.

### Frame-Independent Grid Snap
Coordinates operate strictly on a rigid coordinate integer grid (`CELL_COUNT = 15`). While the visual pixel canvas size alters dynamically to fit the window (i.e. `800x800` vs `300x300`), the physical game array relies solely on abstract grid coordinates (e.g., `x: 5, y: 15`).
Whenever an input updates the snake's velocity, it queues linearly into a buffer to prevent dual-input suicide bugs on a single tick. 

### Visual Hue Processing
The interactive rainbow body scales perfectly proportional to mathematical shifts logic:
```javascript
const timeHue = (performance.now() / 20) % 360;
const segHue = (timeHue - i * 12 + 360) % 360;
```
As it steps downward across the index `i` of the array array list containing the body coordinates, it actively subtracts degrees on the `HSL()` color wheel. This forms a perfect continuous moving wave visual across the chain, without requiring complex graphical pipelines.

---

## 🚀 Quick Start (For Local Development)

Because Snake-Pedia is built without bundlers or JS frameworks, development is blisteringly fast. Just clone the repository and serve the files locally via a basic HTTP server.

```bash
# Clone the repository
git clone https://github.com/Nirmalya-C/Snake-Pedia.git

# Enter the directory
cd Snake-Pedia

# Serve up the index.html on a local open port
python -m http.server 8080
```
*(Now open up `http://localhost:8080` in your browser)*

## 📁 Project Structure

```text
.
├── assets
│   ├── css
│   │   └── style.css   # Contains the full styling dictionary and UI
│   └── js
│       └── game.js     # Houses the Game Loop, Audio Context, and Logic
└── index.html          # Shell layout containing the responsive elements
```
