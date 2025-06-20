// firemaking.js

(function(){
  let TREES = window.TREES;
  let MAX_LEVEL = window.MAX_LEVEL;
  let XP_TABLE = window.XP_TABLE;
  let state = window.state;

  // Generate FIRES data based on your trees
  const FIREMAKING_ICON_PATH = "icons/firemaking/";
  let FIRES = [
    { lvl:1,  xp:30,  name:'Logs', img:FIREMAKING_ICON_PATH+'Logs.png'},
    { lvl:10, xp:60,  name:'Oak Logs',img:FIREMAKING_ICON_PATH+'Oak_Logs.png' },
    { lvl:20, xp:75,  name:'Birch Logs',img:FIREMAKING_ICON_PATH+'Birch_Logs.png' },
    { lvl:30, xp:90,  name:'Willow Logs',img:FIREMAKING_ICON_PATH+'Willow_Logs.png' },
    { lvl:40, xp:120, name:'Sakura Logs',img:FIREMAKING_ICON_PATH+'Sakura_Logs.png' },
    { lvl:50, xp:105, name:'Japanese Maple Logs',img:FIREMAKING_ICON_PATH+'Japanese_Maple_Logs.png' },
    { lvl:60, xp:135, name:'Sycamore Maple Logs',img:FIREMAKING_ICON_PATH+'Sycamore_Maple_Logs.png' },
    { lvl:70, xp:150, name:'Gigantic Oak Logs',img:FIREMAKING_ICON_PATH+'Gigantic_Oak_Logs.png' },
    { lvl:75, xp:165, name:'Palm Logs',img:FIREMAKING_ICON_PATH+'Palm_Logs.png' },
    { lvl:80, xp:180, name:'Pitch Pine Logs',img:FIREMAKING_ICON_PATH+'Pitch_Pine_Logs.png' },
    { lvl:85, xp:195, name:'Eastern Redwood Logs',img:FIREMAKING_ICON_PATH+'Eastern_Redwood_Logs.png' },
    { lvl:90, xp:210, name:'Aradias Legendary Logs',img:FIREMAKING_ICON_PATH+'Legendary_Logs.png' },
  ];

  // Main firemaking UI update function
  function renderFiremakingUI() {
    // Fill stats
    document.getElementById('fm-level').textContent = state.firemaking.level;
    document.getElementById('fire-count').textContent = state.firemaking.fires;
    document.getElementById('fm-xp').textContent = state.firemaking.xp.toFixed(1);
    document.getElementById('fm-next').textContent = state.firemaking.level < MAX_LEVEL ? nextXpFor(state.firemaking.level).toFixed(1) : '—';
    document.getElementById('gold-count-fm').textContent = state.gold;

    // Fill dropdown with all unlocked/burnable logs
    let select = document.getElementById('firemaking-log-select');
select.innerHTML = '';
let hasUnlocked = false;

FIRES.forEach(fire => {
  const qty = state.inventory[fire.name] || 0;
  if (state.firemaking.level >= fire.lvl && qty > 0) {
    hasUnlocked = true;
    let opt = document.createElement('option');
    opt.value = fire.name;
    opt.textContent = `${fire.name} (XP: ${fire.xp}) — You have: ${qty}`;
    select.appendChild(opt);
  }
});

if (!hasUnlocked) {
  select.innerHTML = '<option disabled selected>No logs to burn</option>';
  document.getElementById('light-fire-btn').disabled = true;
} else {
  document.getElementById('light-fire-btn').disabled = false;
}


  // Export to global scope
  window.renderFiremakingUI = renderFiremakingUI;

  // Button logic
  document.getElementById('light-fire-btn').onclick = async () => {
    let select = document.getElementById('firemaking-log-select');
    let logName = select.value;
    if (!logName || (state.inventory[logName]||0) <= 0) return;
    let fire = FIRES.find(f=>f.name===logName);
    if (!fire) return;

    // Animate progress
    let bar = document.getElementById('fm-progress-bar');
    let container = document.getElementById('fm-progress-container');
    let text = document.getElementById('fm-progress-text');
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
    showNotif(`You light a ${logName} (+${fire.xp} XP)`);
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
}
})();