// Vorrat 01 „Die Lügen-Zahl“ – eigenständige Folge (Story-Richtung „Fesselnd“): Über jedem Kopf steht, wie oft man heute gelogen hat.
// Neue Elemente: Zahl über dem Kopf (kopfzahl, mengeZahlen), Küche, Omas Stube, Klassenzimmer mit Tafel, Vorstadt am Tag,
// Großbildschirm auf dem Platz, Plus-Anzeige, Wisch-Übergänge.
import * as B from "../folge.js";
import * as O from "../objekte.js";
const { V, sh, blick, licht, kamera, Fg, Al, Wt, Z_ } = B;
await B.laden(); const { Z, E, DAUER, wz } = B.F;

const ich = Fg.figur({ haut: "#f0c8a0", hemd: "#e8a020", hose: "#2a3a5a", haare: "#5a3418", frisur: "strubbel", kapuze: true, skala: 0.78, schuhe: "#e8e8e8", struktur: true });
const ichPulli = Fg.figur({ haut: "#f0c8a0", hemd: "#e8608a", hose: "#2a3a5a", haare: "#5a3418", frisur: "strubbel", skala: 0.78, schuhe: "#e8e8e8", struktur: true, muster: { hemd: "karo" } });
const papa = Fg.figur({ haut: "#d89a6a", hemd: "#3a6ac8", hose: "#2a2a30", haare: "#3a2414", frisur: "kurz", skala: 1.1, struktur: true });
const mama = Fg.figur({ haut: "#e8b890", hemd: "#e85a7a", hose: "#3a3a5a", haare: "#7a3a1a", frisur: "zopf", skala: 1.0, struktur: true });
const oma = Fg.figur({ haut: "#f2d0b0", hemd: "#8a4a6a", stoff: true, hose: "#4a3a4a", haare: "#e0e0e0", frisur: "dutt", brille: true, schal: "#c8a050", skala: 0.95, struktur: true });
const lehrer = Fg.figur({ haut: "#e8b890", hemd: "#f4f4f4", jacke: "#2ab0a0", hose: "#c8a878", haare: "#6a4a2a", brille: true, skala: 1.05, struktur: true });
const freund = Fg.figur({ haut: "#8a5a3a", hemd: "#3ab88a", hose: "#3a3a5a", haare: "#1a1a1a", frisur: "kurz", skala: 0.78, struktur: true });
const kind3 = Fg.figur({ haut: "#f0d0b0", hemd: "#8a5ae8", hose: "#2a3a5a", haare: "#c88a3a", frisur: "zopf", skala: 0.76, struktur: true });
const chef = Fg.figur({ haut: "#e8c0a0", hemd: "#f4f4f4", jacke: "#2a2a3a", hose: "#2a2a3a", haare: "#8a8a8a", frisur: "kurz", zylinder: true, goldkette: true, skala: 1.15, struktur: true });

// Kuchen auf dem Küchentisch, Baum zum Verstecken in der Vorstadt
const kuchen = O.torte({ text: "", farbe: "#c8784a", stufen: 1 }); kuchen.scale.setScalar(0.55); Wt.scene.add(kuchen);
{ const R = Al.KUECHE; kuchen.position.set(R.g.position.x + 0.9, 2.32, R.g.position.z + 0.9); }
const baum = O.baum({ art: "rund", groesse: 0.9, saat: 11 }); baum.position.copy(Al.VORSTADT.pos(15, 0.04, 30)); Wt.scene.add(baum);

const loc = (R, x, y, z) => V(R.g.position.x + x, y, R.g.position.z + z);
const GELB = "#ffe53a", WEISS = "#ffffff", ROT = "#ff4a4a";
// feste Zahl je Person in der Menge (kein Zufall pro Bild)
const zahlVon = (i) => ((i * 37 + 11) % 23) + (i % 9 === 0 ? 40 : 0);
const T_PLUS = wz("plötzlich", 16) + 0.35;          // alle Zahlen +1
const T_KLICK = wz("klicken", 18);                   // meine Null wird zur Eins
const meinWert = (t) => t >= T_KLICK ? "1" : "0";
const meineFarbe = (t) => t >= T_KLICK ? ROT : WEISS;
const tag = () => { Wt.U.uTag.value = 1; Wt.U.uWolken.value = 1; Wt.hemi.intensity = 1.2; Wt.hemi.color.set("#cfe4ff"); Wt.hemi.groundColor.set("#8a8070"); };
// Seit 23.11. abends im BUNTDORF (Jonathan: „Dorf mit bunten Häusern wie in den Vorbild-Videos“): alte Platz-Koordinaten
// (Menge um 0/0, Familie bei z 25 mit Blick nach −z) werden um 90° gedreht auf den Dorfplatz gelegt (Blick nach +x zur Bühne).
const C = Al.BUNTDORF.platz; const PL = (x, y, z) => V(C.x - z, y, C.z + x);
const abend = () => { tag(); Wt.U.uAbend.value = 1; Wt.hemi.color.set("#ffc8a0"); Wt.hemi.intensity = 1.0; };
const draussen = (t) => { if (t < Z[12] - 0.2) tag(); else abend(); };
const wisch = (t, i) => { Wt.grade.uniforms.uWisch.value = B.wisch(t, Z[i] - 0.06); };
// Familie auf dem Platz (Abend): ich vorne in der Mitte, Papa links, Oma rechts
const platzFamilie = (t, ges = "staunen") => {
  ich.visible = true; ich.position.copy(PL(0, 0, 25)); ich.rotation.y = (Math.PI) - Math.PI / 2; Fg.pose(ich, { ges, kopfNeig: -0.15 });
  papa.visible = true; papa.position.copy(PL(-3.6, 0, 24.4)); papa.rotation.y = (Math.PI) - Math.PI / 2; Fg.pose(papa, { ges: "staunen" });
  oma.visible = true; oma.position.copy(PL(3.4, 0, 24.6)); oma.rotation.y = (Math.PI) - Math.PI / 2; Fg.pose(oma, { ges: "staunen" });
  const plus = t >= T_PLUS ? 1 : 0;
  Al.kopfzahl(papa, String(3 + plus), { farbe: GELB }); Al.kopfzahl(oma, String(48 + plus), { farbe: GELB }); Al.kopfzahl(ich, meinWert(t), { farbe: meineFarbe(t), groesse: t >= T_KLICK ? 1.4 : 1 });
};
const mengeAbend = (t, arme = 0) => { draussen(t); Z_.menge = { armeHoch: () => arme, licht: 1.0, dx: C.x, dz: C.z }; Z_.mengeZahl = { text: (i) => String(zahlVon(i) + (t >= T_PLUS ? 1 : 0)), farbe: GELB }; };
// Großbildschirm zeigt den Bürgermeister, der vorne auf dem Denkmal steht
const buehne = (t, redet = true) => { chef.visible = true; chef.position.copy(PL(0, 0, -23.4)); chef.rotation.y = (0) - Math.PI / 2; Fg.pose(chef, { ges: redet ? Fg.mund(t) : "froh", armR: 0.9 + 0.3 * Math.sin(t * 2), armRz: -0.2 });
  Al.kopfzahl(chef, String(1024 + (t >= T_PLUS ? 1 : 0)), { farbe: GELB, hoehe: 3.6 });
  Al.videowand.visible = true; Al.videowand.position.copy(PL(-14, 0, -21.5)); Al.videowand.rotation.y = (0.35) - Math.PI / 2; Al.videowand.scale.setScalar(1.1);
  Al.handyBlick(PL(0.5, 7.0, -14.5), PL(0, 5.4, -23.4), 44); };

// 0 Hook: Abend auf dem Platz, über allen Köpfen Zahlen
sh(E[0] + 0.06, (t, q) => { mengeAbend(t); kamera.fahrt(q, PL(9, 7.5, 31), PL(6, 7, 27), PL(0, 4.5, 10), PL(-1, 4.5, 8), 54); licht(1.2, "#ffd8b0", 1.0); });
// 1 Nah: eine Frau in der Menge, ihre Zahl springt beim Wort „gelogen“
sh(E[1] + 0.2, (t, q) => { mengeAbend(t); mama.visible = true; mama.position.copy(PL(-1, 0, 23)); mama.rotation.y = (Math.PI * 0.95) - Math.PI / 2; Fg.pose(mama, { ges: Fg.mund(t) });
  const sprung = t >= wz("gelogen", 1); Al.kopfzahl(mama, sprung ? "5" : "4", { farbe: GELB }); Z_.plus = { text: "+1", t0: wz("gelogen", 1), farbe: "gelb" };
  kamera.vorFigur(q, mama, 7.6, 6.6, -1.6, 1.4, 44); licht(1.3, "#ffd8b0", 1.0); wisch(t, 1); });
// 2 Küche, 8 Uhr: Papa mit der Drei
sh(E[2] + 0.06, (t, q) => { const R = Al.KUECHE; Al.raumlicht(R, 7); papa.visible = true; papa.position.copy(loc(R, -1.0, 0, -1.4)); papa.rotation.y = 0.15; Fg.pose(papa, { ges: "froh", armR: 1.2, armRz: -0.2 });
  Al.kopfzahl(papa, "3", { farbe: GELB }); kamera.fahrt(q, loc(R, 1.8, 4.4, 5.0), loc(R, 1.2, 4.3, 4.4), loc(R, -0.6, 4.0, -1.2), loc(R, -0.6, 4.0, -1.2), 54); licht(0.7, "#fff0dc", 0.4, "#ffe0c0"); wisch(t, 2); });
// 3 Mama hat gebacken, Papa lobt den Kuchen – Zahl springt auf 4? Nein: auf 3 (schon gezählt), hier zeigen wir den Moment davor
sh(E[3] + 0.06, (t, q) => { const R = Al.KUECHE; Al.raumlicht(R, 7);
  papa.visible = true; papa.position.copy(loc(R, -1.2, 0, -1.4)); papa.rotation.y = 0.3; const lob = t >= wz("super", 3) - 0.2; Fg.pose(papa, { ges: lob ? "lachen" : "schwitzen", armR: lob ? 2.4 : 0.5, armRz: -0.3 });
  mama.visible = true; mama.position.copy(loc(R, 1.6, 0, -1.2)); mama.rotation.y = -0.5; Fg.pose(mama, { ges: lob ? "lachen" : "froh", armL: 0.8 });
  Al.kopfzahl(papa, lob ? "3" : "2", { farbe: GELB }); Z_.plus = { text: "+1", t0: wz("super", 3) - 0.2, farbe: "gelb" };
  kamera.fahrt(q, loc(R, 1.6, 4.6, 5.0), loc(R, 1.2, 4.4, 4.4), loc(R, 0.0, 4.0, -0.8), loc(R, 0.0, 4.0, -0.8), 60); licht(0.7, "#fff0dc", 0.4, "#ffe0c0"); wisch(t, 3); });
// 4 Omas Stube: 47 – „erst sechzig“ macht 48
const omaStube = (t, q, nah) => { const R = Al.STUBE; Al.raumlicht(R); oma.visible = true; oma.position.copy(loc(R, 0.6, -0.05, -3.4)); oma.rotation.y = 0; Fg.pose(oma, { sitz: 1, ges: nah ? "lachen" : Fg.mund(t), armR: 0.2, armRz: -0.2 });
  const sprung = t >= wz("sechzig", 4); Al.kopfzahl(oma, sprung ? "48" : "47", { farbe: GELB }); if (nah) Z_.plus = { text: "+1", t0: wz("sechzig", 4), farbe: "gelb" }; };
sh(wz("sie", 4) - 0.05, (t, q) => { omaStube(t, q, false); const R = Al.STUBE; kamera.fahrt(q, loc(R, -2.8, 4.6, 4.8), loc(R, -2.2, 4.3, 3.8), loc(R, 0.6, 3.2, -2.6)); licht(0.6, "#ffe8d0", 0.4, "#f0d0ff"); wisch(t, 4); });
sh(E[4] + 0.06, (t, q) => { omaStube(t, q, true); kamera.vorFigur(q, oma, 7.4, 6.8, 1.4, 1.5, 44); licht(0.7, "#ffe8d0", 0.4, "#f0d0ff"); });
// 5 Bürgermeister vor dem Rathaus-Bildschirm: über tausend
sh(E[5] + 0.2, (t, q) => { tag(); chef.visible = true; chef.position.copy(PL(0, 0, 30)); chef.rotation.y = (0.15) - Math.PI / 2; Fg.pose(chef, { ges: "lachen", armR: 2.4, armL: 0.4 });
  Al.kopfzahl(chef, String(Math.round(B.zaehlen(t, wz("tausend", 5) - 0.6, wz("tausend", 5) + 0.3, 400, 1024))), { farbe: GELB, groesse: 1.2, hoehe: 3.6 });
  kamera.fahrt(q, PL(-3, 3.2, 42), PL(-2.4, 3.0, 39), PL(0, 5.6, 30), PL(0, 5.8, 30), 46); licht(1.4, "#ffd8b0", 1.0); wisch(t, 5); });
// 6 Und ich? Die Null – erst Gesicht, dann Blick nach oben zur Zahl
sh(wz("über", 6) - 0.05, (t, q) => { mengeAbend(t); platzFamilie(t, "ernst"); kamera.vorFigur(q, ich, 8.2, 7.4, -0.8, 0.9, 44); licht(1.3, "#ffd8b0", 1.0); wisch(t, 6); });
sh(E[6] + 0.06, (t, q) => { mengeAbend(t); platzFamilie(t, "ernst"); const k = Fg.kopfPos(ich);
  kamera.fahrt(q, PL(1.0, 2.6, 19.6), PL(0.8, 2.4, 20.2), V(k.x, k.y + 1.0, k.z), V(k.x, k.y + 1.8, k.z), 50); licht(1.3, "#ffd8b0", 1.0); });
// 7 Ich kann nicht lügen
sh(E[7] + 0.2, (t, q) => { mengeAbend(t); platzFamilie(t, t > wz("nicht", 7) + 1.2 ? "kneifen" : "reden"); kamera.vorFigur(q, ich, 6.0, 5.4, 1.0, 0.8, 44); licht(1.3, "#ffd8b0", 1.0); });
// 8 Klingt toll? Ist es aber nicht. (Schulterzucken, Schweiß)
sh(E[8] + 0.2, (t, q) => { mengeAbend(t); platzFamilie(t, t >= wz("ist", 8) ? "schwitzen" : "froh"); Fg.pose(ich, { ges: t >= wz("ist", 8) ? "schwitzen" : "froh", armL: 0.6, armR: 0.6, armLz: 0.5, armRz: -0.5 });
  kamera.vorFigur(q, ich, 6.8, 6.4, -1.2, 0.6, 46); licht(1.3, "#ffd8b0", 1.0); });
// 9 Klassenzimmer: „Hausaufgaben = doof“ an der Tafel, ich zeige auf
const klasse = (t, auf) => { const R = Al.KLASSE; Al.raumlicht(R); Al.schreibe(R.tafel, ["HAUSAUFGABEN", "SIND DOOF!"], { kreide: true, font: "700 150px 'Inter Display', sans-serif" });
  lehrer.visible = true; lehrer.position.copy(loc(R, -4.0, 0, -4.6)); lehrer.rotation.y = Math.PI * 0.12; Fg.pose(lehrer, { ges: auf ? "staunen" : "ernst", armR: auf ? 0.4 : 1.6, armRz: 0.3 });
  ich.visible = true; ich.position.set(R.plaetze[4].x, -0.05, R.plaetze[4].z - 0.2); ich.rotation.y = Math.PI; Fg.pose(ich, { sitz: 1, ges: auf ? "froh" : "ernst", armR: auf ? 2.9 : 0, armRz: 0.1 });
  freund.visible = true; freund.position.set(R.plaetze[1].x, -0.05, R.plaetze[1].z - 0.2); freund.rotation.y = Math.PI; Fg.pose(freund, { sitz: 1, ges: auf ? "staunen" : "kneifen", kopfDreh: auf ? 0.6 : 0 });
  kind3.visible = true; kind3.position.set(R.plaetze[7].x, -0.05, R.plaetze[7].z - 0.2); kind3.rotation.y = Math.PI; Fg.pose(kind3, { sitz: 1, ges: auf ? "staunen" : "froh", kopfDreh: auf ? -0.6 : 0 });
  Al.kopfzahl(ich, "0", { farbe: WEISS }); Al.kopfzahl(freund, "2", { farbe: GELB }); Al.kopfzahl(kind3, "1", { farbe: GELB }); Al.kopfzahl(lehrer, "6", { farbe: GELB }); };
sh(wz("ich", 9) - 0.1, (t, q) => { klasse(t, false); const R = Al.KLASSE; kamera.fahrt(q, loc(R, 1.4, 4.4, 5.2), loc(R, 1.2, 4.3, 4.6), loc(R, -0.9, 3.5, -5.6), loc(R, -0.9, 3.5, -5.6), 74); licht(0.6, "#fff4e0", 0.4, "#e0f0ff"); wisch(t, 9); });
sh(E[9] + 0.06, (t, q) => { klasse(t, true); const R = Al.KLASSE; kamera.fahrt(q, loc(R, -2.4, 4.6, -4.4), loc(R, -2.0, 4.4, -3.6), V(R.plaetze[4].x, 3.6, R.plaetze[4].z)); licht(0.6, "#fff4e0", 0.4, "#e0f0ff"); });
// 10 Omas Stube: ich im gestrickten Pulli – „Nein.“
sh(E[10] + 0.06, (t, q) => { const R = Al.STUBE; Al.raumlicht(R); const nein = t >= wz("nein", 10);
  oma.visible = true; oma.position.copy(loc(R, 1.4, -0.05, -3.4)); oma.rotation.y = -0.3; Fg.pose(oma, { sitz: 1, ges: nein ? "weinen" : "lachen", armR: nein ? 0 : 1.4 });
  ichPulli.visible = true; ichPulli.position.copy(loc(R, -1.4, 0, -1.2)); ichPulli.rotation.y = 0.5; Fg.pose(ichPulli, { ges: nein ? "kneifen" : "schwitzen", armL: 0.2, armR: 0.2 });
  Al.kopfzahl(ichPulli, "0", { farbe: WEISS }); Al.kopfzahl(oma, "48", { farbe: GELB });
  kamera.fahrt(q, loc(R, -0.6, 4.4, 5.4), loc(R, -0.4, 4.2, 4.6), loc(R, 0, 3.2, -2.2)); licht(0.6, "#ffe8d0", 0.4, "#f0d0ff"); wisch(t, 10); });
// 11 Vorstadt am Tag: Verstecken hinter dem Baum – „Ja.“
const verstecken = (t) => { tag(); const P = Al.VORSTADT.pos; const ja = t >= wz("ja", 11);
  ich.visible = true; ich.position.copy(P(16.6, 0.04, 27.6)); ich.rotation.y = (ja ? -2.4 : -0.6) - Math.PI / 2; Fg.pose(ich, { ges: ja ? "froh" : "kneifen", armR: ja ? 2.6 : 0 });
  freund.visible = true; freund.position.copy(P(9.5, 0.3, 36)); freund.rotation.y = (2.5) - Math.PI / 2; Fg.pose(freund, { ges: ja ? "staunen" : "reden", armL: 1.2, armR: 1.2, armLz: 0.3, armRz: -0.3 });
  Al.kopfzahl(ich, "0", { farbe: WEISS }); };
sh(wz("ich", 11) - 0.1, (t, q) => { verstecken(t); const P = Al.VORSTADT.pos; kamera.fahrt(q, P(8.0, 4.6, 19), P(8.6, 4.4, 20.2), P(15.4, 3.0, 28.8), P(15.6, 3.0, 28.6), 58); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 11); });
sh(E[11] + 0.2, (t, q) => { verstecken(t); const P = Al.VORSTADT.pos; kamera.fahrt(q, P(13.2, 3.9, 21.6), P(13.6, 3.8, 22.6), P(16.6, 3.4, 27.6)); licht(1.6, "#fff4e0", 1.0, "#ffffff"); });
// 12 Aber heute Abend … Stadt von oben
sh(E[12] + 0.3, (t, q) => { abend(); const P0 = Al.BUNTDORF.pos; kamera.fahrt(q, P0(0, 34, -150), P0(0, 30, -130), P0(0, 6, 40), P0(10, 6, 30), 56); licht(1.0, "#ffd8b0", 0.8); wisch(t, 12); });
// 13 Die ganze Stadt auf dem Platz
sh(E[13] + 0.06, (t, q) => { mengeAbend(t); platzFamilie(t, "staunen"); buehne(t, false); kamera.fahrt(q, PL(0, 9, 44), PL(0, 10, 40), PL(-6, 6, -4), PL(-8, 8, -12), 54); licht(1.2, "#ffd8b0", 1.0); wisch(t, 13); });
// 14 Bürgermeister auf dem Großbildschirm
sh(E[14] + 0.06, (t, q) => { mengeAbend(t); platzFamilie(t, "staunen"); buehne(t); kamera.fahrt(q, PL(4, 5, 34), PL(3, 6, 30), PL(-14, 13, -21.5), PL(-14, 14.5, -21.5), 50); licht(1.2, "#ffd8b0", 1.0); });
// 15 „Heute Nacht ist die Stadt vollkommen sicher.“ – nah am Bildschirm, dann Familie hört zu
sh(wz("vollkommen", 15) - 0.1, (t, q) => { mengeAbend(t); Z_.mengeZahl = null; buehne(t); kamera.fahrt(q, PL(-9, 12, -4), PL(-10, 12.5, -6), PL(-14, 15, -21.5), PL(-14, 15.4, -21.5), 46); licht(1.2, "#ffd8b0", 1.0); });
sh(E[15] + 0.2, (t, q) => { mengeAbend(t); platzFamilie(t, "froh"); buehne(t); kamera.fahrt(q, PL(2, 5.6, 33), PL(1.6, 5.4, 32), PL(0, 4.2, 24), PL(0, 4.2, 24), 48); licht(1.3, "#ffd8b0", 1.0); });
// 16 Alle Zahlen springen um eins
sh(E[16] + 0.06, (t, q) => { mengeAbend(t, 0); platzFamilie(t, t >= T_PLUS ? "staunen" : "froh"); buehne(t, false); Z_.plus = { text: "+1 BEI ALLEN", t0: T_PLUS, farbe: "gelb" };
  kamera.fahrt(q, PL(14, 13, 46), PL(10, 15, 42), PL(0, 4, 10), PL(0, 4, 8), 56); licht(1.2, "#ffd8b0", 1.0); wisch(t, 16); });
// 17 Auch bei Papa, auch bei Oma
sh(wz("papa", 17) - 0.15, (t, q) => { mengeAbend(t); platzFamilie(t); kamera.fahrt(q, PL(0, 8, 40), PL(0, 8.5, 37), PL(0, 5, 22)); licht(1.2, "#ffd8b0", 1.0); });
sh(wz("oma", 17) - 0.1, (t, q) => { mengeAbend(t); platzFamilie(t); Fg.pose(papa, { ges: "angst" }); kamera.vorFigur(q, papa, 6.6, 6.0, 0.8, 1.6, 44); licht(1.3, "#ffd8b0", 1.0); wisch(t, 17); });
sh(E[17] + 0.2, (t, q) => { mengeAbend(t); platzFamilie(t); Fg.pose(oma, { ges: "angst" }); kamera.vorFigur(q, oma, 6.4, 5.8, -0.8, 1.6, 44); licht(1.3, "#ffd8b0", 1.0); });
// 18 Klicken über mir – Gesicht nah, Zahl noch außerhalb des Bildes
sh(E[18] + 0.06, (t, q) => { mengeAbend(t); platzFamilie(t, t >= T_KLICK ? "staunen" : "ernst"); Fg.pose(ich, { ges: t >= T_KLICK ? "staunen" : "ernst", kopfNeig: t >= T_KLICK ? -0.35 : -0.1 });
  kamera.vorFigur(q, ich, 5.0, 4.4, -0.5, 0.0, 42); licht(1.7, "#e0d8ff", 1.0); Z_.vignette = 0.5; wisch(t, 18); });
// 19 Ich hatte nichts gesagt
sh(E[19] + 0.2, (t, q) => { mengeAbend(t); platzFamilie(t, "angst"); Fg.pose(ich, { ges: "angst", armL: 1.0, armR: 1.0, armLz: 0.6, armRz: -0.6 }); kamera.vorFigur(q, ich, 5.6, 5.0, 1.2, 0.3, 44); licht(1.7, "#e0d8ff", 1.0); Z_.vignette = 0.5; });
// 20 Die rote Eins – von unten, langsam näher
sh(E[20] + 0.3, (t, q) => { mengeAbend(t); platzFamilie(t, "angst"); Fg.pose(ich, { ges: "angst", kopfNeig: -0.4 }); const k = Fg.kopfPos(ich);
  kamera.fahrt(q, PL(0.8, 2.8, 20.4), PL(0.6, 3.0, 21.4), V(k.x, k.y + 1.4, k.z), V(k.x, k.y + 2.0, k.z), 52); licht(1.7, "#e0d8ff", 1.0, "#ff6a6a"); Z_.vignette = 0.55; wisch(t, 20); });
// 21–23 Mitmach-Frage: ich schaue zur roten Eins hoch
sh(DAUER + 1, (t, q) => { mengeAbend(t); platzFamilie(t, "angst"); Fg.pose(ich, { ges: "angst", kopfNeig: -0.3 }); kamera.fahrt(q, PL(2.2, 4.0, 17.6), PL(1.8, 4.2, 18.4), PL(0, 5.4, 25), PL(0, 5.6, 25), 50); licht(1.7, "#e0d8ff", 1.0, "#ff6a6a"); });

B.start({ grund: (t) => {}, frage: { zeile: 21, text: "Was soll ich tun?", karten: [["A", "👨", "Papa fragen", "papa"], ["B", "🎩", "Zum Bürgermeister", "bürgermeister"], ["C", "🔍", "Lüge selbst suchen", "lüge"]] } });
