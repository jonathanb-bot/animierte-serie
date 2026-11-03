/* Supersampling (render.mjs mit @qualitaet max): Alle Canvas-Flächen bekommen intern window.SS-fache Auflösung,
   die Zeichen-Engine rechnet aber weiter in 1080×1920-Koordinaten. Dafür werden Breite/Höhe, Transformation,
   Filter-Pixelwerte, Schatten, Bilddaten und Muster umgerechnet. Ohne window.SS (alle alten Folgen) passiert hier nichts.
   Wird von render.mjs per addInitScript vor allen Engine-Dateien geladen; engine/index.html bleibt unverändert. */
(() => {
  const S = Number(window.SS) || 1;
  if (S === 1) return;
  const C = HTMLCanvasElement.prototype, X = CanvasRenderingContext2D.prototype;
  const set = X.setTransform, get = X.getTransform;
  const basis = c => set.call(c, S, 0, 0, S, 0, 0);

  for (const seite of ["width", "height"]) {
    const d = Object.getOwnPropertyDescriptor(C, seite);
    Object.defineProperty(C, seite, {
      configurable: true,
      get() { return Math.round(d.get.call(this) / S); },
      set(v) { d.set.call(this, Math.round(v * S)); if (this._ssCtx) basis(this._ssCtx); }, // Größe setzen leert den Zustand
    });
  }
  const getContext = C.getContext;
  C.getContext = function (typ, o) {
    const c = getContext.call(this, typ, o);
    if (typ === "2d" && c && !this._ssCtx) { this._ssCtx = c; basis(c); }
    return c;
  };

  X.setTransform = function (a, b, c, d, e, f) {
    const m = typeof a === "object" && a !== null ? a : { a, b, c, d, e, f };
    return set.call(this, m.a * S, m.b * S, m.c * S, m.d * S, m.e * S, m.f * S);
  };
  X.resetTransform = function () { basis(this); };
  X.getTransform = function () { const m = get.call(this); return new DOMMatrix([m.a / S, m.b / S, m.c / S, m.d / S, m.e / S, m.f / S]); };

  const drawImage = X.drawImage;
  X.drawImage = function (img, ...r) {
    const leinwand = img instanceof HTMLCanvasElement;
    if (r.length === 2) {
      const w = leinwand ? img.width : img.naturalWidth || img.width, h = leinwand ? img.height : img.naturalHeight || img.height;
      return drawImage.call(this, img, r[0], r[1], w, h);
    }
    if (r.length === 8 && leinwand) return drawImage.call(this, img, r[0] * S, r[1] * S, r[2] * S, r[3] * S, r[4], r[5], r[6], r[7]);
    return drawImage.call(this, img, ...r);
  };

  const getImageData = X.getImageData, putImageData = X.putImageData, createImageData = X.createImageData;
  X.getImageData = function (x, y, w, h, o) { return getImageData.call(this, x * S, y * S, w * S, h * S, o); };
  X.putImageData = function (d, x, y, ...r) { return putImageData.call(this, d, x * S, y * S, ...r.map(v => v * S)); };
  X.createImageData = function (w, h, o) { return typeof w === "object" ? createImageData.call(this, w) : createImageData.call(this, w * S, h * S, o); };

  const createPattern = X.createPattern;
  X.createPattern = function (q, art) {
    const p = createPattern.call(this, q, art);
    if (p && q instanceof HTMLCanvasElement) p.setTransform(new DOMMatrix([1 / S, 0, 0, 1 / S, 0, 0]));
    return p;
  };

  // Filter (blur, drop-shadow) und Schatten wirken in Bildpunkten, nicht in Koordinaten → mitskalieren
  const fd = Object.getOwnPropertyDescriptor(X, "filter");
  Object.defineProperty(X, "filter", {
    configurable: true,
    get() { return fd.get.call(this).replace(/(-?\d*\.?\d+)px/g, (_, n) => `${+(Number(n) / S).toFixed(2)}px`); },
    set(v) { fd.set.call(this, String(v).replace(/(-?\d*\.?\d+)px/g, (_, n) => `${(Number(n) * S).toFixed(2)}px`)); },
  });
  for (const k of ["shadowBlur", "shadowOffsetX", "shadowOffsetY"]) {
    const d = Object.getOwnPropertyDescriptor(X, k);
    Object.defineProperty(X, k, { configurable: true, get() { return d.get.call(this) / S; }, set(v) { d.set.call(this, v * S); } });
  }
})();
