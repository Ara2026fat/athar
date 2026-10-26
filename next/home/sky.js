/* ARAFAT ALRAJHI © 2026 — أثر: قنديل الأيام + سماء النور (وحدة مستقلة بلا اعتماديات)
الاستخدام: AtharSky.mount({lanterns: elA, sky: elB, time:'day'|'dusk'|'night', pid, days, stars})
تعيد {destroy, pause, resume, setTime, refresh, getState}. لا صوت داخلي: AtharSky.onTap(kind, info). */
(function () {
'use strict';
var AS=window.AtharSky=window.AtharSky||{};
AS.version = '1.0';
if (!AS.onTap) AS.onTap=null;
var uid=0,insts=[],raf=0,lastTs=0,visBound=false;
var DAYN = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
var mq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
function reduced() { return !!(mq && mq.matches) || document.body.classList.contains('bedtime'); }
function emit(kind, info) { try { if (typeof AS.onTap === 'function') AS.onTap(kind, info); } catch (e) {} }
function pad2(n) { return n < 10 ? '0' + n : '' + n; }
function dstr(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function jget(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
function clamp(v,a,b) { return v<a?a:v>b?b:v; }
function rng(s) { return function () { s |=0; s=s+0x6D2B79F5 | 0; var t=Math.imul(s ^ s>>>15,1 | s); t=t+Math.imul(t ^ t>>>7,61 | t) ^ t; return ((t ^ t>>>14)>>>0) / 4294967296; }; }
function autoTime(now) { var h = (now || new Date()).getHours(); return h >= 19 || h < 5 ? 'night' : h >= 15 ? 'dusk' : 'day'; }
/* ---- حالة التقدم: نفس مفاتيح index.html (athar_days_v1_<pid> ، athar_mis_v1_<pid>.total) ---- */
function readState(o) {
var pid = o.pid || (jget('athar_profiles_v1') || {}).active || 'p1';
var now=o.now?new Date(o.now):new Date();
var days = o.days || jget('athar_days_v1_' + pid);
if (!Array.isArray(days)) days=[];
var stars = o.stars != null ? +o.stars : +((jget('athar_mis_v1_' + pid) || {}).total);
if (!(stars>=0)) stars=0;
var week=[];
for (var j = 0; j < 7; j++) {
var d=new Date(now.getFullYear(),now.getMonth(),now.getDate()-(6-j));
var s=dstr(d);
week.push({ date:s,name:DAYN[d.getDay()],lit:days.indexOf(s)>=0,today:j===6 });
}
return { pid:pid,week:week,stars:Math.floor(stars),lit:Math.min(40,Math.floor(stars)),nDays:days.length };
}
/* ---- حلقة rAF واحدة تتوقف عند الخمول / إخفاء الصفحة ---- */
function kick() { if (!raf&&!document.hidden) { lastTs=0; raf=requestAnimationFrame(loop); } }
function loop(ts) {
raf=0;
var dt=lastTs?Math.min(0.05,(ts-lastTs) / 1000):0.016,any=false;
lastTs=ts;
for (var i = 0; i < insts.length; i++) if (insts[i].step(dt)) any = true;
if (any) raf=requestAnimationFrame(loop); else lastTs=0;
}
function onVis() {
if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf=0; } }
else { kick(); insts.forEach(function (m) { m.refresh(); }); }
}
/* =================== قنديل الأيام =================== */
var LW=390,SAG0=17,RY=10;
function ropeD(s) { return 'M-5 ' + RY + ' Q195 ' + (RY + 2 * s) + ' 395 ' + RY; }
function ropeY(x,s) { var t=(x+5) / 400; return RY+4*s*t*(1-t); }
function Lanterns(host,st,cx) {
var id = 'al' + (++uid), root = document.createElement('div'), i;
root.className = 'asky asky-lan';
root.setAttribute('role', 'group');
var xs=[];
for (i = 0; i < 7; i++) xs.push(LW - 28 - i * ((LW - 56) / 6));
var ol = '#4A3226';
var body=function (b,g,go,cap) {
return '<path d="M0 0V8" stroke="' + ol + '" stroke-width="1.4" fill="none"/><circle cy="9.5" r="2.2" fill="none" stroke="' + ol + '" stroke-width="1.4"/>' +
'<path d="M-8 16Q-8 11.5-4 11H4Q8 11.5 8 16Z" fill="' + cap + '" stroke="' + ol + '" stroke-width="1.6" stroke-linejoin="round"/>' +
'<path d="M-8 16C-18 21-18 37-8 42H8C18 37 18 21 8 16Z" fill="' + b + '" stroke="' + ol + '" stroke-width="1.8" stroke-linejoin="round"/>' +
'<ellipse cy="29" rx="7.5" ry="10.5" fill="' + g + '" opacity="' + go + '"/>' +
'<path d="M-4 16C-10 23-10 35-4 42M4 16C10 23 10 35 4 42" stroke="' + ol + '" stroke-opacity=".3" stroke-width="1.2" fill="none"/>' +
'<path d="M-7.5 42H7.5L6 46.5H-6Z" fill="' + cap + '" stroke="' + ol + '" stroke-width="1.6" stroke-linejoin="round"/>' +
'<path d="M0 46.5V53" stroke="' + ol + '" stroke-width="1.4"/><ellipse cy="55" rx="2.2" ry="3.4" fill="' + cap + '" stroke="' + ol + '" stroke-width="1.2"/>';
};
var h = '<svg viewBox="0 0 390 110" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs>' +
'<radialGradient id="' + id + 'g"><stop offset="0" stop-color="#FFE3A0" stop-opacity=".9"/><stop offset=".5" stop-color="#FFB347" stop-opacity=".3"/><stop offset="1" stop-color="#FFB347" stop-opacity="0"/></radialGradient>' +
'<g id="' + id + 'on">' + body('#FFC857', '#FFF1C2', '.95', '#7A5236') + '</g>' +
'<g id="' + id + 'off">' + body('#EBC688', '#FBE7B8', '.5', '#B58A5A') + '</g></defs>' +
'<path class="al-rs" d="' + ropeD(SAG0) + '"/><path class="al-rope" d="' + ropeD(SAG0) + '"/>';
for (i = 0; i < 7; i++) h += '<g class="al-ln"><circle class="al-halo" r="36" cy="30" fill="url(#' + id + 'g)"/><g class="al-sw"><use/></g><text class="al-tx" y="72" text-anchor="middle"></text></g>';
root.innerHTML = h + '</svg>';
host.appendChild(root);
var svg = root.firstChild, rope = root.querySelectorAll('.al-rope, .al-rs'), gs = root.querySelectorAll('.al-ln');
var L=[],sag=SAG0,sv=0,sagImp=0,sagDelay=0,today=null;
for (i = 0; i < 7; i++) L.push({ g: gs[i], use: gs[i].querySelector('use'), halo: gs[i].querySelector('.al-halo'), x: xs[i], th: 0, w: 0, d: 0, k: 0, lit: null, K: 38 + i * 1.3 });
function setTransforms() {
for (var n = 0; n < 7; n++) {
var l=L[n],sc=n===6?1.12:1;
l.g.setAttribute('transform', 'translate(' + l.x.toFixed(1) + ' ' + (ropeY(l.x, sag) + 1).toFixed(1) + ') rotate(' + l.th.toFixed(2) + ') scale(' + sc + ')');
}
var d = ropeD(sag); rope[0].setAttribute('d', d); rope[1].setAttribute('d', d);
}
function paint(ignite) {
var wk=st.week,nl=0;
for (var n = 0; n < 7; n++) {
var l=L[n],dayIdx=6-n,w=wk[dayIdx];
if (w.lit) nl++;
var tx = l.g.querySelector('.al-tx'); tx.textContent = w.name;
l.g.classList.toggle('on', w.lit); l.g.classList.toggle('today', w.today);
l.use.setAttribute('href', '#' + id + (w.lit ? 'on' : 'off'));
if (ignite && w.lit && l.lit === false) { l.g.classList.remove('ign'); void l.g.getBoundingClientRect(); l.g.classList.add('ign'); }
l.lit=w.lit; l.date=w.date; l.name=w.name; l.today=w.today;
}
root.setAttribute('aria-label', 'قنديل الأيام: أُضيء ' + nl + ' من ٧ أيام');
}
function swing(k,strong) {
if (cx.reduced()) {
L[k].g.classList.add('fl'); setTimeout(function () { L[k].g.classList.remove('fl'); }, 700); return;
}
for (var n = 0; n < 7; n++) {
var dist=Math.abs(n-k),dir=n===k?(Math.random()<.5?-1:1):(xs[n]>xs[k]?1:-1);
L[n].d=dist*0.07; L[n].k=dir*(strong?120:88)*Math.exp(-dist / 2.6);
}
sagDelay=0.04; sagImp=52;
cx.kick();
}
function down(e) {
if (e.button>0) return;
var r=svg.getBoundingClientRect(); if (!r.width) return;
var x=(e.clientX-r.left) / r.width*LW,k=0,b=1e9;
for (var n = 0; n < 7; n++) { var dd = Math.abs(xs[n] - x); if (dd < b) { b = dd; k = n; } }
swing(k,true);
var l = L[k]; emit('lantern', { index: 6 - k, date: l.date, name: l.name, lit: l.lit, today: l.today });
}
svg.addEventListener('pointerdown', down);
var api={
step:function (dt) {
var act=false,n,l;
for (n = 0; n < 7; n++) {
l=L[n];
if (l.d>0) { l.d-=dt; act=true; if (l.d<=0) { l.w+=l.k; l.k=0; } continue; }
if (Math.abs(l.th)<0.04&&Math.abs(l.w)<0.6) { if (l.th) { l.th=0; l.w=0; } continue; }
act=true;
for (var s = 0; s < 2; s++) { var h2 = dt / 2; l.w += (-l.K * l.th - 2.1 * l.w) * h2; l.th += l.w * h2; }
}
if (sagDelay>0) { sagDelay-=dt; act=true; if (sagDelay<=0) { sv+=sagImp; sagImp=0; } }
else if (Math.abs(sag-SAG0)>0.03||Math.abs(sv)>0.5) {
act=true;
for (var q = 0; q < 2; q++) { sv += (-44 * (sag - SAG0) - 2 * sv) * dt / 2; sag += sv * dt / 2; }
} else { sag=SAG0; sv=0; }
setTransforms();
return act;
},
refresh:function (s2,ignite) { st=s2||st; paint(ignite); },
setTime: function (t) { root.setAttribute('data-time', t); },
paused: function (p) { root.classList.toggle('asky-paused', p); },
destroy: function () { svg.removeEventListener('pointerdown', down); if (root.parentNode) root.parentNode.removeChild(root); }
};
paint(false); setTransforms();
return api;
}
/* =================== سماء النور =================== */
var SW=390,SH=180,NDOT=40,MAXP=40;
var CLOUD = '<svg viewBox="0 0 110 46" width="100%" height="100%" aria-hidden="true"><path d="M12 42Q2 42 4 31Q6 21 18 23Q21 8 40 10Q54 1 67 14Q83 10 91 23Q108 23 107 35Q106 42 95 42Z"/></svg>';
function Sky(host,st,cx,o) {
var root = document.createElement('div'), i;
root.className = 'asky asky-sky';
root.setAttribute('role', 'group');
var h = '<div class="sk-bg"><i class="day"></i><i class="dusk"></i><i class="night"></i></div>' +
'<svg class="sk-ln" viewBox="0 0 390 180" preserveAspectRatio="none" aria-hidden="true"></svg><div class="sk-dots" aria-hidden="true"></div>';
var CL=[[236,10,116,46,24],[18,40,92,38,31],[150,92,76,31,38]];
CL.forEach(function (c, n) { h += '<div class="sk-cl" style="left:' + (c[0] / SW * 100) + '%;top:' + (c[1] / SH * 100) + '%;width:' + (c[2] / SW * 100) + '%;height:' + (c[3] / SH * 100) + '%;--dur:' + c[4] + 's;--dl:-' + n * 9 + 's" aria-hidden="true"><div class="in">' + CLOUD + '</div></div>'; });
root.innerHTML = h + '<canvas class="sk-cv" aria-hidden="true"></canvas>';
if (o.background === false) root.classList.add('nobg');
host.appendChild(root);
var dotsEl = root.querySelector('.sk-dots'), lnEl = root.querySelector('.sk-ln'), cv = root.querySelector('.sk-cv'), c2 = cv.getContext('2d');
var clEls = root.querySelectorAll('.sk-cl');
var R=rng(4417),pts=[],cols=8,rows=5,cw=(SW-28) / cols,rh=132 / rows;
for (i = 0; i < NDOT; i++) { var cc = i % cols,rr = (i / cols) | 0; pts.push({ x: 14 + (cc + .5 + (R() - .5) * .75) * cw,y: 14 + (rr + .5 + (R() - .5) * .7) * rh,s: R() }); }
var left=pts.slice(),order=[],cur=left.reduce(function (a,p) { return Math.hypot(p.x-300,p.y-70)<Math.hypot(a.x-300,a.y-70)?p:a; });
while (left.length) { left.splice(left.indexOf(cur),1); order.push(cur); if (!left.length) break; var best = left[0],bd = 1e9; for (var q = 0; q < left.length; q++) { var dd = Math.hypot(left[q].x - cur.x,left[q].y - cur.y); if (dd < bd) { bd = dd; best = left[q]; } } cur = best; }
var D=[],lines=[];
order.forEach(function (p,n) {
var el = document.createElement('div'), sz = 7 + (p.s * 3 | 0);
el.className = 'sk-d'; el.style.cssText = 'left:' + (p.x / SW * 100).toFixed(2) + '%;top:' + (p.y / SH * 100).toFixed(2) + '%;--z:' + sz + 'px;animation-delay:-' + (p.s * 6).toFixed(1) + 's;animation-duration:' + (3.6 + p.s * 3).toFixed(1) + 's';
dotsEl.appendChild(el); D.push({ el:el,x:p.x,y:p.y,lit:false });
if (n>0) {
var a = order[n - 1], ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
ln.setAttribute('x1', a.x.toFixed(1)); ln.setAttribute('y1', a.y.toFixed(1)); ln.setAttribute('x2', p.x.toFixed(1)); ln.setAttribute('y2', p.y.toFixed(1));
ln.setAttribute('pathLength', '100'); lines.push(Math.hypot(a.x - p.x, a.y - p.y) <= 86 ? lnEl.appendChild(ln) : null);
} else lines.push(null);
});
var litN = -1, W = SW, H = SH, dpr = 1, time = 'day', sprites = {};
function paint(anim) {
var nl=st.lit,was=litN;
for (var n = 0; n < NDOT; n++) {
var on=n<nl;
D[n].lit = on; D[n].el.classList.toggle('on', on);
if (lines[n]) { lines[n].classList.toggle('on', n < nl && n > 0); if (anim && was >= 0 && n === nl - 1) { lines[n].classList.remove('new'); void lnEl.getBoundingClientRect(); lines[n].classList.add('new'); } }
}
if (anim&&was>=0&&nl>was) bloom(nl-1);
litN=nl;
root.setAttribute('aria-label', 'سماء النور: ' + nl + ' من ' + NDOT + ' نورًا مضاءً');
}
function bloom(n) {
var el=D[n].el;
if (reduced_() || !el.animate) { el.classList.add('bl'); setTimeout(function () { el.classList.remove('bl'); }, 800); return; }
el.classList.add('bl');
var a = el.animate([{ transform: 'scale(.7)', opacity: .5 }, { transform: 'scale(3.4)', opacity: 1, offset: .35 }, { transform: 'scale(1)', opacity: 1 }], { duration: 1300, easing: 'ease-out' });
a.onfinish = a.oncancel = function () { el.classList.remove('bl'); };
}
function reduced_() { return cx.reduced(); }
/* جسيمات: مجموعة ثابتة ≤ 40 */
var P = []; for (i = 0; i < MAXP; i++) P.push({ a: 0,x: 0,y: 0,vx: 0,vy: 0,t: 0,m: 1,z: 4,k: 0 });
function mkSprite(c) { var s = document.createElement('canvas'); s.width = s.height = 32; var g = s.getContext('2d'), r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, c[0]); r.addColorStop(.35, c[1]); r.addColorStop(1, c[2]); g.fillStyle = r; g.fillRect(0, 0, 32, 32); return s; }
function mkSprites() {
var day = time === 'day';
sprites[0] = mkSprite(day ? ['#FFFFFF', 'rgba(255,184,70,.95)', 'rgba(255,170,60,0)'] : ['#FFFFFF', 'rgba(255,226,140,.9)', 'rgba(255,200,100,0)']);
sprites[1] = mkSprite(day ? ['#FFFFFF', 'rgba(150,190,255,.85)', 'rgba(150,190,255,0)'] : ['#FFFFFF', 'rgba(200,225,255,.85)', 'rgba(200,225,255,0)']);
}
function spawn(x,y,vx,vy,z,life,k) {
var p = null,m = 9; for (var n = 0; n < MAXP; n++) { var q2 = P[n]; if (!q2.a) { p = q2; break; } var rem = q2.t / q2.m; if (rem < m) { m = rem; p = q2; } }
p.a=1; p.x=x; p.y=y; p.vx=vx; p.vy=vy; p.t=p.m=life; p.z=z; p.k=k;
}
function resize() {
var r=root.getBoundingClientRect(); if (!r.width||!r.height) return;
W=r.width; H=r.height; dpr=Math.min(window.devicePixelRatio||1,2);
cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr);
}
var ro=window.ResizeObserver?new ResizeObserver(resize):null; if (ro) ro.observe(root);
resize(); mkSprites();
/* غيوم: نابض بقصور ذاتي وارتداد */
var C = []; for (i = 0; i < 3; i++) C.push({ el: clEls[i],x: 0,y: 0,vx: 0,vy: 0,drag: false });
function applyC(c) { c.el.style.transform = 'translate3d(' + c.x.toFixed(1) + 'px,' + c.y.toFixed(1) + 'px,0)'; }
var ptr=null;
function loc(e) { var r=root.getBoundingClientRect(); return { x:e.clientX-r.left,y:e.clientY-r.top,r:r }; }
function down(e) {
if (ptr||(e.button>0)) return;
var p=loc(e); if (!p.r.width) return;
var ce = e.target.closest ? e.target.closest('.sk-cl') : null, ci = -1;
for (var n = 0; n < 3; n++) if (clEls[n] === ce) ci = n;
try { root.setPointerCapture(e.pointerId); } catch (x) {}
if (ci>=0) {
var c=C[ci]; c.drag=true; c.vx=c.vy=0;
ptr = { id: e.pointerId, mode: 'c', c: c, ci: ci, sx: p.x, sy: p.y, ox: c.x, oy: c.y, lx: p.x, ly: p.y, lt: e.timeStamp, t0: e.timeStamp, moved: 0 };
emit('cloud', { index: ci });
return;
}
var k=-1,b=34,px=p.x / p.r.width*SW,py=p.y / p.r.height*SH;
for (var m = 0; m < NDOT; m++) { var dd = Math.hypot(D[m].x - px,D[m].y - py); if (dd < b) { b = dd; k = m; } }
if (k >= 0) { bloom(k); emit('dot', { index: k, lit: D[k].lit }); }
ptr = { id: e.pointerId, mode: 'd', lx: p.x, ly: p.y };
if (k < 0) emit('draw', {});
spawn(p.x,p.y,0,0,5,1.2,0); cx.kick();
}
function move(e) {
if (!ptr||e.pointerId!==ptr.id) return;
var p=loc(e);
if (ptr.mode === 'c') {
var c=ptr.c,dt=Math.max(.008,(e.timeStamp-ptr.lt) / 1000);
var nx=ptr.ox+(p.x-ptr.sx),ny=ptr.oy+(p.y-ptr.sy)*.3;
c.vx=c.vx*.6+((nx-c.x) / dt)*.4; c.vy=c.vy*.6+((ny-c.y) / dt)*.4;
c.x=nx; c.y=ny; ptr.lt=e.timeStamp; ptr.moved=Math.max(ptr.moved,Math.hypot(p.x-ptr.sx,p.y-ptr.sy)); applyC(c); return;
}
var dx=p.x-ptr.lx,dy=p.y-ptr.ly,dist=Math.hypot(dx,dy),steps=Math.min(6,Math.floor(dist / 9));
for (var n = 1; n <= steps; n++) {
var f=n / (steps+1);
spawn(ptr.lx+dx*f+(Math.random()-.5)*6,ptr.ly+dy*f+(Math.random()-.5)*6,(Math.random()-.5)*14,-6-Math.random()*10,3+Math.random()*4,1.1+Math.random()*.8,0);
}
if (dist>9) { spawn(p.x,p.y,(Math.random()-.5)*10,-8,4+Math.random()*4,1.3+Math.random()*.6,0); ptr.lx=p.x; ptr.ly=p.y; }
cx.kick();
}
function up(e) {
if (!ptr||e.pointerId!==ptr.id) return;
if (ptr.mode === 'c') {
var c=ptr.c; c.drag=false;
if (ptr.moved<7&&e.timeStamp-ptr.t0<400) {
c.vx=c.vy=0;
if (c.el.animate && !cx.reduced()) c.el.firstChild.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12,.86)', offset: .4 }, { transform: 'scale(1)' }], { duration: 480, easing: 'ease-out' });
var rc=c.el.getBoundingClientRect(),rr=root.getBoundingClientRect();
for (var n = 0; n < 6; n++) spawn(rc.left - rr.left + rc.width * (.25 + Math.random() * .5),rc.top - rr.top + rc.height * .85,(Math.random() - .5) * 14,22 + Math.random() * 20,3 + Math.random() * 2,1.2 + Math.random() * .6,1);
} else if (cx.reduced()) { c.x=c.y=0; applyC(c); }
cx.kick();
}
ptr=null;
try { root.releasePointerCapture(e.pointerId); } catch (x) {}
}
root.addEventListener('pointerdown', down); root.addEventListener('pointermove', move);
root.addEventListener('pointerup', up); root.addEventListener('pointercancel', up);
var dirty=false;
var api={
step:function (dt) {
var act=false,n;
for (n = 0; n < 3; n++) {
var c=C[n]; if (c.drag) { act=true; continue; }
if (Math.abs(c.x)<.2&&Math.abs(c.y)<.2&&Math.abs(c.vx)<2&&Math.abs(c.vy)<2) { if (c.x||c.y) { c.x=c.y=c.vx=c.vy=0; applyC(c); } continue; }
act=true;
for (var s = 0; s < 2; s++) {
var h2=dt / 2;
c.vx+=(-20*c.x-2.6*c.vx)*h2; c.vy+=(-20*c.y-2.6*c.vy)*h2;
c.x+=c.vx*h2; c.y+=c.vy*h2;
var lo=-(c.el.offsetLeft),hi=W-c.el.offsetLeft-c.el.offsetWidth;
if (c.x<lo) { c.x=lo; c.vx=Math.abs(c.vx)*.45; } else if (c.x>hi) { c.x=hi; c.vx=-Math.abs(c.vx)*.45; }
}
applyC(c);
}
var live=0;
c2.setTransform(dpr,0,0,dpr,0,0); c2.clearRect(0,0,W,H);
c2.globalCompositeOperation = time === 'day' ? 'source-over' : 'lighter';
for (n = 0; n < MAXP; n++) {
var p=P[n]; if (!p.a) continue;
p.t-=dt; if (p.t<=0) { p.a=0; continue; }
live++;
if (cx.reduced()) p.vx=p.vy=0;
p.x+=p.vx*dt; p.y+=p.vy*dt; p.vx*=.985;
var f=p.t / p.m,z=p.z*(.6+.6*f)*2.6;
c2.globalAlpha=Math.min(1,f*1.4)*.9;
c2.drawImage(sprites[p.k],p.x-z / 2,p.y-z / 2,z,z);
}
c2.globalAlpha=1;
if (live) act=true; else if (dirty) { c2.clearRect(0,0,W,H); }
dirty=live>0;
return act;
},
refresh:function (s2,anim) { st=s2||st; paint(anim); },
setTime: function (t) { time = t; root.setAttribute('data-time', t); mkSprites(); },
paused: function (p) { root.classList.toggle('asky-paused', p); },
stats:function () { return { lit:litN,dots:D.length,particles:P.filter(function (q) { return q.a; }).length,lines:lnEl.childNodes.length }; },
destroy:function () {
root.removeEventListener('pointerdown', down); root.removeEventListener('pointermove', move);
root.removeEventListener('pointerup', up); root.removeEventListener('pointercancel', up);
if (ro) ro.disconnect(); P.forEach(function (q) { q.a=0; });
if (root.parentNode) root.parentNode.removeChild(root);
}
};
paint(false);
return api;
}
/* =================== mount =================== */
function pick(x) { return typeof x === 'string' ? document.querySelector(x) : x; }
AS.mount=function (opts) {
opts=opts||{};
var hostL=pick(opts.lanterns),hostS=pick(opts.sky);
var st=readState(opts),time=opts.time||autoTime(opts.now?new Date(opts.now):null);
var paused=false,dead=false,parts=[];
var cx={ kick:kick,reduced:function () { return opts.reduceMotion!=null?!!opts.reduceMotion:reduced(); } };
var L=hostL?Lanterns(hostL,st,cx):null,S=hostS?Sky(hostS,st,cx,opts):null;
parts=[L,S].filter(Boolean);
parts.forEach(function (p) { p.setTime(time); });
var inst={
step:function (dt) { if (paused||dead) return false; var a=false; parts.forEach(function (p) { if (p.step(dt)) a=true; }); return a; },
refresh:function () {
if (dead) return; var prev=st.lit,was=st.week.map(function (w) { return w.lit; });
st=readState(opts);
if (L) L.refresh(st,true);
if (S) S.refresh(st,st.lit>prev);
}
};
insts.push(inst);
if (!visBound) { visBound = true; document.addEventListener('visibilitychange', onVis); }
var mqh=function () { kick(); };
if (mq && mq.addEventListener) mq.addEventListener('change', mqh);
var api={
destroy:function () {
if (dead) return; dead=true;
parts.forEach(function (p) { p.destroy(); });
var i=insts.indexOf(inst); if (i>=0) insts.splice(i,1);
if (mq && mq.removeEventListener) mq.removeEventListener('change', mqh);
if (!insts.length) { if (raf) { cancelAnimationFrame(raf); raf = 0; } document.removeEventListener('visibilitychange', onVis); visBound = false; }
},
pause:function () { if (dead) return; paused=true; parts.forEach(function (p) { p.paused(true); }); },
resume:function () { if (dead) return; paused=false; parts.forEach(function (p) { p.paused(false); }); kick(); },
setTime: function (t) { if (dead || ['day', 'dusk', 'night'].indexOf(t) < 0) return; time = t; parts.forEach(function (p) { p.setTime(t); }); },
refresh:inst.refresh,
getState:function () { return { time:time,paused:paused,state:st,sky:S?S.stats():null }; }
};
return api;
};
})();
