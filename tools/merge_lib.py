#!/usr/bin/env python3
"""دمج أجزاء athar-lib-voice-part*.zip في story-index.json (دون استبدال القائم). الاستعمال: merge_lib.py <zip>..."""
import sys, json, zipfile, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ip = os.path.join(root, "story-index.json")
d = json.load(open(ip, encoding="utf-8"))
for z in sys.argv[1:]:
    zf = zipfile.ZipFile(z)
    add = json.loads(zf.read("index_add.json"))
    base = len(d["packs"])
    for p in add["packs"]:
        open(os.path.join(root, p), "wb").write(zf.read(p))
        d["packs"].append(p)
    n = 0
    for h, (pi, off, ln) in add["e"].items():
        if h in d["e"]: continue
        d["e"][h] = [base + pi, off, ln]; n += 1
    print(z, "+", n)
json.dump(d, open(ip, "w", encoding="utf-8"), separators=(",", ":"))
print("total", len(d["e"]), "packs", len(d["packs"]))
