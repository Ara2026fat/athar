/* نجوم أثر — مكافآت وتشجيع مشتركان بين الجذر (home-next) والوادي (valley/next).
   - يتعامل مع التطبيقين بلا تعديل منطقهما: يلتقط الإتمام من State في الوادي ومن DOM/localStorage في الجذر.
   - المتجر: localStorage["athar.rw.v1"] = { v:1, profiles:{ <pid>: {...} } }. كل شيء في try/catch.
   - لا صوت إطلاقًا (لا مزاحمة للتلاوة)، ولا نطق جهاز، ولا شبكة. تشجيع نصّي فقط. */
(function () {
  "use strict";
  if (window.AtharReward) return;
  var RW = "athar.rw.v1", PK = "athar_profiles_v1", GOAL = 3, MAXA = 300;
  var D = document, W = window;
  var AR = "ar-EG";

  /* ───────── تخزين ───────── */
  var mem = null;
  function ls(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lset(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function pid() { try { var p = JSON.parse(ls(PK)); return (p && p.active) || "p1"; } catch (e) { return "p1"; } }
  function load() {
    try { var o = JSON.parse(ls(RW)); if (o && o.v === 1 && o.profiles && typeof o.profiles === "object") { mem = o; return o; } } catch (e) {}
    return mem || { v: 1, profiles: {} };
  }
  function save(o) { mem = o; lset(RW, JSON.stringify(o)); }
  function fresh() { return { stars: 0, total: 0, day: { date: "", earned: 0, goalDone: false }, streak: { n: 0, last: "" }, unlocked: [], album: [], awards: [], gifts: {}, welcome: "", gf: 0 }; }
  function prof(o, id) {
    var p = o.profiles[id], f = fresh(), k;
    if (!p || typeof p !== "object") p = o.profiles[id] = f;
    for (k in f) if (p[k] === undefined) p[k] = f[k];
    if (!Array.isArray(p.unlocked)) p.unlocked = []; if (!Array.isArray(p.awards)) p.awards = [];
    return p;
  }
  function ymd(d) { var z = function (n) { return (n < 10 ? "0" : "") + n; }; return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate()); }
  function today() { return ymd(new Date()); }
  function dayDiff(a, b) { try { var A = a.split("-"), B = b.split("-"); return Math.round((new Date(+B[0], B[1] - 1, +B[2]) - new Date(+A[0], A[1] - 1, +A[2])) / 864e5); } catch (e) { return 0; } }
  function rollDay(p) { var t = today(); if (p.day.date !== t) p.day = { date: t, earned: 0, goalDone: false }; }
  function sTxt(n) { n = +n || 0; return n === 1 ? "نجمة واحدة" : n === 2 ? "نجمتان" : (n >= 3 && n <= 10) ? num(n) + " نجوم" : num(n) + " نجمة"; }
  function num(n) { try { return Number(n).toLocaleString(AR); } catch (e) { return String(n); } }
  function reduced() { try { return W.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } }
  function $(id) { return D.getElementById(id); }

  /* ───────── ألوان المصباح (نفس ألوان world.js) ───────── */
  var COLS = [["255,206,100", "255,230,150"], ["70,200,240", "170,236,255"], ["90,210,130", "190,246,200"], ["255,120,180", "255,200,225"], ["170,125,250", "215,195,255"]];
  var CN = ["ذهبي", "أزرق", "أخضر", "وردي", "بنفسجي"];
  var COST = [0, 5, 5, 10, 15];
  function homeKey() { return "athar_home_w_v1_" + pid(); }
  function savedCol() { try { var s = JSON.parse(ls(homeKey())); return +(s && s.col) || 0; } catch (e) { return 0; } }
  function colorOpen(i) {
    i = +i || 0; if (!COST[i]) return true;
    var p = prof(load(), pid()); return p.unlocked.indexOf("col:" + i) >= 0;
  }
  function applyColor(i) {
    var sw = D.querySelector('#wPal .sw[data-i="' + i + '"]');
    if (sw) { sw.click(); return; }
    try { var k = homeKey(), s = JSON.parse(ls(k)) || {}; s.col = i; lset(k, JSON.stringify(s)); } catch (e) {}
  }

  /* ───────── الألبوم (أيقونات علامات الوادي المجسّمة) ───────── */
  var ALB = [
    ["mBanner", "راية", ["mBanner"]], ["mFinalSeal", "ختم", ["mFinalSeal"]], ["mHouse2", "بيت الجار", ["mHouse2", "mNeighbor"]],
    ["mLowBranch", "غصن", ["mLowBranch"]], ["mEmber", "جمرة", ["mEmber"]], ["mCurtain", "ستارة", ["mCurtain"]],
    ["mShelter", "مأوى", ["mShelter"]], ["mCrown", "تاج", ["mCrown"]], ["mBalance", "ميزان", ["mBalance", "mScale", "mScaleTrue"]],
    ["mBlossom", "زهرة", ["mBlossom"]], ["mGreenDome", "قبة", ["mGreenDome"]], ["mDoor", "باب", ["mDoor", "mOpenDoor", "mArch"]],
    ["mHarvest", "حصاد", ["mHarvest"]], ["mLeafPair", "ورقتان", ["mHands", "mSapling"]], ["mHeart", "قلب", ["mHeart", "mHeartBig", "mPulse"]],
    ["mFeather", "ريشة", ["mFeather", "mBirds", "mBirdsFlock"]], ["mPerfume", "عطر", ["mPerfume"]], ["mKey", "مفتاح", ["mKey"]],
    ["mSpring2", "عين ماء", ["mSpring2"]], ["mStill", "سكون", ["mStill", "mMirror"]], ["mCompass", "بوصلة", ["mCompass"]],
    ["mCart", "عربة", ["mCart"]], ["mNest", "عش", ["mNest"]], ["mLeaf", "ورقة", ["mLeaf"]]
  ];
  function marksNow() { try { var d = JSON.parse(ls("athar.world.v2")); return (d && d.marks) || []; } catch (e) { return []; } }
  function albumBase() { return (/\/valley\//.test(location.pathname) ? "img/marks/" : "valley/img/marks/"); }

  /* ───────── عبارات التشجيع (نصّ فقط، نبرة هادئة) ───────── */
  var L = {
    ok: ["أحسنتَ، هذا صحيح", "ما شاء الله، إجابة جميلة", "رائع، أنت تنتبه جيدًا", "أصبتَ، واصل", "ممتاز، هكذا يكون التعلّم", "جميل جدًا، تابع", "أحسنتَ، لقد تذكّرتَ", "عمل متقن", "خطوة جميلة أخرى"],
    lesson: ["أتممتَ الدرس، ما شاء الله", "أحسنتَ، أنهيتَ الدرس بهدوء وانتباه", "بارك الله في جهدك، أحسنتَ", "تعلّمتَ شيئًا جديدًا اليوم", "ما شاء الله، أنت تتقدّم", "شكرًا لانتباهك الجميل", "بارك الله في تعبك", "أكملتَ الطريق، أحسنتَ", "خطوة بعد خطوة، وها قد وصلت"],
    retry: ["لا بأس، حاول مرة أخرى", "أنت تتعلّم، وهذا هو المهم", "المحاولة جميلة، جرّب من جديد", "خذ نفسًا هادئًا ثم أعد المحاولة", "التعلّم يأتي بالتكرار، وأنت قريب", "لا تقلق، نحاول معًا", "محاولة طيبة، لنعد مرة أخرى", "كل مرة تقترب أكثر"],
    back: ["أهلًا بعودتك، اشتقنا لك", "سعيدون برؤيتك من جديد", "مرحبًا بك، لنكمل من حيث توقفنا", "أهلًا يا صديقي، هيا نبدأ بهدوء", "عدتَ، وهذا جميل", "البداية الجديدة جميلة دائمًا"],
    goal: ["أتممتَ هدف اليوم، ما شاء الله", "ثلاث نجوم اليوم، أحسنتَ", "هدفك لهذا اليوم تحقّق", "يوم موفّق، أحسنتَ", "أنجزتَ ما نويتَ اليوم", "عمل اليوم تمّ، هنيئًا لك"],
    streak: ["أيام متتالية معنا، ما شاء الله", "استمرارك جميل، واصل", "مداومتك تسعدنا", "يوم آخر في رحلتك، أحسنتَ", "الاستمرار أجمل من السرعة", "عدتَ اليوم أيضًا، رائع"],
    adhkar: ["أحسنتَ، ذكرٌ جميل", "قلتَها بهدوء، ما شاء الله", "ما أجمل أن تذكر الله", "أتممتَ الذكر، أحسنتَ", "كرّرتَها ثلاثًا، بارك الله فيك", "ذكر جديد في رصيدك"],
    noor: ["حروفك صارت أوضح، أحسنتَ", "نطقتَ بتأنٍّ، ما شاء الله", "أتممتَ درس الحروف", "قراءتك تتحسّن", "استمع ثم أعِد، هكذا نتعلّم", "حرف جديد صار صديقك"],
    hifz: ["أحسنتَ، أعدتَ الآية بانتباه", "تكرارك جميل، واصل بهدوء", "ما شاء الله، حفظك يقوى", "أتممتَ التكرار، أحسنتَ", "خطوة هادئة نحو الحفظ", "بالتكرار يثبت الحفظ، أحسنتَ"],
    num: ["أحسنتَ، الأرقام صارت أسهل", "حسابك دقيق، ما شاء الله", "إجابات جميلة", "عددتَ جيدًا", "رقم بعد رقم، وأنت تتقدّم"],
    story: ["ما أجمل أن تتعلّم من القصة", "أنصتَّ جيدًا، أحسنتَ", "فهمتَ العبرة، ما شاء الله", "أحسنتَ الإنصات والتفكير"],
    comp: ["جولة موفّقة، أحسنتَ", "عقلك نشيط اليوم", "أجبتَ بتركيز، رائع", "منافسة جميلة مع نفسك"],
    unlock: ["فُتح لك شيء جديد، هنيئًا", "اخترتَ لونًا جميلًا", "أضفتَ إلى مجموعتك، أحسنتَ", "هدية جديدة لك، هنيئًا"]
  };
  var lastLine = {};
  function pick(cat) {
    var a = L[cat] || L.lesson, i, n = 0;
    do { i = Math.floor(Math.random() * a.length); n++; } while (a.length > 1 && lastLine[cat] === i && n < 8);
    lastLine[cat] = i; return a[i];
  }

  /* ───────── واجهة: الشريحة ───────── */
  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2l2.9 6.1 6.7.8-4.9 4.6 1.3 6.6L12 17l-6 3.3 1.3-6.6L2.4 9.1l6.7-.8z" fill="#F2B71F" stroke="#B07A00" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 5.4l1.5 3.3" stroke="#FFF3B0" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>';
  var chip, cnt, live, toast, tT, shown = 0, sheet = null, tab = "lamp", confirmI = -1, confirmT = 0;
  function mode() { return $("view-home") ? "home" : ($("scene") ? "valley" : "none"); }
  function cur() { return prof(load(), pid()); }
  function build() {
    if (chip) return;
    var m = mode(); D.documentElement.classList.add("rw-" + m);
    chip = D.createElement("button"); chip.type = "button"; chip.className = "rw-chip"; chip.id = "rwChip";
    chip.innerHTML = STAR + '<span id="rwCnt">٠</span>'; cnt = chip.querySelector("#rwCnt");
    chip.addEventListener("click", function () { open(); });
    live = D.createElement("div"); live.className = "rw-live"; live.setAttribute("role", "status"); live.setAttribute("aria-live", "polite");
    toast = D.createElement("div"); toast.className = "rw-toast"; toast.setAttribute("aria-hidden", "true");
    D.body.appendChild(chip); D.body.appendChild(live); D.body.appendChild(toast);
    syncChip(true); gifts();
  }
  function syncChip(noAnim) {
    if (!chip) return;
    var p = cur(); shown = p.stars; cnt.textContent = num(p.stars);
    chip.setAttribute("aria-label", "نجومي: " + sTxt(p.stars) + ". افتح مقتنياتي");
  }
  function countTo(to) {
    var from = shown; shown = to;
    if (!cnt) return;
    if (reduced() || from === to) { cnt.textContent = num(to); return; }
    var t0 = Date.now(), dur = 520;
    (function step() { var k = Math.min(1, (Date.now() - t0) / dur); cnt.textContent = num(Math.round(from + (to - from) * k)); if (k < 1) setTimeout(step, 40); })();
  }
  function pulse() { if (!chip || reduced()) return; chip.classList.remove("pulse"); void chip.offsetWidth; chip.classList.add("pulse"); }
  function activeView() { var v = D.querySelector(".view.active"); return v ? v.id : ""; }
  function visibleRule() {
    var m = mode();
    if (m === "home") { var h = $("view-home"); return !!(h && h.classList.contains("active")); }
    if (m === "valley") {
      var g = $("gate"); if (g && !g.classList.contains("off") && g.offsetParent !== null) return false;
      var it = $("intro"); if (it && it.classList.contains("on")) return false;
      var pn = $("panel"); if (pn && pn.children.length) return false;
      var pr = $("parent"); if (pr && pr.classList.contains("on")) return false;
      return true;
    }
    return false;
  }
  function tick() {
    if (!chip) return;
    var on = visibleRule() && !(sheet && sheet.classList.contains("on"));
    if (chip.classList.contains("on") !== on) chip.classList.toggle("on", on);
  }

  /* ───────── واجهة: طيران النجمة والتشجيع ───────── */
  function fly(n, big) {
    if (reduced() || !D.body.animate) return;
    var from = { x: W.innerWidth / 2, y: W.innerHeight * 0.52 }, to = { x: W.innerWidth / 2, y: 40 };
    if (chip && chip.classList.contains("on")) { var r = chip.getBoundingClientRect(); to = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
    var k = Math.min(n, 3), i;
    for (i = 0; i < k; i++) (function (i) {
      var s = D.createElement("div"); s.className = "rw-fly"; s.innerHTML = STAR; D.body.appendChild(s);
      var dx = (i - (k - 1) / 2) * 34;
      var a = s.animate([
        { transform: "translate(" + (from.x - 17 + dx) + "px," + (from.y - 17) + "px) scale(.4)", opacity: 0 },
        { transform: "translate(" + (from.x - 17 + dx) + "px," + (from.y - 40) + "px) scale(1.25)", opacity: 1, offset: .25 },
        { transform: "translate(" + (to.x - 17) + "px," + (to.y - 17) + "px) scale(.8)", opacity: 1, offset: .88 },
        { transform: "translate(" + (to.x - 17) + "px," + (to.y - 17) + "px) scale(.3)", opacity: 0 }
      ], { duration: 950 + i * 90, delay: i * 80, easing: "cubic-bezier(.3,.7,.3,1)", fill: "both" });
      a.onfinish = function () { try { s.remove(); } catch (e) {} };
    })(i);
  }
  function confetti() {
    if (reduced() || !D.body.animate) return;
    var gold = cur().gifts.g10 !== false && cur().total >= 10, n = gold ? 18 : 8, i;
    for (i = 0; i < n; i++) (function (i) {
      var s = D.createElement("div"); s.className = "rw-fly"; s.innerHTML = STAR; s.style.width = s.style.height = (18 + (i % 3) * 8) + "px"; D.body.appendChild(s);
      var x0 = gold ? Math.random() * W.innerWidth : W.innerWidth / 2, y0 = gold ? -30 : W.innerHeight * .45;
      var x1 = gold ? x0 + (Math.random() - .5) * 80 : x0 + (Math.random() - .5) * 260, y1 = gold ? W.innerHeight * (.55 + Math.random() * .4) : y0 + (Math.random() - .8) * 220;
      var a = s.animate([{ transform: "translate(" + x0 + "px," + y0 + "px) rotate(0)", opacity: 0 }, { opacity: 1, offset: .15 }, { transform: "translate(" + x1 + "px," + y1 + "px) rotate(" + (i % 2 ? 200 : -200) + "deg)", opacity: 0 }], { duration: 1500 + (i % 5) * 160, delay: i * 60, easing: "ease-out", fill: "both" });
      a.onfinish = function () { try { s.remove(); } catch (e) {} };
    })(i);
  }
  function say(cat, plus) {
    build();
    var line = typeof cat === "string" && L[cat] ? pick(cat) : String(cat);
    var v = activeView(), bot = (v === "view-surah" || v === "view-ayahs");
    toast.className = "rw-toast" + (bot ? " bot" : "");
    toast.innerHTML = "";
    toast.appendChild(D.createTextNode(line));
    var pl = plus ? (plus === 1 ? "نجمة جديدة" : plus === 2 ? "نجمتان جديدتان" : num(plus) + " نجوم جديدة") : "";
    if (plus) { var b = D.createElement("b"); b.textContent = pl; toast.appendChild(b); }
    live.textContent = ""; setTimeout(function () { live.textContent = line + (plus ? "، " + pl : ""); }, 30);
    void toast.offsetWidth; toast.classList.add("show");
    clearTimeout(tT); tT = setTimeout(function () { toast.classList.remove("show"); }, 2500);
    lastToast = Date.now();
  }
  var lastToast = 0, lastSoft = 0;

  /* ───────── المنح ───────── */
  function award(eid, n, cat) {
    n = n || 1; build();
    var o = load(), p = prof(o, pid());
    if (p.awards.indexOf(eid) >= 0) return false;
    p.awards.push(eid); if (p.awards.length > MAXA) p.awards.shift();
    rollDay(p);
    var first = p.day.earned === 0;
    p.stars += n; p.total += n; p.day.earned += n;
    var goalNow = false;
    if (p.day.earned >= GOAL && !p.day.goalDone) { p.day.goalDone = true; goalNow = true; }
    if (first) {
      var t = today(), y = ymd(new Date(Date.now() - 864e5));
      if (p.streak.last === y) p.streak.n += 1; else if (p.streak.last !== t) p.streak.n = 1;
      p.streak.last = t;
    }
    save(o);
    var line = goalNow ? "goal" : (first && p.streak.n >= 2 ? "streak" : (cat || "lesson"));
    setTimeout(function () { fly(n); }, 150);
    setTimeout(function () { countTo(p.stars); pulse(); }, 750);
    say(line, n);
    if (goalNow) setTimeout(confetti, 600);
    gifts();
    return true;
  }

  /* ───────── هدايا ───────── */
  function gifts() {
    var p = cur(), h = D.documentElement.classList;
    h.toggle("rw-gold", p.total >= 25 && p.gifts.g25 !== false);
    h.toggle("rw-warm", p.total >= 50 && p.gifts.g50 !== false);
  }
  var GIFTS = [
    ["g10", 10, "نجوم الاحتفال", "تتساقط نجوم ذهبية عند إتمام هدف اليوم"],
    ["g25", 25, "إطار ذهبي", "يلمع إطار عدّاد النجوم"],
    ["g50", 50, "وهج دافئ", "لمسة دافئة ناعمة على الشاشة"]
  ];

  /* ───────── المقتنيات ───────── */
  function open(t) {
    build();
    if (t) tab = t;
    if (!sheet) {
      sheet = D.createElement("div"); sheet.className = "rw-sheet"; sheet.id = "rwSheet";
      sheet.addEventListener("click", function (e) { if (e.target === sheet) close(); });
      D.addEventListener("keydown", function (e) { if (e.key === "Escape" && sheet.classList.contains("on")) close(); });
      D.body.appendChild(sheet);
    }
    render(); sheet.classList.add("on"); tick();
    var x = sheet.querySelector(".rw-x"); if (x) try { x.focus({ preventScroll: true }); } catch (e) {}
  }
  function close() { if (sheet) sheet.classList.remove("on"); confirmI = -1; tick(); try { chip.focus({ preventScroll: true }); } catch (e) {} }
  function ring(p) {
    var r = 32, c = 2 * Math.PI * r, f = Math.min(1, p.day.earned / GOAL);
    return '<div class="rw-ring" aria-label="هدف اليوم: ' + num(Math.min(p.day.earned, GOAL)) + ' من ' + num(GOAL) + '"><svg viewBox="0 0 76 76"><circle cx="38" cy="38" r="' + r + '" fill="none" stroke="#EADFC2" stroke-width="9"/><circle cx="38" cy="38" r="' + r + '" fill="none" stroke="#F2B71F" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (c * (1 - f)).toFixed(1) + '"/></svg><div class="num">' + num(Math.min(p.day.earned, GOAL)) + '</div></div>';
  }
  function render() {
    var o = load(), p = prof(o, pid()); rollDay(p);
    var st = p.streak.n && (p.streak.last === today() || p.streak.last === ymd(new Date(Date.now() - 864e5))) ? p.streak.n : 0;
    var h = '<div class="rw-box" role="dialog" aria-modal="true" aria-label="مقتنياتي"><div class="rw-head">' + ring(p) +
      '<div class="rw-hinfo"><strong>' + sTxt(p.stars) + '</strong>هدف اليوم: ' + num(Math.min(p.day.earned, GOAL)) + ' من ' + num(GOAL) + '<br>' +
      (st ? 'أيام متتالية: ' + num(st) : 'ابدأ اليوم بنجمتك الأولى') + '</div><button class="rw-x" type="button" aria-label="إغلاق">✕</button></div>' +
      '<div class="rw-tabs" role="tablist">' + [["lamp", "المصباح"], ["album", "الألبوم"], ["gifts", "هدايا"]].map(function (t) { return '<button class="rw-tab" role="tab" type="button" data-t="' + t[0] + '" aria-selected="' + (tab === t[0]) + '">' + t[1] + '</button>'; }).join("") + '</div>' +
      '<div class="rw-body" role="tabpanel">' + (tab === "lamp" ? lampHtml(p) : tab === "album" ? albumHtml(p) : giftsHtml(p)) + '</div></div>';
    sheet.innerHTML = h;
    sheet.querySelector(".rw-x").onclick = close;
    Array.prototype.forEach.call(sheet.querySelectorAll(".rw-tab"), function (b) { b.onclick = function () { tab = b.dataset.t; confirmI = -1; render(); }; });
    Array.prototype.forEach.call(sheet.querySelectorAll("[data-col]"), function (b) { b.onclick = function () { colorAct(+b.dataset.col); }; });
    Array.prototype.forEach.call(sheet.querySelectorAll("[data-gift]"), function (b) { b.onclick = function () { var oo = load(), pp = prof(oo, pid()), k = b.dataset.gift; pp.gifts[k] = pp.gifts[k] === false; save(oo); gifts(); render(); }; });
  }
  function lampHtml(p) {
    var cur0 = savedCol();
    var rows = COLS.map(function (c, i) {
      var open = !COST[i] || p.unlocked.indexOf("col:" + i) >= 0, btn;
      if (open) btn = i === cur0 ? '<button class="rw-btn ok" type="button" disabled>مُستخدَم ✓</button>' : '<button class="rw-btn" type="button" data-col="' + i + '">استخدم</button>';
      else if (confirmI === i) btn = '<button class="rw-btn ask" type="button" data-col="' + i + '">تأكيد: −' + num(COST[i]) + '</button>';
      else if (p.stars < COST[i]) btn = '<button class="rw-btn soft" type="button" disabled>' + num(COST[i]) + ' نجوم</button>';
      else btn = '<button class="rw-btn" type="button" data-col="' + i + '">افتح ' + num(COST[i]) + ' ' + STAR + '</button>';
      return '<div class="rw-row"><span class="rw-sw" style="background:radial-gradient(circle at 35% 30%,rgb(' + c[1] + '),rgb(' + c[0] + '))"></span><div class="t">' + CN[i] + '<small>' + (open ? (COST[i] ? 'مفتوح' : 'مجاني') : 'يحتاج ' + num(COST[i]) + ' نجوم') + '</small></div>' + btn + '</div>';
    }).join("");
    return '<p class="rw-note">اختر لون فانوس «أثر» في الرئيسية. الألوان المقفلة تُفتح بالنجوم، وكل سعر ظاهر أمامك.</p>' + rows;
  }
  function colorAct(i) {
    var o = load(), p = prof(o, pid());
    var open = !COST[i] || p.unlocked.indexOf("col:" + i) >= 0;
    if (open) { applyColor(i); render(); return; }
    if (p.stars < COST[i]) return;
    if (confirmI !== i) { confirmI = i; clearTimeout(confirmT); confirmT = setTimeout(function () { if (confirmI === i) { confirmI = -1; if (sheet.classList.contains("on")) render(); } }, 3500); render(); return; }
    p.stars -= COST[i]; p.unlocked.push("col:" + i); save(o); confirmI = -1;
    applyColor(i); syncChip(); say("unlock"); render();
  }
  function albumHtml(p) {
    var ms = marksNow(), got = 0, base = albumBase();
    var cells = ALB.map(function (a) {
      var ok = a[2].some(function (m) { return ms.indexOf(m) >= 0; }); if (ok) got++;
      return '<div class="rw-cell ' + (ok ? "got" : "lock") + '" aria-label="' + a[1] + (ok ? "" : " (لم تُفتح بعد)") + '"><img src="' + base + a[0] + '.webp" alt="" loading="lazy" decoding="async">' + (ok ? '<span class="nm">' + a[1] + '</span>' : '') + '</div>';
    }).join("");
    return '<p class="rw-note">جمعتَ ' + num(got) + ' من ' + num(ALB.length) + '. كل درس في الوادي يترك أثرًا جديدًا هنا.</p><div class="rw-grid">' + cells + '</div>';
  }
  function giftsHtml(p) {
    return '<p class="rw-note">هدايا تُفتح تلقائيًا كلما زاد مجموع نجومك (لا تُنقص عند الصرف). مجموعك: ' + num(p.total) + '.</p>' + GIFTS.map(function (g) {
      var ok = p.total >= g[1], on = p.gifts[g[0]] !== false;
      return '<div class="rw-row"><div class="t">' + g[2] + '<small>' + g[3] + '</small>' + (ok ? '' : '<div class="rw-progress"><i style="width:' + Math.round(p.total / g[1] * 100) + '%"></i></div>') + '</div>' +
        (ok ? '<button class="rw-sw-on" role="switch" type="button" aria-label="' + g[2] + '" aria-checked="' + on + '" data-gift="' + g[0] + '"></button>' : '<button class="rw-btn soft" type="button" disabled>عند ' + num(g[1]) + '</button>') + '</div>';
    }).join("");
  }

  /* ───────── بطاقة ولي الأمر ───────── */
  function parentCard() {
    var p = cur(), st = p.streak.n && (p.streak.last === today() || p.streak.last === ymd(new Date(Date.now() - 864e5))) ? p.streak.n : 0;
    var c = D.createElement("div"); c.className = "rw-parent";
    c.innerHTML = '<h3>نجوم الطفل</h3><p>أيام متتالية: ' + num(st) + '<br>مجموع النجوم: ' + num(p.total) + '<br>رصيده الآن: ' + num(p.stars) + '</p><button class="rw-btn soft" type="button">تصفير المكافآت</button>';
    var b = c.querySelector("button"), t = 0, ask = false;
    b.onclick = function () {
      if (!ask) { ask = true; b.textContent = "تأكيد التصفير؟ لا رجوع"; b.className = "rw-btn ask"; clearTimeout(t); t = setTimeout(function () { ask = false; b.textContent = "تصفير المكافآت"; b.className = "rw-btn soft"; }, 4000); return; }
      var o = load(); o.profiles[pid()] = fresh(); save(o); syncChip(); gifts(); ask = false; b.textContent = "تمّ التصفير"; b.className = "rw-btn soft"; b.disabled = true;
      c.querySelector("p").innerHTML = "أيام متتالية: ٠<br>مجموع النجوم: ٠<br>رصيده الآن: ٠";
    };
    return c;
  }
  function parentHook() {
    var dash = $("view-dashboard"), par = $("parent");
    function putHome() { if (dash && dash.classList.contains("active") && !dash.querySelector(".rw-parent")) { var g = dash.querySelector(".growth-card"); if (g && g.parentNode) g.parentNode.insertBefore(parentCard(), g.nextSibling); } }
    function putValley() { if (par && par.classList.contains("on") && !par.querySelector(".rw-parent")) { var c = par.querySelector(".pcard:not(.pgate)"); if (c) { var tg = c.querySelector(".ptag"); c.insertBefore(parentCard(), tg ? tg.nextSibling : c.firstChild); } } }
    try { if (dash) new MutationObserver(function () { if (!dash.classList.contains("active")) { var x = dash.querySelector(".rw-parent"); if (x) x.remove(); } else putHome(); }).observe(dash, { attributes: true, attributeFilter: ["class"] }); } catch (e) {}
    try { if (par) new MutationObserver(function () { if (par.classList.contains("on")) putValley(); }).observe(par, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] }); } catch (e) {}
  }

  /* ───────── التقاط الإتمام ───────── */
  function viewCat(v) {
    if (v === "view-letters" || v === "view-noor") return "noor";
    if (v === "view-numbers") return "num";
    if (v === "view-adhkar") return "adhkar";
    if (v === "view-library") return "story";
    if (v === "view-ayq" || v === "view-brain" || v === "view-quiz" || v === "view-prophets" || v === "view-door") return "comp";
    if (v === "view-surah" || v === "view-ayahs") return "hifz";
    return "lesson";
  }
  function hookRoot() {
    var seen = typeof WeakSet === "function" ? new WeakSet() : null;
    function win(el) {
      if (seen) { if (seen.has(el)) return; seen.add(el); }
      var t = (el.textContent || "").trim(), v = activeView(), cat = viewCat(v);
      if (/حاول/.test(t)) { if (Date.now() - lastSoft > 6000) { lastSoft = Date.now(); say("retry"); } return; }
      award("r:" + (v || "x") + ":" + Date.now() + ":" + Math.floor(Math.random() * 1e6), 1, cat);
    }
    function scan(n) {
      if (!n || n.nodeType !== 1) return;
      if (n.matches && n.matches(".wg-big")) { win(n); return; }
      if (n.querySelectorAll) { var l = n.querySelectorAll(".wg-big"), i; for (i = 0; i < l.length; i++) win(l[i]); }
    }
    try { new MutationObserver(function (ms) { var i, j; for (i = 0; i < ms.length; i++) for (j = 0; j < ms[i].addedNodes.length; j++) scan(ms[i].addedNodes[j]); }).observe(D.body, { childList: true, subtree: true }); } catch (e) {}
    /* حلقة الحفظ: توهّج المدار */
    var ow = $("orbWrap"), lastH = 0;
    if (ow) try { new MutationObserver(function () { if (ow.classList.contains("burst") && Date.now() - lastH > 45000) { lastH = Date.now(); award("r:hifz:" + Date.now(), 1, "hifz"); } }).observe(ow, { attributes: true, attributeFilter: ["class"] }); } catch (e) {}
    /* الأذكار: كل زيادة في عدّاد الذكر المكتوب */
    try {
      var proto = W.Storage && W.Storage.prototype, si = proto.setItem;
      var sum = function (s) { try { var d = JSON.parse(s) || {}, t = 0, k; for (k in d) t += +d[k] || 0; return t; } catch (e) { return 0; } };
      proto.setItem = function (k, v) {
        var isA = this === W.localStorage && typeof k === "string" && k.indexOf("athar_adhkar_v1_") === 0, pre = 0;
        if (isA) { try { pre = sum(this.getItem(k)); } catch (e) {} }
        var r = si.apply(this, arguments);
        if (isA) { try { if (sum(v) > pre) award("r:adk:" + Date.now(), 1, "adhkar"); } catch (e) {} }
        return r;
      };
    } catch (e) {}
    /* تبديل الابن */
    try { W.addEventListener("storage", function (e) { if (e.key === PK || e.key === RW) refresh(); }); } catch (e) {}
  }
  function hookValley() {
    var tries = 0;
    (function go() {
      var S = W.State;
      if (!S || typeof S.learn !== "function") { if (++tries < 40) setTimeout(go, 250); return; }
      if (S.__rw) return; S.__rw = 1;
      var l = S.learn, r = S.reviewDone, d = S.dailyDone;
      S.learn = function (id) { var was = false; try { was = S.isLearned(id); } catch (e) {} var x = l.apply(this, arguments); if (!was) { try { award("v:learn:" + id, 1, "lesson"); } catch (e) {} } return x; };
      S.reviewDone = function (id) { var x = r.apply(this, arguments); try { award("v:rev:" + id + ":" + today(), 1, "ok"); } catch (e) {} return x; };
      S.dailyDone = function () { var x = d.apply(this, arguments); try { if (x) award("v:daily:" + today(), 1, "lesson"); } catch (e) {} return x; };
      var A = W.AtharAudio;
      if (A && typeof A.sfx === "function" && !A.__rw) {
        A.__rw = 1; var sfx = A.sfx.bind(A);
        A.sfx = function (n) {
          try {
            var t = Date.now();
            if (n === "ok" && t - lastToast > 15000 && t - lastSoft > 15000) { lastSoft = t; say("ok"); }
            else if (n === "no" && t - lastSoft > 15000) { lastSoft = t; say("retry"); }
          } catch (e) {}
          return sfx.apply(null, arguments);
        };
      }
    })();
  }

  /* ───────── تشغيل ───────── */
  function refresh() { build(); syncChip(); gifts(); tick(); if (sheet && sheet.classList.contains("on")) render(); }
  function palGuard() {
    /* منع اختيار لون مقفل في لوحة ألوان الرئيسية، وفتح المقتنيات بدلًا من ذلك */
    D.addEventListener("click", function (e) {
      var b = e.target && e.target.closest && e.target.closest("#wPal .sw"); if (!b) return;
      var i = +b.dataset.i; if (colorOpen(i)) return;
      e.stopImmediatePropagation(); e.preventDefault(); open("lamp");
      var wp = $("wPal"); if (wp) wp.hidden = true;
    }, true);
    var pal = $("wPal");
    if (pal) try { new MutationObserver(function () { if (pal.hidden) return; Array.prototype.forEach.call(pal.querySelectorAll(".sw"), function (s) { s.classList.toggle("rw-lock", !colorOpen(+s.dataset.i)); }); }).observe(pal, { attributes: true, attributeFilter: ["hidden"] }); } catch (e) {}
  }
  function init() {
    var m = mode(); if (m === "none") return;
    build();
    /* ألوان الابن الحالية تبقى مفتوحة: لا نقفل ما اختاره قبل النظام */
    var o = load(), p = prof(o, pid());
    if (!p.gf) { var c = savedCol(); if (c > 0 && p.unlocked.indexOf("col:" + c) < 0) p.unlocked.push("col:" + c); p.gf = 1; save(o); }
    rollDay(p);
    if (p.streak.last && dayDiff(p.streak.last, today()) >= 2 && p.welcome !== today()) { p.welcome = today(); save(o); setTimeout(function () { say("back"); }, 1600); }
    if (m === "home") { hookRoot(); palGuard(); } else hookValley();
    parentHook();
    setInterval(tick, 500); tick();
    W.addEventListener("resize", tick);
  }
  W.AtharReward = {
    award: award, say: say, open: open, close: close, refresh: refresh, colorOpen: colorOpen,
    state: function () { return JSON.parse(JSON.stringify(cur())); },
    reset: function () { var o = load(); o.profiles[pid()] = fresh(); save(o); refresh(); }
  };
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", init); else init();
})();
