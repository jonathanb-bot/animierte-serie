// Alltag, Bildschirme, Text in der Welt (Jonathan 23.11.: Gestaltungsmittel aus dem Vorbild-Video übernehmen, nie Inhalte).
//   HANDY       Handy mit echtem Bildschirm: zeigt eine zweite Kamera (HANDY.cam) oder eine gezeichnete Seite.
//               Mit B.kamera.insHandy(q, von) fliegt die Kamera in den Bildschirm → nahtloser Schnitt in die Handy-Welt.
//   videowand   Großbildschirm (Platz, Hauswand) und fernseher (Omas Wohnzimmer) zeigen dasselbe Bild wie das Handy.
//   leinwand    beliebiger Text/Zeichnung in der Welt: Tafel, Schild, Preisschild, Fehlermeldung …
//   Räume       Klassenzimmer, Küche, Omas Wohnzimmer (weit weg, eigene Sets) + raumlicht(raum).
//   Effekte     Regenbogen, Luftballons.
import { THREE, RoundedBoxGeometry, scene, renderer, W, H } from "./welt.js";
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
    x.fillStyle = fg; x.font = font; x.textAlign = ausr; x.textBaseline = "middle"; const fs = parseInt(/(\d+)px/.exec(font)?.[1] || 100);
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
export const raumlicht = (R, staerke = 12) => { if (!R) { RAUMLICHT.intensity = 0; return; } RAUMLICHT.position.copy(R.lampe); RAUMLICHT.intensity = staerke; };

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
export const zuruecksetzen = () => { if (HANDY.arm) HANDY.arm.visible = true; HANDY.arm = null; handy.visible = false; videowand.visible = false; videowand.scale.setScalar(1); regenbogen.visible = false; regenbogen.scale.setScalar(1); handyWelt(); raumlicht(null); STUBE.tvSchirm.material = STUBE.tvAus; ballonsSetzen(0, false); };
export const fernseherAn = () => { STUBE.tvSchirm.material = HANDY.weltMat; };
export const fernseherAus = () => { STUBE.tvSchirm.material = STUBE.tvAus; };
// Handy-Welt rendern (vor dem Haupt-Render), nur wenn ein Bildschirm sie zeigt. Bildschirme selbst dabei aus (keine Rückkopplung).
export const bildschirmeRendern = () => {
  const braucht = (handy.visible && HANDY.modus === "welt") || videowand.visible || STUBE.tvSchirm.material === HANDY.weltMat; if (!braucht) return;
  const hv = handy.visible, wv = videowand.visible, tvm = STUBE.tvSchirm.material; handy.visible = false; videowand.visible = false; STUBE.tvSchirm.material = HANDY.seite.material;
  renderer.setRenderTarget(HANDY.rt); renderer.clear(); renderer.render(scene, HANDY.cam); renderer.setRenderTarget(null);
  handy.visible = hv; videowand.visible = wv; STUBE.tvSchirm.material = tvm;
};
