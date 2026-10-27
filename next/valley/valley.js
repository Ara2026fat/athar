/* ═══ أثر · الوادي — تحسينات r2 (وحدة إضافية بعد r3) ═══
   لا تمسّ Blocks/ATHAR_DATA/AtharAudio.say. كلّها أغلفة خلف علَم: ?vx=0 يطفئ كل شيء. */
(function () {
"use strict";
if (/[?&]vx=0/.test(location.search)) return;
var W = window.World, A = window.App;
if (!W || !A || !document.getElementById("scene")) return;
var NS = "http://www.w3.org/2000/svg";
var $ = function (id) { return document.getElementById(id); };
var app = $("app"), scene = $("scene"), say = $("say"), panel = $("panel");
var reduce = false; try { reduce = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
function S() { return window.State || null; }
function svgEl(tag, at, parent, before) {
  var e = document.createElementNS(NS, tag);
  for (var k in at) e.setAttribute(k, at[k]);
  if (parent) { if (before) parent.insertBefore(e, before); else parent.appendChild(e); }
  return e;
}
function appRect() { return app.getBoundingClientRect(); }
function rel(r, a) { return { l: r.left - a.left, t: r.top - a.top, r: r.right - a.left, b: r.bottom - a.top }; }
function haloRect(h, a) {
  var m = h.getScreenCTM(), cx = +h.getAttribute("cx"), cy = +h.getAttribute("cy"), r = +h.getAttribute("r"), k = m ? m.a : 1;
  var x = m.a * cx + m.c * cy + m.e - a.left, y = m.b * cx + m.d * cy + m.f - a.top;
  return { l: x - r * k, t: y - r * k, r: x + r * k, b: y + r * k };
}
function ov(p, q) { var w = Math.min(p.r, q.r) - Math.max(p.l, q.l), h = Math.min(p.b, q.b) - Math.max(p.t, q.t); return (w > 0 && h > 0) ? w * h : 0; }
var L = 90, VB0 = [0, 0, 400, 720], VBM = [0, -L, 400, 720 + L], vb = VBM.slice(), tw = 0;
["sky1", "skyD", "sky2", "sky3", "night", "tint"].forEach(function (id) {
  var r = $(id); if (r) { r.setAttribute("y", -L); r.setAttribute("height", 720 + L); }
});
(function () { var v = scene.querySelector('rect[fill="url(#vg)"]'); if (v) { v.setAttribute("y", -L); v.setAttribute("height", 720 + L); } })();
function setVB(v) { vb = v; scene.setAttribute("viewBox", v.map(function (x) { return +x.toFixed(2); }).join(" ")); }
function vbDone() { try { dispatchEvent(new Event("resize")); } catch (e) {} }
function tweenVB(to, ms) {
  cancelAnimationFrame(tw);
  var from = vb.slice(), same = from.every(function (a, i) { return Math.abs(a - to[i]) < .01; });
  if (same) return;
  if (reduce || !ms) { setVB(to.slice()); vbDone(); return; }
  var t0 = performance.now();
  (function f(t) {
    var k = Math.min(1, (t - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    setVB(from.map(function (a, i) { return a + (to[i] - a) * e; }));
    if (k < 1) tw = requestAnimationFrame(f); else vbDone();
  })(t0);
}
setVB(VBM);
$("night").style.pointerEvents = "none";
var defs = scene.querySelector("defs");
defs.insertAdjacentHTML("beforeend",
  '<linearGradient id="vxHzG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" id="vxH0" stop-color="#fff" stop-opacity="0"/><stop offset=".55" id="vxH1" stop-color="#fff" stop-opacity=".5"/><stop offset="1" id="vxH2" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
  '<radialGradient id="vxLanG"><stop offset="0" stop-color="#FFF1BC" stop-opacity=".95"/><stop offset=".4" stop-color="#FFC95E" stop-opacity=".5"/><stop offset="1" stop-color="#FFB040" stop-opacity="0"/></radialGradient>' +
  '<linearGradient id="vxRoad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EBD8A6"/><stop offset="1" stop-color="#D8B97A"/></linearGradient>' +
  '<linearGradient id="vxHill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B6E27A"/><stop offset="1" stop-color="#6DB550"/></linearGradient>');
var sky = svgEl("g", { id: "vxSky", "pointer-events": "none" }, scene, $("clouds"));
var hz = svgEl("rect", { id: "vxHz", x: -100, y: 150, width: 600, height: 250, fill: "url(#vxHzG)" }, sky);
var CP = "M-70 16C-92 16-92-10-66-10C-66-34-26-42-12-22C0-46 46-40 48-14C74-22 90 16 62 16Z";
[[66, 1.0, 150, 0], [112, .78, 190, -70], [158, 1.1, 130, -40], [204, .7, 170, -120], [92, .6, 210, -20], [236, .62, 160, -90]].forEach(function (c) {
  var o = svgEl("g", { "class": "vxc", style: "--d:" + c[2] + "s;--dl:" + c[3] + "s" }, sky);
  var g = svgEl("g", { transform: "translate(0 " + c[0] + ") scale(" + c[1] + ")", opacity: ".93" }, o);
  svgEl("path", { "class": "vxcs", d: CP, transform: "translate(0 6)" }, g);
  svgEl("path", { "class": "vxcl", d: CP }, g);
  svgEl("path", { "class": "vxco", d: CP }, g);
  svgEl("path", { d: "M-44-6C-40-18-28-22-20-16", fill: "none", stroke: "#fff", "stroke-width": 3.2, "stroke-linecap": "round", opacity: ".7" }, g);
});
var HZP = [[0, "#5B6FB8", .32], [5, "#FFA98A", .55], [7, "#FFE2A8", .42], [11, "#FFF6D8", .3], [15, "#FFDCA0", .42], [17, "#FF9D5C", .6], [19, "#7D6FB5", .45], [21, "#4B5FA6", .38], [24, "#5B6FB8", .32]];
function hex(c) { return [1, 3, 5].map(function (i) { return parseInt(c.substr(i, 2), 16); }); }
function horizon() {
  var d = new Date(), h = d.getHours() + d.getMinutes() / 60, i = 0;
  while (i < HZP.length - 2 && h >= HZP[i + 1][0]) i++;
  var a = HZP[i], b = HZP[i + 1], k = (h - a[0]) / (b[0] - a[0]), ca = hex(a[1]), cb = hex(b[1]);
  var c = "rgb(" + ca.map(function (x, j) { return Math.round(x + (cb[j] - x) * k); }).join(",") + ")", o = a[2] + (b[2] - a[2]) * k;
  ["vxH0", "vxH1", "vxH2"].forEach(function (id, j) { var s = $(id); s.setAttribute("stop-color", c); s.setAttribute("stop-opacity", j === 1 ? o.toFixed(2) : 0); });
}
horizon(); setInterval(horizon, 60000);
(function () {
  function place(n) { return scene.querySelector('.place[data-place="' + n + '"]'); }
  function wipe(g) { [].slice.call(g.children).forEach(function (c) { if (!(c.classList && c.classList.contains("halo"))) c.style.display = "none"; }); }
  function halo(g, x, y, r) { var h = g.querySelector(".halo"); if (h) { h.setAttribute("cx", x); h.setAttribute("cy", y); h.setAttribute("r", r); } }
  var STK = 'stroke="#4A3626" stroke-opacity=".78" stroke-linejoin="round" stroke-linecap="round"';
  var hill = place("hill"), home = place("home"), road = place("road");
  if (hill) {
    wipe(hill); halo(hill, 218, 366, 44);
    hill.insertAdjacentHTML("beforeend", '<g class="vxart">' +
      '<ellipse cx="218" cy="394" rx="80" ry="9" fill="#3F6B28" opacity=".25"/>' +
      '<path d="M138 394C150 352 184 326 218 326C252 326 286 352 298 394Z" fill="url(#vxHill)" stroke-width="2.6" ' + STK + '/>' +
      '<path d="M158 372C174 350 196 340 218 340" fill="none" stroke="#E4F7BC" stroke-width="3.4" stroke-linecap="round" opacity=".8"/>' +
      '<path d="M200 392C208 378 220 372 236 372" fill="none" stroke="#5FA349" stroke-width="2.6" stroke-linecap="round" opacity=".55"/>' +
      '<g fill="#4E9E63" stroke="#3E6B2E" stroke-width="1.5" stroke-linejoin="round"><path d="M170 386c0-12 5-19 5-19s5 7 5 19z"/><path d="M262 384c0-10 4-16 4-16s4 6 4 16z"/></g>' +
      '<circle cx="190" cy="378" r="3.4" fill="#F5A0B5"/><circle cx="246" cy="350" r="3.2" fill="#FBC8D6"/></g>');
    if (home && home.parentNode) home.parentNode.insertBefore(hill, home);
  }
  if (road) {
    wipe(road); halo(road, 330, 606, 46);
    road.insertAdjacentHTML("beforeend", '<g class="vxart">' +
      '<path d="M236 720C254 650 322 614 314 548C309 500 294 452 302 416Q312 402 322 416C314 454 332 498 340 548C352 612 306 656 340 720Z" fill="url(#vxRoad)" stroke-width="2.6" ' + STK + '/>' +
      '<path d="M282 720C296 658 326 628 320 560C316 508 304 462 310 418" fill="none" stroke="#FBEFCB" stroke-width="9" opacity=".55" stroke-linecap="round"/>' +
      '<g fill="#BFA16C" stroke="#7A5C32" stroke-width="1.2"><ellipse cx="292" cy="690" rx="5" ry="3"/><ellipse cx="318" cy="652" rx="4" ry="2.6"/><ellipse cx="304" cy="588" rx="3.4" ry="2.2"/><ellipse cx="322" cy="520" rx="2.6" ry="1.8"/></g>' +
      '<ellipse cx="364" cy="626" rx="18" ry="4" fill="#3F6B28" opacity=".3"/>' +
      '<rect x="360" y="580" width="8" height="46" rx="2" fill="#9A6A3C" stroke-width="2" ' + STK + '/>' +
      '<path d="M334 572h44l10 10-10 10h-44z" fill="#E7A650" stroke-width="2.2" ' + STK + '/>' +
      '<path d="M340 580h34M340 586h26" stroke="#B87A2E" stroke-width="2" stroke-linecap="round" opacity=".8"/></g>');
  }
})();
["mSunUp", "mSunrise", "mDawn", "mGlow"].forEach(function (id) {
  var g = $(id); if (!g) return;
  [].slice.call(g.children).forEach(function (c) {
    if (c.tagName === "circle" && /lampG/.test(c.getAttribute("fill") || "")) { c.setAttribute("r", (+c.getAttribute("r") * 1.25).toFixed(1)); c.setAttribute("opacity", ".85"); }
    else if (!(c.classList && c.classList.contains("star"))) c.style.display = "none";
  });
});
(function () {
  var bc = $("mBeacon"); if (bc) bc.setAttribute("transform", "translate(158 -26)");
  var fh = $("fr_hill");
  if (fh) {
    var lock = false, want = "translate(241 293) scale(.7)";
    var fix = function () { if (lock || app.classList.contains("instage")) return; if (fh.getAttribute("transform") !== want) { lock = true; fh.setAttribute("transform", want); lock = false; } };
    try { new MutationObserver(fix).observe(fh, { attributes: true, attributeFilter: ["transform"] }); } catch (e) {}
    fix();
  }
})();
var ath = $("athar"), boy = $("boy"), vxJ = null, lan = null, hit = null, liftT = 0;
var AS = .96;   /* حجم أثر على الخريطة (الأصل .78) */
function bigger() {
  var t = (ath.getAttribute("transform") || "").match(/translate\(\s*(-?[\d.]+)[ ,]+(-?[\d.]+)\s*\)\s*scale\(\s*([\d.]+)/);
  if (!t || Math.abs(+t[3] - AS) < .001 || app.classList.contains("instage")) return;
  var d = +t[3] - AS;
  ath.setAttribute("transform", "translate(" + (+t[1] + 30 * d).toFixed(1) + " " + (+t[2] + 152 * d).toFixed(1) + ") scale(" + AS + ")");
}
if (ath && boy) {
  svgEl("ellipse", { cx: 30, cy: 150, rx: 36, ry: 8, fill: "#24401A", opacity: ".26", filter: "url(#sf)", "pointer-events": "none" }, ath, boy);
  svgEl("ellipse", { cx: 30, cy: 151, rx: 21, ry: 4.4, fill: "#1B3012", opacity: ".55", "pointer-events": "none" }, ath, boy);
  vxJ = svgEl("g", { id: "vxJ" }, ath, boy);
  vxJ.style.transformOrigin = "30px 152px";
  vxJ.appendChild(boy);
  lan = svgEl("circle", { "class": "vxLan", cx: 7, cy: 80, r: 27, fill: "url(#vxLanG)", "pointer-events": "none" }, vxJ);
  hit = svgEl("rect", { id: "vxHit", x: -17, y: -22, width: 94, height: 174, fill: "transparent", "pointer-events": "all" }, ath);
  var syncLan = function () {
    var f = $("boyImg"), g = $("boyImg2"), cur = (g && g.style.opacity === "1") ? g : f;
    var idle = /idle\.webp/.test((cur && cur.getAttribute("href")) || "");
    lan.style.display = idle ? "" : "none";
  };
  try { var mo = new MutationObserver(syncLan); ["boyImg", "boyImg2"].forEach(function (id) { mo.observe($(id), { attributes: true, attributeFilter: ["href", "style"] }); }); syncLan(); } catch (e) {}
}
function hop(n, h, ms) {
  if (!vxJ || reduce || !vxJ.animate) return;
  var kf = [], i; for (i = 0; i <= n * 2; i++) kf.push({ transform: "translateY(" + (i % 2 ? -h : 0) + "px)", offset: i / (n * 2) });
  try { vxJ.animate(kf, { duration: ms, easing: "ease-in-out" }); } catch (e) {}
}
function jump() {
  if (!vxJ || reduce || !vxJ.animate) return;
  try { vxJ.animate([
    { transform: "scale(1.07,.9)", offset: 0 }, { transform: "translateY(-20px) scale(.95,1.07)", offset: .38 },
    { transform: "translateY(0) scale(1.05,.94)", offset: .72 }, { transform: "scale(1,1)", offset: 1 }
  ], { duration: 640, easing: "cubic-bezier(.3,.7,.4,1)" }); } catch (e) {}
}
if (hit) hit.addEventListener("click", function () {
  if (app.classList.contains("instage") || panel.classList.contains("up")) return;
  try { window.AtharAudio.sfx("tap"); } catch (e) {}
  jump();
  if (lan) { lan.classList.remove("boost"); void lan.getBoundingClientRect(); lan.classList.add("boost"); }
  try { W.face("wow"); } catch (e) {}
  clearTimeout(liftT); liftT = setTimeout(function () { try { W.face("idle"); } catch (e) {} }, 1500);
});
var mv0 = W.moveTo;
W.moveTo = function (place) {
  var before = ath.getAttribute("transform"), r = mv0.apply(this, arguments);
  bigger();
  if (ath.getAttribute("transform") !== before) { ath.style.transition = "transform .72s cubic-bezier(.45,.05,.3,1)"; hop(3, 7, 720); }
  return r;
};
var tailT = null;
function atharRect() {
  var t = (ath.getAttribute("transform") || "").match(/translate\(\s*(-?[\d.]+)[ ,]+(-?[\d.]+)\s*\)\s*scale\(\s*(-?[\d.]+)/), m = scene.getScreenCTM(), a = appRect();
  if (!t || !m) return null;
  var x = +t[1], y = +t[2], s = +t[3];
  return { l: m.a * (x - 17 * s) + m.e - a.left, t: m.d * (y - 22 * s) + m.f - a.top, r: m.a * (x + 77 * s) + m.e - a.left, b: m.d * (y + 152 * s) + m.f - a.top };
}
function topBtns(a) {
  var o = [];
  ["vhome", "myv", "sett", "snd"].forEach(function (id) { var e = $(id); if (e && e.offsetParent) o.push(rel(e.getBoundingClientRect(), a)); });
  return o;
}
function friendRects(a) {
  var o = [];
  [].slice.call(scene.querySelectorAll('[id^="fr_"],#mFriend')).forEach(function (g) {
    if (g.getAttribute("opacity") !== "1" || g.style.display === "none") return;
    var im = g.querySelector("image"); if (im && im.getAttribute("href")) o.push(rel(im.getBoundingClientRect(), a));
  });
  return o;
}
function placeSay() {
  var a = appRect(), AW = a.width, AH = a.height, ar = atharRect(); if (!ar) return;
  var obst = [{ r: ar, w: 4 }];
  topBtns(a).forEach(function (r) { obst.push({ r: r, w: 4 }); });
  friendRects(a).forEach(function (r) { obst.push({ r: r, w: 6 }); });
  [].slice.call($("labels").querySelectorAll(".plabel:not(.sleep)")).forEach(function (e) { obst.push({ r: rel(e.getBoundingClientRect(), a), w: 2 }); });
  [].slice.call(scene.querySelectorAll(".place.ready .halo")).forEach(function (h) { if (!app.classList.contains("instage")) { var r = haloRect(h, a); var cx = (r.l + r.r) / 2, cy = (r.t + r.b) / 2; obst.push({ r: { l: cx - 30, r: cx + 30, t: cy - 30, b: cy + 30 }, w: 2 }); } });
  var pc = panel.classList.contains("up") && panel.firstElementChild;
  if (pc) obst.push({ r: rel(pc.getBoundingClientRect(), a), w: 5 });
  var M = 10, TOP = 84, hx = (ar.l + ar.r) / 2, hy = ar.t + (ar.b - ar.t) * .2, bub = say.querySelector(".b");
  function meas(mw) { say.style.maxWidth = mw + "px"; say.style.left = "0px"; say.style.top = "0px"; return { w: bub.offsetWidth, h: bub.offsetHeight }; }
  var maxW = Math.min(300, AW - 2 * M);
  var C = [
    { s: "bottom", pen: 0,  mw: maxW, pos: function (z) { return [hx - z.w / 2, ar.t - z.h - 13]; } },
    { s: "left",   pen: 30, mw: Math.min(maxW, AW - M - (ar.r + 13)), pos: function (z) { return [ar.r + 13, hy - z.h / 2]; } },
    { s: "right",  pen: 30, mw: Math.min(maxW, ar.l - 13 - M), pos: function (z) { return [ar.l - 13 - z.w, hy - z.h / 2]; } },
    { s: "top",    pen: 90, mw: maxW, pos: function (z) { return [hx - z.w / 2, ar.b + 13]; } }
  ];
  [-1, 1].forEach(function (sg) { [0, 46, 92].forEach(function (up) {
    C.push({ s: "bottom", pen: 14 + up * .3, mw: maxW, pos: function (z) { return [hx - z.w / 2 + sg * Math.min(z.w / 2 - 26, 110), ar.t - z.h - 13 - up]; } });
  }); });
  [0, 46].forEach(function (up) { C.push({ s: "bottom", pen: 4 + up * .3, mw: maxW, pos: function (z) { return [hx - z.w / 2, ar.t - z.h - 13 - up]; } }); });
  var best = null;
  C.forEach(function (c) {
    if (c.mw < 130) return;
    var z = meas(c.mw), p = c.pos(z), x = Math.max(M, Math.min(AW - M - z.w, p[0])), y = Math.max(TOP, Math.min(AH - M - z.h, p[1]));
    var box = { l: x, t: y, r: x + z.w, b: y + z.h }, sc = c.pen + Math.abs(x - p[0]) * 1.5 + Math.abs(y - p[1]) * 1.5;
    obst.forEach(function (o) { sc += ov(box, o.r) * o.w / 40; });
    var okT = (c.s === "bottom" || c.s === "top") ? (hx >= x + 24 && hx <= x + z.w - 24) : (hy >= y + 16 && hy <= y + z.h - 16);
    if (!okT) sc += 1e5;   /* الذيل يجب أن يشير فعلًا إلى أثر */
    if (!best || sc < best.sc) best = { sc: sc, x: x, y: y, z: z, s: c.s };
  });
  if (!best) { var z0 = meas(maxW); best = { x: Math.max(M, Math.min(AW - M - z0.w, hx - z0.w / 2)), y: TOP, z: z0, s: "bottom" }; }
  var z = best.z; meas(Math.min(300, z.w + 2));
  say.style.left = best.x.toFixed(0) + "px"; say.style.top = best.y.toFixed(0) + "px";
  say.dataset.tail = best.s;
  var tp = Math.max(22, Math.min(z.w - 22, hx - best.x)), tq = Math.max(18, Math.min(z.h - 18, hy - best.y));
  bub.style.setProperty("--tp", tp.toFixed(0) + "px"); bub.style.setProperty("--tq", tq.toFixed(0) + "px");
  say.style.setProperty("--tox", tp.toFixed(0) + "px");
  say.style.setProperty("--toy", (best.s === "top" ? 0 : best.s === "bottom" ? z.h + 10 : tq) + "px");
}
try {
  var smo = new MutationObserver(function () { if (say.classList.contains("on")) { try { placeSay(); } catch (e) {} } });
  smo.observe(say, { attributes: true, attributeFilter: ["class"] });
  smo.observe(say.querySelector(".b"), { childList: true, characterData: true, subtree: true });
} catch (e) {}
var lab0 = A.labels;
function relayout() {
  var lay = $("labels"), a = appRect(), AW = a.width, AH = a.height, M = 8, TOP = 84;
  var nodes = [].slice.call(lay.querySelectorAll(".plabel"));
  var pls = (A.places || []).filter(function (p) { return scene.querySelector('.place[data-place="' + p.place + '"] .halo') && A.visible(p); });
  if (pls.length !== nodes.length) return;
  var ar = atharRect(), fixed = [];
  if (ar) fixed.push({ r: ar, w: 4 });
  topBtns(a).forEach(function (r) { fixed.push({ r: r, w: 4 }); });
  friendRects(a).forEach(function (r) { fixed.push({ r: r, w: 4 }); });
  var nxt = (A.places || []).find(function (p) { return A.nextAt(p); }), placed = [];
  var order = nodes.map(function (n, i) { return i; }).sort(function (i, j) { return (nodes[j].classList.contains("ready") ? 1 : 0) - (nodes[i].classList.contains("ready") ? 1 : 0); });
  order.forEach(function (i) {
    var n = nodes[i], p = pls[i], h = scene.querySelector('.place[data-place="' + p.place + '"] .halo'), hr = haloRect(h, a);
    var w = n.offsetWidth, ht = n.offsetHeight, hx = (hr.l + hr.r) / 2, hb = hr.b, htp = hr.t, hcy = (hr.t + hr.b) / 2;
    var tops = [hb + 4, hb + 30, hb + 58, htp - ht - 6, htp - ht - 34, hcy - ht / 2], lefts = [], k;
    [0, -60, 60, -120, 120, -170, 170].forEach(function (d) { lefts.push(hx - w / 2 + d); });
    lefts.push(hr.r + 6, hr.l - 6 - w);
    var best = null;
    tops.forEach(function (t0, ti) { lefts.forEach(function (l0, li) {
      var x = Math.max(M, Math.min(AW - M - w, l0)), y = Math.max(TOP, Math.min(AH - M - ht, t0)), box = { l: x, t: y, r: x + w, b: y + ht };
      var sc = Math.abs(x - (hx - w / 2)) * .25 + Math.abs(y - (hb + 4)) * .2 + Math.abs(x - l0) + Math.abs(y - t0);
      fixed.forEach(function (o) { sc += ov(box, o.r) * o.w / 20; });
      placed.forEach(function (o) { sc += ov(box, o) * 5 / 20; });
      if (!best || sc < best.sc) best = { sc: sc, x: x, y: y, box: box };
    }); });
    n.style.left = (best.x + w / 2).toFixed(1) + "px"; n.style.top = best.y.toFixed(1) + "px";
    n.dataset.place = p.place; placed.push(best.box);
    if (nxt && nxt.place === p.place && n.classList.contains("ready")) {
      n.classList.add("vx-rec");
      var ring = document.createElement("div"); ring.className = "vx-ring"; ring.style.left = hx + "px"; ring.style.top = hcy + "px";
      lay.insertBefore(ring, lay.firstChild);
    }
  });
}
A.labels = function () { var r = lab0.apply(this, arguments); try { relayout(); } catch (e) { } return r; };
var tidyT = 0;
function markRank() {
  var arr = []; try { arr = S().data.marks || []; } catch (e) {}
  var at = {}; try { at = S().data.actAt || {}; } catch (e) {}
  var t = {}; try { Object.keys(A.exps).forEach(function (id) { var e = A.exps[id]; if (e && e.leaves) t[e.leaves] = Math.max(t[e.leaves] || 0, at[id] || 0); }); } catch (e) {}
  return { idx: function (m) { return arr.lastIndexOf(m); }, t: t, n: arr.length };
}
function tidy() {
  var ids = Object.keys(window.MARKS || {}).filter(function (id) { return id !== "mFriend"; });
  var gs = ids.map($).filter(function (g) { return g && g.getAttribute("opacity") === "1"; });
  gs.forEach(function (g) { g.style.translate = ""; g.style.scale = ""; g.classList.remove("vx-sky", "vx-tidy", "vx-new"); });
  if (gs.length < 24 || app.classList.contains("instage")) return;
  var m = scene.getScreenCTM(), a = appRect(); if (!m) return;
  var k = m.a, AW = a.width, hor = m.d * 330 + m.f - a.top, n = gs.length, rk = markRank(), now = Date.now();
  var base = n >= 60 ? .6 : n >= 40 ? .72 : .86, newSet = {};
  gs.slice().sort(function (p, q) { return rk.idx(q.id) - rk.idx(p.id); }).slice(0, 4).forEach(function (g, i) {
    if (i < 3 || now - (rk.t[g.id] || 0) < 864e5) newSet[g.id] = 1;
  });
  var it = gs.map(function (g) {
    var r = rel(g.getBoundingClientRect(), a), w = r.r - r.l, h = r.b - r.t;
    return { g: g, r: r, w: w, h: h, cx: (r.l + r.r) / 2, cy: (r.t + r.b) / 2, isNew: !!newSet[g.id], sky: (r.t + r.b) / 2 < hor, dx: 0, dy: 0, sc: 1 };
  }).filter(function (o) { return o.w > 3 && o.w < 320 && o.h > 3; });
  it.forEach(function (o) {
    o.sc = o.isNew ? 1.12 : Math.min(base, 62 / Math.max(o.w, o.h, 1) * (n >= 40 ? 1 : 1.5));
    o.sc = Math.max(.45, Math.min(o.isNew ? 1.12 : base, o.sc)); if (o.g.hasAttribute("transform")) o.sc = 1;
    if (o.isNew) o.g.classList.add("vx-new"); if (o.sky) o.g.classList.add("vx-sky");
  });
  if (n >= 40) {
    var sky = it.filter(function (o) { return o.sky && !o.isNew; }).sort(function (p, q) { return p.cx - q.cx; });
    var cw = 58, cols = Math.max(3, Math.floor((AW - 24) / cw)), top = 96, rh = 56, rows = Math.ceil(sky.length / cols);
    var maxRows = Math.max(1, Math.floor((hor - 70 - top) / rh)); if (rows > maxRows) { rows = maxRows; }
    sky.forEach(function (o, i) {
      var r = Math.min(rows - 1, Math.floor(i / cols)), c = i % cols, inRow = Math.min(cols, sky.length - r * cols), x0 = (AW - inRow * cw) / 2;
      var tx = x0 + (c + .5) * cw, ty = top + r * rh + rh / 2;
      o.sc = Math.max(.4, Math.min(o.sc, 50 / Math.max(o.w, o.h, 1))); o.dx = tx - o.cx; o.dy = ty - o.cy; o.fixed = 1;
    });
  }
  var fx2 = []; var ar = atharRect(); if (ar) fx2.push(ar);
  friendRects(a).forEach(function (r) { fx2.push(r); });
  [].slice.call($("labels").querySelectorAll(".plabel:not(.sleep)")).forEach(function (e) { fx2.push(rel(e.getBoundingClientRect(), a)); });
  /* ميداليات الأماكن المفتوحة: العلامات لا تغطّيها */
  [].slice.call(scene.querySelectorAll(".place:not(.sleep) .vxmed circle:nth-of-type(1)")).forEach(function (e) {
    var r = rel(e.getBoundingClientRect(), a); if (r.r - r.l > 10) fx2.push({ l: r.l - 4, r: r.r + 4, t: r.t - 4, b: r.b + 4 });
  });
  var cap = 96 * k, i, j, pass;
  function box(o) { var w = o.w * o.sc / 2, h = o.h * o.sc / 2; return { l: o.cx + o.dx - w, r: o.cx + o.dx + w, t: o.cy + o.dy - h, b: o.cy + o.dy + h }; }
  for (pass = 0; pass < 60; pass++) {
    var moved = false;
    for (i = 0; i < it.length; i++) {
      var p = it[i]; if (p.fixed || p.isNew) continue;
      for (j = 0; j < fx2.length; j++) {
        var P = box(p), F = fx2[j], w = Math.min(P.r, F.r) - Math.max(P.l, F.l), h = Math.min(P.b, F.b) - Math.max(P.t, F.t);
        if (w <= 0 || h <= 0 || w * h < .15 * (P.r - P.l) * (P.b - P.t)) continue;
        moved = true;
        if (w < h) p.dx += ((P.l + P.r) < (F.l + F.r) ? -1 : 1) * (w + 2); else p.dy += ((P.t + P.b) < (F.t + F.b) ? -1 : 1) * (h + 2);
      }
    }
    for (i = 0; i < it.length; i++) for (j = i + 1; j < it.length; j++) {
      var p2 = it[i], q = it[j]; if ((p2.fixed && q.fixed)) continue;
      var A1 = box(p2), B1 = box(q), w2 = Math.min(A1.r, B1.r) - Math.max(A1.l, B1.l), h2 = Math.min(A1.b, B1.b) - Math.max(A1.t, B1.t);
      if (w2 <= 0 || h2 <= 0) continue;
      var small = Math.min((A1.r - A1.l) * (A1.b - A1.t), (B1.r - B1.l) * (B1.b - B1.t));
      if (w2 * h2 < small * .2) continue;
      moved = true;
      var wp = p2.fixed ? 0 : (q.fixed ? 1 : .5), wq = q.fixed ? 0 : (p2.fixed ? 1 : .5), pr = p2.isNew ? 0 : wp, qr = q.isNew ? 0 : wq;
      if (w2 < h2) { var s = ((A1.l + A1.r) < (B1.l + B1.r) ? -1 : 1) * (w2 + 1); p2.dx += s * pr; q.dx -= s * qr; }
      else { var s2 = ((A1.t + A1.b) < (B1.t + B1.b) ? -1 : 1) * (h2 + 1); p2.dy += s2 * pr; q.dy -= s2 * qr; }
    }
    it.forEach(function (o) {
      if (!o.fixed) { o.dx = Math.max(-cap, Math.min(cap, o.dx)); o.dy = Math.max(-cap, Math.min(cap, o.dy)); }
      var B = box(o); if (B.l < 6) o.dx += 6 - B.l; if (B.r > AW - 6) o.dx -= B.r - (AW - 6); if (B.t < 90) o.dy += 90 - B.t;
    });
    if (!moved) break;
  }
  it.forEach(function (o) {
    o.g.classList.add("vx-tidy"); o.g.style.transformOrigin = "center"; if (!o.g.hasAttribute("transform")) o.g.style.scale = String(+o.sc.toFixed(3));
    o.g.style.transformBox = "fill-box";
    if (Math.abs(o.dx) > 1 || Math.abs(o.dy) > 1) o.g.style.translate = (o.dx / k).toFixed(1) + "px " + (o.dy / k).toFixed(1) + "px";
  });
}
function tidyLater(ms) { clearTimeout(tidyT); tidyT = setTimeout(function () { try { tidy(); } catch (e) {} }, ms); }
var paint0 = A.paint;
A.paint = function () { var r = paint0.apply(this, arguments); tidyLater(1100); return r; };
var am0 = W.applyMarks;
W.applyMarks = function () { var r = am0.apply(this, arguments); tidyLater(300); return r; };
addEventListener("resize", function () { tidyLater(400); });
var fx = svgEl("g", { id: "vxFx", "pointer-events": "none" }, scene, $("night"));
var eff0 = W.effect;
W.effect = function (mark) {
  var r = eff0.apply(this, arguments);
  try { if (mark && app.classList.contains("instage")) popMark(mark); } catch (e) {}
  return r;
};
function cloneMark(g) {
  var c = g.cloneNode(true); c.removeAttribute("id"); c.setAttribute("opacity", "1"); c.style.animation = "none"; c.style.opacity = "1"; c.style.translate = ""; c.style.scale = ""; c.style.filter = "";
  [].slice.call(c.querySelectorAll("[id]")).forEach(function (n) { n.removeAttribute("id"); });
  c.setAttribute("class", ""); return c;
}
function popMark(mark) {
  var g = $(mark); if (!g || !g.animate) return;
  var m = scene.getScreenCTM(); if (!m) return;
  var bb = g.getBBox(), tm = null; try { var cs = g.transform.baseVal.consolidate(); tm = cs && cs.matrix; } catch (e) {}
  function ap(x, y) { return tm ? { x: tm.a * x + tm.c * y + tm.e, y: tm.b * x + tm.d * y + tm.f } : { x: x, y: y }; }
  var p1 = ap(bb.x, bb.y), p2 = ap(bb.x + bb.width, bb.y + bb.height), cx = (p1.x + p2.x) / 2, cy = (p1.y + p2.y) / 2, bw = Math.abs(p2.x - p1.x), bh = Math.abs(p2.y - p1.y);
  var s = Math.max(.9, Math.min(2.2, 84 / Math.max(10, bw, bh))), T = { x: vb[0] + vb[2] / 2, y: 232 };
  var wrap = svgEl("g", { opacity: "0" }, fx), use = cloneMark(g); wrap.appendChild(use);
  var halo = svgEl("circle", { cx: 0, cy: 0, r: 60, fill: "url(#vxLanG)" }, wrap, use);
  function tf(x, y, k) { return "translate(" + x + "px," + y + "px) scale(" + k + ") translate(" + (-cx) + "px," + (-cy) + "px)"; }
  try { halo.setAttribute("transform", "translate(" + cx + " " + cy + ")"); } catch (e) {}
  if (reduce) { wrap.style.transform = tf(T.x, T.y, s); wrap.setAttribute("opacity", "1"); setTimeout(function () { wrap.remove(); }, 2400); return; }
  var an = wrap.animate([
    { transform: tf(T.x, T.y + 22, .2), opacity: 0, offset: 0 },
    { transform: tf(T.x, T.y - 6, s * 1.15), opacity: 1, offset: .16 },
    { transform: tf(T.x, T.y, s), opacity: 1, offset: .26 },
    { transform: tf(T.x, T.y, s), opacity: 1, offset: .74 },
    { transform: tf(cx, cy, 1), opacity: 0, offset: 1 }
  ], { duration: 3000, easing: "ease-in-out", fill: "forwards" });
  an.onfinish = function () { wrap.remove(); };
}
var curPlace = null;
function soft() {
  night();
  var ph = 0; try { ph = (S().data.phase | 0); } catch (e) {}
  var on = app.classList.contains("instage") && ((curPlace === "masjid" && ph < 2) || (curPlace === "home" && ph === 1));
  if (on) { app.dataset.soft = "1"; scene.dataset.soft = "1"; } else { delete app.dataset.soft; delete scene.dataset.soft; }
}
var st0 = W.stage;
W.stage = function (pl) {
  var r = st0.apply(this, arguments);
  if (app.classList.contains("instage")) {
    curPlace = pl; tweenVB(VB0, 380); soft();
    ath.style.transition = "transform .75s cubic-bezier(.34,.02,.32,1.04)";
  }
  return r;
};
var un0 = W.unstage;
W.unstage = function () {
  var was = app.classList.contains("instage"), r = un0.apply(this, arguments);
  if (was) { tweenVB(VBM, 380); curPlace = null; soft(); tidyLater(600); }
  return r;
};
var ph0 = W.phase;
W.phase = function () { var r = ph0.apply(this, arguments); soft(); return r; };
var calmCk = 0;
function guard() {
  if (app.dataset.calm) return;
  var ck = ++calmCk, n = 0, t0 = 0;
  setTimeout(function () {
    function f(t) {
      if (ck !== calmCk || document.hidden || $("gate").offsetParent) return;
      if (!t0) t0 = t; n++;
      if (t - t0 < 2000) return requestAnimationFrame(f);
      if (n * 1000 / (t - t0) < 40) app.dataset.calm = "1";
    }
    requestAnimationFrame(f);
  }, 1200);
}
$("enter").addEventListener("click", function () { setTimeout(guard, 2500); });
var stGuard = W.stage; W.stage = function () { var r = stGuard.apply(this, arguments); guard(); return r; };
(function () {
  var stg = $("stage");
  [["vxGrade"], ["vxGrain"], ["vxTone"]].forEach(function (x) { var d = document.createElement("div"); d.id = x[0]; app.insertBefore(d, stg.nextSibling); });
  try {
    var c = document.createElement("canvas"); c.width = c.height = 96; var x = c.getContext("2d"), im = x.createImageData(96, 96), i, v;
    for (i = 0; i < im.data.length; i += 4) { v = 90 + Math.random() * 120; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 46; }
    x.putImageData(im, 0, 0); $("vxGrain").style.backgroundImage = "url(" + c.toDataURL("image/png") + ")";
  } catch (e) {}
})();
var rdn = A.renderDailyNone;
A.renderDailyNone = function () {
  var learned = 0; try { learned = (S().data.learned || []).length; } catch (e) {}
  var n = null; try { n = A.nextLesson(); } catch (e) {}
  if (learned > 0 || !n || !n.place) return rdn.apply(this, arguments);
  var host = $("daily"), lbl = window.I18n ? I18n.txt(n.place.label) : "";
  host.innerHTML = '<div class="dcard vxw"><div class="dtag">أهلًا بك</div>' + (window.giTile ? giTile(n.place.place) : "") +
    '<h3>واديك ينتظرك</h3><p>هيّا نبدأ رحلتنا من ' + lbl + '</p>' +
    '<button class="dbtn" id="vxgo">هيّا نذهب</button><button class="dbtn soft" id="vxlook">أتجوّل قليلًا</button></div>';
  host.classList.add("on");
  host.querySelector("#vxgo").onclick = function () { try { AtharAudio.sfx("tap"); } catch (e) {} host.classList.remove("on"); A.open(n.place); };
  host.querySelector("#vxlook").onclick = function () { try { AtharAudio.sfx("soft"); } catch (e) {} host.classList.remove("on"); };
  host.onclick = function (e) { if (e.target === host) host.classList.remove("on"); };
};
var liftRaf = 0, hideT = 0, DEFT = "translate(150 560) scale(.78)";
function liftAthar() {
  liftRaf = 0;
  if (!app.classList.contains("instage") || !ath) return;
  var m = scene.getScreenCTM(), a = appRect(), card = panel.firstElementChild;
  if (!m) return;
  var up = panel.classList.contains("up") && !panel.classList.contains("vx-hide") && card;
  var want = DEFT;
  if (up) {
    var feetY = a.height - 8 - card.offsetHeight + 12, s = Math.min(.74, (feetY - 100) / (174 * m.d));
    if (s >= .4) {
      var ux = (a.left + 58 - m.e) / m.a, uy = (a.top + feetY - m.f) / m.d;
      want = "translate(" + (ux - 30 * s).toFixed(1) + " " + (uy - 152 * s).toFixed(1) + ") scale(" + s.toFixed(3) + ")";
    }
  }
  if (ath.getAttribute("transform") !== want) ath.setAttribute("transform", want);
}
function liftLater(ms) { if (liftRaf) cancelAnimationFrame(liftRaf); setTimeout(function () { liftRaf = requestAnimationFrame(liftAthar); }, ms || 0); }
function syncHide() {
  var stg = panel.querySelector(".stage"), empty = !!(stg && !stg.childElementCount);
  if (empty && panel.classList.contains("up") && app.classList.contains("instage")) {
    if (!hideT && !panel.classList.contains("vx-hide")) hideT = setTimeout(function () { hideT = 0; var s2 = panel.querySelector(".stage"); if (s2 && !s2.childElementCount) { panel.classList.add("vx-hide"); liftLater(0); } }, 420);
  } else { clearTimeout(hideT); hideT = 0; if (panel.classList.contains("vx-hide")) { panel.classList.remove("vx-hide"); } }
}
var RING = '<svg viewBox="0 0 28 28" aria-hidden="true"><circle class="rp" cx="14" cy="14" r="11" fill="none" stroke="#3FA7C9" stroke-width="2.4"/><circle cx="14" cy="14" r="5.4" fill="#F0A93B" stroke="#3A2E24" stroke-width="2"/><circle cx="12.4" cy="12.4" r="1.6" fill="#fff"/></svg>';
var LANT = '<svg viewBox="0 0 46 62" aria-hidden="true"><path d="M23 3v7" stroke="#4A3626" stroke-width="3" stroke-linecap="round"/><path d="M14 12h18l-3-5H17z" fill="#C9944A" stroke="#4A3626" stroke-width="2.4" stroke-linejoin="round"/><path d="M12 14h22l3 9v18l-3 8H12l-3-8V23z" fill="#FFE49A" stroke="#4A3626" stroke-width="2.6" stroke-linejoin="round"/><path d="M23 14v35M9 31h28" stroke="#C9944A" stroke-width="2" opacity=".7"/><ellipse cx="23" cy="32" rx="6" ry="8" fill="#FFB43A" opacity=".85"/><path d="M12 49h22l-2 6H14z" fill="#C9944A" stroke="#4A3626" stroke-width="2.4" stroke-linejoin="round"/></svg>';
var CIRC = /^[◦◌◉◍◇◆◐◑◒◷○●•☾☽☼☀]$/;
function decorate() {
  [].slice.call(panel.querySelectorAll(".toucher .ico")).forEach(function (e) {
    if (e.dataset.vx) return; e.dataset.vx = 1; if (CIRC.test((e.textContent || "").trim())) e.innerHTML = RING;
  });
  [].slice.call(document.querySelectorAll(".lcard.end,.ncard,.dcard.done")).forEach(function (c) {
    if (c.dataset.vx) return; c.dataset.vx = 1;
    var l = document.createElement("div"); l.className = "vxlant"; l.innerHTML = LANT;
    var host = c.classList.contains("lcard") ? c : c; host.insertBefore(l, host.firstChild);
    var sp = document.createElement("div"); sp.className = "vxspecks";
    for (var i = 0; i < 7; i++) { var d = document.createElement("i"); d.style.left = (8 + i * 13) + "%"; d.style.animationDelay = (-i * 1.1) + "s"; d.style.animationDuration = (6 + (i % 3)) + "s"; sp.appendChild(d); }
    host.appendChild(sp);
  });
}
try {
  var pmo = new MutationObserver(function () { syncHide(); decorate(); liftLater(40); });
  pmo.observe(panel, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  ["nextup", "daily"].forEach(function (id) { var h = $(id); if (h) new MutationObserver(decorate).observe(h, { childList: true }); });
  addEventListener("resize", function () { liftLater(60); });
} catch (e) {}
panel.addEventListener("pointerdown", function (e) {
  var t = e.target.closest && e.target.closest(".opt,.chip,.cell,.toucher,.btn,.ayah"); if (!t || reduce) return;
  t.classList.remove("vxpop"); void t.offsetWidth; t.classList.add("vxpop");
}, true);
function flyHome(mark) {
  var g = $(mark); if (!g || !g.animate || reduce) return;
  var bb = g.getBBox(), tm = null; try { var cs = g.transform.baseVal.consolidate(); tm = cs && cs.matrix; } catch (e) {}
  var cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2; if (tm) { var x = tm.a * cx + tm.c * cy + tm.e; cy = tm.b * cx + tm.d * cy + tm.f; cx = x; }
  var s = Math.max(.9, Math.min(2, 80 / Math.max(10, bb.width, bb.height))), T = { x: vb[0] + vb[2] / 2, y: 250 };
  var w = svgEl("g", {}, fx); w.appendChild(cloneMark(g));
  var tf = function (x, y, k) { return "translate(" + x + "px," + y + "px) scale(" + k + ") translate(" + (-cx) + "px," + (-cy) + "px)"; };
  var an = w.animate([{ transform: tf(T.x, T.y, s), opacity: 1, offset: 0 }, { transform: tf(T.x, T.y, s), opacity: 1, offset: .3 }, { transform: tf(cx, cy, 1), opacity: .9, offset: .85 }, { transform: tf(cx, cy, 1), opacity: 0, offset: 1 }], { duration: 1800, easing: "ease-in-out", fill: "forwards" });
  an.onfinish = function () { w.remove(); };
}
panel.addEventListener("click", function (e) {
  var b = e.target.closest && e.target.closest(".lesson-close .btn"); if (!b) return;
  try { var D = window.Director, mk = D && D.exp && D.exp.leaves; if (mk && S().hasMark(mk) && app.classList.contains("instage")) flyHome(mk); } catch (x) {}
}, true);
var stG = W.stage; W.stage = function () { var r = stG.apply(this, arguments); liftLater(700); return r; };
var un1 = W.unstage; W.unstage = function () { var r = un1.apply(this, arguments); clearTimeout(hideT); panel.classList.remove("vx-hide"); return r; };
(function () {
  var run = [], n = 0;
  function flush(parent) {
    if (!run.length) return;
    var g = svgEl("g", { "class": "vxTw vxTw" + (n++ % 3) });
    parent.insertBefore(g, run[0]);
    run.forEach(function (c) { c.classList.remove("star"); c.removeAttribute("style"); g.appendChild(c); });
    run = [];
  }
  var seen = [];
  [].forEach.call(document.querySelectorAll("#scene .star"), function (st) { if (seen.indexOf(st.parentNode) < 0) seen.push(st.parentNode); });
  seen.forEach(function (par) {
    run = [];
    [].slice.call(par.children).forEach(function (c) {
      if (c.classList && c.classList.contains("star")) run.push(c); else flush(par);
    });
    flush(par);
  });
})();
var HOME_URL = "../home-next.html", vh = $("vhome"), leaving = 0, qT;
if (vh) vh.setAttribute("href", HOME_URL);
function mk(id, html, ms) {
  var q = $(id); if (q) q.remove();
  q = document.createElement("div"); q.id = id; q.innerHTML = html; app.appendChild(q);
  clearTimeout(qT); if (ms) qT = setTimeout(function () { q.remove(); }, ms);
  return q;
}
if (vh) vh.addEventListener("click", function (e) {
  if (leaving || !(window.Director && Director.exp && app.classList.contains("instage"))) return;
  e.preventDefault(); e.stopImmediatePropagation();
  var q = mk("vxQ", '<b>نكمل الدرس؟</b><div><button class="g">أكمل</button><button class="o">الرئيسية</button></div>', 8000);
  q.querySelector(".g").onclick = function () { q.remove(); };
  q.querySelector(".o").onclick = function () { leaving = 1; vh.click(); };
}, true);
(function () {
  var g = $("gate"), en = $("enter");
  if (!g || !en || !(/home-next/.test(document.referrer) || /[?&]from=home/.test((performance.getEntriesByType("navigation")[0] || {}).name || "")) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var ok = 0; try { var c = new (window.AudioContext || window.webkitAudioContext)(); ok = c.state === "running"; c.close(); } catch (e) {}
  if (!ok) { g.classList.add("vx-in"); return; }
  setTimeout(function () { g.classList.add("vx-cross"); setTimeout(function () { if (en.onclick) en.click(); }, 600); }, 120);
})();
var pend = null;
function plInfo(p) {
  var t = 0, d = 0;
  Object.keys(A.exps).forEach(function (k) { var e = A.exps[k]; if (e && e.scene && e.scene.place === p.place) { t++; try { if (S().isLearned(k)) d++; } catch (x) {} } });
  return [d, t];
}
function rings() {
  A.places.forEach(function (p) {
    var h = scene.querySelector('.place[data-place="' + p.place + '"] .halo'); if (!h) return;
    var g = h.parentNode, o = g.querySelector(".vxPr"), n = plInfo(p), x = +h.getAttribute("cx"), y = +h.getAttribute("cy"), r = +h.getAttribute("r") + 6;
    if (o) o.remove();
    o = svgEl("g", { "class": "vxPr", "pointer-events": "none" }, g);
    svgEl("circle", { cx: x, cy: y, r: r, fill: "none", stroke: "#3A2E24", "stroke-opacity": .16, "stroke-width": 3 }, o);
    if (n[0]) svgEl("circle", { cx: x, cy: y, r: r, fill: "none", stroke: "#F0A93B", "stroke-width": 3.6, "stroke-linecap": "round", pathLength: 100, "stroke-dasharray": (100 * n[0] / n[1]).toFixed(1) + " 100", transform: "rotate(-90 " + x + " " + y + ")" }, o);
  });
}
var lab2 = A.labels;
A.labels = function () {
  var r = lab2.apply(this, arguments);
  try {
    rings();
  } catch (e) {}
  return r;
};
function ar(n) { return n.toLocaleString("ar-EG"); }
$("labels").addEventListener("click", function (e) {
  var lb = e.target.closest && e.target.closest(".plabel");
  var p = lb && !lb.classList.contains("sleep") && A.places.find(function (x) { return I18n.txt(x.label) === lb.textContent; });
  if (!p) return;
  e.stopPropagation(); e.preventDefault();
  if (pend === p && $("vxP")) { $("vxP").remove(); pend = null; return A.open(p); }
  var n = plInfo(p); pend = p; W.moveTo(p.place);
  var q = mk("vxP", '<b>' + I18n.txt(p.label) + '</b><div class="n"><svg viewBox="0 0 24 32" width="18" height="24" aria-hidden="true"><path d="M8 6h8l2 4v14l-2 3H8l-2-3V10z" fill="#F0A93B" stroke="#3A2E24" stroke-width="2"/></svg>' + ar(n[0]) + ' / ' + ar(n[1]) + (n[0] && n[0] === n[1] ? " ★" : "") + '</div><button class="g">ادخل</button>', 10000);
  q.querySelector("button").onclick = function () { q.remove(); pend = null; A.open(p); };
}, true);
document.addEventListener("pointerdown", function (e) { var q = $("vxP"); if (q && !q.contains(e.target) && !(e.target.closest && e.target.closest(".plabel"))) { q.remove(); pend = null; } }, true);
function night() {
  var h = new Date().getHours(), ph = 0; try { ph = S().data.phase | 0; } catch (e) {}
  if (ph === 2 || h >= 19 || h < 5) scene.dataset.night = "1"; else delete scene.dataset.night;
}
night();
window.VX = { lift: liftAthar, placeSay: placeSay, tidy: tidy, relayout: relayout, vb: function () { return vb; } };

/* ═══ r11: المشهد المجسّم — خلفية 3D كاملة + ميداليات الأماكن (بدل رسوم SVG المسطّحة القديمة) ═══ */
(function () {
  var BG = ["hill", "hill_sun", "hill_night"], VAR = ["day", "sun", "night"];
  var MED = { masjid: [322, 356, 40], hill: [218, 366, 40], home: [96, 420, 52], spring: [226, 528, 44], road: [330, 606, 42] };
  var NSX = "http://www.w3.org/2000/svg", XL = "http://www.w3.org/1999/xlink", cur = -1;
  function mk(tag, at, par) { var e = document.createElementNS(NSX, tag); for (var k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; }
  function idx(p) { return p === 2 ? 2 : (p === 1 || p === 3) ? 1 : 0; }
  var kids = [].slice.call(scene.children), firstPl = kids.findIndex(function (c) { return c.classList && c.classList.contains("place"); });
  kids.forEach(function (c, i) { if (i > 0 && i < firstPl) c.classList.add("vxold"); });
  ["night", "tint"].forEach(function (id) { var e = $(id); if (e) e.classList.add("vxold"); });
  [].slice.call(scene.querySelectorAll("#tree,.palm")).forEach(function (e) { var g = e; while (g.parentNode && g.parentNode !== scene) g = g.parentNode; g.classList.add("vxold"); });
  var defs = scene.querySelector("defs");
  var lg = mk("linearGradient", { id: "vx3f", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  mk("stop", { offset: 0, "stop-color": "#7EC3EE" }, lg); mk("stop", { offset: 1, "stop-color": "#5FA845" }, lg);
  var bg = mk("g", { id: "vx3d", "pointer-events": "none" });
  scene.insertBefore(bg, scene.children[1]);
  mk("rect", { x: -400, y: -400, width: 1200, height: 1500, fill: "url(#vx3f)" }, bg);
  var bgI = BG.map(function (n, i) { var e = mk("image", { x: -28, y: -95, width: 456, height: 815, preserveAspectRatio: "none", "class": "vxi" }, bg); e.dataset.src = "img/bg/" + n + ".webp"; return e; });
  var meds = {};
  Object.keys(MED).forEach(function (k) {
    var g = scene.querySelector('.place[data-place="' + k + '"]'); if (!g) return;
    var m = MED[k], x = m[0], y = m[1], r = m[2], h = g.querySelector(".halo");
    [].slice.call(g.children).forEach(function (c) { if (c !== h) c.classList.add("vxold"); });
    if (h) { h.setAttribute("cx", x); h.setAttribute("cy", y); h.setAttribute("r", r + 3); }
    var d = mk("g", { "class": "vxmed" }, g);
    mk("ellipse", { cx: x, cy: y + r + 3, rx: r * .92, ry: 8, fill: "#2E1C0C", opacity: .3, filter: "url(#sf)" }, d);
    mk("circle", { cx: x, cy: y, r: r + 3.5, fill: "#FFF4DA", stroke: "#3A2A1E", "stroke-width": 3 }, d);
    var cp = mk("clipPath", { id: "vxc_" + k }, d); mk("circle", { cx: x, cy: y, r: r }, cp);
    var ig = mk("g", { "clip-path": "url(#vxc_" + k + ")" }, d);
    meds[k] = VAR.map(function (v) { var e = mk("image", { x: x - r, y: y - r, width: 2 * r, height: 2 * r, preserveAspectRatio: "xMidYMid slice", "class": "vxi" }, ig); e.dataset.src = "img/medal/" + k + "_" + v + ".webp"; return e; });
    mk("circle", { cx: x, cy: y, r: r, fill: "none", stroke: "#3A2A1E", "stroke-opacity": .28, "stroke-width": 1.4 }, d);
    mk("path", { d: "M" + (x - r * .62) + " " + (y - r * .5) + "A" + (r * .78) + " " + (r * .78) + " 0 0 1 " + (x + r * .1) + " " + (y - r * .78), fill: "none", stroke: "#fff", "stroke-opacity": .55, "stroke-width": 3, "stroke-linecap": "round" }, d);
  });
  function show(arr, i) {
    arr.forEach(function (e, j) {
      if (j === i) {
        var go = function () { e.style.opacity = 1; arr.forEach(function (o, q) { if (q !== i) o.style.opacity = 0; }); };
        if (!e.getAttribute("href")) { e.addEventListener("load", go, { once: true }); e.setAttribute("href", e.dataset.src); }
        else go();
      }
    });
  }
  function sync(p) {
    var v = idx(p); if (v === cur) return; cur = v;
    show(bgI, v); Object.keys(meds).forEach(function (k) { show(meds[k], v); });
  }
  var ph = 0; try { ph = S().data.phase | 0; } catch (e) {}
  sync(ph);
  var p0 = W.phase;
  W.phase = function (p) { var r = p0.apply(this, arguments); try { sync(p === undefined ? ph : p | 0); if (p !== undefined) ph = p | 0; } catch (e) {} return r; };
})();

/* ═══ r13: لوحة الوادي المرسومة (map_day/sun/night.webp) — تُفعَّل فقط إن وُجدت الصور الثلاث؛ وإلا تبقى الميداليات (r11) ═══
   مواضع الأماكن PL = [x,y,نصف قطر الحلقة] بإحداثيات viewBox 400x720؛ الصورة تغطي المستطيل MR. عدّلها بعد قياس اللوحة. */
(function () {
  var NSX = "http://www.w3.org/2000/svg", NAMES = ["map_day", "map_sun", "map_night"], MR = [0, 0, 405, 720];
  var PL = { masjid: [322, 356, 40], hill: [218, 366, 40], home: [96, 420, 52], spring: [226, 528, 44], road: [330, 606, 42] };
  var bg = $("vx3d"); if (!bg) return;
  var imgs = [], ok = 0, painted = false, cur = -1;
  function idx(p) { return p === 2 ? 2 : (p === 1 || p === 3) ? 1 : 0; }
  NAMES.forEach(function (n, i) {
    var e = document.createElementNS(NSX, "image");
    e.setAttribute("x", MR[0]); e.setAttribute("y", MR[1]); e.setAttribute("width", MR[2]); e.setAttribute("height", MR[3]);
    e.setAttribute("preserveAspectRatio", "none"); e.setAttribute("class", "vxi vxm"); e.setAttribute("decoding", "async");
    bg.appendChild(e); imgs.push(e);
    var pr = new Image();
    pr.onload = function () { e.setAttribute("href", "img/map/" + n + ".webp"); if (++ok === NAMES.length) enable(); };
    pr.onerror = function () {};
    pr.src = "img/map/" + n + ".webp";
  });
  function enable() {
    painted = true; scene.classList.add("vxpaint");
    Object.keys(PL).forEach(function (k) {
      var g = scene.querySelector('.place[data-place="' + k + '"]'), h = g && g.querySelector(".halo"); if (!h) return;
      h.setAttribute("cx", PL[k][0]); h.setAttribute("cy", PL[k][1]); h.setAttribute("r", PL[k][2]);
    });
    var ph = 0; try { ph = S().data.phase | 0; } catch (e) {}
    cur = -1; sync(ph);
    try { tidyLater(60); } catch (e) {}
  }
  function sync(p) {
    if (!painted) return; var v = idx(p); if (v === cur) return; cur = v;
    imgs.forEach(function (e, j) { e.style.opacity = j === v ? 1 : 0; });
  }
  var p0 = W.phase;
  W.phase = function (p) { var r = p0.apply(this, arguments); try { sync(p === undefined ? (S().data.phase | 0) : p | 0); } catch (e) {} return r; };
  window.VX = window.VX || {}; window.VX.paint = function () { return painted; };
})();

/* ═══ r12: علامات الوادي بالشكل المجسّم الجديد (صور مجسّمة بدل رسوم SVG المسطّحة) ═══
   الطيور (mBirds/mBirdsFlock) استُبدلت بريشة (لا كائنات حيّة)؛ «اليدان» بورقتين. */
(function () {
var M3 = [["mBanner","mBanner",53,457,34],["mFinalSeal","mFinalSeal",272,302,34],["mHouse2","mHouse2",271,356,42],["mNeighbor","mHouse2",211,406,72],["mLowBranch","mLowBranch",222,430,52],["mEmber","mEmber",124,679,34],["mCurtain","mCurtain",76,428,44],["mShelter","mShelter",68,598,80],["mCrown","mCrown",316,287,34],["mBalance","mBalance",155,488,50],["mScale","mBalance",96,471,64],["mScaleTrue","mBalance",271,488,50],["mBlossom","mBlossom",300,462,34],["mGreenDome","mGreenDome",330,278,36],["mDoor","mDoor",316,375,34],["mOpenDoor","mDoor",106,450,48],["mArch","mDoor",316,374,34],["mHarvest","mHarvest",223,426,55],["mHands","mLeafPair",306,353,34],["mSapling","mLeafPair",120,526,34],["mHeart","mHeart",196,595,34],["mHeartBig","mHeart",200,468,39],["mPulse","mHeart",173,620,46],["mFeather","mFeather",274,595,34],["mPerfume","mPerfume",255,470,40],["mKey","mKey",291,438,34],["mSpring2","mSpring2",151,602,60],["mStill","mStill",200,700,52],["mMirror","mStill",226,546,44],["mCompass","mCompass",272,640,34],["mCart","mCart",327,672,54],["mNest","mNest",238,413,34],["mLeaf","mLeaf",71,315,42],["mBirds","mFeather",192,202,26],["mBirdsFlock","mFeather",182,177,26]];
var AR = {};
function boxOf(a, id) { var s = a[4], w = s, h = s, r = AR[a[1]]; if (r) { if (r > 1) h = s / r; else w = s * r; } return [a[2] - w / 2, a[3] - h / 2, w, h]; }
try {
  M3.forEach(function (a) {
    var g = $(a[0]); if (!g) return;
    [].slice.call(g.children).forEach(function (c) { if (!(c.tagName === "circle" && /lampG|hglG/.test(c.getAttribute("fill") || ""))) g.removeChild(c); });
    g.removeAttribute("filter"); g.removeAttribute("fill"); g.removeAttribute("stroke"); g.removeAttribute("stroke-width");
    var im = svgEl("image", { href: "img/marks/" + a[1] + ".webp", preserveAspectRatio: "xMidYMid meet", "data-m3": "1" }, g);
    var b = [a[2] - a[4] / 2, a[3] - a[4] / 2, a[4], a[4]];
    im.setAttribute("x", b[0].toFixed(1)); im.setAttribute("y", b[1].toFixed(1)); im.setAttribute("width", b[2].toFixed(1)); im.setAttribute("height", b[3].toFixed(1));
    im.setAttribute("decoding", "async"); g.classList.add("m3d");
  });
} catch (e) {}
})();

})();

/* ═══ تحميل مسبق هادئ لأصوات أول درس في كل مكان (بعد الخمول، على شبكة مناسبة فقط) ═══
   يستعمل R3kidWarm (طلبات منخفضة الأولوية، اثنان في آن واحد) فيخزّنها عامل الخدمة؛ لا يمسّ محرك الصوت. */
(function () {
  try {
    if (!navigator.serviceWorker || /[?&]kid=0/.test(location.search)) return;
    var ok = function () {
      var c = navigator.connection || {};
      return navigator.onLine !== false && !c.saveData && !/(^|-)2g$/.test(c.effectiveType || "") && c.type !== "cellular";
    };
    var run = function () {
      if (!ok() || !window.R3kidWarm || !window.App || !App.places) return;
      App.places.forEach(function (p, i) {
        setTimeout(function () { try { var e = App.nextAt(p); if (e) window.R3kidWarm(e); } catch (x) {} }, i * 2500);
      });
    };
    setTimeout(function () { (window.requestIdleCallback || setTimeout)(run); }, 8000);
  } catch (e) {}
})();

/* ═══ r19 · تكبير دخول المكان (placeBg) — يُراقب instage فقط، لا يمسّ منطق التنقل ═══ */
(function () {
  try {
    var app = document.getElementById("app"), bg = document.getElementById("placeBg");
    if (!app || !bg || !window.MutationObserver) return;
    var rm = matchMedia("(prefers-reduced-motion: reduce)").matches, was = app.classList.contains("instage");
    new MutationObserver(function () {
      var now = app.classList.contains("instage");
      if (now && !was && !rm) { bg.classList.remove("vx-zin"); void bg.getBoundingClientRect(); bg.classList.add("vx-zin"); setTimeout(function () { bg.classList.remove("vx-zin"); }, 520); }
      was = now;
    }).observe(app, { attributes: true, attributeFilter: ["class"] });
  } catch (e) {}
})();
