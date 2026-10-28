# Der Alien

Zweite, eigenständige Serie im Projekt. Gleiches Format und gleicher Stil wie „24. Stock“ (siehe README im Hauptordner), aber eine eigene Welt mit eigenen Figuren.

- `serienbibel.md`: Weltregeln, Kontinuität, Anzeige, Figurenblätter, Staffelplan, Faktenquellen und die Liste **NEU ZU BAUEN**. Sie ist verbindlich.
- `storylines/folge-XX.md`: ausführliche Storylines im festen Format (Kapitel, Einstellungen, Check, Fakten-Check)
- `dauer.mjs`: schätzt die Dauer einer Storyline und teilt sie in Teile von höchstens 1 Minute: `node der-alien/dauer.mjs der-alien/storylines/folge-01.md`
- `figuren.json`: die Figuren dieser Serie. Mara, Elias, Du und der Mann im Mantel nutzen die vorhandenen Bausteine, Nox und die Sammler sind neue Figurenarten (siehe NEU ZU BAUEN).
- später `episoden/folge-XX.txt` (Drehbücher) und `audio/folge-XX/NNN.mp3` (Stimme), sobald die neuen Grafiken gebaut sind

Ablauf: Storyline → neue Grafiken bauen → Drehbuch `episoden/folge-XX.txt` → Standbilder prüfen → rendern.
