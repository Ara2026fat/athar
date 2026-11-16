#!/usr/bin/env node
/* Athar a11y audit — usage: NODE_PATH=$(npm root -g) node tools/qa/a11y.js <port> [--vp 390x780] [--only a,b] [--rm]
   Per scenario (scenarios taken from regress.js): visible controls without an accessible name, <img> without alt,
   heading outline of the active view (no h1 / several h1 / skipped levels), and with --rm (prefers-reduced-motion emulation)
   the number of still-running infinite CSS animations. Exit 1 if anything is found. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const A = process.argv, arg = (k) => { const i = A.indexOf(k); return i > 0 ? A[i + 1] : null; };
const port = A[2] || '8844', vp = (arg('--vp') || '390x780').split('x').map(Number), only = arg('--only') ? arg('--only').split(',') : null, RM = A.includes('--rm');
const BASE = `http://localhost:${port}/`;
const src = fs.readFileSync(path.join(__dirname, 'regress.js'), 'utf8');
const Q = '?t=day&first=0&nl=1'; const D = (id) => `#${id}`;
const SC = eval('(' + src.slice(src.indexOf('const SC = [') + 11, src.indexOf('];', src.indexOf('const SC = [')) + 1) + ')');
const AUDIT = () => {
  const vis = (e) => { const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false;
    for (let x = e; x && x !== document.body; x = x.parentElement) { const c = getComputedStyle(x); if (c.display === 'none' || c.visibility === 'hidden') return false; if (x.hasAttribute('hidden')) return false; }
    return true; };
  const id = (e) => (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '') || e.tagName.toLowerCase();
  const name = (e) => { const lb = e.getAttribute('aria-labelledby'); if (lb) return lb.split(/\s+/).map(i => (document.getElementById(i) || {}).textContent || '').join(' ').trim();
    if ((e.getAttribute('aria-label') || '').trim()) return e.getAttribute('aria-label').trim();
    let t = (e.innerText || e.textContent || '').trim(); if (t) return t;
    for (const i of e.querySelectorAll('img[alt]')) if (i.alt.trim()) return i.alt.trim();
    const st = e.querySelector('svg title'); if (st && st.textContent.trim()) return st.textContent.trim();
    if ((e.getAttribute('title') || '').trim()) return e.getAttribute('title').trim();
    if (e.labels && e.labels.length) return [...e.labels].map(l => l.textContent).join(' ').trim();
    return e.getAttribute('placeholder') || ''; };
  const o = { noName: [], noAlt: [], deco: [], headings: [], anim: 0 };
  const act = document.querySelector('.view.active') || document.body;
  for (const e of document.querySelectorAll('button,a[href],[role=button],[role=tab],[role=link],input:not([type=hidden]),select,textarea,summary')) {
    if (!vis(e) || e.closest('[aria-hidden=true]')) continue; if (!name(e)) o.noName.push(id(e));
  }
  for (const i of document.querySelectorAll('img')) { if (!vis(i)) continue; if (!i.hasAttribute('alt')) o.noAlt.push(id(i) + ' ' + (i.getAttribute('src') || '').slice(-30)); else if (i.alt.trim() && i.closest('button,a') && name(i.closest('button,a')) === i.alt.trim() && i.closest('button,a').textContent.trim() === '') { /* alt used as the name: ok */ } }
  const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6,[role=heading]")].filter(h => { const r = h.getBoundingClientRect(); for (let x = h; x && x !== document.body; x = x.parentElement) { const c = getComputedStyle(x); if (c.display === 'none' || c.visibility === 'hidden') return false; } return true; }); o.headings = hs.map(h => h.tagName + ':' + (h.textContent || '').trim().slice(0, 16));
  const lv = hs.map(h => +(h.getAttribute('aria-level') || h.tagName[1])); o.h1 = lv.filter(x => x === 1).length; o.skip = lv.some((x, i) => i && x - lv[i - 1] > 1) || (lv.length && lv[0] > 2);
  o.anim = document.getAnimations().filter(a => a.effect && a.effect.getComputedTiming().iterations === Infinity && a.playState === 'running' && a.effect.target && vis(a.effect.target)).length;
  return o;
};
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: vp[0], height: vp[1] }, hasTouch: true, isMobile: true, reducedMotion: RM ? 'reduce' : 'no-preference' });
  let n = 0;
  for (const sc of SC) {
    if (only && !only.includes(sc.n)) continue;
    const p = await ctx.newPage();
    try {
      await p.goto(BASE + sc.u, { waitUntil: 'load', timeout: 30000 }); await p.waitForTimeout(sc.wait || 2200);
      let ok = true;
      for (const st of sc.s) { const sel = typeof st === 'string' ? st : st.sel, k = typeof st === 'string' ? 0 : st.n || 0;
        ok = await p.evaluate(([s, k]) => { const e = document.querySelectorAll(s)[k]; if (!e) return false; e.click(); return true; }, [sel, k]); await p.waitForTimeout(900); if (!ok) break; }
      if (!ok) { console.log('SKIP', sc.n); await p.close(); continue; }
      await p.waitForTimeout(600); const r = await p.evaluate(AUDIT); const f = [];
      if (r.noName.length) f.push('noName[' + [...new Set(r.noName)].join(', ') + ']');
      if (r.noAlt.length) f.push('noAlt[' + [...new Set(r.noAlt)].join(', ') + ']');
      if (r.h1 !== 1) f.push('h1=' + r.h1); if (r.skip) f.push('headingSkip');
      if (RM && r.anim) f.push('runningInfiniteAnims=' + r.anim);
      if (f.length) { n++; console.log(sc.n + ': ' + f.join(' ') + '  ' + r.headings.join(' ')); }
    } catch (e) { console.log('ERR', sc.n, e.message.slice(0, 100)); }
    await p.close();
  }
  await b.close(); console.log(`\n${n} screens with findings`); process.exit(n ? 1 : 0);
})();
