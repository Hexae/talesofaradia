// fishing.js
// Modular fishing logic with namespaced UI, event listeners, and cleanup
// XP table computed once
const XP = (() => {
  const maxLevel = 99;
  const table = new Array(maxLevel + 2).fill(0);
  for (let lvl = 1; lvl <= maxLevel; lvl++) {
    let sum = 0;
    for (let i = 1; i <= lvl; i++) {
      sum += Math.floor(i + 300 * Math.pow(2, i / 7));
    }
    table[lvl] = Math.floor(sum / 4);
  }
  return table;
})();

// Derive MAX from XP length
const MAX = XP.length - 2;
let state = { lvl: 1, xp: 0, cnt: 0 };
let autoTimer = null;
let isRunning = false;

// Fish definitions
const FISH = [
  { lvl: 1, name: 'Shrimp', img: 'Fish_Shrimp.png', xp: 10 },
  { lvl: 5, name: 'Anchovy', img: 'Fish_Anchovy.png', xp: 15 },
  { lvl: 30, name: 'Salmon', img: 'Fish_Salmon.png', xp: 50 },
  { lvl: 40, name: 'Trout', img: 'Fish_Trout.png', xp: 65 },
  { lvl: 60, name: 'Tuna', img: 'Fish_Tuna.png', xp: 85 },
  { lvl: 80, name: 'Lobster', img: 'Fish_Lobster.png', xp: 120 },
  { lvl: 90, name: 'Swordfish', img: 'Fish_Swordfish.png', xp: 150 },
  { lvl: 95, name: 'Shark', img: 'Fish_Shark.png', xp: 200 },
  { lvl: 99, name: 'Leviathan', img: 'Fish_Leviathan.png', xp: 300 }
];

// Namespace for IDs
const IDS = {
  level: 'fish-level',
  count: 'fish-count',
  xp: 'fish-xp',
  next: 'fish-next',
  bar:  'fish-progress-bar',
  text: 'fish-progress-text',
  grid: 'fish-grid',
  start: 'fish-start',
  stop:  'fish-stop'
};

// Cached UI elements
let ui = {};

function nextXp(lvl) {
  return lvl < MAX ? XP[lvl + 1] - XP[lvl] : Infinity;
}

function updateBar(duration = .3) {
  const barEl = ui.bar;
  if (!barEl) return;
  barEl.style.transition = `width ${duration}s`;
  barEl.style.width = '100%';
}

function resetBar() {
  ui.bar.addEventListener('transitionend', function handler() {
    ui.bar.style.transition = '';
    ui.bar.style.width = '0%';
    ui.txt.textContent = '';
    ui.bar.removeEventListener('transitionend', handler);
  });
}

function render() {
  // Update stats
  ui.level.textContent = state.lvl;
  ui.count.textContent = state.cnt;
  ui.xp.textContent = state.xp.toFixed(1);
  ui.next.textContent = state.lvl < MAX ? nextXp(state.lvl).toFixed(1) : '—';

  // Populate grid
  ui.grid.innerHTML = '';
  FISH.forEach(f => {
    const unlocked = state.lvl >= f.lvl;
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <img src="icons/fishing/${f.img}" onerror="this.src='icons/placeholder.png'">
      <div class="label">${f.name} (Lv ${f.lvl})</div>
      <button ${!unlocked ? 'disabled' : ''}>Fish</button>
      ${!unlocked ? `<div class="lock">Unlock at ${f.lvl}</div>` : ''}
    `;
    const btn = card.querySelector('button');
    btn.addEventListener('click', () => singleCatch(f));
    ui.grid.appendChild(card);
  });
}

function singleCatch(fish) {
  // Batch updates
  const gain = fish.xp;
  state.cnt++;
  state.xp += gain;
  while (state.lvl < MAX && state.xp >= nextXp(state.lvl)) {
    state.xp -= nextXp(state.lvl);
    state.lvl++;
  }
  if (state.lvl >= MAX) { state.lvl = MAX; state.xp = 0; }

  // Animate bar and render
  ui.txt.textContent = `Fishing ${fish.name}…`;
  updateBar();
  render();
  resetBar();
}

function computeInterval() {
  const min = 2, max = 15;
  // seconds based on level
  const secs = min + (state.lvl - 1) * (max - min) / (MAX - 1);
  return secs * 1000;
}

function autoTick() {
  if (!isRunning) return;
  const available = FISH.filter(f => state.lvl >= f.lvl);
  const fish = available[available.length - 1];
  // fractional catch
  const partXp = fish.xp * 0.5;
  state.xp += partXp;
  if (state.xp >= nextXp(state.lvl)) {
    state.xp -= nextXp(state.lvl);
    state.lvl = Math.min(MAX, state.lvl + 1);
  }
  state.cnt += 0.5;

  render();
  // schedule next
  autoTimer = setTimeout(autoTick, computeInterval());
}

export function initFishing() {
  // Cache UI
  ui.level = document.getElementById(IDS.level);
  ui.count = document.getElementById(IDS.count);
  ui.xp    = document.getElementById(IDS.xp);
  ui.next  = document.getElementById(IDS.next);
  ui.bar   = document.getElementById(IDS.bar);
  ui.txt   = document.getElementById(IDS.text);
  ui.grid  = document.getElementById(IDS.grid);

  // Bind buttons
  document.getElementById(IDS.start).addEventListener('click', startFishing);
  document.getElementById(IDS.stop).addEventListener('click', stopFishing);

  // Initial render
  render();
}

export function startFishing() {
  if (isRunning) return;
  isRunning = true;
  clearTimeout(autoTimer);
  autoTimer = setTimeout(autoTick, computeInterval());
}

export function stopFishing() {
  isRunning = false;
  clearTimeout(autoTimer);
}

export function cleanupFishing() {
  stopFishing();
  // Remove listeners if needed
}
