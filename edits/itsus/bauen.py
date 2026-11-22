# „IT'S US“ (Bartofso feat. Murda) – Luxus-Vlog im Stil des Vorbilds: 4:3 (v3: Retro-Look alte Kamera, verpixelt; Hypercars, Monaco, viel Bargeld, Champagner/Wodka), Schnitt auf jeden Beat (130 BPM),
# Song-Ausschnitt 24,15–36,92 s (gleiche Stelle wie im Vorbild-TikTok). Nur Clips ohne Menschen (Pexels).
import subprocess, random, sys
A, D, FPS = 24.15, 12.77, 60
P = 0.4635
schnitte = [0.0] + [round(0.47 + k * P, 3) for k in range(27) if 0.47 + k * P < D - 0.2]
schnitte += [1.97, 2.07, 2.2, 2.93, 3.07, 8.47, 8.6]          # kurze Schnell-Folgen wie im Vorbild
schnitte = sorted(set(schnitte))
CLIPS = ["29498800", "11957605", "6266434", "39323981", "40455916", "3066463", "6266286", "8967918", "11506224", "11957603",
         "9675966", "29498825", "40548602", "7727416", "10223447", "11541170", "32346349", "3752538", "13086642", "8967910",
         "5309319", "4393479", "20153915", "11373228", "40140718", "29498822", "10630297", "7727415", "12748107", "29498807",
         "6396170", "39497373", "7231380", "3066432", "29498826", "12890562"]
START = {"9675966": (1.2, 2.8), "11373228": (0.2, 3.0), "7727415": (0.5, 5.0)}
random.seed(7)
# Retro-Look wie von einer alten Digitalkamera: niedrige Auflösung, leicht verpixelt (Nearest-Neighbor), etwas Rauschen und
# warme, leicht ausgewaschene Farben, minimal verwackelt, oranger Datumsstempel unten rechts
LOOK = ("crop=1380:1035:'30+20*sin(t*5.3)':'22+14*sin(t*4.1)',scale=360:270:flags=area,eq=contrast=1.1:saturation=1.05:gamma=1.03:brightness=0.01,"
        "colorbalance=rs=0.04:gs=0.01:bs=-0.03:rh=0.03,noise=alls=12:allf=t,scale=1440:1080:flags=neighbor,"
        "drawtext=fontfile=Inter-Bold.otf:text='22 11 2026':fontsize=46:fontcolor=0xffa23a:x=w-tw-70:y=h-th-60:shadowcolor=0x00000080:shadowx=3:shadowy=3,"
        "vignette=angle=PI/5")
teile = []
for i, t0 in enumerate(schnitte):
    t1 = schnitte[i + 1] if i + 1 < len(schnitte) else D
    n = round(t1 * FPS) - round(t0 * FPS); clip = CLIPS[i % len(CLIPS)]; ss = round(random.uniform(*START.get(clip, (0.3, 5.5))), 2)
    aus = f"teil/{i:02d}.mp4"; teile.append(aus)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(ss), "-i", f"roh/{clip}.mp4", "-an", "-vf", f"fps={FPS},{LOOK}", "-frames:v", str(n),
                    "-c:v", "libx264", "-crf", "12", "-preset", "fast", "-pix_fmt", "yuv420p", aus], check=True)
open("teil/liste.txt", "w").write("".join(f"file '{p[5:]}'\n" for p in teile))
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(A), "-t", str(D), "-i", "song.mp3", "-af", f"afade=t=out:st={D-0.35}:d=0.35", "-ar", "48000", "ausschnitt.wav"], check=True)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", "teil/liste.txt", "-i", "ausschnitt.wav", "-c:v", "libx264", "-crf", "16", "-preset", "slow",
                "-r", str(FPS), "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", sys.argv[1]], check=True)
print(len(schnitte), "Schnitte, fertig")
