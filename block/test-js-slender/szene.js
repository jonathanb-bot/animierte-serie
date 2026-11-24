// Jumpscare-Baustein mit Slender Man: er steht weit hinten ganz schwach zwischen den Bäumen (vorher leicht sichtbar),
// ist plötzlich weg – dann hebt sich sein Kopf unten rechts im Vordergrund ins Bild und springt vor die Linse.
import * as THREE from "three";
import * as B from "../folge.js";
import * as HW from "../horrorwelt.js";
import * as JS from "../jumpscare.js";
import { real, ranim } from "../horror_real.js";
const { V, sh, blick, licht, Wt, Z_ } = B;
await B.laden(); const { DAUER } = B.F;
const P = HW.WALDWEG.pos, sm = real("slenderman"), fern = real("slenderman");
const KAM = P(0, 1.7, 6), ZIEL = P(0, 2.4, -38), FERN = P(4.5, 0, -30);
const js = JS.baue(sm, { kamera: KAM, blickZiel: ZIEL });
const T_WEG = 3.2, T_AUF = 4.6, T_STARR = 5.05, T_SPRUNG = 5.3, T_ENDE = 6.6;
const grund = () => { HW.nacht(0.45); HW.dunkel(0.45); js.aus(); fern.visible = false; licht(0.2, "#ffd0a0", 0.2, "#6a5aaf"); Z_.vignette = 0.9; };
sh(T_WEG, (t, q) => { grund(); fern.visible = true; fern.position.copy(FERN); fern.rotation.y = Math.atan2(KAM.x - FERN.x, KAM.z - FERN.z); ranim(fern, t, "stehen"); blick(KAM, ZIEL); Wt.cam.fov = 40 - q * 4; });
sh(T_AUF, (t, q) => { grund(); blick(KAM, ZIEL); Wt.cam.fov = 36; HW.dunkel(0.45 + 0.17 * q); });
sh(T_STARR, (t, q) => { grund(); const r = js.auftauchen(t, q, { seite: 2.4 }); blick(KAM, ZIEL); Wt.cam.fov = r.fov; HW.dunkel(0.62); });
sh(T_SPRUNG, (t, q) => { grund(); const r = js.sprung(t, q, { seite: 2.4 }); blick(KAM, r.ziel); Wt.cam.fov = r.fov; Z_.vignette = 0.9; HW.dunkel(0.62 - 0.25 * q); });
sh(T_ENDE, (t, q) => { grund(); const r = js.halten(t, t - T_SPRUNG, q); blick(KAM, r.ziel); Wt.cam.fov = r.fov; Z_.vignette = 0.95; HW.dunkel(0.37); });
sh(DAUER + 1, (t, q) => { grund(); blick(KAM, ZIEL); Wt.cam.fov = 36; HW.dunkel(0.62); });
B.start({ grund: () => {} });
