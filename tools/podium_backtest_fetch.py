"""Downloads the 2026 GT World Challenge Europe Endurance Cup session results (FP1/FP2/qualifying/race) to sessions.json for podium_backtest.py."""
import re,html,json,subprocess
R={"RC":"circuit-paul-ricard","Mz":"monza","Spa":"crowdstrike-24-hours-of-spa","Nb":"n%C3%BCrburgring","Pt":"portimao"}
S=["free-practice-1","free-practice-2","qualifying-combined","main-race"]
def tbl(h):
    i=h.find("<table"); tb=h[i:h.find("</table>",i)+8]; out=[]
    hdr=None
    for r in re.findall(r"<tr[^>]*>(.*?)</tr>",tb,flags=re.S):
        c=[re.sub(r"\s+"," ",html.unescape(re.sub(r"<[^>]+>"," ",x))).strip() for x in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>",r,flags=re.S)]
        if c and c[0]=="Pos": hdr=c; continue
        if hdr and len(c)==len(hdr): out.append(dict(zip(hdr,c)))
    return out
D={}
for k,slug in R.items():
    D[k]={}
    for s in S:
        h=subprocess.run(["curl","-sL","-A","Mozilla/5.0",f"https://www.gt-world-challenge-europe.com/results/2026/{slug}/{s}"],capture_output=True,text=True).stdout
        D[k][s]=tbl(h)
    print(k,{s:len(v) for s,v in D[k].items()})
json.dump(D,open("sessions.json","w"),ensure_ascii=False)
