// Vorrat 04 „Lügen-Geld“ – eigenständige Folge nach Jonathans Storyline (24.11.): +100 $, wenn dich jemand anlügt, −500 $, wenn du lügst.
// Neue Elemente: Dollar-Konto oben (Z_.zaehler einheit „ $“), Koffer (objekte.js), Kinderbild an der Wand, verbrannter Kuchen,
// Haus mit Haustür bei Nacht im Buntdorf, Geldregen im Kinderzimmer.
import * as B from "../folge.js";
import * as O from "../objekte.js";
const { V, sh, blick, licht, kamera, Fg, Al, Rq, Wt, Z_, THREE } = B;
await B.laden(); const { Z, E, DAUER } = B.F;
// Englische Fassung (?sprache=en, 27.11.): deutsche Stichwörter → englische Wörter derselben Zeile
const EN = { hundert: "hundred", "fünfhundert": "five", plus: "plus", minus: "minus", zehntausend: "ten" };
const wz = (w, i) => B.F.wz(B.SPRACHE === "en" ? (EN[w] ?? w) : w, i);

const S = { struktur: true };
const ich = Fg.figur({ haut: "#f0c8a0", hemd: "#e8a020", hose: "#2a3a5a", haare: "#5a3418", frisur: "strubbel", kapuze: true, skala: 0.78, schuhe: "#e8e8e8", ...S });
const ichFrisur = Fg.figur({ haut: "#f0c8a0", hemd: "#e8a020", hose: "#2a3a5a", haare: "#ff5ab8", frisur: "dutt", kapuze: true, skala: 0.78, schuhe: "#e8e8e8", ...S });
const papa = Fg.figur({ haut: "#d89a6a", hemd: "#3a6ac8", hose: "#2a2a30", haare: "#3a2414", frisur: "kurz", skala: 1.1, ...S });
const mama = Fg.figur({ haut: "#e8b890", hemd: "#e85a7a", hose: "#3a3a5a", haare: "#7a3a1a", frisur: "zopf", skala: 1.0, ...S, muster: { hemd: "punkte" } });
const oma = Fg.figur({ haut: "#f2d0b0", hemd: "#8a4a6a", stoff: true, hose: "#4a3a4a", haare: "#e0e0e0", frisur: "dutt", brille: true, schal: "#c8a050", skala: 0.95, ...S });
const lehrer = Fg.figur({ haut: "#e8b890", hemd: "#f4f4f4", jacke: "#2ab0a0", hose: "#c8a878", haare: "#6a4a2a", brille: true, skala: 1.05, ...S });
const freund = Fg.figur({ haut: "#8a5a3a", hemd: "#3ab88a", hose: "#3a3a5a", haare: "#1a1a1a", frisur: "kurz", skala: 0.78, ...S });
const k2 = Fg.figur({ haut: "#f0d0b0", hemd: "#8a5ae8", hose: "#2a3a5a", haare: "#c88a3a", frisur: "zopf", skala: 0.76, ...S });
const k3 = Fg.figur({ haut: "#e0b090", hemd: "#e8603a", hose: "#2a2a3a", haare: "#4a2a1a", frisur: "strubbel", skala: 0.77, ...S, muster: { hemd: "streifen" } });
const nachbarin = Fg.figur({ haut: "#c88a5a", hemd: "#f2c21a", hose: "#4a4a52", haare: "#2a1a10", frisur: "zopf", skala: 1.0, ...S });

const DP = Al.BUNTDORF.pos, C = Al.BUNTDORF.platz;
const loc = (R, x, y, z) => V(R.g.position.x + x, y, R.g.position.z + z);
const zm = Rq.zimmer; const ZI = (x, y, z) => { zm.updateMatrixWorld(true); return V(x, y, z).applyMatrix4(zm.matrixWorld); };

// ---- Kulissen-Teile (Bibliothek) ----
const bild = Al.leinwand(2.2, 1.6, {}); Wt.scene.add(bild);
bild.userData.zeichne((x, w, h) => { x.fillStyle = "#fffdf4"; x.fillRect(0, 0, w, h); x.lineWidth = 14; x.lineCap = "round";
  x.strokeStyle = "#3a8ae8"; x.beginPath(); x.moveTo(60, h - 120); x.lineTo(w - 60, h - 140); x.stroke();                     // krummer Boden
  x.strokeStyle = "#e84a3a"; x.strokeRect(w * 0.3, h * 0.35, w * 0.3, h * 0.35); x.beginPath(); x.moveTo(w * 0.27, h * 0.37); x.lineTo(w * 0.45, h * 0.12); x.lineTo(w * 0.64, h * 0.4); x.stroke();
  x.fillStyle = "#ffd23a"; x.beginPath(); x.arc(w * 0.82, h * 0.2, 60, 0, 7); x.fill(); x.strokeStyle = "#3aa84a"; x.beginPath(); x.moveTo(w * 0.12, h - 130); x.lineTo(w * 0.1, h * 0.45); x.stroke();
  x.fillStyle = "#3aa84a"; x.beginPath(); x.arc(w * 0.1, h * 0.4, 70, 0, 7); x.fill(); }, "bild");
const kuchen = O.torte({ text: "", farbe: "#3a2418", stufen: 1 }); kuchen.scale.setScalar(0.4); Wt.scene.add(kuchen);
const koffer = O.koffer({ farbe: "#2a8ae8", groesse: 0.8 }); Wt.scene.add(koffer);
const haus = O.haus({ wand: "#f4b8c4", dach: "#5a3a6a", tuer: "#2a7a4a", breite: 14, tiefe: 10, stock: 2, licht: true }); haus.position.copy(DP(-46, 0.05, 30)); Wt.scene.add(haus);
const HT = (x, y, z) => DP(-46 + x, y, 30 + z);                    // vor der Haustür: z ≈ 5 (Hausfront)
const test = Al.leinwand(3, 1.2, {}); Wt.scene.add(test);

const tag = () => { Wt.U.uTag.value = 1; Wt.U.uWolken.value = 1; Wt.hemi.intensity = 1.2; Wt.hemi.color.set("#cfe4ff"); Wt.hemi.groundColor.set("#8a8070"); };
const abend = () => { tag(); Wt.U.uAbend.value = 1; Wt.hemi.color.set("#ffc8a0"); Wt.hemi.intensity = 1.0; };
const nacht = () => { Wt.hemi.intensity = 0.75; Wt.hemi.color.set("#7a8ae0"); };
const wisch = (t, i, d = 0) => { Wt.grade.uniforms.uWisch.value = B.wisch(t, Z[i] - 0.06 + d); };
const konto = (wert, farbe = "gruen") => { Z_.zaehler = { wert, farbe, einheit: " $", vorzeichen: false }; };
const plus = (t0, text = "+100 $", farbe = "gruen") => { Z_.plus = { text, t0, farbe }; };
const nah = (q, f, abst, seite = 0, h = 0) => { f.updateMatrixWorld(true); const k = Fg.kopfPos(f); kamera.fahrt(q, f.localToWorld(V(seite, 3.4 + h, abst)), f.localToWorld(V(seite * 0.85, 3.4 + h, abst - 0.6)), V(k.x, k.y - 0.2, k.z), V(k.x, k.y - 0.2, k.z), 46); };

// 0 Hook: Dorfplatz, die Nachbarin lügt mich an → +100 $
sh(E[0] + 0.1, (t, q) => { tag(); nachbarin.visible = true; nachbarin.position.copy(DP(30, 0.28, 2.6)); nachbarin.rotation.y = 0.4; Fg.pose(nachbarin, { ges: Fg.mund(t), armR: 1.2, armRz: -0.2 });
  ich.visible = true; ich.position.copy(DP(31.6, 0.28, 6.4)); ich.rotation.y = -2.74; Fg.pose(ich, { ges: t > wz("hundert", 0) ? "lachen" : "froh" });
  const th = wz("hundert", 0); konto(t > th ? 100 : 0); plus(th); if (t > th - 0.1) Al.geldSetzen(t, true, { x: DP(31.6, 0, 6.4).x, y: 6, z: DP(31.6, 0, 6.4).z, t0: th - 0.1, kraft: 2, n: 40 });
  kamera.fahrt(q, DP(41.5, 4.2, 5.4), DP(40.6, 4.4, 5.0), DP(30.8, 3.0, 4.5), DP(30.8, 3.4, 4.5), 58); licht(1.6, "#fff4e0", 1.0, "#ffffff"); });
// 1 Wenn du selbst lügst: −500 $ (ich schwitze)
sh(E[1] + 0.1, (t, q) => { tag(); ich.visible = true; ich.position.copy(DP(31.6, 0.28, 6.4)); ich.rotation.y = Math.PI + 0.3; Fg.pose(ich, { ges: "schwitzen", armL: 0.4, armLz: 0.6 });
  const tf = wz("fünfhundert", 1); konto(t > tf ? -400 : 100, t > tf ? "rot" : "gruen"); plus(tf, "−500 $", "rot"); nah(q, ich, 5.8, 0.6); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 1); });
// 2 Die meisten verdienen nur ein paar Hundert: Menge auf dem Platz mit Beträgen über den Köpfen
const betrag = (i) => "+" + (((i * 37 + 11) % 5) + 1) * 100 + " $";
sh(E[2] + 0.1, (t, q) => { tag(); Z_.menge = { dx: C.x, dz: C.z, huepf: (i) => 0.08 * Math.max(0, Math.sin(t * 5 + i)) }; Z_.mengeZahl = { text: betrag, farbe: "#4ef07a", groesse: 0.75 };
  kamera.fahrt(q, V(C.x + 22, 11, C.z + 19), V(C.x + 19, 10, C.z + 16.5), V(C.x, 3, C.z), V(C.x, 3, C.z - 2), 54); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 2); });
// 3 Papa: „Dein Bild ist wunderschön“ (Küche, mein Bild an der Wand) → +100
const kueche = (t) => { const R = Al.KUECHE; Al.raumlicht(R, 9); bild.visible = true; bild.position.copy(loc(R, -1.2, 3.6, -5.36)); bild.rotation.set(0, 0, 0.04); };
sh(E[3] + 0.06, (t, q) => { kueche(t); const R = Al.KUECHE; papa.visible = true; papa.position.copy(loc(R, 1.2, 0, -2.6)); papa.rotation.y = -0.5; Fg.pose(papa, { ges: t > wz("plus", 3) ? "schwitzen" : Fg.mund(t), armR: 1.5, armRz: -0.5 });
  
  konto(t > wz("plus", 3) ? 100 : 0); plus(wz("plus", 3));
  kamera.fahrt(q, loc(R, -3.6, 4.6, 2.6), loc(R, -3.2, 4.4, 2.0), loc(R, 0.4, 3.2, -3.4), loc(R, 0.4, 3.2, -3.4), 58); licht(0.6, "#ffe8d0", 0.4, "#f0d0ff"); wisch(t, 3); });
// 4 Oma: „Ich bin überhaupt nicht müde“ und schläft ein → +100
sh(E[4] + 0.06, (t, q) => { const R = Al.STUBE; Al.raumlicht(R, 9); oma.visible = true; oma.position.copy(loc(R, 1.2, -0.05, -3.4)); oma.rotation.y = 0; const schlaf = t > wz("plus", 4) - 0.4;
  Fg.pose(oma, { sitz: 1, ges: schlaf ? "schlaf" : t > Z[4] + 0.8 ? "muede" : Fg.mund(t), kopfNeig: schlaf ? 0.5 : 0.1 }); if (schlaf) Al.kopfzahl(oma, "Zzz", { farbe: "#ffffff", groesse: 0.8 });
  konto(t > wz("plus", 4) ? 200 : 100); plus(wz("plus", 4));
  kamera.fahrt(q, loc(R, 0.4, 4.6, 3.6), loc(R, 0.7, 4.3, 2.8), loc(R, 1.2, 2.9, -3.4), loc(R, 1.2, 2.9, -3.4), 50); licht(0.6, "#ffe8d0", 0.4, "#f0d0ff"); wisch(t, 4); });
// 5 Lehrer: „Der Test wird ganz leicht“ → +100 über allen Kindern
const klasse = (t, plusAlle) => { const R = Al.KLASSE; Al.raumlicht(R); Al.schreibe(R.tafel, [B.T({ de: "TEST", en: "TEST" }), B.T({ de: "SEITE 1 – 40", en: "PAGE 1 – 40" })], { kreide: true, font: "700 170px 'Inter Display', sans-serif" });
  lehrer.visible = true; lehrer.position.copy(loc(R, -2.6, 0, -5.2)); lehrer.rotation.y = 0.25; Fg.pose(lehrer, { ges: Fg.mund(t) === "reden" ? "lachen" : "froh", armR: 1.6 });
  const sitzen = (f, p) => { f.visible = true; f.position.set(R.plaetze[p].x, -0.05, R.plaetze[p].z - 0.2); f.rotation.y = Math.PI; Fg.pose(f, { sitz: 1, ges: plusAlle ? "staunen" : "froh" }); if (plusAlle) Al.kopfzahl(f, "+100 $", { farbe: "#4ef07a", groesse: 0.7 }); };
  sitzen(ich, 3); sitzen(freund, 0); sitzen(k2, 5); sitzen(k3, 4); };
sh(E[5] + 0.06, (t, q) => { const ta = wz("plus", 5); klasse(t, t > ta); konto(t > ta ? 300 : 200); plus(ta); const R = Al.KLASSE;
  kamera.fahrt(q, loc(R, 4.4, 5.2, 5.0), loc(R, 4.0, 5.0, 4.2), loc(R, -0.8, 3.0, -4.0), loc(R, -0.8, 3.0, -4.0), 62); licht(0.6, "#fff4e0", 0.4, "#e0f0ff"); wisch(t, 5); });
// 6–7 Mein Plan (Kinderzimmer, Idee)
const zimmerTag = () => { tag(); Rq.ZIMMER.licht.intensity = 8; };
sh(E[6] + 0.1, (t, q) => { zimmerTag(); ich.visible = true; ich.position.copy(ZI(-0.4, 0, -3.6)); ich.rotation.set(0, zm.rotation.y + 0.25, 0); Fg.pose(ich, { ges: "idee", armR: 2.6, armRz: 0.2 }); konto(300);
  nah(q, ich, 6.0, -0.8); licht(0.9, "#fff4e0", 0.6, "#ffffff"); wisch(t, 6); });
sh(E[7] + 0.1, (t, q) => { zimmerTag(); ich.visible = true; ich.position.copy(ZI(-0.4, 0, -3.6)); ich.rotation.set(0, zm.rotation.y + 0.25, 0); Fg.pose(ich, { ges: "lachen", armL: 0.4, armLz: 0.9, armR: 0.4, armRz: -0.9 }); konto(300);
  kamera.fahrt(q, ZI(1.2, 3.8, 2.6), ZI(0.9, 3.6, 1.8), ZI(-0.2, 2.6, -3.6), ZI(-0.2, 2.6, -3.6), 52); licht(0.9, "#fff4e0", 0.6, "#ffffff"); });
// 8 „Gefällt dir meine neue Frisur?“ (pinker Dutt) → +100
sh(E[8] + 0.06, (t, q) => { tag(); ichFrisur.visible = true; ichFrisur.position.copy(DP(31.6, 0.28, 6.4)); ichFrisur.rotation.y = -2.74; Fg.pose(ichFrisur, { ges: "lachen", armR: 2.5, armRz: 0.3 });
  k2.visible = true; k2.position.copy(DP(30, 0.28, 3.0)); k2.rotation.y = 0.4; Fg.pose(k2, { ges: t > wz("plus", 8) - 0.5 ? "schwitzen" : "staunen" });
  konto(t > wz("plus", 8) ? 400 : 300); plus(wz("plus", 8)); kamera.fahrt(q, DP(41, 4.0, 5.4), DP(40.2, 4.2, 5.0), DP(30.8, 2.8, 4.6), DP(30.8, 3.0, 4.6), 58); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 8); });
// 9 „Schmeckt dir mein Kuchen?“ (verbrannt, Papa würgt) → +100
sh(E[9] + 0.06, (t, q) => { kueche(t); const R = Al.KUECHE; kuchen.visible = true; kuchen.position.set(R.g.position.x + 0.9, 2.32, R.g.position.z + 0.9);
  papa.visible = true; papa.position.copy(loc(R, 0.9, -0.05, -1.4)); papa.rotation.y = 0; Fg.pose(papa, { sitz: 1, ges: t > Z[9] + 1.0 ? "schwitzen" : "froh", armR: 1.3, armRz: -0.2 });
  konto(t > wz("plus", 9) ? 500 : 400); plus(wz("plus", 9)); kamera.fahrt(q, loc(R, 2.2, 5.0, 5.6), loc(R, 1.9, 4.8, 4.9), loc(R, 0.9, 3.0, -1.0), loc(R, 0.9, 3.0, -1.0), 52); licht(0.6, "#ffe8d0", 0.4, "#f0d0ff"); wisch(t, 9); });
// 10 Ich lüge Mama an: „Zähne geputzt“ → −500
sh(E[10] + 0.06, (t, q) => { zimmerTag(); mama.visible = true; mama.position.copy(ZI(2.2, 0, 0.6)); mama.rotation.set(0, zm.rotation.y + Math.PI + 0.3, 0); Fg.pose(mama, { ges: "ernst", armL: 0.4, armLz: 0.9, armR: 0.4, armRz: -0.9 });
  ich.visible = true; ich.position.copy(ZI(0.8, 0, -3.0)); ich.rotation.set(0, zm.rotation.y + 0.3, 0); const tm = wz("minus", 10); Fg.pose(ich, { ges: t > tm ? "kneifen" : "lachen" });
  konto(t > tm ? 0 : 500, t > tm ? "rot" : "gruen"); plus(tm, "−500 $", "rot");
  kamera.fahrt(q, ZI(-3.0, 4.4, -3.6), ZI(-2.6, 4.2, -3.2), ZI(1.4, 2.8, -1.2), ZI(1.4, 2.8, -1.2), 66); licht(0.9, "#fff4e0", 0.6, "#ffffff"); wisch(t, 10); });
// 11 Nach einer Woche zehntausend Dollar: Geldregen im Zimmer
sh(E[11] + 0.1, (t, q) => { zimmerTag(); ich.visible = true; ich.position.copy(ZI(-0.4, 0, -1.0)); ich.rotation.set(0, zm.rotation.y + 0.4, 0); Fg.pose(ich, { ges: "lachen", armL: 2.7, armR: 2.7, huepf: 0.2 * Math.abs(Math.sin(t * 6)) });
  const p = ZI(-0.4, 0, -1.0); Al.geldSetzen(t, true, { x: p.x, y: 7.5, z: p.z, t0: Z[11], kraft: 3 }); konto(Math.round(B.zaehlen(t, Z[11] + 0.3, wz("zehntausend", 11) + 0.3, 0, 10000)));
  nah(q, ich, 7.0, 0.6, 0.6); licht(0.9, "#fff4e0", 0.6, "#ffffff"); wisch(t, 11); });
// 12–13 Nur bei meinem besten Freund klappt es nie (Bank auf dem Platz, Konto bleibt stehen)
const bank = (t, gesF) => { tag(); const b0 = DP(30, 0.28, -14); freund.visible = true; freund.position.copy(DP(29, 0.28, -11.4)); freund.rotation.y = 0.3; Fg.pose(freund, { ges: gesF });
  ich.visible = true; ich.position.copy(DP(31.4, 0.28, -11.4)); ich.rotation.y = -0.3; Fg.pose(ich, { ges: "ernst" }); return b0; };
sh(E[12] + 0.1, (t, q) => { bank(t, "froh"); konto(10000); kamera.fahrt(q, DP(33.0, 4.0, -2.6), DP(32.6, 3.9, -3.6), DP(30.2, 2.6, -11.4), DP(30.2, 2.6, -11.4), 52); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 12); });
sh(E[13] + 0.2, (t, q) => { bank(t, Fg.mund(t)); konto(10000); Al.kopfzahl(freund, "+0 $", { farbe: "#c8c8c8", groesse: 0.7 }); nah(q, freund, 5.6, -0.6); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 13); });
// 14 Bis heute Abend (Haus bei Abendrot)
sh(E[14] + 0.3, (t, q) => { abend(); kamera.fahrt(q, HT(16, 7, 26), HT(14, 6.2, 23), HT(0, 4.5, 0), HT(0, 4.2, 0), 54); licht(1.0, "#ffb080", 0.8, "#c0a0ff"); Z_.vignette = 0.45; wisch(t, 14); });
// 15 Er steht mit einem Koffer vor der Tür (Nacht)
const tuer = (t, gesI = "staunen", gesF = "froh") => { nacht(); ich.visible = true; ich.position.copy(HT(0, 0.05, 5.4)); ich.rotation.y = 0; Fg.pose(ich, { ges: gesI });
  freund.visible = true; freund.position.copy(HT(0, 0.05, 9.0)); freund.rotation.y = Math.PI; Fg.pose(freund, { ges: gesF, armL: 0.25 });
  koffer.visible = true; koffer.position.copy(HT(-1.6, 0.05, 9.2)); koffer.rotation.y = Math.PI / 2; };
sh(E[15] + 0.2, (t, q) => { tuer(t); konto(10000); kamera.fahrt(q, HT(11, 4.0, 6.6), HT(10.2, 3.8, 6.8), HT(-0.4, 2.4, 7.2), HT(-0.4, 2.4, 7.2), 56); licht(1.1, "#ffd8a0", 0.6, "#8aa0ff"); Z_.vignette = 0.5; wisch(t, 15); });
// 16 „Ist alles okay?“ (über seine Schulter auf mich)
sh(E[16] + 0.2, (t, q) => { tuer(t, Fg.mund(t)); nah(q, ich, 5.2, 0.9); licht(1.1, "#ffd8a0", 0.6, "#8aa0ff"); Z_.vignette = 0.5; wisch(t, 16); });
// 17 Er lächelt: „Alles ist gut. Ich gehe nirgendwo hin.“
sh(E[17] + 0.2, (t, q) => { tuer(t, "ernst", Fg.mund(t) === "reden" ? "reden" : "froh"); nah(q, freund, 5.2, -0.8); licht(1.1, "#ffd8a0", 0.6, "#8aa0ff"); Z_.vignette = 0.5; wisch(t, 17); });
// 18–19 Konto springt: +100, und gleich noch mal
sh(E[18] + 0.15, (t, q) => { tuer(t, "staunen"); const tp = wz("plus", 18); konto(t > tp ? 10100 : 10000); plus(tp); nah(q, ich, 4.6, -0.5); licht(1.1, "#ffd8a0", 0.6, "#8aa0ff"); Z_.vignette = 0.55; wisch(t, 18); });
sh(E[19] + 0.15, (t, q) => { tuer(t, "angst", "froh"); const tp = wz("plus", 19); konto(t > tp ? 10200 : 10100); plus(tp); nah(q, freund, 4.6, 0.5); licht(1.1, "#ffd8a0", 0.6, "#8aa0ff"); Z_.vignette = 0.55; wisch(t, 19); });
// 20 Mein bester Freund hat mich zweimal angelogen
sh(E[20] + 0.4, (t, q) => { tuer(t, "traurig", "froh"); konto(10200); nah(q, ich, 5.6, 0.7); licht(1.1, "#ffd8a0", 0.6, "#8aa0ff"); Z_.vignette = 0.55; wisch(t, 20); });
// 21–23 Mitmach-Frage: er geht mit dem Koffer die Straße hinunter, ich an der Tür
sh(DAUER + 1, (t, q) => { nacht(); ich.visible = true; ich.position.copy(HT(0, 0.05, 5.4)); ich.rotation.y = 0.3; Fg.pose(ich, { ges: "traurig" });
  const w = Math.min(1, Math.max(0, (t - (Z[21] ?? E[20])) / 7)); freund.visible = true; freund.position.copy(HT(2 + w * 10, 0.05, 11 + w * 5)); freund.rotation.y = 1.1; Fg.pose(freund, { lauf: 0.7, phase: t * 5, ges: "ernst" });
  freund.updateMatrixWorld(true); koffer.visible = true; koffer.position.copy(freund.localToWorld(V(1.4, 0, -0.4))); koffer.rotation.y = freund.rotation.y;
  kamera.fahrt(q, HT(-2.4, 3.6, 5.9), HT(-2.2, 3.7, 6.2), HT(5, 4.6, 13), HT(8, 4.4, 15), 56); licht(1.1, "#ffd8a0", 0.6, "#8aa0ff"); Z_.vignette = 0.5; });

B.start({ grund: (t) => { bild.visible = false; kuchen.visible = false; koffer.visible = false; },
  frage: { zeile: 21, text: B.T({ de: "Was soll ich tun?", en: "What should I do?" }), karten: [["A", "🤝", "Ihn festhalten", "festhalten"], ["B", "👣", "Heimlich folgen", "folgen"], ["C", "📞", "Seine Mama anrufen", "mama"]] } });
