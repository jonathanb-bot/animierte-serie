"""Kontaktbogen aller Vorschaubilder: block/katalog/uebersicht.jpg (Namen stehen schon im Bild)."""
from pathlib import Path
from PIL import Image
D = Path(__file__).resolve().parent / "katalog"
bilder = sorted(p for p in D.glob("*.jpg") if p.name != "uebersicht.jpg")
SP, W, H = 8, 180, 320
zeilen = (len(bilder) + SP - 1) // SP
bogen = Image.new("RGB", (SP * W, max(1, zeilen) * H), "#111")
for i, p in enumerate(bilder):
    bogen.paste(Image.open(p).convert("RGB").resize((W, H)), ((i % SP) * W, (i // SP) * H))
bogen.save(D / "uebersicht.jpg", quality=85)
print("Übersicht:", D / "uebersicht.jpg", len(bilder), "Elemente")
