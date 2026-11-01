# Vorgaben für die nächste Staffel (Analyse vom 1.11.2026, 21:39)

Aus `taeglich/analyse/2026-11-01.md`. Wenig Daten (41 Posts), also **Tendenzen**. Feste Regeln gehen vor: über 1 Minute (#12), keine Fragen ans Publikum (#8), nie „Fortsetzung folgt“ (#11), Kurzgesagt-Stil, hinten anhängen.

**Kernbefund:** 86–96 % der TikTok-Zuschauer kommen über „Für dich“, 76–79 % sind neu, im Schnitt wird ca. 30 s geschaut. Auf Instagram und YouTube floppen die Videos, die mit Titel oder Rückblick anfangen oder mit Check bzw. Endkarte aufhören. Die Mittelteile, die direkt in der Handlung starten, holen fünf- bis zehnmal so viel. **Jede Folge muss für Fremde in der ersten Sekunde funktionieren.**

## Mehr davon

1. **Erster Satz = ein in sich verständliches Rätsel mit Gefahr oder Verlust, ohne Vorwissen.** Vorbild ist „Du bist allein zu Hause. Aber im Bad summt etwas.“ („Der Alien“, 73 % nach 3 s, Median 58 %). Das gilt für **jede** Folge, auch Folge 2–10: kein Name und keine Vorgeschichte im ersten Satz.
2. **Mitten in der Handlung starten**, wie die starken Mittelteile: Die erste Einstellung zeigt schon den Konflikt, danach wechselt das Bild alle 2–4 s.
3. **Familie oder Freunde in Gefahr direkt im Hook.** Das verbindet Jonathans Familien-Thema mit Spannung. In der Nische läuft das gerade am besten: „DEIN OPA SCHAFFT DIE LEITER NICHT HOCH“, 66-Facher Median.
4. **Genre: Überleben oder Mysterium in Du-Form.** Damit hatten wir die besten eigenen Zahlen („Der Alien“, „24. Stock“), und die deutsche Nische wächst damit.
5. **Die stärksten 30 Sekunden nach vorn.** Die Wendung jeder Folge kommt spätestens bei Sekunde 30–40, nicht erst am Ende. Danach baut sich bis zum Cliffhanger neue Spannung auf.

## Weniger davon

6. **Am Anfang keine Titelkarte, kein Serienname, kein „Folge X“ und kein Rückblick, auch nicht in Folge 1.** Das ersetzt für diese Staffel die Titelkarte aus FORMAT.md. Staffel- und Folgentitel stehen nur im Posttext.
7. **Keine ruhigen Erklär-Einstiege.** „Stell dir vor …“ geht nur, wenn derselbe Satz schon den Konflikt enthält.
8. **Der Instagram- und YouTube-Text schickt nicht mehr zu TikTok.** Stattdessen etwa: „Folge N+1 kommt als Nächstes. Folg @sto.rys4you, damit du sie nicht verpasst.“ (keine Frage). Dafür die Texte in `taeglich/staffel_veroeffentlichen.py` anpassen. Grund: 19.000 Instagram-Aufrufe, aber nur 4 Follower.

## Genau 1 Experiment

9. **Hook-Text in Großbuchstaben in den ersten 2,5 s jeder Folge** (höchstens 6–7 Wörter, zum Beispiel „DEINE SCHWESTER IST NICHT NACH HAUSE GEKOMMEN“), wie bei allen Ausreißern der Nische. Umsetzung: neue Angabe `hooktext="…"` in der ersten Einstellung. In `engine/kurzgesagt.js` in `A.nachbearbeitung` nur zeichnen, wenn sie gesetzt ist: oben bei y≈300, weiß mit weichem Schatten, Pop-in, nach 2,5 s ausblenden, nie über den Untertiteln. Danach Standbild prüfen und die alten Serien pixelgleich prüfen. **Messen:** Hook 3 s auf TikTok (bisher Median 58 %) und Faktor der Folgen auf Instagram und YouTube.

## Themenvorschläge (einen wählen)

10. **„Funkstille“:** „Seit heute Nacht ist das Internet weg. Und deine Schwester ist nicht nach Hause gekommen.“ Zehn Tage Stadt ohne Netz, die Familie hält zusammen. Kulissen: grossstadt, haltestelle, netz, esstisch, landschaft. Hauptstimmung spannend/düster, dazwischen warme Familienfolgen.
11. **„Der Komet“:** „In 30 Tagen schlägt er ein. Und dein Opa will sein Haus nicht verlassen.“ Kulissen: weltall, landschaft, wohnzimmer, see. Hauptstimmung traurig/warm mit freudigen Momenten.
12. **„Das Licht im Wald“:** „Deine Familie flieht zu Opas altem Haus am Waldrand. In der ersten Nacht leuchtet etwas zwischen den Bäumen.“ Kulissen: wald, landschaft, see, grossstadt. Hauptstimmung Mysterium/spannend.
