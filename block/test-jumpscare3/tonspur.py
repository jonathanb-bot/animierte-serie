# Ton für Jumpscare-Test 3 (nach Jonathans Vorbild 24.11.): lange leise, vor dem Schreck noch leiser, dann Schrei, der hält, solange das Gesicht vor der Linse ist
import sys; sys.path.insert(0, ".."); sys.path.insert(0, ".")
import numpy as np, soundfile as sf
from tonbib import Ton, SR, env
T = Ton()
T.musik(["grusel"])
for i in range(3): T.fx(0.3 + i * 1.1, T.hall(T.klavier(43, 1.0) + 0.5 * T.klavier(55, 1.0), 0.5), 0.2)   # ferne Glocke
T.fx(0.0, T.rausch(4.6, 120, 600) * env(4.6, 1.0, 1.5), 0.06)                                          # Wind, verstummt
n = len(T.m); a, b = int(3.2 * SR), int(4.6 * SR); k = np.ones(n); k[a:b] = np.linspace(1, 0.15, b - a); k[b:] = 0.15
T.m *= k[:len(T.m)]; T.f *= k[:len(T.f)]                                                                 # vor dem Schreck noch leiser
T.jumpscare(5.05, halten=1.45, art="dunkel")
bett = T.m + T.f; bett = bett / (np.abs(bett).max() + 1e-9) * 0.07   # Jonathan 24.11.: „richtig plötzlich laut“ → Hintergrund sehr leise, Schrei voll
mix = bett + T.js * 0.89; mix = mix / max(1.0, np.abs(mix).max() / 0.89)
sf.write("mix.wav", mix.astype(np.float32), SR); print("mix.wav", len(mix) / SR, "s")
