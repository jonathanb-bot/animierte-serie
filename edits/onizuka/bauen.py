# Onizuka – Late Night Paris: harte Schnitte auf jeden Takt (2,2024 s), 0,8x Zeitlupe, einheitliche Farbe, keine Effekte.
import subprocess, sys
A, E = 70.49, 122.20          # Ausschnitt im Song
BAR = 2.2024                  # Taktlänge (109 BPM)
FPS = 60
# (Takt-Start, Clip, Startsekunde im Clip, Zoom, y-Anteil 0=oben 0.5=Mitte)
PLAN = [
 # Ende Part N.O.S.: Regen + Hood (Wohnblöcke, Treppen, Tiefgarage)
 (0, "10336271", 0.0, 1.0, 0.5), (1, "19816673", 0.0, 1.0, 0.5), (2, "35259457", 0.0, 1.0, 0.5),
 (3, "18220504", 2.0, 1.0, 0.5), (4, "6016323", 0.0, 1.0, 0.5), (5, "19177439", 1.0, 1.0, 0.5),
 (6, "29019380", 1.0, 1.0, 0.5), (7, "10967332", 0.0, 1.0, 0.5), (8, "35099181", 2.0, 1.0, 0.5),
 # Hook „Ouh Onizuka“: Skyline öffnet sich, dazwischen Hood und Nachtfahrt
 (9, "34943731", 0.0, 1.0, 0.5), (11, "29025308", 2.0, 1.0, 0.5), (12, "34232317", 3.0, 1.0, 0.5),
 (13, "9921122", 8.0, 1.0, 0.5), (14, "35259457", 6.0, 1.0, 0.5), (15, "34103800", 1.0, 1.0, 0.5),
 (16, "28901427", 2.0, 1.0, 0.5), (17, "19816673", 4.0, 1.0, 0.5), (18, "35464509", 5.0, 1.0, 0.5),
 (19, "17888695", 7.0, 1.0, 0.5), (20, "32181485", 3.0, 1.3, 0.15), (21, "39468111", 10.0, 1.0, 0.5),
 (22, "30169690", 9.0, 1.0, 0.5), (23, "34943731", 30.0, 1.0, 0.5),
]
T = 1440, 2560
DAUER = E - A; NG = round(DAUER * FPS)
teile = []
for i, (b, clip, s0, z, yf) in enumerate(PLAN):
    f0 = round(b * BAR * FPS); f1 = round(PLAN[i + 1][0] * BAR * FPS) if i + 1 < len(PLAN) else NG
    n = f1 - f0; quelle = n / FPS * 0.8 + 0.2
    w, h = round(T[0] * z / 2) * 2, round(T[1] * z / 2) * 2
    vf = (f"setpts=PTS/0.8,fps={FPS},scale={w}:{h}:force_original_aspect_ratio=increase:flags=lanczos,"
          f"crop={T[0]}:{T[1]}:(iw-{T[0]})/2:(ih-{T[1]})*{yf},"
          "eq=saturation=0.86:contrast=1.04:gamma=0.97,colorbalance=bs=0.05:bm=0.02:rh=0.02,setsar=1")
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
