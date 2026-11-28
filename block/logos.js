// Marken-Logos als Canvas-Zeichnungen (Jonathan 24.11., Issue #42: Marken und Logos dürfen gezeigt werden, möglichst detailgetreu).
// Jede Funktion zeichnet in (x = 2D-Kontext, w, h). Nutzung: Al.leinwand(...).userData.zeichne((x, w, h) => LOGO.nasa(x, w, h), "nasa")
// oder als Textur: logoTextur("nasa", 512, 512).
import * as THREE from "three";
export const LOGO = {
  // NASA „Meatball“: blauer Kreis, weiße Sterne, rote Schwinge, weiße Schrift, Orbit-Linie
  nasa(x, w, h) { const r = Math.min(w, h) * 0.48, cx = w / 2, cy = h / 2;
    x.fillStyle = "#0b3d91"; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
    x.fillStyle = "#ffffff"; const st = [[-0.55, -0.45, 3], [-0.25, -0.62, 2], [0.4, -0.55, 3], [0.62, -0.2, 2], [-0.65, 0.15, 2], [0.5, 0.45, 3], [-0.3, 0.6, 2], [0.12, -0.75, 2]];
    for (const [a, b, s] of st) { x.beginPath(); x.arc(cx + a * r, cy + b * r, s * r / 90, 0, 7); x.fill(); }
    x.save(); x.translate(cx, cy); x.rotate(-0.42); x.strokeStyle = "#ffffff"; x.lineWidth = r * 0.025; x.beginPath(); x.ellipse(0, 0, r * 0.92, r * 0.36, 0, 0, 7); x.stroke(); x.restore();
    x.fillStyle = "#fc3d21"; x.beginPath(); x.moveTo(cx - r * 0.95, cy + r * 0.42); x.bezierCurveTo(cx - r * 0.2, cy + r * 0.05, cx + r * 0.4, cy - r * 0.2, cx + r * 1.02, cy - r * 0.72);
    x.bezierCurveTo(cx + r * 0.45, cy - r * 0.05, cx - r * 0.1, cy + r * 0.25, cx - r * 0.95, cy + r * 0.52); x.closePath(); x.fill();
    x.fillStyle = "#ffffff"; x.font = `900 ${Math.round(r * 0.5)}px 'Inter Display', Helvetica, sans-serif`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("NASA", cx, cy + r * 0.05); },
  // Lieferando: orangefarbene Fläche, weißes Haus mit Gabel/Messer-Linie, Schriftzug
  lieferando(x, w, h, { hintergrund = true, schrift = true } = {}) { if (hintergrund) { x.fillStyle = "#ff8000"; x.fillRect(0, 0, w, h); }
    const s = Math.min(w, h * (schrift ? 0.62 : 1)) * 0.7, cx = w / 2, cy = schrift ? h * 0.38 : h / 2;
    x.fillStyle = "#ffffff"; x.beginPath(); x.moveTo(cx, cy - s * 0.55); x.lineTo(cx + s * 0.55, cy - s * 0.05); x.lineTo(cx + s * 0.42, cy - s * 0.05); x.lineTo(cx + s * 0.42, cy + s * 0.45);
    x.lineTo(cx - s * 0.42, cy + s * 0.45); x.lineTo(cx - s * 0.42, cy - s * 0.05); x.lineTo(cx - s * 0.55, cy - s * 0.05); x.closePath(); x.fill();
    x.fillStyle = "#ff8000"; x.fillRect(cx - s * 0.2, cy + s * 0.02, s * 0.06, s * 0.33); x.fillRect(cx - s * 0.27, cy + s * 0.02, s * 0.2, s * 0.05);
    x.beginPath(); x.ellipse(cx + s * 0.17, cy + s * 0.1, s * 0.07, s * 0.12, 0, 0, 7); x.fill(); x.fillRect(cx + s * 0.145, cy + s * 0.15, s * 0.05, s * 0.2);
    if (schrift) { x.fillStyle = "#ffffff"; x.font = `900 ${Math.round(h * 0.17)}px 'Inter Display', Helvetica, sans-serif`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("Lieferando", cx, h * 0.83); } },
  // Minecraft: Titelbild mit Gras-/Erdblöcken und dem kantigen Steinschriftzug „MINECRAFT“ (Pixel-Buchstaben, heller Stein oben, dunkle Kante)
  minecraft(x, w, h, { landschaft = true } = {}) {
    if (landschaft) { x.fillStyle = "#7ab8ff"; x.fillRect(0, 0, w, h); const b = Math.round(w / 16); let s = 7; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      for (let i = 0; i < 17; i++) { const top = Math.round(h * 0.62 / b) * b - (i % 5 === 2 ? b : i % 7 === 4 ? 2 * b : 0);
        for (let y = top; y < h; y += b) { const gras = y === top; x.fillStyle = gras ? "#5cab3c" : y < top + 3 * b ? "#8a5a32" : "#7a7a7a"; x.fillRect(i * b, y, b, b);
          for (let p = 0; p < 6; p++) { x.fillStyle = gras ? (r() < 0.5 ? "#4a9a2c" : "#6cc04a") : y < top + 3 * b ? (r() < 0.5 ? "#6e4424" : "#a06a3e") : (r() < 0.5 ? "#666" : "#8c8c8c"); x.fillRect(i * b + Math.floor(r() * 4) * b / 4, y + Math.floor(r() * 4) * b / 4, b / 4, b / 4); } } }
      for (const [cx, cy] of [[0.2, 0.12], [0.75, 0.2]]) { x.fillStyle = "rgba(255,255,255,0.9)"; x.fillRect(w * cx, h * cy, b * 3, b); x.fillRect(w * cx + b, h * cy - b * 0.6, b * 1.5, b * 0.6); } }
    const F = { M: ["10001", "11011", "10101", "10001", "10001"], I: ["111", "010", "010", "010", "111"], N: ["1001", "1101", "1011", "1001", "1001"], E: ["111", "100", "110", "100", "111"],
      C: ["111", "100", "100", "100", "111"], R: ["110", "101", "110", "101", "101"], A: ["010", "101", "111", "101", "101"], F: ["111", "100", "110", "100", "100"], T: ["111", "010", "010", "010", "010"] };
    const wort = "MINECRAFT"; const breite = [...wort].reduce((a, c) => a + F[c][0].length + 1, -1); const px = Math.floor(w * 0.9 / breite), x0 = (w - breite * px) / 2, y0 = h * 0.3;
    let cx = x0; for (const c of wort) { const m = F[c]; m.forEach((zeile, j) => [...zeile].forEach((v, i) => { if (v !== "1") return; const X = cx + i * px, Y = y0 + j * px;
        x.fillStyle = "#2a2a2a"; x.fillRect(X + px * 0.12, Y + px * 0.18, px, px);                                     // Schlagschatten
        x.fillStyle = j < 2 ? "#c8c8c8" : j < 4 ? "#a0a0a0" : "#7c7c7c"; x.fillRect(X, Y, px, px);
        x.fillStyle = "rgba(255,255,255,0.18)"; x.fillRect(X, Y, px, px * 0.18); x.fillStyle = "rgba(0,0,0,0.18)"; x.fillRect(X + px * 0.25, Y + px * 0.45, px * 0.25, px * 0.25); }));
      cx += (m[0].length + 1) * px; }
    x.strokeStyle = "#1a1a1a"; x.lineWidth = Math.max(2, px * 0.08); cx = x0; for (const c of wort) { const m = F[c]; m.forEach((zeile, j) => [...zeile].forEach((v, i) => { if (v === "1") x.strokeRect(cx + i * px, y0 + j * px, px, px); })); cx += (m[0].length + 1) * px; } },
};
const CACHE = new Map();
export const logoTextur = (name, w = 512, h = 512, o = {}) => { const k = name + w + "x" + h + JSON.stringify(o); if (CACHE.has(k)) return CACHE.get(k);
  const c = document.createElement("canvas"); c.width = w; c.height = h; LOGO[name](c.getContext("2d"), w, h, o); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; CACHE.set(k, t); return t; };
// Aufkleber (Ebene mit Logo), z. B. auf Rakete, Box, Schild
export const logoAufkleber = (name, breite = 1, hoehe = 1, o = {}) => new THREE.Mesh(new THREE.PlaneGeometry(breite, hoehe), new THREE.MeshStandardMaterial({ map: logoTextur(name, 512, Math.round(512 * hoehe / breite), o), transparent: true, roughness: 0.6 }));
