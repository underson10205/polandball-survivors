// Polandball Survivors - UI Controller, Co-op Lobby, Inputs & Title Diorama
(() => {
  const Data = window.PBData;
  const Renderer = window.PBRenderer;
  const Audio = window.PBAudio;
  const Storage = window.PBStorage;
  const Net = window.PBNetwork;
  const Engine = window.PBEngine;

  const $ = (id) => document.getElementById(id);

  // Selection & Lobby State
  let selectedChar = 'poland';
  let selectedStage = 'meadow';
  let selectedDifficulty = 'normal';
  let activeCodexTab = 'weapons';
  let lastRunConfig = null;

  const DEFAULT_SLOT_CHARS = ['poland', 'japan', 'usa'];

  function makeInitialSlots() {
    return {
      0: { connected: true, charId: 'poland', ready: true, shop: null },
      1: { connected: false, charId: 'japan', ready: false, shop: null },
      2: { connected: false, charId: 'usa', ready: false, shop: null }
    };
  }

  const lobby = {
    role: null, // 'host' | 'guest'
    myPid: 0,
    roomCode: '',
    slots: makeInitialSlots(),
    stageId: 'meadow',
    difficultyId: 'normal',
    connected: false
  };

  // === TITLE ANIMATED DIORAMA ===
  let titleRaf = null;
  const titleBalls = [
    { id: 'poland', x: 0.14, y: 0.25, vx: 0.04, vy: 0.02, r: 28 },
    { id: 'japan', x: 0.82, y: 0.22, vx: -0.035, vy: 0.025, r: 26 },
    { id: 'usa', x: 0.18, y: 0.78, vx: 0.03, vy: -0.02, r: 29 },
    { id: 'uk', x: 0.85, y: 0.75, vx: -0.028, vy: -0.022, r: 27 },
    { id: 'france', x: 0.5, y: 0.12, vx: 0.025, vy: 0.018, r: 24 },
    { id: 'germany', x: 0.52, y: 0.88, vx: -0.03, vy: -0.015, r: 25 },
    { id: 'nepal', x: 0.08, y: 0.52, vx: 0.042, vy: -0.012, r: 24 },
    { id: 'reichtangle', x: 0.92, y: 0.52, vx: -0.018, vy: 0.012, r: 28 }
  ];

  function startTitleDiorama() {
    const bgCanvas = $('title-bg-canvas');
    if (!bgCanvas) return;
    bgCanvas.style.display = 'block';
    const ctx = bgCanvas.getContext('2d');
    let t = 0;

    function tick() {
      if (Engine.isRunning()) {
        bgCanvas.style.display = 'none';
        titleRaf = null;
        return;
      }
      t += 0.016;
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (bgCanvas.width !== w || bgCanvas.height !== h) {
        bgCanvas.width = w;
        bgCanvas.height = h;
      }

      // Warm sunny meadow gradient
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#7dd3fc');
      g.addColorStop(0.36, '#bae6fd');
      g.addColorStop(0.37, '#74b855');
      g.addColorStop(1, '#58963e');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Drifting clouds
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      for (let i = 0; i < 5; i++) {
        const cx = ((t * (14 + i * 4) + i * 280) % (w + 220)) - 110;
        const cy = 50 + (i % 3) * 44;
        ctx.beginPath();
        ctx.arc(cx, cy, 28, 0, Math.PI * 2);
        ctx.arc(cx + 26, cy + 5, 22, 0, Math.PI * 2);
        ctx.arc(cx - 24, cy + 7, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bouncing Polandballs!
      for (let i = 0; i < titleBalls.length; i++) {
        const b = titleBalls[i];
        b.x += b.vx * 0.016;
        b.y += b.vy * 0.016;
        if (b.x < 0.05 || b.x > 0.95) b.vx *= -1;
        if (b.y < 0.1 || b.y > 0.92) b.vy *= -1;
        Renderer.drawBall(ctx, b.x * w, b.y * h, b.r, b.id, {
          mood: b.id === 'reichtangle' ? 'angry' : 'normal',
          lookX: Math.sign(b.vx),
          lookY: Math.sign(b.vy),
          time: t + i * 0.8,
          moving: true
        });
      }

      // Logo balls animate gently too!
      Renderer.renderBallToCanvas($('logo-ball-left'), 'poland', 'happy', t);
      Renderer.renderBallToCanvas($('logo-ball-right'), 'japan', 'normal', t + 1.2);

      titleRaf = requestAnimationFrame(tick);
    }

    if (!titleRaf) titleRaf = requestAnimationFrame(tick);
  }

  // === TOASTS & SCREEN SWITCHING ===
  function showToast(msg) {
    const c = $('toast-container');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity 0.3s';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 320);
    }, 3200);
  }

  let activeGearFilter = 'all';

  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = $('screen-' + name);
    if (target) target.classList.add('active');
    refreshCoins();
    if (name === 'solo') renderSoloSelect();
    if (name === 'shop') renderShop();
    if (name === 'gacha') renderGacha();
    if (name === 'codex') renderCodex();
    if (name === 'ach') renderAchievements();
    if (name === 'coop') renderCoopLobbyUI();
  }

  function refreshCoins() {
    const coins = Storage.get().coins;
    ['title-coins', 'solo-coins', 'shop-coins', 'gacha-coins', 'ach-coins'].forEach(id => {
      const el = $(id);
      if (el) el.textContent = coins.toLocaleString();
    });
  }

  // === CHARACTER & STAGE RENDERERS ===
  function renderCharGrid(container, currentId, onPick) {
    container.innerHTML = '';
    const unlocked = Storage.get().unlockedChars;
    for (const ch of Data.CHARACTERS) {
      const isUnlocked = unlocked.includes(ch.id);
      const card = document.createElement('div');
      card.className = 'char-card' + (currentId === ch.id ? ' selected' : '') + (!isUnlocked ? ' locked' : '');
      const wDef = Data.WEAPONS[ch.startWeapon];

      const cv = document.createElement('canvas');
      cv.width = 96;
      cv.height = 96;
      Renderer.renderBallToCanvas(cv, ch.id, isUnlocked ? 'normal' : 'angry', 0);

      const nameEl = document.createElement('div');
      nameEl.className = 'char-name';
      nameEl.textContent = isUnlocked ? ch.name : `🔒 ${ch.name}`;

      const wEl = document.createElement('div');
      wEl.className = 'char-weapon';
      wEl.textContent = `${wDef.icon} ${wDef.name}`;

      const pEl = document.createElement('div');
      pEl.className = 'char-passive';
      pEl.textContent = isUnlocked ? ch.passiveDesc : `ショップで ${ch.unlockCost}🪙 で解放`;

      card.append(cv, nameEl, wEl, pEl);
      card.addEventListener('click', () => {
        Audio.playSfx('click');
        if (!isUnlocked) {
          showToast(`🔒 ${ch.name}は強化ショップで ${ch.unlockCost}🪙 で解放できるよ！`);
          return;
        }
        onPick(ch.id);
      });
      container.appendChild(card);
    }
  }

  function renderStageGrid(container, currentId, editable, onPick) {
    container.innerHTML = '';
    const bestTimes = Storage.get().bestTime || {};
    for (const st of Data.STAGES) {
      const card = document.createElement('div');
      card.className = 'stage-card' + (currentId === st.id ? ' selected' : '');
      const best = bestTimes[st.id] ? `最長生存: ${formatTime(bestTimes[st.id])}` : '未挑戦';
      const finalBossDef = Data.ENEMIES[st.finalBoss];
      card.innerHTML = `
        <div class="stage-badge">${st.badge} ・ コイン ×${st.coinMult}</div>
        <div style="font-weight:900;font-size:1rem;">${st.name}</div>
        <div style="font-size:0.78rem;color:#475569;line-height:1.35;">${st.desc}</div>
        <div style="font-size:0.74rem;font-weight:900;color:#dc143c;">👑 最終ボス: ${finalBossDef?.name || ''}</div>
        <div style="font-size:0.74rem;font-weight:800;color:#b45309;">${st.bgmName || ''}</div>
        <div style="font-size:0.74rem;font-weight:800;color:#1d4ed8;margin-top:auto;">${best}</div>
      `;
      if (editable) {
        card.addEventListener('click', () => {
          Audio.playSfx('click');
          onPick(st.id);
        });
      } else {
        card.style.cursor = 'default';
      }
      container.appendChild(card);
    }
  }

  function renderDifficultyGrid(container, currentId, editable, onPick) {
    if (!container) return;
    container.innerHTML = '';
    for (const d of (Data.DIFFICULTIES || [])) {
      const card = document.createElement('div');
      card.className = 'diff-card' + (currentId === d.id ? ' selected' : '') + (d.id === 'normal' ? ' normal-diff' : '');
      card.innerHTML = `
        <div style="font-weight:900;font-size:1rem;">${d.icon} ${d.name}${currentId === d.id ? ' ✓' : ''}</div>
        <div style="font-size:0.78rem;color:#475569;line-height:1.35;">${d.desc}</div>
      `;
      if (editable) {
        card.addEventListener('click', () => {
          Audio.playSfx('click');
          onPick(d.id);
        });
      } else {
        card.style.cursor = 'default';
      }
      container.appendChild(card);
    }
  }

  function renderSoloSelect() {
    renderCharGrid($('solo-char-grid'), selectedChar, (id) => {
      selectedChar = id;
      renderSoloSelect();
    });
    renderStageGrid($('solo-stage-grid'), selectedStage, true, (id) => {
      selectedStage = id;
      renderSoloSelect();
    });
    renderDifficultyGrid($('solo-diff-grid'), selectedDifficulty, true, (id) => {
      selectedDifficulty = id;
      renderSoloSelect();
    });
  }

  // === SHOP / CODEX / ACHIEVEMENTS ===
  function renderShop() {
    const save = Storage.get();
    const upGrid = $('shop-upgrade-grid');
    upGrid.innerHTML = '';
    for (const up of Data.SHOP_UPGRADES) {
      const lv = save.shop[up.id] || 0;
      const maxed = lv >= up.maxLevel;
      const cost = up.baseCost + lv * up.costStep;
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <div class="item-top">
          <div class="item-icon">${up.icon}</div>
          <div>
            <div class="item-title">${up.name} (Lv.${lv}/${up.maxLevel})</div>
            <div class="item-desc">${up.desc}</div>
          </div>
        </div>
        <button class="btn btn-sm ${maxed ? '' : 'btn-gold'}" ${maxed || save.coins < cost ? 'disabled' : ''}>
          ${maxed ? '★ MAX' : `🪙 ${cost} で強化`}
        </button>
      `;
      const btn = card.querySelector('button');
      if (!maxed) {
        btn.addEventListener('click', () => {
          if (Storage.buyUpgrade(up.id)) {
            Audio.playSfx('coin');
            refreshCoins();
            renderShop();
            showToast(`✨ ${up.name} が Lv.${lv + 1} になった！`);
          }
        });
      }
      upGrid.appendChild(card);
    }

    const charGrid = $('shop-char-grid');
    charGrid.innerHTML = '';
    for (const ch of Data.CHARACTERS.filter(c => c.unlockCost > 0)) {
      const owned = save.unlockedChars.includes(ch.id);
      const card = document.createElement('div');
      card.className = 'item-card';
      const top = document.createElement('div');
      top.className = 'item-top';
      const cv = document.createElement('canvas');
      cv.width = 64; cv.height = 64;
      cv.style.width = '52px'; cv.style.height = '52px';
      Renderer.renderBallToCanvas(cv, ch.id, 'normal', 0);
      const info = document.createElement('div');
      info.innerHTML = `
        <div class="item-title">${ch.name} (${ch.en})</div>
        <div class="item-desc">${ch.tagline}<br/>${ch.passiveDesc}</div>
      `;
      top.append(cv, info);
      const btn = document.createElement('button');
      btn.className = 'btn btn-sm ' + (owned ? '' : 'btn-primary');
      btn.disabled = owned || save.coins < ch.unlockCost;
      btn.textContent = owned ? '✅ 解放済み' : `🪙 ${ch.unlockCost} で解放！`;
      if (!owned) {
        btn.addEventListener('click', () => {
          if (Storage.unlockCharacter(ch.id)) {
            Audio.playSfx('evolve');
            refreshCoins();
            renderShop();
            showToast(`🎉 新キャラ「${ch.name}」を解放した！`);
          }
        });
      }
      card.append(top, btn);
      charGrid.appendChild(card);
    }
  }

  // === GACHA & EQUIPMENT ===
  function formatGearBonusChips(g) {
    const chips = [];
    if (g.mightMult > 0) chips.push(`⚔️ 攻撃力 +${Math.round(g.mightMult * 100)}%`);
    if (g.amountFlat > 0) chips.push(`🎯 球数 +${g.amountFlat}`);
    if (g.areaBonus > 0) chips.push(`💥 攻撃範囲 +${Math.round(g.areaBonus * 100)}%`);
    if (g.cooldownMult < 0) chips.push(`⚡ CD -${Math.round(-g.cooldownMult * 100)}%`);
    if (g.rangedCut >= 1.0) chips.push(`🛡️ 遠距離攻撃 完全無効！`);
    else if (g.rangedCut > 0) chips.push(`🛡️ 遠距離ダメ -${Math.round(g.rangedCut * 100)}%`);
    if (g.maxHpFlat > 0) chips.push(`❤️ 最大HP +${g.maxHpFlat}`);
    if (g.armorFlat > 0) chips.push(`🧱 アーマー +${g.armorFlat}`);
    if (g.speedMult > 0) chips.push(`👟 移動速度 +${Math.round(g.speedMult * 100)}%`);
    if (g.regenFlat > 0) chips.push(`💚 HP回復 +${g.regenFlat.toFixed(1)}/秒`);
    if (g.critBonus > 0) chips.push(`💢 会心率 +${Math.round(g.critBonus * 100)}%`);
    if (g.magnetMult > 0) chips.push(`🧲 回収範囲 +${Math.round(g.magnetMult * 100)}%`);
    if (g.xpBonus > 0) chips.push(`📘 経験値 +${Math.round(g.xpBonus * 100)}%`);
    if (g.revives > 0) chips.push(`✨ 自動復活 +${g.revives}回`);
    return chips;
  }

  function formatGearStatsDesc(item, plus) {
    if (!plus || plus <= 0) return item.desc;
    const eff = Storage.getEffectiveGearStats(item, plus);
    const parts = [];
    if (eff.rangedCut >= 1.0) parts.push('【遠距離攻撃 完全無効！】');
    else if (eff.rangedCut > 0) parts.push(`遠距離ダメ -${Math.round(eff.rangedCut * 100)}%`);
    if (eff.mightMult > 0) parts.push(`攻撃力 +${Math.round(eff.mightMult * 100)}%`);
    if (eff.amountFlat > 0) parts.push(`球数 +${eff.amountFlat}`);
    if (eff.areaBonus > 0) parts.push(`範囲 +${Math.round(eff.areaBonus * 100)}%`);
    if (eff.cooldownMult < 0) parts.push(`CD -${Math.round(-eff.cooldownMult * 100)}%`);
    if (eff.maxHpFlat > 0) parts.push(`最大HP +${eff.maxHpFlat}`);
    if (eff.armorFlat > 0) parts.push(`アーマー +${eff.armorFlat}`);
    if (eff.speedMult > 0) parts.push(`速度 +${Math.round(eff.speedMult * 100)}%`);
    if (eff.regenFlat > 0) parts.push(`回復 +${eff.regenFlat.toFixed(2).replace(/0$/, '')}/秒`);
    if (eff.critBonus > 0) parts.push(`会心率 +${Math.round(eff.critBonus * 100)}%`);
    if (eff.magnetMult > 0) parts.push(`回収 +${Math.round(eff.magnetMult * 100)}%`);
    if (eff.xpBonus > 0) parts.push(`経験値 +${Math.round(eff.xpBonus * 100)}%`);
    if (eff.revives > 0) parts.push(`自動復活 +${eff.revives}回`);
    return parts.join(' / ');
  }

  function renderGacha() {
    const save = Storage.get();
    const cfg = Data.GACHA_CONFIG || { singleCost: 500, tenCost: 4500, pityLimit: 30 };
    const rarities = Data.GEAR_RARITIES || {};
    const items = Data.GEAR_ITEMS || [];
    const slots = Data.GEAR_SLOTS || [];
    const gearPlus = save.gearPlus || {};

    refreshCoins();

    const btn1 = $('btn-gacha-1');
    const btn10 = $('btn-gacha-10');
    if (btn1) btn1.disabled = save.coins < cfg.singleCost;
    if (btn10) btn10.disabled = save.coins < cfg.tenCost;

    const pityLeft = Math.max(1, cfg.pityLimit - (save.gachaPity || 0));
    const pityEl = $('gacha-pity-info');
    if (pityEl) {
      pityEl.textContent = `通常: コモン54% / アンコモン30% / レア10% / エピック5% / レジェンド1%（ダブりで +1 強化！）｜🌟 30回天井（レア50%・エピック35%・レジェンド15%）まであと ${pityLeft}回！`;
    }

    // 1. Equipped 4 Slots (Head / Body / Shield / Weapon)
    const slotsEl = $('gacha-equip-slots');
    if (slotsEl) {
      slotsEl.innerHTML = '';
      for (const sl of slots) {
        const eqId = save.equipped?.[sl.id];
        const eqItem = eqId ? items.find(it => it.id === eqId) : null;
        const rar = eqItem ? rarities[eqItem.rarity] : null;
        const plus = eqItem ? (gearPlus[eqItem.id] || 0) : 0;
        const card = document.createElement('div');
        card.className = 'equip-slot-card' + (eqItem ? ` rarity-${eqItem.rarity}` : '');
        if (eqItem && rar) {
          card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;gap:4px;">
              <span style="font-size:0.75rem;font-weight:900;color:#475569;">${sl.icon} ${sl.name}</span>
              <span class="gear-rarity-pill" style="color:${rar.color};background:${rar.bg};">${rar.name}</span>
            </div>
            <div style="font-size:1.7rem;line-height:1.1;margin-top:2px;">${eqItem.icon}</div>
            <div style="font-weight:900;font-size:0.86rem;">${eqItem.name}${plus > 0 ? ` <span style="color:#dc2626;">+${plus}</span>` : ''}</div>
            <div style="font-size:0.72rem;color:#334155;line-height:1.3;">${formatGearStatsDesc(eqItem, plus)}</div>
          `;
          const unBtn = document.createElement('button');
          unBtn.className = 'btn btn-sm';
          unBtn.style.marginTop = 'auto';
          unBtn.style.padding = '3px 8px';
          unBtn.style.fontSize = '0.72rem';
          unBtn.textContent = '外す';
          unBtn.addEventListener('click', () => {
            Audio.playSfx('click');
            Storage.unequipSlot(sl.id);
            renderGacha();
          });
          card.appendChild(unBtn);
        } else {
          card.innerHTML = `
            <div style="font-size:0.75rem;font-weight:900;color:#64748b;">${sl.icon} ${sl.name}</div>
            <div style="margin:auto 0;text-align:center;color:#94a3b8;font-weight:800;font-size:0.82rem;">未装備<br/>ガチャでGET！</div>
          `;
        }
        slotsEl.appendChild(card);
      }
    }

    // 2. Total Equipped Bonus Summary Bar
    const bonusBar = $('gacha-bonus-summary');
    if (bonusBar) {
      const chips = formatGearBonusChips(Storage.getGearBonuses());
      if (chips.length === 0) {
        bonusBar.innerHTML = '<span style="color:#64748b;">装備ボーナスなし — ガチャを引いて装備をセットしよう！</span>';
      } else {
        bonusBar.innerHTML = '<span>✨ 装備合計ボーナス:</span> ' + chips.map(c => `<span class="gacha-bonus-chip">${c}</span>`).join('');
      }
    }

    // 3. Owned Inventory Grid (sorted by rarity desc -> plus desc)
    const ownedIds = save.gearOwned || [];
    const colEl = $('gacha-collection-count');
    if (colEl) colEl.textContent = `（コレクション ${ownedIds.length} / ${items.length}）`;

    const invGrid = $('gacha-inventory-grid');
    if (invGrid) {
      invGrid.innerHTML = '';
      const filtered = items
        .filter(it => ownedIds.includes(it.id) && (activeGearFilter === 'all' || it.slot === activeGearFilter))
        .sort((a, b) => {
          const rankDiff = (rarities[b.rarity]?.rank || 0) - (rarities[a.rarity]?.rank || 0);
          if (rankDiff !== 0) return rankDiff;
          return (gearPlus[b.id] || 0) - (gearPlus[a.id] || 0);
        });

      if (filtered.length === 0) {
        invGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:18px;color:#64748b;font-weight:800;">まだこの部位の装備を持っていません！上のガチャを引いてみよう🎰</div>`;
      } else {
        for (const it of filtered) {
          const rar = rarities[it.rarity];
          const slDef = slots.find(s => s.id === it.slot);
          const plus = gearPlus[it.id] || 0;
          const isEquipped = save.equipped?.[it.slot] === it.id;
          const card = document.createElement('div');
          card.className = `item-card gear-card rarity-${it.rarity}`;
          card.innerHTML = `
            <div class="item-top">
              <div class="item-icon">${it.icon}</div>
              <div>
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:2px;">
                  <span class="gear-rarity-pill" style="color:${rar.color};background:${rar.bg};">${rar.name}</span>
                  <span style="font-size:0.72rem;font-weight:900;color:#475569;">${slDef?.icon || ''} ${slDef?.name || ''}</span>
                </div>
                <div class="item-title">${it.name}${plus > 0 ? ` <span style="color:#dc2626;">+${plus}</span>` : ''}</div>
                <div class="item-desc">${formatGearStatsDesc(it, plus)}</div>
              </div>
            </div>
          `;
          const btn = document.createElement('button');
          btn.className = 'btn btn-sm ' + (isEquipped ? '' : 'btn-primary');
          btn.textContent = isEquipped ? '✅ 装備中（クリックで外す）' : '⚡ 装備する';
          btn.addEventListener('click', () => {
            Audio.playSfx('click');
            if (isEquipped) Storage.unequipSlot(it.slot);
            else Storage.equipGear(it.id);
            renderGacha();
          });
          card.appendChild(btn);
          invGrid.appendChild(card);
        }
      }
    }
  }

  function performGachaPull(times) {
    const res = Storage.rollGacha(times);
    if (!res.ok) {
      Audio.playSfx('hurt');
      showToast(`🪙 コインが足りません！（必要: ${res.cost.toLocaleString()}）`);
      return;
    }
    const hasLegend = res.pulls.some(p => p.item.rarity === 'legend');
    const hasEpic = res.pulls.some(p => p.item.rarity === 'epic');
    if (hasLegend) Audio.playSfx('victory');
    else if (hasEpic) Audio.playSfx('evolve');
    else Audio.playSfx('levelup');

    if (res.firstAch) {
      showToast(`🏆 実績解除: ${res.firstAch.name} (+${res.firstAch.reward}🪙)`);
    }

    refreshCoins();
    renderGacha();
    renderGachaResultModal(res);
  }

  function renderGachaResultModal(res) {
    const rarities = Data.GEAR_RARITIES || {};
    const slots = Data.GEAR_SLOTS || [];
    const cfg = Data.GACHA_CONFIG || { singleCost: 500, tenCost: 4500 };
    const save = Storage.get();
    const hasLegend = res.pulls.some(p => p.item.rarity === 'legend');
    const hasPity = res.pulls.some(p => p.isPity);

    $('gacha-modal-title').textContent = hasLegend
      ? '👑✨ LEGEND GET!! ガチャ大当たり！！ ✨👑'
      : (hasPity ? '🌟 天井発動！ガチャ結果！' : (res.pulls.length === 10 ? '🎰 10連ガチャ結果！' : '🎰 ガチャ結果！'));

    const grid = $('gacha-result-grid');
    grid.innerHTML = '';
    res.pulls.forEach((entry, idx) => {
      const it = entry.item;
      const rar = rarities[it.rarity];
      const slDef = slots.find(s => s.id === it.slot);
      const card = document.createElement('div');
      card.className = `gacha-pull-card rarity-${it.rarity}`;
      card.style.animationDelay = `${idx * 45}ms`;
      card.innerHTML = `
        <div style="display:flex;justify-content:center;gap:4px;align-items:center;flex-wrap:wrap;">
          <span class="gear-rarity-pill" style="color:${rar.color};background:${rar.bg};">${rar.name}</span>
          ${entry.isPity ? '<span class="gear-new-badge" style="background:#d97706;">🌟天井</span>' : ''}
          ${entry.isNew ? '<span class="gear-new-badge">NEW!</span>' : `<span class="gear-refund-badge">⬆️ +${entry.newPlus} 強化！</span>`}
        </div>
        <div style="font-size:2rem;line-height:1.1;">${it.icon}</div>
        <div style="font-size:0.72rem;font-weight:900;color:#475569;">${slDef?.icon || ''} ${slDef?.name || ''}</div>
        <div style="font-weight:900;font-size:0.84rem;line-height:1.25;">${it.name}${entry.newPlus > 0 ? ` <span style="color:#dc2626;">+${entry.newPlus}</span>` : ''}</div>
        <div style="font-size:0.7rem;color:#334155;line-height:1.3;">${formatGearStatsDesc(it, entry.newPlus)}</div>
      `;
      grid.appendChild(card);
    });

    const newCount = res.pulls.filter(p => p.isNew).length;
    const plusCount = res.pulls.length - newCount;
    $('gacha-result-summary').textContent =
      `新規GET: ${newCount}個` +
      (plusCount > 0 ? ` / ダブり強化(+1): ${plusCount}個` : '') +
      ` / のこり所持コイン: ${save.coins.toLocaleString()}🪙`;

    $('btn-gacha-again-1').disabled = save.coins < cfg.singleCost;
    $('btn-gacha-again-10').disabled = save.coins < cfg.tenCost;
    $('modal-gacha-result').classList.add('active');
  }

  function renderCodex() {
    const content = $('codex-content');
    content.innerHTML = '';
    const save = Storage.get();

    if (activeCodexTab === 'weapons') {
      for (const w of Object.values(Data.WEAPONS)) {
        const pDef = Data.PASSIVES[w.evolvePassive];
        const evolvedSeen = !!save.codex.evolved[w.id];
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
          <div class="item-top">
            <div class="item-icon">${w.icon}</div>
            <div>
              <div class="item-title">${w.name}</div>
              <div class="item-desc">${w.desc}</div>
            </div>
          </div>
          <div style="background:#fef9c3;border:2px solid #1a1d26;border-radius:10px;padding:7px 9px;font-size:0.78rem;">
            <div style="font-weight:900;color:#b45309;">🌟 進化条件（両方Lv.5 → 次のLvUPで必ず進化！）</div>
            <div>${w.icon} ${w.name} Lv.5 ＋ ${pDef.icon} ${pDef.name} Lv.5</div>
            <div style="font-weight:900;margin-top:2px;">→ ${w.evolvedIcon} ${w.evolvedName} ${evolvedSeen ? '✅' : ''}</div>
          </div>
        `;
        content.appendChild(card);
      }
    } else if (activeCodexTab === 'chars') {
      for (const ch of Data.CHARACTERS) {
        const card = document.createElement('div');
        card.className = 'item-card';
        const top = document.createElement('div');
        top.className = 'item-top';
        const cv = document.createElement('canvas');
        cv.width = 72; cv.height = 72;
        cv.style.width = '58px'; cv.style.height = '58px';
        Renderer.renderBallToCanvas(cv, ch.id, 'normal', 0);
        const info = document.createElement('div');
        info.innerHTML = `
          <div class="item-title">${ch.name} (${ch.en})</div>
          <div class="item-desc">${ch.lore}</div>
          <div style="font-size:0.76rem;font-weight:800;color:#1d4ed8;margin-top:4px;">${ch.passiveDesc}</div>
        `;
        top.append(cv, info);
        card.appendChild(top);
        content.appendChild(card);
      }
    } else {
      for (const en of Object.values(Data.ENEMIES)) {
        const kills = save.codex.enemies[en.id] || 0;
        const card = document.createElement('div');
        card.className = 'item-card';
        const top = document.createElement('div');
        top.className = 'item-top';
        const cv = document.createElement('canvas');
        cv.width = 72; cv.height = 72;
        cv.style.width = '58px'; cv.style.height = '58px';
        Renderer.renderBallToCanvas(cv, en.id, 'angry', 0);
        const info = document.createElement('div');
        info.innerHTML = `
          ${en.stageTag ? `<div style="font-size:0.7rem;font-weight:900;color:#b45309;">${en.stageTag}</div>` : ''}
          <div class="item-title">${en.isBoss ? '👑 ' : ''}${en.name}</div>
          <div class="item-desc">${en.desc}</div>
          <div style="font-size:0.76rem;font-weight:900;color:#dc143c;margin-top:4px;">撃破数: ${kills.toLocaleString()}体</div>
        `;
        top.append(cv, info);
        card.appendChild(top);
        content.appendChild(card);
      }
    }
  }

  function renderAchievements() {
    const grid = $('ach-grid');
    grid.innerHTML = '';
    const unlocked = Storage.get().achievements;
    for (const a of Data.ACHIEVEMENTS) {
      const done = !!unlocked[a.id];
      const card = document.createElement('div');
      card.className = 'item-card';
      card.style.background = done ? '#dcfce7' : '#f1f5f9';
      card.innerHTML = `
        <div class="item-top">
          <div class="item-icon">${done ? a.icon : '🔒'}</div>
          <div>
            <div class="item-title">${a.name}</div>
            <div class="item-desc">${a.desc}</div>
          </div>
        </div>
        <div style="font-size:0.8rem;font-weight:900;color:${done ? '#15803d' : '#64748b'};">
          ${done ? `✅ 達成済み！（+${a.reward}🪙 獲得済）` : `報酬: 🪙 ${a.reward}`}
        </div>
      `;
      grid.appendChild(card);
    }
  }

  // === 2P CO-OP LOBBY & QR ===
  function renderQrCode(url) {
    const box = $('qr-box');
    box.innerHTML = '';
    if (typeof window.qrcode === 'function') {
      try {
        const qr = window.qrcode(0, 'M');
        qr.addData(url);
        qr.make();
        box.innerHTML = qr.createImgTag(4, 4);
        return;
      } catch {}
    }
    box.innerHTML = '<div style="font-size:0.75rem;color:#475569;padding:12px;">URLをコピーして共有してね！</div>';
  }

  function getInviteUrl(code) {
    try {
      const u = new URL(window.location.href);
      u.searchParams.set('room', code);
      return u.toString();
    } catch {
      return `?room=${code}`;
    }
  }

  function setCoopStatus(msg, ok = false) {
    const el = $('coop-status');
    el.textContent = msg;
    el.className = 'status-banner' + (ok ? ' ok' : '');
  }

  function renderCoopLobbyUI() {
    const inRoom = !!lobby.role;
    $('coop-entry').style.display = inRoom ? 'none' : 'grid';
    $('coop-lobby').style.display = inRoom ? 'flex' : 'none';
    if (!inRoom) return;

    $('host-share-box').style.display = lobby.role === 'host' ? 'flex' : 'none';
    $('display-room-code').textContent = lobby.roomCode;

    // Render all 3 player slots (1P Host, 2P Guest, 3P Guest)
    for (let pid = 0; pid < 3; pid++) {
      const sl = lobby.slots[pid];
      const idx = pid + 1;
      const nameEl = $(`lobby-p${idx}-name`);
      const stateEl = $(`lobby-p${idx}-state`);
      const cv = $(`lobby-p${idx}-canvas`);
      if (!nameEl || !stateEl || !cv) continue;

      if (sl && sl.connected) {
        const def = Data.CHARACTERS.find(c => c.id === sl.charId) || Data.CHARACTERS[pid];
        const youTag = lobby.myPid === pid ? ' (あなた)' : '';
        nameEl.textContent = def.name + youTag;
        if (pid === 0) {
          stateEl.textContent = '✅ 準備OK！';
          stateEl.style.color = '#16a34a';
        } else {
          stateEl.textContent = sl.ready ? '✅ 準備OK！' : 'キャラ選択中…';
          stateEl.style.color = sl.ready ? '#16a34a' : '#d97706';
        }
        Renderer.renderBallToCanvas(cv, def.id, sl.ready ? 'happy' : 'normal', 0);
      } else {
        nameEl.textContent = '参加待ち…';
        stateEl.textContent = pid === 2 ? '任意（2人でも出撃OK）' : '未接続';
        stateEl.style.color = '#64748b';
        const cctx = cv.getContext('2d');
        cctx.clearRect(0, 0, cv.width, cv.height);
      }
    }

    const mySlot = lobby.slots[lobby.myPid] || lobby.slots[0];
    renderCharGrid($('coop-char-grid'), mySlot.charId, (id) => {
      mySlot.charId = id;
      if (lobby.role === 'host') {
        sendLobbyState();
      } else {
        Net.send('lobby_guest', { charId: id, ready: mySlot.ready, shop: Storage.getShopBonuses() });
      }
      renderCoopLobbyUI();
    });

    renderStageGrid($('coop-stage-grid'), lobby.stageId, lobby.role === 'host', (id) => {
      lobby.stageId = id;
      sendLobbyState();
      renderCoopLobbyUI();
    });

    renderDifficultyGrid($('coop-diff-grid'), lobby.difficultyId, lobby.role === 'host', (id) => {
      lobby.difficultyId = id;
      sendLobbyState();
      renderCoopLobbyUI();
    });

    if (lobby.role === 'host') {
      const connectedGuests = [1, 2].filter(pid => lobby.slots[pid].connected);
      const totalCount = 1 + connectedGuests.length;
      const allReady = connectedGuests.length > 0 && connectedGuests.every(pid => lobby.slots[pid].ready);
      $('btn-start-coop').style.display = 'inline-flex';
      $('btn-guest-ready').style.display = 'none';
      $('btn-start-coop').disabled = connectedGuests.length === 0;
      $('btn-start-coop').textContent = connectedGuests.length === 0
        ? '2P・3Pの参加待ち…'
        : (allReady ? `🚀 ${totalCount}人で出撃する！` : `🚀 ${totalCount}人で出撃する！(準備中あり)`);
    } else {
      $('btn-start-coop').style.display = 'none';
      $('btn-guest-ready').style.display = 'inline-flex';
      $('btn-guest-ready').textContent = mySlot.ready ? '✅ 準備OK！（解除する）' : '✅ 準備OKにする';
    }
  }

  function sendLobbyState() {
    if (lobby.role === 'host' && Net.isConnected()) {
      Net.send('lobby_state', {
        slots: {
          0: { connected: true, charId: lobby.slots[0].charId, ready: true },
          1: { connected: lobby.slots[1].connected, charId: lobby.slots[1].charId, ready: lobby.slots[1].ready },
          2: { connected: lobby.slots[2].connected, charId: lobby.slots[2].charId, ready: lobby.slots[2].ready }
        },
        stageId: lobby.stageId,
        difficultyId: lobby.difficultyId
      });
    }
  }

  // Bind Network Events (2P & 3P Star Topology!)
  Net.on('status', (msg, ok) => setCoopStatus(msg, ok));
  Net.on('error', (err) => showToast(err));

  Net.on('connected', (pid) => {
    lobby.connected = true;
    Audio.playSfx('revive');
    if (lobby.role === 'host') {
      const slot = lobby.slots[pid];
      if (slot) {
        slot.connected = true;
        slot.ready = false;
        slot.charId = DEFAULT_SLOT_CHARS[pid] || 'japan';
      }
      sendLobbyState();
      showToast(`🤝 ${pid + 1}Pがルームに参加しました！`);
    } else {
      lobby.myPid = pid || Net.getMyPid() || 1;
      const fallbackChar = DEFAULT_SLOT_CHARS[lobby.myPid] || 'japan';
      const chosen = (selectedChar === 'poland' || (lobby.myPid === 2 && selectedChar === 'japan')) ? fallbackChar : selectedChar;
      lobby.slots[0].connected = true;
      lobby.slots[lobby.myPid].connected = true;
      lobby.slots[lobby.myPid].charId = chosen;
      lobby.slots[lobby.myPid].ready = false;
      Net.send('lobby_guest', { charId: chosen, ready: false, shop: Storage.getShopBonuses() });
      showToast(`🤝 ${lobby.myPid + 1}Pとしてルームに接続しました！`);
    }
    renderCoopLobbyUI();
  });

  Net.on('disconnected', (pid) => {
    if (lobby.role === 'host') {
      if (lobby.slots[pid]) {
        lobby.slots[pid].connected = false;
        lobby.slots[pid].ready = false;
        lobby.slots[pid].shop = null;
      }
      lobby.connected = Net.isConnected();
      showToast(`⚠️ ${pid + 1}Pとの接続が切れました`);
      if (Engine.isRunning()) {
        Engine.handlePeerDisconnected(pid);
        if (!Net.isConnected()) {
          showToast('⚠️ 全ゲストとの接続が切れました');
          Engine.stop();
          exitToTitle();
        }
      } else {
        sendLobbyState();
        renderCoopLobbyUI();
      }
    } else {
      lobby.connected = false;
      showToast('⚠️ ホストとの接続が切れました');
      if (Engine.isRunning()) {
        Engine.stop();
        exitToTitle();
      } else {
        leaveCoop();
      }
    }
  });

  Net.on('message', (type, payload, fromPid) => {
    if (type === 'lobby_state' && lobby.role === 'guest') {
      if (payload.slots) {
        for (let i = 0; i < 3; i++) {
          if (payload.slots[i]) {
            lobby.slots[i].connected = !!payload.slots[i].connected;
            lobby.slots[i].charId = payload.slots[i].charId || DEFAULT_SLOT_CHARS[i];
            lobby.slots[i].ready = !!payload.slots[i].ready;
          }
        }
      }
      lobby.stageId = payload.stageId || 'meadow';
      lobby.difficultyId = payload.difficultyId || 'normal';
      renderCoopLobbyUI();
      return;
    }
    if (type === 'lobby_guest' && lobby.role === 'host') {
      const slot = lobby.slots[fromPid];
      if (slot) {
        slot.connected = true;
        slot.charId = payload.charId || DEFAULT_SLOT_CHARS[fromPid];
        slot.ready = !!payload.ready;
        slot.shop = payload.shop || null;
      }
      sendLobbyState();
      renderCoopLobbyUI();
      return;
    }
    if (type === 'start_game' && lobby.role === 'guest') {
      launchMatch({
        mode: 'coop_guest',
        myPid: lobby.myPid,
        stageId: payload.stageId,
        difficultyId: payload.difficultyId || 'normal',
        players: payload.players
      });
      return;
    }
    // Forward in-game packets to Engine
    Engine.handleNetMessage(type, payload, fromPid);
  });

  // === LAUNCH MATCH & HUD ===
  function launchMatch(cfg) {
    lastRunConfig = cfg;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
    $('title-bg-canvas').style.display = 'none';
    $('hud').classList.add('active');

    // Co-op emote bar
    const emoteEl = $('hud-emotes');
    emoteEl.innerHTML = '';
    if (cfg.mode !== 'solo') {
      emoteEl.classList.add('active');
      for (const em of Data.EMOTES) {
        const b = document.createElement('button');
        b.className = 'emote-btn';
        b.textContent = `${em.icon} ${em.label}`;
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          Engine.sendEmote(em.id);
        });
        emoteEl.appendChild(b);
      }
    } else {
      emoteEl.classList.remove('active');
    }

    const hudDiff = $('hud-diff');
    if (hudDiff) hudDiff.style.display = (cfg.difficultyId === 'easy') ? 'inline-block' : 'none';

    Engine.start(cfg);
  }

  function exitToTitle() {
    Engine.stop();
    $('hud').classList.remove('active');
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
    $('joystick-visual').style.display = 'none';
    if (lobby.role) {
      Net.disconnect();
      lobby.role = null;
      lobby.myPid = 0;
      lobby.connected = false;
      lobby.slots = makeInitialSlots();
    }
    showScreen('title');
    startTitleDiorama();
  }

  function formatTime(sec) {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  }

  // === ENGINE CALLBACKS ===
  Engine.init($('game-canvas'), {
    onHudUpdate(h) {
      const pct = Math.min(100, (h.xp / Math.max(1, h.xpNeed)) * 100);
      $('hud-xp-fill').style.width = pct + '%';
      $('hud-timer').textContent = formatTime(h.time);
      $('hud-level').textContent = h.level;
      $('hud-kills').textContent = h.kills;
      $('hud-coins').textContent = h.coins;

      // Up to 3 Player HP Cards (1P / 2P / 3P)
      const isMulti = h.players.length >= 2;
      for (let slotIdx = 0; slotIdx < 3; slotIdx++) {
        const card = $(`hud-p${slotIdx + 1}-card`);
        const pl = h.players[slotIdx];
        if (!card) continue;
        if (pl) {
          card.style.display = 'flex';
          const statusIcon = pl.disconnected ? ' 📡' : (pl.downed ? ' 🆘' : (pl.synergy ? ' 🤝' : ''));
          $(`hud-p${slotIdx + 1}-name`).textContent = `${isMulti ? `${pl.pid + 1}P ` : ''}${pl.name}${statusIcon}`;
          $(`hud-p${slotIdx + 1}-hp`).textContent = pl.disconnected ? '切断' : `${pl.hp}/${pl.maxHp}`;
          $(`hud-p${slotIdx + 1}-hp-fill`).style.width = `${Math.max(0, (pl.hp / Math.max(1, pl.maxHp)) * 100)}%`;
        } else {
          card.style.display = 'none';
        }
      }

      // Local player's loadout icons (update DOM only when changed)
      const me = h.players.find(p => p.pid === h.myPid) || h.players[0];
      if (me) {
        const lo = $('hud-loadout');
        let html = '';
        for (const w of me.weapons) {
          const def = Data.WEAPONS[w.id];
          html += `<span class="slot-badge ${w.evolved ? 'evolved' : ''}">${w.evolved ? def.evolvedIcon : def.icon}${w.evolved ? '★' : w.level}</span>`;
        }
        for (const [pid, lv] of Object.entries(me.passives || {})) {
          const pd = Data.PASSIVES[pid];
          if (pd && lv > 0) html += `<span class="slot-badge">${pd.icon}${lv}</span>`;
        }
        if (lo.dataset.lastHtml !== html) {
          lo.dataset.lastHtml = html;
          lo.innerHTML = html;
        }

        const dashBtn = $('btn-dash');
        const dashHtml = me.dashCd > 0.05
          ? `<span>⏳</span><span>${me.dashCd.toFixed(1)}s</span>`
          : '<span>⚡</span><span>DASH</span>';
        if (dashBtn.dataset.lastHtml !== dashHtml) {
          dashBtn.dataset.lastHtml = dashHtml;
          dashBtn.classList.toggle('cooling', me.dashCd > 0.05);
          dashBtn.innerHTML = dashHtml;
        }
      }

      // Boss Bar
      const bb = $('hud-boss-bar');
      if (h.boss) {
        bb.classList.add('active');
        $('hud-boss-name').textContent = `👑 ${h.boss.name} (${h.boss.hp} / ${h.boss.maxHp})`;
        $('hud-boss-fill').style.width = `${Math.max(0, (h.boss.hp / Math.max(1, h.boss.maxHp)) * 100)}%`;
      } else {
        bb.classList.remove('active');
      }
    },

    onLevelUpOpen(choices, level, playerCount) {
      $('lvl-num').textContent = level;
      const isCoop = typeof playerCount === 'number' ? playerCount >= 2 : !!playerCount;
      const n = typeof playerCount === 'number' ? playerCount : 2;
      $('lvl-subtitle').textContent = isCoop
        ? `${n}人同時に選択中！（仲間が取った能力は重複出現しません✨）`
        : '好きな強化を1つ選んでね！ (キー 1/2/3 でも選択可)';
      $('lvl-wait-banner').style.display = 'none';
      const grid = $('upgrade-grid');
      grid.innerHTML = '';

      choices.forEach((ch, idx) => {
        const card = document.createElement('button');
        card.className = 'upgrade-card' + (ch.kind === 'evolve' ? ' evolve-card' : '');
        card.innerHTML = `
          <span class="upgrade-badge">${ch.badge}</span>
          <div class="upgrade-icon">${ch.icon}</div>
          <div>
            <div class="upgrade-title">${ch.title}</div>
            <div class="upgrade-desc">${ch.desc}</div>
          </div>
          ${ch.evolveHint ? `<div class="upgrade-hint">${ch.evolveHint}</div>` : ''}
        `;
        card.addEventListener('click', () => {
          grid.querySelectorAll('button').forEach(b => (b.disabled = true));
          Engine.pickLocalUpgrade(ch);
        });
        card.dataset.choiceIndex = String(idx);
        grid.appendChild(card);
      });

      $('modal-levelup').classList.add('active');
    },

    onLevelUpWait(msg) {
      const wb = $('lvl-wait-banner');
      wb.style.display = 'block';
      wb.textContent = `⏳ ${msg}`;
    },

    onLevelUpClose() {
      $('modal-levelup').classList.remove('active');
    },

    onChestOpen(rewardsByPid) {
      const list = $('chest-rewards-list');
      list.innerHTML = '';
      for (const item of rewardsByPid) {
        const row = document.createElement('div');
        row.className = 'item-card';
        row.style.background = item.reward.kind === 'evolve' ? '#fef08a' : '#fcf9ef';
        row.innerHTML = `
          <div class="item-top">
            <div class="item-icon">${item.reward.icon}</div>
            <div style="text-align:left;">
              <div class="item-title">${item.playerName}: ${item.reward.title} (${item.reward.badge})</div>
              <div class="item-desc">${item.reward.desc} ・ +${item.coins}🪙</div>
            </div>
          </div>
        `;
        list.appendChild(row);
      }
      $('modal-chest').classList.add('active');
    },

    onBossWarning(msg) {
      const el = $('boss-warning');
      el.textContent = msg;
      el.style.display = 'block';
      setTimeout(() => { el.style.display = 'none'; }, 3400);
    },

    onGameOver(summary) {
      $('modal-levelup').classList.remove('active');
      $('modal-chest').classList.remove('active');
      $('go-title').textContent = summary.victory ? `🏆 VICTORY! ${summary.finalBossName || '最終ボス'} 撃破！` : '💀 GAME OVER… また挑戦しよう！';
      $('go-title').style.color = summary.victory ? '#15803d' : '#dc143c';
      $('go-stats').innerHTML = `
        <span class="coin-pill">🗺️ ${summary.stageName}</span>
        ${summary.difficultyLabel ? `<span class="coin-pill">${summary.difficultyLabel}</span>` : ''}
        <span class="coin-pill">⏱️ ${formatTime(summary.time)}</span>
        <span class="coin-pill">⭐ Lv.${summary.level}</span>
        <span class="coin-pill">💥 撃破 ${summary.kills}</span>
        <span class="coin-pill">🪙 +${summary.coinsEarned}</span>
      `;
      const gw = $('go-weapons');
      gw.innerHTML = '';
      for (const pl of summary.players) {
        for (const w of pl.weapons) {
          const c = document.createElement('div');
          c.className = 'item-card';
          c.innerHTML = `
            <div class="item-top">
              <div class="item-icon">${w.icon}</div>
              <div>
                <div class="item-title">${summary.players.length >= 2 ? `[${pl.pid + 1}P] ` : ''}${w.name} ${w.evolved ? '★進化' : `Lv.${w.level}`}</div>
                <div class="item-desc">総ダメージ: ${w.damage.toLocaleString()}</div>
              </div>
            </div>
          `;
          gw.appendChild(c);
        }
      }
      $('btn-endless').style.display = summary.canEndless ? 'inline-flex' : 'none';
      $('btn-retry').style.display = lastRunConfig && lastRunConfig.mode === 'coop_guest' ? 'none' : 'inline-flex';
      $('modal-gameover').classList.add('active');
      refreshCoins();
    },

    onToast: showToast
  });

  // === INPUT HANDLING (KEYBOARD + FLOATING VIRTUAL JOYSTICK) ===
  const keys = new Set();
  const joy = { active: false, pointerId: null, ox: 0, oy: 0, dx: 0, dy: 0 };

  function syncInput() {
    let dx = 0;
    let dy = 0;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) dx -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) dx += 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) dy -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) dy += 1;

    if (joy.active) {
      dx = joy.dx;
      dy = joy.dy;
    }
    Engine.setLocalInput(dx, dy, false);
  }

  window.addEventListener('keydown', (e) => {
    if ($('modal-levelup').classList.contains('active')) {
      if (['Digit1', 'Digit2', 'Digit3'].includes(e.code)) {
        const idx = Number(e.code.slice(-1)) - 1;
        const btn = $('upgrade-grid').querySelector(`button[data-choice-index="${idx}"]`);
        if (btn && !btn.disabled) btn.click();
      }
      return;
    }
    if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      if (Engine.isRunning()) {
        e.preventDefault();
        Engine.triggerDash();
      }
      return;
    }
    if (e.code === 'Escape' && Engine.isRunning()) {
      togglePauseModal();
      return;
    }
    keys.add(e.code);
    syncInput();
  });

  window.addEventListener('keyup', (e) => {
    keys.delete(e.code);
    syncInput();
  });

  window.addEventListener('blur', () => {
    keys.clear();
    joy.active = false;
    joy.dx = 0; joy.dy = 0;
    $('joystick-visual').style.display = 'none';
    syncInput();
  });

  // Pointer/Touch Floating Joystick on game-canvas
  const gameCanvas = $('game-canvas');
  const joyVis = $('joystick-visual');
  const joyKnob = $('joy-knob');

  gameCanvas.addEventListener('pointerdown', (e) => {
    if (!Engine.isRunning()) return;
    Audio.ensure();
    joy.active = true;
    joy.pointerId = e.pointerId;
    joy.ox = e.clientX;
    joy.oy = e.clientY;
    joy.dx = 0;
    joy.dy = 0;
    joyVis.style.left = e.clientX + 'px';
    joyVis.style.top = e.clientY + 'px';
    joyVis.style.display = 'block';
    joyKnob.style.transform = 'translate(-50%, -50%)';
    gameCanvas.setPointerCapture(e.pointerId);
  });

  gameCanvas.addEventListener('pointermove', (e) => {
    if (!joy.active || e.pointerId !== joy.pointerId) return;
    const maxR = 46;
    const rawX = e.clientX - joy.ox;
    const rawY = e.clientY - joy.oy;
    const dist = Math.hypot(rawX, rawY);
    const clamped = Math.min(maxR, dist);
    const ang = Math.atan2(rawY, rawX);
    const kx = Math.cos(ang) * clamped;
    const ky = Math.sin(ang) * clamped;
    joyKnob.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
    joy.dx = dist > 6 ? kx / maxR : 0;
    joy.dy = dist > 6 ? ky / maxR : 0;
    syncInput();
  });

  function endJoystick(e) {
    if (!joy.active || (e && e.pointerId !== joy.pointerId)) return;
    joy.active = false;
    joy.dx = 0;
    joy.dy = 0;
    joyVis.style.display = 'none';
    syncInput();
  }

  gameCanvas.addEventListener('pointerup', endJoystick);
  gameCanvas.addEventListener('pointercancel', endJoystick);

  // === BUTTON WIRING ===
  function toggleSound() {
    Audio.ensure();
    const nextMuted = !Audio.isMuted();
    Audio.setMuted(nextMuted);
    const save = Storage.get();
    save.settings.muted = nextMuted;
    Storage.save();
    updateSoundButtons();
  }

  function updateSoundButtons() {
    const m = Audio.isMuted();
    $('btn-title-sound').textContent = m ? '🔇 音OFF' : '🔊 音ON';
    $('btn-hud-sound').textContent = m ? '🔇' : '🔊';
    $('btn-toggle-bgm').textContent = Audio.isBgmEnabled() ? '🎵 BGM: ON' : '🎵 BGM: OFF';
  }

  function togglePauseModal() {
    const modal = $('modal-pause');
    const isOpen = modal.classList.contains('active');
    if (isOpen) {
      modal.classList.remove('active');
      Engine.setPaused(false);
    } else {
      modal.classList.add('active');
      Engine.setPaused(true);
      $('pause-note').textContent = lastRunConfig?.mode === 'solo'
        ? 'ソロプレイ一時停止中'
        : '協力プレイ中は進行が止まりません（メニュー表示中）';
    }
  }

  $('btn-solo').addEventListener('click', () => { Audio.ensure(); Audio.playSfx('click'); showScreen('solo'); });
  $('btn-coop').addEventListener('click', () => { Audio.ensure(); Audio.playSfx('click'); showScreen('coop'); });
  $('btn-shop').addEventListener('click', () => { Audio.ensure(); Audio.playSfx('click'); showScreen('shop'); });
  $('btn-gacha').addEventListener('click', () => { Audio.ensure(); Audio.playSfx('click'); showScreen('gacha'); });
  $('btn-codex').addEventListener('click', () => { Audio.ensure(); Audio.playSfx('click'); showScreen('codex'); });
  $('btn-ach').addEventListener('click', () => { Audio.ensure(); Audio.playSfx('click'); showScreen('ach'); });

  const resetBtn = $('btn-reset-save');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      Audio.ensure();
      Audio.playSfx('click');
      const ok = window.confirm('セーブデータ（コイン・ショップ強化・解放キャラ・ガチャ装備・実績）をすべて初期状態にリセットしますか？\n※この操作は取り消せません');
      if (!ok) return;
      Storage.resetAll();
      selectedChar = 'poland';
      selectedStage = 'meadow';
      selectedDifficulty = 'normal';
      activeGearFilter = 'all';
      Audio.setMuted(false);
      Audio.setBgmEnabled(true);
      updateSoundButtons();
      refreshCoins();
      showToast('🗑️ セーブデータを初期状態にリセットしました！');
    });
  }

  $('btn-gacha-1').addEventListener('click', () => { Audio.ensure(); performGachaPull(1); });
  $('btn-gacha-10').addEventListener('click', () => { Audio.ensure(); performGachaPull(10); });
  $('btn-gacha-again-1').addEventListener('click', () => { Audio.ensure(); performGachaPull(1); });
  $('btn-gacha-again-10').addEventListener('click', () => { Audio.ensure(); performGachaPull(10); });
  $('btn-close-gacha-result').addEventListener('click', () => {
    Audio.playSfx('click');
    $('modal-gacha-result').classList.remove('active');
  });
  $('btn-auto-equip').addEventListener('click', () => {
    Audio.playSfx('levelup');
    if (Storage.autoEquipBest()) {
      showToast('⚡ 所持中の最強ランク装備をセットしました！');
    } else {
      showToast('✅ すでに最強の装備がセットされています！');
    }
    renderGacha();
  });
  document.querySelectorAll('[data-gear-filter]').forEach(b => {
    b.addEventListener('click', () => {
      Audio.playSfx('click');
      activeGearFilter = b.dataset.gearFilter;
      document.querySelectorAll('[data-gear-filter]').forEach(x => x.classList.toggle('active', x === b));
      renderGacha();
    });
  });

  document.querySelectorAll('[data-back]').forEach(b => {
    b.addEventListener('click', () => { Audio.playSfx('click'); showScreen(b.dataset.back); });
  });

  document.querySelectorAll('[data-codex-tab]').forEach(b => {
    b.addEventListener('click', () => {
      Audio.playSfx('click');
      activeCodexTab = b.dataset.codexTab;
      document.querySelectorAll('[data-codex-tab]').forEach(x => x.classList.toggle('active', x === b));
      renderCodex();
    });
  });

  $('btn-start-solo').addEventListener('click', () => {
    Audio.playSfx('levelup');
    launchMatch({ mode: 'solo', stageId: selectedStage, difficultyId: selectedDifficulty, p1Char: selectedChar });
  });

  // Co-op Room Actions (2P & 3P!)
  $('btn-create-room').addEventListener('click', async () => {
    Audio.ensure();
    Audio.playSfx('click');
    lobby.role = 'host';
    lobby.myPid = 0;
    lobby.slots = makeInitialSlots();
    lobby.slots[0].charId = selectedChar;
    lobby.connected = false;
    lobby.stageId = selectedStage;
    lobby.difficultyId = selectedDifficulty;
    renderCoopLobbyUI();
    const code = await Net.hostRoom();
    lobby.roomCode = code;
    renderCoopLobbyUI();
    renderQrCode(getInviteUrl(code));
  });

  $('btn-join-room').addEventListener('click', async () => {
    Audio.ensure();
    Audio.playSfx('click');
    const code = $('input-room-code').value.trim();
    if (!code) { showToast('4桁のルームコードを入力してね！'); return; }
    lobby.role = 'guest';
    lobby.myPid = 1;
    lobby.roomCode = code;
    lobby.slots = makeInitialSlots();
    lobby.connected = false;
    renderCoopLobbyUI();
    try {
      await Net.joinRoom(code);
    } catch (err) {
      lobby.role = null;
      lobby.myPid = 0;
      lobby.slots = makeInitialSlots();
      renderCoopLobbyUI();
      showToast(err.message || '接続できませんでした');
    }
  });

  $('btn-copy-url').addEventListener('click', async () => {
    const url = getInviteUrl(lobby.roomCode);
    try {
      await navigator.clipboard.writeText(url);
      showToast('📋 招待URLをコピーしました！2P・3Pの端末で開いてね');
    } catch {
      showToast(`ルームコード: ${lobby.roomCode}`);
    }
  });

  $('btn-guest-ready').addEventListener('click', () => {
    Audio.playSfx('click');
    const mySlot = lobby.slots[lobby.myPid];
    if (!mySlot) return;
    mySlot.ready = !mySlot.ready;
    Net.send('lobby_guest', { charId: mySlot.charId, ready: mySlot.ready, shop: Storage.getShopBonuses() });
    renderCoopLobbyUI();
  });

  function buildCoopPlayerSpecs() {
    const specs = [];
    for (let pid = 0; pid < 3; pid++) {
      const sl = lobby.slots[pid];
      if (!sl || !sl.connected) continue;
      specs.push({
        pid,
        charId: sl.charId || DEFAULT_SLOT_CHARS[pid],
        shop: pid === 0 ? Storage.getShopBonuses() : (sl.shop || null)
      });
    }
    return specs;
  }

  $('btn-start-coop').addEventListener('click', () => {
    if (!Net.isConnected()) return;
    Audio.playSfx('levelup');
    const players = buildCoopPlayerSpecs();
    const publicPlayers = players.map(p => ({ pid: p.pid, charId: p.charId }));
    Net.send('start_game', { stageId: lobby.stageId, difficultyId: lobby.difficultyId, players: publicPlayers });
    launchMatch({
      mode: 'coop_host',
      myPid: 0,
      stageId: lobby.stageId,
      difficultyId: lobby.difficultyId,
      players
    });
  });

  function leaveCoop() {
    Net.disconnect();
    lobby.role = null;
    lobby.myPid = 0;
    lobby.connected = false;
    lobby.slots = makeInitialSlots();
    setCoopStatus('PC・タブレット・スマホなど最大3台で同じページを開いて「部屋をつくる」または「部屋に入る」を選んでね！（能力の重複なしルール適用✨）', false);
    renderCoopLobbyUI();
  }

  $('btn-leave-room').addEventListener('click', () => { Audio.playSfx('click'); leaveCoop(); });
  $('btn-coop-back').addEventListener('click', () => { Audio.playSfx('click'); leaveCoop(); showScreen('title'); });

  // HUD & Modal buttons
  $('btn-title-sound').addEventListener('click', toggleSound);
  $('btn-hud-sound').addEventListener('click', toggleSound);
  $('btn-hud-pause').addEventListener('click', togglePauseModal);
  $('btn-resume').addEventListener('click', togglePauseModal);
  $('btn-toggle-bgm').addEventListener('click', () => {
    const next = !Audio.isBgmEnabled();
    Audio.setBgmEnabled(next);
    Storage.get().settings.bgm = next;
    Storage.save();
    updateSoundButtons();
  });
  $('btn-quit-run').addEventListener('click', exitToTitle);
  $('btn-dash').addEventListener('pointerdown', (e) => { e.stopPropagation(); Engine.triggerDash(); });
  $('btn-close-chest').addEventListener('click', () => {
    $('modal-chest').classList.remove('active');
    Engine.closeBossChest();
  });
  $('btn-endless').addEventListener('click', () => {
    $('modal-gameover').classList.remove('active');
    Engine.continueEndless();
  });
  $('btn-retry').addEventListener('click', () => {
    if (!lastRunConfig) { exitToTitle(); return; }
    if (lastRunConfig.mode === 'coop_host' && Net.isConnected()) {
      const players = buildCoopPlayerSpecs();
      const publicPlayers = players.map(p => ({ pid: p.pid, charId: p.charId }));
      const nextCfg = { mode: 'coop_host', myPid: 0, stageId: lastRunConfig.stageId, difficultyId: lastRunConfig.difficultyId || 'normal', players };
      Net.send('start_game', { stageId: nextCfg.stageId, difficultyId: nextCfg.difficultyId, players: publicPlayers });
      launchMatch(nextCfg);
      return;
    }
    launchMatch(lastRunConfig);
  });
  $('btn-go-home').addEventListener('click', exitToTitle);

  // === BOOT ===
  const savedSettings = Storage.get().settings;
  Audio.setMuted(savedSettings.muted);
  Audio.setBgmEnabled(savedSettings.bgm);
  updateSoundButtons();
  refreshCoins();
  startTitleDiorama();

  // Check if launched via QR / Invite link (?room=XXXX)
  try {
    const params = new URLSearchParams(window.location.search);
    const autoRoom = params.get('room');
    if (autoRoom) {
      showScreen('coop');
      $('input-room-code').value = autoRoom;
      setCoopStatus(`招待リンクを検出しました！ルーム「${autoRoom}」に接続します…`, false);
      setTimeout(() => $('btn-join-room').click(), 450);
    }
  } catch {}
})();
