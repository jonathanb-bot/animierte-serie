/* „Der Fluchtwagen“ (Jonathan 16.11.): echte 3D-Kulisse (three.js, engine/drei.js, Quelle drei/flucht/szene.js).
   [drei einstellung=verfolger|seite|front|boden|waerme|weg|totale strahl=1 strahl_aus=3 auto=0 heli=0 gas=1 tempo=62]
   Das 3D-Bild wird in voller Leinwandgröße gezeichnet (eigene 3D-Kamera, Kamerabewegungen der Engine wirken hier nicht).
   Bei einstellung=waerme kommt die Anzeige des Hubschraubers dazu (hud_oben=…, hud_rechts=…). Nur neue Namen: alle
   bisherigen Serien bleiben pixelgleich. */
(() => {
  const SZ = A.SZ; let nr = 0; const nummern = new WeakMap();
  SZ.drei = (s, t) => {
    if (!window.DREI) throw new Error("engine/drei.js fehlt");
    if (!nummern.has(s)) nummern.set(s, ++nr);
    const cv = ctx.canvas, S = Number(window.SS) || 1; // cv.width/height sind mit engine/ss.js logische Werte (1080×1920)
    const bild = window.DREI.zeichnen({ ...s, _nr: nummern.get(s) }, t, Math.round(cv.width * S), Math.round(cv.height * S));
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bild, 0, 0, cv.width, cv.height); ctx.restore();
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
