// Objekt-Sammlung der Blockstadt-Bibliothek (Jonathan 23.11.). Jede Funktion baut EIN Objekt und gibt eine THREE.Group zurück,
// noch nicht in der Szene: const b = O.baum({ art: "rund" }); b.position.set(x, 0, z); scene.add(b);
// Maßstab: eine Figur (skala 1) ist ca. 4,1 m groß, Türen ca. 5,5 m, Autos 1,7-fach. Boden = y 0, vorne = +z.
// Vorschau jedes Objekts: node block/katalog_bilder.cjs <name> → block/katalog/<name>.jpg (siehe KATALOG.md).
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const mat = (c, r = 0.7, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
const plastik = c => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.3 });
const metall = (c = "#9aa0a8") => new THREE.MeshStandardMaterial({ color: c, roughness: 0.35, metalness: 0.7 });
const leucht = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b) });
const rb = (w, h, d, r, m) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2)), m);
const bx = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const zyl = (r0, r1, h, m, s = 20) => new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, s), m);
const kugel = (r, m, s = 18) => new THREE.Mesh(new THREE.SphereGeometry(r, s, Math.round(s * 0.7)), m);
const an = (g, o, x = 0, y = 0, z = 0) => { o.position.set(x, y, z); g.add(o); return o; };
const tex = (w, h, fn, rep = null) => { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); } return t; };
const streifenTex = (a, b, n = 8, quer = false) => tex(256, 256, (x, w, h) => { for (let i = 0; i < n; i++) { x.fillStyle = i % 2 ? b : a; quer ? x.fillRect(0, i * h / n, w, h / n) : x.fillRect(i * w / n, 0, w / n, h); } });
// deterministischer Zufall, damit jedes Objekt in jedem Bild gleich aussieht (kein Flackern)
const zufall = (s = 1) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

// ---------- Natur ----------
// art: "rund" (Wolken-Krone aus Kugeln), "nadel" (Tanne), "kegel" (Pyramiden-Pappel), "busch"
export const baum = ({ art = "rund", groesse = 1, krone = "#5ab84a", stamm = "#7a5232", saat = 3 } = {}) => {
  const g = new THREE.Group(), r = zufall(saat), km = mat(krone, 0.8), dunkel = mat(new THREE.Color(krone).multiplyScalar(0.78), 0.8);
  if (art === "busch") { for (let i = 0; i < 6; i++) an(g, kugel(0.9 + r() * 0.5, i % 2 ? km : dunkel), (r() - 0.5) * 2, 0.8 + r() * 0.5, (r() - 0.5) * 2); }
  else if (art === "nadel") { an(g, zyl(0.35, 0.45, 2, mat(stamm)), 0, 1, 0); for (let i = 0; i < 4; i++) an(g, new THREE.Mesh(new THREE.ConeGeometry(3 - i * 0.6, 2.6, 10), i % 2 ? km : dunkel), 0, 2.6 + i * 1.6, 0); }
  else if (art === "kegel") { an(g, zyl(0.3, 0.4, 2.4, mat(stamm)), 0, 1.2, 0); const k = an(g, kugel(1.8, km), 0, 5.8, 0); k.scale.set(1, 2.2, 1); }
  else { an(g, zyl(0.38, 0.55, 4.2, mat(stamm)), 0, 2.1, 0);
    for (const [x, y, z, s] of [[0, 6.4, 0, 2.6], [-1.6, 5.4, 0.6, 1.9], [1.7, 5.6, -0.4, 2.0], [0.3, 5.2, 1.6, 1.8], [-0.4, 5.6, -1.6, 1.8], [0.6, 7.6, 0.3, 1.7]]) an(g, kugel(s * (0.9 + r() * 0.2), r() > 0.4 ? km : dunkel, 20), x, y, z); }
  g.scale.setScalar(groesse); return g; };
export const blumenkuebel = ({ farbe = "#d8704a", blueten = ["#ff5a7a", "#ffd23a", "#ffffff"] } = {}) => {
  const g = new THREE.Group(); an(g, rb(2.4, 1.2, 1.2, 0.12, mat(farbe, 0.7)), 0, 0.6, 0); an(g, bx(2.2, 0.1, 1.0, mat("#5a3a22")), 0, 1.18, 0);
  const r = zufall(7); for (let i = 0; i < 9; i++) { const x = -0.9 + (i % 5) * 0.45, z = i < 5 ? -0.2 : 0.25; an(g, zyl(0.04, 0.04, 0.6, mat("#3a8a3a"), 6), x, 1.5, z); an(g, kugel(0.2, mat(blueten[i % blueten.length], 0.6), 10), x, 1.85 + r() * 0.1, z); }
  return g; };
export const hecke = ({ laenge = 6, farbe = "#4aa848" } = {}) => { const g = new THREE.Group(); an(g, rb(laenge, 2, 1.4, 0.4, mat(farbe, 0.85)), 0, 1, 0); return g; };

// ---------- Straße ----------
export const bank = ({ holz = "#c8864a", eisen = "#2a2e36" } = {}) => {
  const g = new THREE.Group(), hm = mat(holz, 0.6), em = metall(eisen);
  for (let i = 0; i < 3; i++) an(g, rb(5, 0.18, 0.5, 0.05, hm), 0, 1.6, -0.6 + i * 0.6);
  for (let i = 0; i < 2; i++) { const l = an(g, rb(5, 0.18, 0.45, 0.05, hm), 0, 2.4 + i * 0.6, -1.0); l.rotation.x = -0.15; }
  for (const x of [-2.1, 2.1]) { an(g, bx(0.18, 1.6, 0.18, em), x, 0.8, 0.6); an(g, bx(0.18, 3.2, 0.18, em), x, 1.6, -1.05); an(g, bx(0.18, 0.18, 1.8, em), x, 1.5, -0.2); }
  return g; };
export const laterne = ({ hoehe = 9, an: leuchtet = true } = {}) => {
  const g = new THREE.Group(), em = metall("#262a32"); an(g, zyl(0.4, 0.5, 0.8, em, 12), 0, 0.4, 0); an(g, zyl(0.16, 0.2, hoehe, em, 12), 0, hoehe / 2, 0);
  an(g, zyl(0.7, 0.4, 0.5, em, 12), 0, hoehe + 0.2, 0); an(g, zyl(0.45, 0.45, 0.9, leuchtet ? leucht(3, 2.4, 1.4) : mat("#e8e0c8"), 16), 0, hoehe - 0.4, 0);
  if (leuchtet) { const l = new THREE.PointLight("#ffcf8a", 20, 18, 1.8); l.position.y = hoehe - 1; g.add(l); } return g; };
export const ampel = ({ phase = "rot" } = {}) => {
  const g = new THREE.Group(), em = metall("#30343c"); an(g, zyl(0.16, 0.2, 7, em, 12), 0, 3.5, 0); an(g, rb(0.9, 2.4, 0.7, 0.15, plastik("#1c1e24")), 0, 7.6, 0);
  [["rot", "#ff2a2a", 8.35], ["gelb", "#ffc02a", 7.6], ["gruen", "#2aff6a", 6.85]].forEach(([n, c, y]) => { const col = new THREE.Color(c); an(g, kugel(0.25, n === phase ? leucht(col.r * 3, col.g * 3, col.b * 3) : mat(col.clone().multiplyScalar(0.25)), 14), 0, y, 0.33); });
  return g; };
export const hydrant = ({ farbe = "#e83a2a" } = {}) => { const g = new THREE.Group(), m = plastik(farbe); an(g, zyl(0.45, 0.5, 1.6, m), 0, 0.8, 0); an(g, kugel(0.45, m), 0, 1.6, 0); an(g, zyl(0.15, 0.15, 0.3, m, 10), 0, 2.05, 0);
  for (const s of [-1, 1]) { const a = an(g, zyl(0.16, 0.16, 0.45, m, 10), s * 0.55, 1.15, 0); a.rotation.z = Math.PI / 2; } an(g, zyl(0.6, 0.6, 0.15, m), 0, 0.08, 0); return g; };
export const muelltonne = ({ farbe = "#3a6a4a", deckel = "#2a4a34" } = {}) => { const g = new THREE.Group(); an(g, rb(1.5, 2.2, 1.5, 0.12, plastik(farbe)), 0, 1.1, 0); an(g, rb(1.6, 0.2, 1.6, 0.06, plastik(deckel)), 0, 2.25, 0);
  for (const x of [-0.5, 0.5]) { const r = an(g, zyl(0.2, 0.2, 0.12, mat("#111"), 12), x, 0.2, 0.78); r.rotation.x = Math.PI / 2; } return g; };
export const briefkasten = ({ farbe = "#f2c21a" } = {}) => { const g = new THREE.Group(); an(g, zyl(0.12, 0.12, 2.6, metall("#555"), 10), 0, 1.3, 0); const k = an(g, rb(1.2, 1.4, 0.9, 0.3, plastik(farbe)), 0, 3.1, 0);
  an(g, bx(0.7, 0.08, 0.05, mat("#111")), 0, 3.4, 0.46); return g; };
export const schild = ({ text = "STOPP", farbe = "#e83a2a", form = "rund" } = {}) => { const g = new THREE.Group(); an(g, zyl(0.1, 0.1, 5, metall(), 10), 0, 2.5, 0);
  const t = tex(256, 256, (x, w, h) => { x.fillStyle = farbe; if (form === "rund") { x.beginPath(); x.arc(w / 2, h / 2, w / 2 - 4, 0, 7); x.fill(); } else x.fillRect(0, 0, w, h); x.fillStyle = "#fff"; x.font = `900 ${Math.min(90, 520 / text.length)}px 'Inter Display', Inter, sans-serif`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, w / 2, h / 2 + 4); });
  an(g, new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.5 })), 0, 5.2, 0.12); return g; };
export const zaun = ({ laenge = 8, farbe = "#f4f0e8" } = {}) => { const g = new THREE.Group(), m = mat(farbe, 0.6); const n = Math.round(laenge / 0.8);
  for (let i = 0; i <= n; i++) { const p = an(g, bx(0.3, 2.2, 0.14, m), -laenge / 2 + i * laenge / n, 1.1, 0); const s = an(g, new THREE.Mesh(new THREE.ConeGeometry(0.21, 0.35, 4), m), p.position.x, 2.37, 0); s.rotation.y = Math.PI / 4; }
  for (const y of [0.6, 1.6]) an(g, bx(laenge + 0.3, 0.18, 0.1, m), 0, y, -0.12); return g; };
export const brunnen = ({ stein = "#d8d0c0", wasser = "#5ab8e8" } = {}) => { const g = new THREE.Group(), sm = mat(stein, 0.8);
  an(g, zyl(6, 6.3, 1.2, sm, 40), 0, 0.6, 0); an(g, zyl(5.4, 5.4, 0.1, new THREE.MeshPhysicalMaterial({ color: wasser, roughness: 0.08, clearcoat: 1, transmission: 0.1 }), 40), 0, 1.0, 0);
  an(g, zyl(0.8, 1.1, 3, sm, 20), 0, 2.4, 0); an(g, zyl(2.2, 1.0, 0.5, sm, 30), 0, 4.0, 0); an(g, zyl(1.9, 1.9, 0.08, mat(wasser, 0.1), 30), 0, 4.26, 0);
  const strahl = an(g, zyl(0.12, 0.3, 2.4, new THREE.MeshPhysicalMaterial({ color: "#bfe8ff", roughness: 0.05, transparent: true, opacity: 0.75 }), 12), 0, 5.4, 0); g.userData.strahl = strahl; return g; };
// Ladenfront mit gestreifter Markise und Schild; breite in m, Front schaut nach +z
export const laden = ({ name = "BÄCKEREI", wand = "#f4b8c8", markise = ["#ffffff", "#e84a6a"], breite = 12 } = {}) => {
  const g = new THREE.Group(); an(g, bx(breite, 9, 1, mat(wand, 0.85)), 0, 4.5, -0.5);
  const fm = new THREE.MeshPhysicalMaterial({ color: "#9ad0f0", roughness: 0.05, metalness: 0.1, clearcoat: 1, emissive: "#3a5a7a", emissiveIntensity: 0.25 });
  an(g, bx(breite * 0.55, 4.2, 0.1, fm), -breite * 0.15, 2.6, 0.02); an(g, bx(2.4, 4.8, 0.1, mat("#6a4a32", 0.6)), breite * 0.32, 2.4, 0.02);
  an(g, bx(breite * 0.55 + 0.3, 0.25, 0.3, mat("#ffffff", 0.5)), -breite * 0.15, 0.55, 0.1);
  const mk = an(g, new THREE.Mesh(new THREE.PlaneGeometry(breite, 2.4), new THREE.MeshStandardMaterial({ map: streifenTex(markise[0], markise[1], 12), side: THREE.DoubleSide, roughness: 0.8 })), 0, 5.9, 1.1); mk.rotation.x = -0.6;
  for (let i = 0; i < 12; i++) { const z = an(g, new THREE.Mesh(new THREE.CircleGeometry(breite / 24, 12, 0, Math.PI), mat(i % 2 ? markise[1] : markise[0], 0.8)), -breite / 2 + (i + 0.5) * breite / 12, 4.95, 2.08); z.rotation.z = Math.PI; z.material.side = THREE.DoubleSide; }
  const st = tex(1024, 192, (x, w, h) => { x.fillStyle = "#2a2a3a"; x.fillRect(0, 0, w, h); x.fillStyle = "#fff6d0"; x.font = "900 120px 'Inter Display', Inter, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(name, w / 2, h / 2 + 6); });
  an(g, new THREE.Mesh(new THREE.PlaneGeometry(breite * 0.7, breite * 0.13), new THREE.MeshBasicMaterial({ map: st, color: new THREE.Color(1.3, 1.3, 1.3) })), 0, 7.6, 0.05); return g; };
// Bushaltestelle mit Dach und Sitz
export const haltestelle = ({ farbe = "#2a8ae8" } = {}) => { const g = new THREE.Group(), em = metall("#3a3e48");
  for (const x of [-3, 3]) an(g, bx(0.2, 6, 0.2, em), x, 3, -1); an(g, rb(7, 0.3, 3, 0.1, plastik(farbe)), 0, 6.1, 0);
  an(g, bx(6.2, 4.6, 0.08, new THREE.MeshPhysicalMaterial({ color: "#cfe8ff", roughness: 0.05, transparent: true, opacity: 0.35 })), 0, 3.3, -1.1); an(g, rb(5, 0.25, 0.9, 0.05, mat("#c8864a", 0.6)), 0, 1.6, -0.6);
  an(g, bx(0.15, 7, 0.15, em), 3.6, 3.5, 1.2); an(g, zyl(0.7, 0.7, 0.12, plastik("#2ab04a"), 20), 3.6, 7.2, 1.25).rotation.x = Math.PI / 2; return g; };

// ---------- Fahrzeuge ----------
export const fahrrad = ({ farbe = "#e83a3a" } = {}) => { const g = new THREE.Group(), rm = mat("#18181c", 0.6), fm = plastik(farbe);
  for (const z of [-1.2, 1.2]) { const r = an(g, new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.1, 8, 24), rm), 0, 0.85, z); r.rotation.y = Math.PI / 2; }
  const rohr = (a, b) => { const v = new THREE.Vector3().subVectors(b, a); const m = an(g, zyl(0.07, 0.07, v.length(), fm, 8)); m.position.copy(a).addScaledVector(v, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize()); };
  const V = (y, z) => new THREE.Vector3(0, y, z); rohr(V(0.85, -1.2), V(1.0, 0)); rohr(V(1.0, 0), V(0.85, 1.2)); rohr(V(1.0, 0), V(1.9, -0.3)); rohr(V(1.9, -0.3), V(2.0, 0.9)); rohr(V(2.0, 0.9), V(0.85, 1.2)); rohr(V(0.85, -1.2), V(1.9, -0.3));
  an(g, rb(0.35, 0.12, 0.7, 0.05, mat("#222")), 0, 2.0, -0.35); const l = an(g, zyl(0.05, 0.05, 1.1, metall(), 8), 0, 2.15, 0.9); l.rotation.z = Math.PI / 2; return g; };
export const bus = ({ farbe = "#f2c21a", text = "LINIE 7" } = {}) => { const g = new THREE.Group(); an(g, rb(4.4, 5, 16, 0.5, plastik(farbe)), 0, 3.2, 0);
  const gm = new THREE.MeshPhysicalMaterial({ color: "#2a3a4a", roughness: 0.05, clearcoat: 1, emissive: "#1a2a3a", emissiveIntensity: 0.3 });
  for (const s of [-1, 1]) an(g, bx(0.05, 1.8, 13, gm), s * 2.21, 4.0, -0.6); an(g, bx(3.8, 2.2, 0.05, gm), 0, 4.0, 8.01);
  for (const [x, z] of [[-2, 5.5], [2, 5.5], [-2, -5.5], [2, -5.5]]) { const r = an(g, zyl(1, 1, 0.8, mat("#16161a", 0.7), 20), x, 1, z); r.rotation.z = Math.PI / 2; }
  for (const x of [-1.5, 1.5]) an(g, kugel(0.3, leucht(3, 2.8, 2.2), 12), x, 1.9, 8.02);
  const st = tex(512, 96, (x, w, h) => { x.fillStyle = "#111"; x.fillRect(0, 0, w, h); x.fillStyle = "#ffb02a"; x.font = "900 70px 'DejaVu Sans Mono', monospace"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, w / 2, h / 2 + 4); });
  an(g, new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.64), new THREE.MeshBasicMaterial({ map: st, color: new THREE.Color(1.5, 1.5, 1.5) })), 0, 5.4, 8.03); return g; };

// ---------- Tiere (Blockstil, passend zu den Figuren) ----------
const tierKopf = (g, fell, y, z, ohren = "spitz") => { const k = an(g, rb(1.1, 1.0, 1.0, 0.25, plastik(fell)), 0, y, z);
  for (const s of [-1, 1]) { const a = an(g, kugel(0.12, mat("#111", 0.3), 10), s * 0.24, y + 0.12, z + 0.5); const gl = an(g, kugel(0.04, leucht(2, 2, 2), 6), s * 0.24 + 0.04, y + 0.17, z + 0.6); }
  an(g, kugel(0.11, mat("#2a1a1a", 0.4), 10), 0, y - 0.12, z + 0.56);
  for (const s of [-1, 1]) { const o = ohren === "spitz" ? an(g, new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.45, 4), plastik(fell)), s * 0.35, y + 0.65, z) : an(g, rb(0.3, 0.6, 0.15, 0.07, plastik(new THREE.Color(fell).multiplyScalar(0.7))), s * 0.62, y - 0.05, z); if (ohren !== "spitz") o.rotation.z = s * 0.3; }
  return k; };
export const hund = ({ fell = "#c8864a", groesse = 1 } = {}) => { const g = new THREE.Group(); an(g, rb(1.1, 1.0, 2.2, 0.25, plastik(fell)), 0, 1.2, 0);
  for (const [x, z] of [[-0.35, 0.75], [0.35, 0.75], [-0.35, -0.75], [0.35, -0.75]]) an(g, rb(0.32, 0.8, 0.32, 0.08, plastik(fell)), x, 0.4, z);
  tierKopf(g, fell, 1.95, 1.2, "haengend"); const s = an(g, rb(0.18, 0.18, 0.8, 0.06, plastik(fell)), 0, 1.6, -1.35); s.rotation.x = 0.7; g.userData.schwanz = s; g.scale.setScalar(groesse); return g; };
export const katze = ({ fell = "#4a4a52", groesse = 0.8 } = {}) => { const g = new THREE.Group(); an(g, rb(0.9, 0.8, 1.8, 0.25, plastik(fell)), 0, 1.0, 0);
  for (const [x, z] of [[-0.28, 0.6], [0.28, 0.6], [-0.28, -0.6], [0.28, -0.6]]) an(g, rb(0.25, 0.7, 0.25, 0.08, plastik(fell)), x, 0.35, z);
  tierKopf(g, fell, 1.65, 1.0, "spitz"); const s = an(g, zyl(0.08, 0.08, 1.4, plastik(fell), 8), 0, 1.8, -1.05); s.rotation.x = -0.4; g.userData.schwanz = s; g.scale.setScalar(groesse); return g; };
export const vogel = ({ farbe = "#4ab8ff", groesse = 0.5 } = {}) => { const g = new THREE.Group(); an(g, kugel(0.6, plastik(farbe)), 0, 0.7, 0);
  an(g, kugel(0.4, plastik(farbe)), 0, 1.25, 0.35); const sn = an(g, new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 8), plastik("#ffb02a")), 0, 1.2, 0.85); sn.rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) { an(g, kugel(0.07, mat("#111"), 8), s * 0.17, 1.35, 0.68); const f = an(g, rb(0.15, 0.6, 0.9, 0.07, plastik(new THREE.Color(farbe).multiplyScalar(0.75))), s * 0.6, 0.8, -0.05); f.rotation.z = s * 0.2; g.userData["fluegel" + (s > 0 ? "R" : "L")] = f; }
  g.scale.setScalar(groesse); return g; };

// ---------- Möbel und Kleinkram (für eigene Räume) ----------
export const tisch = ({ breite = 4, tiefe = 2.4, farbe = "#c89a62" } = {}) => { const g = new THREE.Group(), m = mat(farbe, 0.6); an(g, rb(breite, 0.22, tiefe, 0.06, m), 0, 2.2, 0);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) an(g, zyl(0.1, 0.1, 2.1, m, 8), x * (breite / 2 - 0.3), 1.05, z * (tiefe / 2 - 0.3)); return g; };
export const stuhl = ({ farbe = "#4a8ae8" } = {}) => { const g = new THREE.Group(), m = mat(farbe, 0.5); an(g, rb(1.4, 0.18, 1.4, 0.05, m), 0, 1.3, 0); an(g, rb(1.4, 1.5, 0.16, 0.05, m), 0, 2.1, -0.65);
  for (const [x, z] of [[-0.55, -0.55], [0.55, -0.55], [-0.55, 0.55], [0.55, 0.55]]) an(g, zyl(0.06, 0.06, 1.3, metall("#d8d8dc"), 8), x, 0.65, z); return g; };
export const sofa = ({ farbe = "#4ac8b0", kissen = "#f0d060", breite = 5.2 } = {}) => { const g = new THREE.Group(), m = mat(farbe, 0.8); an(g, rb(breite, 1.0, 2.2, 0.25, m), 0, 1.0, 0); an(g, rb(breite, 2.0, 0.6, 0.25, m), 0, 2.0, -0.85);
  for (const s of [-1, 1]) an(g, rb(0.6, 1.6, 2.2, 0.25, m), s * (breite / 2 + 0.1), 1.3, 0); for (const s of [-1, 1]) { const k = an(g, rb(1.2, 1.0, 0.4, 0.2, mat(kissen, 0.85)), s * breite / 4, 2.0, -0.45); k.rotation.x = -0.2; } return g; };
export const stehlampe = ({ an: leuchtet = true } = {}) => { const g = new THREE.Group(), em = metall("#3a3a40"); an(g, zyl(0.5, 0.6, 0.12, em), 0, 0.06, 0); an(g, zyl(0.06, 0.06, 4.2, em, 8), 0, 2.1, 0);
  an(g, new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.85, 0.9, 20, 1, true), leuchtet ? new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 2.1, 1.5), side: THREE.DoubleSide }) : new THREE.MeshStandardMaterial({ color: "#e8dcc0", side: THREE.DoubleSide })), 0, 4.4, 0); return g; };
export const regal = ({ farbe = "#8a5a3a", boeden = 4, saat = 5 } = {}) => { const g = new THREE.Group(), m = mat(farbe, 0.6), r = zufall(saat); an(g, rb(3, 1.15 * boeden + 0.4, 1, 0.06, m), 0, (1.15 * boeden + 0.4) / 2, -0.1);
  const farben = ["#c83a3a", "#3a7ac8", "#e8c040", "#4ab84a", "#8a4ac8", "#e8803a"];
  for (let b = 0; b < boeden; b++) { an(g, bx(2.8, 0.1, 0.9, mat("#6a4a2a", 0.6)), 0, 0.4 + b * 1.15, 0.0); let x = -1.25; while (x < 1.2) { const w = 0.18 + r() * 0.12, h = 0.6 + r() * 0.35; const bk = an(g, bx(w, h, 0.7, mat(farben[Math.floor(r() * 6)], 0.6)), x + w / 2, 0.45 + b * 1.15 + h / 2, 0.05); if (r() > 0.85) bk.rotation.z = 0.2; x += w + 0.03; } }
  return g; };
export const geschenk = ({ farbe = "#e84a6a", band = "#ffd23a", groesse = 1 } = {}) => { const g = new THREE.Group(); an(g, rb(1.2, 1.0, 1.2, 0.06, plastik(farbe)), 0, 0.5, 0);
  an(g, bx(1.24, 1.02, 0.2, plastik(band)), 0, 0.5, 0); an(g, bx(0.2, 1.02, 1.24, plastik(band)), 0, 0.5, 0);
  for (const s of [-1, 1]) { const s1 = an(g, new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 8, 16), plastik(band)), s * 0.18, 1.12, 0); s1.rotation.y = Math.PI / 2; s1.rotation.x = s * 0.5; }
  g.scale.setScalar(groesse); return g; };
export const fernseher = ({ breite = 4.4 } = {}) => { const g = new THREE.Group(); an(g, rb(breite, breite * 0.6, 0.25, 0.08, mat("#18181e", 0.4)), 0, 0, 0);
  const s = an(g, new THREE.Mesh(new THREE.PlaneGeometry(breite * 0.93, breite * 0.52), new THREE.MeshBasicMaterial({ color: "#050508" })), 0, 0, 0.13); g.userData.schirm = s; return g; };

// ---------- Riesen-Tier mit Fell (Vergleich 23.11.: Vorbild hat riesige Fell-Tiere in der Straße; eigenes Wesen, kein Mammut) ----------
// „Flauschriese“: runder Fellkörper, große Augen, kleine Ohren, Stummelbeine. Fell = viele Büschel als InstancedMesh (fester Zufall).
// groesse 1 ≈ 18 m hoch (4–5 Figuren). userData: augen (für Blinzeln: scale.y), koerper.
export const riesenTier = ({ fell = "#8a5a3a", bauch = "#c89a6a", augenFarbe = "#3a2a1a", groesse = 1, dichte = 5200, saat = 9 } = {}) => {
  const g = new THREE.Group(), r = zufall(saat), fm = mat(fell, 0.95), koerper = new THREE.Group(); g.add(koerper);
  const rx = 6.4, ry = 8.4, rz = 6, cy = 13; const k = an(koerper, kugel(1, fm, 32), 0, cy, 0); k.scale.set(rx * 0.92, ry * 0.92, rz * 0.92);
  const bm = an(koerper, kugel(1, mat(bauch, 0.95), 24), 0, cy - 1.2, rz * 0.55); bm.scale.set(rx * 0.55, ry * 0.6, 2.2);
  // Fell-Büschel auf der Oberfläche
  const geo = new THREE.ConeGeometry(0.42, 3.4, 5); geo.translate(0, 1.4, 0); const im = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ roughness: 0.95 }), dichte);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), n = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color(), up = new THREE.Vector3(0, 1, 0), fc = new THREE.Color(fell), bc = new THREE.Color(bauch);
  for (let i = 0; i < dichte; i++) { const u = r() * 2 - 1, a = r() * Math.PI * 2, sq = Math.sqrt(1 - u * u); n.set(sq * Math.cos(a), u, sq * Math.sin(a));
    if (n.z > 0.55 && Math.abs(n.x) < 0.45 && n.y > -0.5 && n.y < 0.75) continue;   // Gesicht/Bauch frei lassen
    p.set(n.x * rx, cy + n.y * ry, n.z * rz); const nn = new THREE.Vector3(n.x / rx, n.y / ry, n.z / rz).normalize().lerp(new THREE.Vector3(0, -1, 0), 0.55 + 0.25 * r()).normalize();   // Fell hängt nach unten
    q.setFromUnitVectors(up, nn); const sk = 0.75 + r() * 0.5; m4.compose(p, q, new THREE.Vector3(sk, sk * (0.9 + r() * 0.7), sk)); im.setMatrixAt(i, m4);
    im.setColorAt(i, c.copy(fc).multiplyScalar(0.85 + r() * 0.3).lerp(bc, n.y < -0.6 ? 0.3 : 0)); }
  im.instanceMatrix.needsUpdate = true; koerper.add(im);
  // Gesicht: große Augen mit Glanz, Nase, Mund mit Zahn, Ohren
  const augen = []; for (const sx of [-1, 1]) { const ag = new THREE.Group(); ag.position.set(sx * 2.3, cy + 3.0, rz * 0.86); koerper.add(ag); augen.push(ag);
    an(ag, kugel(1.7, plastik("#ffffff"), 24)); an(ag, kugel(0.95, plastik(augenFarbe), 20), 0, -0.1, 1.05); an(ag, kugel(0.32, leucht(2, 2, 2), 10), 0.35, 0.35, 1.85); }
  an(koerper, kugel(0.75, plastik("#2a1a1a"), 16), 0, cy + 0.9, rz * 0.98);
  const mund = an(koerper, new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.28, 8, 20, Math.PI), mat("#3a1a1a", 0.6)), 0, cy - 0.3, rz * 0.94); mund.rotation.z = Math.PI;
  an(koerper, rb(0.55, 0.7, 0.3, 0.1, plastik("#fffaf0")), 0.5, cy - 1.95, rz * 0.97);
  for (const sx of [-1, 1]) { const o = an(koerper, kugel(1.3, fm, 16), sx * 4.8, cy + 7.2, 0); o.scale.set(1, 1.2, 0.6); an(koerper, kugel(0.75, mat(bauch, 0.9), 12), sx * 4.8, cy + 7.2, 0.5).scale.set(1, 1.2, 0.5); }
  for (const sx of [-1, 1]) { const bein = an(g, zyl(1.9, 2.2, 6, fm, 16), sx * 3.0, 3, 0.6); for (let j = 0; j < 40; j++) { const a = j / 40 * Math.PI * 2, y = 0.8 + (j % 5) * 1.1; const z1 = an(g, new THREE.Mesh(geo, fm), sx * 3.0 + Math.cos(a) * 2.0, y, 0.6 + Math.sin(a) * 2.0); z1.rotation.set(Math.PI - 0.3 * Math.sin(a), 0, 0.3 * Math.cos(a)); z1.scale.setScalar(0.6); }
    for (let z = 0; z < 3; z++) an(g, kugel(0.5, plastik("#e8dcc8"), 10), sx * 3.0 + (z - 1) * 0.9, 0.4, 2.8); }
  for (const sx of [-1, 1]) { const arm = an(koerper, kugel(1, fm, 16), sx * 7.2, cy - 1, 1.5); arm.scale.set(1.5, 3.2, 1.6); arm.rotation.z = sx * 0.35; }
  g.userData = { augen, koerper }; g.scale.setScalar(groesse); return g; };

// Liste für Katalog und Vorschau (Name → Bau-Funktion mit Standardwerten)
export const ALLE = { baum, blumenkuebel, hecke, bank, laterne, ampel, hydrant, muelltonne, briefkasten, schild, zaun, brunnen, laden, haltestelle, fahrrad, bus, hund, katze, vogel, tisch, stuhl, sofa, stehlampe, regal, geschenk, fernseher, riesenTier };
