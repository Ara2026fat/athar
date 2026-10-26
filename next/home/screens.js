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
  var W = [255,255,255], INK = [29,21,48], K = [0,0,0];
  function tone(el){
    if(el.getAttribute("data-sc")) return;
    el.setAttribute("data-sc","1");
    if(/\b(locked|lock)\b/.test(el.className)) return;
    var names = el.style.getPropertyValue("--c") ? ["--c"] : (el.style.getPropertyValue("--a") ? ["--a","--b"] : []);
    var cols = [];
    names.forEach(function(n){ var c = parse(el.style.getPropertyValue(n)); if(c) cols.push([n, c]); });
    if(!cols.length) return;
    if(cols.every(function(x){ return cr(W, mix(x[1], W, .1)) >= 5; })){ el.classList.add("sc-w"); return; }
    if(cols.every(function(x){ return cr(INK, mix(x[1], K, .08)) >= 5; })){ el.classList.add("sc-i"); return; }
    cols.forEach(function(x){
      var k = x[1];
      for(var i = 0; i < 14 && cr(W, mix(k, W, .1)) < 5; i++) k = mix(k, K, .07);
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
    if(id !== lastId){ lastId = id; if(a){ toneAll(a); stagger(a); labelInputs(a); } }
    centerSeg(); qProgress();
  }
  function init(){
    de.classList.add("sc-on");
    buildTitles(); toneAll(document.body); labelInputs(document.body); sync();
    var main = document.querySelector("main");
    if(main){
      try{
        new MutationObserver(function(muts){
          for(var i = 0; i < muts.length; i++){
            var m = muts[i];
            if(m.type === "childList"){
              for(var j = 0; j < m.addedNodes.length; j++){
                var n = m.addedNodes[j]; if(n.nodeType !== 1) continue;
                toneAll(n); stagger(n); winCheck(n); labelInputs(n);
              }
            }
          }
          sync();
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
