// Probe der neuen Bibliotheks-Bausteine (alltag.js): Küche, Klassenzimmer mit Tafel, Handy mit echtem Bildschirm,
// Flug ins Handy, Omas Wohnzimmer mit Fernseher + Shop-Seite, Großbildschirm auf dem Platz, Ballons + Regenbogen.
import * as B from "../folge.js";
const { V, lerp, lerpV, easeIO, sh, blick, licht, kamera, Fg, Rq, Al, Wt, Z_ } = B;
await B.laden(); const { Z, E, DAUER } = B.F;

const ich = Fg.figur({ haut: "#f0c8a0", hemd: "#e8a020", hose: "#2a3a5a", haare: "#5a3418", frisur: "strubbel", kapuze: true, skala: 0.78, schuhe: "#e8e8e8" });
const papa = Fg.figur({ haut: "#d89a6a", hemd: "#2a3a5a", aermel: "#2a3a5a", weste: "#ff7a1a", hose: "#2a2a30", haare: "#3a2414", helm: "#f0c020", skala: 1.1 });
const oma = Fg.figur({ haut: "#f2d0b0", hemd: "#8a4a6a", stoff: true, hose: "#4a3a4a", haare: "#e0e0e0", frisur: "dutt", brille: true, schal: "#c8a050", skala: 0.95 });
const lehrer = Fg.figur({ haut: "#e8b890", hemd: "#f4f4f4", jacke: "#2ab0a0", hose: "#c8a878", haare: "#6a4a2a", brille: true, skala: 1.05 });
const kind2 = Fg.figur({ haut: "#8a5a3a", hemd: "#e85a9a", hose: "#3a3a5a", haare: "#1a1a1a", frisur: "zopf", kapuze: true, brust: "★", skala: 0.78 });

const loc = (R, x, y, z) => V(R.g.position.x + x, y, R.g.position.z + z);
// Was das Handy zeigt: Papa rennt auf dem Platz, Schatten hinter ihm
const handyFilm = (t) => { papa.visible = true; const z = 30 - (t % 6) * 4; papa.position.set(0, 0, z); papa.rotation.y = Math.PI; Fg.pose(papa, { renn: 1, phase: t * 10, armL: 0.3, armR: 0.3, ges: "angst" });
  for (let i = 0; i < 8; i++) B.schatten(i, -6 + (i % 4) * 4, z + 7 + Math.floor(i / 4) * 3, Math.PI, { g: 1.5, kriech: 0.6 + 0.3 * Math.sin(t * 2 + i) });
  Al.handyBlick(V(9, 4.5, z - 12), V(0, 2.5, z + 3), 50); };

// 0 Küche: Frühstück, Blick aufs Handy
sh(E[0] + 0.1, (t, q) => { const R = Al.KUECHE; Al.raumlicht(R); handyFilm(t);
  ich.visible = true; ich.position.copy(loc(R, 0, 0, -2.4)); ich.rotation.y = 0; Fg.pose(ich, { armR: 1.45, armRz: -0.3, kopfNeig: 0.3, ges: "staunen" });
  Al.handyHalten(ich, Fg.handPos, Fg.kopfPos);
  kamera.fahrt(q, loc(R, 3.2, 4.6, 6.0), loc(R, 2.6, 4.3, 5.2), loc(R, 0, 3.0, -0.6)); licht(0.6, "#fff0dc", 0.4, "#ffe0c0"); });
// 1 Klassenzimmer: Lehrer schreibt an die Tafel
sh(E[1] + 0.1, (t, q) => { const R = Al.KLASSE; Al.raumlicht(R);
  lehrer.visible = true; lehrer.position.copy(loc(R, -3.6, 0, -5.4)); lehrer.rotation.y = Math.PI * 0.85; Fg.pose(lehrer, { armR: 2.3, armRz: 0.2, ges: "reden" });
  Al.schreibe(R.tafel, ["STROM = ?"], { anteil: q * 1.4, kreide: true, font: "700 230px 'Inter Display', sans-serif" });
  kind2.visible = true; kind2.position.set(R.plaetze[4].x, 0, R.plaetze[4].z - 0.2); kind2.rotation.y = Math.PI; Fg.pose(kind2, { sitz: 1, ges: "staunen" }); kind2.position.y = -0.05;
  kamera.fahrt(q, loc(R, 3.5, 4.4, 6.2), loc(R, 2.8, 4.2, 5.2), loc(R, -0.5, 3.6, -5)); licht(0.6, "#fff4e0", 0.4, "#e0f0ff"); });
// 2 Über die Schulter: Handy zeigt die Jagd
const schulter = (t, q) => { const R = Al.KUECHE; Al.raumlicht(R); handyFilm(t); ich.visible = true; ich.position.copy(loc(R, 0, 0, -2.4)); ich.rotation.y = 0;
  Fg.pose(ich, { armR: 1.45, armRz: -0.3, kopfNeig: 0.3, ges: "angst" }); const kam = Fg.kopfPos(ich).add(V(0.9, 0.5, -1.4));
  Al.handyHalten(ich, Fg.handPos, Fg.kopfPos, { zu: kam });   // Handy zur Kamera gedreht → Flugbahn ins Handy ist frei
  return kam; };
sh(E[2] + 0.1, (t, q) => { const p = schulter(t, q); blick(p, Al.handy.position); B.Wt.cam.fov = 50; licht(0.6, "#fff0dc", 0.4); });
// 3 Flug ins Handy
sh(E[3] + 0.1, (t, q) => { const p = schulter(t, q); kamera.insHandy(q, p, 50); licht(0.6, "#fff0dc", 0.4); });
// 4 In der Handy-Welt
sh(E[4] + 0.1, (t, q) => { handyFilm(t); kamera.imHandy(); licht(1.4, "#ffd8b0", 1.0); });
// 5 Omas Wohnzimmer: Fernseher läuft, Oma bestellt auf dem Handy
sh(E[5] + 0.1, (t, q) => { const R = Al.STUBE; Al.raumlicht(R); handyFilm(t); Al.fernseherAn();
  oma.visible = true; oma.position.copy(loc(R, 0.8, -0.05, -3.4)); oma.rotation.y = 0; Fg.pose(oma, { sitz: 1, armR: 1.2, armRz: -0.3, kopfNeig: 0.3, ges: "lachen" });
  kamera.fahrt(q, loc(R, -2.6, 4.4, 4.6), loc(R, -2.0, 4.1, 3.6), loc(R, 0.8, 2.9, -2.6)); Al.handyHalten(oma, Fg.handPos, Fg.kopfPos, { zu: Wt.cam.position.clone() });
  Al.handySeite((x, w, h) => { x.fillStyle = "#ffffff"; x.fillRect(0, 0, w, h); x.fillStyle = "#ff7a2a"; x.fillRect(0, 0, w, 150); x.fillStyle = "#fff"; x.font = "900 64px 'Inter Display', sans-serif"; x.textAlign = "center"; x.fillText("LATERNEN-SHOP", w / 2, 98);
    x.fillStyle = "#ffe8a0"; x.beginPath(); x.ellipse(w / 2, 520, 170, 220, 0, 0, 7); x.fill(); x.fillStyle = "#ff9a3a"; x.beginPath(); x.ellipse(w / 2, 520, 120, 170, 0, 0, 7); x.fill();
    x.fillStyle = "#222"; x.font = "900 70px 'Inter Display', sans-serif"; x.fillText("1000 Stück", w / 2, 880); x.fillStyle = "#e8302a"; x.font = "900 110px 'Inter Display', sans-serif"; x.fillText("9,99 €", w / 2, 1010);
    x.fillStyle = "#2ab04a"; x.fillRect(80, 1090, w - 160, 120); x.fillStyle = "#fff"; x.font = "900 64px 'Inter Display', sans-serif"; x.fillText("KAUFEN", w / 2, 1172); }, "shop");
  kamera.fahrt(q, loc(R, -2.6, 4.4, 4.6), loc(R, -2.0, 4.1, 3.6), loc(R, 0.8, 2.9, -2.6)); licht(0.6, "#ffe8d0", 0.4, "#f0d0ff"); });
// 6 Platz am Tag: alle schauen auf den Großbildschirm
sh(E[6] + 0.1, (t, q) => { Wt.U.uTag.value = 1; Wt.hemi.intensity = 1.2; Wt.hemi.color.set("#cfe4ff"); Wt.hemi.groundColor.set("#8a8070");
  Al.videowand.visible = true; Al.videowand.position.set(-14, 0, -40); Al.videowand.rotation.y = 0.2; Al.videowand.scale.setScalar(1.6);
  Al.handyBlick(V(14, 6, 60), V(0, 3, 20), 50); papa.visible = true; papa.position.set(0, 0, 22); papa.rotation.y = 0.6; Fg.pose(papa, { armR: 2.6, ges: "lachen" });
  Z_.menge = { armeHoch: (p) => 0, licht: 1, dz: 6 }; Z_.zaehler = { wert: B.zaehlen(t, Z[6], E[6], 0, 146376), farbe: "gruen" }; Z_.plus = { text: "+600 €", t0: Z[6] + 0.8 };
  kamera.fahrt(q, V(0, 7, 34), V(0, 9, 30), V(-14, 12, -40), V(-14, 14, -40), 55); licht(1.6, "#fff4e0", 1.0, "#ffffff"); });
// 7 Ballons + Regenbogen
sh(DAUER + 1, (t, q) => { Wt.U.uTag.value = 1; Wt.hemi.intensity = 1.2; Wt.hemi.color.set("#cfe4ff"); Al.regenbogen.visible = true; Al.regenbogen.position.set(0, 30, -160); Al.regenbogen.scale.setScalar(1.2);
  Al.ballonsSetzen(t, true, { x: 0, z: -10, t0: Z[7] - 0.5 }); Z_.zaehler = { wert: -50000, farbe: "rot" }; Al.geldSetzen(t, true, { x: 0, y: 6, z: 10, t0: Z[7] - 0.2, kraft: 5 }); Z_.menge = { armeHoch: () => 1, licht: 1, dz: 0 };
  kamera.fahrt(q, V(0, 5, 30), V(0, 6, 26), V(0, 14, -40), V(0, 18, -40), 60); licht(1.6, "#fff4e0", 1.0, "#ffffff"); });

B.start({ grund: (t) => {} });
