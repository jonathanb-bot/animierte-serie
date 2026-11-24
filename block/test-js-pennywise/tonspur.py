# Ton Pennywise-Jumpscare: leise Spieluhr beim Ballon, verstummt, fast Stille, dann plötzlich voller tiefer Schrei
import sys; sys.path.insert(0, ".."); sys.path.insert(0, ".")
import numpy as np, soundfile as sf
from tonbib import Ton, SR, env
T = Ton()
T.musik(["grusel"])
for i, m in enumerate([84, 88, 91, 89, 86, 84, 83, 86, 84]): T.fx(0.2 + i * 0.36, T.klavier(m, 0.9), 0.12)   # Spieluhr, leicht schief
T.fx(0.0, T.rausch(4.6, 120, 600) * env(4.6, 1.0, 1.5), 0.06)
n = len(T.m); a, b = int(3.2 * SR), int(4.6 * SR); k = np.ones(n); k[a:b] = np.linspace(1, 0.15, b - a); k[b:] = 0.15
T.m *= k[:len(T.m)]; T.f *= k[:len(T.f)]
T.jumpscare(5.05, halten=1.45, art="dunkel")
bett = T.m + T.f; bett = bett / (np.abs(bett).max() + 1e-9) * 0.07
mix = bett + T.js * 0.89; mix = mix / max(1.0, np.abs(mix).max() / 0.89)
sf.write("mix.wav", mix.astype(np.float32), SR); print("mix.wav", len(mix) / SR, "s")
