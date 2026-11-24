// Jumpscare-Baustein (Jonathan 24.11., nach Vorbild-TikTok, abgenommen als test-jumpscare5):
// 1) Ablenkung (z. B. Augen im Fenster) → 2) Stille → 3) Kopf hebt sich LANGSAM an einer unerwarteten Stelle (Vordergrund) ins Bild
// 4) Sprung bis vor die Linse (Ease-out, Weitwinkel 36→86°, Blitz nur aufs Gesicht) → 5) bleibt ~1,3 s zuckend nah → harter Schnitt.
// Kamera steht immer still (kein Wackeln). Ton: T.jumpscare(t_sprung, halten=1.45, art="dunkel"), Hintergrund vorher fast still.
// Danach in der Nachbearbeitung Bewegungsunschärfe auf die Sprungbilder (bewegungsunschaerfe.py).
import * as THREE from "three";
import { Wt } from "./folge.js";
import { ranim, rpose, setzeGesicht } from "./horror_real.js";

const ss = (a, b, x) => { const q = Math.min(1, Math.max(0, (x - a) / (b - a))); return q * q * (3 - 2 * q); };
const zufall = (n, k) => { const v = Math.sin(n * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
// stufige Zuckungen alle ~0.11 s mit kurzem Übergang (die Figur zuckt, nie die Kamera)
export const ruck = (t, k) => { const i = Math.floor(t / 0.11), f = ss(0, 0.35, (t / 0.11) % 1); return zufall(i, k) + (zufall(i + 1, k) - zufall(i, k)) * f; };

export const baue = (fig, { kamera, blickZiel }) => {
  const j = fig.userData.j;
  // sichtbare Kopfgröße messen (manche Köpfe sind gestreckt/nach oben versetzt, z. B. Pennywise) – sonst landet die Kamera im Kopf
  fig.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(j.kopf), mitteL = j.kopf.worldToLocal(box.getCenter(new THREE.Vector3())), gr = box.getSize(new THREE.Vector3());
  const kr = Math.max(j.kopfR, Math.max(gr.x, gr.y, gr.z) * 0.5 * 0.8), K = kamera.clone(), VOR = blickZiel.clone().sub(K).normalize(), RECHTS = VOR.clone().cross(new THREE.Vector3(0, 1, 0)).normalize();
  if (fig.userData.kiefer) fig.userData.kiefer.visible = false;
  const licht = new THREE.PointLight("#f2eeff", 0, kr * 14, 2); Wt.scene.add(licht);
  const kopfMeshes = new Set(); j.kopf.traverse(o => kopfMeshes.add(o));
  const kopfW = () => { j.kopf.updateWorldMatrix(true, false); return j.kopf.localToWorld(mitteL.clone()); };
  const nurKopf = (an) => fig.traverse(o => { if (o.isMesh) o.visible = (!an || kopfMeshes.has(o)) && o !== fig.userData.kiefer; });
  const kopfNach = (ziel, t, modus) => { fig.visible = true; j.kopf.scale.set(1, 1, 1); ranim(fig, t, modus); rpose(fig, { armL: 0.15, armR: 0.15, armLz: 0.1, armRz: 0.1, ellbogen: 0.2, neig: 0.3, kopfNeig: -0.1 });
    if (fig.userData.augen) fig.userData.augen.visible = false;
    fig.rotation.set(0, Math.atan2(-VOR.x, -VOR.z), 0);   // feste Blickrichtung zur Kamera (lookAt kippt, wenn die Figur unter der Kamera steht)
    for (let i = 0; i < 2; i++) { fig.updateMatrixWorld(true); fig.position.add(ziel.clone().sub(kopfW())); } };
  const blitz = (e) => { const k = kopfW(), d = kr * 3.2; licht.position.copy(k).add(K.clone().sub(k).normalize().multiplyScalar(d)).add(new THREE.Vector3(0, kr * 0.4, 0)); licht.intensity = e * d * d; };
  // Versteck: Abstand vor der Kamera (in Kopfradien), seitlich (+ rechts), h = 0 unter dem Bildrand … 1 im Bild
  const versteck = (h, { abstand = 15, seite = 2.1 } = {}) => K.clone().add(VOR.clone().multiplyScalar(kr * abstand)).add(RECHTS.clone().multiplyScalar(kr * seite)).add(new THREE.Vector3(0, kr * (-6.6 + 3.4 * h), 0));
  const nah = (d) => K.clone().add(VOR.clone().multiplyScalar(kr * d)).add(new THREE.Vector3(0, -kr * 0.15, 0));
  const aus = () => { licht.intensity = 0; fig.visible = false; Wt.bloom.strength = 0.35; };
  return {
    K, VOR, kr, aus, kopfW,
    // Phase 3: q 0..1, Kopf hebt sich langsam
    auftauchen(t, q, o = {}) { const e = ss(0, 1, q); nurKopf(true); kopfNach(versteck(e, o), t, "stehen"); setzeGesicht(fig, true, 0); j.kopf.rotation.z = 0.15 * e; blitz(0.25 + 0.2 * e); return { fov: 36 }; },
    // Phase 4: q 0..1, Sprung vor die Linse; gibt fov und Blickpunkt zurück
    sprung(t, q, o = {}) { const e = 1 - Math.pow(1 - q, 3); nurKopf(q < 0.5); Wt.bloom.strength = 0.35 - 0.3 * q; kopfNach(versteck(1, o).lerp(nah(2.2), e), t, "schrei"); setzeGesicht(fig, true, 0);
      j.kopf.rotation.z = 0.15 - 0.23 * q; j.kopf.scale.set(1 - 0.08 * q, 1 + 0.14 * q, 1); blitz(0.45 + 0.55 * q); return { fov: 36 + 50 * e, ziel: K.clone().add(VOR) }; },   // Blickpunkt nah halten: folge.js setzt cam.near = 4 % des Zielabstands, ein ferner Blickpunkt schneidet sonst den Kopf ab
    // Phase 5: tt = Sekunden seit Sprungende, q 0..1 über die Haltezeit
    halten(t, tt, q) { const a = ss(0, 0.18, tt), d = 2.2 - 0.55 * ss(0, 1, q), R = RECHTS, U = new THREE.Vector3(0, 1, 0);
      nurKopf(false); Wt.bloom.strength = 0.1; kopfNach(nah(d).add(R.clone().multiplyScalar((ruck(t, 1) - 0.5) * kr * 0.35 * a)).add(U.clone().multiplyScalar((ruck(t, 2) - 0.5) * kr * 0.25 * a)), t, "schrei");
      setzeGesicht(fig, true, 0); j.kopf.rotation.z = -0.08 + (ruck(t, 3) - 0.5) * 0.3 * a; j.kopf.rotation.x += (ruck(t, 4) - 0.5) * 0.3 * a; j.kopf.scale.set(0.92, 1.14 + (ruck(t, 5) - 0.5) * 0.06 * a, 1); blitz(0.9);
      return { fov: 86, ziel: K.clone().add(VOR) }; },
  };
};
