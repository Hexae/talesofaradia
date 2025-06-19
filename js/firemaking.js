// firemaking.js

(function(){
  let TREES = window.TREES;
  let MAX_LEVEL = window.MAX_LEVEL;
  let XP_TABLE = window.XP_TABLE;
  let state = window.state;

  // Generate FIRES data based on your trees
  const FIREMAKING_ICON_PATH = "icons/firemaking/";
  let FIRES = [
    { lvl:1, img:FIREMAKING_ICON_PATH+'Logs.png', name:'Logs', xp:30 },
    { lvl:10,img:FIREMAKING_ICON_PATH+'Oak_Logs.png',    name:'Oak Logs', xp:60 },
    { lvl:20,img:FIREMAKING_ICON_PATH+'Birch_Logs.png',  name:'Birch Logs', xp:75 },
    { lvl:30,img:FIREMAKING_ICON_PATH+'Willow_Logs.png', name:'Willow Logs', xp:90 },
    { lvl:40,img:FIREMAKING_ICON_PATH+'Sakura_Logs.png', name:'Sakura Logs', xp:120 },
    { lvl:50,img:FIREMAKING_ICON_PATH+'Japanese_Maple_Logs.png', name:'Japanese Maple Logs', xp:105 },
    { lvl:60,img:FIREMAKING_ICON_PATH+'Sycamore_Maple_Logs.png', name:'Sycamore Maple Logs', xp:135 },
    { lvl:70,img:FIREMAKING_ICON_PATH+'Gigantic_Oak_Logs.png', name:'Gigantic Oak Logs', xp:150 },
    { lvl:75,img:FIREMAKING_ICON_PATH+'Palm_Logs.png',    name:'Palm Logs', xp:165 },
    { lvl:80,img:FIREMAKING_ICON_PATH+'Pitch_Pine_Logs.png', name:'Pitch Pine Logs', xp:180 },
    { lvl:85,img:FIREMAKING_ICON_PATH+'Eastern_Redwood_Logs.png', name:'Eastern Redwood Logs', xp:195 },
    { lvl:90,img:FIREMAKING_ICON_PATH+'Legendary_Logs.png', name:'Aradias Legendary Logs', xp:210 },
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
      if (state.firemaking.level >= fire.lvl && (state.inventory[fire.name] || 0) > 0) {
        hasUnlocked = true;
        let opt = document.createElement('option');
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
})();
