// Blockfiguren (eigener Stil, an Baustein-Spielfiguren angelehnt) mit Hauttönen, Kleidung und Zubehör.
import { THREE, RoundedBoxGeometry, scene } from "./welt.js";

const plastik = c => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3 });
const stoff = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75 });
const rb = (w, h, d, r, m) => { const g = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), m); g.castShadow = true; return g; };

// Gesichter (Leinwand), pro Hautton zwischengespeichert
const GES = {};
export const gesicht = (art, haut, rund = false) => { const key = art + haut + (rund ? "r" : ""); if (GES[key]) return GES[key];
  const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d");
  if (!rund) { x.fillStyle = haut; x.fillRect(0, 0, 256, 256); } const ink = "#1a1410"; x.fillStyle = ink; x.strokeStyle = ink; x.lineCap = "round"; x.lineJoin = "round";
  const brauen = (a = 0, y = 78) => { x.lineWidth = 9; x.beginPath(); x.moveTo(66, y + a); x.lineTo(108, y - a * 0.4); x.moveTo(148, y - a * 0.4); x.lineTo(190, y + a); x.stroke(); };
  const augen = (h = 20, w = 13, py = 0) => { for (const ex of [88, 168]) { x.fillStyle = ink; x.beginPath(); x.ellipse(ex, 112 + py, w, h, 0, 0, 7); x.fill(); x.fillStyle = "#fff"; x.beginPath(); x.arc(ex + 4, 104 + py, 5, 0, 7); x.fill(); } x.fillStyle = ink; };
  if (art === "froh") { brauen(-2); augen(); x.lineWidth = 9; x.beginPath(); x.arc(128, 150, 36, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke(); }
  else if (art === "lachen") { brauen(-4, 74); x.lineWidth = 9; for (const ex of [88, 168]) { x.beginPath(); x.arc(ex, 118, 15, 1.15 * Math.PI, 1.85 * Math.PI); x.stroke(); } x.beginPath(); x.moveTo(84, 150); x.quadraticCurveTo(128, 214, 172, 150); x.closePath(); x.fill(); x.fillStyle = "#e86a6a"; x.beginPath(); x.ellipse(128, 182, 20, 10, 0, 0, 7); x.fill(); }
  else if (art === "reden") { brauen(0); augen(); x.beginPath(); x.ellipse(128, 166, 20, 15, 0, 0, 7); x.fill(); }
  else if (art === "schreien") { brauen(10, 80); augen(17, 12, 2); x.beginPath(); x.moveTo(92, 150); x.quadraticCurveTo(128, 140, 164, 150); x.quadraticCurveTo(160, 210, 128, 212); x.quadraticCurveTo(96, 210, 92, 150); x.fill(); x.fillStyle = "#fff"; x.fillRect(100, 150, 56, 9); }
  else if (art === "angst") { x.lineWidth = 8; x.beginPath(); x.moveTo(66, 76); x.lineTo(106, 66); x.moveTo(150, 66); x.lineTo(190, 76); x.stroke(); for (const ex of [88, 168]) { x.fillStyle = "#fff"; x.beginPath(); x.ellipse(ex, 110, 22, 25, 0, 0, 7); x.fill(); x.fillStyle = ink; x.beginPath(); x.arc(ex, 113, 10, 0, 7); x.fill(); } x.beginPath(); x.ellipse(128, 174, 14, 19, 0, 0, 7); x.fill(); }
  else if (art === "idee") { brauen(-8, 70); for (const ex of [88, 168]) { x.fillStyle = "#fff"; x.beginPath(); x.ellipse(ex, 108, 20, 23, 0, 0, 7); x.fill(); x.fillStyle = ink; x.beginPath(); x.arc(ex + 3, 106, 11, 0, 7); x.fill(); x.fillStyle = "#fff"; x.beginPath(); x.arc(ex + 7, 101, 4, 0, 7); x.fill(); } x.fillStyle = ink; x.lineWidth = 9; x.beginPath(); x.arc(128, 150, 32, 0.12 * Math.PI, 0.88 * Math.PI); x.stroke(); }
  else if (art === "ernst") { brauen(8, 82); augen(16); x.lineWidth = 8; x.beginPath(); x.moveTo(104, 168); x.lineTo(152, 168); x.stroke(); }
  else if (art === "staunen") { brauen(9, 62); for (const ex of [88, 168]) { x.fillStyle = "#fff"; x.beginPath(); x.ellipse(ex, 110, 19, 23, 0, 0, 7); x.fill(); x.fillStyle = ink; x.beginPath(); x.arc(ex, 112, 11, 0, 7); x.fill(); x.fillStyle = "#fff"; x.beginPath(); x.arc(ex + 4, 107, 4, 0, 7); x.fill(); } x.fillStyle = ink; x.beginPath(); x.ellipse(128, 170, 17, 22, 0, 0, 7); x.fill(); }
  else if (art === "traurig") { x.lineWidth = 9; x.beginPath(); x.moveTo(66, 84); x.lineTo(106, 72); x.moveTo(150, 72); x.lineTo(190, 84); x.stroke(); augen(17, 12, 4); x.lineWidth = 8; x.beginPath(); x.arc(128, 188, 26, 1.2 * Math.PI, 1.8 * Math.PI); x.stroke(); }
  else if (art === "weinen") { x.lineWidth = 9; x.beginPath(); x.moveTo(66, 82); x.lineTo(106, 70); x.moveTo(150, 70); x.lineTo(190, 82); x.stroke(); augen(17, 12, 4); x.lineWidth = 8; x.beginPath(); x.arc(128, 190, 24, 1.15 * Math.PI, 1.85 * Math.PI); x.stroke();
    x.fillStyle = "#5ab8f0"; for (const ex of [74, 182]) { x.beginPath(); x.moveTo(ex, 128); x.quadraticCurveTo(ex - 12, 156, ex, 166); x.quadraticCurveTo(ex + 12, 156, ex, 128); x.fill(); } x.fillStyle = ink; }
  else if (art === "schwitzen") { brauen(6, 76); augen(17, 12, 2); x.lineWidth = 7; x.beginPath(); x.moveTo(98, 172); for (let i = 0; i <= 6; i++) x.lineTo(98 + i * 10, 172 + (i % 2 ? -7 : 7)); x.stroke();
    x.fillStyle = "#7ac8f8"; x.beginPath(); x.moveTo(204, 40); x.quadraticCurveTo(190, 70, 204, 80); x.quadraticCurveTo(218, 70, 204, 40); x.fill(); x.fillStyle = ink; }
  else if (art === "kneifen") { x.lineWidth = 9; for (const [ex, d] of [[88, 1], [168, -1]]) { x.beginPath(); x.moveTo(ex - 18 * d, 96); x.lineTo(ex + 14 * d, 110); x.lineTo(ex - 18 * d, 124); x.stroke(); } brauen(8, 76);
    x.beginPath(); x.ellipse(128, 172, 26, 14, 0, 0, 7); x.fill(); x.fillStyle = "#fff"; x.fillRect(104, 166, 48, 8); x.fillStyle = ink; }
  else if (art === "muede") { brauen(-2, 80); x.lineWidth = 8; for (const ex of [88, 168]) { x.beginPath(); x.moveTo(ex - 15, 112); x.lineTo(ex + 15, 112); x.stroke(); x.beginPath(); x.arc(ex, 112, 12, 0.1 * Math.PI, 0.9 * Math.PI); x.fill(); } x.fillStyle = "rgba(90,70,110,0.25)"; for (const ex of [88, 168]) { x.beginPath(); x.ellipse(ex, 132, 16, 6, 0, 0, 7); x.fill(); } x.fillStyle = ink; x.lineWidth = 7; x.beginPath(); x.moveTo(114, 172); x.lineTo(142, 172); x.stroke(); }
  else if (art === "schlaf") { x.lineWidth = 8; for (const ex of [88, 168]) { x.beginPath(); x.arc(ex, 108, 14, 0.1 * Math.PI, 0.9 * Math.PI); x.stroke(); } x.beginPath(); x.arc(128, 156, 18, 0.2 * Math.PI, 0.8 * Math.PI); x.stroke(); }
  if (!["ernst", "angst", "schreien", "traurig", "weinen", "schwitzen", "kneifen", "muede"].includes(art)) { x.fillStyle = "rgba(240,90,90,0.22)"; for (const ex of [58, 198]) { x.beginPath(); x.ellipse(ex, 150, 17, 10, 0, 0, 7); x.fill(); } }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return GES[key] = t; };
// Gesicht auf der gerundeten Kopfform (Jonathan 23.11.: „kein Viereck auf einem runden Quader“): die Vorderseite der Kopf-Geometrie,
// minimal größer, mit ebener Projektion der Gesichtstextur (durchsichtig, nur Augen/Mund/Brauen/Wangen). Alte Darstellung: figur({ flachesGesicht: true }).
const gesichtGeo = (() => { const src = new RoundedBoxGeometry(1.25, 1.2, 1.25, 3, 0.32); const p = src.attributes.position, n = src.attributes.normal; const pos = [], nor = [], uv = [];
  for (let i = 0; i < p.count; i += 3) { if ((n.getZ(i) + n.getZ(i + 1) + n.getZ(i + 2)) / 3 < 0.2) continue;
    for (let k = 0; k < 3; k++) { const x = p.getX(i + k), y = p.getY(i + k), z = p.getZ(i + k); pos.push(x * 1.006, y * 1.006, z * 1.006); nor.push(n.getX(i + k), n.getY(i + k), n.getZ(i + k)); uv.push(x + 0.5, y + 0.5); } }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); return g; })();
export const mund = (t, k = 0) => (Math.sin(t * 11 + k) + Math.sin(t * 7.3 + k * 2) > 0.3 ? "reden" : "froh");

// Stoff- und Haarstruktur (Jonathan 23.11., Vergleich mit Vorbild): nur mit figur({ struktur: true }), alte Figuren bleiben glatt
const STRUKTUR = {};
const strukturTex = (art) => { if (STRUKTUR[art]) return STRUKTUR[art]; const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d"); let s = art === "haar" ? 17 : 5; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  x.fillStyle = "#808080"; x.fillRect(0, 0, 256, 256);
  if (art === "haar") { for (let i = 0; i < 2600; i++) { const g = 90 + r() * 90; x.strokeStyle = `rgb(${g},${g},${g})`; x.lineWidth = 1 + r() * 2.5; const px = r() * 256, py = r() * 256, l = 6 + r() * 16, a = -0.3 + r() * 0.6; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.sin(a) * l, py + Math.cos(a) * l); x.stroke(); } }
  else { for (let i = 0; i < 9000; i++) { const g = 105 + r() * 50; x.fillStyle = `rgb(${g},${g},${g})`; x.fillRect(r() * 256, r() * 256, 2, 2); }
    x.globalAlpha = 0.5; for (let i = 0; i < 14; i++) { const g = 60 + r() * 40; x.strokeStyle = `rgb(${g},${g},${g})`; x.lineWidth = 2 + r() * 3; const px = r() * 256, py = r() * 256; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + 20 - r() * 40, py + 30, px + 10 - r() * 20, py + 50 + r() * 40); x.stroke(); } x.globalAlpha = 1; }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(art === "haar" ? 1.5 : 2, art === "haar" ? 1.5 : 2); t.anisotropy = 4; return STRUKTUR[art] = t; };
const FARBSTRUKTUR = {};
const farbStrukturTex = (art) => { if (FARBSTRUKTUR[art]) return FARBSTRUKTUR[art]; const quelle = strukturTex(art).image; const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d");
  x.drawImage(quelle, 0, 0); const d = x.getImageData(0, 0, 256, 256); for (let i = 0; i < d.data.length; i += 4) { const v = d.data[i] / 255; const h = Math.round(255 * Math.min(1, 0.7 + v * 0.42)); d.data[i] = d.data[i + 1] = d.data[i + 2] = h; } x.putImageData(d, 0, 0);
  if (art === "stoff") { x.globalAlpha = 0.18; x.strokeStyle = "#000"; x.lineWidth = 1.2; for (let y = 0; y < 256; y += 8) for (let xx = 0; xx < 256; xx += 8) { x.beginPath(); x.moveTo(xx, y); x.lineTo(xx + 4, y + 6); x.lineTo(xx + 8, y); x.stroke(); } x.globalAlpha = 1; }   // feines Strickmuster
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.copy(strukturTex(art).repeat); t.anisotropy = 4; return FARBSTRUKTUR[art] = t; };
const strukturieren = (m, art = "stoff") => { if (!m) return m; m.bumpMap = strukturTex(art); m.bumpScale = art === "haar" ? 9 : 6; m.map = farbStrukturTex(art); m.color.multiplyScalar(1.12); m.roughness = art === "haar" ? 0.6 : 0.85; if ("clearcoat" in m) m.clearcoat = art === "haar" ? 0.25 : 0.04; m.needsUpdate = true; return m; };

// Stoffmuster (Vergleich 24.11.): muster: { hemd: "streifen" | "karo" | "punkte", hose: … }, Farbe kommt weiter aus hemd/hose
const MUSTER = {};
const musterTex = (art) => { if (MUSTER[art]) return MUSTER[art]; const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d"); x.fillStyle = "#ffffff"; x.fillRect(0, 0, 256, 256);
  if (art === "streifen") { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? "#ffffff" : "#9a9aa2"; x.fillRect(i * 32, 0, 32, 256); x.fillStyle = "rgba(0,0,0,0.25)"; x.fillRect(i * 32, 0, 3, 256); } }
  else if (art === "karo") { x.fillStyle = "#5a5a66"; for (let i = 0; i < 4; i++) { x.globalAlpha = 0.55; x.fillRect(i * 64 + 8, 0, 24, 256); x.fillRect(0, i * 64 + 8, 256, 24); x.globalAlpha = 0.9; x.fillRect(i * 64 + 40, 0, 4, 256); x.fillRect(0, i * 64 + 40, 256, 4); } x.globalAlpha = 1; }
  else if (art === "punkte") { x.fillStyle = "#8a8a94"; for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { x.beginPath(); x.arc(i * 43 + (j % 2) * 21 + 10, j * 43 + 10, 8, 0, 7); x.fill(); } }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1.5, 1.5); t.anisotropy = 4; return MUSTER[art] = t; };
const mustern = (m, art) => { if (!m || !art) return m; m.map = musterTex(art); if (m.bumpMap) { /* Struktur bleibt als Relief */ } m.needsUpdate = true; return m; };

const blobTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d"); const g = x.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, "rgba(0,0,0,0.7)"); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();

export const FIGUREN = [];
// o: haut, hemd, hose, haare, frisur ('kurz','zopf','dutt','strubbel','glatze'), helm, weste, muetze, brille, kapuze, schuhe, skala,
//    jacke (offene Jacke über dem Hemd), brust (Zeichen/Emoji auf der Brust, brustFarbe), struktur (Stoff- und Haarstruktur, für neue Folgen),
//    propeller (Propellermütze; true oder 4 Farben; drehen: f.userData.propeller.rotation.y = t * 12), sonnenbrille, muster { hemd, hose: streifen|karo|punkte },
//    kragen (breiter Halskragen; true oder Farbe), krone (goldene Krone), zylinder (Zylinderhut; true oder Farbe, zylinderBand), goldkette, baby (großer Kopf; mit skala ≈ 0.45)
export const figur = (o) => {
  const sk = o.skala ?? 1, haut = o.haut ?? "#e8b98a";
  const f = new THREE.Group(); const hautM = plastik(haut);
  const koerper = new THREE.Group(); f.add(koerper);
  const kopfG = new THREE.Group(); kopfG.position.y = 4.0; koerper.add(kopfG);
  const kopf = rb(1.25, 1.2, 1.25, 0.32, hautM); kopf.position.y = 0.62; kopfG.add(kopf);
  const rund = !o.flachesGesicht;
  const gm = new THREE.MeshPhysicalMaterial({ map: gesicht("froh", haut, rund), roughness: 0.45, clearcoat: 0.4, ...(rund ? { transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, clearcoat: 0.08, roughness: 0.6 } : {}) });
  if (rund) { const tex = gm.map; const fl = new THREE.Mesh(gesichtGeo, gm); fl.position.y = 0.62; fl.renderOrder = 1; kopfG.add(fl); }
  else { const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), gm); fl.position.set(0, 0.62, 0.648); kopfG.add(fl); }
  const hm = o.haare ? plastik(o.haare) : null, fr = o.frisur ?? "kurz"; const S = !!o.struktur; if (S) strukturieren(hm, "haar");
  if (hm && fr !== "glatze") { const h = rb(1.36, 0.5, 1.36, 0.18, hm); h.position.y = 1.15; kopfG.add(h);
    const hb = rb(1.36, fr === "zopf" || fr === "dutt" ? 1.0 : 0.8, 0.3, 0.12, hm); hb.position.set(0, fr === "zopf" ? 0.7 : 0.85, -0.55); kopfG.add(hb);
    if (fr === "zopf") { const z = rb(0.45, 1.1, 0.45, 0.2, hm); z.position.set(0, 0.5, -0.85); kopfG.add(z); }
    if (fr === "dutt") { const d = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), hm); d.position.set(0, 1.55, -0.25); kopfG.add(d); }
    if (fr === "strubbel") for (const [dx, dz, rz] of [[-0.35, 0.25, -0.4], [0.3, 0.3, 0.3], [0, -0.2, 0.1], [0.4, -0.3, 0.5]]) { const s = rb(0.5, 0.38, 0.5, 0.15, hm); s.position.set(dx, 1.45, dz); s.rotation.z = rz; kopfG.add(s); } }
  if (o.helm) { const hm2 = plastik(o.helm); const k = new THREE.Mesh(new THREE.SphereGeometry(0.8, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), hm2); k.scale.set(1, 0.85, 1.05); k.position.y = 1.2; kopfG.add(k); const r = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.08, 24), hm2); r.position.set(0, 1.2, 0.08); kopfG.add(r); }
  if (o.muetze) { const mm = plastik(o.muetze); const k = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.68, 0.45, 20), mm); k.position.y = 1.42; kopfG.add(k); const s = rb(0.9, 0.08, 0.5, 0.04, plastik("#111")); s.position.set(0, 1.22, 0.62); kopfG.add(s); const b = rb(0.25, 0.25, 0.05, 0.05, new THREE.MeshStandardMaterial({ color: "#e8c040", metalness: 0.8, roughness: 0.3 })); b.position.set(0, 1.48, 0.72); kopfG.add(b); }
  if (o.propeller) { const farben = Array.isArray(o.propeller) ? o.propeller : ["#e83a3a", "#2a6ae8", "#f2c21a", "#2ab04a"]; const pm = new THREE.Group(); pm.position.y = 1.3; kopfG.add(pm);
    for (let i = 0; i < 4; i++) { const seg = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 10, i * Math.PI / 2, Math.PI / 2, 0, Math.PI / 2), plastik(farben[i % farben.length])); seg.scale.set(1, 0.8, 1.02); pm.add(seg); }
    const schirm = rb(1.05, 0.08, 0.75, 0.03, plastik(farben[1 % farben.length])); schirm.position.set(0, 0.03, 0.9); pm.add(schirm);
    const stiel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.32, 8), plastik("#f2c21a")); stiel.position.y = 0.78; pm.add(stiel);
    const prop = new THREE.Group(); prop.position.y = 0.96; pm.add(prop); for (const sx of [-1, 1]) { const b = rb(0.62, 0.05, 0.16, 0.03, plastik(sx < 0 ? "#e83a3a" : "#2a6ae8")); b.position.x = sx * 0.33; b.rotation.x = sx * 0.25; prop.add(b); }
    prop.add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), plastik("#f2c21a"))); f.userData_propeller = prop; }
  if (o.sonnenbrille) { const sm = new THREE.MeshPhysicalMaterial({ color: "#0a0a0e", roughness: 0.08, clearcoat: 1, metalness: 0.3 }); for (const ex of [-0.3, 0.3]) { const gl = rb(0.42, 0.26, 0.05, 0.06, sm); gl.position.set(ex, 0.72, 0.66); kopfG.add(gl); }
    const st = rb(0.22, 0.05, 0.04, 0.01, sm); st.position.set(0, 0.77, 0.66); kopfG.add(st); for (const sx of [-1, 1]) { const b = rb(0.04, 0.05, 0.6, 0.01, sm); b.position.set(sx * 0.63, 0.75, 0.38); kopfG.add(b); } }
  if (o.kragen) { const c = document.createElement("canvas"); c.width = 256; c.height = 32; const x = c.getContext("2d"); x.fillStyle = o.kragen === true ? "#2ab0a8" : o.kragen; x.fillRect(0, 0, 256, 32); x.fillStyle = "#f0c030"; for (let i = 0; i < 16; i++) { x.beginPath(); x.arc(i * 16 + 8, 16, 5, 0, 7); x.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.repeat.set(2, 1); const k = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.2, 0.35, 32, 1, true), new THREE.MeshStandardMaterial({ map: t, roughness: 0.5, side: THREE.DoubleSide })); k.position.y = 3.86; k.scale.set(1, 1, 0.62); f.userData_kragen = k; }
  if (o.krone) { const gm = new THREE.MeshStandardMaterial({ color: "#f0c030", metalness: 0.85, roughness: 0.25, emissive: "#f0c030", emissiveIntensity: 0.15 }); const kr = new THREE.Group(); kr.position.y = 1.45; kopfG.add(kr);
    kr.add(new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.35, 24), gm)); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const z = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.5, 4), gm); z.position.set(Math.cos(a) * 0.64, 0.4, Math.sin(a) * 0.64); kr.add(z); const st = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.4, 2, 2.2) })); st.position.set(Math.cos(a) * 0.73, 0.05, Math.sin(a) * 0.73); kr.add(st); } }
  if (o.zylinder) { const zm = plastik(o.zylinder === true ? "#1a1a1e" : o.zylinder); const z = new THREE.Group(); z.position.y = 1.3; kopfG.add(z); const k = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 1.3, 24), zm); k.position.y = 0.65; z.add(k);
    const kr = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.08, 28), zm); z.add(kr); const band = new THREE.Mesh(new THREE.CylinderGeometry(0.63, 0.63, 0.2, 24), plastik(o.zylinderBand ?? "#e8b830")); band.position.y = 0.2; z.add(band); }
  if (o.goldkette) { const gm = new THREE.MeshStandardMaterial({ color: "#f0c030", metalness: 0.85, roughness: 0.25 }); const kette = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.07, 8, 28, Math.PI), gm); kette.rotation.z = Math.PI; kette.position.set(0, 3.82, 0.54); kette.scale.set(1, 1.2, 1); f.userData_kette = [kette, new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 16), gm)]; f.userData_kette[1].rotation.x = Math.PI / 2; f.userData_kette[1].position.set(0, 3.05, 0.56); }
  if (o.brille) { const bm = new THREE.MeshStandardMaterial({ color: "#222", roughness: 0.3 }); for (const ex of [-0.31, 0.31]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.03, 6, 16), bm); r.position.set(ex, 0.72, 0.66); kopfG.add(r); } const st = rb(0.24, 0.04, 0.04, 0.01, bm); st.position.set(0, 0.74, 0.66); kopfG.add(st); }
  const hemdM = (o.kapuze || o.stoff) ? stoff(o.hemd) : plastik(o.hemd); if (S) strukturieren(hemdM); mustern(hemdM, o.muster?.hemd);
  const torso = rb(2, 2, 1, 0.12, hemdM); torso.position.y = 2.95; koerper.add(torso); if (f.userData_kragen) { koerper.add(f.userData_kragen); delete f.userData_kragen; } if (f.userData_kette) { f.userData_kette.forEach(k => koerper.add(k)); delete f.userData_kette; }
  if (o.kapuze) { const k = rb(1.6, 0.5, 0.5, 0.2, hemdM); k.position.set(0, 3.85, -0.45); koerper.add(k); const t = rb(0.9, 0.6, 0.06, 0.05, stoff(new THREE.Color(o.hemd).multiplyScalar(0.8))); t.position.set(0, 2.45, 0.52); koerper.add(t); }
  if (o.weste) { const wm = plastik(o.weste); if (S) strukturieren(wm); const w = rb(2.06, 1.8, 1.06, 0.12, wm); w.position.y = 3.0; koerper.add(w); const st = new THREE.MeshStandardMaterial({ color: "#e8e8e0", emissive: "#bfbfb0", emissiveIntensity: 0.6, roughness: 0.3 });
    for (const y of [2.55, 3.25]) { const s = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.16, 1.1), st); s.position.y = y; koerper.add(s); } }
  if (o.abzeichen) { const b = rb(0.35, 0.4, 0.05, 0.05, new THREE.MeshStandardMaterial({ color: "#e8c040", metalness: 0.8, roughness: 0.3 })); b.position.set(-0.5, 3.4, 0.53); koerper.add(b); const fu = rb(0.3, 0.5, 0.2, 0.05, plastik("#222")); fu.position.set(0.55, 3.4, 0.55); koerper.add(fu); const g = rb(2.04, 0.22, 1.04, 0.05, plastik("#1a1a1a")); g.position.y = 2.05; koerper.add(g); }
  if (o.jacke) { const jm = stoff(o.jacke); if (S) strukturieren(jm); const r = rb(2.08, 2.04, 0.55, 0.12, jm); r.position.set(0, 2.95, -0.25); koerper.add(r);
    for (const sx of [-1, 1]) { const v = rb(0.62, 2.04, 0.5, 0.1, jm); v.position.set(sx * 0.73, 2.95, 0.29); koerper.add(v); const kr = rb(0.5, 0.5, 0.12, 0.05, jm); kr.position.set(sx * 0.42, 3.72, 0.55); kr.rotation.z = sx * 0.5; koerper.add(kr); } }
  if (o.brust) { const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d"); x.fillStyle = o.brustFarbe ?? "#ffd23a"; x.font = "900 96px 'Inter Display', Inter, 'Noto Color Emoji', sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(o.brust, 64, 70);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const b = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.75), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.7 })); b.position.set(0, 3.1, o.weste || o.jacke ? 0.56 : 0.51); koerper.add(b); }
  if (o.schal) { const s = rb(2.0, 0.4, 1.1, 0.15, S ? strukturieren(stoff(o.schal)) : stoff(o.schal)); s.position.y = 3.85; koerper.add(s); }
  const glied = (x, y, m, hand) => { const p = new THREE.Group(); p.position.set(x, y, 0); const b = rb(0.96, hand ? 1.5 : 1.6, 0.96, 0.12, m); b.position.y = hand ? -0.7 : -0.75; p.add(b);
    if (hand) { const hd = rb(0.96, 0.5, 0.96, 0.12, hautM); hd.position.y = -1.7; p.add(hd); } else { const s = rb(1.0, 0.42, 1.12, 0.12, plastik(o.schuhe ?? "#2a2a2e")); s.position.set(0, -1.75, 0.06); p.add(s); } return p; };
  const armM = o.weste ? (S ? strukturieren(plastik(o.aermel ?? o.hemd)) : plastik(o.aermel ?? o.hemd)) : hemdM;
  const armL = glied(-1.5, 3.85, armM, true), armR = glied(1.5, 3.85, armM, true); koerper.add(armL, armR);
  const hoseM = plastik(o.hose); if (S) strukturieren(hoseM); mustern(hoseM, o.muster?.hose); const beinL = glied(-0.5, 1.95, hoseM), beinR = glied(0.5, 1.95, hoseM); f.add(beinL, beinR);
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false })); blob.position.y = 0.03; f.add(blob);
  f.userData = { koerper, kopfG, gm, armL, armR, beinL, beinR, skala: sk, haut, rund, propeller: f.userData_propeller ?? null }; delete f.userData_propeller;
  if (o.baby) { kopfG.scale.setScalar(1.55); kopfG.position.y = 3.85; }   // Baby: großer Kopf (Vergleich 24.11.)
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
  const tex = gesicht(ges, u.haut, u.rund); if (u.gm.map !== tex) { u.gm.map = tex; u.gm.needsUpdate = true; } };
export const handPos = (f, rechts = true, y = -1.9, z = 0.2) => { f.updateMatrixWorld(true); const p = new THREE.Vector3(0, y, z); (rechts ? f.userData.armR : f.userData.armL).localToWorld(p); return p; };
export const kopfPos = (f, y = 0.62) => { f.updateMatrixWorld(true); const p = new THREE.Vector3(0, y, 0); f.userData.kopfG.localToWorld(p); return p; };
