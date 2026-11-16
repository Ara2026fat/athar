#!/usr/bin/env node
/* Athar contrast audit — usage: NODE_PATH=$(npm root -g) node tools/qa/contrast.js <port> [out.json] [--vp 390x780] [--only a,b] [--shots dir]
   For every visible text element: reads the computed text colour (x ancestor opacity), hides all text, screenshots the
   page, samples the real rendered background (gradients/images included) under the text box and reports WCAG ratio.
   Text with text-shadow/stroke is judged on the median background (halo included), others on the 10th percentile. Fails below 4.5:1 (3:1 for large text: >=24px, or >=18.66px bold). Reuses the scenario list of regress.js. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const A = process.argv, arg = (k) => { const i = A.indexOf(k); return i > 0 ? A[i + 1] : null; };
const port = A[2] || '8844';
const out = A[3] && !A[3].startsWith('--') ? A[3] : path.join(__dirname, 'contrast-report.json');
const vpOnly = arg('--vp') ? arg('--vp').split(',') : ['390x780'];
const only = arg('--only') ? arg('--only').split(',') : null;
const BASE = `http://localhost:${port}/`;
const src = fs.readFileSync(path.join(__dirname, 'regress.js'), 'utf8');
const Q = '?t=day&first=0&nl=1'; const D = (id) => `#${id}`;
const SC = eval('(' + src.slice(src.indexOf('const SC = [') + 11, src.indexOf('];', src.indexOf('const SC = [')) + 1) + ')');

const COLLECT = () => {
  const vw = innerWidth, vh = innerHeight, res = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const idOf = (e) => (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '') || e.tagName.toLowerCase();
  const seen = new Set();
  for (let t; (t = w.nextNode());) {
    const s = t.nodeValue.trim(); if (!s) continue;
    const e = t.parentElement; if (!e || /^(SCRIPT|STYLE|NOSCRIPT|OPTION)$/.test(e.tagName)) continue;
    const rg = document.createRange(); rg.selectNodeContents(t); const r = rg.getBoundingClientRect();
    const er = e.getBoundingClientRect(); if (er.width < 3 || er.height < 3) continue; /* sr-only */
    if (e.ownerSVGElement) continue; /* SVG glyph icons: fill sits on an explicit shape, not sampled here */
    if (r.width < 2 || r.height < 2 || r.bottom <= 0 || r.right <= 0 || r.left >= vw || r.top >= vh) continue;
    let op = 1, hidden = false;
    for (let x = e; x; x = x.parentElement) { const c = getComputedStyle(x); if (c.display === 'none' || c.visibility === 'hidden') hidden = true; op *= +c.opacity; }
    if (hidden || op < 0.05) continue;
    const c = getComputedStyle(e);
    if (c.webkitTextFillColor && c.webkitTextFillColor !== c.color && /rgba?\(/.test(c.webkitTextFillColor)) { /* gradient/clip text handled by fill colour */ }
    const isSvg = !!e.ownerSVGElement || e.tagName === 'text' || e.tagName === 'tspan';
    const m = (isSvg ? c.fill : (c.webkitTextFillColor || c.color)).match(/[\d.]+/g)?.map(Number); if (!m) continue;
    if (c.backgroundClip === 'text' || c.webkitBackgroundClip === 'text') { /* gradient text: skip, report as note */ }
    const a = (m[3] === undefined ? 1 : m[3]) * op; if (a < 0.05) continue;
    const key = idOf(e) + '|' + s.slice(0, 12); if (seen.has(key)) continue; seen.add(key);
    const cx = Math.min(vw - 1, Math.max(0, (r.left + r.right) / 2)), cy = Math.min(vh - 1, Math.max(0, (r.top + r.bottom) / 2));
    const top = document.elementFromPoint(cx, cy); if (top && !e.contains(top) && !top.contains(e)) continue; /* covered by another element */
    const stroke = parseFloat(c.webkitTextStrokeWidth) >= 2 ? (c.webkitTextStrokeColor.match(/[\d.]+/g) || []).slice(0, 3).map(Number) : null;
    const halo = (c.textShadow && c.textShadow !== 'none') || parseFloat(c.webkitTextStrokeWidth) > 0;
    const fs = parseFloat(c.fontSize), bold = +c.fontWeight >= 700;
    res.push({ halo, stroke, sel: idOf(e), txt: s.slice(0, 20), rgb: [m[0], m[1], m[2]], a, fs, large: fs >= 24 || (fs >= 18.66 && bold),
      r: [Math.max(0, r.left), Math.max(0, r.top), Math.min(vw, r.right), Math.min(vh, r.bottom)], clip: c.backgroundClip === 'text' || c.webkitBackgroundClip === 'text' });
  }
  return res;
};
const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };

(async () => {
  const browser = await chromium.launch(); const report = [];
  if (arg('--shots')) fs.mkdirSync(arg('--shots'), { recursive: true });
  for (const vp of vpOnly) {
    const [w, h] = vp.split('x').map(Number);
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
    for (const sc of SC) {
      if (only && !only.includes(sc.n)) continue;
      const page = await ctx.newPage(); const res = { name: sc.n, vp, fails: [], checked: 0 };
      try {
        await page.goto(BASE + sc.u, { waitUntil: 'load', timeout: 30000 }); await page.waitForTimeout(sc.wait || 2200);
        let ok = true;
        for (const st of sc.s) {
          const sel = typeof st === 'string' ? st : st.sel, n = typeof st === 'string' ? 0 : st.n || 0;
          ok = await page.evaluate(([s, n]) => { const e = document.querySelectorAll(s)[n]; if (!e) return false; e.click(); return true; }, [sel, n]);
          await page.waitForTimeout(900); if (!ok) break;
        }
        await page.waitForTimeout(900);
        if (!ok) { res.skipped = true; } else {
          const items = await page.evaluate(COLLECT);
          await page.addStyleTag({ content: '*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;fill:transparent!important;caret-color:transparent!important;animation:none!important;transition:none!important}' });
          await page.waitForTimeout(250);
          const buf = await page.screenshot();
          if (arg('--shots')) fs.writeFileSync(path.join(arg('--shots'), `${sc.n}-${vp}.png`), buf);
          const px = await page.evaluate(async ([b64, items]) => {
            const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
            const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
            return items.map(it => { const [x0, y0, x1, y1] = it.r.map(Math.round); const W = Math.max(1, x1 - x0), H = Math.max(1, y1 - y0);
              const d = g.getImageData(x0, y0, W, H).data, out = []; const step = Math.max(1, Math.floor(Math.sqrt(W * H / 200)));
              for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) { const i = (y * W + x) * 4; out.push([d[i], d[i + 1], d[i + 2]]); }
              return out; });
          }, [buf.toString('base64'), items]);
          items.forEach((it, i) => {
            if (it.clip) return; res.checked++;
            if (it.stroke && it.stroke.length === 3) { const r0 = ratio(it.rgb, it.stroke); if (r0 >= (it.large ? 3 : 4.5)) return; } /* thick contrasting outline (paint-order stroke) */
            const rs = px[i].map(bg => { const fg = it.rgb.map((v, k) => v * it.a + bg[k] * (1 - it.a)); return ratio(fg, bg); }).sort((a, b) => a - b);
            const worst = rs[Math.floor(rs.length * (it.halo ? 0.5 : 0.1))] ?? rs[0], need = it.large ? 3 : 4.5;
            if (worst < need) res.fails.push({ sel: it.sel, txt: it.txt, ratio: +worst.toFixed(2), need, fs: it.fs, fg: `rgb(${it.rgb})`, a: +it.a.toFixed(2) });
          });
        }
      } catch (e) { res.harness = e.message.slice(0, 120); }
      report.push(res); await page.close();
    }
    await ctx.close();
  }
  await browser.close(); fs.writeFileSync(out, JSON.stringify(report, null, 1));
  let n = 0;
  for (const r of report) { if (r.skipped) { console.log('SKIP', r.name); continue; } if (r.harness) console.log('ERR', r.name, r.harness);
    for (const f of r.fails) { n++; console.log(`${r.name} @${r.vp} ${f.ratio}<${f.need} ${f.sel} "${f.txt}" ${f.fs}px ${f.fg} a=${f.a}`); } }
  console.log(`\n${report.length} screens, ${report.reduce((a, r) => a + r.checked, 0)} text items, ${n} below threshold; report: ${out}`);
  process.exit(n ? 1 : 0);
})();
