# Deine Welt – Serienbibel (verbindlich)

Jonathans Idee vom 9.11.2026 (Issue #32): **Die Follower sind die Einwohner eines wachsenden Reichs.** Jeder Follower ist ein Mensch in deinem Reich. Der **Top-Kommentar** unter der letzten Folge bestimmt, was als Nächstes gebaut wird oder passiert. Alles hat **dauerhafte Folgen** und steht im **Weltgedächtnis**.

Es gelten zusätzlich alle offenen Issues mit Label `dringlich`, `CLAUDE.md` und `taeglich/FORMAT.md` (Stimme Orus, Qualität vor Quantität, Du-Erzählung, nie „Fortsetzung folgt“, nie „Echter Fakt“, kein `@hud`). Was hier steht, geht für diese Serie vor.

## Jonathans Vorgaben (9.11.)

- **Einwohner = Follower aller Konten zusammen** (TikTok, Instagram, YouTube, deutsch und englisch), Quelle `posten/analyse.json` → `python welt/stand.py`.
- **Nur Deutsch** (erst einmal).
- **Look: leichte 3D-Optik, clean** (isometrische Insel, Kulisse `reich` in `engine/reich.js`). Jedes Element steht auf einem Feld und **kann ersetzt werden**: aus einem Haus wird ein Hochhaus, aus einem Weg eine Straße, Infrastruktur kommt dazu. Das alles muss einen nachvollziehbaren Ablauf haben.
- **Figuren sehr simpel:** Es gibt nur **den Gründer und Präsidenten (du, die blaue Figur `du`)** und die **Einwohner** (einfache kleine Figuren, eine pro Follower). **Keine anderen Personen**, keine Familie, keine Nebenfiguren. Nahaufnahmen nur von dir (`gesicht du`).
- **Keine Vorgaben von uns.** Wir starten mit **einem kleinen Haus** und versuchen, das Reich auszubauen. Was passiert, bestimmen **nur die Zuschauer**. Am Anfang ist es leicht („Pille-Palle“), später wird es **schwerer** (siehe „Schwierigkeit“).
- **Ziel des Reichs:** expandieren, bis **die ganze Welt zu diesem Reich gehört**.
- **Folge 1 sagt ausdrücklich**, dass die Zuschauer alles gestalten können, was sie wollen, und dass das Ziel die ganze Welt ist. Ab Folge 2: „Ihr habt entschieden: …“; ab Folge 3 mit Namen und Kommentar im Bild.
- ~~Keine Nutzernamen im Video.~~ **Seit 12.11. (Jonathan): Nutzernamen und Kommentare kommen ins Video** (siehe „Ab Folge 3“).
- **Eine Folge am Tag**, Test vom 10. bis 15.11. Danach entscheidet Jonathan nach den Zahlen.
- **Posten:** Deutsches TikTok zeigt in dieser Zeit nur diese Serie (die anderen deutschen TikToks sind pausiert, `posten/plan.json` → `_pausiert`). Instagram und YouTube laufen normal weiter, die Welt-Folge kommt dort dazu, ohne Überschneidung (mindestens 1 Stunde Abstand zu anderen Posts derselben Plattform).

## Wie Vorschläge umgesetzt werden

1. **Holen:** Workflow „Posts einplanen“ auf `main` mit `kommentare=true`, danach mit `analyse=true` starten, jeweils abwarten, dann `git fetch origin main` und `python welt/stand.py`. Gezählt werden die Kommentare unter der zuletzt veröffentlichten Folge auf allen drei Plattformen, der mit den meisten Likes gewinnt (bei Gleichstand mehr Antworten, dann der frühere).
2. **Prüfen, von oben nach unten.** Der erste Kommentar, der alle Punkte erfüllt, gilt:
   - Er schlägt etwas vor, das im Reich passieren oder gebaut werden soll (kein „cool“, kein Emoji, keine Frage ohne Vorschlag).
   - Keine Beleidigung, keine Gewalt gegen Menschen oder Tiere, nichts Sexuelles, keine Werbung, kein Spam, keine echte Person, keine echte Partei.
   - Er lässt sich im Reich nachvollziehbar umsetzen. Fantastisches ist erlaubt, braucht aber eine Erklärung innerhalb der Welt und **einen Preis** (Zeit, Einwohner, Material, Fläche, ein Risiko). Ist ein Vorschlag für den jetzigen Stand zu groß, wird **der erste machbare Schritt** dorthin gebaut („Ihr wollt einen Flughafen. Dafür braucht ihr erst eine Straße.“).
   - Mehrere Ideen in einem Kommentar: der Kern zählt.
3. **Kein passender Kommentar:** Das Reich muss trotzdem weiter. Die Welt stellt eine Aufgabe (Wetter, Platzmangel, Hunger, ein Fremder am Strand), und du entscheidest das Nötigste. Dann heißt es nicht „Ihr habt entschieden“.
4. **Im Video sichtbar machen:** gleich nach dem Hook „Ihr habt entschieden: …“ mit dem Kern des Kommentars in eigenen Worten (`gross=` oder `ein=`), ohne Nutzernamen. Danach sieht man, wie es gebaut wird (`baustelle` → fertiges Element), was es kostet und was es auslöst. Am Ende die ganze Insel mit dem neuen Stand.
5. **Dokumentieren:** Kommentar (Text, Likes, Plattform, ohne Nutzernamen), Umsetzung und Preis in `welt/gedaechtnis.json` → `entscheidungen` und in `welt/chronik.md`.

## Was in der Welt gilt (nur das Nötigste, alles andere bestimmen die Zuschauer)

- **Nachvollziehbar:** Menschen brauchen ein Dach, Essen, Wasser. Bauen braucht Hände, Material und Zeit. Wer mehr Einwohner hat, schafft mehr. Bei Bedarf echte Zusammenhänge recherchieren (z. B. wie viele Menschen ein Feld ernährt, wie lange ein Haus dauert) und als Schätzung erzählen.
- **Einwohner:** Mehr Follower = neue Menschen kommen per Boot auf die Insel (`neu=` lässt sie aufleuchten). Weniger Follower = einige fahren wieder weg (nie Tod).
- **Zeit:** Jede Folge ist ein Tag im Reich (Tag 1 = Folge 1), außer ein Vorschlag braucht sichtbar länger.
- **Dauerhafte Folgen:** Was gebaut ist, steht. Was verbraucht ist, ist weg. Platz auf der Insel ist begrenzt (`groesse` Felder × Felder): wächst das Reich, muss es Land gewinnen, aufs Meer, auf neue Inseln.
- **Gefahren ja, Gewalt nein:** Sturm, Flut, Feuer, Hunger, Streit, fremde Reiche (später) – ja. Kein Blut, keine Wunden, kein Tod durch Gewalt, keine Waffen gegen Menschen. Eroberung passiert durch Bauen, Handel, Überzeugen, Verträge, Wettbewerbe.
- **Keine echte Politik, keine echten Personen, keine Marken.** Echte Länder dürfen später als Ziel vorkommen (die ganze Welt), aber ohne echte Regierungen oder Personen.
- **Du bist der Gründer und Präsident** (#31, Du-Form). Die Einwohner sind *deine* Leute.

## Schwierigkeit

- **Folge 1–3 (leicht):** einzelne Felder bebauen, Haus, Feld, Brunnen, Weg. Jeder Vorschlag klappt sofort.
- **Ab Folge 4 (mittel):** Platz wird knapp, Projekte brauchen mehrere Tage oder eine Voraussetzung (Straße vor Hochhaus, Hafen vor Schiff). Das Wetter macht mal einen Strich durch die Rechnung.
- **Später (schwer):** Ein großes Projekt kostet etwas anderes (Wald weg, weniger Felder), Einwohner sind unzufrieden, andere Inseln oder Reiche tauchen auf, die man gewinnen muss.
- Schwierigkeit nur steigern, nie Vorschläge abwürgen: Das Reich soll sichtbar wachsen.

## Weltgedächtnis

- **`welt/gedaechtnis.json`**: Zustand des Reichs: Folge, Tag, Einwohner, Inselgröße, `bauten` (genau so, wie es die Kulisse `reich` braucht), Präsident-Feld, Entscheidungen, Regeln, die die Community beschlossen hat, offene Fäden.
- **`welt/chronik.md`**: kurz, was in jeder Folge passiert ist.
- **Vor jedem Drehbuch** beide Dateien und diese Bibel lesen und prüfen, ob die neue Folge dazu passt. **Nach jeder Folge** beide aktualisieren, committen, pushen.

## Format einer Folge

- **62–90 s** (#12), ca. 180–210 Wörter, 16–22 Einstellungen. TikTok, Instagram und YouTube je ein Post.
- **Kopf:** `@qualitaet max`, `@vortrag lebendig`, `@klang studio`, `@mund zitate`, `@einblenden aus`, `@look 0`, `@kino 0.35`, `@stil leuchtend`, `@palette tuerkis`, Untertitel an. In der Kulisse `reich` immer `palette_staerke=0.2` (die Insel behält ihre Farben).
- **Bauplan:** Hook mit „du/dein“ und dem Stand des Reichs → „Ihr habt entschieden: …“ (ab Folge 2) → Bau mit Hindernis und Preis → eine Wendung → die ganze Insel mit dem neuen Stand und der Einwohnerzahl → **Cliffhanger**: ein offenes Feld, ein Problem oder eine Chance, über die als Nächstes entschieden wird (als Aussage, nicht als Frage).
- **Mindestens 6 Einblendungen** (Einwohner, Tag, Kosten, neue Gebäude …), Kulisse `reich` am Anfang und am Ende, Zoom auf das, was gebaut wird (`nah=… blick=i,j`), Markierung des nächsten Felds (`markiere=i,j`).
- **Posten:** `python taeglich/veroeffentlichen.py welt-wNNN --zeit <Datum>T18:45` (Eintrag in `taeglich/verlauf.json` mit `"titel": "Deine Welt – Folge N: …"`, damit `welt/stand.py` die Kommentare findet). Post-Text: ein Satz zur Folge und „Jeder Follower ist ein Einwohner. Der Kommentar mit den meisten Likes wird gebaut.“

## Kulisse `reich` (engine/reich.js)

`[reich groesse=9 zeit=tag|abend|nacht bauten="haus@4,4|baum@1,2|weg@4,5-4,8" leute=140 neu=12 praesident=4,5 markiere=5,4 nah=1.6 blick=4,4 palette_staerke=0.2]`
- Bauten: `haus`, `hochhausN` (N Stockwerke), `baum`, `tanne`, `fels`, `brunnen`, `laterne`, `baustelle`, `boot`, `gericht` (Folge 2: Säulenbau mit Giebel, goldener Waage und Fahne), `zelt` (2 Zelte pro Feld, Einwohner ohne Dach), `laden` (kleiner Laden mit gestreifter Markise und Schild, Farbe wechselt), `werkstatt` (Folge 3: flache Halle mit halb offenem gelbem Rolltor, drehendem Zahnrad-Schild, Kisten und Schornstein), `laube` (Folge 4: kleine Gartenlaube/Holzhütte als Steigerung zum Zelt – Satteldach, Tür, Fenster mit Blumenkasten, Holzfarbe wechselt; je 4 feste Betten); Bodenbeläge `weg`, `strasse`, `feld`, `wasser`, `platz`, `sand`.
- Look (Jonathan 9.11.: „realistischer“): Miniatur-Optik mit Sonne von links oben, Schlagschatten, natürlicher Küste (`form=rund`, Standard), Klippen, flachem Wasser und Brandung, **immer gestochen scharf** (Jonathan 9.11.): keine Hintergrund-Unschärfe bei `reich` (ist im Engine-Code abgeschaltet), keine Tiefenunschärfe (`tiltshift=1` nur auf ausdrücklichen Wunsch). Neue Typen im selben Stil bauen: Licht- und Schattenseite, Kontaktschatten, Eintrag in `SCHATTEN`. Ein späterer Eintrag auf demselben Feld ersetzt den früheren.
- Neue Bauten, die die Community beschließt, kommen als neue Typen in `BAU` bzw. `BODEN` dazu (bestehende nicht verändern).
- Icons für Einblendungen: `einwohner`, `haus`, `kristall`, `aehre`, `axt`, `waage` (engine/welt.js) und alle aus `engine/objekte.js`.

## Erkenntnisse aus der Recherche (10.11., Bericht `reports/Kommentargesteuerte Kurzvideo Serien.md`)

Belegte Fälle (Twitch Plays Pokémon, r/place, The Button, Boaty McBoatface, Homestuck, Battle for Dream Island) und Plattformregeln, umgesetzt so:

1. **Ergebnis zuerst, Regel in den ersten 3 Sekunden.** Ab Folge 2 zeigt das erste Bild das Neugebaute, der Hook-Text trägt den Stand („TAG 3 · 152 EINWOHNER“), Satz 1 sagt, was gebaut wurde (mit „du/dein“). Die Regel „1 Follower = 1 Einwohner“ kommt in jeder Folge einmal kurz vor, als Tatsache der Welt, ~~nie als Aufforderung~~ (seit 12.11. erlaubt Jonathan den Aufruf am Ende, siehe „Ab Folge 3“).
2. **Neuheit trägt nur Tage.** Jede Folge braucht eine eigene Spannung (Problem, Wendung, Preis), die nicht davon abhängt, was gewählt wurde. Die Zuschauer entscheiden **was gebaut wird**, die Erzählung bleibt bei uns.
3. **Fortschritt sichtbar machen (Goal-Gradient):** Meilensteine nach Einwohnern: **200 = Dorf mit Namen, 500 = Stadt, 1.000 = Hafen und erstes Schiff, 2.500 = zweite Insel, 10.000 = Großstadt.** In jeder Folge „X von Y bis zum nächsten Meilenstein“ (Einblendung). Rückgänge nie als Strafe erzählen.
4. **Gebautes bleibt (IKEA-Effekt).** Nichts wird gelöscht. Katastrophen beschädigen höchstens, und das wird repariert.
5. **Mitmachen leicht machen:** Im Post-Text 2–3 konkrete Bauideen plus „oder etwas ganz anderes“ (Vorlage statt leeres Blatt). Keine Aufforderungen wie „Like den Kommentar, den du willst“, keine Codes („kommentiere 1 oder 2“).
6. **Fester Stichtag:** gezählt wird, was bis zum Start des täglichen Laufs (13:47) vorliegt, alle drei Plattformen zusammen, meiste Likes; bei Gleichstand mehr Antworten, dann der frühere. Den TikTok-„Top“-Kommentar nicht ungeprüft übernehmen, die Like-Zahlen zählen (`welt/stand.py`).
7. **Witz-Sieger** („Boaty McBoatface“) werden mit „Ja, aber …“ in die Welt übersetzt, nicht abgelehnt. Unzulässiges (Beleidigung, Gewalt, Sexuelles, Politik, echte Personen, Werbung) wird kommentarlos übersprungen.
8. **Kaltstart:** Bei 140 Followern sind sehr wenige Kommentare normal. Ersatzkette: passender Kommentar → wenn keiner: ein Ereignis der Welt (Sturm, Fremder am Strand, Fund) zwingt eine Entscheidung → die Einwohner entscheiden selbst. Keine erfundenen Kommentare, keine Fake-Konten.
9. ~~Keine Nutzernamen, keine Screenshots~~ – **überholt 12.11. (Jonathan):** Name + Kommentar als eigene Sprechblase im Bild (kein Screenshot, kein Profilbild, nur Anfangsbuchstabe). Kommentare mit Beleidigung, Sexuellem, Werbung oder persönlichen Daten (echter Name + Ort, Telefonnummer) nie zeigen.
10. **Jede Folge auch ohne Vorwissen verständlich:** Neue kommen über den Algorithmus, nicht über Folge 1.
11. **Sichtbare Abwechslung** (YouTube-Regel gegen massenproduzierte Inhalte): Tageszeit, Wetter, Kameraweg, Ereignisse von Folge zu Folge ändern.
12. **Offene Punkte für Jonathan:** Issue #8 (keine Fragen ans Publikum) gegen den Kern der Serie (Ausnahme festhalten?); Issue #15 (KI-Haken aus) gegen TikToks Kennzeichnungspflicht für KI-Inhalte (KI-Stimme unklar).

## Ab Folge 3 (Analyse Timi-Insel, 12.11., `welt/analyse-timi-insel.md`)

Ein Vergleichsvideo mit derselben Idee lief deutlich besser. Was wir übernehmen, ohne bestehende Regeln zu brechen (gilt vor „Format einer Folge“, wo es sich widerspricht):

1. **Mehrere Kommentare bauen.** Der Top-Kommentar ist der Hauptbau („Ihr habt entschieden: …“). Dazu bis zu 4 weitere umsetzbare Kommentare (in Like-Reihenfolge, gleiche Prüfung wie oben) als kleine Bauten im Schnelldurchlauf, je eine Einstellung von ca. 3 s mit Preis-Einblendung. Ist einer zu groß, wird der erste Schritt gebaut („Für das Raketensilo braucht ihr erst eine Werkstatt“). In Gedächtnis und Chronik alle festhalten.
2. **Tempo.** Alle 3–4 s ein neuer Bau oder eine neue Zahl. Weniger erklärende Sätze, die Kamera springt von Bau zu Bau (`nah=… blick=…`). Eine Wendung und der Cliffhanger bleiben, aber kürzer.
3. **Spielstand in jeder Folge** (als `ein=`-Einblendungen, keine Leiste oben, Issue #19): Einwohner, Tag, Betten/Dächer und **„X schlafen im Zelt“** (Zeltfeld mit `zelt` zeigen), Kosten jedes Baus (Tage, Hände, Material, Felder).
4. **Hook = Wachstum:** „Gestern X, heute Y Einwohner“ mit hochzählender Zahl (`#`), gleich danach das Neugebaute.
5. **Modern und nahbar:** Die Insel darf schnell zu einem modernen Ort werden (Läden, Imbiss, Werkstatt, Tierheim, Arztpraxis, Hochhäuser, Straßen), sobald es nachvollziehbar ist. Keine Marken: „Modeladen“ statt Markenname.
6. **Offene Rollen als Aussage:** „Der Laden sucht noch einen Bäcker.“ „Das Tierheim braucht noch drei Helfer.“ Nie als Frage, nie als Aufforderung.
7. **Witz der Hauptfigur:** Du darfst eigene Wünsche haben, über die die Einwohner entscheiden („Und was ist mit dir? Das entscheiden deine Einwohner.“).


### Jonathans Entscheidungen vom 12.11. (gelten ab Folge 3, gehen allem anderen in dieser Bibel vor)

8. **Name + Kommentar im Bild (wie im Vergleichsvideo).** Jeder umgesetzte Kommentar erscheint als Sprechblase (`kommentar="@nutzer|Text wörtlich|Likes"`, Text wie geschrieben, nur offensichtliche Tippfehler nicht korrigieren), und das Gebäude bekommt ein Namensschild (`schild="i,j:Laden · @nutzer"`). Der Hauptbau sagt dazu „Ihr habt entschieden“ bzw. „Der Kommentar mit den meisten Likes kam von …“. Kommentierende werden zu Einwohnern mit Rolle (Richter, Ladenbesitzerin, Bäcker …) und können in späteren Folgen wieder vorkommen (in `gedaechtnis.json` → `bewohner` notieren). Namen aus `python welt/stand.py` (TikTok-Nutzername, bei YouTube der Anzeigename). Gesprochen wird der Name nur, wenn er gut aussprechbar ist, sonst „sie“/„er“/„dieser Einwohner“.
9. **Aufruf am Ende erlaubt** (Ausnahme von Issue #8 nur für diese Serie): letzte Einstellung z. B. „Jeder neue Follower zieht auf deine Insel. Was bauen wir als Nächstes? Schreib es in die Kommentare.“ Der Cliffhanger bleibt davor. Nie „Fortsetzung folgt“.
10. **Spielstand-Leiste oben mit Kasse** (Ausnahme von Issue #19 nur für diese Serie): in jeder `reich`- und `gesicht`-Einstellung `spielstand="kasse=…|einwohner=…|tag=…|betten=…/…|zelt=…"`; bei einem Bau `kasse=alt>neu` (zählt sichtbar herunter) plus `preis="i,j:-20.000 €"` über dem Gebäude. `ein_y` nicht über 470 setzen (Leiste endet bei ca. 320). Kommentar-Sprechblase standardmäßig bei y 1100 (über den Untertiteln).

**Kasse (Regel der Welt):** Jeder neue Einwohner bringt 1.000 €, jeder Like unter der letzten Folge 100 €, jeder Kommentar 500 € (alle Plattformen, Zahlen aus `posten/analyse.json`). Gebaute Dinge kosten (Richtwerte): Zelt 500 €, Laden/Imbiss 20.000 €, Haus mit 4 Betten 40.000 €, Werkstatt 30.000 €, Straße pro Feld 5.000 €, Brunnen 8.000 €, Feld 3.000 €, Hochhaus pro Stockwerk 60.000 € (je 12 Betten), Hotel 250.000 €, Hafen 1.000.000 €. Reicht das Geld nicht, wird gespart oder ein kleinerer erster Schritt gebaut. Stand in `gedaechtnis.json` → `kasse`, Rechnung in `entscheidungen`.
