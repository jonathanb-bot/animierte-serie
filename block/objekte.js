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
export const laterne = ({ hoehe = 9, an: leuchtet = true, punktlicht = true } = {}) => {
  const g = new THREE.Group(), em = metall("#262a32"); an(g, zyl(0.4, 0.5, 0.8, em, 12), 0, 0.4, 0); an(g, zyl(0.16, 0.2, hoehe, em, 12), 0, hoehe / 2, 0);
  an(g, zyl(0.7, 0.4, 0.5, em, 12), 0, hoehe + 0.2, 0); an(g, zyl(0.45, 0.45, 0.9, leuchtet ? leucht(3, 2.4, 1.4) : mat("#e8e0c8"), 16), 0, hoehe - 0.4, 0);
  if (leuchtet && punktlicht) { const l = new THREE.PointLight("#ffcf8a", 20, 18, 1.8); l.position.y = hoehe - 1; g.add(l); } return g; };
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

// ---------- Vorstadt, Schule, Sportwagen, Lichterkette (Vergleich 24.11.: „Geld fürs Verspäten“) ----------
const ziegelTex = (farbe = "#b8503a", fuge = "#e8d8c8") => tex(256, 256, (x, w, h) => { x.fillStyle = fuge; x.fillRect(0, 0, w, h); const c = new THREE.Color(farbe); let s = 3; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let y = 0; y < 16; y++) for (let i = -1; i < 9; i++) { const k = 0.85 + r() * 0.25; x.fillStyle = `rgb(${c.r * 255 * k | 0},${c.g * 255 * k | 0},${c.b * 255 * k | 0})`; x.fillRect(i * 32 + (y % 2) * 16 + 1, y * 16 + 1, 30, 14); } }, [3, 3]);
const fensterTeil = (g, x, y, z, w = 1.8, h = 2.2, ry = 0, rahmen = "#ffffff") => { const f = new THREE.Group(); f.position.set(x, y, z); f.rotation.y = ry; g.add(f);
  an(f, bx(w, h, 0.1, new THREE.MeshPhysicalMaterial({ color: "#8ac4e8", roughness: 0.08, clearcoat: 1, emissive: "#ffd890", emissiveIntensity: 0 })), 0, 0, 0.02).name = "glas";
  for (const [ww, hh, px, py] of [[w + 0.3, 0.2, 0, h / 2], [w + 0.3, 0.2, 0, -h / 2], [0.2, h, -w / 2, 0], [0.2, h, w / 2, 0], [w, 0.12, 0, 0], [0.12, h, 0, 0]]) an(f, bx(ww, hh, 0.2, mat(rahmen, 0.5)), px, py, 0.08);
  return f; };
// Einfamilienhaus mit Satteldach, Tür, Fenstern (nachts mit `licht: true` leuchtende Fenster). Front nach +z.
export const haus = ({ wand = "#f4e8b8", dach = "#3a4a6a", tuer = "#c83a3a", breite = 12, tiefe = 10, stock = 2, licht = false, saat = 2 } = {}) => {
  const g = new THREE.Group(), H = stock * 4.2, r = zufall(saat); an(g, bx(breite, H, tiefe, mat(wand, 0.85)), 0, H / 2, 0);
  const d = new THREE.Shape(); d.moveTo(-breite / 2 - 0.6, 0); d.lineTo(0, breite * 0.36); d.lineTo(breite / 2 + 0.6, 0); d.lineTo(-breite / 2 - 0.6, 0);
  const dg = new THREE.ExtrudeGeometry(d, { depth: tiefe + 1.2, bevelEnabled: false }); dg.translate(0, 0, -(tiefe + 1.2) / 2); const dm = an(g, new THREE.Mesh(dg, mat(dach, 0.7)), 0, H, 0);
  an(g, bx(1.6, 3.4, 0.2, mat(tuer, 0.6)), 0, 1.7, tiefe / 2 + 0.05); an(g, kugel(0.12, metall("#e8c040"), 8), 0.55, 1.7, tiefe / 2 + 0.2); an(g, bx(2.6, 0.25, 1.2, mat("#d8d0c0")), 0, 0.12, tiefe / 2 + 0.6);
  an(g, bx(2.4, 0.15, 1.0, mat(dach, 0.7)), 0, 3.8, tiefe / 2 + 0.5);
  const fenster = []; for (let st = 0; st < stock; st++) for (const fx of [-breite / 3, breite / 3, ...(st > 0 ? [0] : [])]) fenster.push(fensterTeil(g, fx, 2.4 + st * 4.2, tiefe / 2 + 0.02));
  for (const sx of [-1, 1]) for (let st = 0; st < stock; st++) fenster.push(fensterTeil(g, sx * (breite / 2 + 0.02), 2.4 + st * 4.2, 0, 1.8, 2.2, sx * Math.PI / 2));
  if (licht) fenster.forEach((f, i) => { if (r() < 0.7) { const gl = f.getObjectByName("glas"); gl.material = gl.material.clone(); gl.material.emissiveIntensity = 1.6; gl.material.color.set("#ffe0a0"); } });
  if (r() < 0.6) { an(g, bx(1.2, 2.6, 1.2, mat("#a8443a", 0.8)), breite * 0.25, H + breite * 0.25, -tiefe * 0.15); }
  g.userData = { fenster }; return g; };
// Schule: Backstein, Säulen-Eingang, Schild mit Namen, Banner (Text frei), Uhr über dem Eingang (userData.uhr = leinwand-Zeichenfunktion)
export const schule = ({ name = "GRUNDSCHULE AM PARK", banner = "HEUTE: SPORTFEST", breite = 34 } = {}) => {
  const g = new THREE.Group(), H = 12, zm = new THREE.MeshStandardMaterial({ map: ziegelTex(), roughness: 0.9 }); an(g, bx(breite, H, 14, zm), 0, H / 2, 0);
  an(g, bx(breite + 0.6, 0.8, 14.6, mat("#f4f0e8", 0.6)), 0, H + 0.4, 0); an(g, bx(breite + 0.4, 0.4, 14.4, mat("#f4f0e8", 0.6)), 0, H / 2, 0);
  for (let st = 0; st < 2; st++) for (let i = 0; i < 6; i++) { const fx = -breite / 2 + 3 + i * (breite - 6) / 5; if (Math.abs(fx) < 5) continue; fensterTeil(g, fx, 3 + st * 6, 7.02, 2.6, 3, 0); }
  const ein = new THREE.Group(); ein.position.z = 7; g.add(ein); an(ein, bx(10, 0.8, 4, mat("#f4f0e8", 0.6)), 0, 7.6, 2); for (const sx of [-4.4, 4.4]) an(ein, zyl(0.5, 0.55, 7.2, mat("#f4f0e8", 0.5)), sx, 3.6, 3.6);
  an(ein, bx(4.4, 5.6, 0.2, mat("#2a5ad8", 0.4)), 0, 2.8, 0.1); an(ein, bx(0.12, 5.6, 0.3, mat("#ffffff")), 0, 2.8, 0.2); for (let i = 0; i < 3; i++) an(ein, bx(10, 0.3, 1.2, mat("#cfcac0")), 0, 0.15 + i * 0.3, 4.6 - i * 0.6);
  const schildT = tex(1024, 128, (x, w, h) => { x.fillStyle = "#f6f2ea"; x.fillRect(0, 0, w, h); x.fillStyle = "#3a3a46"; let fs = 78; x.font = `700 ${fs}px 'DejaVu Serif', serif`; while (x.measureText(name).width > w * 0.92 && fs > 20) { fs -= 2; x.font = `700 ${fs}px 'DejaVu Serif', serif`; } x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(name, w / 2, h / 2 + 4); });
  an(g, new THREE.Mesh(new THREE.PlaneGeometry(breite * 0.6, breite * 0.075), new THREE.MeshStandardMaterial({ map: schildT, roughness: 0.6 })), 0, H - 1.4, 7.05);
  const banT = tex(1024, 128, (x, w, h) => { x.fillStyle = "#d82a2a"; x.fillRect(0, 0, w, h); x.fillStyle = "#fff"; x.font = "900 80px 'Inter Display', Inter, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(banner, w / 2, h / 2 + 4); });
  const ban = an(ein, new THREE.Mesh(new THREE.PlaneGeometry(9, 1.1), new THREE.MeshStandardMaterial({ map: banT, roughness: 0.7 })), 0, 6.6, 0.25); g.userData.banner = ban;
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) an(g, kugel(1.0, mat("#3a8a3a", 0.85), 12), sx * (6 + i * 1.8), 0.8, 8.2);
  return g; };
// Sportwagen (flach, breite Räder, Spoiler); 1,7-fach wie die Stadtautos
export const sportwagen = ({ farbe = "#e82a2a", groesse = 1.7 } = {}) => { const g = new THREE.Group(), lack = new THREE.MeshPhysicalMaterial({ color: farbe, roughness: 0.2, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05 });
  const glas = new THREE.MeshPhysicalMaterial({ color: "#1a2a3a", roughness: 0.05, clearcoat: 1, metalness: 0.2 });
  // flacher Keil: Unterteil, nach vorn abfallende Haube, niedrige Kabine mit schrägen Scheiben
  an(g, rb(2.1, 0.5, 4.8, 0.2, lack), 0, 0.55, 0);
  const haube = an(g, rb(2.0, 0.22, 2.0, 0.1, lack), 0, 0.82, 1.35); haube.rotation.x = 0.09;
  const kab = an(g, rb(1.7, 0.45, 2.0, 0.22, lack), 0, 1.0, -0.45);
  const front = an(g, bx(1.55, 0.05, 0.9, glas), 0, 1.03, 0.62); front.rotation.x = 0.62; const heck = an(g, bx(1.5, 0.05, 0.7, glas), 0, 1.05, -1.55); heck.rotation.x = -0.5;
  for (const sx of [-1, 1]) { const sf = an(g, bx(0.05, 0.32, 1.5, glas), sx * 0.86, 1.08, -0.4); }
  an(g, bx(1.9, 0.07, 0.45, mat("#111")), 0, 1.2, -2.2); for (const sx of [-0.7, 0.7]) an(g, bx(0.08, 0.35, 0.18, mat("#111")), sx, 0.98, -2.15);
  for (const [x, z] of [[-0.92, 1.5], [0.92, 1.5], [-0.92, -1.5], [0.92, -1.5]]) { const rd = an(g, zyl(0.4, 0.4, 0.36, mat("#141418", 0.6), 20), x, 0.4, z); rd.rotation.z = Math.PI / 2; const fg = an(g, zyl(0.24, 0.24, 0.38, metall("#c8ccd4"), 12), x, 0.4, z); fg.rotation.z = Math.PI / 2; }
  for (const sx of [-0.68, 0.68]) { an(g, bx(0.46, 0.1, 0.05, leucht(2, 1.95, 1.7)), sx, 0.68, 2.41); an(g, bx(0.5, 0.09, 0.05, leucht(2.4, 0.25, 0.15)), sx, 0.7, -2.41); }
  an(g, bx(1.2, 0.12, 0.06, mat("#111")), 0, 0.45, 2.41);
  g.scale.setScalar(groesse); return g; };
// Lichterkette: kleine leuchtende Kugeln an einem Draht, durchhängend zwischen zwei Punkten (lokal von x -laenge/2 bis +laenge/2)
export const lichterkette = ({ laenge = 10, n = 24, farbe = [3, 2.6, 1.6], durchhang = 0.5 } = {}) => { const g = new THREE.Group(), lm = leucht(...farbe);
  const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 10, 8), lm, n); const m = new THREE.Matrix4();
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, x = -laenge / 2 + t * laenge, bog = Math.sin(((t * laenge) % (laenge / 4)) / (laenge / 4) * Math.PI) * durchhang; m.makeTranslation(x, -bog - 0.12, 0); im.setMatrixAt(i, m); }
  g.add(im); const pts = []; for (let i = 0; i <= 64; i++) { const t = i / 64; pts.push(new THREE.Vector3(-laenge / 2 + t * laenge, -Math.sin(((t * laenge) % (laenge / 4)) / (laenge / 4) * Math.PI) * durchhang, 0)); }
  g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: "#2a2a2a" }))); return g; };

// ---------- Wüste, Tempel, Wächter (Vergleich 24.11.: Wüstendorf mit Pyramiden; nur Mittel, keine echten Gottheiten) ----------
const lehmTex = (farbe = "#e8c48a") => tex(256, 256, (x, w, h) => { x.fillStyle = farbe; x.fillRect(0, 0, w, h); let s = 6; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < 6000; i++) { const k = 0.95 + r() * 0.08; const c = new THREE.Color(farbe); x.fillStyle = `rgb(${c.r * 255 * k | 0},${c.g * 255 * k | 0},${c.b * 255 * k | 0})`; x.fillRect(r() * w, r() * h, 1.5, 1.5); } }, [1, 1]);
// Lehmhaus mit flachem Dach, Zierband, Fensterläden, Tür; Front nach +z
export const lehmhaus = ({ farbe = "#e8c48a", band = "#2ab0a8", breite = 9, tiefe = 8, hoehe = 6.5, saat = 4 } = {}) => {
  const g = new THREE.Group(), r = zufall(saat), wm = new THREE.MeshStandardMaterial({ map: lehmTex(farbe), roughness: 0.95 }); an(g, bx(breite, hoehe, tiefe, wm), 0, hoehe / 2, 0);
  an(g, bx(breite + 0.4, 0.5, tiefe + 0.4, wm), 0, hoehe + 0.25, 0); an(g, bx(breite + 0.05, 0.35, tiefe + 0.05, mat(band, 0.6)), 0, hoehe - 0.6, 0);
  an(g, bx(breite + 0.06, 0.15, tiefe + 0.06, mat("#d84a3a", 0.6)), 0, hoehe - 0.95, 0);
  an(g, bx(1.8, 3.4, 0.2, mat("#7a4a2a", 0.7)), -breite * 0.2, 1.7, tiefe / 2 + 0.05);
  for (const fx of [breite * 0.22]) { an(g, bx(1.4, 1.4, 0.15, mat("#3a2a1a")), fx, 3.6, tiefe / 2 + 0.03); for (const sx of [-1, 1]) an(g, bx(0.7, 1.5, 0.12, mat(band, 0.6)), fx + sx * 1.1, 3.6, tiefe / 2 + 0.1); }
  if (r() < 0.6) { const st = an(g, bx(breite * 0.45, 2.2, tiefe * 0.5, wm), breite * 0.2, hoehe + 1.6, -tiefe * 0.15); }
  if (r() < 0.5) { const m = an(g, new THREE.Mesh(new THREE.PlaneGeometry(3, 1.4), new THREE.MeshStandardMaterial({ color: ["#e85a5a", "#5a8ae8", "#f0c040"][saat % 3], side: THREE.DoubleSide, roughness: 0.8 })), breite * 0.2, 4.4, tiefe / 2 + 0.8); m.rotation.x = -0.5; }
  return g; };
// Wimpelkette: bunte Dreiecke an einer Leine (lokal x von -laenge/2 bis +laenge/2)
export const wimpelkette = ({ laenge = 12, n = 14, farben = ["#e83a5a", "#2a8ae8", "#f2c21a", "#2ab0a8", "#8a5ae8"], durchhang = 0.8 } = {}) => { const g = new THREE.Group();
  const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.3, 0, 0), new THREE.Vector3(0.3, 0, 0), new THREE.Vector3(0, -0.75, 0)]); geo.computeVertexNormals();
  const y = t => -Math.sin(t * Math.PI) * durchhang;
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; const w = an(g, new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: farben[i % farben.length], side: THREE.DoubleSide, roughness: 0.8 })), -laenge / 2 + t * laenge, y(t), 0); }
  const pts = []; for (let i = 0; i <= 32; i++) { const t = i / 32; pts.push(new THREE.Vector3(-laenge / 2 + t * laenge, y(t), 0)); } g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: "#3a2a1a" }))); return g; };
// Fackel mit weicher Flamme (leuchtet, wiegt sich langsam: userData.flamme.scale pro Bild sanft ändern, nie flackern)
export const fackel = ({ hoehe = 4.5, stand = true } = {}) => { const g = new THREE.Group(), em = metall("#6a4a2a");
  if (stand) { an(g, zyl(0.12, 0.18, hoehe, em, 10), 0, hoehe / 2, 0); an(g, zyl(0.6, 0.6, 0.12, em, 16), 0, 0.06, 0); }
  an(g, zyl(0.55, 0.25, 0.5, metall("#b8862a"), 16), 0, hoehe + 0.2, 0);
  const fl = new THREE.Group(); fl.position.y = hoehe + 0.45; g.add(fl);
  const f1 = an(fl, new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 12), leucht(3.2, 2.2, 0.6)), 0, 0.35, 0); f1.scale.set(1, 1.9, 1);
  const f2 = an(fl, new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), leucht(3.6, 3.2, 1.8)), 0, 0.3, 0); f2.scale.set(1, 1.6, 1);
  g.userData.flamme = fl; return g; };
export const krug = ({ farbe = "#d8603a", groesse = 1 } = {}) => { const g = new THREE.Group(), m = mat(farbe, 0.75); const k = an(g, kugel(0.7, m, 18), 0, 0.75, 0); k.scale.set(1, 1.1, 1);
  an(g, zyl(0.32, 0.42, 0.45, m, 16), 0, 1.6, 0); an(g, zyl(0.42, 0.42, 0.1, m, 16), 0, 1.85, 0); an(g, zyl(0.4, 0.4, 0.1, mat(new THREE.Color(farbe).multiplyScalar(0.55), 0.7), 18), 0, 1.05, 0).scale.set(1.62, 1, 1.62); g.scale.setScalar(groesse); return g; };
export const palme = ({ hoehe = 9, saat = 2 } = {}) => { const g = new THREE.Group(), r = zufall(saat), sm = mat("#9a7a4a", 0.85), bm = mat("#3aa84a", 0.8);
  let p = new THREE.Vector3(0, 0, 0); const neig = 0.06 + r() * 0.08; for (let i = 0; i < 8; i++) { const s = an(g, zyl(0.32 - i * 0.02, 0.36 - i * 0.02, hoehe / 8, sm, 8), p.x, p.y + hoehe / 16, 0); s.rotation.z = -neig; p = new THREE.Vector3(p.x + Math.sin(neig) * hoehe / 8, p.y + Math.cos(neig) * hoehe / 8, 0); }
  for (let i = 0; i < 11; i++) { const a = i / 11 * Math.PI * 2 + r() * 0.2; const b = new THREE.Group(); b.position.copy(p); b.rotation.y = a; g.add(b); for (let k = 0; k < 3; k++) { const bl = an(b, rb(1.1 - k * 0.2, 0.08, 1.8, 0.04, k % 2 ? bm : mat("#2e9a3e", 0.8)), 0, -0.1 - k * 0.55, 0.9 + k * 1.5); bl.rotation.x = 0.2 + k * 0.32; } } an(g, kugel(0.5, mat("#7a5a2a", 0.8), 10), p.x, p.y - 0.3, 0); return g; };
export const pyramide = ({ groesse = 60, farbe = "#e0b878" } = {}) => { const g = new THREE.Group(); const p = an(g, new THREE.Mesh(new THREE.ConeGeometry(groesse * 0.75, groesse, 4, 1), new THREE.MeshStandardMaterial({ color: farbe, roughness: 0.95, flatShading: true })), 0, groesse / 2, 0); p.rotation.y = Math.PI / 4; return g; };
export const glocke = ({ farbe = "#d08a3a" } = {}) => { const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: farbe, metalness: 0.35, roughness: 0.35, side: THREE.DoubleSide });
  const pts = [[0.01, 2.35], [0.45, 2.32], [0.68, 2.15], [0.74, 1.8], [0.78, 1.3], [0.9, 0.8], [1.1, 0.38], [1.36, 0.1], [1.42, 0.0], [1.3, 0.04]].map(([x, y]) => new THREE.Vector2(x, y));
  an(g, new THREE.Mesh(new THREE.LatheGeometry(pts, 40), m)); an(g, kugel(0.24, m, 12), 0, 0.15, 0); an(g, zyl(0.04, 0.04, 2, m, 6), 0, 1.1, 0); an(g, new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.08, 8, 16), m), 0, 2.5, 0);
  g.userData.schwingen = g; return g; };
// Thron mit hoher Lehne, Gold und Türkis
export const thron = ({ gold = "#e8b830", stein = "#2ab0a8" } = {}) => { const g = new THREE.Group(), gm = new THREE.MeshStandardMaterial({ color: gold, metalness: 0.8, roughness: 0.3 }), sm = mat(stein, 0.4);
  for (let i = 0; i < 4; i++) an(g, bx(9 - i * 1.4, 0.6, 6 - i * 0.8, mat("#d8b878", 0.8)), 0, 0.3 + i * 0.6, 0);
  an(g, rb(3, 1.2, 2.6, 0.1, gm), 0, 3.3, 0); an(g, rb(3.2, 6, 0.6, 0.15, gm), 0, 6.5, -1.1); an(g, rb(2.2, 4.6, 0.2, 0.1, sm), 0, 6.5, -0.75);
  for (const sx of [-1, 1]) { an(g, rb(0.5, 1.6, 2.6, 0.1, gm), sx * 1.6, 4.2, 0); an(g, kugel(0.35, sm, 12), sx * 1.6, 5.1, 1.0); }
  an(g, kugel(0.7, gm, 16), 0, 9.6, -1.1).scale.set(1.4, 0.8, 0.5); return g; };
// Krone auf Sockel (Leuchten optional); als Kopfschmuck: figur({ krone: true })
export const krone = ({ gold = "#f0c030", leuchtet = true } = {}) => { const g = new THREE.Group(), gm = new THREE.MeshStandardMaterial({ color: gold, metalness: 0.85, roughness: 0.25, emissive: leuchtet ? gold : "#000", emissiveIntensity: leuchtet ? 0.25 : 0 });
  an(g, zyl(0.8, 0.8, 0.45, gm, 24), 0, 0.22, 0); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const z = an(g, new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 4), gm), Math.cos(a) * 0.72, 0.7, Math.sin(a) * 0.72); an(g, kugel(0.1, leucht(0.4, 2.2, 2.4), 8), Math.cos(a) * 0.82, 0.3, Math.sin(a) * 0.82); } return g; };
export const sockel = ({ farbe = "#2a3a6a" } = {}) => { const g = new THREE.Group(); an(g, rb(2.4, 3, 2.4, 0.08, mat(farbe, 0.5)), 0, 1.5, 0); an(g, rb(2.8, 0.3, 2.8, 0.05, new THREE.MeshStandardMaterial({ color: "#e8b830", metalness: 0.8, roughness: 0.3 })), 0, 3.1, 0); return g; };
// Steinwächter (kniend, leuchtende Augen) – viele davon über steinwaechterReihen() in alltag.js
export const steinwaechter = ({ stein = "#5a4a42", band = "#2ac8a8", ohren = false } = {}) => { const g = new THREE.Group(), sm = mat(stein, 0.85), bm = mat(band, 0.5);
  an(g, rb(2.2, 2.4, 1.4, 0.15, sm), 0, 2.6, 0); an(g, bx(2.25, 0.6, 1.45, bm), 0, 3.4, 0.01); const k = an(g, rb(1.5, 1.5, 1.4, 0.15, sm), 0, 4.6, 0.1);
  for (const sx of [-0.35, 0.35]) an(g, bx(0.32, 0.14, 0.05, leucht(1.2, 3, 3.2)), sx, 4.75, 0.82);
  if (ohren) for (const sx of [-0.45, 0.45]) an(g, bx(0.3, 1.0, 0.25, sm), sx, 5.8, 0);
  for (const sx of [-1, 1]) { an(g, rb(0.7, 2.2, 0.8, 0.1, sm), sx * 1.45, 2.6, 0.3); an(g, rb(0.8, 0.9, 2.2, 0.1, sm), sx * 0.55, 0.45, 0.6); }
  an(g, rb(2.6, 0.5, 3, 0.05, new THREE.MeshStandardMaterial({ color: "#c8962a", metalness: 0.6, roughness: 0.4 })), 0, -0.05, 0.3); return g; };
// Riesen-Wächter: großes, schlankes Steinwesen mit Goldbändern, leuchtenden Augen und Stab (eigenes Wesen). groesse 1 ≈ 22 m
export const riesenWaechter = ({ stein = "#1a1e30", gold = "#e8b830", augen = [3.2, 2.6, 0.6], groesse = 1 } = {}) => { const g = new THREE.Group(), sm = mat(stein, 0.5), gm = new THREE.MeshStandardMaterial({ color: gold, metalness: 0.8, roughness: 0.3 });
  for (const sx of [-1, 1]) { an(g, rb(1.6, 8, 1.8, 0.2, sm), sx * 1.3, 4, 0); for (let i = 0; i < 3; i++) an(g, bx(1.7, 0.3, 1.9, gm), sx * 1.3, 2 + i * 2.4, 0); }
  an(g, rb(4.6, 3, 2.6, 0.2, gm), 0, 9.2, 0); an(g, rb(5.2, 6, 2.6, 0.3, sm), 0, 12.5, 0); for (let i = 0; i < 4; i++) an(g, bx(5.3, 0.3, 2.7, gm), 0, 10.5 + i * 1.5, 0);
  an(g, rb(7.4, 1.2, 3.0, 0.3, gm), 0, 15.2, 0);
  for (const sx of [-1, 1]) { const arm = an(g, rb(1.3, 7, 1.4, 0.2, sm), sx * 3.5, 12.2, 0.3); for (let i = 0; i < 2; i++) an(g, bx(1.4, 0.3, 1.5, gm), sx * 3.5, 10 + i * 2.2, 0.3); }
  const kopf = new THREE.Group(); kopf.position.set(0, 16.6, 0); g.add(kopf); an(kopf, rb(2.6, 2.4, 2.6, 0.3, sm), 0, 1.2, 0); 
  for (const sx of [-0.65, 0.65]) an(kopf, bx(0.7, 0.3, 0.1, leucht(...augen)), sx, 1.4, 1.32);
  for (let i = -2; i <= 2; i++) { const k = an(kopf, rb(0.5, 1.6 - Math.abs(i) * 0.3, 0.3, 0.12, gm), i * 0.5, 3.0 - Math.abs(i) * 0.15, -0.2); k.rotation.z = -i * 0.25; }   // Kamm aus Goldplatten (eigenes Wesen)
  an(kopf, bx(2.7, 0.35, 2.7, gm), 0, 2.2, 0);
  const stab = an(g, zyl(0.25, 0.25, 22, gm, 12), 4.6, 11, 1.4); an(g, kugel(0.8, leucht(...augen), 16), 4.6, 22.3, 1.4);
  g.userData = { kopf }; g.scale.setScalar(groesse); return g; };

// ---------- Reich und arm, Himmel und All (Vergleich 24.11.: „je reicher, desto höher das Haus“) ----------
// 3D-Wolke aus weichen Kugeln (fester Zufall); groesse 1 ≈ 30 m breit
export const wolke = ({ groesse = 1, saat = 3, farbe = "#ffffff" } = {}) => { const g = new THREE.Group(), r = zufall(saat), m = new THREE.MeshStandardMaterial({ color: farbe, roughness: 1, emissive: "#c8d8f0", emissiveIntensity: 0.25 });
  for (let i = 0; i < 14; i++) { const a = r() * Math.PI * 2, d = r() * 10; an(g, kugel(5 + r() * 5, m, 18), Math.cos(a) * d * 1.4, 2 + r() * 4 - d * 0.2, Math.sin(a) * d * 0.7); }
  g.scale.setScalar(groesse); return g; };
const glasTurmTex = (() => { let t = null; return () => t || (t = tex(128, 128, (x, w, h) => { x.fillStyle = "#e8f2fa"; x.fillRect(0, 0, w, h); x.fillStyle = "#4a9ae8"; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) x.fillRect(i * 32 + 4, j * 32 + 5, 24, 22); x.fillStyle = "rgba(255,255,255,0.35)"; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) x.fillRect(i * 32 + 6, j * 32 + 7, 8, 18); }, [2, 10])); })();
// Himmelshaus: dünne Stelze bis in große Höhe, oben eine Plattform mit Villa, Palmen und Pool-Becken
export const himmelshaus = ({ hoehe = 220, farbe = "#f4f6fa", glas = "#6ab0f0", saat = 2 } = {}) => { const g = new THREE.Group(), r = zufall(saat), wm = mat(farbe, 0.5), gm = new THREE.MeshPhysicalMaterial({ color: glas, roughness: 0.1, clearcoat: 1, emissive: "#2a5a9a", emissiveIntensity: 0.2 });
  const ft = glasTurmTex(); const st = new THREE.MeshStandardMaterial({ map: ft.clone(), roughness: 0.25, metalness: 0.1, emissive: "#4a7ab8", emissiveIntensity: 0.15 }); st.map.repeat.set(2, Math.round(hoehe / 6)); st.map.needsUpdate = true;
  const breite = 7 + r() * 4; an(g, bx(breite, hoehe, breite, st), 0, hoehe / 2, 0); for (const sx of [-1, 1]) for (const sz of [-1, 1]) an(g, bx(0.4, hoehe, 0.4, mat("#e8b830", 0.4, 0.5)), sx * breite / 2, hoehe / 2, sz * breite / 2);
  const top = new THREE.Group(); top.position.y = hoehe; g.add(top); an(top, rb(26, 2, 26, 0.5, wm), 0, 0, 0); an(top, bx(23, 0.1, 23, mat("#e8eef4", 0.3)), 0, 1.05, 0);
  const villa = an(top, rb(14, 7, 10, 0.3, wm), -3, 4.6, -5); for (let i = 0; i < 3; i++) an(top, bx(3.6, 4, 0.15, gm), -8 + i * 5, 4.8, 0.05);
  const pool = an(top, bx(10, 0.3, 6, new THREE.MeshPhysicalMaterial({ color: "#3ac0f0", roughness: 0.05, clearcoat: 1, emissive: "#1a6a9a", emissiveIntensity: 0.3 })), 5, 1.15, 7);
  for (let i = 0; i < 4; i++) { const p = palme({ hoehe: 6 + r() * 3, saat: saat * 7 + i }); p.position.set(-10 + r() * 20, 1, 8 + r() * 3); p.scale.setScalar(0.7); top.add(p); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; an(top, kugel(0.5, leucht(2.4, 2.4, 2.2), 8), Math.cos(a) * 11, -1.2, Math.sin(a) * 11); }
  g.userData.oben = top; return g; };
// Bretterbude (arm): schiefe Bretter, Wellblechdach, Nummernschild
export const bretterbude = ({ holz = "#7a5232", dach = "#8a929a", saat = 5 } = {}) => { const g = new THREE.Group(), r = zufall(saat);
  for (let i = 0; i < 7; i++) { const b = an(g, bx(0.85, 4.4 + r() * 0.6, 0.18, mat(new THREE.Color(holz).multiplyScalar(0.8 + r() * 0.35), 0.9)), -2.6 + i * 0.86, 2.2, 2); b.rotation.z = (r() - 0.5) * 0.06; }
  an(g, bx(6, 4.6, 0.2, mat(holz, 0.9)), 0, 2.3, -2); for (const sx of [-1, 1]) an(g, bx(0.2, 4.6, 4, mat(holz, 0.9)), sx * 3, 2.3, 0);
  const d = an(g, new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.12, 5, 12, 1, 1), new THREE.MeshStandardMaterial({ color: dach, metalness: 0.5, roughness: 0.5 })), 0, 4.8, 0.2); d.rotation.x = -0.12;
  an(g, bx(1.6, 3, 0.1, mat("#4a3020", 0.9)), 0.8, 1.5, 2.12); an(g, bx(1, 0.5, 0.05, mat("#f0f0f0")), -1.6, 3.6, 2.15); return g; };
// Müllberg: Haufen aus Säcken, Kisten, Reifen (fester Zufall)
export const muellberg = ({ groesse = 1, saat = 8 } = {}) => { const g = new THREE.Group(), r = zufall(saat);
  an(g, kugel(1, mat("#6a5a48", 1), 16), 0, 0, 0).scale.set(6.5, 1.8, 5);
  for (let i = 0; i < 40; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 5.5, y = 1.8 * Math.sqrt(Math.max(0, 1 - (d / 6.3) ** 2)) + 0.35; const t = r();
    const o = t < 0.4 ? kugel(0.8 + r() * 0.4, mat(["#2a2a30", "#3a4a3a", "#4a3a2a"][i % 3], 0.6), 10) : t < 0.7 ? bx(1 + r(), 0.8 + r() * 0.6, 1 + r(), mat(["#b8864a", "#8a8a8a", "#c83a3a", "#3a6ac8"][i % 4], 0.8)) : new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.25, 8, 16), mat("#18181c", 0.7));
    an(g, o, Math.cos(a) * d * 1.0, y, Math.sin(a) * d * 0.78); o.rotation.set(r() * 3, r() * 3, r() * 3); }
  g.scale.setScalar(groesse); return g; };
export const leiter = ({ hoehe = 6, schief = 0.06 } = {}) => { const g = new THREE.Group(), m = mat("#a87a4a", 0.85); for (const sx of [-0.5, 0.5]) an(g, bx(0.15, hoehe, 0.15, m), sx, hoehe / 2, 0);
  for (let y = 0.5; y < hoehe; y += 0.6) { const s = an(g, bx(1.0, 0.1, 0.12, m), 0, y, 0); if (y > hoehe * 0.6 && y < hoehe * 0.72) s.visible = false; } g.rotation.z = schief; return g; };   // eine Sprosse fehlt (kaputt)
// Pool mit Wasser, Rand, Schwimmring und Ball
export const pool = ({ breite = 10, laenge = 16 } = {}) => { const g = new THREE.Group(); an(g, rb(breite + 1.6, 0.8, laenge + 1.6, 0.2, mat("#f4f4f4", 0.4)), 0, 0.4, 0);
  an(g, bx(breite, 0.2, laenge, new THREE.MeshPhysicalMaterial({ color: "#3ac8f0", roughness: 0.05, clearcoat: 1, emissive: "#1a7aaa", emissiveIntensity: 0.35 })), 0, 0.72, 0);
  an(g, new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.35, 12, 24), plastik("#f2c21a")), 1.5, 0.9, 2).rotation.x = Math.PI / 2; an(g, kugel(0.5, plastik("#e84a6a"), 14), -2, 1.1, -3); return g; };
// Glasaufzug: Röhre mit Goldrahmen und Kabine (userData.kabine.position.y bewegen)
export const glasaufzug = ({ hoehe = 30 } = {}) => { const g = new THREE.Group(), gold = new THREE.MeshStandardMaterial({ color: "#e8b830", metalness: 0.8, roughness: 0.3 });
  an(g, new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, hoehe, 24, 1, true), new THREE.MeshPhysicalMaterial({ color: "#cfe8ff", roughness: 0.05, transparent: true, opacity: 0.25, side: THREE.DoubleSide })), 0, hoehe / 2, 0);
  for (let y = 0; y <= hoehe; y += hoehe / 6) an(g, new THREE.Mesh(new THREE.TorusGeometry(2.25, 0.12, 8, 28), gold), 0, y, 0).rotation.x = Math.PI / 2;
  const k = new THREE.Group(); g.add(k); an(k, zyl(2, 2, 0.3, gold, 24), 0, 0.15, 0); an(k, zyl(2, 2, 0.2, gold, 24), 0, 5.2, 0); g.userData.kabine = k; return g; };
// Absperrung: zwei Pfosten mit roter Kordel
export const absperrung = ({ breite = 5 } = {}) => { const g = new THREE.Group(), gold = new THREE.MeshStandardMaterial({ color: "#e8b830", metalness: 0.8, roughness: 0.3 });
  for (const sx of [-1, 1]) { an(g, zyl(0.12, 0.12, 2.4, gold, 10), sx * breite / 2, 1.2, 0); an(g, zyl(0.45, 0.5, 0.2, gold, 16), sx * breite / 2, 0.1, 0); an(g, kugel(0.2, gold, 10), sx * breite / 2, 2.45, 0); }
  const kurve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-breite / 2, 2.2, 0), new THREE.Vector3(0, 1.4, 0), new THREE.Vector3(breite / 2, 2.2, 0)); an(g, new THREE.Mesh(new THREE.TubeGeometry(kurve, 20, 0.08, 8), mat("#c81a2a", 0.6))); return g; };
// Goldvilla mit Diamantfenstern, Säulen, Kuppel
export const goldvilla = ({ breite = 40 } = {}) => { const g = new THREE.Group(), gold = new THREE.MeshStandardMaterial({ color: "#f0c030", metalness: 0.7, roughness: 0.3 }), weiss = mat("#fbfaf6", 0.4);
  const dia = new THREE.MeshPhysicalMaterial({ color: "#e8f8ff", roughness: 0.02, clearcoat: 1, emissive: "#a8d8ff", emissiveIntensity: 0.5 });
  an(g, bx(breite, 16, 24, gold), 0, 8, 0); an(g, bx(breite + 1, 1, 25, weiss), 0, 16.5, 0);
  for (let st = 0; st < 2; st++) for (let i = 0; i < 8; i++) { const d = an(g, new THREE.Mesh(new THREE.OctahedronGeometry(1.4, 0), dia), -breite / 2 + 3 + i * (breite - 6) / 7, 5 + st * 7, 12.1); d.scale.set(1, 1.3, 0.3); }
  for (let i = 0; i < 6; i++) an(g, zyl(0.8, 0.9, 16, weiss, 16), -12.5 + i * 5, 8, 14);
  an(g, new THREE.Mesh(new THREE.SphereGeometry(7, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), gold), 0, 17, 0); for (const sx of [-1, 1]) { an(g, zyl(1.6, 1.6, 10, gold, 16), sx * (breite / 2 - 2), 21, 0); an(g, new THREE.Mesh(new THREE.ConeGeometry(2, 4, 16), gold), sx * (breite / 2 - 2), 28, 0); }
  an(g, bx(6, 9, 0.3, mat("#c8962a", 0.4, 0.6)), 0, 4.5, 12.2); return g; };
export const goldschluessel = ({ groesse = 1 } = {}) => { const g = new THREE.Group(), gold = new THREE.MeshStandardMaterial({ color: "#f0c030", metalness: 0.85, roughness: 0.2, emissive: "#f0c030", emissiveIntensity: 0.2 });
  an(g, new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.14, 10, 24), gold), -0.9, 0, 0); an(g, zyl(0.1, 0.1, 1.6, gold, 10), 0.3, 0, 0).rotation.z = Math.PI / 2; for (const x of [0.8, 1.05]) an(g, bx(0.12, 0.35, 0.12, gold), x, -0.2, 0); g.scale.setScalar(groesse); return g; };
// Weltraum-Turmspitze: Turm mit Ringen, darüber Teller-Plattform mit Glaskuppel (für die Weltall-Kulisse)
export const tellerhaus = ({ farbe = "#2a4ab8" } = {}) => { const g = new THREE.Group(), fm = mat(farbe, 0.4, 0.3), weiss = mat("#f4f4f8", 0.4), gold = new THREE.MeshStandardMaterial({ color: "#e8b830", metalness: 0.8, roughness: 0.3 });
  an(g, zyl(4, 5, 60, weiss, 24), 0, 30, 0); for (let y = 6; y < 60; y += 10) an(g, zyl(5.2, 5.2, 1, gold, 24), 0, y, 0);
  an(g, zyl(16, 6, 4, fm, 32), 0, 62, 0); an(g, zyl(16.5, 16.5, 0.8, gold, 32), 0, 64, 0);
  an(g, new THREE.Mesh(new THREE.SphereGeometry(9, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: "#cfe8ff", roughness: 0.05, transparent: true, opacity: 0.35 })), 0, 64.4, 0);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; an(g, kugel(0.9, leucht(0.6, 2.6, 2.4), 10), Math.cos(a) * 12, 60.2, Math.sin(a) * 12); } return g; };

// ---------- Schule, Turnhalle, Krankenhaus (Vergleich 24.11.: „erstes Wort = Superkraft“) ----------
export const spind = ({ farbe = "#2ab08a", n = 1 } = {}) => { const g = new THREE.Group(), m = mat(farbe, 0.45, 0.3), d = mat(new THREE.Color(farbe).multiplyScalar(0.8), 0.45, 0.3);
  for (let i = 0; i < n; i++) { const x = i * 1.62; an(g, bx(1.6, 6, 1.6, m), x, 3, 0); an(g, bx(1.45, 5.7, 0.06, d), x, 3, 0.81); for (let k = 0; k < 4; k++) an(g, bx(0.9, 0.08, 0.04, mat("#1a3a30", 0.6)), x, 5.3 - k * 0.18, 0.85); an(g, bx(0.12, 0.5, 0.08, metall("#c8ccd4")), x + 0.5, 3, 0.86); }
  return g; };
export const tribuene = ({ breite = 24, reihen = 5, farben = ["#2a3a6a", "#c8c8d0"] } = {}) => { const g = new THREE.Group(); for (let i = 0; i < reihen; i++) { an(g, bx(breite, 0.5, 1.6, mat(farben[i % 2], 0.6)), 0, 0.8 + i * 0.9, -i * 1.6); an(g, bx(breite, 0.8 + i * 0.9, 0.2, mat("#3a3a44", 0.7)), 0, (0.8 + i * 0.9) / 2, -i * 1.6 + 0.7); } return g; };
export const krankenwagen = ({ groesse = 1.7 } = {}) => { const g = new THREE.Group(), w = plastik("#fbfbfb"), r = plastik("#e02a2a");
  an(g, rb(2.4, 2.6, 4.4, 0.2, w), 0, 1.75, -0.8); an(g, rb(2.3, 1.8, 1.8, 0.2, w), 0, 1.35, 2.2); an(g, bx(2.42, 0.3, 4.42, r), 0, 1.6, -0.8);
  for (const sx of [-1, 1]) { an(g, bx(0.05, 0.9, 0.3, r), sx * 1.22, 2.3, -0.8); an(g, bx(0.05, 0.3, 0.9, r), sx * 1.22, 2.3, -0.8); }
  an(g, bx(2.0, 0.9, 0.05, new THREE.MeshPhysicalMaterial({ color: "#2a3a4a", roughness: 0.05, clearcoat: 1 })), 0, 1.8, 3.11); for (const [x, z] of [[-1, 2.2], [1, 2.2], [-1, -1.8], [1, -1.8]]) { const rd = an(g, zyl(0.45, 0.45, 0.35, mat("#141418"), 18), x, 0.45, z); rd.rotation.z = Math.PI / 2; }
  for (const sx of [-0.5, 0.5]) an(g, bx(0.4, 0.2, 0.3, sx < 0 ? leucht(2.6, 0.3, 0.2) : leucht(0.3, 0.6, 2.8)), sx, 3.15, -0.8); g.scale.setScalar(groesse); return g; };
export const krankenbett = ({ decke = "#9ad0e8" } = {}) => { const g = new THREE.Group(), em = metall("#c8ccd4"); an(g, rb(3.4, 0.4, 6.6, 0.1, em), 0, 1.6, 0);
  an(g, rb(3.2, 0.6, 6.4, 0.25, mat("#f4f6f8", 0.8)), 0, 2.1, 0); an(g, rb(3.0, 0.5, 4.2, 0.25, mat(decke, 0.85)), 0, 2.4, -0.9); an(g, rb(2.2, 0.5, 1.3, 0.25, mat("#ffffff", 0.9)), 0, 2.55, 2.4);
  for (const z of [-3.2, 3.2]) an(g, bx(3.4, 1.8, 0.15, em), 0, 2.2, z); for (const [x, z] of [[-1.5, -3], [1.5, -3], [-1.5, 3], [1.5, 3]]) an(g, zyl(0.08, 0.08, 1.4, em, 8), x, 0.7, z); return g; };
// Herzmonitor: Bildschirm mit Herzlinie (userData.zeichne(t) für die laufende Linie)
export const herzmonitor = () => { const g = new THREE.Group(); an(g, zyl(0.08, 0.08, 4.4, metall(), 8), 0, 2.2, 0); an(g, rb(1.8, 1.3, 0.4, 0.08, plastik("#e8e8ec")), 0, 4.6, 0.2);
  const c = document.createElement("canvas"); c.width = 256; c.height = 160; const x = c.getContext("2d"); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const sch = an(g, new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.0), new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(1.6, 1.6, 1.6) })), 0, 4.6, 0.41);
  g.userData.zeichne = (zeit = 0) => { x.fillStyle = "#06120c"; x.fillRect(0, 0, 256, 160); x.strokeStyle = "#3aff7a"; x.lineWidth = 4; x.beginPath(); for (let i = 0; i <= 256; i += 4) { const p = ((i / 256) * 2 + zeit * 1.2) % 1; const y = p > 0.45 && p < 0.5 ? 30 : p > 0.5 && p < 0.55 ? 130 : 80; i ? x.lineTo(i, y) : x.moveTo(i, y); } x.stroke(); t.needsUpdate = true; };
  g.userData.zeichne(0); return g; };
export const babybett = () => { const g = new THREE.Group(), m = mat("#f8f6f0", 0.6); an(g, bx(4, 0.3, 2.4, m), 0, 1.4, 0); an(g, rb(3.8, 0.4, 2.2, 0.15, mat("#e8f0f8", 0.9)), 0, 1.75, 0);
  for (const z of [-1.15, 1.15]) for (let i = 0; i <= 12; i++) an(g, zyl(0.05, 0.05, 1.8, m, 6), -1.9 + i * 0.317, 2.2, z); for (const x of [-2, 2]) for (let i = 0; i <= 7; i++) an(g, zyl(0.05, 0.05, 1.8, m, 6), x, 2.2, -1.1 + i * 0.31);
  for (const z of [-1.15, 1.15]) an(g, bx(4.1, 0.12, 0.12, m), 0, 3.1, z); for (const [x, z] of [[-2, -1.15], [2, -1.15], [-2, 1.15], [2, 1.15]]) an(g, bx(0.15, 3.2, 0.15, m), x, 1.6, z); return g; };

// ---------- Achterbahn, Torte, Kinderwagen (Vergleich 24.11.: „Nur noch 1 Tag“) ----------
// Achterbahn: Schienenstück mit Hügel und Stützen + Wagen (userData.wagen, userData.kurve für Fahrt: kurve.getPointAt(u))
export const achterbahn = ({ laenge = 60, hoehe = 18, farbe = "#e83a3a" } = {}) => { const g = new THREE.Group(), sm = mat(farbe, 0.4, 0.4), st = metall("#f0f0f4");
  const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40, x = -laenge / 2 + u * laenge; pts.push(new THREE.Vector3(x, 2 + Math.max(0, Math.sin(u * Math.PI * 1.6)) * hoehe + Math.max(0, Math.sin(u * Math.PI * 3.2 - 1)) * hoehe * 0.3, Math.sin(u * Math.PI * 2) * 4)); }
  const kurve = new THREE.CatmullRomCurve3(pts); for (const off of [-0.7, 0.7]) { const ks = new THREE.CatmullRomCurve3(pts.map(p => p.clone().add(new THREE.Vector3(0, 0, off)))); an(g, new THREE.Mesh(new THREE.TubeGeometry(ks, 160, 0.16, 8), sm)); }
  for (let i = 0; i <= 80; i++) { const p = kurve.getPointAt(i / 80); an(g, bx(0.25, 0.12, 1.7, mat("#5a5a62", 0.6)), p.x, p.y - 0.1, p.z); }
  for (let i = 1; i < 14; i++) { const p = kurve.getPointAt(i / 14); if (p.y > 3) an(g, zyl(0.25, 0.3, p.y, st, 8), p.x, p.y / 2, p.z); }
  const wagen = new THREE.Group(); g.add(wagen); an(wagen, rb(2.6, 1.1, 1.8, 0.3, plastik("#2a6ae8")), 0, 0.7, 0); an(wagen, rb(0.4, 1.2, 1.8, 0.15, plastik("#2a6ae8")), -1.1, 1.3, 0);
  for (const [x, z] of [[-0.9, -0.7], [0.9, -0.7], [-0.9, 0.7], [0.9, 0.7]]) an(wagen, kugel(0.25, plastik("#f2c21a"), 10), x, 0.2, z);
  const setze = (u) => { const p = kurve.getPointAt(u), tg = kurve.getTangentAt(u); wagen.position.copy(p).add(new THREE.Vector3(0, 0.3, 0)); wagen.lookAt(p.clone().add(new THREE.Vector3(tg.z, 0, -tg.x))); wagen.rotateY(Math.PI / 2); };
  setze(0.3); g.userData = { wagen, kurve, setze }; return g; };
// Geburtstagstorte mit Kerzen (sanfte Flammen) und Schrift oben (userData.schrift(text))
export const torte = ({ text = "ALLES GUTE", farbe = "#f8c8d8", stufen = 2 } = {}) => { const g = new THREE.Group(), m = mat(farbe, 0.6), creme = mat("#ffffff", 0.5);
  for (let i = 0; i < stufen; i++) { const r = 1.6 - i * 0.45; an(g, zyl(r, r, 0.9, m, 32), 0, 0.45 + i * 0.9, 0); for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; an(g, kugel(0.13, creme, 8), Math.cos(a) * r, 0.9 + i * 0.9, Math.sin(a) * r); } }
  const top = stufen * 0.9; const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d"); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const schrift = (txt) => { x.fillStyle = farbe; x.fillRect(0, 0, 256, 256); x.fillStyle = "#c83a6a"; let fs = 70; x.font = `900 ${fs}px 'Inter Display', sans-serif`; while (x.measureText(txt).width > 210 && fs > 20) { fs -= 4; x.font = `900 ${fs}px 'Inter Display', sans-serif`; } x.textAlign = "center"; x.textBaseline = "middle"; txt.split("|").forEach((z, i, a) => x.fillText(z, 128, 128 + (i - (a.length - 1) / 2) * fs)); t.needsUpdate = true; };
  schrift(text); const rt = 1.6 - (stufen - 1) * 0.45; const d = an(g, new THREE.Mesh(new THREE.CircleGeometry(rt * 0.98, 32), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 })), 0, top + 0.01, 0); d.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const k = an(g, zyl(0.06, 0.06, 0.6, mat(["#5ab8f0", "#f2c21a", "#e85a8a"][i % 3], 0.5), 8), Math.cos(a) * rt * 0.75, top + 0.3, Math.sin(a) * rt * 0.75); an(g, kugel(0.09, leucht(3, 2.2, 0.8), 8), k.position.x, top + 0.68, k.position.z).scale.set(1, 1.6, 1); }
  g.userData.schrift = schrift; return g; };
export const kinderwagen = ({ farbe = "#c87ab8" } = {}) => { const g = new THREE.Group(), m = plastik(farbe), em = metall("#c8ccd4");
  an(g, rb(1.4, 1.0, 2.2, 0.35, m), 0, 1.5, 0); const verdeck = an(g, new THREE.Mesh(new THREE.SphereGeometry(0.75, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: farbe, roughness: 0.4, clearcoat: 0.5, side: THREE.DoubleSide })), 0, 1.95, -0.55); verdeck.rotation.x = -1.2; verdeck.scale.set(0.95, 1.1, 1);
  for (const [x, z] of [[-0.7, -0.8], [0.7, -0.8], [-0.7, 0.8], [0.7, 0.8]]) { const r = an(g, new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.08, 8, 18), mat("#1a1a1e", 0.6)), x, 0.4, z); r.rotation.y = Math.PI / 2; }
  an(g, bx(1.4, 0.08, 0.08, em), 0, 2.6, 1.4); for (const sx of [-0.65, 0.65]) an(g, bx(0.06, 1.4, 0.06, em), sx, 2.0, 1.2).rotation.x = -0.4; return g; };

// ---------- Pech und Glück (Vergleich 24.11.: „bezahlt fürs Pech“) ----------
// Laden mit Glühbirnen-Rahmen (Lotto, Kino, Spielhalle): leuchtende Punkte um Schild und Fenster
export const gluehbirnenladen = ({ name = "LOTTO", wand = "#7a3ae8", breite = 14 } = {}) => { const g = laden({ name, wand, markise: ["#ffffff", "#2a6ae8"], breite }); const lm = leucht(3, 2.6, 1.4);
  const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 8, 6), lm, 120); const m = new THREE.Matrix4(); let n = 0;
  const kante = (x0, y0, x1, y1, k) => { for (let i = 0; i <= k; i++) { m.makeTranslation(x0 + (x1 - x0) * i / k, y0 + (y1 - y0) * i / k, 0.25); im.setMatrixAt(n++, m); } };
  const bw = breite * 0.72, by = 7.6, bh = breite * 0.16; kante(-bw / 2, by - bh / 2, bw / 2, by - bh / 2, 22); kante(-bw / 2, by + bh / 2, bw / 2, by + bh / 2, 22); kante(-bw / 2, by - bh / 2, -bw / 2, by + bh / 2, 4); kante(bw / 2, by - bh / 2, bw / 2, by + bh / 2, 4);
  kante(-breite / 2 + 0.3, 0.6, -breite / 2 + 0.3, 5, 10); kante(breite / 2 - 0.3, 0.6, breite / 2 - 0.3, 5, 10); im.count = n; g.add(im); return g; };
export const limousine = ({ farbe = "#111116", groesse = 1.7 } = {}) => { const g = new THREE.Group(), lack = new THREE.MeshPhysicalMaterial({ color: farbe, roughness: 0.15, metalness: 0.4, clearcoat: 1 }), glas = new THREE.MeshPhysicalMaterial({ color: "#1a2430", roughness: 0.05, clearcoat: 1 });
  an(g, rb(2.1, 0.75, 8, 0.25, lack), 0, 0.7, 0); an(g, rb(1.8, 0.6, 5.4, 0.25, lack), 0, 1.3, -0.4); for (const sx of [-1, 1]) an(g, bx(0.05, 0.4, 5.0, glas), sx * 0.91, 1.35, -0.4);
  for (const [x, z] of [[-0.95, 2.8], [0.95, 2.8], [-0.95, -2.9], [0.95, -2.9]]) { const rd = an(g, zyl(0.42, 0.42, 0.36, mat("#141418"), 18), x, 0.42, z); rd.rotation.z = Math.PI / 2; an(g, zyl(0.24, 0.24, 0.38, metall("#d8dce4"), 12), x, 0.42, z).rotation.z = Math.PI / 2; }
  for (const sx of [-0.7, 0.7]) { an(g, bx(0.45, 0.12, 0.05, leucht(2, 1.95, 1.7)), sx, 0.75, 4.01); an(g, bx(0.45, 0.1, 0.05, leucht(2.4, 0.25, 0.15)), sx, 0.78, -4.01); } an(g, bx(1.2, 0.4, 0.05, metall("#c8ccd4")), 0, 0.55, 4.02); g.scale.setScalar(groesse); return g; };
export const liegestuhl = ({ farbe = "#3ab0e8" } = {}) => { const g = new THREE.Group(), st = new THREE.MeshStandardMaterial({ map: streifenTex("#ffffff", farbe, 8, true), roughness: 0.8 }), fm = mat("#f4f4f4", 0.4);
  const liege = an(g, bx(1.6, 0.12, 4, st), 0, 1.0, 0.3); const lehne = an(g, bx(1.6, 0.12, 2, st), 0, 1.75, -2.2); lehne.rotation.x = 0.85; for (const [x, z] of [[-0.75, -1.4], [0.75, -1.4], [-0.75, 2.1], [0.75, 2.1]]) an(g, bx(0.12, 1.0, 0.12, fm), x, 0.5, z); return g; };

// Liste für Katalog und Vorschau (Name → Bau-Funktion mit Standardwerten)
// ---------- Buntes Reihenhaus (Vergleich 24.11.: Kleinstadt der Vorbild-Videos) ----------
// Pastellfarbene Stadthäuser mit 2–4 Stockwerken. Fassade als gezeichnete Textur (Fenster mit weißem Rahmen, Glanz, Fensterbank),
// dazu echtes Gesims, Sockel, Tür mit Vordach und auf Wunsch ein Laden mit gestreifter Markise. Front nach +z. Wenig Meshes → schnell.
const FASSADE = new Map();
const fassadeTex = (wand, stock, breite, laden, saat) => { const k = [wand, stock, breite, laden, saat].join(); if (FASSADE.has(k)) return FASSADE.get(k);
  const H = stock * 4.4, px = 40, w = Math.round(breite * px), h = Math.round(H * px), r = zufall(saat + 7);
  const t = tex(w, h, (x) => { x.fillStyle = wand; x.fillRect(0, 0, w, h);
    const hell = (a) => { x.globalAlpha = a; x.fillStyle = "#ffffff"; }; hell(0.10); for (let st = 1; st < stock; st++) x.fillRect(0, h - st * 4.4 * px - 6, w, 10); x.globalAlpha = 1;
    const n = Math.max(2, Math.round(breite / 4)), fw = 1.7 * px, fh = 2.3 * px, laeden = !!laden, art = r() < 0.5;
    for (let st = laeden ? 1 : 0; st < stock; st++) for (let i = 0; i < n; i++) { if (!laeden && st === 0 && i === Math.floor(n / 2)) continue;
      const cx = (i + 0.5) * w / n, cy = h - (st * 4.4 + 2.5) * px;
      x.fillStyle = "rgba(0,0,0,0.12)"; x.fillRect(cx - fw / 2 - 6, cy - fh / 2 - 2, fw + 12, fh + 14);
      const gr = x.createLinearGradient(cx - fw / 2, cy - fh / 2, cx + fw / 2, cy + fh / 2); gr.addColorStop(0, "#cfeaff"); gr.addColorStop(0.5, "#7fb8e8"); gr.addColorStop(1, "#5a90c8");
      x.fillStyle = "#ffffff"; x.fillRect(cx - fw / 2 - 8, cy - fh / 2 - 8, fw + 16, fh + 16); x.fillStyle = gr; x.fillRect(cx - fw / 2, cy - fh / 2, fw, fh);
      x.globalAlpha = 0.45; x.fillStyle = "#ffffff"; x.beginPath(); x.moveTo(cx - fw / 2, cy - fh * 0.1); x.lineTo(cx - fw * 0.1, cy - fh / 2); x.lineTo(cx + fw * 0.12, cy - fh / 2); x.lineTo(cx - fw / 2, cy + fh * 0.18); x.fill(); x.globalAlpha = 1;
      x.fillStyle = "#ffffff"; x.fillRect(cx - 4, cy - fh / 2, 8, fh); x.fillRect(cx - fw / 2, cy - 4, fw, 8);
      x.fillStyle = "#f4f2ec"; x.fillRect(cx - fw / 2 - 14, cy + fh / 2 + 6, fw + 28, 12);
      if (art && st > 0) { x.fillStyle = "rgba(0,0,0,0.18)"; x.fillRect(cx - fw / 2 - 30, cy - fh / 2 - 8, 18, fh + 16); x.fillRect(cx + fw / 2 + 12, cy - fh / 2 - 8, 18, fh + 16); } }
    if (laeden) { const sw = w * 0.62, sh = 2.9 * px, sx = w * 0.06, sy = h - 0.5 * px - sh; x.fillStyle = "#ffffff"; x.fillRect(sx - 8, sy - 8, sw + 16, sh + 16);
      const gr = x.createLinearGradient(sx, sy, sx + sw, sy + sh); gr.addColorStop(0, "#d8f0ff"); gr.addColorStop(1, "#6aa0d0"); x.fillStyle = gr; x.fillRect(sx, sy, sw, sh);
      x.fillStyle = "rgba(255,255,255,0.35)"; for (let i = 1; i < 3; i++) x.fillRect(sx + i * sw / 3 - 3, sy, 6, sh);
      x.fillStyle = "#ffffff"; x.font = `900 ${Math.round(px * 0.9)}px 'Inter Display', Inter, sans-serif`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(laden, w / 2, h - 3.95 * px); }
    x.fillStyle = "rgba(0,0,0,0.10)"; x.fillRect(0, h - 0.45 * px, w, 0.45 * px); });
  FASSADE.set(k, t); return t; };
const WANDMAT = new Map(); const wandMat = (c) => { if (!WANDMAT.has(c)) WANDMAT.set(c, mat(c, 0.85)); return WANDMAT.get(c); };
export const reihenhaus = ({ wand = "#9ad8c8", stock = 3, breite = 12, tiefe = 12, laden = null, markise = ["#ffffff", "#2ab08a"], tuer = "#2a7a4a", dach = "flach", saat = 3 } = {}) => {
  const g = new THREE.Group(), H = stock * 4.4, wm = wandMat(wand), front = new THREE.MeshStandardMaterial({ map: fassadeTex(wand, stock, breite, laden, saat), roughness: 0.8 });
  an(g, new THREE.Mesh(new THREE.BoxGeometry(breite, H, tiefe), [wm, wm, wm, wm, front, wm]), 0, H / 2, 0);
  const weiss = mat("#f6f4ee", 0.6); an(g, bx(breite + 0.5, 0.7, tiefe + 0.5, weiss), 0, H + 0.1, 0); an(g, bx(breite + 0.2, 0.5, 0.5, weiss), 0, 4.4, tiefe / 2 + 0.2);
  if (dach === "giebel") { const d = new THREE.Shape(); d.moveTo(-breite / 2 - 0.4, 0); d.lineTo(0, breite * 0.32); d.lineTo(breite / 2 + 0.4, 0); d.lineTo(-breite / 2 - 0.4, 0);
    const dg = new THREE.ExtrudeGeometry(d, { depth: tiefe + 0.8, bevelEnabled: false }); dg.translate(0, 0, -(tiefe + 0.8) / 2); an(g, new THREE.Mesh(dg, mat(["#c8503a", "#3a4a6a", "#6a3a3a"][saat % 3], 0.7)), 0, H + 0.4, 0); }
  else if (zufall(saat)() < 0.5) an(g, bx(breite * 0.3, 1.6, 0.4, weiss), 0, H + 1.1, tiefe / 2 - 0.2);   // Giebel-Aufsatz
  an(g, bx(breite, 0.6, 0.3, mat("#d8d2c4", 0.8)), 0, 0.3, tiefe / 2 + 0.1);
  if (laden) { const tx = breite * 0.37; an(g, bx(2.2, 3.8, 0.3, mat(tuer, 0.6)), tx, 1.9, tiefe / 2 + 0.05);
    const ms = new THREE.Mesh(new THREE.PlaneGeometry(breite * 0.96, 2.4), new THREE.MeshStandardMaterial({ map: streifenTex(markise[0], markise[1], 10), roughness: 0.8, side: THREE.DoubleSide }));
    ms.position.set(0, 4.0, tiefe / 2 + 1.0); ms.rotation.x = -Math.PI / 2 + 0.55; g.add(ms);
    const sb = new THREE.Mesh(new THREE.PlaneGeometry(breite * 0.96, 0.45), new THREE.MeshStandardMaterial({ map: streifenTex(markise[0], markise[1], 10), roughness: 0.8, side: THREE.DoubleSide })); sb.position.set(0, 2.78, tiefe / 2 + 2.05); g.add(sb); }
  else { an(g, bx(2.2, 3.8, 0.3, mat(tuer, 0.6)), 0, 1.9, tiefe / 2 + 0.05); an(g, kugel(0.14, metall("#e8c040"), 8), 0.7, 1.9, tiefe / 2 + 0.25);
    an(g, bx(3.2, 0.2, 1.4, weiss), 0, 4.0, tiefe / 2 + 0.7); an(g, bx(3.0, 0.3, 1.6, mat("#d8d2c4")), 0, 0.15, tiefe / 2 + 0.8); }
  if (stock >= 3 && zufall(saat + 3)() < 0.5) { const bk = an(g, bx(breite * 0.45, 0.25, 1.4, weiss), 0, 2 * 4.4 + 0.3, tiefe / 2 + 0.7); for (let i = 0; i < 7; i++) an(g, bx(0.12, 1.1, 0.12, weiss), -breite * 0.21 + i * breite * 0.07, 2 * 4.4 + 0.95, tiefe / 2 + 1.35); an(g, bx(breite * 0.45, 0.15, 0.15, weiss), 0, 2 * 4.4 + 1.5, tiefe / 2 + 1.35); }
  return g; };
// Pastell-Hochhaus für die Skyline hinter der Kleinstadt (Glasbänder)
const GLAS = tex(64, 256, (x, w, h) => { x.fillStyle = "#bfe2f4"; x.fillRect(0, 0, w, h); for (let i = 0; i < 32; i++) { x.fillStyle = i % 2 ? "#9ccce8" : "#e2f4fc"; x.fillRect(0, i * 8, w, 5); } }, [1, 1]);
export const glasturm = ({ breite = 16, hoehe = 70, farbe = "#a8d8f0" } = {}) => { const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ map: GLAS, color: farbe, roughness: 0.25, metalness: 0.2 });
  const b = an(g, bx(breite, hoehe, breite, m), 0, hoehe / 2, 0); an(g, bx(breite + 0.6, 1.2, breite + 0.6, mat("#f4f8fa", 0.5)), 0, hoehe + 0.6, 0); return g; };

// Brötchen auf Teller (Folge 2, 24.11.): Frühstück, kann angeknabbert verschwinden (.visible); userData.broetchen = nur das Brötchen
export const broetchen = ({ teller = "#ffffff", farbe = "#d8944a" } = {}) => { const g = new THREE.Group();
  an(g, zyl(0.62, 0.55, 0.07, plastik(teller), 28), 0, 0.035, 0);
  const b = new THREE.Group(); const k = an(b, kugel(0.42, mat(farbe, 0.75), 24), 0, 0.26, 0); k.scale.set(1.25, 0.62, 0.85);
  const schnitt = an(b, rb(0.07, 0.06, 0.62, 0.03, mat("#f0d8a8", 0.8)), 0, 0.5, 0); schnitt.rotation.z = 0.1;
  for (const [x, z] of [[-0.18, 0.08], [0.12, -0.1], [0.25, 0.12], [-0.05, -0.2]]) an(b, kugel(0.035, mat("#f4ecd8", 0.6), 8), x, 0.49, z);
  g.add(b); g.userData.broetchen = b; return g; };

// ---------- Sterne für gute Taten (24.11., Vorrat 03 „Das leere Glas“) ----------
const sternGeo = (r = 0.5, tiefe = 0.18) => { const f = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; i ? f.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : f.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  const g = new THREE.ExtrudeGeometry(f, { depth: tiefe, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 }); g.center(); return g; };
const STERN_MAT = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.72, 0.06), toneMapped: false });
const STERN_GLAS_MAT = new THREE.MeshStandardMaterial({ color: "#ffc21a", emissive: "#ffa000", emissiveIntensity: 0.55, roughness: 0.35, metalness: 0.2 });
// einzelner leuchtender Stern (fliegt z. B. ins Glas); userData.halo = weicher Schein
export const stern = ({ groesse = 1 } = {}) => { const g = new THREE.Group(); an(g, new THREE.Mesh(sternGeo(0.5), STERN_MAT));
  const halo = an(g, new THREE.Mesh(new THREE.CircleGeometry(1.0, 32), new THREE.MeshBasicMaterial({ color: "#ffc83a", transparent: true, opacity: 0.18, depthWrite: false }))); halo.position.z = -0.12; g.userData.halo = halo; g.scale.setScalar(groesse); return g; };
// Glas mit Sternen; userData.setze(n) zeigt n Sterne (0 … max), feste Lage je Stern (flackerfrei). brett: kleine Fensterbank darunter
export const sternglas = ({ max = 60, brett = false, etikett = "", n = 24, sprung = false } = {}) => {
  const g = new THREE.Group(), H = 1.5, R = 0.62, y0 = brett ? 0.16 : 0;
  if (brett) an(g, rb(1.9, 0.16, 1.1, 0.04, mat("#f4f0e8", 0.6)), 0, 0.08, 0);
  const glas = new THREE.MeshStandardMaterial({ color: "#cfe8ff", roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.4, depthWrite: false }), rand = mat("#eef8ff", 0.2);
  const k = an(g, zyl(R, R * 0.92, H, glas, 28), 0, y0 + H / 2, 0); k.renderOrder = 2;
  an(g, zyl(R * 0.98, R * 0.98, 0.04, glas, 28), 0, y0 + 0.02, 0);
  an(g, zyl(R * 0.82, R * 0.82, 0.12, glas, 28), 0, y0 + H + 0.03, 0);
  for (const yy of [y0 + 0.03, y0 + H - 0.02]) an(g, new THREE.Mesh(new THREE.TorusGeometry(R + 0.005, 0.03, 8, 40).rotateX(Math.PI / 2), rand), 0, yy, 0);   // helle Ränder, damit das Glas vor hellem Grund sichtbar bleibt
  for (const a of [-0.9, -0.55]) { const gl = an(g, bx(0.06, H * 0.8, 0.02, new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.5, depthWrite: false })), Math.sin(a) * (R + 0.01), y0 + H * 0.5, Math.cos(a) * (R + 0.01)); gl.rotation.y = a; }   // Glanzstreifen
  an(g, zyl(R * 0.86, R * 0.86, 0.22, mat("#c8784a", 0.5), 28), 0, y0 + H + 0.17, 0);                    // Korkdeckel
  if (etikett) { const t = tex(256, 128, (x, w, h) => { x.fillStyle = "#fff8e8"; x.fillRect(0, 0, w, h); x.fillStyle = "#3a2a1a"; x.font = "900 64px 'Inter Display', sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(etikett, w / 2, h / 2 + 4); });
    const e = an(g, new THREE.Mesh(new THREE.CylinderGeometry(R + 0.01, R + 0.01, 0.42, 28, 1, true, -0.8, 1.6), new THREE.MeshStandardMaterial({ map: t, roughness: 0.8 })), 0, y0 + H * 0.62, 0); e.rotation.y = Math.PI / 2 - 0.0; }
  if (sprung) { const sm = new THREE.MeshBasicMaterial({ color: "#ffffff" }), pts = [[0.05, 0.25], [0.18, 0.5], [0.02, 0.72], [0.2, 0.95], [0.08, 1.15]];
    for (let i = 0; i < pts.length - 1; i++) { const [a0, h0] = pts[i], [a1, h1] = pts[i + 1], l = Math.hypot((a1 - a0) * R, h1 - h0); const st = an(g, bx(0.035, l, 0.02, sm), Math.sin((a0 + a1) / 2) * (R + 0.012), y0 + (h0 + h1) / 2, Math.cos((a0 + a1) / 2) * (R + 0.012)); st.rotation.set(0, (a0 + a1) / 2, Math.atan2((a1 - a0) * R, h1 - h0) * -1); }
    g.userData.klebeband = an(g, new THREE.Mesh(new THREE.CylinderGeometry(R + 0.02, R + 0.02, 0.18, 28, 1, true, -0.5, 1.0), new THREE.MeshStandardMaterial({ color: "#f4ecc8", roughness: 0.6, transparent: true, opacity: 0.85 })), 0, y0 + 0.7, 0); g.userData.klebeband.visible = false; }
  const r = zufall(17), geo = sternGeo(0.12, 0.05), sterne = [];
  for (let i = 0; i < max; i++) { const lage = Math.floor(i / 9), a = r() * Math.PI * 2, d = Math.sqrt(r()) * (R - 0.16);
    const m = an(g, new THREE.Mesh(geo, STERN_GLAS_MAT), Math.cos(a) * d, y0 + 0.12 + lage * 0.1 + r() * 0.05, Math.sin(a) * d); m.rotation.set(r() * 3, r() * 3, r() * 3); m.visible = false; sterne.push(m); }
  const schein = an(g, new THREE.Mesh(new THREE.SphereGeometry(R * 1.25, 20, 14), new THREE.MeshBasicMaterial({ color: "#ffd84a", transparent: true, opacity: 0, depthWrite: false })), 0, y0 + H * 0.4, 0);
  g.userData.setze = (n) => { n = Math.max(0, Math.min(max, Math.round(n))); sterne.forEach((m, i) => m.visible = i < n); schein.material.opacity = Math.min(0.05, n * 0.002); };
  g.userData.oben = () => g.localToWorld(new THREE.Vector3(0, y0 + H + 0.4, 0));
  g.userData.setze(n); return g; };

// Besen des Hausmeisters (Stiel entlang +y, Borsten unten); in der Hand: an handPos setzen
export const besen = ({ stiel = "#c8864a", borsten = "#e8c860" } = {}) => { const g = new THREE.Group(); an(g, zyl(0.07, 0.07, 4.2, mat(stiel, 0.6), 10), 0, 2.4, 0);
  an(g, rb(1.3, 0.3, 0.4, 0.08, mat("#8a5a32", 0.6)), 0, 0.42, 0); an(g, rb(1.4, 0.38, 0.36, 0.06, mat(borsten, 0.9)), 0, 0.12, 0); return g; };
// Koffer mit Griff und Rollen (Vorrat 04, 24.11.); Griff oben, zum Ziehen an handPos setzen
export const koffer = ({ farbe = "#c83a3a", groesse = 1 } = {}) => { const g = new THREE.Group(), km = plastik(farbe);
  an(g, rb(1.5, 2.0, 0.8, 0.14, km), 0, 1.25, 0); for (const x of [-0.4, 0, 0.4]) an(g, bx(0.08, 1.8, 0.84, mat(new THREE.Color(farbe).multiplyScalar(0.8), 0.5)), x, 1.25, 0);
  for (const x of [-0.25, 0.25]) an(g, zyl(0.05, 0.05, 0.7, metall(), 8), x, 2.6, 0); an(g, rb(0.62, 0.1, 0.12, 0.04, metall("#2a2a2e")), 0, 2.95, 0);
  for (const x of [-0.55, 0.55]) { const r = an(g, zyl(0.13, 0.13, 0.12, mat("#1a1a1e", 0.6), 14), x, 0.13, 0.28); r.rotation.z = Math.PI / 2; }
  an(g, rb(0.5, 0.35, 0.03, 0.04, mat("#f4ecd8", 0.7)), 0.35, 1.7, 0.41); g.scale.setScalar(groesse); return g; };
// ---------- Random-Folge (Vorrat 05, 24.11.): Rakete, Startrampe, Grill, Trampolin, Lieferroller, Flugzeug ----------
// Rakete (eigene Form, kein echtes Vorbild): weißer Rumpf, rote Spitze und Flossen, Fenster, Düse. userData.flamme (Gruppe, .visible/.scale), Spitze bei y = hoehe
export const rakete = ({ hoehe = 16, farbe = "#f4f4f4", akzent = "#e83a3a" } = {}) => { const g = new THREE.Group(), R = hoehe * 0.09, km = plastik(farbe), am = plastik(akzent);
  an(g, zyl(R, R * 1.05, hoehe * 0.62, km, 28), 0, hoehe * 0.12 + hoehe * 0.31, 0);
  an(g, new THREE.Mesh(new THREE.ConeGeometry(R, hoehe * 0.26, 28), am), 0, hoehe * 0.74 + hoehe * 0.13, 0);
  an(g, zyl(R * 1.01, R * 1.01, hoehe * 0.05, am, 28), 0, hoehe * 0.6, 0);
  an(g, zyl(R * 0.75, R * 0.95, hoehe * 0.12, metall("#5a5a62"), 20), 0, hoehe * 0.06, 0);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2, fl = an(g, rb(0.18, hoehe * 0.22, R * 1.4, 0.05, am), Math.sin(a) * R * 1.45, hoehe * 0.17, Math.cos(a) * R * 1.45); fl.rotation.y = a; }
  const fe = an(g, zyl(R * 0.36, R * 0.36, 0.12, mat("#3a4a5e", 0.2), 20), 0, hoehe * 0.5, R * 0.98); fe.rotation.x = Math.PI / 2; an(g, new THREE.Mesh(new THREE.TorusGeometry(R * 0.38, 0.07, 8, 24), metall()), 0, hoehe * 0.5, R * 1.02);
  const fl = new THREE.Group(); g.add(fl); const f1 = an(fl, new THREE.Mesh(new THREE.ConeGeometry(R * 0.8, hoehe * 0.35, 18), leucht(3.4, 1.8, 0.4)), 0, -hoehe * 0.17, 0); f1.rotation.x = Math.PI;
  const f2 = an(fl, new THREE.Mesh(new THREE.ConeGeometry(R * 0.45, hoehe * 0.22, 14), leucht(3.8, 3.4, 2.0)), 0, -hoehe * 0.1, 0); f2.rotation.x = Math.PI; fl.visible = false; g.userData.flamme = fl; return g; };
// Startrampe: Betonplatte mit gelben Streifen, Gitterturm, Arm
export const startrampe = ({ groesse = 1 } = {}) => { const g = new THREE.Group(), st = metall("#c8c8cc"), rot = plastik("#e85a3a");
  an(g, bx(26, 1.2, 26, mat("#9a9aa0", 0.9)), 0, 0.6, 0); for (const s of [-1, 1]) an(g, bx(26, 0.05, 0.8, mat("#f2c21a", 0.6)), 0, 1.23, s * 12);
  for (let y = 0; y < 26; y += 3) { an(g, bx(4, 0.25, 0.25, st), -9, 1.2 + y, -2); an(g, bx(4, 0.25, 0.25, st), -9, 1.2 + y, 2); an(g, bx(0.25, 0.25, 4, st), -11, 1.2 + y, 0); an(g, bx(0.25, 0.25, 4, st), -7, 1.2 + y, 0); }
  for (const [x, z] of [[-11, -2], [-11, 2], [-7, -2], [-7, 2]]) an(g, bx(0.4, 27, 0.4, rot), x, 14.7, z);
  an(g, bx(6, 0.5, 0.8, rot), -4, 20, 0); g.scale.setScalar(groesse); return g; };
// Kugelgrill auf drei Beinen; userData.feuer (Glut + Flammen, .visible), userData.deckel
export const grill = ({ farbe = "#1e1e22" } = {}) => { const g = new THREE.Group(), km = new THREE.MeshPhysicalMaterial({ color: farbe, roughness: 0.35, clearcoat: 0.6 });
  const sch = an(g, new THREE.Mesh(new THREE.SphereGeometry(1.0, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), km), 0, 2.4, 0); sch.material.side = THREE.DoubleSide;
  for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3, b = an(g, zyl(0.06, 0.06, 2.3, metall("#8a8a90"), 8), Math.sin(a) * 0.55, 1.1, Math.cos(a) * 0.55); b.rotation.set(Math.cos(a) * 0.22, 0, -Math.sin(a) * 0.22); }
  an(g, new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.04, 6, 32).rotateX(Math.PI / 2), metall()), 0, 2.38, 0);
  for (let i = -3; i <= 3; i++) an(g, bx(1.9 * Math.cos(Math.asin(i / 3.6)), 0.03, 0.03, metall()), 0, 2.36, i * 0.27);
  const fe = new THREE.Group(); fe.position.y = 2.0; g.add(fe); for (let i = 0; i < 7; i++) an(fe, kugel(0.18, leucht(2.6, 0.9, 0.2), 10), Math.cos(i * 2.4) * 0.45, 0.02, Math.sin(i * 2.4) * 0.45);
  for (let i = 0; i < 4; i++) { const f = an(fe, new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.9, 10), leucht(3.4, 2.0, 0.5)), Math.cos(i * 1.6) * 0.3, 0.7, Math.sin(i * 1.6) * 0.3); f.scale.set(1, 1 + i * 0.15, 1); }
  fe.visible = false; g.userData.feuer = fe;
  const de = an(g, new THREE.Mesh(new THREE.SphereGeometry(1.0, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), km), 0, 2.4, 0); de.visible = false; g.userData.deckel = de;
  for (const x of [-0.35, 0, 0.35]) { const w = an(g, zyl(0.11, 0.11, 0.9, mat("#c8603a", 0.5), 10), x, 2.48, 0); w.rotation.x = Math.PI / 2; }      // Würstchen
  return g; };
// Trampolin; userData.matte (Delle: scale.y bzw. position.y), Durchmesser ~5 m
export const trampolin = ({ farbe = "#2a8ae8", d = 5 } = {}) => { const g = new THREE.Group(), r = d / 2;
  an(g, new THREE.Mesh(new THREE.TorusGeometry(r, 0.22, 10, 40).rotateX(Math.PI / 2), plastik(farbe)), 0, 1.4, 0);
  const m = an(g, zyl(r - 0.15, r - 0.15, 0.06, mat("#1a1a1e", 0.8), 40), 0, 1.38, 0); g.userData.matte = m;
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; an(g, zyl(0.08, 0.08, 1.4, metall("#8a8a90"), 8), Math.cos(a) * r, 0.7, Math.sin(a) * r); }
  return g; };
// Lieferroller mit Thermobox (ohne Marke); Fahrer setzt man mit sitz: 1 auf y ≈ 1.3
export const roller = ({ farbe = "#f2a21a", box = "#f26a1a" } = {}) => { const g = new THREE.Group(), km = plastik(farbe);
  for (const z of [-1.0, 1.0]) { const r = an(g, new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.16, 10, 24), mat("#1a1a1e", 0.7)), 0, 0.55, z); r.rotation.y = Math.PI / 2; }
  an(g, rb(0.7, 0.35, 2.0, 0.12, km), 0, 0.85, 0); an(g, rb(0.7, 0.7, 0.9, 0.2, km), 0, 1.15, -0.6); an(g, rb(0.6, 0.18, 1.0, 0.08, mat("#2a2a2e", 0.6)), 0, 1.55, -0.4);
  const st = an(g, zyl(0.07, 0.07, 1.6, metall(), 8), 0, 1.5, 0.95); st.rotation.x = -0.25; an(g, bx(1.1, 0.08, 0.08, metall("#2a2a2e")), 0, 2.25, 1.15);
  an(g, rb(1.1, 1.0, 1.0, 0.1, plastik(box)), 0, 2.1, -1.0); an(g, bx(0.6, 0.06, 0.02, mat("#ffffff")), 0, 2.15, -0.49);
  return g; };
// Passagierflugzeug (eigene schlichte Form), Nase in +z
export const flugzeug = ({ farbe = "#f4f4f4", akzent = "#2a6ae8" } = {}) => { const g = new THREE.Group(), km = plastik(farbe), am = plastik(akzent);
  const r = an(g, zyl(1.6, 1.6, 22, km, 24), 0, 0, 0); r.rotation.x = Math.PI / 2; const n = an(g, kugel(1.6, km, 24), 0, 0, 11); n.scale.set(1, 1, 1.6);
  const h = an(g, new THREE.Mesh(new THREE.ConeGeometry(1.6, 5, 24), km), 0, 0.3, -13.5); h.rotation.x = -Math.PI / 2;
  an(g, rb(26, 0.35, 4.5, 0.15, km), 0, -0.5, 0); an(g, rb(9, 0.3, 2.4, 0.12, km), 0, 0.6, -14); const lw = an(g, rb(0.35, 5, 3.2, 0.12, am), 0, 3.0, -14.2); lw.rotation.x = 0.3;
  for (const x of [-6, 6]) { const tw = an(g, zyl(0.8, 0.7, 3, metall("#c8c8cc"), 16), x, -1.4, 1); tw.rotation.x = Math.PI / 2; }
  an(g, bx(0.05, 0.5, 18, am), 1.61, 0.3, 0); an(g, bx(0.05, 0.5, 18, am), -1.61, 0.3, 0);
  for (let i = 0; i < 14; i++) for (const s of [-1, 1]) an(g, bx(0.06, 0.35, 0.5, mat("#2a3a4e", 0.2)), s * 1.6, 0.9, -8 + i * 1.3);
  return g; };
export const ALLE = { rakete, startrampe, grill, trampolin, roller, flugzeug, koffer, stern, sternglas, besen, reihenhaus, glasturm, baum, blumenkuebel, hecke, bank, laterne, ampel, hydrant, muelltonne, briefkasten, schild, zaun, brunnen, laden, haltestelle, fahrrad, bus, hund, katze, vogel, tisch, stuhl, sofa, stehlampe, regal, geschenk, fernseher, riesenTier, haus, schule, sportwagen, lichterkette, lehmhaus, wimpelkette, fackel, krug, palme, pyramide, glocke, thron, krone, sockel, steinwaechter, riesenWaechter, wolke, himmelshaus, bretterbude, muellberg, leiter, pool, glasaufzug, absperrung, goldvilla, goldschluessel, tellerhaus, spind, tribuene, krankenwagen, krankenbett, herzmonitor, babybett, achterbahn, torte, kinderwagen, gluehbirnenladen, limousine, liegestuhl, broetchen };
