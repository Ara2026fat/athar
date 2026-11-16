#!/usr/bin/env node
/* Athar smoke + PWA check — usage: NODE_PATH=$(npm root -g) node tools/qa/smoke.js <port>
   Boots index.html at 390x780 and 320x568: no page errors, home visible, no horizontal overflow;
   validates manifest.json (fields, icons exist with real PNG sizes) and head meta tags. Exit 1 on failure. */
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const port = process.argv[2] || '8854', root = path.join(__dirname, '..', '..');
const problems = []; const bad = (m) => problems.push(m);
function png(f) { try { const d = fs.readFileSync(path.join(root, f)); return d.slice(1, 4).toString() === 'PNG' ? [d.readUInt32BE(16), d.readUInt32BE(20)] : null; } catch (e) { return null; } }
const m = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
['name', 'short_name', 'start_url', 'scope', 'display', 'lang', 'dir', 'background_color', 'theme_color', 'id'].forEach(k => { if (!m[k]) bad('manifest missing ' + k); });
if (m.display !== 'standalone') bad('manifest display not standalone');
let any192 = 0, any512 = 0, mask = 0;
(m.icons || []).forEach(i => { const d = png(i.src), [w, h] = (i.sizes || '').split('x').map(Number);
  if (!d) return bad('icon missing/not png: ' + i.src);
  if (d[0] !== w || d[1] !== h) bad(`icon size mismatch ${i.src}: ${d} vs ${i.sizes}`);
  if (/any/.test(i.purpose || 'any') && w === 192) any192++; if (/any/.test(i.purpose || 'any') && w === 512) any512++; if (/maskable/.test(i.purpose || '')) mask++; });
if (!any192 || !any512 || !mask) bad('need any 192, any 512 and a maskable icon');
if (!fs.existsSync(path.join(root, m.start_url.replace(/^\.\//, '').split('?')[0]))) bad('start_url file missing');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const meta = (re, n) => { if (!re.test(html)) bad('index.html missing ' + n); };
meta(/<meta name="theme-color" content="#[0-9a-fA-F]{6}"/, 'theme-color'); meta(/viewport-fit=cover/, 'viewport-fit=cover');
meta(/<link rel="apple-touch-icon"/, 'apple-touch-icon'); meta(/apple-mobile-web-app-capable/, 'apple-mobile-web-app-capable'); meta(/rel="manifest"/, 'manifest link');
const th = (html.match(/<meta name="theme-color" content="(#[0-9a-fA-F]{6})"/) || [])[1];
if (th && m.theme_color.toLowerCase() !== th.toLowerCase()) bad(`theme_color mismatch: manifest ${m.theme_color} vs meta ${th}`);
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[390, 780], [320, 568]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true }), page = await ctx.newPage(); const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.goto(`http://localhost:${port}/index.html?t=day&first=0&nl=1`, { waitUntil: 'load' }); await page.waitForTimeout(1500);
    const r = await page.evaluate(() => ({ view: (document.querySelector('.view.active') || {}).id, ox: document.documentElement.scrollWidth - innerWidth, oy: document.documentElement.scrollHeight - innerHeight }));
    if (r.view !== 'view-home') bad(`${w}x${h}: home not active (${r.view})`);
    if (r.ox > 1) bad(`${w}x${h}: horizontal overflow ${r.ox}px`);
    if (errs.length) bad(`${w}x${h}: page errors ${errs.slice(0, 2).join(' | ')}`);
    await ctx.close();
  }
  await b.close();
  console.log(problems.length ? 'FAIL smoke\n  ' + problems.join('\n  ') : 'ok   smoke + PWA manifest/meta'); process.exit(problems.length ? 1 : 0);
})();
