# Ton „Der Fluchtwagen“ Folge 1 (16.11.)

- **Musik:** „Exit the Premises“ – Kevin MacLeod (incompetech.com), Lizenz CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Quelle: https://archive.org/details/ExitThePremises
- **Motorsound:** „2008 BMW M3 E92 S65 Exhaust Sound Recordings“ – Nate Lee, Lizenz CC BY 4.0. Quelle: https://archive.org/details/2008-bmw-m3-e92-s65-exhaust-sound-recordings (V8-Saugmotor, Abschnitte 132–158 s als Fahrgeräusch, 93–104 s als Beschleunigung)
- **Hubschrauber:** eigene Synthese in `mix.py`.
- Nennung beider Quellen steht in der Post-Beschreibung (Pflicht bei CC BY).

Erzeugen: `taeglich/musik/flucht-f001-geraeusche.mp3` ist das Bett aus `python -m ton.folge`, `mix.py` (im Ordner mit `bett.mp3`, `v8_fahrt.mp3`, `exit.mp3`, `zeit.json`) legt Motor, Hubschrauber und Musik darüber. Ergebnis +2 dB → `taeglich/musik/flucht-f001.mp3`. Achtung: `ton.folge` überschreibt `flucht-f001.mp3`, danach `mix.py` erneut laufen lassen.
