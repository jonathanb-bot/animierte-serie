const { chromium } = require('playwright'); const { spawn } = require('child_process');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 2560 } });
  p.on('pageerror', e => console.log('FEHLER', e.message));
  await p.goto('http://127.0.0.1:8777/edit.html'); await p.waitForFunction('window.bereit === true', null, { timeout: 120000 });
  const FPS = 60, DAUER = 28.8, N = Math.round(DAUER * FPS), aus = process.argv[2];
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', 'ausschnitt.wav',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-tune', 'film', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', aus], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < N; i++) {
    const d = await p.evaluate(async t => { await window.laden(t); window.zeichne(t); return document.getElementById('c').toDataURL('image/jpeg', 0.95); }, i / FPS);
    if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 300 === 0) console.log('Bild', i, 'von', N);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('fertig', aus);
})();
