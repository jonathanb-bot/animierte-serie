"""Vorbild und Bibliothek nebeneinander: ein Bogen mit einer Zeile pro Element (links Vorbild-Bild, rechts unser Vorschaubild).

    python3 vergleich.py bogen.jpg "Baum=/tmp/watch-x/frames/frame_0003.jpg:block/katalog/objekt-baum.jpg" "Lehrer=…:…"

Ein Paar ist NAME=VORBILD:UNSER. Fehlt UNSER (NAME=VORBILD:), steht rechts „FEHLT“. Optional Ausschnitt fürs Vorbild:
NAME=VORBILD@x0,y0,x1,y1:UNSER (Anteile 0…1, z. B. @0.2,0.3,0.8,0.9), damit das Element groß zu sehen ist.
"""
import sys
from PIL import Image, ImageDraw, ImageFont

H, W = 520, 292   # pro Bild (Hochformat)
def schrift(g):
    for p in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf"]:
        try: return ImageFont.truetype(p, g)
        except OSError: pass
    return ImageFont.load_default()
F1, F2 = schrift(26), schrift(20)

def laden(pfad):
    box = None
    if "@" in pfad: pfad, b = pfad.split("@"); box = [float(v) for v in b.split(",")]
    im = Image.open(pfad).convert("RGB")
    if box: w, h = im.size; im = im.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))
    im.thumbnail((W, H)); bg = Image.new("RGB", (W, H), "#1a1a1e"); bg.paste(im, ((W - im.width) // 2, (H - im.height) // 2)); return bg

def main(ziel, paare):
    zeilen = []
    for p in paare:
        name, rest = p.split("=", 1); vor, _, uns = rest.rpartition(":") if rest.count(":") >= 1 else (rest, "", "")
        a = laden(vor); b = laden(uns) if uns else Image.new("RGB", (W, H), "#3a1a1a")
        if not uns: ImageDraw.Draw(b).text((W // 2, H // 2), "FEHLT", fill="#ff6a6a", font=F1, anchor="mm")
        z = Image.new("RGB", (2 * W + 30, H + 44), "#0e0e12"); d = ImageDraw.Draw(z)
        d.text((10, 8), name, fill="#ffe53a", font=F1); z.paste(a, (0, 44)); z.paste(b, (W + 30, 44))
        d.text((8, H + 14), "Vorbild", fill="#ffffff", font=F2); d.text((W + 38, H + 14), "Bibliothek", fill="#ffffff", font=F2)
        zeilen.append(z)
    sp = 3; br = zeilen[0].width; ho = zeilen[0].height; n = len(zeilen)
    bogen = Image.new("RGB", (min(n, sp) * (br + 16), ((n + sp - 1) // sp) * (ho + 16)), "#000")
    for i, z in enumerate(zeilen): bogen.paste(z, ((i % sp) * (br + 16), (i // sp) * (ho + 16)))
    bogen.save(ziel, quality=88); print("Vergleich:", ziel, n, "Elemente")

if __name__ == "__main__":
    if len(sys.argv) < 3: print(__doc__); sys.exit(1)
    main(sys.argv[1], sys.argv[2:])
