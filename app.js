// ── State ──
const State = {
  IDLE: 'idle',
  WAITING: 'waiting',
  READY: 'ready',
  RESULT: 'result',
  FALSE_START: 'false-start',
};

let state = State.IDLE;
let timeoutId = null;
let readyTimestamp = 0;

// ── DOM ──
const panel = document.getElementById('panel');
const panelText = document.getElementById('panelText');
const panelResult = document.getElementById('panelResult');
const startBtn = document.getElementById('startBtn');
const bestScoreEl = document.getElementById('bestScore');
const leaderboardList = document.getElementById('leaderboardList');

// ── Mock Leaderboard Data ──
const mockPlayers = [
  { name: 'SpeedDemon', time: 187 },
  { name: 'FlashFingers', time: 203 },
  { name: 'QuickDraw', time: 221 },
  { name: 'Blinker', time: 245 },
  { name: 'SlowPoke', time: 312 },
];

// ── Local Storage ──
function getBestScore() {
  const val = localStorage.getItem('reactionlab-best');
  return val ? parseInt(val, 10) : null;
}

function setBestScore(ms) {
  const current = getBestScore();
  if (current === null || ms < current) {
    localStorage.setItem('reactionlab-best', ms);
    return true;
  }
  return false;
}

// ── State Transitions ──
function setState(newState) {
  state = newState;
  panel.className = 'panel panel--' + newState;
  panelResult.textContent = '';

  switch (newState) {
    case State.IDLE:
      panelText.textContent = 'Click to start';
      startBtn.textContent = 'Start';
      break;
    case State.WAITING:
      panelText.textContent = 'Wait for it\u2026';
      startBtn.textContent = 'Waiting\u2026';
      break;
    case State.READY:
      panelText.textContent = 'Click now!';
      startBtn.textContent = 'Go!';
      readyTimestamp = performance.now();
      break;
    case State.FALSE_START:
      panelText.textContent = 'Too soon!';
      startBtn.textContent = 'Retry';
      break;
    case State.RESULT:
      startBtn.textContent = 'Retry';
      break;
  }
}

function showResult(ms) {
  setState(State.RESULT);
  panelText.textContent = 'Your time';
  panelResult.textContent = ms + ' ms';

  const isNew = setBestScore(ms);
  updateBestScore();
  renderLeaderboard();

  if (isNew) {
    panelText.textContent = 'New best!';
  }
}

function startGame() {
  setState(State.WAITING);
  const delay = 1500 + Math.random() * 3500; // 1.5s – 5s
  timeoutId = setTimeout(() => {
    setState(State.READY);
  }, delay);
}

function reset() {
  clearTimeout(timeoutId);
  timeoutId = null;
  setState(State.IDLE);
}

// ── Event Handlers ──
panel.addEventListener('click', () => {
  if (state === State.READY) {
    const reactionTime = Math.round(performance.now() - readyTimestamp);
    showResult(reactionTime);
  } else if (state === State.WAITING) {
    clearTimeout(timeoutId);
    setState(State.FALSE_START);
  }
});

startBtn.addEventListener('click', () => {
  if (state === State.IDLE || state === State.RESULT || state === State.FALSE_START) {
    startGame();
  }
});

// ── Best Score Display ──
function updateBestScore() {
  const best = getBestScore();
  bestScoreEl.textContent = best !== null ? 'Best: ' + best + ' ms' : '';
}

// ── Leaderboard ──
function renderLeaderboard() {
  const best = getBestScore();
  const entries = [...mockPlayers];

  if (best !== null) {
    entries.push({ name: 'You', time: best, isUser: true });
  }

  entries.sort((a, b) => a.time - b.time);

  // Keep top 6
  const top = entries.slice(0, 6);

  leaderboardList.innerHTML = top
    .map((entry) => {
      const cls = entry.isUser ? ' leaderboard-item--you' : '';
      return (
        '<li class="leaderboard-item' + cls + '">' +
        '<span class="leaderboard-name">' + entry.name + '</span>' +
        '<span class="leaderboard-time">' + entry.time + ' ms</span>' +
        '</li>'
      );
    })
    .join('');
}

// ── Init ──
updateBestScore();
renderLeaderboard();
