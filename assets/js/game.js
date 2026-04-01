/* ============================================================
   Snake-Pedia  —  Single-Player Game Engine
   ============================================================ */
(() => {
    'use strict';

    /* --------------------------------------------------------
       Constants
       -------------------------------------------------------- */
    const canvas = document.getElementById('gameCanvas');
    const ctx    = canvas.getContext('2d');

    const CELL_COUNT    = 20;           // grid cells per axis
    const BASE_TICK     = 130;          // ms per step at 1.0× speed
    const SPEED_BUMP    = 0.1;          // speed multiplier increase per food
    const START_SPEED   = 0.2;          // base starting speed
    const MAX_SPEED     = 5.0;          // cap so the game is still playable
    const RESTART_DELAY = 2800;         // ms before auto-restart after death

    /* Dynamic sizing — computed once + on resize */
    let GRID, COLS, ROWS, canvasSize;

    function resizeCanvas() {
        const wrap   = canvas.parentElement;
        const style  = getComputedStyle(wrap);
        const padX   = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        const padY   = parseFloat(style.paddingTop)  + parseFloat(style.paddingBottom);
        const maxW   = wrap.clientWidth  - padX;
        const maxH   = wrap.clientHeight - padY;
        const avail  = Math.min(maxW, maxH, 600);

        const cellPx = Math.floor(avail / CELL_COUNT);
        canvasSize   = cellPx * CELL_COUNT;
        GRID = cellPx;
        COLS = CELL_COUNT;
        ROWS = CELL_COUNT;

        const dpr = window.devicePixelRatio || 1;
        canvas.width  = canvasSize * dpr;
        canvas.height = canvasSize * dpr;
        canvas.style.width  = canvasSize + 'px';
        canvas.style.height = canvasSize + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /* --------------------------------------------------------
       Color palette
       -------------------------------------------------------- */
    const COLORS = {
        board:      '#0d1117',
        grid:       'rgba(255, 255, 255, 0.08)',
        snakeHead:  '#34d399',
        snakeBody1: '#06b6d4',
        snakeBody2: '#34d399',
        snakeGlow:  'rgba(52, 211, 153, 0.22)',
        eyeWhite:   '#fff',
        eyePupil:   '#111',
        foodBody:   '#ef4444',
        foodLeaf:   '#22c55e',
        foodGlow:   'rgba(239, 68, 68, 0.20)',
        foodShine:  'rgba(255, 255, 255, 0.45)',
        death:      '#ef4444',
    };

    /* --------------------------------------------------------
       DOM refs
       -------------------------------------------------------- */
    const $pScore     = document.getElementById('player-score');
    const $hiScore    = document.getElementById('hi-score');
    const $overlay    = document.getElementById('overlay');
    const $oTitle     = document.getElementById('overlay-title');
    const $oMsg       = document.getElementById('overlay-msg');
    const $oBtn       = document.getElementById('overlay-btn');
    const $speedFill  = document.getElementById('speed-fill');
    const $speedValue = document.getElementById('speed-value');
    const $pauseBtn   = document.getElementById('pause-btn');

    /* --------------------------------------------------------
       Persistent high score
       -------------------------------------------------------- */
    const LS_KEY = 'snakepedia_hiscore';
    let hiScore  = parseInt(localStorage.getItem(LS_KEY) || '0', 10);
    $hiScore.textContent = hiScore;

    function saveHiScore(val) {
        if (val > hiScore) {
            hiScore = val;
            localStorage.setItem(LS_KEY, String(hiScore));
            $hiScore.textContent = hiScore;
            $hiScore.classList.remove('new-best');
            void $hiScore.offsetWidth;
            $hiScore.classList.add('new-best');
        }
    }

    /* --------------------------------------------------------
       State
       -------------------------------------------------------- */
    let phase       = 'idle';       // idle | playing | paused | gameover
    let lastTick    = 0;
    let rafId       = null;
    let foodPulse   = 0;
    let foodBob     = 0;
    let particles   = [];
    let speedMul    = START_SPEED;  // current speed multiplier
    let restartTimer = null;

    const snake = {
        body: [],
        vel:  { x: 1, y: 0 },
        next: null,
        score: 0,
        alive: true,
    };

    let food = null;

    function resetSnake() {
        const mid = Math.floor(CELL_COUNT / 2);
        snake.body  = [
            { x: mid,     y: mid },
            { x: mid - 1, y: mid },
            { x: mid - 2, y: mid },
        ];
        snake.vel   = { x: 1, y: 0 };
        snake.next  = null;
        snake.score = 0;
        snake.alive = true;
        speedMul    = START_SPEED;
        particles   = [];
        food        = null;
        spawnFood();
        syncScore();
        syncSpeed();
    }

    /* --------------------------------------------------------
       Helpers
       -------------------------------------------------------- */
    const wrap = v => ((v % CELL_COUNT) + CELL_COUNT) % CELL_COUNT;
    const key  = (x, y) => (x << 8) | y;

    function spawnFood() {
        const taken = new Set();
        for (const s of snake.body) taken.add(key(s.x, s.y));

        let attempts = 0;
        let spot;
        do {
            spot = {
                x: Math.floor(Math.random() * COLS),
                y: Math.floor(Math.random() * ROWS),
            };
            if (++attempts > 2000) return;
        } while (taken.has(key(spot.x, spot.y)));
        food = spot;
    }

    /* --------------------------------------------------------
       Audio System (Web Audio API for retro synth sounds)
       -------------------------------------------------------- */
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playTone(freq, type, duration, vol = 0.1, slideFreq = null) {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        if (slideFreq) {
            osc.frequency.exponentialRampToValueAtTime(slideFreq, audioCtx.currentTime + duration);
        }
        
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }

    function playEatSound() {
        // Quick high-pitched "blip"
        playTone(600, 'square', 0.1, 0.05, 800);
        setTimeout(() => playTone(800, 'square', 0.1, 0.05, 1200), 50);
    }

    function playDeathSound() {
        // Low downward descending "boom"
        playTone(200, 'sawtooth', 0.5, 0.2, 30);
        // Noise equivalent by rapid frequency changes
        setTimeout(() => playTone(150, 'square', 0.4, 0.15, 20), 100);
    }

    /* --------------------------------------------------------
       Tick interval (speed-dependent)
       -------------------------------------------------------- */
    function currentTick() {
        return Math.max(BASE_TICK / speedMul, 35);   // floor at 35ms
    }

    /* --------------------------------------------------------
       Movement
       -------------------------------------------------------- */
    function addHead() {
        const v = snake.vel;
        const h = snake.body[0];
        const n = { x: wrap(h.x + v.x), y: wrap(h.y + v.y) };
        snake.body.unshift(n);
        return n;
    }

    /* --------------------------------------------------------
       Collision: self only
       -------------------------------------------------------- */
    function checkSelfCollision() {
        const h = snake.body[0];
        for (let i = 1; i < snake.body.length; i++) {
            if (snake.body[i].x === h.x && snake.body[i].y === h.y) return true;
        }
        return false;
    }

    /* --------------------------------------------------------
       Particles
       -------------------------------------------------------- */
    function emitParticles(gx, gy, color, n = 10) {
        for (let i = 0; i < n; i++) {
            const a = (Math.PI * 2 / n) * i + Math.random() * 0.4;
            particles.push({
                x: gx * GRID + GRID / 2,
                y: gy * GRID + GRID / 2,
                vx: Math.cos(a) * (1.4 + Math.random() * 2.2),
                vy: Math.sin(a) * (1.4 + Math.random() * 2.2),
                life: 1,
                color,
                r: 2 + Math.random() * 3,
            });
        }
    }

    /* Star burst for eating — green sparkles */
    function emitEatSparkle(gx, gy) {
        const colors = ['#34d399', '#6ee7b7', '#a7f3d0', '#fde68a', '#fbbf24'];
        for (let i = 0; i < 14; i++) {
            const a = Math.random() * Math.PI * 2;
            const speed = 1.2 + Math.random() * 2.8;
            particles.push({
                x: gx * GRID + GRID / 2,
                y: gy * GRID + GRID / 2,
                vx: Math.cos(a) * speed,
                vy: Math.sin(a) * speed,
                life: 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                r: 1.5 + Math.random() * 3,
            });
        }
    }

    function tickParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.life -= 0.026;
            p.r    *= 0.975;
            if (p.life <= 0) particles.splice(i, 1);
        }
    }

    /* --------------------------------------------------------
       Core update
       -------------------------------------------------------- */
    function update() {
        // Apply queued input
        if (snake.next) {
            snake.vel  = snake.next;
            snake.next = null;
        }

        const newHead = addHead();

        // Check food
        const ate = food && newHead.x === food.x && newHead.y === food.y;

        if (ate) {
            snake.score++;
            playEatSound();
            emitEatSparkle(food.x, food.y);
            spawnFood();
            popScore($pScore);

            // Increase speed
            speedMul = Math.min(speedMul + SPEED_BUMP, MAX_SPEED);
            syncSpeed();
        } else {
            snake.body.pop();
        }

        // Self-collision
        if (checkSelfCollision()) {
            snake.alive = false;
            playDeathSound();
            emitParticles(newHead.x, newHead.y, COLORS.death, 22);

            // Screen shake
            canvas.classList.remove('shake');
            void canvas.offsetWidth;
            canvas.classList.add('shake');

            endGame();
            return;
        }

        syncScore();
    }

    /* --------------------------------------------------------
       Scores & Speed UI
       -------------------------------------------------------- */
    function syncScore() {
        $pScore.textContent = snake.score;
    }

    function popScore(el) {
        el.classList.remove('pop');
        void el.offsetWidth;
        el.classList.add('pop');
        setTimeout(() => el.classList.remove('pop'), 250);
    }

    function syncSpeed() {
        const pct = Math.min(((speedMul - 1) / (MAX_SPEED - 1)) * 100, 100);
        $speedFill.style.width = Math.max(pct, 4) + '%';
        $speedValue.textContent = speedMul.toFixed(1) + '×';

        // Color tiers
        $speedFill.classList.remove('fast', 'extreme');
        $speedValue.classList.remove('fast', 'extreme');
        if (speedMul >= 3.0) {
            $speedFill.classList.add('extreme');
            $speedValue.classList.add('extreme');
        } else if (speedMul >= 2.0) {
            $speedFill.classList.add('fast');
            $speedValue.classList.add('fast');
        }
    }

    /* --------------------------------------------------------
       Drawing — Board
       -------------------------------------------------------- */
    function drawGrid() {
        ctx.strokeStyle = COLORS.grid;
        ctx.lineWidth   = 1.0;
        for (let c = 1; c < COLS; c++) {
            ctx.beginPath();
            ctx.moveTo(c * GRID, 0);
            ctx.lineTo(c * GRID, canvasSize);
            ctx.stroke();
        }
        for (let r = 1; r < ROWS; r++) {
            ctx.beginPath();
            ctx.moveTo(0, r * GRID);
            ctx.lineTo(canvasSize, r * GRID);
            ctx.stroke();
        }
    }

    /* --------------------------------------------------------
       Drawing — Realistic Apple Food
       -------------------------------------------------------- */
    function drawFood() {
        if (!food) return;

        const cx    = food.x * GRID + GRID / 2;
        const cy    = food.y * GRID + GRID / 2;
        
        // Exact same footprint as the snake head
        const radius = (GRID - 1) / 2;

        // Glow
        const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, GRID * 1.6);
        g.addColorStop(0, COLORS.foodGlow);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(cx - GRID * 2, cy - GRID * 2, GRID * 4, GRID * 4);

        // Apple body (circle with slight gradient for 3D effect)
        const appleGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
        appleGrad.addColorStop(0, '#ff6b6b');
        appleGrad.addColorStop(0.6, '#ef4444');
        appleGrad.addColorStop(1, '#b91c1c');
        ctx.fillStyle = appleGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Shine/highlight
        ctx.fillStyle = COLORS.foodShine;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.ellipse(cx - radius * 0.25, cy - radius * 0.3, radius * 0.4, radius * 0.25, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Stem
        ctx.strokeStyle = '#854d0e';
        ctx.lineWidth   = 2;
        ctx.lineCap     = 'round';
        ctx.beginPath();
        ctx.moveTo(cx, cy - radius + 1);
        ctx.quadraticCurveTo(cx + 2, cy - radius - 4, cx + 1, cy - radius - 6);
        ctx.stroke();

        // Leaf
        ctx.fillStyle = COLORS.foodLeaf;
        ctx.beginPath();
        ctx.ellipse(cx + 3, cy - radius - 3, 4, 2.2, 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    /* --------------------------------------------------------
       Drawing — Snake (gradient body, eyes, tongue)
       -------------------------------------------------------- */
    function drawSnake() {
        const body = snake.body;
        const len  = body.length;
        if (len === 0) return;

        // Draw body segments from tail to head (so head renders on top)
        for (let i = len - 1; i >= 0; i--) {
            const seg = body[i];
            const t   = 1 - i / Math.max(len, 1);   // 1 at head, 0 at tail
            const isHead = i === 0;

            // Interpolate between body colors
            const r1 = 6, g1 = 182, b1 = 212;   // cyan
            const r2 = 52, g2 = 211, b2 = 153;   // emerald
            const r = Math.round(r1 + (r2 - r1) * t);
            const g = Math.round(g1 + (g2 - g1) * t);
            const b = Math.round(b1 + (b2 - b1) * t);

            ctx.globalAlpha = 0.4 + t * 0.6;
            ctx.fillStyle   = isHead ? COLORS.snakeHead : `rgb(${r},${g},${b})`;

            const pad = isHead ? 0.5 : 1.5;
            const cornerR = isHead ? 7 : 4;
            ctx.beginPath();
            ctx.roundRect(
                seg.x * GRID + pad,
                seg.y * GRID + pad,
                GRID - pad * 2,
                GRID - pad * 2,
                cornerR
            );
            ctx.fill();

            // Subtle scale pattern on body (not head)
            if (!isHead && i % 2 === 0) {
                ctx.globalAlpha = 0.08;
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(
                    seg.x * GRID + GRID / 2,
                    seg.y * GRID + GRID / 2,
                    GRID / 5,
                    0, Math.PI * 2
                );
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;

        // --- Head details ---
        const h  = body[0];
        const v  = snake.vel;
        const cx = h.x * GRID + GRID / 2;
        const cy = h.y * GRID + GRID / 2;

        // Head glow
        const gl = ctx.createRadialGradient(cx, cy, 2, cx, cy, GRID * 1.1);
        gl.addColorStop(0, COLORS.snakeGlow);
        gl.addColorStop(1, 'transparent');
        ctx.fillStyle = gl;
        ctx.fillRect(cx - GRID * 1.2, cy - GRID * 1.2, GRID * 2.4, GRID * 2.4);

        if (!snake.alive) return;

        // Tongue (flickers)
        const tonguePhase = (performance.now() / 200) % 1;
        if (tonguePhase < 0.5) {
            const tongueLen = 6 + Math.sin(tonguePhase * Math.PI * 2) * 2;
            const tx = cx + v.x * (GRID / 2 + tongueLen);
            const ty = cy + v.y * (GRID / 2 + tongueLen);
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth   = 1.5;
            ctx.lineCap     = 'round';
            ctx.beginPath();
            ctx.moveTo(cx + v.x * GRID / 2.2, cy + v.y * GRID / 2.2);
            ctx.lineTo(tx, ty);
            ctx.stroke();

            // Forked tip
            const forkLen = 3;
            const perpX = -v.y;
            const perpY = v.x;
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx + v.x * forkLen + perpX * 2, ty + v.y * forkLen + perpY * 2);
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx + v.x * forkLen - perpX * 2, ty + v.y * forkLen - perpY * 2);
            ctx.stroke();
        }

        // Eyes
        let e1, e2;
        const eyeOff = GRID / 5;
        if (v.x === 1)       { e1 = { x: cx + 4, y: cy - eyeOff }; e2 = { x: cx + 4, y: cy + eyeOff }; }
        else if (v.x === -1) { e1 = { x: cx - 4, y: cy - eyeOff }; e2 = { x: cx - 4, y: cy + eyeOff }; }
        else if (v.y === -1) { e1 = { x: cx - eyeOff, y: cy - 4 }; e2 = { x: cx + eyeOff, y: cy - 4 }; }
        else                 { e1 = { x: cx - eyeOff, y: cy + 4 }; e2 = { x: cx + eyeOff, y: cy + 4 }; }

        // White
        ctx.fillStyle = COLORS.eyeWhite;
        ctx.beginPath(); ctx.arc(e1.x, e1.y, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(e2.x, e2.y, 3, 0, Math.PI * 2); ctx.fill();

        // Pupil — looks toward food
        let lookX = v.x * 0.8, lookY = v.y * 0.8;
        if (food) {
            const fdx = food.x * GRID + GRID / 2 - cx;
            const fdy = food.y * GRID + GRID / 2 - cy;
            const fDist = Math.sqrt(fdx * fdx + fdy * fdy) || 1;
            lookX = (fdx / fDist) * 1.2;
            lookY = (fdy / fDist) * 1.2;
        }

        ctx.fillStyle = COLORS.eyePupil;
        ctx.beginPath(); ctx.arc(e1.x + lookX, e1.y + lookY, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(e2.x + lookX, e2.y + lookY, 1.5, 0, Math.PI * 2); ctx.fill();
    }

    /* --------------------------------------------------------
       Drawing — Particles
       -------------------------------------------------------- */
    function drawParticles() {
        for (const p of particles) {
            ctx.globalAlpha = p.life;
            ctx.fillStyle   = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    /* --------------------------------------------------------
       Master draw
       -------------------------------------------------------- */
    function draw() {
        ctx.fillStyle = COLORS.board;
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        drawGrid();
        drawFood();
        drawSnake();
        drawParticles();
    }

    /* --------------------------------------------------------
       Input
       -------------------------------------------------------- */
    function handleKey(e) {
        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
            e.preventDefault();
            if (phase === 'playing' || phase === 'paused') {
                togglePause();
            }
            return;
        }

        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            if (phase === 'idle' || phase === 'gameover') startGame();
            else if (phase === 'paused') togglePause();
            return;
        }

        if (phase !== 'playing') return;

        const v = snake.vel;
        let n   = null;

        switch (e.key) {
            case 'ArrowUp':    case 'w': case 'W': if (v.y !==  1) n = { x:  0, y: -1 }; break;
            case 'ArrowDown':  case 's': case 'S': if (v.y !== -1) n = { x:  0, y:  1 }; break;
            case 'ArrowLeft':  case 'a': case 'A': if (v.x !==  1) n = { x: -1, y:  0 }; break;
            case 'ArrowRight': case 'd': case 'D': if (v.x !== -1) n = { x:  1, y:  0 }; break;
        }

        if (n) {
            e.preventDefault();
            snake.next = n;
        }
    }

    /* Mobile d-pad */
    function initDpad() {
        const dpad = document.getElementById('dpad');
        if (!dpad) return;

        const map = {
            up:    { x:  0, y: -1, block: () => snake.vel.y ===  1 },
            down:  { x:  0, y:  1, block: () => snake.vel.y === -1 },
            left:  { x: -1, y:  0, block: () => snake.vel.x ===  1 },
            right: { x:  1, y:  0, block: () => snake.vel.x === -1 },
        };

        dpad.addEventListener('pointerdown', e => {
            const btn = e.target.closest('[data-dir]');
            if (!btn) return;
            e.preventDefault();
            if (phase !== 'playing') { startGame(); return; }
            const d = map[btn.dataset.dir];
            if (d && !d.block()) {
                snake.next = { x: d.x, y: d.y };
                if (navigator.vibrate) navigator.vibrate(12);
            }
        });
    }

    /* Touch swipe */
    let touchStart = null;
    canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        const t = e.touches[0];
        touchStart = { x: t.clientX, y: t.clientY };
    }, { passive: false });

    canvas.addEventListener('touchmove', e => {
        if (!touchStart || phase !== 'playing') return;
        e.preventDefault();
        const t  = e.touches[0];
        const dx = t.clientX - touchStart.x;
        const dy = t.clientY - touchStart.y;

        const MIN_SWIPE = 22;
        if (Math.abs(dx) < MIN_SWIPE && Math.abs(dy) < MIN_SWIPE) return;

        const v = snake.vel;
        let n = null;
        if (Math.abs(dx) > Math.abs(dy)) {
            n = dx > 0 ? (v.x !== -1 ? { x: 1, y: 0 } : null) : (v.x !== 1 ? { x: -1, y: 0 } : null);
        } else {
            n = dy > 0 ? (v.y !== -1 ? { x: 0, y: 1 } : null) : (v.y !== 1 ? { x: 0, y: -1 } : null);
        }
        if (n) {
            snake.next = n;
            touchStart = { x: t.clientX, y: t.clientY };
            if (navigator.vibrate) navigator.vibrate(8);
        }
    }, { passive: false });

    canvas.addEventListener('touchend', () => { touchStart = null; }, { passive: true });

    /* --------------------------------------------------------
       Game flow
       -------------------------------------------------------- */
    function showOverlay(title, msg, btn) {
        $oTitle.textContent = title;
        $oMsg.textContent   = msg;
        $oBtn.textContent   = btn;
        $overlay.classList.add('visible');
    }

    function hideOverlay() { $overlay.classList.remove('visible'); }

    function togglePause() {
        if (phase === 'playing') {
            phase = 'paused';
            showOverlay('Paused', 'Press Resume or space to continue', 'Resume');
        } else if (phase === 'paused') {
            phase = 'playing';
            hideOverlay();
            lastTick = performance.now();
        }
    }

    function startGame() {
        // Initialize Audio Context on first user interaction
        initAudio();
        
        if (restartTimer) { clearTimeout(restartTimer); restartTimer = null; }
        phase = 'playing';
        hideOverlay();
        resetSnake();
        lastTick = performance.now();
        if (rafId) cancelAnimationFrame(rafId);
        loop(performance.now());
    }

    function endGame() {
        phase = 'gameover';
        saveHiScore(snake.score);

        const isNewBest = snake.score > 0 && snake.score >= hiScore;
        const title = isNewBest ? '🏆 New High Score!' : 'Game Over!';
        const msg   = `Score: ${snake.score}  |  Best: ${hiScore}  |  Speed: ${speedMul.toFixed(1)}×`;

        setTimeout(() => {
            showOverlay(title, msg, 'Play Again');

            // Auto-restart after delay
            restartTimer = setTimeout(() => {
                if (phase === 'gameover') startGame();
            }, RESTART_DELAY);
        }, 600);
    }

    /* --------------------------------------------------------
       Main loop
       -------------------------------------------------------- */
    function loop(now) {
        rafId = requestAnimationFrame(loop);
        tickParticles();

        if (phase === 'playing' && now - lastTick >= currentTick()) {
            lastTick = now;
            update();
        }

        draw();
    }

    /* --------------------------------------------------------
       Init
       -------------------------------------------------------- */
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    function init() {
        resizeCanvas();
        window.addEventListener('resize', () => { resizeCanvas(); draw(); });
        resetSnake();
        window.addEventListener('keydown', handleKey);
        $oBtn.addEventListener('click', () => { 
            if (phase === 'paused') togglePause();
            else if (phase !== 'playing') startGame(); 
        });
        if ($pauseBtn) {
            $pauseBtn.addEventListener('click', () => {
                if (phase === 'playing' || phase === 'paused') togglePause();
            });
        }
        initDpad();

        if (isTouchDevice) {
            const hint = document.querySelector('.overlay-hint');
            if (hint) hint.style.display = 'none';
        }

        showOverlay('Snake-Pedia', 'Eat, grow, survive. How long can you last?', 'Start Game');
        loop(performance.now());
    }

    init();
})();
