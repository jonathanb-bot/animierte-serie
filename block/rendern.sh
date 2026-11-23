#!/bin/bash
# Eine Fassung einer Folge rendern, 3 parallele Teile: ./rendern.sh <ordner-der-folge> [plan_final.json] [frames]
# (alles_rendern.sh ist fest auf folge-01). WEITER=1 überspringt schon fertige Bilder (Fortsetzen nach Abbruch).
# Vorhandene Bilder werden überschrieben, der Ordner wird nicht gelöscht.
cd "$(dirname "$0")"; F=$1; PLAN=${2:-plan_final.json}; ORD=${3:-frames}
N=$(python3 -c "import json;p=json.load(open('$F/$PLAN'));z=p['zeilen'][-1];print(round((z['start']+z['dauer']+1.6)*60))")
S=$(( (N + 2) / 3 )); mkdir -p "$F/$ORD"
for i in 0 1 2; do FOLGE=$F VON=$((i*S)) BIS=$(( (i+1)*S < N ? (i+1)*S : N )) ORDNER=$ORD PLAN=$PLAN node render.cjs > "$F/r_${ORD}_$i.log" 2>&1 & done; wait
echo "FERTIG $F $ORD $(ls $F/$ORD | wc -l)/$N"
