"""Vorläufigen Zeitplan (plan_final.json) aus dem Text schätzen, damit Standbilder schon vor der Stimme geprüft werden können.
python3 probeplan.py <ordner>  → <ordner>/plan_final.json (wird von stimme.py später überschrieben). ~2,9 Wörter/s wie Puck mit Storytime-Anweisung."""
import sys, json, re
sys.path.insert(0, sys.argv[1]); from zeilen import zeilen
t = 0.25; out = []
for z in zeilen:
    w = z.split(); d = max(1.0, len(w) / 2.9); ws = []
    for i, x in enumerate(w): ws.append([t + i * d / len(w), t + (i + 1) * d / len(w) - 0.03, x])
    out.append({"text": z, "start": t, "dauer": d, "woerter": ws}); t += d + 0.3
json.dump({"dauer": t, "zeilen": out, "probe": True}, open(sys.argv[1] + "/plan_final.json", "w"), ensure_ascii=False, indent=1); print("Probe-Dauer", round(t + 1.3, 1), "s")
