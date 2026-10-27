# Handoff — Higgsfield batch (violet key #7B2FF7)

State (2026-10-27): all 5 doors + sheets S2,S3,S6,S7,S9,S10,S11,S12 generated and approved by owner (style + violet background). NOT yet downloaded into the repo: the old session's egress proxy blocked *.cloudfront.net. Owner added *.cloudfront.net and upload.higgsfield.ai to Allowed domains; a NEW session should have access.

## Step 1 — download (name each file by manifest id)
mkdir /tmp/hf && cd /tmp/hf, then curl -o <id>.png "<url>":
B=https://d8j0ntlcm91z4.cloudfront.net/user_3Isqcp1WNeQb3wtRQJqKCNlsa5T
- door_hifz  $B/hf_20261027_144417_40973f32-010f-4959-9541-34840488aff4.png
- S2         $B/hf_20261027_144416_eebe7ceb-da32-4535-9ac0-2f240ed61642.png
- door_noor  $B/hf_20261027_163704_e523fdd8-e7c4-461d-8c27-ef8a83c3c53d.png
- door_lib   $B/hf_20261027_163704_caf04535-a636-4cb7-813c-0d24afdd441f.png
- door_math  $B/hf_20261027_163539_88b0ddf7-43f9-4b0b-a2f8-2876491430cf.png
- door_adhkar $B/hf_20261027_163704_1d3f8af0-fff2-4378-8207-6c8fcd3ff0e7.png
- door_quiz  $B/hf_20261027_163705_8e4c75a4-587c-4eda-b038-a5c49024d52b.png
- S3  $B/hf_20261027_163539_951d95aa-3e36-4e50-93cb-81588c05ad8e.png
- S6  $B/hf_20261027_163539_fdbc8955-ec4d-4d42-95f4-30a4a57d8814.png
- S7  $B/hf_20261027_163827_a1f1d132-1068-4164-a701-c2e25229b332.png
- S9  $B/hf_20261027_163826_8fa2ab83-f273-4562-9c9c-b4fbe0eca325.png
- S10 $B/hf_20261027_163538_3182e1f7-8547-49c0-84ba-563378feefdd.png
- S11 $B/hf_20261027_163826_b8492223-d0a2-4c03-8165-8ea99c372e95.png
- S12 $B/hf_20261027_163827_a8865d60-9919-4913-889f-ac508a6650c4.png
(Higgsfield job ids are the uuid in each filename; show_generation_by_ids can re-fetch URLs.)

## Step 2 — process
python3 next/release/batch/postprocess.py --in /tmp/hf --root /home/claude/athar
(violet key; doors -> next/home/img/doors/*.webp; marks -> valley/img/marks/*.webp). Known: glow marks mGlow/mDawn/mCore/mSix keep a faint violet halo -> strengthen despill (lower `lim`, or key with larger `soft`) for those cells and re-check on a light + dark background.
Door file names: door_hifz->hifz.webp, noor, lib, math, adhkar, quiz.

## Step 3 — wire + verify
Wire marks via m3_patch.json (append to M3 in next/valley/valley.js), doors in home-next.html; run wire_check.js (Playwright); verify; commit + push.

## Not generated yet (owner must review first)
map_day (pilot id 2116dd96-…, not regenerated with violet; maps have no key colour so it is still valid), map_sun, map_night (i2i edits of map_day). Refs on Higgsfield: doors 1638fb97-e877-4594-bfd6-a51dbb61c18d + 56ec6a64-981e-418e-88a9-91bed5fa89a5; sheets cc5b1679-d5ba-4532-a87a-ac1f352b538f + 89c63fc5-0ed7-4268-932b-ed83952d266d.

## Other pending
Credits left 718.5 (Pro). Remind owner to cancel auto-renew when done. Aqeedah choices (42 findings), curriculum answers, Muhammad's adhkar ZIP still pending.
