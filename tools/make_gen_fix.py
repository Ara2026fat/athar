#!/usr/bin/env python3
"""يبني tools/gen_fix.html: إعادة توليد جمل المكتبة التي فيها كلمات ملتبسة النطق، بتشكيل انتقائي في نص التوليد فقط (الظاهر والمفتاح لا يتغيران)."""
import re, json, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(root, "tools/gen_lib.html"), encoding="utf-8").read()
U = json.loads(re.search(r"const UNITS=(\[.*?\]);\nconst \$", src, re.S).group(1))
PHR = [  # عبارات أولًا (الأطول أولًا)
 ("صلى الله عليه وسلم", "صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ"),
 ("رضي الله عنهما", "رَضِيَ اللهُ عَنْهُمَا"), ("رضي الله عنهم", "رَضِيَ اللهُ عَنْهُمْ"),
 ("رضي الله عنها", "رَضِيَ اللهُ عَنْهَا"), ("رضي الله عنه", "رَضِيَ اللهُ عَنْهُ"),
 ("عليه السلام", "عَلَيْهِ السَّلَامُ"), ("عليهم السلام", "عَلَيْهِمُ السَّلَامُ"),
 ("أبو بكر", "أَبُو بَكْرٍ"), ("أبي بكر", "أَبِي بَكْرٍ"),
]
W = {  # فقط الكلمات التي يُخطئ فيها النطق غالبًا (قلّلنا العدد لتوفير الرصيد)
 "أمرنا":"أَمَرَنَا","وصف":"وَصَفَ","عمر":"عُمَرُ","الوضوء":"الْوُضُوءِ","نعمة":"نِعْمَةٌ","رحمة":"رَحْمَةٌ",
 "قصة":"قِصَّةُ","العلم":"الْعِلْمُ","جعل":"جَعَلَ","دعا":"دَعَا",
}
HK = re.compile(r"[ً-ْ]")
def fix(t):
    x = t
    for a, b in PHR: x = x.replace(a, b) if a in x else x
    def w(m):
        k = m.group(0)
        return W.get(k, k)
    x = re.sub(r"(?<![ء-ْ])[ء-ي]+(?![ء-ْ])", w, x)
    return x
FIX = []
for u in U:
    x = fix(u["t"])
    if x != u["t"]: FIX.append({"t": u["t"], "x": x, "b": u["b"]})
ch0 = sum(len(u["t"]) for u in FIX); ch1 = sum(len(u["x"]) for u in FIX)
print("units", len(FIX), "of", len(U), "chars", ch0, "->", ch1)
h = src
h = re.sub(r"const UNITS=\[.*?\];\nconst \$", lambda m: "const UNITS=" + json.dumps(FIX, ensure_ascii=False, separators=(",", ":")) + ";\nconst $", h, count=1, flags=re.S)
h = h.replace("<title>أثر — توليد أصوات المكتبة</title>", "<title>أثر — تصحيح نطق المكتبة</title>")
h = h.replace("<h1>توليد أصوات المكتبة (صوت أثر)</h1>", "<h1>تصحيح نطق المكتبة — كتاب بعد كتاب</h1>")
h = h.replace('"athar-gen-lib"', '"athar-gen-libfix"')
h = h.replace('"sp_lb_"+k', '"sp_fx_"+k').replace('athar-lib-voice-part', 'athar-libfix-part')
# كل كتاب دفعة مستقلة
h = re.sub(r"const BT=\[\];\{.*?\}\n", 'const BT=[];{const m={};UNITS.forEach(u=>{(m[u.b]=m[u.b]||[]).push(u)});Object.keys(m).forEach(k=>BT.push(m[k]))}\n', h, count=1, flags=re.S)
h = h.replace("const b=await tts(u.t,slotOf(u))", "const b=await tts(u.x,slotOf(u))")
h = h.replace("reduce((a,u)=>a+u.t.length,0)", "reduce((a,u)=>a+u.x.length,0)")
h = h.replace('"<b>دفعة "+nAr(gi+1)+"</b>', '"<b>"+(TITLES[g[0].b]||g[0].b)+"</b>')
open(os.path.join(root, "tools/gen_fix.html"), "w", encoding="utf-8").write(h)
