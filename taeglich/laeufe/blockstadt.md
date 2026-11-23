# Lauf „Blockstadt“: täglich 1 Folge mit Mitmach-Frage (07:07, neuer Chat)

Jonathans Auftrag vom 22./23.11.: Auf den deutschen Kanälen erscheint jeden Tag 1 Folge der Blockstadt-Serie, auf TikTok, Instagram und YouTube.
- **Ende jeder Folge:** eine offene Frage mit 3 Antworten (A/B/C). Die Zuschauer schreiben ihre Wahl in die Kommentare.
- **Nächste Folge:** setzt das um, was die meisten gewählt haben.
- **Verbindlich:** `block/README.md` und `block/KATALOG.md`, also Bibliothek und Regeln.

Arbeite selbstständig, ohne Rückfragen, auf Deutsch. Qualität vor Quantität (#30).

## Feste Regeln (Jonathan)

- **Stil:** wie Folge 1. Nachtstadt, Blockfiguren, Ich-Erzählung („In meiner Stadt …“ in Folge 1; ab Folge 2 geht es direkt weiter). Papa, Oma und die Schatten-Wesen bleiben.
- **Stimme:** Gemini „Puck“ als Kinderstimme. Kurze Abschnitte (3 Zeilen), keine Radio-Kette, nur kleiner Tonhöhen-Angleich auf etwa 200 Hz. Die Vorlage ist `block/folge-01/stimme4.py`.
- **Musik:** passt zur Stimmung jeder Zeile, über `block/tonbib.py` mit `Ton.musik([...])`.
- **Bild:**
  - Kein Kamera-Wackeln, nichts darf flackern. Das Gerüst `block/folge.js` sorgt dafür.
  - Ein-Wort-Untertitel in Gelb.
  - Große Autos.
  - Erstes Bild nie schwarz.
- **Ende:** „Was soll ich jetzt tun?“, dann 3 kurze Antworten in einem Satz, dann „Schreibt es in die Kommentare. Was die meisten sagen, mache ich.“ Dazu die Karten A/B/C im Bild.
- **Längen:**
  - TikTok und Instagram: volle Länge, ideal 75–110 s.
  - YouTube: höchstens 89 s. `zusammen_yt.py` lässt Nebensätze weg und läuft höchstens 6 % schneller.
- **Uhrzeiten (Berlin, das Skript streut ±30 min):**
  - Instagram 12:00
  - YouTube 17:30
  - TikTok 19:00

## Ablauf

1. **Repo vorbereiten:**
   ```
   cd /home/user/animierte-serie && git fetch origin taeglich main && git checkout -B taeglich origin/taeglich
   pip install -q -r requirements.txt
   (cd block && npm ci --ignore-scripts)
   python3 -m http.server 8767 --directory block &
   ```
2. **Schon erledigt?** Steht in `posten/plan.json` auf `main` schon `taeglich-insta-bNN` mit heutigem Datum, hier aufhören.
3. **Lesen:**
   - `block/README.md` und `block/KATALOG.md`;
   - die letzte Folge (`block/folge-NN/zeilen.py`, `szene.js` bzw. `szene.html`);
   - `taeglich/verlauf.json` → Eintrag `block-bNN` mit `antworten`.
4. **Abstimmung auswerten:**
   - Workflow „Posts einplanen“ (`posten.yml`, `main`) mit `kommentare=true` starten, warten bis fertig, `git fetch origin main`, dann `python3 block/stimmen.py NN`.
   - Es gewinnt die Antwort mit den meisten Nennungen über alle Plattformen. Gültig sind A/B/C oder eindeutige Stichwörter aus den Antworten.
   - **Nie ein Ergebnis erfinden.** Ohne gültige Stimme entscheidet die spannendste Antwort, und die Folge sagt nicht „ihr habt gewählt“.
   - Das Ergebnis in `verlauf.json` → `block-bNN.ergebnis` eintragen.
5. **Geschichte der neuen Folge:**
   - Beginnt direkt mit der gewählten Handlung, zum Beispiel „Ich habe das Licht angemacht. …“.
   - Ein Spannungsbogen mit Spektakel-Höhepunkt, wie die Laternen in Folge 1.
   - Endet mit neuer Gefahr und neuer Frage.
   - 22–28 Zeilen, kurze Sätze, Ich-Erzählung.
   - Jede Zeile bekommt eine Stimmung (siehe `tonbib.py`).
   - Eigene Ideen, nie Inhalte fremder Videos übernehmen.
6. **Ordner `block/folge-NN/`:**
   - `zeilen.py` mit Zeilen und Stimmungen.
   - Stimme mit `stimme4.py` (Kopie, Zeilen importieren).
   - `zusammen.py` und `zusammen_yt.py` kopieren und die Pausen anpassen.
   - `szene.js`: nur Ereignisse und Einstellungen. Alles Wiederkehrende kommt aus `../folge.js`, Kulissen, Objekte und Figuren aus der Bibliothek (`KATALOG.md`).
   - Neue Kulissen oder Objekte kommen **in die Bibliothek** (`requisiten.js` usw.), nicht in die Folge, und werden in `KATALOG.md` eingetragen.
7. **Standbilder:**
   - `FOLGE=folge-NN node block/mitten.cjs alle`, als Kontaktbogen ansehen.
   - Prüfen: keine Kamera in Objekten, nichts verdeckt Gesichter, Karten verdecken nichts Wichtiges.
   - Korrigieren, bis alles sauber ist. Danach mit `PLAN=plan_yt.json` noch einmal.
8. **Rendern:** `block/alles_rendern.sh <Bilder voll> <Bilder yt>` (anpassen auf `FOLGE`). 60 fps, etwa 1,7 Bilder pro Sekunde mit 3 Teilen.
9. **Ton:** `tonspur.py` der Folge mit `tonbib.Ton` (Musik nach Stimmung, Geräusche, Karten-Töne), für YouTube mit `PLAN=plan_yt.json STIMME=stimme_yt.wav MIX=mix_yt.wav`.
10. **Kodieren und prüfen:**
    - Unter 100 MB: `-crf 22 -maxrate 7M -bufsize 14M`, Ton −14 LUFS.
    - Kontaktbogen im Halbsekunden-Abstand ansehen.
    - Spracherkennung über die Mischung: Jede Zeile muss erkennbar sein. Werden Wörter verschluckt, Geräusche verschieben oder leiser machen.
11. **Veröffentlichen:**
    - Videos ablegen als `ausgabe/taeglich-block-bNN.mp4` (voll) und `ausgabe/taeglich-block-bNNk.mp4` (YouTube).
    - Einträge `block-bNN` und `block-bNNk` in `verlauf.json` anlegen: `titel`, `beschreibung` mit der Frage, 2 Hashtags, `kommentar_frage`, `antworten`.
    - Dann:
      ```
      TAEGLICH_TRAILER=<Attribution> python taeglich/veroeffentlichen.py block-bNN --max-dauer 120 --plattformen tiktok,instagram --insta-zeit <heute>T12:00 --zeit <heute>T19:00
      TAEGLICH_TRAILER=<Attribution> python taeglich/veroeffentlichen.py block-bNNk --plattformen youtube --zeit <heute>T19:00 --yt-zeit <heute>T17:30
      ```
    - Im Log von „Posts einplanen“ prüfen, dass alle Posts mit ✓ eingeplant sind.
12. **Sichern:** Alles committen und auf `taeglich` pushen, mit `[skip ci]` und den Attributionszeilen.
