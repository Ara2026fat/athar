#!/usr/bin/env node
/* Athar family-scenario QA — usage: NODE_PATH=$(npm root -g) node tools/qa/family.js <port>
   Two child profiles: independent progress/days/stars/home state, switching, add, rename, delete (no orphan keys,
   no leakage to the surviving profile or into a newly created profile). Exit 1 on failure. */
const { chromium } = require('playwright');
const port = process.argv[2] || '8854';
const URL = `http://localhost:${port}/index.html?t=day&first=0&nl=1`;
const P = 'athar_quran_progress_v1';
const seed = {
  athar_quran_settings_v1: JSON.stringify({ pin: '1234', repeatCount: 3 }),
  athar_profiles_v1: JSON.stringify({ list: [{ id: 'p1', name: 'علي' }, { id: 'p2', name: 'سارة' }], active: 'p1' }),
  [P]: JSON.stringify({ '78-1': 'memorized', '78-2': 'memorized' }),
  [P + '_p2']: JSON.stringify({ '112-1': 'trained' }),
  athar_days_v1_p1: '["2026-11-01","2026-11-02"]', athar_days_v1_p2: '["2026-11-03"]',
  athar_mis_v1_p1: JSON.stringify({ total: 5 }), athar_mis_v1_p2: JSON.stringify({ total: 1 }),
  athar_adhkar_v1_p1: '{"a":1}', athar_adhkar_v1_p2: '{"b":2}',
  athar_noor_v1_p2: '{"1":1}', athar_noor_all_p2: '1', athar_home_w_v1_p2: '{"seen":1}',
  athar_quran_srs_v1_p2: '{"a":{}}', athar_ayq_v1_p2: '{"1":1}', athar_pstory_v1_p2: '{"1":1}',
  'athar.rw.v1': JSON.stringify({ v: 1, profiles: { p1: { stars: 9 }, p2: { stars: 2 } } }),
};
const problems = []; const bad = (m) => problems.push(m);
const L = (page, k) => page.evaluate((k) => localStorage.getItem(k), k);
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('dialog', d => d.accept());
  await page.addInitScript((s) => { if (!sessionStorage.getItem('__s')) { sessionStorage.setItem('__s', '1'); localStorage.clear(); for (const k in s) localStorage.setItem(k, s[k]); } }, seed);
  await page.goto(URL, { waitUntil: 'load' }); await page.waitForTimeout(1500);
  const chips = () => page.$$eval('#profileBar .prof-chip', a => a.map(x => x.textContent + (x.classList.contains('active') ? '*' : '')));
  let c = await chips(); if (c.join() !== 'علي*,سارة') bad('chips wrong: ' + c.join());
  await page.click('#profileBar .prof-chip:nth-child(2)'); await page.waitForTimeout(600);
  c = await chips(); if (c.join() !== 'علي,سارة*') bad('switch failed: ' + c.join());
  if (JSON.parse(await L(page, 'athar_profiles_v1')).active !== 'p2') bad('active not persisted');
  if (await L(page, P) !== seed[P]) bad('p1 progress changed by switching');
  // write progress as p2 via app, p1 must stay untouched
  await page.evaluate(() => { document.getElementById('doorHifz').click(); }); await page.waitForTimeout(400);
  await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1200);
  c = await chips(); if (c.join() !== 'علي,سارة*') bad('active profile lost on reload: ' + c.join());
  // open parent dashboard through PIN
  await page.click('#btnParent'); await page.waitForTimeout(400);
  for (const k of '1234') { await page.evaluate((k) => { [...document.querySelectorAll('#pinPad button')].find(x => x.textContent.trim() === k).click(); }, k); await page.waitForTimeout(80); }
  await page.waitForTimeout(600);
  const names = await page.$$eval('#profilesCard input[type=text]', a => a.map(x => x.value));
  if (names.slice(0, 2).join() !== 'علي,سارة') bad('profile card names: ' + names.join());
  // add third child, rename, check new profile is empty (no leakage)
  await page.evaluate(() => { const i = document.querySelector('#profilesCard input[placeholder="اسم طفل جديد"]'); i.value = 'omar'; i.closest('.pin-change-row').querySelector('button').click(); }); await page.waitForTimeout(300);
  let pr = JSON.parse(await L(page, 'athar_profiles_v1')); if (pr.list.length !== 3) bad('add failed: ' + pr.list.length);
  const nid = pr.list[2] && pr.list[2].id;
  await page.evaluate(() => { const i = document.querySelector('#profilesCard input[type=text]'); i.value = 'علي٢'; i.dispatchEvent(new Event('change')); });
  pr = JSON.parse(await L(page, 'athar_profiles_v1')); if (pr.list[0].name !== 'علي٢') bad('rename failed');
  const leak = await page.evaluate((nid) => Object.keys(localStorage).filter(k => k.endsWith('_' + nid)), nid);
  if (leak.length) bad('new profile has pre-existing keys: ' + leak.join());
  // delete active p2 (second delete button) -> p2 keys gone, p1 intact, active falls back
  await page.evaluate(() => { document.querySelectorAll('#profilesCard button.danger')[1].click(); }); await page.waitForTimeout(300);
  const left = await page.evaluate(() => Object.keys(localStorage).filter(k => /_p2$/.test(k) || k === 'athar_quran_srs_v1_p2'));
  if (left.length) bad('orphan p2 keys after delete: ' + left.join());
  const rw = JSON.parse(await L(page, 'athar.rw.v1')); if (rw.profiles && rw.profiles.p2) bad('rewards of p2 not removed');
  pr = JSON.parse(await L(page, 'athar_profiles_v1')); if (pr.list.map(x => x.id).indexOf('p2') >= 0) bad('p2 still listed');
  if (pr.active === 'p2') bad('active still deleted profile');
  if (await L(page, P) !== seed[P]) bad('p1 progress damaged by deleting p2');
  if (await L(page, 'athar_days_v1_p1') !== seed.athar_days_v1_p1 || await L(page, 'athar_adhkar_v1_p1') !== seed.athar_adhkar_v1_p1) bad('p1 data damaged');
  if (JSON.parse(await L(page, 'athar.rw.v1')).profiles.p1.stars !== 9) bad('p1 rewards damaged');
  if (errs.length) bad('page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(problems.length ? 'FAIL family\n  ' + problems.join('\n  ') : 'ok   family scenario (2 profiles + add/rename/delete, no leakage)');
  await b.close(); process.exit(problems.length ? 1 : 0);
})();
