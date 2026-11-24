// Jumpscare Typ 2b nach Jonathans Vorbild (24.11.): lange Ruhe, Augen verschwinden, Kopf taucht langsam am Fenster auf,
// starrt, dann rast das Gesicht bis ganz vor die Linse (Weitwinkel), bleibt zuckend dort. Kamera steht still.
import * as THREE from "three";
import * as B from "../folge.js";
import * as HW from "../horrorwelt.js";
import { real, ranim, rpose, setzeGesicht } from "../horror_real.js";
const { V, sh, blick, licht, Wt, Z_ } = B;
await B.laden(); const { DAUER } = B.F;
const P = HW.SCHATTENTAL.pos, nun = real("nun"), kr = nun.userData.j.kopfR;
const FENSTER = P(0, 18.4, -110.6), KAM_A = P(3, 6, -70), KAM_B = P(1.6, 9.5, -84);
const T_WEG = 3.2, T_AUF = 4.3, T_STARR = 4.75, T_SPRUNG = 5.05, T_ENDE = 6.25;
const AUGEN = new THREE.Group(); for (const x of [-0.32, 0.32]) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), new THREE.MeshBasicMaterial({ color: "#ffcf3a", transparent: true })); m.position.set(x, 0, 0); m.scale.set(1.4, 0.7, 0.5); AUGEN.add(m); }
AUGEN.position.copy(FENSTER).add(V(0, -0.2, 0.9)); Wt.scene.add(AUGEN);
const augen = (a) => { AUGEN.visible = a > 0.01; AUGEN.children.forEach(m => m.material.opacity = a); };
const kopfW = () => { const v = new THREE.Vector3(); nun.userData.j.kopf.getWorldPosition(v); return v; };
const ss = (a, b, x) => { const q = Math.min(1, Math.max(0, (x - a) / (b - a))); return q * q * (3 - 2 * q); };
const kam = (t) => KAM_A.clone().lerp(KAM_B, ss(0, T_AUF, t));
const ZIEL = FENSTER.clone().add(V(0, -0.1, 0.9));
const K = kam(T_AUF), VOR = ZIEL.clone().sub(K).normalize();
// Kopf an eine Weltposition setzen (Körper folgt), Blick zur Kamera
const kopfNach = (ziel, t, modus) => { nun.userData.j.kopf.scale.set(1, 1, 1); nun.visible = true; nun.lookAt(K.x, nun.position.y, K.z); ranim(nun, t, modus); rpose(nun, { armL: 1.4, armR: 1.4, armLz: 0.2, armRz: 0.2, ellbogen: 0.4, neig: 0.3, kopfNeig: -0.1 }); nun.userData.augen.visible = false;
  for (let i = 0; i < 2; i++) { nun.updateMatrixWorld(true); nun.position.add(ziel.clone().sub(kopfW())); nun.lookAt(K.x, nun.position.y, K.z); } };
// zufällige, ruckartige Zuckungen (stufig alle ~0.11 s, mit kurzem Übergang) – die Figur zuckt, die Kamera nie
const ruck = (t, k) => { const i = Math.floor(t / 0.11), f = ss(0, 0.35, (t / 0.11) % 1), r = (n) => Math.sin(n * 12.9898 + k * 78.233) * 43758.5453 % 1; return r(i) + (r(i + 1) - r(i)) * f; };
// Blitzlicht nur fürs Gesicht (kurze Reichweite, beleuchtet den Turm nicht)
const BLITZ = new THREE.PointLight("#f2eeff", 0, kr * 14, 2); Wt.scene.add(BLITZ);
// Licht immer im festen Abstand vor dem Gesicht (Richtung Kamera) → gleichmäßige Helligkeit, egal wie nah
const blitz = (e) => { const k = kopfW(), d = kr * 3.2; BLITZ.position.copy(k).add(K.clone().sub(k).normalize().multiplyScalar(d)).add(V(0, kr * 0.4, 0)); BLITZ.intensity = e * d * d; };
// nur der Kopf sichtbar (Körper bleibt hinter der Fensterbrüstung verborgen)
const kopfMeshes = new Set(); nun.userData.j.kopf.traverse(o => kopfMeshes.add(o));
const nurKopf = (an) => nun.traverse(o => { if (o.isMesh) o.visible = !an || kopfMeshes.has(o); });
const grund = () => { BLITZ.intensity = 0; Wt.bloom.strength = 0.55; HW.nacht(0.75); HW.SCHATTENTAL.licht.intensity = 16; HW.dunkel(0); HW.SCHATTENTAL.glocke.rotation.z = 0; nun.visible = false; augen(0); };
const nacht = (t) => { licht(0.32, "#ffd0a0", 0.32, "#8a7aff"); Z_.vignette = 0.7; };
// 1) Annäherung, schwache Augen im Fenster (Glocke schwingt)
sh(T_WEG, (t, q) => { grund(); augen(0.35 + 0.4 * q); HW.SCHATTENTAL.glocke.rotation.z = Math.sin(t * 2.2) * 0.12 * (1 - q); blick(kam(t), FENSTER); Wt.cam.fov = 44 - q * 6; nacht(t); });
// 2) Augen sind weg. Leeres Fenster, es wird noch stiller und dunkler
sh(T_AUF, (t, q) => { grund(); augen(Math.max(0, 0.75 - q * 6)); blick(kam(t), FENSTER); Wt.cam.fov = 38 - q * 2; nacht(t); HW.dunkel(0.15 + 0.3 * q); });
// 3) Kopf taucht langsam unten im Fenster auf und starrt
sh(T_STARR, (t, q) => { grund(); const e = ss(0, 1, q); nurKopf(true); kopfNach(ZIEL.clone().add(V(0, -0.9 + 0.9 * e, 0.2)), t, "stehen"); setzeGesicht(nun, true, 0.12); nun.userData.j.kopf.rotation.z = 0.12 * e;
  blick(K, FENSTER); Wt.cam.fov = 36; nacht(t); HW.dunkel(0.4); blitz(0.6 + 0.6 * e); });
// 4) Sprung bis ganz vor die Linse: Weitwinkel, Blitz-Licht
sh(T_SPRUNG, (t, q) => { grund(); const e = 1 - Math.pow(1 - q, 3); const nah = K.clone().add(VOR.clone().multiplyScalar(kr * 2.2)).add(V(0, -kr * 0.15, 0));
  nurKopf(false); Wt.bloom.strength = 0.55 - 0.45 * q; kopfNach(ZIEL.clone().lerp(nah, e), t, "schrei"); setzeGesicht(nun, true, 0.1 - 0.04 * q); nun.userData.j.kopf.rotation.z = 0.12 - 0.2 * q;
  blick(K, FENSTER.clone().lerp(kopfW(), q)); Wt.cam.fov = 36 + 50 * q * q * q; nacht(t); blitz(1.8 - 0.2 * q); nun.userData.j.kopf.scale.set(1 - 0.08 * q, 1 + 0.14 * q, 1); Z_.vignette = 0.75; HW.dunkel(0.4 * (1 - q)); });
// 5) bleibt zuckend ganz nah, drückt noch näher heran
sh(T_ENDE, (t, q) => { grund(); const d = kr * (2.2 - 0.55 * ss(0, 1, q)), a = ss(T_SPRUNG, T_SPRUNG + 0.18, t); const nah = K.clone().add(VOR.clone().multiplyScalar(d)).add(V((ruck(t, 1) - 0.5) * kr * 0.35 * a, -kr * 0.15 + (ruck(t, 2) - 0.5) * kr * 0.25 * a, 0));
  nurKopf(false); Wt.bloom.strength = 0.1; kopfNach(nah, t, "schrei"); setzeGesicht(nun, true, 0.06); const kp = nun.userData.j.kopf; kp.rotation.z = -0.08 + (ruck(t, 3) - 0.5) * 0.3 * a; kp.rotation.x += (ruck(t, 4) - 0.5) * 0.3 * a;
  blick(K, K.clone().add(VOR)); Wt.cam.fov = 86; nacht(t); blitz(1.5); kp.scale.set(0.92, 1.14 + (ruck(t, 5) - 0.5) * 0.06 * a, 1); Z_.vignette = 0.75; });
// 6) harter Schnitt: leeres Fenster
sh(DAUER + 1, (t, q) => { grund(); blick(K, FENSTER); Wt.cam.fov = 36; nacht(t); HW.dunkel(0.4); });
B.start({ grund: () => {} });
