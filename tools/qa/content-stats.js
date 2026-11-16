#!/usr/bin/env node
/* Athar content statistics (read-only; changes nothing in the app).
   usage: NODE_PATH=$(npm root -g) node tools/qa/content-stats.js [outDir=docs]
   Loads next/home/app.js in headless chromium with ONE line appended in memory (never written to disk) that exposes the
   private data arrays, then measures: books/lessons/questions, duplicates, thematic sections, audio coverage against
   story-index.json (using the app's own vPlan, so "covered" = exactly what the app would play from a recording),
   Valley (days/lessons/audio via valley/audio/index.json + files), Noor lessons, games, surahs, hadith and sources.
   Writes docs/content-stats.json and docs/content-stats.md (Arabic). Deterministic: same tree -> same numbers. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), http = require('http');
const ROOT = path.join(__dirname, '..', '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'docs'));
const rd = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.bin': 'application/octet-stream' };

/* ---------- helpers ---------- */
const AR = (s) => String(s).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
const norm = (t) => String(t).replace(/ﷺ/g, 'صلى الله عليه وسلم').replace(/[ً-ٰٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/[!؟?.,،:؛«»"()]+/g, ' ').replace(/\s+/g, ' ').trim();
const COLL = [['البخاري', /البخاري/], ['مسلم', /(^|[\s(،«])مسلم/], ['الترمذي', /الترمذي/], ['أبو داود', /أبو داود|أبي داود/], ['ابن ماجه', /ابن ماجه|ابن ماجة/], ['النسائي', /النسائي/], ['أحمد', /أحمد/], ['ابن حبان', /ابن حبان/], ['الحاكم', /الحاكم/], ['الطبراني', /الطبراني/], ['البيهقي', /البيهقي/], ['مالك (الموطأ)', /الموطأ|رواه مالك|مالك في/], ['الدارمي', /الدارمي/]];
const classify = (r) => { const out = []; COLL.forEach(([n, re]) => { if (re.test(r)) out.push(n); }); if (/متفق عليه/.test(r)) { ['البخاري', 'مسلم'].forEach((n) => { if (!out.includes(n)) out.push(n); }); } return out; };
const hasNo = (r) => /[\(（][\s]*[\d٠-٩]+/.test(r) || /رقم\s*[\d٠-٩]+/.test(r);
const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);

/* ---------- 1) main app, in the browser ---------- */
async function mainApp() {
  const src = rd('next/home/app.js'), i = src.lastIndexOf('})();');
  const body = src.slice(0, i) + ';window.__ST={BKS:BKS,PSTORIES:PSTORIES,NOOR:NOOR,NOOR_ST:NOOR_ST,LWORDS:LWORDS,LETTERS:LETTERS,JUZ_AMMA:JUZ_AMMA,LIB_SECS:LIB_SECS,ADHKAR:ADHKAR,QUIZ_TABS:QUIZ_TABS,vPlan:vPlan,vNorm:vNorm,vHash:vHash};\n' + src.slice(i);
  const srv = http.createServer((q, s) => { const u = decodeURIComponent(q.url.split('?')[0]); const f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.statusCode = 404; return s.end(); } s.setHeader('Content-Type', MIME[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(s); });
  await new Promise((r) => srv.listen(0, r)); const port = srv.address().port;
  const b = await chromium.launch(), p = await b.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.route(/next\/home\/app\.js/, (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
  await p.goto(`http://localhost:${port}/index.html?t=day&first=0&nl=1`);
  await p.waitForFunction(() => window.__ST, null, { timeout: 15000 });
  /* wait for story-index.json to be loaded by the app (probe: a known covered sentence) */
  await p.waitForTimeout(2500);
  const data = await p.evaluate(() => {
    const S = window.__ST, plan = (t) => { try { return S.vPlan(t); } catch (e) { return [{ t }]; } };
    /* 0 none, 1 partial (some sentences recorded), 2 full */
    const cov = (t) => { const pl = plan(t); const n = pl.length || 1, rec = pl.filter((x) => x.s || x.c).length; return { st: rec === n ? 2 : rec ? 1 : 0, n, rec }; };
    const recs = []; const add = (cat, book, ch, text, extra) => { if (!text || !String(text).trim()) return; const c = cov(text); recs.push(Object.assign({ cat, book, ch, text: String(text), st: c.st, n: c.n, rec: c.rec }, extra || {})); };
    const books = [], qs = [], pages = { game: {}, plain: 0 }, hadith = [], quran = [], storyTexts = [];
    Object.keys(S.BKS).forEach((k) => {
      const B = S.BKS[k], bk = { key: k, title: B.title, chapters: (B.ch || []).length, qa: 0, story: 0, plain: 0, other: 0, ask: 0 }; books.push(bk);
      (B.ch || []).forEach((C) => {
        if (C.ask && C.ask.q) { bk.ask++; add('ask', k, C.id, C.ask.q); }
        (C.pages || []).forEach((P) => {
          const g = P.game || 'plain'; pages.game[g] = (pages.game[g] || 0) + 1;
          if (g === 'qa') {
            bk.qa++; qs.push({ book: k, ch: C.id, q: P.q, right: P.right, riddle: !!P.riddle, hasV: !!P.v, h: !!P.h });
            add('q', k, C.id, P.q); add('a', k, C.id, P.a);
          } else if (g === 'story') { bk.story++; storyTexts.push(P.t); add('story', k, C.id, P.t); }
          else if (g === 'signs' || g === 'pillars') bk.other++;
          else { bk.plain++; add('plain', k, C.id, P.t); }
          if (P.v) { (P.h ? hadith : quran).push({ book: k, ch: C.id, v: P.v, r: P.r || '' }); }
          else if (P.h && P.r) hadith.push({ book: k, ch: C.id, v: '', r: P.r });
        });
      });
      if (B.fin) { add('fin', k, 'fin', B.finSay || B.fin); if (B.finR) hadith.push({ book: k, ch: 'fin', v: B.fin, r: B.finR, fin: 1 }); }
    });
    S.PSTORIES.forEach((P) => (P.scenes || []).forEach((sc, i) => { add('prophet', 'PSTORIES', P.id, sc.t); if (sc.v) quran.push({ book: 'PSTORIES', ch: P.id, v: sc.v, r: sc.r || '' }); }));
    S.NOOR.forEach((L) => { add('noor-rule', 'NOOR', L.id, L.rule); (L.items || []).forEach((it) => { if (!it.ay) add('noor-item', 'NOOR', L.id, it.say || it.t); }); });
    S.LETTERS.forEach((L) => add('letter', 'LETTERS', L[0], L[1])); S.LWORDS.forEach((W, i) => add('letter-word', 'LWORDS', i, W[0]));
    S.ADHKAR.forEach((a) => { add('adhkar-text', 'ADHKAR', a.id, a.t); add('adhkar-ask', 'ADHKAR', a.id, 'ماذا نقول. ' + a.w); if (a.s) hadith.push({ book: 'ADHKAR', ch: a.id, v: a.t, r: a.s }); });
    return { nPstories: S.PSTORIES.length, books, qs, pages, hadith, quran, recs, ndr: { stages: S.NOOR_ST.map((s) => s.n), noor: S.NOOR.map((l) => ({ id: l.id, st: l.st, items: (l.items || []).length, ay: (l.items || []).filter((i) => i.ay).length })) }, juz: S.JUZ_AMMA, sections: S.LIB_SECS.map((s) => ({ id: s.id, t: s.t, keys: s.keys })), quizTabs: S.QUIZ_TABS, nLetters: S.LETTERS.length, nLwords: S.LWORDS.length, nAdhkar: S.ADHKAR.length };
  });
  await b.close(); srv.close();
  data.pageErrors = errs;
  return data;
}

/* ---------- 2) games inventory (static, from source) ---------- */
function gamesInventory(app) {
  const src = rd('next/home/app.js'), lines = src.split('\n'); const found = [];
  let fn = '', tab = '';
  lines.forEach((ln, i) => {
    const f = ln.match(/^\s*function (\w+)\(/); if (f) { fn = f[1]; tab = ''; }
    const t = ln.match(/quizTab === "(\w+)"/); if (t) tab = t[1];
    let m = ln.match(/quizTile\("[^"]*",\s*"[^"]*",\s*"([^"]+)"/);
    if (m) found.push({ kind: 'quiz-tile', tab, title: m[1], line: i + 1 });
    m = ln.match(/^\s*\{\s*k:"(\w+)",\s*e:"[^"]*",\s*t:"([^"]+)",\s*d:"/);
    if (m) found.push({ kind: 'math-tile', fn, key: m[1], title: m[2], line: i + 1 });
  });
  const dedup = []; const seen = new Set(); found.forEach((g) => { const k = g.kind + '|' + g.title; if (!seen.has(k)) { seen.add(k); dedup.push(g); } });
  const inLesson = Object.keys(app.pages.game).map((g) => ({ type: g, pages: app.pages.game[g] }));
  const stand = ['lettersTab: تعرّف/اختبار/بالونات/قراءة (٤)', 'numTab: أرقام/جمع/طرح/ضرب/قياس/ألعاب (٦)', 'adhkar quiz', 'ayq: اسألني في الآيات', 'review: راجع ما حفظت (SRS)'];
  return { inLessonPageTypes: inLesson, standaloneTiles: dedup, standaloneTileCount: dedup.length, otherModes: stand };
}

/* ---------- 3) Valley (node only) ---------- */
function valley() {
  const s = rd('valley/index.html'); const D = JSON.parse(s.match(/const ATHAR_DATA = (\{.*\});\s*$/m)[1]);
  const idx = JSON.parse(rd('valley/audio/index.json')); const KID = JSON.parse(s.match(/var KID = (\{.*?\});/)[1]);
  const vN = (t) => String(t).replace(/[ً-ٰٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/[!؟?.,،:؛]+/g, ' ').replace(/\s+/g, ' ').replace(/^ | $/g, '');
  const vH = (t) => { const n = vN(t); let x = 5381; for (let i = 0; i < n.length; i++) x = (((x << 5) + x) ^ n.charCodeAt(i)) >>> 0; return x.toString(16); };
  const A = D.audio, voices = {}, gaps = {}, byPrefix = {}; let n = 0, ok = 0, viaPack = 0, viaFile = 0, viaKid = 0;
  const miss = [];
  Object.keys(A).forEach((id) => {
    if (id[0] === '_') return; const e = A[id]; n++; const v = e.voice || 'narrator'; voices[v] = voices[v] || { total: 0, covered: 0 }; voices[v].total++;
    let how = '';
    if (idx.e[vH(v + '|' + e.text)]) how = 'pack';
    else if (e.file && fs.existsSync(path.join(ROOT, 'valley/audio', e.file.replace('@reader', 'human_reader')))) how = 'file';
    else if (v === 'athar' && KID[id] !== undefined && String(e.text).trim() === String(KID[id]).trim() && fs.existsSync(path.join(ROOT, 'valley/audio/athar_kid', id + '.mp3'))) how = 'kid';
    if (how) { ok++; voices[v].covered++; if (how === 'pack') viaPack++; else if (how === 'file') viaFile++; else viaKid++; }
    else { miss.push({ id, voice: v, text: e.text }); const pre = id.split('.').slice(0, 2).join('.'); gaps[pre] = (gaps[pre] || 0) + 1; }
  });
  const exps = D.experiences, ek = Object.keys(exps), seq = D.sequence;
  const beatTypes = {}; let beats = 0, orderG = 0;
  ek.forEach((k) => (exps[k].beats || []).forEach((b) => { beats++; beatTypes[b.type] = (beatTypes[b.type] || 0) + 1; }));
  const domains = {}; ek.forEach((k) => { const d = exps[k].domain || '?'; domains[d] = (domains[d] || 0) + 1; });
  const refs = Object.keys(A).filter((k) => k[0] !== '_' && A[k].voice === 'sacred' && A[k].ref).map((k) => ({ id: k, ref: A[k].ref, text: A[k].text }));
  const noNum = refs.filter((r) => !hasNo(r.ref) && !/ص\s*[\d٠-٩]+/.test(r.ref));
  const colls = {}; refs.forEach((r) => classify(r.ref).forEach((c) => { colls[c] = (colls[c] || 0) + 1; }));
  const books = {}; refs.forEach((r) => { const m = r.ref.replace(/^\s*ص\s*[\d٠-٩]+\s*/, '').split(/\s[—-]\s/)[0].trim() || r.ref; books[m] = (books[m] || 0) + 1; });
  return { lessons: ek.length, days: Object.keys(seq.days).length, weeks: Object.keys(seq.weeks).length, sequenceTotals: seq.totals, params: seq.params, domains, beats, beatTypes, places: D.world.places.length,
    audio: { lines: n, covered: ok, pct: pct(ok, n), linesExcludingQuranRecitation: n - voices.quran.total, coveredExcludingQuran: ok - voices.quran.covered, pctExcludingQuran: pct(ok - voices.quran.covered, n - voices.quran.total), quranRecitationNote: 'سطور voice=quran تُتلى من everyayah ولا تحتاج حزمة', viaPack, viaFile, viaKid, byVoice: voices, uncoveredByLessonPrefix: Object.entries(gaps).sort((a, b) => b[1] - a[1]).slice(0, 25), uncoveredCount: miss.length,
      uncoveredSample: miss.slice(0, 12).map((m) => m.id + ' [' + m.voice + ']') },
    sacred: { lines: refs.length, byCollection: colls, refsByWork: Object.entries(books).sort((a, b) => b[1] - a[1]).slice(0, 12), refsWithoutNumber: noNum.length } };
}

/* ---------- 4) assemble ---------- */
(async () => {
  const app = await mainApp();
  const qn = new Map(), qr = new Map();
  app.qs.forEach((q) => { const k = norm(q.q); qn.set(k, (qn.get(k) || []).concat(q)); const k2 = k + '|' + norm(q.right); qr.set(k2, (qr.get(k2) || []).concat(q)); });
  const dupQ = [...qn.values()].filter((g) => g.length > 1), dupQR = [...qr.values()].filter((g) => g.length > 1);
  const dupSame = dupQR.reduce((s, g) => s + g.length - 1, 0), dupQextra = dupQ.reduce((s, g) => s + g.length - 1, 0);
  const crossBook = dupQ.filter((g) => new Set(g.map((x) => x.book)).size > 1).length;
  const inBook = dupQ.filter((g) => new Set(g.map((x) => x.book)).size === 1).length;
  const sampleDup = dupQ.sort((a, b) => b.length - a.length).slice(0, 10).map((g) => ({ q: g[0].q, times: g.length, books: [...new Set(g.map((x) => x.book))].slice(0, 6) }));
  const secOf = {}; app.sections.forEach((s) => s.keys.forEach((k) => { secOf[k] = s.id; }));
  const perSec = app.sections.map((s) => { const set = new Set(s.keys); const qq = app.qs.filter((q) => set.has(q.book)); const bb = app.books.filter((b) => set.has(b.key)); return { id: s.id, title: s.t, books: s.keys.length, chapters: bb.reduce((a, b) => a + b.chapters, 0), questions: qq.length }; });
  const inSec = new Set(Object.keys(secOf)); const orphan = app.books.filter((b) => !inSec.has(b.key)).map((b) => b.key);
  const qBooks = app.books.map((b) => ({ key: b.key, title: b.title, chapters: b.chapters, questions: b.qa, story: b.story, plain: b.plain })).sort((a, b) => b.questions - a.questions);
  const ageFields = { q3: 0, a3: 0 }; /* data-level age layer: none present (see docs/age-3-5-layer.md) */
  /* audio coverage */
  const R = app.recs, cats = {}; R.forEach((r) => { const c = (cats[r.cat] = cats[r.cat] || { texts: 0, full: 0, partial: 0, none: 0, sentences: 0, sentRec: 0 }); c.texts++; c.sentences += r.n; c.sentRec += r.rec; if (r.st === 2) c.full++; else if (r.st === 1) c.partial++; else c.none++; });
  const uniq = new Map(); R.forEach((r) => { const k = norm(r.text); if (!uniq.has(k)) uniq.set(k, r); });
  const U = [...uniq.values()]; const uFull = U.filter((r) => r.st === 2).length, uPart = U.filter((r) => r.st === 1).length, uNone = U.filter((r) => r.st === 0).length;
  const tot = { texts: R.length, full: R.filter((r) => r.st === 2).length, partial: R.filter((r) => r.st === 1).length, none: R.filter((r) => r.st === 0).length };
  const sentTot = R.reduce((s, r) => s + r.n, 0), sentRec = R.reduce((s, r) => s + r.rec, 0);
  const gapBook = {}; U.filter((r) => r.st < 2).forEach((r) => { const g = (gapBook[r.book] = gapBook[r.book] || { book: r.book, none: 0, partial: 0, cats: {} }); if (r.st === 0) g.none++; else g.partial++; g.cats[r.cat] = (g.cats[r.cat] || 0) + 1; });
  const gapList = Object.values(gapBook).sort((a, b) => (b.none + b.partial) - (a.none + a.partial));
  const gapSample = U.filter((r) => r.st < 2).slice(0, 120).map((r) => ({ book: r.book, ch: r.ch, cat: r.cat, text: r.text.slice(0, 70), st: r.st }));
  /* noor */
  const nPre = {}; app.ndr.noor.forEach((l) => { const p = l.id.replace(/[\d_]+[ab]?$/, ''); nPre[p] = (nPre[p] || 0) + 1; });
  const nPerStage = app.ndr.stages.map((n, i) => ({ stage: n, lessons: app.ndr.noor.filter((l) => l.st === i).length }));
  /* quran */
  const ayahsJuz = app.juz.reduce((s, x) => s + x.ayahs, 0); const suraFiles = fs.readdirSync(ROOT).filter((f) => /^\d{3}\.json$/.test(f)).length;
  const quranUniq = new Set(app.quran.map((x) => norm(x.v))); const quranRefs = new Set(app.quran.map((x) => String(x.r).trim()).filter(Boolean));
  /* hadith */
  const hq = app.hadith.filter((h) => h.r); const hU = new Map(); hq.forEach((h) => { const k = norm(h.v || h.r) + '|' + norm(h.r); if (!hU.has(k)) hU.set(k, h); });
  const hu = [...hU.values()]; const collCount = {}; let noNum = 0, noColl = 0; const needs = [];
  hu.forEach((h) => { const c = classify(h.r); if (!c.length) { noColl++; needs.push(h); } c.forEach((x) => { collCount[x] = (collCount[x] || 0) + 1; }); if (!hasNo(h.r)) noNum++; });
  const grading = { hasan: hu.filter((h) => /حسن/.test(h.r)).length, sahih: hu.filter((h) => /صحّحه|صححه|صحيح/.test(h.r)).length, mutafaq: hu.filter((h) => /متفق عليه/.test(h.r)).length };
  const V = valley();
  const out = {
    generated: new Date().toISOString().slice(0, 10), tool: 'tools/qa/content-stats.js', pageErrors: app.pageErrors,
    library: { books: app.books.length, chapters: app.books.reduce((s, b) => s + b.chapters, 0), pagesByGame: app.pages.game, questions: app.qs.length, riddles: app.qs.filter((q) => q.riddle).length, questionsWithVerseOrHadith: app.qs.filter((q) => q.hasV).length,
      chapterAskQuestions: app.books.reduce((s, b) => s + b.ask, 0), storyPages: app.pages.game.story || 0, prophetStories: app.nPstories, sections: perSec, booksNotInAnySection: orphan, topBooksByQuestions: qBooks.slice(0, 10), smallestBooks: qBooks.slice(-5) },
    duplicates: { questionGroupsRepeatedText: dupQ.length, extraCopiesByText: dupQextra, sameQuestionAndAnswerExtraCopies: dupSame, groupsAcrossBooks: crossBook, groupsInsideOneBook: inBook, top: sampleDup },
    ageBands: { dataFieldsPresent: ageFields, note: 'لا حقل عمر في بيانات الأسئلة؛ طبقة ٣–٥ (q3/right3/wrong3/a3) موثّقة في docs/age-3-5-layer.md لكنها غير موجودة في البيانات بعد. التقسيم الموضوعي بالأقسام أعلاه.' },
    audio: { definition: 'نصّ منطوق = سؤال/جواب/نصّ صفحة/خاتمة/مشهد نبيّ/شرح ومفردات نور/حروف/أذكار. "مسجَّل" = كل جمله لها مقطع في story-index.json أو في VCL/NRX (نفس منطق vPlan في التطبيق).',
      overall: Object.assign({ pctFull: pct(tot.full, tot.texts), pctAnyRecorded: pct(tot.full + tot.partial, tot.texts) }, tot), sentences: { total: sentTot, recorded: sentRec, pct: pct(sentRec, sentTot) },
      unique: { texts: U.length, full: uFull, partial: uPart, none: uNone, pctFull: pct(uFull, U.length) }, byCategory: cats, gapsByBook: gapList.slice(0, 25), gapSample, valley: V.audio },
    noor: { stages: app.ndr.stages.length, lessons: app.ndr.noor.length, perStage: nPerStage, byIdPrefix: nPre, itemsTotal: app.ndr.noor.reduce((s, l) => s + l.items, 0), quranAyahItems: app.ndr.noor.reduce((s, l) => s + l.ay, 0) },
    valley: { lessons: V.lessons, days: V.days, weeks: V.weeks, twoLessonDays: V.sequenceTotals.two_lesson_days, oneLessonDays: V.sequenceTotals.one_lesson_days, learningDaysPerWeek: V.params.learning_days_per_week, domains: V.domains, beats: V.beats, beatTypes: V.beatTypes, places: V.places },
    games: gamesInventory(app),
    letters: { letters: app.nLetters, words: app.nLwords, adhkar: app.nAdhkar, quizTabs: app.quizTabs.length },
    quran: { juzAmmaSurahs: app.juz.length, juzAmmaAyahs: ayahsJuz, surahJsonFiles: suraFiles, verseQuotesInBooksAndStories: app.quran.length, uniqueVerseQuotes: quranUniq.size, uniqueVerseRefs: quranRefs.size },
    hadith: { quotesWithSource: hq.length, uniqueWithSource: hu.length, byCollection: collCount, withoutCollectionName: noColl, withoutNumber: noNum, hasanMentions: grading.hasan, sahihMentions: grading.sahih, mutafaqAlayh: grading.mutafaq, sampleNeedingCheck: needs.slice(0, 8).map((h) => ({ book: h.book, r: h.r.slice(0, 70) })), valleySacred: V.sacred }
  };
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'content-stats.json'), JSON.stringify(out, null, 2) + '\n');
  fs.writeFileSync(path.join(OUT, 'content-stats.md'), md(out));
  console.log('wrote', path.join(OUT, 'content-stats.json'), 'and .md', app.pageErrors.length ? 'pageErrors=' + app.pageErrors.join('|') : '');
})().catch((e) => { console.error(e); process.exit(1); });

/* ---------- 5) Arabic summary ---------- */
function md(o) {
  const L = o.library, D = o.duplicates, A = o.audio, N = o.noor, V = o.valley, G = o.games, Q = o.quran, H = o.hadith;
  const n = (x) => AR(x), P = (x) => AR(String(x).replace('.', '٫').replace(/٫/g, '.')) + '٪';
  const row = (...c) => '| ' + c.join(' | ') + ' |';
  const L1 = [];
  L1.push('# إحصاءات محتوى «أثر» (مقيسة آليًا)', '', `التاريخ: ${o.generated} — الأداة: \`${o.tool}\` — المخرج الكامل: \`docs/content-stats.json\`. أعد التوليد بـ: \`NODE_PATH=$(npm root -g) node tools/qa/content-stats.js\`.`, '');
  L1.push('## ١) المكتبة والأسئلة', '', `- الكتب: **${n(L.books)}** كتابًا، في **${n(L.chapters)}** درسًا/فانوسًا (فصلًا).`, `- الأسئلة (صفحات اختيار من متعدد): **${n(L.questions)}** سؤالًا، منها ${n(L.riddles)} ألغاز «من أنا؟»، و${n(L.questionsWithVerseOrHadith)} سؤالًا يتبعه نصّ آية أو حديث. إضافة إلى ${n(L.chapterAskQuestions)} سؤال فانوس ختامي.`, `- صفحات القصص: ${n(L.storyPages)} · أنواع الصفحات: ` + Object.entries(L.pagesByGame).map(([k, v]) => `${k}=${n(v)}`).join('، ') + '.', `- كتب خارج أي قسم في الواجهة: ${L.booksNotInAnySection.length ? L.booksNotInAnySection.join('، ') : 'لا شيء'}.`, '');
  L1.push('| القسم | كتب | دروس | أسئلة |', '|---|---|---|---|'); L.sections.forEach((s) => L1.push(row(s.title, n(s.books), n(s.chapters), n(s.questions)))); L1.push('');
  L1.push('**الفئة العمرية:** ' + o.ageBands.note, '');
  L1.push('## ٢) التكرار', '', `- أسئلة نصّها مكرّر: **${n(D.questionGroupsRepeatedText)}** مجموعة (${n(D.extraCopiesByText)} نسخة زائدة)، منها ${n(D.groupsAcrossBooks)} عبر كتب مختلفة و${n(D.groupsInsideOneBook)} داخل كتاب واحد.`, `- نسخ زائدة بالسؤال والجواب معًا: ${n(D.sameQuestionAndAnswerExtraCopies)}.`, '- الأكثر تكرارًا: ' + D.top.slice(0, 5).map((t) => `«${t.q}» ×${n(t.times)}`).join('؛ ') + '.', '');
  L1.push('## ٣) تغطية الصوت (story-index.json)', '', A.definition, '', `- النصوص المنطوقة: **${n(A.overall.texts)}** (${n(A.unique.texts)} فريدًا). مسجَّلة كاملة: **${P(A.overall.pctFull)}**، وجزئيًا فأكثر: ${P(A.overall.pctAnyRecorded)}. على مستوى الجمل: ${n(A.sentences.recorded)} من ${n(A.sentences.total)} (${P(A.sentences.pct)}).`, `- الفريد: كاملة ${n(A.unique.full)}، جزئية ${n(A.unique.partial)}، بلا تسجيل ${n(A.unique.none)} (${P(A.unique.pctFull)} كاملة).`, '', '| الفئة | نصوص | كاملة | جزئية | بلا |', '|---|---|---|---|---|'); Object.entries(A.byCategory).forEach(([k, c]) => L1.push(row(k, n(c.texts), n(c.full), n(c.partial), n(c.none)))); L1.push('');
  L1.push('**أكبر الثغرات حسب الكتاب (نصوص فريدة بلا تسجيل كامل):**', ''); A.gapsByBook.slice(0, 12).forEach((g) => L1.push(`- ${g.book}: ${n(g.none)} بلا، ${n(g.partial)} جزئي (` + Object.entries(g.cats).map(([k, v]) => `${k} ${n(v)}`).join('، ') + ')')); L1.push('');
  const va = A.valley; L1.push('**الوادي:** ' + `${n(va.coveredExcludingQuran)} من ${n(va.linesExcludingQuranRecitation)} سطرًا صوتيًا مغطّى (${P(va.pctExcludingQuran)}) بعد استثناء ${n(va.lines - va.linesExcludingQuranRecitation)} سطر تلاوة قرآنية تُتلى من الشبكة: حزم ${n(va.viaPack)}، ملفات ${n(va.viaFile)}، أصوات أثر ${n(va.viaKid)}. غير مغطّى ${n(va.uncoveredCount)}. حسب الصوت: ` + Object.entries(va.byVoice).map(([k, v]) => `${k} ${n(v.covered)}/${n(v.total)}`).join('، ') + '. أكبر الثغرات (بادئة الدرس): ' + va.uncoveredByLessonPrefix.slice(0, 8).map((x) => `${x[0]} ${n(x[1])}`).join('، ') + '.', '');
  L1.push('## ٤) القاعدة النورانية والوادي', '', `- النورانية: **${n(N.lessons)}** درسًا في ${n(N.stages)} مراحل (` + N.perStage.map((s) => `${s.stage} ${n(s.lessons)}`).join('، ') + `)، و${n(N.itemsTotal)} عنصر تدريب منها ${n(N.quranAyahItems)} آيات تُتلى.`, `- الوادي: **${n(V.lessons)}** درسًا (تجربة) موزّعة على **${n(V.days)}** يومًا في ${n(V.weeks)} أسبوعًا (${n(V.learningDaysPerWeek)} أيام تعلّم أسبوعيًا؛ ${n(V.twoLessonDays)} يومًا بدرسين و${n(V.oneLessonDays)} بدرس)، ${n(V.beats)} مشهدًا/خطوة، و${n(V.places)} أماكن.`, '');
  L1.push('## ٥) الألعاب', '', '- أنواع صفحات الدروس: ' + G.inLessonPageTypes.map((g) => `${g.type} (${n(g.pages)})`).join('، ') + '.', `- ألعاب ومسابقات مستقلة (بطاقات): **${n(G.standaloneTileCount)}**: ` + G.standaloneTiles.map((g) => g.title).join('، ') + '.', '- أنماط أخرى: ' + G.otherModes.join('؛ ') + '.', `- الحروف: ${n(o.letters.letters)} حرفًا و${n(o.letters.words)} كلمة مصوّرة · الأذكار: ${n(o.letters.adhkar)} ذكرًا.`, '');
  L1.push('## ٦) القرآن', '', `- جزء عمّ: **${n(Q.juzAmmaSurahs)}** سورة و**${n(Q.juzAmmaAyahs)}** آية (ملفات سور: ${n(Q.surahJsonFiles)}).`, `- اقتباسات آيات في الكتب والقصص: ${n(Q.verseQuotesInBooksAndStories)} (${n(Q.uniqueVerseQuotes)} فريدًا، ${n(Q.uniqueVerseRefs)} موضع عزو فريد).`, '');
  L1.push('## ٧) الأحاديث والمصادر', '', `- مقاطع حديث/ذكر بعزو: ${n(H.quotesWithSource)}، **${n(H.uniqueWithSource)}** فريدًا. بلا اسم كتاب: ${n(H.withoutCollectionName)}، بلا رقم: ${n(H.withoutNumber)}. «متفق عليه»: ${n(H.mutafaqAlayh)}، ذكر «حسن»: ${n(H.hasanMentions)}.`, '- حسب الكتاب: ' + Object.entries(H.byCollection).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${n(v)}`).join('، ') + '.', `- الوادي (سطور شرعية بعزو): ${n(H.valleySacred.lines)} سطرًا؛ أكثر المصادر: ` + H.valleySacred.refsByWork.slice(0, 5).map((x) => `${x[0]} ${n(x[1])}`).join('، ') + `؛ بلا رقم حديث/صفحة: ${n(H.valleySacred.refsWithoutNumber)}.`, '');
  L1.push('## ملاحظات منهجية', '', '- الأرقام تُقاس من الشيفرة نفسها (تُحمَّل البيانات في متصفح بلا واجهة)، لا من نسخ يدوية؛ لا يُعدَّل شيء في التطبيق.', '- «الفريد» يطبّع النص (حذف التشكيل وتوحيد الألف) كما يفعل التطبيق عند البحث عن التسجيل.', '- قد يُعدّ سؤال مكرّرًا عمدًا إن أُعيد في كتاب آخر؛ التصنيف بين كتب/داخل كتاب يساعد المراجعة.', ''); return L1.join('\n');
}
