# Snake-Pedia 🐍

A browser-based Snake game — **Player vs AI** — with a persistent leaderboard.

## Features

- Classic snake gameplay on a 30×30 grid
- AI opponent that navigates toward food while avoiding bodies
- Collision detection — hit your own body or the AI's body to end the game
- **Leaderboard** backed by a JSON flat-file database (local) or `localStorage` (GitHub Pages)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML5 / CSS3 / JavaScript (Canvas API) |
| Backend | Node.js + Express |
| Database | JSON flat-file (`scores.json`) |
| Deployment | GitHub Pages (static) |

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) 18+

### Install & Run

```bash
npm install
npm start
```

Open <http://localhost:3000> in your browser.

The Express server:
- Serves the frontend at `/`
- Exposes a REST API at `/api/scores` for reading and saving high scores
- Stores scores in a local `scores.json` flat-file database

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/scores` | Returns the top 10 scores |
| `POST` | `/api/scores` | Saves a new score `{ name, score }` and returns the updated top 10 |

## Deployment (GitHub Pages)

The workflow in `.github/workflows/deploy.yml` automatically deploys the frontend to GitHub Pages whenever code is pushed to `main`.

> **Note:** GitHub Pages is a static host — the Node.js backend cannot run there.  
> When the game is opened from GitHub Pages it automatically uses `localStorage` to store scores client-side.

To enable GitHub Pages in your repository:
1. Go to **Settings → Pages**
2. Set the **Source** to **GitHub Actions**

The live site will be available at `https://<username>.github.io/Snake-Pedia/`.

## Controls

| Key | Action |
|-----|--------|
| `↑` / `W` | Move up |
| `↓` / `S` | Move down |
| `←` / `A` | Move left |
| `→` / `D` | Move right |

## License

[Apache 2.0](LICENSE)
