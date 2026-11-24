// Horrorfiguren der Blockstadt-Bibliothek – Top 50 (Jonathan 24.11. abends, Issues #42/#43: bekannte Figuren erlaubt, möglichst detailgetreu).
// Recherche, Namen und Aussehen: block/vorlagen/horrorfiguren.md (Liste mit Quellen). Vorschau: node block/katalog_bilder.cjs horror-<id>
// Nutzung in einer Folge:   import { horror, HORROR } from "../horror.js";   const nun = horror("nun"); nun.position.set(x, 0, z);
//   Menschliche Figuren sind echte Fg.figur-Figuren (Fg.pose wirkt, Sichtbarkeit wird pro Bild zurückgesetzt → .visible = true setzen).
//   Eigene Körper (Siren Head, Long Horse, Momo …) sind Gruppen; sie bleiben sichtbar, bis man .visible = false setzt.
//   Jede Figur hat userData.horror = { id, name, waffe? } und – wo sinnvoll – userData.waffe (Prop in der Hand).
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import * as Fg from "./figuren.js";
import { scene } from "./welt.js";

const mat = (c, r = 0.7, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
const plastik = c => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.3 });
const leucht = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b) });
const rb = (w, h, d, r, m) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2)), m);
const bx = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const zyl = (r0, r1, h, m, s = 18) => new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, s), m);
const kugel = (r, m, s = 16) => new THREE.Mesh(new THREE.SphereGeometry(r, s, Math.round(s * 0.7)), m);
const an = (g, o, x = 0, y = 0, z = 0) => { o.position.set(x, y, z); g.add(o); return o; };
const tex = (w, h, fn) => { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const BLUT = "#b3121a";   // stilisiertes Blutrot (Issue #43)

// ---------- Bausteine ----------
// Kopfhülle über dem Blockkopf (verdeckt das normale Gesicht) mit gezeichnetem Gesicht vorne; zeichne(x, w, h) auf 256×256
const kopfHuelle = (f, { farbe = "#ffffff", zeichne = null, b = 1.34, h = 1.3, t = 1.34, rund = 0.34, y = 0.62, z = 0, mat: m = null } = {}) => {
  const k = f.userData.kopfG, g = new THREE.Group(); g.position.set(0, y, z); k.add(g);
  an(g, rb(b, h, t, rund, m ?? plastik(farbe)));
  if (zeichne) { const d = an(g, new THREE.Mesh(new THREE.PlaneGeometry(b * 0.9, h * 0.9), new THREE.MeshStandardMaterial({ map: tex(256, 256, zeichne), transparent: true, roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -2 })), 0, 0, t / 2 + 0.006); d.renderOrder = 1; }
  return g; };
// Gesichts-Zeichenhilfen
const Z = {
  augen(x, w, h, { farbe = "#111", r = 16, y = 0.42, abst = 0.2, form = "rund" } = {}) { x.fillStyle = farbe; for (const s of [-1, 1]) { x.beginPath(); form === "schlitz" ? x.ellipse(w / 2 + s * w * abst, h * y, r * 1.4, r * 0.45, 0, 0, 7) : x.arc(w / 2 + s * w * abst, h * y, r, 0, 7); x.fill(); } },
  loch(x, w, h, o = {}) { Z.augen(x, w, h, { farbe: "#050505", r: 22, ...o }); },
  mund(x, w, h, { farbe = "#111", y = 0.72, b = 0.3, dicke = 8, bogen = 0.06 } = {}) { x.strokeStyle = farbe; x.lineWidth = dicke; x.lineCap = "round"; x.beginPath(); x.moveTo(w * (0.5 - b / 2), h * y); x.quadraticCurveTo(w / 2, h * (y + bogen), w * (0.5 + b / 2), h * y); x.stroke(); },
  zaehne(x, w, h, { y = 0.7, b = 0.5, hoch = 0.14, farbe = "#f4f0e0", grund = "#2a0606", n = 9 } = {}) { const x0 = w * (0.5 - b / 2), x1 = w * (0.5 + b / 2), y0 = h * (y - hoch / 2), y1 = h * (y + hoch / 2);
    x.fillStyle = grund; x.beginPath(); x.ellipse(w / 2, h * y, (x1 - x0) / 2, (y1 - y0) / 2, 0, 0, 7); x.fill(); x.fillStyle = farbe;
    for (let i = 0; i < n; i++) { const a = x0 + (x1 - x0) * (i + 0.5) / n; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(a - (x1 - x0) / n / 2, h * y + s * (y1 - y0) / 2 * 0.95); x.lineTo(a + (x1 - x0) / n / 2, h * y + s * (y1 - y0) / 2 * 0.95); x.lineTo(a, h * y + s * (y1 - y0) * 0.05); x.fill(); } } },
  grinsen(x, w, h, { y = 0.66, b = 0.8, farbe = "#ffffff", rand = "#111" } = {}) { x.fillStyle = rand; x.beginPath(); x.moveTo(w * (0.5 - b / 2), h * (y - 0.06)); x.quadraticCurveTo(w / 2, h * (y + 0.34), w * (0.5 + b / 2), h * (y - 0.06)); x.quadraticCurveTo(w / 2, h * (y + 0.1), w * (0.5 - b / 2), h * (y - 0.06)); x.fill();
    x.fillStyle = farbe; x.beginPath(); x.moveTo(w * (0.5 - b / 2 + 0.04), h * (y - 0.03)); x.quadraticCurveTo(w / 2, h * (y + 0.28), w * (0.5 + b / 2 - 0.04), h * (y - 0.03)); x.quadraticCurveTo(w / 2, h * (y + 0.12), w * (0.5 - b / 2 + 0.04), h * (y - 0.03)); x.fill();
    x.strokeStyle = rand; x.lineWidth = 3; for (let i = 1; i < 10; i++) { const a = w * (0.5 - b / 2 + 0.04) + i * w * (b - 0.08) / 10; x.beginPath(); x.moveTo(a, h * (y - 0.02)); x.lineTo(a, h * (y + 0.2)); x.stroke(); } },
  adern(x, w, h, farbe = "#3a3a46", n = 6) { x.strokeStyle = farbe; x.lineWidth = 3; for (let i = 0; i < n; i++) { const a = (i * 2.39) % 1; x.beginPath(); x.moveTo(w * (0.1 + a * 0.8), h * 0.05); x.quadraticCurveTo(w * (0.15 + a * 0.7), h * 0.3, w * (0.2 + ((a * 3) % 1) * 0.6), h * 0.5); x.stroke(); } },
  blut(x, w, h, { x0 = 0.5, y0 = 0.8, n = 3 } = {}) { x.fillStyle = BLUT; for (let i = 0; i < n; i++) { const xx = w * (x0 - 0.12 + i * 0.12); x.beginPath(); x.moveTo(xx - 6, h * y0); x.lineTo(xx + 6, h * y0); x.lineTo(xx + 3, h * (y0 + 0.08 + (i % 2) * 0.06)); x.arc(xx, h * (y0 + 0.08 + (i % 2) * 0.06), 4, 0, Math.PI); x.fill(); } },
};
// Hand-Prop (rechte Hand)
const inHand = (f, o, { rechts = true, y = -1.85, z = 0.25, rot = [0, 0, 0] } = {}) => { const a = rechts ? f.userData.armR : f.userData.armL; o.position.set(0, y, z); o.rotation.set(...rot); a.add(o); f.userData.waffe = o; return o; };
const P = {   // Props
  messer: () => { const g = new THREE.Group(); an(g, rb(0.18, 0.7, 0.22, 0.05, mat("#2a1a10")), 0, 0, 0); const k = an(g, bx(0.06, 1.5, 0.32, mat("#d8dce4", 0.25, 0.8)), 0, 1.05, 0.04); return g; },
  machete: () => { const g = new THREE.Group(); an(g, rb(0.2, 0.75, 0.24, 0.05, mat("#1a1a1a")), 0, 0, 0); an(g, bx(0.06, 2.6, 0.5, mat("#c8ccd4", 0.3, 0.8)), 0, 1.7, 0.08); return g; },
  axt: () => { const g = new THREE.Group(); an(g, zyl(0.09, 0.09, 3.2, mat("#7a4a28")), 0, 1.0, 0); an(g, bx(0.12, 0.9, 1.0, mat("#b8bcc4", 0.3, 0.8)), 0, 2.3, 0.45); return g; },
  kettensaege: () => { const g = new THREE.Group(); an(g, rb(0.7, 0.6, 1.3, 0.12, plastik("#e86a1a")), 0, 0, 0); an(g, bx(0.12, 0.35, 2.6, mat("#a8acb4", 0.3, 0.8)), 0, 0.05, 1.9); an(g, bx(0.14, 0.42, 2.7, mat("#2a2a2e", 0.6)), 0, 0.05, 1.9).scale.set(1, 1, 1); return g; },
  ballon: () => { const g = new THREE.Group(); an(g, zyl(0.01, 0.01, 3.0, mat("#ffffff"), 4), 0, 1.5, 0); const b = an(g, kugel(0.75, plastik("#e8141e"), 20), 0, 3.6, 0); b.scale.set(1, 1.15, 1); return g; },
  haken: () => { const g = new THREE.Group(); an(g, zyl(0.12, 0.12, 0.4, mat("#888")), 0, 0, 0); const h = an(g, new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.07, 8, 16, Math.PI * 1.3), mat("#c8ccd4", 0.3, 0.8)), 0, -0.4, 0); h.rotation.z = Math.PI * 0.6; return g; },
  klingen: () => { const g = new THREE.Group(); for (let i = 0; i < 4; i++) an(g, bx(0.05, 1.3, 0.1, mat("#d8dce4", 0.25, 0.8)), -0.33 + i * 0.22, -0.75, 0.15); return g; },
  schlaeger: () => { const g = new THREE.Group(); an(g, zyl(0.12, 0.2, 2.6, mat("#a8743a")), 0, 1.0, 0); return g; },
  mikro: () => { const g = new THREE.Group(); an(g, zyl(0.08, 0.06, 0.7, mat("#2a2a2e")), 0, 0, 0); an(g, kugel(0.2, mat("#3a3a40", 0.4, 0.4)), 0, 0.45, 0); return g; },
  gitarre: () => { const g = new THREE.Group(); const k = an(g, rb(1.1, 1.4, 0.3, 0.3, plastik("#e8222a")), 0, 0, 0); an(g, bx(0.2, 1.8, 0.15, mat("#2a1a10")), 0, 1.5, 0); return g; },
  sense: () => { const g = new THREE.Group(); an(g, zyl(0.08, 0.08, 4.2, mat("#3a2a1a")), 0, 1.4, 0); const b = an(g, bx(2.0, 0.12, 0.06, mat("#c8ccd4", 0.3, 0.8)), 0.9, 3.4, 0); b.rotation.z = -0.25; return g; },
  kette: () => { const g = new THREE.Group(); for (let i = 0; i < 8; i++) { const r = an(g, new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.04, 6, 12), mat("#8a8a90", 0.4, 0.8)), 0, -i * 0.22, 0); r.rotation.y = i % 2 ? Math.PI / 2 : 0; } return g; },
  dreirad: () => { const g = new THREE.Group(); for (const [x, z] of [[-0.5, -0.5], [0.5, -0.5], [0, 0.7]]) { const r = an(g, new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.08, 8, 16), mat("#1a1a1e")), x, 0.43, z); r.rotation.y = Math.PI / 2; } an(g, bx(0.15, 0.15, 1.4, plastik("#e8222a")), 0, 0.8, 0.1); an(g, zyl(0.06, 0.06, 1.0, plastik("#e8222a")), 0, 1.2, 0.7); return g; },
};
// Kutte / Robe über dem Körper (verdeckt Beine), Kapuze optional
const kutte = (f, farbe, { kapuze = false, unten = 0.1, oben = 3.95, r0 = 1.45, r1 = 1.05 } = {}) => { const k = f.userData.koerper, m = mat(farbe, 0.85);
  an(k, zyl(r1, r0, oben - unten, m, 20), 0, (oben + unten) / 2, 0); if (kapuze) { const h = an(f.userData.kopfG, rb(1.6, 1.55, 1.55, 0.5, m), 0, 0.72, -0.12); } return m; };
const langeHaare = (f, farbe, { vorne = false, laenge = 2.6 } = {}) => { const k = f.userData.kopfG, m = mat(farbe, 0.9); an(k, rb(1.42, 0.5, 1.42, 0.2, m), 0, 1.3, 0);
  an(k, rb(1.45, laenge, 0.4, 0.15, m), 0, 1.3 - laenge / 2, -0.55); for (const s of [-1, 1]) an(k, rb(0.3, laenge * 0.9, 1.2, 0.12, m), s * 0.68, 1.3 - laenge * 0.45, 0);
  if (vorne) { const v = an(k, rb(1.25, laenge * 0.95, 0.18, 0.08, m), 0, 1.25 - laenge * 0.47, 0.72); } };
const ohren = (f, farbe, { form = "baer", innen = null, hoch = 0.5 } = {}) => { const k = f.userData.kopfG, m = plastik(farbe);
  for (const s of [-1, 1]) { if (form === "hase") { const o = an(k, rb(0.35, 1.5, 0.22, 0.12, m), s * 0.38, 1.9, 0); o.rotation.z = -s * 0.12; if (innen) an(o, rb(0.2, 1.1, 0.05, 0.05, plastik(innen)), 0, 0, 0.12); }
    else if (form === "spitz") { const o = an(k, new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.8, 4), m), s * 0.48, 1.55 + hoch * 0.2, 0); o.rotation.z = -s * 0.2; }
    else an(k, kugel(0.3, m, 14), s * 0.58, 1.38, 0); } };
const schnauze = (f, farbe, { lang = 0.45, b = 0.75 } = {}) => an(f.userData.kopfG, rb(b, 0.45, lang, 0.18, plastik(farbe)), 0, 0.42, 0.68 + lang / 2 - 0.05);
const hut = (f, typ, farbe = "#3a2a1a") => { const k = f.userData.kopfG, m = mat(farbe, 0.8);
  if (typ === "fedora") { an(k, zyl(1.15, 1.15, 0.08, m, 24), 0, 1.33, 0); an(k, zyl(0.68, 0.74, 0.6, m, 20), 0, 1.65, 0); an(k, zyl(0.75, 0.75, 0.14, mat("#2a1a10")), 0, 1.42, 0); }
  else if (typ === "zylinder") { an(k, zyl(1.0, 1.0, 0.07, m, 24), 0, 1.33, 0); an(k, zyl(0.6, 0.6, 1.1, m, 20), 0, 1.9, 0); }
  else if (typ === "melone") { an(k, zyl(0.95, 0.95, 0.07, m, 24), 0, 1.33, 0); const d = an(k, kugel(0.62, m, 18), 0, 1.4, 0); d.scale.set(1, 0.9, 1); }
  else if (typ === "mini") { an(k, zyl(0.35, 0.35, 0.05, m, 16), 0.35, 1.37, 0); an(k, zyl(0.22, 0.22, 0.4, m, 16), 0.35, 1.58, 0); } };
const koerperFell = (f, farbe) => { const k = f.userData.koerper; const t = tex(128, 128, (x, w, h) => { x.fillStyle = farbe; x.fillRect(0, 0, w, h); x.globalAlpha = 0.25; for (let i = 0; i < 400; i++) { x.fillStyle = i % 2 ? "#000" : "#fff"; x.fillRect((i * 37) % w, (i * 71) % h, 2, 6); } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };

// lange Arme: Kinder des Arm-Gelenks strecken (Gelenk selbst bleibt, damit pose() nichts zurücksetzt)
const langeArme = (f, k, dick = 1) => { for (const a of [f.userData.armL, f.userData.armR]) a.children.forEach(c => { c.scale.y *= k; c.scale.x *= dick; c.scale.z *= dick; c.position.y *= k; }); };
// Basis-Figur: unsere Blockfigur mit Glatze (Hülle/Hut sitzt darauf)
const mensch = (o) => Fg.figur({ frisur: "glatze", haare: "#111", struktur: true, ...o });
const merk = (g, id, name, extra = {}) => { g.userData.horror = { id, name, ...extra }; return g; };

// ---------- Eigene Körper (keine Blockfigur) ----------
const sirenHead = () => { const g = new THREE.Group(), haut = mat("#7a4a2e", 0.9), dunkel = mat("#4a2a1a", 0.9);
  const glied = (x0, y0, z0, x1, y1, z1, r) => { const a = new THREE.Vector3(x0, y0, z0), b = new THREE.Vector3(x1, y1, z1), m = zyl(r, r * 0.85, a.distanceTo(b), haut, 8); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); g.add(m); };
  glied(-0.9, 0, 0, -0.7, 9, 0, 0.42); glied(0.9, 0, 0, 0.7, 9, 0, 0.42); glied(-0.7, 9, 0, -0.75, 17, 0, 0.38); glied(0.7, 9, 0, 0.75, 17, 0, 0.38);
  const rumpf = an(g, rb(2.6, 8.5, 1.4, 0.5, haut), 0, 21.5, 0); for (let i = 0; i < 6; i++) an(g, bx(2.7, 0.18, 1.45, dunkel), 0, 19 + i * 1.1, 0);   // Rippen
  glied(-1.4, 25.4, 0, -2.2, 16, 0.6, 0.3); glied(-2.2, 16, 0.6, -2.5, 7, 1.0, 0.26); glied(1.4, 25.4, 0, 2.2, 16, 0.6, 0.3); glied(2.2, 16, 0.6, 2.5, 7, 1.0, 0.26);
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) glied(s * 2.5, 7, 1.0, s * (2.4 + i * 0.12), 5.6, 1.0 + (i - 1.5) * 0.25, 0.08);
  an(g, zyl(0.32, 0.4, 6.5, mat("#5a5048", 0.6, 0.3), 10), 0, 29, 0);   // Mast-Hals
  const sirene = (s) => { const k = new THREE.Group(); k.position.set(s * 0.9, 32, 0); g.add(k); const t = an(k, new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1.3, 2.2, 16, 1, true), mat("#8a8278", 0.5, 0.5)), 0, 0, 0); t.rotation.z = s * Math.PI / 2; t.material.side = THREE.DoubleSide;
    const gi = an(k, new THREE.Mesh(new THREE.CircleGeometry(1.25, 16), mat("#1a1612", 0.8)), s * 1.1, 0, 0); gi.rotation.y = s * Math.PI / 2; an(k, bx(0.5, 0.5, 0.5, mat("#5a5048", 0.6, 0.3)), -s * 0.9, 0, 0); return k; };
  g.userData.sirenen = [sirene(-1), sirene(1)]; g.scale.setScalar(0.8); /* ~12 m echte Größe (1 m = 2,3 Einheiten) */ return merk(g, "sirenhead", "Siren Head"); };
const longHorse = () => { const g = new THREE.Group(), haut = mat("#3a2a24", 0.9), knochen = mat("#e8e0d0", 0.6);
  for (const [x, z] of [[-1, -2.5], [1, -2.5], [-1, 2.5], [1, 2.5]]) an(g, zyl(0.18, 0.12, 9, haut, 8), x, 4.5, z);
  an(g, rb(2.4, 2, 6.5, 0.8, haut), 0, 9.6, 0); for (let i = 0; i < 26; i++) { const s = an(g, kugel(0.42 - i * 0.006, haut, 10), 0, 10.4 + i * 0.85, 2.8 + Math.sin(i * 0.12) * 1.2); }
  const k = an(g, rb(0.9, 0.9, 2.6, 0.35, knochen), 0, 32.6, 4.4); k.rotation.x = 0.5; for (const s of [-1, 1]) an(g, kugel(0.18, mat("#050505")), s * 0.42, 32.9, 4.2);
  g.scale.setScalar(0.42); return merk(g, "longhorse", "Long Horse"); };
const momo = () => { const g = new THREE.Group(), feder = mat("#2a2420", 0.9), haut = plastik("#e8d8c8");
  const k = an(g, kugel(1.2, feder, 18), 0, 2.2, 0); k.scale.set(1, 1.25, 0.9); for (const s of [-1, 1]) { const b = an(g, zyl(0.06, 0.06, 1.2, mat("#c8a050")), s * 0.4, 0.6, 0); an(g, bx(0.5, 0.06, 0.3, mat("#c8a050")), s * 0.4, 0.02, 0.15); }
  const kopf = an(g, kugel(0.95, haut, 20), 0, 4.0, 0.2); kopf.scale.set(1, 1.15, 0.95);
  const haar = an(g, kugel(1.02, mat("#0a0a0a", 0.9), 20), 0, 4.15, 0.05); haar.scale.set(1.05, 1.2, 0.95); const ha = an(g, rb(2.1, 2.6, 0.5, 0.2, mat("#0a0a0a", 0.9)), 0, 3.0, -0.55);
  for (const s of [-1, 1]) { an(g, kugel(0.32, mat("#f4f0e8", 0.3), 16), s * 0.38, 4.1, 1.05); an(g, kugel(0.16, mat("#050505", 0.2), 12), s * 0.38, 4.1, 1.33); }
  const m = an(g, bx(0.9, 0.08, 0.05, mat("#3a0a0a")), 0, 3.45, 1.12); return merk(g, "momo", "Momo"); };
const scp173 = () => { const g = new THREE.Group(), beton = mat("#b8b0a0", 0.95);
  an(g, rb(1.8, 4.2, 1.4, 0.4, beton), 0, 2.1, 0); const k = an(g, rb(1.4, 1.5, 1.3, 0.5, beton), 0, 4.9, 0.05);
  const d = an(g, new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), new THREE.MeshStandardMaterial({ map: tex(256, 256, (x, w, h) => { x.fillStyle = "#3a8a3a"; for (const s of [-1, 1]) { x.beginPath(); x.arc(w / 2 + s * 60, 100, 34, 0, 7); x.fill(); } x.fillStyle = "#c82a2a"; x.fillRect(70, 170, 116, 40); x.strokeStyle = "#c82a2a"; x.lineWidth = 8; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(30 + i * 45, 20); x.lineTo(40 + i * 40, 240); x.stroke(); } }), transparent: true, roughness: 0.9 })), 0, 4.9, 0.71);
  for (const s of [-1, 1]) { const a = an(g, rb(0.4, 2.6, 0.4, 0.15, beton), s * 1.05, 2.6, 0); } return merk(g, "scp173", "SCP-173"); };
const xeno = () => { const g = new THREE.Group(), m = new THREE.MeshPhysicalMaterial({ color: "#14161c", roughness: 0.25, clearcoat: 1 });
  const f = mensch({ haut: "#14161c", hemd: "#14161c", hose: "#14161c", schuhe: "#14161c", skala: 1.15 }); f.traverse(o => { if (o.isMesh && o.material && o.material.color && !o.material.map) o.material = m; });
  const kopf = an(f.userData.kopfG, rb(1.1, 1.0, 3.2, 0.5, m), 0, 0.9, -0.9); kopf.rotation.x = -0.35; an(f.userData.kopfG, kugel(0.75, m, 16), 0, 0.6, 0.35);
  Z; const zahn = an(f.userData.kopfG, bx(0.5, 0.15, 0.3, mat("#c8c0b0")), 0, 0.15, 0.85);
  for (let i = 0; i < 4; i++) { const r = an(f.userData.koerper, zyl(0.12, 0.12, 1.2, m, 8), (i % 2 ? 0.5 : -0.5), 3.6, -0.7 - Math.floor(i / 2) * 0.2); r.rotation.x = -0.6; }
  const sch = new THREE.Group(); sch.position.set(0, 2.0, -0.6); f.userData.koerper.add(sch); for (let i = 0; i < 10; i++) an(sch, kugel(0.28 - i * 0.022, m, 10), 0, -i * 0.12, -i * 0.42);
  return merk(f, "xenomorph", "Xenomorph"); };
const mommy = () => { const g = new THREE.Group(), m = plastik("#e85aa0"), dunkel = plastik("#c83a80");
  an(g, rb(1.8, 2.4, 1.2, 0.4, m), 0, 9, 0); const k = an(g, rb(1.5, 1.4, 1.4, 0.5, m), 0, 11, 0.1);
  an(g, new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.2), new THREE.MeshStandardMaterial({ map: tex(256, 256, (x, w, h) => { Z.augen(x, w, h, { r: 26, y: 0.38 }); x.fillStyle = "#1a1a1a"; x.beginPath(); x.ellipse(w / 2, h * 0.72, 60, 30, 0, 0, Math.PI); x.fill(); Z.zaehne(x, w, h, { y: 0.74, b: 0.45, hoch: 0.12 }); }), transparent: true })), 0, 11, 0.82);
  const glied = (a, b, r, mm) => { const v = b.clone().sub(a), c = zyl(r, r, v.length(), mm, 8); c.position.copy(a).add(b).multiplyScalar(0.5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize()); g.add(c); };
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  for (const s of [-1, 1]) { glied(V3(s * 0.8, 10, 0), V3(s * 4, 13, 1), 0.16, m); glied(V3(s * 4, 13, 1), V3(s * 6, 2, 2), 0.14, dunkel); glied(V3(s * 0.6, 7.8, 0), V3(s * 3.5, 9, -1.5), 0.18, m); glied(V3(s * 3.5, 9, -1.5), V3(s * 4.5, 0, -2.5), 0.16, dunkel); }
  g.scale.setScalar(0.5); return merk(g, "mommylonglegs", "Mommy Long Legs"); };

// ---------- Die Liste (id → Bau) ----------
// Reihenfolge = Top-50-Liste in block/vorlagen/horrorfiguren.md
export const HORROR = {
  // --- Film ---
  michaelmyers: { name: "Michael Myers", bau: () => { const f = mensch({ haut: "#e8d8c8", hemd: "#1e2a3a", hose: "#1e2a3a", schuhe: "#1a1a1a", skala: 1.08 });
    kopfHuelle(f, { farbe: "#f0ece4", zeichne: (x, w, h) => { Z.loch(x, w, h, { r: 18, y: 0.45, abst: 0.18 }); Z.mund(x, w, h, { b: 0.18, bogen: 0, dicke: 5, farbe: "#6a6a6a" }); x.fillStyle = "#c8c0b4"; x.fillRect(w * 0.47, h * 0.45, w * 0.06, h * 0.18); } });
    an(f.userData.kopfG, rb(1.42, 0.5, 1.4, 0.2, mat("#4a3a2a", 0.9)), 0, 1.32, -0.04); inHand(f, P.messer(), { rot: [0.3, 0, 0] }); return merk(f, "michaelmyers", "Michael Myers"); } },
  jason: { name: "Jason Voorhees", bau: () => { const f = mensch({ haut: "#b8a088", hemd: "#3a4a32", hose: "#2a2a2a", schuhe: "#1a1a1a", jacke: "#4a5a3a", skala: 1.15 });
    kopfHuelle(f, { farbe: "#ece8dc", zeichne: (x, w, h) => { x.fillStyle = "#1a1a1a"; for (let i = 0; i < 18; i++) { x.beginPath(); x.arc(w * (0.25 + (i % 6) * 0.1), h * (0.6 + Math.floor(i / 6) * 0.1), 5, 0, 7); x.fill(); } Z.augen(x, w, h, { farbe: "#0a0a0a", r: 22, y: 0.38, form: "schlitz" });
      x.fillStyle = "#c81a1a"; for (const [a, b, r] of [[0.2, 0.22, 1.2], [0.8, 0.22, -1.2], [0.5, 0.18, 0]]) { x.save(); x.translate(w * a, h * b); x.rotate(r); x.beginPath(); x.moveTo(0, -14); x.lineTo(10, 0); x.lineTo(0, 14); x.lineTo(-10, 0); x.fill(); x.restore(); } } });
    inHand(f, P.machete(), { rot: [0.4, 0, 0] }); return merk(f, "jason", "Jason Voorhees"); } },
  freddy: { name: "Freddy Krueger", bau: () => { const f = mensch({ haut: "#b8604a", hemd: "#b8282a", hose: "#5a4a3a", schuhe: "#2a1a10", muster: { hemd: "streifen" }, skala: 1.0 });
    kopfHuelle(f, { farbe: "#b85a44", zeichne: (x, w, h) => { x.fillStyle = "#8a3a2a"; for (let i = 0; i < 30; i++) { x.beginPath(); x.arc((i * 47) % w, (i * 83) % h, 10 + (i % 3) * 5, 0, 7); x.fill(); } Z.augen(x, w, h, { farbe: "#f0e0a0", r: 12 }); Z.augen(x, w, h, { farbe: "#1a1a1a", r: 6 }); Z.mund(x, w, h, { b: 0.35, bogen: -0.05, farbe: "#3a0a0a" }); } });
    hut(f, "fedora", "#5a4430"); inHand(f, P.klingen(), { y: -1.7, z: 0.2 }); f.traverse(o => { if (o.isMesh && o.material?.map && o.parent === f.userData.koerper) {} });
    return merk(f, "freddy", "Freddy Krueger"); } },
  ghostface: { name: "Ghostface", bau: () => { const f = mensch({ haut: "#111", hemd: "#111", hose: "#111", schuhe: "#111" }); kutte(f, "#0e0e10", { kapuze: true });
    kopfHuelle(f, { farbe: "#f4f2ee", b: 1.15, h: 1.5, t: 1.0, rund: 0.5, z: 0.25, zeichne: (x, w, h) => { x.fillStyle = "#0a0a0a"; for (const s of [-1, 1]) { x.save(); x.translate(w / 2 + s * 48, h * 0.36); x.rotate(s * 0.25); x.beginPath(); x.ellipse(0, 0, 26, 48, 0, 0, 7); x.fill(); x.restore(); } x.beginPath(); x.ellipse(w / 2, h * 0.74, 34, 62, 0, 0, 7); x.fill(); } });
    inHand(f, P.messer(), { rot: [0.3, 0, 0] }); return merk(f, "ghostface", "Ghostface"); } },
  chucky: { name: "Chucky", bau: () => { const f = mensch({ haut: "#f0c8a8", hemd: "#e8e8e8", hose: "#3a5aa8", schuhe: "#e8e8e8", muster: { hemd: "streifen" }, skala: 0.55, weste: false });
    kopfHuelle(f, { farbe: "#f0c8a8", zeichne: (x, w, h) => { x.fillStyle = "#fff"; for (const s of [-1, 1]) { x.beginPath(); x.arc(w / 2 + s * 50, h * 0.45, 24, 0, 7); x.fill(); } Z.augen(x, w, h, { farbe: "#2a6ad8", r: 13, y: 0.45, abst: 0.195 }); Z.augen(x, w, h, { r: 6, y: 0.45, abst: 0.195 }); x.fillStyle = "#f0a088"; for (let i = 0; i < 12; i++) { x.beginPath(); x.arc(w * (0.32 + (i % 6) * 0.07), h * (0.58 + Math.floor(i / 6) * 0.04), 3, 0, 7); x.fill(); }
      x.strokeStyle = "#8a2a2a"; x.lineWidth = 4; x.beginPath(); x.moveTo(w * 0.2, h * 0.2); x.lineTo(w * 0.42, h * 0.58); x.stroke(); for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(w * (0.24 + i * 0.04) - 8, h * (0.27 + i * 0.07)); x.lineTo(w * (0.24 + i * 0.04) + 8, h * (0.27 + i * 0.07) - 6); x.stroke(); } Z.mund(x, w, h, { b: 0.3, bogen: 0.06, farbe: "#6a1a1a", dicke: 7 }); } });
    langeHaare(f, "#d8541a", { laenge: 0.7 }); an(f.userData.koerper, rb(2.1, 1.6, 1.06, 0.12, plastik("#3a5aa8")), 0, 2.85, 0); inHand(f, P.messer(), { rot: [0.3, 0, 0] }); return merk(f, "chucky", "Chucky"); } },
  pennywise: { name: "Pennywise", bau: () => { const f = mensch({ haut: "#f4f2ee", hemd: "#d8d4cc", hose: "#d8d4cc", schuhe: "#c8c0b0", kragen: "#e8e0d8", skala: 1.1 });
    kopfHuelle(f, { farbe: "#f8f6f2", h: 1.45, y: 0.72, zeichne: (x, w, h) => { x.strokeStyle = "#c81a1a"; x.lineWidth = 8; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(w / 2 + s * 40, h * 0.18); x.lineTo(w / 2 + s * 46, h * 0.5); x.stroke(); } Z.augen(x, w, h, { farbe: "#e8c020", r: 15, y: 0.42 }); Z.augen(x, w, h, { r: 6, y: 0.42 });
      x.fillStyle = "#c81a1a"; x.beginPath(); x.arc(w / 2, h * 0.56, 12, 0, 7); x.fill(); x.strokeStyle = "#c81a1a"; x.lineWidth = 9; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(w / 2, h * 0.7); x.quadraticCurveTo(w / 2 + s * 50, h * 0.74, w / 2 + s * 70, h * 0.55); x.stroke(); } Z.zaehne(x, w, h, { y: 0.74, b: 0.32, hoch: 0.08 }); } });
    for (const s of [-1, 1]) { const b = an(f.userData.kopfG, kugel(0.42, mat("#e8681a", 0.95), 12), s * 0.72, 1.15, -0.1); b.scale.set(1, 0.8, 1.1); }
    for (let i = 0; i < 3; i++) an(f.userData.koerper, kugel(0.12, plastik("#e8681a")), 0, 3.4 - i * 0.45, 0.55); inHand(f, P.ballon(), { rechts: false, y: -1.8 }); return merk(f, "pennywise", "Pennywise"); } },
  leatherface: { name: "Leatherface", bau: () => { const f = mensch({ haut: "#c8a888", hemd: "#e8e0d0", hose: "#5a4a3a", schuhe: "#2a1a10", krawatte: true, skala: 1.2 });
    kopfHuelle(f, { farbe: "#c8a07a", zeichne: (x, w, h) => { x.strokeStyle = "#7a5a3a"; x.lineWidth = 3; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo((i * 53) % w, 0); x.lineTo((i * 91) % w, h); x.stroke(); } Z.loch(x, w, h, { r: 16 }); Z.zaehne(x, w, h, { y: 0.72, b: 0.32, hoch: 0.08, farbe: "#c8b890" }); } });
    an(f.userData.kopfG, rb(1.4, 0.4, 1.4, 0.15, mat("#3a2a1a", 0.95)), 0, 1.3, 0); an(f.userData.koerper, rb(1.9, 2.6, 0.1, 0.05, mat("#8a6a4a", 0.8)), 0, 2.6, 0.56); inHand(f, P.kettensaege(), { y: -1.6, z: 0.6 }); return merk(f, "leatherface", "Leatherface"); } },
  pinhead: { name: "Pinhead", bau: () => { const f = mensch({ haut: "#e8e0d8", hemd: "#1a1a1e", hose: "#1a1a1e", schuhe: "#111" }); kutte(f, "#1e1e22");
    kopfHuelle(f, { farbe: "#ece4dc", zeichne: (x, w, h) => { x.strokeStyle = "#a89c94"; x.lineWidth = 3; for (let i = 1; i < 6; i++) { x.beginPath(); x.moveTo(i * w / 6, 0); x.lineTo(i * w / 6, h); x.stroke(); x.beginPath(); x.moveTo(0, i * h / 6); x.lineTo(w, i * h / 6); x.stroke(); } Z.augen(x, w, h, { r: 10 }); Z.mund(x, w, h, { b: 0.22, bogen: 0, farbe: "#4a3a3a" }); } });
    const k = f.userData.kopfG; for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { const p = an(k, zyl(0.02, 0.02, 0.3, mat("#c8ccd4", 0.3, 0.9), 4), -0.54 + i * 0.27, 0.1 + j * 0.24, 0.72); p.rotation.x = Math.PI / 2; an(k, kugel(0.04, mat("#d8dce4", 0.2, 0.9), 6), -0.54 + i * 0.27, 0.1 + j * 0.24, 0.87); }
    return merk(f, "pinhead", "Pinhead"); } },
  samara: { name: "Samara (The Ring)", bau: () => { const f = mensch({ haut: "#d8dcdc", hemd: "#e8e8e4", hose: "#e8e8e4", schuhe: "#d8dcdc", skala: 0.8 }); kutte(f, "#e4e4de", { r0: 1.25, r1: 1.0 });
    langeHaare(f, "#0a0a0c", { vorne: true, laenge: 2.8 }); return merk(f, "samara", "Samara"); } },
  annabelle: { name: "Annabelle", bau: () => { const f = mensch({ haut: "#f0e4d8", hemd: "#f4f0e8", hose: "#f4f0e8", schuhe: "#c8a088", skala: 0.6 }); kutte(f, "#f2ece0", { r0: 1.3, r1: 1.05, oben: 3.6 });
    kopfHuelle(f, { farbe: "#f0e0d4", zeichne: (x, w, h) => { Z.augen(x, w, h, { farbe: "#3a2a1a", r: 18, y: 0.45 }); x.fillStyle = "#e89a9a"; for (const s of [-1, 1]) { x.beginPath(); x.arc(w / 2 + s * 70, h * 0.62, 18, 0, 7); x.fill(); } Z.mund(x, w, h, { b: 0.24, bogen: 0.06, farbe: "#a82a2a" }); x.strokeStyle = "#8a3a2a"; x.lineWidth = 3; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(w / 2 + s * 30, h * 0.66); x.lineTo(w / 2 + s * 36, h * 0.86); x.stroke(); } } });
    const k = f.userData.kopfG, hm = mat("#8a4a2a", 0.9); an(k, rb(1.45, 0.5, 1.45, 0.2, hm), 0, 1.3, 0); for (const s of [-1, 1]) { const z = an(k, zyl(0.17, 0.12, 1.6, hm, 8), s * 0.75, 0.2, 0); }
    return merk(f, "annabelle", "Annabelle"); } },
  billy: { name: "Billy (Saw)", bau: () => { const f = mensch({ haut: "#f4f2ee", hemd: "#1a1a1e", hose: "#1a1a1e", schuhe: "#111", jacke: "#141418", skala: 0.6 });
    kopfHuelle(f, { farbe: "#f4f2ee", zeichne: (x, w, h) => { x.fillStyle = "#c81a1a"; for (const s of [-1, 1]) { x.beginPath(); for (let a = 0; a < 18; a += 0.2) { const r = a * 1.6; x.lineTo(w / 2 + s * 64 + Math.cos(a) * r, h * 0.66 + Math.sin(a) * r); } x.lineWidth = 5; x.strokeStyle = "#c81a1a"; x.stroke(); }
      Z.augen(x, w, h, { farbe: "#0a0a0a", r: 18, y: 0.42 }); Z.augen(x, w, h, { farbe: "#c81a1a", r: 5, y: 0.42 }); x.fillStyle = "#c81a1a"; x.fillRect(w * 0.4, h * 0.72, w * 0.2, h * 0.04); x.strokeStyle = "#555"; x.lineWidth = 4; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(w / 2 + s * 26, h * 0.74); x.lineTo(w / 2 + s * 26, h * 0.98); x.stroke(); } } });
    an(f.userData.kopfG, rb(1.42, 0.35, 1.4, 0.15, mat("#1a1a1a", 0.8)), 0, 1.33, 0); an(f.userData.koerper, kugel(0.18, plastik("#c81a1a"), 10), 0, 3.85, 0.58); const d = P.dreirad(); f.userData.koerper.add(d); d.position.set(0, -0.1, 0.5); d.scale.setScalar(1.6); return merk(f, "billy", "Billy"); } },
  nun: { name: "The Nun (Valak)", bau: () => { const f = mensch({ haut: "#eceae6", hemd: "#0c0c0e", hose: "#0c0c0e", schuhe: "#0c0c0e", skala: 1.08 }); kutte(f, "#0c0c0e", { r0: 1.5 });
    kopfHuelle(f, { farbe: "#efece8", zeichne: (x, w, h) => { Z.adern(x, w, h, "#2a2a36", 7); for (const s of [-1, 1]) { x.fillStyle = "#1a1418"; x.beginPath(); x.ellipse(w / 2 + s * 50, h * 0.44, 34, 28, 0, 0, 7); x.fill(); } Z.augen(x, w, h, { farbe: "#e8c41a", r: 15, y: 0.44, abst: 0.195 }); Z.augen(x, w, h, { farbe: "#0a0a0a", r: 5, y: 0.44, abst: 0.195 });
      x.fillStyle = "#0a0a0a"; x.beginPath(); x.ellipse(w / 2, h * 0.76, 46, 22, 0, 0, 7); x.fill(); Z.zaehne(x, w, h, { y: 0.76, b: 0.3, hoch: 0.1, farbe: "#e8dccc", grund: BLUT }); } });
    const k = f.userData.kopfG, schw = mat("#0c0c0e", 0.85), weiss = mat("#f2f0ec", 0.7);
    an(k, rb(1.62, 1.75, 1.55, 0.35, schw), 0, 0.85, -0.18); an(k, rb(1.42, 0.22, 0.2, 0.08, weiss), 0, 1.36, 0.67); for (const s of [-1, 1]) an(k, rb(0.18, 1.35, 0.2, 0.06, weiss), s * 0.73, 0.68, 0.62);
    an(k, rb(1.85, 2.6, 0.5, 0.25, schw), 0, -0.2, -0.7); return merk(f, "nun", "The Nun"); } },
  kayako: { name: "Kayako (The Grudge)", bau: () => { const f = mensch({ haut: "#d8e0e4", hemd: "#e8eaea", hose: "#e8eaea", schuhe: "#d8e0e4" }); kutte(f, "#e6e8e6", { r0: 1.3, r1: 1.0 });
    langeHaare(f, "#060608", { vorne: false, laenge: 2.4 }); kopfHuelle(f, { farbe: "#dde4e8", b: 1.3, t: 1.3, zeichne: (x, w, h) => { Z.augen(x, w, h, { farbe: "#f8f8f8", r: 20, y: 0.5 }); Z.augen(x, w, h, { farbe: "#0a0a0a", r: 6, y: 0.5 }); x.fillStyle = "#0a0a0c"; x.fillRect(0, 0, w, h * 0.35); Z.mund(x, w, h, { b: 0.16, bogen: 0, farbe: "#3a3a46" }); } });
    return merk(f, "kayako", "Kayako"); } },
  art: { name: "Art the Clown", bau: () => { const f = mensch({ haut: "#f4f4f2", hemd: "#111", hose: "#111", schuhe: "#111", muster: { hemd: "punkte" }, kragen: "#f0f0f0" });
    kopfHuelle(f, { farbe: "#f6f6f4", zeichne: (x, w, h) => { x.fillStyle = "#111"; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(w / 2 + s * 30, h * 0.44); x.lineTo(w / 2 + s * 80, h * 0.36); x.lineTo(w / 2 + s * 60, h * 0.5); x.fill(); } x.beginPath(); x.arc(w / 2, h * 0.58, 14, 0, 7); x.fill();
      x.beginPath(); x.moveTo(w * 0.3, h * 0.72); x.quadraticCurveTo(w / 2, h * 0.86, w * 0.7, h * 0.72); x.quadraticCurveTo(w / 2, h * 0.8, w * 0.3, h * 0.72); x.fill(); Z.zaehne(x, w, h, { y: 0.77, b: 0.26, hoch: 0.05, farbe: "#c8c0a0" }); } });
    hut(f, "mini", "#111"); return merk(f, "art", "Art the Clown"); } },
  hannibal: { name: "Hannibal Lecter", bau: () => { const f = mensch({ haut: "#e8c4a4", hemd: "#f4f4f0", hose: "#f4f4f0", schuhe: "#e8e8e8", frisur: "kurz", haare: "#5a4a3a" });
    const k = f.userData.kopfG, m = mat("#d8d0c0", 0.6); an(k, rb(0.95, 0.65, 0.2, 0.08, m), 0, 0.34, 0.66); for (let i = 0; i < 4; i++) an(k, bx(0.05, 0.6, 0.22, mat("#3a3a3a")), -0.3 + i * 0.2, 0.34, 0.7); an(k, bx(1.4, 0.1, 1.4, mat("#6a4a2a")), 0, 0.5, 0); return merk(f, "hannibal", "Hannibal Lecter"); } },
  jack: { name: "Jack Torrance (The Shining)", bau: () => { const f = mensch({ haut: "#e8c0a0", hemd: "#8a2a2a", hose: "#3a3a40", schuhe: "#2a1a10", jacke: "#5a5a62", frisur: "kurz", haare: "#3a2a1a" });
    inHand(f, P.axt(), { rot: [0.5, 0, 0] }); return merk(f, "jack", "Jack Torrance"); } },
  mother: { name: "Norman Bates („Mother“)", bau: () => { const f = mensch({ haut: "#e8c8b0", hemd: "#4a3a4a", hose: "#4a3a4a", schuhe: "#2a1a1a", frisur: "dutt", haare: "#a8a8a8" }); kutte(f, "#4a3a4a", { r0: 1.35 }); inHand(f, P.messer(), { rot: [-2.6, 0, 0], y: -1.6 }); return merk(f, "mother", "Mother"); } },
  dracula: { name: "Dracula", bau: () => { const f = mensch({ haut: "#e8e0e4", hemd: "#f4f4f4", hose: "#111", schuhe: "#111", jacke: "#111", frisur: "kurz", haare: "#0a0a0a" });
    kopfHuelle(f, { farbe: "#eae2e6", zeichne: (x, w, h) => { x.fillStyle = "#111"; x.beginPath(); x.moveTo(0, 0); x.lineTo(w, 0); x.lineTo(w, h * 0.2); x.lineTo(w / 2, h * 0.32); x.lineTo(0, h * 0.2); x.fill(); Z.augen(x, w, h, { farbe: BLUT, r: 13, y: 0.45 }); Z.mund(x, w, h, { b: 0.3, bogen: 0.02, farbe: "#6a0a0a" }); x.fillStyle = "#fff"; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(w / 2 + s * 22, h * 0.73); x.lineTo(w / 2 + s * 30, h * 0.73); x.lineTo(w / 2 + s * 26, h * 0.83); x.fill(); } } });
    const c = an(f.userData.koerper, new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.8, 3.9, 20, 1, true, Math.PI * 0.75, Math.PI * 1.5), new THREE.MeshStandardMaterial({ color: "#111", side: THREE.DoubleSide, roughness: 0.7 })), 0, 2.1, 0);
    for (const s of [-1, 1]) { const k = an(f.userData.koerper, bx(0.9, 1.2, 0.1, mat("#a8141a", 0.6)), s * 0.9, 4.3, -0.4); k.rotation.y = s * 0.5; } return merk(f, "dracula", "Dracula"); } },
  frankenstein: { name: "Frankensteins Monster", bau: () => { const f = mensch({ haut: "#8ab07a", hemd: "#2a2a2e", hose: "#2a2a2e", schuhe: "#111", jacke: "#1a1a1e", skala: 1.2 });
    kopfHuelle(f, { farbe: "#8ab07a", b: 1.38, h: 1.42, rund: 0.12, y: 0.68, zeichne: (x, w, h) => { x.fillStyle = "#111"; x.fillRect(0, 0, w, h * 0.22); Z.augen(x, w, h, { r: 10, y: 0.42 }); x.fillStyle = "#4a6a3a"; x.fillRect(w * 0.25, h * 0.36, w * 0.5, h * 0.03); x.strokeStyle = "#2a2a2a"; x.lineWidth = 4; x.beginPath(); x.moveTo(w * 0.2, h * 0.28); x.lineTo(w * 0.8, h * 0.3); x.stroke(); for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(w * (0.24 + i * 0.07), h * 0.25); x.lineTo(w * (0.24 + i * 0.07), h * 0.33); x.stroke(); } Z.mund(x, w, h, { b: 0.26, bogen: -0.02 }); } });
    for (const s of [-1, 1]) { const b = an(f.userData.kopfG, zyl(0.1, 0.1, 0.4, mat("#a8acb4", 0.3, 0.8)), s * 0.78, 0.25, 0); b.rotation.z = Math.PI / 2; } return merk(f, "frankenstein", "Frankenstein"); } },
  mumie: { name: "Die Mumie", bau: () => { const f = mensch({ haut: "#d8ccb0", hemd: "#d8ccb0", hose: "#d8ccb0", schuhe: "#c8bca0" }); const t = tex(128, 128, (x, w, h) => { x.fillStyle = "#e0d4b8"; x.fillRect(0, 0, w, h); x.strokeStyle = "#a89a7a"; x.lineWidth = 2; for (let i = 0; i < 12; i++) { x.beginPath(); x.moveTo(0, i * 11 + (i % 3) * 3); x.lineTo(w, i * 11 - (i % 2) * 6); x.stroke(); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping;
    f.traverse(o => { if (o.isMesh && o.material && !o.material.map && o.material.color) { o.material = new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 }); } });
    kopfHuelle(f, { mat: new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 }), zeichne: (x, w, h) => { x.fillStyle = "#1a1408"; x.fillRect(w * 0.2, h * 0.38, w * 0.6, h * 0.1); Z.augen(x, w, h, { farbe: "#e8e030", r: 8, y: 0.43 }); } }); return merk(f, "mumie", "Mumie"); } },
  werwolf: { name: "Werwolf", bau: () => { const f = mensch({ haut: "#5a4232", hemd: "#6a5a7a", hose: "#3a3a52", schuhe: "#4a3428", skala: 1.2 });
    kopfHuelle(f, { farbe: "#5a4232", zeichne: (x, w, h) => { Z.augen(x, w, h, { farbe: "#f0c020", r: 14, y: 0.4, form: "schlitz" }); } }); schnauze(f, "#4a3428", { lang: 0.8, b: 0.8 }); ohren(f, "#5a4232", { form: "spitz", hoch: 1 });
    an(f.userData.kopfG, new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.3), new THREE.MeshStandardMaterial({ map: tex(128, 64, (x, w, h) => Z.zaehne(x, w, h, { y: 0.5, b: 0.9, hoch: 0.8 })), transparent: true })), 0, 0.3, 1.47);
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) an(s > 0 ? f.userData.armR : f.userData.armL, new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.4, 6), mat("#e8e0d0")), -0.3 + i * 0.3, -2.1, 0.2).rotation.x = Math.PI;
    return merk(f, "werwolf", "Werwolf"); } },
  xenomorph: { name: "Xenomorph (Alien)", bau: xeno },
  predator: { name: "Predator", bau: () => { const f = mensch({ haut: "#8a8a5a", hemd: "#5a5a3a", hose: "#3a3a2a", schuhe: "#2a2a1a", weste: "#6a6a72", skala: 1.25 });
    kopfHuelle(f, { farbe: "#9aa0a8", mat: mat("#9aa0a8", 0.35, 0.7), zeichne: (x, w, h) => { x.fillStyle = "#1a1a1a"; for (const s of [-1, 1]) { x.save(); x.translate(w / 2 + s * 46, h * 0.42); x.rotate(-s * 0.3); x.fillRect(-36, -12, 72, 24); x.restore(); } x.fillStyle = "#c81a1a"; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(w / 2 - 20 + i * 20, h * 0.2, 5, 0, 7); x.fill(); } } });
    const k = f.userData.kopfG; for (let i = 0; i < 12; i++) { const a = -2.2 + i * 0.4, d = an(k, zyl(0.08, 0.06, 1.8, mat("#1a1a14", 0.8), 6), Math.cos(a) * 0.62, 0.3, Math.sin(a) * 0.62 - 0.1); d.rotation.x = 0.15; } return merk(f, "predator", "Predator"); } },
  babadook: { name: "Der Babadook", bau: () => { const f = mensch({ haut: "#e8e8e4", hemd: "#0a0a0c", hose: "#0a0a0c", schuhe: "#0a0a0c", skala: 1.25 }); kutte(f, "#0a0a0c", { r0: 1.6 });
    kopfHuelle(f, { farbe: "#ecece8", zeichne: (x, w, h) => { Z.augen(x, w, h, { farbe: "#0a0a0a", r: 28, y: 0.42 }); Z.augen(x, w, h, { farbe: "#ffffff", r: 5, y: 0.42 }); Z.grinsen(x, w, h, { y: 0.66, b: 0.7 }); } }); hut(f, "zylinder", "#0a0a0c");
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) an(s > 0 ? f.userData.armR : f.userData.armL, new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.7, 6), mat("#0a0a0c")), -0.3 + i * 0.2, -2.3, 0.1).rotation.x = Math.PI;
    return merk(f, "babadook", "Babadook"); } },
  megan: { name: "M3GAN", bau: () => { const f = mensch({ haut: "#f0d8c8", hemd: "#e8e4dc", hose: "#2a2a30", schuhe: "#2a2a30", kragen: "#f4f4f4", skala: 0.85 });
    kopfHuelle(f, { farbe: "#f2dccc", zeichne: (x, w, h) => { x.fillStyle = "#fff"; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(w / 2 + s * 50, h * 0.46, 26, 18, 0, 0, 7); x.fill(); } Z.augen(x, w, h, { farbe: "#5a8ac8", r: 11, y: 0.46, abst: 0.195 }); Z.augen(x, w, h, { r: 5, y: 0.46, abst: 0.195 }); Z.mund(x, w, h, { b: 0.18, bogen: 0.02, farbe: "#c87a7a" }); } });
    langeHaare(f, "#f0d080", { laenge: 1.5 }); an(f.userData.koerper, rb(2.05, 0.8, 1.05, 0.1, mat("#2a2a30")), 0, 2.0, 0); return merk(f, "megan", "M3GAN"); } },
  candyman: { name: "Candyman", bau: () => { const f = mensch({ haut: "#6a4a32", hemd: "#2a2a30", hose: "#2a2a30", schuhe: "#111", jacke: "#3a2a22", frisur: "kurz", haare: "#111", skala: 1.15 }); kutte(f, "#3a2a22", { r0: 1.6, r1: 1.2 });
    inHand(f, P.haken(), { y: -1.9 }); return merk(f, "candyman", "Candyman"); } },
  llorona: { name: "La Llorona", bau: () => { const f = mensch({ haut: "#dce0e0", hemd: "#ecece8", hose: "#ecece8", schuhe: "#dce0e0" }); kutte(f, "#ecece6", { r0: 1.5, unten: -0.1 });
    kopfHuelle(f, { farbe: "#e0e4e4", zeichne: (x, w, h) => { for (const s of [-1, 1]) { x.fillStyle = "#1a1a22"; x.beginPath(); x.ellipse(w / 2 + s * 48, h * 0.45, 28, 22, 0, 0, 7); x.fill(); } x.fillStyle = "#3a3a4a"; for (const s of [-1, 1]) x.fillRect(w / 2 + s * 48 - 3, h * 0.5, 6, h * 0.3); Z.mund(x, w, h, { b: 0.2, bogen: -0.06, farbe: "#2a2a36" }); } });
    an(f.userData.kopfG, rb(1.6, 2.4, 1.5, 0.4, new THREE.MeshStandardMaterial({ color: "#f4f4f0", transparent: true, opacity: 0.55, roughness: 0.9 })), 0, 0.3, -0.1); langeHaare(f, "#0a0a0c", { laenge: 2.2 }); return merk(f, "llorona", "La Llorona"); } },
  krampus: { name: "Krampus", bau: () => { const f = mensch({ haut: "#3a2a22", hemd: "#2a1a14", hose: "#2a1a14", schuhe: "#1a100a", skala: 1.25 });
    kopfHuelle(f, { farbe: "#3a2a22", zeichne: (x, w, h) => { Z.augen(x, w, h, { farbe: "#f0a020", r: 14, y: 0.4 }); x.fillStyle = BLUT; x.beginPath(); x.moveTo(w * 0.42, h * 0.7); x.quadraticCurveTo(w / 2, h * 1.2, w * 0.58, h * 0.7); x.fill(); Z.zaehne(x, w, h, { y: 0.68, b: 0.5, hoch: 0.08 }); } });
    for (const s of [-1, 1]) { let p = new THREE.Vector3(s * 0.5, 1.3, 0); for (let i = 0; i < 6; i++) { const q = an(f.userData.kopfG, kugel(0.2 - i * 0.025, mat("#2a1e16", 0.6), 10), p.x + s * i * 0.18, p.y + i * 0.22 - (i > 3 ? (i - 3) * 0.15 : 0), -i * 0.08); } }
    const fell = mat("#4a3428", 0.95); an(f.userData.koerper, rb(2.6, 2.6, 1.5, 0.6, fell), 0, 2.9, 0); inHand(f, P.kette(), { y: -1.9 }); return merk(f, "krampus", "Krampus"); } },
  wendigo: { name: "Wendigo", bau: () => { const f = mensch({ haut: "#4a3e36", hemd: "#4a3e36", hose: "#4a3e36", schuhe: "#2a221e", skala: 1.45 });
    kopfHuelle(f, { farbe: "#ece4d4", b: 1.1, t: 1.6, rund: 0.3, zeichne: (x, w, h) => { Z.augen(x, w, h, { farbe: "#0a0a0a", r: 26, y: 0.4 }); Z.augen(x, w, h, { farbe: "#f8f0e0", r: 4, y: 0.4 }); Z.zaehne(x, w, h, { y: 0.78, b: 0.5, hoch: 0.12, farbe: "#e8e0d0" }); } });
    for (const s of [-1, 1]) { const g = new THREE.Group(); g.position.set(s * 0.45, 1.25, 0); f.userData.kopfG.add(g); const st = an(g, zyl(0.08, 0.1, 1.6, mat("#d8ccb4"), 6), 0, 0.7, 0); st.rotation.z = -s * 0.3; for (let i = 0; i < 3; i++) { const z = an(g, zyl(0.05, 0.07, 0.8, mat("#d8ccb4"), 6), s * (0.3 + i * 0.15), 0.6 + i * 0.4, 0); z.rotation.z = -s * 1.0; } }
    langeArme(f, 1.35, 1); return merk(f, "wendigo", "Wendigo"); } },
  // --- Internet / Creepypasta ---
  slenderman: { name: "Slender Man", bau: () => { const f = mensch({ haut: "#f2f2f0", hemd: "#f4f4f4", hose: "#0e0e10", schuhe: "#0a0a0a", jacke: "#0e0e10", skala: 1.6 });
    kopfHuelle(f, { farbe: "#f4f4f2", rund: 0.45, h: 1.4, y: 0.66 }); an(f.userData.koerper, bx(0.22, 1.2, 0.05, mat("#0a0a0a")), 0, 3.2, 0.56);
    langeArme(f, 1.4, 0.85);
    const t = new THREE.Group(); t.position.set(0, 3.3, -0.55); f.userData.koerper.add(t); t.visible = false; f.userData.tentakel = t;
    for (let i = 0; i < 6; i++) { const a = -1 + i * 0.4; let p = new THREE.Vector3(); for (let j = 0; j < 9; j++) { const n = new THREE.Vector3(Math.sin(a) * j * 0.45, Math.cos(a * 2) * j * 0.25 + j * 0.15, -j * 0.35); an(t, kugel(0.16 - j * 0.012, mat("#0a0a0a"), 8), n.x, n.y, n.z); } }
    return merk(f, "slenderman", "Slender Man"); } },
  sirenhead: { name: "Siren Head", bau: sirenHead },
  jeff: { name: "Jeff the Killer", bau: () => { const f = mensch({ haut: "#f6f6f4", hemd: "#f4f4f4", hose: "#1a1a22", schuhe: "#111", kapuze: true, frisur: "strubbel", haare: "#0a0a0a" });
    kopfHuelle(f, { farbe: "#f8f8f6", b: 1.28, t: 1.28, zeichne: (x, w, h) => { for (const s of [-1, 1]) { x.fillStyle = "#0a0a0a"; x.beginPath(); x.arc(w / 2 + s * 48, h * 0.44, 30, 0, 7); x.fill(); x.fillStyle = "#f8f8f8"; x.beginPath(); x.arc(w / 2 + s * 48, h * 0.44, 20, 0, 7); x.fill(); x.fillStyle = "#0a0a0a"; x.beginPath(); x.arc(w / 2 + s * 48, h * 0.44, 7, 0, 7); x.fill(); }
      x.strokeStyle = BLUT; x.lineWidth = 7; x.beginPath(); x.moveTo(w * 0.12, h * 0.55); x.quadraticCurveTo(w / 2, h * 0.95, w * 0.88, h * 0.55); x.stroke(); x.strokeStyle = "#111"; x.lineWidth = 3; x.beginPath(); x.moveTo(w * 0.15, h * 0.57); x.quadraticCurveTo(w / 2, h * 0.92, w * 0.85, h * 0.57); x.stroke(); } });
    an(f.userData.kopfG, rb(1.42, 0.6, 1.42, 0.25, mat("#0a0a0a", 0.9)), 0, 1.25, -0.05); inHand(f, P.messer(), { rot: [0.3, 0, 0] }); return merk(f, "jeff", "Jeff the Killer"); } },
  rake: { name: "The Rake", bau: () => { const f = mensch({ haut: "#b8b8b0", hemd: "#b8b8b0", hose: "#b8b8b0", schuhe: "#a8a8a0", skala: 1.0 });
    kopfHuelle(f, { farbe: "#b8b8b0", zeichne: (x, w, h) => { Z.augen(x, w, h, { farbe: "#050505", r: 24, y: 0.42 }); Z.mund(x, w, h, { b: 0.4, bogen: 0, farbe: "#2a2a2a", dicke: 4 }); } });
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) an(s > 0 ? f.userData.armR : f.userData.armL, new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.8, 6), mat("#d8d8d0")), -0.3 + i * 0.2, -2.3, 0.1).rotation.x = Math.PI;
    langeArme(f, 1.3, 0.8); return merk(f, "rake", "The Rake"); } },
  momo: { name: "Momo", bau: momo },
  cartooncat: { name: "Cartoon Cat", bau: () => { const f = mensch({ haut: "#f4f4f4", hemd: "#0a0a0a", hose: "#0a0a0a", schuhe: "#0a0a0a", skala: 1.9 });
    kopfHuelle(f, { farbe: "#0a0a0a", zeichne: (x, w, h) => { for (const s of [-1, 1]) { x.fillStyle = "#f4f4f4"; x.beginPath(); x.ellipse(w / 2 + s * 46, h * 0.32, 26, 34, 0, 0, 7); x.fill(); x.fillStyle = "#0a0a0a"; x.beginPath(); x.arc(w / 2 + s * 46, h * 0.36, 10, 0, 7); x.fill(); } Z.grinsen(x, w, h, { y: 0.62, b: 0.95, rand: "#0a0a0a" }); } });
    ohren(f, "#0a0a0a", { form: "spitz", hoch: 1 }); langeArme(f, 1.8, 0.7); return merk(f, "cartooncat", "Cartoon Cat"); } },
  cartoondog: { name: "Cartoon Dog", bau: () => { const f = mensch({ haut: "#f4f4f4", hemd: "#0a0a0a", hose: "#0a0a0a", schuhe: "#0a0a0a", skala: 2.0 });
    kopfHuelle(f, { farbe: "#0a0a0a", zeichne: (x, w, h) => { for (const s of [-1, 1]) { x.fillStyle = "#f4f4f4"; x.beginPath(); x.ellipse(w / 2 + s * 46, h * 0.32, 22, 30, 0, 0, 7); x.fill(); } Z.grinsen(x, w, h, { y: 0.6, b: 0.9, rand: "#0a0a0a" }); } });
    for (const s of [-1, 1]) { const o = an(f.userData.kopfG, rb(0.4, 1.3, 0.2, 0.15, plastik("#0a0a0a")), s * 0.82, 0.6, 0); } const l = an(f.userData.koerper, kugel(0.4, plastik("#f4f4f4")), 0, 4.3, 0.6);
    langeArme(f, 1.7, 0.7); return merk(f, "cartoondog", "Cartoon Dog"); } },
  longhorse: { name: "Long Horse", bau: longHorse },
  scp173: { name: "SCP-173", bau: scp173 },
  scp096: { name: "SCP-096", bau: () => { const f = mensch({ haut: "#e8e4e0", hemd: "#e8e4e0", hose: "#e8e4e0", schuhe: "#d8d4d0", skala: 1.35 });
    kopfHuelle(f, { farbe: "#ece8e4", h: 1.5, y: 0.62, zeichne: (x, w, h) => { Z.augen(x, w, h, { farbe: "#ffffff", r: 18, y: 0.25 }); x.fillStyle = "#0a0505"; x.beginPath(); x.ellipse(w / 2, h * 0.66, 50, 80, 0, 0, 7); x.fill(); Z.zaehne(x, w, h, { y: 0.66, b: 0.36, hoch: 0.6, n: 6 }); } });
    langeArme(f, 1.6, 0.75); return merk(f, "scp096", "SCP-096"); } },
  herobrine: { name: "Herobrine (Minecraft)", bau: () => { const f = mensch({ haut: "#c8966e", hemd: "#2ab8b8", hose: "#3a3aa8", schuhe: "#5a5a5a", frisur: "kurz", haare: "#3a2410" });
    kopfHuelle(f, { farbe: "#c8966e", rund: 0.02, zeichne: (x, w, h) => { x.fillStyle = "#3a2410"; x.fillRect(0, 0, w, h * 0.28); x.fillRect(0, 0, w * 0.12, h * 0.4); x.fillRect(w * 0.88, 0, w * 0.12, h * 0.4); x.fillStyle = "#ffffff"; x.fillRect(w * 0.18, h * 0.44, w * 0.24, h * 0.1); x.fillRect(w * 0.58, h * 0.44, w * 0.24, h * 0.1); x.fillStyle = "#6a3a2a"; x.fillRect(w * 0.38, h * 0.68, w * 0.24, h * 0.08); } });
    return merk(f, "herobrine", "Herobrine"); } },
  // --- Spiele / Mascot-Horror ---
  huggywuggy: { name: "Huggy Wuggy", bau: () => { const f = mensch({ haut: "#f2c21a", hemd: "#2a5ae8", hose: "#2a5ae8", schuhe: "#f2c21a", skala: 1.8 });
    kopfHuelle(f, { farbe: "#2a5ae8", zeichne: (x, w, h) => { Z.augen(x, w, h, { farbe: "#0a0a0a", r: 24, y: 0.38 }); Z.augen(x, w, h, { farbe: "#fff", r: 6, y: 0.35 }); x.fillStyle = "#e8141e"; x.beginPath(); x.moveTo(w * 0.15, h * 0.62); x.quadraticCurveTo(w / 2, h * 0.98, w * 0.85, h * 0.62); x.quadraticCurveTo(w / 2, h * 0.78, w * 0.15, h * 0.62); x.fill(); Z.zaehne(x, w, h, { y: 0.75, b: 0.55, hoch: 0.1 }); } });
    ohren(f, "#2a5ae8", { form: "baer" }); langeArme(f, 1.9, 0.8); return merk(f, "huggywuggy", "Huggy Wuggy"); } },
  kissymissy: { name: "Kissy Missy", bau: () => { const f = mensch({ haut: "#f2c21a", hemd: "#e85aa0", hose: "#e85aa0", schuhe: "#f2c21a", skala: 1.8 });
    kopfHuelle(f, { farbe: "#e85aa0", zeichne: (x, w, h) => { Z.augen(x, w, h, { farbe: "#0a0a0a", r: 22, y: 0.38 }); x.strokeStyle = "#0a0a0a"; x.lineWidth = 4; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(w / 2 + s * (40 + i * 10), h * 0.3); x.lineTo(w / 2 + s * (46 + i * 14), h * 0.22); x.stroke(); } x.fillStyle = "#e8141e"; x.beginPath(); x.ellipse(w / 2, h * 0.7, 60, 22, 0, 0, 7); x.fill(); } });
    ohren(f, "#e85aa0", { form: "baer" }); an(f.userData.kopfG, kugel(0.25, plastik("#f4f4f4")), 0.5, 1.45, 0.3); langeArme(f, 1.9, 0.8); return merk(f, "kissymissy", "Kissy Missy"); } },
  mommylonglegs: { name: "Mommy Long Legs", bau: mommy },
  catnap: { name: "CatNap", bau: () => { const f = mensch({ haut: "#8a5ac8", hemd: "#8a5ac8", hose: "#8a5ac8", schuhe: "#7a4ab8", skala: 1.5 });
    kopfHuelle(f, { farbe: "#8a5ac8", zeichne: (x, w, h) => { for (const s of [-1, 1]) { x.fillStyle = "#e8f0ff"; x.beginPath(); x.ellipse(w / 2 + s * 46, h * 0.42, 22, 26, 0, 0, 7); x.fill(); x.fillStyle = "#0a0a0a"; x.beginPath(); x.ellipse(w / 2 + s * 46, h * 0.42, 6, 18, 0, 0, 7); x.fill(); } x.fillStyle = "#e85a8a"; x.beginPath(); x.moveTo(w / 2 - 10, h * 0.56); x.lineTo(w / 2 + 10, h * 0.56); x.lineTo(w / 2, h * 0.62); x.fill(); Z.mund(x, w, h, { b: 0.3, y: 0.68, bogen: 0.05 }); } });
    ohren(f, "#8a5ac8", { form: "spitz" }); an(f.userData.koerper, new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), new THREE.MeshStandardMaterial({ map: tex(128, 80, (x, w, h) => { x.fillStyle = "#f8e050"; x.beginPath(); x.arc(w / 2, h / 2, 28, 0.6, 5.7); x.lineTo(w / 2, h / 2); x.fill(); }), transparent: true })), 0, 3.1, 0.56);
    return merk(f, "catnap", "CatNap"); } },
  freddyfazbear: { name: "Freddy Fazbear (FNAF)", bau: () => { const f = mensch({ haut: "#7a4a2a", hemd: "#7a4a2a", hose: "#7a4a2a", schuhe: "#6a3a1a", skala: 1.4 });
    kopfHuelle(f, { farbe: "#7a4a2a", zeichne: (x, w, h) => { Z.augen(x, w, h, { farbe: "#f4f4f4", r: 22, y: 0.36 }); Z.augen(x, w, h, { farbe: "#3a6ac8", r: 9, y: 0.36 }); x.fillStyle = "#2a1a0a"; for (const s of [-1, 1]) x.fillRect(w / 2 + s * 50 - 24, h * 0.22, 48, 8); } });
    schnauze(f, "#c8946a", { lang: 0.5, b: 0.9 }); an(f.userData.kopfG, kugel(0.14, plastik("#1a1a1a")), 0, 0.6, 1.18); ohren(f, "#7a4a2a"); hut(f, "zylinder", "#111"); an(f.userData.koerper, rb(0.7, 0.3, 0.15, 0.08, plastik("#111")), 0, 3.85, 0.58);
    an(f.userData.koerper, kugel(1.15, plastik("#c8946a")), 0, 2.7, 0.15).scale.set(1, 1.1, 0.5); inHand(f, P.mikro(), { y: -1.9, z: 0.3 }); return merk(f, "freddyfazbear", "Freddy Fazbear"); } },
  bonnie: { name: "Bonnie (FNAF)", bau: () => { const f = mensch({ haut: "#5a5ab8", hemd: "#5a5ab8", hose: "#5a5ab8", schuhe: "#4a4aa8", skala: 1.4 });
    kopfHuelle(f, { farbe: "#5a5ab8", zeichne: (x, w, h) => { Z.augen(x, w, h, { farbe: "#f4f4f4", r: 22, y: 0.36 }); Z.augen(x, w, h, { farbe: "#c83a8a", r: 9, y: 0.36 }); } }); schnauze(f, "#a8a8e0", { lang: 0.5, b: 0.9 }); an(f.userData.kopfG, kugel(0.14, plastik("#c83a5a")), 0, 0.6, 1.18);
    ohren(f, "#5a5ab8", { form: "hase", innen: "#a8a8e0" }); an(f.userData.koerper, rb(0.7, 0.3, 0.15, 0.08, plastik("#c81a1a")), 0, 3.85, 0.58); an(f.userData.koerper, kugel(1.15, plastik("#a8a8e0")), 0, 2.7, 0.15).scale.set(1, 1.1, 0.5); inHand(f, P.gitarre(), { y: -1.8, z: 0.7, rot: [0, 0, 0.8] }); return merk(f, "bonnie", "Bonnie"); } },
  chica: { name: "Chica (FNAF)", bau: () => { const f = mensch({ haut: "#f2c21a", hemd: "#f2c21a", hose: "#f2c21a", schuhe: "#e8902a", skala: 1.4 });
    kopfHuelle(f, { farbe: "#f2c21a", zeichne: (x, w, h) => { Z.augen(x, w, h, { farbe: "#f4f4f4", r: 22, y: 0.36 }); Z.augen(x, w, h, { farbe: "#c83a8a", r: 9, y: 0.36 }); } }); schnauze(f, "#f2902a", { lang: 0.6, b: 0.9 });
    an(f.userData.koerper, new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.6), new THREE.MeshStandardMaterial({ map: tex(256, 240, (x, w, h) => { x.fillStyle = "#f4f4f4"; x.fillRect(0, 0, w, h); x.fillStyle = "#e8822a"; x.fillRect(0, 0, w, 14); x.fillStyle = "#3a8ae8"; x.font = "900 54px 'Inter Display', sans-serif"; x.textAlign = "center"; x.fillText("LET'S", w / 2, 100); x.fillStyle = "#e85aa0"; x.fillText("EAT!!!", w / 2, 170); }), roughness: 0.7 })), 0, 2.85, 0.56);
    return merk(f, "chica", "Chica"); } },
  foxy: { name: "Foxy (FNAF)", bau: () => { const f = mensch({ haut: "#b83a22", hemd: "#b83a22", hose: "#6a3a2a", schuhe: "#a8321e", skala: 1.4 });
    kopfHuelle(f, { farbe: "#b83a22", zeichne: (x, w, h) => { Z.augen(x, w, h, { farbe: "#f4f4f4", r: 22, y: 0.36 }); Z.augen(x, w, h, { farbe: "#f2c21a", r: 9, y: 0.36 }); x.fillStyle = "#111"; x.beginPath(); x.ellipse(w / 2 + 50, h * 0.36, 30, 26, 0, 0, 7); x.fill(); x.fillRect(0, h * 0.18, w, 8); } });
    schnauze(f, "#c8946a", { lang: 0.8, b: 0.7 }); ohren(f, "#b83a22", { form: "spitz", hoch: 0.6 }); inHand(f, P.haken(), { y: -1.8 }); return merk(f, "foxy", "Foxy"); } },
  springtrap: { name: "Springtrap (FNAF)", bau: () => { const f = mensch({ haut: "#7a8a4a", hemd: "#7a8a4a", hose: "#6a7a3a", schuhe: "#5a6a2a", skala: 1.45 });
    kopfHuelle(f, { farbe: "#7a8a4a", zeichne: (x, w, h) => { x.fillStyle = "#2a2a1a"; for (let i = 0; i < 14; i++) { x.beginPath(); x.arc((i * 61) % w, (i * 97) % h, 8 + (i % 3) * 4, 0, 7); x.fill(); } Z.augen(x, w, h, { farbe: "#f4f4f4", r: 18, y: 0.36 }); Z.augen(x, w, h, { farbe: "#3a3a3a", r: 8, y: 0.36 }); Z.zaehne(x, w, h, { y: 0.8, b: 0.6, hoch: 0.12, farbe: "#d8d0b0", grund: "#1a1a10" }); } });
    ohren(f, "#7a8a4a", { form: "hase", innen: "#5a6a2a" }); for (let i = 0; i < 5; i++) { const d = an(f.userData.koerper, zyl(0.03, 0.03, 0.6, mat("#3a3a3a"), 4), -0.6 + i * 0.3, 2.6 + (i % 2) * 0.4, 0.56); d.rotation.z = 0.4 * (i - 2); } return merk(f, "springtrap", "Springtrap"); } },
  granny: { name: "Granny (Spiel)", bau: () => { const f = mensch({ haut: "#e8e0d8", hemd: "#b8b0a0", hose: "#b8b0a0", schuhe: "#4a3a2a", frisur: "dutt", haare: "#e0e0e0" }); kutte(f, "#bab2a2", { r0: 1.35 });
    kopfHuelle(f, { farbe: "#e8e2da", zeichne: (x, w, h) => { x.fillStyle = "#e0e0e0"; x.fillRect(0, 0, w, h * 0.2); Z.augen(x, w, h, { farbe: "#ffffff", r: 18, y: 0.44 }); Z.augen(x, w, h, { farbe: "#0a0a0a", r: 4, y: 0.44 }); Z.zaehne(x, w, h, { y: 0.74, b: 0.3, hoch: 0.08, farbe: "#c8b880" }); Z.blut(x, w, h, { y0: 0.82, n: 2 }); } });
    an(f.userData.kopfG, kugel(0.4, mat("#e0e0e0", 0.95)), 0, 1.45, -0.3); inHand(f, P.schlaeger(), { rot: [0.5, 0, 0] }); return merk(f, "granny", "Granny"); } },
  baldi: { name: "Baldi", bau: () => { const f = mensch({ haut: "#f0c8a0", hemd: "#2ab84a", hose: "#3a3a5a", schuhe: "#2a2a2a" });
    kopfHuelle(f, { farbe: "#f0c8a0", rund: 0.5, zeichne: (x, w, h) => { Z.augen(x, w, h, { r: 10, y: 0.44 }); x.strokeStyle = "#111"; x.lineWidth = 5; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(w / 2 + s * 30, h * 0.32); x.lineTo(w / 2 + s * 70, h * 0.36); x.stroke(); } Z.mund(x, w, h, { b: 0.36, bogen: 0.08 }); } });
    an(f.userData.kopfG, rb(0.5, 0.15, 0.15, 0.06, mat("#3a2a1a")), 0, 1.0, 0.68); const l = inHand(f, new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.4, 0.4), mat("#d8a868")), { y: -2.4, z: 0.2 }); return merk(f, "baldi", "Baldi"); } },
  banban: { name: "Banban (Garten of Banban)", bau: () => { const f = mensch({ haut: "#e8222a", hemd: "#e8222a", hose: "#e8222a", schuhe: "#c81a1a", skala: 1.5 });
    kopfHuelle(f, { farbe: "#e8222a", zeichne: (x, w, h) => { for (const s of [-1, 1]) { x.fillStyle = "#f4f4f4"; x.beginPath(); x.arc(w / 2 + s * 46, h * 0.4, 30, 0, 7); x.fill(); x.fillStyle = "#0a0a0a"; x.beginPath(); x.arc(w / 2 + s * 46, h * 0.42, 12, 0, 7); x.fill(); } x.fillStyle = "#f2c21a"; x.beginPath(); x.ellipse(w / 2, h * 0.68, 56, 22, 0, 0, 7); x.fill(); Z.mund(x, w, h, { b: 0.2, y: 0.68, bogen: 0.04 }); } });
    const hm = an(f.userData.kopfG, new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.8, 16), plastik("#3a8ae8")), 0, 1.7, 0); an(f.userData.kopfG, kugel(0.18, plastik("#f2c21a")), 0, 2.15, 0); return merk(f, "banban", "Banban"); } },
};
export const HORROR_IDS = Object.keys(HORROR);
const CACHE = new Map();
// horror(id) baut die Figur (jedes Mal neu; für mehrere gleiche Figuren mehrmals aufrufen). Neue Figuren: Eintrag in HORROR + Liste in vorlagen/horrorfiguren.md
export const horror = (id) => { const e = HORROR[id]; if (!e) throw new Error("Unbekannte Horrorfigur: " + id); const g = e.bau(); if (!g.parent) scene.add(g); return g; };
