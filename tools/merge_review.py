#!/usr/bin/env python3
"""دمج zips صفحات المراجعة (athar-libfixNN-voice-*.zip) في story-index.json مع استبدال المدخلات. الاستعمال: merge_review.py <zip>..."""
import sys, json, zipfile, os, re, subprocess, tempfile, shutil
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ip = os.path.join(root, "story-index.json")
d = json.load(open(ip, encoding="utf-8"))
for z in sys.argv[1:]:
    nm = re.search(r"athar-(libfix\d+)-voice", os.path.basename(z))
    tag = nm.group(1) if nm else re.sub(r"\W", "", os.path.basename(z))[:20]
    zf = zipfile.ZipFile(z); meta = json.loads(zf.read("usul-index.json")); pn = "sp_%s.bin" % tag
    raw = zf.read("sp_usul.bin"); out = bytearray(); ne = {}
    tmp = tempfile.mkdtemp()
    for h, (_, off, ln) in meta["e"].items():
        # إعادة ترميز إلى ٢٢٫٠٥ كيلو هرتز أحادي ٣٢ كيلوبت (كباقي حزم المكتبة) لتصغير الحجم
        a, b = os.path.join(tmp, "a.mp3"), os.path.join(tmp, "b.mp3")
        open(a, "wb").write(raw[off:off + ln])
        r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", a, "-ac", "1", "-ar", "22050", "-b:a", "32k", b])
        data = open(b, "rb").read() if r.returncode == 0 else raw[off:off + ln]
        ne[h] = [0, len(out), len(data)]; out += data
    shutil.rmtree(tmp)
    open(os.path.join(root, pn), "wb").write(bytes(out))
    if pn not in d["packs"]: d["packs"].append(pn)
    pi = d["packs"].index(pn)
    for h, (_, off, ln) in ne.items(): d["e"][h] = [pi, off, ln]
    print(z, "->", pn, len(meta["e"]), "lines")
json.dump(d, open(ip, "w", encoding="utf-8"), separators=(",", ":"))
