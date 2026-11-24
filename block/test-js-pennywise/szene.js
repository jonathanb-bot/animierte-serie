// Jumpscare-Baustein mit Pennywise: Ablenkung = roter Ballon weit hinten auf dem Waldweg, er platzt lautlos weg,
// dann hebt sich Pennywise unten LINKS im Vordergrund ins Bild und springt vor die Linse.
import * as THREE from "three";
import * as B from "../folge.js";
import * as HW from "../horrorwelt.js";
import * as JS from "../jumpscare.js";
import { real } from "../horror_real.js";
const { V, sh, blick, licht, Wt, Z_ } = B;
await B.laden(); const { DAUER } = B.F;
const P = HW.WALDWEG.pos, pw = real("pennywise");
const BALLON_POS = P(0.5, 2.1, -22), KAM = P(0, 1.7, 6), ZIEL = P(0, 1.6, -38);
const ballon = new THREE.Group(); { const k = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 18), new THREE.MeshStandardMaterial({ color: "#b0101a", roughness: 0.35, emissive: "#300004" })); k.scale.y = 1.15; ballon.add(k);
  const s = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.6), new THREE.MeshBasicMaterial({ color: "#d8d8d8" })); s.position.y = -1.2; ballon.add(s); } Wt.scene.add(ballon);
const js = JS.baue(pw, { kamera: KAM, blickZiel: ZIEL });
const T_WEG = 3.2, T_AUF = 4.6, T_STARR = 5.05, T_SPRUNG = 5.3, T_ENDE = 6.6;
const grund = () => { HW.nacht(0.45); HW.dunkel(0.45); js.aus(); ballon.visible = false; licht(0.2, "#ffd0a0", 0.2, "#6a5aaf"); Z_.vignette = 0.9; };
sh(T_WEG, (t, q) => { grund(); ballon.visible = true; ballon.position.copy(BALLON_POS).add(V(Math.sin(t * 0.9) * 0.15, Math.sin(t * 1.3) * 0.1, 0)); ballon.rotation.z = Math.sin(t * 0.9) * 0.1; blick(KAM, ZIEL); Wt.cam.fov = 40 - q * 4; });
sh(T_AUF, (t, q) => { grund(); ballon.visible = q < 0.12; ballon.position.copy(BALLON_POS); blick(KAM, ZIEL); Wt.cam.fov = 36; HW.dunkel(0.38 + 0.22 * q); });
sh(T_STARR, (t, q) => { grund(); const r = js.auftauchen(t, q, { seite: -2.1 }); blick(KAM, ZIEL); Wt.cam.fov = r.fov; HW.dunkel(0.6); });
sh(T_SPRUNG, (t, q) => { grund(); const r = js.sprung(t, q, { seite: -2.1 }); blick(KAM, r.ziel); Wt.cam.fov = r.fov; Z_.vignette = 0.9; HW.dunkel(0.6 - 0.25 * q); });
sh(T_ENDE, (t, q) => { grund(); const r = js.halten(t, t - T_SPRUNG, q); blick(KAM, r.ziel); Wt.cam.fov = r.fov; Z_.vignette = 0.95; HW.dunkel(0.35); });
sh(DAUER + 1, (t, q) => { grund(); blick(KAM, ZIEL); Wt.cam.fov = 36; HW.dunkel(0.6); });
B.start({ grund: () => {} });
