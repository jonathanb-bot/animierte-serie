/* 3D-Kulisse „Der Fluchtwagen“ (Jonathans Wunsch 16.11., nach dem Vorbild „Das perfekte Fluchtfahrzeug Teil 2“, eigene Umsetzung).
   Echtes 3D mit three.js (WebGL, im Container/auf GitHub per SwiftShader ohne Grafikkarte). Wird mit esbuild zu engine/drei.js
   gebündelt (klassisches Skript, weil die Engine per file:// lädt):  npm run drei  (siehe drei/LIESMICH.md)
   Die Engine-Kulisse `[drei einstellung=… ]` (engine/flucht.js) zeichnet das 3D-Bild in die 2D-Leinwand; Untertitel, `ein=`,
   Hook-Text und Ton laufen wie bei jeder Folge.

   Einstellungen: verfolger | seite | front | boden | waerme | weg | totale
   Angaben: strahl=1 (Suchscheinwerfer an), strahl_aus=t (Strahl verliert das Auto ab t Sekunden), auto=0 (leere Straße),
            tempo=62 (m/s), gas=1 (beschleunigt), zeit=nacht
*/
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

let welt = null;

function bauen(W, H) {
  const canvas = new OffscreenCanvas(W, H); // OffscreenCanvas: von engine/ss.js nicht umgerechnet, W/H sind echte Pixel
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  if (!renderer.getContext()) throw new Error('drei: kein WebGL');
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.9;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#05070d');
  scene.fog = new THREE.FogExp2('#070a14', 0.012);
  const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 1500);
  scene.add(new THREE.HemisphereLight('#3a4a70', '#0a0a10', 0.35));
  const pmrem = new THREE.PMREMGenerator(renderer); const umgebung = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const mond = new THREE.DirectionalLight('#8aa0d0', 0.6); mond.position.set(-30, 60, 40); scene.add(mond);
  const lampen = [0, 1, 2].map(() => { const l = new THREE.PointLight('#ffd9a0', 60, 26, 1.4); scene.add(l); return l; });
  // Sterne
  { const g = new THREE.BufferGeometry(), p = []; let s = 3; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 600; i++) { const a = r() * Math.PI * 2, h = 0.15 + r() * 0.8; p.push(Math.cos(a) * 900, 900 * h, Math.sin(a) * 900); }
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    const st = new THREE.Points(g, new THREE.PointsMaterial({ color: '#aab8e0', size: 1.6, sizeAttenuation: false, fog: false })); scene.add(st); welt_sterne = st; }

  // ---------- Straße ----------
  const LEN = 3200, Z0 = 200;
  const asphalt = new THREE.MeshStandardMaterial({ color: '#15171c', roughness: 0.42, metalness: 0.15 });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(22, LEN), asphalt); road.rotation.x = -Math.PI / 2; road.position.z = Z0 - LEN / 2; scene.add(road);
  const gras = new THREE.Mesh(new THREE.PlaneGeometry(600, LEN), new THREE.MeshStandardMaterial({ color: '#080c0a', roughness: 1 }));
  gras.rotation.x = -Math.PI / 2; gras.position.set(0, -0.02, Z0 - LEN / 2); scene.add(gras);
  const weiss = new THREE.MeshStandardMaterial({ color: '#d8dce4', emissive: '#30343c', roughness: 0.6 });
  const strich = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.16, 6), weiss, 2 * Math.ceil(LEN / 18) + 2);
  { let n = 0; const m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    for (const x of [-3.6, 3.6]) for (let z = Z0; z > Z0 - LEN; z -= 18) { m4.compose(new THREE.Vector3(x, 0.01, z), q, new THREE.Vector3(1, 1, 1)); strich.setMatrixAt(n++, m4); }
    strich.count = n; scene.add(strich); }
  for (const x of [-10.6, 10.6]) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.2, LEN), weiss); l.rotation.x = -Math.PI / 2; l.position.set(x, 0.01, Z0 - LEN / 2); scene.add(l); }
  const beton = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, LEN), new THREE.MeshStandardMaterial({ color: '#4a4c52', roughness: 0.85 })); beton.position.set(-11.6, 0.55, Z0 - LEN / 2); scene.add(beton);
  const planke = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.35, LEN), new THREE.MeshStandardMaterial({ color: '#8a9098', roughness: 0.3, metalness: 0.8 })); planke.position.set(11.6, 0.7, Z0 - LEN / 2); scene.add(planke);
  // Leitplankenpfosten (Bewegung in der Seitenansicht)
  { const pf = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.7, 0.12), planke.material, Math.ceil(LEN / 4)); const m4 = new THREE.Matrix4(); let n = 0;
    for (let z = Z0; z > Z0 - LEN; z -= 4) { m4.makeTranslation(11.65, 0.35, z); pf.setMatrixAt(n++, m4); } pf.count = n; scene.add(pf); }

  const kegelMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { farbe: { value: new THREE.Color('#ffd9a0') }, staerke: { value: 0.1 } },
    vertexShader: 'varying float vY; varying vec3 vN; varying vec3 vV; void main(){ vY=uv.y; vec4 mv=modelViewMatrix*vec4(position,1.); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 farbe; uniform float staerke; varying float vY; varying vec3 vN; varying vec3 vV; void main(){ float rand=pow(abs(dot(vN,vV)),1.5); gl_FragColor=vec4(farbe*staerke*rand*pow(vY,1.4),1.); }' });
  const radial = (stops) => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const r = g.createRadialGradient(128, 128, 0, 128, 128, 128); for (const [o, col] of stops) r.addColorStop(o, col); g.fillStyle = r; g.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c); };
  const pfuetzeTex = radial([[0, 'rgba(255,220,170,1)'], [0.4, 'rgba(255,200,140,.35)'], [1, 'rgba(255,200,140,0)']]);
  const pfuetzeMat = new THREE.MeshBasicMaterial({ map: pfuetzeTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55 });
  const mastMat = new THREE.MeshStandardMaterial({ color: '#2a2d33', roughness: 0.6, metalness: 0.5 });
  const kopfMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe6c0').multiplyScalar(6) });
  const lampenDeko = [];
  for (let z = Z0 - 20; z > Z0 - LEN; z -= 42) {
    const x = -11.6, h = 11;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, h, 8), mastMat); mast.position.set(x, h / 2, z); scene.add(mast);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.15, 0.15), mastMat); arm.position.set(x + 2.2, h, z); scene.add(arm);
    const kopf = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.18, 0.4), kopfMat); kopf.position.set(x + 4.2, h - 0.12, z); scene.add(kopf);
    const kegel = new THREE.Mesh(new THREE.ConeGeometry(4.2, h, 24, 1, true), kegelMat); kegel.position.set(x + 4.2, h / 2, z); scene.add(kegel); lampenDeko.push(kegel);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), pfuetzeMat); p.rotation.x = -Math.PI / 2; p.position.set(x + 4.2, 0.02, z); scene.add(p); lampenDeko.push(p);
  }
  const baumMat = new THREE.MeshStandardMaterial({ color: '#05080a', roughness: 1 });
  { let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 420; i++) { const side = i % 2 ? 1 : -1, x = side * (16 + r() * 60), z = Z0 - r() * LEN, h = 6 + r() * 10;
      const b = new THREE.Mesh(new THREE.ConeGeometry(2 + r() * 2, h, 6), baumMat); b.position.set(x, h / 2, z); scene.add(b); } }
  // Schilderbrücke alle 600 m (blaue Autobahnschilder ohne Text)
  for (let z = Z0 - 300; z > Z0 - LEN; z -= 600) {
    for (const x of [-12.2, 12.2]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.3, 7, 0.3), mastMat); p.position.set(x, 3.5, z); scene.add(p); }
    const tr = new THREE.Mesh(new THREE.BoxGeometry(24.4, 0.4, 0.4), mastMat); tr.position.set(0, 7, z); scene.add(tr);
    for (const x of [-5, 5]) { const sc = new THREE.Mesh(new THREE.BoxGeometry(6, 2.4, 0.1), new THREE.MeshStandardMaterial({ color: '#1d4fa8', roughness: 0.4, emissive: '#0a1a40' })); sc.position.set(x, 8.4, z); scene.add(sc);
      const rand = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.08, 0.12), weiss); rand.position.set(x, 9.3, z + 0.02); scene.add(rand); }
  }

  // ---------- Auto: Sportkombi (RS-Form), dunkelrot ----------
  const auto = new THREE.Group(); scene.add(auto); const deko = [];
  const lack = new THREE.MeshPhysicalMaterial({ color: '#6a0d12', metalness: 0.6, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08, envMap: umgebung, envMapIntensity: 0.25 });
  const glas = new THREE.MeshPhysicalMaterial({ color: '#05070a', metalness: 0.2, roughness: 0.05, clearcoat: 1, envMap: umgebung, envMapIntensity: 0.2 });
  const schwarz = new THREE.MeshStandardMaterial({ color: '#0b0c0e', roughness: 0.5 });
  const profil = (pts) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) s.lineTo(p[0], p[1]); return s; };
  const einziehen = (g, ab = 0.92) => { const a = g.attributes.position; for (let i = 0; i < a.count; i++) { const y = a.getY(i); if (y > ab) a.setZ(i, a.getZ(i) * (1 - 0.24 * Math.min(1, (y - ab) / 0.52))); } g.computeVertexNormals(); };
  const karosse = profil([[0.05, 0.32], [0.0, 0.95], [0.12, 1.32], [0.45, 1.44], [2.95, 1.46], [3.55, 1.02], [4.75, 0.86], [4.95, 0.62], [4.9, 0.3], [4.2, 0.28], [4.05, 0.55], [3.35, 0.55], [3.2, 0.28], [1.6, 0.28], [1.45, 0.55], [0.75, 0.55], [0.6, 0.3]]);
  const geo = new THREE.ExtrudeGeometry(karosse, { depth: 1.86, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 4, curveSegments: 4 }); geo.translate(-2.47, 0, -0.93); einziehen(geo);
  const koerper = new THREE.Mesh(geo, lack); koerper.rotation.y = Math.PI / 2; auto.add(koerper);
  const fgeo = new THREE.ExtrudeGeometry(profil([[0.3, 1.0], [0.42, 1.32], [0.6, 1.4], [2.9, 1.42], [3.42, 1.04]]), { depth: 1.9, bevelEnabled: false }); fgeo.translate(-2.47, 0, -0.95); einziehen(fgeo);
  const fm = new THREE.Mesh(fgeo, glas); fm.rotation.y = Math.PI / 2; auto.add(fm);
  // Fensterholm (B-Säule) und Seitenlinie
  for (const x of [-0.93, 0.93]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.4, 0.1), schwarz); b.position.set(x * 0.86, 1.2, 0.0); auto.add(b);
    const sl = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 3.6), new THREE.MeshStandardMaterial({ color: '#2a0508', roughness: 0.4 })); sl.position.set(x * 1.0, 0.72, 0.1); auto.add(sl); }
  const reifen = new THREE.CylinderGeometry(0.36, 0.36, 0.3, 28); reifen.rotateZ(Math.PI / 2);
  const felgeMat = new THREE.MeshStandardMaterial({ color: '#1a1c20', metalness: 0.9, roughness: 0.25 });
  const raeder = [];
  for (const [x, z] of [[-0.86, -1.27], [0.86, -1.27], [-0.86, 1.47], [0.86, 1.47]]) {
    const r = new THREE.Group(); r.add(new THREE.Mesh(reifen, schwarz));
    const felge = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.32, 10).rotateZ(Math.PI / 2), felgeMat); r.add(felge);
    for (let k = 0; k < 5; k++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, 0.05), new THREE.MeshStandardMaterial({ color: '#8a8e96', metalness: 1, roughness: 0.2 })); sp.rotation.x = k * Math.PI / 5; sp.position.x = x > 0 ? 0.13 : -0.13; sp.rotation.z = Math.PI / 2; sp.geometry.rotateX(0); r.add(sp); }
    const bremsS = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.12), new THREE.MeshStandardMaterial({ color: '#c81a1a' })); bremsS.position.set(x > 0 ? 0.1 : -0.1, 0.12, 0.1); r.add(bremsS);
    r.position.set(x, 0.36, z); auto.add(r); raeder.push(r);
  }
  const rotGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff1006').multiplyScalar(3.2) });
  const leiste = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.07, 0.05), rotGlow); leiste.position.set(0, 0.98, 2.57); auto.add(leiste);
  for (const x of [-0.72, 0.72]) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.14, 0.05), rotGlow); e.position.set(x, 0.98, 2.57); auto.add(e); }
  { const hs = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.32, 0.04), new THREE.MeshStandardMaterial({ color: '#040506', roughness: 0.35, metalness: 0.1 })); hs.position.set(0, 1.24, 2.48); hs.rotation.x = -0.25; auto.add(hs);
    const dif = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.24, 0.12), schwarz); dif.position.set(0, 0.42, 2.5); auto.add(dif);
    const rohrMat = new THREE.MeshStandardMaterial({ color: '#2a2a2e', metalness: 1, roughness: 0.3 });
    for (const x of [-0.72, -0.5, 0.5, 0.72]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 16), rohrMat); r.rotation.x = Math.PI / 2; r.scale.set(1.3, 1, 0.8); r.position.set(x, 0.4, 2.57); auto.add(r); }
    const kz = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.12, 0.02), new THREE.MeshStandardMaterial({ color: '#d8dce0', roughness: 0.6 })); kz.position.set(0, 0.68, 2.56); auto.add(kz);
    const kzv = kz.clone(); kzv.position.set(0, 0.42, -2.56); auto.add(kzv);
    // Front: schwarzer Wabengrill mit Rahmen, Lufteinlässe
    const grill = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.36, 0.06), schwarz); grill.position.set(0, 0.52, -2.53); auto.add(grill);
    const rahmen = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.4, 0.04), new THREE.MeshStandardMaterial({ color: '#2a2c30', metalness: 0.8, roughness: 0.3 })); rahmen.position.set(0, 0.52, -2.51); auto.add(rahmen);
    for (const x of [-0.72, 0.72]) { const ein = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.06), schwarz); ein.position.set(x, 0.42, -2.52); auto.add(ein); } }
  { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,40,20,0.9)'); r.addColorStop(0.35, 'rgba(255,20,10,0.35)'); r.addColorStop(1, 'rgba(255,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    const sm = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
    for (const [x, sx] of [[-0.72, 1.3], [0.72, 1.3], [0, 2.6]]) { const sp = new THREE.Sprite(sm); sp.position.set(x, 0.98, 2.75); sp.scale.set(sx, 0.55, 1); auto.add(sp); deko.push(sp); } }
  const bremse = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.05), rotGlow); bremse.position.set(0, 1.4, 2.42); auto.add(bremse);
  const weissGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color('#e8f0ff').multiplyScalar(10) });
  for (const x of [-0.7, 0.7]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 0.05), weissGlow); s.position.set(x, 0.78, -2.5); auto.add(s);
    const tfl = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.025, 0.05), weissGlow); tfl.position.set(x, 0.7, -2.5); tfl.rotation.z = x > 0 ? 0.2 : -0.2; auto.add(tfl); }
  { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(235,242,255,1)'); r.addColorStop(0.3, 'rgba(200,220,255,0.35)'); r.addColorStop(1, 'rgba(200,220,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    const sm = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
    for (const x of [-0.7, 0.7]) { const sp = new THREE.Sprite(sm); sp.position.set(x, 0.78, -2.75); sp.scale.set(0.9, 0.55, 1); auto.add(sp); deko.push(sp); } }
  for (const x of [-0.7, 0.7]) { const sp = new THREE.SpotLight('#eef3ff', 14, 70, 0.38, 0.5, 1.2); sp.position.set(x, 0.8, -2.4); sp.target.position.set(x * 2, 0, -40); auto.add(sp, sp.target); }
  const rueck = new THREE.PointLight('#ff2020', 1.2, 6, 1.5); rueck.position.set(0, 0.9, 3.2); auto.add(rueck);
  const streifTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 512; const g = c.getContext('2d'); const l = g.createLinearGradient(0, 0, 0, 512); l.addColorStop(0, 'rgba(255,40,30,0.9)'); l.addColorStop(1, 'rgba(255,40,30,0)'); g.fillStyle = l; g.fillRect(0, 0, 64, 512); const r = g.createLinearGradient(0, 0, 64, 0); g.globalCompositeOperation = 'destination-in'; r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(0.5, 'rgba(0,0,0,1)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 512); return new THREE.CanvasTexture(c); })();
  for (const x of [-0.72, 0.72]) { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 6), new THREE.MeshBasicMaterial({ map: streifTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.45 })); s.rotation.x = -Math.PI / 2; s.position.set(x, 0.02, 2.6 + 3); auto.add(s); deko.push(s); }
  const kegelW = new THREE.Mesh(new THREE.PlaneGeometry(9, 40), new THREE.MeshBasicMaterial({ map: pfuetzeTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.35, color: '#c8d8ff' }));
  kegelW.rotation.x = -Math.PI / 2; kegelW.position.set(0, 0.03, -22); auto.add(kegelW); deko.push(kegelW);
  const heissMat = new THREE.MeshBasicMaterial({ color: '#ffffff' }), warmMat = new THREE.MeshBasicMaterial({ color: '#b8b8b8' });

  // ---------- Hubschrauber ----------
  const heli = new THREE.Group(); scene.add(heli);
  const heliMat = new THREE.MeshStandardMaterial({ color: '#1a1e26', roughness: 0.5, metalness: 0.4 });
  const rumpf = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 12), heliMat); rumpf.scale.set(1, 0.8, 1.6); heli.add(rumpf);
  const kanzel = new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#0a1a2a', roughness: 0.1, metalness: 0.6 })); kanzel.scale.set(1.1, 0.8, 1.1); kanzel.position.set(0, 0.1, -1.0); kanzel.rotation.x = -0.6; heli.add(kanzel);
  const heck = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 5), heliMat); heck.position.z = 3.6; heli.add(heck);
  const finne = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 0.6), heliMat); finne.position.set(0, 0.5, 6.0); heli.add(finne);
  for (const x of [-0.9, 0.9]) { const k = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 3), heliMat); k.position.set(x, -1.2, 0); heli.add(k); }
  const rotor = new THREE.Mesh(new THREE.CircleGeometry(4.8, 32), new THREE.MeshBasicMaterial({ color: '#30343c', transparent: true, opacity: 0.25, side: THREE.DoubleSide })); rotor.rotation.x = -Math.PI / 2; rotor.position.y = 1.3; heli.add(rotor);
  const blink = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff2020').multiplyScalar(8) })); blink.position.set(0, -1.0, 0); heli.add(blink);
  const such = new THREE.SpotLight('#f4f8ff', 6, 0, 0.09, 0.4, 0); such.position.set(0, -1.2, -0.5); heli.add(such); scene.add(such.target);
  const strahl = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 4.5, 1, 32, 1, true), kegelMat.clone()); strahl.material.uniforms = { farbe: { value: new THREE.Color('#dfe8ff') }, staerke: { value: 0.16 } }; scene.add(strahl);
  const fleck = new THREE.Mesh(new THREE.CircleGeometry(4.5, 48), new THREE.MeshBasicMaterial({ map: pfuetzeTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: '#e8f0ff' })); fleck.rotation.x = -Math.PI / 2; scene.add(fleck);

  // ---------- Nachbearbeitung ----------
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.75, 0.45, 0.8); composer.addPass(bloom);
  const nach = new AfterimagePass(0.3); composer.addPass(nach);
  const waerme = new ShaderPass({ uniforms: { tDiffuse: { value: null }, an: { value: 0 }, zeit: { value: 0 }, aufl: { value: new THREE.Vector2(W, H) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `uniform sampler2D tDiffuse; uniform float an; uniform float zeit; uniform vec2 aufl; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
      void main(){ vec4 c=texture2D(tDiffuse,vUv); float l=dot(c.rgb,vec3(.3,.5,.2)); float w=clamp(pow(l*1.6,0.7),0.,1.);
        vec3 g=vec3(w*0.92+0.04); g+=(h(vUv*aufl+zeit)-.5)*0.07; float vig=smoothstep(0.95,0.35,length(vUv-.5));
        vec4 o=vec4(mix(c.rgb,g*vig,an),1.); o.rgb-=step(0.5,fract(vUv.y*aufl.y*0.25))*0.04*an; gl_FragColor=o; }` });
  composer.addPass(waerme);
  composer.addPass(new OutputPass());

  return { canvas, renderer, scene, camera, composer, bloom, nach, waerme, auto, koerper, raeder, schwarz, lack, heissMat, warmMat, deko, lampen, lampenDeko,
    heli, rotor, blink, such, strahl, fleck, kegelW };
}
let welt_sterne = null;

const ease = x => x * x * (3 - 2 * x);
let letzte = null;

// s: Angaben der Einstellung, t: Sekunden seit Beginn der Einstellung
export function zeichnen(s, t, W, H) {
  if (!welt) welt = bauen(W, H);
  const w = welt, cam = w.camera;
  const art = s.einstellung || 'verfolger';
  const schluessel = `${art}|${s._nr ?? ''}`;
  if (schluessel !== letzte) { letzte = schluessel; w.nach.uniforms.damp.value = 0; } // neue Einstellung: keine Nachzieh-Spur aus der alten
  const tempo = Number(s.tempo || 62), gas = Number(s.gas || 0);
  // Weg des Autos: mit gas=1 beschleunigt es (zieht der Kamera davon)
  const weg = tempo * t + (gas ? 0.5 * 9 * Math.max(0, t - 0.6) ** 2 : 0);
  const z = 40 - weg, wob = Math.sin(t * 1.3) * 0.25;
  const autoDa = s.auto !== 0 && s.auto !== '0';
  w.auto.visible = autoDa; w.auto.position.set(1.8 + wob, 0, z); w.auto.rotation.y = Math.cos(t * 1.3) * 0.015;
  for (const r of w.raeder) r.rotation.x = -weg / 0.36;
  const thermo = art === 'waerme';
  // Hubschrauber schräg hinten oben, fällt bei gas=1 zurück
  const hz = 40 - tempo * t + 30 - t * 1.5;
  w.heli.visible = s.heli !== 0 && s.heli !== '0';
  w.heli.position.set(14 + Math.sin(t * 0.7) * 3, 42, hz); w.rotor.rotation.z = t * 40; w.blink.visible = (t * 1.6) % 1 < 0.25;
  const strahlAn = s.strahl === 1 || s.strahl === '1' || s.strahl === true;
  const aus = s.strahl_aus !== undefined ? Number(s.strahl_aus) : 1e9;
  const verloren = clamp01((t - aus) / 1.2);
  let ziel = new THREE.Vector3(w.auto.position.x + Math.sin(t * 2.1) * 1.2, 0, z + Math.cos(t * 1.7) * 2);
  if (!autoDa || verloren > 0) ziel = new THREE.Vector3(Math.sin(t * 1.4) * 6, 0, hz - 34 - Math.sin(t * 0.9) * 8).lerp(ziel, autoDa ? 1 - verloren : 0);
  w.such.target.position.copy(ziel);
  const von = w.heli.localToWorld(new THREE.Vector3(0, -1.2, -0.5)); const d = von.distanceTo(ziel);
  w.strahl.position.copy(von).lerp(ziel, 0.5); w.strahl.scale.set(1, d, 1); w.strahl.lookAt(ziel); w.strahl.rotateX(Math.PI / 2);
  const aufbau = strahlAn ? clamp01(t / 0.5) : 0;
  w.such.intensity = (thermo ? 0 : 6) * aufbau; w.strahl.material.uniforms.staerke.value = 0.16 * aufbau;
  w.strahl.visible = !thermo && w.heli.visible; w.fleck.visible = !thermo && strahlAn; w.fleck.position.set(ziel.x, 0.04, ziel.z); w.fleck.material.opacity = 0.9 * aufbau;
  for (const dd of w.deko) dd.visible = !thermo;
  for (const dd of w.lampenDeko) dd.visible = !thermo;
  { const ref = autoDa ? z : hz - 34; const n = Math.round((ref - 180) / -42); w.lampen.forEach((l, i) => { l.position.set(-7.4, 10, 180 - 42 * (n - 1 + i)); }); }
  w.koerper.material = thermo ? w.heissMat : w.lack; for (const r of w.raeder) r.children[0].material = thermo ? w.warmMat : w.schwarz;
  w.waerme.uniforms.an.value = thermo ? 1 : 0; w.waerme.uniforms.zeit.value = t;
  w.bloom.strength = thermo ? 0.25 : 0.75; w.scene.fog.density = thermo ? 0.004 : 0.012;
  const ax = w.auto.position.x;
  const ruck = (a, f) => Math.sin(t * f) * a;
  if (art === 'verfolger') { // tiefe Verfolgerkamera
    const k = ease(Math.min(1, t / 4)); cam.fov = 42;
    const zurueck = gas ? Math.max(0, weg - tempo * t) : 0; // bei gas bleibt die Kamera zurück
    cam.position.set(1.8 + wob * 0.6 + ruck(0.03, 9), 1.7 + 0.8 * (1 - k) + ruck(0.02, 13), 40 - tempo * t + 17 - 4 * k);
    cam.lookAt(ax, 0.9, z - 10 + zurueck * 0.3);
  } else if (art === 'seite') { // Kamera fährt seitlich mit, Laternen und Pfosten fliegen vorbei
    cam.fov = 40; cam.position.set(ax + 9 - t * 0.3, 1.6 + ruck(0.02, 11), z + 15 - t * 0.6); cam.lookAt(ax - 2.6, 1.0, z - 2.5); // schräg hinten seitlich
  } else if (art === 'front') { // Kamera fährt rückwärts vor dem Auto her
    cam.fov = 36; cam.position.set(ax - 1.2 + ruck(0.03, 7), 1.5, z - 17 + t * 1.5); cam.lookAt(ax, 0.7, z); w.kegelW.visible = false;
  } else if (art === 'boden') { // feste Kamera am Straßenrand, Blick hoch zum Hubschrauber
    cam.fov = 46; cam.position.set(10, 0.9, z - 70 - t * 4); cam.lookAt(ax + 2, 15, z + 6); w.kegelW.visible = false; // vorn am Straßenrand, Blick zurück: Auto und Hubschrauber kommen
  } else if (art === 'waerme') { // Blick aus dem Hubschrauber
    cam.fov = 18 - 4 * clamp01(t / 4); cam.position.copy(von); cam.lookAt(autoDa && verloren < 1 ? ax : ziel.x, 0, autoDa && verloren < 1 ? z - 1 : ziel.z);
  } else if (art === 'weg') { // feste Kamera hinter dem Auto, das davonzieht
    cam.fov = 40; cam.position.set(2.2, 1.4, 40 + 14); cam.lookAt(1.8, 0.9, 40 - 60);
  } else if (art === 'totale') { // hoch und weit: Autobahn, Lichterkette, Hubschrauber und Auto
    cam.fov = 45; cam.position.set(-40, 38, z + 60 - t * 4); cam.lookAt(ax, 0, z - 30);
  }
  cam.aspect = W / H; cam.updateProjectionMatrix();
  w.composer.render();
  w.nach.uniforms.damp.value = thermo ? 0.2 : 0.3;
  return w.canvas;
}
const clamp01 = x => Math.max(0, Math.min(1, x));
export function infos(s, t) { return { thermo: (s.einstellung || '') === 'waerme' }; }
