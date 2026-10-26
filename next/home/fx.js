/* مؤثرات صوت ولمس الرئيسية (E). نبضات منفردة قصيرة، بلا ألحان. تُفعَّل بعد أول لمسة، وتصمت مع أي تلاوة/صوت/نطق/نوم. */
(function () {
  "use strict";
  var W = window, D = document, KEY = "athar_quran_settings_v1";
  var ctx = null, noise = null, armed = false, last = 0, openAt = 0, media = [];
  var AC = W.AudioContext || W.webkitAudioContext;
  /* تتبّع كل عناصر الصوت/الفيديو بما فيها new Audio() */
  try {
    var P = W.HTMLMediaElement && HTMLMediaElement.prototype, op = P && P.play;
    if (op) P.play = function () {
      if (media.indexOf(this) < 0) media.push(this);
      return op.apply(this, arguments);
    };
  } catch (e) {}
  function settings() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function busy() {
    var i, m;
    for (i = media.length - 1; i >= 0; i--) { m = media[i]; if (!m.paused && !m.ended && !m.error && m.networkState !== 3) return true; }
    try { var s = W.speechSynthesis; if (s && (s.speaking || s.pending)) return true; } catch (e) {}
    var a = D.getElementsByTagName("audio");
    for (i = 0; i < a.length; i++) if (!a[i].paused && !a[i].ended) return true;
    return false;
  }
  function quiet() {
    if (!armed || !ctx || D.hidden) return true;
    var s = settings();
    if (s.sfx === false || s.bedtime || (D.body && D.body.classList.contains("bedtime"))) return true;
    return busy();
  }
  function buzz(ms) {
    if (quiet()) return;
    try { if (navigator.vibrate) navigator.vibrate(Math.min(12, ms || 10)); } catch (e) {}
  }
  function arm() {
    armed = true;
    if (!AC) return;
    try {
      if (!ctx) ctx = new AC();
      if (ctx.state === "suspended" && ctx.resume) ctx.resume();
    } catch (e) { ctx = null; }
  }
  function gate() {
    if (quiet()) return false;
    var n = Date.now(); if (n - last < 70) return false; last = n; return true;
  }
  /* نبضة: مذبذب بتردد ثابت أو منزلق، غلاف أسّي ناعم */
  function pulse(type, f0, f1, dur, vol, t0) {
    var t = ctx.currentTime + (t0 || 0), o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    lp.type = "lowpass"; lp.frequency.value = 1800;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(lp); lp.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + dur + 0.03);
  }
  /* نفحة ضجيج مفلترة (هسهسة حبل/باب) */
  function puff(f0, f1, dur, vol, t0) {
    if (!noise) {
      noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.4), ctx.sampleRate);
      var d = noise.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    var t = ctx.currentTime + (t0 || 0), s = ctx.createBufferSource(), b = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noise; b.type = "bandpass"; b.Q.value = 1.2;
    b.frequency.setValueAtTime(f0, t); b.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(b); b.connect(g); g.connect(ctx.destination);
    s.start(t); s.stop(t + dur + 0.03);
  }
  var FX = {
    knock: function () { pulse("triangle", 190, 105, 0.09, 0.13); puff(900, 500, 0.04, 0.03); },
    open: function () { puff(380, 950, 0.22, 0.05); pulse("triangle", 150, 95, 0.12, 0.1, 0.05); },
    step: function () { pulse("triangle", 125, 80, 0.06, 0.06); },
    lantern: function () { pulse("sine", 440, 440, 0.34, 0.05); puff(700, 1500, 0.2, 0.025); },
    dot: function () { pulse("sine", 988, 988, 0.15, 0.04); },
    rope: function () { puff(320, 620, 0.22, 0.045); },
    color: function () { pulse("sine", 720, 520, 0.09, 0.05); }
  };
  function play(n) {
    if (!gate()) return;
    try { FX[n](); } catch (e) {}
  }

  /* ---- ربط الصفحة ---- */
  ["pointerdown", "keydown"].forEach(function (n) { D.addEventListener(n, arm, { capture: true, passive: true }); });

  function doorOpen() {
    var n = Date.now(); if (n - openAt < 800) return; openAt = n;
    play("open"); buzz(10);
  }
  function init() {

    /* نقر الباب */
    D.addEventListener("pointerdown", function (e) {
      var t = e.target, b = t && t.closest ? t.closest(".wb") : null;
      if (b) {
        var w = b.closest(".w-first");
        if (!w) play("knock");
        return;
      }
      if (t && t.closest) {
        if (t.closest("#wDusk")) { play("lantern"); buzz(8); }
        else if (t.closest("#wPal .sw")) play("color");
      }
    }, true);
    /* خطوات أثر وفتح الباب: مراقبة class على أثر */
    var ath = D.getElementById("wAthar"), view = D.getElementById("view-home");
    if (ath && W.MutationObserver) {
      var was = false;
      new MutationObserver(function () {
        var w = ath.classList.contains("walk");
        if (w && !was) { setTimeout(function () { play("step"); }, 60); setTimeout(function () { play("step"); }, 330); }
        else if (!w && was && view && view.classList.contains("active")) doorOpen();
        was = w;
      }).observe(ath, { attributes: true, attributeFilter: ["class"] });
    }
    /* مسار احتياطي (تقليل الحركة): مغادرة الرئيسية = دخول باب */
    if (view && W.MutationObserver) {
      var act = view.classList.contains("active");
      new MutationObserver(function () {
        var a = view.classList.contains("active");
        if (act && !a) doorOpen();
        act = a;
      }).observe(view, { attributes: true, attributeFilter: ["class"] });
    }
    /* السماء */
    var AS = W.AtharSky = W.AtharSky || {}, prev = typeof AS.onTap === "function" ? AS.onTap : null;
    AS.onTap = function (kind, info) {
      if (prev) { try { prev(kind, info); } catch (e) {} }
      if (kind === "dot") play("dot");
      else if (kind === "lantern") play("rope");
    };
  }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", init); else init();
  W.AtharFX = { play: play, quiet: quiet, _m: function () { return media.map(function (m) { return [m.src, m.paused, m.ended, m.readyState, m.networkState, !!m.error]; }); } };
})();
