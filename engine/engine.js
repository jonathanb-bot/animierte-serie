/* Steuerung: Kamera, Overlays (HUD, Untertitel), Zeitleiste. API: init(daten), zeichne(t) */
(() => {
  const { box, circle, rgba, clamp, lerp, E, rr, fill } = A;
  let D = null;
  const W = A.W, H = A.H;

  A.fig = name => {
    if (!name) return A.STANDARD;
    if (/^zombie(\d*)$/.test(name)) return A.zombieFigur(Number(name.replace("zombie", "")) || 0);
    return Object.assign({}, A.STANDARD, (D.figuren || {})[name] || {});
  };

  // ---------- Kamera ----------
  function kamera(s, p, t) {
    const k = s.kamera || {};
    const von = Object.assign({ zoom: 1, x: W / 2, y: H / 2 }, k.von || {});
    const bis = Object.assign({}, von, k.bis || {});
    const e = E[k.kurve || "sanft"](p);
    let z = lerp(von.zoom, bis.zoom, e), x = lerp(von.x, bis.x, e), y = lerp(von.y, bis.y, e);
    if (s.punch) z *= 1 + 0.05 * (1 - E.raus(clamp(t / 0.4, 0, 1)));
    let wx = 0, wy = 0;
    const wack = s.wackeln || 0;
    if (wack) { wx = (Math.sin(t * 53) + Math.sin(t * 31)) * 5 * wack; wy = (Math.cos(t * 47) + Math.sin(t * 29)) * 5 * wack; }
    // leichtes "Handkamera"-Schweben für Lebendigkeit
    wx += Math.sin(t * 0.7) * 3; wy += Math.cos(t * 0.53) * 3;
    ctx.translate(W / 2 + wx, H / 2 + wy); ctx.scale(z, z); ctx.translate(-x, -y);
    A.sicht = { x0: x - W / 2 / z, x1: x + W / 2 / z, y0: y - H / 2 / z, y1: y + H / 2 / z };
  }

  // ---------- HUD ----------
  function hud(h) {
    if (!h) return;
    const balken = h.balken || [];
    const hoehe = 76 + balken.length * 46;
    ctx.save(); ctx.translate(56, 140);
    box(0, 0, 400, hoehe, 22, "rgba(10,13,30,0.55)");
    // Sonne/Mond
    const nacht = h.nacht;
    if (nacht) { circle(40, 40, 15, "#dcdbd0"); circle(48, 34, 13, "rgba(14,17,36,1)"); }
    else { circle(40, 40, 10, "#e8c473"); ctx.strokeStyle = "#e8c473"; ctx.lineWidth = 4; ctx.lineCap = "round"; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(40 + Math.cos(a) * 15, 40 + Math.sin(a) * 15); ctx.lineTo(40 + Math.cos(a) * 20, 40 + Math.sin(a) * 20); ctx.stroke(); } }
    ctx.font = "700 40px HUD"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff";
    const tg = `TAG ${h.tag}`; ctx.fillText(tg, 76, 42);
    if (h.zeit) { const xs = 76 + ctx.measureText(tg).width + 16; ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.fillText("|", xs, 40); ctx.fillStyle = "#fff"; ctx.fillText(h.zeit, xs + 22, 42); }
    balken.forEach(([name, wert, max, einheit], i) => {
      const y = 92 + i * 46;
      ctx.font = "700 27px HUD"; ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.textAlign = "left"; ctx.fillText(name.toUpperCase(), 24, y);
      box(150, y - 10, 140, 20, 10, "rgba(255,255,255,0.18)");
      const ant = clamp(wert / max, 0, 1);
      const farbe = ant < 0.25 ? "#d86a5e" : ant < 0.5 ? "#d9a35f" : name.toLowerCase().startsWith("wasser") ? "#6aa8cf" : "#78b593";
      if (ant > 0) box(150, y - 10, Math.max(20, 140 * ant), 20, 10, farbe);
      ctx.fillStyle = "#fff"; ctx.fillText(`${String(wert).replace(".", ",")}${einheit ? " " + einheit : ""}`, 304, y + 1);
    });
    ctx.restore();
  }

  // ---------- Untertitel ----------
  function untertitel(s, t) {
    if (!s._gruppen || !s._gruppen.length || D.untertitel === false) return;
    let g = null;
    for (const grp of s._gruppen) if (t >= grp.start && t < grp.ende) g = grp;
    if (!g) return;
    const fs = 84, sx = 0.86;
    ctx.save();
    ctx.font = `900 ${fs}px Titel`; ctx.textBaseline = "middle";
    const leer = fs * 0.34;
    const breiten = g.woerter.map(w => ctx.measureText(w.w.toUpperCase()).width * sx);
    const gesamt = breiten.reduce((a, b) => a + b, 0) + leer * (g.woerter.length - 1);
    const y = s.untertitel_y || D.untertitel_y || 1380;
    const pop = E.pop(clamp((t - g.start) / 0.16, 0, 1));
    ctx.translate(W / 2, y); ctx.scale(0.88 + 0.12 * pop, 0.88 + 0.12 * pop);
    box(-gesamt / 2 - 34, -fs * 0.72, gesamt + 68, fs * 1.44, fs * 0.36, "rgba(10,12,30,0.5)");
    let x = -gesamt / 2;
    g.woerter.forEach((w, i) => {
      const aktiv = t >= w.start, jetzt = t >= w.start && t < w.ende;
      ctx.save(); ctx.translate(x + breiten[i] / 2, 0);
      if (jetzt) ctx.scale(1.07, 1.07);
      ctx.scale(sx, 1); ctx.textAlign = "center";
      const txt = w.w.toUpperCase();
      ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 3;
      let c = "#ece8e0";
      if (jetzt) c = "#f2cf7e";
      if (w.key && aktiv) c = w.farbe || "#e9956a";
      ctx.fillStyle = c; ctx.fillText(txt, 0, 4);
      ctx.shadowColor = "transparent";
      if (w.key && aktiv) { const bw = breiten[i] / sx; box(-bw / 2, fs * 0.47, bw, 6, 3, rgba(c, 0.8)); }
      ctx.restore();
      x += breiten[i] + leer;
    });
    ctx.restore();
  }

  // Einheitlicher Look (wie „Dinge Erklärt“): helle, graue Flächen (Wände, Rahmen, Himmel) werden dunkel und
  // leicht indigo, kräftige Farben (Lampenlicht, Haut, Akzente) bleiben warm und klar. Pro Bildpunkt.
  function farblook(st = 1) {
    if (st <= 0) return;
    const bild = ctx.getImageData(0, 0, W, H), d = bild.data;
    const mk = A.mctx.getImageData(0, 0, W, H).data;
    const tr = 26, tg = 30, tb = 64; // Ziel-Indigo für neutrale Töne
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const mx = r > g ? (r > b ? r : b) : (g > b ? g : b), mn = r < g ? (r < b ? r : b) : (g < b ? g : b);
      const l = (mx + mn) / 510, chroma = (mx - mn) / 255;
      const neutral = 1 - Math.min(1, chroma / 0.32);
      // stärkste Abdunklung bei hellen Flächen (Wände), reines Weiß (Schrift, Icons, Lichter) bleibt hell
      const h = l < 0.3 ? 0 : l > 0.88 ? 1 : (l - 0.3) / 0.58, hell = h * h * (3 - 2 * h) * (l > 0.9 ? Math.max(0, 1 - (l - 0.9) / 0.07) : 1);
      let k = 1 - st * (0.16 + 0.52 * neutral * hell);
      let m = st * 0.16 * neutral;
      const p = mk[i + 3] / 255 * 0.85;
      if (p > 0) { k += (1 - st * 0.1 - k) * p; m *= 1 - p; }
      d[i] = r * k + (tr - r * k) * m; d[i + 1] = g * k + (tg - g * k) * m; d[i + 2] = b * k + (tb - b * k) * m;
    }
    ctx.putImageData(bild, 0, 0);
  }

  function vignette(st) {
    ctx.fillStyle = A.rgrad(W / 2, H / 2, H * 0.28, H * 0.78, [[0, "rgba(0,0,0,0)"], [1, `rgba(0,0,0,${st})`]]);
    ctx.fillRect(0, 0, W, H);
  }

  // ---------- API ----------
  window.init = daten => {
    D = daten; A.cv.width = W; A.cv.height = H;
    for (const s of D.szenen) {
      s._gruppen = []; let cur = [];
      const push = () => { if (cur.length) s._gruppen.push({ woerter: cur, start: cur[0].start, ende: cur[cur.length - 1].ende }); cur = []; };
      for (const w of s.woerter || []) {
        const len = cur.reduce((a, b) => a + b.w.length + 1, 0) + w.w.length;
        if (cur.length >= 3 || (cur.length && len > 19)) push();
        cur.push(w);
        if (/[.!?…,:;]$/.test(w.w)) push();
      }
      push();
      for (let i = 0; i < s._gruppen.length - 1; i++) s._gruppen[i].ende = Math.min(s._gruppen[i + 1].start, s._gruppen[i].ende + 0.6);
      if (s._gruppen.length) { const l = s._gruppen[s._gruppen.length - 1]; l.ende = Math.min(s.dauer, l.ende + 0.6); }
    }
    return true;
  };

  window.zeichne = T => {
    let idx = D.szenen.length - 1;
    for (let i = 0; i < D.szenen.length; i++) { const sz = D.szenen[i]; if (T >= sz.start && T < sz.start + sz.dauer) { idx = i; break; } }
    const s = D.szenen[idx];
    const t = T - s.start, p = clamp(t / s.dauer, 0, 1);
    s._spricht = (s.woerter || []).some(w => t >= w.start && t < w.ende);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = "none"; ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
    A.lichter = []; A._dunkel = 0;
    A.mctx.setTransform(1, 0, 0, 1, 0, 0); A.mctx.clearRect(0, 0, W, H);
    ctx.save();
    kamera(s, p, t);
    (A.SZ[s.typ] || A.SZ.titel)(s, t, p);
    ctx.restore();
    A.dunkel(s.dunkel ?? A._dunkel);
    if (s.partikel) partikel(s.partikel, T, s.partikel_staerke || 1);
    if (s.tint) { ctx.fillStyle = s.tint; ctx.globalAlpha = s.tint_staerke || 0.3; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    if (s.alarm) { ctx.fillStyle = `rgba(255,30,20,${0.1 + 0.1 * Math.sin(T * 6)})`; ctx.fillRect(0, 0, W, H); }
    farblook(s.typ === "titel" ? 0 : s.look ?? 1);
    vignette(s.vignette ?? 0.5);
    hud(s.hud);
    untertitel(s, t);
    if (s.blitz && t < 0.3) { ctx.fillStyle = `rgba(255,255,255,${1 - t / 0.3})`; ctx.fillRect(0, 0, W, H); }
    // Blenden
    const b = Math.max(clamp(1 - T / 0.5, 0, 1), clamp((T - (D.dauer - 0.8)) / 0.8, 0, 1), s.uebergang === "blende" ? clamp(1 - t / 0.35, 0, 1) : 0);
    if (b > 0) { ctx.fillStyle = `rgba(0,0,0,${b})`; ctx.fillRect(0, 0, W, H); }
  };

  function partikel(art, t, staerke = 1) {
    const r = A.rnd(art === "staub" ? 11 : art === "asche" ? 23 : 37);
    const n = Math.round((art === "staub" ? 40 : 80) * staerke);
    for (let i = 0; i < n; i++) {
      const x0 = r() * W, y0 = r() * H, sp = 0.4 + r(), gr = 2 + r() * 4;
      let x, y, c;
      if (art === "staub") { x = (x0 + Math.sin(t * 0.5 * sp + i) * 40 + t * 12 * sp) % W; y = (y0 + Math.cos(t * 0.4 * sp + i) * 30 - t * 8 * sp + H * 10) % H; c = `rgba(255,250,235,${0.1 + 0.2 * r()})`; }
      else if (art === "asche") { x = (x0 + Math.sin(t * sp + i) * 30 + W) % W; y = (y0 + t * 60 * sp) % H; c = `rgba(90,90,95,${0.35 + 0.35 * r()})`; }
      else { x = (x0 + Math.sin(t * sp + i) * 35 + W) % W; y = (y0 + t * 110 * sp) % H; c = `rgba(255,255,255,${0.5 + 0.4 * r()})`; }
      circle(x, y, gr, c);
    }
  }
})();
