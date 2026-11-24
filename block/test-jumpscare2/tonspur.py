# Ton für Jumpscare-Test 2 (Fenster): Glocke, Wind, Herzschlag, Stille, Sprung-Schrei
import sys; sys.path.insert(0, ".."); sys.path.insert(0, ".")
import numpy as np, soundfile as sf
from tonbib import Ton, SR, env
T = Ton()
T.musik(["grusel"])
for i in range(3): T.fx(0.3 + i * 1.1, T.hall(T.klavier(43, 1.0) + 0.5 * T.klavier(55, 1.0), 0.5), 0.2)  # ferne Glockenschläge (tief)
for i in range(6): T.fx(0.6 + i * 0.6, T.puls(48, 0.25), 0.25)               # Herzschlag
T.fx(0.0, T.rausch(3.6, 200, 900) * env(3.6, 1.0, 1.0), 0.05)                 # Wind, verstummt
T.jumpscare(4.15)
bett = T.m + T.f; bett = bett / (np.abs(bett).max() + 1e-9) * 0.22
mix = bett + T.js * 0.89; mix = mix / max(1.0, np.abs(mix).max() / 0.89)
sf.write("mix.wav", mix.astype(np.float32), SR); print("mix.wav", len(mix) / SR, "s")
