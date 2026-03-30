const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Player Snake
let playerSnake = [{ x: 5, y: 15 }];
let playerVelocity = { x: 0, y: -1 };
let playerScore = 0;

// AI Snake
let aiSnake = [{ x: 25, y: 15 }];
let aiVelocity = { x: 0, y: -1 };
let aiScore = 0;

// Food
let food = { x: 15, y: 15 };

function gameLoop() {
    update();
    draw();
    setTimeout(gameLoop, 100); // 10 FPS
}

function update() {
    // Move Player
    const playerHead = { x: playerSnake[0].x + playerVelocity.x, y: playerSnake[0].y + playerVelocity.y };
    playerSnake.unshift(playerHead);
    if (playerHead.x === food.x && playerHead.y === food.y) {
        playerScore++;
        document.getElementById('player-score').innerText = `Player: ${playerScore}`;
        spawnFood();
    } else {
        playerSnake.pop();
    }

    // Very Basic AI logic (Moves towards food)
    if (food.x > aiSnake[0].x) aiVelocity = { x: 1, y: 0 };
    else if (food.x < aiSnake[0].x) aiVelocity = { x: -1, y: 0 };
    else if (food.y > aiSnake[0].y) aiVelocity = { x: 0, y: 1 };
    else if (food.y < aiSnake[0].y) aiVelocity = { x: 0, y: -1 };

    const aiHead = { x: aiSnake[0].x + aiVelocity.x, y: aiSnake[0].y + aiVelocity.y };
    aiSnake.unshift(aiHead);
    if (aiHead.x === food.x && aiHead.y === food.y) {
        aiScore++;
        document.getElementById('ai-score').innerText = `AI: ${aiScore}`;
        spawnFood();
    } else {
        aiSnake.pop();
    }

    // Boundary Wrap (Optional: change to collision/death later)
    [playerSnake, aiSnake].forEach(snake => {
        if (snake[0].x < 0) snake[0].x = tileCount - 1;
        if (snake[0].x >= tileCount) snake[0].x = 0;
        if (snake[0].y < 0) snake[0].y = tileCount - 1;
        if (snake[0].y >= tileCount) snake[0].y = 0;
    });
}

function draw() {
    // Clear canvas
    ctx.fillStyle = "#2a2a40";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Food
    ctx.fillStyle = "#ff4757";
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

    // Draw Player Snake (Green)
    ctx.fillStyle = "#2ed573";
    playerSnake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });

    // Draw AI Snake (Orange)
    ctx.fillStyle = "#ffa502";
    aiSnake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
}

// Controls
window.addEventListener("keydown", e => {
    switch (e.key) {
        case "ArrowUp": case "w": if (playerVelocity.y === 0) playerVelocity = { x: 0, y: -1 }; break;
        case "ArrowDown": case "s": if (playerVelocity.y === 0) playerVelocity = { x: 0, y: 1 }; break;
        case "ArrowLeft": case "a": if (playerVelocity.x === 0) playerVelocity = { x: -1, y: 0 }; break;
        case "ArrowRight": case "d": if (playerVelocity.x === 0) playerVelocity = { x: 1, y: 0 }; break;
    }
});

gameLoop();
