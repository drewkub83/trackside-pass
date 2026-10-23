# Madring (Madrid) is half purpose-built track, half public streets; OpenStreetMap (Oct 2026) maps only the new parts as
# raceway. This joins those pieces along the streets between them (shortest road path, plus a waypoint so the lap uses the
# east perimeter road of IFEMA as on the official 2026 fan map) and writes the lap into osm/madrid.json as way 9000002,
# which permanent/madrid.rb uses. Lap: 5.44 km against the official 5.416 km.
#   python3 tools/street-circuits/madrid_stitch.py   (after fetch_track_osm.py madrid 40.4655 -3.6150 0.022)
import json,math,heapq,sys
d=json.load(open('tools/street-circuits/osm/madrid.json'))['elements']
W={e['id']:e for e in d if e['type']=='way'}
C={}
for e in d:
    if e['type']=='way' and e.get('geometry'):
        for n,g in zip(e['nodes'],e['geometry']): C[n]=(g['lat'],g['lon'])
dist=lambda a,b: math.hypot((C[a][0]-C[b][0])*110900,(C[a][1]-C[b][1])*111320*math.cos(math.radians(40.47)))
G={}
for e in W.values():
    t=e.get('tags',{}); h=t.get('highway')
    if not h or h in('footway','path','steps','cycleway','pedestrian','track','bridleway','construction','proposed') : continue
    for a,b,i in zip(e['nodes'],e['nodes'][1:],range(10**6)):
        G.setdefault(a,[]).append((b,e['id'])); G.setdefault(b,[]).append((a,e['id']))
def sp(s,t):
    D={s:0};P={};q=[(0,s)]
    while q:
        c,u=heapq.heappop(q)
        if u==t: break
        if c>D[u]: continue
        for v,w in G.get(u,()):
            nc=c+dist(u,v)
            if nc<D.get(v,1e18): D[v]=nc;P[v]=(u,w);heapq.heappush(q,(nc,v))
    path=[t];ws=[]
    while path[-1]!=s: u,w=P[path[-1]];ws.append(w);path.append(u)
    return D[t],path[::-1],list(dict.fromkeys(ws[::-1]))
WP={1366550176:[(40.46828,-3.6123)]}
near=lambda la,lo:min(G,key=lambda n:(C[n][0]-la)**2+((C[n][1]-lo)*.76)**2)
order=[int(x) for x in sys.argv[1:]] or [1366550171,1366550168,1378267450,1378267452,1366550166,1366550177,1366550176]
tot=0;seq=[];ALL=[];NODES=[]
for i,w in enumerate(order):
    nx=W[order[(i+1)%len(order)]]
    L=sum(dist(a,b) for a,b in zip(W[w]['nodes'],W[w]['nodes'][1:])); tot+=L; seq.append(w)
    NODES.extend(W[w]['nodes'])
    pts=[W[w]['nodes'][-1]]+[near(*q) for q in WP.get(w,[])]+[nx['nodes'][0]]; g=0; ws=[]
    for a,b in zip(pts,pts[1:]):
        gg,p,w2=sp(a,b); g+=gg; ws+=w2; NODES.extend(p[1:-1] if b==pts[-1] else p[1:])
    ws=list(dict.fromkeys(ws)); tot+=g; ALL.extend(ws)
    print(f"{w} {L:.0f}m  -> gap {g:.0f}m via",[(x,W[x]['tags'].get('highway'),W[x]['tags'].get('name')) for x in ws])
print("total",round(tot))

print(' '.join(map(str,ALL)))

seen=[]
for n in NODES:
    if not seen or seen[-1]!=n: seen.append(n)
seen.append(seen[0])
L=sum(dist(a,b) for a,b in zip(seen,seen[1:])); print('ring',len(seen),round(L))
full=json.load(open('tools/street-circuits/osm/madrid.json'))
full['elements']=[e for e in full['elements'] if e.get('id')!=9000002]
full['elements'].append({'type':'way','id':9000002,'nodes':seen,'geometry':[{'lat':C[n][0],'lon':C[n][1]} for n in seen],'tags':{'highway':'raceway','name':'Madring','note':'stitched: OSM raceway pieces + the public streets between them (Trackside Pass)'}})
json.dump(full,open('tools/street-circuits/osm/madrid.json','w'))
