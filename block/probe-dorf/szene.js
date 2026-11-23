// Probe: Kulisse Buntdorf (Tag, Abend), Menge auf dem Platz
import * as B from "../folge.js";
const { V, sh, licht, kamera, Fg, Al, Wt, Z_ } = B;
await B.laden(); const { Z, E } = B.F;
const P = Al.BUNTDORF.pos;
const ich = Fg.figur({ haut: "#f0c8a0", hemd: "#e8a020", hose: "#2a3a5a", haare: "#5a3418", frisur: "strubbel", kapuze: true, skala: 0.78, struktur: true });
const tag = () => { Wt.U.uTag.value = 1; Wt.U.uWolken.value = 1; Wt.hemi.intensity = 1.2; Wt.hemi.color.set("#cfe4ff"); Wt.hemi.groundColor.set("#8a8070"); };
sh(2, (t, q) => { tag(); kamera.fahrt(q, P(0, 14, -120), P(0, 14, -118), P(0, 2, 40)); licht(1.6, "#fff4e0", 1, "#fff"); });
sh(4, (t, q) => { tag(); ich.visible = true; ich.position.copy(P(-7.5, 0.3, -40)); ich.rotation.y = 0.6; Fg.pose(ich, { ges: "froh", armR: 2.4 }); kamera.fahrt(q, P(3, 4.2, -26), P(3, 4.2, -26), P(-8, 4, -42)); licht(1.6, "#fff4e0", 1, "#fff"); });
sh(6, (t, q) => { tag(); Z_.menge = { armeHoch: () => 0, licht: 1, dx: Al.BUNTDORF.platz.x, dz: Al.BUNTDORF.platz.z }; kamera.fahrt(q, P(12, 7, 22), P(12, 7, 22), P(40, 3, -4)); licht(1.6, "#fff4e0", 1, "#fff"); });
sh(8, (t, q) => { tag(); kamera.fahrt(q, P(-4, 3.5, 60), P(-4, 3.5, 60), P(-14, 7, 76)); licht(1.6, "#fff4e0", 1, "#fff"); });
sh(10, (t, q) => { tag(); Wt.U.uAbend.value = 1; Wt.hemi.color.set("#ffc8a0"); kamera.fahrt(q, P(2, 6, -60), P(2, 6, -60), P(0, 8, 60)); licht(1.4, "#ffb080", 1, "#a080ff"); });
sh(13, (t, q) => { tag(); kamera.fahrt(q, P(-2, 40, -90), P(-2, 40, -90), P(20, 0, 10)); licht(1.6, "#fff4e0", 1, "#fff"); });
B.start({ grund: () => {} });
