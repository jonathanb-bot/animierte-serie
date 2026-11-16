/* „Bis zum Mond“ (Jonathans Idee 14.11., nach dem Vergleichsvideo „Inselwelt“): Städte bauen Türme um die Wette.
   Eigene Kulisse, eigener Look (leuchtend, schwebender Turmplatz bei Sonnenaufgang). Nur neue Namen: alle bisherigen
   Serien bleiben pixelgleich.

   [turm modus=feld zeit=tag|abend|nacht tuerme="Berlin:0|Wien:12>40|…" leer=? nah=1.8 blick=4,5 markiere=4,5]
     - tuerme: Stadt:Stockwerke (a>b wächst in der Szene von a nach b), werden auf feste Plätze verteilt (Reihenfolge = Platz)
     - leer: Text auf den Schildern freier Plätze (Standard „?“), leer_zeigen=N: so viele freie Plätze (die nächsten) bekommen ein Schild
   [turm modus=hoehe hoehe=0>1000 stadt="Deine Stadt"]   Kamerafahrt am Turm hoch (Meter, 1 Stockwerk = 3 m)
   [turm modus=ziele bis=5]                                Zielkarte (Wolken … Mond), bis = wie viele Ziele schon sichtbar
   [turm modus=duell duell="Hildesheim#0:6|Stuttgart#2:3>4" zeit=abend titel_text="DAS DUELL"]  (neu 16.11.) zwei Türme groß nebeneinander mit Abstand-Klammer
   [turm modus=rangliste rangliste="München#0:12>41|Wien#1:30" ziel=333 ziel_name=Wolken]  (#n = Platz/Farbe wie im Feld)  Rangliste mit Balken bis zum nächsten Ziel
*/
(() => {
  const { box, circle, ellipse, poly, line, shade, rgba, lgrad, rgrad, mix, lerp, clamp, E } = A;
  const SZ = A.SZ;
  const rnd = seed => A.rnd(seed);
  const glut = (x, y, r, farbe, a = 1) => { ctx.fillStyle = rgrad(x, y, 0, r, [[0, rgba(farbe, 0.9 * a)], [0.3, rgba(farbe, 0.35 * a)], [1, rgba(farbe, 0)]]); ctx.fillRect(x - r, y - r, r * 2, r * 2); };
  const fmt = n => Math.round(n).toLocaleString("de-DE");
  const zahl = v => Number(String(v).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")) || 0;
  const bereich = (v, t, dauer = 1.6, ab = 0.4) => { const [a, b] = String(v ?? 0).split(">"); if (b === undefined) return zahl(a);
    return lerp(zahl(a), zahl(b), E.raus(clamp((t - ab) / dauer, 0, 1))); };
  const FARBEN = ["#e8705a", "#4a9ad0", "#f2c14e", "#7a6ac8", "#4aa878", "#e07aa0", "#3fb8c0", "#d8564a", "#a8c84a", "#c87a3a", "#5a6ad8", "#b85ac8"];
  const farbeVon = name => { let h = 7; for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) % 9973; return FARBEN[h % FARBEN.length]; }; // gleiche Stadt = gleiche Farbe (Turm, Rangliste)

  const HIMMEL = {
    tag: { oben: "#5aa8e0", unten: "#bfe6f4", sonne: "#fff6d8", platz: "#e8dcc4", fuge: "#cbbd9f", rand: "#b89a72", randS: "#8a6e52", gras: "#7fbf62", licht: 1 },
    abend: { oben: "#3a3a8a", unten: "#f6a878", sonne: "#ffd6a0", platz: "#e8c8a8", fuge: "#c8a080", rand: "#a87a5a", randS: "#7a5242", gras: "#a0a05a", licht: 0.7 },
    nacht: { oben: "#0a1236", unten: "#24366a", sonne: "#e8eeff", platz: "#5a607a", fuge: "#484c64", rand: "#3e3a52", randS: "#2a2638", gras: "#2c5248", licht: 0 },
  };

  // ---------- Turmplatz (isometrisch) ----------
  const turmBauen = (x, y, TW, TH, stock, farbe, P, t, idx, name, sh = 1) => {
    const fh = TW * 0.085 * sh, h = Math.max(0, stock) * fh, w = 0.36, nacht = P.licht < 0.5;
    const L = [x - TW * w, y], R = [x + TW * w, y], V = [x, y + TH * w], H = [x, y - TH * w], up = p => [p[0], p[1] - h];
    // Fundament
    poly([[x - TW * 0.44, y], [x, y - TH * 0.44], [x + TW * 0.44, y], [x, y + TH * 0.44]], shade(P.platz, -0.18));
    poly([[x - TW * 0.44, y], [x, y + TH * 0.44], [x, y + TH * 0.44 + 6], [x - TW * 0.44, y + 6]], shade(P.platz, -0.3));
    poly([[x + TW * 0.44, y], [x, y + TH * 0.44], [x, y + TH * 0.44 + 6], [x + TW * 0.44, y + 6]], shade(P.platz, -0.38));
    if (h < 1) return y - 6;
    ellipse(x + TW * 0.3, y + 4, TW * 0.4, TH * 0.3, rgba("#1a2030", 0.18));
    ctx.fillStyle = lgrad(0, y - h, 0, y + TH * w, [[0, shade(farbe, 0.1)], [1, shade(farbe, -0.08)]]); poly([L, V, up(V), up(L)]); ctx.fill();
    ctx.fillStyle = lgrad(0, y - h, 0, y + TH * w, [[0, shade(farbe, -0.18)], [1, shade(farbe, -0.32)]]); poly([V, R, up(R), up(V)]); ctx.fill();
    poly([up(L), up(H), up(R), up(V)], shade(farbe, 0.22));
    const r = rnd(97 + idx * 13);
    for (let k = 0; k < stock; k++) { // Fensterreihen
      const zz = (k + 0.3) * fh, hh = fh * 0.45;
      for (const [p0, p1, seite] of [[L, V, 0], [V, R, 1]]) for (let q = 0; q < 2; q++) {
        const a0 = (q + 0.25) / 2, a1 = (q + 0.75) / 2, an = nacht ? r() < 0.7 : false;
        const f = an ? "#ffd27a" : seite ? rgba("#ffffff", 0.18) : rgba("#ffffff", 0.32);
        poly([[lerp(p0[0], p1[0], a0), lerp(p0[1], p1[1], a0) - zz], [lerp(p0[0], p1[0], a1), lerp(p0[1], p1[1], a1) - zz],
              [lerp(p0[0], p1[0], a1), lerp(p0[1], p1[1], a1) - zz - hh], [lerp(p0[0], p1[0], a0), lerp(p0[1], p1[1], a0) - zz - hh]], f); }
    }
    line(up(L)[0], up(L)[1], up(V)[0], up(V)[1], 1.5, rgba("#ffffff", 0.45));
    // Fahne in Stadtfarbe
    const top = [x, y - h - 2]; line(top[0], top[1], top[0], top[1] - TW * 0.42, 2.2, "#3a3e4a");
    const wv = k => Math.sin(t * 4 + idx + k * 2.5) * TW * 0.02;
    poly([[top[0], top[1] - TW * 0.42], [top[0] + TW * 0.22, top[1] - TW * 0.38 + wv(1)], [top[0] + TW * 0.22, top[1] - TW * 0.26 + wv(1)], [top[0], top[1] - TW * 0.28]], farbe);
    return y - h - TW * 0.45;
  };
  const schild = (x, y, txt, fs, dunkel = true, akzent = null) => {
    ctx.save(); ctx.font = `700 ${fs}px HUD`; const tw = ctx.measureText(txt).width, bw = tw + fs * 0.9, bh = fs * 1.5;
    ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = fs * 0.5; ctx.shadowOffsetY = fs * 0.12;
    box(x - bw / 2, y - bh, bw, bh, bh / 2, dunkel ? "rgba(12,14,34,0.82)" : "rgba(255,255,255,0.92)"); ctx.shadowColor = "transparent";
    if (akzent) box(x - bw / 2, y - bh, fs * 0.42, bh, bh / 2, akzent);
    ctx.fillStyle = dunkel ? "#ffffff" : "#2a2e3a"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, x + (akzent ? fs * 0.12 : 0), y - bh / 2 + fs * 0.05); ctx.restore(); };

  const himmelFlach = (P, t) => {
    ctx.fillStyle = lgrad(0, 0, 0, 1920, [[0, P.oben], [0.62, P.unten], [1, shade(P.unten, -0.1)]]); ctx.fillRect(0, 0, 1080, 1920);
    if (P.licht > 0) { glut(220, 420, 700, P.sonne, 0.55 * P.licht); circle(220, 420, 70, rgba(P.sonne, 0.9)); }
    else { const r = rnd(5); for (let k = 0; k < 120; k++) { const a = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + k)); circle(r() * 1080, r() * 1100, 1 + r() * 2, rgba("#ffffff", 0.7 * a)); } }
    const r = rnd(9); for (let k = 0; k < 6; k++) { const wx = ((r() * 1400 + t * (8 + k * 3)) % 1500) - 200, wy = 300 + r() * 900, s = 0.6 + r() * 0.8;
      for (const [dx, dy, rr] of [[0, 0, 50], [60, -20, 66], [125, 0, 50], [175, 10, 34]]) { ctx.fillStyle = rgba("#ffffff", P.licht > 0 ? 0.55 : 0.07); ctx.beginPath(); ctx.arc(wx + dx * s, wy + dy * s, rr * s, 0, Math.PI * 2); ctx.fill(); } }
  };

  const feldModus = (s, t) => {
    const zeit = HIMMEL[s.zeit] ? s.zeit : "tag", P = HIMMEL[zeit];
    himmelFlach(P, t);
    const G = Math.max(4, Math.min(14, Number(s.groesse) || 8)), TW = 960 / G, TH = TW / 2;
    const cx = 540, cy = (Number(s.mitte_y) || 1020) - (G - 1) * TH / 2;
    const feld = (i, j) => [cx + (i - j) * TW / 2, cy + (i + j) * TH / 2];
    const z = Number(s.nah) || 1, bl = s.blick ? String(s.blick).split(",").map(Number) : null;
    ctx.save();
    if (z !== 1 || bl) { const fp = bl ? feld(bl[0], bl[1]) : [cx, cy + (G - 1) * TH / 2]; ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-fp[0], -fp[1]); }
    // schwebende Insel-Platte: Grasrand mit Bäumen, gepflasterter Platz, Felsunterbau mit Wasserfall (Detail-Durchgang 14.11.)
    const R0 = -1.35, R1 = G + 0.35, o = feld(R0, R0), r_ = feld(R1, R0), u = feld(R1, R1), l = feld(R0, R1), erde = TW * 0.22, nacht = P.licht < 0.5;
    const rf = rnd(61), stufe = (a, k) => 0.55 + 0.45 * Math.sin(a * Math.PI) + (rf() - 0.5) * 0.18 * k;
    // Fels: zackige Unterseite, links hell, rechts dunkel
    const fl = [], fr = []; for (let k = 0; k <= 12; k++) { const a = k / 12; fl.push([lerp(l[0], u[0], a), lerp(l[1], u[1], a) + erde + TW * 2.6 * stufe(a, 1)]); }
    for (let k = 0; k <= 12; k++) { const a = k / 12; fr.push([lerp(u[0], r_[0], a), lerp(u[1], r_[1], a) + erde + TW * 2.6 * stufe(1 - a, 1)]); }
    const felsL = shade(P.rand, -0.05), felsR = shade(P.randS, -0.05);
    ctx.fillStyle = lgrad(0, l[1], 0, u[1] + TW * 3, [[0, felsL], [1, shade(felsL, -0.25)]]); poly([[l[0], l[1] + erde], [u[0], u[1] + erde]].concat(fl.slice().reverse())); ctx.fill();
    ctx.fillStyle = lgrad(0, r_[1], 0, u[1] + TW * 3, [[0, felsR], [1, shade(felsR, -0.25)]]); poly([[u[0], u[1] + erde], [r_[0], r_[1] + erde]].concat(fr.slice().reverse())); ctx.fill();
    for (let k = 1; k < 4; k++) { const q = k * 0.22; ctx.beginPath(); fl.forEach((pt, n) => { const a = n / 12, top = [lerp(l[0], u[0], a), lerp(l[1], u[1], a) + erde]; const y = lerp(top[1], pt[1], q); n ? ctx.lineTo(pt[0], y) : ctx.moveTo(pt[0], y); });
      ctx.lineWidth = 2; ctx.strokeStyle = rgba("#000000", 0.07); ctx.stroke();
      ctx.beginPath(); fr.forEach((pt, n) => { const a = n / 12, top = [lerp(u[0], r_[0], a), lerp(u[1], r_[1], a) + erde]; const y = lerp(top[1], pt[1], q); n ? ctx.lineTo(pt[0], y) : ctx.moveTo(pt[0], y); }); ctx.stroke(); }
    // Erdschicht unter dem Gras
    poly([l, u, [u[0], u[1] + erde], [l[0], l[1] + erde]], shade(P.rand, 0.08)); poly([u, r_, [r_[0], r_[1] + erde], [u[0], u[1] + erde]], shade(P.randS, 0.04));
    // Wasserfall an der rechten Kante
    { const a = 0.38, w0 = TW * 0.32, x0 = lerp(u[0], r_[0], a), y0 = lerp(u[1], r_[1], a), wf = nacht ? "#5a7ac8" : "#8fd8f0";
      ctx.fillStyle = lgrad(0, y0, 0, y0 + 1300, [[0, rgba(wf, 0.95)], [0.6, rgba(wf, 0.6)], [1, rgba(wf, 0)]]); ctx.fillRect(x0 - w0 / 2, y0 - 2, w0, 1300);
      for (let k = 0; k < 9; k++) { const ph = (t * 1.6 + k / 9) % 1, yy = y0 + ph * 1100; box(x0 - w0 / 2 + (k % 3) * w0 / 3 + 4, yy, w0 / 3 - 8, 40 + k * 4, 6, rgba("#ffffff", 0.35 * (1 - ph))); }
      poly([[x0 - w0 / 2 - 6, y0 - 4], [x0 + w0 / 2 + 6, y0 - 4 - TW * 0.1], [x0 + w0 / 2 + 6, y0 + 4 - TW * 0.1], [x0 - w0 / 2 - 6, y0 + 4]], rgba("#ffffff", 0.7)); }
    // Moos-Tropfen an der Oberkante
    for (const [p0, p1] of [[l, u], [u, r_]]) for (let k = 0; k < 14; k++) { const a = (k + rf()) / 14, x = lerp(p0[0], p1[0], a), y = lerp(p0[1], p1[1], a) + erde - 2, h = TW * (0.06 + rf() * 0.16); box(x - TW * 0.03, y, TW * 0.06, h, TW * 0.03, shade(P.gras, -0.12)); }
    // Grasfläche mit Kante, Platz mit Randstein und leicht unterschiedlichen Platten
    poly([o, r_, u, l], P.gras); line(l[0], l[1], u[0], u[1], 3, rgba("#ffffff", 0.35)); line(u[0], u[1], r_[0], r_[1], 2, rgba("#ffffff", 0.2));
    { const rg = rnd(71); for (let k = 0; k < 90; k++) { const i2 = R0 + rg() * (R1 - R0), j2 = R0 + rg() * (R1 - R0); if (i2 > -0.6 && i2 < G - 0.4 && j2 > -0.6 && j2 < G - 0.4) continue; const [gx, gy] = feld(i2, j2); line(gx, gy, gx - 2, gy - TW * 0.07, 2, shade(P.gras, -0.15)); line(gx + 3, gy, gx + 5, gy - TW * 0.06, 2, shade(P.gras, 0.1)); } }
    const ro = feld(-0.62, -0.62), rr2 = feld(G - 0.38, -0.62), ru = feld(G - 0.38, G - 0.38), rl = feld(-0.62, G - 0.38);
    poly([ro, rr2, ru, rl], shade(P.platz, -0.12)); poly([rl, ru, [ru[0], ru[1] + 5], [rl[0], rl[1] + 5]], shade(P.platz, -0.3)); poly([ru, rr2, [rr2[0], rr2[1] + 5], [ru[0], ru[1] + 5]], shade(P.platz, -0.38));
    for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) { const [x, y] = feld(i, j), v = (Math.sin(i * 12.9898 + j * 78.233) * 43758.5453 % 1 + 1) % 1, k2 = 0.47;
      poly([[x - TW * k2, y], [x, y - TH * k2], [x + TW * k2, y], [x, y + TH * k2]], shade(P.platz, (v - 0.5) * 0.06));
      line(x - TW * k2, y, x, y - TH * k2, 1.2, rgba("#ffffff", 0.25)); }
    // Laternen an den Ecken des Platzes
    const laternen = [[-0.75, -0.75], [G - 0.25, -0.75], [-0.75, G - 0.25], [G - 0.25, G - 0.25]].map(([a, b]) => feld(a, b));
    const laterne = ([x, y]) => { line(x, y, x, y - TW * 0.55, 3, "#3a3e4a"); box(x - 6, y - TW * 0.62, 12, 14, 3, "#3a3e4a"); circle(x, y - TW * 0.56, 5, nacht || P.licht < 0.8 ? "#ffd27a" : "#f4f0e0"); if (P.licht < 0.8) glut(x, y - TW * 0.56, TW * 0.7, "#ffd27a", 0.4); };
    // Bäume auf dem Grasrand (hinten vor den Türmen, vorne danach)
    const baeume = []; { const rb = rnd(83); for (let k = 0; k < 26; k++) { const seite = k % 4, a = (Math.floor(k / 4) + 0.3 + rb() * 0.4) / 6.5, d = -1.0 - rb() * 0.2;
      const [i2, j2] = seite === 0 ? [lerp(-0.5, G - 0.5, a), d] : seite === 1 ? [d, lerp(-0.5, G - 0.5, a)] : seite === 2 ? [lerp(-0.5, G - 0.5, a), G - 1 - d] : [G - 1 - d, lerp(-0.5, G - 0.5, a)];
      baeume.push({ i: i2, j: j2, g: 0.8 + rb() * 0.5, f: rb() }); } }
    const baum = b => { const [x, y] = feld(b.i, b.j), g = TW * 0.22 * b.g, f = nacht ? ["#22443c", "#2a4c42"] : ["#4a9a4e", "#5aa854", "#3f8a48"];
      ellipse(x + g * 0.5, y + 2, g * 0.9, g * 0.32, rgba("#1a2030", 0.18)); box(x - g * 0.08, y - g * 0.9, g * 0.16, g * 0.9, 2, "#6e4a34");
      const c = f[Math.floor(b.f * f.length)]; circle(x - g * 0.3, y - g * 1.05, g * 0.5, shade(c, -0.08)); circle(x + g * 0.3, y - g * 1.1, g * 0.48, shade(c, -0.15)); circle(x, y - g * 1.4, g * 0.55, c); circle(x - g * 0.15, y - g * 1.55, g * 0.22, rgba("#ffffff", 0.18)); };
    for (const b of baeume.filter(b => b.i < 0 || b.j < 0)) baum(b); laterne(laternen[0]); laterne(laternen[1]); laterne(laternen[2]);
    // Plätze: spiralförmig von der Mitte nach außen, Reihenfolge der Städte = Platz
    const plaetze = []; for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) plaetze.push([i, j]);
    const c0 = (G - 1) / 2; plaetze.sort((a, b) => Math.hypot(a[0] - c0, a[1] - c0) - Math.hypot(b[0] - c0, b[1] - c0) || a[0] - b[0]);
    const tuerme = String(s.tuerme || "").split("|").map(q => q.trim()).filter(Boolean).map((q, k) => { const [n, v] = q.split(":"); return { name: n.trim(), stock: bereich(v, t, Number(s.wachsen_dauer) || 1.8), k }; });
    if (s.markiere) { const [mi, mj] = String(s.markiere).split(",").map(Number), [x, y] = feld(mi, mj), p = 0.5 + 0.5 * Math.sin(t * 4);
      glut(x, y, TW * 0.9, "#ffe27a", 0.35 * p); ctx.beginPath(); ctx.ellipse(x, y, TW * 0.46, TH * 0.46, 0, 0, Math.PI * 2); ctx.lineWidth = TW * 0.04; ctx.strokeStyle = rgba("#ffe27a", 0.7 + 0.3 * p); ctx.stroke();
      if (s.grundstein !== "0") s._grundstein = [x, y]; }
    const leute = []; { const rp = rnd(91); const n = Number(s.leute ?? 18); for (let k = 0; k < n; k++) { const quer = rp() < 0.5, bahn = Math.floor(rp() * G) + 0.5 - 1, v = (0.12 + rp() * 0.12) * (rp() < 0.5 ? 1 : -1), st = rp() * G;
      const pos = ((st + v * t) % G + G) % G - 0.5; leute.push({ i: quer ? pos : bahn, j: quer ? bahn : pos, f: FARBEN[k % FARBEN.length], ph: rp() * 6 }); } }
    const zuZeichnen = plaetze.map((pl, k) => ({ pl, k, turm: tuerme[k] })).concat(leute.map(m => ({ mensch: m, pl: [m.i + 0.45, m.j + 0.45] }))).sort((a, b) => (a.pl[0] + a.pl[1]) - (b.pl[0] + b.pl[1]));
    const schilder = [];
    // neu 15.11.: schilder="Hildesheim,Freiburg" nur diese Türme beschriftet; schild_px=34 Schilder in fester Bildschirmgröße (unabhängig von nah); stock_hoehe=2 höhere Stockwerke
    const nurSchild = s.schilder ? new Set(String(s.schilder).split(",").map(q => q.trim()).filter(Boolean)) : null, festPx = Number(s.schild_px) || 0;
    for (const e of zuZeichnen) { if (e.mensch) { const m = e.mensch, [x, y] = feld(m.i, m.j), g = TW * 0.2, hop = Math.abs(Math.sin(t * 6 + m.ph)) * g * 0.06;
        ellipse(x, y, g * 0.22, g * 0.08, rgba("#1a2030", 0.25)); box(x - g * 0.1, y - g * 0.4 - hop, g * 0.2, g * 0.4, g * 0.06, "#3a3e4c");
        box(x - g * 0.15, y - g * 0.82 - hop, g * 0.3, g * 0.46, g * 0.12, m.f); circle(x, y - g * 0.96 - hop, g * 0.14, "#f2c8a4"); continue; }
      const [x, y] = feld(e.pl[0], e.pl[1]);
      if (e.turm) { const st = Math.round(e.turm.stock), topY = turmBauen(x, y, TW, TH, st, FARBEN[e.k % FARBEN.length], P, t, e.k, e.turm.name, Number(s.stock_hoehe) || 1); if (!nurSchild || nurSchild.has(e.turm.name)) schilder.push([x, topY, `${e.turm.name} · ${fmt(st)}`, FARBEN[e.k % FARBEN.length]]); }
      else { turmBauen(x, y, TW, TH, 0, "#888", P, t, e.k); if (e.k < tuerme.length + (Number(s.leer_zeigen) || 0)) { line(x, y - 4, x, y - TW * 0.3, 2, "#6a5a4a"); schild(x, y - TW * 0.3, String(s.leer ?? "?"), festPx ? festPx * 1.15 / z : TW * 0.25, false); } } }
    if (s._grundstein && !tuerme.length) { const [x, y] = s._grundstein, w = TW * 0.16, h = TW * 0.13, yy = y - 6 + Math.sin(t * 2) * 1.5;
      glut(x, yy - h, TW * 0.5, "#ffe27a", 0.35);
      poly([[x - w, yy], [x, yy + w / 2], [x, yy + w / 2 - h], [x - w, yy - h]], "#d8ccb4"); poly([[x + w, yy], [x, yy + w / 2], [x, yy + w / 2 - h], [x + w, yy - h]], "#b8aa90");
      poly([[x - w, yy - h], [x, yy - w / 2 - h], [x + w, yy - h], [x, yy + w / 2 - h]], "#efe6d2"); line(x - w * 0.5, yy - h + 2, x + w * 0.5, yy - h + 2, 1.5, rgba("#8a7a5a", 0.6)); }
    for (const b of baeume.filter(b => !(b.i < 0 || b.j < 0))) baum(b); laterne(laternen[3]);
    { const fs = festPx ? festPx / z : TW * 0.27, gesetzt = []; ctx.font = `700 ${fs}px HUD`;
      for (const sc of schilder.slice().sort((a, b) => a[1] - b[1])) { const w = ctx.measureText(sc[2]).width + fs * 1.4, h = fs * 1.6; let y = sc[1];
        for (let n = 0; n < 12; n++) { const k = gesetzt.find(g => Math.abs(g.x - sc[0]) < (g.w + w) / 2 && Math.abs(g.y - y) < h); if (!k) break; y = k.y - h - 4; }
        gesetzt.push({ x: sc[0], y, w }); if (y < sc[1] - 4) line(sc[0], sc[1], sc[0], y, 2, rgba("#1a2030", 0.5)); schild(sc[0], y, sc[2], fs, true, sc[3]); } }
    ctx.restore();
  };

  // ---------- Kamerafahrt am Turm hoch ----------
  const U = m => Math.log10(1 + Math.max(0, m) / 3); // logarithmische Höhe (in Stockwerken), damit Wolken bis Mond in eine Fahrt passen
  const HIMMEL_H = [[0, "#8fd0f0"], [2.5, "#6ab8ea"], [3.5, "#3e7ad0"], [4.3, "#1c2c78"], [4.8, "#070b26"], [9, "#03040e"]];
  const himmelFarbe = u => { for (let k = 1; k < HIMMEL_H.length; k++) if (u <= HIMMEL_H[k][0]) return mix(HIMMEL_H[k - 1][1], HIMMEL_H[k][1], (u - HIMMEL_H[k - 1][0]) / (HIMMEL_H[k][0] - HIMMEL_H[k - 1][0])); return HIMMEL_H[HIMMEL_H.length - 1][1]; };
  const hoeheModus = (s, t) => {
    const [ha, hb] = String(s.hoehe || "0>300").split(">").map(zahl), dauer = Number(s.dauer) || 4;
    const q = E.sanft ? E.sanft(clamp(t / Math.max(1, dauer - 0.3), 0, 1)) : clamp(t / dauer, 0, 1);
    const ua = U(ha), ub = U(hb ?? ha), uc = lerp(ua, ub, q), m = 3 * (Math.pow(10, uc) - 1), PX = 560, Y0 = 1240; // Turmspitze bei Y0
    const yv = hm => Y0 - (U(hm) - uc) * PX;
    for (let y = 0; y < 1920; y += 24) { ctx.fillStyle = himmelFarbe(uc + (Y0 - y) / PX); ctx.fillRect(0, y, 1080, 25); }
    const sterne = clamp((uc - 3.9) / 0.6, 0, 1); if (sterne > 0) { const r = rnd(3); for (let k = 0; k < 180; k++) { const a = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + k)); circle(r() * 1080, r() * 1920, 0.8 + r() * 2, rgba("#ffffff", 0.8 * a * sterne)); } }
    // Boden und Berge
    const yb = yv(0); if (yb < 2400) { ctx.fillStyle = lgrad(0, yb - 200, 0, yb + 400, [[0, "#a8c8d8"], [1, "#6a9a6a"]]); ctx.fillRect(0, yb - 120, 1080, 2400 - yb);
      const r = rnd(21); for (let k = 0; k < 40; k++) { const bx = r() * 1080, bh2 = 30 + r() * 140; box(bx, yb - bh2, 26 + r() * 30, bh2 + 40, 3, mix("#9aa8c0", "#e8ecf2", r())); } }
    const ye = yv(8849); if (uc > 2.85 && ye > -200 && ye < 2400) { const g = Math.max(0, yv(0) - ye); poly([[-200, yv(0)], [180, ye + g * 0.25], [300, ye], [420, ye + g * 0.2], [760, yv(0)]], "#7a86a8"); poly([[240, ye + g * 0.12], [300, ye], [360, ye + g * 0.1], [320, ye + g * 0.16], [290, ye + g * 0.12]], "#f4f6ff");
      if (Math.abs(ye - Y0) < 700) schild(300, ye - 20, "Mount Everest · 8.849 m", 30, true); }
    // Wolkenband (ca. 1.000–2.000 m)
    for (const [hm, k0] of [[900, 0], [1300, 1], [1800, 2]]) { const yw = yv(hm); if (yw < -200 || yw > 2200) continue; const r = rnd(40 + k0);
      for (let k = 0; k < 7; k++) { const wx = ((r() * 1500 + t * 20 * (k0 + 1)) % 1600) - 260, s2 = 0.9 + r() * 1.1;
        for (const [dx, dy, rr] of [[0, 0, 70], [80, -30, 92], [170, 0, 70], [240, 16, 50]]) { ctx.fillStyle = rgba("#ffffff", 0.85); ctx.beginPath(); ctx.arc(wx + dx * s2, yw + dy * s2, rr * s2, 0, Math.PI * 2); ctx.fill(); } } }
    // Flugzeug bei 3.000 m, Ballon bei 1.200 m
    const yf = yv(3000); if (yf > -100 && yf < 2000) { const fx = ((t * 160) % 1500) - 200; ctx.save(); ctx.translate(fx, yf); box(-70, -10, 140, 22, 11, "#f4f6fa"); poly([[-10, -4], [30, -4], [-30, 34]], "#c8d0dc"); poly([[-60, -8], [-44, -8], [-70, -38]], "#d8564a"); circle(56, 0, 6, "#5a8ad0"); ctx.restore();
      line(fx - 80, yf, fx - 400, yf + 6, 3, rgba("#ffffff", 0.5)); }
    const yballon = yv(1200); if (yballon > -100 && yballon < 2000) { const bx = 860 + Math.sin(t) * 20; ellipse(bx, yballon, 46, 56, "#e8705a"); poly([[bx - 30, yballon + 30], [bx + 30, yballon + 30], [bx + 12, yballon + 70], [bx - 12, yballon + 70]], "#c8504a"); box(bx - 14, yballon + 78, 28, 22, 4, "#8a5a3a"); }
    // ISS (400 km), Satellit (36.000 km), Mond (384.400 km)
    const yi = yv(400000); if (yi > -100 && yi < 2000) { const ix = 780 - t * 20; box(ix - 70, yi - 6, 140, 12, 3, "#c8ccd8"); for (const d of [-60, -30, 30, 60]) box(ix + d - 12, yi - 36, 24, 72, 2, "#3a5aa8"); circle(ix, yi, 14, "#e8ecf2"); schild(ix, yi - 50, "Raumstation · 400 km", 28, true); }
    const ys = yv(36000000); if (ys > -100 && ys < 2000) { box(260 - 20, ys - 14, 40, 28, 4, "#e8c86a"); box(200, ys - 8, 40, 16, 2, "#3a5aa8"); box(300, ys - 8, 40, 16, 2, "#3a5aa8"); }
    const ym = yv(384400000); if (ym > -500 && ym < 2400) { glut(540, ym, 520, "#e8eeff", 0.35); ctx.fillStyle = rgrad(480, ym - 60, 20, 300, [[0, "#f6f6f0"], [1, "#b8bccc"]]); ctx.beginPath(); ctx.arc(540, ym, 230, 0, Math.PI * 2); ctx.fill();
      for (const [dx, dy, rr] of [[-80, -60, 40], [60, 30, 56], [-30, 110, 30], [110, -100, 24]]) circle(540 + dx, ym + dy, rr, rgba("#9aa0b4", 0.55)); }
    // Turm in der Mitte, Spitze bei Y0
    const tw = 230, farbe = s.farbe || "#3fb8c0";
    ctx.fillStyle = lgrad(540 - tw / 2, 0, 540 + tw / 2, 0, [[0, shade(farbe, 0.15)], [0.55, farbe], [0.56, shade(farbe, -0.22)], [1, shade(farbe, -0.32)]]); ctx.fillRect(540 - tw / 2, Y0, tw, 2000);
    const fstep = 46, off = ((uc * PX * 7) % fstep + fstep) % fstep;
    for (let y = Y0 + 20 - off + fstep; y < 1960; y += fstep) for (const [x0, a] of [[540 - tw / 2 + 18, 0.45], [540 - 30, 0.45], [540 + 22, 0.22], [540 + tw / 2 - 52, 0.22]]) box(x0, y, 32, 24, 3, rgba(uc > 4.3 ? "#ffd27a" : "#ffffff", a));
    box(540 - tw / 2 - 10, Y0 - 16, tw + 20, 20, 4, shade(farbe, -0.4));
    // Kran auf der Spitze
    line(600, Y0 - 16, 600, Y0 - 220, 8, "#f2c14e"); line(600, Y0 - 210, 420, Y0 - 210, 8, "#f2c14e"); line(600, Y0 - 210, 680, Y0 - 210, 8, "#f2c14e"); box(670, Y0 - 230, 30, 40, 4, "#5a5e6a");
    line(470, Y0 - 210, 470, Y0 - 120 + Math.sin(t * 2) * 10, 2, "#3a3e4a"); box(450, Y0 - 120 + Math.sin(t * 2) * 10, 40, 24, 3, shade(farbe, -0.1));
    line(540, Y0 - 16, 540, Y0 - 140, 3, "#3a3e4a"); poly([[540, Y0 - 140], [610, Y0 - 128], [540, Y0 - 112]], farbe);
    if (s.stadt) schild(540, Y0 - 250, s.stadt, 40, true, farbe);
    // Höhenanzeige
    const txt = `${fmt(m)} m`, sub = `${fmt(m / 3)} Stockwerke`; ctx.save(); ctx.font = "900 64px Titel"; const w1 = ctx.measureText(txt).width; ctx.font = "700 32px HUD"; const w2 = ctx.measureText(sub).width; const bw = Math.max(w1, w2) + 90;
    ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 26; box(540 - bw / 2, 1500, bw, 150, 40, "rgba(12,14,34,0.8)"); ctx.shadowColor = "transparent";
    ctx.textAlign = "center"; ctx.fillStyle = "#ffffff"; ctx.font = "900 64px Titel"; ctx.fillText(txt, 540, 1574); ctx.fillStyle = "#f2cf7e"; ctx.font = "700 32px HUD"; ctx.fillText(sub, 540, 1624); ctx.restore();
  };

  // ---------- Zielkarte ----------
  const ZIELE = [["wolke", "Wolken", "1 km", 333], ["flugzeug", "Flugzeuge", "3 km", 1000], ["berg", "Mount Everest", "8.849 m", 2950], ["rakete", "Weltall", "100 km", 33333], ["station", "Raumstation", "400 km", 133333], ["mond", "Mond", "384.400 km", 128133333]];
  const zielIcon = (art, x, y, r) => { circle(x, y, r, "rgba(255,255,255,0.1)");
    if (art === "wolke") { for (const [dx, dy, rr] of [[-14, 4, 14], [2, -6, 18], [18, 4, 13]]) circle(x + dx, y + dy, rr, "#f4f6fa"); }
    else if (art === "flugzeug") { box(x - 22, y - 4, 44, 9, 4, "#f4f6fa"); poly([[x - 4, y - 2], [x + 10, y - 2], [x - 10, y + 16]], "#c8d0dc"); poly([[x - 20, y - 3], [x - 14, y - 3], [x - 22, y - 14]], "#e8705a"); }
    else if (art === "berg") { poly([[x - 24, y + 14], [x - 2, y - 18], [x + 24, y + 14]], "#8a96b8"); poly([[x - 9, y - 6], [x - 2, y - 18], [x + 6, y - 7]], "#ffffff"); }
    else if (art === "rakete") { ellipse(x, y - 2, 9, 20, "#f4f6fa"); poly([[x - 9, y + 8], [x - 17, y + 18], [x - 6, y + 14]], "#e8705a"); poly([[x + 9, y + 8], [x + 17, y + 18], [x + 6, y + 14]], "#e8705a"); circle(x, y - 6, 4, "#5a8ad0"); }
    else if (art === "station") { box(x - 22, y - 2, 44, 5, 2, "#c8ccd8"); for (const d of [-18, 10]) box(x + d, y - 14, 8, 28, 1, "#4a6ac8"); circle(x, y, 6, "#e8ecf2"); }
    else { circle(x, y, 18, "#e8eaf0"); circle(x - 5, y - 4, 4, "#b8bccc"); circle(x + 6, y + 6, 5, "#b8bccc"); } };
  const zieleModus = (s, t) => {
    ctx.fillStyle = lgrad(0, 0, 0, 1920, [[0, "#0c1638"], [1, "#1f3d6a"]]); ctx.fillRect(0, 0, 1080, 1920);
    const r = rnd(7); for (let k = 0; k < 90; k++) circle(r() * 1080, r() * 1920, 1 + r() * 1.6, rgba("#ffffff", 0.3 + 0.3 * Math.abs(Math.sin(t + k))));
    const x0 = 120, y0 = 230, w = 840, h = 1050; ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 40; box(x0, y0, w, h, 44, "rgba(10,14,36,0.9)"); ctx.restore();
    ctx.strokeStyle = "rgba(127,224,232,0.45)"; ctx.lineWidth = 3; ctx.beginPath(); A.rr(x0, y0, w, h, 44); ctx.stroke();
    ctx.textAlign = "center"; ctx.fillStyle = "#7fe0e8"; ctx.font = "900 70px Titel"; ctx.fillText(s.titel_text || "DIE ZIELE", 540, y0 + 120);
    ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.font = "700 34px HUD"; ctx.fillText(s.unter || "1 Stockwerk = 3 Meter", 540, y0 + 172);
    const n = Math.min(ZIELE.length, Number(s.bis) || ZIELE.length), dy = 134, ys = y0 + 245;
    line(x0 + 110, ys, x0 + 110, ys + dy * (ZIELE.length - 1), 6, "rgba(255,255,255,0.12)");
    ZIELE.slice().reverse().forEach((z, k0) => { const k = ZIELE.length - 1 - k0, y = ys + k0 * dy, d = t - 0.3 - k * 0.45; if (k >= n || d < 0) return;
      const p = clamp(d / 0.3, 0, 1); ctx.save(); ctx.globalAlpha = p; ctx.translate((1 - E.raus(p)) * 60, 0);
      zielIcon(z[0], x0 + 110, y, 44); ctx.textAlign = "left"; ctx.fillStyle = "#ffffff"; ctx.font = "900 50px Titel"; ctx.fillText(z[1], x0 + 180, y + 4);
      ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.font = "700 28px HUD"; ctx.fillText(z[2], x0 + 180, y + 42);
      ctx.textAlign = "right"; ctx.fillStyle = "#f2cf7e"; ctx.font = "900 46px Titel"; ctx.fillText(z[3] >= 1e6 ? `${(z[3] / 1e6).toLocaleString("de-DE", { maximumFractionDigits: 0 })} Mio.` : fmt(z[3]), x0 + w - 50, y + 4);
      ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "700 24px HUD"; ctx.fillText("Stockwerke", x0 + w - 50, y + 40); ctx.restore(); });
  };

  // ---------- Rangliste: rangliste="München:12>41|Wien:30|Graz:3>12" ziel=333 ziel_name="Wolken" ----------
  const ranglisteModus = (s, t) => {
    ctx.fillStyle = lgrad(0, 0, 0, 1920, [[0, "#0c1638"], [1, "#1f3d6a"]]); ctx.fillRect(0, 0, 1080, 1920);
    const r = rnd(13); for (let k = 0; k < 90; k++) circle(r() * 1080, r() * 1920, 1 + r() * 1.6, rgba("#ffffff", 0.3 + 0.3 * Math.abs(Math.sin(t + k))));
    const ziel = zahl(s.ziel || 333), zname = s.ziel_name || "Wolken";
    const eintraege = String(s.rangliste || "").split("|").map(q => q.trim()).filter(Boolean).slice(0, 5).map(q => { const [n, v] = q.split(":"); const [nm, idx] = n.trim().split("#"); return { name: nm.trim(), idx: idx === undefined ? null : Number(idx), v: String(v || "0") }; });
    const x0 = 90, y0 = 240, w = 900, dy = 142, h = 240 + Math.max(1, eintraege.length) * dy;
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 40; box(x0, y0, w, h, 44, "rgba(10,14,36,0.9)"); ctx.restore();
    ctx.strokeStyle = "rgba(127,224,232,0.45)"; ctx.lineWidth = 3; ctx.beginPath(); A.rr(x0, y0, w, h, 44); ctx.stroke();
    ctx.textAlign = "center"; ctx.fillStyle = "#7fe0e8"; ctx.font = "900 70px Titel"; ctx.fillText(s.titel_text || "RANGLISTE", 540, y0 + 115);
    ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.font = "700 34px HUD"; ctx.fillText(s.unter || `Nächstes Ziel: ${zname} · ${fmt(ziel)} Stockwerke`, 540, y0 + 168);
    const MED = ["#f2c14e", "#c8d0dc", "#d8925a"];
    eintraege.forEach((e, k) => { const y = y0 + 250 + k * dy, d = t - 0.25 - k * 0.3; if (d < 0) return; const p = clamp(d / 0.3, 0, 1);
      const v = bereich(e.v, t, 1.4, 0.5 + k * 0.3), f = e.idx === null ? farbeVon(e.name) : FARBEN[e.idx % FARBEN.length]; // „Stadt#3“ = Platz 3 auf dem Turmplatz, gleiche Farbe wie der Turm
      ctx.save(); ctx.globalAlpha = p; ctx.translate((1 - E.raus(p)) * 60, 0);
      circle(x0 + 80, y + 10, 40, k < 3 ? MED[k] : "rgba(255,255,255,0.14)"); ctx.fillStyle = k < 3 ? "#1a1c2a" : "#ffffff"; ctx.font = "900 44px Titel"; ctx.textAlign = "center"; ctx.fillText(String(k + 1), x0 + 80, y + 26);
      ctx.textAlign = "left"; ctx.fillStyle = "#ffffff"; ctx.font = "900 52px Titel"; ctx.fillText(e.name, x0 + 150, y);
      ctx.textAlign = "right"; ctx.fillStyle = "#f2cf7e"; ctx.font = "900 52px Titel"; ctx.fillText(fmt(v), x0 + w - 50, y);
      const bx = x0 + 150, bw = w - 200, by = y + 26; box(bx, by, bw, 22, 11, "rgba(255,255,255,0.1)");
      const q = clamp(v / ziel, 0, 1); if (q > 0) { box(bx, by, Math.max(22, bw * q), 22, 11, f); box(bx, by, Math.max(22, bw * q), 8, 4, rgba("#ffffff", 0.25)); }
      ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "700 24px HUD"; ctx.fillText(q >= 1 ? `${zname} erreicht!` : `noch ${fmt(Math.max(0, ziel - v))} bis ${zname}`, x0 + w - 50, by + 54);
      ctx.restore(); });
    if (!eintraege.length) { ctx.textAlign = "center"; ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = "700 40px HUD"; ctx.fillText("Noch keine Stadt", 540, y0 + 300); }
  };

  // ---------- Duell (neu 16.11.): duell="Hildesheim#0:6|Stuttgart#2:3>4" zeit=tag|abend titel_text="DAS DUELL" ----------
  // Zwei Türme groß nebeneinander, Stockwerke zählen hoch, Klammer zeigt den Abstand („noch 2 Stockwerke“).
  const duellModus = (s, t) => {
    const P = HIMMEL[s.zeit] || HIMMEL.abend;
    ctx.fillStyle = lgrad(0, 0, 0, 1920, [[0, P.oben], [0.75, P.unten], [1, P.unten]]); ctx.fillRect(0, 0, 1080, 1920);
    glut(540, 1180, 760, P.sonne, 0.55); circle(540, 1180, 120, rgba(P.sonne, 0.9));
    { const r = rnd(5); for (let k = 0; k < 4; k++) { const wx = ((r() * 1400 + t * (10 + k * 4)) % 1500) - 220, wy = 360 + k * 36 + r() * 30, s2 = 0.45 + r() * 0.35;
      for (const [dx, dy, rr] of [[0, 0, 60], [70, -26, 78], [150, 0, 60], [210, 14, 42]]) circle(wx + dx * s2, wy + dy * s2, rr * s2, rgba("#ffffff", 0.32)); } }
    const yb = 1300; // Boden (darunter Platz für die Untertitel)
    { const r = rnd(29); for (let k = 0; k < 34; k++) { const bx = r() * 1080, bh2 = 40 + r() * 150; box(bx, yb - bh2, 30 + r() * 40, bh2 + 20, 3, rgba(mix(P.oben, "#ffffff", 0.35 + r() * 0.2), 0.55)); } }
    ctx.fillStyle = lgrad(0, yb, 0, 1920, [[0, P.gras], [1, shade(P.gras, -0.35)]]); ctx.fillRect(0, yb, 1080, 1920 - yb);
    box(0, yb - 6, 1080, 16, 0, shade(P.platz, -0.1)); box(0, yb + 10, 1080, 70, 0, rgba(shade(P.platz, -0.25), 0.55)); for (let x = 20; x < 1080; x += 120) box(x, yb + 42, 60, 6, 3, rgba("#ffffff", 0.35));
    const ee = String(s.duell || "").split("|").map(q => q.trim()).filter(Boolean).slice(0, 2).map(q => { const [n, v] = q.split(":"); const [nm, idx] = n.trim().split("#"); return { name: nm.trim(), idx: idx === undefined ? null : Number(idx), v: String(v || "0") }; });
    if (ee.length < 2) return;
    const end = ee.map(e => { const p = e.v.split(">"); return zahl(p[p.length - 1]); }), maxS = Math.max(1, ...end);
    const fh = Math.min(110, 640 / maxS), tw = 230, xs = [270, 810];
    const namen = []; // Namensschilder zuletzt, damit die Abstandslinie sie nicht kreuzt
    const tops = ee.map((e, k) => {
      const v = bereich(e.v, t, Number(s.wachsen_dauer) || 1.6, 0.5), st = Math.round(v), h = v * fh, x = xs[k], f = e.idx === null ? farbeVon(e.name) : FARBEN[e.idx % FARBEN.length], top = yb - h;
      ellipse(x + tw * 0.35, yb + 10, tw * 0.75, 22, rgba("#1a2030", 0.22));
      if (h > 1) {
        ctx.fillStyle = lgrad(x - tw / 2, 0, x + tw / 2, 0, [[0, shade(f, 0.14)], [0.62, f], [0.63, shade(f, -0.2)], [1, shade(f, -0.3)]]); ctx.fillRect(x - tw / 2, top, tw, h);
        box(x - tw / 2 - 8, top - 14, tw + 16, 18, 4, shade(f, -0.38));
        for (let q = 0; q < st; q++) { const y = yb - (q + 1) * fh + fh * 0.28; for (const [x0, a] of [[x - tw / 2 + 22, 0.42], [x - 40, 0.42], [x + 32, 0.2], [x + tw / 2 - 52, 0.2]]) box(x0, y, Math.min(30, tw * 0.13), fh * 0.42, 3, rgba(P.licht < 0.8 ? "#ffd27a" : "#ffffff", a)); }
        line(x - tw / 2, yb - fh * Math.floor(v) + 0.5, x - tw / 2, yb, 2, rgba("#ffffff", 0.3));
      }
      // Fahne
      const fy = top - 14; line(x, fy, x, fy - 120, 4, "#3a3e4a"); const wv = Math.sin(t * 4 + k * 2) * 5;
      poly([[x, fy - 120], [x + 70, fy - 108 + wv], [x + 70, fy - 74 + wv], [x, fy - 82]], f);
      namen.push([x, st, e.name, f]);
      return { top, st, v, x, f };
    });
    // Abstand: gestrichelte Linie von der höheren Spitze, Klammer am niedrigeren Turm
    const [a, b] = tops, diff = Math.round(a.v) - Math.round(b.v), hi = diff >= 0 ? a : b, lo = diff >= 0 ? b : a, p = clamp((t - 2.2) / 0.5, 0, 1);
    if (diff !== 0 && p > 0) { ctx.save(); ctx.globalAlpha = p; ctx.setLineDash([16, 12]); line(hi.x + (lo.x > hi.x ? tw / 2 : -tw / 2), hi.top, lo.x + (lo.x > hi.x ? tw / 2 + 30 : -tw / 2 - 30), hi.top, 4, rgba("#ffffff", 0.85)); ctx.setLineDash([]);
      const bx = lo.x + (lo.x > hi.x ? tw / 2 + 30 : -tw / 2 - 30); line(bx, hi.top, bx, lo.top, 5, "#ffe27a"); line(bx - 14, hi.top, bx + 14, hi.top, 5, "#ffe27a"); line(bx - 14, lo.top, bx + 14, lo.top, 5, "#ffe27a");
      const n = Math.abs(diff), my = (hi.top + lo.top) / 2; ctx.textAlign = "center"; ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 16;
      ctx.fillStyle = "#ffe27a"; ctx.font = "900 92px Titel"; ctx.fillText(`−${n}`, 540, my + 20); ctx.font = "700 30px HUD"; ctx.fillStyle = "#ffffff"; ctx.fillText(n === 1 ? "Stockwerk" : "Stockwerke", 540, my + 62); ctx.restore(); }
    for (const [x, st, nm, f] of namen) { const y = 1480, w = 330, h = 250; // Tafel unter dem Turm, unterhalb der Untertitel
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 26; box(x - w / 2, y, w, h, 36, "rgba(12,14,34,0.82)"); ctx.restore();
      box(x - w / 2, y, w, 14, 7, f); ctx.save(); ctx.textAlign = "center"; ctx.fillStyle = "#ffffff"; ctx.font = "900 42px Titel"; ctx.fillText(nm, x, y + 70);
      ctx.fillStyle = "#f2cf7e"; ctx.font = "900 96px Titel"; ctx.fillText(fmt(st), x, y + 172); ctx.fillStyle = rgba("#ffffff", 0.7); ctx.font = "700 28px HUD"; ctx.fillText(st === 1 ? "Stockwerk" : "Stockwerke", x, y + 216); ctx.restore(); }
    // Titel
    ctx.save(); ctx.textAlign = "center"; ctx.font = "900 84px Titel"; ctx.fillStyle = "#ffffff"; ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 24; ctx.fillText(s.titel_text || "DAS DUELL", 540, 300); ctx.restore();
  };

  SZ.turm = (s, t) => { const m = s.modus || "feld"; if (m === "hoehe") hoeheModus(s, t); else if (m === "ziele") zieleModus(s, t); else if (m === "rangliste") ranglisteModus(s, t); else if (m === "duell") duellModus(s, t); else feldModus(s, t); };
})();
