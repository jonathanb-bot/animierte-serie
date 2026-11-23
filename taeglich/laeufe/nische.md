# Lauf „Was wäre, wenn du …“ (täglich 06:17, neuer Chat) – ein Video am Tag nach den Analysedaten

> **PAUSE DEUTSCH ab 24.11. (Jonathan 23.11.):** Auf den deutschen Kanälen läuft jetzt jeden Tag eine Folge der Blockstadt-Serie (`block/README.md`, Lauf `taeglich/laeufe/blockstadt.md`). Dieser Lauf produziert deshalb **nur noch die englische Fassung** und veröffentlicht sie auf den englischen Konten wie bisher (Insta 22:00, YouTube 23:30, TikTok 01:00). Änderungen gegenüber dem Ablauf unten: Schritt 2 prüft auf `taeglich-insta-en-n…` mit heutigem Datum; Schritt 7 (deutsche Stimme) und der deutsche Teil von Schritt 9 und 11 entfallen (nur `nische-nNNN-en` rendern und veröffentlichen); die Regel „Englisch nie vor dem deutschen Gegenstück“ ist ausgesetzt. Das deutsche Drehbuch bleibt die Vorlage für die Übersetzung. Die Querformat-Videos laufen unverändert weiter. Auf dem deutschen YouTube ist schon das Nischen-Video n002 vom 23.11. zurückgezogen (Jonathan 23.11.: auf YouTube nur Blockstadt und Querformat).

Jonathans Vorgabe 21.11.: **Keine Staffel und keine Serie wird mehr fortgesetzt. Es wird nur noch nach den Analysedaten produziert und hochgeladen.** **Master-Voraussetzung: `taeglich/MASTER.md`** (fasst Auswertung, #38, #39, Dopamin-Loop, 7 Content-Gesetze und alle festen Regeln zusammen; geht allem außer den `dringlich`-Issues vor). Dazu die jeweils aktuellen Vorgaben in `taeglich/analyse/aktuell.md` (schreibt der Lauf „Wochenanalyse“). Arbeite selbstständig, ohne Rückfragen, auf Deutsch. Qualität vor Quantität (#30): lieber einen Tag aussetzen als ein schwaches Video.

**Pro Tag genau 1 neues Video**, eigenständig (ohne Vorwissen verständlich, keine Teile, keine Fortsetzung), deutsch und englisch neu eingesprochen. Mehr nicht: Der Masse-Test hat beide TikTok-Konten an die 0-Grenze gebracht (Bericht Abschnitt 2).

## Upload-Plan (gilt bis die Wochenanalyse ihn ändert)

| Konto | Takt | Uhrzeit (Berlin, das Skript streut ±30 min, #26) |
|---|---|---|
| Instagram deutsch (sto.rys4you) | 1/Tag | 12:00 |
| YouTube deutsch | 1/Tag | 17:30 |
| TikTok deutsch (storys4you.de1) | 1/Tag (7-Tage-Erholungstest bis 28.11.) | 19:00 |
| Instagram englisch | 1/Tag | 22:00 |
| YouTube englisch | 1/Tag | 23:30 |
| TikTok englisch (storys4you_eng) | 1/Tag (Erholungstest bis 28.11.) | 01:00 (Nacht danach, US-Abend) |

- Englisch nie vor dem deutschen Gegenstück.
- Legt Jonathan neue YouTube-Kanäle an (Empfehlung im Bericht, Abschnitt 10), gehen die YouTube-Posts erst nach seinen 5–7 Tagen Aufwärmen dorthin; bis dahin auf die bisherigen Kanäle. Nichts löschen, nichts privat stellen.
- Höchstens 2 Hashtags (macht `veroeffentlichen.py` automatisch, die zwei passendsten zuerst eintragen).

## Ablauf

1. **Repo vorbereiten:** `cd /home/user/animierte-serie && git fetch origin taeglich main && git checkout -B taeglich origin/taeglich`, dann `pip install --default-timeout=30 --retries 5 -q -r requirements.txt && npm ci --ignore-scripts --no-audit --no-fund`, `export CHROMIUM=/opt/pw-browsers/chromium`.
2. **Schon erledigt?** Steht in `posten/plan.json` auf `main` (`git show origin/main:posten/plan.json`) schon ein Post `taeglich-insta-n…` mit heutigem Datum (nicht in `loeschen`): aufhören. Ist das gestrige Video deutsch veröffentlicht, aber nicht englisch (`taeglich/verlauf.json` → `en.veroeffentlicht` fehlt): erst Englisch fertig machen (Schritt 9).
3. **Regeln lesen:** zuerst **`taeglich/MASTER.md` vollständig**, dann offene Issues mit Label `dringlich` (vor allem #38 und #39), `git show origin/main:CLAUDE.md`, `taeglich/FORMAT.md` (Abschnitt „Regeln aus Issue #38“ zuerst, dann „Qualität“, „Einblendungen“, „Stil leuchtend“), `taeglich/analyse/aktuell.md`, Skill `serien-stil` vor jeder neuen Kulisse.
4. **Idee wählen:** die nächste offene Idee in `taeglich/nische.json` (Reihenfolge aus `aktuell.md`, falls dort eine steht). Höchstens jedes 4. Video `art: grusel`. **Mittwochs** stattdessen die nächste offene Idee mit `art: bau` (Test „So baust du …“, MASTER Abschnitt 3b, bis 23.12.): Aufbau nach der Tabelle dort, alle Fakten vorher mit WebSearch prüfen und als `// Quelle: …` ins Drehbuch. Id = `nische-nNNN` (fortlaufend, dreistellig). In `nische.json` `id`, `datum` und `status: "in Arbeit"` eintragen.
5. **Drehbuch** `taeglich/episoden/nische-nNNN.txt`, Kopf: `@qualitaet max`, `@vortrag lebendig`, `@klang studio`, `@einblenden aus`, `@look 0`, `@kino 0.35`, `@stil leuchtend`, `@palette …` (bei Grusel `@look 0.75`, `palette=blau`), Untertitel aus (E4 ohne Unterschied, ruhigeres Bild). Bauplan nach den Analysedaten:
   - **Bauplan, Hook-Regeln, Bild/Tempo und Ton genau nach `taeglich/MASTER.md` Abschnitt 3–6:** Dopamin-Loop mit 2 Schleifen nach der Zeittabelle (Finte 1 bei ca. 18–25 s, Finte 2 = hartes Ende), Satz 1 = Prämisse über dich, Storyboard-Zeilen `// <Sekunde> – <Schritt>: <Absicht>` über jeder Einstellung, alle 3–5 s Bildwechsel, ≥ 6 Einblendungen mit Schlüsselwort je Loop-Schritt, 62–75 s (ca. 190 Wörter, 20–22 Einstellungen).
   - **Die 7 Content-Gesetze prüfen** (MASTER Abschnitt 4), danach die Streichprobe (jeden Satz streichen, der die Geschichte nicht weiterbringt).
   - Eigene Kulisse/Welt pro Video, Bildbibliothek bevorzugt (`node taeglich/bibliothek.mjs --fuer <drehbuch>`), höchstens 1 neue Kulisse; Technik der Kulissen und Paletten in `taeglich/FORMAT.md`.
6. **Standbilder:** `node render.mjs taeglich/episoden/nische-nNNN.txt --bilder`, zuerst als Kontaktbogen ansehen (`montage ausgabe/taeglich-nische-nNNN-bilder/*.jpg -tile 6x -geometry 240x427+4+4 ausgabe/taeglich-nische-nNNN-kontakt.jpg`: Tempo, Abwechslung, keine Schrift unter den TikTok-/Reels-Knöpfen rechts und im unteren Fünftel), dann alle einzeln ansehen (erstes Bild hell und klar, nichts unter den Untertiteln, Schrift lesbar), korrigieren, bis alles sauber ist.
7. **Stimme:** `python -m ton.folge taeglich/episoden/nische-nNNN.txt --stimme gemini:Orus --anfragen 1`, danach muss `python taeglich/stimme_pruefen.py taeglich/episoden/nische-nNNN.txt` OK melden (Orus normal und voll, nie flüstern, ca. 118 Hz). Unter 62 s oder über 75 s: Text anpassen, neu vertonen.
8. **Englisch übersetzen und vertonen:** `taeglich/episoden/nische-nNNN-en.txt` wie `produktion.md` Schritt 10b (natürliches amerikanisches Englisch, alle Schrift im Bild, Kopf `@sprache en`), Stimme `gemini:$(cat taeglich/stimme_en.txt)` `--anfragen 1`, `stimme_pruefen.py` muss OK melden, Tonhöhe unter 1,5 Halbtönen Abstand.
9. **Rendern auf GitHub:** Drehbücher, Stimme, ggf. Engine committen (`[skip ci]`), auf `taeglich` pushen, Workflow „Kurzvideos rendern (taeglich)“ (`taeglich-rendern.yml`, `main`) mit `folgen=nische-nNNN,nische-nNNN-en` starten, einmal warten, `git fetch origin taeglich-ausgabe`, beide Videos nach `ausgabe/taeglich-nische-nNNN.mp4` bzw. `…-en.mp4` holen. Erstes Bild, letztes Bild und 3 Ausschnitte in voller Auflösung ansehen, im englischen Video darf keine deutsche Schrift stehen. Nie mit weniger Qualität rendern (#30).
10. **Eintrag in `taeglich/verlauf.json`:** `id` nische-nNNN, `titel` (echter Titel, kurz, neugierig, z. B. „Dein Handy zählt die Abende“), `beschreibung` (2 Sätze, die Prämisse), `hashtags` (die 2 passendsten zuerst, z. B. `#waswärewenn`, `#animation`), `tags`, `emoji`, `stimme` Orus, dazu `en` mit `titel`, `beschreibung`, `hashtags`, `tags`.
10b. **Abnahme:** alle 10 Punkte aus `taeglich/MASTER.md` Abschnitt 9 abhaken. Fehlt einer: beheben, nicht veröffentlichen.
11. **Veröffentlichen** (Zeiten aus dem Upload-Plan, heutiges Datum; ist eine Zeit schon vorbei, den nächsten Tag nehmen):
    - Deutsch: `TAEGLICH_TRAILER=<Attributionszeilen> python taeglich/veroeffentlichen.py nische-nNNN --insta-zeit <heute>T12:00 --yt-zeit <heute>T17:30 --zeit <heute>T19:00`
    - warten, bis „Posts einplanen“ fertig ist, im Log prüfen, dass alle 3 Posts mit ✓ eingeplant sind
    - Englisch: `TAEGLICH_TRAILER=<Attributionszeilen> python taeglich/veroeffentlichen.py nische-nNNN --englisch --insta-zeit <heute>T22:00 --yt-zeit <heute>T23:30 --zeit <morgen>T01:00`, wieder im Log prüfen (Konten storys4you_eng und zernio:3)
    - Scheitert eine Prüfung (Ton, Länge, schwarzes erstes Bild): nichts posten, Fehler beheben.
12. **Angeheftete Frage (#38 P. 7):** eine kurze, zum Video passende Frage für den ersten Kommentar formulieren (nie im Video selbst) und in `verlauf.json` → `kommentar_frage` (deutsch) und `en.kommentar_frage` eintragen. Posten und Anheften macht die iMac-Aufgabe (Zernio kann nicht anheften). Solange es dafür keinen Ablauf gibt, nur eintragen.
13. **Sichern:** `nische.json` → `status: "veröffentlicht"`, alles committen und auf `taeglich` pushen (Attributionszeilen). Keine PushNotification, außer bei Problemen (eine Zeile: was nicht gepostet wurde und warum).

Danach endet die Session.
