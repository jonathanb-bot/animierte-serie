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
})();
