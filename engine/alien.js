/* Der Alien: Nox, Sammler, Schiffe, Effekte, Gegenstände und Kulissen. Wird nach engine.js geladen. */
(() => {
  const { box, circle, ellipse, poly, line, shade, rgba, lgrad, rgrad, rr, fill, mix, rnd, clamp, lerp, E, capsule, schattiere } = A;
  const W = A.W, H = A.H;
  const SZ = A.SZ;
  const GLOW = "#9dffbf"; // Augen der Sammler

  // Offscreen-Leinwände (Bildschirmgröße), einmal angelegt
  const leinwand = {};
  const off = name => {
    if (!leinwand[name]) { const c = document.createElement("canvas"); c.width = W; c.height = H; leinwand[name] = c.getContext("2d"); }
    return leinwand[name];
  };
  // Zeichnet fn in eine Offscreen-Leinwand mit der aktuellen (oder einer festen) Transformation
  const malenIn = (name, fn, m = ctx.getTransform()) => {
    const oc = off(name);
    oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, W, H); oc.setTransform(m); oc.filter = "none"; oc.globalAlpha = 1; oc.globalCompositeOperation = "source-over";
    A.umleiten(oc, fn);
    return oc.canvas;
  };

  // =====================================================================
  // NOX – Füße bei (x,y). Einheiten wie bei Menschen (Mensch ≈ 640 hoch), dann × f.groesse
  // =====================================================================
  const NOX = { koerper: "#22356f", bauch: "#304c96", haftballen: "#5a7fd0", augen: "#eaf6ff", pupillen: "#0e1a33", leuchten: "#8fdcff" };
  const MIENE = {
    neutral: { ohr: 0, lid: 0, pup: 1, mund: "klein" },
    neugierig: { ohr: 1, lid: 0, pup: 1.15, mund: "o" },
    froh: { ohr: 0.8, lid: 0, pup: 1.05, mund: "lacht" },
    traurig: { ohr: -1, lid: 0.35, pup: 0.95, mund: "traurig", lidKipp: 0.3, blick: [0, 0.5] },
    angst: { ohr: -0.7, lid: 0, pup: 0.7, mund: "zittert", gross: 1.08 },
    schreck: { ohr: 0.4, lid: 0, pup: 0.55, mund: "auf", gross: 1.15 },
    stur: { ohr: 0, lid: 0.45, pup: 1, mund: "flach", lidKipp: -0.2 },
    muede: { ohr: -0.5, lid: 0.55, pup: 1, mund: "klein" },
    entschlossen: { ohr: 0.3, lid: 0.25, pup: 1, mund: "flach", lidKipp: -0.25 },
    besorgt: { ohr: -0.4, lid: 0.12, pup: 0.9, mund: "traurig", lidKipp: 0.2 },
    misstrauisch: { ohr: 0, lid: 0.4, pup: 0.9, mund: "flach", lidKipp: -0.1 },
    wuetend: { ohr: 0.2, lid: 0.3, pup: 0.9, mund: "flach", lidKipp: -0.35 },
    angewidert: { ohr: -0.3, lid: 0.6, pup: 0.9, mund: "zittert", lidKipp: 0.15 },
  };
  // Augenleuchten: true/Zahl = dauerhaft, "blitz" = kurzes Aufblitzen nach ca. 1 s
  A.augenWert = (s, t) => { const v = s.augenleuchten; if (!v) return 0; if (v === "blitz") return clamp(1 - Math.abs(t - 1.3) / 0.45, 0, 1); return v === true ? 1 : Number(v) || 0; };

  function eiPfad(w, top, bot) {
    const h = bot - top, mid = top + h * 0.62;
    ctx.beginPath(); ctx.moveTo(0, top);
    ctx.bezierCurveTo(w * 0.7, top, w, top + h * 0.3, w, mid);
    ctx.bezierCurveTo(w, bot - h * 0.06, w * 0.55, bot, 0, bot);
    ctx.bezierCurveTo(-w * 0.55, bot, -w, bot - h * 0.06, -w, mid);
    ctx.bezierCurveTo(-w, top + h * 0.3, -w * 0.7, top, 0, top);
    ctx.closePath();
  }

  function noxPose(name, t, ph) {
    const sw = Math.sin(t * 1.8 + ph) * 6;
    const P = { hl: [-215, -215 + sw], hr: [215, -215 - sw], dy: 0, sy: 1, kipp: Math.sin(t * 1.1 + ph) * 0.02, gehen: 0, sitzen: false, fuss: null };
    switch (name) {
      case "winkt": P.hr = [250 + Math.sin(t * 10) * 40, -520]; break;
      case "zeigt": P.hr = [330, -360]; break;
      case "zeigt_hoch": P.hr = [170, -640]; break;
      case "haende_hoch": P.hl = [-200, -600]; P.hr = [200, -600]; break;
      case "zeigt_haende": P.hl = [-120, -430]; P.hr = [120, -430]; break;
      case "angst": P.hl = [-80, -360]; P.hr = [80, -360]; P.sy = 0.96; break;
      case "psst": P.hr = [30, -270]; break;
      case "denkt": P.hr = [60, -290]; break;
      case "duckt": P.hl = [-110, -520]; P.hr = [110, -520]; P.sy = 0.82; break;
      case "klettert": P.hl = [-170, -660 + Math.sin(t * 3) * 20]; P.hr = [180, -560 - Math.sin(t * 3) * 20]; P.kipp = Math.sin(t * 1.5) * 0.04; P.fuss = [[-110, -40 - Math.max(0, Math.sin(t * 3)) * 40], [110, -30 - Math.max(0, -Math.sin(t * 3)) * 40]]; break;
      case "rutscht": P.hl = [-170, -660]; P.hr = [300, -200 + Math.sin(t * 9) * 25]; P.kipp = 0.12 + Math.sin(t * 7) * 0.03; P.fuss = [[-120, -20], [140, 30 + Math.sin(t * 8) * 20]]; break;
      case "haelt": P.hl = [-80, -195]; P.hr = [80, -195]; break;
      case "fuchtelt": P.hl = [-215, -215]; P.hr = [250 + Math.sin(t * 9) * 30, -380 + Math.sin(t * 9) * 110]; P.einhand = true; break;
      case "haelt_hoch": P.hl = [-70, -600]; P.hr = [70, -600]; break;
      case "verschraenkt": P.hl = [70, -300]; P.hr = [-70, -275]; P.verschr = true; break;
      case "umarmt": P.hl = [-130, -330]; P.hr = [130, -330]; P.kipp = 0.04; break;
      case "springt": { const j = Math.abs(Math.sin(t * 4)); P.dy = -j * 140; P.hl = [-230, -520]; P.hr = [230, -520]; break; }
      case "sitzt": P.sitzen = true; P.hl = [-200, -150]; P.hr = [200, -150]; break;
      case "geht": case "rennt": P.gehen = name === "rennt" ? 2 : 1; break;
    }
    return P;
  }

  A.nox = (x, y, s, f, o = {}) => {
    f = Object.assign({}, NOX, f || {});
    const t = o.t || 0, ph = o.phase ?? x * 0.01;
    const M = Object.assign({}, MIENE.neutral, MIENE[o.ausdruck] || {});
    const P = noxPose(o.pose || "steht", t, ph);
    const le = clamp(o.leuchten || 0, 0, 1) * (0.85 + 0.15 * Math.sin(t * 6));
    ctx.save(); ctx.translate(x, y); const g = s * (f.groesse ?? 0.33); ctx.scale(o.spiegeln ? -g : g, g);
    // Gehen: Watscheln
    let fl = [-95, 0], frr = [95, 0], lift = [0, 0], bob = Math.sin(t * 2.3 + ph) * 5;
    if (P.gehen) {
      const w = t * (P.gehen === 2 ? 13 : 8) + ph;
      lift = [Math.max(0, Math.sin(w)) * 34, Math.max(0, -Math.sin(w)) * 34];
      bob = -Math.abs(Math.sin(w)) * 18; P.kipp = Math.sin(w) * 0.07;
      P.hl = [-225, -230 - Math.sin(w) * 40]; P.hr = [225, -230 + Math.sin(w) * 40];
    }
    if (P.fuss) { fl = [P.fuss[0][0], P.fuss[0][1]]; frr = [P.fuss[1][0], P.fuss[1][1]]; }
    ellipse(0, -4, 170, 26, rgba(A.SCHATTEN, P.sitzen ? 0 : 0.22));
    if (le > 0) { ctx.fillStyle = rgrad(0, -300, 40, 560, [[0, rgba(f.leuchten, 0.55 * le)], [1, rgba(f.leuchten, 0)]]); ctx.fillRect(-560, -860, 1120, 1120); A.licht(0, -300, 700, f.leuchten, 1.5 * le); }
    const koerper = mix(f.koerper, "#5aa8ff", 0.35 * le), bauch = mix(f.bauch, f.leuchten, 0.45 * le);
    // Beine
    if (P.sitzen) {
      const sw2 = Math.sin(t * 2.2 + ph) * 12;
      for (const sd of [-1, 1]) { capsule(sd * 70, -60, sd * 85, 70 + sd * sw2, 36, 30); fill(shade(koerper, -0.08)); ellipse(sd * 92, 90 + sd * sw2, 50, 26, shade(koerper, -0.12)); }
    } else {
      for (const [i, sd] of [[0, -1], [1, 1]]) {
        const ft = i ? frr : fl, l = lift[i];
        capsule(sd * 72, -80 + bob * 0.4, ft[0], -30 - l, 38, 32); fill(shade(koerper, -0.06));
        ellipse(ft[0], -22 - l, 58, 28, shade(koerper, -0.12));
        for (const k of [-1, 0, 1]) circle(ft[0] + k * 30, -8 - l, 10, rgba(f.haftballen, 0.9));
      }
    }
    ctx.translate(0, P.dy + bob + (P.sitzen ? 30 : 0)); ctx.rotate(P.kipp);
    if (P.sy !== 1) { ctx.translate(0, -40); ctx.scale(1, P.sy); ctx.translate(0, 40); }
    // Ohrlappen (hinter dem Körper)
    const oh = clamp(M.ohr + (o.ohren || 0), -1, 1);
    for (const sd of [-1, 1]) {
      const ox = sd * (205 + oh * 18), oy = -420 - oh * 70, rot = sd * (0.5 + oh * 0.45) + (oh < 0 ? sd * 0.5 : 0);
      ctx.save(); ctx.translate(ox, oy); ctx.rotate(rot);
      ellipse(0, 0, 40, 62, shade(koerper, -0.05)); ellipse(0, 6, 22, 40, rgba(bauch, 0.9));
      ctx.restore();
    }
    // Körper
    eiPfad(195, -575, -40); fill(koerper);
    ctx.save(); eiPfad(195, -575, -40); ctx.clip();
    ellipse(-10, -285, 135, 210, bauch);
    ctx.restore();
    eiPfad(195, -575, -40); schattiere(-195, 195, 0.28);
    ellipse(-70, -500, 60, 26, rgba("#ffffff", 0.14 + 0.2 * le), -0.5);
    // Augen
    const blink = (() => { const per = 3.6 + (ph % 1.3), q = (t + ph) % per; return q < 0.14 ? 0.1 + 0.9 * Math.abs(Math.cos(q / 0.14 * Math.PI)) : 1; })();
    const gr = M.gross || 1;
    const bl = Array.isArray(o.blick) ? o.blick : M.blick || [0, 0];
    for (const sd of [-1, 1]) {
      const ex = sd * 74, ey = -395, rx = 62 * gr, ry = 80 * gr * blink;
      ellipse(ex, ey, rx, ry, f.augen);
      if (blink > 0.3) {
        ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2); ctx.clip();
        const pr = 34 * M.pup, px = ex + bl[0] * 18, py = ey + bl[1] * 20 + 6;
        circle(px, py, pr, f.pupillen);
        circle(px - pr * 0.38, py - pr * 0.45, pr * 0.38, "#ffffff"); circle(px + pr * 0.35, py + pr * 0.4, pr * 0.15, rgba("#ffffff", 0.8));
        // Oberlid
        if (M.lid > 0) { ctx.save(); ctx.translate(ex, ey - ry); ctx.rotate(sd * (M.lidKipp || 0)); box(-rx * 1.4, -ry, rx * 2.8, ry + ry * 1.6 * M.lid, 0, koerper); ctx.restore(); }
        ctx.restore();
      }
    }
    // Mund
    const my = -268, sp = o.spricht ? 0.3 + 0.7 * Math.abs(Math.sin(t * 15) * Math.sin(t * 5.7 + 1)) : 0;
    const mundc = "#0f1730";
    if (sp > 0) ellipse(0, my + 4, 22 + 6 * sp, 6 + 22 * sp, mundc);
    else if (M.mund === "auf") ellipse(0, my + 8, 24, 32, mundc);
    else if (M.mund === "o") ellipse(0, my + 2, 13, 15, mundc);
    else if (M.mund === "zittert") { ctx.beginPath(); ctx.moveTo(-26, my); for (let i = 0; i <= 6; i++) ctx.lineTo(-26 + i * 8.7, my + (i % 2 ? -6 : 6) + Math.sin(t * 20) * 2); ctx.lineWidth = 9; ctx.strokeStyle = mundc; ctx.lineCap = "round"; ctx.stroke(); }
    else if (M.mund === "lacht") { ctx.beginPath(); ctx.moveTo(-34, my - 6); ctx.quadraticCurveTo(0, my + 40, 34, my - 6); ctx.closePath(); fill(mundc); ellipse(0, my + 16, 14, 7, "#d86b84"); }
    else { const k = M.mund === "traurig" ? -12 : M.mund === "flach" ? 0 : 10; ctx.beginPath(); ctx.moveTo(-24, my); ctx.quadraticCurveTo(0, my + k, 24, my); ctx.lineWidth = 9; ctx.strokeStyle = mundc; ctx.lineCap = "round"; ctx.stroke(); }
    // Hände (Armlänge begrenzt), Gehaltenes zwischen bzw. in der Hand
    const haende = [P.hl, P.hr].map(([tx, ty], i) => { const sx = (i ? 1 : -1) * 160, sy = -300, d = Math.hypot(tx - sx, ty - sy), k = Math.min(1, 210 / Math.max(d, 1)); return [sx + (tx - sx) * k, sy + (ty - sy) * k]; });
    const ziel = P.verschr ? null : o.halt;
    if (ziel) {
      const [gx, gy] = P.einhand ? [haende[1][0], haende[1][1] - 40] : [(haende[0][0] + haende[1][0]) / 2, (haende[0][1] + haende[1][1]) / 2 - 30];
      ctx.save(); ctx.translate(gx, gy); if (P.einhand) ctx.rotate(0.5 + Math.sin(t * 9) * 0.3); A.objekt(ziel, 0, 0, 0.66, t); ctx.restore();
      A._haltPos = ctx.getTransform().transformPoint(new DOMPoint(gx, gy));
    }
    // Arme
    for (const [i, sd] of [[0, -1], [1, 1]]) {
      const sx = sd * 160, sy = -300, [hx, hy] = haende[i];
      capsule(sx, sy, hx, hy, 40, 32); fill(shade(koerper, i ? -0.1 : -0.03));
      circle(hx, hy, 34, shade(koerper, 0.02));
      for (const a of [-0.7, 0, 0.7]) { const ang = Math.atan2(hy - sy, hx - sx) + a; circle(hx + Math.cos(ang) * 30, hy + Math.sin(ang) * 30, 13, f.haftballen); }
    }
    ctx.restore();
  };

  // Kleine Silhouette von Nox' Leuten (im Lichtkegel)
  A.noxLeute = (x, y, s, t, a = 0.7) => {
    ctx.save(); ctx.globalAlpha = a;
    A.nox(x, y, s, { koerper: "#3b5bb0", bauch: "#5b7bd0", groesse: 0.42 }, { t, pose: "steht", ausdruck: "neutral", phase: x });
    ctx.restore();
  };

  // =====================================================================
  // SAMMLER – wahre Gestalt, Füße bei (x,y)
  // =====================================================================
  A.sammler = (x, y, s, o = {}) => {
    const t = o.t || 0, c = "#2a2d33", hell = "#454a53";
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ellipse(0, -4, 90, 16, rgba(A.SCHATTEN, 0.25));
    for (const sd of [-1, 1]) { capsule(sd * 24, -320, sd * 34, -10, 15, 11); fill(c); }
    ctx.beginPath(); ctx.moveTo(-62, -610); ctx.bezierCurveTo(-70, -480, -30, -380, -40, -300); ctx.lineTo(40, -300); ctx.bezierCurveTo(30, -380, 70, -480, 62, -610); ctx.quadraticCurveTo(0, -640, -62, -610); ctx.closePath(); fill(c);
    ctx.beginPath(); ctx.moveTo(-62, -610); ctx.bezierCurveTo(-70, -480, -30, -380, -40, -300); ctx.lineTo(40, -300); ctx.bezierCurveTo(30, -380, 70, -480, 62, -610); ctx.closePath();
    ctx.save(); ctx.clip(); ctx.fillStyle = lgrad(-70, 0, 70, 0, [[0, rgba(hell, 0.9)], [0.3, rgba(hell, 0)], [1, rgba("#000000", 0.2)]]); ctx.fillRect(-80, -660, 160, 380); ctx.restore();
    box(-10, -660, 20, 60, 8, c);
    for (const sd of [-1, 1]) {
      const sw = Math.sin(t * 1.3 + sd) * 8;
      capsule(sd * 58, -590, sd * 82, -420 + sw * 0.5, 13, 10); fill(c);
      capsule(sd * 82, -420 + sw * 0.5, sd * 92, -240 + sw, 10, 8); fill(c);
      capsule(sd * 92, -240 + sw, sd * 104, -150 + sw, 6, 4); fill(c);
      capsule(sd * 92, -240 + sw, sd * 80, -158 + sw, 6, 4); fill(c);
    }
    ctx.save(); ctx.translate(0, -735); ctx.rotate(o.neigung ?? Math.sin(t * 0.7) * 0.18);
    ellipse(0, 0, 46, 86, c); ellipse(-14, -30, 14, 34, rgba(hell, 0.7), -0.2);
    for (const sd of [-1, 1]) { capsule(sd * 8, -6, sd * 34, -12, 6, 5); fill(GLOW); A.licht(sd * 22, -9, 90, GLOW, 1.4); }
    ctx.restore();
    ctx.restore();
  };

  // Gestörte Tarnung: Streifen aus Mensch und wahrer Gestalt, Farbversatz
  A.glitch = (zeichneMensch, zeichneWahr, st, t) => {
    const m = ctx.getTransform();
    const ca = malenIn("gA", zeichneMensch, m);
    const cb = zeichneWahr ? malenIn("gB", zeichneWahr, m) : null;
    const tint = (name, quelle, farbe) => { const oc = off(name); oc.setTransform(1, 0, 0, 1, 0, 0); oc.globalCompositeOperation = "source-over"; oc.clearRect(0, 0, W, H); oc.drawImage(quelle, 0, 0); oc.globalCompositeOperation = "source-atop"; oc.fillStyle = farbe; oc.fillRect(0, 0, W, H); oc.globalCompositeOperation = "source-over"; return oc.canvas; };
    const cy = tint("gC", ca, "rgba(60,255,230,0.85)"), mg = tint("gD", ca, "rgba(255,60,200,0.85)");
    const r = rnd(Math.floor(t * 20) + 7);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    let y = 0;
    while (y < H) {
      const h = 6 + r() * 42, wahr = cb && r() < st * 0.9, dx = (r() - 0.5) * 80 * st;
      const src = wahr ? cb : ca;
      if (!wahr && r() < 0.6 * st) { ctx.globalAlpha = 0.55; ctx.drawImage(cy, 0, y, W, h, dx - 12 * st, y, W, h); ctx.drawImage(mg, 0, y, W, h, dx + 12 * st, y, W, h); ctx.globalAlpha = 1; }
      ctx.drawImage(src, 0, y, W, h, dx, y, W, h);
      y += h;
    }
    ctx.restore();
  };

  // ---------- Figuren: Nox, Sammler, gestörte Tarnung ----------
  const figurAlt = A.figur;
  A.figur = (x, y, s, f, o = {}) => {
    if (f.art === "nox") return A.nox(x, y, s, f, o);
    if (f.art === "sammler") return A.sammler(x, y, s * (f.groesse || 1), o);
    if (o.stoerung > 0 && !o._imGlitch) {
      const ow = { ...o, _imGlitch: true };
      return A.glitch(() => figurAlt(x, y, s, f, ow), o.stoerung > 0.5 ? () => A.sammler(x, y, s * 1.12, ow) : null, o.stoerung, o.t || 0);
    }
    return figurAlt(x, y, s, f, o);
  };

  // Figuren einer Szene, erweitert um Leuchten, Augenleuchten, Störung, Positionen, Gehaltenes
  const parseMap = v => { if (!v || typeof v === "object") return v || {}; const m = {}; for (const p of String(v).split(",")) { const [k, w] = p.split(":"); if (w) m[k.trim()] = w.trim(); } return m; };
  A.figurenZeigen = (s, t, y, skala, xs) => {
    if (A.vorFiguren) A.vorFiguren(s, t);
    const weg = s.typ === "dach" && s.hinter_tank ? String(s.hinter_tank).split(",") : [];
    const liste = (s.figuren || (s.figur ? [s.figur] : [])).filter(nm => !weg.includes(nm));
    const n = liste.length;
    const pos = s.pos ? String(s.pos).split(",").map(Number) : xs || (n === 1 ? [W / 2] : n === 2 ? [360, 720] : n === 3 ? [250, 540, 830] : liste.map((_, i) => 170 + i * (740 / (n - 1))));
    const halt = parseMap(s.haelt);
    liste.forEach((name, i) => {
      const f = A.fig(name);
      const spricht = s._spricht && s.sprecher === name;
      const blickX = n > 1 ? (i < n / 2 ? 1 : -1) : 0;
      const sk = skala * (s.skala_figur || 1);
      A.figur(pos[i] ?? W / 2, y + (n > 2 && i % 2 ? 12 : 0), sk, f, {
        t: t + i * 1.1, pose: (s.posen || {})[name] || (f.art ? null : s.pose), ausdruck: (s.ausdruecke || {})[name] || (f.art ? null : s.ausdruck),
        spricht, blick: [blickX, 0], drehung: n > 1 ? blickX * 0.35 : (s.drehung || 0), seed: i * 5 + 2, halt: halt[name],
        leuchten: f.art === "nox" ? (s.leuchten === true ? 1 : s.leuchten || 0) : f.augenleuchten ? A.augenWert(s, t) : 0,
        stoerung: f.mantel ? s.stoerung || 0 : 0, spiegeln: (s.spiegeln || "").split(",").includes(name),
      });
    });
    if (A.nachFiguren) A.nachFiguren(s, t);
  };
})();

/* ---------- Gegenstände und Icons (Grundgröße ca. 240 px, zentriert) ---------- */
(() => {
  const { box, circle, ellipse, poly, line, shade, rgba, lgrad, rgrad, fill, capsule } = A;
  const I = A.I;
  const BLAU = "#59c7ff";
  const handyKoerper = (w = 150, h = 290) => { box(-w / 2, -h / 2, w, h, 26, "#1d2128"); box(-w / 2 + 10, -h / 2 + 14, w - 20, h - 28, 16, "#2c3a4e"); };
  Object.assign(I, {
    zahnbuerste(t) {
      const z = Math.sin(t * 90) * 3; ctx.save(); ctx.translate(z, 0); ctx.rotate(-0.25);
      box(-26, -40, 52, 190, 24, "#f4f6f8"); box(-26, 40, 52, 30, 0, "#3fb3a7"); circle(0, 0, 9, "#3fb3a7");
      box(-14, -150, 28, 120, 12, "#f4f6f8"); box(-22, -190, 44, 60, 14, "#f4f6f8");
      for (let i = 0; i < 4; i++) box(-18 + i * 10, -196, 6, 40, 3, i % 2 ? "#7fd0ff" : "#ffffff");
      ctx.restore();
      for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(0, -120, 70 + (t * 60 % 30), sd > 0 ? -0.5 : Math.PI - 0.5, sd > 0 ? 0.5 : Math.PI + 0.5); ctx.lineWidth = 6; ctx.strokeStyle = rgba("#ffffff", 0.5); ctx.stroke(); }
    },
    zahnbuerste_station(t) { box(-40, 80, 80, 40, 14, "#dfe4e8"); ctx.save(); ctx.translate(0, -20); I.zahnbuerste(0); ctx.restore(); },
    zahnpasta(t) { poly([[-120, -40], [80, -50], [110, -20], [110, 20], [80, 50], [-120, 40]], "#f2f4f6"); box(-120, -40, 30, 80, 8, "#d9dee3"); box(110, -18, 40, 36, 8, "#e04858"); box(-60, -30, 110, 60, 10, "#3f8fd0"); },
    waeschekorb(t) {
      poly([[-120, -90], [120, -90], [100, 110], [-100, 110]], "#c9a27a");
      for (let k = 0; k < 5; k++) line(-115 + k * 4, -60 + k * 36, 115 - k * 4, -60 + k * 36, 8, "#a8835e");
      ellipse(-30, -95, 70, 26, "#5c7fa8"); ellipse(45, -100, 55, 22, "#e0d6c8"); box(-130, -100, 260, 22, 10, "#b58d64");
    },
    walkie(t, blau = false) {
      box(-10, -180, 20, 90, 8, "#2b2f36"); box(-70, -110, 140, 230, 30, "#f2c230"); box(-70, -110, 140, 230, 30, "rgba(0,0,0,0)");
      for (let i = 0; i < 4; i++) box(-45, -80 + i * 18, 90, 8, 4, "#c99a1c");
      circle(0, 50, 26, "#e04848"); box(-50, 0, 100, 18, 9, "#2b2f36");
      if (blau) { const p = 0.6 + 0.4 * Math.sin(t * 4); circle(40, -128, 14, rgba(BLAU, p)); A.licht(40, -128, 120, BLAU, 1.2 * p); }
    },
    walkie_blau(t) { I.walkie(t, true); },
    handy(t) { handyKoerper(); for (let k = 0; k < 4; k++) box(-40 + k * 22, 60 - k * 14, 14, 14 + k * 14, 3, "#7fdc8a"); A.text("23:17", 0, -60, 46, "#ffffff", "center", 700, "HUD"); },
    handy_netz0(t) { handyKoerper(); for (let k = 0; k < 4; k++) box(-40 + k * 22, 60 - k * 14, 14, 14 + k * 14, 3, "rgba(255,255,255,0.25)"); line(-50, 30, 40, 90, 6, "#ff5a4a"); A.text("KEIN NETZ", 0, -60, 26, "#ff8a7a", "center", 700, "HUD"); },
    handy_licht(t) { ctx.fillStyle = rgrad(0, -160, 10, 260, [[0, "rgba(255,250,220,0.9)"], [1, "rgba(255,250,220,0)"]]); ctx.fillRect(-260, -420, 520, 520); handyKoerper(); circle(0, -110, 14, "#fffbe0"); A.licht(0, -160, 420, "#fff4d0", 1.4); },
    handy_karte(t) { handyKoerper(); box(-60, -120, 120, 230, 10, "#cfe3c8"); line(-60, 0, 60, -40, 10, "#ffffff"); line(-20, -120, 10, 110, 10, "#ffffff"); ctx.save(); ctx.translate(5, -10 + Math.sin(t * 4) * 6); ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-30, -34, -30, -74, 0, -76); ctx.bezierCurveTo(30, -74, 30, -34, 0, 0); fill("#e0533d"); circle(0, -50, 11, "#fff"); ctx.restore(); },
    kapsel(t, aus = false) {
      ellipse(0, 20, 150, 46, "#7d868f"); ellipse(0, 0, 150, 46, "#c3cbd3"); ellipse(-30, -10, 70, 16, rgba("#ffffff", 0.35));
      ctx.beginPath(); ctx.ellipse(0, 0, 112, 32, 0, 0, Math.PI * 2); ctx.lineWidth = 10; ctx.strokeStyle = aus ? "#5d646b" : rgba(BLAU, 0.75 + 0.25 * Math.sin(t * 3)); ctx.stroke();
      if (!aus) A.licht(0, 0, 170, BLAU, 0.6);
    },
    kapsel_aus(t) { I.kapsel(t, true); },
    kette(t) { for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(-150 + i * 50, Math.sin(i * 0.5) * 20, 30, 16, i % 2 ? 0.5 : -0.3, 0, Math.PI * 2); ctx.lineWidth = 12; ctx.strokeStyle = "#b8bfc6"; ctx.stroke(); } },
    plastikpflanze(t) { box(-50, 30, 100, 80, 14, "#e9e4da"); for (const [a, l] of [[-0.9, 110], [-0.4, 140], [0.1, 150], [0.6, 130], [1.0, 100]]) { ctx.save(); ctx.translate(0, 40); ctx.rotate(a); ellipse(0, -l / 2, 18, l / 2, "#5fb36a"); ctx.restore(); } },
    kraeuter(t) { for (const [x, c] of [[-120, "#4f9a52"], [0, "#6cb35a"], [120, "#3f8a5a"]]) { box(x - 45, 20, 90, 80, 12, "#c9744a"); for (let k = 0; k < 7; k++) circle(x + Math.sin(k * 2.3) * 32, 5 - k * 12 + Math.sin(t * 1.5 + k) * 2, 18, shade(c, (k % 3) * 0.08)); } },
    tasse(t) { box(-70, -60, 140, 130, 26, "#f2efe9"); ctx.beginPath(); ctx.arc(80, 5, 34, -1.2, 1.2); ctx.lineWidth = 16; ctx.strokeStyle = "#f2efe9"; ctx.stroke(); ellipse(0, -60, 70, 14, "#6b4a33"); for (let i = 0; i < 3; i++) { const w = (t * 0.6 + i / 3) % 1; ellipse(-30 + i * 30, -90 - w * 90, 8, 18, rgba("#ffffff", 0.35 * (1 - w))); } },
    kaffeedose(t) { box(-70, -100, 140, 200, 18, "#6b3d2a"); ellipse(0, -100, 70, 16, "#8a5a3e"); box(-70, -30, 140, 60, 0, "#d9b37a"); A.text("KAFFEE", 0, 0, 30, "#4a2a1a"); },
    deckenlager(t) { ellipse(0, 40, 200, 70, "#7a5e8a"); ellipse(-40, 10, 150, 50, "#9a7aa8"); ellipse(60, 0, 110, 40, "#c7b8d0"); },
    kiste(t) { box(-150, -90, 300, 190, 8, "#c9a06a"); box(-150, -90, 300, 40, 6, "#b88f5a"); box(-30, -90, 60, 190, 0, rgba("#ffffff", 0.25)); A.text("KRAM", 0, 40, 40, "#7a5a3a"); },
    foehn(t) { box(-130, -70, 190, 120, 50, "#e04858"); ellipse(70, -10, 40, 60, "#c43a48"); box(-90, 40, 60, 130, 20, "#e04858"); for (let i = 0; i < 3; i++) { const w = (t * 2 + i / 3) % 1; line(120 + w * 90, -30 + i * 20, 160 + w * 90, -30 + i * 20, 6, rgba("#ffffff", 0.5 * (1 - w))); } },
    sporttasche(t, leuchten = 0, augen = true) {
      if (leuchten) { ctx.fillStyle = rgrad(0, 0, 20, 320, [[0, rgba("#8fdcff", 0.5 * leuchten)], [1, "rgba(143,220,255,0)"]]); ctx.fillRect(-320, -320, 640, 640); A.licht(0, 0, 400, "#8fdcff", 1.3 * leuchten); }
      ctx.beginPath(); ctx.arc(0, -70, 90, Math.PI, 0); ctx.lineWidth = 18; ctx.strokeStyle = "#2b2f36"; ctx.stroke();
      box(-170, -80, 340, 190, 60, A.mix("#3a4a6a", "#8fdcff", 0.4 * leuchten)); box(-170, -10, 340, 14, 6, "#2b2f36");
      if (augen) { box(-70, -95, 140, 40, 18, "#0e1a33"); for (const sd of [-1, 1]) { ellipse(sd * 30, -75, 18, 14, "#eaf6ff"); circle(sd * 30, -73, 7, "#0e1a33"); } }
    },
    sporttasche_leuchtet(t) { I.sporttasche(t, 0.8 + 0.2 * Math.sin(t * 6)); },
    gecko(t, nass = false) {
      ctx.save(); ctx.rotate(-0.4);
      ellipse(0, 0, 50, 120, "#7bbf5a"); circle(0, -130, 46, "#7bbf5a"); for (const sd of [-1, 1]) circle(sd * 26, -150, 12, "#1d2128");
      ctx.beginPath(); ctx.moveTo(0, 100); ctx.quadraticCurveTo(60, 200, 10, 250); ctx.lineWidth = 22; ctx.strokeStyle = "#7bbf5a"; ctx.lineCap = "round"; ctx.stroke();
      for (const [x, y, a] of [[-60, -60, -0.6], [60, -60, 0.6], [-60, 60, -2.4], [60, 60, 2.4]]) { line(x * 0.6, y, x * 1.4, y + (y < 0 ? -20 : 20), 18, "#7bbf5a"); circle(x * 1.5, y + (y < 0 ? -24 : 24), 16, "#a5d98a"); }
      ctx.restore();
      if (nass) for (let i = 0; i < 6; i++) { const y = ((t * 200 + i * 60) % 300) - 150; ctx.beginPath(); ctx.moveTo(-140 + i * 55, y - 20); ctx.bezierCurveTo(-125 + i * 55, y, -125 + i * 55, y + 18, -140 + i * 55, y + 18); ctx.bezierCurveTo(-155 + i * 55, y + 18, -155 + i * 55, y, -140 + i * 55, y - 20); fill("#5cc2ff"); }
    },
    gecko_nass(t) { I.gecko(t, true); },
    schallwand(t) {
      box(-20, -150, 40, 300, 6, "#9aa3ab");
      ctx.lineCap = "round";
      for (let i = 0; i < 3; i++) { const w = (t * 0.8 + i / 3) % 1; ctx.beginPath(); ctx.arc(-160, 0, 40 + w * 120, -0.8, 0.8); ctx.lineWidth = 12; ctx.strokeStyle = rgba("#ff8a3d", 1 - w); ctx.stroke(); }
      for (let i = 0; i < 3; i++) { const w = (t * 0.8 + i / 3) % 1; ctx.beginPath(); ctx.arc(20, 0, 40 + w * 130, -0.7, 0.7); ctx.lineWidth = 16; ctx.strokeStyle = rgba("#5cc2ff", 0.9 * (1 - w)); ctx.stroke(); }
    },
    lautsprecher(t) { box(-90, -130, 180, 260, 20, "#2d3238"); circle(0, -50, 40, "#4a5058"); const p = 1 + 0.08 * Math.sin(t * 20); circle(0, 50, 60 * p, "#4a5058"); circle(0, 50, 22, "#2d3238"); },
    mikrofon(t) { box(-50, -140, 100, 160, 50, "#4a5058"); for (let i = 0; i < 4; i++) line(-40, -110 + i * 30, 40, -110 + i * 30, 5, "#2d3238"); ctx.beginPath(); ctx.arc(0, -10, 80, 0.2, Math.PI - 0.2); ctx.lineWidth = 12; ctx.strokeStyle = "#7d858b"; ctx.stroke(); box(-8, 70, 16, 70, 6, "#7d858b"); box(-60, 135, 120, 18, 9, "#7d858b"); },
    kopfschall(t) {
      ctx.beginPath(); ctx.moveTo(-60, 140); ctx.bezierCurveTo(-140, 80, -150, -130, 10, -150); ctx.bezierCurveTo(130, -150, 150, -40, 120, 20); ctx.lineTo(150, 60); ctx.lineTo(110, 80); ctx.lineTo(100, 140); ctx.closePath(); fill("#efc4a4");
      circle(-10, -10, 26, "#d39a7a"); // Ohr
      ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 40;
      ctx.beginPath(); ctx.moveTo(110, 60); ctx.quadraticCurveTo(60, 10, -10, -10); ctx.lineWidth = 10; ctx.strokeStyle = "#e0533d"; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(160, 70); ctx.quadraticCurveTo(220, -120, -10, -40); ctx.strokeStyle = "#5cc2ff"; ctx.stroke(); ctx.setLineDash([]);
    },
    gesichtraster(t) { for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { box(-150 + i * 105, -150 + j * 105, 90, 90, 14, rgba("#ffffff", 0.12)); circle(-105 + i * 105, -115 + j * 105, 22, "#efc4a4"); ellipse(-105 + i * 105, -78 + j * 105, 32, 18, "#5c7fa8"); } const k = Math.floor(t * 2) % 9; ctx.beginPath(); ctx.rect(-150 + (k % 3) * 105, -150 + Math.floor(k / 3) * 105, 90, 90); ctx.lineWidth = 8; ctx.strokeStyle = "#ffcf3d"; ctx.stroke(); },
    kamera(t) { box(-130, -50, 200, 100, 16, "#e9e6e0"); circle(80, 0, 40, "#2d3238"); circle(80, 0, 18, "#5cc2ff"); box(-30, 50, 20, 80, 6, "#9aa2a8"); box(-80, 120, 120, 20, 8, "#9aa2a8"); circle(-100, -20, 8, Math.sin(t * 4) > 0 ? "#e0533d" : "#6e2a28"); },
    hund(t) { ellipse(0, 40, 130, 70, "#c98a4a"); circle(110, -40, 60, "#c98a4a"); ellipse(80, -90, 22, 40, "#8a5a2a", -0.4); ellipse(140, -95, 22, 40, "#8a5a2a", 0.4); circle(130, -45, 9, "#1d2128"); circle(165, -25, 12, "#1d2128"); for (const x of [-80, -30, 40, 90]) box(x - 12, 80, 24, 70, 10, "#c98a4a"); line(-120, 20, -180, -40 + Math.sin(t * 8) * 20, 18, "#c98a4a"); A.laermWellen(150, -110, t, 0.35); },
    ohrkurve(t) { I.ohr(t); ctx.beginPath(); ctx.moveTo(-150, -150); ctx.bezierCurveTo(-20, -150, 60, -60, 150, 120); ctx.lineWidth = 12; ctx.strokeStyle = "#ffcf3d"; ctx.lineCap = "round"; ctx.stroke(); },
    katzenauge(t) { ctx.beginPath(); ctx.moveTo(-160, 0); ctx.quadraticCurveTo(0, -140, 160, 0); ctx.quadraticCurveTo(0, 140, -160, 0); fill("#d8e85a"); ellipse(0, 0, 22, 95, "#14161a"); const p = 0.6 + 0.4 * Math.sin(t * 3); ctx.fillStyle = rgrad(0, 0, 10, 170, [[0, rgba("#d8ff8a", 0.6 * p)], [1, "rgba(216,255,138,0)"]]); ctx.fillRect(-170, -170, 340, 340); circle(-40, -40, 16, "#ffffff"); },
    menschenauge(t) { I.auge(t); },
    lichtweg(t) { I.taschenlampe(0); ctx.save(); ctx.translate(0, 0); ctx.restore(); line(40, -100, 160, -100, 10, "#ffe680"); line(160, -100, 40, -60, 10, rgba("#d8ff8a", 0.9)); ellipse(190, -100, 40, 60, "#d8e85a"); ellipse(205, -100, 10, 40, "#14161a"); },
    gehirn(t) { ellipse(-40, 0, 110, 100, "#f2a7b4"); ellipse(50, 0, 110, 100, "#f2a7b4"); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-80 + i * 55, -10 + (i % 2) * 30, 30, 0.5, 2.6); ctx.lineWidth = 8; ctx.strokeStyle = "#d9798c"; ctx.stroke(); } A.text("?", 140, -110, 140, "#ffcf3d"); },
    herzpuls(t) { I.herz(t * 0.6); ctx.beginPath(); ctx.moveTo(-170, 140); ctx.lineTo(-60, 140); ctx.lineTo(-30, 100); ctx.lineTo(0, 170); ctx.lineTo(30, 140); ctx.lineTo(170, 140); ctx.lineWidth = 10; ctx.strokeStyle = "#ffffff"; ctx.lineJoin = "round"; ctx.stroke(); },
    erstarrt(t) { circle(0, -120, 50, "#efc4a4"); box(-55, -70, 110, 170, 40, "#5c7fa8"); box(-50, 100, 40, 90, 16, "#2d3340"); box(10, 100, 40, 90, 16, "#2d3340"); for (const sd of [-1, 1]) box(sd * 70 - 15, -60, 30, 140, 14, "#5c7fa8"); for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(0, -120, 100 + sd * 20, -0.4, 0.4); ctx.lineWidth = 6; ctx.strokeStyle = rgba("#ffffff", 0.4); ctx.stroke(); } },
    satellit(t) { ctx.save(); ctx.rotate(Math.sin(t * 0.5) * 0.1); box(-50, -50, 100, 100, 14, "#c3cbd3"); for (const sd of [-1, 1]) { box(sd * 70 - (sd > 0 ? 0 : 140), -40, 140, 80, 6, "#2c4a7a"); for (let k = 1; k < 4; k++) line(sd * 70 + sd * k * 35 - (sd > 0 ? 0 : 0), -40, sd * 70 + sd * k * 35, 40, 3, "#8fb3e0"); } line(0, 50, 0, 100, 6, "#9aa2a8"); circle(0, 108, 14, "#e0533d"); ctx.restore(); for (let i = 0; i < 3; i++) { const w = (t * 0.8 + i / 3) % 1; ctx.beginPath(); ctx.arc(0, 108, 30 + w * 120, 0.6, Math.PI - 0.6); ctx.lineWidth = 8; ctx.strokeStyle = rgba("#5cc2ff", 1 - w); ctx.stroke(); } },
    hausblock(t) { box(-100, -20, 200, 170, 6, "#9aa3ab"); poly([[-120, -20], [0, -120], [120, -20]], "#7d858b"); for (const [x, y] of [[-60, 30], [20, 30], [-60, 90], [20, 90]]) box(x, y, 40, 40, 4, "#2c3a4e"); for (let i = 0; i < 4; i++) line(-150 + i * 20, -200, -60 + i * 25, -60, 8, rgba("#5cc2ff", 0.8)); line(-100, -150, 100, 60, 16, "#e0533d"); line(100, -150, -100, 60, 16, "#e0533d"); },
    tuerversuch(t) {
      const tausch = (t % 3) > 1.5;
      circle(-110, -70, 36, "#efc4a4"); box(-145, -30, 70, 150, 26, "#3d7fb8");
      circle(110, -70, 36, tausch ? "#d9a882" : "#efc4a4"); box(75, -30, 70, 150, 26, tausch ? "#b5452f" : "#5a6b3f");
      const tx = ((t * 160) % 520) - 260; box(tx - 40, -170, 80, 300, 6, "#c9a06a"); box(tx - 30, -160, 60, 280, 4, "#b88f5a");
    },
    einsvonzwei(t) { for (let i = 0; i < 2; i++) { circle(-80 + i * 160, -60, 46, i ? "#efc4a4" : "#efc4a4"); box(-130 + i * 160, -10, 100, 160, 36, i ? "#5a6b3f" : "#3d7fb8"); } A.text("?", 80, -170, 120, "#ffcf3d"); A.text("1 VON 2", 0, 200, 64, "#ffffff"); },
    linse(t) { I.auge(t); ctx.beginPath(); ctx.arc(0, 0, 130, 0, Math.PI * 2); ctx.lineWidth = 18; ctx.strokeStyle = "#b89a5a"; ctx.stroke(); ellipse(-50, -60, 40, 18, rgba("#ffffff", 0.4), -0.6); },
    pfeil(t) { const dx = Math.sin(t * 3) * 14; ctx.save(); ctx.translate(dx, 0); box(-150, -22, 220, 44, 10, "#ffcf3d"); poly([[60, -70], [160, 0], [60, 70]], "#ffcf3d"); ctx.restore(); },
    zettel(t) { ctx.save(); ctx.rotate(-0.06); box(-120, -150, 240, 300, 10, "#fbf7ec"); for (let i = 0; i < 4; i++) { A.text(String(i + 1) + ".", -80, -90 + i * 62, 34, "#3a4250", "left"); line(-40, -90 + i * 62, 90, -90 + i * 62, 6, rgba("#3a4250", 0.5)); } ctx.restore(); },
    schallfrei(t) { I.ohr(t); },
  });
  A.ICONS = Object.keys(I);
  A.kraeuter = (x, y, t) => { ctx.save(); ctx.translate(x + 120, y - 50); ctx.scale(0.55, 0.55); I.kraeuter(t); ctx.restore(); };
})();

/* ---------- Schiffe, Lichtkegel, Notruf ---------- */
(() => {
  const { box, circle, ellipse, poly, line, shade, rgba, lgrad, rgrad, fill, capsule, clamp, lerp, E } = A;
  const GLOW = "#9dffbf", BLAU = "#59c7ff", W = A.W, H = A.H;

  // Sammlerschiff: langer dunkler Keil mit grünen Lichtschlitzen. (x,y) = Mitte
  A.sammlerschiff = (x, y, s, t, o = {}) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
    const rumpf = () => { ctx.beginPath(); ctx.moveTo(720, 10); ctx.bezierCurveTo(420, -70, -300, -110, -700, -70); ctx.lineTo(-720, 60); ctx.bezierCurveTo(-300, 110, 420, 80, 720, 10); ctx.closePath(); };
    rumpf(); ctx.fillStyle = lgrad(0, -110, 0, 110, [[0, "#30353f"], [0.45, "#1b1e25"], [1, "#101216"]]); ctx.fill();
    ctx.beginPath(); ctx.moveTo(700, 4); ctx.bezierCurveTo(400, -60, -300, -98, -690, -62); ctx.lineWidth = 6; ctx.strokeStyle = rgba("#7d8796", 0.5); ctx.stroke();
    for (let i = 0; i < 11; i++) { const xx = -560 + i * 108, a = 0.5 + 0.5 * Math.sin(t * 3 - i * 0.6); capsule(xx - 22, 8, xx + 22, 6, 7, 7); fill(rgba(GLOW, 0.4 + 0.6 * a)); A.licht(xx, 8, 120, GLOW, 0.8 * a); }
    if (o.unten) { ellipse(-80, 70, 170, 30, rgba(GLOW, 0.25 + 0.15 * Math.sin(t * 2))); A.licht(-80, 80, 400, GLOW, 0.8); }
    ctx.restore();
  };
  // Schiff von Nox' Leuten: runde, weiche Tropfenform mit warm-blauem Leuchten
  A.rettungsschiff = (x, y, s, t, o = {}) => {
    ctx.save(); ctx.translate(x, y + Math.sin(t * 1.2) * 10 * s); ctx.scale(s, s);
    ctx.fillStyle = rgrad(0, 60, 40, 520, [[0, "rgba(160,220,255,0.55)"], [1, "rgba(160,220,255,0)"]]); ctx.fillRect(-560, -460, 1120, 1040);
    ellipse(0, 0, 380, 120, "#cfd9e8"); ellipse(0, 26, 360, 88, "#9fb2cc");
    ellipse(0, -60, 200, 110, "#e8f0fa"); ellipse(-60, -96, 80, 30, rgba("#ffffff", 0.6), -0.2);
    for (let i = 0; i < 9; i++) { const a = -Math.PI + i * (Math.PI / 8), p = 0.6 + 0.4 * Math.sin(t * 2 + i); circle(Math.cos(a) * 330, 40 + Math.sin(a) * -8, 14, rgba("#fff4d6", p)); }
    ellipse(0, 90, 150, 30, rgba(BLAU, 0.85)); A.licht(0, 110, 700, "#9fdcff", 1.5);
    ctx.restore();
  };
  // Lichtkegel vom Schiff zum Boden
  A.kegel = (x0, y0, x1, y1, breite, farbe, staerke = 1) => {
    ctx.save(); ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = lgrad(0, y0, 0, y1, [[0, rgba(farbe, 0.55 * staerke)], [1, rgba(farbe, 0.18 * staerke)]]);
    poly([[x0 - 40, y0], [x0 + 40, y0], [x1 + breite, y1], [x1 - breite, y1]]); ctx.fill();
    ellipse(x1, y1, breite * 1.05, breite * 0.22, rgba(farbe, 0.45 * staerke));
    ctx.restore();
    A.licht(x1, y1 - 80, breite * 2.2, farbe, 1.2 * staerke);
  };

  // Notruf: Lichtringe um die Kapsel, Countdown, Impuls über das Dach, Strahl in den Himmel (Bildschirmkoordinaten)
  A.notruf = (s, t) => {
    const p = A._haltPos; if (!p) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (let i = 0; i < 4; i++) { const w = (t * 0.7 + i / 4) % 1; ctx.beginPath(); ctx.ellipse(p.x, p.y, 40 + w * 520, (40 + w * 520) * 0.35, 0, 0, Math.PI * 2); ctx.lineWidth = 10 * (1 - w) + 2; ctx.strokeStyle = rgba(BLAU, 0.8 * (1 - w)); ctx.stroke(); }
    if (s.impuls) { const w = clamp(t / 1.2, 0, 1); ctx.beginPath(); ctx.ellipse(p.x, p.y, 80 + w * 1600, (80 + w * 1600) * 0.3, 0, 0, Math.PI * 2); ctx.lineWidth = 40 * (1 - w) + 4; ctx.strokeStyle = rgba("#ffffff", 0.9 * (1 - w)); ctx.stroke(); ctx.fillStyle = rgba(BLAU, 0.25 * (1 - w)); ctx.fillRect(0, 0, W, H); }
    if (s.strahl) { const w = E.raus(clamp(t / 0.6, 0, 1)); ctx.fillStyle = lgrad(p.x - 30, 0, p.x + 30, 0, [[0, rgba(BLAU, 0)], [0.5, rgba("#ffffff", 0.95)], [1, rgba(BLAU, 0)]]); ctx.fillRect(p.x - 30, p.y - w * p.y - 40, 60, w * p.y + 40); ctx.fillStyle = rgrad(p.x, p.y, 10, 260, [[0, "rgba(255,255,255,0.9)"], [1, "rgba(89,199,255,0)"]]); ctx.fillRect(p.x - 260, p.y - 260, 520, 520); }
    ctx.restore();
    A.lichter.push({ x: p.x, y: p.y, r: 700, farbe: BLAU, st: 1.4 });
  };
  A.countdown = (wert, t) => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const pop = E.pop(clamp(t / 0.3, 0, 1));
    ctx.translate(540, 560); ctx.scale(0.8 + 0.2 * pop, 0.8 + 0.2 * pop);
    circle(0, 0, 150, "rgba(10,18,34,0.55)");
    ctx.beginPath(); ctx.arc(0, 0, 140, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (Number(wert) / 60)); ctx.lineWidth = 16; ctx.strokeStyle = BLAU; ctx.lineCap = "round"; ctx.stroke();
    A.text(String(wert), 0, 6, 130, "#ffffff");
    ctx.restore();
  };
  A.wind = t => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const r = A.rnd(17);
    for (let i = 0; i < 40; i++) { const y = r() * H, sp = 0.6 + r(), x = ((r() * W + t * 1600 * sp) % (W + 400)) - 200; line(x, y, x + 120 + r() * 120, y - 10, 3, "rgba(255,255,255,0.18)"); }
    ctx.restore();
  };
})();

/* ---------- Kulissen für Der Alien ---------- */
(() => {
  const { box, circle, ellipse, poly, line, shade, rgba, lgrad, rgrad, fill, capsule, mix, rnd, clamp, lerp, E } = A;
  const W = A.W, H = A.H, SZ = A.SZ, BLAU = "#59c7ff";
  const HIMMEL = { tag: ["#6fa8d6", "#cfe5f0"], morgen: ["#8fa6c9", "#f4cfae"], abend: ["#384073", "#ee9a66"], nacht: ["#0a0f24", "#25305a"] };
  const nachtig = s => (s.zeit || "tag") === "nacht";
  const parseMap = v => { if (!v || typeof v === "object") return v || {}; const m = {}; for (const p of String(v).split(",")) { const [k, w] = p.split(":"); if (w) m[k.trim()] = w.trim(); } return m; };
  const ohne = (s, name) => ({ ...s, figuren: (s.figuren || []).filter(n => n !== name) });
  const noxOpt = (s, t, extra = {}) => ({ t, pose: (s.posen || {}).nox, ausdruck: (s.ausdruecke || {}).nox, spricht: s._spricht && s.sprecher === "nox", halt: parseMap(s.haelt).nox, leuchten: s.leuchten === true ? 1 : s.leuchten || 0, ...extra });

  // Hintergrund einer anderen Kulisse, unscharf (für Nahaufnahmen, Handy, Lichtbild)
  A.unscharf = (ort, s, t, blur = 12, hell = 1) => {
    const n = A.lichter.length, d = A._dunkel;
    if (!A._ub) { A._ub = document.createElement("canvas"); A._ub.width = W; A._ub.height = H; A._ubc = A._ub.getContext("2d"); }
    const m = ctx.getTransform(); A._ubc.setTransform(1, 0, 0, 1, 0, 0); A._ubc.clearRect(0, 0, W, H); A._ubc.setTransform(m);
    const bg = { ...s, typ: ort, figuren: [], figur: null, objekt: null, inhalt: null, nox: null, oben: null, gegenueber: null, zebra: null };
    A.umleiten(A._ubc, () => (SZ[ort] || SZ.wohnung)(bg, t, 0.5));
    const dn = A._dunkel; A.lichter.length = n; A._dunkel = d;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = `blur(${blur}px) brightness(${hell})`; ctx.drawImage(A._ub, -20, -20, W + 40, H + 40); ctx.restore();
    return dn;
  };

  // ---------- Hauseingang Ahornstraße 12 (auch im Lichtbild) ----------
  A.hauseingang = (x, y, s, t, o = {}) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    box(-300, -520, 600, 520, 0, o.wand || "#8b8f98");
    box(-150, -400, 300, 400, 8, "#3a4048"); box(-130, -380, 260, 380, 4, rgba("#9fc0d8", 0.35)); line(0, -380, 0, 0, 8, "#3a4048");
    box(-60, -470, 120, 50, 8, "#2f6fb5"); A.text("12", 0, -444, 40, "#ffffff");
    box(-220, -40, 440, 40, 4, "#a3a7ad"); box(-260, 0, 520, 30, 4, "#8f949a");
    // Ahornbaum links, Herbstlaub
    box(-420, -380, 34, 380, 10, "#5b4636");
    for (const [cx, cy, r, c] of [[-400, -470, 120, "#c8622f"], [-470, -400, 90, "#d9822f"], [-330, -410, 95, "#b84a2a"], [-410, -560, 80, "#e0a23d"]]) circle(cx, cy, r, c);
    // kaputte Laterne rechts
    line(380, 0, 380, -560, 12, "#2b2f36"); ctx.save(); ctx.translate(380, -560); ctx.rotate(0.5); box(-12, -10, 70, 26, 8, "#2b2f36"); box(10, 14, 40, 10, 4, "#4a4f57"); ctx.restore();
    ctx.restore();
  };

  // =====================================================================
  // BADEZIMMER – Fenster mit Plastikpflanze, Waschbecken, Wäschekorb, Wanne
  // =====================================================================
  SZ.badezimmer = (s, t, p) => {
    const zeit = s.zeit || "tag", nacht = zeit === "nacht";
    ctx.fillStyle = "#dbe5e8"; ctx.fillRect(-1500, -1500, 4080, 3000);
    box(-1500, 1100, 4080, 380, 0, "#cfdce0");
    for (let x = -1500; x < 2600; x += 110) line(x, -1500, x, 1480, 3, rgba("#a9babf", 0.55));
    for (let y = -1500; y < 1480; y += 110) line(-1500, y, 2600, y, 3, rgba("#a9babf", 0.55));
    box(-1500, 1480, 4080, 800, 0, "#9ea9ad"); for (let x = -1500; x < 2600; x += 150) line(x, 1480, x - 90, 2300, 3, rgba("#000", 0.07));
    // Fenster
    const fx = 110, fy = 330, fw = 330, fh = 440, hc = HIMMEL[zeit] || HIMMEL.tag;
    box(fx - 22, fy - 22, fw + 44, fh + 44, 8, "#f3f1ec");
    ctx.save(); ctx.beginPath(); ctx.rect(fx, fy, fw, fh); ctx.clip();
    ctx.fillStyle = lgrad(0, fy, 0, fy + fh, [[0, hc[0]], [1, hc[1]]]); ctx.fillRect(fx, fy, fw, fh);
    const r = rnd(31); for (let i = 0; i < 9; i++) { const xx = fx + r() * fw, hh = 120 + r() * 220; box(xx, fy + fh - hh, 50 + r() * 50, hh, 2, mix(hc[1], "#1d2133", 0.6)); if (nacht && r() < 0.6) box(xx + 12, fy + fh - hh + 20, 10, 12, 2, "#e9b866"); }
    if (nacht) for (let i = 0; i < 12; i++) circle(fx + r() * fw, fy + r() * fh * 0.4, 1.6, "rgba(255,255,255,0.7)");
    if (s.regen) for (let i = 0; i < 30; i++) { const xx = fx + r() * fw, yy = fy + ((r() * fh + t * 900) % fh); line(xx, yy, xx - 5, yy + 20, 2, "rgba(200,220,240,0.7)"); }
    ctx.restore();
    if (s.fenster === "zu") { line(fx + fw / 2, fy, fx + fw / 2, fy + fh, 14, "#f3f1ec"); box(fx, fy, fw, fh, 0, rgba("#cfe3ef", 0.18)); }
    else { poly([[fx, fy], [fx + 130, fy - 46], [fx + 130, fy + fh + 46], [fx, fy + fh]], "#f3f1ec"); poly([[fx + 14, fy + 18], [fx + 116, fy - 22], [fx + 116, fy + fh + 22], [fx + 14, fy + fh - 18]], rgba("#cfe3ef", 0.45)); line(fx + 40, fy + 60, fx + 90, fy + 150, 8, rgba("#ffffff", 0.5)); }
    box(fx - 40, fy + fh + 16, fw + 80, 26, 6, "#e6e1d8");
    if (s.pflanze !== false) A.objekt("plastikpflanze", fx + fw - 60, fy + fh - 52, 0.5, t);
    if (nacht) A.licht(fx + fw / 2, fy + fh / 2, 520, "#9fb8ff", 0.5);
    // Lüftungsgitter
    box(900, 270, 130, 92, 12, "#cfd8dc"); for (let k = 0; k < 5; k++) box(912, 282 + k * 16, 106, 8, 3, "#9aa7ad");
    // Spiegel + Waschbecken
    box(520, 560, 230, 330, 18, "#c5d6dd"); box(534, 574, 202, 302, 12, "#e8f2f6"); line(565, 610, 625, 690, 10, "rgba(255,255,255,0.7)");
    box(610, 1090, 50, 390, 16, "#eef1f3"); box(500, 1040, 270, 70, 30, "#f4f6f8"); ellipse(635, 1052, 110, 16, "#dfe6ea");
    box(625, 990, 20, 60, 8, "#a9b1b8"); box(600, 984, 70, 16, 8, "#a9b1b8");
    const zb = s.zahnbuerste || "station";
    if (zb === "station") A.objekt("zahnbuerste_station", 738, 996, 0.3, t);
    if (zb === "boden") { ctx.save(); ctx.translate(560, 1500); ctx.rotate(-1.35); A.objekt("zahnbuerste", 0, 0, 0.38, t); ctx.restore(); }
    if (s.zahnpasta !== "nox") A.objekt("zahnpasta", 548, 1030, 0.22, t);
    // Wanne rechts, Handtuch über dem Rand
    const bx = 800, by = 1150;
    const wanne = () => { box(bx, by, 440, 320, 60, "#f4f6f8"); ctx.beginPath(); ctx.rect(bx, by, 440, 320); A.schattiere(bx, bx + 440, 0.12); box(bx - 10, by - 12, 460, 40, 20, "#e6eaee"); box(bx + 40, by + 300, 40, 40, 10, "#c5ccd2"); };
    wanne();
    // Wäschekorb
    A.objekt("waeschekorb", 240, 1365, 0.9, t);
    // Nox
    const nf = A.fig("nox");
    const wo = s.nox;
    if (wo === "korb") A.nox(240, 1282, s.nox_s || 1, nf, noxOpt(s, t, { pose: (s.posen || {}).nox || "sitzt" }));
    if (wo === "waschbecken") A.nox(635, 1480, s.nox_s || 1, nf, noxOpt(s, t, { pose: (s.posen || {}).nox || "duckt" }));
    if (wo === "fliesen") A.nox(880, 1040, s.nox_s || 1, nf, noxOpt(s, t, { pose: (s.posen || {}).nox || "klettert" }));
    if (wo === "fenster") A.nox(fx + 150, fy + fh + 18, s.nox_s || 0.9, nf, noxOpt(s, t));
    if (wo === "wanne") {
      const ny = by + 95, g = (s.nox_s || 1) * 0.33;
      A.nox(1000, ny, s.nox_s || 1, nf, noxOpt(s, t, { pose: "duckt" }));
      box(bx, by + 34, 440, 286, 50, "#f4f6f8"); ctx.beginPath(); ctx.rect(bx, by + 34, 440, 286); A.schattiere(bx, bx + 440, 0.12);
      if (s.handtuch !== false) { const top = ny - 520 * g, unten = ny - 470 * g; ctx.beginPath(); ctx.moveTo(1000 - 150, unten + 20); ctx.bezierCurveTo(1000 - 130, top - 110, 1000 + 130, top - 110, 1000 + 150, unten + 20); ctx.closePath(); fill("#e0a23d"); line(1000 - 120, unten - 10, 1000 + 120, unten - 10, 10, "#c98a2a"); }
    }
    if (s.handtuch !== false && wo !== "wanne") { const hx = bx + 70, hy = by - 22; box(hx, hy, 180, 210, 22, "#e0a23d"); for (const k of [40, 160]) box(hx, hy + k, 180, 14, 4, "#c98a2a"); }
    A.figurenZeigen(ohne(s, "nox"), t, 1660, 0.95);
    if (s.licht === "an") { A.licht(540, 280, 1100, "#fff1d0", 1.1); A._dunkel = nacht ? 0.12 : 0.05; }
    else A._dunkel = nacht ? 0.55 : 0.15;
    if (s.tuerlicht) A.licht(-60, 1100, 700, "#ffe2a8", 1.1);
  };

  // =====================================================================
  // TÜR – Wohnungstür von innen: Türspion, Kette, Garderobe
  // =====================================================================
  SZ.tuer = (s, t, p) => {
    const nacht = nachtig(s);
    ctx.fillStyle = lgrad(0, 0, 0, 1500, [[0, "#ddd3c6"], [1, "#c2b6a6"]]); ctx.fillRect(-1500, -1500, 4080, 3200);
    box(-1500, 1480, 4080, 800, 0, "#8a6a52"); for (let k = -10; k < 30; k++) line(k * 140, 1480, k * 140 - 60, 2300, 3, rgba("#000", 0.08)); box(-1500, 1462, 4080, 20, 0, "#efe9df");
    // Garderobe
    box(60, 600, 200, 24, 6, "#8a6a52"); for (const hx of [100, 160, 220]) box(hx - 6, 620, 12, 40, 5, "#5d646b");
    const jf = A.fig("du"); ctx.beginPath(); ctx.moveTo(110, 640); ctx.bezierCurveTo(60, 700, 70, 960, 90, 1020); ctx.lineTo(210, 1020); ctx.bezierCurveTo(230, 900, 220, 700, 170, 640); ctx.closePath(); fill(shade(jf.jacke || "#3e7a6a", -0.1));
    box(70, 1420, 90, 40, 14, "#2d3238"); box(170, 1425, 90, 36, 14, "#5a4a3a");
    // Rahmen und Tür
    box(300, 500, 480, 990, 6, "#f4f1ea");
    const tuer = (x0, x1) => { box(x0, 530, x1 - x0, 950, 4, "#e6e0d4"); for (const [y0, h0] of [[580, 360], [990, 420]]) { ctx.beginPath(); A.rr(x0 + 40, y0, x1 - x0 - 80, h0, 8); ctx.lineWidth = 6; ctx.strokeStyle = rgba("#9a8f7a", 0.45); ctx.stroke(); } ctx.beginPath(); ctx.rect(x0, 530, x1 - x0, 950); A.schattiere(x0, x1, 0.18); box(x1 - 70, 1010, 50, 16, 8, "#b8bfc6"); box(x1 - 56, 1000, 16, 50, 6, "#9aa2a8"); };
    if (s.spalt) {
      box(330, 530, 420, 950, 0, "#101216");
      const dr = s.draussen ? A.fig(s.draussen) : null;
      ctx.save(); ctx.beginPath(); ctx.rect(630, 530, 120, 950); ctx.clip();
      box(630, 530, 120, 950, 0, "#22262d");
      if (dr) A.kopf(705, 840, 92, dr, { t, ausdruck: s.ausdruck_draussen || "froh", spricht: s._spricht && s.sprecher === s.draussen, drehung: -0.5, leuchten: A.augenWert(s, t), seed: 7 });
      if (dr && dr.mantel) { ctx.fillStyle = dr.jacke; ctx.fillRect(630, 960, 120, 520); if (dr.schal) box(630, 930, 120, 50, 10, dr.schal); }
      ctx.restore();
      tuer(330, 630);
      // Kette über dem Spalt
      for (let i = 0; i < 6; i++) { const q = i / 5, cx = lerp(612, 770, q), cy = 900 + Math.sin(q * Math.PI) * 26; ctx.beginPath(); ctx.ellipse(cx, cy, 15, 8, i % 2 ? 0.4 : -0.4, 0, Math.PI * 2); ctx.lineWidth = 7; ctx.strokeStyle = "#c3cad1"; ctx.stroke(); }
      box(760, 880, 26, 50, 6, "#9aa2a8");
      if (s.taschenlampe) { ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.fillStyle = lgrad(1080, 1900, 700, 840, [[0, "rgba(255,248,220,0.05)"], [1, "rgba(255,248,220,0.35)"]]); poly([[900, 1950], [1180, 1950], [760, 760], [640, 760]]); ctx.fill(); ctx.restore(); A.licht(700, 850, 380, "#fff4d0", 1.4); }
    } else {
      tuer(330, 750);
      if (s.kette) { for (let i = 0; i < 7; i++) { const q = i / 6, cx = lerp(700, 772, q), cy = 880 + Math.sin(q * Math.PI) * 50; ctx.beginPath(); ctx.ellipse(cx, cy, 13, 7, i % 2 ? 0.5 : -0.5, 0, Math.PI * 2); ctx.lineWidth = 6; ctx.strokeStyle = "#c3cad1"; ctx.stroke(); } box(686, 862, 30, 40, 6, "#9aa2a8"); }
      else { box(760, 870, 24, 44, 6, "#9aa2a8"); for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(772, 930 + i * 22, 7, 12, 0, 0, Math.PI * 2); ctx.lineWidth = 6; ctx.strokeStyle = "#c3cad1"; ctx.stroke(); } }
      // Türspion
      circle(540, 790, 16, "#b89a5a"); circle(540, 790, 9, "#2b3036"); circle(536, 786, 3, rgba("#ffffff", 0.7));
      if (s.flurlicht !== "aus" && nacht) { box(340, 1474, 400, 6, 3, "#ffe7b0"); A.licht(540, 1480, 300, "#ffe2a8", 0.8); }
    }
    // Klingel
    box(830, 740, 44, 64, 10, "#ece8e0"); circle(852, 772, 10, "#c3cad1");
    if (s.klingel) A.laermWellen(852, 772, t * 1.4, 0.45);
    if (s.licht === "an") { A.licht(540, 300, 1000, "#fff1d0", 1); }
    A.figurenZeigen(s, t, 1700, 1.05);
    A._dunkel = s.licht === "an" ? (nacht ? 0.15 : 0.05) : nacht ? 0.52 : 0.18;
  };

  // =====================================================================
  // SPION – Blick durch den Türspion (Fischauge)
  // =====================================================================
  SZ.spion = (s, t, p) => {
    const n = A.lichter.length;
    const img = (() => {
      const fn = () => {
        ctx.fillStyle = lgrad(0, 0, 0, H, [[0, "#a7acb0"], [1, "#7b8186"]]); ctx.fillRect(0, 0, W, H);
        poly([[0, 1480], [W, 1480], [W, H], [0, H]], "#666c72"); for (let k = -6; k <= 6; k++) line(540 + k * 60, 1480, 540 + k * 260, H, 4, rgba("#000", 0.12));
        box(0, 1460, W, 24, 0, "#5d6369");
        ellipse(540, 110, 130, 26, s.flurlicht === "an" ? "#fff3cf" : "#8a8a8a");
        A.text("17", 880, 620, 170, rgba("#c0392b", 0.85)); box(790, 720, 180, 16, 6, rgba("#c0392b", 0.85));
        for (let k = 0; k < 6; k++) line(60 + k * 40, 1000, 60 + k * 40, 1460, 6, "#555b62"); line(40, 1000, 300, 1000, 10, "#c0392b");
        box(80, 640, 200, 560, 6, "#5d6b74"); // Brandschutztür hinten links
        const liste = s.figuren || [];
        if (liste.length) { const f = A.fig(liste[0]); A.figur(540, s.nah ? 1980 : 1820, s.nah ? 1.95 : 1.55, f, { t, ausdruck: s.ausdruck || "neutral", spricht: s._spricht && s.sprecher === liste[0], leuchten: A.augenWert(s, t), pose: s.pose }); }
        if (s.flurlicht !== "an") { ctx.fillStyle = "rgba(10,14,24,0.42)"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = rgrad(160, 700, 20, 700, [[0, "rgba(60,255,150,0.25)"], [1, "rgba(60,255,150,0)"]]); ctx.fillRect(0, 0, W, H); }
      };
      const oc = (() => { if (!A._sp) { A._sp = document.createElement("canvas"); A._sp.width = W; A._sp.height = H; A._spc = A._sp.getContext("2d"); } return A._spc; })();
      oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, W, H); A.umleiten(oc, fn); return A._sp;
    })();
    A.lichter.length = n;
    ctx.fillStyle = rgrad(540, 880, 440, 1300, [[0, "#2a2018"], [1, "#07080b"]]); ctx.fillRect(-2000, -2000, 5000, 6000);
    const R = 440, cx = 540, cy = 880, k = 880 / W;
    for (let i = 0; i < 70; i++) {
      const q = i / 70, rr = R * (1 - q), sc = lerp(0.7, 1.3, Math.pow(q, 1.2));
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.clip();
      ctx.translate(cx, cy); ctx.scale(k * sc, k * sc); ctx.drawImage(img, -540, -1080); ctx.restore();
    }
    ctx.fillStyle = rgrad(cx, cy, R * 0.55, R, [[0, "rgba(0,0,0,0)"], [1, "rgba(0,0,0,0.85)"]]); circle(cx, cy, R, ctx.fillStyle);
    ctx.beginPath(); ctx.arc(cx, cy, R + 6, 0, Math.PI * 2); ctx.lineWidth = 18; ctx.strokeStyle = "#2a2219"; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, R - 30, 3.6, 4.4); ctx.lineWidth = 14; ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineCap = "round"; ctx.stroke();
    A._dunkel = 0;
  };

  // =====================================================================
  // FLUR – Treppenhausflur im 17. Stock: deine Tür links, Maras Tür rechts
  // =====================================================================
  SZ.flur = (s, t, p) => {
    ctx.fillStyle = lgrad(0, 0, 0, 1500, [[0, "#c3c6c8"], [1, "#9a9fa3"]]); ctx.fillRect(-1500, -1500, 4080, 3200);
    box(-1500, 1470, 4080, 800, 0, "#7a8085"); for (let x = -1500; x < 2600; x += 160) line(x, 1470, x - 80, 2300, 3, rgba("#000", 0.08)); box(-1500, 1456, 4080, 18, 0, "#6d7378");
    A.text(String(s.etage ?? 17), 540, 470, 190, rgba("#c0392b", 0.85)); box(450, 570, 180, 16, 6, rgba("#c0392b", 0.85));
    box(470, 250, 140, 70, 8, "#1f9c5a"); A.text("EXIT", 540, 286, 34, "#ffffff"); A.licht(540, 290, 520, "#3cff9a", 0.8);
    ellipse(540, 90, 110, 20, s.licht === "an" ? "#fff3cf" : "#8a8a8a");
    const tuer = (x, farbe, zustand, schild) => {
      box(x - 20, 620, 340, 860, 6, "#d9d6cf");
      if (zustand === "offen") {
        ctx.fillStyle = lgrad(0, 640, 0, 1480, [[0, "#ffe2b0"], [1, "#d9a86a"]]); ctx.fillRect(x, 640, 300, 840); A.licht(x + 150, 1000, 520, "#ffd9a0", 1.1);
        poly([[x, 640], [x + 70, 610], [x + 70, 1500], [x, 1480]], shade(farbe, -0.1));
      } else if (zustand === "spalt") {
        box(x, 640, 300, 840, 0, "#101216");
        if (s.augen_spalt) for (const sd of [-1, 1]) { ellipse(x + 272 + sd * 14, 920, 12, 16, "#eaf6ff"); circle(x + 272 + sd * 14, 922, 6, "#0e1a33"); }
        box(x, 640, 250, 840, 4, farbe); ctx.beginPath(); ctx.rect(x, 640, 250, 840); A.schattiere(x, x + 250, 0.2);
      } else {
        box(x, 640, 300, 840, 4, farbe); ctx.beginPath(); ctx.rect(x, 640, 300, 840); A.schattiere(x, x + 300, 0.2);
        circle(x + 150, 860, 12, "#b89a5a"); circle(x + 150, 860, 6, "#2b3036");
        box(x + 240, 1050, 46, 14, 7, "#b8bfc6");
      }
      box(x + 90, 760, 120, 36, 6, "#e9e4da"); A.text(schild, x + 150, 779, 22, "#4a4f57", "center", 700, "HUD");
      box(x + 20, 1480, 260, 26, 8, shade(farbe, -0.3));
    };
    tuer(110, "#8a6a52", s.links || "zu", "");
    tuer(670, "#6f8197", s.rechts || "zu", "M. & E.");
    A.objekt("kraeuter", 1040, 1400, 0.35, t);
    if (s.klopfen === "rechts") A.laermWellen(820, 1000, t * 1.3, 0.7);
    if (s.klopfen === "links") A.laermWellen(260, 1000, t * 1.3, 0.7);
    A.figurenZeigen(s, t, 1700, 0.95);
    A._dunkel = s.licht === "an" ? 0.08 : 0.5;
  };

  // =====================================================================
  // TREPPE – Blick die Treppe hinauf zum nächsten Absatz
  // =====================================================================
  SZ.treppe = (s, t, p) => {
    ctx.fillStyle = lgrad(0, 0, 0, 1900, [[0, "#9a9fa3"], [1, "#6f7479"]]); ctx.fillRect(-1500, -1500, 4080, 3600);
    box(260, 250, 560, 650, 0, "#aab0b4");
    if (s.erdgeschoss) { // Glastür nach draußen, Straßenlicht fällt herein
      box(420, 380, 300, 500, 8, "#3a4048"); ctx.fillStyle = lgrad(0, 400, 0, 880, [[0, "#1d2638"], [1, "#3a3f4a"]]); ctx.fillRect(436, 396, 268, 484); line(570, 396, 570, 880, 8, "#3a4048"); A.licht(570, 600, 520, "#ffd9a0", 0.9);
      A.text("EG", 330, 560, 120, rgba("#c0392b", 0.85));
    } else if (s.keller) { // Rohre an der Wand, nur grünes Notlicht
      for (const y of [330, 380]) box(260, y, 560, 22, 10, "#6d747b"); box(700, 330, 22, 560, 10, "#6d747b");
      A.text("K", 660, 600, 160, rgba("#c0392b", 0.7));
    } else A.text(String(s.etage ?? 22), 660, 560, 180, rgba("#c0392b", 0.85));
    box(330, 380, 140, 70, 8, "#1f9c5a"); A.text("EXIT", 400, 416, 30, "#ffffff"); A.licht(400, 420, 600, "#3cff9a", 0.9);
    box(240, 880, 600, 60, 0, "#7d8287");
    for (let k = 0; k < 12; k++) {
      const y = 1880 - k * 82, x0 = 120 + k * 12, x1 = 960 - k * 12;
      box(x0, y - 82, x1 - x0, 82, 2, shade("#8a9095", -k * 0.02)); box(x0, y - 82, x1 - x0, 14, 2, shade("#9aa0a5", -k * 0.02));
    }
    poly([[0, -400], [260, 250], [260, 940], [0, 2000]], "#7b8085"); poly([[1080, -400], [820, 250], [820, 940], [1080, 2000]], "#858a8f");
    line(940, 1880, 820, 900, 12, "#c0392b"); for (let k = 0; k < 8; k++) { const q = k / 7; line(lerp(930, 826, q), lerp(1880, 900, q), lerp(930, 826, q), lerp(1880, 900, q) + lerp(120, 60, q), 5, "#555b62"); }
    if (s.oben) { const f = A.fig(s.oben); A.figur(560, 905, 0.55, f, { t, ausdruck: s.ausdruck_oben || "froh", spricht: s._spricht && s.sprecher === s.oben, leuchten: f.art === "nox" ? (s.leuchten ? 1 : 0) : A.augenWert(s, t), pose: s.pose_oben, stoerung: 0 }); }
    A.figurenZeigen(s, t, 1830, 0.85);
    A._dunkel = s.licht === "an" ? 0.1 : s.keller ? 0.6 : 0.5;
  };

  // =====================================================================
  // KREUZUNG – Straße bei Nacht mit Zebrastreifen, Ampel, Laternen (oder Hauseingang)
  // =====================================================================
  SZ.kreuzung = (s, t, p) => {
    const zeit = s.zeit || "nacht", hc = HIMMEL[zeit] || HIMMEL.nacht, nacht = zeit === "nacht";
    ctx.fillStyle = lgrad(0, -200, 0, 1000, [[0, hc[0]], [1, hc[1]]]); ctx.fillRect(-1500, -1500, 4080, 3000);
    if (nacht) { const r = rnd(5); for (let i = 0; i < 40; i++) circle(r() * W, r() * 500 - 100, 1.5 + r() * 1.5, "rgba(255,255,255,0.6)"); }
    const r = rnd(43);
    if (s.eingang) { A.hauseingang(540, 1040, 1.0, t, { wand: nacht ? "#4a4e58" : "#8b8f98" }); box(-400, 250, 520, 800, 0, "#2f3442"); box(960, 250, 600, 800, 0, "#2f3442"); }
    else for (let x = -100; x < 1200;) { const w = 160 + r() * 160, h = 500 + r() * 300; box(x, 1040 - h, w, h + 10, 2, nacht ? "#2a3040" : "#8a91a0"); for (let yy = 1040 - h + 30; yy < 1000; yy += 70) for (let xx = x + 20; xx < x + w - 40; xx += 55) { const v = r(); box(xx, yy, 30, 40, 3, nacht ? (v < (s.fenster_an ? 0.75 : 0.25) ? "#e9b866" : "#1c2130") : rgba("#ffffff", 0.2)); if (s.fenster_an && v < 0.3 && nacht) { circle(xx + 15, yy + 24, 9, "#2a2018"); } } x += w + 10; }
    if (s.garage) { // Garageneinfahrt mit Seitentür im Haus gegenüber
      poly([[620, 1040], [960, 1040], [920, 820], [660, 820]], "#1a1d22"); box(660, 760, 260, 60, 6, "#4a4e58"); A.text("GARAGE", 790, 790, 34, "#d9d6cc");
      box(980, 760, 110, 280, 6, "#5d6b74"); box(1065, 900, 12, 30, 4, "#c3cad1"); A.licht(1035, 760, 200, "#ffd9a0", 0.7);
    }
    box(-400, 1030, 1900, 50, 0, "#5c6068");
    box(-400, 1080, 1900, 430, 0, "#33363d");
    if (!s.eingang) for (let k = 0; k < 6; k++) box(380, 1100 + k * 68, 320, 36, 4, "#d9d6cc");
    else for (let k = -2; k < 8; k++) box(k * 200, 1290, 110, 12, 4, "#d7d08a");
    box(-400, 1510, 1900, 600, 0, "#55595f"); box(-400, 1506, 1900, 14, 0, "#8a8e95");
    // Laternen
    const laterne = (x, y0, y1, an = true) => { line(x, y1, x, y0, 12, "#2b2f36"); box(x - 50, y0 - 20, 100, 28, 10, "#2b2f36"); if (an) { ellipse(x, y0 + 10, 40, 10, "#ffe7b0"); ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.fillStyle = lgrad(0, y0, 0, y1, [[0, "rgba(255,225,170,0.35)"], [1, "rgba(255,225,170,0.04)"]]); poly([[x - 30, y0 + 10], [x + 30, y0 + 10], [x + 160, y1], [x - 160, y1]]); ctx.fill(); ctx.restore(); A.licht(x, y0 + 60, 480, "#ffd9a0", 1.1); } };
    if (!s.eingang) laterne(s.gx ?? 230, 560, 1040); else { ellipse(540, 600, 50, 12, "#ffe7b0"); A.licht(540, 680, 420, "#ffd9a0", 1); }
    laterne(1010, 880, 1520);
    // Auto (Maras roter Wagen) oder parkendes Auto mit Alarm
    if (s.auto) { ctx.save(); ctx.translate(950, 1200); ctx.scale(0.8, 0.8); box(-170, -60, 340, 90, 30, "#b5452f"); box(-110, -125, 220, 80, 30, shade("#b5452f", -0.08)); box(-95, -112, 90, 58, 12, "#9cc0d8"); box(10, -112, 85, 58, 12, "#9cc0d8"); circle(-100, 30, 36, "#222"); circle(100, 30, 36, "#222"); ctx.restore(); }
    // Ampel
    const gruen = s.ampel === "gruen";
    line(860, 1520, 860, 1060, 14, "#2b2f36"); box(828, 900, 64, 160, 14, "#1d2128");
    circle(860, 945, 20, gruen ? "#3a1a1a" : "#ff4a3a"); circle(860, 1015, 20, gruen ? "#4dff8a" : "#173a22");
    A.licht(860, gruen ? 1015 : 945, 260, gruen ? "#4dff8a" : "#ff4a3a", 1);
    // Figuren in der Ferne, auf dem Zebrastreifen
    const fern = (namen, xs, y, sk) => String(namen).split(",").forEach((nm, i) => { const f = A.fig(nm); A.figur(xs[i] ?? 540, y, sk, f, { t: t + i, ausdruck: s.ausdruck_fern || "froh", leuchten: A.augenWert(s, t), pose: s.pose_fern, spricht: s._spricht && s.sprecher === nm, seed: 9 + i }); });
    if (s.gegenueber) fern(s.gegenueber, [s.gx ?? 230], 1060, 0.42);
    if (s.zebra) fern(s.zebra, [540], 1360, 0.56);
    if (s.alarm) { const an = Math.sin(t * 9) > 0; circle(820, 1150, 16, an ? "#ffb347" : "#5a4020"); if (an) A.licht(820, 1150, 260, "#ffb347", 1.2); A.laermWellen(950, 1150, t, 0.9); }
    if (s.taschenlampe) { const tx = s.zebra ? 540 : s.gx ?? 230, ty = s.zebra ? 1360 - 500 * 0.56 : 1060 - 500 * 0.42; ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.fillStyle = lgrad(150, 1900, tx, ty, [[0, "rgba(255,248,220,0.05)"], [1, "rgba(255,248,220,0.3)"]]); poly([[60, 1950], [260, 1950], [tx + 50, ty], [tx - 50, ty]]); ctx.fill(); ctx.restore(); A.licht(tx, ty, 260, "#fff4d0", 1.2); }
    A.figurenZeigen(s, t, 1880, 0.72);
    A._dunkel = nacht ? 0.52 : zeit === "abend" ? 0.3 : 0;
  };

  // =====================================================================
  // FASSADE – Außenwand am Badfenster, Nox klettert (Regen)
  // =====================================================================
  SZ.fassade = (s, t, p) => {
    ctx.fillStyle = lgrad(0, -200, 0, 2100, [[0, "#323848"], [1, "#22262f"]]); ctx.fillRect(-1500, -1500, 4080, 3600);
    for (let x = -1500; x < 2600; x += 270) line(x, -1500, x, 2200, 4, rgba("#ffffff", 0.05));
    for (let y = -1500; y < 2200; y += 360) line(-1500, y, 2600, y, 4, rgba("#ffffff", 0.05));
    const r = rnd(12);
    for (const [wx, wy] of [[-200, 200], [760, 200], [760, 1300], [-200, 1300], [760, 650]]) { box(wx, wy, 300, 420, 8, "#1b1f28"); if (r() < 0.4) { box(wx + 10, wy + 10, 280, 400, 6, "#e9b866"); A.licht(wx + 150, wy + 200, 300, "#ffc66b", 0.7); } }
    // dein Badfenster (offen, innen Fliesen und Licht)
    const fx = 200, fy = 560, fw = 330, fh = 440;
    box(fx - 20, fy - 20, fw + 40, fh + 40, 8, "#e9e6df");
    ctx.save(); ctx.beginPath(); ctx.rect(fx, fy, fw, fh); ctx.clip(); ctx.fillStyle = "#cfdde2"; ctx.fillRect(fx, fy, fw, fh); for (let x = fx; x < fx + fw; x += 70) line(x, fy, x, fy + fh, 3, rgba("#9fb0b6", 0.7)); for (let y = fy; y < fy + fh; y += 70) line(fx, y, fx + fw, y, 3, rgba("#9fb0b6", 0.7)); box(fx + 180, fy + 120, 120, 170, 10, "#c5d6dd"); ctx.restore();
    A.licht(fx + fw / 2, fy + fh / 2, 560, "#fff1d0", 1.1);
    poly([[fx, fy], [fx - 110, fy + 40], [fx - 110, fy + fh - 40], [fx, fy + fh]], "#e9e6df"); poly([[fx - 14, fy + 26], [fx - 96, fy + 56], [fx - 96, fy + fh - 56], [fx - 14, fy + fh - 26]], rgba("#9fc0d8", 0.35));
    box(fx - 34, fy + fh + 8, fw + 68, 26, 6, "#d9d6cf");
    A.objekt("plastikpflanze", fx + 70, fy + fh - 44, 0.45, t);
    if (s.regen) for (let i = 0; i < 26; i++) { const x = r() * W, y = ((r() * H + t * 400) % H); line(x, y, x, y + 60, 3, rgba("#9fc0d8", 0.25)); }
    for (let i = 0; i < 7; i++) { const x = r() * W; circle(x, 1880 + r() * 80, 30 + r() * 40, rgba(r() < 0.5 ? "#ffd27a" : "#ff8a5a", 0.35)); }
    const nx = s.nox_x ?? 700, ny = s.nox_y ?? 1250, ns = s.nox_s || 1.5, g = ns * 0.33;
    if (s.nox !== false) A.nox(nx, ny, ns, A.fig("nox"), noxOpt(s, t, { pose: s.rutscht ? "rutscht" : (s.posen || {}).nox || "klettert" }));
    if (s.hand) { const jf = A.fig("du"), hx = nx - 150 * g, hy = ny - 520 * g; capsule(fx + fw - 40, fy + fh - 90, hx, hy, 40, 34); fill(jf.jacke); capsule(fx + fw - 40, fy + fh - 90, hx, hy, 40, 34); A.schattiere(fx + fw - 80, hx + 40, 0.25); circle(hx, hy, 34, jf.haut); }
    if (s.regen) A.regen(t, 180);
    A._dunkel = 0.42;
  };

  // =====================================================================
  // TIEFBLICK – aus dem Badfenster 17 Stockwerke nach unten auf die Straße
  // =====================================================================
  SZ.tiefblick = (s, t, p) => {
    ctx.fillStyle = "#1a1f1c"; ctx.fillRect(-1500, -1500, 4080, 3600);
    box(80, -1500, 920, 3600, 0, "#3f434b"); box(230, -1500, 620, 3600, 0, "#2a2d33");
    for (let y = -1500; y < 2200; y += 140) box(534, y, 12, 70, 4, "#c9c37a");
    for (const [x, y, c] of [[280, 300, "#3d6c99"], [700, 520, "#8a8e95"], [280, 1500, "#b5452f"], [700, 1650, "#3a3f47"]]) { box(x, y, 110, 230, 30, c); box(x + 14, y + 40, 82, 50, 10, rgba("#9cc0d8", 0.5)); }
    const lx = 760, ly = 1120;
    ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.fillStyle = rgrad(lx, ly, 10, 330, [[0, "rgba(255,225,170,0.55)"], [1, "rgba(255,225,170,0)"]]); ctx.fillRect(lx - 330, ly - 330, 660, 660); ctx.restore();
    A.licht(lx, ly, 420, "#ffd9a0", 1.2); circle(lx + 40, ly - 30, 14, "#2b2f36");
    if (!s.leer) {
      const mann = () => { ctx.save(); ctx.translate(lx - 40, ly + 30); ctx.scale(2.2, 2.2); ellipse(26, 40, 40, 18, "rgba(0,0,0,0.35)"); ellipse(0, 0, 48, 28, "#6c7177"); circle(0, -4, 20, s.schaut_hoch ? "#e3bfa0" : "#8d8f93"); if (s.schaut_hoch) { circle(-7, -8, 3, "#2a2630"); circle(7, -8, 3, "#2a2630"); } ctx.restore(); };
      if (s.flimmern) A.glitch(mann, null, 0.9, t); else mann();
    }
    // Fensterbank im Vordergrund
    box(-200, 1690, 1480, 300, 0, "#e6e1d8"); box(-200, 1680, 1480, 20, 0, "#f3f1ec");
    A.objekt("plastikpflanze", 880, 1610, 1.1, t);
    if (s.regen) A.regen(t, 120);
    A._dunkel = 0.38;
  };

  // =====================================================================
  // KÜCHE – Arbeitsplatte, Herd mit Uhr, Fenster zum Hof, Tisch mit Tassen
  // =====================================================================
  SZ.kueche = (s, t, p) => {
    const zeit = s.zeit || "tag", nacht = zeit === "nacht", hc = HIMMEL[zeit] || HIMMEL.tag;
    ctx.fillStyle = lgrad(0, 0, 0, 1500, [[0, "#e6ddcf"], [1, "#cdbfac"]]); ctx.fillRect(-1500, -1500, 4080, 3200);
    box(470, 880, 700, 270, 0, "#eef0ec"); for (let x = 470; x < 1170; x += 70) line(x, 880, x, 1150, 3, rgba("#b9c2bd", 0.7)); for (let y = 880; y < 1150; y += 70) line(470, y, 1170, y, 3, rgba("#b9c2bd", 0.7));
    box(480, 500, 640, 280, 8, "#8a9a8e"); for (let k = 1; k < 4; k++) line(480 + k * 160, 510, 480 + k * 160, 770, 4, shade("#8a9a8e", -0.2)); for (let k = 0; k < 4; k++) box(540 + k * 160, 730, 40, 10, 5, "#d9d6cf");
    // Fenster zum Hof
    const fx = 70, fy = 420, fw = 340, fh = 460;
    box(fx - 20, fy - 20, fw + 40, fh + 40, 8, "#f3f1ec");
    ctx.save(); ctx.beginPath(); ctx.rect(fx, fy, fw, fh); ctx.clip(); ctx.fillStyle = lgrad(0, fy, 0, fy + fh, [[0, hc[0]], [1, hc[1]]]); ctx.fillRect(fx, fy, fw, fh);
    box(fx, fy + 40, fw, fh, 0, nacht ? "#2a2f3e" : "#a9a49a"); const r = rnd(8); for (let yy = fy + 70; yy < fy + fh; yy += 110) for (let xx = fx + 20; xx < fx + fw; xx += 110) box(xx, yy, 60, 80, 4, nacht ? (r() < 0.2 ? "#e9b866" : "#1c2130") : rgba("#ffffff", 0.25));
    if (zeit === "morgen") { ctx.fillStyle = "rgba(255,210,170,0.25)"; ctx.fillRect(fx, fy, fw, fh); }
    ctx.restore(); line(fx + fw / 2, fy, fx + fw / 2, fy + fh, 12, "#f3f1ec"); box(fx - 30, fy + fh + 12, fw + 60, 24, 6, "#e6e1d8");
    if (!nacht) A.licht(fx + fw / 2, fy + fh / 2, 600, zeit === "morgen" ? "#ffd8b0" : "#dfe9ff", 0.6);
    // Arbeitsplatte, Herd, Wasserkocher
    box(470, 1190, 650, 290, 6, "#9aa99e"); for (let k = 1; k < 4; k++) line(470 + k * 160, 1200, 470 + k * 160, 1470, 4, shade("#9aa99e", -0.2));
    box(460, 1150, 670, 44, 6, "#b8a48c");
    box(830, 1220, 180, 230, 8, "#2d3238"); box(860, 1238, 120, 42, 6, "#0d1a12");
    A.text(s.uhr || "04:10", 920, 1260, 30, "#6dff9a", "center", 700, "HUD"); A.licht(920, 1260, 120, "#6dff9a", 0.8);
    box(570, 1040, 90, 110, 30, "#c94f3d"); box(640, 1060, 40, 16, 8, "#a33a2c"); box(585, 1030, 60, 16, 8, "#2d3238");
    if (s.dampf) for (let i = 0; i < 4; i++) { const w = (t * 0.5 + i / 4) % 1; circle(600 + Math.sin(w * 6 + i) * 20, 1020 - w * 200, 14 + w * 30, rgba("#ffffff", 0.35 * (1 - w))); }
    // Tisch
    if (s.tisch !== false) {
      box(110, 1330, 480, 30, 10, "#b48a62"); box(140, 1360, 24, 150, 8, "#9a7452"); box(536, 1360, 24, 150, 8, "#9a7452");
      const n = Number(s.tassen || 0); for (let i = 0; i < n; i++) A.objekt("tasse", 250 + i * 150, 1278, 0.34, t);
      if (s.kaffeedose) A.objekt("kaffeedose", 520, 1262, 0.3, t);
    }
    box(-1500, 1480, 4080, 800, 0, "#b9ab96"); for (let x = -1500; x < 2600; x += 140) line(x, 1480, x - 80, 2300, 3, rgba("#000", 0.07));
    line(540, -200, 540, 150, 4, "#444"); poly([[490, 150], [590, 150], [620, 200], [460, 200]], "#4a4f57");
    if (s.licht === "an") { ellipse(540, 202, 60, 10, "#fff1c4"); A.licht(540, 300, 900, "#ffe2a8", 1); }
    if (s.objekt) A.objekt(s.objekt, s.objekt_x ?? 540, s.objekt_y ?? 1400, s.objekt_s ?? 0.5, t);
    A.figurenZeigen(s, t, 1700, 0.95);
    A._dunkel = s.licht === "an" ? (nacht ? 0.15 : 0.03) : nacht ? 0.52 : zeit === "morgen" ? 0.22 : 0.08;
  };
})();

/* ---------- Lichtbild, Handy, Erweiterungen bestehender Kulissen ---------- */
(() => {
  const { box, circle, ellipse, poly, line, shade, rgba, lgrad, rgrad, fill, capsule, mix, rnd, clamp, lerp, E } = A;
  const W = A.W, H = A.H, SZ = A.SZ, BLAU = "#59c7ff";

  const lw = (name, w = W, h = H) => { const k = "_lw_" + name; if (!A[k]) { const c = document.createElement("canvas"); c.width = w; c.height = h; A[k] = c.getContext("2d"); } return A[k]; };
  // Ein Inhalt (Personen, Orte, Zahlen) in 860 × 640, danach blau eingefärbt
  const PW = 860, PH = 640;
  function zufallsMensch(i) {
    const r = rnd(i * 13 + 5);
    const haut = ["#f2cfb3", "#e9c3a0", "#c99772", "#a8764e", "#f3d9c4"], haar = ["kurz", "lang", "wuschel", "glatze", "seite", "dutt"], hf = ["#3a2b24", "#7a4b2a", "#2b2522", "#c9c4bd", "#a4532e"], jk = ["#4f6e8c", "#8c3f45", "#55603f", "#6c7177", "#3e7a6a"];
    return { ...A.STANDARD, haut: haut[Math.floor(r() * 5)], haar: haar[Math.floor(r() * 6)], haare: hf[Math.floor(r() * 5)], jacke: jk[Math.floor(r() * 5)] };
  }
  const kopfVon = (name, x, y, R, t, seed) => {
    if (name === "nox") { ctx.save(); ctx.translate(x, y + R * 1.25); A.nox(0, 0, R / 120 / 0.33 * 0.62, A.fig("nox"), { t, ausdruck: "neutral", phase: seed }); ctx.restore(); return; }
    if (name === "wesen") { ellipse(x, y, R * 0.9, R, "#9fb2cc"); for (const sd of [-1, 1]) { ellipse(x + sd * R * 0.35, y - R * 0.1, R * 0.22, R * 0.3, "#ffffff"); circle(x + sd * R * 0.35, y - R * 0.05, R * 0.1, "#1d2128"); } return; }
    A.kopf(x, y, R, name ? A.fig(name) : zufallsMensch(seed), { t, ausdruck: "neutral", seed });
  };
  function inhalt(s, t, p) {
    const art = String(s.inhalt || "gesichter");
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, PW, PH);
    if (art === "gesichter" || art === "liste") {
      const feste = {}; for (const e of String(s.zeige || "").split(",").filter(Boolean)) { const [n, i] = e.split("@"); feste[Number(i)] = n; }
      const off = s.scroll ? (t * (Number(s.scroll) || 60)) % 160 : 0;
      for (let row = -1; row < 5; row++) for (let c = 0; c < 6; c++) {
        const i = (row + 1) * 6 + c, x = 72 + c * 143, y = 80 + row * 160 - off;
        if (y < -80 || y > PH + 80) continue;
        box(x - 62, y - 66, 124, 140, 14, "rgba(255,255,255,0.10)");
        const nm = feste[i] ?? (i % 7 === 3 ? "wesen" : null);
        kopfVon(nm, x, y - 4, 46, t, i);
        if (s.markiere && nm === s.markiere) { ctx.beginPath(); A.rr(x - 66, y - 70, 132, 148, 16); ctx.lineWidth = 8; ctx.strokeStyle = "#ffffff"; ctx.stroke(); A.text("GEFANGEN", x, y + 60, 20, "#ffffff", "center", 700, "HUD"); }
        if (s.neu && nm === s.neu) { const pu = 0.5 + 0.5 * Math.sin(t * 6); ctx.beginPath(); A.rr(x - 66, y - 70, 132, 148, 16); ctx.lineWidth = 10; ctx.strokeStyle = rgba("#ffffff", 0.5 + 0.5 * pu); ctx.stroke(); A.text("NEU", x, y - 82, 26, "#ffffff", "center", 700, "HUD"); }
      }
      if (s.countdown != null) { box(PW - 170, 20, 150, 110, 18, "rgba(0,0,0,0.6)"); A.text(String(s.countdown), PW - 95, 76, 80, "#ffffff"); }
    } else if (art === "gesicht") {
      kopfVon(s.gesicht || "elias", PW / 2, PH / 2 - 20, 190, t, 3);
      if (s.label) { box(PW / 2 - 200, PH - 110, 400, 70, 14, "rgba(255,255,255,0.15)"); A.text(String(s.label).toUpperCase(), PW / 2, PH - 74, 40, "#ffffff"); }
    } else if (art === "orte") {
      const k = Math.floor(t / 1.6) % 3;
      ["parkplatz", "haltestelle", "eingang"].forEach((o, i) => {
        const x = 30 + i * 280, y = 140, a = i === k ? 1 : 0.45;
        ctx.save(); ctx.globalAlpha = a; box(x, y, 250, 330, 14, "rgba(255,255,255,0.12)");
        ctx.beginPath(); ctx.rect(x, y, 250, 330); ctx.clip();
        if (o === "parkplatz") { for (let j = 0; j < 3; j++) { box(x + 20 + j * 75, y + 60, 60, 120, 12, "#c3cbd3"); line(x + 10 + j * 75, y + 40, x + 10 + j * 75, y + 220, 4, "#ffffff"); } }
        if (o === "haltestelle") { box(x + 40, y + 80, 170, 150, 6, "rgba(255,255,255,0.4)"); line(x + 40, y + 80, x + 40, y + 290, 8, "#ffffff"); box(x + 160, y + 40, 50, 50, 25, "#ffffff"); A.text("H", x + 185, y + 66, 34, "#000"); }
        if (o === "eingang") { ctx.translate(x + 125, y + 310); ctx.scale(0.32, 0.32); A.hauseingang(0, 0, 1, t); }
        ctx.restore();
      });
    } else if (art === "eingang") {
      ctx.save(); if (s.unscharf) ctx.filter = "blur(7px)"; A.hauseingang(PW / 2 + 40, PH - 30, s.scharf ? 1.0 : 0.95, t); ctx.restore();
    } else if (art === "countdown") {
      A.text(String(s.countdown ?? 10), PW / 2, PH / 2, 360, "#ffffff");
    } else if (art === "tonwelle") {
      if (s.mit) { ctx.save(); ctx.globalAlpha = 0.45; kopfVon(s.mit, PW / 2, 230, 150, t, 2); ctx.restore(); }
      for (let i = 0; i < 44; i++) { const h = 20 + Math.abs(Math.sin(t * 7 + i * 0.7) * Math.sin(t * 2.3 + i)) * 150 * (s._spricht ? 1 : 0.25); box(30 + i * 18.5, 500 - h / 2, 11, h, 5, "#ffffff"); }
    } else if (art === "silhouette" || art === "raum") {
      for (let k = 0; k < 9; k++) line(60 + k * 95, 40, 60 + k * 95, PH - 40, 6, "rgba(255,255,255,0.25)");
      const m = new DOMMatrix();
      const sil = (() => { const oc = lw("sil"); oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, W, H); A.umleiten(oc, () => A.sammler(PW / 2, PH - 20, 0.75, { t })); oc.globalCompositeOperation = "source-atop"; oc.fillStyle = "#d9dde3"; oc.fillRect(0, 0, W, H); oc.globalCompositeOperation = "source-over"; return oc.canvas; })();
      ctx.save(); if (s.unscharf !== false) ctx.filter = "blur(3px)"; ctx.drawImage(sil, 0, 0); ctx.restore();
      if (s.ueberlagern) { ctx.save(); ctx.globalAlpha = E.sanft(clamp(p * 1.6 - 0.3, 0, 1)); A.figur(PW / 2, PH - 20, 0.6, A.fig("mantel"), { t, ausdruck: "froh" }); ctx.restore(); }
    }
  }
  SZ.lichtbild = (s, t, p) => {
    const n = A.lichter.length;
    A.unscharf(s.ort || "wohnung", { ...s, zeit: s.zeit || "nacht" }, t, 14, 0.4);
    A.lichter.length = n;
    const oc = lw("inhalt");
    oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, W, H); oc.filter = "none";
    A.umleiten(oc, () => inhalt(s, t, p)); A.lichter.length = n;
    const X = 110, Y = 520, fl = 0.86 + 0.08 * Math.sin(t * 13) * Math.sin(t * 3.1);
    // Lichtstrahl von der Kapsel nach oben
    ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.fillStyle = lgrad(0, 1540, 0, Y + PH, [[0, rgba(BLAU, 0.5)], [1, rgba(BLAU, 0.06)]]); poly([[470, 1540], [610, 1540], [X + PW, Y + PH], [X, Y + PH]]); ctx.fill(); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = fl;
    ctx.filter = "grayscale(1) brightness(1.6) sepia(1) hue-rotate(165deg) saturate(3) brightness(1.1)";
    ctx.drawImage(oc.canvas, 0, 0, PW, PH, X, Y, PW, PH); ctx.restore();
    ctx.save(); for (let y = Y; y < Y + PH; y += 6) box(X, y, PW, 2, 0, "rgba(0,10,30,0.25)"); ctx.restore();
    ctx.save(); A.rr(X, Y, PW, PH, 18); ctx.lineWidth = 4; ctx.strokeStyle = rgba(BLAU, 0.6); ctx.stroke(); ctx.restore();
    for (const [cx, cy, sx, sy] of [[X, Y, 1, 1], [X + PW, Y, -1, 1], [X, Y + PH, 1, -1], [X + PW, Y + PH, -1, -1]]) { line(cx, cy, cx + sx * 60, cy, 8, rgba(BLAU, 0.9)); line(cx, cy, cx, cy + sy * 60, 8, rgba(BLAU, 0.9)); }
    A.objekt(s.kapsel === "aus" ? "kapsel_aus" : "kapsel", 540, 1550, 1.0, t);
    A.licht(540, 900, 900, BLAU, 0.9);
    A._dunkel = 0;
  };

  // =====================================================================
  // HANDY – Hand mit Handy, Empfangsbalken, Nachricht; Hintergrund unscharf
  // =====================================================================
  const umbrechen = (txt, maxW, size) => { ctx.font = `700 ${size}px HUD`; const out = []; let z = ""; for (const w of String(txt).split(" ")) { const v = z ? z + " " + w : w; if (ctx.measureText(v).width > maxW && z) { out.push(z); z = w; } else z = v; } if (z) out.push(z); return out; };
  SZ.handy = (s, t, p) => {
    const dn = A.unscharf(s.ort || "wohnung", s, t, 14, 0.7);
    ctx.save(); ctx.translate(540, 1000); ctx.rotate(-0.06);
    const jf = A.fig(s.wer || "du");
    capsule(330, 1150, 120, 430, 110, 90); fill(shade(jf.jacke, -0.05));
    ellipse(90, 380, 150, 170, jf.haut);
    box(-230, -440, 460, 880, 56, "#1d2128"); box(-210, -416, 420, 832, 40, "#1c2a3e");
    ctx.save(); A.rr(-210, -416, 420, 832, 40); ctx.clip();
    ctx.fillStyle = lgrad(0, -416, 0, 416, [[0, "#2c4466"], [1, "#16202e"]]); ctx.fillRect(-210, -416, 420, 832);
    const netzVon = s.netz ?? 4, netzBis = s.netz_bis ?? netzVon, nz = Math.round(lerp(netzVon, netzBis, clamp(p * 2 - 0.4, 0, 1)));
    for (let k = 0; k < 4; k++) box(-180 + k * 22, -360 - k * 10, 14, 16 + k * 10, 3, k < nz ? "#ffffff" : "rgba(255,255,255,0.25)");
    if (nz === 0) A.text("KEIN NETZ", -60, -366, 24, "#ff8a7a", "left", 700, "HUD");
    const akku = s.akku ?? 34; box(120, -378, 60, 26, 6, "rgba(255,255,255,0.3)"); box(124, -374, 52 * akku / 100, 18, 4, akku < 25 ? "#ff5a4a" : "#ffffff");
    A.text(s.uhrzeit || "23:19", 0, -230, 120, "#ffffff", "center", 700, "HUD");
    if (s.nachricht) {
      const zeilen = umbrechen(s.nachricht, 300, 32), h = 70 + zeilen.length * 42, ein = E.pop(clamp(t / 0.4, 0, 1));
      ctx.save(); ctx.translate(0, -40); ctx.scale(ein, ein);
      box(-180, -40, 360, h, 26, "rgba(255,255,255,0.92)");
      A.text(String(s.von || "Unbekannt").toUpperCase(), -150, -10, 24, "#2f6fb5", "left", 700, "HUD");
      zeilen.forEach((z, i) => A.text(z, -150, 34 + i * 42, 32, "#1d2128", "left", 700, "HUD"));
      ctx.restore();
    }
    if (nz === 0 && netzVon > 0 && p > 0.3) { ctx.globalAlpha = 0.25 + 0.15 * Math.sin(t * 8); box(-210, -416, 420, 832, 0, "#ff5a4a"); ctx.globalAlpha = 1; }
    ctx.restore();
    ellipse(190, 160, 50, 90, shade(jf.haut, -0.04), 0.4);
    for (let k = 0; k < 3; k++) box(-262, 120 + k * 78, 70, 62, 30, shade(jf.haut, -0.02 * k));
    ctx.restore();
    A.licht(540, 960, 700, "#cfe3ff", 1.1);
    A._dunkel = (dn ?? 0) * 0.85;
  };

  // ---------- Skyline: Schiffe ----------
  const skylineAlt = SZ.skyline;
  SZ.skyline = (s, t, p) => {
    skylineAlt(s, t, p);
    const sch = s.schiff;
    if (sch === "sammler" || sch === "tuer") A.sammlerschiff(540, 330, 0.62, t, { rot: -0.04 });
    if (sch === "tuer") { box(430, 340, 60, 40, 6, "#cfe9ff"); A.licht(460, 360, 260, "#cfe9ff", 1.2); A.nox(470, lerp(390, 600, E.rein(clamp(p * 1.3, 0, 1))), 0.4, A.fig("nox"), { t, pose: "springt", ausdruck: "schreck" }); }
    if (sch === "rettung") A.rettungsschiff(lerp(-200, 520, E.raus(clamp(p * 1.2, 0, 1))), 380, 0.55, t);
    if (sch === "beide") { const q = E.rein(clamp(p, 0, 1)); A.rettungsschiff(lerp(560, 800, q), lerp(420, -200, q), 0.5, t); A.sammlerschiff(lerp(300, 700, q), lerp(560, 0, q), 0.45, t, { rot: -0.4 }); }
  };

  // ---------- Hochhaus: Figuren im Treppenhaus, z.B. treppe="mantel@17,nox@24" ----------
  const hochhausAlt = SZ.hochhaus;
  SZ.hochhaus = (s, t, p) => {
    hochhausAlt(s, t, p);
    for (const e of String(s.treppe || "").split(",").filter(Boolean)) {
      const [name, n] = e.split("@"), y = A.etageY(Number(n)) + 150 - 22, f = A.fig(name);
      A.figur(880, y, f.art === "nox" ? 0.6 : 0.3, f, { t, pose: s.pose_treppe || (f.art === "nox" ? "steht" : "geht"), leuchten: f.art === "nox" ? (s.leuchten ? 1 : 0.6) : 0, ausdruck: "neutral" });
    }
  };

  // ---------- Nahaufnahme von Nox (und Augenleuchten für Menschen über szenen.js) ----------
  const gesichtAlt = SZ.gesicht;
  SZ.gesicht = (s, t, p) => {
    const f = A.fig(s.figur);
    if (f.art !== "nox") return gesichtAlt(s, t, p);
    const dn = A.unscharf(s.ort || "wohnung", s, t, 12, 1);
    ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(-2000, -2000, 5000, 6000);
    A.nox(540, 1700 + Math.sin(t * 1.5) * 6, 5.6, f, { t, ausdruck: s.ausdruck, spricht: s._spricht && (s.sprecher ? s.sprecher === s.figur : true) && s.stumm !== true, leuchten: s.leuchten === true ? 1 : s.leuchten || 0, blick: s.blick, pose: s.pose || "steht", halt: s.haelt && String(s.haelt).replace(/^nox:/, "") });
    if (s.licht === "taschenlampe") A.licht(700, 700, 700, "#fff4d0", 1.1);
    A._dunkel = s.dunkel ?? (dn ?? 0) * 0.75;
  };

  // ---------- Dach: Dachtür, Schiffe, Kegel, Notruf, Deckung hinter dem Tank ----------
  const tankMalen = s => {
    const tx = 40, ty = 820;
    box(tx + 30, 1180, 20, 80, 4, "#5d6268"); box(tx + 300, 1180, 20, 80, 4, "#5d6268");
    box(tx, ty, 360, 380, 40, "#a3abb3"); ctx.beginPath(); ctx.rect(tx, ty, 360, 380); A.schattiere(tx, tx + 360, 0.3);
    for (let k = 1; k < 4; k++) box(tx, ty + k * 95, 360, 8, 2, "#8d959d");
  };
  const dachVor = (s, t) => {
    if (s.dachtuer) {
      box(720, 760, 330, 430, 8, "#7d8288"); box(700, 740, 370, 34, 6, "#5d6268"); ctx.beginPath(); ctx.rect(720, 760, 330, 430); A.schattiere(720, 1050, 0.25);
      if (s.dachtuer === "offen") { ctx.fillStyle = lgrad(0, 860, 0, 1190, [[0, "#cfe9d8"], [1, "#6fae8a"]]); ctx.fillRect(800, 860, 170, 330); A.licht(885, 1020, 420, "#3cff9a", 0.9); poly([[800, 860], [740, 840], [740, 1210], [800, 1190]], "#5d6b74"); }
      else { box(800, 860, 170, 330, 6, "#5d6b74"); box(940, 1020, 18, 40, 6, "#2d3238"); }
    }
    if (s.beete) for (let i = 0; i < 2; i++) { box(470 + i * 200, 1250, 170, 70, 10, "#7a5a40"); for (let k = 0; k < 6; k++) circle(490 + i * 200 + k * 26, 1245 - (k % 2) * 10, 18, ["#4f9a52", "#6cb35a"][k % 2]); }
    if (s.schiff === "sammler" || s.schiff === "beide") A.sammlerschiff(s.schiff_x ?? 560, s.schiff_y ?? 250, s.schiff_s ?? 1.15, t, { unten: true, rot: -0.03 });
    if (s.schiff === "kommt") { const q = E.raus(clamp(t / 4, 0, 1)); A.sammlerschiff(lerp(1700, 560, q), lerp(120, 250, q), 1.15, t, { unten: true, rot: -0.03 }); }
    if (s.schiff === "rettung" || s.schiff === "beide") A.rettungsschiff(s.rettung_x ?? 300, s.rettung_y ?? 300, s.rettung_s ?? 0.75, t);
    if (s.hinter_tank) {
      String(s.hinter_tank).split(",").forEach((nm, i) => { const f = A.fig(nm); A.figur((s.tank_pos ? String(s.tank_pos).split(":").map(Number)[i] : null) ?? 330 + i * 150, 1200, f.art === "nox" ? 0.85 : 0.7, f, { t: t + i, pose: (s.posen || {})[nm], ausdruck: (s.ausdruecke || {})[nm], halt: (String(s.haelt || "").match(new RegExp(nm + ":(\\w+)")) || [])[1], leuchten: f.art === "nox" ? (s.leuchten === true ? 1 : s.leuchten || 0) : 0, spricht: s._spricht && s.sprecher === nm }); });
      if (s.deckung !== false) tankMalen(s);
    }
  };
  const dachNach = (s, t) => {
    if (s.suchkegel) { const ziel = s.suchkegel === true ? 540 + Math.sin(t * 0.8) * 380 : Number(s.suchkegel); A.kegel(s.schiff_x ?? 560, (s.schiff_y ?? 250) + 70, ziel, 1520, 230, "#e9f2ff", 0.9); }
    if (s.blaukegel) { const zx = s.blaukegel === true ? 640 : Number(s.blaukegel); A.kegel(s.rettung_x ?? 300, (s.rettung_y ?? 300) + 80, zx, 1640, 260, "#9fdcff", 1.1); if (s.silhouetten) for (let i = 0; i < 4; i++) { const q = ((t * 0.25 + i / 4) % 1); A.noxLeute(zx - 120 + i * 80, lerp(1600, 500, q), 1, t + i, 0.5 * (1 - q)); } }
    if (s.notruf) A.notruf(s, t);
    if (s.countdown != null) A.countdown(s.countdown, t);
    if (s.wind) A.wind(t);
  };
  A.vorFiguren = (s, t) => { if (s.typ === "dach") dachVor(s, t); };
  A.nachFiguren = (s, t) => { if (s.typ === "dach") dachNach(s, t); else if (s.notruf) A.notruf(s, t); };
})();
