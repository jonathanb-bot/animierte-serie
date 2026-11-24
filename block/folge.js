// Gerüst für jede Blockstadt-Folge: Zeitplan, Kamera/Licht-Helfer, Einstellungen, Menge (ohne Aufploppen),
// Ein-Wort-Untertitel, Mitmach-Frage mit Karten, renderAt. Eine Folge schreibt nur noch Ereignisse + Einstellungen.
//
//   import * as B from "../folge.js";
//   await B.laden();                       // plan_final.json bzw. ?plan=…
//   const { Z, E, wz } = B.F;
//   B.sh(E[0] + 0.15, (t, q) => { B.blick(B.V(…), B.V(…)); B.licht(); });
//   B.start({ grund: (t) => { … }, frage: { zeile: 26, karten: [["A", "💡", "Licht an", "licht"], …] } });
import * as Wt from "./welt.js";
import * as Fg from "./figuren.js";
import * as Ws from "./wesen.js";
import * as Rq from "./requisiten.js";
import * as Al from "./alltag.js";
export { Wt, Fg, Ws, Rq, Al };
const { THREE, cam, composer, U } = Wt;
export { THREE };

// ---------- Mathe ----------
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
export const easeIO = x => x <= 0 ? 0 : x >= 1 ? 1 : (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const lerp = (a, b, q) => a + (b - a) * q;
export const lerpV = (a, b, q) => a.clone().lerp(b, q);

// ---------- Zeitplan ----------
export const F = {};
// Sprache der Fassung (SPRACHE=en beim Rendern → ?sprache=en). Text im Bild: B.T({ de: "BÄCKEREI", en: "BAKERY" })
export const SPRACHE = new URLSearchParams(location.search).get("sprache") || "de";
export const T = (t) => (typeof t === "string" ? t : t[SPRACHE] ?? t.de);
const sauber = w => w.replace(/[.,!?:„“"]/g, "");
export async function laden() {
  const PLAN = new URLSearchParams(location.search).get("plan") || "plan_final.json";
  const plan = await (await fetch(PLAN)).json();
  F.plan = plan; F.Z = plan.zeilen.map(z => z.start); F.E = plan.zeilen.map(z => z.start + z.dauer);
  F.woerter = plan.zeilen.flatMap(z => z.woerter); F.DAUER = F.E[F.E.length - 1] + 1.6; F.sauber = sauber;
  F.leer = i => !plan.zeilen[i].woerter.length;
  F.wz = (name, zeile) => { const zl = plan.zeilen[zeile]; if (!zl.woerter.length) return zl.start; const w = zl.woerter.find(x => sauber(x[2]).toLowerCase() === name.toLowerCase()); if (!w) throw new Error("Wort fehlt: " + name + " in Zeile " + zeile); return w[0]; };
  await document.fonts.load('900 78px "Inter Display"'); await document.fonts.load('48px "Noto Color Emoji"');
  document.getElementById("wrap").prepend(Wt.renderer.domElement);
  return F;
}

// ---------- Kamera + Licht ----------
export const ZIEL = new THREE.Vector3();
export const NAH = { wert: null };   // Nahebene für diese Einstellung erzwingen (insHandy)
export const blick = (pos, ziel) => { cam.position.copy(pos); ZIEL.copy(ziel); cam.lookAt(ziel); };   // ohne Wackeln (Jonathan 22.11.)
export const licht = (staerke = 1.6, farbe = "#ffd8b0", rimS = 1.0, rimF = "#8ab0ff") => {
  const d = ZIEL.clone().sub(cam.position).normalize(); const re = new THREE.Vector3().crossVectors(d, V(0, 1, 0)).normalize();
  Wt.key.position.copy(cam.position).addScaledVector(re, -6).add(V(0, 8, 0)); Wt.key.target.position.copy(ZIEL); Wt.key.intensity = staerke; Wt.key.color.set(farbe);
  Wt.rim.position.copy(ZIEL).addScaledVector(d, 12).addScaledVector(re, 4).add(V(0, 6, 0)); Wt.rim.target.position.copy(ZIEL); Wt.rim.intensity = rimS; Wt.rim.color.set(rimF); };
// Fertige Kamerafahrten (q = 0…1 innerhalb der Einstellung)
export const kamera = {
  luft: (q, ziel, r0, r1, h0, h1, w0, w1, fov = 56) => { const w = lerp(w0, w1, easeIO(q)); blick(V(ziel.x + Math.sin(w) * lerp(r0, r1, easeIO(q)), lerp(h0, h1, easeIO(q)), ziel.z + Math.cos(w) * lerp(r0, r1, easeIO(q))), ziel); cam.fov = fov; },
  fahrt: (q, von0, von1, ziel0, ziel1 = ziel0, fov = 50) => { blick(lerpV(von0, von1, easeIO(q)), lerpV(ziel0, ziel1, easeIO(q))); cam.fov = fov; },
  vorFigur: (q, f, abst0 = 5.4, abst1 = 4.6, seite = -1.4, hoehe = 0.1, fov = 46) => { f.updateMatrixWorld(true); const k = Fg.kopfPos(f);
    blick(lerpV(f.localToWorld(V(seite, 3.8 + hoehe, abst0)), f.localToWorld(V(seite * 0.85, 3.8 + hoehe, abst1)), easeIO(q)), V(k.x, k.y - 0.6, k.z)); cam.fov = fov; },
  bodennah: (q, von0, von1, ziel, fov = 50) => { blick(lerpV(von0, von1, easeIO(q)), ziel); cam.fov = fov; },
  // Ins Handy fliegen: bei q = 1 füllt der Bildschirm genau das Bild. Nächste Einstellung = HANDY.cam (gleiches fov) → kein sichtbarer Schnitt.
  insHandy: (q, von, fov = 50) => { const h = Al.handy, s = Al.HANDY.schirm; h.updateMatrixWorld(true); const mitte = s.getWorldPosition(V(0, 0, 0));
    const n = V(0, 0, 1).transformDirection(s.matrixWorld), oben = V(0, 1, 0).transformDirection(s.matrixWorld), hw = Al.HANDY.schirmH * h.getWorldScale(V(0, 0, 0)).y;
    const ende = mitte.clone().addScaledVector(n, (hw / 2) / Math.tan(fov * Math.PI / 360)); const k = easeIO(q);
    cam.up.copy(V(0, 1, 0).lerp(oben, k).normalize()); blick(lerpV(von, ende, k), mitte); cam.fov = fov;
    // Hand, Arm, Kopf vor dem Bildschirm verschwinden sanft: vordere Schnittebene wandert bis kurz vor den Bildschirm
    NAH.wert = Math.max(0.15, cam.position.distanceTo(mitte) * 0.985 * ease((q - 0.25) / 0.6)); if (q > 0.72 && Al.HANDY.arm) Al.HANDY.arm.visible = false; },
  // Bildschirm-Kamera als Hauptkamera (direkt nach insHandy)
  imHandy: () => { cam.position.copy(Al.HANDY.cam.position); cam.quaternion.copy(Al.HANDY.cam.quaternion); cam.fov = Al.HANDY.cam.fov; ZIEL.copy(cam.position).add(V(0, 0, -10).applyQuaternion(cam.quaternion)); },
};

// ---------- Einstellungen ----------
const S = [];
export const sh = (bis, fn) => S.push([bis, fn]);

// ---------- Schatten-Helfer ----------
export const schatten = (i, x, z, ry, o = {}) => { const s = Ws.SCHATTEN[i]; s.aktiv = true; s.x = x; s.z = z; s.y = o.y ?? 0; s.ry = ry; s.groesse = o.g ?? 1.3; s.kriech = o.kriech ?? 0.5; s.aufl = o.aufl ?? 0; s.augen = o.augen ?? 1; return s; };
export const ring = (n, r0, r1, t, o = {}) => { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + 0.13 + (o.dreh ?? 0); const r = r0 + (r1 - r0) * ((i * 7) % 5) / 4 + Math.sin(t * 0.8 + i) * (o.wackel ?? 0.4);
  schatten((o.start ?? 0) + i, (o.cx ?? 0) + Math.cos(a) * r, (o.cz ?? 0) + Math.sin(a) * r, Math.atan2(-Math.cos(a), -Math.sin(a)), { g: o.g ?? 1.6, kriech: 0.5 + 0.4 * Math.sin(t * 1.3 + i), aufl: o.aufl ? o.aufl(i, a, r) : 0 }); } };

// ---------- Zustand pro Bild (Folge kann ihn in grund() und in Einstellungen setzen) ----------
export const Z_ = { menge: null, vignette: 0.35, zaehler: null, plus: null, mengeZahl: null };
// Zahlen über der Menge ohne die Leute, die für die Kamera ausgeblendet sind: Z_.mengeZahl = { text: (i) => "3", farbe }
// Geld-/Punkte-Zähler im Bild (Vergleich 24.11.): Z_.zaehler = { wert: zahl | text, farbe: "gruen"|"rot"|"gelb", einheit: " €" }, Z_.plus = { text: "+5 €", t0 }
// oben mittig (nie oben links, Issue #19), nur in Einstellungen, in denen die Geschichte ihn braucht.
// Wisch-Übergang am Schnitt: Wt.grade.uniforms.uWisch.value = B.wisch(t, schnittZeit) – kurz verwischt, kein Wackeln (Vergleich 24.11.)
export const wisch = (t, ts, dauer = 0.1) => { const q = Math.max(0, 1 - Math.abs(t - ts) / dauer); return q * q * (3 - 2 * q); };   // 24.11. abends: 0,1 s statt 0,22 s, weich (vorher wirkte es wie Ruckeln)
// Zahlen über allen Köpfen der Menge: B.mengeZahlen((i) => "1", { farbe })
export const mengeZahlen = (text, o = {}) => Rq.MENGE.forEach((p, i) => { if (!Rq.mengeSichtbar || Rq.mengeSichtbar(i)) Al.kopfzahl(new THREE.Vector3(p.x + (Z_.menge?.dx ?? 0), 5.6 * p.s, p.z + (Z_.menge?.dz ?? 0)), text(i), { groesse: 0.8, ...o }); });
export const euro = (n, vorzeichen = true) => (vorzeichen && n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(Math.round(n)).toLocaleString("de-DE");
export const zaehlen = (t, t0, t1, von, bis) => von + (bis - von) * easeIO((t - t0) / Math.max(0.01, t1 - t0));   // menge: { armeHoch, huepf, licht, dz } oder null

// ---------- Start ----------
export function start(o = {}) {
  const { grund = () => {}, frage = null, haltePos = null, nach = () => {} } = o;
  const GRENZEN = S.map(s => s[0]); const VERSTECK = new Map();
  const cap = document.getElementById("cap"), fr = document.getElementById("frage"), wahl = document.getElementById("wahl");
  const zl = document.createElement("div"), pl = document.createElement("div"); for (const [el, top, gr] of [[zl, 150, 86], [pl, 262, 60]]) { el.style.cssText = `position:absolute;left:0;right:0;top:${top}px;text-align:center;font:900 ${gr}px "Inter Display","Inter",sans-serif;-webkit-text-stroke:12px #0a0a0a;paint-order:stroke fill;text-shadow:0 7px 0 rgba(0,0,0,.35);display:none;transform-origin:center`; document.getElementById("wrap").appendChild(el); }
  const FARBE = { gruen: "#4ef07a", rot: "#ff4a4a", gelb: "#ffe53a" };
  if (frage) { fr.textContent = frage.text ?? "Was soll ich tun?"; wahl.innerHTML = frage.karten.map(([b, e, txt]) => `<div class="karte"><b>${b}</b><span class="e">${e}</span>${txt}</div>`).join(""); }
  window.renderAt = (t, probe = false) => {
    // neutraler Grundzustand
    U.uT.value = t; U.uWolken.value = 0; U.uAus.value = 1e6; U.uAn.value = 1e6; U.uTag.value = 0; U.uGold.value = 0;
    Wt.grade.uniforms.uT.value = t; Wt.grade.uniforms.uFlash.value = 0; Wt.grade.uniforms.uWisch.value = 0; U.uGewitter.value = 0; U.uAbend.value = 0; Wt.grade.uniforms.uWarm.value = 0;
    Wt.hemi.intensity = 0.6; Wt.hemi.color.set("#5a6ab0"); Wt.hemi.groundColor.set("#141018"); Wt.mondLicht.intensity = 0.5;
    Wt.suchkegel.forEach(k => k.visible = false); Fg.FIGUREN.forEach(f => f.visible = false); Ws.schattenAus();
    for (const p of [Rq.muell, Rq.megafon, Rq.taschenlampe, Rq.lampenKegel, Rq.kisten]) p.visible = false;
    Rq.GASSE.lampe.material = Rq.GASSE.lampeAn; Rq.GASSE.licht.intensity = 40; Rq.ZIMMER.schirm.material = Rq.ZIMMER.schirmAn; Rq.ZIMMER.licht.intensity = 30;
    Al.zuruecksetzen(); cam.up.set(0, 1, 0); NAH.wert = null;
    Z_.menge = null; Z_.vignette = 0.35; Z_.zaehler = null; Z_.plus = null; Z_.mengeZahl = null; cam.fov = 55;
    grund(t);                                  // Folge: Uniforms, Autos, Polizei, Notlampen, Menge …
    const tag = U.uTag.value > 0.5;
    if (!o.eigeneAutos) Wt.autosSetzen(t);
    Wt.lampenAktualisieren(t);
    // Einstellung
    let k = GRENZEN.findIndex(b => t < b); if (k < 0) k = S.length - 1; const von = k ? GRENZEN[k - 1] : 0, bis = GRENZEN[k];
    S[k][1](t, Math.min(1, Math.max(0, (t - von) / (bis - von))));
    cam.updateProjectionMatrix();
    if (probe) return { kam: cam.position.clone(), ziel: ZIEL.clone(), frei: Fg.FIGUREN.filter(f => f.visible).map(f => f.position.clone()), menge: Z_.menge };
    cam.near = NAH.wert ?? Math.min(3, Math.max(0.15, cam.position.distanceTo(ZIEL) * 0.04)); cam.updateProjectionMatrix();
    // Menge: wer im Weg steht, bleibt die ganze Einstellung weg (kein Auf- und Abtauchen)
    if (Z_.menge) { const m = Z_.menge, key = k + ":" + (m.dz ?? 0);
      if (!VERSTECK.has(key)) { const set = new Set(); const b2 = Math.min(bis, F.DAUER);
        for (const qq of [0.01, 0.2, 0.4, 0.6, 0.8, 0.99]) { const r = window.renderAt(von + (b2 - von) * qq, true); if (!r.menge) continue;
          Rq.MENGE.forEach((p, i) => { if (Rq.mengeImWeg(p, r.kam, r.ziel, r.frei, r.menge.dx ?? 0, r.menge.dz ?? 0)) set.add(i); }); }
        VERSTECK.set(key, set); return window.renderAt(t); }
      Rq.mengeSetzen(t, { sichtbar: true, armeHoch: m.armeHoch ?? (() => 0), huepf: m.huepf ?? (() => 0), licht: m.licht ?? (tag ? 1 : 0.5), dx: m.dx ?? 0, dz: m.dz ?? 0, versteckt: VERSTECK.get(key) });
      if (Z_.mengeZahl) { const mz = Z_.mengeZahl; Rq.MENGE.forEach((p, i) => { if (p.weg) return; Al.kopfzahl(new THREE.Vector3(p.x + (m.dx ?? 0), 5.6 * p.s, p.z + (m.dz ?? 0)), mz.text(i), { groesse: mz.groesse ?? 0.8, farbe: mz.farbe ?? "#4ef07a" }); }); }
    } else Rq.mengeSetzen(t, { sichtbar: false });
    Ws.laternenSetzen(t, haltePos ? (L) => haltePos(L, t) : null); Ws.schattenSetzen(t); Ws.funkenSetzen(t); Ws.staubSetzen(t);
    nach(t);
    Al.bildschirmeRendern();                   // Handy, Großbildschirm, Fernseher
    // Untertitel: ein Wort, gelb
    const w = F.woerter.find(([a, b]) => t >= a - 0.02 && t < b + 0.05);
    if (w) { cap.textContent = sauber(w[2]).toLowerCase(); const pop = ease((t - w[0]) / 0.08); cap.style.transform = `scale(${0.8 + 0.2 * pop}) rotate(${(Math.sin(w[0] * 13) * 2).toFixed(1)}deg)`; } else cap.textContent = "";
    // Zähler
    if (Z_.zaehler) { const z = Z_.zaehler; zl.style.display = "block"; zl.style.color = FARBE[z.farbe ?? "gruen"] ?? z.farbe; zl.textContent = (typeof z.wert === "number" ? euro(z.wert, z.vorzeichen ?? true) : z.wert) + (z.einheit ?? " €"); } else zl.style.display = "none";
    if (Z_.plus && t >= Z_.plus.t0 && t < Z_.plus.t0 + 1.2) { const q = (t - Z_.plus.t0) / 1.2; pl.style.display = "block"; pl.style.color = FARBE[Z_.plus.farbe ?? "gruen"]; pl.textContent = Z_.plus.text; pl.style.opacity = Math.min(1, (1 - q) * 3); pl.style.transform = `translateY(${-q * 60}px) scale(${0.7 + 0.3 * ease(q * 5)})`; } else pl.style.display = "none";
    // Mitmach-Frage
    Wt.grade.uniforms.uVig.value = Z_.vignette;
    if (frage && F.plan.zeilen.length > frage.zeile && t >= F.Z[frage.zeile] - 0.15) {
      fr.style.display = "block"; wahl.style.display = "flex"; const k0 = ease((t - F.Z[frage.zeile] + 0.15) / 0.3); fr.style.transform = `scale(${0.7 + 0.3 * k0})`; fr.style.opacity = k0;
      const an = frage.karten.map(([, , , wort], i) => (wort ? F.wz(wort, frage.zeile + 1) : F.Z[frage.zeile + 1] + i) - 0.15);
      [...wahl.children].forEach((c, i) => { const q = ease((t - an[i]) / 0.25); c.style.opacity = q; c.style.transform = `translateX(${(1 - q) * -80}px) scale(${0.85 + 0.15 * q})`; });
      Wt.grade.uniforms.uVig.value = 0.6;
    } else { fr.style.display = "none"; wahl.style.display = "none"; }
    Wt.himmel.position.copy(cam.position);   // Himmelskugel folgt der Kamera (weit entfernte Kulissen wie BUNTDORF haben sonst schwarzen Himmel)
    composer.render();
    return true;
  };
  window.DAUER = F.DAUER; window.GRENZEN = GRENZEN; window.bereit = true;
}
