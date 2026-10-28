/* Gegenstände / Icons – zentriert, Grundgröße ca. 240 px */
(() => {
  const { box, circle, ellipse, poly, line, shade, rgba, lgrad, rr, fill, capsule } = A;
  const WASSER = "#4aa8e0";

  const I = {
    wasserflasche(t) {
      box(-45, -80, 90, 190, 30, rgba("#bfe6ff", 0.55));
      ctx.save(); A.rr(-45, -80, 90, 190, 30); ctx.clip(); box(-45, -10 + Math.sin(t * 2) * 3, 90, 130, 0, rgba(WASSER, 0.75)); ctx.restore();
      box(-24, -112, 48, 36, 8, "#2f78c4"); box(-34, 10, 68, 50, 6, "#ffffff"); box(-24, 26, 48, 6, 3, "#2f78c4");
      box(-30, -70, 12, 150, 6, "rgba(255,255,255,0.45)");
    },
    kanister(t) {
      box(-85, -95, 170, 200, 26, "#d24b3e"); box(-85, -95, 170, 200, 26, "rgba(0,0,0,0)");
      box(-55, -125, 60, 40, 10, "#a8382e"); box(25, -120, 40, 30, 8, "#2d2f33");
      box(-60, -40, 120, 90, 14, "#b9443a"); line(-55, -35, 55, 45, 10, "#d24b3e"); line(55, -35, -55, 45, 10, "#d24b3e");
    },
    badewanne(t) {
      box(-150, -40, 300, 130, 40, "#f3f5f7");
      ctx.save(); A.rr(-135, -30, 270, 60, 20); ctx.clip(); box(-135, -18 + Math.sin(t * 2) * 2, 270, 60, 0, WASSER); ctx.restore();
      box(-150, -48, 300, 20, 10, "#dfe4e8"); box(-120, 85, 22, 30, 6, "#b8bec4"); box(98, 85, 22, 30, 6, "#b8bec4");
      box(95, -110, 16, 70, 6, "#9aa2a8"); box(80, -112, 46, 16, 8, "#9aa2a8");
    },
    boiler(t) {
      box(-75, -120, 150, 240, 60, "#eef1f3"); box(-75, -120, 150, 240, 60, "rgba(0,0,0,0)");
      circle(0, -20, 30, "#d3d9de"); line(0, -20, 15, -35, 6, "#c0392b"); box(-40, 60, 80, 14, 7, "#c9d1d7");
      box(-40, 120, 14, 40, 5, "#9aa2a8"); box(26, 120, 14, 40, 5, "#9aa2a8");
    },
    eimer(t) {
      poly([[-85, -60], [85, -60], [65, 100], [-65, 100]], "#5c8fbf");
      ellipse(0, -60, 85, 20, "#3d6c99"); ellipse(0, -60, 72, 14, WASSER);
      ctx.beginPath(); ctx.arc(0, -60, 95, Math.PI * 1.05, Math.PI * 1.95); ctx.lineWidth = 8; ctx.strokeStyle = "#7a8590"; ctx.stroke();
    },
    topf(t) {
      box(-110, -40, 220, 120, 30, "#9aa3ab"); ellipse(0, -40, 110, 24, "#7d868e"); ellipse(0, -40, 96, 18, WASSER);
      box(-150, -30, 40, 18, 9, "#5d646b"); box(110, -30, 40, 18, 9, "#5d646b");
    },
    kerze(t) {
      box(-34, -40, 68, 150, 12, "#f4ead7"); ellipse(0, -40, 34, 10, "#e8dcc4");
      line(0, -42, 0, -62, 5, "#333");
      const fl = 1 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.7) * 0.06;
      ellipse(0, -92, 18 * fl, 34 * fl, "#ffb43d"); ellipse(0, -84, 9, 18, "#fff3b0");
      A.licht(0, -92, 300, "#ffb84d", 1.1);
    },
    taschenlampe(t) {
      box(-36, -40, 72, 160, 14, "#2f3236"); box(-52, -100, 104, 70, 18, "#3d4247"); ellipse(0, -100, 48, 14, "#fff6c8");
      box(-12, 20, 24, 40, 6, "#e85d4a");
    },
    dose(t) {
      box(-70, -90, 140, 180, 18, "#c7ccd1"); box(-70, -50, 140, 100, 0, "#d9893b"); ellipse(0, -90, 70, 16, "#e3e7ea");
      A.text("BOHNEN", 0, 0, 30, "#fff");
    },
    funkgeraet(t) {
      box(-80, -80, 160, 190, 24, "#30353b"); box(40, -170, 14, 100, 6, "#22262a");
      box(-55, -55, 110, 60, 10, "#a6d18a"); for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) circle(-40 + i * 40, 50 + j * 36, 12, "#4a5058");
      const w = (t * 2) % 1; ctx.globalAlpha = 1 - w;
      ctx.beginPath(); ctx.arc(47, -170, 30 + w * 50, -2.2, -0.9); ctx.lineWidth = 8; ctx.strokeStyle = "#a6d18a"; ctx.stroke(); ctx.globalAlpha = 1;
    },
    powerbank(t) {
      box(-60, -110, 120, 220, 24, "#2d3238"); box(-36, -70, 72, 120, 10, "#1c1f23");
      const n = Math.floor((t * 2) % 5); for (let i = 0; i < 4; i++) box(-26, 30 - i * 28, 52, 20, 5, i < n ? "#5fd36b" : "#3a4047");
    },
    medizin(t) {
      box(-100, -80, 200, 160, 24, "#ffffff"); box(-100, -80, 200, 34, 14, "#e2e6ea");
      box(-18, -30, 36, 100, 6, "#e04848"); box(-50, 2, 100, 36, 6, "#e04848");
    },
    wecker(t) {
      const sh = Math.sin(t * 40) * 0.08;
      ctx.save(); ctx.rotate(sh);
      circle(0, 10, 100, "#e35445"); circle(0, 10, 80, "#fff8ee");
      circle(-70, -80, 32, "#e35445"); circle(70, -80, 32, "#e35445");
      line(0, 10, 0, -45, 10, "#333"); line(0, 10, 35, 25, 8, "#333");
      box(-60, 100, 20, 30, 6, "#a8382e"); box(40, 100, 20, 30, 6, "#a8382e"); ctx.restore();
      A.laermWellen(0, 10, t, 0.6);
    },
    plane(t) {
      poly([[-150, -80], [150, -60], [110, 60], [0, 100], [-120, 50]], "#3d7fb8");
      for (const [x, y] of [[-150, -80], [150, -60], [110, 60], [-120, 50]]) circle(x, y, 10, "#d9d9d9");
      ellipse(0, 90, 18, 10, WASSER);
    },
    kocher(t) {
      box(-110, 0, 220, 70, 16, "#40464d"); ellipse(0, 0, 80, 16, "#2a2e33");
      const fl = Math.sin(t * 12);
      for (let i = -3; i <= 3; i++) ellipse(i * 20, -20 - Math.abs(fl * 6), 8, 22, "#4f8cff");
      box(-80, 70, 30, 30, 6, "#2a2e33"); box(50, 70, 30, 30, 6, "#2a2e33");
    },
    decke(t) {
      box(-150, -70, 300, 150, 30, "#b5524a"); for (let i = -2; i <= 2; i++) box(-150 + 2, -60 + i * 0 + 0, 4, 4, 2, "#fff");
      for (let k = 0; k < 4; k++) box(-150, -45 + k * 34, 300, 10, 4, "#9a4038");
    },
    tropfen(t) {
      ctx.beginPath(); ctx.moveTo(0, -130); ctx.bezierCurveTo(30, -70, 95, -10, 95, 40); ctx.arc(0, 40, 95, 0, Math.PI); ctx.bezierCurveTo(-95, -10, -30, -70, 0, -130); fill(WASSER);
      ellipse(-35, 30, 16, 32, "rgba(255,255,255,0.5)", -0.3);
    },
    ohr(t) {
      ctx.beginPath(); ctx.moveTo(-20, 110); ctx.bezierCurveTo(-90, 80, -90, -120, 10, -120); ctx.bezierCurveTo(100, -120, 100, 0, 40, 30); ctx.bezierCurveTo(10, 50, 30, 110, -20, 110); fill("#efc4a4");
      ctx.beginPath(); ctx.moveTo(-10, 60); ctx.bezierCurveTo(-40, 30, -40, -70, 10, -70); ctx.bezierCurveTo(60, -70, 50, -10, 20, 0); ctx.lineWidth = 14; ctx.strokeStyle = "#d39a7a"; ctx.lineCap = "round"; ctx.stroke();
      A.laermWellen(130, -20, t, 0.5);
    },
    auge(t) {
      ctx.beginPath(); ctx.moveTo(-150, 0); ctx.quadraticCurveTo(0, -130, 150, 0); ctx.quadraticCurveTo(0, 130, -150, 0); fill("#fff");
      circle(0, 0, 62, "#4a7a5a"); circle(0, 0, 30, "#1d1d22"); circle(-18, -18, 12, "#fff");
    },
    gluehbirne(t) {
      const an = Math.sin(t * 3) > -0.2;
      circle(0, -40, 90, an ? "#ffe07a" : "#d8d8d0"); box(-40, 40, 80, 70, 12, "#9aa2a8"); for (let i = 0; i < 3; i++) box(-44, 52 + i * 20, 88, 8, 4, "#7d858b");
      if (an) A.licht(0, -40, 330, "#ffe07a", 1);
    },
    toilette(t) {
      box(-60, -140, 120, 110, 16, "#eef1f3"); box(-80, -30, 160, 40, 16, "#e0e5e9"); ctx.beginPath(); ctx.moveTo(-80, 10); ctx.quadraticCurveTo(-60, 120, 0, 120); ctx.quadraticCurveTo(60, 120, 80, 10); fill("#eef1f3"); box(-40, 110, 80, 30, 8, "#dfe4e8");
    },
    feuer(t) {
      for (let i = 0; i < 3; i++) { const f = 1 + Math.sin(t * 9 + i * 2) * 0.1; ctx.beginPath(); ctx.moveTo(-80 + i * 10, 80); ctx.bezierCurveTo(-120 + i * 30, -20, -20 + i * 20, -60 * f, 0 + i * 5, -140 * f + i * 30); ctx.bezierCurveTo(30, -60, 120 - i * 30, -20, 80 - i * 10, 80); fill(["#e8452c", "#ff9a2e", "#ffd34d"][i]); }
    },
    kreuz(t) { box(-100, -100, 200, 200, 30, "#2e9d5a"); box(-25, -70, 50, 140, 8, "#fff"); box(-70, -25, 140, 50, 8, "#fff"); },
    batterie(t) { box(-110, -55, 200, 110, 18, "#2d3238"); box(90, -22, 20, 44, 6, "#2d3238"); box(-95, -40, 70, 80, 8, "#e0533d"); },
    zombiekopf(t) { A.kopf(0, 10, 120, A.zombieFigur(2), { t, ausdruck: "zombie" }); },
    regen(t) {
      for (let i = 0; i < 6; i++) { const y = ((t * 220 + i * 40) % 120); line(-70 + i * 28, 30 + y, -80 + i * 28, 55 + y, 8, WASSER); }
      circle(-50, -30, 60, "#c5ced6"); circle(30, -50, 75, "#c5ced6"); circle(90, -10, 50, "#c5ced6"); box(-110, -20, 250, 60, 30, "#c5ced6");
    },
    solar(t) { poly([[-150, 40], [-90, -90], [150, -90], [90, 40]], "#2c4a7a"); for (let i = 1; i < 4; i++) line(-150 + i * 60 + (i * 0), 40, -90 + i * 60, -90, 4, "#8fb3e0"); line(-120, -25, 120, -25, 4, "#8fb3e0"); box(-10, 40, 20, 70, 6, "#7d858b"); },
    schluessel(t) { circle(-60, 0, 55, "#e6b84a"); circle(-60, 0, 22, "rgba(0,0,0,0)"); box(-10, -14, 150, 28, 8, "#e6b84a"); box(100, 10, 18, 40, 4, "#e6b84a"); box(70, 10, 18, 30, 4, "#e6b84a"); },
    rucksack(t) { box(-100, -110, 200, 230, 50, "#5a6b3f"); box(-70, 10, 140, 90, 20, "#4a5833"); box(-60, -150, 120, 60, 26, "#4a5833"); },
    treppe(t) { for (let i = 0; i < 5; i++) box(-130 + i * 50, 100 - i * 50, 260 - i * 50, 50, 4, shade("#9aa3ab", -i * 0.06)); },
    uhr(t) { circle(0, 0, 120, "#2d3238"); circle(0, 0, 100, "#fff"); line(0, 0, 0, -70, 10, "#2d3238"); ctx.save(); ctx.rotate(t * 2); line(0, 0, 0, -85, 6, "#e04848"); ctx.restore(); },
    herz(t) { const s = 1 + Math.max(0, Math.sin(t * 6)) * 0.08; ctx.save(); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, 100); ctx.bezierCurveTo(-170, -10, -80, -150, 0, -60); ctx.bezierCurveTo(80, -150, 170, -10, 0, 100); fill("#e04858"); ctx.restore(); },
    muell(t) { box(-80, -80, 160, 180, 18, "#3b3f45"); box(-95, -100, 190, 30, 12, "#2d3136"); for (let i = -1; i <= 1; i++) box(i * 45 - 6, -50, 12, 120, 6, "#4b5057"); },
  };
  I.spuelkasten = I.toilette; I.flasche = I.wasserflasche; I.lampe = I.taschenlampe; I.radio = I.funkgeraet; I.essen = I.dose; I.zombie = I.zombiekopf;
  A.ICONS = Object.keys(I);
  A.I = I; // weitere Icons können hier ergänzt werden (z.B. engine/alien.js)

  A.objekt = (name, x, y, s = 1, t = 0) => {
    const fn = I[name]; if (!fn) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ellipse(0, 150, 130, 18, rgba(A.SCHATTEN, 0.15));
    fn(t);
    ctx.restore();
  };

  A.laermWellen = (x, y, t, s = 1, farbe = "#ffffff") => {
    for (let i = 0; i < 3; i++) {
      const w = ((t * 0.9 + i / 3) % 1);
      ctx.beginPath(); ctx.arc(x, y, (40 + w * 200) * s, 0, Math.PI * 2);
      ctx.lineWidth = 10 * s * (1 - w); ctx.strokeStyle = A.rgba(farbe, 0.8 * (1 - w)); ctx.stroke();
    }
  };
})();
