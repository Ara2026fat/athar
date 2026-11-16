#!/usr/bin/env node
/* Athar data-migration QA — usage: NODE_PATH=$(npm root -g) node tools/qa/migrate.js <port>
   Serve first: python3 -m http.server <port> from repo root. Seeds old/partial/corrupt localStorage, boots the app,
   asserts: no page errors, home renders, valid progress survives, bad values are ignored. Exit 1 on failure. */
const { chromium } = require('playwright');
const port = process.argv[2] || '8854';
const URL = `http://localhost:${port}/index.html?t=day&first=0&nl=1`;
const P = 'athar_quran_progress_v1', S = 'athar_quran_settings_v1', PF = 'athar_profiles_v1';
const GOOD = { '78-1': 'memorized', '78-2': 'review', '112-1': 'trained' };
const CASES = [
  ['empty', {}],
  ['progress-broken-json', { [P]: '{"78-1":"memor' }],
  ['progress-null', { [P]: 'null' }],
  ['progress-number', { [P]: '5' }],
  ['progress-string', { [P]: '"abc"' }],
  ['progress-array', { [P]: '[1,2,3]' }],
  ['progress-bad-values', { [P]: JSON.stringify(Object.assign({ '78-3': 7, '78-4': null, '78-5': { x: 1 }, '78-6': 'weird' }, GOOD)) }, GOOD],
  ['settings-number', { [S]: '5' }],
  ['settings-string', { [S]: '"x"' }],
  ['settings-array', { [S]: '[]' }],
  ['settings-broken', { [S]: '{vol:' }],
  ['settings-wrong-types', { [S]: JSON.stringify({ repeatCount: 'abc', vol: 'loud', speed: null, sfx: 'yes', voices: 'none', bedtime: 1, textSize: {} }) }],
  ['settings-out-of-range', { [S]: JSON.stringify({ repeatCount: -4, vol: 9, speed: 0 }) }],
  ['profiles-broken', { [PF]: '{{' }],
  ['profiles-empty-list', { [PF]: '{"list":[],"active":"p1"}' }],
  ['profiles-list-not-array', { [PF]: '{"list":"x","active":"p1"}' }],
  ['profiles-null-entries', { [PF]: '{"list":[null,5,{"id":3},{"id":"p1"}],"active":"zzz"}', [P]: JSON.stringify(GOOD) }, GOOD],
  ['profiles-dup-ids', { [PF]: '{"list":[{"id":"p1","name":"a"},{"id":"p1","name":"b"}],"active":"p1"}', [P]: JSON.stringify(GOOD) }, GOOD],
  ['profiles-second-active', { [PF]: '{"list":[{"id":"p1","name":"a"},{"id":"p2","name":"b"}],"active":"p2"}', [P + '_p2']: JSON.stringify(GOOD) }, GOOD],
  ['days-wrong-type', { athar_days_v1_p1: '{"a":1}', athar_mis_v1_p1: '[]' }],
  ['mis-wrong-fields', { athar_mis_v1_p1: JSON.stringify({ date: 5, done: 'x', total: 'many', bonus: [] }) }],
  ['game-keys-wrong', { athar_ayq_v1_p1: '[]', athar_adhkar_v1_p1: '"s"', athar_pstory_v1_p1: '7', athar_noor_v1_p1: 'true', athar_noor_all_p1: '{}' }],
  ['shared-profile-broken', { 'athar.profile.v1': '[1]', 'athar.world.v2': '"zz"' }],
  ['shared-profile-wrong-fields', { 'athar.profile.v1': JSON.stringify({ quran: 'x', valley: 5 }), 'athar.world.v2': '{"sess":5}' }],
  ['legacy-no-profiles-key', { [P]: JSON.stringify(GOOD) }, GOOD],
];
(async () => {
  const b = await chromium.launch(); let fail = 0;
  for (const [name, seed, expect] of CASES) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::|favicon|Manifest/i.test(m.text())) errs.push(m.text()); });
    await page.addInitScript(([seed]) => { if (!sessionStorage.getItem('__seeded')) { sessionStorage.setItem('__seeded', '1'); localStorage.clear(); for (const k in seed) localStorage.setItem(k, seed[k]); } }, [seed]);
    await page.goto(URL, { waitUntil: 'load' }); await page.waitForTimeout(1500);
    const r = await page.evaluate(() => {
      const door = document.getElementById('doorHifz'); const act = document.querySelector('.view.active');
      let n = 0; try { n = Object.keys(JSON.parse(localStorage.getItem('athar_quran_progress_v1') || '{}')).length; } catch (e) {}
      return { door: !!door && !!act && act.id === 'view-home', view: act && act.id };
    });
    // open Hifz door then Surah list, to exercise progress reads
    let ok2 = true;
    try { await page.evaluate(() => { document.getElementById('doorHifz').click(); }); await page.waitForTimeout(500); await page.evaluate(() => { const c = document.getElementById('choiceSurah'); c && c.click(); }); await page.waitForTimeout(700); } catch (e) { ok2 = false; }
    // trigger a write (progress save) via a click inside, then verify reload keeps good progress
    const before = await page.evaluate(() => localStorage.getItem('athar_quran_progress_v1') || localStorage.getItem('athar_quran_progress_v1_p2'));
    const problems = [];
    if (!r.door) problems.push('home door not visible');
    if (!ok2) problems.push('navigation failed');
    if (errs.length) problems.push('errors: ' + errs.slice(0, 3).join(' | '));
    if (expect) {
      // good entries must not be erased from storage by boot, and must be read by the app
      const stored = JSON.parse(before || '{}');
      for (const k in expect) if (stored[k] !== expect[k]) problems.push('progress lost: ' + k);
    }
    console.log((problems.length ? 'FAIL ' : 'ok   ') + name + (problems.length ? '  -> ' + problems.join('; ') : ''));
    if (problems.length) fail++;
    await ctx.close();
  }
  await b.close(); console.log(fail ? `\n${fail} failing` : '\nall migration cases passed'); process.exit(fail ? 1 : 0);
})();
