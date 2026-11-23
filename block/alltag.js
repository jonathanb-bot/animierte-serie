// Alltag, Bildschirme, Text in der Welt (Jonathan 23.11.: Gestaltungsmittel aus dem Vorbild-Video übernehmen, nie Inhalte).
//   HANDY       Handy mit echtem Bildschirm: zeigt eine zweite Kamera (HANDY.cam) oder eine gezeichnete Seite.
//               Mit B.kamera.insHandy(q, von) fliegt die Kamera in den Bildschirm → nahtloser Schnitt in die Handy-Welt.
//   videowand   Großbildschirm (Platz, Hauswand) und fernseher (Omas Wohnzimmer) zeigen dasselbe Bild wie das Handy.
//   leinwand    beliebiger Text/Zeichnung in der Welt: Tafel, Schild, Preisschild, Fehlermeldung …
//   Räume       Klassenzimmer, Küche, Omas Wohnzimmer (weit weg, eigene Sets) + raumlicht(raum).
//   Effekte     Regenbogen, Luftballons.
import { THREE, RoundedBoxGeometry, scene, renderer, W, H, LOTS } from "./welt.js";
import * as O from "./objekte.js";
import { mergeGeometries as mergeGeo } from "three/addons/utils/BufferGeometryUtils.js";
import { rnd } from "./wesen.js";
const mat = (c, r = 0.7, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
const plastik = c => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.4, clearcoat: 0.5 });
const rb = (w, h, d, r, m) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, r), m);
const bx = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const zyl = (r0, r1, h, m, s = 20) => new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, s), m);
const canvasTex = (w, h, fn, wdh = null) => { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (wdh) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(wdh[0], wdh[1]); } return t; };

// ---------- Leinwand: Text/Zeichnung in der Welt ----------
// leuchtet = true: Bildschirm (unbeleuchtet, hell); false: Tafel/Papier (vom Licht beleuchtet)
export const leinwand = (w, h, { px = 1024, leuchtet = false, hell = 1.5 } = {}) => {
  const c = document.createElement("canvas"); c.width = px; c.height = Math.round(px * h / w); const x = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), leuchtet ? new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(hell, hell, hell), fog: false }) : new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 }));
  m.userData = { x, c, tex, letztes: null, zeichne(fn, schluessel = null) { if (schluessel !== null && schluessel === this.letztes) return; this.letztes = schluessel; fn(x, c.width, c.height); tex.needsUpdate = true; } };
  return m;
};
// Text zeilenweise mittig; zeilen: ["LAVA", ...]; anteil 0…1 schreibt Buchstabe für Buchstabe (Kreide, Tippen)
export const schreibe = (m, zeilen, { bg = "#1f4a3a", fg = "#f4f2e8", font = "900 160px 'Inter Display', Inter, sans-serif", anteil = 1, kreide = false, rahmen = null, ausr = "center" } = {}) => {
  const n = zeilen.join("|").length, sichtbar = Math.floor(n * Math.min(1, Math.max(0, anteil)));
  m.userData.zeichne((x, w, h) => {
    x.fillStyle = bg; x.fillRect(0, 0, w, h);
    if (kreide) { x.globalAlpha = 0.06; for (let i = 0; i < 40; i++) { x.fillStyle = "#fff"; x.beginPath(); x.ellipse((i * 137) % w, (i * 71) % h, 120, 30, i, 0, 7); x.fill(); } x.globalAlpha = 1; }
    if (rahmen) { x.strokeStyle = rahmen; x.lineWidth = w * 0.03; x.strokeRect(0, 0, w, h); }
    x.fillStyle = fg; let fs = parseInt(/(\d+)px/.exec(font)?.[1] || 100); const mitGr = (g) => font.replace(/\d+px/, g + "px"); x.font = font;
    while (fs > 12 && (Math.max(...zeilen.map(z => x.measureText(z).width)) > w * 0.92 || zeilen.length * fs * 1.15 > h * 0.95)) { fs -= 4; x.font = mitGr(fs); }   // passt immer in die Fläche
    x.textAlign = ausr; x.textBaseline = "middle";
    let rest = sichtbar; zeilen.forEach((z, i) => { const s = z.slice(0, Math.max(0, rest)); rest -= z.length + 1; const y = h / 2 + (i - (zeilen.length - 1) / 2) * fs * 1.15;
      x.fillText(s, ausr === "center" ? w / 2 : w * 0.08, y); });
  }, zeilen.join("|") + sichtbar + bg + fg);
};

// ---------- Handy mit echtem Bildschirm ----------
export const HANDY = { schirmW: 0.81, schirmH: 1.44, modus: "welt" };   // Bildschirm 9:16 wie das Video → füllt beim Reinfliegen genau das Bild
HANDY.rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });   // linear HDR wie der Haupt-Render → gleicher Look, Bloom wirkt mit
HANDY.cam = new THREE.PerspectiveCamera(50, W / H, 0.15, 3000);
HANDY.seite = leinwand(HANDY.schirmW, HANDY.schirmH, { px: 720, leuchtet: true, hell: 1.1 });   // gezeichnete Seite (Shop, Nachricht, Fehler …)
HANDY.weltMat = new THREE.MeshBasicMaterial({ map: HANDY.rt.texture, fog: false });
export const handy = new THREE.Group(); scene.add(handy); handy.visible = false;
{ const k = rb(0.94, 1.66, 0.11, 0.1, plastik("#16161c")); handy.add(k);
  const r = rb(0.97, 1.69, 0.08, 0.1, new THREE.MeshStandardMaterial({ color: "#8a8c96", metalness: 0.7, roughness: 0.3 })); r.position.z = -0.02; handy.add(r);
  HANDY.schirm = new THREE.Mesh(new THREE.PlaneGeometry(HANDY.schirmW, HANDY.schirmH), HANDY.weltMat); HANDY.schirm.position.z = 0.058; handy.add(HANDY.schirm);
  const kam = new THREE.Mesh(new THREE.CircleGeometry(0.03, 12), new THREE.MeshBasicMaterial({ color: "#000" })); kam.position.set(0, 0.77, 0.059); handy.add(kam); }
// Seite statt Welt anzeigen: handySeite((x, w, h) => {...}, schluessel)  |  zurück: handyWelt()
export const handySeite = (fn, schluessel = null) => { HANDY.modus = "seite"; HANDY.seite.userData.zeichne(fn, schluessel); HANDY.schirm.material = HANDY.seite.material; };
export const handyWelt = () => { HANDY.modus = "welt"; HANDY.schirm.material = HANDY.weltMat; };
// Was das Handy zeigt (zweite Kamera). fov wie die Einstellung nach dem Reinfliegen, dann ist der Schnitt unsichtbar.
export const handyBlick = (pos, ziel, fov = 50) => { HANDY.cam.position.copy(pos); HANDY.cam.up.set(0, 1, 0); HANDY.cam.lookAt(ziel); HANDY.cam.fov = fov; HANDY.cam.updateProjectionMatrix(); };
// Handy in die Hand einer Figur; schaut zum Ziel (Kopf der Figur = sie liest; Kamera = Zuschauer sieht den Bildschirm)
export const handyHalten = (f, handPos, kopfPos, { rechts = true, zu = null, abst = 0.55 } = {}) => {
  const p = handPos(f, rechts, -1.95, 0.35); const k = zu ?? kopfPos(f); handy.visible = true; HANDY.arm = rechts ? f.userData.armR : f.userData.armL;
  const sk = f.scale.x * 1.15; handy.position.copy(p); handy.scale.setScalar(sk); handy.up.set(0, 1, 0); handy.lookAt(k); handy.translateZ(abst * sk); handy.translateY(0.35 * sk);   // vor der Hand, Hand verdeckt den Bildschirm nicht
};

// ---------- Großbildschirm + Fernseher (zeigen dasselbe wie das Handy) ----------
export const videowand = new THREE.Group(); scene.add(videowand); videowand.visible = false;
{ const r = rb(9.6, 16.6, 0.8, 0.2, mat("#202430", 0.4, 0.5)); r.position.y = 14; videowand.add(r);
  const s = new THREE.Mesh(new THREE.PlaneGeometry(9, 16), HANDY.weltMat); s.position.set(0, 14, 0.42); videowand.add(s); HANDY.wandSchirm = s;
  for (const x of [-3, 3]) { const p = zyl(0.35, 0.45, 6, mat("#3a3e48", 0.4, 0.6), 12); p.position.set(x, 3, -0.2); videowand.add(p); }
  const fuss = rb(9, 0.6, 3, 0.15, mat("#3a3e48", 0.5, 0.4)); fuss.position.y = 0.3; videowand.add(fuss); }

// ---------- Räume (weit weg). Lokale Koordinaten: Boden y = 0, Rückwand bei z = -T/2, Kamera meist von +z ----------
export const RAUM = {};
const raum = (name, x, z, B, T, Hh, { wandU, wandO, boden, decke = "#f4f2ee" }) => {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); const R = { g, B, T, H: Hh };
  const bo = bx(B, 0.2, T, boden instanceof THREE.Material ? boden : mat(boden, 0.75)); bo.position.y = -0.05; g.add(bo);
  const de = bx(B, 0.2, T, mat(decke, 0.9)); de.position.y = Hh + 0.1; g.add(de);
  const wand = (w, xx, zz, ry) => { const u = bx(w, Hh * 0.42, 0.3, mat(wandU, 0.85)); u.position.set(xx, Hh * 0.21, zz); u.rotation.y = ry; g.add(u);
    const o = bx(w, Hh * 0.58, 0.3, mat(wandO, 0.9)); o.position.set(xx, Hh * 0.71, zz); o.rotation.y = ry; g.add(o);
    const l = bx(w, 0.18, 0.4, mat("#ffffff", 0.6)); l.position.set(xx, Hh * 0.42, zz); l.rotation.y = ry; g.add(l); };
  wand(B, 0, -T / 2, 0); wand(T, -B / 2, 0, Math.PI / 2); wand(T, B / 2, 0, Math.PI / 2); wand(B, 0, T / 2, 0);
  // Deckenlampen (leuchten)
  for (const lx of [-B / 4, B / 4]) { const p = bx(B * 0.22, 0.08, 1.2, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.5, 1.45) })); p.position.set(lx, Hh - 0.02, 0); g.add(p); }
  R.lampe = new THREE.Vector3(x, Hh - 1, z); RAUM[name] = R; return R;
};
const fenster = (R, xx, y, zz, ry, w = 3, h = 3) => { const f = new THREE.Group(); const glas = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: canvasTex(128, 128, (x) => { const g = x.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, "#7ec4ff"); g.addColorStop(1, "#d8f0ff"); x.fillStyle = g; x.fillRect(0, 0, 128, 128); x.fillStyle = "#ffffff"; x.globalAlpha = 0.8; x.beginPath(); x.ellipse(40, 44, 22, 9, 0, 0, 7); x.ellipse(90, 70, 26, 10, 0, 0, 7); x.fill(); }), color: new THREE.Color(1.6, 1.6, 1.6), fog: false }));
  f.add(glas); for (const [ww, hh, px, py] of [[w + 0.3, 0.2, 0, h / 2], [w + 0.3, 0.2, 0, -h / 2], [0.2, h, -w / 2, 0], [0.2, h, w / 2, 0], [0.12, h, 0, 0]]) { const r = bx(ww, hh, 0.2, mat("#ffffff", 0.5)); r.position.set(px, py, 0.05); f.add(r); }
  f.position.set(xx, y, zz); f.rotation.y = ry; R.g.add(f); return f; };
const streifen = (a, b, n = 8) => canvasTex(256, 256, (x, w, h) => { for (let i = 0; i < n; i++) { x.fillStyle = i % 2 ? b : a; x.fillRect(0, i * h / n, w, h / n); } });
const kacheln = (a, b, n = 8) => canvasTex(256, 256, (x, w, h) => { for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { x.fillStyle = (i + j) % 2 ? b : a; x.fillRect(i * w / n, j * h / n, w / n, h / n); } x.strokeStyle = "rgba(0,0,0,0.08)"; x.lineWidth = 2; for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * w / n, 0); x.lineTo(i * w / n, h); x.moveTo(0, i * h / n); x.lineTo(w, i * h / n); x.stroke(); } }, [3, 3]);
const holzTex = (c1, c2) => canvasTex(256, 256, (x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? c1 : c2; x.fillRect(0, i * h / 8, w, h / 8); x.fillStyle = "rgba(0,0,0,0.06)"; x.fillRect((i * 97) % w, i * h / 8, 3, h / 8); } }, [3, 3]);

// Klassenzimmer: Tafel (KLASSE.tafel = leinwand), Lehrerpult mit Apfel, 3×3 Schülertische, Uhr, Fenster links
export const KLASSE = raum("klasse", -1400, 600, 16, 14, 7, { wandU: "#7fd0c0", wandO: "#f6f0dc", boden: new THREE.MeshStandardMaterial({ map: kacheln("#eef2f4", "#dfe6ea", 8), roughness: 0.6 }) });
{ const g = KLASSE.g; const holz = mat("#c89a62", 0.6);
  KLASSE.tafel = leinwand(8, 3.2, { px: 1600 }); KLASSE.tafel.position.set(0, 3.9, -6.82); g.add(KLASSE.tafel); schreibe(KLASSE.tafel, [""], { kreide: true });
  const rah = rb(8.5, 3.7, 0.2, 0.06, holz); rah.position.set(0, 3.9, -6.95); g.add(rah); const ab = bx(8.2, 0.12, 0.35, holz); ab.position.set(0, 2.25, -6.75); g.add(ab);
  const pult = new THREE.Group(); const pl = rb(4, 0.25, 1.8, 0.06, holz); pl.position.y = 2.2; pult.add(pl); const vo = rb(3.9, 2.0, 0.15, 0.04, mat("#b88a52", 0.6)); vo.position.set(0, 1.1, 0.8); pult.add(vo);
  for (const sx of [-1.8, 1.8]) { const s = bx(0.2, 2.1, 1.6, holz); s.position.set(sx, 1.05, 0); pult.add(s); }
  const apfel = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 14), new THREE.MeshPhysicalMaterial({ color: "#e02a2a", roughness: 0.3, clearcoat: 0.8 })); apfel.position.set(1.3, 2.6, 0.2); pult.add(apfel);
  const stiel = zyl(0.03, 0.03, 0.2, mat("#5a3a1a"), 6); stiel.position.set(1.3, 2.92, 0.2); pult.add(stiel);
  const buch = rb(1.0, 0.18, 0.7, 0.03, mat("#3a6ac8", 0.6)); buch.position.set(-1, 2.42, 0); buch.rotation.y = 0.3; pult.add(buch);
  pult.position.set(3.6, 0, -4.4); g.add(pult); KLASSE.pult = pult;
  const farben = ["#4a8ae8", "#e85a8a", "#8a5ae8", "#e8a83a", "#3ab88a", "#e8603a", "#5ac8e8", "#c84ae8", "#9ad84a"];
  KLASSE.plaetze = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const t = new THREE.Group(); const pl = rb(2.4, 0.18, 1.5, 0.05, mat("#f2ead8", 0.5)); pl.position.y = 1.85; t.add(pl);
    for (const [lx, lz] of [[-1.05, -0.6], [1.05, -0.6], [-1.05, 0.6], [1.05, 0.6]]) { const b = zyl(0.06, 0.06, 1.8, mat("#9aa0a8", 0.4, 0.6), 8); b.position.set(lx, 0.9, lz); t.add(b); }
    const st = new THREE.Group(); const sit = rb(1.3, 0.16, 1.2, 0.05, mat(farben[i * 3 + j], 0.5)); sit.position.y = 1.2; st.add(sit); const le = rb(1.3, 1.2, 0.14, 0.05, mat(farben[i * 3 + j], 0.5)); le.position.set(0, 1.9, 0.6); st.add(le);
    for (const [lx, lz] of [[-0.55, -0.5], [0.55, -0.5], [-0.55, 0.5], [0.55, 0.5]]) { const b = zyl(0.05, 0.05, 1.2, mat("#9aa0a8", 0.4, 0.6), 8); b.position.set(lx, 0.6, lz); st.add(b); }
    st.position.z = 1.2; t.add(st); t.position.set(-4.2 + i * 4.2, 0, -1 + j * 3.2); g.add(t); KLASSE.plaetze.push({ x: KLASSE.g.position.x - 4.2 + i * 4.2, z: KLASSE.g.position.z - 1 + j * 3.2 + 1.2 }); }
  KLASSE.uhr = leinwand(1.2, 1.2, { px: 256 }); KLASSE.uhr.position.set(-6, 5.6, -6.83); g.add(KLASSE.uhr);
  KLASSE.uhr.userData.zeichne((x, w) => { x.fillStyle = "#f6f0dc"; x.fillRect(0, 0, w, w); x.fillStyle = "#fff"; x.beginPath(); x.arc(w / 2, w / 2, w * 0.46, 0, 7); x.fill(); x.lineWidth = 14; x.strokeStyle = "#2a2a30"; x.stroke();
    x.lineCap = "round"; x.lineWidth = 12; x.beginPath(); x.moveTo(w / 2, w / 2); x.lineTo(w / 2, w * 0.2); x.stroke(); x.lineWidth = 9; x.beginPath(); x.moveTo(w / 2, w / 2); x.lineTo(w * 0.72, w * 0.58); x.stroke(); });
  for (const fz of [-3.5, 0.5, 4.5]) fenster(KLASSE, -7.82, 4.2, fz, Math.PI / 2, 2.6, 3);
  const pfl = new THREE.Group(); const topf = zyl(0.5, 0.4, 0.9, mat("#d8704a", 0.7)); topf.position.y = 0.45; pfl.add(topf); for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 10), mat("#4ab05a", 0.7)); b.position.set(Math.cos(i) * 0.3, 1.3 + (i % 3) * 0.35, Math.sin(i) * 0.3); pfl.add(b); }
  pfl.position.set(-7, 0, -6); g.add(pfl); }

// Küche: Tisch mit Müslischale (KUECHE.schale), Stühle, Kühlschrank, Theke, Fenster
export const KUECHE = raum("kueche", -1400, -600, 12, 11, 6.5, { wandU: "#f8d27a", wandO: "#fff6e0", boden: new THREE.MeshStandardMaterial({ map: kacheln("#f4f4f4", "#e04848", 8), roughness: 0.55 }) });
{ const g = KUECHE.g;
  const tisch = new THREE.Group(); const pl = rb(4.2, 0.2, 2.8, 0.06, new THREE.MeshStandardMaterial({ map: streifen("#ffffff", "#e84a4a", 10), roughness: 0.8 })); pl.position.y = 2.2; tisch.add(pl);
  for (const [lx, lz] of [[-1.8, -1.1], [1.8, -1.1], [-1.8, 1.1], [1.8, 1.1]]) { const b = zyl(0.1, 0.1, 2.1, mat("#c89a62", 0.6), 8); b.position.set(lx, 1.05, lz); tisch.add(b); }
  const schale = new THREE.Group(); const sc = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: "#f4f4f8", roughness: 0.3, clearcoat: 0.6, side: THREE.DoubleSide })); schale.add(sc);
  const milch = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24).rotateX(-Math.PI / 2), mat("#fbfaf2", 0.4)); milch.position.y = -0.12; schale.add(milch);
  for (let i = 0; i < 26; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.03, 6, 10), mat(["#f0a030", "#e84a4a", "#4ac84a", "#f0d040", "#8a5ae8"][i % 5], 0.6)); const a = i * 2.4, rr = Math.sqrt(i / 26) * 0.42; r.position.set(Math.cos(a) * rr, -0.08, Math.sin(a) * rr); r.rotation.x = -Math.PI / 2 + (i % 3) * 0.3; schale.add(r); }
  const loeffel = rb(0.1, 0.04, 0.9, 0.02, new THREE.MeshStandardMaterial({ color: "#cfd2d8", metalness: 0.8, roughness: 0.25 })); loeffel.position.set(0.25, 0.1, 0.25); loeffel.rotation.set(-0.5, 0.6, 0); schale.add(loeffel);
  schale.position.set(-0.6, 2.85, 0.3); tisch.add(schale); KUECHE.schale = schale;
  const saft = zyl(0.22, 0.2, 0.7, new THREE.MeshPhysicalMaterial({ color: "#ffb030", roughness: 0.2, transmission: 0.2, clearcoat: 1 }), 16); saft.position.set(0.9, 2.65, -0.2); tisch.add(saft);
  tisch.position.set(0, 0, 0.5); g.add(tisch); KUECHE.tisch = tisch;
  for (const sx of [-2.8, 2.8]) { const st = new THREE.Group(); const s = rb(1.4, 0.18, 1.4, 0.05, mat("#4a8ae8", 0.5)); s.position.y = 1.3; st.add(s); const l = rb(0.16, 1.5, 1.4, 0.05, mat("#4a8ae8", 0.5)); l.position.set(sx > 0 ? 0.65 : -0.65, 2.1, 0); st.add(l);
    for (const [lx, lz] of [[-0.55, -0.55], [0.55, -0.55], [-0.55, 0.55], [0.55, 0.55]]) { const b = zyl(0.06, 0.06, 1.3, mat("#e8e8ec", 0.4), 8); b.position.set(lx, 0.65, lz); st.add(b); } st.position.set(sx, 0, 0.5); g.add(st); }
  const kuehl = rb(2.2, 5.2, 2, 0.15, plastik("#f2f4f8")); kuehl.position.set(4.6, 2.6, -4.3); g.add(kuehl); const gr = rb(0.12, 1.6, 0.15, 0.05, mat("#9aa0a8", 0.3, 0.7)); gr.position.set(3.75, 3.4, -3.25); g.add(gr);
  const theke = rb(6, 2.2, 1.8, 0.06, mat("#7ac0e8", 0.5)); theke.position.set(-2, 1.1, -4.6); g.add(theke); const ap = rb(6.2, 0.15, 2, 0.04, mat("#f4f0e8", 0.4)); ap.position.set(-2, 2.28, -4.6); g.add(ap);
  for (let i = 0; i < 3; i++) { const sch = rb(1.8, 1.4, 0.8, 0.06, mat("#7ac0e8", 0.5)); sch.position.set(-4 + i * 2, 4.8, -5.05); g.add(sch); }
  fenster(KUECHE, 0.6, 4.0, -5.32, 0, 2.6, 2.2); }

// Omas Wohnzimmer: gestreifter Teppich, Sofa, Sessel, Stehlampe, Bücherregal, Bilder, Couchtisch mit Tasse + Kuchen, Fernseher (zeigt das Handy-Bild)
export const STUBE = raum("stube", 1400, 600, 14, 12, 6.5, { wandU: "#c8a8e0", wandO: "#f4e8f8", boden: new THREE.MeshStandardMaterial({ map: holzTex("#c8925a", "#b8824a"), roughness: 0.7 }) });
{ const g = STUBE.g; const holz = mat("#8a5a3a", 0.6);
  const tep = new THREE.Mesh(new THREE.PlaneGeometry(7, 5).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: streifen("#e85a7a", "#f8f0e8", 12), roughness: 0.95 })); tep.position.set(0, 0.07, 0.5); g.add(tep);
  const sofa = new THREE.Group(); const sm = mat("#4ac8b0", 0.8); const si = rb(5.2, 1.0, 2.2, 0.25, sm); si.position.y = 1.0; sofa.add(si); const le = rb(5.2, 2.0, 0.6, 0.25, sm); le.position.set(0, 2.0, -0.85); sofa.add(le);
  for (const ax of [-2.7, 2.7]) { const a = rb(0.6, 1.6, 2.2, 0.25, sm); a.position.set(ax, 1.3, 0); sofa.add(a); }
  for (const kx of [-1.3, 1.3]) { const k = rb(1.2, 1.0, 0.4, 0.2, mat("#f0d060", 0.85)); k.position.set(kx, 2.0, -0.45); k.rotation.x = -0.2; sofa.add(k); }
  sofa.position.set(0, 0, -3.6); g.add(sofa); STUBE.sofa = sofa;
  const sessel = sofa.clone(); sessel.scale.set(0.42, 1, 1); sessel.position.set(-5.3, 0, 0.5); sessel.rotation.y = Math.PI / 2; g.add(sessel);
  const ct = new THREE.Group(); const cp = rb(3, 0.2, 1.8, 0.06, holz); cp.position.y = 1.3; ct.add(cp); for (const [lx, lz] of [[-1.3, -0.7], [1.3, -0.7], [-1.3, 0.7], [1.3, 0.7]]) { const b = zyl(0.08, 0.08, 1.25, holz, 8); b.position.set(lx, 0.62, lz); ct.add(b); }
  const tasse = zyl(0.22, 0.18, 0.35, plastik("#ffffff"), 16); tasse.position.set(-0.6, 1.58, 0.1); ct.add(tasse); const tee = new THREE.Mesh(new THREE.CircleGeometry(0.2, 16).rotateX(-Math.PI / 2), mat("#a0602a", 0.3)); tee.position.set(-0.6, 1.74, 0.1); ct.add(tee);
  const teller = zyl(0.5, 0.45, 0.06, plastik("#ffffff"), 24); teller.position.set(0.6, 1.43, 0); ct.add(teller); const kuchen = zyl(0.38, 0.38, 0.22, mat("#f0b860", 0.7), 24); kuchen.position.set(0.6, 1.58, 0); ct.add(kuchen);
  ct.position.set(0, 0, 0.3); g.add(ct);
  const lampe = new THREE.Group(); const st = zyl(0.06, 0.06, 4.2, mat("#3a3a40", 0.4, 0.6), 8); st.position.y = 2.1; lampe.add(st); const fu = zyl(0.5, 0.6, 0.12, mat("#3a3a40", 0.4, 0.6), 20); fu.position.y = 0.06; lampe.add(fu);
  const schirm = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.85, 0.9, 20, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 2.1, 1.5), side: THREE.DoubleSide })); schirm.position.y = 4.4; lampe.add(schirm);
  lampe.position.set(-4.6, 0, -4.4); g.add(lampe);
  const regal = new THREE.Group(); const kor = rb(3, 5, 1, 0.06, holz); kor.position.y = 2.5; regal.add(kor);
  for (let b = 0; b < 4; b++) { const br = bx(2.8, 0.1, 0.9, mat("#6a4a2a", 0.6)); br.position.set(0, 0.8 + b * 1.15, 0.08); regal.add(br);
    for (let i = 0; i < 9; i++) { const h = 0.7 + ((i * 7 + b) % 4) * 0.08; const bk = bx(0.24, h, 0.7, mat(["#c83a3a", "#3a7ac8", "#e8c040", "#4ab84a", "#8a4ac8", "#e8803a"][(i + b) % 6], 0.6)); bk.position.set(-1.2 + i * 0.29, 0.85 + b * 1.15 + h / 2, 0.15); regal.add(bk); } }
  regal.position.set(5.2, 0, -5.4); g.add(regal);
  for (const [bxp, by, bw, bh, c] of [[-2.6, 4.6, 1.8, 1.2, "#f0c040"], [2.2, 4.8, 1.4, 1.0, "#5ab0e8"]]) { const r = rb(bw + 0.25, bh + 0.25, 0.1, 0.03, mat("#c89a52", 0.4, 0.3)); r.position.set(bxp, by, -5.78); g.add(r);
    const bild = new THREE.Mesh(new THREE.PlaneGeometry(bw, bh), new THREE.MeshStandardMaterial({ map: canvasTex(128, 96, (x) => { x.fillStyle = c; x.fillRect(0, 0, 128, 96); x.fillStyle = "#6ac86a"; x.beginPath(); x.moveTo(0, 96); x.lineTo(40, 50); x.lineTo(80, 80); x.lineTo(128, 40); x.lineTo(128, 96); x.fill(); }), roughness: 0.6 })); bild.position.set(bxp, by, -5.72); g.add(bild); }
  // Fernseher an der rechten Wand
  const tv = new THREE.Group(); const tr = rb(4.4, 2.6, 0.25, 0.08, mat("#18181e", 0.4)); tv.add(tr); const tg = new THREE.PlaneGeometry(4.1, 2.3); { const uv = tg.attributes.uv, band = (W / H) / (4.1 / 2.3); for (let i = 0; i < uv.count; i++) uv.setY(i, 0.5 + (uv.getY(i) - 0.5) * band); }   // Hochformat-Bild mittig zuschneiden
  STUBE.tvAus = new THREE.MeshBasicMaterial({ color: "#050508" }); const ts = new THREE.Mesh(tg, STUBE.tvAus); ts.position.z = 0.13; tv.add(ts); STUBE.tvSchirm = ts;
  tv.position.set(6.82, 3.2, 1); tv.rotation.y = -Math.PI / 2; g.add(tv); STUBE.tv = tv;
  fenster(STUBE, -6.82, 3.8, -2.5, Math.PI / 2, 2.4, 2.6); }

// Ein Licht für den Raum, in dem gerade gefilmt wird (sonst aus): raumlicht(KLASSE) | raumlicht(null)
export const RAUMLICHT = new THREE.PointLight("#fff4e4", 0, 40, 1.4); scene.add(RAUMLICHT);
export const raumlicht = (R, staerke = 12, farbe = null) => { if (!R) { RAUMLICHT.intensity = 0; RAUMLICHT.color.set("#fff4e4"); return; } RAUMLICHT.position.copy(R.lampe); RAUMLICHT.intensity = staerke; RAUMLICHT.color.set(farbe ?? R.lichtFarbe ?? "#fff4e4"); };

// ---------- Effekte ----------
export const regenbogen = new THREE.Mesh(new THREE.TorusGeometry(60, 6, 8, 64, Math.PI), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.75, depthWrite: false, fog: false,
  map: canvasTex(16, 256, (x, w, h) => { const f = ["#ff3a3a", "#ff9a2a", "#ffe03a", "#4ad84a", "#3a9aff", "#8a4aff"]; f.forEach((c, i) => { x.fillStyle = c; x.fillRect(0, i * h / f.length, w, h / f.length); }); }) }));
regenbogen.visible = false; scene.add(regenbogen);
const BALLON_N = 80;
export const ballonW = new THREE.InstancedMesh(new THREE.SphereGeometry(0.6, 16, 12).scale(1, 1.2, 1), new THREE.MeshPhysicalMaterial({ roughness: 0.25, clearcoat: 1 }), BALLON_N);
ballonW.frustumCulled = false; scene.add(ballonW); const ballonD = [];
{ const c = new THREE.Color(); for (let i = 0; i < BALLON_N; i++) { ballonD.push({ dx: (rnd() - 0.5) * 16, dz: (rnd() - 0.5) * 16, v: 1.5 + rnd() * 1.5, ph: rnd() * 6, t0: rnd() * 1.5 }); ballonW.setColorAt(i, c.set(["#ff4a5a", "#ffd23a", "#4ab8ff", "#5ad85a", "#c85aff", "#ff8a3a"][i % 6])); } }
export const ballonsSetzen = (t, an = false, o = { x: 0, z: 0, t0: 0 }) => { const m = new THREE.Matrix4(); for (let i = 0; i < BALLON_N; i++) { const d = ballonD[i], dt = t - o.t0 - d.t0;
    if (!an || dt < 0) m.makeScale(0, 0, 0); else m.makeTranslation(o.x + d.dx + Math.sin(t * 0.8 + d.ph) * 0.6, 1 + dt * d.v, o.z + d.dz + Math.cos(t * 0.7 + d.ph) * 0.6);
    ballonW.setMatrixAt(i, m); } ballonW.instanceMatrix.needsUpdate = true; };

// ---------- Pro Bild ----------
export const zuruecksetzen = () => { kopfzahlenAus(); regenwolke(0, false); blitz(false); rauch(0, false); if (HANDY.arm) HANDY.arm.visible = true; HANDY.arm = null; handy.visible = false; videowand.visible = false; videowand.scale.setScalar(1); regenbogen.visible = false; regenbogen.scale.setScalar(1); handyWelt(); raumlicht(null); STUBE.tvSchirm.material = STUBE.tvAus; ballonsSetzen(0, false); geldSetzen(0, false); VORSTADT.nacht(false); AULA.kinder(1); WELTALL.an(false); };
export const fernseherAn = () => { STUBE.tvSchirm.material = HANDY.weltMat; };
export const fernseherAus = () => { STUBE.tvSchirm.material = STUBE.tvAus; };
// Handy-Welt rendern (vor dem Haupt-Render), nur wenn ein Bildschirm sie zeigt. Bildschirme selbst dabei aus (keine Rückkopplung).
export const bildschirmeRendern = () => {
  const braucht = (handy.visible && HANDY.modus === "welt") || videowand.visible || STUBE.tvSchirm.material === HANDY.weltMat; if (!braucht) return;
  const hv = handy.visible, wv = videowand.visible, tvm = STUBE.tvSchirm.material; handy.visible = false; videowand.visible = false; STUBE.tvSchirm.material = HANDY.seite.material;
  renderer.setRenderTarget(HANDY.rt); renderer.clear(); renderer.render(scene, HANDY.cam); renderer.setRenderTarget(null);
  handy.visible = hv; videowand.visible = wv; STUBE.tvSchirm.material = tvm;
};

// ---------- Einkaufsstraße (Vergleich 23.11.: Vorbild-Straßen haben Läden, Markisen, Bäume, Bänke) ----------
// Setzt an die Häuser entlang einer Nord-Süd-Straße (x = 24 + 48·k) Ladenfronten und Gehweg-Deko. Fester Zufall → in jedem Bild gleich.
// const s = einkaufsstrasse({ x: 24, z0: 70, z1: 330 }); s.visible = true/false pro Einstellung (Standard: unsichtbar)
const LADEN_ARTEN = [["BÄCKEREI", "#f4b8c8", ["#ffffff", "#e84a6a"]], ["EIS", "#b8e8f4", ["#ffffff", "#3aa8e8"]], ["BLUMEN", "#d8f0b8", ["#ffffff", "#4ab84a"]], ["SPIELZEUG", "#f8e0a0", ["#ffd23a", "#e84a3a"]],
  ["BÜCHER", "#e0d0f4", ["#ffffff", "#8a5ae8"]], ["PIZZA", "#f8d0b0", ["#ffffff", "#e8603a"]], ["KIOSK", "#c8e0f8", ["#ffffff", "#2a6ae8"]], ["FRISEUR", "#f0f0f0", ["#e84a4a", "#ffffff"]]];
export const einkaufsstrasse = ({ x = 24, z0 = 70, z1 = 330, saat = 4 } = {}) => {
  const g = new THREE.Group(); g.visible = false; scene.add(g); let s = saat; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; let k = 0;
  for (const l of LOTS) { if (l.aufsatz || l.z < z0 || l.z > z1) continue;
    for (const seite of [-1, 1]) {   // -1: Haus westlich der Straße (Front nach +x), +1: östlich (Front nach -x)
      const front = seite < 0 ? l.x + l.w / 2 : l.x - l.w / 2, soll = x + seite * 6; if (Math.abs(front - soll) > 5.5) continue;
      const [name, wand, mk] = LADEN_ARTEN[k++ % LADEN_ARTEN.length]; const b = Math.min(l.d * 0.85, 14);
      const ld = O.laden({ name, wand, markise: mk, breite: b }); ld.position.set(front - seite * 0.55, 0, l.z); ld.rotation.y = -seite * Math.PI / 2; g.add(ld);
      // Gehweg-Deko vor dem Laden (zwischen Hauskante und Fahrbahn)
      const vor = front - seite * 1.6, deko = [() => O.blumenkuebel({ farbe: ["#d8704a", "#7a8a9a", "#c8a060"][k % 3] }), () => O.bank(), () => O.hydrant(), () => O.briefkasten(), () => O.muelltonne()];
      const d1 = deko[Math.floor(r() * deko.length)](); d1.scale.setScalar(0.8); d1.position.set(vor, 0, l.z + (r() - 0.5) * b * 0.5); d1.rotation.y = -seite * Math.PI / 2; g.add(d1);
      const bm = O.baum({ art: r() < 0.7 ? "rund" : "kegel", groesse: 0.55 + r() * 0.15, saat: k }); bm.position.set(front - seite * 1.4, 0, l.z + b / 2 + 1.2); g.add(bm);
    } }
  return g; };

// ---------- Vorstadt (Vergleich 24.11.): Straße mit Einfamilienhäusern, Vorgärten, Zäunen, Bäumen, Bushaltestelle ----------
// Liegt bei (-1400, 0, 1800); Straße läuft lokal entlang z (von -150 bis 150), Häuser links und rechts schauen zur Straße.
// VORSTADT.nacht(true) schaltet Fenster und Laternenköpfe an (Licht in den Häusern), sonst Tag. In der Ferne sieht man die Hochhäuser.
const graszTex = canvasTex(256, 256, (x, w, h) => { x.fillStyle = "#5aa83a"; x.fillRect(0, 0, w, h); let s = 8; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; for (let i = 0; i < 5000; i++) { const g = 140 + r() * 60; x.fillStyle = `rgb(${g * 0.45 | 0},${g | 0},${g * 0.3 | 0})`; x.fillRect(r() * w, r() * h, 2, 3); } }, [60, 60]);
const strasseTex = canvasTex(256, 512, (x, w, h) => { x.fillStyle = "#5a5e66"; x.fillRect(0, 0, w, h); let s = 4; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; for (let i = 0; i < 3000; i++) { const g = 80 + r() * 30; x.fillStyle = `rgb(${g},${g},${g + 6})`; x.fillRect(r() * w, r() * h, 2, 2); }
  x.fillStyle = "#f2c21a"; x.fillRect(w / 2 - 9, 0, 6, h); x.fillRect(w / 2 + 3, 0, 6, h); x.fillStyle = "#f0f0f0"; x.fillRect(8, 0, 5, h); x.fillRect(w - 13, 0, 5, h); }, [1, 20]);
export const VORSTADT = (() => {
  const g = new THREE.Group(); g.position.set(-1400, 0, 1800); scene.add(g); const V = { g, glas: [], koepfe: [] }; let s = 21; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const gras = new THREE.Mesh(new THREE.PlaneGeometry(600, 600).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: graszTex, roughness: 0.95 })); gras.position.y = 0.04; g.add(gras);
  const str = new THREE.Mesh(new THREE.PlaneGeometry(12, 600).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: strasseTex, roughness: 0.85 })); str.position.y = 0.06; g.add(str);
  for (const sx of [-1, 1]) { const gw = bx(3.2, 0.3, 600, mat("#d8d8d4", 0.8)); gw.position.set(sx * 7.6, 0.15, 0); g.add(gw); const bord = bx(0.25, 0.32, 600, mat("#b8b8b4", 0.7)); bord.position.set(sx * 6.1, 0.16, 0); g.add(bord); }
  const wandF = ["#f4e8b8", "#cfe4f4", "#f4d0d8", "#d8f0d0", "#f8f4ec", "#e8d8f4", "#f8dcb8"], dachF = ["#3a4a6a", "#5a3a3a", "#3a5a4a", "#4a4a52", "#7a3a2a"], tuerF = ["#c83a3a", "#2a5ad8", "#2a8a4a", "#f2c21a", "#6a3a8a"];
  let k = 0;
  for (let z = -140; z <= 140; z += 24) for (const sx of [-1, 1]) {
    const h = O.haus({ wand: wandF[k % wandF.length], dach: dachF[(k * 3) % dachF.length], tuer: tuerF[(k * 2) % tuerF.length], breite: 11 + r() * 3, tiefe: 9 + r() * 2, stock: r() < 0.75 ? 2 : 1, saat: k + 3 }); k++;
    h.position.set(sx * 23, 0.04, z + (r() - 0.5) * 4); h.rotation.y = -sx * Math.PI / 2; g.add(h);
    h.traverse(o => { if (o.name === "glas") { o.material = o.material.clone(); V.glas.push([o.material, r() < 0.7]); } });
    const zn = O.zaun({ laenge: 14 }); zn.position.set(sx * 11.2, 0.2, z); zn.rotation.y = Math.PI / 2; zn.scale.setScalar(0.8); g.add(zn);
    const weg = bx(2.4, 0.08, 9.5, mat("#d0c8b8", 0.8)); weg.position.set(sx * 13.8, 0.08, z); weg.rotation.y = Math.PI / 2; g.add(weg);
    if (r() < 0.8) { const b = O.baum({ art: r() < 0.75 ? "rund" : "kegel", groesse: 0.6 + r() * 0.25, saat: k * 7 }); b.position.set(sx * (14 + r() * 4), 0.04, z + 8 + r() * 2); g.add(b); }
    if (r() < 0.5) { const bk = O.blumenkuebel({ farbe: "#c8a060" }); bk.scale.setScalar(0.7); bk.position.set(sx * 16, 0.04, z - 6); g.add(bk); }
    if (r() < 0.6) { const bf = O.briefkasten({ farbe: ["#f2c21a", "#2a5ad8", "#c83a3a"][k % 3] }); bf.scale.setScalar(0.75); bf.position.set(sx * 10.6, 0.3, z + 3.5); bf.rotation.y = -sx * Math.PI / 2; g.add(bf); }
    if (k % 3 === 0) { const l = O.laterne({ hoehe: 8, an: true, punktlicht: false }); l.position.set(sx * 9.4, 0.3, z + 12); g.add(l); l.traverse(o => { if (o.isMesh && o.material.isMeshBasicMaterial) { o.material = o.material.clone(); V.koepfe.push(o.material); } }); } }
  const hs = O.haltestelle({ farbe: "#2a8ae8" }); hs.position.set(9.4, 0.3, 10); hs.rotation.y = -Math.PI / 2; g.add(hs); V.haltestelle = hs;
  const sch = O.schild({ text: "BUS", farbe: "#2ab04a", form: "eckig" }); sch.position.set(9.0, 0.3, 4); sch.rotation.y = -Math.PI / 2; g.add(sch);
  V.nacht = (an) => { for (const [m, ein] of V.glas) { m.emissiveIntensity = an && ein ? 1.6 : 0; m.color.set(an && ein ? "#ffe0a0" : "#8ac4e8"); } for (const m of V.koepfe) m.color.setRGB(an ? 3 : 0.9, an ? 2.4 : 0.88, an ? 1.4 : 0.8); };
  V.nacht(false); V.pos = (x, y, z) => new THREE.Vector3(g.position.x + x, y, g.position.z + z); return V; })();

// ---------- Aula (Vergleich 24.11.): Halle mit Bühne, Banner, 600 Sitzen in Reihen und sitzenden Kindern ----------
// AULA.kinder(anteil 0…1) setzt, wie viele Plätze besetzt sind (fester Zufall, 0 = leere Halle). AULA.banner ist eine Leinwand (schreibe).
export const AULA = (() => {
  const R = raum("aula", 1400, 1800, 44, 64, 13, { wandU: "#b8463a", wandO: "#f4ecdc", boden: new THREE.MeshStandardMaterial({ map: holzTex("#b8824a", "#a8723a"), roughness: 0.6 }) });
  const g = R.g; const A = R;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) { const p = bx(3.4, 0.08, 3.4, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.7, 1.65, 1.5) })); p.position.set(-15 + i * 10, 12.95, -26 + j * 10); g.add(p); }
  const buehne = rb(30, 2.2, 10, 0.15, mat("#6a3a22", 0.6)); buehne.position.set(0, 1.1, -27); g.add(buehne);
  for (const sx of [-1, 1]) { const v = bx(7, 11, 0.6, mat("#a8222a", 0.8)); v.position.set(sx * 18, 6.6, -31.6); g.add(v); }
  const pult = rb(2.4, 2.6, 1.4, 0.1, mat("#8a5a32", 0.6)); pult.position.set(0, 3.5, -25); g.add(pult);
  A.banner = leinwand(22, 2.6, { px: 1600 }); A.banner.position.set(0, 10.4, -31.8); g.add(A.banner); schreibe(A.banner, ["SCHULFEST"], { bg: "#2a4ab8", fg: "#ffd23a", font: "900 230px 'Inter Display', Inter, sans-serif" });
  A.uhr = leinwand(5, 2, { px: 512, leuchtet: true, hell: 1.4 }); A.uhr.position.set(-21.82, 9, -10); A.uhr.rotation.y = Math.PI / 2; g.add(A.uhr); schreibe(A.uhr, ["8:00"], { bg: "#111", fg: "#ff3a2a", font: "700 150px 'DejaVu Sans Mono', monospace" });
  for (let i = 0; i < 4; i++) fenster(A, 21.82, 8, -18 + i * 12, -Math.PI / 2, 4, 4);
  // Sitze: 20 Reihen × 30, Mittelgang
  const sitzGeo = mergeGeo([new THREE.BoxGeometry(0.95, 0.18, 0.9).translate(0, 1.0, 0), new THREE.BoxGeometry(0.95, 1.1, 0.14).translate(0, 1.6, -0.42), new THREE.BoxGeometry(0.1, 1.0, 0.8).translate(-0.48, 0.5, 0), new THREE.BoxGeometry(0.1, 1.0, 0.8).translate(0.48, 0.5, 0)]);
  const sitze = new THREE.InstancedMesh(sitzGeo, mat("#b8222a", 0.75), 600); A.plaetze = [];
  const m4 = new THREE.Matrix4(); let n = 0;
  for (let reihe = 0; reihe < 20; reihe++) for (let i = 0; i < 30; i++) { const x = -17 + i * 1.18 + (i >= 15 ? 1.6 : 0), z = -17 + reihe * 2.15; m4.makeTranslation(x, 0.06 + reihe * 0.08, z); sitze.setMatrixAt(n++, m4); A.plaetze.push([g.position.x + x, 0.06 + reihe * 0.08, g.position.z + z]); }
  g.add(sitze);
  // sitzende Kinder (Instanzen: Körper, Kopf, Haare) – billig, aber im Blockstil
  const kk = new THREE.InstancedMesh(new RoundedBoxGeometry(0.85, 0.95, 0.5, 2, 0.08), new THREE.MeshStandardMaterial({ roughness: 0.6 }), 600);
  const kp = new THREE.InstancedMesh(new RoundedBoxGeometry(0.58, 0.55, 0.58, 2, 0.15), new THREE.MeshStandardMaterial({ roughness: 0.5 }), 600);
  const kh = new THREE.InstancedMesh(new RoundedBoxGeometry(0.64, 0.24, 0.64, 2, 0.08), new THREE.MeshStandardMaterial({ roughness: 0.6 }), 600);
  for (const im of [kk, kp, kh]) { im.frustumCulled = false; g.add(im); }
  const hemd = ["#e84a4a", "#4a8ae8", "#f2c21a", "#3ab86a", "#e87ab8", "#8a5ae8", "#f08a3a", "#3ac8c8", "#f4f4f4", "#2a3a5a"], haut = ["#f0c8a0", "#d89a6a", "#8a5a3a", "#f2d0b0", "#c8865a"], haar = ["#2a1a10", "#5a3418", "#c8a050", "#1a1a1a", "#8a4a20"];
  let ss = 31; const rr = () => { ss = (ss * 16807) % 2147483647; return ss / 2147483647; }; const c = new THREE.Color(); A.reihenfolge = [];
  for (let i = 0; i < 600; i++) { kk.setColorAt(i, c.set(hemd[Math.floor(rr() * hemd.length)])); kp.setColorAt(i, c.set(haut[Math.floor(rr() * haut.length)])); kh.setColorAt(i, c.set(haar[Math.floor(rr() * haar.length)])); A.reihenfolge.push([rr(), i]); }
  A.reihenfolge.sort((a, b) => a[0] - b[0]);
  A.kinder = (anteil = 1, huepf = 0, t = 0) => { const nb = Math.round(600 * anteil), an = new Set(A.reihenfolge.slice(0, nb).map(x => x[1])), m = new THREE.Matrix4(), nul = new THREE.Matrix4().makeScale(0, 0, 0);
    for (let i = 0; i < 600; i++) { if (!an.has(i)) { kk.setMatrixAt(i, nul); kp.setMatrixAt(i, nul); kh.setMatrixAt(i, nul); continue; } const [x, y, z] = A.plaetze[i], lx = x - g.position.x, lz = z - g.position.z, hy = huepf ? Math.max(0, Math.sin(t * 7 + i)) * huepf : 0;
      m.makeTranslation(lx, y + 1.6 + hy, lz + 0.05); kk.setMatrixAt(i, m); m.makeTranslation(lx, y + 2.38 + hy, lz + 0.05); kp.setMatrixAt(i, m); m.makeTranslation(lx, y + 2.72 + hy, lz + 0.02); kh.setMatrixAt(i, m); }
    for (const im of [kk, kp, kh]) im.instanceMatrix.needsUpdate = true; };
  A.kinder(1); A.pos = (x, y, z) => new THREE.Vector3(g.position.x + x, y, g.position.z + z); return A; })();

// ---------- Geldscheine (Vergleich 24.11.): flattern aus einem Punkt nach oben und fallen herab, fest vorausberechnet ----------
// geldSetzen(t, an, { x, y, z, t0, kraft, n }) pro Bild aufrufen (Standard: aus)
const GELD_N = 160;
const geldTex = canvasTex(128, 64, (x, w, h) => { x.fillStyle = "#5ac87a"; x.fillRect(0, 0, w, h); x.strokeStyle = "#2a8a4a"; x.lineWidth = 5; x.strokeRect(4, 4, w - 8, h - 8); x.fillStyle = "#2a7a3a"; x.font = "900 40px 'Inter Display', Inter, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("€", w / 2, h / 2 + 2); x.beginPath(); x.arc(22, h / 2, 9, 0, 7); x.arc(w - 22, h / 2, 9, 0, 7); x.fill(); });
export const geldW = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.9, 0.45), new THREE.MeshStandardMaterial({ map: geldTex, side: THREE.DoubleSide, roughness: 0.7 }), GELD_N); geldW.frustumCulled = false; scene.add(geldW);
const geldD = []; { let s = 13; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; for (let i = 0; i < GELD_N; i++) geldD.push({ a: r() * Math.PI * 2, v: 0.4 + r() * 0.8, up: 0.7 + r() * 0.6, ph: r() * 6, dt: r() * 0.6, w: 2 + r() * 3 }); }
export const geldSetzen = (t, an = false, o = {}) => { const { x = 0, y = 4, z = 0, t0 = 0, kraft = 5, n = GELD_N } = o; const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sk = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < GELD_N; i++) { const d = geldD[i], tt = t - t0 - d.dt; if (!an || tt < 0 || i >= n) { m.makeScale(0, 0, 0); geldW.setMatrixAt(i, m); continue; }
    const steig = Math.min(tt, 0.5), fall = Math.max(0, tt - 0.5), hor = kraft * d.v * (1 - Math.exp(-tt * 1.5));
    p.set(x + Math.cos(d.a) * hor + Math.sin(tt * d.w + d.ph) * 0.4, Math.max(0.05, y + kraft * d.up * steig * 2 - fall * 1.4), z + Math.sin(d.a) * hor + Math.cos(tt * d.w * 0.8 + d.ph) * 0.4);
    e.set(Math.sin(tt * d.w + d.ph) * 1.2, tt * d.w * 0.7 + d.ph, Math.cos(tt * d.w * 1.3) * 0.8); q.setFromEuler(e); m.compose(p, q, sk); geldW.setMatrixAt(i, m); }
  geldW.instanceMatrix.needsUpdate = true; };

// ---------- Wüstendorf (Vergleich 24.11.): Gasse mit Lehmhäusern, Wimpelketten, Fackeln, Krügen, Palmen, Pyramiden am Horizont ----------
// Bei (-1800, 0, -1000); Gasse entlang lokal z (-90 … 90), Häuser bei x ±10. WUESTE.fackeln: Flammen-Gruppen (sanft wiegen, nie flackern).
const sandTex = canvasTex(256, 256, (x, w, h) => { x.fillStyle = "#e2c08a"; x.fillRect(0, 0, w, h); let s = 12; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; for (let i = 0; i < 4000; i++) { const k = 0.9 + r() * 0.18; x.fillStyle = `rgb(${226 * k | 0},${192 * k | 0},${138 * k | 0})`; x.fillRect(r() * w, r() * h, 2, 2); } }, [80, 80]);
export const WUESTE = (() => {
  const g = new THREE.Group(); g.position.set(-1800, 0, -1000); scene.add(g); const W_ = { g, fackeln: [] }; let s = 41; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(900, 900).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: sandTex, roughness: 0.95 })); sand.position.y = 0.04; g.add(sand);
  const weg = new THREE.Mesh(new THREE.PlaneGeometry(9, 200).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#d8c8a8", roughness: 0.9 })); weg.position.y = 0.06; g.add(weg);
  const farben = ["#e8c48a", "#f0d0a0", "#e0b080", "#f4dcb4", "#e8b898"], baender = ["#2ab0a8", "#2a6ae8", "#d84a3a", "#e8a82a"]; let k = 0;
  for (let z = -84; z <= 84; z += 12) for (const sx of [-1, 1]) {
    const h = O.lehmhaus({ farbe: farben[k % farben.length], band: baender[(k * 3) % baender.length], breite: 9 + r() * 3, tiefe: 8 + r() * 2, hoehe: 5.5 + r() * 2.5, saat: k + 7 }); k++;
    h.position.set(sx * 10.5, 0.04, z); h.rotation.y = -sx * Math.PI / 2; g.add(h);
    if (r() < 0.55) { const kr = O.krug({ farbe: ["#d8603a", "#c8502a", "#e07848"][k % 3], groesse: 0.8 + r() * 0.5 }); kr.position.set(sx * 5.2, 0.04, z + 3 + r() * 2); g.add(kr); }
    if (k % 2 === 0) { const f = O.fackel({ hoehe: 4.2 }); f.position.set(sx * 5.4, 0.04, z - 4); g.add(f); W_.fackeln.push(f.userData.flamme); }
    if (k % 3 === 1) { const w = O.wimpelkette({ laenge: 13, durchhang: 1 }); w.position.set(0, 7 + r(), z + 6); g.add(w); } }
  for (let i = 0; i < 26; i++) { const p = O.palme({ hoehe: 8 + r() * 6, saat: i + 3 }); const a = r() * Math.PI * 2, d = 40 + r() * 120; p.position.set(Math.cos(a) * d * 1.3, 0.04, Math.sin(a) * d); g.add(p); }
  for (const [x, z, gr] of [[-120, -260, 110], [60, -330, 150], [200, -240, 80]]) { const py = O.pyramide({ groesse: gr }); py.position.set(x, 0, z); g.add(py); }
  const turm = new THREE.Group(); turm.position.set(0, 0.04, -96); g.add(turm); const tm = new THREE.MeshStandardMaterial({ map: lehmTexA(), roughness: 0.95 });
  for (const sx of [-1, 1]) { const sl = new THREE.Mesh(new THREE.BoxGeometry(1.2, 14, 1.2), tm); sl.position.set(sx * 3, 7, 0); turm.add(sl); }
  const dach = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 3), tm); dach.position.y = 14.6; turm.add(dach); const gl = O.glocke(); gl.position.y = 11.6; turm.add(gl); W_.glocke = gl;
  W_.flammen = (t) => W_.fackeln.forEach((f, i) => { const w = 1 + 0.06 * Math.sin(t * 2.3 + i * 1.7); f.scale.set(1, w, 1); f.rotation.z = 0.05 * Math.sin(t * 1.7 + i); });
  W_.pos = (x, y, z) => new THREE.Vector3(g.position.x + x, y, g.position.z + z); return W_; })();
function lehmTexA() { return canvasTex(128, 128, (x, w, h) => { x.fillStyle = "#e0b880"; x.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { x.fillStyle = "rgba(120,80,40,0.12)"; x.fillRect((i * 37) % w, (i * 61) % h, 4, 2); } }); }

// ---------- Thronsaal (Vergleich 24.11.): Säulenhalle, leuchtende Wandzeichen, Reihen kniender Steinwächter, Thron, Krone auf Sockel ----------
// Bei (1800, 0, -1400); Thron am Ende bei lokal z = -40, Gang entlang z. THRONSAAL.wandLicht(0…1) lässt die Zeichen glühen.
export const THRONSAAL = (() => {
  const R = raum("thronsaal", 1800, -1400, 36, 90, 20, { wandU: "#c8a060", wandO: "#d8b070", boden: new THREE.MeshStandardMaterial({ color: "#e8c878", roughness: 0.35, metalness: 0.1 }), decke: "#8a6a3a" });
  const g = R.g; const T = R; T.lichtFarbe = "#ffc070";
  g.children.forEach(o => { if (o.isMesh && o.material.isMeshBasicMaterial && o.position.y > 19) o.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.25, 0.6) }); });   // warme Deckenlichter
  const laeufer = new THREE.Mesh(new THREE.PlaneGeometry(4, 86).rotateX(-Math.PI / 2), mat("#2a4ab8", 0.8)); laeufer.position.y = 0.08; g.add(laeufer);
  for (let i = 0; i < 8; i++) for (const sx of [-1, 1]) { const sl = new THREE.Group(); sl.position.set(sx * 12, 0, -36 + i * 10); g.add(sl);
    const sm = mat("#d8b070", 0.7); const c = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.4, 18, 20), sm); c.position.y = 9; sl.add(c);
    for (const y of [1.5, 16.8]) { const rg = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.6, 20), mat("#2ab0a8", 0.5)); rg.position.y = y; sl.add(rg); }
    const kap = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 1.4, 1.4, 20), mat("#e8b830", 0.4, 0.6)); kap.position.y = 18.3; sl.add(kap); }
  // leuchtende Wandzeichen (eigene Symbole, keine echte Schrift)
  const zeichenTex = canvasTex(512, 512, (x, w, h) => { x.fillStyle = "#000"; x.fillRect(0, 0, w, h); x.fillStyle = "#ffd060"; let s = 9; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let row = 0; row < 12; row++) for (let col = 0; col < 10; col++) { const cx = col * 50 + 25, cy = row * 42 + 22, f = Math.floor(r() * 6); x.beginPath();
      if (f === 0) x.arc(cx, cy, 10, 0, 7); else if (f === 1) { x.rect(cx - 9, cy - 12, 18, 24); } else if (f === 2) { x.moveTo(cx, cy - 14); x.lineTo(cx + 12, cy + 10); x.lineTo(cx - 12, cy + 10); } else if (f === 3) { x.rect(cx - 2, cy - 14, 4, 28); x.rect(cx - 10, cy - 4, 20, 4); } else if (f === 4) { x.ellipse(cx, cy, 13, 6, 0, 0, 7); } else { x.arc(cx, cy, 11, 0, Math.PI); }
      x.globalAlpha = 0.85; x.fill(); x.globalAlpha = 1; } });
  T.zeichenMat = new THREE.MeshBasicMaterial({ map: zeichenTex, color: new THREE.Color(1.6, 1.3, 0.7), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), T.zeichenMat); p.position.set(sx * 17.82, 9, -32 + i * 18); p.rotation.y = -sx * Math.PI / 2; g.add(p); }
  T.wandLicht = (a = 1) => T.zeichenMat.color.setRGB(1.6 * a, 1.3 * a, 0.7 * a);
  // kniende Steinwächter in Reihen beidseits des Gangs (zusammengefügt → wenige Zeichenaufrufe)
  const w1 = O.steinwaechter(), w2 = O.steinwaechter({ ohren: true }); T.waechter = [];
  for (let i = 0; i < 9; i++) for (let rr = 0; rr < 2; rr++) for (const sx of [-1, 1]) { const w = (i + rr) % 3 === 0 ? w2.clone() : w1.clone(); w.position.set(sx * (5 + rr * 3.6), 0, -34 + i * 8.5 + rr * 1.5); w.rotation.y = -sx * Math.PI / 2 * 0.0; w.scale.setScalar(0.85); g.add(w); T.waechter.push(w); }
  const th = O.thron(); th.position.set(0, 0, -40); g.add(th); T.thron = th;
  const so = O.sockel(); so.position.set(0, 2.4, -34.5); g.add(so); const kr = O.krone(); kr.position.set(0, 5.75, -34.5); g.add(kr); T.krone = kr;
  T.fackeln = []; for (let i = 0; i < 8; i++) for (const sx of [-1, 1]) { const f = O.fackel({ hoehe: 3.6 }); f.position.set(sx * 9.6, 0, -36 + i * 10 + 5); g.add(f); T.fackeln.push(f.userData.flamme); }
  T.banner = leinwand(16, 1.8, { px: 1600 }); T.banner.position.set(0, 16, -44.8); g.add(T.banner); schreibe(T.banner, ["DER HÜTER IST ZURÜCK"], { bg: "#2a2a3a", fg: "#ffd060", font: "700 150px 'DejaVu Serif', serif" });
  T.flammen = (t) => T.fackeln.forEach((f, i) => { const w = 1 + 0.06 * Math.sin(t * 2.1 + i * 1.3); f.scale.set(1, w, 1); });
  T.pos = (x, y, z) => new THREE.Vector3(g.position.x + x, y, g.position.z + z); return T; })();

// ---------- Himmelsstadt mit Armenviertel (Vergleich 24.11.): unten Bretterbuden und Müll, darüber Stelzen-Villen bis über die Wolken ----------
// Bei (0, 0, -2000). Boden: Erde mit Buden (lokal |x| < 40, z 0…60), Müllberg; ringsum Himmelshäuser verschiedener Höhe; Wolkendecke bei y ≈ 120.
export const HIMMELSSTADT = (() => {
  const g = new THREE.Group(); g.position.set(0, 0, -2000); scene.add(g); const S = { g }; let s = 61; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const erde = new THREE.Mesh(new THREE.PlaneGeometry(500, 500).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: canvasTex(128, 128, (x, w, h) => { x.fillStyle = "#5a3e2a"; x.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${40 + (i * 7) % 40},${30 + (i * 3) % 20},20,0.5)`; x.fillRect((i * 37) % w, (i * 53) % h, 2, 2); } }, [40, 40]), roughness: 1 })); erde.position.y = 0.04; g.add(erde);
  const gras = new THREE.Mesh(new THREE.RingGeometry(70, 250, 48).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#5ab03a", roughness: 0.95 })); gras.position.y = 0.06; g.add(gras);
  S.buden = []; for (let i = 0; i < 14; i++) { const b = O.bretterbude({ saat: i + 3 }); b.position.set(-34 + (i % 7) * 11 + r() * 2, 0.04, 8 + Math.floor(i / 7) * 16 + r() * 3); b.rotation.y = (r() - 0.5) * 0.4 + (i >= 7 ? Math.PI : 0); g.add(b); S.buden.push(b); }
  const mb = O.muellberg({ groesse: 1.6 }); mb.position.set(30, 0, 48); g.add(mb); const mb2 = O.muellberg({ groesse: 1.1, saat: 4 }); mb2.position.set(-38, 0, 44); g.add(mb2);
  const lt = O.leiter({ hoehe: 6 }); lt.position.set(0, 0, -2); lt.rotation.x = -0.25; g.add(lt); S.leiter = lt;
  const gehweg = bx(120, 6, 10, mat("#cfd2d8", 0.8)); gehweg.position.set(0, 3, -10); g.add(gehweg);
  S.haeuser = []; for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2 + r() * 0.2, d = 90 + r() * 120; const h = O.himmelshaus({ hoehe: 120 + r() * 260, saat: i + 5 }); h.position.set(Math.cos(a) * d, 0, Math.sin(a) * d - 40); h.rotation.y = r() * 6; g.add(h); S.haeuser.push(h); }
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + 0.2, d = 70 + r() * 25; const t = O.himmelshaus({ hoehe: 40 + r() * 30, saat: 40 + i }); t.position.set(Math.cos(a) * d, 0, Math.sin(a) * d - 30); t.userData.oben.scale.setScalar(0.6); g.add(t); }   // kleine Türme (Mittelschicht), außerhalb des Armenviertels
  S.wolken = []; for (let i = 0; i < 34; i++) { const w = O.wolke({ groesse: 0.8 + r() * 1.4, saat: i + 2 }); const a = r() * Math.PI * 2, d = 30 + r() * 220; w.position.set(Math.cos(a) * d, 100 + r() * 70, Math.sin(a) * d - 40); g.add(w); S.wolken.push(w); }
  S.pos = (x, y, z) => new THREE.Vector3(g.position.x + x, y, g.position.z + z); return S; })();

// ---------- Weltall (Vergleich 24.11.): Sternenhimmel, Erde unten, Mond, Turmspitzen mit Teller-Häusern ----------
// Bei (2000, 0, 600) in einer eigenen Sternenkugel. WELTALL.pos(x, y, z); Kamera innerhalb von 250 m um den Mittelpunkt (y ≈ 60) halten.
export const WELTALL = (() => {
  const g = new THREE.Group(); g.position.set(2000, 0, 600); scene.add(g); const A = { g };
  const sterne = canvasTex(1024, 512, (x, w, h) => { x.fillStyle = "#03040c"; x.fillRect(0, 0, w, h); let s = 17; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; for (let i = 0; i < 1600; i++) { const b = 120 + r() * 135; x.fillStyle = `rgb(${b},${b},${Math.min(255, b + 20)})`; const g2 = r() < 0.06 ? 2.5 : 1.2; x.fillRect(r() * w, r() * h, g2, g2); } });
  g.add(new THREE.Mesh(new THREE.SphereGeometry(300, 48, 24), new THREE.MeshBasicMaterial({ map: sterne, side: THREE.BackSide, fog: false })));
  const erde = new THREE.Mesh(new THREE.SphereGeometry(260, 64, 32), new THREE.MeshStandardMaterial({ roughness: 0.8, map: canvasTex(512, 256, (x, w, h) => { x.fillStyle = "#1a5ab8"; x.fillRect(0, 0, w, h); let s = 23; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < 26; i++) { x.fillStyle = r() < 0.7 ? "#3a9a4a" : "#c8b070"; x.beginPath(); x.ellipse(r() * w, h * 0.2 + r() * h * 0.6, 20 + r() * 50, 12 + r() * 30, r() * 3, 0, 7); x.fill(); } x.fillStyle = "rgba(255,255,255,0.75)"; for (let i = 0; i < 40; i++) { x.beginPath(); x.ellipse(r() * w, r() * h, 18 + r() * 30, 4 + r() * 6, r(), 0, 7); x.fill(); } }) }));
  erde.position.set(0, -250, 0); g.add(erde); A.erde = erde;
  const mondK = new THREE.Mesh(new THREE.SphereGeometry(40, 32, 16), new THREE.MeshStandardMaterial({ color: "#e8e8ec", roughness: 0.9 })); mondK.position.set(-120, 110, -160); g.add(mondK);
  A.licht = new THREE.DirectionalLight("#ffffff", 0); A.licht.position.set(g.position.x + 200, 300, g.position.z + 200); A.licht.target.position.copy(g.position); scene.add(A.licht, A.licht.target);
  A.tuerme = []; for (const [x, z, s2, f] of [[0, 0, 1, "#2a4ab8"], [-60, -50, 0.8, "#c83a3a"], [55, -70, 0.9, "#2ab08a"]]) { const t = O.tellerhaus({ farbe: f }); t.position.set(x, -40, z); t.scale.setScalar(s2); g.add(t); A.tuerme.push(t); }
  A.an = (an = true) => { A.licht.intensity = an ? 2.2 : 0; };
  A.pos = (x, y, z) => new THREE.Vector3(g.position.x + x, y, g.position.z + z); return A; })();

// ---------- Schulflur, Turnhalle, Krankenhaus (Vergleich 24.11.) ----------
// SCHULFLUR bei (-600, 0, 1800): langer Gang (entlang z) mit Spinden links und rechts, Fenstern, Türen.
export const SCHULFLUR = (() => { const R = raum("schulflur", -600, 1800, 12, 60, 7.5, { wandU: "#5ab0c8", wandO: "#f4ecd8", boden: new THREE.MeshStandardMaterial({ map: kacheln("#e8ecef", "#cfd6db", 8), roughness: 0.45 }) });
  for (const sx of [-1, 1]) { const sp = O.spind({ n: 30, farbe: "#2ab08a" }); sp.position.set(sx * 5.1, 0, -24); sp.rotation.y = -sx * Math.PI / 2; R.g.add(sp); }
  for (let i = 0; i < 3; i++) { const t = bx(2.4, 5, 0.2, mat("#a8763a", 0.6)); t.position.set(0, 2.5, -29.8); if (i) t.visible = false; R.g.add(t); }
  for (let i = 0; i < 5; i++) fenster(R, 0, 5.4, 29.8, Math.PI, 3, 2);
  R.pos = (x, y, z) => new THREE.Vector3(R.g.position.x + x, y, R.g.position.z + z); return R; })();
// TURNHALLE bei (600, 0, -1800): Hallenboden mit Linien, Mittelkreis, Tribüne, Körbe, Banner.
export const TURNHALLE = (() => { const R = raum("turnhalle", 600, -1800, 40, 56, 14, { wandU: "#c83a3a", wandO: "#f4ecdc", boden: new THREE.MeshStandardMaterial({ roughness: 0.35, map: canvasTex(512, 720, (x, w, h) => { x.fillStyle = "#e0a860"; x.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { x.fillStyle = i % 2 ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)"; x.fillRect(i * w / 40, 0, w / 40, h); }
    x.strokeStyle = "#ffffff"; x.lineWidth = 6; x.strokeRect(30, 30, w - 60, h - 60); x.beginPath(); x.moveTo(30, h / 2); x.lineTo(w - 30, h / 2); x.stroke(); x.beginPath(); x.arc(w / 2, h / 2, 70, 0, 7); x.stroke(); x.strokeStyle = "#2a5ad8"; x.beginPath(); x.arc(w / 2, 30, 120, 0, Math.PI); x.stroke(); x.beginPath(); x.arc(w / 2, h - 30, 120, Math.PI, 2 * Math.PI); x.stroke(); }) }) });
  const tr = O.tribuene({ breite: 34, reihen: 6 }); tr.position.set(0, 0, -19); R.g.add(tr);
  for (const z of [-26, 26]) { const k = new THREE.Group(); k.position.set(0, 0, z); R.g.add(k); const brett = bx(4, 2.6, 0.15, mat("#ffffff", 0.4)); brett.position.y = 9.5; k.add(brett); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.06, 8, 20), mat("#e8602a", 0.5)); ring.rotation.x = Math.PI / 2; ring.position.set(0, 8.4, -Math.sign(z) * 0.7); k.add(ring); }
  R.pos = (x, y, z) => new THREE.Vector3(R.g.position.x + x, y, R.g.position.z + z); return R; })();
// KRANKENHAUS bei (-600, 0, -1800): Zimmer mit Bett, Herzmonitor, Fenster; davor Flur mit Wartestühlen. KRANKENHAUS.monitor.userData.zeichne(t)
export const KRANKENHAUS = (() => { const R = raum("krankenhaus", -600, -1800, 16, 14, 7, { wandU: "#a8d8d0", wandO: "#f2f6f6", boden: new THREE.MeshStandardMaterial({ map: kacheln("#eef2f2", "#dfe8e8", 8), roughness: 0.4 }) });
  const bett = O.krankenbett(); bett.position.set(-1, 0, -2); R.g.add(bett); R.bett = bett; const mon = O.herzmonitor(); mon.position.set(2.8, 0, -4.5); mon.rotation.y = -0.4; R.g.add(mon); R.monitor = mon;
  fenster(R, -7.82, 4, -2, Math.PI / 2, 3, 2.6); const vh = bx(0.1, 6.5, 3.5, mat("#f0e8d8", 0.9)); vh.position.set(-7.7, 3.3, -5); R.g.add(vh);
  for (let i = 0; i < 4; i++) { const st = O.stuhl({ farbe: "#3a8ae8" }); st.position.set(5.5, 0, 1 + i * 1.6); st.rotation.y = -Math.PI / 2; st.scale.setScalar(0.85); R.g.add(st); }
  R.pos = (x, y, z) => new THREE.Vector3(R.g.position.x + x, y, R.g.position.z + z); return R; })();

// ---------- Zahl/Text über dem Kopf (Vergleich 24.11.: „Nur noch 1 Tag“) ----------
// Pro Bild aufrufen: kopfzahl(figurOderPosition, "12.000", { farbe, groesse }). Immer zur Kamera gedreht, wird pro Bild zurückgesetzt.
const KZ_TEX = new Map(); const KZ = []; let kzN = 0;
const kzTex = (text, farbe) => { const k = text + farbe; if (KZ_TEX.has(k)) return KZ_TEX.get(k); const c = document.createElement("canvas"); c.width = 512; c.height = 160; const x = c.getContext("2d");
  x.font = "900 120px 'Inter Display', Inter, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.lineJoin = "round"; x.lineWidth = 22; x.strokeStyle = "#0a0a0a"; x.strokeText(text, 256, 86); x.fillStyle = farbe; x.fillText(text, 256, 86);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; KZ_TEX.set(k, t); return t; };
export const kopfzahl = (wer, text, { farbe = "#4ef07a", groesse = 1, hoehe = 2.3 } = {}) => {
  let s2 = KZ[kzN]; if (!s2) { s2 = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, fog: false })); s2.renderOrder = 5; scene.add(s2); KZ.push(s2); } kzN++;
  const p = new THREE.Vector3(); let sk = 1; if (wer.userData?.kopfG) { wer.userData.kopfG.getWorldPosition(p); sk = wer.scale.y; p.y += hoehe * sk; } else p.copy(wer);
  { const tx = kzTex(String(text), farbe); if (s2.material.map !== tx) { s2.material.map = tx; s2.material.needsUpdate = true; } }   /* nur bei Wechsel, sonst sehr langsam */ s2.position.copy(p); s2.scale.set(3.2 * groesse * Math.max(sk, 0.7), 1.0 * groesse * Math.max(sk, 0.7), 1); s2.visible = true; return s2; };
const kopfzahlenAus = () => { KZ.forEach(s2 => s2.visible = false); kzN = 0; };

// ---------- Wetter-Effekte (Vergleich 24.11.): eigene Regenwolke über einer Figur, Blitz, Rauch ----------
// regenwolke(t, an, {x, y, z, breite}) – kleine dunkle Wolke mit fallenden Tropfen und Pfütze darunter (fest vorausberechnet)
const RW_N = 140; export const REGEN = new THREE.Group(); REGEN.visible = false; scene.add(REGEN);
{ const wm = new THREE.MeshStandardMaterial({ color: "#4a4e5a", roughness: 1 }); for (const [x, y, z, r] of [[0, 0, 0, 1.3], [1.2, -0.2, 0.2, 1.0], [-1.2, -0.2, -0.1, 1.0], [0.4, 0.5, -0.3, 0.9], [-0.5, 0.4, 0.3, 0.9]]) { const k = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), wm); k.position.set(x, y, z); REGEN.add(k); }
  REGEN.tropfen = new THREE.InstancedMesh(new THREE.BoxGeometry(0.04, 0.5, 0.04), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.7, 0.85, 1.2), transparent: true, opacity: 0.7 }), RW_N); REGEN.tropfen.frustumCulled = false; REGEN.add(REGEN.tropfen);
  REGEN.pfuetze = new THREE.Mesh(new THREE.CircleGeometry(1.6, 24).rotateX(-Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: "#6aa8e8", roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.75 })); REGEN.add(REGEN.pfuetze); }
const rwD = []; { let s = 71; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; for (let i = 0; i < RW_N; i++) rwD.push([(r() - 0.5) * 3, (r() - 0.5) * 1.6, r()]); }
export const regenwolke = (t, an = false, o = {}) => { REGEN.visible = an; if (!an) return; const { x = 0, y = 7, z = 0, breite = 1 } = o; REGEN.position.set(x, y, z); REGEN.scale.setScalar(breite); REGEN.pfuetze.position.y = (-y + 0.08) / breite;
  const m = new THREE.Matrix4(); rwD.forEach(([dx, dz, ph], i) => { const f = ((t * 1.6 + ph) % 1); m.makeTranslation(dx, -0.8 - f * (y / breite - 0.8), dz); REGEN.tropfen.setMatrixAt(i, m); }); REGEN.tropfen.instanceMatrix.needsUpdate = true; };
// blitz(an, von, nach) – leuchtender Zickzack-Blitz zwischen zwei Punkten (fester Zufall, keine Bildschirm-Blitze)
export const BLITZ = new THREE.Group(); BLITZ.visible = false; scene.add(BLITZ);
export const blitz = (an = false, von = new THREE.Vector3(), nach = new THREE.Vector3(), saat = 5) => { BLITZ.visible = an; if (!an) return; BLITZ.clear(); let s = saat; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const pts = [von.clone()]; for (let i = 1; i < 9; i++) { const p = von.clone().lerp(nach, i / 9); p.x += (r() - 0.5) * 2.4; p.z += (r() - 0.5) * 1.2; pts.push(p); } pts.push(nach.clone());
  const kurve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.05); BLITZ.add(new THREE.Mesh(new THREE.TubeGeometry(kurve, 60, 0.18, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 4, 5) })));
  BLITZ.add(new THREE.Mesh(new THREE.TubeGeometry(kurve, 60, 0.5, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 0.7, 1.6), transparent: true, opacity: 0.35, depthWrite: false }))); };
// rauch(t, an, {x, y, z, t0, farbe}) – aufsteigende graue Rauchwolken (Motor, Schornstein, Unfall)
const RA_N = 30; export const RAUCH = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshStandardMaterial({ color: "#8a8a92", roughness: 1, transparent: true, opacity: 0.8, depthWrite: false }), RA_N); RAUCH.frustumCulled = false; scene.add(RAUCH);
const raD = []; { let s = 91; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; for (let i = 0; i < RA_N; i++) raD.push([r(), (r() - 0.5) * 2, (r() - 0.5) * 2]); }
export const rauch = (t, an = false, o = {}) => { const { x = 0, y = 2, z = 0, t0 = 0, staerke = 1 } = o; const m = new THREE.Matrix4(); raD.forEach(([ph, dx, dz], i) => { const f = ((t - t0) * 0.5 + ph) % 1; if (!an || t < t0) { m.makeScale(0, 0, 0); } else { const sc = (0.4 + f * 1.6) * staerke; m.makeScale(sc, sc, sc); m.setPosition(x + dx * f * 2, y + f * 7 * staerke, z + dz * f * 2); } RAUCH.setMatrixAt(i, m); }); RAUCH.instanceMatrix.needsUpdate = true; };
