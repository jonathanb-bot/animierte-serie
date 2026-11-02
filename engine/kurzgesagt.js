/* Kurzgesagt-Richtung für die Kurzvideo-Staffeln (taeglich/): große, leuchtende Kulissen mit Tiefe und ein Kino-Look.
   Jonathans Wunsch vom 1.11. (Vorbild: „Dinge Erklärt – Kurzgesagt“, „KI hat das Undenkbare getan“).
   Nur neue Kulissen-Namen und ein Kino-Look, der ausschließlich mit `@kino` wirkt: die bisherigen Serien bleiben pixelgleich. */
(() => {
  const { box, circle, ellipse, poly, line, shade, rgba, lgrad, rgrad, mix, clamp, lerp, E } = A;
  // Varianten für die Bildbibliothek: `variante=N` verschiebt alle Zufalls-Startwerte. Ohne Angabe (0) bleibt alles pixelgleich.
  const rnd = seed => A.rnd(seed + (A._kgVar || 0) * 7919);
  const W = A.W, H = A.H, SZ = A.SZ;
  const HIMMEL = { tag: ["#3f7fc0", "#a9d4ec"], morgen: ["#4b5d9a", "#f2b58a"], abend: ["#2a2c66", "#e9805a"], nacht: ["#060a1e", "#1d2650"] };
  const zeitVon = (s, std = "nacht") => (HIMMEL[s.zeit] ? s.zeit : std);
  const lw = (name, w, h) => { const k = "_kg_" + name; if (!A[k]) { const c = document.createElement("canvas"); c.width = w; c.height = h; A[k] = c.getContext("2d"); } return A[k]; };
  const glut = (x, y, r, farbe, a = 1) => { ctx.fillStyle = rgrad(x, y, 0, r, [[0, rgba(farbe, 0.9 * a)], [0.25, rgba(farbe, 0.4 * a)], [1, rgba(farbe, 0)]]); ctx.fillRect(x - r, y - r, r * 2, r * 2); };
  const sterne = (n, seed, t, x0 = -900, y0 = -900, w = 2900, h = 2600) => {
    const r = rnd(seed);
    for (let i = 0; i < n; i++) { const x = x0 + r() * w, y = y0 + r() * h, g = r(), a = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.3 + r()) + i)); circle(x, y, 1.2 + g * 3, rgba(g > 0.9 ? "#ffe9b0" : "#ffffff", 0.8 * a)); if (g > 0.93) glut(x, y, 16, "#cfe0ff", 0.5 * a); }
  };
  const nebel = (y, h, farbe, a) => { ctx.fillStyle = lgrad(0, y - h, 0, y + h, [[0, rgba(farbe, 0)], [0.5, rgba(farbe, a)], [1, rgba(farbe, 0)]]); ctx.fillRect(-1500, y - h, 4080, h * 2); };

  // ---------- Kino-Look: Glühen heller Stellen + feine Körnung (nur mit @kino) ----------
  // Hook-Text (Experiment der Analyse vom 1.11.): großer Satz in Großbuchstaben, nur in den ersten 2,5 s, nur wenn gesetzt
  const hookText = (s, T) => {
    const t = T - s.start, dauer = Math.min(2.5, s.dauer);
    if (t < 0 || t > dauer) return;
    const ein = E.pop(clamp(t / 0.25, 0, 1)), aus = clamp((dauer - t) / 0.3, 0, 1);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const woerter = String(s.hooktext).toUpperCase().split(/\s+/).filter(Boolean);
    let fs = 96; ctx.font = `900 ${fs}px Titel`;
    const zeilen = []; let z = "";
    for (const w of woerter) { const v = z ? z + " " + w : w; if (z && ctx.measureText(v).width > 900) { zeilen.push(z); z = w; } else z = v; }
    if (z) zeilen.push(z);
    const breit = Math.max(...zeilen.map(l => ctx.measureText(l).width));
    if (breit > 960) { fs = Math.floor(fs * 960 / breit); ctx.font = `900 ${fs}px Titel`; }
    ctx.globalAlpha = aus; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.translate(W / 2, 300); ctx.scale(0.8 + 0.2 * ein, 0.8 + 0.2 * ein);
    const lh = fs * 1.12, y0 = -(zeilen.length - 1) * lh / 2;
    ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 26; ctx.shadowOffsetY = 5;
    zeilen.forEach((l, i) => { ctx.fillStyle = "#ffffff"; ctx.fillText(l, 0, y0 + i * lh); });
    ctx.restore();
  };

  A.nachbearbeitung = (s, T) => {
    const k = Number(s.kino) || 0;
    if (k <= 0) { if (s.hooktext) hookText(s, T); return; }
    const w4 = W / 4, h4 = H / 4, a = lw("klein", w4, h4), b = lw("glow", w4, h4);
    a.setTransform(1, 0, 0, 1, 0, 0); a.filter = "none"; a.clearRect(0, 0, w4, h4); a.drawImage(A.cv, 0, 0, w4, h4);
    b.setTransform(1, 0, 0, 1, 0, 0); b.clearRect(0, 0, w4, h4); b.filter = "brightness(0.56) contrast(6) saturate(1.4) blur(7px)"; // nur echte Lichter glühen, helle Wände nicht (sonst milchig) b.drawImage(a.canvas, 0, 0); b.filter = "none";
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = clamp(0.6 * k, 0, 0.9); ctx.drawImage(b.canvas, 0, 0, W, H);
    // Körnung: Rauschkachel, pro Bild versetzt (aus der Zeit abgeleitet, also reproduzierbar)
    if (!A._kg_rausch) {
      const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d"), d = g.createImageData(256, 256), r = rnd(77);
      for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() - 0.5) * 110; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
      g.putImageData(d, 0, 0); A._kg_rausch = ctx.createPattern(c, "repeat");
    }
    // stehende Papier-Körnung wie bei Kurzgesagt: bewegtes Rauschen würde die Datenrate verdreifachen und beim
    // Neu-Komprimieren von TikTok/Instagram/YouTube zu Matsch werden (gemessen 1.11.: 7,6 statt 2,9 Mbit/s)
    const ox = 0, oy = 0;
    ctx.globalCompositeOperation = "overlay"; ctx.globalAlpha = clamp(0.1 * k, 0, 0.2);
    ctx.translate(-ox, -oy); ctx.fillStyle = A._kg_rausch; ctx.fillRect(0, 0, W + 256, H + 256);
    ctx.restore();
    if (s.hooktext) hookText(s, T);
  };

  // =====================================================================
  // WELTALL – Erde mit Atmosphäre, Nachtseite mit Stadtlichtern, Sterne, Nebel (erde=false, sonne, satellit, mond)
  // =====================================================================
  SZ.weltall = (s, t) => {
    ctx.fillStyle = rgrad(540, 700, 100, 1700, [[0, "#1a1d4a"], [0.6, "#0b0d26"], [1, "#04050f"]]); ctx.fillRect(-1500, -1500, 4080, 4000);
    for (const [x, y, r, c, a] of [[200, 400, 600, "#6a3fa0", 0.22], [900, 700, 500, "#2a7fa0", 0.18], [500, 200, 400, "#a03f7a", 0.12]]) glut(x, y, r, c, a);
    // ferne Spiralgalaxie
    ctx.save(); ctx.translate(820, 560); ctx.rotate(-0.5 + t * 0.01); ctx.scale(1, 0.42);
    glut(0, 0, 230, "#b9a0ff", 0.45); glut(0, 0, 60, "#fff1d6", 0.9);
    for (const arm of [0, Math.PI]) { ctx.beginPath(); for (let k = 0; k <= 40; k++) { const a = arm + k * 0.12, rr = 12 + k * 5; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.lineWidth = 14; ctx.strokeStyle = rgba("#d8c8ff", 0.25); ctx.stroke(); }
    ctx.restore();
    sterne(220, 12, t);
    // hellste Sterne mit Strahlenkreuz
    { const r = rnd(44); for (let i = 0; i < 9; i++) { const x = -100 + r() * 1300, y = 80 + r() * 900, l = 14 + r() * 22, a = 0.5 + 0.5 * Math.abs(Math.sin(t * 0.8 + i)); line(x - l, y, x + l, y, 2, rgba("#ffffff", 0.5 * a)); line(x, y - l, x, y + l, 2, rgba("#ffffff", 0.5 * a)); circle(x, y, 3, "#ffffff"); glut(x, y, 30, "#cfe0ff", 0.6 * a); } }
    if (s.sonne) { glut(980, 160, 520, "#ffcf8a", 0.9); circle(980, 160, 60, "#fff6e0"); A.licht(980, 160, 900, "#ffd59a", 1.2); }
    if (s.mond) { circle(170, 380, 70, "#c9ccd6"); ctx.save(); ctx.beginPath(); ctx.arc(170, 380, 70, 0, Math.PI * 2); ctx.clip(); circle(205, 360, 70, rgba("#0b0d26", 0.35)); ctx.restore(); circle(150, 360, 14, "#aeb2bf"); circle(195, 405, 10, "#aeb2bf"); circle(160, 410, 7, "#b6bac6"); }
    if (s.erde !== false) {
      const cx = 540, cy = s.erde_y ?? 1650, R = s.erde_r ?? 820;
      glut(cx, cy, R * 1.25, "#5fb8ff", 0.55);
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = rgrad(cx - R * 0.3, cy - R * 0.4, R * 0.1, R * 1.1, [[0, "#3f8fd8"], [1, "#163a7a"]]); ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      // Meeresströmungen (feine, hellere Bänder)
      for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.ellipse(cx - 100 + k * 40, cy - R * 0.2 + k * 60, R * 0.9, R * 0.3, 0.1, Math.PI * 1.1, Math.PI * 1.9); ctx.lineWidth = 6; ctx.strokeStyle = rgba("#7fc0f0", 0.12); ctx.stroke(); }
      const r = rnd(5), dreh = (t * 6) % 2400;
      for (let i = 0; i < 9; i++) {
        const bx = cx - R - 600 + ((r() * 2400 + dreh) % 2400), by = cy - R * 0.85 + r() * R * 0.9, bw = 140 + r() * 260, bh = 80 + r() * 160;
        // weiche Kontinent-Form: Punkte auf einer welligen Ellipse, mit Kurven verbunden; helle Küste, dunklere Mitte
        const pk = []; for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, rr = 0.8 + 0.25 * Math.sin(k * 2.3 + i * 1.7); pk.push([bx + Math.cos(a) * bw * rr, by + Math.sin(a) * bh * rr]); }
        const pfad = () => { ctx.beginPath(); ctx.moveTo((pk[7][0] + pk[0][0]) / 2, (pk[7][1] + pk[0][1]) / 2); for (let k = 0; k < 8; k++) { const n = pk[(k + 1) % 8]; ctx.quadraticCurveTo(pk[k][0], pk[k][1], (pk[k][0] + n[0]) / 2, (pk[k][1] + n[1]) / 2); } ctx.closePath(); };
        const land = i % 3 ? "#5f9a5a" : "#b8a46a";
        pfad(); ctx.lineWidth = 16; ctx.strokeStyle = rgba("#9fe0d0", 0.35); ctx.stroke();
        pfad(); ctx.fillStyle = land; ctx.fill();
        ellipse(bx + bw * 0.1, by + bh * 0.1, bw * 0.45, bh * 0.4, shade(land, -0.12));
        if (i % 3 === 1) ellipse(bx - bw * 0.2, by - bh * 0.15, bw * 0.25, bh * 0.2, "#c9b07a");
      }
      ctx.fillStyle = rgrad(cx - 60, cy - R * 1.02, 10, R * 0.32, [[0, rgba("#f4fbff", 0.85)], [1, rgba("#f4fbff", 0)]]); ctx.fillRect(cx - R, cy - R, R * 2, R * 0.4); // Polkappe, weich
      // Wolken: Bänder und Wirbel
      for (let i = 0; i < 14; i++) { const x = cx - R + ((r() * 2 * R + t * 10) % (2 * R)), y = cy - R * 0.9 + r() * R * 0.8; ellipse(x, y, 90 + r() * 120, 18 + r() * 14, rgba("#ffffff", 0.55)); }
      for (let i = 0; i < 3; i++) { const x = cx - R * 0.6 + r() * R * 0.9 + t * 8, y = cy - R * 0.75 + r() * R * 0.5; for (let k = 0; k < 5; k++) ellipse(x + Math.cos(k * 1.3) * 40 * (k / 5), y + Math.sin(k * 1.3) * 22 * (k / 5), 70 - k * 9, 16 - k * 2, rgba("#ffffff", 0.22)); } // weiche Wolkenwirbel
      // Glanzlicht auf dem Ozean
      glut(cx - R * 0.35, cy - R * 0.55, R * 0.45, "#e9f6ff", 0.35);
      // Nachtseite rechts mit Stadtlichtern in Gruppen
      ctx.fillStyle = lgrad(cx - R * 0.2, 0, cx + R * 0.6, 0, [[0, "rgba(4,6,20,0)"], [1, "rgba(4,6,20,0.82)"]]); ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      for (let g = 0; g < 18; g++) { const gx = cx + R * 0.25 + r() * R * 0.7, gy = cy - R * 0.85 + r() * R * 0.85; glut(gx, gy, 40, "#ffb84d", 0.3); for (let i = 0; i < 12; i++) circle(gx + (r() - 0.5) * 70, gy + (r() - 0.5) * 50, 1.4 + r() * 2, rgba("#ffd27a", 0.55 + 0.4 * r())); }
      // Dunst am Rand der Atmosphäre
      ctx.fillStyle = rgrad(cx, cy, R * 0.82, R, [[0, "rgba(143,214,255,0)"], [1, "rgba(143,214,255,0.35)"]]); ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      ctx.restore();
      ctx.fillStyle = rgrad(cx, cy, R, R + 50, [[0, "rgba(159,224,255,0.75)"], [1, "rgba(159,224,255,0)"]]); ctx.beginPath(); ctx.arc(cx, cy, R + 50, 0, Math.PI * 2); ctx.arc(cx, cy, R, 0, Math.PI * 2, true); ctx.fill();
    }
    if (s.satellit) { const a = t * 0.35; const x = 540 + Math.cos(a) * 420, y = 700 + Math.sin(a) * 120; ctx.save(); ctx.translate(x, y); ctx.rotate(0.3); box(-14, -10, 28, 20, 4, "#d9dde4"); box(-60, -6, 40, 12, 2, "#3d6fb5"); box(20, -6, 40, 12, 2, "#3d6fb5"); for (const sx of [-50, -40, -30, 30, 40, 50]) line(sx, -6, sx, 6, 1.5, "#6f9fd8"); line(0, -10, 0, -24, 2, "#d9dde4"); ctx.restore(); circle(x + 4, y - 14, 3, Math.sin(t * 6) > 0 ? "#ff5b4d" : "#7a2a24"); }
    A.figurenZeigen(s, t, 1500, 0.8);
    A._dunkel = 0;
  };

  // =====================================================================
  // GROSSSTADT – Stadt mit Tiefe: Skyline-Schichten, Nebel, leuchtende Fenster, Lichtspuren (dach: Figuren auf einem Dach vorne)
  // =====================================================================
  SZ.grossstadt = (s, t) => {
    const zeit = zeitVon(s), nacht = zeit === "nacht", hc = HIMMEL[zeit], abends = nacht || zeit === "abend";
    ctx.fillStyle = lgrad(0, -600, 0, 1300, [[0, hc[0]], [1, hc[1]]]); ctx.fillRect(-1500, -1500, 4080, 3200);
    if (nacht) {
      sterne(80, 3, t, -900, -900, 2900, 1500);
      circle(820, 260, 58, "#f1ead2"); circle(805, 245, 10, "#ddd5bc"); circle(838, 278, 7, "#ddd5bc"); glut(820, 260, 260, "#cfd8ff", 0.35);
      ctx.fillStyle = lgrad(0, 700, 0, 1100, [[0, "rgba(255,170,90,0)"], [1, "rgba(255,170,90,0.22)"]]); ctx.fillRect(-1500, 700, 4080, 400); // Lichtglocke der Stadt
      const fx = ((t * 40) % 1800) - 300; circle(fx, 380, 3, "#ffffff"); if (Math.sin(t * 7) > 0.6) { circle(fx + 14, 382, 4, "#ff5b4d"); glut(fx + 14, 382, 20, "#ff5b4d", 0.6); } // Flugzeug
    } else glut(300, 900, 700, zeit === "tag" ? "#fff2c4" : "#ffb070", 0.55);
    const kanteFarbe = nacht ? "#9fb4ff" : "#ffd9a8";
    const schichten = [[1060, 0.35, 260, 620, 0.78], [1180, 0.55, 300, 760, 0.6], [1330, 0.78, 380, 900, 0.38], [1520, 1, 420, 1050, 0.16]];
    schichten.forEach(([basis, tiefe, hMin, hMax, nebelA], li) => {
      const r = rnd(11 + li * 7), farbe = mix(nacht ? "#0c1026" : "#3a4466", hc[1], nebelA * 0.9);
      for (let x = -700; x < 1800;) {
        const w = (70 + r() * 150) * (0.6 + tiefe * 0.6), h = hMin + r() * (hMax - hMin), top = basis - h;
        box(x, top, w, h + 400, 3, farbe);
        box(x + w * 0.74, top, w * 0.26, h + 400, 0, shade(farbe, -0.12)); // Schattenseite
        line(x + w - 1.5, top + 4, x + w - 1.5, basis, 2 + tiefe * 2, rgba(kanteFarbe, 0.12 + 0.18 * tiefe)); // Randlicht
        // Dachaufbauten
        const art = r();
        if (tiefe >= 0.55 && art < 0.22) { const tw = 26 * tiefe + 10, tx = x + w * 0.3; box(tx - 2, top - 12 * tiefe, 3, 12 * tiefe, 1, shade(farbe, -0.2)); box(tx + tw - 2, top - 12 * tiefe, 3, 12 * tiefe, 1, shade(farbe, -0.2)); box(tx - 4, top - 40 * tiefe - 10, tw + 6, 30 * tiefe + 4, 6, shade(farbe, 0.06)); ellipse(tx + tw / 2, top - 40 * tiefe - 10, tw / 2 + 3, 5, shade(farbe, 0.15)); }
        else if (tiefe >= 0.55 && art < 0.45) { for (let k = 0; k < 3; k++) box(x + 10 + k * w * 0.25, top - 14 * tiefe, w * 0.16, 14 * tiefe, 2, shade(farbe, 0.08)); }
        else if (art < 0.62) { box(x + w * 0.2, top - 50 * tiefe, w * 0.6, 50 * tiefe + 2, 2, farbe); box(x + w * 0.2 + w * 0.6 * 0.74, top - 50 * tiefe, w * 0.6 * 0.26, 50 * tiefe, 0, shade(farbe, -0.12)); }
        if (r() < 0.25) { const ax = x + w / 2, ay = top - 60 * tiefe - (art < 0.62 ? 50 * tiefe : 0); line(ax, ay + 60 * tiefe, ax, ay, 3, farbe); if (Math.sin(t * 3 + x) > 0) { circle(ax, ay, 4, "#ff4d3d"); glut(ax, ay, 24, "#ff4d3d", 0.6); } }
        // Fenster: Häuser unterschiedlich belebt, warme und kühle Töne, halb zugezogene Vorhänge
        if (abends) {
          const belebt = 0.1 + r() * 0.45, fw = 8 * tiefe + 3, fh = 12 * tiefe + 4;
          for (let yy = top + 20 * tiefe; yy < basis - 10; yy += 34 * tiefe + 8) for (let xx = x + 8; xx < x + w - 12; xx += 22 * tiefe + 6) {
            if (r() >= belebt) { if (tiefe >= 0.78) box(xx, yy, fw, fh, 1, rgba("#000000", 0.18)); continue; }
            const z = r(), c = z < 0.55 ? "#ffd27a" : z < 0.75 ? "#ffbf66" : z < 0.88 ? "#ffe6b0" : "#9fd6ff", a = 0.55 + 0.4 * tiefe;
            if (z > 0.93 && tiefe >= 0.78) { box(xx, yy + fh * 0.45, fw, fh * 0.55, 1, rgba(c, a)); box(xx, yy, fw, fh * 0.45, 1, rgba("#3a2a40", 0.8)); }
            else box(xx, yy, fw, fh, 1, rgba(c, a));
            if (tiefe === 1) { line(xx + fw / 2, yy, xx + fw / 2, yy + fh, 1.5, rgba("#2a2030", 0.5)); if (r() < 0.15) glut(xx + fw / 2, yy + fh / 2, 30, c, 0.35); }
          }
        }
        x += w + 4 + r() * 10;
      }
      nebel(basis - 40, 120, mix(hc[1], "#ffffff", 0.2), nebelA * 0.5);
    });
    // Straße mit Laternen und Lichtspuren
    box(-1500, 1520, 4080, 900, 0, "#0b0d18"); box(-1500, 1520, 4080, 160, 0, "#0f1220");
    for (let x = -300; x < 1500; x += 220) { line(x, 1520, x, 1470, 4, "#2a2f44"); if (abends) { circle(x, 1468, 5, "#ffe6a8"); glut(x, 1480, 70, "#ffd59a", 0.5); } }
    for (let i = 0; i < 26; i++) { const r = rnd(i + 40), sp = 120 + r() * 220, links = i % 2, x = links ? 1300 - ((t * sp + r() * 2600) % 2600) : -1300 + ((t * sp + r() * 2600) % 2600), y = links ? 1570 : 1630; box(x, y - 4, 70, 8, 4, links ? "#ff5b4d" : "#fff1c4"); glut(x + 35, y, 50, links ? "#ff5b4d" : "#fff1c4", 0.5); }
    if (s.dach !== false && ((s.figuren || []).length || s.dach === true)) { // dach=true: Dach auch ohne Figuren (Bildbibliothek)
      box(-1500, 1600, 4080, 600, 0, "#1a1d2c"); box(-1500, 1590, 4080, 20, 4, "#2a2f44");
      box(-80, 1460, 170, 140, 6, "#22263a"); box(-40, 1500, 60, 100, 4, "#151827"); box(-80, 1452, 180, 14, 4, "#2e3350"); // Dachausstieg
      for (const [vx, vh] of [[880, 70], [960, 50], [1030, 90]]) { box(vx, 1590 - vh, 34, vh, 6, "#2a2f44"); ellipse(vx + 17, 1590 - vh, 17, 6, "#3a4060"); }
      if (abends) for (let x = -100; x < 1200; x += 60) { const y = 1430 + Math.sin(x / 140) * 18; circle(x, y, 5, rgba("#ffd27a", 0.85)); glut(x, y, 26, "#ffc66b", 0.35); } // Lichterkette übers Dach
    }
    A.figurenZeigen(s, t, 1700, 0.95);
    A._dunkel = nacht ? 0.2 : 0;
  };

  // =====================================================================
  // RECHENZENTRUM – Serverhalle in Fluchtperspektive, LEDs, Bodennebel, KI-Kern am Ende (kern, farbe=#hex)
  // =====================================================================
  SZ.rechenzentrum = (s, t) => {
    const fx = 540, fy = 860, akz = s.farbe || "#4fd1ff";
    ctx.fillStyle = lgrad(0, -400, 0, 2200, [[0, "#05070f"], [0.45, "#0b1226"], [1, "#04060c"]]); ctx.fillRect(-1500, -1500, 4080, 4000);
    if (s.kern) { const p = 1 + 0.06 * Math.sin(t * 3); glut(fx, fy, 520 * p, akz, 0.9); circle(fx, fy, 70 * p, mix(akz, "#ffffff", 0.6)); for (let k = 1; k <= 3; k++) { ctx.beginPath(); ctx.arc(fx, fy, 90 * k * p + (t * 30 % 40), 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = rgba(akz, 0.4 / k); ctx.stroke(); } A.licht(fx, fy, 1100, akz, 1.2); }
    // Boden mit Fluchtlinien
    poly([[-1500, 2200], [2580, 2200], [fx + 40, fy + 40], [fx - 40, fy + 40]], "#070a14");
    for (let k = -14; k <= 14; k++) line(fx + k * 3, fy + 40, fx + k * 260, 2200, 2, rgba(akz, 0.12));
    for (let k = 1; k < 14; k++) { const q = Math.pow(k / 14, 2.2), y = lerp(fy + 40, 2200, q); line(lerp(fx - 40, -1500, q), y, lerp(fx + 40, 2580, q), y, 2, rgba(akz, 0.1)); }
    // Server-Reihen links und rechts
    for (const seite of [-1, 1]) for (let k = 9; k >= 0; k--) {
      const q0 = Math.pow(k / 10, 1.6), q1 = Math.pow((k + 1) / 10, 1.6);
      const x0 = fx + seite * lerp(60, 1300, q0), x1 = fx + seite * lerp(60, 1300, q1), ob0 = lerp(fy - 120, -300, q0), ob1 = lerp(fy - 120, -300, q1), un0 = lerp(fy + 40, 2200, q0), un1 = lerp(fy + 40, 2200, q1);
      poly([[x0, ob0], [x1, ob1], [x1, un1], [x0, un0]], shade("#1a2238", -0.1 + k * 0.012));
      for (let u = 1; u < 4; u++) { const v = u / 4; line(lerp(x0, x1, v), lerp(ob0, ob1, v), lerp(x0, x1, v), lerp(un0, un1, v), 1 + k * 0.25, rgba("#05070f", 0.6)); } // Schrank-Türen
      for (let j = 1; j < 18; j++) { const v = j / 18; line(x0, lerp(ob0, un0, v), x1, lerp(ob1, un1, v), 1, rgba("#2a3550", 0.35)); } // Einschübe
      line(x0, ob0, x1, ob1, 2 + k * 0.4, rgba("#5a6c90", 0.5)); // Oberkante im Licht
      const r = rnd(k * 13 + (seite > 0 ? 5 : 0));
      for (let j = 0; j < 9; j++) { const v = (j + 0.5) / 9, a = 0.4 + 0.6 * (Math.sin(t * (2 + r() * 5) + j + k) > 0.2 ? 1 : 0.2); const yA = lerp(ob0, un0, v), yB = lerp(ob1, un1, v); line(x0 + (x1 - x0) * 0.15, lerp(yA, yB, 0.15), x0 + (x1 - x0) * 0.85, lerp(yA, yB, 0.85), 2 + k * 0.5, rgba(r() < 0.75 ? akz : "#6dff9a", 0.55 * a)); }
      line(x1, ob1, x1, un1, 3 + k * 0.6, "#05070f");
    }
    // Kabeltrassen unter der Decke, Lichtspiegelung auf dem Boden, Staub im Licht
    for (const seite of [-1, 1]) for (const d of [0, 40]) line(fx + seite * 60, fy - 150 - d * 0.1, fx + seite * 1400, -380 - d, 10 + d * 0.3, "#0d1322");
    for (const seite of [-1, 1]) { ctx.save(); ctx.globalCompositeOperation = "screen"; line(fx + seite * 60, fy + 44, fx + seite * 1300, 2210, 30, rgba(akz, 0.08)); line(fx + seite * 60, fy + 44, fx + seite * 1300, 2210, 6, rgba(akz, 0.25)); ctx.restore(); }
    if (s.kern) { ctx.fillStyle = lgrad(0, fy + 40, 0, 1900, [[0, rgba(akz, 0.35)], [1, rgba(akz, 0)]]); poly([[fx - 60, fy + 40], [fx + 60, fy + 40], [fx + 260, 1900], [fx - 260, 1900]]); ctx.fill(); }
    // Deckenlichter und Bodennebel
    for (let k = 1; k < 9; k++) { const q = Math.pow(k / 9, 1.6), y = lerp(fy - 130, -320, q), w = lerp(30, 900, q); box(fx - w / 2, y, w, 6 + 10 * q, 4, rgba("#dff4ff", 0.6)); glut(fx, y + 6, w * 0.4, "#bfe8ff", 0.15); }
    nebel(1500, 260, akz, 0.12);
    { const r = rnd(81); for (let i = 0; i < 40; i++) { const x = fx + (r() - 0.5) * 900 + Math.sin(t * 0.4 + i) * 20, y = 300 + ((r() * 1500 - t * 10) % 1500 + 1500) % 1500; circle(x, y, 1.5 + r() * 2.5, rgba("#dff4ff", 0.25 + 0.3 * r())); } }
    A.figurenZeigen(s, t, 1640, 0.95);
    A._dunkel = 0;
  };

  // =====================================================================
  // AUGE – dramatisches Riesenauge mit Strahlen (wie im Kurzgesagt-Vorschaubild), farbe=#hex, text="…" oben
  // =====================================================================
  SZ.auge = (s, t, p) => {
    const f = s.farbe || "#ff5a2a", cx = 540, cy = 960, R = 400 * (1 + 0.04 * Math.sin(t * 2));
    ctx.fillStyle = rgrad(cx, cy, 100, 1300, [[0, "#fff6e0"], [0.45, "#e9dcc4"], [1, "#2a2a30"]]); ctx.fillRect(-1500, -1500, 4080, 4000);
    const r = rnd(9);
    for (let i = 0; i < 48; i++) { const a = r() * Math.PI * 2 + t * 0.15, l0 = R * 1.2 + r() * 200, l1 = l0 + 300 + r() * 900; line(cx + Math.cos(a) * l0, cy + Math.sin(a) * l0, cx + Math.cos(a) * l1, cy + Math.sin(a) * l1, 4 + r() * 8, i % 5 ? rgba("#1a1a1f", 0.8) : rgba(f, 0.9)); }
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t * 0.05; glut(cx + Math.cos(a) * 1050, cy + Math.sin(a) * 1050, 420, "#3a3a42", 0.6); }
    glut(cx, cy, R * 1.5, f, 0.6);
    ctx.fillStyle = rgrad(cx, cy, R * 0.2, R, [[0, "#ffd36b"], [0.55, mix(f, "#ffb040", 0.3)], [1, shade(f, -0.3)]]); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 70; i++) { const a = i / 70 * Math.PI * 2, l0 = R * (0.42 + 0.08 * r()), l1 = R * (0.75 + 0.2 * r()); line(cx + Math.cos(a) * l0, cy + Math.sin(a) * l0, cx + Math.cos(a) * l1, cy + Math.sin(a) * l1, 3 + r() * 4, rgba("#1a0f0a", 0.75)); }
    const pupille = R * (0.36 + 0.04 * Math.sin(t * 1.3)); circle(cx, cy, pupille, "#0a0606");
    ellipse(cx, cy, pupille * 0.12, pupille * 0.62, f); glut(cx, cy, pupille * 0.7, f, 0.5);
    ctx.save(); ctx.translate(cx - R * 0.42, cy - R * 0.45); ctx.rotate(-0.6); ellipse(0, 0, R * 0.2, R * 0.09, "#ffffff"); ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.lineWidth = 10; ctx.strokeStyle = shade(f, -0.5); ctx.stroke();
    if (s.text) { const ein = E.raus(clamp(t / 0.4, 0, 1)); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = ein; ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 30; A.text(String(s.text).toUpperCase(), 540, 260, s.groesse || 104, "#ffffff", "center", 900, "Titel", 960); ctx.restore(); }
    A._dunkel = 0;
  };

  // =====================================================================
  // LANDSCHAFT – Bergketten mit Nebel, Sonne, Vögel, Hügel vorne für Figuren (zeit, voegel=false, see)
  // =====================================================================
  SZ.landschaft = (s, t) => {
    const zeit = zeitVon(s, "abend"), nacht = zeit === "nacht", hc = HIMMEL[zeit], abends = nacht || zeit === "abend";
    ctx.fillStyle = lgrad(0, -600, 0, 1300, [[0, hc[0]], [1, hc[1]]]); ctx.fillRect(-1500, -1500, 4080, 3200);
    const sy = zeit === "tag" ? 320 : 820;
    if (nacht) { sterne(160, 8, t, -900, -900, 2900, 1700); circle(760, 330, 60, "#f1ead2"); circle(745, 315, 10, "#ddd5bc"); glut(760, 330, 300, "#cfd8ff", 0.35); }
    else {
      // Sonnenstrahlen
      ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.translate(540, sy); ctx.rotate(t * 0.02);
      for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.fillStyle = lgrad(0, 0, 0, 1400, [[0, rgba("#fff1c4", 0.16)], [1, rgba("#fff1c4", 0)]]); poly([[-20, 0], [20, 0], [110, 1400], [-110, 1400]]); ctx.fill(); }
      ctx.restore();
      glut(540, sy, 900, zeit === "tag" ? "#fff6d0" : "#ffc07a", 0.85); circle(540, sy, 110, zeit === "tag" ? "#fffbea" : "#ffe2a8");
    }
    // Wolkenstreifen
    { const r = rnd(66); for (let i = 0; i < 6; i++) { const x = ((r() * 1800 + t * 8) % 1800) - 400, y = 380 + r() * 380; ellipse(x, y, 160 + r() * 140, 14 + r() * 10, rgba(nacht ? "#2a3466" : mix(hc[1], "#ffffff", 0.5), 0.55)); } }
    const berge = [[880, 260, 0.82, 3], [980, 330, 0.62, 7], [1100, 380, 0.42, 11], [1240, 420, 0.22, 17]];
    berge.forEach(([basis, hoehe, dunst, seed], li) => {
      const r = rnd(seed), farbe = mix(nacht ? "#0d1430" : "#2b3a52", hc[1], dunst), pk = [];
      let x = -1500; pk.push([x, basis]);
      while (x < 2600) { const w = 120 + r() * 260; pk.push([x + w / 2, basis - hoehe * (0.4 + r() * 0.6)]); x += w; pk.push([x, basis - r() * 40]); }
      ctx.beginPath(); ctx.moveTo(-1500, 2400); for (const [px, py] of pk) ctx.lineTo(px, py); ctx.lineTo(2600, 2400); ctx.closePath(); ctx.fillStyle = farbe; ctx.fill();
      // Licht auf der sonnenzugewandten Flanke, Schnee auf den hinteren Gipfeln
      for (let k = 1; k < pk.length - 1; k += 2) {
        const [gx, gy] = pk[k], [lx, ly] = pk[k - 1], [rx, ry] = pk[k + 1], links = gx > 540;
        poly(links ? [[gx, gy], [lx, ly], [lerp(lx, gx, 0.5), lerp(ly, gy, 0.15) + 30]] : [[gx, gy], [rx, ry], [lerp(rx, gx, 0.5), lerp(ry, gy, 0.15) + 30]], rgba(nacht ? "#9fb4ff" : "#ffe2b0", 0.1 + 0.05 * (3 - li)));
        if (li <= 1 && !abends && basis - gy > hoehe * 0.75) poly([[gx, gy], [lerp(gx, lx, 0.18), lerp(gy, ly, 0.18)], [gx, gy + 18], [lerp(gx, rx, 0.18), lerp(gy, ry, 0.18)]], rgba("#f4f7fa", 0.85));
      }
      nebel(basis + 30, 90, mix(hc[1], "#ffffff", 0.3), 0.35 - li * 0.06);
    });
    if (s.see) { ctx.fillStyle = lgrad(0, 1300, 0, 1500, [[0, mix(hc[1], "#6aa6d0", 0.4)], [1, mix(hc[0], "#1a2a40", 0.5)]]); ctx.fillRect(-1500, 1300, 4080, 200); if (!nacht) for (let k = 0; k < 8; k++) box(540 - (120 - k * 12) + Math.sin(t * 1.5 + k) * 8, 1305 + k * 22, 240 - k * 24, 5, 2, rgba("#ffe2b0", 0.45 - k * 0.04)); for (let i = 0; i < 12; i++) { const r = rnd(i + 3); box(-200 + r() * 1500 + Math.sin(t + i) * 20, 1320 + r() * 160, 60 + r() * 120, 4, 2, rgba("#ffffff", 0.3)); } }
    // Hügel vorne mit Gras, Blumen, Häuschen
    const huegel = nacht ? "#0f1a16" : zeit === "abend" ? "#3d3a3a" : "#4f7a45";
    ctx.beginPath(); ctx.moveTo(-1500, 2400); ctx.lineTo(-1500, 1560); ctx.bezierCurveTo(-200, 1480, 400, 1500, 900, 1540); ctx.bezierCurveTo(1400, 1580, 2000, 1560, 2600, 1600); ctx.lineTo(2600, 2400); ctx.closePath(); ctx.fillStyle = huegel; ctx.fill();
    ctx.fillStyle = lgrad(0, 1500, 0, 1640, [[0, rgba(nacht ? "#2a3a50" : "#ffe2b0", 0.18)], [1, rgba("#000000", 0)]]); ctx.fill(); // Licht auf der Hügelkante
    { const hx = 860, hy = 1540; box(hx - 70, hy - 90, 140, 92, 4, nacht ? "#2a2626" : "#d9c8a8"); poly([[hx - 86, hy - 88], [hx + 86, hy - 88], [hx, hy - 160]], nacht ? "#3a1f1c" : "#a8443f"); box(hx + 30, hy - 150, 20, 46, 2, nacht ? "#2a2626" : "#8a5a3a");
      box(hx - 46, hy - 66, 34, 30, 3, abends ? "#ffd27a" : "#9fc0d8"); box(hx + 12, hy - 50, 30, 50, 3, nacht ? "#1a1414" : "#6e5038");
      if (abends) { glut(hx - 29, hy - 51, 120, "#ffc66b", 0.7); A.licht(hx - 29, hy - 51, 260, "#ffc66b", 0.9); }
      for (let i = 0; i < 4; i++) { const w = (t * 0.4 + i / 4) % 1; circle(hx + 40 + Math.sin(w * 5 + i) * 14, hy - 160 - w * 160, 10 + w * 18, rgba(nacht ? "#4a4a55" : "#e9e9ef", 0.35 * (1 - w))); }
      for (let fxp = hx - 200; fxp < hx - 80; fxp += 30) box(fxp, hy - 26, 6, 30, 2, nacht ? "#2a2420" : "#8a6a4a"); line(hx - 200, hy - 16, hx - 84, hy - 16, 4, nacht ? "#2a2420" : "#8a6a4a"); }
    { const r = rnd(73); for (let i = 0; i < 70; i++) { const x = -150 + r() * 1400, y = 1560 + r() * 380, c = shade(huegel, 0.08 + r() * 0.1); line(x, y, x - 6, y - 18, 3, c); line(x, y, x + 4, y - 22, 3, c); line(x, y, x + 10, y - 14, 3, c); if (!nacht && r() < 0.3) circle(x + 2, y - 22, 4, ["#f4f1ea", "#e2b443", "#e98fa8"][i % 3]); } }
    for (const [x, h] of [[-60, 420], [40, 300], [1010, 360], [1120, 460]]) { box(x - 6, 1560 - h * 0.25, 12, h * 0.25, 4, "#1a1614"); for (let k = 0; k < 3; k++) poly([[x - 70 + k * 14, 1560 - h * 0.2 - k * h * 0.22], [x + 70 - k * 14, 1560 - h * 0.2 - k * h * 0.22], [x, 1560 - h * (0.55 + k * 0.22)]], shade(nacht ? "#0b1410" : "#24362c", k * 0.04)); }
    if (s.voegel !== false && !nacht) for (let i = 0; i < 7; i++) { const r = rnd(i + 31), x = (r() * 1400 - 200 + t * (30 + r() * 30)) % 1600 - 200, y = 500 + r() * 300, fl = Math.sin(t * 8 + i) * 10; line(x - 18, y - fl, x, y, 4, "#1d1b26"); line(x, y, x + 18, y - fl, 4, "#1d1b26"); }
    if (nacht) A.alltagWetter({ ...s, gluehwuermchen: s.gluehwuermchen ?? true }, t, true);
    A.figurenZeigen(s, t, 1640, 0.95);
    A.alltagWetter({ ...s, gluehwuermchen: false }, t, true);
    A._dunkel = nacht ? 0.35 : 0;
  };

  // =====================================================================
  // WALD – Stämme in Schichten, Lichtstrahlen, schwebende Teilchen, Farn (zeit, nebel)
  // =====================================================================
  SZ.wald = (s, t) => {
    const zeit = zeitVon(s, "tag"), nacht = zeit === "nacht", hc = HIMMEL[zeit];
    ctx.fillStyle = lgrad(0, -600, 0, 1600, [[0, mix(hc[0], "#1f3a2c", 0.5)], [1, mix(hc[1], "#3f5a3a", 0.5)]]); ctx.fillRect(-1500, -1500, 4080, 3400);
    const strahlen = [];
    for (let li = 0; li < 4; li++) {
      const r = rnd(li * 9 + 2), tiefe = (li + 1) / 4, farbe = mix(nacht ? "#0a1410" : "#1d2a22", mix(hc[1], "#7fa07a", 0.5), (1 - tiefe) * 0.75);
      for (let x = -900; x < 2000;) {
        const w = (30 + r() * 50) * (0.5 + tiefe * 1.3);
        box(x, -1500, w, 3400, w * 0.2, farbe);
        if (tiefe >= 0.75) { // Rinde und Randlicht an den vorderen Stämmen
          box(x + w * 0.7, -1500, w * 0.3, 3400, 0, shade(farbe, -0.15)); line(x + 3, -1500, x + 3, 1600, 3, rgba(nacht ? "#6f8fb0" : "#ffe9b0", 0.18));
          for (let k = 0; k < 9; k++) { const bx = x + w * (0.2 + 0.6 * r()), by = -200 + r() * 1700, bl = 60 + r() * 140; line(bx, by, bx + (r() - 0.5) * 6, by + bl, 3, rgba("#000000", 0.18)); }
          if (r() < 0.18) { const ay = 300 + r() * 500; ctx.save(); ctx.translate(x + w - 4, ay); ctx.rotate(-0.7); box(0, -6, 50 + r() * 40, 12, 6, farbe); ctx.restore(); } // kurzer Ast
        }
        x += w + (80 + r() * 220) * (1.2 - tiefe * 0.4);
      }
      if (li < 3) nebel(1100 + li * 120, 200, mix(hc[1], "#ffffff", 0.3), (s.nebel ? 0.35 : 0.18));
    }
    // Blätterdach oben
    { const r = rnd(91), dach = nacht ? "#0a140f" : mix("#24402c", hc[0], 0.15); for (let i = 0; i < 26; i++) circle(-300 + i * 70 + r() * 40, -60 + r() * 220, 110 + r() * 90, shade(dach, (r() - 0.5) * 0.1)); for (let i = 0; i < 40; i++) ellipse(-200 + r() * 1500, 120 + r() * 220, 14, 26, shade(dach, 0.1), r() * 3); }
    if (!nacht) { ctx.save(); ctx.globalCompositeOperation = "screen"; for (let i = 0; i < 6; i++) { const x = 100 + i * 190 + Math.sin(t * 0.3 + i) * 20; strahlen.push(x + 265); ctx.fillStyle = lgrad(0, -300, 0, 1700, [[0, rgba("#fff3c4", 0.32)], [1, rgba("#fff3c4", 0)]]); poly([[x, -300], [x + 70, -300], [x + 380, 1700], [x + 150, 1700]]); ctx.fill(); } ctx.restore(); }
    box(-1500, 1560, 4080, 900, 0, nacht ? "#0c1410" : "#2f4a30");
    ctx.fillStyle = lgrad(0, 1560, 0, 1620, [[0, "rgba(0,0,0,0.25)"], [1, "rgba(0,0,0,0)"]]); ctx.fillRect(-1500, 1560, 4080, 60);
    if (!nacht) { ctx.save(); ctx.globalCompositeOperation = "screen"; for (const x of strahlen) ellipse(x, 1690, 130, 26, rgba("#fff3c4", 0.22)); ctx.restore(); } // Lichtflecken
    const r = rnd(5);
    for (let i = 0; i < 5; i++) { const x = -60 + r() * 1200, y = 1600 + r() * 200; ellipse(x, y, 50 + r() * 40, 26, nacht ? "#1c2420" : "#6d736a"); ellipse(x - 10, y - 8, 30, 12, rgba("#ffffff", nacht ? 0.05 : 0.15)); } // Steine
    for (let i = 0; i < 6; i++) { const x = -60 + r() * 1200, y = 1640 + r() * 240; box(x - 4, y - 26, 8, 26, 3, "#efe6d6"); ctx.beginPath(); ctx.ellipse(x, y - 26, 20, 14, 0, Math.PI, 0); ctx.fillStyle = "#c94f3d"; ctx.fill(); circle(x - 7, y - 32, 3, "#f4f1ea"); circle(x + 6, y - 30, 2.5, "#f4f1ea"); } // Pilze
    for (let i = 0; i < 22; i++) { const x = -100 + r() * 1300, y = 1580 + r() * 260; for (const a of [-0.9, -0.5, 0, 0.5, 0.9]) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ellipse(0, -40, 16, 50, nacht ? "#132018" : "#3f6a3a"); ellipse(-4, -44, 6, 34, nacht ? "#17261c" : "#4f7a45"); ctx.restore(); } }
    for (let i = 0; i < 40; i++) { const q = rnd(i + 60), x = (q() * 1300 + Math.sin(t * 0.5 + i) * 30) % 1300 - 100, y = (q() * 1700 - t * 12 * q() + 1700) % 1700; circle(x, y, 2 + q() * 3, rgba(nacht ? "#f6f0a0" : "#fffbe0", 0.5)); }
    A.figurenZeigen(s, t, 1660, 0.95);
    A.alltagWetter({ ...s, gluehwuermchen: s.gluehwuermchen ?? nacht }, t, true);
    A._dunkel = nacht ? 0.45 : zeit === "abend" ? 0.15 : 0;
  };

  // =====================================================================
  // NETZ – leuchtendes Netz aus Knoten und Verbindungen mit Impulsen (farbe=#hex, mitte=du: Kopf im Zentrum)
  // =====================================================================
  SZ.netz = (s, t) => {
    const akz = s.farbe || "#59c7ff";
    ctx.fillStyle = rgrad(540, 960, 50, 1500, [[0, "#132048"], [1, "#03050e"]]); ctx.fillRect(-1500, -1500, 4080, 4000);
    const r = rnd(21), pkt = [];
    for (let i = 0; i < 46; i++) pkt.push([-150 + r() * 1380, 120 + r() * 1700 + Math.sin(t * 0.4 + i) * 8, 6 + r() * 12]);
    if (s.mitte) pkt.push([540, 900, 0]);
    for (let i = 0; i < pkt.length; i++) for (let j = i + 1; j < pkt.length; j++) {
      const [x1, y1] = pkt[i], [x2, y2] = pkt[j], d = Math.hypot(x2 - x1, y2 - y1);
      if (d > 330) continue;
      line(x1, y1, x2, y2, 3, rgba(akz, 0.55 * (1 - d / 330)));
      const ph = (t * 0.6 + (i * 7 + j * 3) % 10 / 10) % 1; if ((i + j) % 4 === 0) { circle(lerp(x1, x2, ph), lerp(y1, y2, ph), 4, rgba("#ffffff", 0.8)); }
    }
    for (const [x, y, g] of pkt) if (g) { glut(x, y, g * 5, akz, 0.6); circle(x, y, g, mix(akz, "#ffffff", 0.4)); }
    if (s.mitte) { glut(540, 900, 420, akz, 0.6); A.kopf(540, 900, 150, A.fig(s.mitte), { t, ausdruck: s.ausdruck || "neutral", seed: 3, spricht: s._spricht }); }
    A._dunkel = 0;
  };

  // =====================================================================
  // LEBENSZEIT – dein Leben in Wochen: 90 Zeilen × 52 Kästchen (jahre=16 gelebt, markiert="16-18", fuellen: wächst mit)
  // =====================================================================
  SZ.lebenszeit = (s, t, p) => {
    ctx.fillStyle = rgrad(540, 960, 50, 1500, [[0, "#1c2142"], [1, "#05060f"]]); ctx.fillRect(-1500, -1500, 4080, 4000);
    const zeilen = Number(s.zeilen || 90), gelebt = Number(s.jahre ?? 16) * 52, z = 16.6, x0 = 540 - 26 * z, y0 = 260;
    const [m0, m1] = s.markiert ? String(s.markiert).split("-").map(Number) : [null, null];
    const sichtbar = s.fuellen ? Math.floor(gelebt * E.sanft(clamp(p * 1.4, 0, 1))) : gelebt;
    for (let row = 0; row < zeilen; row++) for (let c = 0; c < 52; c++) {
      const i = row * 52 + c, x = x0 + c * z, y = y0 + row * z;
      let farbe = rgba("#ffffff", 0.13);
      if (i < sichtbar) farbe = s.farbe_gelebt || "#e9b866";
      else if (m0 != null && row >= m0 && row < m1) farbe = s.farbe_markiert || "#59c7ff";
      box(x + 1.5, y + 1.5, z - 3, z - 3, 3, farbe);
    }
    if (s.oben) A.text(String(s.oben).toUpperCase(), 540, 180, 54, "#ffffff", "center", 900, "Titel", 960);
    A._dunkel = 0;
  };
  // =====================================================================
  // POLARLICHT – Nachthimmel mit wehenden Lichtvorhängen, Berge im Dunst, Stadtlichter am Horizont, Hügel vorne
  // (farbe=#hex Hauptfarbe, stadt=false, see)  – neu für Staffel s01 „Funkstille“
  // =====================================================================
  SZ.polarlicht = (s, t) => {
    const gruen = s.farbe || "#5dffb0";
    ctx.fillStyle = lgrad(0, -600, 0, 1600, [[0, "#03061a"], [0.55, "#0a1838"], [1, "#16304a"]]); ctx.fillRect(-1500, -1500, 4080, 3400);
    sterne(260, 19, t, -900, -900, 2900, 2200);
    // Lichtvorhänge: viele schmale, senkrechte Streifen entlang einer wehenden Kurve
    ctx.save(); ctx.globalCompositeOperation = "screen";
    const baender = [[mix(gruen, "#b98cff", 0.55), 260, 3.1, 0.6], [mix(gruen, "#4fd8ff", 0.5), 470, 1.7, 0.8], [gruen, 640, 0.0, 1.0]];
    for (const [farbe, y0, ph, st] of baender) {
      for (let x = -600; x < 1700; x += 9) {
        const welle = Math.sin(x * 0.004 + t * 0.35 + ph) * 120 + Math.sin(x * 0.011 - t * 0.6 + ph * 2) * 40;
        const y = y0 + welle, h = 300 + 200 * (0.5 + 0.5 * Math.sin(x * 0.02 + t * 0.9 + ph)), a = st * (0.3 + 0.16 * Math.sin(x * 0.05 + t * 1.3 + ph));
        ctx.fillStyle = lgrad(0, y - h, 0, y + 40, [[0, rgba(farbe, 0)], [0.7, rgba(farbe, a)], [0.92, rgba(mix(farbe, "#ffffff", 0.4), a * 1.6)], [1, rgba(farbe, 0)]]);
        ctx.fillRect(x, y - h, 10, h + 40);
      }
      glut(540, y0 + 60, 900, farbe, 0.22 * st);
    }
    ctx.restore();
    // ferne Berge in Schichten, hinten heller und dunstiger, mit grünem Randlicht von oben
    const schichten = [[960, "#1d3550", 0.9, 3], [1060, "#142740", 0.6, 7], [1170, "#0c1a2c", 0.35, 11]];
    for (const [basis, farbe, dunst, seed] of schichten) {
      const r = rnd(seed), pk = []; for (let x = -700; x <= 1800; x += 130 + r() * 110) pk.push([x, basis - 60 - r() * 200]);
      ctx.beginPath(); ctx.moveTo(-700, 2400); for (const [x, y] of pk) ctx.lineTo(x, y); ctx.lineTo(1800, 2400); ctx.closePath(); ctx.fillStyle = farbe; ctx.fill();
      for (let k = 0; k < pk.length - 1; k++) line(pk[k][0], pk[k][1], pk[k + 1][0], pk[k + 1][1], 3, rgba(gruen, 0.18 * dunst));
      nebel(basis + 20, 70, "#6fa0c0", 0.16 * dunst);
    }
    // Stadtlichter am Horizont (Notstrom: nur wenige Fenster)
    if (s.stadt !== false) {
      const r = rnd(29);
      for (let i = 0; i < 26; i++) { const x = -60 + i * 46 + r() * 20, h = 50 + r() * 150; box(x, 1240 - h, 38, h + 40, 3, "#0a1424"); for (let k = 0; k < 5; k++) if (r() < 0.22) { const wx = x + 6 + Math.floor(r() * 3) * 10, wy = 1240 - h + 10 + r() * (h - 10); box(wx, wy, 6, 8, 1, "#ffd27a"); glut(wx + 3, wy + 4, 22, "#ffc66b", 0.35); } }
      { const x = 760; box(x, 1000, 16, 240, 3, "#0a1424"); circle(x + 8, 990, 6, Math.sin(t * 3) > 0 ? "#ff5b4d" : "#5a1f1a"); glut(x + 8, 990, 40, "#ff5b4d", Math.sin(t * 3) > 0 ? 0.5 : 0); } // Funkturm mit Warnlicht
      nebel(1250, 60, "#4a7090", 0.25);
    }
    if (s.see) { ctx.fillStyle = lgrad(0, 1280, 0, 1500, [[0, "#13304a"], [1, "#061220"]]); ctx.fillRect(-1500, 1280, 4080, 260);
      ctx.save(); ctx.globalCompositeOperation = "screen"; for (let k = 0; k < 10; k++) box(200 + Math.sin(t + k) * 20, 1300 + k * 22, 680 - k * 40, 5, 2, rgba(gruen, 0.22 - k * 0.018)); ctx.restore(); }
    // Hügel vorne mit grünem Randlicht, Gras, Tannen
    ctx.beginPath(); ctx.moveTo(-1500, 2400); ctx.lineTo(-1500, 1560); ctx.bezierCurveTo(-200, 1480, 400, 1500, 900, 1540); ctx.bezierCurveTo(1400, 1580, 2000, 1560, 2600, 1600); ctx.lineTo(2600, 2400); ctx.closePath(); ctx.fillStyle = "#08130f"; ctx.fill();
    ctx.fillStyle = lgrad(0, 1500, 0, 1620, [[0, rgba(gruen, 0.22)], [1, rgba(gruen, 0)]]); ctx.fill();
    { const r = rnd(83); for (let i = 0; i < 70; i++) { const x = -150 + r() * 1400, y = 1560 + r() * 380, c = shade("#08130f", 0.1 + r() * 0.12); line(x, y, x - 6, y - 18, 3, c); line(x, y, x + 4, y - 22, 3, c); line(x, y, x + 10, y - 14, 3, c); } }
    for (const [x, h] of [[-40, 440], [60, 320], [1000, 380], [1110, 480]]) { box(x - 6, 1560 - h * 0.25, 12, h * 0.25, 4, "#050a08"); for (let k = 0; k < 3; k++) { const yb = 1560 - h * 0.2 - k * h * 0.22, ys = 1560 - h * (0.55 + k * 0.22); poly([[x - 70 + k * 14, yb], [x + 70 - k * 14, yb], [x, ys]], shade("#06100c", k * 0.04)); line(x, ys, x - 70 + k * 14, yb, 2, rgba(gruen, 0.25)); } }
    A.alltagWetter({ ...s, gluehwuermchen: s.gluehwuermchen ?? true }, t, true);
    A.licht(540, 300, 1200, gruen, 0.5);
    A.figurenZeigen(s, t, 1640, 0.95);
    A._dunkel = 0.05;
  };

  // Alle Kurzgesagt-Kulissen lesen `variante` (Bildbibliothek, Jonathans Wunsch 2.11.)
  for (const name of ["weltall", "grossstadt", "rechenzentrum", "auge", "landschaft", "wald", "netz", "lebenszeit", "polarlicht"]) {
    const orig = SZ[name];
    SZ[name] = (s, t, p) => { A._kgVar = Number(s.variante) || 0; try { return orig(s, t, p); } finally { A._kgVar = 0; } };
  }

  // =====================================================================
  // BILDBIBLIOTHEK – fertige, freigegebene Hintergründe (taeglich/bibliothek/katalog.json), nur noch gezoomt/geschwenkt.
  // Drehbuch: [bild id=grossstadt-nacht-v07 du lina zoom-rein]. render.mjs hängt `_meta` (Katalogeintrag) und, wenn die
  // Bilddatei mit dem Fingerabdruck vorliegt, `_bild_daten` (data-URL) an. Fehlt die Datei, wird die Kulisse live gezeichnet.
  // =====================================================================
  const BILD = { x0: -135, b: 1350, h: 2400 }; // Weltausschnitt der Platten (deckt Zoom ab 1,0 und alle Schwenks ab)
  SZ.bild = (s, t, p) => {
    const m = s._meta;
    if (!m) { A.text("BILD FEHLT: " + (s.id || "?"), 540, 960, 50, "#ff6b5b"); return; }
    const angaben = { ...m.angaben, figuren: s.figuren, posen: s.posen, ausdruecke: s.ausdruecke, sprecher: s.sprecher, _spricht: s._spricht, haelt: s.haelt, pos: s.pos };
    if (!s.fokus) ctx.translate(0, 960 - (m.kamera_y || 960)); // Kamera wie bei der Original-Kulisse
    const img = A._bilder && A._bilder[s.id];
    if (!img) { SZ[m.kulisse](angaben, t, p); return; } // Rückfall: live zeichnen (gleiches Bild)
    ctx.drawImage(img, BILD.x0, (m.kamera_y || 960) - BILD.h / 2, BILD.b, BILD.h);
    for (const l of m.lichter || []) A.licht(l.x, l.y, l.r, l.farbe, l.st);
    if (m.figur_y != null) A.figurenZeigen(angaben, t, m.figur_y, m.figur_skala ?? 1);
    A._dunkel = m.dunkel || 0;
  };

  // Bilder vor dem ersten Frame laden (nur wenn eine Folge `bild` benutzt; sonst unverändert)
  const altInit = window.init;
  window.init = daten => {
    const r = altInit(daten);
    const mitBild = (daten.szenen || []).filter(s => s.typ === "bild" && s._bild_daten);
    if (!mitBild.length) return r;
    A._bilder = {};
    return Promise.all(mitBild.map(s => new Promise(ok => {
      if (A._bilder[s.id]) return ok();
      const img = new Image(); img.onload = () => { A._bilder[s.id] = img; ok(); }; img.onerror = () => ok(); img.src = s._bild_daten;
    }))).then(() => r);
  };

  // Platte für die Bibliothek zeichnen (taeglich/bibliothek.mjs): Kulisse ohne Figuren, doppelte Auflösung, ohne Nachbearbeitung
  window.platte = (kulisse, angaben, kameraY) => {
    const k = 2, x0 = BILD.x0, y0 = kameraY - BILD.h / 2;
    A.cv.width = BILD.b * k; A.cv.height = BILD.h * k;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, A.cv.width, A.cv.height);
    ctx.setTransform(k, 0, 0, k, -x0 * k, -y0 * k);
    A.lichter = []; A._dunkel = 0;
    let figur = null; const fz = A.figurenZeigen; A.figurenZeigen = (s, t, y, skala) => { figur = { y, skala }; };
    try { SZ[kulisse]({ typ: kulisse, ...angaben }, 0, 0); } finally { A.figurenZeigen = fz; }
    const lichter = A.lichter.map(l => ({ x: l.x / k + x0, y: l.y / k + y0, r: l.r / k, farbe: l.farbe, st: l.st }));
    return { figur_y: figur ? figur.y : null, figur_skala: figur ? figur.skala : null, dunkel: A._dunkel, lichter, breite: A.cv.width, hoehe: A.cv.height };
  };
})();
