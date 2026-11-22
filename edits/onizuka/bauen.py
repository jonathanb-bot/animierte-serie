# Onizuka – Late Night Paris: harte Schnitte auf jeden Takt (2,2024 s), 0,8x Zeitlupe, einheitliche Farbe, keine Effekte.
import subprocess, sys
A, E = 70.49, 122.20          # Ausschnitt im Song
BAR = 2.2024                  # Taktlänge (109 BPM)
FPS = 60
# (Takt-Start, Clip, Startsekunde im Clip, Zoom, y-Anteil 0=oben 0.5=Mitte)
PLAN = [
 # Ende Part N.O.S.: Regen + Hood (Wohnblöcke, Pariser HLM, Treppen, Graffiti, Tiefgarage); "d" = Tagaufnahme nachtdunkel gegradet
 (0, "10336271", 0.0, 1.0, 0.5), (1, "19816673", 0.0, 1.0, 0.5), (2, "29532902", 1.0, 1.15, 0.7, "d"),
 (3, "18220504", 2.0, 1.0, 0.5), (4, "35259457", 0.0, 1.0, 0.5), (5, "19177439", 1.0, 1.0, 0.5),
 (6, "13164291", 3.0, 1.0, 0.5, "d"), (7, "29019380", 1.0, 1.0, 0.5), (8, "35099181", 2.0, 1.0, 0.5),
 # Hook „Ouh Onizuka“: nur Pariser Skyline (Eiffelturm-Lichtstrahl, La Défense, Seine, Metro-Brücke), dazwischen Hood
 (9, "34943731", 0.0, 1.0, 0.5), (11, "13316516", 2.0, 1.0, 0.5, "b"), (12, "35868518", 6.0, 1.0, 0.5),
 (13, "15627229", 4.0, 1.0, 0.5, "d"), (14, "34948069", 3.0, 1.0, 0.5), (15, "35868518", 1.0, 1.0, 0.5),
 (16, "34743886", 3.0, 1.0, 0.5, "d"), (17, "6016323", 0.0, 1.0, 0.5), (18, "34103800", 1.0, 1.0, 0.5),
 (19, "13164289", 1.0, 1.0, 0.5, "d"), (20, "36107384", 1.0, 1.0, 0.5), (21, "34943731", 20.0, 1.0, 0.5),
 (22, "30169690", 9.0, 1.0, 0.5), (23, "34943731", 30.0, 1.0, 0.5),
]
GRADE = {"n": "eq=saturation=0.86:contrast=1.04:gamma=0.97,colorbalance=bs=0.05:bm=0.02:rh=0.02",
         "b": "eq=saturation=0.75:contrast=1.06:gamma=0.82:brightness=-0.04,colorbalance=bs=0.10:bm=0.05:rh=0.0",
         "d": "eq=saturation=0.45:contrast=1.12:gamma=0.62:brightness=-0.10,colorbalance=bs=0.16:bm=0.08:bh=0.05:rh=-0.04,curves=all='0/0 0.5/0.33 1/0.8'"}
T = 1440, 2560
DAUER = E - A; NG = round(DAUER * FPS)
teile = []
for i, (b, clip, s0, z, yf, *gr) in enumerate(PLAN):
    f0 = round(b * BAR * FPS); f1 = round(PLAN[i + 1][0] * BAR * FPS) if i + 1 < len(PLAN) else NG
    n = f1 - f0; quelle = n / FPS * 0.8 + 0.2
    w, h = round(T[0] * z / 2) * 2, round(T[1] * z / 2) * 2
    vf = (f"setpts=PTS/0.8,fps={FPS},scale={w}:{h}:force_original_aspect_ratio=increase:flags=lanczos,"
          f"crop={T[0]}:{T[1]}:(iw-{T[0]})/2:(ih-{T[1]})*{yf},"
          + GRADE[gr[0] if gr else "n"] + ",setsar=1")
    aus = f"teil/{i:02d}.mp4"; teile.append(aus)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(s0), "-t", str(quelle), "-i", f"roh/{clip}.mp4", "-an", "-vf", vf,
                    "-frames:v", str(n), "-c:v", "libx264", "-preset", "medium", "-crf", "12", "-pix_fmt", "yuv420p", aus], check=True)
    print(i, clip, n, flush=True)
open("teil/liste.txt", "w").write("".join(f"file '{p[5:]}'\n" for p in teile))
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(A), "-to", str(E), "-i", "song.mp3", "-af", f"afade=t=out:st={DAUER-0.9}:d=0.9", "-ar", "48000", "ausschnitt.wav"], check=True)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", "teil/liste.txt", "-i", "ausschnitt.wav",
                "-vf", f"fade=t=out:st={DAUER-0.9}:d=0.9", "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-r", str(FPS), "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", sys.argv[1]], check=True)
print("fertig")
