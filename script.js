const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const gameArea = document.getElementById('gameArea');
const gameText = document.getElementById('gameText');
const lastTimeEl = document.getElementById('lastTime');
const bestTimeEl = document.getElementById('bestTime');
const averageTimeEl = document.getElementById('averageTime');
const attemptCountEl = document.getElementById('attemptCount');

const state = {
  phase: 'idle',
  timerId: null,
  startTime: 0,
  attempts: 0,
  totalTime: 0,
  bestTime: Number.POSITIVE_INFINITY,
  lastTime: null,
};

function randomDelay() {
  return Math.floor(Math.random() * 2000) + 1500;
}

function updateStats() {
  const average = state.attempts > 0 ? (state.totalTime / state.attempts).toFixed(0) : '--';

  lastTimeEl.textContent = state.lastTime === null ? '--' : `${state.lastTime.toFixed(0)} ms`;
  bestTimeEl.textContent = Number.isFinite(state.bestTime) ? `${state.bestTime.toFixed(0)} ms` : '--';
  averageTimeEl.textContent = state.attempts > 0 ? `${average} ms` : '--';
  attemptCountEl.textContent = String(state.attempts);
}

function setPhase(phase, text) {
  state.phase = phase;
  gameArea.className = `game-area ${phase}`;
  gameText.textContent = text;
}

function clearPendingTimer() {
  if (state.timerId) {
    clearTimeout(state.timerId);
    state.timerId = null;
  }
}

function startRound() {
  clearPendingTimer();
  setPhase('waiting', 'Wait for green...');
  gameArea.focus();
  startBtn.blur();

  state.startTime = 0;
  state.timerId = setTimeout(() => {
    state.startTime = performance.now();
    setPhase('ready', 'CLICK!');
  }, randomDelay());
}

function resetStats() {
  clearPendingTimer();
  state.attempts = 0;
  state.totalTime = 0;
  state.bestTime = Number.POSITIVE_INFINITY;
  state.lastTime = null;
  state.startTime = 0;
  setPhase('idle', 'Press Start');
  gameArea.blur();
  updateStats();
}

function handleReaction() {
  if (state.phase === 'ready') {
    const reactionTime = performance.now() - state.startTime;
    state.attempts += 1;
    state.totalTime += reactionTime;
    state.lastTime = reactionTime;
    state.bestTime = Math.min(state.bestTime, reactionTime);
    clearPendingTimer();
    setPhase('idle', `${reactionTime.toFixed(0)} ms`);
    updateStats();
    return;
  }

  if (state.phase === 'waiting') {
    clearPendingTimer();
    state.lastTime = null;
    setPhase('error', 'Too soon!');
    updateStats();
    return;
  }

  if (state.phase === 'idle') {
    startRound();
  }
}

function handleSpacebar(event) {
  if (event.code !== 'Space' || event.repeat) {
    return;
  }

  if (state.phase === 'idle') {
    return;
  }

  event.preventDefault();
  handleReaction();
}

startBtn.addEventListener('click', () => {
  startRound();
});

startBtn.addEventListener('keydown', handleSpacebar);
gameArea.addEventListener('keydown', handleSpacebar);
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && !event.repeat && state.phase !== 'idle') {
    const activeElement = document.activeElement;
    if (!activeElement || activeElement === document.body || activeElement === gameArea || activeElement === startBtn) {
      event.preventDefault();
      handleReaction();
    }
  }
});

resetBtn.addEventListener('click', () => {
  resetStats();
});

gameArea.addEventListener('click', handleReaction);

resetStats();
