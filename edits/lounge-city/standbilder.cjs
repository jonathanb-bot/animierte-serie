const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 2560 } });
  p.on('console', m => { if (m.type() === 'error') console.log('KONSOLE', m.text()); }); p.on('pageerror', e => console.log('FEHLER', e.message));
  await p.goto('http://127.0.0.1:8765/edit.html'); await p.waitForFunction('window.bereit === true', null, { timeout: 120000 });
  const fs = require('fs'); fs.mkdirSync('steh', { recursive: true });
  for (const t of process.argv.slice(2).map(Number)) { await p.evaluate(t => window.zeichne(t), t); const d = await p.evaluate(() => document.getElementById('c').toDataURL('image/jpeg', 0.9)); fs.writeFileSync(`steh/${t.toFixed(2)}.jpg`, Buffer.from(d.split(',')[1], 'base64')); }
  await b.close();
})();
