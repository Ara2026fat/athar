/* nav.js — زر/إيماءة الرجوع في المتصفح تُغلق ما فوق الصفحة الأولى بدل الخروج من التطبيق.
   مشترك بين الرئيسية والوادي. لا يعيد كتابة منطق الشاشات: يراقب فقط ما يظهر ويضغط أزرار الرجوع الموجودة.
   قاعدة: عند أول مستوى داخلي (شاشة/نافذة/درس) ندفع مدخل history واحدًا؛ كل Back يقشر طبقة واحدة،
   وإن بقيت طبقات أخرى نعيد الدفع. في الشاشة الأولى لا مدخل زائد، فيخرج Back خروجًا عاديًا. */
(function () {
  "use strict";
  var D = document, W = window, H = W.history;
  if (!H || !H.pushState || W.__atharNav) return;
  W.__atharNav = 1;
  var isValley = !!D.getElementById("scene") && !!D.getElementById("panel");

  function $(s) { try { return D.querySelector(s); } catch (e) { return null; } }
  function vis(e) { if (!e) return false; var r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden"; }

  var cfg;
  if (isValley) {
    var OV = ["intro", "valley", "daily", "nextup", "parent", "settings"];
    cfg = {
      overlay: function () { for (var i = 0; i < OV.length; i++) { var e = D.getElementById(OV[i]); if (e && e.classList.contains("on")) return e; } return null; },
      closeOverlay: function (e) {
        var b = e.querySelector("#sClose,.pbtn.ghost,.pclose,.x,[data-close]");
        if (b && vis(b)) { b.click(); if (!e.classList.contains("on")) return; }
        e.classList.remove("on");
      },
      inner: function () { var a = D.getElementById("app"); return !!(a && a.classList.contains("instage")); },
      back: function () { var v = D.getElementById("vhome"); if (v) v.click(); }
    };
  } else {
    cfg = {
      overlay: function () {
        var s = D.getElementById("sheet"); if (s && s.classList.contains("show")) return s;
        var r = D.getElementById("rwSheet"); if (r && r.classList.contains("on")) return r;
        return null;
      },
      closeOverlay: function (e) { var b = e.querySelector("#sheetX,.rw-x"); if (b) b.click(); else e.classList.remove("show", "on"); },
      inner: function () { var a = $(".view.active"); return !!(a && a.id !== "view-home"); },
      back: function () {
        var a = $(".view.active"); if (!a) return;
        var b = a.querySelector(".back-btn,#btnBackHome,#btnPinBack,#btnPacksBack,#btnDashBack,[data-go='home']");
        if (b) b.click();
        else { var g = D.querySelector("[data-go='home']"); if (g) g.click(); }
      }
    };
  }

  var pushed = false, ign = 0;
  function level() { return (cfg.overlay() || cfg.inner()) ? 1 : 0; }
  function sync() {
    var l = level();
    if (l && !pushed) { try { H.pushState({ athar: 1 }, "", W.location.href); pushed = true; } catch (e) {} }
    else if (!l && pushed) {
      pushed = false; ign++;
      try { H.back(); } catch (e) { ign--; }
      setTimeout(function () { if (ign > 0) ign--; }, 700);
    }
  }
  W.addEventListener("popstate", function () {
    if (ign > 0) { ign--; return; }
    if (!pushed) return;
    pushed = false;
    try {
      var o = cfg.overlay();
      if (o) cfg.closeOverlay(o); else if (cfg.inner()) cfg.back();
    } catch (e) {}
    setTimeout(sync, 0);
  });

  var t = 0;
  function later() { clearTimeout(t); t = setTimeout(sync, 30); }
  var mo = new MutationObserver(later);
  function watch() {
    var cls = { attributes: true, attributeFilter: ["class"] };
    if (isValley) {
      var a = D.getElementById("app"); if (a) mo.observe(a, cls);
      ["intro", "valley", "daily", "nextup", "parent", "settings"].forEach(function (id) { var e = D.getElementById(id); if (e) mo.observe(e, cls); });
    } else {
      [].forEach.call(D.querySelectorAll(".view"), function (v) { mo.observe(v, cls); });
      var s = D.getElementById("sheet"); if (s) mo.observe(s, cls);
      /* نافذة المقتنيات تُنشأ عند أول فتح */
      new MutationObserver(function () {
        var r = D.getElementById("rwSheet");
        if (r && !r.__nv) { r.__nv = 1; mo.observe(r, cls); later(); }
      }).observe(D.body, { childList: true });
    }
    try { if (H.state && H.state.athar) H.replaceState(null, "", W.location.href); } catch (e) {}
    later();
  }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", watch); else watch();
})();
