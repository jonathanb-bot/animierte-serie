/* „Der Fluchtwagen“ (Jonathan 16.11.): echte 3D-Kulisse (three.js, engine/drei.js, Quelle drei/flucht/szene.js).
   [drei einstellung=verfolger|seite|front|boden|waerme|weg|totale strahl=1 strahl_aus=3 auto=0 heli=0 gas=1 tempo=62]
   Das 3D-Bild wird in voller Leinwandgröße gezeichnet (eigene 3D-Kamera, Kamerabewegungen der Engine wirken hier nicht).
   Bei einstellung=waerme kommt die Anzeige des Hubschraubers dazu (hud_oben=…, hud_rechts=…). Nur neue Namen: alle
   bisherigen Serien bleiben pixelgleich. */
(() => {
  try { document.fonts.load("700 40px Kino"); document.fonts.load("italic 700 40px Kino"); } catch (e) {}
  // Kino-Einblendungen (mit `@untertitel aus`): Filmtitel, Serifen-Untertitel mit Sprecher, Chip-Tuning-Karte
  //   filmtitel="Der|Fluchtwagen|TEIL 1"  sprecher_label="Polizeifunk"  chip="600>900"
  const ease = x => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
  const schatten = () => { ctx.shadowColor = "rgba(0,0,0,0.85)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 2; };
  function kino(s, t) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    if (s.filmtitel) { const [z1, z2, z3] = String(s.filmtitel).split("|"); const a = t < 3.2 ? 1 : Math.max(0, 1 - (t - 3.2) / 0.6);
      if (a > 0) { ctx.globalAlpha = a; schatten(); ctx.fillStyle = "#ffffff"; ctx.font = "700 64px Kino"; ctx.fillText(z1 || "", 540, 470);
        ctx.fillStyle = "#f2a64a"; ctx.font = "italic 700 104px Kino"; ctx.fillText(z2 || "", 540, 575);
        if (z3) { ctx.fillStyle = "#ffffff"; ctx.font = "700 34px HUD"; ctx.fillText(z3, 540, 630); } ctx.globalAlpha = 1; } }
    if (s.chip) { const [von, bis] = String(s.chip).split(">").map(Number); const p = ease((t - 0.6) / 2.2), v = Math.round(von + (bis - von) * p), fertig = p >= 0.999;
      const x0 = 540 - 230, y0 = 430, w = 460, h = 190; ctx.globalAlpha = ease(t / 0.4);
      ctx.fillStyle = "rgba(14,12,12,0.82)"; ctx.beginPath(); A.rr(x0, y0, w, h, 18); ctx.fill(); ctx.strokeStyle = "#e0904a"; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = "#e0904a"; ctx.font = "700 32px HUD"; ctx.fillText("CHIP-TUNING", 540, y0 + 56);
      ctx.fillStyle = fertig ? "#f2a64a" : "#ffffff"; ctx.font = "700 92px HUD"; ctx.fillText(`${v}${fertig ? "+" : ""} PS`, 540, y0 + 156); ctx.globalAlpha = 1; }
    if (!s._kino) { s._kino = []; let cur = []; const push = () => { if (cur.length) s._kino.push({ woerter: cur, start: cur[0].start, ende: cur[cur.length - 1].ende }); cur = []; };
      for (const w of s.woerter || []) { const len = cur.reduce((a, b) => a + b.w.length + 1, 0) + w.w.length; if (cur.length && len > 30) push(); cur.push(w); if (/[.!?…:]$/.test(w.w) || (/,$/.test(w.w) && len > 18)) push(); }
      push(); for (let i = s._kino.length - 1; i > 0; i--) { const g = s._kino[i], v = s._kino[i - 1]; const lv = v.woerter.map(w => w.w).join(' ').length; if (g.woerter.length === 1 && lv + g.woerter[0].w.length < 40 && !/[.!?…:]$/.test(v.woerter[v.woerter.length - 1].w)) { v.woerter.push(...g.woerter); v.ende = g.ende; s._kino.splice(i, 1); } }
      for (let i = 0; i < s._kino.length - 1; i++) s._kino[i].ende = Math.min(s._kino[i + 1].start, s._kino[i].ende + 0.5); if (s._kino.length) s._kino[s._kino.length - 1].ende += 0.5; }
    const g = s._kino.find(x => t >= x.start - 0.05 && t < x.ende);
    if (g) { const txt = g.woerter.map(w => w.w).join(" ").replace(/[„“"]/g, ""), zitat = g.woerter.some(w => w.zitat);
      schatten(); const y = 1590;
      if (zitat && s.sprecher_label) { ctx.fillStyle = "#e0904a"; ctx.font = "700 26px HUD"; ctx.fillText(s.sprecher_label, 540, y - 62); }
      ctx.fillStyle = zitat ? "#f2c45a" : "#ffffff"; ctx.font = (zitat ? "italic " : "") + "700 50px Kino"; ctx.fillText(txt, 540, y); }
    ctx.restore();
  }
  const SZ = A.SZ; let nr = 0; const nummern = new WeakMap();
  SZ.drei = (s, t) => {
    if (!window.DREI) throw new Error("engine/drei.js fehlt");
    if (!nummern.has(s)) nummern.set(s, ++nr);
    const cv = ctx.canvas, S = Number(window.SS) || 1; // cv.width/height sind mit engine/ss.js logische Werte (1080×1920)
    const bild = window.DREI.zeichnen({ ...s, _nr: nummern.get(s) }, t, Math.round(cv.width * S), Math.round(cv.height * S));
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bild, 0, 0, cv.width, cv.height); ctx.restore();
    kino(s, t);
    if (s.einstellung === "waerme") {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = "rgba(255,255,255,0.88)"; ctx.font = "600 30px HUD"; ctx.textAlign = "left";
      String(s.hud_oben || "POL-HELI 2|AUTOBAHN ▸ NORD").split("|").forEach((z, i) => ctx.fillText(z, 56, 330 + i * 40));
      ctx.textAlign = "right"; ctx.fillText(s.hud_rechts || "ALT 1200 FT", 1024, 330);
      if ((t * 1.2) % 1 < 0.6) { ctx.fillStyle = "#ff4a4a"; ctx.fillText("● REC", 1024, 370); }
      ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 3; const k = 110; ctx.strokeRect(540 - k, 860 - k, 2 * k, 2 * k);
      for (const [x1, y1, x2, y2] of [[540, 860 - k - 40, 540, 860 - k], [540, 860 + k, 540, 860 + k + 40], [540 - k - 40, 860, 540 - k, 860], [540 + k, 860, 540 + k + 40, 860]]) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
      ctx.restore();
    }
  };
})();
