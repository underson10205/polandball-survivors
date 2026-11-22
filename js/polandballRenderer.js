// Authentic Polandball / Countryballs Canvas2D Renderer
window.PBRenderer = (() => {
  const INK = '#1a1d26';

  function drawEyes(ctx, r, mood, lookX, lookY, opts = {}) {
    const ox = Math.max(-0.22, Math.min(0.22, lookX || 0)) * r;
    const oy = Math.max(-0.15, Math.min(0.15, lookY || 0)) * r;
    const spacing = (opts.spacing ?? 0.33) * r;
    const ey = (opts.yOffset ?? -0.06) * r + oy;
    const erx = (opts.rx ?? 0.19) * r;
    const ery = (opts.ry ?? 0.24) * r;

    ctx.save();
    ctx.lineWidth = Math.max(1.6, r * 0.09);
    ctx.strokeStyle = INK;
    ctx.fillStyle = '#ffffff';

    if (mood === 'dead') {
      // X X fainted eyes
      for (const side of [-1, 1]) {
        const cx = side * spacing + ox;
        const s = erx * 0.85;
        ctx.beginPath();
        ctx.moveTo(cx - s, ey - s);
        ctx.lineTo(cx + s, ey + s);
        ctx.moveTo(cx + s, ey - s);
        ctx.lineTo(cx - s, ey + s);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    if (mood === 'hurt') {
      // > < squeezed eyes
      for (const side of [-1, 1]) {
        const cx = side * spacing + ox;
        const s = erx * 0.9;
        ctx.beginPath();
        if (side < 0) {
          ctx.moveTo(cx - s, ey - s * 0.8);
          ctx.lineTo(cx + s * 0.7, ey);
          ctx.lineTo(cx - s, ey + s * 0.8);
        } else {
          ctx.moveTo(cx + s, ey - s * 0.8);
          ctx.lineTo(cx - s * 0.7, ey);
          ctx.lineTo(cx + s, ey + s * 0.8);
        }
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    if (mood === 'happy') {
      // ^ ^ eyes
      for (const side of [-1, 1]) {
        const cx = side * spacing + ox;
        ctx.beginPath();
        ctx.arc(cx, ey + ery * 0.25, erx * 0.95, Math.PI * 1.12, Math.PI * 1.88);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    // Standard Polandball expressive white eyes (NO pupils!)
    for (const side of [-1, 1]) {
      const cx = side * spacing + ox;
      ctx.save();
      ctx.translate(cx, ey);
      ctx.beginPath();
      if (mood === 'angry') {
        // Slanted fierce white eyes
        const slant = side < 0 ? 0.28 : -0.28;
        ctx.rotate(slant);
        ctx.ellipse(0, 0, erx * 1.05, ery * 0.72, 0, 0, Math.PI * 2);
      } else if (mood === 'dash') {
        ctx.ellipse(0, 0, erx * 1.15, ery * 0.65, 0, 0, Math.PI * 2);
      } else {
        ctx.ellipse(0, 0, erx, ery, 0, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawFlagCircle(ctx, r, drawFn) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();
    drawFn();
    // Subtle shading & top-left comic highlight
    const grad = ctx.createRadialGradient(-r * 0.32, -r * 0.35, r * 0.1, 0, 0, r * 1.12);
    grad.addColorStop(0, 'rgba(255,255,255,0.28)');
    grad.addColorStop(0.55, 'rgba(255,255,255,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = grad;
    ctx.fillRect(-r - 2, -r - 2, r * 2 + 4, r * 2 + 4);
    ctx.restore();

    // Crisp comic ink outline
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.lineWidth = Math.max(2, r * 0.11);
    ctx.strokeStyle = INK;
    ctx.stroke();
  }

  function drawStar(ctx, cx, cy, spikes, outerR, innerR, color) {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
      rot += step;
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function drawCountry(ctx, id, r, mood, lookX, lookY, time = 0) {
    const strokeW = Math.max(2, r * 0.11);

    // Special Shape 1: Reichtangle (towering rectangle!)
    if (id === 'reichtangle') {
      const w = r * 1.38;
      const h = r * 2.15;
      const x0 = -w / 2;
      const y0 = -h * 0.62;
      // Menacing red pulse aura (lightweight glow without slow shadowBlur)
      const pulse = 0.5 + 0.5 * Math.sin(time * 6);
      const pad = 7 + pulse * 5;
      ctx.fillStyle = `rgba(220, 38, 38, ${0.26 + pulse * 0.16})`;
      ctx.fillRect(x0 - pad, y0 - pad, w + pad * 2, h + pad * 2);

      ctx.fillStyle = '#111827';
      ctx.fillRect(x0, y0, w, h / 3);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x0, y0 + h / 3, w, h / 3);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x0, y0 + (h * 2) / 3, w, h / 3);

      ctx.lineWidth = Math.max(3, r * 0.1);
      ctx.strokeStyle = INK;
      ctx.strokeRect(x0, y0, w, h);

      // Tiny eerie glowing white pinpoint eyes (classic Reichtangle!)
      const eyeY = y0 + h * 0.22;
      const eyeR = Math.max(2.2, r * 0.085);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-w * 0.22, eyeY, eyeR, 0, Math.PI * 2);
      ctx.arc(w * 0.22, eyeY, eyeR, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // Special Shape 2: Kazakhstan Brick
    if (id === 'kazakh_brick') {
      const w = r * 2.15;
      const h = r * 1.38;
      const x0 = -w / 2;
      const y0 = -h / 2;
      ctx.save();
      ctx.fillStyle = '#00afca';
      ctx.fillRect(x0, y0, w, h);
      // Side gold ornament stripe
      ctx.fillStyle = '#fec50c';
      ctx.fillRect(x0 + w * 0.07, y0 + h * 0.12, w * 0.08, h * 0.76);
      // Golden sun & eagle arc
      ctx.beginPath();
      ctx.arc(0, -h * 0.04, h * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, h * 0.22, h * 0.26, Math.PI * 1.15, Math.PI * 1.85);
      ctx.lineWidth = Math.max(2, r * 0.12);
      ctx.strokeStyle = '#fec50c';
      ctx.stroke();
      ctx.restore();

      ctx.lineWidth = strokeW;
      ctx.strokeStyle = INK;
      ctx.strokeRect(x0, y0, w, h);
      drawEyes(ctx, r * 0.9, mood || 'angry', lookX, lookY, { yOffset: -0.05 });
      return;
    }

    // Special Shape 3: Nepalrawr (double triangle pennant + jagged teeth!)
    if (id === 'nepal') {
      ctx.save();
      const s = r * 1.15;
      ctx.beginPath();
      ctx.moveTo(-s * 0.75, -s * 0.95);
      ctx.lineTo(s * 0.95, -s * 0.12);
      ctx.lineTo(s * 0.08, -s * 0.05);
      ctx.lineTo(s * 0.95, s * 0.88);
      ctx.lineTo(-s * 0.75, s * 0.88);
      ctx.closePath();
      ctx.fillStyle = '#dc143c';
      ctx.fill();
      ctx.lineWidth = Math.max(3, r * 0.16);
      ctx.strokeStyle = '#003893';
      ctx.stroke();
      ctx.lineWidth = Math.max(1.8, r * 0.08);
      ctx.strokeStyle = INK;
      ctx.stroke();

      // White sun emblem
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-s * 0.25, s * 0.45, s * 0.18, 0, Math.PI * 2);
      ctx.fill();

      // Classic Nepalrawr jagged white teeth along the mouth gap!
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = INK;
      ctx.lineWidth = Math.max(1.2, r * 0.06);
      ctx.beginPath();
      ctx.moveTo(s * 0.12, -s * 0.06);
      ctx.lineTo(s * 0.34, s * 0.16);
      ctx.lineTo(s * 0.48, -s * 0.07);
      ctx.lineTo(s * 0.68, s * 0.16);
      ctx.lineTo(s * 0.84, -s * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
      drawEyes(ctx, r * 0.82, mood === 'normal' ? 'angry' : mood, lookX, lookY, { spacing: 0.26, yOffset: -0.35 });
      return;
    }

    // Special Shape 4: Israel Hypercube
    if (id === 'israel') {
      const s = r * 1.55;
      const d = r * 0.34;
      const x0 = -s / 2;
      const y0 = -s / 2;
      ctx.save();
      // Back cube face (hypercube depth!)
      ctx.fillStyle = 'rgba(219, 234, 254, 0.55)';
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = Math.max(1.5, r * 0.07);
      ctx.fillRect(x0 + d, y0 - d, s, s);
      ctx.strokeRect(x0 + d, y0 - d, s, s);

      // Front face
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.fillRect(x0, y0, s, s);
      // Blue stripes
      ctx.fillStyle = '#0038b8';
      ctx.fillRect(x0, y0 + s * 0.1, s, s * 0.13);
      ctx.fillRect(x0, y0 + s * 0.77, s, s * 0.13);
      // Star of David
      ctx.strokeStyle = '#0038b8';
      ctx.lineWidth = Math.max(1.5, r * 0.08);
      const tr = s * 0.2;
      ctx.beginPath();
      ctx.moveTo(0, -tr);
      ctx.lineTo(tr * 0.86, tr * 0.5);
      ctx.lineTo(-tr * 0.86, tr * 0.5);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, tr);
      ctx.lineTo(tr * 0.86, -tr * 0.5);
      ctx.lineTo(-tr * 0.86, -tr * 0.5);
      ctx.closePath();
      ctx.stroke();

      // Cube edges
      ctx.strokeStyle = INK;
      ctx.lineWidth = strokeW;
      ctx.strokeRect(x0, y0, s, s);
      ctx.beginPath();
      ctx.moveTo(x0, y0); ctx.lineTo(x0 + d, y0 - d);
      ctx.moveTo(x0 + s, y0); ctx.lineTo(x0 + s + d, y0 - d);
      ctx.moveTo(x0 + s, y0 + s); ctx.lineTo(x0 + s + d, y0 + s - d);
      ctx.stroke();
      ctx.restore();

      drawEyes(ctx, r * 0.85, mood, lookX, lookY, { yOffset: -0.04 });
      return;
    }

    // Special Shape 5: Tringapore (Singapore equilateral triangle!)
    if (id === 'singapore') {
      const s = r * 1.18;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, -s * 1.05);
      ctx.lineTo(s * 1.02, s * 0.78);
      ctx.lineTo(-s * 1.02, s * 0.78);
      ctx.closePath();
      ctx.save();
      ctx.clip();
      ctx.fillStyle = '#ef3340';
      ctx.fillRect(-s * 1.2, -s * 1.2, s * 2.4, s * 1.24);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-s * 1.2, s * 0.04, s * 2.4, s * 1.0);
      // White crescent & tiny stars near top apex
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-s * 0.14, -s * 0.42, s * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef3340';
      ctx.beginPath();
      ctx.arc(-s * 0.07, -s * 0.42, s * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      for (let k = 0; k < 5; k++) {
        const a = (k * Math.PI * 2) / 5 - Math.PI / 2;
        ctx.beginPath();
        ctx.arc(s * 0.12 + Math.cos(a) * s * 0.09, -s * 0.42 + Math.sin(a) * s * 0.09, s * 0.032, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.lineWidth = strokeW;
      ctx.strokeStyle = INK;
      ctx.stroke();
      ctx.restore();

      drawEyes(ctx, r * 0.82, mood, lookX, lookY, { spacing: 0.3, yOffset: 0.22 });
      return;
    }

    // Special Shape 6: Switzerland (Authentic square flag!)
    if (id === 'switzerland') {
      const s = r * 1.72;
      const x0 = -s / 2;
      const y0 = -s / 2;
      ctx.save();
      ctx.fillStyle = '#da291c';
      ctx.beginPath();
      ctx.roundRect(x0, y0, s, s, r * 0.16);
      ctx.fill();
      // Bold white Swiss cross
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-s * 0.13, -s * 0.34, s * 0.26, s * 0.68);
      ctx.fillRect(-s * 0.34, -s * 0.13, s * 0.68, s * 0.26);
      ctx.lineWidth = strokeW;
      ctx.strokeStyle = INK;
      ctx.stroke();
      // Cute white medic/alpine cap badge on top
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(-s * 0.34, y0 - s * 0.22, s * 0.68, s * 0.24, r * 0.1);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#da291c';
      ctx.fillRect(-s * 0.04, y0 - s * 0.18, s * 0.08, s * 0.16);
      ctx.fillRect(-s * 0.08, y0 - s * 0.14, s * 0.16, s * 0.08);
      ctx.restore();

      drawEyes(ctx, r * 0.85, mood, lookX, lookY, { spacing: 0.38, yOffset: -0.1 });
      return;
    }

    // Special Shape 7: Mother UFO Boss
    if (id === 'boss_ufo') {
      ctx.save();
      // Glass dome
      ctx.beginPath();
      ctx.arc(0, -r * 0.25, r * 0.68, Math.PI, 0);
      ctx.fillStyle = '#67e8f9';
      ctx.fill();
      ctx.lineWidth = strokeW;
      ctx.strokeStyle = INK;
      ctx.stroke();

      // Alien inside dome
      ctx.beginPath();
      ctx.arc(0, -r * 0.28, r * 0.36, 0, Math.PI * 2);
      ctx.fillStyle = '#4ade80';
      ctx.fill();
      ctx.stroke();
      drawEyes(ctx, r * 0.48, 'angry', lookX, lookY, { yOffset: -0.62 });

      // Metallic saucer body
      ctx.beginPath();
      ctx.ellipse(0, r * 0.08, r * 1.22, r * 0.42, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#64748b';
      ctx.fill();
      ctx.stroke();

      // Spinning glowing lights
      for (let i = 0; i < 6; i++) {
        const a = time * 4 + (i * Math.PI * 2) / 6;
        const lx = Math.cos(a) * r * 0.88;
        const ly = r * 0.08 + Math.sin(a) * r * 0.2;
        ctx.fillStyle = i % 2 === 0 ? '#facc15' : '#f43f5e';
        ctx.beginPath();
        ctx.arc(lx, ly, r * 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    // Special Shape 8: Imperial Zeppelin Airship Boss (Stage 2!)
    if (id === 'boss_zepp') {
      ctx.save();
      // Tail stabilizer fins (black-white-red imperial stripes!)
      ctx.lineWidth = strokeW;
      ctx.strokeStyle = INK;
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-r * 0.85, -r * 0.45);
      ctx.lineTo(-r * 1.42, -r * 0.88);
      ctx.lineTo(-r * 1.28, -r * 0.12);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.moveTo(-r * 0.85, r * 0.45);
      ctx.lineTo(-r * 1.42, r * 0.85);
      ctx.lineTo(-r * 1.28, r * 0.12);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Gondola pod underneath
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(-r * 0.42, r * 0.52, r * 0.84, r * 0.34, r * 0.1);
      ctx.fill(); ctx.stroke();

      // Rigid metallic airship hull
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.02, r * 1.32, r * 0.68, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-r * 1.4, -r, r * 2.8, r * 2);
      // Imperial tri-band stripe along the middle
      ctx.fillStyle = '#111827';
      ctx.fillRect(-r * 1.4, -r * 0.72, r * 2.8, r * 0.24);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-r * 1.4, r * 0.38, r * 2.8, r * 0.34);
      // Iron cross badge
      ctx.fillStyle = '#111827';
      ctx.fillRect(-r * 0.65, -r * 0.22, r * 0.16, r * 0.42);
      ctx.fillRect(-r * 0.78, -r * 0.09, r * 0.42, r * 0.16);
      ctx.restore();

      ctx.beginPath();
      ctx.ellipse(0, -r * 0.02, r * 1.32, r * 0.68, 0, 0, Math.PI * 2);
      ctx.stroke();

      drawEyes(ctx, r * 0.82, 'angry', lookX, lookY, { spacing: 0.28, yOffset: -0.05 });
      ctx.restore();
      return;
    }

    // Spherical Countryballs
    switch (id) {
      case 'poland':
        drawFlagCircle(ctx, r, () => {
          // Authentic Polandball: RED on TOP, WHITE on BOTTOM!
          ctx.fillStyle = '#dc143c';
          ctx.fillRect(-r, -r, r * 2, r);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-r, 0, r * 2, r);
        });
        drawEyes(ctx, r, mood, lookX, lookY);
        break;

      case 'japan':
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-r, -r, r * 2, r * 2);
          ctx.fillStyle = '#bc002d';
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.54, 0, Math.PI * 2);
          ctx.fill();
        });
        // Iconic white Hachimaki headband with red tie!
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1.5, r * 0.08);
        ctx.beginPath();
        ctx.roundRect(-r * 0.92, -r * 0.62, r * 1.84, r * 0.26, r * 0.1);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#bc002d';
        ctx.beginPath();
        ctx.arc(0, -r * 0.49, r * 0.09, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        drawEyes(ctx, r, mood === 'normal' ? 'angry' : mood, lookX, lookY, { yOffset: 0.02 });
        break;

      case 'usa':
        drawFlagCircle(ctx, r, () => {
          for (let i = 0; i < 9; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#b22234' : '#ffffff';
            ctx.fillRect(-r, -r + (i * r * 2) / 9, r * 2, (r * 2) / 9 + 0.5);
          }
          ctx.fillStyle = '#3c3b6e';
          ctx.fillRect(-r, -r, r * 1.05, r * 1.05);
          ctx.fillStyle = '#ffffff';
          for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
              ctx.beginPath();
              ctx.arc(-r * 0.78 + col * r * 0.34, -r * 0.72 + row * r * 0.3, r * 0.07, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        });
        // Iconic USA dark sunglasses!
        if (mood === 'dead') {
          drawEyes(ctx, r, 'dead', lookX, lookY);
        } else {
          ctx.save();
          const ox = (lookX || 0) * r * 0.18;
          const oy = (lookY || 0) * r * 0.1;
          ctx.translate(ox, -r * 0.08 + oy);
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = INK;
          ctx.lineWidth = Math.max(1.5, r * 0.08);
          // Left lens
          ctx.beginPath();
          ctx.roundRect(-r * 0.74, -r * 0.22, r * 0.64, r * 0.42, [4, 4, 10, 10]);
          ctx.fill(); ctx.stroke();
          // Right lens
          ctx.beginPath();
          ctx.roundRect(r * 0.1, -r * 0.22, r * 0.64, r * 0.42, [4, 4, 10, 10]);
          ctx.fill(); ctx.stroke();
          // Bridge
          ctx.fillRect(-r * 0.12, -r * 0.12, r * 0.24, r * 0.12);
          // White shine on shades
          ctx.strokeStyle = 'rgba(255,255,255,0.65)';
          ctx.lineWidth = Math.max(1.5, r * 0.07);
          ctx.beginPath();
          ctx.moveTo(-r * 0.6, -r * 0.12); ctx.lineTo(-r * 0.42, r * 0.08);
          ctx.moveTo(r * 0.24, -r * 0.12); ctx.lineTo(r * 0.42, r * 0.08);
          ctx.stroke();
          ctx.restore();
        }
        break;

      case 'uk':
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#012169';
          ctx.fillRect(-r, -r, r * 2, r * 2);
          // Diagonals
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = r * 0.34;
          ctx.beginPath();
          ctx.moveTo(-r, -r); ctx.lineTo(r, r);
          ctx.moveTo(r, -r); ctx.lineTo(-r, r);
          ctx.stroke();
          ctx.strokeStyle = '#c8102e';
          ctx.lineWidth = r * 0.15;
          ctx.beginPath();
          ctx.moveTo(-r, -r); ctx.lineTo(r, r);
          ctx.moveTo(r, -r); ctx.lineTo(-r, r);
          ctx.stroke();
          // Cross
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-r * 0.26, -r, r * 0.52, r * 2);
          ctx.fillRect(-r, -r * 0.26, r * 2, r * 0.52);
          ctx.fillStyle = '#c8102e';
          ctx.fillRect(-r * 0.15, -r, r * 0.3, r * 2);
          ctx.fillRect(-r, -r * 0.15, r * 2, r * 0.3);
        });
        drawEyes(ctx, r, mood, lookX, lookY);
        // Golden monocle on right eye
        ctx.save();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = Math.max(1.6, r * 0.08);
        ctx.beginPath();
        ctx.arc(r * 0.33 + (lookX || 0) * r * 0.18, -r * 0.06, r * 0.26, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(r * 0.56 + (lookX || 0) * r * 0.18, r * 0.08);
        ctx.quadraticCurveTo(r * 0.72, r * 0.45, r * 0.45, r * 0.78);
        ctx.stroke();
        // Top hat!
        ctx.fillStyle = '#18181b';
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1.6, r * 0.08);
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.9, r * 0.82, r * 0.2, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.fillRect(-r * 0.52, -r * 1.65, r * 1.04, r * 0.78);
        ctx.strokeRect(-r * 0.52, -r * 1.65, r * 1.04, r * 0.78);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-r * 0.52, -r * 1.08, r * 1.04, r * 0.18);
        ctx.restore();
        break;

      case 'france':
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#002395';
          ctx.fillRect(-r, -r, (r * 2) / 3, r * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-r / 3, -r, (r * 2) / 3, r * 2);
          ctx.fillStyle = '#ed2939';
          ctx.fillRect(r / 3, -r, (r * 2) / 3, r * 2);
        });
        drawEyes(ctx, r, mood, lookX, lookY);
        // Stylish French Beret!
        ctx.save();
        ctx.translate(-r * 0.08, -r * 0.88);
        ctx.rotate(-0.18);
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1.6, r * 0.08);
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.78, r * 0.32, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.3);
        ctx.lineTo(r * 0.08, -r * 0.5);
        ctx.stroke();
        ctx.restore();
        break;

      case 'germany':
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#111111';
          ctx.fillRect(-r, -r, r * 2, (r * 2) / 3);
          ctx.fillStyle = '#dd0000';
          ctx.fillRect(-r, -r / 3, r * 2, (r * 2) / 3);
          ctx.fillStyle = '#ffce00';
          ctx.fillRect(-r, r / 3, r * 2, (r * 2) / 3);
        });
        drawEyes(ctx, r, mood, lookX, lookY);
        // Sharp rectangular glasses
        if (mood !== 'dead') {
          ctx.save();
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = Math.max(1.5, r * 0.07);
          const ox = (lookX || 0) * r * 0.2;
          ctx.strokeRect(-r * 0.58 + ox, -r * 0.28, r * 0.48, r * 0.42);
          ctx.strokeRect(r * 0.1 + ox, -r * 0.28, r * 0.48, r * 0.42);
          ctx.beginPath();
          ctx.moveTo(-r * 0.1 + ox, -r * 0.08);
          ctx.lineTo(r * 0.1 + ox, -r * 0.08);
          ctx.stroke();
          ctx.restore();
        }
        break;

      case 'spqr':
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(-r, -r, r * 2, r * 2);
          ctx.fillStyle = '#fbbf24';
          ctx.font = `900 ${Math.round(r * 0.46)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('SPQR', 0, r * 0.46);
        });
        drawEyes(ctx, r, mood === 'normal' ? 'angry' : mood, lookX, lookY, { yOffset: -0.14 });
        // Golden laurel wreath crown
        ctx.save();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = Math.max(2, r * 0.12);
        ctx.beginPath();
        ctx.arc(0, -r * 0.25, r * 0.82, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
        ctx.restore();
        break;

      case 'italy':
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#009246';
          ctx.fillRect(-r, -r, (r * 2) / 3, r * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-r / 3, -r, (r * 2) / 3, r * 2);
          ctx.fillStyle = '#ce2b37';
          ctx.fillRect(r / 3, -r, (r * 2) / 3, r * 2);
        });
        drawEyes(ctx, r, mood, lookX, lookY);
        // Puffy white Italian Chef Hat (Toque)!
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1.5, r * 0.08);
        ctx.beginPath();
        ctx.arc(-r * 0.36, -r * 1.18, r * 0.34, 0, Math.PI * 2);
        ctx.arc(0, -r * 1.32, r * 0.38, 0, Math.PI * 2);
        ctx.arc(r * 0.36, -r * 1.18, r * 0.34, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-r * 0.56, -r * 1.16, r * 1.12, r * 0.34);
        ctx.beginPath();
        ctx.arc(-r * 0.36, -r * 1.18, r * 0.34, Math.PI * 0.75, Math.PI * 1.9);
        ctx.arc(0, -r * 1.32, r * 0.38, Math.PI * 1.05, Math.PI * 1.95);
        ctx.arc(r * 0.36, -r * 1.18, r * 0.34, Math.PI * 1.1, Math.PI * 0.25);
        ctx.lineTo(r * 0.56, -r * 0.82);
        ctx.lineTo(-r * 0.56, -r * 0.82);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.restore();
        break;

      case 'russia':
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-r, -r, r * 2, (r * 2) / 3);
          ctx.fillStyle = '#0039a6';
          ctx.fillRect(-r, -r / 3, r * 2, (r * 2) / 3);
          ctx.fillStyle = '#d52b1e';
          ctx.fillRect(-r, r / 3, r * 2, (r * 2) / 3);
        });
        drawEyes(ctx, r, mood === 'normal' ? 'angry' : mood, lookX, lookY, { yOffset: 0.02 });
        // Cozy Ushanka fur hat with earflaps & red star!
        ctx.save();
        ctx.fillStyle = '#57534e';
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1.6, r * 0.08);
        // Earflaps
        ctx.beginPath();
        ctx.roundRect(-r * 1.06, -r * 0.65, r * 0.32, r * 0.9, r * 0.12);
        ctx.roundRect(r * 0.74, -r * 0.65, r * 0.32, r * 0.9, r * 0.12);
        ctx.fill(); ctx.stroke();
        // Fur dome
        ctx.fillStyle = '#78716c';
        ctx.beginPath();
        ctx.roundRect(-r * 0.88, -r * 1.32, r * 1.76, r * 0.76, [r * 0.32, r * 0.32, r * 0.1, r * 0.1]);
        ctx.fill(); ctx.stroke();
        // Front fur brim + red star
        ctx.fillStyle = '#a8a29e';
        ctx.beginPath();
        ctx.roundRect(-r * 0.68, -r * 1.1, r * 1.36, r * 0.5, r * 0.12);
        ctx.fill(); ctx.stroke();
        drawStar(ctx, 0, -r * 0.85, 5, r * 0.22, r * 0.09, '#dc2626');
        ctx.restore();
        break;

      case 'sweden':
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#006aa7';
          ctx.fillRect(-r, -r, r * 2, r * 2);
          ctx.fillStyle = '#fecc02';
          ctx.fillRect(-r * 0.42, -r, r * 0.3, r * 2);
          ctx.fillRect(-r, -r * 0.15, r * 2, r * 0.3);
        });
        drawEyes(ctx, r, mood, lookX, lookY);
        // Sleek Nordic Viking helm
        ctx.save();
        ctx.fillStyle = '#cbd5e1';
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1.6, r * 0.08);
        ctx.beginPath();
        ctx.arc(0, -r * 0.45, r * 0.84, Math.PI, 0);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fef3c7';
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(side * r * 0.6, -r * 0.75);
          ctx.quadraticCurveTo(side * r * 1.15, -r * 0.9, side * r * 1.05, -r * 1.34);
          ctx.quadraticCurveTo(side * r * 0.82, -r * 1.05, side * r * 0.45, -r * 0.94);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
        }
        ctx.restore();
        break;

      case 'spain':
        drawFlagCircle(ctx, r, () => {
          // Authentic 1:2:1 Spanish flag (Red - Gold - Red)
          ctx.fillStyle = '#aa151b';
          ctx.fillRect(-r, -r, r * 2, r * 0.5);
          ctx.fillStyle = '#f1bf00';
          ctx.fillRect(-r, -r * 0.5, r * 2, r);
          ctx.fillStyle = '#aa151b';
          ctx.fillRect(-r, r * 0.5, r * 2, r * 0.5);
          // Simplified Spanish Coat of Arms (left of center on yellow band)
          const cx = -r * 0.34;
          const cy = r * 0.14;
          // Pillars of Hercules
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(cx - r * 0.24, cy - r * 0.16, r * 0.08, r * 0.32);
          ctx.fillRect(cx + r * 0.16, cy - r * 0.16, r * 0.08, r * 0.32);
          // Red ribbon across pillars
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(cx - r * 0.27, cy - r * 0.03, r * 0.54, r * 0.06);
          // Heraldic shield
          ctx.fillStyle = '#b91c1c';
          ctx.strokeStyle = INK;
          ctx.lineWidth = Math.max(1, r * 0.045);
          ctx.beginPath();
          ctx.roundRect(cx - r * 0.14, cy - r * 0.16, r * 0.28, r * 0.3, [2, 2, r * 0.12, r * 0.12]);
          ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#facc15';
          ctx.fillRect(cx - r * 0.11, cy - r * 0.13, r * 0.1, r * 0.12);
          ctx.fillRect(cx + r * 0.01, cy, r * 0.1, r * 0.11);
          // Tiny crown above shield
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(cx, cy - r * 0.21, r * 0.09, Math.PI, 0);
          ctx.fill();
          ctx.fillStyle = '#facc15';
          ctx.fillRect(cx - r * 0.1, cy - r * 0.22, r * 0.2, r * 0.05);
        });
        drawEyes(ctx, r, mood, lookX, lookY);
        // Iconic Black Matador Montera Hat + Crimson Rose!
        ctx.save();
        ctx.fillStyle = '#18181b';
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1.5, r * 0.08);
        // Side ear-caps of the montera
        ctx.beginPath();
        ctx.ellipse(-r * 0.72, -r * 0.76, r * 0.26, r * 0.22, -0.35, 0, Math.PI * 2);
        ctx.ellipse(r * 0.72, -r * 0.76, r * 0.26, r * 0.22, 0.35, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        // Main curved crown of the montera
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.9, r * 0.68, r * 0.3, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        // Gold embroidery accent
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = Math.max(1.4, r * 0.06);
        ctx.beginPath();
        ctx.arc(0, -r * 0.88, r * 0.42, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
        // Crimson Rose tucked on the right side
        ctx.fillStyle = '#e11d48';
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1.1, r * 0.05);
        ctx.beginPath();
        ctx.arc(r * 0.56, -r * 0.92, r * 0.16, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fda4af';
        ctx.beginPath();
        ctx.arc(r * 0.54, -r * 0.94, r * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;

      case 'portugal':
        drawFlagCircle(ctx, r, () => {
          // Authentic Portugal flag: 40% deep green (left) / 60% crimson red (right)
          const splitX = -r * 0.2;
          ctx.fillStyle = '#006600';
          ctx.fillRect(-r, -r, r * 0.8, r * 2);
          ctx.fillStyle = '#da291c';
          ctx.fillRect(splitX, -r, r * 1.2, r * 2);
          // Golden Armillary Sphere centered on the green/red boundary
          const cy = r * 0.14;
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = Math.max(1.6, r * 0.075);
          ctx.beginPath();
          ctx.arc(splitX, cy, r * 0.34, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(splitX, cy, r * 0.34, r * 0.14, 0.35, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(splitX, cy, r * 0.14, r * 0.34, 0, 0, Math.PI * 2);
          ctx.stroke();
          // Portuguese Shield (red border + white inner + 5 blue quinas)
          ctx.fillStyle = '#dc2626';
          ctx.strokeStyle = INK;
          ctx.lineWidth = Math.max(1.1, r * 0.05);
          ctx.beginPath();
          ctx.roundRect(splitX - r * 0.19, cy - r * 0.21, r * 0.38, r * 0.42, [2, 2, r * 0.16, r * 0.16]);
          ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(splitX - r * 0.12, cy - r * 0.14, r * 0.24, r * 0.28, [1, 1, r * 0.1, r * 0.1]);
          ctx.fill();
          // 5 blue escutcheons (quinas) in cross pattern
          ctx.fillStyle = '#1d4ed8';
          const q = r * 0.036;
          for (const [qx, qy] of [[0, 0], [0, -0.08], [0, 0.08], [-0.07, 0], [0.07, 0]]) {
            ctx.beginPath();
            ctx.arc(splitX + qx * r, cy + qy * r, q, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        drawEyes(ctx, r, mood, lookX, lookY);
        // Age of Discovery Navigator Tricorne Hat with Gold Trim & Azure Plume!
        ctx.save();
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1.6, r * 0.08);
        // Feather plume behind hat
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(r * 0.45, -r * 0.95);
        ctx.quadraticCurveTo(r * 1.05, -r * 1.48, r * 0.62, -r * 1.56);
        ctx.quadraticCurveTo(r * 0.32, -r * 1.38, r * 0.3, -r * 0.96);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Navy admiral tricorne hat body
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.moveTo(-r * 0.92, -r * 0.72);
        ctx.quadraticCurveTo(-r * 0.55, -r * 1.45, 0, -r * 1.24);
        ctx.quadraticCurveTo(r * 0.55, -r * 1.45, r * 0.92, -r * 0.72);
        ctx.quadraticCurveTo(0, -r * 0.56, -r * 0.92, -r * 0.72);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Golden trim & compass emblem on hat front
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = Math.max(1.5, r * 0.065);
        ctx.beginPath();
        ctx.moveTo(-r * 0.74, -r * 0.8);
        ctx.quadraticCurveTo(0, -r * 1.15, r * 0.74, -r * 0.8);
        ctx.stroke();
        drawStar(ctx, 0, -r * 0.96, 4, r * 0.16, r * 0.06, '#facc15');
        ctx.restore();
        break;

      // === ENEMIES ===
      case 'slime_ball':
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#475569';
          ctx.fillRect(-r, -r, r * 2, r);
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(-r, 0, r * 2, r);
        });
        drawEyes(ctx, r, 'angry', lookX, lookY);
        break;

      case 'pirate_ball':
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(-r, -r, r * 2, r * 2);
          drawStar(ctx, 0, r * 0.35, 5, r * 0.34, r * 0.14, '#ffffff');
        });
        drawEyes(ctx, r, 'angry', lookX, lookY);
        // Pirate eyepatch
        ctx.save();
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1.8, r * 0.09);
        ctx.beginPath();
        ctx.moveTo(-r * 0.88, -r * 0.45);
        ctx.lineTo(r * 0.82, r * 0.15);
        ctx.stroke();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(r * 0.32, -r * 0.06, r * 0.23, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;

      case 'cameroon_ball':
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#007a5e';
          ctx.fillRect(-r, -r, (r * 2) / 3, r * 2);
          ctx.fillStyle = '#ce1126';
          ctx.fillRect(-r / 3, -r, (r * 2) / 3, r * 2);
          ctx.fillStyle = '#fcd116';
          ctx.fillRect(r / 3, -r, (r * 2) / 3, r * 2);
          // Central golden star of Cameroon
          drawStar(ctx, 0, r * 0.38, 5, r * 0.28, r * 0.11, '#fcd116');
        });
        drawEyes(ctx, r, 'angry', lookX, lookY, { yOffset: -0.14 });
        break;

      case 'mali_ball':
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#14b53a';
          ctx.fillRect(-r, -r, (r * 2) / 3, r * 2);
          ctx.fillStyle = '#fcd116';
          ctx.fillRect(-r / 3, -r, (r * 2) / 3, r * 2);
          ctx.fillStyle = '#ce1126';
          ctx.fillRect(r / 3, -r, (r * 2) / 3, r * 2);
        });
        drawEyes(ctx, r, 'angry', lookX, lookY);
        break;

      case 'viking_ball':
      case 'boss_viking': {
        const isKing = id === 'boss_viking';
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = isKing ? '#b91c1c' : '#1d4ed8';
          ctx.fillRect(-r, -r, r * 2, r * 2);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(-r * 0.36, -r, r * 0.28, r * 2);
          ctx.fillRect(-r, -r * 0.14, r * 2, r * 0.28);
        });
        drawEyes(ctx, r, 'angry', lookX, lookY);
        // Horned Viking helmet!
        ctx.save();
        ctx.fillStyle = isKing ? '#f59e0b' : '#94a3b8';
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1.8, r * 0.08);
        ctx.beginPath();
        ctx.arc(0, -r * 0.35, r * 0.88, Math.PI, 0);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Horns
        ctx.fillStyle = '#fef3c7';
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(side * r * 0.65, -r * 0.72);
          ctx.quadraticCurveTo(side * r * 1.25, -r * 0.9, side * r * 1.15, -r * 1.42);
          ctx.quadraticCurveTo(side * r * 0.88, -r * 1.08, side * r * 0.48, -r * 0.94);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
        }
        ctx.restore();
        break;
      }

      case 'speed_ball':
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#f97316';
          ctx.fillRect(-r, -r, r * 2, r * 2);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(-r, -r * 0.25, r * 2, r * 0.5);
          ctx.fillStyle = '#111827';
          for (let i = -3; i <= 3; i++) {
            if (i % 2 === 0) ctx.fillRect(i * r * 0.3, -r * 0.25, r * 0.3, r * 0.25);
            else ctx.fillRect(i * r * 0.3, 0, r * 0.3, r * 0.25);
          }
        });
        drawEyes(ctx, r, 'dash', lookX, lookY, { yOffset: -0.1 });
        break;

      case 'turret_ball':
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#365314';
          ctx.fillRect(-r, -r, r * 2, r * 2);
          ctx.fillStyle = '#4d7c0f';
          ctx.beginPath();
          ctx.arc(-r * 0.3, r * 0.3, r * 0.5, 0, Math.PI * 2);
          ctx.fill();
        });
        drawEyes(ctx, r, 'angry', lookX, lookY);
        // Cannon barrel on top
        ctx.save();
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1.5, r * 0.08);
        ctx.fillRect(-r * 0.25, -r * 1.25, r * 0.5, r * 0.42);
        ctx.strokeRect(-r * 0.25, -r * 1.25, r * 0.5, r * 0.42);
        ctx.restore();
        break;

      case 'alien_ball':
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(-r, -r, r * 2, r * 2);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, r * 0.42, r * 0.32, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#14532d';
          ctx.font = `900 ${Math.round(r * 0.44)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('6', 0, r * 0.44);
        });
        // Antennae
        ctx.save();
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1.6, r * 0.08);
        const wob = Math.sin(time * 8) * r * 0.14;
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(side * r * 0.35, -r * 0.88);
          ctx.lineTo(side * r * 0.65 + wob, -r * 1.38);
          ctx.stroke();
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(side * r * 0.65 + wob, -r * 1.38, r * 0.15, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();
        }
        ctx.restore();
        drawEyes(ctx, r, 'angry', lookX, lookY, { yOffset: -0.1 });
        break;

      case 'boss_prussia':
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#111827';
          ctx.fillRect(-r, -r, r * 2, r * 0.42);
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(-r, -r * 0.58, r * 2, r * 1.16);
          ctx.fillStyle = '#111827';
          ctx.fillRect(-r, r * 0.58, r * 2, r * 0.42);
          // Iron cross
          ctx.fillStyle = '#111827';
          ctx.fillRect(-r * 0.12, r * 0.12, r * 0.24, r * 0.48);
          ctx.fillRect(-r * 0.26, r * 0.26, r * 0.52, r * 0.2);
        });
        drawEyes(ctx, r, 'angry', lookX, lookY, { yOffset: -0.14 });
        // Pickelhaube spiked helmet!
        ctx.save();
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(2, r * 0.08);
        ctx.beginPath();
        ctx.arc(0, -r * 0.35, r * 0.9, Math.PI, 0);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(-r * 0.16, -r * 1.15);
        ctx.lineTo(0, -r * 1.72);
        ctx.lineTo(r * 0.16, -r * 1.15);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.restore();
        break;

      case 'boss_ottoman':
        // Stage 1 Mid-Boss 2: Ottoman Empire with iconic white onion turban & crescent!
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#c8102e';
          ctx.fillRect(-r, -r, r * 2, r * 2);
          // White crescent & star on lower half
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-r * 0.14, r * 0.38, r * 0.32, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#c8102e';
          ctx.beginPath();
          ctx.arc(-r * 0.04, r * 0.38, r * 0.25, 0, Math.PI * 2);
          ctx.fill();
          drawStar(ctx, r * 0.26, r * 0.38, 5, r * 0.16, r * 0.07, '#ffffff');
        });
        drawEyes(ctx, r, 'angry', lookX, lookY, { yOffset: -0.1 });
        // Giant Ottoman Onion Turban + Ruby Jewel!
        ctx.save();
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(2, r * 0.08);
        ctx.beginPath();
        ctx.ellipse(0, -r * 1.06, r * 0.92, r * 0.56, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        // Turban wrap folds
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = Math.max(1.8, r * 0.06);
        ctx.beginPath();
        ctx.arc(0, -r * 1.04, r * 0.65, Math.PI * 1.12, Math.PI * 1.88);
        ctx.stroke();
        // Gold band & ruby crest
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1.5, r * 0.06);
        ctx.beginPath();
        ctx.roundRect(-r * 0.78, -r * 0.88, r * 1.56, r * 0.2, r * 0.08);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -r * 0.78, r * 0.14, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.restore();
        break;

      case 'boss_napoleon': {
        // Stage 1 Final Boss: First French Empire (Napoleonball with giant Bicorn Hat!)
        const pulse = 0.5 + 0.5 * Math.sin(time * 6);
        ctx.fillStyle = `rgba(250, 204, 21, ${0.22 + pulse * 0.14})`;
        ctx.beginPath();
        ctx.arc(0, 0, r * (1.22 + pulse * 0.08), 0, Math.PI * 2);
        ctx.fill();
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#002395';
          ctx.fillRect(-r, -r, (r * 2) / 3, r * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-r / 3, -r, (r * 2) / 3, r * 2);
          ctx.fillStyle = '#ed2939';
          ctx.fillRect(r / 3, -r, (r * 2) / 3, r * 2);
          // Golden Imperial N crest on center white stripe
          drawStar(ctx, 0, r * 0.44, 5, r * 0.24, r * 0.11, '#eab308');
        });
        drawEyes(ctx, r, 'angry', lookX, lookY, { yOffset: -0.06 });
        // Massive iconic Napoleon Bicorn Hat with Tricolore Cockade!
        ctx.save();
        ctx.fillStyle = '#111827';
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(2, r * 0.08);
        ctx.beginPath();
        ctx.moveTo(-r * 1.28, -r * 0.62);
        ctx.quadraticCurveTo(0, -r * 1.78, r * 1.28, -r * 0.62);
        ctx.quadraticCurveTo(0, -r * 0.92, -r * 1.28, -r * 0.62);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Gold trim along hat edge
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = Math.max(2, r * 0.07);
        ctx.beginPath();
        ctx.moveTo(-r * 1.1, -r * 0.7);
        ctx.quadraticCurveTo(0, -r * 1.56, r * 1.1, -r * 0.7);
        ctx.stroke();
        // Classic French Cockade on front of Bicorn!
        ctx.fillStyle = '#ed2939';
        ctx.beginPath(); ctx.arc(0, -r * 1.06, r * 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(0, -r * 1.06, r * 0.13, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#002395';
        ctx.beginPath(); ctx.arc(0, -r * 1.06, r * 0.07, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        break;
      }

      case 'boss_hussar':
        // Stage 2 Mid-Boss 1: Winged Hussar Polish-Lithuanian Commonwealth!
        // Dramatic feathered Hussar wings behind the ball
        ctx.save();
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1.8, r * 0.07);
        for (const side of [-1, 1]) {
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.moveTo(side * r * 0.55, r * 0.15);
          ctx.quadraticCurveTo(side * r * 1.52, -r * 0.55, side * r * 1.18, -r * 1.55);
          ctx.quadraticCurveTo(side * r * 0.92, -r * 0.95, side * r * 0.38, -r * 0.55);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
          // Feather lines
          ctx.strokeStyle = '#94a3b8';
          for (let f = 0; f < 4; f++) {
            const fy = -r * (0.35 + f * 0.26);
            ctx.beginPath();
            ctx.moveTo(side * r * (0.65 + f * 0.12), fy);
            ctx.lineTo(side * r * (1.28 - f * 0.03), fy - r * 0.14);
            ctx.stroke();
          }
          ctx.strokeStyle = INK;
        }
        ctx.restore();

        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#dc143c';
          ctx.fillRect(-r, -r, r * 2, r * 0.65);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-r, -r * 0.35, r * 2, r * 0.7);
          ctx.fillStyle = '#dc143c';
          ctx.fillRect(-r, r * 0.35, r * 2, r * 0.65);
          drawStar(ctx, 0, r * 0.36, 5, r * 0.24, r * 0.1, '#facc15');
        });
        drawEyes(ctx, r, 'angry', lookX, lookY, { yOffset: -0.06 });
        // Silver Hussar helmet
        ctx.save();
        ctx.fillStyle = '#cbd5e1';
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1.8, r * 0.08);
        ctx.beginPath();
        ctx.arc(0, -r * 0.42, r * 0.85, Math.PI, 0);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.restore();
        break;

      case 'boss_british_empire':
        // Stage 2 Mid-Boss 2: British Empire (Extra-tall Imperial Top Hat + Royal Plume + Monocle!)
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#012169';
          ctx.fillRect(-r, -r, r * 2, r * 2);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = r * 0.34;
          ctx.beginPath();
          ctx.moveTo(-r, -r); ctx.lineTo(r, r);
          ctx.moveTo(r, -r); ctx.lineTo(-r, r);
          ctx.stroke();
          ctx.strokeStyle = '#c8102e';
          ctx.lineWidth = r * 0.15;
          ctx.beginPath();
          ctx.moveTo(-r, -r); ctx.lineTo(r, r);
          ctx.moveTo(r, -r); ctx.lineTo(-r, r);
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-r * 0.26, -r, r * 0.52, r * 2);
          ctx.fillRect(-r, -r * 0.26, r * 2, r * 0.52);
          ctx.fillStyle = '#c8102e';
          ctx.fillRect(-r * 0.15, -r, r * 0.3, r * 2);
          ctx.fillRect(-r, -r * 0.15, r * 2, r * 0.3);
        });
        drawEyes(ctx, r, 'angry', lookX, lookY);
        ctx.save();
        // Gleaming Imperial golden monocle
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = Math.max(2, r * 0.08);
        ctx.beginPath();
        ctx.arc(r * 0.33, -r * 0.06, r * 0.28, 0, Math.PI * 2);
        ctx.stroke();
        // Extra-tall Imperial Top Hat with gold crown ribbon!
        ctx.fillStyle = '#18181b';
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(2, r * 0.08);
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.88, r * 0.92, r * 0.22, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.fillRect(-r * 0.56, -r * 1.88, r * 1.12, r * 1.02);
        ctx.strokeRect(-r * 0.56, -r * 1.88, r * 1.12, r * 1.02);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-r * 0.56, -r * 1.12, r * 1.12, r * 0.2);
        ctx.restore();
        break;

      case 'boss_ussr': {
        // Stage 2 Final Boss: Soviet Union (USSR) with Hammer & Sickle + Giant Fur Ushanka!
        const pulse = 0.5 + 0.5 * Math.sin(time * 6);
        ctx.fillStyle = `rgba(220, 38, 38, ${0.24 + pulse * 0.16})`;
        ctx.beginPath();
        ctx.arc(0, 0, r * (1.22 + pulse * 0.08), 0, Math.PI * 2);
        ctx.fill();
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#cc0000';
          ctx.fillRect(-r, -r, r * 2, r * 2);
          // Golden star & crossed emblem on lower-left
          drawStar(ctx, -r * 0.34, r * 0.34, 5, r * 0.24, r * 0.1, '#facc15');
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = Math.max(2.5, r * 0.09);
          ctx.beginPath();
          ctx.arc(r * 0.22, r * 0.38, r * 0.24, Math.PI * 0.25, Math.PI * 1.45);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(r * 0.06, r * 0.54);
          ctx.lineTo(r * 0.42, r * 0.18);
          ctx.stroke();
        });
        drawEyes(ctx, r, 'angry', lookX, lookY, { yOffset: -0.02 });
        // Huge Soviet Fur Ushanka!
        ctx.save();
        ctx.fillStyle = '#44403c';
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(2, r * 0.08);
        ctx.beginPath();
        ctx.roundRect(-r * 1.12, -r * 0.62, r * 0.34, r * 0.96, r * 0.12);
        ctx.roundRect(r * 0.78, -r * 0.62, r * 0.34, r * 0.96, r * 0.12);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#57534e';
        ctx.beginPath();
        ctx.roundRect(-r * 0.94, -r * 1.42, r * 1.88, r * 0.84, [r * 0.34, r * 0.34, r * 0.1, r * 0.1]);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#78716c';
        ctx.beginPath();
        ctx.roundRect(-r * 0.72, -r * 1.18, r * 1.44, r * 0.54, r * 0.12);
        ctx.fill(); ctx.stroke();
        drawStar(ctx, 0, -r * 0.9, 5, r * 0.26, r * 0.11, '#ef4444');
        ctx.restore();
        break;
      }

      case 'boss_nasa':
        // Stage 3 Mid-Boss 1: Space-Crazed Rocket USA with Astronaut Glass Helmet & Twin Thrusters!
        ctx.save();
        // Twin side rocket boosters + animated flame!
        const flame = 0.85 + 0.3 * Math.sin(time * 24);
        for (const side of [-1, 1]) {
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.moveTo(side * r * 1.08, r * 0.38);
          ctx.lineTo(side * r * 0.94, r * (0.38 + 0.55 * flame));
          ctx.lineTo(side * r * 1.22, r * 0.38);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#e2e8f0';
          ctx.strokeStyle = INK;
          ctx.lineWidth = Math.max(1.8, r * 0.07);
          ctx.beginPath();
          ctx.roundRect(side < 0 ? -r * 1.24 : r * 0.92, -r * 0.4, r * 0.32, r * 0.82, r * 0.12);
          ctx.fill(); ctx.stroke();
        }
        ctx.restore();
        // USA Flag ball + shades
        drawFlagCircle(ctx, r, () => {
          for (let i = 0; i < 9; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#b22234' : '#ffffff';
            ctx.fillRect(-r, -r + (i * r * 2) / 9, r * 2, (r * 2) / 9 + 0.5);
          }
          ctx.fillStyle = '#3c3b6e';
          ctx.fillRect(-r, -r, r * 1.05, r * 1.05);
          ctx.fillStyle = '#ffffff';
          for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
              ctx.beginPath();
              ctx.arc(-r * 0.78 + col * r * 0.34, -r * 0.72 + row * r * 0.3, r * 0.07, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        });
        // Sunglasses
        ctx.save();
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1.6, r * 0.08);
        ctx.beginPath();
        ctx.roundRect(-r * 0.74, -r * 0.28, r * 0.64, r * 0.4, [4, 4, 10, 10]);
        ctx.roundRect(r * 0.1, -r * 0.28, r * 0.64, r * 0.4, [4, 4, 10, 10]);
        ctx.fill(); ctx.stroke();
        // Translucent Glass Space Helmet Dome!
        ctx.strokeStyle = '#38bdf8';
        ctx.fillStyle = 'rgba(186, 230, 253, 0.22)';
        ctx.lineWidth = Math.max(2.5, r * 0.08);
        ctx.beginPath();
        ctx.arc(0, -r * 0.04, r * 1.16, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        // Helmet glare
        ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        ctx.lineWidth = Math.max(2, r * 0.07);
        ctx.beginPath();
        ctx.arc(0, -r * 0.04, r * 0.96, Math.PI * 1.15, Math.PI * 1.48);
        ctx.stroke();
        ctx.restore();
        break;

      case 'boss_alien_king': {
        // Stage 3 Mid-Boss 3: Giant Crowned Alien 6-Ball Emperor!
        const pulse = 0.5 + 0.5 * Math.sin(time * 7);
        ctx.fillStyle = `rgba(74, 222, 128, ${0.24 + pulse * 0.14})`;
        ctx.beginPath();
        ctx.arc(0, 0, r * (1.22 + pulse * 0.08), 0, Math.PI * 2);
        ctx.fill();
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#15803d';
          ctx.fillRect(-r, -r, r * 2, r * 2);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, r * 0.42, r * 0.34, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#14532d';
          ctx.font = `900 ${Math.round(r * 0.48)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('6', 0, r * 0.44);
        });
        // Glowing antennae + Golden Cosmic Crown!
        ctx.save();
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(2, r * 0.08);
        const wob2 = Math.sin(time * 9) * r * 0.14;
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(side * r * 0.48, -r * 0.85);
          ctx.lineTo(side * r * 0.82 + wob2, -r * 1.42);
          ctx.stroke();
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(side * r * 0.82 + wob2, -r * 1.42, r * 0.16, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();
        }
        // Golden King Crown in center
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(-r * 0.52, -r * 0.92);
        ctx.lineTo(-r * 0.62, -r * 1.46);
        ctx.lineTo(-r * 0.22, -r * 1.18);
        ctx.lineTo(0, -r * 1.56);
        ctx.lineTo(r * 0.22, -r * 1.18);
        ctx.lineTo(r * 0.62, -r * 1.46);
        ctx.lineTo(r * 0.52, -r * 0.92);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.restore();
        drawEyes(ctx, r, 'angry', lookX, lookY, { yOffset: -0.1 });
        break;
      }

      // === STAGE 4 (黄金の古代砂漠) BOSSES ===
      case 'boss_egypt': {
        // Pharaoh Nemes headdress behind & around ball
        ctx.save();
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(2, r * 0.08);
        // Lapis-blue & gold Nemes side drapes
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(-r * 1.18, r * 0.65);
        ctx.quadraticCurveTo(-r * 1.32, -r * 0.45, -r * 0.72, -r * 1.12);
        ctx.lineTo(r * 0.72, -r * 1.12);
        ctx.quadraticCurveTo(r * 1.32, -r * 0.45, r * 1.18, r * 0.65);
        ctx.lineTo(r * 0.75, r * 0.75);
        ctx.lineTo(-r * 0.75, r * 0.75);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Lapis blue stripes on Nemes sides
        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = Math.max(2, r * 0.085);
        for (let k = -2; k <= 2; k++) {
          const sy = k * r * 0.25;
          ctx.beginPath();
          ctx.moveTo(-r * 1.14, sy); ctx.lineTo(-r * 0.85, sy);
          ctx.moveTo(r * 0.85, sy); ctx.lineTo(r * 1.14, sy);
          ctx.stroke();
        }
        ctx.restore();

        drawFlagCircle(ctx, r, () => {
          // Authentic Egypt flag: Red / White / Black + Golden Eagle of Saladin
          ctx.fillStyle = '#ce1126';
          ctx.fillRect(-r, -r, r * 2, (r * 2) / 3);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-r, -r / 3, r * 2, (r * 2) / 3);
          ctx.fillStyle = '#111827';
          ctx.fillRect(-r, r / 3, r * 2, (r * 2) / 3);
          // Golden Eagle of Saladin in white band
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.moveTo(0, -r * 0.14);
          ctx.lineTo(r * 0.22, r * 0.06);
          ctx.lineTo(r * 0.12, r * 0.24);
          ctx.lineTo(-r * 0.12, r * 0.24);
          ctx.lineTo(-r * 0.22, r * 0.06);
          ctx.closePath();
          ctx.fill();
        });
        // Golden Pharaoh headband & Uraeus cobra crest on top!
        ctx.save();
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1.8, r * 0.07);
        ctx.beginPath();
        ctx.roundRect(-r * 0.82, -r * 1.06, r * 1.64, r * 0.3, r * 0.1);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -r * 1.16, r * 0.18, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.restore();
        drawEyes(ctx, r, 'angry', lookX, lookY, { yOffset: -0.05 });
        break;
      }

      case 'boss_mongol': {
        drawFlagCircle(ctx, r, () => {
          // Royal Mongol Blue banner with crimson bands & golden Soyombo crest
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(-r, -r, r * 2, r * 2);
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(-r, -r, r * 0.56, r * 2);
          ctx.fillRect(r * 0.44, -r, r * 0.56, r * 2);
          // Golden Soyombo sun & crescent on left
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(-r * 0.72, r * 0.14, r * 0.16, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(-r * 0.8, r * 0.32, r * 0.16, r * 0.28);
          // Golden Tamga / steppe emblem in center
          drawStar(ctx, 0, r * 0.36, 4, r * 0.24, r * 0.1, '#facc15');
        });
        // Mongol Warrior Fur-Trimmed Conical Helmet with Crimson Plume!
        ctx.save();
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(2, r * 0.08);
        // Crimson horsehair plume waving at apex
        const sway = Math.sin(time * 8) * r * 0.16;
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.56);
        ctx.quadraticCurveTo(r * 0.55 + sway, -r * 1.72, r * 0.78 + sway, -r * 1.15);
        ctx.quadraticCurveTo(r * 0.38, -r * 1.32, 0, -r * 1.44);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Steel conical dome
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(-r * 0.88, -r * 0.62);
        ctx.quadraticCurveTo(-r * 0.52, -r * 1.35, 0, -r * 1.58);
        ctx.quadraticCurveTo(r * 0.52, -r * 1.35, r * 0.88, -r * 0.62);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Fluffy brown fur brim
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.roundRect(-r * 0.96, -r * 0.78, r * 1.92, r * 0.3, r * 0.14);
        ctx.fill(); ctx.stroke();
        ctx.restore();
        drawEyes(ctx, r, 'angry', lookX, lookY, { yOffset: -0.02 });
        break;
      }

      case 'boss_byzantine': {
        drawFlagCircle(ctx, r, () => {
          // Imperial Tyrian Purple-Crimson & Gold Tetragrammic Cross!
          ctx.fillStyle = '#7e22ce';
          ctx.fillRect(-r, -r, r * 2, r * 2);
          // Bold gold Byzantine cross
          ctx.fillStyle = '#facc15';
          ctx.fillRect(-r * 0.16, -r, r * 0.32, r * 2);
          ctx.fillRect(-r, -r * 0.14, r * 2, r * 0.28);
          // Four golden B firesteels in corners
          ctx.font = `900 ${Math.round(r * 0.34)}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('B', -r * 0.48, r * 0.44);
          ctx.fillText('B', r * 0.48, r * 0.44);
        });
        // Ornate Golden Byzantine Imperial Crown with Pearl Pendilia!
        ctx.save();
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1.8, r * 0.075);
        // Dangling pearl chains on both sides
        ctx.fillStyle = '#f8fafc';
        for (const side of [-1, 1]) {
          for (let j = 0; j < 3; j++) {
            ctx.beginPath();
            ctx.arc(side * r * 0.88, -r * 0.56 + j * r * 0.22, r * 0.09, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
          }
        }
        // Golden domed kamelaukion crown
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(0, -r * 0.78, r * 0.74, Math.PI, 0);
        ctx.lineTo(r * 0.82, -r * 0.65);
        ctx.lineTo(-r * 0.82, -r * 0.65);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Ruby & emerald jewels + golden cross atop crown
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(0, -r * 0.92, r * 0.13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath(); ctx.arc(-r * 0.44, -r * 0.84, r * 0.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(r * 0.44, -r * 0.84, r * 0.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-r * 0.06, -r * 1.76, r * 0.12, r * 0.34);
        ctx.fillRect(-r * 0.16, -r * 1.66, r * 0.32, r * 0.1);
        ctx.restore();
        drawEyes(ctx, r, 'angry', lookX, lookY, { yOffset: -0.08 });
        break;
      }

      case 'boss_pyramid': {
        // Stage 4 Final Boss: Towering Golden Giza Pharaoh Pyramid!
        const s = r * 1.24;
        const pulse = 0.5 + 0.5 * Math.sin(time * 6);
        ctx.save();
        // Shimmering golden desert aura (lightweight, no shadowBlur!)
        ctx.fillStyle = `rgba(250, 204, 21, ${0.22 + pulse * 0.16})`;
        ctx.beginPath();
        ctx.moveTo(0, -s * 1.28);
        ctx.lineTo(s * 1.28, s * 0.96);
        ctx.lineTo(-s * 1.28, s * 0.96);
        ctx.closePath();
        ctx.fill();

        // Main pyramid triangle
        ctx.beginPath();
        ctx.moveTo(0, -s * 1.12);
        ctx.lineTo(s * 1.1, s * 0.84);
        ctx.lineTo(-s * 1.1, s * 0.84);
        ctx.closePath();
        ctx.save();
        ctx.clip();
        // Sunlit left face & warm amber shaded right face
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-s * 1.2, -s * 1.2, s * 1.2, s * 2.2);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(0, -s * 1.2, s * 1.2, s * 2.2);
        // Lapis-blue royal capstone stripes at apex
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(-s, -s * 0.88, s * 2, s * 0.16);
        ctx.fillRect(-s, -s * 0.58, s * 2, s * 0.12);
        // Ancient stone block masonry lines
        ctx.strokeStyle = 'rgba(120, 53, 15, 0.38)';
        ctx.lineWidth = Math.max(1.5, r * 0.05);
        for (let row = -1; row <= 3; row++) {
          const ly = row * s * 0.26;
          ctx.beginPath();
          ctx.moveTo(-s * 1.15, ly); ctx.lineTo(s * 1.15, ly);
          ctx.stroke();
        }
        // Center ridge line
        ctx.beginPath();
        ctx.moveTo(0, -s * 1.12); ctx.lineTo(0, s * 0.84);
        ctx.stroke();
        ctx.restore();

        // Crisp ink outline
        ctx.lineWidth = Math.max(3, r * 0.1);
        ctx.strokeStyle = INK;
        ctx.stroke();

        // Floating golden sun disk above pyramid apex!
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, -s * 1.24, r * 0.22, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.restore();

        drawEyes(ctx, r * 0.92, 'angry', lookX, lookY, { spacing: 0.3, yOffset: 0.2 });
        break;
      }

      default:
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#64748b';
          ctx.fillRect(-r, -r, r * 2, r * 2);
        });
        drawEyes(ctx, r, mood, lookX, lookY);
    }
  }

  // High-speed Offscreen Sprite Cache for massive enemy swarms & projectiles
  const ballSpriteCache = new Map();
  const emojiSpriteCache = new Map();

  function getCachedBallSprite(id, r, mood) {
    const bucketR = Math.round(r);
    const key = `${id}:${bucketR}:${mood}`;
    let entry = ballSpriteCache.get(key);
    if (entry) return entry;

    const dpr = 2;
    const half = Math.ceil(bucketR * 2.2);
    const size = half * 2;
    const off = document.createElement('canvas');
    off.width = size * dpr;
    off.height = size * dpr;
    const octx = off.getContext('2d');
    octx.scale(dpr, dpr);
    octx.translate(half, half);
    drawCountry(octx, id, bucketR, mood, 0, 0, 0);
    entry = { canvas: off, half, size };
    ballSpriteCache.set(key, entry);
    return entry;
  }

  function getEmojiSprite(emoji, sizePx = 48) {
    const key = `${emoji}:${sizePx}`;
    let cv = emojiSpriteCache.get(key);
    if (cv) return cv;
    const dim = Math.ceil(sizePx * 1.45);
    cv = document.createElement('canvas');
    cv.width = dim;
    cv.height = dim;
    const octx = cv.getContext('2d');
    octx.font = `${sizePx}px sans-serif`;
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillText(emoji, dim / 2, dim / 2 + 1);
    emojiSpriteCache.set(key, cv);
    return cv;
  }

  function drawBall(ctx, x, y, r, id, opts = {}) {
    const {
      mood = 'normal',
      lookX = 0,
      lookY = 0,
      time = 0,
      moving = false,
      hitFlash = 0,
      ghost = false,
      label = null,
      labelColor = '#ffffff',
      cached = false
    } = opts;

    // Classic cute Polandball bounce-hop animation while moving!
    const hopFreq = opts.hopFreq || 11;
    const hopPhase = moving ? Math.abs(Math.sin(time * hopFreq)) : Math.abs(Math.sin(time * 3)) * 0.22;
    const hopY = hopPhase * r * 0.28;
    const scaleX = moving ? 1 + (0.5 - hopPhase) * 0.14 : 1 + Math.sin(time * 3) * 0.02;
    const scaleY = moving ? 1 - (0.5 - hopPhase) * 0.14 : 1 - Math.sin(time * 3) * 0.02;

    ctx.save();
    ctx.translate(x, y);

    // Ground contact shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.24)';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.85, r * (0.95 - hopPhase * 0.2), r * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    if (ghost) ctx.globalAlpha = 0.55;

    ctx.translate(0, -hopY);
    ctx.scale(scaleX, scaleY);

    if (cached) {
      const sp = getCachedBallSprite(id, r, ghost ? 'dead' : mood);
      ctx.drawImage(sp.canvas, -sp.half, -sp.half, sp.size, sp.size);
    } else {
      drawCountry(ctx, id, r, ghost ? 'dead' : mood, lookX, lookY, time);
    }

    // Hit flash overlay
    if (hitFlash > 0) {
      ctx.globalAlpha = Math.min(0.75, hitFlash);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.05, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Optional player tag (1P / 2P)
    if (label) {
      ctx.save();
      ctx.font = '900 12px "M PLUS Rounded 1c", system-ui, sans-serif';
      ctx.textAlign = 'center';
      const ly = y - r * 1.48 - hopY;
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = INK;
      ctx.strokeText(label, x, ly);
      ctx.fillStyle = labelColor;
      ctx.fillText(label, x, ly);
      ctx.restore();
    }
  }

  function renderBallToCanvas(canvas, id, mood = 'normal', time = 0) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const r = Math.min(w, h) * 0.29;
    drawBall(ctx, w / 2, h * 0.58, r, id, { mood, time, moving: false });
  }

  return { drawBall, renderBallToCanvas, getEmojiSprite };
})();
