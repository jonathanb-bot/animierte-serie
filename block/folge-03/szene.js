// Folge 3 „Mama“ – setzt die Abstimmung zu Folge 2 um (A: Krümel zu seiner Mama lassen).
// Neue Elemente: Einkaufsstraße bei Nacht, Großbildschirm mit Fahndungsfoto (Handy-Kamera) + Plakat „GESUCHT“, Anruf auf dem Handy,
// Werkstattwagen (neu in objekte.js), Schranke am Kraftwerkstor (neu), Kühlturm von oben, Strom-zurück-Welle (uAn), Menge jubelt + Konfetti,
// viele kleine Schatten vor dem Fenster, Zettel „HILF UNS!“ (leinwand).
import * as B from "../folge.js";
import * as O from "../objekte.js";
const { V, sh, blick, licht, kamera, ease, easeIO, lerp, lerpV, Fg, Al, Rq, Wt, Ws, Z_ } = B;
await B.laden(); const { Z, E, DAUER, wz } = B.F;

const S = { struktur: true };
const ich = Fg.figur({ haut: "#f0c8a0", hemd: "#e8a020", hose: "#2a3a5a", haare: "#5a3418", frisur: "strubbel", kapuze: true, skala: 0.78, schuhe: "#e8e8e8", ...S });
const ichFoto = Fg.figur({ haut: "#f0c8a0", hemd: "#e8a020", hose: "#2a3a5a", haare: "#5a3418", frisur: "strubbel", kapuze: true, skala: 0.78, schuhe: "#e8e8e8", ...S });
const papa = Fg.figur({ haut: "#d89a6a", hemd: "#2a3a5a", aermel: "#2a3a5a", weste: "#ff7a1a", hose: "#2a2a30", haare: "#3a2414", helm: "#f0c020", skala: 1.1, ...S });
const polizist = Fg.figur({ haut: "#9a6038", hemd: "#1e2e5a", hose: "#1a2240", muetze: "#1e2e5a", abzeichen: true, frisur: "glatze", haare: "#111", skala: 1.05, ...S });

const cam = Wt.cam;
const loc = (R, x, y, z) => V(R.g.position.x + x, y, R.g.position.z + z);
const zm = Rq.zimmer; const ZI = (x, y, z) => { zm.updateMatrixWorld(true); return V(x, y, z).applyMatrix4(zm.matrixWorld); };
const wisch = (t, i, d = 0) => { Wt.grade.uniforms.uWisch.value = B.wisch(t, Z[i] - 0.06 + d); };
const zurKamera = (p) => Math.atan2(cam.position.x - p.x, cam.position.z - p.z);
// Krümel: kleiner Schatten (Index 0), schaut zur Kamera (nach blick() aufrufen)
const kruemel = (p, o = {}) => B.schatten(0, p.x, p.z, (o.ry ?? zurKamera(p)) + (o.dreh ?? 0), { y: p.y, g: o.g ?? 0.3, kriech: o.kriech ?? 0.3, augen: o.augen ?? 1 });
// Platz in der Kapuze (hinter dem Kopf)
const kapuze = (f) => { f.updateMatrixWorld(true); const k = Fg.kopfPos(f); const r = f.rotation.y; return V(k.x - Math.sin(r) * 0.42, k.y - 0.75, k.z - Math.cos(r) * 0.42); };

// ---------- Bibliothek ----------
const strasse = Al.einkaufsstrasse({ x: 24, z0: 70, z1: 330 });
const wagen = O.werkstattwagen(); Wt.scene.add(wagen); wagen.visible = false;
const tor = O.schranke({ laenge: 9 }); tor.position.set(-29, 0, -392); Wt.scene.add(tor); tor.visible = false;
const plakat = Al.leinwand(13.5, 3.6, { leuchtet: true, hell: 1.3 }); Wt.scene.add(plakat); plakat.visible = false;
const zettel = Al.leinwand(1.25, 0.8); Wt.scene.add(zettel); zettel.visible = false;
Al.schreibe(zettel, ["HILF UNS!"], { bg: "#f4f0e2", fg: "#1a1a1a", font: "900 230px 'Inter Display', sans-serif" });

const RINGE = Wt.kraftwerk.children.filter(m => m.geometry && m.geometry.type === "TorusGeometry");
const augenSanft = () => Ws.augenW.material.color.setRGB(1.5, 1.5, 1.5);   // Riesen-Augen von nah: weniger Überstrahlen
const ringeAus = () => RINGE.forEach(r => r.visible = false);   // leuchtender Turmrand blendet von nah

// ---------- Ereignisse ----------
const T_GESUCHT = wz("gesucht", 4), T_ZEHN = wz("zehntausend", 4);
const T_KLINGEL = Z[5];
const T_TOR = wz("tor", 9) - 0.9;
const T_ZU = wz("zugemacht", 15);
const T_LICHT = Z[16] + 0.35;
const T_KLOPF = wz("geklopft", 21);
const TURM = V(10, 70, -580);                       // Kühlturm (rechter), Rand oben r ≈ 23.6
const RAND = (dx) => V(TURM.x + dx, TURM.y, TURM.z - Math.sqrt(23.6 * 23.6 - dx * dx));
const RIESE = V(10, 0, -740), RG = 62;   // weiter weg als in Folge 2, damit er nicht in den Kühlturm ragt
const AUGE = V(10, 77.5, -687);                      // Augenhöhe des Riesen (wesen.js: y 1,25·g, vorn 0,85·g)
const BILDSCHIRM = V(-6, 0, -26);

// Fahndungsfoto: Handy-Kamera filmt mein Gesicht vor der Tafel im Klassenzimmer
const KL = Al.KLASSE;
const foto = () => { ichFoto.visible = true; ichFoto.position.copy(loc(KL, 0, 0, -5.2)); ichFoto.rotation.y = 0; Fg.pose(ichFoto, { ges: "froh" });
  Al.schreibe(KL.tafel, [""], { kreide: true }); const k = Fg.kopfPos(ichFoto); Al.handyBlick(V(k.x, k.y + 0.1, k.z + 3.0), V(k.x, k.y - 0.35, k.z), 38);
  Al.videowand.visible = true; Al.videowand.position.copy(BILDSCHIRM); Al.videowand.rotation.y = 0.18; Al.videowand.scale.setScalar(1.5); Al.HANDY.wandSchirm.material = Al.HANDY.weltMat; };
const plakatZeigen = (t) => { if (t < T_GESUCHT - 0.05) return; plakat.visible = true; plakat.position.copy(BILDSCHIRM).add(V(Math.sin(0.18) * 0.9, 12.2, Math.cos(0.18) * 0.9)); plakat.rotation.y = 0.18;
  Al.schreibe(plakat, [t < T_ZEHN - 0.05 ? "GESUCHT" : "10.000 €"], { bg: "#d8241e", fg: "#ffffff", font: "900 300px 'Inter Display', sans-serif" }); };
// Anruf von Papa
const anruf = () => Al.handySeite((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#1a2a5a"); g.addColorStop(1, "#0a0f22"); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = "#ff7a1a"; x.beginPath(); x.arc(w / 2, 420, 150, 0, 7); x.fill(); x.fillStyle = "#f0c020"; x.beginPath(); x.arc(w / 2, 360, 120, Math.PI, 0); x.fill();
  x.fillStyle = "#fff"; x.textAlign = "center"; x.font = "900 140px 'Inter Display', sans-serif"; x.fillText("PAPA", w / 2, 760);
  x.font = "700 60px 'Inter Display', sans-serif"; x.fillStyle = "#c8d4ff"; x.fillText("ruft an …", w / 2, 850);
  x.fillStyle = "#e8302a"; x.beginPath(); x.arc(w * 0.27, 1100, 95, 0, 7); x.fill(); x.fillStyle = "#2ac04a"; x.beginPath(); x.arc(w * 0.73, 1100, 95, 0, 7); x.fill();
  x.fillStyle = "#fff"; x.font = "900 90px 'Inter Display', sans-serif"; x.fillText("✕", w * 0.27, 1132); x.fillText("✓", w * 0.73, 1132); }, "anruf-papa");

// Dunkle Stadt bis zur Strom-Welle (Folge 2 endete im Stromausfall)
const dunkel = () => { Wt.U.uAus.value = -100; Wt.hemi.intensity = 0.45; };
const hell = (tAn = T_LICHT) => { Wt.U.uAus.value = -100; Wt.U.uAn.value = tAn; };

// ===== 0 Losgerannt: Einkaufsstraße bei Nacht
const lauf = (t, t0, z0, v = 5.2) => { strasse.visible = true; ich.visible = true; const z = z0 - (t - t0) * v; ich.position.set(25.5, 0, z); ich.rotation.y = Math.PI; Fg.pose(ich, { renn: 1, phase: t * 11, ges: "angst", armL: 0.2, armR: 0.2 }); return z; };
sh(E[0] + 0.1, (t, q) => { dunkel(); const z = lauf(t, 0, 196); kamera.fahrt(q, V(21.5, 2.2, z - 9), V(22.0, 2.0, z - 7.0), V(25.5, 1.8, z), V(25.5, 1.8, z), 52);
  kruemel(kapuze(ich), { g: 0.2, kriech: 0.2 }); licht(0.7, "#9ab0ff", 0.9, "#c0a0ff"); });
// ===== 1 Krümel in der Kapuze piepst
sh(E[1] + 0.1, (t, q) => { dunkel(); const z = lauf(t, 0, 196); const k = kapuze(ich);
  kamera.fahrt(q, V(k.x - 1.6, k.y + 1.0, k.z + 3.0), V(k.x - 1.3, k.y + 0.9, k.z + 2.5), V(k.x, k.y + 0.3, k.z), V(k.x, k.y + 0.35, k.z), 46);
  kruemel(k, { g: 0.2, kriech: 0.2, augen: t > wz("gepiepst", 1) - 0.1 && t < wz("gepiepst", 1) + 0.25 ? 0.2 : 1 }); licht(0.7, "#9ab0ff", 0.9, "#c0a0ff"); wisch(t, 1); });
// ===== 2 Überall Polizeiautos: ich luge um die Ecke zum Platz
const ecke = (t, ges) => { strasse.visible = true; ich.visible = true; ich.position.set(25.5, 0, 74); ich.rotation.y = Math.PI + 0.35; Fg.pose(ich, { ges, neig: 0.15, kopfDreh: -0.3 }); };
sh(E[2] + 0.1, (t, q) => { dunkel(); ecke(t, "angst"); Rq.polizeiSetzen(t, true, true, 27, cam.position);
  kamera.fahrt(q, V(22.0, 3.0, 81), V(22.3, 2.9, 80), V(10, 2.4, 20), V(10, 2.6, 22), 54); kruemel(kapuze(ich), { g: 0.2, kriech: 0.2 }); licht(0.6, "#8ab0ff", 0.8); wisch(t, 2); });
// ===== 3 Mein Gesicht auf dem Großbildschirm
sh(E[3] + 0.1, (t, q) => { dunkel(); foto(); Rq.polizeiSetzen(t, true, true, 27, cam.position);
  kamera.fahrt(q, V(16, 3, 64), V(14, 5, 58), V(-6, 18, -26), V(-6, 22, -26), 52); licht(0.6, "#8ab0ff", 0.8); wisch(t, 3); });
// ===== 4 GESUCHT – 10.000 €
sh(E[4] + 0.15, (t, q) => { dunkel(); foto(); plakatZeigen(t); Rq.polizeiSetzen(t, true, true, 27, cam.position);
  if (t > T_ZEHN - 0.1) { Z_.zaehler = { wert: Math.round(B.zaehlen(t, T_ZEHN - 0.1, T_ZEHN + 0.8, 0, 10000)), farbe: "rot", vorzeichen: false }; }
  kamera.fahrt(q, V(14, 9, 18), V(12, 10, 14), V(-5.5, 16, -26), V(-5.5, 16.5, -26), 56); licht(0.6, "#8ab0ff", 0.8); wisch(t, 4); });
// ===== 5 Handy klingelt: Papa
const handyIch = (t, ges, zu) => { strasse.visible = true; ich.visible = true; ich.position.set(24.5, 0, 92); ich.rotation.y = 0.3; Fg.pose(ich, { ges, armR: 1.45, armRz: -0.3, kopfNeig: 0.3 });
  anruf(); ich.updateMatrixWorld(true); Al.handyHalten(ich, Fg.handPos, Fg.kopfPos, { zu }); };
const vorne = () => { const k = Fg.kopfPos(ich); return V(k.x + Math.sin(0.3) * 1.9 + 0.5, k.y - 0.2, k.z + Math.cos(0.3) * 1.9); };
sh(wz("papa", 5) - 0.05, (t, q) => { dunkel(); ich.position.set(24.5, 0, 92); ich.rotation.y = 0.3; Fg.pose(ich, { ges: "staunen", armR: 1.45, armRz: -0.3, kopfNeig: 0.3 }); ich.updateMatrixWorld(true); const kp = vorne(); handyIch(t, "staunen", kp); const h = Al.handy.position.clone();
  const d = kp.clone().sub(h).normalize(); kamera.fahrt(q, h.clone().add(d.clone().multiplyScalar(1.6)), h.clone().add(d.clone().multiplyScalar(1.35)), h, h, 46); licht(0.5, "#8ab0ff", 0.8); wisch(t, 5); });
const gesicht = (q, a0, a1, seite, fov) => { const k = Fg.kopfPos(ich); const d = V(Math.sin(0.3), 0, Math.cos(0.3)), sd = V(d.z, 0, -d.x);
  kamera.fahrt(q, k.clone().add(d.clone().multiplyScalar(a0)).add(sd.clone().multiplyScalar(seite)).add(V(0, -0.2, 0)), k.clone().add(d.clone().multiplyScalar(a1)).add(sd.clone().multiplyScalar(seite)).add(V(0, -0.25, 0)), k.clone().add(V(0, -0.6, 0)), k.clone().add(V(0, -0.55, 0)), fov); };
const ohneHandy = (ges) => { strasse.visible = true; ich.visible = true; ich.position.set(24.5, 0, 92); ich.rotation.y = 0.3; Fg.pose(ich, { ges, armR: 0.3, armL: 0.2 }); ich.updateMatrixWorld(true); };
sh(E[5] + 0.1, (t, q) => { dunkel(); ohneHandy("staunen"); gesicht(q, 4.6, 4.0, 1.2, 46); licht(0.5, "#8ab0ff", 0.8); });
// ===== 6 Jetzt gibt es Ärger
sh(E[6] + 0.1, (t, q) => { dunkel(); ohneHandy("schwitzen"); gesicht(q, 3.4, 3.0, -0.6, 42); licht(0.5, "#8ab0ff", 0.8); wisch(t, 6); });
// ===== 7 Steig ein, ich fahre: Werkstattwagen mit Rundumleuchte
const wagenAn = (p, ry, t) => { wagen.visible = true; wagen.position.copy(p); wagen.rotation.y = ry; wagen.userData.leuchte.visible = Math.floor(t * 3) % 2 === 0 || true; };
sh(E[7] + 0.15, (t, q) => { dunkel(); strasse.visible = true; const k = ease((t - Z[7] + 0.2) / 1.2); wagenAn(V(27.4, 0, lerp(118, 101, k)), Math.PI, t);
  papa.visible = true; papa.position.set(24.2, 0, 101.0); papa.rotation.y = Math.PI - 0.5; Fg.pose(papa, { ges: t > wz("steig", 7) - 0.1 ? Fg.mund(t) : "ernst", armR: 2.4, armRz: 0.2 * Math.sin(t * 8) });
  papa.visible = k > 0.95; ich.visible = true; ich.position.set(24.5, 0, 92); ich.rotation.y = 0.2; Fg.pose(ich, { ges: "staunen" });
  kamera.fahrt(q, V(21.0, 2.4, 85.5), V(21.4, 2.6, 86.5), V(25.5, 2.4, 100), V(25.5, 2.6, 100), 52); licht(0.6, "#ffb070", 0.8, "#8ab0ff"); wisch(t, 7); });
// ===== 8 Papa arbeitet im Kraftwerk: Fahrt durch die dunkle Stadt, vorne das Kraftwerk
const fahrt = (t, t0, z0, v = 16) => { const z = z0 - (t - t0) * v; wagenAn(V(-25.6, 0, z), Math.PI, t); return z; };
sh(E[8] + 0.1, (t, q) => { dunkel(); const z = fahrt(t, Z[8], -230); kamera.fahrt(q, V(-20.5, 12, z + 24), V(-21, 13, z + 20), V(-25.6, 1, z - 30), V(-25.6, 3, z - 60), 56);
  licht(0.8, "#ffc890", 0.8, "#8ab0ff"); wisch(t, 8); });
// ===== 9 Durchs große Tor (Schranke geht hoch)
sh(E[9] + 0.15, (t, q) => { dunkel(); tor.visible = true; tor.userData.arm.rotation.z = 1.4 * easeIO((t - T_TOR) / 0.6); const z = fahrt(t, T_TOR + 0.4, -388, 14);
  kamera.fahrt(q, V(-16, 2.6, -400), V(-17, 2.4, -401), V(-26, 2.2, -380), V(-26, 2.6, -386), 60); licht(0.7, "#ffc890", 0.8, "#8ab0ff"); wisch(t, 9); });
// ===== 10 Oben auf dem Kühlturm, eiskalt
const oben = (t, gIch, gPapa, o = {}) => { ringeAus(); ich.visible = true; ich.position.copy(RAND(-1.2)); ich.rotation.y = Math.PI + (o.ichDreh ?? 0); Fg.pose(ich, { ges: gIch, armL: o.armL ?? 0.15, armR: o.armR ?? 0.15, kopfNeig: o.kopfNeig ?? -0.1, ...(o.ich ?? {}) });
  papa.visible = true; papa.position.copy(RAND(1.4)); papa.rotation.y = Math.PI + (o.papaDreh ?? 0); Fg.pose(papa, { ges: gPapa, armL: o.papaArmL ?? 0, armR: o.papaArmR ?? 0, armRz: o.papaArmRz ?? 0, ...(o.papa ?? {}) }); };
const riese = (t, augen = 1) => { const ry = Math.atan2(cam.position.x - RIESE.x, cam.position.z - RIESE.z); B.schatten(1, RIESE.x, RIESE.z, ry, { g: RG, kriech: 0.1, augen, y: 0 }); };
sh(E[10] + 0.1, (t, q) => { dunkel(); oben(t, "schwitzen", "ernst", { ich: { atmen: 1 } }); kamera.luft(q, TURM.clone().add(V(0, 0, -23)), 14, 11, 80, 76, 2.6, 2.2, 52);
  kruemel(kapuze(ich), { g: 0.2 }); licht(0.6, "#9ab0ff", 1.0, "#c0a0ff"); wisch(t, 10); });
// ===== 11 Vor uns nur noch ein riesiges Auge
sh(E[11] + 0.15, (t, q) => { dunkel(); oben(t, "angst", "staunen"); const r = RAND(0);
  kamera.fahrt(q, V(r.x + 1.5, r.y + 3.4, r.z + 11), V(r.x + 1.3, r.y + 3.2, r.z + 9.5), AUGE.clone().add(V(0, -14, 0)), AUGE.clone().add(V(0, -13, 0)), 62); augenSanft(); riese(t, ease((t - Z[11]) / 0.8)); kruemel(kapuze(ich), { g: 0.2 }); licht(0.9, "#a088ff", 1.6, "#c070ff"); wisch(t, 11); });
// ===== 12 Krümel klettert aus der Kapuze
const AUF_RAND = () => { const p = RAND(-0.1); return V(p.x, p.y + 0.15, p.z - 0.2); };
sh(E[12] + 0.15, (t, q) => { dunkel(); oben(t, "traurig", "staunen"); const k = ease((t - Z[12] - 0.2) / (E[12] - Z[12] - 0.2)); const a = kapuze(ich), b = AUF_RAND(); const p = lerpV(a, b, k); p.y += Math.sin(k * Math.PI) * 0.6;
  kamera.luft(q, RAND(-0.8).add(V(0, 2.0, 0)), 5.2, 4.4, 73.6, 73.3, 2.55, 2.75, 48); augenSanft();
  riese(t); kruemel(p, { g: 0.24, kriech: 0.8 }); licht(0.8, "#a088ff", 1.4, "#c070ff"); wisch(t, 12); });
// ===== 13 Er schaut mich ganz lange an
sh(E[13] + 0.35, (t, q) => { dunkel(); oben(t, "traurig", "traurig", { kopfNeig: 0.35, ichDreh: 0.25 }); const p = AUF_RAND();
  kamera.fahrt(q, p.clone().add(V(-0.9, 0.55, -1.5)), p.clone().add(V(-0.8, 0.5, -1.3)), p.clone().add(V(0, 0.25, 0)), p.clone().add(V(0, 0.25, 0)), 40);
  augenSanft(); riese(t); kruemel(p, { g: 0.24, kriech: 0.1, augen: 0.75 + 0.25 * Math.cos((t - Z[13]) * 2) }); licht(0.8, "#a088ff", 1.4, "#c070ff"); wisch(t, 13); });
// ===== 14 Er schwebt zu seiner Mama (Goldstaub-Spur)
const T_SCHWEB = Z[14] + 0.2;
const schwebPos = (t) => { const k = easeIO((t - T_SCHWEB) / (E[14] + 0.6 - T_SCHWEB)); const p = lerpV(AUF_RAND(), V(10, 72, -674), k); p.y += Math.sin(k * Math.PI) * 6; return p; };
for (let k = 0; k < 14; k++) { const t0 = T_SCHWEB + k * 0.16; const p = schwebPos(t0); Ws.staubAnlegen(p.x, p.y, p.z, t0, 10, 0.5); }
sh(E[14] + 0.15, (t, q) => { dunkel(); oben(t, "weinen", "traurig", { ich: { armR: 1.3 } }); const p = schwebPos(t);
  const p0 = schwebPos(Math.max(T_SCHWEB, Math.min(t, E[14]))); const r = RAND(0); kamera.fahrt(q, V(r.x - 3.5, r.y + 6.0, r.z + 9), V(r.x - 3.2, r.y + 5.6, r.z + 8), AUGE.clone().add(V(0, -12, 0)), AUGE.clone().add(V(0, -10, 0)), 58); augenSanft(); riese(t); kruemel(p, { g: 0.5, kriech: 0.1 }); licht(0.9, "#a088ff", 1.6, "#c070ff"); wisch(t, 14); });
// ===== 15 Mama macht die Augen zu, ganz sanft
sh(E[15] + 0.2, (t, q) => { dunkel(); ringeAus(); const zu = 1 - easeIO((t - T_ZU) / 1.6); kamera.fahrt(q, V(70, 95, -540), V(64, 92, -548), AUGE.clone().add(V(0, -12, 0)), AUGE.clone().add(V(0, -14, 0)), 50);
  augenSanft(); riese(t, zu); kruemel(V(10, 72, -674), { g: 1.2, augen: zu, kriech: 0.1 }); licht(0.9, "#a088ff", 1.6, "#c070ff"); wisch(t, 15); });
// ===== 16 Das Licht geht wieder an (Welle vom Kraftwerk über die Stadt)
sh(E[16] + 0.15, (t, q) => { hell(); kamera.fahrt(q, V(40, 120, -480), V(40, 130, -440), V(0, 0, 60), V(0, 0, 100), 58);
  const sc = Math.max(0, 1 - easeIO((t - T_LICHT) / 1.5)); if (sc > 0.02) B.schatten(1, RIESE.x, RIESE.z, Math.atan2(cam.position.x - RIESE.x, cam.position.z - RIESE.z), { g: RG * sc, kriech: 0.4, augen: 0, y: 0 });
  licht(0.8, "#ffd8b0", 1.0); wisch(t, 16); });
// ===== 17 Viertel für Viertel bis zum Platz (Laternen gehen an)
sh(E[17] + 0.1, (t, q) => { hell(Z[17] + 0.5); strasse.visible = true; kamera.fahrt(q, V(21, 2.0, 150), V(21, 2.6, 135), V(10, 6, 40), V(6, 7, 20), 56); licht(0.8, "#ffd8b0", 1.0); wisch(t, 17); });
// ===== 18 Alle jubeln, sogar die Polizisten
sh(E[18] + 0.15, (t, q) => { hell(); Rq.polizeiSetzen(t, false, true, 27, cam.position); Rq.konfettiSetzen(t, true);
  Z_.menge = { armeHoch: () => 1, huepf: (i) => Math.max(0, Math.sin(t * 7 + i)) * 0.4, licht: 0.9, dz: 0 };
  polizist.visible = true; polizist.position.set(4, 0, 36); polizist.rotation.y = 0.3; Fg.pose(polizist, { ges: "lachen", armL: 2.8, armR: 2.8, huepf: Math.max(0, Math.sin(t * 7)) * 0.3 });
  kamera.fahrt(q, V(10, 3.0, 46), V(8, 3.4, 44), V(0, 3.5, 20), V(0, 4.5, 16), 56); licht(1.0, "#ffd8b0", 1.0); wisch(t, 18); });
// ===== 19 Papa: Das Mutigste, was ich je gesehen habe
sh(E[19] + 0.2, (t, q) => { hell(); oben(t, "lachen", t > wz("papa", 19) + 0.3 ? Fg.mund(t) : "lachen", { papaDreh: -0.5, ichDreh: 0.4, papaArmR: 1.0, papaArmRz: 0.5, kopfNeig: -0.25 });
  kamera.luft(q, RAND(0.1).add(V(0, 2.4, 0)), 10.5, 9.0, 74.6, 74.2, 2.75, 2.95, 48);
  licht(0.8, "#ffd8b0", 1.0); wisch(t, 19); });
// ===== 20 Zu Hause: das Bett ist so leer
const kette = () => { Rq.ZIMMER.schirm.material = Rq.ZIMMER.schirmAus; Rq.ZIMMER.lichterkette.visible = true; Rq.ZIMMER.licht.intensity = 7; Rq.ZIMMER.licht.color.set("#ffb060"); };
const imBett = (f, ges, o = {}) => { f.visible = true; f.position.copy(ZI(-2.2, 2.35, 0.5)); f.rotation.set(0, Math.PI / 4 + Math.PI, 0); Fg.pose(f, { liegen: 1, ges, ...o }); };
sh(E[20] + 0.15, (t, q) => { hell(-50); kette(); Rq.weckerZeichnen("23:48", true); imBett(ich, "traurig", { kopfDreh: 0.6 });
  kamera.fahrt(q, ZI(-0.6, 5.6, 2.0), ZI(-0.9, 5.3, 2.4), ZI(-2.2, 2.5, 3.9), ZI(-2.2, 2.5, 3.9), 52); licht(0.3, "#ffb060", 0.4, "#a080ff"); Wt.hemi.intensity = 0.3; wisch(t, 20); });
// ===== 21 Es klopft am Fenster
const FENSTER = (x, y, z) => ZI(x, y, -6 + z);
sh(E[21] + 0.15, (t, q) => { hell(-50); kette(); const klopf = Math.max(0, Math.sin((t - T_KLOPF) * 18)) * (t > T_KLOPF - 0.1 && t < T_KLOPF + 0.6 ? 1 : 0);
  imBett(ich, t > T_KLOPF ? "staunen" : "traurig", { kopfDreh: t > T_KLOPF ? -0.4 : 0.6 });
  kamera.fahrt(q, ZI(1.8, 4.2, 2.8), ZI(1.6, 4.3, 2.2), FENSTER(0, 4.4, 0), FENSTER(0, 4.5, 0), 50);
  const p = FENSTER(1.3, 3.4, -0.6 + klopf * 0.25); kruemel(p, { g: 0.5, kriech: 0.3, ry: Math.PI / 4 }); licht(0.3, "#ffb060", 0.4, "#a080ff"); Wt.hemi.intensity = 0.3; wisch(t, 21); });
// ===== 22 Draußen ganz viele kleine Schatten
const VIELE = []; { let s = 11; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 44; i++) VIELE.push([(r() - 0.5) * 16, 1.4 + r() * 6.5, -1.2 - r() * 9, 0.35 + r() * 0.3, r() * 6]); }
const viele = (t, n = 44) => { for (let i = 0; i < n; i++) { const [x, y, z, g, ph] = VIELE[i]; const p = FENSTER(x, y + Math.sin(t * 1.2 + ph) * 0.15, z); B.schatten(2 + i, p.x, p.z, Math.PI / 4, { y: p.y, g, kriech: 0.3, augen: 1 }); } };
sh(E[22] + 0.15, (t, q) => { hell(-50); kette(); viele(t); kamera.fahrt(q, ZI(0.2, 4.4, -2.4), ZI(0.2, 4.4, -3.4), FENSTER(0, 4.3, -6), FENSTER(0, 4.3, -6), 58);
  licht(0.4, "#ffb060", 0.5, "#a080ff"); Wt.hemi.intensity = 0.35; wisch(t, 22); });
// ===== 23 Einer hält einen Zettel hoch: HILF UNS!
const zettelZeigen = (t) => { const p = FENSTER(1.3, 3.2, -1.3); zettel.visible = t > wz("zettel", 23) - 0.3; zettel.position.copy(FENSTER(1.3, 3.45, -0.2)); zettel.rotation.y = Math.PI / 4; return p; };
sh(E[23] + 0.15, (t, q) => { hell(-50); kette(); viele(t); const p = zettelZeigen(t); kamera.fahrt(q, ZI(1.0, 3.9, -3.0), ZI(1.0, 3.9, -3.6), FENSTER(1.3, 3.7, -0.4), FENSTER(1.3, 3.7, -0.4), 44);
  kruemel(p, { g: 0.5, kriech: 0, ry: Math.PI / 4 }); licht(0.4, "#ffb060", 0.5, "#a080ff"); Wt.hemi.intensity = 0.35; wisch(t, 23); });
// ===== 24–26 Mitmach-Frage: ich am Fenster, draußen die Schatten
sh(DAUER + 1, (t, q) => { hell(-50); kette(); viele(t); const p = zettelZeigen(t); zettel.visible = true; kruemel(p, { g: 0.5, kriech: 0.2, ry: Math.PI / 4 });
  ich.visible = true; ich.position.copy(ZI(0.4, 0, -4.6)); ich.rotation.y = Math.PI / 4 + Math.PI; Fg.pose(ich, { ges: "staunen", kopfNeig: -0.1 });
  kamera.fahrt(q, ZI(3.0, 3.6, -0.5), ZI(2.8, 3.7, -0.9), FENSTER(-0.4, 3.2, -1), FENSTER(-0.4, 3.4, -1), 58); licht(0.4, "#ffb060", 0.5, "#a080ff"); Wt.hemi.intensity = 0.35; Z_.vignette = 0.5; });

B.start({
  eigeneAutos: true,
  grund: (t) => { RINGE.forEach(r => r.visible = true); Ws.augenW.material.color.setRGB(6, 6, 6); strasse.visible = false; wagen.visible = false; tor.visible = false; plakat.visible = false; zettel.visible = false; Rq.ZIMMER.lichterkette.visible = false;
    Rq.polizeiSetzen(t, false, false); Rq.konfettiSetzen(t, false); Al.HANDY.wandSchirm.material = Al.HANDY.weltMat;
    Wt.autosSetzen(t, 1e9, new Set(), (v) => (Math.abs(v.x - 24) < 7 && v.z > 40 && v.z < 360) || (Math.abs(v.x + 24) < 7 && v.z < -150)); },
  frage: { zeile: 24, text: "Was soll ich tun?", karten: [["A", "🤗", "Alle reinlassen", "reinlassen"], ["B", "👵", "Oma um Hilfe fragen", "oma"], ["C", "🪟", "Fenster zumachen", "fenster"]] },
});
