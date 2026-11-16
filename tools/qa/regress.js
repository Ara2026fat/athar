#!/usr/bin/env node
/* Athar regression QA — usage: NODE_PATH=$(npm root -g) node tools/qa/regress.js <port> [out.json] [--shots dir]
   Options: --only name,name  --vp 320x568,390x780  --shots dir
   Serves nothing: run `python3 -m http.server <port>` from the repo root first.
   Checks per screen x viewport: console/page errors, local 4xx/failed requests, vertical/horizontal overflow
   (document + active view), tap targets <44px, text <12px. Exit code 1 if any "critical" issue (errors/404/overflow). */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const port = process.argv[2] || '8844';
const out = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : path.join(__dirname, 'regress-report.json');
const si = process.argv.indexOf('--shots'); const shots = si > 0 ? process.argv[si + 1] : null;
const oi = process.argv.indexOf('--only'); const only = oi > 0 ? process.argv[oi + 1].split(',') : null;
const vi = process.argv.indexOf('--vp'); const vpOnly = vi > 0 ? process.argv[vi + 1].split(',') : null;
const BASE = `http://localhost:${port}/`;
const VPS = [[320, 568], [360, 640], [390, 780], [412, 915]];
const Q = '?t=day&first=0&nl=1';
const D = (id) => `#${id}`;
/* each scenario: name, url, steps (selector clicks run via DOM .click(); {sel,n} picks nth match; {wait} ms) */
const SC = [
  { n: 'home', u: 'index.html' + Q, s: [] },
  { n: 'door-hifz', u: 'index.html' + Q, s: [D('doorHifz')] },
  { n: 'surahs', u: 'index.html' + Q, s: [D('doorHifz'), D('choiceSurah')] },
  { n: 'ayahs', u: 'index.html' + Q, s: [D('doorHifz'), D('choiceAyah')] },
  { n: 'surah-open', u: 'index.html' + Q, s: [D('doorHifz'), D('choiceSurah'), { sel: '#surahGrid .surah-card,#surahGrid > *', n: 0 }] },
  { n: 'noor', u: 'index.html' + Q, s: [D('doorLang')] },
  { n: 'noor-lesson1', u: 'index.html' + Q, s: [D('doorLang'), { sel: '.noor-ls', n: 0 }] },
  { n: 'noor-lesson4', u: 'index.html' + Q, s: [D('doorLang'), { sel: '.noor-ls', n: 3 }] },
  { n: 'numbers', u: 'index.html' + Q, s: [D('doorMath')] },
  { n: 'num-add', u: 'index.html' + Q, s: [D('doorMath'), D('numTabAdd')] },
  { n: 'num-sub', u: 'index.html' + Q, s: [D('doorMath'), D('numTabSub')] },
  { n: 'num-mul', u: 'index.html' + Q, s: [D('doorMath'), D('numTabMul')] },
  { n: 'num-measure', u: 'index.html' + Q, s: [D('doorMath'), D('numTabMeasure')] },
  { n: 'num-play', u: 'index.html' + Q, s: [D('doorMath'), D('numTabPlay')] },
  { n: 'library', u: 'index.html' + Q, s: [D('doorLib')] },
  ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ n: 'lib-cat' + i, u: 'index.html' + Q, s: [D('doorLib'), { sel: '#view-library .choice-tile', n: i }] })),
  { n: 'quiz', u: 'index.html' + Q, s: [D('doorQuiz')] },
  ...[1, 2, 3, 4, 5].map(i => ({ n: 'quiz-tab' + i, u: 'index.html' + Q, s: [D('doorQuiz'), { sel: '#view-quiz .seg-btn', n: i }] })),
  { n: 'quiz-start', u: 'index.html' + Q, s: [D('doorQuiz'), { sel: '#view-quiz .choice-tile', n: 0 }] },
  { n: 'adhkar', u: 'index.html' + Q, s: [D('doorAdhkar')] },
  { n: 'adhkar-quiz', u: 'index.html' + Q, s: [D('doorAdhkar'), D('adkTabQuiz')] },
  { n: 'adhkar-item', u: 'index.html' + Q, s: [D('doorAdhkar'), { sel: '.adk-tile', n: 0 }] },
  { n: 'valley', u: 'valley/index.html', s: [], wait: 3500 },
];

async function clickStep(page, st) {
  if (typeof st === 'number') return page.waitForTimeout(st);
  const sel = typeof st === 'string' ? st : st.sel, n = typeof st === 'string' ? 0 : st.n || 0;
  const ok = await page.evaluate(([sel, n]) => {
    const e = document.querySelectorAll(sel)[n]; if (!e) return false; e.click(); return true;
  }, [sel, n]);
  await page.waitForTimeout(900);
  return ok;
}

const AUDIT = () => {
  const vw = innerWidth, vh = innerHeight;
  const vis = (e) => { const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false;
    if (r.bottom <= 0 || r.right <= 0 || r.left >= vw || r.top >= vh) return false;
    for (let x = e; x && x !== document.body; x = x.parentElement) { const c = getComputedStyle(x);
      if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity === 0 || c.pointerEvents === 'none' && x === e) return false; }
    return true; };
  const id = (e) => (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '') || e.tagName.toLowerCase();
  const txt = (e) => (e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 18);
  const act = document.querySelector('.view.active') || document.body;
  const de = document.scrollingElement;
  const o = { view: act.id || 'body', docV: de.scrollHeight - vh, docH: de.scrollWidth - vw, viewV: act.scrollHeight - act.clientHeight, viewH: act.scrollWidth - act.clientWidth };
  /* inner scrollers that actually scroll */
  o.scrollers = [...act.querySelectorAll('*')].filter(e => { const c = getComputedStyle(e); return /(auto|scroll)/.test(c.overflowY) && e.scrollHeight > e.clientHeight + 4 && e.clientHeight > 40 && vis(e); }).slice(0, 4).map(e => id(e) + ' +' + (e.scrollHeight - e.clientHeight));
  const sel = 'button,a[href],[role=button],input,select,textarea,summary,.choice-tile,.letter-tile,.adk-tile,.seg-btn,[onclick],[data-go]';
  const seen = new Set(); o.small = [];
  for (const e of document.querySelectorAll(sel)) {
    if (!vis(e) || e.closest('[hidden],[aria-hidden=true]') && !e.matches('button,a,input')) continue;
    if (e.closest('svg')) continue;
    const r = e.getBoundingClientRect();
    let ew = r.width, eh = r.height; /* extended hit area via absolutely-positioned ::before/::after (computed px) */
    for (const ps of ['::after', '::before']) { const c = getComputedStyle(e, ps); if (c.content !== 'none' && c.position === 'absolute') { ew = Math.max(ew, parseFloat(c.width) || 0); eh = Math.max(eh, parseFloat(c.height) || 0); } }
    if (ew < 43.5 || eh < 43.5) { const k = id(e); if (seen.has(k)) continue; seen.add(k); o.small.push(`${k} ${Math.round(r.width)}x${Math.round(r.height)} "${txt(e)}"`); }
  }
  seen.clear(); o.tiny = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let t; (t = w.nextNode());) {
    if (!t.nodeValue.trim()) continue; const e = t.parentElement; if (!e || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(e.tagName) || !vis(e)) continue;
    const fs = parseFloat(getComputedStyle(e).fontSize);
    if (fs < 12) { const k = id(e) + ' ' + fs; if (seen.has(k)) continue; seen.add(k); o.tiny.push(`${id(e)} ${fs}px "${t.nodeValue.trim().slice(0, 14)}"`); }
  }
  return o;
};

(async () => {
  const browser = await chromium.launch();
  const report = [];
  if (shots) fs.mkdirSync(shots, { recursive: true });
  for (const [w, h] of VPS) {
    if (vpOnly && !vpOnly.includes(`${w}x${h}`)) continue;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
    for (const sc of SC) {
      if (only && !only.includes(sc.n)) continue;
      const page = await ctx.newPage();
      const errs = [], nf = [];
      page.on('pageerror', (e) => errs.push('pageerror: ' + e.message.slice(0, 160)));
      page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('console: ' + m.text().slice(0, 160)); });
      page.on('response', (r) => { if (r.url().startsWith(BASE) && r.status() >= 400) nf.push(r.status() + ' ' + r.url().replace(BASE, '')); });
      page.on('requestfailed', (r) => { if (r.url().startsWith(BASE) && !/net::ERR_ABORTED/.test(r.failure()?.errorText || '')) nf.push('FAIL ' + r.url().replace(BASE, '')); });
      let res = { name: sc.n, vp: `${w}x${h}` };
      try {
        await page.goto(BASE + sc.u, { waitUntil: 'load', timeout: 30000 });
        await page.waitForTimeout(sc.wait || 2200);
        let ok = true;
        for (const st of sc.s) { const r = await clickStep(page, st); if (r === false) { ok = false; break; } }
        await page.waitForTimeout(700);
        if (!ok) res.skipped = 'selector not found';
        else { Object.assign(res, await page.evaluate(AUDIT)); if (shots) await page.screenshot({ path: path.join(shots, `${sc.n}-${w}x${h}.png`) }); }
      } catch (e) { errs.push('harness: ' + e.message.slice(0, 120)); }
      res.errors = [...new Set(errs)]; res.notFound = [...new Set(nf)];
      report.push(res); await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(out, JSON.stringify(report, null, 1));
  let crit = 0; const lines = [];
  for (const r of report) {
    if (r.skipped) { lines.push(`SKIP ${r.name} @${r.vp}`); continue; }
    const f = [];
    if (r.errors.length) f.push(`errors:${r.errors.length}`);
    if (r.notFound.length) f.push(`404:${r.notFound.length}`);
    if (r.docV > 1) f.push(`overflowV:${r.docV}`);
    if (r.docH > 1) f.push(`overflowH:${r.docH}`);
    if (f.length) crit++;
    if (r.small.length) f.push(`tap<44:${r.small.length}`);
    if (r.tiny.length) f.push(`text<12:${r.tiny.length}`);
    if (f.length) lines.push(`${r.name} @${r.vp}  ${f.join(' ')}`);
  }
  console.log(lines.join('\n'));
  console.log(`\n${report.length} runs, ${crit} with critical issues; report: ${out}`);
  process.exit(crit ? 1 : 0);
})();
