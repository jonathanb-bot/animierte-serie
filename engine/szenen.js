/* Szenen der Serie. Jede Szene zeichnet in Weltkoordinaten (1080 x 1920, Kamera darüber). */
(() => {
  const { box, circle, ellipse, poly, line, shade, rgba, lgrad, rgrad, rr, fill, mix, rnd, clamp, lerp, E } = A;
  const W = 1080, H = 1920;
  const SZ = (A.SZ = {});

  // ---------- Paletten ----------
  const HIMMEL = {
    tag: ["#6fa8d6", "#cfe5f0"], morgen: ["#8fa6c9", "#f4cfae"], abend: ["#384073", "#ee9a66"], nacht: ["#0a0f24", "#25305a"], rot: ["#3a0f12", "#b2412f"],
  };
  const zeitVon = s => s.zeit || "tag";
  A.himmelMalen = (zeit, x0 = -3000, y0 = -3000, w = 9000, h = 12000, top = -800, bottom = 1400) => {
    const c = HIMMEL[zeit] || HIMMEL.tag;
    ctx.fillStyle = lgrad(0, top, 0, bottom, [[0, c[0]], [1, c[1]]]); ctx.fillRect(x0, y0, w, h);
  };
  function sterne(t, y1 = 900) {
    const r = rnd(77);
    for (let i = 0; i < 90; i++) { const x = r() * W * 1.6 - W * 0.3, y = r() * y1 - 300, a = 0.3 + 0.5 * Math.abs(Math.sin(t * 0.8 + i)); circle(x, y, 1.5 + r() * 2.2, `rgba(255,255,255,${a})`); }
  }
  function sonneMond(zeit, x, y) {
    if (zeit === "nacht") { circle(x, y, 60, "#f2efe2"); circle(x + 22, y - 12, 54, mix(HIMMEL.nacht[0], HIMMEL.nacht[1], 0.2)); }
    else if (zeit === "abend") { circle(x, y + 500, 110, "#ffc27a"); }
    else if (zeit === "tag") { circle(x, y, 70, "#fff6d6"); ctx.fillStyle = rgrad(x, y, 60, 260, [[0, "rgba(255,246,214,0.5)"], [1, "rgba(255,246,214,0)"]]); ctx.fillRect(x - 260, y - 260, 520, 520); }
  }
  // Stadt-Silhouette
  function stadt(seed, basis, hMin, hMax, farbe, zeit, t, licht = 0.25, x0 = -900, x1 = 2000) {
    const r = rnd(seed);
    let x = x0;
    while (x < x1) {
      const w = 70 + r() * 150, h = hMin + r() * (hMax - hMin);
      box(x, basis - h, w, h + 2000, 3, farbe);
      if (r() < 0.25) box(x + w * 0.4, basis - h - 40, 6, 40, 2, farbe);
      // Fenster
      const fw = 10, fh = 14;
      for (let yy = basis - h + 20; yy < basis - 10; yy += 32) for (let xx = x + 12; xx < x + w - 14; xx += 24) {
        const v = r();
        if (zeit === "nacht" || zeit === "abend") { if (v < licht * (zeit === "abend" ? 0.6 : 1)) box(xx, yy, fw, fh, 2, v < licht * 0.3 ? "#ffd27a" : "#e9b866"); }
        else if (v < 0.5) box(xx, yy, fw, fh, 2, rgba("#ffffff", 0.12));
      }
      x += w + r() * 10;
    }
  }
  function rauch(punkte, t, farbe = "#3b3b40") {
    for (const [px, py, gr] of punkte) {
      for (let i = 0; i < 14; i++) {
        const w = ((t * 0.12 + i / 14) % 1);
        const x = px + Math.sin(w * 6 + i) * 30 * gr + w * 160 * gr, y = py - w * 700 * gr;
        circle(x, y, (25 + w * 110) * gr, rgba(farbe, 0.35 * (1 - w)));
      }
      ellipse(px, py, 30 * gr, 14 * gr, rgba("#ff8a3d", 0.6 + 0.3 * Math.sin(t * 9)));
    }
  }
  function regen(t, n = 140, farbe = "#bcd6ea") {
    const r = rnd(9);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (let i = 0; i < n; i++) { const x = r() * (W + 300) - 150, sp = 0.8 + r() * 0.5, y = ((r() * H + t * 1900 * sp) % (H + 200)) - 100; line(x, y, x - 14, y + 46, 3, rgba(farbe, 0.55)); }
    ctx.restore();
  }
  A.regen = regen;
  function heli(x, y, s, t, zeit) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const c = zeit === "nacht" ? "#1a1d24" : "#2d3a2f";
    if (zeit === "nacht") { ctx.fillStyle = lgrad(0, 0, 0, 900, [[0, "rgba(255,250,210,0.45)"], [1, "rgba(255,250,210,0)"]]); poly([[-10, 30], [10, 30], [260, 900], [-260, 900]]); ctx.fill(); }
    box(-70, -30, 140, 70, 34, c); box(40, -10, 170, 18, 9, c); box(190, -40, 16, 50, 6, c);
    box(-40, 40, 110, 8, 4, c); box(-50, 52, 130, 6, 3, c);
    ellipse(-38, -4, 30, 22, rgba("#9cc6e8", 0.8));
    const rot = Math.sin(t * 60) * 160; line(-rot, -42, rot, -42, 6, rgba(c, 0.7)); box(-5, -42, 10, 12, 3, c);
    circle(198, -15, 22 + Math.sin(t * 50) * 3, rgba(c, 0.3));
    ctx.restore();
  }
  A.heli = heli;

  // ---------- Zombies in Gruppen ----------
  A.horde = (def, t) => {
    const n = def.n || 6, r = rnd(def.seed || 5);
    const list = [];
    for (let i = 0; i < n; i++) {
      const tiefe = r();
      const sk = (def.skala || 0.42) * (0.8 + tiefe * 0.4);
      const y = def.y + tiefe * (def.tiefe ?? 120);
      let x0 = def.x0 + r() * (def.x1 - def.x0);
      let x;
      const tempo = (def.tempo ?? 30) * (0.7 + r() * 0.6);
      if (def.ziel != null) { const d = def.ziel - x0; x = x0 + Math.sign(d) * Math.min(Math.abs(d) - 30 - r() * 60, t * tempo); if (Math.abs(d) < 90) x = x0; }
      else { const dir = def.richtung ?? (r() < 0.5 ? -1 : 1); const span = def.x1 - def.x0 + 400; x = def.x0 - 200 + ((x0 - def.x0 + 200 + dir * t * tempo) % span + span) % span; }
      const dir = def.ziel != null ? Math.sign(def.ziel - x0) : 0;
      list.push({ x, y, sk, i, f: A.zombieFigur(i + (def.seed || 0)), spieg: dir < 0 });
    }
    list.sort((a, b) => a.y - b.y);
    for (const z of list) A.figur(z.x, z.y, z.sk, z.f, { t: t + z.i * 0.7, pose: def.stehen ? "zombie" : "zombie_geht", phase: z.i * 1.7, spiegeln: z.spieg });
  };

  // ---------- Figuren einer Szene ----------
  A.figurenZeigen = (s, t, y, skala, xs) => {
    const liste = s.figuren || (s.figur ? [s.figur] : []);
    const n = liste.length;
    const pos = xs || (n === 1 ? [W / 2] : n === 2 ? [360, 720] : n === 3 ? [250, 540, 830] : liste.map((_, i) => 170 + i * (740 / (n - 1))));
    liste.forEach((name, i) => {
      const f = A.fig(name);
      const spricht = s._spricht && s.sprecher === name;
      const blickX = n > 1 ? (i < n / 2 ? 1 : -1) : 0;
      A.figur(pos[i], y + (n > 2 && i % 2 ? 12 : 0), skala, f, {
        t: t + i * 1.1, pose: (s.posen || {})[name] || s.pose, ausdruck: (s.ausdruecke || {})[name] || s.ausdruck,
        spricht, blick: [blickX, 0], drehung: n > 1 ? blickX * 0.35 : (s.drehung || 0), seed: i * 5 + 2, halt: (s.haelt || {})[name],
      });
    });
  };

  // =====================================================================
  // SKYLINE – die Stadt von außen, unser Hochhaus in der Mitte
  // =====================================================================
  SZ.skyline = (s, t) => {
    const zeit = zeitVon(s);
    A.himmelMalen(zeit, -3000, -3000, 9000, 12000, -600, 1500);
    if (zeit === "nacht") sterne(t);
    sonneMond(zeit, 820, 260);
    const hc = HIMMEL[zeit] || HIMMEL.tag;
    stadt(3, 1500, 300, 760, mix(hc[1], "#2a2f45", 0.45), zeit, t, 0.08);
    if (s.rauch !== false) rauch([[150, 1150, 1], [960, 1250, 0.8], [-80, 1300, 1.2]], t);
    stadt(8, 1750, 250, 600, mix(hc[1], "#1d2133", 0.68), zeit, t, 0.05);
    // Unser Hochhaus
    const x0 = 380, x1 = 700, top = 420;
    box(x0, top, x1 - x0, 3000, 4, zeit === "nacht" ? "#2c3247" : "#8b93a3");
    ctx.beginPath(); ctx.rect(x0, top, x1 - x0, 3000); A.schattiere(x0, x1, 0.35);
    for (let f = 0; f < 40; f++) {
      const y = top + 30 + f * 62;
      for (let k = 0; k < 5; k++) {
        const x = x0 + 22 + k * 58;
        let c = zeit === "nacht" ? "#1d2232" : rgba("#cfe0ee", 0.55);
        if (f === 0 && s.licht) { c = "#ffd27a"; A.licht(x + 18, y + 18, 120, "#ffc66b", 0.9); }
        box(x, y, 38, 40, 3, c);
      }
    }
    // Dach: Tank + Antenne
    box(x0 - 10, top - 14, x1 - x0 + 20, 18, 4, zeit === "nacht" ? "#242a3b" : "#6e7686");
    box(x0 + 30, top - 110, 110, 96, 12, zeit === "nacht" ? "#2a3044" : "#7c8494"); box(x0 + 40, top - 20, 10, 10, 2, "#555"); box(x0 + 120, top - 20, 10, 10, 2, "#555");
    line(x1 - 60, top - 14, x1 - 60, top - 220, 6, zeit === "nacht" ? "#2a3044" : "#6e7686");
    circle(x1 - 60, top - 222, 8, Math.sin(t * 3) > 0 ? "#ff5a4a" : "#6e2a28");
    if (s.heli) heli(lerp(-300, 1400, (t * 0.08 + 0.1) % 1), 300, 0.8, t, zeit);
    if (s.regen) regen(t);
    A._dunkel = zeit === "nacht" ? 0.45 : zeit === "abend" ? 0.15 : 0;
  };

  // =====================================================================
  // HOCHHAUS – Querschnitt, 24 Etagen, Treppenhaus, Wasserleitung, Straße
  // =====================================================================
  const N = 24, FH = 300, ROOF = 300, GROUND = ROOF + N * FH;
  A.etageY = n => ROOF + (N - n) * FH + FH / 2;
  const WAND = ["#c9bfae", "#b7c4c0", "#cdb9a8", "#aebbca", "#c6c2b0", "#b9b0c4", "#c4ccb5"];
  SZ.hochhaus = (s, t) => {
    const zeit = zeitVon(s);
    const v = A.sicht;
    A.himmelMalen(zeit, -3000, -3000, 9000, GROUND + 3000, ROOF - 1500, ROOF + 900);
    if (zeit === "nacht" && v.y0 < ROOF + 400) sterne(t, ROOF + 300);
    if (v.y0 < ROOF + 900) { const hc = HIMMEL[zeit] || HIMMEL.tag; stadt(12, ROOF + 1200, 200, 900, mix(hc[1], "#2a2f45", 0.5), zeit, t, 0.06); if (s.rauch !== false) rauch([[-40, ROOF + 700, 1], [1100, ROOF + 800, 0.9]], t); }
    // Gebäude
    box(60, ROOF, 960, N * FH, 0, "#6f7480");
    // Wasserleitung (Druckzone)
    const druckBis = s.druck ?? (s.wasser === "weg" ? 0 : N); // bis zu welcher Etage Wasser ankommt
    for (let n = 1; n <= N; n++) {
      const top = ROOF + (N - n) * FH, bot = top + FH;
      if (bot < v.y0 - 50 || top > v.y1 + 50) continue;
      const r = rnd(n * 31);
      const unsere = n === (s.unsere ?? 24);
      // Räume
      const wc = WAND[n % WAND.length];
      box(205, top + 10, 545, FH - 32, 0, wc);
      box(205, bot - 70, 545, 48, 0, shade(wc, -0.12)); // Boden
      // Fenster auf der Rückwand
      box(300 + (n % 3) * 90, top + 50, 150, 110, 6, (HIMMEL[zeit] || HIMMEL.tag)[1]);
      box(300 + (n % 3) * 90, top + 50, 150, 110, 6, rgba("#ffffff", 0.08));
      line(375 + (n % 3) * 90, top + 50, 375 + (n % 3) * 90, top + 160, 6, shade(wc, -0.25));
      // Möbel
      const m = Math.floor(r() * 4);
      const mc = shade(["#7b5e4a", "#5f6f7f", "#8a6a5a", "#6a7a5a"][m], 0);
      if (m === 0) { box(560, bot - 140, 160, 70, 18, mc); box(560, bot - 170, 40, 100, 14, mc); }
      else if (m === 1) { box(560, bot - 130, 170, 26, 8, mc); box(570, bot - 104, 12, 40, 3, mc); box(708, bot - 104, 12, 40, 3, mc); }
      else if (m === 2) { box(600, bot - 230, 110, 160, 6, mc); for (let k = 0; k < 3; k++) box(608, bot - 220 + k * 50, 94, 6, 2, shade(mc, -0.2)); }
      else { box(540, bot - 120, 190, 50, 14, mc); box(540, bot - 150, 190, 34, 14, shade(mc, 0.15)); }
      // Lampe
      line(480, top + 10, 480, top + 50, 3, "#444");
      const lampeAn = (s.strom !== false && (unsere || r() < 0.3)) || (unsere && s.licht);
      ellipse(480, top + 56, 34, 12, lampeAn ? "#ffe6a8" : "#8a8a8a");
      if (lampeAn) A.licht(480, top + 120, 260, "#ffd27a", unsere ? 1.1 : 0.6);
      // Zombies auf dieser Etage
      const zAnz = A.zombiesAufEtage(s, n);
      for (let k = 0; k < zAnz; k++) A.figur(250 + ((k * 137 + n * 53) % 260) + Math.sin(t * 0.6 + k + n) * 30, bot - 66, 0.3, A.zombieFigur(n + k), { t: t + n + k, pose: "zombie", phase: n + k });
      // unsere Leute
      if (unsere && (s.figuren || []).length) A.figurenZeigen({ ...s, figuren: s.figuren }, t, bot - 66, 0.3, s.figuren.map((_, i) => 290 + i * 95));
      // Decke / Boden-Platte
      box(60, bot - 22, 960, 26, 0, "#5b606b");
      // Treppenhaus
      box(760, top + 4, 240, FH - 26, 0, "#9ea3a8");
      ctx.lineWidth = 12; ctx.strokeStyle = "#7d838a"; ctx.lineCap = "butt";
      ctx.beginPath(); ctx.moveTo(770, bot - 22); for (let k = 0; k <= 8; k++) { ctx.lineTo(770 + k * 26, bot - 22 - k * 16); ctx.lineTo(770 + (k + 1) * 26, bot - 22 - k * 16); } ctx.stroke();
      box(770, top + 120, 220, 14, 3, "#7d838a");
      A.text(String(n), 870, top + 60, 64, rgba("#2a2e36", 0.35));
      if (s.barrikade === n) {
        box(775, bot - 110, 90, 88, 8, "#8a6a4a"); box(840, bot - 140, 120, 60, 10, "#5f6f7f"); box(790, bot - 170, 70, 60, 8, "#b5824e");
        poly([[880, bot - 160], [985, bot - 100], [985, bot - 22], [880, bot - 22]], "#6d5a48"); line(800, bot - 175, 960, bot - 60, 8, "#3c3f44");
      }
      // Aufzug
      box(80, top, 115, FH - 22, 0, "#2d3038"); line(110, top, 110, bot - 22, 3, "#555b66"); line(165, top, 165, bot - 22, 3, "#555b66");
      if (n === (s.aufzug ?? 9)) { box(88, top + 40, 99, 230, 6, "#9aa1aa"); box(96, top + 60, 40, 190, 3, "#7f868f"); box(140, top + 60, 40, 190, 3, "#7f868f"); }
      // Wasserrohr
      const nass = n <= druckBis;
      box(196, top - 2, 14, FH + 4, 0, nass ? "#3f8fd0" : "#8b9198");
      if (nass && s.wasser) for (let k = 0; k < 3; k++) { const yy = bot - ((t * 180 + k * 100) % FH); box(199, yy, 8, 22, 4, "#bfe6ff"); }
      if (unsere && s.wasser === "weg") { A.objekt("tropfen", 240, top + 110, 0.18, t); }
    }
    // Außenwände
    box(50, ROOF - 20, 30, N * FH + 20, 0, "#4c515c"); box(1000, ROOF - 20, 30, N * FH + 20, 0, "#4c515c");
    // Dach
    if (v.y0 < ROOF + 100) {
      box(40, ROOF - 30, 1000, 34, 4, "#565b66");
      // Tank
      const tx = 260, ty = ROOF - 300;
      box(tx + 20, ROOF - 70, 16, 44, 3, "#4c515c"); box(tx + 230, ROOF - 70, 16, 44, 3, "#4c515c");
      box(tx, ty, 270, 232, 26, "#9aa3ab"); ctx.beginPath(); ctx.rect(tx, ty, 270, 232); A.schattiere(tx, tx + 270, 0.3);
      const fs = clamp(s.tank ?? 0.7, 0, 1);
      box(tx + 30, ty + 30, 40, 172, 8, "#5d646b"); box(tx + 30, ty + 30 + 172 * (1 - fs), 40, 172 * fs, 8, "#4aa8e0");
      A.text("WASSERTANK", tx + 160, ty + 116, 22, "#4c525a");
      line(880, ROOF - 30, 880, ROOF - 320, 8, "#565b66"); circle(880, ROOF - 322, 10, Math.sin(t * 3) > 0 ? "#ff5a4a" : "#6e2a28");
      if (s.figuren_dach) A.figurenZeigen({ ...s, figuren: s.figuren_dach }, t, ROOF - 30, 0.3, s.figuren_dach.map((_, i) => 600 + i * 90));
    }
    // Straße + Erdgeschoss
    if (v.y1 > GROUND - 200) {
      box(-3000, GROUND, 9000, 120, 0, "#52565f"); box(-3000, GROUND + 120, 9000, 500, 0, "#3e4149");
      for (let k = -10; k < 30; k++) box(k * 160, GROUND + 230, 80, 12, 3, "#c9c37a");
      box(-3000, GROUND + 620, 9000, 2000, 0, "#5e4632");
      A.horde({ n: s.horde ?? 9, x0: -100, x1: 1180, y: GROUND + 150, tiefe: 300, skala: 0.34, seed: 3, tempo: 20, ziel: s.laerm_x }, t);
      if (s.laerm_x != null) A.laermWellen(s.laerm_x, GROUND + 60, t, 1);
    }
    if (s.regen) regen(t);
    A._dunkel = zeit === "nacht" ? 0.55 : zeit === "abend" ? 0.2 : s.strom === false ? 0.15 : 0;
  };
  A.zombiesAufEtage = (s, n) => {
    if (!s.zombies) return 0;
    if (typeof s.zombies === "object") return s.zombies[n] || 0;
    // "1-8" oder Zahl = alle Etagen bis dahin
    const [a, b] = String(s.zombies).includes("-") ? String(s.zombies).split("-").map(Number) : [1, Number(s.zombies)];
    return n >= a && n <= b ? 1 + ((n * 7) % 3 === 0 ? 1 : 0) : 0;
  };

  // =====================================================================
  // WOHNUNG – oberster Stock, großes Fenster mit Blick über die Stadt
  // =====================================================================
  function fensterBlick(x, y, w, h, zeit, t, s) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    const c = HIMMEL[zeit] || HIMMEL.tag;
    ctx.fillStyle = lgrad(0, y, 0, y + h, [[0, c[0]], [1, c[1]]]); ctx.fillRect(x, y, w, h);
    if (zeit === "nacht") { const r = rnd(4); for (let i = 0; i < 30; i++) circle(x + r() * w, y + r() * h * 0.5, 1.6, "rgba(255,255,255,0.7)"); circle(x + w * 0.78, y + h * 0.2, 26, "#f2efe2"); }
    ctx.save(); ctx.translate(x, y + h); ctx.scale(w / 1080, w / 1080);
    stadt(21, 40, 120, 520, mix(c[1], "#2a2f45", 0.45), zeit, t, 0.05, -100, 1200);
    if (s.rauch !== false) rauch([[220, -120, 0.7], [860, -60, 0.5]], t);
    stadt(25, 140, 60, 300, mix(c[1], "#1d2133", 0.7), zeit, t, 0.03, -100, 1200);
    if (s.heli) heli(lerp(-200, 1300, (t * 0.1) % 1), -560, 0.7, t, zeit);
    ctx.restore();
    if (s.regen) for (let i = 0; i < 40; i++) { const r = rnd(i + 3); const xx = x + r() * w, yy = y + ((r() * h + t * 900) % h); line(xx, yy, xx - 5, yy + 20, 2, "rgba(200,220,240,0.6)"); }
    ctx.restore();
  }
  SZ.wohnung = (s, t) => {
    const zeit = zeitVon(s);
    const wand = s.wand || "#d8cfc2";
    ctx.fillStyle = lgrad(0, 0, 0, 1500, [[0, shade(wand, 0.05)], [1, shade(wand, -0.12)]]); ctx.fillRect(-1500, -1500, 4080, 3200);
    // Fenster
    const fx = 220, fy = 380, fw = 640, fh = 640;
    box(fx - 24, fy - 24, fw + 48, fh + 48, 10, "#f2efe9");
    fensterBlick(fx, fy, fw, fh, zeit, t, s);
    line(fx + fw / 2, fy, fx + fw / 2, fy + fh, 14, "#f2efe9"); line(fx, fy + fh * 0.45, fx + fw, fy + fh * 0.45, 14, "#f2efe9");
    box(fx - 40, fy + fh + 18, fw + 80, 26, 6, "#e6e1d8");
    if (s.klebeband) { line(fx + 20, fy + 20, fx + fw - 20, fy + fh - 20, 22, rgba("#d9cfa0", 0.85)); line(fx + fw - 20, fy + 20, fx + 20, fy + fh - 20, 22, rgba("#d9cfa0", 0.85)); }
    if (zeit !== "nacht" && s.vorhang !== "zu") A.licht(fx + fw / 2, fy + fh / 2, 700, "#dfe9ff", 0.6);
    // Vorhang
    const zu = s.vorhang === "zu" ? 1 : s.vorhang === "schliesst" ? E.sanft(clamp(t / 1.5, 0, 1)) : 0;
    const vc = s.vorhang_farbe || "#3b3f52";
    box(fx - 80, fy - 70, fw + 160, 28, 10, "#6b6f7a");
    for (const side of [-1, 1]) {
      const breite = lerp(90, fw / 2 + 60, zu);
      const x = side < 0 ? fx - 70 : fx + fw + 70 - breite;
      box(x, fy - 50, breite, fh + 110, 14, vc);
      for (let k = 1; k < 5; k++) line(x + (breite / 5) * k, fy - 40, x + (breite / 5) * k, fy + fh + 50, 6, rgba("#000000", 0.12));
    }
    // Boden
    box(-1500, 1450, 4080, 800, 0, "#8a6a52"); for (let k = -10; k < 30; k++) line(k * 140, 1450, k * 140 - 60, 2250, 3, rgba("#000", 0.08));
    box(-1500, 1440, 4080, 18, 0, "#efe9df");
    // Sofa links
    if (s.moebel !== false) {
      box(-60, 1190, 330, 150, 40, "#5c6f8a"); box(-60, 1290, 330, 130, 30, "#6a7f9c"); box(-80, 1250, 60, 180, 26, "#5c6f8a"); box(250, 1250, 60, 180, 26, "#5c6f8a");
      // Küche rechts
      box(800, 1130, 400, 320, 10, "#e9e6e0"); box(790, 1110, 420, 30, 6, "#9b8b7a");
      box(850, 1120, 120, 16, 6, "#b8bec4"); box(895, 1040, 14, 84, 6, "#9aa2a8"); box(895, 1036, 50, 14, 6, "#9aa2a8");
      if (s.hahn === "an") line(940, 1050, 940, 1115, 8, "#7cc4f0");
      if (s.hahn === "tropft") { const y = 1052 + ((t * 120) % 60); ellipse(940, y, 6, 9, "#7cc4f0"); }
      for (let k = 0; k < 3; k++) box(830 + k * 120, 1180, 100, 240, 8, shade("#e9e6e0", -0.04));
      // Regal mit Vorräten
      box(830, 720, 260, 20, 4, "#8a6a52"); box(830, 880, 260, 20, 4, "#8a6a52");
      const vorr = s.vorraete ?? 4;
      for (let k = 0; k < Math.min(vorr, 8); k++) { const row = k < 4 ? 0 : 1; const xx = 845 + (k % 4) * 62; const yy = row ? 820 : 660; if (k % 2) A.objekt("dose", xx + 22, yy + 30, 0.28, 0); else A.objekt("wasserflasche", xx + 22, yy + 26, 0.32, t); }
    }
    // Wanduhr
    circle(960, 300, 50, "#2d3238"); circle(960, 300, 42, "#f5f2ea"); line(960, 300, 960, 268, 5, "#333"); line(960, 300, 982, 310, 5, "#333");
    // Licht
    line(540, -200, 540, 120, 4, "#444"); poly([[490, 120], [590, 120], [620, 170], [460, 170]], "#4a4f57");
    if (s.licht === "an") { ellipse(540, 172, 60, 10, "#fff1c4"); A.licht(540, 260, 900, "#ffe2a8", 1); }
    if (s.licht === "kerze") { box((s.kerze_x ?? 860) - 110, 1330, 220, 24, 8, "#6b5040"); A.objekt("kerze", s.kerze_x ?? 860, 1270, 0.5, t); A.licht(540, 1100, 900, "#ffb84d", 0.7); }
    if (s.objekt) A.objekt(s.objekt, s.objekt_x ?? 540, s.objekt_y ?? 1330, s.objekt_s ?? 0.6, t);
    // Tür (Barrikade)
    if (s.barrikade) { box(-40, 1050, 200, 400, 6, "#6d5a48"); box(-30, 980, 140, 90, 8, "#8a6a4a"); line(-40, 1000, 200, 1420, 12, "#3c3f44"); }
    A.figurenZeigen(s, t, 1520, (s.figuren || []).length > 1 ? 0.95 : 1.15);
    if (s.laerm_x != null) A.laermWellen(s.laerm_x, s.laerm_y ?? 900, t);
    // Dunkelheit
    const nacht = zeit === "nacht", abend = zeit === "abend";
    if (s.licht === "an") A._dunkel = nacht ? 0.15 : 0;
    else if (s.licht === "kerze" || s.pose === "taschenlampe" || Object.values(s.posen || {}).includes("taschenlampe")) A._dunkel = nacht ? 0.62 : 0.45;
    else A._dunkel = nacht ? 0.55 : abend ? 0.3 : s.vorhang === "zu" ? 0.38 : 0.1;
  };

  // =====================================================================
  // BAD – Badewanne volllaufen lassen, Spülkasten, Eimer
  // =====================================================================
  SZ.bad = (s, t, p) => {
    const tile = "#d9e3e6";
    ctx.fillStyle = tile; ctx.fillRect(-1500, -1500, 4080, 3000);
    for (let x = -1500; x < 2600; x += 120) line(x, -1500, x, 1500, 3, rgba("#9fb0b6", 0.6));
    for (let y = -1500; y < 1500; y += 120) line(-1500, y, 2600, y, 3, rgba("#9fb0b6", 0.6));
    box(-1500, 1480, 4080, 800, 0, "#a9b4b8"); for (let x = -1500; x < 2600; x += 160) line(x, 1480, x - 80, 2300, 3, rgba("#000", 0.08));
    // Spiegel + Waschbecken links
    box(40, 430, 260, 330, 20, "#c5d6dd"); box(55, 445, 230, 300, 14, "#e6f1f5"); line(90, 470, 170, 560, 10, "rgba(255,255,255,0.7)");
    // Toilette
    ctx.save(); ctx.translate(170, 1330); ctx.scale(0.85, 0.85); A.objekt("toilette", 0, 0, 1, t); ctx.restore();
    if (s.spuelkasten) { A.text("SPÜLKASTEN ≈ 9 L", 170, 1060, 34, "#2b3a44"); }
    // Badewanne
    const bx = 330, by = 1080, bw = 720, bh = 330;
    box(bx, by, bw, bh, 70, "#f4f6f8");
    const f0 = s.fuell ?? 0, f1 = s.fuell_bis ?? f0;
    const fuell = clamp(lerp(f0, f1, E.sanft(p)), 0, 1);
    ctx.save(); A.rr(bx + 25, by + 20, bw - 50, bh - 60, 50); ctx.clip();
    box(bx + 25, by + 20, bw - 50, bh - 60, 0, "#e3e9ed");
    const wy = by + 20 + (bh - 60) * (1 - fuell);
    ctx.fillStyle = lgrad(0, wy, 0, by + bh, [[0, "#6cc0ee"], [1, "#2f8cc8"]]);
    ctx.beginPath(); ctx.moveTo(bx, by + bh); for (let x = bx; x <= bx + bw; x += 20) ctx.lineTo(x, wy + Math.sin(x * 0.03 + t * 4) * 5); ctx.lineTo(bx + bw, by + bh); ctx.fill();
    ctx.restore();
    box(bx - 10, by - 10, bw + 20, 40, 20, "#e6eaee");
    box(bx + 60, by + bh - 20, 50, 60, 10, "#c5ccd2"); box(bx + bw - 110, by + bh - 20, 50, 60, 10, "#c5ccd2");
    // Hahn
    box(bx + bw - 120, by - 150, 24, 150, 10, "#a9b1b8"); box(bx + bw - 190, by - 160, 100, 26, 12, "#a9b1b8"); box(bx + bw - 200, by - 150, 30, 40, 8, "#a9b1b8");
    const hahn = s.hahn ?? (f1 > f0 ? "an" : "aus");
    if (hahn === "an") { ctx.fillStyle = lgrad(0, by - 110, 0, wy, [[0, "rgba(140,205,245,0.95)"], [1, "rgba(140,205,245,0.6)"]]); ctx.fillRect(bx + bw - 195, by - 110, 18, wy - by + 110); A.laermWellen(bx + bw - 186, wy, t * 1.5, 0.25, "#d8f0ff"); }
    if (hahn === "tropft") { const y = by - 105 + ((t * 300) % (wy - by + 100)); ellipse(bx + bw - 186, y, 9, 13, "#7cc4f0"); }
    if (s.objekt) A.objekt(s.objekt, s.objekt_x ?? 900, s.objekt_y ?? 1560, s.objekt_s ?? 0.5, t);
    if ((s.figuren || []).length) A.figurenZeigen(s, t, 1580, 0.9, s.figuren.length === 1 ? [760] : undefined);
    if (s.anzeige !== false && f1 !== f0) {
      const liter = Math.round(fuell * (s.liter ?? 150));
      box(bx + bw / 2 - 150, 860, 300, 110, 22, "rgba(20,30,40,0.75)"); A.text(`${liter} LITER`, bx + bw / 2, 917, 56, "#7fd0ff");
    }
    A._dunkel = s.licht === "aus" ? 0.5 : s.licht === "kerze" ? 0.55 : 0.05;
    if (s.licht === "kerze") A.objekt("kerze", 320, 1050, 0.35, t);
  };

  // =====================================================================
  // TREPPENHAUS – Brandschutztür, Etagennummer, Barrikade
  // =====================================================================
  SZ.treppenhaus = (s, t, p) => {
    ctx.fillStyle = lgrad(0, 0, 0, 1700, [[0, "#b9bdc0"], [1, "#8d9296"]]); ctx.fillRect(-1500, -1500, 4080, 3500);
    box(-1500, 1100, 4080, 22, 0, "#7c8287");
    // Etagennummer
    A.text(String(s.etage ?? 24), 940, 860, 230, rgba("#c0392b", 0.85));
    box(840, 990, 200, 18, 6, rgba("#c0392b", 0.85));
    // Tür
    const wack = s.klopfen ? Math.sin(t * 38) * 4 * (Math.sin(t * 2.3) > 0 ? 1 : 0.15) : 0;
    ctx.save(); ctx.translate(wack, 0);
    box(400, 640, 400, 820, 8, "#5d6b74"); box(420, 660, 360, 790, 6, "#6d7b85"); ctx.beginPath(); ctx.rect(420, 660, 360, 790); A.schattiere(420, 780, 0.25);
    box(540, 740, 120, 170, 8, "#2b3036");
    if (s.zombies) {
      ctx.save(); A.rr(540, 740, 120, 170, 8); ctx.clip();
      A.kopf(600 + Math.sin(t * 1.4) * 20, 840, 62, A.zombieFigur(3), { t, ausdruck: "zombie" });
      A.kopf(560 + Math.sin(t * 1.1 + 1) * 10, 900, 55, A.zombieFigur(5), { t: t + 2, ausdruck: "zombie" });
      ctx.restore();
    }
    box(540, 740, 120, 170, 8, "rgba(170,200,220,0.18)"); line(548, 760, 590, 810, 6, "rgba(255,255,255,0.25)");
    box(430, 1030, 340, 28, 10, "#3c4248"); box(700, 1000, 60, 20, 6, "#2d3238");
    ctx.restore();
    if (s.klopfen) { A.laermWellen(600, 900, t * 1.3, 0.8); }
    // Notausgang-Schild
    ctx.save(); ctx.translate(-330, -10); box(850, 560, 160, 80, 8, "#1f9c5a"); circle(895, 585, 9, "#fff"); line(895, 595, 890, 615, 8, "#fff"); line(890, 615, 905, 632, 6, "#fff"); line(890, 615, 878, 630, 6, "#fff"); line(893, 600, 910, 595, 6, "#fff"); poly([[940, 600], [990, 600], [970, 585]], "#fff"); box(940, 597, 40, 6, 2, "#fff");
    A.licht(930, 600, 420, "#3cff9a", 0.7); ctx.restore();
    // Treppe nach unten rechts
    for (let k = 0; k < 10; k++) box(820 + k * 50, 1460 + k * 38, 600, 40, 3, shade("#8a9095", -k * 0.03));
    line(820, 1300, 1400, 1700, 10, "#c0392b"); for (let k = 0; k < 6; k++) line(840 + k * 90, 1312 + k * 62, 840 + k * 90, 1460 + k * 62, 6, "#555b62");
    box(-1500, 1460, 2320, 900, 0, "#7a8085");
    // Barrikade
    if (s.barrikade) {
      const g = s.barrikade === "baut" ? E.raus(clamp(p * 1.3, 0, 1)) : 1;
      const teile = [[380, 1300, 260, 160, "#6d5a48"], [620, 1320, 220, 140, "#5f6f7f"], [420, 1180, 180, 130, "#b5824e"], [560, 1150, 260, 70, "#8a6a4a"], [300, 1380, 140, 80, "#7b5e4a"], [700, 1220, 120, 110, "#9a8f7a"]];
      teile.forEach(([x, y, w, h, c], i) => { if (i / teile.length <= g + 0.01) { const dy = (1 - clamp(g * teile.length - i, 0, 1)) * -300; box(x, y + dy, w, h, 10, c); ctx.beginPath(); ctx.rect(x, y + dy, w, h); A.schattiere(x, x + w, 0.2); } });
    }
    A.figurenZeigen(s, t, 1600, (s.figuren || []).length > 1 ? 0.9 : 1.1, (s.figuren || []).length === 1 ? [260] : undefined);
    A._dunkel = s.licht === "an" ? 0.05 : 0.5;
  };

  // =====================================================================
  // STRASSE – Läden, Autos, Zombies, Lärm lockt sie an
  // =====================================================================
  SZ.strasse = (s, t) => {
    const zeit = zeitVon(s);
    A.himmelMalen(zeit, -3000, -3000, 9000, 6000, -200, 900);
    if (zeit === "nacht") sterne(t, 500);
    const hc = HIMMEL[zeit] || HIMMEL.tag;
    stadt(41, 700, 300, 700, mix(hc[1], "#2a2f45", 0.5), zeit, t, 0.05);
    if (s.rauch !== false) rauch([[100, 700, 1.1], [900, 650, 0.9]], t);
    // Ladenzeile
    const laeden = s.laeden || ["apotheke", "supermarkt", "baeckerei"];
    laeden.forEach((l, i) => {
      const x = 12 + i * 356, bw = 344, c = ["#c9b79c", "#b6c1c9", "#d0b0a0", "#b9c4ad"][i % 4];
      box(x, 520, bw, 760, 0, c); ctx.beginPath(); ctx.rect(x, 520, bw, 760); A.schattiere(x, x + bw, 0.18);
      for (let r2 = 0; r2 < 3; r2++) for (let k = 0; k < 2; k++) box(x + 40 + k * 150, 560 + r2 * 120, 110, 80, 4, zeit === "nacht" ? "#1d2232" : rgba("#cfe0ee", 0.7));
      box(x + 14, 940, bw - 28, 76, 10, l === "apotheke" ? "#2e9d5a" : l === "supermarkt" ? "#d24b3e" : "#7a5a3a");
      A.text(l.toUpperCase(), x + bw / 2, 980, 42, "#fff", "center", 900, "Titel", bw - 60);
      if (l === "apotheke") A.objekt("kreuz", x + bw - 40, 890, 0.2, t);
      box(x + 30, 1040, bw - 60, 240, 6, "#2b3036"); box(x + 40, 1050, bw - 80, 220, 4, zeit === "nacht" ? "#14171d" : rgba("#9fb8c8", 0.5));
      if (s.kaputt !== false && i % 2 === 0) poly([[x + 80, 1050], [x + 150, 1150], [x + 120, 1270], [x + 210, 1160], [x + 240, 1050]], "#1a1d22");
    });
    // Gehweg + Straße
    box(-3000, 1280, 9000, 90, 0, "#a5a8ad"); box(-3000, 1370, 9000, 700, 0, "#4d5159");
    for (let k = -10; k < 30; k++) box(k * 200 - 60, 1640, 110, 14, 4, "#d7d08a");
    // Autos
    const auto = (x, y, c, sp = 1, tuer = false) => {
      ctx.save(); ctx.translate(x, y); ctx.scale(sp, 1);
      box(-170, -60, 340, 90, 30, c); box(-110, -125, 220, 80, 30, shade(c, -0.08)); box(-95, -112, 90, 58, 12, "#9cc0d8"); box(10, -112, 85, 58, 12, "#9cc0d8");
      circle(-100, 30, 36, "#222"); circle(100, 30, 36, "#222"); circle(-100, 30, 15, "#888"); circle(100, 30, 15, "#888");
      if (tuer) poly([[10, -115], [95, -115], [150, -170], [60, -175]], shade(c, -0.15));
      ctx.restore();
    };
    auto(250, 1480, "#b5452f"); auto(860, 1560, "#3d6c99", -1, true);
    if (s.alarm) { const an = Math.sin(t * 9) > 0; circle(140, 1440, 14, an ? "#ffcf3d" : "#6b5a20"); if (an) A.licht(140, 1440, 200, "#ffcf3d", 1); A.laermWellen(250, 1430, t, 1); }
    // Müll
    const r = rnd(2); for (let i = 0; i < 14; i++) box(-200 + r() * 1500, 1380 + r() * 600, 20 + r() * 40, 10 + r() * 14, 4, rgba("#e8e2d4", 0.5));
    // Zombies
    const lx = s.laerm_x;
    A.horde({ n: s.horde ?? 7, x0: -150, x1: 1230, y: 1470, tiefe: 380, skala: 0.62, seed: 7, tempo: 26, ziel: lx }, t);
    if (lx != null && !s.alarm) A.laermWellen(lx, s.laerm_y ?? 1450, t, 1.2);
    if ((s.figuren || []).length) A.figurenZeigen(s, t, 1900, 0.62, s.figuren.map((_, i) => (s.figur_x ?? 170) + i * 150));
    if (s.regen) regen(t);
    A._dunkel = zeit === "nacht" ? 0.55 : zeit === "abend" ? 0.25 : 0;
  };

  // =====================================================================
  // DACH – Wassertank, Regentonnen, Plane, SOS, Hubschrauber
  // =====================================================================
  SZ.dach = (s, t) => {
    const zeit = zeitVon(s);
    A.himmelMalen(zeit, -3000, -3000, 9000, 6000, -300, 1100);
    if (zeit === "nacht") sterne(t, 800);
    sonneMond(zeit, 860, 300);
    const hc = HIMMEL[zeit] || HIMMEL.tag;
    stadt(55, 1150, 80, 420, mix(hc[1], "#2a2f45", 0.42), zeit, t, 0.05);
    if (s.rauch !== false) rauch([[60, 1000, 0.8], [1000, 1040, 0.6]], t);
    // Dachfläche
    box(-3000, 1150, 9000, 1500, 0, "#8a8e93"); box(-3000, 1150, 9000, 40, 0, "#6d7176");
    for (let k = -10; k < 30; k++) line(k * 180, 1190, k * 180 - 120, 2600, 3, rgba("#000", 0.06));
    // Tank
    const tx = 40, ty = 820;
    box(tx + 30, 1180, 20, 80, 4, "#5d6268"); box(tx + 300, 1180, 20, 80, 4, "#5d6268");
    box(tx, ty, 360, 380, 40, "#a3abb3"); ctx.beginPath(); ctx.rect(tx, ty, 360, 380); A.schattiere(tx, tx + 360, 0.3);
    for (let k = 1; k < 4; k++) box(tx, ty + k * 95, 360, 8, 2, "#8d959d");
    const fs = clamp(s.tank ?? 0.6, 0, 1);
    box(tx + 290, ty + 40, 34, 300, 8, "#5d646b"); box(tx + 290, ty + 40 + 300 * (1 - fs), 34, 300 * fs, 8, "#4aa8e0");
    box(tx + 340, ty + 60, 14, 380, 4, "#6d747b"); for (let k = 0; k < 9; k++) box(tx + 326, ty + 80 + k * 40, 40, 6, 2, "#6d747b");
    // Regentonnen + Plane
    if (s.tonnen !== false) {
      for (let i = 0; i < 3; i++) { const x = 640 + i * 130; box(x, 1230, 110, 160, 16, "#3d6c99"); ellipse(x + 55, 1230, 55, 14, "#2f5a82"); ellipse(x + 55, 1230, 46, 10, "#4aa8e0"); }
      poly([[600, 1060], [1060, 1080], [1000, 1180], [780, 1225], [620, 1170]], "#3d7fb8");
      for (const [x, y] of [[600, 1060], [1060, 1080]]) line(x, y, x, y + 200, 5, "#555");
    }
    if (s.sos) {
      const g = s.sos === "malt" ? clamp(t / 4, 0, 1) : 1;
      ctx.save(); ctx.translate(540, 1420); ctx.transform(1, 0, -0.3, 0.42, 0, 0);
      ctx.beginPath(); ctx.rect(-420, -300, 840 * g, 600); ctx.clip();
      ctx.globalAlpha = 0.9; A.text("SOS", 0, 0, 330, "#f2f2ea"); ctx.restore();
    }
    if (s.signal) { const r = rnd(3); for (let i = 0; i < 16; i++) { const w = ((t * 0.15 + i / 16) % 1); circle(900 + Math.sin(w * 5 + i) * 40 + w * 120, 1300 - w * 1100, 30 + w * 120, rgba(s.signal === "rot" ? "#e0533d" : "#e9e2d0", 0.5 * (1 - w))); } ellipse(900, 1310, 40, 16, "#ff6b3d"); A.licht(900, 1290, 300, "#ff6b3d", 1.2); }
    if (s.heli) { const hx = s.heli === "kommt" ? lerp(1500, 600, E.raus(clamp(t / 5, 0, 1))) : lerp(-300, 1400, (t * 0.07) % 1); heli(hx, 380, 1.1, t, zeit); }
    A.figurenZeigen(s, t, 1640, (s.figuren || []).length > 2 ? 0.85 : 1.0);
    if (s.objekt) A.objekt(s.objekt, s.objekt_x ?? 540, s.objekt_y ?? 1500, s.objekt_s ?? 0.5, t);
    if (s.regen) regen(t, 180);
    A._dunkel = zeit === "nacht" ? 0.55 : zeit === "abend" ? 0.2 : s.regen ? 0.2 : 0;
  };

  // =====================================================================
  // OBJEKT – Infokarte mit Gegenständen + Werten
  // =====================================================================
  SZ.objekt = (s, t) => {
    const c = s.farbe || "#24364a";
    ctx.fillStyle = rgrad(540, 900, 50, 1300, [[0, shade(c, 0.12)], [1, shade(c, -0.45)]]); ctx.fillRect(-2000, -2000, 5000, 6000);
    const r = rnd(5); for (let i = 0; i < 26; i++) circle(r() * W, r() * H, 2 + r() * 4, rgba("#ffffff", 0.06 + 0.06 * Math.sin(t + i)));
    const items = s.objekte || [];
    const n = items.length;
    const pos = n === 1 ? [[540, 860]] : n === 2 ? [[300, 860], [780, 860]] : n === 3 ? [[540, 640], [280, 1080], [800, 1080]] : items.map((_, i) => [270 + (i % 2) * 540, 560 + Math.floor(i / 2) * 470]);
    const gr = n === 1 ? 1.5 : n === 2 ? 1.05 : n === 3 ? 0.95 : 0.8;
    items.forEach((it, i) => {
      const [name, label] = it.split(":");
      const ein = E.pop(clamp((t - 0.15 - i * 0.35) / 0.4, 0, 1));
      if (ein <= 0) return;
      const [x, y] = pos[i];
      ctx.save(); ctx.translate(x, y + Math.sin(t * 1.8 + i) * 6); ctx.scale(ein, ein);
      circle(0, 0, 180 * gr, rgba("#ffffff", 0.08));
      A.objekt(name, 0, -10, gr, t);
      if (label) {
        ctx.font = `900 ${Math.round(52 * Math.max(gr, 0.85))}px Titel`;
        const tw = ctx.measureText(label.toUpperCase()).width;
        box(-tw / 2 - 26, 175 * gr, tw + 52, 80 * Math.max(gr, 0.85), 18, "rgba(15,20,28,0.7)");
        A.text(label.toUpperCase(), 0, 175 * gr + 40 * Math.max(gr, 0.85), Math.round(52 * Math.max(gr, 0.85)), s.label_farbe || "#ffcf3d");
      }
      if (s.durchgestrichen && s.durchgestrichen.includes(name)) { line(-150 * gr, -150 * gr, 150 * gr, 150 * gr, 26, "#e0533d"); line(150 * gr, -150 * gr, -150 * gr, 150 * gr, 26, "#e0533d"); }
      ctx.restore();
    });
    if (s.gross) { const ein = E.raus(clamp(t / 0.4, 0, 1)); ctx.save(); ctx.globalAlpha = ein; A.text(s.gross.toUpperCase(), 540, 330 + (1 - ein) * -40, s.groesse || 96, s.textfarbe || "#ffffff", "center", 900, "Titel", 960); ctx.restore(); }
    A._dunkel = 0;
  };

  // =====================================================================
  // KARTE – Stadtplan von oben, Route, Horden
  // =====================================================================
  const ORTE = { haus: [540, 1050], apotheke: [800, 820], supermarkt: [300, 700], stadion: [820, 300], krankenhaus: [250, 360], bruecke: [600, 560], polizei: [300, 1350], park: [820, 1400] };
  SZ.karte = (s, t, p) => {
    box(-2000, -2000, 5000, 6000, 0, "#e8e1d0");
    // Fluss
    ctx.beginPath(); ctx.moveTo(-200, 480); ctx.bezierCurveTo(300, 420, 700, 700, 1300, 520); ctx.lineWidth = 90; ctx.strokeStyle = "#8cc3e6"; ctx.stroke();
    // Blöcke
    const r = rnd(8);
    for (let gx = -1; gx < 7; gx++) for (let gy = 0; gy < 10; gy++) {
      const x = gx * 170 + 20, y = gy * 170 + 80;
      if (Math.abs(y + 60 - (480 + (x - 300) * 0.15)) < 90) continue;
      box(x, y, 130, 130, 10, r() < 0.12 ? "#b9d39b" : shade("#d2c8b4", -r() * 0.08));
    }
    box(720, 1300, 240, 240, 30, "#a9cc8a");
    // Route
    if (s.route) {
      const pts = s.route.split(">").map(n => ORTE[n.trim()]).filter(Boolean);
      if (pts.length > 1) {
        const pfad = [pts[0]];
        for (let i = 1; i < pts.length; i++) { const [ax, ay] = pfad[pfad.length - 1], [bx, by] = pts[i]; pfad.push([ax, by]); pfad.push([bx, by]); }
        let len = 0; const seg = []; for (let i = 1; i < pfad.length; i++) { const l = Math.hypot(pfad[i][0] - pfad[i - 1][0], pfad[i][1] - pfad[i - 1][1]); seg.push(l); len += l; }
        const g = E.sanft(clamp(p * 1.4, 0, 1)) * len;
        ctx.beginPath(); ctx.moveTo(...pfad[0]); let acc = 0, ende = pfad[0];
        for (let i = 1; i < pfad.length; i++) { if (acc + seg[i - 1] <= g) { ctx.lineTo(...pfad[i]); ende = pfad[i]; acc += seg[i - 1]; } else { const q = (g - acc) / seg[i - 1]; ende = [lerp(pfad[i - 1][0], pfad[i][0], q), lerp(pfad[i - 1][1], pfad[i][1], q)]; ctx.lineTo(...ende); break; } }
        ctx.setLineDash([28, 22]); ctx.lineDashOffset = -t * 40; ctx.lineWidth = 16; ctx.strokeStyle = "#e0533d"; ctx.lineCap = "round"; ctx.stroke(); ctx.setLineDash([]);
        circle(ende[0], ende[1], 20, "#e0533d"); circle(ende[0], ende[1], 9, "#fff");
      }
    }
    // Horden
    for (const h of (s.horden || [])) {
      const [x, y] = ORTE[h] || h.split(",").map(Number);
      const rr2 = rnd(x + y);
      ctx.fillStyle = rgrad(x, y, 10, 170, [[0, "rgba(200,50,40,0.35)"], [1, "rgba(200,50,40,0)"]]); ctx.fillRect(x - 170, y - 170, 340, 340);
      for (let i = 0; i < 26; i++) circle(x + (rr2() - 0.5) * 220 + Math.sin(t + i) * 8, y + (rr2() - 0.5) * 220 + Math.cos(t * 0.8 + i) * 8, 9, "#b8382c");
    }
    // Orte
    for (const name of (s.orte || Object.keys(ORTE).slice(0, 5))) {
      const [x, y] = ORTE[name]; if (!x) continue;
      const puls = 1 + 0.06 * Math.sin(t * 4 + x);
      ctx.save(); ctx.translate(x, y); ctx.scale(puls, puls);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-46, -50, -46, -110, 0, -112); ctx.bezierCurveTo(46, -110, 46, -50, 0, 0); fill(name === "haus" ? "#2f6fb5" : name === "apotheke" ? "#2e9d5a" : "#3b3f45");
      circle(0, -72, 20, "#fff"); ctx.restore();
      const label = { haus: "UNSER HOCHHAUS", apotheke: "APOTHEKE", supermarkt: "SUPERMARKT", stadion: "STADION", krankenhaus: "KRANKENHAUS", bruecke: "BRÜCKE", polizei: "POLIZEI", park: "PARK" }[name];
      ctx.font = "900 34px Titel"; const tw = ctx.measureText(label).width;
      box(x - tw / 2 - 14, y + 10, tw + 28, 48, 10, "rgba(25,28,34,0.82)"); A.text(label, x, y + 35, 34, "#fff");
    }
    A._dunkel = 0;
  };

  // =====================================================================
  // GESICHT – Nahaufnahme mit unscharfem Hintergrund
  // =====================================================================
  SZ.gesicht = (s, t) => {
    const ort = s.ort || "wohnung";
    if (!A._off) { A._off = document.createElement("canvas"); A._off.width = W; A._off.height = H; A._offctx = A._off.getContext("2d"); }
    const oc = A._offctx, m = ctx.getTransform();
    oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, W, H); oc.setTransform(m);
    const bg = { ...s, figuren: [], figur: null, objekt: null, horde: 3, laerm_x: null, zombies: s.zombies, klopfen: false };
    A.umleiten(oc, () => (SZ[ort] || SZ.wohnung)(bg, t, 0.5));
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = "blur(12px)"; ctx.drawImage(A._off, -20, -20, W + 40, H + 40); ctx.restore();
    ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(-2000, -2000, 5000, 6000);
    const f = A.fig(s.figur);
    const bob = Math.sin(t * 1.5) * 7;
    const atem = 1 + Math.sin(t * 2) * 0.006;
    ctx.save(); ctx.translate(540, 1000 + bob); ctx.scale(atem, atem);
    // Schultern
    box(-120, 120, 240, 260, 60, shade(f.haut, -0.12));
    ctx.beginPath(); ctx.moveTo(-470, 1200); ctx.bezierCurveTo(-460, 520, -360, 400, -150, 360); ctx.lineTo(150, 360); ctx.bezierCurveTo(360, 400, 460, 520, 470, 1200); ctx.closePath(); fill(f.jacke);
    ctx.beginPath(); ctx.moveTo(-470, 1200); ctx.bezierCurveTo(-460, 520, -360, 400, -150, 360); ctx.lineTo(150, 360); ctx.bezierCurveTo(360, 400, 460, 520, 470, 1200); ctx.closePath(); A.schattiere(-470, 470, 0.22);
    ctx.beginPath(); ctx.moveTo(-150, 365); ctx.quadraticCurveTo(0, 470, 150, 365); ctx.lineTo(120, 340); ctx.quadraticCurveTo(0, 420, -120, 340); ctx.closePath(); fill(shade(f.jacke, -0.12));
    if (f.rucksack) for (const sx of [-1, 1]) box(sx * 250 - 25, 420, 50, 800, 20, f.rucksack);
    A.kopf(0, -60, 330, f, { t, ausdruck: s.ausdruck, spricht: s._spricht && (s.sprecher ? s.sprecher === s.figur : true) && s.stumm !== true, blick: s.blick, drehung: s.drehung ?? Math.sin(t * 0.5) * 0.12, neigung: Math.sin(t * 0.9) * 0.025, seed: 4 });
    ctx.restore();
    if (s.licht === "taschenlampe") A.licht(700, 700, 700, "#fff4d0", 1.1);
    if (s.licht === "kerze") A.licht(800, 1500, 900, "#ffb84d", 1.2);
    const d = A._dunkel ?? 0; A._dunkel = s.dunkel ?? d * 0.75;
  };

  // =====================================================================
  // TITEL
  // =====================================================================
  SZ.titel = (s, t) => {
    ctx.fillStyle = rgrad(540, 900, 50, 1300, [[0, s.farbe || "#2a1414"], [1, "#050506"]]); ctx.fillRect(-2000, -2000, 5000, 6000);
    const r = rnd(3); for (let i = 0; i < 40; i++) { const y = (r() * H - t * 30 * (0.5 + r())) % H; circle(r() * W, (y + H) % H, 2 + r() * 3, rgba("#ffffff", 0.15)); }
    const ein = E.pop(clamp(t / 0.5, 0, 1));
    ctx.save(); ctx.translate(540, 820); ctx.scale(0.8 + 0.2 * ein, 0.8 + 0.2 * ein); ctx.globalAlpha = clamp(t / 0.25, 0, 1);
    if (s.oben) A.text(s.oben.toUpperCase(), 0, -170, 60, s.akzent || "#ffcf3d");
    const zeilen = String(s.gross || "").toUpperCase().split("|");
    zeilen.forEach((z, i) => { ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 30; A.text(z, 0, i * (s.groesse || 150) * 1.05 - (zeilen.length - 1) * (s.groesse || 150) * 0.5, s.groesse || 150, s.textfarbe || "#f4efe6", "center", 900, "Titel", 940); ctx.restore(); });
    if (s.unten) A.text(s.unten.toUpperCase(), 0, 170 + (zeilen.length - 1) * 80, 52, "rgba(255,255,255,0.7)", "center", 700, "HUD");
    ctx.restore();
    A._dunkel = 0;
  };
})();
