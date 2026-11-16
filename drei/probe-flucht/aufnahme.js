const { chromium } = require('playwright');
const fs = require('fs');
const [,, von, bis, fps, aus] = process.argv;
(async () => {
  const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 2560 } });
  p.on('console', m => { if (m.type() === 'error') console.log('KONSOLE', m.text()); });
  p.on('pageerror', e => console.log('FEHLER', e.message));
  await p.goto('http://127.0.0.1:8765/index.html'); await p.waitForFunction(() => window.bereit, null, { timeout: 60000 });
  fs.mkdirSync(aus, { recursive: true });
  const t0 = Date.now(); let i = 0;
  for (let f = Math.round(von * fps); f < Math.round(bis * fps); f++, i++) {
    await p.evaluate(t => window.renderFrame(t), f / fps);
    await p.screenshot({ path: `${aus}/${String(f).padStart(5, '0')}.png` });
  }
  console.log(`${i} Bilder, ${((Date.now() - t0) / i / 1000).toFixed(2)} s/Bild`);
  await b.close();
})();
