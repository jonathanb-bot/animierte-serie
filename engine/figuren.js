/* Figuren: bewusst abstrakt und ruhig (Stil „Dinge Erklärt“): runde Köpfe ohne Details,
   kleine dunkle Augen, Haare als glatte Kappe, schlichte Körper, weiche Verlaufs-Schattierung, keine Konturen. */
(() => {
  const { rr, fill, circle, ellipse, capsule, shade, rgba, clamp, lerp } = A;

  A.STANDARD = { haut: "#e6c3a8", haare: "#2f2630", haar: "kurz", jacke: "#3f5f86", hose: "#262c40", schuhe: "#1c2030", augen: "#1d1a26", muetze: null, bart: null, brille: null, kapuze: false, rucksack: null, zombie: false, groesse: 1 };
  const ZOMBIE_HAUT = ["#8f9f8c", "#86978a", "#97a08a", "#7f9188"];
  const ZOMBIE_KLEIDUNG = [["#4f4a52", "#2c2b35"], ["#3f4f5c", "#272c38"], ["#5a4048", "#2e2a33"], ["#465345", "#2a2e2c"], ["#5f5a58", "#33313a"], ["#3c4560", "#262a38"]];
  A.zombieFigur = (n) => {
    const k = ZOMBIE_KLEIDUNG[n % ZOMBIE_KLEIDUNG.length];
    const haarStile = ["kurz", "wuschel", "lang", "glatze", "seite", "dutt"];
    const haarFarben = ["#3a3438", "#4a4246", "#5a5048", "#2a262c", "#4f463c"];
    return { ...A.STANDARD, zombie: true, haut: ZOMBIE_HAUT[n % 4], jacke: k[0], hose: k[1], haar: haarStile[(n * 7) % 6], haare: haarFarben[(n * 3) % 5], schuhe: "#1e1f26" };
  };

  // Weiche Verlaufs-Schattierung auf den aktuellen Pfad: Licht von links oben, Schatten rechts unten
  function weich(x0, y0, x1, y1, st = 1) {
    ctx.save(); ctx.clip();
    ctx.fillStyle = A.lgrad(x0, y0, x1, y1, [[0, rgba("#ffffff", 0.10 * st)], [0.45, rgba("#ffffff", 0)], [0.6, rgba(A.SCHATTEN, 0)], [1, rgba(A.SCHATTEN, 0.32 * st)]]);
    ctx.fillRect(Math.min(x0, x1) - 50, Math.min(y0, y1) - 50, Math.abs(x1 - x0) + 100, Math.abs(y1 - y0) + 100);
    ctx.restore();
  }
  A.weich = weich;

  function blinzeln(t, seed) {
    const periode = 3.1 + (seed % 9) * 0.37;
    const ph = (t + seed * 0.913) % periode;
    if (ph < 0.15) return 0.08 + 0.92 * Math.abs(Math.cos((ph / 0.15) * Math.PI));
    return 1;
  }

  // ---------- Haare: eine glatte Kappe, wenige Grundformen ----------
  function haareHinten(f, R) {
    const c = shade(f.haare, -0.1);
    if (f.haar === "lang") { rr(-1.04 * R, -0.3 * R, 2.08 * R, 1.75 * R, 0.9 * R); fill(c); }
    else if (f.haar === "kind") { for (const s of [-1, 1]) circle(s * 1.0 * R, -0.25 * R, 0.3 * R, c); }
    else if (f.haar === "dutt") circle(0, -1.1 * R, 0.34 * R, c);
  }
  function haareVorne(f, R) {
    if (f.haar === "glatze" || f.haar === "keine") {
      if (f.haar === "glatze") for (const s of [-1, 1]) ellipse(s * 0.93 * R, 0.0, 0.14 * R, 0.32 * R, f.haare, s * 0.15);
      return;
    }
    ctx.beginPath();
    if (f.haar === "wuschel") {
      ctx.moveTo(-1.02 * R, 0.0);
      ctx.bezierCurveTo(-1.1 * R, -1.25 * R, -0.5 * R, -1.32 * R, -0.25 * R, -1.18 * R);
      ctx.bezierCurveTo(0.0, -1.38 * R, 0.55 * R, -1.32 * R, 0.62 * R, -1.08 * R);
      ctx.bezierCurveTo(1.05 * R, -1.05 * R, 1.12 * R, -0.5 * R, 1.02 * R, 0.0);
      ctx.quadraticCurveTo(0.6 * R, -0.6 * R, -0.1 * R, -0.52 * R);
      ctx.quadraticCurveTo(-0.75 * R, -0.5 * R, -1.02 * R, 0.0);
    } else if (f.haar === "seite") {
      ctx.moveTo(-1.02 * R, -0.05 * R);
      ctx.bezierCurveTo(-1.08 * R, -1.32 * R, 1.08 * R, -1.32 * R, 1.02 * R, -0.05 * R);
      ctx.quadraticCurveTo(0.85 * R, -0.62 * R, 0.25 * R, -0.66 * R);
      ctx.quadraticCurveTo(-0.6 * R, -0.62 * R, -1.02 * R, -0.05 * R);
    } else if (f.haar === "kurz") {
      ctx.moveTo(-1.02 * R, -0.1 * R);
      ctx.bezierCurveTo(-1.08 * R, -1.3 * R, 1.08 * R, -1.3 * R, 1.02 * R, -0.1 * R);
      ctx.quadraticCurveTo(0.7 * R, -0.62 * R, 0.0, -0.6 * R);
      ctx.quadraticCurveTo(-0.7 * R, -0.62 * R, -1.02 * R, -0.1 * R);
    } else { // lang, kind, dutt: Mittelscheitel
      ctx.moveTo(-1.05 * R, 0.2 * R);
      ctx.bezierCurveTo(-1.1 * R, -1.32 * R, 1.1 * R, -1.32 * R, 1.05 * R, 0.2 * R);
      ctx.quadraticCurveTo(0.8 * R, -0.5 * R, 0.0, -0.62 * R);
      ctx.quadraticCurveTo(-0.8 * R, -0.5 * R, -1.05 * R, 0.2 * R);
    }
    ctx.closePath(); fill(f.haare);
  }

  // ---------- Kopf ----------
  A.kopf = (x, y, R, f, o = {}) => {
    const t = o.t || 0;
    const aus = o.ausdruck || (f.zombie ? "zombie" : "neutral");
    const seed = (o.seed ?? 3) | 0;
    const d = clamp(o.drehung || 0, -1, 1);
    const fx = d * 0.2 * R;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.neigung || 0);
    haareHinten(f, R);
    // Gesicht: ein ruhiges Oval
    ctx.beginPath(); ctx.ellipse(0, 0, R, 1.04 * R, 0, 0, Math.PI * 2); fill(f.haut);
    ctx.beginPath(); ctx.ellipse(0, 0, R, 1.04 * R, 0, 0, Math.PI * 2); weich(-R, -R, R, R, f.zombie ? 1.2 : 1);
    if (f.bart) {
      ctx.beginPath(); ctx.moveTo(-0.92 * R, 0.1 * R);
      ctx.bezierCurveTo(-0.85 * R, 0.95 * R, -0.4 * R, 1.06 * R, fx, 1.06 * R);
      ctx.bezierCurveTo(0.4 * R, 1.06 * R, 0.85 * R, 0.95 * R, 0.92 * R, 0.1 * R);
      ctx.bezierCurveTo(0.6 * R, 0.42 * R, 0.3 * R, 0.4 * R, fx, 0.42 * R);
      ctx.bezierCurveTo(-0.3 * R, 0.4 * R, -0.6 * R, 0.42 * R, -0.92 * R, 0.1 * R); fill(f.bart);
    }
    // Augen: klein und dunkel; bei Schreck weiß mit kleiner Pupille; Zombies: blasses Leuchten
    const bl = blinzeln(t, seed);
    const schreck = aus === "schreck" || aus === "angst";
    const bx = (o.blick || [0, 0])[0] * 0.05 * R + d * 0.06 * R, by = (o.blick || [0, 0])[1] * 0.05 * R;
    for (const s of [-1, 1]) {
      const ex = fx + s * 0.36 * R * (1 - s * d * 0.1), ey = 0.02 * R;
      if (f.zombie) {
        ctx.fillStyle = A.rgrad(ex, ey, 0, 0.22 * R, [[0, "rgba(214,232,200,0.55)"], [1, "rgba(214,232,200,0)"]]);
        ctx.fillRect(ex - 0.22 * R, ey - 0.22 * R, 0.44 * R, 0.44 * R);
        ellipse(ex, ey, 0.085 * R, 0.07 * R, "#dfe9d2");
        continue;
      }
      if (schreck) {
        ellipse(ex, ey, 0.15 * R, 0.18 * R * bl, "#f1efe8");
        if (bl > 0.4) circle(ex + bx * 0.6, ey + by, 0.055 * R, f.augen);
      } else {
        const h = aus === "muede" ? 0.05 : aus === "misstrauisch" ? 0.08 : 0.13;
        ellipse(ex + bx, ey + by, 0.095 * R, Math.max(0.012 * R, h * R * bl), f.augen);
        if (bl > 0.5 && h > 0.1) circle(ex + bx - 0.03 * R, ey + by - 0.045 * R, 0.025 * R, "rgba(255,255,255,0.75)");
      }
      // Augenbrauen nur als zarte Andeutung, wo sie Gefühl tragen
      let rot = 0, hy = -0.3 * R;
      if (aus === "wuetend" || aus === "entschlossen") { rot = s * (aus === "wuetend" ? 0.35 : 0.18); hy += 0.04 * R; }
      if (aus === "traurig" || aus === "angst" || aus === "besorgt") rot = -s * 0.3;
      if (schreck) hy -= 0.06 * R;
      if (aus === "misstrauisch") rot = s === 1 ? -0.22 : 0.22;
      if (rot || schreck) {
        ctx.save(); ctx.translate(ex, ey + hy); ctx.rotate(rot);
        capsule(-0.11 * R, 0, 0.11 * R, 0, 0.032 * R, 0.032 * R);
        fill(rgba(shade(f.haut, -0.55), 0.8)); ctx.restore();
      }
    }
    // Mund: nur, wenn er etwas erzählt
    const mx = fx * 1.1, my = 0.48 * R, mund = shade(f.haut, -0.5);
    const sp = o.spricht ? 0.25 + 0.75 * Math.abs(Math.sin(t * 15.5) * Math.sin(t * 6.1 + 1.3)) : 0;
    if (aus === "zombie") {
      const k = 0.05 + 0.03 * Math.sin(t * 2.3 + seed);
      ellipse(mx, my, 0.14 * R, k * R, "#2a2430");
    } else if (sp > 0) {
      ellipse(mx, my, 0.09 * R + 0.02 * R * sp, 0.03 * R + 0.08 * R * sp, "#3a2630");
    } else if (schreck) {
      ellipse(mx, my + 0.02 * R, 0.07 * R, 0.1 * R, "#3a2630");
    } else if (aus === "froh") {
      ctx.beginPath(); ctx.moveTo(mx - 0.14 * R, my - 0.02 * R); ctx.quadraticCurveTo(mx, my + 0.16 * R, mx + 0.14 * R, my - 0.02 * R); ctx.closePath(); fill("#3a2630");
    } else {
      const k = aus === "traurig" || aus === "besorgt" ? -0.05 : aus === "wuetend" ? -0.03 : 0.02;
      ctx.beginPath(); ctx.moveTo(mx - 0.1 * R, my); ctx.quadraticCurveTo(mx, my + k * R * 2, mx + 0.1 * R, my);
      ctx.strokeStyle = mund; ctx.lineWidth = 0.04 * R; ctx.lineCap = "round"; ctx.stroke();
    }
    haareVorne(f, R);
    if (f.muetze) {
      ctx.beginPath(); ctx.moveTo(-1.08 * R, -0.3 * R);
      ctx.bezierCurveTo(-1.1 * R, -1.45 * R, 1.1 * R, -1.45 * R, 1.08 * R, -0.3 * R); ctx.closePath(); fill(f.muetze);
      A.box(-1.1 * R, -0.46 * R, 2.2 * R, 0.24 * R, 0.12 * R, shade(f.muetze, -0.15));
    }
    if (f.brille) {
      ctx.lineWidth = 0.035 * R; ctx.strokeStyle = rgba(f.brille, 0.85);
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(fx + s * 0.36 * R, 0.02 * R, 0.21 * R, 0.17 * R, 0, 0, Math.PI * 2); ctx.stroke(); }
      A.line(fx - 0.15 * R, 0.0, fx + 0.15 * R, 0.0, 0.035 * R, rgba(f.brille, 0.85));
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
    let fl = [-34, 0], fr = [34, 0], lift = [0, 0];
    if (P.gehen) {
      const sp = P.gehen === 2 ? 11 : P.gehen < 1 ? 4 : 7.5;
      const w = t * sp + ph;
      fl[0] += Math.sin(w) * 16 * P.gehen; fr[0] -= Math.sin(w) * 16 * P.gehen;
      lift = [Math.max(0, Math.cos(w)) * 22 * Math.min(P.gehen, 1.4), Math.max(0, -Math.cos(w)) * 22 * Math.min(P.gehen, 1.4)];
      bob = -Math.abs(Math.sin(w)) * 10 * Math.min(P.gehen, 1.5);
      if (!f.zombie) { P.hl = [-100, -215 + Math.cos(w) * 22]; P.hr = [100, -215 - Math.cos(w) * 22]; }
    }
    ctx.save(); ctx.translate(x, y); ctx.scale((o.spiegeln ? -s : s) * (f.groesse || 1), s * (f.groesse || 1));
    ellipse(0, -2, 95, 14, rgba(A.SCHATTEN, 0.3));
    ctx.rotate(P.lean);
    // Beine: schlichte Kapseln, Füße als dunkle Ovale
    for (const [i, side] of [[0, -1], [1, 1]]) {
      const ft = i ? fr : fl, hy = -200 + bob * 0.3, l = lift[i];
      capsule(side * 30, hy, ft[0], -22 - l, 26, 21); fill(i ? shade(f.hose, -0.12) : f.hose);
      ellipse(ft[0] + side * 6, -14 - l, 32, 15, f.schuhe);
    }
    ctx.translate(0, bob);
    if (f.rucksack) A.box(-78, -376, 156, 182, 44, shade(f.rucksack, -0.2));
    // Körper: ein weicher, nach unten leicht breiterer Block
    const torso = () => {
      ctx.beginPath(); ctx.moveTo(-62, -388);
      ctx.bezierCurveTo(-92, -380, -88, -250, -80, -186);
      ctx.quadraticCurveTo(0, -172, 80, -186);
      ctx.bezierCurveTo(88, -250, 92, -380, 62, -388);
      ctx.quadraticCurveTo(0, -402, -62, -388); ctx.closePath();
    };
    torso(); fill(f.jacke); torso(); weich(-90, -400, 90, -180);
    if (f.zombie) { ellipse(26, -292, 18, 12, rgba("#1e1820", 0.28), 0.4); ellipse(-34, -236, 12, 8, rgba("#1e1820", 0.22)); }
    if (f.kapuze) { ctx.beginPath(); ctx.ellipse(0, -386, 58, 20, 0, 0, Math.PI * 2); fill(shade(f.jacke, -0.18)); }
    if (f.rucksack) for (const sx of [-1, 1]) A.box(sx * 46 - 8, -384, 16, 150, 8, shade(f.rucksack, 0.05));
    A.kopf(0, -500, 104, f, { t, ausdruck: o.ausdruck, spricht: o.spricht, blick: o.blick, drehung: o.drehung, neigung: P.neig + (o.neigung || 0), seed: o.seed ?? Math.round(ph * 10) });
    // Arme
    const sch = [[-66, -356], [66, -356]];
    const haende = [P.hl, P.hr];
    for (const i of [0, 1]) {
      const [sx, sy] = sch[i];
      const [tx, ty] = [haende[i][0], haende[i][1] - bob];
      let a = A.ik(sx, sy, tx, ty, 100, 94, 1), b = A.ik(sx, sy, tx, ty, 100, 94, -1);
      const k = (i === 0 ? a.ex < b.ex : a.ex > b.ex) ? a : b;
      const arm = shade(f.jacke, i ? -0.14 : -0.06);
      capsule(sx, sy, k.ex, k.ey, 21, 18); fill(arm);
      capsule(k.ex, k.ey, k.hx, k.hy, 18, 15); fill(arm);
      circle(k.hx, k.hy, 16, shade(f.haut, i ? -0.08 : 0));
      if (o.pose === "taschenlampe" && i === 1) {
        ctx.save(); ctx.translate(k.hx, k.hy); A.box(-9, -40, 18, 58, 8, "#2a2d36"); ctx.restore();
        A.licht(k.hx, k.hy - 80, 520, "#f3e6c4", 1.2);
      }
      if (o.halt && i === 1) A.objekt(o.halt, k.hx, k.hy - 10, 0.55, t);
    }
    ctx.restore();
  };

  // Figuren zusätzlich in die Maske zeichnen (siehe A.maskeZeichnen)
  const figurRoh = A.figur, kopfRoh = A.kopf;
  A.figur = (...a) => { figurRoh(...a); A.maskeZeichnen(() => figurRoh(...a)); };
  A.kopf = (...a) => { kopfRoh(...a); A.maskeZeichnen(() => kopfRoh(...a)); };
})();
