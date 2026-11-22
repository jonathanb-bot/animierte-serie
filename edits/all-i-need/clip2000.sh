#!/bin/bash
# $1 = Kategorie, $2 = Pexels-Video-ID → clips2000/<kat>_<id>/NNN.jpg (2,5 s, 30 fps, S/W, 2000er-Look)
k=$1; id=$2; d=clips2000/${k}_$id; [ -d $d ] && exit 0
f=vid/$id.mp4; curl -s -L -A "Mozilla/5.0" -o $f "https://www.pexels.com/download/video/$id/" || exit 0
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $f 2>/dev/null); [ -z "$dur" ] && { rm -f $f; exit 0; }
st=$(python3 -c "d=float('$dur');print(max(0,d/2-1.25))")
mkdir -p $d
ffmpeg -loglevel error -y -i $f -ss $st -t 2.5 -vf "fps=30,crop='min(iw,ih*9/16)':'min(ih,iw*16/9)',scale=360:640,format=gray,eq=contrast=1.3,gblur=sigma=0.5" -q:v 14 $d/%03d.jpg
rm -f $f
