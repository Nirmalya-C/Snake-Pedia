# Snake-Pedia

Player vs AI snake duel built as a lightweight static web app.

## Quick start
Open `index.html` directly in your browser or serve the repo locally:

```bash
python -m http.server 8080
# visit http://localhost:8080
```

## How to play
- Player moves with `WASD` or Arrow keys.
- Both snakes wrap at the board edges.
- First to grab food grows their score.

## Project structure
```
.
├── assets
│   ├── css
│   │   └── style.css   # Layout, typography, theming
│   └── js
│       └── game.js     # Game loop, rendering, input handling
└── index.html          # Entry point and UI shell
```

## Development notes
- Pure HTML/CSS/JS with no build step.
- Keep static assets inside `assets/` to simplify deployment (e.g., GitHub Pages).
