# Lauf „Zitat-Video“ (täglich 08:47, neuer Chat)

Jonathans Wunsch vom 4.11. (Issue #24): Nach jeder Staffel entsteht **ein Zitat-Video** (gut 1 Minute) zum Thema der Staffel. Jonathan lädt es **selbst** auf TikTok, Instagram und YouTube hoch und legt dabei einen eigenen Song darüber. Wir planen es **nicht** bei Zernio ein und machen **keine eigene Musik**.

Arbeite selbstständig und ohne Rückfragen, auf Deutsch.

1. **Repo vorbereiten:**
   - `cd /home/user/animierte-serie && git fetch origin taeglich main && git checkout -B taeglich origin/taeglich`
   - `pip install -q -r requirements.txt && npm ci --ignore-scripts --no-audit --no-fund`
   - `export CHROMIUM=/opt/pw-browsers/chromium`
2. **Gibt es etwas zu tun?** In `taeglich/staffeln.json` die neueste Staffel suchen, die **veröffentlicht** ist (`veroeffentlicht` nicht leer) und keine `art` hat. Gibt es zu ihr schon einen Eintrag `sNNz` mit `geliefert`, sofort aufhören: nur kurz notieren, keine PushNotification. Ist die Staffel noch nicht veröffentlicht (Produktion läuft noch), ebenfalls aufhören, der Lauf am nächsten Morgen macht es.
3. **Regeln lesen:** offene Issues mit Label `dringlich` (mcp__github__list_issues), `taeglich/FORMAT.md` → „Zitat-Video nach jeder Staffel“ und „Stil leuchtend“, die Drehbücher der Staffel (Thema, Figuren, Bögen) und als Vorlage `taeglich/episoden/s02z-f01.txt`.
4. **Schreiben:** `taeglich/episoden/sNNz-f01.txt` mit Kopf wie in der Vorlage (`@qualitaet max`, `@vortrag lebendig`, `@look 0`, `@kino 0.35`, `@stil leuchtend`, `@palette …`; bei Horror-Staffeln der düstere Look aus FORMAT.md). Titel `# <Staffeltitel> – Zitate: <Titel>`.
   - **Die Sätze sind sehr simpel, aber tiefgründig** (Jonathans Vorgabe): kurz, ein Gedanke pro Satz, Alltagssprache, Du-Form. Bekannte Redewendungen und Sprichwörter ohne Namen sind ausdrücklich erlaubt, z. B. „Geld ist nicht alles.“ Danach kommt ein zweiter Satz, der sie vertieft. **Keine Zitate mit Namen berühmter Leute**, nichts Erfundenes als Tatsache, keine Fragen ans Publikum, nie „Fortsetzung folgt“, keine Endkarte.
   - 10–14 Einstellungen, 170–200 Wörter, gesprochen über 62 s (Ziel 64–75 s). Erste Einstellung mit `hooktext` (der stärkste Satz). Je Satz ein Wow-Bild (Panorama, großes Licht, kleine Figur), Kulissen und Paletten passend zur Welt der Staffel und abwechslungsreich, immer mit Kamerabewegung. Letzte Zeile: eine kurze, warme Aufforderung (z. B. „Ruf deinen Opa an. Heute.“).
   - `grep -n "@hud\|Fortsetzung\|Echter Fakt" taeglich/episoden/sNNz-f01.txt` muss leer sein.
5. **Standbilder:** `node render.mjs taeglich/episoden/sNNz-f01.txt --bilder`, alle ansehen und korrigieren.
6. **Stimme:** `python -m ton.folge taeglich/episoden/sNNz-f01.txt --stimme gemini:Orus --anfragen 1`, danach muss `python taeglich/stimme_pruefen.py taeglich/episoden/sNNz-f01.txt` OK melden. Unklare Zeilen eindeutiger formulieren und neu vertonen. Unter 62 s: einen Satz ergänzen und neu vertonen. **Kein** `zitat_musik.py`.
7. **Rendern:** `node render.mjs taeglich/episoden/sNNz-f01.txt` (1440×2560, 60 fps). Danach Bilder ansehen (Anfang, Mitte, letztes Bild, 1 Ausschnitt in voller Auflösung) und `ffprobe` prüfen: über 62 s, Ton vorhanden.
   - Lautheit auf ca. −14,5 LUFS bringen: `ffmpeg -i ausgabe/taeglich-sNNz-f01.mp4 -af loudnorm=I=-14.5:TP=-1.5:LRA=11 -c:v copy -c:a aac -b:a 192k ausgabe/sNNz-zitate-<kurztitel>.mp4`.
8. **Liefern:**
   - Die Datei mit **SendUserFile** schicken (`display: "attach"`, `status: "proactive"`), damit Jonathan sie im Chat herunterladen kann. Dazu im Chat einen fertigen Posttext für TikTok, Instagram und YouTube schreiben: Titel, 1–2 Sätze und Hashtags (`#zitate #motivation #deutsch` plus Thema). Kein KI-Hinweis, keine Fragen ans Publikum.
   - `staffeln.json`: Eintrag `{"id": "sNNz", "art": "zitate", "zu_staffel": "sNN", "titel": …, "datum": …, "geliefert": "<Datum Uhrzeit>", "posten": "manuell (Jonathan, eigener Song)", "dauer_s": …, "saetze": [...]}`. Nicht mit `staffel_veroeffentlichen.py` posten.
   - Branch `taeglich` committen (Drehbuch, Audio, staffeln.json; mit `[skip ci]` und den Attributionszeilen aus deinem System-Hinweis) und pushen.
9. **Bescheid geben:** PushNotification an Jonathan, eine Zeile: „Zitat-Video zu <Staffeltitel> ist fertig, im Chat herunterladen“, dazu die Länge.

Danach endet die Session.
