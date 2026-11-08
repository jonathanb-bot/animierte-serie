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
})();
