// Detail-Standbild (Jonathan 24.11.): Keller mit der Mini-Blockstadt auf dem Tisch, ich beuge mich mit der goldenen Lupe darüber.
// Ziel: Detailgrad wie im Vorbild-TikTok (goopie.yt) – helle, satte Farben, viele kleine Dinge.
import * as B from "../folge.js";
import * as O from "../objekte.js";
const { V, sh, blick, licht, Fg, Wt, Z_, THREE } = B;
await B.laden();
const R = (x, y, z) => new THREE.Vector3(6000 + x, y, 6000 + z);
const raum = new THREE.Group(); raum.position.copy(R(0, 0, 0)); Wt.scene.add(raum);
const add = (o, x, y, z, ry = 0) => { o.position.set(x, y, z); o.rotation.y = ry; raum.add(o); return o; };
const tex = (w, h, fn, rx = 1, ry = 1) => { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return t; };
const std = (o) => new THREE.MeshStandardMaterial(o);
const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const zyl = (r1, r2, h, m, s = 20) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, s), m);
const zuf = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;
// ---------- Texturen ----------
const ziegel = tex(512, 512, (x, w, h) => { x.fillStyle = "#e8e0d4"; x.fillRect(0, 0, w, h); const r = zuf(7); const zh = h / 12, zw = w / 4;
  for (let j = 0; j < 12; j++) for (let i = -1; i < 5; i++) { const off = j % 2 ? zw / 2 : 0, v = r(); x.fillStyle = `rgb(${168 + v * 40},${78 + v * 22},${52 + v * 14})`; x.fillRect(i * zw + off + 3, j * zh + 3, zw - 6, zh - 6);
    x.fillStyle = "rgba(255,255,255,0.08)"; x.fillRect(i * zw + off + 3, j * zh + 3, zw - 6, 4); x.fillStyle = "rgba(0,0,0,0.12)"; x.fillRect(i * zw + off + 3, j * zh + zh - 7, zw - 6, 4); } }, 6, 3);
const dielen = tex(512, 512, (x, w, h) => { const r = zuf(3); const n = 8; for (let i = 0; i < n; i++) { const v = r(); x.fillStyle = `rgb(${176 + v * 30},${118 + v * 22},${70 + v * 14})`; x.fillRect(i * w / n, 0, w / n, h);
  x.strokeStyle = "rgba(90,50,20,0.25)"; x.lineWidth = 2; for (let k = 0; k < 5; k++) { x.beginPath(); const xx = i * w / n + 8 + r() * (w / n - 16); x.moveTo(xx, 0); x.bezierCurveTo(xx + 6, h * 0.3, xx - 6, h * 0.6, xx + 3, h); x.stroke(); }
  x.fillStyle = "rgba(60,30,10,0.5)"; x.fillRect(i * w / n, 0, 3, h); const fuge = r() * h; x.fillRect(i * w / n, fuge, w / n, 3); } }, 5, 4);
const brett = tex(256, 512, (x, w, h) => { x.fillStyle = "#b27a46"; x.fillRect(0, 0, w, h); const r = zuf(11); x.strokeStyle = "rgba(90,50,20,0.3)"; for (let k = 0; k < 14; k++) { x.beginPath(); const xx = r() * w; x.moveTo(xx, 0); x.bezierCurveTo(xx + 10, h * 0.4, xx - 8, h * 0.7, xx, h); x.stroke(); } x.fillStyle = "rgba(60,30,10,0.45)"; for (let i = 0; i < 4; i++) x.fillRect(i * w / 4, 0, 3, h); }, 8, 1);
const teppich = tex(512, 512, (x, w, h) => { x.fillStyle = "#f4f6fa"; x.fillRect(0, 0, w, h); const n = 8; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { x.fillStyle = (i + j) % 2 ? "#2a5ad8" : "#3a74f0"; x.fillRect(i * w / n + 6, j * h / n + 6, w / n - 12, h / n - 12); }
  x.strokeStyle = "#1a3a9a"; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14); });
const strasse = tex(256, 64, (x, w, h) => { x.fillStyle = "#5a5e68"; x.fillRect(0, 0, w, h); x.fillStyle = "#f4f4f4"; for (let i = 0; i < 6; i++) x.fillRect(i * w / 6 + 6, h / 2 - 2, w / 12, 4); x.fillStyle = "#c8c8cc"; x.fillRect(0, 0, w, 5); x.fillRect(0, h - 5, w, 5); }, 6, 1);
// ---------- Raum: 44 breit (x), 34 tief (z), 20 hoch ----------
const W = 44, T = 34, HH = 20;
add(new THREE.Mesh(new THREE.PlaneGeometry(W, T), std({ map: dielen, roughness: 0.7 })), 0, 0, 0).rotation.x = -Math.PI / 2;
const wandM = std({ map: ziegel, roughness: 0.85 });
add(new THREE.Mesh(new THREE.PlaneGeometry(W, HH), wandM), 0, HH / 2, -T / 2);                        // hinten
add(new THREE.Mesh(new THREE.PlaneGeometry(T, HH), wandM), -W / 2, HH / 2, 0, Math.PI / 2);           // links
// rechts: Wand mit großem Fenster (Himmel draußen)
const wandR = std({ map: ziegel.clone(), roughness: 0.85 }); wandR.map.repeat.set(4, 3);
for (const [z, d] of [[-12.5, 9], [12.5, 9]]) add(new THREE.Mesh(new THREE.PlaneGeometry(d, HH), wandR), W / 2, HH / 2, z, -Math.PI / 2);
add(new THREE.Mesh(new THREE.PlaneGeometry(16, 6), wandR), W / 2, 3, 0, -Math.PI / 2); add(new THREE.Mesh(new THREE.PlaneGeometry(16, 3), wandR), W / 2, HH - 1.5, 0, -Math.PI / 2);
const himmel = tex(512, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#2a7ae8"); g.addColorStop(1, "#8ac8ff"); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = "rgba(255,255,255,0.9)"; const r = zuf(5); for (let k = 0; k < 14; k++) { const cx = r() * w, cy = r() * h * 0.7; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(cx + (r() - 0.5) * 60, cy + (r() - 0.5) * 16, 14 + r() * 18, 0, 7); x.fill(); } } });
add(new THREE.Mesh(new THREE.PlaneGeometry(16, 11), new THREE.MeshBasicMaterial({ map: himmel })), W / 2 + 0.5, 11.5, 0, -Math.PI / 2);
const rahmenM = std({ color: "#f8f8f6", roughness: 0.4 });
for (const z of [-8, 0, 8]) add(box(0.6, 11.4, 0.5, rahmenM), W / 2 - 0.2, 11.5, z); for (const y of [6, 11.5, 17]) add(box(0.6, 0.5, 16.4, rahmenM), W / 2 - 0.2, y, 0);
add(box(1.6, 0.4, 17, rahmenM), W / 2 - 0.6, 5.9, 0);                                                       // Fensterbank
// Decke: Bretter + Querbalken + schräge Sparren
const decke = std({ map: brett, roughness: 0.8 }); add(new THREE.Mesh(new THREE.PlaneGeometry(W, T), decke), 0, HH, 0).rotation.x = Math.PI / 2;
const balkenM = std({ color: "#7a4a26", roughness: 0.75 });
for (let i = 0; i < 6; i++) add(box(W, 1.0, 0.9, balkenM), 0, HH - 0.5, -T / 2 + 3 + i * 5.6);
for (let i = 0; i < 7; i++) { const b = add(box(0.7, 0.7, 16, balkenM), -W / 2 + 3 + i * 6.4, HH - 3.5, -T / 2 + 6); b.rotation.x = 0.55; }
add(box(W, 1.2, 1.2, balkenM), 0, HH - 7, -T / 2 + 0.7);
// Hängelampe (grüner Schirm, warmes Licht)
const lampe = new THREE.Group(); add(lampe, 0, HH - 1, 0);
{ const k = zyl(0.04, 0.04, 6, std({ color: "#202020" })); k.position.y = -3; lampe.add(k); }
{ const s = zyl(0.5, 2.6, 1.6, std({ color: "#2f6a4a", roughness: 0.4, metalness: 0.3, side: THREE.DoubleSide }), 32); s.geometry = new THREE.CylinderGeometry(0.5, 2.6, 1.6, 32, 1, true); s.position.y = -6.6; lampe.add(s);
  const bir = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), new THREE.MeshBasicMaterial({ color: "#fff6dc" })); bir.position.y = -7.3; lampe.add(bir);
  const pl = new THREE.PointLight("#ffd9a0", 60, 40, 1.6); pl.position.y = -7.6; lampe.add(pl); }
// Teppich
add(new THREE.Mesh(new THREE.PlaneGeometry(22, 16), std({ map: teppich, roughness: 0.95 })), 0, 0.03, 2).rotation.x = -Math.PI / 2;
// Tisch mit der Mini-Blockstadt
const TH = 1.75, TB = 14, TT = 8.4; const holz = std({ color: "#b27a46", roughness: 0.6, map: brett.clone() }); holz.map.repeat.set(2, 1);
add(box(TB, 0.4, TT, holz), 0, TH, 2); add(box(TB - 0.6, 0.6, TT - 0.6, std({ color: "#9a6438", roughness: 0.6 })), 0, TH - 0.5, 2);
for (const [x, z] of [[-6.4, -1.4], [6.4, -1.4], [-6.4, 5.4], [6.4, 5.4]]) add(zyl(0.28, 0.22, TH - 0.2, std({ color: "#8a5430" }), 12), x, (TH - 0.2) / 2, z);
add(box(1.6, 0.5, 0.15, std({ color: "#c08a50" })), 0, TH - 0.5, 2 + TT / 2 - 0.25);                            // Schublade
add(box(0.5, 0.15, 0.15, std({ color: "#e0b030", metalness: 0.8, roughness: 0.3 })), 0, TH - 0.5, 2 + TT / 2 - 0.12);
const mini = new THREE.Group(); add(mini, 0, TH + 0.2, 2);
{ const pl = box(TB - 1.2, 0.12, TT - 1.0, std({ color: "#6ac04a", roughness: 0.9 })); pl.position.y = 0.06; mini.add(pl); }
const strM = std({ map: strasse, roughness: 0.85 });
{ const s1 = box(TB - 1.2, 0.02, 0.9, strM); s1.position.set(0, 0.13, 0.4); mini.add(s1); const sm = std({ map: strasse.clone(), roughness: 0.85 }); sm.map.repeat.set(4, 1); const s2 = box(TT - 1.0, 0.02, 0.9, sm); s2.rotation.y = Math.PI / 2; s2.position.set(0.8, 0.135, 0); mini.add(s2); }
for (const [x, z] of [[-2.6, 0.4], [3.6, 0.4]]) { for (let i = 0; i < 6; i++) { const zs = box(0.12, 0.022, 0.8, std({ color: "#f4f4f4" })); zs.position.set(x + i * 0.2, 0.145, z); mini.add(zs); } }
const S = 0.05, r = zuf(9); const hausFarben = [["#f4e8b8", "#d83a3a"], ["#f8c8d4", "#2a4ab8"], ["#cfe8f8", "#d83a3a"], ["#f4f0e8", "#2a6ad8"], ["#f8e0a8", "#c83a3a"], ["#d8e8c8", "#3a5ab0"], ["#f4d8c0", "#2a4ab8"], ["#e8e0f4", "#d84a3a"]];
const hausPlatz = []; for (const [z, ry] of [[-3.15, 0], [-2.05, 0], [1.75, Math.PI], [2.95, 0]]) for (let x = -5.75; x <= 5.8; x += 1.05) { if (Math.abs(x - 0.8) < 0.75) continue; if (z === -2.05 && x > -3.4 && x < -0.9) continue; hausPlatz.push([x + (r() - 0.5) * 0.12, z, ry]); }
hausPlatz.forEach(([x, z, ry], i) => { const [wand, dach] = hausFarben[i % hausFarben.length]; const h = O.haus({ wand, dach, tuer: ["#e8c020", "#d83a3a", "#3a8ad8"][i % 3], breite: 12, tiefe: 10, stock: i % 3 ? 2 : 3 }); h.scale.setScalar(S * (0.9 + r() * 0.2)); h.position.set(x, 0.12, z); h.rotation.y = ry; mini.add(h);
  const z2 = O.zaun({ laenge: 10 }); z2.scale.setScalar(S); z2.position.set(x, 0.12, z + (ry ? -0.5 : 0.5)); mini.add(z2); });
for (let i = 0; i < 22; i++) { const b = O.baum({ art: i % 3 ? "rund" : "spitz", groesse: 0.7 + r() * 0.4, saat: i + 2 }); b.scale.setScalar(S * 0.8); const x = -6 + i * 0.57; if (Math.abs(x - 0.8) < 0.6) continue; b.position.set(x, 0.12, i % 2 ? 1.1 : -0.35); mini.add(b); }
{ const br = O.brunnen(); br.scale.setScalar(S * 1.1); br.position.set(-2.2, 0.12, -1.0); mini.add(br); }
for (let i = 0; i < 4; i++) { const bk = O.bank(); bk.scale.setScalar(S); bk.position.set(-3.4 + i * 0.7, 0.12, -1.5); mini.add(bk); }
[["#e82a2a", -4, 0.2], ["#2a8ae8", 2.2, 0.62], ["#f2c21a", 5.0, 0.2], ["#e85aa8", -1.0, 0.62]].forEach(([f, x, z]) => { const a = O.sportwagen({ farbe: f, groesse: 1.7 }); a.scale.setScalar(S); a.position.set(x, 0.14, z); a.rotation.y = z < 0.4 ? Math.PI / 2 : -Math.PI / 2; mini.add(a); });
{ const bus = O.bus({ farbe: "#f2c21a", text: "LINIE 7" }); bus.scale.setScalar(S); bus.position.set(0.8, 0.14, -2.0); mini.add(bus); }
for (let i = 0; i < 10; i++) { const l = O.laterne({ hoehe: 9, punktlicht: false }); l.scale.setScalar(S); l.position.set(-5.8 + i * 1.25, 0.12, i % 2 ? -0.15 : 0.95); mini.add(l); }
for (let i = 0; i < 8; i++) { const k = O.blumenkuebel({}); k.scale.setScalar(S); k.position.set(-5 + r() * 10, 0.12, (r() > 0.5 ? 1.2 : -1.3)); mini.add(k); }
// winzige Leute in der Mini-Stadt (einer sieht aus wie ich)
const kleineLeute = [["#e8a020", "#2a3a5a", "strubbel", -2.0, -0.5], ["#3a8ad8", "#2a2a30", "kurz", -2.8, -1.2], ["#e84a6a", "#3a3a52", "lang", 3.0, -1.1], ["#5ac05a", "#2a2a30", "kurz", -4.6, 1.3], ["#f4f4f4", "#3a3a52", "kurz", 4.2, 1.2]];
const leute = []; for (const [hemd, hose, frisur, x, z] of kleineLeute) { const p = Fg.figur({ haut: "#f0c8a0", hemd, hose, haare: "#5a3418", frisur, skala: 0.045, struktur: true }); p.position.set(x, 0.12, z); p.rotation.y = r() * 6; mini.add(p); leute.push(p); }
// Regale, Kisten, Fahrrad, Pflanzen
{ const rg = O.regal({ farbe: "#8a5a3a", boeden: 4, saat: 5 }); rg.scale.setScalar(1.4); add(rg, -14, 0, -T / 2 + 1.2); const rg2 = O.regal({ farbe: "#7a4a2a", boeden: 4, saat: 9 }); rg2.scale.setScalar(1.4); add(rg2, -6, 0, -T / 2 + 1.2); }
const kiste = (w, h, d, f) => { const g = new THREE.Group(); const k = box(w, h, d, std({ color: f, roughness: 0.85 })); k.position.y = h / 2; g.add(k); const band = box(w + 0.02, 0.25, d * 0.2, std({ color: "#c8a070" })); band.position.y = h; g.add(band); return g; };
add(kiste(3, 2.2, 2.6, "#c89a62"), 10, 0, -T / 2 + 2); add(kiste(2.4, 1.8, 2.2, "#b8884e"), 10.4, 2.2, -T / 2 + 2.1, 0.2); add(kiste(2.6, 2.0, 2.4, "#d0a46a"), 13.6, 0, -T / 2 + 2.4, -0.15);
{ const f = O.fahrrad({ farbe: "#e83a3a" }); add(f, 16, 0, -T / 2 + 2.5, 0.3); }
for (const [x, z, c] of [[-18, -11, "#3a8a4a"], [18, 10, "#2a7a4a"], [19.5, -6.5, "#4a9a4a"]]) { const t = new THREE.Group(); const topf = zyl(0.9, 0.7, 1.4, std({ color: "#d8704a" }), 18); topf.position.y = 0.7; t.add(topf); for (let i = 0; i < 9; i++) { const bl = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 8), std({ color: c, roughness: 0.7 })); bl.position.set(Math.sin(i * 2.4) * 0.6, 1.8 + (i % 3) * 0.5, Math.cos(i * 2.4) * 0.6); t.add(bl); } add(t, x, 0, z); }
add(zyl(1.2, 1.2, 0.6, std({ color: "#3a8ad8" }), 24), -16, 0.3, 8);                                               // Hocker
for (let i = 0; i < 5; i++) add(box(1.2, 0.3, 0.9, std({ color: ["#e83a3a", "#f2c21a", "#3a8ad8", "#5ac05a", "#e85aa8"][i] })), -16 + (i % 2) * 0.2, 0.75 + i * 0.3, 8, i * 0.4);   // Bücherstapel auf Hocker
// Bilderrahmen an der Wand
for (const [x, c] of [[-14, "#5ab8e8"], [6, "#f2c21a"]]) { add(box(4.2, 3.2, 0.25, std({ color: "#f4f4f4" })), x, 12, -T / 2 + 0.15); add(box(3.6, 2.6, 0.3, std({ color: c })), x, 12, -T / 2 + 0.2); }
// Uhr an der Wand
{ const u = zyl(1.4, 1.4, 0.3, std({ color: "#f4f4f4" }), 32); u.rotation.x = Math.PI / 2; add(u, 14, 13, -T / 2 + 0.2); const z1 = box(0.12, 0.9, 0.1, std({ color: "#202020" })); z1.position.set(14, 13.35, -T / 2 + 0.4); raum.add(z1); const z2 = box(0.6, 0.12, 0.1, std({ color: "#202020" })); z2.position.set(14.25, 13, -T / 2 + 0.4); raum.add(z2); }
// Staubkörnchen im Licht
{ const n = 120, g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), rr = zuf(21); for (let i = 0; i < n; i++) { p[i * 3] = (rr() - 0.5) * 20; p[i * 3 + 1] = 3 + rr() * 12; p[i * 3 + 2] = (rr() - 0.5) * 16; } g.setAttribute("position", new THREE.BufferAttribute(p, 3)); add(new THREE.Points(g, new THREE.PointsMaterial({ color: "#fff4d8", size: 0.09, transparent: true, opacity: 0.8 })), 0, 0, 2); }
// Ich: beuge mich über die Stadt, goldene Lupe in der rechten Hand
const ich = Fg.figur({ haut: "#f0c8a0", hemd: "#e8a020", hose: "#2a3a5a", haare: "#5a3418", frisur: "strubbel", kapuze: true, skala: 0.78, schuhe: "#e8e8e8", struktur: true });
add(ich, 0.4, 0, -3.3);
const FUELL = new THREE.PointLight("#fff2e0", 6, 8, 1.5); Wt.scene.add(FUELL);   // weiches Fülllicht von vorn aufs Gesicht
const lupe = new THREE.Group(); { const gold = std({ color: "#f0b828", metalness: 0.9, roughness: 0.22 }); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.11, 16, 48), gold); lupe.add(ring);
  const glas = new THREE.Mesh(new THREE.CircleGeometry(0.72, 40), new THREE.MeshPhysicalMaterial({ color: "#e8f6ff", transparent: true, opacity: 0.22, roughness: 0.05, transmission: 0.6, clearcoat: 1 })); lupe.add(glas);
  const griff = zyl(0.12, 0.15, 1.5, std({ color: "#7a3a1a", roughness: 0.5 }), 14); griff.position.y = -1.55; lupe.add(griff); const hals = zyl(0.14, 0.14, 0.3, gold, 14); hals.position.y = -0.85; lupe.add(hals); }
raum.add(lupe);
sh(B.F.DAUER + 1, (t) => {
  ich.visible = true; leute.forEach(p => { p.visible = true; Fg.pose(p, {}); }); Fg.pose(ich, { neig: 0.12, kopfNeig: 0.32, armR: 1.35, armRz: 0.25, armL: 0.75, armLz: 0.15, ges: "staunen" });
  ich.updateMatrixWorld(true); const hp = Fg.handPos(ich, true); lupe.position.copy(raum.worldToLocal(hp.clone())).add(new THREE.Vector3(0.1, 0.9, 0.5)); lupe.rotation.set(-1.0, 0.25, 0.1);
  if (t > 2.5) { blick(R(-9, 4, -3.6), R(0, 2, -3.6)); Wt.cam.fov = 50; } else if (t > 1.5) { blick(R(0, 12, 26), R(0, 3, 0)); Wt.cam.fov = 60; } else { const kp = Fg.kopfPos(ich); blick(R(-0.4, TH + 3.4, 17), R(0.3, TH + 1.5, -1.8)); Wt.cam.fov = 29; }
  licht(1.6, "#fff0d8", 0.8, "#a8c8ff"); Wt.hemi.intensity = 1.3; Z_.vignette = 0.15; FUELL.position.copy(Fg.kopfPos(ich)).add(V(-0.5, 0.8, 2.6)); });
B.start({ grund: () => {} });
