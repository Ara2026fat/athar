#!/usr/bin/env node
/* Wire check for the Higgsfield batch. Run AFTER postprocess.py dropped the files into the repo.
 *   (server)  cd /home/claude/athar && setsid nohup python3 -m http.server 8099 >/dev/null 2>&1 &
 *   node next/release/batch/wire_check.js            # BASE=http://localhost:8099 OUT=/tmp/next/wire
 * Reports: (1) files referenced by code that do not exist, (2) map variants present / same geometry,
 * (3) hit-area overlay screenshots + a landmark-detail heuristic per hit rect, (4) door screenshot, (5) marks contact sheet.
 * Exit code 1 when anything is missing or WARN-level misalignment is found.
 */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..', '..', '..');
const BASE = process.env.BASE || 'http://localhost:8099';
const OUT = process.env.OUT || '/tmp/next/wire';
fs.mkdirSync(OUT, { recursive: true });
const HIT = { masjid: [266, 293, 112, 110], hill: [138, 322, 160, 88], home: [10, 334, 172, 157], spring: [0, 480, 400, 116], road: [236, 409, 152, 311] };
const problems = [], notes = [];
const exists = p => fs.existsSync(path.join(ROOT, p));
const rd = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

/* ---------- 1. static reference scan ---------- */
const vjs = rd('next/valley/valley.js');
const m3 = JSON.parse(/var M3 = (\[\[[\s\S]*?\]\]);/.exec(vjs)[1]);
let patch = [];
try { patch = JSON.parse(rd('next/release/batch/m3_patch.json')).M3_additions; } catch (e) {}
const markStems = [...new Set(m3.map(a => a[1]))];
const patchStems = [...new Set(patch.map(a => a[1]))];
const refs = [];
markStems.forEach(s => refs.push(['mark (in M3 now)', 'valley/img/marks/' + s + '.webp']));
patchStems.forEach(s => refs.push(['mark (m3_patch, optional until wired)', 'valley/img/marks/' + s + '.webp']));
['map_day', 'map_sun', 'map_night'].forEach(n => refs.push(['map (all 3 needed or none activates)', 'valley/img/map/' + n + '.webp']));
const world = rd('next/home/world.js');
const doorKeys = [...new Set([...world.matchAll(/\{k:"(\w+)"/g)].map(m => m[1]))];
(/var D3=\{([\s\S]*?)\};/.exec(world) || ['', ''])[1].split(/\n/).forEach(l => { const m = /^(\w+):/.exec(l.trim()); if (m && !doorKeys.includes(m[1])) doorKeys.push(m[1]); });
doorKeys.forEach(k => refs.push(['home door', 'next/home/img/doors/' + (k === 'valley' ? 'valley_win' : k) + '.webp']));
const missing = refs.filter(r => !exists(r[1]));
const must = missing.filter(r => !/optional/.test(r[0]));
console.log('referenced files: ' + refs.length + ', missing: ' + missing.length);
missing.forEach(r => console.log('  MISSING [' + r[0] + '] ' + r[1]));
must.forEach(r => problems.push('missing ' + r[1]));
const mapsPresent = ['map_day', 'map_sun', 'map_night'].filter(n => exists('valley/img/map/' + n + '.webp'));
if (mapsPresent.length && mapsPresent.length < 3) problems.push('map: only ' + mapsPresent.join(',') + ' present - painted map will NOT activate');
patch.filter(a => !m3.some(b => b[0] === a[0]) && exists('valley/img/marks/' + a[1] + '.webp')).length &&
  notes.push('m3_patch.json has marks whose image exists but are not yet in the M3 array - append them to next/valley/valley.js');

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
  const reqFail = [];
  /* ---------- 2/3. map variants + hit overlay ---------- */
  if (mapsPresent.length) {
    const p = await ctx.newPage();
    p.on('response', r => { if (r.status() >= 400) reqFail.push(r.status() + ' ' + r.url()); });
    await p.goto(BASE + '/valley/next.html?kid=0', { waitUntil: 'load' });
    await p.waitForTimeout(2500);
    const painted = await p.evaluate(() => !!(window.VX && VX.paint && VX.paint()));
    console.log('painted map active: ' + painted);
    if (mapsPresent.length === 3 && !painted) problems.push('3 map files exist but VX.paint() is false (image failed to load?)');
    for (const [name, ph] of [['day', 0], ['sun', 1], ['night', 2]]) {
      await p.evaluate(ph => { try { World.phase(ph); } catch (e) {} }, ph);
      await p.waitForTimeout(900);
      await p.screenshot({ path: path.join(OUT, 'map_' + name + '.png') });
      await p.evaluate(HIT => {
        const s = document.getElementById('scene'); const old = s.querySelector('#hitdbg'); if (old) old.remove();
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.id = 'hitdbg'; g.style.pointerEvents = 'none';
        Object.entries(HIT).forEach(([k, r], i) => {
          const c = ['#ff2d55', '#ffd60a', '#32d74b', '#0a84ff', '#bf5af2'][i];
          g.insertAdjacentHTML('beforeend', '<rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" fill="' + c + '" fill-opacity=".14" stroke="' + c + '" stroke-width="2.5"/>' +
            '<text x="' + (r[0] + 4) + '" y="' + (r[1] + 16) + '" font-size="13" font-weight="700" fill="#fff" stroke="#000" stroke-width=".6">' + k + '</text>');
        });
        s.appendChild(g);
      }, HIT);
      await p.screenshot({ path: path.join(OUT, 'map_' + name + '_hit.png') });
      console.log('screenshots: map_' + name + '.png / map_' + name + '_hit.png');
    }
    /* landmark-detail heuristic on the raw map files (edge density inside each hit rect vs whole image) + variant geometry consistency */
    const stats = await p.evaluate(async ({ HIT, names }) => {
      const load = n => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = '/valley/img/map/' + n + '.webp'; });
      const res = {}; const edges = {};
      for (const n of names) {
        const im = await load(n); if (!im) continue;
        const W = 405, H = 720, c = document.createElement('canvas'); c.width = W; c.height = H;
        const x = c.getContext('2d'); x.drawImage(im, 0, 0, W, H);
        const d = x.getImageData(0, 0, W, H).data, g = new Float32Array(W * H);
        for (let i = 0; i < W * H; i++) g[i] = .3 * d[4 * i] + .59 * d[4 * i + 1] + .11 * d[4 * i + 2];
        const e = new Float32Array(W * H);
        for (let y = 1; y < H - 1; y++) for (let xx = 1; xx < W - 1; xx++) { const i = y * W + xx; e[i] = Math.abs(g[i + 1] - g[i - 1]) + Math.abs(g[i + W] - g[i - W]); }
        edges[n] = e;
        let tot = 0; for (let i = 0; i < e.length; i++) tot += e[i];
        const avg = tot / e.length, per = {};
        for (const [k, r] of Object.entries(HIT)) {
          let s = 0, cnt = 0;
          for (let y = r[1]; y < Math.min(H, r[1] + r[3]); y++) for (let xx = r[0]; xx < Math.min(W, r[0] + r[2]); xx++) { s += e[y * W + xx]; cnt++; }
          per[k] = +((s / cnt) / avg).toFixed(2);
        }
        res[n] = { ratio: per };
      }
      /* geometry consistency: correlation of blurred edge maps vs day */
      const blur = (e, W, H) => { const o = new Float32Array(W * H / 64 | 0), w8 = W >> 3, h8 = H >> 3; const t = new Float32Array(w8 * h8); for (let y = 0; y < h8 * 8; y++) for (let x = 0; x < w8 * 8; x++) t[(y >> 3) * w8 + (x >> 3)] += e[y * W + x]; return t; };
      const base = edges.map_day && blur(edges.map_day, 405, 720);
      for (const n of names) if (n !== 'map_day' && edges[n] && base) {
        const t = blur(edges[n], 405, 720); let ma = 0, mb = 0; for (let i = 0; i < t.length; i++) { ma += base[i]; mb += t[i]; } ma /= t.length; mb /= t.length;
        let nu = 0, da = 0, db = 0; for (let i = 0; i < t.length; i++) { const a = base[i] - ma, b = t[i] - mb; nu += a * b; da += a * a; db += b * b; }
        res[n].corr_vs_day = +(nu / Math.sqrt(da * db)).toFixed(3);
      }
      return res;
    }, { HIT, names: mapsPresent });
    console.log('hit-rect edge-density ratio (landmark areas should be >= 1.2 on day; variants should correlate >= 0.80 with day):');
    for (const [n, s] of Object.entries(stats)) {
      console.log('  ' + n + ' ' + JSON.stringify(s));
      if (s.corr_vs_day !== undefined && s.corr_vs_day < 0.8) problems.push(n + ': geometry differs from map_day (corr ' + s.corr_vs_day + ') - hit areas will not fit all variants');
    }
    if (stats.map_day) for (const k of ['masjid', 'hill', 'home']) if (stats.map_day.ratio[k] < 1.2) problems.push('map_day: hit rect "' + k + '" has low detail (' + stats.map_day.ratio[k] + ') - landmark probably not under it, inspect map_day_hit.png');
    await p.close();
  } else notes.push('no map files yet - map checks skipped');

  /* ---------- 4. home doors ---------- */
  {
    const p = await ctx.newPage();
    p.on('response', r => { if (r.status() >= 400 && /doors\//.test(r.url())) reqFail.push(r.status() + ' ' + r.url()); });
    await p.goto(BASE + '/home-next.html?t=day&first=0', { waitUntil: 'load' });
    await p.waitForTimeout(2200);
    const info = await p.evaluate(() => [...document.querySelectorAll('.wb')].map(e => ({ id: e.id, d3: e.classList.contains('d3on') })));
    console.log('doors 3D active: ' + info.map(i => i.id.replace('wb-', '') + '=' + (i.d3 ? 'yes' : 'fallback-svg')).join(' '));
    await p.screenshot({ path: path.join(OUT, 'home_doors.png') });
    await p.close();
  }

  /* ---------- 5. contact sheet of all marks ---------- */
  {
    const dir = path.join(ROOT, 'valley/img/marks');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.webp')).sort();
    const inM3 = new Set(m3.map(a => a[1]));
    const html = '<body style="margin:0;background:#7fa66a;font:11px sans-serif"><div style="display:grid;grid-template-columns:repeat(8,1fr);gap:6px;padding:8px">' +
      files.map(f => { const kb = (fs.statSync(path.join(dir, f)).size / 1024).toFixed(0); const s = f.replace('.webp', ''); return '<div style="background:#ffffff40;border-radius:8px;padding:4px;text-align:center;' + (kb > 40 ? 'outline:3px solid red;' : '') + '"><img src="' + BASE + '/valley/img/marks/' + f + '" style="width:100%;height:110px;object-fit:contain"><div>' + s + ' ' + kb + 'KB' + (inM3.has(s) ? '' : ' (unwired)') + '</div></div>'; }).join('') + '</div></body>';
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
    await p.setContent(html); await p.waitForTimeout(1200);
    await p.screenshot({ path: path.join(OUT, 'marks_sheet.png'), fullPage: true });
    console.log('marks on disk: ' + files.length + ' -> marks_sheet.png');
    files.filter(f => fs.statSync(path.join(dir, f)).size > 40 * 1024).forEach(f => problems.push('mark over 40KB: ' + f));
    await p.close();
  }
  reqFail.length && console.log('HTTP errors:\n  ' + [...new Set(reqFail)].join('\n  '));
  await b.close();
  notes.forEach(n => console.log('note: ' + n));
  console.log(problems.length ? '\nPROBLEMS (' + problems.length + '):\n - ' + problems.join('\n - ') : '\nOK - nothing missing, no misalignment flagged');
  console.log('screenshots in ' + OUT);
  process.exit(problems.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
