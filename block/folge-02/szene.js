// Folge 2 „Krümel“ – setzt die Abstimmung zu Folge 1 um (A: Licht an). Unter dem Bett sitzt ein kleiner, ängstlicher Schatten.
// Neue Elemente: Kinderzimmer mit Lichterkette, KUECHE + Brötchen (neu in objekte.js), KLASSE mit Tafel (Wort verschwindet), STUBE mit
// Fernseher-Meldung, Geld-Zähler, Text über dem Kopf, Dach-Szene, Stromausfall-Welle, Riesen-Schatten über dem Kraftwerk, Polizei-Kreis + Suchscheinwerfer.
import * as B from "../folge.js";
import * as O from "../objekte.js";
const { V, sh, blick, licht, kamera, ease, easeIO, lerp, lerpV, Fg, Al, Rq, Wt, Z_ } = B;
await B.laden(); const { Z, E, DAUER, wz } = B.F;

const S = { struktur: true };
const ich = Fg.figur({ haut: "#f0c8a0", hemd: "#e8a020", hose: "#2a3a5a", haare: "#5a3418", frisur: "strubbel", kapuze: true, skala: 0.78, schuhe: "#e8e8e8", ...S });
const papa = Fg.figur({ haut: "#d89a6a", hemd: "#2a3a5a", aermel: "#2a3a5a", weste: "#ff7a1a", hose: "#2a2a30", haare: "#3a2414", helm: "#f0c020", skala: 1.1, ...S });
const oma = Fg.figur({ haut: "#f2d0b0", hemd: "#8a4a6a", stoff: true, hose: "#4a3a4a", haare: "#e0e0e0", frisur: "dutt", brille: true, schal: "#c8a050", skala: 0.95, ...S });
const lehrer = Fg.figur({ haut: "#e8b890", hemd: "#f4f4f4", jacke: "#2ab0a0", hose: "#c8a878", haare: "#6a4a2a", brille: true, skala: 1.05, ...S });
const k1 = Fg.figur({ haut: "#8a5a3a", hemd: "#3ab88a", hose: "#3a3a5a", haare: "#1a1a1a", frisur: "kurz", skala: 0.78, ...S });
const k2 = Fg.figur({ haut: "#f0d0b0", hemd: "#8a5ae8", hose: "#2a3a5a", haare: "#c88a3a", frisur: "zopf", skala: 0.76, ...S });
const k3 = Fg.figur({ haut: "#e0b090", hemd: "#e8603a", hose: "#2a2a3a", haare: "#4a2a1a", frisur: "strubbel", skala: 0.77, propeller: true, ...S });

const cam = Wt.cam;
const loc = (R, x, y, z) => V(R.g.position.x + x, y, R.g.position.z + z);
const zm = Rq.zimmer; const ZI = (x, y, z) => { zm.updateMatrixWorld(true); return V(x, y, z).applyMatrix4(zm.matrixWorld); };
const wisch = (t, i, d = 0) => { Wt.grade.uniforms.uWisch.value = B.wisch(t, Z[i] - 0.06 + d); };
const tag = () => { Wt.U.uTag.value = 1; Wt.U.uWolken.value = 1; Wt.hemi.intensity = 1.2; Wt.hemi.color.set("#cfe4ff"); Wt.hemi.groundColor.set("#8a8070"); };
// Krümel: kleiner Schatten, schaut zur Kamera (nach blick() aufrufen)
const kruemel = (p, o = {}) => { const ry = (o.ry ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z)) + (o.dreh ?? 0); return B.schatten(0, p.x, p.z, ry, { y: p.y, g: o.g ?? 0.42, kriech: o.kriech ?? 0.3, augen: o.augen ?? 1 }); };
const imBett = (f, ges, o = {}) => { f.visible = true; f.position.copy(ZI(-2.2, 2.35, 0.5)); f.rotation.set(0, Math.PI / 4 + Math.PI, 0); Fg.pose(f, { liegen: 1, ges, ...o }); };
const zimmerHell = () => { Rq.ZIMMER.schirm.material = Rq.ZIMMER.schirmAn; Rq.ZIMMER.licht.intensity = 30; Rq.ZIMMER.licht.color.set("#ffe8c8"); };
const zimmerDunkel = () => { Rq.ZIMMER.schirm.material = Rq.ZIMMER.schirmAus; Rq.ZIMMER.licht.intensity = 0; };
const zimmerKette = () => { zimmerDunkel(); Rq.ZIMMER.lichterkette.visible = true; Rq.ZIMMER.licht.intensity = 7; Rq.ZIMMER.licht.color.set("#ffb060"); };
const UNTER = [0.15, 0.0, 0.9];   // Platz unter dem Bett (lokal im Zimmer), wie am Ende von Folge 1

// ---------- Ereignisse ----------
const T_AN = wz("angemacht", 0);                 // großes Licht an (ein einziges Umschalten, kein Flackern)
const T_AUS_LAMPE = wz("ausgemacht", 4);
const T_WEG = wz("weg", 8);                      // Brötchen verschwindet
const T_STROM = wz("viertel", 18) - 0.6;         // Stromausfall-Welle vom Kraftwerk
const T_AUGEN = wz("öffneten", 19);
const T_POLIZEI = Z[22];
// Dach: ein mittelhohes Haus südlich vom Platz mit Blick über den Platz zum Kraftwerk
const DACH = Wt.LOTS.filter(l => l.z > 70 && l.z < 140 && Math.abs(l.x) < 80 && l.h > 30 && l.h < 90).sort((a, b) => Math.abs(a.x) - Math.abs(b.x))[0];
const DY = DACH.h, DZ = DACH.z - DACH.d / 2 + 2.5, DX = DACH.x;
const RIESE = V(0, 0, -660);                     // Riesen-Schatten hinter dem Kraftwerk (Kühltürme 70 m)
const RG = 62;

// Frühstück: Brötchen auf Papas Platz
const KU = Al.KUECHE;
const bro = O.broetchen(); bro.position.copy(loc(KU, 0.9, 2.3, -0.3)); Wt.scene.add(bro);
// Fernseher-Meldung
const meldung = (betrag) => Al.handySeite((x, w, h) => { x.fillStyle = "#0c1a3a"; x.fillRect(0, 0, w, h); x.fillStyle = "#e8302a"; x.fillRect(0, 140, w, 170);
  x.fillStyle = "#fff"; x.textAlign = "center"; x.font = "900 96px 'Inter Display', sans-serif"; x.fillText("EILMELDUNG", w / 2, 258);
  x.font = "900 120px 'Inter Display', sans-serif"; x.fillStyle = "#ffe53a"; x.fillText(betrag, w / 2, 600); x.fillStyle = "#fff"; x.font = "800 74px 'Inter Display', sans-serif";
  x.fillText("für jeden", w / 2, 760); x.fillText("SCHATTEN", w / 2, 860); }, "meldung-" + betrag);

// ===== 0 Licht an: ich im Bett, dunkel → großes Licht
sh(wz("also", 0) - 0.05, (t, q) => { imBett(ich, "angst", { kopfDreh: 0.5 }); zimmerDunkel(); Rq.weckerZeichnen("02:13", false);
  kamera.fahrt(q, ZI(-0.6, 5.6, 2.0), ZI(-0.9, 5.3, 2.4), ZI(-2.2, 2.5, 3.9), ZI(-2.2, 2.5, 3.9), 52); licht(0.25, "#8aa0ff", 0.5); Wt.hemi.intensity = 0.3; });
sh(E[0] + 0.1, (t, q) => { const an = t >= T_AN; imBett(ich, an ? "staunen" : "angst", { armR: an ? 1.2 : 0.3 }); an ? zimmerHell() : zimmerDunkel(); Rq.weckerZeichnen("02:13", an);
  kamera.fahrt(q, ZI(3.6, 5.8, -3.0), ZI(3.2, 5.4, -2.4), ZI(-1.4, 2.2, 1.6), ZI(-1.4, 2.2, 1.6), 58); licht(an ? 0.6 : 0.2, an ? "#ffe8c8" : "#8aa0ff", 0.4); Wt.hemi.intensity = an ? 0.6 : 0.3; });
// ===== 1 Unter dem Bett: der Schatten – ein ganz kleiner
const unterBett = (t, q, von0, von1, o = {}) => { zimmerHell(); const b = ZI(...UNTER); kamera.fahrt(q, ZI(...von0), ZI(...von1), V(b.x, b.y + 0.45, b.z), V(b.x, b.y + 0.45, b.z), o.fov ?? 46);
  kruemel(V(b.x, b.y + 0.1, b.z), { g: 0.36, augen: o.augen ?? 1, kriech: 0.2, dreh: (o.zittern ?? 0) * Math.sin(t * 26) * 0.06 }); licht(0.5, "#ffe8c8", 0.6, "#c0a0ff"); Wt.hemi.intensity = 0.5; };
sh(wz("ein", 1) - 0.1, (t, q) => unterBett(t, q, [2.6, 0.6, -1.9], [2.2, 0.55, -1.4]));
sh(E[1] + 0.1, (t, q) => unterBett(t, q, [1.6, 0.5, -0.9], [1.35, 0.48, -0.6], { fov: 40 }));
// ===== 2 Er kneift die Augen zu und zittert
sh(E[2] + 0.1, (t, q) => unterBett(t, q, [1.35, 0.48, -0.55], [1.2, 0.46, -0.35], { augen: 0.12, zittern: 1, fov: 38 }));
// ===== 3 Mehr Angst als ich: ich schaue über die Bettkante
sh(E[3] + 0.15, (t, q) => { zimmerHell(); imBett(ich, t > wz("angst", 3) - 0.2 ? "traurig" : "staunen", { kopfDreh: 0.7 });
  kamera.fahrt(q, ZI(-0.8, 5.6, 2.0), ZI(-1.1, 5.3, 2.4), ZI(-2.2, 2.5, 3.9), ZI(-2.2, 2.5, 3.9), 50); licht(0.6, "#ffe8c8", 0.4); Wt.hemi.intensity = 0.5; wisch(t, 3); });
// ===== 4 Lampe aus, nur die Lichterkette
sh(wz("nur", 4) - 0.1, (t, q) => { const aus = t >= T_AUS_LAMPE; aus ? zimmerKette() : zimmerHell(); imBett(ich, "froh", { armL: 1.0, armLz: 0.3 }); Rq.weckerZeichnen("02:15", true);
  const b = ZI(...UNTER); kamera.fahrt(q, ZI(3.8, 6.4, -3.6), ZI(3.4, 6.2, -3.2), ZI(-1.4, 2.0, 1.2), ZI(-1.4, 2.2, 1.2), 62); kruemel(V(b.x, 0.1 + b.y, b.z), { g: 0.36, augen: aus ? 1 : 0.15 });
  licht(aus ? 0.3 : 0.6, aus ? "#ffb060" : "#ffe8c8", 0.4, "#a080ff"); Wt.hemi.intensity = aus ? 0.3 : 0.6; });
sh(E[4] + 0.1, (t, q) => { zimmerKette(); kamera.fahrt(q, ZI(0.4, 5.4, -1.0), ZI(0.2, 5.6, -0.6), ZI(-2.2, 6.2, 1.5), ZI(-2.2, 6.4, 1.5), 56); licht(0.3, "#ffb060", 0.4, "#a080ff"); Wt.hemi.intensity = 0.3; });
// ===== 5 Er kriecht langsam aufs Bett
const KR_BETT = [-0.9, 2.1, -1.4];
sh(E[5] + 0.1, (t, q) => { zimmerKette(); imBett(ich, "staunen"); const k = ease((t - Z[5] - 0.3) / (E[5] - Z[5] - 0.5)); const a = ZI(...UNTER), b = ZI(...KR_BETT);
  const p = lerpV(a, b, k); p.y = lerp(a.y, b.y, ease(k * 1.6 - 0.3)) + 0.05;
  kamera.fahrt(q, ZI(2.8, 4.4, -3.4), ZI(2.4, 4.6, -3.0), ZI(-0.6, 1.6, -0.4), ZI(-0.9, 2.2, -0.8), 54); kruemel(p, { g: 0.36, kriech: 0.8 }); licht(0.3, "#ffb060", 0.4, "#a080ff"); Wt.hemi.intensity = 0.3; wisch(t, 5); });
// ===== 6 Ich habe ihn Krümel genannt
sh(E[6] + 0.2, (t, q) => { zimmerKette(); imBett(ich, "lachen"); const b = ZI(...KR_BETT); b.y += 0.05;
  kamera.fahrt(q, ZI(1.4, 4.0, -3.6), ZI(1.2, 3.9, -3.3), ZI(-0.9, 2.8, -1.2), ZI(-0.9, 2.8, -1.2), 50); kruemel(b, { g: 0.36, kriech: 0.2 });
  if (t > wz("krümel", 6) - 0.1) Al.kopfzahl(b.clone().add(V(0, 0.2, 0)), "KRÜMEL", { farbe: "#ffe53a", groesse: 0.55, hoehe: 1.2 }); licht(0.3, "#ffb060", 0.4, "#a080ff"); Wt.hemi.intensity = 0.3; wisch(t, 6); });
// ===== 7 Am Morgen: Buntdorf, Krümel läuft hinter mir her
const P0 = Al.BUNTDORF.pos;
sh(E[7] + 0.1, (t, q) => { tag(); ich.visible = true; const z = -30 + (t - Z[7]) * 3.2; ich.position.copy(P0(6, 0.28, z)); ich.rotation.y = 0; Fg.pose(ich, { lauf: 1, phase: t * 8, ges: "froh" });
  const kp = P0(8.8, 0.3, z - 1.2); kamera.fahrt(q, P0(16, 4.2, z + 14), P0(14, 3.8, z + 12), P0(6, 1.8, z - 1), P0(6, 1.8, z), 50); kruemel(kp, { g: 0.5, kriech: 0.7, ry: 0 }); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 7); });
// ===== 8 Frühstück: Krümel knabbert Papas Brötchen an – weg
const kueche = (t, ges) => { Al.raumlicht(KU); papa.visible = true; papa.position.copy(loc(KU, 0.9, 0, -2.0)); papa.rotation.y = 0; Fg.pose(papa, { ges, armL: 0.3, armR: 0.3 });
  ich.visible = true; ich.position.copy(loc(KU, -2.9, 0, 1.2)); ich.rotation.y = 1.2; Fg.pose(ich, { ges: "froh" }); bro.userData.broetchen.visible = t < T_WEG; };
sh(wz("hat", 8) - 0.05, (t, q) => { kueche(t, Fg.mund(t)); kamera.fahrt(q, loc(KU, 3.4, 5.0, 5.0), loc(KU, 2.9, 4.8, 4.6), loc(KU, -0.4, 2.8, -0.4), loc(KU, -0.4, 2.8, -0.4), 60); licht(0.7, "#fff0dc", 0.4, "#ffe0c0"); wisch(t, 8); });
sh(E[8] + 0.15, (t, q) => { kueche(t, t > T_WEG ? "staunen" : "froh"); const p = loc(KU, 0.15, 2.32, -0.2); kamera.fahrt(q, loc(KU, -0.4, 3.7, 2.4), loc(KU, -0.2, 3.5, 2.0), loc(KU, 0.6, 2.5, -0.3), loc(KU, 0.6, 2.5, -0.3), 48);
  kruemel(p, { g: 0.3, kriech: t > T_WEG - 0.6 && t < T_WEG + 0.2 ? 1 : 0.3 }); licht(0.7, "#fff0dc", 0.4, "#ffe0c0"); });
// ===== 9 Papa sucht drei Minuten unter dem Tisch
sh(E[9] + 0.15, (t, q) => { Al.raumlicht(KU); bro.userData.broetchen.visible = false; papa.visible = true; papa.position.copy(loc(KU, -0.4, 0, 3.6)); papa.rotation.y = Math.PI + 0.15 * Math.sin(t * 2.5); Fg.pose(papa, { ges: "staunen", neig: 0.55, kopfNeig: 0.4, armL: 0.6, armR: 0.6 });
  const min = Math.min(3, Math.floor(B.zaehlen(t, Z[9] + 0.3, E[9], 0, 3.99))); Al.kopfzahl(papa, `0${min}:00`, { farbe: "#ffffff", groesse: 0.8 });
  kamera.fahrt(q, loc(KU, 1.4, 4.4, -4.5), loc(KU, 1.3, 4.3, -4.2), loc(KU, -0.4, 3.2, 3.0), loc(KU, -0.4, 3.2, 3.0), 62); licht(0.7, "#fff0dc", 0.4, "#ffe0c0"); wisch(t, 9); });
// ===== 10 Schule: Krümel isst das Wort an der Tafel
const KL = Al.KLASSE;
const klasse = (t, l) => { Al.raumlicht(KL); lehrer.visible = true; lehrer.position.copy(loc(KL, -3.6, 0, -5.0)); lehrer.rotation.y = l.ry ?? 0.3; Fg.pose(lehrer, l.pose);
  const sitzen = (f, p, ges) => { f.visible = true; f.position.set(KL.plaetze[p].x, -0.05, KL.plaetze[p].z - 0.2); f.rotation.y = Math.PI; Fg.pose(f, { sitz: 1, ges }); };
  sitzen(ich, 4, l.ich ?? "froh"); sitzen(k1, 2, l.kinder ?? "staunen"); sitzen(k2, 8, l.kinder ?? "staunen"); sitzen(k3, 5, l.kinder ?? "staunen"); k3.userData.propeller && (k3.userData.propeller.rotation.y = t * 6); };
const TAFEL = (anteil) => Al.schreibe(KL.tafel, ["SCHATTEN"], { kreide: true, anteil, font: "700 250px 'Inter Display', sans-serif" });
sh(wz("das", 10) - 0.05, (t, q) => { klasse(t, { pose: { ges: Fg.mund(t), armR: 1.4 } }); TAFEL(1); kamera.fahrt(q, loc(KL, 4.6, 5.6, 4.2), loc(KL, 4.0, 5.4, 3.6), loc(KL, -1.2, 3.4, -5), loc(KL, -1.2, 3.4, -5), 62); licht(0.6, "#fff4e0", 0.4, "#e0f0ff"); wisch(t, 10); });
sh(E[10] + 0.1, (t, q) => { klasse(t, { pose: { ges: "staunen", armR: 0.4 }, ry: 0.9 }); const k = ease((t - wz("tafel", 10)) / (E[10] - wz("tafel", 10) + 0.05)); TAFEL(1 - k);
  const x = lerp(2.6, -2.6, k); const p = loc(KL, x, 2.3, -6.45); kamera.fahrt(q, loc(KL, 1.0, 3.9, 2.4), loc(KL, 0.6, 3.8, 1.8), loc(KL, 0, 3.1, -6.5), loc(KL, 0, 3.1, -6.5), 56);
  kruemel(p, { g: 0.45, kriech: 0.9, ry: 0 }); licht(0.6, "#fff4e0", 0.4, "#e0f0ff"); });
// ===== 11 Der Lehrer schreibt es fünfmal neu
sh(E[11] + 0.15, (t, q) => { const n = Math.min(5, 1 + Math.floor((t - Z[11]) / ((E[11] - Z[11]) / 5))); const teil = ((t - Z[11]) / ((E[11] - Z[11]) / 5)) % 1;
  klasse(t, { pose: { ges: n >= 4 ? "schwitzen" : "ernst", armR: 2.3, armRz: 0.25 * Math.sin(t * 14) }, ry: Math.PI * 0.85, kinder: "lachen" }); TAFEL(n >= 5 ? Math.min(1, teil * 1.3) : Math.min(1, teil * 1.6) * (teil < 0.8 ? 1 : (1 - teil) * 5));
  Al.kopfzahl(lehrer, n + "×", { farbe: "#ffe53a", groesse: 0.9 }); kamera.fahrt(q, loc(KL, 2.8, 4.4, 2.0), loc(KL, 2.4, 4.3, 1.4), loc(KL, -2.2, 3.8, -5.6), loc(KL, -2.2, 3.8, -5.6), 54);
  kruemel(loc(KL, 3.4, 2.3, -6.45), { g: 0.45, ry: 0 }); licht(0.6, "#fff4e0", 0.4, "#e0f0ff"); wisch(t, 11); });
// ===== 12 Bei Oma: nur die Krümel vom Kuchen
const ST = Al.STUBE;
const stube = (t, o = {}) => { Al.raumlicht(ST, 10); oma.visible = true; oma.position.copy(loc(ST, 1.2, -0.05, -3.4)); oma.rotation.y = 0; Fg.pose(oma, { sitz: 1, ges: o.oma ?? "lachen", kopfNeig: o.omaNeig ?? 0.1, armL: 1.0, armR: 1.0, armLz: 0.3, armRz: -0.3, kopfDreh: o.omaDreh ?? 0 });
  ich.visible = true; ich.position.copy(loc(ST, -1.2, -0.05, -3.4)); ich.rotation.y = 0.1; Fg.pose(ich, { sitz: 1, ges: o.ich ?? "froh", kopfDreh: o.ichDreh ?? 0 }); };
sh(wz("deshalb", 12) - 0.1, (t, q) => { stube(t); const p = loc(ST, 1.0, 1.42, 0.65); kamera.fahrt(q, loc(ST, 2.4, 3.2, 3.2), loc(ST, 2.1, 3.0, 2.8), loc(ST, 0.6, 1.8, 0.3), loc(ST, 0.6, 1.8, 0.3), 42);
  kruemel(p, { g: 0.26, kriech: 0.4 + 0.4 * Math.sin(t * 5) }); licht(0.6, "#ffe8d0", 0.4, "#f0d0ff"); wisch(t, 12); });
sh(E[12] + 0.1, (t, q) => { stube(t); kamera.fahrt(q, loc(ST, -0.4, 5.4, 5.6), loc(ST, -0.2, 5.1, 5.0), loc(ST, 0, 2.8, -2.8), loc(ST, 0, 2.8, -2.8), 54); kruemel(loc(ST, 1.0, 1.42, 0.65), { g: 0.26, kriech: 0.2 }); licht(0.6, "#ffe8d0", 0.4, "#f0d0ff"); });
// ===== 13 Doch dann: Meldung im Fernsehen
sh(E[13] + 0.1, (t, q) => { stube(t, { oma: "staunen", ich: "staunen", omaDreh: -0.9, ichDreh: -0.9 }); meldung("1.000 €"); ST.tvSchirm.material = Al.HANDY.seite.material;
  kamera.fahrt(q, loc(ST, -3.4, 4.4, 2.4), loc(ST, -3.0, 4.2, 2.0), loc(ST, 4.0, 3.0, 0.6), loc(ST, 4.0, 3.0, 0.6), 54); licht(0.6, "#ffe8d0", 0.4, "#f0d0ff"); wisch(t, 13); });
// ===== 14 Tausend Euro für jeden Schatten – Zähler läuft hoch
sh(E[14] + 0.15, (t, q) => { stube(t, { oma: "staunen", ich: "angst", omaDreh: -0.9, ichDreh: -0.9 }); meldung("1.000 €"); ST.tvSchirm.material = Al.HANDY.seite.material;
  Z_.zaehler = { wert: Math.round(B.zaehlen(t, Z[14] - 0.1, wz("euro", 14) + 0.3, 0, 1000)), farbe: "gruen" }; Z_.plus = { text: "PRO SCHATTEN", t0: wz("schatten", 14), farbe: "gelb" };
  kamera.fahrt(q, loc(ST, 2.4, 3.4, 1.4), loc(ST, 3.4, 3.3, 1.2), loc(ST, 6.8, 3.2, 1.0), loc(ST, 6.8, 3.2, 1.0), 50); licht(0.6, "#ffe8d0", 0.4, "#f0d0ff"); });
// ===== 15 Oma schaut ganz lange auf meinen Schatten
sh(wz("auf", 15) - 0.1, (t, q) => { stube(t, { oma: "ernst", ich: "schwitzen", omaDreh: 0.7, omaNeig: 0.45 }); const kh = Fg.kopfPos(oma); kamera.fahrt(q, loc(ST, 3.4, 3.8, 1.6), loc(ST, 3.0, 3.7, 1.0), kh.clone().add(V(0, -0.3, 0)), kh.clone().add(V(0, -0.3, 0)), 44); licht(0.5, "#ffe8d0", 0.4, "#f0d0ff"); wisch(t, 15); });
sh(E[15] + 0.25, (t, q) => { stube(t, { oma: "ernst", ich: "schwitzen", omaDreh: 0.7, omaNeig: 0.45 }); const p = loc(ST, -1.6, 0.1, -1.9);
  kamera.fahrt(q, loc(ST, -4.2, 1.6, 0.6), loc(ST, -3.8, 1.5, 0.2), loc(ST, -1.4, 1.0, -2.2), loc(ST, -1.4, 1.0, -2.2), 50); kruemel(p, { g: 0.34, augen: 0.7 + 0.3 * Math.sin(t * 2) }); licht(0.5, "#ffe8d0", 0.4, "#f0d0ff"); });
// ===== 16 Nachts aufs Dach
const aufDach = (t, ges, o = {}) => { ich.visible = true; ich.position.set(DX - 1.2, DY, DZ); ich.rotation.y = Math.PI; Fg.pose(ich, { sitz: o.sitz ?? 0, ges, armL: o.armL ?? 0, armR: o.armR ?? 0, kopfNeig: o.kopfNeig ?? 0 }); };
const KP = () => V(DX + 1.0, DY + 0.02, DZ - 0.3);
sh(wz("aufs", 16) - 0.1, (t, q) => { aufDach(t, "froh", { armR: 2.6 }); kamera.luft(q, V(DX, DY + 2, DZ), 15, 12, DY + 9, DY + 6, 0.5, 0.2, 52); kruemel(KP(), { g: 0.42 }); licht(1.0, "#ffd8b0", 1.0); wisch(t, 16); });
sh(E[16] + 0.1, (t, q) => { aufDach(t, "froh", { armR: 2.6 }); kamera.fahrt(q, V(DX + 3.0, DY + 3.4, DZ + 10.5), V(DX + 2.6, DY + 3.6, DZ + 9.5), V(DX - 0.6, DY + 2.0, DZ - 4), V(DX - 0.6, DY + 3.0, DZ - 8), 54); kruemel(KP(), { g: 0.42 }); licht(1.0, "#ffd8b0", 1.0); });
// ===== 17 Er sollte die Sterne sehen
sh(E[17] + 0.2, (t, q) => { aufDach(t, "staunen", { kopfNeig: -0.5 }); kamera.fahrt(q, V(DX + 2.2, DY + 1.6, DZ + 7.5), V(DX + 2.0, DY + 1.7, DZ + 7.0), V(DX - 1.2, DY + 9, DZ - 30), V(DX - 1.2, DY + 13, DZ - 30), 58);
  kruemel(KP(), { g: 0.42, ry: Math.PI, dreh: 0 }); licht(0.8, "#ffd8b0", 1.0); wisch(t, 17); });
// ===== 18 Ein Viertel nach dem anderen geht aus (Welle vom Kraftwerk)
const strom = (t) => { Wt.U.uAus.value = t >= Z[18] - 0.5 ? T_STROM : 1e6; };
sh(E[18] + 0.15, (t, q) => { strom(t); kamera.fahrt(q, V(DX + 3, DY + 6, DZ + 10), V(DX + 2, DY + 7, DZ + 8), V(0, 20, -420), V(0, 24, -460), 50); aufDach(t, "angst"); kruemel(KP(), { g: 0.42, ry: Math.PI }); licht(0.5, "#8ab0ff", 0.6); wisch(t, 18); });
// ===== 19 Am Himmel öffnen sich zwei riesige Augen
const riese = (t, o = {}) => { const ry = Math.atan2(cam.position.x - RIESE.x, cam.position.z - RIESE.z); B.schatten(1, RIESE.x, RIESE.z, ry, { g: RG, kriech: 0.4, augen: o.augen ?? ease((t - T_AUGEN) / 0.5), y: 0 }); };
sh(wz("zwei", 19) - 0.1, (t, q) => { strom(t); kamera.fahrt(q, V(DX + 2, DY + 4, DZ + 8), V(DX + 1.6, DY + 4.4, DZ + 7), V(0, 50, -560), V(0, 70, -600), 52); aufDach(t, "angst"); kruemel(KP(), { g: 0.42, ry: Math.PI }); riese(t); licht(0.5, "#8ab0ff", 0.6); wisch(t, 19); });
sh(E[19] + 0.15, (t, q) => { strom(t); kamera.fahrt(q, V(70, 150, -300), V(60, 140, -330), V(0, 70, -640), V(0, 76, -650), 46); riese(t); licht(2.2, "#a088ff", 3.0, "#c070ff"); });
// ===== 20 Größer als das Kraftwerk
sh(E[20] + 0.15, (t, q) => { strom(t); kamera.fahrt(q, V(170, 12, -330), V(150, 14, -350), V(0, 55, -560), V(0, 62, -580), 58); riese(t, { augen: 1 }); licht(2.2, "#a088ff", 3.0, "#c070ff"); wisch(t, 20); });
// ===== 21 Krümel piepst – das ist seine Mama
sh(wz("ich", 21) - 0.1, (t, q) => { strom(t); aufDach(t, "staunen"); const k = KP(); kamera.fahrt(q, k.clone().add(V(1.4, 1.2, -2.6)), k.clone().add(V(1.2, 1.0, -2.2)), k.clone().add(V(0, 0.45, 0)), k.clone().add(V(0, 0.45, 0)), 44);
  kruemel(k, { g: 0.42, kriech: 0.2, augen: 0.8 + 0.2 * Math.sin(t * 3), dreh: 0.05 * Math.sin(t * 9) }); riese(t, { augen: 1 }); licht(0.6, "#8ab0ff", 0.6); wisch(t, 21); });
sh(E[21] + 0.15, (t, q) => { strom(t); aufDach(t, "traurig"); kamera.vorFigur(q, ich, 4.8, 4.2, 1.0, 0.4, 46); riese(t, { augen: 1 }); kruemel(KP(), { g: 0.42, ry: Math.PI }); licht(0.6, "#8ab0ff", 0.6); });
// ===== 22 Unten kommen die Polizeiautos mit allen Scheinwerfern
const suchen = (t) => Wt.suchkegel.forEach((k, i) => { k.visible = true; const a = V((i - 1.5) * 14, 2, -10 + (i % 2) * 20); const ziel = V(RIESE.x + Math.sin(t * 0.5 + i * 1.7) * 60, 60 + 20 * Math.sin(t * 0.4 + i), RIESE.z); k.userData.richte(a, ziel); });
sh(E[22] + 0.15, (t, q) => { strom(t); const an = t >= T_POLIZEI + 0.3; Rq.polizeiSetzen(t, an, true, 27, cam.position); suchen(t);
  kamera.fahrt(q, V(DX + 6, DY + 10, DZ + 14), V(DX + 4, DY + 12, DZ + 10), V(0, 2, 0), V(0, 14, -60), 56); riese(t, { augen: 1 }); licht(0.6, "#8ab0ff", 0.6); wisch(t, 22); });
// ===== 23–25 Mitmach-Frage: ich und Krümel auf dem Dach, hinten die riesigen Augen
sh(DAUER + 1, (t, q) => { strom(t); Rq.polizeiSetzen(t, true, true, 27, cam.position); suchen(t); aufDach(t, "angst"); kamera.fahrt(q, V(DX - 0.4, DY + 3.0, DZ + 8.0), V(DX - 0.5, DY + 3.2, DZ + 7.4), V(DX - 0.2, DY + 3.4, DZ - 10), V(DX - 0.2, DY + 4.0, DZ - 10), 58);
  riese(t, { augen: 1 }); kruemel(KP(), { g: 0.42, ry: Math.PI }); licht(0.6, "#8ab0ff", 0.6); Z_.vignette = 0.5; });

B.start({ grund: (t) => { Wt.U.uAus.value = 1e6; }, frage: { zeile: 23, text: "Was soll ich tun?", karten: [["A", "🫂", "Zu seiner Mama lassen", "mama"], ["B", "🙈", "Verstecken", "verstecken"], ["C", "👨", "Papa alles erzählen", "papa"]] } });
