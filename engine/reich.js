/* „Deine Welt“ (Jonathan 9.11., Issue #32): das Reich als realistisch wirkende 3D-Miniatur (isometrisch).
   Sonne von links oben mit weichen Schlagschatten, natürliche Küste mit Strand und Klippen, flaches und tiefes Wasser
   mit Brandung, Häuser/Bäume mit Licht- und Schattenseite, Tiefenunschärfe oben/unten nur mit tiltshift=1 (Standard aus: alles scharf).
   Jedes Element steht auf einem Feld und kann später ersetzt werden (Haus → Hochhaus, Weg → Straße …).
   Nur neue Namen: alle bisherigen Serien bleiben pixelgleich.

   [reich groesse=9 zeit=tag|abend|nacht bauten="haus@4,4|baum@1,2|weg@4,5-4,8|wasser@0,0-2,1" leute=140 neu=12
          praesident=4,5 markiere=5,4 nah=1.6 blick=4,4 form=rund|eckig tiltshift=1 mitte_y=860]
   - groesse: Kantenlänge der Insel in Feldern (wächst mit dem Reich); form=rund (Standard) rundet die Küste natürlich ab
   - bauten: typ@i,j (oder typ@i1,j1-i2,j2 für ein Rechteck). Ein späterer Eintrag ersetzt einen früheren auf demselben
     Feld (so wird aus einem Haus ein Hochhaus). Typen: BAU (haus, hochhausN, baum, tanne, fels, brunnen, laterne,
     baustelle, boot, gericht, zelt, laden) und BODEN (weg, strasse, feld, wasser, platz, sand)
   - leute: Einwohner = Follower (einfache Figuren, höchstens 3 pro freiem Feld sichtbar), neu: so viele leuchten auf
   - praesident: Feld des Gründers (du, blaue Jacke, gelbe Schärpe), markiere: pulsierender Ring auf einem Feld
   - nah/blick: Ausschnitt um ein Feld (nah=2 = doppelt so groß); `fokus`/`zoom` sind Kamera-Angaben der Engine
*/
(() => {
  const { box, circle, ellipse, poly, line, shade, rgba, lgrad, rgrad, mix, lerp } = A;
  const SZ = A.SZ;
  const rnd = seed => A.rnd(seed + (A._kgVar || 0) * 7919);
  const glut = (x, y, r, farbe, a = 1) => { ctx.fillStyle = rgrad(x, y, 0, r, [[0, rgba(farbe, 0.9 * a)], [0.25, rgba(farbe, 0.4 * a)], [1, rgba(farbe, 0)]]); ctx.fillRect(x - r, y - r, r * 2, r * 2); };
  const an = (v, d = false) => (v === undefined ? d : v !== false && v !== "false" && v !== "0" && v !== 0);
  const paar = (v, d) => { if (!v || v === true) return d; const [a, b] = String(v).split(",").map(Number); return [a, b]; };
  const hash = (i, j, k = 0) => { const s = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453; return s - Math.floor(s); };
  const rausch = (x, y, k = 0) => { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, s = t => t * t * (3 - 2 * t);
    const a = hash(i, j, k), b = hash(i + 1, j, k), c = hash(i, j + 1, k), d = hash(i + 1, j + 1, k);
    return lerp(lerp(a, b, s(fx)), lerp(c, d, s(fx)), s(fy)); };

  const tafeln = {};
  const tafel = name => { const cw = ctx.canvas.width, ch = ctx.canvas.height; let c = tafeln[name];
    if (!c || c.canvas.width !== cw || c.canvas.height !== ch) { const el = document.createElement("canvas"); el.width = cw; el.height = ch; c = tafeln[name] = el.getContext("2d"); }
    return c; };
  const ebene = (name, unschaerfe, fn, alpha = 1) => {
    const c = tafel(name), m = ctx.getTransform(), k = Math.hypot(m.a, m.b);
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, c.canvas.width, c.canvas.height); c.setTransform(m);
    A.umleiten(c, fn);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alpha;
    if (unschaerfe > 0) ctx.filter = `blur(${(unschaerfe * k).toFixed(1)}px)`;
    ctx.drawImage(c.canvas, 0, 0); ctx.restore();
  };
  const huelle = pts => { const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const kr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = []; for (const q of p) { while (lo.length >= 2 && kr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    const hi = []; for (const q of p.reverse()) { while (hi.length >= 2 && kr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
    return lo.slice(0, -1).concat(hi.slice(0, -1)); };

  const PAL = {
    tag: { tief: "#1f6f9e", flach: "#4fc4cf", gras: ["#7fb85a", "#6fae50", "#8cc262"], sand: "#eadbb0", erde: "#9a6a44", erdeS: "#7a4e34", fels: "#8a8a90", licht: "#fff4d6", schatten: "#173030", sonne: 1,
      wand: ["#f1e6d2", "#eadcc2", "#f3e2cc", "#e6e0d6"], sockel: "#b8a890", dach: ["#c2553f", "#a85a3c", "#8a4a42", "#6a5a54"], glas: "#8fc6dc", glasN: "#ffd98a", rahmen: "#ffffff", weg: "#d8c49a", strasse: "#5c6068", feld: ["#e4c25a", "#b8d06a"], baum: ["#4a9a4e", "#3f8a48", "#5aa854"], tanne: "#2f6a48", stamm: "#6e4a34", wasser: "#4cb6d4", leute: ["#d8564a", "#e8a83a", "#4a8ad8", "#8a6ac8", "#4aa878", "#e07aa0", "#e8e2d6", "#5a5e6a"] },
    abend: { tief: "#2a3a6e", flach: "#c8788a", gras: ["#a09a5a", "#929052", "#aca462"], sand: "#e8c4a0", erde: "#8a5444", erdeS: "#643a38", fels: "#8a7a80", licht: "#ffc888", schatten: "#2a1a30", sonne: 0.7,
      wand: ["#f0d2b4", "#e8c8a6", "#f2d6b8", "#e2ccbc"], sockel: "#a88a7a", dach: ["#a8443e", "#94503a", "#7a3e42", "#5e4a4c"], glas: "#ffc88a", glasN: "#ffc46a", rahmen: "#ffe8d8", weg: "#d4aa88", strasse: "#4a4a58", feld: ["#e4a85a", "#b8b05a"], baum: ["#5e7a48", "#4e6a42", "#6a8a50"], tanne: "#3e5446", stamm: "#5a3a2e", wasser: "#e0948a", leute: ["#d8564a", "#e8a83a", "#4a8ad8", "#8a6ac8", "#4aa878", "#e07aa0", "#e8e2d6", "#5a5e6a"] },
    nacht: { tief: "#081634", flach: "#16406a", gras: ["#2c5248", "#284a42", "#30584c"], sand: "#6a7088", erde: "#3e3442", erdeS: "#2c2434", fels: "#4a5068", licht: "#a8b8ff", schatten: "#02060e", sonne: 0,
      wand: ["#6a6e86", "#62667c", "#70748a", "#5e6276"], sockel: "#4a4c5c", dach: ["#4e3644", "#463440", "#3e3240", "#3a3a44"], glas: "#24304a", glasN: "#ffd27a", rahmen: "#8a90a8", weg: "#585c74", strasse: "#262a38", feld: ["#565c4c", "#4a5644"], baum: ["#22443c", "#1e3c36", "#284c42"], tanne: "#18342e", stamm: "#2a2430", wasser: "#264680", leute: ["#b85a5a", "#c8984a", "#5a86c8", "#7a6ab8", "#4a987a", "#c87a98", "#b8b4b0", "#4a4e5a"] },
  };

  const BAU = {}, SCHATTEN = {};
  const Pt = (x, y, ei, ej) => (a, b, z = 0) => [x + ei[0] * a + ej[0] * b, y + ei[1] * a + ej[1] * b - z];
  const quader = (x, y, ei, ej, w, d, h, farbe, deckel, P) => {
    const Z = Pt(x, y, ei, ej);
    const A0 = Z(-w / 2, -d / 2), B = Z(w / 2, -d / 2), C = Z(w / 2, d / 2), D = Z(-w / 2, d / 2), up = p => [p[0], p[1] - h];
    const L = shade(farbe, -0.04), R = shade(farbe, -0.24);
    ctx.fillStyle = lgrad(0, D[1] - h, 0, D[1], [[0, shade(L, 0.05)], [1, shade(L, -0.06)]]); poly([D, C, up(C), up(D)]); ctx.fill();
    ctx.fillStyle = lgrad(0, B[1] - h, 0, C[1], [[0, R], [1, shade(R, -0.08)]]); poly([B, C, up(C), up(B)]); ctx.fill();
    poly([up(A0), up(B), up(C), up(D)], deckel || shade(farbe, 0.12));
    line(up(D)[0], up(D)[1], up(C)[0], up(C)[1], 1.6, rgba("#ffffff", 0.35));
    return { A: up(A0), B: up(B), C: up(C), D: up(D), fl: { D, C, B }, Z };
  };
  const fenster = (p0, p1, z0, h, n, P, r, leuchten, seite) => {
    for (let k = 0; k < n; k++) {
      const a = (k + 0.22) / n, b = (k + 0.78) / n;
      const q0 = [lerp(p0[0], p1[0], a), lerp(p0[1], p1[1], a) - z0], q1 = [lerp(p0[0], p1[0], b), lerp(p0[1], p1[1], b) - z0];
      const hell = leuchten && r() < 0.75, rr = [q0, q1, [q1[0], q1[1] - h], [q0[0], q0[1] - h]];
      poly(rr.map(([u, v]) => [u, v + 1.5]), rgba(P.rahmen, seite ? 0.55 : 0.85));
      const g = hell ? P.glasN : shade(P.glas, seite ? -0.18 : 0);
      ctx.fillStyle = lgrad(0, q0[1] - h, 0, q0[1], [[0, shade(g, 0.15)], [1, shade(g, -0.12)]]); poly(rr.map(([u, v], i) => [u + (i === 0 || i === 3 ? 1.2 : -1.2), v + (i < 2 ? -1.2 : 1.2)])); ctx.fill();
      line((q0[0] + q1[0]) / 2, (q0[1] + q1[1]) / 2, (q0[0] + q1[0]) / 2, (q0[1] + q1[1]) / 2 - h, 1.2, rgba(P.rahmen, 0.7));
      if (hell) glut((q0[0] + q1[0]) / 2, q0[1] - h / 2, h * 2, P.glasN, 0.22);
      else poly([q0, [lerp(q0[0], q1[0], 0.35), lerp(q0[1], q1[1], 0.35)], [lerp(q0[0], q1[0], 0.15), lerp(q0[1], q1[1], 0.15) - h], [q0[0], q0[1] - h * 0.7]], rgba("#ffffff", 0.18));
    }
  };

  BAU.haus = (x, y, ei, ej, TW, P, t, r, idx) => {
    const h = TW * 0.3, w = 0.6, d = 0.54, wand = P.wand[idx % 4], dach = P.dach[idx % 4];
    quader(x, y, ei, ej, w + 0.04, d + 0.04, TW * 0.04, P.sockel, null, P);
    const q = quader(x, y - TW * 0.04, ei, ej, w, d, h - TW * 0.04, wand, null, P), Z = q.Z;
    const { D, C, B } = q.fl, nacht = P.sonne < 0.5;
    const tp = [lerp(D[0], C[0], 0.6), lerp(D[1], C[1], 0.6)], tq = [lerp(D[0], C[0], 0.8), lerp(D[1], C[1], 0.8)];
    poly([tp, tq, [tq[0], tq[1] - h * 0.62], [tp[0], tp[1] - h * 0.62]], shade(dach, -0.38));
    poly([[tp[0], tp[1] - h * 0.62], [tq[0], tq[1] - h * 0.62], [tq[0], tq[1] - h * 0.66], [tp[0], tp[1] - h * 0.66]], rgba("#ffffff", 0.5));
    circle(lerp(tp[0], tq[0], 0.8), tp[1] - h * 0.32, 1.6, "#e8c86a");
    fenster(D, [lerp(D[0], C[0], 0.48), lerp(D[1], C[1], 0.48)], h * 0.34, h * 0.34, 1, P, r, nacht, false);
    fenster(B, C, h * 0.34, h * 0.34, 2, P, r, nacht, true);
    poly([[D[0], D[1] - h], [C[0], C[1] - h], [C[0], C[1] - h + TW * 0.04], [D[0], D[1] - h + TW * 0.04]], rgba("#000000", 0.14));
    const ue = 0.07, hr = h + TW * 0.26;
    const a0 = Z(-w / 2 - ue, -d / 2 - ue, h), b0 = Z(w / 2 + ue, -d / 2 - ue, h), c0 = Z(w / 2 + ue, d / 2 + ue, h), d0 = Z(-w / 2 - ue, d / 2 + ue, h);
    const f1 = Z(-w / 2 - ue, 0, hr), f2 = Z(w / 2 + ue, 0, hr);
    poly([a0, b0, f2, f1], shade(dach, 0.14));
    poly([Z(w / 2, -d / 2, h), Z(w / 2, d / 2, h), f2], shade(wand, -0.22));
    ctx.fillStyle = lgrad(f1[0], f1[1], d0[0], d0[1], [[0, shade(dach, 0.04)], [1, shade(dach, -0.12)]]); poly([d0, c0, f2, f1]); ctx.fill();
    for (let k = 1; k < 4; k++) { const a = k / 4; line(lerp(f1[0], d0[0], a), lerp(f1[1], d0[1], a), lerp(f2[0], c0[0], a), lerp(f2[1], c0[1], a), 1.3, rgba(shade(dach, -0.35), 0.5)); }
    line(f1[0], f1[1], f2[0], f2[1], TW * 0.018, shade(dach, 0.3));
    line(d0[0], d0[1], c0[0], c0[1], TW * 0.012, rgba("#000000", 0.25));
    if (idx % 2 === 0) {
      const s0 = Z(w * 0.2, -d * 0.15, h + TW * 0.18);
      quader(s0[0], s0[1] + TW * 0.06, ei, ej, 0.08, 0.08, TW * 0.14, shade(dach, -0.25), null, P);
      for (let k = 0; k < 5; k++) { const p = (t * 0.22 + k / 5 + idx * 0.17) % 1; circle(s0[0] + p * TW * 0.3 + Math.sin(p * 6) * TW * 0.04, s0[1] - TW * 0.1 - p * TW * 0.7, TW * (0.025 + p * 0.07), rgba(nacht ? "#9aa4c0" : "#ffffff", 0.4 * (1 - p))); }
    }
  };
  SCHATTEN.haus = TW => ({ w: 0.66, d: 0.6, h: TW * 0.5 });
  BAU.hochhaus = (x, y, ei, ej, TW, P, t, r, idx, n = 6) => {
    const st = TW * 0.15, h = n * st + TW * 0.12, w = 0.72, d = 0.72, f = mix(P.wand[idx % 4], "#a8b4c4", 0.5);
    const q = quader(x, y, ei, ej, w, d, h, f, null, P);
    const nacht = P.sonne < 0.5, { D, C, B } = q.fl;
    const e0 = [lerp(D[0], C[0], 0.38), lerp(D[1], C[1], 0.38)], e1 = [lerp(D[0], C[0], 0.62), lerp(D[1], C[1], 0.62)];
    poly([e0, e1, [e1[0], e1[1] - TW * 0.1], [e0[0], e0[1] - TW * 0.1]], nacht ? P.glasN : shade(P.glas, -0.2));
    for (let k = 0; k < n; k++) { fenster(D, C, TW * 0.14 + k * st, st * 0.55, 3, P, r, nacht, false); fenster(B, C, TW * 0.14 + k * st, st * 0.55, 3, P, r, nacht, true); }
    for (let k = 0; k <= n; k++) { const zz = TW * 0.12 + k * st; line(D[0], D[1] - zz, C[0], C[1] - zz, 1.2, rgba("#ffffff", 0.25)); line(C[0], C[1] - zz, B[0], B[1] - zz, 1.2, rgba("#000000", 0.12)); }
    const top = [(q.A[0] + q.C[0]) / 2, (q.A[1] + q.C[1]) / 2];
    quader(top[0] - TW * 0.05, top[1], ei, ej, 0.22, 0.2, TW * 0.08, shade(f, -0.12), null, P);
    line(top[0] + TW * 0.08, top[1], top[0] + TW * 0.08, top[1] - TW * 0.38, TW * 0.012, shade(f, -0.45));
    circle(top[0] + TW * 0.08, top[1] - TW * 0.38, TW * 0.022, Math.sin(t * 3) > 0 ? "#ff5a4a" : shade("#ff5a4a", -0.45));
  };
  SCHATTEN.hochhaus = (TW, n = 6) => ({ w: 0.72, d: 0.72, h: n * TW * 0.15 + TW * 0.12 });
  const kugel = (x, y, r0, farbe) => { ctx.fillStyle = rgrad(x - r0 * 0.35, y - r0 * 0.4, r0 * 0.1, r0 * 1.15, [[0, shade(farbe, 0.22)], [0.55, farbe], [1, shade(farbe, -0.28)]]); ctx.beginPath(); ctx.arc(x, y, r0, 0, Math.PI * 2); ctx.fill(); };
  BAU.baum = (x, y, ei, ej, TW, P, t, r, idx) => {
    const g = TW * (0.22 + (idx % 3) * 0.035), k = P.baum[idx % 3], wind = Math.sin(t * 1.2 + idx) * TW * 0.006;
    ellipse(x, y + TW * 0.01, g * 0.55, g * 0.22, rgba(P.schatten, 0.35));
    ctx.fillStyle = lgrad(x - TW * 0.03, 0, x + TW * 0.03, 0, [[0, shade(P.stamm, 0.1)], [1, shade(P.stamm, -0.25)]]); A.rr(x - TW * 0.028, y - g * 0.95, TW * 0.056, g * 0.97, TW * 0.012); ctx.fill();
    for (const [dx, dy, sz] of [[-0.42, -1.0, 0.55], [0.45, -1.05, 0.58], [0, -1.55, 0.7], [-0.2, -1.25, 0.6], [0.25, -1.35, 0.55]]) kugel(x + dx * g + wind, y + dy * g, sz * g, k);
  };
  SCHATTEN.baum = TW => ({ w: 0.3, d: 0.3, h: TW * 0.45, rund: true });
  BAU.tanne = (x, y, ei, ej, TW, P, t, r, idx) => {
    const g = TW * (0.46 + (idx % 2) * 0.08), k = P.tanne;
    ellipse(x, y + TW * 0.01, g * 0.3, g * 0.12, rgba(P.schatten, 0.35));
    box(x - TW * 0.02, y - g * 0.2, TW * 0.04, g * 0.22, 2, P.stamm);
    for (let q = 0; q < 4; q++) { const w = g * (0.36 - q * 0.075), yy = y - g * 0.15 - q * g * 0.22;
      poly([[x - w, yy], [x, yy - g * 0.42], [x + w, yy]], shade(k, 0.08 - q * 0.02)); poly([[x, yy - g * 0.42], [x + w, yy], [x + w * 0.05, yy]], shade(k, -0.22)); }
  };
  SCHATTEN.tanne = TW => ({ w: 0.22, d: 0.22, h: TW * 0.5, rund: true });
  BAU.fels = (x, y, ei, ej, TW, P) => { ellipse(x, y + 2, TW * 0.2, TW * 0.07, rgba(P.schatten, 0.35)); const f = P.fels;
    poly([[x - TW * 0.19, y], [x - TW * 0.12, y - TW * 0.13], [x - TW * 0.02, y - TW * 0.19], [x + TW * 0.1, y - TW * 0.14], [x + TW * 0.19, y]], shade(f, 0.08));
    poly([[x - TW * 0.02, y - TW * 0.19], [x + TW * 0.1, y - TW * 0.14], [x + TW * 0.19, y], [x + TW * 0.02, y]], shade(f, -0.2));
    poly([[x - TW * 0.12, y - TW * 0.13], [x - TW * 0.02, y - TW * 0.19], [x - TW * 0.04, y - TW * 0.1]], rgba("#ffffff", 0.25)); };
  SCHATTEN.fels = TW => ({ w: 0.3, d: 0.25, h: TW * 0.15, rund: true });
  BAU.brunnen = (x, y, ei, ej, TW, P, t) => { quader(x, y, ei, ej, 0.42, 0.42, TW * 0.09, P.fels, P.wasser, P); const Z = Pt(x, y, ei, ej);
    for (const [a, b] of [[-0.18, -0.18], [0.18, 0.18]]) { const p = Z(a, b, TW * 0.09); line(p[0], p[1], p[0], p[1] - TW * 0.25, TW * 0.02, P.stamm); }
    const p1 = Z(-0.18, -0.18, TW * 0.34), p2 = Z(0.18, 0.18, TW * 0.34); line(p1[0], p1[1], p2[0], p2[1], TW * 0.025, P.stamm);
    for (let k = 0; k < 3; k++) { const p = (t * 0.7 + k / 3) % 1; circle(x + Math.sin(k * 2) * TW * 0.05, y - TW * 0.12 - p * TW * 0.05, TW * 0.015, rgba("#ffffff", 0.7 * (1 - p))); } };
  SCHATTEN.brunnen = TW => ({ w: 0.42, d: 0.42, h: TW * 0.2 });
  BAU.laterne = (x, y, ei, ej, TW, P) => { line(x, y, x, y - TW * 0.42, TW * 0.018, "#3a3e4a"); box(x - TW * 0.03, y - TW * 0.48, TW * 0.06, TW * 0.06, 2, "#3a3e4a"); circle(x, y - TW * 0.45, TW * 0.022, P.sonne < 0.5 ? "#ffe08a" : "#f4f0e0"); if (P.sonne < 0.5) { glut(x, y - TW * 0.45, TW * 0.6, "#ffd27a", 0.45); ellipse(x, y, TW * 0.3, TW * 0.12, rgba("#ffd27a", 0.25)); } };
  BAU.baustelle = (x, y, ei, ej, TW, P, t) => { const h = TW * 0.32, Z = Pt(x, y, ei, ej);
    poly([Z(-0.36, -0.36), Z(0.36, -0.36), Z(0.36, 0.36), Z(-0.36, 0.36)], rgba("#b08a5a", 0.55));
    const ec = [[-0.3, -0.3], [0.3, -0.3], [0.3, 0.3], [-0.3, 0.3]].map(([a, b]) => [Z(a, b, 0), Z(a, b, h)]);
    for (const [u, o] of ec) line(u[0], u[1], o[0], o[1], TW * 0.022, "#c8904a");
    for (let k = 0; k < 4; k++) { const [, o1] = ec[k], [, o2] = ec[(k + 1) % 4], [u1] = ec[k]; line(o1[0], o1[1], o2[0], o2[1], TW * 0.018, "#d8a05a"); line(u1[0], u1[1], o2[0], o2[1], TW * 0.01, rgba("#c8904a", 0.7)); }
    const sp = Z(0.12, 0.16, 0); quader(sp[0], sp[1], ei, ej, 0.24, 0.16, TW * 0.06, "#b07a4e", null, P);
    const kp = Z(-0.15, 0.2, 0); for (let q = 0; q < 3; q++) quader(kp[0], kp[1] - q * TW * 0.03, ei, ej, 0.12, 0.12, TW * 0.03, "#c8c0b0", null, P); };
  BAU.boot = (x, y, ei, ej, TW, P, t, r, idx) => { const b = Math.sin(t * 1.5 + idx) * TW * 0.01, Z = Pt(x, y + b, ei, ej);
    poly([Z(-0.35, -0.08), Z(0.35, -0.08), Z(0.45, 0), Z(0.35, 0.08), Z(-0.35, 0.08)], "#8a5a3a");
    const m = Z(0, 0, 0); line(m[0], m[1], m[0], m[1] - TW * 0.4, TW * 0.012, "#5a3a26"); poly([[m[0], m[1] - TW * 0.38], [m[0] + TW * 0.2, m[1] - TW * 0.12], [m[0], m[1] - TW * 0.1]], "#f4f0e6"); };

  // Folge 2 (11.11., Top-Kommentar): Gericht, kleiner Säulenbau mit Giebel, goldener Waage und Fahne
  BAU.gericht = (x, y, ei, ej, TW, P, t, r, idx) => {
    const stein = mix(P.wand[0], "#d8d6d0", 0.55), dach = mix(P.dach[3], "#4e6274", 0.55), nacht = P.sonne < 0.5, Z = Pt(x, y, ei, ej);
    quader(x, y, ei, ej, 0.84, 0.84, TW * 0.03, shade(stein, -0.14), null, P);
    quader(x, y - TW * 0.03, ei, ej, 0.78, 0.78, TW * 0.03, shade(stein, -0.06), null, P);
    const z0 = TW * 0.06, h = TW * 0.3, w = 0.62, dT = 0.68, dk = 0.48, ob = -dT / 2 + dk / 2;
    const c = Z(0, ob, z0), q = quader(c[0], c[1], ei, ej, w, dk, h, stein, null, P), { D, C, B } = q.fl;
    const t0 = [lerp(D[0], C[0], 0.38), lerp(D[1], C[1], 0.38)], t1 = [lerp(D[0], C[0], 0.62), lerp(D[1], C[1], 0.62)], th = h * 0.6;
    poly([t0, t1, [t1[0], t1[1] - th], [t0[0], t0[1] - th]], nacht ? P.glasN : "#6a4a36");
    if (nacht) glut((t0[0] + t1[0]) / 2, t0[1] - th / 2, TW * 0.35, P.glasN, 0.35);
    line((t0[0] + t1[0]) / 2, (t0[1] + t1[1]) / 2, (t0[0] + t1[0]) / 2, (t0[1] + t1[1]) / 2 - th, 1.2, rgba("#000000", 0.25));
    fenster(B, C, h * 0.3, h * 0.42, 2, P, r, nacht, true);
    for (let k = 0; k < 4; k++) { // Säulen vor der Front
      const a = -w / 2 + 0.05 + k * (w - 0.1) / 3, u = Z(a, dT / 2 - 0.05, z0), o = Z(a, dT / 2 - 0.05, z0 + h), cw = TW * 0.026;
      ellipse(u[0], u[1], cw * 1.5, cw * 0.6, rgba(P.schatten, 0.3));
      ctx.fillStyle = lgrad(u[0] - cw, 0, u[0] + cw, 0, [[0, shade(stein, 0.12)], [0.45, stein], [1, shade(stein, -0.3)]]); ctx.fillRect(u[0] - cw, o[1], cw * 2, u[1] - o[1]);
      box(o[0] - cw * 1.5, o[1] - TW * 0.012, cw * 3, TW * 0.02, 1, shade(stein, 0.06)); box(u[0] - cw * 1.5, u[1] - TW * 0.014, cw * 3, TW * 0.016, 1, shade(stein, -0.08));
    }
    const W = w + 0.1, Dd = dT + 0.08, za = z0 + h, ha = TW * 0.045;
    const g = Z(0, 0, za); quader(g[0], g[1], ei, ej, W, Dd, ha, shade(stein, 0.04), null, P);
    const zr = za + ha, hr = TW * 0.17;
    const a0 = Z(-W / 2, -Dd / 2, zr), b0 = Z(W / 2, -Dd / 2, zr), c0 = Z(W / 2, Dd / 2, zr), d0 = Z(-W / 2, Dd / 2, zr), f1 = Z(0, -Dd / 2, zr + hr), f2 = Z(0, Dd / 2, zr + hr);
    poly([a0, d0, f2, f1], shade(dach, 0.12));
    ctx.fillStyle = lgrad(f1[0], f1[1], c0[0], c0[1], [[0, shade(dach, -0.02)], [1, shade(dach, -0.2)]]); poly([b0, c0, f2, f1]); ctx.fill();
    for (let k = 1; k < 4; k++) { const a = k / 4; line(lerp(f1[0], b0[0], a), lerp(f1[1], b0[1], a), lerp(f2[0], c0[0], a), lerp(f2[1], c0[1], a), 1.2, rgba(shade(dach, -0.4), 0.45)); }
    poly([d0, c0, f2], shade(stein, 0.08));
    const m = [(d0[0] + c0[0]) / 2, (d0[1] + c0[1]) / 2], ins = (p, k) => [lerp(p[0], (d0[0] + c0[0] + f2[0]) / 3, k), lerp(p[1], (d0[1] + c0[1] + f2[1]) / 3, k)];
    poly([ins(d0, 0.2), ins(c0, 0.2), ins(f2, 0.2)], shade(stein, -0.06));
    line(f1[0], f1[1], f2[0], f2[1], TW * 0.016, shade(dach, 0.3));
    line(d0[0], d0[1], f2[0], f2[1], 1.4, rgba("#ffffff", 0.45)); line(d0[0], d0[1], c0[0], c0[1], TW * 0.01, rgba("#000000", 0.2));
    // goldene Waage im Giebel
    const gz = [lerp(m[0], f2[0], 0.42), lerp(m[1], f2[1], 0.42)], gs = TW * 0.05, gold = nacht ? "#c8a44a" : "#f0c45a", kipp = Math.sin(t * 1.2) * 0.08;
    line(gz[0], gz[1] - gs * 0.9, gz[0], gz[1] + gs * 0.5, TW * 0.008, gold);
    const l = [gz[0] - gs * Math.cos(kipp), gz[1] - gs * 0.7 - gs * Math.sin(kipp)], rr = [gz[0] + gs * Math.cos(kipp), gz[1] - gs * 0.7 + gs * Math.sin(kipp)];
    line(l[0], l[1], rr[0], rr[1], TW * 0.008, gold);
    for (const p of [l, rr]) { line(p[0], p[1], p[0], p[1] + gs * 0.45, 1, gold); ellipse(p[0], p[1] + gs * 0.5, gs * 0.32, gs * 0.12, gold); }
    if (nacht) glut(gz[0], gz[1], TW * 0.12, "#ffd27a", 0.25);
    // Fahne auf dem First
    const fp = f1, fh = TW * 0.32; line(fp[0], fp[1], fp[0], fp[1] - fh, TW * 0.01, "#4a4e5a");
    const wv = k => Math.sin(t * 4 + k * 3) * TW * 0.012;
    poly([[fp[0], fp[1] - fh], [fp[0] + TW * 0.09, fp[1] - fh + wv(0.5)], [fp[0] + TW * 0.18, fp[1] - fh + TW * 0.02 + wv(1)], [fp[0] + TW * 0.18, fp[1] - fh + TW * 0.1 + wv(1)], [fp[0] + TW * 0.09, fp[1] - fh + TW * 0.08 + wv(0.5)], [fp[0], fp[1] - fh + TW * 0.09]], nacht ? "#3a8a9a" : "#3ec8d0");
  };
  SCHATTEN.gericht = TW => ({ w: 0.78, d: 0.78, h: TW * 0.56 });

  // Vorbereitung 12.11. (Analyse Timi-Insel): Zelte für Einwohner ohne Dach, kleine Läden mit Markise
  BAU.zelt = (x, y, ei, ej, TW, P, t, r, idx) => { // zwei Zelte pro Feld, Farbe wechselt
    const F = ["#e0784e", "#4a9ad0", "#e8b84a", "#7a6ac8", "#4aa878", "#d8564a"], Z = Pt(x, y, ei, ej), nacht = P.sonne < 0.5;
    for (const [a, b, k] of [[-0.16, -0.12, 0], [0.18, 0.14, 1]]) {
      const f = nacht ? mix(F[(idx * 2 + k) % 6], "#2a3050", 0.55) : F[(idx * 2 + k) % 6], w = 0.17, d = 0.22, h = TW * 0.2;
      const v0 = Z(a - w, b + d), v1 = Z(a + w, b + d), h0 = Z(a - w, b - d), h1 = Z(a + w, b - d), s0 = Z(a, b + d, h), s1 = Z(a, b - d, h);
      ellipse(...Z(a, b), TW * 0.2, TW * 0.08, rgba(P.schatten, 0.25));
      poly([h1, v1, s0, s1], shade(f, -0.22)); poly([h0, v0, s0, s1], shade(f, 0.08));
      poly([v0, v1, s0], shade(f, -0.06)); const e = [lerp(v0[0], v1[0], 0.5), lerp(v0[1], v1[1], 0.5)];
      poly([[e[0] - TW * 0.025, e[1]], [e[0] + TW * 0.025, e[1]], [lerp(e[0], s0[0], 0.6), lerp(e[1], s0[1], 0.6)]], nacht ? "#ffd27a" : shade(f, -0.45));
      line(s0[0], s0[1], s1[0], s1[1], 1.4, rgba("#ffffff", 0.4));
    }
  };
  SCHATTEN.zelt = TW => ({ w: 0.5, d: 0.5, h: TW * 0.16 });
  BAU.laden = (x, y, ei, ej, TW, P, t, r, idx) => { // kleiner Laden mit gestreifter Markise und Schild
    const M = ["#d8564a", "#3a8ad0", "#3aa878", "#e8a83a", "#8a6ac8"], m = M[idx % 5], wand = P.wand[(idx + 1) % 4], nacht = P.sonne < 0.5;
    const h = TW * 0.24, w = 0.62, d = 0.5;
    quader(x, y, ei, ej, w + 0.04, d + 0.04, TW * 0.03, P.sockel, null, P);
    const q = quader(x, y - TW * 0.03, ei, ej, w, d, h, wand, shade(wand, -0.08), P), { D, C, B } = q.fl, Z = q.Z;
    const sf = (a, b, z) => [lerp(D[0], C[0], a), lerp(D[1], C[1], a) - z];
    poly([sf(0.08, 0, h * 0.08), sf(0.62, 0, h * 0.08), sf(0.62, 0, h * 0.62), sf(0.08, 0, h * 0.62)], nacht ? P.glasN : shade(P.glas, 0.05));
    if (nacht) glut(...sf(0.35, 0, h * 0.35), TW * 0.4, P.glasN, 0.3);
    poly([sf(0.7, 0, 0), sf(0.9, 0, 0), sf(0.9, 0, h * 0.62), sf(0.7, 0, h * 0.62)], shade(m, -0.35));
    fenster(B, C, h * 0.3, h * 0.38, 1, P, r, nacht, true);
    const ma = h * 0.66, mv = 0.14, n = 6; // Markise: schräg nach vorn
    for (let k = 0; k < n; k++) { const a0 = k / n, a1 = (k + 1) / n;
      const o0 = Z(-w / 2 + w * a0, d / 2, ma + TW * 0.06), o1 = Z(-w / 2 + w * a1, d / 2, ma + TW * 0.06), u1 = Z(-w / 2 + w * a1, d / 2 + mv, ma - TW * 0.02), u0 = Z(-w / 2 + w * a0, d / 2 + mv, ma - TW * 0.02);
      poly([o0, o1, u1, u0], k % 2 ? "#f6f0e6" : m); }
    const s0 = Z(-w / 2 + 0.08, d / 2, h * 1.02), s1 = Z(w / 2 - 0.08, d / 2, h * 1.02);
    poly([s0, s1, [s1[0], s1[1] - TW * 0.07], [s0[0], s0[1] - TW * 0.07]], "#2a2e3a");
    for (let k = 0; k < 5; k++) { const a = 0.18 + k * 0.15; const p = [lerp(s0[0], s1[0], a), lerp(s0[1], s1[1], a) - TW * 0.035]; box(p[0] - TW * 0.02, p[1] - TW * 0.008, TW * 0.04, TW * 0.016, 2, rgba(k % 2 ? "#ffd27a" : "#ffffff", 0.85)); }
  };
  SCHATTEN.laden = TW => ({ w: 0.66, d: 0.6, h: TW * 0.36 });

  const ecken = (x, y, TW, TH, s = 1) => [[x, y - TH / 2 * s], [x + TW / 2 * s, y], [x, y + TH / 2 * s], [x - TW / 2 * s, y]];
  const BODEN = {
    weg: (x, y, TW, TH, P, i, t, r) => { poly(ecken(x, y, TW, TH, 0.98), P.weg); for (let k = 0; k < 6; k++) circle(x + (r() - 0.5) * TW * 0.5, y + (r() - 0.5) * TH * 0.5, TW * 0.01 + r() * TW * 0.012, rgba(shade(P.weg, -0.25), 0.5)); },
    strasse: (x, y, TW, TH, P) => { poly(ecken(x, y, TW, TH), shade(P.weg, -0.1)); poly(ecken(x, y, TW, TH, 0.86), P.strasse); line(x - TW * 0.08, y - TH * 0.08, x + TW * 0.08, y + TH * 0.08, TW * 0.014, rgba("#f4f0d0", 0.8)); },
    feld: (x, y, TW, TH, P, i) => { const f = P.feld[i % 2], k = ecken(x, y, TW, TH, 0.94); poly(ecken(x, y, TW, TH, 0.98), shade(f, -0.25)); poly(k, f);
      for (let q = 1; q < 7; q++) { const a = q / 7; line(lerp(k[0][0], k[3][0], a), lerp(k[0][1], k[3][1], a), lerp(k[1][0], k[2][0], a), lerp(k[1][1], k[2][1], a), TW * 0.02, shade(f, -0.16)); } },
    wasser: (x, y, TW, TH, P, i, t) => { poly(ecken(x, y, TW, TH, 0.98), shade(P.sand, -0.1)); ctx.fillStyle = rgrad(x, y, 0, TW * 0.5, [[0, shade(P.wasser, -0.15)], [1, P.wasser]]); poly(ecken(x, y, TW, TH, 0.84)); ctx.fill();
      for (let q = 0; q < 2; q++) { const p = (t * 0.2 + q * 0.5 + i * 0.13) % 1; box(x - TW * 0.15 + p * TW * 0.1, y - TH * 0.1 + q * TH * 0.2, TW * 0.16, TW * 0.012, TW * 0.01, rgba("#ffffff", 0.45)); } },
    platz: (x, y, TW, TH, P) => { const k = ecken(x, y, TW, TH, 0.98), f = mix(P.weg, P.fels, 0.45); poly(k, f);
      for (let q = 1; q < 4; q++) { const a = q / 4; line(lerp(k[0][0], k[3][0], a), lerp(k[0][1], k[3][1], a), lerp(k[1][0], k[2][0], a), lerp(k[1][1], k[2][1], a), 1, rgba("#000000", 0.12)); line(lerp(k[0][0], k[1][0], a), lerp(k[0][1], k[1][1], a), lerp(k[3][0], k[2][0], a), lerp(k[3][1], k[2][1], a), 1, rgba("#000000", 0.12)); } },
    sand: (x, y, TW, TH, P) => poly(ecken(x, y, TW, TH, 1.0), P.sand),
  };

  const liste = v => {
    const aus = [];
    for (const teil of String(v || "").split("|").map(q => q.trim()).filter(Boolean)) {
      const [typ, ort] = teil.split("@"); if (!ort) continue;
      const [a, b] = ort.split("-"), [i1, j1] = a.split(",").map(Number), [i2, j2] = (b || a).split(",").map(Number);
      for (let i = Math.min(i1, i2); i <= Math.max(i1, i2); i++) for (let j = Math.min(j1, j2); j <= Math.max(j1, j2); j++) aus.push({ typ: typ.trim(), i, j });
    }
    return aus;
  };
  const typVon = name => { const m = /^([a-z]+)(\d*)$/.exec(name); return m ? [m[1], m[2] ? Number(m[2]) : undefined] : [name, undefined]; };

  SZ.reich = (s, t) => {
    const zeit = ["abend", "nacht"].includes(s.zeit) ? s.zeit : "tag", P = PAL[zeit];
    const G = Math.max(3, Math.min(60, Number(s.groesse) || 9));
    const TW = Math.min(150, 940 / G), TH = TW / 2;
    const cx = 540, cy = (Number(s.mitte_y) || 860) - (G - 1) * TH / 2;
    const feld = (i, j) => [cx + (i - j) * TW / 2, cy + (i + j) * TH / 2];
    const bauten = liste(s.bauten), aufFeld = {};
    for (const b of bauten) aufFeld[b.i + "," + b.j] = b;
    const c0 = (G - 1) / 2, rund = (s.form || "rund") !== "eckig";
    const land = (i, j) => {
      if (i < 0 || j < 0 || i >= G || j >= G) return false;
      if (aufFeld[i + "," + j] || !rund) return true;
      const u = Math.abs(i - c0) / (G / 2), v = Math.abs(j - c0) / (G / 2);
      const r = Math.pow(Math.pow(u, 3.2) + Math.pow(v, 3.2), 1 / 3.2) + (rausch(i * 0.7, j * 0.7, 5) - 0.5) * 0.22;
      return r < 1.0;
    };
    const tiefe = TW * 0.5;
    ctx.fillStyle = lgrad(0, -600, 0, 2600, [[0, shade(P.tief, -0.1)], [0.45, P.tief], [1, shade(P.tief, 0.12)]]); ctx.fillRect(-1500, -1500, 4080, 5000);
    const z = Number(s.nah) || 1, fk = paar(s.blick, [c0, c0]), fp = feld(fk[0], fk[1]);
    const kamera = () => { if (z !== 1 || s.blick) { ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-fp[0], -fp[1]); } };
    ebene("reichFlach", 34 * Math.min(1.6, z), () => { ctx.save(); kamera();
      for (let i = -1; i <= G; i++) for (let j = -1; j <= G; j++) if (land(i, j)) { const [x, y] = feld(i, j); ellipse(x, y + tiefe * 0.8, TW * 0.85, TH * 0.85, mix(P.flach, P.tief, 0.25)); }
      ctx.restore(); }, 0.6);
    { const r = rnd(5); ctx.save(); ctx.globalCompositeOperation = "screen";
      for (let k = 0; k < 70; k++) { const x = (r() * 1400 - 160 + t * 8 * (0.4 + r())) % 1300 - 110, y = r() * 1920, a = 0.5 + 0.5 * Math.sin(t * (1 + r() * 2) + k); box(x, y, 26 + r() * 60, 3, 1.5, rgba("#ffffff", (zeit === "nacht" ? 0.06 : 0.14) * a)); }
      if (P.sonne > 0) for (let k = 0; k < 40; k++) { const x = 80 + r() * 380, y = 80 + r() * 520, a = Math.max(0, Math.sin(t * 3 + k * 1.7)); circle(x, y, 2 + r() * 2, rgba("#fff8e0", 0.6 * a * P.sonne)); }
      ctx.restore(); }
    ctx.save(); kamera();
    const r0 = rnd(13);
    const grasFarbe = (i, j) => { const n = rausch(i * 0.45, j * 0.45, 1), l = (1 - (i + j) / (2 * G)) * 0.08; return shade(mix(P.gras[0], n > 0.5 ? P.gras[2] : P.gras[1], Math.abs(n - 0.5) * 1.6), l - 0.02); };
    const kanten = [];
    for (let summe = 0; summe <= 2 * (G - 1); summe++) for (let i = 0; i < G; i++) { const j = summe - i; if (j < 0 || j >= G || !land(i, j)) continue;
      const [x, y] = feld(i, j), T = [x, y - TH / 2], R = [x + TW / 2, y], B = [x, y + TH / 2], L = [x - TW / 2, y];
      const offenI = !land(i + 1, j), offenJ = !land(i, j + 1);
      const seite = (p, q, farbe) => {
        ctx.fillStyle = lgrad(0, Math.min(p[1], q[1]), 0, Math.max(p[1], q[1]) + tiefe, [[0, shade(farbe, 0.06)], [1, shade(farbe, -0.22)]]); poly([p, q, [q[0], q[1] + tiefe], [p[0], p[1] + tiefe]]); ctx.fill();
        for (let k = 1; k < 3; k++) line(p[0], p[1] + tiefe * k / 3, q[0], q[1] + tiefe * k / 3, 2, rgba(shade(farbe, -0.3), 0.45));
        for (let k = 0; k < 3; k++) { const a = hash(i, j, k + 9); circle(lerp(p[0], q[0], a), lerp(p[1], q[1], a) + tiefe * (0.35 + hash(j, i, k) * 0.5), TW * 0.025, rgba(shade(farbe, -0.35), 0.5)); }
        poly([p, q, [q[0], q[1] + TW * 0.05], [p[0], p[1] + TW * 0.05]], shade(P.gras[1], -0.15));
        kanten.push([[p[0], p[1] + tiefe], [q[0], q[1] + tiefe]]); };
      if (offenI) seite(R, B, P.erdeS);
      if (offenJ) seite(B, L, P.erde);
      poly([T, R, B, L], grasFarbe(i, j));
      const saum = (p, q) => { const k = 0.78; poly([p, q, [lerp(x, q[0], k), lerp(y, q[1], k)], [lerp(x, p[0], k), lerp(y, p[1], k)]], rgba(P.sand, 0.9)); };
      const b = aufFeld[i + "," + j];
      if (!b || !BODEN[b.typ]) { if (offenI) saum(R, B); if (offenJ) saum(B, L); if (!land(i - 1, j)) saum(T, L); if (!land(i, j - 1)) saum(T, R); }
      if (b && BODEN[b.typ]) BODEN[b.typ](x, y, TW, TH, P, i * 3 + j, t, r0);
      else if (!b) {
        for (let q = 0; q < 4; q++) { if (r0() > 0.55) continue; const gx = x + (r0() - 0.5) * TW * 0.55, gy = y + (r0() - 0.5) * TH * 0.5, gf = shade(grasFarbe(i, j), -0.14);
          line(gx, gy, gx - 2.5, gy - TW * 0.05, 1.8, gf); line(gx, gy, gx + 0.5, gy - TW * 0.065, 1.8, gf); line(gx, gy, gx + 3, gy - TW * 0.045, 1.8, gf);
          if (r0() < 0.18) circle(gx + 3, gy - TW * 0.06, TW * 0.012, ["#fff4c0", "#ffb0c8", "#ffffff"][q % 3]); } }
    }
    for (const [p, q] of kanten) { const w = Math.sin(t * 1.6 + p[0] * 0.05) * 0.5 + 0.5; line(p[0], p[1] + 2, q[0], q[1] + 2, TW * 0.04, rgba("#ffffff", 0.35 + 0.3 * w)); line(p[0], p[1] + 6 + w * 4, q[0], q[1] + 6 + w * 4, TW * 0.02, rgba("#ffffff", 0.2 * (1 - w))); }
    if (s.markiere) { const [mi, mj] = paar(s.markiere), [x, y] = feld(mi, mj), p = 0.5 + 0.5 * Math.sin(t * 4);
      glut(x, y, TW * 0.9, "#ffe27a", 0.3 * p); ctx.beginPath(); ctx.ellipse(x, y, TW * (0.4 + p * 0.06), TH * (0.4 + p * 0.06), 0, 0, Math.PI * 2); ctx.lineWidth = TW * 0.035; ctx.strokeStyle = rgba("#ffe27a", 0.65 + 0.35 * p); ctx.stroke(); }
    const sv = [0.55, 0.28];
    if (P.sonne > 0) { ctx.save(); ctx.globalAlpha = 0.22 * (0.6 + 0.4 * P.sonne);
      for (const b of bauten) { if (aufFeld[b.i + "," + b.j] !== b || BODEN[b.typ]) continue; const [typ, n] = typVon(b.typ); if (!SCHATTEN[typ]) continue;
        const { w, d, h, rund: rn } = SCHATTEN[typ](TW, n), [x, y] = feld(b.i, b.j), Z = Pt(x, y, [TW / 2, TH / 2], [-TW / 2, TH / 2]);
        if (rn) { ellipse(x + sv[0] * h * 0.6, y + sv[1] * h * 0.6, TW * w * 0.8 + h * 0.2, TH * d * 0.9 + h * 0.08, P.schatten); continue; }
        const basis = [Z(-w / 2, -d / 2), Z(w / 2, -d / 2), Z(w / 2, d / 2), Z(-w / 2, d / 2)];
        poly(huelle(basis.concat(basis.map(([u, v]) => [u + sv[0] * h, v + sv[1] * h]))), P.schatten); }
      ctx.restore(); }
    const frei = []; for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) { if (!land(i, j)) continue; const b = aufFeld[i + "," + j]; if (!b || BODEN[b.typ] && b.typ !== "wasser") frei.push([i, j]); }
    const nL = Math.max(0, Math.round(Number(s.leute) || 0)), zeigen = Math.min(nL, 900, frei.length * 3), nNeu = Math.max(0, Math.min(zeigen, Math.round(Number(s.neu) || 0)));
    const leute = [], rl = rnd(17);
    const freiS = frei.slice().sort((a, b) => Math.hypot(a[0] - c0, a[1] - c0) - Math.hypot(b[0] - c0, b[1] - c0));
    for (let k = 0; k < zeigen; k++) { const f = freiS[Math.floor(Math.pow(rl(), 1.5) * freiS.length)] || [c0, c0];
      leute.push({ i: f[0] + (rl() - 0.5) * 0.75, j: f[1] + (rl() - 0.5) * 0.75, farbe: P.leute[k % P.leute.length], neu: k >= zeigen - nNeu, ph: rl() * 6, haar: ["#3a2a20", "#1e1a18", "#7a5234", "#c8a060", "#5a5a5a"][k % 5] }); }
    const dinge = [];
    for (const b of bauten) if (aufFeld[b.i + "," + b.j] === b && !BODEN[b.typ]) dinge.push({ d: b.i + b.j, art: "bau", b });
    for (const p of leute) dinge.push({ d: p.i + p.j + 0.3, art: "mensch", p });
    if (s.praesident) { const [pi, pj] = paar(s.praesident); dinge.push({ d: pi + pj + 0.35, art: "praesident", i: pi, j: pj }); }
    dinge.sort((a, b) => a.d - b.d);
    const mensch = (x, y, g, farbe, haar, hop = 0, schaerpe = false) => {
      if (P.sonne > 0) ellipse(x + g * 0.18, y + g * 0.05, g * 0.3, g * 0.1, rgba(P.schatten, 0.3)); else ellipse(x, y, g * 0.22, g * 0.08, rgba(P.schatten, 0.4));
      y -= hop;
      box(x - g * 0.11, y - g * 0.42, g * 0.09, g * 0.42, g * 0.04, "#3a3e4c"); box(x + g * 0.02, y - g * 0.42, g * 0.09, g * 0.42, g * 0.04, "#2e323e");
      ctx.fillStyle = lgrad(x - g * 0.2, 0, x + g * 0.2, 0, [[0, shade(farbe, 0.12)], [1, shade(farbe, -0.2)]]); A.rr(x - g * 0.17, y - g * 0.86, g * 0.34, g * 0.48, g * 0.12); ctx.fill();
      box(x - g * 0.24, y - g * 0.82, g * 0.08, g * 0.36, g * 0.04, shade(farbe, 0.05)); box(x + g * 0.16, y - g * 0.82, g * 0.08, g * 0.36, g * 0.04, shade(farbe, -0.25));
      if (schaerpe) line(x - g * 0.15, y - g * 0.84, x + g * 0.15, y - g * 0.44, g * 0.07, "#f2c14e");
      ctx.fillStyle = rgrad(x - g * 0.05, y - g * 1.06, g * 0.02, g * 0.17, [[0, "#f4d2b0"], [1, "#d8a888"]]); ctx.beginPath(); ctx.arc(x, y - g * 1.02, g * 0.15, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, y - g * 1.05, g * 0.155, Math.PI * 1.02, Math.PI * 1.98); ctx.fillStyle = haar; ctx.fill();
    };
    let bi = 0;
    for (const o of dinge) {
      if (o.art === "bau") { const { b } = o, [x, y] = feld(b.i, b.j), r = rnd(31 + b.i * 17 + b.j * 5), [typ, n] = typVon(b.typ);
        if (BAU[typ]) BAU[typ](x, y, [TW / 2, TH / 2], [-TW / 2, TH / 2], TW, P, t, r, bi++, n); }
      else if (o.art === "mensch") { const { p } = o, [x, y] = feld(p.i, p.j), g = TW * 0.3, hop = Math.max(0, Math.sin(t * 2 + p.ph)) * TW * 0.015;
        if (p.neu) glut(x, y - g * 0.6, g * 1.3, "#fff2a8", 0.4 + 0.2 * Math.sin(t * 3 + p.ph));
        mensch(x, y, g, p.farbe, p.haar, hop); }
      else { const [x, y] = feld(o.i, o.j), g = TW * 0.4; glut(x, y - g * 0.6, g * 1.5, "#ffe27a", 0.28); mensch(x, y, g, "#3f7f8c", "#4a3324", 0, true); }
    }
    ctx.restore();
    if (P.sonne > 0) { ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.fillStyle = rgrad(120, 80, 0, 1300, [[0, rgba(P.licht, 0.35 * P.sonne)], [1, rgba(P.licht, 0)]]); ctx.fillRect(0, 0, 1080, 1920); ctx.restore(); }
    else { ctx.fillStyle = rgrad(540, 860, 300, 1300, [[0, rgba("#000000", 0)], [1, rgba("#000010", 0.35)]]); ctx.fillRect(0, 0, 1080, 1920); }
    { const r = rnd(41); for (let k = 0; k < 3; k++) { const wx = ((r() * 1300 + t * 10) % 1500) - 250, wy = [1700, 1790, 1850][k] + r() * 40, a = zeit === "nacht" ? 0.08 : 0.5;
      for (const [dx, dy, rr] of [[0, 0, 60], [70, -26, 82], [150, 0, 60], [212, 12, 40]]) { ctx.fillStyle = rgrad(wx + dx - rr * 0.3, wy + dy - rr * 0.4, rr * 0.2, rr * 1.1, [[0, rgba("#ffffff", a)], [1, rgba("#e8f0f8", a * 0.6)]]); ctx.beginPath(); ctx.arc(wx + dx, wy + dy, rr, 0, Math.PI * 2); ctx.fill(); } } }
    if (an(s.tiltshift, false)) { // Standard aus: Jonathan will die Insel ganz scharf (9.11.)
      const cv = ctx.canvas, c = tafel("reichTilt"), k = cv.width / 1080;
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); c.filter = `blur(${(4.5 * k).toFixed(1)}px)`; c.drawImage(cv, 0, 0); c.filter = "none";
      c.globalCompositeOperation = "destination-in";
      const oben = cv.height * 0.2, unten = cv.height * 0.9; // fest am Bildrand, unabhängig von Kamerafahrten
      const g = c.createLinearGradient(0, 0, 0, cv.height), st = v => Math.max(0.001, Math.min(0.999, v / cv.height));
      g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(st(oben), "rgba(0,0,0,0)"); g.addColorStop(Math.max(st(oben), st(unten)), "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,1)");
      c.fillStyle = g; c.fillRect(0, 0, cv.width, cv.height); c.globalCompositeOperation = "source-over";
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(c.canvas, 0, 0); ctx.restore();
    }
    A._dunkel = 0;
  };
})();
