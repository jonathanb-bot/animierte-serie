# Der letzte Mann

Dritte, eigenständige Serie im Projekt. Gleiches Hochformat und gleicher Stil wie „24. Stock“ und „Der Alien“ (siehe README im Hauptordner), aber mit eigener Welt, eigenen Figuren und einem **kürzeren Format**: 10 Folgen zu je ca. 100–115 s, 4 Kapitel pro Folge, jede Folge in 2 Teile von höchstens 60 s geschnitten.

> Stell dir vor, du bist der einzige Mann auf der Welt.

- `serienbibel.md`: Grundidee, Tonalität, Weltregeln, Kontinuität, Zeitplan, Hinweise, Anzeige, Schauplätze, Figurenblätter, Staffelplan, Faktenquellen, NEU ZU BAUEN. **Verbindlich.**
- `laufzeitplan.md`: Laufzeit aller 10 Folgen und 20 Veröffentlichungsteile
- `storylines/folge-XX.md`: ausführliche Storylines (Kapitel, Einstellungen, Check, Fakten-Check, Laufzeit)
- `figuren.json`: die Figuren dieser Serie (du = Alex, lea, winter, thomas, nika, k1–k4, sprecherin)
- `dauer.mjs`: schätzt die Laufzeit einer Storyline, schneidet nach Kapitel 2 und prüft alle Grenzen
- später: `episoden/folge-XX.txt` (Drehbücher), `audio/folge-XX/` (Stimme), `musik/folge-XX.mp3`

```bash
node der-letzte-mann/dauer.mjs der-letzte-mann/storylines/folge-01.md
```

## Stand

| Schritt | Stand |
|---|---|
| Serienbibel, Figurenblätter, Staffelplan, NEU ZU BAUEN, Laufzeitplan | fertig |
| Storylines | Folge 1 fertig, Folgen 2–10 folgen (ein bis zwei pro Schritt) |
| Grafik (`engine/letzter-mann.js`), Drehbücher, Stimme | noch nicht begonnen |

## Reihenfolge beim Posten

Wie im Projekt festgelegt: Eine Serie wird immer komplett gepostet, bevor die nächste beginnt. „Der letzte Mann“ kommt nach „24. Stock“ und „Der Alien“.
