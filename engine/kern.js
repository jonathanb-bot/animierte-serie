/* Grundwerkzeuge: Zeichnen, Farben, Easing, Zufall, IK, Licht */
const A = (window.A = {});
A.cv = document.getElementById("c");
A.ctx = A.cv.getContext("2d");
A.W = 1080; A.H = 1920;
let ctx = A.ctx;
// Zeichnen in eine andere Leinwand umleiten (z.B. für unscharfen Hintergrund)
A.umleiten = (c2, fn) => { const alt = ctx; ctx = c2; try { fn(); } finally { ctx = alt; } };
// Maske der Figuren: der Farblook dunkelt dort kaum ab, damit Figuren warm vor dem dunklen Hintergrund stehen
A.maske = document.createElement("canvas"); A.maske.width = A.W; A.maske.height = A.H;
A.mctx = A.maske.getContext("2d", { willReadFrequently: true });
A.inMaske = false;
A.maskeZeichnen = fn => {
  if (A.inMaske || ctx !== A.ctx) return; // nicht doppelt und nicht in Hilfsleinwände (z. B. unscharfer Hintergrund)
  A.inMaske = true; A.mctx.setTransform(ctx.getTransform());
  try { A.umleiten(A.mctx, fn); } finally { A.inMaske = false; }
};

A.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
A.lerp = (a, b, p) => a + (b - a) * p;
A.E = {
  linear: p => p,
  sanft: p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  weich: p => 0.5 - Math.cos(p * Math.PI) / 2,
  raus: p => 1 - Math.pow(1 - p, 3),
  rein: p => p * p * p,
  pop: p => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
};
A.rnd = seed => { let s = (seed * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 1000003) / 1000003; }; };

// ---- Farben ----
const hx = h => { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map(c => c + c).join(""); const n = parseInt(h, 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const toHex = (r, g, b) => "#" + [r, g, b].map(v => Math.round(A.clamp(v, 0, 255)).toString(16).padStart(2, "0")).join("");
A.mix = (a, b, p) => { const x = hx(a), y = hx(b); return toHex(A.lerp(x[0], y[0], p), A.lerp(x[1], y[1], p), A.lerp(x[2], y[2], p)); };
A.shade = (h, f) => (f < 0 ? A.mix(h, "#14182a", -f) : A.mix(h, "#ffffff", f));
A.rgba = (h, a) => { const x = hx(h); return `rgba(${x[0]},${x[1]},${x[2]},${a})`; };
A.SCHATTEN = "#1a2038";

// ---- Formen ----
A.rr = (x, y, w, h, r) => {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
};
A.fill = c => { ctx.fillStyle = c; ctx.fill(); };
A.box = (x, y, w, h, r, c) => { A.rr(x, y, w, h, r); A.fill(c); };
A.circle = (x, y, r, c) => { ctx.beginPath(); ctx.arc(x, y, Math.max(r, 0.1), 0, Math.PI * 2); A.fill(c); };
A.ellipse = (x, y, rx, ry, c, rot = 0) => { ctx.beginPath(); ctx.ellipse(x, y, Math.max(rx, 0.1), Math.max(ry, 0.1), rot, 0, Math.PI * 2); A.fill(c); };
A.capsule = (x1, y1, x2, y2, r1, r2) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath(); ctx.arc(x1, y1, r1, a + Math.PI / 2, a - Math.PI / 2 + Math.PI * 2);
  ctx.arc(x2, y2, r2, a - Math.PI / 2, a + Math.PI / 2); ctx.closePath();
};
A.poly = (pts, c) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); if (c) A.fill(c); };
A.line = (x1, y1, x2, y2, w, c) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineCap = "round"; ctx.stroke(); };
A.lgrad = (x0, y0, x1, y1, stops) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
A.rgrad = (x, y, r0, r1, stops) => { const g = ctx.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };

// Weiche Schattierung von rechts auf die aktuelle Pfadform (Licht kommt von links oben)
A.schattiere = (x0, x1, staerke = 0.22, y0 = -5000, y1 = 5000) => {
  ctx.save(); ctx.clip();
  ctx.fillStyle = A.lgrad(x0, 0, x1, 0, [[0, A.rgba(A.SCHATTEN, 0)], [0.55, A.rgba(A.SCHATTEN, 0)], [1, A.rgba(A.SCHATTEN, staerke)]]);
  ctx.fillRect(x0 - 2000, y0, x1 - x0 + 4000, y1 - y0);
  ctx.restore();
};
// Zwei-Gelenk-IK (Schulter -> Ellbogen -> Hand)
A.ik = (sx, sy, tx, ty, l1, l2, bend) => {
  const dx = tx - sx, dy = ty - sy;
  const d = A.clamp(Math.hypot(dx, dy), Math.abs(l1 - l2) + 1, l1 + l2 - 0.5);
  const a = Math.atan2(dy, dx);
  const c = Math.acos(A.clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const a1 = a + bend * c;
  return { ex: sx + Math.cos(a1) * l1, ey: sy + Math.sin(a1) * l1, hx: sx + Math.cos(a) * d, hy: sy + Math.sin(a) * d };
};

// ---- Licht: Szenen melden Lichtquellen, danach wird abgedunkelt ----
A.lichter = [];
A.licht = (x, y, r, farbe = "#ffd9a0", st = 1) => {
  if (A.inMaske) return;
  // x,y,r in lokalen Koordinaten -> Bildschirm
  const m = ctx.getTransform(); const q = m.transformPoint(new DOMPoint(x, y));
  A.lichter.push({ x: q.x, y: q.y, r: r * Math.hypot(m.a, m.b), farbe, st });
};
A.dunkel = (staerke, farbe = "#1a2350") => {
  if (staerke <= 0) { A.lichter = []; return; }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = A.mix("#ffffff", farbe, staerke);
  ctx.fillRect(0, 0, A.W, A.H);
  ctx.globalCompositeOperation = "screen";
  for (const l of A.lichter) {
    ctx.fillStyle = A.rgrad(l.x, l.y, 0, l.r, [[0, A.rgba(l.farbe, 0.8 * l.st * staerke)], [0.3, A.rgba(l.farbe, 0.35 * l.st * staerke)], [1, A.rgba(l.farbe, 0)]]);
    ctx.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2);
  }
  ctx.restore();
  A.lichter = [];
};

// Text mit Titel-Schrift
A.text = (txt, x, y, size, farbe = "#fff", align = "center", weight = 900, font = "Titel", maxW = 0) => {
  ctx.font = `${weight} ${size}px ${font}`;
  if (maxW) { const w = ctx.measureText(txt).width; if (w > maxW) { size = Math.floor(size * maxW / w); ctx.font = `${weight} ${size}px ${font}`; } } ctx.textAlign = align; ctx.textBaseline = "middle"; ctx.fillStyle = farbe; ctx.fillText(txt, x, y);
};
