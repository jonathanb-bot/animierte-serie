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
})();
