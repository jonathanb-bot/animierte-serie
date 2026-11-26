// Schatten-Wesen (schwarze Würfel-Wolken mit weißen Augen), Himmelslaternen, Funken, Goldstaub.
import { THREE, scene, RoundedBoxGeometry } from "./welt.js";
let seed = 99; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// ---------- Schatten ----------
// gold 0…1 (26.11., Folge 4): glückliche Schatten leuchten golden (Farbe > 1 → Leuchten im Shader), alte Folgen unverändert (gold 0)
const GOLD = new THREE.Color();
const WUERFEL = 46, MAX = 60;
export const SCHATTEN = [];   // {x, z, ry, groesse, aktiv, aufl (0..1), kriech, augen (0..1), phase}
for (let i = 0; i < MAX; i++) SCHATTEN.push({ x: 0, z: 0, y: 0, ry: 0, groesse: 1, aktiv: false, aufl: 0, gold: 0, kriech: 0, augen: 1, phase: rnd() * 10, off: Array.from({ length: WUERFEL }, () => [rnd(), rnd(), rnd(), rnd()]) });
const schattenMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.35, metalness: 0.2, emissive: "#000000" });
schattenMat.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\n totalEmissiveRadiance += vec3(0.10,0.0,0.22) * pow(1.0 - abs(dot(normalize(vNormal), vec3(0.,0.,1.))), 3.0) * (1.0 - vColor.r * 3.0);\n totalEmissiveRadiance += vec3(1.0,0.62,0.22) * clamp(vColor.r - 1.0, 0.0, 1.0) * 1.6;"); };
schattenMat.vertexColors = false;
export const schattenW = new THREE.InstancedMesh(new RoundedBoxGeometry(1, 1, 1, 2, 0.12), schattenMat, MAX * WUERFEL);
schattenW.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX * WUERFEL * 3), 3);
schattenW.frustumCulled = false; scene.add(schattenW);
const augenMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 6, 6) });
export const augenW = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 12, 8), augenMat, MAX * 2); augenW.frustumCulled = false; scene.add(augenW);
const pupillenW = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 10, 8), new THREE.MeshBasicMaterial({ color: "#000000" }), MAX * 2); pupillenW.frustumCulled = false; scene.add(pupillenW);
export const schattenSetzen = (t) => { const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3(), col = new THREE.Color();
  let k = 0, a = 0;
  for (const S of SCHATTEN) {
    for (let i = 0; i < WUERFEL; i++, k++) {
      if (!S.aktiv) { m.makeScale(0, 0, 0); schattenW.setMatrixAt(k, m); continue; }
      const [r1, r2, r3, r4] = S.off[i]; const g = S.groesse, ph = t * (1.4 + r4) + S.phase + r1 * 6;
      // Körper: flacher Hügel, Arme/Ranken nach vorn (+z lokal) beim Kriechen
      const ranke = i < 14; let lx, ly, lz, sc;
      if (ranke) { const arm = i % 4, u = Math.floor(i / 4) / 3.5 + 0.15; const ang = (arm - 1.5) * 0.55 + Math.sin(ph * 0.7) * 0.15;
        const reich = (0.9 + S.kriech * 1.1) * u * 1.6; lx = Math.sin(ang) * reich; lz = Math.cos(ang) * reich + 0.3; ly = 0.15 + Math.sin(ph + u * 3) * 0.12; sc = 0.42 * (1.15 - u * 0.6); }
      else { const th = r1 * Math.PI * 2, rr = Math.sqrt(r2) * 1.25; lx = Math.cos(th) * rr; lz = Math.sin(th) * rr * 0.9 - 0.2; ly = (1 - rr / 1.4) * 1.5 * r3 + 0.25 + Math.sin(ph) * 0.12; sc = 0.45 + r3 * 0.5 + Math.sin(ph * 1.3) * 0.06; }
      const d = S.aufl; const flug = d * d;
      v.set(lx * g, ly * g + flug * (2 + r2 * 6) * g, lz * g).applyEuler(e.set(0, S.ry, 0)).add(new THREE.Vector3(S.x, S.y, S.z));
      v.x += Math.sin(r1 * 9 + d * 4) * flug * 1.5 * g; v.z += Math.cos(r2 * 9 + d * 4) * flug * 1.5 * g;
      q.setFromEuler(e.set(ph * 0.2 + r2, r3 * 3 + S.ry, ph * 0.15)); s.setScalar(sc * g * Math.max(0, 1 - d * 1.15));
      m.compose(v, q, s); schattenW.setMatrixAt(k, m);
      col.setRGB(0.012, 0.010, 0.02).lerp(new THREE.Color(1.0, 0.65, 0.25), Math.min(1, d * 2.2));
      if (S.gold > 0) col.lerp(GOLD.setRGB(1.25 + r3 * 0.6, 0.78 + r3 * 0.3, 0.28), S.gold);   // glücklich: leuchtet golden (Folge 4)
      schattenW.setColorAt(k, col);
    }
    for (const sx of [-1, 1]) { const zu = S.aktiv ? Math.max(0, S.augen * (1 - S.aufl * 2.5)) * (Math.sin(t * 0.9 + S.phase * 3) > 0.985 ? 0.1 : 1) : 0;
      v.set(sx * 0.32 * S.groesse, (1.25 + Math.sin(t * 1.4 + S.phase) * 0.1) * S.groesse, 0.85 * S.groesse).applyEuler(e.set(0, S.ry, 0)).add(new THREE.Vector3(S.x, S.y, S.z));
      q.identity(); s.set(S.groesse, S.groesse * zu * 1.2, S.groesse * 0.6); m.compose(v, q, s); augenW.setMatrixAt(a, m);
      const vp = v.clone().add(new THREE.Vector3(0, 0, 0.1 * S.groesse).applyEuler(e)); s.set(S.groesse, S.groesse * zu, S.groesse * 0.6); m.compose(vp, q, s); pupillenW.setMatrixAt(a, m); a++; }
  }
  schattenW.instanceMatrix.needsUpdate = true; schattenW.instanceColor.needsUpdate = true; augenW.instanceMatrix.needsUpdate = true; pupillenW.instanceMatrix.needsUpdate = true; };
export const schattenAus = () => SCHATTEN.forEach(S => { S.aktiv = false; });

// ---------- Himmelslaternen ----------
export const LATERNEN = [];
const LMAX = 4200;
const laternenGeo = (() => { const g = new THREE.CylinderGeometry(0.42, 0.3, 0.95, 10, 1, true); g.translate(0, 0.48, 0); return g; })();
const laternenMat = new THREE.ShaderMaterial({ transparent: false, side: THREE.DoubleSide, fog: false,
  vertexShader: `attribute vec3 aFarbe; varying vec3 vF; varying float vY; void main(){ vF = aFarbe; vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.); }`,
  fragmentShader: `varying vec3 vF; varying float vY; void main(){ float g = 1.25 - vY * 0.9; gl_FragColor = vec4(vF * g, 1.); }` });
export const laternenW = new THREE.InstancedMesh(laternenGeo, laternenMat, LMAX);
{ const f = new Float32Array(LMAX * 3); for (let i = 0; i < LMAX; i++) { const w = rnd(); const c = new THREE.Color().setRGB(2.6 + w * 0.8, 1.25 + w * 0.6, 0.35 + w * 0.25); c.toArray(f, i * 3); } laternenGeo.setAttribute("aFarbe", new THREE.InstancedBufferAttribute(f, 3)); }
laternenW.frustumCulled = false; scene.add(laternenW);
export const laternenAnlegen = (liste) => { LATERNEN.length = 0; for (const l of liste) LATERNEN.push(l); };   // {x, y, z, t0, v, wx, wz, ph}
export const laternenSetzen = (t, halten = null) => { const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3();
  for (let i = 0; i < LMAX; i++) { const L = LATERNEN[i]; if (!L || (L.sichtbarAb ?? -1e9) > t) { m.makeScale(0, 0, 0); laternenW.setMatrixAt(i, m); continue; }
    let x = L.x, y = L.y, z = L.z; const dt = t - L.t0;
    if (halten && L.hand) { const hp = halten(L); if (hp) { x = hp.x; y = hp.y; z = hp.z; } }
    if (dt > 0) { const auf = dt < 1.2 ? 0.5 * dt * dt / 1.2 * L.v : (0.6 * L.v + (dt - 1.2) * L.v); y += auf; x += L.wx * dt * dt * 0.05 + Math.sin(dt * 0.7 + L.ph) * 0.6 * Math.min(1, dt); z += L.wz * dt * dt * 0.05 + Math.cos(dt * 0.6 + L.ph) * 0.6 * Math.min(1, dt); }
    v.set(x, y, z); q.setFromEuler(e.set(Math.sin(t * 1.3 + L.ph) * 0.08, L.ph, Math.cos(t * 1.1 + L.ph) * 0.08)); s.setScalar(L.s ?? 1); m.compose(v, q, s); laternenW.setMatrixAt(i, m); }
  laternenW.instanceMatrix.needsUpdate = true; };
export const laternenHoehe = (t) => { let n = 0, sum = 0; for (const L of LATERNEN) { const dt = t - L.t0; if (dt > 0) { sum += Math.min(1, dt / 6); n++; } } return n ? sum / LATERNEN.length : 0; };

// ---------- Funken (Explosion, Trafo) ----------
const FMAX = 400; export const FUNKEN = [];
export const funkenW = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.08, 0.6), new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 4, 1.6) }), FMAX); funkenW.frustumCulled = false; scene.add(funkenW);
export const funkenAnlegen = (ursprung, t0, n = 300, kraft = 14) => { for (let i = 0; i < n && FUNKEN.length < FMAX; i++) { const th = rnd() * Math.PI * 2, ph = rnd() * Math.PI * 0.5; const vv = kraft * (0.4 + rnd() * 0.8);
  FUNKEN.push({ o: ursprung.clone(), t0: t0 + rnd() * 0.25, v: new THREE.Vector3(Math.cos(th) * Math.cos(ph) * vv, Math.sin(ph) * vv * 1.1 + 2, Math.sin(th) * Math.cos(ph) * vv), leben: 0.8 + rnd() * 1.4 }); } };
export const funkenSetzen = (t) => { const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), up = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i < FMAX; i++) { const F = FUNKEN[i]; const dt = F ? t - F.t0 : -1; if (!F || dt < 0 || dt > F.leben) { m.makeScale(0, 0, 0); funkenW.setMatrixAt(i, m); continue; }
    v.copy(F.o).addScaledVector(F.v, dt); v.y -= 4.9 * dt * dt; if (v.y < 0.05) v.y = 0.05; const vel = F.v.clone(); vel.y -= 9.8 * dt;
    q.setFromUnitVectors(up, vel.clone().normalize()); const k = 1 - dt / F.leben; s.set(k, k, 0.5 + vel.length() * 0.05); m.compose(v, q, s); funkenW.setMatrixAt(i, m); }
  funkenW.instanceMatrix.needsUpdate = true; };

// ---------- Goldstaub (wenn Schatten zerfallen) ----------
const GMAX = 900; export const STAUB = [];
export const staubW = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.09, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 3.2, 1.2) }), GMAX); staubW.frustumCulled = false; scene.add(staubW);
export const staubAnlegen = (x, y, z, t0, n = 40, r = 1.5) => { for (let i = 0; i < n && STAUB.length < GMAX; i++) STAUB.push({ x: x + (rnd() - 0.5) * r * 2, y: y + rnd() * r, z: z + (rnd() - 0.5) * r * 2, t0: t0 + rnd() * 0.8, v: 0.8 + rnd() * 2.2, ph: rnd() * 6, leben: 1.6 + rnd() * 1.6 }); };
export const staubSetzen = (t) => { const m = new THREE.Matrix4();
  for (let i = 0; i < GMAX; i++) { const S = STAUB[i]; const dt = S ? t - S.t0 : -1; if (!S || dt < 0 || dt > S.leben) { m.makeScale(0, 0, 0); staubW.setMatrixAt(i, m); continue; }
    const k = Math.sin(Math.PI * dt / S.leben); m.makeRotationY(dt * 3 + S.ph); m.setPosition(S.x + Math.sin(dt * 2 + S.ph) * 0.4, S.y + dt * S.v, S.z + Math.cos(dt * 1.7 + S.ph) * 0.4); m.scale(new THREE.Vector3(k, k, k)); staubW.setMatrixAt(i, m); }
  staubW.instanceMatrix.needsUpdate = true; };
export { rnd };
