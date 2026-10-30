/* Der letzte Mann: Kulissen, Gegenstände, Handy-Oberflächen und Icons. Wird nach alien.js geladen.
   „24. Stock“ und „Der Alien“ bleiben unverändert: Bestehende Kulissen werden nur erweitert, wenn neue Angaben gesetzt sind. */
(() => {
  const { box, circle, ellipse, poly, line, shade, rgba, lgrad, rgrad, fill, capsule, mix, rnd, clamp, lerp, E } = A;
  const W = A.W, H = A.H, SZ = A.SZ, I = A.I;
  const HIMMEL = { tag: ["#6fa8d6", "#cfe5f0"], morgen: ["#8fa6c9", "#f4cfae"], abend: ["#384073", "#ee9a66"], nacht: ["#0a0f24", "#25305a"] };
  const zeitVon = s => s.zeit || "tag";
  const schrift = (txt, x, y, size, farbe = "#fff", align = "center") => A.text(String(txt), x, y, size, farbe, align, 700, "HUD");
  const liste = v => (v == null ? [] : String(v).split("|").map(x => x.trim()).filter(Boolean));
  // LED-Text (Bahnsteiganzeige, Display): flackert bei Fenster-Störungen
  const flackert = (s, t) => (s.flackern ? (Math.sin(t * 47) * Math.sin(t * 13.3) > 0.1 ? 1 : 0.25) : 1);

  // ---------- kleine Stadtsilhouette im Hintergrund ----------
  const silhouette = (seed, y, hMin, hMax, farbe, nacht, x0 = -600, x1 = 1700) => {
    const r = rnd(seed);
    for (let x = x0; x < x1;) {
      const w = 90 + r() * 170, h = hMin + r() * (hMax - hMin);
      box(x, y - h, w, h + 4, 2, farbe);
      if (nacht) for (let yy = y - h + 24; yy < y - 20; yy += 46) for (let xx = x + 14; xx < x + w - 20; xx += 34) if (r() < 0.3) box(xx, yy, 14, 20, 2, "#e9b866");
      x += w + 6;
    }
  };
  // ---------- generische Passantinnen (klein, für Tokio/New York) ----------
  const passantin = i => {
    const r = rnd(i * 31 + 7);
    const haut = ["#f1cfb3", "#e6c09c", "#c99772", "#8d5a3c", "#f3d9c4"], haar = ["lang", "kurz", "dutt", "wuschel", "lang"], hf = ["#2a2220", "#6a4a30", "#1f1a18", "#a5763f", "#3a2a22"], jk = ["#a8443f", "#4d77a8", "#c9b48f", "#2f6b52", "#5b4b8a", "#d9a35f"];
    return { ...A.STANDARD, haut: haut[Math.floor(r() * 5)], haar: haar[Math.floor(r() * 5)], haare: hf[Math.floor(r() * 5)], jacke: jk[Math.floor(r() * 6)], hose: "#2b2f36" };
  };
  const menge = (n, y0, y1, sk0, sk1, t, seed, fotos = false) => {
    const r = rnd(seed), leute = [];
    for (let i = 0; i < n; i++) leute.push({ x: -40 + r() * 1160, q: r(), i });
    leute.sort((a, b) => a.q - b.q).forEach(p => {
      const y = lerp(y0, y1, p.q), sk = lerp(sk0, sk1, p.q);
      A.figur(p.x, y, sk, passantin(seed + p.i), { t: t + p.i, pose: fotos ? "traegt" : p.i % 3 ? "steht" : "geht", ausdruck: fotos ? "besorgt" : "neutral", seed: p.i });
      if (fotos) { const fy = y - 560 * sk; box(p.x - 70 * sk, fy - 90 * sk, 140 * sk, 110 * sk, 8 * sk, "#f4f1ea"); A.kopf(p.x, fy - 40 * sk, 30 * sk, passantin(p.i + 90), { t, ausdruck: "neutral", seed: p.i }); }
    });
  };

  // =====================================================================
  // BAHNHOF – Bahnsteig mit Dach, Bahnsteiganzeige, Uhr, Bank (Variante hilfspunkt: Feldbetten)
  // =====================================================================
  SZ.bahnhof = (s, t) => {
    const zeit = zeitVon(s), nacht = zeit === "nacht", hc = HIMMEL[zeit] || HIMMEL.tag;
    ctx.fillStyle = lgrad(0, -300, 0, 1100, [[0, hc[0]], [1, hc[1]]]); ctx.fillRect(-1500, -1500, 4080, 3000);
    silhouette(61, 1080, 150, 480, mix(hc[1], "#2a2f45", 0.55), nacht);
    // Gleis
    box(-1500, 1080, 4080, 240, 0, "#5f574f"); for (let x = -1500; x < 2600; x += 70) box(x, 1140, 40, 140, 4, "#4a4239");
    for (const y of [1170, 1250]) box(-1500, y, 4080, 14, 4, "#a8adb3");
    // Bahnsteig
    box(-1500, 1320, 4080, 900, 0, "#b9b5ab"); box(-1500, 1320, 4080, 26, 0, "#e9e5dc"); box(-1500, 1366, 4080, 22, 0, "#e2c64a");
    for (let k = -10; k < 30; k++) line(k * 150, 1390, k * 150 - 120, 2200, 3, rgba("#000", 0.06));
    // Dach und Stützen
    for (const x of [140, 940]) { box(x - 22, 380, 44, 960, 6, "#4b5361"); ctx.beginPath(); ctx.rect(x - 22, 380, 44, 960); A.schattiere(x - 22, x + 22, 0.3); }
    box(-1500, 300, 4080, 100, 0, "#3d4450"); box(-1500, 396, 4080, 14, 0, "#2d333d");
    for (let x = -200; x < 1300; x += 260) { box(x, 410, 150, 14, 6, nacht ? "#fff3cf" : "#dfe4ea"); if (nacht) A.licht(x + 75, 470, 420, "#fff1d0", 0.8); }
    // Bahnsteiganzeige
    const ax = 240, ay = 470, aw = 600, ah = 200, fl = flackert(s, t);
    line(ax + 60, 410, ax + 60, ay, 8, "#2d333d"); line(ax + aw - 60, 410, ax + aw - 60, ay, 8, "#2d333d");
    box(ax - 10, ay - 10, aw + 20, ah + 20, 14, "#2d333d"); box(ax, ay, aw, ah, 8, "#0d1218");
    ctx.save(); ctx.globalAlpha = fl;
    schrift(s.zug || "08:20   RE 4   Hauptbahnhof", ax + 30, ay + 52, 38, "#f2b35a", "left");
    schrift(String(s.anzeige || "Fällt aus").toUpperCase(), ax + aw / 2, ay + 132, s.anzeige_gross || 60, "#ffd36b");
    ctx.restore(); A.licht(ax + aw / 2, ay + ah / 2, 380, "#ffb347", 0.6 * fl);
    // Uhr
    const ux = 920, uy = 560; line(ux, 410, ux, uy - 80, 8, "#2d333d"); circle(ux, uy, 84, "#2d333d"); circle(ux, uy, 72, "#f5f2ea");
    const [hh, mm] = String(s.uhr || "08:20").split(":").map(Number);
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; line(ux + Math.cos(a) * 58, uy + Math.sin(a) * 58, ux + Math.cos(a) * 66, uy + Math.sin(a) * 66, 5, "#333"); }
    const am = (mm / 60) * Math.PI * 2 - Math.PI / 2, ah2 = ((hh % 12) / 12 + mm / 720) * Math.PI * 2 - Math.PI / 2;
    line(ux, uy, ux + Math.cos(ah2) * 36, uy + Math.sin(ah2) * 36, 8, "#222"); line(ux, uy, ux + Math.cos(am) * 54, uy + Math.sin(am) * 54, 6, "#222");
    const as = ((t + 20) % 60) / 60 * Math.PI * 2 - Math.PI / 2; line(ux, uy, ux + Math.cos(as) * 58, uy + Math.sin(as) * 58, 3, "#c0392b"); circle(ux, uy, 6, "#c0392b");
    // Bank
    if (!s.hilfspunkt) { box(640, 1520, 380, 26, 8, "#7a5a40"); box(640, 1470, 380, 26, 8, "#8a6a4a"); box(670, 1546, 20, 110, 6, "#4b5361"); box(970, 1546, 20, 110, 6, "#4b5361"); }
    // Feldbetten (Hilfspunkt)
    if (s.hilfspunkt) {
      for (let i = 0; i < 3; i++) { const x = -60 + i * 400, y = 1560 + (i % 2) * 70; box(x, y, 330, 60, 18, "#4f6b4a"); box(x + 10, y - 26, 310, 34, 14, "#c9c2b0"); box(x + 220, y - 40, 90, 40, 14, "#e9e5dc"); for (const xx of [x + 20, x + 290]) line(xx, y + 60, xx, y + 120, 8, "#3a3f47"); }
      box(840, 1300, 200, 70, 10, "#d24b3e"); schrift("HILFE", 940, 1336, 34, "#fff");
    }
    A.figurenZeigen(s, t, 1820, (s.figuren || []).length > 1 ? 0.9 : 1.0);
    A._dunkel = nacht ? 0.5 : zeit === "abend" ? 0.25 : zeit === "morgen" ? 0.08 : 0;
  };

  // =====================================================================
  // SUPERMARKT – Regale, Kasse, Einkaufswagen mit klingelndem Handy, Schild
  // =====================================================================
  SZ.supermarkt = (s, t) => {
    ctx.fillStyle = lgrad(0, 0, 0, 1300, [[0, "#ece8de"], [1, "#d8d2c4"]]); ctx.fillRect(-1500, -1500, 4080, 3000);
    // Deckenlichter
    for (let x = -300; x < 1400; x += 320) { box(x, 150, 220, 26, 8, "#ffffff"); A.licht(x + 110, 220, 500, "#f4f8ff", 0.6); }
    // Regale
    const r = rnd(73), farben = ["#d24b3e", "#e2b443", "#4d77a8", "#5aa05a", "#e07a3a", "#8a5ab0", "#f2f0ea", "#3fb3a7"];
    const regal = (x0, x1) => {
      box(x0, 470, x1 - x0, 830, 6, "#9aa3ab"); box(x0 + 12, 482, x1 - x0 - 24, 806, 4, "#f4f2ee");
      for (let k = 0; k < 4; k++) {
        const y = 690 + k * 200; box(x0 + 12, y, x1 - x0 - 24, 18, 3, "#c3c9ce");
        for (let x = x0 + 24; x < x1 - 60;) { const w = 34 + r() * 46, h = 80 + r() * 90; const c = farben[Math.floor(r() * farben.length)]; box(x, y - h, w, h, 8, c); box(x + 6, y - h + 16, w - 12, 18, 4, rgba("#ffffff", 0.45)); x += w + 8; }
        box(x0 + 30, y + 22, 60, 26, 4, "#fff6c4");
      }
    };
    regal(-60, 520); regal(560, 1140);
    // Boden
    box(-1500, 1300, 4080, 900, 0, "#d9d4c8"); for (let x = -1500; x < 2600; x += 140) line(x, 1300, x - 100, 2200, 3, rgba("#000", 0.06)); for (let y = 1360; y < 2200; y += 110) line(-1500, y, 2600, y, 3, rgba("#000", 0.05));
    // Schild
    if (s.schild) { line(380, 0, 380, 470, 4, "#555"); line(700, 0, 700, 470, 4, "#555"); box(300, 470, 480, 130, 16, "#d24b3e"); A.text(String(s.schild).toUpperCase(), 540, 536, 48, "#ffffff", "center", 900, "Titel", 440); }
    // Kasse
    if (s.kasse) { box(620, 1260, 520, 300, 14, "#5d6670"); box(600, 1240, 560, 40, 10, "#3d444d"); box(700, 1130, 160, 120, 12, "#2d3238"); box(716, 1146, 128, 70, 6, "#7fdc8a"); A.text("WASSER  2", 780, 1182, 22, "#0d1a12", "center", 700, "HUD"); }
    // Einkaufswagen mit Handy
    if (s.wagen !== false) {
      const wx = s.kasse ? 120 : 260, wy = 1380;
      ctx.save(); ctx.translate(wx, wy);
      poly([[0, 0], [380, 0], [340, 220], [40, 220]], rgba("#9aa3ab", 0.25));
      for (let k = 0; k <= 8; k++) line(lerp(0, 40, 0) + k * 47.5, 0, lerp(40, 340, k / 8), 220, 5, "#9aa3ab");
      for (let k = 0; k <= 4; k++) line(lerp(0, 40, k / 4), k * 55, lerp(380, 340, k / 4), k * 55, 5, "#9aa3ab");
      line(380, 0, 470, -60, 10, "#d24b3e"); line(40, 220, 40, 320, 8, "#7a8590"); line(340, 220, 340, 320, 8, "#7a8590");
      circle(60, 330, 22, "#2d3238"); circle(330, 330, 22, "#2d3238");
      if (s.handy !== false) { const z = s.klingelt ? Math.sin(t * 60) * 4 : 0; ctx.save(); ctx.translate(200 + z, 60); ctx.rotate(-0.2); box(-34, -60, 68, 120, 12, "#1d2128"); box(-28, -52, 56, 104, 8, s.klingelt ? "#7fd0ff" : "#2c3a4e"); ctx.restore(); if (s.klingelt) { A.laermWellen(200, 60, t * 1.4, 0.5); A.licht(200, 60, 200, "#7fd0ff", 1); } }
      ctx.restore();
    }
    A.figurenZeigen(s, t, 1840, 0.95, (s.figuren || []).length === 1 ? [s.kasse ? 860 : 760] : undefined);
    A._dunkel = 0;
  };

  // =====================================================================
  // KELLER – ansicht=flur (Hausverteiler, Stahltür S7) oder ansicht=raum (Konsole, Projekttelefon, Messkammertür)
  // Lämpchen: l1/l2/l3 = an | aus | flackert | blinkt3; Licht: licht=taschenlampe | konsole | an
  // =====================================================================
  const LAMPE = { 1: "#5fe07a", 2: "#4fb4ff", 3: "#f4f6ff" };
  const lampeWert = (zustand, t) => {
    if (!zustand || zustand === "aus") return 0;
    if (zustand === "flackert") return clamp(1 - Math.abs(t - 1.2) / 0.5, 0, 1) * (Math.sin(t * 40) > 0 ? 1 : 0.4);
    if (zustand === "blinkt3") { const k = Math.floor(t / 0.55); return k >= 1 && k <= 3 && (t / 0.55) % 1 < 0.6 ? 1 : k > 3 ? 0.35 : 0.1; }
    return 0.85 + 0.15 * Math.sin(t * 3);
  };
  A.konsole = (x, y, s, t) => {
    // x,y = linke obere Ecke der Arbeitsfläche; Grundbreite 440
    ctx.save(); ctx.translate(x, y);
    box(0, 0, 440, 720, 10, "#8d949b"); ctx.beginPath(); ctx.rect(0, 0, 440, 720); A.schattiere(0, 440, 0.25);
    box(-14, -18, 468, 30, 8, "#6d747b");
    for (const yy of [610, 650]) for (let k = 0; k < 8; k++) box(40 + k * 46, yy, 30, 10, 4, "#6d747b");
    // Display
    const an = s.konsole_aus ? 0 : 1;
    box(40, 40, 360, 170, 10, "#2d3238"); box(52, 52, 336, 146, 6, an ? "#0b1a12" : "#121619");
    if (an) {
      const zeilen = liste(s.display || "NOTBETRIEB · AKKU 38 %"), fl = flackert(s, t);
      ctx.save(); ctx.globalAlpha = fl * E.raus(clamp(t / 0.6, 0, 1));
      zeilen.forEach((z, i) => schrift(z, 220, 125 - (zeilen.length - 1) * 22 + i * 44, zeilen.length > 2 ? 26 : 30, "#7dffa0"));
      ctx.restore(); A.licht(220, 125, 260, "#5fe07a", 0.5 * fl);
    }
    // drei Lämpchen
    const namen = ["BEREIT", "VERBINDUNG", "SCHWELLE"];
    for (let i = 0; i < 3; i++) {
      const lx = 80 + i * 140, ly = 270, v = lampeWert(s["l" + (i + 1)], t), c = LAMPE[i + 1];
      circle(lx, ly, 34, "#2d3238"); circle(lx, ly, 24, v > 0 ? mix("#3a4048", c, v) : "#3a4048");
      if (v > 0.2) { circle(lx - 7, ly - 7, 7, rgba("#ffffff", 0.6 * v)); A.licht(lx, ly, 160, c, 1.3 * v); }
      schrift(namen[i], lx, ly + 54, 17, "#20252b");
    }
    // Taste BEREIT und Schlüsselschalter
    const druck = s.druecken ? clamp(1 - Math.abs(t - 0.8) / 0.25, 0, 1) : 0;
    circle(130, 430, 62, "#3a4048"); circle(130, 430 + druck * 6, 50, "#2e9d5a"); schrift("BEREIT", 130, 432 + druck * 6, 20, "#ffffff");
    circle(330, 430, 46, "#c3c9ce"); circle(330, 430, 30, "#9aa2a8");
    const sperre = s.schalter === "sperre"; ctx.save(); ctx.translate(330, 430); ctx.rotate(sperre ? -0.9 : 0.9); box(-6, -24, 12, 30, 4, "#5d646b"); if (s.schluessel) { box(-8, -60, 16, 40, 5, "#e2b443"); circle(0, -66, 16, "#e2b443"); } ctx.restore();
    schrift("BETRIEB", 386, 386, 15, "#20252b"); schrift("SPERRE", 270, 386, 15, "#20252b");
    ctx.restore();
  };
  A.projekttelefon = (x, y, sk, t, o = {}) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(sk, sk);
    const kl = o.klingelt ? Math.sin(t * 55) * 3 : 0; ctx.translate(kl, 0);
    poly([[-120, 0], [120, 0], [95, -95], [-95, -95]], "#d9cdb0"); box(-120, -10, 240, 20, 8, "#c9bc9c");
    circle(0, -48, 40, "#c9bc9c"); for (let k = 0; k < 10; k++) { const a = -Math.PI * 0.75 + k * 0.155 * Math.PI; circle(Math.cos(a) * 28, -48 + Math.sin(a) * 28, 6, "#f4efe0"); } circle(0, -48, 10, "#8a7f66");
    if (!o.hoerer_ab) { box(-150, -150, 300, 50, 25, "#d9cdb0"); for (const sd of [-1, 1]) box(sd * 120 - 30, -150, 60, 70, 24, "#cfc2a2"); }
    // Spiralkabel und durchtrenntes Anschlusskabel
    ctx.beginPath(); for (let k = 0; k <= 18; k++) { const q = k / 18; ctx.lineTo(-130 - Math.sin(q * 30) * 10, -110 + q * 120); } ctx.lineWidth = 5; ctx.strokeStyle = "#b9ab88"; ctx.stroke();
    line(120, -6, 220, 10, 9, "#2d3238"); line(220, 10, 250, 6, 9, "#2d3238");
    box(250, -4, 14, 20, 3, "#c87533"); box(256, 0, 14, 4, 2, "#e8a35a"); box(256, 8, 14, 4, 2, "#e8a35a");
    if (o.klingelt) A.laermWellen(0, -60, t * 1.4, 0.45);
    ctx.restore();
  };
  SZ.keller = (s, t) => {
    const licht = s.licht || (s.ansicht === "raum" ? "konsole" : "an");
    // Betonwände
    ctx.fillStyle = lgrad(0, 0, 0, 1500, [[0, "#9a9c98"], [1, "#7d807d"]]); ctx.fillRect(-1500, -1500, 4080, 3200);
    const r = rnd(9); for (let i = 0; i < 40; i++) circle(-200 + r() * 1500, r() * 1450, 4 + r() * 10, rgba("#000", 0.05));
    for (const y of [120, 168]) box(-1500, y, 4080, 26, 12, "#6d747b");
    box(-1500, 1480, 4080, 800, 0, "#6b6e6c"); for (let k = -10; k < 30; k++) line(k * 160, 1480, k * 160 - 90, 2300, 3, rgba("#000", 0.07)); box(-1500, 1470, 4080, 14, 0, "#595c5a");
    if (licht === "an" || s.ansicht !== "raum") { box(470, 230, 140, 30, 10, "#4a4f57"); ellipse(540, 262, 56, 10, licht === "an" ? "#fff6d8" : "#9a9a9a"); }
    if (s.ansicht === "raum") {
      // Vorraum S7: Konsole links, Messkammertür rechts
      A.konsole(110, 760, s, t);
      A.projekttelefon(s.telefon_x ?? 450, 742, 0.75, t, { klingelt: s.klingelt, hoerer_ab: s.hoerer_ab });
      if (s.funkwecker) { ctx.save(); ctx.translate(215, 700); box(-90, -56, 180, 112, 18, "#2d3238"); box(-76, -42, 152, 84, 10, "#0d1a12"); schrift(s.funkwecker === true ? "23:12:59" : s.funkwecker, 0, 4, 34, "#ff6a5a"); ctx.restore(); A.licht(215, 700, 160, "#ff6a5a", 0.6); }
      // Messkammertür
      const dx = 690, dy = 700, vib = s.klopfen ? Math.sin(t * 70) * 3 * (Math.floor(t / 0.45) % 3 === 0 && t % 0.45 < 0.15 ? 1 : 0) : 0;
      box(dx - 30, dy - 30, 400, 810, 6, "#6d7176");
      ctx.save(); ctx.translate(vib, 0);
      box(dx, dy, 340, 780, 8, "#8a9198"); ctx.beginPath(); ctx.rect(dx, dy, 340, 780); A.schattiere(dx, dx + 340, 0.28);
      for (const yy of [dy + 60, dy + 680]) box(dx + 300, yy, 30, 60, 6, "#5d646b");
      for (let k = 0; k < 3; k++) for (let j = 0; j < 6; j++) circle(dx + 40 + j * 52, dy + 40 + k * 340, 6, "#6d747b");
      box(dx + 70, dy + 70, 200, 60, 8, "#e2b443"); schrift("MESSKAMMER", dx + 170, dy + 101, 26, "#1d2128");
      box(dx + 24, dy + 380, 70, 24, 10, "#c3c9ce"); box(dx + 30, dy + 360, 26, 64, 10, "#9aa2a8");
      ctx.restore();
      if (s.klopfen) A.laermWellen(dx + 170, dy + 380, t * 1.3, 0.8);
      if (s.l3 && s.l3 !== "aus") A.licht(dx + 170, dy + 700, 360, "#f4f6ff", 0.4 * lampeWert(s.l3, t));
      if (s.klinke) { const jf = A.fig("du"), hx = dx + 60, hy = dy + 392; capsule(hx - 300, hy + 820, hx - 10, hy + 40, 64, 44); fill(jf.jacke); capsule(hx - 300, hy + 820, hx - 10, hy + 40, 64, 44); A.schattiere(hx - 360, hx + 40, 0.25); circle(hx, hy, 46, jf.haut); for (let k = 0; k < 3; k++) ellipse(hx - 30 + k * 26, hy - 34, 16, 26, shade(jf.haut, -0.04)); }
      A.figurenZeigen(s, t, 1700, 0.92, (s.figuren || []).length === 2 ? [560, 900] : [620]);
    } else {
      // Kellerflur: Hausverteiler links, Stahltür S7 rechts
      box(60, 560, 330, 470, 10, "#b9bcc0"); box(76, 576, 298, 438, 6, "#d6d9dc"); schrift("HAUSVERTEILER", 225, 610, 22, "#40464d");
      for (let k = 0; k < 2; k++) for (let j = 0; j < 6; j++) { const fx = 104 + j * 44, fy = 660 + k * 150; box(fx, fy, 30, 90, 4, "#f4f6f8"); const an = !(k === 1 && j === 4) || s.sicherung === "an"; box(fx + 6, an ? fy + 14 : fy + 50, 18, 26, 4, "#3a4048"); }
      if (s.sicherung !== "an") { const fx = 104 + 4 * 44, fy = 810; box(fx - 12, fy + 40, 54, 22, 6, "#d6402e"); line(fx + 15, fy + 62, fx + 15, fy + 120, 3, "#d6402e"); box(fx - 30, fy + 120, 90, 50, 8, "#d6402e"); schrift("S7", fx + 15, fy + 145, 22, "#fff"); }
      else { box(150, 980, 60, 20, 6, "#d6402e"); line(180, 1000, 230, 1060, 3, "#d6402e"); }
      line(225, 1030, 225, 1480, 14, "#6d747b");
      // Stahltür S7
      const dx = 560, dy = 560, offen = s.tuer === "offen";
      box(dx - 24, dy - 24, 408, 944, 6, "#5d646b");
      if (offen) { ctx.fillStyle = lgrad(0, dy, 0, dy + 920, [[0, "#1a1f22"], [1, "#0c0f12"]]); ctx.fillRect(dx, dy, 360, 920); if (s.konsole_schein) { A.licht(dx + 120, dy + 500, 380, "#5fe07a", 0.8); } poly([[dx, dy], [dx - 90, dy - 30], [dx - 90, dy + 950], [dx, dy + 920]], "#7d858c"); }
      else { box(dx, dy, 360, 920, 6, "#7d858c"); ctx.beginPath(); ctx.rect(dx, dy, 360, 920); A.schattiere(dx, dx + 360, 0.28); box(dx + 40, dy + 440, 80, 24, 10, "#c3c9ce"); circle(dx + 80, dy + 500, 10, "#2d3238"); }
      box(dx + 60, dy + 80, 240, 110, 8, "#e9e4da"); schrift("S7", dx + 180, dy + 118, 40, "#c0392b"); schrift("PROJEKT SPIEGEL", dx + 180, dy + 164, 22, "#40464d");
      if (s.stimme) A.laermWellen(dx + 180, dy + 420, t * 1.1, 0.6, "#ffd9a0");
      A.figurenZeigen(s, t, 1720, 0.92, (s.figuren || []).length === 2 ? [300, 560] : [420]);
    }
    if (licht === "taschenlampe") { ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.fillStyle = rgrad(560, 900, 20, 420, [[0, "rgba(255,248,220,0.16)"], [1, "rgba(255,248,220,0)"]]); ctx.fillRect(-500, -500, 2200, 2800); ctx.restore(); A.licht(560, 900, 560, "#fff4d0", 1.2); }
    if (licht === "an") A.licht(540, 300, 1100, "#fff6d8", 1);
    A._dunkel = licht === "an" ? 0.12 : licht === "konsole" ? (s.konsole_aus ? 0.62 : 0.5) : 0.62;
  };

  // =====================================================================
  // TOKIO – Kreuzung mit Zebrastreifen, Leuchtreklame (ohne echte Marken), Großbildschirm, Uhr
  // =====================================================================
  SZ.tokio = (s, t) => {
    const zeit = s.zeit || "tag", nacht = zeit === "nacht", hc = HIMMEL[zeit] || HIMMEL.tag, fl = flackert(s, t);
    ctx.fillStyle = lgrad(0, -300, 0, 900, [[0, hc[0]], [1, hc[1]]]); ctx.fillRect(-1500, -1500, 4080, 3000);
    const r = rnd(88), neon = ["#ff4fa3", "#4fd8ff", "#ffd34f", "#7dff8a", "#ff7a4f"];
    // Hochhäuser links/rechts
    for (const [x0, x1, top] of [[-200, 300, 80], [780, 1300, 40], [300, 780, 330]]) {
      box(x0, top, x1 - x0, 1200 - top, 2, nacht ? "#232838" : "#7c8494");
      for (let yy = top + 40; yy < 1150; yy += 64) for (let xx = x0 + 24; xx < x1 - 30; xx += 52) box(xx, yy, 30, 36, 3, nacht ? (r() < 0.45 ? "#f1c27a" : "#1a1e2a") : rgba("#dfeaf5", 0.45));
    }
    // Leuchtreklame: abstrakte Zeichen
    for (const [x, y, w, h] of [[20, 260, 120, 420], [880, 200, 140, 480], [120, 760, 150, 260]]) {
      const c = neon[Math.floor(r() * neon.length)]; box(x, y, w, h, 10, "#151925");
      for (let k = 0; k < Math.floor(h / 90); k++) { box(x + 30, y + 30 + k * 90, w - 60, 14, 6, c); box(x + w / 2 - 7, y + 40 + k * 90, 14, 46, 6, c); }
      A.licht(x + w / 2, y + h / 2, 300, c, nacht ? 0.9 : 0.4);
    }
    // Großbildschirm mit Uhr
    const bx = 360, by = 420, bw = 360, bh = 230;
    box(bx - 14, by - 14, bw + 28, bh + 28, 10, "#151925"); ctx.save(); ctx.globalAlpha = fl;
    box(bx, by, bw, bh, 6, s.schirm === "fotos" ? "#2c3a4e" : "#b5302a");
    if (s.schirm === "fotos") for (let k = 0; k < 6; k++) { box(bx + 20 + k * 56, by + 60, 46, 60, 4, "#f4f1ea"); A.kopf(bx + 43 + k * 56, by + 92, 18, passantin(k + 40), { t, seed: k }); }
    else { box(bx, by + bh - 60, bw, 60, 0, "#1d2128"); schrift("● ● ●", bx + bw / 2, by + 90, 60, "#ffffff"); for (let k = 0; k < 3; k++) box(bx + 40, by + bh - 46 + k * 0, bw - 80 - k * 60, 10, 4, rgba("#ffffff", 0.7 - k * 0.2)); }
    ctx.restore(); A.licht(bx + bw / 2, by + bh / 2, 420, "#ff7a6a", 0.7 * fl);
    if (s.uhr) { box(440, 700, 200, 80, 10, "#0d1218"); schrift(s.uhr, 540, 742, 52, "#ffd36b"); }
    // Straße mit Diagonal-Zebrastreifen
    box(-1500, 1200, 4080, 900, 0, nacht ? "#2c2f36" : "#4a4e56");
    ctx.save(); ctx.translate(540, 1500); ctx.transform(1, 0, 0, 0.42, 0, 0);
    for (let k = -8; k <= 8; k++) box(k * 90 - 30, -560, 50, 1120, 6, rgba("#e9e6dc", 0.85));
    ctx.rotate(Math.PI / 2); for (let k = -6; k <= 6; k++) box(k * 90 - 30, -560, 50, 1120, 6, rgba("#e9e6dc", 0.55));
    ctx.restore();
    menge(s.menge ?? 14, 1260, 1800, 0.32, 0.6, t, 5, !!s.fotos);
    A.figurenZeigen(s, t, 1880, 0.7);
    A._dunkel = nacht ? 0.42 : zeit === "abend" ? 0.25 : 0;
  };

  // =====================================================================
  // NEW YORK – Platz mit Großbildschirmen. schirm="Text" oder bild=webcam (grobes Bild vom Fenster)
  // =====================================================================
  A.webcamBild = (x, y, w, h, t, o = {}) => {
    // grobes, verpixeltes Bild: Fenster gegenüber, darin eine Gestalt, die sich die Haare richtet
    const oc = (() => { if (!A._wb) { A._wb = document.createElement("canvas"); A._wb.width = 48; A._wb.height = 32; A._wbc = A._wb.getContext("2d"); } return A._wbc; })();
    A.umleiten(oc, () => {
      oc.setTransform(48 / 1080, 0, 0, 32 / 720, 0, 0);
      box(0, 0, 1080, 720, 0, "#8b8f98"); box(300, 120, 480, 520, 4, "#e9e6df"); box(330, 150, 420, 460, 0, "#cfe0ee");
      const f = A.fig("du"); A.figur(540, 900, 0.95, f, { t: 0, pose: "denkt", ausdruck: "froh", seed: 3 });
      box(330, 150, 420, 460, 0, rgba("#ffffff", 0.18));
    });
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(A._wb, x, y, w, h); ctx.restore();
    if (o.zeit !== false) { box(x + 10, y + 10, 210, 40, 8, "rgba(0,0,0,0.55)"); schrift(o.stempel || "11:30 WETTERKAMERA", x + 115, y + 31, 18, "#ffffff"); }
  };
  SZ.newyork = (s, t) => {
    const zeit = s.zeit || "nacht", nacht = zeit === "nacht", hc = HIMMEL[zeit] || HIMMEL.nacht, fl = flackert(s, t);
    ctx.fillStyle = lgrad(0, -300, 0, 900, [[0, hc[0]], [1, hc[1]]]); ctx.fillRect(-1500, -1500, 4080, 3000);
    const r = rnd(66);
    for (const [x0, x1, top, c] of [[-300, 260, -100, "#262b3b"], [820, 1400, -60, "#2a2f40"], [260, 820, 140, "#1e2333"]]) {
      box(x0, top, x1 - x0, 1300 - top, 0, nacht ? c : mix(c, "#9aa3b5", 0.6));
      for (let yy = top + 30; yy < 1250; yy += 56) for (let xx = x0 + 20; xx < x1 - 26; xx += 44) if (r() < 0.35) box(xx, yy, 22, 30, 2, nacht ? "#f1c27a" : rgba("#ffffff", 0.35));
    }
    // Bildschirme
    const schirm = (x, y, w, h, haupt) => {
      box(x - 12, y - 12, w + 24, h + 24, 8, "#0d1015");
      ctx.save(); ctx.globalAlpha = fl;
      if (haupt && s.bild === "webcam") { A.webcamBild(x, y, w, h * 0.78, t, { zeit: false }); box(x, y + h * 0.78, w, h * 0.22, 0, "#b5302a"); A.text(String(s.schirm || "THE LAST MAN?").toUpperCase(), x + w / 2, y + h * 0.89, Math.round(h * 0.13), "#ffffff", "center", 900, "Titel", w - 40); }
      else { box(x, y, w, h, 4, haupt ? "#b5302a" : ["#2f6fb5", "#e2b443", "#2e9d5a"][Math.floor(x) % 3]); if (haupt) A.text(String(s.schirm || "BREAKING NEWS").toUpperCase(), x + w / 2, y + h / 2, Math.round(h * 0.22), "#ffffff", "center", 900, "Titel", w - 40); else for (let k = 0; k < 3; k++) box(x + 20, y + 24 + k * (h / 3.4), w - 40 - k * 30, h / 7, 6, rgba("#ffffff", 0.6)); }
      ctx.restore(); A.licht(x + w / 2, y + h / 2, Math.max(w, h), haupt ? "#ff6a5a" : "#9fc0ff", 0.8 * fl);
    };
    schirm(300, 240, 480, 330, true); schirm(-120, 300, 300, 420, false); schirm(900, 260, 300, 380, false); schirm(330, 640, 420, 120, false);
    // Platz
    box(-1500, 1300, 4080, 900, 0, nacht ? "#2a2c33" : "#5a5d66"); for (let k = -10; k < 30; k++) line(k * 140, 1300, k * 140 - 100, 2200, 3, rgba("#000", 0.1));
    menge(s.menge ?? 12, 1340, 1820, 0.32, 0.6, t, 9);
    A.figurenZeigen(s, t, 1880, 0.7);
    A._dunkel = nacht ? 0.4 : zeit === "abend" ? 0.2 : 0;
  };

  // =====================================================================
  // STUDIO – Nachrichtenstudio (Hintergrund für gesicht ort=studio)
  // =====================================================================
  SZ.studio = (s, t) => {
    ctx.fillStyle = lgrad(0, 0, 0, 1900, [[0, "#14213d"], [1, "#0b1226"]]); ctx.fillRect(-1500, -1500, 4080, 3600);
    for (const [x, y, w, h] of [[60, 300, 420, 260], [600, 260, 440, 300], [200, 640, 680, 360]]) { box(x, y, w, h, 10, "#2f6fb5"); for (let k = 0; k < 4; k++) box(x + 30, y + 40 + k * (h / 5), w - 60 - k * 40, 14, 6, rgba("#ffffff", 0.35)); A.licht(x + w / 2, y + h / 2, w, "#7fb4ff", 0.6); }
    box(-1500, 1300, 4080, 800, 0, "#1d2a4a");
    A._dunkel = 0.1;
  };
  const gesichtAlt = SZ.gesicht;
  SZ.gesicht = (s, t, p) => {
    gesichtAlt(s, t, p);
    if (s.bauchbinde) {
      const ein = E.raus(clamp(t / 0.4, 0, 1));
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate((1 - ein) * -600, 0);
      box(0, 1610, 820, 96, 0, "#b5302a"); A.text(String(s.bauchbinde).toUpperCase(), 60, 1660, 54, "#ffffff", "left", 900, "Titel", 720);
      box(0, 1706, 640, 56, 0, "#f4f1ea"); schrift(s.unterzeile || "Weltweit fehlen alle Männer", 60, 1735, 30, "#1d2128", "left");
      ctx.restore();
    }
  };

  // =====================================================================
  // SUCHSTELLE – Fotowand mit Vermisstenzetteln vor der Hausverwaltung (markiere=nika, nacht: Kerzen)
  // =====================================================================
  A.vermisstZettel = (x, y, sk, f, t, o = {}) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(sk, sk); ctx.rotate(o.rot || 0);
    box(-90, -120, 180, 240, 6, o.farbe || "#f4f1ea"); box(-74, -104, 148, 120, 4, "#c9d5de");
    A.kopf(0, -40, 46, f, { t, ausdruck: "neutral", seed: o.seed || 1 });
    if (f.schal) box(-50, 2, 100, 18, 8, f.schal);
    schrift("VERMISST", 0, 42, 24, "#c0392b"); for (let k = 0; k < 2; k++) box(-60, 64 + k * 22, 120 - k * 30, 10, 4, "#9aa2a8");
    if (o.name) schrift(o.name, 0, 72, 22, "#1d2128");
    ctx.restore();
  };
  SZ.suchstelle = (s, t) => {
    const zeit = zeitVon(s), nacht = zeit === "nacht", hc = HIMMEL[zeit] || HIMMEL.tag;
    ctx.fillStyle = lgrad(0, -300, 0, 600, [[0, hc[0]], [1, hc[1]]]); ctx.fillRect(-1500, -1500, 4080, 3000);
    box(-400, 120, 1900, 1200, 0, nacht ? "#4a4e58" : "#b9ab96"); for (let yy = 200; yy < 560; yy += 140) for (let xx = -200; xx < 1300; xx += 200) box(xx, yy, 110, 100, 4, nacht ? "#1c2130" : rgba("#cfe0ee", 0.7));
    box(220, 470, 640, 90, 10, "#2f6fb5"); schrift("HAUSVERWALTUNG", 540, 516, 46, "#ffffff");
    // Fotowand
    box(40, 600, 1000, 640, 10, "#7a5a40"); box(56, 616, 968, 608, 6, "#c9a77a");
    const r = rnd(4);
    for (let row = 0; row < 3; row++) for (let c = 0; c < 6; c++) {
      const i = row * 6 + c, x = 130 + c * 164, y = 730 + row * 200, nika = i === 8;
      if (nika) continue;
      const f = { ...passantin(i + 200), haar: ["kurz", "glatze", "wuschel", "kurz"][i % 4], bart: i % 3 === 0 ? "#6a5a4a" : null };
      A.vermisstZettel(x, y, 0.72, f, t, { rot: (r() - 0.5) * 0.12, seed: i });
    }
    const nf = A.fig("nika"), nx = 130 + 2 * 164, ny = 730 + 1 * 200;
    A.vermisstZettel(nx, ny, 0.72, nf, t, { rot: 0.04, seed: 8, farbe: "#fff6c4", name: "Nika S., 26" });
    if (s.markiere) { const pu = 0.6 + 0.4 * Math.sin(t * 5); ctx.beginPath(); ctx.ellipse(nx, ny, 100, 120, 0, 0, Math.PI * 2); ctx.lineWidth = 10; ctx.strokeStyle = rgba("#e0533d", pu); ctx.stroke(); }
    // Tisch, Gehweg
    box(-1500, 1320, 4080, 900, 0, "#a5a8ad"); box(-1500, 1320, 4080, 16, 0, "#c9ccd0");
    if (!nacht) { box(640, 1330, 400, 30, 8, "#e9e5dc"); box(660, 1360, 20, 140, 6, "#5d646b"); box(1000, 1360, 20, 140, 6, "#5d646b"); for (let k = 0; k < 3; k++) box(700 + k * 90, 1300, 70, 34, 4, "#f4f1ea"); }
    if (nacht) for (let k = 0; k < 9; k++) { const x = 80 + k * 115; A.objekt("kerze", x, 1300, 0.28, t + k); A.licht(x, 1270, 160, "#ffb84d", 1.1); }
    A.figurenZeigen(s, t, 1860, 0.85, (s.figuren || []).length === 1 ? [820] : undefined);
    A._dunkel = nacht ? 0.55 : zeit === "abend" ? 0.25 : 0;
  };

  // =====================================================================
  // STADTPLAN – Kastanienweg 7 und Hausverwaltung, Route
  // =====================================================================
  SZ.stadtplan = (s, t, p) => {
    box(-2000, -2000, 5000, 6000, 0, "#e8e1d0");
    const r = rnd(12); for (let gx = -1; gx < 7; gx++) for (let gy = 0; gy < 11; gy++) box(gx * 170 + 20, gy * 170 + 60, 130, 130, 10, r() < 0.12 ? "#b9d39b" : shade("#d2c8b4", -r() * 0.08));
    const A1 = [370, 1240], B = [710, 720];
    ctx.beginPath(); ctx.moveTo(...A1); ctx.lineTo(A1[0], B[1] + 0); ctx.lineTo(...B); const g = E.sanft(clamp(p * 1.4, 0, 1));
    ctx.setLineDash([28, 22]); ctx.lineDashOffset = -t * 40; ctx.lineWidth = 16; ctx.strokeStyle = rgba("#e0533d", g); ctx.lineCap = "round"; ctx.stroke(); ctx.setLineDash([]);
    for (const [[x, y], label, c] of [[A1, "KASTANIENWEG 7", "#2f6fb5"], [B, "HAUSVERWALTUNG", "#3b3f45"]]) {
      ctx.save(); ctx.translate(x, y); ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-46, -50, -46, -110, 0, -112); ctx.bezierCurveTo(46, -110, 46, -50, 0, 0); fill(c); circle(0, -72, 20, "#fff"); ctx.restore();
      ctx.font = "900 34px Titel"; const tw = ctx.measureText(label).width; box(x - tw / 2 - 14, y + 10, tw + 28, 48, 10, "rgba(25,28,34,0.82)"); A.text(label, x, y + 35, 34, "#fff");
    }
    A._dunkel = 0;
  };

  // ---------- Straße ohne Zombies (horde=0 zeichnet in szenen.js sonst die Standardhorde) ----------
  const strasseAlt = SZ.strasse;
  SZ.strasse = (s, t, p) => {
    if (s.horde !== 0) return strasseAlt(s, t, p);
    const horde = A.horde; A.horde = () => {};
    try { strasseAlt(s, t, p); } finally { A.horde = horde; }
  };

  // ---------- Dach gegenüber mit Wetterkamera ----------
  A.wetterkamera = (x, y, sk, t, dreht = true) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(sk, sk);
    line(0, 0, 0, -420, 16, "#5d646b"); box(-50, -20, 100, 30, 8, "#4a4f57");
    ctx.translate(0, -440); ctx.rotate(dreht ? Math.sin(t * 0.6) * 0.5 : 0);
    box(-70, -34, 150, 68, 14, "#e9e6df"); box(-80, -44, 170, 18, 8, "#c3c9ce"); circle(84, 0, 26, "#2d3238"); circle(84, 0, 14, "#3d6c99"); circle(90, -5, 5, rgba("#ffffff", 0.7));
    circle(-48, 0, 6, Math.sin(t * 4) > 0 ? "#ff4a3a" : "#5a2020");
    ctx.restore();
  };
  const dachAlt = SZ.dach;
  SZ.dach = (s, t, p) => {
    dachAlt(s, t, p);
    if (s.webcam) { A.wetterkamera(820, 1170, 1.15, t); schrift("WETTERKAMERA STADTZEITUNG", 820, 1240, 22, "#2d3238"); }
  };

  // =====================================================================
  // HANDY-OBERFLÄCHEN (bildschirm=…): eigene Bildschirme, Hand und Gerät wie bei „Der Alien“
  // =====================================================================
  const umbrechen = (txt, maxW, size, gew = 700) => { ctx.font = `${gew} ${size}px HUD`; const out = []; let z = ""; for (const w of String(txt).split(" ")) { const v = z ? z + " " + w : w; if (ctx.measureText(v).width > maxW && z) { out.push(z); z = w; } else z = v; } if (z) out.push(z); return out; };
  const textblock = (txt, x, y, maxW, size, farbe, abstand = 1.3) => { const z = umbrechen(txt, maxW, size); z.forEach((zz, i) => schrift(zz, x, y + i * size * abstand, size, farbe, "left")); return z.length * size * abstand; };
  const BILDSCHIRM = {
    meldungen(s, t) {
      schrift("EILMELDUNGEN", -180, -300, 26, "#ff8a7a", "left");
      const m = liste(s.meldungen || "Männer weltweit verschwunden|Verkehr in vielen Städten steht still|Behörden: Ruhe bewahren|Notrufnummern überlastet");
      m.forEach((z, i) => { const ein = E.pop(clamp((t - i * 0.35) / 0.35, 0, 1)); if (ein <= 0) return; ctx.save(); ctx.translate(0, -230 + i * 140); ctx.scale(ein, ein); box(-185, -50, 370, 120, 20, "rgba(255,255,255,0.92)"); circle(-150, -18, 12, "#e0533d"); textblock(z, -125, -18, 280, 26, "#1d2128"); ctx.restore(); });
    },
    anruf(s, t) {
      circle(0, -200, 90, "#3d6c99"); schrift(String(s.name || "Papa").slice(0, 1).toUpperCase(), 0, -196, 90, "#ffffff");
      schrift(s.name || "Papa", 0, -60, 48, "#ffffff"); schrift(s.status || "Mailbox", 0, -6, 30, s.status === "verbunden" ? "#7dffa0" : "#ff8a7a");
      for (let i = 0; i < 18; i++) { const h = 10 + Math.abs(Math.sin(t * 7 + i * 0.8) * Math.sin(t * 2.1 + i)) * 110 * (s._spricht || s.welle ? 1 : 0.15); box(-170 + i * 20, 160 - h / 2, 12, h, 6, "#ffffff"); }
      circle(0, 320, 50, "#e0533d"); box(-26, 312, 52, 16, 8, "#ffffff");
    },
    anrufliste(s, t) {
      schrift("ANRUFE", -180, -300, 30, "#ffffff", "left");
      const l = liste(s.liste || "Papa · Mailbox|Ben · Mailbox|Papa · Mailbox|Papa · Mailbox|Papa · Mailbox");
      l.forEach((z, i) => { const y = -220 + i * 100; box(-185, y - 40, 370, 84, 16, "rgba(255,255,255,0.1)"); circle(-145, y, 22, "#e0533d"); schrift(z, -105, y, 28, "#ffffff", "left"); });
    },
    warnung(s, t) {
      const pu = 0.5 + 0.5 * Math.sin(t * 8);
      box(-210, -416, 420, 832, 0, mix("#5a1414", "#a32020", pu));
      poly([[0, -300], [120, -100], [-120, -100]], "#ffd36b"); box(-8, -250, 16, 90, 6, "#5a1414"); circle(0, -132, 10, "#5a1414");
      schrift("WARNUNG", 0, -40, 50, "#ffffff"); schrift("Extreme Gefahr", 0, 10, 28, "#ffd36b");
      textblock(s.warntext || "Bleiben Sie zu Hause. Halten Sie Notrufnummern frei. Achten Sie auf Durchsagen.", -170, 80, 340, 26, "#ffffff");
    },
    dating(s, t) {
      box(-210, -416, 420, 140, 0, "#e0607a"); schrift("funkel", 0, -330, 46, "#ffffff"); circle(130, -330, 22, "#ffffff");
      const herz = (x, y, k) => { ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-60, -10, -40, -60, 0, -30); ctx.bezierCurveTo(40, -60, 60, -10, 0, 30); fill("#e0607a"); ctx.restore(); };
      herz(0, -100, 2.2 + 0.1 * Math.sin(t * 4)); schrift("Keine neuen Matches", 0, 60, 30, "#ffffff"); schrift("Seit 08:13", 0, 104, 24, "rgba(255,255,255,0.6)");
    },
    post(s, t) {
      circle(-160, -330, 26, "#e2b443"); schrift(s.konto || "@stadtblick", -122, -340, 24, "#ffffff", "left"); schrift(s.alter || "vor 3 Minuten", -122, -310, 20, "rgba(255,255,255,0.6)", "left");
      textblock(s.posttext || "Ist das ein MANN?? Kastanienweg", -180, -250, 360, 30, "#ffffff");
      A.webcamBild(-190, -170, 380, 250, t, { stempel: "11:30 WETTERKAMERA" });
      const k = liste(s.kommentare || "Fake?|Wo ist das?|Wer ist er?");
      k.forEach((z, i) => { const ein = clamp((t - 0.6 - i * 0.4) / 0.3, 0, 1); if (ein <= 0) return; ctx.save(); ctx.globalAlpha = ein; box(-185, 110 + i * 84, 370, 70, 16, "rgba(255,255,255,0.12)"); schrift(z, -160, 145 + i * 84, 26, "#ffffff", "left"); ctx.restore(); });
    },
    pdf(s, t) {
      box(-190, -360, 380, 740, 10, "#f4f1ea");
      schrift("MESSPLAN S7", -160, -310, 32, "#1d2128", "left"); schrift("PROJEKT SPIEGEL", -160, -272, 22, "#c0392b", "left");
      for (let k = 0; k < 10; k++) box(-160, -220 + k * 40, 300 - (k % 3) * 60, 14, 6, "#c3c9ce");
      if (s.eigenschaften) { const ein = E.pop(clamp((t - 0.3) / 0.4, 0, 1)); ctx.save(); ctx.scale(ein, ein); box(-180, 60, 360, 220, 18, "#2d3238"); schrift("DATEIEIGENSCHAFTEN", -150, 100, 22, "#9fc0ff", "left"); schrift("Erstellt: 21.10., 14:02", -150, 150, 26, "#ffffff", "left"); schrift("Autorin: E. Winter", -150, 196, 26, "#ffffff", "left"); schrift("Geändert: 21.10.", -150, 242, 22, "rgba(255,255,255,0.6)", "left"); ctx.restore(); }
    },
    tabelle(s, t) {
      box(-190, -360, 380, 740, 10, "#f4f1ea");
      schrift("Seite 3", 150, -330, 20, "#9aa2a8", "right"); schrift("ANKERPERSONEN", -160, -280, 32, "#1d2128", "left");
      const zeilen = [["A", "Brandt, Alex", "Kastanienweg 7, 3. OG"], ["B", "████████", "████████"]];
      zeilen.forEach(([k, n, a], i) => {
        const y = -190 + i * 150, mark = i === 0 && s.markiere !== false;
        if (mark) { const pu = 0.5 + 0.5 * Math.sin(t * 5); box(-180, y - 50, 360, 130, 12, rgba("#ffd36b", 0.35 + 0.25 * pu)); }
        schrift(k, -150, y, 40, "#c0392b", "left"); schrift(n, -100, y - 6, 28, "#1d2128", "left"); schrift(a, -100, y + 34, 22, "#40464d", "left");
      });
      schrift("Kalibrierung: Hörstudie 20.10.", -160, 180, 20, "#40464d", "left");
    },
    foto(s, t) {
      box(-210, -416, 420, 832, 0, "#2a2f3a");
      ctx.save(); ctx.translate(0, -20); ctx.scale(1.7, 1.7); A.vermisstZettel(0, 0, 1, A.fig("nika"), t, { farbe: "#fff6c4", name: "Nika S., 26", seed: 8 }); ctx.restore();
      schrift(s.unterschrift || "Kastanienweg 7, 1. OG", 0, 300, 26, "#ffffff");
    },
    protokoll(s, t) {
      schrift("S7 · PROTOKOLL", -180, -320, 28, "#9fc0ff", "left");
      const z = liste(s.zeilen || "Anker B · Seite B|Wählversuche: 31|stündlich seit Tag 1, 10:13|Gegenstelle: S7 (B)");
      z.forEach((zz, i) => { const ein = clamp((t - 0.2 - i * 0.35) / 0.3, 0, 1); if (ein <= 0) return; ctx.save(); ctx.globalAlpha = ein; box(-185, -260 + i * 110, 370, 90, 14, i === 1 ? rgba("#e0533d", 0.5) : "rgba(255,255,255,0.1)"); schrift(zz, -160, -215 + i * 110, 28, "#ffffff", "left"); ctx.restore(); });
    },
  };
  const handyAlt = SZ.handy;
  SZ.handy = (s, t, p) => {
    if (!s.bildschirm) return handyAlt(s, t, p);
    const dn = A.unscharf(s.ort || "wohnung", s, t, 14, 0.7);
    const tablet = s.bildschirm === "protokoll";
    ctx.save(); ctx.translate(540, 1000); ctx.rotate(-0.05);
    const jf = A.fig(s.wer || (tablet ? "winter" : "du"));
    capsule(330, 1150, 120, 430, 110, 90); fill(shade(jf.jacke, -0.05));
    ellipse(90, 380, 150, 170, jf.haut);
    if (tablet) ctx.scale(1.12, 1.0);
    box(-230, -440, 460, 880, 56, "#1d2128"); box(-210, -416, 420, 832, 40, "#1c2a3e");
    ctx.save(); A.rr(-210, -416, 420, 832, 40); ctx.clip();
    ctx.fillStyle = lgrad(0, -416, 0, 416, [[0, "#2c4466"], [1, "#16202e"]]); ctx.fillRect(-210, -416, 420, 832);
    const nz = s.netz ?? 1; for (let k = 0; k < 4; k++) box(-180 + k * 22, -380 - k * 8, 14, 14 + k * 8, 3, k < nz ? "#ffffff" : "rgba(255,255,255,0.25)");
    schrift(s.uhrzeit || "08:24", 0, -378, 24, "#ffffff");
    const akku = s.akku ?? 61; box(120, -392, 60, 24, 6, "rgba(255,255,255,0.3)"); box(124, -388, 52 * akku / 100, 16, 4, akku < 25 ? "#ff5a4a" : "#ffffff");
    (BILDSCHIRM[s.bildschirm] || BILDSCHIRM.meldungen)(s, t);
    ctx.restore();
    ellipse(190, 160, 50, 90, shade(jf.haut, -0.04), 0.4);
    for (let k = 0; k < 3; k++) box(-262, 120 + k * 78, 70, 62, 30, shade(jf.haut, -0.02 * k));
    ctx.restore();
    A.licht(540, 960, 700, s.bildschirm === "warnung" ? "#ff6a5a" : "#cfe3ff", 1.1);
    A._dunkel = (dn ?? 0) * 0.85;
  };

  // =====================================================================
  // ICONS für Infokarten
  // =====================================================================
  Object.assign(I, {
    kaffeebecher(t) { poly([[-60, -90], [60, -90], [45, 100], [-45, 100]], "#f4f1ea"); box(-66, -110, 132, 28, 10, "#5d4636"); box(-50, -20, 100, 50, 8, "#c98a2a"); for (let k = 0; k < 2; k++) { const w = (t * 0.6 + k / 2) % 1; circle(-10 + k * 24 + Math.sin(w * 6) * 8, -130 - w * 70, 8 + w * 10, rgba("#ffffff", 0.35 * (1 - w))); } },
    schluesselbund(t) { circle(0, -90, 40, rgba("#c3c9ce", 0)); ctx.beginPath(); ctx.arc(0, -90, 40, 0, Math.PI * 2); ctx.lineWidth = 12; ctx.strokeStyle = "#c3c9ce"; ctx.stroke(); for (const [x, r0, sk, txt] of [[-60, -0.3, 1, "S7"], [70, 0.35, 0.7, "S7-S"]]) { ctx.save(); ctx.translate(x * 0.4, -60); ctx.rotate(r0); ctx.scale(sk, sk); circle(0, 20, 34, "#e2b443"); box(-12, 40, 24, 150, 6, "#e2b443"); box(12, 130, 26, 14, 4, "#e2b443"); box(12, 160, 20, 14, 4, "#e2b443"); box(-40, -60, 80, 44, 8, "#f4f1ea"); schrift(txt, 0, -38, 28, "#c0392b"); ctx.restore(); } },
    zwei_becher(t) { ctx.save(); ctx.translate(-55, 0); ctx.scale(0.8, 0.8); I.kaffeebecher(t); ctx.restore(); ctx.save(); ctx.translate(55, 10); ctx.scale(0.8, 0.8); I.kaffeebecher(t + 0.5); ctx.restore(); },
    funkmast(t) {
      poly([[-50, 130], [50, 130], [10, -110], [-10, -110]], "#9aa2a8"); for (let k = 0; k < 4; k++) line(-40 + k * 8, 110 - k * 55, 40 - k * 8, 60 - k * 55, 5, "#7d858c");
      box(-20, -130, 40, 30, 6, "#d24b3e");
      for (let k = 0; k < 3; k++) { const w = (t * 0.8 + k / 3) % 1; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(0, -115, 40 + w * 110, sd > 0 ? -0.6 : Math.PI - 0.6, sd > 0 ? 0.6 : Math.PI + 0.6); ctx.lineWidth = 8; ctx.strokeStyle = rgba("#ffcf3d", 0.8 * (1 - w)); ctx.stroke(); } }
      for (const [x, y] of [[-150, 60], [150, 40], [-120, -40], [140, -60]]) { box(x - 18, y - 30, 36, 60, 8, "#1d2128"); box(x - 13, y - 24, 26, 48, 5, "#ffcf3d"); }
    },
    glasscheibe(t) {
      poly([[-60, -140], [40, -110], [40, 140], [-60, 110]], rgba("#bfe6ff", 0.55)); line(-60, -140, -60, 110, 8, "#e9e6df"); line(40, -110, 40, 140, 8, "#e9e6df");
      const w = (t * 0.6) % 1; line(-180, -40, lerp(-180, -10, Math.min(1, w * 2)), lerp(-40, -5, Math.min(1, w * 2)), 10, "#ffcf3d");
      if (w > 0.5) { const q = (w - 0.5) * 2; line(-10, -5, lerp(-10, -150, q), lerp(-5, 50, q), 6, rgba("#ffcf3d", 0.6)); line(-10, -5, lerp(-10, 160, q), lerp(-5, 30, q), 10, "#ffcf3d"); }
      schrift("4 %", -150, 110, 44, "#ffcf3d");
    },
    tag_nacht(t) {
      box(-200, -130, 190, 260, 14, "#cfe5f0"); box(-190, -120, 170, 240, 8, rgba("#ffffff", 0.75)); line(-170, -100, -110, -20, 10, rgba("#ffffff", 0.9)); A.text("TAG", -105, 160, 34, "#ffffff");
      box(10, -130, 190, 260, 14, "#ffcf7a"); box(20, -120, 170, 240, 8, "#ffe2a8"); ctx.save(); ctx.translate(105, 110); A.figur(0, 0, 0.32, A.fig("du"), { t, ausdruck: "froh", seed: 2 }); ctx.restore(); A.text("NACHT", 105, 160, 34, "#ffffff");
    },
    gesicht_bekannt(t) { ctx.save(); ctx.filter = "blur(6px)"; A.kopf(0, 0, 110, A.fig("du"), { t, ausdruck: "neutral", seed: 2 }); ctx.restore(); circle(110, 100, 46, "#2e9d5a"); line(88, 100, 104, 118, 12, "#fff"); line(104, 118, 134, 84, 12, "#fff"); },
    gesicht_fremd(t) { ctx.save(); ctx.filter = "blur(6px)"; A.kopf(0, 0, 110, A.fig("du"), { t, ausdruck: "neutral", seed: 2 }); ctx.restore(); circle(110, 100, 46, "#d24b3e"); A.text("?", 110, 104, 64, "#fff"); },
    datei_info(t) { poly([[-90, -130], [40, -130], [100, -70], [100, 130], [-90, 130]], "#f4f1ea"); poly([[40, -130], [40, -70], [100, -70]], "#c3c9ce"); for (let k = 0; k < 5; k++) box(-60, -60 + k * 34, 120 - (k % 2) * 40, 12, 5, "#c3c9ce"); box(-20, 70, 160, 80, 14, "#2f6fb5"); A.text("21.10.", 60, 110, 34, "#fff"); },
    suchdienst(t) { circle(-20, -20, 90, "#2f6fb5"); circle(-20, -20, 70, "#cfe0ee"); A.kopf(-20, -30, 40, A.fig("thomas"), { t, seed: 3 }); line(45, 45, 120, 120, 30, "#2f6fb5"); schrift("seit 1945", 0, 150, 34, "#ffcf3d"); },
    telefon_alt(t) { ctx.save(); ctx.translate(-30, 60); A.projekttelefon(0, 0, 0.8, t); ctx.restore(); line(170, 60, 260, 60, 8, "#ffcf3d"); poly([[200, -20], [170, 40], [200, 40], [180, 100], [240, 20], [210, 20], [230, -20]], "#ffcf3d"); },
    weltuhr(t) {
      for (const [x, m, l] of [[-110, 13, "DE"], [110, 43, "IN"]]) { circle(x, -10, 95, "#2d3238"); circle(x, -10, 82, "#f5f2ea"); const a = (m / 60) * Math.PI * 2 - Math.PI / 2; line(x, -10, x + Math.cos(a) * 66, -10 + Math.sin(a) * 66, 8, "#c0392b"); line(x, -10, x, -60, 10, "#222"); circle(x, -10, 8, "#222"); A.text(`:${m}`, x, 120, 44, "#ffcf3d"); A.text(l, x, -140, 30, "#ffffff"); }
    },
    gps_fehler(t) { box(-180, -130, 360, 260, 18, "#e8e1d0"); for (let k = 0; k < 3; k++) line(-180, -60 + k * 70, 180, -40 + k * 70, 14, "#ffffff"); circle(-80, 0, 22, "#2f6fb5"); const q = (t * 0.4) % 1; circle(lerp(-80, 110, q), lerp(0, -60, q), 26, "#e0533d"); A.text("10 KM", 60, 100, 40, "#c0392b"); },
    funkuhr(t) {
      line(-140, 120, -140, -60, 12, "#9aa2a8"); poly([[-170, 120], [-110, 120], [-140, -40]], "#7d858c");
      for (let k = 0; k < 3; k++) { const w = (t * 0.7 + k / 3) % 1; ctx.beginPath(); ctx.arc(-140, -60, 30 + w * 120, -0.7, 0.7); ctx.lineWidth = 8; ctx.strokeStyle = rgba("#ffcf3d", 0.8 * (1 - w)); ctx.stroke(); }
      box(10, -60, 190, 120, 20, "#2d3238"); box(24, -46, 162, 92, 12, "#0d1a12"); schrift("23:13:00", 105, 0, 34, "#ff6a5a");
    },
    frequenz(t) {
      box(-200, -60, 400, 120, 12, "rgba(255,255,255,0.12)"); box(-120, -60, 170, 120, 0, rgba("#ffcf3d", 0.55));
      for (let i = 0; i < 40; i++) { const x = -195 + i * 10, h = 10 + Math.abs(Math.sin(i * 0.5 + t * 4)) * 90; box(x, -h / 2, 6, h, 3, x > -120 && x < 50 ? "#ffffff" : rgba("#ffffff", 0.25)); }
      A.text("300", -120, 100, 32, "#ffcf3d"); A.text("3400 Hz", 60, 100, 32, "#ffcf3d");
    },
    formular(t) { box(-110, -140, 220, 280, 10, "#f4f1ea"); box(-110, -140, 220, 50, 10, "#d24b3e"); A.text("LEITSTELLE", 0, -114, 26, "#fff"); for (let k = 0; k < 6; k++) box(-80, -60 + k * 32, 160 - (k % 2) * 50, 12, 5, "#c3c9ce"); box(-80, 100, 90, 24, 6, "#2f6fb5"); },
    uhrzeiten(t) { ctx.save(); ctx.rotate(-0.05); box(-160, -120, 320, 240, 8, "#f4f1ea"); line(-160, -70, 160, -70, 4, "#e0533d"); ["9:13", "10:13", "11:13", "…", "15:13"].forEach((z, i) => schrift(z, -120 + (i % 3) * 110, -20 + Math.floor(i / 3) * 70, 34, i === 4 ? "#c0392b" : "#1d2128", "left")); ctx.restore(); },
    karteikarte(t) { ctx.save(); ctx.rotate(-0.06); box(-150, -100, 300, 200, 8, "#f4f1ea"); line(-150, -50, 150, -50, 4, "#e0533d"); for (const [k, txt] of [[0, "1. WER"], [1, "2. WO"], [2, "3. EINE FRAGE"]]) schrift(txt, -120, -10 + k * 44, 30, "#1d2128", "left"); ctx.restore(); },
  });
})();
