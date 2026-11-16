#!/usr/bin/env node
/* Athar returning-user QA — usage: NODE_PATH=$(npm root -g) node tools/qa/legacy.js <mainWorktreeDir> [port=8898] [--shots dir]
   Needs a git worktree of main (e.g. git worktree add --detach ../wt-main main). Uses ONE persistent browser profile and ONE origin:
   1) serves main on <port>, drives it by real use (repeat/speed/volume/digits/sfx settings, ayah status chips, adhkar taps => stars),
   2) snapshots localStorage, 3) stops main, serves THIS repo on the same port (same origin, same profile = what a returning user gets after an update),
   4) asserts every key main wrote survives boot + navigation, that review UI reflects progress/stars/settings, and no page errors. Exit 1 on failure. */
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'), os = require('os');
const { spawn } = require('child_process');
const MAIN = path.resolve(process.argv[2] || '../wt-main'), REV = path.resolve(__dirname, '../..');
const port = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : '8898';
const si = process.argv.indexOf('--shots'); const shots = si > 0 ? process.argv[si + 1] : null; if (shots) fs.mkdirSync(shots, { recursive: true });
const URL = `http://localhost:${port}/index.html?t=day&first=0&nl=1`;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const serve = async (dir) => { const s = spawn('python3', ['-m', 'http.server', port], { cwd: dir, stdio: 'ignore' }); await sleep(1200); return s; };
const click = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) throw new Error('missing ' + s); e.click(); }, sel);
const clickText = (p, scope, txt) => p.evaluate(([sc, t]) => { const e = [...document.querySelectorAll(sc)].find(x => x.offsetParent && x.textContent.trim().includes(t)); if (!e) throw new Error('missing text ' + t); e.click(); }, [scope, txt]);
(async () => {
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'athar-legacy-')); const problems = []; const fail = (m) => { problems.push(m); console.log('FAIL ' + m); }; const ok = (m) => console.log('ok   ' + m);
  const open = async () => { const c = await chromium.launchPersistentContext(prof, { viewport: { width: 390, height: 780 } }); const p = c.pages()[0] || await c.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message)); return [c, p]; };
  /* ---------- phase 1: real use on main ---------- */
  let srv = await serve(MAIN); let [c, p] = await open();
  await p.goto(URL, { waitUntil: 'load' }); await sleep(1500);
  await click(p, '#btnParent'); await sleep(500);
  for (const d of '0000') { await p.evaluate((d) => [...document.querySelectorAll('#pinPad button')].find(x => x.textContent.trim() === d).click(), d); await sleep(d === '0' && false ? 700 : 150); } await sleep(800);
  await click(p, '#setTabs [data-g=child]'); await sleep(300); await clickText(p, '#view-dashboard .repeat-chip', '5 '); await sleep(200);
  await clickText(p, '#view-dashboard [data-grp=child] button', 'إنجليزية'); await sleep(200);
  await click(p, '#setTabs [data-g=sound]'); await sleep(300); await clickText(p, '#view-dashboard .repeat-chip', 'أبطأ'); await clickText(p, '#view-dashboard .repeat-chip', 'هادئ');
  await p.evaluate(() => { const sw = document.querySelector('#view-dashboard [data-grp=sound] .sw'); sw && sw.click(); }); await sleep(300);
  await click(p, '#setTabs [data-g=prog]'); await sleep(300);
  await p.evaluate(() => { const t = [...document.querySelectorAll('#view-dashboard button')].find(x => x.offsetParent && x.textContent.trim() === 'السور'); t && t.click(); }); await sleep(400);
  const row = await p.evaluate(() => { const r = [...document.querySelectorAll('#progressList .surah-row')].find(x => x.offsetParent); if (r) { r.click(); return r.textContent.trim().slice(0, 30); } return null; });
  await sleep(600);
  const chips = await p.evaluate(() => document.querySelectorAll('#ayahStatusGrid .ayah-chip').length);
  console.log('main: surah row=' + row + ' chips=' + chips);
  /* ayah 1 -> trained(1 tap), 2 -> memorized(2), 3 -> review(3), 4 -> memorized(2) */
  const taps = { 1: 1, 2: 2, 3: 3, 4: 2 };
  for (const a in taps) for (let i = 0; i < taps[a]; i++) { await p.evaluate((n) => { const c = [...document.querySelectorAll('#ayahStatusGrid .ayah-chip')].find(x => x.textContent.trim() === String(n)); c && c.click(); }, +a); await sleep(120); }
  if (shots) await p.screenshot({ path: shots + '/legacy-1-main-progress.png' });
  await click(p, '#btnDashBack'); await sleep(500);
  await click(p, '#doorAdhkar'); await sleep(800);
  for (let k = 0; k < 2; k++) {
    await p.evaluate((k) => document.querySelectorAll('.adk-tile')[k].click(), k); await sleep(700);
    for (let j = 0; j < 3; j++) { await clickText(p, 'button', 'قلتُها معك'); await sleep(900); }
    await p.evaluate(() => { const x = [...document.querySelectorAll('button')].find(b => b.offsetParent && /^[×✕x]$/.test(b.textContent.trim())); x && x.click(); }); await sleep(500);
  }
  if (shots) await p.screenshot({ path: shots + '/legacy-2-main-adhkar.png' });
  const snap = await p.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
  const mainErrs = p.errs.slice(); await c.close(); srv.kill(); await sleep(500);
  const keys = Object.keys(snap).filter(k => /^athar/.test(k));
  console.log('main wrote ' + keys.length + ' athar keys: ' + keys.join(', '));
  const P = JSON.parse(snap.athar_quran_progress_v1 || '{}'), S = JSON.parse(snap.athar_quran_settings_v1 || '{}'), R = JSON.parse(snap['athar.rw.v1'] || '{}');
  const stars = R.profiles && R.profiles.p1 ? R.profiles.p1.stars : 0;
  console.log('main state: progress=' + JSON.stringify(P) + ' stars=' + stars + ' settings=' + JSON.stringify({ rc: S.repeatCount, speed: S.speed, vol: S.vol, sfx: S.sfx, pin: S.pin }));
  if (!Object.keys(P).length) fail('setup: main produced no progress'); if (!(stars > 0)) fail('setup: main produced no stars'); if (S.repeatCount !== 5) fail('setup: repeatCount not 5'); if (S.pin !== '0000') fail('setup: pin missing');
  /* ---------- phase 2: same profile, review build ---------- */
  srv = await serve(REV); [c, p] = await open();
  await p.goto(URL, { waitUntil: 'load' }); await sleep(2500);
  const after1 = await p.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
  const diff = (a, b, label) => { for (const k of Object.keys(a)) { if (!/^athar/.test(k)) continue; if (!(k in b)) fail(label + ': key removed ' + k); else if (b[k] !== a[k]) { /* allow superset-with-same-values for JSON objects */ try { const A = JSON.parse(a[k]), B = JSON.parse(b[k]); const bad = Object.keys(A).filter(x => JSON.stringify(A[x]) !== JSON.stringify(B[x])); if (bad.length && !/^athar\.(world|profile)\.v|athar_days|athar_mis/.test(k)) fail(label + ': ' + k + ' changed: ' + bad.join(',')); else if (bad.length) console.log('note ' + label + ': ' + k + ' fields changed (time-dependent): ' + bad.join(',')); } catch (e) { fail(label + ': ' + k + ' changed (non-JSON)'); } } } };
  diff(snap, after1, 'after boot'); if (!problems.length) ok('all ' + keys.length + ' main keys intact after review boot');
  if (!(await p.evaluate(() => !!document.getElementById('view-home') && document.querySelector('.view.active') && document.querySelector('.view.active').id === 'view-home'))) fail('review home not active'); else ok('review home renders');
  /* UI: stars chip, settings, progress */
  const chip = await p.evaluate(() => { const e = document.querySelector('.rw-chip, #rwChip, [class*=rw-chip]'); return e ? e.textContent.trim() : null; });
  console.log('review star chip text: ' + chip); if (shots) await p.screenshot({ path: shots + '/legacy-3-review-home.png' });
  if (!chip || !/[0-9٠-٩]/.test(chip)) fail('review: star chip missing/empty'); else {
    const toD = (s) => +String(s).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\D/g, ''); if (toD(chip) !== stars) fail('review: star chip ' + chip + ' != ' + stars); else ok('review star chip shows ' + stars);
  }
  await click(p, '#btnParent'); await sleep(600);
  const pinView = await p.evaluate(() => document.querySelector('.view.active').id);
  if (pinView !== 'view-pin') fail('review: gear did not open pin view (' + pinView + ')');
  else { for (const d of '0000') { await p.evaluate((d) => [...document.querySelectorAll('#pinPad button')].find(x => x.textContent.trim() === d).click(), d); await sleep(80); } await sleep(900);
    const v = await p.evaluate(() => document.querySelector('.view.active').id); if (v !== 'view-dashboard') fail('review: saved PIN 0000 rejected (' + v + ')'); else ok('review accepts the existing PIN'); }
  await click(p, '#setTabs [data-g=child]'); await sleep(300);
  const act = (g) => p.evaluate((g) => [...document.querySelectorAll('#view-dashboard [data-grp=' + g + '] .repeat-chip.active')].map(x => x.textContent.trim()), g);
  const a1 = await act('child'); a1.some(t => t.includes('5 ')) ? ok('review settings: repeat=5 active') : fail('review settings: repeat chip not 5 (' + a1 + ')');
  await click(p, '#setTabs [data-g=sound]'); await sleep(300);
  const a2 = await act('sound'); (a2.includes('أبطأ') && a2.includes('هادئ')) ? ok('review settings: speed=slow, volume=quiet active') : fail('review settings: sound chips ' + a2);
  if (shots) await p.screenshot({ path: shots + '/legacy-4-review-settings.png' });
  await click(p, '#setTabs [data-g=prog]'); await sleep(300);
  await p.evaluate(() => { const t = [...document.querySelectorAll('#view-dashboard button')].find(x => x.offsetParent && x.textContent.trim() === 'السور'); t && t.click(); }); await sleep(400);
  await p.evaluate(() => { const r = [...document.querySelectorAll('#progressList .surah-row')].find(x => x.offsetParent); r && r.click(); }); await sleep(600);
  const st = await p.evaluate(() => [...document.querySelectorAll('#ayahStatusGrid .ayah-chip')].slice(0, 5).map(c => c.className.replace('ayah-chip', '').trim() || 'new'));
  const want = ['trained', 'memorized', 'review', 'memorized', 'new']; JSON.stringify(st) === JSON.stringify(want) ? ok('review progress chips: ' + st.join(',')) : fail('review progress chips ' + st + ' != ' + want);
  if (shots) await p.screenshot({ path: shots + '/legacy-5-review-progress.png' });
  /* review writes must not clobber: cycle one chip back and forth, reload, compare */
  await p.evaluate(() => document.querySelectorAll('#ayahStatusGrid .ayah-chip')[4].click()); await sleep(200);
  await p.reload({ waitUntil: 'load' }); await sleep(2000);
  const after2 = await p.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
  const P2 = JSON.parse(after2.athar_quran_progress_v1 || '{}'); Object.keys(P).forEach(k => { if (P2[k] !== P[k]) fail('progress ' + k + ' lost after review write+reload'); }); if (P2['78-5'] !== 'trained') fail('review write of new ayah not saved'); else ok('review write persisted, old progress intact after reload');
  const S2 = JSON.parse(after2.athar_quran_settings_v1 || '{}'); ['repeatCount', 'speed', 'vol', 'sfx', 'pin'].forEach(k => { if (S2[k] !== S[k]) fail('setting ' + k + ' changed ' + S[k] + ' -> ' + S2[k]); });
  const R2 = JSON.parse(after2['athar.rw.v1'] || '{}'); if (((R2.profiles || {}).p1 || {}).stars < stars) fail('stars decreased'); else ok('stars preserved: ' + (((R2.profiles || {}).p1 || {}).stars));
  if (p.errs.length) fail('review page errors: ' + p.errs.slice(0, 3).join(' | ')); if (mainErrs.length) console.log('note: main itself threw: ' + mainErrs.slice(0, 2).join(' | '));
  await c.close(); srv.kill(); fs.rmSync(prof, { recursive: true, force: true });
  console.log(problems.length ? `\n${problems.length} problem(s)` : '\nreturning-user check passed'); process.exit(problems.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
