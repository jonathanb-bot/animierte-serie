# 3D-Probe „Flucht“ (16.11., Jonathans Wunsch nach dem Vorbild-Video „Das perfekte Fluchtfahrzeug Teil 2“)

Echtes 3D mit three.js 0.170.0 (WebGL, im Container per SwiftShader ohne Grafikkarte), 1440×2560, 60 fps, 8 s.
Szene: Autobahn bei Nacht (Laternen mit Lichtkegeln und mitwandernden Lichtern), dunkelroter Sportkombi im RS-Stil (Rücklichtleiste, Endrohre, Scheinwerferkegel), Polizeihubschrauber mit Suchscheinwerfer, ab 4,6 s Wärmebild-Ansicht mit HUD. Nachbearbeitung: Bloom, Nachzieh-Unschärfe, Wärmebild-Shader.

    cd drei/probe-flucht && npm install three@0.170.0
    python3 -m http.server 8765 --bind 127.0.0.1 &
    node aufnahme.js 0 8 60 bilder        # ca. 2,2 s pro Bild auf 4 Kernen
    ffmpeg -framerate 60 -i bilder/%05d.png -c:v libx264 -crf 16 -pix_fmt yuv420p probe.mp4

Noch ohne Ton und ohne Einblendungen; für ein fertiges Video käme die Szene in die bestehende Pipeline (Stimme Orus, Untertitel, `ein=`).
