# Geplante Läufe (jeder Lauf in einem neuen Chat)

Jonathans Vorgabe vom 1.11.2026: **Jeder Lauf bekommt einen neuen Chat**, damit sich kein langer Verlauf aufstaut und Credits verbraucht.

So funktioniert es:

1. Vier geplante Aufgaben wecken eine kleine **Starter-Session**: „Analyse vor der Staffel“ täglich um 21:39, „Kurzvideo-Staffel“ täglich um 23:44 und „Zitat-Video“ täglich um 08:47 und „Abend-Kontrolle“ täglich um 20:13 (Europe/Berlin).
2. Die Starter-Session macht nur eins: Sie legt mit `create_session` eine **neue Session** an, mit Repo `jonathanb-bot/animierte-serie`, Branch `taeglich` und Modell Opus. Die neue Session bekommt den kurzen Auftrag „Lies `taeglich/laeufe/<lauf>.md` und führe es aus“. Danach ist die Starter-Session fertig.
3. Die neue Session arbeitet alles ab (pushen, GitHub, vidIQ, Gemini, PushNotification gehen dort) und endet.

Die Abläufe stehen in diesen Dateien. Wer einen Ablauf ändern will, ändert nur die Datei und muss die geplanten Aufgaben nicht anfassen:

- `analyse.md`: Analyse vor der Staffel
- `produktion.md`: Kurzvideo-Staffel (prüft zuerst den Vorrat)
- `zitate.md`: Zitat-Video nach jeder veröffentlichten Staffel (Issue #24); schickt die Datei in den Chat, Jonathan postet selbst mit eigenem Song
- `kontrolle.md`: Abend-Kontrolle täglich 20:13, prüft auf allen Konten die letzten 4 Videos (Stimme, Bild, Ton, Status) mit `taeglich/kontrolle.py`
