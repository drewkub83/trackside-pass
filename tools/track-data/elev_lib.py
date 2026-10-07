import re, json, time, urllib.request, urllib.parse, sys, os
import os
HERE=os.path.dirname(os.path.abspath(__file__))
REPO=os.path.abspath(os.path.join(HERE,'..','..'))
ROOT=os.path.join(REPO,"data")+"/"
SCR=os.path.join(HERE,"elev-out")+"/"; os.makedirs(SCR,exist_ok=True)
def track(tid):
    t=open(ROOT+tid+".js",encoding="utf-8").read()
    vb=json.loads(re.search(r'"vb":(\[[^\]]*\])',t).group(1))
    g=json.loads(re.search(r'"geo":(\{[^}]*\})',t).group(1))
    return vb,g
def xy2ll(vb,g,x,y):
    return (g["n"]-(y-vb[1])/vb[3]*(g["n"]-g["s"]), g["w"]+(x-vb[0])/vb[2]*(g["e"]-g["w"]))
def mpu(vb,g): return (g["n"]-g["s"])*111000/vb[3]
def usgs(lat,lon):
    url="https://epqs.nationalmap.gov/v1/json?"+urllib.parse.urlencode({"x":f"{lon:.6f}","y":f"{lat:.6f}","units":"Feet","wkid":4326,"includeDate":"false"})
    for k in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"TracksidePass/0.1 (personal race-day app)"}),timeout=20) as r:
                v=json.load(r).get("value")
                if v is not None and float(v)>-1000: return round(float(v),1)
        except Exception as e: pass
        time.sleep(0.6*(k+1))
    return None
def openmeteo(points):
    out=[]
    for i in range(0,len(points),100):
        ch=points[i:i+100]
        url="https://api.open-meteo.com/v1/elevation?latitude="+",".join(f"{p[0]:.5f}" for p in ch)+"&longitude="+",".join(f"{p[1]:.5f}" for p in ch)
        with urllib.request.urlopen(url,timeout=30) as r: out+= [round(m*3.28084,1) for m in json.load(r)["elevation"]]
        time.sleep(0.3)
    return out
