/* Leuchtender Look für die Kurzvideos (Jonathans Referenzbilder 2.11.: kräftige Farbfamilie pro Bild, Tiefenunschärfe,
   dunkle Silhouetten am Rand, Licht als Hauptdarsteller, Panorama mit kleiner Figur). Nur neue Kulissen-Namen:
   alle bisherigen Serien bleiben pixelgleich. Drehbuch dazu: `@look 0` (kein Abdunkeln), `@kino 0.6`. */
(() => {
  const { box, circle, ellipse, poly, line, shade, rgba, lgrad, rgrad, mix, clamp, lerp, E } = A;
  const W = A.W, H = A.H, SZ = A.SZ;
  const rnd = seed => A.rnd(seed + (A._kgVar || 0) * 7919);
  const glut = (x, y, r, farbe, a = 1) => { ctx.fillStyle = rgrad(x, y, 0, r, [[0, rgba(farbe, 0.9 * a)], [0.25, rgba(farbe, 0.4 * a)], [1, rgba(farbe, 0)]]); ctx.fillRect(x - r, y - r, r * 2, r * 2); };

  // Ebene mit Tiefenunschärfe: fn zeichnet wie gewohnt (gleiche Kamera), danach wird die Ebene weichgezeichnet aufgelegt.
  const tafeln = {};
  const ebene = (name, unschaerfe, fn, alpha = 1) => {
    const cw = ctx.canvas.width, ch = ctx.canvas.height;
    let c = tafeln[name];
    if (!c || c.canvas.width !== cw || c.canvas.height !== ch) { const el = document.createElement("canvas"); el.width = cw; el.height = ch; c = tafeln[name] = el.getContext("2d"); }
    const m = ctx.getTransform(), k = Math.hypot(m.a, m.b);
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cw, ch); c.setTransform(m);
    A.umleiten(c, fn);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alpha;
    if (unschaerfe > 0) ctx.filter = `blur(${(unschaerfe * k).toFixed(1)}px)`;
    ctx.drawImage(c.canvas, 0, 0); ctx.restore();
  };
  // weiche Kurve durch Punkte (für Dünenkämme und Hügel)
  const kurve = (pk, unten = 2600) => {
    ctx.beginPath(); ctx.moveTo(pk[0][0], unten); ctx.lineTo(pk[0][0], pk[0][1]);
    for (let i = 1; i < pk.length; i++) { const [x0, y0] = pk[i - 1], [x1, y1] = pk[i]; ctx.bezierCurveTo((x0 + x1) / 2, y0, (x0 + x1) / 2, y1, x1, y1); }
    ctx.lineTo(pk[pk.length - 1][0], unten); ctx.closePath();
  };
  // Farn: geschwungener Stiel mit Fiederblättchen
  const farn = (x, y, h, winkel, farbe, hell) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(winkel);
    const n = 9;
    for (let i = 0; i < n; i++) {
      const p = i / n, py = -h * p, bx = Math.sin(p * 2.2) * h * 0.12, l = h * 0.32 * (1 - p * 0.8);
      for (const s of [-1, 1]) { ctx.save(); ctx.translate(bx, py); ctx.rotate(s * (0.9 - p * 0.3)); ellipse(0, -l * 0.5, l * 0.16, l * 0.55, i % 2 ? farbe : hell); ctx.restore(); }
    }
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(h * 0.12, -h * 0.5, Math.sin(2.2) * h * 0.12, -h); ctx.lineWidth = h * 0.03; ctx.strokeStyle = shade(farbe, -0.2); ctx.stroke();
    ctx.restore();
  };
  // Grasbüschel
  const buesch = (x, y, h, farbe, r) => { for (let i = 0; i < 6; i++) { const a = -0.6 + i * 0.24 + (r() - 0.5) * 0.2; line(x, y, x + Math.sin(a) * h * (0.6 + r() * 0.4), y - Math.cos(a) * h * (0.6 + r() * 0.4), 5, farbe); } };

  // =====================================================================
  // DÜNEN – Wüstenpanorama: Tafelberge im Dunst, Dünen in Orange/Gelb, Farne, Sonne mit Strahlen, unscharfe Pflanzen vorne
  // (zeit=tag|abend, figur_y, gross) – Probe 2.11.
  // =====================================================================
  SZ.duenen = (s, t) => {
    const abend = s.zeit === "abend";
    const P = abend
      ? { oben: "#3b2a78", mitte: "#c2507e", horizont: "#ffb45e", sonne: "#ffe9b8", berg: "#d9524c", bergS: "#7a2c62", fels: "#47325a", duene: ["#f39150", "#f7ad5a", "#e66b40", "#cc4f3a"], licht: "#ffd48e", gruen: "#7a8a36", wasser: "#e28a7a" }
      : { oben: "#4fbcd2", mitte: "#a9e0cf", horizont: "#fdeaa8", sonne: "#ffffff", berg: "#e2674c", bergS: "#b2436c", fels: "#5a5576", duene: ["#f9b44c", "#fcd36c", "#f39447", "#ea733a"], licht: "#fff4c8", gruen: "#7fac3c", wasser: "#3fb8c0" };
    const sx = 760, sy = 300;
    // Himmel
    ctx.fillStyle = lgrad(0, -700, 0, 1050, [[0, P.oben], [0.6, P.mitte], [1, P.horizont]]); ctx.fillRect(-1500, -1500, 4080, 3000);
    glut(sx, sy, 900, P.licht, 0.6); glut(sx, sy, 300, "#fff3b0", 1); circle(sx, sy, 82, P.sonne); glut(sx, sy, 120, "#ffffff", 0.9);
    A.licht(sx, sy, 900, P.licht, 1);
    // Wolke
    { const wx = 1010 + Math.sin(t * 0.1) * 20; for (const [dx, dy, r] of [[0, 0, 42], [40, -14, 52], [90, 0, 40], [130, 6, 30]]) circle(wx + dx, 470 + dy, r, rgba("#ffffff", 0.9)); box(wx - 40, 470, 220, 26, 13, "#ffffff"); }
    // Tafelberge hinten (unscharf, im Dunst)
    ebene("berge", 4, () => {
      const r = rnd(5);
      for (const [x0, breite, hoehe, farbe] of [[-260, 620, 520, P.bergS], [180, 360, 330, P.berg], [520, 300, 240, mix(P.berg, P.horizont, 0.35)], [880, 420, 180, mix(P.berg, P.horizont, 0.55)]]) {
        const y0 = 980, top = y0 - hoehe;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + breite * 0.12, top + 40); ctx.lineTo(x0 + breite * 0.2, top);
        for (let k = 1; k <= 4; k++) ctx.lineTo(x0 + breite * (0.2 + k * 0.15), top + (r() - 0.5) * 30);
        ctx.lineTo(x0 + breite * 0.86, top + 30); ctx.lineTo(x0 + breite, y0); ctx.closePath(); ctx.fillStyle = farbe; ctx.fill();
        // Licht- und Schattenseite, Felsrillen
        ctx.save(); ctx.clip(); box(x0 + breite * 0.55, top - 10, breite, hoehe + 20, 0, rgba("#3a1f40", 0.18));
        for (let k = 0; k < 6; k++) { const lx = x0 + breite * (0.15 + r() * 0.7); line(lx, top + 20, lx + (r() - 0.5) * 30, y0, 6, rgba("#3a1f40", 0.12)); }
        ctx.restore();
      }
      ctx.fillStyle = lgrad(0, 820, 0, 1000, [[0, rgba(P.horizont, 0)], [1, rgba(P.horizont, 0.75)]]); ctx.fillRect(-1500, 820, 4080, 180);
    });
    // Felsnadel und Grünstreifen in der Mitte (leicht unscharf)
    ebene("mitte", 1.5, () => {
      const r = rnd(9);
      poly([[600, 1010], [660, 760], [700, 720], [745, 770], [760, 1010]], P.fels); poly([[700, 720], [745, 770], [760, 1010], [705, 1010]], shade(P.fels, -0.15));
      line(668, 760, 700, 722, 6, rgba(P.licht, 0.5));
      kurve([[-300, 1010], [100, 985], [500, 1000], [900, 975], [1400, 1000]]); ctx.fillStyle = mix(P.gruen, P.horizont, 0.25); ctx.fill();
      for (let i = 0; i < 40; i++) { const x = -150 + r() * 1400, y = 985 + r() * 25; circle(x, y, 10 + r() * 16, shade(P.gruen, (r() - 0.5) * 0.2)); }
    });
    // Dünen in Schichten, je mit Lichtkamm und Schattenseite
    const duenen = [[1110, P.duene[0], 11], [1290, P.duene[1], 23], [1500, P.duene[2], 37], [1720, P.duene[3], 51]];
    for (const [basis, farbe, seed] of duenen) {
      const r = rnd(seed), pk = []; for (let x = -600; x <= 1800; x += 330 + r() * 260) pk.push([x, basis - 40 - r() * 230]);
      kurve(pk); ctx.fillStyle = farbe; ctx.fill();
      ctx.save(); kurve(pk); ctx.clip();
      // Schattenseite: dunklere Bänder unter jedem Kamm
      for (let i = 1; i < pk.length; i++) { const [x0, y0] = pk[i - 1], [x1, y1] = pk[i]; if (y1 < y0) poly([[x0, y0], [x1, y1], [x1 + 200, y1 + 300], [x0 + 80, y0 + 320]], rgba(mix(shade(farbe, -0.22), "#b8405a", 0.3), 0.55)); }
      // Windrippel
      for (let i = 0; i < 14; i++) { const x = -200 + r() * 1500, y = basis - 40 + r() * 160; ctx.beginPath(); ctx.ellipse(x, y, 90 + r() * 80, 10, -0.08, Math.PI * 1.1, Math.PI * 1.9); ctx.lineWidth = 4; ctx.strokeStyle = rgba(shade(farbe, -0.12), 0.45); ctx.stroke(); }
      ctx.restore();
      ctx.beginPath(); ctx.moveTo(pk[0][0], pk[0][1]); for (let i = 1; i < pk.length; i++) { const [x0, y0] = pk[i - 1], [x1, y1] = pk[i]; ctx.bezierCurveTo((x0 + x1) / 2, y0, (x0 + x1) / 2, y1, x1, y1); }
      ctx.lineWidth = 7; ctx.strokeStyle = rgba(P.licht, 0.55); ctx.stroke();
      if (seed === 11) { // auf der hintersten Düne: Oase mit Palmen
        // Oase: Wasserfläche mit Spiegelung und grünem Ufer, zwei Palmen
        ellipse(820, 1128, 300, 46, shade(P.gruen, -0.05)); ellipse(820, 1126, 260, 34, P.wasser);
        for (let k = 0; k < 5; k++) box(700 + k * 30 + Math.sin(t + k) * 8, 1116 + k * 6, 120 - k * 14, 4, 2, rgba("#ffffff", 0.35));
        for (const [px, ph, pw] of [[610, 250, 0.28], [570, 170, 0.16]]) {
          ctx.beginPath(); ctx.moveTo(px, 1120); ctx.quadraticCurveTo(px + pw * 300, 1120 - ph * 0.6, px + pw * 260, 1120 - ph); ctx.lineWidth = 16; ctx.strokeStyle = "#8a5a3e"; ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = rgba("#ffe0b0", 0.35); ctx.stroke();
          const kx = px + pw * 260, ky = 1120 - ph;
          for (let k = 0; k < 7; k++) { const a = -Math.PI + k * (Math.PI / 6); ctx.save(); ctx.translate(kx, ky); ctx.rotate(a + Math.sin(t * 0.8 + k) * 0.05); ellipse(60, 10, 64, 14, k % 2 ? shade(P.gruen, -0.15) : P.gruen, 0.25); ctx.restore(); }
        }
      }
    }
    // Details: Steine, Farne, Grasbüschel, Spur
    { const r = rnd(61);
      for (let i = 0; i < 9; i++) { const x = -50 + r() * 1180, y = 1250 + r() * 420, g = 14 + r() * 26; ellipse(x, y + g * 0.5, g * 1.4, g * 0.35, rgba("#7a3a2a", 0.25)); ellipse(x, y, g * 1.1, g * 0.8, P.fels); ellipse(x - g * 0.3, y - g * 0.3, g * 0.5, g * 0.3, rgba("#ffffff", 0.18)); }
      for (let i = 0; i < 6; i++) { const x = 60 + r() * 960, y = 1300 + r() * 380; farn(x, y, 90 + r() * 90, (r() - 0.5) * 0.6, P.gruen, mix(P.gruen, "#d8e07a", 0.4)); }
      for (let i = 0; i < 18; i++) buesch(-50 + r() * 1180, 1200 + r() * 560, 26 + r() * 30, shade(P.gruen, -0.1 + r() * 0.2), r);
      for (let i = 0; i < 9; i++) ellipse(300 + i * 34 + Math.sin(i) * 10, 1640 - i * 26, 9, 5, rgba("#8a3a22", 0.3)); }
    // Sandglitzern (leise Bewegung)
    { const r = rnd(71); for (let i = 0; i < 40; i++) { const x = -100 + r() * 1300, y = 1100 + r() * 700, a = 0.5 + 0.5 * Math.sin(t * (1 + r() * 2) + i * 1.7); circle(x, y, 2.5, rgba("#ffffff", 0.6 * a)); } }
    // Panorama: kleine Figur weiter hinten (über den Untertiteln); `gross`: nah vorne
    A.figurenZeigen(s, t, s.figur_y ?? (s.gross ? 1560 : 1240), s.gross ? 0.95 : 0.5);
    // Vordergrund: dunkle, unscharfe Pflanzen-Silhouetten an den Rändern (rahmen das Bild)
    ebene("vorne", 14, () => {
      const dunkel = abend ? "#3a1c3f" : "#4a2a52";
      farn(-80, 2150, 900, 0.5, dunkel, shade(dunkel, 0.08)); farn(40, 2200, 700, 0.2, shade(dunkel, -0.05), dunkel); farn(-120, 1900, 600, 0.9, shade(dunkel, 0.05), dunkel);
      farn(1180, 2150, 950, -0.55, dunkel, shade(dunkel, 0.08)); farn(1040, 2230, 640, -0.25, shade(dunkel, 0.06), dunkel);
      for (const [x, y, r0] of [[-80, 2000, 230], [1180, 1960, 260], [1000, 2160, 200], [150, 2180, 180]]) circle(x, y, r0, shade(dunkel, -0.1));
    });
    // Sonnenstrahlen und Linsenreflexe
    ctx.save(); ctx.globalCompositeOperation = "screen";
    for (const [w, b, a] of [[0.55, 70, 0.22], [0.75, 40, 0.16], [0.95, 110, 0.12]]) {
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(w);
      ctx.fillStyle = lgrad(0, 0, 0, 1400, [[0, rgba(P.licht, a)], [1, rgba(P.licht, 0)]]); poly([[-b * 0.2, 0], [b * 0.2, 0], [b, 1400], [-b, 1400]]); ctx.fill(); ctx.restore();
    }
    for (const [f, r0, farbe, a] of [[0.35, 60, "#ffe6a0", 0.12], [0.6, 110, "#f6a6d8", 0.08], [0.85, 40, "#a8e8ff", 0.1]]) { const fx = lerp(sx, 540, f * 1.6), fy = lerp(sy, 1200, f); circle(fx, fy, r0, rgba(farbe, a * (0.8 + 0.2 * Math.sin(t)))); }
    ctx.restore();
    A._dunkel = 0;
  };

  // =====================================================================
  // KIOSK – Lotto-Kiosk an der Straßenecke bei Nacht (s02 „Der Hauptgewinn“): leuchtendes Schaufenster, Neonschild,
  // Zeitungsständer, Laterne, nasser Asphalt mit Spiegelungen, unscharfe Stadt mit Lichtpunkten, dunkle Ränder.
  // (zeit=nacht|abend, regen, gross)
  // =====================================================================
  SZ.kiosk = (s, t) => {
    const abend = s.zeit === "abend";
    const P = abend
      ? { oben: "#2a2a6e", mitte: "#8a3f86", horizont: "#f28a6a", stadt: "#5a3a7a", fenster: "#ffd38a", boden: "#3a2a58" }
      : { oben: "#120f3a", mitte: "#3a2370", horizont: "#9a3f8e", stadt: "#2c2260", fenster: "#ffcf7a", boden: "#221a46" };
    const warm = "#ffc46a", neon = "#ff5fa8";
    // Himmel
    ctx.fillStyle = lgrad(0, -700, 0, 1150, [[0, P.oben], [0.65, P.mitte], [1, P.horizont]]); ctx.fillRect(-1500, -1500, 4080, 3000);
    { const r = rnd(3); for (let i = 0; i < 70; i++) { const x = -200 + r() * 1500, y = -200 + r() * 700, a = 0.4 + 0.4 * Math.sin(t * (0.5 + r()) + i); circle(x, y, 1.5 + r() * 2.5, rgba("#ffffff", 0.5 * a)); } }
    glut(860, 260, 160, "#fff1d6", 0.5); circle(860, 260, 46, "#fff6e4");
    // Stadt hinten, stark unscharf, mit Lichtpunkten (Bokeh)
    ebene("kstadt", 7, () => {
      const r = rnd(13);
      for (const [y0, farbe, n] of [[1060, mix(P.stadt, P.horizont, 0.45), 14], [1110, P.stadt, 11]]) {
        let x = -300; while (x < 1400) { const b = 70 + r() * 120, h = 160 + r() * 420; box(x, y0 - h, b, h + 400, 6, farbe);
          for (let k = 0; k < n * 0.5; k++) if (r() < 0.55) box(x + 10 + r() * (b - 30), y0 - h + 20 + r() * (h - 40), 12, 16, 2, rgba(P.fenster, 0.4 + r() * 0.5));
          x += b + 6; }
      }
      ctx.fillStyle = lgrad(0, 900, 0, 1150, [[0, rgba(P.horizont, 0)], [1, rgba(P.horizont, 0.55)]]); ctx.fillRect(-1500, 900, 4080, 250);
    });
    { const r = rnd(17); ctx.save(); ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 26; i++) { const x = -100 + r() * 1300, y = 820 + r() * 330, rr0 = 16 + r() * 40, f = [warm, neon, "#7fd8ff", "#ffffff"][i % 4]; circle(x, y, rr0, rgba(f, (0.12 + r() * 0.16) * (0.85 + 0.15 * Math.sin(t * 1.3 + i)))); }
      ctx.restore(); }
    // Gehweg und Straße (nass)
    ctx.fillStyle = lgrad(0, 1150, 0, 2100, [[0, mix(P.boden, P.horizont, 0.3)], [1, shade(P.boden, -0.25)]]); ctx.fillRect(-1500, 1150, 4080, 1800);
    box(-1500, 1300, 4080, 14, 0, rgba("#ffffff", 0.08));
    // Laterne links (Mittelgrund)
    { const lx = 120; box(lx - 9, 520, 18, 800, 9, "#2a1f48"); box(lx - 9, 520, 6, 800, 3, rgba("#b89cff", 0.25));
      box(lx - 6, 520, 90, 12, 6, "#2a1f48"); box(lx + 50, 520, 60, 28, 10, "#3a2c5e"); glut(lx + 80, 552, 260, warm, 0.55); A.licht(lx + 80, 552, 300, warm, 0.8);
      ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.fillStyle = lgrad(0, 552, 0, 1320, [[0, rgba(warm, 0.22)], [1, rgba(warm, 0)]]); poly([[lx + 60, 552], [lx + 100, 552], [lx + 260, 1320], [lx - 100, 1320]]); ctx.fill(); ctx.restore();
      ellipse(lx + 80, 1330, 200, 26, rgba(warm, 0.18)); }
    // Kiosk
    const kx = 330, ky = 700, kb = 520, kh = 600;
    ellipse(kx + kb / 2, ky + kh + 10, kb * 0.62, 34, rgba("#0a0620", 0.45));
    box(kx, ky, kb, kh, 14, "#3b2f6e"); box(kx + kb - 70, ky, 70, kh, 0, rgba("#1a1240", 0.35)); box(kx, ky, 10, kh, 4, rgba("#c8b4ff", 0.25));
    // Dach mit Vordach und Streifenmarkise
    box(kx - 40, ky - 40, kb + 80, 60, 16, "#2a2058"); box(kx - 40, ky - 40, kb + 80, 10, 5, rgba("#e0d0ff", 0.25));
    for (let i = 0; i < 8; i++) { const x0 = kx - 30 + i * ((kb + 60) / 8); poly([[x0, ky + 20], [x0 + (kb + 60) / 8, ky + 20], [x0 + (kb + 60) / 8, ky + 70], [x0, ky + 90]], i % 2 ? "#e2506e" : "#f4ece8"); }
    // Neonschild
    { const fl = 0.85 + 0.15 * Math.sin(t * 9) * (Math.sin(t * 0.7) > 0.93 ? 1 : 0.1);
      box(kx + 110, ky - 170, 300, 110, 28, "#1c1440"); glut(kx + 260, ky - 115, 300, neon, 0.45 * fl); A.licht(kx + 260, ky - 115, 260, neon, 0.9 * fl);
      ctx.save(); ctx.font = `900 76px Titel`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.shadowColor = neon; ctx.shadowBlur = 30; ctx.fillStyle = rgba("#ffd6ea", fl); ctx.fillText("LOTTO", kx + 260, ky - 112); ctx.restore();
      line(kx + 160, ky - 60, kx + 160, ky - 40, 6, "#1c1440"); line(kx + 360, ky - 60, kx + 360, ky - 40, 6, "#1c1440"); }
    // leuchtendes Fenster mit Regalen
    const fx0 = kx + 40, fy0 = ky + 110, fb = kb - 80, fh = 300;
    box(fx0 - 8, fy0 - 8, fb + 16, fh + 16, 12, "#241a50");
    ctx.fillStyle = lgrad(0, fy0, 0, fy0 + fh, [[0, "#ffe6a8"], [1, "#ffb85a"]]); A.rr(fx0, fy0, fb, fh, 8); ctx.fill();
    { const r = rnd(23);
      for (let reihe = 0; reihe < 3; reihe++) { const ry = fy0 + 28 + reihe * 92; box(fx0 + 10, ry + 62, fb - 20, 8, 3, rgba("#8a4a2a", 0.55));
        let x = fx0 + 18; while (x < fx0 + fb - 40) { const b = 18 + r() * 34, h = 34 + r() * 26; box(x, ry + 62 - h, b, h, 3, ["#e2506e", "#4f8fe0", "#53b38a", "#f0a040", "#8a5ad0", "#ffffff"][Math.floor(r() * 6)]); x += b + 6; } }
      // Kioskbesitzer als Silhouette hinter der Scheibe, Kopf nickt leicht
      const hx = fx0 + fb * 0.7, hy = fy0 + fh - 30 + Math.sin(t * 0.8) * 3; ellipse(hx, hy, 70, 60, rgba("#6a3a3a", 0.55)); circle(hx, hy - 90, 40, rgba("#6a3a3a", 0.55)); }
    box(fx0, fy0, fb * 0.25, fh, 0, rgba("#ffffff", 0.12)); line(fx0 + fb * 0.55, fy0 + 10, fx0 + fb * 0.4, fy0 + fh - 10, 10, rgba("#ffffff", 0.14));
    glut(fx0 + fb / 2, fy0 + fh / 2, 520, warm, 0.35); A.licht(fx0 + fb / 2, fy0 + fh / 2, 480, warm, 0.9);
    // Theke, Zeitungsständer, Plakat
    box(kx + 20, fy0 + fh + 8, kb - 40, 40, 8, "#5a3f8a"); box(kx + 20, fy0 + fh + 8, kb - 40, 8, 4, rgba(warm, 0.5));
    { const zx = kx + 40, zy = ky + kh - 150; box(zx, zy, 160, 150, 8, "#2c2258"); for (let i = 0; i < 3; i++) { box(zx + 12, zy + 12 + i * 44, 136, 34, 4, ["#f4ece8", "#ffe28a", "#f4ece8"][i]); box(zx + 20, zy + 20 + i * 44, 60, 8, 3, rgba("#2c2258", 0.6)); box(zx + 20, zy + 32 + i * 44, 100, 5, 2, rgba("#2c2258", 0.35)); } }
    { const px = kx + kb - 170, py = ky + kh - 210; box(px, py, 130, 180, 8, "#ffd84a"); circle(px + 65, py + 70, 40, "#e2506e"); for (let i = 0; i < 3; i++) box(px + 20, py + 125 + i * 16, 90, 7, 3, rgba("#2c2258", 0.5)); glut(px + 65, py + 90, 150, "#ffd84a", 0.25); }
    // Spiegelungen auf dem nassen Boden
    ctx.save(); ctx.globalCompositeOperation = "screen";
    for (const [x, b, f, a] of [[fx0 + fb / 2, fb * 0.7, warm, 0.18], [kx + 260, 200, neon, 0.13], [200, 120, warm, 0.12]]) {
      ctx.fillStyle = lgrad(0, ky + kh, 0, 2000, [[0, rgba(f, a)], [1, rgba(f, 0)]]);
      for (let k = 0; k < 7; k++) { const w = Math.sin(t * 1.5 + k) * 6; box(x - b / 2 + w, ky + kh + 20 + k * 90, b, 50, 25); } }
    ctx.restore();
    // Pfützen, Kanaldeckel, Blätter
    { const r = rnd(41); for (let i = 0; i < 6; i++) { const x = -50 + r() * 1180, y = 1450 + r() * 400; ellipse(x, y, 90 + r() * 90, 16 + r() * 10, rgba("#b8a0ff", 0.12)); }
      ellipse(860, 1720, 80, 22, "#1a1238"); for (let k = -2; k <= 2; k++) line(800 + k * 6, 1720 + k * 8 - 10, 920 + k * 6, 1720 + k * 8 - 10, 3, rgba("#5a4a8a", 0.5));
      for (let i = 0; i < 12; i++) { const x = -40 + r() * 1160, y = 1380 + r() * 520; ctx.save(); ctx.translate(x, y); ctx.rotate(r() * 6); ellipse(0, 0, 14, 7, rgba(["#e2706e", "#f0a040", "#c25a8a"][i % 3], 0.7)); ctx.restore(); } }
    // Figuren vor dem Kiosk
    A.figurenZeigen(s, t, s.figur_y ?? (s.gross ? 1640 : 1470), s.gross ? 0.95 : 0.72);
    // Regen
    if (s.regen) { const r = rnd(51); for (let i = 0; i < 120; i++) { const x = r() * 1300 - 100, y = ((r() * 2200 + t * 1400) % 2200) - 200; line(x, y, x - 8, y + 46, 3, rgba("#d8ccff", 0.35)); } }
    else { const r = rnd(53); for (let i = 0; i < 30; i++) { const x = r() * 1200 - 60, y = 600 + ((r() * 1300 - t * 25) % 1300 + 1300) % 1300, a = 0.5 + 0.5 * Math.sin(t * 2 + i); circle(x, y, 3, rgba(warm, 0.35 * a)); } }
    // Vordergrund: dunkle, unscharfe Ränder (Hecke links, Pfosten und Fahrrad-Silhouette rechts)
    ebene("kvorne", 14, () => {
      const d = "#0e0a26";
      for (const [x, y, r0] of [[-60, 2050, 260], [90, 2180, 220], [-120, 1780, 200], [1160, 2080, 280], [1020, 2220, 200]]) circle(x, y, r0, d);
      box(1050, 1300, 46, 900, 20, shade(d, 0.06));
    });
    A._dunkel = 0;
  };

  // =====================================================================
  // WALDNACHT – Wald bei Nacht (s03 Horror-Test): Mond im Dunst, Stämme in 4 Ebenen mit Tiefenunschärfe, Nebelbänder,
  // Mondstrahlen, Waldboden mit Farnen, Pilzen und Wurzeln, Glühwürmchen. Kein Blut, kein Wesen in voller Gestalt.
  // (lampe = Taschenlampenstrahl von unten, huette = Hütte mit Licht im Fenster, see = Seeufer mit Spiegelung,
  //  augen = zwei lange, helle Augen weit oben zwischen den Bäumen (1 = schwach, 2 = deutlich), gross, figur_y)
  // =====================================================================
  SZ.waldnacht = (s, t) => {
    const P = { oben: "#070b22", mitte: "#13204a", horizont: "#2b4a7a", mond: "#eef4ff", nebel: "#8fb0d8",
      stamm: ["#24365e", "#1a284a", "#121c38", "#0b1228"], boden: "#0f1a34", gruen: "#1f3a52", lampe: "#fff1c8", fenster: "#ffc66a" };
    const mx = 820, my = 330;
    // Himmel und Mond
    ctx.fillStyle = lgrad(0, -700, 0, 1200, [[0, P.oben], [0.6, P.mitte], [1, P.horizont]]); ctx.fillRect(-1500, -1500, 4080, 3200);
    { const r = rnd(101); for (let i = 0; i < 90; i++) { const x = -200 + r() * 1500, y = -300 + r() * 900, a = 0.4 + 0.5 * Math.sin(t * (0.4 + r()) + i * 2.1); circle(x, y, 1.2 + r() * 2.2, rgba("#dfe8ff", 0.55 * a)); } }
    glut(mx, my, 700, "#6f8fd0", 0.45); glut(mx, my, 220, "#dfe9ff", 0.8); circle(mx, my, 70, P.mond);
    circle(mx - 22, my - 12, 14, rgba("#b8c6e6", 0.5)); circle(mx + 18, my + 20, 10, rgba("#b8c6e6", 0.45)); circle(mx + 10, my - 30, 7, rgba("#b8c6e6", 0.4));
    A.licht(mx, my, 700, "#a8c0ff", 0.8);
    // Wolkenschleier vor dem Mond
    { const wx = 700 + Math.sin(t * 0.08) * 60; for (const [dx, dy, rx] of [[0, 0, 220], [180, 30, 160], [-160, 40, 140]]) ellipse(wx + dx, my + 70 + dy, rx, 26, rgba("#5a74a8", 0.35)); }
    // Stamm mit Ästen, Randlicht von rechts (Mond)
    const stamm = (x, y0, b, h, farbe, r, licht) => {
      ctx.beginPath(); ctx.moveTo(x - b * 0.5, y0); ctx.lineTo(x - b * 0.32, y0 - h); ctx.lineTo(x + b * 0.32, y0 - h); ctx.lineTo(x + b * 0.5, y0);
      ctx.quadraticCurveTo(x + b * 0.9, y0 + 12, x + b * 1.1, y0 + 30); ctx.lineTo(x - b * 1.1, y0 + 30); ctx.quadraticCurveTo(x - b * 0.9, y0 + 12, x - b * 0.5, y0); ctx.closePath();
      ctx.fillStyle = farbe; ctx.fill();
      box(x + b * 0.12, y0 - h, b * 0.2, h, b * 0.1, rgba(licht, 0.18));
      for (let k = 0; k < 3; k++) { const ay = y0 - h * (0.45 + r() * 0.4), s0 = r() < 0.5 ? -1 : 1, al = b * (1.5 + r() * 2);
        ctx.beginPath(); ctx.moveTo(x, ay); ctx.quadraticCurveTo(x + s0 * al * 0.5, ay - al * 0.2, x + s0 * al, ay - al * 0.5); ctx.lineWidth = b * 0.18; ctx.strokeStyle = farbe; ctx.lineCap = "round"; ctx.stroke(); }
      for (let k = 0; k < 4; k++) { const ry = y0 - r() * h * 0.8; line(x - b * 0.2 + r() * b * 0.3, ry, x - b * 0.2 + r() * b * 0.3, ry + 30 + r() * 60, 3, rgba("#000010", 0.18)); }
    };
    // Ebenen: hinten hell und dunstig, vorne dunkel und scharf
    for (const [name, unsch, y0, farbe, n, bmin, seed, hell] of [["w1", 5, 1080, P.stamm[0], 16, 26, 103, 0.5], ["w2", 3, 1160, P.stamm[1], 11, 40, 107, 0.35], ["w3", 1.2, 1260, P.stamm[2], 8, 62, 109, 0.25]]) {
      ebene(name, unsch, () => {
        const r = rnd(seed);
        ctx.fillStyle = mix(farbe, P.horizont, hell * 0.6); ctx.fillRect(-1500, y0 - 10, 4080, 1400);
        let x = -260 + r() * 80; while (x < 1360) { const b = bmin + r() * bmin * 0.8; stamm(x, y0, b, y0 + 600, mix(farbe, P.horizont, hell * 0.5), r, P.mond); x += 1300 / n + r() * 90; }
        // Nebelband vor dieser Ebene
        ctx.fillStyle = lgrad(0, y0 - 220, 0, y0 + 40, [[0, rgba(P.nebel, 0)], [0.6, rgba(P.nebel, 0.22 * (1 + hell))], [1, rgba(P.nebel, 0.08)]]); ctx.fillRect(-1500, y0 - 220, 4080, 260);
      });
      // ziehende Nebelschwaden
      { const r = rnd(seed + 5); for (let i = 0; i < 4; i++) { const x = ((r() * 1800 + t * (12 + r() * 10)) % 1800) - 400; ellipse(x, y0 - 60 - r() * 80, 260 + r() * 200, 34 + r() * 20, rgba(P.nebel, 0.08 + r() * 0.06)); } }
    }
    // Mondstrahlen durch die Bäume
    ctx.save(); ctx.globalCompositeOperation = "screen";
    for (const [w, b, a] of [[0.42, 60, 0.12], [0.62, 40, 0.09], [0.85, 90, 0.07], [0.25, 30, 0.08]]) {
      ctx.save(); ctx.translate(mx, my); ctx.rotate(w); ctx.fillStyle = lgrad(0, 0, 0, 1600, [[0, rgba("#bcd0ff", a)], [1, rgba("#bcd0ff", 0)]]); poly([[-b * 0.2, 0], [b * 0.2, 0], [b, 1600], [-b, 1600]]); ctx.fill(); ctx.restore(); }
    ctx.restore();
    // Augen weit oben zwischen den Bäumen (nie die ganze Gestalt): lang, hell, blinzeln selten
    if (s.augen) {
      const st = Number(s.augen) >= 2 ? 1 : 0.55, ax = 560, ay = 640, zu = (Math.sin(t * 0.9) > 0.985) ? 0.15 : 1;
      ebene("umriss", 12, () => { box(ax - 90, ay - 70, 180, 1000, 90, rgba("#03050f", 0.55 * st)); }); // nur ein Umriss im Dunst, so hoch wie die Bäume
      glut(ax, ay, 260, "#9fd0ff", 0.35 * st);
      for (const dx of [-46, 46]) { glut(ax + dx, ay, 70, "#e8f4ff", 0.7 * st); ellipse(ax + dx, ay, 10, 34 * zu, rgba("#f4fbff", 0.95 * st)); }
    }
    // Hütte auf der Lichtung mit warmem Fenster
    if (s.huette) {
      const hx = 620, hy = 1290, hb = 360, hh = 230;
      ellipse(hx + hb / 2, hy + 8, hb * 0.7, 24, rgba("#02040e", 0.5));
      box(hx, hy - hh, hb, hh, 6, "#1d2a4a"); for (let k = 0; k < 6; k++) box(hx, hy - hh + 10 + k * 38, hb, 6, 2, rgba("#000010", 0.25));
      poly([[hx - 40, hy - hh + 4], [hx + hb / 2, hy - hh - 150], [hx + hb + 40, hy - hh + 4]], "#141d36"); line(hx + hb / 2, hy - hh - 150, hx + hb + 40, hy - hh + 4, 6, rgba(P.mond, 0.25));
      box(hx + hb * 0.7, hy - hh - 120, 34, 80, 4, "#141d36");
      const fx = hx + 60, fy = hy - hh + 70; box(fx - 6, fy - 6, 102, 92, 6, "#0f1630"); box(fx, fy, 90, 80, 4, P.fenster); line(fx + 45, fy, fx + 45, fy + 80, 6, "#0f1630"); line(fx, fy + 40, fx + 90, fy + 40, 6, "#0f1630");
      glut(fx + 45, fy + 40, 320, P.fenster, 0.4 * (0.92 + 0.08 * Math.sin(t * 3.1))); A.licht(fx + 45, fy + 40, 300, P.fenster, 0.8);
      box(hx + 220, hy - 150, 80, 150, 6, "#0f1630");
    }
    // Boden: Lichtung, Weg, Wurzeln, Farne, Pilze
    ctx.fillStyle = lgrad(0, 1260, 0, 2200, [[0, mix(P.boden, P.horizont, 0.35)], [1, shade(P.boden, -0.3)]]); ctx.fillRect(-1500, 1260, 4080, 1400);
    if (s.see) { ellipse(560, 1420, 760, 110, "#16305a"); ellipse(560, 1416, 700, 90, "#1f4278");
      for (let k = 0; k < 6; k++) box(mx - 140 + Math.sin(t + k) * 10, 1360 + k * 16, 280 - k * 36, 5, 2, rgba("#dfe9ff", 0.35 - k * 0.04)); }
    { const r = rnd(121);
      ctx.beginPath(); ctx.moveTo(420, 2200); ctx.bezierCurveTo(470, 1700, 640, 1500, 560, 1300); ctx.lineTo(620, 1300); ctx.bezierCurveTo(740, 1500, 760, 1800, 820, 2200); ctx.closePath(); ctx.fillStyle = rgba("#3a5280", 0.35); ctx.fill();
      for (let i = 0; i < 7; i++) { const x = -60 + r() * 1200, y = 1400 + r() * 500; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 60, y - 30, x + 140 + r() * 60, y + 10); ctx.lineWidth = 12; ctx.strokeStyle = "#0b1328"; ctx.lineCap = "round"; ctx.stroke(); }
      for (let i = 0; i < 9; i++) farn(-40 + r() * 1180, 1500 + r() * 450, 80 + r() * 90, (r() - 0.5) * 0.7, P.gruen, mix(P.gruen, "#5a8ab0", 0.35));
      for (let i = 0; i < 5; i++) { const x = 80 + r() * 940, y = 1560 + r() * 360, g = 10 + r() * 12; ellipse(x, y + g * 0.9, g * 1.3, g * 0.3, rgba("#000010", 0.3)); box(x - g * 0.2, y, g * 0.4, g * 0.9, 3, "#c8d4ee"); ellipse(x, y, g, g * 0.6, "#5a7ac0"); circle(x - g * 0.3, y - g * 0.1, g * 0.15, rgba("#ffffff", 0.6)); }
      for (let i = 0; i < 14; i++) buesch(-50 + r() * 1180, 1450 + r() * 600, 22 + r() * 26, shade(P.gruen, -0.1 + r() * 0.2), r); }
    // Taschenlampe: Lichtkegel von unten ins Bild, Staub im Strahl
    if (s.lampe) {
      ctx.save(); ctx.globalCompositeOperation = "screen";
      const lx = 560, ly = 2150, zx = 600 + Math.sin(t * 0.6) * 40, zy = 1180;
      ctx.fillStyle = lgrad(0, ly, 0, zy, [[0, rgba(P.lampe, 0.8)], [1, rgba(P.lampe, 0.12)]]); poly([[lx - 40, ly], [lx + 40, ly], [zx + 260, zy], [zx - 260, zy]]); ctx.fill();
      ellipse(zx, zy + 40, 300, 70, rgba(P.lampe, 0.12));
      { const r = rnd(131); for (let i = 0; i < 40; i++) { const f = r(), x = lerp(lx, zx, f) + (r() - 0.5) * 400 * f, y = lerp(ly, zy, f) + Math.sin(t * 1.2 + i) * 8; circle(x, y, 2 + r() * 2, rgba("#ffffff", 0.35 * (0.6 + 0.4 * Math.sin(t * 2 + i)))); } }
      ctx.restore();
    }
    // Glühwürmchen
    { const r = rnd(141); for (let i = 0; i < 22; i++) { const x = -60 + r() * 1200 + Math.sin(t * 0.7 + i) * 20, y = 1150 + r() * 700 + Math.cos(t * 0.5 + i) * 14, a = 0.5 + 0.5 * Math.sin(t * (1.5 + r()) + i); glut(x, y, 18, "#cfe8ff", 0.5 * a); circle(x, y, 2.5, rgba("#f4fbff", 0.9 * a)); } }
    // Figuren
    A.figurenZeigen(s, t, s.figur_y ?? (s.gross ? 1640 : 1420), s.gross ? 0.95 : 0.62);
    // Vordergrund: dunkle, unscharfe Stämme und Farne an den Rändern
    ebene("wnvorne", 14, () => {
      const d = "#040714";
      box(-140, -400, 230, 3000, 40, d); box(1010, -400, 260, 3000, 40, d);
      farn(-60, 2200, 820, 0.55, shade(d, 0.08), d); farn(1150, 2220, 900, -0.5, shade(d, 0.08), d);
      for (const [x, y, r0] of [[-40, 2080, 240], [1140, 2060, 260], [260, 2240, 180], [900, 2260, 170]]) circle(x, y, r0, d);
    });
    A._dunkel = 0;
  };

  // =====================================================================
  // FUNDHAUS – Ausgaberaum des städtischen Fundhauses (s04 „Die zwölfte Quittung“): senfgelbe Wand mit 24 nummerierten
  // Fächern voller Fundstücke, hohes Fenster mit Lichtstrahlen und Staub, Wanduhr, Hängelampen, lange Theke mit
  // Klingel, Stempel und Quittungsblock, Linoleumboden, unscharfe Garderobe und Schirmständer vorne.
  // (zeit=tag|abend|nacht, uhr="14:17" (Zeiger), uhr_steht (Sekundenzeiger zuckt auf der Stelle), leer=N (Fach N leer,
  //  mit Lichtkegel), fach=N (Fach N leuchtet), dose (schwarze Blechdose mit Halbmond in Fach 24), kasse (Spendenkasse
  //  auf der Theke), gross, figur_y)
  // =====================================================================
  SZ.fundhaus = (s, t) => {
    const zeit = s.zeit || "tag";
    const P = zeit === "abend" ? { wand: "#d98f3a", wandS: "#9a5a2a", fach: "#5a3220", himmel: ["#5a3a8a", "#f2875a"], licht: "#ffc27a", boden: "#7a4a36" }
      : zeit === "nacht" ? { wand: "#9a7a3e", wandS: "#5a4430", fach: "#3a2a22", himmel: ["#0e1440", "#2a3a7a"], licht: "#ffe1a0", boden: "#4a3430" }
      : { wand: "#e3ad42", wandS: "#a8742c", fach: "#6a3e22", himmel: ["#5fc4e0", "#d8f2f0"], licht: "#fff2c0", boden: "#8a5638" };
    // Wand mit weichem Verlauf und Sockelleiste
    ctx.fillStyle = lgrad(0, -600, 0, 1400, [[0, shade(P.wand, -0.18)], [0.45, P.wand], [1, shade(P.wand, -0.08)]]); ctx.fillRect(-1500, -1500, 4080, 2900);
    for (let i = 0; i < 14; i++) box(-400 + i * 120, -600, 4, 2000, 2, rgba(P.wandS, 0.08));
    // Fenster links mit Himmel, Kreuz, Fensterbank, Topfpflanze
    const fx = 40, fy = 250, fb = 270, fh = 760;
    box(fx - 18, fy - 18, fb + 36, fh + 36, 14, shade(P.wand, -0.35));
    ctx.fillStyle = lgrad(0, fy, 0, fy + fh, [[0, P.himmel[0]], [1, P.himmel[1]]]); A.rr(fx, fy, fb, fh, 8); ctx.fill();
    { const r = rnd(201); ctx.save(); A.rr(fx, fy, fb, fh, 8); ctx.clip();
      if (zeit === "nacht") for (let i = 0; i < 20; i++) circle(fx + r() * fb, fy + r() * fh * 0.6, 2 + r() * 2, rgba("#ffffff", 0.6));
      for (let i = 0; i < 6; i++) { const bx = fx - 20 + i * 52, bh = 120 + r() * 200; box(bx, fy + fh - bh, 48, bh + 10, 4, rgba(shade(P.himmel[1], -0.35), 0.8)); for (let k = 0; k < 4; k++) if (r() < 0.6) box(bx + 10 + (k % 2) * 18, fy + fh - bh + 20 + Math.floor(k / 2) * 34, 10, 14, 2, rgba(P.licht, zeit === "tag" ? 0.25 : 0.8)); }
      ctx.restore(); }
    line(fx + fb / 2, fy, fx + fb / 2, fy + fh, 14, shade(P.wand, -0.35)); line(fx, fy + fh * 0.42, fx + fb, fy + fh * 0.42, 14, shade(P.wand, -0.35));
    box(fx - 30, fy + fh + 4, fb + 60, 26, 8, shade(P.wand, -0.25)); box(fx - 30, fy + fh + 4, fb + 60, 6, 3, rgba("#ffffff", 0.25));
    box(fx + 180, fy + fh - 60, 60, 64, 10, "#b8553a"); for (let k = 0; k < 5; k++) ellipse(fx + 210 + Math.sin(k * 1.3) * 34, fy + fh - 80 - k * 14, 26, 11, k % 2 ? "#3f7a4a" : "#5a9a5a", k * 0.6 - 1.2);
    glut(fx + fb / 2, fy + fh / 2, 520, P.licht, zeit === "nacht" ? 0.15 : 0.35);
    // Wanduhr über dem Fenster
    { const ux = fx + fb / 2, uy = 140, [hh, mm] = String(s.uhr || "10:10").split(":").map(Number);
      ellipse(ux + 6, uy + 10, 82, 82, rgba(P.wandS, 0.35)); circle(ux, uy, 80, "#2d2a30"); circle(ux, uy, 68, "#fbf4e4");
      for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; line(ux + Math.sin(a) * 56, uy - Math.cos(a) * 56, ux + Math.sin(a) * 62, uy - Math.cos(a) * 62, k % 3 ? 3 : 6, "#2d2a30"); }
      const ah = ((hh % 12) + mm / 60) / 12 * Math.PI * 2, am = mm / 60 * Math.PI * 2;
      line(ux, uy, ux + Math.sin(ah) * 34, uy - Math.cos(ah) * 34, 8, "#2d2a30"); line(ux, uy, ux + Math.sin(am) * 52, uy - Math.cos(am) * 52, 5, "#2d2a30");
      const as = s.uhr_steht ? 0.6 + Math.sin(t * 6.3) * 0.04 * (Math.sin(t * 6.3) > 0 ? 1 : 0) : t * 0.105;
      line(ux, uy, ux + Math.sin(as) * 58, uy - Math.cos(as) * 58, 2.5, "#d8443a"); circle(ux, uy, 6, "#d8443a"); }
    // Fächerwand: 4 × 6 nummerierte Fächer mit Fundstücken
    const gx = 380, gy = 200, cb = 162, ch = 150, sp = 8;
    box(gx - 16, gy - 16, 4 * (cb + sp) + 24, 6 * (ch + sp) + 24, 12, shade(P.wand, -0.3));
    box(gx - 16, gy - 16, 4 * (cb + sp) + 24, 8, 4, rgba("#ffffff", 0.2));
    const farben = ["#d8443a", "#3f7ac8", "#4f9a5a", "#e8b43a", "#8a5ab8", "#e07a3a", "#3aa8a8", "#f0e6d8"];
    const ding = (art, x, y, r) => {
      const f1 = farben[Math.floor(r() * farben.length)], f2 = farben[Math.floor(r() * farben.length)];
      ellipse(x, y + 46, 52, 8, rgba("#1a0e08", 0.35));
      switch (art) {
        case 0: poly([[x - 50, y + 10], [x, y - 40], [x + 50, y + 10]], f1); line(x, y + 10, x, y + 44, 5, "#3a2a22"); ctx.beginPath(); ctx.arc(x - 8, y + 44, 8, 0, Math.PI); ctx.lineWidth = 5; ctx.strokeStyle = "#3a2a22"; ctx.stroke(); break; // Schirm
        case 1: circle(x, y + 16, 30, f1); circle(x, y - 22, 22, f1); circle(x - 18, y - 38, 9, f1); circle(x + 18, y - 38, 9, f1); circle(x - 7, y - 24, 3, "#2a1a14"); circle(x + 7, y - 24, 3, "#2a1a14"); break; // Teddy
        case 2: box(x - 46, y + 14, 92, 30, 14, f1); box(x - 46, y - 8, 40, 40, 12, f1); box(x - 46, y + 34, 92, 10, 4, shade(f1, -0.3)); break; // Schuh
        case 3: ctx.beginPath(); ctx.arc(x, y + 30, 44, Math.PI, 0); ctx.closePath(); A.fill(f1); box(x - 50, y + 26, 100, 12, 6, shade(f1, -0.25)); box(x - 6, y - 12, 12, 30, 5, rgba("#ffffff", 0.35)); break; // Helm
        case 4: circle(x, y + 10, 36, f1); ctx.beginPath(); ctx.arc(x, y + 10, 36, 0.4, 2.6); ctx.lineWidth = 6; ctx.strokeStyle = f2; ctx.stroke(); break; // Ball
        case 5: box(x - 44, y - 10, 88, 56, 12, f1); ctx.beginPath(); ctx.arc(x, y - 10, 22, Math.PI, 0); ctx.lineWidth = 7; ctx.strokeStyle = shade(f1, -0.3); ctx.stroke(); box(x - 10, y + 6, 20, 10, 3, "#e8c44a"); break; // Tasche
        case 6: for (let k = 0; k < 3; k++) box(x - 44 + k * 4, y + 22 - k * 22, 88 - k * 8, 20, 4, [f1, f2, "#f0e6d8"][k]); break; // Bücher
        default: ctx.beginPath(); ctx.moveTo(x - 46, y - 10); ctx.quadraticCurveTo(x, y + 30, x + 46, y - 10); ctx.lineWidth = 18; ctx.strokeStyle = f1; ctx.stroke(); box(x + 24, y - 12, 18, 52, 6, f1); for (let k = 0; k < 3; k++) line(x + 26 + k * 6, y + 40, x + 26 + k * 6, y + 52, 3, shade(f1, -0.2)); // Schal
      }
    };
    for (let rI = 0; rI < 6; rI++) for (let c = 0; c < 4; c++) {
      const n = rI * 4 + c + 1, x = gx + c * (cb + sp), y = gy + rI * (ch + sp), r = rnd(300 + n);
      ctx.fillStyle = lgrad(0, y, 0, y + ch, [[0, shade(P.fach, -0.25)], [1, P.fach]]); A.rr(x, y, cb, ch, 8); ctx.fill();
      box(x, y, cb, 12, 4, rgba("#000000", 0.18)); box(x + cb - 14, y, 14, ch, 4, rgba("#000000", 0.12));
      const leer = Number(s.leer) === n;
      if (s.dose && n === 24) { box(x + 40, y + 50, 82, 70, 10, "#1e1c22"); box(x + 36, y + 46, 90, 16, 6, "#2e2c34"); ctx.beginPath(); ctx.arc(x + 81, y + 88, 18, 0.5 * Math.PI, 1.5 * Math.PI); ctx.arc(x + 88, y + 88, 14, 1.5 * Math.PI, 0.5 * Math.PI, true); ctx.closePath(); A.fill("#e8d8a0"); box(x + 46, y + 52, 10, 60, 4, rgba("#ffffff", 0.12)); }
      else if (!leer) ding(Math.floor(r() * 8), x + cb / 2, y + ch / 2 - 6, r);
      if (leer) { ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.fillStyle = rgrad(x + cb / 2, y + ch / 2, 0, 120, [[0, rgba(P.licht, 0.35 * (0.85 + 0.15 * Math.sin(t * 2)))], [1, rgba(P.licht, 0)]]); ctx.fillRect(x - 40, y - 40, cb + 80, ch + 80); ctx.restore(); }
      if (Number(s.fach) === n || leer) { ctx.lineWidth = 6; ctx.strokeStyle = rgba("#fff2b0", 0.7 + 0.3 * Math.sin(t * 3)); A.rr(x - 3, y - 3, cb + 6, ch + 6, 10); ctx.stroke(); glut(x + cb / 2, y + ch / 2, 200, "#ffe08a", 0.25); }
      // Nummernschild
      box(x + cb / 2 - 26, y + ch - 30, 52, 26, 6, "#f6eedc"); A.text(String(n), x + cb / 2, y + ch - 17, 20, "#3a2a22", "center", 900);
    }
    // Hängelampen
    for (const lx of [560, 930]) { line(lx, -400, lx, 60, 4, "#3a2a22"); ctx.beginPath(); ctx.moveTo(lx - 60, 120); ctx.quadraticCurveTo(lx, 30, lx + 60, 120); ctx.closePath(); A.fill("#2f5a52");
      ellipse(lx, 122, 54, 10, "#fff2c8"); glut(lx, 140, 340, P.licht, zeit === "tag" ? 0.35 : 0.6); A.licht(lx, 140, 360, P.licht, 0.8); }
    // Lichtstrahlen aus dem Fenster mit Staub (schräg nach rechts unten)
    if (zeit !== "nacht") { ctx.save(); ctx.globalCompositeOperation = "screen";
      for (const [x0, b, a] of [[fx + 40, 120, 0.16], [fx + 150, 90, 0.12], [fx + 230, 60, 0.1]]) { ctx.fillStyle = lgrad(fx, fy, 900, 1500, [[0, rgba(P.licht, a)], [1, rgba(P.licht, 0)]]); poly([[x0, fy + 40], [x0 + b, fy + 40], [x0 + b + 760, fy + 1180], [x0 + 520, fy + 1180]]); ctx.fill(); }
      { const r = rnd(211); for (let i = 0; i < 46; i++) { const f = r(), x = fx + 80 + f * 700 + Math.sin(t * 0.4 + i) * 20, y = fy + 120 + f * 900 + (r() - 0.5) * 200 + Math.cos(t * 0.3 + i) * 14; circle(x, y, 2 + r() * 2.5, rgba("#fffbe8", 0.5 * (0.5 + 0.5 * Math.sin(t * 1.4 + i)))); } }
      ctx.restore(); }
    // Boden (Linoleum mit Fliesenfugen in Perspektive)
    const by = 1330;
    ctx.fillStyle = lgrad(0, by, 0, 2100, [[0, shade(P.boden, 0.12)], [1, shade(P.boden, -0.3)]]); ctx.fillRect(-1500, by, 4080, 1600);
    for (let k = -8; k <= 8; k++) line(540 + k * 90, by, 540 + k * 300, 2200, 3, rgba("#000000", 0.12));
    for (let k = 1; k < 7; k++) { const y = by + Math.pow(k / 7, 1.6) * 900; line(-1500, y, 2600, y, 3, rgba("#000000", 0.1)); }
    ellipse(540, by + 300, 600, 90, rgba(P.licht, 0.12));
    // Theke
    { const ty = 1190; ellipse(540, ty + 190, 760, 40, rgba("#1a0e08", 0.4));
      box(-120, ty + 30, 1320, 160, 10, "#b8553a"); box(-120, ty + 30, 1320, 160, 10, rgba("#000000", 0.0));
      for (let k = 0; k < 9; k++) box(-100 + k * 150, ty + 50, 130, 120, 8, shade("#b8553a", -0.12));
      box(-140, ty, 1360, 40, 10, "#e8d6b8"); box(-140, ty, 1360, 8, 4, rgba("#ffffff", 0.5)); box(-140, ty + 32, 1360, 8, 0, rgba("#000000", 0.15));
      // Klingel
      ellipse(170, ty + 4, 44, 10, "#6a5a4a"); ctx.beginPath(); ctx.arc(170, ty, 36, Math.PI, 0); A.fill("#d8c070"); circle(170, ty - 40, 8, "#d8c070"); ellipse(158, ty - 18, 10, 6, rgba("#ffffff", 0.5));
      // Quittungsblock mit roter Schnur
      box(300, ty - 26, 150, 28, 4, "#fbf6ea"); box(304, ty - 34, 142, 10, 3, "#f0e6d0"); for (let k = 0; k < 4; k++) line(314, ty - 18 + k * 5, 420 - k * 12, ty - 18 + k * 5, 2, rgba("#3a2a22", 0.35));
      ctx.beginPath(); ctx.moveTo(445, ty - 20); ctx.bezierCurveTo(480, ty - 10, 470, ty + 30, 500, ty + 60); ctx.lineWidth = 4; ctx.strokeStyle = "#d8443a"; ctx.stroke();
      // Stempel
      box(560, ty - 20, 70, 22, 6, "#2d2a30"); box(580, ty - 62, 30, 44, 8, "#8a5a3a"); circle(595, ty - 68, 18, "#8a5a3a");
      // Spendenkasse
      if (s.kasse) { box(720, ty - 90, 200, 92, 10, "#3f8a5a"); box(720, ty - 90, 200, 20, 8, shade("#3f8a5a", 0.15)); box(790, ty - 82, 60, 8, 4, "#1e3a2a"); box(808, ty - 50, 24, 30, 4, "#e8c44a"); glut(820, ty - 40, 180, "#9fe0a8", 0.2); }
      else { for (let k = 0; k < 3; k++) box(760 + k * 14, ty - 60 + k * 18, 160, 18, 3, ["#f0e6d8", "#e8d6b8", "#fbf6ea"][k]); }
    }
    // Figuren vor der Theke
    A.figurenZeigen(s, t, s.figur_y ?? (s.gross ? 1660 : 1560), s.gross ? 0.95 : 0.8);
    // Vordergrund: unscharfe Garderobe mit Mänteln links, Schirmständer rechts
    ebene("fhvorne", 14, () => {
      const d = shade(P.boden, -0.6);
      box(-60, 600, 40, 1700, 16, d); for (const [dx, dy, rx, ry] of [[0, 900, 150, 300], [-40, 1100, 130, 320], [60, 1300, 120, 280]]) ellipse(-40 + dx, dy, rx, ry, shade(d, 0.05));
      box(960, 1700, 200, 520, 30, d); for (let k = 0; k < 3; k++) line(1000 + k * 50, 1700, 980 + k * 60, 1300 - k * 60, 22, shade(d, 0.08));
      circle(1100, 2100, 260, shade(d, -0.05));
    });
    A._dunkel = 0;
  };

  // =====================================================================
  // ARCHIV – Papierarchiv des Fundhauses (s04): blaue Regalgasse in Fluchtperspektive, Kartons und Papierbündel mit
  // Schnur, Leuchtröhren mit Lichtkegeln und Staub, kleines Fenster am Ende, gebündelte Stapel vorne.
  // (flackern = eine Röhre flackert, buendel = großer Stapel mit roter Markierung vorne, sackkarre = Sackkarre rollt
  //  auf den Stapel zu, licht=seite (schräges Fensterlicht von rechts), gross, figur_y)
  // =====================================================================
  SZ.archiv = (s, t) => {
    const P = { wand: "#1c2a5a", regal: "#2c4486", regalS: "#1a2a5c", karton: ["#c89a5a", "#d8b070", "#b8844a", "#e0c48a"], papier: "#eef2fa", roehre: "#e8f4ff", boden: "#18224a", fenster: "#a8d8ff" };
    const vx = 540, vy = 860;
    ctx.fillStyle = lgrad(0, -600, 0, 2000, [[0, shade(P.wand, -0.3)], [0.45, P.wand], [1, shade(P.wand, -0.2)]]); ctx.fillRect(-1500, -1500, 4080, 3600);
    // Ende der Gasse: Wand mit kleinem Fenster
    box(vx - 150, vy - 260, 300, 380, 6, shade(P.wand, 0.12));
    box(vx - 60, vy - 200, 120, 150, 6, P.fenster); line(vx, vy - 200, vx, vy - 50, 6, shade(P.wand, 0.12)); glut(vx, vy - 125, 380, P.fenster, 0.5); A.licht(vx, vy - 125, 320, P.fenster, 0.8);
    // Boden der Gasse
    ctx.fillStyle = lgrad(0, vy + 120, 0, 2100, [[0, shade(P.boden, 0.25)], [1, shade(P.boden, -0.2)]]); poly([[vx - 150, vy + 120], [vx + 150, vy + 120], [1600, 2400], [-520, 2400]]); ctx.fill();
    for (let k = 1; k < 9; k++) { const f = Math.pow(k / 9, 1.8), y = lerp(vy + 120, 2300, f), w = lerp(150, 1060, f); line(vx - w, y, vx + w, y, 3, rgba("#000010", 0.15)); }
    ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.fillStyle = lgrad(0, vy + 120, 0, 1800, [[0, rgba(P.fenster, 0.25)], [1, rgba(P.fenster, 0)]]); poly([[vx - 60, vy + 120], [vx + 60, vy + 120], [vx + 260, 1800], [vx - 260, 1800]]); ctx.fill(); ctx.restore();
    // Regalwände links und rechts in Perspektive
    const seite = (sg) => {
      const nahX = sg < 0 ? -80 : 1160, ferX = vx + sg * 150, oben = (f) => lerp(-100, vy - 260, f), unten = (f) => lerp(2050, vy + 120, f), X = (f) => lerp(nahX, ferX, f);
      poly([[X(0), oben(0)], [X(1), oben(1)], [X(1), unten(1)], [X(0), unten(0)]], P.regal);
      const r = rnd(sg < 0 ? 401 : 409);
      // Fächer: 7 Böden, Kartons und Bündel dazwischen
      const boeden = 7, spalten = 9;
      for (let j = 0; j < spalten; j++) {
        const f0 = Math.pow(j / spalten, 0.75), f1 = Math.pow((j + 1) / spalten, 0.75);
        for (let b = 0; b < boeden; b++) {
          const g0 = b / boeden, g1 = (b + 1) / boeden, yA = (f) => lerp(oben(f), unten(f), g0), yB = (f) => lerp(oben(f), unten(f), g1);
          const d = 0.12, h = 0.82;
          const qa = [[X(f0 + (f1 - f0) * d), lerp(yA(f0), yB(f0), 1 - h)], [X(f1 - (f1 - f0) * d), lerp(yA(f1), yB(f1), 1 - h)], [X(f1 - (f1 - f0) * d), yB(f1)], [X(f0 + (f1 - f0) * d), yB(f0)]];
          const art = r();
          if (art < 0.55) { const fc = P.karton[Math.floor(r() * 4)]; poly(qa, mix(fc, P.regal, 0.25 + f0 * 0.4)); const mx0 = (qa[0][0] + qa[1][0]) / 2, my0 = (qa[0][1] + qa[3][1]) / 2; line(mx0 - 12 * (1 - f0), my0, mx0 + 12 * (1 - f0), my0, 6 * (1 - f0) + 1, rgba("#ffffff", 0.5)); }
          else if (art < 0.9) { for (let k = 0; k < 4; k++) { const u = k / 4, v = (k + 1) / 4; poly([[lerp(qa[3][0], qa[2][0], 0), lerp(qa[0][1], qa[3][1], u)], [lerp(qa[3][0], qa[2][0], 1), lerp(qa[1][1], qa[2][1], u)], [qa[2][0], lerp(qa[1][1], qa[2][1], v)], [qa[3][0], lerp(qa[0][1], qa[3][1], v)]], mix(k % 2 ? P.papier : "#d8e0f0", P.regal, 0.2 + f0 * 0.5)); }
            line((qa[0][0] + qa[1][0]) / 2, qa[0][1], (qa[3][0] + qa[2][0]) / 2, qa[3][1], 3 * (1 - f0) + 1, rgba("#d8443a", 0.7)); }
        }
        // Regalpfosten
        line(X(f0), oben(f0), X(f0), unten(f0), 14 * (1 - f0) + 2, P.regalS);
      }
      for (let b = 0; b <= boeden; b++) { const g = b / boeden; line(X(0), lerp(oben(0), unten(0), g), X(1), lerp(oben(1), unten(1), g), 12, shade(P.regal, 0.18)); }
      // Kantenlicht
      line(X(0), oben(0), X(1), oben(1), 4, rgba(P.roehre, 0.2));
    };
    seite(-1); seite(1);
    // Leuchtröhren an der Decke (in Perspektive), eine flackert
    for (let k = 0; k < 4; k++) {
      const f = Math.pow(k / 4, 0.8), y = lerp(-60, vy - 300, f), w = lerp(220, 50, f);
      const an = s.flackern && k === 1 ? (Math.sin(t * 23) > 0.2 || Math.sin(t * 1.3) > 0.4 ? 1 : 0.25) : 1;
      line(vx, y - 120, vx, y - 10, 3, "#0e1430"); box(vx - w, y - 12, w * 2, 22 * (1 - f) + 6, 10, rgba(P.roehre, 0.4 + 0.6 * an));
      glut(vx, y, 420 * (1 - f * 0.6), "#bfe0ff", 0.4 * an); if (an > 0.5) A.licht(vx, y, 380 * (1 - f * 0.6), "#bfe0ff", 0.6);
      if (k < 2) { ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.fillStyle = lgrad(0, y, 0, y + 1500, [[0, rgba("#bfe0ff", 0.14 * an)], [1, rgba("#bfe0ff", 0)]]); poly([[vx - w, y], [vx + w, y], [vx + w * 2.8, y + 1500], [vx - w * 2.8, y + 1500]]); ctx.fill(); ctx.restore(); }
    }
    // Seitliches Fensterlicht (schräg)
    if (s.licht === "seite") { ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.fillStyle = lgrad(1100, 300, 300, 1500, [[0, rgba("#ffe6b0", 0.35)], [1, rgba("#ffe6b0", 0)]]); poly([[1200, 200], [1200, 520], [200, 1700], [-100, 1500]]); ctx.fill(); ctx.restore(); }
    // Staub
    { const r = rnd(421); for (let i = 0; i < 60; i++) { const x = 200 + r() * 700 + Math.sin(t * 0.3 + i) * 24, y = 100 + ((r() * 1500 + t * 12) % 1500), a = 0.5 + 0.5 * Math.sin(t * 1.6 + i * 2); circle(x, y, 1.8 + r() * 2.4, rgba("#e8f2ff", 0.4 * a)); } }
    // Bündel vorne (Papierstapel mit Schnur, einer mit roter Markierung)
    if (s.buendel) { const bx = 860, byy = 1500;
      ellipse(bx, byy + 10, 180, 30, rgba("#000010", 0.4));
      for (let k = 0; k < 6; k++) { const w = 150 - (k % 2) * 12, y = byy - 40 - k * 44; box(bx - w, y, w * 2, 44, 6, k % 2 ? "#e4eaf6" : P.papier); for (let q = 0; q < 3; q++) line(bx - w + 8, y + 12 + q * 10, bx + w - 8, y + 12 + q * 10, 2, rgba("#8a9ac0", 0.35)); }
      line(bx, byy - 300, bx, byy - 4, 6, "#c89a5a"); line(bx - 150, byy - 160, bx + 150, byy - 160, 6, "#c89a5a");
      box(bx + 70, byy - 330, 70, 90, 6, "#d8443a"); glut(bx + 105, byy - 285, 140, "#ff7a6a", 0.3 * (0.8 + 0.2 * Math.sin(t * 3))); }
    if (s.sackkarre) { const kx = 140 + Math.min(t * 45, 360), ky = 1640;
      ellipse(kx + 60, ky + 12, 110, 14, rgba("#000010", 0.4)); line(kx, ky - 420, kx + 40, ky, 14, "#8a96b0"); line(kx + 30, ky - 420, kx + 70, ky, 0.1, "#8a96b0");
      box(kx + 30, ky - 16, 140, 16, 4, "#8a96b0"); circle(kx + 40, ky, 30, "#1a1a24"); circle(kx + 40, ky, 12, "#5a6680"); line(kx - 20, ky - 440, kx + 20, ky - 420, 14, "#d8443a"); }
    // Figuren
    A.figurenZeigen(s, t, s.figur_y ?? (s.gross ? 1660 : 1580), s.gross ? 0.95 : 0.78);
    // Vordergrund: unscharfe Kartons an den Rändern
    ebene("arvorne", 14, () => { const d = "#0a1030";
      box(-160, 1700, 420, 360, 20, d); box(-120, 1480, 300, 240, 16, shade(d, 0.05)); box(900, 1760, 360, 320, 20, d); box(980, 1560, 240, 220, 16, shade(d, 0.05));
    });
    A._dunkel = 0;
  };

  // ---- Icons für s04 (Quittung, Spendenkasse, Stoffvogel, Stempel, Blechdose, Armbanduhr) ----
  Object.assign(A.I, {
    quittung(t) { ctx.save(); ctx.rotate(-0.06); box(-120, -170, 240, 340, 10, "#fbf6ea"); box(-120, -170, 240, 50, 10, "#e8b43a");
      for (let k = 0; k < 8; k++) box(-90, -90 + k * 30, k % 3 === 2 ? 110 : 180, 9, 4, A.rgba("#5a4a3a", 0.35));
      box(30, 110, 70, 28, 6, A.rgba("#3f7ac8", 0.25)); ctx.beginPath(); ctx.moveTo(-80, 130); ctx.bezierCurveTo(-50, 100, -20, 150, 20, 120); ctx.lineWidth = 6; ctx.strokeStyle = "#2c3a6a"; ctx.stroke();
      circle(-95, -145, 9, "#7a5a3a"); ctx.beginPath(); ctx.moveTo(-95, -145); ctx.bezierCurveTo(-160, -200, -170, -60, -200, -20); ctx.lineWidth = 5; ctx.strokeStyle = "#d8443a"; ctx.stroke(); ctx.restore(); },
    kasse(t) { box(-150, -70, 300, 150, 18, "#3f8a5a"); box(-150, -90, 300, 50, 16, A.shade("#3f8a5a", 0.12)); box(-50, -78, 100, 12, 6, "#1e3a2a"); box(-20, -10, 40, 50, 6, "#e8c44a"); circle(0, 8, 8, "#7a5a1a");
      box(-140, -84, 20, 150, 8, A.rgba("#ffffff", 0.15)); for (let k = 0; k < 3; k++) { const a = 0.5 + 0.5 * Math.sin(t * 3 + k * 2); circle(-110 + k * 110, -110, 6, A.rgba("#ffffff", 0.7 * a)); } },
    stoffvogel(t) { const w = Math.sin(t * 2) * 0.06; ellipse(0, 20, 110, 85, "#d8443a"); circle(70, -50, 55, "#d8443a"); poly([[115, -55], [160, -42], [115, -30]], "#e8b43a"); circle(85, -60, 9, "#2a1a14");
      ctx.save(); ctx.translate(-10, 0); ctx.rotate(-0.4 + w); ellipse(-60, -20, 80, 36, "#b8302a"); ctx.restore();
      ctx.save(); ctx.translate(10, 10); ctx.rotate(0.3 - w); ellipse(-40, 30, 56, 30, "#e07a5a"); for (let k = 0; k < 5; k++) line(-80 + k * 18, 22, -72 + k * 18, 38, 4, "#f6eedc"); ctx.restore();
      poly([[-100, 20], [-170, 0], [-160, 50]], "#b8302a"); ellipse(-20, 50, 50, 20, A.rgba("#ffffff", 0.12)); },
    stempel(t) { box(-110, 40, 220, 60, 14, "#2d2a30"); box(-100, 90, 200, 16, 6, "#3f7ac8"); box(-40, -60, 80, 110, 18, "#8a5a3a"); circle(0, -90, 52, "#8a5a3a"); ellipse(-14, -104, 18, 10, A.rgba("#ffffff", 0.3));
      line(-60, 70, 60, 70, 6, A.rgba("#ffffff", 0.2)); },
    blechdose(t) { box(-110, -80, 220, 180, 22, "#1e1c22"); box(-120, -100, 240, 44, 16, "#2e2c34"); box(-90, -60, 26, 140, 10, A.rgba("#ffffff", 0.1));
      ctx.beginPath(); ctx.arc(0, 20, 50, 0.5 * Math.PI, 1.5 * Math.PI); ctx.arc(20, 20, 38, 1.5 * Math.PI, 0.5 * Math.PI, true); ctx.closePath(); A.fill("#e8d8a0");
      ellipse(70, -60, 14, 6, A.rgba("#000000", 0.4)); },
    armbanduhr(t) { box(-46, -190, 92, 380, 30, "#5a3a26"); for (let k = 0; k < 6; k++) circle(0, -150 + k * 60 + (k > 2 ? 60 : 0), 5, "#3a2418"); circle(0, 0, 100, "#c8ccd4"); circle(0, 0, 84, "#f6f2e8");
      for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; line(Math.sin(a) * 66, -Math.cos(a) * 66, Math.sin(a) * 74, -Math.cos(a) * 74, 4, "#2d2a30"); }
      line(0, 0, 30, -30, 8, "#2d2a30"); line(0, 0, -10, -60, 6, "#2d2a30"); ctx.save(); ctx.rotate(t * 1.05); line(0, 12, 0, -70, 3, "#d8443a"); ctx.restore(); circle(0, 0, 7, "#d8443a"); box(96, -14, 22, 28, 6, "#c8ccd4"); },
  });
  for (const n of ["quittung", "kasse", "stoffvogel", "stempel", "blechdose", "armbanduhr"]) if (!A.ICONS.includes(n)) A.ICONS.push(n);
})();
