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
    const bufferSize = Math.max(1, Math.floor(ac.sampleRate * dur));
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    src.buffer = buffer;
    const gain = ac.createGain();
    const now = ac.currentTime + delay;
    gain.gain.setValueAtTime(vol * sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    src.connect(gain);
    gain.connect(ac.destination);
    src.start(now);
  }

  function playSfx(name) {
    if (muted) return;
    const now = performance.now();
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

  // Cheerful polka-arcade melody for Polandball action!
  const MELODY_NORMAL = [
    523, 659, 784, 659, 880, 784, 659, 587,
    523, 659, 784, 1047, 880, 784, 659, 0,
    698, 880, 1047, 880, 784, 659, 587, 523,
    587, 659, 784, 587, 523, 0, 523, 0
  ];
  const BASS_NORMAL = [
    131, 196, 131, 196, 175, 220, 196, 147,
    131, 196, 131, 196, 175, 196, 131, 196
  ];
  const MELODY_BOSS = [
    294, 0, 349, 294, 440, 0, 415, 349,
    294, 349, 440, 523, 466, 440, 349, 330,
    294, 294, 440, 440, 587, 523, 466, 440,
    392, 349, 330, 294, 262, 294, 330, 0
  ];
  const BASS_BOSS = [
    110, 110, 131, 110, 147, 147, 131, 110,
    110, 110, 165, 147, 131, 123, 110, 98
  ];

  function playBgmTick() {
    if (muted || !bgmEnabled) return;
    const ac = ensure();
    if (!ac || ac.state !== 'running') return;
    const isBoss = bgmMode === 'boss';
    const mel = isBoss ? MELODY_BOSS : MELODY_NORMAL;
    const bas = isBoss ? BASS_BOSS : BASS_NORMAL;
    const mFreq = mel[bgmStep % mel.length];
    const bFreq = bas[Math.floor(bgmStep / 2) % bas.length];
    const now = ac.currentTime;

    if (mFreq > 0) {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = isBoss ? 'sawtooth' : 'square';
      o.frequency.setValueAtTime(mFreq, now);
      g.gain.setValueAtTime(0.11 * bgmVol, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      o.connect(g); g.connect(ac.destination);
      o.start(now); o.stop(now + 0.15);
    }
    if (bgmStep % 2 === 0 && bFreq > 0) {
      const o2 = ac.createOscillator();
      const g2 = ac.createGain();
      o2.type = 'triangle';
      o2.frequency.setValueAtTime(bFreq, now);
      g2.gain.setValueAtTime(0.18 * bgmVol, now);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      o2.connect(g2); g2.connect(ac.destination);
      o2.start(now); o2.stop(now + 0.25);
    }
    bgmStep++;
  }

  function startBgm(mode = 'normal') {
    bgmMode = mode;
    stopBgm();
    if (!bgmEnabled) return;
    bgmStep = 0;
    bgmTimer = setInterval(playBgmTick, mode === 'boss' ? 145 : 175);
  }

  function setBgmMode(mode) {
    if (bgmMode === mode && bgmTimer) return;
    if (bgmTimer) startBgm(mode);
    else bgmMode = mode;
  }

  function stopBgm() {
    if (bgmTimer) {
      clearInterval(bgmTimer);
      bgmTimer = null;
    }
  }

  function setMuted(val) {
    muted = !!val;
    if (muted) stopBgm();
  }

  function setBgmEnabled(val) {
    bgmEnabled = !!val;
    if (!bgmEnabled) stopBgm();
  }

  return {
    ensure,
    playSfx,
    startBgm,
    setBgmMode,
    stopBgm,
    setMuted,
    setBgmEnabled,
    isMuted: () => muted,
    isBgmEnabled: () => bgmEnabled
  };
})();
