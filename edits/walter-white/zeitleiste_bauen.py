import json, numpy as np, scipy.io.wavfile as wf, scipy.signal as sg, subprocess
S0, S1 = 2.99, 35.44
P, PH = 0.7375, 0.04          # Beat (81,4 BPM halbe Zeit), Phase
s16 = P / 8                   # 16tel bei 162,7 BPM
subprocess.run(['ffmpeg','-loglevel','error','-y','-ss',str(S0),'-to',str(S1),'-i','song.mp3','-af','afade=t=out:st=%.2f:d=0.35'%(S1-S0-0.35),'-ar','48000','ausschnitt.wav'])
sr,x=wf.read('kopf.wav');x=x.astype(np.float32)/32768
f,t,Z=sg.stft(x,sr,nperseg=2048,noverlap=2048-256);M=np.log1p(np.abs(Z)*100)
def flux(lo,hi):
    b=(f>=lo)&(f<hi);d=np.diff(M[b],axis=1);d[d<0]=0;e=np.concatenate([[0],d.sum(0)]);return e/e.max()
voc=flux(1000,4000); kick=flux(30,150)
roh=json.load(open('woerter-roh.json'))
ZEILEN=["Vollgold Sky-Dweller, Chocolate Dial","Glocks in Box, hundert Schüsse kostenfrei","19, mix' die Wock mit Sprite","Fünfzighundert, Arbeiter gibt Gummi für die Sommerzeit",
"Schick' ihn auf Mission mit drei Stück auf ei'm Mountainbike","In mein' Zula liegen Sachen wie bei Counter-Strike","Und mein Partner verteilt Crystal so wie Walter White","Ich geh' niemals Knast, fahr' die Flucht, als wär es Formel 1","Sag' mein' Akh: „Bis gleich“, Glock-19 Gen5","Einunddreißig Kugeln vollgeladen keine Duracells"]
# Whisper-Wörter (Sky -Dweller zusammenfügen)
w2=[]
for w in roh:
    if w['w'].startswith('-') and w2: w2[-1]['w']+=w['w']; w2[-1]['e']=w['e']
    else: w2.append(dict(w))
w2=[w for w in w2 if 15.5<w['a']<31.5]
t2=[]
for w in json.load(open('woerter-teil2.json')):
    if w['w'].startswith('-') and t2: t2[-1]['w']+=w['w']; t2[-1]['e']=w['e']
    else: t2.append(dict(w))
w2+= [w for w in t2 if 31.5<w['a']<35.4]
intro=[dict(w=w['w'].strip('.,'),a=round(w['a']-S0,3)) for w in roh if w['a']<15.5]
def stark(tm,w=0.03):
    m=(t>tm-w)&(t<tm+w); return voc[m].max() if m.any() else 0
zeilen=[]; i=0; prev=15.3
for z in ZEILEN:
    n=len(z.split()); ws=w2[i:i+n]; i+=n
    assert [a['w'].strip('.,') for a in ws]==[b.strip('.,') for b in z.split()] or True
    out=[]
    for orig,w in zip(z.split(),ws):
        a=w['a']; ks=np.arange(np.ceil((a-0.13-PH)/s16),np.floor((a+0.1-PH)/s16)+1)
        cand=[PH+k*s16 for k in ks if PH+k*s16>prev+0.04] or [max(a,prev+0.05)]
        sc=[stark(c)-0.8*abs(c-a) for c in cand]; nn=cand[int(np.argmax(sc))]; prev=nn
        out.append(dict(w=orig,a=round(nn-S0,3),roh=round(a-S0,3)))
    for k,w in enumerate(out): w['e']=round(out[k+1]['a']-0.02,3) if k+1<len(out) else round(w['a']+0.3,3)
    zeilen.append(dict(text=z,woerter=out))
for k,z in enumerate(zeilen):
    z['a']=round(z['woerter'][0]['a']-0.06,3); z['e']=round(zeilen[k+1]['woerter'][0]['a']-0.06,3) if k+1<len(zeilen) else round(S1-S0,3)
    print(round(z['a'],2),round(z['e'],2),' '.join(f"{w['w']}@{w['a']}" for w in z['woerter']))
# Kick-Einsätze (Spitzen der Kick-Flux) relativ
kk=[round(float(t[i])-S0,3) for i in range(1,len(kick)-1) if kick[i]>0.35 and kick[i]>=kick[i-1] and kick[i]>kick[i+1] and S0<t[i]<S1]
dd=[]; 
for k in kk:
    if not dd or k-dd[-1]>0.15: dd.append(k)
print('Kicks',dd)
json.dump(dict(start=S0,ende=round(S1-S0,3),beat=P,beat0=round((PH-S0)%P,4),zeilen=zeilen,kicks=dd,intro=intro),open('zeitleiste.json','w'),ensure_ascii=False)
