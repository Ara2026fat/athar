#!/usr/bin/env python3
"""tools/release.py - safe, consistent release helper (stdlib only).

What it does (run from anywhere; paths are relative to the repo root):
  1. For every local file referenced with ?v=... in index.html, computes a
     content hash and rewrites the ?v= value ONLY if the content changed
     (value = first 10 hex chars of sha1 of the file bytes).
  2. Keeps tools/release-state.json (digest of every cached asset). If the
     digest of CORE_ASSETS + ?v= files + index.html differs from the stored
     one, CACHE_VERSION in sw.js is bumped by exactly +1.
  3. Verifies every path in CORE_ASSETS exists, and warns about local files
     loaded by index.html (script/link/img src) that are not in CORE_ASSETS.

Usage:
  python3 tools/release.py           apply changes
  python3 tools/release.py --check   report only, modify nothing (exit 1 if
                                     anything would change or a path is missing)
"""
import hashlib, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, "index.html")
SW = os.path.join(ROOT, "sw.js")
STATE = os.path.join(ROOT, "tools", "release-state.json")

# src/href attributes pointing to local files (optionally with ?v=)
REF = re.compile(r'''(?P<pre>\b(?:src|href)\s*=\s*["'])(?P<path>[^"'#?]+?)(?P<q>\?v=[^"'#]*)?(?P<post>["'])''', re.I)
CHECK_EXT = re.compile(r"\.(js|css|json|png|jpe?g|svg|webp|ico|woff2?|mp3|html)$", re.I)


def read(p, mode="r"):
    with open(p, mode, **({} if "b" in mode else {"encoding": "utf-8"})) as f:
        return f.read()


def is_local(path):
    return not re.match(r"^(?:[a-z][a-z0-9+.-]*:|//|data:|javascript:|mailto:)", path, re.I)


def norm(path):
    return os.path.normpath(path.lstrip("./") if path.startswith("./") else path).replace(os.sep, "/")


def file_hash(rel):
    return hashlib.sha1(read(os.path.join(ROOT, rel), "rb")).hexdigest()


def core_assets(sw_text):
    m = re.search(r"const\s+CORE_ASSETS\s*=\s*\[(.*?)\];", sw_text, re.S)
    if not m:
        sys.exit("ERROR: CORE_ASSETS not found in sw.js")
    return [norm(x) for x in re.findall(r"['\"]([^'\"]+)['\"]", m.group(1))]


def main():
    check = "--check" in sys.argv[1:]
    html = read(INDEX)
    sw = read(SW)
    problems, notes = [], []

    # ---- 1) ?v= refresh --------------------------------------------------
    changed = []

    def repl(m):
        path, q = m.group("path"), m.group("q")
        if not q or not is_local(path):
            return m.group(0)
        rel = norm(path)
        full = os.path.join(ROOT, rel)
        if not os.path.isfile(full):
            problems.append("MISSING file referenced by index.html: " + rel)
            return m.group(0)
        new_q = "?v=" + file_hash(rel)[:10]
        if new_q != q:
            changed.append((rel, q[3:], new_q[3:]))
        return m.group("pre") + path + new_q + m.group("post")

    new_html = REF.sub(repl, html)

    # ---- 3) consistency checks ------------------------------------------
    core = core_assets(sw)
    for a in core:
        if not os.path.isfile(os.path.join(ROOT, a)):
            problems.append("CORE_ASSETS path does not exist: " + a)
    core_set = set(core)
    loaded = []
    for m in REF.finditer(new_html):
        p = m.group("path")
        if is_local(p) and CHECK_EXT.search(p):
            # skip plain navigation anchors to pages (only assets matter)
            tag_start = new_html.rfind("<", 0, m.start())
            tag = new_html[tag_start:tag_start + 12].lower()
            if tag.startswith("<a ") or tag.startswith("<a\n"):
                continue
            rel = norm(p)
            if rel not in loaded:
                loaded.append(rel)
            if not os.path.isfile(os.path.join(ROOT, rel)):
                msg = "MISSING file referenced by index.html: " + rel
                if msg not in problems:
                    problems.append(msg)
    unlisted = [x for x in loaded if x not in core_set and os.path.isfile(os.path.join(ROOT, x))]

    # ---- 2) cache digest / CACHE_VERSION --------------------------------
    vfiles = sorted({norm(m.group("path")) for m in REF.finditer(new_html)
                     if m.group("q") and is_local(m.group("path")) and os.path.isfile(os.path.join(ROOT, norm(m.group("path"))))})
    cached = sorted(set(core) | set(vfiles) | {"index.html"})
    h = hashlib.sha1()
    for rel in cached:
        if rel == "index.html":
            h.update(b"index.html\0" + new_html.encode("utf-8"))
        elif os.path.isfile(os.path.join(ROOT, rel)):
            h.update(rel.encode() + b"\0" + read(os.path.join(ROOT, rel), "rb"))
    digest = h.hexdigest()
    try:
        old = json.loads(read(STATE)).get("digest")
    except Exception:
        old = None
    mv = re.search(r"const\s+CACHE_VERSION\s*=\s*'v(\d+)'", sw)
    if not mv:
        sys.exit("ERROR: CACHE_VERSION not found in sw.js")
    cur = int(mv.group(1))
    bump = old != digest
    if old is None and not changed:
        # first run with no baseline and nothing rewritten: record only
        bump = False
    new_ver = cur + 1 if bump else cur

    # ---- report ----------------------------------------------------------
    print("?v= updates: %d" % len(changed))
    for rel, a, b in changed:
        print("  %s  %s -> %s" % (rel, a, b))
    print("cached assets tracked: %d (CORE_ASSETS %d, ?v= files %d, union incl. index.html)" % (len(cached), len(core), len(vfiles)))
    print("CACHE_VERSION: v%d%s" % (cur, (" -> v%d" % new_ver) if bump else " (unchanged)"))
    if unlisted:
        print("WARNING: local files loaded by index.html but NOT in CORE_ASSETS (%d):" % len(unlisted))
        for x in unlisted:
            print("  - " + x)
    for p in problems:
        print("ERROR: " + p)

    if check:
        print("--check: no files modified")
        sys.exit(1 if (problems or changed or bump) else 0)

    if new_html != html:
        with open(INDEX, "w", encoding="utf-8", newline="") as f:
            f.write(new_html)
    if bump:
        sw2 = re.sub(r"(const\s+CACHE_VERSION\s*=\s*')v\d+(')", r"\g<1>v%d\2" % new_ver, sw, count=1)
        with open(SW, "w", encoding="utf-8", newline="") as f:
            f.write(sw2)
    with open(STATE, "w", encoding="utf-8") as f:
        json.dump({"digest": digest, "cache_version": new_ver, "files": len(cached)}, f, indent=1)
        f.write("\n")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
