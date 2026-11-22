# „IT'S US“ (Bartofso feat. Murda) – Luxus-Vlog im Stil des Vorbilds: 4:3, Handykamera-Look (v2: Monaco, Hypercars, Geld, Clubs, Drogen; keine Kerzen), Schnitt auf jeden Beat (130 BPM),
# Song-Ausschnitt 24,15–36,92 s (gleiche Stelle wie im Vorbild-TikTok). Nur Clips ohne Menschen (Pexels).
import subprocess, random, sys
A, D, FPS = 24.15, 12.77, 60
P = 0.4635
schnitte = [0.0] + [round(0.47 + k * P, 3) for k in range(27) if 0.47 + k * P < D - 0.2]
schnitte += [1.97, 2.07, 2.2, 2.93, 3.07, 8.47, 8.6]          # kurze Schnell-Folgen wie im Vorbild
schnitte = sorted(set(schnitte))
CLIPS = ["29498800", "11957603", "6266286", "12748107", "11506224", "29498825", "13086642", "10223447", "32346349", "5309319",
         "13367423", "12890562", "29498822", "4393479", "5011044", "8747374", "39497373", "29498807", "3752538", "7269180",
         "40061525", "11957604", "7231380", "29498826", "39472138", "11918056", "10630297", "31541618", "3960019", "32068488",
         "29498796", "6396170", "35353790", "29498827", "14052141", "10809162"]
random.seed(7)
# Handykamera-Look: iPhone-Ultraweitwinkel (leichte Tonnenverzeichnung), scharf, kräftige Farben, leicht verwackelt aus der Hand
LOOK = ("crop=1340:1005:'50+38*sin(t*6.1)+14*sin(t*13.7)':'37+26*sin(t*4.7)+10*sin(t*11.3)',scale=1440:1080,"
        "lenscorrection=k1=-0.09:k2=-0.01,eq=contrast=1.07:saturation=1.16:gamma=0.98,unsharp=5:5:0.7,noise=alls=3:allf=t")
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
