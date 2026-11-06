# Vorgaben für die nächste Staffel (Analyse vom 6.11.2026, 21:45)

Aus `taeglich/analyse/2026-11-06.md`. Gilt für **s04 Krimi/Rätsel**, die heute Nacht entsteht (`vorrat.py`: TikTok-Vorrat 0,9 Tage → PRODUZIEREN). Format laut Rotation: **12 Folgen à 80–90 s, 5 TikTok-Sammelteile**, Untertitel an (E4: gerade Staffel).

Erste Zahlen aus den Kurzvideo-Staffeln, je 1–2 Posts, also **Tendenzen**. Feste Regeln gehen vor: über 1 Minute (#12), keine Fragen ans Publikum (#8, auch kein „Wer war es? Schreib es in die Kommentare“), nie „Fortsetzung folgt“ (#11), nie „Echter Fakt“ (#2), Stil „leuchtend“ (#17), Qualität (#20), kein `@hud` (#19), Stimme ohne starkes Nachpitchen (#25), englische Fassung (#21), Testphase-Vielfalt (#22).

**Kernbefund:** s02-f01 („Stell dir vor, du hast gerade dreißig Millionen gewonnen. Und niemand darf es wissen.“) ist mit 47,4 Aufrufen/h und Ø 29,9 s (41 % der Länge) das stärkste Instagram-Reel pro Stunde, das der Kanal je hatte. Auf TikTok wird ihre Kurve nach 10 s flach (12 s: 20 %, 30 s: 19 %), aber 70 % sind nach 4 s weg. **Der Kampf wird in den ersten 4 Sekunden entschieden.**

## Mehr davon

1. **Erster Satz: kühne, konkrete Lage mit einer Zahl oder Uhrzeit, höchstens ca. 12 Wörter, sofort verständlich** (Muster s02-f01 und Ausreißer „2 Uhr nachts. Ein Zug hält mitten im Wald.“). Zweiter Satz: der Haken für dich („Und niemand darf es wissen.“). Wird der Staffelplan „Die zwölfte Quittung“ genommen: Die Grundregel („Im Fundhaus hat jede Ausgabe zwei Quittungen“) kommt **erst in Satz 2 oder 3**; Satz 1 ist z. B. „Aus dem Fundhaus verschwinden 4.000 Euro. Auf der Quittung steht der Name deines besten Freundes.“ Gilt auch für die erste Folge jedes TikTok-Sammelteils.
2. **Sekunde 0–4: Bewegung + Gesicht mit Gefühl + großes Objekt.** Einstellung 1 mit `zoom-rein` und einer Figur in starker Mimik, dazu der Gegenstand des Falls groß im Bild (`gross=`/`objekt`). Bis Sekunde 10 mindestens 3 Bildwechsel (s02-f01: Kiosk → Lottoschein → Gesicht → Handy in 10 s).
3. **Hook-Text bleibt in allen Folgen** (kurz, Großbuchstaben, die Zahl darin: „4.000 EURO WEG“). E1/E2 noch offen, aber beide bisher besten Posts haben ihn.
4. **Ein einziger Fall, Rhythmus „kleine Antwort + neue Frage“**, Hinweise fair im Bild, bevor die Stimme sie erklärt; Auflösung, die man rückblickend hätte sehen können (bleibt aus 5.11.).
5. **Warme Momente zwischen Spannung:** s02-f01 (Opa, Geburtstag) und video-001 (Lebenszeit) laufen beide stark. Pro Staffel mindestens 2 Folgen mit Familie oder Freundschaft als Herz (#10), eine ruhige Szene über Zeit, die man miteinander hat.

## Weniger davon

6. **Kein Einstieg mit Vorwissen** (kein „er“, „sie“, „die Tür“ ohne Erklärung, kein Rückblick, keine Titelkarte, kein Serienname). Späte Sammelteile der alten Serien verlieren 75–80 % in 12 s.
7. **Keine abstrakten oder langen ersten Sätze** (Regelsätze über 15 Wörter, Gedankenstrich-Konstruktionen). Kein Mitrate-Aufruf (#8); die Figur darf sich selbst fragen.
8. **Keine Welt aus s01–s03 als Hauptort** (Großstadt bei Nacht, Kiosk/Heimatstadt, Wald/Hütte), keine Nebenhandlung, keine Faktenkarte.

## Genau 1 Experiment

9. **E5 – Ende zuerst als Hook (unverändert):** Ungerade Folgen beginnen mit dem Ende dieser Folge („In 80 Sekunden stehst du vor der Polizei. Und du hast nichts getan.“), dann Rücksprung. Gerade Folgen beginnen direkt mit der Lage (Punkt 1). Beide Varianten halten Punkt 1 ein (Zahl/Uhrzeit, ≤ 12 Wörter), sonst gleich gebaut, ±5 s. In `staffeln.json` unter `analyse` vermerken. **Messen:** Instagram/YouTube je Folge Ø Wiedergabe und Abbruch (6 gegen 6), TikTok Bindung nach 2 s/4 s/12 s je Sammelteil nach Art der ersten Folge.

## Themenvorschläge (einen wählen; Empfehlung: 10)

Noch nicht getestet und deshalb bevorzugt: **Welt** Fundhaus/Amt, Museum bei Nacht, Zug quer durch Europa (alle neu); **Genre** Krimi/Rätsel; **Erzählform** „ein Rätsel, das jede Folge ein Stück löst“ bzw. „an einem Nachmittag“ (neu; s03 war eine Nacht in Echtzeit); **Hook-Art** „Ende zuerst“ und „Zahl über dein Leben“ (neu; s03 Regel/Warnung); **Figuren-Fokus** bester Freund unter Verdacht, Vater, oder Oma (Oma noch nie). 1–2 neue Kulissen, mindestens eine im Stil „leuchtend“.

10. **„Die zwölfte Quittung“** (empfohlen, steht fertig in `staffelplan-s04-s12.md`): Fundhaus, bester Freund unter Verdacht, Vater als Hausmeister, Auflösung mit Wendung und warmem Ende (Stoffvogel). Nur die Hooks nach Punkt 1 umbauen: Lage + Zahl zuerst, die Quittungsregel danach. Neue Kulissen: Fundhaus-Ausgaberaum (senfgelb, nummerierte Fächer) und Papierarchiv (blau).
11. **„Das falsche Bild“:** „Um 23:10 Uhr verschwindet aus dem Stadtmuseum ein Bild. Und die Kamera zeigt nur dich.“ Schulpraktikum im Museum, Oma hat dort 40 Jahre restauriert, die Uhr im gefälschten Bild zeigt eine andere Zeit. Neue Kulisse `museum` (Halle mit Gemälden, Mondlicht durch Glaskuppel). Figuren-Fokus Oma (neu).
12. **„Was wäre wenn“, 1–3 min (Jonathans Wunsch 2.11.):** „Ab morgen früh piept jedes Handy, sobald in seiner Nähe jemand lügt.“ Tag 1 in der Schule, am Esstisch, bei der Polizei, Schritt für Schritt schlimmer, bis dein eigenes Handy piept, als du Mama sagst, dass alles gut ist. Aussage-Hook, keine Frage ans Publikum (#8). Genre Psychologie über dich → passt als s06 oder Einzelvideo.
