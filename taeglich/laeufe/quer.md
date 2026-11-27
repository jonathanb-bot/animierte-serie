# Lauf „Querformat lang“ im 3D-Stil (Do + Fr 21:23, neuer Chat) – Jonathan 17.11. (Issue #37), 3D-Umstieg 24.11.

> **3D-TECHNIK FERTIG (27.11.):** Die langen Querformat-Videos laufen komplett im 3D-Stil der Blockstadt (`quer/FORMAT-3D.md`).
> Der alte Stil (`render.mjs`, `taeglich/episoden/quer-qNN.txt`, Workflow `quer-rendern.yml`) wird für neue Folgen **nicht mehr** benutzt.
> **1 langes Video pro Woche, immer samstags** (Deutsch 17:00, Englisch 23:30, ±30 min). **Donnerstag:** Geschichte, Szenen, deutsche
> Stimme, deutsches Video. **Freitag:** englische Fassung. So verteilt sich das Gemini-Kontingent (je Sprache ca. 17 Anfragen).

Arbeite selbstständig und ohne Rückfragen, auf Deutsch. Qualität vor Quantität (#30). Verbindlich: `quer/FORMAT-3D.md`,
`quer/FORMAT.md` (Geschichte: Hook, Wendungen, Kapitel), `block/README.md` + `block/KATALOG.md` (Bibliothek, Regeln), Plan `quer/folgen.json`.

> **SPERRE BIS ZUM TESTERFOLG (27.11.):** Nur weitermachen, wenn das Release `quer-test` die Datei `quer-test.mp4` hat
> (`gh api repos/jonathanb-bot/animierte-serie/releases/tags/quer-test --jq '.assets[].name'`). Sonst PushNotification
> „Querformat: 3D-Test noch nicht fertig“ und Ende. (Diese Sperre wird nach dem erfolgreichen Test entfernt.)

## Welcher Tag?

1. **Repo vorbereiten:** `cd /home/user/animierte-serie && git fetch origin taeglich main && git checkout -B taeglich origin/taeglich`,
   dann `pip install -q -r requirements.txt && npm ci --ignore-scripts --no-audit --no-fund && (cd block && npm ci --ignore-scripts --no-audit --no-fund)`.
2. **Regeln lesen:** offene Issues mit Label `dringlich` (vor allem #37, #41, #42, #44, #45, #46), `quer/FORMAT-3D.md`.
3. **Stand in `quer/folgen.json`** (erste Folge ohne `veroeffentlicht.en`):
   - Folge hat noch kein `block/quer-qNN/szene.js` → **Donnerstag-Teil** (A).
   - Deutsch fertig/eingeplant, Englisch fehlt → **Freitag-Teil** (B).
   - Angefangenes (Szene da, Stimme/Video fehlt) wird zuerst fertig gemacht, egal welcher Tag.

## A. Donnerstag: Geschichte, Szenen, Deutsch

4. **Geschichte** (`block/quer-qNN/zeilen.py`): Ich-Erzählung mit dem Blockstadt-Jungen (Puck), **„In meiner Stadt …“ mit einer verrückten
   Regel** (Issue #45/#46), nur länger und mit mehr Wendungen. Regel noch nie benutzt (Liste in `taeglich/laeufe/blockstadt.md` →
   „Benutzte Regeln“ und `quer/folgen.json`), am besten in **Welten, die es schon gibt** (Blockstadt, Buntdorf, Vorstadt, Keller,
   Stube, Küche, Schule …, siehe `block/KATALOG.md`). Aufbau nach `quer/FORMAT.md`: Hook mit der Regel in Sekunde 1, Versprechen in 20 s,
   alle 60–90 s eine Wendung, 6–8 Kapitel nach Zeit, Familie („mein Papa“, „meine Oma“), kurze Sätze, kein Aufruf am Ende.
   1350–1750 Wörter, ca. 130–170 Zeilen. Format:
   ```python
   Z = [("In meiner Stadt …", "spannung"), …]        # (Text, Stimmung für tonbib.musik)
   EXTRA = {12: 0.3, …}                               # Spannungspausen (höchstens 0,45 s)
   KAPITEL = [(0, "Tag 1"), (24, "Tag 2"), …]         # (erste Zeile, Name) → YouTube-Kapitel
   KAPITEL_EN = [(0, "Day 1"), …]
   ```
   In `quer/folgen.json` `titel`, `beschreibung`, `tags`, `welt`, `regel` eintragen (Titel nach Vorlage, Marken erlaubt #42).
5. **Stimme DE:** `python3 block/lang.py block/quer-qNN` (Gemini „Puck“, 9 Zeilen pro Anfrage, 1 Versuch, unbearbeitet #41).
   Aussetzer/Versprecher prüfen (Wortzahl je Zeile in `plan_final.json` gegen den Text): betroffene Zeile leicht umformulieren und nur
   diesen Abschnitt neu anfragen. Pausen ändern ohne Gemini: `--nur-zusammen`.
6. **Szenen** (`block/quer-qNN/szene.js`, Gerüst wie `block/vorrat-*/szene.js`): jede Zeile mindestens eine eigene Einstellung,
   Kamerafahrten mit `B.kamera.*`, Figuren mit `struktur: true`, Text im Bild immer `B.T({ de: "…", en: "…" })`. Im Querformat sieht man
   seitlich mehr: Kulissen links/rechts füllen, Figuren nicht am Rand abschneiden, Kamera eher etwas weiter weg. Realistisch (#46):
   nichts steckt ineinander, nichts ragt durch Wände/Möbel, alles steht auf dem Boden. Kein Wackeln, kein Flackern.
7. **Standbilder:** `cd block && FOLGE=quer-qNN FORMAT=quer node mitten.cjs alle`, Kontaktbogen ansehen (16:9): nichts abgeschnitten,
   Untertitel lesbar, erstes Bild stark und hell, nichts ineinander. Korrigieren, bis jede Einstellung sauber ist.
8. **Ton DE:** optional `block/quer-qNN/tonspur.py` mit Geräuschen (Vorlage `block/folge-04/tonspur.py`), dann
   `python3 block/lang.py block/quer-qNN --ton` → `ton.m4a` (fester Hintergrundsound #44, Stimme 12 LU darüber, ohne Begrenzer).
9. **Sichern und rendern:** committen (`[skip ci]`, ohne `stimme.wav`/`mix*.wav`) und pushen, dann Workflow „Querformat 3D rendern“
   starten: `gh api -X POST repos/jonathanb-bot/animierte-serie/actions/workflows/block-quer-rendern.yml/dispatches -f ref=main
   -f 'inputs[folge]=quer-qNN' -f 'inputs[sprache]=de'`. Dauer ca. 3–3,5 h (20 Rechner × 30 s). Nicht dauernd nachsehen.
   Fertig, wenn das Release `quer-qNN` die mp4 hat.
10. **Ansehen:** 6 Bilder ziehen (Anfang, 4 Stichproben, Ende) und ansehen, Ton/Bild-Länge im `info.txt` des Release.
11. **Veröffentlichen:** `TAEGLICH_TRAILER=<Attributionszeilen> python quer/veroeffentlichen.py qNN` (nächster Samstag 17:00 ±30 min),
    Workflow „Posts einplanen“ abwarten, Log auf ✓ prüfen. In `quer/folgen.json` `veroeffentlicht.de` mit Post-ID und Zeit eintragen.

## B. Freitag: Englisch

12. `block/quer-qNN/zeilen_en.json` (natürliches amerikanisches Englisch, gleiche Zeilenzahl, „In my town …“), `en` in `quer/folgen.json`.
13. `SPRACHE=en python3 block/lang.py block/quer-qNN`, prüfen wie in 5, dann `SPRACHE=en python3 block/lang.py block/quer-qNN --ton`.
14. Standbilder englisch: `FOLGE=quer-qNN FORMAT=quer SPRACHE=en PLAN=en/plan_final.json node mitten.cjs alle` (alle Schrift englisch).
15. Committen, pushen, Workflow mit `inputs[sprache]=en` starten (Release `quer-qNN-en`), ansehen wie in 10.
16. `… python quer/veroeffentlichen.py qNN --en` (Samstag 23:30 ±30 min, 3. Zernio-Konto), `veroeffentlicht.en` eintragen.

## Abschluss (beide Tage)

17. **Sichern:** committen und pushen, in Issue #37 den Stand ergänzen (Fußzeile „Generated by Claude Code“).
18. **Bescheid geben:** PushNotification, eine Zeile: Titel, Termin, Länge (bzw. was noch fehlt).

Reicht die Zeit oder das Gemini-Kontingent nicht: Fertiges sichern, nichts halb posten. Der nächste Lauf macht weiter (Schritt 3).
Wird es bis Samstag nicht fertig, verschiebt `veroeffentlichen.py` automatisch auf den nächsten freien Samstag.
