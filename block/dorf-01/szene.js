// Dorf-Verteidigung „Die 13. Glocke“ – Nacht 1 „Die Nonne“ (Pilot). Du-Erzählung, Kulisse Schattental (horrorwelt.js),
// The Nun aus horror_real.js (spricht nie), Waffe: Papas Wasserwerfer (objekte.js). Keine Jumpscares, kein Wackeln, kein Flackern.
// Ablauf siehe zeilen.py und konzepte/nacht-defense-storyline.md.
import * as B from "../folge.js";
import * as O from "../objekte.js";
import * as HW from "../horrorwelt.js";
import { real, ranim } from "../horror_real.js";
const { V, sh, blick, licht, kamera, Fg, Wt, Z_, THREE, ease, lerp } = B;
await B.laden(); const { Z, E, DAUER, wz } = B.F;

const D = HW.SCHATTENTAL, L = D.pos;
// Nacht 1: das Dorf ist noch heil → altes Blut weg, nur 10 Häuser (die hinteren werden zum leeren Feld vor der Kapelle)
D.g.children.forEach(c => { if (c.material?.polygonOffsetFactor === -4) c.visible = false; });
D.haeuser.forEach(h => { if (h.position.z < -1) h.visible = false; });
// Häuser-Lichter: Fenster mit Leuchten merken, um ein Haus dunkel zu schalten
const lichter = (h) => { const m = []; h.traverse(o => { if (o.material?.emissive && o.material.emissive.getHex() !== 0) { o.material = o.material.clone(); m.push([o.material, o.material.emissiveIntensity]); } }); return m; };
const HAUS9 = D.haeuser.find(h => h.position.x > 0 && Math.abs(h.position.z - 30) < 1); const haus9 = lichter(HAUS9);
const haus9Licht = (a) => haus9.forEach(([m, e]) => m.emissiveIntensity = e * a);
// Laternen ausschalten (Leuchtkörper = 4. Teil)
const AUS = new THREE.MeshStandardMaterial({ color: "#2a2824", roughness: 0.8 });
const lat = (z, sx) => D.laternen.find(l => Math.abs(l.position.z - z) < 1 && Math.sign(l.position.x) === sx);
const LAT = [lat(72, 1), lat(60, -1), lat(48, 1), lat(36, -1)].map(l => ({ l, an: l.children[3].material }));
const laternen = (aus) => LAT.forEach((x, i) => x.l.children[3].material = i < aus ? AUS : x.an);
// roter Handabdruck an Haus 9 (erst ab Zeile 12)
const hand = HW.blut("hand", 1.3, 21); hand.rotation.y = -Math.PI / 2; hand.position.copy(L(7.94, 2.7, 31.2)); Wt.scene.add(hand);

// Figuren
const S = { struktur: true };
const ich = Fg.figur({ haut: "#f0c8a0", hemd: "#e8a020", hose: "#2a3a5a", haare: "#5a3418", frisur: "strubbel", kapuze: true, skala: 0.78, ...S });
const papa = Fg.figur({ haut: "#d89a6a", hemd: "#3a5a8a", hose: "#2a2a30", haare: "#3a2414", frisur: "kurz", skala: 1.1, ...S, muster: { hemd: "karo" } });
const nb1 = Fg.figur({ haut: "#c88a5a", hemd: "#6a8a3a", hose: "#3a3020", haare: "#1a1a1a", frisur: "kurz", skala: 1.0, ...S });
const nb2 = Fg.figur({ haut: "#f0d0b0", hemd: "#a03a4a", hose: "#2a2a3a", haare: "#c08040", frisur: "zopf", skala: 0.95, ...S });
const nun = real("nun");
// Waffe, Steine, Bauplätze
const ww = O.wasserwerfer(); ww.position.copy(L(-2.5, 0.06, 8)); Wt.scene.add(ww);
const haufen = O.steinhaufen(); haufen.position.copy(L(4.2, 0.06, 6)); Wt.scene.add(haufen);
const PLAETZE = [L(-3.5, 0.08, 18), L(3.5, 0.08, 30), L(-3.5, 0.08, 42)].map(p => { const b = O.bauplatz({ groesse: 4.5 }); b.position.copy(p); Wt.scene.add(b); return b; });
// Wasserstrahl: Kette kleiner Tropfen auf einer Wurfparabel von der Düse zum Ziel
const STRAHL = new THREE.Group(); Wt.scene.add(STRAHL);
const tropfMat = new THREE.MeshStandardMaterial({ color: "#a8dcff", emissive: "#2a6a9a", emissiveIntensity: 0.6, roughness: 0.1, transparent: true, opacity: 0.85 });
for (let i = 0; i < 110; i++) STRAHL.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), tropfMat));
const strahl = (t, ziel, an) => { STRAHL.visible = an; if (!an) return; ww.updateMatrixWorld(true); const a = ww.userData.duese.getWorldPosition(V(0, 0, 0));
  STRAHL.children.forEach((m, i) => { const u = ((i / STRAHL.children.length) + t * 2.2) % 1, p = a.clone().lerp(ziel, u); p.y += Math.sin(u * Math.PI) * 1.6;
    m.position.copy(p); m.scale.setScalar(0.8 + 0.6 * u + 0.25 * Math.sin(i * 7.3)); }); };
// Steine: fliegen von den Nachbarn durch die Nonne hindurch und landen dahinter
const STEINE = [0, 1, 2].map(i => { const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 0), new THREE.MeshStandardMaterial({ color: ["#8a8a8a", "#7a746c", "#9a948a"][i], roughness: 0.95 })); Wt.scene.add(s); return s; });
const steine = (t, t0, von, ziel) => STEINE.forEach((s, i) => { const u = (t - t0 - i * 0.35) / 1.1; s.visible = u > 0 && u < 1; if (!s.visible) return;
  const zz = ziel.clone().add(V((i - 1) * 0.6, 0, 9)); const p = von[i % 2].clone().lerp(zz, u); p.y = lerp(von[i % 2].y, 0.4, u) + Math.sin(u * Math.PI) * 4.5; s.position.copy(p); s.rotation.set(t * 7 + i, t * 5, 0); });
// Seil im Glockenturm
const seil = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 4.2, 8), new THREE.MeshStandardMaterial({ color: "#8a6a3a", roughness: 0.9 })); seil.geometry.translate(0, -2.1, 0);
seil.position.copy(L(1.9, 21.6, -113)); Wt.scene.add(seil);

// Licht und Stimmung
const glocke = (t, schlag = 0) => { D.glocke.rotation.z = Math.sin(t * 2.4) * 0.1 + schlag; };
const schlagBei = (t, t0) => { const u = t - t0; return u < 0 ? 0 : Math.sin(Math.min(u, 1.4) * 4.5) * 0.35 * Math.exp(-u * 1.6); };
const nacht = (s = 1) => { HW.nacht(s); D.licht.intensity = 14 * s; HW.dunkel(0); };
const NUN_NAH = (t, z, modus = "stehen") => { nun.visible = true; nun.position.copy(L(0, 0.06, z)); nun.rotation.set(0, Math.PI, 0); ranim(nun, t, modus); nun.userData.augen && (nun.userData.augen.visible = true); };
const kopfN = () => { const v = V(0, 0, 0); nun.userData.j.kopf.getWorldPosition(v); return v; };
const papaZielt = (ges = "wut") => { papa.visible = true; papa.position.copy(L(-2.5, 0.06, 5.2)); papa.rotation.y = 0; Fg.pose(papa, { ges, armL: 1.4, armR: 1.4, armLz: 0.2, armRz: -0.2 }); };
const nachbarn = (t, werfen = false) => { for (const [f, x, ph] of [[nb1, 3.2, 0], [nb2, 6, 0.4]]) { f.visible = true; f.position.copy(L(x, 0.06, 4.2)); f.rotation.y = 0.15;
  const w = werfen ? Math.max(0, Math.sin((t + ph) * 5.2)) : 0; Fg.pose(f, { ges: werfen ? "wut" : "angst", armR: 0.6 + w * 2.4, armL: 0.3 }); } };
const du = (t, ges = "angst", p = L(1, 0.06, 2.2), ry = 0.1) => { ich.visible = true; ich.position.copy(p); ich.rotation.y = ry; Fg.pose(ich, { ges }); };
const huette = (n, farbe = "rot") => { Z_.zaehler = { wert: "🏠 " + n, einheit: "", farbe }; };
const uhr = (s) => { Z_.zaehler = { wert: s, einheit: " Uhr", farbe: "gelb" }; };
const GL = L(0, 19.5, -113);
const GLICHT = new THREE.PointLight("#ffb070", 0, 14, 1.6); GLICHT.position.copy(GL).add(V(0, -1.5, 0)); Wt.scene.add(GLICHT);
const HLICHT = new THREE.PointLight("#ffd0a0", 0, 9, 1.6); HLICHT.position.copy(L(5, 3.4, 31)); Wt.scene.add(HLICHT);

// 0 Hook: roter Mond über Schattental, Nebel, „NACHT 1“
sh(Z[1] - 0.05, (t, q) => { nacht(); glocke(t); du(t, "angst", L(1, 0.06, 40), Math.PI);
  kamera.fahrt(q, L(0, 24, 92), L(0, 19, 80), L(0, 12, -60), L(0, 14, -80), 56); licht(0.5, "#ffb090", 0.8, "#ff4a3a"); Z_.zaehler = { wert: "NACHT 1", einheit: "", farbe: "rot" }; Z_.vignette = 0.55; });
// 1 Drei Uhr, Glockenturm
sh(Z[2] - 0.05, (t, q) => { nacht(); glocke(t, schlagBei(t, wz("Glocke", 1))); uhr("03:00"); GLICHT.intensity = 30;
  kamera.fahrt(q, L(15, 15, -98), L(13, 16.5, -101), GL.clone().add(V(0, -1, 0)), GL, 40); licht(0.5, "#ffb090", 0.9, "#ff4a3a"); Z_.vignette = 0.6; });
// 2 Waldrand: Nebel kriecht über die Straße
sh(Z[3] - 0.05, (t, q) => { nacht(0.85); glocke(t);
  kamera.fahrt(q, L(1, 2.6, 46), L(0.5, 2.4, 52), L(0, 3, 120), L(0, 2.6, 120), 50); licht(0.4, "#ffb090", 0.8, "#ff4a3a"); Z_.vignette = 0.65; });
// 3 Zehn Häuser … Papas Wasserwerfer
sh(wz("Und", 3) - 0.1, (t, q) => { nacht(); huette(10, "gelb");
  kamera.fahrt(q, L(0, 30, 78), L(0, 28, 72), L(0, 0, 22), L(0, 0, 20), 52); licht(0.6, "#ffd0a0", 0.8, "#ff4a3a"); });
sh(Z[4] - 0.05, (t, q) => { nacht(); huette(10, "gelb"); papaZielt("stolz"); du(t, "staunen", L(0.8, 0.06, 4.6), -0.4);
  kamera.fahrt(q, L(4.5, 3.6, 15), L(3.6, 3.4, 13.5), L(-2.2, 3.2, 7), L(-2.4, 3.4, 7), 54); licht(1.2, "#ffd0a0", 1.0, "#ff6a4a"); });
// 4 Elf. Zwölf. Dreizehn. – ein Schnitt pro Schlag
const schlag = (i, nachN) => sh(nachN, (t, q) => { const t0 = wz(["Elf", "Zwölf", "Dreizehn"][i], 4); nacht(); glocke(t, schlagBei(t, t0));
  GLICHT.intensity = 30; const W = [[L(14, 17, -104), GL], [L(-12, 15, -100), GL], [L(-10, 9, -76), GL.clone().add(V(0, -3, 0))]][i];
  kamera.fahrt(q, W[0], W[0].clone().add(V(0, 0.4, -1.2)), W[1], W[1], [40, 38, 50][i]); licht(0.5, "#ffb090", 1.0, "#ff4a3a"); Z_.vignette = 0.6 + i * 0.05; });
schlag(0, wz("Zwölf", 4) - 0.05); schlag(1, wz("Dreizehn", 4) - 0.05); schlag(2, Z[5] - 0.05);
// 5 Stille: alle stehen still, die Straße wartet
sh(Z[6] - 0.05, (t, q) => { nacht(); papaZielt("angst"); nachbarn(t); du(t, "angst");
  kamera.fahrt(q, L(0.5, 3.8, -10), L(0.5, 3.8, -8.8), L(0.5, 2.8, 60), L(0.5, 2.8, 60), 46); licht(0.7, "#ffd0a0", 0.9, "#ff4a3a"); Z_.vignette = 0.7; });
// 6 Laternen gehen aus, eine nach der anderen auf uns zu
sh(Z[7] - 0.05, (t, q) => { nacht(0.9); const a1 = wz("Laterne", 6) + 0.25, a2 = wz("noch", 6) + 0.2;
  laternen(t >= a2 + 0.6 ? 3 : t >= a2 ? 2 : t >= a1 ? 1 : 0);
  kamera.fahrt(q, L(-1.5, 3, 22), L(-1.2, 3, 25), L(0.5, 4, 80), L(0.5, 4, 80), 48); licht(0.45, "#ffb090", 0.8, "#ff4a3a"); Z_.vignette = 0.7; });
// 7 Mitten auf der Straße: The Nun
sh(wz("The", 7) - 0.1, (t, q) => { nacht(0.85); laternen(3); NUN_NAH(t, 58);
  kamera.fahrt(q, L(0.6, 3.2, 30), L(0.5, 3.4, 36), L(0, 3.6, 58), L(0, 3.8, 58), 40); licht(0.4, "#ffb090", 1.2, "#ff3a2a"); Z_.vignette = 0.75; });
sh(Z[8] - 0.05, (t, q) => { nacht(0.85); laternen(3); NUN_NAH(t, 58); const k = kopfN();
  kamera.fahrt(q, L(0.4, k.y - 0.3, 49.5), L(0.3, k.y - 0.2, 50.8), k, k, 34); licht(0.3, "#ffb090", 1.4, "#ff3a2a"); Z_.vignette = 0.8; });
// 8 Papa schießt – Volltreffer (−25)
sh(Z[9] - 0.05, (t, q) => { nacht(); laternen(3); NUN_NAH(t, 52, "angriff"); papaZielt("wut"); du(t, "angst", L(0.6, 0.06, 3), 0.2); const k = kopfN();
  strahl(t, k.clone().add(V(0, -1.2, 0)), t > Z[8] + 0.15); Z_.plus = { t0: wz("Volltreffer", 8), text: "−25", farbe: "gelb" };
  kamera.fahrt(q, L(-6, 4.2, 13), L(-6.2, 4.6, 16), L(0, 3, 32), L(0, 3.2, 36), 54); licht(1.0, "#ffd0a0", 1.2, "#ff4a3a"); huette(10, "gelb"); });
// 9 Sie kommt näher, sie schwebt
sh(Z[10] - 0.05, (t, q) => { nacht(0.9); laternen(3); NUN_NAH(t, lerp(50, 40, q), "gehen");
  kamera.fahrt(q, L(2.5, 0.8, 26), L(2.2, 0.8, 27), L(0, 2.2, 46), L(0, 2.6, 40), 46); licht(0.35, "#ffb090", 1.3, "#ff3a2a"); Z_.vignette = 0.75; });
// 10 Steine fliegen durch sie hindurch – 0 SCHADEN
sh(Z[11] - 0.05, (t, q) => { nacht(); laternen(3); NUN_NAH(t, 38); nachbarn(t, true); papaZielt("angst");
  steine(t, Z[10] + 0.3, [nb1.position.clone().add(V(0.3, 3.6, 0.5)), nb2.position.clone().add(V(0.3, 3.4, 0.5))], L(0, 2.4, 38)); Z_.plus = { t0: wz("einfach", 10), text: "0 SCHADEN", farbe: "rot" };
  kamera.fahrt(q, L(6.5, 4, 17), L(6.3, 4.4, 19), L(0, 3, 30), L(0, 3, 33), 54); licht(0.9, "#ffd0a0", 1.1, "#ff4a3a"); huette(10, "gelb"); });
// 11 Haus Nummer neun wird dunkel
sh(Z[12] - 0.05, (t, q) => { nacht(); laternen(3); haus9Licht(t >= wz("Licht", 11) + 0.15 ? 0 : 1); NUN_NAH(t, 26); nun.position.x = 3.5; nun.rotation.y = -Math.PI / 2;
  kamera.fahrt(q, L(-7, 3.4, 20), L(-7, 3.6, 22), L(9, 4.6, 30), L(9, 4.6, 30), 48); licht(0.5, "#ffb090", 1.0, "#ff4a3a"); Z_.vignette = 0.7; });
// 12 Herr Krause ist weg – roter Handabdruck an der Tür
sh(Z[13] - 0.05, (t, q) => { nacht(); laternen(3); haus9Licht(0); hand.visible = true; HLICHT.intensity = 6;
  kamera.fahrt(q, L(2.2, 2.9, 30), L(3.4, 2.8, 30.6), L(8, 2.6, 31.4), L(8, 2.7, 31.2), 44); licht(0.9, "#ffd0a0", 0.8, "#ff4a3a"); Z_.vignette = 0.75; });
// 13 Neun Häuser
sh(Z[14] - 0.05, (t, q) => { nacht(); laternen(3); haus9Licht(0); hand.visible = true; huette(t < Z[13] + 0.35 ? 10 : 9, t < Z[13] + 0.35 ? "gelb" : "rot");
  kamera.fahrt(q, L(-5, 26, 62), L(-4, 24, 58), L(2, 0, 22), L(2, 0, 22), 52); licht(0.5, "#ffb090", 0.9, "#ff4a3a"); });
// 14 Vor dem Licht der Kapelle weicht sie zurück
sh(Z[15] - 0.05, (t, q) => { nacht(); hand.visible = true; const zur = ease((t - wz("weicht", 14)) / 0.8);
  NUN_NAH(t, -78 + zur * 6, zur > 0 ? "schrei" : "gehen"); nun.position.y += zur * 0.3;
  const fm = D.kapelle.userData.fensterMat; if (fm?.emissive) fm.emissiveIntensity = 1 + 2.5 * ease((t - Z[14] - 0.6) / 1.2);
  kamera.fahrt(q, L(-9, 4, -62), L(-8.5, 4, -63.5), L(0, 4.4, -82), L(0, 4.6, -80), 50); licht(1.0, "#ffe0a0", 1.6, "#ffd070"); Z_.vignette = 0.6; });
// 15 Fünf Uhr, sechs Uhr – Sonnenaufgang
sh(Z[16] - 0.05, (t, q) => { const s = ease((t - wz("Sechs", 15)) / 1.6); HW.nacht(1 - s * 0.4); Wt.U.uAbend.value = 0.4 + s * 0.6; Wt.U.uTag.value = s * 0.35;
  Wt.hemi.color.set("#ffb890"); Wt.hemi.intensity = 0.6 + s * 0.6; laternen(3); haus9Licht(0); uhr(t < wz("Sechs", 15) ? "05:00" : "06:00");
  kamera.fahrt(q, L(0, 16, 70), L(0, 18, 66), L(0, 6, -60), L(0, 10, -60), 54); licht(0.8 + s * 0.6, "#ffb070", 0.8, "#ff8a5a"); Z_.vignette = 0.45; });
// 16 Sie ist weg. Für heute.
sh(Z[17] - 0.05, (t, q) => { HW.nacht(0.6); Wt.U.uAbend.value = 1; Wt.U.uTag.value = 0.4; Wt.hemi.color.set("#ffc8a0"); Wt.hemi.intensity = 1.2; laternen(3); haus9Licht(0);
  papa.visible = true; papa.position.copy(L(-2.5, 0.06, 5.2)); papa.rotation.y = 0.2; Fg.pose(papa, { ges: "froh" }); du(t, "froh", L(1, 0.06, 4), 0.4);
  kamera.fahrt(q, L(0.5, 2.4, 30), L(0.5, 2.4, 27), L(0, 2.6, -10), L(0, 2.6, -10), 50); licht(1.3, "#ffc890", 0.9, "#ffb080"); Z_.vignette = 0.4; });
// 17 Im zugemauerten Glockenturm schwingt das Seil
sh(Z[18] - 0.05, (t, q) => { HW.nacht(0.6); Wt.U.uAbend.value = 1; Wt.U.uTag.value = 0.4; Wt.hemi.color.set("#ffc8a0"); Wt.hemi.intensity = 1.1; glocke(t * 0.6);
  seil.rotation.z = Math.sin(t * 2.1) * 0.22; seil.rotation.x = Math.sin(t * 1.3) * 0.08;
  GLICHT.intensity = 18;
  kamera.fahrt(q, L(11, 19.4, -109), L(9.5, 19.6, -110), L(1.2, 19.4, -113), L(1.2, 19.2, -113), 40); licht(0.9, "#ffc890", 0.8, "#ffb080"); Z_.vignette = 0.55; });
// 18 Morgen Nacht kommt sie zurück – Silhouette im Kapellenfenster
sh(Z[19] - 0.05, (t, q) => { nacht(0.7); nun.visible = true; nun.position.copy(L(8.6, 0.06, -125)); nun.rotation.set(0, Math.PI / 2, 0); ranim(nun, t, "stehen"); if (nun.userData.augen) nun.userData.augen.visible = true;
  kamera.fahrt(q, L(26, 3.6, -116), L(23, 3.8, -118), L(8.4, 4, -125), L(8.4, 4.2, -125), 40); licht(0.3, "#ffb090", 1.0, "#ff3a2a"); Z_.vignette = 0.8; });
// 19 Was hilft gegen sie? – Dorf von oben, leere Bauplätze leuchten
sh(DAUER + 1, (t, q) => { nacht(); laternen(3); haus9Licht(0); hand.visible = true; PLAETZE.forEach((b, i) => b.userData.setze(0.6 + 0.4 * ease((t - Z[19] - i * 0.4) / 0.5)));
  kamera.fahrt(q, L(0, 46, 66), L(0, 40, 58), L(0, 0, 28), L(0, 0, 28), 50); licht(0.6, "#ffd0a0", 0.8, "#ff4a3a"); huette(9, "rot"); });

B.start({ grund: (t) => { nun.visible = false; STRAHL.visible = false; STEINE.forEach(s => s.visible = false); hand.visible = false; haus9Licht(1); GLICHT.intensity = 0; HLICHT.intensity = 0; laternen(0);
  PLAETZE.forEach(b => b.userData.setze(0)); seil.rotation.set(0, 0, 0); const fm = D.kapelle.userData.fensterMat; if (fm?.emissive) fm.emissiveIntensity = 1; Wt.U.uMond.value = 1; } });
