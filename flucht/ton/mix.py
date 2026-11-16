import json, subprocess, numpy as np
SR = 48000
def lade(pfad, ss=0, t=None, mono=False):
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(ss), '-i', pfad] + (['-t', str(t)] if t else []) + ['-f', 'f32le', '-ac', '1' if mono else '2', '-ar', str(SR), '-']
    a = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, dtype=np.float32)
    return a if mono else a.reshape(-1, 2)
def db(x): return 10 ** (x / 20)
def lp(x, fc):  # einfacher Tiefpass (2x 1-Pol), x: (n,2)
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); z = np.zeros(x.shape[1])
    for _ in range(2):
        z[:] = 0
        for i in range(0, len(x), 4800):
            blk = x[i:i + 4800]
            from scipy.signal import lfilter
            out, zz = lfilter([1 - a], [1, -a], blk, axis=0, zi=np.tile(z, (1, 1)).reshape(1, -1) if False else None), None
            y[i:i + 4800] = out
        x = y.copy()
    return y
from scipy.signal import lfilter, butter, sosfilt
def tief(x, fc): sos = butter(4, fc, 'low', fs=SR, output='sos'); return sosfilt(sos, x, axis=0).astype(np.float32)
def hoch(x, fc): sos = butter(2, fc, 'high', fs=SR, output='sos'); return sosfilt(sos, x, axis=0).astype(np.float32)
def kurve(punkte, n):  # [(zeit, dB)] -> lineare Hüllkurve (linear in dB)
    t = np.arange(n) / SR; ts, vs = zip(*punkte); return db(np.interp(t, ts, vs)).astype(np.float32)[:, None]

Z = json.load(open('zeit.json')); st = Z['starts']
bett = lade('bett.mp3'); N = len(bett) + int(1.0 * SR)
bett = np.pad(bett, ((0, N - len(bett)), (0, 0)))
G = N / SR

# --- V8: gleichmäßiges Fahren (Schleife aus 132–158 s), Beschleunigung ab 95 s
fahrt = lade('v8_fahrt.mp3', 132, 26); fahrt = hoch(fahrt, 40)
x = np.concatenate([fahrt] * (int(G / 26) + 2))[:N]
# Übergänge der Schleife weich: Kreuzblende nicht nötig bei Fahrgeräusch, nur leichte Glättung
x *= 0.5
burst = hoch(lade('v8_fahrt.mp3', 93, 11), 40) * 0.8
b0 = int((st[8] + 3.0) * SR); burst = burst[:max(0, min(len(burst), N - b0))]
fb = np.ones(len(burst), np.float32)[:, None]; k = int(0.4 * SR); fb[:k, 0] = np.linspace(0, 1, k); fb[-int(1.5 * SR):, 0] = np.linspace(1, 0, int(1.5 * SR))
motor = x.copy()
# Lautstärke-Fahrplan Motor (dB): innen/nah laut, im Wärmebild fern und dumpf, nach dem Abhängen weg
mk = kurve([(0, -16), (st[2], -16), (st[2] + 0.5, -24), (st[3], -14), (st[4], -14), (st[4] + 0.3, -30), (st[6] - 0.3, -30), (st[6], -13), (st[8] + 2.8, -12),
            (st[8] + 3.2, -40), (st[9], -40), (st[9] + 2, -60), (st[11], -60), (st[11] + 0.8, -20), (G, -24)], N)
motor = motor * mk
fern = tief(x * kurve([(0, -60), (st[4], -60), (st[4] + 0.3, -20), (st[6] - 0.3, -20), (st[6], -60), (G, -60)], N), 500)
motor[b0:b0 + len(burst)] += burst * fb * db(-8)
# --- Hubschrauber: Rotor (eigene Synthese), stark im Wärmebild und in der Totale
rng = np.random.default_rng(3); t = np.arange(N) / SR
puls = (0.5 + 0.5 * np.sin(2 * np.pi * 17 * t)) ** 6
rausch = tief(rng.standard_normal((N, 1)).astype(np.float32), 700)[:, 0]
rotor = (rausch * (0.25 + 1.6 * puls) + 0.15 * np.sin(2 * np.pi * 34 * t) * puls).astype(np.float32)
rotor = np.stack([rotor * 0.9, rotor], axis=1) * 0.35
hk = kurve([(0, -60), (st[2] - 0.5, -60), (st[2], -18), (st[3], -20), (st[4], -14), (st[6], -14), (st[6] + 0.4, -40), (st[8], -36), (st[9], -24), (st[10], -16), (st[11], -16), (st[11] + 1, -60), (G, -60)], N)
heli = rotor * hk
# --- Musik: Kevin MacLeod „Exit the Premises“ (CC BY 4.0), unter der Stimme abgesenkt
mus = lade('exit.mp3', 0, G + 1)[:N]; mus = np.pad(mus, ((0, N - len(mus)), (0, 0)))
# Stimme als Steuerspur (aus den Sprecherdateien an ihren Startzeiten)
st_ = np.zeros(N, np.float32)
for i, s0 in enumerate(st):
    v = lade(f'/home/user/animierte-serie/taeglich/audio/flucht-f001/{i+1:03d}.mp3', mono=True); a = int(s0 * SR); st_[a:a + len(v)] += np.abs(v[:N - a])
huelle = lfilter([1 - np.exp(-1 / (0.25 * SR))], [1, -np.exp(-1 / (0.25 * SR))], (st_ > 0.02).astype(np.float32))
duck = db(-9 * np.clip(huelle * 1.6, 0, 1))[:, None]
mk2 = kurve([(0, -22), (st[8] + 3, -22), (st[8] + 3.3, -17), (st[9] + 1, -19), (st[11], -21), (G - 2.5, -21), (G - 0.2, -60), (G, -60)], N)
musik = mus * mk2 * duck
# Motor ebenfalls leicht unter der Stimme
mix = bett + (motor + fern) * db(-2 * 1) * (0.6 + 0.4 * (1 - np.clip(huelle, 0, 1)))[:, None] + heli + musik
spitze = np.abs(mix).max(); print('Spitze', spitze)
if spitze > 0.95: mix *= 0.95 / spitze
mix = mix[:len(bett)]
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '256k', 'mix.mp3'], input=mix.astype(np.float32).tobytes(), check=True)
print('ok', len(mix) / SR)
