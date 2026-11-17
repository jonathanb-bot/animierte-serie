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

  // =====================================================================
  // NACHTBUS – Innenraum des letzten Nachtbusses (s05 „Haltestelle Mühlenweg“): große dunkle Scheiben als Spiegel,
  // draußen ziehende Nacht in Tiefenunschärfe, gelbe Haltestangen und Halteschlaufen, Leuchtband an der Decke,
  // Fahrgastanzeige mit LED-Schrift und Uhrzeit, blaue Sitzreihe, gerippter Boden.
  // (anzeige="Mühlenweg" (Text nach „Nächster Halt“), anzeige_oben="Nächster Halt", uhr="0:12", halt (rotes HALT leuchtet),
  //  draussen=stadt|nebel|wasser|staumauer|steht (Standard stadt), beschlagen (Scheiben beschlagen), schrift="TEXT"
  //  (mit dem Finger in die beschlagene Scheibe geschrieben), spiegel=N (N Gestalten nur im Spiegelbild, ohne Gesicht),
  //  paul=1 (Junge mit nassen Haaren und rotem Ranzen im Spiegelbild neben dir), eindruck (Polster neben dir eingedrückt),
  //  spuren (nasse Fußabdrücke zur Tür), tropfen (Wasser tropft von den Sitzen), knopf (großer Halteknopf vorne im Bild),
  //  flackern (Leuchtband flackert), sitzen (Figuren sitzen), blick=vorne (Fahrerplatz: Frontscheibe, Lenkrad, Straße
  //  im Scheinwerferlicht, Figur hinter dem Lenkrad), gross, figur_y)
  // =====================================================================
  SZ.nachtbus = (s, t) => {
    const P = { nacht: "#060a1c", nacht2: "#0e1838", glas: "#0b1430", rahmen: "#1a2440", decke: "#141c34", band: "#dff0ff",
      gelb: "#e8b830", sitz: "#2a4a8a", sitzM: "#3a64b0", boden: "#1c2236", led: "#ffb23a", wasser: "#7fb8ff" };
    const draussen = s.draussen || "stadt", faehrt = draussen !== "steht" && draussen !== "staumauer" ? 1 : 0;
    const fl = s.flackern ? (Math.sin(t * 23) > 0.6 || Math.sin(t * 7.3) > 0.93 ? 0.35 : 1) : 1;
    // ---- Draußen (unscharf, zieht vorbei) ----
    const draussenMalen = (y0, y1, breit) => {
      ctx.fillStyle = lgrad(0, y0, 0, y1, [[0, P.nacht], [1, P.nacht2]]); ctx.fillRect(-1500, y0, 4080, y1 - y0);
      const v = faehrt ? t * 260 : 0, r = rnd(311);
      if (draussen === "stadt") {
        for (let i = 0; i < 30; i++) { const x = ((r() * 2400 - v * (0.6 + r() * 0.6)) % 2400 + 2400) % 2400 - 700, y = y0 + 60 + r() * (y1 - y0 - 120);
          const c = r() < 0.6 ? "#ffcf7a" : "#9fd0ff"; glut(x, y, 60 + r() * 90, c, 0.85); circle(x, y, 6 + r() * 6, rgba("#ffffff", 0.8)); }
        for (let i = 0; i < 8; i++) { const x = ((r() * 2400 - v) % 2400 + 2400) % 2400 - 700; box(x, y0 + (y1 - y0) * 0.35, 180 + r() * 160, (y1 - y0), 6, rgba("#020512", 0.6)); }
      } else if (draussen === "nebel") {
        for (let i = 0; i < 6; i++) { const x = ((r() * 2000 - v * 0.5) % 2000 + 2000) % 2000 - 500; ellipse(x, y0 + (y1 - y0) * (0.4 + r() * 0.4), 420, 50, rgba("#8fb0d8", 0.1)); }
        for (const off of [0, 1100]) { const lx2 = ((300 + off - v * 0.7) % 2200 + 2200) % 2200 - 600; line(lx2, y1, lx2, y0 + 120, 10, "#050816"); glut(lx2 + 30, y0 + 120, 260, "#ffe6b0", 0.8); circle(lx2 + 30, y0 + 120, 12, "#fff6dc"); }
        const lx = ((900 - v * 0.7) % 2200 + 2200) % 2200 - 600; line(lx, y1, lx, y0 + 80, 10, "#050816"); glut(lx + 30, y0 + 80, 220, "#ffe6b0", 0.7);
        ctx.fillStyle = rgba("#9fb8e0", 0.16); ctx.fillRect(-1500, y0, 4080, y1 - y0);
      } else if (draussen === "wasser" || draussen === "staumauer") {
        const hy = y0 + (y1 - y0) * 0.42;
        ctx.fillStyle = lgrad(0, hy, 0, y1, [[0, "#0a1834"], [1, "#03060f"]]); ctx.fillRect(-1500, hy, 4080, y1 - hy);
        for (let i = 0; i < 18; i++) { const x = ((r() * 2400 - v * 0.4) % 2400 + 2400) % 2400 - 700, y = hy + 20 + r() * (y1 - hy - 30); box(x, y, 60 + r() * 140, 4, 2, rgba("#9fc4ff", 0.12 + 0.12 * Math.sin(t * 2 + i))); }
        glut(760, y0 + 70, 260, "#c8d8ff", 0.35); circle(760, y0 + 70, 26, "#e8f0ff");
        if (draussen === "staumauer") { for (let x = -200; x < 1400; x += 90) line(x, hy - 40, x, hy + 30, 8, "#0a1024"); line(-200, hy - 40, 1400, hy - 40, 10, "#0a1024");
          line(300, hy + 30, 300, y0 + 40, 12, "#050816"); glut(330, y0 + 50, 240, "#ffe6b0", 0.75); }
        ctx.fillStyle = rgba("#8fb0d8", 0.1); ctx.fillRect(-1500, hy - 60, 4080, 90);
      }
    };
    if (s.blick === "vorne") {
      // Frontscheibe
      ebene("nbfront", 2.5, () => {
        draussenMalen(-200, 1250, true);
        // Straße im Scheinwerferlicht
        const hy = 760; ctx.fillStyle = "#11182c"; poly([[470, hy], [610, hy], [1500, 1250], [-420, 1250]]); ctx.fill();
        ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.fillStyle = lgrad(0, 1250, 0, hy, [[0, rgba("#fff1c8", 0.55)], [1, rgba("#fff1c8", 0)]]); poly([[-200, 1250], [1280, 1250], [640, hy], [440, hy]]); ctx.fill(); ctx.restore();
        for (let k = 0; k < 7; k++) { const f = ((k / 7 + (faehrt ? t * 0.6 : 0)) % 1), y = lerp(hy, 1250, f * f), w = lerp(4, 40, f * f); box(540 - w / 2, y, w, lerp(10, 90, f * f), 3, rgba("#f2eee0", 0.7)); }
        if (draussen === "nebel") { ctx.fillStyle = rgba("#a8c0e8", 0.22); ctx.fillRect(-1500, 500, 4080, 750); }
      });
      // Rahmen, Rückspiegel, Armaturen
      box(-1500, -400, 4080, 380, 0, P.decke); box(-1500, 1420, 4080, 1200, 0, "#0c1226"); box(-1500, 1420, 4080, 14, 0, rgba("#9fc4ff", 0.25));
      for (const x of [-60, 1060]) box(x - 50, -400, 100, 1900, 30, P.rahmen);
      box(560, 30, 340, 130, 30, "#0a0f20"); box(574, 42, 312, 106, 24, "#1e2c50"); ellipse(660, 85, 70, 18, rgba("#9fc4ff", 0.25));
      A.figurenZeigen(s, t, s.figur_y ?? 2080, s.gross ? 1.45 : 1.3, [330]);
      // Lenkrad vor der Figur
      ctx.save(); ctx.translate(330, 1900); ctx.rotate(faehrt ? Math.sin(t * 0.7) * 0.08 : (s.lenkrad_dreht ? t * 0.9 : 0));
      ctx.beginPath(); ctx.arc(0, 0, 250, 0, Math.PI * 2); ctx.lineWidth = 48; ctx.strokeStyle = "#1a2342"; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 250, 3.6, 5.2); ctx.lineWidth = 10; ctx.strokeStyle = rgba("#9fc4ff", 0.35); ctx.stroke();
      line(-240, 0, 240, 0, 36, "#1a2342"); line(0, 0, 0, 240, 36, "#1a2342"); circle(0, 0, 66, "#243058"); ctx.restore();
      // Armaturen rechts: Linienanzeige, Uhr, Lämpchen
      if (s.anzeige) { box(600, 1470, 420, 110, 18, "#05070f"); A.text(String(s.anzeige).toUpperCase(), 810, 1527, 50, P.led, "center", 800, "Titel", 380); glut(810, 1527, 240, P.led, 0.35 * fl); }
      if (s.uhr) { box(680, 1610, 260, 100, 18, "#05070f"); A.text(String(s.uhr), 810, 1662, 62, "#7fe0ff", "center", 800); }
      for (let k = 0; k < 5; k++) circle(660 + k * 75, 1770, 15, k % 3 ? rgba("#59c7ff", 0.8) : rgba("#ff8a3a", 0.85));
      ebene("nbfvorne", 12, () => { box(-200, -400, 200, 3000, 40, "#03050c"); box(1060, -400, 220, 3000, 40, "#03050c"); });
      A._dunkel = 0; return;
    }
    // ---- Seitenblick: Fenster ----
    const wy0 = 330, wy1 = 1130;
    ebene("nbdraussen", 4, () => draussenMalen(wy0 - 40, wy1 + 40));
    // Glas: dunkle Spiegelung
    ctx.fillStyle = rgba(P.glas, 0.3); ctx.fillRect(-1500, wy0, 4080, wy1 - wy0);
    // Spiegelbild des Innenraums (Leuchtband, Sitzlehnen)
    ctx.save(); ctx.globalAlpha = 0.22; box(-1500, wy0 + 30, 4080, 18, 9, P.band);
    for (let x = -340; x < 1500; x += 300) box(x, wy1 - 260, 220, 260, 40, "#4a6ab0"); ctx.restore();
    // Gestalten nur im Spiegelbild (ohne Gesicht, nasses Haar, alte Kleidung)
    const gestalt = (x, y, k, farbe, ranzen) => {
      ctx.save(); ctx.globalAlpha = 0.62 + 0.08 * Math.sin(t * 1.3 + x);
      const hy = y - 250 * k;
      box(x - 115 * k, y - 175 * k, 230 * k, 260 * k, 70 * k, farbe); // Mantel/Schultern
      if (ranzen) { box(x + 60 * k, y - 175 * k, 110 * k, 140 * k, 22 * k, "#ff6a5a"); box(x + 72 * k, y - 160 * k, 86 * k, 24 * k, 10 * k, "#ffb0a0"); }
      ellipse(x, hy, 66 * k, 80 * k, "#a8c0e8"); // Kopf, kein Gesicht
      // nasses Haar: Kappe oben, an den Seiten bis unters Kinn, zwei Strähnen übers Gesicht
      ctx.beginPath(); ctx.moveTo(x - 78 * k, hy + 70 * k); ctx.quadraticCurveTo(x - 92 * k, hy - 95 * k, x, hy - 92 * k); ctx.quadraticCurveTo(x + 92 * k, hy - 95 * k, x + 78 * k, hy + 70 * k);
      ctx.lineTo(x + 50 * k, hy + 75 * k); ctx.quadraticCurveTo(x + 50 * k, hy - 30 * k, x, hy - 40 * k); ctx.quadraticCurveTo(x - 50 * k, hy - 30 * k, x - 50 * k, hy + 75 * k); ctx.closePath(); ctx.fillStyle = "#16233f"; ctx.fill();
      for (const dx of [-18, 14]) line(x + dx * k, hy - 40 * k, x + dx * 1.3 * k, hy + 40 * k, 10 * k, "#16233f");
      for (let j = 0; j < 3; j++) { const ty = y - 120 * k + ((t * 60 + j * 70) % 220) * k; ellipse(x - 50 * k + j * 50 * k, ty, 5 * k, 9 * k, rgba("#dff0ff", 0.85)); }
      glut(x, hy, 160 * k, "#bcd6ff", 0.18);
      ctx.restore();
    };
    const nG = Number(s.spiegel || 0);
    const gx = s.paul ? [120, 330, 560] : [170, 560, 930]; for (let i = 0; i < nG; i++) gestalt(gx[i % 3], wy1 - 20, 0.95 - (i % 3) * 0.08, ["#5a6e98", "#6a5e88", "#4e6a8a"][i % 3], false);
    if (s.paul) gestalt(s.paul_x ? Number(s.paul_x) : 800, wy1 - 30, 0.92, "#7a9ad8", true);
    // beschlagen + Schrift
    if (s.beschlagen || s.schrift) {
      ebene("nbbeschlag", 10, () => { ctx.fillStyle = rgba("#c8d8f0", 0.28); ctx.fillRect(-1500, wy0, 4080, wy1 - wy0); for (let i = 0; i < 20; i++) { const r = rnd(321 + i); ellipse(r() * 1100, wy0 + r() * (wy1 - wy0), 120, 60, rgba("#e0ecff", 0.08)); } });
      if (s.schrift) { const txt = String(s.schrift), n = txt.length, zeig = Math.max(1, Math.min(n, Math.floor(t * 3.2) + 1)), shown = txt.slice(0, zeig);
        ctx.save(); ctx.globalCompositeOperation = "destination-out"; ctx.restore();
        A.text(shown, 540, 700, 150, rgba("#04081a", 0.85), "center", 700, "Titel", 900);
        A.text(shown, 540, 700, 150, rgba("#9fc4ff", 0.18), "center", 700, "Titel", 900);
        for (let j = 0; j < Math.min(zeig, 8); j++) { const dx = 540 - (n * 45) + j * 95, dl = ((t * 40 + j * 37) % 140); box(dx, 760, 7, 30 + dl, 3, rgba("#04081a", 0.7)); } }
    }
    // Fensterrahmen und Holme
    box(-1500, wy0 - 30, 4080, 34, 0, P.rahmen); box(-1500, wy1, 4080, 40, 0, P.rahmen);
    for (const x of [-120, 380, 880, 1380]) box(x - 26, wy0 - 30, 52, wy1 - wy0 + 70, 10, P.rahmen);
    // Decke, Leuchtband, Halteschlaufen
    ctx.fillStyle = lgrad(0, -400, 0, wy0 - 30, [[0, "#070b18"], [1, P.decke]]); ctx.fillRect(-1500, -400, 4080, wy0 + 370);
    box(-1500, 40, 4080, 26, 13, rgba(P.band, 0.95 * fl)); glut(540, 54, 900, "#bcdcff", 0.35 * fl);
    ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.fillStyle = lgrad(0, 66, 0, 700, [[0, rgba("#cfe6ff", 0.18 * fl)], [1, rgba("#cfe6ff", 0)]]); ctx.fillRect(-1500, 66, 4080, 640); ctx.restore();
    line(-1500, 190, 2600, 190, 16, P.gelb);
    for (let x = -60; x < 1200; x += 170) { const sw = Math.sin(t * 1.6 + x) * (faehrt ? 0.08 : 0.02); ctx.save(); ctx.translate(x, 190); ctx.rotate(sw); line(0, 0, 0, 90, 8, "#2a3350"); ctx.beginPath(); ctx.arc(0, 120, 30, 0, Math.PI * 2); ctx.lineWidth = 10; ctx.strokeStyle = P.gelb; ctx.stroke(); ctx.restore(); }
    // Fahrgastanzeige
    if (s.anzeige || s.uhr) {
      const ax = 140, ay = s.anzeige_y != null ? Number(s.anzeige_y) : 210, aw = 800, ah = 130;
      box(ax - 10, ay - 10, aw + 20, ah + 20, 18, "#0a0e1c"); box(ax, ay, aw, ah, 12, "#03050b");
      for (let yy = ay + 8; yy < ay + ah; yy += 8) box(ax + 6, yy, aw - 12, 1.5, 0, rgba("#ffffff", 0.03));
      const oben = s.anzeige_oben ?? "Nächster Halt";
      A.text(String(oben), ax + 30, ay + 36, 30, rgba(P.led, 0.75), "left", 700);
      if (s.anzeige) { const blink = s.anzeige_blink ? (Math.sin(t * 5) > -0.2 ? 1 : 0.25) : 1; A.text(String(s.anzeige), ax + 30, ay + 88, 56, rgba(P.led, blink), "left", 800, "Titel", s.uhr ? 540 : 740); }
      if (s.uhr) A.text(String(s.uhr), ax + aw - 30, ay + 66, 64, "#7fe0ff", "right", 800);
      glut(540, ay + 70, 520, P.led, 0.22 * fl);
      if (s.halt) { box(ax + aw - 200, ay + ah + 20, 200, 60, 12, "#3a0a0a"); A.text(String(s.halt_text || "HALT"), ax + aw - 100, ay + ah + 50, 40, "#ff4a3a", "center", 900); glut(ax + aw - 100, ay + ah + 50, 200, "#ff3a2a", 0.6 * (0.8 + 0.2 * Math.sin(t * 6))); }
    }
    // Sitzreihe
    const sy = 1150;
    box(-1500, wy1 + 40, 4080, 70, 0, "#121a30");
    const sitzX = [-250, 120, 490, 860, 1230];
    sitzX.forEach((x, i) => {
      box(x - 160, sy - 10, 320, 330, 46, shade(P.sitz, -0.15)); box(x - 145, sy, 290, 300, 40, P.sitz);
      const r = rnd(331 + i); for (let k = 0; k < 10; k++) { const px = x - 120 + r() * 240, py = sy + 30 + r() * 240; box(px, py, 22, 8, 4, rgba(P.sitzM, 0.8)); box(px + 6, py + 14, 8, 8, 4, rgba("#e8b830", 0.35)); }
      box(x - 170, sy + 300, 340, 90, 30, shade(P.sitz, -0.05)); box(x - 160, sy + 300, 320, 24, 12, rgba("#ffffff", 0.08));
      box(x - 140, sy - 40, 280, 40, 18, "#2a3350"); box(x - 30, sy - 70, 60, 40, 14, P.gelb);
    });
    if (s.eindruck) { const x = s.eindruck_x ? Number(s.eindruck_x) : 860; const k = clamp(t / 2.5, 0, 1); ellipse(x, sy + 330, 110 * k, 26 * k, rgba("#050a1a", 0.6)); ellipse(x, sy + 318, 120 * k, 10 * k, rgba("#ffffff", 0.06)); }
    if (s.tropfen) { const r = rnd(341); for (let i = 0; i < 14; i++) { const x = sitzX[1 + (i % 3)] - 120 + r() * 240, y0 = sy + 390, d = (t * (120 + r() * 80) + r() * 300) % 300; ellipse(x, y0 + d, 5, 9, rgba(P.wasser, 0.85 * (1 - d / 300))); }
      for (const x of [120, 490, 860]) ellipse(x, sy + 330, 90, 14, rgba(P.wasser, 0.25)); }
    // Boden
    ctx.fillStyle = lgrad(0, sy + 390, 0, 2300, [[0, P.boden], [1, "#0a0e1c"]]); ctx.fillRect(-1500, sy + 390, 4080, 1100);
    for (let y = sy + 420; y < 2300; y += 34) line(-1500, y, 2600, y, 4, rgba("#000000", 0.25));
    if (s.spuren) { for (let i = 0; i < 7; i++) { const x = 980 - i * 150 + (i % 2) * 40, y = 1720 - i * 22, a = clamp(t * 1.2 - i * 0.25, 0, 1);
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.2); ellipse(0, 0, 32 * a, 64 * a, rgba(P.wasser, 0.32)); ellipse(-6, -10, 14 * a, 26 * a, rgba("#e0f0ff", 0.25)); ctx.restore(); } }
    // Figuren
    const figY = s.figur_y ?? (s.sitzen ? sy + 330 : 1840);
    if (s.sitzen) { const namen = s.figuren || []; namen.forEach((name, i) => { const f = A.fig(name), xs = s.pos ? String(s.pos).split(",").map(Number) : [490, 860];
      A.figur(xs[i] ?? xs[0], figY, s.gross ? 0.95 : 0.78, f, { t: t + i, pose: "sitzt", ausdruck: (s.ausdruecke || {})[name] || s.ausdruck, spricht: s._spricht && s.sprecher === name, blick: [0, 0], seed: i * 5 + 2 }); }); }
    else A.figurenZeigen(s, t, figY, s.gross ? 1.0 : 0.85);
    // Haltestangen vorne
    for (const x of [40, 1040]) { box(x - 14, -400, 28, 2800, 14, P.gelb); box(x - 8, -400, 8, 2800, 4, rgba("#ffffff", 0.3)); }
    if (s.knopf) { const kx = 930, ky = 980; box(kx - 12, -400, 24, 2800, 12, P.gelb); const an0 = 0, an = s.halt ? 1 : 0.0; box(kx - 70, ky - 90, 140, 180, 30, "#e8e2d0"); circle(kx, ky - 10, 54, s.halt ? "#ff4a3a" : "#c8302a"); A.text("STOP", kx, ky + 66, 30, "#2a3350", "center", 900); if (an) glut(kx, ky - 10, 260, "#ff3a2a", 0.7 * (0.85 + 0.15 * Math.sin(t * 6))); }
    ebene("nbvorne", 14, () => { const d = "#03050e"; box(-200, 1700, 420, 900, 60, d); box(900, 1760, 420, 900, 60, d); });
    A._dunkel = 0;
  };

  // =====================================================================
  // WOHNRING – alternde Raumstation (s06 „Ein Zimmer weniger“): orangefarbener Planet, farbige Zimmertüren, Kuppel.
  //  ansicht=ring (Standard): gekrümmter Ring-Gang, der nach hinten nach oben wegbiegt, Türen links/rechts in Farben,
  //    Glasdecke vorne mit Planet; grau="1,4" (Türen geräumt/grau), warn="2,3" (rotes Warnlicht über Türen),
  //    zerfall=N (Tür N zerfällt in leuchtende Kacheln)
  //  ansicht=zimmer: Zimmer im Ring mit Bullauge: farbe=#hex (Wand), striche (Größenstriche an der Wand), bett,
  //    beete (Pflanzenbeete unter Pflanzenlicht), baum (krummer Baum), tisch, kisten, leer, zerfall (Wand löst sich in Kacheln)
  //  ansicht=kuppel: Gemeinschaftskuppel mit Glasrippen, riesiger Planet; pflanzen, nischen (Stoffbahnen/Schlafnischen),
  //    tisch, stadt (Pappmodelle unter dem Tisch), keimling, lichter
  //  ansicht=aussen: Station von außen vor dem Planeten (Ring mit 12 farbigen Segmenten), grau=N (N graue Segmente)
  //  ansicht=plan: blaues Hologramm des Rings über dem Werkstatttisch; grau="1,2", markiert=N (blinkt), ersatz (gestrichelter Ersatzring)
  //  dazu: gross, figur_y, sitzen
  // =====================================================================
  SZ.wohnring = (s, t) => {
    const P = { all: "#05061a", all2: "#120a2e", planet: "#f08a3a", planetH: "#ffc27a", planetD: "#8a3a2a", metall: "#3a4060",
      metallH: "#5a6290", metallD: "#1c2038", boden: "#262a44", licht: "#ffe8c0", holo: "#59d8ff", warn: "#ff4a3a" };
    const TUER = ["#f2c23a", "#3fb87a", "#e8685a", "#5aa8f2", "#b07ae8", "#f29a3a", "#4ac8c0", "#e87ab0"];
    const liste = v => v == null ? [] : String(v).split(",").map(x => Number(x.trim())).filter(x => !isNaN(x));
    const grau = liste(s.grau), warn = liste(s.warn), ansicht = s.ansicht || "ring";
    // Weltall mit Sternen und Planet
    const all = (px, py, pr, sterne = 90) => {
      ctx.fillStyle = lgrad(0, -400, 0, 2400, [[0, P.all], [0.6, P.all2], [1, "#2a0e2a"]]); ctx.fillRect(-1500, -400, 4080, 2800);
      const r = rnd(611); for (let i = 0; i < sterne; i++) { const x = r() * 1500 - 200, y = r() * 2200 - 200, a = 0.4 + 0.6 * Math.abs(Math.sin(t * (0.5 + r()) + i)); circle(x, y, 1.5 + r() * 3, rgba("#ffffff", a)); }
      glut(px, py, pr * 1.6, P.planet, 0.35);
      ctx.save(); ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = rgrad(px - pr * 0.4, py - pr * 0.4, 0, pr * 1.3, [[0, P.planetH], [0.5, P.planet], [1, P.planetD]]); ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);
      for (let k = 0; k < 7; k++) { const yy = py - pr + (k + 0.5) * pr * 2 / 7 + Math.sin(k * 3.1) * 20; ctx.fillStyle = rgba(k % 2 ? "#ffd8a0" : "#c85a2a", 0.22); ctx.beginPath(); ctx.ellipse(px + Math.sin(t * 0.05 + k) * 30, yy, pr * 1.1, pr * 0.07, 0.15, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = rgrad(px + pr * 0.5, py + pr * 0.4, pr * 0.3, pr * 1.2, [[0, rgba("#000000", 0)], [1, rgba("#1a0820", 0.7)]]); ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);
      ctx.restore();
      ctx.beginPath(); ctx.arc(px, py, pr + 6, Math.PI * 1.05, Math.PI * 1.75); ctx.lineWidth = 14; ctx.strokeStyle = rgba("#ffd9a8", 0.55); ctx.stroke();
    };
    const kacheln = (x0, y0, w, h, farbe, k, seed) => { // Fläche zerfällt in leuchtende Kacheln (k 0..1)
      const r = rnd(seed), n = 7, m = 9, cw = w / n, ch = h / m;
      for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { const d = r(), loes = clamp((k * 1.6 - d * 0.7), 0, 1);
        const x = x0 + i * cw + (r() - 0.5) * 300 * loes, y = y0 + j * ch - loes * (200 + r() * 500), sz = 1 - loes * 0.6;
        if (loes >= 1) continue;
        ctx.save(); ctx.globalAlpha = 1 - loes; ctx.translate(x + cw / 2, y + ch / 2); ctx.rotate(loes * (r() - 0.5) * 3);
        box(-cw * sz / 2 + 2, -ch * sz / 2 + 2, cw * sz - 4, ch * sz - 4, 6, loes > 0.02 ? mix(farbe, "#fff6d0", 0.4) : farbe); ctx.restore();
        if (loes > 0.02) glut(x + cw / 2, y + ch / 2, 50, mix(farbe, "#ffffff", 0.3), 0.5 * (1 - loes)); }
    };
    const figY = s.figur_y ?? 1905, sk = s.gross ? 0.95 : 0.78;
    const figs = () => {
      if (s.sitzen) { const namen = s.figuren || [], xs = s.pos ? String(s.pos).split(",").map(Number) : namen.length > 1 ? [330, 750] : [540];
        namen.forEach((name, i) => A.figur(xs[i] ?? 540, figY, sk * 0.9, A.fig(name), { t: t + i, pose: "sitzt", ausdruck: (s.ausdruecke || {})[name] || s.ausdruck, spricht: s._spricht && s.sprecher === name, blick: [0, 0], seed: i * 5 + 3 })); }
      else A.figurenZeigen(s, t, figY, sk);
    };
    if (ansicht === "aussen") {
      ebene("wrall", 1.2, () => all(260, 1650, 900, 140));
      const cx = 560, cy = 700, R = 450, k = 0.42, rot = t * 0.06, ng = Number(s.grau || 0);
      const seg = (i, vorne) => { const a0 = rot + i / 12 * Math.PI * 2, a1 = a0 + Math.PI * 2 / 12 * 0.86;
        const sy = Math.sin((a0 + a1) / 2); if ((sy > 0) !== vorne) return;
        const pts = []; for (let q = 0; q <= 6; q++) { const a = lerp(a0, a1, q / 6); pts.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R * k]); }
        for (let q = 6; q >= 0; q--) { const a = lerp(a0, a1, q / 6); pts.push([cx + Math.cos(a) * (R - 70), cy + Math.sin(a) * (R - 70) * k + 26]); }
        const g = i < ng, f = g ? "#4a4e60" : TUER[i % TUER.length]; poly(pts, shade(f, vorne ? 0 : -0.35));
        if (!g) { const am = (a0 + a1) / 2; glut(cx + Math.cos(am) * (R - 35), cy + Math.sin(am) * (R - 35) * k + 12, 70, f, vorne ? 0.6 : 0.3); } };
      for (let i = 0; i < 12; i++) seg(i, false);
      for (let i = 0; i < 6; i++) { const a = rot + i / 6 * Math.PI * 2 + 0.25; if (Math.sin(a) <= 0) line(cx, cy, cx + Math.cos(a) * (R - 60), cy + Math.sin(a) * (R - 60) * k, 16, P.metallD); }
      ellipse(cx, cy + 20, 110, 60, P.metallD); ellipse(cx, cy, 110, 60, P.metall);
      ctx.beginPath(); ctx.ellipse(cx, cy - 10, 80, 70, 0, Math.PI, 0); ctx.fillStyle = rgba("#bfe8ff", 0.5); ctx.fill(); glut(cx, cy - 30, 160, s.kuppel_hell ? "#fff0b0" : "#9fd8ff", s.kuppel_hell ? 0.9 : 0.5);
      for (let i = 0; i < 6; i++) { const a = rot + i / 6 * Math.PI * 2 + 0.25; if (Math.sin(a) > 0) line(cx, cy, cx + Math.cos(a) * (R - 60), cy + Math.sin(a) * (R - 60) * k, 16, P.metall); }
      for (let i = 0; i < 12; i++) seg(i, true);
      box(cx - 8, cy - 300, 16, 240, 6, P.metallH); circle(cx, cy - 300, 12, P.warn); glut(cx, cy - 300, 60, P.warn, 0.5 + 0.5 * Math.sin(t * 3));
      A._dunkel = 0; return;
    }
    if (ansicht === "plan") {
      // Werkstatt dunkel, Hologramm über dem Tisch
      ctx.fillStyle = lgrad(0, -400, 0, 2400, [[0, "#070a1e"], [1, "#141a38"]]); ctx.fillRect(-1500, -400, 4080, 2800);
      ebene("wrplan", 6, () => { for (let i = 0; i < 6; i++) { box(-200 + i * 260, 200, 200, 900, 20, "#10163a"); for (let j = 0; j < 8; j++) box(-180 + i * 260, 240 + j * 100, 160, 60, 8, rgba(j % 3 ? "#2a3a7a" : "#ff9a3a", 0.35)); }
        glut(200, 300, 300, "#59d8ff", 0.2); glut(900, 260, 300, "#ff9a3a", 0.15); });
      const cx = 540, cy = 900, R = 330, k = 0.5, ng = grau;
      ctx.save(); ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = lgrad(0, 1500, 0, 600, [[0, rgba(P.holo, 0.35)], [1, rgba(P.holo, 0)]]); poly([[300, 1500], [780, 1500], [960, 600], [120, 600]]); ctx.fill();
      for (let i = 0; i < 12; i++) { const a0 = i / 12 * Math.PI * 2 + t * 0.15, a1 = a0 + Math.PI * 2 / 12 * 0.86, g = ng.includes(i + 1), mk = Number(s.markiert) === i + 1;
        const f = g ? "#8090a8" : TUER[i % TUER.length], blink = mk ? 0.5 + 0.5 * Math.sin(t * 6) : 1;
        ctx.beginPath(); ctx.ellipse(cx, cy, R, R * k, 0, a0, a1); ctx.lineWidth = 64; ctx.strokeStyle = rgba(f, (g ? 0.35 : 0.75) * blink); ctx.stroke();
        if (!g) { const am = (a0 + a1) / 2; glut(cx + Math.cos(am) * R, cy + Math.sin(am) * R * k, 80, f, 0.4 * blink); } }
      if (s.ersatz) { ctx.setLineDash([22, 18]); ctx.beginPath(); ctx.ellipse(cx, cy - 40, R + 110, (R + 110) * k, 0, 0, Math.PI * 2); ctx.lineWidth = 8; ctx.strokeStyle = rgba("#ffffff", 0.7); ctx.stroke(); ctx.setLineDash([]); }
      ctx.beginPath(); ctx.ellipse(cx, cy, 90, 45, 0, 0, Math.PI * 2); ctx.fillStyle = rgba(P.holo, 0.4); ctx.fill();
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + t * 0.15; line(cx, cy, cx + Math.cos(a) * (R - 30), cy + Math.sin(a) * (R - 30) * k, 5, rgba(P.holo, 0.5)); }
      for (let y = 560; y < 1260; y += 14) box(-100, y, 1300, 2, 0, rgba(P.holo, 0.04 + 0.03 * Math.sin(y * 0.1 + t * 4)));
      ctx.restore();
      // Tisch
      box(-100, 1480, 1280, 60, 10, "#2a3260"); ctx.fillStyle = lgrad(0, 1540, 0, 2400, [[0, "#1a1f40"], [1, "#0a0d1e"]]); ctx.fillRect(-1500, 1540, 4080, 900);
      ellipse(540, 1490, 120, 26, "#0a1030"); glut(540, 1480, 160, P.holo, 0.8);
      figs();
      ebene("wrplanv", 12, () => { box(-260, 1300, 360, 1200, 60, "#03050e"); box(1000, 1360, 360, 1200, 60, "#03050e"); });
      A._dunkel = 0; return;
    }
    if (ansicht === "kuppel") {
      ebene("wrkall", 2, () => all(760, 1180, 760, 120));
      // Glasrippen der Kuppel
      ctx.save(); for (let i = -4; i <= 4; i++) { const x = 540 + i * 300; ctx.beginPath(); ctx.moveTo(x * 1.0 + i * 80, 1500); ctx.quadraticCurveTo(540 + i * 120, -100, 540, -300); ctx.lineWidth = 22 - Math.abs(i) * 2; ctx.strokeStyle = rgba("#1a1c3a", 0.9); ctx.stroke(); }
      for (const y of [300, 800, 1200]) { ctx.beginPath(); ctx.ellipse(540, y + 500, 1000, 520, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.lineWidth = 14; ctx.strokeStyle = rgba("#1a1c3a", 0.85); ctx.stroke(); }
      ctx.fillStyle = rgba("#bfe0ff", 0.05); ctx.fillRect(-1500, -400, 4080, 1900); ctx.restore();
      // Boden / Plattform
      ctx.fillStyle = lgrad(0, 1480, 0, 2400, [[0, "#3a2e4a"], [1, "#140e22"]]); ctx.fillRect(-1500, 1480, 4080, 1000);
      box(-1500, 1478, 4080, 10, 0, rgba(P.planetH, 0.5)); ctx.fillStyle = lgrad(0, 1480, 0, 1900, [[0, rgba(P.planet, 0.25)], [1, rgba(P.planet, 0)]]); ctx.fillRect(-1500, 1480, 4080, 420);
      if (s.lichter) { ctx.beginPath(); ctx.moveTo(-100, 420); for (let x = -100; x <= 1180; x += 40) ctx.lineTo(x, 420 + Math.sin(x / 1280 * Math.PI) * 160); ctx.lineWidth = 3; ctx.strokeStyle = "#1a1c3a"; ctx.stroke();
        for (let x = -60; x <= 1140; x += 80) { const y = 420 + Math.sin(x / 1280 * Math.PI) * 160 + 10, c = ["#ffd36b", "#ff9a6a", "#9fe8ff"][Math.round(x / 80 + 1) % 3]; circle(x, y, 9, c); glut(x, y, 40, c, 0.6 + 0.3 * Math.sin(t * 2 + x)); } }
      if (s.nischen) { for (const [x, c] of [[-60, "#b07ae8"], [180, "#f29a3a"], [900, "#4ac8c0"], [1140, "#e87ab0"]]) { const sw = Math.sin(t * 0.8 + x) * 8;
        box(x - 110, 1050, 220, 440, 24, rgba("#120a20", 0.8)); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x - 120, 1020); ctx.quadraticCurveTo(x - 60 + sw, 1260, x - 100, 1490); ctx.lineTo(x + 100, 1490); ctx.quadraticCurveTo(x + 60 + sw, 1260, x + 120, 1020); ctx.closePath(); ctx.fill();
        box(x - 130, 1005, 260, 22, 10, "#2a2c4a"); glut(x, 1040, 90, "#ffe0b0", 0.5); } }
      if (s.pflanzen || s.keimling) { const r = rnd(631); for (let i = 0; i < (s.pflanzen ? 7 : 0); i++) { const x = 60 + i * 160 + r() * 40, h = 90 + r() * 120; box(x - 46, 1440, 92, 60, 14, "#5a3a2e");
        for (let j = 0; j < 5; j++) { ctx.save(); ctx.translate(x, 1440); ctx.rotate(-0.8 + j * 0.4 + Math.sin(t + i + j) * 0.04); ellipse(0, -h * 0.5, 16, h * 0.5, j % 2 ? "#3fb87a" : "#5ad08a"); ctx.restore(); } } }
      if (s.tisch) { const tx = 540, ty = 1560; ellipse(tx, ty + 210, 380, 40, rgba("#000000", 0.35)); box(tx - 380, ty, 760, 46, 16, "#a8683a"); box(tx - 380, ty, 760, 12, 6, rgba("#ffffff", 0.18));
        for (const dx of [-330, 310]) box(tx + dx, ty + 40, 26, 190, 6, "#7a4a2a");
        if (s.stadt) { const r = rnd(641), farben = ["#f2c23a", "#3fb87a", "#e8685a", "#5aa8f2", "#b07ae8", "#f29a3a"];
          for (let i = 0; i < 9; i++) { const x = tx - 300 + i * 72, h = 40 + r() * 70, f = farben[i % 6]; box(x, ty + 230 - h, 56, h, 4, f); poly([[x - 4, ty + 230 - h], [x + 28, ty + 230 - h - 30], [x + 60, ty + 230 - h]], shade(f, -0.25)); box(x + 18, ty + 230 - h * 0.6, 18, 18, 2, rgba("#fff6d0", 0.85)); glut(x + 27, ty + 230 - h * 0.6, 40, "#ffe8a0", 0.5); } }
        if (s.keimling) { const x = tx + (s.stadt ? 340 : 0), y = s.stadt ? ty + 230 : ty; box(x - 30, y - 50, 60, 50, 10, "#c8784a"); line(x, y - 50, x, y - 120, 6, "#3fb87a"); ellipse(x - 22, y - 120, 24, 11, "#5ad08a"); ellipse(x + 22, y - 130, 24, 11, "#3fb87a"); glut(x, y - 120, 90, "#b8ffb0", 0.5); }
        if (s.brot) { ellipse(tx - 120, ty - 20, 90, 40, "#d89a4a"); ellipse(tx - 130, ty - 34, 60, 16, rgba("#fff0c0", 0.4)); for (let k = 0; k < 3; k++) { const yy = ty - 70 - ((t * 30 + k * 30) % 90); ellipse(tx - 120 + Math.sin(t + k) * 10, yy, 8, 16, rgba("#ffffff", 0.18)); } } }
      figs();
      ebene("wrkv", 12, () => { box(-260, 1700, 380, 900, 80, "#0a0612"); box(980, 1760, 380, 900, 80, "#0a0612"); });
      A._dunkel = 0; return;
    }
    if (ansicht === "zimmer") {
      const wand = s.farbe || "#f2c23a", z = s.zerfall ? clamp(t / 4, 0, 1) * Number(s.zerfall) : 0;
      ebene("wrzall", 1.5, () => all(420, 640, 300, 60));
      // Wand mit großem Bullauge (gekrümmt), zerfällt bei zerfall
      const wandMalen = () => { ctx.fillStyle = lgrad(0, -400, 0, 1500, [[0, shade(wand, -0.35)], [0.5, wand], [1, shade(wand, -0.2)]]);
        ctx.beginPath(); ctx.rect(-1500, -400, 4080, 1900); ctx.arc(420, 640, 300, 0, Math.PI * 2, true); ctx.fill("evenodd"); };
      if (z > 0) { ctx.save(); ctx.beginPath(); ctx.rect(-1500, -400, 4080, 1900); ctx.arc(420, 640, 300, 0, Math.PI * 2, true); ctx.clip("evenodd"); kacheln(-200, -400, 1480, 1900, wand, z, 651); ctx.restore(); }
      else wandMalen();
      ctx.beginPath(); ctx.arc(420, 640, 300, 0, Math.PI * 2); ctx.lineWidth = 44; ctx.strokeStyle = P.metall; ctx.stroke(); ctx.beginPath(); ctx.arc(420, 640, 300, 3.6, 4.6); ctx.lineWidth = 10; ctx.strokeStyle = rgba("#ffffff", 0.3); ctx.stroke();
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; circle(420 + Math.cos(a) * 300, 640 + Math.sin(a) * 300, 8, P.metallH); }
      ctx.fillStyle = lgrad(0, -400, 0, 300, [[0, rgba("#000000", 0.45)], [1, rgba("#000000", 0)]]); ctx.fillRect(-1500, -400, 4080, 700);
      box(760, 80, 260, 26, 13, rgba(P.licht, 0.95)); glut(890, 93, 500, P.licht, 0.45);
      if (s.striche && z < 0.5) { box(860, 600, 14, 820, 4, rgba("#4a2a14", 0.3)); const n = 7; for (let i = 0; i < n; i++) { const y = 1380 - i * 105; line(830, y, 920, y, 8, "#5a3218"); A.text(String(3 + i), 950, y + 2, 34, "#5a3218", "left", 800); } }
      if (s.bilder && z < 0.3) { for (const [x, y, c] of [[120, 1040, "#5aa8f2"], [300, 1100, "#e8685a"], [640, 1060, "#3fb87a"]]) { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(x) * 0.08); box(-70, -55, 140, 110, 6, "#fbf6ea"); circle(-20, -5, 22, c); box(-50, 20, 100, 14, 4, rgba(c, 0.6)); ctx.restore(); } }
      // Boden
      ctx.fillStyle = lgrad(0, 1480, 0, 2400, [[0, "#3a3450"], [1, "#151226"]]); ctx.fillRect(-1500, 1480, 4080, 1000); box(-1500, 1476, 4080, 12, 0, shade(wand, -0.5));
      for (let x = -200; x < 1300; x += 160) line(x, 1490, x - 120, 2400, 3, rgba("#000000", 0.2));
      if (s.beete) { ctx.save(); ctx.globalCompositeOperation = "screen"; for (const x of [200, 540, 880]) { ctx.fillStyle = lgrad(0, 120, 0, 1400, [[0, rgba("#ff7ad8", 0.35)], [1, rgba("#ff7ad8", 0)]]); poly([[x - 40, 120], [x + 40, 120], [x + 240, 1400], [x - 240, 1400]]); ctx.fill(); box(x - 90, 100, 180, 30, 12, "#ffb0f0"); } ctx.restore();
        const r = rnd(661); for (const [bx, bw] of [[-60, 420], [700, 460]]) { box(bx, 1380, bw, 130, 16, "#5a3a2e"); box(bx, 1380, bw, 24, 10, "#7a4e3a");
          for (let i = 0; i < 9; i++) { const x = bx + 30 + i * (bw - 60) / 8, h = 50 + r() * 90; for (let j = 0; j < 4; j++) { ctx.save(); ctx.translate(x, 1384); ctx.rotate(-0.6 + j * 0.4 + Math.sin(t * 1.3 + i + j) * 0.05); ellipse(0, -h * 0.5, 12, h * 0.5, j % 2 ? "#3fb87a" : "#6ad89a"); ctx.restore(); } } }
        for (let i = 0; i < 14; i++) { const x = r() * 1080, y = 300 + ((r() * 1000 - t * 20) % 1000 + 1000) % 1000; circle(x, y, 3, rgba("#fff0c0", 0.6)); } }
      if (s.baum) { const bx = 560, by = 1400; ctx.beginPath(); ctx.moveTo(bx - 40, by); ctx.bezierCurveTo(bx - 60, by - 200, bx + 90, by - 300, bx + 30, by - 520); ctx.lineTo(bx + 70, by - 520); ctx.bezierCurveTo(bx + 140, by - 300, bx, by - 200, bx + 40, by); ctx.closePath(); ctx.fillStyle = "#6a4230"; ctx.fill();
        line(bx + 50, by - 400, bx - 120, by - 560, 22, "#6a4230"); line(bx + 50, by - 470, bx + 220, by - 600, 18, "#6a4230");
        const r = rnd(671); for (let i = 0; i < 16; i++) { const x = bx + 40 + (r() - 0.5) * 520, y = by - 600 + (r() - 0.5) * 260; circle(x + Math.sin(t + i) * 4, y, 70 + r() * 50, i % 3 ? "#3fa86a" : "#5ac884"); }
        glut(bx + 40, by - 620, 360, "#b8ffb0", 0.25); if (s.markierung) { line(bx - 140, by - 720, bx + 240, by - 720, 8, "#ffffff"); A.text("2,40 m", bx + 260, by - 720, 40, "#ffffff", "left", 800); } }
      if (s.bett && z < 0.4) { box(-40, 1300, 470, 210, 30, "#4a5aa8"); box(-40, 1300, 470, 60, 26, "#f6eedc"); box(-20, 1250, 160, 80, 30, "#ffffff"); for (let k = 0; k < 5; k++) circle(60 + k * 80, 1420, 12, rgba("#f2c23a", 0.8)); }
      if (s.tisch) { const tx = 640, ty = 1520; ellipse(tx, ty + 210, 300, 30, rgba("#000000", 0.35)); box(tx - 300, ty, 600, 40, 14, "#a8683a"); box(tx - 300, ty, 600, 10, 5, rgba("#ffffff", 0.18)); for (const dx of [-260, 240]) box(tx + dx, ty + 36, 22, 180, 6, "#7a4a2a");
        if (s.kratzer) for (let k = 0; k < 4; k++) line(tx - 200 + k * 24, ty + 18, tx - 170 + k * 24, ty + 8, 3, "#5a3218");
        if (s.suppe) { ellipse(tx + 120, ty - 6, 70, 18, "#e8e2d0"); ellipse(tx + 120, ty - 10, 56, 12, "#d8843a"); for (let k = 0; k < 3; k++) { const yy = ty - 40 - ((t * 30 + k * 30) % 90); ellipse(tx + 110 + Math.sin(t + k) * 10, yy, 7, 15, rgba("#ffffff", 0.2)); } } }
      if (s.kisten) { for (const [x, y, w, h] of [[60, 1560, 220, 170], [250, 1600, 180, 140], [820, 1580, 200, 160]]) { box(x, y, w, h, 10, "#b88a5a"); box(x, y, w, 22, 6, "#d8aa7a"); line(x + w / 2, y, x + w / 2, y + h, 6, rgba("#5a3a1a", 0.5)); } }
      if (z > 0) glut(540, 700, 700, mix(wand, "#ffffff", 0.4), 0.35 * Math.sin(Math.min(z, 1) * Math.PI));
      figs();
      ebene("wrzv", 12, () => { box(-260, 1720, 360, 900, 60, "#08060f"); box(1000, 1780, 360, 900, 60, "#08060f"); });
      A._dunkel = 0; return;
    }
    // ---- ansicht=ring: gekrümmter Gang ----
    ebene("wrrall", 1.5, () => all(800, 230, 360, 80));
    const N = 7, seg = i => { const z = 1 + i * 0.62, k = 1 / z; return { k, cx: 540 + Math.sin(i * 0.2) * 10, cy: 1010 - i * i * 16 * 1, hw: 720 * k, ob: 900 * k, un: 820 * k }; };
    const dunst = i => clamp(i / (N + 1), 0, 1);
    for (let i = N - 1; i >= 0; i--) {
      const a = seg(i), b = seg(i + 1), d = dunst(i), haze = c => mix(c, "#6a4a7a", d * 0.7);
      // Boden
      poly([[a.cx - a.hw, a.cy + a.un], [a.cx + a.hw, a.cy + a.un], [b.cx + b.hw, b.cy + b.un], [b.cx - b.hw, b.cy + b.un]], haze(P.boden));
      box(lerp(a.cx, b.cx, 0.5) - 30 * a.k, lerp(a.cy + a.un, b.cy + b.un, 0.5) - 4 * a.k, 60 * a.k, 8 * a.k, 3, rgba("#9fd8ff", 0.5 * (1 - d)));
      // Decke (vorne Glas)
      if (i >= 2) poly([[a.cx - a.hw, a.cy - a.ob], [a.cx + a.hw, a.cy - a.ob], [b.cx + b.hw, b.cy - b.ob], [b.cx - b.hw, b.cy - b.ob]], haze("#1e2240"));
      // Wände mit Türen
      for (const sd of [-1, 1]) {
        poly([[a.cx + sd * a.hw, a.cy - a.ob], [b.cx + sd * b.hw, b.cy - b.ob], [b.cx + sd * b.hw, b.cy + b.un], [a.cx + sd * a.hw, a.cy + a.un]], haze(sd < 0 ? "#2c3058" : "#363a66"));
        const nr = i * 2 + (sd < 0 ? 1 : 2), f = grau.includes(nr) ? "#555a6a" : TUER[(nr - 1) % TUER.length];
        const L = (u, v) => [lerp(a.cx + sd * a.hw, b.cx + sd * b.hw, u), lerp(lerp(a.cy - a.ob, b.cy - b.ob, u), lerp(a.cy + a.un, b.cy + b.un, u), v)];
        const tuer = [L(0.22, 0.32), L(0.78, 0.32), L(0.78, 0.98), L(0.22, 0.98)];
        if (Number(s.zerfall) === nr) { const k2 = clamp(t / 4, 0, 1); ctx.save(); ctx.globalAlpha = 1 - k2; poly(tuer, haze(f)); ctx.restore(); const [x0, y0] = tuer[0], [x1, y1] = tuer[2]; kacheln(Math.min(x0, x1), y0, Math.abs(x1 - x0), y1 - y0, f, k2, 700 + nr); }
        else { poly(tuer, haze(f)); const m = L(0.5, 0.25); if (!grau.includes(nr)) glut(m[0], m[1], 60 * a.k + 20, f, 0.5 * (1 - d)); }
        const lp = L(0.5, 0.25); box(lp[0] - 24 * a.k, lp[1] - 10 * a.k, 48 * a.k, 20 * a.k, 4, grau.includes(nr) ? "#30343e" : rgba("#ffffff", 0.8));
        if (warn.includes(nr)) { const w = 0.5 + 0.5 * Math.sin(t * 6 + nr); circle(lp[0], lp[1] - 40 * a.k, 14 * a.k + 4, P.warn); glut(lp[0], lp[1] - 40 * a.k, 160 * a.k + 40, P.warn, 0.8 * w); }
      }
      // Rippe
      ctx.save(); ctx.beginPath(); ctx.roundRect(a.cx - a.hw, a.cy - a.ob, a.hw * 2, a.ob + a.un, 120 * a.k); ctx.lineWidth = 46 * a.k; ctx.strokeStyle = haze(P.metall); ctx.stroke();
      ctx.beginPath(); ctx.roundRect(a.cx - a.hw + 14 * a.k, a.cy - a.ob + 14 * a.k, a.hw * 2 - 28 * a.k, a.ob + a.un - 28 * a.k, 110 * a.k); ctx.lineWidth = 6 * a.k; ctx.strokeStyle = rgba("#9fd8ff", 0.35 * (1 - d)); ctx.stroke(); ctx.restore();
      box(a.cx - 60 * a.k, a.cy - a.ob - 10 * a.k, 120 * a.k, 20 * a.k, 6, rgba(P.licht, 0.9 * (1 - d * 0.5))); glut(a.cx, a.cy - a.ob, 260 * a.k, P.licht, 0.4 * (1 - d));
    }
    // Rotes Warnlicht wandert (warn ohne Tür = wanderndes Licht)
    if (s.alarm) { const p = (t * 0.4) % 1; glut(540, lerp(200, 1500, p), 700, P.warn, 0.25); }
    figs();
    ebene("wrrv", 12, () => { box(-280, 1680, 380, 900, 70, "#05060f"); box(980, 1740, 380, 900, 70, "#05060f"); });
    A._dunkel = 0;
  };

  // ---- Icons für s06 (Messband mit Größenstrichen, Saatgut, verschlossene Kiste, Wärmeregler) ----
  Object.assign(A.I, {
    messband(t) { ctx.save(); ctx.rotate(-0.12); box(-200, -40, 400, 80, 10, "#f2c23a"); box(-200, -40, 400, 14, 6, A.rgba("#ffffff", 0.3));
      for (let k = 0; k < 7; k++) { const x = -170 + k * 55; line(x, -30, x, 26, 6, "#5a3218"); A.text(String(3 + k), x, -54, 26, "#fff2c8", "center", 800); }
      ctx.beginPath(); ctx.arc(230, 0, 60, 0, Math.PI * 2); A.fill("#d8a830"); circle(230, 0, 22, "#8a6a1a"); ctx.restore(); },
    saatgut(t) { ctx.save(); ctx.rotate(0.06); box(-110, -150, 220, 300, 14, "#e8dcc0"); box(-110, -150, 220, 70, 14, "#3fb87a"); A.text("SAAT", 0, -114, 40, "#ffffff", "center", 900);
      ctx.save(); ctx.translate(0, 30); line(0, 60, 0, -20, 8, "#2f8a4a"); ellipse(-30, -24, 34, 14, "#5ad08a"); ellipse(30, -40, 34, 14, "#3fb87a"); ctx.restore();
      for (let k = 0; k < 5; k++) ellipse(-60 + k * 30, 118, 8, 5, "#8a5a2a"); ctx.restore(); },
    kiste(t) { box(-170, -90, 340, 200, 14, "#a8743a"); box(-180, -120, 360, 60, 14, "#c08a4a"); for (const x of [-120, 120]) box(x - 14, -120, 28, 230, 6, "#6a4420");
      box(-34, -80, 68, 80, 12, "#c8ccd4"); ctx.beginPath(); ctx.arc(0, -82, 24, Math.PI, 0); ctx.lineWidth = 10; ctx.strokeStyle = "#c8ccd4"; ctx.stroke(); circle(0, -44, 9, "#3a3a40");
      const a = 0.5 + 0.5 * Math.sin(t * 2); ctx.fillStyle = A.rgba("#ffe8a0", 0.25 * a); ctx.fillRect(-180, 100, 360, 10); },
    regler(t) { box(-150, -150, 300, 300, 40, "#2a3058"); box(-136, -136, 272, 272, 34, "#3a4070"); ctx.beginPath(); ctx.arc(0, 10, 100, 0.75 * Math.PI, 2.25 * Math.PI); ctx.lineWidth = 22; ctx.strokeStyle = "#1a1e38"; ctx.stroke();
      const ok = 0.5 + 0.5 * Math.sin(t * 0.8); ctx.beginPath(); ctx.arc(0, 10, 100, 0.75 * Math.PI, (0.75 + 1.5 * (0.4 + 0.5 * ok)) * Math.PI); ctx.lineWidth = 22; ctx.strokeStyle = "#5ad08a"; ctx.stroke();
      circle(0, 10, 50, "#1a1e38"); A.text("°C", 0, 22, 44, "#bfe8ff", "center", 800); circle(0, -110, 10, "#5ad08a"); },
  });
  for (const n of ["messband", "saatgut", "kiste", "regler"]) if (!A.ICONS.includes(n)) A.ICONS.push(n);
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
  // ---- Icons für s05 (Busticket, Halteknopf) ----
  Object.assign(A.I, {
    busticket(t) { ctx.save(); ctx.rotate(-0.08); box(-150, -95, 300, 190, 14, "#f2ead2"); box(-150, -95, 300, 44, 14, "#2f6fb5"); A.text("TICKET", 0, -72, 30, "#ffffff", "center", 900);
      for (let k = 0; k < 3; k++) box(-120, -30 + k * 32, k === 2 ? 120 : 200, 10, 4, A.rgba("#3a3a4a", 0.35));
      ctx.beginPath(); ctx.arc(80, 40, 44, 0, Math.PI * 2); ctx.lineWidth = 7; ctx.strokeStyle = A.rgba("#c8302a", 0.8); ctx.stroke(); box(50, 32, 60, 14, 4, A.rgba("#c8302a", 0.8)); ctx.restore(); },
    halteknopf(t) { box(-100, -130, 200, 260, 40, "#e8e2d0"); circle(0, -20, 76, "#c8302a"); circle(-20, -40, 22, A.rgba("#ffffff", 0.35)); A.text("STOP", 0, 92, 40, "#2a3350", "center", 900);
      const a = 0.5 + 0.5 * Math.sin(t * 5); ctx.fillStyle = A.rgrad(0, -20, 0, 200, [[0, A.rgba("#ff4a3a", 0.5 * a)], [1, A.rgba("#ff4a3a", 0)]]); ctx.fillRect(-200, -220, 400, 400); },
  });
  for (const n of ["busticket", "halteknopf"]) if (!A.ICONS.includes(n)) A.ICONS.push(n);
})();
