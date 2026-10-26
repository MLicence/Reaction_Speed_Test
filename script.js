const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');
const gameArea = document.getElementById('gameArea');
const gameText = document.getElementById('gameText');
const lastTimeEl = document.getElementById('lastTime');
const bestTimeEl = document.getElementById('bestTime');
const averageTimeEl = document.getElementById('averageTime');
const attemptCountEl = document.getElementById('attemptCount');

const reactionColors = ['#ff4d4d', '#ff8a00', '#ffd93d', '#7cff6b', '#00e676', '#00d9ff', '#3b82f6', '#8b5cf6', '#ff4ecf', '#ff6b6b'];
const MAX_TRIALS = reactionColors.length;

const state = {
  phase: 'idle',
  timerId: null,
  startTime: 0,
  attempts: 0,
  totalTime: 0,
  bestTime: Number.POSITIVE_INFINITY,
  lastTime: null,
  currentColor: null,
  trialNumber: 0,
  trialQueue: [],
  trialRecords: [],
};

function shuffleColors(colors) {
  const shuffled = [...colors];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

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

  if (phase === 'ready' && state.currentColor) {
    gameArea.style.background = state.currentColor;
    gameArea.style.boxShadow = `0 0 0 6px ${state.currentColor}33, 0 18px 32px ${state.currentColor}44`;
    return;
  }

  gameArea.style.background = '';
  gameArea.style.boxShadow = '';
}

function clearPendingTimer() {
  if (state.timerId) {
    clearTimeout(state.timerId);
    state.timerId = null;
  }
}

function buildCsv() {
  const rows = [['trial', 'color', 'reaction_ms']];

  state.trialRecords.forEach((record) => {
    rows.push([record.trial, record.color, record.reactionMs]);
  });

  return rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

function downloadCsv() {
  if (state.trialRecords.length === 0) {
    return;
  }

  const csv = buildCsv();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reaction_test_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function resetStats() {
  clearPendingTimer();
  state.attempts = 0;
  state.totalTime = 0;
  state.bestTime = Number.POSITIVE_INFINITY;
  state.lastTime = null;
  state.startTime = 0;
  state.currentColor = null;
  state.trialNumber = 0;
  state.trialQueue = shuffleColors(reactionColors);
  state.trialRecords = [];
  setPhase('idle', 'Press Start');
  gameArea.blur();
  updateStats();
  downloadCsvBtn.disabled = true;
}

function startRound() {
  if (state.trialQueue.length === 0) {
    state.trialQueue = shuffleColors(reactionColors);
  }

  if (state.trialNumber >= MAX_TRIALS) {
    state.trialNumber = 0;
    state.trialQueue = shuffleColors(reactionColors);
  }

  clearPendingTimer();
  state.currentColor = state.trialQueue[state.trialNumber];
  setPhase('waiting', `Trial ${state.trialNumber + 1}/${MAX_TRIALS}`);
  gameArea.focus();
  startBtn.blur();

  state.startTime = 0;
  state.timerId = setTimeout(() => {
    state.startTime = performance.now();
    setPhase('ready', 'CLICK!');
  }, randomDelay());
}

function finishTest() {
  state.phase = 'idle';
  gameText.textContent = 'All 10 trials complete';
  startBtn.textContent = 'Restart test';
  downloadCsvBtn.disabled = false;
}

function handleReaction() {
  if (state.phase === 'ready') {
    const reactionTime = performance.now() - state.startTime;
    const reactionRecord = {
      trial: state.trialNumber + 1,
      color: state.currentColor,
      reactionMs: Number(reactionTime.toFixed(0)),
    };

    state.attempts += 1;
    state.totalTime += reactionTime;
    state.lastTime = reactionTime;
    state.bestTime = Math.min(state.bestTime, reactionTime);
    state.trialRecords.push(reactionRecord);
    clearPendingTimer();

    const isLastTrial = state.trialNumber >= MAX_TRIALS - 1;
    state.trialNumber += 1;
    setPhase('idle', `${reactionTime.toFixed(0)} ms`);
    updateStats();

    if (isLastTrial) {
      finishTest();
      return;
    }

    setTimeout(() => {
      if (state.phase === 'idle') {
        startRound();
      }
    }, 150);
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
  if (state.phase === 'error' || state.phase === 'idle') {
    if (state.trialNumber >= MAX_TRIALS || state.trialQueue.length !== MAX_TRIALS) {
      resetStats();
    }

    if (state.phase === 'idle') {
      startRound();
    }
  }
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

downloadCsvBtn.addEventListener('click', downloadCsv);
gameArea.addEventListener('click', handleReaction);

downloadCsvBtn.disabled = true;
startBtn.textContent = 'Start test';
resetStats();
