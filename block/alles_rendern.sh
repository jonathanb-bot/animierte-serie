#!/bin/bash
# rendert volle Fassung und YouTube-Fassung nacheinander, je 3 parallele Teile
cd "$(dirname "$0")"
teile() { local plan=$1 ordner=$2 n=$3; local s=$(( (n + 2) / 3 )); rm -rf "folge-01/$ordner"; mkdir -p "folge-01/$ordner"
  for i in 0 1 2; do VON=$((i*s)) BIS=$(( (i+1)*s < n ? (i+1)*s : n )) ORDNER=$ordner PLAN=$plan node render.cjs > "folge-01/r_${ordner}_$i.log" 2>&1 & done; wait; }
teile plan_final.json frames $1
teile plan_yt.json frames_yt $2
echo ALLES_FERTIG
