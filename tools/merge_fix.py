#!/usr/bin/env python3
"""دمج zips التصحيح (athar-libfix-*.zip) في story-index.json مع **استبدال** المدخلات القائمة. الاستعمال: merge_fix.py <zip>..."""
import sys, json, zipfile, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ip = os.path.join(root, "story-index.json")
d = json.load(open(ip, encoding="utf-8"))
for z in sys.argv[1:]:
    zf = zipfile.ZipFile(z); add = json.loads(zf.read("index_add.json")); base = len(d["packs"]); n = 0
    for p in add["packs"]:
        open(os.path.join(root, p), "wb").write(zf.read(p))
        if p not in d["packs"]: d["packs"].append(p)
    for h, (pi, off, ln) in add["e"].items():
        d["e"][h] = [d["packs"].index(add["packs"][pi]), off, ln]; n += 1
    print(z, "replaced/added", n)
json.dump(d, open(ip, "w", encoding="utf-8"), separators=(",", ":"))
