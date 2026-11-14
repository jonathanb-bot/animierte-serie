/* „Bis zum Mond“ (Jonathans Idee 14.11., nach dem Vergleichsvideo „Inselwelt“): Städte bauen Türme um die Wette.
   Eigene Kulisse, eigener Look (leuchtend, schwebender Turmplatz bei Sonnenaufgang). Nur neue Namen: alle bisherigen
   Serien bleiben pixelgleich.

   [turm modus=feld zeit=tag|abend|nacht tuerme="Berlin:0|Wien:12>40|…" leer=? nah=1.8 blick=4,5 markiere=4,5]
     - tuerme: Stadt:Stockwerke (a>b wächst in der Szene von a nach b), werden auf feste Plätze verteilt (Reihenfolge = Platz)
     - leer: Text auf den Schildern freier Plätze (Standard „?“), leer_zeigen=N: so viele freie Plätze (die nächsten) bekommen ein Schild
   [turm modus=hoehe hoehe=0>1000 stadt="Deine Stadt"]   Kamerafahrt am Turm hoch (Meter, 1 Stockwerk = 3 m)
   [turm modus=ziele bis=5]                                Zielkarte (Wolken … Mond), bis = wie viele Ziele schon sichtbar
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
  const FARBEN = ["#e8705a", "#4a9ad0", "#f2c14e", "#7a6ac8", "#4aa878", "#e07aa0", "#3fb8c0", "#d8564a", "#8ab84a", "#c87a3a"];

  const HIMMEL = {
    tag: { oben: "#5aa8e0", unten: "#bfe6f4", sonne: "#fff6d8", platz: "#e8dcc4", fuge: "#cbbd9f", rand: "#b89a72", randS: "#8a6e52", gras: "#7fbf62", licht: 1 },
    abend: { oben: "#3a3a8a", unten: "#f6a878", sonne: "#ffd6a0", platz: "#e8c8a8", fuge: "#c8a080", rand: "#a87a5a", randS: "#7a5242", gras: "#a0a05a", licht: 0.7 },
    nacht: { oben: "#0a1236", unten: "#24366a", sonne: "#e8eeff", platz: "#5a607a", fuge: "#484c64", rand: "#3e3a52", randS: "#2a2638", gras: "#2c5248", licht: 0 },
  };

  // ---------- Turmplatz (isometrisch) ----------
  const turmBauen = (x, y, TW, TH, stock, farbe, P, t, idx, name) => {
    const fh = TW * 0.085, h = Math.max(0, stock) * fh, w = 0.36, nacht = P.licht < 0.5;
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
    // schwebende Platte mit Fels darunter
    const o = feld(-0.6, -0.6), r_ = feld(G - 0.4, -0.6), u = feld(G - 0.4, G - 0.4), l = feld(-0.6, G - 0.4), dick = TW * 0.7;
    const sp = (t * 0.6) % 1; ctx.fillStyle = rgrad(u[0], u[1] + dick * 1.6, 10, TW * G * 0.6, [[0, rgba("#000000", 0.18)], [1, rgba("#000000", 0)]]); ctx.fillRect(0, 0, 1080, 1920);
    poly([l, u, [u[0], u[1] + dick], [l[0], l[1] + dick]], P.rand); poly([u, r_, [r_[0], r_[1] + dick], [u[0], u[1] + dick]], P.randS);
    poly([[l[0], l[1] + dick], [u[0], u[1] + dick], [u[0], u[1] + dick * 2.6]], shade(P.rand, -0.15));
    poly([[u[0], u[1] + dick], [r_[0], r_[1] + dick], [u[0], u[1] + dick * 2.6]], shade(P.randS, -0.15));
    for (let k = 0; k < 3; k++) { const a = (k + 0.5) / 3; line(lerp(l[0], u[0], a), lerp(l[1], u[1], a), lerp(l[0], u[0], a), lerp(l[1], u[1], a) + dick, 2, rgba("#000000", 0.08)); }
    poly([o, r_, u, l], P.gras); const ins = (p, k) => [lerp(p[0], cx, k), lerp(p[1], cy + (G - 1) * TH / 2, k)];
    poly([ins(o, 0.03), ins(r_, 0.03), ins(u, 0.03), ins(l, 0.03)], P.platz);
    for (let i = 0; i <= G; i++) { const a = feld(i - 0.5, -0.5), b = feld(i - 0.5, G - 0.5), c = feld(-0.5, i - 0.5), d = feld(G - 0.5, i - 0.5); line(a[0], a[1], b[0], b[1], 1.6, P.fuge); line(c[0], c[1], d[0], d[1], 1.6, P.fuge); }
    // Plätze: spiralförmig von der Mitte nach außen, Reihenfolge der Städte = Platz
    const plaetze = []; for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) plaetze.push([i, j]);
    const c0 = (G - 1) / 2; plaetze.sort((a, b) => Math.hypot(a[0] - c0, a[1] - c0) - Math.hypot(b[0] - c0, b[1] - c0) || a[0] - b[0]);
    const tuerme = String(s.tuerme || "").split("|").map(q => q.trim()).filter(Boolean).map((q, k) => { const [n, v] = q.split(":"); return { name: n.trim(), stock: bereich(v, t, Number(s.wachsen_dauer) || 1.8), k }; });
    if (s.markiere) { const [mi, mj] = String(s.markiere).split(",").map(Number), [x, y] = feld(mi, mj), p = 0.5 + 0.5 * Math.sin(t * 4);
      glut(x, y, TW * 0.9, "#ffe27a", 0.35 * p); ctx.beginPath(); ctx.ellipse(x, y, TW * 0.46, TH * 0.46, 0, 0, Math.PI * 2); ctx.lineWidth = TW * 0.04; ctx.strokeStyle = rgba("#ffe27a", 0.7 + 0.3 * p); ctx.stroke();
      if (s.grundstein !== "0") s._grundstein = [x, y]; }
    const zuZeichnen = plaetze.map((pl, k) => ({ pl, k, turm: tuerme[k] })).sort((a, b) => (a.pl[0] + a.pl[1]) - (b.pl[0] + b.pl[1]));
    const schilder = [];
    for (const e of zuZeichnen) { const [x, y] = feld(e.pl[0], e.pl[1]);
      if (e.turm) { const st = Math.round(e.turm.stock), topY = turmBauen(x, y, TW, TH, st, FARBEN[e.k % FARBEN.length], P, t, e.k, e.turm.name); schilder.push([x, topY, `${e.turm.name} · ${fmt(st)}`, FARBEN[e.k % FARBEN.length]]); }
      else { turmBauen(x, y, TW, TH, 0, "#888", P, t, e.k); if (e.k < tuerme.length + (Number(s.leer_zeigen) || 0)) { line(x, y - 4, x, y - TW * 0.3, 2, "#6a5a4a"); schild(x, y - TW * 0.3, String(s.leer ?? "?"), TW * 0.25, false); } } }
    if (s._grundstein && !tuerme.length) { const [x, y] = s._grundstein, w = TW * 0.16, h = TW * 0.13, yy = y - 6 + Math.sin(t * 2) * 1.5;
      glut(x, yy - h, TW * 0.5, "#ffe27a", 0.35);
      poly([[x - w, yy], [x, yy + w / 2], [x, yy + w / 2 - h], [x - w, yy - h]], "#d8ccb4"); poly([[x + w, yy], [x, yy + w / 2], [x, yy + w / 2 - h], [x + w, yy - h]], "#b8aa90");
      poly([[x - w, yy - h], [x, yy - w / 2 - h], [x + w, yy - h], [x, yy + w / 2 - h]], "#efe6d2"); line(x - w * 0.5, yy - h + 2, x + w * 0.5, yy - h + 2, 1.5, rgba("#8a7a5a", 0.6)); }
    for (const [x, y, txt, f] of schilder) schild(x, y, txt, TW * 0.27, true, f);
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

  SZ.turm = (s, t) => { const m = s.modus || "feld"; if (m === "hoehe") hoeheModus(s, t); else if (m === "ziele") zieleModus(s, t); else feldModus(s, t); };
})();
