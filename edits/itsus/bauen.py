# „IT'S US“ (Bartofso feat. Murda) – Luxus-Vlog im Stil des Vorbilds: 4:3-Camcorder-Look, Schnitt auf jeden Beat (130 BPM),
# Song-Ausschnitt 24,15–36,92 s (gleiche Stelle wie im Vorbild-TikTok). Nur Clips ohne Menschen (Pexels).
import subprocess, random, sys
A, D, FPS = 24.15, 12.77, 60
P = 0.4635
schnitte = [0.0] + [round(0.47 + k * P, 3) for k in range(27) if 0.47 + k * P < D - 0.2]
schnitte += [1.97, 2.07, 2.2, 2.93, 3.07, 8.47, 8.6]          # kurze Schnell-Folgen wie im Vorbild
schnitte = sorted(set(schnitte))
CLIPS = ["34555902", "26799497", "11506224", "34867881", "8747374", "32062451", "10811089", "18837288", "34867895", "15434655",
         "7707975", "11918056", "855139", "8436074", "39596655", "32054939", "34867891", "16577325", "10809162", "6396170",
         "36735250", "35747920", "8747848", "20203971", "34867896", "8436070", "18607791"]
random.seed(7)
LOOK = ("scale=720:540,lenscorrection=k1=-0.16:k2=-0.03,vignette=angle=PI/4.2,eq=contrast=1.06:saturation=1.12:gamma=1.04,"
        "colorbalance=rh=0.03:gh=0.01:bs=0.02,noise=alls=9:allf=t,scale=1440:1080:flags=lanczos,unsharp=5:5:0.4")
teile = []
for i, t0 in enumerate(schnitte):
    t1 = schnitte[i + 1] if i + 1 < len(schnitte) else D
    n = round(t1 * FPS) - round(t0 * FPS); clip = CLIPS[i % len(CLIPS)]; ss = round(random.uniform(0.3, 5.5), 2)
    aus = f"teil/{i:02d}.mp4"; teile.append(aus)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(ss), "-i", f"roh/{clip}.mp4", "-an", "-vf", f"fps={FPS},{LOOK}", "-frames:v", str(n),
                    "-c:v", "libx264", "-crf", "12", "-preset", "fast", "-pix_fmt", "yuv420p", aus], check=True)
open("teil/liste.txt", "w").write("".join(f"file '{p[5:]}'\n" for p in teile))
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(A), "-t", str(D), "-i", "song.mp3", "-af", f"afade=t=out:st={D-0.35}:d=0.35", "-ar", "48000", "ausschnitt.wav"], check=True)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", "teil/liste.txt", "-i", "ausschnitt.wav", "-c:v", "libx264", "-crf", "16", "-preset", "slow",
                "-r", str(FPS), "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", sys.argv[1]], check=True)
print(len(schnitte), "Schnitte, fertig")
