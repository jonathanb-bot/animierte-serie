// Realistische Horrorfiguren (Jonathan 24.11. abends: „Die Figuren können ruhig größer sein, nicht an Roblox-Figuren angepasst,
// sondern realistisch im Vergleich zur echten Figur“). Eigenes Skelett mit Gelenken, echte Proportionen und Größen.
// Maßstab: 1 m echt = 2,3 Einheiten (ein Erwachsener 1,8 m ≈ 4,1 Einheiten = so groß wie unsere Blockfigur mit skala 1).
//   import { real, REAL, rpose } from "../horror_real.js";
//   const nun = real("nun"); nun.position.set(x, 0, z);  rpose(nun, { lauf: 1, phase: t * 4, armR: 1.2, kopfDreh: 0.3, schweben: 0.2 })
// Skelett: g.userData.j = { huefte, brust, hals, kopf, schulterL/R, ellbogenL/R, handL/R, beinL/R, knieL/R, fussL/R }
import * as THREE from "three";
import { scene } from "./welt.js";

export const M = 2.3;   // Einheiten pro Meter
const physisch = (c, r = 0.6, o = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: r, clearcoat: 0.15, ...o });
const stoffTex = (farbe, rauh = 0.15) => { const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d"); x.fillStyle = farbe; x.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 600; i++) { x.fillStyle = i % 2 ? `rgba(0,0,0,${rauh})` : `rgba(255,255,255,${rauh * 0.6})`; x.fillRect((i * 37) % 128, (i * 71) % 128, 1 + (i % 3), 1); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t; };
const stoff = (c, r = 0.9) => new THREE.MeshStandardMaterial({ map: stoffTex(c), roughness: r });
const fellTex = (farbe) => { const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d"); x.fillStyle = farbe; x.fillRect(0, 0, 256, 256); const base = new THREE.Color(farbe);
  for (let i = 0; i < 2500; i++) { const k = base.clone().multiplyScalar(0.7 + ((i * 7919) % 100) / 160); x.strokeStyle = "#" + k.getHexString(); x.lineWidth = 1.5; const px = (i * 37) % 256, py = (i * 71) % 256; x.beginPath(); x.moveTo(px, py); x.lineTo(px + ((i % 5) - 2), py + 6); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); return t; };
const fell = (c) => new THREE.MeshStandardMaterial({ map: fellTex(c), roughness: 1 });
const kapsel = (r, l, m, s = 12) => new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.001, l), 6, s), m);
const kugel = (r, m, s = 24) => new THREE.Mesh(new THREE.SphereGeometry(r, s, Math.round(s * 0.75)), m);
const an = (g, o, x = 0, y = 0, z = 0) => { o.position.set(x, y, z); g.add(o); return o; };
const gruppe = (p, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };
const tex = (w, h, fn) => { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const BLUT = "#9a0c16";

// Gesicht als gewölbte Schale vorne am Kopf (Teilkugel), gezeichnet auf 512×512
const gesicht = (kopf, r, zeichne, { breite = 1.25, hoehe = 1.0, auf = 0 } = {}) => {
  const geo = new THREE.SphereGeometry(r * 1.015, 40, 30, Math.PI / 2 - breite / 2, breite, Math.PI / 2 - hoehe / 2 - auf, hoehe); geo.scale(0.86, 1.06, 0.96);
  const m = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ map: tex(512, 512, zeichne), transparent: true, roughness: 0.7, clearcoat: 0.0, polygonOffset: true, polygonOffsetFactor: -2 }));
  m.rotation.y = -Math.PI / 2 + Math.PI / 2; kopf.add(m); return m; };
const schreiGesicht = (g, mesh, zeichne) => { g.userData.gesicht = mesh; mesh.userData.normal = mesh.material.map; mesh.userData.schrei = tex(512, 512, zeichne); };
// Zeichenhilfen für realistischere Gesichter (weiche Schatten)
const Z = {
  haut(x, w, h, farbe, schatten = "rgba(0,0,0,0.25)") { x.fillStyle = farbe; x.fillRect(0, 0, w, h); const g = x.createRadialGradient(w / 2, h * 0.45, w * 0.15, w / 2, h / 2, w * 0.6); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, schatten); x.fillStyle = g; x.fillRect(0, 0, w, h); },
  augenhoehle(x, w, h, { y = 0.44, abst = 0.15, rx = 0.085, ry = 0.06, farbe = "rgba(20,10,20,0.85)" } = {}) { for (const s of [-1, 1]) { const g = x.createRadialGradient(w / 2 + s * w * abst, h * y, 2, w / 2 + s * w * abst, h * y, w * rx * 1.4); g.addColorStop(0, farbe); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.beginPath(); x.ellipse(w / 2 + s * w * abst, h * y, w * rx * 1.4, h * ry * 1.6, 0, 0, 7); x.fill(); } },
  auge(x, w, h, { y = 0.44, abst = 0.15, r = 0.035, iris = "#3a6ac8", weiss = "#f2eee6", pupille = 0.45, glanz = true } = {}) { for (const s of [-1, 1]) { const cx = w / 2 + s * w * abst, cy = h * y; x.fillStyle = weiss; x.beginPath(); x.ellipse(cx, cy, w * r * 1.6, h * r * 1.0, 0, 0, 7); x.fill();
    x.fillStyle = iris; x.beginPath(); x.arc(cx, cy, w * r * 0.85, 0, 7); x.fill(); x.fillStyle = "#050505"; x.beginPath(); x.arc(cx, cy, w * r * 0.85 * pupille, 0, 7); x.fill(); if (glanz) { x.fillStyle = "rgba(255,255,255,0.8)"; x.beginPath(); x.arc(cx - w * r * 0.3, cy - w * r * 0.3, w * r * 0.22, 0, 7); x.fill(); } } },
  nase(x, w, h, { y = 0.58, farbe = "rgba(0,0,0,0.18)" } = {}) { x.fillStyle = farbe; x.beginPath(); x.ellipse(w / 2 - w * 0.02, h * y, w * 0.025, h * 0.012, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(w / 2 + w * 0.025, h * y, w * 0.025, h * 0.012, 0, 0, 7); x.fill(); const g = x.createLinearGradient(w / 2 - 30, 0, w / 2 + 30, 0); g.addColorStop(0, "rgba(0,0,0,0.12)"); g.addColorStop(0.5, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(w / 2 - 30, h * 0.45, 30, h * 0.12); },
  mund(x, w, h, { y = 0.7, b = 0.14, farbe = "#7a2a2a", dicke = 0.025, offen = 0 } = {}) { x.fillStyle = farbe; x.beginPath(); x.ellipse(w / 2, h * y, w * b, h * (dicke + offen), 0, 0, 7); x.fill(); },
  zaehne(x, w, h, { y = 0.72, b = 0.12, hoch = 0.05, farbe = "#ece4d0", n = 10 } = {}) { x.fillStyle = farbe; for (let i = 0; i < n; i++) { const xx = w / 2 - w * b + (i + 0.5) * 2 * w * b / n; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(xx - w * b / n, h * y + s * h * hoch); x.lineTo(xx + w * b / n, h * y + s * h * hoch); x.lineTo(xx, h * y + s * h * hoch * 0.1); x.fill(); } } },
  adern(x, w, h, farbe = "rgba(40,30,60,0.6)", n = 9) { x.strokeStyle = farbe; x.lineWidth = 2.5; for (let i = 0; i < n; i++) { let px = w * (0.15 + ((i * 0.37) % 1) * 0.7), py = h * (0.05 + (i % 3) * 0.12); x.beginPath(); x.moveTo(px, py); for (let j = 0; j < 6; j++) { px += ((i * 13 + j * 7) % 11 - 5) * 3; py += 14; x.lineTo(px, py); } x.stroke(); } },
};

// ---------- Skelett ----------
// o: groesse (m), schulter (Breite in m), dick (Glieder-Dicke ×), haut, oben (Oberkörper-Material), unten (Beine), schuhe, armLang (×), beinLang (×), kopfGr (×)
export const skelett = (o = {}) => {
  const H = (o.groesse ?? 1.8) * M, g = new THREE.Group(), j = {}, d = o.dick ?? 1;
  const haut = o.hautMat ?? physisch(o.haut ?? "#e8c4a8", 0.55), oben = o.oben ?? stoff("#3a3a42"), unten = o.unten ?? oben, schuhe = o.schuheMat ?? physisch(o.schuhe ?? "#1a1a1a", 0.5);
  const bl = o.beinLang ?? 1, huefteY = H * (0.485 * bl + 0.035), rumpf = H * 0.30, sw = (o.schulter ?? 0.42) * M;
  j.huefte = gruppe(g, 0, huefteY, 0);
  const becken = an(j.huefte, kugel(sw * 0.46, unten, 18), 0, 0, 0); becken.scale.set(1.05, 0.62, 0.72);
  j.brust = gruppe(j.huefte, 0, H * 0.02, 0);
  const torso = an(j.brust, kapsel(sw * 0.4, rumpf * 0.5, oben, 18), 0, rumpf * 0.5, 0); torso.scale.set(1.18, 1, 0.66); j.torso = torso;
  const bauch = an(j.brust, kugel(sw * 0.4, oben, 18), 0, rumpf * 0.12, 0); bauch.scale.set(1.05, 0.9, 0.7);
  for (const s of [-1, 1]) { const sch = an(j.brust, kugel(sw * 0.2, o.aermel ?? oben, 14), s * sw * 0.42, rumpf * 0.86, 0); sch.scale.set(1, 0.8, 0.9); }
  j.hals = gruppe(j.brust, 0, rumpf * 0.98, 0); an(j.hals, kapsel(sw * 0.1, H * 0.035, haut, 10), 0, H * 0.02, 0);
  const kr = H * 0.065 * (o.kopfGr ?? 1); j.kopf = gruppe(j.hals, 0, H * 0.045 + kr * 0.9, 0); j.kopfR = kr;
  const schaedel = an(j.kopf, kugel(kr, o.kopfMat ?? haut, 28), 0, 0, 0); schaedel.scale.set(0.86, 1.06, 0.96); j.schaedel = schaedel;
  const kiefer = an(j.kopf, kugel(kr * 0.72, o.kopfMat ?? haut, 20), 0, -kr * 0.42, kr * 0.12); kiefer.scale.set(0.95, 0.75, 0.9); kiefer.userData.y0 = kiefer.position.y; g.userData.kiefer = kiefer;
  const oa = H * 0.19 * (o.armLang ?? 1), ua = H * 0.16 * (o.armLang ?? 1), hr = H * 0.075 * (o.armLang ?? 1) ** 0.3 * (o.handGr ?? 1);
  for (const [s, n] of [[-1, "L"], [1, "R"]]) {
    const sch = j["schulter" + n] = gruppe(j.brust, s * sw * 0.5, rumpf * 0.86, 0); an(sch, kugel(sw * 0.15 * d, o.aermel ?? oben, 12));
    an(sch, kapsel(sw * 0.14 * d, oa * 0.98, o.aermel ?? oben), 0, -oa / 2, 0);
    const el = j["ellbogen" + n] = gruppe(sch, 0, -oa, 0); an(el, kugel(sw * 0.125 * d, o.unterarm ?? o.aermel ?? oben, 10)); an(el, kapsel(sw * 0.115 * d, ua * 0.98, o.unterarm ?? o.aermel ?? oben), 0, -ua / 2, 0);
    const ha = j["hand" + n] = gruppe(el, 0, -ua, 0); const hm = o.handMat ?? haut;
    const flaeche = an(ha, kapsel(hr * 0.24, hr * 0.3, hm, 10), 0, -hr * 0.3, 0); flaeche.scale.set(1.15, 1, 0.5);
    for (let i = 0; i < 4; i++) { const f = an(ha, kapsel(hr * 0.065, hr * 0.38 * (o.finger ?? 1), hm, 6), (i - 1.5) * hr * 0.12, -hr * (0.68 + 0.19 * (o.finger ?? 1)), 0); f.rotation.x = 0.25; }
    const dm = an(ha, kapsel(hr * 0.06, hr * 0.28, hm, 6), -s * hr * 0.22, -hr * 0.35, hr * 0.05); dm.rotation.z = s * 0.6;
    const ob = H * 0.245 * (o.beinLang ?? 1), un = H * 0.24 * (o.beinLang ?? 1);
    const bein = j["bein" + n] = gruppe(j.huefte, s * sw * 0.22, 0, 0); an(bein, kapsel(sw * 0.2 * d, ob * 0.98, unten), 0, -ob / 2, 0);
    const kn = j["knie" + n] = gruppe(bein, 0, -ob, 0); an(kn, kugel(sw * 0.16 * d, unten, 10)); an(kn, kapsel(sw * 0.155 * d, un * 1.0, unten), 0, -un / 2, 0);
    const fu = j["fuss" + n] = gruppe(kn, 0, -un, 0); const sh = an(fu, kapsel(sw * 0.1, H * 0.06, schuhe, 10), 0, -H * 0.015, H * 0.035); sh.rotation.x = Math.PI / 2; sh.scale.set(1.2, 1, 0.7);
  }
  g.userData.j = j; g.userData.H = H; return g; };

// Pose (pro Bild): lauf/phase (Gehen), armL/armR (nach vorn heben, rad), armLz/armRz (seitlich), kopfDreh, kopfNeig, neig (Oberkörper vor), schweben (über dem Boden, m)
export const rpose = (g, o = {}) => { const j = g.userData.j; if (!j) return; const { lauf = 0, phase = 0, armL = 0, armR = 0, armLz = 0, armRz = 0, ellbogen = 0.15, kopfDreh = 0, kopfNeig = 0, neig = 0, schweben = 0, atmen = 0 } = o;
  const sw = Math.sin(phase) * 0.55 * lauf; j.beinL.rotation.x = sw; j.beinR.rotation.x = -sw; j.knieL.rotation.x = Math.max(0, -Math.sin(phase + 0.8)) * 0.9 * lauf; j.knieR.rotation.x = Math.max(0, Math.sin(phase + 0.8)) * 0.9 * lauf;
  j.schulterL.rotation.set(-armL + sw * 0.6 * (1 - Math.min(1, armL)), 0, -armLz - 0.06); j.schulterR.rotation.set(-armR - sw * 0.6 * (1 - Math.min(1, armR)), 0, armRz + 0.06);
  j.ellbogenL.rotation.x = -ellbogen; j.ellbogenR.rotation.x = -ellbogen; j.kopf.rotation.set(kopfNeig, kopfDreh, 0); j.brust.rotation.x = neig; j.brust.scale.y = 1 + Math.sin(atmen) * 0.01;
  g.userData.basisY ??= 0; j.huefte.position.y = j.huefte.userData.y0 ??= j.huefte.position.y; j.huefte.position.y = j.huefte.userData.y0 + schweben * M + Math.abs(Math.cos(phase)) * 0.08 * lauf; };

// Robe / Kutte / Kleid: Drehkörper von Schulter bis Boden (Profil in m: [[radius, höhe], …] von unten nach oben)
const robe = (g, m, profil) => { const pts = profil.map(([r, h]) => new THREE.Vector2(r * M, h * M)); const geo = new THREE.LatheGeometry(pts, 32); const r = new THREE.Mesh(geo, m); r.material.side = THREE.DoubleSide; g.add(r); return r; };
const BINDEN = (g) => g;

// ---------- Figuren ----------
const nun = () => { const g = skelett({ groesse: 1.85, schulter: 0.4, haut: "#ece8e4", oben: stoff("#0c0b0e", 0.95), aermel: stoff("#0c0b0e", 0.95), unten: stoff("#0c0b0e"), finger: 1.25 }); const j = g.userData.j, kr = j.kopfR;
  g.userData.robe = robe(g, stoff("#0d0c10", 0.95), [[0.42, 0], [0.38, 0.3], [0.3, 0.9], [0.24, 1.25], [0.22, 1.4], [0.15, 1.5], [0.05, 1.55]]);
  gesicht(j.kopf, kr, (x, w, h) => { Z.haut(x, w, h, "#ebe7e2", "rgba(40,40,60,0.35)"); Z.adern(x, w, h); Z.augenhoehle(x, w, h, { y: 0.47, abst: 0.16, rx: 0.1, ry: 0.07, farbe: "rgba(15,10,20,0.95)" });
    Z.auge(x, w, h, { y: 0.47, abst: 0.16, r: 0.03, iris: "#e8c41a", weiss: "#d8d0b8", pupille: 0.35 }); Z.nase(x, w, h, { y: 0.6 }); x.fillStyle = "#14080c"; x.beginPath(); x.ellipse(w / 2, h * 0.73, w * 0.11, h * 0.035, 0, 0, 7); x.fill(); x.fillStyle = "#f2f0ec"; x.fillRect(0, 0, w, h * 0.09); }, { breite: 1.6, hoehe: 1.3 });
  schreiGesicht(g, g.children.length ? j.kopf.children[j.kopf.children.length - 1] : null, (x, w, h) => { Z.haut(x, w, h, "#ebe7e2", "rgba(40,40,60,0.45)"); Z.adern(x, w, h, "rgba(40,30,60,0.8)", 12); Z.augenhoehle(x, w, h, { y: 0.44, abst: 0.16, rx: 0.11, ry: 0.08, farbe: "rgba(10,5,15,1)" }); Z.auge(x, w, h, { y: 0.44, abst: 0.16, r: 0.036, iris: "#f0d020", weiss: "#e8d8a0", pupille: 0.25, glanz: false });
    x.fillStyle = "#0a0204"; x.beginPath(); x.ellipse(w / 2, h * 0.7, w * 0.2, h * 0.19, 0, 0, 7); x.fill(); x.lineWidth = 14; x.strokeStyle = BLUT; x.stroke(); Z.zaehne(x, w, h, { y: 0.7, b: 0.18, hoch: 0.17, farbe: "#ece2cc", n: 13 }); Z.zaehne(x, w, h, { y: 0.7, b: 0.12, hoch: 0.1, farbe: "#c8bca4", n: 9 });
    x.fillStyle = BLUT; for (let i = 0; i < 4; i++) { x.fillRect(w * (0.38 + i * 0.08), h * 0.86, 7, 30 + i * 9); }
    x.fillStyle = "#f2f0ec"; x.fillRect(0, 0, w, h * 0.09); });
  const schw = stoff("#0b0a0d", 0.95), weiss = physisch("#f2f0ec", 0.7);
  const haube = an(j.kopf, new THREE.Mesh(new THREE.SphereGeometry(kr * 1.14, 28, 20, Math.PI * 0.62, Math.PI * 1.76), schw), 0, kr * 0.1, -kr * 0.08); haube.scale.set(0.95, 1.08, 1.0); haube.material.side = THREE.DoubleSide;
  const kappe = an(j.kopf, new THREE.Mesh(new THREE.SphereGeometry(kr * 1.15, 28, 12, 0, Math.PI * 2, 0, Math.PI * 0.34), schw), 0, kr * 0.1, -kr * 0.08); kappe.scale.set(0.95, 1.08, 1.0);
  
  const schleier = robe(j.hals, schw, [[0.32, -0.32], [0.25, -0.15], [0.17, 0.05], [0.13, 0.2], [0.11, 0.3]]); schleier.position.z = -0.04 * M;
  const kragen = an(j.hals, new THREE.Mesh(new THREE.CylinderGeometry(kr * 0.5, kr * 0.85, kr * 0.5, 24, 1, true), weiss), 0, 0, 0); kragen.material.side = THREE.DoubleSide;
  { const am = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.9, 0.3), transparent: true, opacity: 0.9, depthWrite: false }); const ag = new THREE.Group(); j.kopf.add(ag); for (const s2 of [-1, 1]) { const e = an(ag, kugel(kr * 0.07, am, 10), s2 * kr * 0.27, kr * 0.04, kr * 0.97); e.scale.set(1.3, 0.8, 0.4); } ag.visible = false; g.userData.augen = ag; }   // leuchtende Augen im Dunkeln
  g.userData.horror = { id: "nun", name: "The Nun" }; return g; };

const slender = () => { const anzug = stoff("#0b0b0d", 0.8); const g = skelett({ groesse: 2.6, schulter: 0.44, haut: "#f2f2f0", oben: anzug, aermel: anzug, unten: anzug, dick: 0.75, armLang: 1.25, beinLang: 1.1, finger: 1.4 }); const j = g.userData.j, kr = j.kopfR;
  j.schaedel.scale.set(0.82, 1.15, 0.92); j.schaedel.material = physisch("#f4f4f2", 0.35);
  const hemd = an(j.torso.parent, new THREE.Mesh(new THREE.PlaneGeometry(0.16 * M, 0.38 * M), physisch("#f4f4f4", 0.6)), 0, g.userData.H * 0.3 * 0.86, 0.13 * M * 0.98);
  const kr2 = an(j.torso.parent, new THREE.Mesh(new THREE.PlaneGeometry(0.05 * M, 0.34 * M), physisch("#0a0a0a", 0.5)), 0, g.userData.H * 0.3 * 0.8, 0.13 * M * 0.99 + 0.01);
  const t = gruppe(j.brust, 0, g.userData.H * 0.25, -0.12 * M); t.visible = false; g.userData.tentakel = t; const tm = physisch("#0a0a0c", 0.4);
  for (let i = 0; i < 6; i++) { const a = -1.1 + i * 0.44; const pts = []; for (let k = 0; k < 8; k++) pts.push(new THREE.Vector3(Math.sin(a) * k * 0.6, Math.cos(a * 2) * k * 0.3 + k * 0.25, -k * 0.45 - Math.sin(k * 0.8) * 0.3));
    const c = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.09, 6), tm); t.add(c); }
  g.userData.horror = { id: "slenderman", name: "Slender Man" }; return g; };

const jason = () => { const g = skelett({ groesse: 2.0, schulter: 0.55, haut: "#b8a088", oben: stoff("#3e4a34"), aermel: stoff("#3e4a34"), unten: stoff("#2a2a26"), dick: 1.2 }); const j = g.userData.j, kr = j.kopfR;
  gesicht(j.kopf, kr, (x, w, h) => { x.fillStyle = "#e8e2d2"; x.fillRect(0, 0, w, h); const gr = x.createRadialGradient(w / 2, h * 0.4, 20, w / 2, h / 2, w * 0.6); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(80,70,50,0.45)"); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.fillStyle = "#0a0a0a"; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(w / 2 + s * w * 0.15, h * 0.44, w * 0.07, h * 0.04, s * 0.15, 0, 7); x.fill(); } for (let i = 0; i < 24; i++) { x.beginPath(); x.arc(w * (0.3 + (i % 6) * 0.08), h * (0.6 + Math.floor(i / 6) * 0.07), 6, 0, 7); x.fill(); }
    x.fillStyle = "#b81a1a"; for (const [a, b, r] of [[0.28, 0.24, 1.0], [0.72, 0.24, -1.0], [0.5, 0.2, 0]]) { x.save(); x.translate(w * a, h * b); x.rotate(r); x.beginPath(); x.moveTo(0, -26); x.lineTo(14, 0); x.lineTo(0, 26); x.lineTo(-14, 0); x.fill(); x.restore(); }
    x.strokeStyle = "rgba(90,70,40,0.6)"; x.lineWidth = 3; x.beginPath(); x.moveTo(w * 0.62, h * 0.15); x.lineTo(w * 0.7, h * 0.35); x.stroke(); }, { breite: 1.7, hoehe: 1.5 });
  const kapuze = an(j.kopf, kugel(kr * 1.08, stoff("#2a3222"), 24), 0, kr * 0.05, -kr * 0.3); kapuze.scale.set(1, 1.05, 0.9);
  const mach = new THREE.Group(); an(mach, new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.35, 8), physisch("#1a1a1a")), 0, 0, 0); const kl = an(mach, new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.4, 0.16), physisch("#c8ccd4", 0.25, { metalness: 0.85 })), 0, 0.85, 0.03); mach.scale.setScalar(M * 0.55); mach.rotation.x = Math.PI / 2 + 0.3; j.handR.add(mach); mach.position.y = -0.25; g.userData.waffe = mach;
  g.userData.horror = { id: "jason", name: "Jason Voorhees" }; return g; };

const myers = () => { const g = skelett({ groesse: 1.96, schulter: 0.5, haut: "#e8d4c0", oben: stoff("#1c2636"), aermel: stoff("#1c2636"), unten: stoff("#1c2636") }); const j = g.userData.j, kr = j.kopfR;
  gesicht(j.kopf, kr, (x, w, h) => { Z.haut(x, w, h, "#ece6dc", "rgba(60,60,70,0.35)"); x.fillStyle = "#050505"; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(w / 2 + s * w * 0.14, h * 0.46, w * 0.06, h * 0.035, 0, 0, 7); x.fill(); } Z.nase(x, w, h, { y: 0.6, farbe: "rgba(0,0,0,0.25)" }); x.strokeStyle = "rgba(60,50,50,0.7)"; x.lineWidth = 4; x.beginPath(); x.moveTo(w * 0.42, h * 0.72); x.lineTo(w * 0.58, h * 0.72); x.stroke(); }, { breite: 1.6, hoehe: 1.3 });
  const haar = an(j.kopf, kugel(kr * 1.05, stoff("#3a2a1c"), 24), 0, kr * 0.22, -kr * 0.12); haar.scale.set(0.9, 0.85, 0.98);
  const m = new THREE.Group(); an(m, new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 8), physisch("#2a1a10")), 0, 0, 0); an(m, new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.3, 0.05), physisch("#d8dce4", 0.2, { metalness: 0.9 })), 0, 0.22, 0.012); m.scale.setScalar(M); m.rotation.x = Math.PI / 2 + 0.2; m.position.y = -0.25; j.handR.add(m); g.userData.waffe = m;
  g.userData.horror = { id: "michaelmyers", name: "Michael Myers" }; return g; };

const pennywise = () => { const kost = stoff("#d8d4cc", 0.85); const g = skelett({ groesse: 1.95, schulter: 0.5, haut: "#f6f4f0", oben: kost, aermel: kost, unten: kost, dick: 1.45, handMat: physisch("#f2f0ea", 0.5) }); const j = g.userData.j, kr = j.kopfR;
  j.schaedel.scale.set(0.9, 1.2, 0.98); j.schaedel.position.y = kr * 0.1;
  gesicht(j.kopf, kr, (x, w, h) => { Z.haut(x, w, h, "#f8f6f2", "rgba(120,110,110,0.3)"); x.strokeStyle = "#c01018"; x.lineWidth = 12; x.lineCap = "round"; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(w / 2 + s * w * 0.13, h * 0.15); x.lineTo(w / 2 + s * w * 0.15, h * 0.52); x.stroke(); }
    Z.augenhoehle(x, w, h, { y: 0.45, abst: 0.13, farbe: "rgba(120,60,40,0.5)" }); Z.auge(x, w, h, { y: 0.45, abst: 0.13, r: 0.032, iris: "#e8b820", pupille: 0.35 }); x.fillStyle = "#c01018"; x.beginPath(); x.arc(w / 2, h * 0.6, w * 0.035, 0, 7); x.fill();
    x.strokeStyle = "#c01018"; x.lineWidth = 14; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(w / 2, h * 0.73); x.quadraticCurveTo(w / 2 + s * w * 0.16, h * 0.77, w / 2 + s * w * 0.2, h * 0.6); x.stroke(); } x.fillStyle = "#3a0a0a"; x.beginPath(); x.ellipse(w / 2, h * 0.75, w * 0.09, h * 0.03, 0, 0, 7); x.fill(); Z.zaehne(x, w, h, { y: 0.75, b: 0.08, hoch: 0.025 }); }, { breite: 1.6, hoehe: 1.75, auf: 0.12 });
  { const gm = j.kopf.children[j.kopf.children.length - 1]; gm.position.y = kr * 0.1; gm.scale.set(1.05, 1.13, 1.02); }
  schreiGesicht(g, j.kopf.children[j.kopf.children.length - 1], (x, w, h) => { Z.haut(x, w, h, "#f8f6f2", "rgba(120,110,110,0.35)"); x.strokeStyle = "#c01018"; x.lineWidth = 12; x.lineCap = "round"; for (const s2 of [-1, 1]) { x.beginPath(); x.moveTo(w / 2 + s2 * w * 0.13, h * 0.12); x.lineTo(w / 2 + s2 * w * 0.15, h * 0.45); x.stroke(); }
    Z.auge(x, w, h, { y: 0.4, abst: 0.13, r: 0.04, iris: "#f0c020", pupille: 0.2, glanz: false }); x.fillStyle = "#1a0204"; x.beginPath(); x.ellipse(w / 2, h * 0.72, w * 0.22, h * 0.2, 0, 0, 7); x.fill(); x.strokeStyle = "#c01018"; x.lineWidth = 14; x.stroke(); Z.zaehne(x, w, h, { y: 0.72, b: 0.2, hoch: 0.18, farbe: "#f0e8d0", n: 14 }); Z.zaehne(x, w, h, { y: 0.72, b: 0.13, hoch: 0.1, farbe: "#d8d0b8", n: 10 }); });
  const haar = stoff("#e0661a", 1); for (const s of [-1, 1]) { const b = an(j.kopf, kugel(kr * 0.42, haar, 14), s * kr * 0.82, kr * 0.25, -kr * 0.2); b.scale.set(0.8, 0.7, 1.1); }
  for (let i = 0; i < 3; i++) { const k = an(j.hals, new THREE.Mesh(new THREE.TorusGeometry(kr * (1.1 + i * 0.2), kr * 0.18, 8, 28), stoff(i % 2 ? "#e8e2da" : "#d0c8be")), 0, -kr * 0.1 - i * kr * 0.12, 0); k.rotation.x = Math.PI / 2; }
  for (let i = 0; i < 3; i++) an(j.brust, kugel(0.07 * M, stoff("#e0661a"), 12), 0, g.userData.H * 0.3 * (0.75 - i * 0.2), 0.16 * M);
  const ballon = new THREE.Group(); an(ballon, new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 1.3, 4), physisch("#ffffff")), 0, 0.65, 0); const b = an(ballon, kugel(0.25, physisch("#e0101a", 0.25, { clearcoat: 1 })), 0, 1.5, 0); b.scale.set(1, 1.15, 1); ballon.scale.setScalar(M); ballon.position.y = -0.2; j.handL.add(ballon);
  g.userData.horror = { id: "pennywise", name: "Pennywise" }; return g; };

// Plüsch-Riesen (Poppy Playtime): echte Größe ~5,5 m
const pluesch = (farbe, { lippen = "#e0141e", wimpern = false, schleife = false, id, name }) => { const f = fell(farbe), gelb = fell("#f2c21a");
  const g = skelett({ groesse: 5.5, schulter: 1.1, hautMat: f, oben: f, aermel: f, unten: f, handMat: gelb, schuheMat: gelb, dick: 0.8, armLang: 1.55, beinLang: 0.75, kopfGr: 1.45, finger: 1.1 }); const j = g.userData.j, kr = j.kopfR;
  j.schaedel.scale.set(1.1, 0.95, 0.95); j.torso.scale.set(1.35, 1.05, 0.85);
  gesicht(j.kopf, kr, (x, w, h) => { x.fillStyle = "rgba(0,0,0,0)"; for (const s of [-1, 1]) { x.fillStyle = "#050505"; x.beginPath(); x.arc(w / 2 + s * w * 0.15, h * 0.4, w * 0.055, 0, 7); x.fill(); x.fillStyle = "rgba(255,255,255,0.85)"; x.beginPath(); x.arc(w / 2 + s * w * 0.15 - 8, h * 0.4 - 8, 7, 0, 7); x.fill();
      if (wimpern) { x.strokeStyle = "#050505"; x.lineWidth = 5; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(w / 2 + s * w * (0.15 + 0.03 * (i - 1)), h * 0.34); x.lineTo(w / 2 + s * w * (0.17 + 0.05 * (i - 1)), h * 0.28); x.stroke(); } } }
    x.fillStyle = lippen; x.beginPath(); x.moveTo(w * 0.22, h * 0.6); x.quadraticCurveTo(w / 2, h * 0.96, w * 0.78, h * 0.6); x.quadraticCurveTo(w / 2, h * 0.74, w * 0.22, h * 0.6); x.fill();
    x.fillStyle = "#2a0606"; x.beginPath(); x.moveTo(w * 0.27, h * 0.63); x.quadraticCurveTo(w / 2, h * 0.9, w * 0.73, h * 0.63); x.quadraticCurveTo(w / 2, h * 0.75, w * 0.27, h * 0.63); x.fill(); Z.zaehne(x, w, h, { y: 0.71, b: 0.2, hoch: 0.045, n: 14 }); }, { breite: 1.7, hoehe: 1.4 });
  schreiGesicht(g, j.kopf.children[j.kopf.children.length - 1], (x, w, h) => { for (const s2 of [-1, 1]) { x.fillStyle = "#050505"; x.beginPath(); x.arc(w / 2 + s2 * w * 0.16, h * 0.3, w * 0.06, 0, 7); x.fill(); }
    x.fillStyle = lippen; x.beginPath(); x.ellipse(w / 2, h * 0.66, w * 0.34, h * 0.3, 0, 0, 7); x.fill(); x.fillStyle = "#1a0303"; x.beginPath(); x.ellipse(w / 2, h * 0.66, w * 0.29, h * 0.25, 0, 0, 7); x.fill(); for (let r2 = 0; r2 < 3; r2++) Z.zaehne(x, w, h, { y: 0.66, b: 0.28 - r2 * 0.07, hoch: 0.24 - r2 * 0.07, n: 16 - r2 * 3, farbe: r2 ? "#d8d0c0" : "#f4f0e4" }); });
  for (const s of [-1, 1]) { const o = an(j.kopf, kugel(kr * 0.3, f, 14), s * kr * 0.72, kr * 0.78, 0); o.scale.set(1, 1, 0.6); }
  if (schleife) { const sm = physisch("#f4f4f4", 0.5); for (const s of [-1, 1]) { const b = an(j.kopf, kugel(kr * 0.22, sm, 12), kr * 0.45 + s * kr * 0.2, kr * 0.95, kr * 0.2); b.scale.set(1.2, 0.8, 0.5); } }
  g.userData.horror = { id, name }; return g; };

// Siren Head in echter Größe (~12 m): vorhandenes Modell aus horror.js, nur skaliert – Detail-Version folgt dort
export const REAL = {
  nun: { name: "The Nun", groesse: 1.85, bau: nun },
  slenderman: { name: "Slender Man", groesse: 2.6, bau: slender },
  jason: { name: "Jason Voorhees", groesse: 2.0, bau: jason },
  michaelmyers: { name: "Michael Myers", groesse: 1.96, bau: myers },
  pennywise: { name: "Pennywise", groesse: 1.95, bau: pennywise },
  huggywuggy: { name: "Huggy Wuggy", groesse: 5.5, bau: () => pluesch("#2a56e0", { id: "huggywuggy", name: "Huggy Wuggy" }) },
  kissymissy: { name: "Kissy Missy", groesse: 5.5, bau: () => pluesch("#e8569c", { wimpern: true, schleife: true, id: "kissymissy", name: "Kissy Missy" }) },
};

// ---------- Dorfbewohner (Jonathan 24.11.: „die Personen noch besser darstellen“) ----------
const haare = (j, farbe, art = "kurz") => { const kr = j.kopfR, m = stoff(farbe, 1);
  if (art === "kurz") { const h = an(j.kopf, new THREE.Mesh(new THREE.SphereGeometry(kr * 1.06, 26, 16, 0, Math.PI * 2, 0, Math.PI * 0.42), m), 0, kr * 0.06, -kr * 0.05); h.scale.set(0.9, 1.05, 1.0); const hint = an(j.kopf, new THREE.Mesh(new THREE.SphereGeometry(kr * 1.04, 20, 12, Math.PI * 1.15, Math.PI * 0.7, 0, Math.PI * 0.72), m), 0, 0, -kr * 0.06); hint.scale.set(0.9, 1.06, 1); }
  else if (art === "lang") { const h = an(j.kopf, new THREE.Mesh(new THREE.SphereGeometry(kr * 1.07, 26, 16, 0, Math.PI * 2, 0, Math.PI * 0.45), m), 0, kr * 0.06, -kr * 0.04); h.scale.set(0.92, 1.05, 1.0); const r = an(j.kopf, new THREE.Mesh(new THREE.CylinderGeometry(kr * 0.85, kr * 0.95, kr * 2.2, 20, 1, true, Math.PI * 0.24, Math.PI * 1.52), m), 0, -kr * 0.7, -kr * 0.05); r.material.side = THREE.DoubleSide; }
  else if (art === "dutt") { const h = an(j.kopf, new THREE.Mesh(new THREE.SphereGeometry(kr * 1.05, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.45), m), 0, kr * 0.05, -kr * 0.04); h.scale.set(0.9, 1.05, 1.0); an(j.kopf, kugel(kr * 0.42, m, 14), 0, kr * 0.75, -kr * 0.7); }
  else if (art === "glatze") { for (const s2 of [-1, 1]) { const h = an(j.kopf, kugel(kr * 0.4, m, 12), s2 * kr * 0.75, kr * 0.05, -kr * 0.3); h.scale.set(0.5, 0.8, 1.2); } } };
const normalGesicht = (j, haut, { auge = "#4a6a3a", brauen = "#3a2414", lippen = "#b8706a", alt = false, kind = false, stimmung = "ernst" } = {}) => gesicht(j.kopf, j.kopfR, (x, w, h) => {
  Z.haut(x, w, h, haut, "rgba(60,30,20,0.22)"); const ay = kind ? 0.5 : 0.46;
  Z.augenhoehle(x, w, h, { y: ay, abst: 0.15, farbe: "rgba(80,40,30,0.25)" }); Z.auge(x, w, h, { y: ay, abst: 0.15, r: kind ? 0.04 : 0.032, iris: auge, pupille: 0.5 });
  x.strokeStyle = brauen; x.lineCap = "round"; x.lineWidth = kind ? 7 : 9; for (const s2 of [-1, 1]) { const sorge = stimmung === "angst" ? 0.03 : 0; x.beginPath(); x.moveTo(w / 2 + s2 * w * 0.08, h * (ay - 0.08 - sorge * 1.2)); x.quadraticCurveTo(w / 2 + s2 * w * 0.15, h * (ay - 0.1), w / 2 + s2 * w * 0.22, h * (ay - 0.07 + sorge)); x.stroke(); }
  Z.nase(x, w, h, { y: kind ? 0.62 : 0.6 }); x.fillStyle = "rgba(200,90,80,0.18)"; for (const s2 of [-1, 1]) { x.beginPath(); x.arc(w / 2 + s2 * w * 0.2, h * 0.63, w * 0.06, 0, 7); x.fill(); }
  if (stimmung === "angst") { Z.mund(x, w, h, { y: 0.72, b: 0.05, farbe: "#3a1414", dicke: 0.035 }); } else { x.strokeStyle = lippen; x.lineWidth = 8; x.beginPath(); x.moveTo(w * 0.42, h * 0.72); x.quadraticCurveTo(w / 2, h * (stimmung === "froh" ? 0.76 : 0.725), w * 0.58, h * 0.72); x.stroke(); }
  if (alt) { x.strokeStyle = "rgba(90,50,40,0.35)"; x.lineWidth = 3; for (const s2 of [-1, 1]) { x.beginPath(); x.moveTo(w / 2 + s2 * w * 0.26, h * 0.44); x.lineTo(w / 2 + s2 * w * 0.3, h * 0.47); x.stroke(); x.beginPath(); x.moveTo(w / 2 + s2 * w * 0.07, h * 0.66); x.quadraticCurveTo(w / 2 + s2 * w * 0.1, h * 0.72, w / 2 + s2 * w * 0.08, h * 0.76); x.stroke(); } x.beginPath(); x.moveTo(w * 0.35, h * 0.3); x.lineTo(w * 0.65, h * 0.3); x.stroke(); }
}, { breite: 1.6, hoehe: 1.3 });
const mensch = (o) => { const g = skelett({ groesse: o.groesse, schulter: o.schulter ?? 0.44, haut: o.haut, oben: stoff(o.oben), aermel: stoff(o.oben), unten: stoff(o.unten), schuhe: o.schuhe ?? "#2a1e16", kopfGr: o.kind ? 1.25 : 1 });
  const j = g.userData.j; normalGesicht(j, o.haut, o); haare(j, o.haare, o.frisur); if (o.jacke) { const jk = an(j.brust, kapselJ(j, o.jacke), 0, 0, 0); }
  if (o.kleid) robe(g, stoff(o.kleid), [[0.34, 0.35], [0.3, 0.6], [0.24, 0.95], [0.2, 1.05]]);
  g.userData.horror = { id: o.id, name: o.name }; return g; };
const kapselJ = (j, farbe) => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(1, 1, 6, 16), stoff(farbe)); const t = j.torso; m.scale.copy(t.scale).multiply(new THREE.Vector3(t.geometry.parameters.radius * 1.07, (t.geometry.parameters.length + t.geometry.parameters.radius * 2) * 0.33, t.geometry.parameters.radius * 1.07)); m.position.copy(t.position); return m; };
Object.assign(REAL, {
  papa: { name: "Papa (Dorfbewohner)", groesse: 1.85, bau: () => mensch({ id: "papa", name: "Papa", groesse: 1.85, schulter: 0.48, haut: "#d8a080", oben: "#3a5a8a", unten: "#2a2a30", haare: "#3a2414", frisur: "kurz", auge: "#5a3a1a" }) },
  mama: { name: "Mama (Dorfbewohnerin)", groesse: 1.7, bau: () => mensch({ id: "mama", name: "Mama", groesse: 1.7, schulter: 0.4, haut: "#ecc0a0", oben: "#a83a4a", unten: "#3a3a52", haare: "#6a3418", frisur: "lang", auge: "#3a6a8a", lippen: "#c04a4a" }) },
  kind: { name: "Ich (Kind, realistisch)", groesse: 1.35, bau: () => mensch({ id: "kind", name: "Ich", groesse: 1.35, schulter: 0.34, haut: "#f0c8a0", oben: "#e8a020", unten: "#2a3a5a", haare: "#5a3418", frisur: "kurz", kind: true, auge: "#4a6a3a", stimmung: "angst" }) },
  oma: { name: "Oma (Dorfbewohnerin)", groesse: 1.6, bau: () => mensch({ id: "oma", name: "Oma", groesse: 1.6, schulter: 0.4, haut: "#f0d0b8", oben: "#7a4a6a", unten: "#4a3a4a", haare: "#e0e0e0", frisur: "dutt", alt: true, kleid: "#7a4a6a", auge: "#6a7a8a" }) },
  nachbar: { name: "Herr Krause (Nachbar)", groesse: 1.78, bau: () => mensch({ id: "nachbar", name: "Herr Krause", groesse: 1.78, schulter: 0.47, haut: "#e8b898", oben: "#5a6a3a", unten: "#4a4038", haare: "#8a8a8a", frisur: "glatze", alt: true, auge: "#5a5a5a" }) },
});


// ---------- Siren Head (Trevor Henderson), ~12 m: ausgemergelter Körper, Mast-Hals, zwei Sirenen ----------
const rostTex = () => { const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d"); x.fillStyle = "#6a3e26"; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) { const k = ["#7a4a2c", "#5a3020", "#8a5a34", "#4a2618"][i % 4]; x.fillStyle = k; x.fillRect((i * 37) % 256, (i * 71) % 256, 2 + (i % 4), 6 + (i % 7)); }
  x.strokeStyle = "rgba(30,15,10,0.6)"; x.lineWidth = 2; for (let i = 0; i < 40; i++) { x.beginPath(); x.moveTo((i * 53) % 256, 0); x.bezierCurveTo((i * 31) % 256, 80, (i * 97) % 256, 160, (i * 13) % 256, 256); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 4); return t; };
const sirenHeadReal = () => { const haut = new THREE.MeshStandardMaterial({ map: rostTex(), roughness: 0.95 });
  const g = skelett({ groesse: 12, schulter: 1.1, hautMat: haut, oben: haut, aermel: haut, unten: haut, handMat: haut, schuheMat: haut, dick: 0.58, armLang: 1.45, beinLang: 1.05, finger: 1.6, kopfGr: 0.01 }); const j = g.userData.j, H = g.userData.H;
  j.schaedel.visible = false; g.userData.kiefer.visible = false; j.torso.scale.set(0.95, 1.05, 0.55);
  for (let i = 0; i < 7; i++) { const r = an(j.brust, new THREE.Mesh(new THREE.TorusGeometry(0.42 * M * (1 - Math.abs(i - 2) * 0.06), 0.035 * M, 6, 24, Math.PI), haut), 0, H * 0.3 * (0.35 + i * 0.075), 0.02 * M); r.scale.set(1.15, 1, 0.6); }   // Rippen
  const mast = an(j.hals, new THREE.Mesh(new THREE.CylinderGeometry(0.1 * M, 0.14 * M, 2.4 * M, 10), new THREE.MeshStandardMaterial({ color: "#5a5048", roughness: 0.6, metalness: 0.35 })), 0, 1.2 * M, 0);
  for (let i = 0; i < 4; i++) { const sehne = an(j.hals, new THREE.Mesh(new THREE.CylinderGeometry(0.03 * M, 0.05 * M, 0.9 * M, 6), haut), Math.cos(i * 1.6) * 0.12 * M, 0.4 * M, Math.sin(i * 1.6) * 0.12 * M); sehne.rotation.set(Math.sin(i) * 0.3, 0, Math.cos(i) * 0.3); }
  const kopf = gruppe(j.hals, 0, 2.3 * M, 0); g.userData.sirenKopf = kopf; const blech = new THREE.MeshStandardMaterial({ color: "#8a8478", roughness: 0.45, metalness: 0.6 });
  g.userData.sirenen = [-1, 1].map(s2 => { const k = gruppe(kopf, s2 * 0.35 * M, 0, 0); k.rotation.y = s2 * 0.25; const tr = an(k, new THREE.Mesh(new THREE.CylinderGeometry(0.16 * M, 0.55 * M, 0.9 * M, 20, 1, true), blech), s2 * 0.42 * M, 0, 0); tr.rotation.z = s2 * Math.PI / 2; tr.material.side = THREE.DoubleSide;
    const gi = an(k, new THREE.Mesh(new THREE.CircleGeometry(0.53 * M, 20), new THREE.MeshStandardMaterial({ map: tex(128, 128, (x, w, h) => { x.fillStyle = "#14100c"; x.fillRect(0, 0, w, h); x.strokeStyle = "#3a342c"; x.lineWidth = 3; for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(0, i * 15); x.lineTo(w, i * 15); x.stroke(); } }), roughness: 0.8 })), s2 * 0.86 * M, 0, 0); gi.rotation.y = s2 * Math.PI / 2;
    an(k, new THREE.Mesh(new THREE.BoxGeometry(0.28 * M, 0.3 * M, 0.3 * M), blech), 0, 0, 0); return k; });
  g.userData.horror = { id: "sirenhead", name: "Siren Head" }; return g; };
REAL.sirenhead = { name: "Siren Head", groesse: 12, bau: sirenHeadReal };

export const real = (id) => { const e = REAL[id]; if (!e) throw new Error("keine realistische Fassung: " + id); const g = e.bau(); scene.add(g); return g; };


// ---------- Bewegung (Jonathan 24.11.: Form, Bewegung und Animation der Horrorfiguren verbessern) ----------
// ranim(g, t, modus, o): typische Bewegung je Figur, ohne Wackeln/Flackern (alles stetig).
//   modus: "stehen" (lauern, atmen, Kopf-Ruck), "gehen" (Figur-eigener Gang), "angriff" (Arme vor, schneller), "schrei" (Jumpscare-Haltung)
const ruck = (t, alle = 3.1, dauer = 0.18) => { const p = t % alle; return p < dauer ? Math.sin(p / dauer * Math.PI) : 0; };   // seltener, kurzer Kopf-Ruck
export const ranim = (g, t, modus = "stehen", o = {}) => { const id = g.userData.horror?.id, j = g.userData.j; if (!j) return; const tempo = o.tempo ?? 1, p = t * tempo;
  const st = { atmen: t * 1.6 }, gehen = modus === "gehen", angr = modus === "angriff", schrei = modus === "schrei";
  if (id === "nun") { if (g.userData.robe) { g.userData.robe.rotation.z = Math.sin(t * 1.3) * 0.025; g.userData.robe.rotation.x = Math.sin(t * 0.9) * 0.02 + (angr ? 0.06 : 0); g.userData.robe.position.y = (0.12 + Math.sin(t * 1.3) * 0.04) * M; } rpose(g, { ...st, schweben: 0.12 + Math.sin(t * 1.3) * 0.04, kopfNeig: 0.12 + ruck(t, 2.7) * 0.35, kopfDreh: ruck(t + 1, 3.3) * -0.5, armL: angr || schrei ? 1.3 : 0.05, armR: angr || schrei ? 1.4 : 0.05, ellbogen: angr ? 0.5 : 0.1, neig: schrei ? 0.25 : 0.05 }); }
  else if (id === "slenderman") { rpose(g, { ...st, lauf: gehen ? 0.35 : 0, phase: p * 2.2, kopfNeig: 0.18 + Math.sin(t * 0.7) * 0.05, kopfDreh: Math.sin(t * 0.4) * 0.25, armL: 0.04, armR: 0.04, armLz: 0.06, armRz: 0.06 });
    if (g.userData.tentakel) { g.userData.tentakel.visible = angr || schrei || !!o.tentakel; g.userData.tentakel.children.forEach((c, i) => { c.rotation.set(Math.sin(t * 1.5 + i) * 0.25, Math.sin(t * 1.1 + i * 2) * 0.3, Math.cos(t * 1.3 + i) * 0.2); }); } }
  else if (id === "huggywuggy" || id === "kissymissy") { const sw = gehen || angr ? Math.sin(p * 2.6) : 0; rpose(g, { ...st, lauf: gehen || angr ? 0.6 : 0, phase: p * 2.6, armL: angr || schrei ? 1.6 : 0.15 - sw * 0.2, armR: angr || schrei ? 1.6 : 0.15 + sw * 0.2, armLz: 0.25, armRz: 0.25, ellbogen: 0.05, kopfNeig: -0.1 + ruck(t, 2.4) * 0.3, kopfDreh: Math.sin(t * 0.8) * 0.2, neig: 0.12 }); }
  else if (id === "pennywise") { const tanz = gehen ? Math.abs(Math.sin(p * 4)) : 0; rpose(g, { ...st, lauf: gehen ? 0.9 : 0, phase: p * 4, armL: angr ? 1.5 : 0.4 + Math.sin(p * 4) * 0.3 * (gehen ? 1 : 0), armR: angr ? 1.5 : 0.4 - Math.sin(p * 4) * 0.3 * (gehen ? 1 : 0), ellbogen: 0.6, kopfNeig: 0.25 * Math.sin(t * 0.9) + ruck(t, 2.2) * 0.4, kopfDreh: 0.35 * Math.sin(t * 0.6), neig: schrei ? 0.3 : 0.15, schweben: tanz * 0.05 }); }
  else if (id === "jason" || id === "michaelmyers") { rpose(g, { ...st, lauf: gehen || angr ? 0.7 : 0, phase: p * (id === "jason" ? 2.2 : 2.6), armR: angr ? 2.4 : 0.15, ellbogen: angr ? 0.2 : 0.25, armL: 0.05, kopfNeig: id === "michaelmyers" ? 0.08 + ruck(t, 4.2, 0.6) * 0.35 : 0.12, kopfDreh: id === "michaelmyers" ? ruck(t + 2, 4.2, 0.9) * 0.45 : 0, neig: 0.06 }); }
  else if (id === "sirenhead") { rpose(g, { ...st, lauf: gehen || angr ? 0.55 : 0, phase: p * 1.2, armL: angr ? 1.0 : 0.05, armR: angr ? 1.1 : 0.05, armLz: 0.08, armRz: 0.08, ellbogen: 0.3, neig: 0.18 });
    const k = g.userData.sirenKopf; if (k) { k.rotation.y = Math.sin(t * 0.5) * 0.6 + ruck(t, 3.7, 0.25) * 1.4; k.rotation.z = Math.sin(t * 0.7) * 0.08; } }
  else rpose(g, { ...st, lauf: gehen ? 0.7 : 0, phase: p * 2.5 });
  const kf = g.userData.kiefer; if (kf) kf.position.y = kf.userData.y0 - (schrei ? 0.35 : 0) * j.kopfR;
  const gs = g.userData.gesicht; if (gs && gs.userData.schrei) gs.material.map = schrei ? gs.userData.schrei : gs.userData.normal; };

// Jumpscare-Kamera: Figur springt ins Bild. q 0…1 über die Dauer (ca. 0,35 s); Kamera endet direkt vor dem Gesicht.
// Kein Wackeln (Jonathans Regel): nur harter Schnitt + schnelles Heranfahren. Rückgabe { pos, ziel, fov }.
export const jumpscareBlick = (g, q) => { const j = g.userData.j, k = new THREE.Vector3(), r = j.kopfR; g.updateMatrixWorld(true); j.kopf.getWorldPosition(k);
  const vor = new THREE.Vector3(0, 0, 1).applyQuaternion(g.getWorldQuaternion(new THREE.Quaternion())); const e = 1 - Math.pow(1 - Math.min(1, q), 4);
  const abst = r * (11 - 7 * e); return { pos: k.clone().addScaledVector(vor, abst).add(new THREE.Vector3(0, r * 0.1, 0)), ziel: k.clone().add(new THREE.Vector3(0, -r * 0.1, 0)), fov: 50 - 14 * e }; };
