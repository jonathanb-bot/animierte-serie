// Fotostudio der Bibliothek: lichtet jedes Element einzeln ab, im echten Serien-Look (gleiches Licht, Bloom, Farben).
// Aufruf über katalog.html; node block/katalog_bilder.cjs [name,…] schreibt block/katalog/<name>.jpg + uebersicht.jpg.
// Neues Element: in objekte.js bauen (kommt automatisch hierher) oder unten in KULISSEN/FIGUREN eintragen.
import * as Wt from "./welt.js";
import * as Fg from "./figuren.js";
import * as Ws from "./wesen.js";
import * as Rq from "./requisiten.js";
import * as Al from "./alltag.js";
import * as O from "./objekte.js";
const { THREE, cam, composer, U, scene } = Wt;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
await document.fonts.load('900 78px "Inter Display"');
document.getElementById("wrap").prepend(Wt.renderer.domElement);

// ---------- Studio (weit weg, neutraler Rundhorizont) ----------
const STUDIO = V(0, 0, 1500);
const studio = new THREE.Group(); studio.position.copy(STUDIO); scene.add(studio);
{ const hint = new THREE.Mesh(new THREE.CylinderGeometry(60, 60, 80, 64, 1, true), new THREE.MeshStandardMaterial({ color: "#7a8294", roughness: 0.95, side: THREE.BackSide }));
  hint.position.set(0, 40, 0); studio.add(hint);
  const boden = new THREE.Mesh(new THREE.CircleGeometry(60, 48).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#8a92a2", roughness: 0.9 })); boden.position.y = 0.02; studio.add(boden); }
const studioLicht = new THREE.DirectionalLight("#ffffff", 0); studioLicht.position.set(STUDIO.x + 20, 40, STUDIO.z + 30); studioLicht.target.position.copy(STUDIO); scene.add(studioLicht, studioLicht.target);
const halter = new THREE.Group(); halter.position.copy(STUDIO); scene.add(halter);

const licht = (staerke = 1.4, farbe = "#ffe8d0", ziel = STUDIO) => { const d = ziel.clone().sub(cam.position).normalize(), re = new THREE.Vector3().crossVectors(d, V(0, 1, 0)).normalize();
  Wt.key.position.copy(cam.position).addScaledVector(re, -6).add(V(0, 8, 0)); Wt.key.target.position.copy(ziel); Wt.key.intensity = staerke; Wt.key.color.set(farbe);
  Wt.rim.position.copy(ziel).addScaledVector(d, 12).addScaledVector(re, 4).add(V(0, 6, 0)); Wt.rim.target.position.copy(ziel); Wt.rim.intensity = 0.9; Wt.rim.color.set("#a8c4ff"); };
const blick = (p, z, fov = 40) => { cam.position.copy(p); cam.up.set(0, 1, 0); cam.lookAt(z); cam.fov = fov; cam.near = Math.max(0.1, p.distanceTo(z) * 0.02); cam.updateProjectionMatrix(); return z; };
// Objekt im Studio: Kamera 3/4 von vorne, so weit weg, dass es ins Bild passt
const imStudio = (obj, { dreh = -0.55, hoehe = 0.35, rand = 1.25 } = {}) => { halter.clear(); halter.add(obj); obj.position.set(0, 0, 0); halter.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj), m = box.getCenter(V(0, 0, 0)), gr = box.getSize(V(0, 0, 0)); const hf = Math.atan(Math.tan(20 * Math.PI / 180) * Wt.W / Wt.H), quer = Math.max(gr.x, gr.z) * 0.9;
  const d = Math.max(gr.y / 2 / Math.tan(20 * Math.PI / 180), quer / 2 / Math.tan(hf)) * rand + Math.max(gr.x, gr.z) / 2; const p = m.clone().add(V(Math.sin(dreh) * d, gr.y * hoehe + d * 0.18, Math.cos(dreh) * d));
  blick(p, m, 40); studioLicht.intensity = 1.2; licht(1.5, "#fff0e0", m); };

// ---------- Figuren ----------
const FO = {
  ich: { haut: "#f0c8a0", hemd: "#e8a020", hose: "#2a3a5a", haare: "#5a3418", frisur: "strubbel", kapuze: true, skala: 0.78, schuhe: "#e8e8e8" },
  papa: { haut: "#d89a6a", hemd: "#2a3a5a", aermel: "#2a3a5a", weste: "#ff7a1a", hose: "#2a2a30", haare: "#3a2414", helm: "#f0c020", skala: 1.1 },
  oma: { haut: "#f2d0b0", hemd: "#8a4a6a", stoff: true, hose: "#4a3a4a", haare: "#e0e0e0", frisur: "dutt", brille: true, schal: "#c8a050", skala: 0.95 },
  polizist: { haut: "#9a6038", hemd: "#1e2e5a", hose: "#1a2240", muetze: "#1e2e5a", abzeichen: true, frisur: "glatze", haare: "#111", skala: 1.05 },
  lehrer: { haut: "#e8b890", hemd: "#f4f4f4", jacke: "#2ab0a0", hose: "#c8a878", haare: "#6a4a2a", brille: true, skala: 1.05 },
  kind: { haut: "#8a5a3a", hemd: "#e85a9a", hose: "#3a3a5a", haare: "#1a1a1a", frisur: "zopf", kapuze: true, brust: "★", skala: 0.78 },
};
const F = {}; for (const [n, o] of Object.entries(FO)) F[n] = () => Fg.figur(o);
// Varianten mit Stoff- und Haarstruktur (neu 23.11.)
for (const n of ["ich", "papa", "oma", "lehrer"]) F[n + "-struktur"] = () => Fg.figur({ ...FO[n], struktur: true });
const FIG = {}; for (const [n, f] of Object.entries(F)) { FIG[n] = f(); FIG[n].visible = false; }
const GESICHTER = ["froh", "lachen", "reden", "schreien", "angst", "idee", "ernst", "schlaf", "staunen", "traurig"];

// ---------- Einträge: name → { gruppe, zeige(t) } ----------
const E = {};
for (const [n, bau] of Object.entries(O.ALLE)) { let obj = null; E["objekt-" + n] = { gruppe: "Objekte (objekte.js)", zeige: () => { obj = obj || bau(); imStudio(obj); } }; }
for (const n of Object.keys(F)) E["figur-" + n] = { gruppe: "Figuren", zeige: () => { halter.clear(); const f = FIG[n]; f.visible = true; f.position.copy(STUDIO); f.rotation.set(0, -0.35, 0); Fg.pose(f, { armR: 0.3, ges: "froh" });
  const h = 4.3 * f.scale.y; blick(STUDIO.clone().add(V(-3.2 * h / 4, h * 0.62, 9.5 * h / 4)), STUDIO.clone().add(V(0, h * 0.5, 0))); studioLicht.intensity = 1.2; licht(1.5, "#fff0e0", STUDIO.clone().add(V(0, h * 0.5, 0))); } };
E["figur-gesichter"] = { gruppe: "Figuren", zeige: () => { halter.clear(); const f = FIG.ich; f.visible = true; f.position.copy(STUDIO); f.rotation.set(0, 0, 0); Fg.pose(f, { ges: "staunen" }); const k = Fg.kopfPos(f); blick(k.clone().add(V(0, 0.1, 2.4)), k, 40); studioLicht.intensity = 1.2; licht(1.4, "#fff0e0", k); } };
for (const g of GESICHTER) E["gesicht-" + g] = { gruppe: "Gesichter", zeige: () => { halter.clear(); const f = FIG.ich; f.visible = true; f.position.copy(STUDIO); f.rotation.set(0, 0, 0); Fg.pose(f, { ges: g }); const k = Fg.kopfPos(f); blick(k.clone().add(V(0.3, 0.15, 2.6)), k, 40); studioLicht.intensity = 1.2; licht(1.4, "#fff0e0", k); } };
const nacht = () => {};
const tag = () => { U.uTag.value = 1; Wt.hemi.intensity = 1.2; Wt.hemi.color.set("#cfe4ff"); Wt.hemi.groundColor.set("#8a8070"); };
let STR = null, RT = null;
const K = {   // Kulissen und Effekte in der Welt (Koordinaten siehe KATALOG.md)
  "stadt-nacht": () => { const z = blick(V(180, 150, 420), V(0, 10, 0), 55); licht(1.2, "#ffd8b0", z); },
  "stadt-tag": () => { tag(); const z = blick(V(180, 150, 420), V(0, 10, 0), 55); licht(1.6, "#fff4e0", z); },
  "strasse": () => { const z = blick(V(27, 4.5, 140), V(24, 4, 60), 50); licht(1.2, "#ffd8b0", z); },
  "einkaufsstrasse": () => { STR = STR || Al.einkaufsstrasse({ x: 24, z0: 70, z1: 330 }); STR.visible = true; const z = blick(V(26, 4.2, 74), V(24, 3.5, 150), 50); licht(1.2, "#ffd8b0", z); },
  "einkaufsstrasse-tag": () => { tag(); STR = STR || Al.einkaufsstrasse({ x: 24, z0: 70, z1: 330 }); STR.visible = true; const z = blick(V(26, 4.2, 74), V(24, 3.5, 150), 50); licht(1.6, "#fff4e0", z); },
  "riesen-tier-strasse": () => { tag(); STR = STR || Al.einkaufsstrasse({ x: 24, z0: 70, z1: 330 }); STR.visible = true; RT = RT || O.riesenTier({ groesse: 0.9 }); RT.visible = true; RT.position.set(24, 0, 150); RT.rotation.y = Math.PI; if (!RT.parent) scene.add(RT);
    const z = blick(V(25, 2.5, 100), V(24, 9, 150), 55); licht(1.6, "#fff4e0", z); },
  "platz": () => { const z = blick(V(0, 14, 62), V(0, 5, 0), 55); licht(1.2, "#ffd8b0", z); },
  "gasse": () => { const z = blick(V(-70, 4, 96), V(-100, 3, 96), 50); licht(0.8, "#ffd8b0", z); },
  "laden-laternen": () => { const z = blick(V(58, 5, -24), V(79, 4.5, -30), 50); licht(1.2, "#ffd8b0", z); },
  "lager": () => { const z = blick(V(1400, 5, -590), V(1400, 3, -606), 55); licht(0.8, "#ffd8b0", z); },
  "schlafzimmer": () => { const zm = Rq.zimmer; zm.updateMatrixWorld(true); const z = blick(V(3.5, 5.5, -3.5).applyMatrix4(zm.matrixWorld), V(-1, 2, 2.5).applyMatrix4(zm.matrixWorld), 55); licht(0.4, "#ffc080", z); },
  "kraftwerk": () => { const z = blick(V(70, 30, -430), V(0, 15, -520), 55); licht(1.2, "#ffd8b0", z); },
  "polizei-kreis": () => { const z = blick(V(0, 45, 75), V(0, 0, 0), 55); Rq.polizeiSetzen(1, true, true, 27, cam.position); licht(1, "#ffd8b0", z); },
  "notlampen": () => { const z = blick(V(0, 10, 36), V(0, 2, 0), 55); Rq.notlampenSetzen(1, true, 21); licht(0.8, "#ffd8b0", z); },
  "menge": () => { const z = blick(V(0, 9, 34), V(0, 3, 0), 55); Rq.mengeSetzen(1, { sichtbar: true, licht: 0.6, armeHoch: () => 0.5 }); licht(1, "#ffd8b0", z); },
  "schatten-wesen": () => { const z = blick(V(5, 4, 44), V(0, 2, 30), 50); for (let i = 0; i < 6; i++) { const s = Ws.SCHATTEN[i]; Object.assign(s, { aktiv: true, x: -6 + i * 2.4, z: 30 - (i % 2) * 2, y: 0, ry: 0, groesse: 1.5, kriech: 0.6, aufl: 0, augen: 1 }); } licht(0.8, "#a8b8ff", z); },
  "himmelslaternen": () => { const r = () => Math.random(); const L = []; let s = 11; const rr = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; for (let i = 0; i < 600; i++) L.push({ x: (rr() - 0.5) * 60, y: 2, z: (rr() - 0.5) * 60, t0: rr() * 3, v: 2 + rr() * 2, wx: rr(), wz: rr(), ph: rr() * 6, s: 1, sichtbarAb: 0 }); Ws.laternenAnlegen(L); Wt.U.uGold.value = 0.6; const z = blick(V(0, 7, 38), V(0, 16, 0), 60); licht(1, "#ffd090", z); },
  "klassenzimmer": () => { const R = Al.KLASSE, o = R.g.position; Al.raumlicht(R); Al.schreibe(R.tafel, ["TAFEL"], { kreide: true, font: "700 230px 'Inter Display', sans-serif" }); const z = blick(V(o.x + 3.5, 4.4, o.z + 6.2), V(o.x - 0.5, 3.6, o.z - 5), 55); licht(0.6, "#fff4e0", z); },
  "kueche": () => { const R = Al.KUECHE, o = R.g.position; Al.raumlicht(R); const z = blick(V(o.x + 3.2, 4.6, o.z + 5.5), V(o.x, 2.6, o.z - 1), 55); licht(0.6, "#fff4e0", z); },
  "omas-stube": () => { const R = Al.STUBE, o = R.g.position; Al.raumlicht(R); Al.fernseherAn(); Al.handyBlick(V(0, 14, 62), V(0, 5, 0)); const z = blick(V(o.x - 2.6, 4.4, o.z + 4.6), V(o.x + 1, 2.6, o.z - 2.6), 55); licht(0.6, "#fff4e0", z); },
  "handy": () => { halter.clear(); const f = FIG.ich; f.visible = true; f.position.copy(STUDIO); f.rotation.set(0, 0, 0); Fg.pose(f, { armR: 1.45, armRz: -0.3, ges: "staunen" }); const k = Fg.kopfPos(f); const p = k.clone().add(V(1.6, 0.4, 3.2)); blick(p, k.clone().add(V(0.3, -0.6, 0.5)), 45);
    Al.handyHalten(f, Fg.handPos, Fg.kopfPos, { zu: p }); Al.handyBlick(V(0, 14, 62), V(0, 5, 0)); studioLicht.intensity = 1.2; licht(1.4, "#fff0e0", k); },
  "videowand": () => { Al.videowand.visible = true; Al.videowand.position.copy(STUDIO); Al.videowand.rotation.y = 0; Al.handyBlick(V(0, 14, 62), V(0, 5, 0)); const z = blick(STUDIO.clone().add(V(-12, 12, 34)), STUDIO.clone().add(V(0, 12, 0)), 45); studioLicht.intensity = 1.2; licht(1.4, "#fff0e0", z); },
  "konfetti-ballons": () => { tag(); Rq.konfettiSetzen(2, true); Al.ballonsSetzen(3, true, { x: 0, z: 0, t0: 0 }); Rq.mengeSetzen(1, { sichtbar: true, licht: 1, armeHoch: () => 1 }); const z = blick(V(0, 6, 32), V(0, 9, 0), 55); licht(1.6, "#fff4e0", z); },
  "regenbogen": () => { tag(); Al.regenbogen.visible = true; Al.regenbogen.position.set(0, 30, -160); Al.regenbogen.scale.setScalar(1.2); const z = blick(V(0, 6, 40), V(0, 25, -40), 60); licht(1.6, "#fff4e0", z); },
};
for (const [n, f] of Object.entries(K)) E["kulisse-" + n] = { gruppe: "Kulissen, Wesen, Effekte", zeige: f };

// ---------- Rendern ----------
window.NAMEN = Object.keys(E); window.GRUPPEN = Object.fromEntries(Object.entries(E).map(([n, e]) => [n, e.gruppe]));
window.zeige = (name) => { const e = E[name]; if (!e) throw new Error("Unbekannt: " + name);
  U.uT.value = 1; U.uAus.value = 1e6; U.uAn.value = 1e6; U.uTag.value = 0; U.uGold.value = 0; Wt.grade.uniforms.uFlash.value = 0; Wt.grade.uniforms.uVig.value = 0.3;
  Wt.hemi.intensity = 0.6; Wt.hemi.color.set("#5a6ab0"); Wt.hemi.groundColor.set("#141018"); Wt.suchkegel.forEach(k => k.visible = false);
  Fg.FIGUREN.forEach(f => f.visible = false); if (STR) STR.visible = false; if (RT) RT.visible = false; Ws.schattenAus(); Ws.laternenAnlegen([]); Al.zuruecksetzen(); studioLicht.intensity = 0; halter.clear();
  Rq.polizeiSetzen(1, false, false); Rq.notlampenSetzen(0, false); Rq.mengeSetzen(1, { sichtbar: false }); Rq.konfettiSetzen(0, false);
  Wt.autosSetzen(1); Wt.lampenAktualisieren(1);
  e.zeige(1); cam.updateProjectionMatrix();
  Ws.laternenSetzen(1); Ws.schattenSetzen(1); Ws.funkenSetzen(1); Ws.staubSetzen(1); Al.bildschirmeRendern();
  document.getElementById("cap").textContent = name; composer.render(); return true; };
window.bereit = true;
