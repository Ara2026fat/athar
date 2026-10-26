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
var ST=' stroke="#3a2b4d" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
var S2=' stroke="#3a2b4d" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"';
function lg(id,a,b){return '<linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></linearGradient>'}
function sh(cx,cy,rx){return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="6" fill="rgba(40,30,60,.25)"/>'}
function gl(x,y,rx,ry,r){return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity=".34" transform="rotate('+(r||-18)+' '+x+' '+y+')"/>'}
function lantern(x,y,k,c,sw){
return '<g transform="translate('+x+','+y+') scale('+k+')"><g'+(sw?' class="lan" style="animation-duration:'+sw[0]+'s;animation-delay:-'+sw[2]+'s;--a:'+sw[1]+'deg"':'')+'><path d="M0 -14V0" fill="none"'+S2+'/><path d="M-9 8L0 0L9 8Z" fill="'+c+'"'+S2+'/><rect x="-8" y="8" width="16" height="22" rx="5" fill="url(#lgw)"'+S2+'/><rect x="-4" y="12" width="3" height="12" rx="1.5" fill="#fff" opacity=".6"/><rect x="-6" y="30" width="12" height="5" rx="2.5" fill="'+c+'"'+S2+'/></g></g>'}
var LGW='<radialGradient id="lgw"><stop offset="0" stop-color="#fffbd0"/><stop offset="1" stop-color="#ffc94d"/></radialGradient>';
var ART={
valley:function(){
var s='',i,a;
for(i=0;i<=6;i++){a=Math.PI*i/6;s+='<circle cx="'+(85-62*Math.cos(a)).toFixed(1)+'" cy="'+(64-48*Math.sin(a)).toFixed(1)+'" r="2.8" fill="#ffd24d" stroke="#3a2b4d" stroke-width="1.4"/>'}
return '<svg class="art" viewBox="0 0 170 128" width="170" height="128" aria-hidden="true"><defs>'+lg("v1","#fff0c9","#f1c985")+lg("v2","#8fd3ff","#ffe6bd")+lg("v3","#ffe27a","#f5b43a")+LGW+
'<radialGradient id="v4"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><clipPath id="vc"><path d="M34 122V68A51 40 0 0 1 136 68V122Z"/></clipPath></defs>'+sh(85,122,76)+
'<path d="M12 122V64A73 56 0 0 1 158 64V122Z" fill="url(#v1)"'+ST+'/>'+
'<g clip-path="url(#vc)"><rect x="30" y="20" width="110" height="104" fill="#bfe6ff"/><image href="next/home/img/doors/valley_win.webp" x="30" y="20" width="110" height="104" preserveAspectRatio="xMidYMid slice"/></g>'+

'<path d="M34 122V68A51 40 0 0 1 136 68V122" fill="none"'+ST+'/>'+s+lantern(85,28,.8,"#e9a23b",[4.2,5,0])+
'<rect x="71" y="0" width="28" height="15" rx="6" fill="url(#v3)"'+ST+'/>'+gl(52,40,16,6,-35)+
'<rect x="20" y="114" width="130" height="10" rx="5" fill="#f4d9a4"'+ST+'/></svg>'},
hifz:function(){
return '<svg class="art" viewBox="0 0 120 96" width="120" height="96" aria-hidden="true"><defs>'+lg("h1","#5eea8f","#1f9d4d")+lg("h2","#fff6dc","#f1d79a")+'</defs>'+sh(60,90,48)+
'<g transform="translate(6,0)"><rect x="90" y="30" width="14" height="58" rx="4" fill="url(#h2)"'+ST+'/><path d="M89 31L97 10L105 31Z" fill="url(#h1)"'+ST+'/><rect class="win" x="94" y="42" width="6" height="11" rx="3"'+S2+'/><ellipse class="wg" cx="97" cy="47.5" rx="7" ry="10" fill="#ffe48a"/>'+
'<rect x="6" y="50" width="84" height="38" rx="8" fill="url(#h2)"'+ST+'/><path d="M18 52A30 30 0 0 1 78 52Z" fill="url(#h1)"'+ST+'/><path d="M48 22V11" fill="none"'+ST+'/><circle class="fin" cx="48" cy="9" r="4.5" fill="#ffd24d"'+S2+'/>'+gl(38,36,9,4)+
'<path d="M38 88V73a10 10 0 0 1 20 0V88Z" class="win"'+ST+'/><ellipse class="wg" cx="48" cy="80" rx="10" ry="9" fill="#ffe48a"/><rect class="win" x="14" y="62" width="11" height="16" rx="5.5"'+S2+'/><rect class="win" x="71" y="62" width="11" height="16" rx="5.5"'+S2+'/></g></svg>'},
noor:function(){
return '<svg class="art" viewBox="0 0 120 96" width="120" height="96" aria-hidden="true"><defs>'+lg("n1","#ffb25e","#f2670f")+lg("n2","#2c7a5c","#1b5440")+'</defs>'+sh(60,91,46)+
'<path d="M32 70L22 90M88 70L98 90M60 70V88" fill="none"'+ST+'/><rect x="10" y="6" width="100" height="66" rx="9" fill="url(#n1)"'+ST+'/><rect x="18" y="14" width="84" height="50" rx="4" fill="url(#n2)"'+S2+'/>'+
'<text x="86" y="48" text-anchor="middle" font-size="30" font-weight="800" fill="#fff8d6" style="font-family:Tajawal,Arial,sans-serif">أ</text><text x="60" y="48" text-anchor="middle" font-size="30" font-weight="800" fill="#fff8d6" style="font-family:Tajawal,Arial,sans-serif">ب</text><text class="chk" x="34" y="48" text-anchor="middle" font-size="30" font-weight="800" fill="#fff8d6" style="font-family:Tajawal,Arial,sans-serif">ج</text>'+
'<rect x="30" y="66" width="60" height="8" rx="4" fill="#ffd9a8"'+S2+'/><rect x="38" y="62" width="10" height="4" rx="2" fill="#fff"/><rect x="52" y="63" width="8" height="3" rx="1.5" fill="#ffd24d"/>'+gl(30,24,10,4,-25)+'</svg>'},
math:function(){
var cs=[["#ffc033","#f09a07"],["#53c4f7","#1e8fd0"],["#ff7fb5","#e1457f"],["#8be07a","#3fae43"]],d=[1,2,3,4].map(nm),xs=[80,44,8],i,s='';
var df='';for(i=0;i<4;i++)df+=lg("m"+i,cs[i][0],cs[i][1]);
for(i=0;i<3;i++)s+='<g class="sw s'+i+'"><g class="jp"><rect x="'+xs[i]+'" y="52" width="32" height="34" rx="8" fill="url(#m'+i+')"'+ST+'/><rect x="'+(xs[i]+5)+'" y="57" width="12" height="4" rx="2" fill="#fff" opacity=".5"/><text x="'+(xs[i]+16)+'" y="78" text-anchor="middle" font-size="22" font-weight="800" fill="#fff" stroke="#3a2b4d" stroke-width="3" paint-order="stroke" style="font-family:Tajawal,Arial,sans-serif">'+d[i]+'</text></g></g>';
s+='<g class="sw s3"><g class="jp"><g transform="rotate(-7 60 36)"><rect x="44" y="16" width="32" height="34" rx="8" fill="url(#m3)"'+ST+'/><rect x="49" y="21" width="12" height="4" rx="2" fill="#fff" opacity=".5"/><text x="60" y="43" text-anchor="middle" font-size="22" font-weight="800" fill="#fff" stroke="#3a2b4d" stroke-width="3" paint-order="stroke" style="font-family:Tajawal,Arial,sans-serif">'+d[3]+'</text></g></g></g>';
return '<svg class="art" viewBox="0 0 120 96" width="120" height="96" aria-hidden="true"><defs>'+df+'</defs>'+sh(60,90,50)+s+'</svg>'},
lib:function(){
var c=["#fbbf24","#f472b6","#34d399","#60a5fa","#fb923c","#fde68a","#c084fc"],i,s='',x,h;
for(i=0;i<7;i++){x=24+i*10.4;h=[22,26,20,27,23,25,21][i];s+='<rect x="'+x.toFixed(1)+'" y="'+(46-h)+'" width="9" height="'+h+'" rx="2" fill="'+c[i]+'"'+S2+'/>'}
for(i=0;i<6;i++){x=24+i*10.4;h=[24,20,26,22,25,21][i];s+='<rect x="'+x.toFixed(1)+'" y="'+(76-h)+'" width="9" height="'+h+'" rx="2" fill="'+c[(i+3)%7]+'"'+S2+'/>'}
s+='<g class="bk"><g transform="rotate(14 92 76)"><rect x="86" y="52" width="9" height="24" rx="2" fill="#f87171"'+S2+'/></g></g>';
return '<svg class="art" viewBox="0 0 120 96" width="120" height="96" aria-hidden="true"><defs>'+lg("l1","#b78cf8","#7a37e8")+'</defs>'+sh(60,91,46)+
'<rect x="12" y="6" width="96" height="82" rx="9" fill="url(#l1)"'+ST+'/><rect x="20" y="14" width="80" height="66" rx="4" fill="#4b1d95"'+S2+'/>'+s+
'<rect x="20" y="46" width="80" height="5" rx="2" fill="#d9b8ff"'+S2+'/><rect x="20" y="76" width="80" height="5" rx="2" fill="#d9b8ff"'+S2+'/>'+gl(26,18,10,4,-20)+'</svg>'},
quiz:function(){
return '<svg class="art" viewBox="0 0 120 96" width="120" height="96" aria-hidden="true"><defs>'+lg("q1","#ff86bd","#e0407c")+lg("q2","#ffb3d6","#f06aa4")+lg("q3","#ffe27a","#f2a91d")+'</defs>'+sh(60,91,50)+
'<rect x="8" y="64" width="34" height="24" rx="6" fill="url(#q2)"'+ST+'/><rect x="78" y="56" width="34" height="32" rx="6" fill="url(#q2)"'+ST+'/><rect x="38" y="42" width="44" height="46" rx="7" fill="url(#q1)"'+ST+'/>'+
['٣','١','٢'].map(function(t,i){var xs=[25,60,95],ys=[83,76,80];return '<text x="'+xs[i]+'" y="'+ys[i]+'" text-anchor="middle" font-size="19" font-weight="800" fill="#fff" stroke="#3a2b4d" stroke-width="3" paint-order="stroke" style="font-family:Tajawal,Arial,sans-serif">'+(ls("athar_num_fmt")==="en"?[3,1,2][i]:t)+'</text>'}).join('')+
'<path d="M46 8H74V22A14 14 0 0 1 46 22Z" fill="url(#q3)"'+ST+'/><path d="M46 12H38A8 10 0 0 0 48 28M74 12H82A8 10 0 0 1 72 28" fill="none"'+ST+'/><rect x="56" y="34" width="8" height="6" fill="#f2a91d"'+S2+'/><rect x="50" y="38" width="20" height="6" rx="3" fill="url(#q3)"'+S2+'/><rect x="52" y="13" width="4" height="12" rx="2" fill="#fff" opacity=".6"/><path class="spk" d="M70 4L72 10L78 12L72 14L70 20L68 14L62 12L68 10Z" fill="#fffbe0" stroke="#f2a91d" stroke-width="1"/></svg>'},
adhkar:function(){
return '<svg class="art" viewBox="0 0 120 96" width="120" height="96" aria-hidden="true"><defs>'+LGW+'</defs>'+sh(60,91,48)+
'<path d="M16 90V12H104" fill="none" stroke="#3a2b4d" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 90V12H104" fill="none" stroke="#2fc9b5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'+
'<ellipse cx="60" cy="86" rx="30" ry="6" fill="#14b8a6"'+S2+'/>'+lantern(40,24,1.1,"#14b8a6",[3.4,7,0])+lantern(66,30,1.3,"#0fa090",[4.1,6,1.3])+lantern(92,22,1.0,"#14b8a6",[3.7,8,2.1])+'</svg>'}
};
var B=[
{k:"valley",d:"doorValley",x:110,y:286,w:170,h:150,l:"الوادي",ax:195,ay:600},
{k:"hifz",d:"doorHifz",x:256,y:172,w:120,h:120,l:"أحفظ القرآن",ax:210,ay:288},
{k:"noor",d:"doorLang",x:14,y:172,w:120,h:120,l:"القاعدة النورانية",ax:180,ay:288},
{k:"math",d:"doorMath",x:256,y:436,w:120,h:120,l:"عالم الأرقام",ax:210,ay:590},
{k:"lib",d:"doorLib",x:14,y:436,w:120,h:120,l:"مكتبتي",ax:180,ay:590},
{k:"quiz",d:"doorQuiz",x:256,y:560,w:120,h:120,l:"المسابقات",ax:210,ay:690},
{k:"adhkar",d:"doorAdhkar",x:14,y:560,w:120,h:120,l:"أذكاري",ax:180,ay:690}
];
var HOME={ax:195,ay:702},AH=152;
var POSE={idle:[.27,.6],hello:[.22,.6],think:[.25,.6],joy:[.2,.85]};
var CN=['ذهبي','أزرق','أخضر','وردي','بنفسجي'];
var COLS=[['255,206,100','255,230,150'],['70,200,240','170,236,255'],['90,210,130','190,246,200'],['255,120,180','255,200,225'],['170,125,250','215,195,255']];
var CLOUD='<svg viewBox="0 0 96 52" aria-hidden="true"><path d="M14 46C0 46 0 28 14 27C14 12 34 8 40 20C46 6 70 8 72 24C88 20 96 40 82 46Z"/></svg>';
var world=D.createElement("div");world.id="homeWorld";
var h='<div class="w-sky"></div><div class="w-glow"></div>'+
'<div class="w-hill h0"><svg viewBox="0 0 400 200" preserveAspectRatio="none"><path d="M0 60C40 30 80 36 120 52S190 20 250 40S340 24 400 46V200H0Z"/></svg></div>'+
'<div class="w-hill h1"><svg viewBox="0 0 400 200" preserveAspectRatio="none"><path d="M0 70C50 20 110 30 170 60S300 20 400 55V200H0Z"/></svg></div>'+
'<div class="w-hill h2"><svg viewBox="0 0 400 200" preserveAspectRatio="none"><path d="M0 50C70 20 120 70 200 45S330 10 400 50V200H0Z"/></svg></div>'+
'<div class="w-hill h3"><svg viewBox="0 0 400 200" preserveAspectRatio="none"><path d="M0 40C80 10 150 50 220 30S340 25 400 38V200H0Z"/></svg></div>'+
'<div class="w-stage" id="wStage"><div id="wSky"></div>';
var CL=[[120,120,-5,96],[150,150,-60,128],[176,92,-30,150],[204,110,-80,112]];
CL.forEach(function(c,i){h+='<div class="w-cl" style="top:'+c[0]+'px;width:'+c[1]+'px;animation-duration:'+c[3]+'s;animation-delay:'+c[2]+'s"><span class="w-cu" data-i="'+i+'">'+CLOUD+'</span></div>'});
h+='<div id="wFall" aria-hidden="true"></div><div id="wLanterns"></div><div class="w-lower" id="wLower"><svg class="w-path" viewBox="0 0 390 704" height="704" aria-hidden="true"><g fill="none" stroke-linecap="round"><path class="g" stroke-width="15" d="M195 704C200 650 190 610 195 572S198 480 195 442M195 442C130 434 52 404 66 300M195 442C260 434 338 404 324 300M195 590H138M195 590H252M195 690H138M195 690H252"/><path class="d" stroke-width="4" stroke-dasharray="1 13" d="M195 704C200 650 190 610 195 572S198 480 195 442M195 442C130 434 52 404 66 300M195 442C260 434 338 404 324 300M195 590H138M195 590H252M195 690H138M195 690H252"/></g></svg>';
B.forEach(function(b){
var big=b.k==="valley";
h+='<button type="button" class="wb" id="wb-'+b.k+'" data-k="'+b.k+'" aria-label="'+b.l+'" style="left:'+b.x+'px;top:'+b.y+'px;width:'+b.w+'px;height:'+b.h+'px">'+ART[b.k]()+'<i class="bd" hidden></i><span class="lb">'+b.l+'</span></button>'});
h+='<button type="button" class="ath" id="wAthar" aria-label="أثر"><span class="ath-sh"></span><span class="ath-nl"></span><span class="ath-j"><span class="ath-b"><span class="ath-br"><span class="ath-halo"></span>'+
['idle','hello','joy','think'].map(function(n){return '<img class="p" data-p="'+n+'" src="next/home/img/'+n+'.webp" alt="" draggable="false">'}).join('')+
'<span class="ath-hint"></span><span class="ath-core"></span></span></span></span><i class="ath-dot"></i></button>'+
'<div class="w-pop w-peek" id="wPeek" role="status" aria-live="polite" hidden><b></b><span></span><button type="button" class="go">افتح</button></div>'+
'<div class="w-pop w-bub" id="wBub" role="status" aria-live="polite" hidden><span>نتابع؟</span><small></small><button type="button" class="go" aria-label="نعم، نتابع">نعم</button></div>'+
'<div class="w-pop w-pal" id="wPal" hidden>'+COLS.map(function(c,i){return '<button type="button" class="sw" data-i="'+i+'" aria-label="لون الفانوس: '+CN[i]+'" style="background:radial-gradient(circle at 35% 30%,rgb('+c[1]+'),rgb('+c[0]+'))"></button>'}).join('')+'</div></div></div><div id="wDusk" role="button" tabindex="0" aria-label="أضئ الفانوس"></div><div id="wProf"></div><div id="wDock"><button type="button" id="wPkX" aria-label="إخفاء">×</button></div>';
world.innerHTML=h;
view.insertBefore(world,view.firstChild);
var stage=$("wStage"),lower=$("wLower"),ath=$("wAthar"),dusk=$("wDusk"),app=$("app");
var halo=ath.querySelector(".ath-halo"),core=ath.querySelector(".ath-core"),hint=ath.querySelector(".ath-hint"),hills=world.querySelectorAll(".w-hill");
var bEl={};B.forEach(function(b){bEl[b.k]=$("wb-"+b.k)});
/* ===== أبواب مجسّمة (r14): صورة webp لكل باب؛ إن لم توجد يبقى رسم SVG الحالي ===== */
var D3={
noor:{ov:[["أ",.76,.5],["ب",.5,.5],["ج",.24,.5]],fs:.27,col:"#fff8d6"},
math:{ov:[["١",.28,.8],["٢",.5,.8],["٣",.72,.8],["٤",.5,.46]],fs:.2,col:"#fff"},
quiz:{ov:[["٣",.2,.86],["١",.5,.7],["٢",.8,.82]],fs:.18,col:"#fff"},
hifz:{},lib:{},adhkar:{},valley:{}
};
function door3d(k){
 var el=bEl[k],cfg=D3[k];if(!el||!cfg)return;
 var im=new Image();im.decoding="async";
 im.onload=function(){
  var old=el.querySelector(".art");if(!old||el.querySelector(".art3"))return;
  var w=document.createElement("span");w.className="art art3";w.setAttribute("aria-hidden","true");
  im.className="d3";im.alt="";im.draggable=false;w.appendChild(im);
  if(cfg.ov){var o=document.createElement("span");o.className="d3o";
   o.innerHTML=cfg.ov.map(function(g){return '<b style="left:'+(g[1]*100)+'%;top:'+(g[2]*100)+'%;font-size:'+Math.round(cfg.fs*(k==="valley"?170:120))+'px;color:'+cfg.col+'">'+g[0]+'</b>'}).join("");w.appendChild(o)}
  el.replaceChild(w,old);el.classList.add("d3on")};
 im.onerror=function(){};
 im.src="next/home/img/doors/"+k+".webp"}
B.forEach(function(b){door3d(b.k)});
var pb=$("profileBar"),pk=$("packBanner");
if(pb)$("wProf").appendChild(pb);
var pkT=+ls("athar_pk_t")||0,dis=pkT>0&&Date.now()-pkT<6048e5,pkM=false;
function dockShow(){var s=!!(pk&&!pk.hidden&&!pk.classList.contains("ok")&&!dis&&!first);if(s&&!pkM){pkM=true;lset("athar_pk_t",Date.now())}return s}
if(pk){$("wDock").appendChild(pk);new MutationObserver(function(){if(active)layout()}).observe(pk,{attributes:true,childList:true})}
function hideDock(){dis=true;pkM=true;lset("athar_pk_t",Date.now());layout()}
$("wPkX").addEventListener("click",hideDock);
(function(){var d=$("wDock"),x0=0,y0=0,dx=0,dy=0,on=false;
d.addEventListener("pointerdown",function(e){if(e.target.id==="wPkX")return;on=true;x0=e.clientX;y0=e.clientY;dx=dy=0});
d.addEventListener("pointermove",function(e){if(!on)return;dx=e.clientX-x0;dy=Math.max(0,e.clientY-y0);if((Math.abs(dx)>8||dy>8)&&!d._c){d._c=1;try{d.setPointerCapture(e.pointerId)}catch(_){}}if(Math.abs(dx)>8||dy>8)d.style.transform="translate("+dx+"px,"+dy+"px)";d.style.opacity=Math.max(.3,1-Math.max(Math.abs(dx),dy)/200)});
function up(){if(!on)return;on=false;d._c=0;if(dy>45||Math.abs(dx)>80){hideDock();d.style.transform=d.style.opacity=""}else{d.style.transform=d.style.opacity=""}}
d.addEventListener("pointerup",up);d.addEventListener("pointercancel",up)})();
var st=jget(KEY()),first=!st.seen&&qs.get("first")!=="0"||qs.get("first")==="1";
var per="day",late=false;
function period(){
var t=qs.get("t"),hr=qs.get("h");hr=hr!=null?+hr:new Date().getHours();
per=t||(hr>=5&&hr<11?"morning":hr>=11&&hr<15?"day":hr>=15&&hr<19?"evening":"night");
late=per==="night"&&(hr>=21||hr<5);
world.className=world.className.replace(/\bw-(morning|day|evening|night)\b/g,"").trim()+" w-"+per;
world.classList.toggle("w-late",late);
if(skyApi)try{skyApi.setTime(skyTime())}catch(e){}
}
var skyApi=null;function skyTime(){return per==="night"?"night":per==="evening"?"dusk":"day"}
var sc=1,ex=0;
function layout(){
if(!view.classList.contains("active"))return;
var vh=D.documentElement.clientHeight||W.innerHeight,top=world.getBoundingClientRect().top;
var hd=D.querySelector("header"),stTop=hd?Math.max(44,hd.offsetHeight-6):52;
var show=dockShow();$("wDock").style.display=show?"":"none";app.classList.toggle("hw-pk",show);
var res=(!dis&&!first&&pk)?52:0,ls=W.innerWidth>W.innerHeight&&vh<430,H=Math.max(ls?280:420,vh-top),Hs=H-stTop-res;
world.style.height=H+"px";
var w=world.clientWidth;
sc=Math.min(w/390,Hs/704);if(ls)sc=Math.max(sc,.56);world.style.overflowY=ls?"auto":"";
ex=Math.max(0,Hs/sc-704);
stage.style.top=stTop+"px";
stage.style.height=(704+ex)+"px";
stage.style.transform="translate("+((w-390*sc)/2)+"px,0) scale("+sc+")";
lower.style.top=ex+"px";
$("wSky").style.height=(180+ex*.85)+"px";
$("wProf").style.top=(stTop+2)+"px";
placeHalo();
setPose(curPose);
}
var curPose="idle",ax=HOME.ax,ay=HOME.ay;
var PW={idle:151/425*AH,hello:239/560*AH,joy:305/560*AH,think:186/560*AH};
function setPose(p){
curPose=p;
Array.prototype.forEach.call(ath.querySelectorAll(".p"),function(i){i.classList.toggle("on",i.dataset.p===p)});
var f=POSE[p],cx=50+(f[0]-.5)*PW[p],cy=AH*f[1];
halo.style.left=(cx-50)+"px";halo.style.top=(cy-50)+"px";core.style.left=(cx-20)+"px";core.style.top=(cy-20)+"px";
hint.style.left=(cx-35)+"px";hint.style.top=(cy-35)+"px";
var nl=ath.querySelector(".ath-nl");nl.style.left=cx+"px";nl.style.top=cy+"px";
}
function placeHalo(){
var a=ath.getBoundingClientRect(),w=world.getBoundingClientRect();
world.style.setProperty("--lx",(a.left-w.left+a.width*.35)+"px");world.style.setProperty("--ly",(a.top-w.top+a.height*.6)+"px");
}
function put(x,y,dur,instant){
ax=x;ay=y;
if(instant){ath.classList.add("nm");}
else ath.style.transitionDuration=dur+"s";
ath.style.transform="translate("+(x-50)+"px,"+(y-AH)+"px)";
if(instant){void ath.offsetWidth;ath.classList.remove("nm");}
}
function saveSt(o){var s=jget(KEY()),k;for(k in o)s[k]=o[k];lset(KEY(),JSON.stringify(s))}
function setCol(i){var c=COLS[i]||COLS[0];world.style.setProperty("--hc",c[0]);world.style.setProperty("--hcl",c[1]);
Array.prototype.forEach.call($("wPal").querySelectorAll(".sw"),function(b){b.classList.toggle("on",+b.dataset.i===i)})}
setCol(+(st.col||0));
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
var pending=null,guard=0,PV=/home-next/.test(location.pathname)||qs.get("preview")==="1";
function go(b){
var el=$(b.d);
var s=jget(KEY());s.seen=1;s.last=b.k;s.t=Date.now();lset(KEY(),JSON.stringify(s));
pending=null;world.classList.remove("w-busy");ath.classList.remove("walk");
if(b.k==="valley"&&(PV||!el)){try{W.__atharGateSync&&W.__atharGateSync()}catch(e){}location.href=PV?"valley/next.html":"valley/";return}
W.__atharQuietTap=Date.now()+600;if(el)el.click();
}
function steps(x0,y0,x1,y1,d){for(var i=1;i<7;i++){var s=D.createElement("i"),f=i/6;s.className="w-pb";s.style.cssText="left:"+(x0+(x1-x0)*f+(i%2?-8:8))+"px;top:"+(y0+(y1-y0)*f-4)+"px;animation-delay:"+(d*f).toFixed(2)+"s";lower.appendChild(s);setTimeout(function(s){s.remove()}.bind(0,s),(d*f+2.4)*1e3)}}
function walkTo(b){
if(pending){var p=pending;clearTimeout(p.t);if(p.b===b){go(b);return}bEl.valley.classList.remove("opn");pending=null;ath.classList.remove("walk")}   /* آخر نقرة تفوز */
var el=bEl[b.k];el.classList.remove("jel");void el.offsetWidth;el.classList.add("jel");
clearTimeout(T.look);
if(RM){pending={b:b,t:setTimeout(function(){go(b)},140)};return}
var dx=b.ax-ax,dy=b.ay-ay,dist=Math.sqrt(dx*dx+dy*dy),dur=Math.min(.9,Math.max(.45,.4+dist/900));
world.classList.add("w-busy");  ath.classList.add("walk");setPose("idle");steps(ax,ay,b.ax,b.ay,dur);put(b.ax,b.ay,dur);
pending={b:b,t:setTimeout(function(){ath.classList.remove("walk");setPose("hello");var op=b.k==="valley";if(op)bEl.valley.classList.add("opn");pending.t=setTimeout(function(){go(b)},op?520:140)},dur*1000+30)};
}
B.forEach(function(b){
var el=bEl[b.k];
el.addEventListener("pointerdown",function(){el.classList.add("pr")});
["pointerup","pointercancel","pointerleave"].forEach(function(n){el.addEventListener(n,function(){el.classList.remove("pr")})});
el.addEventListener("click",function(){if(first){ignite();return}if(Date.now()>guard&&!wasLP(el))walkTo(b)});
lp(el,420,function(){if(!first&&!pending)peek(b)});
});
var lt=0;
ath.addEventListener("click",function(e){
if(first||Date.now()<guard){ignite();return}
if(pending){var p=pending;clearTimeout(p.t);go(p.b);return}
if(wasLP(ath))return;
var n=Date.now();if(n-lt<380||e.target.className==="ath-dot"){lt=0;clearTimeout(T.bub);closePops();showPop($("wPal"),ax,ay-AH-70);jump();return}lt=n;
jump();var l=lastB();if(l)later("bub",function(){showBub(l)},RM?0:380);
});
lp(ath,450,function(){if(first||pending)return;closePops();showPop($("wPal"),ax,ay-AH-70);jump()});
function lp(el,ms,cb){var t,x0,y0;
el.addEventListener("pointerdown",function(e){x0=e.clientX;y0=e.clientY;el._lpf=false;clearTimeout(t);t=setTimeout(function(){el._lpf=true;el._lp=Date.now();cb()},ms)});
["pointerup","pointercancel","pointerleave"].forEach(function(n){el.addEventListener(n,function(){clearTimeout(t)})});
el.addEventListener("pointermove",function(e){if(Math.abs(e.clientX-x0)>12||Math.abs(e.clientY-y0)>12)clearTimeout(t)});
el.addEventListener("contextmenu",function(e){e.preventDefault()});
}
function wasLP(el){return !!el._lpf}
function lastB(){var k=jget(KEY()).last;return B.filter(function(x){return x.k===k})[0]||null}
function closePops(){["wPeek","wBub","wPal"].forEach(function(i){$(i).hidden=true});clearTimeout(T.pop)}
function showPop(el,cx,top){el.hidden=false;var w=el.offsetWidth;el.style.left=Math.max(6,Math.min(384-w,cx-w/2))+"px";el.style.top=Math.max(2,top)+"px";later("pop",closePops,7000)}
function showBub(l){closePops();var bb=$("wBub");bb.classList.remove("say");bb.querySelector("span").textContent="نتابع؟";bb.querySelector("small").textContent=l.l;showPop(bb,ax,ay-AH-58);
bb.querySelector(".go").onclick=function(){closePops();var e=bEl[l.k];e.classList.remove("jel");void e.offsetWidth;e.classList.add("jel");setTimeout(function(){go(l)},RM?0:200)}}
function say(t,ms){closePops();var bb=$("wBub");bb.classList.add("say");bb.querySelector("span").textContent=t;showPop(bb,ax,ay-AH-50);later("pop",closePops,ms||4200)}
function celebrate(){
var s=jget(KEY()),d=new Date(),ds=d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2);
var days=jget("athar_days_v1_"+pid());if(!Array.isArray(days)||days.indexOf(ds)<0||s.cel===ds)return;
saveSt({cel:ds});
later("cel",function(){
if(!active||first||pending)return;
ath.classList.remove("jump");jump();
say("أحسنت اليوم",4200);
if(RM)return;
var f=$("wFall"),i,n=16;
for(i=0;i<n;i++){var e=D.createElement("i");e.className="w-fl";e.style.left=(8+Math.random()*84)+"%";e.style.animationDelay=(Math.random()*1.1).toFixed(2)+"s";e.style.animationDuration=(1.7+Math.random()*.9).toFixed(2)+"s";f.appendChild(e)}
setTimeout(function(){f.innerHTML=""},3200);
},RM?200:900);
}
function friday(){
var fr=(qs.get("d")!=null?+qs.get("d"):new Date().getDay())===5;
Array.prototype.forEach.call($("wLanterns").querySelectorAll(".al-ln"),function(g){g.classList.toggle("fri",fr&&g.classList.contains("today"))});
}
var PK={
hifz:function(i){return i.hifz?"حفظتَ "+nm(i.hifz)+" آية. ما شاء الله!":"هيا نبدأ أول آية معًا"},
noor:function(i){return i.noor?"أنجزتَ "+nm(i.noor)+" درسًا من "+nm(105):"أول حرف ينتظرك"},
math:function(i){return i.math?"أنجزتَ الأرقام اليوم":"هيا نعدّ المكعبات"},
lib:function(i){return i.lib?"قرأتَ "+nm(i.lib)+" فصلًا حتى الآن":"كتب جميلة تنتظرك"},
quiz:function(i){return i.quiz?"أنهيتَ "+nm(i.quiz)+" من "+nm(10)+" مراحل":"مسابقة ممتعة تنتظرك"},
adhkar:function(i){return i.adhkar?"ذكرتَ "+nm(i.adhkar)+" من "+nm(13)+" ذكرًا":"ذكر اليوم ينتظرك"},
valley:function(i){return i.valley?"حصة اليوم جاهزة":"الوادي في انتظارك"}
};
function peek(b){
closePops();badges();var p=$("wPeek"),last=jget(KEY()).last===b.k;
p.querySelector("b").textContent=b.l;p.querySelector("span").textContent=PK[b.k](INFO)+(last?" · آخر باب زرته":"");
p.querySelector(".go").onclick=function(){closePops();walkTo(b)};
showPop(p,b.x+b.w/2,b.y>=200?b.y-100:b.y+b.h+4);
}
var seq=null;
function finishSeq(){
if(!seq)return;guard=Date.now()+600;clearTimeout(seq.t);seq=null;
B.forEach(function(b){bEl[b.k].classList.add("on")});
world.classList.remove("w-first");first=false;layout();
var v=bEl.valley;v.classList.add("pulse");setTimeout(function(){v.classList.remove("pulse")},8200);
armLook(9000);
}
function ignite(){
if(!first||seq)return;guard=Date.now()+600;
var s=jget(KEY());s.seen=1;lset(KEY(),JSON.stringify(s));
clearTimeout(T.nudge);world.classList.remove("w-nudge");placeHalo();dusk.classList.add("off");dusk.style.pointerEvents="none";dusk.setAttribute("aria-hidden","true");dusk.tabIndex=-1;
ath.classList.add("glow");setPose("hello");later("gl",function(){ath.classList.remove("glow");setPose("idle")},1400);
var order=["adhkar","quiz","lib","math","valley","noor","hifz"],i=0;
seq={t:0};
if(RM){seq=null;first=false;world.classList.remove("w-first");layout();B.forEach(function(b){bEl[b.k].classList.add("on")});return}
(function step(){
if(!seq)return;
var e=bEl[order[i++]];e.classList.add("on","flash");
if(i<order.length)seq.t=setTimeout(step,560);else seq.t=setTimeout(finishSeq,900);
})();
seq.t=setTimeout(function(){},0);
var skip=function(){if(seq){finishSeq()}stage.removeEventListener("pointerdown",skip,true)};
setTimeout(function(){stage.addEventListener("pointerdown",skip,true)},350);
}
dusk.addEventListener("pointerdown",function(e){e.preventDefault();ignite()});
dusk.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();ignite()}});
function setBd(k,t){var e=bEl[k].querySelector(".bd");if(t){e.textContent=t;e.hidden=false}else e.hidden=true}
function cnt(o,f){var n=0;for(var k in o){if(f?f(o[k]):o[k])n++}return n}
var INFO={};
function badges(){
try{
var p=pid(),pg=jget(p==="p1"?"athar_quran_progress_v1":"athar_quran_progress_v1_"+p);
var q=cnt(pg,function(v){return v==="trained"||v==="memorized"||v==="review"});
INFO.hifz=q;setBd("hifz",q?nm(q)+" آية":"");
var n=cnt(jget("athar_noor_v1_"+p),function(v){return +v>0});INFO.noor=n;setBd("noor",n?nm(n)+"/"+nm(105):"");
n=cnt(jget("athar_adhkar_v1_"+p),function(v){return +v>0});INFO.adhkar=n;setBd("adhkar",n?nm(n)+"/"+nm(13):"");
n=cnt(jget("athar_ayq_v1_"+p),function(v){return +v>0});INFO.quiz=n;setBd("quiz",n?nm(n)+"/"+nm(10):"");
var m=jget("athar_mis_v1_"+p),d=new Date(),ds=d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2);
var md=m&&m.done&&m.done.math&&(m.date===ds||!m.date);INFO.math=!!md;setBd("math",md?"✓":"");
var ch=0,re=new RegExp("^athar_([a-z0-9]+)_v1_"+p+"$"),ex2={noor:1,adhkar:1,ayq:1,days:1,mis:1,quran:1,brain:1,home:1};
for(var i=0;i<localStorage.length;i++){var kk=localStorage.key(i),mm=re.exec(kk||"");if(mm&&!ex2[mm[1]])ch+=cnt(jget(kk))}
INFO.lib=ch;setBd("lib",ch?nm(ch)+" فصل":"");
}catch(e){}
var vb=$("doorValleyBadge"),vv=!!(vb&&!vb.hidden&&!vb.hasAttribute("hidden"));INFO.valley=vv;setBd("valley",vv?"حصة اليوم":"");
}
$("wPal").addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".sw");if(!b)return;var i=+b.dataset.i;setCol(i);saveSt({col:i});closePops();jump()});
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
world.classList.toggle("w-busy",!!(busy||drag||pending));
if(busy||drag)raf=requestAnimationFrame(tick);
}
function kick(){if(!raf&&active)raf=requestAnimationFrame(tick)}
world.addEventListener("pointerdown",function(e){
armLook(8000);if(!(e.target.closest&&e.target.closest(".w-pop")))closePops();
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
var pd=null;
function cls(e,c,ms){e.classList.remove(c);void e.offsetWidth;e.classList.add(c);setTimeout(function(){e.classList.remove(c)},ms)}
function sparks(x,y){if(RM)return;for(var i=0;i<7;i++){var s=D.createElement("i"),a=i*.9;s.className="w-sp";s.style.cssText="left:"+x+"px;top:"+y+"px;--dx:"+(Math.cos(a)*26|0)+"px;--dy:"+(Math.sin(a)*26|0)+"px";stage.appendChild(s);setTimeout(function(s){s.remove()}.bind(0,s),700)}}
function pathHit(x,y){var g=world.querySelector(".w-path .g");try{for(var i=0;i<5;i++)if(g.isPointInStroke(new DOMPoint(x+(i%3-1)*12,y-ex+(i>2?(i-3)*20-10:0))))return 1}catch(e){}return 0}
world.addEventListener("pointerdown",function(e){pd={x:e.clientX,y:e.clientY,t:Date.now()}});
world.addEventListener("pointerup",function(e){
var d=pd;pd=null;if(!d||!active||first)return;
if(Math.abs(e.clientX-d.x)>10||Math.abs(e.clientY-d.y)>10||Date.now()-d.t>450)return;
var t=e.target,c=t.closest?t.closest.bind(t):function(){};
if(c(".wb,.ath,.w-pop,#wDock,#wDusk"))return;
var r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/sc,y=(e.clientY-r.top)/sc;
if(c(".w-cu")){sparks(x,y);return}
if(y<110){
var l=c(".al-ln"),m=1e9;
if(!l)Array.prototype.forEach.call($("wLanterns").querySelectorAll(".al-ln"),function(g){var b=g.getBoundingClientRect(),dd=Math.abs(b.left+b.width/2-e.clientX);if(dd<m){m=dd;l=g}});
cls($("wLanterns"),"rp",800);if(l){var w=l.querySelector(".al-sw");if(w)cls(w,"rg",1300)}
try{W.AtharFX&&AtharFX.play("rope")}catch(_){}
}else if(pathHit(x,y))cls(world.querySelector(".w-path"),"pg",1400);
else Array.prototype.forEach.call(hills,function(h){cls(h.firstElementChild,"hw",700)});
sparks(x,y);
});
(function(){var g=$("btnParent"),t,ot=0;if(!g)return;
g.insertAdjacentHTML("beforeend",'<svg class="gr" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="23"/></svg>');
function stop(){clearTimeout(t);g.classList.remove("hold")}
g.addEventListener("pointerdown",function(){if(!active)return;g.classList.add("hold");t=setTimeout(function(){g.classList.remove("hold");ot=Date.now();g.click()},1200)});
["pointerup","pointercancel","pointerleave"].forEach(function(n){g.addEventListener(n,stop)});
g.addEventListener("contextmenu",function(e){e.preventDefault()});
D.addEventListener("click",function(e){
if(!active||e.detail===0||!(e.target.closest&&e.target.closest("#btnParent")))return;
e.stopImmediatePropagation();e.preventDefault();
if(Date.now()-ot>800&&!first){jump();poseFor(1400,"hello");say("اضغط مطوّلًا",2600)}
},true);
var br=D.querySelector("header .brand");
if(br)br.addEventListener("click",function(){if(active&&!first){jump();poseFor(1500,"hello")}});
})();
var active=false;
function enter(){
if(active)return;active=true;
app.classList.add("hw-on");D.documentElement.classList.remove("hw-pre");D.body.classList.add("hw-home");world.classList.remove("w-paused");svgs(1);if(skyApi)try{skyApi.resume()}catch(e){}
period();layout();badges();requestAnimationFrame(layout);setTimeout(layout,400);if(skyApi)try{skyApi.refresh()}catch(e){}
if(first){world.classList.add("w-first");dusk.classList.remove("off");put(HOME.ax,HOME.ay,0,true);setPose("think");
B.forEach(function(b){bEl[b.k].classList.remove("on")});placeHalo();dusk.removeAttribute("aria-hidden");dusk.tabIndex=0;later("nudge",function(){if(first&&!seq)world.classList.add("w-nudge")},6000)}
else{world.classList.remove("w-first");placeLast();armLook(8000)}
var gb=$("btnParent");if(gb&&!gb.getAttribute("aria-label"))gb.setAttribute("aria-label","وضع ولي الأمر");
mountSky();
setTimeout(friday,60);if(!first)celebrate();
var bt=$("wBoot");if(bt)requestAnimationFrame(function(){requestAnimationFrame(function(){bt.classList.add("off");setTimeout(function(){bt.remove()},450)})});
}
function leave(){
if(!active)return;active=false;if(pkM)dis=true;
app.classList.remove("hw-on","hw-pk");D.body.classList.remove("hw-home");world.classList.add("w-paused");svgs(0);if(skyApi)try{skyApi.pause()}catch(e){}closePops();
if(raf){cancelAnimationFrame(raf);raf=0}
stopT();world.classList.remove("w-busy");if(pending){clearTimeout(pending.t);pending=null}
ath.classList.remove("walk","lk","lkh","glow","jump");
}
function sync(){view.classList.contains("active")?enter():leave()}
new MutationObserver(sync).observe(view,{attributes:true,attributeFilter:["class"]});
D.addEventListener("visibilitychange",function(){
if(D.hidden){world.classList.add("w-paused");svgs(0);if(skyApi)try{skyApi.pause()}catch(e){}if(raf){cancelAnimationFrame(raf);raf=0}stopT()}
else if(active){world.classList.remove("w-paused");svgs(1);if(skyApi)try{skyApi.resume()}catch(e){}period();badges();armLook(8000);kick()}
});
W.addEventListener("pageshow",function(e){if(e.persisted&&active){badges();placeLast();world.classList.remove("w-paused")}});
W.addEventListener("resize",function(){layout()});
W.addEventListener("orientationchange",function(){setTimeout(layout,200)});
(function(){var n=0,t=setInterval(function(){var vb=$("doorValleyBadge");if(vb){clearInterval(t);new MutationObserver(badges).observe(vb,{attributes:true});badges()}else if(++n>80)clearInterval(t)},150)})();
var svgL=world.querySelectorAll(".wb svg");
function svgs(on){Array.prototype.forEach.call(svgL,function(s){try{on?s.unpauseAnimations():s.pauseAnimations()}catch(e){}})}
var mounted=false;
function mountSky(){
if(mounted||!W.AtharSky||!W.AtharSky.mount)return;
try{skyApi=W.AtharSky.mount({lanterns:$("wLanterns"),sky:$("wSky"),time:skyTime(),background:false});mounted=true;if(!active){skyApi.pause&&skyApi.pause()}}catch(e){}
}
W.addEventListener("load",function(){mountSky();layout()});
W.AtharWorld={mountSky:mountSky,refresh:function(){period();badges()}};
sync();
if(!active)world.classList.add("w-paused");
})();

