# Ton für den Jumpscare-Test: Wind, Herzschlag, Laternen-Summen, Stille, Schrei
import sys; sys.path.insert(0, ".."); sys.path.insert(0, ".")
import numpy as np, soundfile as sf
from tonbib import Ton, SR, env
T = Ton()
T.musik(["grusel"])
for i in range(9): T.fx(0.4 + i * 0.85, T.puls(48, 0.25), 0.25)              # Herzschlag, wird schneller
T.fx(0.0, T.rausch(4.5, 200, 900) * env(4.5, 1.0, 1.0), 0.05)                 # Wind
for i in range(5): T.fx(4.5 + i * 0.07, T.klick(0.6), 0.5)                      # Laternen gehen aus
T.jumpscare(5.25)
# ohne Stimme: Hintergrund leise, Schrei laut (Spitze −1 dBFS)
bett = T.m + T.f; bett = bett / (np.abs(bett).max() + 1e-9) * 0.22
mix = bett + T.js * 0.89; mix = mix / max(1.0, np.abs(mix).max() / 0.89)
sf.write("mix.wav", mix.astype(np.float32), SR); print("mix.wav", len(mix) / SR, "s")
