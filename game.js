/* Flappy Animals — cute version with animal shop and highscore saving */

const CANVAS_W = 420,
  CANVAS_H = 640;
const canvas = document.getElementById("canvas"),
  ctx = canvas.getContext("2d");
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");
const shopBtn = document.getElementById("shopBtn");
const shopModal = document.getElementById("shopModal");
const duckList = document.getElementById("duckList");
const closeShop = document.getElementById("closeShop");
const muteBtn = document.getElementById("muteBtn");
const overlayMsg = document.getElementById("overlayMsg");

const sfxFlap = document.getElementById("sfxFlap");
const sfxScore = document.getElementById("sfxScore");
const sfxHit = document.getElementById("sfxHit");
const bgMusic = document.getElementById("bgMusic");

let muted = false;

// Physics
const GRAVITY = 1000,
  JUMP_V = -340,
  MAX_FALL_SPEED = 900;
const PIPE_WIDTH = 72,
  PIPE_SPEED = 160,
  PIPE_GAP = 140;
const PIPE_SPAWN_INTERVAL = 1500;
const FLOAT_DURATION = 1300,
  FLOAT_GRAVITY_MULT = 0.18;

let highscore = parseInt(
  localStorage.getItem("flappy_animals_highscore") || "0",
  10
);
const highscoreEl = document.getElementById("highscore");

const animalImages = [
  {
    id: "panda",
    name: "Gấu Trúc",
    src: `data:image/svg+xml;utf8,
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
      <g stroke='%23000' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' fill='none'>
        <!-- body -->
        <ellipse cx='60' cy='74' rx='30' ry='20' fill='%23ffffff' stroke='%23000'/>
        <!-- arms -->
        <ellipse cx='36' cy='74' rx='8' ry='12' fill='%23000' stroke='%23000'/>
        <ellipse cx='84' cy='74' rx='8' ry='12' fill='%23000' stroke='%23000'/>
        <!-- legs -->
        <ellipse cx='48' cy='94' rx='9' ry='6' fill='%23000' stroke='%23000'/>
        <ellipse cx='72' cy='94' rx='9' ry='6' fill='%23000' stroke='%23000'/>
        <!-- head -->
        <circle cx='60' cy='44' r='24' fill='%23fff' stroke='%23000'/>
        <!-- ears -->
        <ellipse cx='42' cy='30' rx='8' ry='9' fill='%23000'/>
        <ellipse cx='78' cy='30' rx='8' ry='9' fill='%23000'/>
        <!-- eye patches -->
        <ellipse cx='48' cy='42' rx='9' ry='12' fill='%23000'/>
        <ellipse cx='72' cy='42' rx='9' ry='12' fill='%23000'/>
        <!-- eyes -->
        <circle cx='47' cy='44' r='3' fill='%23fff'/>
        <circle cx='71' cy='44' r='3' fill='%23fff'/>
        <!-- nose & mouth -->
        <ellipse cx='60' cy='52' rx='4' ry='3' fill='%23000'/>
        <path d='M56 56 q4 4 8 0' stroke='%23000' stroke-width='1.4' fill='none'/>
      </g>
    </svg>`,
  },

  {
    id: "pig",
    name: "Heo",
    src: `data:image/svg+xml;utf8,
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
      <!-- pig full-body, realistic cartoon -->
      <g stroke='%23d86f8b' stroke-linecap='round' stroke-linejoin='round' fill='none'>
        <ellipse cx='60' cy='78' rx='34' ry='20' fill='%23ffb6c1' stroke='%23e06b88' stroke-width='1.4'/> <!-- body -->
        <rect x='44' y='90' width='10' height='10' rx='2' ry='2' fill='%23ff9fb7' stroke='%23d86f8b'/> <!-- left leg -->
        <rect x='66' y='90' width='10' height='10' rx='2' ry='2' fill='%23ff9fb7' stroke='%23d86f8b'/> <!-- right leg -->
        <path d='M88 76 q6 6 0 10' stroke='%23d86f8b' stroke-width='1.8' fill='none'/> <!-- tail -->
        <circle cx='60' cy='44' r='22' fill='%23ffb6c1' stroke='%23e06b88' stroke-width='1.4'/> <!-- head -->
        <path d='M46 34 q8 -10 14 0' fill='%23ffb6c1' stroke='%23e06b88'/> <!-- left ear -->
        <path d='M74 34 q-8 -10 -14 0' fill='%23ffb6c1' stroke='%23e06b88'/> <!-- right ear -->
        <ellipse cx='60' cy='52' rx='10' ry='7' fill='%23ff8fa3' stroke='%23d86f8b'/> <!-- snout -->
        <circle cx='55' cy='52' r='1.8' fill='%23000'/>
        <circle cx='65' cy='52' r='1.8' fill='%23000'/>
        <circle cx='52' cy='44' r='3' fill='%23000'/>
        <circle cx='68' cy='44' r='3' fill='%23000'/>
      </g>
    </svg>`,
  },

  {
    id: "duck",
    name: "Vịt",
    src: `data:image/svg+xml;utf8,
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
      <!-- duck full-body -->
      <g stroke='%23cc8a00' stroke-linecap='round' stroke-linejoin='round' fill='none'>
        <ellipse cx='60' cy='74' rx='38' ry='24' fill='%23ffd94d' stroke='%23ffbf00' stroke-width='1.4'/> <!-- body -->
        <path d='M80 70 q-12 12 -28 10 q12 -12 28 -18' fill='%23ffd94d' stroke='%23ffbf00' stroke-width='1.2'/> <!-- wing -->
        <path d='M48 96 q4 6 8 0' stroke='%23ff8a3d' stroke-width='3' fill='none'/> <!-- left foot -->
        <path d='M72 96 q4 6 8 0' stroke='%23ff8a3d' stroke-width='3' fill='none'/> <!-- right foot -->
        <circle cx='44' cy='54' r='16' fill='%23fff4d6' stroke='%23ffbf00' stroke-width='1.4'/> <!-- head -->
        <path d='M60 56 q12 2 8 10 q-8 -2 -8 -6 z' fill='%23ff8a3d' stroke='%23e66a1a' stroke-width='1.2'/> <!-- beak -->
        <circle cx='40' cy='52' r='3' fill='%23000'/> <!-- eye -->
      </g>
    </svg>`,
  },

  {
    id: "cat",
    name: "Mèo",
    src: `data:image/svg+xml;utf8,
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
      <!-- cat full-body (no fur texture but realistic shape) -->
      <g stroke='%23806a4a' stroke-linecap='round' stroke-linejoin='round' fill='none'>
        <ellipse cx='60' cy='76' rx='30' ry='22' fill='%23ffd7a6' stroke='%23906f4d' stroke-width='1.4'/> <!-- body -->
        <path d='M86 74 q-10 16 -24 16' stroke='%23906f4d' stroke-width='3' fill='none' stroke-linecap='round'/> <!-- tail -->
        <ellipse cx='48' cy='94' rx='7' ry='6' fill='%23906f4d'/> <!-- left paw -->
        <ellipse cx='72' cy='94' rx='7' ry='6' fill='%23906f4d'/> <!-- right paw -->
        <circle cx='60' cy='48' r='22' fill='%23ffd7a6' stroke='%23906f4d' stroke-width='1.4'/> <!-- head -->
        <polygon points='46,34 56,46 40,46' fill='%23ffd7a6' stroke='%23906f4d'/> <!-- left ear -->
        <polygon points='74,34 64,46 80,46' fill='%23ffd7a6' stroke='%23906f4d'/> <!-- right ear -->
        <circle cx='52' cy='48' r='3' fill='%23000'/> <!-- left eye -->
        <circle cx='68' cy='48' r='3' fill='%23000'/> <!-- right eye -->
        <path d='M56 58 q4 6 8 0' stroke='%23806a4a' stroke-width='1.4' fill='none'/> <!-- mouth -->
        <path d='M40 56 q12 0 20 0' stroke='%23806a4a' stroke-width='0.9' fill='none'/> <!-- whisker left -->
        <path d='M80 56 q-12 0 -20 0' stroke='%23806a4a' stroke-width='0.9' fill='none'/> <!-- whisker right -->
      </g>
    </svg>`,
  },

  {
    id: "capybara",
    name: "Capybara",
    src: `data:image/svg+xml;utf8,
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
      <!-- capybara full-body (simple realistic silhouette) -->
      <g stroke='%23845f3a' stroke-linecap='round' stroke-linejoin='round' fill='none'>
        <ellipse cx='60' cy='80' rx='40' ry='22' fill='%23caa07a' stroke='%23906f4d' stroke-width='1.3'/> <!-- body -->
        <rect x='44' y='92' width='8' height='10' rx='2' ry='2' fill='%23906f4d'/> <!-- left leg -->
        <rect x='68' y='92' width='8' height='10' rx='2' ry='2' fill='%23906f4d'/> <!-- right leg -->
        <rect x='36' y='54' width='48' height='36' rx='10' ry='10' fill='%23d4b08b' stroke='%23906f4d' stroke-width='1.2'/> <!-- head broad -->
        <circle cx='48' cy='68' r='3' fill='%23000'/> <!-- left eye -->
        <circle cx='72' cy='68' r='3' fill='%23000'/> <!-- right eye -->
        <ellipse cx='60' cy='78' rx='8' ry='6' fill='%238d6b43'/> <!-- nose -->
        <path d='M54 82 q6 6 12 0' stroke='%238d6b43' stroke-width='1.2' fill='none'/> <!-- mouth -->
      </g>
    </svg>`,
  },

  {
    id: "dog",
    name: "Chó",
    src: `data:image/svg+xml;utf8,
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
      <!-- dog full-body (realistic cartoon) -->
      <g stroke='%23906f4d' stroke-linecap='round' stroke-linejoin='round' fill='none'>
        <ellipse cx='60' cy='78' rx='34' ry='22' fill='%23e6cbaa' stroke='%23906f4d' stroke-width='1.4'/> <!-- body -->
        <rect x='46' y='90' width='8' height='12' rx='2' ry='2' fill='%23906f4d'/> <!-- left leg -->
        <rect x='66' y='90' width='8' height='12' rx='2' ry='2' fill='%23906f4d'/> <!-- right leg -->
        <path d='M92 74 q-8 14 -24 14' stroke='%23906f4d' stroke-width='3' fill='none' stroke-linecap='round'/> <!-- tail -->
        <circle cx='60' cy='48' r='22' fill='%23e6cbaa' stroke='%23906f4d' stroke-width='1.4'/> <!-- head -->
        <path d='M42 44 q10 -14 16 6' fill='%23906f4d' stroke='%23906f4d'/> <!-- left floppy ear -->
        <path d='M78 44 q-10 -14 -16 6' fill='%23906f4d' stroke='%23906f4d'/> <!-- right floppy ear -->
        <circle cx='52' cy='50' r='3' fill='%23000'/>
        <circle cx='68' cy='50' r='3' fill='%23000'/>
        <ellipse cx='60' cy='56' rx='4' ry='3' fill='%23000'/> <!-- nose -->
        <path d='M56 60 q4 6 8 0' stroke='%23000' stroke-width='1.2' fill='none'/> <!-- mouth -->
      </g>
    </svg>`,
  },

  {
    id: "kitty",
    name: "Hello Kitty",
    src: `data:image/svg+xml;utf8,
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
      <!-- Hello Kitty full-body (stylized character) -->
      <g stroke='%23d7c5ca' stroke-linecap='round' stroke-linejoin='round' fill='none'>
        <ellipse cx='60' cy='80' rx='26' ry='18' fill='%23fff' stroke='%23d7c5ca' stroke-width='1.2'/> <!-- body -->
        <ellipse cx='50' cy='94' rx='6' ry='5' fill='%23fff'/> <!-- left foot -->
        <ellipse cx='70' cy='94' rx='6' ry='5' fill='%23fff'/> <!-- right foot -->
        <ellipse cx='40' cy='80' rx='5' ry='10' fill='%23fff'/> <!-- left arm -->
        <ellipse cx='80' cy='80' rx='5' ry='10' fill='%23fff'/> <!-- right arm -->
        <circle cx='60' cy='48' r='26' fill='%23fff' stroke='%23d7c5ca' stroke-width='1.2'/> <!-- head -->
        <polygon points='46,34 56,46 40,46' fill='%23fff' stroke='%23d7c5ca'/> <!-- left ear -->
        <polygon points='74,34 64,46 80,46' fill='%23fff' stroke='%23d7c5ca'/> <!-- right ear -->
        <circle cx='49' cy='52' r='3' fill='%23000'/>
        <circle cx='71' cy='52' r='3' fill='%23000'/>
        <ellipse cx='60' cy='62' rx='6' ry='3' fill='%23000'/> <!-- mouth -->
        <g transform='translate(76,36)'>
          <ellipse cx='0' cy='0' rx='7' ry='6' fill='%23ff6fa3' stroke='%23ff4f88'/> <!-- bow big part -->
          <ellipse cx='10' cy='0' rx='6' ry='5' fill='%23ff8fc3' stroke='%23ff4f88'/> <!-- bow bit -->
        </g>
      </g>
    </svg>`,
  },

  {
    id: "dragon",
    name: "Rồng",
    src: `data:image/svg+xml;utf8,
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
      <!-- dragon full-body (cute realistic silhouette, no scales texture) -->
      <g stroke='%23004d2b' stroke-linecap='round' stroke-linejoin='round' fill='none'>
        <ellipse cx='60' cy='76' rx='36' ry='22' fill='%235fe78f' stroke='%23004d2b' stroke-width='1.4'/> <!-- body -->
        <path d='M44 68 q16 26 32 0' fill='%23d9f8e0' stroke='none'/> <!-- belly -->
        <rect x='44' y='90' width='9' height='10' rx='2' ry='2' fill='%23004d2b'/> <!-- left leg -->
        <rect x='67' y='90' width='9' height='10' rx='2' ry='2' fill='%23004d2b'/> <!-- right leg -->
        <path d='M92 78 q-12 18 -28 16' stroke='%23004d2b' stroke-width='3' fill='none' stroke-linecap='round'/> <!-- tail -->
        <path d='M48 64 q8 -20 24 -12 q-12 6 -24 12 z' fill='%2367f7aa' stroke='%23004d2b'/> <!-- wing -->
        <circle cx='54' cy='48' r='18' fill='%235fe78f' stroke='%23004d2b' stroke-width='1.4'/> <!-- head -->
        <path d='M46 36 q6 -8 10 0' stroke='%23004d2b' stroke-width='1.6' fill='none'/> <!-- left horn -->
        <path d='M62 36 q6 -8 10 0' stroke='%23004d2b' stroke-width='1.6' fill='none'/> <!-- right horn -->
        <circle cx='50' cy='48' r='3' fill='%23000'/> <!-- eye -->
        <path d='M58 56 q6 6 12 0' stroke='%23004d2b' stroke-width='1.2' fill='none'/> <!-- mouth -->
      </g>
    </svg>`,
  },

  {
    id: "doraemon",
    name: "Doraemon",
    src: `data:image/svg+xml;utf8,
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
      <!-- Doraemon (copyrighted character) - simple vector recreation -->
      <g stroke='%23000' stroke-linecap='round' stroke-linejoin='round' fill='none'>
        <!-- body -->
        <circle cx='60' cy='64' r='28' fill='%23008adf' stroke='%23000' stroke-width='1.4'/> <!-- head/body rounded (Doraemon is a round robot) -->
        <circle cx='60' cy='56' r='20' fill='%23fff' stroke='none'/> <!-- face white -->
        <!-- eyes -->
        <ellipse cx='52' cy='52' rx='5' ry='7' fill='%23fff' stroke='%23000' stroke-width='0.9'/>
        <ellipse cx='68' cy='52' rx='5' ry='7' fill='%23fff' stroke='%23000' stroke-width='0.9'/>
        <circle cx='53' cy='54' r='1.8' fill='%23000'/>
        <circle cx='67' cy='54' r='1.8' fill='%23000'/>
        <!-- nose -->
        <circle cx='60' cy='60' r='4.2' fill='%23ff3b6b' stroke='%23000' stroke-width='0.9'/>
        <!-- mouth line -->
        <path d='M48 66 q12 12 24 0' stroke='%23000' stroke-width='1.1' fill='none'/>
        <!-- whiskers -->
        <path d='M36 58 h18' stroke='%23000' stroke-width='1'/>
        <path d='M36 62 h18' stroke='%23000' stroke-width='1'/>
        <path d='M84 58 h-18' stroke='%23000' stroke-width='1'/>
        <path d='M84 62 h-18' stroke='%23000' stroke-width='1'/>
        <!-- collar -->
        <rect x='36' y='72' width='48' height='6' rx='3' ry='3' fill='%23ff3b6b' stroke='%23000' stroke-width='0.9'/>
        <!-- bell -->
        <circle cx='60' cy='78' r='4' fill='%23ffd24d' stroke='%23000' stroke-width='0.9'/>
      </g>
    </svg>`,
  },
];

let selectedIndex = parseInt(
  localStorage.getItem("flappy_animals_selected") || "0",
  10
);
if (
  isNaN(selectedIndex) ||
  selectedIndex < 0 ||
  selectedIndex >= animalImages.length
)
  selectedIndex = 0;

let bird = null,
  pipes = [],
  clouds = [],
  score = 0,
  running = false,
  gameOver = false;
let lastSpawn = 0,
  floatUntil = 0,
  colorIndex = 0;

// Backgrounds
const bgColors = [
  ["#74b9ff", "#a29bfe"],
  ["#81ecec", "#74b9ff"],
  ["#fab1a0", "#ff7675"],
  ["#ffeaa7", "#55efc4"],
  ["#a29bfe", "#6c5ce7"],
];
const pipeColors = [["#00e0a8", "#009d83"]];

const images = {};
animalImages.forEach((a) => {
  const img = new Image();
  img.src = a.src;
  images[a.id] = img;
});

function rnd(min, max) {
  return Math.random() * (max - min) + min;
}
function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function initBird() {
  bird = { x: 92, y: CANVAS_H / 2, w: 48, h: 48, vy: 0, rot: 0 };
}
function initClouds() {
  clouds = [];
  for (let i = 0; i < 6; i++)
    clouds.push({
      x: rnd(0, CANVAS_W),
      y: rnd(30, 200),
      vx: rnd(12, 48),
      s: rnd(0.6, 1.3),
    });
}
function spawnPipe() {
  const top = rnd(60, CANVAS_H - 180 - PIPE_GAP);
  pipes.push({ x: CANVAS_W + 20, top, bottom: top + PIPE_GAP, passed: false });
}

function drawBackground() {
  const [c1, c2] = bgColors[colorIndex % bgColors.length];
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.globalAlpha = 0.9;
  clouds.forEach((c) => {
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, 40 * c.s, 20 * c.s, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawPipes() {
  const [p1, p2] = pipeColors[colorIndex % pipeColors.length];
  pipes.forEach((p) => {
    const g = ctx.createLinearGradient(p.x, 0, p.x + PIPE_WIDTH, 0);
    g.addColorStop(0, p1);
    g.addColorStop(1, p2);
    ctx.fillStyle = g;
    ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top);
    ctx.fillRect(p.x, p.bottom, PIPE_WIDTH, CANVAS_H - p.bottom);
  });
}

function drawBird() {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(bird.rot);
  const a = animalImages[selectedIndex];
  ctx.drawImage(images[a.id], -bird.w / 2, -bird.h / 2, bird.w, bird.h);
  ctx.restore();
}

function updatePhysics(dt, now) {
  const floatActive = floatUntil && now < floatUntil;
  const gravityNow = floatActive ? GRAVITY * FLOAT_GRAVITY_MULT : GRAVITY;

  bird.vy += gravityNow * dt;
  bird.vy = clamp(bird.vy, -700, MAX_FALL_SPEED);
  bird.y += bird.vy * dt;
  bird.rot += (bird.vy / 600 - bird.rot) * 0.08;

  pipes.forEach((p) => (p.x -= PIPE_SPEED * dt));
  if (now - lastSpawn > PIPE_SPAWN_INTERVAL) {
    spawnPipe();
    lastSpawn = now;
  }

  clouds.forEach((c) => {
    c.x += c.vx * dt;
    if (c.x > CANVAS_W + 140) c.x = -160;
  });

  for (let p of pipes) {
    const withinX =
      bird.x + bird.w * 0.35 > p.x && bird.x - bird.w * 0.35 < p.x + PIPE_WIDTH;
    const hitTop = bird.y - bird.h * 0.35 < p.top;
    const hitBottom = bird.y + bird.h * 0.35 > p.bottom;
    if (withinX && (hitTop || hitBottom)) {
      playSound(sfxHit);
      gameOver = true;
      running = false;
    }
    if (!p.passed && p.x + PIPE_WIDTH < bird.x - bird.w / 2) {
      p.passed = true;
      score++;
      scoreEl.textContent = score;
      playSound(sfxScore);
      if (score % 5 === 0) colorIndex++;
      saveHighscore();
    }
  }

  if (bird.y + bird.h / 2 > CANVAS_H) {
    playSound(sfxHit);
    gameOver = true;
    running = false;
  }
  if (bird.y - bird.h / 2 < 0) bird.y = bird.h / 2;
  pipes = pipes.filter((p) => p.x + PIPE_WIDTH > -60);
}

function playSound(el) {
  if (!muted && el?.src) {
    el.currentTime = 0;
    el.play().catch(() => {});
  }
}
function playMusic() {
  if (!muted && bgMusic.src) bgMusic.play().catch(() => {});
}

function flap() {
  if (gameOver) return restart();
  if (!running) {
    running = true;
    floatUntil = performance.now() + FLOAT_DURATION;
    overlayMsg.classList.add("hidden");
    bird.vy = JUMP_V * 0.5;
    playMusic();
    playSound(sfxFlap);
    return;
  }
  bird.vy = JUMP_V;
  playSound(sfxFlap);
}

let lastFrameTime = null;
function loop(ts) {
  if (!lastFrameTime) lastFrameTime = ts;
  const dt = Math.min(0.05, (ts - lastFrameTime) / 1000);
  lastFrameTime = ts;

  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawBackground();
  drawPipes();
  if (running) updatePhysics(dt, performance.now());
  drawBird();

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.font = "32px system-ui";
    ctx.fillText("Game Over", CANVAS_W / 2 - 86, CANVAS_H / 2 - 10);
    ctx.font = "18px system-ui";
    ctx.fillText("Click để chơi lại", CANVAS_W / 2 - 70, CANVAS_H / 2 + 22);
    restartBtn.classList.remove("hidden");
  }
  requestAnimationFrame(loop);
}

function start() {
  initBird();
  initClouds();
  pipes = [];
  score = 0;
  scoreEl.textContent = score;
  running = false;
  gameOver = false;
  lastFrameTime = null;
  lastSpawn = 0;
  floatUntil = 0;
  colorIndex = 0;
  overlayMsg.classList.remove("hidden");
  restartBtn.classList.add("hidden");
}
function restart() {
  start();
  playMusic();
  if (highscoreEl) highscoreEl.textContent = highscore;
}

function populateShop() {
  duckList.innerHTML = "";
  animalImages.forEach((a, idx) => {
    const el = document.createElement("div");
    el.className = "duck-item" + (idx === selectedIndex ? " selected" : "");
    el.dataset.index = idx;
    const img = document.createElement("img");
    img.src = a.src;
    const p = document.createElement("p");
    p.textContent = a.name;
    el.appendChild(img);
    el.appendChild(p);
    el.addEventListener("click", () => {
      selectedIndex = idx;
      localStorage.setItem("flappy_animals_selected", String(idx));
      document
        .querySelectorAll(".duck-item")
        .forEach((x) => x.classList.remove("selected"));
      el.classList.add("selected");
      overlayMsg.textContent = `Đã chọn: ${a.name}`;
    });
    duckList.appendChild(el);
  });
}

function saveHighscore() {
  if (score > highscore) {
    highscore = score;
    localStorage.setItem("flappy_animals_highscore", highscore);
    if (highscoreEl) highscoreEl.textContent = highscore;
  }
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    flap();
  }
});
canvas.addEventListener("mousedown", flap);
restartBtn.addEventListener("click", restart);
shopBtn.addEventListener("click", () => {
  populateShop();
  shopModal.classList.remove("hidden");
});
closeShop.addEventListener("click", () => shopModal.classList.add("hidden"));
muteBtn.addEventListener("click", () => {
  muted = !muted;
  muteBtn.textContent = muted ? "Bật nhạc" : "Tắt nhạc";
  if (muted) bgMusic.pause();
  else if (running) bgMusic.play();
});

start();
requestAnimationFrame(loop);
