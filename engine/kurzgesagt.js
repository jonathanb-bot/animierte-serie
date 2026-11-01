/* Kurzgesagt-Richtung für die Kurzvideo-Staffeln (taeglich/): große, leuchtende Kulissen mit Tiefe und ein Kino-Look.
   Jonathans Wunsch vom 1.11. (Vorbild: „Dinge Erklärt – Kurzgesagt“, „KI hat das Undenkbare getan“).
   Nur neue Kulissen-Namen und ein Kino-Look, der ausschließlich mit `@kino` wirkt: die bisherigen Serien bleiben pixelgleich. */
(() => {
  const { box, circle, ellipse, poly, line, shade, rgba, lgrad, rgrad, mix, rnd, clamp, lerp, E } = A;
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
  A.nachbearbeitung = (s, T) => {
    const k = Number(s.kino) || 0;
    if (k <= 0) return;
    const w4 = W / 4, h4 = H / 4, a = lw("klein", w4, h4), b = lw("glow", w4, h4);
    a.setTransform(1, 0, 0, 1, 0, 0); a.filter = "none"; a.clearRect(0, 0, w4, h4); a.drawImage(A.cv, 0, 0, w4, h4);
    b.setTransform(1, 0, 0, 1, 0, 0); b.clearRect(0, 0, w4, h4); b.filter = "brightness(0.78) contrast(2.3) saturate(1.4) blur(7px)"; b.drawImage(a.canvas, 0, 0); b.filter = "none";
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = clamp(0.5 * k, 0, 0.9); ctx.drawImage(b.canvas, 0, 0, W, H);
    // Körnung: Rauschkachel, pro Bild versetzt (aus der Zeit abgeleitet, also reproduzierbar)
    if (!A._kg_rausch) {
      const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d"), d = g.createImageData(256, 256), r = rnd(77);
      for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() - 0.5) * 110; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
      g.putImageData(d, 0, 0); A._kg_rausch = ctx.createPattern(c, "repeat");
    }
    const f = Math.floor(T * 24), ox = (f * 97) % 256, oy = (f * 61) % 256;
    ctx.globalCompositeOperation = "overlay"; ctx.globalAlpha = clamp(0.16 * k, 0, 0.3);
    ctx.translate(-ox, -oy); ctx.fillStyle = A._kg_rausch; ctx.fillRect(0, 0, W + 256, H + 256);
    ctx.restore();
  };

  // =====================================================================
  // WELTALL – Erde mit Atmosphäre, Nachtseite mit Stadtlichtern, Sterne, Nebel (erde=false, sonne, satellit, mond)
  // =====================================================================
  SZ.weltall = (s, t) => {
    ctx.fillStyle = rgrad(540, 700, 100, 1700, [[0, "#1a1d4a"], [0.6, "#0b0d26"], [1, "#04050f"]]); ctx.fillRect(-1500, -1500, 4080, 4000);
    for (const [x, y, r, c, a] of [[200, 400, 600, "#6a3fa0", 0.22], [900, 700, 500, "#2a7fa0", 0.18], [500, 200, 400, "#a03f7a", 0.12]]) glut(x, y, r, c, a);
    sterne(220, 12, t);
    if (s.sonne) { glut(980, 160, 520, "#ffcf8a", 0.9); circle(980, 160, 60, "#fff6e0"); A.licht(980, 160, 900, "#ffd59a", 1.2); }
    if (s.mond) { circle(170, 380, 70, "#c9ccd6"); circle(150, 360, 14, "#aeb2bf"); circle(195, 405, 10, "#aeb2bf"); }
    if (s.erde !== false) {
      const cx = 540, cy = s.erde_y ?? 1650, R = s.erde_r ?? 820;
      glut(cx, cy, R * 1.25, "#5fb8ff", 0.55);
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = rgrad(cx - R * 0.3, cy - R * 0.4, R * 0.1, R * 1.1, [[0, "#3f8fd8"], [1, "#163a7a"]]); ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      const r = rnd(5), dreh = (t * 6) % 2400;
      for (let i = 0; i < 9; i++) {
        const bx = cx - R - 600 + ((r() * 2400 + dreh) % 2400), by = cy - R * 0.85 + r() * R * 0.9, bw = 140 + r() * 260, bh = 80 + r() * 160;
        // weiche Kontinent-Form: Punkte auf einer welligen Ellipse, mit Kurven verbunden
        const pk = []; for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, rr = 0.8 + 0.25 * Math.sin(k * 2.3 + i * 1.7); pk.push([bx + Math.cos(a) * bw * rr, by + Math.sin(a) * bh * rr]); }
        ctx.beginPath(); ctx.moveTo((pk[7][0] + pk[0][0]) / 2, (pk[7][1] + pk[0][1]) / 2);
        for (let k = 0; k < 8; k++) { const n = pk[(k + 1) % 8]; ctx.quadraticCurveTo(pk[k][0], pk[k][1], (pk[k][0] + n[0]) / 2, (pk[k][1] + n[1]) / 2); } ctx.closePath();
        ctx.fillStyle = i % 3 ? "#5f9a5a" : "#b8a46a"; ctx.fill();
      }
      for (let i = 0; i < 14; i++) { const x = cx - R + ((r() * 2 * R + t * 10) % (2 * R)), y = cy - R * 0.9 + r() * R * 0.8; ellipse(x, y, 90 + r() * 120, 18 + r() * 14, rgba("#ffffff", 0.55)); }
      // Nachtseite rechts mit Stadtlichtern
      ctx.fillStyle = lgrad(cx - R * 0.2, 0, cx + R * 0.6, 0, [[0, "rgba(4,6,20,0)"], [1, "rgba(4,6,20,0.82)"]]); ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      for (let i = 0; i < 160; i++) { const x = cx + R * 0.2 + r() * R * 0.8, y = cy - R * 0.9 + r() * R * 0.9; circle(x, y, 1.5 + r() * 2, rgba("#ffd27a", 0.5 + 0.4 * r())); }
      ctx.restore();
      ctx.beginPath(); ctx.arc(cx, cy, R + 6, Math.PI * 1.05, Math.PI * 1.95); ctx.lineWidth = 14; ctx.strokeStyle = rgba("#8fd6ff", 0.6); ctx.stroke();
    }
    if (s.satellit) { const a = t * 0.35; const x = 540 + Math.cos(a) * 420, y = 700 + Math.sin(a) * 120; ctx.save(); ctx.translate(x, y); ctx.rotate(0.3); box(-14, -10, 28, 20, 4, "#d9dde4"); box(-60, -6, 40, 12, 2, "#3d6fb5"); box(20, -6, 40, 12, 2, "#3d6fb5"); ctx.restore(); circle(x + 4, y - 14, 3, Math.sin(t * 6) > 0 ? "#ff5b4d" : "#7a2a24"); }
    A.figurenZeigen(s, t, 1500, 0.8);
    A._dunkel = 0;
  };

  // =====================================================================
  // GROSSSTADT – Stadt mit Tiefe: Skyline-Schichten, Nebel, leuchtende Fenster, Lichtspuren (dach: Figuren auf einem Dach vorne)
  // =====================================================================
  SZ.grossstadt = (s, t) => {
    const zeit = zeitVon(s), nacht = zeit === "nacht", hc = HIMMEL[zeit];
    ctx.fillStyle = lgrad(0, -600, 0, 1300, [[0, hc[0]], [1, hc[1]]]); ctx.fillRect(-1500, -1500, 4080, 3200);
    if (nacht) { sterne(80, 3, t, -900, -900, 2900, 1500); circle(820, 260, 58, "#f1ead2"); glut(820, 260, 260, "#cfd8ff", 0.35); }
    else glut(300, 900, 700, zeit === "tag" ? "#fff2c4" : "#ffb070", 0.55);
    const schichten = [[1060, 0.35, 260, 620, 0.78], [1180, 0.55, 300, 760, 0.6], [1330, 0.78, 380, 900, 0.38], [1520, 1, 420, 1050, 0.16]];
    schichten.forEach(([basis, tiefe, hMin, hMax, nebelA], li) => {
      const r = rnd(11 + li * 7), farbe = mix(nacht ? "#0c1026" : "#3a4466", hc[1], nebelA * 0.9);
      for (let x = -700; x < 1800;) {
        const w = (70 + r() * 150) * (0.6 + tiefe * 0.6), h = hMin + r() * (hMax - hMin);
        box(x, basis - h, w, h + 400, 3, farbe);
        if (r() < 0.25) { line(x + w / 2, basis - h, x + w / 2, basis - h - 60 * tiefe, 3, farbe); if (Math.sin(t * 3 + x) > 0) { circle(x + w / 2, basis - h - 60 * tiefe, 4, "#ff4d3d"); glut(x + w / 2, basis - h - 60 * tiefe, 24, "#ff4d3d", 0.6); } }
        if (nacht || zeit === "abend") for (let yy = basis - h + 20 * tiefe; yy < basis - 10; yy += 34 * tiefe + 8) for (let xx = x + 8; xx < x + w - 12; xx += 22 * tiefe + 6) if (r() < 0.32) box(xx, yy, 8 * tiefe + 3, 12 * tiefe + 4, 1, rgba(r() < 0.8 ? "#ffd27a" : "#9fd6ff", 0.55 + 0.4 * tiefe));
        x += w + 4 + r() * 10;
      }
      nebel(basis - 40, 120, mix(hc[1], "#ffffff", 0.2), nebelA * 0.5);
    });
    // Straße mit Lichtspuren
    box(-1500, 1520, 4080, 900, 0, "#0b0d18"); box(-1500, 1520, 4080, 160, 0, "#0f1220");
    for (let i = 0; i < 26; i++) { const r = rnd(i + 40), sp = 120 + r() * 220, links = i % 2, x = links ? 1300 - ((t * sp + r() * 2600) % 2600) : -1300 + ((t * sp + r() * 2600) % 2600), y = links ? 1570 : 1630; box(x, y - 4, 70, 8, 4, links ? "#ff5b4d" : "#fff1c4"); glut(x + 35, y, 50, links ? "#ff5b4d" : "#fff1c4", 0.5); }
    if (s.dach !== false && (s.figuren || []).length) { box(-1500, 1600, 4080, 600, 0, "#1a1d2c"); box(-1500, 1590, 4080, 20, 4, "#2a2f44"); }
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
      const r = rnd(k * 13 + (seite > 0 ? 5 : 0));
      for (let j = 0; j < 9; j++) { const v = (j + 0.5) / 9, a = 0.4 + 0.6 * (Math.sin(t * (2 + r() * 5) + j + k) > 0.2 ? 1 : 0.2); const yA = lerp(ob0, un0, v), yB = lerp(ob1, un1, v); line(x0 + (x1 - x0) * 0.15, lerp(yA, yB, 0.15), x0 + (x1 - x0) * 0.85, lerp(yA, yB, 0.85), 2 + k * 0.5, rgba(r() < 0.75 ? akz : "#6dff9a", 0.55 * a)); }
      line(x1, ob1, x1, un1, 3 + k * 0.6, "#05070f");
    }
    // Deckenlichter und Bodennebel
    for (let k = 1; k < 9; k++) { const q = Math.pow(k / 9, 1.6), y = lerp(fy - 130, -320, q), w = lerp(30, 900, q); box(fx - w / 2, y, w, 6 + 10 * q, 4, rgba("#dff4ff", 0.6)); }
    nebel(1500, 260, akz, 0.12);
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
    const zeit = zeitVon(s, "abend"), nacht = zeit === "nacht", hc = HIMMEL[zeit];
    ctx.fillStyle = lgrad(0, -600, 0, 1300, [[0, hc[0]], [1, hc[1]]]); ctx.fillRect(-1500, -1500, 4080, 3200);
    if (nacht) { sterne(160, 8, t, -900, -900, 2900, 1700); circle(760, 330, 60, "#f1ead2"); glut(760, 330, 300, "#cfd8ff", 0.35); }
    else { const sy = zeit === "tag" ? 320 : 820; glut(540, sy, 900, zeit === "tag" ? "#fff6d0" : "#ffc07a", 0.85); circle(540, sy, 110, zeit === "tag" ? "#fffbea" : "#ffe2a8"); }
    const berge = [[880, 260, 0.82, 3], [980, 330, 0.62, 7], [1100, 380, 0.42, 11], [1240, 420, 0.22, 17]];
    berge.forEach(([basis, hoehe, dunst, seed], li) => {
      const r = rnd(seed), farbe = mix(nacht ? "#0d1430" : "#2b3a52", hc[1], dunst);
      ctx.beginPath(); ctx.moveTo(-1500, 2400); let x = -1500; ctx.lineTo(x, basis);
      while (x < 2600) { const w = 120 + r() * 260; ctx.lineTo(x + w / 2, basis - hoehe * (0.4 + r() * 0.6)); x += w; ctx.lineTo(x, basis - r() * 40); }
      ctx.lineTo(2600, 2400); ctx.closePath(); ctx.fillStyle = farbe; ctx.fill();
      nebel(basis + 30, 90, mix(hc[1], "#ffffff", 0.3), 0.35 - li * 0.06);
    });
    if (s.see) { ctx.fillStyle = lgrad(0, 1300, 0, 1500, [[0, mix(hc[1], "#6aa6d0", 0.4)], [1, mix(hc[0], "#1a2a40", 0.5)]]); ctx.fillRect(-1500, 1300, 4080, 200); for (let i = 0; i < 12; i++) { const r = rnd(i + 3); box(-200 + r() * 1500 + Math.sin(t + i) * 20, 1320 + r() * 160, 60 + r() * 120, 4, 2, rgba("#ffffff", 0.3)); } }
    // Hügel vorne
    ctx.beginPath(); ctx.moveTo(-1500, 2400); ctx.lineTo(-1500, 1560); ctx.bezierCurveTo(-200, 1480, 400, 1500, 900, 1540); ctx.bezierCurveTo(1400, 1580, 2000, 1560, 2600, 1600); ctx.lineTo(2600, 2400); ctx.closePath();
    ctx.fillStyle = nacht ? "#0f1a16" : zeit === "abend" ? "#3d3a3a" : "#4f7a45"; ctx.fill();
    for (const [x, h] of [[-60, 420], [40, 300], [1010, 360], [1120, 460]]) { box(x - 6, 1560 - h * 0.25, 12, h * 0.25, 4, "#1a1614"); poly([[x - 70, 1560 - h * 0.2], [x + 70, 1560 - h * 0.2], [x, 1560 - h]], nacht ? "#0b1410" : "#24362c"); }
    if (s.voegel !== false && !nacht) for (let i = 0; i < 7; i++) { const r = rnd(i + 31), x = (r() * 1400 - 200 + t * (30 + r() * 30)) % 1600 - 200, y = 500 + r() * 300, fl = Math.sin(t * 8 + i) * 10; line(x - 18, y - fl, x, y, 4, "#1d1b26"); line(x, y, x + 18, y - fl, 4, "#1d1b26"); }
    A.figurenZeigen(s, t, 1640, 0.95);
    A.alltagWetter(s, t, true);
    A._dunkel = nacht ? 0.35 : 0;
  };

  // =====================================================================
  // WALD – Stämme in Schichten, Lichtstrahlen, schwebende Teilchen, Farn (zeit, nebel)
  // =====================================================================
  SZ.wald = (s, t) => {
    const zeit = zeitVon(s, "tag"), nacht = zeit === "nacht", hc = HIMMEL[zeit];
    ctx.fillStyle = lgrad(0, -600, 0, 1600, [[0, mix(hc[0], "#1f3a2c", 0.5)], [1, mix(hc[1], "#3f5a3a", 0.5)]]); ctx.fillRect(-1500, -1500, 4080, 3400);
    for (let li = 0; li < 4; li++) {
      const r = rnd(li * 9 + 2), tiefe = (li + 1) / 4, farbe = mix(nacht ? "#0a1410" : "#1d2a22", mix(hc[1], "#7fa07a", 0.5), (1 - tiefe) * 0.75);
      for (let x = -900; x < 2000;) { const w = (30 + r() * 50) * (0.5 + tiefe * 1.3); box(x, -1500, w, 3400, w * 0.2, farbe); x += w + (80 + r() * 220) * (1.2 - tiefe * 0.4); }
      if (li < 3) nebel(1100 + li * 120, 200, mix(hc[1], "#ffffff", 0.3), (s.nebel ? 0.35 : 0.18));
    }
    if (!nacht) { ctx.save(); ctx.globalCompositeOperation = "screen"; for (let i = 0; i < 6; i++) { const x = 100 + i * 190 + Math.sin(t * 0.3 + i) * 20; ctx.fillStyle = lgrad(0, -300, 0, 1700, [[0, rgba("#fff3c4", 0.32)], [1, rgba("#fff3c4", 0)]]); poly([[x, -300], [x + 70, -300], [x + 380, 1700], [x + 150, 1700]]); ctx.fill(); } ctx.restore(); }
    box(-1500, 1560, 4080, 900, 0, nacht ? "#0c1410" : "#2f4a30");
    const r = rnd(5); for (let i = 0; i < 22; i++) { const x = -100 + r() * 1300, y = 1580 + r() * 260; for (const a of [-0.9, -0.5, 0, 0.5, 0.9]) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ellipse(0, -40, 16, 50, nacht ? "#132018" : "#3f6a3a"); ctx.restore(); } }
    for (let i = 0; i < 40; i++) { const q = rnd(i + 60), x = (q() * 1300 + Math.sin(t * 0.5 + i) * 30) % 1300 - 100, y = (q() * 1700 - t * 12 * q() + 1700) % 1700; circle(x, y, 2 + q() * 3, rgba(nacht ? "#f6f0a0" : "#fffbe0", 0.5)); }
    A.figurenZeigen(s, t, 1660, 0.95);
    A.alltagWetter(s, t, true);
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
})();
