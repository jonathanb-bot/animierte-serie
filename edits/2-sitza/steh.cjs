const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 2560 } });
  p.on('pageerror', e => console.log('FEHLER', e.message)); p.on('console', m => { if (m.type()==='error' && !m.text().includes('404')) console.log('KONSOLE', m.text()); });
  await p.goto('http://127.0.0.1:8770/edit.html'); await p.waitForFunction('window.bereit === true', null, { timeout: 120000 });
  const ord = process.argv[2];
  for (const t of process.argv.slice(3).map(Number)) {
    const d = await p.evaluate(async t => { await window.laden(t); window.zeichne(t); return document.getElementById('c').toDataURL('image/jpeg', 0.9); }, t);
    require('fs').writeFileSync(`${ord}/${t.toFixed(2)}.jpg`, Buffer.from(d.split(',')[1], 'base64'));
  }
  await b.close();
})();
