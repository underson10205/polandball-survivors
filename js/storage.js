// Persistent Meta-Progression Storage (localStorage with safe fallback)
window.PBStorage = (() => {
  const KEY = 'polandball_survivors_save_v1';

  const DEFAULT_SAVE = {
    coins: 0,
    totalKills: 0,
    totalRuns: 0,
    unlockedChars: ['poland', 'japan', 'usa', 'uk', 'france', 'germany', 'italy', 'russia', 'spain'],
    shop: {
      might: 0,
      maxHp: 0,
      speed: 0,
      cooldown: 0,
      magnet: 0,
      armor: 0,
      greed: 0,
      revive: 0
    },
    gearOwned: [],
    gearPlus: {},
    equipped: {
      head: null,
      body: null,
      shield: null,
      weapon: null
    },
    gachaPulls: 0,
    gachaPity: 0,
    achievements: {},
    codex: {
      weapons: {},
      evolved: {},
      enemies: {}
    },
    bestTime: {},
    settings: {
      muted: false,
      bgm: true
    }
  };

  let state = null;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) {
        state = JSON.parse(JSON.stringify(DEFAULT_SAVE));
      } else {
        const parsed = JSON.parse(raw);
        state = {
          ...JSON.parse(JSON.stringify(DEFAULT_SAVE)),
          ...parsed,
          shop: { ...DEFAULT_SAVE.shop, ...(parsed.shop || {}) },
          gearOwned: Array.isArray(parsed.gearOwned) ? [...parsed.gearOwned] : [],
          gearPlus: { ...(parsed.gearPlus || {}) },
          equipped: { ...DEFAULT_SAVE.equipped, ...(parsed.equipped || {}) },
          gachaPulls: Number(parsed.gachaPulls || 0),
          gachaPity: Number(parsed.gachaPity || 0),
          achievements: { ...(parsed.achievements || {}) },
          codex: {
            weapons: { ...(parsed.codex?.weapons || {}) },
            evolved: { ...(parsed.codex?.evolved || {}) },
            enemies: { ...(parsed.codex?.enemies || {}) }
          },
          bestTime: { ...(parsed.bestTime || {}) },
          settings: { ...DEFAULT_SAVE.settings, ...(parsed.settings || {}) }
        };
      }
    } catch {
      state = JSON.parse(JSON.stringify(DEFAULT_SAVE));
    }
    // Automatically ensure all free starter characters (including newly added ones!) are unlocked
    if (window.PBData && Array.isArray(window.PBData.CHARACTERS)) {
      for (const ch of window.PBData.CHARACTERS) {
        if (ch.unlockCost === 0 && !state.unlockedChars.includes(ch.id)) {
          state.unlockedChars.push(ch.id);
        }
      }
    }
    return state;
  }

  function save() {
    if (!state) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota / sandbox errors
    }
  }

  function get() {
    if (!state) load();
    return state;
  }

  function addCoins(amount) {
    const s = get();
    s.coins = Math.max(0, Math.floor(s.coins + amount));
    save();
    return s.coins;
  }

  function buyUpgrade(id) {
    const s = get();
    const def = window.PBData.SHOP_UPGRADES.find(u => u.id === id);
    if (!def) return false;
    const cur = s.shop[id] || 0;
    if (cur >= def.maxLevel) return false;
    const cost = def.baseCost + cur * def.costStep;
    if (s.coins < cost) return false;
    s.coins -= cost;
    s.shop[id] = cur + 1;
    save();
    return true;
  }

  function unlockCharacter(charId) {
    const s = get();
    if (s.unlockedChars.includes(charId)) return true;
    const def = window.PBData.CHARACTERS.find(c => c.id === charId);
    if (!def) return false;
    if (s.coins < def.unlockCost) return false;
    s.coins -= def.unlockCost;
    s.unlockedChars.push(charId);
    unlockAchievement('unlock_char');
    save();
    return true;
  }

  function unlockAchievement(id) {
    const s = get();
    if (s.achievements[id]) return null;
    const def = window.PBData.ACHIEVEMENTS.find(a => a.id === id);
    if (!def) return null;
    s.achievements[id] = Date.now();
    s.coins += def.reward;
    save();
    return def;
  }

  function recordEnemyKill(enemyId) {
    const s = get();
    s.codex.enemies[enemyId] = (s.codex.enemies[enemyId] || 0) + 1;
  }

  function recordWeaponSeen(weaponId, evolved = false) {
    const s = get();
    s.codex.weapons[weaponId] = true;
    if (evolved) s.codex.evolved[weaponId] = true;
  }

  function getEffectiveGearStats(def, plus = 0) {
    const p = Math.max(0, Math.floor(plus || 0));
    const base = def?.stats || {};
    const out = {};
    const mult = 1 + p * 0.12; // +12% stat boost per +1 duplicate!
    for (const [k, v] of Object.entries(base)) {
      if (p === 0) {
        out[k] = v;
      } else if (k === 'maxHpFlat') {
        out[k] = Math.max(v + p * 2, Math.round(v * mult));
      } else if (k === 'rangedCut') {
        out[k] = v >= 1.0 ? 1.0 : Math.min(0.95, Number((v + p * 0.03).toFixed(2)));
      } else if (k === 'armorFlat') {
        out[k] = v + Math.floor(p / 2);
      } else if (k === 'amountFlat') {
        out[k] = v + Math.floor(p / 5);
      } else if (k === 'revives') {
        out[k] = v;
      } else if (k === 'cooldownMult') {
        out[k] = Math.max(-0.35, Number((v * mult).toFixed(3)));
      } else {
        out[k] = Number((v * mult).toFixed(3));
      }
    }
    return out;
  }

  function getGearBonuses() {
    const s = get();
    const items = window.PBData?.GEAR_ITEMS || [];
    const out = {
      mightMult: 0,
      maxHpFlat: 0,
      speedMult: 0,
      cooldownMult: 0,
      magnetMult: 0,
      armorFlat: 0,
      areaBonus: 0,
      amountFlat: 0,
      regenFlat: 0,
      critBonus: 0,
      xpBonus: 0,
      rangedCut: 0,
      revives: 0
    };
    for (const slot of ['head', 'body', 'shield', 'weapon']) {
      const gid = s.equipped?.[slot];
      if (!gid) continue;
      const def = items.find(it => it.id === gid);
      if (!def) continue;
      const eff = getEffectiveGearStats(def, s.gearPlus?.[gid] || 0);
      for (const [k, v] of Object.entries(eff)) {
        if (typeof out[k] === 'number') out[k] += v;
      }
    }
    out.rangedCut = Math.min(1.0, out.rangedCut);
    return out;
  }

  function equipGear(gearId) {
    const s = get();
    const def = (window.PBData?.GEAR_ITEMS || []).find(it => it.id === gearId);
    if (!def || !s.gearOwned.includes(gearId)) return false;
    s.equipped[def.slot] = gearId;
    save();
    return true;
  }

  function unequipSlot(slot) {
    const s = get();
    if (!s.equipped || !(slot in s.equipped)) return false;
    s.equipped[slot] = null;
    save();
    return true;
  }

  function autoEquipBest() {
    const s = get();
    const items = window.PBData?.GEAR_ITEMS || [];
    const rarities = window.PBData?.GEAR_RARITIES || {};
    let changed = false;
    for (const slot of ['head', 'body', 'shield', 'weapon']) {
      const ownedForSlot = items.filter(it => it.slot === slot && s.gearOwned.includes(it.id));
      if (ownedForSlot.length === 0) continue;
      ownedForSlot.sort((a, b) => {
        const rankDiff = (rarities[b.rarity]?.rank || 0) - (rarities[a.rarity]?.rank || 0);
        if (rankDiff !== 0) return rankDiff;
        return (s.gearPlus?.[b.id] || 0) - (s.gearPlus?.[a.id] || 0);
      });
      if (s.equipped[slot] !== ownedForSlot[0].id) {
        s.equipped[slot] = ownedForSlot[0].id;
        changed = true;
      }
    }
    if (changed) save();
    return changed;
  }

  function pickRarity(mode = 'normal') {
    // mode: 'normal' | 'guarantee' (10-pull 10th slot) | 'pity' (30-pull super pity: Rare 50% / Epic 35% / Legend 15%)
    const rarities = Object.values(window.PBData?.GEAR_RARITIES || {});
    const field = mode === 'pity' ? 'pityWeight' : (mode === 'guarantee' ? 'guaranteeWeight' : 'weight');
    const total = rarities.reduce((acc, r) => acc + (r[field] || 0), 0);
    let roll = Math.random() * total;
    for (const r of rarities) {
      const w = r[field] || 0;
      if (w <= 0) continue;
      roll -= w;
      if (roll <= 0) return r.id;
    }
    return mode === 'normal' ? 'common' : 'rare';
  }

  function rollGacha(times = 1) {
    const s = get();
    const cfg = window.PBData?.GACHA_CONFIG || { singleCost: 500, tenCost: 4500, pityLimit: 30 };
    const items = window.PBData?.GEAR_ITEMS || [];
    const count = times === 10 ? 10 : 1;
    const cost = count === 10 ? cfg.tenCost : cfg.singleCost;
    if (s.coins < cost) return { ok: false, reason: 'coins', cost };

    s.coins -= cost;
    if (!s.gearPlus) s.gearPlus = {};
    const pulls = [];

    for (let i = 0; i < count; i++) {
      s.gachaPulls = (s.gachaPulls || 0) + 1;
      s.gachaPity = (s.gachaPity || 0) + 1;
      const isPity = s.gachaPity >= cfg.pityLimit;
      const isTenBonus = !isPity && (count === 10 && i === count - 1);

      let rarityId;
      if (isPity) {
        rarityId = pickRarity('pity');
        s.gachaPity = 0;
      } else if (isTenBonus) {
        rarityId = pickRarity('guarantee');
      } else {
        rarityId = pickRarity('normal');
      }

      const pool = items.filter(it => it.rarity === rarityId);
      const picked = pool[Math.floor(Math.random() * pool.length)] || items[0];
      const isNew = !s.gearOwned.includes(picked.id);
      let newPlus = 0;
      if (isNew) {
        s.gearOwned.push(picked.id);
        s.gearPlus[picked.id] = 0;
        if (!s.equipped[picked.slot]) {
          s.equipped[picked.slot] = picked.id;
        }
      } else {
        newPlus = (s.gearPlus[picked.id] || 0) + 1;
        s.gearPlus[picked.id] = newPlus;
      }
      pulls.push({ item: picked, isNew, newPlus, isPity, isTenBonus });
    }

    const firstAch = unlockAchievement('first_gacha');
    save();
    return { ok: true, cost, pulls, firstAch };
  }

  function resetAll() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // Ignore storage errors
    }
    state = null;
    load();
    save();
    return state;
  }

  function getShopBonuses() {
    const shop = get().shop;
    const g = getGearBonuses();
    return {
      mightMult: 1 + (shop.might || 0) * 0.08 + g.mightMult,
      maxHpFlat: (shop.maxHp || 0) * 18 + g.maxHpFlat,
      speedMult: 1 + (shop.speed || 0) * 0.06 + g.speedMult,
      cooldownMult: Math.max(0.45, 1 - (shop.cooldown || 0) * 0.05 + g.cooldownMult),
      magnetMult: 1 + (shop.magnet || 0) * 0.2 + g.magnetMult,
      armorFlat: (shop.armor || 0) + g.armorFlat,
      greedMult: 1 + (shop.greed || 0) * 0.15,
      revives: (shop.revive || 0) + g.revives,
      areaBonus: g.areaBonus,
      amountFlat: g.amountFlat,
      regenFlat: g.regenFlat,
      critBonus: g.critBonus,
      xpBonus: g.xpBonus,
      rangedCut: g.rangedCut
    };
  }

  load();
  return {
    get,
    save,
    resetAll,
    addCoins,
    buyUpgrade,
    unlockCharacter,
    unlockAchievement,
    recordEnemyKill,
    recordWeaponSeen,
    getEffectiveGearStats,
    getGearBonuses,
    equipGear,
    unequipSlot,
    autoEquipBest,
    rollGacha,
    getShopBonuses
  };
})();
