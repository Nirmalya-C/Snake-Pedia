# Snake-Pedia 🐍

[![Play Game](https://img.shields.io/badge/Play-Live_Demo-success?style=for-the-badge)](https://nirmalya-c.github.io/Snake-Pedia/)

A sleek, classic single-player snake game built as a lightweight static web app. Features auto-increasing difficulty, persistent high scores, and retro sound effects!

## Play Live!
**🎮 [Click here to play Snake-Pedia](https://nirmalya-c.github.io/Snake-Pedia/)**

## Features
- **Auto-Increasing Speed:** Game starts at a chill 0.2x speed but ramps up by 0.1x for every apple eaten!
- **Persistent High-Score:** Automatically saves your best score locally so you can compete against yourself.
- **Retro Audio:** Powered entirely by the native Web Audio API—enjoy synthetic 'blips' and 'booms' without loading any external MP3s.
- **Pause & Resume:** Easily pause the game using the `P` or `Escape` keys, or the on-screen pause button. 
- **Wrap-around Board:** Crashing into the walls won't kill you—you'll just wrap around to the other side! Stay alive until you bite your own tail.

## Quick start (Local Development)
Open `index.html` directly in your browser, or serve the repo locally:

```bash
python -m http.server 8080
# visit http://localhost:8080
```

## How to play
- Move your snake with `WASD`, Arrow keys, or the on-screen swipe/D-pad controls (mobile).
- Press `Space` to start/resume.
- Press `P` or `Esc` to Pause.
- Eat apples to grow longer and move faster.
- Avoid hitting your own snake body!

## Project structure
```
.
├── assets
│   ├── css
│   │   └── style.css   # Layout, typography, theming
│   └── js
│       └── game.js     # Game loop, audio synth, rendering, input handling
└── index.html          # Entry point and UI shell
```

## Development notes
- Pure HTML/CSS/JS with no build steps or bundlers.
- All styles and scripts use Vanilla JS and CSS variables.
