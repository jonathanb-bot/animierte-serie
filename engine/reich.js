/* „Deine Welt“ (Jonathan 9.11., Issue #32): das Reich in leichter 3D-Optik (isometrisch, clean, flach schattiert).
   Jedes Element steht auf einem Feld und kann später ersetzt werden (Haus → Hochhaus, Weg → Straße …).
   Nur neue Namen: alle bisherigen Serien bleiben pixelgleich.

   [reich groesse=9 zeit=tag|abend|nacht bauten="haus@4,4|baum@1,2|weg@4,5-4,8|wasser@0,0-2,1" leute=140 neu=12
          praesident=4,5 markiere=5,4 nah=1.6 blick=4,4]
   - groesse: Kantenlänge der Insel in Feldern (wächst mit dem Reich)
   - bauten: Liste typ@i,j (oder typ@i1,j1-i2,j2 für ein Rechteck), Typen siehe BAU unten. Ein späterer Eintrag ersetzt
     einen früheren auf demselben Feld (so wird aus einem Haus ein Hochhaus).
   - leute: Einwohner = Follower (einfache kleine Figuren, höchstens 3 pro freiem Feld sichtbar), neu: so viele davon leuchten als Neuankömmlinge auf
   - praesident: Feld des Gründers (du, die blaue Figur), markiere: pulsierender Ring auf einem Feld
   - nah/blick: Ausschnitt um ein Feld (nah=2 = doppelt so groß); `fokus`/`zoom` sind Kamera-Angaben der Engine (zusätzlich zu den normalen Kamerafahrten)
*/
(() => {
  const { box, circle, ellipse, poly, line, shade, rgba, lgrad, rgrad, mix, lerp } = A;
  const SZ = A.SZ;
  const rnd = seed => A.rnd(seed + (A._kgVar || 0) * 7919);
  const glut = (x, y, r, farbe, a = 1) => { ctx.fillStyle = rgrad(x, y, 0, r, [[0, rgba(farbe, 0.9 * a)], [0.25, rgba(farbe, 0.4 * a)], [1, rgba(farbe, 0)]]); ctx.fillRect(x - r, y - r, r * 2, r * 2); };
  const an = v => v !== undefined && v !== false && v !== "false" && v !== "0" && v !== 0;
  const paar = (v, d) => { if (!v || v === true) return d; const [a, b] = String(v).split(",").map(Number); return [a, b]; };

  const PAL = {
    tag: { meer: ["#2a8fb8", "#46b6d6", "#7fd6e4"], gras: ["#86c95c", "#7cbf55", "#90d064"], erde: "#b07a4e", erdeS: "#8a5a3a", stein: "#7a7f8c", licht: "#fff6d8", schatten: "#1c3a3a", nacht: 0,
      wand: ["#f4ead8", "#efe0c6", "#f6e6d0"], dach: ["#d8604c", "#c86a48", "#e07a52"], glas: "#9fd8f0", glasN: "#ffd98a", weg: "#e2cf9a", strasse: "#5a6070", feld: ["#e9c75a", "#cfe07a"], baum: ["#4caf5a", "#3f9c50", "#5cbf62"], stamm: "#7a5236", wasser: "#4fc3e0", leute: ["#e86a5a", "#f2b84a", "#6ab0e8", "#9a7ad8", "#5ac08a", "#f08ab0", "#e8e0d0"] },
    abend: { meer: ["#3a3a78", "#8a4a7a", "#e0866a"], gras: ["#9a9a5a", "#8e9052", "#a6a462"], erde: "#9a5a4a", erdeS: "#6e3e3e", stein: "#7a6a7a", licht: "#ffd08a", schatten: "#2a1a34", nacht: 0.35,
      wand: ["#f0d0b0", "#e8c4a0", "#f2d4b4"], dach: ["#b8484a", "#a85444", "#c8603e"], glas: "#ffcf8a", glasN: "#ffc46a", weg: "#d8b088", strasse: "#4a4a5e", feld: ["#e8a85a", "#c8b05a"], baum: ["#5a7a4a", "#4a6a44", "#6a8a52"], stamm: "#5a3a2e", wasser: "#e89a8a", leute: ["#e86a5a", "#f2b84a", "#6ab0e8", "#9a7ad8", "#5ac08a", "#f08ab0", "#e8e0d0"] },
    nacht: { meer: ["#0a1430", "#14285a", "#1e3a6e"], gras: ["#2e5a4e", "#2a5248", "#346256"], erde: "#4a3a48", erdeS: "#32283a", stein: "#4a5068", licht: "#a8b8ff", schatten: "#050a18", nacht: 1,
      wand: ["#6a6e88", "#62667e", "#70748e"], dach: ["#5a3a4e", "#4e3a4a", "#62404e"], glas: "#2a3a5a", glasN: "#ffd27a", weg: "#5a5e78", strasse: "#2a2e40", feld: ["#5a6050", "#4e5a46"], baum: ["#24483e", "#1e4038", "#2a5044"], stamm: "#2e2630", wasser: "#2a4a8a", leute: ["#c86a6a", "#d8a85a", "#6a9ad8", "#8a7ac8", "#5aa88a", "#d88aa8", "#c8c4c0"] },
  };

  // Bauten: zeichnen auf der Feldmitte (x, y) mit den Achsen ei (+i) und ej (+j), TW = Feldbreite
  const BAU = {};
  // Quader mit Deckel, linke und rechte Seite verschieden hell
  const quader = (x, y, ei, ej, w, d, h, farbe, deckel) => {
    const P = (a, b, z = 0) => [x + ei[0] * a + ej[0] * b, y + ei[1] * a + ej[1] * b - z];
    const A0 = P(-w / 2, -d / 2), B = P(w / 2, -d / 2), C = P(w / 2, d / 2), D = P(-w / 2, d / 2);
    const up = p => [p[0], p[1] - h];
    poly([D, C, up(C), up(D)], shade(farbe, -0.08));          // linke Vorderseite (+j)
    poly([B, C, up(C), up(B)], shade(farbe, -0.24));          // rechte Vorderseite (+i)
    poly([up(A0), up(B), up(C), up(D)], deckel || shade(farbe, 0.1));
    return { A: up(A0), B: up(B), C: up(C), D: up(D), fl: { D, C, B } };
  };
  // Fenster auf einer Seitenfläche (Parallelogramm zwischen p0→p1 unten, Höhe h)
  const fensterReihe = (p0, p1, z0, h, n, farbe, licht, r, an_) => {
    for (let k = 0; k < n; k++) {
      const a = (k + 0.25) / n, b = (k + 0.75) / n;
      const q0 = [lerp(p0[0], p1[0], a), lerp(p0[1], p1[1], a) - z0], q1 = [lerp(p0[0], p1[0], b), lerp(p0[1], p1[1], b) - z0];
      const hell = an_ && r() < 0.7;
      poly([q0, q1, [q1[0], q1[1] - h], [q0[0], q0[1] - h]], hell ? licht : farbe);
      if (hell) glut((q0[0] + q1[0]) / 2, q0[1] - h / 2, h * 1.6, licht, 0.25);
    }
  };

  BAU.haus = (x, y, ei, ej, TW, P, t, r, i) => {
    const h = TW * 0.32, w = 0.62, d = 0.56, wand = P.wand[i % 3], dach = P.dach[i % 3];
    const q = quader(x, y, ei, ej, w, d, h, wand);
    // Walmdach: First entlang i
    const Z = (a, b, z) => [x + ei[0] * a + ej[0] * b, y + ei[1] * a + ej[1] * b - z];
    const ue = 0.07, hr = h + TW * 0.24;
    const a0 = Z(-w / 2 - ue, -d / 2 - ue, h), b0 = Z(w / 2 + ue, -d / 2 - ue, h), c0 = Z(w / 2 + ue, d / 2 + ue, h), d0 = Z(-w / 2 - ue, d / 2 + ue, h);
    const f1 = Z(-w * 0.18, 0, hr), f2 = Z(w * 0.18, 0, hr);
    poly([a0, b0, f2, f1], shade(dach, 0.12));
    poly([d0, c0, f2, f1], dach);
    poly([b0, c0, f2], shade(dach, -0.2));
    line(f1[0], f1[1], f2[0], f2[1], TW * 0.02, rgba(P.licht, 0.5));
    // Tür und Fenster auf der linken Vorderseite
    const { D, C } = q.fl, nacht = P.nacht > 0.3;
    const tp = [lerp(D[0], C[0], 0.62), lerp(D[1], C[1], 0.62)], tq = [lerp(D[0], C[0], 0.8), lerp(D[1], C[1], 0.8)];
    poly([tp, tq, [tq[0], tq[1] - h * 0.62], [tp[0], tp[1] - h * 0.62]], shade(dach, -0.35));
    fensterReihe(D, [lerp(D[0], C[0], 0.5), lerp(D[1], C[1], 0.5)], h * 0.38, h * 0.32, 1, P.glas, P.glasN, () => 0, nacht);
    const { B } = q.fl;
    fensterReihe(B, C, h * 0.38, h * 0.32, 2, shade(P.glas, -0.1), P.glasN, () => 0, nacht);
    // Schornstein mit Rauch
    if (i % 2 === 0) {
      const s0 = Z(w * 0.18, -d * 0.12, h + TW * 0.2);
      box(s0[0] - TW * 0.03, s0[1] - TW * 0.1, TW * 0.06, TW * 0.12, 0, shade(dach, -0.3));
      for (let k = 0; k < 4; k++) { const p = (t * 0.25 + k / 4 + i * 0.17) % 1; circle(s0[0] + p * TW * 0.25 + Math.sin(p * 6) * TW * 0.04, s0[1] - TW * 0.12 - p * TW * 0.6, TW * (0.03 + p * 0.07), rgba("#ffffff", 0.45 * (1 - p))); }
    }
  };
  // Hochhaus: hochhaus3, hochhaus8 … (Zahl = Stockwerke, Standard 6)
  BAU.hochhaus = (x, y, ei, ej, TW, P, t, r, i, n = 6) => {
    const st = TW * 0.16, h = n * st + TW * 0.1, w = 0.7, d = 0.7, f = mix(P.wand[i % 3], "#9aa8c0", 0.45);
    const q = quader(x, y, ei, ej, w, d, h, f);
    const nacht = P.nacht > 0.3, { D, C, B } = q.fl;
    for (let k = 0; k < n; k++) { fensterReihe(D, C, TW * 0.06 + k * st, st * 0.55, 3, P.glas, P.glasN, r, nacht); fensterReihe(B, C, TW * 0.06 + k * st, st * 0.55, 3, shade(P.glas, -0.12), P.glasN, r, nacht); }
    // Dachaufbau und Antenne
    const top = [(q.A[0] + q.C[0]) / 2, (q.A[1] + q.C[1]) / 2];
    quader(top[0], top[1], ei, ej, 0.25, 0.25, TW * 0.08, shade(f, -0.1));
    line(top[0], top[1] - TW * 0.08, top[0], top[1] - TW * 0.35, TW * 0.015, shade(f, -0.4));
    circle(top[0], top[1] - TW * 0.35, TW * 0.025, (Math.sin(t * 3) > 0) ? "#ff5a4a" : shade("#ff5a4a", -0.4));
  };
  BAU.baum = (x, y, ei, ej, TW, P, t, r, i) => {
    const g = TW * (0.22 + (i % 3) * 0.03), k = P.baum[i % 3];
    ellipse(x + TW * 0.05, y + TW * 0.02, g * 0.9, g * 0.35, rgba(P.schatten, 0.3));
    box(x - TW * 0.025, y - g * 0.9, TW * 0.05, g * 0.95, TW * 0.01, P.stamm);
    circle(x, y - g * 1.4, g * 0.75, k); circle(x - g * 0.42, y - g * 1.05, g * 0.5, shade(k, -0.04)); circle(x + g * 0.45, y - g * 1.1, g * 0.52, shade(k, -0.16));
    circle(x - g * 0.25, y - g * 1.65, g * 0.32, rgba("#ffffff", 0.2));
  };
  BAU.tanne = (x, y, ei, ej, TW, P, t, r, i) => {
    const g = TW * 0.42, k = shade(P.baum[i % 3], -0.12);
    ellipse(x + TW * 0.05, y + TW * 0.02, g * 0.45, g * 0.16, rgba(P.schatten, 0.3));
    for (let s = 0; s < 3; s++) { const w = g * (0.42 - s * 0.1), yy = y - g * 0.2 - s * g * 0.3; poly([[x - w, yy], [x, yy - g * 0.55], [x + w, yy]], s % 2 ? shade(k, 0.06) : k); poly([[x, yy - g * 0.55], [x + w, yy], [x + w * 0.1, yy]], rgba(P.schatten, 0.2)); }
  };
  BAU.fels = (x, y, ei, ej, TW, P) => { ellipse(x, y, TW * 0.2, TW * 0.08, rgba(P.schatten, 0.3)); poly([[x - TW * 0.18, y], [x - TW * 0.1, y - TW * 0.16], [x + TW * 0.04, y - TW * 0.2], [x + TW * 0.18, y]], P.stein); poly([[x + TW * 0.04, y - TW * 0.2], [x + TW * 0.18, y], [x + TW * 0.02, y]], shade(P.stein, -0.2)); };
  BAU.brunnen = (x, y, ei, ej, TW, P, t) => { quader(x, y, ei, ej, 0.4, 0.4, TW * 0.08, P.stein, P.wasser); for (let k = 0; k < 3; k++) { const p = (t * 0.7 + k / 3) % 1; circle(x, y - TW * 0.1 - Math.sin(p * Math.PI) * TW * 0.15, TW * 0.02, rgba("#ffffff", 0.8 * (1 - p))); } };
  BAU.laterne = (x, y, ei, ej, TW, P) => { line(x, y, x, y - TW * 0.4, TW * 0.02, "#3a3e4a"); circle(x, y - TW * 0.42, TW * 0.035, P.nacht > 0.3 ? "#ffe08a" : "#f4f0e0"); if (P.nacht > 0.3) glut(x, y - TW * 0.42, TW * 0.5, "#ffd27a", 0.4); };
  BAU.baustelle = (x, y, ei, ej, TW, P, t) => {
    const h = TW * 0.32, Z = (a, b, z) => [x + ei[0] * a + ej[0] * b, y + ei[1] * a + ej[1] * b - z];
    const ec = [[-0.3, -0.3], [0.3, -0.3], [0.3, 0.3], [-0.3, 0.3]].map(([a, b]) => [Z(a, b, 0), Z(a, b, h)]);
    for (const [u, o] of ec) line(u[0], u[1], o[0], o[1], TW * 0.025, "#c8904a");
    for (let k = 0; k < 4; k++) { const [, o1] = ec[k], [, o2] = ec[(k + 1) % 4]; line(o1[0], o1[1], o2[0], o2[1], TW * 0.02, "#d8a05a"); }
    quader(Z(0.12, 0.15, 0)[0], Z(0.12, 0.15, 0)[1], ei, ej, 0.25, 0.18, TW * 0.06, "#b07a4e");
  };
  // Bodenbeläge (werden flach auf das Feld gezeichnet)
  const BODEN = {
    weg: (k, P) => poly(k, P.weg),
    strasse: (k, P, x, y, TW) => { poly(k, P.strasse); line(lerp(k[0][0], k[1][0], 0.5), lerp(k[0][1], k[1][1], 0.5), lerp(k[2][0], k[3][0], 0.5), lerp(k[2][1], k[3][1], 0.5), TW * 0.015, rgba("#f4f0d0", 0.7)); },
    feld: (k, P, x, y, TW, i) => { const f = P.feld[i % 2]; poly(k, f); for (let s = 1; s < 5; s++) { const a = s / 5; line(lerp(k[0][0], k[3][0], a), lerp(k[0][1], k[3][1], a), lerp(k[1][0], k[2][0], a), lerp(k[1][1], k[2][1], a), TW * 0.018, shade(f, -0.18)); } },
    wasser: (k, P, x, y, TW, i, t) => { poly(k, P.wasser); for (let s = 0; s < 2; s++) { const p = (t * 0.2 + s * 0.5 + i * 0.13) % 1; box(x - TW * 0.15 + p * TW * 0.1, y - TW * 0.05 + s * TW * 0.1, TW * 0.18, TW * 0.015, TW * 0.01, rgba("#ffffff", 0.5)); } },
    platz: (k, P) => { poly(k, mix(P.weg, P.stein, 0.4)); },
  };

  const liste = v => {
    const aus = [];
    for (const teil of String(v || "").split("|").map(s => s.trim()).filter(Boolean)) {
      const [typ, ort] = teil.split("@"); if (!ort) continue;
      const [a, b] = ort.split("-"), [i1, j1] = a.split(",").map(Number), [i2, j2] = (b || a).split(",").map(Number);
      for (let i = Math.min(i1, i2); i <= Math.max(i1, i2); i++) for (let j = Math.min(j1, j2); j <= Math.max(j1, j2); j++) aus.push({ typ: typ.trim(), i, j });
    }
    return aus;
  };

  SZ.reich = (s, t) => {
    const zeit = ["abend", "nacht"].includes(s.zeit) ? s.zeit : "tag", P = PAL[zeit];
    const G = Math.max(3, Math.min(60, Number(s.groesse) || 9));
    const TW = Math.min(150, 940 / G), TH = TW / 2, ei = [TW / 2, TH / 2], ej = [-TW / 2, TH / 2];
    const cx = 540, cy = (Number(s.mitte_y) || 860) - (G - 1) * TH / 2;
    const feld = (i, j) => [cx + (i - j) * TW / 2, cy + (i + j) * TH / 2];
    // Meer und Himmelsschimmer
    ctx.fillStyle = lgrad(0, -600, 0, 2600, [[0, P.meer[0]], [0.5, P.meer[1]], [1, P.meer[2]]]); ctx.fillRect(-1500, -1500, 4080, 5000);
    if (zeit === "nacht") { const r = rnd(3); for (let k = 0; k < 90; k++) { const x = r() * 1080, y = r() * 1920; circle(x, y, 1.6, rgba("#cfe0ff", 0.25 + 0.25 * Math.sin(t + k))); } }
    { const r = rnd(5); for (let k = 0; k < 46; k++) { const x = (r() * 1400 - 160 + t * 6 * (0.5 + r())) % 1300 - 110, y = r() * 1920; box(x, y, 40 + r() * 60, 4, 2, rgba("#ffffff", zeit === "nacht" ? 0.08 : 0.16)); } }
    // Ausschnitt
    const z = Number(s.nah) || 1, fk = paar(s.blick, [(G - 1) / 2, (G - 1) / 2]), fp = feld(fk[0], fk[1]);
    ctx.save();
    if (z !== 1 || s.blick) { ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-fp[0], -fp[1]); }
    // Insel: Seitenwände (Erde, Gestein), weicher Schatten im Wasser
    const tiefe = TW * 0.55;
    const L = feld(0, G - 1), R = feld(G - 1, 0), U = feld(G - 1, G - 1), O = feld(0, 0);
    const ecke = (p, dx, dy) => [p[0] + dx, p[1] + dy];
    const uL = ecke(L, -TW / 2, 0), uU = ecke(U, 0, TH / 2), uR = ecke(R, TW / 2, 0), uO = ecke(O, 0, -TH / 2);
    ellipse(uU[0], uU[1] + tiefe * 0.9, G * TW * 0.62, G * TH * 0.42, rgba(P.schatten, 0.25));
    for (let k = 0; k < 3; k++) { const p = (t * 0.15 + k / 3) % 1; ctx.beginPath(); ctx.ellipse(uU[0], (uL[1] + uU[1]) / 2 + tiefe * 0.6, G * TW * (0.55 + p * 0.12), G * TH * (0.55 + p * 0.12), 0, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = rgba("#ffffff", 0.18 * (1 - p)); ctx.stroke(); }
    poly([uL, uU, [uU[0], uU[1] + tiefe], [uL[0], uL[1] + tiefe]], P.erde);
    poly([uU, uR, [uR[0], uR[1] + tiefe], [uU[0], uU[1] + tiefe]], P.erdeS);
    // Gesteinsschichten
    for (const [a, b, f] of [[uL, uU, P.erde], [uU, uR, P.erdeS]]) for (let k = 1; k < 3; k++) { const dy = tiefe * k / 3; line(a[0], a[1] + dy, b[0], b[1] + dy, 3, rgba(shade(f, -0.25), 0.6)); }
    { const r = rnd(9); for (let k = 0; k < G * 3; k++) { const a = r(), lr = r() < 0.5, p0 = lr ? uL : uU, p1 = lr ? uU : uR; circle(lerp(p0[0], p1[0], a), lerp(p0[1], p1[1], a) + tiefe * (0.3 + r() * 0.6), TW * 0.03 + r() * TW * 0.03, rgba(shade(P.erde, -0.3), 0.5)); } }
    poly([uO, uR, uU, uL], P.gras[0]);
    // Felder (Gras, leicht verschieden), Bodenbeläge
    const bauten = liste(s.bauten), aufFeld = {};
    for (const b of bauten) aufFeld[b.i + "," + b.j] = b; // späterer Eintrag ersetzt früheren
    const r0 = rnd(13);
    for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
      const [x, y] = feld(i, j), k = [[x, y - TH / 2], [x + TW / 2, y], [x, y + TH / 2], [x - TW / 2, y]];
      poly(k, P.gras[(i * 7 + j * 3) % 3]);
      line(k[0][0], k[0][1], k[1][0], k[1][1], 1.5, rgba("#ffffff", 0.08));
      const b = aufFeld[i + "," + j];
      if (b && BODEN[b.typ]) BODEN[b.typ](k, P, x, y, TW, i * 3 + j, t);
      if (!b && r0() < 0.18) for (let q = 0; q < 3; q++) { const gx = x + (r0() - 0.5) * TW * 0.5, gy = y + (r0() - 0.5) * TH * 0.5; line(gx, gy, gx - 3, gy - TW * 0.06, 2.5, shade(P.gras[1], -0.15)); line(gx, gy, gx + 3, gy - TW * 0.06, 2.5, shade(P.gras[1], -0.1)); }
    }
    // Markierung
    if (s.markiere) { const [mi, mj] = paar(s.markiere), [x, y] = feld(mi, mj), p = 0.5 + 0.5 * Math.sin(t * 4); ctx.beginPath(); ctx.ellipse(x, y, TW * (0.42 + p * 0.06), TH * (0.42 + p * 0.06), 0, 0, Math.PI * 2); ctx.lineWidth = TW * 0.04; ctx.strokeStyle = rgba("#ffe27a", 0.6 + 0.4 * p); ctx.stroke(); glut(x, y, TW * 0.8, "#ffe27a", 0.25 * p); }
    // Einwohner verteilen (frei: Felder ohne Gebäude)
    const frei = []; for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) { const b = aufFeld[i + "," + j]; if (!b || BODEN[b.typ]) frei.push([i, j]); }
    const nL = Math.max(0, Math.round(Number(s.leute) || 0)), nNeu = Math.max(0, Math.min(nL, Math.round(Number(s.neu) || 0))), zeigen = Math.min(nL, 900, frei.length * 3);
    const leute = []; const rl = rnd(17);
    const mitte = (G - 1) / 2;
    const freiS = frei.slice().sort((a, b) => Math.hypot(a[0] - mitte, a[1] - mitte) - Math.hypot(b[0] - mitte, b[1] - mitte));
    for (let k = 0; k < zeigen; k++) {
      const f = freiS[Math.floor(Math.pow(rl(), 1.6) * freiS.length)] || [mitte, mitte];
      leute.push({ i: f[0] + (rl() - 0.5) * 0.8, j: f[1] + (rl() - 0.5) * 0.8, farbe: P.leute[k % P.leute.length], neu: k >= zeigen - nNeu, ph: rl() * 6 });
    }
    // Zeichenreihenfolge: alles nach i+j
    const dinge = [];
    for (const b of bauten) if (aufFeld[b.i + "," + b.j] === b && !BODEN[b.typ]) dinge.push({ d: b.i + b.j, art: "bau", b });
    for (const p of leute) dinge.push({ d: p.i + p.j + 0.3, art: "mensch", p });
    if (s.praesident) { const [pi, pj] = paar(s.praesident); dinge.push({ d: pi + pj + 0.35, art: "praesident", i: pi, j: pj }); }
    dinge.sort((a, b) => a.d - b.d);
    const mensch = (x, y, g, farbe, haut = "#eac3a0", haar = "#4a3324", hop = 0) => {
      ellipse(x, y, g * 0.32, g * 0.12, rgba(P.schatten, 0.35));
      y -= hop;
      box(x - g * 0.14, y - g * 0.42, g * 0.11, g * 0.42, g * 0.05, "#3a3e4e"); box(x + g * 0.03, y - g * 0.42, g * 0.11, g * 0.42, g * 0.05, "#343848");
      box(x - g * 0.24, y - g * 0.95, g * 0.48, g * 0.6, g * 0.2, farbe); box(x + g * 0.02, y - g * 0.95, g * 0.22, g * 0.6, g * 0.15, rgba("#000000", 0.12));
      circle(x, y - g * 1.18, g * 0.24, haut); ctx.beginPath(); ctx.arc(x, y - g * 1.2, g * 0.25, Math.PI * 1.05, Math.PI * 1.95); ctx.fillStyle = haar; ctx.fill();
    };
    let bi = 0;
    for (const o of dinge) {
      if (o.art === "bau") {
        const { b } = o, [x, y] = feld(b.i, b.j), r = rnd(31 + b.i * 17 + b.j * 5);
        const m = /^([a-z]+)(\d*)$/.exec(b.typ), typ = m ? m[1] : b.typ, n = m && m[2] ? Number(m[2]) : undefined;
        if (BAU[typ]) BAU[typ](x, y, ei, ej, TW, P, t, r, bi++, n);
      } else if (o.art === "mensch") {
        const { p } = o, [x, y] = feld(p.i, p.j), g = TW * 0.26, hop = Math.max(0, Math.sin(t * 2 + p.ph)) * TW * 0.02;
        if (p.neu) glut(x, y - g * 0.7, g * 1.4, "#fff2a8", 0.45 + 0.25 * Math.sin(t * 3 + p.ph));
        mensch(x, y, g, p.farbe, undefined, ["#4a3324", "#2a2220", "#8a5a3a", "#d8b060"][Math.floor(p.ph) % 4], hop);
      } else {
        const [x, y] = feld(o.i, o.j), g = TW * 0.42;
        glut(x, y - g * 0.6, g * 1.6, "#ffe27a", 0.3);
        mensch(x, y, g, "#3f7f8c");
        // Schärpe des Gründers
        line(x - g * 0.2, y - g * 0.92, x + g * 0.2, y - g * 0.45, g * 0.08, "#f2c14e");
      }
    }
    ctx.restore();
    // Wolken vorne (weich, ziehen langsam) für Tiefe
    { const r = rnd(41); for (let k = 0; k < 3; k++) { const wx = ((r() * 1300 + t * 12) % 1500) - 250, wy = [1720, 1800, 1860][k] + r() * 40, a = zeit === "nacht" ? 0.1 : 0.55; for (const [dx, dy, rr] of [[0, 0, 60], [70, -24, 80], [150, 0, 58], [210, 10, 40]]) circle(wx + dx, wy + dy, rr, rgba("#ffffff", a)); } }
    if (P.nacht === 0) A.licht(900, 120, 900, P.licht, 0.35);
    A._dunkel = 0;
  };
})();
