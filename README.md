# 🐍 Snake-Pedia

[![Play Game](https://img.shields.io/badge/Play-Live_Demo-success?style=for-the-badge)](https://nirmalya-c.github.io/Snake-Pedia/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Tech-Vanilla_JS-yellow.svg)]()

**Snake-Pedia** is a highly polished, single-player evolution of the classic arcade game, *Snake*. Built as an educational and interactive project, it runs entirely in the browser without any heavy frameworks or dependencies. The game logic relies strictly on clean, fundamental **Vanilla JavaScript**, making it an excellent learning resource for understanding core browser APIs and game development mechanics.

It features dynamic difficulty scaling, fully responsive mobile touch controls, natively synthesized retro audio, and visually engaging dynamic rendering—all calculated mathematically at runtime.

---

## 🎮 Play Live Right Now!

**[Click here to play Snake-Pedia instantly in your browser!](https://nirmalya-c.github.io/Snake-Pedia/)**

---

## ✨ Features & Learning Concepts

Snake-Pedia was built to demonstrate several core concepts of web-based game design:

- **Interactive Dynamic Rendering:** The snake's entire body path is tethered to a beautiful, smoothly animated rainbow spectrum. This is achieved by tying the rendering loop directly to the browser's global clock (`performance.now()`), allowing the colors to cascade flawlessly down the snake's segments.
- **Auto-Scaling Difficulty:** The game begins at a manageable `0.5x` speed. For every apple consumed, the interval delay decreases, increasing the snake's velocity by precisely `0.1x`. This demonstrates dynamic state management and interval manipulation.
- **Native Web Audio Synthesis:** Instead of loading bulky `.mp3` or `.wav` files, Snake-Pedia utilizes the browser's native **Web Audio API** to generate all retro 8-bit sound effects mathematically (such as "eating blips" and "death booms"). This teaches the fundamentals of oscillators, frequencies, and audio contexts.
- **Persistent High-Scores:** High scores are cleanly processed and stored directly in your browser's `localStorage`, demonstrating persistent data management on the client side without needing a database.
- **Wrap-around Matrix:** Unlike early cell phone games, crashing into the walls won't result in an instant Game Over. Your snake's coordinates are modulated based on the grid size, allowing it to logically wrap around to the other side of the board.
- **Fully Responsive & Cross Platform:** Playable with a Keyboard (`WASD` / `Arrows`), Mobile Touch Swiping (handling `touchstart` and `touchend` events), or on-screen D-pad toggles.
- **Graceful Pause System:** Securely pause the game logic loop at any time using `P` or `Escape`, demonstrating how to halt and resume state-driven loops.

---

## 📜 Complete Rules of the Game

1. **Objective:** Guide your snake around the grid to eat the glowing red apple blocks. Every apple consumed increases your snake's length and your total score.
2. **Speed Thresholds:** The board gets faster and more chaotic every single time you eat an apple. Reflexes are key!
3. **Boundaries (Wrap-around):** The top, bottom, and side walls act as teleportation edges. If you exit the top of the grid, you will seamlessly re-enter via the bottom.
4. **Game Over Condition:** The game will immediately end if your snake's head crashes into *any* segment of its own body. Once dead, you must click **Restart Game** to reset the state.

---

## ⚙️ Working Algorithm & Game Mechanics Explained

For developers looking to understand how Snake-Pedia operates under the hood, here is a breakdown of the core mechanics:

### The Core Loop (`requestAnimationFrame`)
Snake-Pedia is driven by a `requestAnimationFrame` master loop. This ensures that the visual rendering is perfectly synced to the monitor's refresh rate (typically 60 frames per second or higher). However, moving a grid-based snake 60 times a second is far too fast. To solve this, the *game state updates* are decoupled from the *visual rendering updates*. 

A dynamically scaling interval logic (the `currentTick()`) checks logic states roughly every `X` milliseconds. As the user eats, that millisecond interval shrinks, driving the velocity up independently of the frame rate.

### Frame-Independent Grid Snap
Coordinates operate strictly on a rigid integer grid (e.g., `CELL_COUNT = 15`). While the visual HTML `<canvas>` size alters dynamically to fit the window (i.e., `800x800` on desktop vs. `300x300` on mobile), the physical game matrix remains mathematically identical. The canvas simply draws the cells scaled up or down.

Whenever a user inputs a directional command, it updates the snake's velocity matrix. Crucially, these commands queue linearly into an **input buffer** to prevent "dual-input suicide bugs" (e.g., pressing UP then LEFT extremely quickly before the next tick, which could otherwise cause the snake to reverse into itself).

### Visual Hue Processing (HSL Math)
The interactive rainbow body scales perfectly proportional to mathematical shifts. Instead of using static colors, the game calculates HSL (Hue, Saturation, Lightness) values on the fly:

```javascript
// Grab the continuous time from the browser
const timeHue = (performance.now() / 20) % 360;

// Shift the color backwards for every segment of the snake's body
const segHue = (timeHue - i * 12 + 360) % 360;
```
As the loop steps across the index `i` of the array containing the body coordinates, it actively subtracts degrees on the `HSL()` color wheel. This forms a perfect, continuous moving gradient.

---

## 🚀 Quick Start (For Local Development)

Because Snake-Pedia is built entirely without bundlers (like Webpack or Vite) or JavaScript frameworks (like React or Vue), getting started is blisteringly fast. Just clone the repository and serve the files locally via a basic HTTP server.

```bash
# 1. Clone the repository
git clone https://github.com/Nirmalya-C/Snake-Pedia.git

# 2. Enter the directory
cd Snake-Pedia

# 3. Serve up the index.html on a local open port
# (Using Python 3's built-in http server module as an example)
python -m http.server 8080
```
*(Now open up `http://localhost:8080` in your browser to see the game run!)*

---

## 📁 Project Structure

```text
.
├── assets/
│   ├── css/
│   │   └── style.css   # Contains the full styling dictionary and UI layout
│   └── js/
│       └── game.js     # Houses the Core Loop, Audio Context, and Game Logic
└── index.html          # Shell layout containing the responsive canvas & elements
```

---
*Created by [Nirmalya-C](https://github.com/Nirmalya-C). Happy Coding & Gaming!*