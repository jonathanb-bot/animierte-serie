/* Stil „minimal“ (Jonathan 8.11.: „genau in der selben Art“ wie sein Beispiel-Video): schwarzer Grund,
   nur leuchtende weiße Linien, kleine Strichfiguren, viel Leere, Werte zählen hoch.
   Drehbuch: [minimal motiv=kurve bis=0.08 …] Text.  Motive: kurve, fallen, zwei, figur, menge, kalender,
   treppe, karten, gipfel, punkt.  Wird nur gezeichnet, wenn eine Einstellung den Typ „minimal“ hat. */
(() => {
  const { clamp, lerp, E, rgba } = A;
  const W = A.W, H = A.H;
  const WEISS = "#f4f4f2", GRAU = "rgba(244,244,242,0.28)";

  // Zeit (s) eines gesprochenen Wortes in dieser Einstellung, sonst Ersatzwert
  const wortZeit = (s, wort, ersatz) => {
    if (!wort) return ersatz;
    const n = x => String(x).toLowerCase().replace(/[^a-z0-9äöüß]/g, "");
    const w = (s.woerter || []).find(x => n(x.w).startsWith(n(wort)));
    return w ? w.start : ersatz;
  };
  const glow = (st = 1) => { ctx.shadowColor = `rgba(255,255,255,${0.55 * st})`; ctx.shadowBlur = 26 * st; };
  const ohneGlow = () => { ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; };
  const linie = (pts, b = 6, farbe = WEISS) => {
    if (pts.length < 2) return;
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const [x, y] of pts.slice(1)) ctx.lineTo(x, y);
    ctx.lineWidth = b; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = farbe; ctx.stroke();
  };
  const kreis = (x, y, r, farbe = WEISS) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = farbe; ctx.fill(); };
  const text = (txt, x, y, gr = 60, farbe = WEISS, gewicht = 900) => {
    ctx.font = `${gewicht} ${gr}px Titel`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = farbe; ctx.fillText(txt, x, y);
  };
  const pille = (txt, x, y, gr = 34) => {
    ctx.save(); ohneGlow(); ctx.font = `800 ${gr}px Titel`;
    const b = ctx.measureText(txt).width + gr * 1.4, h = gr * 1.7;
    A.box(x - b / 2, y - h / 2, b, h, h / 2, "rgba(244,244,242,0.16)");
    ctx.strokeStyle = "rgba(244,244,242,0.35)"; ctx.lineWidth = 2; A.rr(x - b / 2, y - h / 2, b, h, h / 2); ctx.stroke();
    text(txt, x, y + 2, gr, WEISS, 800); ctx.restore();
  };
  // Strichfigur (wie im Vorbild: runder Kopf, weicher Körper), Füße bei (x, y)
  const figur = (x, y, s = 1, alpha = 1, schritt = 0) => {
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.scale(s, s); glow(0.8);
    const b = Math.sin(schritt) * 6;
    A.box(-26, -112, 52, 84, 24, WEISS);                     // Körper
    A.box(-20 + b, -36, 16, 36, 8, WEISS); A.box(4 - b, -36, 16, 36, 8, WEISS); // Beine
    kreis(0, -142, 27, WEISS);                               // Kopf
    ctx.restore();
  };
  const boden = (y, alpha = 1) => { ctx.save(); ctx.globalAlpha *= alpha; ohneGlow(); ctx.setLineDash([14, 16]); linie([[60, y], [W - 60, y]], 3, GRAU); ctx.restore(); };
  const fmt = (v, st = 2) => v.toLocaleString("de-DE", { maximumFractionDigits: st, minimumFractionDigits: 0 });

  // Diagramm-Rahmen: x 140…940, y 1380 (unten) … 520 (oben)
  const X0 = 150, X1 = 930, Y0 = 1380, Y1 = 560;
  const achsen = (a = 1) => { ctx.save(); ohneGlow(); ctx.globalAlpha *= a; linie([[X0, Y1 - 40], [X0, Y0], [X1 + 30, Y0]], 4, GRAU); ctx.restore(); };
  const KURVEN = {
    exp: x => Math.pow(1.01, 365 * x),          // jeden Tag 1 % besser
    fallen: x => Math.pow(0.99, 365 * x),       // jeden Tag 1 % schlechter
    gerade: x => 1 + 36.78 * x,                  // was die meisten erwarten
  };
  // zeichnet eine Kurve bis Anteil q (0…1 des Jahres); Skala bis „max“
  const kurve = (fn, q, max, min = 0, farbe = WEISS, b = 7) => {
    const pts = [];
    for (let i = 0; i <= 160; i++) { const x = (i / 160) * q; pts.push([lerp(X0, X1, x), lerp(Y0, Y1, (fn(x) - min) / (max - min))]); }
    glow(); linie(pts, b, farbe); ohneGlow();
    return pts[pts.length - 1];
  };

  const SZ = A.SZ;
  SZ.minimal = (s, t, p) => {
    // Grund: fast schwarz, ganz leichter Schimmer in der Mitte, feines Staub-Funkeln
    ctx.fillStyle = "#08080a"; ctx.fillRect(-200, -200, W + 400, H + 400);
    ctx.fillStyle = A.rgrad(W / 2, H * 0.48, 40, H * 0.62, [[0, "rgba(255,255,255,0.075)"], [1, "rgba(255,255,255,0)"]]);
    ctx.fillRect(-200, -200, W + 400, H + 400);
    const r = A.rnd(7);
    for (let i = 0; i < 40; i++) { const x = r() * W, y = r() * H, a = 0.05 + 0.1 * (0.5 + 0.5 * Math.sin(t * (0.5 + r()) + i)); kreis(x, y - t * 4 * r(), 1.6, `rgba(255,255,255,${a})`); }
    ctx.save();
    const m = MOTIVE[s.motiv] || MOTIVE.figur;
    m(s, t, p);
    ctx.restore();
    ohneGlow();
  };

  const MOTIVE = {
    // Wachsende Kurve. bis = Anteil des Jahres (0…1), art = exp|fallen|gerade, max = Skala, wert = Etikett am Punkt
    kurve(s, t) {
      const art = s.art || "exp", fn = KURVEN[art];
      const start = wortZeit(s, s.ab, 0.2), dauer = Math.max(0.8, (s.dauer - start) * 0.75);
      const q = (s.von ?? 0) + ((s.bis ?? 1) - (s.von ?? 0)) * E.sanft(clamp((t - start) / dauer, 0, 1));
      const max = s.max ?? (art === "fallen" ? 1.05 : 38), min = art === "fallen" ? 0 : (s.min ?? 0.9);
      achsen();
      if (s.gerade) { ctx.save(); ctx.setLineDash([16, 18]); kurve(KURVEN.gerade, clamp((t - start) / dauer, 0, 1) * (s.bis ?? 1), max, min, GRAU, 4); ctx.restore(); }
      const [x, y] = kurve(fn, q, max, min);
      glow(1.4); kreis(x, y, 16); kreis(x, y, 30, "rgba(255,255,255,0.18)"); ohneGlow();
      const v = fn(q);
      const etikett = art === "fallen" ? `${fmt(v * 100, v < 0.1 ? 1 : 0)} %` : `×${fmt(v, v < 10 ? 2 : 0)}`;
      if (s.wert !== false) text(etikett, clamp(x, 200, 880), y - 80, 76);
      if (s.tage !== false) pille(`TAG ${Math.max(1, Math.round(q * 365))}`, W / 2, Y0 + 90, 34);
      if (s.figur) figur(lerp(X0, X1, Math.min(q, 0.04)) + 40, Y0, 0.7);
    },
    // Zwei Linien: +1 % und −1 % starten gleich und laufen auseinander
    zwei(s, t) {
      const start = wortZeit(s, s.ab, 0.2), q = (s.bis ?? 1) * E.sanft(clamp((t - start) / Math.max(1, (s.dauer - start) * 0.8), 0, 1));
      const max = 4, min = 0; achsen();
      const lim = x => Math.min(KURVEN.exp(x), max * 1.6);
      const [x1, y1] = kurve(x => lim(x), q, max, min);
      const [x2, y2] = kurve(KURVEN.fallen, q, max, min, "rgba(244,244,242,0.55)", 6);
      glow(); kreis(x1, Math.max(y1, 300), 13); kreis(x2, y2, 11, "rgba(244,244,242,0.7)"); ohneGlow();
      if (q > 0.05) { pille("+1 % JEDEN TAG", clamp(x1 - 60, 230, 820), Math.max(y1, 300) - 70, 30); pille("−1 % JEDEN TAG", clamp(x2 - 60, 230, 820), y2 + 70, 30); }
    },
    // Eine Figur, optional mit kleinem Punkt „1 %“ und Achselzucken
    figur(s, t) {
      boden(1300);
      const x = s.x ?? W / 2;
      figur(x, 1300, 1.25, 1, s.gehen ? t * 7 : 0);
      if (s.punkt) {
        const a = clamp((t - wortZeit(s, s.ab, 0.4)) / 0.4, 0, 1);
        ctx.save(); ctx.globalAlpha = a; glow(1.2); kreis(x + 230, 1080, 9 + 3 * Math.sin(t * 3)); ohneGlow(); text(s.punkt, x + 230, 1020, 44, WEISS, 800); ctx.restore();
      }
      if (s.label) pille(s.label, W / 2, 1420, 34);
    },
    // Viele kleine Figuren; bei weg=true drehen sie ab und verblassen (die meisten hören auf)
    menge(s, t) {
      boden(1300);
      const n = s.anzahl || 9, ab = wortZeit(s, s.ab, s.dauer * 0.35), bleibt = s.bleibt ?? 1;
      for (let i = 0; i < n; i++) {
        const x0 = W / 2 + (i - (n - 1) / 2) * 92;
        const geht = s.weg && i >= bleibt, q = geht ? clamp((t - ab - i * 0.08) / 1.2, 0, 1) : 0;
        const x = x0 + (geht ? (i % 2 ? 1 : -1) * E.raus(q) * 420 : 0);
        figur(x, 1300, 0.62, 1 - 0.85 * q, geht && q > 0 ? t * 9 : 0);
      }
      if (s.label) pille(s.label, W / 2, 1420, 34);
    },
    // Kalenderblatt zählt Tage hoch, daneben die Figur, die gleich groß bleibt
    kalender(s, t) {
      boden(1300);
      const von = s.von ?? 1, bis = s.bis ?? 2, q = E.sanft(clamp((t - wortZeit(s, s.ab, 0.3)) / Math.max(0.8, s.dauer * 0.6), 0, 1));
      const tag = Math.round(lerp(von, bis, q));
      ctx.save(); ctx.translate(W / 2 - 170, 1010); glow(0.9);
      ctx.strokeStyle = WEISS; ctx.lineWidth = 6; A.rr(-120, -130, 240, 260, 30); ctx.stroke();
      A.box(-120, -130, 240, 64, 30, WEISS); A.box(-120, -96, 240, 30, 0, WEISS);
      ohneGlow(); text(String(tag), 0, 40, 120); text(s.einheit || "TAG", 0, -98, 30, "#08080a", 800);
      ctx.restore();
      figur(W / 2 + 200, 1300, 1.0);
      if (s.label) pille(s.label, W / 2, 1420, 34);
    },
    // Treppe: jede Stufe etwas höher als die davor (Zinseszins), Figur steigt mit
    treppe(s, t) {
      boden(1400, 0.6);
      const n = s.stufen || 9, ab = wortZeit(s, s.ab, 0.2), q = clamp((t - ab) / Math.max(1, (s.dauer - ab) * 0.85), 0, 1);
      let x = 140, y = 1400, h = 26;
      const sichtbar = Math.max(1, Math.ceil(q * n));
      glow(0.8);
      for (let i = 0; i < sichtbar; i++) {
        const w = 88, a = i === sichtbar - 1 ? clamp(q * n - i, 0, 1) : 1;
        ctx.save(); ctx.globalAlpha = a; A.box(x, y - h, w, h + (1400 - y), 6, i % 2 ? "rgba(244,244,242,0.92)" : WEISS); ctx.restore();
        if (i === sichtbar - 1) { ohneGlow(); figur(x + 44, y - h, 0.55); glow(0.8); }
        x += w; y -= h; h *= s.faktor || 1.32;
      }
      ohneGlow();
      if (s.label) pille(s.label, W / 2, 1480, 34);
    },
    // Karten erscheinen nacheinander beim gesprochenen Wort: karten="EIN VIDEO|EINE SEITE|10 MINUTEN" bei="Video|Seite|Zehn"
    karten(s, t) {
      const k = String(s.karten || "").split("|"), bei = String(s.bei || "").split("|"), n = k.length;
      k.forEach((txt, i) => {
        const ab = wortZeit(s, bei[i], 0.3 + i * 0.7), q = clamp((t - ab) / 0.35, 0, 1);
        if (q <= 0) return;
        const y = 760 + i * 230, sc = E.pop(q);
        ctx.save(); ctx.translate(W / 2, y); ctx.scale(sc, sc); glow(0.7);
        ctx.strokeStyle = WEISS; ctx.lineWidth = 5; A.rr(-330, -85, 660, 170, 34); ctx.stroke();
        ohneGlow(); A.box(-330, -85, 660, 170, 34, "rgba(244,244,242,0.07)");
        glow(0.6); ctx.strokeStyle = WEISS; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-262, 0); ctx.lineTo(-240, 22); ctx.lineTo(-200, -24); ctx.stroke(); ohneGlow();
        text(txt, 40, 4, 56); ctx.restore();
      });
      if (s.label) pille(s.label, W / 2, 520, 34);
    },
    // Die Kurve schießt nach oben, Figur oben, Lichtstrahlen
    gipfel(s, t) {
      const q = E.sanft(clamp(t / Math.max(1, s.dauer * 0.55), 0, 1));
      achsen(0.6);
      const [x, y] = kurve(KURVEN.exp, q, 38, 0.9);
      const a = clamp((t - s.dauer * 0.45) / 0.6, 0, 1);
      if (a > 0) {
        ctx.save(); ctx.globalAlpha = a * 0.5; ctx.translate(x, y);
        for (let i = 0; i < 18; i++) { ctx.rotate(Math.PI * 2 / 18); ctx.fillStyle = "rgba(255,255,255,0.10)"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-18, -560); ctx.lineTo(18, -560); ctx.fill(); }
        ctx.restore();
        figur(x, y - 10, 0.75, a);
      }
      glow(1.5); kreis(x, y, 14); ohneGlow();
      if (s.wert !== false) text(`×${fmt(KURVEN.exp(q), 0)}`, clamp(x - 150, 200, 880), y + 10, 92);
    },
    // Ein einzelner leuchtender Punkt mit Wert (z. B. „1 %“), groß und ruhig
    punkt(s, t) {
      const a = clamp((t - wortZeit(s, s.ab, 0.2)) / 0.5, 0, 1);
      glow(1.6); kreis(W / 2, 960, 14 + 5 * Math.sin(t * 2.5)); ohneGlow();
      ctx.save(); ctx.globalAlpha = a; text(s.wert || "1 %", W / 2, 820, 120); ctx.restore();
      if (s.label) pille(s.label, W / 2, 1120, 34);
    },
  };

  // ---------- Neu 15.11. („Schmetterlingseffekt und Zeitreisen“): nur neue Motive, alles Bisherige bleibt gleich ----------
  // Schmetterling als leuchtende Linie, Flügel schlagen. art=moewe zeichnet stattdessen eine Möwe. x/y/gr Position und Größe.
  const schmetterling = (x, y, g, t, alpha = 1, schlag = 1) => {
    const f = 0.35 + 0.65 * Math.abs(Math.cos(t * 5.2 * schlag));
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); glow(1.1);
    ctx.lineWidth = 5; ctx.strokeStyle = WEISS; ctx.lineJoin = "round"; ctx.lineCap = "round";
    for (const sx of [-1, 1]) {
      ctx.save(); ctx.scale(sx * f, 1);
      ctx.beginPath(); ctx.moveTo(4, -10); ctx.bezierCurveTo(g * 0.55, -g * 1.15, g * 1.25, -g * 0.75, g * 0.95, -g * 0.08); ctx.bezierCurveTo(g * 0.8, g * 0.1, g * 0.3, g * 0.05, 4, 0); ctx.stroke();
      ctx.fillStyle = "rgba(244,244,242,0.10)"; ctx.fill();
      ctx.beginPath(); ctx.moveTo(4, 4); ctx.bezierCurveTo(g * 0.7, g * 0.15, g * 0.85, g * 0.75, g * 0.35, g * 0.8); ctx.bezierCurveTo(g * 0.15, g * 0.82, 8, g * 0.4, 4, 4); ctx.stroke(); ctx.fill();
      ctx.restore();
    }
    A.box(-7, -g * 0.22, 14, g * 0.62, 7, WEISS);
    ctx.beginPath(); ctx.moveTo(-3, -g * 0.2); ctx.quadraticCurveTo(-g * 0.1, -g * 0.5, -g * 0.22, -g * 0.55); ctx.moveTo(3, -g * 0.2); ctx.quadraticCurveTo(g * 0.1, -g * 0.5, g * 0.22, -g * 0.55); ctx.lineWidth = 3; ctx.stroke();
    ohneGlow(); ctx.restore();
  };
  const moewe = (x, y, g, t) => {
    const f = Math.sin(t * 4) * 0.35;
    ctx.save(); ctx.translate(x, y); glow(1.1); ctx.lineWidth = 7; ctx.strokeStyle = WEISS; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-g, -g * (0.25 + f)); ctx.quadraticCurveTo(-g * 0.45, -g * (0.55 + f), 0, 0); ctx.quadraticCurveTo(g * 0.45, -g * (0.55 + f), g, -g * (0.25 + f)); ctx.stroke();
    ohneGlow(); ctx.restore();
  };
  // Lorenz-Gleichungen (σ=10, ρ=28, β=8/3), einfach integriert – für Kurven und den Attraktor
  const lorenzBahn = (x0, n, dt = 0.01) => { let [x, y, z] = x0; const o = [];
    for (let i = 0; i < n; i++) { for (let k = 0; k < 2; k++) { const h = dt / 2, dx = 10 * (y - x), dy = x * (28 - z) - y, dz = x * y - 8 / 3 * z; x += dx * h; y += dy * h; z += dz * h; } o.push([x, y, z]); }
    return o; };
  const BAHN_A = lorenzBahn([1, 1, 20.506127], 1400, 0.02), BAHN_B = lorenzBahn([1, 1, 20.506], 1400, 0.02), ATTR = lorenzBahn([0.1, 0, 0], 9000, 0.008);
  const nummer = (txt, x, y, a = 1) => { ctx.save(); ctx.globalAlpha *= a; pille(txt, x, y, 34); ctx.restore(); };
  Object.assign(MOTIVE, {
    // [minimal motiv=schmetterling art=moewe|tornado label=…]  großer Schmetterling, Lichtstaub
    schmetterling(s, t) {
      const r = A.rnd(11);
      for (let i = 0; i < 26; i++) { const a = r() * Math.PI * 2, d = 160 + ((t * 40 + r() * 400) % 420); kreis(W / 2 + Math.cos(a) * d, 900 + Math.sin(a) * d * 0.7, 2 + r() * 2.5, `rgba(255,255,255,${0.35 * (1 - (d - 160) / 420)})`); }
      const y = 900 + Math.sin(t * 1.3) * 18;
      if (s.art === "moewe") { const q = clamp((t - wortZeit(s, s.ab, s.dauer * 0.5)) / 0.6, 0, 1);
        ctx.save(); ctx.globalAlpha = 1 - q; moewe(W / 2, y, 230, t); ctx.restore(); schmetterling(W / 2, y, 220, t, q); }
      else schmetterling(W / 2, y, Number(s.gr) || 240, t);
      if (s.art === "tornado") { const q = clamp((t - wortZeit(s, s.ab, s.dauer * 0.4)) / 1.2, 0, 1); ctx.save(); ctx.globalAlpha = q; glow(0.8);
        for (let i = 0; i < 9; i++) { const yy = 1300 + i * 26, w = 150 - i * 15, ph = t * 6 + i; linie([[W / 2 - w + Math.sin(ph) * 10, yy], [W / 2 + w + Math.sin(ph) * 10, yy]], 5); }
        ohneGlow(); ctx.restore(); }
      if (s.label) pille(s.label, W / 2, s.art === "tornado" ? 1600 : 1420, 34);
    },
    // [minimal motiv=pfad ab=Wort]  schwebender Weg, Figur tritt daneben, Schmetterling erlischt
    pfad(s, t) {
      const yP = 1240, ab = wortZeit(s, s.ab, s.dauer * 0.5);
      const r = A.rnd(5); ctx.save(); ohneGlow(); for (let i = 0; i < 46; i++) { const x = r() * W, h = 40 + r() * 90; linie([[x, 1420], [x + Math.sin(t + i) * 6, 1420 - h]], 3, GRAU); } ctx.restore();
      glow(0.8); linie([[90, yP], [990, yP]], 8); for (let x = 140; x < 990; x += 170) linie([[x, yP], [x, yP + 60]], 3, GRAU); ohneGlow();
      const q = clamp((t - ab) / 0.7, 0, 1), x = lerp(260, 640, clamp(t / Math.max(0.5, ab), 0, 1));
      figur(x + q * 60, yP + q * 170, 0.9, 1, q < 1 && t < ab ? t * 7 : 0);
      const ba = q < 1 ? 1 : Math.max(0.15, 1 - (t - ab - 0.7) * 0.8);
      schmetterling(x + 110, 1405 - (1 - q) * 40, 46, q < 1 ? t : 0, ba, 1);
      if (s.label) pille(s.label, W / 2, 1620, 34);
    },
    // [minimal motiv=lorenz bis=1 von=0]  zwei Wetter-Kurven aus fast gleichen Startwerten, laufen auseinander
    lorenz(s, t) {
      const start = wortZeit(s, s.ab, 0.2), q = lerp(s.von ?? 0, s.bis ?? 1, E.sanft(clamp((t - start) / Math.max(1, (s.dauer - start) * 0.85), 0, 1)));
      const n = Math.max(2, Math.floor(q * 1300)), Xs = 120, Xe = 960, yM = 1000, sk = 17;
      const pts = b => b.slice(0, n).map((v, i) => [lerp(Xs, Xe, i / 1300), yM - v[0] * sk]);
      achsenLinie(yM);
      kurveP(pts(BAHN_B), "rgba(244,244,242,0.55)", 5); kurveP(pts(BAHN_A), WEISS, 6);
      if (s.zahlen !== false) { nummer("0,506127", 300, 520); nummer("0,506", 300, 610, 0.75); }
      if (q > 0.62 && s.label) { const a = clamp((q - 0.62) * 6, 0, 1); ctx.save(); ctx.globalAlpha = a; pille(s.label, W / 2, 1500, 36); ctx.restore(); }
    },
    // [minimal motiv=attraktor]  Lorenz-Attraktor wird gezeichnet
    attraktor(s, t) {
      const q = E.sanft(clamp(t / Math.max(1, s.dauer * 0.9), 0, 1)), n = Math.max(2, Math.floor(q * ATTR.length));
      const P = v => [W / 2 + v[0] * 19, 1380 - v[2] * 19];
      ctx.save(); ctx.globalAlpha = 0.9; glow(0.6); ctx.beginPath(); ATTR.slice(0, n).forEach((v, i) => { const [x, y] = P(v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.lineWidth = 2.2; ctx.strokeStyle = WEISS; ctx.stroke(); ohneGlow(); ctx.restore();
      const [x, y] = P(ATTR[n - 1]); glow(1.4); kreis(x, y, 10); ohneGlow();
      if (s.label) pille(s.label, W / 2, 1500, 34);
    },
    // [minimal motiv=verdoppeln]  ein Fehler-Punkt verdoppelt sich, bis das Raster voll ist; TAG zählt mit (alle 4 Tage ×2)
    verdoppeln(s, t) {
      const start = wortZeit(s, s.ab, 0.3), q = clamp((t - start) / Math.max(1, (s.dauer - start) * 0.85), 0, 1);
      const k = Math.floor(q * 8.999), anz = Math.pow(2, k), cols = 16, d = 50, x0 = W / 2 - (cols - 1) * d / 2, y0 = 640;
      for (let i = 0; i < 256; i++) { const cx = x0 + (i % cols) * d, cy = y0 + Math.floor(i / cols) * d, an = i < anz;
        if (an) { glow(0.8); kreis(cx, cy, 13); ohneGlow(); } else kreis(cx, cy, 5, "rgba(244,244,242,0.16)"); }
      text(`×${anz}`, W / 2, 500, 96);
      pille(`TAG ${k * 4}`, W / 2, 1560, 34);
      if (s.label) pille(s.label, W / 2, 1660, 30);
    },
    // [minimal motiv=faecher anzahl=51 label=…]  viele Vorhersagen aus fast demselben Start fächern auf
    faecher(s, t) {
      const q = E.sanft(clamp((t - wortZeit(s, s.ab, 0.2)) / Math.max(1, s.dauer * 0.75), 0, 1)), n = s.anzahl || 51, Xs = 140, Xe = 940, yM = 1000;
      achsenLinie(yM + 380);
      const r = A.rnd(23);
      for (let j = 0; j < n; j++) { const pts = [], ph = r() * 6, amp = (r() - 0.5) * 2;
        for (let i = 0; i <= 120 * q; i++) { const u = i / 120; pts.push([lerp(Xs, Xe, u), yM + Math.sin(u * 7 + ph * u) * 30 * u + amp * 330 * Math.pow(u, 2.2)]); }
        if (pts.length > 1) { ctx.save(); ctx.globalAlpha = j === 0 ? 1 : 0.32; if (j === 0) glow(0.9); linie(pts, j === 0 ? 5 : 2.5); ohneGlow(); ctx.restore(); } }
      glow(1.2); kreis(Xs, yM, 12); ohneGlow();
      text("HEUTE", Xs + 20, yM + 450, 30, GRAU, 800); text(s.ende || "IN 2 WOCHEN", Xe - 90, yM + 450, 30, GRAU, 800);
      if (s.label) pille(s.label, W / 2, 560, 34);
    },
    // [minimal motiv=weiche]  Schmetterling an einer Weiche: der Sturm nimmt mal diesen, mal jenen Weg
    weiche(s, t) {
      const xK = 470, yK = 1000, ziele = [[900, 700, "HIER"], [900, 1000, "DORT"], [900, 1300, "GAR NICHT"]];
      glow(0.7); linie([[120, yK], [xK, yK]], 6); for (const [x, y] of ziele) linie([[xK, yK], [x - 120, y]], 4, GRAU); ohneGlow();
      ziele.forEach(([x, y, l]) => text(l, x - 70, y - 50, 34, WEISS, 800));
      const zyk = 2.2, z = Math.floor(t / zyk) % 3, u = (t % zyk) / zyk, [zx, zy] = ziele[z];
      const pt = u < 0.45 ? [lerp(120, xK, u / 0.45), yK] : [lerp(xK, zx - 120, (u - 0.45) / 0.55), lerp(yK, zy, (u - 0.45) / 0.55)];
      glow(1.4); kreis(pt[0], pt[1], 20); kreis(pt[0], pt[1], 38, "rgba(255,255,255,0.14)"); ohneGlow();
      schmetterling(xK, yK - 80, 54, t);
      if (s.label) pille(s.label, W / 2, 1560, 34);
    },
    // [minimal motiv=foto ab=Wort]  Familienfoto: drei Figuren, die rechte (du) verblasst
    foto(s, t) {
      const q = clamp((t - wortZeit(s, s.ab, s.dauer * 0.5)) / 1.4, 0, 1);
      glow(0.7); ctx.strokeStyle = WEISS; ctx.lineWidth = 6; A.rr(200, 640, 680, 760, 24); ctx.stroke(); ohneGlow();
      figur(380, 1250, 1.0); figur(560, 1250, 1.0); figur(740, 1250, 0.72, 1 - 0.92 * q);
      if (s.label) pille(s.label, W / 2, 1520, 34);
    },
    // [minimal motiv=zeitlinie art=riss|zweig|delle]  Zeitstrahl: Riss schließt sich / neuer Zweig / Störung wird kleiner
    zeitlinie(s, t) {
      const y = 1000, xm = 540, ab = wortZeit(s, s.ab, s.dauer * 0.35), q = clamp((t - ab) / Math.max(1, (s.dauer - ab) * 0.7), 0, 1);
      text("VERGANGENHEIT", 220, y + 90, 26, GRAU, 800); text("GEGENWART", 860, y + 90, 26, GRAU, 800);
      if (s.art === "zweig") { glow(0.8); linie([[100, y], [980, y]], 6); const pts = []; for (let i = 0; i <= 40 * q; i++) { const u = i / 40; pts.push([lerp(xm - 120, 980, u), y - 330 * Math.sin(u * Math.PI / 2)]); } if (pts.length > 1) linie(pts, 6); ohneGlow();
        const fx = pts.length > 1 ? pts[pts.length - 1] : [xm - 120, y]; figur(fx[0], fx[1], 0.55); text("NEUE ZEITLINIE", 760, y - 420, 30, WEISS, 800); text("DEINE ALTE", 820, y - 50, 26, GRAU, 800); }
      else if (s.art === "delle") { const pts = []; for (let i = 0; i <= 200; i++) { const x = lerp(100, 980, i / 200), dx = x - (xm - 150); pts.push([x, y - (dx > 0 ? 140 * Math.exp(-dx / (80 + 240 * q)) * Math.max(0.08, 1 - q * 0.9) * Math.exp(-dx / 260) : 0)]); }
        glow(0.8); linie(pts, 6); ohneGlow(); }
      else { const gap = 90 * Math.sin(Math.PI * clamp(q, 0, 1)) * (q < 1 ? 1 : 0); glow(0.8); linie([[100, y], [xm - gap, y]], 6); linie([[xm + gap, y], [980, y]], 6); ohneGlow();
        if (gap > 2) { ctx.save(); ctx.globalAlpha = gap / 90; for (let i = 0; i < 6; i++) kreis(xm + (i - 2.5) * 22, y + Math.sin(t * 8 + i) * 30, 4); ctx.restore(); } }
      if (s.label) pille(s.label, W / 2, 1520, 34);
    },
  });
  function achsenLinie(y) { ctx.save(); ohneGlow(); ctx.setLineDash([14, 16]); linie([[100, y], [980, y]], 3, GRAU); ctx.restore(); }
  function kurveP(pts, farbe, b) { if (farbe === WEISS) glow(); linie(pts, b, farbe); ohneGlow(); }
})();
