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
      // Menacing red pulse aura
      ctx.save();
      const pulse = 0.5 + 0.5 * Math.sin(time * 6);
      ctx.shadowColor = 'rgba(220, 38, 38, 0.75)';
      ctx.shadowBlur = 16 + pulse * 10;
      ctx.fillStyle = '#111827';
      ctx.fillRect(x0, y0, w, h / 3);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x0, y0 + h / 3, w, h / 3);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x0, y0 + (h * 2) / 3, w, h / 3);
      ctx.restore();

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

    // Special Shape 5: Mother UFO Boss
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
          ctx.fillStyle = '#bbf7d0';
          ctx.beginPath();
          ctx.arc(0, r * 0.42, r * 0.32, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#14532d';
          ctx.font = `900 ${Math.round(r * 0.42)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('8', 0, r * 0.44);
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

      default:
        drawFlagCircle(ctx, r, () => {
          ctx.fillStyle = '#64748b';
          ctx.fillRect(-r, -r, r * 2, r * 2);
        });
        drawEyes(ctx, r, mood, lookX, lookY);
    }
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
      labelColor = '#ffffff'
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
    ctx.fillStyle = 'rgba(15, 23, 42, 0.26)';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.85, r * (0.95 - hopPhase * 0.2), r * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    if (ghost) ctx.globalAlpha = 0.55;

    ctx.translate(0, -hopY);
    ctx.scale(scaleX, scaleY);

    drawCountry(ctx, id, r, ghost ? 'dead' : mood, lookX, lookY, time);

    // Hit flash overlay
    if (hitFlash > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.75, hitFlash);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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

  return { drawBall, renderBallToCanvas };
})();
