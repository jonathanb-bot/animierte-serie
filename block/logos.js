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
};
const CACHE = new Map();
export const logoTextur = (name, w = 512, h = 512, o = {}) => { const k = name + w + "x" + h + JSON.stringify(o); if (CACHE.has(k)) return CACHE.get(k);
  const c = document.createElement("canvas"); c.width = w; c.height = h; LOGO[name](c.getContext("2d"), w, h, o); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; CACHE.set(k, t); return t; };
// Aufkleber (Ebene mit Logo), z. B. auf Rakete, Box, Schild
export const logoAufkleber = (name, breite = 1, hoehe = 1, o = {}) => new THREE.Mesh(new THREE.PlaneGeometry(breite, hoehe), new THREE.MeshStandardMaterial({ map: logoTextur(name, 512, Math.round(512 * hoehe / breite), o), transparent: true, roughness: 0.6 }));
