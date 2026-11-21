// Persistent Meta-Progression Storage (localStorage with safe fallback)
window.PBStorage = (() => {
  const KEY = 'polandball_survivors_save_v1';

  const DEFAULT_SAVE = {
    coins: 0,
    totalKills: 0,
    totalRuns: 0,
    unlockedChars: ['poland', 'japan', 'usa', 'uk', 'france', 'germany', 'italy', 'russia'],
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

  function getShopBonuses() {
    const shop = get().shop;
    return {
      mightMult: 1 + (shop.might || 0) * 0.08,
      maxHpFlat: (shop.maxHp || 0) * 18,
      speedMult: 1 + (shop.speed || 0) * 0.06,
      cooldownMult: Math.max(0.65, 1 - (shop.cooldown || 0) * 0.05),
      magnetMult: 1 + (shop.magnet || 0) * 0.2,
      armorFlat: shop.armor || 0,
      greedMult: 1 + (shop.greed || 0) * 0.15,
      revives: shop.revive || 0
    };
  }

  load();
  return {
    get,
    save,
    addCoins,
    buyUpgrade,
    unlockCharacter,
    unlockAchievement,
    recordEnemyKill,
    recordWeaponSeen,
    getShopBonuses
  };
})();
