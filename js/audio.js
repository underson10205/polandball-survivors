// Procedural Web Audio API SFX & Chiptune BGM Engine
window.PBAudio = (() => {
  let ctx = null;
  let muted = false;
  let bgmEnabled = true;
  let sfxVol = 0.45;
  let bgmVol = 0.22;
  let bgmTimer = null;
  let bgmStep = 0;
  let bgmMode = 'normal'; // 'normal' | 'boss'
  let xpStreak = 0;
  let lastXpTime = 0;
  let noiseBuffer = null;
  const lastSfxAt = {};
  const SFX_COOLDOWN_MS = {
    hit: 60,
    kill: 48,
    xp: 42,
    coin: 55,
    slash: 80,
    explosion: 95,
    laser: 85,
    roar: 110
  };

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function getNoiseBuffer(ac) {
    if (noiseBuffer) return noiseBuffer;
    const size = Math.floor(ac.sampleRate * 0.3);
    noiseBuffer = ac.createBuffer(1, size, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    return noiseBuffer;
  }

  function tone(freq, dur, type = 'square', vol = 0.25, slideTo = null, delay = 0) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    const now = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + dur);
    gain.gain.setValueAtTime(vol * sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(now);
    osc.stop(now + dur + 0.01);
  }

  function noise(dur, vol = 0.2, delay = 0) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    const src = ac.createBufferSource();
    src.buffer = getNoiseBuffer(ac);
    const gain = ac.createGain();
    const now = ac.currentTime + delay;
    gain.gain.setValueAtTime(vol * sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    src.connect(gain);
    gain.connect(ac.destination);
    src.start(now);
    src.stop(now + dur + 0.01);
  }

  function playSfx(name) {
    if (muted) return;
    const now = performance.now();
    const minGap = SFX_COOLDOWN_MS[name];
    if (minGap) {
      if (now - (lastSfxAt[name] || 0) < minGap) return;
      lastSfxAt[name] = now;
    }
    switch (name) {
      case 'xp': {
        if (now - lastXpTime < 380) xpStreak = Math.min(14, xpStreak + 1);
        else xpStreak = 0;
        lastXpTime = now;
        const base = 520 * Math.pow(1.06, xpStreak);
        tone(base, 0.075, 'triangle', 0.32, base * 1.25);
        break;
      }
      case 'coin':
        tone(988, 0.07, 'square', 0.22);
        tone(1319, 0.14, 'square', 0.22, null, 0.06);
        break;
      case 'hit':
        tone(180 + Math.random() * 60, 0.055, 'sawtooth', 0.14, 70);
        break;
      case 'kill':
        tone(300, 0.07, 'square', 0.16, 120);
        break;
      case 'hurt':
        tone(160, 0.18, 'sawtooth', 0.35, 65);
        noise(0.12, 0.25);
        break;
      case 'dash':
        tone(280, 0.12, 'triangle', 0.25, 680);
        break;
      case 'slash':
        noise(0.08, 0.18);
        tone(620, 0.09, 'sawtooth', 0.14, 210);
        break;
      case 'explosion':
        noise(0.22, 0.35);
        tone(120, 0.25, 'sine', 0.38, 35);
        break;
      case 'laser':
        tone(1100, 0.13, 'sawtooth', 0.18, 320);
        break;
      case 'roar':
        tone(150, 0.26, 'sawtooth', 0.28, 70);
        noise(0.18, 0.2);
        break;
      case 'levelup':
        [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, 'square', 0.25, null, i * 0.065));
        break;
      case 'evolve':
        [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.18, 'triangle', 0.32, null, i * 0.07));
        break;
      case 'chest':
        [440, 554, 659, 880, 1108].forEach((f, i) => tone(f, 0.15, 'square', 0.26, null, i * 0.08));
        break;
      case 'boss':
        [146, 138, 130, 110].forEach((f, i) => tone(f, 0.28, 'sawtooth', 0.35, f * 0.92, i * 0.22));
        break;
      case 'revive':
        [587, 740, 880, 1175].forEach((f, i) => tone(f, 0.16, 'triangle', 0.32, null, i * 0.07));
        break;
      case 'emote':
        tone(740, 0.08, 'sine', 0.22, 920);
        break;
      case 'click':
        tone(620, 0.045, 'triangle', 0.18, 740);
        break;
      case 'victory':
        [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, 0.18, 'square', 0.26, null, i * 0.1));
        break;
    }
  }

  // Stage & Boss MP3 BGM Tracks (from Google Drive ゲームBGM)
  const BGM_TRACKS = {
    title: { src: 'bgm/title.mp3?v=31', label: 'パステルハウス', volume: 0.38 },
    meadow: { src: 'bgm/stage1_meadow.mp3', label: 'かけっこ競争', volume: 0.44 },
    sky: { src: 'bgm/stage2_sky.mp3?v=8', label: '楽しく軽快に', volume: 0.44 },
    space: { src: 'bgm/stage3_space.mp3', label: 'Warp_Area', volume: 0.44 },
    desert: { src: 'bgm/stage4_desert.mp3', label: 'shuffle_shuffle', volume: 0.44 },
    midboss: { src: 'bgm/boss_mid.mp3', label: 'Will_you_still_cry_', volume: 0.46 },
    finalboss: { src: 'bgm/boss_final.mp3', label: '全てを創造する者「Dominus_Deus」', volume: 0.48 }
  };

  const audioPool = {};
  let currentTrackKey = null;
  let currentAudio = null;
  let bgmPlaying = false;
  const MP3_BGM_VOLUME = 0.44;

  function getTrackAudio(key) {
    const k = BGM_TRACKS[key] ? key : 'title';
    if (!audioPool[k]) {
      const a = new Audio(BGM_TRACKS[k].src);
      a.loop = true;
      a.preload = 'auto';
      a.volume = BGM_TRACKS[k].volume || MP3_BGM_VOLUME;
      audioPool[k] = a;
    }
    return audioPool[k];
  }

  function startBgm(trackKey = 'title') {
    const key = BGM_TRACKS[trackKey] ? trackKey : (trackKey === 'boss' ? 'finalboss' : 'title');
    const prevKey = currentTrackKey;
    currentTrackKey = key;
    bgmMode = key;
    bgmPlaying = true;

    if (muted || !bgmEnabled) {
      if (currentAudio) {
        try { currentAudio.pause(); } catch {}
      }
      return;
    }

    const nextAudio = getTrackAudio(key);
    if (currentAudio && currentAudio !== nextAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch {}
    }

    currentAudio = nextAudio;
    currentAudio.volume = BGM_TRACKS[key]?.volume || MP3_BGM_VOLUME;
    if (prevKey !== key) {
      try { currentAudio.currentTime = 0; } catch {}
    }
    const p = currentAudio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {});
    }
  }

  function setBgmMode(trackKey) {
    const key = BGM_TRACKS[trackKey] ? trackKey : (trackKey === 'boss' ? 'finalboss' : 'title');
    if (currentTrackKey === key && currentAudio && !currentAudio.paused) return;
    if (bgmPlaying) startBgm(key);
    else {
      currentTrackKey = key;
      bgmMode = key;
    }
  }

  function stopBgm() {
    bgmPlaying = false;
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch {}
    }
  }

  function resumeBgmIfNeeded() {
    if (bgmPlaying && !muted && bgmEnabled && currentTrackKey) {
      const a = getTrackAudio(currentTrackKey);
      currentAudio = a;
      a.volume = BGM_TRACKS[currentTrackKey]?.volume || MP3_BGM_VOLUME;
      if (a.paused) {
        const p = a.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    }
  }

  function setMuted(val) {
    muted = !!val;
    if (muted) {
      if (currentAudio) {
        try { currentAudio.pause(); } catch {}
      }
    } else {
      resumeBgmIfNeeded();
    }
  }

  function setBgmEnabled(val) {
    bgmEnabled = !!val;
    if (!bgmEnabled) {
      if (currentAudio) {
        try { currentAudio.pause(); } catch {}
      }
    } else {
      resumeBgmIfNeeded();
    }
  }

  function getTrackLabel(key) {
    return BGM_TRACKS[key]?.label || '';
  }

  return {
    ensure: () => {
      const ac = ensure();
      resumeBgmIfNeeded();
      return ac;
    },
    playSfx,
    startBgm,
    setBgmMode,
    stopBgm,
    setMuted,
    setBgmEnabled,
    getTrackLabel,
    getCurrentTrack: () => currentTrackKey,
    isMuted: () => muted,
    isBgmEnabled: () => bgmEnabled
  };
})();
