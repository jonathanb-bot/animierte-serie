# Konzepte „Stadtverteidigung“ (Entwurf 24.11., wartet auf Jonathans Entscheidung)

Jonathan 24.11. abends: Intro „Du bist Teil dieser Stadt – schreib deine Stadt in die Kommentare“, eine Riesenmonster greift an,
die Zuschauer kommentieren eine Waffe/Abwehr, der Kommentar mit den meisten Likes gewinnt. Alternative: Tower-Defense mit Dorf,
jede Waffe bleibt, das Monster wird jede Welle stärker und hat eine geheime Spezialfähigkeit.

---

## Plan A: „Verteidige deine Stadt“ (jede Folge eigenständig)

**Grundidee:** Jede Folge greift ein neues Riesenmonster eine Stadt aus den Kommentaren an. Die meistgelikte Waffe aus der letzten Folge
wird eingesetzt. Klappt sie, ist die Stadt gerettet; klappt sie nicht (Monster hat eine Schwäche/Stärke), fällt die Stadt – und die nächste
Folge braucht eine bessere Idee.

**Ablauf einer Folge (60–75 s):**
1. **Intro (5 s, immer gleich, wiedererkennbar):** Ortsschild + „Du bist Teil dieser Stadt. Schreib deine Stadt in die Kommentare.“
2. **Stadt des Tages (8 s):** Ortsschild „Willkommen in Köln“, Bürger, eine Besonderheit (Dom, Hafen, Berge … aus einer Tabelle).
3. **Monster kommt (12 s):** Boden bebt, Riesenmonster taucht auf (eigene Wesen aus der Bibliothek, jede Folge ein anderes oder dasselbe stärker).
4. **Die Waffe der Zuschauer (20 s):** „Ihr habt gewählt: Trampolin-Katapult.“ Aufbau, Einsatz, Wirkung mit Lebensbalken des Monsters.
5. **Ergebnis (10 s):** gerettet → Jubel, Konfetti; nicht gerettet → Monster lacht, Stadt dunkel.
6. **Aufruf (8 s):** „Morgen greift es [nächste Stadt] an. Welche Waffe soll ich bauen? Die meisten Likes gewinnen.“

**Kommentar-Mechanik:** Zwei Dinge werden kommentiert – Stadt **und** Waffe. Stadt = meistgenannte Stadt (oder Losverfahren unter den Nennungen),
Waffe = Kommentar mit den meisten Likes, der eine machbare Waffe enthält. „Ihr habt gewählt“ nur, wenn es wirklich gültige Stimmen gibt (wie Blockstadt).

**Vorteil:** jede Folge ist für neue Zuschauer verständlich, Städte ziehen Kommentare. **Nachteil:** keine wachsende Spannung über die Folgen.

---

## Plan B: „Dorf-Defense“ (Tower-Defense über viele Folgen) – meine Empfehlung

**Grundidee:** Ein Dorf (unser Buntdorf) wird jede Folge von einer **Welle** angegriffen. Jede Folge kommt **eine neue Waffe** aus den Kommentaren dazu
und **bleibt für immer**. Das Monster wird mit jeder Welle stärker und hat eine **geheime Spezialfähigkeit**, die erst im Kampf sichtbar wird
(z. B. „immun gegen Feuer“, „wird von Wasser größer“, „unsichtbar im Dunkeln“, „heilt sich durch Lärm“). Die Zuschauer müssen raten und
die richtige Waffe vorschlagen. Rekord: „Wie viele Wellen schafft das Dorf?“

**Ablauf einer Folge (60–75 s):**
1. **Hook (4 s):** „Welle 7. Das Dorf hat 6 Waffen. Schafft es diese Welle?“ – Wellen-Zähler oben, Dorf-Lebensbalken.
2. **Neue Waffe (15 s):** „Eure Waffe von gestern: Wasserwerfer (die meisten Likes).“ Sie wird gebaut und ins Dorf gestellt (Bauen = Dopamin).
3. **Angriff (30 s):** Monster/Schwarm kommt. Alle Waffen feuern nacheinander, Schaden als Zahlen über dem Monster, Lebensbalken sinkt.
   **Die Spezialfähigkeit zeigt sich:** „0 Schaden!“ bei einer Waffenart – Schreck-Moment.
4. **Ausgang (10 s):** Welle geschafft (Monster fällt, Konfetti) **oder** Dorf verliert Leben/Häuser (Haus brennt nicht, sondern wird grau/umgekippt – keine Gewalt gegen Menschen).
5. **Aufruf (8 s):** „Die nächste Welle ist doppelt so stark. Was hilft gegen [Hinweis auf die Fähigkeit]? Schreib eine Waffe – die meisten Likes kommen ins Dorf.“

**Regeln für Waffen („realistisch“):**
- Erlaubt: alles, was es wirklich gibt oder geben könnte – Wasserwerfer, Netz, Trampolin, Laserpointer, Riesenventilator, Feuerwehr, Mauer,
  Stacheldraht, Kanone, Magnet, Scheinwerfer, Kühlschrank-Falle, Blitzableiter, Polizei, Hunde …
- Nicht erlaubt: Unendlich-Waffen, „Monster stirbt einfach“, Atombombe, echte Menschen/Namen als Waffe. Dann nehme ich den nächsten Kommentar.
- Jede Waffe hat eine **Art** (Wasser, Feuer, Strom, Wucht, Licht, Lärm, Kälte, Fangen) und einen festen Schadenswert → das Spiel ist fair und nachvollziehbar.

**Geheime Spezialfähigkeiten (Beispiele, eine pro Monster):**
| Monster | Fähigkeit (geheim) | Hinweis im Video | Konter |
|---|---|---|---|
| Glut-Golem | immun gegen Feuer, Wasser macht doppelt Schaden | dampft im Regen | Wasser, Kälte |
| Schatten-Riese | nur im Licht verwundbar | weicht Laternen aus | Licht, Scheinwerfer |
| Panzer-Käfer | immun gegen Wucht | Kanonenkugeln prallen ab | Strom, Kälte |
| Echo-Wurm | heilt sich durch Lärm | wächst bei Sirenen | Stille, Fangen |
| Spiegel-Wesen | wirft Laser/Licht zurück | glänzt | Wucht, Netz |
Stärke steigt pro Welle (Lebenspunkte ×1,5); alle 5 Wellen ein neues Monster mit neuer Fähigkeit.

**Was es spannend macht:** wachsendes Dorf (Besitz-Gefühl der Kommentierenden: „meine Waffe steht da“), Rätsel um die Fähigkeit,
Rekord-Zähler, Niederlage ist möglich (dann Neustart „Saison 2“).

**Fairness/Ehrlichkeit:** Die Kampf-Rechnung steht in einer Datei (`defense/stand.json`) und wird nach festen Regeln berechnet – kein Zurechtbiegen.
Wenn es keine gültigen Kommentare gibt, kommt eine Waffe aus einer Reserve-Liste, und das Video sagt nicht „ihr habt gewählt“.

---

## Produktion (beide Pläne, gut machbar)

- **Eine feste Szene** (`defense/szene.js`) liest `defense/stand.json` (Waffen, Positionen, Monster, Welle, Fähigkeit, Ergebnis). Pro Folge wird nur die Datei aktualisiert.
- **Waffen-Baukasten:** 25–30 Waffen einmalig in die Bibliothek bauen (je 1 Objekt + 1 Schuss-Effekt: Wasserstrahl, Flammen, Blitz, Netz, Lichtkegel, Schallwellen, Eis). Neuer Kommentar → passende Waffe aus der Tabelle (Stichworte), unbekannte Wünsche → neue Waffe bauen (dann wächst die Bibliothek).
- **Monster:** 4–6 eigene Riesen-Wesen (vorhanden: `riesenTier`, `riesenWaechter`, Schatten; neu: Golem, Käfer, Wurm).
- **Skript `defense/folge.py`:** Kommentare holen (`stimmen.py`), Waffe/Stadt auswählen, Kampf nach Regeln berechnen, Zeilen schreiben (Vorlage mit Lücken, 14–18 Zeilen), `stand.json` aktualisieren.
- **Pro Folge:** Stimme (1–2 Anfragen, unverändert nach #41), Standbilder nur der neuen Waffe, Rendern (~1,5 h), Entflackern, Kodieren. Arbeit ca. 1 h.
- **Marken erlaubt (#42):** z. B. echte Feuerwehr-Logos, Stadtwappen, Markenprodukte als Waffe („Red-Bull-Rakete“).

## Offene Fragen an Jonathan
1. Plan A (jede Folge neue Stadt) oder Plan B (ein Dorf, Waffen bleiben, Wellen)? Oder B mit Städten: jede Saison verteidigt die meistgenannte Stadt.
2. Eigene Serie neben Blockstadt oder statt einer Blockstadt-Folge?
3. Stimme: Puck (Kind, wie Blockstadt) oder eine erwachsene Erzählstimme wie bei Spiele-Videos?
