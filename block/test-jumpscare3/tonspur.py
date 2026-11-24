# Ton für Jumpscare-Test 3 (nach Jonathans Vorbild 24.11.): lange leise, vor dem Schreck noch leiser, dann Schrei, der hält, solange das Gesicht vor der Linse ist
import sys; sys.path.insert(0, ".."); sys.path.insert(0, ".")
import numpy as np, soundfile as sf
from tonbib import Ton, SR, env
T = Ton()
T.musik(["grusel"])
for i in range(3): T.fx(0.3 + i * 1.1, T.hall(T.klavier(43, 1.0) + 0.5 * T.klavier(55, 1.0), 0.5), 0.2)   # ferne Glocke
T.fx(0.0, T.rausch(4.3, 200, 900) * env(4.3, 1.0, 1.5), 0.05)                                          # Wind, verstummt
n = len(T.m); a, b = int(3.2 * SR), int(4.4 * SR); k = np.ones(n); k[a:b] = np.linspace(1, 0.15, b - a); k[b:] = 0.15
T.m *= k[:len(T.m)]; T.f *= k[:len(T.f)]                                                                 # vor dem Schreck noch leiser
T.jumpscare(4.77, halten=1.3)
bett = T.m + T.f; bett = bett / (np.abs(bett).max() + 1e-9) * 0.22
mix = bett + T.js * 0.89; mix = mix / max(1.0, np.abs(mix).max() / 0.89)
sf.write("mix.wav", mix.astype(np.float32), SR); print("mix.wav", len(mix) / SR, "s")
