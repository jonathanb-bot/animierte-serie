const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1200, height: 1200 } });
  await p.goto('http://127.0.0.1:8765/cap.html'); await p.waitForFunction('window.bereit === true', null, { timeout: 60000 });
  const fs = require('fs'), N = 96;
  for (let i = 0; i < N; i++) { const d = await p.evaluate(w => window.bild(w), -Math.PI / 2 + i / N * Math.PI * 2); fs.writeFileSync(`cap/${String(i).padStart(3, '0')}.png`, Buffer.from(d.split(',')[1], 'base64')); }
  await b.close();
})();
