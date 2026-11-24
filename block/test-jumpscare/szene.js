// Jumpscare-Test (Jonathan 24.11.): Nonne vorher ganz schwach im Nebel sichtbar, Ruhe, Laterne geht aus, harter Schnitt, sie springt ins Bild.
// Zeiten (s): 0–3.8 Straße, Kamera schleicht vor, Nonne weit hinten im Nebel (kaum sichtbar) · 3.8–4.9 Laterne vorn flackert NICHT, geht in 0,4 s aus
// · 4.9–5.25 fast dunkel, Stille · 5.25 harter Schnitt: Jumpscare (Kamera springt vor das Gesicht, Maul öffnet sich) bis 5.95 · danach leere Straße.
import * as B from "../folge.js";
import * as HW from "../horrorwelt.js";
import { real, ranim, jumpscareBlick, M } from "../horror_real.js";
const { V, sh, blick, licht, Wt, Z_, THREE } = B;
await B.laden(); const { DAUER } = B.F;
const P = HW.SCHATTENTAL.pos, nun = real("nun");
const latMat = []; for (const lat of HW.SCHATTENTAL.laternen) lat.traverse(o => { if (o.isMesh && o.material?.isMeshBasicMaterial) { o.material = o.material.clone(); latMat.push([o.material, o.material.color.clone()]); } });
const latLicht = new THREE.PointLight("#ffd8a0", 0, 30, 1.6); latLicht.position.copy(P(6.4, 5.6, 12)); Wt.scene.add(latLicht);
const T_AUS = 4.4, T_JS = 5.25, T_ENDE = 5.9;
// alle Laternen gehen nacheinander aus – von hinten nach vorn zur Kamera (Welle), die vorderste zuletzt
const laterne = (t) => { const a = t < T_AUS ? 1 : Math.max(0, 1 - (t - T_AUS) / 0.35); latMat.forEach(([m, c], i) => { const z = 0; m.color.copy(c).multiplyScalar(0.06 + 0.94 * a); }); latLicht.intensity = 40 * a; return a; };
const grund = (t) => { HW.nacht(0.8); HW.SCHATTENTAL.licht.intensity = 18; HW.dunkel(0); };
// 1) Straße, Kamera schleicht vor; Nonne weit hinten im Nebel, steht still
sh(T_AUS + 0.45, (t, q) => { grund(t); const a = laterne(t); nun.visible = true; nun.position.copy(P(-4.6, 0.06, -14)); nun.rotation.y = 0.15; ranim(nun, t, "stehen"); nun.userData.augen.visible = true;
  const z = 22 - q * 3; blick(P(1.8, 3.4, z), P(-0.5, 3.2, z - 30)); Wt.cam.fov = 52; licht(0.35 + 0.15 * a, "#ffd0a0", 0.4, "#8a7aff"); Z_.vignette = 0.55 + (1 - a) * 0.3; Wt.hemi.intensity *= 0.55 + 0.45 * a; HW.dunkel((1 - a) * 0.55); });
// 2) Dunkel, Stille (0,35 s) – man ahnt nur die Straße
sh(T_JS, (t, q) => { grund(t); laterne(t); nun.visible = false; blick(P(1.8, 3.4, 19 - q * 0.2), P(-0.5, 3.2, -11)); Wt.cam.fov = 52; licht(0.18, "#ffd0a0", 0.2, "#8a7aff"); Wt.hemi.intensity = 0.18; Z_.vignette = 0.85; HW.dunkel(0.55 + 0.3 * q); });
// 3) JUMPSCARE: harter Schnitt, Nonne direkt vor der Kamera, kommt in 0,3 s heran, Maul auf, rotes Gegenlicht
sh(T_ENDE, (t, q) => { grund(t); laterne(t); const u = (t - T_JS) / 0.3; nun.visible = true; nun.position.copy(P(0.5, 0.06, 12)); nun.rotation.y = 0; ranim(nun, 1.0 + (t - T_JS) * 0.4, u < 0.15 ? "angriff" : "schrei");
  const b = jumpscareBlick(nun, Math.min(1, u) + Math.max(0, u - 1) * 0.04); const zuck = Math.max(0, u - 1) > 0 ? Math.sin((t - T_JS) * 38) * 0.04 * Math.exp(-(t - T_JS - 0.3) * 4) : 0; nun.userData.j.kopf.rotation.z = zuck; blick(b.pos, b.ziel); Wt.cam.fov = b.fov; Wt.key.position.copy(b.pos).add(V(0, 0.6, 0)); Wt.key.target.position.copy(b.ziel); Wt.key.intensity = 2.4; Wt.key.color.set("#fff0e0");
  nun.userData.augen.visible = false; Wt.rim.position.copy(b.ziel).add(V(0, 0.4, -4)); Wt.rim.target.position.copy(b.ziel); Wt.rim.intensity = 1.6; Wt.rim.color.set("#ff2a1a"); Wt.hemi.intensity = 0.25; Z_.vignette = 0.7; });
// 4) danach: leere Straße, Laterne aus
sh(DAUER + 1, (t, q) => { grund(t); laterne(t); nun.visible = false; blick(P(1.8, 3.4, 18.6), P(-0.5, 3.2, -11)); Wt.cam.fov = 52; licht(0.2, "#ffd0a0", 0.2, "#8a7aff"); Wt.hemi.intensity = 0.25; Z_.vignette = 0.8; HW.dunkel(0.6); });
B.start({ grund: () => {} });
