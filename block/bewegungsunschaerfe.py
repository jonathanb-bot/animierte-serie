"""Bewegungsunschärfe für schnelle Jumpscare-Sprünge: jedes Bild im Bereich = 0.22·vorher + 0.56·selbst + 0.22·nachher.
Originale nach <frames>_roh. Aufruf: python3 bewegungsunschaerfe.py <frames-ordner> <von> <bis>  (Bildnummern, inklusive)"""
import glob, os, shutil, sys, numpy as np
from PIL import Image
ordner, von, bis = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
fs = sorted(glob.glob(ordner.rstrip('/') + '/*.jpg')); roh = ordner.rstrip('/') + '_roh'; os.makedirs(roh, exist_ok=True)
bild = {n: np.asarray(Image.open(fs[n]), dtype=np.float32) for n in range(von - 1, bis + 2)}
for n in range(von, bis + 1):
    if not os.path.exists(os.path.join(roh, os.path.basename(fs[n]))): shutil.copy(fs[n], roh)
    Image.fromarray((0.22 * bild[n - 1] + 0.56 * bild[n] + 0.22 * bild[n + 1]).clip(0, 255).astype(np.uint8)).save(fs[n], quality=95)
print(f"unscharf: {von}–{bis}, Originale in {roh}")
