import json, numpy as np, scipy.io.wavfile as wf, scipy.signal as sg, subprocess, difflib, re
from zeilen import ZEILEN
S0, S1 = 31.20, 76.88
B0, P = 31.28, 0.6; s16 = P/4
subprocess.run(['ffmpeg','-loglevel','error','-y','-ss',str(S0),'-to',str(S1),'-i','song.mp3','-af','afade=t=in:d=0.02,afade=t=out:st=%.2f:d=0.3'%(S1-S0-0.3),'-ar','48000','ausschnitt.wav'],check=True)
sr,x=wf.read('ausschnitt.wav'); x=x.astype(np.float32); x=x.mean(1) if x.ndim>1 else x
f,t,Z=sg.stft(x,sr,nperseg=2048,noverlap=2048-256);M=np.log1p(np.abs(Z)/300); t=t+S0
def flux(lo,hi):
    b=(f>=lo)&(f<hi);d=np.diff(M[b],axis=1);d[d<0]=0;e=np.concatenate([[0],d.sum(0)]);return e/e.max()
voc=flux(1000,4000); kick=flux(30,150)
roh=json.load(open('woerter-seg.json'))
ww=[]
for w in roh:
    if (w['w'].startswith("'") or w['w'].startswith('-')) and ww: ww[-1]['w']+=w['w']
    else: ww.append(dict(w))
ww=[w for w in ww if w['a']>31.0]
norm=lambda s: re.sub(r"[^a-z0-9äöüß]","",s.lower().replace('ss','ß'))
lyr=[]
for zi,(sp,z) in enumerate(ZEILEN):
    for k,w in enumerate(z.split()): lyr.append((zi,k,w))
sm=difflib.SequenceMatcher(None,[norm(w) for _,_,w in lyr],[norm(w['w']) for w in ww],autojunk=False)
zeit=[None]*len(lyr)
for a,b,n in sm.get_matching_blocks():
    for i in range(n): zeit[a+i]=ww[b+i]['a']
# Zeile 3 manuell (Genius unsicher): nur „Gangster Ralle Hardcore“ wird groß gezeigt
for i,(zi,k,w) in enumerate(lyr):
    if zi==2: zeit[i]={'Gangster':37.28,'Ralle':37.6,'Hardcore':37.88}.get(w)
# Lücken interpolieren
idx=[i for i,v in enumerate(zeit) if v is not None]
for i in range(len(zeit)):
    if zeit[i] is None:
        lo=max([j for j in idx if j<i],default=None); hi=min([j for j in idx if j>i],default=None)
        zeit[i]= zeit[lo]+ (zeit[hi]-zeit[lo])*(i-lo)/(hi-lo) if lo is not None and hi is not None else (zeit[lo]+0.2 if lo is not None else zeit[hi]-0.2)
def stark(tm,w=0.03):
    m=(t>tm-w)&(t<tm+w); return voc[m].max() if m.any() else 0
zeilen=[]; prev=31.0; i=0
for zi,(sp,z) in enumerate(ZEILEN):
    out=[]
    for k,w in enumerate(z.split()):
        a=zeit[i]; i+=1
        ks=np.arange(np.ceil((a-0.12-B0)/s16),np.floor((a+0.09-B0)/s16)+1)
        cand=[B0+q*s16 for q in ks if B0+q*s16>prev+0.04] or [max(a,prev+0.05)]
        sc=[stark(c)-0.8*abs(c-a) for c in cand]; nn=cand[int(np.argmax(sc))]; prev=nn
        out.append(dict(w=w,a=round(nn-S0,3)))
    zeilen.append(dict(text=z,sprecher=sp,woerter=out))
# Zeilengrenzen auf Takt/erstes Wort
for k,z in enumerate(zeilen):
    z['a']=round(z['woerter'][0]['a']-0.06,3)
for k,z in enumerate(zeilen):
    z['e']=zeilen[k+1]['a'] if k+1<len(zeilen) else round(S1-S0,3)
    print(f"{z['a']:6.2f} {z['e']:6.2f} {z['sprecher']} "+' '.join(f"{w['w']}@{w['a']+S0:.2f}" for w in z['woerter']))
kk=[round(float(t[i])-S0,3) for i in range(1,len(kick)-1) if kick[i]>0.35 and kick[i]>=kick[i-1] and kick[i]>kick[i+1]]
dd=[]
for k in kk:
    if not dd or k-dd[-1]>0.15: dd.append(k)
print('Kicks',len(dd))
json.dump(dict(start=S0,ende=round(S1-S0,3),beat=P,beat0=round((B0-S0)%P,4),takt0=round(B0-S0,3),zeilen=zeilen,kicks=dd),open('zeitleiste.json','w'),ensure_ascii=False)
