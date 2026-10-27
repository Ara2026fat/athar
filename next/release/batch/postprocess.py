#!/usr/bin/env python3
"""Post-process downloaded Higgsfield outputs into the final webp assets.

  python3 postprocess.py --in DOWNLOADS_DIR [--root /home/claude/athar] [--only map_day,S2] [--dry-run] [--out-root DIR]

Input files are matched by stem to manifest ids: map_day.png, map_sun.jpg, map_night.png, door_hifz.png, S2.png ... S12.png
(any of png/jpg/jpeg/webp). Writes to the manifest target paths under --root (or --out-root for a safe trial).

Background removal: generation uses a flat #7B2FF7 (violet) background, so the default is a deterministic magenta key
(flood-fill from the image border + soft edge + despill). Only background-connected magenta is removed, so pink/purple parts of
the object survive. `--rembg` switches to rembg if it is installed (pip install rembg); otherwise the magenta key is the documented fallback.
"""
import argparse, glob, io, json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
BUDGET = {"map": 250, "door": 60, "mark": 40}

def find_input(d, stem):
    for ext in ("png", "jpg", "jpeg", "webp", "PNG", "JPG"):
        p = os.path.join(d, stem + "." + ext)
        if os.path.exists(p):
            return p
    g = sorted(glob.glob(os.path.join(d, stem + "*")))
    return g[0] if g else None

STRONG = False   # --strong-despill: cut the violet halo around glowing marks
KEY = (123, 47, 247)   # flat violet #7B2FF7 background (owner asked for no pink)

def key_magenta(im, hard=70.0, soft=150.0, use_rembg=False):
    """RGBA with the border-connected magenta background removed."""
    im = im.convert("RGB")
    if use_rembg:
        try:
            from rembg import remove
            return remove(im).convert("RGBA")
        except Exception as e:
            print("  rembg unavailable (%s) -> magenta key" % e)
    a = np.asarray(im).astype(np.float32)
    d = np.sqrt((a[..., 0] - KEY[0]) ** 2 + (a[..., 1] - KEY[1]) ** 2 + (a[..., 2] - KEY[2]) ** 2)
    cand = d < soft
    lab, n = ndi.label(cand)
    border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    border = border[border > 0]
    bgc = np.isin(lab, border)                       # candidate pixels connected to the border
    # enclosed pockets (arch openings, scale pans): strongly-magenta regions not touching the border are background too
    sl, sn = ndi.label(d < hard)
    if sn:
        area = ndi.sum(np.ones_like(sl), sl, index=np.arange(1, sn + 1))
        keep = np.isin(sl, np.where(area >= 25)[0] + 1)
        grow = ndi.binary_dilation(keep, iterations=3) & cand
        bgc = bgc | (ndi.binary_propagation(keep, mask=cand) if False else grow) | keep
    core = bgc & (d < hard)                          # definitely background
    alpha = np.ones(d.shape, np.float32)
    ramp = np.clip((d - hard) / (soft - hard), 0, 1)
    alpha[bgc] = ramp[bgc]
    alpha[core] = 0
    # despill: pull magenta out of semi-transparent edge pixels
    edge = bgc & (alpha > 0) & (alpha < 1)
    r, g, b = a[..., 0].copy(), a[..., 1], a[..., 2].copy()
    lim = np.maximum(g, 0) + 20
    r[edge] = np.minimum(r[edge], lim[edge]); b[edge] = np.minimum(b[edge], lim[edge])
    out = np.dstack([r, g, b, alpha * 255]).clip(0, 255).astype(np.uint8)
    # a 1px erosion of alpha removes the last halo
    al = ndi.grey_erosion(out[..., 3], size=(2, 2))
    out[..., 3] = al
    if STRONG:
        # glow halos are generated blended with the violet background: replace the colour of every semi-transparent pixel
        # with the colour of the nearest solid pixel, and tighten the alpha ramp so the halo fades out sooner.
        alpha = out[..., 3].astype(np.float32) / 255.0
        # violet-tinted halo pixels (blue clearly above green, red above green) are background bleed: fade them out by tint
        rf, gf, bf = (out[..., i].astype(np.float32) for i in range(3))
        tint = np.clip(((bf - gf) - 8.0) / 28.0, 0, 1) * (rf > gf - 6)
        alpha = alpha * (1.0 - tint)
        solid = alpha >= 0.98
        if solid.any():
            _, (iy, ix) = ndi.distance_transform_edt(~solid, return_indices=True)
            semi = alpha < 0.98
            for c in range(3):
                ch = out[..., c]
                ch[semi] = ch[iy[semi], ix[semi]]
        out[..., 3] = (np.clip((alpha - 0.40) / 0.60, 0, 1) * 255).astype(np.uint8)
    return Image.fromarray(out, "RGBA")

def trim(im, pad_frac=0.04, thr=12):
    al = np.asarray(im.split()[-1])
    ys, xs = np.where(al > thr)
    if len(xs) == 0:
        return im
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    c = im.crop(box)
    p = int(max(c.size) * pad_frac)
    out = Image.new("RGBA", (c.width + 2 * p, c.height + 2 * p), (0, 0, 0, 0))
    out.paste(c, (p, p))
    return out

def save_webp(im, path, budget_kb, q_hi=88, q_lo=40, lossless_try=False, dry=False):
    """Largest quality that fits the budget; if even q_lo does not fit, downscale 8% and retry."""
    cur = im
    for _ in range(12):
        for q in range(q_hi, q_lo - 1, -4):
            buf = io.BytesIO()
            cur.save(buf, "WEBP", quality=q, method=6, alpha_quality=min(q + 8, 100))
            if buf.tell() <= budget_kb * 1024:
                if not dry:
                    os.makedirs(os.path.dirname(path), exist_ok=True)
                    open(path, "wb").write(buf.getvalue())
                return dict(path=path, kb=round(buf.tell() / 1024, 1), q=q, size=list(cur.size), ok=True)
        cur = cur.resize((int(cur.width * .92), int(cur.height * .92)), Image.LANCZOS)
    return dict(path=path, ok=False, size=list(cur.size))

def cover(im, w, h):
    s = max(w / im.width, h / im.height)
    r = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x, y = (r.width - w) // 2, (r.height - h) // 2
    return r.crop((x, y, x + w, y + h))

def fit(im, longest):
    s = longest / max(im.size)
    return im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS) if s < 1 else im

def do_map(it, src, root, a):
    im = Image.open(src).convert("RGB")
    w, h = it["final_px"]
    if abs(im.width / im.height - 9 / 16) > 0.01:
        print("  note: source aspect %.3f != 9:16, center-cropping" % (im.width / im.height))
    out = cover(im, w, h)
    return [save_webp(out, os.path.join(root, it["target"]), BUDGET["map"], dry=a.dry_run)]

def do_door(it, src, root, a):
    im = key_magenta(Image.open(src), use_rembg=a.rembg)
    im = trim(im, 0.03)
    W, H = it["final_px"]
    s = min(W * .94 / im.width, H * .94 / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    cv = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cv.paste(im, ((W - im.width) // 2, H - im.height - round(H * .02)), im)   # bottom-aligned like .d3 object-position
    return [save_webp(cv, os.path.join(root, it["target"]), BUDGET["door"], dry=a.dry_run)]

def do_sheet(it, src, root, a):
    im = key_magenta(Image.open(src), use_rembg=a.rembg)
    W, H = im.size
    al = np.asarray(im.split()[-1]) > 24
    k = max(3, int(W * 0.012))
    merged = ndi.binary_dilation(al, structure=np.ones((3, 3)), iterations=k)   # glue pieces of one object (rainbow, stones)
    lab, n = ndi.label(merged)
    objs = ndi.find_objects(lab)
    min_area = W * H * 0.002
    groups = []
    for i, sl in enumerate(objs, 1):
        area = int(((lab[sl] == i) & al[sl]).sum())
        if area >= min_area:
            cy = (sl[0].start + sl[0].stop) / 2; cx = (sl[1].start + sl[1].stop) / 2
            groups.append((cx, cy, sl, i))
    cells = {}
    for cx, cy, sl, i in groups:
        c = min(2, int(cx / (W / 3))); r = min(1, int(cy / (H / 2)))
        cells.setdefault((r, c), []).append(sl)
    res = []
    arr = np.asarray(im)
    for spec in it["cells"]:
        key = (spec["row"], spec["col"])
        sls = cells.get(key)
        if not sls:
            res.append(dict(path=spec["target"], ok=False, error="cell %s empty - regenerate sheet" % (key,)))
            continue
        y0 = min(s[0].start for s in sls); y1 = max(s[0].stop for s in sls)
        x0 = min(s[1].start for s in sls); x1 = max(s[1].stop for s in sls)
        crop = Image.fromarray(arr[y0:y1, x0:x1].copy(), "RGBA")
        # drop alpha from neighbours that leaked into the dilated box
        crop = fit(trim(crop, 0.04), 256)
        r_ = save_webp(crop, os.path.join(root, spec["target"]), BUDGET["mark"], dry=a.dry_run)
        if len(sls) > 1:
            r_["warn"] = "%d separate pieces merged in cell" % len(sls)
        res.append(r_)
    extra = len(groups) - sum(len(v) for v in cells.values())
    return res

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp", required=True)
    ap.add_argument("--root", default=os.path.abspath(os.path.join(HERE, "..", "..", "..")))
    ap.add_argument("--out-root", default=None, help="write here instead of --root (trial runs)")
    ap.add_argument("--manifest", default=os.path.join(HERE, "batch_manifest.json"))
    ap.add_argument("--only", default="")
    ap.add_argument("--rembg", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--strong-despill", action="store_true", help="stronger violet-halo removal (glow marks: use with --only S12)")
    a = ap.parse_args()
    global STRONG
    STRONG = a.strong_despill
    man = json.load(open(a.manifest))
    only = set(filter(None, a.only.split(",")))
    root = a.out_root or a.root
    report, missing = [], []
    for it in man["items"]:
        if it.get("kind") == "existing" or (only and it["id"] not in only):
            continue
        src = find_input(a.inp, it["id"])
        if not src:
            missing.append(it["id"]); continue
        print("%s <- %s" % (it["id"], os.path.basename(src)))
        fn = dict(map=do_map, door=do_door, sheet=do_sheet)[it["kind"]]
        for r in fn(it, src, root, a):
            r["id"] = it["id"]; report.append(r)
            print("   ", {k: v for k, v in r.items() if k != "id"})
    bad = [r for r in report if not r.get("ok")]
    print("\nwritten: %d  failed: %d  inputs missing: %s" % (len(report) - len(bad), len(bad), ",".join(missing) or "-"))
    json.dump(dict(report=report, missing=missing), open(os.path.join(a.inp, "postprocess_report.json"), "w"), indent=1) if os.access(a.inp, os.W_OK) else None
    sys.exit(1 if bad else 0)

if __name__ == "__main__":
    main()
