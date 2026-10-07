import sys; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import os
HERE=os.path.dirname(os.path.abspath(__file__))
REPO=os.path.abspath(os.path.join(HERE,'..','..'))
from elev_lib import *
from concurrent.futures import ThreadPoolExecutor
import math
def grid(tid):
    vb,g=track(tid); m=mpu(vb,g)
    nx=max(2,math.ceil(vb[2]*m/100)+1); ny=max(2,math.ceil(vb[3]*m/100)+1)
    cx=vb[2]/(nx-1); cy=vb[3]/(ny-1)
    nodes=[(vb[0]+i*cx, vb[1]+j*cy) for j in range(ny) for i in range(nx)]
    return vb,g,nx,ny,cx,cy,nodes
for tid in sys.argv[1:]:
    out=SCR+tid+".json"
    if os.path.exists(out): print(tid,"already done",flush=True); continue
    vb,g,nx,ny,cx,cy,nodes=grid(tid)
    lls=[xy2ll(vb,g,x,y) for x,y in nodes]
    print(tid,"grid",nx,"x",ny,"=",len(nodes),"points",flush=True)
    if tid=="canadian-tire-motorsport-park":
        vals=[]
        for i in range(0,len(lls),100):
            for k in range(6):
                try: vals+=openmeteo(lls[i:i+100]); break
                except Exception as e: time.sleep(20*(k+1))
            else: vals+=[None]*len(lls[i:i+100])
    else:
        with ThreadPoolExecutor(8) as ex: vals=list(ex.map(lambda p: usgs(*p), lls))
        for k in range(2):   # second pass for any that failed
            miss=[i for i,v in enumerate(vals) if v is None]
            if not miss: break
            with ThreadPoolExecutor(4) as ex: r=list(ex.map(lambda i: usgs(*lls[i]), miss))
            for i,v in zip(miss,r): vals[i]=v
    bad=sum(v is None for v in vals)
    json.dump({"x0":vb[0],"y0":vb[1],"cx":round(cx,4),"cy":round(cy,4),"nx":nx,"ny":ny,"ft":vals},open(out,"w"))
    print(tid,"DONE, missing",bad,"of",len(vals),"range",min(v for v in vals if v is not None),max(v for v in vals if v is not None),flush=True)
print("ALL DONE",flush=True)
