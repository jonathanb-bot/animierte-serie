// Requisiten und Sets: Polizei, Notlampen, Gasse, Omas Laden + Lager, Schlafzimmer, Menge, Platz-Deko, Konfetti.
import { THREE, RoundedBoxGeometry, mergeGeometries, scene, kegel, gebaeude, LOTS, PLATZ } from "./welt.js";
import { rnd } from "./wesen.js";
import * as O from "./objekte.js";
const mat = (c, r = 0.7, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
const plastik = c => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.4, clearcoat: 0.5 });
const leucht = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b) });
const rb = (w, h, d, r, m) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, r), m);
const bx = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const textTex = (txt, w, h, bg, fg, font) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = fg; x.font = font; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(txt, w / 2, h / 2 + 4); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
// Gebäude-Instanzen in einem Bereich ausblenden (für eigene Sets)
export const freiraeumen = (x0, x1, z0, z1) => { const m = new THREE.Matrix4(); LOTS.forEach((l, k) => { if (l.x + l.w / 2 > x0 && l.x - l.w / 2 < x1 && l.z + l.d / 2 > z0 && l.z - l.d / 2 < z1) { m.makeScale(0, 0, 0); gebaeude.setMatrixAt(k, m); } }); gebaeude.instanceMatrix.needsUpdate = true; };

// ---------- Polizeiautos ----------
export const POLIZEI = [];
const polizeiAuto = () => { const g = new THREE.Group();
  const k = rb(2.2, 1.0, 4.8, 0.25, plastik("#f2f2f4")); k.position.y = 0.85; g.add(k); const tuer = bx(2.24, 0.45, 2.2, plastik("#1a3a8a")); tuer.position.y = 0.8; g.add(tuer);
  const kab = rb(1.95, 0.8, 2.4, 0.25, plastik("#1a1a22")); kab.position.set(0, 1.7, -0.3); g.add(kab);
  for (const [x, z] of [[-1.0, 1.5], [1.0, 1.5], [-1.0, -1.5], [1.0, -1.5]]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.35, 16), mat("#111", 0.8)); r.rotation.z = Math.PI / 2; r.position.set(x, 0.45, z); g.add(r); }
  const rot = bx(0.8, 0.22, 0.4, leucht(5, 0.3, 0.2)), blau = bx(0.8, 0.22, 0.4, leucht(0.3, 0.8, 6)); rot.position.set(-0.45, 2.22, -0.3); blau.position.set(0.45, 2.22, -0.3); g.add(rot, blau);
  for (const sx of [-0.7, 0.7]) { const s = bx(0.5, 0.25, 0.1, leucht(6, 5.6, 4.6)); s.position.set(sx, 0.95, 2.41); g.add(s); }
  const kg = kegel("#fff2d8", 0.22, 30, 9); g.userData = { rot, blau, kegel: kg }; g.scale.setScalar(1.7); scene.add(g); return g; };
export const blauLichtR = new THREE.PointLight("#ff2a2a", 0, 30, 2), blauLichtB = new THREE.PointLight("#2a5aff", 0, 30, 2); scene.add(blauLichtR, blauLichtB);
for (let i = 0; i < 10; i++) POLIZEI.push(polizeiAuto());
export const polizeiSetzen = (t, an = true, sichtbar = true, radius = 27, nah = null) => { let best = null, bd = 1e9; POLIZEI.forEach((g, i) => { const a = i / POLIZEI.length * Math.PI * 2 + 0.2; g.visible = sichtbar; g.userData.kegel.visible = sichtbar && an;
  g.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius); g.rotation.y = Math.atan2(Math.cos(a), Math.sin(a));
  const b = Math.floor(t * 6 + i) % 2; g.userData.rot.material = b ? leuchtR : dunkelR; g.userData.blau.material = b ? dunkelB : leuchtB; if (nah && sichtbar) { const d = g.position.distanceTo(nah); if (d < bd) { bd = d; best = [g, b]; } }
  g.updateMatrixWorld(true); const v = g.localToWorld(new THREE.Vector3(0, 0.95, 2.45)); g.userData.kegel.userData.richte(v, v.clone().add(new THREE.Vector3(Math.cos(a) * 24, -1.2, Math.sin(a) * 24))); });
  blauLichtR.intensity = blauLichtB.intensity = 0; if (best && an) { const [g, b] = best; g.updateMatrixWorld(true); const p = g.localToWorld(new THREE.Vector3(0, 2.8, -0.3)); blauLichtR.position.copy(p); blauLichtB.position.copy(p); blauLichtR.intensity = b ? 80 : 0; blauLichtB.intensity = b ? 0 : 80; } };
const leuchtR = leucht(6, 0.3, 0.2), dunkelR = leucht(0.25, 0.02, 0.02), leuchtB = leucht(0.3, 0.8, 7), dunkelB = leucht(0.02, 0.03, 0.2);

// ---------- Notlampen mit Akku-Anzeige ----------
export const NOTLAMPEN = [];
const akkuC = document.createElement("canvas"); akkuC.width = 256; akkuC.height = 128; const akkuX = akkuC.getContext("2d"); const akkuTex = new THREE.CanvasTexture(akkuC); akkuTex.colorSpace = THREE.SRGBColorSpace;
export const akkuZeichnen = (text, anteil) => { akkuX.fillStyle = "#050806"; akkuX.fillRect(0, 0, 256, 128); akkuX.strokeStyle = "#3a4a3a"; akkuX.lineWidth = 6; akkuX.strokeRect(14, 70, 200, 42); akkuX.fillRect(214, 82, 12, 18);
  akkuX.fillStyle = anteil > 0.3 ? "#5aff6a" : "#ff3a2a"; akkuX.fillRect(20, 76, 188 * anteil, 30); akkuX.font = "700 54px DejaVu Sans Mono"; akkuX.textAlign = "center"; akkuX.fillStyle = anteil > 0.3 ? "#9aff9a" : "#ff5a4a"; akkuX.fillText(text, 128, 44); akkuTex.needsUpdate = true; };
const akkuMat = new THREE.MeshBasicMaterial({ map: akkuTex, color: new THREE.Color(1.6, 1.6, 1.6) });
for (let i = 0; i < 8; i++) { const g = new THREE.Group(); const m = mat("#2a2a2e", 0.5, 0.5);
  for (let b = 0; b < 3; b++) { const bein = bx(0.08, 3.4, 0.08, m); const a = b / 3 * Math.PI * 2 + Math.PI / 6; bein.position.set(Math.cos(a) * 0.5, 1.6, Math.sin(a) * 0.5); bein.rotation.set(Math.sin(a) * 0.18, 0, -Math.cos(a) * 0.18); g.add(bein); }
  const kopf = rb(1.2, 0.8, 0.5, 0.08, mat("#f0c020", 0.5)); kopf.position.set(0, 3.5, 0); kopf.rotation.x = 0.35; g.add(kopf);
  const glas = bx(1.0, 0.6, 0.05, leucht(6, 5.4, 4.2)); glas.position.set(0, 3.48, 0.27); glas.rotation.x = 0.35; g.add(glas);
  const akku = rb(0.9, 0.6, 0.5, 0.06, mat("#3a3a40", 0.6)); akku.position.set(0, 0.3, 0); g.add(akku); const anz = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.31), akkuMat); anz.position.set(0, 0.36, 0.26); g.add(anz);
  const kg = kegel("#fff0d0", 0.16, 18, 8); g.userData = { glas, kegel: kg, an: leucht(6, 5.4, 4.2), aus: leucht(0.15, 0.13, 0.1) }; scene.add(g); NOTLAMPEN.push(g); }
export const notlampenSetzen = (staerke, sichtbar = true, radius = 21) => { NOTLAMPEN.forEach((g, i) => { const a = (i + 0.5) / NOTLAMPEN.length * Math.PI * 2 + 0.2; g.visible = sichtbar; g.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius); g.rotation.y = Math.atan2(Math.cos(a), Math.sin(a));
  const s = typeof staerke === "function" ? staerke(i) : staerke; g.userData.glas.material = s > 0.5 ? g.userData.an : g.userData.aus; g.userData.kegel.visible = sichtbar && s > 0.5;
  const v = new THREE.Vector3(0, 3.5, 0.3).applyEuler(g.rotation).add(g.position); g.userData.kegel.userData.richte(v, v.clone().add(new THREE.Vector3(Math.cos(a) * 16, -3.3, Math.sin(a) * 16))); }); };

// ---------- Platz: Denkmal, Bäume, Bänke ----------
{ const st = mat("#8a8680", 0.8); const sockel = rb(6, 1.2, 6, 0.1, st); sockel.position.y = 0.6; scene.add(sockel); const s2 = rb(3.6, 1.6, 3.6, 0.1, st); s2.position.y = 2.0; scene.add(s2);
  const obel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 1.2, 14, 4), mat("#a8a29a", 0.7)); obel.rotation.y = Math.PI / 4; obel.position.y = 9.8; scene.add(obel);
  const baumM = plastik("#2f5a2a"), stammM = mat("#4a3020");
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; const r = 52; const g = new THREE.Group(); const s = rb(0.8, 4, 0.8, 0.12, stammM); s.position.y = 2; g.add(s);
    for (const [dx, dy, dz, w] of [[0, 5.2, 0, 3.6], [0.8, 6.4, 0.4, 2.6], [-0.8, 6.2, -0.4, 2.4]]) { const b = rb(w, w * 0.85, w, 0.45, baumM); b.position.set(dx, dy, dz); g.add(b); }
    g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); scene.add(g); } }

// ---------- Gasse (eigenes Set) ----------
export const GASSE = { x: -84, z: 96 };   // Eingang der Gasse an der Straße x = -72
freiraeumen(-120, -78, 72, 120);
export const gasse = new THREE.Group(); scene.add(gasse); gasse.position.set(GASSE.x, 0, GASSE.z);
{ const ziegel = (() => { const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d"); x.fillStyle = "#3a2622"; x.fillRect(0, 0, 256, 256);
    for (let r = 0; r < 16; r++) for (let k = 0; k < 8; k++) { const v = 0.75 + Math.random() * 0.35; x.fillStyle = `rgb(${Math.floor(120 * v)},${Math.floor(62 * v)},${Math.floor(50 * v)})`; x.fillRect(k * 32 + (r % 2) * 16 + 1, r * 16 + 1, 30, 14); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();
  const wand = (len, h) => { const t = ziegel.clone(); t.needsUpdate = true; t.repeat.set(len / 4, h / 4); return new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 }); };
  for (const sz of [-1, 1]) { const b = bx(36, 22, 14, wand(36, 22)); b.position.set(-18 + 6, 11, sz * 10); gasse.add(b);
    for (let i = 0; i < 7; i++) for (let j = 0; j < 4; j++) { const f = bx(1.4, 1.8, 0.1, mat(Math.random() < 0.3 ? "#2a2010" : "#0c0e14", 0.2)); f.position.set(-30 + i * 5, 5 + j * 4.5, sz * 3.0 - sz * 0.02); gasse.add(f); }
    const treppe = new THREE.Group(); for (let j = 0; j < 3; j++) { const p = bx(4, 0.12, 1.4, mat("#1a1a1e", 0.4, 0.7)); p.position.set(-14, 6 + j * 4.5, sz * 3.0 - sz * 0.7); treppe.add(p); const gel = bx(4, 1.0, 0.05, mat("#1a1a1e", 0.4, 0.7)); gel.position.set(-14, 6.5 + j * 4.5, sz * 3.0 - sz * 1.4); treppe.add(gel); } gasse.add(treppe); }
  const tonne = rb(3.4, 2.0, 1.8, 0.1, mat("#2a5a3a", 0.6, 0.3)); tonne.position.set(-8, 1.0, -2.0); gasse.add(tonne); const deckel = bx(3.5, 0.15, 1.9, mat("#1e3a28", 0.5)); deckel.position.set(-8, 2.05, -2.0); gasse.add(deckel);
  for (let i = 0; i < 5; i++) { const s = rb(0.9, 0.7, 0.9, 0.3, mat("#151518", 0.4)); s.position.set(-5 + i * 0.7, 0.35, 2.0 - (i % 2) * 0.6); gasse.add(s); }
  GASSE.lampe = bx(0.9, 0.3, 0.5, leucht(5, 3.6, 2)); GASSE.lampe.position.set(-20, 6.5, 2.7); gasse.add(GASSE.lampe); GASSE.lampeAn = GASSE.lampe.material; GASSE.lampeAus = leucht(0.08, 0.06, 0.04);
  GASSE.licht = new THREE.PointLight("#ffc890", 40, 16, 2); GASSE.licht.position.set(-20, 6, 2.0); gasse.add(GASSE.licht);
  const tuer = bx(1.8, 3, 0.15, mat("#3a3020", 0.6)); tuer.position.set(-20, 1.5, 2.95); gasse.add(tuer); }
// Mülleimer (verschwindet, wenn ein Schatten ihn berührt)
export const muell = new THREE.Group(); { const k = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.45, 1.4, 16), mat("#5a6068", 0.4, 0.6)); k.position.y = 0.7; muell.add(k); const d = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.12, 16), mat("#3a3e44", 0.4, 0.6)); d.position.y = 1.45; muell.add(d); } scene.add(muell);

// ---------- Omas Laternenladen + Lager ----------
export const LADEN = { x: 79, z: -30 };
freiraeumen(76, 110, -54, -6);
export const laden = new THREE.Group(); scene.add(laden); laden.position.set(LADEN.x, 0, LADEN.z); laden.rotation.y = -Math.PI / 2;   // schaut zum Platz (-x)
{ const putz = mat("#8a5a3a", 0.85); const k = bx(22, 12, 24, putz); k.position.set(0, 6, -12.5); laden.add(k);
  const dach = bx(23, 1, 25, mat("#3a2a24", 0.7)); dach.position.set(0, 12.5, -12.5); laden.add(dach);
  const schaufenster = bx(8, 4, 0.2, leucht(2.4, 1.3, 0.5)); schaufenster.position.set(-5, 2.8, -0.4); laden.add(schaufenster);
  for (let i = 0; i < 6; i++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.9, 10), leucht(3, 1.5, 0.45)); l.position.set(-8 + i * 1.2, 4.0 + Math.sin(i) * 0.3, -0.2); laden.add(l); }
  const tuer = bx(2.4, 3.6, 0.2, mat("#4a2a1a", 0.5)); tuer.position.set(4, 1.8, -0.4); laden.add(tuer);
  LADEN.schild = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.8), new THREE.MeshBasicMaterial({ map: textTex("LATERNEN", 1024, 184, "#2a1408", "#ffcf6a", "700 120px DejaVu Serif"), color: new THREE.Color(1.8, 1.8, 1.8) })); LADEN.schild.position.set(0, 7.2, -0.35); laden.add(LADEN.schild);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { const f = bx(2, 2.2, 0.1, leucht(1.6, 0.95, 0.4)); f.position.set(-7.5 + i * 5, 9.3, -0.4); if (j === 0) laden.add(f); } }
// Lager (Innenraum, eigenes Set weit weg)
export const lager = new THREE.Group(); scene.add(lager); lager.position.set(1400, 0, -600);
{ const boden = bx(30, 0.2, 40, mat("#3a3530", 0.9)); boden.position.y = -0.06; lager.add(boden);
  for (const [w, d, x, z] of [[30, 0.4, 0, -20], [0.4, 40, -15, 0], [0.4, 40, 15, 0]]) { const wd = bx(w, 12, d, mat("#4a4038", 0.9)); wd.position.set(x, 6, z); lager.add(wd); }
  const decke = bx(30, 0.3, 40, mat("#2a2420", 0.9)); decke.position.y = 12; lager.add(decke);
  const kartonM = [mat("#b8864a", 0.85), mat("#a8763a", 0.85), mat("#c8965a", 0.85)];
  for (let r = 0; r < 4; r++) { const x = -10 + r * 6.5; for (let s = 0; s < 2; s++) { const regal = bx(1.6, 0.12, 30, mat("#5a5a60", 0.5, 0.6)); for (let e = 0; e < 4; e++) { const b = regal.clone(); b.position.set(x + s * 1.8, 0.5 + e * 2.6, -3); lager.add(b); }
      for (let e = 0; e < 4; e++) for (let k = 0; k < 12; k++) { const kt = rb(1.4, 1.6 + (k % 3) * 0.2, 2.2, 0.05, kartonM[(k + e + r) % 3]); kt.position.set(x + s * 1.8, 1.4 + e * 2.6, -16 + k * 2.5); lager.add(kt); } } }
  for (let i = 0; i < 30; i++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.9, 10), mat("#f0e0c0", 0.8)); l.position.set(-12 + (i % 6) * 4.8, 10.5, -14 + Math.floor(i / 6) * 6); lager.add(l); } }

// ---------- Schlafzimmer (weit weg, Fenster mit Blick auf die Stadt) ----------
export const zimmer = new THREE.Group(); scene.add(zimmer); zimmer.position.set(700, 24, 700); zimmer.rotation.y = Math.PI / 4;   // Fenster (-z lokal) schaut zur Stadt
export const ZIMMER = {};
{ const tapete = mat("#3a4a7a", 0.9), holz = mat("#6a4a32", 0.7);
  const bo = bx(12, 0.2, 12, holz); bo.position.y = -0.1; zimmer.add(bo);
  const teppich = bx(5, 0.05, 4, mat("#8a3a3a", 0.95)); teppich.position.set(0.5, 0.02, 1); zimmer.add(teppich);
  for (const [w, d, x, z] of [[12, 0.3, 0, 6], [0.3, 12, -6, 0], [0.3, 12, 6, 0]]) { const wd = bx(w, 8, d, tapete); wd.position.set(x, 4, z); zimmer.add(wd); }
  // Wand mit Fenster (lokal z = -6)
  for (const [w, x] of [[3.5, -4.25], [3.5, 4.25]]) { const wd = bx(w, 8, 0.3, tapete); wd.position.set(x, 4, -6); zimmer.add(wd); }
  const unten = bx(5, 2.5, 0.3, tapete); unten.position.set(0, 1.25, -6); zimmer.add(unten); const oben = bx(5, 1.5, 0.3, tapete); oben.position.set(0, 7.25, -6); zimmer.add(oben);
  for (const [w, h, x, y] of [[5, 0.2, 0, 2.5], [5, 0.2, 0, 6.5], [0.2, 4, -2.5, 4.5], [0.2, 4, 2.5, 4.5], [0.15, 4, 0, 4.5]]) { const r = bx(w, h, 0.4, mat("#e8e0d0", 0.5)); r.position.set(x, y, -6); zimmer.add(r); }
  const decke = bx(12, 0.2, 12, mat("#2a3050", 0.9)); decke.position.y = 8.1; zimmer.add(decke);
  // Bett
  const bett = new THREE.Group(); const gest = rb(4.2, 1.0, 7.4, 0.15, holz); gest.position.y = 0.9; bett.add(gest);
  for (const [x, z] of [[-1.9, -3.5], [1.9, -3.5], [-1.9, 3.5], [1.9, 3.5]]) { const f = bx(0.35, 0.6, 0.35, holz); f.position.set(x, 0.3, z); bett.add(f); }
  const kopfteil = rb(4.4, 3.0, 0.4, 0.15, holz); kopfteil.position.set(0, 2.0, 3.7); bett.add(kopfteil);
  const matratze = rb(3.9, 0.6, 7.0, 0.25, mat("#e8e8f0", 0.9)); matratze.position.y = 1.7; bett.add(matratze);
  ZIMMER.decke = rb(4.1, 0.5, 4.8, 0.25, mat("#4a7ad8", 0.85)); ZIMMER.decke.position.set(0, 2.1, -0.9); bett.add(ZIMMER.decke);
  const kissen = rb(2.6, 0.6, 1.3, 0.3, mat("#f4f4fa", 0.9)); kissen.position.set(0, 2.2, 2.8); bett.add(kissen);
  bett.position.set(-2.2, 0, 1.5); zimmer.add(bett); ZIMMER.bett = bett;
  // Nachttisch + Lampe + Wecker
  const nt = rb(1.8, 2.0, 1.6, 0.1, holz); nt.position.set(1.2, 1.0, 4.4); zimmer.add(nt);
  const fuss = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.9, 12), mat("#c8b090", 0.4)); fuss.position.set(1.4, 2.45, 4.5); zimmer.add(fuss);
  ZIMMER.schirmAn = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 2.2, 1.1) }); ZIMMER.schirmAus = mat("#c8b890", 0.8);
  ZIMMER.schirm = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.8, 0.9, 20, 1, true), ZIMMER.schirmAn); ZIMMER.schirm.position.set(1.4, 3.3, 4.5); zimmer.add(ZIMMER.schirm);
  ZIMMER.licht = new THREE.PointLight("#ffc080", 30, 14, 1.8); ZIMMER.licht.position.set(1.4, 3.4, 4.3); zimmer.add(ZIMMER.licht);
  const wc = document.createElement("canvas"); wc.width = 256; wc.height = 128; ZIMMER.weckerX = wc.getContext("2d"); ZIMMER.weckerTex = new THREE.CanvasTexture(wc); ZIMMER.weckerTex.colorSpace = THREE.SRGBColorSpace;
  const wk = rb(0.9, 0.5, 0.4, 0.08, mat("#1a1a1e", 0.4)); wk.position.set(0.6, 2.25, 4.1); wk.rotation.y = -0.4; zimmer.add(wk);
  ZIMMER.anzeige = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 0.38), new THREE.MeshBasicMaterial({ map: ZIMMER.weckerTex, color: new THREE.Color(1.8, 1.8, 1.8) })); ZIMMER.anzeige.position.set(0.6 + 0.084, 2.25, 4.1 - 0.19); ZIMMER.anzeige.rotation.y = -0.4 + Math.PI; zimmer.add(ZIMMER.anzeige);
  // Poster, Regal, Spielzeug
  const poster = bx(2.2, 3, 0.05, mat("#d8a030", 0.8)); poster.position.set(-5.8, 5, -1.5); poster.rotation.y = Math.PI / 2; zimmer.add(poster);
  const regal = bx(0.8, 0.1, 3, holz); regal.position.set(5.6, 4.5, 0); zimmer.add(regal);
  for (let i = 0; i < 5; i++) { const b = rb(0.5, 0.7 + (i % 2) * 0.2, 0.4, 0.05, mat(["#c83a3a", "#3a8ac8", "#e8c040", "#4ab84a", "#8a4ac8"][i], 0.6)); b.position.set(5.6, 5.0, -1.2 + i * 0.6); zimmer.add(b); }
  ZIMMER.mond = new THREE.PointLight("#8aa8ff", 8, 20, 1.5); ZIMMER.mond.position.set(0, 5, -4); zimmer.add(ZIMMER.mond); }
// Lichterketten unter der Decke (Vergleich 24.11.), standardmäßig aus: ZIMMER.lichterkette.visible = true
{ const g = new THREE.Group(); g.visible = false; zimmer.add(g); ZIMMER.lichterkette = g;
  for (const [x, z, ry, l] of [[0, 5.75, 0, 11], [-5.75, 0, Math.PI / 2, 11], [5.75, 0, Math.PI / 2, 11]]) { const k = O.lichterkette({ laenge: l, n: 26, durchhang: 0.35 }); k.position.set(x, 7.5, z); k.rotation.y = ry; g.add(k); } }
export const weckerZeichnen = (txt, an = true) => { const x = ZIMMER.weckerX; x.fillStyle = "#050505"; x.fillRect(0, 0, 256, 128); if (an) { x.fillStyle = "#ff3a2a"; x.font = "700 92px DejaVu Sans Mono"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(txt, 128, 68); } ZIMMER.weckerTex.needsUpdate = true; };

// ---------- Menge auf dem Platz (Instanzen, billig) ----------
export const MENGE = [];
{ for (let i = 0; i < 150; i++) { const a = rnd() * Math.PI * 2, r = 3 + Math.sqrt(rnd()) * 17; MENGE.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, ry: rnd() * Math.PI * 2, ph: rnd() * 6, s: 0.85 + rnd() * 0.25 }); } }
const hautT = ["#f2cfa8", "#e0a878", "#c88a5a", "#9a6038", "#6a4028", "#f2cf52"], hemdT = ["#c83a3a", "#3a6ac8", "#e8c040", "#4a9a5a", "#8a4ac8", "#e87a2a", "#f0f0f0", "#2a2a30", "#3aa0a0", "#c85a8a"];
const gesTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d"); x.fillStyle = "#1a1410"; for (const ex of [44, 84]) { x.beginPath(); x.ellipse(ex, 56, 7, 10, 0, 0, 7); x.fill(); } x.lineWidth = 5; x.strokeStyle = "#1a1410"; x.beginPath(); x.arc(64, 74, 18, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
const geoK = mergeGeometries([new RoundedBoxGeometry(2, 2, 1, 2, 0.12).translate(0, 2.95, 0), new RoundedBoxGeometry(0.96, 1.5, 0.96, 2, 0.12).translate(-1.5, 3.15, 0), new RoundedBoxGeometry(0.96, 1.5, 0.96, 2, 0.12).translate(1.5, 3.15, 0)]);
const geoKoben = mergeGeometries([new RoundedBoxGeometry(2, 2, 1, 2, 0.12).translate(0, 2.95, 0), new RoundedBoxGeometry(0.96, 1.5, 0.96, 2, 0.12).translate(-1.6, 4.6, 0), new RoundedBoxGeometry(0.96, 1.5, 0.96, 2, 0.12).translate(1.6, 4.6, 0)]);
const geoH = mergeGeometries([new RoundedBoxGeometry(1.25, 1.2, 1.25, 2, 0.3).translate(0, 4.62, 0), new RoundedBoxGeometry(0.96, 0.5, 0.96, 2, 0.12).translate(-1.5, 2.15, 0), new RoundedBoxGeometry(0.96, 0.5, 0.96, 2, 0.12).translate(1.5, 2.15, 0)]);
const geoHoben = mergeGeometries([new RoundedBoxGeometry(1.25, 1.2, 1.25, 2, 0.3).translate(0, 4.62, 0), new RoundedBoxGeometry(0.96, 0.5, 0.96, 2, 0.12).translate(-1.6, 5.6, 0), new RoundedBoxGeometry(0.96, 0.5, 0.96, 2, 0.12).translate(1.6, 5.6, 0)]);
const geoB = mergeGeometries([new RoundedBoxGeometry(0.96, 1.95, 0.96, 2, 0.12).translate(-0.5, 0.98, 0), new RoundedBoxGeometry(0.96, 1.95, 0.96, 2, 0.12).translate(0.5, 0.98, 0)]);
const geoHaar = new RoundedBoxGeometry(1.36, 0.5, 1.36, 2, 0.18).translate(0, 5.3, 0);
const mk = (geo, m) => { const im = new THREE.InstancedMesh(geo, m, MENGE.length); im.frustumCulled = false; scene.add(im); return im; };
export const mengeW = { k: mk(geoK, plastik("#ffffff")), ko: mk(geoKoben, plastik("#ffffff")), h: mk(geoH, plastik("#ffffff")), ho: mk(geoHoben, plastik("#ffffff")), b: mk(geoB, plastik("#ffffff")), haar: mk(geoHaar, plastik("#ffffff")),
  g: mk(new THREE.PlaneGeometry(0.95, 0.95).translate(0, 4.62, 0.648), new THREE.MeshBasicMaterial({ map: gesTex, transparent: true, color: new THREE.Color(0.5, 0.5, 0.5) })) };
MENGE.forEach((p, i) => { const c = new THREE.Color(hemdT[i % hemdT.length]); mengeW.k.setColorAt(i, c); mengeW.ko.setColorAt(i, c); const h = new THREE.Color(hautT[Math.floor(rnd() * hautT.length)]); mengeW.h.setColorAt(i, h); mengeW.ho.setColorAt(i, h);
  mengeW.b.setColorAt(i, new THREE.Color(["#2a3a5a", "#3a3a3a", "#5a4a3a", "#1a1a22"][i % 4])); mengeW.haar.setColorAt(i, new THREE.Color(["#2a1a10", "#5a3a1a", "#1a1a1a", "#c8a050", "#8a8a8a"][Math.floor(rnd() * 5)])); });
export const mengeImWeg = (p, kam, ziel, frei = [], dx = 0, dz = 0) => { if (!kam) return false; const c = new THREE.Vector3(p.x + dx, 2.3, p.z + dz); for (const f of frei) if (Math.hypot(f.x - c.x, f.z - c.z) < 2.6) return true; if (Math.hypot(ziel.x - c.x, ziel.z - c.z) < 2.6) return true; if (c.distanceTo(kam) < 3.6) return true; const d = ziel.clone().sub(kam); const L = d.length(); d.normalize(); const v = c.clone().sub(kam); const s = v.dot(d); return s > 0 && s < L - 1.5 && v.sub(d.multiplyScalar(s)).length() < 1.9; };
export const mengeSetzen = (t, o = {}) => { const { sichtbar = true, armeHoch = () => 0, huepf = () => 0, licht = 0.5, nurBis = MENGE.length, dx = 0, dz = 0, kam = null, ziel = null, frei = [], versteckt = null } = o;
  const imWeg = (p) => versteckt ? versteckt.has(MENGE.indexOf(p)) : mengeImWeg(p, kam, ziel, frei, dx, dz); const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), nul = new THREE.Matrix4().makeScale(0, 0, 0);
  MENGE.forEach((p, i) => { p.weg = imWeg(p); if (!sichtbar || i >= nurBis || p.weg) { for (const k in mengeW) mengeW[k].setMatrixAt(i, nul); return; }
    const hoch = armeHoch(p, i) > 0.5, y = huepf(p, i); q.setFromEuler(new THREE.Euler(0, p.ry + Math.sin(t * 0.7 + p.ph) * 0.15, 0)); v.set(p.x + dx, y, p.z + dz); s.setScalar(0.9 * p.s); m.compose(v, q, s);
    mengeW.b.setMatrixAt(i, m); mengeW.haar.setMatrixAt(i, m); mengeW.g.setMatrixAt(i, m);
    mengeW.k.setMatrixAt(i, hoch ? nul : m); mengeW.h.setMatrixAt(i, hoch ? nul : m); mengeW.ko.setMatrixAt(i, hoch ? m : nul); mengeW.ho.setMatrixAt(i, hoch ? m : nul); });
  for (const k in mengeW) { mengeW[k].instanceMatrix.needsUpdate = true; if (mengeW[k].instanceColor) mengeW[k].instanceColor.needsUpdate = true; }
  mengeW.g.material.color.setScalar(licht); };
export const mengeHand = (p, hoch, dx = 0, dz = 0) => { const q = new THREE.Euler(0, p.ry, 0); const v = new THREE.Vector3(hoch ? 0 : 1.5, hoch ? 6.6 : 3.5, hoch ? 0 : 1.0).multiplyScalar(0.9 * p.s).applyEuler(q); return new THREE.Vector3(p.x + dx + v.x, v.y, p.z + dz + v.z); };

// ---------- Konfetti ----------
const KMAX = 700; export const konfettiW = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.25, 0.4), new THREE.MeshBasicMaterial({ color: "#ffffff", side: THREE.DoubleSide }), KMAX); konfettiW.frustumCulled = false; scene.add(konfettiW);
const KONF = Array.from({ length: KMAX }, () => ({ x: (rnd() - 0.5) * 50, z: (rnd() - 0.5) * 50, y0: 12 + rnd() * 14, v: 1.2 + rnd() * 1.4, ph: rnd() * 6 }));
KONF.forEach((k, i) => konfettiW.setColorAt(i, new THREE.Color(["#ff4a4a", "#4aa0ff", "#ffd04a", "#5ae06a", "#ff7ad0", "#ffffff"][i % 6])));
export const konfettiSetzen = (t, an) => { const m = new THREE.Matrix4(), nul = new THREE.Matrix4().makeScale(0, 0, 0);
  KONF.forEach((k, i) => { if (!an) { konfettiW.setMatrixAt(i, nul); return; } const y = ((k.y0 - t * k.v) % 26 + 26) % 26; m.makeRotationFromEuler(new THREE.Euler(t * 3 + k.ph, t * 2 + k.ph, t * 1.3)); m.setPosition(k.x + Math.sin(t + k.ph) * 1.2, y, k.z + Math.cos(t * 0.8 + k.ph)); konfettiW.setMatrixAt(i, m); });
  konfettiW.instanceMatrix.needsUpdate = true; };

// Taschenlampe, Megafon, Kisten
export const taschenlampe = new THREE.Group(); { const k = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.8, 12), mat("#2a2a30", 0.4, 0.6)); k.rotation.x = Math.PI / 2; taschenlampe.add(k); const l = new THREE.Mesh(new THREE.CircleGeometry(0.17, 16), leucht(6, 5.6, 4.8)); l.position.z = 0.41; taschenlampe.add(l); } scene.add(taschenlampe);
export const lampenKegel = kegel("#fff4dc", 0.3, 30, 7);
export const megafon = new THREE.Group(); { const k = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.18, 1.2, 16, 1, true), plastik("#f0f0f0")); k.rotation.x = Math.PI / 2; megafon.add(k); const g = rb(0.3, 0.6, 0.3, 0.08, plastik("#c83a3a")); g.position.set(0, -0.35, -0.3); megafon.add(g); } scene.add(megafon);
export const kisten = new THREE.Group(); { const km = [mat("#b8864a", 0.85), mat("#a8763a", 0.85), mat("#c8965a", 0.85)]; for (let i = 0; i < 3; i++) { const b = rb(1.6, 0.9, 1.2, 0.05, km[i]); b.position.set((i % 2) * 0.15, i * 0.92, 0); b.rotation.y = (i - 1) * 0.12; kisten.add(b); } } scene.add(kisten);
export { textTex };
