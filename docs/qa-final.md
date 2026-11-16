# QA final report (round 10) — branch rev-r10-qa

Build: review + this branch. Servers: python http.server, Playwright chromium.

## Suites
| Suite | Result | Screens / sizes | Notes |
|---|---|---|---|
| regress (tools/qa/regress.js) | PASS | 34 scenarios x 4 sizes (320x568, 360x640, 390x780, 412x915) = 136 runs | 0 critical; only note: adhkar-item tap target <44px (1 item at 320/360) |
| contrast @390x780 | 1 residual | 34 screens, ~613 text items | was 8; see below |
| contrast @320x568 | PASS after fix (rerun of affected screens: 0) | 34 screens, ~443 items | was 15 (full rerun showed 1: lq-say, then fixed) |
| a11y | PASS | 34 screens | 0 findings |
| audio | PASS | 21 checks | bedtime, rapid nav, load failures |
| migrate | PASS | 25 corrupt/partial storage cases | |
| family | PASS | 2 profiles + add/rename/delete | no leakage |
| smoke + PWA | PASS | 390x780, 320x568 | manifest, icons, meta |
| play (tools/qa/play.js) | PASS 28/28 | 14 games/story/quiz flows x 320x568, 390x780 | all reach end card |
| legacy (new, tools/qa/legacy.js) | PASS | 390x780 | returning user, see below |

## Contrast: what was real, what was tool noise
Fixed in the tool (tools/qa/contrast.js): measures after jumping animations to their end state (equation/pop-in frames were mis-sampled: num-add/num-sub "+", "=", digits, 8 of the 15 at 320); big glyphs (>=28px) sample the ink band, not the tall line box (stars row above overlapped); disabled controls and colour-emoji glyphs are exempt (WCAG 1.4.3: inactive components; emoji are images).
Accepted deliberately: `.pgr-prev` disabled arrow (opacity .35, disabled attribute); ghost star `.gone` (decorative, consumed-item cue).
Real fixes (next/home): `.lq-say` blue darkened (#1f5fd8 -> #1a4fc0, screens.css; 4.45 -> pass); library paged book tiles: subtitle was clipped mid-line (flex-shrunk to 1.25 lines, half third line peeking) -> now one clean ellipsized line, `flex:0 0 auto`, text-shadow for light gradients (yellow tile).
Residual, unresolved: `lib-cat4 @390` small "أم سلمة وميمونة..." reports 1.8. Manual pixel check of the real screenshot: background under the text is the dark maroon/indigo gradient (~rgb 60,77,143, white ~7:1); the tool's sample band reaches the tile's lower edge where the page background shows. Judged a measurement artifact, not a user-visible defect. (Before the fix the same screen read 1.08 for cat3/cat4.)

## Returning-user test (legacy.js)
Method: git worktree of main (91c6005) served on port P; real use driven through its UI in one persistent browser profile (parent gate, repeat=5, speed slow, volume quiet, ayah chips 78:1-4 -> trained/memorized/review/memorized, two adhkar completed -> 2 stars). Then main stopped, review served on the SAME origin/profile.
Results: all 10 athar_* keys intact after boot; home renders; star chip shows 2; existing PIN 0000 accepted; settings show repeat 5, slow, quiet active; progress chips identical (trained, memorized, review, memorized, new); a new write persists and old progress survives reload; stars not reduced; no page errors.
Not exercised: custom PIN change, second profile (covered by family.js), SFX toggle (switch selector did not change state in main).
Run: `MAIN_WT=/path/to/main-worktree tools/qa/all.sh <port>` includes it.
