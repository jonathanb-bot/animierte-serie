import json, numpy as np, scipy.io.wavfile as wf, scipy.signal as sg
sr, x = wf.read('song-ausschnitt.wav'); x = x.astype(np.float32); x = x.mean(1) if x.ndim > 1 else x; x /= np.abs(x).max()
hop = 256; f, t, Z = sg.stft(x, sr, nperseg=2048, noverlap=2048-hop); M = np.log1p(np.abs(Z) * 100)
def flux(lo, hi):
    b = (f >= lo) & (f < hi); d = np.diff(M[b], axis=1); d[d < 0] = 0; e = d.sum(0); e = np.concatenate([[0], e]); return e / (e.max() + 1e-9)
tt = t
low = flux(30, 150); voc = flux(1000, 4000)  # Kick / Sprachanteile (Konsonanten)
z = json.load(open('zeitleiste.json')); b0, B = z['beat0'], z['beat']
# 1) Beat-Raster gegen Kick prüfen: beste Phase
def score(ph): return sum(low[np.argmin(abs(tt - (ph + k * B)))] for k in range(int(26 / B)))
phs = np.arange(0, B, 0.005); best = phs[np.argmax([score(p) for p in phs])]
print('Beat-Phase aktuell', b0, 'beste laut Kick', round(best, 3))
b0 = float(best); z['beat0'] = round(b0, 3)
s16 = B / 4
def stark(tm, env, w=0.03):
    m = (tt > tm - w) & (tt < tm + w); return env[m].max() if m.any() else 0
alt_neu = []
for zl in z['zeilen']:
    prev = zl['a'] - 0.3
    for w in zl['woerter']:
        a = w['a']; ks = np.arange(np.ceil((a - 0.16 - b0) / s16), np.floor((a + 0.12 - b0) / s16) + 1)
        cand = [b0 + k * s16 for k in ks if b0 + k * s16 > prev + 0.05]
        if not cand: cand = [max(a, prev + 0.06)]
        sc = [stark(c, voc) - 0.8 * abs(c - a) for c in cand]; n = cand[int(np.argmax(sc))]
        alt_neu.append((w['w'], round(a, 2), round(n, 3))); w['a_alt'] = a; w['a'] = round(float(n), 3); prev = n
    for i, w in enumerate(zl['woerter']):
        w['e'] = round(max(w['a'] + 0.06, zl['woerter'][i + 1]['a'] - 0.02 if i + 1 < len(zl['woerter']) else w['e']), 3)
for r in alt_neu: print(r)
json.dump(z, open('zeitleiste-v4.json', 'w'), ensure_ascii=False, indent=1)
# Einsätze aller Zeilen gegen Beat
for zl in z['zeilen']: print(zl['text'][:30], 'Zeile ab', zl['a'], 'erstes Wort', zl['woerter'][0]['a'], 'Beat-Nr', round((zl['woerter'][0]['a'] - b0) / B, 2))
