const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 20;
const TICK_MS = 100;
const TILE_COUNT = canvas.width / GRID_SIZE;

const COLORS = {
    board: '#111827',
    food: '#9ef01a',
    player: '#7dd3fc',
    ai: '#fbbf24'
};

const scoreNodes = {
    player: document.getElementById('player-score'),
    ai: document.getElementById('ai-score')
};

const state = {
    player: { snake: [{ x: 5, y: 15 }], velocity: { x: 0, y: -1 }, score: 0 },
    ai: { snake: [{ x: 25, y: 15 }], velocity: { x: 0, y: -1 }, score: 0 },
    food: { x: 15, y: 15 }
};

const wrapCoord = value => (value + TILE_COUNT) % TILE_COUNT;

function spawnFood(occupiedSegments) {
    let spot;
    do {
        spot = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };
    } while (occupiedSegments.some(segment => segment.x === spot.x && segment.y === spot.y));
    state.food = spot;
}

function moveSnake(entity, velocity) {
    const nextHead = {
        x: wrapCoord(entity.snake[0].x + velocity.x),
        y: wrapCoord(entity.snake[0].y + velocity.y)
    };
    entity.snake.unshift(nextHead);
    const ateFood = nextHead.x === state.food.x && nextHead.y === state.food.y;
    if (!ateFood) {
        entity.snake.pop();
    }
    return ateFood;
}

function planAiMove() {
    const head = state.ai.snake[0];
    const deltaX = state.food.x - head.x;
    const deltaY = state.food.y - head.y;
    if (Math.abs(deltaX) >= Math.abs(deltaY)) {
        state.ai.velocity = { x: Math.sign(deltaX), y: 0 };
    } else {
        state.ai.velocity = { x: 0, y: Math.sign(deltaY) };
    }
}

function updateScores() {
    scoreNodes.player.textContent = state.player.score;
    scoreNodes.ai.textContent = state.ai.score;
}

function update() {
    const playerAte = moveSnake(state.player, state.player.velocity);

    planAiMove();
    const aiAte = moveSnake(state.ai, state.ai.velocity);

    if (playerAte || aiAte) {
        if (playerAte) state.player.score += 1;
        if (aiAte) state.ai.score += 1;
        spawnFood([...state.player.snake, ...state.ai.snake]);
        updateScores();
    }
}

function draw() {
    ctx.fillStyle = COLORS.board;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = COLORS.food;
    ctx.fillRect(state.food.x * GRID_SIZE, state.food.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);

    ctx.fillStyle = COLORS.player;
    state.player.snake.forEach(segment => {
        ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    });

    ctx.fillStyle = COLORS.ai;
    state.ai.snake.forEach(segment => {
        ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    });
}

function handleKeydown(event) {
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
            if (state.player.velocity.y === 0) state.player.velocity = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
        case 's':
            if (state.player.velocity.y === 0) state.player.velocity = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
        case 'a':
            if (state.player.velocity.x === 0) state.player.velocity = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
        case 'd':
            if (state.player.velocity.x === 0) state.player.velocity = { x: 1, y: 0 };
            break;
        default:
            break;
    }
}

function gameLoop() {
    update();
    draw();
    setTimeout(gameLoop, TICK_MS);
}

function init() {
    updateScores();
    spawnFood([...state.player.snake, ...state.ai.snake]);
    window.addEventListener('keydown', handleKeydown);
    gameLoop();
}

init();
