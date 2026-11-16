/* „Der letzte Raub – Ihr entscheidet“ (Jonathans Auftrag 16.11.): Heist-Thriller als Mitmachserie im Stil „leuchtend“.
   Grundfarben Dunkelblau und Türkis, Gold für Bank und Geld, Korallrot für Gefahr. Nur neue Kulissen-Namen:
   alle bisherigen Serien bleiben pixelgleich. Verbindlich: raub/serienbibel.md.

   [bankfassade regen=1 schild="AUREON"]           AUREON-Bank bei Nacht im Regen: goldene Bögen, türkisfarbenes Glas, nasse Straße mit Spiegelung
   [bankhalle leute=6 alarm=0]                     Schalterhalle: hohe goldene Bögen, dunkler Steinboden mit Spiegelung, türkisfarbene Glasflächen
   [versteck regen=1]                               warmer, enger Vorbereitungsraum: Hängelampe, Tisch, Pinnwand, Fenster mit Regen
   [raubdetail motiv=foto|akte|tasche|geld|umschlag|nadel|koffer text="…"]   Nahaufnahme eines Leitmotivs auf dem Tisch (Lampenlicht)
   [entscheidung a="Geld mitnehmen" b="ATLAS mitnehmen" frage="…"]          A/B-Karten am Ende jeder Entscheidungsfolge
   Alle Kulissen zeigen Figuren wie gewohnt (`r_du mara jona karo voss`, `hinten=r_du`, `gross`, `figur_y=`).
*/
(() => {
  const { box, circle, ellipse, poly, line, shade, rgba, lgrad, rgrad, mix, clamp, lerp, E } = A;
  const SZ = A.SZ;
  const rnd = seed => A.rnd(seed);
  const glut = (x, y, r, farbe, a = 1) => { ctx.fillStyle = rgrad(x, y, 0, r, [[0, rgba(farbe, 0.9 * a)], [0.3, rgba(farbe, 0.35 * a)], [1, rgba(farbe, 0)]]); ctx.fillRect(x - r, y - r, r * 2, r * 2); };
  const F = { nacht: "#0b1530", blau: "#14284f", tief: "#0a1226", tuerkis: "#3fc4c8", tuerkisD: "#1d6f7a", gold: "#e8b84a", goldH: "#ffd98a", goldD: "#9a6a24", koralle: "#ff6a5a", stein: "#1a1f2c" };

  const regen = (t, n = 160, alpha = 0.35, seed = 5) => { const r = rnd(seed); ctx.lineCap = "round";
    for (let k = 0; k < n; k++) { const x = r() * 1400 - 160, sp = 1500 + r() * 700, y = ((r() * 2300 + t * sp) % 2300) - 200, l = 30 + r() * 40;
      line(x, y, x - l * 0.18, y + l, 2 + r() * 1.5, rgba("#bfe6ff", alpha * (0.5 + r() * 0.5))); } };
  // goldener Rundbogen (Fensterbogen mit Leibung)
  const bogen = (x, y, w, h, farbe, glas, dicke = 0.12) => {
    const r = w / 2, d = w * dicke;
    ctx.beginPath(); ctx.moveTo(x - r, y + h); ctx.lineTo(x - r, y + r); ctx.arc(x, y + r, r, Math.PI, 0); ctx.lineTo(x + r, y + h); ctx.closePath(); ctx.fillStyle = farbe; ctx.fill();
    if (glas) { ctx.beginPath(); ctx.moveTo(x - r + d, y + h); ctx.lineTo(x - r + d, y + r); ctx.arc(x, y + r, r - d, Math.PI, 0); ctx.lineTo(x + r - d, y + h); ctx.closePath(); ctx.fillStyle = glas; ctx.fill(); }
  };

  // ---------- Bankfassade bei Nacht im Regen ----------
  SZ.bankfassade = (s, t) => {
    ctx.fillStyle = lgrad(0, 0, 0, 1920, [[0, "#070d22"], [0.55, "#13244a"], [1, "#0b1530"]]); ctx.fillRect(-400, -400, 1880, 2800);
    // Hochhäuser hinten (Silhouetten mit Fenstern)
    { const r = rnd(17); for (let k = 0; k < 11; k++) { const bx = -120 + k * 120 + r() * 40, bw = 90 + r() * 70, bh = 500 + r() * 700, by = 1180 - bh;
      box(bx, by, bw, bh + 200, 4, mix("#0d1838", "#1d3364", r() * 0.5));
      for (let fy = by + 30; fy < 1150; fy += 46) for (let fx = bx + 14; fx < bx + bw - 18; fx += 30) if (r() < 0.32) box(fx, fy, 14, 20, 2, rgba(r() < 0.7 ? "#7fd8dc" : "#ffd98a", 0.35 + r() * 0.3)); } }
    glut(540, 520, 700, F.tuerkis, 0.12);
    // Bankgebäude: Sockel, Säulen, drei hohe Bögen, Gesims, Schriftzug
    const x0 = 90, x1 = 990, top = 520, fuss = 1330;
    box(x0 - 30, top - 70, x1 - x0 + 60, 90, 6, "#2a2a3a"); box(x0 - 30, top - 82, x1 - x0 + 60, 16, 4, F.goldD);
    box(x0, top + 20, x1 - x0, fuss - top - 20, 0, "#1c2236");
    const bw = 230, bxs = [x0 + 150, 540, x1 - 150];
    for (const bx of bxs) {
      bogen(bx, top + 70, bw + 34, fuss - top - 70, F.goldD, null);
      bogen(bx, top + 80, bw + 14, fuss - top - 80, F.gold, null);
      bogen(bx, top + 92, bw - 12, fuss - top - 92, F.gold, lgrad(0, top, 0, fuss, [[0, "#2fa5ad"], [0.6, "#16586a"], [1, "#0e3346"]]));
      // Sprossen und Lichtreflex
      line(bx, top + 92 + 40, bx, fuss, 4, rgba(F.goldD, 0.9)); for (let yy = top + 300; yy < fuss; yy += 170) line(bx - bw / 2 + 8, yy, bx + bw / 2 - 8, yy, 4, rgba(F.goldD, 0.9));
      ctx.save(); ctx.globalAlpha = 0.18; poly([[bx - 70, fuss], [bx - 20, top + 200], [bx + 10, top + 200], [bx - 40, fuss]], "#ffffff"); ctx.restore();
      glut(bx, fuss - 200, 260, F.goldH, 0.25 + 0.05 * Math.sin(t * 2 + bx));
    }
    // Säulen zwischen den Bögen
    for (const sx of [x0 + 20, 295 + 20, 785 - 20, x1 - 20]) { box(sx - 22, top + 30, 44, fuss - top - 30, 6, "#2a3048"); box(sx - 22, top + 30, 12, fuss - top - 30, 4, rgba("#ffffff", 0.06)); box(sx - 30, top + 20, 60, 22, 4, F.goldD); }
    // Schriftzug
    ctx.save(); ctx.textAlign = "center"; ctx.font = "900 78px Titel"; ctx.fillStyle = F.goldH; ctx.shadowColor = rgba(F.gold, 0.9); ctx.shadowBlur = 30;
    ctx.fillText(s.schild || "AUREON", 540, top - 2); ctx.restore();
    // Treppe und Gehweg
    for (let k = 0; k < 3; k++) box(x0 - 40 - k * 30, fuss + k * 26, x1 - x0 + 80 + k * 60, 28, 3, mix("#232a40", "#2c3450", k / 3));
    // nasse Straße mit Spiegelung
    const sy = fuss + 80; ctx.fillStyle = lgrad(0, sy, 0, 1920, [[0, "#0f1a33"], [1, "#070d1e"]]); ctx.fillRect(-400, sy, 1880, 1400);
    ctx.save(); ctx.globalAlpha = 0.28; ctx.translate(0, sy * 2 + 20); ctx.scale(1, -1);
    for (const bx of bxs) bogen(bx, top + 92, bw - 12, fuss - top - 92, rgba(F.gold, 0.7), rgba("#2fa5ad", 0.6));
    ctx.restore();
    for (const bx of bxs) { ctx.save(); ctx.globalAlpha = 0.35 + 0.1 * Math.sin(t * 3 + bx); ctx.fillStyle = lgrad(0, sy, 0, sy + 500, [[0, rgba(F.goldH, 0.6)], [1, rgba(F.goldH, 0)]]); ctx.fillRect(bx - 40, sy, 80, 500); ctx.restore(); }
    // Laternen
    for (const lx of [40, 1040]) { line(lx, sy + 40, lx, sy - 520, 8, "#1a2236"); box(lx - 26, sy - 560, 52, 44, 8, "#222a40"); circle(lx, sy - 532, 14, "#ffe2a0"); glut(lx, sy - 532, 220, "#ffd98a", 0.5); }
    // Pfützenringe
    { const r = rnd(61); for (let k = 0; k < 9; k++) { const px = r() * 1080, py = sy + 80 + r() * 380, ph = (t * 0.9 + r()) % 1; ctx.beginPath(); ctx.ellipse(px, py, 10 + ph * 50, (10 + ph * 50) * 0.28, 0, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.strokeStyle = rgba("#bfe6ff", 0.4 * (1 - ph)); ctx.stroke(); } }
    if (s.regen !== 0) regen(t, 180, 0.32);
    A.figurenZeigen(s, t, s.figur_y ?? (s.gross ? 1990 : 1700), s.gross ? 1.25 : 0.62);
    if (s.regen !== 0) regen(t, 40, 0.5, 9); // Tropfen vor der Figur
  };

  // ---------- Schalterhalle ----------
  SZ.bankhalle = (s, t) => {
    const alarm = Number(s.alarm || 0), puls = alarm ? 0.5 + 0.5 * Math.sin(t * 6) : 0;
    ctx.fillStyle = lgrad(0, 0, 0, 1920, [[0, "#0a1430"], [0.5, "#122a52"], [1, "#0a1226"]]); ctx.fillRect(-400, -400, 1880, 2800);
    const hor = 1060; // Fluchtpunkt-Höhe
    // Rückwand mit türkisfarbener Glasfront und Tiefe: drei Bogenreihen hintereinander
    for (const [k, sk] of [[0, 0.42], [1, 0.66], [2, 1]]) {
      const bw = 300 * sk, bh = 1200 * sk, yb = hor + 260 * sk, ab = 370 * sk, n = k === 2 ? 3 : 5;
      for (let i = 0; i < n; i++) { const bx = 540 + (i - (n - 1) / 2) * ab;
        bogen(bx, yb - bh, bw, bh, mix(F.goldD, "#0f1a33", (2 - k) * 0.28), k === 2 ? null : lgrad(0, yb - bh, 0, yb, [[0, rgba("#3fd0d4", 0.55 - k * 0.1)], [1, rgba("#0f4a5a", 0.6)]]), 0.16);
        if (k === 2) { bogen(bx, yb - bh + 10, bw - 30, bh - 10, F.gold, null); bogen(bx, yb - bh + 26, bw - 62, bh - 26, F.gold, lgrad(0, yb - bh, 0, yb, [[0, "#38bcc2"], [1, "#11475a"]])); } }
    }
    // Lichtstrahlen durch das Glas
    ctx.save(); ctx.globalCompositeOperation = "lighter"; for (const bx of [170, 540, 910]) { ctx.fillStyle = lgrad(0, 300, 0, 1500, [[0, rgba("#7fe8ea", 0.12)], [1, rgba("#7fe8ea", 0)]]); poly([[bx - 70, 260], [bx + 70, 260], [bx + 260, 1500], [bx - 120, 1500]]); ctx.fill(); } ctx.restore();
    // Kronleuchter/Hängelampen
    for (const lx of [300, 780]) { line(lx, -100, lx, 330, 3, "#2a3048"); ellipse(lx, 350, 70, 22, F.goldD); ellipse(lx, 344, 56, 14, F.goldH); glut(lx, 360, 260, F.goldH, 0.45); }
    // dunkler Steinboden mit Fugen in Perspektive und Spiegelung
    const fy = hor + 260; ctx.fillStyle = lgrad(0, fy, 0, 1920, [[0, "#141a28"], [1, "#0a0e18"]]); ctx.fillRect(-400, fy, 1880, 1400);
    ctx.save(); ctx.globalAlpha = 0.22; ctx.translate(0, fy * 2); ctx.scale(1, -1);
    for (let i = 0; i < 3; i++) bogen(540 + (i - 1) * 370, fy - 1200, 300, 1200, rgba(F.gold, 0.6), rgba("#38bcc2", 0.5), 0.16); ctx.restore();
    for (let k = -8; k <= 8; k++) line(540 + k * 40, fy, 540 + k * 260, 1940, 2, rgba("#ffffff", 0.05));
    for (let j = 1; j < 9; j++) { const yy = fy + Math.pow(j / 9, 1.8) * (1940 - fy); line(-200, yy, 1280, yy, 2, rgba("#ffffff", 0.05)); }
    // Schalter (goldene Theke mit Glas)
    box(-60, fy - 150, 420, 160, 10, "#20283e"); box(-60, fy - 160, 420, 20, 6, F.gold); box(-40, fy - 330, 380, 170, 6, rgba("#7fe8ea", 0.14)); line(-40, fy - 330, 340, fy - 330, 4, F.goldD);
    box(720, fy - 150, 420, 160, 10, "#20283e"); box(720, fy - 160, 420, 20, 6, F.gold); box(740, fy - 330, 380, 170, 6, rgba("#7fe8ea", 0.14)); line(740, fy - 330, 1120, fy - 330, 4, F.goldD);
    // Menschen in der Halle (klein, Mittelgrund): stehen, ducken sich bei Alarm
    const n = Number(s.leute ?? 0); { const r = rnd(33); for (let k = 0; k < n; k++) { const px = 120 + r() * 840, py = fy + 40 + r() * 120, sk = 0.2 + (py - fy) / 1200;
      const f = { ...A.STANDARD, haar: ["kurz", "lang", "seite", "dutt"][k % 4], haare: ["#2a2220", "#6a4a30", "#c8c4bc", "#3a2b24"][k % 4], jacke: ["#5a6a8a", "#8a5a6a", "#4a7a6a", "#7a6a5a"][k % 4], hose: "#2b2f36", haut: ["#efc9a8", "#c9946c", "#e3b994"][k % 3] };
      A.figur(px, py, sk, f, { t: t + k, pose: alarm ? (k % 2 ? "duckt" : "angst") : "steht", ausdruck: alarm ? "angst" : "neutral", seed: k * 3 + 1 }); } }
    // Alarm: korallrotes Pulsieren
    if (alarm) { ctx.fillStyle = rgba(F.koralle, 0.12 * puls); ctx.fillRect(-400, -400, 1880, 2800); glut(540, 120, 500, F.koralle, 0.35 * puls); }
    A.figurenZeigen(s, t, s.figur_y ?? (s.gross ? 1700 : 1560), s.gross ? 1.0 : 0.62);
  };

  // ---------- Vorbereitungsraum ----------
  SZ.versteck = (s, t) => {
    ctx.fillStyle = lgrad(0, 0, 0, 1920, [[0, "#3a2418"], [0.6, "#2a1a14"], [1, "#160e0c"]]); ctx.fillRect(-400, -400, 1880, 2800);
    // Wand mit Ziegelstruktur
    { const r = rnd(4); for (let y = 0; y < 1250; y += 46) for (let x = (y / 46) % 2 ? -60 : -10; x < 1140; x += 104) box(x, y, 96, 40, 4, mix("#4a2c1e", "#5a3626", r() * 0.6)); }
    ctx.fillStyle = lgrad(0, 0, 0, 1250, [[0, rgba("#160c08", 0.65)], [0.5, rgba("#160c08", 0.15)], [1, rgba("#160c08", 0.55)]]); ctx.fillRect(-400, 0, 1880, 1250);
    // Fenster rechts mit Regen und Stadtlicht
    const wx = 690, wy = 210, ww = 300, wh = 420; box(wx - 16, wy - 16, ww + 32, wh + 32, 10, "#21140e");
    ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip(); ctx.fillStyle = lgrad(0, wy, 0, wy + wh, [[0, "#0d1a3a"], [1, "#1d3a66"]]); ctx.fillRect(wx, wy, ww, wh);
    { const r = rnd(8); for (let k = 0; k < 14; k++) { const bx = wx + r() * ww, bh = 80 + r() * 220; box(bx, wy + wh - bh, 30 + r() * 30, bh, 2, "#0a1430"); for (let q = 0; q < 5; q++) box(bx + 6, wy + wh - bh + 14 + q * 34, 8, 12, 1, rgba("#ffd98a", 0.5)); } }
    glut(wx + ww * 0.7, wy + 100, 160, F.gold, 0.4); // die Bank in der Ferne
    { const r = rnd(12); for (let k = 0; k < 40; k++) { const x = wx + r() * ww, y = wy + ((r() * wh + t * (60 + r() * 60)) % wh); ellipse(x, y, 3, 6, rgba("#cfeaff", 0.55)); line(x, y - 6, x, y - 30, 2, rgba("#cfeaff", 0.25)); } }
    ctx.restore(); line(wx + ww / 2, wy, wx + ww / 2, wy + wh, 10, "#21140e"); line(wx, wy + wh / 2, wx + ww, wy + wh / 2, 10, "#21140e");
    // Pinnwand links mit Fotos und Fäden (Gruppe, Bank, Lea)
    const px = 90, py = 190; box(px, py, 480, 360, 10, "#8a6a44"); box(px + 10, py + 10, 460, 340, 6, "#a8845a");
    const zettel = [[150, 240, "#f4efe4", -0.06], [300, 230, "#e8f4f2", 0.05], [430, 250, "#f4efe4", -0.03], [180, 400, "#ffe9a8", 0.04], [360, 390, "#f4efe4", -0.05]];
    for (const [zx, zy, c, rot] of zettel) { ctx.save(); ctx.translate(zx, zy); ctx.rotate(rot); box(-55, -50, 110, 100, 4, c); box(-45, -40, 90, 62, 2, rgba("#2a3a5a", 0.35)); box(-30, 30, 60, 6, 3, rgba("#2a2a2a", 0.3)); circle(0, -46, 7, F.koralle); ctx.restore(); }
    ctx.strokeStyle = rgba(F.koralle, 0.8); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(150, 194); ctx.lineTo(300, 184); ctx.lineTo(430, 204); ctx.moveTo(300, 184); ctx.lineTo(360, 344); ctx.lineTo(180, 354); ctx.stroke();
    // Hängelampe mit warmem Lichtkegel, leicht schwingend
    const sw = Math.sin(t * 0.9) * 10, lx = 540 + sw;
    line(540, -100, lx, 560, 4, "#1a100c"); poly([[lx - 90, 640], [lx - 40, 560], [lx + 40, 560], [lx + 90, 640]], "#2a3a3a"); ellipse(lx, 640, 90, 16, "#ffcf7a");
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = lgrad(0, 640, 0, 1500, [[0, rgba("#ffcf7a", 0.28)], [1, rgba("#ffcf7a", 0)]]); poly([[lx - 90, 640], [lx + 90, 640], [lx + 520, 1500], [lx - 520, 1500]]); ctx.fill(); ctx.restore();
    glut(lx, 660, 380, "#ffcf7a", 0.35);
    // Boden und Tisch (Figuren stehen dahinter)
    ctx.fillStyle = lgrad(0, 1250, 0, 1920, [[0, "#2a1810"], [1, "#120a08"]]); ctx.fillRect(-400, 1250, 1880, 1000);
    A.figurenZeigen(s, t, s.figur_y ?? (s.gross ? 1820 : 1560), s.gross ? 0.95 : 0.66);
    if (s.tisch !== 0) { poly([[60, 1440], [1020, 1440], [1120, 1640], [-40, 1640]], "#5a3a24"); poly([[-40, 1640], [1120, 1640], [1120, 1680], [-40, 1680]], "#3a2416");
      ellipse(540, 1520, 420, 70, rgba("#ffcf7a", 0.16));
      ctx.save(); ctx.translate(380, 1520); ctx.rotate(-0.08); box(-70, -40, 140, 90, 4, "#f4efe4"); box(-55, -28, 110, 8, 3, rgba("#2a2a2a", 0.4)); box(-55, -10, 80, 8, 3, rgba("#2a2a2a", 0.3)); ctx.restore();
      ctx.save(); ctx.translate(680, 1510); ctx.rotate(0.1); box(-60, -36, 120, 76, 4, F.koralle); box(-60, -36, 120, 14, 4, shade(F.koralle, -0.2)); ctx.restore(); }
  };

  // ---------- Nahaufnahme eines Leitmotivs ----------
  SZ.raubdetail = (s, t) => {
    const m = s.motiv || "foto";
    // Tisch im Lampenlicht
    ctx.fillStyle = lgrad(0, 0, 0, 1920, [[0, "#24160e"], [1, "#120a06"]]); ctx.fillRect(-400, -400, 1880, 2800);
    { const r = rnd(2); for (let k = 0; k < 22; k++) { const y = k * 90 + r() * 30; ctx.fillStyle = rgba("#000000", 0.08 + r() * 0.06); ctx.fillRect(-400, y, 1880, 3 + r() * 4); } }
    glut(540, 860, 900, "#ffcf7a", 0.32);
    const auf = E.raus(clamp(t / 0.8, 0, 1));
    ctx.save(); ctx.translate(540, 900);
    if (m === "foto") { // Leas Foto (Polaroid, Ecke geknickt)
      ctx.rotate(-0.05); ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 40; box(-300, -380, 600, 700, 10, "#f6f2ea"); ctx.shadowColor = "transparent";
      ctx.save(); ctx.beginPath(); ctx.rect(-260, -340, 520, 520); ctx.clip();
      ctx.fillStyle = lgrad(0, -340, 0, 180, [[0, "#8fd0dc"], [1, "#f4d6a8"]]); ctx.fillRect(-260, -340, 520, 520);
      ellipse(0, 120, 360, 90, "#7aa86a");
      A.figur(0, 420, 0.95, A.fig("lea"), { t, ausdruck: "froh", seed: 7 });
      ctx.restore();
      ctx.fillStyle = "#3a3a4a"; ctx.font = "italic 700 40px HUD"; ctx.textAlign = "center"; ctx.fillText(s.aufschrift || "Lea", 0, 270);
      poly([[300, -380], [300, -300], [220, -380]], "#d8d0c0");
    } else if (m === "akte") { // unvollständiger ATLAS-Auszug
      ctx.rotate(0.04); ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 40; box(-320, -440, 640, 860, 8, "#f2ede2"); ctx.shadowColor = "transparent";
      box(-320, -440, 640, 110, 8, "#1d3358"); ctx.fillStyle = "#ffffff"; ctx.font = "900 60px Titel"; ctx.textAlign = "left"; ctx.fillText("ATLAS", -280, -365);
      ctx.font = "700 28px HUD"; ctx.fillStyle = "#9fd8dc"; ctx.textAlign = "right"; ctx.fillText(s.aufschrift || "AUSZUG · SEITE 3 VON 41", 290, -370);
      for (let k = 0; k < 13; k++) { const y = -280 + k * 46, w = 420 + ((k * 73) % 140); box(-270, y, w, 14, 7, rgba("#2a2f3a", 0.35)); if (k % 4 === 2) box(-270 + 120, y - 6, 220, 26, 4, "#1a1a20"); }
      // abgerissene Unterkante
      ctx.fillStyle = "#120a06"; ctx.beginPath(); ctx.moveTo(-330, 430); for (let x = -330; x <= 330; x += 30) ctx.lineTo(x, 330 + ((x * 7) % 3) * 14 + (x % 60 ? 12 : -6)); ctx.lineTo(330, 430); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.rotate(-0.2); ctx.globalAlpha = 0.85 * auf; ctx.strokeStyle = F.koralle; ctx.lineWidth = 7; A.rr(40, -170, 230, 86, 10); ctx.stroke(); ctx.fillStyle = F.koralle; ctx.font = "900 46px Titel"; ctx.textAlign = "center"; ctx.fillText("INTERN", 155, -112); ctx.restore();
    } else if (m === "geld") { // acht Millionen im goldenen Licht
      ctx.restore(); ctx.save(); ctx.translate(540, 1000);
      glut(0, -100, 700, F.gold, 0.45);
      for (let row = 0; row < 5; row++) for (let k = 0; k < 6 - row; k++) { const x = (k - (5 - row) / 2) * 150, y = 220 - row * 74, d = clamp((t - row * 0.18 - k * 0.05) / 0.4, 0, 1); if (d <= 0) continue;
        ctx.save(); ctx.globalAlpha = d; ctx.translate(x, y - (1 - E.raus(d)) * 60); box(-68, -34, 136, 64, 6, "#d9c48a"); box(-68, -34, 136, 14, 4, "#f2e2a8"); box(-12, -34, 24, 64, 3, F.goldD); ctx.restore(); }
    } else if (m === "tasche") { // leere Tasche
      ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 40;
      ctx.beginPath(); ctx.moveTo(-340, -40); ctx.quadraticCurveTo(-360, 260, -300, 300); ctx.lineTo(300, 300); ctx.quadraticCurveTo(360, 260, 340, -40); ctx.closePath(); ctx.fillStyle = "#1c2a44"; ctx.fill(); ctx.shadowColor = "transparent";
      ellipse(0, -40, 340, 90, "#0a0f1c"); ellipse(0, -52, 300, 64, "#05080f");
      ctx.lineWidth = 16; ctx.strokeStyle = "#2a3a58"; ctx.beginPath(); ctx.moveTo(-200, -60); ctx.quadraticCurveTo(0, -380, 200, -60); ctx.stroke();
      line(-330, -30, 330, -30, 6, rgba(F.goldD, 0.8));
    } else if (m === "umschlag") { // brauner Umschlag mit Foto
      ctx.rotate(-0.06); ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 40; box(-330, -230, 660, 460, 8, "#c89a5a"); ctx.shadowColor = "transparent";
      poly([[-330, -230], [0, 30], [330, -230]], "#b8884a"); ctx.save(); ctx.translate(0, -120 - auf * 120); ctx.rotate(0.05); box(-220, -150, 440, 300, 6, "#f6f2ea"); box(-200, -130, 400, 220, 4, "#2a3a5a"); ctx.restore();
    } else if (m === "nadel") { // Voss' goldene Anstecknadel
      ctx.fillStyle = "#e4ded2"; ctx.fillRect(-600, -1000, 1200, 2000); ctx.fillStyle = lgrad(-300, 0, 300, 0, [[0, "rgba(0,0,0,0.12)"], [1, "rgba(0,0,0,0)"]]); ctx.fillRect(-600, -1000, 1200, 2000);
      glut(0, 0, 300, F.goldH, 0.6 + 0.2 * Math.sin(t * 3)); circle(0, 0, 90, F.gold); circle(0, 0, 70, F.goldD); poly([[0, -50], [44, 30], [-44, 30]], F.goldH); circle(-26, -30, 14, rgba("#ffffff", 0.8));
    } else if (m === "koffer") { // der rote ATLAS-Koffer
      ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 40; box(-320, -200, 640, 420, 26, "#c8443a"); ctx.shadowColor = "transparent";
      box(-320, -200, 640, 40, 20, shade("#c8443a", 0.15)); box(-80, -270, 160, 80, 20, "#2a1a1a"); box(-60, -250, 120, 50, 14, "#c8443a");
      for (const sx of [-220, 220]) box(sx - 30, -20, 60, 40, 6, F.gold); ctx.fillStyle = "#ffe9d0"; ctx.font = "900 54px Titel"; ctx.textAlign = "center"; ctx.fillText("ATLAS", 0, 120);
    }
    ctx.restore();
  };

  // ---------- Entscheidung A/B ----------
  SZ.entscheidung = (s, t) => {
    ctx.fillStyle = lgrad(0, 0, 0, 1920, [[0, "#081028"], [1, "#14284f"]]); ctx.fillRect(-400, -400, 1880, 2800);
    glut(540, 760, 800, F.tuerkis, 0.16); { const r = rnd(9); for (let k = 0; k < 70; k++) circle(r() * 1080, r() * 1920, 1 + r() * 2, rgba("#9fe8ea", 0.15 + 0.15 * Math.abs(Math.sin(t + k)))); }
    ctx.save(); ctx.textAlign = "center"; ctx.fillStyle = "#7fe0e8"; ctx.font = "900 64px Titel"; ctx.fillText(s.titel_text || "DU ENTSCHEIDEST", 540, 300);
    if (s.frage) { ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = "700 40px HUD"; ctx.fillText(s.frage, 540, 370); } ctx.restore();
    const karte = (y, buchst, txt, farbe, d) => { if (d <= 0) return; const p = E.raus(clamp(d / 0.45, 0, 1)); ctx.save(); ctx.globalAlpha = p; ctx.translate((1 - p) * 120 * (buchst === "A" ? -1 : 1), 0);
      ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 40; box(90, y, 900, 250, 40, "rgba(10,16,38,0.92)"); ctx.shadowColor = "transparent";
      ctx.strokeStyle = rgba(farbe, 0.8); ctx.lineWidth = 4; ctx.beginPath(); A.rr(90, y, 900, 250, 40); ctx.stroke();
      circle(220, y + 125, 82, farbe); ctx.fillStyle = "#0a1226"; ctx.font = "900 100px Titel"; ctx.textAlign = "center"; ctx.fillText(buchst, 220, y + 160);
      ctx.fillStyle = "#ffffff"; ctx.textAlign = "left"; const zeilen = String(txt).split("/"); ctx.font = "900 52px Titel"; zeilen.forEach((z, i) => ctx.fillText(z.trim(), 335, y + 125 + (i - (zeilen.length - 1) / 2) * 62 + 18)); ctx.restore(); };
    karte(520, "A", s.a || "A", F.tuerkis, t - 0.3); karte(840, "B", s.b || "B", F.gold, t - 0.8);
    const d = clamp((t - 1.5) / 0.5, 0, 1); if (d > 0) { ctx.save(); ctx.globalAlpha = d; ctx.textAlign = "center"; ctx.fillStyle = "#ffffff"; ctx.font = "800 42px HUD"; ctx.fillText(s.aufruf || "Kommentiere A oder B.", 540, 1200); ctx.fillStyle = "#f2cf7e"; ctx.fillText(s.aufruf2 || "Der Top-Kommentar entscheidet.", 540, 1258); ctx.restore(); }
  };
})();
