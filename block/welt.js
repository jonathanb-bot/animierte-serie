// Nachtstadt: Renderer, Himmel, Stadt (Instanzen + Fenster-Shader), Boden, Laternen, Autos, Kraftwerk.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const W = 720, H = 1280;
export const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
export const scene = new THREE.Scene();
export const cam = new THREE.PerspectiveCamera(55, W / H, 0.1, 3000);
export const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, cam));
export const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.55, 0.5, 0.92); composer.addPass(bloom);
// Farbabstufung + Vignette + leichte Körnung
export const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uVig: { value: 0.35 }, uWarm: { value: 0 }, uT: { value: 0 }, uFlash: { value: 0 }, uWisch: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uVig, uWarm, uT, uFlash, uWisch; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + uT*3.1)*43758.5453); }
    void main(){ vec4 c = texture2D(tDiffuse, vUv);
      if (uWisch > 0.001) { vec4 a = vec4(0.); for (int i = 0; i < 16; i++) { float o = (float(i) / 15. - 0.5) * uWisch * 0.12; a += texture2D(tDiffuse, vUv + vec2(o, 0.)); } c = a / 16.; }   // Wisch-Übergang (Vergleich 24.11.)
      vec2 d = vUv - 0.5; d.x *= 0.75;
      c.rgb *= 1.0 - uVig * smoothstep(0.25, 0.75, length(d));
      c.rgb = mix(c.rgb, c.rgb * vec3(1.08, 0.98, 0.86), uWarm);
      c.rgb = mix(c.rgb, vec3(1.0, 0.97, 0.9) * 2.0, uFlash);
      gl_FragColor = c; }` });
composer.addPass(grade);
composer.addPass(new OutputPass());

export const U = { uWolken: { value: 0 }, uGewitter: { value: 0 }, uAbend: { value: 0 }, uT: { value: 0 }, uAus: { value: 1e6 }, uTag: { value: 0 }, uGold: { value: 0 }, uMond: { value: 1 }, uAn: { value: 1e6 } };
export const PLANT = new THREE.Vector2(0, -520);
export const P = 48, BLOCK = 36, N = 7;                 // Raster: Blöcke 36 m, Straßen 12 m
export const PLATZ = 66;                                // großer Platz in der Mitte (|x|,|z| < PLATZ)
let seed = 7; export const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const hashJS = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
// Strom pro Viertel (gleiche Formel wie im Shader)
const GLSL_STROM = `
  float hs(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float strom(vec2 w){
    vec2 d = floor((w + vec2(384.)) / 96.);
    float ord = hs(d) * 0.6 + length(w - vec2(${PLANT.x.toFixed(1)}, ${PLANT.y.toFixed(1)})) / 260.0;
    float tOff = uAus + ord;
    float p = 1.0 - step(tOff, uT);
    if (uT > tOff - 0.45 && uT < tOff) p *= step(0.45, fract(sin(floor(uT * 24.) * 12.9 + d.x * 7.1 + d.y * 3.3) * 437.5));
    float tAn = uAn + hs(d.yx) * 0.8;
    p = max(p, step(tAn, uT));
    return p; }
  float stadtGlow(){ return (uT < uAus + 0.3 || uT > uAn + 1.0) ? 1.0 : max(0., 1. - (uT - uAus - 0.3) / 2.5); }
  vec3 horizont(){ vec3 n = mix(vec3(0.025,0.035,0.09), vec3(0.13,0.17,0.36), stadtGlow()); return mix(mix(n, vec3(0.86,0.80,0.74), uTag), vec3(0.55,0.30,0.12), uGold * 0.6); }`;
export const strom = (x, z, t) => { const dx = Math.floor((x + 384) / 96), dz = Math.floor((z + 384) / 96);
  const ord = hashJS(dx, dz) * 0.6 + Math.hypot(x - PLANT.x, z - PLANT.y) / 260; const tOff = U.uAus.value + ord;
  let p = t < tOff ? 1 : 0; if (t > tOff - 0.45 && t < tOff) p *= (Math.sin(Math.floor(t * 24) * 12.9 + dx * 7.1 + dz * 3.3) * 437.5 % 1 + 1) % 1 > 0.45 ? 1 : 0;
  if (t >= U.uAn.value + hashJS(dz, dx) * 0.8) p = 1; return p; };

// ---------- Himmel ----------
export const himmel = new THREE.Mesh(new THREE.SphereGeometry(2500, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: U,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position.z = gl_Position.w; }`,
  fragmentShader: `varying vec3 vP; uniform float uTag, uGold, uT, uAus, uAn, uWolken, uGewitter, uAbend;
    float hh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float rauschen(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(hh(i), hh(i+vec2(1,0)), f.x), mix(hh(i+vec2(0,1)), hh(i+vec2(1,1)), f.x), f.y); }
    float fbm(vec2 p){ float v = 0., a = 0.5; for (int i = 0; i < 5; i++){ v += a * rauschen(p); p *= 2.03; a *= 0.5; } return v; }
    ${GLSL_STROM}
    void main(){ float h = clamp(vP.y, -0.2, 1.);
      vec3 nacht = mix(horizont(), mix(vec3(0.006,0.01,0.03), vec3(0.03,0.05,0.16), stadtGlow()), pow(max(h,0.),0.5));
      // Sterne
      vec3 sg = vP * 110.; vec3 sp = floor(sg); vec3 sf = fract(sg) - 0.5; float sh = fract(sin(dot(sp, vec3(12.99, 78.23, 37.71))) * 43758.5); float s = step(0.986, sh) * smoothstep(0.16, 0.0, length(sf)) * smoothstep(0.05, 0.3, h);
      nacht += s * vec3(0.9,0.95,1.0) * (0.5 + 0.7 * fract(sh * 91.)) * (1. - uTag);
      vec3 tag = mix(vec3(0.86,0.80,0.74), vec3(0.30,0.52,0.90), pow(max(h,0.),0.45));
      // Bilderbuch-Himmel (Vergleich 24.11.): kräftiges Blau mit weichen Wolken, nur mit U.uWolken = 1
      if (uWolken > 0.) { vec3 blau = mix(vec3(0.30,0.56,0.92), vec3(0.06,0.24,0.72), pow(max(h,0.),0.5));
        vec2 wp = vP.xz / max(vP.y + 0.08, 0.05) * 1.6; float w = smoothstep(0.5, 0.74, fbm(wp + vec2(uT * 0.004, 0.))) * smoothstep(0.0, 0.12, h);
        vec3 wolke = mix(vec3(0.82,0.86,0.94), vec3(1.15,1.15,1.12), smoothstep(0.55, 0.85, fbm(wp * 1.3 + 3.1)));
        blau = mix(blau, mix(vec3(0.95,0.34,0.14), vec3(0.26,0.12,0.46), pow(max(h,0.),0.5)), uAbend); wolke = mix(wolke, vec3(1.05,0.62,0.52), uAbend * 0.8);   // Abendrot (Vergleich 24.11.)
        blau = mix(blau, vec3(0.32,0.36,0.44), uGewitter); wolke = mix(wolke, vec3(0.16,0.17,0.2) * (0.8 + 0.4 * fbm(wp * 2.)), uGewitter); w = mix(w, smoothstep(0.35, 0.6, fbm(wp + 7.)) * smoothstep(0.0, 0.1, h), uGewitter);   // dunkle Wolken ziehen auf
        tag = mix(tag, mix(blau, wolke, w), uWolken); }
      vec3 c = mix(nacht, tag, uTag * (1. - uGold));
      c = mix(c, mix(horizont(), vec3(0.05,0.02,0.04), pow(max(h,0.),0.5)), uGold * (1. - uTag));
      gl_FragColor = vec4(c, 1.); }` }));
scene.add(himmel);
export const mond = new THREE.Mesh(new THREE.SphereGeometry(40, 32, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.2, 2.0), fog: false }));
mond.position.set(-900, 1000, -1500); scene.add(mond);
scene.fog = new THREE.FogExp2(new THREE.Color("#0c1230"), 0.0016);

// ---------- Licht für Figuren/Requisiten ----------
export const hemi = new THREE.HemisphereLight("#5a6ab0", "#141018", 0.6); scene.add(hemi);
export const mondLicht = new THREE.DirectionalLight("#8aa0ff", 0.5); mondLicht.position.set(-300, 500, -400); scene.add(mondLicht);
export const key = new THREE.DirectionalLight("#ffd8b0", 1.6); key.position.set(10, 20, 10); scene.add(key); scene.add(key.target);
export const rim = new THREE.DirectionalLight("#9ab8ff", 1.0); rim.position.set(-10, 10, -10); scene.add(rim); scene.add(rim.target);

// ---------- Gebäude (eine Instanz-Zeichnung für die ganze Stadt) ----------
const gebaeudeMat = new THREE.ShaderMaterial({ uniforms: U, fog: false,
  vertexShader: `attribute float aSeed; attribute vec3 aFarbe; varying vec3 vW, vN, vFarbe; varying vec2 vUV, vGr; varying float vSeed, vFace;
    void main(){ vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.); vW = wp.xyz;
      vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
      vN = normalize(mat3(instanceMatrix) * normal);
      bool sx = abs(normal.x) > 0.5; vUV = vec2(sx ? (position.z + 0.5) * sc.z : (position.x + 0.5) * sc.x, position.y * sc.y);
      vGr = vec2(sx ? sc.z : sc.x, sc.y); vSeed = aSeed; vFarbe = aFarbe; vFace = sx ? (normal.x > 0. ? 1. : 2.) : (normal.z > 0. ? 3. : 4.);
      gl_Position = projectionMatrix * viewMatrix * wp; }`,
  fragmentShader: `uniform float uT, uAus, uTag, uGold, uAn, uWolken; varying vec3 vW, vN, vFarbe; varying vec2 vUV, vGr; varying float vSeed, vFace;
    ${GLSL_STROM}
    void main(){ vec3 n = normalize(vN); vec3 base = vFarbe;
      float pw = strom(vW.xz);
      vec3 nacht = base * (0.05 + 0.07 * max(n.y, 0.) + 0.06 * max(dot(n, normalize(vec3(-0.5, 0.4, -0.6))), 0.) + 0.10 * (1. - clamp(vW.y / 90., 0., 1.)) * pw);
      vec3 sunD = normalize(vec3(0.5, 0.6, 0.35));
      // Bilderbuch-Fassaden am Tag (Vergleich 24.11.): Pastellfarben pro Haus, nur mit U.uWolken = 1
      float pk = floor(fract(vSeed * 7.31) * 7.);
      vec3 pastell = pk < 1. ? vec3(0.38,0.58,0.86) : pk < 2. ? vec3(0.90,0.56,0.62) : pk < 3. ? vec3(0.56,0.80,0.52) : pk < 4. ? vec3(0.94,0.78,0.42) : pk < 5. ? vec3(0.66,0.56,0.90) : pk < 6. ? vec3(0.86,0.84,0.80) : vec3(0.40,0.76,0.82);
      vec3 tag = mix(base * 1.9, pastell * 0.46, uWolken) * (0.42 + 0.6 * max(dot(n, sunD), 0.) + 0.15 * n.y);
      vec3 c = mix(nacht, tag, uTag);
      if (abs(n.y) < 0.5) {
        vec2 q = vec2(vUV.x / 3.0, vUV.y / 3.6); vec2 cell = floor(q); vec2 f = fract(q);
        float win = step(0.16, f.x) * step(f.x, 0.84) * step(0.2, f.y) * step(f.y, 0.82);
        win *= step(1.0, cell.y) * step(vUV.y, vGr.y - 1.2) * step(0.6, vUV.x) * step(vUV.x, vGr.x - 0.6);
        float sd = floor(vSeed + 0.5), fc = floor(vFace + 0.5);
        float r = hs(cell + vec2(sd * 1.31, fc * 0.73));
        float lit = step(0.52, r) * pw * (1. - uTag);
        vec3 wc = mix(mix(vec3(1.0, 0.62, 0.28), vec3(1.0, 0.82, 0.55), hs(cell * 2.3)), vec3(0.62, 0.78, 1.0), step(0.86, hs(cell * 1.7 + sd * 0.1)));
        wc *= 0.55 + 1.1 * pow(hs(cell + 3.3), 2.);
        vec3 glasN = vec3(0.015, 0.02, 0.035) + vec3(0.02, 0.03, 0.06) * (1. - pw);
        vec3 glasT = vec3(0.30, 0.40, 0.52) + 0.25 * max(dot(reflect(-sunD, n), vec3(0,1,0)), 0.);
        vec3 detail = mix(c, mix(glasN + wc * lit, glasT, uTag), win);
        detail *= 1. - 0.25 * step(0.94, fract(vUV.y / 3.6)) * (1. - win);
        float px = max(fwidth(q.x), fwidth(q.y));
        float scharf = 1. - smoothstep(0.22, 0.6, px);
        vec3 mittel = mix(c, mix(glasN + vec3(1.0, 0.68, 0.36) * 0.62 * 0.48 * pw * (1. - uTag), glasT, uTag), 0.42) * 0.94;
        c = mix(mittel, detail, scharf);
      } else { c *= 0.7; }
      c += uGold * vec3(1.0, 0.55, 0.2) * base * (0.35 + 0.5 * max(n.y, 0.) + 0.25 * (1. - abs(n.y)));
      float d = length(vW - cameraPosition);
      c = mix(c, mix(horizont(), vec3(0.55,0.70,0.90), uWolken * uTag), 1. - exp(-d * mix(0.0010, 0.0005, uTag) * (1. - 0.55 * uWolken)));
      gl_FragColor = vec4(c, 1.); }` });
export const LOTS = [];  // {x, z, w, d, h}
{ const farben = ["#3a3f52", "#4a4552", "#2f3a4a", "#55504a", "#3f4a4a", "#5a5560", "#353a45", "#6a6258", "#48505e"].map(c => new THREE.Color(c));
  for (let i = -N; i <= N; i++) for (let j = -N; j <= N; j++) {
    const cx = i * P, cz = j * P;
    if (Math.abs(cx) < PLATZ && Math.abs(cz) < PLATZ) continue;
    const r = Math.hypot(cx, cz); const zentrum = Math.exp(-(r * r) / (2 * 170 * 170));
    const teil = rnd() < 0.35 ? 1 : rnd() < 0.6 ? 2 : 4;
    const lots = teil === 1 ? [[0, 0, 34, 34]] : teil === 2 ? (rnd() < 0.5 ? [[-8.75, 0, 16.5, 34], [8.75, 0, 16.5, 34]] : [[0, -8.75, 34, 16.5], [0, 8.75, 34, 16.5]]) : [[-8.75, -8.75, 16.5, 16.5], [8.75, -8.75, 16.5, 16.5], [-8.75, 8.75, 16.5, 16.5], [8.75, 8.75, 16.5, 16.5]];
    for (const [ox, oz, w, d] of lots) {
      let h = 12 + rnd() * 26 + zentrum * (40 + rnd() * 130) * (rnd() < 0.8 ? 1 : 0.3);
      if (r > 300) h *= 0.7;
      const s = 0.82 + rnd() * 0.16;
      LOTS.push({ x: cx + ox, z: cz + oz, w: w * s, d: d * s, h, farbe: farben[Math.floor(rnd() * farben.length)] });
      if (h > 70 && rnd() < 0.5) LOTS.push({ x: cx + ox, z: cz + oz, w: w * s * 0.65, d: d * s * 0.65, h: h + 10 + rnd() * 25, farbe: farben[Math.floor(rnd() * farben.length)], aufsatz: true });
    } } }
export let gebaeude;
{ const g = new THREE.BoxGeometry(1, 1, 1); g.translate(0, 0.5, 0);
  gebaeude = new THREE.InstancedMesh(g, gebaeudeMat, LOTS.length);
  const seeds = new Float32Array(LOTS.length), farbe = new Float32Array(LOTS.length * 3); const m = new THREE.Matrix4();
  LOTS.forEach((l, k) => { m.compose(new THREE.Vector3(l.x, 0, l.z), new THREE.Quaternion(), new THREE.Vector3(l.w, l.h, l.d)); gebaeude.setMatrixAt(k, m); seeds[k] = Math.floor(rnd() * 100); l.farbe.toArray(farbe, k * 3); });
  g.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1)); g.setAttribute("aFarbe", new THREE.InstancedBufferAttribute(farbe, 3));
  gebaeude.frustumCulled = false; scene.add(gebaeude); }
// rote Flugwarnlichter auf hohen Häusern
export const warnlichter = new THREE.InstancedMesh(new THREE.SphereGeometry(0.5, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 0.3, 0.2) }), 200);
{ let k = 0; const m = new THREE.Matrix4(); for (const l of LOTS) if (l.h > 75 && k < 200) { m.makeTranslation(l.x, l.h + 0.6, l.z); warnlichter.setMatrixAt(k++, m); } warnlichter.count = k; scene.add(warnlichter); }

// ---------- Boden: Straßen, Gehwege, Platz, Lichtkegel der Laternen ----------
export const boden = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({ uniforms: U, fog: false,
  vertexShader: `varying vec3 vW; void main(){ vec4 wp = modelMatrix * vec4(position, 1.); vW = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`,
  fragmentShader: `uniform float uT, uAus, uTag, uGold, uAn, uWolken; varying vec3 vW;
    ${GLSL_STROM}
    void main(){ vec2 w = vW.xz; vec2 q = mod(w + 24., 48.) - 24.; vec2 a = abs(q);
      bool stadt = abs(w.x) < 360. && abs(w.y) < 360.;
      float fein = 1. - smoothstep(0.12, 0.45, max(fwidth(w.x), fwidth(w.y)));
      bool platz = abs(w.x) < ${PLATZ - 6}. && abs(w.y) < ${PLATZ - 6}.;
      float strasse = (a.x > 18. || a.y > 18.) ? 1. : 0.;
      vec3 c;
      if (!stadt) { c = mix(vec3(0.03,0.05,0.03), vec3(0.32,0.45,0.22), uTag); float wege = step(abs(mod(w.x, 200.) - 100.), 4.) + step(abs(mod(w.y, 200.) - 100.), 4.); c = mix(c, mix(vec3(0.05),vec3(0.35),uTag), min(wege, 1.) * 0.7); }
      else if (platz) { vec2 t = fract(w / 3.); float fuge = step(0.95, max(t.x, t.y)); c = mix(vec3(0.16,0.15,0.15), vec3(0.62,0.6,0.56), uTag) * (1. - 0.25 * fuge * fein) * (0.92 + 0.08 * hs(floor(w / 3.)));
        float ring = abs(length(w) - 30.); c = mix(c, c * 1.25, step(ring, 1.2)); }
      else if (strasse > 0.5) { c = mix(vec3(0.045,0.048,0.058), vec3(0.24,0.25,0.27), uTag);
        float rand = (a.x > 18. && a.x < 20.5 && a.y < 18.) || (a.y > 18. && a.y < 20.5 && a.x < 18.) ? 1. : 0.;
        c = mix(c, mix(vec3(0.12,0.12,0.13), vec3(0.55,0.54,0.52), uTag), rand);
        float mitte = (a.x > 23.75 && a.y < 18. && fract(w.y / 6.) < 0.5) || (a.y > 23.75 && a.x < 18. && fract(w.x / 6.) < 0.5) ? 1. : 0.;
        c = mix(c, mix(vec3(0.5,0.45,0.25), vec3(0.95,0.9,0.7), uTag), mitte * 0.7 * fein);
        float zebra = (a.x > 20.5 && a.y < 24. && a.y > 20. && fract(w.x / 1.2) < 0.5) || (a.y > 20.5 && a.x < 24. && a.x > 20. && fract(w.y / 1.2) < 0.5) ? 1. : 0.;
        c = mix(c, mix(vec3(0.35),vec3(0.9),uTag), zebra * 0.6 * fein); }
      else { c = mix(vec3(0.07,0.07,0.08), vec3(0.45,0.44,0.42), uTag); }
      // Laternen an den Ecken: warme Lichtpfützen
      vec2 e = abs(mod(w, 48.) - 24.) - 5.5; float dl = length(e);
      float pool = exp(-dl * dl / 70.) * (stadt && !platz ? 1. : 0.) * strom(w) * (1. - uTag);
      c += vec3(1.0, 0.62, 0.3) * pool * 0.55;
      c += uGold * vec3(1.0, 0.55, 0.2) * 0.45 * (stadt ? 1. : 0.5);
      float d = length(vW - cameraPosition);
      c = mix(c, mix(horizont(), vec3(0.55,0.70,0.90), uWolken * uTag), 1. - exp(-d * mix(0.0010, 0.0005, uTag) * (1. - 0.55 * uWolken)));
      gl_FragColor = vec4(c, 1.); }` }));
scene.add(boden);

// ---------- Straßenlaternen (Instanzen) ----------
export const LAMPEN = [];
for (let i = -N; i < N; i++) for (let j = -N; j < N; j++) { const cx = i * P + 24, cz = j * P + 24; for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const x = cx + sx * 5.5, z = cz + sz * 5.5; if (Math.abs(x) < PLATZ - 4 && Math.abs(z) < PLATZ - 4) continue; LAMPEN.push([x, z, Math.atan2(-sx, -sz)]); } }
const mastGeo = mergeGeometries([new THREE.CylinderGeometry(0.12, 0.18, 7, 8).translate(0, 3.5, 0), new THREE.BoxGeometry(0.15, 0.15, 1.6).translate(0, 7, 0.7)]);
export const masten = new THREE.InstancedMesh(mastGeo, new THREE.MeshStandardMaterial({ color: "#22252c", roughness: 0.5, metalness: 0.5 }), LAMPEN.length);
export const koepfe = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.18, 0.7), new THREE.MeshBasicMaterial({ color: "#ffffff" }), LAMPEN.length);
{ const m = new THREE.Matrix4(), q = new THREE.Quaternion();
  LAMPEN.forEach(([x, z, ry], k) => { q.setFromEuler(new THREE.Euler(0, ry, 0));
    m.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(1, 1, 1)); masten.setMatrixAt(k, m); const v = new THREE.Vector3(0, 6.9, 1.3).applyQuaternion(q); m.makeTranslation(x + v.x, v.y, z + v.z); koepfe.setMatrixAt(k, m); koepfe.setColorAt(k, new THREE.Color(3, 2, 1)); });
  scene.add(masten, koepfe); }
export const lampenAktualisieren = (t) => { const c = new THREE.Color(); LAMPEN.forEach(([x, z], k) => { const p = strom(x, z, t) * (1 - U.uTag.value); c.setRGB(0.1 + 2.9 * p, 0.1 + 1.9 * p, 0.1 + 0.9 * p); koepfe.setColorAt(k, c); }); koepfe.instanceColor.needsUpdate = true; };

// ---------- Kraftwerk ----------
export const kraftwerk = new THREE.Group(); scene.add(kraftwerk); kraftwerk.position.set(PLANT.x, 0, PLANT.y);
export const KW = {};
{ const beton = new THREE.MeshStandardMaterial({ color: "#8a8a8e", roughness: 0.9 }), dunkel = new THREE.MeshStandardMaterial({ color: "#3a3d45", roughness: 0.7, metalness: 0.3 });
  const profil = []; for (let i = 0; i <= 20; i++) { const y = i / 20; profil.push(new THREE.Vector2(26 - 14 * Math.sin(y * Math.PI * 0.85) + y * 4, y * 70)); }
  for (const [x, z] of [[-60, -40], [10, -60]]) { const t = new THREE.Mesh(new THREE.LatheGeometry(profil, 48), beton); t.position.set(x, 0, z); kraftwerk.add(t);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(27.4, 0.6, 8, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 0.4, 0.3) })); ring.rotation.x = Math.PI / 2; ring.position.set(x, 70, z); kraftwerk.add(ring); }
  const halle = new THREE.Mesh(new THREE.BoxGeometry(80, 28, 40), dunkel); halle.position.set(30, 14, 30); kraftwerk.add(halle);
  const halle2 = new THREE.Mesh(new THREE.BoxGeometry(40, 18, 30), dunkel); halle2.position.set(-30, 9, 40); kraftwerk.add(halle2);
  const schlot = new THREE.Mesh(new THREE.CylinderGeometry(3, 4.5, 110, 24), new THREE.MeshStandardMaterial({ color: "#c8c4c0", roughness: 0.8 })); schlot.position.set(70, 55, -10); kraftwerk.add(schlot);
  for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(3.05 + 0.3 * (3 - i) / 3, 3.1 + 0.4 * (3 - i) / 3, 6, 24), new THREE.MeshStandardMaterial({ color: "#b8302a", roughness: 0.7 })); b.position.set(70, 85 + i * 6.5 - 20 * (i % 2), -10); if (i % 2 === 0) kraftwerk.add(b); }
  const fensterTex = (() => { const c = document.createElement("canvas"); c.width = 512; c.height = 128; const x = c.getContext("2d"); x.fillStyle = "#000"; x.fillRect(0, 0, 512, 128);
    for (let i = 0; i < 24; i++) for (let j = 0; j < 4; j++) { x.fillStyle = Math.random() < 0.8 ? "#ffd08a" : "#9fc8ff"; x.fillRect(i * 21 + 4, j * 32 + 8, 13, 16); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  KW.fensterMat = new THREE.MeshBasicMaterial({ map: fensterTex, color: new THREE.Color(2.2, 2.2, 2.2) });
  const fw = new THREE.Mesh(new THREE.PlaneGeometry(78, 20), KW.fensterMat); fw.position.set(30, 15, 50.1); kraftwerk.add(fw);
  // Trafo-Hof
  KW.trafos = []; const trafoM = new THREE.MeshStandardMaterial({ color: "#5a6470", roughness: 0.6, metalness: 0.4 }), iso = new THREE.MeshStandardMaterial({ color: "#c8b8a0", roughness: 0.4 });
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { const g = new THREE.Group(); const k = new THREE.Mesh(new RoundedBoxGeometry(6, 5, 4, 2, 0.3), trafoM); k.position.y = 2.5; g.add(k);
    for (let r = 0; r < 4; r++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4, 3.6), trafoM); f.position.set(-3.2, 2.5, -1.4 + r * 0.95); g.add(f); }
    for (let r = 0; r < 3; r++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 2.2, 10), iso); s.position.set(-1.6 + r * 1.6, 6.1, 0); g.add(s); for (let q = 0; q < 4; q++) { const sch = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 12), iso); sch.position.set(-1.6 + r * 1.6, 5.3 + q * 0.5, 0); g.add(sch); } }
    g.position.set(-40 + i * 12, 0, 95 + j * 12); kraftwerk.add(g); KW.trafos.push(g); }
  // Flutlichter
  KW.flut = []; for (const [x, z] of [[-58, 85], [0, 85], [-58, 125], [0, 125], [60, 60]]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 14, 8), dunkel); m.position.set(x, 7, z); kraftwerk.add(m);
    const k = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 0.6), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 3.6, 3) })); k.position.set(x, 14.2, z); kraftwerk.add(k); KW.flut.push(k); }
  KW.licht = new THREE.PointLight("#ffe0b0", 0, 120, 1.6); KW.licht.position.set(-20, 18, 110); kraftwerk.add(KW.licht); }
// Strommasten vom Kraftwerk zur Stadt
export const STROMMASTEN = [];
{ const st = new THREE.MeshStandardMaterial({ color: "#4a4e58", roughness: 0.5, metalness: 0.6 });
  for (let k = 0; k < 6; k++) { const z = PLANT.y + 150 + k * 40; const g = new THREE.Group();
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.35, 32, 0.35), st); b.position.set(sx * (2.4 - 0), 16, sz * 2.4); b.rotation.z = -sx * 0.06; b.rotation.x = sz * 0.06; g.add(b); }
    for (const y of [20, 26, 31]) { const a = new THREE.Mesh(new THREE.BoxGeometry(y === 31 ? 8 : 14, 0.35, 0.35), st); a.position.y = y; g.add(a); }
    g.position.set(-20, 0, z); scene.add(g); STROMMASTEN.push(g); } }

// ---------- Autos (Instanzen, fahren auf den Straßen) ----------
export const AUTOS = [];
{ const farben = ["#b8302a", "#2a5ab8", "#e8e8e8", "#1a1a1e", "#c8a020", "#3a8a5a", "#8a8a90", "#5a2a7a"];
  for (let k = 0; k < 420; k++) { const achse = rnd() < 0.5 ? "x" : "z"; const linie = (Math.floor(rnd() * 15) - 7) * P + 24; const richtung = rnd() < 0.5 ? 1 : -1;
    const spur = linie + richtung * 3.2 * (achse === "x" ? -1 : 1); if (Math.abs(linie) < PLATZ) continue;
    AUTOS.push({ achse, spur, richtung, pos: rnd() * 720 - 360, v: 9 + rnd() * 7, farbe: new THREE.Color(farben[Math.floor(rnd() * farben.length)]) }); } }
const autoGeo = mergeGeometries([new RoundedBoxGeometry(2.0, 0.9, 4.3, 2, 0.25).translate(0, 0.75, 0), new RoundedBoxGeometry(1.8, 0.75, 2.2, 2, 0.25).translate(0, 1.5, -0.25)]).scale(1.7, 1.7, 1.7);
export const autoKoerper = new THREE.InstancedMesh(autoGeo, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.35, metalness: 0.4 }), AUTOS.length);
export const autoFront = new THREE.InstancedMesh(mergeGeometries([new THREE.BoxGeometry(0.45, 0.22, 0.1).translate(-0.65, 0.85, 2.16), new THREE.BoxGeometry(0.45, 0.22, 0.1).translate(0.65, 0.85, 2.16)]).scale(1.7, 1.7, 1.7), new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 5.6, 4.6) }), AUTOS.length);
export const autoHeck = new THREE.InstancedMesh(mergeGeometries([new THREE.BoxGeometry(0.5, 0.2, 0.1).translate(-0.65, 0.95, -2.16), new THREE.BoxGeometry(0.5, 0.2, 0.1).translate(0.65, 0.95, -2.16)]).scale(1.7, 1.7, 1.7), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.5, 0.15, 0.1) }), AUTOS.length);
AUTOS.forEach((a, k) => autoKoerper.setColorAt(k, a.farbe)); scene.add(autoKoerper, autoFront, autoHeck);
autoKoerper.frustumCulled = autoFront.frustumCulled = autoHeck.frustumCulled = false;
export const autosSetzen = (t, stopp = 1e9, aus = new Set(), weg = null) => { const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
  AUTOS.forEach((a, k) => { const tt = Math.min(t, stopp + 1.5 * (1 - Math.exp(-Math.max(0, t - stopp)))); let p = ((a.pos + a.richtung * a.v * tt + 360) % 720 + 720) % 720 - 360;
    if (a.achse === "x") { v.set(p, 0, a.spur); e.set(0, a.richtung > 0 ? Math.PI / 2 : -Math.PI / 2, 0); } else { v.set(a.spur, 0, p); e.set(0, a.richtung > 0 ? 0 : Math.PI, 0); }
    a.x = v.x; a.z = v.z; a.ry = e.y; q.setFromEuler(e); m.compose(v, q, weg && weg(v) ? new THREE.Vector3(0, 0, 0) : s); autoKoerper.setMatrixAt(k, m); autoFront.setMatrixAt(k, aus.has(k) ? m.clone().scale(new THREE.Vector3(0, 0, 0)) : m); autoHeck.setMatrixAt(k, m); });
  autoKoerper.instanceMatrix.needsUpdate = autoFront.instanceMatrix.needsUpdate = autoHeck.instanceMatrix.needsUpdate = true; };

// ---------- Lichtkegel (additiv, für Scheinwerfer, Taschenlampe, Suchscheinwerfer) ----------
const kegelMat = (farbe, staerke) => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
  uniforms: { uFarbe: { value: new THREE.Color(farbe) }, uS: { value: staerke } },
  vertexShader: `varying float vL; varying vec3 vN, vV; void main(){ vL = -position.y; vec4 mv = modelViewMatrix * vec4(position, 1.); vV = normalize(-mv.xyz); vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform vec3 uFarbe; uniform float uS; varying float vL; varying vec3 vN, vV;
    void main(){ float f = pow(abs(dot(normalize(vN), normalize(vV))), 1.6); float a = (1. - smoothstep(0.0, 1.0, vL)) * f * uS; gl_FragColor = vec4(uFarbe * a, 1.); }` });
export const kegel = (farbe = "#ffe8c0", staerke = 0.35, laenge = 30, radius = 6) => { const g = new THREE.ConeGeometry(radius, laenge, 32, 1, true); g.translate(0, -laenge / 2, 0); g.scale(1 / laenge, 1 / laenge, 1 / laenge);
  const m = new THREE.Mesh(g, kegelMat(farbe, staerke)); m.scale.setScalar(laenge); m.userData.richte = (von, nach) => { m.position.copy(von); const d = nach.clone().sub(von); const l = d.length(); m.scale.set(l, l, l); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), d.normalize()); };
  m.frustumCulled = false; scene.add(m); return m; };
export const suchkegel = [0, 1, 2, 3].map(i => kegel("#cfe0ff", 0.16, 900, 40));

export { THREE, RoundedBoxGeometry, mergeGeometries };
