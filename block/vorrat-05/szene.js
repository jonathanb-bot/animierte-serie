// Vorrat 05 „Grill-Rakete“ – Random-Folge (Jonathan 24.11.): Rakete für den Grill geklaut, hochgeflogen, Trampolin per Express bestellt.
// Keine Mitmach-Frage, endet mit Pointe. Neue Elemente: Rakete, Startrampe, Grill, Trampolin, Lieferroller, Flugzeug (objekte.js),
// Garten hinter einem Vorstadt-Haus, Flug durch 3D-Wolken, Liefer-App auf dem Handy.
import * as B from "../folge.js";
import * as O from "../objekte.js";
const { V, sh, blick, licht, kamera, Fg, Al, Rq, Wt, Z_, THREE } = B;
await B.laden(); const { Z, E, DAUER, wz } = B.F;

const S = { struktur: true };
const ich = Fg.figur({ haut: "#f0c8a0", hemd: "#e8a020", hose: "#2a3a5a", haare: "#5a3418", frisur: "strubbel", kapuze: true, skala: 0.78, schuhe: "#e8e8e8", ...S });
const papa = Fg.figur({ haut: "#d89a6a", hemd: "#f4f4f4", hose: "#2a2a30", haare: "#3a2414", frisur: "kurz", skala: 1.1, ...S, muster: { hemd: "karo" } });
const wache = Fg.figur({ haut: "#e8bc98", hemd: "#2a3a5a", hose: "#2a3a5a", haare: "#4a3020", frisur: "kurz", muetze: "#2a3a5a", abzeichen: true, skala: 1.05, ...S });
const pilot = Fg.figur({ haut: "#c88a5a", hemd: "#f4f4f4", hose: "#2a2a3a", haare: "#2a1a10", frisur: "kurz", muetze: "#1a2a4a", sonnenbrille: true, skala: 1.0, ...S });
const fahrer = Fg.figur({ haut: "#e0b090", hemd: "#f26a1a", hose: "#2a2a3a", haare: "#1a1a1a", frisur: "kurz", helm: "#f26a1a", skala: 1.0, ...S });

const VP = Al.VORSTADT.pos;
// Garten hinter dem Haus (x ≈ −23 … −28 ist das Haus, dahinter freie Wiese)
const G = (x, y, z) => VP(-40 + x, 0.04 + y, 100 + z);
const grill = O.grill(); grill.position.copy(G(0, 0, 0)); Wt.scene.add(grill);
const liege = O.liegestuhl({ farbe: "#3ab0e8" }); liege.position.copy(G(6, 0, 7)); liege.rotation.y = -0.6; Wt.scene.add(liege);
for (const [x, z, s] of [[-12, -8, 7], [-14, 10, 9], [10, -12, 4]]) { const b = O.baum({ art: "rund", groesse: 0.8, saat: s }); b.position.copy(G(x, 0, z)); Wt.scene.add(b); }
{ const h = O.hecke({ laenge: 30 }); h.position.copy(G(-18, 0, 0)); h.rotation.y = Math.PI / 2; Wt.scene.add(h); }
const kleine = O.rakete({ hoehe: 16 }); kleine.rotation.order = "YXZ"; Wt.scene.add(kleine);
const knopf = new THREE.Group(); { const k = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), new THREE.MeshStandardMaterial({ color: "#3a3a40" })); k.position.y = 0.45; knopf.add(k);
  const r = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16), new THREE.MeshStandardMaterial({ color: "#e82a2a", emissive: "#a00000", emissiveIntensity: 0.4 })); r.position.y = 1.0; knopf.add(r); knopf.userData.rot = r; } Wt.scene.add(knopf);
const tramp = O.trampolin(); Wt.scene.add(tramp);
const roller = O.roller(); Wt.scene.add(roller);
const flieger = O.flugzeug(); Wt.scene.add(flieger);
// Raumfahrtzentrum auf der Wiese westlich der Vorstadt
const RZ = (x, y, z) => VP(-150 + x, 0.04 + y, z);
const rampe = O.startrampe(); rampe.position.copy(RZ(-10, 0, -20)); Wt.scene.add(rampe);
const gross = O.rakete({ hoehe: 60, akzent: "#2a6ae8" }); gross.position.copy(RZ(-10, 1.2, -20)); Wt.scene.add(gross);
const mittel = O.rakete({ hoehe: 36, akzent: "#f2a21a" }); mittel.position.copy(RZ(20, 0, -34)); Wt.scene.add(mittel);
for (let i = 0; i < 5; i++) { const z = O.zaun({ laenge: 14 }); z.position.copy(RZ(40, 0, -30 + i * 14)); z.rotation.y = Math.PI / 2; Wt.scene.add(z); }
const wStuhl = O.stuhl(); wStuhl.position.copy(RZ(44, 0, 8)); wStuhl.rotation.y = -Math.PI / 2; Wt.scene.add(wStuhl);
const schild = Al.leinwand(16, 2.6, {}); schild.position.copy(RZ(41, 7, 14)); schild.rotation.y = Math.PI / 2; Wt.scene.add(schild);
Al.schreibe(schild, ["RAUMFAHRTZENTRUM"], { bg: "#f4f4f4", fg: "#1a3a6a", font: "900 150px 'Inter Display', sans-serif" });
for (const p of [RZ(41, 0, 8), RZ(41, 0, 20)]) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 7, 8), new THREE.MeshStandardMaterial({ color: "#8a8a90" })); s.position.copy(p).add(V(0, 3.5, 0)); Wt.scene.add(s); }
// Wolken für den Flug (über dem Garten)
const wolken = []; for (let i = 0; i < 16; i++) { const w = O.wolke({ groesse: 1.4 + (i % 3) * 0.5, saat: i + 3 }); const a = i * 2.4, r = 55 + (i * 17) % 70; w.position.copy(G(Math.cos(a) * r, 130 + (i * 23) % 70, Math.sin(a) * r)); Wt.scene.add(w); wolken.push(w); }

const tag = () => { Wt.U.uTag.value = 1; Wt.U.uWolken.value = 1; Wt.hemi.intensity = 1.2; Wt.hemi.color.set("#cfe4ff"); Wt.hemi.groundColor.set("#8a8070"); };
const wisch = (t, i, d = 0) => { Wt.grade.uniforms.uWisch.value = B.wisch(t, Z[i] - 0.06 + d); };
const nah = (q, f, abst, seite = 0, h = 0) => { f.updateMatrixWorld(true); const k = Fg.kopfPos(f); kamera.fahrt(q, f.localToWorld(V(seite, 3.4 + h, abst)), f.localToWorld(V(seite * 0.85, 3.4 + h, abst - 0.6)), V(k.x, k.y - 0.2, k.z), V(k.x, k.y - 0.2, k.z), 46); };
const papaGrill = (t, ges, pusten = false) => { papa.visible = true; papa.position.copy(G(0, 0, -2.6)); papa.rotation.y = 0; Fg.pose(papa, { ges, neig: pusten ? 0.35 : 0, armL: 0.8, armR: 0.8, armLz: 0.3, armRz: -0.3 }); };
// Raketenflug: Startzeit und Höhe (weich beschleunigt)
const T_START = wz("an", 6) + 0.1;
const hoehe = (t) => { const u = Math.max(0, t - T_START); return u * u * 9; };
const raketeFliegt = (t, o = {}) => { kleine.visible = true; kleine.position.copy(G(2.5, hoehe(t), 0.6)); kleine.rotation.set(0, 0, o.kipp ?? 0); kleine.userData.flamme.visible = o.flamme ?? true;
  const fl = kleine.userData.flamme; fl.scale.setScalar(1 + 0.06 * Math.sin(t * 40) ** 2); };
const ichAnRakete = (t, ges = "schreien") => { kleine.updateMatrixWorld(true); ich.visible = true; ich.position.copy(kleine.localToWorld(V(0, 7.4, 1.95))); ich.rotation.set(0, 0, kleine.rotation.z); Fg.pose(ich, { ges, armL: 2.9, armR: 2.9, armLz: 0.5, armRz: -0.5 }); };

// 0 Hook: Ich renne mit der Rakete auf der Schulter durch den Garten
const tragen = (t, p) => { ich.visible = true; ich.position.copy(p); ich.rotation.y = Math.PI / 2; Fg.pose(ich, { renn: 1, phase: t * 9, ges: "lachen", armL: 2.8, armR: 2.8 });
  ich.updateMatrixWorld(true); kleine.visible = true; kleine.position.copy(ich.localToWorld(V(0.9, 3.0, -4.6))); kleine.rotation.set(Math.PI / 2, ich.rotation.y, 0); kleine.scale.setScalar(0.55); };
sh(E[0] + 0.1, (t, q) => { tag(); tragen(t, G(-10 + q * 7, 0, 4)); papaGrill(t, "staunen");
  kamera.fahrt(q, G(-4, 4.2, 13.5), G(-2.6, 4.2, 13), G(-8, 2.8, 3.5), G(-4, 2.8, 3.5), 56); licht(1.6, "#fff4e0", 1.0, "#ffffff"); });
// 1 Papa pustet eine Stunde: nichts
sh(E[1] + 0.06, (t, q) => { tag(); papaGrill(t, t % 1 < 0.6 ? "kneifen" : "schwitzen", true); Al.rauch(t, true, { x: G(0, 0, 0).x, y: 3.2, z: G(0, 0, 0).z, t0: Z[1], staerke: 0.12 });
  Z_.zaehler = { wert: t < Z[1] + 1.2 ? "12:00" : "13:00", farbe: "gelb", einheit: " Uhr" }; nah(q, papa, 6.4, 1.0, -0.4); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 1); });
// 2 Zum Raumfahrtzentrum
sh(E[2] + 0.1, (t, q) => { tag(); ich.visible = true; ich.position.copy(RZ(60 - q * 8, 0, 12)); ich.rotation.y = -Math.PI / 2; Fg.pose(ich, { lauf: 1, phase: t * 7, ges: "froh" });
  kamera.fahrt(q, RZ(76, 9, 30), RZ(72, 8, 27), RZ(10, 20, -14), RZ(12, 24, -18), 56); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 2); });
// 3 Der Wachmann schläft – ich nehme die kleinste
sh(wz("ich", 3) - 0.1, (t, q) => { tag(); wache.visible = true; wache.position.copy(RZ(44, -0.05, 8)); wache.rotation.y = -Math.PI / 2; Fg.pose(wache, { sitz: 1, ges: "schlaf", kopfNeig: 0.55 }); Al.kopfzahl(wache, "Zzz", { farbe: "#ffffff", groesse: 0.8 });
  nah(q, wache, 6.4, -1.4, -0.6); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 3); });
sh(E[3] + 0.1, (t, q) => { tag(); kleine.visible = true; kleine.position.copy(RZ(32, 0, -6)); ich.visible = true; ich.position.copy(RZ(34, 0, -1)); ich.rotation.y = -0.6; Fg.pose(ich, { ges: "lachen", armR: 1.5, armRz: 0.3 });
  kamera.fahrt(q, RZ(52, 6, 14), RZ(50, 6.5, 12), RZ(28, 8, -10), RZ(28, 12, -12), 58); licht(1.6, "#fff4e0", 1.0, "#ffffff"); });
// 4 Die kleinste war so groß wie unser Haus (im Garten neben dem Haus)
sh(E[4] + 0.1, (t, q) => { tag(); kleine.visible = true; kleine.position.copy(G(2.5, 0, 0.6)); papaGrill(t, "staunen"); ich.visible = true; ich.position.copy(G(5.5, 0, 3)); ich.rotation.y = -0.4; Fg.pose(ich, { ges: "lachen" });
  kamera.fahrt(q, G(-6, 3, 26), G(-5, 4, 24), G(0, 7, 0), G(0, 9, 0), 60); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 4); });
// 5 Unter den Grill gestellt, roter Knopf
sh(wz("knopf", 5) - 0.3, (t, q) => { tag(); kleine.visible = true; kleine.position.copy(G(2.5, 0, 0.6)); papaGrill(t, "angst"); knopf.visible = true; knopf.position.copy(G(5, 0, 4));
  ich.visible = true; ich.position.copy(G(5, 0, 5.6)); ich.rotation.y = Math.PI; Fg.pose(ich, { ges: "lachen", armR: 1.3, neig: 0.2 }); kamera.fahrt(q, G(13, 5.5, 15), G(12, 5.2, 13.8), G(3, 3.0, 2), G(3.5, 3.0, 2.5), 52); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 5); });
sh(E[5] + 0.1, (t, q) => { tag(); knopf.visible = true; knopf.position.copy(G(5, 0, 4)); const k = knopf.userData.rot.position; k.y = t > wz("gedrückt", 5) ? 0.92 : 1.0;
  ich.visible = true; ich.position.copy(G(5, 0, 5.6)); ich.rotation.y = Math.PI; Fg.pose(ich, { ges: "idee", armR: 1.3, neig: 0.2 }); const p = G(5, 1, 4); kamera.fahrt(q, p.clone().add(V(2.4, 1.8, -1.8)), p.clone().add(V(1.9, 1.5, -1.4)), p.clone().add(V(0, 0.4, 0.6)), p.clone().add(V(0, 0.4, 0.6)), 50); licht(1.6, "#fff4e0", 1.0, "#ffffff"); });
// 6 Der Grill war sofort an. Ich leider auch.
sh(wz("ich", 6) - 0.1, (t, q) => { tag(); kleine.visible = true; kleine.position.copy(G(2.5, 0, 0.6)); kleine.userData.flamme.visible = true; grill.userData.feuer.visible = true; papaGrill(t, "schreien");
  Al.rauch(t, true, { x: G(2.5, 0, 0.6).x, y: 1, z: G(2.5, 0, 0.6).z, t0: Z[6] - 0.3, staerke: 1.5 }); kamera.fahrt(q, G(-4, 4, 12), G(-4.4, 4.2, 12.6), G(1.5, 2.6, 0), G(1.5, 2.6, 0), 54); licht(1.6, "#ffd8b0", 1.0, "#ffffff"); wisch(t, 6); });
sh(E[6] + 0.1, (t, q) => { tag(); raketeFliegt(t); ichAnRakete(t); grill.userData.feuer.visible = true; papaGrill(t, "staunen");
  Al.rauch(t, true, { x: G(2.5, 0, 0.6).x, y: 1, z: G(2.5, 0, 0.6).z, t0: Z[6], staerke: 1.5 }); kamera.fahrt(q, G(-12, 3, 20), G(-12, 3.4, 20), kleine.position.clone().add(V(0, 8, 0)), kleine.position.clone().add(V(0, 8, 0)), 58); licht(1.6, "#fff4e0", 1.0, "#ffffff"); });
// 7 Durch die Wolken (Rakete fliegt durch das Wolkenband, Kamera neben ihr)
const flugBild = (t, y, ges = "schreien") => { kleine.visible = true; kleine.position.copy(G(2.5, y, 0.6)); kleine.rotation.set(0, 0, 0); kleine.userData.flamme.visible = true; kleine.userData.flamme.scale.setScalar(1 + 0.06 * Math.sin(t * 40) ** 2); ichAnRakete(t, ges); };
sh(E[7] + 0.1, (t, q) => { tag(); const y = 110 + q * 90; flugBild(t, y); const k = G(2.5, y + 8, 0.6); kamera.fahrt(q, k.clone().add(V(9, -4, 12)), k.clone().add(V(8, 0, 11)), k, k, 56); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 7); });
// 8 Ein Pilot winkt (Flugzeug fliegt vorbei, Pilot oben auf dem Cockpit)
sh(E[8] + 0.2, (t, q) => { tag(); const y = 230; flugBild(t, y, "froh"); Fg.pose(ich, { ges: "lachen", armL: 2.9, armLz: 0.5, armR: 2.2 + 0.4 * Math.sin(t * 9) });
  flieger.visible = true; flieger.position.copy(G(-46 + q * 44, y + 3, -14)); flieger.rotation.set(0, Math.PI / 2, 0); flieger.updateMatrixWorld(true);
  pilot.visible = true; pilot.position.copy(flieger.localToWorld(V(0, 0.4, 9.6))); pilot.rotation.y = 0; Fg.pose(pilot, { sitz: 1, ges: "lachen", armR: 2.4 + 0.4 * Math.sin(t * 9) });
  const k = G(2.5, y + 8, 0.6); kamera.fahrt(q, k.clone().add(V(-2, 2, 30)), k.clone().add(V(-1, 2, 28)), k.clone().add(V(-8, -1, -6)), k.clone().add(V(-4, -1, -6)), 58); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 8); });
// 9 Sprit leer: Flamme aus, Anzeige rot
sh(E[9] + 0.2, (t, q) => { tag(); const y = 250; kleine.visible = true; kleine.position.copy(G(2.5, y, 0.6)); kleine.rotation.set(0, 0, 0.15 * q); kleine.userData.flamme.visible = t < wz("leer", 9); ichAnRakete(t, "staunen");
  Z_.zaehler = { wert: t < wz("leer", 9) ? "SPRIT 3" : "SPRIT 0", farbe: "rot", einheit: " %" }; nah(q, ich, 5.4, 0.8); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 9); });
// 10 Ich falle, sehr schnell (Kamera fällt mit, Wolken rasen vorbei)
const fallY = (t) => 250 - Math.max(0, t - Z[10]) ** 2 * 5;
const fallen = (t) => { ich.visible = true; ich.position.copy(G(1.5, fallY(t), 2)); ich.rotation.set(0.5, 0, 0); Fg.pose(ich, { ges: "schreien", armL: 2.6 + 0.3 * Math.sin(t * 14), armR: 2.6 - 0.3 * Math.sin(t * 14), armLz: 0.8, armRz: -0.8 }); };
sh(E[10] + 0.1, (t, q) => { tag(); fallen(t); const k = Fg.kopfPos(ich); kamera.fahrt(q, k.clone().add(V(4, -9, 6)), k.clone().add(V(3, -8, 5)), k, k, 58); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 10); });
// 11–12 Handy: Liefer-App, Trampolin, Express 30 Sekunden
const app = (t) => Al.handySeite((x, w, h) => { x.fillStyle = "#1e2630"; x.fillRect(0, 0, w, h); x.fillStyle = "#f26a1a"; x.fillRect(0, 0, w, 190); x.fillStyle = "#ffffff"; x.font = "900 70px 'Inter Display', sans-serif"; x.textAlign = "center"; x.fillText("LIEFER-APP", w / 2, 125);
  x.fillStyle = "#2a8ae8"; x.beginPath(); x.ellipse(w / 2, 470, 210, 60, 0, 0, 7); x.lineWidth = 34; x.strokeStyle = "#2a8ae8"; x.stroke(); x.fillStyle = "#1a1a1e"; x.beginPath(); x.ellipse(w / 2, 470, 190, 48, 0, 0, 7); x.fill();
  x.fillStyle = "#ffffff"; x.font = "900 66px 'Inter Display', sans-serif"; x.fillText("TRAMPOLIN", w / 2, 680); x.fillStyle = "#ff6a4a"; x.font = "900 56px 'Inter Display', sans-serif"; x.fillText("EXPRESS: 30 SEK", w / 2, 780);
  x.fillStyle = "#2ab04a"; x.beginPath(); x.roundRect(80, 880, w - 160, 150, 40); x.fill(); x.fillStyle = "#ffffff"; x.font = "900 70px 'Inter Display', sans-serif"; x.fillText("BESTELLEN", w / 2, 980); }, "app");
const handyFallen = (t) => { fallen(t); ich.rotation.set(0.2, 0, 0); Fg.pose(ich, { ges: "idee", armR: 1.45, armRz: -0.3, armL: 2.6, armLz: 0.8 }); app(t); const kam = Fg.kopfPos(ich).add(V(0.6, 0.6, 1.6)); Al.handyHalten(ich, Fg.handPos, Fg.kopfPos, { zu: kam }); return kam; };
sh(E[11] + 0.1, (t, q) => { tag(); handyFallen(t); nah(q, ich, 4.6, -0.7); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 11); });
sh(E[12] + 0.15, (t, q) => { tag(); const kam0 = handyFallen(t), hp = Al.handy.position.clone(); const kam = hp.clone().add(kam0.clone().sub(hp).normalize().multiplyScalar(2.6)); blick(kam, hp); Wt.cam.fov = 46 - q * 4; Z_.zaehler = { wert: "0:30", farbe: "gelb", einheit: "" }; licht(1.6, "#fff4e0", 1.0, "#ffffff"); });
// 13 Lieferfahrer rast mit dem Roller durch den Garten (Zähler läuft runter)
const rollerFahrt = (t, q, z) => { roller.visible = true; roller.position.copy(G(-20 + q * 22, 0, z)); roller.rotation.y = Math.PI / 2; roller.updateMatrixWorld(true);
  fahrer.visible = true; fahrer.position.copy(roller.localToWorld(V(0, 0.2, -0.3))); fahrer.rotation.y = roller.rotation.y; Fg.pose(fahrer, { sitz: 1, ges: "lachen", armL: 1.3, armR: 1.3 }); };
const rest = (t) => Math.max(0, Math.ceil(30 - (t - Z[13]) * 4));
sh(E[13] + 0.1, (t, q) => { tag(); rollerFahrt(t, q, 8); grill.userData.feuer.visible = true; papaGrill(t, "staunen");
  Z_.zaehler = { wert: "0:" + String(rest(t)).padStart(2, "0"), farbe: "gelb", einheit: "" }; kamera.fahrt(q, G(-6, 2.2, 22), G(-4, 2.4, 22), G(-16, 1.8, 8), G(0, 1.8, 8), 52); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 13); });
// 14 Er baut es genau unter mir auf (von oben: ich falle aufs Trampolin zu)
sh(E[14] + 0.1, (t, q) => { tag(); tramp.visible = true; tramp.position.copy(G(1.5, 0, 2)); tramp.scale.setScalar(Math.min(1, 0.2 + q * 2)); fahrer.visible = true; fahrer.position.copy(G(-3, 0, 4)); fahrer.rotation.y = 0.8; Fg.pose(fahrer, { ges: "lachen", armR: 2.6, armL: 2.6 });
  roller.visible = true; roller.position.copy(G(-6, 0, 7)); roller.rotation.y = 0.4; Z_.zaehler = { wert: "0:01", farbe: "gruen", einheit: "" };
  ich.visible = true; ich.position.copy(G(1.5, 26 - q * 12, 2)); ich.rotation.set(0.3, 0, 0); Fg.pose(ich, { ges: "schreien", armL: 2.6, armR: 2.6, armLz: 0.8, armRz: -0.8 });
  kamera.fahrt(q, G(1.5, 44, 2.5), G(1.5, 30, 2.5), G(1.5, 0, 2), G(1.5, 0, 2), 56); Wt.cam.up.set(0, 0, -1); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 14); });
// 15 Draufgeknallt und sanft auf dem Liegestuhl gelandet
const T_PRALL = Z[15] + 0.25;
sh(E[15] + 0.2, (t, q) => { tag(); tramp.visible = true; tramp.position.copy(G(1.5, 0, 2)); tramp.scale.setScalar(1); const u = t - T_PRALL; tramp.userData.matte.position.y = 1.38 - Math.max(0, 0.9 * Math.exp(-Math.max(0, u) * 5) * Math.cos(Math.max(0, u) * 14)) * (u > -0.05 ? 1 : 0);
  ich.visible = true; liege.updateMatrixWorld(true); const ziel = liege.localToWorld(V(0, 1.45, 2.3)); const start = G(1.5, 1.6, 2);
  if (u < 0) { ich.position.copy(start).add(V(0, -u * 30, 0)); ich.rotation.set(0.4, 0, 0); Fg.pose(ich, { ges: "schreien", armL: 2.6, armR: 2.6 }); }
  else { const e = Math.min(1, u / 0.9); ich.position.lerpVectors(start, ziel, e); ich.position.y += Math.sin(Math.PI * e) * 6; if (e < 1) { ich.rotation.set(-e * Math.PI * 2, 0, 0); Fg.pose(ich, { ges: "lachen", armL: 2.6, armR: 2.6 }); } else { ich.rotation.set(0, liege.rotation.y, 0); Fg.pose(ich, { liegen: 1, ges: "froh", armL: 2.4, armR: 2.4 }); } }
  kamera.fahrt(q, G(-4, 5.4, 18), G(-3, 5.2, 17), G(4, 2.6, 5), G(5, 2.2, 6), 58); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 15); });
// 16 Papa: „Wo sind die Würstchen?“ (Grill brennt lichterloh, Würstchen weg)
sh(E[16] + 0.3, (t, q) => { tag(); grill.userData.feuer.visible = true; grill.userData.feuer.scale.setScalar(1.6); papaGrill(t, Fg.mund(t)); papa.position.copy(G(-2.8, 0, -0.6)); papa.rotation.y = 0.7; Fg.pose(papa, { ges: Fg.mund(t), armL: 0.6, armLz: 0.9, armR: 1.6, armRz: -0.4 });
  nah(q, papa, 6.4, -1.6); licht(1.6, "#ffd8b0", 1.0, "#ffffff"); wisch(t, 16); });
// 17 Der Fahrer will fünf Sterne – bekommt er
sh(DAUER + 1, (t, q) => { tag(); fahrer.visible = true; fahrer.position.copy(G(-1, 0, 7)); fahrer.rotation.y = 0.5; Fg.pose(fahrer, { ges: "lachen", armR: 2.7, armRz: 0.2 }); Al.kopfzahl(fahrer, t > wz("bekommen", 17) - 0.2 ? "⭐⭐⭐⭐⭐" : "⭐ ? ", { farbe: "#ffd23a", groesse: 0.9 });
  tramp.visible = true; tramp.position.copy(G(1.5, 0, 2)); roller.visible = true; roller.position.copy(G(-6, 0, 7)); roller.rotation.y = 0.4; nah(q, fahrer, 6.0, 0.8); licht(1.6, "#fff4e0", 1.0, "#ffffff"); wisch(t, 17); });

B.start({ grund: (t) => { kleine.visible = false; kleine.scale.setScalar(1); kleine.rotation.set(0, 0, 0); kleine.userData.flamme.visible = false; grill.userData.feuer.visible = false; grill.userData.feuer.scale.setScalar(1);
  knopf.visible = false; tramp.visible = false; tramp.userData.matte.position.y = 1.38; roller.visible = false; flieger.visible = false; } });
