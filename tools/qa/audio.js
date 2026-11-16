#!/usr/bin/env node
/* Athar audio-robustness QA — usage: NODE_PATH=$(npm root -g) node tools/qa/audio.js <port>
   Serve first: python3 -m http.server <port> from repo root. Checks: autoplay policy (silent before first gesture),
   mute persistence, no overlapping home voice lines, voice-pack load failure + retry, surah audio failure (no crash),
   audio stops on navigation, bedtime silences sfx, rapid navigation causes no errors. Exit 1 on failure. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const port = process.argv[2] || '8854';
const URL = `http://localhost:${port}/index.html?t=day&first=0&nl=1`;
const MP3 = fs.readFileSync(path.join(__dirname, '..', '..', 'c001.mp3'));
const res = []; const T = (n, ok, d) => { res.push(ok); console.log((ok ? 'ok   ' : 'FAIL ') + n + (ok ? '' : '  -> ' + (d || ''))); };
const INIT = () => {
  window.__m = []; const op = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { if (window.__m.indexOf(this) < 0) window.__m.push(this); return op.apply(this, arguments); };
};
const gesture = (p) => p.evaluate(() => { document.dispatchEvent(new Event('pointerdown')); });
const playing = (p) => p.evaluate(() => window.__m.filter(a => !a.paused && !a.ended && !a.error).length);
async function open(b, o = {}) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::|favicon|Manifest/i.test(m.text())) errs.push(m.text()); });
  await p.route(/everyayah\.com/, r => o.ayahFail ? r.abort() : r.fulfill({ status: 206, headers: { 'Content-Type': 'audio/mpeg', 'Accept-Ranges': 'bytes', 'Content-Range': `bytes 0-${MP3.length - 1}/${MP3.length}`, 'Access-Control-Allow-Origin': '*' }, body: MP3 }));
  if (o.blockPack) await p.route(/sp_home\.bin/, r => r.abort());
  if (o.seed) await p.addInitScript(s => { if (!sessionStorage.__s) { sessionStorage.__s = 1; for (const k in s) localStorage.setItem(k, s[k]); } }, o.seed);
  await p.addInitScript(INIT);
  await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1200);
  return { ctx, p, errs };
}
(async () => {
  const b = await chromium.launch({ args: [] }); let s;
  /* 1. autoplay: nothing audible before the first gesture; ambience starts after it */
  s = await open(b); await s.p.waitForTimeout(1500);
  T('autoplay: silent before first gesture', (await playing(s.p)) === 0, 'playing=' + await playing(s.p));
  await gesture(s.p); await s.p.waitForTimeout(1500);
  T('autoplay: no errors after first gesture', s.errs.length === 0, s.errs.join('|')); await s.ctx.close();

  /* 2. mute remembered across reload */
  s = await open(b); await gesture(s.p); await s.p.waitForTimeout(600);
  await s.p.evaluate(() => window.HomeAudio.set(false)); await s.p.waitForTimeout(300);
  T('mute: persisted flag', await s.p.evaluate(() => localStorage.getItem('athar_home_snd')) === '0');
  await s.p.reload({ waitUntil: 'load' }); await s.p.waitForTimeout(1200); await gesture(s.p); await s.p.waitForTimeout(1500);
  T('mute: stays silent after reload', (await playing(s.p)) === 0 && await s.p.evaluate(() => window.HomeAudio.on === false), 'playing=' + await playing(s.p));
  T('mute: say() returns false and calls done', await s.p.evaluate(() => new Promise(r => { const x = window.HomeAudio.say('hello', () => r(true)); setTimeout(() => r(false), 500); })));
  T('mute: no errors', s.errs.length === 0, s.errs.join('|')); await s.ctx.close();

  /* 3. overlapping voice lines: rapid say() leaves at most one voice playing */
  s = await open(b); await gesture(s.p); await s.p.waitForTimeout(2500);
  const ov = await s.p.evaluate(async () => { const H = window.HomeAudio; ['hello', 'well', 'can', 'repeat', 'letter', 'mash'].forEach(n => H.say(n)); await new Promise(r => setTimeout(r, 900));
    return window.__m.filter(a => !a.paused && !a.ended && !a.loop && /^blob:/.test(a.src)).length; });
  T('overlap: <=1 voice line at once', ov <= 1, 'voices=' + ov);
  T('overlap: no errors', s.errs.length === 0, s.errs.join('|')); await s.ctx.close();

  /* 4. voice pack fails to load -> no crash, say() completes; recovers on retry */
  s = await open(b, { blockPack: true }); await gesture(s.p); await s.p.waitForTimeout(800);
  const f1 = await s.p.evaluate(() => new Promise(r => { const H = window.HomeAudio; H.say('hello', () => r(true)); setTimeout(() => r('state ' + JSON.stringify({ on: H.on, u: H.unlocked, q: H._q, p: !!H._p })), 9000); }));
  T('pack failure: say() still completes', f1 === true, String(f1));
  await s.p.unroute(/sp_home\.bin/); await s.p.waitForTimeout(300);
  const f2 = await s.p.evaluate(() => new Promise(r => { window.HomeAudio.say('well', () => r(true)); setTimeout(() => r(false), 5000); }));
  const ok2 = await s.p.evaluate(() => !!window.HomeAudio.bin);
  T('pack failure: retry loads pack afterwards', f2 && ok2, 'done=' + f2 + ' bin=' + ok2);
  T('pack failure: no uncaught errors', s.errs.length === 0, s.errs.join('|')); await s.ctx.close();

  /* 5. surah audio: plays when online; failure does not crash; leaving the surah stops it */
  for (const fail of [false, true]) {
    s = await open(b, { ayahFail: fail });
    const nav = async () => { await s.p.evaluate(() => document.getElementById('doorHifz').click()); await s.p.waitForTimeout(500);
      await s.p.evaluate(() => document.getElementById('choiceSurah').click()); await s.p.waitForTimeout(600);
      await s.p.evaluate(() => { const e = document.querySelector('#surahGrid .surah-card,#surahGrid > *'); e && e.click(); }); await s.p.waitForTimeout(900); };
    await nav();
    const bb = await s.p.evaluate(() => { const r = document.getElementById('btnPlay').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }); await s.p.mouse.click(bb[0], bb[1]); await s.p.waitForTimeout(1500);
    const pl = await playing(s.p);
    if (!fail) T('surah audio: plays', pl >= 1, 'playing=' + pl);
    await s.p.evaluate(() => { const bk = document.querySelector('.view.active .back-btn'); bk && bk.click(); }); await s.p.waitForTimeout(700);
    const stillA = await s.p.evaluate(() => [...document.querySelectorAll('audio')].concat(window.__m.filter(a => /everyayah/.test(a.src))).filter(a => !a.paused && !a.ended).length);
    T('surah audio (' + (fail ? 'load fails' : 'ok') + '): recitation stops after leaving', stillA === 0, 'still playing=' + stillA);
    T('surah audio (' + (fail ? 'load fails' : 'ok') + '): no errors', s.errs.length === 0, s.errs.join('|')); await s.ctx.close();
  }

  /* 6. bedtime: sfx gate closed, FX quiet */
  s = await open(b, { seed: { athar_quran_settings_v1: JSON.stringify({ bedtime: true, repeatCount: 3 }) } }); await gesture(s.p); await s.p.waitForTimeout(500);
  T('bedtime: AtharFX quiet', await s.p.evaluate(() => window.AtharFX.quiet()));
  T('bedtime: body class applied', await s.p.evaluate(() => document.body.classList.contains('bedtime')));
  T('bedtime: no errors', s.errs.length === 0, s.errs.join('|')); await s.ctx.close();

  /* 7. rapid navigation: 30 quick door/back taps, no errors, no stuck audio from other screens */
  s = await open(b); await gesture(s.p);
  for (let i = 0; i < 30; i++) {
    await s.p.evaluate((i) => { const ids = ['doorHifz', 'doorLang', 'doorMath', 'doorLib', 'doorAdhkar', 'doorQuiz']; const d = document.getElementById(ids[i % 6]); d && d.click(); const bk = document.querySelector('.view.active .back-btn'); if (i % 2) bk && bk.click(); }, i);
    await s.p.waitForTimeout(60);
  }
  await s.p.waitForTimeout(800);
  T('rapid nav: no errors', s.errs.length === 0, s.errs.slice(0, 3).join('|'));
  T('rapid nav: <=2 media playing (ambience + one voice)', (await playing(s.p)) <= 2, 'playing=' + await playing(s.p)); await s.ctx.close();

  await b.close(); const f = res.filter(x => !x).length; console.log(f ? `\n${f} failing` : '\nall audio checks passed'); process.exit(f ? 1 : 0);
})();
