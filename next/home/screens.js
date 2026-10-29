/* شاشات الطفل (D / r3+r7): رأس موحّد، عناوين، تباين تلقائي للبطاقات، ظهور متدرّج، شريط تقدّم، نجوم النجاح، ردّ لمس. لا يمسّ منطق التطبيق. */
(function(){
  "use strict";
  var de = document.documentElement;
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)");
  var TITLES = {
    "view-surahs":"حفظ القرآن","view-ayahs":"حفظ آيات","view-letters":"عالم الحروف","view-numbers":"عالم الأرقام",
    "view-adhkar":"الأذكار","view-ayq":"اسألني في الآيات","view-brain":"ألعاب الدماغ","view-prophets":"قصص الأنبياء",
    "view-quiz":"المسابقات","view-noor":"القاعدة النورانية","view-library":"مكتبتي","view-door":""
  };
  /* ألوان شريط التقدّم لكل شاشة */
  var PROG = {
    "view-letters":["#7c3aed","#f472b6"], "view-numbers":["#f59e0b","#fde047"],
    "view-adhkar":["#0d9488","#5eead4"], "view-noor":["#ea580c","#fdba74"]
  };
  function $(id){ return document.getElementById(id); }
  function jget(k){ try{ var v = JSON.parse(localStorage.getItem(k)); return v && typeof v === "object" ? v : null; }catch(e){ return null; } }
  function pid(){ var p = jget("athar_profiles_v1"); return (p && p.active) || "p1"; }

  /* ---------- عناوين + شريط التقدّم ---------- */
  function buildTitles(){
    Object.keys(TITLES).forEach(function(id){
      var v = $(id); if(!v) return;
      var head = v.querySelector(".browse-head"); if(!head || head.querySelector(".sc-title")) return;
      var t = document.createElement("div"); t.className = "sc-title"; t.setAttribute("role","heading"); t.setAttribute("aria-level","1");
      var sp = document.createElement("span"); sp.className = "sc-tt"; sp.textContent = TITLES[id]; t.appendChild(sp);
      if(PROG[id]){
        var pr = document.createElement("span"); pr.className = "sc-prog"; pr.hidden = true; pr.setAttribute("role","progressbar");
        pr.setAttribute("aria-valuemin","0"); pr.setAttribute("aria-valuemax","100");
        pr.style.setProperty("--g1",PROG[id][0]); pr.style.setProperty("--g2",PROG[id][1]);
        pr.appendChild(document.createElement("b")); t.appendChild(pr);
      }
      head.appendChild(t);
    });
    var dt = $("doorTitle"), dv = document.querySelector("#view-door .sc-tt");
    if(dt && dv){
      var sy = function(){ dv.textContent = dt.textContent; };
      sy(); try{ new MutationObserver(sy).observe(dt,{childList:true,characterData:true,subtree:true}); }catch(e){}
    }
  }
  function countPos(o){ var n = 0; if(o) for(var k in o) if(o[k] > 0) n++; return n; }
  function progressFor(id, view){
    // 1) أثناء جولة: نقاط الجولة الحيّة
    var dots = view.querySelectorAll(".dots-prog i");
    if(dots.length > 1 && (id === "view-letters" || id === "view-numbers" || id === "view-adhkar")){
      var on = view.querySelectorAll(".dots-prog i.on").length, cur = view.querySelectorAll(".dots-prog i.cur").length ? 0 : 0;
      return {p: on / dots.length, label: on + " / " + dots.length};
    }
    var P = pid();
    if(id === "view-noor"){ var n = countPos(jget("athar_noor_v1_" + P)); return n ? {p: Math.min(1, n / 105), label: n + " / 105"} : null; }
    if(id === "view-adhkar"){ var a = countPos(jget("athar_adhkar_v1_" + P)); return a ? {p: Math.min(1, a / 13), label: a + " / 13"} : null; }
    // الحروف/الأرقام خارج الجولة: إنجاز رحلة اليوم
    var m = jget("athar_mis_v1_" + P), d = m && m.done, c = 0;
    if(!d) return null;
    var today = new Date(), ds = today.getFullYear() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2);
    if(m.date && m.date !== ds) return null;
    for(var k in d) if(d[k]) c++;
    return c ? {p: Math.min(1, c / 5), label: c + " / 5"} : null;
  }
  var progQ = 0;
  function updateProgress(){
    progQ = 0;
    var v = document.querySelector(".view.active"); if(!v || !PROG[v.id]) return;
    var pr = v.querySelector(".sc-prog"); if(!pr) return;
    var r = null; try{ r = progressFor(v.id, v); }catch(e){}
    if(!r){ pr.hidden = true; return; }
    pr.hidden = false; pr.style.setProperty("--p", Math.round(r.p * 100) + "%");
    pr.setAttribute("aria-valuenow", String(Math.round(r.p * 100))); pr.setAttribute("aria-label", "تقدّمي: " + r.label);
  }
  function qProgress(){ if(!progQ){ progQ = 1; requestAnimationFrame(updateProgress); } }

  /* ---------- تباين البطاقات الملوّنة ---------- */
  function parse(s){
    s = (s || "").trim(); var m;
    if((m = s.match(/^#([0-9a-f]{3})$/i))){ return [0,1,2].map(function(i){ return parseInt(m[1][i] + m[1][i], 16); }); }
    if((m = s.match(/^#([0-9a-f]{6})$/i))){ return [0,2,4].map(function(i){ return parseInt(m[1].substr(i,2), 16); }); }
    if((m = s.match(/^rgba?\(([^)]+)\)/))){ var a = m[1].split(/[ ,\/]+/).map(parseFloat); return a.slice(0,3); }
    return null;
  }
  function mix(a,b,t){ return [0,1,2].map(function(i){ return a[i] * (1 - t) + b[i] * t; }); }
  function lum(c){ var f = function(v){ v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); }
  function cr(a,b){ var x = lum(a), y = lum(b); if(x < y){ var t = x; x = y; y = t; } return (x + .05) / (y + .05); }
  var W = [255,255,255], INK = [18,11,34], K = [0,0,0];
  function tone(el){
    if(el.getAttribute("data-sc")) return;
    el.setAttribute("data-sc","1");
    var names = el.style.getPropertyValue("--c") ? ["--c"] : (el.style.getPropertyValue("--a") ? ["--a","--b"] : []);
    var cols = [];
    names.forEach(function(n){ var c = parse(el.style.getPropertyValue(n)); if(c) cols.push([n, c]); });
    if(!cols.length) return;
    if(cols.every(function(x){ return cr(W, mix(x[1], W, .1)) >= 5.6; })){ el.classList.add("sc-w"); return; }
    if(cols.every(function(x){ return cr(INK, mix(x[1], K, .08)) >= 5.6; })){ el.classList.add("sc-i"); return; }
    cols.forEach(function(x){
      var k = x[1];
      for(var i = 0; i < 14 && cr(W, mix(k, W, .1)) < 5.6; i++) k = mix(k, K, .07);
      el.style.setProperty(x[0], "rgb(" + k.map(Math.round).join(",") + ")");
    });
    el.classList.add("sc-w");
  }
  function toneAll(root){
    if(root.nodeType !== 1) return;
    var st = root.getAttribute && root.getAttribute("style");
    if(st && (st.indexOf("--c") >= 0 || st.indexOf("--a") >= 0)) tone(root);
    var l = root.querySelectorAll ? root.querySelectorAll('[style*="--c"],[style*="--a:"]') : [];
    for(var i = 0; i < l.length; i++) tone(l[i]);
  }

  /* ---------- ظهور متدرّج (أول 8 بطاقات) ---------- */
  var CARDS = ".choice-tile,.letter-tile,.adk-tile,.adk-opt,.ps-card,.lib-book,.ayq-stage,.us-chip,.lt-h,.us-lan";
  function stagger(root){
    if(RM && RM.matches) return;
    if(root.nodeType !== 1) return;
    var list = [], seen = 0;
    if(root.matches && root.matches(CARDS)) list.push(root);
    var q = root.querySelectorAll ? root.querySelectorAll(CARDS) : [];
    for(var i = 0; i < q.length && list.length < 8; i++) list.push(q[i]);
    list.slice(0, 8).forEach(function(el, i){
      el.style.setProperty("--sc-i", i); el.classList.add("sc-st");
      setTimeout(function(){ el.classList.remove("sc-st"); }, 300 + i * 40 + 120);
    });
  }

  /* ---------- نجوم النجاح ---------- */
  var lastWin = 0;
  function celebrate(){
    if(Date.now() - lastWin < 2500) return; lastWin = Date.now();
    if(RM && RM.matches) return;
    var box = document.createElement("div"); box.className = "sc-stars"; box.setAttribute("aria-hidden","true");
    for(var i = 0; i < 12; i++){
      var s = document.createElement("i");
      s.style.cssText = "--x:" + (6 + i * 8 + (i % 3) * 2) + ";--dx:" + ((i % 2 ? 1 : -1) * (10 + (i * 7) % 40)) + ";--d:" + (i * 55) + ";--s:" + (18 + (i * 5) % 16) + "px";
      box.appendChild(s);
    }
    document.body.appendChild(box); setTimeout(function(){ if(box.parentNode) box.parentNode.removeChild(box); }, 2700);
  }
  function renameAgain(root){
    var btns = root.tagName === "BUTTON" ? [root] : (root.querySelectorAll ? root.querySelectorAll("button") : []);
    for(var i = 0; i < btns.length; i++) if(btns[i].textContent.trim() === "جولة أخرى") btns[i].textContent = "مرة أخرى ↻";
  }
  function winCheck(root){
    if(root.nodeType !== 1) return;
    renameAgain(root);
    var t = root.textContent || "";
    if(t.indexOf("أحسنت!") >= 0 && t.indexOf("⭐") >= 0) celebrate();
  }

  /* ---------- إتاحة: حقول بلا تسمية ---------- */
  function labelInputs(root){
    if(root.nodeType !== 1) return;
    var l = root.querySelectorAll ? root.querySelectorAll("input:not([aria-label]):not([aria-labelledby]),select:not([aria-label]),textarea:not([aria-label])") : [];
    for(var i = 0; i < l.length; i++){
      var e = l[i]; if(e.id && document.querySelector('label[for="' + e.id + '"]')) continue;
      var lab = e.getAttribute("placeholder") || e.title || "";
      var prev = e.previousElementSibling; if(!lab && prev) lab = prev.textContent.trim().slice(0,40);
      e.setAttribute("aria-label", lab || "حقل إدخال");
    }
  }


  /* ---------- (4) أيقونات SVG بدل إيموجي النظام ---------- */
  var IC = {
    lamp:'<path d="M9.5 3.5h5M12 3.5V6"/><path d="M8.5 7h7l1.8 4v3.5L15.5 19h-7l-1.8-4.5V11z" class="gl" fill="#FFC93C"/><path d="M9 19.5V21h6v-1.5" fill="#B7791F"/><path d="M12 9.5v7"/>',
    spark:'<path d="M12 3c.7 4.7 3.3 7.3 9 9-5.7 1.7-8.3 4.3-9 9-.7-4.7-3.3-7.3-9-9 5.7-1.7 8.3-4.3 9-9z" fill="#FFE27A"/>',
    book:'<path d="M3 6c3-1.3 6-1 9 1 3-2 6-2.3 9-1v13c-3-1.3-6-1-9 1-3-2-6-2.3-9-1z" fill="#FFF6D8"/><path d="M12 7v13"/>',
    ques:'<circle cx="12" cy="12" r="9" fill="#FFC93C"/><path d="M9.5 9.5a2.5 2.5 0 115 0c0 1.8-2.5 2-2.5 4M12 16.6v.4"/>',
    bulb:'<path d="M12 3a6 6 0 00-3.5 10.9V17h7v-3.1A6 6 0 0012 3z" fill="#FFE27A"/><path d="M9.5 20h5M10.5 22h3"/>',
    abc:'<rect x="3" y="4" width="18" height="16" rx="4" fill="#8FD3FF"/><text x="12" y="16.5" text-anchor="middle" font-size="11" font-weight="800" fill="#3a2b4d">أب</text>',
    pen:'<path d="M4 20l1-4L16 5l3 3L8 19z" fill="#FFB35C"/><path d="M14 7l3 3"/>',
    balloon:'<ellipse cx="12" cy="10" rx="6" ry="7.5" fill="#FF8FB1"/><path d="M12 17.5l-1.2 2.3h2.4zM12 20c-1 1.4 1 1.8 0 3"/>',
    plus:'<circle cx="12" cy="12" r="9" fill="#7BE0A0"/><path d="M12 7.5v9M7.5 12h9"/>',
    minus:'<circle cx="12" cy="12" r="9" fill="#FF8FB1"/><path d="M7.5 12h9"/>',
    times:'<circle cx="12" cy="12" r="9" fill="#8FD3FF"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7"/>',
    dice:'<rect x="4" y="4" width="16" height="16" rx="4" fill="#fff"/><g fill="#3a2b4d" stroke="none"><circle cx="9" cy="9" r="1.4"/><circle cx="15" cy="9" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="9" cy="15" r="1.4"/><circle cx="15" cy="15" r="1.4"/></g>',
    puzzle:'<path d="M4 9h4a2.2 2.2 0 114.4 0H16v3.6a2.2 2.2 0 110 4.4V20H4z" fill="#B79BFF"/>',
    search:'<circle cx="10.5" cy="10.5" r="6" fill="#DFF3FF"/><path d="M15 15l5.5 5.5" stroke-width="2.6"/>',
    gem:'<path d="M6 4h12l4 6-10 11L2 10z" fill="#8FD3FF"/><path d="M2 10h20M9 4l-2 6 5 11 5-11-2-6"/>',
    cup:'<path d="M7 4h10v5a5 5 0 01-10 0z" fill="#FFC93C"/><path d="M7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3M12 14v4M8.5 20h7"/>',
    beads:'<g fill="#FFB35C"><circle cx="12" cy="4.5" r="2"/><circle cx="17.5" cy="7" r="2"/><circle cx="19" cy="12.5" r="2"/><circle cx="16" cy="17.5" r="2"/><circle cx="8" cy="17.5" r="2"/><circle cx="5" cy="12.5" r="2"/><circle cx="6.5" cy="7" r="2"/></g><circle cx="12" cy="21" r="1.6" fill="#B7791F"/>',
    mosque:'<path d="M5 20v-6a7 7 0 0114 0v6z" fill="#FFF6D8"/><path d="M12 7V3.5M10.8 5h2.4"/><path d="M9.5 20v-3.5a2.5 2.5 0 015 0V20" fill="#8FD3FF"/><path d="M3 20h18"/>',
    house:'<path d="M3.5 11.5L12 4l8.5 7.5V20h-17z" fill="#FFD08A"/><rect x="10" y="14" width="4" height="6" fill="#B7791F"/>',
    mount:'<path d="M2 20L9 7l4.5 8 3-4.5L22 20z" fill="#9BD7A8"/>',
    leaf:'<path d="M5 19C5 10 11 5 20 5c0 9-5 15-13 14z" fill="#7BE0A0"/><path d="M5 19L14 10"/>',
    tree:'<circle cx="12" cy="9" r="6" fill="#7BE0A0"/><path d="M12 15v6M9 21h6"/>',
    drop:'<path d="M12 3C8 9 6 12 6 15a6 6 0 0012 0c0-3-2-6-6-12z" fill="#8FD3FF"/>',
    wind:'<path d="M3 9h11a3 3 0 10-3-3M3 14h15a3 3 0 11-3 3M3 19h7"/>',
    bow:'<g fill="none" stroke-width="2.6"><path d="M3 19a9 9 0 0118 0" stroke="#FF8FB1"/><path d="M6 19a6 6 0 0112 0" stroke="#FFC93C"/><path d="M9 19a3 3 0 016 0" stroke="#7BE0A0"/></g>',
    heart:'<path d="M12 20S3.5 14.5 3.5 8.8A4.3 4.3 0 0112 7a4.3 4.3 0 018.5 1.8C20.5 14.5 12 20 12 20z" fill="#FF8FB1"/>',
    shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" fill="#8FD3FF"/><path d="M8.5 12l2.5 2.5L16 9.5"/>',
    key:'<circle cx="8" cy="12" r="4.5" fill="#FFC93C"/><path d="M12.5 12H21M18 12v3M21 12v2.5"/>',
    compass:'<circle cx="12" cy="12" r="9" fill="#FFF6D8"/><path d="M15.5 8.5l-2 5-5 2 2-5z" fill="#FF8FB1"/>',
    hourglass:'<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9" fill="#FFE27A"/>',
    clock:'<circle cx="12" cy="12" r="9" fill="#FFF6D8"/><path d="M12 7v5l3.5 2"/>',
    coin:'<circle cx="12" cy="12" r="9" fill="#FFC93C"/><circle cx="12" cy="12" r="5.5"/>',
    cart:'<path d="M3 5h3l2 10h10l2-7H7" fill="#8FD3FF"/><circle cx="9.5" cy="19" r="1.6" fill="#3a2b4d"/><circle cx="17" cy="19" r="1.6" fill="#3a2b4d"/>',
    ruler:'<rect x="2.5" y="8" width="19" height="8" rx="2" fill="#FFE27A"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/>',
    scale:'<path d="M12 4v15M6 20h12M4 8h16"/><path d="M4 8l-2 6h4zM20 8l-2 6h4z" fill="#FFC93C"/>',
    n123:'<rect x="3" y="5" width="18" height="14" rx="4" fill="#B79BFF"/><text x="12" y="15.8" text-anchor="middle" font-size="9" font-weight="800" fill="#fff">١٢٣</text>',
    repeat:'<path d="M5 11V9a3 3 0 013-3h9l-2-2M19 13v2a3 3 0 01-3 3H7l2 2"/>',
    bars:'<path d="M5 20v-5M10 20v-9M15 20V8M20 20V4" stroke="#FFB35C" stroke-width="3.2"/>',
    diamond:'<path d="M12 3l8 9-8 9-8-9z" fill="#8FD3FF"/>',
    tri:'<path d="M12 4l9 16H3z" fill="#FF8FB1"/>',
    bubble:'<path d="M4 6a3 3 0 013-3h10a3 3 0 013 3v7a3 3 0 01-3 3h-5l-5 4v-4a3 3 0 01-3-3z" fill="#FFF6D8"/><path d="M8.5 9.5h7M8.5 12.5h4"/>',
    bell:'<path d="M6 17V11a6 6 0 0112 0v6l1.5 2h-15z" fill="#FFC93C"/><path d="M10 21h4"/>',
    note:'<path d="M9 17V6l10-2v11"/><circle cx="7" cy="17" r="2.5" fill="#B79BFF"/><circle cx="17" cy="15" r="2.5" fill="#B79BFF"/>',
    speaker:'<path d="M4 9h4l5-4v14l-5-4H4z" fill="#8FD3FF"/><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/>',
    road:'<path d="M9 3L4 21h16L15 3z" fill="#aab3c8"/><path d="M12 6v3M12 12v3M12 18v2" stroke="#fff"/>'
  };
  var GROUPS = "lamp:🏮🕯🌙🌅☀🌌🌕🌜|spark:✨🌟|book:📖📚📜📅|ques:❓|bulb:🧠|abc:🔤|pen:✍|balloon:🎈|plus:➕|minus:➖|times:✖|dice:🎲|puzzle:🧩|search:🔍|gem:💎|cup:🏆|beads:🤲📿|mosque:🕌🕋|house:🏡🏘|mount:⛰🏔🏞|leaf:🌿🌱🌾🍃🌸🌺🕊|tree:🌳🌴|drop:💧🌧🌊|wind:🌬|bow:🌈|heart:💚💛💞|shield:🛡|key:🔑|compass:🧭|hourglass:⏳|clock:🕒⏰|coin:💰🪙|cart:🛒|ruler:📏|scale:⚖|n123:🔢|repeat:🔁|bars:📶|diamond:🔷|tri:🔺|bubble:💬|bell:🔔|note:🎵|speaker:🔊|road:🛣";
  var EMO = {};
  GROUPS.split("|").forEach(function(g){ var p = g.split(":"); Array.from(p[1]).forEach(function(c){ EMO[c] = p[0]; }); });
  var ICON_ONLY = {"✨":1,"🌟":1};
  var EMRE = /[\u{1F000}-\u{1FAFF}☀-➿⏰⏳⭐️‍]+/u;
  function svgOf(name, cls){
    var sp = document.createElement("span"); sp.className = "sc-ie";
    sp.innerHTML = '<svg class="sc-ic" viewBox="0 0 24 24" fill="none" aria-hidden="true">' + IC[name] + '</svg>';
    return sp;
  }
  function swapNode(tn){
    var t = tn.nodeValue; if(!t || !EMRE.test(t)) return;
    var par = tn.parentNode; if(!par || par.closest && par.closest("#view-letters,.lt-em,.nm-stars,script,style,textarea")) return;
    var inIcon = par.closest && par.closest(".choice-icon,.lib-em,.adk-e,.adk-hero-e");
    var out = [], buf = "", changed = false;
    Array.from(t).forEach(function(c){
      if(c === "️" || c === "‍"){ if(!changed || buf === "") { buf += c; } return; }
      var nm = EMO[c];
      if(nm && (!ICON_ONLY[c] || inIcon)){ if(buf) out.push(buf); buf = ""; out.push(svgOf(nm)); changed = true; }
      else buf += c;
    });
    if(!changed) return;
    if(buf) out.push(buf);
    var frag = document.createDocumentFragment();
    out.forEach(function(o){ frag.appendChild(typeof o === "string" ? document.createTextNode(o.replace(/️/g, "")) : o); });
    par.replaceChild(frag, tn);
  }
  function swapEmoji(root){
    if(!root) return;
    if(root.nodeType === 3){ swapNode(root); return; }
    if(root.nodeType !== 1 || (root.closest && root.closest("#view-letters,.sc-ie"))) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n, list = [];
    while((n = w.nextNode())) if(n.nodeValue && EMRE.test(n.nodeValue)) list.push(n);
    list.forEach(swapNode);
  }

  /* ---------- (2) قوائم الأبواب: شبكة بطاقات كبيرة ---------- */
  var HUBS = "#doorBody,#quizBody,#libBody .lib-secs,#noorBody";
  function digits(s){ return parseInt(String(s).replace(/[٠-٩]/g, function(d){ return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }), 10) || 0; }
  function badge(tile){
    if(tile.getAttribute("data-scb")) return; tile.setAttribute("data-scb","1");
    var c2 = tile.querySelector(".ct2"); if(!c2) return;
    var m = c2.textContent.match(/\s*[—–-]\s*([٠-٩0-9]+(?:\s*من\s*[٠-٩0-9]+)?(?:\s+[^\s—]+)?)\s*$/);
    if(!m) return;
    c2.textContent = c2.textContent.slice(0, m.index).trim();
    var b = document.createElement("span"); b.className = "sc-bd"; b.textContent = m[1];
    var pr = m[1].match(/([٠-٩0-9]+)\s*من\s*([٠-٩0-9]+)/);
    if(pr){ var i = document.createElement("i"), f = document.createElement("b"); f.style.setProperty("--p", Math.min(100, Math.round(100 * digits(pr[1]) / Math.max(1, digits(pr[2])))) + "%"); i.appendChild(f); b.appendChild(i); }
    (c2.parentNode || tile).appendChild(b);
  }
  function lampOf(lit){ var d = document.createElement("span"); d.className = "sc-lamp" + (lit ? " lit" : ""); d.setAttribute("aria-hidden","true"); d.innerHTML = '<svg class="sc-ic" viewBox="0 0 24 24" fill="none">' + IC.lamp + '</svg>'; return d; }
  function lamp(tile){
    if(tile.getAttribute("data-scl")) return; tile.setAttribute("data-scl","1");
    var c1 = tile.querySelector(".ct1"); var key = "t:" + (c1 ? c1.textContent.trim() : ""); if(key === "t:") return;
    var st = jget("sc_lamp_v1") || {}, locked = /\blocked\b/.test(tile.className);
    if(locked){ tile.appendChild(lampOf(false)); if(!st[key]){ st[key] = 1; try{ localStorage.setItem("sc_lamp_v1", JSON.stringify(st)); }catch(e){} } }
    else if(st[key] === 1){ tile.appendChild(lampOf(true)); st[key] = 2; try{ localStorage.setItem("sc_lamp_v1", JSON.stringify(st)); }catch(e){} }
  }
  function hubs(){
    var hs = document.querySelectorAll(HUBS);
    for(var i = 0; i < hs.length; i++){
      var h = hs[i], tiles = [];
      for(var j = 0; j < h.children.length; j++) if(h.children[j].classList.contains("choice-tile")) tiles.push(h.children[j]);
      var n = tiles.length;
      h.classList.toggle("sc-hub", n > 0); h.classList.toggle("g2", n >= 4); h.classList.toggle("g1", n > 0 && n < 4);
      tiles.forEach(function(t, k){ t.classList.toggle("sc-wide", n >= 4 && n % 2 === 1 && k === n - 1); badge(t); lamp(t); });
    }
  }
  /* ---------- (1) تلميح الرمز الافتراضي داخل لوحة ولي الأمر فقط ---------- */
  function pinHint(){
    var inp = $("newPinInput"); if(!inp || document.getElementById("scPinHint")) return;
    var st = jget("athar_quran_settings_v1"), def = !st || !st.pin || st.pin === "0000";
    var p = document.createElement("p"); p.id = "scPinHint"; p.className = "sc-pinhint";
    p.textContent = def ? "الرمز الحالي هو الرمز الافتراضي «0000». غيّره الآن ليبقى سرًّا." : "تم تغيير الرمز السري. اكتب رمزًا جديدًا من 4 أرقام لتغييره.";
    var row = inp.parentNode; row.parentNode.insertBefore(p, row);
  }

  /* ---------- مزامنة الشاشة ---------- */
  function centerSeg(){
    var v = document.querySelector(".view.active"); if(!v) return;
    var seg = v.querySelector(".seg"), a = seg && seg.querySelector(".seg-btn.active");
    if(!a || seg.scrollWidth <= seg.clientWidth + 2) return;
    var ar = a.getBoundingClientRect(), sr = seg.getBoundingClientRect();
    seg.scrollLeft += (ar.left + ar.width / 2) - (sr.left + sr.width / 2);
  }
  var lastId = "";
  function sync(){
    var a = document.querySelector(".view.active"), id = a ? a.id : "";
    var sub = id && id !== "view-home" && id !== "view-surah";
    de.classList.toggle("sc-sub", !!sub);
    de.setAttribute("data-sv", id);
    if(id !== lastId){ lastId = id; if(a){ swapEmoji(a); toneAll(a); hubs(); stagger(a); labelInputs(a); } }
    if(id === "view-dashboard") pinHint();
    centerSeg(); qProgress();
  }
  function init(){
    de.classList.add("sc-on");
    buildTitles(); swapEmoji(document.querySelector("main")); toneAll(document.body); labelInputs(document.body); sync();
    var main = document.querySelector("main");
    if(main){
      try{
        new MutationObserver(function(muts){
          for(var i = 0; i < muts.length; i++){
            var m = muts[i];
            if(m.type === "childList"){
              for(var j = 0; j < m.addedNodes.length; j++){
                var n = m.addedNodes[j]; if(n.nodeType !== 1) continue;
                swapEmoji(n); toneAll(n); stagger(n); winCheck(n); labelInputs(n);
              }
            }
          }
          hubs(); sync();
        }).observe(main,{attributes:true,attributeFilter:["class"],childList:true,subtree:true});
      }catch(e){}
    }
    try{ window.addEventListener("storage", qProgress); }catch(e){}
    document.addEventListener("touchstart", function(){}, {passive:true});
    var SEL = ".lq-say,.pill-btn,.mini-btn,.start-btn,.seg-btn,.letter-tile,.adk-tile,.adk-opt,.choice-tile,.ps-card,.us-chip,.us-lan,.lt-h,.nm-chip,.surah-card,.back-btn,.gear-btn,.pin-key,.ayq-stage,.ayq-opt,.ayah-pick-chip,.lib-book,.rep-b,.sheet-x";
    document.addEventListener("pointerup", function(e){
      var el = e.target && e.target.closest ? e.target.closest(SEL) : null;
      if(!el || el.disabled) return;
      el.classList.remove("sc-pop"); void el.offsetWidth; el.classList.add("sc-pop");
      setTimeout(function(){ el.classList.remove("sc-pop"); }, 460);
    }, true);
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
