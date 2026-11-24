// Horror-Kulissen „Schattental“ (Jonathan 24.11. abends: Hintergrundkulissen mit viel Blut; Issue #43: Blutrot stilisiert –
// erkennbar, aber Flat-Stil, keine realistischen Wunden). Für die Nacht-Defense „Die 13. Glocke“ (konzepte/nacht-defense-storyline.md).
//   import * as HW from "../horrorwelt.js";
//   HW.SCHATTENTAL  Dorf bei Nacht: Hauptstraße mit Häusern, Kapelle mit zugemauertem Glockenturm, Friedhof, Waldrand, roter Mond, Nebel
//   HW.KAPELLE      Innenraum: Bänke, Altar, Kerzen, Glockenseil, Blut an Boden und Wänden
//   HW.WALDWEG      Pfad durch toten Wald mit Blutspur
//   HW.blut(art, groesse, saat) → flaches Decal (spritzer | lache | hand | tropfen | schrift:"TEXT" | spur), fest und flackerfrei
//   HW.nacht()      Licht/Farben für die Szene setzen (pro Bild aufrufen), HW.SCHATTENTAL.glocke (schwingt: .rotation.z)
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import * as O from "./objekte.js";
import * as Wt from "./welt.js";
const { scene } = Wt;

const mat = (c, r = 0.8, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
const rb = (w, h, d, r, m) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2)), m);
const bx = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const zyl = (r0, r1, h, m, s = 16) => new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, s), m);
const an = (g, o, x = 0, y = 0, z = 0) => { o.position.set(x, y, z); g.add(o); return o; };
const zufall = (s = 1) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
const ctex = (w, h, fn, rep = null) => { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); } return t; };

// ---------- Blut (stilisiert) ----------
const ROT = "#a8101a", DUNKEL = "#5a0610", HELL = "#d82a2a";
const BLUT_TEX = new Map();
const blutTex = (art, saat) => { const k = art + saat; if (BLUT_TEX.has(k)) return BLUT_TEX.get(k); const r = zufall(saat * 7 + 3);
  const t = ctex(512, 512, (x, w, h) => {
    const klecks = (cx, cy, rr, farbe) => { x.fillStyle = farbe; x.beginPath(); const n = 14; for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, q = rr * (0.75 + r() * 0.45); i ? x.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q) : x.moveTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } x.closePath(); x.fill(); };
    if (art === "spritzer") { klecks(w / 2, h / 2, 90, ROT); for (let i = 0; i < 26; i++) { const a = r() * 7, d = 100 + r() * 140, s = 6 + r() * 20; klecks(w / 2 + Math.cos(a) * d, h / 2 + Math.sin(a) * d, s, i % 3 ? ROT : DUNKEL); }
      for (let i = 0; i < 7; i++) { const a = r() * 7; x.strokeStyle = ROT; x.lineWidth = 10 + r() * 10; x.lineCap = "round"; x.beginPath(); x.moveTo(w / 2, h / 2); x.lineTo(w / 2 + Math.cos(a) * (120 + r() * 80), h / 2 + Math.sin(a) * (120 + r() * 80)); x.stroke(); }
      klecks(w / 2 - 20, h / 2 - 25, 30, HELL); }
    else if (art === "lache") { klecks(w / 2, h / 2, 190, DUNKEL); klecks(w / 2 + 10, h / 2 + 5, 165, ROT); klecks(w / 2 - 50, h / 2 - 50, 40, HELL); for (let i = 0; i < 6; i++) klecks(w / 2 + (r() - 0.5) * 420, h / 2 + (r() - 0.5) * 420, 10 + r() * 16, ROT); }
    else if (art === "hand") { x.fillStyle = ROT; x.beginPath(); x.ellipse(w / 2, h * 0.62, 80, 95, 0, 0, 7); x.fill(); for (let i = 0; i < 4; i++) { x.save(); x.translate(w / 2 - 60 + i * 40, h * 0.42); x.rotate((i - 1.5) * 0.12); x.beginPath(); x.roundRect(-16, -110, 32, 120, 16); x.fill(); x.restore(); }
      x.save(); x.translate(w / 2 + 92, h * 0.6); x.rotate(0.9); x.beginPath(); x.roundRect(-16, -80, 32, 90, 16); x.fill(); x.restore(); for (let i = 0; i < 5; i++) { x.fillRect(w / 2 - 70 + i * 34, h * 0.7, 10, 60 + r() * 120); x.beginPath(); x.arc(w / 2 - 65 + i * 34, h * 0.7 + 60 + r() * 120, 8, 0, 7); x.fill(); } }
    else if (art === "tropfen") { x.fillStyle = ROT; x.fillRect(0, 0, w, 60); for (let i = 0; i < 12; i++) { const xx = 20 + i * 40 + r() * 15, l = 80 + r() * 330; x.fillRect(xx, 40, 14 + r() * 8, l); x.beginPath(); x.arc(xx + 9, 40 + l, 14, 0, 7); x.fill(); } }
    else if (art === "spur") { for (let i = 0; i < 9; i++) { const yy = h - i * 58, xx = w / 2 + Math.sin(i * 0.9) * 60; klecks(xx, yy, 26 + r() * 14, i % 2 ? ROT : DUNKEL); } x.strokeStyle = ROT; x.lineWidth = 24; x.lineCap = "round"; x.beginPath(); x.moveTo(w / 2, h); for (let i = 0; i < 9; i++) x.lineTo(w / 2 + Math.sin(i * 0.9) * 60, h - i * 58); x.stroke(); }
    else if (art.startsWith("schrift:")) { const s = art.slice(8); x.fillStyle = ROT; let fs = 220; x.font = `900 ${fs}px 'Inter Display', sans-serif`; while (x.measureText(s).width > w * 0.92 && fs > 40) { fs -= 10; x.font = `900 ${fs}px 'Inter Display', sans-serif`; } x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(s, w / 2, h * 0.42);
      const m = x.measureText(s).width; for (let i = 0; i < 10; i++) { const xx = w / 2 - m / 2 + r() * m, l = 40 + r() * 160; x.fillRect(xx, h * 0.42 + fs * 0.3, 8 + r() * 6, l); x.beginPath(); x.arc(xx + 6, h * 0.42 + fs * 0.3 + l, 9, 0, 7); x.fill(); } }
  }); BLUT_TEX.set(k, t); return t; };
// Decal: liegt in der XY-Ebene (für Wände). Für den Boden: .rotation.x = -Math.PI / 2
export const blut = (art = "spritzer", groesse = 2, saat = 1) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(groesse, groesse), new THREE.MeshStandardMaterial({ map: blutTex(art, saat), transparent: true, depthWrite: false, roughness: 0.25, metalness: 0.1, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
  m.renderOrder = 2; return m; };
const amBoden = (g, art, gr, saat, x, z, y = 0.08) => { const b = blut(art, gr, saat); b.rotation.x = -Math.PI / 2; b.rotation.z = saat; an(g, b, x, y, z); return b; };

// ---------- Bauteile ----------
const steinTex = ctex(256, 256, (x, w, h) => { x.fillStyle = "#6a6a72"; x.fillRect(0, 0, w, h); for (let j = 0; j < 8; j++) for (let i = 0; i < 4; i++) { x.fillStyle = ["#5e5e66", "#72727a", "#66666e"][(i + j) % 3]; x.fillRect(i * 64 + (j % 2) * 32 + 2, j * 32 + 2, 60, 28); } }, [2, 4]);
const grabstein = (saat) => { const g = new THREE.Group(), r = zufall(saat), m = mat("#8a8a90", 0.9); const t = r();
  if (t < 0.5) { an(g, rb(1.2, 1.8, 0.35, 0.3, m), 0, 0.9, 0); } else if (t < 0.8) { an(g, bx(0.25, 2.2, 0.25, m), 0, 1.1, 0); an(g, bx(1.2, 0.25, 0.25, m), 0, 1.6, 0); } else { an(g, rb(1.6, 0.9, 0.5, 0.1, m), 0, 0.45, 0); }
  g.rotation.set((r() - 0.5) * 0.15, (r() - 0.5) * 0.4, (r() - 0.5) * 0.2); return g; };
const toterBaum = (saat, gr = 1) => { const g = new THREE.Group(), r = zufall(saat), m = mat("#1a1612", 0.95);
  const ast = (p, richtung, laenge, dicke, tiefe) => { const e = p.clone().add(richtung.clone().multiplyScalar(laenge)); const c = zyl(dicke * 0.7, dicke, laenge, m, 6); c.position.copy(p).add(e).multiplyScalar(0.5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), richtung.clone().normalize()); g.add(c);
    if (tiefe > 0) for (let i = 0; i < 2 + (r() < 0.4 ? 1 : 0); i++) { const d = richtung.clone().add(new THREE.Vector3((r() - 0.5) * 1.6, 0.2 + r() * 0.4, (r() - 0.5) * 1.6)).normalize(); ast(e, d, laenge * (0.55 + r() * 0.2), dicke * 0.6, tiefe - 1); } };
  ast(new THREE.Vector3(0, 0, 0), new THREE.Vector3((r() - 0.5) * 0.2, 1, (r() - 0.5) * 0.2).normalize(), 6, 0.5, 3); g.scale.setScalar(gr); return g; };
const kerze = (h = 0.8) => { const g = new THREE.Group(); an(g, zyl(0.12, 0.12, h, mat("#f0e8d0", 0.6), 10), 0, h / 2, 0); const f = an(g, new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 2.2, 0.8) })), 0, h + 0.1, 0); f.scale.set(1, 1.8, 1); return g; };
const nebelTex = ctex(256, 128, (x, w, h) => { x.save(); x.scale(1, h / w); const gr = x.createRadialGradient(w / 2, w / 2, 4, w / 2, w / 2, w / 2 - 2); gr.addColorStop(0, "rgba(190,195,215,0.5)"); gr.addColorStop(0.6, "rgba(190,195,215,0.18)"); gr.addColorStop(1, "rgba(190,195,215,0)"); x.fillStyle = gr; x.fillRect(0, 0, w, w); x.restore(); });
const nebel = (g, n, bereich, saat, hoehe = 1.5) => { const r = zufall(saat), m = new THREE.MeshBasicMaterial({ map: nebelTex, transparent: true, depthWrite: false, fog: false, opacity: 0.35, toneMapped: false });
  for (let i = 0; i < n; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(26 + r() * 20, 6 + r() * 4), m); p.position.set((r() - 0.5) * bereich[0], hoehe + r() * 1.5, (r() - 0.5) * bereich[1]); p.rotation.y = r() * Math.PI; p.renderOrder = 3; g.add(p); } };

// Kapelle mit Glockenturm (Turmfenster zugemauert, Glocke sichtbar durch Lücke)
const kapelle = () => { const g = new THREE.Group(), stein = new THREE.MeshStandardMaterial({ map: steinTex, roughness: 0.95 }), dach = mat("#2a2228", 0.8);
  an(g, bx(14, 10, 22, stein), 0, 5, 0); const d = an(g, new THREE.Mesh(new THREE.CylinderGeometry(0.01, 10.5, 7, 4, 1), dach), 0, 13.5, 0); d.rotation.y = Math.PI / 4; d.scale.set(1, 1, 1.55);
  an(g, bx(6, 22, 6, stein), 0, 11, 12); const sp = an(g, new THREE.Mesh(new THREE.ConeGeometry(4.6, 10, 4), dach), 0, 27, 12); sp.rotation.y = Math.PI / 4;
  an(g, bx(0.25, 2.6, 0.25, mat("#2a2a2a", 0.5, 0.6)), 0, 33.3, 12); an(g, bx(1.4, 0.25, 0.25, mat("#2a2a2a", 0.5, 0.6)), 0, 33.6, 12);
  const glocke = new THREE.Group(); glocke.position.set(0, 19.5, 12); g.add(glocke); const gl = an(glocke, new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.4, 2.0, 20, 1, true), mat("#8a6a2a", 0.35, 0.8)), 0, -1.2, 0); gl.material.side = THREE.DoubleSide; an(glocke, new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat("#8a6a2a", 0.35, 0.8)), 0, -0.2, 0);
  for (const s of [-1, 1]) { an(g, bx(0.3, 4.5, 6.2, stein), s * 3, 19.5, 12); } an(g, bx(6.2, 0.4, 6.2, stein), 0, 17.2, 12);
  const zu = an(g, bx(3.2, 2.0, 0.4, mat("#4a4a52", 0.95)), 0, 18.6, 15.1); const zu2 = an(g, bx(3.2, 1.0, 0.4, mat("#4a4a52", 0.95)), 0, 21.3, 15.1);   // zugemauert, nur Spalt
  const fM = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.4, 0.6) }); for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const f = an(g, rb(0.1, 3.2, 1.6, 0.05, fM), s * 7.06, 5, -6 + i * 6); }
  an(g, rb(3.2, 5.5, 0.4, 0.1, mat("#3a2014", 0.8)), 0, 2.75, 15.05); g.userData.glocke = glocke; g.userData.fensterMat = fM; return g; };

const huetteFarbe = ["#6a5a6a", "#5a5a4a", "#4a5a62", "#6a4a4a", "#55505a", "#4a4a5a"];
// ---------- Kulisse 1: SCHATTENTAL (Dorf bei Nacht) bei (-2400, 0, -2400) ----------
export const SCHATTENTAL = (() => { const g = new THREE.Group(); g.position.set(-2400, 0, -2400); scene.add(g); const D = { g }; const r = zufall(41);
  const boden = new THREE.Mesh(new THREE.PlaneGeometry(900, 900).rotateX(-Math.PI / 2), mat("#22301e", 0.98)); boden.position.y = 0.04; g.add(boden);
  const str = an(g, new THREE.Mesh(new THREE.PlaneGeometry(10, 220).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: ctex(128, 512, (x, w, h) => { x.fillStyle = "#3a3832"; x.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { x.fillStyle = i % 2 ? "#44423a" : "#2e2c28"; x.fillRect((i * 37) % w, (i * 71) % h, 6, 6); } }, [1, 4]), roughness: 0.95 })), 0, 0.06, 0);
  // Häuser beidseitig (dunkle Fassaden, einige Fenster warm)
  let k = 0; for (const sx of [-1, 1]) for (let z = -90; z <= 60; z += 15) { const h = O.reihenhaus({ wand: huetteFarbe[k % huetteFarbe.length], stock: 2 + (k % 2), breite: 12, tiefe: 10, dach: k % 3 ? "giebel" : "flach", tuer: "#2a1a14", saat: 90 + k }); h.position.set(sx * 13, 0.05, z); h.rotation.y = -sx * Math.PI / 2; g.add(h); k++; }
  D.haeuser = []; g.children.forEach(c => { if (c.position && Math.abs(Math.abs(c.position.x) - 13) < 0.01) D.haeuser.push(c); });
  // Laternen (gelblich, einige aus) und Zäune
  D.laternen = []; for (let z = -84; z <= 60; z += 24) for (const sx of [-1, 1]) { const l = O.laterne({ hoehe: 6, an: true, punktlicht: false }); l.position.set(sx * 6.4, 0.06, z + (sx > 0 ? 12 : 0)); g.add(l); D.laternen.push(l); }
  // Blut im Dorf
  amBoden(g, "lache", 6, 3, -2, 18); amBoden(g, "spur", 8, 4, 1.5, 6); amBoden(g, "spritzer", 5, 15, 2, 32); amBoden(g, "lache", 5, 16, 1, -8); amBoden(g, "spur", 8, 17, -1, -34); amBoden(g, "spritzer", 3, 5, 3, -22); amBoden(g, "lache", 3, 6, -3.5, -48); amBoden(g, "spur", 6, 7, 0, -60);
  for (const [x, y, z, ry, art, gr, s] of [[-7.95, 2.6, 16, Math.PI / 2, "hand", 1.4, 8], [-7.95, 4.5, 0, Math.PI / 2, "spritzer", 3.2, 9], [7.95, 3.0, -15, -Math.PI / 2, "tropfen", 3, 10], [7.95, 5, 30, -Math.PI / 2, "schrift:HILFE", 5, 11], [-7.95, 3.5, -45, Math.PI / 2, "spritzer", 2.6, 12], [7.95, 2.4, 45, -Math.PI / 2, "hand", 1.2, 13]]) { const b = blut(art, gr, s); b.rotation.y = ry; an(g, b, x, y, z); }
  // Kapelle am Ende der Straße, Friedhof davor
  const kap = kapelle(); kap.position.set(0, 0.05, -125); kap.rotation.y = 0; g.add(kap); D.kapelle = kap; D.glocke = kap.userData.glocke;
  const kb = blut("schrift:13", 4, 14); an(g, kb, 0, 7.5, -125 + 11.02 + 4.02);   // „13“ in Blut über der Tür
  for (let i = 0; i < 28; i++) { const gs = grabstein(i + 3); gs.position.set((i % 7 - 3) * 3.4 + (r() - 0.5), 0.05, -100 + Math.floor(i / 7) * 3.6 + (r() - 0.5)); g.add(gs); if (i % 5 === 0) amBoden(g, "lache", 1.6, 20 + i, gs.position.x, gs.position.z + 1.2); }
  for (let i = 0; i < 9; i++) { const z = O.zaun({ laenge: 4 }); z.position.set(-14 + i * 3.5, 0.05, -86); g.add(z); }
  // Waldrand ringsum (tote Bäume), dichter hinten
  for (let i = 0; i < 140; i++) { const a = r() * Math.PI * 2, d = 40 + r() * 120; const x = Math.cos(a) * d * 1.2, z = -40 + Math.sin(a) * d * 1.4; if (Math.abs(x) < 24 && z > -110 && z < 70) continue; const b = toterBaum(i + 7, 0.8 + r() * 0.8); b.position.set(x, 0.04, z); b.rotation.y = r() * 7; g.add(b); }
  // roter Mond (weit hinten über der Kapelle) und Nebel
  const mond = an(g, new THREE.Mesh(new THREE.CircleGeometry(30, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.95, 0.1, 0.07), fog: false, toneMapped: false })), 40, 170, -620); D.mond = mond;
  const halo = an(g, new THREE.Mesh(new THREE.CircleGeometry(70, 48), new THREE.MeshBasicMaterial({ color: "#6a0a0a", transparent: true, opacity: 0.35, depthWrite: false, fog: false, toneMapped: false })), 40, 170, -622);
  nebel(g, 70, [120, 260], 5, 0.6);
  D.licht = new THREE.PointLight("#ff6a4a", 0, 120, 1.6); D.licht.position.set(0, 30, -60); g.add(D.licht);
  D.pos = (x, y, z) => new THREE.Vector3(g.position.x + x, y, g.position.z + z); return D; })();

// ---------- Kulisse 2: KAPELLE innen bei (-2400, 0, -3000) ----------
export const KAPELLE = (() => { const g = new THREE.Group(); g.position.set(-2400, 0, -3000); scene.add(g); const R = { g, B: 14, T: 24, H: 10 };
  const stein = new THREE.MeshStandardMaterial({ map: steinTex, roughness: 0.95 }); an(g, bx(14, 0.2, 24, mat("#3a3436", 0.9)), 0, -0.05, 0);
  for (const [w, x, z, ry] of [[24, -7, 0, Math.PI / 2], [24, 7, 0, Math.PI / 2], [14, 0, -12, 0], [14, 0, 12, 0]]) { const m = an(g, bx(w, 10, 0.4, stein), x, 5, z); m.rotation.y = ry; }
  an(g, bx(14, 0.3, 24, mat("#1e1a1c", 0.9)), 0, 10.1, 0);
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { const b = new THREE.Group(); b.position.set(s * 3.4, 0, -4 + i * 2.6); g.add(b); an(b, rb(4.2, 0.25, 1.0, 0.06, mat("#3a2418", 0.8)), 0, 1.2, 0); an(b, rb(4.2, 1.4, 0.2, 0.06, mat("#3a2418", 0.8)), 0, 1.9, 0.45); for (const x of [-1.9, 1.9]) an(b, bx(0.2, 1.2, 1.0, mat("#2a1810")), x, 0.6, 0); }
  an(g, rb(4.5, 1.6, 1.8, 0.1, mat("#d8d0c4", 0.8)), 0, 0.8, -9.5); an(g, bx(4.6, 0.12, 1.9, mat("#7a1018", 0.8)), 0, 1.66, -9.5);
  for (let i = 0; i < 7; i++) { const k = kerze(0.6 + (i % 3) * 0.3); k.position.set(-1.8 + i * 0.6, 1.72, -9.6); g.add(k); }
  an(g, bx(0.25, 5, 0.25, mat("#2a2a2a", 0.5, 0.6)), 0, 6.5, -11.6); an(g, bx(2.2, 0.25, 0.25, mat("#2a2a2a", 0.5, 0.6)), 0, 7.8, -11.6);
  const seil = an(g, zyl(0.06, 0.06, 8.5, mat("#b8945a", 0.9), 6), 4.5, 6, -6); R.seil = seil;
  for (const [x, y, z, ry, art, gr, s] of [[-6.78, 3, -2, Math.PI / 2, "tropfen", 3, 31], [6.78, 4, 3, -Math.PI / 2, "schrift:LÄUTE", 4.5, 32], [0, 6, -11.78, 0, "spritzer", 4, 33], [-6.78, 2.2, 6, Math.PI / 2, "hand", 1.3, 34]]) { const b = blut(art, gr, s); b.rotation.y = ry; an(g, b, x, y, z); }
  amBoden(g, "spur", 6, 35, 0, 4, 0.07); amBoden(g, "lache", 3.5, 36, 0.5, -7, 0.07); amBoden(g, "spritzer", 2.4, 37, -3, 8, 0.07);
  const fM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.2, 0.25, 0.25) }); for (const s of [-1, 1]) for (let i = 0; i < 3; i++) an(g, rb(0.1, 3.2, 1.5, 0.05, fM), s * 6.75, 5.5, -7 + i * 6);
  R.licht = new THREE.PointLight("#ffb070", 0, 30, 1.6); R.licht.position.set(0, 4, -8); g.add(R.licht);
  R.pos = (x, y, z) => new THREE.Vector3(g.position.x + x, y, g.position.z + z); return R; })();

// ---------- Kulisse 3: WALDWEG bei (-3000, 0, -2400) ----------
export const WALDWEG = (() => { const g = new THREE.Group(); g.position.set(-2900, 0, -2400); scene.add(g); const D = { g }; const r = zufall(77);
  an(g, new THREE.Mesh(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2), mat("#1e2618", 0.98)), 0, 0.04, 0);
  an(g, new THREE.Mesh(new THREE.PlaneGeometry(4, 200).rotateX(-Math.PI / 2), mat("#3a3022", 0.95)), 0, 0.06, 0);
  for (let i = 0; i < 160; i++) { const x = (r() < 0.5 ? -1 : 1) * (4 + r() * 60), z = -100 + r() * 200; const b = toterBaum(200 + i, 0.7 + r() * 0.9); b.position.set(x, 0.04, z); b.rotation.y = r() * 7; g.add(b); }
  for (let i = 0; i < 6; i++) amBoden(g, i % 2 ? "spur" : "lache", 3 + r() * 2, 50 + i, (r() - 0.5) * 2, -60 + i * 22, 0.08);
  for (let i = 0; i < 5; i++) { const b = blut(i % 2 ? "hand" : "spritzer", 1.6, 60 + i); const x = (i % 2 ? 1 : -1) * 4.5; b.position.set(x, 2.5, -40 + i * 18); b.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2; g.add(b); }
  const mond = an(g, new THREE.Mesh(new THREE.CircleGeometry(30, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.95, 0.1, 0.07), fog: false, toneMapped: false })), -30, 150, -560);
  nebel(g, 60, [80, 200], 9, 0.5); D.pos = (x, y, z) => new THREE.Vector3(g.position.x + x, y, g.position.z + z); return D; })();

// Licht/Farben für Horror-Nacht (pro Bild): dunkelblau-violett, Mond rot
export const nacht = (staerke = 1) => { Wt.hemi.intensity = 0.55 * staerke; Wt.hemi.color.set("#5a4a7a"); Wt.hemi.groundColor.set("#1a0a10"); Wt.mondLicht.intensity = 0.35 * staerke; Wt.mondLicht.color?.set?.("#ff5a4a"); };
