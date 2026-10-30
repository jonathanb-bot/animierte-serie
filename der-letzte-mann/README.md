# Der letzte Mann

Dritte, eigenständige Serie im Projekt. Gleiches Hochformat und gleicher Stil wie „24. Stock“ und „Der Alien“ (siehe README im Hauptordner), aber mit eigener Welt, eigenen Figuren und einem **kürzeren Format**: 10 Folgen zu je ca. 100–115 s, 4 Kapitel pro Folge, jede Folge in 2 Teile von höchstens 60 s geschnitten.

> Stell dir vor, du bist der einzige Mann auf der Welt.

- `serienbibel.md`: Grundidee, Tonalität, Weltregeln, Kontinuität, Zeitplan, Hinweise, Anzeige, Schauplätze, Figurenblätter, Staffelplan, Faktenquellen, NEU ZU BAUEN. **Verbindlich.**
- `laufzeitplan.md`: Laufzeit aller 10 Folgen und 20 Veröffentlichungsteile
- `storylines/folge-XX.md`: ausführliche Storylines (Kapitel, Einstellungen, Check, Fakten-Check, Laufzeit)
- `figuren.json`: die Figuren dieser Serie (du = Alex, lea, winter, thomas, nika, k1–k4, sprecherin)
- `dauer.mjs`: schätzt die Laufzeit einer Storyline, schneidet nach Kapitel 2 und prüft alle Grenzen
- `episoden/folge-XX.txt`: Drehbücher (über jeder Zeile steht die Bildbeschreibung als Kommentar)
- `audio/folge-XX/NNN.mp3` + `NNN.json`: Stimme und Wortzeiten pro Einstellung, `musik/folge-XX.mp3`: leise Geräusche und Stille-Schnitte

```bash
python -m ton.folge der-letzte-mann/episoden/folge-01.txt --stimme gemini:Orus --anfragen 2   # eine Anfrage pro Teil
python -m ton.pruefen der-letzte-mann-folge-01                                                 # Ziel ca. -15 LUFS
```

```bash
node der-letzte-mann/dauer.mjs der-letzte-mann/storylines/folge-01.md
```

## Stand

| Schritt | Stand |
|---|---|
| Serienbibel, Figurenblätter, Staffelplan, NEU ZU BAUEN, Laufzeitplan | fertig |
| Storylines (`storylines/`) | alle 10 fertig |
| Drehbücher (`episoden/`) | alle 10 fertig, erzeugt mit `python3 der-letzte-mann/drehbuch.py` aus den Storylines |
| Stimme (`audio/`, `musik/`) | alle 10 mit Gemini „Orus“, ohne „Echter Fakt“, jede Einstellung per Spracherkennung gegen den Text geprüft, −14,9 bis −15,7 LUFS. Staffel gemessen 17:24 min |
| Grafik (`engine/letzter-mann.js`) | gebaut, Standbilder aller Folgen geprüft. `rendern.yml` kennt die Serie (`der-letzte-mann-folge-XX`). Rendern lokal: `node render.mjs der-letzte-mann/episoden/folge-XX.txt --teile --max 60` |
| Fertige Videos | alle 10 gerendert und geprüft (Ton da, Bild = Ton, −14,7 bis −15,4 LUFS). Branch `youtube-upload`: `der-letzte-mann-folgen/folge-XX.mp4` = ganze Folge (TikTok), `der-letzte-mann/folge-XX-teil-N.mp4` = 2 Teile je Folge (Instagram/YouTube, alle Folgen über 90 s, Schnitt nach Kapitel 2, 43–57 s). Prüfliste 134/134 ok |

## Reihenfolge beim Posten

Jonathans Vorgabe vom 30.10. (Issue #6): „Der letzte Mann“ läuft **ab 30.10. parallel** zu „24. Stock“ / „Der Alien“, immer 2 Stunden versetzt.

| Plattform | pro Tag | Zeiten | Versatz zu den anderen |
|---|---|---|---|
| Instagram | 3 Teile | 10:00, 14:00, 18:00 | Vormittag +2 h, Mittag +2 h, Abend −2 h |
| YouTube Shorts | 3 Teile | 10:30, 14:30, 18:30 | wie Instagram |
| TikTok | 2 ganze Folgen | 10:00, 18:00 | früh +2 h, abends −2 h |

Eingetragen in `posten/plan.json` auf `main` (IDs `mann-tiktok-XX`, `mann-insta-XX-N`, `mann-yt-XX-N`). TikTok 30.10.–4.11., Instagram/YouTube 30.10.–6.11.
