# Add a lap-record entry to a track's light file.  python3 tools/track-data/add_laprecord.py <id> <series> <time> "<who>" "<car>" <year> "<note>"
import sys, os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__))); import build_route as B
tid,series,time,who,car,year,note=sys.argv[1:8]
T=B.load(tid); T.setdefault("lapRecord",[]); T["lapRecord"]=[x for x in T["lapRecord"] if x["series"]!=series]+[{"series":series,"time":time,"who":who,"car":car,"year":int(year),"note":note}]
B.save(tid,T); print(tid,"lap record",series,time)
