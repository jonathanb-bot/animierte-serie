/* Animations-Engine für die Serie.
 * Alles wird deterministisch aus der Zeit t gezeichnet: zeichne(t) -> ein Frame.
 * Daten kommen von render.mjs über window.init(daten).
 */
(() => {
  const cv = document.getElementById("c");
  const ctx = cv.getContext("2d");
  let D = null, W = 1080, H = 1920;

  // ---------- Hilfen ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, p) => a + (b - a) * p;
  const E = {
    linear: p => p,
    sanft: p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    raus: p => 1 - Math.pow(1 - p, 3),
    rein: p => p * p * p,
    pop: p => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
  };
  function rnd(seed) { // deterministischer Zufall
    let s = seed >>> 0 || 1;
    return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
  }
  function rr(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function fill(c) { ctx.fillStyle = c; ctx.fill(); }
  function circle(x, y, r, c) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); fill(c); }
  function ellipse(x, y, rx, ry, c, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(rx, 0.1), Math.max(ry, 0.1), rot, 0, Math.PI * 2); fill(c); }
  function shade(hex, f) { // f<0 dunkler, f>0 heller
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const t = f < 0 ? 0 : 255, a = Math.abs(f);
    r = Math.round(lerp(r, t, a)); g = Math.round(lerp(g, t, a)); b = Math.round(lerp(b, t, a));
    return `rgb(${r},${g},${b})`;
  }

  // ---------- Figuren ----------
  const STANDARD_FIGUR = { haut: "#f1cfb1", haare: "#3b2a22", jacke: "#4f6d8a", hose: "#2d3340", schuhe: "#1d1f24", typ: "junge", muetze: null, bart: null, augen: "#2a2a2a" };
  function fig(name) { return Object.assign({}, STANDARD_FIGUR, (D.figuren || {})[name] || {}); }

  function blinzeln(t, seed) {
    const periode = 3.3 + (seed % 7) * 0.31;
    const ph = (t + seed * 0.77) % periode;
    return ph < 0.13 ? Math.abs(Math.cos((ph / 0.13) * Math.PI)) * 0.9 + 0.1 : 1;
  }

  // Kopf: Mittelpunkt (x,y), Radius R
  function kopf(x, y, R, f, o) {
    const t = o.t || 0, aus = o.ausdruck || "neutral";
    const seed = (f.typ.length * 13 + (f.haare.charCodeAt(2) || 1)) | 0;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(o.neigung || 0);
    // Haare hinten (lang)
    if (f.typ === "maedchen") { rr(-R * 1.08, -R * 0.55, R * 2.16, R * 1.95, R * 0.7); fill(shade(f.haare, -0.1)); }
    // Ohren
    circle(-R * 0.98, R * 0.08, R * 0.2, shade(f.haut, -0.06));
    circle(R * 0.98, R * 0.08, R * 0.2, shade(f.haut, -0.06));
    // Gesicht
    ellipse(0, 0, R, R * 1.05, f.haut);
    ellipse(0, R * 0.75, R * 0.62, R * 0.22, shade(f.haut, -0.05)); // Kinnschatten leicht
    ellipse(0, R * 0.6, R * 0.7, R * 0.3, f.haut);
    // Bart
    if (f.bart) {
      ctx.beginPath(); ctx.moveTo(-R * 0.92, R * 0.05);
      ctx.quadraticCurveTo(-R * 0.85, R * 1.25, 0, R * 1.2); ctx.quadraticCurveTo(R * 0.85, R * 1.25, R * 0.92, R * 0.05);
      ctx.quadraticCurveTo(R * 0.6, R * 0.55, 0, R * 0.5); ctx.quadraticCurveTo(-R * 0.6, R * 0.55, -R * 0.92, R * 0.05); fill(f.bart);
    }
    // Wangen
    ellipse(-R * 0.55, R * 0.33, R * 0.14, R * 0.08, "rgba(230,120,110,0.35)");
    ellipse(R * 0.55, R * 0.33, R * 0.14, R * 0.08, "rgba(230,120,110,0.35)");
    // Augen
    const bl = blinzeln(t, seed) * (aus === "muede" ? 0.45 : 1);
    const gross = aus === "schreck" ? 1.18 : 1;
    const bx = (o.blick || [0, 0])[0] * R * 0.07, by = (o.blick || [0, 0])[1] * R * 0.07;
    for (const s of [-1, 1]) {
      const ex = s * R * 0.37, ey = -R * 0.02;
      ellipse(ex, ey, R * 0.2 * gross, R * 0.25 * gross * bl, "#fbfbf7");
      if (bl > 0.3) {
        ellipse(ex + bx, ey + by + R * 0.02, R * 0.1 * (aus === "schreck" ? 0.8 : 1), R * 0.12 * bl * (aus === "schreck" ? 0.8 : 1), f.augen);
        circle(ex + bx - R * 0.035, ey + by - R * 0.03, R * 0.03, "#fff");
      }
      // Augenbrauen
      ctx.save(); ctx.translate(ex, ey - R * 0.36 * gross - (aus === "schreck" ? R * 0.08 : 0));
      let rot = 0;
      if (aus === "wuetend") rot = s * 0.32; else if (aus === "traurig" || aus === "angst") rot = -s * 0.28;
      ctx.rotate(rot); rr(-R * 0.2, -R * 0.045, R * 0.4, R * 0.09, R * 0.045); fill(shade(f.haare, -0.15)); ctx.restore();
    }
    // Nase
    ctx.beginPath(); ctx.arc(0, R * 0.22, R * 0.08, 0.15 * Math.PI, 0.85 * Math.PI); ctx.strokeStyle = shade(f.haut, -0.22); ctx.lineWidth = R * 0.035; ctx.lineCap = "round"; ctx.stroke();
    // Mund
    const mund = shade(f.haut, -0.55);
    const sp = o.spricht ? (0.35 + 0.65 * Math.abs(Math.sin(t * 17) * Math.sin(t * 7.3 + 1))) : 0;
    if (aus === "schreck" || aus === "angst") {
      ellipse(0, R * 0.55, R * 0.13, R * (0.15 + sp * 0.05), mund);
    } else if (sp > 0) {
      ellipse(0, R * 0.52, R * 0.16, R * 0.03 + R * 0.12 * sp, mund);
      if (sp > 0.5) ellipse(0, R * 0.52 + R * 0.06 * sp, R * 0.08, R * 0.03 * sp, "#d9706b");
    } else {
      ctx.beginPath();
      const k = aus === "froh" ? 0.12 : aus === "traurig" ? -0.1 : 0.02;
      ctx.moveTo(-R * 0.17, R * 0.52); ctx.quadraticCurveTo(0, R * (0.52 + k), R * 0.17, R * 0.52);
      ctx.strokeStyle = mund; ctx.lineWidth = R * 0.05; ctx.stroke();
    }
    // Haare vorne
    ctx.fillStyle = f.haare;
    if (f.typ === "junge") {
      ctx.beginPath(); ctx.moveTo(-R * 1.0, -R * 0.1);
      ctx.bezierCurveTo(-R * 1.15, -R * 1.5, R * 1.15, -R * 1.5, R * 1.0, -R * 0.1);
      ctx.lineTo(R * 0.75, -R * 0.45); ctx.lineTo(R * 0.45, -R * 0.38); ctx.lineTo(R * 0.25, -R * 0.62);
      ctx.lineTo(0, -R * 0.42); ctx.lineTo(-R * 0.3, -R * 0.6); ctx.lineTo(-R * 0.55, -R * 0.4); ctx.lineTo(-R * 0.8, -R * 0.5); ctx.closePath(); ctx.fill();
    } else if (f.typ === "maedchen") {
      ctx.beginPath(); ctx.moveTo(-R * 1.05, R * 0.2);
      ctx.bezierCurveTo(-R * 1.15, -R * 1.25, R * 1.15, -R * 1.25, R * 1.05, R * 0.2);
      ctx.quadraticCurveTo(R * 0.7, -R * 0.55, -R * 0.1, -R * 0.5); ctx.quadraticCurveTo(-R * 0.8, -R * 0.45, -R * 1.05, R * 0.2); ctx.fill();
    } else if (f.typ === "mann") {
      ctx.beginPath(); ctx.moveTo(-R * 0.98, -R * 0.15);
      ctx.bezierCurveTo(-R * 1.05, -R * 1.45, R * 1.05, -R * 1.45, R * 0.98, -R * 0.15);
      ctx.quadraticCurveTo(R * 0.6, -R * 0.6, 0, -R * 0.62); ctx.quadraticCurveTo(-R * 0.6, -R * 0.6, -R * 0.98, -R * 0.15); ctx.fill();
    } else if (f.typ === "glatze") {
      ellipse(-R * 0.5, -R * 0.75, R * 0.3, R * 0.1, "rgba(255,255,255,0.25)", -0.5);
    }
    // Mütze
    if (f.muetze) {
      ctx.beginPath(); ctx.moveTo(-R * 1.08, -R * 0.2);
      ctx.bezierCurveTo(-R * 1.1, -R * 1.45, R * 1.1, -R * 1.45, R * 1.08, -R * 0.2); ctx.closePath(); fill(f.muetze);
      rr(-R * 1.12, -R * 0.42, R * 2.24, R * 0.3, R * 0.15); fill(shade(f.muetze, -0.15));
    }
    ctx.restore();
  }

  // Ganze Figur: Füße bei (x, y), Höhe ca. 520*s
  function figur(x, y, s, f, o) {
    const t = o.t || 0;
    const atem = Math.sin(t * 2.2 + x) * 3 * s;
    const geste = o.geste || "steht";
    ctx.save(); ctx.translate(x, y); ctx.scale(o.spiegeln ? -s : s, s);
    // Schatten
    ellipse(0, 0, 95, 16, "rgba(0,0,0,0.25)");
    // Beine
    rr(-48, -175, 42, 170, 18); fill(f.hose);
    rr(6, -175, 42, 170, 18); fill(shade(f.hose, -0.08));
    rr(-58, -22, 58, 24, 12); fill(f.schuhe); rr(2, -22, 58, 24, 12); fill(f.schuhe);
    // Arme hinten
    const armL = geste === "winkt" ? -2.4 + Math.sin(t * 9) * 0.35 : geste === "zeigt" ? -1.45 : 0.08 + Math.sin(t * 1.7) * 0.03;
    const armR = geste === "haende_hoch" ? 2.5 : -0.08 - Math.sin(t * 1.7 + 1) * 0.03;
    const arm = (ax, ang) => {
      ctx.save(); ctx.translate(ax, -370 + atem); ctx.rotate(ang);
      rr(-21, -10, 42, 175, 20); fill(shade(f.jacke, -0.12));
      circle(0, 172, 20, f.haut); ctx.restore();
    };
    arm(-88, armL); arm(88, geste === "haende_hoch" ? -armR : armR);
    // Körper / Jacke
    rr(-92, -400 + atem, 184, 245, 50); fill(f.jacke);
    ctx.fillStyle = shade(f.jacke, -0.18); ctx.fillRect(-3, -385 + atem, 6, 225);
    rr(-92, -190 + atem, 184, 30, 12); fill(shade(f.jacke, -0.1));
    // Kragen
    rr(-55, -410 + atem, 110, 34, 16); fill(shade(f.jacke, -0.08));
    // Kopf
    kopf(0, -500 + atem * 1.2, 105, f, o);
    ctx.restore();
  }

  // ---------- Partikel ----------
  function partikel(art, t, staerke = 1) {
    const r = rnd(art === "staub" ? 11 : art === "asche" ? 23 : 37);
    const n = Math.round((art === "staub" ? 45 : 80) * staerke);
    for (let i = 0; i < n; i++) {
      const x0 = r() * W, y0 = r() * H, sp = 0.4 + r(), gr = 2 + r() * (art === "staub" ? 5 : 6);
      let x, y, c;
      if (art === "staub") {
        x = (x0 + Math.sin(t * 0.5 * sp + i) * 40 + t * 12 * sp) % W; y = (y0 + Math.cos(t * 0.4 * sp + i) * 30 - t * 8 * sp + H) % H;
        c = `rgba(255,250,235,${0.12 + 0.25 * r()})`;
      } else if (art === "asche") {
        x = (x0 + Math.sin(t * sp + i) * 30 + W) % W; y = (y0 + t * 70 * sp) % H; c = `rgba(70,70,75,${0.4 + 0.4 * r()})`;
      } else { // schnee
        x = (x0 + Math.sin(t * sp + i) * 35 + W) % W; y = (y0 + t * 110 * sp) % H; c = `rgba(255,255,255,${0.5 + 0.4 * r()})`;
      }
      circle(x, y, gr, c);
    }
  }

  // ---------- Hintergründe / Szenen ----------
  function wand(farbe = "#8f9a96") {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, shade(farbe, 0.08)); g.addColorStop(1, shade(farbe, -0.25));
    ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
    // Betonplatten
    ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.lineWidth = 4;
    for (let y = -H; y < H * 2; y += 360) { ctx.beginPath(); ctx.moveTo(-W, y); ctx.lineTo(W * 2, y); ctx.stroke(); }
    for (let x = -W; x < W * 2; x += 540) { ctx.beginPath(); ctx.moveTo(x, -H); ctx.lineTo(x, H * 2); ctx.stroke(); }
    // Rohre
    rr(-W, 260, W * 3, 34, 17); fill("#6b706f"); rr(-W, 312, W * 3, 22, 11); fill("#5c615f");
    for (let x = 80; x < W; x += 420) { rr(x, 248, 26, 58, 6); fill("#55595a"); }
  }

  function raumDeko(t, s) {
    // Regal links, Lampe oben
    rr(40, 900, 300, 26, 6); fill("#5d4a3a"); rr(40, 1150, 300, 26, 6); fill("#5d4a3a");
    const kisten = ["#b8504a", "#d9a441", "#4f7d5c", "#4a6c9b", "#c7c2b5"];
    for (let i = 0; i < 5; i++) { rr(55 + i * 56, 820 - (i % 2) * 20, 48, 80 + (i % 2) * 20, 6); fill(kisten[i]); }
    for (let i = 0; i < 4; i++) { rr(60 + i * 70, 1060, 60, 90, 8); fill(kisten[(i + 2) % 5]); }
    const an = s.alarm ? (Math.sin(t * 6) > 0 ? 1 : 0.3) : 1;
    rr(W / 2 - 60, 120, 120, 30, 10); fill("#3b3f40");
    ellipse(W / 2, 160, 70, 18, s.alarm ? `rgba(255,70,50,${an})` : "rgba(255,240,190,0.95)");
    const g = ctx.createRadialGradient(W / 2, 170, 10, W / 2, 400, 700);
    g.addColorStop(0, s.alarm ? `rgba(255,60,40,${0.35 * an})` : "rgba(255,240,190,0.28)"); g.addColorStop(1, "rgba(255,240,190,0)");
    ctx.fillStyle = g; ctx.fillRect(-W, 0, W * 3, H * 1.5);
  }

  const SZENEN = {
    gesicht(s, t, p) {
      wand(s.wand);
      const f = fig(s.figur);
      const bob = Math.sin(t * 1.6) * 8;
      // Hals + Schultern
      rr(W / 2 - 110, 1080 + bob, 220, 220, 40); fill(shade(f.haut, -0.12));
      rr(W / 2 - 420, 1250 + bob, 840, 900, 220); fill(f.jacke);
      rr(W / 2 - 200, 1215 + bob, 400, 90, 40); fill(shade(f.jacke, -0.08));
      kopf(W / 2, 880 + bob, 300, f, { t, ausdruck: s.ausdruck, spricht: s._spricht, blick: s.blick, neigung: Math.sin(t * 0.9) * 0.03 });
    },

    figur(s, t, p) {
      wand(s.wand || "#9aa39c");
      raumDeko(t, s);
      ctx.fillStyle = "#4b4f4c"; ctx.fillRect(-W, 1500, W * 3, H);
      ctx.fillStyle = "#5a5f5b"; ctx.fillRect(-W, 1500, W * 3, 18);
      const liste = s.figuren || [s.figur];
      liste.forEach((n, i) => {
        const x = liste.length === 1 ? W / 2 : 260 + i * (560 / Math.max(1, liste.length - 1));
        const spricht = s._spricht && (s.sprecher ? s.sprecher === n : i === 0);
        figur(x, 1560, liste.length === 1 ? 1.45 : 1.0, fig(n), { t: t + i, ausdruck: (s.ausdruecke || {})[n] || s.ausdruck, spricht, geste: (s.gesten || {})[n] || s.geste, spiegeln: i > 0 && i === liste.length - 1 });
      });
    },

    schnitt(s, t, p) { // Querschnitt Erde + Bunker
      const tag = s.himmel !== "nacht";
      const g = ctx.createLinearGradient(0, -400, 0, 300);
      g.addColorStop(0, tag ? "#7fb6d9" : "#0f1730"); g.addColorStop(1, tag ? "#cfe6ef" : "#28345a");
      ctx.fillStyle = g; ctx.fillRect(-W, -2000, W * 3, 2300);
      // Bäume Silhouette
      ctx.fillStyle = tag ? "#3f6b45" : "#1a2a26";
      for (let i = -3; i < 14; i++) { const x = i * 110; ctx.beginPath(); ctx.moveTo(x, 300); ctx.lineTo(x + 55, 300 - 120 - (i % 3) * 40); ctx.lineTo(x + 110, 300); ctx.fill(); }
      // Erde
      ctx.fillStyle = "#7a5233"; ctx.fillRect(-W, 290, W * 3, 2600);
      ctx.fillStyle = "#6a4528"; ctx.fillRect(-W, 900, W * 3, 2000);
      ctx.fillStyle = tag ? "#5f9a4f" : "#2e4a33"; ctx.fillRect(-W, 280, W * 3, 28);
      const r = rnd(5);
      for (let i = 0; i < 120; i++) ellipse(-W + r() * W * 3, 330 + r() * 2200, 6 + r() * 14, 4 + r() * 8, "rgba(50,30,15,0.35)");
      // Luftrohr
      rr(830, 170, 40, 1080, 10); fill("#8b9294"); rr(805, 150, 90, 50, 12); fill("#6f7678");
      // Schacht mit Leiter
      rr(470, 250, 140, 1000, 6); fill("#3a2f28");
      rr(458, 262, 164, 24, 8); fill("#565b5c");
      for (const x of [492, 572]) { ctx.fillStyle = "#9aa0a3"; ctx.fillRect(x, 300, 10, 950); }
      for (let y = 330; y < 1240; y += 46) { ctx.fillStyle = "#b8bec1"; ctx.fillRect(492, y, 90, 8); }
      // Bunker
      rr(110, 1230, 860, 560, 24); fill("#505754");
      rr(135, 1255, 810, 510, 14); fill("#8fa198");
      ctx.fillStyle = "#7b8b83"; ctx.fillRect(135, 1640, 810, 125);
      // Deko im Bunker
      const k = ["#b8504a", "#d9a441", "#4a6c9b", "#4f7d5c"];
      for (let i = 0; i < 6; i++) { rr(760 + (i % 3) * 58, 1560 - Math.floor(i / 3) * 70, 50, 62, 6); fill(k[i % 4]); }
      rr(170, 1300, 180, 110, 10); fill("#6a7470"); rr(185, 1315, 150, 80, 6); fill("#3d5148");
      ellipse(540, 1290, 60, 14, s.alarm && Math.sin(t * 6) > 0 ? "#ff4a3a" : "#fff1c4");
      // Kleine Figuren im Bunker
      const liste = s.figuren || [];
      liste.forEach((n, i) => figur(260 + i * 120, 1700, 0.32, fig(n), { t: t + i * 1.3 }));
      // Jemand im Schacht?
      if (s.im_schacht) figur(537, 520 + Math.sin(t * 2) * 6, 0.3, fig(s.im_schacht), { t, geste: "haende_hoch" });
      // Luft-Pfeile
      if (s.luft) {
        for (let i = 0; i < 4; i++) {
          const yy = 220 + ((t * 260 + i * 260) % 1000);
          ctx.globalAlpha = 0.7; ctx.fillStyle = "#cdeffd";
          ctx.beginPath(); ctx.moveTo(850, yy + 26); ctx.lineTo(836, yy); ctx.lineTo(864, yy); ctx.fill(); ctx.globalAlpha = 1;
        }
      }
    },

    luke(s, t, p) { // Blick durch die runde Luke nach oben
      ctx.fillStyle = "#16181b"; ctx.fillRect(-W, -H, W * 3, H * 3);
      const cx = W / 2, cy = 820, R = 420;
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      const g = ctx.createRadialGradient(cx, cy - 50, 20, cx, cy, R);
      g.addColorStop(0, "#9a9e9b"); g.addColorStop(1, "#2e3230"); ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      // Leiterholme laufen nach oben zusammen
      ctx.strokeStyle = "#c9ced0"; ctx.lineWidth = 16;
      for (const s2 of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + s2 * 150, cy + R); ctx.lineTo(cx + s2 * 30, cy - R); ctx.stroke(); }
      for (let i = 0; i < 9; i++) { const q = i / 9, y = cy + R - q * q * R * 2 + 30, w = lerp(150, 35, q); ctx.lineWidth = lerp(14, 4, q); ctx.beginPath(); ctx.moveTo(cx - w, y); ctx.lineTo(cx + w, y); ctx.stroke(); }
      // Schuhe von oben (jemand steckt fest)
      if (s.schuhe !== false) {
        const zap = Math.sin(t * 5) * (s.zappeln ? 14 : 2);
        const sf = fig(s.figur || "fremder");
        for (const sx of [-1, 1]) {
          ctx.save(); ctx.translate(cx + sx * 55 + (sx > 0 ? zap : -zap), cy - 120); ctx.rotate(sx * 0.08);
          ellipse(0, 0, 50, 85, sf.schuhe); ellipse(0, 10, 34, 60, shade(sf.schuhe, 0.12));
          ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 6;
          for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(-28, 10 + k * 18); ctx.lineTo(28, 10 + k * 18); ctx.stroke(); }
          ctx.restore();
        }
      }
      ctx.restore();
      // Rahmen
      ctx.lineWidth = 70; ctx.strokeStyle = "#5b605e"; ctx.beginPath(); ctx.arc(cx, cy, R + 30, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 14; ctx.strokeStyle = "#3b3f3e"; ctx.beginPath(); ctx.arc(cx, cy, R + 64, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; circle(cx + Math.cos(a) * (R + 30), cy + Math.sin(a) * (R + 30), 10, "#7c8280"); }
    },

    titel(s, t, p) {
      const g = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, H * 0.7);
      g.addColorStop(0, s.farbe || "#3a1210"); g.addColorStop(1, "#060606");
      ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
      const sc = 0.7 + 0.3 * E.pop(clamp(t / 0.45, 0, 1));
      const z = Math.sin(t * 40) * (t < 0.6 ? 10 : 2);
      ctx.save(); ctx.translate(W / 2 + z, H * 0.42); ctx.scale(sc, sc);
      ctx.font = `900 ${s.groesse || 190}px Titel`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255,40,30,0.5)"; ctx.fillText(s.gross, 8, 4);
      ctx.fillStyle = "rgba(40,200,255,0.35)"; ctx.fillText(s.gross, -8, -4);
      ctx.fillStyle = s.textfarbe || "#ffe1c9"; ctx.fillText(s.gross, 0, 0);
      ctx.restore();
    },
  };

  // ---------- Overlays ----------
  function hud(h, t) {
    if (!h) return;
    ctx.save(); ctx.translate(60, 150);
    rr(0, 0, 370, 120, 18); fill("rgba(25,28,30,0.72)");
    ctx.font = "700 40px HUD"; ctx.textBaseline = "middle"; ctx.fillStyle = "#ffd36b";
    circle(38, 37, 9, "#ffd36b"); ctx.strokeStyle = "#ffd36b"; ctx.lineWidth = 3.5; ctx.lineCap = "round";
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(38 + Math.cos(a) * 13, 37 + Math.sin(a) * 13); ctx.lineTo(38 + Math.cos(a) * 18, 37 + Math.sin(a) * 18); ctx.stroke(); }
    ctx.fillStyle = "#fff";
    const tg = `TAG ${h.tag}`; ctx.fillText(tg, 64, 38);
    const xs = 64 + ctx.measureText(tg).width + 14;
    ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fillText("|", xs, 36); ctx.fillStyle = "#fff";
    ctx.fillText(h.zeit || "", xs + 24, 38);
    ctx.font = "700 30px HUD"; ctx.fillText("CO₂", 22, 88);
    rr(92, 78, 140, 20, 10); fill("rgba(255,255,255,0.2)");
    const co2 = h.co2 || 0, ant = clamp(co2 / 5, 0.03, 1);
    rr(92, 78, 140 * ant, 20, 10); fill(co2 > 3 ? "#ff5a4a" : co2 > 1.5 ? "#ffb347" : "#ffd36b");
    ctx.fillText(`${co2.toFixed(1).replace(".", ",")} %`, 246, 89);
    ctx.restore();
  }

  function untertitel(s, t) {
    const ws = s.woerter || [];
    if (!ws.length) return;
    // aktuelle Gruppe
    let g = null;
    for (const grp of s._gruppen) if (t >= grp.start && t < grp.ende) g = grp;
    if (!g) return;
    const fs = 82;
    ctx.save();
    ctx.font = `900 ${fs}px Titel`; ctx.textBaseline = "middle";
    const sx = 0.86; // schmaler (condensed-Look)
    const leer = fs * 0.36;
    const breiten = g.woerter.map(w => ctx.measureText(w.w.toUpperCase()).width * sx);
    const gesamt = breiten.reduce((a, b) => a + b, 0) + leer * (g.woerter.length - 1);
    const y = D.untertitel_y || 1360;
    const pop = E.pop(clamp((t - g.start) / 0.18, 0, 1));
    ctx.translate(W / 2, y); ctx.scale(0.85 + 0.15 * pop, 0.85 + 0.15 * pop);
    rr(-gesamt / 2 - 28, -fs * 0.72, gesamt + 56, fs * 1.44, 14); fill("rgba(22,24,28,0.62)");
    let x = -gesamt / 2;
    g.woerter.forEach((w, i) => {
      const aktiv = t >= w.start;
      const jetzt = t >= w.start && t < w.ende;
      ctx.save(); ctx.translate(x + breiten[i] / 2, 0);
      if (jetzt) ctx.scale(1.06, 1.06);
      ctx.scale(sx, 1); ctx.textAlign = "center";
      const txt = w.w.toUpperCase();
      ctx.lineWidth = 12; ctx.strokeStyle = "rgba(0,0,0,0.85)"; ctx.lineJoin = "round"; ctx.strokeText(txt, 0, 4);
      ctx.fillStyle = w.key ? (aktiv ? "#ffcf3d" : "#f5f1e8") : jetzt ? "#ffcf3d" : "#f5f1e8";
      if (w.key && aktiv && w.farbe) ctx.fillStyle = w.farbe;
      ctx.fillText(txt, 0, 4);
      if (w.key && aktiv) { ctx.fillStyle = ctx.fillStyle; ctx.fillRect(-breiten[i] / sx / 2, fs * 0.48, breiten[i] / sx, 7); }
      ctx.restore();
      x += breiten[i] + leer;
    });
    ctx.restore();
  }

  function kamera(s, p, t) {
    const k = s.kamera || {};
    const von = Object.assign({ zoom: 1, x: W / 2, y: H / 2 }, k.von || {});
    const bis = Object.assign({}, von, k.bis || {});
    const e = E[k.kurve || "sanft"](p);
    let z = lerp(von.zoom, bis.zoom, e), x = lerp(von.x, bis.x, e), y = lerp(von.y, bis.y, e);
    // Einstiegs-Punch
    if (s.punch !== false && D.punch !== false) z *= 1 + 0.06 * (1 - E.raus(clamp(t / 0.35, 0, 1)));
    let wx = 0, wy = 0;
    const wack = s.wackeln || 0;
    if (wack) { wx = (Math.sin(t * 53) + Math.sin(t * 31)) * 6 * wack; wy = (Math.cos(t * 47) + Math.sin(t * 29)) * 6 * wack; }
    ctx.translate(W / 2 + wx, H / 2 + wy); ctx.scale(z, z); ctx.translate(-x, -y);
  }

  function vignette(st = 0.55) {
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.75);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(0,0,0,${st})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  // ---------- Öffentliche API ----------
  window.init = (daten) => {
    D = daten; W = D.W || 1080; H = D.H || 1920; cv.width = W; cv.height = H;
    // Untertitel-Gruppen vorberechnen (max. 3 Wörter / 20 Zeichen)
    for (const s of D.szenen) {
      s._gruppen = [];
      let cur = [];
      const push = () => { if (cur.length) s._gruppen.push({ woerter: cur, start: cur[0].start, ende: cur[cur.length - 1].ende }); cur = []; };
      for (const w of s.woerter || []) {
        const len = cur.reduce((a, b) => a + b.w.length + 1, 0) + w.w.length;
        if (cur.length >= 3 || (cur.length && len > 20)) push();
        cur.push(w);
        if (/[.!?…,:]$/.test(w.w)) push();
      }
      push();
      // Lücken schließen: Gruppe bleibt stehen bis zur nächsten
      for (let i = 0; i < s._gruppen.length - 1; i++) s._gruppen[i].ende = s._gruppen[i + 1].start;
      if (s._gruppen.length) s._gruppen[s._gruppen.length - 1].ende = s.dauer;
    }
    return true;
  };

  window.zeichne = (T) => {
    let s = D.szenen[D.szenen.length - 1];
    for (const sz of D.szenen) if (T >= sz.start && T < sz.start + sz.dauer) { s = sz; break; }
    const t = T - s.start, p = clamp(t / s.dauer, 0, 1);
    s._spricht = (s.woerter || []).some(w => t >= w.start && t < w.ende);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
    ctx.save();
    kamera(s, p, t);
    (SZENEN[s.typ] || SZENEN.titel)(s, t, p);
    ctx.restore();
    if (s.partikel) partikel(s.partikel, T, s.partikel_staerke || 1);
    if (s.tint) { ctx.fillStyle = s.tint; ctx.globalAlpha = s.tint_staerke || 0.35; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    if (s.alarm) { ctx.fillStyle = `rgba(255,30,20,${0.12 + 0.12 * Math.sin(T * 6)})`; ctx.fillRect(0, 0, W, H); }
    vignette(s.vignette ?? 0.55);
    hud(s.hud, t);
    untertitel(s, t);
    if (s.blitz && t < 0.25) { ctx.fillStyle = `rgba(255,255,255,${1 - t / 0.25})`; ctx.fillRect(0, 0, W, H); }
    // Weiche Blende am Anfang/Ende der Folge
    const ges = D.dauer;
    const b = Math.max(clamp(1 - T / 0.4, 0, 1), clamp((T - (ges - 0.6)) / 0.6, 0, 1));
    if (b > 0) { ctx.fillStyle = `rgba(0,0,0,${b})`; ctx.fillRect(0, 0, W, H); }
    if (s.uebergang === "blende" && t < 0.3) { ctx.fillStyle = `rgba(0,0,0,${1 - t / 0.3})`; ctx.fillRect(0, 0, W, H); }
  };
})();
