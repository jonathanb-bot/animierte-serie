# Dark-Y2K-Money-Vorlage – Sound „Phantom“ (EsDeeKid ft. Rico Ace)

Gleiche Vorlage wie `edits/all-i-need/` (Schwarz-Weiß, 2000er-Digicam-Clips von Pexels: Supersportwagen, Uhren, Dollar, Städte – keine Personen, keine Lyrics), angepasst auf „Phantom“:

- Ausschnitt 7,45–41,74 s des Songs (34,29 s): 4 Takte Intro + kompletter Hook „Blacked out like a phantom …“ bis vor Rico Aces Part.
- 140 BPM, Hook-Einsatz genau auf Schlag 16 (6,857 s im Ausschnitt).
- Normal: Intro alle 2 Schläge, Hook jeder Schlag (Takt 7–8 und 15–16 doppelt). Schnell (`?modus=schnell`): Hook 2 pro Schlag, Takt 7–8/15–16 vier pro Schlag.
- In den kurzen Beat-Pausen am Ende jeder Zweitakt-Phrase friert das Bild als flackerndes Negativ ein.
- Kaleidoskop in Hook-Takt 3 und 11, REC-Kamera im Intro und in Takt 8 und 16, Kreuze in Takt 5–6 und 13–14.
- Clips: `../all-i-need/clip2000.sh` (Ordner `clips2000/` wird geteilt), Ton: `ffmpeg -ss 7.45 -to 41.74 -i Phantom.mp3 -af afade=t=out:st=33.9:d=0.39 ausschnitt.wav`.
