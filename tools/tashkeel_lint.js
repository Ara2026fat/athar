#!/usr/bin/env node
/* أداة فحص التشكيل لصفحات مراجعة المكتبة (tools/libfix/NN.html)
 *
 * الاستعمال:
 *   node tools/tashkeel_lint.js                 كل الصفحات 10..24
 *   node tools/tashkeel_lint.js 10 11 17        صفحات محددة
 *   node tools/tashkeel_lint.js --verbose 12    مع تفصيل كل خطأ/تحذير
 *   node tools/tashkeel_lint.js --warn 12       يعرض أيضًا تحذيرات «الاكتمال» (heuristic)
 *   node tools/tashkeel_lint.js --json          نتيجة آلية
 *
 * الفحوص:
 *  (أ) [خطأ قاطع]  طول DRAFT = طول LINES، وvNorm(DRAFT[i]) == vNorm(LINES[i]) لكل i
 *                  (vNorm هي الدالة نفسها في رأس كل صفحة: تحذف التشكيل وتوحّد الهمزات والياء وعلامات الترقيم).
 *       (أ٢) [تحذير] تغيّر في علامات الترقيم/المسافات (مسموح لكن يُعرض).
 *  (ب) [خطأ]  كلمة عربية بلا أي حركة (الكلمة الأحادية الحرف مستثناة).
 *       (ب٢) [تحذير] اكتمال: حرف يُفترض أن يحمل حركة ولا يحملها (heuristic).
 *  (ج) [خطأ]  حركتان متتاليتان على حرف واحد، أو ترتيب شدّة قبل حركة (اصطلاح المشروع: الحركة ثم الشدّة)،
 *             أو شدّة مكرّرة، أو تنوين في غير آخر الكلمة، أو علامة بلا حرف.
 *       (هـ) [تحذير] سكون على آخر الكلمة قبل همزة وصل (مِنْ الغار ← مِنَ الغار).
 *  (د) [خطأ]  حرف علّة بحركة متعارضة: ألف تحمل حركة؛ واو ساكنة بعد غير فتحة (لا يصح بعد ضمّة)؛
 *             ياء ساكنة بعد ضمّة/كسرة. [تحذير] واو بضمّة بعد ضمّة، أو ياء بكسرة بعد كسرة (غير ذلك مقبول لأنها حرف أصلي: هُوَ، قِيَام، لِيُشْفَى).
 *  الأسطر المقفلة: سطر له تسجيل في حزمة sp_libfix*.bin (يُحسب من story-index.json بالبصمة vHash)
 *  تُستثنى من (ب)(ج)(د) وتُعرض في خانة «مقفل» — ولا تُستثنى من (أ).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'tools', 'libfix');

// ---- نسخة طبق الأصل من دالتي رأس كل صفحة ----
function vNorm(t) { return String(t).replace(/[ً-ٰٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/[!؟?.,،:؛]+/g, ' ').replace(/\s+/g, ' ').replace(/^ | $/g, ''); }
function vHash(t) { const n = vNorm(t); let x = 5381; for (let i = 0; i < n.length; i++) x = (((x << 5) + x) ^ n.charCodeAt(i)) >>> 0; return x.toString(16); }

const LETTER = /[ء-يٱ]/;
const MARK = /[ً-ٰٟۖ-ۭ]/;       // حركات + علامات قرآنية صغيرة
const VOWEL = /[َُِ]/;                    // فتحة ضمة كسرة
const TANWEEN = /[ًٌٍ]/;
const SHADDA = 'ّ', SUKUN = 'ْ', FATHA = 'َ', DAMMA = 'ُ', KASRA = 'ِ', DAGGER = 'ٰ';
const WORDRE = /[ء-يٱً-ٰٟۖ-ۭـ]+/g;

function loadPage(n) {
  const f = path.join(DIR, n + '.html');
  const s = fs.readFileSync(f, 'utf8');
  const g = k => { const m = s.match(new RegExp('^const ' + k + '=(\\[.*\\]);', 'm')); if (!m) throw new Error(n + ': لا يوجد ' + k); return JSON.parse(m[1]); };
  return { LINES: g('LINES'), DRAFT: g('DRAFT') };
}

let _locked = null;
function lockedHashes() {
  if (_locked) return _locked;
  _locked = new Set();
  try {
    const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'story-index.json'), 'utf8'));
    j.packs.forEach((p, idx) => { /* يُحسب أدناه */ });
    for (const [h, v] of Object.entries(j.e)) if (/^sp_libfix/.test(j.packs[v[0]] || '')) _locked.add(h);
  } catch (e) { /* بلا فهرس: لا أسطر مقفلة */ }
  return _locked;
}

function parseWord(w) {
  // يعيد مصفوفة حروف {ch, marks:[...]}، مع تجاهل التطويل
  const out = [];
  for (const c of w) {
    if (c === 'ـ') continue;
    if (LETTER.test(c)) out.push({ ch: c, marks: [] });
    else if (MARK.test(c)) { if (out.length) out[out.length - 1].marks.push(c); else out.push({ ch: null, marks: [c] }); }
  }
  return out;
}

const bare = w => w.replace(/[ً-ٰٟۖ-ۭـ]/g, '');
const isAllahWord = b => /^[وفبتك]?(?:ا|ٱ)?(?:لل|ل)ه$/.test(b) || /^[وفبتك]?للهم$/.test(b) || /^[وفبتك]?(?:ا|ٱ)للهم$/.test(b);

function checkWord(w, ctx, errs, warns) {
  const L = parseWord(w);
  const b = bare(w);
  const letters = L.filter(x => x.ch);
  const hasMark = L.some(x => x.marks.length);
  const atEnd = ctx.atEnd;        // بعد الكلمة علامة وقف أو نهاية السطر
  if (letters.length > 1 && !hasMark) errs.push(['b', 'كلمة بلا أي حركة: ' + w]);

  // ---- (ج) ----
  for (let i = 0; i < L.length; i++) {
    const x = L[i], m = x.marks;
    if (!x.ch) { errs.push(['c', 'علامة بلا حرف: ' + w]); continue; }
    const core = m.filter(c => c !== DAGGER && !/[ۖ-ۭٓ-ٟ]/.test(c));
    const vow = core.filter(c => VOWEL.test(c) || TANWEEN.test(c) || c === SUKUN);
    if (vow.length > 1) errs.push(['c', 'حركتان على حرف واحد: ' + w]);
    const sh = core.filter(c => c === SHADDA).length;
    if (sh > 1) errs.push(['c', 'شدّة مكررة: ' + w]);
    const si = m.indexOf(SHADDA);
    if (si >= 0) {
      const vi = m.findIndex(c => VOWEL.test(c) || TANWEEN.test(c));
      if (vi >= 0 && vi > si) errs.push(['c', 'شدّة قبل الحركة (الاصطلاح: حركة ثم شدّة): ' + w]);
      if (m.includes(SUKUN)) errs.push(['c', 'شدّة مع سكون: ' + w]);
    }
    if (m.some(c => TANWEEN.test(c))) {
      const rest = L.slice(i + 1).filter(y => y.ch);
      const ok = rest.length === 0 || (rest.length === 1 && /[اى]/.test(rest[0].ch) && !rest[0].marks.length) ||
                 (rest.length === 1 && rest[0].ch === 'ا');
      if (!ok) errs.push(['c', 'تنوين في غير آخر الكلمة: ' + w]);
    }
    // ---- (د) ----
    const prev = i > 0 ? L[i - 1] : null;
    const pm = prev ? prev.marks : [];
    const pvow = pm.find(c => VOWEL.test(c));
    if (x.ch === 'ا' && core.length) errs.push(['d', 'ألف تحمل حركة: ' + w]);
    if (x.ch === 'و' && m.includes(SUKUN) && prev && (pvow === DAMMA || pvow === KASRA)) errs.push(['d', 'واو ساكنة بعد ' + (pvow === DAMMA ? 'ضمّة' : 'كسرة') + ': ' + w]);
    if (x.ch === 'ي' && m.includes(SUKUN) && prev && (pvow === DAMMA || pvow === KASRA)) errs.push(['d', 'ياء ساكنة بعد ' + (pvow === DAMMA ? 'ضمّة' : 'كسرة') + ': ' + w]);
    if (x.ch === 'و' && prev && pvow === DAMMA && m.includes(DAMMA) && !m.includes(SHADDA)) warns.push(['d2', 'واو بحركة بعد ضمّة (تأكد أنها حرف أصلي): ' + w]);
    if (x.ch === 'ي' && prev && pvow === KASRA && m.includes(KASRA) && !m.includes(SHADDA)) warns.push(['d2', 'ياء بحركة بعد كسرة (تأكد أنها حرف أصلي): ' + w]);
  }

  // ---- (ب٢) اكتمال: heuristic ----
  if (letters.length > 1 && hasMark && !isAllahWord(b)) {
    const n = L.length;
    const miss = [];
    for (let i = 0; i < n; i++) {
      const x = L[i]; if (!x.ch) continue;
      const m = x.marks, any = m.some(c => /[ً-ْٰ]/.test(c));
      if (any) continue;
      const prev = i > 0 ? L[i - 1] : null, next = i + 1 < n ? L[i + 1] : null;
      const pvow = prev ? prev.marks.find(c => VOWEL.test(c)) : null;
      const ch = x.ch;
      if (/[اآٱىأإؤئء]/.test(ch) && ch !== 'ء' && ch !== 'ؤ' && ch !== 'ئ' && ch !== 'أ' && ch !== 'إ') continue; // ألف ممدودة/وصل/مقصورة
      if (ch === 'ؤ' || ch === 'ئ' || ch === 'أ' || ch === 'إ' || ch === 'ء') { miss.push(ch); continue; }
      if (ch === 'و' && pvow === DAMMA) continue;
      if (ch === 'ي' && pvow === KASRA) continue;
      if (ch === 'ل' && prev && /[اٱ]/.test(prev.ch) && i === 1) continue;                       // ال
      if (ch === 'ل' && prev && /[اٱ]/.test(prev.ch) && i === 2 && /[وفبكل]/.test(L[0].ch)) continue; // وال بال
      if (ch === 'ل' && next && next.marks.includes(SHADDA)) continue;                              // لام شمسية
      if (ch === 'ن' && next && next.marks.includes(SHADDA) && ch) { /* نون مدغمة لا تُستثنى */ }
      if (i === n - 1 && atEnd) continue;                                                           // آخر كلمة قبل وقف
      if (i === n - 1 && /[اى]/.test(ch)) continue;
      if (prev && /[ً]/.test(prev.marks.join('')) && /[اى]/.test(ch)) continue;
      if (ch === 'ا') continue;
      miss.push(ch);
    }
    if (miss.length) warns.push(['b2', 'حرف بلا حركة (' + miss.join('') + '): ' + w]);
  }
}

function lintLine(d) {
  const errs = [], warns = [];
  // علامة بلا حرف / تحليل الكلمات
  const words = [];
  let m; WORDRE.lastIndex = 0;
  while ((m = WORDRE.exec(d))) words.push({ w: m[0], end: m.index + m[0].length });
  for (const { w, end } of words) {
    if (!LETTER.test(w) && !/[ً-ٟ]/.test(w)) continue;
    const after = d.slice(end).replace(/^\s+/, '');
    const atEnd = after === '' || /^[.،؟?!:؛…»﴾)]/.test(after);
    checkWord(w, { atEnd }, errs, warns);
  }
  // (هـ) سكون آخر الكلمة قبل همزة وصل في الكلمة التالية (مِنْ الـ → مِنَ الـ)
  for (let i = 0; i + 1 < words.length; i++) {
    const a = words[i], b = words[i + 1];
    const between = d.slice(a.end, b.end - b.w.length);
    if (!/^\s+$/.test(between)) continue;
    const bb = bare(b.w);
    const waslStart = /^[وفبلكت]?(?:ا|ٱ)ل/.test(bb) || /^[وف]?ا[\u0621-\u064A]/.test(bb) && /^[وف]?(?:ا|ٱ)[\u0621-\u064A][\u0652\u0651]/.test(b.w);
    const isArticle = /^(?:ا|ٱ)ل/.test(bb);
    const asWasl = isArticle || /^(?:ا|ٱ)[\u0621-\u064A][\u0652\u0651]/.test(b.w);
    if (!asWasl) continue;
    const L = parseWord(a.w).filter(x => x.ch);
    const last = L[L.length - 1];
    if (last && last.marks.includes(SUKUN) && !/^(?:ا|ٱ)ل/.test(parseWord(a.w).map(x=>x.ch).join(''))) warns.push(['w', 'سكون قبل همزة وصل: ' + a.w + ' ' + b.w]);
  }
  // علامات عربية خارج الكلمات (مثلًا بعد مسافة)
  if (/(^|[\s.،؟:؛!…«»﴿﴾()])[ً-ْ]/.test(d)) errs.push(['c', 'علامة تشكيل بلا حرف قبلها']);
  return { errs, warns };
}

function lintPage(n, opts) {
  const { LINES, DRAFT } = loadPage(n);
  const res = { page: n, lines: LINES.length, draft: DRAFT.length, a: [], a2: [], b: [], b2: [], c: [], d: [], d2: [], w: [], locked: [] };
  if (LINES.length !== DRAFT.length) res.a.push({ i: -1, msg: 'اختلاف العدد ' + LINES.length + ' ≠ ' + DRAFT.length });
  const lk = lockedHashes();
  const N = Math.min(LINES.length, DRAFT.length);
  for (let i = 0; i < N; i++) {
    const L = LINES[i], D = DRAFT[i];
    if (vNorm(D) !== vNorm(L)) res.a.push({ i, msg: 'vNorm يختلف', L, D });
    const strip = t => t.replace(/[ً-ٰٟ]/g, '');
    if (strip(D) !== strip(L)) res.a2.push({ i, msg: 'تغيّر غير التشكيل (ترقيم/همزة/مسافة)', L, D });
    if (lk.has(vHash(D))) { res.locked.push({ i, D }); continue; }
    const { errs, warns } = lintLine(D);
    for (const [k, msg] of errs) res[k].push({ i, msg, D });
    for (const [k, msg] of warns) res[k].push({ i, msg, D });
  }
  return res;
}

function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose'), warn = args.includes('--warn'), json = args.includes('--json');
  let pages = args.filter(a => /^\d+[a-z]?$/.test(a));
  if (!pages.length) pages = Array.from({ length: 15 }, (_, k) => String(k + 10));
  pages = pages.map(p => p.padStart(2, '0'));
  const all = pages.map(p => lintPage(p));
  if (json) { console.log(JSON.stringify(all)); }
  else {
    console.log('الصفحة | سطور | (أ) | (ب) | (ج) | (د) | مقفل | تحذير ب٢ | تحذير د٢ | سكون قبل وصل | تغيّر ترقيم');
    const tot = { a: 0, b: 0, c: 0, d: 0, locked: 0, b2: 0, d2: 0, a2: 0, w: 0 };
    for (const r of all) {
      console.log([r.page, r.lines, r.a.length, r.b.length, r.c.length, r.d.length, r.locked.length, r.b2.length, r.d2.length, r.w.length, r.a2.length].join(' | '));
      for (const k of Object.keys(tot)) tot[k] += r[k].length;
      if (verbose || warn) {
        for (const k of ['a', 'b', 'c', 'd']) if (verbose) for (const e of r[k]) console.log('   [' + k + '] #' + e.i + ' ' + e.msg + (e.D ? '  ‹' + e.D + '›' : ''));
        if (warn) for (const k of ['b2', 'd2', 'w', 'a2']) for (const e of r[k]) console.log('   [' + k + '] #' + e.i + ' ' + e.msg + '  ‹' + e.D + '›');
      }
    }
    console.log('المجموع: (أ)=' + tot.a + ' (ب)=' + tot.b + ' (ج)=' + tot.c + ' (د)=' + tot.d + ' | مقفل=' + tot.locked + ' | تحذيرات ب٢=' + tot.b2 + ' د٢=' + tot.d2 + ' سكون-قبل-وصل=' + tot.w + ' ترقيم=' + tot.a2);
  }
  const bad = all.some(r => r.a.length);
  process.exit(bad ? 2 : (all.some(r => r.b.length || r.c.length || r.d.length) ? 1 : 0));
}
if (require.main === module) main();
module.exports = { vNorm, vHash, lintPage, lintLine };
