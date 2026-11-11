/* „Deine Welt“ (Jonathan 9.11., Issue #32): Kulisse `tal` – das Tal, in dem die Siedlung der Community wächst –
   und Icons für Einwohner, Häuser, Kristall, Ähre. Nur neue Namen: alle bisherigen Serien bleiben pixelgleich.

   [tal zeit=tag|abend|nacht haeuser=N zelte=N felder=N feuer kristall mauer bruecke muehle weit gross figur_y=…]
   - haeuser/zelte/felder wachsen mit der Welt (Weltgedächtnis welt/gedaechtnis.json → bild.tal)
   - kristall: die leuchtenden Adern im Berg (Weltregel: Lichtkristall, siehe welt/serienbibel.md)
   - weit: Siedlung kleiner und weiter weg (Panorama), gross: Figuren nah vorne
*/
(() => {
  const { box, circle, ellipse, poly, line, shade, rgba, lgrad, rgrad, mix, lerp } = A;
  const W = A.W, SZ = A.SZ;
  const rnd = seed => A.rnd(seed + (A._kgVar || 0) * 7919);
  const glut = (x, y, r, farbe, a = 1) => { ctx.fillStyle = rgrad(x, y, 0, r, [[0, rgba(farbe, 0.9 * a)], [0.25, rgba(farbe, 0.4 * a)], [1, rgba(farbe, 0)]]); ctx.fillRect(x - r, y - r, r * 2, r * 2); };
  const zahl = (v, d = 0) => (v === undefined || v === null || v === "" ? d : v === true ? 1 : Number(v) || 0);
  const an = v => v !== undefined && v !== false && v !== "false" && v !== "0" && v !== 0;

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
  const kurve = (pk, unten = 2600) => {
    ctx.beginPath(); ctx.moveTo(pk[0][0], unten); ctx.lineTo(pk[0][0], pk[0][1]);
    for (let i = 1; i < pk.length; i++) { const [x0, y0] = pk[i - 1], [x1, y1] = pk[i]; ctx.bezierCurveTo((x0 + x1) / 2, y0, (x0 + x1) / 2, y1, x1, y1); }
    ctx.lineTo(pk[pk.length - 1][0], unten); ctx.closePath();
  };
  // runder Laubbaum mit Licht- und Schattenseite und Kontaktschatten
  const baum = (x, y, g, P, r) => {
    ellipse(x + g * 0.15, y + 2, g * 0.9, g * 0.22, rgba(P.schatten, 0.35));
    box(x - g * 0.08, y - g * 0.7, g * 0.16, g * 0.72, g * 0.05, P.stamm);
    const k = shade(P.baum, (r() - 0.5) * 0.16);
    circle(x, y - g * 1.05, g * 0.62, k); circle(x - g * 0.38, y - g * 0.78, g * 0.42, k); circle(x + g * 0.4, y - g * 0.8, g * 0.44, shade(k, -0.08));
    circle(x + g * 0.18, y - g * 0.9, g * 0.5, rgba(P.baumS, 0.45));
    circle(x - g * 0.22, y - g * 1.28, g * 0.28, rgba(P.baumL, 0.55));
  };
  // Nadelbaum (für die Hänge)
  const tanne = (x, y, g, farbe, licht) => {
    for (let i = 0; i < 3; i++) { const w = g * (0.55 - i * 0.13), yy = y - i * g * 0.42; poly([[x - w, yy], [x, yy - g * 0.75], [x + w, yy]], i % 2 ? shade(farbe, 0.05) : farbe); poly([[x, yy - g * 0.75], [x - w * 0.15, yy - g * 0.2], [x - w * 0.7, yy]], rgba(licht, 0.25)); }
  };
  // kleines Haus: Wand, Dach, Fenster (leuchtet abends), Schornstein mit Rauch
  const haus = (x, y, g, P, r, t, abend, i) => {
    const w = g * (1 + r() * 0.35), h = g * 0.7, dach = P.daecher[i % P.daecher.length], wand = P.waende[(i * 7) % P.waende.length];
    ellipse(x + w * 0.1, y + 2, w * 0.75, g * 0.16, rgba(P.schatten, 0.4));
    box(x - w / 2, y - h, w, h, g * 0.04, wand);
    box(x + w * 0.1, y - h, w * 0.4, h, 0, rgba(P.schatten, 0.16));
    poly([[x - w * 0.62, y - h + 2], [x, y - h - g * 0.62], [x + w * 0.62, y - h + 2]], dach);
    poly([[x, y - h - g * 0.62], [x + w * 0.62, y - h + 2], [x + w * 0.1, y - h + 2]], shade(dach, -0.18));
    line(x - w * 0.6, y - h + 2, x, y - h - g * 0.6, g * 0.05, rgba(P.licht, 0.35));
    const fx = x - w * 0.22, fy = y - h * 0.62, fw = g * 0.22;
    if (abend) { glut(fx + fw / 2, fy + fw / 2, g * 1.2, P.fenster, 0.35); box(fx, fy, fw, fw, g * 0.03, P.fenster); }
    else box(fx, fy, fw, fw, g * 0.03, rgba("#24324a", 0.75));
    box(x + w * 0.14, y - h * 0.55, g * 0.2, h * 0.55, g * 0.03, shade(wand, -0.35));
    if (i % 3 === 0) { // Schornstein mit Rauch
      const sx = x + w * 0.28, sy = y - h - g * 0.32;
      box(sx - g * 0.06, sy - g * 0.22, g * 0.12, g * 0.3, 0, shade(dach, -0.3));
      for (let k = 0; k < 4; k++) { const p = ((t * 0.25 + k / 4 + i * 0.13) % 1); circle(sx + Math.sin(p * 5 + i) * g * 0.3 + p * g * 0.6, sy - g * 0.3 - p * g * 2.2, g * (0.1 + p * 0.25), rgba(P.rauch, 0.4 * (1 - p))); }
    }
  };
  const zelt = (x, y, g, P, i, abend) => {
    const f = P.zelte[i % P.zelte.length];
    ellipse(x + g * 0.1, y + 2, g * 0.8, g * 0.15, rgba(P.schatten, 0.4));
    poly([[x - g * 0.7, y], [x, y - g * 0.9], [x + g * 0.7, y]], f);
    poly([[x, y - g * 0.9], [x + g * 0.7, y], [x + g * 0.05, y]], shade(f, -0.2));
    poly([[x - g * 0.16, y], [x, y - g * 0.42], [x + g * 0.16, y]], abend ? P.fenster : shade(f, -0.45));
    line(x, y - g * 0.9, x - g * 0.08, y - g * 1.08, g * 0.05, shade(f, -0.4));
  };
  const feuer = (x, y, g, t, P) => {
    glut(x, y - g * 0.3, g * 5, P.feuer, 0.45); glut(x, y - g * 0.3, g * 1.6, "#ffe08a", 0.8);
    for (let k = 0; k < 4; k++) line(x - g * 0.5 + k * g * 0.33, y + g * 0.1, x + g * 0.5 - k * g * 0.33, y - g * 0.05, g * 0.12, "#5a3424");
    for (let k = 0; k < 3; k++) { const fl = 1 + Math.sin(t * 9 + k * 2) * 0.15; poly([[x - g * (0.35 - k * 0.1), y], [x + Math.sin(t * 6 + k) * g * 0.1, y - g * (1.1 - k * 0.25) * fl], [x + g * (0.35 - k * 0.1), y]], ["#ff7a3a", "#ffb347", "#fff1a8"][k]); }
    for (let k = 0; k < 5; k++) { const p = (t * 0.6 + k / 5) % 1; circle(x + Math.sin(k * 3 + p * 6) * g * 0.6, y - g - p * g * 3, g * 0.06, rgba("#ffd27a", 1 - p)); }
  };

  const PAL = {
    tag: { oben: "#5fb4dc", mitte: "#a8dcd8", horizont: "#f6eab0", sonne: "#ffffff", licht: "#fff2c0", berg: "#7f8fc2", bergS: "#5a6aa6", schnee: "#f4f6ff", huegel: "#4f9a6a", wiese: ["#7cc06a", "#68b05c", "#58a052", "#4a8e48"], baum: "#3f8a4e", baumS: "#2a5f40", baumL: "#a6d86e", stamm: "#6a4a36", tanne: "#2f6a50", wasser: "#4fc0d8", wasserL: "#c8f4ff", weg: "#d9c48a", feld: ["#e8c25a", "#d6a84a", "#a8c45a"], schatten: "#1f3a34", fenster: "#ffd27a", rauch: "#ffffff", feuer: "#ff9a3c", kristall: "#7af0ff", zelte: ["#e8d6b0", "#d98a5a", "#c9c2a4"], daecher: ["#c8584a", "#b8664a", "#8a4a5a", "#d07a4a"], waende: ["#f2e2c4", "#e8d2ae", "#f0d8b8", "#dcc8a8"], rand: "#1d4a3c" },
    abend: { oben: "#3a2c74", mitte: "#c45c82", horizont: "#ffb866", sonne: "#ffe7b4", licht: "#ffd08a", berg: "#8a4c7a", bergS: "#5a3266", schnee: "#ffd2c4", huegel: "#5a4a6e", wiese: ["#9a8a5a", "#7e7a4e", "#6a6a48", "#565a44"], baum: "#4a5a48", baumS: "#2e3a3c", baumL: "#e8a86a", stamm: "#4a3030", tanne: "#3a4a4a", wasser: "#e88a8a", wasserL: "#ffe0c0", weg: "#c8a07a", feld: ["#e8a85a", "#d08a4a", "#b0904a"], schatten: "#2a1a34", fenster: "#ffc46a", rauch: "#ffe8d8", feuer: "#ff8a3c", kristall: "#8af4ff", zelte: ["#e8c8a8", "#c87a5a", "#b8a890"], daecher: ["#a8444a", "#9a5244", "#6a3a52", "#b8603e"], waende: ["#e8c8a8", "#d8b494", "#e0bc9c", "#c8a88c"], rand: "#2a1a38" },
    nacht: { oben: "#0c1430", mitte: "#1c2c5a", horizont: "#3a4a7a", sonne: "#f2f4ff", licht: "#b8c8ff", berg: "#2c3a66", bergS: "#1c2650", schnee: "#9aaad8", huegel: "#1e3248", wiese: ["#2a4a4e", "#244244", "#1e3a3e", "#1a3236"], baum: "#1e3a3e", baumS: "#122628", baumL: "#5a7aa0", stamm: "#2a2630", tanne: "#16303a", wasser: "#3a5a9a", wasserL: "#a8c4ff", weg: "#4a5470", feld: ["#5a6050", "#4e5446", "#46503c"], schatten: "#060a18", fenster: "#ffcc6a", rauch: "#8a9ac0", feuer: "#ff8a3c", kristall: "#7af0ff", zelte: ["#7a7a88", "#6a5a5a", "#5a6070"], daecher: ["#4a3a4a", "#3e3a48", "#36303e", "#4a3a3a"], waende: ["#5a5a6a", "#4e5060", "#56566a", "#4a4a5a"], rand: "#050812" },
  };

  // Ankerpunkte der Siedlung (Spirale um das Feuer, Perspektive: weiter hinten = kleiner)
  const platz = (n, cx, cy, weit) => {
    const pkte = [];
    for (let i = 0; i < n; i++) {
      const a = i * 2.39996 + 0.6, rad = (weit ? 22 : 34) * Math.sqrt(i + 2.2);
      const x = cx + Math.cos(a) * rad * 1.9, y = cy + Math.sin(a) * rad * 0.62;
      pkte.push([x, y]);
    }
    return pkte.sort((p, q) => p[1] - q[1]);
  };

  SZ.tal = (s, t) => {
    const zeit = ["abend", "nacht"].includes(s.zeit) ? s.zeit : "tag", P = PAL[zeit], abend = zeit !== "tag";
    const weit = an(s.weit), nH = Math.min(220, zahl(s.haeuser)), nZ = Math.min(60, zahl(s.zelte)), nF = Math.min(24, zahl(s.felder));
    const kristall = an(s.kristall);
    const sx = zeit === "nacht" ? 300 : 280, sy = zeit === "abend" ? 760 : 300;
    // Himmel
    ctx.fillStyle = lgrad(0, -700, 0, 1000, [[0, P.oben], [0.62, P.mitte], [1, P.horizont]]); ctx.fillRect(-1500, -1500, 4080, 3000);
    if (zeit === "nacht") { const r = rnd(3); for (let i = 0; i < 140; i++) { const x = -200 + r() * 1500, y = -400 + r() * 1150, a = 0.4 + 0.6 * Math.abs(Math.sin(t * (0.5 + r()) + i)); circle(x, y, 1.5 + r() * 2.2, rgba("#ffffff", a * 0.8)); } }
    glut(sx, sy, 800, P.licht, zeit === "nacht" ? 0.25 : 0.55);
    if (zeit === "nacht") { // Mondsichel: der verdeckte Teil wird mit demselben Himmelsverlauf übermalt (keine dunkle Scheibe)
      glut(sx, sy, 140, "#ffffff", 0.3);
      ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, 58, 0, Math.PI * 2); ctx.clip();
      circle(sx, sy, 58, P.sonne);
      ctx.fillStyle = lgrad(0, -700, 0, 1000, [[0, P.oben], [0.62, P.mitte], [1, P.horizont]]); ctx.beginPath(); ctx.arc(sx + 24, sy - 14, 52, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else { circle(sx, sy, 76, P.sonne); glut(sx, sy, 140, "#ffffff", 0.8); }
    if (zeit !== "nacht") A.licht(sx, sy, 800, P.licht, 0.8);
    // Wolken
    { const r = rnd(7); for (let k = 0; k < 3; k++) { const wx = -100 + k * 480 + Math.sin(t * 0.08 + k) * 30 + r() * 80, wy = 200 + k * 130 + r() * 60, a = zeit === "nacht" ? 0.18 : 0.85; for (const [dx, dy, rr] of [[0, 0, 38], [42, -16, 50], [96, 0, 36], [132, 6, 26]]) circle(wx + dx, wy + dy, rr, rgba(zeit === "abend" ? "#ffd8c8" : "#ffffff", a)); box(wx - 36, wy, 196, 24, 12, rgba(zeit === "abend" ? "#ffd8c8" : "#ffffff", a)); } }
    // Berge hinten mit Schneekappen, in der Mitte der hohe Berg (mit Kristalladern)
    ebene("talBerge", 3.5, () => {
      const r = rnd(11);
      const reihe = (basis, spitzen, farbe, schnee) => {
        ctx.beginPath(); ctx.moveTo(-400, basis);
        for (const [x, y] of spitzen) ctx.lineTo(x, y);
        ctx.lineTo(1500, basis); ctx.closePath(); ctx.fillStyle = farbe; ctx.fill();
        ctx.save(); ctx.clip();
        spitzen.forEach(([x, y], i) => {
          const [lx, ly] = spitzen[i - 1] || [-400, basis], [rx, ry] = spitzen[i + 1] || [1500, basis];
          poly([[x, y], [x + (rx - x) * 0.9, basis], [x + 20, basis]], rgba(P.schatten, 0.14));
          if (schnee && y < ly && y < ry) { // Schneekappe folgt den Flanken, unten gezackt
            const f = Math.min(0.42, 70 / Math.max(40, Math.min(ly - y, ry - y)) * 0.5 + 0.12);
            const L = [lerp(x, lx, f), lerp(y, ly, f)], R = [lerp(x, rx, f), lerp(y, ry, f)];
            poly([[x, y], L, [lerp(L[0], x, 0.25), L[1] - 6], [lerp(L[0], R[0], 0.4), L[1] + 14], [x, R[1] - 4], [lerp(L[0], R[0], 0.72), R[1] + 12], R], rgba(P.schnee, schnee));
            poly([[x, y], R, [lerp(L[0], R[0], 0.72), R[1] + 12], [x, R[1] - 4]], rgba(P.schatten, 0.12 * schnee));
          }
        });
        ctx.restore();
      };
      reihe(980, [[-260, 640], [-60, 520], [120, 600], [300, 470], [470, 610], [980, 560], [1180, 480], [1400, 620]], mix(P.berg, P.horizont, 0.45), 0.7);
      reihe(1000, [[-200, 760], [60, 650], [260, 760], [520, 700], [760, 400], [1000, 690], [1200, 610], [1400, 760]], P.berg, 0.95);
      if (kristall) { // leuchtende Adern im großen Berg
        ctx.save(); ctx.globalCompositeOperation = "screen";
        const puls = 0.75 + 0.25 * Math.sin(t * 1.6);
        // feine Adern und Kristallgruppen, die aus dem Fels wachsen
        for (const [x0, y0, x1, y1] of [[752, 520, 735, 600], [735, 600, 760, 700], [775, 560, 805, 640], [740, 650, 700, 700]]) line(x0, y0, x1, y1, 4, rgba(P.kristall, 0.55 * puls));
        for (const [kx, ky, kg] of [[738, 610, 30], [782, 720, 40], [706, 706, 24]]) {
          glut(kx, ky, kg * 3, P.kristall, 0.3 * puls);
          for (const [dx, h, w, a] of [[-0.45, 1.6, 0.2, -0.38], [0, 2.4, 0.26, 0], [0.42, 1.4, 0.18, 0.42], [0.2, 0.9, 0.14, 0.8]]) {
            ctx.save(); ctx.translate(kx + dx * kg, ky); ctx.rotate(a);
            poly([[-w * kg, 0], [-w * kg, -h * kg * 0.7], [0, -h * kg], [w * kg, -h * kg * 0.7], [w * kg, 0]], rgba("#bff8ff", 0.85 * puls));
            poly([[0, -h * kg], [w * kg, -h * kg * 0.7], [w * kg, 0], [0, 0]], rgba(P.kristall, 0.7 * puls));
            ctx.restore();
          }
        }
        glut(760, 620, 260, P.kristall, 0.35 * puls);
        ctx.restore();
      }
      ctx.fillStyle = lgrad(0, 820, 0, 1010, [[0, rgba(P.horizont, 0)], [1, rgba(P.horizont, 0.7)]]); ctx.fillRect(-1500, 820, 4080, 190);
    });
    // Waldhügel (leicht unscharf), Wasserfall vom Berg
    ebene("talHuegel", 1.4, () => {
      const r = rnd(17);
      kurve([[-300, 1000], [80, 930], [380, 990], [620, 950], [900, 1000], [1400, 930]]); ctx.fillStyle = mix(P.huegel, P.horizont, 0.3); ctx.fill();
      for (let i = 0; i < 70; i++) { const x = -200 + r() * 1500, y = 960 + r() * 70; tanne(x, y, 34 + r() * 26, mix(P.tanne, P.horizont, 0.25 + r() * 0.1), P.licht); }
      // Wasserfall
      poly([[752, 790], [766, 790], [780, 985], [740, 985]], rgba(mix(P.wasser, P.wasserL, 0.5), 0.55));
      for (let k = 0; k < 6; k++) { const p = (t * 0.8 + k / 6) % 1; box(752 + p * -8, 790 + p * 185, 16 + p * 20, 10, 5, rgba("#ffffff", 0.35 * (1 - p))); }
      glut(760, 985, 60, "#ffffff", 0.35);
    });
    // Wiese
    kurve([[-300, 1060], [200, 1030], [600, 1050], [1000, 1025], [1400, 1060]]); ctx.fillStyle = P.wiese[0]; ctx.fill();
    kurve([[-300, 1400], [300, 1350], [800, 1390], [1400, 1340]]); ctx.fillStyle = P.wiese[1]; ctx.fill();
    kurve([[-300, 1700], [400, 1660], [900, 1690], [1400, 1650]]); ctx.fillStyle = P.wiese[2]; ctx.fill();
    // Fluss: vom Wasserfall in Schlangenlinie nach vorne links, wird breiter
    { const pfad = [[760, 1000], [700, 1080], [860, 1160], [620, 1300], [340, 1420], [520, 1600], [180, 1800], [-120, 2050]];
      const rand = (seite) => { const pk = pfad.map(([x, y], i) => [x + seite * (8 + i * 22), y]); return pk; };
      const L = rand(-1), R = rand(1).reverse();
      const glatt = (pk, erst) => { if (erst) ctx.moveTo(pk[0][0], pk[0][1]); else ctx.lineTo(pk[0][0], pk[0][1]); for (let i = 1; i < pk.length - 1; i++) { const mx = (pk[i][0] + pk[i + 1][0]) / 2, my = (pk[i][1] + pk[i + 1][1]) / 2; ctx.quadraticCurveTo(pk[i][0], pk[i][1], mx, my); } ctx.lineTo(pk[pk.length - 1][0], pk[pk.length - 1][1]); };
      ctx.beginPath(); glatt(L, true); glatt(R, false);
      ctx.closePath(); ctx.fillStyle = P.wasser; ctx.fill();
      ctx.save(); ctx.clip();
      for (let k = 0; k < 26; k++) { const i = k % (pfad.length - 1), p = ((t * 0.15 + k * 0.37) % 1); const x = lerp(pfad[i][0], pfad[i + 1][0], p), y = lerp(pfad[i][1], pfad[i + 1][1], p); box(x - 20 - i * 4, y, 40 + i * 8, 4, 2, rgba(P.wasserL, 0.55)); }
      ctx.restore();
      if (an(s.bruecke)) { const [bx, by] = [620, 1300]; box(bx - 80, by - 10, 160, 22, 6, "#8a5a3a"); for (let k = 0; k < 6; k++) line(bx - 70 + k * 28, by - 10, bx - 70 + k * 28, by + 12, 3, "#5a3a26"); line(bx - 80, by - 18, bx + 80, by - 18, 5, "#6a4630"); }
    }
    // Siedlung
    const cx = weit ? 540 : 520, cy = weit ? 1150 : 1215, g0 = weit ? 26 : 38;
    const r = rnd(29);
    // Felder (rund um die Siedlung, im Wechsel gelb/grün)
    for (let i = 0; i < nF; i++) {
      const a = i * 1.9 + 0.3, rad = (weit ? 150 : 230) + (i % 3) * 40, fx = cx + Math.cos(a) * rad * 1.5, fy = cy + 40 + Math.sin(a) * rad * 0.45;
      const fw = g0 * 3.2, fh = g0 * 1.1, f = P.feld[i % P.feld.length];
      ctx.save(); ctx.translate(fx, fy); ctx.transform(1, 0, -0.35, 1, 0, 0); box(-fw / 2, -fh / 2, fw, fh, 4, f);
      for (let k = 1; k < 5; k++) line(-fw / 2 + 4, -fh / 2 + k * fh / 5, fw / 2 - 4, -fh / 2 + k * fh / 5, 2, rgba(shade(f, -0.2), 0.6));
      ctx.restore();
    }
    // Weg zum Fluss
    { ctx.beginPath(); ctx.moveTo(cx, cy + 10); ctx.quadraticCurveTo(cx - 60, cy + 120, 400, 1430); ctx.lineWidth = weit ? 14 : 22; ctx.strokeStyle = rgba(P.weg, 0.85); ctx.lineCap = "round"; ctx.stroke(); }
    // Bäume rund um die Lichtung
    { const rb = rnd(41); const baeume = [];
      for (let i = 0; i < 26; i++) { const a = rb() * Math.PI * 2, rad = (weit ? 210 : 300) + rb() * 260; const x = cx + Math.cos(a) * rad * 1.5, y = cy + Math.sin(a) * rad * 0.5; if (y > 1060 && y < 1560 && Math.abs(x - 560) < 760) baeume.push([x, y, (weit ? 22 : 30) + rb() * 18]); }
      baeume.sort((a, b) => a[1] - b[1]);
      for (const [x, y, g] of baeume) if (y < cy) baum(x, y, g * (0.7 + (y - 1000) / 900), P, rb);
      // Häuser und Zelte (von hinten nach vorne)
      const n = nH + nZ, pk = platz(n, cx, cy, weit);
      const typ = pk.map((_, i) => i); // Häuser zuerst nahe der Mitte, Zelte außen
      const items = pk.map((p, i) => ({ p, i }));
      const nachMitte = items.slice().sort((a, b) => Math.hypot(a.p[0] - cx, (a.p[1] - cy) * 3) - Math.hypot(b.p[0] - cx, (b.p[1] - cy) * 3));
      nachMitte.forEach((it, k) => { it.haus = k < nH; it.k = k; });
      if (an(s.mauer)) { ctx.beginPath(); ctx.ellipse(cx, cy + 6, (weit ? 22 : 34) * Math.sqrt(n + 3) * 1.9 + 30, (weit ? 22 : 34) * Math.sqrt(n + 3) * 0.62 + 16, 0, Math.PI, 2 * Math.PI); ctx.lineWidth = g0 * 0.28; ctx.strokeStyle = "#7a5a3e"; ctx.stroke(); }
      const feuerAn = an(s.feuer);
      let feuerGemalt = false;
      for (const it of items) {
        const [x, y] = it.p, g = g0 * (0.75 + (y - 1000) / 700);
        if (feuerAn && !feuerGemalt && y > cy) { feuer(cx, cy, g0 * 0.55, t, P); feuerGemalt = true; }
        if (it.haus) haus(x, y, g, P, r, t, abend, it.k); else zelt(x, y, g * 0.9, P, it.k, abend);
      }
      if (feuerAn && !feuerGemalt) feuer(cx, cy, g0 * 0.55, t, P);
      if (an(s.muehle)) { const mx = cx + (weit ? 200 : 300), my = cy - 10, g = g0 * 1.2; box(mx - g * 0.35, my - g * 1.6, g * 0.7, g * 1.6, 4, P.waende[0]); poly([[mx - g * 0.45, my - g * 1.6], [mx, my - g * 2.1], [mx + g * 0.45, my - g * 1.6]], P.daecher[0]); for (let k = 0; k < 4; k++) { const a = t * 0.6 + k * Math.PI / 2; line(mx, my - g * 1.7, mx + Math.cos(a) * g * 1.1, my - g * 1.7 + Math.sin(a) * g * 1.1, g * 0.14, "#e8dcc4"); } circle(mx, my - g * 1.7, g * 0.1, "#5a3a2a"); }
      for (const [x, y, g] of baeume) if (y >= cy) baum(x, y, g * (0.7 + (y - 1000) / 900), P, rb);
    }
    // Details vorne: Steine, Blumen, Gras
    { const rd = rnd(53);
      for (let i = 0; i < 8; i++) { const x = rd() * 1080, y = 1500 + rd() * 380, g = 12 + rd() * 22; ellipse(x, y + g * 0.5, g * 1.3, g * 0.3, rgba(P.schatten, 0.3)); ellipse(x, y, g, g * 0.75, mix(P.berg, "#8a8a8a", 0.5)); ellipse(x - g * 0.3, y - g * 0.3, g * 0.45, g * 0.25, rgba("#ffffff", 0.2)); }
      for (let i = 0; i < 30; i++) { const x = rd() * 1080, y = 1440 + rd() * 460; for (let k = 0; k < 5; k++) { const a = -0.5 + k * 0.25; line(x, y, x + Math.sin(a) * 26, y - Math.cos(a) * 30, 4, shade(P.wiese[2], 0.12)); } if (i % 3 === 0) circle(x + 4, y - 30, 6, ["#ffe27a", "#ff9ab8", "#ffffff"][i % 3 === 0 ? (i / 3) % 3 : 0]); }
    }
    // leise Bewegung: Vögel am Tag, Glühwürmchen abends/nachts
    if (zeit === "tag") { for (let k = 0; k < 4; k++) { const bx = ((t * 30 + k * 260) % 1400) - 150, by = 420 + k * 40 + Math.sin(t + k) * 12, f = Math.sin(t * 8 + k) * 8; line(bx - 14, by - f, bx, by, 3, "#2a3a4a"); line(bx, by, bx + 14, by - f, 3, "#2a3a4a"); } }
    else { const rg = rnd(61); for (let i = 0; i < 28; i++) { const x = rg() * 1080 + Math.sin(t * 0.7 + i) * 20, y = 1100 + rg() * 600 + Math.cos(t * 0.5 + i) * 14, a = 0.5 + 0.5 * Math.sin(t * 2 + i * 1.3); glut(x, y, 16, "#ffe88a", 0.6 * a); circle(x, y, 2.5, rgba("#fff6c8", a)); } }
    // Figuren
    A.figurenZeigen(s, t, s.figur_y ?? (s.gross ? 1560 : 1620), s.gross ? 0.95 : 0.55);
    // dunkle, unscharfe Baumsilhouetten am Rand
    ebene("talVorne", 13, () => {
      const d = P.rand;
      for (const [x, y, rr] of [[-60, 1950, 260], [60, 2080, 220], [1140, 1930, 280], [1010, 2100, 230], [-120, 1650, 200], [1200, 1640, 220]]) circle(x, y, rr, shade(d, (x % 3) * 0.03));
      box(-40, 1500, 60, 600, 20, d); box(1060, 1480, 64, 640, 20, d);
    });
    if (zeit !== "nacht") { // Lichtstrahlen
      ctx.save(); ctx.globalCompositeOperation = "screen";
      for (const [w, b, a] of [[0.5, 60, 0.16], [0.8, 34, 0.12], [1.05, 90, 0.08]]) { ctx.save(); ctx.translate(sx, sy); ctx.rotate(-w + 0.2); ctx.fillStyle = lgrad(0, 0, 0, 1500, [[0, rgba(P.licht, a)], [1, rgba(P.licht, 0)]]); poly([[-b * 0.2, 0], [b * 0.2, 0], [b, 1500], [-b, 1500]]); ctx.fill(); ctx.restore(); }
      ctx.restore();
    }
    A._dunkel = 0;
  };

  // ---------- Icons für Einblendungen ----------
  if (A.I) {
    const I = A.I;
    I.einwohner = t => { // drei Köpfe mit Schultern
      for (const [x, y, s, f] of [[-70, 10, 0.8, "#6aa8e8"], [70, 10, 0.8, "#e88a6a"], [0, -10, 1, "#f2c14e"]]) { ellipse(x, y + 60 * s, 62 * s, 48 * s, f); circle(x, y - 10 * s, 40 * s, "#f3c9a4"); circle(x - 12 * s, y - 24 * s, 12 * s, "rgba(255,255,255,0.3)"); }
    };
    I.haus = t => { box(-80, -30, 160, 120, 10, "#f2e2c4"); poly([[-105, -25], [0, -115], [105, -25]], "#c8584a"); box(-24, 20, 48, 70, 6, "#8a5a3a"); box(30, -10, 36, 34, 6, "#ffd27a"); };
    I.kristall = t => { const p = 0.8 + 0.2 * Math.sin(t * 2); glut(0, 0, 150, "#7af0ff", 0.5 * p); poly([[0, -120], [55, -30], [30, 110], [-30, 110], [-55, -30]], "#5ad8f0"); poly([[0, -120], [55, -30], [0, 0]], "#b8f8ff"); poly([[0, 0], [30, 110], [-30, 110]], "#3ab0d0"); };
    I.aehre = t => { line(0, 110, 0, -90, 10, "#c89a3a"); for (let k = 0; k < 5; k++) for (const s of [-1, 1]) { ctx.save(); ctx.translate(0, -70 + k * 30); ctx.rotate(s * 0.6); ellipse(s * 22, 0, 26, 12, "#e8c25a"); ctx.restore(); } ellipse(0, -100, 12, 22, "#f2d06a"); };
    I.axt = t => { ctx.save(); ctx.rotate(-0.5); box(-10, -100, 20, 220, 8, "#8a5a3a"); poly([[-10, -100], [-90, -120], [-100, -40], [-10, -50]], "#b8c4d0"); line(-90, -118, -100, -42, 8, "#e8f0f8"); ctx.restore(); };
    I.waage = t => { const k = Math.sin(t * 1.5) * 0.08, g = "#f0c45a", gd = "#c8963a"; // Gericht (Deine Welt, Folge 2)
      box(-70, 110, 140, 22, 8, gd); box(-12, -100, 24, 215, 8, g); circle(0, -112, 18, g);
      ctx.save(); ctx.translate(0, -80); ctx.rotate(k); box(-125, -9, 250, 18, 9, g);
      for (const s of [-1, 1]) { line(s * 115, 0, s * 80, 80, 5, gd); line(s * 115, 0, s * 150, 80, 5, gd); ctx.save(); ctx.translate(s * 115, 82); ctx.rotate(-k); ellipse(0, 0, 50, 15, g); ellipse(0, -4, 40, 9, "#f8dc8a"); ctx.restore(); }
      ctx.restore(); };
    A.ICONS = Object.keys(I);
  }
})();
