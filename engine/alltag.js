/* Alltag: Kulissen für die Kurzvideos in taeglich/ – Wohnzimmer, Zimmer, Esstisch, Park, Klassenzimmer, Krankenhaus, See, Haltestelle.
   Dazu Wetter und Stimmung (regen, blaetter, lichter, gluehwuermchen) für diese Kulissen.
   Wird als letzte Datei geladen und fügt nur neue Kulissen-Namen hinzu: „24. Stock“, „Der Alien“ und „Der letzte Mann“ bleiben unverändert. */
(() => {
  const { box, circle, ellipse, poly, line, shade, rgba, lgrad, rgrad, fill, mix, rnd, clamp, lerp } = A;
  const W = A.W, SZ = A.SZ;
  const HIMMEL = { tag: ["#6fa8d6", "#cfe5f0"], morgen: ["#8fa6c9", "#f4cfae"], abend: ["#3b3f74", "#f09a62"], nacht: ["#0a0f24", "#25305a"] };
  const zeitVon = s => (HIMMEL[s.zeit] ? s.zeit : "tag");
  const lichtAn = s => s.licht === "an" || s.licht === true;
  const liste = v => (v == null || v === true ? [] : String(v).split(",").map(x => x.trim()).filter(Boolean));

  // ---------- kleine Bausteine ----------
  const himmel = (zeit, x, y, w, h) => { const c = HIMMEL[zeit]; ctx.fillStyle = lgrad(0, y, 0, y + h, [[0, c[0]], [1, c[1]]]); ctx.fillRect(x, y, w, h); };
  const sterne = (x, y, w, h, t, n = 40, seed = 5) => {
    const r = rnd(seed);
    for (let i = 0; i < n; i++) { const a = 0.45 + 0.55 * Math.abs(Math.sin(t * (0.4 + r()) + i)); circle(x + r() * w, y + r() * h, 1.6 + r() * 2.6, rgba("#ffffff", 0.75 * a)); }
  };
  const laubFarbe = (s, zeit) => {
    const j = s.jahreszeit || "sommer";
    const basis = j === "herbst" ? "#c9713a" : j === "winter" ? "#e9eef2" : j === "fruehling" ? "#e9a9b8" : "#6f9a5a";
    return zeit === "nacht" ? mix(basis, "#121a2a", 0.68) : zeit === "abend" ? mix(basis, "#3b2f4a", 0.3) : basis;
  };

  // Fenster mit Himmel, Bäumen oder Stadt dahinter, optional Regen an der Scheibe und Vorhänge
  const fenster = (x, y, w, h, s, t, o = {}) => {
    const zeit = zeitVon(s), nacht = zeit === "nacht", rahmen = o.rahmen || "#f1ede6";
    box(x - 18, y - 18, w + 36, h + 36, 8, rahmen);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    himmel(zeit, x, y, w, h);
    if (nacht) { sterne(x, y, w, h * 0.6, t, 18, 9); circle(x + w * 0.72, y + h * 0.2, 32, "#f4ecd2"); }
    else if (zeit === "abend") circle(x + w * 0.3, y + h * 0.6, 58, "#ffcf8a");
    if ((o.aussen || "baeume") === "stadt") {
      const r = rnd(12);
      for (let xx = x - 20; xx < x + w;) {
        const bw = 60 + r() * 90, bh = h * (0.25 + r() * 0.45);
        box(xx, y + h - bh, bw, bh + 4, 2, nacht ? "#1d2232" : mix(HIMMEL[zeit][1], "#5a6274", 0.5));
        if (nacht) for (let yy = y + h - bh + 18; yy < y + h - 10; yy += 36) for (let wx = xx + 10; wx < xx + bw - 14; wx += 26) if (r() < 0.35) box(wx, yy, 10, 16, 2, "#e9b866");
        xx += bw + 6;
      }
    } else {
      const r = rnd(21), gc = o.laub || laubFarbe(s, zeit);
      for (let i = 0; i < 7; i++) circle(x + r() * w, y + h * (0.5 + r() * 0.3), 60 + r() * 70, shade(gc, -(i % 3) * 0.06));
      box(x, y + h * 0.86, w, h * 0.2, 0, shade(gc, -0.18));
    }
    if (s.regen) for (let i = 0; i < 26; i++) { const r = rnd(i + 3); const xx = x + r() * w, yy = y - 30 + ((r() * h + t * 900 * (0.7 + r() * 0.5)) % (h + 60)); line(xx, yy, xx - 6, yy + 34, 3, rgba("#dfe8f5", 0.5)); }
    ctx.restore();
    line(x + w / 2, y, x + w / 2, y + h, 14, rahmen);
    if (o.quer !== false) line(x, y + h * 0.42, x + w, y + h * 0.42, 12, rahmen);
    box(x - 34, y + h + 14, w + 68, 26, 6, shade(rahmen, -0.08));
    if (!nacht) A.licht(x + w / 2, y + h / 2, Math.max(w, h) * 1.25, zeit === "abend" ? "#ffc68a" : zeit === "morgen" ? "#ffd8b0" : "#e4eeff", 0.55);
    if (o.vorhang) {
      box(x - 90, y - 70, w + 180, 14, 7, "#6b625a");
      for (const sd of [-1, 1]) { const vx = sd < 0 ? x - 80 : x + w - 30; box(vx, y - 60, 110, h + 140, 34, o.vorhang); ctx.beginPath(); ctx.rect(vx, y - 60, 110, h + 140); A.schattiere(vx, vx + 110, 0.28); }
    }
  };

  // Bilderrahmen; inhalt „familie“ (kleine Köpfe, gerne aus der Besetzung), „herz“, „berg“
  const bild = (x, y, w, h, inhalt, t, kopfe = []) => {
    box(x - 12, y - 12, w + 24, h + 24, 6, "#6e5038"); box(x, y, w, h, 3, "#efe6d6");
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    if (inhalt === "familie") {
      box(x, y, w, h, 0, "#a9c6d9"); box(x, y + h * 0.7, w, h * 0.3, 0, "#88b077");
      const leute = kopfe.length ? kopfe : ["#a8443f", "#4d77a8", "#d9a35f"];
      leute.forEach((k, i) => {
        const px = x + w * (i + 1) / (leute.length + 1), f = typeof k === "string" && k.startsWith("#") ? { ...A.STANDARD, jacke: k } : A.fig(k);
        const R = Math.min(w, h) * 0.13 * (f.groesse || 1);
        box(px - R * 1.25, y + h * 0.62, R * 2.5, h * 0.5, R, f.jacke);
        A.kopf(px, y + h * 0.62 - R * 0.7, R, f, { t, ausdruck: "froh", seed: i + 2 });
      });
    } else if (inhalt === "herz") { box(x, y, w, h, 0, "#f3d9d0"); ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(w / 220, w / 220); ctx.beginPath(); ctx.moveTo(0, 40); ctx.bezierCurveTo(-90, -20, -50, -90, 0, -45); ctx.bezierCurveTo(50, -90, 90, -20, 0, 40); fill("#d9534f"); ctx.restore(); }
    else { box(x, y, w, h, 0, "#cfe1ea"); poly([[x, y + h], [x + w * 0.35, y + h * 0.35], [x + w * 0.6, y + h * 0.7], [x + w * 0.8, y + h * 0.45], [x + w, y + h]], "#6d8a9c"); circle(x + w * 0.75, y + h * 0.25, w * 0.08, "#f4d27a"); }
    ctx.restore();
  };

  const stehlampe = (x, boden, an) => {
    line(x, boden, x, boden - 560, 10, "#3a3632"); ellipse(x, boden - 4, 60, 14, "#3a3632");
    poly([[x - 70, boden - 560], [x + 70, boden - 560], [x + 50, boden - 680], [x - 50, boden - 680]], an ? "#f6dfae" : "#d8c7a4");
    if (an) { ellipse(x, boden - 560, 70, 12, "#fff3cf"); A.licht(x, boden - 560, 900, "#ffd59a", 1.15); }
  };

  const sofa = (x, y, w, farbe) => {
    box(x, y - 170, w, 200, 40, shade(farbe, -0.08));
    for (let k = 0; k < 2; k++) box(x + 40 + k * (w - 80) / 2, y - 150, (w - 100) / 2, 150, 30, shade(farbe, 0.06));
    box(x - 20, y + 10, w + 40, 130, 30, farbe); ctx.beginPath(); ctx.rect(x - 20, y + 10, w + 40, 130); A.schattiere(x - 20, x + w + 20, 0.25);
    box(x - 40, y - 60, 90, 200, 36, shade(farbe, -0.04)); box(x + w - 50, y - 60, 90, 200, 36, shade(farbe, -0.12));
    box(x + 20, y + 140, 26, 34, 6, "#3a2f28"); box(x + w - 46, y + 140, 26, 34, 6, "#3a2f28");
  };

  // Etwas vor die Figuren zeichnen (Tisch, Pult): auch aus der Figuren-Maske löschen, sonst scheinen die Körper im Farblook durch
  const verdecke = fn => {
    fn();
    if (A.inMaske || ctx !== A.ctx) return;
    A.inMaske = true; A.mctx.save(); A.mctx.setTransform(ctx.getTransform()); A.mctx.globalCompositeOperation = "destination-out";
    try { A.umleiten(A.mctx, fn); } finally { A.mctx.restore(); A.inMaske = false; }
  };

  const boden = (y, farbe, dielen = true) => {
    box(-1500, y, 4080, 900, 0, farbe);
    if (dielen) for (let x = -1500; x < 2600; x += 130) line(x, y, x - 90, y + 900, 3, rgba("#000", 0.07));
    box(-1500, y, 4080, 10, 0, rgba("#000", 0.08));
  };

  // Figuren sitzend (Sofa, Steg): Schneidersitz auf Höhe y
  const sitzend = (s, t, y, skala, xs) => {
    const namen = s.figuren || [];
    namen.forEach((name, i) => {
      const f = A.fig(name), n = namen.length;
      const blick = n > 1 ? (i < n / 2 ? 1 : -1) : 0;
      A.figur(xs[i] ?? xs[xs.length - 1], y, skala, f, { t: t + i, pose: "sitzt", ausdruck: (s.ausdruecke || {})[name] || s.ausdruck, spricht: s._spricht && s.sprecher === name, blick: [blick, 0], drehung: blick * 0.3, seed: i * 5 + 2, halt: (s.haelt || {})[name] });
    });
  };

  // Liegende Figur (Bett): Kopf auf dem Kissen, Decke darüber
  const liegend = (name, kx, ky, R, t, s, deckeFarbe, deckeBis) => {
    const f = A.fig(name);
    A.kopf(kx, ky, R, f, { t, ausdruck: (s.ausdruecke || {})[name] || s.ausdruck || "neutral", neigung: -0.35, drehung: 0.2, seed: 7, spricht: s._spricht && s.sprecher === name });
    ctx.beginPath(); ctx.moveTo(kx + R * 0.55, ky + R * 0.9); ctx.bezierCurveTo(kx + R * 2, ky - R * 0.4, deckeBis - 60, ky - R * 0.2, deckeBis, ky + R * 0.6);
    ctx.lineTo(deckeBis, ky + R * 1.7); ctx.lineTo(kx + R * 0.2, ky + R * 1.7); ctx.closePath(); fill(deckeFarbe);
    ctx.beginPath(); ctx.moveTo(kx + R * 0.55, ky + R * 0.9); ctx.bezierCurveTo(kx + R * 2, ky - R * 0.4, deckeBis - 60, ky - R * 0.2, deckeBis, ky + R * 0.6); ctx.lineTo(deckeBis, ky + R * 1.7); ctx.lineTo(kx + R * 0.2, ky + R * 1.7); ctx.closePath(); A.schattiere(kx, deckeBis, 0.25);
    box(kx + R * 0.2, ky + R * 0.75, R * 1.3, R * 0.32, R * 0.16, shade(deckeFarbe, 0.25)); // umgeschlagener Rand
  };

  // ---------- Wetter und Stimmung (im Bild, vor den Figuren) ----------
  A.alltagWetter = (s, t, draussen = true) => {
    const v = A.sicht || { x0: 0, x1: W, y0: 0, y1: A.H }, bw = v.x1 - v.x0, bh = v.y1 - v.y0;
    if (s.regen && draussen) for (let i = 0; i < 95; i++) {
      const r = rnd(i * 7 + 1), sp = 0.7 + r() * 0.6;
      const xx = v.x0 + ((r() * bw + t * 140 * sp) % bw), yy = v.y0 + ((r() * bh + t * 1500 * sp) % bh);
      line(xx, yy, xx - 10, yy + 48, 3, rgba("#d9e4f2", 0.3 + 0.25 * r()));
    }
    if (s.blaetter) for (let i = 0; i < 24; i++) {
      const r = rnd(i * 13 + 4), sp = 0.5 + r() * 0.6;
      const xx = v.x0 + ((r() * bw + Math.sin(t * 1.3 * sp + i) * 60 + t * 50 * sp) % bw), yy = v.y0 + ((r() * bh + t * 170 * sp) % bh);
      ctx.save(); ctx.translate(xx, yy); ctx.rotate(t * 2 * sp + i); ellipse(0, 0, 16, 8, ["#d9822f", "#c8622f", "#e0a23d", "#b84a2a"][i % 4]); ctx.restore();
    }
    if (s.lichter) for (let i = 0; i < 20; i++) {
      ctx.save(); ctx.globalCompositeOperation = "screen";
      const r = rnd(i * 17 + 9), gr = 24 + r() * 46;
      const xx = v.x0 + ((r() * bw + Math.sin(t * 0.3 + i) * 40) % bw), yy = v.y0 + ((r() * bh - t * 18 * (0.5 + r()) + bh * 10) % bh);
      ctx.fillStyle = rgrad(xx, yy, 0, gr, [[0, rgba("#ffd99a", 0.32)], [0.6, rgba("#ffc46b", 0.14)], [1, rgba("#ffc46b", 0)]]); ctx.fillRect(xx - gr, yy - gr, gr * 2, gr * 2);
      ctx.restore();
    }
    if (s.gluehwuermchen) for (let i = 0; i < 18; i++) {
      const r = rnd(i * 23 + 2), a = 0.4 + 0.6 * Math.abs(Math.sin(t * (1 + r()) + i));
      const xx = v.x0 + r() * bw + Math.sin(t * 0.7 + i) * 30, yy = v.y0 + bh * (0.35 + r() * 0.55) + Math.cos(t * 0.6 + i) * 24;
      circle(xx, yy, 5, rgba("#f6f0a0", a)); A.licht(xx, yy, 60, "#f2e98a", 0.5 * a);
    }
  };

  // =====================================================================
  // WOHNZIMMER – Sofa, Fenster, Stehlampe, Familienfotos (tv, licht=an, sofa_sitzen, foto="mama,papa,du")
  // =====================================================================
  SZ.wohnzimmer = (s, t) => {
    const zeit = zeitVon(s), nacht = zeit === "nacht", an = lichtAn(s), wand = s.wand || "#d9cbb6";
    ctx.fillStyle = lgrad(0, -200, 0, 1500, [[0, shade(wand, 0.06)], [1, shade(wand, -0.06)]]); ctx.fillRect(-1500, -1500, 4080, 3000);
    box(-1500, 1190, 4080, 300, 0, shade(wand, -0.1)); box(-1500, 1180, 4080, 14, 0, shade(wand, 0.14));
    fenster(80, 380, 340, 540, s, t, { aussen: s.aussen, vorhang: s.vorhang === false ? null : (s.vorhang_farbe || "#a8584a") });
    bild(640, 520, 180, 220, "familie", t, liste(s.foto)); bild(870, 600, 130, 130, "berg", t);
    if (s.tv) {
      box(40, 1300, 440, 180, 12, "#6e5038"); box(110, 1080, 300, 200, 10, "#1b1f27"); box(124, 1094, 272, 172, 6, s.tv === "aus" ? "#252a33" : "#7fb2e8");
      box(240, 1280, 40, 24, 4, "#1b1f27");
      if (s.tv !== "aus") A.licht(260, 1180, 900, "#8fbfff", 0.75 + 0.25 * Math.sin(t * 7) * Math.sin(t * 3.1));
    } else { box(150, 1330, 130, 150, 24, "#b0573f"); for (const [dx, dy, r] of [[-40, -60, 60], [30, -90, 70], [0, -150, 60], [60, -30, 50]]) circle(215 + dx, 1330 + dy, r, shade("#5d8a50", dy / 600)); }
    stehlampe(520, 1480, an || nacht && s.licht !== "aus");
    sofa(600, 1300, 440, s.sofa_farbe || "#5f7f8f");
    boden(1480, "#a77f5a");
    ellipse(560, 1660, 560, 110, rgba("#c9a27a", 0.9)); ellipse(560, 1660, 470, 82, rgba("#d8b58d", 0.9));
    if (s.sofa_sitzen) sitzend(s, t, 1330, 0.78, (s.figuren || []).length > 1 ? [720, 920] : [820]);
    else A.figurenZeigen(s, t, 1630, 0.95);
    A.alltagWetter(s, t, false);
    A._dunkel = an ? (nacht ? 0.22 : 0.04) : nacht ? 0.5 : zeit === "abend" ? 0.22 : zeit === "morgen" ? 0.12 : 0.04;
  };

  // =====================================================================
  // ZIMMER – Jugendzimmer: Bett, Schreibtisch, Poster, Fenster (im_bett=du, lichterkette, laptop, licht=an/aus)
  // =====================================================================
  SZ.zimmer = (s, t) => {
    const zeit = zeitVon(s), nacht = zeit === "nacht", an = lichtAn(s), wand = s.wand || "#a9b6c6";
    ctx.fillStyle = lgrad(0, -200, 0, 1500, [[0, shade(wand, 0.05)], [1, shade(wand, -0.08)]]); ctx.fillRect(-1500, -1500, 4080, 3000);
    // Poster und Regal
    box(70, 430, 230, 310, 6, "#2f3a52"); circle(185, 540, 60, "#e9956a"); poly([[90, 720], [170, 600], [230, 680], [280, 620], [300, 720]], "#1f2738");
    box(330, 470, 150, 200, 6, "#e9e2d0"); box(350, 490, 110, 70, 4, "#d9534f"); for (let k = 0; k < 3; k++) box(350, 580 + k * 26, 110 - k * 20, 12, 5, "#9aa2a8");
    box(60, 860, 400, 18, 6, "#7a5a40"); const r = rnd(31); for (let k = 0; k < 9; k++) box(80 + k * 40, 860 - 70 - r() * 30, 30, 70 + r() * 30, 4, ["#c94f3d", "#4d77a8", "#e2b443", "#5d8a50", "#8a5a9c"][k % 5]);
    fenster(640, 400, 340, 500, s, t, { aussen: s.aussen || "stadt", vorhang: s.vorhang === false ? null : "#3d4f6e" });
    if (s.lichterkette) {
      ctx.beginPath(); ctx.moveTo(-100, 300); for (let x = -100; x <= 1200; x += 20) ctx.lineTo(x, 300 + Math.sin((x + 100) / 1300 * Math.PI * 3) * 40); ctx.lineWidth = 3; ctx.strokeStyle = "#3a3632"; ctx.stroke();
      for (let x = -60; x < 1200; x += 70) { const y = 300 + Math.sin((x + 100) / 1300 * Math.PI * 3) * 40 + 14, a = 0.7 + 0.3 * Math.sin(t * 2 + x); circle(x, y, 9, rgba("#ffd27a", a)); A.licht(x, y, 140, "#ffc66b", 0.6 * a); }
    }
    // Bett links
    box(-20, 1120, 60, 380, 16, "#7a5a40"); box(20, 1290, 560, 130, 20, "#e9e4da"); box(20, 1400, 560, 90, 10, "#7a5a40");
    ellipse(170, 1290, 110, 46, "#f4f1ea");
    if (s.im_bett) liegend(s.im_bett, 180, 1250, 82, t, s, s.decke || "#c96b5a", 570);
    else { box(160, 1270, 400, 70, 30, s.decke || "#c96b5a"); }
    // Schreibtisch rechts
    box(600, 1240, 460, 26, 6, "#b48a62"); box(620, 1266, 22, 220, 6, "#9a7452"); box(1020, 1266, 22, 220, 6, "#9a7452");
    box(700, 1110, 220, 140, 10, "#2d3238"); box(712, 1122, 196, 116, 6, s.laptop === false ? "#252a33" : "#9fc6f0"); poly([[680, 1240], [940, 1240], [960, 1252], [660, 1252]], "#3a3f47");
    if (s.laptop !== false && (nacht || s.laptop)) A.licht(810, 1160, 600, "#9fc6ff", 0.8);
    line(1000, 1240, 1000, 1120, 8, "#3a3632"); poly([[960, 1120], [1040, 1120], [1020, 1080], [980, 1080]], "#e9956a");
    if (an) A.licht(1000, 1140, 700, "#ffd59a", 1);
    boden(1490, "#7f8a99", false); ellipse(500, 1700, 420, 70, rgba("#5d6878", 0.6));
    const stehen = { ...s, figuren: (s.figuren || []).filter(n => n !== s.im_bett) };
    A.figurenZeigen(stehen, t, 1640, 0.95);
    A.alltagWetter(s, t, false);
    A._dunkel = an ? (nacht ? 0.2 : 0.04) : nacht ? 0.6 : zeit === "abend" ? 0.25 : zeit === "morgen" ? 0.12 : 0.04;
  };

  // =====================================================================
  // ESSTISCH – Familie am Tisch unter der Hängelampe (leer=2: Stuhl 2 bleibt leer, gedeckt, kerzen, torte)
  // =====================================================================
  SZ.esstisch = (s, t) => {
    const zeit = zeitVon(s), nacht = zeit === "nacht", an = s.licht !== "aus", wand = s.wand || "#d8c3a5";
    ctx.fillStyle = lgrad(0, -200, 0, 1500, [[0, shade(wand, 0.05)], [1, shade(wand, -0.08)]]); ctx.fillRect(-1500, -1500, 4080, 3000);
    for (let x = -1500; x < 2600; x += 90) box(x, -1500, 36, 2900, 0, rgba("#ffffff", 0.06));
    fenster(90, 420, 300, 440, s, t, { aussen: s.aussen, vorhang: "#8a6a4a", quer: false });
    bild(580, 380, 200, 240, "familie", t, liste(s.foto)); bild(840, 430, 150, 150, "herz", t);
    // Sitzplätze: Figuren plus leere Stühle
    const leer = liste(s.leer).map(Number), namen = s.figuren || [];
    const n = namen.length + leer.length;
    const XS = { 1: [540], 2: [360, 720], 3: [230, 540, 850], 4: [170, 410, 670, 910], 5: [130, 325, 540, 755, 950] }[clamp(n, 1, 5)] || [540];
    const plaetze = []; let k = 0;
    for (let i = 0; i < n; i++) plaetze.push(leer.includes(i + 1) ? null : namen[k++]);
    plaetze.forEach((_, i) => { const x = XS[i]; box(x - 95, 1080, 190, 280, 26, "#7a5a40"); box(x - 75, 1100, 150, 90, 18, shade("#7a5a40", 0.12)); });
    const sitz = { ...s, figuren: plaetze.filter(Boolean) };
    A.figurenZeigen(sitz, t, 1590, 0.9, plaetze.map((p, i) => (p ? XS[i] : null)).filter(x => x != null));
    // Tisch mit Tischdecke
    verdecke(() => { poly([[-60, 1330], [1140, 1330], [1180, 1400], [-100, 1400]], "#f1ebe0"); box(-100, 1398, 1280, 340, 0, "#e6ddcd"); box(-1500, 1730, 4080, 500, 0, "#8a6a4a"); });
    for (let x = -60; x < 1180; x += 120) line(x, 1400, x, 1730, 3, rgba("#000", 0.05));
    plaetze.forEach((p, i) => {
      if (!p && !s.gedeckt) return;
      ellipse(XS[i], 1368, 70, 16, "#ffffff"); ellipse(XS[i], 1366, 44, 9, p ? "#e9b866" : "#f4f1ea"); box(XS[i] + 76, 1326, 20, 40, 5, rgba("#cfe3f0", 0.9));
    });
    if (s.kerzen) for (const x of [440, 640]) { box(x - 10, 1270, 20, 70, 4, "#f4f1ea"); ellipse(x, 1258 + Math.sin(t * 9 + x) * 2, 7, 14, "#ffcf6b"); A.licht(x, 1255, 360, "#ffb84d", 0.9); }
    if (s.torte) {
      box(430, 1260, 220, 90, 20, "#f3d6dc"); box(430, 1260, 220, 26, 12, "#f8e9ec"); for (let i = 0; i < 5; i++) { const x = 460 + i * 40; box(x - 4, 1220, 8, 42, 3, ["#59c7ff", "#e9956a", "#e2b443"][i % 3]); ellipse(x, 1212 + Math.sin(t * 10 + i) * 2, 6, 11, "#ffcf6b"); A.licht(x, 1210, 200, "#ffb84d", 0.6); }
    }
    // Hängelampe
    line(540, -300, 540, 720, 4, "#3a3632"); poly([[440, 790], [640, 790], [600, 720], [480, 720]], "#3d4a40");
    if (an) { ellipse(540, 792, 100, 14, "#fff3cf"); A.licht(540, 850, 1100, "#ffd59a", 1.2); A.licht(540, 1350, 520, "#ffe2a8", 0.6); }
    A.alltagWetter(s, t, false);
    A._dunkel = an ? (nacht ? 0.24 : zeit === "abend" ? 0.12 : 0.03) : nacht ? 0.6 : 0.2;
  };

  // =====================================================================
  // PARK – Weg, Bäume, Bank, Laterne (jahreszeit=sommer/herbst/winter/fruehling, regen, blaetter, gluehwuermchen)
  // =====================================================================
  SZ.park = (s, t) => {
    const zeit = zeitVon(s), nacht = zeit === "nacht", j = s.jahreszeit || "sommer";
    himmel(zeit, -1500, -1500, 4080, 2700);
    if (nacht) { sterne(-200, -200, 1500, 900, t, 60, 4); circle(820, 260, 54, "#f4ecd2"); A.licht(820, 260, 300, "#e9eefc", 0.4); }
    else if (zeit === "abend") { circle(300, 860, 110, "#ffcf8a"); A.licht(300, 860, 900, "#ffb36b", 0.8); }
    else circle(820, 240, 70, zeit === "morgen" ? "#ffe2b0" : "#fff3c4");
    const gc = laubFarbe(s, zeit);
    const wiese = j === "winter" ? (nacht ? "#4a5468" : "#e4eaef") : nacht ? "#1d2a24" : zeit === "abend" ? "#5d6a45" : "#7fae63";
    // ferne Baumreihe
    const r = rnd(41); for (let x = -600; x < 1700; x += 90) circle(x, 980 + r() * 40, 90 + r() * 50, j === "winter" ? (nacht ? "#1a2a2a" : "#3d6152") : shade(gc, -0.25));
    box(-1500, 1020, 4080, 1200, 0, wiese);
    // Weg
    poly([[470, 1020], [610, 1020], [1000, 2100], [80, 2100]], j === "winter" ? (nacht ? "#5d6678" : "#d1d6dc") : nacht ? "#3a3d44" : "#c9b48f");
    // Bäume
    for (const [x, y, sk] of [[-40, 1300, 1.2], [1080, 1250, 1.1], [180, 1100, 0.7], [880, 1080, 0.65]]) {
      if (j === "winter") {
        const tg = nacht ? "#1f3330" : "#2f5a48", sn = nacht ? "#9aa6bd" : "#f4f7fa";
        box(x - 18 * sk, y - 120 * sk, 36 * sk, 130 * sk, 8 * sk, nacht ? "#2a2420" : "#5b4636");
        for (let k = 0; k < 4; k++) { const by = y - (110 + k * 150) * sk, bwd = (230 - k * 45) * sk; poly([[x - bwd, by], [x + bwd, by], [x, by - 230 * sk]], shade(tg, k * 0.03)); poly([[x - bwd * 0.55, by - 100 * sk], [x + bwd * 0.55, by - 100 * sk], [x, by - 230 * sk]], sn); }
        continue;
      }
      box(x - 22 * sk, y - 420 * sk, 44 * sk, 430 * sk, 12 * sk, nacht ? "#2a2420" : "#5b4636");
      for (const [dx, dy, rr] of [[0, -560, 190], [-130, -460, 140], [130, -470, 150], [-60, -680, 130], [80, -640, 130]]) circle(x + dx * sk, y + dy * sk, rr * sk, shade(gc, (dx > 0 ? -0.1 : 0.04)));
    }
    // Laterne
    line(160, 1560, 160, 1000, 14, "#2b2f36"); box(130, 960, 60, 60, 10, "#2b2f36"); box(140, 975, 40, 36, 6, nacht || zeit === "abend" ? "#ffe6a8" : "#c9cfd6");
    if (nacht || zeit === "abend") A.licht(160, 1000, 700, "#ffd59a", 1.1);
    // Bank
    if (s.bank !== false) { box(720, 1420, 300, 26, 8, "#8a5a3a"); box(720, 1370, 300, 22, 8, "#9a6a46"); box(740, 1446, 16, 80, 4, "#2b2f36"); box(984, 1446, 16, 80, 4, "#2b2f36"); }
    if (s.sitzen) sitzend(s, t, 1430, 0.7, [800, 940]);
    else A.figurenZeigen(s, t, 1640, 0.95);
    A.alltagWetter({ ...s, blaetter: s.blaetter ?? j === "herbst" }, t, true);
    A._dunkel = nacht ? 0.5 : zeit === "abend" ? 0.18 : zeit === "morgen" ? 0.08 : s.regen ? 0.18 : 0;
  };

  // =====================================================================
  // KLASSENZIMMER – Tafel mit Kreide-Text, Uhr, Pulte (tafel="Zeile 1|Zeile 2", uhr=11:55, pulte=false)
  // =====================================================================
  SZ.klassenzimmer = (s, t) => {
    const zeit = zeitVon(s), wand = s.wand || "#cfd8c8";
    ctx.fillStyle = lgrad(0, -200, 0, 1500, [[0, shade(wand, 0.05)], [1, shade(wand, -0.08)]]); ctx.fillRect(-1500, -1500, 4080, 3000);
    box(-1500, 1180, 4080, 320, 0, shade(wand, -0.12));
    box(110, 440, 860, 470, 10, "#8a6a4a"); box(130, 460, 820, 430, 6, "#2f4f45");
    ctx.fillStyle = rgba("#ffffff", 0.05); for (let i = 0; i < 6; i++) ctx.fillRect(160 + i * 130, 480, 70, 380);
    const zeilen = String(s.tafel || "").split("|").filter(Boolean);
    zeilen.forEach((z, i) => A.text(z, 540, 560 + i * 92 + (4 - zeilen.length) * 30, 64, "#f2f2ea", "center", 700, "HUD", 760));
    box(150, 900, 780, 16, 4, "#6e5038"); box(300, 892, 50, 12, 4, "#f2f2ea");
    // Uhr
    circle(540, 310, 74, "#f4f1ea"); circle(540, 310, 66, "#ffffff");
    const [hh, mm] = String(s.uhr || "11:55").split(":").map(Number);
    ctx.save(); ctx.translate(540, 310); ctx.rotate(((hh % 12) + mm / 60) / 12 * Math.PI * 2); line(0, 0, 0, -36, 8, "#2d3238"); ctx.restore();
    ctx.save(); ctx.translate(540, 310); ctx.rotate(mm / 60 * Math.PI * 2 + (s.uhr_laeuft ? t * 0.6 : 0)); line(0, 0, 0, -54, 5, "#2d3238"); ctx.restore(); circle(540, 310, 7, "#c94f3d");
    A.licht(-100, 700, 1300, zeit === "abend" ? "#ffc68a" : "#e4eeff", 0.7);
    boden(1500, "#b9a98f", false);
    A.figurenZeigen(s, t, 1630, 0.95);
    if (s.pulte !== false) for (const x of [-60, 560]) verdecke(() => { box(x, 1490, 580, 30, 8, "#c9a77a"); box(x + 10, 1520, 560, 90, 6, "#9a7452"); box(x + 30, 1610, 20, 330, 4, "#5d6268"); box(x + 530, 1610, 20, 330, 4, "#5d6268"); });
    A.alltagWetter(s, t, false);
    A._dunkel = zeit === "nacht" ? 0.45 : zeit === "abend" ? 0.15 : 0.02;
  };

  // =====================================================================
  // KRANKENHAUS – Bett mit Patient, Monitor, Infusion, Blumen (patient=oma, monitor=flach/aus, figuren stehen rechts)
  // =====================================================================
  SZ.krankenhaus = (s, t) => {
    const zeit = zeitVon(s), nacht = zeit === "nacht", wand = s.wand || "#d3dfdc";
    ctx.fillStyle = lgrad(0, -200, 0, 1500, [[0, shade(wand, 0.04)], [1, shade(wand, -0.06)]]); ctx.fillRect(-1500, -1500, 4080, 3000);
    box(-1500, 1150, 4080, 360, 0, shade(wand, -0.1));
    // Fenster mit Jalousie
    fenster(90, 380, 380, 520, s, t, { aussen: s.aussen || "stadt", quer: false });
    if (s.jalousie !== false) for (let y = 380; y < 700; y += 26) box(90, y, 380, 14, 2, rgba("#e9ecef", 0.85));
    // Monitor
    line(860, 1180, 860, 700, 10, "#8a9096"); box(740, 560, 260, 180, 14, "#2d3238"); box(756, 576, 228, 148, 8, "#0d1a14");
    if (s.monitor !== "aus") {
      ctx.save(); ctx.beginPath(); ctx.rect(756, 576, 228, 148); ctx.clip(); ctx.beginPath();
      for (let x = 0; x <= 228; x += 3) { const ph = ((x / 228) * 2 + t * 0.9) % 1; const y = s.monitor === "flach" ? 0 : ph > 0.45 && ph < 0.5 ? -50 : ph >= 0.5 && ph < 0.53 ? 30 : 0; x ? ctx.lineTo(756 + x, 650 + y) : ctx.moveTo(756, 650 + y); }
      ctx.lineWidth = 4; ctx.strokeStyle = s.monitor === "flach" ? "#ff6b5b" : "#6dff9a"; ctx.stroke(); ctx.restore();
      A.licht(870, 650, 260, s.monitor === "flach" ? "#ff6b5b" : "#6dff9a", 0.6);
    }
    // Infusion
    line(640, 1500, 640, 520, 6, "#a3abb3"); line(600, 520, 680, 520, 6, "#a3abb3"); box(608, 540, 60, 100, 18, rgba("#e8f4f8", 0.9));
    // Bett
    box(30, 1060, 40, 420, 10, "#8a9096"); box(10, 1300, 680, 120, 24, "#eef2f3"); box(30, 1420, 640, 30, 8, "#8a9096");
    for (const x of [90, 620]) box(x, 1450, 18, 80, 4, "#5d6268");
    ellipse(190, 1280, 120, 48, "#ffffff");
    if (s.patient) liegend(s.patient, 200, 1225, 84, t, s, s.decke || "#9fc0d8", 680);
    else box(220, 1270, 450, 60, 26, "#9fc0d8");
    // Blumen auf dem Nachttisch
    box(-200, 1260, 180, 220, 10, "#e9ecef"); box(-140, 1190, 60, 70, 12, rgba("#cfe3f0", 0.9)); for (const [dx, dy, c] of [[-20, -40, "#e9956a"], [20, -60, "#e2b443"], [0, -80, "#d9534f"]]) { line(-110, 1200, -110 + dx, 1200 + dy, 4, "#4f7a45"); circle(-110 + dx, 1200 + dy, 16, c); }
    boden(1500, "#c9cfd2", false);
    const n = (s.figuren || []).length;
    A.figurenZeigen(s, t, 1640, 0.95, n === 1 ? [880] : n === 2 ? [800, 980] : undefined);
    A.alltagWetter(s, t, false);
    A._dunkel = nacht ? 0.48 : zeit === "abend" ? 0.18 : 0.04;
  };

  // =====================================================================
  // SEE – Steg in den See, Berge, Sonnenuntergang (sitzen, gluehwuermchen, lichter)
  // =====================================================================
  SZ.see = (s, t) => {
    const zeit = s.zeit ? zeitVon(s) : "abend", nacht = zeit === "nacht", hc = HIMMEL[zeit];
    himmel(zeit, -1500, -1500, 4080, 2500);
    if (nacht) { sterne(-200, -200, 1500, 1000, t, 80, 8); circle(760, 380, 56, "#f4ecd2"); }
    const sonneY = zeit === "abend" ? 880 : zeit === "morgen" ? 820 : 300;
    if (!nacht) { circle(540, sonneY, 120, zeit === "tag" ? "#fff3c4" : "#ffd08a"); A.licht(540, sonneY, 1000, "#ffb36b", zeit === "tag" ? 0.3 : 0.9); }
    poly([[-600, 960], [-200, 640], [120, 860], [380, 700], [640, 900], [900, 660], [1300, 960]], mix(hc[1], "#3b3550", 0.55));
    poly([[-600, 990], [0, 900], [400, 970], [800, 890], [1500, 990]], mix(hc[1], "#22283a", 0.7));
    const wasser = nacht ? "#141c36" : mix(hc[0], "#1e3550", 0.35);
    ctx.fillStyle = lgrad(0, 980, 0, 2100, [[0, mix(hc[1], wasser, 0.4)], [1, wasser]]); ctx.fillRect(-1500, 980, 4080, 1200);
    for (let i = 0; i < 26; i++) { const r = rnd(i + 11); const y = 1000 + r() * 700, w = 40 + r() * 140, x = (r() * 1400 - 200 + Math.sin(t * 0.8 + i) * 20); box(x, y, w, 5, 3, rgba(nacht ? "#c9d4f0" : "#ffe2b0", 0.25 + 0.2 * Math.sin(t * 2 + i))); }
    if (!nacht) for (let k = 0; k < 16; k++) { const y = 1000 + k * 34, w = 200 - k * 9 + Math.sin(t * 2 + k) * 14; box(540 - w / 2 + Math.sin(t * 1.3 + k * 2) * 10, y, w, 8, 4, rgba("#ffd08a", 0.4 - k * 0.02)); }
    // Steg
    poly([[440, 1260], [640, 1260], [880, 2100], [200, 2100]], "#8a6040");
    for (let k = 0; k < 14; k++) { const y = 1260 + k * k * 4.6; line(lerp(440, 200, (y - 1260) / 840), y, lerp(640, 880, (y - 1260) / 840), y, 4, rgba("#000", 0.18)); }
    for (const [x, y, h] of [[450, 1262, 60], [630, 1262, 60], [300, 1600, 120], [780, 1600, 120]]) box(x - 10, y, 20, h, 4, "#5b4030");
    if (s.sitzen) sitzend(s, t, 1510, 0.72, (s.figuren || []).length > 1 ? [460, 620] : [540]);
    else A.figurenZeigen(s, t, 1660, 0.95, (s.figuren || []).length === 2 ? [420, 660] : undefined);
    A.alltagWetter(s, t, true);
    A._dunkel = nacht ? 0.42 : zeit === "abend" ? 0.1 : 0;
  };

  // =====================================================================
  // HALTESTELLE – Bushaltestelle bei Nacht, Laterne, Regen-Pfützen (bus=kommt, zeit=nacht Standard)
  // =====================================================================
  SZ.haltestelle = (s, t) => {
    const zeit = s.zeit ? zeitVon(s) : "nacht", nacht = zeit === "nacht", hc = HIMMEL[zeit];
    himmel(zeit, -1500, -1500, 4080, 2600);
    if (nacht && !s.regen) sterne(-200, -200, 1500, 700, t, 40, 3);
    const r = rnd(52);
    for (let x = -600; x < 1700;) { const w = 120 + r() * 160, h = 380 + r() * 520; box(x, 1180 - h, w, h + 4, 2, nacht ? "#1b2030" : mix(hc[1], "#4a5064", 0.5)); if (nacht) for (let yy = 1180 - h + 30; yy < 1160; yy += 54) for (let xx = x + 16; xx < x + w - 24; xx += 40) if (r() < 0.3) box(xx, yy, 16, 24, 2, "#e9b866"); x += w + 8; }
    box(-1500, 1180, 4080, 260, 0, nacht ? "#3a3e48" : "#9a9890"); box(-1500, 1180, 4080, 16, 0, nacht ? "#4a4f5a" : "#b5b3ab");
    box(-1500, 1440, 4080, 700, 0, nacht ? "#23262e" : "#5b5d63");
    for (let x = -1500; x < 2600; x += 220) box(x, 1700, 120, 14, 4, rgba("#e9e5dc", 0.5));
    if (s.regen) for (let i = 0; i < 6; i++) ellipse(100 + i * 190, 1560 + (i % 2) * 120, 90, 14, rgba("#ffd59a", 0.12 + 0.05 * Math.sin(t * 3 + i)));
    // Laterne
    line(120, 1440, 120, 620, 16, "#2b2f36"); ctx.save(); ctx.translate(120, 620); box(-10, -10, 150, 22, 10, "#2b2f36"); box(100, 10, 60, 18, 6, "#ffe6a8"); ctx.restore();
    if (nacht || zeit === "abend") { A.licht(250, 700, 900, "#ffd59a", 1.2); ctx.fillStyle = lgrad(0, 640, 0, 1440, [[0, rgba("#ffe6a8", 0.18)], [1, rgba("#ffe6a8", 0)]]); poly([[220, 640], [290, 640], [560, 1440], [-60, 1440]]); ctx.fill(); }
    // Wartehäuschen
    box(470, 760, 560, 30, 8, "#3a4048"); for (const x of [480, 1000]) box(x, 790, 20, 650, 4, "#3a4048");
    box(500, 790, 500, 560, 4, rgba("#9fc0d8", 0.18)); box(860, 830, 120, 200, 6, "#e9e2d0"); A.text("BUS", 920, 870, 30, "#2f6fb5"); for (let k = 0; k < 4; k++) box(880, 905 + k * 26, 80 - k * 10, 10, 4, "#9aa2a8");
    box(560, 1240, 280, 22, 8, "#6e5038"); box(580, 1262, 14, 60, 4, "#3a4048"); box(806, 1262, 14, 60, 4, "#3a4048");
    if (nacht) A.licht(920, 930, 260, "#fff1d0", 0.6);
    if (s.bus) { const x = s.bus === "kommt" ? lerp(1700, 640, clamp(t / 3, 0, 1)) : 640; box(x - 380, 1000, 900, 420, 40, "#d9a33a"); box(x - 340, 1040, 820, 150, 16, nacht ? "#ffe6a8" : "#9fc0d8"); circle(x - 250, 1420, 50, "#1b1f27"); circle(x + 380, 1420, 50, "#1b1f27"); A.licht(x - 360, 1330, 500, "#fff4d0", 1); }
    A.figurenZeigen(s, t, 1620, 0.92);
    if (nacht || zeit === "abend") A.licht(700, 1150, 700, "#fff1d0", 0.7);
    A.alltagWetter(s, t, true);
    A._dunkel = nacht ? 0.5 : zeit === "abend" ? 0.22 : s.regen ? 0.15 : 0;
  };
})();
