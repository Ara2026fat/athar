/* عالم أثر الحي — الرئيسية (A1). يتعامل مع التطبيق عبر DOM وlocalStorage و.click() فقط. */
(function(){
"use strict";
var D=document,W=window,view=D.getElementById("view-home");
if(!view||D.getElementById("homeWorld"))return;
var qs=new URLSearchParams(location.search);
function $(i){return D.getElementById(i)}
function ls(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lset(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function jget(k){try{var o=JSON.parse(ls(k));return o&&typeof o==="object"?o:{}}catch(e){return {}}}
function pid(){var p=jget("athar_profiles_v1");return typeof p.active==="string"?p.active:"p1"}
function KEY(){return "athar_home_w_v1_"+pid()}
function nm(n){var en=ls("athar_num_fmt")==="en";if(en)return String(n);return String(n).replace(/\d/g,function(d){return "٠١٢٣٤٥٦٧٨٩"[d]})}
var RM=W.matchMedia&&W.matchMedia("(prefers-reduced-motion:reduce)").matches;

/* ---------- رسوم المباني (SVG، حدود داكنة ناعمة) ---------- */
var ST=' stroke="#3a2b4d" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
var S2=' stroke="#3a2b4d" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"';
function lg(id,a,b){return '<linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></linearGradient>'}
function sh(cx,cy,rx){return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="6" fill="rgba(40,30,60,.25)"/>'}
function gl(x,y,rx,ry,r){return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity=".34" transform="rotate('+(r||-18)+' '+x+' '+y+')"/>'}
function lantern(x,y,k,c){ /* فانوس صغير مضيء */
  return '<g transform="translate('+x+','+y+') scale('+k+')"><path d="M0 -14V0" fill="none"'+S2+'/><path d="M-9 8L0 0L9 8Z" fill="'+c+'"'+S2+'/><rect x="-8" y="8" width="16" height="22" rx="5" fill="url(#lgw)"'+S2+'/><rect x="-4" y="12" width="3" height="12" rx="1.5" fill="#fff" opacity=".6"/><rect x="-6" y="30" width="12" height="5" rx="2.5" fill="'+c+'"'+S2+'/></g>'}
var LGW='<radialGradient id="lgw"><stop offset="0" stop-color="#fffbd0"/><stop offset="1" stop-color="#ffc94d"/></radialGradient>';
var ART={
valley:function(){
  var s='',i,a;
  for(i=0;i<=6;i++){a=Math.PI*i/6;s+='<circle cx="'+(85-62*Math.cos(a)).toFixed(1)+'" cy="'+(64-48*Math.sin(a)).toFixed(1)+'" r="2.8" fill="#ffd24d" stroke="#3a2b4d" stroke-width="1.4"/>'}
  return '<svg class="art" viewBox="0 0 170 128" width="170" height="128" aria-hidden="true"><defs>'+lg("v1","#fff0c9","#f1c985")+lg("v2","#8fd3ff","#ffe6bd")+lg("v3","#ffe27a","#f5b43a")+LGW+
  '<radialGradient id="v4"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><clipPath id="vc"><path d="M34 122V68A51 40 0 0 1 136 68V122Z"/></clipPath></defs>'+sh(85,122,76)+
  '<path d="M12 122V64A73 56 0 0 1 158 64V122Z" fill="url(#v1)"'+ST+'/>'+
  '<g clip-path="url(#vc)"><rect x="30" y="20" width="110" height="104" fill="url(#v2)"/><ellipse cx="85" cy="96" rx="64" ry="36" fill="url(#v4)"/><ellipse cx="92" cy="108" rx="44" ry="20" fill="#a9e9bb"/><ellipse cx="52" cy="124" rx="58" ry="30" fill="#82dca0"/><ellipse cx="128" cy="126" rx="60" ry="34" fill="#55c283"/><path d="M85 126C77 110 99 102 88 91" fill="none" stroke="#fff1b8" stroke-width="9" stroke-linecap="round"/><path d="M85 126C77 110 99 102 88 91" fill="none" stroke="#ffd36a" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="1 7"/>'+
  '<circle cx="64" cy="94" r="2.4" fill="#fff"/><circle cx="108" cy="90" r="2.4" fill="#fff"/><circle cx="56" cy="78" r="2" fill="#fff"/><circle cx="114" cy="74" r="2" fill="#fff"/><circle cx="85" cy="60" r="2.4" fill="#fff"/></g>'+
  '<path d="M34 122V68A51 40 0 0 1 136 68V122" fill="none"'+ST+'/>'+s+lantern(85,28,.8,"#e9a23b")+
  '<rect x="71" y="0" width="28" height="15" rx="6" fill="url(#v3)"'+ST+'/>'+gl(52,40,16,6,-35)+
  '<rect x="20" y="114" width="130" height="10" rx="5" fill="#f4d9a4"'+ST+'/></svg>'},
hifz:function(){
  return '<svg class="art" viewBox="0 0 120 96" width="120" height="96" aria-hidden="true"><defs>'+lg("h1","#5eea8f","#1f9d4d")+lg("h2","#fff6dc","#f1d79a")+'</defs>'+sh(60,90,48)+
  '<g transform="translate(6,0)"><rect x="90" y="30" width="14" height="58" rx="4" fill="url(#h2)"'+ST+'/><path d="M89 31L97 10L105 31Z" fill="url(#h1)"'+ST+'/><rect class="win" x="94" y="42" width="6" height="11" rx="3"'+S2+'/>'+
  '<rect x="6" y="50" width="84" height="38" rx="8" fill="url(#h2)"'+ST+'/><path d="M18 52A30 30 0 0 1 78 52Z" fill="url(#h1)"'+ST+'/><path d="M48 22V11" fill="none"'+ST+'/><circle cx="48" cy="9" r="4.5" fill="#ffd24d"'+S2+'/>'+gl(38,36,9,4)+
  '<path d="M38 88V73a10 10 0 0 1 20 0V88Z" class="win"'+ST+'/><rect class="win" x="14" y="62" width="11" height="16" rx="5.5"'+S2+'/><rect class="win" x="71" y="62" width="11" height="16" rx="5.5"'+S2+'/></g></svg>'},
noor:function(){
  return '<svg class="art" viewBox="0 0 120 96" width="120" height="96" aria-hidden="true"><defs>'+lg("n1","#ffb25e","#f2670f")+lg("n2","#2c7a5c","#1b5440")+'</defs>'+sh(60,91,46)+
  '<path d="M32 70L22 90M88 70L98 90M60 70V88" fill="none"'+ST+'/><rect x="10" y="6" width="100" height="66" rx="9" fill="url(#n1)"'+ST+'/><rect x="18" y="14" width="84" height="50" rx="4" fill="url(#n2)"'+S2+'/>'+
  '<text x="60" y="49" text-anchor="middle" font-size="27" font-weight="800" fill="#fff8d6" style="font-family:Tajawal,Arial,sans-serif" direction="rtl">أ ب ت</text>'+
  '<rect x="30" y="66" width="60" height="8" rx="4" fill="#ffd9a8"'+S2+'/><rect x="38" y="62" width="10" height="4" rx="2" fill="#fff"/><rect x="52" y="63" width="8" height="3" rx="1.5" fill="#ffd24d"/>'+gl(30,24,10,4,-25)+'</svg>'},
math:function(){
  var cs=[["#ffc033","#f09a07"],["#53c4f7","#1e8fd0"],["#ff7fb5","#e1457f"],["#8be07a","#3fae43"]],d=[1,2,3,4].map(nm),xs=[80,44,8],i,s='';
  var df='';for(i=0;i<4;i++)df+=lg("m"+i,cs[i][0],cs[i][1]);
  for(i=0;i<3;i++)s+='<g><rect x="'+xs[i]+'" y="52" width="32" height="34" rx="8" fill="url(#m'+i+')"'+ST+'/><rect x="'+(xs[i]+5)+'" y="57" width="12" height="4" rx="2" fill="#fff" opacity=".5"/><text x="'+(xs[i]+16)+'" y="78" text-anchor="middle" font-size="22" font-weight="800" fill="#fff" stroke="#3a2b4d" stroke-width="3" paint-order="stroke" style="font-family:Tajawal,Arial,sans-serif">'+d[i]+'</text></g>';
  s+='<g transform="rotate(-7 60 36)"><rect x="44" y="16" width="32" height="34" rx="8" fill="url(#m3)"'+ST+'/><rect x="49" y="21" width="12" height="4" rx="2" fill="#fff" opacity=".5"/><text x="60" y="43" text-anchor="middle" font-size="22" font-weight="800" fill="#fff" stroke="#3a2b4d" stroke-width="3" paint-order="stroke" style="font-family:Tajawal,Arial,sans-serif">'+d[3]+'</text></g>';
  return '<svg class="art" viewBox="0 0 120 96" width="120" height="96" aria-hidden="true"><defs>'+df+'</defs>'+sh(60,90,50)+s+'</svg>'},
lib:function(){
  var c=["#fbbf24","#f472b6","#34d399","#60a5fa","#fb923c","#fde68a","#c084fc"],i,s='',x,h;
  for(i=0;i<7;i++){x=24+i*10.4;h=[22,26,20,27,23,25,21][i];s+='<rect x="'+x.toFixed(1)+'" y="'+(46-h)+'" width="9" height="'+h+'" rx="2" fill="'+c[i]+'"'+S2+'/>'}
  for(i=0;i<6;i++){x=24+i*10.4;h=[24,20,26,22,25,21][i];s+='<rect x="'+x.toFixed(1)+'" y="'+(76-h)+'" width="9" height="'+h+'" rx="2" fill="'+c[(i+3)%7]+'"'+S2+'/>'}
  s+='<g transform="rotate(14 92 76)"><rect x="86" y="52" width="9" height="24" rx="2" fill="#f87171"'+S2+'/></g>';
  return '<svg class="art" viewBox="0 0 120 96" width="120" height="96" aria-hidden="true"><defs>'+lg("l1","#b78cf8","#7a37e8")+'</defs>'+sh(60,91,46)+
  '<rect x="12" y="6" width="96" height="82" rx="9" fill="url(#l1)"'+ST+'/><rect x="20" y="14" width="80" height="66" rx="4" fill="#4b1d95"'+S2+'/>'+s+
  '<rect x="20" y="46" width="80" height="5" rx="2" fill="#d9b8ff"'+S2+'/><rect x="20" y="76" width="80" height="5" rx="2" fill="#d9b8ff"'+S2+'/>'+gl(26,18,10,4,-20)+'</svg>'},
quiz:function(){
  return '<svg class="art" viewBox="0 0 120 96" width="120" height="96" aria-hidden="true"><defs>'+lg("q1","#ff86bd","#e0407c")+lg("q2","#ffb3d6","#f06aa4")+lg("q3","#ffe27a","#f2a91d")+'</defs>'+sh(60,91,50)+
  '<rect x="8" y="64" width="34" height="24" rx="6" fill="url(#q2)"'+ST+'/><rect x="78" y="56" width="34" height="32" rx="6" fill="url(#q2)"'+ST+'/><rect x="38" y="42" width="44" height="46" rx="7" fill="url(#q1)"'+ST+'/>'+
  ['٣','١','٢'].map(function(t,i){var xs=[25,60,95],ys=[83,76,80];return '<text x="'+xs[i]+'" y="'+ys[i]+'" text-anchor="middle" font-size="19" font-weight="800" fill="#fff" stroke="#3a2b4d" stroke-width="3" paint-order="stroke" style="font-family:Tajawal,Arial,sans-serif">'+(ls("athar_num_fmt")==="en"?[3,1,2][i]:t)+'</text>'}).join('')+
  '<path d="M46 8H74V22A14 14 0 0 1 46 22Z" fill="url(#q3)"'+ST+'/><path d="M46 12H38A8 10 0 0 0 48 28M74 12H82A8 10 0 0 1 72 28" fill="none"'+ST+'/><rect x="56" y="34" width="8" height="6" fill="#f2a91d"'+S2+'/><rect x="50" y="38" width="20" height="6" rx="3" fill="url(#q3)"'+S2+'/><rect x="52" y="13" width="4" height="12" rx="2" fill="#fff" opacity=".6"/></svg>'},
adhkar:function(){
  return '<svg class="art" viewBox="0 0 120 96" width="120" height="96" aria-hidden="true"><defs>'+LGW+'</defs>'+sh(60,91,48)+
  '<path d="M16 90V12H104" fill="none" stroke="#3a2b4d" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 90V12H104" fill="none" stroke="#2fc9b5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'+
  '<ellipse cx="60" cy="86" rx="30" ry="6" fill="#14b8a6"'+S2+'/>'+lantern(40,24,1.1,"#14b8a6")+lantern(66,30,1.3,"#0fa090")+lantern(92,22,1.0,"#14b8a6")+'</svg>'}
};
var B=[
 {k:"valley",d:"doorValley",x:110,y:286,w:170,h:150,l:"الوادي",ax:195,ay:572},
 {k:"hifz",d:"doorHifz",x:256,y:172,w:120,h:120,l:"أحفظ القرآن",ax:214,ay:288},
 {k:"noor",d:"doorLang",x:14,y:172,w:120,h:120,l:"القاعدة النورانية",ax:176,ay:288},
 {k:"math",d:"doorMath",x:256,y:436,w:120,h:120,l:"عالم الأرقام",ax:214,ay:552},
 {k:"lib",d:"doorLib",x:14,y:436,w:120,h:120,l:"مكتبتي",ax:176,ay:552},
 {k:"quiz",d:"doorQuiz",x:256,y:560,w:120,h:120,l:"المسابقات",ax:214,ay:676},
 {k:"adhkar",d:"doorAdhkar",x:14,y:560,w:120,h:120,l:"أذكاري",ax:176,ay:676}
];
var HOME={ax:195,ay:702};
var POSE={idle:[.27,.6],hello:[.22,.6],think:[.25,.6],joy:[.2,.85]};
var CLOUD='<svg viewBox="0 0 96 52" aria-hidden="true"><path d="M14 46C0 46 0 28 14 27C14 12 34 8 40 20C46 6 70 8 72 24C88 20 96 40 82 46Z"/></svg>';

/* ---------- بناء العالم ---------- */
var world=D.createElement("div");world.id="homeWorld";
var h='<div class="w-sky"></div><div class="w-glow"></div>'+
 '<div class="w-hill h1"><svg viewBox="0 0 400 200" preserveAspectRatio="none"><path d="M0 70C50 20 110 30 170 60S300 20 400 55V200H0Z"/></svg></div>'+
 '<div class="w-hill h2"><svg viewBox="0 0 400 200" preserveAspectRatio="none"><path d="M0 50C70 20 120 70 200 45S330 10 400 50V200H0Z"/></svg></div>'+
 '<div class="w-hill h3"><svg viewBox="0 0 400 200" preserveAspectRatio="none"><path d="M0 40C80 10 150 50 220 30S340 25 400 38V200H0Z"/></svg></div>'+
 '<div class="w-stage" id="wStage"><div id="wSky"></div>';
var CL=[[120,120,-5,96],[150,150,-60,128],[176,92,-30,150],[204,110,-80,112]];
CL.forEach(function(c,i){h+='<div class="w-cl" style="top:'+c[0]+'px;width:'+c[1]+'px;animation-duration:'+c[3]+'s;animation-delay:'+c[2]+'s"><span class="w-cu" data-i="'+i+'">'+CLOUD+'</span></div>'});
h+='<div id="wLanterns"></div><div class="w-lower" id="wLower"><svg class="w-path" viewBox="0 0 390 704" height="704" aria-hidden="true"><g fill="none" stroke-linecap="round"><path class="g" stroke="rgba(255,248,205,.42)" stroke-width="15" d="M195 704C200 650 190 610 195 572S198 480 195 442M195 442C130 434 52 404 66 300M195 442C260 434 338 404 324 300M195 552H138M195 552H252M195 676H138M195 676H252"/><path stroke="#fff6c0" stroke-width="4" stroke-dasharray="1 13" d="M195 704C200 650 190 610 195 572S198 480 195 442M195 442C130 434 52 404 66 300M195 442C260 434 338 404 324 300M195 552H138M195 552H252M195 676H138M195 676H252"/></g></svg>';
B.forEach(function(b){
  var big=b.k==="valley";
  h+='<button type="button" class="wb" id="wb-'+b.k+'" data-k="'+b.k+'" aria-label="'+b.l+'" style="left:'+b.x+'px;top:'+b.y+'px;width:'+b.w+'px;height:'+b.h+'px">'+ART[b.k]()+'<i class="bd" hidden></i><span class="lb">'+b.l+'</span></button>'});
h+='<button type="button" class="ath" id="wAthar" aria-label="أثر"><span class="ath-nl"></span><span class="ath-j"><span class="ath-b"><span class="ath-br">'+
 ['idle','hello','joy','think'].map(function(n){return '<img class="p" data-p="'+n+'" src="next/home/img/'+n+'.webp" alt="" draggable="false">'}).join('')+
 '<span class="ath-hint"></span><span class="ath-halo"></span></span></span></span></button></div></div><div id="wDusk"></div><div id="wProf"></div><div id="wDock"></div>';
world.innerHTML=h;
view.insertBefore(world,view.firstChild);
var stage=$("wStage"),lower=$("wLower"),ath=$("wAthar"),dusk=$("wDusk"),app=$("app");
var halo=ath.querySelector(".ath-halo"),hint=ath.querySelector(".ath-hint"),hills=world.querySelectorAll(".w-hill");
var bEl={};B.forEach(function(b){bEl[b.k]=$("wb-"+b.k)});
/* نقل ما يجب بقاؤه ظاهرًا */
var pb=$("profileBar"),pk=$("packBanner");
if(pb)$("wProf").appendChild(pb);
if(pk){$("wDock").appendChild(pk);new MutationObserver(function(){if(active)layout()}).observe(pk,{attributes:true,childList:true})}

/* ---------- حالة ووقت ---------- */
var st=jget(KEY()),first=!st.seen&&qs.get("first")!=="0"||qs.get("first")==="1";
var per="day",late=false;
function period(){
  var t=qs.get("t"),hr=qs.get("h");hr=hr!=null?+hr:new Date().getHours();
  per=t||(hr>=5&&hr<11?"morning":hr>=11&&hr<15?"day":hr>=15&&hr<19?"evening":"night");
  late=per==="night"&&(hr>=21||hr<5);
  world.className=world.className.replace(/\bw-(morning|day|evening|night)\b/g,"").trim()+" w-"+per;
  world.classList.toggle("w-late",late);
}
/* ---------- تخطيط ---------- */
var sc=1,ex=0;
function layout(){
  if(!view.classList.contains("active"))return;
  var vh=D.documentElement.clientHeight||W.innerHeight,top=world.getBoundingClientRect().top;
  var pbn=$("packBanner"),res=pbn&&!pbn.hidden&&!pbn.classList.contains("ok")?44:0;
  var H=Math.max(420,vh-top),Hs=H-res;
  world.style.height=H+"px";app.classList.toggle("hw-pk",res>0);
  var w=world.clientWidth;
  sc=Math.min(w/390,Hs/704);
  ex=Math.max(0,Hs/sc-704);
  stage.style.height=(704+ex)+"px";
  stage.style.transform="translate("+((w-390*sc)/2)+"px,0) scale("+sc+")";
  lower.style.top=ex+"px";
  hills[0].style.height=hills[1].style.height=hills[2].style.height="";
  placeHalo();
  setPose(curPose);
}
/* ---------- أثر ---------- */
var curPose="idle",ax=HOME.ax,ay=HOME.ay;
var PW={idle:47.6,hello:57.2,joy:73,think:44.5};
function setPose(p){
  curPose=p;
  Array.prototype.forEach.call(ath.querySelectorAll(".p"),function(i){i.classList.toggle("on",i.dataset.p===p)});
  var f=POSE[p];halo.style.left=(40+(f[0]-.5)*PW[p]-46)+"px";halo.style.top=(134*f[1]-46)+"px";
  hint.style.left=(40+(f[0]-.5)*PW[p]-35)+"px";hint.style.top=(134*f[1]-35)+"px";
  var nl=ath.querySelector(".ath-nl");nl.style.left=(40+(f[0]-.5)*PW[p])+"px";nl.style.top=(134*f[1])+"px";
}
function placeHalo(){
  var a=ath.getBoundingClientRect(),w=world.getBoundingClientRect();
  world.style.setProperty("--lx",(a.left-w.left+a.width*.35)+"px");world.style.setProperty("--ly",(a.top-w.top+a.height*.6)+"px");
}
function put(x,y,dur,instant){
  ax=x;ay=y;
  if(instant){ath.classList.add("nm");}
  else ath.style.transitionDuration=dur+"s";
  ath.style.transform="translate("+(x-40)+"px,"+(y-134)+"px)";
  if(instant){void ath.offsetWidth;ath.classList.remove("nm");}
}
var T={};
function later(n,f,ms){clearTimeout(T[n]);T[n]=setTimeout(f,ms)}
function stopT(){for(var k in T)clearTimeout(T[k]);T={}}
function poseFor(ms,p){setPose(p);later("pose",function(){setPose("idle")},ms)}
function jump(){
  if(RM){poseFor(800,"joy");return}
  ath.classList.remove("jump");void ath.offsetWidth;ath.classList.add("jump");
  ath.classList.add("glow");poseFor(900,"joy");later("gl",function(){ath.classList.remove("glow","jump")},950);
  armLook(8000);
}
function look(){
  if(!active||pending||first)return;
  setPose("think");ath.classList.add("lk","lkh");
  later("lkend",function(){ath.classList.remove("lk","lkh");setPose("idle");armLook(late?30000:16000)},late?900:2700);
}
function armLook(ms){if(RM||late)return;later("look",look,ms)}
function placeLast(){
  var b=B.filter(function(x){return x.k===(jget(KEY()).last)})[0];
  if(b){put(b.ax,b.ay,0,true);setPose("hello");later("pose",function(){setPose("idle")},1500);
    ath.classList.remove("glow");void ath.offsetWidth;ath.classList.add("glow");later("gl",function(){ath.classList.remove("glow")},900)}
  else put(HOME.ax,HOME.ay,0,true);
}
/* ---------- فتح الأبواب ---------- */
var pending=null,guard=0;
function go(b){
  var el=$(b.d);
  var s=jget(KEY());s.seen=1;s.last=b.k;s.t=Date.now();lset(KEY(),JSON.stringify(s));
  pending=null;ath.classList.remove("walk");
  if(el)el.click();else if(b.k==="valley")location.href="valley/";
}
function walkTo(b){
  if(pending){var p=pending;clearTimeout(p.t);go(p.b);return}
  var el=bEl[b.k];el.classList.remove("jel");void el.offsetWidth;el.classList.add("jel");
  clearTimeout(T.look);
  if(RM){pending={b:b,t:setTimeout(function(){go(b)},140)};return}
  var dx=b.ax-ax,dy=b.ay-ay,dist=Math.sqrt(dx*dx+dy*dy),dur=Math.min(.9,Math.max(.45,.4+dist/900));
  ath.classList.add("walk");setPose("idle");put(b.ax,b.ay,dur);
  pending={b:b,t:setTimeout(function(){ath.classList.remove("walk");setPose("hello");pending.t=setTimeout(function(){go(b)},140)},dur*1000+30)};
}
B.forEach(function(b){
  var el=bEl[b.k];
  el.addEventListener("pointerdown",function(){el.classList.add("pr")});
  ["pointerup","pointercancel","pointerleave"].forEach(function(n){el.addEventListener(n,function(){el.classList.remove("pr")})});
  el.addEventListener("click",function(){if(!first&&Date.now()>guard)walkTo(b)});
});
ath.addEventListener("click",function(){if(first||Date.now()<guard){ignite();return}if(pending){var p=pending;clearTimeout(p.t);go(p.b);return}jump()});
/* ---------- أول مرة ---------- */
var seq=null;
function finishSeq(){
  if(!seq)return;guard=Date.now()+600;clearTimeout(seq.t);seq=null;
  B.forEach(function(b){bEl[b.k].classList.add("on")});
  world.classList.remove("w-first");first=false;
  var v=bEl.valley;v.classList.add("pulse");setTimeout(function(){v.classList.remove("pulse")},8200);
  armLook(9000);
}
function ignite(){
  if(!first||seq)return;guard=Date.now()+600;
  var s=jget(KEY());s.seen=1;lset(KEY(),JSON.stringify(s));
  placeHalo();dusk.classList.add("off");dusk.style.pointerEvents="none";
  ath.classList.add("glow");setPose("hello");later("gl",function(){ath.classList.remove("glow");setPose("idle")},1400);
  var order=["adhkar","quiz","lib","math","valley","noor","hifz"],i=0;
  seq={t:0};
  if(RM){seq=null;first=false;world.classList.remove("w-first");B.forEach(function(b){bEl[b.k].classList.add("on")});return}
  (function step(){
    if(!seq)return;
    var e=bEl[order[i++]];e.classList.add("on","flash");
    if(i<order.length)seq.t=setTimeout(step,560);else seq.t=setTimeout(finishSeq,900);
  })();
  seq.t=setTimeout(function(){},0);
  /* لمسة أثناء التتابع تتخطاه */
  var skip=function(){if(seq){finishSeq()}stage.removeEventListener("pointerdown",skip,true)};
  setTimeout(function(){stage.addEventListener("pointerdown",skip,true)},350);
}
dusk.addEventListener("pointerdown",function(e){e.preventDefault();ignite()});
/* ---------- شارات التقدّم الحقيقي ---------- */
function setBd(k,t){var e=bEl[k].querySelector(".bd");if(t){e.textContent=t;e.hidden=false}else e.hidden=true}
function cnt(o,f){var n=0;for(var k in o){if(f?f(o[k]):o[k])n++}return n}
function badges(){
  try{
    var p=pid(),pg=jget(p==="p1"?"athar_quran_progress_v1":"athar_quran_progress_v1_"+p);
    var q=cnt(pg,function(v){return v==="trained"||v==="memorized"||v==="review"});
    setBd("hifz",q?nm(q)+" آية":"");
    var n=cnt(jget("athar_noor_v1_"+p),function(v){return +v>0});setBd("noor",n?nm(n)+"/"+nm(105):"");
    n=cnt(jget("athar_adhkar_v1_"+p),function(v){return +v>0});setBd("adhkar",n?nm(n)+"/"+nm(13):"");
    n=cnt(jget("athar_ayq_v1_"+p),function(v){return +v>0});setBd("quiz",n?nm(n)+"/"+nm(10):"");
    var m=jget("athar_mis_v1_"+p),d=new Date(),ds=d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2);
    var md=m&&m.done&&m.done.math&&(m.date===ds||!m.date);setBd("math",md?"✓":"");
    var ch=0,re=new RegExp("^athar_([a-z0-9]+)_v1_"+p+"$"),ex2={noor:1,adhkar:1,ayq:1,days:1,mis:1,quran:1,brain:1,home:1};
    for(var i=0;i<localStorage.length;i++){var kk=localStorage.key(i),mm=re.exec(kk||"");if(mm&&!ex2[mm[1]])ch+=cnt(jget(kk))}
    setBd("lib",ch?nm(ch)+" فصل":"");
  }catch(e){}
  var vb=$("doorValleyBadge");setBd("valley",vb&&!vb.hidden&&!vb.hasAttribute("hidden")?"حصة اليوم":"");
}
/* ---------- غيوم تُسحب + ميل ---------- */
var clouds=[],drag=null,tx=0,ty=0,cx=0,cy=0,raf=0;
Array.prototype.forEach.call(world.querySelectorAll(".w-cu"),function(e,i){clouds[i]={e:e,x:0,v:0,drag:false}});
function tick(){
  raf=0;var busy=false,i,c;
  for(i=0;i<clouds.length;i++){c=clouds[i];
    if(!c.drag){
      if(Math.abs(c.v)>.05){c.x+=c.v;c.v*=.93;busy=true}
      else if(Math.abs(c.x)>.5){c.x*=.985;busy=true}else{c.x=0;c.v=0}
    }
    c.e.style.transform=c.x?"translate3d("+c.x.toFixed(1)+"px,0,0)":"";
  }
  cx+=(tx-cx)*.1;cy+=(ty-cy)*.1;
  if(Math.abs(tx-cx)>.05||Math.abs(ty-cy)>.05)busy=true;
  hills[0].style.transform="translate3d("+(cx*.3).toFixed(2)+"px,"+(cy*.15).toFixed(2)+"px,0)";
  hills[1].style.transform="translate3d("+(cx*.6).toFixed(2)+"px,"+(cy*.3).toFixed(2)+"px,0)";
  hills[2].style.transform="translate3d("+(cx).toFixed(2)+"px,"+(cy*.5).toFixed(2)+"px,0)";
  if(busy||drag)raf=requestAnimationFrame(tick);
}
function kick(){if(!raf&&active)raf=requestAnimationFrame(tick)}
world.addEventListener("pointerdown",function(e){
  armLook(8000);
  var cu=e.target.closest&&e.target.closest(".w-cu");
  if(cu){var c=clouds[+cu.dataset.i];drag={c:c,x0:e.clientX,cx:c.x,lx:e.clientX,t:performance.now(),moved:false,id:e.pointerId,el:cu};c.drag=true;c.v=0;try{cu.setPointerCapture(e.pointerId)}catch(_){}kick()}
});
world.addEventListener("pointermove",function(e){
  if(drag&&e.pointerId===drag.id){
    var dx=e.clientX-drag.x0;if(Math.abs(dx)>6)drag.moved=true;
    var nx=drag.cx+dx/sc,now=performance.now();drag.c.v=(nx-drag.c.x)*.8;drag.c.x=nx;kick();return}
  if(RM||e.pointerType==="mouse"&&!e.buttons&&false)return;
  var r=world.getBoundingClientRect();tx=Math.max(-8,Math.min(8,((e.clientX-r.left)/r.width-.5)*16));ty=Math.max(-8,Math.min(8,((e.clientY-r.top)/r.height-.5)*16));kick();
});
function endDrag(e){
  if(drag&&e.pointerId===drag.id){
    var d=drag;drag=null;d.c.drag=false;
    if(!d.moved){d.c.v=0;d.el.classList.remove("sq");void d.el.offsetWidth;d.el.classList.add("sq");drops(d.el)}
    kick();return}
  tx=ty=0;kick();
}
world.addEventListener("pointerup",endDrag);world.addEventListener("pointercancel",endDrag);
function drops(el){
  if(RM)return;var host=el.parentNode,i;
  for(i=0;i<5;i++){var s=D.createElement("i");s.className="w-dr";s.style.left=(18+Math.random()*64)+"%";s.style.animationDelay=(i*.08)+"s";host.appendChild(s);(function(s){setTimeout(function(){s.remove()},1500)})(s)}
}
if("DeviceOrientationEvent" in W&&!RM){
  W.addEventListener("deviceorientation",function(e){
    if(!active||e.gamma==null)return;
    tx=Math.max(-8,Math.min(8,e.gamma/4));ty=Math.max(-8,Math.min(8,((e.beta||45)-45)/6));kick();
  },{passive:true});
}
/* ---------- دخول/خروج الرئيسية ---------- */
var active=false;
function enter(){
  if(active)return;active=true;
  app.classList.add("hw-on");world.classList.remove("w-paused");
  period();layout();badges();requestAnimationFrame(layout);setTimeout(layout,400);
  if(first){world.classList.add("w-first");dusk.classList.remove("off");put(HOME.ax,HOME.ay,0,true);setPose("think");
    B.forEach(function(b){bEl[b.k].classList.remove("on")});placeHalo()}
  else{world.classList.remove("w-first");placeLast();armLook(8000)}
  mountSky();
}
function leave(){
  if(!active)return;active=false;
  app.classList.remove("hw-on");world.classList.add("w-paused");
  if(raf){cancelAnimationFrame(raf);raf=0}
  stopT();if(pending){clearTimeout(pending.t);pending=null}
  ath.classList.remove("walk","lk","lkh","glow","jump");
}
function sync(){view.classList.contains("active")?enter():leave()}
new MutationObserver(sync).observe(view,{attributes:true,attributeFilter:["class"]});
D.addEventListener("visibilitychange",function(){
  if(D.hidden){world.classList.add("w-paused");if(raf){cancelAnimationFrame(raf);raf=0}stopT()}
  else if(active){world.classList.remove("w-paused");period();badges();armLook(8000);kick()}
});
W.addEventListener("pageshow",function(e){if(e.persisted&&active){badges();placeLast();world.classList.remove("w-paused")}});
W.addEventListener("resize",function(){layout()});
W.addEventListener("orientationchange",function(){setTimeout(layout,200)});
/* مراقبة شارة الوادي (تُحقن متأخرة) */
(function(){var n=0,t=setInterval(function(){var vb=$("doorValleyBadge");if(vb){clearInterval(t);new MutationObserver(badges).observe(vb,{attributes:true});badges()}else if(++n>80)clearInterval(t)},150)})();
/* ---------- عقد A2 ---------- */
var mounted=false;
function mountSky(){
  if(mounted||!W.AtharSky||!W.AtharSky.mount)return;
  try{W.AtharSky.mount({lanterns:$("wLanterns"),sky:$("wSky")});mounted=true}catch(e){}
}
W.addEventListener("load",function(){mountSky();layout()});
W.AtharWorld={mountSky:mountSky,refresh:function(){period();badges()}};
sync();
if(!active)world.classList.add("w-paused");
})();
