import json, numpy as np, scipy.io.wavfile as wf, scipy.signal as sg, subprocess, difflib, re
from zeilen import ZEILEN
S0, S1 = 40.50, 83.60
B0, P = 0.184, 0.6475; s16 = P/4
subprocess.run(['ffmpeg','-loglevel','error','-y','-ss',str(S0),'-to',str(S1),'-i','song.mp3','-af','afade=t=in:d=0.02,afade=t=out:st=%.2f:d=0.3'%(S1-S0-0.3),'-ar','48000','ausschnitt.wav'],check=True)
sr,x=wf.read('ausschnitt.wav'); x=x.astype(np.float32); x=x.mean(1) if x.ndim>1 else x
f,t,Z=sg.stft(x,sr,nperseg=2048,noverlap=2048-256);M=np.log1p(np.abs(Z)/300); t=t+S0
def flux(lo,hi):
    b=(f>=lo)&(f<hi);d=np.diff(M[b],axis=1);d[d<0]=0;e=np.concatenate([[0],d.sum(0)]);return e/e.max()
voc=flux(1000,4000); kick=flux(30,150)
roh=[w for w in json.load(open('woerter-roh.json')) if w['a']<43.4]+json.load(open('woerter-large.json'))
ww=[]
for w in roh:
    if (w['w'].startswith("'") or w['w'].startswith('-')) and ww: ww[-1]['w']+=w['w']
    else: ww.append(dict(w))
ww=[w for w in ww if 40.5<w['a']<83.0]
norm=lambda s: re.sub(r"[^a-z0-9äöüß]","",s.lower().replace('ss','ß'))
lyr=[]
for zi,z in enumerate(ZEILEN):
    for k,w in enumerate(z.split()): lyr.append((zi,k,w.lstrip('~')))
sm=difflib.SequenceMatcher(None,[norm(w) for _,_,w in lyr],[norm(w['w']) for w in ww],autojunk=False)
zeit=[None]*len(lyr)
for a,b,n in sm.get_matching_blocks():
    for i in range(n): zeit[a+i]=ww[b+i]['a']
# Lücken interpolieren
idx=[i for i,v in enumerate(zeit) if v is not None]
for i in range(len(zeit)):
    if zeit[i] is None:
        lo=max([j for j in idx if j<i],default=None); hi=min([j for j in idx if j>i],default=None)
        zeit[i]= zeit[lo]+ (zeit[hi]-zeit[lo])*(i-lo)/(hi-lo) if lo is not None and hi is not None else (zeit[lo]+0.2 if lo is not None else zeit[hi]-0.2)
def stark(tm,w=0.03):
    m=(t>tm-w)&(t<tm+w); return voc[m].max() if m.any() else 0
zeilen=[]; prev=40.4; i=0
for zi,z in enumerate(ZEILEN):
    out=[]
    for k,w in enumerate(z.split()):
        a=zeit[i]; i+=1
        ks=np.arange(np.ceil((a-0.12-B0)/s16),np.floor((a+0.09-B0)/s16)+1)
        cand=[B0+q*s16 for q in ks if B0+q*s16>prev+0.04] or [max(a,prev+0.05)]
        sc=[stark(c)-0.8*abs(c-a) for c in cand]; nn=cand[int(np.argmax(sc))]; prev=nn
        out.append(dict(w=w.lstrip('~'),a=round(nn-S0,3),v=w.startswith('~')))
    anz=[]
    for w in out:
        if w['v']:
            if not anz or anz[-1]['w']!='…': anz.append(dict(w='…',a=w['a']))
        else: anz.append(dict(w=w['w'],a=w['a']))
    zeilen.append(dict(text=z,woerter=out,anzeige=anz))
# Zeilengrenzen auf Takt/erstes Wort
for k,z in enumerate(zeilen):
    z['a']=round(z['woerter'][0]['a']-0.06,3)
for k,z in enumerate(zeilen):
    z['e']=zeilen[k+1]['a'] if k+1<len(zeilen) else round(S1-S0,3)
    print(f"{z['a']:6.2f} {z['e']:6.2f} "+' '.join(f"{w['w']}@{w['a']+S0:.2f}" for w in z['woerter']))
kk=[round(float(t[i])-S0,3) for i in range(1,len(kick)-1) if kick[i]>0.35 and kick[i]>=kick[i-1] and kick[i]>kick[i+1]]
dd=[]
for k in kk:
    if not dd or k-dd[-1]>0.15: dd.append(k)
print('Kicks',len(dd))
json.dump(dict(start=S0,ende=round(S1-S0,3),beat=P,beat0=round((B0-S0)%P,4),takt0=round(B0-S0,3),zeilen=zeilen,kicks=dd),open('zeitleiste.json','w'),ensure_ascii=False)
# Von Hand nach Whisper-Wortzeiten (Song-Sekunden): Marid 75,60; letzte Zeile 80,92 / 81,04 / 81,40 / 81,74 / 81,98
zl=json.load(open('zeitleiste.json'))
FIX={16:{"Marid":75.60},19:{"Bring'":80.92,"miesestes":81.04,"Ot":81.40,"ohne":81.74,"Lieferungsstopp":81.98}}
for zi,fx in FIX.items():
    l=zl['zeilen'][zi]['woerter']
    for w in l:
        if w['w'] in fx: w['a']=round(fx[w['w']]-S0,3)
    for k,w in enumerate(l): w['e']=round(l[k+1]['a']-0.02,3) if k+1<len(l) else round(w['a']+0.3,3)
    zl['zeilen'][zi]['anzeige']=[dict(w=w['w'],a=w['a']) for w in l]
json.dump(zl,open('zeitleiste.json','w'),ensure_ascii=False)
print('fix ok', [(w['w'],round(w['a']+S0,2)) for w in zl['zeilen'][19]['woerter']])
