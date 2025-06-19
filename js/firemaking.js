// firemaking.js

(function(){
  const TREES = window.TREES;
  const MAX_LEVEL = window.MAX_LEVEL;
  const XP_TABLE = window.XP_TABLE;
  const state = window.state;

  // Generate FIRES data based on your trees
  const FIRES = TREES.map(t => ({
    lvl: t.lvl, name: t.name, xp: t.xp * 0.5, img: t.img
  }));

  // Main firemaking UI update function
  function renderFiremakingUI() {
    // Fill stats
    document.getElementById('fm-level').textContent = state.firemaking.level;
    document.getElementById('fire-count').textContent = state.firemaking.fires;
    document.getElementById('fm-xp').textContent = state.firemaking.xp.toFixed(1);
    document.getElementById('fm-next').textContent = state.firemaking.level < MAX_LEVEL ? nextXpFor(state.firemaking.level).toFixed(1) : '—';
    document.getElementById('gold-count-fm').textContent = state.gold;

    // Fill dropdown with all unlocked/burnable logs
    const select = document.getElementById('firemaking-log-select');
    select.innerHTML = '';
    let hasUnlocked = false;
    FIRES.forEach(fire => {
      if (state.firemaking.level >= fire.lvl && (state.inventory[fire.name] || 0) > 0) {
        hasUnlocked = true;
        const opt = document.createElement('option');
        opt.value = fire.name;
        opt.textContent = `${fire.name} (XP: ${fire.xp}) — You have: ${state.inventory[fire.name]||0}`;
        select.appendChild(opt);
      }
    });
    if (!hasUnlocked) {
      select.innerHTML = '<option disabled selected>No logs to burn</option>';
      document.getElementById('light-fire-btn').disabled = true;
    } else {
      document.getElementById('light-fire-btn').disabled = false;
    }
    document.getElementById('fm-progress-container').style.display = "none";
    document.getElementById('fm-progress-text').textContent = "";
  }

  // Export to global scope
  window.renderFiremakingUI = renderFiremakingUI;

  // Button logic
  document.getElementById('light-fire-btn').onclick = async () => {
    const select = document.getElementById('firemaking-log-select');
    const logName = select.value;
    if (!logName || (state.inventory[logName]||0) <= 0) return;
    const fire = FIRES.find(f=>f.name===logName);
    if (!fire) return;

    // Animate progress
    const bar = document.getElementById('fm-progress-bar');
    const container = document.getElementById('fm-progress-container');
    const text = document.getElementById('fm-progress-text');
    bar.style.width = "0%";
    container.style.display = "block";
    text.textContent = `Lighting ${logName}...`;
    let steps = 18;
    for(let i=0;i<=steps;i++) {
      bar.style.width = (i*100/steps) + "%";
      await new Promise(res=>setTimeout(res, 14));
    }
    bar.style.width = "100%";

    // Consume log, gain XP, update state
    state.inventory[logName]--;
    state.firemaking.fires++;
    state.firemaking.xp += fire.xp;
    while(state.firemaking.level < MAX_LEVEL && state.firemaking.xp >= XP_TABLE[state.firemaking.level+1]) state.firemaking.level++;
    await window.saveState();
    renderFiremakingUI();
    text.textContent = `You light a ${logName} (+${fire.xp} XP)`;
    setTimeout(()=>{ text.textContent = ""; container.style.display="none"; }, 1000);
  };

  // Hook into tab switch (call renderFiremakingUI when firemaking tab is selected)
  document.querySelectorAll('.skill-list li[data-skill="firemaking"]').forEach(li => {
    li.addEventListener('click', renderFiremakingUI);
  });

  // Initial render if firemaking tab is already active
  if (document.querySelector('.skill-list li.active')?.dataset.skill === 'firemaking') {
    renderFiremakingUI();
  }
})();
