// Vorrat 02 „Geld fürs Schlafen“ – eigenständige Folge (Story-Richtung „Paradox-Komödie“).
// Neue Elemente: Geld-Zähler grün/rot, fliegende Scheine, Goldvilla + Pool + Liegestuhl, Sportwagen, „Zzz“ über dem Kopf,
// Krankenhaus als Schlafamt mit Anzeige „0 %“, Handy-Nachricht, Stromausfall-Welle durch die Stadt.
import * as B from "../folge.js";
import * as O from "../objekte.js";
const { V, sh, blick, licht, kamera, Fg, Al, Rq, Wt, Z_ } = B;
await B.laden(); const { Z, E, DAUER, wz } = B.F;

const S = { struktur: true };
const ich = Fg.figur({ haut: "#f0c8a0", hemd: "#e8a020", hose: "#2a3a5a", haare: "#5a3418", frisur: "strubbel", kapuze: true, skala: 0.78, schuhe: "#e8e8e8", ...S });
const papa = Fg.figur({ haut: "#d89a6a", hemd: "#3a6ac8", hose: "#2a2a30", haare: "#3a2414", frisur: "kurz", skala: 1.1, ...S });
const mama = Fg.figur({ haut: "#e8b890", hemd: "#e85a7a", hose: "#3a3a5a", haare: "#7a3a1a", frisur: "zopf", skala: 1.0, ...S, muster: { hemd: "punkte" } });
const oma = Fg.figur({ haut: "#f2d0b0", hemd: "#8a4a6a", stoff: true, hose: "#4a3a4a", haare: "#e0e0e0", frisur: "dutt", brille: true, schal: "#c8a050", skala: 0.95, ...S });
const opa = Fg.figur({ haut: "#f0c8a8", hemd: "#f4e8c8", jacke: "#e8c040", hose: "#3a3a40", haare: "#e8e8e8", frisur: "glatze", sonnenbrille: true, goldkette: true, skala: 1.0, ...S });
const nachbar = Fg.figur({ haut: "#c88a5a", hemd: "#5ab8e8", hose: "#4a4a52", haare: "#2a1a10", frisur: "kurz", skala: 1.05, ...S, muster: { hemd: "streifen" } });
const lehrer = Fg.figur({ haut: "#e8b890", hemd: "#f4f4f4", jacke: "#2ab0a0", hose: "#c8a878", haare: "#6a4a2a", brille: true, skala: 1.05, ...S });
const k1 = Fg.figur({ haut: "#8a5a3a", hemd: "#3ab88a", hose: "#3a3a5a", haare: "#1a1a1a", frisur: "kurz", skala: 0.78, ...S });
const k2 = Fg.figur({ haut: "#f0d0b0", hemd: "#8a5ae8", hose: "#2a3a5a", haare: "#c88a3a", frisur: "zopf", skala: 0.76, ...S });
const k3 = Fg.figur({ haut: "#e0b090", hemd: "#e8603a", hose: "#2a2a3a", haare: "#4a2a1a", frisur: "strubbel", skala: 0.77, ...S });
const aerztin = Fg.figur({ haut: "#d8a070", hemd: "#f4f8f8", jacke: "#ffffff", hose: "#4a8ac8", haare: "#1a1a1a", frisur: "dutt", brille: true, skala: 1.0, ...S });

// Kulissen-Teile für diese Folge (Objekte aus der Bibliothek)
const VP = Al.VORSTADT.pos;
const stuhl2 = O.liegestuhl({ farbe: "#e85a7a" }); stuhl2.position.copy(Al.BUNTDORF.pos(30, 0.28, 8)); stuhl2.rotation.y = -Math.PI / 2; Wt.scene.add(stuhl2);
const villa = O.goldvilla({ breite: 40 }); villa.position.copy(VP(0, 0.04, 214)); villa.rotation.y = Math.PI; Wt.scene.add(villa);
const pool = O.pool(); pool.position.copy(VP(-8, 0.06, 186)); Wt.scene.add(pool);
const stuhl = O.liegestuhl(); stuhl.position.copy(VP(4, 0.06, 184)); stuhl.rotation.y = Math.PI * 0.85; Wt.scene.add(stuhl);
const wagen = [0, 1, 2].map(i => { const w = O.sportwagen({ farbe: ["#e82a2a", "#f2c21a", "#2a8ae8"][i] }); w.position.copy(VP(-15.5, 0.06, 56 + i * 7)); w.rotation.y = Math.PI / 2; Wt.scene.add(w); return w; });
// Schlafamt: Schild über der Tür, Anzeige an der Wand
const KH = Al.KRANKENHAUS;
const schild = Al.leinwand(7, 1.3, { leuchtet: true }); schild.position.copy(KH.pos(0, 5.6, -6.74)); Wt.scene.add(schild);
Al.schreibe(schild, ["SCHLAFAMT"], { bg: "#2a6ae8", fg: "#ffffff", font: "900 150px 'Inter Display', sans-serif" });
const anzeige = Al.leinwand(3.6, 2.2, { leuchtet: true }); anzeige.position.copy(KH.pos(-4.4, 4.2, -6.74)); Wt.scene.add(anzeige);
const zeigeSchlaf = (wert) => Al.schreibe(anzeige, ["SCHLAF", wert], { bg: "#101820", fg: wert === "0 %" ? "#ff4a4a" : "#4ef07a", font: "900 230px 'Inter Display', sans-serif" });

const loc = (R, x, y, z) => V(R.g.position.x + x, y, R.g.position.z + z);
const zm = Rq.zimmer; const ZI = (x, y, z) => { zm.updateMatrixWorld(true); return V(x, y, z).applyMatrix4(zm.matrixWorld); };
const tag = () => { Wt.U.uTag.value = 1; Wt.U.uWolken.value = 1; Wt.hemi.intensity = 1.2; Wt.hemi.color.set("#cfe4ff"); Wt.hemi.groundColor.set("#8a8070"); };
const wisch = (t, i, d = 0) => { Wt.grade.uniforms.uWisch.value = B.wisch(t, Z[i] - 0.06 + d); };
const zzz = (f, o = {}) => Al.kopfzahl(f, "Zzz", { farbe: "#ffffff", groesse: 0.9, ...o });
const nahTief = (q, f, abst, seite = 0) => { f.updateMatrixWorld(true); const k = Fg.kopfPos(f); kamera.fahrt(q, f.localToWorld(V(seite, 3.4, abst)), f.localToWorld(V(seite * 0.85, 3.4, abst - 0.6)), V(k.x, k.y - 0.2, k.z), V(k.x, k.y - 0.2, k.z), 46); };
const rotNull = () => { Z_.zaehler = { wert: "0", farbe: "rot", vorzeichen: false }; };
const imBett = (f, ges, o = {}) => { f.visible = true; f.position.copy(ZI(-2.2, 2.35, 0.5)); f.rotation.set(0, Math.PI / 4 + Math.PI, 0); Fg.pose(f, { liegen: 1, ges, ...o }); };

// 0 Hook: Platz am Tag, der Nachbar schläft auf der Bank, Geld fliegt aus der Luft
sh(E[0] + 0.1, (t, q) => { tag(); stuhl2.updateMatrixWorld(true); nachbar.visible = true; nachbar.position.copy(stuhl2.localToWorld(V(0, 1.45, 3.2))); nachbar.rotation.set(0, stuhl2.rotation.y, 0); Fg.pose(nachbar, { liegen: 1, ges: "schlaf" }); const kopf0 = stuhl2.localToWorld(V(0, 1.7, -0.4)); Al.kopfzahl(kopf0.clone().add(V(0, 2.2, 0)), "Zzz", { farbe: "#ffffff", groesse: 0.9 });
  Al.geldSetzen(t, true, { x: kopf0.x, y: 5, z: kopf0.z, t0: 0.2, kraft: 3 }); Z_.zaehler = { wert: Math.round(B.zaehlen(t, 0.6, E[0], 0, 250)), farbe: "gruen" };
  kamera.fahrt(q, kopf0.clone().add(V(5.5, 5.0, 8.5)), kopf0.clone().add(V(4.4, 4.2, 7.0)), kopf0.clone().add(V(0, 2.4, 0)), kopf0.clone().add(V(0, 2.8, 0)), 54); licht(1.6, "#fff4e0", 1.0, "#ffffff"); });
// 1 Mittagsschlaf: Papa auf Omas Sofa, +10 €
sh(E[1] + 0.06, (t, q) => { const R = Al.STUBE; Al.raumlicht(R, 9); papa.visible = true; papa.position.copy(loc(R, 2.35, 1.85, -3.4)); papa.rotation.set(0, Math.PI / 2, 0); Fg.pose(papa, { liegen: 1, ges: "schlaf" }); Al.kopfzahl(loc(R, -1.2, 3.3, -3.0), "Zzz", { farbe: "#ffffff", groesse: 0.8 });
  Z_.zaehler = { wert: Math.round(B.zaehlen(t, wz("zehn", 1) - 0.3, wz("zehn", 1) + 0.2, 0, 10)), farbe: "gruen" }; Z_.plus = { text: "+10 €", t0: wz("zehn", 1) };
  kamera.fahrt(q, loc(R, -2.6, 4.8, 1.6), loc(R, -2.2, 4.6, 1.0), loc(R, -1.2, 2.4, -3.4), loc(R, -1.2, 2.4, -3.4), 50); licht(0.6, "#ffe8d0", 0.4, "#f0d0ff"); wisch(t, 1); });
// 2 Eine Nacht: Mama im Bett, Wecker 07:00, +100 €
sh(E[2] + 0.06, (t, q) => { imBett(mama, "schlaf"); zzz(mama); Rq.weckerZeichnen(t < wz("hundert", 2) ? "06:59" : "07:00"); Rq.ZIMMER.licht.intensity = 10;
  Z_.zaehler = { wert: Math.round(B.zaehlen(t, wz("hundert", 2) - 0.3, wz("hundert", 2) + 0.3, 10, 110)), farbe: "gruen" }; Z_.plus = { text: "+100 €", t0: wz("hundert", 2) };
  kamera.fahrt(q, ZI(3.5, 5.5, -3.5), ZI(3.0, 5.0, -2.8), ZI(-1, 2.0, 2.5), ZI(-1, 2.0, 2.5), 55); licht(0.5, "#ffc080", 0.4); wisch(t, 2); });
// 3 Den ganzen Winter: Opa auf dem Liegestuhl, Zähler rast zur Million, Geldregen
const opaLiegt = (t) => { stuhl.updateMatrixWorld(true); opa.visible = true; opa.position.copy(stuhl.localToWorld(V(0, 1.35, 2.3))); opa.rotation.set(0, stuhl.rotation.y, 0); Fg.pose(opa, { liegen: 1, ges: "schlaf" }); };
const opaKopf = () => stuhl.localToWorld(V(0, 1.6, -1.2));
sh(E[3] + 0.06, (t, q) => { tag(); opaLiegt(t); Al.kopfzahl(opaKopf().add(V(0, 2.2, 0)), "Zzz", { farbe: "#ffffff" }); const tm = wz("millionär", 3);
  Z_.zaehler = { wert: Math.round(B.zaehlen(t, Z[3] + 0.6, tm + 0.2, 110, 1000000)), farbe: "gruen" }; Z_.plus = { text: "MILLIONÄR!", t0: tm, farbe: "gelb" };
  Al.geldSetzen(t, true, { x: VP(4, 0, 184).x, y: 9, z: VP(4, 0, 184).z, t0: tm - 0.3, kraft: 6 });
  kamera.fahrt(q, VP(13, 6.5, 176), VP(11, 5.8, 178), opaKopf(), opaKopf(), 50); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 3); });
// 4 Opa wacht auf: goldene Villa
sh(wz("jetzt", 4) - 0.1, (t, q) => { tag(); opaLiegt(t); Fg.pose(opa, { liegen: 1, ges: t > Z[4] + 1.5 ? "lachen" : "schlaf" }); const k = opaKopf(); kamera.fahrt(q, k.clone().add(V(2.2, 3.4, 3.2)), k.clone().add(V(1.8, 3.0, 2.6)), k, k, 46); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 4); });
sh(E[4] + 0.06, (t, q) => { tag(); opa.visible = true; opa.position.copy(VP(2, 0.06, 176)); opa.rotation.set(0, Math.PI, 0); Fg.pose(opa, { ges: "lachen", armR: 2.7, armRz: 0.3 * Math.sin(t * 8) });
  kamera.fahrt(q, VP(5, 4.2, 162), VP(4, 5.0, 164), VP(1, 6, 200), VP(1, 9, 205), 58); licht(1.6, "#fff4e0", 1.0, "#ffffff"); });
// 5 Nachbar schläft im Stehen, drei Sportwagen
const nachbarSteht = (t) => { tag(); nachbar.visible = true; nachbar.position.copy(VP(-9.2, 0.3, 66)); nachbar.rotation.set(0, Math.PI / 2, 0); Fg.pose(nachbar, { ges: "schlaf", neig: 0.08 * Math.sin(t * 1.4), kopfNeig: 0.35 }); zzz(nachbar); };
sh(wz("darum", 5) - 0.1, (t, q) => { nachbarSteht(t); kamera.vorFigur(q, nachbar, 6.8, 6.0, 1.0, 1.4, 46); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 5); });
sh(E[5] + 0.2, (t, q) => { nachbarSteht(t); kamera.fahrt(q, VP(2, 5.5, 46), VP(1, 5, 50), VP(-14, 1.8, 62), VP(-14, 1.8, 64), 52); licht(1.6, "#fff4e0", 1.0, "#ffffff"); });
// 6 Und ich? Problem (Platz am Tag)
sh(E[6] + 0.2, (t, q) => { tag(); ich.visible = true; ich.position.copy(Al.BUNTDORF.pos(22, 0.28, -6)); ich.rotation.y = -Math.PI / 2 + 0.3; Fg.pose(ich, { ges: t > wz("problem", 6) - 0.3 ? "schwitzen" : "ernst", armL: 0.5, armR: 0.5, armLz: 0.4, armRz: -0.4 });
  kamera.vorFigur(q, ich, 6.2, 5.4, -1.0, 0.6, 46); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 6); });
// 7 Ich kann nicht einschlafen: im Bett, Augen weit offen, Wecker 03:00
sh(E[7] + 0.4, (t, q) => { imBett(ich, "staunen"); Rq.weckerZeichnen("03:00"); Rq.ZIMMER.licht.intensity = 4; Rq.ZIMMER.schirm.material = Rq.ZIMMER.schirmAus;
  kamera.fahrt(q, ZI(-1.0, 5.6, 2.2), ZI(-1.3, 5.3, 2.6), ZI(-2.2, 2.5, 3.9), ZI(-2.2, 2.5, 3.9), 52); licht(0.25, "#8aa0ff", 0.4); wisch(t, 7); });
// 8 Versuch eins: Schäfchen zählen – Zahl über dem Kopf rast hoch
sh(E[8] + 0.06, (t, q) => { imBett(ich, t > wz("zehntausend", 8) ? "muede" : "staunen"); Rq.ZIMMER.licht.intensity = 4; Rq.ZIMMER.schirm.material = Rq.ZIMMER.schirmAus;
  const n = Math.round(B.zaehlen(t, wz("schäfchen", 8), wz("zehntausend", 8) + 0.4, 1, 10000)); Al.kopfzahl(ich, n.toLocaleString("de-DE") + " 🐑", { farbe: "#ffffff", groesse: 1.0 });
  Rq.weckerZeichnen(t < Z[8] + 2 ? "03:10" : t < Z[8] + 3.5 ? "04:40" : "05:58"); if (t > wz("zehntausend", 8)) rotNull();
  kamera.fahrt(q, ZI(-0.6, 6.4, 1.6), ZI(-0.9, 6.0, 2.0), ZI(-2.2, 3.4, 3.6), ZI(-2.2, 3.6, 3.6), 56); licht(0.35, "#8aa0ff", 0.4); wisch(t, 8); });
// 9 Papa schläft nebenan (Sofa), +100 € für ihn
sh(E[9] + 0.06, (t, q) => { const R = Al.STUBE; Al.raumlicht(R, 3, "#8aa0ff"); papa.visible = true; papa.position.copy(loc(R, 2.35, 1.85, -3.4)); papa.rotation.set(0, Math.PI / 2, 0); Fg.pose(papa, { liegen: 1, ges: "schlaf" }); Al.kopfzahl(loc(R, -1.2, 3.3, -3.0), "Zzz", { farbe: "#ffffff", groesse: 0.8 });
  Z_.zaehler = { wert: 100, farbe: "gruen" }; Z_.plus = { text: "+100 € FÜR PAPA", t0: wz("hundert", 9) };
  kamera.fahrt(q, loc(R, -2.6, 4.8, 1.6), loc(R, -2.2, 4.6, 1.0), loc(R, -1.2, 2.4, -3.4), loc(R, -1.2, 2.4, -3.4), 50); licht(0.3, "#8aa0ff", 0.3); wisch(t, 9); });
// 10 Versuch zwei: Oma liest vor
const omaSofa = (t, schlaeft) => { const R = Al.STUBE; Al.raumlicht(R, 9); oma.visible = true; oma.position.copy(loc(R, 1.2, -0.05, -3.4)); oma.rotation.y = 0; Fg.pose(oma, { sitz: 1, ges: schlaeft ? "schlaf" : Fg.mund(t), armL: 1.1, armR: 1.1, armLz: 0.3, armRz: -0.3, kopfNeig: schlaeft ? 0.5 : 0.2 });
  ich.visible = true; ich.position.copy(loc(R, -1.2, -0.05, -3.4)); ich.rotation.y = 0.1; Fg.pose(ich, { sitz: 1, ges: schlaeft ? "staunen" : "froh" }); };
sh(E[10] + 0.06, (t, q) => { omaSofa(t, false); const R = Al.STUBE; kamera.fahrt(q, loc(R, -0.4, 4.4, 4.6), loc(R, -0.2, 4.1, 3.8), loc(R, 0, 2.9, -3)); licht(0.6, "#ffe8d0", 0.4, "#f0d0ff"); wisch(t, 10); });
// 11 Nach drei Stunden: Oma schnarcht, ich hellwach – 0 €
sh(wz("und", 11) - 0.1, (t, q) => { omaSofa(t, true); zzz(oma); Al.STUBE.g.updateMatrixWorld(true); kamera.vorFigur(q, oma, 6.2, 5.6, 0.6, 1.0, 46); licht(0.6, "#ffe8d0", 0.4, "#f0d0ff"); wisch(t, 11); });
sh(E[11] + 0.2, (t, q) => { omaSofa(t, true); zzz(oma); rotNull(); Fg.pose(ich, { sitz: 1, ges: "staunen" }); nahTief(q, ich, 6.0, -0.6); licht(0.6, "#ffe8d0", 0.4, "#f0d0ff"); });
// 12 Versuch drei: Mathe, ganz vorne
const klasse = (t, schlaf) => { const R = Al.KLASSE; Al.raumlicht(R); Al.schreibe(R.tafel, ["7 × 8 = ?"], { kreide: true, font: "700 240px 'Inter Display', sans-serif" });
  lehrer.visible = true; lehrer.position.copy(loc(R, -2.6, 0, -5.2)); lehrer.rotation.y = 0.25; Fg.pose(lehrer, { ges: schlaf ? "schlaf" : Fg.mund(t), armR: schlaf ? 0 : 1.6, kopfNeig: schlaf ? 0.5 : 0 });
  const sitzen = (f, p, ges) => { f.visible = true; f.position.set(R.plaetze[p].x, -0.05, R.plaetze[p].z - 0.2); f.rotation.y = Math.PI; Fg.pose(f, { sitz: 1, ges, kopfNeig: ges === "schlaf" ? 0.6 : 0 }); };
  sitzen(ich, 3, schlaf ? "staunen" : "froh"); sitzen(k1, 0, schlaf ? "schlaf" : "muede"); sitzen(k2, 6, schlaf ? "schlaf" : "muede"); sitzen(k3, 4, schlaf ? "schlaf" : "muede");
  if (schlaf) { zzz(lehrer); zzz(k1, { groesse: 0.7 }); zzz(k2, { groesse: 0.7 }); zzz(k3, { groesse: 0.7 }); } };
sh(E[12] + 0.06, (t, q) => { klasse(t, false); const R = Al.KLASSE; kamera.fahrt(q, loc(R, 4.4, 5.2, 5.0), loc(R, 4.0, 5.0, 4.2), loc(R, -0.8, 3.0, -4.0), loc(R, -0.8, 3.0, -4.0), 62); licht(0.6, "#fff4e0", 0.4, "#e0f0ff"); wisch(t, 12); });
// 13 Alle schlafen, sogar der Lehrer – nur ich nicht
sh(wz("nur", 13) - 0.1, (t, q) => { klasse(t, true); const R = Al.KLASSE; kamera.fahrt(q, loc(R, 0.6, 5.6, 6.4), loc(R, 0.4, 5.4, 5.8), loc(R, -0.6, 3.0, -3), loc(R, -0.6, 3.0, -3), 62); licht(0.6, "#fff4e0", 0.4, "#e0f0ff"); });
sh(E[13] + 0.2, (t, q) => { klasse(t, true); rotNull(); nahTief(q, ich, 6.0, 0.8); licht(0.6, "#fff4e0", 0.4, "#e0f0ff"); });
// 14 Zum Schlafamt
sh(E[14] + 0.2, (t, q) => { Al.raumlicht(KH, 12); zeigeSchlaf("…"); ich.visible = true; const p = KH.pos(1.0, 0, 4.4 - q * 3.2); ich.position.copy(p); ich.rotation.y = Math.PI; Fg.pose(ich, { lauf: 1, phase: t * 7, ges: "ernst" });
  kamera.fahrt(q, KH.pos(1.6, 4.2, 6.4), KH.pos(1.4, 4.2, 6.2), KH.pos(0.4, 4.6, -6), KH.pos(0.4, 4.6, -6), 64); licht(0.7, "#ffffff", 0.4, "#e0fff8"); wisch(t, 14); });
// 15 Ärztin untersucht – Anzeige „0 %“
const amt = (t) => { Al.raumlicht(KH, 12); ich.visible = true; ich.position.copy(KH.pos(-1, 2.15, -2.6)); ich.rotation.set(0, -Math.PI / 2, 0); Fg.pose(ich, { liegen: 1, ges: "ernst" });
  aerztin.visible = true; aerztin.position.copy(KH.pos(1.4, 0, -3.4)); aerztin.rotation.y = -0.2; Fg.pose(aerztin, { ges: Fg.mund(t), armR: 1.2, armRz: -0.3 });
  zeigeSchlaf(t >= wz("null", 15) ? "0 %" : "…"); KH.monitor.userData.zeichne?.(t); };
sh(wz("ergebnis", 15) - 0.1, (t, q) => { amt(t); kamera.fahrt(q, KH.pos(0.6, 5.0, 5.4), KH.pos(0.4, 4.8, 4.6), KH.pos(0.2, 3.2, -2.6), KH.pos(0.2, 3.2, -2.6), 58); licht(0.7, "#ffffff", 0.4, "#e0fff8"); wisch(t, 15); });
sh(E[15] + 0.3, (t, q) => { amt(t); if (t >= wz("null", 15)) rotNull(); kamera.fahrt(q, KH.pos(-3.4, 4.3, -1.6), KH.pos(-3.6, 4.2, -2.4), KH.pos(-4.4, 4.2, -6.74), KH.pos(-4.4, 4.2, -6.74), 50); licht(0.7, "#ffffff", 0.4, "#e0fff8"); });
// 16 Abends traurig auf dem Bett (warmes Abendlicht)
sh(E[16] + 0.3, (t, q) => { imBett(ich, "traurig"); Rq.ZIMMER.licht.intensity = 14; Rq.ZIMMER.licht.color.set("#ff9a5a"); Rq.weckerZeichnen("20:30");
  kamera.fahrt(q, ZI(-0.8, 5.8, 2.0), ZI(-1.1, 5.4, 2.4), ZI(-2.2, 2.5, 3.9), ZI(-2.2, 2.5, 3.9), 54); licht(0.5, "#ff9a5a", 0.5, "#a080ff"); wisch(t, 16); });
// 17 Die ganze Stadt schläft
sh(E[17] + 0.4, (t, q) => { const P0 = Al.BUNTDORF.pos; Wt.hemi.intensity = 0.45; kamera.fahrt(q, P0(0, 34, -150), P0(0, 30, -132), P0(0, 6, 40), P0(10, 6, 30), 56); licht(0.8, "#ffd8b0", 0.6); Rq.ZIMMER.licht.color.set("#ffc080"); wisch(t, 17); });
// 18 Eine Nachricht: Handy leuchtet am Fenster
const amFenster = (t, ges = "staunen") => { ich.visible = true; ich.position.copy(ZI(0.0, 2.15 - 2.15, -2.4)); ich.position.y = ZI(0, 0, 0).y; ich.rotation.set(0, Math.PI / 4 + Math.PI, 0);
  Fg.pose(ich, { armR: 1.45, armRz: -0.3, kopfNeig: 0.3, ges }); Rq.ZIMMER.licht.intensity = 3; Rq.ZIMMER.schirm.material = Rq.ZIMMER.schirmAus;
  Al.handySeite((x, w, h) => { x.fillStyle = "#101418"; x.fillRect(0, 0, w, h); x.fillStyle = "#1e2630"; x.fillRect(0, 0, w, 170); x.fillStyle = "#ffffff"; x.font = "900 58px 'Inter Display', sans-serif"; x.textAlign = "center"; x.fillText("BÜRGERMEISTER", w / 2, 110);
    x.fillStyle = "#2a8ae8"; const bx = 50, by = 260, bw = w - 100, bh = 760; x.beginPath(); x.roundRect(bx, by, bw, bh, 50); x.fill(); x.fillStyle = "#ffffff"; x.font = "800 56px 'Inter Display', sans-serif"; x.textAlign = "left";
    ["Du bist der einzige", "Mensch, der nachts", "wach ist.", "", "Ab heute bist du", "der NACHTWÄCHTER."].forEach((z, i) => x.fillText(z, bx + 40, by + 120 + i * 105)); }, "buergermeister");
  const kam = Fg.kopfPos(ich).add(V(0.9, 0.5, -1.4).applyAxisAngle(V(0, 1, 0), Math.PI / 4 + Math.PI)); Al.handyHalten(ich, Fg.handPos, Fg.kopfPos, { zu: kam }); return kam; };
sh(E[18] + 0.2, (t, q) => { amFenster(t); kamera.vorFigur(q, ich, 4.6, 4.0, 1.0, 0.4, 46); licht(0.35, "#8ab0ff", 0.4); Z_.vignette = 0.45; wisch(t, 18); });
// 19 Die Nachricht – über die Schulter aufs Handy
sh(E[19] + 0.2, (t, q) => { const kam = amFenster(t); blick(kam, Al.handy.position); Wt.cam.fov = 36 - q * 4; licht(0.35, "#8ab0ff", 0.4); Z_.vignette = 0.5; });
// 20 Laternen gehen aus: Blick aus dem Fenster auf die Straße, Stromausfall-Welle
const T_AUS = wz("moment", 20);
sh(wz("ging", 20) + 0.4, (t, q) => { amFenster(t, "staunen"); kamera.vorFigur(q, ich, 4.4, 3.9, -0.9, 0.3, 46); licht(0.35, "#8ab0ff", 0.4); Z_.vignette = 0.5; wisch(t, 20); });
sh(E[20] + 0.3, (t, q) => { Wt.U.uAus.value = T_AUS + 0.3; kamera.fahrt(q, V(40, 30, 70), V(38, 28, 64), V(0, 2, 0), V(-4, 2, -6), 56); licht(0.6, "#8ab0ff", 0.4); Z_.vignette = 0.5; });
// 21–23 Mitmach-Frage: ich am Fenster, draußen dunkel, nur das Handy leuchtet
sh(DAUER + 1, (t, q) => { Wt.U.uAus.value = T_AUS + 0.3; amFenster(t, "angst"); kamera.vorFigur(q, ich, 5.4, 4.8, 0.8, 0.6, 46); licht(0.3, "#8ab0ff", 0.4); Z_.vignette = 0.5; });

B.start({ grund: (t) => {}, frage: { zeile: 21, text: "Was soll ich tun?", karten: [["A", "👨", "Papa wecken", "papa"], ["B", "🚪", "Rausgehen", "rausgehen"], ["C", "📞", "Bürgermeister anrufen", "bürgermeister"]] } });
