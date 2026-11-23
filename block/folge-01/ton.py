import json, os, numpy as np, soundfile as sf
SR = 48000
p = json.load(open(os.environ.get("PLAN", "plan_final.json"))); Z = [z["start"] for z in p["zeilen"]]; E = [z["start"] + z["dauer"] for z in p["zeilen"]]
sauber = lambda w: w.strip(".,!?:„“\"").lower()
leer = lambda i: not p["zeilen"][i]["woerter"]
def wz(n, z): return next(w[0] for w in p["zeilen"][z]["woerter"] if sauber(w[2]) == n.lower())
DAUER = E[25] + 1.6
T_KNALL = wz("kaputtgegangen", 5) + 0.25; T_WECKER = wz("zwei", 6) + 0.15; T_BETT_AUS = wz("strom", 6) + 0.1; T_AUS = Z[6] + 0.64
T_KREIS = Z[10]; T_LOS = wz("ließen", 20) + 0.1; T_TAG = Z[23] - 0.05; tDunkel = wz("dunkel", 1); tSchatten = wz("schatten", 1)
tWeg = wz("verschwindet", 2); tSchein = wz("scheinwerfer", 9); tJetzt = wz("jetzt", 19); tLoes = wz("lösten", 22)
tFlacker = wz("flackerte", 24) - 0.2; tAugen = wz("unter", 25) + 0.1; tBewegt = wz("bewegt", 25)
n = int(DAUER * SR); musik = np.zeros(n); fx = np.zeros(n); rng = np.random.default_rng(5)
def add(buf, t0, y, g=1.0):
    a = int(t0 * SR); 
    if a < 0: y = y[-a:]; a = 0
    b = min(n, a + len(y))
    if b > a: buf[a:b] += y[:b - a] * g
f = lambda m: 440 * 2 ** ((m - 69) / 12)
def env(d, a=0.01, r=0.1):
    k = int(d * SR); e = np.ones(k); ka = min(k, max(1, int(a * SR))); kr = min(k, max(1, int(r * SR))); e[:ka] = np.linspace(0, 1, ka); e[-kr:] *= np.linspace(1, 0, kr); return e
def flaeche(ms, d, hell=6, a=1.2, r=1.6, trem=0.0):
    t = np.arange(int(d * SR)) / SR; y = np.zeros_like(t)
    for m in ms:
        for det in (-0.08, 0.0, 0.07):
            fr = f(m) * 2 ** (det / 12)
            for h in range(1, hell + 1):
                y += np.sin(2 * np.pi * fr * h * t + h * 1.3 + det * 40) / h ** 1.6
    y /= len(ms) * 3 * 1.7
    if trem: y *= 1 - trem * 0.5 * (1 + np.sin(2 * np.pi * 7.5 * t))
    return y * env(d, a, r)
def glocke(m, d=2.5):
    t = np.arange(int(d * SR)) / SR; fr = f(m)
    return (np.sin(2*np.pi*fr*t) + 0.4*np.sin(2*np.pi*fr*2.76*t)*np.exp(-t*3) + 0.2*np.sin(2*np.pi*fr*5.4*t)*np.exp(-t*6)) * np.exp(-t * 1.6) * env(d, 0.003, 0.2)
def klavier(m, d=2.0):
    t = np.arange(int(d * SR)) / SR; fr = f(m)
    return sum(np.sin(2*np.pi*fr*h*t) * np.exp(-t*(1.5 + h)) / h for h in range(1, 6)) * env(d, 0.004, 0.3)
def puls(m, d=0.35):
    t = np.arange(int(d * SR)) / SR; fr = f(m)
    return (np.sin(2*np.pi*fr*t) + 0.3*np.sin(4*np.pi*fr*t)) * np.exp(-t * 9) * env(d, 0.005, 0.05)
def hall(y, mix=0.3):
    out = y.copy()
    for d, g in [(0.089, 0.6), (0.137, 0.5), (0.211, 0.42), (0.297, 0.34), (0.401, 0.26), (0.533, 0.18), (0.71, 0.12)]:
        k = int(d * SR); z = np.zeros_like(y); z[k:] = y[:-k] * g; out += z * mix
    return out
A = {"Am": [57, 60, 64], "F": [53, 57, 60], "C": [48, 55, 60, 64], "G": [55, 59, 62], "Dm": [50, 57, 62, 65], "E": [52, 56, 59], "Em": [52, 55, 59], "Fmaj7": [53, 57, 60, 64], "Bb": [46, 53, 58, 62], "Asus": [57, 62, 64]}
# 1) Staunen 0–17: Am F C G, Spieluhr-Glocken
seq = [("Am", 0), ("F", 4.2), ("C", 8.4), ("G", 12.6)]
for ch, t0 in seq: add(musik, t0, flaeche([m + 12 for m in A[ch]] + [A[ch][0]], 4.8, hell=5), 0.32)
mel = [(76, 0.4), (72, 1.2), (74, 2.0), (71, 3.0), (72, 4.6), (69, 5.4), (72, 6.2), (77, 7.0), (76, 8.8), (72, 9.6), (79, 10.6), (76, 11.6), (74, 13.0), (71, 13.8), (74, 14.6), (79, 15.6)]
for m, t0 in mel: add(musik, t0, glocke(m + 12, 2.2), 0.09)
# 2) Kraftwerk 17–25: warm, leise Spannung
add(musik, 16.9, flaeche([62, 65, 69, 50], 4.6, hell=5), 0.3); add(musik, 21.3, flaeche([60, 64, 69, 46, 58], 4.4, hell=6, trem=0.4), 0.3)
# 3) Stromausfall: Musik bricht ab (Schnitt), dunkle Fläche
musik[int((T_AUS + 0.6) * SR):] *= 0
add(musik, T_AUS + 1.0, flaeche([45, 52, 57, 58], 6.0, hell=4, a=2.0), 0.3)
# 4) Spannung 31–61: tiefe Pulse + Tremolo-Fläche, steigend
t = 31.0; k = 0
while t < 61.0:
    add(musik, t, puls(33 if k % 4 < 3 else 36, 0.4), 0.45); add(musik, t + 0.33, puls(45, 0.3), 0.2)
    t += 0.66 if t < 47 else 0.52; k += 1
for ch, t0, d in [("Am", 31.0, 6.4), ("F", 37.3, 6.3), ("Dm", 43.5, 4.4), ("E", 47.8, 4.0), ("Am", 51.7, 5.6), ("Bb", 57.2, 4.0)]:
    add(musik, t0, flaeche([m + 12 for m in A[ch]], d + 0.8, hell=5, trem=0.6 if t0 > 43 else 0.3), 0.26)
# 5) Aufbau 61–71: Crescendo bis „Jetzt!"
for i, (ch, t0) in enumerate([("F", 61.3), ("G", 64.3), ("Asus", 67.0)]):
    add(musik, t0, flaeche([m + 12 for m in A[ch]] + [m + 24 for m in A[ch][:2]], 3.6, hell=6, trem=0.5), 0.24 + i * 0.07)
t = 61.3
while t < tJetzt - 0.05: add(musik, t, puls(45, 0.25), 0.3 + 0.3 * (t - 61) / 9); t += max(0.18, 0.45 - (t - 61) * 0.03)
riser = np.arange(int(3.0 * SR)) / SR; add(musik, tJetzt - 3.0, np.sin(2 * np.pi * np.cumsum(220 + 600 * (riser / 3) ** 2) / SR) * (riser / 3) ** 2 * 0.25)
musik[int((tJetzt + 0.05) * SR):int((T_LOS - 0.3) * SR)] *= 0.25
# 6) Höhepunkt 71.5–83.5: großer warmer Dur-Klang
for ch, t0, d in [("F", T_LOS - 0.4, 3.4), ("C", T_LOS + 3.0, 3.4), ("G", T_LOS + 6.4, 3.0), ("Fmaj7", T_LOS + 9.4, 3.2)]:
    add(musik, t0, flaeche([m + 12 for m in A[ch]] + [m + 24 for m in A[ch]] + [A[ch][0] - 12], d + 1.2, hell=7, a=0.6), 0.36)
for i, m in enumerate([72, 76, 79, 84, 79, 76, 77, 81, 84, 88, 84, 81, 79, 83, 86, 91]): add(musik, T_LOS + i * 0.7, glocke(m, 2.6), 0.08)
# 7) Morgen 83.5–87.5: hell, Zupfen
if not leer(23):
    for i, m in enumerate([72, 76, 79, 84, 79, 76, 74, 79]): add(musik, Z[23] + i * 0.45, klavier(m, 1.4), 0.14)
    add(musik, Z[23] - 0.1, flaeche([60, 64, 67, 72], 4.2, hell=5, a=0.4), 0.3)
# 8) Schlafzimmer: dünn, unheimlich, Schluss-Ton
add(musik, E[23] + 0.9, flaeche([69, 72, 76], 4.0, hell=3, a=1.0), 0.18)
add(musik, tFlacker, flaeche([69, 70], 3.0, hell=3, a=0.8), 0.16)
add(musik, tAugen, klavier(45, 3.0) + klavier(46, 3.0), 0.35)
musik = hall(musik, 0.35)
# ---------- Geräusche ----------
def rausch(d, lo=200, hi=2000):
    x = rng.normal(0, 1, int(d * SR)); X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR); X[(fr < lo) | (fr > hi)] = 0; y = np.fft.irfft(X, len(x)); return y / (np.abs(y).max() + 1e-9)
def sweep(f0, f1, d):
    t = np.arange(int(d * SR)) / SR; fr = f0 * (f1 / f0) ** (t / d); return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(d, 0.01, d * 0.5)
def klick(g=1.0):
    k = int(0.03 * SR); return rng.normal(0, 1, k) * np.exp(-np.arange(k) / SR * 220) * g
def brumm(d, fr=50):
    t = np.arange(int(d * SR)) / SR; return (np.sin(2*np.pi*fr*t) + 0.5*np.sin(2*np.pi*fr*2*t) + 0.3*np.sign(np.sin(2*np.pi*fr*3*t)) * 0.3) * env(d, 0.2, 0.2)
def growl(d, g=1.0):
    t = np.arange(int(d * SR)) / SR; fr = 55 + 10 * np.sin(2 * np.pi * 3 * t); y = np.sin(2 * np.pi * np.cumsum(fr) / SR) * (0.6 + 0.4 * np.sin(2 * np.pi * 11 * t)); y += rausch(d, 80, 400) * 0.3; return y * env(d, 0.15, 0.3) * g
def boom(d=2.5):
    t = np.arange(int(d * SR)) / SR; return (np.sin(2 * np.pi * (60 - 30 * t / d) * t) * np.exp(-t * 2.2) + rausch(d, 30, 3000) * np.exp(-t * 4) * 0.8)
def zisch(d=0.4):
    return rausch(d, 2000, 9000) * env(d, 0.01, 0.25)
def glitzer(t0, dauer, dichte=10, g=0.06):
    t = t0
    while t < t0 + dauer: add(fx, t, glocke(rng.integers(84, 100), 0.8), g); t += rng.random() / dichte
def piep(fr=2200, d=0.12):
    t = np.arange(int(d * SR)) / SR; return np.sin(2 * np.pi * fr * t) * env(d, 0.005, 0.02)
def sirene(d=1.2):
    t = np.arange(int(d * SR)) / SR; fr = 700 + 500 * np.sin(np.pi * t / d); return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(d, 0.05, 0.3)
def jubel(t0, d):
    t = t0
    while t < t0 + d:
        k = int(0.03 * SR); add(fx, t, rng.normal(0, 1, k) * np.exp(-np.arange(k) / SR * 120), 0.05); t += 0.03 + rng.random() * 0.05
    add(fx, t0, rausch(d, 300, 3000) * env(d, 0.4, 0.8), 0.06)
def voegel(t0, d):
    t = t0
    while t < t0 + d:
        dd = 0.12; tt = np.arange(int(dd * SR)) / SR; fr = 3000 + 1500 * np.sin(2 * np.pi * 18 * tt); add(fx, t, np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(dd, 0.01, 0.05), 0.03); t += 0.15 + rng.random() * 0.5
# Suchscheinwerfer-Wusch zu Beginn
add(fx, 0.0, rausch(2.0, 300, 1500) * env(2.0, 0.8, 1.0), 0.06)
# Gasse: Lampe flackert aus, Augen, Knurren
for i in range(6): add(fx, tDunkel - 0.4 + i * 0.07, klick(0.25))
add(fx, tDunkel, brumm(0.25, 100), 0.06); add(fx, tSchatten - 0.2, growl(2.4, 0.35)); add(fx, Z[2] + 0.2, growl(4.0, 0.25))
add(fx, tWeg, zisch(0.5), 0.15); add(fx, tWeg, sweep(400, 80, 0.4), 0.12)
# Kraftwerk: Brummen, Funken, Knall
add(fx, 16.9, brumm(8.0, 50), 0.05); add(fx, Z[5] - 0.2, brumm(T_KNALL - Z[5] + 0.2, 100) * np.linspace(0.3, 1, int((T_KNALL - Z[5] + 0.2) * SR)), 0.08)
for i in range(8): add(fx, T_KNALL - 1.6 + rng.random() * 1.5, zisch(0.15), 0.1)
add(fx, T_KNALL, boom(2.6), 0.6); add(fx, T_KNALL, zisch(1.2), 0.2)
# Wecker + Stromausfall
add(fx, T_WECKER, piep(1800, 0.1), 0.1); add(fx, T_BETT_AUS, klick(0.4)); add(fx, T_AUS + 0.6, sweep(500, 40, 1.6), 0.25)
for i in range(10): add(fx, T_AUS + 1.2 + i * 0.35 + rng.random() * 0.2, klick(0.2) + np.pad(sweep(300, 60, 0.15), (0, 0))[:int(0.03 * SR)] * 0, 1)
# Schatten aus den Gassen
add(fx, Z[8], growl(3.0, 0.35)); add(fx, Z[8] + 0.6, growl(2.6, 0.25))
# Autos: Türen, Klick, Scheinwerfer, Zischen der Schatten
for i in range(3): add(fx, Z[9] + 1.2 + i * 0.25, klick(0.5))
add(fx, tSchein, klick(0.6)); add(fx, E[9] + 0.02, zisch(0.5), 0.14); add(fx, E[9] + 0.05, sweep(300, 90, 0.5), 0.1)
# Polizei: Sirene kurz
add(fx, E[10] + 0.02, sirene(0.5), 0.05); add(fx, Z[11] + 0.2, sirene(1.4), 0.07)
add(fx, Z[12] + 0.6, growl(3.0, 0.3)); add(fx, Z[12] + 1.6, zisch(0.4), 0.12)
# Akku piept
for i in range(3 if not leer(13) else 0): add(fx, Z[13] + 0.8 + i * 1.0, piep(2400, 0.08), 0.06)
for i in range(6): add(fx, Z[18] + i * 0.45, piep(2600, 0.07), 0.08)
for i in range(10): add(fx, Z[18] + rng.random() * 2.8, klick(0.18))
add(fx, Z[18] + 1.4, growl(2.0, 0.3))
# Laternen: Wusch beim Loslassen, Glitzern, Jubel
add(fx, T_LOS, rausch(2.0, 200, 1200) * env(2.0, 0.3, 1.2), 0.07); jubel(T_LOS + 0.2, max(0.5, Z[21] - T_LOS - 0.6))
glitzer(Z[21] + 0.7, 7, 6, 0.035)
for i in range(4): add(fx, E[22] + 0.05 + i * 0.25, zisch(0.4), 0.05)
glitzer(Z[22], 3.5, 8, 0.03)
# Morgen: Vögel, Jubel
if not leer(23): voegel(T_TAG, 3.6); jubel(Z[23] + 1.4, 2.6)
# Zimmer: Uhr tickt, Lampe flackert, Augen
for i in range(int((DAUER - E[23] - 0.9) / 1.0)): add(fx, E[23] + 1.0 + i, klick(0.08))
tt = tFlacker
while tt < E[24] + 0.3: add(fx, tt, brumm(0.12, 100), 0.05 * (rng.random() > 0.4)); tt += 0.12
add(fx, tAugen, growl(2.5, 0.3)); add(fx, tBewegt, rausch(0.6, 100, 800) * env(0.6, 0.05, 0.3), 0.15)
# Mitmach-Frage: leise Spannungsfläche + Ton pro Antwortkarte
if len(p["zeilen"]) > 26:
    add(musik, Z[26] - 0.3, flaeche([57, 60, 64, 69], DAUER - Z[26] + 0.5, hell=4, a=0.8, r=1.2), 0.22)
    for tk in [Z[27] - 0.1, wz("papa", 27) - 0.1, wz("bett", 27) - 0.5]: add(fx, tk, glocke(88, 1.2), 0.08)
    add(fx, Z[28], klick(0.3))
# ---------- Mischung ----------
st, sr2 = sf.read(os.environ.get("STIMME", "stimme_final.wav"), dtype="float64"); st = st.mean(1) if st.ndim > 1 else st
assert sr2 == SR; stimme = np.zeros(n); stimme[:min(n, len(st))] = st[:n]
hk = np.convolve(np.abs(stimme), np.ones(int(0.25 * SR)) / int(0.25 * SR), "same"); duck = 1 - 0.6 * np.clip(hk / (hk.max() * 0.25), 0, 1)
mix = stimme + musik * 0.62 * duck + fx * 0.9 * (0.5 + 0.5 * duck)
mix /= np.abs(mix).max() / 0.9
sf.write(os.environ.get("MIX", "mix.wav"), mix.astype(np.float32), SR)
db = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9); v = np.abs(stimme) > 0.02
print("Dauer", round(DAUER, 2), "Stimme", round(db(stimme[v]), 1), "Musik unter Stimme", round(db((musik * 0.5 * duck)[v]), 1), "Musik Pausen", round(db((musik * 0.5 * duck)[~v]), 1))
