// Folge 4 „Leuchten“ – setzt die Abstimmung zu Folge 3 um (A: alle reinlassen, 4:0:0).
// Neue Elemente: Schatten-Zähler (44), Zeitraffer mit Uhr (Wecker 06:00, Küchenuhr 07:00/08:00), Kühlschrank mit Tür (neu, objekte.js),
// Bauhelm in der Hand (neu), Kuchen + Teller verschwinden (STUBE), Fernseher zeigt den Riesen-Schatten, glückliche Schatten leuchten golden
// (neu, wesen.js gold), Party mit Konfetti + Banner + Musik-Handy, leuchtendes Haus (neu, alltag.js leuchtfassade), schwarzer
// Schattenfänger-Lastwagen (werkstattwagen mit kasten/schrift), Mann mit Sonnenbrille an der Klingel.
import * as B from "../folge.js";
import * as O from "../objekte.js";
const { V, sh, blick, licht, kamera, ease, easeIO, lerp, lerpV, Fg, Al, Rq, Wt, Ws, Z_ } = B;
await B.laden(); const { Z, E, DAUER } = B.F;
// Englische Fassung (?sprache=en): deutsche Stichwörter → englische Wörter derselben Zeile
const EN = { aufgemacht: "opened", vierundvierzig: "little", hunger: "hungry", aufgegessen: "ate", leer: "empty", "gerülpst": "burped", drei: "three", gegessen: "ate", teller: "plate",
  endlich: "finally", "glücklich": "happy", oma: "grandma", gekichert: "giggled", golden: "gold", zweite: "second", alle: "all", lastwagen: "truck", geklingelt: "rang" };
const wz = (w, i) => B.F.wz(B.SPRACHE === "en" ? (EN[w] ?? w) : w, i);

const S = { struktur: true };
const ich = Fg.figur({ haut: "#f0c8a0", hemd: "#e8a020", hose: "#2a3a5a", haare: "#5a3418", frisur: "strubbel", kapuze: true, skala: 0.78, schuhe: "#e8e8e8", ...S });
const papa = Fg.figur({ haut: "#d89a6a", hemd: "#2a3a5a", aermel: "#2a3a5a", weste: "#ff7a1a", hose: "#2a2a30", haare: "#3a2414", skala: 1.1, ...S });   // ohne Helm (Helm in der Hand)
const oma = Fg.figur({ haut: "#f2d0b0", hemd: "#8a4a6a", stoff: true, hose: "#4a3a4a", haare: "#e0e0e0", frisur: "dutt", brille: true, schal: "#c8a050", skala: 0.95, ...S });
const mann = Fg.figur({ haut: "#e8c0a0", hemd: "#f4f4f4", jacke: "#121216", hose: "#121216", haare: "#141414", frisur: "kurz", sonnenbrille: true, schuhe: "#0a0a0a", skala: 1.12, ...S });

const cam = Wt.cam;
const loc = (R, x, y, z) => V(R.g.position.x + x, y, R.g.position.z + z);
const zm = Rq.zimmer; const ZI = (x, y, z) => { zm.updateMatrixWorld(true); return V(x, y, z).applyMatrix4(zm.matrixWorld); };
const RZ = Math.PI / 4;   // Drehung des Kinderzimmers: lokale Richtung a → Welt-ry = RZ + a (a = 0 zur Rückwand, π zum Fenster)
const FENSTER = (x, y, z) => ZI(x, y, -6 + z);
const wisch = (t, i, d = 0) => { Wt.grade.uniforms.uWisch.value = B.wisch(t, Z[i] - 0.06 + d); };
const zurKamera = (p) => Math.atan2(cam.position.x - p.x, cam.position.z - p.z);

// ---------- Bibliothek ----------
const KU = Al.KUECHE, ST = Al.STUBE;
const kuehl = O.kuehlschrank(); kuehl.position.copy(loc(KU, 4.6, 0, -4.3)); Wt.scene.add(kuehl); kuehl.visible = false;
const helm = O.helm(); Wt.scene.add(helm); helm.visible = false;
const uhr = Al.leinwand(1.9, 0.8, { px: 512, leuchtet: true, hell: 1.4 }); Wt.scene.add(uhr); uhr.visible = false;
const uhrZeigen = (txt, x) => { uhr.visible = true; uhr.position.copy(loc(KU, x, 5.95, -5.33)); Al.schreibe(uhr, [txt], { bg: "#111", fg: "#ff3a2a", font: "700 300px 'DejaVu Sans Mono', monospace" }); };
const banner = Al.leinwand(6.5, 1.6, { px: 1024 }); Wt.scene.add(banner); banner.visible = false;
Al.schreibe(banner, ["PARTY!"], { bg: "#e83a7a", fg: "#ffe53a", font: "900 330px 'Inter Display', sans-serif" });
const wagen = O.werkstattwagen({ farbe: "#1a1a22", kasten: "#141418", schrift: "#7aff5a", text: B.T({ de: "SCHATTENFÄNGER", en: "SHADOW CATCHER" }) }); Wt.scene.add(wagen); wagen.visible = false;
const klingel = Al.leinwand(1.1, 1.6, { px: 512, leuchtet: true, hell: 1.1 }); Wt.scene.add(klingel); klingel.visible = false;
klingel.userData.zeichne((x, w, h) => { x.fillStyle = "#c8ccd4"; x.fillRect(0, 0, w, h); x.fillStyle = "#9aa0a8"; x.fillRect(14, 14, w - 28, h - 28);
  for (let i = 0; i < 4; i++) { const y = 70 + i * 170; x.fillStyle = "#f4f2ea"; x.fillRect(40, y, w - 170, 110); x.fillStyle = "#1a1a1a"; x.font = "700 58px 'Inter Display', sans-serif"; x.textAlign = "left"; x.textBaseline = "middle";
    x.fillText(["Huber", "Yilmaz", "Wir ✦", "Novak"][i], 56, y + 56); x.fillStyle = i === 2 ? "#ffd04a" : "#e8e8e8"; x.beginPath(); x.arc(w - 72, y + 55, 40, 0, 7); x.fill(); x.strokeStyle = "#555"; x.lineWidth = 6; x.stroke(); } });
const tuerHaus = Al.leinwand(5.4, 7.5, { px: 512 }); Wt.scene.add(tuerHaus); tuerHaus.visible = false;
tuerHaus.userData.zeichne((x, w, h) => { x.fillStyle = "#3a2618"; x.fillRect(0, 0, w, h); x.fillStyle = "#4e3422"; x.fillRect(30, 30, w - 60, h - 60); x.fillStyle = "#8ab0d8"; x.fillRect(80, 80, w - 160, h * 0.42);
  x.strokeStyle = "#2a1a10"; x.lineWidth = 14; x.strokeRect(80, 80, w - 160, h * 0.42); x.fillStyle = "#c8a050"; x.beginPath(); x.arc(w - 90, h * 0.62, 22, 0, 7); x.fill(); });

// Kinderzimmer-Licht: Lichterkette, Lampe aus; golden, wenn die Schatten leuchten
const kette = (gold = 0) => { Rq.ZIMMER.schirm.material = Rq.ZIMMER.schirmAus; Rq.ZIMMER.lichterkette.visible = true; Rq.ZIMMER.licht.intensity = 7 + gold * 55; Rq.ZIMMER.licht.color.set(gold > 0.02 ? "#ffb040" : "#ffb060"); Wt.hemi.intensity = 0.3 + gold * 0.25; };
const wohnung = () => { Wt.U.uAus.value = 1e6; };

// ---------- 44 Schatten: draußen vor dem Fenster (wie Folge 3) → Plätze im Zimmer ----------
const R = (() => { let s = 11; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
const DRAUSSEN = []; for (let i = 0; i < 44; i++) DRAUSSEN.push([(R() - 0.5) * 16, 1.4 + R() * 6.5, -1.2 - R() * 9, 0.35 + R() * 0.3, R() * 6]);
const PLATZ = []; { let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  // Bett (Oberkante y ≈ 2.0), Regal (y 4.55), Fensterbank innen (y 2.55), Nachttisch (y 2.0), Rest auf dem Boden
  const bett = [[-3.4, 0.0], [-2.2, -0.6], [-1.0, 0.2], [-3.2, 1.6], [-1.6, 1.8], [-2.6, 3.2], [-1.2, 3.6], [-3.4, 4.2]]; bett.forEach(([x, z]) => PLATZ.push([x, 2.02, z, 0.36]));
  [[5.5, -1.0], [5.5, 0.9]].forEach(([x, z]) => PLATZ.push([x, 4.6, z, 0.3]));
  [[-1.6, -5.6], [1.7, -5.6]].forEach(([x, z]) => PLATZ.push([x, 2.62, z, 0.3]));
  PLATZ.push([1.6, 2.02, 4.7, 0.3]);
  let n = 0; while (PLATZ.length < 44 && n < 5000) { n++; const x = -5.2 + r() * 10.4, z = -4.8 + r() * 10.0;
    if (x < 0.1 && x > -4.5 && z > -2.5 && z < 5.4) continue; if (x > 0.2 && x < 2.3 && z > 3.4) continue; if (Math.hypot(x - 1.3, z + 0.9) < 1.8 || Math.hypot(x - 3.6, z + 2.6) < 1.5 || Math.hypot(x - 3.8, z - 2.6) < 1.7) continue;   // Platz für ich, Oma, Papa (Party)
    if (PLATZ.some(p => p[1] < 0.1 && Math.hypot(p[0] - x, p[2] - z) < 1.25)) continue; PLATZ.push([x, 0, z, 0.36 + r() * 0.12]); } }
const PH = PLATZ.map((_, i) => (i * 2.399) % 6.28);
const T_REIN = Z[1] + 0.1, T_REIN1 = wz("vierundvierzig", 2) + 0.15;            // Einzug: Schatten k kommt bei T_REIN + k·dt herein
const DT = (T_REIN1 - T_REIN - 0.8) / 43;
const EIN = (k) => T_REIN + k * DT;
// Wann leuchtet Schatten k golden (Zeile 17: der erste, 18: der zweite, dann alle)
const T_G1 = wz("golden", 17) - 0.15, T_G2 = wz("zweite", 18) - 0.1, T_GA = wz("alle", 18) - 0.05;
const GOLD_T = PLATZ.map((_, k) => k === 2 ? T_G1 : k === 4 ? T_G2 : T_GA + ((k * 7) % 44) / 44 * 1.1);
const goldVon = (t, k) => easeIO((t - GOLD_T[k]) / 0.55);
const zaehlGold = (t) => PLATZ.reduce((n, _, k) => n + (t >= GOLD_T[k] + 0.2 ? 1 : 0), 0);
// Position von Schatten k zur Zeit t (draußen → durchs Fenster → Platz)
const schattenPos = (k, t, o = {}) => { const d = DRAUSSEN[k], p = PLATZ[k], dt = t - EIN(k);
  const aussen = FENSTER(d[0] * 0.5, d[1] * 0.6 + 1.4 + Math.sin(t * 1.2 + d[4]) * 0.15, d[2] * 0.7 - 0.6);
  const ziel = ZI(p[0], p[1], p[2]);
  if (dt <= 0) return [aussen, d[3] * 0.85];
  const u = Math.min(1, dt / 0.8), fen = FENSTER(0, 3.4, 0.4);
  const a = u < 0.45 ? lerpV(aussen, fen, easeIO(u / 0.45)) : lerpV(fen, ziel, easeIO((u - 0.45) / 0.55)); a.y += Math.sin(u * Math.PI) * 0.8;
  return [a, lerp(d[3] * 0.85, p[3], u)]; };
// alle 44 zeichnen. o.huepf (Party), o.zittern, o.blick (0 = zur Kamera), o.augen, o.gold (Zeit), o.versteckt (hinter mir)
const alle = (t, o = {}) => { for (let k = 0; k < 44; k++) { let [p, g] = schattenPos(k, o.einzug ? t : 1e9, o); p = p.clone();
    if (o.huepf) p.y += Math.max(0, Math.sin(t * 7.5 + PH[k] * 1.7)) * 0.55 * o.huepf;
    if (o.zittern) p.x += Math.sin(t * 13 + PH[k] * 3) * 0.035 * o.zittern;
    if (o.versteckt) { const v = VERSTECK[k]; p = ZI(v[0], v[1], v[2]); g = v[3]; }
    const ry = o.blick === "fenster" ? RZ + Math.PI : zurKamera(p) + Math.sin(PH[k]) * 0.25;
    const gold = o.gold ? goldVon(t, k) * (o.goldMax ?? 1) : (o.goldAlle ?? 0);
    B.schatten(2 + k, p.x, p.z, ry, { y: p.y, g, kriech: o.kriech ?? 0.3, augen: typeof o.augen === "function" ? o.augen(k) : (o.augen ?? 1), gold }); } };
// Versteck hinter mir (Schlussbild): eng um ICH_FRAGE herum, zur Kamera
const ICH_F = [1.0, 0, -1.4];
const VERSTECK = (() => { const out = [], reihen = [[-0.3, 7, 3.0], [0.9, 11, 4.4], [2.3, 12, 5.0], [3.8, 14, 5.4]];
  for (const [dz, n, breite] of reihen) for (let i = 0; i < n; i++) { const x = ICH_F[0] + (i / (n - 1) - 0.5) * 2 * breite + (dz % 1) * 0.3, z = ICH_F[2] + 1.0 + dz;
    const bett = x < -0.1 && x > -4.3 && z > -2.2 && z < 5.2; if (Math.abs(x - ICH_F[0]) < 0.9 && dz < 0) continue; out.push([x, bett ? 2.02 : 0, z, 0.34]); }
  while (out.length < 44) out.push([4.8, 0, 4.6 - out.length * 0.05, 0.3]); return out.slice(0, 44); })();

// ===== 0 Fenster auf: ich am Fenster, draußen die vielen Schatten
const amFenster = (ges, arme) => { ich.visible = true; ich.position.copy(ZI(0.4, 0, -4.6)); ich.rotation.y = RZ + Math.PI; Fg.pose(ich, { ges, armL: arme, armR: arme, kopfNeig: -0.15 }); };
sh(E[0] + 0.1, (t, q) => { wohnung(); kette(); const k = ease((t - wz("aufgemacht", 0) + 0.4) / 0.6); amFenster("staunen", 0.3 + 2.3 * k); alle(t, { einzug: true });
  kamera.fahrt(q, ZI(3.0, 3.6, -0.5), ZI(2.8, 3.7, -0.9), FENSTER(-0.4, 3.2, -1), FENSTER(-0.4, 3.4, -1), 58); licht(0.45, "#ffb060", 0.6, "#a080ff"); });
// ===== 1 Einer nach dem anderen kommen sie rein (Zähler zählt mit)
const zaehler = (t) => { const n = PLATZ.reduce((s2, _, k) => s2 + (t >= EIN(k) + 0.55 ? 1 : 0), 0); if (n > 0) Z_.zaehler = { wert: n, farbe: "gelb", vorzeichen: false, einheit: B.T({ de: " Schatten", en: " shadows" }) }; };
const daneben = (ges) => { ich.visible = true; ich.position.copy(ZI(1.3, 0, -0.9)); ich.rotation.y = RZ + Math.PI - 0.5; Fg.pose(ich, { ges, armL: 0.5, armR: 0.5, kopfNeig: -0.1 }); };
sh(E[1] + 0.1, (t, q) => { wohnung(); kette(); daneben("staunen"); alle(t, { einzug: true }); zaehler(t);
  kamera.fahrt(q, ZI(4.4, 6.4, 4.8), ZI(3.8, 6.0, 4.2), ZI(-0.6, 2.6, -3.2), ZI(-0.6, 2.4, -2.6), 60); licht(0.45, "#ffb060", 0.6, "#a080ff"); wisch(t, 1); });
// ===== 2 Vierundvierzig! In meinem Zimmer
sh(E[2] + 0.15, (t, q) => { wohnung(); kette(); ich.visible = true; ich.position.copy(ZI(1.3, 0, -0.9)); ich.rotation.y = RZ + Math.PI; Fg.pose(ich, { ges: "staunen", armL: 1.9, armR: 1.9, armLz: 0.5, armRz: -0.5 });
  alle(t, { einzug: true }); zaehler(t); kamera.fahrt(q, ZI(-0.8, 7.5, -5.6), ZI(-0.6, 7.3, -5.3), ZI(1.0, 0.4, 2.8), ZI(1.0, 0.6, 2.6), 70); licht(0.5, "#ffb060", 0.6, "#a080ff"); wisch(t, 2); });
// ===== 3 Eiskalt, sie zittern (auf dem Bett, unter der Lichterkette)
sh(E[3] + 0.1, (t, q) => { wohnung(); kette(); alle(t, { zittern: 1, augen: 0.6, kriech: 0.1 });
  kamera.fahrt(q, ZI(-1.4, 3.0, -3.4), ZI(-1.5, 2.9, -2.9), ZI(-2.2, 2.4, 0.6), ZI(-2.2, 2.4, 0.8), 50); licht(0.4, "#ffb060", 0.6, "#a080ff"); wisch(t, 3); });
// ===== 4 Riesiger Hunger: alle drehen sich zur Kamera, Arme nach vorn
sh(E[4] + 0.15, (t, q) => { wohnung(); kette(); const k = ease((t - wz("hunger", 4) + 0.3) / 0.5); alle(t, { kriech: 0.2 + 0.9 * k, augen: 1 });
  kamera.fahrt(q, ZI(3.6, 1.2, 0.4), ZI(3.3, 1.1, 0.0), ZI(1.0, 0.8, -3.0), ZI(1.0, 0.8, -3.0), 52); licht(0.4, "#ffb060", 0.6, "#a080ff"); wisch(t, 4); });
// ===== 5 06:00 – sie essen meinen Wecker
const T_WECK = wz("aufgegessen", 5);
sh(E[5] + 0.1, (t, q) => { wohnung(); kette(); Rq.weckerZeichnen("06:00", true); const weg = t > T_WECK + 0.15; Rq.ZIMMER.weckerG.visible = Rq.ZIMMER.anzeige.visible = !weg;
  Wt.hemi.intensity = 0.55; Rq.ZIMMER.mond.color.set("#b0c8ff"); const k = ease((t - Z[5] - 0.3) / (T_WECK - Z[5] - 0.2)); const p = lerpV(ZI(1.9, 2.02, 4.6), ZI(0.9, 2.02, 4.15), k);
  if (weg) p.y += Math.max(0, Math.sin((t - T_WECK - 0.15) * 9)) * 0.25 * Math.max(0, 1 - (t - T_WECK) * 1.5);
  B.schatten(2, p.x, p.z, zurKamera(p) - 0.3, { y: p.y, g: weg ? 0.36 : 0.3, kriech: weg ? 0.2 : 0.9, augen: 1 });
  kamera.fahrt(q, ZI(-0.3, 2.75, 1.9), ZI(-0.1, 2.7, 2.3), ZI(1.0, 1.85, 4.2), ZI(1.0, 1.85, 4.2), 44); licht(0.5, "#c8d8ff", 0.5, "#ffb060"); wisch(t, 5); });
// ===== 6 07:00 – Papa macht den Kühlschrank auf: leer
const T_AUF = Z[6] + 0.9, T_LEER = wz("leer", 6);
const kueche = (t, ges, o = {}) => { Al.raumlicht(KU); KU.kuehl.forEach(m => m.visible = false); kuehl.visible = true; kuehl.userData.setze(easeIO((t - T_AUF) / 0.7));
  papa.visible = true; papa.position.copy(loc(KU, o.x ?? 4.3, 0, -0.5)); papa.rotation.y = Math.PI + (o.dreh ?? 0); Fg.pose(papa, { ges, armR: o.armR ?? 0.3, armL: 0.3, kopfNeig: o.kopfNeig ?? 0.15 }); };
sh(T_LEER - 0.1, (t, q) => { kueche(t, "froh", { armR: t < T_AUF + 0.6 ? 1.3 : 0.4 }); uhrZeigen("07:00", 4.6);
  kamera.fahrt(q, loc(KU, -3.6, 4.6, 2.6), loc(KU, -3.2, 4.4, 2.2), loc(KU, 3.8, 3.4, -2.6), loc(KU, 3.9, 3.5, -2.8), 58); licht(0.6, "#fff4e0", 0.4, "#e0f0ff"); wisch(t, 6); });
// Blick aus dem Kühlschrank: Papa staunt, die Fächer sind leer
sh(E[6] + 0.1, (t, q) => { kueche(t, "staunen", { kopfNeig: 0.25 });
  kamera.fahrt(q, loc(KU, 4.5, 3.3, -4.9), loc(KU, 4.5, 3.3, -4.7), Fg.kopfPos(papa).add(V(0, -0.4, 0)), Fg.kopfPos(papa).add(V(0, -0.4, 0)), 58); licht(0.6, "#e8f4ff", 0.4, "#e0f0ff"); });
// ===== 7 Nur ein Schatten saß noch drin und hat gerülpst
const T_RUELPS = wz("gerülpst", 7);
sh(E[7] + 0.2, (t, q) => { kueche(t, "staunen", { kopfNeig: 0.3, x: 4.9, dreh: 0.15 }); const p = loc(KU, 4.5, 2.8, -4.2); const b = Math.max(0, Math.sin((t - T_RUELPS) * 10)) * (t > T_RUELPS && t < T_RUELPS + 0.32 ? 1 : 0);
  B.schatten(2, p.x, p.z, 0, { y: p.y + b * 0.15, g: 0.32 * (1 + b * 0.15), kriech: 0.1, augen: t > T_RUELPS && t < T_RUELPS + 0.5 ? 0.25 : 1 });
  if (t > T_RUELPS - 0.05 && t < T_RUELPS + 1.4) Al.kopfzahl(V(p.x - 0.3, p.y + 1.35, p.z + 0.4), B.T({ de: "RÜLPS!", en: "BURP!" }), { farbe: "#ffe53a", groesse: 0.42 });
  kamera.fahrt(q, loc(KU, 2.6, 4.1, -0.6), loc(KU, 2.9, 3.9, -1.1), p.clone().add(V(0, 0.35, 0)), p.clone().add(V(0, 0.35, 0)), 48); licht(0.6, "#e8f4ff", 0.4, "#e0f0ff"); wisch(t, 7); });
// ===== 8 08:00 – Papa will den Helm aufsetzen: drei sitzen drin
const T_DREI = wz("drei", 8);
const helmPapa = (t, oben) => { Al.raumlicht(KU); papa.visible = true; papa.position.copy(loc(KU, -4.0, 0, 0.4)); papa.rotation.y = 0.3;
  Fg.pose(papa, { ges: oben ? "froh" : "staunen", armL: oben ? 2.75 : 1.35, armR: oben ? 2.75 : 1.35, armLz: oben ? 0.25 : 0.35, armRz: oben ? -0.25 : -0.35, kopfNeig: oben ? -0.1 : 0.5 });
  const k = Fg.kopfPos(papa), f = V(Math.sin(papa.rotation.y), 0, Math.cos(papa.rotation.y)); helm.visible = true;
  if (oben) { helm.position.copy(k).add(V(0, 0.95, 0)).addScaledVector(f, 0.2); helm.rotation.set(0, papa.rotation.y, 0); }
  else { helm.position.copy(k).add(V(0, -1.55, 0)).addScaledVector(f, 1.25); helm.rotation.set(Math.PI, papa.rotation.y, 0); } return { k, f }; };
sh(T_DREI - 0.15, (t, q) => { helmPapa(t, true); uhrZeigen("08:00", -2.3);
  kamera.fahrt(q, loc(KU, -2.2, 3.4, 5.2), loc(KU, -2.4, 3.5, 5.0), loc(KU, -3.8, 4.9, 0.6), loc(KU, -3.8, 5.0, 0.6), 60); licht(0.6, "#fff4e0", 0.4, "#e0f0ff"); wisch(t, 8); });
sh(E[8] + 0.15, (t, q) => { const { k, f } = helmPapa(t, false); const h = helm.position;
  [[-0.32, 0.0], [0.3, -0.12], [0.0, 0.3]].forEach(([dx, dz], i) => { const p = h.clone().add(V(dx, 0.05 + Math.sin(t * 3 + i * 2) * 0.03, dz)); B.schatten(2 + i, p.x, p.z, zurKamera(p) + (i - 1) * 0.3, { y: p.y, g: 0.15, kriech: 0.1, augen: 1 }); });
  const sd = V(f.z, 0, -f.x); const von = h.clone().addScaledVector(f, 1.5).addScaledVector(sd, 0.3).add(V(0, 2.3, 0)); kamera.fahrt(q, von, von.clone().addScaledVector(f, -0.15).add(V(0, -0.1, 0)), h.clone().add(V(0, 0.5, 0)).addScaledVector(f, -0.6), h.clone().add(V(0, 0.55, 0)).addScaledVector(f, -0.6), 52);
  licht(0.6, "#fff4e0", 0.5, "#e0f0ff"); wisch(t, 8, T_DREI - Z[8] - 0.1); });
// ===== 9 Bei Oma: der ganze Kuchen – mit Teller
const T_KUCHEN = wz("gegessen", 9), T_TELLER = wz("teller", 9);
const stube = (t, o = {}) => { Al.raumlicht(ST, 10); oma.visible = true; oma.position.copy(loc(ST, 1.2, -0.05, -3.4)); oma.rotation.y = 0;
  Fg.pose(oma, { sitz: 1, ges: o.oma ?? "lachen", kopfNeig: o.omaNeig ?? 0.1, armL: o.armL ?? 1.0, armR: o.armR ?? 1.0, armLz: 0.3, armRz: o.armRz ?? -0.3, kopfDreh: o.omaDreh ?? 0 });
  if (o.ich) { ich.visible = true; ich.position.copy(loc(ST, -1.2, -0.05, -3.4)); ich.rotation.y = 0.1; Fg.pose(ich, { sitz: 1, ges: o.ich, kopfDreh: o.ichDreh ?? 0 }); } };
const TISCH = [[0.6, 0.85], [1.4, 0.55], [-0.2, 0.9], [1.25, -0.2], [-0.9, 0.4]];
sh(E[9] + 0.15, (t, q) => { stube(t, { oma: "staunen", ich: "lachen" }); ST.kuchen.visible = t < T_KUCHEN + 0.1; ST.teller.visible = t < T_TELLER + 0.1;
  TISCH.forEach(([x, z], i) => { const p = loc(ST, x, 1.42, z); const happ = Math.max(0, Math.sin(t * 6 + i * 1.3)) * 0.12; B.schatten(2 + i, p.x, p.z, Math.atan2(0.6 - x, 0.3 - z), { y: p.y + happ, g: 0.26, kriech: 0.6 + 0.4 * Math.sin(t * 5 + i), augen: 1 }); });
  kamera.fahrt(q, loc(ST, -1.8, 3.2, 4.0), loc(ST, -1.5, 3.0, 3.5), loc(ST, 0.5, 1.9, 0.1), loc(ST, 0.5, 1.9, 0.1), 50); licht(0.6, "#ffe8d0", 0.4, "#f0d0ff"); wisch(t, 9); });
// ===== 10 Oma lacht: Endlich mal Besuch, der meinen Kuchen mag
const SCHOSS = [[0.7, 2.0, -2.6], [1.7, 2.0, -2.6], [2.5, 1.95, -3.2]];
const schoss = (t, o = {}) => SCHOSS.forEach(([x, y, z], i) => { const p = loc(ST, x, y, z); B.schatten(2 + i, p.x, p.z, zurKamera(p), { y: p.y + Math.max(0, Math.sin(t * 5 + i)) * (o.huepf ?? 0.1), g: 0.22, kriech: 0.2, augen: o.augen ?? 1, gold: i === 1 ? (o.gold ?? 0) : 0 }); });
sh(E[10] + 0.2, (t, q) => { stube(t, { oma: t > wz("endlich", 10) - 0.1 ? Fg.mund(t) : "lachen", omaNeig: -0.1, armL: 0.8, armR: 0.8 }); ST.kuchen.visible = ST.teller.visible = false; schoss(t);
  const k = Fg.kopfPos(oma); kamera.fahrt(q, k.clone().add(V(-1.6, -0.2, 5.6)), k.clone().add(V(-1.3, -0.25, 5.0)), k.clone().add(V(0, -1.1, 0)), k.clone().add(V(0, -1.05, 0)), 50); licht(0.6, "#ffe8d0", 0.4, "#f0d0ff"); wisch(t, 10); });
// ===== 11 Doch dann guckt Oma ganz ernst
sh(E[11] + 0.15, (t, q) => { stube(t, { oma: "ernst", omaNeig: 0.3, armL: 0.8, armR: 0.8 }); ST.kuchen.visible = ST.teller.visible = false; schoss(t, { huepf: 0 }); Al.raumlicht(ST, 6);
  const k = Fg.kopfPos(oma); kamera.fahrt(q, k.clone().add(V(0.7, -0.1, 4.0)), k.clone().add(V(0.6, -0.15, 3.3)), k.clone().add(V(0, -0.6, 0)), k.clone().add(V(0, -0.6, 0)), 46); licht(0.45, "#ffd8b0", 0.4, "#c0a0ff"); wisch(t, 11); });
// ===== 12 Schatten werden riesig, wenn sie traurig sind – im Fernsehen der Riese über dem Kraftwerk
const RIESE = V(10, 0, -740), RG = 62;
sh(E[12] + 0.15, (t, q) => { stube(t, { oma: "ernst", omaDreh: -0.8, omaNeig: 0.1, armR: 2.0, armRz: 0.2, armL: 0.8, ich: "angst", ichDreh: -0.8 }); ST.kuchen.visible = ST.teller.visible = false; Al.raumlicht(ST, 6);
  Wt.U.uAus.value = -100; Al.handyBlick(V(60, 70, -430), V(10, 70, -700), 44); Al.fernseherAn();
  B.schatten(1, RIESE.x, RIESE.z, Math.atan2(60 - RIESE.x, -430 - RIESE.z), { g: RG * (0.85 + 0.15 * easeIO((t - Z[12]) / 1.5)), kriech: 0.2, augen: 1, y: 0 });
  kamera.fahrt(q, loc(ST, 0.2, 5.1, -5.3), loc(ST, 0.5, 5.0, -5.0), loc(ST, 6.4, 3.0, 1.0), loc(ST, 6.4, 3.0, 1.0), 56); licht(0.45, "#ffd8b0", 0.4, "#c0a0ff"); wisch(t, 12); });
// ===== 13 Wenn sie glücklich sind, leuchten sie (Oma kitzelt einen Schatten auf dem Schoß)
const T_LEUCHT = wz("glücklich", 13) + 0.25;
sh(E[13] + 0.2, (t, q) => { stube(t, { oma: "lachen", omaNeig: 0.35, armR: 0.2, armRz: 0 + 0.12 * Math.sin(t * 12), armL: 0.8 }); ST.kuchen.visible = ST.teller.visible = false;
  const g = easeIO((t - T_LEUCHT) / 0.6); schoss(t, { gold: g, huepf: 0.15 }); const p = loc(ST, 1.7, 2.6, -2.6);
  kamera.fahrt(q, p.clone().add(V(-1.4, 1.1, 4.4)), p.clone().add(V(-1.2, 1.0, 3.8)), p.clone().add(V(0.1, 0.0, 0)), p.clone().add(V(0.1, 0.05, 0)), 50); licht(0.55, "#ffe0b0", 0.5, "#ffc070"); wisch(t, 13); });
// ===== 14 Abends: die größte Party (Banner, Konfetti, Lichterkette)
const party = (t, o = {}) => { wohnung(); kette(o.gold ?? 0); banner.visible = true; banner.position.copy(ZI(0, 6.4, 5.8)); banner.rotation.y = RZ + Math.PI;
  Rq.konfettiW.position.copy(ZI(0, 0, 0)); Rq.konfettiW.scale.set(0.42, 0.3, 0.42); Rq.konfettiSetzen(t, true);
  papa.visible = true; papa.position.copy(ZI(3.8, 0, 2.6)); papa.rotation.y = RZ + Math.PI + 0.3; Fg.pose(papa, { ges: o.papa ?? "lachen", armL: o.papaArme ?? 2.7, armR: 1.5, armRz: 0.2, huepf: Math.max(0, Math.sin(t * 7)) * 0.25 });
  oma.visible = true; oma.position.copy(ZI(3.6, 0, -2.6)); oma.rotation.y = RZ - Math.PI / 2 - 0.3 + 0.25 * Math.sin(t * 3.5); Fg.pose(oma, { ges: o.oma ?? "lachen", armL: 2.4 + 0.4 * Math.sin(t * 7), armR: 2.4 + 0.4 * Math.sin(t * 7 + 3), huepf: Math.max(0, Math.sin(t * 7 + 1)) * 0.2 });
  ich.visible = true; ich.position.copy(ZI(1.3, 0, -0.9)); ich.rotation.y = RZ + Math.PI + 0.2; Fg.pose(ich, { ges: o.ich ?? "lachen", armL: 2.6, armR: 2.6, huepf: Math.max(0, Math.sin(t * 7 + 2)) * 0.3 });
  Al.handyHalten(papa, Fg.handPos, Fg.kopfPos, { rechts: true, zu: cam.position }); musik(); };
const musik = () => Al.handySeite((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#ff4a8a"); g.addColorStop(1, "#7a3aff"); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = "#fff"; x.textAlign = "center"; x.font = "900 260px 'Inter Display', sans-serif"; x.fillText("♪", w / 2, 560); x.font = "900 110px 'Inter Display', sans-serif"; x.fillText("PARTY", w / 2, 800);
  x.fillStyle = "rgba(255,255,255,.35)"; x.fillRect(120, 960, w - 240, 18); x.fillStyle = "#fff"; x.fillRect(120, 960, (w - 240) * 0.4, 18); x.beginPath(); x.moveTo(w / 2 - 50, 1080); x.lineTo(w / 2 - 50, 1220); x.lineTo(w / 2 + 70, 1150); x.fill(); }, "musik");
sh(E[14] + 0.15, (t, q) => { party(t); alle(t, { huepf: 0.6, augen: 1 });
  kamera.fahrt(q, ZI(-1.4, 7.0, -5.4), ZI(-1.2, 6.6, -4.9), ZI(2.0, 1.6, 1.4), ZI(2.0, 1.8, 1.2), 68); licht(0.55, "#ffb060", 0.6, "#ff70c0"); wisch(t, 14); });
// ===== 15 Papa macht Musik, Oma tanzt
sh(wz("oma", 15) - 0.1, (t, q) => { party(t, { papaArme: 0.8 }); alle(t, { huepf: 0.6 });
  kamera.vorFigur(q, papa, 4.2, 3.7, -1.2, -0.5, 52); licht(0.55, "#ffb060", 0.6, "#ff70c0"); wisch(t, 15); });
sh(E[15] + 0.1, (t, q) => { party(t); alle(t, { huepf: 0.6 });
  kamera.vorFigur(q, oma, 6.6, 5.6, 1.4, -0.8, 52); licht(0.55, "#ffb060", 0.6, "#ff70c0"); wisch(t, 15, wz("oma", 15) - Z[15] - 0.04); });
// ===== 16 Die Schatten hüpfen, bis sie kichern
sh(E[16] + 0.1, (t, q) => { party(t); const kich = t > wz("gekichert", 16) - 0.2; alle(t, { huepf: kich ? 0.9 : 0.7, augen: kich ? 0.35 : 1, kriech: 0.5 });
  kamera.fahrt(q, ZI(5.2, 2.6, 0.8), ZI(4.9, 2.5, 1.0), ZI(-0.2, 0.6, 1.4), ZI(-0.2, 0.7, 1.6), 56); licht(0.55, "#ffb060", 0.6, "#ff70c0"); wisch(t, 16); });
// ===== 17 Der erste leuchtet golden (auf dem Bett)
const LEUCHT = new Wt.THREE.PointLight("#ffb040", 0, 9, 1.6); Wt.scene.add(LEUCHT);
sh(E[17] + 0.15, (t, q) => { party(t, { ich: "staunen", oma: "staunen", papa: "staunen", papaArme: 0.6 }); alle(t, { gold: true, huepf: 0.15, augen: 1, kriech: 0.2 });
  const p = ZI(PLATZ[2][0], PLATZ[2][1], PLATZ[2][2]); LEUCHT.position.copy(p).add(V(0, 0.8, 0)); LEUCHT.intensity = 14 * goldVon(t, 2);
  kamera.fahrt(q, ZI(-0.2, 3.5, -2.9), ZI(-0.3, 3.3, -2.5), p.clone().add(V(0, 0.5, 0)), p.clone().add(V(0, 0.5, 0)), 48); licht(0.5, "#ffb060", 0.6, "#ff70c0"); wisch(t, 17); });
// ===== 18 Dann der zweite, dann alle 44 (Zähler zählt golden mit)
sh(E[18] + 0.2, (t, q) => { const ga = easeIO((t - T_GA) / 1.6); party(t, { gold: ga, ich: "staunen", oma: "lachen", papa: "staunen", papaArme: 0.6 }); alle(t, { gold: true, huepf: 0.2, kriech: 0.2 });
  const n = zaehlGold(t); if (n > 0) Z_.zaehler = { wert: n, farbe: "gelb", vorzeichen: false, einheit: B.T({ de: " leuchten", en: " glowing" }) }; LEUCHT.intensity = 0;
  kamera.fahrt(q, ZI(2.0, 7.2, -5.4), ZI(1.8, 6.8, -4.9), ZI(0.0, 1.2, 2.0), ZI(0.0, 1.4, 1.8), 66); licht(0.55 + 0.3 * ga, "#ffc060", 0.6, "#ffb040"); wisch(t, 18); });
// ===== 19 Unser ganzes Haus strahlt wie eine riesige Laterne
const HAUS = Wt.LOTS.filter(l => l.z > 70 && l.z < 140 && Math.abs(l.x) < 80 && l.h > 30 && l.h < 90 && !l.aufsatz).sort((a, b) => Math.abs(a.x) - Math.abs(b.x))[0];
const fassade = Al.leuchtfassade(HAUS);
const T_HAUS = Z[19] + 0.1;
sh(E[19] + 0.15, (t, q) => { fassade.userData.setze(Math.min(1, 0.15 + 0.85 * easeIO((t - T_HAUS) / 1.8)));
  kamera.luft(q, V(HAUS.x, HAUS.h * 0.55, HAUS.z), HAUS.h * 1.9, HAUS.h * 1.6, HAUS.h * 0.9, HAUS.h * 0.8, 3.1, 2.75, 54); licht(0.8, "#ffd8b0", 1.0); wisch(t, 19); });
// ===== 20 Unten hält ein schwarzer Lastwagen
const STR_Z = HAUS.z + HAUS.d / 2 + 6.5;   // Straße südlich vom Haus
const STR_X = HAUS.x - 2;
const T_HALT = wz("lastwagen", 20) + 0.3;
const wagenPos = (t) => { const k = easeIO(Math.min(1, (t - Z[20] + 0.3) / (T_HALT - Z[20] + 0.3))); return V(lerp(STR_X - 34, STR_X, k), 0, STR_Z + 2.8); };
sh(E[20] + 0.15, (t, q) => { fassade.userData.setze(1); wagen.visible = true; wagen.position.copy(wagenPos(t)); wagen.rotation.y = Math.PI / 2;
  kamera.fahrt(q, V(STR_X + 22, 2.4, STR_Z + 17), V(STR_X + 20, 2.6, STR_Z + 16), V(STR_X - 6, 3.0, STR_Z + 2), V(STR_X - 2, 4.0, STR_Z + 1), 54); licht(0.7, "#ffc890", 0.8, "#8ab0ff"); wisch(t, 20); });
// ===== 21 Darauf stand: Schattenfänger
sh(E[21] + 0.15, (t, q) => { fassade.userData.setze(1); wagen.visible = true; wagen.position.copy(wagenPos(1e9)); wagen.rotation.y = Math.PI / 2; wagen.userData.leuchte.visible = true;
  const w = wagen.position; kamera.fahrt(q, V(w.x - 2.2, 3.4, w.z + 15.5), V(w.x - 1.9, 3.6, w.z + 13.5), V(w.x - 1.7, 3.6, w.z), V(w.x - 1.7, 3.7, w.z), 52); licht(0.8, "#d0ffc0", 0.8, "#8ab0ff"); wisch(t, 21); });
// ===== 22 Jemand klingelt an unserer Tür: Mann mit Sonnenbrille
const TUER = V(HAUS.x + 4, 0, HAUS.z + HAUS.d / 2 + 0.25);
sh(E[22] + 0.15, (t, q) => { fassade.userData.setze(1); wagen.visible = true; wagen.position.copy(wagenPos(1e9)); wagen.rotation.y = Math.PI / 2;
  tuerHaus.visible = true; tuerHaus.position.copy(TUER).add(V(0, 3.75, 0.05)); tuerHaus.rotation.y = 0;
  klingel.visible = true; klingel.position.copy(TUER).add(V(3.6, 3.9, 0.06)); klingel.rotation.y = 0;
  const druck = ease((t - wz("geklingelt", 22) + 0.45) / 0.35);
  mann.visible = true; mann.position.copy(TUER).add(V(3.0, 0, 2.3)); mann.rotation.y = Math.PI - 0.6; Fg.pose(mann, { ges: "ernst", armR: 1.2 + 0.55 * druck, armRz: -0.35, armL: 0.15 });
  kamera.fahrt(q, TUER.clone().add(V(7.6, 4.4, 2.0)), TUER.clone().add(V(7.0, 4.5, 1.9)), TUER.clone().add(V(3.0, 3.9, 1.3)), TUER.clone().add(V(3.1, 4.0, 1.3)), 52);
  licht(0.6, "#ffc890", 0.9, "#7aff5a"); wisch(t, 22); });
// ===== 23–25 Mitmach-Frage: ich, und alle 44 leuchtenden Schatten verstecken sich hinter mir
sh(DAUER + 1, (t, q) => { wohnung(); kette(1);
  ich.visible = true; ich.position.copy(ZI(...ICH_F)); ich.rotation.y = RZ + Math.PI; Fg.pose(ich, { ges: "angst", armL: 0.6, armR: 0.6, armLz: 0.5, armRz: -0.5 });
  alle(t, { versteckt: true, goldAlle: 0.85, augen: 1, kriech: 0.1, zittern: 0.6 });
  kamera.fahrt(q, ZI(1.0, 5.3, -5.5), ZI(1.0, 5.1, -5.1), ZI(1.0, 3.5, 3.0), ZI(1.0, 3.6, 3.0), 62); licht(0.6, "#ffc060", 0.6, "#ffb040"); Z_.vignette = 0.5; });

B.start({
  grund: (t) => { kuehl.visible = false; KU.kuehl.forEach(m => m.visible = true); helm.visible = false; uhr.visible = false; banner.visible = false; wagen.visible = false; klingel.visible = false; tuerHaus.visible = false;
    Rq.ZIMMER.lichterkette.visible = false; Rq.ZIMMER.weckerG.visible = Rq.ZIMMER.anzeige.visible = true; Rq.ZIMMER.mond.color.set("#8aa8ff"); ST.kuchen.visible = ST.teller.visible = true;
    Rq.konfettiSetzen(t, false); Rq.konfettiW.position.set(0, 0, 0); Rq.konfettiW.scale.set(1, 1, 1); fassade.userData.setze(0); LEUCHT.intensity = 0; Wt.U.uAus.value = 1e6; },
  frage: B.SPRACHE === "en" ? { zeile: 23, text: "What should I do?", karten: [["A", "🚪", "Hold the door shut", "door"], ["B", "🏠", "Escape over the roof", "roof"], ["C", "🔓", "Open it", "open"]] }
    : { zeile: 23, text: "Was soll ich tun?", karten: [["A", "🚪", "Die Tür zuhalten", "tür"], ["B", "🏠", "Übers Dach fliehen", "dach"], ["C", "🔓", "Aufmachen", "aufmachen"]] },
});
