// Vorrat 03 „Das leere Glas“ – eigenständige Folge (Story-Richtung „Herz“): Für jede gute Tat fliegt ein Stern in dein Glas.
// Der Hausmeister hat ein leeres Glas, alle halten ihn für geizig – dabei verschenkt er jede Nacht heimlich alle seine Sterne.
// Neue Elemente: Sternglas + fliegender Stern (objekte.js), Besen, Schuhe mit Löchern (figuren.js), Schule mit Schulhof im Buntdorf,
// Stern-Zähler oben (Z_.zaehler mit einheit ⭐), Krankenhaus mit Besuch, Buntdorf bei Nacht.
import * as B from "../folge.js";
import * as O from "../objekte.js";
const { V, sh, blick, licht, kamera, Fg, Al, Rq, Wt, Z_, THREE } = B;
await B.laden(); const { Z, E, DAUER, wz } = B.F;

const S = { struktur: true };
const ich = Fg.figur({ haut: "#f0c8a0", hemd: "#e8a020", hose: "#2a3a5a", haare: "#5a3418", frisur: "strubbel", kapuze: true, skala: 0.78, schuhe: "#e8e8e8", ...S });
const papa = Fg.figur({ haut: "#d89a6a", hemd: "#3a6ac8", hose: "#2a2a30", haare: "#3a2414", frisur: "kurz", skala: 1.1, ...S });
const oma = Fg.figur({ haut: "#f2d0b0", hemd: "#8a4a6a", stoff: true, hose: "#4a3a4a", haare: "#e0e0e0", frisur: "dutt", brille: true, schal: "#c8a050", skala: 0.95, ...S });
const hm = Fg.figur({ haut: "#e8bc98", hemd: "#5a7088", hose: "#4a5a6e", haare: "#9a9a9a", frisur: "kurz", skala: 1.05, schuhe: "#4a3a2e", schuhLoch: true, ...S });
const lehrer = Fg.figur({ haut: "#e8b890", hemd: "#f4f4f4", jacke: "#2ab0a0", hose: "#c8a878", haare: "#6a4a2a", brille: true, skala: 1.05, ...S });
const k1 = Fg.figur({ haut: "#8a5a3a", hemd: "#3ab88a", hose: "#3a3a5a", haare: "#1a1a1a", frisur: "kurz", skala: 0.78, ...S });
const k2 = Fg.figur({ haut: "#f0d0b0", hemd: "#8a5ae8", hose: "#2a3a5a", haare: "#c88a3a", frisur: "zopf", skala: 0.76, ...S });
const k3 = Fg.figur({ haut: "#e0b090", hemd: "#e8603a", hose: "#2a2a3a", haare: "#4a2a1a", frisur: "strubbel", skala: 0.77, ...S, muster: { hemd: "streifen" } });

const DP = Al.BUNTDORF.pos;
const loc = (R, x, y, z) => V(R.g.position.x + x, y, R.g.position.z + z);
const zm = Rq.zimmer; const ZI = (x, y, z) => { zm.updateMatrixWorld(true); return V(x, y, z).applyMatrix4(zm.matrixWorld); };
const KH = Al.KRANKENHAUS;

// ---- Kulissen-Teile (Bibliothek) ----
// Schule mit Schulhof westlich der Querstraße im Buntdorf; Eingang schaut nach +z
const schule = O.schule({ name: "GRUNDSCHULE BUNTDORF", banner: "WILLKOMMEN" }); schule.position.copy(DP(-70, 0.05, -34)); Wt.scene.add(schule);
const hof = new THREE.Mesh(new THREE.PlaneGeometry(44, 21).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#d8d2c6", roughness: 0.9 })); hof.position.copy(DP(-70, 0.07, -16.5)); Wt.scene.add(hof);
const SG = (x, y, z) => DP(-70 + x, y, -34 + z);                      // Schule lokal → Welt
// Glas des Hausmeisters auf der Fensterbank, Schild darüber
const glasHM = O.sternglas({ brett: true, n: 0 }); glasHM.position.copy(SG(8.4, 1.42, 7.55)); Wt.scene.add(glasHM);
const schildHM = Al.leinwand(4.2, 0.9, {}); schildHM.position.copy(SG(8.4, 5.0, 7.1)); Wt.scene.add(schildHM);
Al.schreibe(schildHM, ["HAUSMEISTER"], { bg: "#3a4a5e", fg: "#ffffff", font: "900 120px 'Inter Display', sans-serif" });
const besen = O.besen(); Wt.scene.add(besen);
// mein Glas auf der Fensterbank im Kinderzimmer
const glasIch = O.sternglas({ brett: true, n: 11 }); Wt.scene.add(glasIch);
const glasIchSetzen = () => { zm.updateMatrixWorld(true); glasIch.position.copy(ZI(1.3, 2.62, -5.55)); glasIch.rotation.y = zm.rotation.y; };
// Omas volles Glas, Papas Glas, Klassenglas (mit Sprung)
const glasOma = O.sternglas({ n: 60 }); Wt.scene.add(glasOma);
const glasPapa = O.sternglas({ n: 40, brett: true }); Wt.scene.add(glasPapa);
const glasKlasse = O.sternglas({ n: 30, etikett: "3B", sprung: true }); Wt.scene.add(glasKlasse);
const kisten = [0, 1].map(i => { const k = O.geschenk({ farbe: ["#c8a070", "#b89060"][i] }); Wt.scene.add(k); return k; });
const stuhl = O.stuhl(); Wt.scene.add(stuhl);
// fliegende Sterne
const sterne = Array.from({ length: 6 }, () => { const s = O.stern({ groesse: 0.9 }); Wt.scene.add(s); return s; });
const sternFlug = (s, t, t0, t1, von, nach, bogen = 2) => { if (t < t0 || t > t1 + 0.05) { s.visible = false; return false; } const q = Math.min(1, (t - t0) / (t1 - t0)), e = q * q * (3 - 2 * q);
  s.visible = true; s.position.lerpVectors(von, nach, e); s.position.y += Math.sin(Math.PI * e) * bogen; s.lookAt(Wt.cam.position); s.rotateZ(t * 1.5); s.scale.setScalar(0.9 * (1 - 0.6 * Math.max(0, e - 0.8) / 0.2)); return q >= 1; };

const tag = () => { Wt.U.uTag.value = 1; Wt.U.uWolken.value = 1; Wt.hemi.intensity = 1.2; Wt.hemi.color.set("#cfe4ff"); Wt.hemi.groundColor.set("#8a8070"); };
const abend = () => { tag(); Wt.U.uAbend.value = 1; Wt.hemi.color.set("#ffc8a0"); Wt.hemi.intensity = 1.0; };
const morgen = () => { tag(); Wt.U.uAbend.value = 0.55; Wt.hemi.color.set("#ffe0c8"); Wt.hemi.intensity = 1.05; };
const nacht = () => { Wt.hemi.intensity = 0.75; Wt.hemi.color.set("#7a8ae0"); };
const wisch = (t, i, d = 0) => { Wt.grade.uniforms.uWisch.value = B.wisch(t, Z[i] - 0.06 + d); };
const sternZ = (wert, farbe = "gelb") => { Z_.zaehler = { wert: String(wert), farbe, einheit: " ⭐" }; };
const nah = (q, f, abst, seite = 0, h = 0) => { f.updateMatrixWorld(true); const k = Fg.kopfPos(f); kamera.fahrt(q, f.localToWorld(V(seite, 3.4 + h, abst)), f.localToWorld(V(seite * 0.85, 3.4 + h, abst - 0.6)), V(k.x, k.y - 0.2, k.z), V(k.x, k.y - 0.2, k.z), 46); };
const hmBesen = (t, fegen = true) => { const p = Fg.handPos(hm, true); besen.visible = true; hm.updateMatrixWorld(true);
  besen.position.copy(hm.localToWorld(V(0.3 + (fegen ? 0.5 * Math.sin(t * 3) : 0), 0, 1.6))); besen.rotation.set(0, hm.rotation.y, 0); besen.rotateX(-0.35); besen.position.y = 0.1; return p; };
const fegePose = (t, ges) => ({ ges, armR: 0.9, armL: 0.7, armRz: -0.2, armLz: 0.3, neig: 0.12, kopfNeig: 0.2 });

// 0 Hook: Straße am Tag, ich helfe einem Kind auf – ein Stern steigt über mir auf
const helfen = (t) => { tag(); k2.visible = true; k2.position.copy(DP(30, 0.28, 3.4)); k2.rotation.y = 0; Fg.pose(k2, { sitz: 1, ges: t > Z[0] + 1.4 ? "froh" : "weinen", armR: 1.2, armRz: -0.2 });
  ich.visible = true; ich.position.copy(DP(32.6, 0.28, 3.6)); ich.rotation.y = -Math.PI / 2; Fg.pose(ich, { ges: "froh", armR: 1.3, armRz: 0.1, neig: 0.15 }); };
sh(E[0] + 0.1, (t, q) => { helfen(t); const k = Fg.kopfPos(ich); const t0 = wz("stern", 0) - 0.4;
  if (t > t0) { const s = sterne[0]; s.visible = true; const e = Math.min(1, (t - t0) / 0.8); s.position.copy(k).add(V(0, 1.4 + 1.6 * (1 - (1 - e) ** 2), 0)); s.lookAt(Wt.cam.position); s.rotateZ(t * 1.5); s.scale.setScalar(0.6 + 0.4 * e); }
  Z_.plus = { text: "+1 ⭐", t0: wz("stern", 0), farbe: "gelb" };
  kamera.fahrt(q, DP(33.6, 5.4, 14.2), DP(33.2, 5.6, 13.2), DP(31.2, 2.2, 3.6), DP(31.2, 2.6, 3.6), 50); licht(1.6, "#fff4e0", 1.0, "#ffffff"); });
// 1 Er fliegt in dein Glas am Fenster (Kinderzimmer, Tag)
sh(E[1] + 0.1, (t, q) => { tag(); Rq.ZIMMER.licht.intensity = 8; const ziel = glasIch.userData.oben(); const an = sternFlug(sterne[0], t, Z[1] - 0.1, E[1] - 0.35, ZI(-0.6, 5.6, -10), ziel.clone().add(V(0, -0.3, 0)), 0.8);
  glasIch.userData.setze(an ? 12 : 11); sternZ(an ? 12 : 11);
  kamera.fahrt(q, ZI(-1.8, 4.3, -0.6), ZI(-1.2, 4.0, -1.4), ZI(0.8, 3.6, -5.8), ZI(1.1, 3.4, -5.8), 48); licht(0.9, "#fff4e0", 0.6, "#ffffff"); wisch(t, 1); });
// 2 Oma: zweihundert Sterne, strickt Mützen
sh(E[2] + 0.06, (t, q) => { const R = Al.STUBE; Al.raumlicht(R, 9); oma.visible = true; oma.position.copy(loc(R, 1.2, -0.05, -3.4)); oma.rotation.y = 0;
  Fg.pose(oma, { sitz: 1, ges: "froh", armL: 1.15 + 0.12 * Math.sin(t * 9), armR: 1.15 - 0.12 * Math.sin(t * 9), armLz: 0.35, armRz: -0.35, kopfNeig: 0.25 });
  glasOma.visible = true; glasOma.position.copy(loc(R, 2.9, 1.55, -3.0)); glasOma.scale.setScalar(1.0); sternZ(200);
  kamera.fahrt(q, loc(R, 0.6, 4.6, 3.8), loc(R, 1.0, 4.3, 3.0), loc(R, 1.9, 2.8, -3.3), loc(R, 1.9, 2.8, -3.3), 52); licht(0.6, "#ffe8d0", 0.4, "#f0d0ff"); wisch(t, 2); });
// 3 Papa: fünfzig, trägt Einkäufe
sh(E[3] + 0.06, (t, q) => { tag(); papa.visible = true; papa.position.copy(DP(2.5, 0.06, 66 - q * 3)); papa.rotation.y = Math.PI; Fg.pose(papa, { lauf: 1, phase: t * 6, ges: "froh", armL: 1.35, armR: 1.35, armLz: 0.15, armRz: -0.15 });
  papa.updateMatrixWorld(true); kisten.forEach((k, i) => { k.visible = true; k.position.copy(papa.localToWorld(V(0, 2.9 + i * 1.25, 2.0))); k.rotation.y = papa.rotation.y + i * 0.3; k.scale.setScalar(0.9); });
  sternZ(50); kamera.fahrt(q, DP(-2.6, 4.2, 54.5), DP(-2.8, 4.4, 53.5), DP(2.5, 3.6, 64), DP(2.5, 3.6, 62), 50); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 3); });
// 4 Ich: zwölf, stolz neben meinem Glas
sh(E[4] + 0.06, (t, q) => { tag(); Rq.ZIMMER.licht.intensity = 8; ich.visible = true; ich.position.copy(ZI(-0.4, 0, -4.2)); ich.rotation.set(0, zm.rotation.y + 0.25, 0);
  Fg.pose(ich, { ges: t > wz("stolz", 4) - 0.3 ? "lachen" : "froh", armL: 0.4, armLz: 0.9, armR: 0.4, armRz: -0.9 }); sternZ(12);
  kamera.fahrt(q, ZI(0.9, 3.6, 2.4), ZI(0.7, 3.5, 1.6), ZI(0.4, 2.8, -4.8), ZI(0.4, 2.8, -4.8), 50); licht(0.9, "#fff4e0", 0.6, "#ffffff"); wisch(t, 4); });
// 5 Nur einer hat keinen: der Hausmeister fegt den Schulhof
const hmFegt = (t, ges = "ernst", p = SG(6, 0.07, 14)) => { hm.visible = true; hm.position.copy(p); hm.rotation.y = 2.6; Fg.pose(hm, fegePose(t, ges)); hmBesen(t); };
const kinderHof = (t, zeigen) => { const sp = [[k1, -16, 18.5, 2.3], [k2, -13.5, 20, 2.2], [k3, -18.5, 21, 2.4]];
  sp.forEach(([f, x, z, ry]) => { f.visible = true; f.position.copy(SG(x, 0.07, z)); f.rotation.y = ry; Fg.pose(f, zeigen ? { ges: "lachen", armR: 1.5, armRz: 0.1, huepf: 0.15 * Math.abs(Math.sin(t * 7 + x)) } : { ges: "froh" }); }); };
sh(wz("hausmeister", 5) - 0.1, (t, q) => { tag(); hmFegt(t); kinderHof(t, false);
  kamera.fahrt(q, SG(26, 9, 36), SG(23, 8, 33), SG(0, 6, 4), SG(2, 5, 6), 56); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 5); });
sh(E[5] + 0.1, (t, q) => { tag(); hmFegt(t); kinderHof(t, false); kamera.vorFigur(q, hm, 7.5, 6.6, 1.2, 1.6, 46); licht(1.6, "#fff4e0", 1.0, "#ffffff"); });
// 6 Sein Glas ist leer
sh(E[6] + 0.3, (t, q) => { tag(); sternZ(0, "rot"); const g = glasHM.position; kamera.fahrt(q, g.clone().add(V(1.0, 2.4, 4.6)), g.clone().add(V(0.7, 1.9, 3.4)), g.clone().add(V(0, 0.9, 0)), g.clone().add(V(0, 0.9, 0)), 46); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 6); });
// 7 Alle sagen, er ist geizig: Kinder zeigen auf ihn und lachen
sh(E[7] + 0.1, (t, q) => { tag(); hmFegt(t, "traurig"); kinderHof(t, true); kamera.fahrt(q, SG(-24, 4.6, 26), SG(-23, 4.4, 24.5), SG(2, 3.4, 14), SG(4, 3.4, 14), 50); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 7); });
// 8 Und ich? Ich habe mitgelacht
const ichHof = (t, ges, zeigen = true) => { ich.visible = true; ich.position.copy(SG(-11.5, 0.07, 22.4)); ich.rotation.y = 2.3; Fg.pose(ich, zeigen ? { ges, armR: 1.5, armRz: 0.1 } : { ges }); };
sh(E[8] + 0.2, (t, q) => { tag(); hmFegt(t, "traurig"); kinderHof(t, true); ichHof(t, t > wz("mitgelacht", 8) - 0.3 ? "lachen" : "ernst"); nah(q, ich, 6.0, -1.0); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 8); });
// 9 Aber irgendwas war komisch (Hausmeister nah, ruhig)
sh(E[9] + 0.3, (t, q) => { tag(); hmFegt(t, "traurig"); Fg.pose(hm, { ...fegePose(t, "traurig"), armR: 0.6, armL: 0.5 }); besen.position.copy(hm.localToWorld(V(0.3, 0, 1.6))); besen.position.y = 0.1; nah(q, hm, 6.4, 0.8); licht(1.4, "#fff0e0", 0.8, "#ffffff"); Z_.vignette = 0.45; wisch(t, 9); });
// 10 Jeden Morgen todmüde (Morgenlicht)
sh(E[10] + 0.1, (t, q) => { morgen(); hmFegt(t, "muede", SG(-2, 0.07, 16)); nah(q, hm, 6.2, -1.0, 0.2); licht(1.2, "#ffd0a0", 0.8, "#ffe0c0"); wisch(t, 10); });
// 11 Schuhe mit Löchern, Husten
sh(wz("und", 11) - 0.1, (t, q) => { morgen(); hmFegt(t, "muede", SG(-2, 0.07, 16)); besen.visible = false; hm.updateMatrixWorld(true); const f = hm.localToWorld(V(0, 0.3, 0.8));
  kamera.fahrt(q, hm.localToWorld(V(1.4, 0.9, 4.2)), hm.localToWorld(V(1.0, 0.8, 3.4)), f, f, 44); licht(1.2, "#ffd0a0", 0.8, "#ffe0c0"); wisch(t, 11); });
sh(E[11] + 0.3, (t, q) => { morgen(); hm.visible = true; hm.position.copy(SG(-2, 0.07, 16)); hm.rotation.y = 2.6; const h = Math.sin(t * 9) > 0 ? 1 : 0;
  Fg.pose(hm, { ges: "kneifen", armR: 2.2, armRz: -0.5, neig: 0.12 + 0.06 * h, kopfNeig: 0.2 + 0.1 * h }); nah(q, hm, 6.0, -1.1); licht(1.2, "#ffd0a0", 0.8, "#ffe0c0"); });
// 12 Das Sternenglas der Klasse ist weg
const klasse = (t, gesK, zeigen) => { const R = Al.KLASSE; Al.raumlicht(R); Al.schreibe(R.tafel, ["STERNENGLAS", "WEG!"], { kreide: true, font: "700 170px 'Inter Display', sans-serif" });
  const sitzen = (f, p, ges) => { f.visible = true; f.position.set(R.plaetze[p].x, -0.05, R.plaetze[p].z - 0.2); f.rotation.y = Math.PI; Fg.pose(f, zeigen ? { sitz: 1, ges, armR: 1.4, armRz: 0.25 } : { sitz: 1, ges }); };
  sitzen(ich, 3, gesK); sitzen(k1, 0, gesK); sitzen(k2, 5, gesK); sitzen(k3, 4, gesK); };
sh(E[12] + 0.06, (t, q) => { klasse(t, "staunen", false); const R = Al.KLASSE; lehrer.visible = true; lehrer.position.copy(loc(R, -2.6, 0, -5.2)); lehrer.rotation.y = 0.25; Fg.pose(lehrer, { ges: "schreien", armR: 1.6, armRz: -0.3 });
  kamera.fahrt(q, loc(R, 4.4, 5.2, 5.0), loc(R, 4.0, 5.0, 4.2), loc(R, -0.8, 3.4, -4.6), loc(R, -0.8, 3.4, -4.6), 62); licht(0.6, "#fff4e0", 0.4, "#e0f0ff"); wisch(t, 12); });
// 13 Alle zeigen auf ihn – ich auch
const hmVorne = (ges) => { const R = Al.KLASSE; hm.visible = true; hm.position.copy(loc(R, 3.2, 0, -5.0)); hm.rotation.y = -0.3; Fg.pose(hm, { ges }); };
sh(wz("ich", 13) - 0.1, (t, q) => { klasse(t, "schreien", true); hmVorne("traurig"); const R = Al.KLASSE; kamera.fahrt(q, loc(R, -4.6, 5.0, 5.6), loc(R, -4.2, 4.8, 4.8), loc(R, 2.4, 3.4, -4.4), loc(R, 2.6, 3.4, -4.6), 58); licht(0.6, "#fff4e0", 0.4, "#e0f0ff"); wisch(t, 13); });
sh(E[13] + 0.3, (t, q) => { klasse(t, "ernst", true); hmVorne("traurig"); ich.updateMatrixWorld(true); const k = Fg.kopfPos(ich);
  kamera.fahrt(q, ich.localToWorld(V(-1.4, 3.0, 4.6)), ich.localToWorld(V(-1.2, 3.0, 4.0)), k, k, 46); licht(1.0, "#fff4e0", 0.5, "#e0f0ff"); });
// 14 Er sagt nichts und geht (Abend, Schulhof, von hinten)
sh(E[14] + 0.3, (t, q) => { abend(); hm.visible = true; hm.position.copy(SG(4 + q * 4.5, 0.07, 16 + q * 3)); hm.rotation.y = 0.95; Fg.pose(hm, { lauf: 0.6, phase: t * 4.5, ges: "traurig", kopfNeig: 0.35 });
  kamera.fahrt(q, SG(-4, 4.2, 19), SG(-3, 4.0, 19.5), SG(8, 3, 18), SG(12, 3, 20), 52); licht(1.0, "#ffb080", 0.8, "#c0a0ff"); Z_.vignette = 0.5; wisch(t, 14); });
// 15 Am nächsten Morgen liegt er auf dem Schulhof
const hmLiegt = () => { hm.visible = true; hm.position.copy(SG(-1, 0.32, 14)); hm.rotation.set(0, 1.2, 0); Fg.pose(hm, { liegen: 1, ges: "schlaf" });
  besen.visible = true; besen.position.copy(SG(1.8, 0.2, 15.5)); besen.rotation.set(0, 0.4, Math.PI / 2); };
sh(E[15] + 0.2, (t, q) => { morgen(); hmLiegt(); kamera.fahrt(q, SG(-8, 13, 26), SG(-7, 11, 24), SG(-2, 0.5, 12), SG(-2, 0.5, 12), 50); licht(1.2, "#ffd0a0", 0.8, "#ffe0c0"); wisch(t, 15); });
// 16 Keiner geht hin, nur ich (Kinder bleiben hinten, ich renne)
sh(wz("nur", 16) - 0.1, (t, q) => { morgen(); hmLiegt(); [[k1, -16, 22], [k2, -18, 23], [k3, -14, 23.5]].forEach(([f, x, z]) => { f.visible = true; f.position.copy(SG(x, 0.07, z)); f.rotation.y = 2.4; Fg.pose(f, { ges: "angst" }); });
  kamera.fahrt(q, SG(-24, 4.4, 30), SG(-23, 4.2, 28.6), SG(-6, 2, 16), SG(-5, 2, 16), 50); licht(1.2, "#ffd0a0", 0.8, "#ffe0c0"); wisch(t, 16); });
sh(E[16] + 0.3, (t, q) => { morgen(); hmLiegt(); ich.visible = true; ich.position.copy(SG(-10 + q * 6.5, 0.07, 20 - q * 4)); ich.rotation.y = 2.2; Fg.pose(ich, { renn: 1, phase: t * 9, ges: "angst" });
  kamera.fahrt(q, SG(-15, 3.6, 25), SG(-11, 3.4, 22), ich.position.clone().add(V(0, 2.4, 0)), SG(-3, 1.6, 15), 50); licht(1.2, "#ffd0a0", 0.8, "#ffe0c0"); });
// 17 Krankenhaus: Oma sitzt an seinem Bett
const zimmerKH = (t, gesOma = "traurig") => { Al.raumlicht(KH, 11); KH.monitor.userData.zeichne?.(t);
  hm.visible = true; hm.position.copy(KH.pos(-1, 2.15, 0.2)); hm.rotation.set(0, 0, 0); Fg.pose(hm, { liegen: 1, ges: "schlaf" });
  stuhl.visible = true; stuhl.position.copy(KH.pos(-4.0, 0, -2.4)); stuhl.rotation.y = Math.PI / 2;
  oma.visible = true; oma.position.copy(KH.pos(-3.8, 0.0, -2.4)); oma.rotation.y = Math.PI / 2; Fg.pose(oma, { sitz: 1, ges: gesOma, armR: 1.2, armRz: 0.1 }); };
sh(E[17] + 0.3, (t, q) => { zimmerKH(t); ich.visible = true; ich.position.copy(KH.pos(2.0, 0, 1.0)); ich.rotation.y = -Math.PI / 2 - 0.35; Fg.pose(ich, { ges: "traurig" });
  kamera.fahrt(q, KH.pos(5.0, 6.0, 5.4), KH.pos(4.6, 5.6, 4.8), KH.pos(-1.6, 2.4, -2.0), KH.pos(-1.6, 2.4, -2.0), 56); licht(0.7, "#ffffff", 0.4, "#e0fff8"); wisch(t, 17); });
// 18 Rückblick: Das Klassenglas hatte einen Sprung – er repariert es nachts
sh(E[18] + 0.3, (t, q) => { const R = Al.KLASSE; Al.raumlicht(R, 6, "#ffc890"); Wt.hemi.intensity = 0.3; hm.visible = true; const p = R.plaetze[4]; hm.position.set(p.x, -0.05, p.z - 0.2); hm.rotation.y = Math.PI; Fg.pose(hm, { sitz: 1, ges: "ernst", armL: 1.3, armR: 1.3, armLz: 0.35, armRz: -0.35, kopfNeig: 0.35 });
  glasKlasse.visible = true; hm.updateMatrixWorld(true); glasKlasse.position.copy(hm.localToWorld(V(0, 2.3, 2.1))); glasKlasse.position.y = 2.4; glasKlasse.rotation.y = 0; glasKlasse.userData.setze(30);
  if (glasKlasse.userData.klebeband) glasKlasse.userData.klebeband.visible = t > wz("repariert", 18) - 0.2;
  const g = glasKlasse.position; kamera.fahrt(q, g.clone().add(V(-1.6, 2.4, -3.6)), g.clone().add(V(-1.2, 2.0, -3.0)), g.clone().add(V(0, 0.6, 0)), g.clone().add(V(0, 0.6, 0)), 50); licht(0.35, "#ffc890", 0.4, "#8090ff"); Z_.vignette = 0.55; wisch(t, 18); });
// 19 Nachts verschenkt er heimlich seine Sterne (Buntdorf bei Nacht, Sterne fliegen zu den Fenstern)
sh(E[19] + 0.3, (t, q) => { nacht(); hm.visible = true; hm.position.copy(DP(-7.4, 0.3, 30 - q * 7)); hm.rotation.y = Math.PI; Fg.pose(hm, { lauf: 0.7, phase: t * 5, ges: "froh", armL: 2.4, armLz: 0.3 });
  const hand = Fg.handPos(hm, false); for (let i = 0; i < 4; i++) { const t0 = Z[19] + 0.6 + i * 0.75; sternFlug(sterne[i], t, t0, t0 + 1.1, hand.clone(), DP(-10.6, 6.6 + (i % 2) * 4, 26 - i * 3.2), 1.5); }
  kamera.fahrt(q, DP(1.5, 3.8, 14), DP(1.0, 4.4, 12), DP(-8, 5, 27), DP(-8, 6, 24), 56); licht(0.5, "#8aa0ff", 0.6, "#ffd080"); Z_.vignette = 0.5; wisch(t, 19); });
// 20 An alle, die traurig sind: ein Stern schwebt zu einem traurigen Kind in die Küche
sh(E[20] + 0.4, (t, q) => { const R = Al.KUECHE; Al.raumlicht(R, 5, "#8aa0ff"); Wt.hemi.intensity = 0.3; k2.visible = true; k2.position.copy(loc(R, 0, -0.05, 2.4)); k2.rotation.y = Math.PI;
  const da = t > E[20] - 0.6; Fg.pose(k2, { sitz: 1, ges: da ? "staunen" : "weinen", kopfNeig: da ? -0.2 : 0.35 });
  sternFlug(sterne[0], t, Z[20], E[20] - 0.5, loc(R, -3.5, 5.5, -5), loc(R, 0, 3.3, 0.4), 0.6); if (t > E[20] - 0.5) { const s = sterne[0]; s.visible = true; s.position.copy(loc(R, 0, 3.3 + 0.08 * Math.sin(t * 3), 0.4)); s.lookAt(Wt.cam.position); s.rotateZ(t * 1.5); s.scale.setScalar(0.5); }
  kamera.fahrt(q, loc(R, 1.8, 4.0, -3.6), loc(R, 1.4, 3.8, -3.0), loc(R, 0, 2.8, 1.6), loc(R, 0, 2.8, 1.6), 50); licht(0.35, "#8aa0ff", 0.4, "#ffd080"); Z_.vignette = 0.5; wisch(t, 20); });
// 21 Mein allererster Stern war von ihm: Glas am Fenster mit einem Stern (Nacht), dann ich weinend
sh(wz("war", 21) - 0.1, (t, q) => { Rq.ZIMMER.licht.intensity = 3; Rq.ZIMMER.schirm.material = Rq.ZIMMER.schirmAus; glasIch.userData.setze(1); sternZ(1);
  const g = glasIch.position; kamera.fahrt(q, ZI(0.2, 4.2, -1.4), ZI(0.5, 3.9, -2.2), g.clone().add(V(0, 0.9, 0)), g.clone().add(V(0, 0.8, 0)), 46); licht(0.35, "#8ab0ff", 0.4, "#ffd080"); Z_.vignette = 0.55; wisch(t, 21); });
sh(E[21] + 0.4, (t, q) => { Rq.ZIMMER.licht.intensity = 9; glasIch.userData.setze(1);
  ich.visible = true; ich.position.copy(ZI(-0.4, 0, -4.2)); ich.rotation.set(0, zm.rotation.y + 0.25, 0); Fg.pose(ich, { ges: "weinen", kopfNeig: 0.25 }); nah(q, ich, 5.6, -0.8); licht(0.6, "#8ab0ff", 0.5, "#ffd080"); Z_.vignette = 0.55; });
// 22–24 Mitmach-Frage: Krankenhaus, ich halte mein Glas mit zwölf Sternen, er schläft
sh(DAUER + 1, (t, q) => { zimmerKH(t, "froh"); ich.visible = true; ich.position.copy(KH.pos(2.4, 0, 1.0)); ich.rotation.y = 0.36; Fg.pose(ich, { ges: "traurig", armL: 1.25, armR: 1.25, armLz: 0.3, armRz: -0.3 });
  ich.updateMatrixWorld(true); glasIch.position.copy(ich.localToWorld(V(0, 0.9, 1.9))); glasIch.rotation.y = ich.rotation.y; glasIch.scale.setScalar(0.75); glasIch.userData.setze(12);
  kamera.fahrt(q, KH.pos(4.2, 4.6, 6.6), KH.pos(4.0, 4.5, 6.2), KH.pos(1.4, 4.4, -1.6), KH.pos(1.4, 4.4, -1.6), 62); licht(0.7, "#ffffff", 0.4, "#ffd080"); Z_.vignette = 0.45; });

B.start({ grund: (t) => { sterne.forEach(s => s.visible = false); besen.visible = false; glasOma.visible = glasPapa.visible = glasKlasse.visible = false; kisten.forEach(k => k.visible = false); stuhl.visible = false;
  glasIchSetzen(); glasIch.scale.setScalar(1); glasIch.userData.setze(12); glasHM.userData.setze(0); if (glasKlasse.userData.klebeband) glasKlasse.userData.klebeband.visible = false; },
  frage: { zeile: 22, text: "Was soll ich ihm sagen?", karten: [["A", "🙏", "Entschuldigung", "entschuldigung"], ["B", "💛", "Danke", "danke"], ["C", "⭐", "Meine 12 Sterne", "sterne"]] } });
