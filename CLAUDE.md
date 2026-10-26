# Hinweise für Claude

- Projekt: animierte Story-Serie für Jonathan. Format und Felder stehen in README.md.
- Neue Folge: `episoden/folge-XX.json` schreiben, Ziel ca. 5 Minuten (rund 60–80 Szenen à 3–6 s). Mit Cliffhanger enden. Szenentypen abwechseln, alle 3–5 s ein Schnitt. Schlüsselwörter mit `*…*` markieren.
- Vor dem Push prüfen: `node render.mjs <datei> --bilder` und die Standbilder ansehen.
- Stimme: pro Szene `audio/<folge>/NN.mp3` (ElevenLabs via Shotstack `generate_asset`, vorher Kosten nennen).
- Push auf main → GitHub Actions rendert → Video als Release.
- Figuren immer gleich halten: Figuren-Definitionen von Folge zu Folge kopieren.
- Sprache: Deutsch.
