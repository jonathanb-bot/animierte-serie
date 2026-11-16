# DER LETZTE RAUB – Ihr entscheidet · Serienbibel

> Auftrag von Jonathan vom 16.11.2026: eine animierte Mitmachserie über einen Banküberfall für storys4you. Diese Datei ist verbindlich.
> **Produktionsstand 16.11.:** Folge 1 ist fertig geschrieben, mit Orus vertont, und die Bilder sind gebaut (`taeglich/episoden/raub-r001.txt`).
> Folgen 2–10 entstehen erst, wenn die jeweilige Abstimmung feststeht. Ablauf: `taeglich/laeufe/raub.md`.

## Feste Regeln
- **10 Folgen**, jede 62–89 s lang (Auftrag: ca. 80–100 s, aber über 89 s würde der Post auf Instagram und YouTube geteilt, Issue #4), immer über 1 Minute. Deutsch, durchgehend Du-Form, die Hauptfigur ist erwachsen (24).
- **Eine Erzählerstimme:** Gemini „Orus“ (`--stimme gemini:Orus`), `@vortrag lebendig`, `@klang studio`, normale volle Lautstärke, nie flüstern (Regel 7.11.), keine Effekte auf der Stimme.
- **Höchstens 2 sehr kurze wörtliche Sätze pro Folge**, gesprochen von Orus (in „…“, Mund der Figur bewegt sich mit `@mund zitate`).
- **Erstes Bild:** sofort ein starkes Bild und ein spannender Satz, kein Schwarz, kein Logo, `hooktext` mit Stand.
- Jede Folge hat **ein konkretes Ziel, eine neue Entwicklung und eine spürbare Folge**.
- **Folgen 1–9 enden an einem echten Entscheidungspunkt** (Kulisse `entscheidung`, A und B). Folge 10 zeigt das Ende, das aus den Entscheidungen entstanden ist.
- Genau eine Mitmachaufforderung: „Kommentiere A oder B. Der Top-Kommentar entscheidet.“ (Ausnahme von Issue #8 nur für diese Serie, wie bei „Deine Welt“.) Nie „Fortsetzung folgt“ (#11), nie „Was würdest du tun?“.
- Ab Folge 2 beginnt jede Folge mit „Ihr habt A/B gewählt.“ (Hook-Text), danach zeigt sich sofort eine Folge davon.
- **Fiktiver Filmthriller:** Gezeigt werden Figuren, Konflikte und Entscheidungen. Es gibt keine realen Verfahren zum Überwinden von Sicherheitsanlagen, keine Fluchttaktik und keine Waffen im Bild. Angst und Druck zeigen sich über Gesichter, Licht, Alarm und Körperhaltung. Verletzungen höchstens angedeutet, kein Blut.
- Stil „leuchtend“ (`@stil leuchtend`, `@look 0`, `@kino 0.35`, `@qualitaet max`, 1440×2560, 60 fps), keine Statusanzeige.
- Fertige Videos bleiben, wie sie sind. Eine verworfene Möglichkeit taucht später nicht heimlich als Tatsache auf.

## Die Grundgeschichte
Du bist 24. Deine Schwester **Lea** sitzt seit elf Monaten wegen eines Finanzbetrugs im Gefängnis, den sie nicht begangen hat. Sie arbeitete für die **AUREON-Bank**, entdeckte verdächtige Geschäfte und wurde selbst zur Schuldigen gemacht.
**Mara**, Leas frühere Kollegin, bringt dir einen Auszug aus der internen Akte **ATLAS**: 3 von 41 Seiten, Hoffnung, aber kein Beweis. Das Original liegt im Tresor, und dort liegen bis Freitag auch **acht Millionen Euro**.
Du stellst eine Gruppe zusammen (Mara, Jona, Karo). **Direktor Voss** weiß von dem Plan. Er will ihn nutzen, um Geld verschwinden zu lassen und ATLAS endgültig zu vernichten: Der Überfall soll die Erklärung für beides liefern.

## Figuren (verbindliche Referenz, Werte in `taeglich/figuren.json`)
| Figur | Kennung | Wesen | Aussehen (fest) |
|---|---|---|---|
| **Du** | `r_du` | mutig, loyal zu Lea, unter Druck. Ehrlichkeit, Eigennutz, Verantwortung entstehen durch die Abstimmungen | dunkelblaue Jacke `#1f3358` mit schmalem orangefarbenem Streifen `#f08a3a` (rechte Schulter + Saum), kurze dunkle Haare. **Gesicht nie ganz:** immer `hinten=r_du` (von hinten), Hände, Schulter, Silhouette |
| **Mara** | `mara` | klug, kontrolliert, Schuldgefühle gegenüber Lea, weiß mehr, als sie sagt, ist aber nicht automatisch die Verräterin | kurzer dunkler Bob, türkisfarbene Jacke `#2aa3a6`, eckige Brille |
| **Jona** | `jona` | dein ältester Freund, locker, schlagfertig, braucht dringend Geld. Voss hat ihm heimlich ein Angebot gemacht | rostrote Jacke `#b5502e`, dunkle Locken |
| **Karo** | `karo` | organisiert die gemeinsame Abreise, direkt, unabhängig. Bedingung: **Niemand wird zurückgelassen** | gelbe Jacke `#e8b82e`, geflochtener Zopf über der Schulter |
| **Direktor Voss** | `voss` | ruhig, höflich, gefährlich, lässt andere glauben, sie hätten die Kontrolle | heller Anzug `#e4ded2`, silbernes Haar, kleine goldene Anstecknadel `#e8b83a` |
| **Lea** | `lea` | keine bloße Gerettete: hat selbst Hinweise hinterlassen, bekommt im Finale eine eigene Haltung zu dem, was du getan hast | lange dunkle Haare, graublaue Jacke. Zu Beginn nur auf ihrem Foto |
| Journalistin | (ab Folge 3) | hat früher über Leas Fall berichtet | wird in Folge 3 neu angelegt (Name, Aussehen hier nachtragen) |

## Leitmotive (Bedeutung ändert sich)
| Motiv | Kulisse | Bedeutung am Anfang | mögliche Entwicklung |
|---|---|---|---|
| **Leas Foto** | `raubdetail motiv=foto` | der Grund für alles | Leas Hinweis auf der Rückseite (ab Folge 3 möglich), Schlussbild Folge 10 |
| **roter ATLAS-Koffer** | `raubdetail motiv=koffer` | Ziel im Tresor (Folge 6) | Beweis, Pfand, Verlust, je nach Wahl in 6/7 |
| **Voss' goldene Anstecknadel** | `raubdetail motiv=nadel` | Folge 1: der wartende Mann in der Bank | Erkennungszeichen auf dem Foto im Umschlag (Folge 2), Voss' Kontrolle |
| **leere Tasche** | `raubdetail motiv=tasche` | Folge 1: alles ist noch möglich | gefüllt mit Geld oder bewusst leer, Schlussbild |

## Geheimnisse (Wahrheit hinter der Geschichte)
- **Voss** kennt den Plan von Anfang an (Hinweise: Folge 1 wartet er in der leeren Bank, Folge 2 das Foto aus seiner Perspektive, Folge 3 der Termin „morgen Abend“ kommt von ihm, Folge 4 er ist nicht überrascht).
- **Jona** hat ein Angebot von Voss (Geld gegen Infos). Ob er es angenommen hat, ist noch offen und hängt von deinem Umgang mit ihm ab (Folgen 2, 5, 7, 8).
- **Mara** hat Lea damals nicht geholfen, weil sie selbst unter Druck gesetzt wurde. Sie besitzt den ATLAS-Auszug, weil Lea ihn ihr zugespielt hat.
- **Lea** hat vor ihrer Verhaftung Hinweise versteckt (z. B. auf der Rückseite des Fotos, Seitenzahl im Auszug), die zeigen, dass sie die Geschäfte melden wollte.

## Schauplätze (räumlich fest)
| Ort | Kulisse | Merkmale | Palette |
|---|---|---|---|
| AUREON-Bank außen | `bankfassade` | drei hohe goldene Bögen, türkisfarbenes Glas, Schriftzug AUREON, nasse Straße mit Spiegelung, Laternen links/rechts | `blau` |
| Schalterhalle | `bankhalle` | drei goldene Bogenreihen in die Tiefe, dunkler Steinboden mit Spiegelung, zwei goldene Schalter links/rechts, zwei Hängelampen | `tuerkis`, Alarm `alarm=1` (korallrot) |
| Vorbereitungsraum | `versteck` | Ziegelwand, Pinnwand links mit roten Fäden, Fenster rechts mit Regen und fernem Goldlicht der Bank, Hängelampe, Holztisch | `orange` |
| Nahaufnahmen | `raubdetail` | Holztisch im Lampenlicht | `orange`/`blau` |
| Entscheidung | `entscheidung` | dunkelblau, A türkis, B gold | `blau` |
| noch zu bauen | – | kühler Archivbereich (Folge 3/6), monumentaler Tresorraum (Folge 6), regennasse Straßen mit Blaulicht (Folge 8), stilles Flussufer im Morgengrauen (Folge 9/10) | `blau`, `tuerkis` |

Farben: Dunkelblau `#0b1530` und Türkis `#3fc4c8` als Grund, Gold `#e8b84a` für Bank und Geld, Korallrot `#ff6a5a` für Gefahr.

## Zuschauerentscheidungen
- Gezählt werden die Kommentare unter der jeweiligen Folge auf allen Plattformen (`posten/kommentare.json`, Workflow „Posts einplanen“ mit `kommentare=true`), Auswertung mit `python raub/stimmen.py <N>`.
- **Top-Kommentar:** Der gültige Kommentar mit den meisten Likes zum Auswertungszeitpunkt (Lauf am Folgetag, 16:47) entscheidet. Gültig ist er, wenn er klar A oder B wählt oder eine plausible eigene Idee enthält, die keine festen Ereignisse aufhebt. Bei Gleichstand: mehr Kommentare für diese Option, danach der frühere Kommentar. Gibt es gar keinen gültigen Kommentar, zählt die Mehrheit aller A/B-Nennungen. Gibt es auch keine, gilt **keine Entscheidung**: Die Folge erzählt, dass du zögerst, und Voss nutzt die Zeit. Das wird nie als Zuschauerwahl ausgegeben.
- Keine erfundenen Ergebnisse: Das Ergebnis steht mit Kommentar-ID, Nutzer und Likes in `raub/gedaechtnis.json`.
- Beleidigendes, Politik, Werbung zählt nicht (`gesperrt`).

## Weltgedächtnis
`raub/gedaechtnis.json`: Wer weiß was, wer vertraut wem, wer besitzt welche Gegenstände und Beweise, Verletzungen und Verluste, was öffentlich ist, Versprechen (gegeben/gebrochen), Entscheidungen mit Quelle. Nach jeder Folge aktualisieren, vor jeder Folge lesen.
