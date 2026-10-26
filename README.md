# 24. Stock – animierte Serie

10 Folgen à ~4–5 Minuten: Du wohnst im 24. Stock, der Strom fällt aus – und draußen ist nichts mehr normal.
Jede Folge: „Was bisher geschah“ → 10 Kapitel → Cliffhanger → **Überlebens-Check**
(„Was denkst du, passiert als Nächstes? Wie würdest du reagieren?“).

## Ton-Pipeline (`ton/`)

Baut aus einem Ton-Drehbuch pro Folge die komplette Tonspur – kostenlos, ohne API-Schlüssel.
Der Standard-Stil ist nach der Vorlage (Hochkant-Kurzgeschichte) eingemessen:

- **Stimme:** eine tiefe, trockene, zügige Erzählstimme in Du-Form (kostenlose Microsoft-Neural-Stimme),
  satzweise Betonung, Emotionen, echte Pausen
- **Musik:** durchgehender dunkler Drone, ~12 dB unter der Stimme – plus harte **Stille-Schnitte** bei Szenenwechseln
- **Geräusche:** über 50 synthetische Sounds (Wecker, Autoalarm, Zombies, versiegender Wasserhahn, Treppenhaus …),
  sparsam eingesetzt
- **Bild-Elemente:** Wort-für-Wort-Untertitel (GROSS, Schlüsselwörter orange/gelb), große Einblendungen,
  HUD mit Tag, Uhrzeit und Statusbalken
- **Master:** −14 LUFS, `timing.json` mit Wortzeiten für den Video-Renderer, optional direkt ins Video gemischt

```bash
pip install -r requirements.txt          # + ffmpeg
python -m ton folgen/demo/ton.yaml --vorschau                 # Hörprobe mit Prüfvideo
python -m ton folgen/folge-01/ton.yaml --video folge-01.mp4   # Ton + Untertitel ins fertige Video
python -m ton --liste                    # Geräusche, Musik, Emotionen, Räume
```

Format und Schreibregeln: [docs/ton-drehbuch.md](docs/ton-drehbuch.md) · Vorlage: [folgen/vorlage/ton.yaml](folgen/vorlage/ton.yaml)

Auf GitHub: **Actions → „Ton bauen“ → Run workflow** baut die Tonspuren aller Folgen parallel und stellt sie als
Download bereit.

Schrift: Oswald (SIL Open Font License, `assets/schriften/OFL.txt`).
