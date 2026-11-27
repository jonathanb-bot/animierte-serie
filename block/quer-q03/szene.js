// q03 „In meiner Stadt darf jeder nur 100 Wörter am Tag sagen“ – Querformat lang im 3D-Stil (27.11.)
// Regel: Zahl über jedem Kopf (100 pro Tag, jedes Wort −1, Schreiben zählt mit), bei 0 stumm bis Mitternacht, Hunde zählen nicht,
// Wörter wandern per Handschlag. Welten: Buntdorf (Dorfplatz, Bushaltestelle, Schule mit Hof), Blockstadt-Platz (Rückblick),
// Kinderzimmer (mit neuer Tür), Küche, Klasse, Omas Stube (Fernseher zeigt das Studio), neu: Mensa, Nachrichtenstudio, Kirchturm.
import * as B from "../folge.js";
import * as O from "../objekte.js";
const { V, sh, licht, kamera, ease, easeIO, lerp, lerpV, Fg, Al, Rq, Wt, Z_, THREE } = B;
await B.laden(); const { Z, E, DAUER } = B.F;
const PL = B.F.plan.zeilen;
// Englische Fassung (?sprache=en): deutsche Stichwörter → englische Wörter derselben Zeile (beim Freitag-Teil ergänzen)
const EN = {};
const wz = (w, i) => B.F.wz(B.SPRACHE === "en" ? (EN[i + ":" + w] ?? EN[w] ?? w) : w, i);
const wort = (i, k) => (PL[i].woerter[Math.min(k, PL[i].woerter.length - 1)] ?? [PL[i].start])[0];   // Start des k-ten Worts einer Zeile
const gesagt = (t, i, ab = 0) => PL[i].woerter.slice(ab).filter(w => w[0] <= t).length;              // bis t gesprochene Wörter (ab Wort „ab“)

// ---------- Figuren (struktur: true) ----------
const S = { struktur: true };
const ich = Fg.figur({ haut: "#f0c8a0", hemd: "#e8a020", hose: "#2a3a5a", haare: "#5a3418", frisur: "strubbel", kapuze: true, skala: 0.78, schuhe: "#e8e8e8", ...S });
const ichPyj = Fg.figur({ haut: "#f0c8a0", hemd: "#6a8ae8", hose: "#6a8ae8", haare: "#5a3418", frisur: "strubbel", skala: 0.78, schuhe: "#f0f0f0", ...S, muster: { hemd: "streifen", hose: "streifen" } });
const papa = Fg.figur({ haut: "#d89a6a", hemd: "#3a6ac8", hose: "#2a2a30", haare: "#3a2414", frisur: "kurz", skala: 1.1, ...S });
const papaTV = Fg.figur({ haut: "#d89a6a", hemd: "#f4f4f4", jacke: "#24283a", hose: "#24283a", haare: "#3a2414", frisur: "kurz", skala: 1.1, schuhe: "#141414", ...S });
{ const k = papaTV.userData.koerper, rot = new THREE.MeshStandardMaterial({ color: "#c82a3a", roughness: 0.5 });   // Krawatte
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.34, 1.35, 0.07), rot); band.position.set(0, 2.95, 0.55); k.add(band);
  const knoten = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.1), rot); knoten.position.set(0, 3.72, 0.55); k.add(knoten); }
const mama = Fg.figur({ haut: "#e8b890", hemd: "#e85a7a", hose: "#3a3a5a", haare: "#7a3a1a", frisur: "zopf", skala: 1.0, ...S, muster: { hemd: "punkte" } });
const oma = Fg.figur({ haut: "#f2d0b0", hemd: "#8a4a6a", stoff: true, hose: "#4a3a4a", haare: "#e0e0e0", frisur: "dutt", brille: true, schal: "#c8a050", skala: 0.95, ...S });
const mia = Fg.figur({ haut: "#f0c8a0", hemd: "#f25a9a", hose: "#5a3a8a", haare: "#6a3a18", frisur: "zopf", skala: 0.55, schuhe: "#f25a9a", ...S });
const ben = Fg.figur({ haut: "#8a5a3a", hemd: "#3ab88a", hose: "#3a3a5a", haare: "#1a1a1a", frisur: "kurz", skala: 0.78, ...S });
const krause = Fg.figur({ haut: "#e8b890", hemd: "#f4f4f4", jacke: "#2ab0a0", hose: "#c8a878", haare: "#6a4a2a", brille: true, skala: 1.05, ...S });
const k2 = Fg.figur({ haut: "#f0d0b0", hemd: "#8a5ae8", hose: "#2a3a5a", haare: "#c88a3a", frisur: "zopf", skala: 0.76, ...S });
const k3 = Fg.figur({ haut: "#e0b090", hemd: "#e8603a", hose: "#2a2a3a", haare: "#4a2a1a", frisur: "strubbel", skala: 0.77, ...S, muster: { hemd: "streifen" } });
const k4 = Fg.figur({ haut: "#c88a5a", hemd: "#f2c21a", hose: "#3a4a6a", haare: "#2a1a10", frisur: "dutt", skala: 0.75, ...S });
const k5 = Fg.figur({ haut: "#f2d0b0", hemd: "#4a8ae8", hose: "#2a2a3a", haare: "#e8c060", frisur: "kurz", skala: 0.77, ...S });
const nachbarin = Fg.figur({ haut: "#c88a5a", hemd: "#f2c21a", hose: "#4a4a52", haare: "#2a1a10", frisur: "zopf", skala: 1.0, ...S });
const baecker = Fg.figur({ haut: "#f0c8a8", hemd: "#f8f8f8", hose: "#3a3a42", haare: "#8a5a2a", frisur: "glatze", skala: 1.05, ...S });
const mann0 = Fg.figur({ haut: "#e8c0a0", hemd: "#7a4ac8", hose: "#2a2a3a", haare: "#3a2a1a", frisur: "kurz", skala: 1.05, ...S });
const kantine = Fg.figur({ haut: "#e8b890", hemd: "#f8f8f8", hose: "#f8f8f8", haare: "#b8b8b8", frisur: "dutt", skala: 1.0, ...S, muster: { hemd: "karo" } });
const buergermeister = Fg.figur({ haut: "#f0c8a8", hemd: "#2a2a34", jacke: "#141418", hose: "#141418", haare: "#d8d8d8", frisur: "kurz", zylinder: true, goldkette: true, skala: 1.1, ...S });
const baby = Fg.figur({ haut: "#f0c8a0", hemd: "#f8e8a0", hose: "#f8e8a0", haare: "#5a3418", frisur: "glatze", baby: true, skala: 0.45, ...S });
const bello = O.hund({ fell: "#c8864a", groesse: 0.9 }); Wt.scene.add(bello);
const beine = (f, a = 0) => { f.userData.beinL.rotation.z = -a; f.userData.beinR.rotation.z = a; };   // Beine auseinander (Eiffelturm)

// ---------- Hilfen ----------
const DP = Al.BUNTDORF.pos, C = Al.BUNTDORF.platz;
const loc = (R, x, y, z) => V(R.g.position.x + x, y, R.g.position.z + z);
const zm = Rq.zimmer; const ZI = (x, y, z) => { zm.updateMatrixWorld(true); return V(x, y, z).applyMatrix4(zm.matrixWorld); };
const RZ = Math.PI / 4;                 // Drehung des Kinderzimmers (lokal a → Welt RZ + a)
const KU = Al.KUECHE, ST = Al.STUBE, KL = Al.KLASSE;
const wisch = (t, i, d = 0) => { Wt.grade.uniforms.uWisch.value = B.wisch(t, Z[i] - 0.06 + d); };
const tag = () => { Wt.U.uTag.value = 1; Wt.U.uWolken.value = 1; Wt.hemi.intensity = 1.2; Wt.hemi.color.set("#cfe4ff"); Wt.hemi.groundColor.set("#8a8070"); };
const morgen = () => { tag(); Wt.hemi.color.set("#ffe0c0"); };
const abend = () => { tag(); Wt.U.uAbend.value = 1; Wt.hemi.color.set("#ffc8a0"); Wt.hemi.intensity = 1.0; };
const TAG_L = () => licht(1.6, "#fff4e0", 1.0, "#ffffff"), ABEND_L = () => licht(1.2, "#ffb888", 0.9, "#c0a0ff"), RAUM_L = () => licht(0.6, "#fff4e0", 0.4, "#e0f0ff");
const zahlF = n => n >= 50 ? "#4ef07a" : n >= 10 ? "#ffe53a" : "#ff4a4a";
const zahl = (wer, n, g = 0.75) => Al.kopfzahl(wer, String(Math.max(0, Math.round(n))), { farbe: zahlF(n), groesse: g });
const uhrzeit = (de, en) => { Z_.zaehler = { wert: B.T({ de, en }), farbe: "gelb", einheit: "" }; };
const zurKam = (p) => Math.atan2(Wt.cam.position.x - p.x, Wt.cam.position.z - p.z);
const nah = (q, f, abst, seite = 0, h = 0, fov = 46) => { f.updateMatrixWorld(true); const k = Fg.kopfPos(f); kamera.fahrt(q, f.localToWorld(V(seite, 3.4 + h, abst)), f.localToWorld(V(seite * 0.85, 3.4 + h, abst - 0.6)), V(k.x, k.y - 0.1, k.z), V(k.x, k.y - 0.1, k.z), fov); };
const stell = (f, p, ry, pose = {}) => { f.visible = true; f.position.copy(p); f.rotation.set(0, ry, 0); Fg.pose(f, pose); return f; };

// ---------- Zählerstände über den Tag ----------
const T_MORGEN = () => wz("morgen", 17);
const ichZahl = (t) => { if (t < T_MORGEN()) return 100; if (t < Z[22]) return 98; if (t < E[24]) return Math.round(B.zaehlen(t, Z[22] + 0.2, E[24] - 0.2, 98, 3));
  if (t < wz("mia", 95)) return 3; if (t < wz("stopp", 95)) return 2; if (t < wz("auch", 129)) return 1; if (t < wz("hundert", 133)) return 0;
  if (t < Z[134]) return 100; if (t < E[136]) return Math.round(B.zaehlen(t, Z[135], E[136] - 0.3, 100, 0)); return 3; };
const papaZahl = (t) => { if (t < wz("kaffee", 7)) return 100; if (t < Z[83]) return 99; if (t < Z[84]) return Math.round(B.zaehlen(t, Z[83] + 0.3, E[83], 99, 91));
  if (t < E[84] + 0.3) return t < wz("neunzig", 84) ? 91 : t < wz("siebzig", 84) ? 90 : t < wz("vierzig", 84) ? 70 : t < wz("zehn", 84) ? 40 : 10;
  if (t < Z[124]) return 3; if (t < wz("hundert", 133)) return 3 - gesagt(t, 124); if (t < Z[134]) return 100;
  if (t < E[134]) return 100 - gesagt(t, 134, 4); if (t < E[136]) return Math.round(B.zaehlen(t, Z[135], E[136] - 0.3, 92, 0)); return 3; };
const miaZahl = (t) => t < Z[15] ? 3 : t < E[16] + 30 ? Math.max(0, 3 - gesagt(t, 15)) : 0;
// Oma spricht in den Zeilen 61–69 (nur ihre wörtliche Rede zählt)
const OMA_REDE = [[61, 3], [62, 0], [63, 0], [65, 4], [66, 0], [67, 0], [69, 6]];
const omaZahl = (t) => 90 - OMA_REDE.reduce((n, [i, ab]) => n + gesagt(t, i, ab), 0);
const krauseZahl = (t) => t < wz("und", 37) ? 163 : t < wz("eins", 44) ? 163 - Math.min(5, gesagt(t, 37, 7)) : t < wz("plus", 44) + 0.2 ? 157 : 156;

// ---------- Neue Kulissen-Teile ----------
const kasten = (x, z, Bw, T, H, wand, boden, lampe = 12, farbe = "#fff4e4") => { const g = new THREE.Group(); g.position.set(x, 0, z); Wt.scene.add(g);
  const m = (c, r = 0.8) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
  const bo = new THREE.Mesh(new THREE.BoxGeometry(Bw, 0.2, T), m(boden, 0.6)); bo.position.y = -0.1; g.add(bo);
  const de = new THREE.Mesh(new THREE.BoxGeometry(Bw, 0.2, T), m("#f4f2ee")); de.position.y = H + 0.1; g.add(de);
  for (const [w, d, px, pz] of [[Bw, 0.3, 0, -T / 2], [Bw, 0.3, 0, T / 2], [0.3, T, -Bw / 2, 0], [0.3, T, Bw / 2, 0]]) { const wd = new THREE.Mesh(new THREE.BoxGeometry(w, H, d), m(wand, 0.85)); wd.position.set(px, H / 2, pz); g.add(wd); }
  const l = new THREE.PointLight(farbe, 0, 50, 1.4); l.position.set(0, H - 1, 0); g.add(l); const R = { g, B: Bw, T, H, licht: l, staerke: lampe };
  R.pos = (a, y, b) => V(x + a, y, z + b); R.an = (s = lampe) => { l.intensity = s; }; return R; };

// Mensa (bei 2600, −600): Ausgabe-Theke mit Pizza und Brokkoli, lange Tische, Hocker
const MENSA = kasten(2600, -600, 22, 16, 7, "#f2e2b8", "#d8dcde", 14);
{ const g = MENSA.g, m = (c, r = 0.6) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
  const theke = new THREE.Mesh(new THREE.BoxGeometry(12, 2.2, 1.8), m("#7ac0e8", 0.5)); theke.position.set(-2, 1.1, -5.6); g.add(theke);
  const glas = new THREE.Mesh(new THREE.BoxGeometry(12, 0.1, 2.0), m("#e8eef2", 0.3)); glas.position.set(-2, 2.25, -5.6); g.add(glas);
  const wandU = new THREE.Mesh(new THREE.BoxGeometry(22, 3, 0.2), m("#e8a83a", 0.7)); wandU.position.set(0, 1.5, -7.8); g.add(wandU);
  // Pizza-Blech links, Brokkoli-Schale rechts
  const pizzaT = new THREE.CanvasTexture((() => { const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d"); x.fillStyle = "#e8b060"; x.beginPath(); x.arc(128, 128, 124, 0, 7); x.fill(); x.fillStyle = "#e05a2a"; x.beginPath(); x.arc(128, 128, 108, 0, 7); x.fill();
    x.fillStyle = "#f8e8a0"; for (let i = 0; i < 18; i++) { x.beginPath(); x.arc(128 + Math.cos(i * 2.3) * 70 * ((i % 3) / 3 + 0.3), 128 + Math.sin(i * 2.3) * 70 * ((i % 3) / 3 + 0.3), 14, 0, 7); x.fill(); }
    x.fillStyle = "#b82a2a"; for (let i = 0; i < 9; i++) { x.beginPath(); x.arc(128 + Math.cos(i * 0.7) * 60, 128 + Math.sin(i * 0.7) * 60, 15, 0, 7); x.fill(); } return c; })()); pizzaT.colorSpace = THREE.SRGBColorSpace;
  MENSA.pizza = new THREE.Group(); for (const [px, pz] of [[-5.6, -5.6], [-4.2, -5.6]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.08, 28), [m("#d8a050"), new THREE.MeshStandardMaterial({ map: pizzaT, roughness: 0.6 }), m("#d8a050")]); p.position.set(px, 2.36, pz); MENSA.pizza.add(p); } g.add(MENSA.pizza);
  const schale = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.75, 0.35, 24), m("#cfd2d8", 0.3)); schale.position.set(1.2, 2.45, -5.6); g.add(schale);
  const brok = (n, r, y0) => { const gg = new THREE.Group(); for (let i = 0; i < n; i++) { const a = i * 2.4, rr = Math.sqrt(i / n) * r; const st = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.3, 6), m("#8ac860")); st.position.set(Math.cos(a) * rr, y0 + 0.1 + (1 - rr / r) * 0.3, Math.sin(a) * rr); gg.add(st);
      const kr = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), m(i % 2 ? "#3a8a3a" : "#4aa04a", 0.9)); kr.position.set(st.position.x, st.position.y + 0.22, st.position.z); gg.add(kr); } return gg; };
  const b1 = brok(22, 0.75, 2.55); b1.position.set(1.2, 0, -5.6); g.add(b1);
  MENSA.berg = brok(46, 0.55, 0); g.add(MENSA.berg); MENSA.berg.visible = false;            // Brokkoli-Berg auf meinem Tablett
  MENSA.tablett = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.1), m("#e85a4a", 0.5)); g.add(MENSA.tablett); MENSA.tablett.visible = false;
  for (let i = 0; i < 2; i++) { const t = O.tisch({ breite: 9, tiefe: 2.4, farbe: "#f2ead8" }); t.position.set(-3 + i * 0.01, 0, 0.6 + i * 4.6); g.add(t);
    for (let j = 0; j < 4; j++) for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.5, 1.25, 16), m(["#e85a8a", "#4a8ae8", "#3ab88a", "#e8a83a"][j], 0.5)); h.position.set(-6.4 + j * 2.2, 0.62, 0.6 + i * 4.6 + s * 2.1); g.add(h); } }
  const schild = Al.leinwand(5, 1.2, { px: 1024 }); schild.position.set(-2, 5.4, -7.65); g.add(schild); Al.schreibe(schild, [B.T({ de: "MENSA", en: "CAFETERIA" })], { bg: "#e85a4a", fg: "#ffffff", font: "900 200px 'Inter Display', sans-serif" });
  for (const fx of [-7, 0, 7]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.4), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.1, 1.25, 1.4) })); f.position.set(fx, 4.4, 7.84); f.rotation.y = Math.PI; g.add(f); } }

// Nachrichtenstudio (bei 2600, 600): Rückwand mit Stadt-Skyline und Logo, Moderationstisch, Studiolichter
const STUDIO = kasten(2600, 600, 20, 14, 8, "#1a2440", "#20263a", 16, "#e8f0ff");
{ const g = STUDIO.g;
  STUDIO.wand = Al.leinwand(16, 6.4, { px: 1600, leuchtet: true, hell: 1.15 }); STUDIO.wand.position.set(0, 4.2, -6.8); g.add(STUDIO.wand);
  STUDIO.wand.userData.zeichne((x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#1a3a7a"); gr.addColorStop(1, "#3a7ad8"); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    let s = 9; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 26; i++) { const bw = 40 + r() * 70, bh = 120 + r() * 300, bx0 = i * (w / 26); x.fillStyle = i % 2 ? "#14306a" : "#1c3c80"; x.fillRect(bx0, h - bh, bw, bh);
      x.fillStyle = "rgba(255,220,140,0.75)"; for (let yy = h - bh + 14; yy < h - 10; yy += 26) for (let xx = bx0 + 8; xx < bx0 + bw - 8; xx += 18) if (r() < 0.45) x.fillRect(xx, yy, 8, 12); }
    x.fillStyle = "#e83a4a"; x.fillRect(w * 0.06, h * 0.1, w * 0.42, h * 0.2); x.fillStyle = "#ffffff"; x.font = "900 92px 'Inter Display', sans-serif"; x.textAlign = "left"; x.textBaseline = "middle";
    x.fillText(B.T({ de: "STADTNACHRICHTEN", en: "CITY NEWS" }), w * 0.08, h * 0.2); x.font = "700 56px 'Inter Display', sans-serif"; x.fillStyle = "#ffe53a"; x.fillText(B.T({ de: "18:00 · LIVE", en: "6 PM · LIVE" }), w * 0.08, h * 0.37); }, "studio");
  const tisch = new THREE.Mesh(new THREE.BoxGeometry(7, 2.3, 2.2), new THREE.MeshStandardMaterial({ color: "#e8ecf4", roughness: 0.3, metalness: 0.2 })); tisch.position.set(0, 1.15, -1.6); g.add(tisch);
  const front = Al.leinwand(6.6, 1.1, { px: 1024, leuchtet: true, hell: 1.2 }); front.position.set(0, 1.25, -0.48); g.add(front);
  Al.schreibe(front, [B.T({ de: "STADTNACHRICHTEN", en: "CITY NEWS" })], { bg: "#e83a4a", fg: "#ffffff", font: "900 130px 'Inter Display', sans-serif" });
  const blatt = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 1.2), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.8 })); blatt.position.set(0.9, 2.32, -1.4); blatt.rotation.y = 0.15; g.add(blatt);
  const stuhl = O.stuhl({ farbe: "#2a2a34" }); stuhl.position.set(0, 0, -3.3); g.add(stuhl);
  for (const sx of [-1, 1]) { const st = new THREE.Group(); const fuss = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 5.5, 8), new THREE.MeshStandardMaterial({ color: "#2a2a30", metalness: 0.6 })); fuss.position.y = 2.75; st.add(fuss);
    const kopf = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.0), new THREE.MeshStandardMaterial({ color: "#1a1a1e", roughness: 0.4 })); kopf.position.y = 5.7; st.add(kopf);
    const lin = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.6), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.9, 2.6) })); lin.position.set(0, 5.7, 0.51); st.add(lin); st.position.set(sx * 7.5, 0, 4.5); st.rotation.y = sx * 0.6 + Math.PI; st.rotation.y = Math.atan2(-sx * 7.5, -6); g.add(st); } }
// Studio-Kamera für den Fernseher (Omas Stube zeigt das Handy-Kamerabild)
const STUDIO_TV = () => { Al.handyBlick(STUDIO.pos(0.2, 4.4, 6.2), STUDIO.pos(0, 3.9, -2.4), 50); Al.fernseherAn(); };
const papaStudio = (t, ges, o = {}) => { STUDIO.an(); papaTV.visible = true; papaTV.position.copy(STUDIO.pos(0, -0.05, -3.0)); papaTV.rotation.set(0, 0, 0); Fg.pose(papaTV, { sitz: 1, ges, armL: 0.95, armR: 0.95, armLz: -0.12, armRz: -0.12, kopfNeig: o.kopfNeig ?? 0, kopfDreh: o.kopfDreh ?? 0 }); zahl(papaTV, papaZahl(t)); };

// Kirchturm vor dem Kinderzimmer-Fenster (für „Zwölf Mal“)
const turm = new THREE.Group(); Wt.scene.add(turm);
{ const sm = new THREE.MeshStandardMaterial({ color: "#d8c8b0", roughness: 0.9 }); const k = new THREE.Mesh(new THREE.BoxGeometry(9, 46, 9), sm); k.position.y = 23; turm.add(k);
  const dach = new THREE.Mesh(new THREE.ConeGeometry(7.2, 16, 4), new THREE.MeshStandardMaterial({ color: "#3a6a5a", roughness: 0.6 })); dach.position.y = 54; dach.rotation.y = Math.PI / 4; turm.add(dach);
  turm.uhr = Al.leinwand(5.6, 5.6, { px: 512, leuchtet: true, hell: 1.6 }); turm.uhr.position.set(0, 38, 4.56); turm.add(turm.uhr);
  turm.uhr.userData.zeichne((x, w) => { x.fillStyle = "#1a1a22"; x.fillRect(0, 0, w, w); x.fillStyle = "#fff4d8"; x.beginPath(); x.arc(w / 2, w / 2, w * 0.46, 0, 7); x.fill(); x.lineWidth = 16; x.strokeStyle = "#c8a050"; x.stroke();
    x.fillStyle = "#1a1a22"; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; x.fillRect(w / 2 + Math.sin(a) * w * 0.38 - 6, w / 2 - Math.cos(a) * w * 0.38 - 14, 12, 28); }
    x.strokeStyle = "#1a1a22"; x.lineCap = "round"; x.lineWidth = 22; x.beginPath(); x.moveTo(w / 2, w / 2); x.lineTo(w / 2, w * 0.17); x.stroke(); x.lineWidth = 30; x.beginPath(); x.moveTo(w / 2, w / 2); x.lineTo(w / 2 - 6, w * 0.27); x.stroke(); }, "uhr12");
  for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 5), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.25, 0.7) })); f.position.set(s * 2.2, 26, 4.56); turm.add(f); }
  turm.licht = new THREE.PointLight("#ffd8a0", 0, 60, 1.2); turm.licht.position.set(0, 38, 14); turm.add(turm.licht); }
{ zm.updateMatrixWorld(true); const p = ZI(1.5, 0, -46); turm.position.set(p.x, 0, p.z); turm.rotation.y = RZ; }   // schaut zum Fenster

// Tür im Kinderzimmer (Rückwand, lokal z = +6): Flurlicht dahinter, Türblatt schwenkt nach innen
const tuer = new THREE.Group(); zm.add(tuer); tuer.position.set(3.9, 0, 5.83);
{ const licht2 = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 5.6), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.7, 1.05) })); licht2.position.set(0, 2.8, 0.0); licht2.rotation.y = Math.PI; tuer.add(licht2); tuer.flur = licht2;
  const rahmen = new THREE.MeshStandardMaterial({ color: "#f4efe4", roughness: 0.5 }); for (const [w, h, x, y] of [[0.25, 5.9, -1.42, 2.95], [0.25, 5.9, 1.42, 2.95], [3.1, 0.25, 0, 5.85]]) { const r = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.3), rahmen); r.position.set(x, y, -0.05); tuer.add(r); }
  const angel = new THREE.Group(); angel.position.set(1.3, 0, -0.1); tuer.add(angel); tuer.angel = angel;
  const blatt = new THREE.Mesh(new THREE.BoxGeometry(2.6, 5.6, 0.18), new THREE.MeshStandardMaterial({ color: "#f8f4ec", roughness: 0.55 })); blatt.position.set(-1.3, 2.8, 0); angel.add(blatt);
  const griff = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.12), new THREE.MeshStandardMaterial({ color: "#c8a050", metalness: 0.7, roughness: 0.3 })); griff.position.set(-2.3, 2.7, -0.15); angel.add(griff);
  tuer.oeffne = (u) => { angel.rotation.y = -u * 1.25; tuer.flur.visible = u > 0.01; };   // u 0 zu … 1 offen (schwenkt ins Zimmer)
  tuer.licht = new THREE.SpotLight("#ffd8a0", 0, 18, 0.7, 0.6, 1.2); tuer.licht.position.set(0, 4.5, 0.6); tuer.add(tuer.licht); tuer.add(tuer.licht.target); tuer.licht.target.position.set(-3.5, 0, -5); }

// Bild für Oma (Papa vor dem Fernseher), wird Strich für Strich gemalt
const bildPapa = Al.leinwand(2.0, 1.45, { px: 512 }); Wt.scene.add(bildPapa);
const bildMalen = (k) => { const n = Math.round(Math.max(0, Math.min(1, k)) * 6); bildPapa.userData.zeichne((x, w, h) => { x.fillStyle = "#fffdf4"; x.fillRect(0, 0, w, h); x.lineWidth = 9; x.lineCap = "round"; x.lineJoin = "round";
    if (n > 0) { x.fillStyle = "#3a3a46"; x.fillRect(w * 0.58, h * 0.22, w * 0.32, h * 0.34); x.fillStyle = "#8ac8f0"; x.fillRect(w * 0.6, h * 0.25, w * 0.28, h * 0.27); }   // Fernseher
    if (n > 1) { x.fillStyle = "#4ac8b0"; x.fillRect(w * 0.08, h * 0.55, w * 0.42, h * 0.22); }                                                                          // Sofa
    if (n > 2) { x.fillStyle = "#3a6ac8"; x.fillRect(w * 0.22, h * 0.36, w * 0.14, h * 0.24); }                                                                          // Papa
    if (n > 3) { x.fillStyle = "#d89a6a"; x.beginPath(); x.arc(w * 0.29, h * 0.29, h * 0.08, 0, 7); x.fill(); x.fillStyle = "#3a2414"; x.fillRect(w * 0.24, h * 0.2, w * 0.1, h * 0.04); }
    if (n > 4) { x.strokeStyle = "#1a1a1a"; x.beginPath(); x.moveTo(w * 0.26, h * 0.32); x.lineTo(w * 0.32, h * 0.32); x.stroke(); }                                        // Mund zu
    if (n > 5) { x.fillStyle = "#e84a4a"; x.font = "900 54px 'Inter Display', sans-serif"; x.textAlign = "center"; x.fillText("0", w * 0.29, h * 0.12); } }, "bild" + n); };

// Wörtermarkt auf dem Schulhof: Schule im Buntdorf (wie Vorrat 03), Tisch mit Preisschildern
const schule = O.schule({ name: B.T({ de: "GRUNDSCHULE BUNTDORF", en: "BUNTDORF ELEMENTARY" }), banner: B.T({ de: "LEISE IST COOL", en: "QUIET IS COOL" }) }); schule.position.copy(DP(-70, 0.05, -34)); Wt.scene.add(schule);
const hof = new THREE.Mesh(new THREE.PlaneGeometry(44, 21).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#d8d2c6", roughness: 0.9 })); hof.position.copy(DP(-70, 0.07, -16.5)); Wt.scene.add(hof);
const SG = (x, y, z) => DP(-70 + x, y, -34 + z);
const markt = O.tisch({ breite: 5, tiefe: 2.2, farbe: "#c89a62" }); markt.position.copy(SG(2, 0.07, 16)); Wt.scene.add(markt);
const preis = Al.leinwand(4.6, 1.5, { px: 1024 }); preis.position.copy(SG(2, 4.2, 14.85)); Wt.scene.add(preis);
Al.schreibe(preis, [B.T({ de: "WÖRTERMARKT", en: "WORD MARKET" }), B.T({ de: "KAUGUMMI 5 · STICKER 10", en: "GUM 5 · STICKER 10" })], { bg: "#f2c21a", fg: "#1a1a1a", font: "900 120px 'Inter Display', sans-serif" });
const pfosten = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.9, 8), new THREE.MeshStandardMaterial({ color: "#6a4a2a" })); pfosten.position.copy(SG(2, 2.4 + 0.07 + 0.0, 14.85)); pfosten.position.y = 0.07 + 2.32 + 0.6; Wt.scene.add(pfosten); pfosten.visible = true;
const kaugummi = []; for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.22, 0.35), new THREE.MeshStandardMaterial({ color: ["#f25a9a", "#3ab8e8", "#9ad84a"][i % 3], roughness: 0.4 })); b.position.copy(SG(0.4 + (i % 3) * 0.7, 2.42, 16.3 + Math.floor(i / 3) * 0.55)); Wt.scene.add(b); kaugummi.push(b); }
const stickerT = new THREE.CanvasTexture((() => { const c = document.createElement("canvas"); c.width = 256; c.height = 320; const x = c.getContext("2d"); x.fillStyle = "#ffe53a"; x.fillRect(0, 0, 256, 320); x.fillStyle = "#2a5ad8"; x.fillRect(12, 12, 232, 296);
  x.fillStyle = "#ffd23a"; x.beginPath(); x.arc(128, 150, 70, 0, 7); x.fill(); x.fillStyle = "#e83a3a"; x.beginPath(); x.arc(92, 168, 14, 0, 7); x.arc(164, 168, 14, 0, 7); x.fill(); x.fillStyle = "#1a1a1a"; x.beginPath(); x.arc(104, 136, 9, 0, 7); x.arc(152, 136, 9, 0, 7); x.fill();
  x.fillStyle = "#ffcb05"; x.font = "900 44px 'Inter Display', sans-serif"; x.textAlign = "center"; x.fillText("Pokémon", 128, 276); return c; })()); stickerT.colorSpace = THREE.SRGBColorSpace;
const sticker = []; for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.63).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: stickerT, roughness: 0.5 })); s.position.copy(SG(3.0 + i * 0.6, 2.33, 16.4)); s.rotation.y = (i - 1) * 0.12; Wt.scene.add(s); sticker.push(s); }
const gummiHand = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.22, 0.35), new THREE.MeshStandardMaterial({ color: "#f25a9a", roughness: 0.4 })); Wt.scene.add(gummiHand);

// Ball, Bus, Handy-Seite, Tafel, Babybett, Wecker
const ball = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 16), new THREE.MeshPhysicalMaterial({ color: "#e8302a", roughness: 0.35, clearcoat: 0.6 })); Wt.scene.add(ball);
const bus = O.bus({ farbe: "#2a8ae8", text: B.T({ de: "LINIE 4", en: "LINE 4" }) }); Wt.scene.add(bus);
const bus2 = O.bus({ farbe: "#f2c21a", text: B.T({ de: "SCHULE", en: "SCHOOL" }) }); Wt.scene.add(bus2);
const babybett = O.babybett(); Wt.scene.add(babybett);
const minecraft = (x, w, h) => { x.fillStyle = "#7ec8ff"; x.fillRect(0, 0, w, h); const bw = B.QUER ? w * 0.32 : w, x0 = (w - bw) / 2, b = bw / 6;   // Pixel-Landschaft mit Drache, Logo oben (im sichtbaren Mittelstreifen)
  for (let i = -3; i < 9; i++) { const hh = 4 + ((i * 5 + 30) % 3); for (let j = 0; j < hh; j++) { const y = h - (j + 1) * b; x.fillStyle = j === hh - 1 ? "#5ab84a" : j > hh - 3 ? "#8a5a3a" : "#7a7a82"; x.fillRect(x0 + i * b, y, b - 2, b - 2); } }
  x.fillStyle = "#1a1420"; const p = bw / 17, dx = x0 + bw / 2 - 8 * p, dy = h * 0.36; const D = ["....XX....", "...XXXX...", "XXXXXXXXXX", ".XXXXXXXX.", "..XX..XX..", "..X....X.."];
  D.forEach((r2, j) => [...r2].forEach((c, i) => { if (c === "X") x.fillRect(dx + i * p * 1.6, dy + j * p, p * 1.6, p); }));
  x.fillStyle = "#d84af8"; x.fillRect(dx + 3 * p * 1.6, dy + 1.1 * p, p * 0.9, p * 0.5); x.fillRect(dx + 5.6 * p * 1.6, dy + 1.1 * p, p * 0.9, p * 0.5);
  x.fillStyle = "#3a3a3a"; x.fillRect(x0 + bw * 0.04, h * 0.08, bw * 0.92, h * 0.1); x.fillStyle = "#f4f4f4"; x.font = `900 ${Math.round(bw * 0.13)}px 'DejaVu Sans Mono', monospace`; x.textAlign = "center"; x.textBaseline = "middle";
  x.fillText("MINECRAFT", w / 2, h * 0.13); x.fillStyle = "#ffe53a"; x.font = `900 ${Math.round(bw * 0.1)}px 'Inter Display', sans-serif`; x.fillText(B.T({ de: "NEUES UPDATE!", en: "NEW UPDATE!" }), w / 2, h * 0.25); };
const tafel = (zeilen, anteil = 1) => Al.schreibe(KL.tafel, zeilen, { kreide: true, font: "700 170px 'Inter Display', sans-serif", anteil });
const eiffel = () => KL.tafel.userData.zeichne((x, w, h) => { x.fillStyle = "#1f4a3a"; x.fillRect(0, 0, w, h); x.strokeStyle = "#f4f2e8"; x.lineWidth = 10; x.lineJoin = "round"; x.lineCap = "round";
  const cx = w * 0.32, b = h * 0.86; x.beginPath(); x.moveTo(cx - 170, b); x.quadraticCurveTo(cx - 60, h * 0.45, cx - 12, h * 0.1); x.lineTo(cx + 12, h * 0.1); x.quadraticCurveTo(cx + 60, h * 0.45, cx + 170, b); x.stroke();
  x.beginPath(); x.moveTo(cx - 120, h * 0.66); x.lineTo(cx + 120, h * 0.66); x.moveTo(cx - 62, h * 0.42); x.lineTo(cx + 62, h * 0.42); x.stroke(); x.beginPath(); x.arc(cx, b, 70, Math.PI, 0); x.stroke();
  x.fillStyle = "#f4f2e8"; x.font = "700 160px 'Inter Display', sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("PARIS ?", w * 0.7, h * 0.5); }, "eiffel");

// ---------- Orte ----------
// Kinderzimmer
const zimmerTag = () => { morgen(); Rq.ZIMMER.licht.intensity = 8; };
const zimmerNacht = (lk = 0) => { Rq.ZIMMER.schirm.material = Rq.ZIMMER.schirmAus; Rq.ZIMMER.licht.intensity = 4 + lk * 4; Rq.ZIMMER.licht.color.set("#ffb060"); Rq.ZIMMER.lichterkette.visible = lk > 0; Wt.hemi.intensity = 0.32; Rq.ZIMMER.mond.intensity = 10; };
const imBett = (f, ges, o = {}) => { f.visible = true; f.position.copy(ZI(-2.2, 2.35, 0.5)); f.rotation.set(0, RZ + Math.PI, 0); Fg.pose(f, { liegen: 1, ges, ...o }); return f; };
const bettKopf = () => ZI(-2.2, 2.9, 4.3);
// Küche
const kueche = () => { Al.raumlicht(KU, 9); };
// Stube
const stube = (s = 9) => { Al.raumlicht(ST, s); };
const omaSofa = (ges, o = {}) => stell(oma, loc(ST, 1.4, -0.05, -3.4), 0, { sitz: 1, ges, ...o });
// Klasse
const sitzt = (f, p, ges, o = {}) => stell(f, V(KL.plaetze[p].x, -0.05, KL.plaetze[p].z - 0.2), Math.PI, { sitz: 1, ges, ...o });
const klasse = (gesKinder = "froh", o = {}) => { Al.raumlicht(KL); const G = typeof gesKinder === "function" ? gesKinder : () => gesKinder;
  [[ben, 0], [k2, 2], [k3, 4], [k4, 5], [k5, 6]].forEach(([f, p], i) => sitzt(f, p, G(i), o.kinder ? o.kinder(i) : {})); };
const krauseVorn = (t, ges, o = {}) => { stell(krause, loc(KL, o.x ?? -2.6, 0, o.z ?? -5.2), o.ry ?? 0.25, { ges, armR: o.armR ?? 0.3, armRz: o.armRz ?? 0, armL: o.armL ?? 0.2 }); zahl(krause, krauseZahl(t)); };
// Bushaltestelle im Buntdorf (Gehweg x −10…−6)
const BH = (x, y, z) => DP(x, y, z);
const anHaltestelle = (t, gesI, gesB, o = {}) => { stell(ich, BH(-7.6, 0.3, 36.2), o.ryI ?? 0.15, { ges: gesI, ...(o.poseI ?? {}) }); stell(ben, BH(-7.6, 0.3, 39.8), o.ryB ?? Math.PI - 0.15, { ges: gesB, ...(o.poseB ?? {}) });
  zahl(ich, ichZahl(t)); zahl(ben, 100); };

// ===================== HOOK =====================
// 0 In meiner Stadt darf jeder nur hundert Wörter am Tag sagen (Dorfplatz, Zahlen über allen Köpfen)
const HOOKZ = (i) => String([100, 87, 64, 92, 41, 100, 73, 18, 55, 100, 96, 33][i % 12]);
sh(E[0] + 0.1, (t, q) => { tag(); Z_.menge = { dx: C.x, dz: C.z, huepf: (i) => 0.06 * Math.max(0, Math.sin(t * 4 + i)) }; Z_.mengeZahl = { text: HOOKZ, farbe: "#4ef07a", groesse: 0.8 };
  Z_.zaehler = { wert: B.T({ de: "100 Wörter am Tag", en: "100 words a day" }), farbe: "gelb", einheit: "" };
  kamera.fahrt(q, V(C.x + 19, 9.5, C.z + 16), V(C.x + 15.5, 8.5, C.z + 13), V(C.x, 3, C.z), V(C.x, 3.4, C.z - 2), 56); TAG_L(); });
// 1 Mit jedem Wort wird die Zahl kleiner (Nachbarin redet mit dem Bäcker)
sh(E[1] + 0.1, (t, q) => { tag(); const n = 64 - gesagt(t, 1); stell(nachbarin, DP(26, 0.28, -6), -0.55, { ges: Fg.mund(t), armR: 0.9 + 0.3 * Math.sin(t * 5), armRz: -0.2 }); zahl(nachbarin, n);
  stell(baecker, DP(24.4, 0.28, -3.4), 2.59, { ges: "froh" }); zahl(baecker, 81);
  kamera.fahrt(q, DP(33.0, 4.6, 0.6), DP(32.0, 4.4, -0.4), DP(25.4, 3.8, -4.9), DP(25.4, 4.0, -4.9), 48); TAG_L(); wisch(t, 1); });
// 2 Bei null bist du stumm (Mann mit 0 will etwas sagen, es kommt nichts)
sh(E[2] + 0.3, (t, q) => { tag(); const mund = Math.sin(t * 7) > 0; stell(mann0, DP(27, 0.28, 8), -0.6, { ges: mund ? "staunen" : "ernst", armL: 0.7 + 0.5 * Math.sin(t * 3), armR: 0.7 + 0.5 * Math.sin(t * 3 + 1), armLz: 0.3, armRz: 0.3 }); zahl(mann0, 0);
  nah(q, mann0, 6.2, 0.7); TAG_L(); wisch(t, 2); });
// 3 Ich: um acht Uhr nur noch drei Wörter (Bushaltestelle, rote 3)
sh(E[3] + 0.1, (t, q) => { morgen(); stell(ich, BH(-7.6, 0.3, 36.2), 1.2, { ges: "schwitzen" }); zahl(ich, 3, 0.95); uhrzeit("8:00", "8:00 AM");
  kamera.fahrt(q, BH(-2.2, 4.6, 31.6), BH(-2.8, 4.5, 32.2), BH(-7.6, 4.4, 36.2), BH(-7.6, 4.6, 36.2), 50); TAG_L(); wisch(t, 3); });
// 4 Drei Wörter für den ganzen Tag (Kamera kreist langsam um mich)
sh(E[4] + 0.3, (t, q) => { morgen(); stell(ich, BH(-7.6, 0.3, 36.2), 1.2, { ges: t > Z[4] + 2.5 ? "ernst" : "staunen", kopfNeig: -0.25 }); zahl(ich, 3, 0.95);
  kamera.luft(q, BH(-7.6, 3.2, 36.2), 8.5, 7.0, 3.2, 3.6, 1.0, 2.0, 44); TAG_L(); wisch(t, 4); });
// 5 Aber von vorn (Dorf von oben im Morgenlicht)
sh(E[5] + 0.1, (t, q) => { morgen(); Wt.U.uAbend.value = 0.45; kamera.fahrt(q, DP(40, 40, 70), DP(30, 46, 90), DP(0, 4, 0), DP(0, 6, 10), 54); TAG_L(); wisch(t, 5); });

// ===================== 6:00 UHR =====================
// 6 Wecker 06:00, über meinem Kopf eine Hundert
sh(wz("klingelt", 6) + 0.2, (t, q) => { zimmerTag(); Rq.weckerZeichnen("06:00", Math.sin(t * 9) > -0.85); imBett(ichPyj, "schlaf"); uhrzeit("6:00", "6:00 AM");
  kamera.fahrt(q, ZI(-0.2, 2.8, 2.2), ZI(0.0, 2.75, 2.5), ZI(0.9, 2.1, 4.2), ZI(0.9, 2.15, 4.2), 40); licht(0.9, "#fff4e0", 0.6, "#ffffff"); wisch(t, 6); });
sh(E[6] + 0.1, (t, q) => { zimmerTag(); Rq.weckerZeichnen("06:00", true); const k = ease((t - wz("hundert", 6) + 0.3) / 0.4); imBett(ichPyj, k > 0.5 ? "froh" : "muede"); if (t > wz("hundert", 6) - 0.2) zahl(ichPyj, 100, 0.6 + 0.3 * k);
  const kp = bettKopf(); kamera.fahrt(q, kp.clone().add(V(3.2, 3.6, -1.0)), kp.clone().add(V(2.8, 3.3, -0.6)), kp.clone().add(V(0, 0.6, 0)), kp.clone().add(V(0, 0.9, 0)), 46); licht(0.9, "#fff4e0", 0.6, "#ffffff"); });
// 7 Küche: Papa sagt nur „Kaffee“
const papaTisch = (t, ges, o = {}) => { stell(papa, loc(KU, 0.9, -0.05, -1.4), 0, { sitz: 1, ges, armR: o.armR ?? 1.3, armRz: -0.2, armL: 1.1 }); zahl(papa, papaZahl(t)); };
const tasse = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.42, 16), new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.3, clearcoat: 0.6 })); Wt.scene.add(tasse);
sh(E[7] + 0.1, (t, q) => { kueche(); papaTisch(t, t > wz("kaffee", 7) - 0.15 && t < wz("kaffee", 7) + 0.5 ? "reden" : "muede"); tasse.visible = true; tasse.position.copy(loc(KU, 1.5, 2.52, -0.3));
  kamera.fahrt(q, loc(KU, -3.4, 4.4, 3.4), loc(KU, -2.9, 4.2, 2.8), loc(KU, 0.8, 3.0, -1.0), loc(KU, 0.8, 3.1, -1.0), 54); RAUM_L(); wisch(t, 7); });
// 8 Neunundneunzig (Nah auf Papa mit Zahl)
sh(E[8] + 0.1, (t, q) => { kueche(); papaTisch(t, "froh", { armR: 0.9 }); tasse.visible = true; tasse.position.copy(loc(KU, 1.5, 2.52, -0.3)); nah(q, papa, 6.4, -0.6, 0.6); RAUM_L(); wisch(t, 8); });
// 9 Mama: Daumen hoch = Guten Morgen
sh(E[9] + 0.1, (t, q) => { kueche(); const hoch = t > Z[9] + 1.6; stell(mama, loc(KU, -1.6, 0, -3.0), 0.35, { ges: "lachen", armR: hoch ? 1.9 : 0.3, armRz: hoch ? 0.25 : 0 }); zahl(mama, 100);
  stell(ich, loc(KU, -0.6, 0, 3.4), Math.PI - 0.2, { ges: "froh" }); zahl(ich, 100);
  kamera.fahrt(q, loc(KU, 2.6, 4.4, 4.6), loc(KU, 2.2, 4.3, 4.0), loc(KU, -1.4, 3.6, -2.6), loc(KU, -1.5, 3.7, -2.6), 50); RAUM_L(); wisch(t, 9); });
// 10 Zeigefinger zum Fenster: Jacke anziehen
sh(E[10] + 0.1, (t, q) => { kueche(); const zeig = t > Z[10] + 0.5; stell(mama, loc(KU, -1.6, 0, -3.0), zeig ? -0.5 : 0.35, { ges: zeig ? "ernst" : "froh", armL: zeig ? 1.55 : 0.2, armLz: zeig ? -0.35 : 0 }); zahl(mama, 100);
  stell(ich, loc(KU, -0.6, 0, 3.4), Math.PI - 0.2, { ges: "muede", kopfNeig: 0.15 }); zahl(ich, 100);
  kamera.fahrt(q, loc(KU, -4.2, 4.0, 3.2), loc(KU, -3.8, 4.1, 2.4), loc(KU, -0.4, 3.4, -2.4), loc(KU, 0.2, 3.6, -3.4), 54); RAUM_L(); wisch(t, 10); });
// 11 Schreiben zählt auch (Zettel am Kühlschrank: jedes Wort −1)
const zettel = Al.leinwand(1.6, 1.2, { px: 512 }); Wt.scene.add(zettel);
sh(E[11] + 0.1, (t, q) => { kueche(); zettel.visible = true; zettel.position.copy(loc(KU, 4.4, 3.6, -3.28)); zettel.rotation.set(0, 0, 0.05);
  const a = ease((t - Z[11] - 0.3) / 1.6); Al.schreibe(zettel, [B.T({ de: "MILCH", en: "MILK" }), B.T({ de: "KAUFEN", en: "BUY" })], { bg: "#fff3a0", fg: "#2a2a8a", font: "700 150px 'Inter Display', sans-serif", anteil: a });
  stell(mama, loc(KU, 1.4, 0, -2.6), 1.8, { ges: "ernst", armR: 0.9, armRz: -0.2 }); zahl(mama, t > wz("zählt", 11) ? 98 : 100);
  kamera.fahrt(q, loc(KU, -0.8, 4.4, 1.8), loc(KU, -0.2, 4.2, 1.2), loc(KU, 4.0, 3.6, -3.3), loc(KU, 4.2, 3.6, -3.3), 50); RAUM_L(); wisch(t, 11); });
// 12–13 Hunde zählen nicht: Bello bellt, alle gucken neidisch
const belloSetzen = (p, ry, t, bellen = true) => { bello.visible = true; bello.position.copy(p); bello.rotation.y = ry; bello.userData.schwanz.rotation.z = Math.sin(t * 12) * 0.5;
  if (bellen && Math.sin(t * 5.5) > 0.2) Al.kopfzahl(p.clone().add(V(0.6, 2.7, 0)), B.T({ de: "WUFF!", en: "WOOF!" }), { farbe: "#ffffff", groesse: 0.55 }); };
sh(E[12] + 0.1, (t, q) => { kueche(); belloSetzen(loc(KU, -0.2, 0, 3.0), 0.4, t); papaTisch(t, "froh", { armR: 0.8 }); stell(mama, loc(KU, -2.2, 0, -2.4), 0.6, { ges: "froh" }); zahl(mama, 98);
  kamera.fahrt(q, loc(KU, 3.4, 2.2, 4.6), loc(KU, 2.8, 2.1, 4.4), loc(KU, -0.2, 1.6, 3.0), loc(KU, -0.2, 1.9, 2.6), 50); RAUM_L(); wisch(t, 12); });
sh(E[13] + 0.1, (t, q) => { kueche(); belloSetzen(loc(KU, -0.2, 0, 3.0), 0.4, t); papaTisch(t, "traurig", { armR: 0.6 }); papa.rotation.y = 0.35; stell(mama, loc(KU, -2.2, 0, -2.4), 1.2, { ges: "traurig", kopfNeig: 0.2 }); zahl(mama, 98);
  kamera.fahrt(q, loc(KU, -1.0, 5.6, 6.0), loc(KU, -0.8, 5.2, 5.4), loc(KU, 0, 2.4, 0), loc(KU, 0, 2.4, 0), 56); RAUM_L(); wisch(t, 13); });
// 14–16 Mia: „Warum? Warum? Warum?“ – um sieben bei null, guckt beleidigt
const miaStuhl = (t, ges, o = {}) => { stell(mia, loc(KU, -2.8, 0.0, 0.5), Math.PI / 2, { sitz: 1, ges, ...o }); zahl(mia, miaZahl(t), 0.7); };
sh(E[14] + 0.1, (t, q) => { kueche(); miaStuhl(t, "froh"); stell(ich, loc(KU, 1.4, 0, 3.6), Math.PI + 0.9, { ges: "froh" }); zahl(ich, 100);
  kamera.fahrt(q, loc(KU, 0.8, 3.6, 3.6), loc(KU, 0.4, 3.5, 3.2), loc(KU, -2.6, 2.8, 0.5), loc(KU, -2.6, 2.9, 0.5), 48); RAUM_L(); wisch(t, 14); });
sh(E[15] + 0.1, (t, q) => { kueche(); miaStuhl(t, Fg.mund(t) === "reden" ? "schreien" : "staunen", { armL: 1.2 + 0.6 * Math.sin(t * 6), armR: 1.2 + 0.6 * Math.sin(t * 6 + 2) }); if (t > Z[15] + 1.6) Rq.weckerZeichnen("07:00", true);
  uhrzeit("7:00", "7:00 AM"); kamera.fahrt(q, loc(KU, 0.4, 3.6, 1.6), loc(KU, 0.0, 3.5, 1.2), Fg.kopfPos(mia).add(V(0, 0.5, 0)), Fg.kopfPos(mia).add(V(0, 0.5, 0)), 46); RAUM_L(); wisch(t, 15); });
sh(E[16] + 0.1, (t, q) => { kueche(); miaStuhl(t, "traurig", { kopfNeig: -0.3, armL: 0.6, armR: 0.6, armLz: 0.7, armRz: 0.7 }); kamera.fahrt(q, loc(KU, 0.0, 3.4, -0.6), loc(KU, -0.4, 3.3, -0.3), Fg.kopfPos(mia).add(V(0, 0.4, 0)), Fg.kopfPos(mia).add(V(0, 0.4, 0)), 44); RAUM_L(); wisch(t, 16); });
// 17 Ich: „Morgen, Papa“ → 98
sh(E[17] + 0.1, (t, q) => { kueche(); papaTisch(t, "froh", { armR: 0.9 }); stell(ich, loc(KU, -0.6, 0, 3.4), Math.PI - 0.15, { ges: t < T_MORGEN() + 0.6 ? Fg.mund(t) : "lachen", armR: t > T_MORGEN() ? 1.4 : 0.2, armRz: 0.2 }); zahl(ich, ichZahl(t));
  kamera.fahrt(q, loc(KU, -3.4, 4.0, 0.4), loc(KU, -3.0, 3.9, 0.8), loc(KU, -0.6, 3.4, 3.4), loc(KU, -0.6, 3.5, 3.4), 50); RAUM_L(); wisch(t, 17); });

// ===================== 7:30 UHR =====================
const handyBen = (zu) => { ben.updateMatrixWorld(true); Al.handyHalten(ben, Fg.handPos, Fg.kopfPos, { rechts: true, zu }); Al.handySeite(minecraft, "mc"); };
// 18 Bushaltestelle, Ben wartet
sh(E[18] + 0.1, (t, q) => { morgen(); const w = Math.min(1, (t - Z[18]) / 3.2); stell(ich, BH(-7.6, 0.3, 26 + w * 10.2), 0.0, w < 1 ? { lauf: 0.7, phase: t * 6, ges: "froh" } : { ges: "froh" }); zahl(ich, 98);
  stell(ben, BH(-7.6, 0.3, 39.8), Math.PI - 0.15, { ges: "froh" }); zahl(ben, 100); uhrzeit("7:30", "7:30 AM");
  kamera.fahrt(q, BH(5, 6.5, 22), BH(4, 6, 25), BH(-7.6, 3, 32), BH(-7.6, 3, 36), 52); TAG_L(); wisch(t, 18); });
// 19 Ben: vor der Schule kein Wort (Finger auf den Lippen)
sh(E[19] + 0.1, (t, q) => { morgen(); anHaltestelle(t, "froh", "ernst", { poseB: { armR: 2.5, armRz: 0.5, kopfNeig: 0.05 } }); nah(q, ben, 5.8, -0.8); TAG_L(); wisch(t, 19); });
// 20 Er hält mir sein Handy hin
sh(E[20] + 0.1, (t, q) => { morgen(); anHaltestelle(t, "staunen", "lachen", { poseB: { armR: 1.45 } }); const zu = BH(-7.6, 3.5, 36.2); handyBen(zu);
  kamera.fahrt(q, BH(-3.2, 4.2, 35.2), BH(-3.6, 4.1, 35.8), BH(-7.6, 3.2, 38.4), BH(-7.6, 3.2, 38.6), 48); TAG_L(); wisch(t, 20); });
// 21 Das neue Minecraft-Update (Flug zum Bildschirm)
sh(E[21] + 0.1, (t, q) => { morgen(); anHaltestelle(t, "staunen", "lachen", { poseB: { armR: 1.45 } }); const von = BH(-7.4, 3.8, 35.6); handyBen(von); Al.handy.visible = true;
  kamera.insHandy(Math.min(1, q * 1.15), von, 50); TAG_L(); });
// 22–23 Ich rede und rede (Zahl rast nach unten)
sh(E[22] + 0.1, (t, q) => { morgen(); anHaltestelle(t, Fg.mund(t) === "reden" ? "lachen" : "reden", "froh", { poseI: { armL: 1.0 + 0.6 * Math.sin(t * 7), armR: 1.0 + 0.6 * Math.sin(t * 7 + 1.5), armLz: 0.4, armRz: 0.4 } }); nah(q, ich, 5.6, 0.7); TAG_L(); wisch(t, 22); });
sh(E[23] + 0.1, (t, q) => { morgen(); anHaltestelle(t, Fg.mund(t), "staunen", { poseI: { armL: 1.6 + 0.9 * Math.sin(t * 8), armR: 1.6 + 0.9 * Math.sin(t * 8 + 2), armLz: 0.5, armRz: 0.5, huepf: 0.15 * Math.abs(Math.sin(t * 8)) } });
  kamera.luft(q, BH(-7.6, 3.0, 38), 9.5, 8.5, 4.2, 3.8, 0.9, 2.1, 50); TAG_L(); wisch(t, 23); });
// 24 Ben wedelt immer wilder
sh(E[24] + 0.1, (t, q) => { morgen(); anHaltestelle(t, Fg.mund(t), "schreien", { poseB: { armL: 2.4 + 0.5 * Math.sin(t * 11), armR: 2.4 + 0.5 * Math.sin(t * 11 + 3), armLz: 0.6 * Math.sin(t * 11), armRz: 0.6 * Math.sin(t * 11 + 3), huepf: 0.2 * Math.abs(Math.sin(t * 11)) } });
  kamera.fahrt(q, BH(-1.6, 4.0, 41.5), BH(-2.0, 3.9, 41.0), BH(-7.6, 3.4, 38.6), BH(-7.6, 3.4, 38.4), 50); TAG_L(); wisch(t, 24); });
// 25 Dann zeigt er auf meinen Kopf
sh(E[25] + 0.1, (t, q) => { morgen(); anHaltestelle(t, "froh", "staunen", { poseB: { armR: 2.15, armRz: 0.1 } }); kamera.fahrt(q, BH(-3.0, 4.6, 43.2), BH(-3.4, 4.5, 42.6), BH(-7.6, 4.2, 37.4), BH(-7.6, 4.4, 37.0), 46); TAG_L(); wisch(t, 25); });
// 26 Drei (von unten auf meinen Kopf)
sh(E[26] + 0.2, (t, q) => { morgen(); anHaltestelle(t, t > Z[26] + 0.6 ? "staunen" : "froh", "staunen", { ryI: 0.6 }); kamera.fahrt(q, BH(-3.4, 2.4, 33.0), BH(-3.9, 2.3, 33.6), BH(-7.6, 4.6, 36.3), BH(-7.6, 5.0, 36.3), 48); TAG_L(); wisch(t, 26); });
// 27 Sieben Uhr vierzig, drei Wörter für den ganzen Tag
sh(E[27] + 0.1, (t, q) => { morgen(); anHaltestelle(t, "schwitzen", "traurig"); uhrzeit("7:40", "7:40 AM"); kamera.fahrt(q, BH(-2.6, 4.4, 33.6), BH(-3.0, 4.3, 34.2), BH(-7.6, 4.2, 36.6), BH(-7.6, 4.3, 36.6), 48); TAG_L(); wisch(t, 27); });
// 28 Ben klopft mir auf die Schulter, der Schulbus kommt
sh(E[28] + 0.4, (t, q) => { morgen(); anHaltestelle(t, "traurig", "traurig", { ryB: Math.PI + 0.25, poseB: { armR: 1.35, armRz: -0.15 } }); bus2.visible = true; const kb = easeIO((t - Z[28]) / (E[28] - Z[28] + 0.2));
  bus2.position.copy(BH(-3.2, 0.05, 90 - kb * 46)); bus2.rotation.y = Math.PI;
  kamera.fahrt(q, BH(1.8, 3.4, 30), BH(1.2, 3.4, 30.8), BH(-7.6, 3.0, 38), BH(-6.6, 3.2, 40), 50); TAG_L(); wisch(t, 28); });

// ===================== 8:00 UHR =====================
// 29 Erste Stunde bei Herrn Krause
sh(E[29] + 0.1, (t, q) => { klasse("froh"); sitzt(ich, 3, "muede"); zahl(ich, 3); krauseVorn(t, "froh"); tafel([B.T({ de: "GUTEN MORGEN!", en: "GOOD MORNING!" })]); uhrzeit("8:00", "8:00 AM");
  kamera.fahrt(q, loc(KL, 4.4, 5.6, 5.4), loc(KL, 4.0, 5.2, 4.6), loc(KL, -0.8, 3.0, -4.0), loc(KL, -0.8, 3.0, -4.2), 62); RAUM_L(); wisch(t, 29); });
// 30 Lehrer bekommen zweihundert Wörter
sh(E[30] + 0.1, (t, q) => { klasse("froh"); sitzt(ich, 3, "froh"); krauseVorn(t, "lachen", { armR: 1.0 }); tafel([B.T({ de: "LEHRER = 200", en: "TEACHERS = 200" })]); nah(q, krause, 6.6, 0.8, 0.4); RAUM_L(); wisch(t, 30); });
// 31 Herr Krause ist stolz (Brust raus, Hände in die Seiten)
sh(E[31] + 0.1, (t, q) => { klasse("froh"); krauseVorn(t, "lachen", { armR: 0.5, armRz: 0.9, armL: 0.5 }); krause.userData.armL.rotation.z = -0.95; Fg.pose; tafel([B.T({ de: "LEHRER = 200", en: "TEACHERS = 200" })]);
  kamera.fahrt(q, loc(KL, -1.0, 2.2, -0.6), loc(KL, -1.2, 2.0, -1.0), loc(KL, -2.6, 4.6, -5.2), loc(KL, -2.6, 4.8, -5.2), 50); RAUM_L(); wisch(t, 31); });
// 32 Woher kommt die Regel? (an die Tafel geschrieben)
sh(E[32] + 0.1, (t, q) => { klasse("staunen"); sitzt(ich, 3, "staunen"); zahl(ich, 3); krauseVorn(t, "froh", { x: 1.6, z: -5.6, ry: -0.3, armR: 1.4 }); tafel([B.T({ de: "WOHER KOMMT", en: "WHERE DOES" }), B.T({ de: "DIE REGEL?", en: "THE RULE COME FROM?" })], ease((t - Z[32]) / 2.2));
  kamera.fahrt(q, loc(KL, 2.6, 4.2, 4.2), loc(KL, 2.0, 4.1, 3.4), loc(KL, 0, 3.8, -6), loc(KL, 0, 3.9, -6), 56); RAUM_L(); wisch(t, 32); });
// 33–34 Rückblick: vor fünfzig Jahren die lauteste Stadt der Welt (Blockstadt am Tag, Menge, Autos)
const RUF = ["BLA!", "HUP!", "HEY!", "LAUT!", "BLA BLA!", "HALLO!", "NEIN!", "HUUUP!"];
const rueckblick = () => { tag(); Wt.grade.uniforms.uWarm.value = 1; Z_.vignette = 0.6; Z_.zaehler = { wert: B.T({ de: "vor 50 Jahren", en: "50 years ago" }), farbe: "gelb", einheit: "" }; };
sh(E[33] + 0.1, (t, q) => { rueckblick(); Z_.menge = { armeHoch: (i) => (i % 3 === 0 ? 1 : 0), huepf: (i) => 0.2 * Math.max(0, Math.sin(t * 7 + i)) };
  Z_.mengeZahl = { text: (i) => (Math.sin(t * 4 + i * 1.7) > 0.3 ? RUF[i % RUF.length] : ""), farbe: "#ffffff", groesse: 0.7 };
  kamera.fahrt(q, V(26, 9, 18), V(22, 8, 15), V(0, 3, 0), V(0, 3.5, 0), 58); TAG_L(); wisch(t, 33); });
sh(E[34] + 0.1, (t, q) => { rueckblick(); Z_.menge = { armeHoch: (i) => (i % 2 ? 1 : 0), huepf: (i) => 0.3 * Math.max(0, Math.sin(t * 9 + i)) };
  Z_.mengeZahl = { text: (i) => (Math.sin(t * 5 + i * 2.3) > 0 ? RUF[(i * 3) % RUF.length] : ""), farbe: "#ffffff", groesse: 0.75 };
  kamera.fahrt(q, V(30, 4.5, 30), V(25, 4.2, 26), V(0, 3.5, 0), V(-2, 3.5, -2), 56); TAG_L(); wisch(t, 34); });
// 35 Der Bürgermeister: ab morgen nur noch hundert Wörter (auf dem Denkmal mit Megafon)
sh(E[35] + 0.1, (t, q) => { rueckblick(); stell(buergermeister, V(0, 2.8, 0), 0.6, { ges: Fg.mund(t) === "reden" ? "schreien" : "ernst", armR: 1.4, armL: 0.6 });
  const h = Fg.handPos(buergermeister, true); Rq.megafon.visible = true; Rq.megafon.position.copy(h).add(V(Math.sin(0.6) * 0.5, 0.3, Math.cos(0.6) * 0.5)); Rq.megafon.rotation.set(0, 0.6, 0);
  Z_.menge = { armeHoch: () => 0 }; if (t > wz("hundert", 35)) Z_.mengeZahl = { text: () => "100", farbe: "#4ef07a", groesse: 0.8 };
  kamera.fahrt(q, V(14, 6.5, 18), V(12, 6.8, 15.5), V(0, 6.5, 0), V(0, 7, 0), 50); TAG_L(); wisch(t, 35); });
// 36 Seitdem hört man die Vögel (ruhiger Baum im Buntdorf)
const voegel = [0, 1, 2, 3].map(i => { const v = O.vogel({ farbe: ["#4ab8ff", "#ffd23a", "#f25a5a", "#9ad84a"][i], groesse: 0.55 }); Wt.scene.add(v); return v; });
sh(E[36] + 0.1, (t, q) => { tag(); const bp = DP(20, 0.28, 18); voegel.forEach((v, i) => { v.visible = true; const a = i * 1.6 + 0.4; v.position.copy(bp.clone().add(V(Math.cos(a) * 2.4, 6.6 + (i % 2) * 0.8, Math.sin(a) * 2.4))); v.rotation.y = a + Math.PI / 2;
    v.userData.fluegelL.rotation.z = -0.2 - Math.max(0, Math.sin(t * 8 + i)) * 0.5; v.userData.fluegelR.rotation.z = 0.2 + Math.max(0, Math.sin(t * 8 + i)) * 0.5; });
  kamera.fahrt(q, bp.clone().add(V(8, 6.0, -8)), bp.clone().add(V(6.8, 6.6, -6.8)), bp.clone().add(V(0, 6.6, 0)), bp.clone().add(V(0, 6.9, 0)), 46); TAG_L(); wisch(t, 36); });
// 37 „Und jetzt ein mündlicher Test.“
sh(E[37] + 0.1, (t, q) => { klasse("froh"); krauseVorn(t, Fg.mund(t) === "reden" ? "lachen" : "froh", { armR: 1.2 }); tafel([B.T({ de: "MÜNDLICHER", en: "ORAL" }), B.T({ de: "TEST", en: "TEST" })], ease((t - wz("mündlicher", 37)) / 1.0));
  nah(q, krause, 6.8, -0.8, 0.3); RAUM_L(); wisch(t, 37); });
// 38 Mündlich. Mit drei Wörtern. (alle anderen gelassen, ich schwitze)
sh(E[38] + 0.3, (t, q) => { klasse("froh"); sitzt(ich, 3, "schwitzen"); zahl(ich, 3, 0.85); kamera.fahrt(q, V(KL.plaetze[3].x - 1.2, 3.8, KL.plaetze[3].z - 5.6), V(KL.plaetze[3].x - 1.0, 3.7, KL.plaetze[3].z - 4.8), V(KL.plaetze[3].x, 3.4, KL.plaetze[3].z), V(KL.plaetze[3].x, 3.6, KL.plaetze[3].z), 48); RAUM_L(); wisch(t, 38); });
// 39 Wie heißt der berühmte Turm in Paris? (Tafel mit Eiffelturm, Krause zeigt auf mich)
sh(E[39] + 0.1, (t, q) => { klasse("staunen"); sitzt(ich, 3, "staunen"); zahl(ich, 3); eiffel(); krauseVorn(t, "froh", { x: 3.0, z: -3.2, ry: -0.9, armR: 1.5, armRz: 0.1 });
  kamera.fahrt(q, loc(KL, -5.2, 4.8, 4.6), loc(KL, -4.6, 4.6, 4.0), loc(KL, 0.6, 3.6, -3.8), loc(KL, 0.6, 3.6, -4.2), 58); RAUM_L(); wisch(t, 39); });
// 40 Ich hätte „Eiffelturm“ sagen können (Idee, dann Kopfschütteln)
sh(E[40] + 0.1, (t, q) => { klasse("froh"); eiffel(); sitzt(ich, 3, t < wz("ein", 40) ? "idee" : "ernst", { kopfDreh: t > wz("dann", 40) ? 0.35 * Math.sin(t * 8) : 0 }); zahl(ich, 3, 0.85); nah(q, ich, 5.4, -0.6, -0.4); RAUM_L(); wisch(t, 40); });
// 41–42 Ich mache den Eiffelturm mit dem ganzen Körper (Arme hoch, Beine auseinander, Finger blinken)
const ICH_STEH = () => V(KL.plaetze[3].x + 1.6, 0, KL.plaetze[3].z - 0.6);
const eiffelPose = (t, k) => { stell(ich, ICH_STEH(), Math.PI, { ges: "lachen", armL: 3.0 * k, armR: 3.0 * k, armLz: -0.42 * k, armRz: -0.42 * k }); beine(ich, 0.32 * k); zahl(ich, 3, 0.8);
  if (k > 0.95) { const hL = Fg.handPos(ich, false), hR = Fg.handPos(ich, true), m = hL.add(hR).multiplyScalar(0.5); Al.kopfzahl(m.add(V(0, 0.8, 0)), "★", { farbe: Math.sin(t * 6) > 0 ? "#ffe53a" : "#fff8c0", groesse: 0.5 + 0.12 * Math.sin(t * 6) }); } };
sh(E[41] + 0.1, (t, q) => { klasse("staunen"); eiffel(); krauseVorn(t, "staunen", { x: -3.8, z: -4.4, ry: 0.7 }); eiffelPose(t, ease((t - wz("eiffelturm", 41) + 0.2) / 0.8));
  kamera.fahrt(q, loc(KL, 1.4, 4.6, 7.4), loc(KL, 1.2, 4.4, 6.6), V(ICH_STEH().x - 0.6, 3.4, ICH_STEH().z), V(ICH_STEH().x - 0.6, 3.6, ICH_STEH().z), 54); RAUM_L(); wisch(t, 41); });
sh(E[42] + 0.1, (t, q) => { klasse((i) => i % 2 ? "lachen" : "staunen"); eiffel(); krauseVorn(t, "lachen", { x: -3.8, z: -4.4, ry: 0.7 }); eiffelPose(t, 1);
  const p = ICH_STEH(); kamera.fahrt(q, V(p.x + 1.6, 3.8, p.z - 3.6), V(p.x + 1.4, 3.9, p.z - 3.2), V(p.x, 4.6, p.z), V(p.x, 4.9, p.z), 58); RAUM_L(); wisch(t, 42); });
// 43 Die ganze Klasse lacht
sh(E[43] + 0.1, (t, q) => { klasse("lachen", { kinder: (i) => ({ huepf: 0.12 * Math.abs(Math.sin(t * 8 + i)), armL: 0.4, armLz: 0.6 }) }); eiffel(); eiffelPose(t, 1); krauseVorn(t, "lachen", { x: -3.8, z: -4.4, ry: 0.7 });
  kamera.fahrt(q, loc(KL, 6.6, 6.2, -6.0), loc(KL, 6.2, 6.0, -5.4), loc(KL, -1.0, 2.6, 1.2), loc(KL, -1.0, 2.6, 1.6), 62); RAUM_L(); wisch(t, 43); });
// 44 Herr Krause schreibt „Eins plus“ an die Tafel
sh(E[44] + 0.1, (t, q) => { klasse("froh"); const a = ease((t - wz("eins", 44) + 0.1) / (wz("plus", 44) - wz("eins", 44) + 0.6)); tafel(["1+"], a);
  krauseVorn(t, "lachen", { x: 0.8, z: -5.6, ry: -0.5, armR: 1.9, armRz: 0.25 });
  kamera.fahrt(q, loc(KL, -2.4, 4.0, 1.4), loc(KL, -2.1, 3.9, 0.8), loc(KL, 0.4, 3.9, -6.6), loc(KL, 0.4, 3.9, -6.6), 52); RAUM_L(); wisch(t, 44); });
// 45 Das hat ihn zwei Wörter gekostet – gern
sh(E[45] + 0.1, (t, q) => { klasse("froh"); tafel(["1+"]); krauseVorn(t, "lachen", { x: 0.8, z: -5.0, ry: 0.3 }); sitzt(ich, 3, "lachen"); zahl(ich, 3);
  nah(q, krause, 6.2, 0.9, 0.6); RAUM_L(); wisch(t, 45); });

// ===================== 12:00 UHR =====================
const HOFK = [[k2, -6, 12, 0.9], [k3, -3.4, 12.6, -2.3], [k4, 9, 13, 2.2], [k5, 6.6, 11.4, -0.9]];
const hofKinder = (t, o = {}) => HOFK.forEach(([f, x, z, ry], i) => { stell(f, SG(x, 0.07, z), ry, { ges: i % 2 ? "froh" : "lachen", armR: o.hand && i < 2 ? 1.25 : 0.2, armRz: -0.1 }); zahl(f, [62, 48, 81, 27][i]); });
const marktTag = () => { tag(); markt.visible = preis.visible = pfosten.visible = true; kaugummi.forEach(b => b.visible = true); sticker.forEach(s => s.visible = true); };
// 46 Große Pause, Wörtermarkt auf dem Schulhof
sh(E[46] + 0.1, (t, q) => { marktTag(); hofKinder(t); stell(ben, SG(0.4, 0.07, 19.6), Math.PI - 0.3, { ges: "froh" }); zahl(ben, 100); stell(ich, SG(3.0, 0.07, 19.8), Math.PI + 0.3, { ges: "staunen" }); zahl(ich, 3); uhrzeit("12:00", "12:00 PM");
  kamera.fahrt(q, SG(22, 10, 40), SG(18, 9, 36), SG(1, 3, 15), SG(1, 3, 16), 54); TAG_L(); wisch(t, 46); });
// 47 Kaugummi fünf, Pokémon-Sticker zehn
sh(E[47] + 0.1, (t, q) => { marktTag(); kamera.fahrt(q, SG(2.6, 5.2, 21.0), SG(2.4, 4.9, 20.2), SG(2.0, 2.9, 15.4), SG(2.0, 3.0, 15.6), 46); TAG_L(); wisch(t, 47); });
// 48 Handschlag: Wörter wandern rüber (fliegende Zahlen)
sh(E[48] + 0.1, (t, q) => { marktTag(); const A = SG(-4.8, 0.07, 22), Bp = SG(-2.4, 0.07, 22); stell(k3, A, Math.PI / 2, { ges: "froh", armR: 1.25, armRz: -0.25 }); stell(k4, Bp, -Math.PI / 2, { ges: "lachen", armR: 1.25, armRz: -0.25 });
  const u = ((t - Z[48]) % 1.1) / 1.1, fl = t > Z[48] + 0.5; const n = fl ? Math.min(5, Math.floor((t - Z[48] - 0.5) / 0.35)) : 0; zahl(k3, 48 - n); zahl(k4, 27 + n);
  if (fl && n < 5) { const p = lerpV(Fg.kopfPos(k3), Fg.kopfPos(k4), easeIO(u)).add(V(0, 1.4 + Math.sin(u * Math.PI) * 1.2, 0)); Al.kopfzahl(p, B.T({ de: "Wort", en: "word" }), { farbe: "#ffe53a", groesse: 0.5 }); }
  kamera.fahrt(q, SG(-3.6, 4.2, 29), SG(-3.6, 4.0, 28), SG(-3.6, 3.6, 22), SG(-3.6, 3.7, 22), 44); TAG_L(); wisch(t, 48); });
// 49 Ben bietet mir seinen ganzen Kaugummi an – ich schüttle den Kopf
const benBietet = (t, gesI, kopf = 0) => { stell(ben, SG(0.4, 0.07, 21.0), Math.PI / 2 - 0.2, { ges: "froh", armR: 1.3, armRz: -0.1 }); zahl(ben, 100); gummiHand.visible = true; gummiHand.position.copy(Fg.handPos(ben, true)).add(V(0, 0.2, 0));
  stell(ich, SG(3.2, 0.07, 21.4), -Math.PI / 2 - 0.15, { ges: gesI, kopfDreh: kopf }); zahl(ich, 3); };
sh(E[49] + 0.1, (t, q) => { marktTag(); benBietet(t, t > wz("aber", 49) ? "ernst" : "staunen", t > wz("kopf", 49) - 0.3 ? 0.45 * Math.sin((t - wz("kopf", 49)) * 9) : 0);
  kamera.fahrt(q, SG(1.8, 4.0, 28.6), SG(1.8, 3.9, 27.6), SG(1.8, 3.3, 21.2), SG(1.8, 3.4, 21.2), 46); TAG_L(); wisch(t, 49); });
// 50 Wörter verkauft man nicht (Omas Satz) – Nah auf mich
sh(E[50] + 0.1, (t, q) => { marktTag(); benBietet(t, "ernst"); kamera.fahrt(q, SG(5.4, 4.2, 26.4), SG(5.0, 4.1, 25.6), SG(3.2, 3.4, 21.4), SG(3.2, 3.5, 21.4), 46); TAG_L(); wisch(t, 50); });
// 51 Mensa: Pizza oder Brokkoli
const mensa = () => { MENSA.an(); };
sh(E[51] + 0.1, (t, q) => { mensa(); stell(kantine, MENSA.pos(-2, 0, -7.0), 0, { ges: "froh" }); zahl(kantine, 70); stell(ich, MENSA.pos(-3.4, 0, -3.4), Math.PI, { ges: "froh" }); stell(ben, MENSA.pos(-0.8, 0, -3.2), Math.PI - 0.3, { ges: "froh" }); zahl(ich, 3); zahl(ben, 100);
  kamera.fahrt(q, MENSA.pos(7.5, 6.0, 5.0), MENSA.pos(6.4, 5.6, 4.0), MENSA.pos(-1.4, 2.8, -5.0), MENSA.pos(-1.6, 2.8, -5.2), 56); RAUM_L(); wisch(t, 51); });
// 52 Ich zeige auf die Pizza – sie versteht Brokkoli
sh(E[52] + 0.1, (t, q) => { mensa(); const zeig = t > Z[52] + 0.3; stell(ich, MENSA.pos(-3.4, 0, -3.4), Math.PI + 0.35, { ges: "froh", armR: zeig ? 1.5 : 0.2, armRz: 0.1 }); zahl(ich, 3);
  const nimmt = t > wz("brokkoli", 52) - 0.4; stell(kantine, MENSA.pos(-1.0, 0, -7.0), nimmt ? -0.6 : 0, { ges: nimmt ? "lachen" : "froh", armR: nimmt ? 1.4 : 0.3, armRz: -0.2 }); zahl(kantine, 70);
  kamera.fahrt(q, MENSA.pos(-6.4, 4.0, -1.0), MENSA.pos(-5.9, 3.9, -1.6), MENSA.pos(-2.0, 2.9, -5.6), MENSA.pos(-1.6, 2.9, -5.8), 50); RAUM_L(); wisch(t, 52); });
// 53 Ein riesiger Berg Brokkoli, ich kann nicht mal Nein sagen
sh(E[53] + 0.1, (t, q) => { mensa(); MENSA.tablett.visible = MENSA.berg.visible = true; MENSA.tablett.position.set(-3.4, 2.36, 1.0); MENSA.berg.position.set(-3.4, 2.42, 1.0); MENSA.berg.scale.setScalar(0.85);
  stell(ich, MENSA.pos(-3.4, 0.0, -1.5), 0, { ges: t > Z[53] + 1.6 ? "kneifen" : "staunen" }); zahl(ich, 3);
  kamera.fahrt(q, MENSA.pos(-3.4, 3.6, 4.4), MENSA.pos(-3.4, 3.5, 3.8), MENSA.pos(-3.4, 3.1, -0.4), MENSA.pos(-3.4, 3.2, -0.6), 48); RAUM_L(); wisch(t, 53); });
// 54 Ben lacht, fast vom Stuhl
sh(E[54] + 0.1, (t, q) => { mensa(); MENSA.tablett.visible = MENSA.berg.visible = true; MENSA.tablett.position.set(-3.4, 2.36, 1.0); MENSA.berg.position.set(-3.4, 2.42, 1.0); MENSA.berg.scale.setScalar(0.85);
  stell(ben, MENSA.pos(-1.2, 0.0, 2.7), Math.PI, { sitz: 1, ges: "lachen", neig: -0.18 - 0.12 * Math.abs(Math.sin(t * 7)), armL: 0.5, armLz: 0.8, armR: 0.9, armRz: 0.4 }); ben.position.y = -0.1; zahl(ben, 100);
  stell(ich, MENSA.pos(-3.4, -0.1, -1.5), 0, { sitz: 1, ges: "traurig" }); zahl(ich, 3);
  kamera.fahrt(q, MENSA.pos(0.8, 4.2, -3.6), MENSA.pos(0.4, 4.0, -3.0), MENSA.pos(-1.6, 3.2, 1.6), MENSA.pos(-1.8, 3.3, 1.8), 50); RAUM_L(); wisch(t, 54); });
// 55 Wofür hebe ich meine drei Wörter auf? (Nah, Mensa)
sh(E[55] + 0.3, (t, q) => { mensa(); MENSA.tablett.visible = MENSA.berg.visible = true; MENSA.tablett.position.set(-3.4, 2.36, 1.0); MENSA.berg.position.set(-3.4, 2.42, 1.0); MENSA.berg.scale.setScalar(0.85);
  stell(ich, MENSA.pos(-3.4, -0.1, -1.5), 0, { sitz: 1, ges: "ernst", kopfNeig: -0.15 }); zahl(ich, 3, 0.9); kamera.fahrt(q, MENSA.pos(-1.0, 4.0, 2.6), MENSA.pos(-1.4, 3.9, 2.0), Fg.kopfPos(ich).add(V(0, 0.3, 0)), Fg.kopfPos(ich).add(V(0, 0.3, 0)), 46); RAUM_L(); wisch(t, 55); });

// ===================== 15:00 UHR =====================
const beiOma = (t, gesI, gesO, o = {}) => { stube(); omaSofa(gesO, o.oma ?? {}); zahl(oma, omaZahl(t)); stell(ich, loc(ST, -1.2, -0.05, -3.4), o.ryI ?? 0, { sitz: 1, ges: gesI, ...(o.ich ?? {}) }); zahl(ich, 3); };
// 56 Nach der Schule zu Oma (Stube von außen nach innen)
sh(E[56] + 0.1, (t, q) => { stube(); omaSofa("froh"); zahl(oma, 90); const w = Math.min(1, (t - Z[56]) / 2.6); stell(ich, loc(ST, -5 + w * 3.2, 0, 3.2 - w * 1.4), 0.9, w < 1 ? { lauf: 0.7, phase: t * 6, ges: "froh" } : { ges: "lachen", armR: 2.6 }); zahl(ich, 3);
  uhrzeit("15:00", "3:00 PM"); kamera.fahrt(q, loc(ST, 4.6, 5.0, 5.2), loc(ST, 4.0, 4.7, 4.4), loc(ST, -0.6, 2.8, -1.6), loc(ST, -0.4, 2.8, -1.8), 58); RAUM_L(); wisch(t, 56); });
// 57 Teekanne, Kuchen, gemütlichstes Sofa
sh(E[57] + 0.1, (t, q) => { beiOma(t, "froh", "lachen"); kamera.fahrt(q, loc(ST, -2.6, 2.6, 3.2), loc(ST, -2.0, 2.5, 2.8), loc(ST, 0.4, 1.6, 0.3), loc(ST, 0.2, 2.4, -2.2), 50); RAUM_L(); wisch(t, 57); });
// 58–59 Ich male ein Bild von Papa (vor dem Fernseher, sagt nichts)
const bildAufTisch = (k) => { bildMalen(k); bildPapa.visible = true; bildPapa.position.copy(loc(ST, -0.5, 1.43, 0.35)); bildPapa.rotation.set(-Math.PI / 2, 0, 0.08); };
sh(E[58] + 0.1, (t, q) => { beiOma(t, "ernst", "froh", { ich: { armR: 1.1, armRz: -0.15, kopfNeig: 0.35, neig: 0.2 } }); bildAufTisch((t - Z[58] - 0.8) / 2.6);
  kamera.fahrt(q, loc(ST, -0.6, 4.8, 3.0), loc(ST, -0.6, 4.4, 2.4), loc(ST, -0.7, 1.4, 0.0), loc(ST, -0.6, 1.4, 0.2), 48); RAUM_L(); wisch(t, 58); });
sh(E[59] + 0.1, (t, q) => { beiOma(t, "traurig", "froh"); bildAufTisch(1); const p = loc(ST, -0.5, 1.43, 0.35); kamera.fahrt(q, p.clone().add(V(0, 3.0, 0.9)), p.clone().add(V(0, 2.4, 0.7)), p, p, 46); RAUM_L(); wisch(t, 59); });
// 60 Oma guckt lange auf das Bild
sh(E[60] + 0.1, (t, q) => { beiOma(t, "traurig", "ernst", { oma: { kopfNeig: 0.35, kopfDreh: 0.3 } }); bildAufTisch(1); nah(q, oma, 5.6, -0.7, -0.3); RAUM_L(); wisch(t, 60); });
// 61 „Dein Papa redet abends nicht, weil er keine Wörter mehr hat.“
sh(E[61] + 0.1, (t, q) => { beiOma(t, "staunen", Fg.mund(t), { oma: { kopfDreh: -0.5, armL: 0.8, armLz: -0.2 }, ich: { kopfDreh: 0.4 } }); bildAufTisch(1);
  kamera.fahrt(q, loc(ST, 0.2, 3.6, 2.8), loc(ST, 0.2, 3.5, 2.2), loc(ST, 0.1, 3.0, -3.4), loc(ST, 0.1, 3.0, -3.4), 52); RAUM_L(); wisch(t, 61); });
// 62–63 Die Stimme der Stadtnachrichten (Fernseher zeigt das Studio), 96 Wörter
sh(E[62] + 0.1, (t, q) => { beiOma(t, "staunen", Fg.mund(t), { oma: { armL: 1.5, armLz: 0.6 } }); STUDIO_TV(); papaStudio(Z[83] + 2, Fg.mund(t) === "reden" ? "reden" : "froh");
  kamera.fahrt(q, loc(ST, 1.0, 3.8, 3.2), loc(ST, 2.0, 3.6, 2.6), loc(ST, 6.6, 3.2, 1.0), loc(ST, 6.7, 3.2, 1.0), 50); RAUM_L(); wisch(t, 62); });
sh(E[63] + 0.1, (t, q) => { STUDIO.an(); const n = Math.round(B.zaehlen(t, Z[63] + 0.3, E[63] - 0.3, 99, 3)); papaTV.visible = true; papaTV.position.copy(STUDIO.pos(0, -0.05, -3.0)); papaTV.rotation.set(0, 0, 0); Fg.pose(papaTV, { sitz: 1, ges: Fg.mund(t), armL: 0.95, armR: 0.95, armLz: -0.12, armRz: -0.12 }); zahl(papaTV, n);
  Z_.zaehler = { wert: B.T({ de: "96 Wörter", en: "96 words" }), farbe: "gelb", einheit: "" };
  kamera.fahrt(q, STUDIO.pos(4.0, 4.6, 5.6), STUDIO.pos(3.0, 4.4, 4.6), STUDIO.pos(0, 3.4, -2.6), STUDIO.pos(0, 3.6, -2.6), 50); licht(1.1, "#f0f4ff", 0.9, "#7ab0ff"); wisch(t, 63); });
// 64 Ich rechne nach: 100 − 96 − 1 = 3 (Finger zählen)
sh(E[64] + 0.1, (t, q) => { beiOma(t, "idee", "froh", { ich: { armR: 1.6, armRz: -0.3, armL: 1.6, armLz: -0.3 } }); Z_.zaehler = { wert: "100 − 96 − 1 = 3", farbe: "gelb", einheit: "" };
  nah(q, ich, 5.2, 0.7, 0.0); RAUM_L(); wisch(t, 64); });
// 65 „Und die hebt er jeden Tag für dich auf.“
sh(E[65] + 0.1, (t, q) => { beiOma(t, "staunen", Fg.mund(t) === "reden" ? "reden" : "lachen", { oma: { kopfDreh: -0.5 }, ich: { kopfDreh: 0.4 } }); nah(q, oma, 5.0, -0.9, 0.0); RAUM_L(); wisch(t, 65); });
// 66 Jede Nacht um 23:59 geht er in dein Zimmer (Rückblick: Papa an meinem Bett)
const nachtRueck = () => { zimmerNacht(0); Wt.grade.uniforms.uWarm.value = 0.8; Z_.vignette = 0.6; };
sh(E[66] + 0.1, (t, q) => { nachtRueck(); tuer.oeffne(1); imBett(ichPyj, "schlaf"); Rq.weckerZeichnen("23:59", true); const w = Math.min(1, (t - Z[66]) / 3.4);
  stell(papa, ZI(2.6 - w * 2.0, 0, 4.4 - w * 2.2), RZ - 1.9 + w * 0.3, w < 1 ? { lauf: 0.35, phase: t * 3.5, ges: "froh" } : { ges: "froh", kopfNeig: 0.35 }); zahl(papa, 3);
  tuer.licht.intensity = 6; kamera.fahrt(q, ZI(-4.6, 4.8, -4.2), ZI(-4.2, 4.6, -3.6), ZI(-0.6, 2.6, 2.6), ZI(-0.6, 2.6, 2.8), 56); licht(0.35, "#ffd8a0", 0.5, "#8aa0ff"); wisch(t, 66); });
// 67 Seit du auf der Welt bist (Papa am Babybett)
sh(E[67] + 0.1, (t, q) => { nachtRueck(); Rq.ZIMMER.lichterkette.visible = false; babybett.visible = true; babybett.position.copy(ZI(1.6, 0, -2.6)); babybett.rotation.y = RZ;
  stell(baby, ZI(1.6, 1.95, -2.4), RZ + Math.PI, { liegen: 1, ges: "schlaf" }); stell(papa, ZI(1.6, 0, -0.6), RZ + Math.PI, { ges: "froh", kopfNeig: 0.45, armR: 0.9 }); zahl(papa, 3);
  kamera.fahrt(q, ZI(4.6, 4.4, -4.6), ZI(4.2, 4.2, -4.2), ZI(1.5, 2.6, -1.8), ZI(1.5, 2.7, -1.8), 50); licht(0.35, "#ffd8a0", 0.5, "#8aa0ff"); wisch(t, 67); });
// 68 Ich wollte fragen – gerade noch verkniffen (Hand vor dem Mund)
sh(E[68] + 0.1, (t, q) => { const zu = t > wz("aber", 68) - 0.2; beiOma(t, zu ? "kneifen" : "reden", "froh", { ich: zu ? { armR: 2.0, armRz: 0.55 } : { armR: 1.0 } }); nah(q, ich, 5.0, 0.8, 0.0); RAUM_L(); wisch(t, 68); });
// 69 Oma zwinkert: selbst herausfinden
sh(E[69] + 0.1, (t, q) => { const zw = t > Z[69] + 0.2 && t < Z[69] + 0.9; beiOma(t, "froh", zw ? "kneifen" : Fg.mund(t) === "reden" ? "reden" : "lachen", { oma: { kopfDreh: -0.5, kopfNeig: 0.1 } }); nah(q, oma, 5.2, -0.6, 0.0); RAUM_L(); wisch(t, 69); });
// 70–71 Mein Plan: heute Nacht bleibe ich wach
sh(E[70] + 0.1, (t, q) => { beiOma(t, "idee", "froh", { ich: { armR: 2.6, armRz: 0.2 } }); kamera.fahrt(q, loc(ST, -1.0, 3.2, 1.4), loc(ST, -1.1, 3.1, 0.9), loc(ST, -1.2, 3.0, -3.4), loc(ST, -1.2, 3.1, -3.4), 50); RAUM_L(); wisch(t, 70); });
sh(E[71] + 0.3, (t, q) => { stube(); omaSofa("lachen"); zahl(oma, omaZahl(t)); stell(ich, loc(ST, -1.6, 0, -1.2), 0.1, { ges: "lachen", armL: 0.5, armLz: 0.9, armR: 0.5, armRz: 0.9 }); zahl(ich, 3);
  kamera.fahrt(q, loc(ST, -1.4, 3.0, 4.6), loc(ST, -1.5, 3.2, 3.6), loc(ST, -1.6, 3.4, -1.2), loc(ST, -1.6, 3.6, -1.2), 50); RAUM_L(); wisch(t, 71); });

// ===================== 16:30 UHR (Heimweg, Kiosk) =====================
const kevin = Fg.figur({ haut: "#e8c0a0", hemd: "#c83a3a", hose: "#2a2a34", haare: "#2a1a10", frisur: "strubbel", kapuze: true, muetze: "#1a1a22", skala: 0.92, ...S });
const kiosk = O.reihenhaus({ wand: "#9cc8e8", stock: 2, breite: 12, tiefe: 12, laden: "KIOSK", markise: ["#ffd23a", "#e84a3a"], tuer: "#c83a3a", dach: "flach", saat: 77 }); kiosk.position.copy(DP(-40, 0.05, -14)); Wt.scene.add(kiosk);
const KI = (x, y, z) => DP(-40 + x, y, -14 + z);                       // Kiosk lokal, Front bei z = +6 (schaut zur Querstraße)
const schein = Al.leinwand(1.0, 0.5, { px: 256 }); Wt.scene.add(schein);
schein.userData.zeichne((x, w, h) => { x.fillStyle = "#4a8ad8"; x.fillRect(0, 0, w, h); x.strokeStyle = "#1a4a8a"; x.lineWidth = 8; x.strokeRect(6, 6, w - 12, h - 12); x.fillStyle = "#ffffff"; x.font = "900 70px 'Inter Display', sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("20 €", w / 2, h / 2 + 4); }, "schein");
const nachmittag = () => { tag(); Wt.U.uAbend.value = 0.35; Wt.hemi.color.set("#ffe4c8"); };
const amKiosk = (t, gesI, gesK, o = {}) => { nachmittag(); stell(kevin, KI(1.0, 0.06, 8.2), o.ryK ?? 1.45, { ges: gesK, ...(o.poseK ?? {}) }); zahl(kevin, 0); stell(ich, KI(4.6, 0.06, 8.6), o.ryI ?? -1.6, { ges: gesI, ...(o.poseI ?? {}) }); zahl(ich, 3);
  if (o.schein) { schein.visible = true; const h = Fg.handPos(kevin, true); schein.position.copy(h).add(V(0, 0.35, 0)); schein.rotation.set(0, kevin.rotation.y - Math.PI / 2, 0); } };
// 72 Auf dem Heimweg fast alles schiefgegangen (ich gehe die Hauptstraße entlang)
sh(E[72] + 0.1, (t, q) => { nachmittag(); const w = Math.min(1, (t - Z[72]) / (E[72] - Z[72])); stell(ich, DP(-8, 0.3, 60 - w * 9), Math.PI, { lauf: 0.65, phase: t * 5.5, ges: "froh" }); zahl(ich, 3); uhrzeit("16:30", "4:30 PM");
  kamera.fahrt(q, DP(2, 5.0, 40), DP(1.5, 4.6, 38), DP(-8, 3, 56), DP(-8, 3, 50), 50); TAG_L(); wisch(t, 72); });
// 73 Vor dem Kiosk steht Kevin, über seinem Kopf eine Null
sh(E[73] + 0.1, (t, q) => { amKiosk(t, "froh", "ernst", { ryI: -2.2 }); kamera.fahrt(q, KI(12, 6, 24), KI(10, 5.4, 21), KI(1.5, 4, 6), KI(1.5, 3.6, 7), 54); TAG_L(); wisch(t, 73); });
// 74 Kevin redet so viel, dass er mittags bei null ist (Mund auf, nichts kommt)
sh(E[74] + 0.1, (t, q) => { amKiosk(t, "froh", Math.sin(t * 8) > 0 ? "staunen" : "ernst", { poseK: { armL: 0.8 + 0.4 * Math.sin(t * 4), armLz: 0.3 } }); kamera.fahrt(q, KI(-2.6, 4.0, 14.4), KI(-2.1, 3.9, 13.6), Fg.kopfPos(kevin).add(V(0, 0.1, 0)), Fg.kopfPos(kevin).add(V(0, 0.1, 0)), 46); TAG_L(); wisch(t, 74); });
// 75 Zwanzig-Euro-Schein hingehalten, zeigt auf meine Drei
sh(E[75] + 0.1, (t, q) => { const zeig = t > wz("drei", 75) - 0.6; amKiosk(t, "staunen", "lachen", { schein: true, poseK: { armR: 1.4, armRz: -0.1, armL: zeig ? 2.3 : 0.2, armLz: zeig ? -0.2 : 0 } });
  kamera.fahrt(q, KI(2.8, 4.0, 14.2), KI(2.8, 3.9, 13.4), KI(2.6, 3.0, 8.4), KI(2.6, 3.2, 8.4), 48); TAG_L(); wisch(t, 75); });
// 76 Zwanzig Euro für drei Wörter (ich staune, Rechnung oben)
sh(E[76] + 0.1, (t, q) => { amKiosk(t, "staunen", "lachen", { schein: true, poseK: { armR: 1.4, armRz: -0.1 } }); Z_.zaehler = { wert: B.T({ de: "20 € = 3 Wörter", en: "$20 = 3 words" }), farbe: "gelb", einheit: "" };
  nah(q, ich, 5.2, 0.8, 0.1); TAG_L(); wisch(t, 76); });
// 77 Kevin hält mir die Hand hin: ein Handschlag, und meine Wörter wären weg
sh(E[77] + 0.1, (t, q) => { amKiosk(t, "ernst", "lachen", { poseK: { armR: 1.35, armRz: -0.25 } }); kamera.fahrt(q, KI(2.8, 4.6, 16), KI(2.8, 4.4, 15), KI(2.8, 3.0, 8.4), KI(2.8, 3.1, 8.4), 50); TAG_L(); wisch(t, 77); });
// 78 Ich gucke ganz lange auf seine Hand
sh(E[78] + 0.3, (t, q) => { amKiosk(t, "ernst", "lachen", { poseK: { armR: 1.35, armRz: -0.25 }, poseI: { kopfNeig: 0.3 } }); const h = Fg.handPos(kevin, true);
  kamera.fahrt(q, h.clone().add(V(-0.4, 1.2, 4.2)), h.clone().add(V(-0.3, 1.0, 3.0)), h.clone().add(V(0.8, 0.3, 0)), h.clone().add(V(0.6, 0.2, 0)), 44); TAG_L(); wisch(t, 78); });
// 79 Hände in die Hosentaschen und einfach weitergehen
sh(E[79] + 0.1, (t, q) => { nachmittag(); const w = Math.max(0, Math.min(1, (t - Z[79] - 1.0) / 3.0)); stell(kevin, KI(1.0, 0.06, 8.2), 1.45 + w * 0.6, { ges: w > 0 ? "staunen" : "lachen", armR: w > 0 ? 0.6 : 1.35, armRz: -0.25 }); zahl(kevin, 0);
  stell(ich, KI(4.6 + w * 7, 0.06, 8.6 + w * 1.5), w > 0 ? 1.4 : -1.6, w > 0 ? { lauf: 0.55, phase: t * 5, ges: "ernst", armL: -0.25, armR: -0.25, armLz: 0.12, armRz: 0.12 } : { ges: "ernst", armL: -0.25, armR: -0.25, armLz: 0.12, armRz: 0.12 }); zahl(ich, 3);
  kamera.fahrt(q, KI(6, 4.2, 20), KI(7, 4.0, 19), KI(4, 3, 8.6), KI(8, 3, 9.4), 50); TAG_L(); wisch(t, 79); });
// 80 Wörter verkauft man nicht – und diese drei schon gar nicht (ich komme stolz auf die Kamera zu)
sh(E[80] + 0.3, (t, q) => { nachmittag(); const w = Math.min(1, (t - Z[80]) / (E[80] - Z[80])); stell(ich, KI(11.6 + w * 4, 0.06, 10.1 + w * 1.0), 1.3, { lauf: 0.55, phase: t * 5, ges: "lachen", armL: -0.25, armR: -0.25, armLz: 0.12, armRz: 0.12 }); zahl(ich, 3);
  stell(kevin, KI(1.0, 0.06, 8.2), 2.0, { ges: "staunen" }); zahl(kevin, 0); ich.updateMatrixWorld(true); const k = Fg.kopfPos(ich);
  kamera.fahrt(q, ich.localToWorld(V(-0.6, 3.6, 6.4)), ich.localToWorld(V(-0.6, 3.6, 6.0)), k.clone().add(V(0, -0.3, 0)), k.clone().add(V(0, -0.3, 0)), 50); TAG_L(); wisch(t, 80); });

// ===================== 18:00 UHR =====================
// Alle bei Oma vor dem Fernseher: Mama, Mia, ich auf dem Sofa, Oma im Sessel, Bello auf dem Teppich
const fernsehAbend = (t, o = {}) => { stube(7); STUDIO_TV(); papaStudio(t, Fg.mund(t) === "reden" ? "reden" : "froh");
  stell(mama, loc(ST, 1.7, -0.05, -3.4), 0, { sitz: 1, ges: o.gesM ?? "froh", kopfDreh: 0.7 }); stell(mia, loc(ST, 0.1, 0.95, -3.55), 0, { sitz: 1, ges: "froh", kopfDreh: 0.7 }); zahl(mia, 0, 0.6);
  stell(ich, loc(ST, -1.5, -0.05, -3.4), 0, { sitz: 1, ges: o.gesI ?? "staunen", kopfDreh: 0.7, ...(o.ich ?? {}) }); zahl(ich, ichZahl(t));
  stell(oma, loc(ST, -5.0, -0.05, 0.5), Math.PI / 2, { sitz: 1, ges: "froh", kopfDreh: 0 }); belloSetzen(loc(ST, 1.0, 0.07, -0.8), 1.2, t, false); };
sh(E[81] + 0.1, (t, q) => { fernsehAbend(t); uhrzeit("18:00", "6:00 PM"); kamera.fahrt(q, loc(ST, -3.8, 5.4, 4.8), loc(ST, -3.2, 5.1, 4.2), loc(ST, 1.6, 2.6, -1.2), loc(ST, 2.4, 2.8, -0.4), 60); RAUM_L(); wisch(t, 81); });
// 82 Papa im Anzug, mit Krawatte, über dem Kopf 99 (direkt im Studio)
sh(E[82] + 0.1, (t, q) => { papaStudio(t, "froh"); kamera.fahrt(q, STUDIO.pos(0, 4.0, 6.2), STUDIO.pos(0, 3.9, 5.0), STUDIO.pos(0, 3.4, -2.8), STUDIO.pos(0, 3.7, -2.8), 46); licht(1.1, "#f0f4ff", 0.9, "#7ab0ff"); wisch(t, 82); });
// 83 „Guten Abend, liebe Stadt“ – er liest die Nachrichten
sh(E[83] + 0.1, (t, q) => { papaStudio(t, Fg.mund(t)); kamera.fahrt(q, STUDIO.pos(-4.4, 4.2, 5.0), STUDIO.pos(-3.6, 4.0, 4.2), STUDIO.pos(0, 3.4, -2.8), STUDIO.pos(0, 3.5, -2.8), 50); licht(1.1, "#f0f4ff", 0.9, "#7ab0ff"); wisch(t, 83); });
// 84 Ich zähle mit: 90 … 70 … 40 … 10 (Fernseher in der Stube, ich davor)
sh(E[84] + 0.1, (t, q) => { fernsehAbend(t, { gesI: "staunen", ich: { kopfDreh: 0.9 } }); kamera.fahrt(q, loc(ST, 4.6, 3.4, -1.0), loc(ST, 4.8, 3.3, -0.6), loc(ST, 6.8, 3.2, 1.0), loc(ST, 6.8, 3.2, 1.0), 46); RAUM_L(); wisch(t, 84); });
// 85 Am Ende eine Drei – genau wie bei mir
sh(E[85] + 0.1, (t, q) => { fernsehAbend(t, { gesI: "lachen" }); kamera.fahrt(q, loc(ST, -0.4, 3.4, -0.6), loc(ST, -0.6, 3.4, -1.0), loc(ST, -1.5, 3.4, -3.4), loc(ST, -1.5, 3.6, -3.4), 50); RAUM_L(); wisch(t, 85); });
// 86 So stolz, dass ich fast etwas gesagt hätte (Hand vor den Mund)
sh(E[86] + 0.1, (t, q) => { const fast = t > wz("fast", 86) - 0.3; fernsehAbend(t, { gesI: fast ? "kneifen" : "lachen", ich: fast ? { armR: 2.0, armRz: 0.55, kopfDreh: 0.3 } : { kopfDreh: 0.3 } }); nah(q, ich, 5.2, 0.6, 0.0); RAUM_L(); wisch(t, 86); });
// 87 Mia will raus, mit ihrem roten Ball
sh(E[87] + 0.1, (t, q) => { stube(7); Al.fernseherAus(); stell(mia, loc(ST, -0.6, 0, 1.6), Math.PI * 0.85, { ges: "lachen", armL: 1.4, armR: 1.4, armLz: -0.25, armRz: -0.25, huepf: 0.2 * Math.abs(Math.sin(t * 6)) }); zahl(mia, 0, 0.6);
  ball.visible = true; const hl = Fg.handPos(mia, false), hr = Fg.handPos(mia, true); ball.position.copy(hl.add(hr).multiplyScalar(0.5)).add(V(0, 0.15, 0)); ball.scale.setScalar(1);
  stell(mama, loc(ST, 1.7, -0.05, -3.4), 0, { sitz: 1, ges: "lachen" });
  kamera.fahrt(q, loc(ST, -1.6, 2.4, -1.4), loc(ST, -1.5, 2.3, -0.9), loc(ST, -0.6, 1.8, 1.6), loc(ST, -0.6, 1.8, 1.6), 50); RAUM_L(); wisch(t, 87); });
// Buntdorf am Abend: Dorfplatz (x 14…62), Gehweg x 6…10, Bordstein bei x = 6,1, Straße x −6…6
const MIA0 = DP(16, 0.28, 8), RAND = DP(6.7, 0.3, 6.6);
const BALL_ZIEL = DP(-3.8, 0.47, 5.4);
const T_WURF = () => Z[89] + 0.5, T_LANDE = () => Z[89] + 1.6;
const ballPos = (t) => { if (t < T_WURF()) return null; const a = MIA0.clone().add(V(-0.8, 2.2, 0)), b = DP(9.0, 0.7, 7.0);
  if (t < T_LANDE()) { const u = (t - T_WURF()) / (T_LANDE() - T_WURF()); const p = lerpV(a, b, u); p.y = lerp(a.y, b.y, u) + Math.sin(u * Math.PI) * 3.2; return p; }
  const u = Math.min(1, (t - T_LANDE()) / 2.6), k = 1 - (1 - u) * (1 - u); const p = lerpV(b, BALL_ZIEL, k); p.y = 0.47 + (b.y - 0.47) * Math.max(0, 1 - u * 5) + Math.abs(Math.sin(u * 9)) * 0.4 * (1 - u); return p; };
const ballSetzen = (t) => { const p = ballPos(t); if (!p) { const hl = Fg.handPos(mia, false), hr = Fg.handPos(mia, true); ball.position.copy(hl.add(hr).multiplyScalar(0.5)).add(V(0, 0.15, 0)); } else ball.position.copy(p); ball.visible = true; ball.rotation.z = -t * 6; };
const T_LOS = () => Z[91] + 0.1, T_STOPP = () => wz("stopp", 95) + 0.15;
const miaPos = (t) => { if (t < T_LOS()) return MIA0.clone(); const ende = Math.min(t, T_STOPP()); const u = Math.min(1, (ende - T_LOS()) / (T_STOPP() - T_LOS())); return lerpV(MIA0, RAND, u); };
const miaSetzen = (t, ges) => { const p = miaPos(t); const lauf = t > T_LOS() && t < T_STOPP(); const ry = t < T_LOS() ? -Math.PI / 2 + 0.1 : -Math.PI / 2 - 0.12;
  stell(mia, p, ry, lauf ? { renn: 1, phase: t * 11, ges: ges ?? "froh" } : t < T_WURF() + 0.3 ? { ges: "lachen", armL: 1.4, armR: 1.4, armLz: -0.25, armRz: -0.25 } : { ges: ges ?? "froh" }); zahl(mia, 0, 0.6); };
// Bus: kommt hinter dem Eckhaus (x 10…22, z > 26) die Straße herunter, Spur x = +3, bremst, rollt langsam vorbei
const T_BUS0 = () => Z[92] + 0.3, T_BREMS = () => Z[97] + 0.2;
const busZ = (t) => { const z0 = 150, z1 = 26, zEnd = -40; if (t < T_BUS0()) return z0; if (t < T_BREMS()) return lerp(z0, z1, (t - T_BUS0()) / (T_BREMS() - T_BUS0()));
  const u = Math.min(1, (t - T_BREMS()) / 5.0); return lerp(z1, zEnd, 1 - (1 - u) * (1 - u)); };
const busSetzen = (t) => { bus.visible = true; bus.position.copy(DP(3.0, 0.05, busZ(t))); bus.rotation.y = Math.PI; };
const mamaPlatz = (t, ges, o = {}) => { stell(mama, DP(o.x ?? 30, 0.28, o.z ?? 9), o.ry ?? -1.4, { ges, ...(o.pose ?? {}) }); zahl(mama, 96); };
const ichPlatz = (t, ges, o = {}) => { stell(ich, DP(o.x ?? 19, 0.28, o.z ?? 2.5), o.ry ?? -1.3, { ges, ...(o.pose ?? {}) }); zahl(ich, ichZahl(t)); };
// 88 Alle zum Dorfplatz an der Hauptstraße (Abend)
sh(E[88] + 0.1, (t, q) => { abend(); const w = Math.min(1, (t - Z[88]) / (E[88] - Z[88])); const g = (x0, z0, x1, z1) => DP(lerp(x0, x1, w), 0.28, lerp(z0, z1, w));
  stell(mama, g(36, -18, 30, 9), -2.9 + w * 1.5, { lauf: 0.6, phase: t * 5, ges: "froh" }); stell(ich, g(33, -19, 19, 2.5), -2.6 + w * 1.3, { lauf: 0.6, phase: t * 5.5 + 1, ges: "froh" }); zahl(ich, 3);
  stell(mia, g(34, -16, 16, 8), -2.4 + w * 0.9, { lauf: 0.8, phase: t * 7, ges: "lachen" }); ball.visible = true; ball.position.copy(Fg.handPos(mia, true)).add(V(0, 0.1, 0.2));
  belloSetzen(g(31, -17, 21, 5), -2.4, t, false); uhrzeit("18:30", "6:30 PM");
  kamera.fahrt(q, DP(2, 14, -24), DP(4, 12, -18), DP(30, 2, -8), DP(22, 2, 2), 54); ABEND_L(); wisch(t, 88); });
// 89 Mia wirft den Ball, viel zu weit
sh(E[89] + 0.1, (t, q) => { abend(); miaSetzen(t); ballSetzen(t); mamaPlatz(t, "froh"); ichPlatz(t, "froh"); belloSetzen(DP(21, 0.28, 5), -2.4, t, false);
  kamera.fahrt(q, DP(25, 4.6, 13), DP(24, 4.4, 12.4), DP(13, 3, 7), DP(11, 3, 7), 52); ABEND_L(); wisch(t, 89); });
// 90 Er rollt über den Gehweg direkt auf die Straße (tief am Boden)
sh(E[90] + 0.1, (t, q) => { abend(); ballSetzen(t); miaSetzen(t); kamera.fahrt(q, DP(4.0, 1.2, -6), DP(3.6, 1.1, -4.5), DP(6, 0.8, 6.6), DP(-2, 0.6, 5.6), 50); ABEND_L(); wisch(t, 90); });
// 91 Und Mia läuft einfach hinterher
sh(E[91] + 0.1, (t, q) => { abend(); ballSetzen(t); miaSetzen(t, "lachen"); mamaPlatz(t, "froh"); ichPlatz(t, "staunen");
  kamera.fahrt(q, DP(10, 3.2, -6), DP(9.6, 3.0, -4.6), DP(13, 1.6, 7.4), DP(10, 1.6, 7.0), 50); ABEND_L(); wisch(t, 91); });
// 92 Der Bus kommt um die Ecke, Mia sieht ihn nicht
sh(E[92] + 0.1, (t, q) => { abend(); ballSetzen(t); miaSetzen(t, "lachen"); busSetzen(t);
  kamera.fahrt(q, DP(-4.8, 3.4, -10), DP(-4.6, 3.2, -9), DP(3, 3, 40), DP(4, 2.6, 18), 50); ABEND_L(); wisch(t, 92); });
// 93 Mama zu weit weg, Bello bellt
sh(E[93] + 0.1, (t, q) => { abend(); ballSetzen(t); miaSetzen(t, "lachen"); busSetzen(t); mamaPlatz(t, "angst", { pose: { armL: 1.6, armR: 1.6, armLz: -0.2, armRz: -0.2 } }); belloSetzen(DP(21, 0.28, 5), -1.8, t, true); ichPlatz(t, "angst");
  kamera.fahrt(q, DP(38, 4.6, 12), DP(36.5, 4.4, 11.6), DP(28, 3, 8), DP(26, 3, 7), 50); ABEND_L(); wisch(t, 93); });
// 94 Ich hatte drei Wörter … (Nah, rote 3)
sh(E[94] + 0.2, (t, q) => { abend(); busSetzen(t); miaSetzen(t, "lachen"); ichPlatz(t, "angst", { ry: -1.45 }); nah(q, ich, 4.8, -0.8, 0.1); ABEND_L(); wisch(t, 94); });
// 95 „Mia, stopp!“
sh(E[95] + 0.4, (t, q) => { abend(); busSetzen(t); miaSetzen(t); ichPlatz(t, "schreien", { ry: -1.45, pose: { armL: 1.5, armR: 1.5, armLz: -0.3, armRz: -0.3, neig: 0.12 } }); ich.updateMatrixWorld(true);
  const k = Fg.kopfPos(ich); kamera.fahrt(q, ich.localToWorld(V(-1.4, 3.6, 5.6)), ich.localToWorld(V(-1.1, 3.6, 4.4)), k, k, 46); ABEND_L(); wisch(t, 95); });
// 96 Mia bleibt stehen, genau an der Bordsteinkante (tief, Bus im Hintergrund)
sh(E[96] + 0.1, (t, q) => { abend(); busSetzen(t); ballSetzen(t); miaSetzen(t, "staunen");
  kamera.fahrt(q, DP(10.5, 1.4, 1.2), DP(10.2, 1.3, 1.8), DP(6.4, 1.6, 7.6), DP(6.2, 1.8, 8.2), 50); ABEND_L(); wisch(t, 96); });
// 97 Der Bus bremst und rollt ganz langsam vorbei
sh(E[97] + 0.3, (t, q) => { abend(); busSetzen(t); ballSetzen(t); miaSetzen(t, "staunen"); ichPlatz(t, "angst"); mamaPlatz(t, "angst", { x: 24, z: 8.5 });
  kamera.fahrt(q, DP(22, 6.5, -14), DP(21, 6.2, -12), DP(5, 2.5, 6), DP(4, 2.5, 4), 52); ABEND_L(); wisch(t, 97); });
// 98 Mama drückt Mia, der Ball fällt herunter
const umarmt = (t, wer, gesW, p, ry) => { const klein = wer === mia; stell(mama, p, ry, { ges: "weinen", neig: klein ? 0.08 : 0.2, armL: 1.3, armR: 1.3, armLz: -0.55, armRz: -0.55 }); mama.updateMatrixWorld(true); zahl(mama, 96);
  stell(wer, mama.localToWorld(klein ? V(0, 1.7, 1.05) : V(0, 0, 1.6)), ry + Math.PI, { ges: gesW, armL: 1.1, armR: 1.1, armLz: -0.5, armRz: -0.5 }); };
sh(E[98] + 0.1, (t, q) => { abend(); bus.visible = false; const p = DP(9.2, 0.3, 6.6); umarmt(t, mia, "weinen", p, Math.PI / 2); zahl(mia, 0, 0.6);
  const f = Math.min(1, Math.max(0, (t - wz("ball", 98)) / 0.45)); ball.visible = true; ball.position.copy(mama.localToWorld(V(0.9, 2.6 - 2.1 * f * f, 1.1))); if (f >= 1) ball.position.y = DP(0, 0.72, 0).y + Math.abs(Math.sin((t - wz("ball", 98) - 0.45) * 7)) * 0.3 * Math.max(0, 1 - (t - wz("ball", 98) - 0.45));
  kamera.fahrt(q, DP(15.0, 5.4, 10.2), DP(14.4, 5.2, 9.8), DP(9.6, 4.4, 6.6), DP(9.6, 4.5, 6.6), 46); ABEND_L(); wisch(t, 98); });
// 99 Dann drückt sie mich, noch fester
sh(E[99] + 0.1, (t, q) => { abend(); const p = DP(12, 0.28, 4); umarmt(t, ich, "traurig", p, -Math.PI / 2 + 0.3); zahl(ich, 1); stell(mia, DP(10.2, 0.3, 7.2), -1.2, { ges: "traurig" }); zahl(mia, 0, 0.6);
  ball.visible = true; ball.position.copy(DP(9.0, 0.72, 8.0));
  kamera.fahrt(q, DP(7.2, 3.8, 7.6), DP(7.6, 3.7, 7.2), DP(11.2, 3.4, 4.3), DP(11.2, 3.5, 4.3), 46); ABEND_L(); wisch(t, 99); });
// 100 Über meinem Kopf jetzt eine Eins
sh(E[100] + 0.2, (t, q) => { abend(); ichPlatz(t, "traurig", { x: 12.6, z: 3.6, ry: -1.8 }); kamera.fahrt(q, DP(8.4, 3.0, 2.0), DP(8.8, 2.9, 2.4), DP(12.6, 4.6, 3.6), DP(12.6, 4.9, 3.6), 50); ABEND_L(); wisch(t, 100); });
// 101 Eine einzige Eins – und Papa hatte drei für mich aufgehoben
sh(E[101] + 0.4, (t, q) => { abend(); Wt.U.uAbend.value = 1; ichPlatz(t, "traurig", { x: 12.6, z: 3.6, ry: -2.6, pose: { kopfNeig: 0.3 } });
  kamera.fahrt(q, DP(16.4, 3.8, -2.6), DP(17.6, 4.8, -4.4), DP(12.6, 3.8, 3.6), DP(12.6, 4.6, 3.6), 50); ABEND_L(); Z_.vignette = 0.5; wisch(t, 101); });

// ===================== 21:00 UHR =====================
const amBoden = (ges, o = {}) => { stell(ichPyj, ZI(1.7, 0, 0.6), RZ + Math.PI + 0.35, { sitz: 1, ges, ...o }); ichPyj.position.y = ZI(0, 0, 0).y - 1.25; };
const bettNacht = (ges, o = {}) => imBett(ichPyj, ges, o);
// 102 Mama macht das Licht aus (an der Tür, Flurlicht)
sh(E[102] + 0.1, (t, q) => { const aus = t > wz("ausgemacht", 102) - 0.3; Rq.weckerZeichnen("21:00", true); if (!aus) { Rq.ZIMMER.licht.intensity = 18; Wt.hemi.intensity = 0.45; } else zimmerNacht(0); if (!aus) Rq.ZIMMER.schirm.material = Rq.ZIMMER.schirmAn;
  tuer.oeffne(1); tuer.licht.intensity = 7; stell(mama, ZI(3.4, 0, 4.4), RZ + Math.PI + 0.5, { ges: "froh", armR: aus ? 0.2 : 1.6, armRz: -0.3 }); bettNacht("froh"); zahl(ichPyj, 1); uhrzeit("21:00", "9:00 PM");
  kamera.fahrt(q, ZI(-4.6, 4.6, -4.6), ZI(-4.2, 4.4, -4.0), ZI(0.6, 3.0, 3.6), ZI(0.8, 3.0, 3.8), 58); licht(0.35, "#ffd8a0", 0.5, "#8aa0ff"); wisch(t, 102); });
// 103 Nicht einschlafen! (Augen weit auf)
sh(E[103] + 0.1, (t, q) => { zimmerNacht(0); Rq.weckerZeichnen("21:05", true); bettNacht("staunen"); zahl(ichPyj, 1); const kp = bettKopf();
  kamera.fahrt(q, ZI(-1.6, 6.4, 1.4), ZI(-1.7, 6.0, 1.9), kp, kp.clone().add(V(0, 0.1, 0)), 46); licht(0.3, "#ffd8a0", 0.5, "#8aa0ff"); wisch(t, 103); });
// 104 Wecker auf Viertel vor zwölf
sh(E[104] + 0.1, (t, q) => { zimmerNacht(0); Rq.weckerZeichnen(Math.sin(t * 6) > -0.85 ? "23:45" : "", true); bettNacht("ernst"); kamera.fahrt(q, ZI(-0.2, 2.8, 2.2), ZI(0.0, 2.75, 2.6), ZI(0.9, 2.15, 4.2), ZI(0.9, 2.2, 4.2), 38); licht(0.3, "#ffd8a0", 0.5, "#8aa0ff"); wisch(t, 104); });
// 105 Lichterkette an, Schafe rückwärts zählen
sh(E[105] + 0.1, (t, q) => { const an = t > Z[105] + 0.6; zimmerNacht(an ? 1 : 0); Rq.weckerZeichnen("21:30", true); bettNacht("froh"); const n = t > wz("schafe", 105) ? 100 - Math.floor((t - wz("schafe", 105)) * 2.2) : 100;
  if (t > wz("schafe", 105) - 0.2) Z_.zaehler = { wert: B.T({ de: n + " Schafe", en: n + " sheep" }), farbe: "gelb", einheit: "" };
  kamera.fahrt(q, ZI(3.8, 6.2, -3.6), ZI(3.4, 6.0, -3.2), ZI(-2.0, 2.6, 2.0), ZI(-2.0, 2.6, 2.2), 58); licht(0.35, "#ffb060", 0.5, "#8aa0ff"); wisch(t, 105); });
// 106 Um zehn Augen schwer wie Steine
sh(E[106] + 0.1, (t, q) => { zimmerNacht(1); Rq.weckerZeichnen("22:00", true); bettNacht("muede"); zahl(ichPyj, 1); const kp = bettKopf();
  kamera.fahrt(q, ZI(-2.8, 6.2, 1.6), ZI(-2.7, 5.8, 2.0), kp, kp, 44); licht(0.35, "#ffb060", 0.5, "#8aa0ff"); uhrzeit("22:00", "10:00 PM"); wisch(t, 106); });
// 107 Um elf auf dem kalten Boden sitzen
sh(E[107] + 0.1, (t, q) => { zimmerNacht(1); Rq.weckerZeichnen("23:00", true); amBoden("muede"); zahl(ichPyj, 1);
  uhrzeit("23:00", "11:00 PM"); kamera.fahrt(q, ZI(4.4, 4.6, -4.2), ZI(4.0, 4.3, -3.6), ZI(0.6, 1.6, 0.6), ZI(0.6, 1.8, 0.6), 54); licht(0.35, "#ffb060", 0.5, "#8aa0ff"); wisch(t, 107); });
// 108 Durch das Fenster die Lichter der Stadt (über meine Schulter)

sh(E[108] + 0.1, (t, q) => { zimmerNacht(1); Rq.weckerZeichnen("23:10", true); amBoden("froh", { kopfDreh: -0.4 }); zahl(ichPyj, 1);
  kamera.fahrt(q, ZI(1.6, 3.6, 4.4), ZI(1.4, 3.8, 3.4), ZI(0, 4.4, -6), ZI(0, 4.6, -6), 50); licht(0.35, "#ffb060", 0.5, "#8aa0ff"); wisch(t, 108); });
// 109 Hinter jedem Fenster jemand, der seine Wörter verbraucht hat (Blick über die Nachtstadt)
sh(E[109] + 0.1, (t, q) => { kamera.luft(q, V(0, 10, 0), 300, 270, 190, 170, 0.6, 0.9, 54); licht(0.8, "#ffd8b0", 1.0); wisch(t, 109); });
// 110–111 Gedanken: Herr Krause mit der Eins plus, Oma mit ihrem Geheimnis (warm erinnert)
const erinnern = () => { Wt.grade.uniforms.uWarm.value = 1; Z_.vignette = 0.62; };
sh(E[110] + 0.1, (t, q) => { erinnern(); klasse("lachen"); tafel(["1+"]); krauseVorn(Z[46], "lachen", { x: 0.8, z: -5.0, ry: 0.3 }); sitzt(ich, 3, "lachen");
  kamera.fahrt(q, loc(KL, 2.8, 4.6, 2.4), loc(KL, 2.4, 4.4, 1.8), loc(KL, 0.4, 3.8, -5.2), loc(KL, 0.4, 3.8, -5.2), 52); RAUM_L(); wisch(t, 110); });
sh(E[111] + 0.1, (t, q) => { erinnern(); stube(); const zw = t > Z[111] + 0.8 && t < Z[111] + 1.5; omaSofa(zw ? "kneifen" : "lachen", { kopfDreh: -0.3 }); nah(q, oma, 5.0, -0.5, 0.0); RAUM_L(); wisch(t, 111); });
// 112 Mia sicher in ihrem Bett – wegen zwei Wörtern (Mias Zimmer mit Nachtlicht)
const MIAZ = kasten(2600, 1800, 12, 11, 6.5, "#f4c8d8", "#c8a07a", 3, "#ffb8d0");
{ const g = MIAZ.g, m = (c, r = 0.8) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
  const rahmen = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.8, 5.4), m("#f8f4ec", 0.6)); rahmen.position.set(-1.5, 0.7, -1.8); g.add(rahmen);
  const kopf = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.4, 0.3), m("#f8f4ec", 0.6)); kopf.position.set(-1.5, 1.5, -4.5); g.add(kopf);
  const matr = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.4, 5.2), m("#ffffff", 0.9)); matr.position.set(-1.5, 1.3, -1.8); g.add(matr);
  const kis = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.4, 0.9), m("#ffe8f0", 0.9)); kis.position.set(-1.5, 1.7, -3.8); g.add(kis);
  const decke = new THREE.Mesh(new THREE.BoxGeometry(2.9, 1.1, 3.4), m("#f25a9a", 0.85)); decke.position.set(-1.5, 2.05, -0.9); g.add(decke);
  const nl = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 2.0, 1.2) })); nl.position.set(1.0, 2.0, -4.6); g.add(nl);
  const nt = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 1.0), m("#f8f4ec", 0.6)); nt.position.set(1.0, 0.8, -4.6); g.add(nt);
  const nll = new THREE.PointLight("#ffc890", 6, 12, 1.6); nll.position.set(1.0, 2.6, -4.2); g.add(nll); MIAZ.nachtlicht = nll; }
sh(E[112] + 0.1, (t, q) => { MIAZ.an(2); Wt.hemi.intensity = 0.3; stell(mia, MIAZ.pos(-1.5, 1.86, -0.9), 0, { liegen: 1, ges: "schlaf" });
  Al.kopfzahl(MIAZ.pos(-1.2, 3.6, -3.6), "Zzz", { farbe: "#ffffff", groesse: 0.5 });
  kamera.fahrt(q, MIAZ.pos(2.6, 4.2, 2.6), MIAZ.pos(2.2, 4.0, 2.0), MIAZ.pos(-1.5, 1.8, -2.6), MIAZ.pos(-1.5, 1.8, -2.8), 50); licht(0.35, "#ffc890", 0.5, "#8aa0ff"); wisch(t, 112); });
// 113–114 Vielleicht ist es nicht schlimm, wenige Wörter zu haben – schlimm ist nur, die wichtigen nie zu sagen
sh(E[113] + 0.1, (t, q) => { zimmerNacht(1); Rq.weckerZeichnen("23:20", true); amBoden("ernst", { kopfNeig: -0.15 }); zahl(ichPyj, 1);
  kamera.fahrt(q, ZI(-3.4, 4.0, -3.6), ZI(-3.0, 3.8, -3.0), ZI(0.8, 2.0, 0.4), ZI(0.8, 2.1, 0.4), 52); licht(0.35, "#ffb060", 0.5, "#8aa0ff"); wisch(t, 113); });
sh(E[114] + 0.3, (t, q) => { zimmerNacht(1); Rq.weckerZeichnen("23:20", true); amBoden("traurig", { kopfNeig: 0.1 }); zahl(ichPyj, 1, 0.9); { const k = Fg.kopfPos(ichPyj); kamera.fahrt(q, ZI(3.4, 2.6, -2.8), ZI(3.1, 2.5, -2.4), k.clone().add(V(0, 0.3, 0)), k.clone().add(V(0, 0.3, 0)), 42); } licht(0.35, "#ffb060", 0.5, "#8aa0ff"); wisch(t, 114); });
// 115 Um halb zwölf fast im Sitzen eingeschlafen (Kopf nickt weg)
sh(E[115] + 0.1, (t, q) => { zimmerNacht(1); Rq.weckerZeichnen("23:30", true); const n = Math.max(0, Math.sin((t - Z[115]) * 1.6)); amBoden(n > 0.6 ? "schlaf" : "muede", { kopfNeig: 0.5 * n }); zahl(ichPyj, 1);
  uhrzeit("23:30", "11:30 PM"); kamera.fahrt(q, ZI(3.4, 3.2, -2.2), ZI(3.0, 3.0, -1.8), ZI(0.8, 2.2, 0.4), ZI(0.8, 2.2, 0.4), 46); licht(0.35, "#ffb060", 0.5, "#8aa0ff"); wisch(t, 115); });
// 116 Nur ein lautes Schnarchen neben mir hält mich wach
sh(E[116] + 0.1, (t, q) => { zimmerNacht(1); Rq.weckerZeichnen("23:32", true); amBoden(t > Z[116] + 1.2 ? "staunen" : "schlaf", { kopfNeig: t > Z[116] + 1.2 ? 0 : 0.45 }); zahl(ichPyj, 1);
  const bp = ZI(3.9, 0, -0.6); bello.visible = true; bello.position.copy(bp); bello.rotation.y = RZ + Math.PI + 0.9; bello.userData.schwanz.rotation.z = 0; Al.kopfzahl(bp.clone().add(V(0, 3.4, 0)), "ZZZ", { farbe: "#ffffff", groesse: 0.6 + 0.1 * Math.sin(t * 3) });
  kamera.fahrt(q, ZI(1.8, 3.0, -3.8), ZI(1.7, 2.8, -3.2), ZI(1.6, 2.0, 0.2), ZI(1.6, 2.0, 0.2), 50); licht(0.35, "#ffb060", 0.5, "#8aa0ff"); wisch(t, 116); });
// 117 Bello schnarcht neben mir, bellt sogar im Schlaf
sh(E[117] + 0.1, (t, q) => { zimmerNacht(1); Rq.weckerZeichnen("23:35", true); amBoden("muede"); zahl(ichPyj, 1);
  const bp = ZI(3.9, 0, -0.6); bello.visible = true; bello.position.copy(bp); bello.rotation.y = RZ + Math.PI + 0.9; bello.userData.schwanz.rotation.z = 0;
  const w = t > wz("gebellt", 117) - 0.6; Al.kopfzahl(bp.clone().add(V(0, 3.4, 0)), w && Math.sin(t * 6) > 0 ? B.T({ de: "wuff", en: "woof" }) : "Zzz", { farbe: "#ffffff", groesse: 0.55 });
  kamera.fahrt(q, ZI(2.0, 2.6, -3.6), ZI(1.9, 2.5, -3.0), ZI(1.8, 1.6, 0.2), ZI(1.8, 1.7, 0.2), 48); licht(0.35, "#ffb060", 0.5, "#8aa0ff"); wisch(t, 117); });
// 118 Mein eines Wort: was sagt man mit nur einem Wort?
sh(E[118] + 0.1, (t, q) => { zimmerNacht(1); Rq.weckerZeichnen("23:40", true); amBoden("ernst", { kopfNeig: -0.2 }); zahl(ichPyj, 1, 0.9);
  { const k = Fg.kopfPos(ichPyj); kamera.fahrt(q, ZI(3.0, 3.6, -3.4), ZI(2.8, 3.4, -3.0), k.clone().add(V(0, 0.4, 0)), k.clone().add(V(0, 0.4, 0)), 42); } licht(0.35, "#ffb060", 0.5, "#8aa0ff"); wisch(t, 118); });
// 119 Der Wecker klingelt 23:45 – schnell ins Bett, Augen zu
sh(wz("zwölf", 119) + 0.2, (t, q) => { zimmerNacht(1); Rq.weckerZeichnen("23:45", Math.sin(t * 9) > -0.85); amBoden("staunen");
  kamera.fahrt(q, ZI(-0.2, 2.8, 2.2), ZI(0.0, 2.75, 2.5), ZI(0.9, 2.1, 4.2), ZI(0.9, 2.15, 4.2), 40); licht(0.35, "#ffb060", 0.5, "#8aa0ff"); wisch(t, 119); });
sh(E[119] + 0.15, (t, q) => { zimmerNacht(1); Rq.weckerZeichnen("23:45", true); bettNacht(t > wz("augen", 119) ? "schlaf" : "staunen"); zahl(ichPyj, 1);
  kamera.fahrt(q, ZI(3.6, 5.4, -2.6), ZI(3.2, 5.0, -2.2), ZI(-2.2, 2.4, 2.0), ZI(-2.2, 2.4, 2.2), 54); licht(0.35, "#ffb060", 0.5, "#8aa0ff"); });

// ===================== 23:59 UHR =====================
const T_AUF = () => Z[120] + 0.6;
// 120 Eine Minute vor zwölf geht meine Tür auf, ganz langsam
sh(E[120] + 0.1, (t, q) => { zimmerNacht(1); Rq.weckerZeichnen("23:59", true); const u = easeIO((t - T_AUF()) / 3.0); tuer.oeffne(u); tuer.licht.intensity = 7 * u; bettNacht("schlaf"); zahl(ichPyj, 1); uhrzeit("23:59", "11:59 PM");
  kamera.fahrt(q, ZI(-2.4, 3.2, 1.0), ZI(-2.2, 3.1, 1.6), ZI(3.4, 3.0, 5.6), ZI(3.6, 3.0, 5.6), 50); licht(0.35, "#ffb060", 0.5, "#8aa0ff"); });
// 121 Papa schleicht herein, über seinem Kopf eine Drei
const papaWeg = (t, t0, d) => { const w = Math.min(1, Math.max(0, (t - t0) / d)); return { w, p: ZI(3.8 - w * 2.4, 0, 5.2 - w * 2.6) }; };
sh(E[121] + 0.1, (t, q) => { zimmerNacht(1); tuer.oeffne(1); tuer.licht.intensity = 7; bettNacht("schlaf"); const { w, p } = papaWeg(t, Z[121], E[121] - Z[121]);
  stell(papa, p, RZ + Math.PI + 0.55, w < 1 ? { lauf: 0.35, phase: t * 3.2, ges: "froh", armL: 0.5, armR: 0.5 } : { ges: "froh" }); zahl(papa, papaZahl(t));
  kamera.fahrt(q, ZI(-3.6, 3.4, -2.8), ZI(-3.3, 3.3, -2.4), ZI(2.6, 3.4, 4.0), ZI(1.8, 3.4, 3.0), 50); licht(0.4, "#ffb060", 0.6, "#ffd8a0"); wisch(t, 121); });
// 122 Er setzt sich an mein Bett und streicht mir über die Haare
const papaAmBett = (t, ges, o = {}) => { stell(papa, ZI(-0.6, 0.65, 2.0), RZ + 0.9, { sitz: 1, ges, armR: o.streich ? 0.55 : 0.3, armRz: o.streich ? 1.05 + 0.08 * Math.sin(t * 2.5) : 0, kopfDreh: o.kopfDreh ?? -0.7, kopfNeig: 0.3, ...(o.pose ?? {}) }); zahl(papa, papaZahl(t)); };
sh(E[122] + 0.1, (t, q) => { zimmerNacht(1); tuer.oeffne(1); tuer.licht.intensity = 5; bettNacht("schlaf"); zahl(ichPyj, 1); papaAmBett(t, "froh", { streich: true });
  kamera.fahrt(q, ZI(2.4, 5.6, 5.0), ZI(2.1, 5.4, 4.6), ZI(-1.1, 3.9, 2.4), ZI(-1.1, 3.9, 2.6), 56); licht(0.4, "#ffb060", 0.6, "#ffd8a0"); wisch(t, 122); });
// 123 Und dann sagt er sie, seine drei Wörter (nah auf Papa)
sh(E[123] + 0.1, (t, q) => { zimmerNacht(1); tuer.oeffne(1); tuer.licht.intensity = 5; bettNacht("schlaf"); papaAmBett(t, "froh", { streich: true }); nah(q, papa, 5.0, 0.8, -0.4, 44); licht(0.4, "#ffb060", 0.6, "#ffd8a0"); wisch(t, 123); });
// 124 „Hab dich lieb.“ (3 → 2 → 1 → 0)
sh(E[124] + 0.2, (t, q) => { zimmerNacht(1); tuer.oeffne(1); tuer.licht.intensity = 5; bettNacht("schlaf"); papaAmBett(t, Fg.mund(t) === "reden" ? "reden" : "froh"); nah(q, papa, 4.4, 0.5, -0.5, 42); licht(0.4, "#ffb060", 0.6, "#ffd8a0"); wisch(t, 124); });
// 125 Seine Drei ist auf null gesprungen
sh(E[125] + 0.1, (t, q) => { zimmerNacht(1); tuer.oeffne(1); tuer.licht.intensity = 5; bettNacht("schlaf"); papaAmBett(t, "froh"); const k = Fg.kopfPos(papa);
  kamera.fahrt(q, k.clone().add(V(0, 0.4, 0)).addScaledVector(V(Math.sin(RZ + 0.6), 0, Math.cos(RZ + 0.6)), -5.2), k.clone().add(V(0, 0.8, 0)).addScaledVector(V(Math.sin(RZ + 0.6), 0, Math.cos(RZ + 0.6)), -4.4), k.clone().add(V(0, 1.4, 0)), k.clone().add(V(0, 1.8, 0)), 44); licht(0.4, "#ffb060", 0.6, "#ffd8a0"); wisch(t, 125); });
// 126 Und genau da mache ich die Augen auf
sh(E[126] + 0.2, (t, q) => { zimmerNacht(1); tuer.oeffne(1); tuer.licht.intensity = 5; bettNacht(t > wz("augen", 126) ? "staunen" : "schlaf"); zahl(ichPyj, 1); papaAmBett(t, "froh"); const kp = bettKopf();
  kamera.fahrt(q, ZI(-4.7, 3.3, 2.2), ZI(-4.6, 3.3, 2.5), kp.clone().add(V(0, 0.55, 0)), kp.clone().add(V(0, 0.6, 0)), 42); licht(0.4, "#ffb060", 0.6, "#ffd8a0"); wisch(t, 126); });
// 127 Papa guckt, als hätte er ein Gespenst gesehen
sh(E[127] + 0.1, (t, q) => { zimmerNacht(1); tuer.oeffne(1); tuer.licht.intensity = 5; bettNacht("froh"); papaAmBett(t, "staunen", { pose: { kopfNeig: 0.2 } }); nah(q, papa, 4.6, -0.7, -0.4, 42); licht(0.4, "#ffb060", 0.6, "#ffd8a0"); wisch(t, 127); });
// 128 Ich hatte nur noch ein einziges Wort
sh(E[128] + 0.3, (t, q) => { zimmerNacht(1); tuer.oeffne(1); tuer.licht.intensity = 5; bettNacht("froh"); zahl(ichPyj, 1, 0.9); papaAmBett(t, "staunen"); const kp = bettKopf();
  kamera.fahrt(q, ZI(-4.7, 3.3, 2.2), ZI(-4.6, 3.3, 2.5), kp.clone().add(V(0, 0.55, 0)), kp.clone().add(V(0, 0.6, 0)), 42); licht(0.4, "#ffb060", 0.6, "#ffd8a0"); wisch(t, 128); });
// 129 „Auch.“ (1 → 0)
sh(E[129] + 0.4, (t, q) => { zimmerNacht(1); tuer.oeffne(1); tuer.licht.intensity = 5; bettNacht(Fg.mund(t) === "reden" ? "reden" : "lachen"); zahl(ichPyj, ichZahl(t), 0.9); papaAmBett(t, "staunen"); const kp = bettKopf();
  kamera.fahrt(q, ZI(-4.7, 3.3, 2.2), ZI(-4.6, 3.3, 2.5), kp.clone().add(V(0, 0.55, 0)), kp.clone().add(V(0, 0.6, 0)), 40); licht(0.4, "#ffb060", 0.6, "#ffd8a0"); wisch(t, 129); });
// 130 Papa sagt nichts, er kann ja nicht mehr
sh(E[130] + 0.1, (t, q) => { zimmerNacht(1); tuer.oeffne(1); tuer.licht.intensity = 5; bettNacht("lachen"); zahl(ichPyj, 0); papaAmBett(t, Math.sin(t * 5) > 0 ? "staunen" : "ernst"); nah(q, papa, 4.4, 0.6, -0.3, 42); licht(0.4, "#ffb060", 0.6, "#ffd8a0"); wisch(t, 130); });
// 131 Nasse Augen, die festeste Umarmung (ich sitze auf, Papa beugt sich zu mir)
const sitzImBett = (ges, o = {}) => { stell(ichPyj, ZI(-2.2, 0.65, 3.4), RZ + Math.PI, { sitz: 1, ges, ...o }); };
sh(E[131] + 0.2, (t, q) => { zimmerNacht(1); tuer.oeffne(1); tuer.licht.intensity = 5;
  stell(papa, ZI(1.6, 0, 1.6), RZ - Math.PI / 2, { ges: "weinen", neig: 0.3, armL: 1.25, armR: 1.25, armLz: -0.55, armRz: -0.55 }); papa.updateMatrixWorld(true); zahl(papa, 0);
  stell(ichPyj, papa.localToWorld(V(0, 0, 1.55)), RZ + Math.PI / 2, { ges: "lachen", armL: 1.15, armR: 1.15, armLz: -0.5, armRz: -0.5 }); zahl(ichPyj, 0);
  kamera.fahrt(q, ZI(0.2, 4.2, -3.6), ZI(0.3, 4.0, -3.0), ZI(0.9, 3.2, 1.6), ZI(0.9, 3.3, 1.6), 46); licht(0.4, "#ffb060", 0.6, "#ffd8a0"); wisch(t, 131); });
// 132 Die Kirchturmuhr schlägt zwölf (Blick aus dem Fenster)
sh(E[132] + 0.2, (t, q) => { zimmerNacht(1); turm.licht.intensity = 22; Rq.weckerZeichnen("00:00", true); uhrzeit("0:00", "12:00 AM");
  kamera.fahrt(q, ZI(0.4, 4.4, -2.0), ZI(0.5, 4.6, -3.4), ZI(1.4, 10, -46), ZI(1.5, 13, -46), 40); licht(0.35, "#ffb060", 0.5, "#8aa0ff"); wisch(t, 132); });
// 133 Über unseren Köpfen leuchtet es auf: Hundert. Und hundert.
const zusammenImBett = (t, gesI, gesP, o = {}) => { sitzImBett(gesI, o.ich ?? {}); ichPyj.rotation.y = RZ + 2.9; zahl(ichPyj, ichZahl(t), o.g ?? 0.8);
  stell(papa, ZI(-0.6, 0.65, 2.0), RZ + 0.9, { sitz: 1, kopfDreh: -0.7, ges: gesP, ...(o.papa ?? {}) }); zahl(papa, papaZahl(t), o.g ?? 0.8); };
sh(E[133] + 0.2, (t, q) => { zimmerNacht(1); tuer.oeffne(1); tuer.licht.intensity = 4; const auf = t > wz("hundert", 133); zusammenImBett(t, auf ? "lachen" : "froh", auf ? "lachen" : "weinen", { g: auf ? 0.8 + 0.25 * Math.max(0, 1 - (t - wz("hundert", 133)) * 2) : 0.8 });
  kamera.fahrt(q, ZI(1.8, 4.8, 4.6), ZI(1.6, 4.8, 4.2), ZI(-1.4, 4.2, 2.6), ZI(-1.4, 4.6, 2.6), 54); licht(0.45, "#ffb060", 0.6, "#ffd8a0"); wisch(t, 133); });
// 134 Papa lacht: „Na, dann erzähl mal. Wie war dein Tag?“
sh(E[134] + 0.1, (t, q) => { zimmerNacht(1); tuer.oeffne(1); tuer.licht.intensity = 4; zusammenImBett(t, "froh", Fg.mund(t) === "reden" ? "reden" : "lachen"); nah(q, papa, 4.8, -0.8, -0.3, 44); licht(0.45, "#ffb060", 0.6, "#ffd8a0"); wisch(t, 134); });
// 135 Ich erzähle: Drache, Eiffelturm, Brokkoli, Bus
sh(E[135] + 0.1, (t, q) => { zimmerNacht(1); tuer.oeffne(1); tuer.licht.intensity = 4; zusammenImBett(t, Fg.mund(t) === "reden" ? "lachen" : "reden", "lachen", { ich: { armL: 1.2 + 0.7 * Math.sin(t * 6), armR: 1.2 + 0.7 * Math.sin(t * 6 + 2), armLz: 0.3, armRz: 0.3 } });
  { const k = Fg.kopfPos(ichPyj); kamera.fahrt(q, ZI(-1.0, 4.2, -1.4), ZI(-1.2, 4.1, -0.9), k.clone().add(V(0, 0.2, 0)), k.clone().add(V(0, 0.2, 0)), 46); } licht(0.45, "#ffb060", 0.6, "#ffd8a0"); wisch(t, 135); });
// 136 Wir reden, bis wir beide wieder bei null sind
sh(E[136] + 0.2, (t, q) => { zimmerNacht(1); tuer.oeffne(0.15); tuer.licht.intensity = 1; zusammenImBett(t, "lachen", "lachen", { ich: { armR: 1.4 + 0.5 * Math.sin(t * 5) } });
  kamera.fahrt(q, ZI(3.6, 5.6, -4.4), ZI(3.0, 5.2, -3.8), ZI(-1.4, 3.2, 2.8), ZI(-1.4, 3.2, 2.8), 56); licht(0.45, "#ffb060", 0.6, "#ffd8a0"); wisch(t, 136); });
// 137 Seitdem jede Nacht wach bis eine Minute vor zwölf (wieder 23:59, beide mit 3)
sh(E[137] + 0.1, (t, q) => { zimmerNacht(1); tuer.oeffne(1); tuer.licht.intensity = 5; Rq.weckerZeichnen("23:59", true); uhrzeit("23:59", "11:59 PM"); bettNacht("lachen"); zahl(ichPyj, 3); papaAmBett(t, "lachen");
  kamera.fahrt(q, ZI(2.4, 5.6, 5.0), ZI(2.1, 5.4, 4.6), ZI(-1.1, 3.9, 2.4), ZI(-1.1, 3.9, 2.6), 56); licht(0.4, "#ffb060", 0.6, "#ffd8a0"); wisch(t, 137); });
// 138 Man braucht gar keine hundert Wörter (nah, ich lächle)
sh(E[138] + 0.1, (t, q) => { zimmerNacht(1); tuer.oeffne(1); tuer.licht.intensity = 5; Rq.weckerZeichnen("23:59", true); bettNacht("froh"); zahl(ichPyj, 3); papaAmBett(t, "froh"); const kp = bettKopf();
  kamera.fahrt(q, ZI(-4.7, 3.3, 2.2), ZI(-4.6, 3.3, 2.5), kp.clone().add(V(0, 0.55, 0)), kp.clone().add(V(0, 0.6, 0)), 42); licht(0.4, "#ffb060", 0.6, "#ffd8a0"); wisch(t, 138); });
// 139 Manchmal reicht ein einziges (Kamera fährt zurück zum Fenster, Kirchturm und Mond)
sh(DAUER + 1, (t, q) => { zimmerNacht(1); tuer.oeffne(1); tuer.licht.intensity = 5; turm.licht.intensity = 22; Rq.weckerZeichnen("23:59", true); bettNacht("froh"); zahl(ichPyj, 3); papaAmBett(t, "froh");
  kamera.fahrt(q, ZI(-4.6, 5.2, -1.6), ZI(-4.4, 6.8, -4.6), ZI(-1.6, 2.8, 3.0), ZI(-1.4, 3.2, 2.6), 54); licht(0.4, "#ffb060", 0.6, "#ffd8a0"); Z_.vignette = 0.45; });

B.start({
  grund: (t) => { bello.visible = false; ball.visible = false; schein.visible = false; MIAZ.licht.intensity = 0; bus.visible = false; bus2.visible = false; babybett.visible = false; zettel.visible = false; tasse.visible = false; bildPapa.visible = false; gummiHand.visible = false;
    markt.visible = preis.visible = pfosten.visible = false; kaugummi.forEach(b => b.visible = false); sticker.forEach(s => s.visible = false); voegel.forEach(v => v.visible = false);
    MENSA.licht.intensity = 0; MENSA.berg.visible = MENSA.tablett.visible = false; STUDIO.licht.intensity = 0; turm.licht.intensity = 0; tuer.oeffne(0); tuer.licht.intensity = 0;
    Rq.ZIMMER.lichterkette.visible = false; Rq.ZIMMER.mond.intensity = 8; Rq.ZIMMER.licht.color.set("#ffc080"); beine(ich, 0); Al.fernseherAus(); },
});
