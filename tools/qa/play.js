#!/usr/bin/env node
/* Athar game autoplayer — plays every quiz/game to its end screen.
   usage: NODE_PATH=$(npm root -g) node tools/qa/play.js <port> [--vp 320x568,390x780] [--only mem,pairs,odd,path,stories-all,deen-all,...] [--shots dir]
   Needs `python3 -m http.server <port>` from the repo root. Exit 1 if any game does not reach its end card or throws.
   Page kinds handled: ذاكرة الفوانيس (lamp order captured via MutationObserver), أزواج متطابقة (reads card faces),
   من لا يشبه الباقي (tries buttons), طريق الكنز (BFS from DOM), qa/lantern-ask pages (data-right), story/scene pages (next). */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const port = process.argv[2] || '8875';
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const vps = (arg('--vp') || '320x568,390x780').split(',').map(s => s.split('x').map(Number));
const only = arg('--only') ? arg('--only').split(',') : null;
const shots = arg('--shots'); if (shots) fs.mkdirSync(shots, { recursive: true });
const BASE = `http://localhost:${port}/index.html?t=day&first=0&nl=1`;
/* tab label, tile index, name */
const GAMES = [
  ['ذكاء', 0, 'mem'], ['ذكاء', 1, 'pairs'], ['ذكاء', 2, 'odd'], ['ذكاء', 3, 'path'],
  ['قصص', 0, 'stories-all'], ['قصص', 1, 'stories-sahaba'], ['قصص', 2, 'stories-rahma'], ['قصص', 3, 'stories-ibada'], ['قصص', 4, 'stories-anbiya'],
  ['ديني', 0, 'deen-all'], ['ديني', 1, 'deen-ibadat'], ['ديني', 2, 'deen-akhlaq'], ['ديني', 3, 'deen-adab'], ['ديني', 4, 'deen-sira'],
];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function installObservers(page) {
  await page.evaluate(() => {
    window.__lit = [];
    new MutationObserver(ms => ms.forEach(m => {
      const t = m.target;
      if (m.attributeName === 'class' && t.classList && t.classList.contains('br-lamp') && t.classList.contains('lit') && !(m.oldValue || '').includes('lit')) {
        const i = Array.prototype.indexOf.call(t.parentElement.children, t); window.__lit.push(i);
      }
    })).observe(document.body, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['class'] });
  });
}

/* one step of the generic player; returns a string describing what it did, or 'end' */
async function step(page, ctx) {
  return await page.evaluate(async (ctx) => {
    const vis = (e) => e && e.offsetParent !== null;
    const click = (e) => { e.click(); return true; };
    if (document.querySelector('.wg.ge .ge-title')) return 'end';
    /* brain games */
    const brain = document.getElementById('view-brain');
    if (brain && brain.classList.contains('active')) {
      if (brain.querySelector('.br-lamp')) return 'wait';   /* handled by lampTurn */
      const cards = [...brain.querySelectorAll('.br-card')];
      if (cards.length) {
        const by = {};
        cards.forEach((c, i) => { if (c.classList.contains('ok')) return; const f = c.querySelector('.bb').innerHTML;   /* emoji are swapped for SVG icons, so key on markup */ (by[f] = by[f] || []).push(c); });
        const pair = Object.values(by).find(a => a.length >= 2);
        if (!pair) return 'wait';
        if (cards.some(c => c.classList.contains('up') && !c.classList.contains('ok'))) return 'wait';
        pair[0].click(); pair[1].click(); return 'pair';
      }
      const odd = [...brain.querySelectorAll('.br-opt')].filter(b => !b.disabled && !b.classList.contains('gone'));
      if (odd.length) {
        /* faces are SVG icons (no text to classify): try buttons in order; the 3rd wrong tap reveals and advances */
        const pick = odd[0];
        pick.click(); return 'odd';
      }
      const grid = brain.querySelector('.br-grid');
      if (grid) {
        if (ctx.busyPath && Date.now() - ctx.busyPath < 400) return 'wait';
        const n = +getComputedStyle(grid).getPropertyValue('--n');
        const cells = [...grid.querySelectorAll('.br-cell')];
        const obs = new Set(), g = [0, n - 1];   /* goal is always the top-right cell; any other non-empty cell is a rock (icons are SVG, not text) */
        cells.forEach((c, i) => { const r = Math.floor(i / n), cc = i % n; if (c.innerHTML.trim() && !(r === g[0] && cc === g[1])) obs.add(r + ',' + cc); });
        const prog = brain.querySelector('.br-prog');
        const chips = prog.querySelectorAll('span').length;   /* chips present = a run is in progress or a plan is queued */
        if (chips) return 'wait-run';
        const D = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] };
        const q = [[n - 1, 0, '']], seen = new Set([(n - 1) + ',0']); let path = null;
        while (q.length) { const [r, c, p] = q.shift(); if (r === g[0] && c === g[1]) { path = p; break; } for (const d in D) { const nr = r + D[d][0], nc = c + D[d][1], k = nr + ',' + nc; if (nr < 0 || nc < 0 || nr >= n || nc >= n || obs.has(k) || seen.has(k)) continue; seen.add(k); q.push([nr, nc, p + d]); } }
        if (!path) return 'nopath';
        for (const d of path) brain.querySelector('.br-arrow[data-d="' + d + '"]').click();
        [...brain.querySelectorAll('.pill-btn')].find(b => b.textContent.includes('انطلق')).click();
        return 'path:' + path;
      }
      return 'wait';
    }
    /* library pages (stories / deen quizzes) */
    const lib = document.getElementById('libBody');
    if (lib && vis(lib)) {
      const right = lib.querySelector('[data-right]:not(.ok)');
      if (right && vis(right) && right.parentElement.style.display !== 'none') { right.click(); return 'qa'; }
      const nx = [...lib.querySelectorAll('.pill-btn')].find(b => !b.disabled && vis(b) && /التالي|أنهيت/.test(b.textContent));
      if (nx) { nx.click(); return 'next'; }
      return 'wait';
    }
    return 'unknown';
  }, ctx);
}

(async () => {
  const browser = await chromium.launch();
  let fail = 0; const rows = [];
  for (const [w, h] of vps) {
    const context = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    for (const [tab, idx, name] of GAMES) {
      if (only && !only.includes(name)) continue;
      const page = await context.newPage(); const errs = [];
      page.on('pageerror', e => errs.push(String(e)));
      page.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errs.push(m.text()); });
      const t0 = Date.now(); let status = 'timeout', steps = 0, overflow = 0, overflowAt = '';
      try {
        await page.goto(BASE, { waitUntil: 'load' });
        await page.waitForSelector('#doorQuiz', { state: 'attached' });
        await page.evaluate(() => document.getElementById('doorQuiz').click());
        await page.evaluate((tab) => [...document.querySelectorAll('#view-quiz .seg-btn')].find(b => b.textContent.trim() === tab).click(), tab);
        await page.evaluate((i) => document.querySelectorAll('#quizBody .choice-tile')[i].click(), idx);
        await installObservers(page);
        const isLamp = name === 'mem';
        const ctx = {};
        for (let i = 0; i < 900; i++) {
          if (isLamp) {
            const r = await lampTurn(page);
            if (r === 'end') { status = 'ok'; break; }
          } else {
            const r = await step(page, ctx);
            if (r === 'end') { status = 'ok'; break; }
            if (r.startsWith('path')) ctx.busyPath = Date.now();
            steps++;
          }
          /* every screen must fit without vertical scroll */
          const o = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
          if (o > 1 && o > overflow) { overflow = o; overflowAt = await page.evaluate(() => { let b = null, m = 0; document.querySelectorAll('body *').forEach(e => { const r = e.getBoundingClientRect(); if (r.height && r.bottom > m && getComputedStyle(e).position !== 'fixed') { m = r.bottom; b = e; } }); return [...document.querySelectorAll('#brainBody > *')].map(e => e.className + ':' + Math.round(e.getBoundingClientRect().height)).join(',') + ' ' + (b ? (b.tagName + '.' + b.className + '<' + (b.parentElement.id || b.parentElement.className) + ' ' + b.outerHTML.slice(0, 90).replace(/\s+/g, ' ')) : ''); }); }
          await sleep(isLamp ? 150 : 120);
          if (Date.now() - t0 > 150000) break;
        }
        if (shots) await page.screenshot({ path: path.join(shots, `${name}-${w}x${h}.png`) });
      } catch (e) { errs.push('script: ' + e.message.split('\n')[0]); status = 'error'; }
      const ok = status === 'ok' && !errs.length;
      if (!ok) fail++;
      rows.push(`${ok ? 'PASS' : 'FAIL'} ${w}x${h} ${name} ${status} ${((Date.now() - t0) / 1000).toFixed(1)}s steps=${steps}${overflow ? ' overflowY=' + overflow + '@' + overflowAt : ''}${errs.length ? ' ERR=' + errs.slice(0, 2).join(' | ') : ''}`);
      console.log(rows[rows.length - 1]);
      await page.close();
    }
    await context.close();
  }
  await browser.close();
  console.log(fail ? `${fail} FAILED` : 'ALL PASSED');
  process.exit(fail ? 1 : 0);
})();

/* lantern memory: wait until the message says it's our turn, then replay the sequence that was just shown */
async function lampTurn(page) {
  return await page.evaluate(async () => {
    if (document.querySelector('.wg.ge .ge-title')) return 'end';
    const brain = document.getElementById('view-brain');
    const msg = ((brain && brain.querySelector('.br-msg')) || {}).textContent || '';
    const lamps = brain ? [...brain.querySelectorAll('.br-lamp')] : [];
    if (!lamps.length || !msg.startsWith('دورك')) { return 'wait'; }
    /* sequence = flashes recorded since the show phase began (message switched to the "watch" text) */
    const log = window.__lit; const start = window.__showStart || 0;
    const seq = log.slice(start);
    if (!seq.length) return 'wait';
    for (const k of seq) { lamps[k].click(); await new Promise(r => setTimeout(r, 40)); }
    await new Promise(r => setTimeout(r, 80));
    window.__showStart = window.__lit.length;   /* next show phase starts after our own taps (they light the lamps too) */
    return 'played';
  });
}
