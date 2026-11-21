// Polandball Survivors - Core Authoritative Simulation & 60FPS Renderer
window.PBEngine = (() => {
  const Data = window.PBData;
  const Renderer = window.PBRenderer;
  const Audio = window.PBAudio;
  const Storage = window.PBStorage;
  const Net = window.PBNetwork;

  const MAX_WEAPONS = 6;
  const MAX_PASSIVES = 6;
  const ENEMY_CAP = 210;
  const MAX_PROJECTILES = 160;
  const MAX_ZONES = 18;
  const MAX_PARTICLES = 90;
  const MAX_TEXTS = 24;
  const WORLD_SPAWN_MIN = 460;
  const WORLD_SPAWN_MAX = 680;
  const GRID_CELL = 110;

  let canvas = null;
  let ctx = null;
  let rafId = null;
  let lastFrameTs = 0;

  // Spatial Hash Grid (numeric keys -> zero string allocation per frame!)
  const enemyGrid = new Map();
  let zoneSprites = null;

  function gridKey(cx, cy) {
    return ((cx + 32768) << 16) | ((cy + 32768) & 0xffff);
  }

  function rebuildEnemyGrid() {
    enemyGrid.clear();
    const list = state.enemies;
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      const k = gridKey(Math.floor(e.x / GRID_CELL), Math.floor(e.y / GRID_CELL));
      let cell = enemyGrid.get(k);
      if (!cell) {
        cell = [];
        enemyGrid.set(k, cell);
      }
      cell.push(e);
    }
  }

  function forEachEnemyNear(x, y, range, fn) {
    const r = range + 48; // account for largest boss radius
    const minX = Math.floor((x - r) / GRID_CELL);
    const maxX = Math.floor((x + r) / GRID_CELL);
    const minY = Math.floor((y - r) / GRID_CELL);
    const maxY = Math.floor((y + r) / GRID_CELL);
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const cell = enemyGrid.get(gridKey(cx, cy));
        if (!cell) continue;
        for (let i = 0; i < cell.length; i++) {
          const e = cell[i];
          if (e.hp > 0 && fn(e) === false) return;
        }
      }
    }
  }

  function getZoneSprite(evolved) {
    if (!zoneSprites) {
      const make = (isEvo) => {
        const c = document.createElement('canvas');
        c.width = 128;
        c.height = 128;
        const gctx = c.getContext('2d');
        const grad = gctx.createRadialGradient(64, 64, 4, 64, 64, 62);
        if (isEvo) {
          grad.addColorStop(0, '#e0f2fe');
          grad.addColorStop(0.5, '#38bdf8');
          grad.addColorStop(1, 'rgba(37, 99, 235, 0)');
        } else {
          grad.addColorStop(0, '#fef08a');
          grad.addColorStop(0.55, '#f97316');
          grad.addColorStop(1, 'rgba(220, 38, 38, 0)');
        }
        gctx.fillStyle = grad;
        gctx.fillRect(0, 0, 128, 128);
        return c;
      };
      zoneSprites = { normal: make(false), evolved: make(true) };
    }
    return evolved ? zoneSprites.evolved : zoneSprites.normal;
  }

  function pushProjectile(pr) {
    if (state.projectiles.length >= MAX_PROJECTILES) {
      state.projectiles.shift();
    }
    state.projectiles.push(pr);
  }

  let callbacks = {
    onHudUpdate: () => {},
    onLevelUpOpen: () => {},
    onLevelUpWait: () => {},
    onLevelUpClose: () => {},
    onChestOpen: () => {},
    onGameOver: () => {},
    onBossWarning: () => {},
    onToast: () => {}
  };

  let state = null;
  let guestInterp = { enemies: new Map(), players: new Map(), lastSnap: null };
  let localInput = { dx: 0, dy: 0, dash: false };
  let guestRemoteInput = { dx: 0, dy: 0, dash: false };
  let snapAccum = 0;
  let inputSendAccum = 0;
  let hudAccum = 0;

  function init(canvasEl, cbs) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    callbacks = { ...callbacks, ...cbs };
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!canvas) return;
    // Cap DPR at 1.5 for crisp visuals without 4x Retina fill-rate stalls
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createPlayer(pid, charId, x, y, shopBonuses) {
    const def = Data.CHARACTERS.find(c => c.id === charId) || Data.CHARACTERS[0];
    const sb = shopBonuses || { mightMult: 1, maxHpFlat: 0, speedMult: 1, cooldownMult: 1, magnetMult: 1, armorFlat: 0, greedMult: 1, revives: 0 };
    const maxHp = Math.round(def.stats.maxHp + sb.maxHpFlat);
    const p = {
      pid, // 0 = 1P(Host), 1 = 2P(Guest)
      charId: def.id,
      name: def.name,
      x, y,
      vx: 0, vy: 0,
      lookX: 1, lookY: 0,
      radius: 21,
      hp: maxHp,
      maxHp,
      baseStats: { ...def.stats },
      shop: sb,
      revivesLeft: sb.revives || 0,
      weapons: [{ id: def.startWeapon, level: 1, evolved: false, cd: 0.25, damageDealt: 0 }],
      passives: {},
      invuln: 0,
      hitFlash: 0,
      dashCd: 0,
      dashTime: 0,
      dashDirX: 1,
      dashDirY: 0,
      downed: false,
      reviveProgress: 0,
      emote: null,
      emoteTimer: 0,
      orbitAngle: 0,
      orbitActiveTimer: 0,
      orbitCdTimer: 0,
      synergyActive: false
    };
    Storage.recordWeaponSeen(def.startWeapon, false);
    return p;
  }

  function getComputedStats(p) {
    let speedMult = p.shop.speedMult;
    let cooldownMult = p.shop.cooldownMult;
    let mightMult = p.shop.mightMult;
    let areaMult = 1.0;
    let magnetMult = p.shop.magnetMult;
    let xpMult = p.baseStats.xpMult;
    let maxHpBonus = 0;
    let regenBonus = 0;
    let armorBonus = p.shop.armorFlat;
    let amountBonus = 0;

    for (const [passId, lvl] of Object.entries(p.passives)) {
      const def = Data.PASSIVES[passId];
      if (!def || lvl <= 0) continue;
      if (def.stat === 'speedMult') speedMult += def.perLevel * lvl;
      if (def.stat === 'cooldownMult') cooldownMult += def.perLevel * lvl;
      if (def.stat === 'mightMult') mightMult += def.perLevel * lvl;
      if (def.stat === 'areaMult') areaMult += def.perLevel * lvl;
      if (def.stat === 'magnetMult') magnetMult += def.perLevel * lvl;
      if (def.stat === 'xpMult') xpMult += def.perLevel * lvl;
      if (def.stat === 'maxHpFlat') maxHpBonus += def.perLevel * lvl;
      if (def.stat === 'regenFlat') regenBonus += def.perLevel * lvl;
      if (def.stat === 'armorFlat') armorBonus += def.perLevel * lvl;
      if (def.stat === 'amountFlat') amountBonus += def.perLevel * lvl;
    }

    if (p.synergyActive) {
      cooldownMult *= 0.90; // +10% attack speed co-op synergy!
    }

    return {
      maxHp: Math.round(p.baseStats.maxHp + p.shop.maxHpFlat + maxHpBonus),
      speed: p.baseStats.speed * speedMult,
      might: p.baseStats.might * mightMult,
      cooldown: Math.max(0.32, p.baseStats.cooldown * cooldownMult),
      area: p.baseStats.area * areaMult,
      amount: p.baseStats.amount + amountBonus,
      armor: p.baseStats.armor + armorBonus,
      regen: p.baseStats.regen + regenBonus,
      magnet: p.baseStats.magnet * magnetMult,
      xpMult
    };
  }

  function getWeaponStats(w, pStats) {
    const def = Data.WEAPONS[w.id];
    const b = def.base;
    const lv = w.level;
    const evo = w.evolved;

    let damage = b.damage * (1 + (lv - 1) * 0.24) * (evo ? 1.85 : 1);
    let cooldown = b.cooldown * Math.pow(0.94, lv - 1) * (evo ? 0.68 : 1);
    let count = b.count + Math.floor(lv / 2.6) + (evo ? 2 : 0) + pStats.amount;
    let area = (b.area || 1) * (1 + (lv - 1) * 0.08) * (evo ? 1.45 : 1) * pStats.area;
    let speed = (b.speed || 350) * (1 + (lv - 1) * 0.04) * (evo ? 1.2 : 1);
    let pierce = (b.pierce || 1) + Math.floor((lv - 1) / 2) + (evo ? 99 : 0);
    let duration = (b.duration || 2.5) * (1 + (lv - 1) * 0.1) * (evo ? 1.6 : 1);

    if (w.id === 'katana' && lv >= 2) count = Math.max(count, 2);
    if (w.id === 'teacup' && evo) { count = Math.max(6, count); duration = 999; cooldown = 0.1; }
    if (w.id === 'roar') count = 1;

    return {
      damage: Math.round(damage * pStats.might),
      cooldown: Math.max(0.14, cooldown * pStats.cooldown),
      count: Math.min(14, Math.max(1, count)),
      area,
      speed,
      pierce,
      duration,
      knockback: (b.knockback || 90) * (evo ? 1.6 : 1)
    };
  }

  function start(config) {
    // config: { mode: 'solo'|'coop_host'|'coop_guest', stageId, p1Char, p2Char, p2Shop }
    const stage = Data.STAGES.find(s => s.id === config.stageId) || Data.STAGES[0];
    const shop1 = Storage.getShopBonuses();
    const shop2 = config.p2Shop || shop1;

    const players = [createPlayer(0, config.p1Char || 'poland', -40, 0, shop1)];
    if (config.mode === 'coop_host' || config.mode === 'coop_guest') {
      players.push(createPlayer(1, config.p2Char || 'japan', 40, 0, shop2));
    } else {
      players[0].x = 0;
    }

    state = {
      mode: config.mode,
      myPid: config.mode === 'coop_guest' ? 1 : 0,
      stage,
      running: true,
      paused: false,
      endless: false,
      victoryTriggered: false,
      ended: false,
      time: 0,
      nextEid: 1,
      players,
      enemies: [],
      projectiles: [],
      enemyBullets: [],
      zones: [],
      beams: [],
      slashes: [],
      novas: [],
      pickups: [],
      particles: [],
      texts: [],
      xp: 0,
      xpNeed: 18,
      level: 1,
      kills: 0,
      coinsEarned: 0,
      evolvedCount: 0,
      revivedPartnerCount: 0,
      spawnAccum: 0,
      midBossIndex: 0,
      finalBossSpawned: false,
      shake: 0,
      camera: { x: players[config.mode === 'coop_guest' ? 1 : 0].x, y: 0 },
      levelUp: {
        active: false,
        choicesByPid: {},
        pickedByPid: {}
      },
      chestPending: false
    };

    guestInterp = { enemies: new Map(), players: new Map(), lastSnap: null };
    localInput = { dx: 0, dy: 0, dash: false };
    guestRemoteInput = { dx: 0, dy: 0, dash: false };
    snapAccum = 0;
    inputSendAccum = 0;
    hudAccum = 0;

    // Unlock first play / co-op achievements
    const s = Storage.get();
    s.totalRuns += 1;
    Storage.save();
    tryUnlockAch('first_play');
    if (config.mode !== 'solo') tryUnlockAch('coop_play');

    Audio.ensure();
    Audio.startBgm('normal');

    if (rafId) cancelAnimationFrame(rafId);
    lastFrameTs = performance.now();
    rafId = requestAnimationFrame(loop);
    emitHud();
  }

  function stop() {
    if (state) state.running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    Audio.stopBgm();
  }

  function setPaused(p) {
    if (!state || state.mode !== 'solo') return;
    state.paused = p;
  }

  function setLocalInput(dx, dy, dash = false) {
    localInput.dx = dx;
    localInput.dy = dy;
    if (dash) localInput.dash = true;
  }

  function triggerDash() {
    localInput.dash = true;
  }

  function sendEmote(emoteId) {
    if (!state || !state.running) return;
    const def = Data.EMOTES.find(e => e.id === emoteId);
    if (!def) return;
    const text = `${def.icon} ${def.label}`;
    if (state.mode === 'coop_guest') {
      Net.send('emote', { text });
      // Show optimistically locally
      const p = state.players[1];
      if (p) { p.emote = text; p.emoteTimer = 2.6; }
      Audio.playSfx('emote');
    } else {
      const p = state.players[0];
      if (p) { p.emote = text; p.emoteTimer = 2.6; }
      Audio.playSfx('emote');
      if (state.mode === 'coop_host') Net.send('emote', { pid: 0, text });
    }
  }

  function tryUnlockAch(id) {
    const ach = Storage.unlockAchievement(id);
    if (ach) {
      callbacks.onToast(`🏆 実績解除: ${ach.name} (+${ach.reward}🪙)`);
    }
  }

  // === NETWORK MESSAGE HANDLERS ===
  function handleNetMessage(type, payload) {
    if (!state) return;

    if (state.mode === 'coop_host') {
      if (type === 'inp') {
        guestRemoteInput.dx = payload.dx || 0;
        guestRemoteInput.dy = payload.dy || 0;
        if (payload.dash) guestRemoteInput.dash = true;
      } else if (type === 'lvl_pick') {
        applyLevelChoice(1, payload.choice);
      } else if (type === 'emote') {
        const p2 = state.players[1];
        if (p2) {
          p2.emote = payload.text;
          p2.emoteTimer = 2.6;
          Audio.playSfx('emote');
        }
      }
      return;
    }

    if (state.mode === 'coop_guest') {
      if (type === 'snap') {
        applyGuestSnapshot(payload);
      } else if (type === 'fx') {
        if (payload.sfx) Audio.playSfx(payload.sfx);
        if (payload.shake) state.shake = Math.max(state.shake, payload.shake);
        if (payload.bossWarn) {
          Audio.setBgmMode('boss');
          callbacks.onBossWarning(payload.bossWarn);
        }
        if (payload.bgm) Audio.setBgmMode(payload.bgm);
        if (payload.text) {
          state.texts.push({ x: payload.x, y: payload.y, text: payload.text, color: payload.color || '#fff', life: 0.75, maxLife: 0.75, big: !!payload.big });
        }
        if (payload.burst) {
          spawnBurst(payload.x, payload.y, payload.color || '#facc15', payload.count || 10);
        }
      } else if (type === 'emote') {
        const p = state.players[payload.pid];
        if (p) { p.emote = payload.text; p.emoteTimer = 2.6; }
        Audio.playSfx('emote');
      } else if (type === 'lvl_open') {
        state.levelUp.active = true;
        Audio.playSfx('levelup');
        callbacks.onLevelUpOpen(payload.choices, payload.level, true);
      } else if (type === 'lvl_wait') {
        callbacks.onLevelUpWait(payload.msg);
      } else if (type === 'lvl_close') {
        state.levelUp.active = false;
        callbacks.onLevelUpClose();
      } else if (type === 'chest') {
        Audio.playSfx('chest');
        callbacks.onChestOpen(payload.rewards, true);
      } else if (type === 'gameover') {
        state.ended = true;
        Audio.stopBgm();
        Audio.playSfx(payload.victory ? 'victory' : 'hurt');
        if (payload.coinsEarned > 0) Storage.addCoins(payload.coinsEarned);
        callbacks.onGameOver(payload);
      }
    }
  }

  // === MAIN LOOP ===
  function loop(ts) {
    if (!state || !state.running) return;
    const rawDt = (ts - lastFrameTs) / 1000;
    lastFrameTs = ts;
    const dt = Math.min(0.05, Math.max(0.001, rawDt));

    if (state.mode === 'coop_guest') {
      updateGuest(dt);
    } else if (!state.paused && !state.ended && !state.levelUp.active && !state.chestPending) {
      updateAuthoritative(dt);
    } else {
      // Still tick shake & particles subtly if needed
      if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 25);
    }

    render();

    hudAccum += dt;
    if (hudAccum >= 0.1) {
      hudAccum = 0;
      emitHud();
    }

    rafId = requestAnimationFrame(loop);
  }

  // === AUTHORITATIVE SIMULATION (SOLO & CO-OP HOST) ===
  function updateAuthoritative(dt) {
    state.time += dt;
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 28);
    rebuildEnemyGrid();

    // 1. Co-op friendship synergy check
    if (state.players.length === 2) {
      const p0 = state.players[0];
      const p1 = state.players[1];
      const d = Math.hypot(p0.x - p1.x, p0.y - p1.y);
      const syn = !p0.downed && !p1.downed && d < 240;
      p0.synergyActive = syn;
      p1.synergyActive = syn;
    }

    // 2. Update Players
    const inputs = [localInput, guestRemoteInput];
    for (let i = 0; i < state.players.length; i++) {
      const p = state.players[i];
      const inp = inputs[i] || { dx: 0, dy: 0, dash: false };
      const stats = getComputedStats(p);
      p.maxHp = stats.maxHp;

      if (p.invuln > 0) p.invuln = Math.max(0, p.invuln - dt);
      if (p.hitFlash > 0) p.hitFlash = Math.max(0, p.hitFlash - dt * 4);
      if (p.dashCd > 0) p.dashCd = Math.max(0, p.dashCd - dt);
      if (p.emoteTimer > 0) {
        p.emoteTimer -= dt;
        if (p.emoteTimer <= 0) p.emote = null;
      }

      if (p.downed) {
        p.vx = 0; p.vy = 0;
        // Check if partner is reviving!
        const partner = state.players.find(other => other.pid !== p.pid && !other.downed);
        if (partner && Math.hypot(partner.x - p.x, partner.y - p.y) < 88) {
          p.reviveProgress += dt / 2.4;
          if (p.reviveProgress >= 1) {
            p.downed = false;
            p.reviveProgress = 0;
            p.hp = Math.round(p.maxHp * 0.55);
            p.invuln = 2.6;
            state.revivedPartnerCount++;
            tryUnlockAch('coop_revive');
            Audio.playSfx('revive');
            spawnBurst(p.x, p.y, '#fde047', 22);
            addFloatingText(p.x, p.y - 30, '✨ REVIVE!!', '#fde047', true);
            broadcastFx({ sfx: 'revive', burst: true, x: p.x, y: p.y, color: '#fde047', count: 22, text: '✨ REVIVE!!', big: true });
          }
        } else {
          p.reviveProgress = Math.max(0, p.reviveProgress - dt * 0.35);
        }
        continue;
      }

      // Natural HP regeneration
      if (stats.regen > 0 && p.hp < p.maxHp) {
        p.hp = Math.min(p.maxHp, p.hp + stats.regen * dt);
      }

      // Movement & Dash
      let mx = inp.dx || 0;
      let my = inp.dy || 0;
      const mag = Math.hypot(mx, my);
      if (mag > 0.05) {
        mx /= Math.max(1, mag);
        my /= Math.max(1, mag);
        p.lookX = mx;
        p.lookY = my;
      }

      if (inp.dash && p.dashCd <= 0) {
        p.dashCd = 2.6;
        p.dashTime = 0.18;
        p.invuln = Math.max(p.invuln, 0.28);
        p.dashDirX = mag > 0.1 ? mx : p.lookX;
        p.dashDirY = mag > 0.1 ? my : p.lookY;
        Audio.playSfx('dash');
        spawnBurst(p.x, p.y, '#38bdf8', 8);
        if (state.mode === 'coop_host') broadcastFx({ sfx: 'dash' });
      }
      inp.dash = false;

      if (p.dashTime > 0) {
        p.dashTime -= dt;
        p.vx = p.dashDirX * stats.speed * 2.85;
        p.vy = p.dashDirY * stats.speed * 2.85;
      } else {
        p.vx = mx * stats.speed;
        p.vy = my * stats.speed;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Update Weapons
      updatePlayerWeapons(p, stats, dt);
    }

    // Check total defeat (all players downed)
    if (state.players.every(p => p.downed)) {
      finishRun(false);
      return;
    }

    // 3. Camera smoothly follows local player (1P)
    const camTarget = state.players[state.myPid];
    state.camera.x += (camTarget.x - state.camera.x) * Math.min(1, dt * 9);
    state.camera.y += (camTarget.y - state.camera.y) * Math.min(1, dt * 9);

    // 4. Spawn Enemies & Bosses
    updateSpawning(dt);

    // 5. Update Enemies & Rebuild Spatial Grid for Projectile/Zone Collisions
    updateEnemies(dt);
    rebuildEnemyGrid();

    // 6. Update Projectiles, Enemy Bullets, Zones, Slashes, Beams, Novas
    updateProjectiles(dt);
    updateEnemyBullets(dt);
    updateZones(dt);
    updateVisualEffects(dt);

    // 7. Update Pickups (XP, Coins, Heal, Magnet, Chests)
    updatePickups(dt);

    // 8. Broadcast Snapshot to Guest (20 Hz — smooth with 60fps interpolation)
    if (state.mode === 'coop_host') {
      snapAccum += dt;
      if (snapAccum >= 0.05) {
        snapAccum = 0;
        broadcastSnapshot();
      }
    }
  }

  function updatePlayerWeapons(p, stats, dt) {
    for (const w of p.weapons) {
      const def = Data.WEAPONS[w.id];
      const ws = getWeaponStats(w, stats);

      // Orbit weapon handled continuously
      if (def.type === 'orbit') {
        if (w.evolved) {
          p.orbitActiveTimer = 99;
          p.orbitAngle += ws.speed * 1.35 * dt;
          checkOrbitHits(p, w, ws);
        } else {
          if (p.orbitActiveTimer > 0) {
            p.orbitActiveTimer -= dt;
            p.orbitAngle += ws.speed * dt;
            checkOrbitHits(p, w, ws);
          } else {
            p.orbitCdTimer -= dt;
            if (p.orbitCdTimer <= 0) {
              p.orbitActiveTimer = ws.duration;
              p.orbitCdTimer = Math.max(0.8, ws.cooldown - ws.duration);
            }
          }
        }
        continue;
      }

      w.cd -= dt;
      if (w.cd <= 0) {
        w.cd = ws.cooldown;
        fireWeapon(p, w, def, ws);
      }
    }
  }

  function checkOrbitHits(p, w, ws) {
    const orbitR = 78 * ws.area;
    const hitR = 24 * ws.area;
    for (let i = 0; i < ws.count; i++) {
      const a = p.orbitAngle + (i * Math.PI * 2) / ws.count;
      const ox = p.x + Math.cos(a) * orbitR;
      const oy = p.y + Math.sin(a) * orbitR;
      forEachEnemyNear(ox, oy, hitR, (e) => {
        if (e.orbitHitCd > 0) return;
        const dx = e.x - ox;
        const dy = e.y - oy;
        const sumR = hitR + e.radius;
        if (dx * dx + dy * dy < sumR * sumR) {
          e.orbitHitCd = 0.28;
          damageEnemy(e, ws.damage, p, w, ox, oy, 190);
        }
      });
    }
  }

  function findNearestEnemy(x, y, maxDist = 750) {
    let best = null;
    let bestD2 = maxDist * maxDist;
    const list = state.enemies;
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      const dx = e.x - x;
      const dy = e.y - y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestD2) { bestD2 = d2; best = e; }
    }
    return best;
  }

  function fireWeapon(p, w, def, ws) {
    const target = findNearestEnemy(p.x, p.y);
    const baseAngle = target ? Math.atan2(target.y - p.y, target.x - p.x) : Math.atan2(p.lookY, p.lookX);

    switch (def.type) {
      case 'boomerang': {
        for (let i = 0; i < ws.count; i++) {
          const spread = (i - (ws.count - 1) / 2) * 0.32;
          const a = baseAngle + spread;
          pushProjectile({
            id: state.nextEid++,
            kind: 'plunger',
            evolved: w.evolved,
            owner: p.pid,
            weapon: w,
            x: p.x, y: p.y,
            vx: Math.cos(a) * ws.speed,
            vy: Math.sin(a) * ws.speed,
            ax: -Math.cos(a) * ws.speed * 1.45,
            ay: -Math.sin(a) * ws.speed * 1.45,
            radius: 17 * ws.area,
            damage: ws.damage,
            pierce: 99,
            life: w.evolved ? 2.1 : 1.55,
            spin: 0,
            hitSet: new Map()
          });
        }
        break;
      }

      case 'slash': {
        Audio.playSfx('slash');
        const dirA = Math.atan2(p.lookY, p.lookX);
        const dirs = [];
        if (w.evolved) {
          const c = Math.min(8, Math.max(4, ws.count + 2));
          for (let i = 0; i < c; i++) dirs.push(dirA + (i * Math.PI * 2) / c);
        } else {
          dirs.push(dirA);
          if (ws.count >= 2) dirs.push(dirA + Math.PI);
          for (let i = 2; i < ws.count; i++) dirs.push(dirA + (i % 2 === 0 ? 0.55 : -0.55) * Math.ceil(i / 2));
        }
        const range = 108 * ws.area;
        const slashHitR = range * 0.72;
        for (const a of dirs) {
          const sx = p.x + Math.cos(a) * (range * 0.52);
          const sy = p.y + Math.sin(a) * (range * 0.52);
          if (state.slashes.length < 28) {
            state.slashes.push({ x: sx, y: sy, angle: a, radius: range * 0.68, evolved: w.evolved, life: 0.24, maxLife: 0.24 });
          }
          forEachEnemyNear(sx, sy, slashHitR, (e) => {
            const dx = e.x - sx;
            const dy = e.y - sy;
            const sumR = slashHitR + e.radius;
            if (dx * dx + dy * dy < sumR * sumR) {
              damageEnemy(e, ws.damage, p, w, p.x, p.y, 130);
            }
          });
        }
        break;
      }

      case 'homing': {
        for (let i = 0; i < ws.count; i++) {
          const a = baseAngle + (i - (ws.count - 1) / 2) * 0.45;
          pushProjectile({
            id: state.nextEid++,
            kind: 'missile',
            evolved: w.evolved,
            owner: p.pid,
            weapon: w,
            x: p.x, y: p.y,
            vx: Math.cos(a) * ws.speed,
            vy: Math.sin(a) * ws.speed,
            speed: ws.speed,
            radius: 13 * ws.area,
            blastRadius: 72 * ws.area,
            damage: ws.damage,
            pierce: 1,
            life: 2.6,
            retargetCd: 0,
            target: null,
            hitSet: new Map()
          });
        }
        break;
      }

      case 'arc': {
        for (let i = 0; i < ws.count; i++) {
          const spread = (i - (ws.count - 1) / 2) * 0.4;
          const a = -Math.PI / 2 + spread + (p.lookX >= 0 ? 0.35 : -0.35);
          pushProjectile({
            id: state.nextEid++,
            kind: 'baguette',
            evolved: w.evolved,
            owner: p.pid,
            weapon: w,
            x: p.x, y: p.y,
            vx: Math.cos(a) * ws.speed * 0.85,
            vy: Math.sin(a) * ws.speed * 1.1,
            gravity: w.evolved ? 0 : 620,
            spiralAngle: (i * Math.PI * 2) / ws.count,
            spiralR: 20,
            originX: p.x,
            originY: p.y,
            radius: 16 * ws.area,
            damage: ws.damage,
            pierce: ws.pierce,
            life: w.evolved ? 2.4 : 1.75,
            spin: 0,
            hitSet: new Map()
          });
        }
        break;
      }

      case 'rapid': {
        for (let i = 0; i < ws.count; i++) {
          const a = baseAngle + (i - (ws.count - 1) / 2) * 0.14;
          pushProjectile({
            id: state.nextEid++,
            kind: 'bratwurst',
            evolved: w.evolved,
            owner: p.pid,
            weapon: w,
            x: p.x + Math.cos(a) * 18,
            y: p.y + Math.sin(a) * 18,
            vx: Math.cos(a) * ws.speed,
            vy: Math.sin(a) * ws.speed,
            radius: 10 * ws.area,
            damage: ws.damage,
            pierce: ws.pierce,
            life: 1.35,
            hitSet: new Map()
          });
        }
        break;
      }

      case 'fan': {
        const total = w.evolved ? Math.min(14, Math.max(10, ws.count + 4)) : ws.count;
        const arcSpan = w.evolved ? Math.PI * 2 : Math.min(Math.PI * 0.85, 0.24 * total);
        for (let i = 0; i < total; i++) {
          const a = w.evolved
            ? (i * Math.PI * 2) / total + state.time
            : baseAngle - arcSpan / 2 + (total > 1 ? (i * arcSpan) / (total - 1) : 0);
          pushProjectile({
            id: state.nextEid++,
            kind: 'pilum',
            evolved: w.evolved,
            owner: p.pid,
            weapon: w,
            x: p.x, y: p.y,
            vx: Math.cos(a) * ws.speed,
            vy: Math.sin(a) * ws.speed,
            radius: 11 * ws.area,
            damage: ws.damage,
            pierce: ws.pierce,
            life: 1.4,
            hitSet: new Map()
          });
        }
        break;
      }

      case 'nova': {
        Audio.playSfx('roar');
        const maxR = 148 * ws.area;
        if (state.novas.length < 18) {
          state.novas.push({ x: p.x, y: p.y, radius: 18, maxRadius: maxR, evolved: w.evolved, life: 0.34, maxLife: 0.34 });
        }
        if (w.evolved) state.shake = Math.max(state.shake, 7);
        forEachEnemyNear(p.x, p.y, maxR, (e) => {
          const dx = e.x - p.x;
          const dy = e.y - p.y;
          const sumR = maxR + e.radius;
          if (dx * dx + dy * dy < sumR * sumR) {
            damageEnemy(e, ws.damage, p, w, p.x, p.y, ws.knockback);
            if (w.evolved) e.slowTimer = 2.4;
          }
        });
        break;
      }

      case 'lightning': {
        const candidates = [];
        const maxR2 = 560 * 560;
        for (let i = 0; i < state.enemies.length; i++) {
          const e = state.enemies[i];
          const dx = e.x - p.x;
          const dy = e.y - p.y;
          if (dx * dx + dy * dy < maxR2) candidates.push(e);
        }
        if (candidates.length === 0) break;
        Audio.playSfx('laser');
        for (let i = 0; i < ws.count; i++) {
          const t = candidates[Math.floor(Math.random() * candidates.length)];
          if (!t) continue;
          const hitR = (w.evolved ? 68 : 42) * ws.area;
          if (state.beams.length < 18) {
            state.beams.push({ x: t.x, y: t.y, radius: hitR, evolved: w.evolved, life: 0.28, maxLife: 0.28 });
          }
          forEachEnemyNear(t.x, t.y, hitR, (e) => {
            const dx = e.x - t.x;
            const dy = e.y - t.y;
            const sumR = hitR + e.radius;
            if (dx * dx + dy * dy < sumR * sumR) {
              damageEnemy(e, ws.damage, p, w, t.x, t.y, 40);
            }
          });
        }
        break;
      }

      case 'zone': {
        for (let i = 0; i < ws.count; i++) {
          const a = Math.random() * Math.PI * 2;
          const dist = 70 + Math.random() * 140;
          if (state.zones.length >= MAX_ZONES) state.zones.shift();
          state.zones.push({
            id: state.nextEid++,
            x: p.x + Math.cos(a) * dist,
            y: p.y + Math.sin(a) * dist,
            radius: 56 * ws.area,
            damage: ws.damage,
            evolved: w.evolved,
            owner: p.pid,
            weapon: w,
            life: ws.duration,
            maxLife: ws.duration,
            tick: 0
          });
        }
        break;
      }
    }
  }

  // === SPAWNING & WAVES ===
  function updateSpawning(dt) {
    const t = state.time;
    const diff = state.stage.difficulty * (state.players.length === 2 ? 1.42 : 1.0);
    const timeMult = 1 + t / 115;

    // Mid-bosses at 90s, 180s, 270s
    const midSchedule = [
      { at: 90, id: 'boss_viking' },
      { at: 180, id: 'boss_prussia' },
      { at: 270, id: 'boss_ufo' }
    ];
    if (state.midBossIndex < midSchedule.length && t >= midSchedule[state.midBossIndex].at) {
      const b = midSchedule[state.midBossIndex];
      state.midBossIndex++;
      spawnEnemy(b.id, diff * (1 + t / 240));
      const def = Data.ENEMIES[b.id];
      triggerBossAlert(`⚠️ 中ボス出現: ${def.name}！`);
    }

    // Final Boss Reichtangle at stage.duration (360s = 6 min)
    if (!state.finalBossSpawned && t >= state.stage.duration) {
      state.finalBossSpawned = true;
      spawnEnemy('reichtangle', diff * 1.15);
      Audio.setBgmMode('boss');
      triggerBossAlert('🚨 最終ボス襲来: ライヒタングル "Guten Tag..."');
      if (state.mode === 'coop_host') broadcastFx({ bgm: 'boss' });
    }

    // Endless extra bosses every 90s after 6 min
    if (state.endless && Math.floor(t) > state.stage.duration + 30 && Math.floor(t) % 90 === 0 && Math.floor(t - dt) % 90 !== 0) {
      spawnEnemy('reichtangle', diff * (1.2 + (t - state.stage.duration) / 180));
      triggerBossAlert('🚨 強化ライヒタングル出現！');
    }

    // Regular wave spawns
    const spawnRate = Math.min(9.5, (1.55 + t / 44) * (state.players.length === 2 ? 1.35 : 1.0));
    state.spawnAccum += dt * spawnRate;
    while (state.spawnAccum >= 1 && state.enemies.length < ENEMY_CAP) {
      state.spawnAccum -= 1;
      const pool = getWavePool(t, state.stage.id);
      const id = pool[Math.floor(Math.random() * pool.length)];
      spawnEnemy(id, diff * timeMult);
    }
  }

  function getWavePool(t, stageId) {
    if (stageId === 'space') {
      if (t < 60) return ['alien_ball', 'cameroon_ball', 'mali_ball', 'speed_ball', 'turret_ball'];
      if (t < 180) return ['alien_ball', 'cameroon_ball', 'mali_ball', 'turret_ball', 'kazakh_brick', 'speed_ball'];
      return ['alien_ball', 'cameroon_ball', 'turret_ball', 'kazakh_brick', 'viking_ball', 'speed_ball'];
    }
    if (stageId === 'sky') {
      if (t < 60) return ['pirate_ball', 'cameroon_ball', 'mali_ball', 'speed_ball', 'slime_ball'];
      if (t < 150) return ['pirate_ball', 'cameroon_ball', 'mali_ball', 'speed_ball', 'turret_ball', 'viking_ball'];
      return ['cameroon_ball', 'mali_ball', 'speed_ball', 'turret_ball', 'kazakh_brick', 'viking_ball', 'alien_ball'];
    }
    // Meadow
    if (t < 40) return ['slime_ball', 'pirate_ball', 'cameroon_ball', 'mali_ball'];
    if (t < 100) return ['slime_ball', 'pirate_ball', 'cameroon_ball', 'mali_ball', 'viking_ball', 'speed_ball'];
    if (t < 210) return ['pirate_ball', 'cameroon_ball', 'mali_ball', 'viking_ball', 'speed_ball', 'turret_ball', 'kazakh_brick'];
    return ['cameroon_ball', 'mali_ball', 'viking_ball', 'speed_ball', 'turret_ball', 'kazakh_brick', 'alien_ball'];
  }

  function spawnEnemy(id, scale = 1) {
    const def = Data.ENEMIES[id];
    if (!def) return;
    const alivePlayers = state.players.filter(p => !p.downed);
    const anchor = alivePlayers[Math.floor(Math.random() * alivePlayers.length)] || state.players[0];
    const angle = Math.random() * Math.PI * 2;
    const dist = WORLD_SPAWN_MIN + Math.random() * (WORLD_SPAWN_MAX - WORLD_SPAWN_MIN);
    const hp = Math.round(def.hp * scale);

    state.enemies.push({
      id: state.nextEid++,
      type: def.id,
      name: def.name,
      x: anchor.x + Math.cos(angle) * dist,
      y: anchor.y + Math.sin(angle) * dist,
      vx: 0, vy: 0,
      kbX: 0, kbY: 0,
      hp,
      maxHp: hp,
      speed: def.speed * (1 + Math.min(0.45, state.time / 900)),
      damage: Math.round(def.damage * (0.9 + scale * 0.15)),
      radius: def.radius,
      xp: def.xp,
      isBoss: !!def.isBoss,
      isMidBoss: !!def.isMidBoss,
      isFinalBoss: !!def.isFinalBoss,
      shooter: !!def.shooter,
      shootCd: 1.5 + Math.random() * 2,
      chargeCd: 4.5,
      chargeTime: 0,
      chargeDx: 0, chargeDy: 0,
      hitFlash: 0,
      orbitHitCd: 0,
      slowTimer: 0,
      lookX: 0, lookY: 0
    });
  }

  function triggerBossAlert(msg) {
    Audio.playSfx('boss');
    state.shake = Math.max(state.shake, 10);
    callbacks.onBossWarning(msg);
    if (state.mode === 'coop_host') {
      broadcastFx({ sfx: 'boss', shake: 10, bossWarn: msg });
    }
  }

  function updateEnemies(dt) {
    const alive = state.players.filter(p => !p.downed);
    if (alive.length === 0) return;

    const enemies = state.enemies;
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt * 5);
      if (e.orbitHitCd > 0) e.orbitHitCd -= dt;
      if (e.slowTimer > 0) e.slowTimer -= dt;

      // Nearest alive player
      let target = alive[0];
      let minDist = Math.hypot(target.x - e.x, target.y - e.y);
      for (let j = 1; j < alive.length; j++) {
        const d = Math.hypot(alive[j].x - e.x, alive[j].y - e.y);
        if (d < minDist) { minDist = d; target = alive[j]; }
      }

      // Despawn very distant regular mobs to keep action dense
      if (!e.isBoss && minDist > 1250) {
        enemies.splice(i, 1);
        continue;
      }

      const nx = minDist > 1 ? (target.x - e.x) / minDist : 0;
      const ny = minDist > 1 ? (target.y - e.y) / minDist : 0;
      e.lookX = nx;
      e.lookY = ny;

      const slowFactor = e.slowTimer > 0 ? 0.45 : 1.0;

      // Final Boss dash-charge behavior!
      if (e.isFinalBoss) {
        if (e.chargeTime > 0) {
          e.chargeTime -= dt;
          e.vx = e.chargeDx * e.speed * 3.1;
          e.vy = e.chargeDy * e.speed * 3.1;
        } else {
          e.chargeCd -= dt;
          e.vx = nx * e.speed * slowFactor;
          e.vy = ny * e.speed * slowFactor;
          if (e.chargeCd <= 0 && minDist < 480) {
            e.chargeCd = 5.2;
            e.chargeTime = 0.65;
            e.chargeDx = nx;
            e.chargeDy = ny;
            addFloatingText(e.x, e.y - 60, 'GUTEN TAG!', '#ef4444', true);
            if (state.mode === 'coop_host') broadcastFx({ text: 'GUTEN TAG!', x: e.x, y: e.y - 60, color: '#ef4444', big: true });
          }
        }
      } else if (e.shooter && !e.isBoss && minDist < 240) {
        e.vx = -nx * e.speed * 0.35;
        e.vy = -ny * e.speed * 0.35;
      } else {
        e.vx = nx * e.speed * slowFactor;
        e.vy = ny * e.speed * slowFactor;
      }

      // Shooting logic
      if (e.shooter && minDist < 540) {
        e.shootCd -= dt;
        if (e.shootCd <= 0) {
          const baseA = Math.atan2(target.y - e.y, target.x - e.x);
          if (e.isFinalBoss) {
            e.shootCd = 2.6;
            for (let k = 0; k < 10; k++) {
              const a = baseA + (k * Math.PI * 2) / 10;
              state.enemyBullets.push({ x: e.x, y: e.y, vx: Math.cos(a) * 235, vy: Math.sin(a) * 235, r: 9, damage: Math.round(e.damage * 0.7), life: 3.4, color: '#ef4444' });
            }
          } else if (e.isBoss) {
            e.shootCd = 2.4;
            for (let k = -2; k <= 2; k++) {
              const a = baseA + k * 0.28;
              state.enemyBullets.push({ x: e.x, y: e.y, vx: Math.cos(a) * 215, vy: Math.sin(a) * 215, r: 8, damage: Math.round(e.damage * 0.65), life: 3.2, color: '#f97316' });
            }
          } else {
            e.shootCd = 2.9;
            state.enemyBullets.push({ x: e.x, y: e.y, vx: Math.cos(baseA) * 195, vy: Math.sin(baseA) * 195, r: 6.5, damage: e.damage, life: 2.8, color: '#facc15' });
          }
        }
      }

      // Apply knockback decay
      e.x += (e.vx + e.kbX) * dt;
      e.y += (e.vy + e.kbY) * dt;
      e.kbX *= Math.pow(0.05, dt);
      e.kbY *= Math.pow(0.05, dt);

      // Soft separation against neighbors (lightweight O(N) sample)
      if (i > 0) {
        const other = enemies[(i * 7 + 3) % enemies.length];
        if (other && other !== e) {
          const dx = e.x - other.x;
          const dy = e.y - other.y;
          const minSep = e.radius + other.radius;
          const d2 = dx * dx + dy * dy;
          if (d2 > 0.1 && d2 < minSep * minSep) {
            const d = Math.sqrt(d2);
            const push = (minSep - d) * 0.35;
            e.x += (dx / d) * push;
            e.y += (dy / d) * push;
          }
        }
      }

      // Collision with players
      for (const p of alive) {
        const d = Math.hypot(p.x - e.x, p.y - e.y);
        if (d < p.radius + e.radius - 3) {
          damagePlayer(p, e.damage);
        }
      }
    }
  }

  function damagePlayer(p, rawDamage) {
    if (p.invuln > 0 || p.downed) return;
    const stats = getComputedStats(p);
    const dmg = Math.max(1, Math.round(rawDamage - stats.armor));
    p.hp -= dmg;
    p.invuln = 0.55;
    p.hitFlash = 1.0;
    state.shake = Math.max(state.shake, 6);
    Audio.playSfx('hurt');
    addFloatingText(p.x, p.y - 24, `-${dmg}`, '#fb7185', false);
    if (state.mode === 'coop_host') broadcastFx({ sfx: 'hurt', shake: 5 });

    if (p.hp <= 0) {
      if (p.revivesLeft > 0) {
        p.revivesLeft--;
        p.hp = Math.round(p.maxHp * 0.65);
        p.invuln = 2.6;
        Audio.playSfx('revive');
        spawnBurst(p.x, p.y, '#fde047', 24);
        addFloatingText(p.x, p.y - 34, '✨ 不屈の復活!!', '#fde047', true);
        // Push away nearby enemies
        for (const e of state.enemies) {
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < 220 && d > 1) {
            e.kbX += ((e.x - p.x) / d) * 420;
            e.kbY += ((e.y - p.y) / d) * 420;
          }
        }
      } else {
        p.hp = 0;
        p.downed = true;
        p.reviveProgress = 0;
        if (state.players.length === 2) {
          p.emote = '🆘 蘇生して！';
          p.emoteTimer = 999;
        }
      }
    }
  }

  function damageEnemy(e, dmg, player, weapon, srcX, srcY, kbForce = 80) {
    if (e.hp <= 0) return;
    const isCrit = Math.random() < 0.14;
    const finalDmg = Math.round(dmg * (isCrit ? 1.55 : 1));
    e.hp -= finalDmg;
    e.hitFlash = 0.9;
    if (weapon) weapon.damageDealt += finalDmg;

    // Knockback
    const resist = e.isBoss ? 0.08 : (e.type === 'kazakh_brick' ? 0.25 : 1.0);
    const dx = e.x - srcX;
    const dy = e.y - srcY;
    const d = Math.hypot(dx, dy) || 1;
    e.kbX += (dx / d) * kbForce * resist;
    e.kbY += (dy / d) * kbForce * resist;

    if (state.texts.length < 45) {
      addFloatingText(e.x + (Math.random() - 0.5) * 14, e.y - e.radius, `${finalDmg}`, isCrit ? '#fde047' : '#ffffff', isCrit);
    }

    if (e.hp <= 0) {
      killEnemy(e);
    } else if (Math.random() < 0.25) {
      Audio.playSfx('hit');
    }
  }

  function killEnemy(e) {
    const idx = state.enemies.indexOf(e);
    if (idx !== -1) state.enemies.splice(idx, 1);

    state.kills++;
    Storage.recordEnemyKill(e.type);
    const save = Storage.get();
    save.totalKills++;
    if (save.totalKills >= 100) tryUnlockAch('kills_100');
    if (save.totalKills >= 1000) tryUnlockAch('kills_1000');

    spawnBurst(e.x, e.y, e.isBoss ? '#facc15' : '#f8fafc', e.isBoss ? 32 : 7);
    Audio.playSfx(e.isBoss ? 'explosion' : 'kill');

    // Drop XP gem
    state.pickups.push({
      id: state.nextEid++,
      kind: 'xp',
      x: e.x, y: e.y,
      val: e.xp,
      tier: e.xp >= 15 ? 2 : (e.xp >= 7 ? 1 : 0)
    });

    // Drop random goodies
    if (e.isMidBoss) {
      state.pickups.push({ id: state.nextEid++, kind: 'chest', x: e.x + 12, y: e.y, val: 1 });
      addFloatingText(e.x, e.y - 30, '🎁 進化宝箱ドロップ！', '#fde047', true);
      if (state.mode === 'coop_host') broadcastFx({ sfx: 'explosion', burst: true, x: e.x, y: e.y, color: '#facc15', count: 28, text: '🎁 進化宝箱ドロップ！', big: true });
    } else if (e.isFinalBoss) {
      state.pickups.push({ id: state.nextEid++, kind: 'chest', x: e.x, y: e.y, val: 1 });
      tryUnlockAch('defeat_reichtangle');
      if (state.stage.id === 'space' && state.players.some(p => p.charId === 'poland')) {
        tryUnlockAch('poland_space');
      }
      if (!state.victoryTriggered) {
        state.victoryTriggered = true;
        finishRun(true);
      }
    } else {
      const r = Math.random();
      if (e.type === 'mali_ball' && r < 0.38) {
        state.pickups.push({ id: state.nextEid++, kind: 'coin', x: e.x + 8, y: e.y + 4, val: Math.round(9 * state.stage.coinMult) });
      } else if (r < 0.055) {
        state.pickups.push({ id: state.nextEid++, kind: 'coin', x: e.x + 8, y: e.y + 4, val: Math.round(5 * state.stage.coinMult) });
      } else if (r < 0.068) {
        state.pickups.push({ id: state.nextEid++, kind: 'heal', x: e.x - 8, y: e.y + 6, val: 38 });
      } else if (r < 0.072) {
        state.pickups.push({ id: state.nextEid++, kind: 'magnet', x: e.x, y: e.y - 8, val: 1 });
      }
    }
  }

  function updateProjectiles(dt) {
    for (let i = state.projectiles.length - 1; i >= 0; i--) {
      const pr = state.projectiles[i];
      pr.life -= dt;
      if (pr.life <= 0) {
        state.projectiles.splice(i, 1);
        continue;
      }

      if (pr.kind === 'plunger') {
        pr.vx += pr.ax * dt;
        pr.vy += pr.ay * dt;
        pr.spin += dt * 16;
        // Evolved Galaxy Plunger pulls nearby enemies gently toward it via spatial grid!
        if (pr.evolved) {
          forEachEnemyNear(pr.x, pr.y, 130, (e) => {
            if (e.isBoss) return;
            const dx = pr.x - e.x;
            const dy = pr.y - e.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 16900 && d2 > 100) {
              const d = Math.sqrt(d2);
              e.x += (dx / d) * 95 * dt;
              e.y += (dy / d) * 95 * dt;
            }
          });
        }
      } else if (pr.kind === 'missile') {
        // Throttle target re-acquisition so 30 missiles don't scan all enemies every frame
        pr.retargetCd = (pr.retargetCd || 0) - dt;
        if (!pr.target || pr.target.hp <= 0 || pr.retargetCd <= 0) {
          pr.target = findNearestEnemy(pr.x, pr.y, 520);
          pr.retargetCd = 0.16;
        }
        const target = pr.target;
        if (target) {
          const desired = Math.atan2(target.y - pr.y, target.x - pr.x);
          const cur = Math.atan2(pr.vy, pr.vx);
          let diff = desired - cur;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          const nextA = cur + Math.max(-5.5 * dt, Math.min(5.5 * dt, diff));
          pr.vx = Math.cos(nextA) * pr.speed;
          pr.vy = Math.sin(nextA) * pr.speed;
        }
      } else if (pr.kind === 'baguette') {
        pr.spin += dt * 13;
        if (pr.evolved) {
          pr.spiralAngle += dt * 5.2;
          pr.spiralR += dt * 145;
          const owner = state.players[pr.owner] || state.players[0];
          pr.x = owner.x + Math.cos(pr.spiralAngle) * pr.spiralR;
          pr.y = owner.y + Math.sin(pr.spiralAngle) * pr.spiralR;
        } else {
          pr.vy += pr.gravity * dt;
        }
      }

      if (!(pr.kind === 'baguette' && pr.evolved)) {
        pr.x += pr.vx * dt;
        pr.y += pr.vy * dt;
      }

      // Fast spatial-grid hit checks!
      const ownerP = state.players[pr.owner] || state.players[0];
      forEachEnemyNear(pr.x, pr.y, pr.radius, (e) => {
        const prevHit = pr.hitSet.get(e.id) || 0;
        if (state.time - prevHit < 0.24) return;
        const dx = e.x - pr.x;
        const dy = e.y - pr.y;
        const sumR = pr.radius + e.radius;
        if (dx * dx + dy * dy < sumR * sumR) {
          pr.hitSet.set(e.id, state.time);
          if (pr.kind === 'missile') {
            explodeMissile(pr, ownerP);
            pr.pierce = 0;
            return false;
          } else {
            damageEnemy(e, pr.damage, ownerP, pr.weapon, pr.x, pr.y, 100);
            pr.pierce--;
            if (pr.pierce <= 0) return false;
          }
        }
      });
      if (pr.pierce <= 0) state.projectiles.splice(i, 1);
    }
  }

  function explodeMissile(pr, ownerP) {
    Audio.playSfx('explosion');
    if (state.novas.length < 18) {
      state.novas.push({ x: pr.x, y: pr.y, radius: 12, maxRadius: pr.blastRadius, evolved: pr.evolved, life: 0.24, maxLife: 0.24, isBlast: true });
    }
    spawnBurst(pr.x, pr.y, pr.evolved ? '#fb923c' : '#facc15', 8);
    forEachEnemyNear(pr.x, pr.y, pr.blastRadius, (e) => {
      const dx = e.x - pr.x;
      const dy = e.y - pr.y;
      const sumR = pr.blastRadius + e.radius;
      if (dx * dx + dy * dy < sumR * sumR) {
        damageEnemy(e, pr.damage, ownerP, pr.weapon, pr.x, pr.y, 150);
      }
    });
    // Evolved cluster bombs!
    if (pr.evolved && !pr.isCluster) {
      for (let k = 0; k < 4; k++) {
        const a = (k * Math.PI * 2) / 4 + Math.random() * 0.4;
        pushProjectile({
          id: state.nextEid++,
          kind: 'missile',
          evolved: false,
          isCluster: true,
          owner: pr.owner,
          weapon: pr.weapon,
          x: pr.x + Math.cos(a) * 18,
          y: pr.y + Math.sin(a) * 18,
          vx: Math.cos(a) * 260,
          vy: Math.sin(a) * 260,
          speed: 260,
          radius: 9,
          blastRadius: 56,
          damage: Math.round(pr.damage * 0.65),
          pierce: 1,
          life: 0.45,
          retargetCd: 0.1,
          target: null,
          hitSet: new Map()
        });
      }
    }
  }

  function updateEnemyBullets(dt) {
    const alive = state.players.filter(p => !p.downed);
    for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
      const b = state.enemyBullets[i];
      b.life -= dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.life <= 0) { state.enemyBullets.splice(i, 1); continue; }
      for (const p of alive) {
        const dx = p.x - b.x;
        const dy = p.y - b.y;
        const sumR = p.radius + b.r - 2;
        if (dx * dx + dy * dy < sumR * sumR) {
          damagePlayer(p, b.damage);
          state.enemyBullets.splice(i, 1);
          break;
        }
      }
    }
  }

  function updateZones(dt) {
    for (let i = state.zones.length - 1; i >= 0; i--) {
      const z = state.zones[i];
      z.life -= dt;
      z.tick -= dt;
      if (z.life <= 0) { state.zones.splice(i, 1); continue; }
      if (z.tick <= 0) {
        z.tick = 0.34;
        const ownerP = state.players[z.owner] || state.players[0];
        forEachEnemyNear(z.x, z.y, z.radius, (e) => {
          const dx = e.x - z.x;
          const dy = e.y - z.y;
          const sumR = z.radius + e.radius;
          if (dx * dx + dy * dy < sumR * sumR) {
            damageEnemy(e, z.damage, ownerP, z.weapon, z.x, z.y, 18);
          }
        });
      }
    }
  }

  function updateVisualEffects(dt) {
    for (let i = state.slashes.length - 1; i >= 0; i--) {
      state.slashes[i].life -= dt;
      if (state.slashes[i].life <= 0) state.slashes.splice(i, 1);
    }
    for (let i = state.beams.length - 1; i >= 0; i--) {
      state.beams[i].life -= dt;
      if (state.beams[i].life <= 0) state.beams.splice(i, 1);
    }
    for (let i = state.novas.length - 1; i >= 0; i--) {
      const n = state.novas[i];
      n.life -= dt;
      n.radius = n.maxRadius * (1 - n.life / n.maxLife);
      if (n.life <= 0) state.novas.splice(i, 1);
    }
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const pt = state.particles[i];
      pt.life -= dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vx *= 0.94;
      pt.vy *= 0.94;
      if (pt.life <= 0) state.particles.splice(i, 1);
    }
    for (let i = state.texts.length - 1; i >= 0; i--) {
      const t = state.texts[i];
      t.life -= dt;
      t.y -= 34 * dt;
      if (t.life <= 0) state.texts.splice(i, 1);
    }
  }

  function updatePickups(dt) {
    const alive = state.players.filter(p => !p.downed);
    if (alive.length === 0) return;

    // Limit XP gem count by merging old far gems if huge pile
    if (state.pickups.length > 260) {
      const idx = state.pickups.findIndex(pk => pk.kind === 'xp' && !pk.magnetized);
      if (idx !== -1) state.pickups.splice(idx, 1);
    }

    for (let i = state.pickups.length - 1; i >= 0; i--) {
      const pk = state.pickups[i];
      let target = null;
      let bestD = Infinity;
      let pullR = 0;

      for (const p of alive) {
        const d = Math.hypot(p.x - pk.x, p.y - pk.y);
        if (d < bestD) {
          bestD = d;
          target = p;
          pullR = getComputedStats(p).magnet;
        }
      }
      if (!target) continue;

      if (pk.kind !== 'chest' && (pk.magnetized || bestD < pullR)) {
        pk.magnetized = true;
        const spd = 480;
        const dx = target.x - pk.x;
        const dy = target.y - pk.y;
        const d = Math.hypot(dx, dy) || 1;
        pk.x += (dx / d) * spd * dt;
        pk.y += (dy / d) * spd * dt;
      }

      if (bestD < target.radius + (pk.kind === 'chest' ? 24 : 14)) {
        state.pickups.splice(i, 1);
        collectPickup(pk, target);
      }
    }
  }

  function collectPickup(pk, collector) {
    if (pk.kind === 'xp') {
      const mult = getComputedStats(collector).xpMult;
      state.xp += pk.val * mult;
      Audio.playSfx('xp');
      if (state.xp >= state.xpNeed) {
        triggerLevelUp();
      }
    } else if (pk.kind === 'coin') {
      const bonus = Math.round(pk.val * (collector.shop.greedMult || 1));
      state.coinsEarned += bonus;
      Audio.playSfx('coin');
      addFloatingText(collector.x, collector.y - 26, `+${bonus}🪙`, '#facc15', false);
    } else if (pk.kind === 'heal') {
      for (const p of state.players) {
        if (!p.downed) p.hp = Math.min(p.maxHp, p.hp + pk.val);
      }
      Audio.playSfx('revive');
      addFloatingText(collector.x, collector.y - 26, `🥟 +${pk.val} HP`, '#4ade80', true);
    } else if (pk.kind === 'magnet') {
      Audio.playSfx('levelup');
      addFloatingText(collector.x, collector.y - 30, '🧲 全回収！', '#38bdf8', true);
      for (const item of state.pickups) {
        if (item.kind === 'xp' || item.kind === 'coin') item.magnetized = true;
      }
    } else if (pk.kind === 'chest') {
      tryUnlockAch('defeat_midboss');
      openBossChest();
    }
  }

  // === LEVEL UP & EVOLUTION ===
  function triggerLevelUp() {
    state.xp -= state.xpNeed;
    state.level++;
    state.xpNeed = Math.round(18 + state.level * 12 + Math.pow(state.level, 1.42) * 3.2);
    if (state.level >= 15) tryUnlockAch('level_15');

    state.levelUp.active = true;
    state.levelUp.choicesByPid = {};
    state.levelUp.pickedByPid = {};

    for (const p of state.players) {
      state.levelUp.choicesByPid[p.pid] = generateChoicesForPlayer(p);
    }

    Audio.playSfx('levelup');
    callbacks.onLevelUpOpen(state.levelUp.choicesByPid[0], state.level, state.players.length === 2);

    if (state.mode === 'coop_host') {
      Net.send('lvl_open', { choices: state.levelUp.choicesByPid[1], level: state.level });
    }
  }

  function generateChoicesForPlayer(p) {
    const pool = [];

    // 1. Check ready Weapon Evolutions FIRST (high priority!)
    for (const w of p.weapons) {
      const def = Data.WEAPONS[w.id];
      if (!w.evolved && w.level >= def.maxLevel && (p.passives[def.evolvePassive] || 0) >= 1) {
        pool.push({
          kind: 'evolve',
          id: w.id,
          title: `★ ${def.evolvedName}`,
          icon: def.evolvedIcon,
          badge: '🌟 武器進化！',
          desc: def.evolvedDesc,
          priority: 100
        });
      }
    }

    // 2. Existing weapons upgrade
    for (const w of p.weapons) {
      const def = Data.WEAPONS[w.id];
      if (!w.evolved && w.level < def.maxLevel) {
        const nextLv = w.level + 1;
        pool.push({
          kind: 'weapon',
          id: w.id,
          title: def.name,
          icon: def.icon,
          badge: `Lv.${w.level} → Lv.${nextLv}`,
          desc: def.levelUp[w.level - 1] || '威力・性能アップ！',
          evolveHint: `進化素材: ${Data.PASSIVES[def.evolvePassive].icon} ${Data.PASSIVES[def.evolvePassive].name}`,
          priority: 20
        });
      }
    }

    // 3. New weapons (if slots left)
    if (p.weapons.length < MAX_WEAPONS) {
      for (const def of Object.values(Data.WEAPONS)) {
        if (p.weapons.some(w => w.id === def.id)) continue;
        pool.push({
          kind: 'weapon',
          id: def.id,
          title: def.name,
          icon: def.icon,
          badge: 'NEW 武器!',
          desc: def.desc,
          evolveHint: `進化素材: ${Data.PASSIVES[def.evolvePassive].icon} ${Data.PASSIVES[def.evolvePassive].name}`,
          priority: 14
        });
      }
    }

    // 4. Passives (upgrade existing or new if slots left)
    const passiveCount = Object.keys(p.passives).length;
    for (const def of Object.values(Data.PASSIVES)) {
      const cur = p.passives[def.id] || 0;
      if (cur >= def.maxLevel) continue;
      if (cur === 0 && passiveCount >= MAX_PASSIVES) continue;
      const matchesOwnedWeapon = p.weapons.some(w => w.id === def.evolves && !w.evolved);
      pool.push({
        kind: 'passive',
        id: def.id,
        title: def.name,
        icon: def.icon,
        badge: cur === 0 ? (matchesOwnedWeapon ? '🔥 進化シナジー!' : 'NEW パッシブ') : `Lv.${cur} → Lv.${cur + 1}`,
        desc: def.desc,
        priority: matchesOwnedWeapon ? 26 : 12
      });
    }

    // Weighted shuffle keeping evolutions at top
    const evos = pool.filter(c => c.kind === 'evolve');
    const rest = pool.filter(c => c.kind !== 'evolve').sort((a, b) => (Math.random() * 25 + b.priority) - (Math.random() * 25 + a.priority));
    const picked = [...evos, ...rest].slice(0, 3);

    // Fallback if everything maxed!
    while (picked.length < 3) {
      picked.push(
        picked.length % 2 === 0
          ? { kind: 'heal_bonus', id: 'pierogi', title: '特盛ピエロギ', icon: '🥟', badge: '回復ボーナス', desc: 'HPを50回復＆一時無敵！' }
          : { kind: 'coin_bonus', id: 'gold', title: 'ポーランド金貨袋', icon: '🪙', badge: 'コインボーナス', desc: 'ゴールドコイン +35 を獲得！' }
      );
    }
    return picked;
  }

  function pickLocalUpgrade(choice) {
    if (!state || !state.levelUp.active) return;
    if (state.mode === 'coop_guest') {
      Net.send('lvl_pick', { choice });
      callbacks.onLevelUpWait('1Pの選択を待っています…');
      return;
    }
    applyLevelChoice(0, choice);
  }

  function applyLevelChoice(pid, choice) {
    if (!state || !state.levelUp.active || state.levelUp.pickedByPid[pid]) return;
    const p = state.players[pid];
    if (!p) return;

    state.levelUp.pickedByPid[pid] = true;
    applyChoiceEffect(p, choice);

    // Check if all players have picked
    const allPicked = state.players.every(pl => state.levelUp.pickedByPid[pl.pid]);
    if (allPicked) {
      state.levelUp.active = false;
      callbacks.onLevelUpClose();
      if (state.mode === 'coop_host') Net.send('lvl_close', {});
    } else {
      if (pid === 0) {
        callbacks.onLevelUpWait('2Pの選択を待っています…');
      } else if (state.mode === 'coop_host') {
        Net.send('lvl_wait', { msg: '1Pの選択を待っています…' });
      }
    }
  }

  function applyChoiceEffect(p, choice) {
    if (choice.kind === 'evolve') {
      const w = p.weapons.find(x => x.id === choice.id);
      if (w) {
        w.evolved = true;
        state.evolvedCount++;
        Storage.recordWeaponSeen(w.id, true);
        Audio.playSfx('evolve');
        tryUnlockAch('first_evolve');
        if (state.evolvedCount >= 3) tryUnlockAch('three_evolves');
        spawnBurst(p.x, p.y, '#fde047', 26);
        addFloatingText(p.x, p.y - 36, `★ ${Data.WEAPONS[w.id].evolvedName}!`, '#fde047', true);
      }
    } else if (choice.kind === 'weapon') {
      const existing = p.weapons.find(x => x.id === choice.id);
      if (existing) existing.level = Math.min(Data.WEAPONS[choice.id].maxLevel, existing.level + 1);
      else p.weapons.push({ id: choice.id, level: 1, evolved: false, cd: 0.2, damageDealt: 0 });
      Storage.recordWeaponSeen(choice.id, false);
      Audio.playSfx('click');
    } else if (choice.kind === 'passive') {
      p.passives[choice.id] = (p.passives[choice.id] || 0) + 1;
      if (choice.id === 'burger') {
        p.maxHp = getComputedStats(p).maxHp;
        p.hp = Math.min(p.maxHp, p.hp + 25);
      }
      Audio.playSfx('click');
    } else if (choice.kind === 'heal_bonus') {
      p.hp = Math.min(p.maxHp, p.hp + 50);
      p.invuln = 1.5;
    } else if (choice.kind === 'coin_bonus') {
      state.coinsEarned += 35;
    }
  }

  function openBossChest() {
    state.chestPending = true;
    const rewardsByPid = [];
    for (const p of state.players) {
      const choices = generateChoicesForPlayer(p);
      // Prefer evolution if available!
      const evo = choices.find(c => c.kind === 'evolve');
      const reward = evo || choices[0];
      applyChoiceEffect(p, reward);
      const coinBonus = Math.round(45 * state.stage.coinMult);
      state.coinsEarned += coinBonus;
      rewardsByPid.push({ pid: p.pid, playerName: p.name, reward, coins: coinBonus });
    }
    Audio.playSfx('chest');
    callbacks.onChestOpen(rewardsByPid, state.players.length === 2);
    if (state.mode === 'coop_host') {
      Net.send('chest', { rewards: rewardsByPid });
    }
  }

  function closeBossChest() {
    if (state) state.chestPending = false;
  }

  function continueEndless() {
    if (!state) return;
    state.ended = false;
    state.endless = true;
    Audio.startBgm('normal');
  }

  function finishRun(victory) {
    state.ended = true;
    Audio.stopBgm();
    Audio.playSfx(victory ? 'victory' : 'hurt');

    // Compute final coin reward
    const timeCoins = Math.floor(state.time * 0.35 * state.stage.coinMult);
    const killCoins = Math.floor(state.kills * 0.12 * state.stage.coinMult);
    const clearBonus = victory ? Math.round(180 * state.stage.coinMult) : 0;
    const totalCoins = state.coinsEarned + timeCoins + killCoins + clearBonus;
    Storage.addCoins(totalCoins);

    // Save best time
    const save = Storage.get();
    const prevBest = save.bestTime[state.stage.id] || 0;
    if (state.time > prevBest) {
      save.bestTime[state.stage.id] = Math.floor(state.time);
      Storage.save();
    }

    const summary = {
      victory,
      stageName: state.stage.name,
      time: state.time,
      level: state.level,
      kills: state.kills,
      coinsEarned: totalCoins,
      canEndless: victory && !state.endless && state.mode === 'solo',
      players: state.players.map(p => ({
        pid: p.pid,
        charId: p.charId,
        name: p.name,
        weapons: p.weapons.map(w => ({
          id: w.id,
          name: w.evolved ? Data.WEAPONS[w.id].evolvedName : Data.WEAPONS[w.id].name,
          icon: w.evolved ? Data.WEAPONS[w.id].evolvedIcon : Data.WEAPONS[w.id].icon,
          level: w.level,
          evolved: w.evolved,
          damage: Math.round(w.damageDealt)
        }))
      }))
    };

    if (state.mode === 'coop_host') {
      Net.send('gameover', summary);
    }
    callbacks.onGameOver(summary);
  }

  // === NETWORK SNAPSHOT SYNC ===
  function broadcastFx(fx) {
    if (state && state.mode === 'coop_host') Net.send('fx', fx);
  }

  function broadcastSnapshot() {
    const snap = {
      t: Math.round(state.time * 10) / 10,
      xp: Math.round(state.xp),
      xn: state.xpNeed,
      lv: state.level,
      k: state.kills,
      c: state.coinsEarned,
      pl: state.players.map(p => ({
        i: p.pid,
        ch: p.charId,
        x: Math.round(p.x),
        y: Math.round(p.y),
        lx: Math.round(p.lookX * 10) / 10,
        ly: Math.round(p.lookY * 10) / 10,
        hp: Math.round(p.hp),
        mh: p.maxHp,
        dn: p.downed ? 1 : 0,
        rv: Math.round(p.reviveProgress * 100) / 100,
        hf: p.hitFlash > 0.1 ? 1 : 0,
        mv: Math.hypot(p.vx, p.vy) > 10 ? 1 : 0,
        dc: Math.round(p.dashCd * 10) / 10,
        sy: p.synergyActive ? 1 : 0,
        em: p.emote || '',
        oa: Math.round(p.orbitAngle * 100) / 100,
        ot: p.orbitActiveTimer > 0 ? 1 : 0,
        w: p.weapons.map(w => [w.id, w.level, w.evolved ? 1 : 0]),
        pa: p.passives
      })),
      en: state.enemies.map(e => [
        e.id, e.type, Math.round(e.x), Math.round(e.y), e.radius,
        Math.round(e.hp), e.maxHp, e.hitFlash > 0.1 ? 1 : 0, e.isBoss ? 1 : 0, e.slowTimer > 0 ? 1 : 0
      ]),
      pr: state.projectiles.slice(0, 120).map(p => [
        p.kind, Math.round(p.x), Math.round(p.y), Math.round(p.radius),
        Math.round(Math.atan2(p.vy || 0, p.vx || 1) * 10) / 10,
        p.evolved ? 1 : 0, Math.round((p.spin || 0) * 10) / 10
      ]),
      eb: state.enemyBullets.slice(0, 70).map(b => [Math.round(b.x), Math.round(b.y), b.r, b.color]),
      zn: state.zones.map(z => [Math.round(z.x), Math.round(z.y), Math.round(z.radius), z.evolved ? 1 : 0, Math.round((z.life / z.maxLife) * 10) / 10]),
      sl: state.slashes.map(s => [Math.round(s.x), Math.round(s.y), Math.round(s.angle * 100) / 100, Math.round(s.radius), s.evolved ? 1 : 0, Math.round((s.life / s.maxLife) * 10) / 10]),
      bm: state.beams.map(b => [Math.round(b.x), Math.round(b.y), Math.round(b.radius), b.evolved ? 1 : 0, Math.round((b.life / b.maxLife) * 10) / 10]),
      nv: state.novas.map(n => [Math.round(n.x), Math.round(n.y), Math.round(n.radius), n.evolved ? 1 : 0, n.isBlast ? 1 : 0, Math.round((n.life / n.maxLife) * 10) / 10]),
      pk: state.pickups.slice(0, 140).map(pk => [pk.kind, Math.round(pk.x), Math.round(pk.y), pk.tier || 0])
    };
    Net.send('snap', snap);
  }

  function applyGuestSnapshot(snap) {
    state.time = snap.t;
    state.xp = snap.xp;
    state.xpNeed = snap.xn;
    state.level = snap.lv;
    state.kills = snap.k;
    state.coinsEarned = snap.c;

    // Update players with interpolation targets
    for (const sp of snap.pl) {
      let p = state.players[sp.i];
      if (!p) {
        p = createPlayer(sp.i, sp.ch, sp.x, sp.y);
        state.players[sp.i] = p;
      }
      p.targetX = sp.x;
      p.targetY = sp.y;
      if (Math.hypot(p.x - sp.x, p.y - sp.y) > 220) {
        p.x = sp.x; p.y = sp.y;
      }
      p.lookX = sp.lx;
      p.lookY = sp.ly;
      p.hp = sp.hp;
      p.maxHp = sp.mh;
      p.downed = !!sp.dn;
      p.reviveProgress = sp.rv;
      p.hitFlash = sp.hf ? 0.8 : 0;
      p.moving = !!sp.mv;
      p.dashCd = sp.dc;
      p.synergyActive = !!sp.sy;
      if (sp.em) p.emote = sp.em;
      else if (p.emoteTimer <= 0) p.emote = null;
      p.orbitAngle = sp.oa;
      p.orbitActiveTimer = sp.ot ? 1 : 0;
      p.weapons = sp.w.map(arr => ({ id: arr[0], level: arr[1], evolved: !!arr[2], damageDealt: 0 }));
      p.passives = sp.pa || {};
    }

    // Enemies with interpolation map
    const seen = new Set();
    const nextEnemies = [];
    for (const arr of snap.en) {
      const [id, type, x, y, radius, hp, maxHp, hf, isBoss, slow] = arr;
      seen.add(id);
      let prev = guestInterp.enemies.get(id);
      if (!prev) {
        prev = { id, type, x, y, targetX: x, targetY: y, radius, hp, maxHp, hitFlash: 0, isBoss: !!isBoss, slowTimer: 0 };
        guestInterp.enemies.set(id, prev);
      } else {
        prev.targetX = x;
        prev.targetY = y;
        prev.hp = hp;
        prev.maxHp = maxHp;
        prev.hitFlash = hf ? 0.8 : 0;
        prev.slowTimer = slow ? 1 : 0;
      }
      nextEnemies.push(prev);
    }
    for (const id of guestInterp.enemies.keys()) {
      if (!seen.has(id)) guestInterp.enemies.delete(id);
    }
    state.enemies = nextEnemies;

    state.projectiles = snap.pr.map(a => ({ kind: a[0], x: a[1], y: a[2], radius: a[3], angle: a[4], evolved: !!a[5], spin: a[6] }));
    state.enemyBullets = snap.eb.map(a => ({ x: a[0], y: a[1], r: a[2], color: a[3] }));
    state.zones = snap.zn.map(a => ({ x: a[0], y: a[1], radius: a[2], evolved: !!a[3], alpha: a[4] }));
    state.slashes = snap.sl.map(a => ({ x: a[0], y: a[1], angle: a[2], radius: a[3], evolved: !!a[4], life: a[5], maxLife: 1 }));
    state.beams = snap.bm.map(a => ({ x: a[0], y: a[1], radius: a[2], evolved: !!a[3], life: a[4], maxLife: 1 }));
    state.novas = snap.nv.map(a => ({ x: a[0], y: a[1], radius: a[2], evolved: !!a[3], isBlast: !!a[4], life: a[5], maxLife: 1 }));
    state.pickups = snap.pk.map(a => ({ kind: a[0], x: a[1], y: a[2], tier: a[3] }));
  }

  function updateGuest(dt) {
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 28);

    // Send input to Host at 30Hz
    inputSendAccum += dt;
    if (inputSendAccum >= 0.033) {
      inputSendAccum = 0;
      Net.send('inp', {
        dx: Math.round(localInput.dx * 100) / 100,
        dy: Math.round(localInput.dy * 100) / 100,
        dash: localInput.dash
      });
      localInput.dash = false;
    }

    // Smooth interpolation for players & enemies
    const lerp = Math.min(1, dt * 18);
    for (const p of state.players) {
      if (typeof p.targetX === 'number') {
        p.x += (p.targetX - p.x) * lerp;
        p.y += (p.targetY - p.y) * lerp;
      }
      if (p.emoteTimer > 0) p.emoteTimer -= dt;
    }
    for (const e of state.enemies) {
      if (typeof e.targetX === 'number') {
        e.x += (e.targetX - e.x) * lerp;
        e.y += (e.targetY - e.y) * lerp;
      }
    }

    const me = state.players[1] || state.players[0];
    if (me) {
      state.camera.x += (me.x - state.camera.x) * Math.min(1, dt * 10);
      state.camera.y += (me.y - state.camera.y) * Math.min(1, dt * 10);
    }

    // Local cosmetic particles/texts
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const pt = state.particles[i];
      pt.life -= dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      if (pt.life <= 0) state.particles.splice(i, 1);
    }
    for (let i = state.texts.length - 1; i >= 0; i--) {
      const t = state.texts[i];
      t.life -= dt;
      t.y -= 34 * dt;
      if (t.life <= 0) state.texts.splice(i, 1);
    }
  }

  // === HELPERS ===
  function spawnBurst(x, y, color, count = 8) {
    const room = MAX_PARTICLES - state.particles.length;
    if (room <= 0) return;
    const n = Math.min(count, room);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 170;
      state.particles.push({
        x, y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        r: 2.5 + Math.random() * 3.5,
        color,
        life: 0.35 + Math.random() * 0.25,
        maxLife: 0.6
      });
    }
  }

  function addFloatingText(x, y, text, color = '#ffffff', big = false) {
    if (!big && state.texts.length >= MAX_TEXTS) return;
    if (state.texts.length >= MAX_TEXTS + 8) state.texts.shift();
    state.texts.push({ x, y, text, color, life: big ? 1.05 : 0.62, maxLife: big ? 1.05 : 0.62, big });
  }

  function emitHud() {
    if (!state) return;
    const boss = state.enemies.find(e => e.isBoss);
    callbacks.onHudUpdate({
      time: state.time,
      level: state.level,
      xp: state.xp,
      xpNeed: state.xpNeed,
      kills: state.kills,
      coins: state.coinsEarned,
      mode: state.mode,
      myPid: state.myPid,
      players: state.players.map(p => ({
        pid: p.pid,
        charId: p.charId,
        name: p.name,
        hp: Math.ceil(p.hp),
        maxHp: p.maxHp,
        downed: p.downed,
        dashCd: p.dashCd,
        synergy: p.synergyActive,
        weapons: p.weapons,
        passives: p.passives
      })),
      boss: boss ? { name: Data.ENEMIES[boss.type]?.name || boss.name, hp: Math.ceil(boss.hp), maxHp: boss.maxHp } : null
    });
  }

  // === RENDERER ===
  function hashTile(tx, ty) {
    let n = (tx * 374761393 + ty * 668265263) ^ 0x5bf03635;
    n = (n ^ (n >>> 13)) * 1274126177;
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  }

  function renderBackground(w, h, cx, cy) {
    const stage = state.stage;
    if (stage.propType === 'space') {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#090d1a');
      g.addColorStop(0.75, '#111b36');
      g.addColorStop(1, '#1d3557');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Curved Earth glow along the bottom horizon
      ctx.save();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 2.15, h * 1.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.45)';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    } else if (stage.propType === 'sky') {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#38bdf8');
      g.addColorStop(1, '#bae6fd');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = '#74b855';
      ctx.fillRect(0, 0, w, h);
    }

    // Deterministic world-space decorative landmarks (organic, NOT harsh grids!)
    const tile = 160;
    const minTx = Math.floor((cx - w / 2) / tile) - 1;
    const maxTx = Math.floor((cx + w / 2) / tile) + 1;
    const minTy = Math.floor((cy - h / 2) / tile) - 1;
    const maxTy = Math.floor((cy + h / 2) / tile) + 1;

    ctx.save();
    ctx.translate(w / 2 - cx, h / 2 - cy);

    for (let tx = minTx; tx <= maxTx; tx++) {
      for (let ty = minTy; ty <= maxTy; ty++) {
        const r1 = hashTile(tx, ty);
        const r2 = hashTile(tx + 91, ty - 47);
        const px = tx * tile + r1 * (tile * 0.72);
        const py = ty * tile + r2 * (tile * 0.72);

        if (stage.propType === 'meadow') {
          // Soft organic meadow patches
          if (r1 < 0.48) {
            ctx.fillStyle = '#68ab4a';
            ctx.beginPath();
            ctx.ellipse(px, py, 32 + r2 * 24, 18 + r1 * 12, r1 * 2, 0, Math.PI * 2);
            ctx.fill();
          }
          // Cute grass blades & wildflowers
          if (r2 > 0.35) {
            ctx.strokeStyle = '#4d8b35';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(px - 6, py + 4); ctx.lineTo(px - 9, py - 5);
            ctx.moveTo(px, py + 4); ctx.lineTo(px, py - 7);
            ctx.moveTo(px + 6, py + 4); ctx.lineTo(px + 9, py - 4);
            ctx.stroke();
          }
          if (r1 > 0.78) {
            // Tiny wildflower
            ctx.fillStyle = r2 > 0.5 ? '#fef08a' : '#fbcfe8';
            ctx.beginPath();
            ctx.arc(px + 14, py - 8, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(px + 14, py - 8, 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (r1 < 0.14) {
            // Smooth cobblestone pebble
            ctx.fillStyle = '#cbd5e1';
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(px, py, 14, 9, 0.2, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
          }
        } else if (stage.propType === 'sky') {
          if (r1 < 0.55) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
            ctx.beginPath();
            ctx.arc(px, py, 26 + r2 * 20, 0, Math.PI * 2);
            ctx.arc(px + 26, py + 6, 20 + r1 * 14, 0, Math.PI * 2);
            ctx.arc(px - 22, py + 8, 18 + r2 * 10, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Twinkling stars & mini asteroids
          const tw = 0.5 + 0.5 * Math.sin(state.time * 3 + r1 * 20);
          ctx.fillStyle = r2 > 0.85 ? `rgba(253, 224, 71, ${0.4 + tw * 0.6})` : `rgba(248, 250, 252, ${0.35 + tw * 0.65})`;
          ctx.beginPath();
          ctx.arc(px, py, 1.4 + r1 * 2.1, 0, Math.PI * 2);
          ctx.fill();
          if (r1 > 0.88) {
            ctx.fillStyle = 'rgba(100, 116, 139, 0.35)';
            ctx.beginPath();
            ctx.arc(px + 20, py + 20, 12 + r2 * 10, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
    ctx.restore();
  }

  function render() {
    if (!state || !ctx) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const sx = state.shake > 0 ? (Math.random() - 0.5) * state.shake : 0;
    const sy = state.shake > 0 ? (Math.random() - 0.5) * state.shake : 0;
    const cx = state.camera.x + sx;
    const cy = state.camera.y + sy;

    renderBackground(w, h, cx, cy);

    ctx.save();
    ctx.translate(w / 2 - cx, h / 2 - cy);

    const cullX = w * 0.62;
    const cullY = h * 0.62;

    // 1. Ground burning zones (pre-rendered radial sprite -> ZERO createRadialGradient per frame!)
    for (const z of state.zones) {
      if (Math.abs(z.x - cx) > cullX + z.radius || Math.abs(z.y - cy) > cullY + z.radius) continue;
      const alpha = typeof z.alpha === 'number' ? z.alpha : Math.min(1, z.life / 0.8);
      ctx.globalAlpha = Math.max(0.15, alpha * 0.68);
      const sp = getZoneSprite(z.evolved);
      ctx.drawImage(sp, z.x - z.radius, z.y - z.radius, z.radius * 2, z.radius * 2);
    }
    ctx.globalAlpha = 1;

    // 2. Co-op Friendship Synergy Tether!
    if (state.players.length === 2 && state.players[0].synergyActive) {
      const p0 = state.players[0];
      const p1 = state.players[1];
      ctx.save();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.72)';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 8]);
      ctx.lineDashOffset = -state.time * 40;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Pickups (XP gems, coins, pierogi, magnet, chest)
    ctx.strokeStyle = '#1a1d26';
    ctx.lineWidth = 1.6;
    for (const pk of state.pickups) {
      if (Math.abs(pk.x - cx) > cullX || Math.abs(pk.y - cy) > cullY) continue;
      if (pk.kind === 'xp') {
        const col = pk.tier === 2 ? '#f43f5e' : (pk.tier === 1 ? '#22c55e' : '#38bdf8');
        const sz = pk.tier === 2 ? 9 : (pk.tier === 1 ? 7.5 : 6);
        const px = pk.x;
        const py = pk.y + Math.sin(state.time * 5 + px) * 2;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(px, py - sz);
        ctx.lineTo(px + sz * 0.78, py);
        ctx.lineTo(px, py + sz);
        ctx.lineTo(px - sz * 0.78, py);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (pk.kind === 'coin') {
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#854d0e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pk.x, pk.y, 8, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#1a1d26';
        ctx.lineWidth = 1.6;
      } else if (pk.kind === 'heal' || pk.kind === 'magnet' || pk.kind === 'chest') {
        const bob = Math.sin(state.time * 5) * 4;
        if (pk.kind === 'chest') {
          ctx.fillStyle = 'rgba(250, 204, 21, 0.32)';
          ctx.beginPath();
          ctx.arc(pk.x, pk.y, 28 + Math.sin(state.time * 7) * 4, 0, Math.PI * 2);
          ctx.fill();
        }
        const emoji = pk.kind === 'chest' ? '🎁' : (pk.kind === 'heal' ? '🥟' : '🧲');
        const sp = Renderer.getEmojiSprite(emoji, pk.kind === 'chest' ? 32 : 24);
        ctx.drawImage(sp, pk.x - sp.width / 2, pk.y + bob - sp.height / 2);
      }
    }

    // 4. Enemies (cached offscreen sprites for regular swarm -> 10x faster!)
    for (const e of state.enemies) {
      if (Math.abs(e.x - cx) > cullX + e.radius || Math.abs(e.y - cy) > cullY + e.radius) continue;
      Renderer.drawBall(ctx, e.x, e.y, e.radius, e.type, {
        mood: 'angry',
        lookX: e.lookX || 0,
        lookY: e.lookY || 0,
        time: state.time + e.id * 0.3,
        moving: true,
        hitFlash: e.hitFlash,
        hopFreq: e.isBoss ? 6 : 10,
        cached: !e.isBoss
      });
      // Frozen tint
      if (e.slowTimer > 0) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius * 1.05, 0, Math.PI * 2);
        ctx.fill();
      }
      // Boss HP mini-bar above head
      if (e.isBoss) {
        const bw = e.radius * 2.2;
        const pct = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle = '#1a1d26';
        ctx.fillRect(e.x - bw / 2 - 2, e.y - e.radius * 1.48 - 2, bw + 4, 10);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(e.x - bw / 2, e.y - e.radius * 1.48, bw * pct, 6);
      }
    }

    // 5. Players + Orbital Teacups + Revival Rings + Emotes
    for (const p of state.players) {
      // Revival ring if downed!
      if (p.downed) {
        ctx.save();
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 76, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        if (p.reviveProgress > 0) {
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 76, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p.reviveProgress);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Draw Orbital Teacups (cached emoji sprites!)
      const teaW = p.weapons.find(w => w.id === 'teacup');
      if (teaW && !p.downed && (teaW.evolved || p.orbitActiveTimer > 0)) {
        const stats = getComputedStats(p);
        const ws = getWeaponStats(teaW, stats);
        const orbitR = 78 * ws.area;
        if (teaW.evolved) {
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, orbitR, 0, Math.PI * 2);
          ctx.stroke();
        }
        const teaSp = Renderer.getEmojiSprite(teaW.evolved ? '🫖' : '☕', teaW.evolved ? 30 : 24);
        const hw = teaSp.width / 2;
        const hh = teaSp.height / 2;
        for (let i = 0; i < ws.count; i++) {
          const a = p.orbitAngle + (i * Math.PI * 2) / ws.count;
          ctx.drawImage(teaSp, p.x + Math.cos(a) * orbitR - hw, p.y + Math.sin(a) * orbitR - hh);
        }
      }

      const moving = state.mode === 'coop_guest' ? p.moving : Math.hypot(p.vx, p.vy) > 10;
      const mood = p.downed ? 'dead' : (p.hitFlash > 0.2 ? 'hurt' : (p.dashTime > 0 ? 'dash' : 'normal'));
      Renderer.drawBall(ctx, p.x, p.y, p.radius, p.charId, {
        mood,
        lookX: p.lookX,
        lookY: p.lookY,
        time: state.time + p.pid * 1.1,
        moving,
        hitFlash: p.hitFlash,
        ghost: p.downed,
        label: state.players.length === 2 ? (p.pid === 0 ? '1P' : '2P') : null,
        labelColor: p.pid === 0 ? '#fde047' : '#38bdf8'
      });

      // Under-ball mini HP bar
      if (!p.downed) {
        const bw = 42;
        const pct = Math.max(0, Math.min(1, p.hp / p.maxHp));
        ctx.fillStyle = '#1a1d26';
        ctx.fillRect(p.x - bw / 2 - 1, p.y + p.radius + 7, bw + 2, 7);
        ctx.fillStyle = pct > 0.4 ? '#22c55e' : (pct > 0.2 ? '#facc15' : '#ef4444');
        ctx.fillRect(p.x - bw / 2, p.y + p.radius + 8, bw * pct, 5);
      }

      // Speech Bubble Emote!
      if (p.emote) {
        ctx.save();
        ctx.font = '800 13px "M PLUS Rounded 1c", sans-serif';
        const tw = ctx.measureText(p.emote).width + 18;
        const bx = p.x - tw / 2;
        const by = p.y - p.radius * 2.5 - 26;
        ctx.fillStyle = '#fffdf7';
        ctx.strokeStyle = '#1a1d26';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(bx, by, tw, 26, 10);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#1a1d26';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emote, p.x, by + 13);
        ctx.restore();
      }
    }

    // 6. Slashes, Novas, Beams
    for (const sl of state.slashes) {
      if (Math.abs(sl.x - cx) > cullX + sl.radius || Math.abs(sl.y - cy) > cullY + sl.radius) continue;
      const a = Math.max(0, sl.life / sl.maxLife);
      ctx.save();
      ctx.translate(sl.x, sl.y);
      ctx.rotate(sl.angle);
      ctx.globalAlpha = a;
      ctx.strokeStyle = sl.evolved ? '#f472b6' : '#f8fafc';
      ctx.lineWidth = sl.evolved ? 14 : 9;
      ctx.beginPath();
      ctx.arc(-sl.radius * 0.25, 0, sl.radius * 0.8, -1.1, 1.1);
      ctx.stroke();
      ctx.strokeStyle = sl.evolved ? '#fde047' : '#ef4444';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    }

    for (const n of state.novas) {
      if (Math.abs(n.x - cx) > cullX + n.radius || Math.abs(n.y - cy) > cullY + n.radius) continue;
      const a = Math.max(0, n.life / n.maxLife);
      ctx.globalAlpha = a * 0.85;
      ctx.strokeStyle = n.isBlast ? (n.evolved ? '#fb923c' : '#facc15') : (n.evolved ? '#38bdf8' : '#e0f2fe');
      ctx.lineWidth = n.evolved ? 10 : 6;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.stroke();
      if (n.isBlast) {
        ctx.fillStyle = 'rgba(251, 146, 60, 0.28)';
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    for (const b of state.beams) {
      if (Math.abs(b.x - cx) > cullX + b.radius || Math.abs(b.y - cy) > cullY + 200) continue;
      const a = Math.max(0, b.life / b.maxLife);
      ctx.globalAlpha = a;
      const bw = b.evolved ? 38 : 18;
      ctx.fillStyle = b.evolved ? '#38bdf8' : '#67e8f9';
      ctx.fillRect(b.x - bw / 2, b.y - 600, bw, 600);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(b.x - bw * 0.22, b.y - 600, bw * 0.44, 600);
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * a, 0, Math.PI * 2);
      ctx.fillStyle = b.evolved ? 'rgba(56,189,248,0.4)' : 'rgba(165,243,252,0.45)';
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 7. Player Projectiles (cached emoji drawImage -> ZERO text rasterization per frame!)
    for (const pr of state.projectiles) {
      if (Math.abs(pr.x - cx) > cullX + 40 || Math.abs(pr.y - cy) > cullY + 40) continue;
      ctx.save();
      ctx.translate(pr.x, pr.y);
      if (pr.kind === 'plunger') {
        if (pr.evolved) {
          ctx.strokeStyle = 'rgba(192, 132, 252, 0.65)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, pr.radius * 1.4, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.rotate(pr.spin || 0);
        const sp = Renderer.getEmojiSprite(pr.evolved ? '🌌' : '🪠', 36);
        const d = pr.radius * 2.25;
        ctx.drawImage(sp, -d / 2, -d / 2, d, d);
      } else if (pr.kind === 'baguette') {
        ctx.rotate(pr.spin || 0);
        const sp = Renderer.getEmojiSprite('🥖', 36);
        const d = pr.radius * 2.3;
        ctx.drawImage(sp, -d / 2, -d / 2, d, d);
      } else if (pr.kind === 'missile') {
        const a = typeof pr.angle === 'number' ? pr.angle : Math.atan2(pr.vy, pr.vx);
        ctx.rotate(a + Math.PI / 4);
        const sp = Renderer.getEmojiSprite(pr.evolved ? '🔥' : '🚀', 34);
        const d = pr.radius * 2.5;
        ctx.drawImage(sp, -d / 2, -d / 2, d, d);
      } else if (pr.kind === 'bratwurst') {
        const a = typeof pr.angle === 'number' ? pr.angle : Math.atan2(pr.vy, pr.vx);
        ctx.rotate(a);
        ctx.fillStyle = pr.evolved ? '#fde047' : '#ea580c';
        ctx.strokeStyle = '#1a1d26';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-pr.radius * 1.4, -pr.radius * 0.55, pr.radius * 2.8, pr.radius * 1.1, 6);
        ctx.fill(); ctx.stroke();
      } else if (pr.kind === 'pilum') {
        const a = typeof pr.angle === 'number' ? pr.angle : Math.atan2(pr.vy, pr.vx);
        ctx.rotate(a);
        ctx.strokeStyle = pr.evolved ? '#fde047' : '#f59e0b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-16, 0); ctx.lineTo(18, 0);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(22, 0); ctx.lineTo(12, -5); ctx.lineTo(12, 5);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // 8. Enemy Bullets
    ctx.strokeStyle = '#1a1d26';
    ctx.lineWidth = 2;
    for (const b of state.enemyBullets) {
      if (Math.abs(b.x - cx) > cullX || Math.abs(b.y - cy) > cullY) continue;
      ctx.fillStyle = b.color || '#ef4444';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }

    // 9. Particles (no per-particle save/restore!)
    for (const pt of state.particles) {
      if (Math.abs(pt.x - cx) > cullX || Math.abs(pt.y - cy) > cullY) continue;
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 10. Floating Damage / Status Texts
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#1a1d26';
    ctx.lineWidth = 3;
    for (const t of state.texts) {
      if (Math.abs(t.x - cx) > cullX || Math.abs(t.y - cy) > cullY) continue;
      ctx.globalAlpha = Math.max(0, Math.min(1, t.life / (t.maxLife * 0.6)));
      ctx.font = t.big ? '900 18px "M PLUS Rounded 1c", sans-serif' : '800 14px "M PLUS Rounded 1c", sans-serif';
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;

    ctx.restore();

    // 11. Off-screen Indicators (Partner in Co-op + Boss Chest!)
    renderOffscreenIndicators(w, h, cx, cy);
  }

  function renderOffscreenIndicators(w, h, cx, cy) {
    const pad = 42;
    const targets = [];

    if (state.players.length === 2) {
      const partner = state.players[state.myPid === 0 ? 1 : 0];
      if (partner) {
        targets.push({
          x: partner.x, y: partner.y,
          color: partner.downed ? '#ef4444' : '#38bdf8',
          label: partner.downed ? '🆘 蘇生!' : (partner.pid === 0 ? '1P' : '2P')
        });
      }
    }
    for (const pk of state.pickups) {
      if (pk.kind === 'chest') {
        targets.push({ x: pk.x, y: pk.y, color: '#facc15', label: '🎁' });
      }
    }

    for (const t of targets) {
      const sx = w / 2 + (t.x - cx);
      const sy = h / 2 + (t.y - cy);
      if (sx > 24 && sx < w - 24 && sy > 24 && sy < h - 24) continue;
      const a = Math.atan2(sy - h / 2, sx - w / 2);
      const ex = Math.max(pad, Math.min(w - pad, w / 2 + Math.cos(a) * (w / 2 - pad)));
      const ey = Math.max(pad + 45, Math.min(h - pad, h / 2 + Math.sin(a) * (h / 2 - pad)));

      ctx.save();
      ctx.translate(ex, ey);
      ctx.fillStyle = t.color;
      ctx.strokeStyle = '#1a1d26';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#1a1d26';
      ctx.font = '900 11px "M PLUS Rounded 1c", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.label, 0, 1);
      ctx.restore();
    }
  }

  return {
    init,
    start,
    stop,
    setPaused,
    setLocalInput,
    triggerDash,
    sendEmote,
    pickLocalUpgrade,
    closeBossChest,
    continueEndless,
    handleNetMessage,
    isRunning: () => !!(state && state.running)
  };
})();
