// Jumpscare Typ 2 (Fenster): Kamera nähert sich dem zugemauerten Turmfenster, darin ganz schwach zwei leuchtende Augen.
// Stille, Abdunkeln … dann springt die Nonne aus dem Fenster direkt auf die Kamera zu. Kamera bleibt fest (kein Wackeln).
import * as THREE from "three";
import * as B from "../folge.js";
import * as HW from "../horrorwelt.js";
import { real, ranim, jumpscareSprung, rpose } from "../horror_real.js";
const { V, sh, blick, licht, Wt, Z_ } = B;
await B.laden(); const { DAUER } = B.F;
const P = HW.SCHATTENTAL.pos, nun = real("nun");
const FENSTER = P(0, 18.4, -110.6), KAM_A = P(3, 6, -70), KAM_B = P(1.6, 9.5, -84);
// schwach leuchtende Augen im Fensterspalt (vorher ganz leicht sichtbar)
const AUGEN = new THREE.Group(); for (const x of [-0.32, 0.32]) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), new THREE.MeshBasicMaterial({ color: "#ffcf3a", transparent: true })); m.position.set(x, 0, 0); m.scale.set(1.4, 0.7, 0.5); AUGEN.add(m); }
AUGEN.position.copy(FENSTER).add(V(0, -0.2, 0.9)); B.Wt.scene.add(AUGEN);
const augen = (a) => { AUGEN.visible = a > 0.01; AUGEN.children.forEach(m => m.material.opacity = a); };
const T_STILL = 3.4, T_JS = 4.15, T_ZU = 4.6, T_ENDE = 5.0;
const grund = () => { HW.nacht(0.75); HW.SCHATTENTAL.licht.intensity = 16; HW.dunkel(0); HW.SCHATTENTAL.glocke.rotation.z = 0; };
const kopfW = () => { const v = new THREE.Vector3(); nun.userData.j.kopf.getWorldPosition(v); return v; };
const kam = (t) => { const q = Math.min(1, t / T_JS), e = q * q * (3 - 2 * q); return KAM_A.clone().lerp(KAM_B, e); };
// 1) Annäherung: im Fensterspalt nur die Augen (Nonne steht dahinter im Dunkel)
sh(T_STILL, (t, q) => { grund(); nun.visible = true; nun.position.copy(FENSTER).add(V(0, -3.2, -0.5)); nun.rotation.y = 0; ranim(nun, t, "stehen"); nun.userData.augen.visible = true; augen(0.35 + 0.35 * q);
  HW.SCHATTENTAL.glocke.rotation.z = Math.sin(t * 2.2) * 0.12; blick(kam(t), FENSTER.clone().add(V(0, 0.4, 0))); Wt.cam.fov = 44 - q * 8; licht(0.4, "#ffd0a0", 0.4, "#8a7aff"); Z_.vignette = 0.6; });
// 2) Stille: Glocke steht still, Bild wird dunkel
sh(T_JS, (t, q) => { grund(); nun.visible = true; nun.position.copy(FENSTER).add(V(0, -3.2, -0.5)); ranim(nun, t, "stehen"); nun.userData.augen.visible = true; augen(0.7 + 0.3 * q);
  blick(kam(t), FENSTER.clone().add(V(0, 0.4, 0))); Wt.cam.fov = 36 - q * 2; licht(0.3, "#ffd0a0", 0.3, "#8a7aff"); Z_.vignette = 0.75; HW.dunkel(0.2 + 0.45 * q); });
// 3) Sprung: aus dem Fenster auf die Kamera zu; rotes Unterlicht
sh(T_ZU, (t, q) => { grund(); const k = kam(T_JS); nun.visible = true; nun.userData.augen.visible = false; augen(0); jumpscareSprung(nun, q, FENSTER.clone().add(V(0, -3.0, 0.5)), k, t);
  blick(k, FENSTER.clone().add(V(0, 0.4, 0)).lerp(kopfW(), Math.min(1, q * 1.6))); Wt.cam.fov = 34 + q * 14;
  Wt.key.position.copy(k).add(V(0, 1, 0)); Wt.key.intensity = 2.2; Wt.key.color.set("#ffd8cc"); Wt.rim.position.copy(nun.position).add(V(0, 0.5, 2)); Wt.rim.intensity = 2.4; Wt.rim.color.set("#ff2a1a"); Z_.vignette = 0.7; });
// 4) Großaufnahme hält kurz (Maul offen, Kopf zuckt), dann harter Schnitt
sh(T_ENDE, (t, q) => { grund(); augen(0); const k = kam(T_JS); nun.visible = true; jumpscareSprung(nun, 1, FENSTER.clone().add(V(0, -3.0, 0.5)), k, t); nun.userData.j.kopf.rotation.z = Math.sin(t * 40) * 0.035 * (1 - q);
  blick(k, kopfW()); Wt.cam.fov = 48 + q * 2; Wt.key.position.copy(k).add(V(0, 1, 0)); Wt.key.intensity = 2.2; Wt.rim.position.copy(nun.position).add(V(0, 0.5, 2)); Wt.rim.intensity = 2.4; Wt.rim.color.set("#ff2a1a"); Z_.vignette = 0.7; });
// 5) leeres Fenster, Glocke schwingt wieder
sh(DAUER + 1, (t, q) => { grund(); augen(0); nun.visible = false; HW.SCHATTENTAL.glocke.rotation.z = Math.sin(t * 2.2) * 0.12; blick(kam(T_JS), FENSTER.clone().add(V(0, 0.4, 0))); Wt.cam.fov = 34; licht(0.3, "#ffd0a0", 0.3, "#8a7aff"); Z_.vignette = 0.7; HW.dunkel(0.35); });
B.start({ grund: () => {} });
