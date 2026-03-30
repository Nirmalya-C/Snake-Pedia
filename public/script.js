const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

// ── State ─────────────────────────────────────────────────────────────────

let playerSnake, playerVelocity, playerScore;
let aiSnake, aiVelocity, aiScore;
let food;
let gameRunning = false;
let loopTimeout = null;

// ── Score storage (backend when available, localStorage fallback) ──────────

/**
 * Detect whether the Express backend is reachable.
 * On GitHub Pages the backend is not available, so we fall back to localStorage.
 */
const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? ""          // same-origin when running via `node server.js`
    : null;       // no backend on GitHub Pages

async function fetchScores() {
    if (API_BASE !== null) {
        try {
            const res = await fetch(`${API_BASE}/api/scores`);
            if (res.ok) {
                const data = await res.json();
                return data.scores;
            }
        } catch (_) { /* fall through */ }
    }
    // localStorage fallback
    return JSON.parse(localStorage.getItem("snakePediaScores") || "[]");
}

async function saveScore(name, score) {
    if (API_BASE !== null) {
        try {
            const res = await fetch(`${API_BASE}/api/scores`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, score })
            });
            if (res.ok) {
                const data = await res.json();
                return data.scores;
            }
        } catch (_) { /* fall through */ }
    }
    // localStorage fallback
    const scores = JSON.parse(localStorage.getItem("snakePediaScores") || "[]");
    scores.push({ name, score });
    scores.sort((a, b) => b.score - a.score);
    const top10 = scores.slice(0, 10);
    localStorage.setItem("snakePediaScores", JSON.stringify(top10));
    return top10;
}

async function renderLeaderboard() {
    const scores = await fetchScores();
    const list = document.getElementById("score-list");
    if (!scores || scores.length === 0) {
        list.innerHTML = '<li class="empty-msg">No scores yet — play to be first!</li>';
        return;
    }
    list.innerHTML = scores
        .map(s => `<li>${escapeHtml(s.name)} — <strong>${s.score}</strong></li>`)
        .join("");
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// ── Game Initialisation ───────────────────────────────────────────────────

function initGame() {
    playerSnake = [{ x: 5, y: 15 }];
    playerVelocity = { x: 1, y: 0 };
    playerScore = 0;

    aiSnake = [{ x: 25, y: 15 }];
    aiVelocity = { x: -1, y: 0 };
    aiScore = 0;

    food = spawnFood();

    document.getElementById("player-score").innerText = "Player: 0";
    document.getElementById("ai-score").innerText = "AI: 0";

    gameRunning = true;
    if (loopTimeout) clearTimeout(loopTimeout);
    gameLoop();
}

// ── Main Loop ─────────────────────────────────────────────────────────────

function gameLoop() {
    if (!gameRunning) return;
    update();
    draw();
    loopTimeout = setTimeout(gameLoop, 100);
}

// ── Update ────────────────────────────────────────────────────────────────

function update() {
    // ── Player movement ──
    const playerHead = {
        x: (playerSnake[0].x + playerVelocity.x + tileCount) % tileCount,
        y: (playerSnake[0].y + playerVelocity.y + tileCount) % tileCount
    };

    // Collision: player hits own body
    if (hitsBody(playerHead, playerSnake)) {
        endGame("You ran into yourself! AI wins! 🤖");
        return;
    }
    // Collision: player hits AI body
    if (hitsBody(playerHead, aiSnake)) {
        endGame("You ran into the AI! AI wins! 🤖");
        return;
    }

    playerSnake.unshift(playerHead);
    if (playerHead.x === food.x && playerHead.y === food.y) {
        playerScore++;
        document.getElementById("player-score").innerText = `Player: ${playerScore}`;
        food = spawnFood();
    } else {
        playerSnake.pop();
    }

    // ── AI movement (moves toward food, avoids its own body) ──
    aiVelocity = aiChooseDirection();
    const aiHead = {
        x: (aiSnake[0].x + aiVelocity.x + tileCount) % tileCount,
        y: (aiSnake[0].y + aiVelocity.y + tileCount) % tileCount
    };

    // Collision: AI hits player body
    if (hitsBody(aiHead, playerSnake)) {
        endGame("AI ran into you! You win! 🎉");
        return;
    }
    // Collision: AI hits own body
    if (hitsBody(aiHead, aiSnake)) {
        endGame("AI ran into itself! You win! 🎉");
        return;
    }

    aiSnake.unshift(aiHead);
    if (aiHead.x === food.x && aiHead.y === food.y) {
        aiScore++;
        document.getElementById("ai-score").innerText = `AI: ${aiScore}`;
        food = spawnFood();
    } else {
        aiSnake.pop();
    }
}

function hitsBody(head, snake) {
    // skip index 0 (the current head before it moves)
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) return true;
    }
    return false;
}

function aiChooseDirection() {
    const head = aiSnake[0];
    const candidates = [
        { x: 1, y: 0 }, { x: -1, y: 0 },
        { x: 0, y: 1 }, { x: 0, y: -1 }
    ];

    // Filter out reverse direction and directions that immediately hit a body
    const safe = candidates.filter(v => {
        if (v.x === -aiVelocity.x && v.y === -aiVelocity.y) return false; // reverse
        const next = {
            x: (head.x + v.x + tileCount) % tileCount,
            y: (head.y + v.y + tileCount) % tileCount
        };
        return !hitsBody(next, aiSnake) && !hitsBody(next, playerSnake);
    });

    if (safe.length === 0) return aiVelocity; // no safe move, keep going

    // Choose the safe direction that moves closer to food
    safe.sort((a, b) => {
        const na = { x: (head.x + a.x + tileCount) % tileCount, y: (head.y + a.y + tileCount) % tileCount };
        const nb = { x: (head.x + b.x + tileCount) % tileCount, y: (head.y + b.y + tileCount) % tileCount };
        return dist(na, food) - dist(nb, food);
    });
    return safe[0];
}

function dist(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// ── Draw ──────────────────────────────────────────────────────────────────

function draw() {
    ctx.fillStyle = "#2a2a40";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Food
    ctx.fillStyle = "#ff4757";
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

    // Player Snake (Green)
    ctx.fillStyle = "#2ed573";
    playerSnake.forEach(seg => ctx.fillRect(seg.x * gridSize, seg.y * gridSize, gridSize - 2, gridSize - 2));

    // AI Snake (Orange)
    ctx.fillStyle = "#ffa502";
    aiSnake.forEach(seg => ctx.fillRect(seg.x * gridSize, seg.y * gridSize, gridSize - 2, gridSize - 2));
}

// ── Food ──────────────────────────────────────────────────────────────────

function spawnFood() {
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (
        (playerSnake && playerSnake.some(s => s.x === pos.x && s.y === pos.y)) ||
        (aiSnake && aiSnake.some(s => s.x === pos.x && s.y === pos.y))
    );
    return pos;
}

// ── Game Over ─────────────────────────────────────────────────────────────

function endGame(message) {
    gameRunning = false;
    clearTimeout(loopTimeout);

    document.getElementById("game-over-title").innerText = "Game Over";
    document.getElementById("game-over-msg").innerText =
        `${message}  |  Your score: ${playerScore}`;
    document.getElementById("player-name").value = "";
    document.getElementById("game-over-modal").classList.remove("hidden");
}

document.getElementById("submit-score-btn").addEventListener("click", async () => {
    const nameInput = document.getElementById("player-name");
    const name = nameInput.value.trim();
    if (!name) {
        nameInput.focus();
        return;
    }
    const btn = document.getElementById("submit-score-btn");
    btn.disabled = true;
    btn.innerText = "Saving…";
    await saveScore(name, playerScore);
    await renderLeaderboard();
    btn.innerText = "Saved ✓";
});

document.getElementById("restart-btn").addEventListener("click", () => {
    document.getElementById("game-over-modal").classList.add("hidden");
    initGame();
});

// ── Controls ──────────────────────────────────────────────────────────────

window.addEventListener("keydown", e => {
    switch (e.key) {
        case "ArrowUp":    case "w": if (playerVelocity.y === 0) playerVelocity = { x: 0, y: -1 }; break;
        case "ArrowDown":  case "s": if (playerVelocity.y === 0) playerVelocity = { x: 0, y:  1 }; break;
        case "ArrowLeft":  case "a": if (playerVelocity.x === 0) playerVelocity = { x: -1, y: 0 }; break;
        case "ArrowRight": case "d": if (playerVelocity.x === 0) playerVelocity = { x:  1, y: 0 }; break;
    }
});

// ── Boot ──────────────────────────────────────────────────────────────────

renderLeaderboard();
initGame();

