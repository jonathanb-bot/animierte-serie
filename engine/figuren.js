/* Figuren: Köpfe, Körper, Posen, Zombies – sauberer Flat-Vektor-Stil */
(() => {
  const { rr, fill, circle, ellipse, capsule, shade, rgba, schattiere, clamp, lerp } = A;

  A.STANDARD = { haut: "#f2cfb3", haare: "#3a2b24", haar: "kurz", jacke: "#4f6e8c", hose: "#2e3441", schuhe: "#22252c", augen: "#2a2630", muetze: null, bart: null, brille: null, kapuze: false, rucksack: null, zombie: false, groesse: 1 };
  const ZOMBIE_HAUT = ["#a9b89c", "#9fae95", "#b3b69a", "#98a893"];
  const ZOMBIE_KLEIDUNG = [["#6d5b4b", "#3d3a36"], ["#5a6a73", "#34383d"], ["#7a4a46", "#3a3433"], ["#5d6b4f", "#373a31"], ["#8a8170", "#423f3a"], ["#4d5670", "#2f323a"]];
  A.zombieFigur = (n) => {
    const k = ZOMBIE_KLEIDUNG[n % ZOMBIE_KLEIDUNG.length];
    const haarStile = ["kurz", "wuschel", "lang", "glatze", "seite", "dutt"];
    const haarFarben = ["#3d3530", "#5e5249", "#7a6a55", "#2c2724", "#6b5a3c"];
    return { ...A.STANDARD, zombie: true, haut: ZOMBIE_HAUT[n % 4], jacke: k[0], hose: k[1], haar: haarStile[(n * 7) % 6], haare: haarFarben[(n * 3) % 5], schuhe: "#2b2a28" };
  };

  function blinzeln(t, seed) {
    const periode = 3.1 + (seed % 9) * 0.37;
    const ph = (t + seed * 0.913) % periode;
    if (ph < 0.15) return 0.08 + 0.92 * Math.abs(Math.cos((ph / 0.15) * Math.PI));
    return 1;
  }

  // ---------- Haare ----------
  function haareHinten(f, R) {
    ctx.fillStyle = shade(f.haare, -0.12);
    if (f.haar === "lang") {
      ctx.beginPath(); ctx.moveTo(-1.08 * R, -0.2 * R);
      ctx.bezierCurveTo(-1.25 * R, 0.8 * R, -1.15 * R, 1.35 * R, -0.7 * R, 1.5 * R);
      ctx.lineTo(0.7 * R, 1.5 * R);
      ctx.bezierCurveTo(1.15 * R, 1.35 * R, 1.25 * R, 0.8 * R, 1.08 * R, -0.2 * R); ctx.closePath(); ctx.fill();
    } else if (f.haar === "kind") {
      for (const s of [-1, 1]) {
        ellipse(s * 1.12 * R, 0.35 * R, 0.3 * R, 0.42 * R, shade(f.haare, -0.08), s * 0.3);
        A.box(s * 1.0 * R - 0.08 * R, 0.0 * R, 0.16 * R, 0.14 * R, 0.07 * R, "#e0566b");
      }
    } else if (f.haar === "dutt") {
      circle(0, -1.12 * R, 0.36 * R, shade(f.haare, -0.08));
    }
  }

  function haareVorne(f, R) {
    const c = f.haare;
    ctx.fillStyle = c;
    const dome = (seiteY = 0.0, top = 1.48) => {
      ctx.moveTo(-1.03 * R, seiteY * R);
      ctx.bezierCurveTo(-1.1 * R, -top * R, 1.1 * R, -top * R, 1.03 * R, seiteY * R);
    };
    if (f.haar === "glatze" || f.haar === "keine") {
      ellipse(-0.42 * R, -0.62 * R, 0.26 * R, 0.1 * R, "rgba(255,255,255,0.22)", -0.6);
      if (f.haar === "glatze" && f.haare_seiten !== false) {
        for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 1.02 * R, 0.1 * R); ctx.quadraticCurveTo(s * 1.08 * R, -0.45 * R, s * 0.8 * R, -0.62 * R); ctx.quadraticCurveTo(s * 0.92 * R, -0.25 * R, s * 0.86 * R, 0.1 * R); ctx.closePath(); fill(c); }
      }
      return;
    }
    ctx.beginPath();
    if (f.haar === "kurz") {
      dome(0.0);
      ctx.quadraticCurveTo(0.98 * R, -0.42 * R, 0.6 * R, -0.5 * R);
      ctx.bezierCurveTo(0.25 * R, -0.58 * R, -0.15 * R, -0.36 * R, -0.6 * R, -0.48 * R);
      ctx.quadraticCurveTo(-0.95 * R, -0.5 * R, -1.03 * R, 0.0);
    } else if (f.haar === "seite") {
      dome(-0.05);
      ctx.quadraticCurveTo(0.95 * R, -0.5 * R, 0.55 * R, -0.62 * R);
      ctx.bezierCurveTo(0.2 * R, -0.72 * R, -0.3 * R, -0.55 * R, -0.75 * R, -0.42 * R);
      ctx.quadraticCurveTo(-0.98 * R, -0.35 * R, -1.03 * R, -0.05 * R);
    } else if (f.haar === "wuschel") {
      dome(0.0, 1.55);
      const pts = [[0.95, -0.25], [0.7, -0.5], [0.4, -0.45], [0.15, -0.55], [-0.15, -0.42], [-0.45, -0.55], [-0.75, -0.42], [-0.98, -0.2]];
      let px = 1.03, py = 0;
      for (const [x, y] of pts) { ctx.quadraticCurveTo(((px + x) / 2) * R, ((py + y) / 2 - 0.12) * R, x * R, y * R); px = x; py = y; }
      ctx.lineTo(-1.03 * R, 0);
    } else { // lang, kind, dutt: Mittelscheitel
      ctx.moveTo(-1.06 * R, 0.25 * R);
      ctx.bezierCurveTo(-1.14 * R, -1.48 * R, 1.14 * R, -1.48 * R, 1.06 * R, 0.25 * R);
      ctx.quadraticCurveTo(0.85 * R, -0.5 * R, 0.06 * R, -0.66 * R);
      ctx.quadraticCurveTo(-0.85 * R, -0.5 * R, -1.06 * R, 0.25 * R);
    }
    ctx.closePath(); ctx.fill();
    // Glanz
    ctx.save(); ctx.beginPath(); ctx.arc(-0.05 * R, -0.05 * R, 0.82 * R, 1.13 * Math.PI, 1.42 * Math.PI);
    ctx.lineWidth = 0.07 * R; ctx.lineCap = "round"; ctx.strokeStyle = rgba(shade(c, 0.45), 0.55); ctx.stroke(); ctx.restore();
  }

  // ---------- Kopf ----------
  A.kopf = (x, y, R, f, o = {}) => {
    const t = o.t || 0;
    const aus = o.ausdruck || (f.zombie ? "zombie" : "neutral");
    const seed = (o.seed ?? 3) | 0;
    const d = clamp(o.drehung || 0, -1, 1);
    const fx = d * 0.17 * R;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.neigung || 0);
    // Schatten des Kopfes auf Hals
    ellipse(0, 0.95 * R, 0.55 * R, 0.16 * R, rgba(A.SCHATTEN, 0.18));
    haareHinten(f, R);
    // Ohren
    for (const s of [-1, 1]) {
      const sichtbar = 1 - Math.max(0, s * d) * 0.6;
      ellipse(s * 0.97 * R - d * 0.06 * R, 0.08 * R, 0.17 * R * sichtbar, 0.2 * R, shade(f.haut, -0.05));
      ellipse(s * 0.99 * R - d * 0.06 * R, 0.08 * R, 0.08 * R * sichtbar, 0.11 * R, shade(f.haut, -0.16));
    }
    // Gesicht
    ctx.beginPath();
    ctx.ellipse(0, -0.05 * R, R, 0.98 * R, 0, 0, Math.PI * 2);
    ctx.moveTo(0.84 * R, 0.3 * R); ctx.ellipse(0, 0.3 * R, 0.84 * R, 0.72 * R, 0, 0, Math.PI * 2);
    fill(f.haut);
    schattiere(-R + fx * 2, R + fx * 2, f.zombie ? 0.3 : 0.2);
    // Bart
    if (f.bart) {
      ctx.beginPath(); ctx.moveTo(-0.9 * R, 0.0);
      ctx.bezierCurveTo(-0.92 * R, 0.95 * R, -0.45 * R, 1.12 * R, fx, 1.12 * R);
      ctx.bezierCurveTo(0.45 * R, 1.12 * R, 0.92 * R, 0.95 * R, 0.9 * R, 0.0);
      ctx.bezierCurveTo(0.7 * R, 0.4 * R, 0.4 * R, 0.38 * R, fx, 0.4 * R);
      ctx.bezierCurveTo(-0.4 * R, 0.38 * R, -0.7 * R, 0.4 * R, -0.9 * R, 0.0); fill(f.bart);
    }
    // Wangen
    if (!f.zombie) for (const s of [-1, 1]) ellipse(fx + s * 0.55 * R, 0.33 * R, 0.13 * R, 0.075 * R, "rgba(232,120,110,0.28)");
    // Augen
    let bl = blinzeln(t, seed);
    const schreck = aus === "schreck";
    const gr = schreck ? 1.15 : 1;
    const bx = (o.blick || [0, 0])[0] * 0.065 * R + d * 0.05 * R, by = (o.blick || [0, 0])[1] * 0.06 * R;
    for (const s of [-1, 1]) {
      const ex = fx + s * 0.35 * R * (1 - s * d * 0.08), ey = 0.0;
      const rx = 0.19 * R * gr * (1 - s * d * 0.12), ry = 0.235 * R * gr;
      if (f.zombie || aus === "muede") ellipse(ex, ey + 0.2 * R, 0.17 * R, 0.08 * R, rgba(f.zombie ? "#4a3b52" : "#8a6a7a", 0.35));
      ellipse(ex, ey, rx, ry * bl, f.zombie ? "#e6e8d8" : "#fcfcf8");
      if (bl > 0.35) {
        ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, rx, ry * bl, 0, 0, Math.PI * 2); ctx.clip();
        if (f.zombie) {
          circle(ex + bx * 0.5, ey + by, 0.055 * R, "#b9bcae");
        } else {
          const pr = schreck ? 0.085 * R : 0.115 * R;
          circle(ex + bx, ey + by + 0.02 * R, pr, f.augen);
          circle(ex + bx - 0.04 * R, ey + by - 0.035 * R, 0.038 * R, "#fff");
          circle(ex + bx + 0.035 * R, ey + by + 0.05 * R, 0.017 * R, "rgba(255,255,255,0.8)");
          if (o.leuchten > 0) { const gl = f.augenleuchten || "#9dffbf"; circle(ex + bx, ey + by + 0.02 * R, pr * 1.1, rgba(gl, 0.95 * o.leuchten)); circle(ex + bx - 0.03 * R, ey + by - 0.02 * R, pr * 0.45, rgba("#ffffff", 0.9 * o.leuchten)); }
        }
        // Oberlid
        if (aus === "muede" || aus === "misstrauisch") { ctx.fillStyle = f.haut; ctx.fillRect(ex - rx, ey - ry, rx * 2, ry * (aus === "muede" ? 0.95 : 0.7)); }
        ctx.restore();
      }
      // Grünes Augenleuchten (Der Alien): Schein, der auch die Dunkelheit überstrahlt
      if (o.leuchten > 0 && bl > 0.35) { const gl = f.augenleuchten || "#9dffbf"; ctx.fillStyle = A.rgrad(ex + bx, ey + by, 0, 0.5 * R, [[0, rgba(gl, 0.55 * o.leuchten)], [1, rgba(gl, 0)]]); ctx.fillRect(ex + bx - 0.5 * R, ey + by - 0.5 * R, R, R); A.licht(ex + bx, ey + by, 0.6 * R, gl, 1.3 * o.leuchten); }
      // Lidlinie
      ctx.beginPath(); ctx.ellipse(ex, ey, rx, ry * bl, 0, 1.12 * Math.PI, 1.88 * Math.PI);
      ctx.strokeStyle = rgba(shade(f.haut, -0.6), 0.7); ctx.lineWidth = 0.035 * R; ctx.lineCap = "round"; ctx.stroke();
      // Augenbrauen
      let rot = 0, hy = -0.36 * R;
      if (aus === "wuetend" || aus === "entschlossen") { rot = s * (aus === "wuetend" ? 0.32 : 0.16); hy += 0.04 * R; }
      if (aus === "traurig" || aus === "angst" || aus === "besorgt") rot = -s * 0.28;
      if (schreck) hy -= 0.1 * R;
      if (aus === "misstrauisch") rot = s === 1 ? -0.2 : 0.25;
      if (aus === "froh") hy -= 0.03 * R;
      ctx.save(); ctx.translate(ex, ey + hy * gr); ctx.rotate(rot);
      capsule(-0.15 * R, 0, 0.15 * R, 0, 0.045 * R, 0.035 * R);
      fill(f.haar === "glatze" || f.haar === "keine" ? shade(f.haut, -0.4) : shade(f.haare, -0.2)); ctx.restore();
    }
    // Nase
    ellipse(fx * 1.25, 0.25 * R, 0.075 * R, 0.055 * R, shade(f.haut, -0.13));
    // Mund
    const mx = fx * 1.15, my = 0.53 * R;
    const lippe = shade(f.haut, -0.55);
    const sp = o.spricht ? 0.25 + 0.75 * Math.abs(Math.sin(t * 15.5) * Math.sin(t * 6.1 + 1.3)) : 0;
    const offen = (w, h) => {
      ctx.save(); A.rr(mx - w, my - h * 0.4, w * 2, h, Math.min(w, h) * 0.9); ctx.fillStyle = "#3a1f24"; ctx.fill(); ctx.clip();
      A.box(mx - w, my - h * 0.4 - 1, w * 2, h * 0.28, 2, "#f3eee6");
      ellipse(mx, my + h * 0.6, w * 0.7, h * 0.35, "#c8616a");
      ctx.restore();
    };
    ctx.lineCap = "round";
    if (aus === "zombie") {
      const k = 0.1 + 0.05 * Math.sin(t * 2.3 + seed);
      ctx.beginPath(); ctx.moveTo(mx - 0.2 * R, my);
      for (let i = 0; i <= 6; i++) ctx.lineTo(mx - 0.2 * R + i * 0.0667 * R, my + (i % 2 ? 0.05 : -0.02) * R);
      ctx.lineTo(mx + 0.18 * R, my + k * R * 1.4); ctx.lineTo(mx - 0.18 * R, my + k * R * 1.5); ctx.closePath(); fill("#2c1d22");
    } else if (sp > 0) {
      offen(0.15 * R + 0.03 * R * sp, 0.06 * R + 0.17 * R * sp);
    } else if (schreck) {
      offen(0.12 * R, 0.26 * R);
    } else if (aus === "angst") {
      offen(0.14 * R, 0.1 * R);
    } else if (aus === "froh") {
      ctx.save(); ctx.beginPath(); ctx.moveTo(mx - 0.2 * R, my - 0.03 * R); ctx.quadraticCurveTo(mx, my + 0.28 * R, mx + 0.2 * R, my - 0.03 * R); ctx.closePath(); ctx.fillStyle = "#3a1f24"; ctx.fill(); ctx.clip();
      A.box(mx - 0.2 * R, my - 0.05 * R, 0.4 * R, 0.07 * R, 2, "#f3eee6"); ellipse(mx, my + 0.2 * R, 0.1 * R, 0.07 * R, "#c8616a"); ctx.restore();
    } else {
      const k = aus === "traurig" || aus === "besorgt" ? -0.07 : aus === "wuetend" ? -0.04 : aus === "entschlossen" ? 0 : 0.03;
      ctx.beginPath(); ctx.moveTo(mx - 0.15 * R, my); ctx.quadraticCurveTo(mx, my + k * R * 2, mx + 0.15 * R, my);
      ctx.strokeStyle = lippe; ctx.lineWidth = 0.05 * R; ctx.stroke();
    }
    haareVorne(f, R);
    if (f.muetze) {
      ctx.beginPath(); ctx.moveTo(-1.1 * R, -0.25 * R);
      ctx.bezierCurveTo(-1.12 * R, -1.55 * R, 1.12 * R, -1.55 * R, 1.1 * R, -0.25 * R); ctx.closePath(); fill(f.muetze);
      schattiere(-R, R, 0.2);
      A.box(-1.13 * R, -0.45 * R, 2.26 * R, 0.3 * R, 0.15 * R, shade(f.muetze, -0.12));
      circle(0, -1.22 * R, 0.17 * R, shade(f.muetze, 0.15));
    }
    if (f.brille) {
      ctx.lineWidth = 0.045 * R; ctx.strokeStyle = f.brille;
      for (const s of [-1, 1]) { A.rr(fx + s * 0.35 * R - 0.25 * R, -0.2 * R, 0.5 * R, 0.38 * R, 0.14 * R); ctx.fillStyle = "rgba(220,235,255,0.12)"; ctx.fill(); ctx.stroke(); }
      A.line(fx - 0.1 * R, -0.05 * R, fx + 0.1 * R, -0.05 * R, 0.045 * R, f.brille);
    }
    ctx.restore();
  };

  // ---------- Posen: Handziele relativ zu den Füßen ----------
  function pose(name, t, f, ph) {
    const sway = Math.sin(t * 1.7 + ph) * 4;
    const P = { hl: [-94, -178 + sway * 0.5], hr: [94, -178 - sway * 0.5], neig: 0, lean: Math.sin(t * 0.9 + ph) * 0.012, gehen: 0 };
    switch (name) {
      case "winkt": P.hr = [175 + Math.sin(t * 10) * 35, -600]; break;
      case "zeigt": P.hr = [270, -400]; break;
      case "zeigt_links": P.hl = [-270, -400]; break;
      case "zeigt_hoch": P.hr = [120, -680]; break;
      case "haende_hoch": P.hl = [-140, -640]; P.hr = [140, -640]; break;
      case "angst": P.hl = [-55, -440]; P.hr = [55, -440]; P.neig = -0.05; break;
      case "psst": P.hr = [14, -420]; break;
      case "denkt": P.hr = [30, -395]; P.hl = [-40, -250]; P.neig = 0.08; break;
      case "huefte": P.hl = [-95, -235]; P.hr = [95, -235]; break;
      case "traegt": P.hl = [-62, -275]; P.hr = [62, -275]; break;
      case "taschenlampe": P.hr = [110, -330]; break;
      case "lauscht": P.hr = [-5, -470]; P.neig = 0.12; break;
      case "geht": case "rennt": P.gehen = name === "rennt" ? 2 : 1; break;
      case "sitzt": P.sitzen = true; P.hl = [-125, -205]; P.hr = [125, -205]; break;
      case "zombie": P.hl = [-135 + Math.sin(t * 1.3 + ph) * 12, -370 + Math.sin(t * 1.9 + ph) * 10]; P.hr = [135 + Math.sin(t * 1.1 + ph) * 12, -380 + Math.cos(t * 1.6 + ph) * 10]; P.neig = Math.sin(t * 0.8 + ph) * 0.12 + 0.08; P.lean = Math.sin(t * 1.2 + ph) * 0.05; break;
      case "zombie_geht": P.hl = [-130, -375 + Math.sin(t * 4 + ph) * 12]; P.hr = [130, -375 + Math.cos(t * 4 + ph) * 12]; P.neig = Math.sin(t * 0.8 + ph) * 0.12 + 0.08; P.gehen = 0.6; break;
    }
    return P;
  }

  // ---------- Ganze Figur: Füße bei (x,y) ----------
  A.figur = (x, y, s, f, o = {}) => {
    const t = o.t || 0, ph = o.phase ?? (x * 0.013);
    const P = pose(o.pose || (f.zombie ? "zombie" : "steht"), t, f, ph);
    let bob = Math.sin(t * 2.1 + ph) * 2.5;
    let fl = [-40, 0], fr = [40, 0], lift = [0, 0];
    if (P.gehen) {
      const sp = P.gehen === 2 ? 11 : P.gehen < 1 ? 4 : 7.5;
      const w = t * sp + ph;
      fl[0] += Math.sin(w) * 16 * P.gehen; fr[0] -= Math.sin(w) * 16 * P.gehen;
      lift = [Math.max(0, Math.cos(w)) * 22 * Math.min(P.gehen, 1.4), Math.max(0, -Math.cos(w)) * 22 * Math.min(P.gehen, 1.4)];
      bob = -Math.abs(Math.sin(w)) * 10 * Math.min(P.gehen, 1.5);
      if (!f.zombie) { P.hl = [-100, -215 + Math.cos(w) * 22]; P.hr = [100, -215 - Math.cos(w) * 22]; }
    }
    ctx.save(); ctx.translate(x, y); ctx.scale((o.spiegeln ? -s : s) * (f.groesse || 1), s * (f.groesse || 1));
    // Bodenschatten
    ellipse(0, -2, 110, 18, rgba(A.SCHATTEN, 0.22));
    ctx.rotate(P.lean);
    // Sitzen: Schneidersitz, der Oberkörper sinkt ab
    if (P.sitzen) {
      for (const side of [-1, 1]) {
        capsule(side * 40, -40, side * 120, -18, 30, 26); fill(side > 0 ? shade(f.hose, -0.08) : f.hose);
        capsule(side * 120, -18, -side * 20, -6, 26, 22); fill(side > 0 ? f.hose : shade(f.hose, -0.08));
        A.box(-side * 20 - 30, -26, 60, 26, 12, f.schuhe);
      }
      ctx.translate(0, 165);
    } else
    // Beine
    for (const [i, side] of [[0, -1], [1, 1]]) {
      const ft = i ? fr : fl, hy = -200 + bob * 0.3, l = lift[i];
      capsule(side * 36, hy, ft[0], -24 - l, 29, 23); fill(i ? shade(f.hose, -0.08) : f.hose);
      // Schuh
      A.box(ft[0] - 36, -36 - l, 72, 34, 16, f.schuhe);
      A.box(ft[0] - 36, -10 - l, 72, 9, 4, shade(f.schuhe, 0.25));
      if (f.zombie) A.poly([[ft[0] - 28, -60 - l], [ft[0] - 14, -44 - l], [ft[0], -60 - l], [ft[0] + 14, -46 - l], [ft[0] + 28, -60 - l], [ft[0] + 28, -40 - l], [ft[0] - 28, -40 - l]], shade(f.hose, -0.15));
    }
    ctx.translate(0, bob);
    // Rucksack hinten
    if (f.rucksack) { A.box(-82, -380, 164, 190, 40, shade(f.rucksack, -0.15)); }
    // Hals
    A.box(-23, -415, 46, 60, 16, shade(f.haut, -0.12));
    // Torso
    ctx.beginPath(); ctx.moveTo(-76, -372);
    ctx.bezierCurveTo(-96, -352, -84, -260, -72, -182); ctx.lineTo(72, -182);
    ctx.bezierCurveTo(84, -260, 96, -352, 76, -372); ctx.quadraticCurveTo(0, -398, -76, -372); ctx.closePath();
    fill(f.jacke); ctx.beginPath(); ctx.moveTo(-76, -372);
    ctx.bezierCurveTo(-96, -352, -84, -260, -72, -182); ctx.lineTo(72, -182);
    ctx.bezierCurveTo(84, -260, 96, -352, 76, -372); ctx.quadraticCurveTo(0, -398, -76, -372); ctx.closePath();
    schattiere(-90, 90, 0.24);
    if (f.mantel) {
      // knielanger Mantel über den Beinen, Revers, Knöpfe
      ctx.beginPath(); ctx.moveTo(-74, -200); ctx.lineTo(-92, -88); ctx.quadraticCurveTo(0, -76, 92, -88); ctx.lineTo(74, -200); ctx.closePath(); fill(f.jacke);
      ctx.beginPath(); ctx.moveTo(-74, -200); ctx.lineTo(-92, -88); ctx.quadraticCurveTo(0, -76, 92, -88); ctx.lineTo(74, -200); ctx.closePath(); schattiere(-92, 92, 0.24);
      A.line(6, -210, 10, -84, 4, shade(f.jacke, -0.25));
      A.box(-74, -214, 148, 16, 8, shade(f.jacke, -0.14));
      A.poly([[-40, -384], [-6, -300], [-30, -290], [-62, -370]], shade(f.jacke, -0.16)); A.poly([[40, -384], [6, -300], [30, -290], [62, -370]], shade(f.jacke, -0.1));
      for (const by of [-280, -240]) circle(-16, by, 6, shade(f.jacke, -0.35));
    } else
    A.box(-74, -206, 148, 26, 12, shade(f.jacke, -0.12));
    if (f.zombie) { // zerrissener Saum + Flecken
      A.poly([[-72, -182], [-50, -160], [-34, -182], [-10, -164], [8, -182], [30, -158], [50, -182], [72, -182], [72, -190], [-72, -190]], shade(f.jacke, -0.12));
      ellipse(30, -290, 22, 14, rgba("#3d2a26", 0.35), 0.4); ellipse(-40, -240, 14, 9, rgba("#3d2a26", 0.3));
    } else {
      A.line(0, -380, 0, -205, 4, shade(f.jacke, -0.2));
    }
    // Kragen / Kapuze
    if (f.kapuze) { ctx.beginPath(); ctx.ellipse(0, -378, 66, 26, 0, 0, Math.PI * 2); fill(shade(f.jacke, -0.15)); }
    else { ctx.beginPath(); ctx.moveTo(-46, -385); ctx.quadraticCurveTo(0, -350, 46, -385); ctx.lineTo(36, -396); ctx.quadraticCurveTo(0, -372, -36, -396); ctx.closePath(); fill(shade(f.jacke, -0.1)); }
    if (f.rucksack) { for (const sx of [-1, 1]) A.box(sx * 52 - 9, -380, 18, 150, 8, f.rucksack); }
    if (f.schal) { A.box(-50, -404, 100, 34, 16, f.schal); A.box(14, -388, 30, 92, 12, shade(f.schal, -0.1)); }
    // Kopf
    A.kopf(0, -490, 102, f, { t, ausdruck: o.ausdruck, spricht: o.spricht, blick: o.blick, drehung: o.drehung, neigung: P.neig + (o.neigung || 0), seed: o.seed ?? Math.round(ph * 10), leuchten: o.leuchten });
    // Arme
    const sch = [[-74, -360], [74, -360]];
    const haende = [P.hl, P.hr];
    for (const i of [0, 1]) {
      const [sx, sy] = sch[i];
      const [tx, ty] = [haende[i][0], haende[i][1] - bob];
      let a = A.ik(sx, sy, tx, ty, 100, 94, 1), b = A.ik(sx, sy, tx, ty, 100, 94, -1);
      const k = (i === 0 ? a.ex < b.ex : a.ex > b.ex) ? a : b;
      const arm = shade(f.jacke, i ? -0.1 : -0.04);
      capsule(sx, sy, k.ex, k.ey, 24, 20); fill(arm);
      capsule(k.ex, k.ey, k.hx, k.hy, 20, 17); fill(arm);
      circle(k.hx, k.hy, 19, f.haut);
      ctx.beginPath(); ctx.arc(k.hx, k.hy, 19, 0, Math.PI * 2); schattiere(k.hx - 19, k.hx + 19, 0.18);
      if (o.pose === "taschenlampe" && i === 1) {
        ctx.save(); ctx.translate(k.hx, k.hy); A.box(-10, -40, 20, 62, 6, "#2f3236"); A.box(-14, -52, 28, 16, 5, "#44484d"); ctx.restore();
        A.licht(k.hx, k.hy - 80, 520, "#fff4d0", 1.3);
      }
      if (o.halt && i === 1) A.objekt(o.halt, k.hx, k.hy - 10, 0.55, t);
    }
    ctx.restore();
  };

  // Figuren zusätzlich in die Maske zeichnen (siehe A.maskeZeichnen): der Farblook lässt sie warm
  const figurRoh = A.figur, kopfRoh = A.kopf;
  A.figur = (...a) => { figurRoh(...a); A.maskeZeichnen(() => figurRoh(...a)); };
  A.kopf = (...a) => { kopfRoh(...a); A.maskeZeichnen(() => kopfRoh(...a)); };
})();
