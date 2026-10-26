#!/usr/bin/env python3
"""
promote.py: يرقّي معاينتي «أثر» (home-next.html و valley/next.html) إلى النسخة الحيّة.

  python3 next/release/promote.py --repo /home/claude/athar --dry-run   # يعرض ما سيتغيّر فقط
  python3 next/release/promote.py --repo /home/claude/athar --apply     # ينفّذ

ما يفعله (ولا يحذف شيئًا من next/ ولا من المعاينتين):
  1) home-next.html  -> index.html   (يُعاد تفعيل setupServiceWorker؛ زر الوادي يفتح valley/ تلقائيًا
                                       لأن world.js لا يعدّه معاينة خارج home-next.html أو ?preview=1)
  2) valley/next.html -> valley/index.html  (valley.css وvalley.js يُضمَّنان داخل الصفحة، HOME_URL=../index.html،
                                       كشف القدوم من الرئيسية بالـreferrer لنفس الأصل، preload لخط Rubik)
  3) sw.js الجذر: إضافة وحدات الرئيسية والصور والخطوط إلى CORE_ASSETS ورفع CACHE_VERSION v82 -> v83
  4) valley/sw.js: النسخة المقترحة (precache جزئي + خطوط) بمسارات الخطوط الفعلية ../next/assets/fonts
  5) نسخ احتياطية للملفات الأربعة في --backup (افتراضيًا /tmp/rc_bak) وتقرير نصّي بكل ملف غُيّر.
الأصول تبقى في مكانها (next/home/*, next/assets/fonts/*) وتُشير إليها الصفحات الحية بمسارات نسبية.
المراجعة قبل الكتابة: يتحقق السكربت أن كل أصل محلي مُشار إليه موجود وأن كل عنصر في precache موجود.
يرفض العمل إن بدا المستودع مُرقًّى سابقًا (إلا مع --force).
"""
import argparse, os, re, shutil, sys, hashlib, difflib

HOME_ASSETS_JS = ["world.js", "sky.js", "screens.js", "fx.js"]
HOME_ASSETS_CSS = ["world.css", "sky.css", "screens.css"]
HOME_IMGS = ["idle.webp", "hello.webp", "joy.webp", "think.webp"]
ROOT_FONTS = ["baloo-bhaijaan2-var.woff2", "tajawal-400.woff2", "tajawal-500.woff2", "tajawal-700.woff2",
              "tajawal-800.woff2", "amiri-quran.woff2", "salawat-noto.woff2"]
MARK = "ATHAR-PROMOTED-R8"


class Fail(Exception):
    pass


def rd(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def once(s, old, new, what):
    n = s.count(old)
    if n != 1:
        raise Fail("%s: المقطع المتوقع وُجد %d مرة (المطلوب 1)" % (what, n))
    return s.replace(old, new)


# ---------------------------------------------------------------- الرئيسية
def build_index(repo):
    s = rd(os.path.join(repo, "home-next.html"))
    s = once(s, "/* home-next: SW disabled in preview */", "setupServiceWorker();  /* " + MARK + " */", "تفعيل SW")
    if "SW disabled" in s or "disabled in preview" in s:
        raise Fail("ما زال في index.html أثر لتعطيل المعاينة")
    return s


# ---------------------------------------------------------------- الوادي
def build_valley(repo):
    s = rd(os.path.join(repo, "valley", "next.html"))
    css = rd(os.path.join(repo, "next", "valley", "valley.css"))
    js = rd(os.path.join(repo, "next", "valley", "valley.js"))
    if "</script" in js.lower() or "</style" in css.lower():
        raise Fail("valley.js/css يحتويان وسم إغلاق: لا يصح تضمينهما")
    if "url(" in css:
        raise Fail("valley.css فيه url() نسبية: لا يصح تضمينه دون تعديل المسارات")

    # أ) تضمين CSS وJS
    s = once(s, '<link rel="stylesheet" href="../next/valley/valley.css">',
             "<style id=\"vxCss\">\n" + css.rstrip() + "\n</style>", "تضمين valley.css")
    s = once(s, '<script src="../next/valley/valley.js"></script>',
             "<script id=\"vxJs\">\n" + js.rstrip() + "\n</script>", "تضمين valley.js")

    # ب) الوجهة إلى الرئيسية الحيّة
    s = once(s, 'var HOME_URL = "../home-next.html"', 'var HOME_URL = "../index.html"', "HOME_URL")

    # ج) كشف القدوم من الرئيسية: referrer لنفس الأصل وخارج /valley/ (بدل home-next)
    old = '/home-next/.test(document.referrer)'
    new = ('(function(){try{var r=new URL(document.referrer);return r.origin===location.origin&&r.pathname.indexOf("/valley/")<0}'
           'catch(e){return false}})()')
    s = once(s, old, new, "كشف القدوم من الرئيسية")

    # د) خط Rubik في preload (البوابة تحتاجه فورًا)
    pre = ('<link rel="preload" href="../next/assets/fonts/rubik-ar-lat-var.woff2" as="font" type="font/woff2" crossorigin>\n')
    s = once(s, '<style id="vxFonts">', pre + '<style id="vxFonts">', "preload Rubik")
    s = once(s, "/* خطوط محلية (لا شبكة): عند الدمج انقل next/assets/fonts إلى fonts/ وعدّل المسار */",
             "/* خطوط محلية (لا شبكة): المسارات إلى next/assets/fonts (تبقى كمصدر) */", "تعليق الخطوط")

    # هـ) لا بقايا معاينة
    for bad in ("home-next", "next.html"):
        if bad in s:
            # الاسم قد يرد في تعليقات؛ نسمح فقط إن لم يكن ضمن href/location
            for m in re.finditer(re.escape(bad), s):
                ctx = s[max(0, m.start() - 40): m.end() + 10]
                if re.search(r"(href|location|src|url)", ctx):
                    raise Fail("بقايا معاينة في valley/index.html: " + ctx.strip())
    return s


# ---------------------------------------------------------------- sw الجذر
def build_root_sw(repo):
    s = rd(os.path.join(repo, "sw.js"))
    if "const CACHE_VERSION = 'v82';" not in s:
        raise Fail("sw.js: CACHE_VERSION ليس v82 (هل رُقّي سابقًا؟)")
    s = once(s, "const CACHE_VERSION = 'v82';", "const CACHE_VERSION = 'v83';", "رفع CACHE_VERSION")
    items = (["./next/home/" + f for f in HOME_ASSETS_CSS] +
             ["./next/home/" + f for f in HOME_ASSETS_JS] +
             ["./next/home/img/" + f for f in HOME_IMGS] +
             ["./next/assets/fonts/" + f for f in ROOT_FONTS])
    for i in items:
        if not os.path.isfile(os.path.join(repo, i[2:])):
            raise Fail("أصل CORE_ASSETS غير موجود: " + i)
    block = ",\n  // [الرئيسية الجديدة r8] وحدات وصور أثر وخطوط محلية\n  " + ",\n  ".join("'%s'" % i for i in items)
    s = once(s, "  './t096.mp3'\n];", "  './t096.mp3'" + block + "\n];", "قائمة CORE_ASSETS")
    return s, items


# ---------------------------------------------------------------- sw الوادي
def build_valley_sw(repo):
    s = rd(os.path.join(repo, "next", "assets", "sw-valley.proposed.js"))
    s = once(s, '"./fonts/rubik-ar-lat-var.woff2", "./fonts/salawat-noto.woff2",',
             '"../next/assets/fonts/rubik-ar-lat-var.woff2", "../next/assets/fonts/salawat-noto.woff2",',
             "مسارات خطوط الوادي في precache")
    # رفع رقم الكاش (الحالي الحي v10-r4؛ المقترح v11-assets)؛ نضيف r8 لتمييز هذه الترقية
    s = once(s, 'const CACHE = "athar-shell-v11-assets";', 'const CACHE = "athar-shell-v12-r8";', "رقم كاش الصدفة")
    return s


def precache_files_exist(repo, sw_text, base):
    miss = []
    m = re.search(r"const PRECACHE = \[(.*?)\];", sw_text, re.S)
    for u in re.findall(r'"([^"]+)"', m.group(1)):
        p = os.path.normpath(os.path.join(repo, base, u))
        if not os.path.isfile(p):
            miss.append(u)
    return miss


def local_refs_missing(repo, html_rel, txt):
    """كل src/href/url() محلي في نص الصفحة المقترحة يجب أن يوجد (يُحسب نسبةً لمجلد الصفحة؛ لا كتابة)."""
    base = os.path.dirname(os.path.join(repo, html_rel))
    refs = set(re.findall(r'(?:src|href)="([^"#:]+?)(?:\?[^"]*)?"', txt))
    refs |= set(re.findall(r'url\("?([^")#:]+?\.(?:woff2|webp|png|jpg|svg))', txt))
    miss = []
    for r in sorted(refs):
        if r.startswith(("http", "//", "data:", "mailto")):
            continue
        if re.search(r"[\s+'\"{}$]", r):
            continue   # تركيب نصّي ديناميكي داخل JS
        if r.endswith("/") or r in ("", "."):
            continue
        if not os.path.exists(os.path.normpath(os.path.join(base, r))):
            miss.append(r)
    return miss


def summarize(old, new):
    a, b = old.splitlines(), new.splitlines()
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    add = dele = 0
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag != "equal":
            dele += i2 - i1
            add += j2 - j1
    return add, dele


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", required=True)
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--dry-run", action="store_true")
    g.add_argument("--apply", action="store_true")
    ap.add_argument("--backup", default="/tmp/rc_bak")
    ap.add_argument("--force", action="store_true", help="تجاوز فحص «رُقّي سابقًا»")
    ap.add_argument("--report", default=None, help="مسار التقرير (افتراضيًا <backup>/promote_report.txt)")
    a = ap.parse_args()
    repo = os.path.abspath(a.repo)

    for need in ("home-next.html", "valley/next.html", "sw.js", "valley/sw.js", "index.html", "valley/index.html",
                 "next/valley/valley.js", "next/valley/valley.css", "next/assets/sw-valley.proposed.js"):
        if not os.path.isfile(os.path.join(repo, need)):
            sys.exit("ملف ناقص: " + need)
    if not a.force and MARK in rd(os.path.join(repo, "index.html")):
        sys.exit("المستودع يبدو مُرقًّى سابقًا (%s). استعمل --force لإعادة التطبيق." % MARK)

    try:
        out = {
            "index.html": build_index(repo),
            "valley/index.html": build_valley(repo),
        }
        out["sw.js"], root_items = build_root_sw(repo)
        out["valley/sw.js"] = build_valley_sw(repo)
    except Fail as e:
        sys.exit("فشل: %s" % e)

    # فحوص قبل الكتابة
    problems = []
    problems += ["valley/sw.js precache ناقص: " + m for m in precache_files_exist(repo, out["valley/sw.js"], "valley")]
    # فحص مراجع الصفحتين المقترحتين في الذاكرة (بلا أي كتابة قبل --apply)
    for rel, txt in (("index.html", out["index.html"]), ("valley/index.html", out["valley/index.html"])):
        for m in local_refs_missing(repo, rel, txt):
            problems.append("%s يشير إلى ملف غير موجود: %s" % (rel, m))
    # ملفات CSS الخارجية للرئيسية: مراجعها (لا url محلية متوقعة، نتحقق فقط)
    for c in HOME_ASSETS_CSS:
        t = rd(os.path.join(repo, "next/home", c))
        for r in re.findall(r"url\(\s*['\"]?([^)'\"#]+)", t):
            if r.startswith(("data:", "http", "#")):
                continue
            if not os.path.exists(os.path.normpath(os.path.join(repo, "next/home", r))):
                problems.append("next/home/%s يشير إلى %s غير موجود" % (c, r))
    if problems:
        sys.exit("توقف قبل الكتابة:\n  " + "\n  ".join(problems))

    lines = ["تقرير الترقية  (%s)  repo=%s" % ("تجربة بلا كتابة" if a.dry_run else "تطبيق", repo), ""]
    for rel, new in out.items():
        old = rd(os.path.join(repo, rel))
        add, dele = summarize(old, new)
        lines.append("%-20s  +%d -%d سطر | %d -> %d بايت | sha1 %s -> %s" % (
            rel, add, dele, len(old.encode()), len(new.encode()),
            hashlib.sha1(old.encode()).hexdigest()[:8], hashlib.sha1(new.encode()).hexdigest()[:8]))
    lines += ["", "CORE_ASSETS المضافة (%d):" % len(root_items)] + ["  " + i for i in root_items]
    lines += ["", "لا تُحذف مجلدات next/ ولا home-next.html ولا valley/next.html (تبقى معاينةً ومصدرًا)."]

    if a.apply:
        os.makedirs(a.backup, exist_ok=True)
        for rel in out:
            bp = os.path.join(a.backup, rel)
            os.makedirs(os.path.dirname(bp), exist_ok=True)
            shutil.copy2(os.path.join(repo, rel), bp)
        for rel, new in out.items():
            with open(os.path.join(repo, rel), "w", encoding="utf-8", newline="") as f:
                f.write(new)
        lines += ["", "نسخ احتياطية في: " + a.backup,
                  "للتراجع: for f in index.html valley/index.html sw.js valley/sw.js; do cp %s/$f %s/$f; done" % (a.backup, repo)]
        rp = a.report or os.path.join(a.backup, "promote_report.txt")
        with open(rp, "w", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")
        lines.append("التقرير: " + rp)
    print("\n".join(lines))


if __name__ == "__main__":
    main()
