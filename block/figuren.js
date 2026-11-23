// Blockfiguren (eigener Stil, an Baustein-Spielfiguren angelehnt) mit Hauttönen, Kleidung und Zubehör.
import { THREE, RoundedBoxGeometry, scene } from "./welt.js";

const plastik = c => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3 });
const stoff = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75 });
const rb = (w, h, d, r, m) => { const g = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), m); g.castShadow = true; return g; };

// Gesichter (Leinwand), pro Hautton zwischengespeichert
const GES = {};
export const gesicht = (art, haut) => { const key = art + haut; if (GES[key]) return GES[key];
  const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d");
  x.fillStyle = haut; x.fillRect(0, 0, 256, 256); const ink = "#1a1410"; x.fillStyle = ink; x.strokeStyle = ink; x.lineCap = "round"; x.lineJoin = "round";
  const brauen = (a = 0, y = 78) => { x.lineWidth = 9; x.beginPath(); x.moveTo(66, y + a); x.lineTo(108, y - a * 0.4); x.moveTo(148, y - a * 0.4); x.lineTo(190, y + a); x.stroke(); };
  const augen = (h = 20, w = 13, py = 0) => { for (const ex of [88, 168]) { x.fillStyle = ink; x.beginPath(); x.ellipse(ex, 112 + py, w, h, 0, 0, 7); x.fill(); x.fillStyle = "#fff"; x.beginPath(); x.arc(ex + 4, 104 + py, 5, 0, 7); x.fill(); } x.fillStyle = ink; };
  if (art === "froh") { brauen(-2); augen(); x.lineWidth = 9; x.beginPath(); x.arc(128, 150, 36, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke(); }
  else if (art === "lachen") { brauen(-4, 74); x.lineWidth = 9; for (const ex of [88, 168]) { x.beginPath(); x.arc(ex, 118, 15, 1.15 * Math.PI, 1.85 * Math.PI); x.stroke(); } x.beginPath(); x.moveTo(84, 150); x.quadraticCurveTo(128, 214, 172, 150); x.closePath(); x.fill(); x.fillStyle = "#e86a6a"; x.beginPath(); x.ellipse(128, 182, 20, 10, 0, 0, 7); x.fill(); }
  else if (art === "reden") { brauen(0); augen(); x.beginPath(); x.ellipse(128, 166, 20, 15, 0, 0, 7); x.fill(); }
  else if (art === "schreien") { brauen(10, 80); augen(17, 12, 2); x.beginPath(); x.moveTo(92, 150); x.quadraticCurveTo(128, 140, 164, 150); x.quadraticCurveTo(160, 210, 128, 212); x.quadraticCurveTo(96, 210, 92, 150); x.fill(); x.fillStyle = "#fff"; x.fillRect(100, 150, 56, 9); }
  else if (art === "angst") { x.lineWidth = 8; x.beginPath(); x.moveTo(66, 76); x.lineTo(106, 66); x.moveTo(150, 66); x.lineTo(190, 76); x.stroke(); for (const ex of [88, 168]) { x.fillStyle = "#fff"; x.beginPath(); x.ellipse(ex, 110, 22, 25, 0, 0, 7); x.fill(); x.fillStyle = ink; x.beginPath(); x.arc(ex, 113, 10, 0, 7); x.fill(); } x.beginPath(); x.ellipse(128, 174, 14, 19, 0, 0, 7); x.fill(); }
  else if (art === "idee") { brauen(-8, 70); for (const ex of [88, 168]) { x.fillStyle = "#fff"; x.beginPath(); x.ellipse(ex, 108, 20, 23, 0, 0, 7); x.fill(); x.fillStyle = ink; x.beginPath(); x.arc(ex + 3, 106, 11, 0, 7); x.fill(); x.fillStyle = "#fff"; x.beginPath(); x.arc(ex + 7, 101, 4, 0, 7); x.fill(); } x.fillStyle = ink; x.lineWidth = 9; x.beginPath(); x.arc(128, 150, 32, 0.12 * Math.PI, 0.88 * Math.PI); x.stroke(); }
  else if (art === "ernst") { brauen(8, 82); augen(16); x.lineWidth = 8; x.beginPath(); x.moveTo(104, 168); x.lineTo(152, 168); x.stroke(); }
  else if (art === "staunen") { brauen(-10, 68); for (const ex of [88, 168]) { x.fillStyle = "#fff"; x.beginPath(); x.ellipse(ex, 110, 19, 23, 0, 0, 7); x.fill(); x.fillStyle = ink; x.beginPath(); x.arc(ex, 112, 11, 0, 7); x.fill(); x.fillStyle = "#fff"; x.beginPath(); x.arc(ex + 4, 107, 4, 0, 7); x.fill(); } x.fillStyle = ink; x.beginPath(); x.ellipse(128, 170, 17, 22, 0, 0, 7); x.fill(); }
  else if (art === "traurig") { x.lineWidth = 9; x.beginPath(); x.moveTo(66, 84); x.lineTo(106, 72); x.moveTo(150, 72); x.lineTo(190, 84); x.stroke(); augen(17, 12, 4); x.lineWidth = 8; x.beginPath(); x.arc(128, 188, 26, 1.2 * Math.PI, 1.8 * Math.PI); x.stroke(); }
  else if (art === "schlaf") { x.lineWidth = 8; for (const ex of [88, 168]) { x.beginPath(); x.arc(ex, 108, 14, 0.1 * Math.PI, 0.9 * Math.PI); x.stroke(); } x.beginPath(); x.arc(128, 156, 18, 0.2 * Math.PI, 0.8 * Math.PI); x.stroke(); }
  if (art !== "ernst" && art !== "angst" && art !== "schreien" && art !== "traurig") { x.fillStyle = "rgba(240,90,90,0.22)"; for (const ex of [58, 198]) { x.beginPath(); x.ellipse(ex, 150, 17, 10, 0, 0, 7); x.fill(); } }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return GES[key] = t; };
export const mund = (t, k = 0) => (Math.sin(t * 11 + k) + Math.sin(t * 7.3 + k * 2) > 0.3 ? "reden" : "froh");

const blobTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d"); const g = x.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, "rgba(0,0,0,0.7)"); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();

export const FIGUREN = [];
// o: haut, hemd, hose, haare, frisur ('kurz','zopf','dutt','strubbel','glatze'), helm, weste, muetze, brille, kapuze, schuhe, skala,
//    jacke (offene Jacke über dem Hemd), brust (Zeichen/Emoji auf der Brust, brustFarbe)
export const figur = (o) => {
  const sk = o.skala ?? 1, haut = o.haut ?? "#e8b98a";
  const f = new THREE.Group(); const hautM = plastik(haut);
  const koerper = new THREE.Group(); f.add(koerper);
  const kopfG = new THREE.Group(); kopfG.position.y = 4.0; koerper.add(kopfG);
  const kopf = rb(1.25, 1.2, 1.25, 0.32, hautM); kopf.position.y = 0.62; kopfG.add(kopf);
  const gm = new THREE.MeshPhysicalMaterial({ map: gesicht("froh", haut), roughness: 0.45, clearcoat: 0.4 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), gm); fl.position.set(0, 0.62, 0.648); kopfG.add(fl);
  const hm = o.haare ? plastik(o.haare) : null, fr = o.frisur ?? "kurz";
  if (hm && fr !== "glatze") { const h = rb(1.36, 0.5, 1.36, 0.18, hm); h.position.y = 1.15; kopfG.add(h);
    const hb = rb(1.36, fr === "zopf" || fr === "dutt" ? 1.0 : 0.8, 0.3, 0.12, hm); hb.position.set(0, fr === "zopf" ? 0.7 : 0.85, -0.55); kopfG.add(hb);
    if (fr === "zopf") { const z = rb(0.45, 1.1, 0.45, 0.2, hm); z.position.set(0, 0.5, -0.85); kopfG.add(z); }
    if (fr === "dutt") { const d = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), hm); d.position.set(0, 1.55, -0.25); kopfG.add(d); }
    if (fr === "strubbel") for (const [dx, dz, rz] of [[-0.35, 0.25, -0.4], [0.3, 0.3, 0.3], [0, -0.2, 0.1], [0.4, -0.3, 0.5]]) { const s = rb(0.5, 0.38, 0.5, 0.15, hm); s.position.set(dx, 1.45, dz); s.rotation.z = rz; kopfG.add(s); } }
  if (o.helm) { const hm2 = plastik(o.helm); const k = new THREE.Mesh(new THREE.SphereGeometry(0.8, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), hm2); k.scale.set(1, 0.85, 1.05); k.position.y = 1.2; kopfG.add(k); const r = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.08, 24), hm2); r.position.set(0, 1.2, 0.08); kopfG.add(r); }
  if (o.muetze) { const mm = plastik(o.muetze); const k = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.68, 0.45, 20), mm); k.position.y = 1.42; kopfG.add(k); const s = rb(0.9, 0.08, 0.5, 0.04, plastik("#111")); s.position.set(0, 1.22, 0.62); kopfG.add(s); const b = rb(0.25, 0.25, 0.05, 0.05, new THREE.MeshStandardMaterial({ color: "#e8c040", metalness: 0.8, roughness: 0.3 })); b.position.set(0, 1.48, 0.72); kopfG.add(b); }
  if (o.brille) { const bm = new THREE.MeshStandardMaterial({ color: "#222", roughness: 0.3 }); for (const ex of [-0.31, 0.31]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.03, 6, 16), bm); r.position.set(ex, 0.72, 0.66); kopfG.add(r); } const st = rb(0.24, 0.04, 0.04, 0.01, bm); st.position.set(0, 0.74, 0.66); kopfG.add(st); }
  const hemdM = (o.kapuze || o.stoff) ? stoff(o.hemd) : plastik(o.hemd);
  const torso = rb(2, 2, 1, 0.12, hemdM); torso.position.y = 2.95; koerper.add(torso);
  if (o.kapuze) { const k = rb(1.6, 0.5, 0.5, 0.2, hemdM); k.position.set(0, 3.85, -0.45); koerper.add(k); const t = rb(0.9, 0.6, 0.06, 0.05, stoff(new THREE.Color(o.hemd).multiplyScalar(0.8))); t.position.set(0, 2.45, 0.52); koerper.add(t); }
  if (o.weste) { const wm = plastik(o.weste); const w = rb(2.06, 1.8, 1.06, 0.12, wm); w.position.y = 3.0; koerper.add(w); const st = new THREE.MeshStandardMaterial({ color: "#e8e8e0", emissive: "#bfbfb0", emissiveIntensity: 0.6, roughness: 0.3 });
    for (const y of [2.55, 3.25]) { const s = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.16, 1.1), st); s.position.y = y; koerper.add(s); } }
  if (o.abzeichen) { const b = rb(0.35, 0.4, 0.05, 0.05, new THREE.MeshStandardMaterial({ color: "#e8c040", metalness: 0.8, roughness: 0.3 })); b.position.set(-0.5, 3.4, 0.53); koerper.add(b); const fu = rb(0.3, 0.5, 0.2, 0.05, plastik("#222")); fu.position.set(0.55, 3.4, 0.55); koerper.add(fu); const g = rb(2.04, 0.22, 1.04, 0.05, plastik("#1a1a1a")); g.position.y = 2.05; koerper.add(g); }
  if (o.jacke) { const jm = stoff(o.jacke); const r = rb(2.08, 2.04, 0.55, 0.12, jm); r.position.set(0, 2.95, -0.25); koerper.add(r);
    for (const sx of [-1, 1]) { const v = rb(0.62, 2.04, 0.5, 0.1, jm); v.position.set(sx * 0.73, 2.95, 0.29); koerper.add(v); const kr = rb(0.5, 0.5, 0.12, 0.05, jm); kr.position.set(sx * 0.42, 3.72, 0.55); kr.rotation.z = sx * 0.5; koerper.add(kr); } }
  if (o.brust) { const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d"); x.fillStyle = o.brustFarbe ?? "#ffd23a"; x.font = "900 96px 'Inter Display', Inter, 'Noto Color Emoji', sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(o.brust, 64, 70);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const b = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.75), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.7 })); b.position.set(0, 3.1, o.weste || o.jacke ? 0.56 : 0.51); koerper.add(b); }
  if (o.schal) { const s = rb(2.0, 0.4, 1.1, 0.15, stoff(o.schal)); s.position.y = 3.85; koerper.add(s); }
  const glied = (x, y, m, hand) => { const p = new THREE.Group(); p.position.set(x, y, 0); const b = rb(0.96, hand ? 1.5 : 1.6, 0.96, 0.12, m); b.position.y = hand ? -0.7 : -0.75; p.add(b);
    if (hand) { const hd = rb(0.96, 0.5, 0.96, 0.12, hautM); hd.position.y = -1.7; p.add(hd); } else { const s = rb(1.0, 0.42, 1.12, 0.12, plastik(o.schuhe ?? "#2a2a2e")); s.position.set(0, -1.75, 0.06); p.add(s); } return p; };
  const armM = o.weste ? plastik(o.aermel ?? o.hemd) : hemdM;
  const armL = glied(-1.5, 3.85, armM, true), armR = glied(1.5, 3.85, armM, true); koerper.add(armL, armR);
  const hoseM = plastik(o.hose); const beinL = glied(-0.5, 1.95, hoseM), beinR = glied(0.5, 1.95, hoseM); f.add(beinL, beinR);
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false })); blob.position.y = 0.03; f.add(blob);
  f.userData = { koerper, kopfG, gm, armL, armR, beinL, beinR, skala: sk, haut };
  f.scale.setScalar(0.9 * sk); scene.add(f); FIGUREN.push(f); return f; };

export const pose = (f, o = {}) => {
  const { phase = 0, lauf = 0, renn = 0, sitz = 0, liegen = 0, kopfNeig = 0, kopfDreh = 0, armL = 0, armR = 0, armLz = 0, armRz = 0, ges = "froh", huepf = 0, atmen = 0, neig = 0 } = o;
  const u = f.userData, s = Math.sin(phase), c = Math.cos(phase * 2), L = Math.max(lauf, renn), amp = lauf * 0.7 + renn * 1.05;
  u.beinL.rotation.x = -s * amp - sitz * Math.PI / 2; u.beinR.rotation.x = s * amp - sitz * Math.PI / 2;
  u.armL.rotation.x = s * (0.6 * lauf + 1.1 * renn) - armL; u.armR.rotation.x = -s * (0.6 * lauf + 1.1 * renn) - armR;
  u.armL.rotation.z = -0.06 - armLz; u.armR.rotation.z = 0.06 + armRz;
  u.koerper.position.y = (0.5 - 0.5 * c) * (0.16 * lauf + 0.35 * renn) + Math.sin(atmen * 2.2) * 0.025 + huepf;
  u.koerper.rotation.set(neig + 0.06 * lauf + 0.22 * renn, s * 0.1 * L, 0);
  u.kopfG.rotation.set(kopfNeig - 0.12 * renn, kopfDreh - s * 0.07 * L, 0);
  f.rotation.order = "YXZ"; f.rotation.x = liegen ? -Math.PI / 2 * liegen : 0;
  const tex = gesicht(ges, u.haut); if (u.gm.map !== tex) { u.gm.map = tex; u.gm.needsUpdate = true; } };
export const handPos = (f, rechts = true, y = -1.9, z = 0.2) => { f.updateMatrixWorld(true); const p = new THREE.Vector3(0, y, z); (rechts ? f.userData.armR : f.userData.armL).localToWorld(p); return p; };
export const kopfPos = (f, y = 0.62) => { f.updateMatrixWorld(true); const p = new THREE.Vector3(0, y, 0); f.userData.kopfG.localToWorld(p); return p; };
