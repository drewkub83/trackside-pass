import re, json, os, gzip
os.chdir("/Users/andrew/Desktop/Claude Code")

def load(f, var):
    src = open(f).read()
    i = src.index("const " + var + "=")
    return src[:i], json.loads(src[i + len("const " + var + "="):].rstrip().rstrip(";"))

def save(f, var, head, data):
    open(f, "w").write(head + "const " + var + "=" + json.dumps(data, separators=(",", ":")) + ";\n")

def ints(d):
    return re.sub(r'-?\d+\.\d+', lambda m: str(round(float(m.group(0)))), d)

def poly(d):
    """curves become straight segments to their end points (for shapes that only fill gaps)"""
    toks = re.findall(r'[MLCZ]|-?\d+\.?\d*', d)
    out = []; i = 0
    while i < len(toks):
        t = toks[i]
        if t in "MLC":
            i += 1; nums = []
            while i < len(toks) and toks[i] not in "MLCZ":
                nums.append(toks[i]); i += 1
            pairs = [(nums[k], nums[k + 1]) for k in range(0, len(nums) - 1, 2)]
            if t == "C":
                pairs = pairs[2::3]
            out.append(("M" if t == "M" else "L") + " ".join(a + "," + b for a, b in pairs))
        elif t == "Z":
            out.append("Z"); i += 1
        else:
            i += 1
    return "".join(out)

def size(d):
    n = [float(x) for x in re.findall(r'-?\d+\.?\d*', d)]
    xs, ys = n[0::2], n[1::2]
    return max(max(xs) - min(xs), max(ys) - min(ys))

def report(f):
    raw = os.path.getsize(f)
    gz = len(gzip.compress(open(f, "rb").read(), 9))
    print(f, "raw", raw, "gzip", gz)

# --- NASCAR car: the shapes that only paint over removed wording become simple polygons, and the tiny ones go
head, data = load("js/carart_nascar.js", "PP_CAR_NASCAR")
rows = []
for d, L, fl in data["p"]:
    if fl == 3:
        if size(d) < 40:
            continue
        d = poly(d)
    rows.append([d, L, fl])
data["p"] = rows
save("js/carart_nascar.js", "PP_CAR_NASCAR", head, data)
report("js/carart_nascar.js")

# --- the others: whole numbers, and drop what is too small to see at stamp size
for f, var, mn in [("js/carart.js", "PP_CAR_GTP", 3.0), ("js/hopper.js", "PP_HOPPER", 3.0), ("js/cherries.js", "PP_CHERRIES", 1.5)]:
    head, data = load(f, var)
    x0, y0, w, h = data["vb"]
    data["vb"] = [round(x0), round(y0), round(w), round(h)]
    rows = []
    for q in data["p"]:
        d = ints(q[0])
        if size(d) < mn:
            continue
        rows.append([d] + q[1:])
    data["p"] = rows
    save(f, var, head, data)
    report(f)
report("js/bus.js")
