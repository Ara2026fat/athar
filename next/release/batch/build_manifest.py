#!/usr/bin/env python3
"""Builds batch_manifest.json (+ m3_patch.json) for the single-session Higgsfield run.
Prepare-only: this script never calls Higgsfield. Run:  python3 build_manifest.py
Inputs (read-only): /tmp/mk/prompts.json, /tmp/mk/marks.json, /tmp/next/r14_prompts.json, ../map_prompts.json
"""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
REL = os.path.dirname(HERE)
def load(p, fb):
    for c in (p, fb):
        if c and os.path.exists(c):
            return json.load(open(c))
    sys.exit("missing " + p)
MK = load("/tmp/mk/prompts.json", None)
MARKS = {m["id"]: m for m in load("/tmp/mk/marks.json", None)}
DOORS = load("/tmp/next/r14_prompts.json", None)
MAP = load(os.path.join(REL, "map_prompts.json"), "/tmp/next/r13_prompts.json")

MODEL = {"name": "seedream_v5_pro", "label": "Seedream 5.0 Pro", "resolution": "2K", "credits_each": 2.5,
         "fallback": "gpt_image_2_5 (r14 alternative) / nano_banana_pro (edits)",
         "note": "Used before for the approved mark sheets (r12). Confirm live price with models_explore before the run."}

RULES = ("HARD CONTENT RULES: absolutely no people, no humans, no hands, no animals, no birds, no insects, no fish, no faces "
         "(not even on the sun, moon, clouds, stars or objects), no text, no letters, no numerals, no calligraphy, no symbols that look like writing, "
         "no logos, no watermark, no brand or known cartoon characters. Calm, warm, child-friendly palette (soft golds, leaf greens, cream, "
         "sky blue, gentle terracotta), never scary, never dark or harsh.")
NEG = ["people", "humans", "hands", "animals", "birds", "insects", "faces", "text", "letters", "numerals", "calligraphy",
       "logo", "watermark", "brand characters", "harsh shadows", "photorealistic", "scary mood"]

# --- marks: sheets of 6 (3 cols x 2 rows). cell = (file stem, [mark ids served], object prompt) -------------------------
SHEETS = {
 "S2":  [("mBeacon", [], "a small wooden lamp-post with a glowing arched amber lantern on top"),
         ("mShield", [], "a green leaf-shaped shield with a soft cream stripe"),
         ("mMinbar", [], "a small wooden three-step pulpit staircase in warm brown wood"),
         ("mSeal", [], "a round red wax seal with a raised ring edge, completely blank and smooth"),
         ("mCave", [], "a small rocky cave opening with a dark warm glowing inside"),
         ("mTwoPaths", [], "a wooden signpost with two blank arrow boards pointing left and right")],
 "S3":  [("mWindmill", [], "a colourful pinwheel on a wooden stick"),
         ("mSeat", ["mMat"], "a plush maroon prayer cushion with a gold trim"),
         ("mPrism", [], "a clear glass prism casting a small rainbow"),
         ("mLampBook", [], "an open book with blank cream pages and a warm glow above it"),
         ("mCalendar", [], "a small wall calendar with a red top and two coloured dots, no digits"),
         ("mCoin", [], "a round gold coin with an embossed plain ring, no inscription")],
 "S6":  [("mGrain", [], "a single plump wheat grain seed"),
         ("mPurse", [], "a small brown leather coin pouch tied with a cord"),
         ("mRope", [], "a coil of thick rope"),
         ("mBell", [], "a small brass bell with a handle"),
         ("mCrack", [], "a smooth round clay pot with one gentle zigzag crack down its side"),
         ("mTorch", [], "a wooden torch with a warm flame")],
 "S7":  [("mVeil", [], "a sheer light-blue and white silk scarf draped in a gentle arch"),
         ("mTwoTrees", [], "two small round green trees side by side"),
         ("mGem", [], "a faceted blue gemstone"),
         ("mDates", [], "a wooden bowl full of brown dates"),
         ("mCaravan", [], "a small cream canvas tent with a pointed top"),
         ("mBowl", [], "a ceramic bowl of creamy porridge topped with a red and a green garnish")],
 "S9":  [("mChest", [], "a wooden treasure chest with brass fittings"),
         ("mCrescent", [], "a golden crescent ring shape, plain and smooth"),
         ("mJug", [], "a clay water jug with a handle"),
         ("mRainbow", [], "a soft pastel rainbow arc"),
         ("mSteps", [], "a short trail of five smooth cream stepping stones"),
         ("mLanterns", [], "a small hanging brass lantern with a warm glowing light")],
 "S10": [("mKaaba", [], "a simple black cube building draped in dark cloth with one plain golden band near the top, no writing, no door details, no people"),
         ("mQuiet", [], "a soft fluffy white cloud, completely plain"),
         ("mPath", [], "a short curved piece of sandy cream path"),
         ("mCloak", [], "a folded green cloth cloak"),
         ("mClosedLips", [], "a small brass padlock (symbol of keeping silent; no lips, no face)"),
         ("mMinaret", [], "a slender cream minaret tower with a green cap and a golden ball finial")],
 "S11": [("mBook", [], "a closed cream-and-teal book with a ribbon bookmark and a plain blank cover"),
         ("mWords", [], "a rolled cream scroll tied with a red ribbon, blank"),
         ("mLetters", [], "three chunky rounded wooden toy blocks stacked, faces completely blank and smooth"),
         ("moon", [], "a plain smooth golden crescent moon with a few tiny stars, no face"),
         ("mStarsFour", [], "four glossy golden five-point stars of different sizes in a loose cluster, no faces"),
         ("mFiveLights", [], "five small glowing golden orbs of light in a gentle arc, no faces")],
 "S12": [("mSix", [], "six small glowing golden orbs of light in two rows of three, no faces"),
         ("mSeven", [], "seven small glowing golden orbs of light in a gentle arch, no faces"),
         ("mCore", [], "one large glowing golden orb of light with a soft inner core"),
         ("mGlow", [], "a soft round warm-white glowing light orb with gentle rays"),
         ("mDawn", [], "a golden half-sun rising over a small green hill with soft rays, no face"),
         ("mSunUp", ["mSunrise"], "a golden sun disc with soft rays just above a flat horizon line, no face")],
}
PILOT_SHEETS = ["S2", "S12"]
PREFIX = re.sub(r"Objects:.*$", "", MK["2"], flags=re.S).strip()
assert "magenta" in PREFIX

def sheet_prompt(cells):
    objs = " ".join("(%d) %s," % (i + 1, c[2]) for i, c in enumerate(cells)).rstrip(",") + "."
    return PREFIX + " Objects: " + objs + " " + RULES

# --- doors ----------------------------------------------------------------------------------------------------------------
DOOR_ORDER = ["hifz", "noor", "lib", "math", "adhkar", "quiz"]
PILOT_DOOR = "hifz"

# --- map ------------------------------------------------------------------------------------------------------------------
HIT = {"masjid": [266, 293, 112, 110], "hill": [138, 322, 160, 88], "home": [10, 334, 172, 157],
       "spring": [0, 480, 400, 116], "road": [236, 409, 152, 311]}
def pct(r):
    x, y, w, h = r  # image rect is 405x720 inside viewBox 400x720
    return "x %d-%d%%, y %d-%d%%" % (round(100 * x / 405), round(100 * min(x + w, 405) / 405), round(100 * y / 720), round(100 * (y + h) / 720))
LAYOUT = ("LANDMARK PLACEMENT (percent of image width / height from the top-left corner) - keep these exact areas: "
          "cream green-domed mosque with minaret at " + pct(HIT["masjid"]) + " (right side, upper-middle); "
          "green rounded hill with ONE big round tree at " + pct(HIT["hill"]) + " (centre); "
          "cozy rounded clay house with wooden round-top door at " + pct(HIT["home"]) + " (left); "
          "small clear waterfall pool with lily pads and smooth rocks spanning " + pct(HIT["spring"]) + " (centre, pool centre about x 56%, y 73%); "
          "golden dirt road starting at the bottom-right and winding up toward the mosque, " + pct(HIT["road"]) + ", with a small wooden blank signpost near x 82%, y 84%. "
          "Top 12% of the image must be calm sky only. Lower-left and centre foreground: open soft grass and a gentle path, empty.")
MAP_REFS = [("valley/img/bg/masjid_day.webp", "mosque"), ("valley/img/bg/hill.webp", "hill"), ("valley/img/bg/home.webp", "house"),
            ("valley/img/bg/spring.webp", "spring"), ("valley/img/bg/road.webp", "road")]

def build():
    items = []
    # maps
    day_prompt = MAP["day"] + " " + LAYOUT + " " + RULES
    items.append(dict(id="map_day", group="map", pilot=True, target="valley/img/map/map_day.webp", kind="map",
        aspect_ratio="9:16", gen_size="2K portrait", final_px=[810, 1440], model=MODEL["name"],
        prompt=day_prompt, negative=NEG + ["text on signpost", "extra buildings", "characters"],
        references=[dict(path=p, role=r) for p, r in MAP_REFS],
        reference_note="Local approved landmark art (valley/img/bg/*). Map-prompt refs from r13 already exist on Higgsfield as ids in map_prompts.json 'refs' (may be expired); do NOT re-upload until the run session starts.",
        postprocess=dict(op="map", cover_crop="9:16", webp_quality="82->40 search", budget_kb=250, bg_removal=False),
        notes="Generate 2 seeds if first misses the hit boxes; overlay check with wire_check.js. Fine-tune PL in valley.js if slightly off."))
    for key, tgt, edit in (("sun", "map_sun", MAP["sunset_edit"]), ("night", "map_night", MAP["night_edit"])):
        items.append(dict(id=tgt, group="map", pilot=False, target="valley/img/map/%s.webp" % tgt, kind="map",
            aspect_ratio="9:16", gen_size="2K portrait (image edit)", final_px=[810, 1440], model=MODEL["name"] + " (edit/i2i; fallback nano_banana_pro)",
            prompt=edit + " " + RULES, negative=NEG + ["moved objects", "new objects", "changed composition"],
            references=[dict(from_output="map_day", role="the approved day map - edit THIS exact image")],
            depends_on="map_day",
            postprocess=dict(op="map", cover_crop="9:16", webp_quality="82->40 search", budget_kb=250, bg_removal=False),
            notes="Must keep geometry pixel-identical to map_day so one hit layout serves all 3 variants. Reject if any landmark shifts."))
    # doors
    common = DOORS["common_style"]
    for k in DOOR_ORDER:
        items.append(dict(id="door_" + k, group="door", pilot=(k == PILOT_DOOR), target="next/home/img/doors/%s.webp" % k, kind="door",
            aspect_ratio="4:3", gen_size="2K", final_px=[480, 384], model=MODEL["name"],
            prompt="A single " + DOORS["doors"][k] + ". " + common + " " + RULES,
            negative=NEG + ["digits on objects", "writing on board", "floor", "cast shadow"],
            references=[dict(path="next/home/img/doors/valley_win.webp", role="approved door style"),
                        dict(path="valley/img/bg/home.webp", role="palette / lighting"),
                        dict(path="valley/img/athar/idle.webp", role="3D render style (do not reproduce the character)")],
            postprocess=dict(op="door", key="magenta #FF00FF flood-fill from border + edge despill", trim=True, canvas="480x384 (5:4, matches .art3 aspect 120/96), object bottom-aligned",
                             webp_quality="85->45 search, alpha", budget_kb=60, bg_removal=True),
            notes="Letters/numerals on noor/math/quiz are drawn in code (world.js D3 table) - image must stay blank."))
    items.append(dict(id="door_valley", group="door", pilot=False, target="next/home/img/doors/valley_win.webp", kind="existing",
        note="ALREADY EXISTS - no generation (cropped from valley/img/bg/home.webp)."))
    # marks
    m3 = []
    for sid, cells in SHEETS.items():
        stems = [c[0] for c in cells]
        items.append(dict(id=sid, group="marks_sheet", pilot=(sid in PILOT_SHEETS), kind="sheet", aspect_ratio="3:2", gen_size="2K (3 cols x 2 rows)",
            model=MODEL["name"], prompt=sheet_prompt(cells), negative=NEG + ["touching objects", "floor", "cast shadow", "grid lines"],
            references=[dict(path="next/release/batch/refs/approved_marks_sheet_s4.jpg", role="approved style (r12 sheet)"),
                        dict(path="next/release/batch/refs/approved_marks_sheet_s8.jpg", role="approved style (r12 sheet)")],
            cells=[dict(index=i + 1, row=i // 3, col=i % 3, stem=c[0], target="valley/img/marks/%s.webp" % c[0], serves_marks=[c[0]] + c[1], object=c[2]) for i, c in enumerate(cells)],
            postprocess=dict(op="sheet", key="magenta #FF00FF flood-fill + despill", split="connected components -> 3x2 cells (dilate-merge)",
                             per_icon="trim, pad 4%, fit 256px longest side, webp alpha q85->50", budget_kb=40, bg_removal=True),
            notes="One generation = 6 final marks. Reject the sheet if any object touches another or a face appears."))
        for c in cells:
            for mid in [c[0]] + c[1]:
                bb = MARKS[mid]["bb"] if mid in MARKS else None
                if mid == "mBeacon" or bb is None:
                    pass
                if bb:
                    cx, cy = bb[0] + bb[2] / 2, bb[1] + bb[3] / 2
                    m3.append([mid, c[0], round(cx), round(cy), round(max(bb[2], bb[3]))])
    return items, m3

def main():
    items, m3 = build()
    gens = [i for i in items if i.get("kind") != "existing"]
    n = len(gens); pil = [i for i in gens if i["pilot"]]
    base = n * MODEL["credits_each"]
    est = dict(model=MODEL, images_total=n, images_by_group={g: sum(1 for i in gens if i["group"] == g) for g in ("map", "door", "marks_sheet")},
        pilot_images=[i["id"] for i in pil], pilot_credits=len(pil) * MODEL["credits_each"],
        full_run_credits_incl_pilot=base, remaining_after_pilot=base - len(pil) * MODEL["credits_each"],
        retry_buffer_credits=round(base * 0.3, 1), recommended_budget=round(base * 1.3 + 2.5, 1),
        marks_final_files=sum(len(i["cells"]) for i in gens if i["kind"] == "sheet"), marks_ids_served=len({m[0] for m in m3}),
        not_regenerated_flat=["mDust", "mGreen", "mRoad2", "mHome", "mFriend (character, no living beings)"])
    out = dict(version=1, project="athar-valley", prepared="2026-10-27", prepare_only=True,
        rules=RULES, negative_default=NEG, model=MODEL,
        order=["PILOT: map_day, door_hifz, S2, S12 (approve style)", "then map_sun, map_night", "then remaining doors", "then S3,S6,S7,S9,S10,S11"],
        estimate=est, items=items)
    json.dump(out, open(os.path.join(HERE, "batch_manifest.json"), "w"), ensure_ascii=False, indent=1)
    json.dump(dict(comment="Append to M3 array in next/valley/valley.js after marks arrive: [markId, imageStem, cx, cy, size] (centre/size from original SVG bbox)", M3_additions=m3),
              open(os.path.join(HERE, "m3_patch.json"), "w"), indent=0)
    print(json.dumps(est, indent=1))

if __name__ == "__main__":
    main()
