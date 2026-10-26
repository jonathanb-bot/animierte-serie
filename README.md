# 24. Stock – animierte Serie

10 Folgen à ~4–5 Minuten: Du wohnst im 24. Stock, der Strom fällt aus – und draußen ist nichts mehr normal.
Jede Folge: Vorspann → „Was bisher geschah“ → 10 Kapitel → Cliffhanger → **Überlebens-Check**
(„Was denkst du, passiert als Nächstes? Wie würdest du reagieren?“).

## Ton-Pipeline (`ton/`)

Baut aus einem Ton-Drehbuch pro Folge die komplette Tonspur – kostenlos, ohne API-Schlüssel:

- **Stimmen:** Microsoft-Edge-Neural-Stimmen (gratis), mit Emotionen, satzweiser Betonung und echten Pausen,
  eigene Stimme pro Figur, Figuren klingen im Raum (Bad, Treppenhaus, draußen …)
- **Musik:** selbst komponiert nach Stimmung (Titel, Rückblick, Spannung, Nacht, Action, Cliffhanger, Outro …),
  wird unter Sprache automatisch leiser
- **Geräusche & Atmos:** über 50 synthetische Sounds – Wecker, Autoalarm, Zombies, Wasserhahn, der versiegt,
  Treppenhaus-Schritte, Kerzen, Wind, Regen, SOS-Pfeife …
- **Master:** −14 LUFS (YouTube), Untertitel (`.srt`), `timing.json` für den Video-Renderer,
  optional direkt ins fertige Video gemischt

```bash
pip install -r requirements.txt          # + ffmpeg
python -m ton folgen/demo/ton.yaml --vorschau            # Hörprobe mit Prüfvideo
python -m ton folgen/folge-01/ton.yaml --video folge-01.mp4   # Ton ins fertige Video
python -m ton --liste                    # alle Geräusche, Musik-Stimmungen, Emotionen, Räume
```

Format des Drehbuchs: [docs/ton-drehbuch.md](docs/ton-drehbuch.md) · Vorlage: [folgen/vorlage/ton.yaml](folgen/vorlage/ton.yaml)

Auf GitHub: **Actions → „Ton bauen“ → Run workflow** baut die Tonspuren aller Folgen parallel und stellt sie als
Download bereit.
