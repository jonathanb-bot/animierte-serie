/* Sportkombi nach dem Vorbild Audi RS 6 Avant (C8, ab 2020), Jonathans Wunsch 16.11.: „möglichst detailgetreu wie der echte RS6“.
   Eigenes Modell aus Formeln (keine fremden 3D-Dateien), echte Maße: Länge 4,995 m, Breite 1,951 m, Höhe 1,46 m,
   Radstand 2,929 m, 22-Zoll-Räder 285/30. Keine Markenlogos.
   Koordinaten: x quer (+ rechts), y hoch, z längs; Front bei z = −2,5 (fährt Richtung −z), Heck bei z = +2,5.
   Merkmale: breite Radhaus-Backen (blister), Wabengrill (Singleframe), große seitliche Lufteinlässe mit Steg, flache
   Matrix-LED-Scheinwerfer mit Tagfahrlicht-Segmenten, Motorhaube mit zwei Lichtkanten, Alu-Fensterrahmen, schwarze
   Dachreling, Dachkantenspoiler, getrennte Rückleuchten mit Segment-Grafik und schwarzer Glanzblende dazwischen,
   Diffusor mit Lamellen und zwei großen ovalen Endrohren, 5-Y-Speichen-Felgen mit roten Bremssätteln.
*/
import * as THREE from 'three';

const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const sgn = v => (v < 0 ? -1 : 1);

// Glatte Kurve y(z) durch Stützpunkte (Catmull-Rom, fein abgetastet)
function kurve(pts) {
  const c = new THREE.SplineCurve(pts.map(([z, y]) => new THREE.Vector2(z, y)));
  const tab = c.getSpacedPoints(600).sort((a, b) => a.x - b.x);
  return z => {
    if (z <= tab[0].x) return tab[0].y; if (z >= tab[tab.length - 1].x) return tab[tab.length - 1].y;
    let lo = 0, hi = tab.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (tab[m].x <= z) lo = m; else hi = m; }
    const a = tab[lo], b = tab[hi]; return lerp(a.y, b.y, (z - a.x) / Math.max(1e-6, b.x - a.x));
  };
}

export const MASSE = { L2: 2.5, ACHSE_V: -1.50, ACHSE_H: 1.43, RAD_R: 0.365, SPUR: 0.835 };
const { ACHSE_V, ACHSE_H, RAD_R, SPUR } = MASSE;

// ---------- Karosserie-Formeln ----------
const yOben = kurve([[-2.5, 0.74], [-2.46, 0.80], [-2.36, 0.83], [-2.0, 0.865], [-1.5, 0.89], [-1.0, 0.955], [-0.6, 0.985], [0.5, 1.0], [1.5, 1.02], [2.2, 1.04], [2.44, 1.03], [2.5, 0.96]]);
const yUnten = kurve([[-2.5, 0.22], [-2.42, 0.15], [-2.0, 0.155], [0, 0.165], [2.0, 0.17], [2.4, 0.22], [2.5, 0.27]]);
const yDach = kurve([[-1.02, 0.95], [-0.7, 1.12], [-0.35, 1.31], [-0.05, 1.42], [0.25, 1.452], [1.0, 1.46], [1.8, 1.452], [2.12, 1.43], [2.26, 1.385], [2.36, 1.27], [2.44, 1.12], [2.475, 1.05]]);
const LF = 0.40, PF = 3.0, LR = 0.24, PR = 5.0; // Rundung im Grundriss vorn / hinten
function grundriss(z) {
  if (z < -2.5 + LF) { const e = Math.min(1, (-2.5 + LF - z) / LF); return Math.pow(Math.max(0, 1 - Math.pow(e, PF)), 1 / PF); }
  if (z > 2.5 - LR) { const e = Math.min(1, (z - (2.5 - LR)) / LR); return Math.pow(Math.max(0, 1 - Math.pow(e, PR)), 1 / PR); }
  return 1;
}
const backe = z => Math.exp(-(((z - ACHSE_V) / 0.62) ** 2)) + Math.exp(-(((z - ACHSE_H) / 0.66) ** 2)); // Radhaus-Verbreiterung
function quer(z) { // Angaben des Querschnitts an der Stelle z
  const yt = yOben(z), yb = yUnten(z);
  const kabine = sm(-1.6, -0.8, z) * (1 - sm(2.3, 2.48, z));
  return { yt, yb, yc: (yt + yb) / 2, h: (yt - yb) / 2, W: 0.948, nO: lerp(4.2, 8, kabine), nU: 7 };
}
function formfaktor(z, y, q) { // Einzug oben (tumblehome), Backen über den Rädern, leichte Taille an den Türen
  const rel = (y - q.yb) / (q.yt - q.yb);
  const einzug = 1 - 0.07 * sm(0.55, 1.0, rel);
  const b = backe(z) * Math.exp(-(((y - 0.70) / 0.17) ** 2));
  const taille = 1 - 0.012 * (1 - Math.min(1, backe(z))) * Math.exp(-(((y - 0.45) / 0.12) ** 2));
  return einzug * (1 + 0.036 * b) * taille;
}
// halbe Breite der Karosserie in Höhe y an der Stelle z (Außenhaut)
export function breiteBei(z, y) {
  const q = quer(z); const v = Math.max(-1, Math.min(1, (y - q.yc) / q.h)); const n = v > 0 ? q.nO : q.nU;
  const s = Math.pow(Math.abs(v), n / 2); const c = Math.sqrt(Math.max(0, 1 - s * s));
  return q.W * Math.pow(c, 2 / n) * formfaktor(z, y, q) * grundriss(z);
}
// z der Front- bzw. Heckfläche bei (x, y)
function flaecheZ(x, y, vorn) {
  let a = vorn ? -2.5 : 2.5, b = vorn ? -2.5 + LF + 0.02 : 2.5 - LR - 0.02; // a: Spitze (Breite 0), b: volle Breite
  if (breiteBei(b, y) <= x) return b;
  for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (breiteBei(m, y) > x) b = m; else a = m; }
  return (a + b) / 2;
}
const frontZ = (x, y) => flaecheZ(Math.abs(x), y, true);
const heckZ = (x, y) => flaecheZ(Math.abs(x), y, false);

function karosserie() {
  const N = 190, M = 128, pos = [], col = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N; const z = lerp(-2.5 + 5 * u, -2.5 * Math.cos(Math.PI * u), 0.55);
    const q = quer(z), pl = grundriss(z);
    for (let j = 0; j < M; j++) {
      const th = (j / M) * Math.PI * 2, c = Math.cos(th), s = Math.sin(th), n = s > 0 ? q.nO : q.nU;
      let y = q.yc + q.h * sgn(s) * Math.pow(Math.abs(s), 2 / n);
      let x = q.W * sgn(c) * Math.pow(Math.abs(c), 2 / n) * formfaktor(z, y, q) * pl;
      // Motorhaube: zwei flache Lichtkanten (power domes)
      if (s > 0.5 && z < -0.95) y += 0.011 * sm(-2.45, -2.1, z) * (1 - sm(-1.25, -0.95, z)) * Math.exp(-(((Math.abs(x) - 0.42) / 0.07) ** 2));
      let dunkel = false;
      for (const az of [ACHSE_V, ACHSE_H]) {
        const d = Math.hypot(z - az, y - RAD_R);
        if (Math.abs(c) > 0.28 && d < 0.418) { x = sgn(c) * Math.min(Math.abs(x), 0.70); dunkel = true; }
      }
      pos.push(x, y, z); const k = dunkel ? 0.025 : 1; col.push(k, k, k);
    }
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
    const a = i * M + j, b = i * M + (j + 1) % M, c2 = (i + 1) * M + j, d = (i + 1) * M + (j + 1) % M;
    idx.push(a, b, c2, b, d, c2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx); g.computeVertexNormals(); return g;
}

// Glashaus mit Dach, Alu-Rahmen, Säulen; Gruppen: 0 Glas, 1 Lack, 2 Alu, 3 Schwarz-Glanz
function glashaus() {
  const N = 150, K = 72, nG = 6, pos = [], info = [];
  const z0 = -1.02, z1 = 2.475;
  for (let i = 0; i <= N; i++) {
    const z = lerp(z0, z1, i / N);
    const yb = yOben(z) - 0.04, yr = Math.max(yb + 0.002, yDach(z));
    const wB = breiteBei(z, yb + 0.04) - 0.012;
    const vornEng = lerp(0.80, 1, sm(-1.02, -0.45, z)), hintenEng = lerp(1, 0.9, sm(2.1, 2.475, z));
    const wT = 0.70 * vornEng * hintenEng;
    for (let j = 0; j <= K; j++) {
      const ph = (j / K) * Math.PI, c = Math.cos(ph), s = Math.sin(ph);
      const rel = Math.pow(Math.abs(s), 2 / nG), xr = Math.pow(Math.abs(c), 2 / nG);
      const y = yb + (yr - yb) * rel;
      const x = sgn(c) * xr * lerp(Math.min(wB, 0.95), wT, rel);
      pos.push(x, y, z); info.push({ z, xr, dy: y - yb, rel });
    }
  }
  const gruppen = [[], [], [], []];
  for (let i = 0; i < N; i++) for (let j = 0; j < K; j++) {
    const a = i * (K + 1) + j, b = a + 1, c2 = a + K + 1, d = c2 + 1;
    const m = [a, b, c2, d].map(k => info[k]);
    const z = (m[0].z + m[2].z) / 2, xr = (m[0].xr + m[1].xr) / 2, dy = (m[0].dy + m[1].dy + m[2].dy + m[3].dy) / 4;
    let gr = 0;
    const seite = xr >= 0.9, dachZ = z > 0.1 && z < 2.2;
    if (!seite && dachZ) gr = xr < 0.855 ? 1 : 2;                      // Dach in Wagenfarbe, Dachkante mit Alu-Leiste
    else if (seite) {
      if (dy < 0.04) gr = 1;                                            // in der Karosserie versenkt
      else if (dy < 0.062 && z > -0.82 && z < 2.33) gr = 2;              // Fensterbrüstung Alu
      else if (z > 2.06 && z < 2.40) gr = 1;                             // D-Säule
      else if ((z > 0.50 && z < 0.60) || (z > 1.52 && z < 1.62)) gr = 3; // B- und C-Säule
      else if (z < -0.62 && xr > 0.97) gr = 3;                           // A-Säule
    }
    gruppen[gr].push(a, b, c2, b, d, c2);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const alle = []; let start = 0;
  gruppen.forEach((ix, k) => { alle.push(...ix); g.addGroup(start, ix.length, k); start += ix.length; });
  g.setIndex(alle); g.computeVertexNormals(); return g;
}

// Fläche auf Front/Heck: Raster über dem Umriss, z folgt der Karosserie (+ Abstand nach außen)
function aufFlaeche(umriss, zFn, mat, aussen = 0.004, segX = 40, segY = 16) {
  const xs = umriss.map(p => p[0]), ys = umriss.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const innen = (px, py) => { let r = false; for (let i = 0, j = umriss.length - 1; i < umriss.length; j = i++) { const [xi, yi] = umriss[i], [xj, yj] = umriss[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) r = !r; } return r; };
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= segY; j++) for (let i = 0; i <= segX; i++) {
    const x = lerp(x0, x1, i / segX), y = lerp(y0, y1, j / segY); const z = zFn(x, y);
    pos.push(x, y, z + (z < 0 ? -aussen : aussen)); uv.push((x - x0) / (x1 - x0), (y - y0) / (y1 - y0));
  }
  const vorn = zFn((x0 + x1) / 2, (y0 + y1) / 2) < 0;
  for (let j = 0; j < segY; j++) for (let i = 0; i < segX; i++) {
    const a = j * (segX + 1) + i, b = a + 1, c = a + segX + 1, d = c + 1;
    const cx = lerp(x0, x1, (i + 0.5) / segX), cy = lerp(y0, y1, (j + 0.5) / segY);
    if (!innen(cx, cy)) continue;
    if (vorn) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals(); const m = new THREE.Mesh(g, mat); m.userData.breite = x1 - x0; m.userData.hoehe = y1 - y0; return m;
}
// Rahmen um einen Umriss (Rohr), folgt der Fläche
function rahmen(umriss, zFn, r, mat, aussen = 0.008) {
  const pts = [];
  for (let i = 0; i < umriss.length; i++) { const [xa, ya] = umriss[i], [xb, yb] = umriss[(i + 1) % umriss.length];
    for (let k = 0; k < 6; k++) { const x = lerp(xa, xb, k / 6), y = lerp(ya, yb, k / 6); const z = zFn(x, y); pts.push(new THREE.Vector3(x, y, z + (z < 0 ? -aussen : aussen))); } }
  return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.1), pts.length * 3, r, 6, true), mat);
}
const spiegelX = umriss => umriss.map(([x, y]) => [-x, y]).reverse();

function wabenTextur(hell = '#4a4e57') {
  const c = document.createElement('canvas'); c.width = 128; c.height = 148; const g = c.getContext('2d');
  g.fillStyle = '#020203'; g.fillRect(0, 0, 128, 148); g.strokeStyle = hell; g.lineWidth = 7;
  const hex = (cx, cy, r) => { g.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; g.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); } g.closePath(); g.stroke(); };
  for (const [cx, cy] of [[0, 0], [128, 0], [64, 37], [0, 74], [128, 74], [64, 111], [0, 148], [128, 148]]) hex(cx, cy, 40);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

function glowSprite(rgba0, rgba1) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, rgba0); r.addColorStop(0.35, rgba1); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  return new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
}

// Streifen auf der Heck-/Frontfläche entlang des Grundrisses (für Leuchten, die um die Ecke laufen)
function leuchtband(yU, yO, xVon, xBis, vorn, mat, aussen = 0.006, n = 40) {
  // yU/yO: Funktionen oder Zahlen von x; xBis darf > Karosseriebreite sein → läuft auf die Seite (bis zLimit)
  const f = v => (typeof v === 'function' ? v : () => v);
  const U = f(yU), O = f(yO); const pos = [], idx = [];
  for (let i = 0; i <= n; i++) {
    const x = lerp(xVon, xBis, i / n);
    for (const y of [U(x), O(x)]) {
      const wMax = breiteBei(vorn ? -2.5 + LF + 0.02 : 2.5 - LR - 0.02, y);
      let px, pz;
      if (x <= wMax - 0.004) { px = x; pz = flaecheZ(x, y, vorn); }
      else { px = wMax; pz = (vorn ? -2.5 + LF + 0.02 : 2.5 - LR - 0.02) + (vorn ? 1 : -1) * (x - wMax); } // weiter an der Seite entlang
      const seitlich = Math.pow(Math.min(1, px / Math.max(0.05, wMax)), 6); // 0 = Fläche zeigt nach vorn/hinten, 1 = zur Seite
      pos.push(px + seitlich * aussen, y, pz + (vorn ? -1 : 1) * (1 - seitlich) * aussen);
    }
  }
  for (let i = 0; i < n; i++) { const a = i * 2, b = a + 1, c = a + 2, d = a + 3; if (vorn) idx.push(a, b, c, b, d, c); else idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); return m;
}

export function bauRS6({ umgebung, farbe = '#6a0d12' } = {}) {
  const auto = new THREE.Group(), deko = [], raeder = [], scheinwerferPos = [];
  const lack = new THREE.MeshPhysicalMaterial({ color: farbe, vertexColors: true, metalness: 0.55, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06, envMap: umgebung, envMapIntensity: 0.3 });
  const lackOhne = lack.clone(); lackOhne.vertexColors = false;
  const glas = new THREE.MeshPhysicalMaterial({ color: '#030408', metalness: 0.3, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.05, envMap: umgebung, envMapIntensity: 0.1 });
  const glanz = new THREE.MeshPhysicalMaterial({ color: '#050506', metalness: 0.2, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.08, envMap: umgebung, envMapIntensity: 0.12 });
  const matt = new THREE.MeshStandardMaterial({ color: '#0b0c0e', roughness: 0.7 });
  const alu = new THREE.MeshStandardMaterial({ color: '#b8bcc4', metalness: 1, roughness: 0.32, envMap: umgebung, envMapIntensity: 0.6 });
  const chrom = new THREE.MeshStandardMaterial({ color: '#d0d4da', metalness: 1, roughness: 0.15, envMap: umgebung, envMapIntensity: 0.8 });
  const titan = new THREE.MeshStandardMaterial({ color: '#33363c', metalness: 1, roughness: 0.28, envMap: umgebung, envMapIntensity: 0.6 });
  const waben = new THREE.MeshStandardMaterial({ map: wabenTextur(), roughness: 0.35, metalness: 0.6, envMap: umgebung, envMapIntensity: 0.4 });
  const rotGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff0505').multiplyScalar(5.5) });
  const rotDunkel = new THREE.MeshPhysicalMaterial({ color: '#2a0204', roughness: 0.08, clearcoat: 1, metalness: 0.2, emissive: '#3a0000', emissiveIntensity: 0.6 });
  const weissGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color('#e8f0ff').multiplyScalar(9) });
  const lackTeile = [];
  const merke = (m, art = 'heiss') => { m.userData.thermo = art; m.userData.mat = m.material; return m; };

  // Karosserie und Glashaus
  const koerper = merke(new THREE.Mesh(karosserie(), lack)); auto.add(koerper); lackTeile.push(koerper);
  const haus = merke(new THREE.Mesh(glashaus(), [glas, lackOhne, alu, glanz]), 'warm'); auto.add(haus);

  // Radhaus-Kanten (Wagenfarbe) verdecken die Treppen der Ausschnitte
  for (const az of [ACHSE_V, ACHSE_H]) for (const sx of [-1, 1]) {
    const g = new THREE.TorusGeometry(0.418, 0.024, 8, 48, Math.PI + 0.62); g.rotateZ(-0.31); g.rotateY(Math.PI / 2);
    const x = breiteBei(az, 0.70) - 0.012; const t = merke(new THREE.Mesh(g, lackOhne)); t.position.set(sx * x, RAD_R, az); auto.add(t); lackTeile.push(t);
  }

  // ---------- Front ----------
  const grill = [[-0.31, 0.69], [0.31, 0.69], [0.48, 0.62], [0.53, 0.40], [0.42, 0.22], [-0.42, 0.22], [-0.53, 0.40], [-0.47, 0.60]];
  { const m = aufFlaeche(grill, frontZ, waben, 0.012, 48, 20); m.material = waben.clone(); m.material.map = waben.map.clone(); m.material.map.repeat.set(m.userData.breite / 0.055, m.userData.hoehe / 0.055); auto.add(m);
    auto.add(rahmen(grill, frontZ, 0.008, glanz, 0.013)); }
  for (const sx of [-1, 1]) { // seitliche Lufteinlässe mit Steg
    let ein = [[0.58, 0.45], [0.84, 0.50], [0.88, 0.40], [0.80, 0.21], [0.60, 0.19], [0.55, 0.30]]; if (sx < 0) ein = spiegelX(ein);
    const m = aufFlaeche(ein, frontZ, waben, 0.01, 24, 14); m.material = waben.clone(); m.material.map = waben.map.clone(); m.material.map.repeat.set(m.userData.breite / 0.05, m.userData.hoehe / 0.05); auto.add(m);
    auto.add(rahmen(ein, frontZ, 0.006, glanz, 0.011));
    const steg = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.26, 0.05), glanz); const sx2 = sx * 0.70; steg.position.set(sx2, 0.33, frontZ(sx2, 0.33) - 0.01); steg.rotation.y = -sx * 0.45; auto.add(steg);
  }
  { const lippe = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.035, 0.16), glanz); lippe.position.set(0, 0.145, -2.40); auto.add(lippe);
    const kz = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.11, 0.015), new THREE.MeshStandardMaterial({ color: '#d8dce0', roughness: 0.6 })); kz.position.set(0, 0.30, frontZ(0, 0.30) - 0.03); auto.add(kz); }
  // Scheinwerfer: flach, nach außen schmaler, Unterkante steigt; Tagfahrlicht als Segmentreihe
  for (const sx of [-1, 1]) {
    const yO = 0.785, yU = x => lerp(0.705, 0.74, sm(0.48, 0.98, x));
    const gehaeuse = leuchtband(yU, yO, 0.47, 1.02, true, glas, 0.007, 44); if (sx < 0) gehaeuse.scale.x = -1; auto.add(gehaeuse);
    const chromLeiste = leuchtband(x => yU(x) + 0.004, x => yU(x) + 0.011, 0.48, 1.0, true, alu, 0.009, 40); if (sx < 0) chromLeiste.scale.x = -1; auto.add(chromLeiste);
    for (let k = 0; k < 5; k++) { // Tagfahrlicht: fünf Segmente
      const x0 = 0.52 + k * 0.085; const seg = leuchtband(x => yU(x) + 0.016, x => yU(x) + 0.03, x0, x0 + 0.06, true, weissGlow, 0.011, 4); if (sx < 0) seg.scale.x = -1; auto.add(seg);
    }
    const oben = leuchtband(yO - 0.016, yO - 0.008, 0.50, 0.95, true, weissGlow, 0.011, 30); if (sx < 0) oben.scale.x = -1; auto.add(oben);
    for (const xl of [0.62, 0.78]) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.024, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color('#dfe8ff').multiplyScalar(4) })); p.position.set(sx * xl, 0.752, frontZ(xl, 0.752) - 0.012); p.rotation.y = Math.PI + sx * 0.2; auto.add(p); }
    scheinwerferPos.push(new THREE.Vector3(sx * 0.70, 0.73, -2.42));
    const sp = new THREE.Sprite(glowSprite('rgba(235,242,255,1)', 'rgba(200,220,255,0.3)')); sp.position.set(sx * 0.70, 0.73, -2.62); sp.scale.set(0.85, 0.42, 1); auto.add(sp); deko.push(sp);
  }

  // ---------- Heck ----------
  for (const sx of [-1, 1]) {
    const yO = 1.012, yU = x => lerp(0.935, 0.905, sm(0.36, 0.95, x));
    const glasRot = leuchtband(yU, yO, 0.36, 1.06, false, rotDunkel, 0.007, 50); if (sx < 0) glasRot.scale.x = -1; auto.add(glasRot);
    const linie = leuchtband(yO - 0.02, yO - 0.009, 0.37, 1.04, false, rotGlow, 0.01, 44); if (sx < 0) linie.scale.x = -1; auto.add(linie);
    for (let k = 0; k < 9; k++) { // senkrechte LED-Segmente
      const x0 = 0.42 + k * 0.058; const seg = leuchtband(x => yU(x) + 0.014, yO - 0.032, x0, x0 + 0.026, false, rotGlow, 0.01, 3); if (sx < 0) seg.scale.x = -1; auto.add(seg);
    }
    const rf = leuchtband(0.47, 0.50, 0.78, 0.93, false, rotDunkel, 0.008, 10); if (sx < 0) rf.scale.x = -1; auto.add(rf); // Rückstrahler im Stoßfänger
    const sp = new THREE.Sprite(glowSprite('rgba(255,40,20,0.9)', 'rgba(255,20,10,0.35)')); sp.position.set(sx * 0.66, 0.965, 2.70); sp.scale.set(1.5, 0.6, 1); auto.add(sp); deko.push(sp);
  }
  { const blendeMat = new THREE.MeshPhysicalMaterial({ color: '#000000', roughness: 0.45, clearcoat: 0.3, clearcoatRoughness: 0.4, envMap: umgebung, envMapIntensity: 0.02 });
    const blende = leuchtband(0.925, 1.0, 0, 0.37, false, blendeMat, 0.006, 16); auto.add(blende); const b2 = blende.clone(); b2.scale.x = -1; auto.add(b2);
    const kz = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.11, 0.015), new THREE.MeshStandardMaterial({ color: '#d8dce0', roughness: 0.6 })); kz.position.set(0, 0.80, heckZ(0, 0.80) + 0.012); auto.add(kz);
    const kzL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.012, 0.01), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffffff').multiplyScalar(1.5) })); kzL.position.set(0, 0.865, heckZ(0, 0.865) + 0.02); auto.add(kzL);
    // Diffusor (schwarz glänzend) mit Lamellen, zwei ovale Endrohre
    const diff = [[-0.90, 0.47], [0.90, 0.47], [0.92, 0.30], [0.86, 0.22], [-0.86, 0.22], [-0.92, 0.30]];
    auto.add(aufFlaeche(diff, heckZ, glanz, 0.006, 48, 10));
    for (const x of [-0.32, -0.16, 0, 0.16, 0.32]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.12, 0.16), glanz); l.position.set(x, 0.26, heckZ(x, 0.26) - 0.02); auto.add(l); }
    for (const sx of [-1, 1]) {
      const x = sx * 0.64, y = 0.315, z = heckZ(0.64, y) + 0.03;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.016, 12, 40), chrom); ring.scale.set(1, 0.52, 1); ring.position.set(x, y, z); auto.add(ring);
      const rohr = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.14, 40, 1, true), titan); rohr.rotation.x = Math.PI / 2; rohr.scale.set(1, 1, 0.52); rohr.position.set(x, y, z - 0.07); auto.add(rohr);
      const innen = new THREE.Mesh(new THREE.CircleGeometry(0.1, 32), new THREE.MeshBasicMaterial({ color: '#010101' })); innen.scale.set(1, 0.5, 1); innen.position.set(x, y, z - 0.05); auto.add(innen);
    }
    // Dachkantenspoiler über der Heckscheibe
    const sp = new THREE.Shape(); sp.moveTo(-0.64, 0); sp.lineTo(0.64, 0); sp.lineTo(0.58, 0.20); sp.lineTo(-0.58, 0.20); sp.closePath();
    const sg = new THREE.ExtrudeGeometry(sp, { depth: 0.035, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2 }); sg.rotateX(Math.PI / 2 + 0.10);
    const spoiler = new THREE.Mesh(sg, glanz); spoiler.position.set(0, yDach(2.2) - 0.004, 2.2); auto.add(spoiler);
  }

  // ---------- Seiten ----------
  for (const sx of [-1, 1]) {
    // Schweller schwarz
    const sw = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.09, 2.05), glanz); sw.position.set(sx * (breiteBei(-0.05, 0.22) + 0.005), 0.215, -0.05); auto.add(sw);
    // Außenspiegel (schwarz glänzend) mit Fuß
    const sp = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), glanz); sp.scale.set(1.15, 0.62, 0.55); sp.position.set(sx * 1.035, 1.06, -0.70); auto.add(sp);
    const fuss = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.035, 0.07), glanz); fuss.position.set(sx * 0.93, 1.03, -0.68); auto.add(fuss);
    const blinker = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.012, 0.01), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff9a20').multiplyScalar(0.4) })); blinker.position.set(sx * 1.05, 1.035, -0.67); auto.add(blinker);
    // Türgriffe (Alu) und Türfugen
    for (const zg of [-0.30, 0.78]) { const tg = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.025, 0.19), alu); tg.position.set(sx * (breiteBei(zg, 0.88) + 0.006), 0.88, zg); auto.add(tg); }
    for (const zf of [-0.78, 0.38, 1.40]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.62, 0.006), matt); f.position.set(sx * (breiteBei(zf, 0.62) + 0.002), 0.62, zf); f.rotation.x = zf > 1 ? -0.08 : 0.02; auto.add(f); }
    // Dachreling schwarz (folgt dem Dach), mit Füßen
    const pts = []; for (let k = 0; k <= 30; k++) { const z = lerp(0.12, 2.02, k / 30); pts.push(new THREE.Vector3(sx * 0.60, yDach(z) + 0.055, z)); }
    auto.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.018, 8), glanz));
    for (const zf of [0.18, 1.96]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.12), glanz); f.position.set(sx * 0.60, yDach(zf) + 0.025, zf); auto.add(f); }
  }
  { const fin = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), glanz); fin.scale.set(0.5, 0.6, 1.6); fin.position.set(0, yDach(1.95) + 0.02, 1.95); auto.add(fin); }

  // ---------- Räder: 22 Zoll, 5-Y-Speiche, rote Bremssättel ----------
  const reifenGeo = (() => { const p = [[0.282, -0.142], [0.335, -0.146], [0.357, -0.135], [0.365, -0.11], [0.365, 0.11], [0.357, 0.135], [0.335, 0.146], [0.282, 0.142]].map(([r, y]) => new THREE.Vector2(r, y));
    const g = new THREE.LatheGeometry(p, 48); g.rotateZ(Math.PI / 2); return g; })();
  const reifenMat = new THREE.MeshStandardMaterial({ color: '#0d0e10', roughness: 0.75 });
  const sattelMat = new THREE.MeshStandardMaterial({ color: '#b3121c', roughness: 0.35, metalness: 0.2 });
  const scheibeMat = new THREE.MeshStandardMaterial({ color: '#4a4c50', metalness: 0.9, roughness: 0.45 });
  for (const [sx, az] of [[-1, ACHSE_V], [1, ACHSE_V], [-1, ACHSE_H], [1, ACHSE_H]]) {
    const r = new THREE.Group(); const reifen = merke(new THREE.Mesh(reifenGeo, reifenMat), 'warm'); r.add(reifen);
    const bett = new THREE.Mesh(new THREE.CylinderGeometry(0.272, 0.272, 0.25, 40, 1, true).rotateZ(Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#16171a', metalness: 0.8, roughness: 0.4, side: THREE.DoubleSide })); r.add(bett);
    const scheibe = new THREE.Mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.03, 40).rotateZ(Math.PI / 2), scheibeMat); scheibe.position.x = -sx * 0.02; r.add(scheibe);
    const fl = sx * 0.115; // Felgenstern außen
    const horn = new THREE.Mesh(new THREE.TorusGeometry(0.274, 0.011, 8, 56), alu); horn.rotation.y = Math.PI / 2; horn.position.x = sx * 0.128; r.add(horn);
    const nabe = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.08, 0.04, 24).rotateZ(Math.PI / 2), titan); nabe.position.x = fl; r.add(nabe);
    const kappe = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.045, 20).rotateZ(Math.PI / 2), glanz); kappe.position.x = fl + sx * 0.005; r.add(kappe);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      const stamm = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.10, 0.05), titan); stamm.position.set(fl, Math.cos(a) * 0.115, Math.sin(a) * 0.115); stamm.rotation.x = -a; r.add(stamm);
      for (const d of [-1, 1]) { const b = a + d * 0.19, rm = 0.215; const arm = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.13, 0.034), titan);
        const ya = Math.cos(a) * 0.16, za = Math.sin(a) * 0.16, yb = Math.cos(b) * 0.27, zb = Math.sin(b) * 0.27;
        arm.position.set(fl, (ya + yb) / 2, (za + zb) / 2); arm.rotation.x = -Math.atan2(zb - za, yb - ya); arm.scale.y = Math.hypot(yb - ya, zb - za) / 0.13; r.add(arm); void rm; }
      const bolz = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.02, 8).rotateZ(Math.PI / 2), chrom); const ab = a + Math.PI / 5; bolz.position.set(fl + sx * 0.012, Math.cos(ab) * 0.05, Math.sin(ab) * 0.05); r.add(bolz);
    }
    r.position.set(sx * SPUR, RAD_R, az); auto.add(r); raeder.push(r);
    // Bremssattel: steht still (nicht in der Radgruppe), hinten oben im Rad
    const sg = new THREE.TorusGeometry(0.175, 0.04, 8, 16, 0.95); sg.rotateZ(Math.PI / 2 - 0.2); sg.rotateY(Math.PI / 2);
    const sattel = new THREE.Mesh(sg, sattelMat); sattel.scale.x = 0.9; sattel.position.set(sx * (SPUR + 0.035), RAD_R, az); auto.add(sattel);
  }

  return { auto, koerper, lackTeile, raeder, deko, scheinwerferPos, rotGlow, lack };
}
