// Folge 05 „Akku“ – eigenständige Folge (Issue #45): In meiner Stadt hat jeder einen Akku über dem Kopf. Ist er leer, schläfst du sofort ein.
// Beweis-Montage (Mann auf der Bank, Lehrer an der Tafel, Oma über der Suppe, Papa lädt auf dem Sofa), ich bin die Ausnahme (immer 100 %),
// Minecraft die ganze Nacht, zehn Runden um den Brunnen; Wendung „Herz“: Mama schenkt mir jede Nacht heimlich ihren Akku.
// Neue Elemente (Bibliothek): Al.kopfakku (Akku über dem Kopf, auch für die Menge), Al.akkuStrahl (Lichtfaden zwischen zwei Akkus),
// O.suppenteller, LOGO.minecraft (Fernseher). Realistisch (Issue #46): alle sitzen auf Sitzflächen, nichts steckt ineinander.
import * as B from "../folge.js";
import * as O from "../objekte.js";
import { LOGO } from "../logos.js";
const { V, sh, licht, kamera, Fg, Al, Rq, Wt, Z_ } = B;
await B.laden(); const { Z, E, DAUER } = B.F;
// Englische Fassung (?sprache=en): deutsche Stichwörter → englische Wörter derselben Zeile
const EN = { sofort: "instantly", satz: "sentence", null: "zero", hundert: "hundred", ein: "one", setzte: "sat", neunzig: "ninety", siebzig: "seventy", "fünfzig": "fifty", hand: "hand", runde: "ten" };
const wz = (w, i) => B.F.wz(B.SPRACHE === "en" ? (EN[w] ?? w) : w, i);
const kl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

const S = { struktur: true };
const ich = Fg.figur({ haut: "#f0c8a0", hemd: "#e8a020", hose: "#2a3a5a", haare: "#5a3418", frisur: "strubbel", kapuze: true, skala: 0.78, schuhe: "#e8e8e8", ...S });
const mama = Fg.figur({ haut: "#e8b890", hemd: "#e85a7a", hose: "#3a3a5a", haare: "#7a3a1a", frisur: "zopf", skala: 1.0, ...S, muster: { hemd: "punkte" } });
const papa = Fg.figur({ haut: "#d89a6a", hemd: "#3a6ac8", hose: "#2a2a30", haare: "#3a2414", frisur: "kurz", skala: 1.1, ...S });
const oma = Fg.figur({ haut: "#f2d0b0", hemd: "#8a4a6a", stoff: true, hose: "#4a3a4a", haare: "#e0e0e0", frisur: "dutt", brille: true, schal: "#c8a050", skala: 0.95, ...S });
const lehrer = Fg.figur({ haut: "#e8b890", hemd: "#f4f4f4", jacke: "#2ab0a0", hose: "#c8a878", haare: "#6a4a2a", brille: true, skala: 1.05, ...S });
const nachbar = Fg.figur({ haut: "#c88a5a", hemd: "#5a8a3a", hose: "#3a3a48", haare: "#2a1a10", frisur: "kurz", skala: 1.05, ...S, muster: { hemd: "streifen" } });
const k2 = Fg.figur({ haut: "#f0d0b0", hemd: "#8a5ae8", hose: "#2a3a5a", haare: "#c88a3a", frisur: "zopf", skala: 0.76, ...S });
const k3 = Fg.figur({ haut: "#e0b090", hemd: "#e8603a", hose: "#2a2a3a", haare: "#4a2a1a", frisur: "strubbel", skala: 0.77, ...S, muster: { hemd: "streifen" } });
const freund = Fg.figur({ haut: "#8a5a3a", hemd: "#3ab88a", hose: "#3a3a5a", haare: "#1a1a1a", frisur: "kurz", skala: 0.78, ...S });

const DP = Al.BUNTDORF.pos, C = Al.BUNTDORF.platz;
const loc = (R, x, y, z) => V(R.g.position.x + x, y, R.g.position.z + z);
const zm = Rq.zimmer; const ZI = (x, y, z) => { zm.updateMatrixWorld(true); return V(x, y, z).applyMatrix4(zm.matrixWorld); };

// ---- Kulissen-Teile (Bibliothek) ----
const suppe = O.suppenteller(); Wt.scene.add(suppe);
const tvBild = Al.leinwand(4.1, 2.3, { leuchtet: true, hell: 1.3 }); Wt.scene.add(tvBild);
tvBild.userData.zeichne((x, w, h) => LOGO.minecraft(x, w, h), "minecraft");

const tag = () => { Wt.U.uTag.value = 1; Wt.U.uWolken.value = 1; Wt.hemi.intensity = 1.2; Wt.hemi.color.set("#cfe4ff"); Wt.hemi.groundColor.set("#8a8070"); };
const wisch = (t, i, d = 0) => { Wt.grade.uniforms.uWisch.value = B.wisch(t, Z[i] - 0.06 + d); };
const nah = (q, f, abst, seite = 0, h = 0, fov = 46) => { f.updateMatrixWorld(true); const k = Fg.kopfPos(f); kamera.fahrt(q, f.localToWorld(V(seite, 3.4 + h, abst)), f.localToWorld(V(seite * 0.85, 3.4 + h, abst - 0.6)), V(k.x, k.y - 0.1, k.z), V(k.x, k.y - 0.1, k.z), fov); };
const akkuZ = (p, farbe) => { Z_.zaehler = { wert: Math.round(p), einheit: " %", vorzeichen: false, farbe: farbe ?? (p > 50 ? "gruen" : p > 20 ? "gelb" : "rot") }; };
const zzz = (f, dx = 1.2) => { f.updateMatrixWorld(true); const k = Fg.kopfPos(f); Al.kopfzahl(k.clone().add(V(dx, 1.0, 0)), "Zzz", { farbe: "#ffffff", groesse: 0.6 }); };
const akkuMenge = (i) => [64, 12, 88, 35, 7, 51, 93, 22, 76, 3, 45, 69][i % 12];

// 0 Hook: Dorfplatz, über jedem Kopf ein Akku
sh(E[0] + 0.1, (t, q) => { tag(); Z_.menge = { dx: C.x, dz: C.z, huepf: (i) => 0.06 * Math.max(0, Math.sin(t * 4 + i)) }; Z_.mengeZahl = { akku: akkuMenge, groesse: 0.68 };
  kamera.fahrt(q, V(C.x + 21, 9.5, C.z + 18), V(C.x + 17.5, 8.4, C.z + 15), V(C.x, 3.6, C.z), V(C.x, 3.6, C.z - 1.5), 54); licht(1.6, "#fff4e0", 1.0, "#ffffff"); });
// 1 Ist er leer, schläfst du sofort ein: Mann auf der Bank (3 % → 0 %), Kopf sinkt zur Seite
const bankSitz = DP(30, 0.3, -13.75);
sh(E[1] + 0.1, (t, q) => { tag(); const ts = wz("sofort", 1); const p = t < ts - 0.6 ? 3 : t < ts - 0.2 ? 1 : 0; const schlaf = t > ts;
  nachbar.visible = true; nachbar.position.copy(bankSitz); nachbar.rotation.y = 0; Fg.pose(nachbar, { sitz: 1, ges: schlaf ? "schlaf" : p < 2 ? "muede" : "froh", kopfNeig: schlaf ? 0.45 * kl((t - ts) / 0.35) : 0, armL: 0.1, armR: 0.1 });
  Al.kopfakku(nachbar, p, { groesse: 0.9 }); if (schlaf && t > ts + 0.5) zzz(nachbar);
  kamera.fahrt(q, DP(35.5, 5.0, -2.0), DP(34.6, 4.8, -3.4), DP(30, 3.4, -13.2), DP(30, 3.4, -13.2), 48); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 1); });
// 2–3 Klasse: Lehrer mit 2 %, schläft mitten im Satz an der Tafel ein
const klasse = (t, schlaf) => { const R = Al.KLASSE; Al.raumlicht(R);
  Al.schreibe(R.tafel, schlaf ? [B.T({ de: "DIE HAUPTSTADT VON", en: "THE CAPITAL OF" }), B.T({ de: "FRANKR", en: "FRAN" })] : [B.T({ de: "DIE HAUPTSTADT VON", en: "THE CAPITAL OF" }), B.T({ de: "FRANKREICH IST", en: "FRANCE IS" })], { kreide: true, font: "700 108px 'Inter Display', sans-serif" });
  lehrer.visible = true; lehrer.position.copy(loc(R, -1.6, 0, -5.4)); lehrer.rotation.y = 0.35;
  const ts = schlaf ? Z[3] + 0.25 : 1e9; const s = kl((t - ts) / 0.4);
  Fg.pose(lehrer, { ges: t > ts ? "schlaf" : Fg.mund(t) === "reden" ? "reden" : "muede", armR: t > ts ? 1.6 * (1 - s) : 1.6, armRz: -0.2, kopfNeig: 0.4 * s }); Al.kopfakku(lehrer, t > ts ? 0 : 2, { groesse: 0.85 });
  if (t > ts + 0.6) zzz(lehrer, -1.3);
  const sitzen = (f, p, ges) => { f.visible = true; f.position.set(R.plaetze[p].x, -0.05, R.plaetze[p].z - 0.2); f.rotation.y = Math.PI; Fg.pose(f, { sitz: 1, ges }); };
  const lacht = t > ts + 0.5; sitzen(ich, 3, lacht ? "lachen" : "froh"); sitzen(freund, 0, lacht ? "lachen" : "froh"); sitzen(k2, 5, lacht ? "staunen" : "froh"); sitzen(k3, 4, lacht ? "lachen" : "froh"); };
sh(E[2] + 0.06, (t, q) => { klasse(t, false); const R = Al.KLASSE; lehrer.updateMatrixWorld(true); const k = Fg.kopfPos(lehrer);
  kamera.fahrt(q, loc(R, 2.6, 4.4, 2.2), loc(R, 2.2, 4.4, 1.4), V(k.x, k.y + 0.5, k.z), V(k.x, k.y + 0.6, k.z), 50); licht(0.6, "#fff4e0", 0.4, "#e0f0ff"); wisch(t, 2); });
sh(E[3] + 0.06, (t, q) => { klasse(t, true); const R = Al.KLASSE;
  kamera.fahrt(q, loc(R, 4.6, 5.2, 5.4), loc(R, 4.2, 5.0, 4.6), loc(R, -1.0, 3.2, -4.4), loc(R, -1.0, 3.2, -4.4), 62); licht(0.6, "#fff4e0", 0.4, "#e0f0ff"); wisch(t, 3); });
// 4–5 Küche: Oma hat beim Mittagessen 0 % und schnarcht über ihrer Suppe (Kopf über dem Teller, berührt ihn nicht)
const kueche = (t, schlaf, tSchlaf = 0) => { const R = Al.KUECHE; Al.raumlicht(R, 9); R.schale.visible = false;
  suppe.visible = true; suppe.scale.setScalar(0.75); suppe.position.copy(loc(R, -1.35, 2.3, 0.5)); suppe.rotation.y = Math.PI;
  oma.visible = true; oma.position.copy(loc(R, -2.75, -0.03, 0.5)); oma.rotation.y = Math.PI / 2; const s = schlaf ? kl((t - tSchlaf) / 0.4) : 0;
  Fg.pose(oma, { sitz: 1, ges: schlaf ? "schlaf" : Fg.mund(t) === "reden" ? "froh" : "muede", kopfNeig: 0.5 * s, neig: 0.15 * s, armR: 1.2 * (1 - s) + 0.5, armRz: 0.1 }); };
sh(E[4] + 0.06, (t, q) => { const tn = wz("null", 4); kueche(t, t > tn + 0.25, tn + 0.25); Al.kopfakku(oma, t > tn ? 0 : 1, { groesse: 0.85 }); const R = Al.KUECHE;
  kamera.fahrt(q, loc(R, 0.4, 5.0, 5.0), loc(R, 0.1, 4.8, 4.3), loc(R, -2.2, 3.4, 0.5), loc(R, -2.2, 3.4, 0.5), 50); licht(0.6, "#ffe8d0", 0.4, "#f0d0ff"); wisch(t, 4); });
sh(E[5] + 0.06, (t, q) => { kueche(t, true, -10); Al.kopfakku(oma, 0, { groesse: 0.8 }); zzz(oma, 1.1); const R = Al.KUECHE;
  kamera.fahrt(q, loc(R, 1.4, 4.0, 5.0), loc(R, 1.1, 3.9, 4.5), loc(R, -2.1, 3.5, 0.5), loc(R, -2.1, 3.5, 0.5), 50); licht(0.6, "#ffe8d0", 0.4, "#f0d0ff"); wisch(t, 5); });
// 6 Papa lädt sich jeden Abend auf dem Sofa auf (liegt, Blitz im Akku, zählt hoch)
sh(E[6] + 0.06, (t, q) => { const R = Al.STUBE; Al.raumlicht(R, 6, "#ffd0a0"); papa.visible = true; papa.position.copy(loc(R, 2.35, 1.85, -3.4)); papa.rotation.set(0, Math.PI / 2, 0); Fg.pose(papa, { liegen: 1, ges: "schlaf" });
  Al.kopfakku(papa, B.zaehlen(t, Z[6] + 0.3, E[6], 8, 61), { laden: true, groesse: 0.9 }); zzz(papa, -1.0);
  kamera.fahrt(q, loc(R, -0.6, 4.6, 2.2), loc(R, -0.8, 4.4, 1.6), loc(R, -1.9, 2.6, -3.4), loc(R, -1.9, 2.6, -3.4), 50); licht(0.7, "#ffd8b0", 0.4, "#f0d0ff"); wisch(t, 6); });
// 7–8 Nur bei mir ist alles anders: ich auf dem Platz, ringsum müde Leute, bei mir 100 %
const platzIch = (t, ges, huepf = 0) => { tag(); ich.visible = true; ich.position.copy(DP(31.6, 0.28, 6.4)); ich.rotation.y = -2.6; Fg.pose(ich, { ges, huepf, armL: huepf ? 2.6 : 0, armR: huepf ? 2.6 : 0 }); Al.kopfakku(ich, 100, { groesse: 0.8 });
  k2.visible = true; k2.position.copy(DP(28.6, 0.28, 3.4)); k2.rotation.y = 0.6; Fg.pose(k2, { ges: "muede" }); Al.kopfakku(k2, 9, { groesse: 0.75 });
  freund.visible = true; freund.position.copy(DP(34.8, 0.28, 2.8)); freund.rotation.y = -0.4; Fg.pose(freund, { ges: "muede" }); Al.kopfakku(freund, 17, { groesse: 0.75 }); };
sh(E[7] + 0.1, (t, q) => { platzIch(t, "ernst"); nah(q, ich, 6.2, 0.8, 0.3); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 7); });
sh(E[8] + 0.1, (t, q) => { const th = wz("hundert", 8); platzIch(t, t > th ? "lachen" : "froh", t > th ? 0.25 * Math.abs(Math.sin(t * 6)) : 0); if (t > th) akkuZ(100);
  kamera.fahrt(q, DP(40.5, 4.4, 4.2), DP(39.6, 4.4, 4.2), DP(31.4, 3.0, 4.6), DP(31.4, 3.2, 4.6), 56); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 8); });
// 9 Ich werde nie müde: Kinderzimmer bei Nacht, Wecker 03:00, ich hellwach neben dem Bett
const zimmerNacht = (st = 4) => { Rq.ZIMMER.schirm.material = Rq.ZIMMER.schirmAus; Rq.ZIMMER.licht.intensity = st; Rq.ZIMMER.licht.color.set("#8aa0ff"); Wt.hemi.intensity = 0.5; Wt.hemi.color.set("#5a6ab0"); };
sh(E[9] + 0.1, (t, q) => { zimmerNacht(6); Rq.weckerZeichnen("03:00"); ich.visible = true; ich.position.copy(ZI(1.4, 0, 1.6)); ich.rotation.set(0, zm.rotation.y + Math.PI + 0.5, 0);
  Fg.pose(ich, { ges: "staunen", armL: 0.3, armLz: 0.5, armR: 0.3, armRz: -0.5 }); Al.kopfakku(ich, 100, { groesse: 0.8 }); akkuZ(100);
  kamera.fahrt(q, ZI(1.0, 3.9, -3.6), ZI(1.1, 3.8, -2.8), ZI(1.2, 3.0, 2.4), ZI(1.2, 3.0, 2.4), 52); licht(0.5, "#a0b0ff", 0.6, "#8aa0ff"); Z_.vignette = 0.5; wisch(t, 9); });
// 10 Die ganze Nacht Minecraft (Stube dunkel, ich im Sessel, Fernseher zeigt Minecraft)
const stubeNacht = (t) => { const R = Al.STUBE; Al.raumlicht(R, 5, "#a0b4ff"); R.tv.updateMatrixWorld(true); tvBild.visible = true; tvBild.position.copy(R.tv.localToWorld(V(0, 0, 0.15))); tvBild.quaternion.copy(R.tv.getWorldQuaternion(new B.THREE.Quaternion()));
  ich.visible = true; ich.position.copy(loc(R, -5.25, 0.3, 0.5)); ich.rotation.y = Math.PI / 2; Fg.pose(ich, { sitz: 1, ges: t > wz("hundert", 10) ? "lachen" : "froh", armL: 0.9, armR: 0.9 }); Al.kopfakku(ich, 100, { groesse: 0.8 }); };
sh(wz("hundert", 10) - 0.15, (t, q) => { stubeNacht(t); const R = Al.STUBE; kamera.fahrt(q, loc(R, -1.0, 3.8, 1.6), loc(R, 0.2, 3.6, 1.4), loc(R, 6.8, 3.2, 1.0), loc(R, 6.8, 3.2, 1.0), 44); licht(0.5, "#a0c0ff", 0.5, "#8aa0ff"); Z_.vignette = 0.5; wisch(t, 10); });
sh(E[10] + 0.06, (t, q) => { stubeNacht(t); const R = Al.STUBE; kamera.fahrt(q, loc(R, -1.6, 4.0, 4.4), loc(R, -1.9, 4.0, 4.0), loc(R, -5.0, 3.0, 0.5), loc(R, -5.0, 3.1, 0.5), 50); licht(0.6, "#a0c0ff", 0.6, "#8aa0ff"); Z_.vignette = 0.5; });
// 11 Zehnmal um den Brunnen gerannt: ich renne (100 %), zwei Kinder liegen erschöpft und schlafend auf dem Pflaster (0 %)
const brunnen = DP(38, 0.28, 0);
sh(E[11] + 0.1, (t, q) => { tag(); const u = kl((t - Z[11]) / (E[11] - Z[11])); const runde = Math.min(10, 1 + Math.floor(u * 10)); const a = u * Math.PI * 2 * 1.5 + 0.6, r = 8.5;
  ich.visible = true; ich.position.set(brunnen.x + Math.cos(a) * r, 0.28, brunnen.z + Math.sin(a) * r); ich.rotation.y = -a; Fg.pose(ich, { renn: 1, phase: t * 12, ges: "lachen" }); Al.kopfakku(ich, 100, { groesse: 0.8 });
  k2.visible = true; k2.position.copy(DP(47.6, 0.42, 6.2)); k2.rotation.set(0, 0.4, 0); Fg.pose(k2, { liegen: 1, ges: "schlaf" }); Al.kopfakku(k2, 0, { groesse: 0.7 });
  k3.visible = true; k3.position.copy(DP(28.6, 0.42, 6.6)); k3.rotation.set(0, -0.6, 0); Fg.pose(k3, { liegen: 1, ges: "schlaf" }); Al.kopfakku(k3, 0, { groesse: 0.7 });
  Z_.zaehler = { wert: B.T({ de: "Runde ", en: "Lap " }) + runde, einheit: "", farbe: "gelb" };
  const ak = a - 0.35; B.blick(V(brunnen.x + Math.cos(ak) * (r + 9), 5.2, brunnen.z + Math.sin(ak) * (r + 9)), V(brunnen.x + Math.cos(a) * r * 0.75, 2.4, brunnen.z + Math.sin(a) * r * 0.75)); Wt.cam.fov = 54; licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 11); });
// 12–22 Kinderzimmer, Nacht: ich stelle mich schlafend, Mama setzt sich ans Bett, ihr Akku fließt zu meinem.
// Zimmer-Koordinaten (ZI): Bett x −4,3…−0,1, Kopfende +z; mein Kopf liegt bei (−2,2 | 2,35 | 3,74), Mama sitzt rechts auf der Bettkante.
const imBett = (ges, o = {}) => { ich.visible = true; ich.position.copy(ZI(-2.2, 2.35, 0.5)); ich.rotation.set(0, Math.PI / 4 + Math.PI, 0); Fg.pose(ich, { liegen: 1, ges, ...o }); };
// Mama sitzt auf einem Stuhl neben dem Kopfende und schaut zu mir (Stuhl mit Abstand zum Bett, Knie stoßen nirgends an)
const stuhl = O.stuhl({ farbe: "#c87a4a" }); stuhl.position.copy(ZI(1.7, 0, 2.8)); stuhl.rotation.y = zm.rotation.y - Math.PI / 2; Wt.scene.add(stuhl);
const mamaSitzt = (ges, o = {}) => { stuhl.visible = true; mama.visible = true; mama.position.copy(ZI(1.7, -0.03, 2.8)); mama.rotation.set(0, zm.rotation.y - Math.PI / 2, 0); Fg.pose(mama, { sitz: 1, ges, kopfDreh: 0, ...o }); };
let LETZTE = [];
const AK = (pIch, pMama, ladenIch = false, ladenMama = false) => (LETZTE = [Al.kopfakku(ich, pIch, { groesse: 0.7, laden: ladenIch, hoehe: 1.5 }), Al.kopfakku(mama, pMama, { groesse: 0.7, laden: ladenMama, hoehe: 1.7 })]);
const strahl = (t, s, rueck = false) => { const [a, b] = LETZTE; const pa = a.position.clone().add(V(0, -0.35, 0)), pb = b.position.clone().add(V(0, -0.35, 0)); Al.akkuStrahl(t, true, rueck ? pa : pb, rueck ? pb : pa, { staerke: s }); };
const STRAHLBLICK = (q) => ZF(q, [5.4, 6.8, -4.2], [5.1, 6.7, -3.7], [0.0, 4.4, 3.0], [0.0, 4.5, 3.0], 58);
const MAMANAH = (q, h = 0) => { ZF(q, [-2.4, 5.4, -0.2], [-2.1, 5.3, 0.2], [1.7, 4.7 + h, 2.8], [1.7, 4.8 + h, 2.8], 46); licht(1.5, "#ffe0c8", 0.7, "#8aa0ff"); Rq.ZIMMER.licht.intensity = 7; Rq.ZIMMER.licht.color.set("#ffc8a0"); Z_.vignette = 0.5; };
const nachtLicht = () => { licht(0.55, "#a0b0ff", 0.7, "#8aa0ff"); Z_.vignette = 0.5; };
const ZF = (q, a0, a1, z0, z1 = z0, fov = 50) => kamera.fahrt(q, ZI(...a0), ZI(...a1), ZI(...z0), ZI(...z1), fov);   // Kamerafahrt in Zimmer-Koordinaten
const TOTALE = (q) => ZF(q, [5.5, 6.2, -4.8], [5.2, 6.0, -4.2], [0.0, 3.6, 3.0], [0.0, 3.7, 3.0], 58);
sh(E[12] + 0.3, (t, q) => { zimmerNacht(4); Rq.weckerZeichnen("03:00"); imBett("schlaf"); AK(100, 0); LETZTE[1].visible = false;
  ZF(q, [-3.9, 4.6, 1.2], [-3.7, 4.4, 1.6], [-2.2, 2.7, 3.7], [-2.2, 2.7, 3.7], 48); nachtLicht(); wisch(t, 12); });
// 13 Mama kommt herein (bis „setzte“) und setzt sich ans Bett
sh(wz("setzte", 13) - 0.1, (t, q) => { zimmerNacht(4); imBett("schlaf"); const u = kl((t - Z[13]) / (wz("setzte", 13) - 0.1 - Z[13]));
  mama.visible = true; mama.position.lerpVectors(ZI(3.8, 0, -4.0), ZI(1.8, 0, 0.0), u); mama.rotation.set(0, zm.rotation.y - 0.45, 0); Fg.pose(mama, { lauf: 0.5, phase: t * 5, ges: "muede" });
  Al.kopfakku(mama, 1, { groesse: 0.7, hoehe: 1.7 });
  ZF(q, [-3.4, 5.2, 4.2], [-3.2, 5.1, 3.8], [3.0, 3.4, -2.6], [2.0, 3.4, -0.6], 50); nachtLicht(); wisch(t, 13); });
sh(E[13] + 0.2, (t, q) => { zimmerNacht(4); imBett("schlaf"); mamaSitzt("muede"); AK(100, 1); LETZTE[1].visible = false; TOTALE(q); nachtLicht(); });
// 14 Über ihrem Kopf: 1 % (Mama von vorn)
sh(E[14] + 0.3, (t, q) => { zimmerNacht(4); imBett("schlaf"); mamaSitzt("muede"); AK(100, 1);
  MAMANAH(q, 0.5); wisch(t, 14); });
// 15 Ein dünnes Licht läuft von ihrem Akku zu meinem
sh(E[15] + 0.3, (t, q) => { zimmerNacht(4); imBett("schlaf"); mamaSitzt("muede"); AK(100, 1); strahl(t, kl((t - Z[15] - 0.4) / 0.6));
  STRAHLBLICK(q); nachtLicht(); wisch(t, 15); });
// 16 Mein Akku war nie von allein voll (nah auf mich, Augen auf → traurig)
const ICHNAH = (q) => ZF(q, [-3.9, 4.8, 1.0], [-3.7, 4.6, 1.4], [-2.2, 3.0, 3.7], [-2.2, 3.1, 3.7], 46);
sh(E[16] + 0.3, (t, q) => { zimmerNacht(4); imBett(t > Z[16] + 0.6 ? "traurig" : "schlaf"); mamaSitzt("muede"); AK(100, 1); strahl(t, 1); ICHNAH(q); nachtLicht(); wisch(t, 16); });
// 17 Mama hat mir jede Nacht ihren geschenkt
sh(E[17] + 0.3, (t, q) => { zimmerNacht(4); imBett("traurig"); mamaSitzt("muede"); AK(100, 1); strahl(t, 1); TOTALE(q); nachtLicht(); wisch(t, 17); });
// 18 Dann fällt sie auf 0 % und schläft im Sitzen ein (Kopf sinkt, der Faden erlischt)
sh(E[18] + 0.3, (t, q) => { zimmerNacht(4); imBett("traurig"); const tn = wz("null", 18); const s = kl((t - tn - 0.2) / 0.5);
  mamaSitzt(t > tn + 0.2 ? "schlaf" : "muede", { kopfNeig: 0.45 * s, kopfDreh: 0.5 * (1 - s) }); AK(100, t > tn ? 0 : 1); strahl(t, 1 - kl((t - tn) / 0.3)); if (t > tn + 0.8) zzz(mama, 1.2);
  MAMANAH(q, 0.2); wisch(t, 18); });
// 19 Also habe ich ihre Hand genommen (ich greife zu ihr hinüber)
const greif = (t, t0) => { const u = kl((t - t0) / 0.8); return { armR: 0.3 * u, armRz: -1.3 * u }; };
sh(E[19] + 0.3, (t, q) => { zimmerNacht(4); imBett("traurig", greif(t, Z[19])); mamaSitzt("schlaf", { kopfNeig: 0.45, armR: 0.9, armRz: 0.1 }); AK(100, 0);
  ZF(q, [5.2, 5.2, -3.4], [4.9, 5.1, -2.9], [0.2, 3.0, 3.0], [0.2, 3.0, 3.0], 54); nachtLicht(); wisch(t, 19); });
// 20 Neunzig. Siebzig. Fünfzig. – mein Akku fließt zu ihr, Zähler oben läuft runter, ihrer hoch
sh(E[20] + 0.3, (t, q) => { zimmerNacht(4); imBett("traurig", greif(t, -10)); mamaSitzt("schlaf", { kopfNeig: 0.45, armR: 0.9, armRz: 0.1 });
  const w = [wz("neunzig", 20), wz("siebzig", 20), wz("fünfzig", 20)]; const p = t < w[0] ? 100 : t < w[1] ? B.zaehlen(t, w[0], w[0] + 0.25, 100, 90) : t < w[2] ? B.zaehlen(t, w[1], w[1] + 0.25, 90, 70) : B.zaehlen(t, w[2], w[2] + 0.25, 70, 50);
  AK(p, 100 - p, false, true); strahl(t, kl((t - Z[20]) / 0.3), true); akkuZ(p);
  STRAHLBLICK(q); nachtLicht(); wisch(t, 20); });
// 21 Zum ersten Mal in meinem Leben war ich müde (nah auf mich)
sh(E[21] + 0.3, (t, q) => { zimmerNacht(4); imBett(t > Z[21] + 0.9 ? "muede" : "traurig", greif(t, -10)); mamaSitzt("schlaf", { kopfNeig: 0.45, armR: 0.9, armRz: 0.1 }); AK(50, 50); akkuZ(50); ICHNAH(q); nachtLicht(); wisch(t, 21); });
// 22 Das schönste Gefühl der Welt: beide schlafen, Kamera fährt langsam zurück
sh(DAUER + 1, (t, q) => { zimmerNacht(3.5); imBett("schlaf", greif(t, -10)); mamaSitzt("schlaf", { kopfNeig: 0.45, armR: 0.9, armRz: 0.1 }); AK(50, 50);
  ZF(q, [4.6, 5.6, -3.4], [5.5, 6.8, -5.2], [0.0, 3.3, 3.0], [0.0, 3.1, 3.0], 56); licht(0.5, "#a0b0ff", 0.7, "#8aa0ff"); Z_.vignette = 0.58; wisch(t, 22); });

B.start({ grund: (t) => { stuhl.visible = false; suppe.visible = false; tvBild.visible = false; Al.KUECHE.schale.visible = true; } });
