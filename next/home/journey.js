/* الرئيسية الجديدة «هيا نكمل». تُحمَّل قبل world.js فيتنحّى عالم الأبواب القديم (يمكن إظهاره بـ ?w=old). */
(function(){
"use strict";
var D=document,W=window,qs=new URLSearchParams(location.search),view=D.getElementById("view-home");
if(!view)return;var DOCK=qs.get("w")==="dock"&&!D.getElementById("homeWorld");
var PV=/home-next/.test(location.pathname)||qs.get("preview")==="1";
function $(i){return D.getElementById(i)}
var DOORS=[
{k:"valley",d:"doorValley",l:"الوادي",img:"valley_win",c:"#e4a93a",a:"#f0b640",b:"#c47a12",t:"حصة اليوم تنتظرك: قصة وأسئلة وأفعال جميلة مع أثر"},
{k:"hifz",d:"doorHifz",l:"أحفظ القرآن",img:"hifz",c:"#2f9e6b",a:"#38b87e",b:"#17623f",t:"نسمع السورة ونردّدها معًا آية بآية حتى نحفظها"},
{k:"noor",d:"doorLang",l:"القاعدة النورانية",img:"noor",c:"#f0a53a",a:"#f6a63c",b:"#d4601a",t:"نتعلّم الحروف وأصواتها وحركاتها خطوةً خطوة"},
{k:"lib",d:"doorLib",l:"مكتبتي",img:"lib",c:"#8a63d2",a:"#9a72e0",b:"#5b30a8",t:"قصص وكتب صغيرة عن الله والأخلاق والنبي ﷺ"},
{k:"adhkar",d:"doorAdhkar",l:"أذكاري",img:"adhkar",c:"#2fb5a8",a:"#2fc9b5",b:"#0e7d74",t:"أذكار الصباح والمساء وأدعية اليوم بصوت جميل"},
{k:"quiz",d:"doorQuiz",l:"المسابقات",img:"quiz",c:"#e0509a",a:"#ee6aab",b:"#b0276c",t:"ألعاب وأسئلة نمرح بها ونجمع النجوم"},
{k:"math",d:"doorMath",l:"عالم الأرقام",img:"math",c:"#e8aa2e",a:"#4fb7f0",b:"#1f7fc4",t:"نعدّ ونلعب بالأرقام والأشكال بمرح"}
];
function ic(d){return "next/home/img/doors/"+d.img+".webp"}
var by={};DOORS.forEach(function(d){by[d.k]=d});
if(DOCK){(function(){
var NEXT=qs.get("next")||"hifz",hr=new Date().getHours(),T=qs.get("t")||(hr>=5&&hr<15?"day":hr<19?"evening":"night");
var w=D.createElement("div");w.id="homeWorld";w.className="jr jr-"+T;
var nx=by[NEXT]||DOORS[1],rest=DOORS.filter(function(d){return d!==nx});
w.innerHTML='<div class="jr-bg" id="jrBg"></div><div class="jr-tint"></div>'+
'<img class="jr-ath" src="next/home/img/hello.webp" alt=""><div class="jr-bub">هيا نكمل!</div>'+
'<div class="jr-dock" id="jrDock"><button type="button" class="jr-go" data-k="'+nx.k+'"><img src="'+ic(nx)+'" alt=""><span><b>هيا نكمل</b><small>'+nx.l+'</small></span><i>◀</i></button>'+
'<div class="jr-grid">'+rest.map(function(d){return '<button type="button" class="jr-it" data-k="'+d.k+'" style="--c:'+d.c+'"><img src="'+ic(d)+'" alt=""><span>'+d.l+'</span></button>'}).join('')+'</div></div>';
view.insertBefore(w,view.firstChild);
var app=$("app");if(app)app.classList.add("hw-on");D.body.classList.add("hw-home");var bt=$("wBoot");if(bt)bt.remove();D.documentElement.classList.remove("hw-pre");D.documentElement.classList.add("hw-pre-j");
/* الخلفية: الصورة الجديدة إن وُجدت وإلا خريطة الوادي الحالية */
var bg=$("jrBg"),im=new Image();
im.onload=function(){bg.style.backgroundImage="url("+im.src+")"};
im.onerror=function(){bg.style.backgroundImage="url(next/home/img/map/"+(T==="night"?"night1":"day1")+".webp)";bg.style.backgroundPosition="center top";bg.style.backgroundSize="cover";bg.style.backgroundColor=T==="night"?"#0e1236":"#8cc4ee"};
/* img/bg/valley-a.webp غير موجودة بعد: لا نطلبها (اجعل HAS_BG_A=true عند إضافتها) */
var HAS_BG_A=false;if(HAS_BG_A)im.src="next/home/img/bg/valley-a.webp";else im.onerror();
function dockH(){var d=$("jrDock");if(d)w.style.setProperty("--dock",d.offsetHeight+"px")}
setTimeout(dockH,50);addEventListener("resize",dockH);
})()}
/* صفحة التعريف (الباب الأول) ثم الدخول (الباب الثاني) */
var land=D.createElement("div");land.className="jr-land";land.id="jrLand";
land.innerHTML='<div class="jl-ring"><img alt=""></div><h2></h2><p></p><button type="button" class="jl-in">ادخل</button><button type="button" class="jl-bk">رجوع</button>';
D.body.appendChild(land);var cur=null,cb=null;
function open(k,f){cur=by[k];cb=f||null;if(!cur)return;
land.style.setProperty("--a",cur.a);land.style.setProperty("--b",cur.b);
land.querySelector("img").src=ic(cur);land.querySelector("h2").textContent=cur.l;land.querySelector("p").textContent=cur.t;land.classList.add("on")}
function close(){land.classList.remove("on")}
function enter(){var d=cur,f=cb;if(!d)return;close();
if(f){f();return}
if(d.k==="valley"&&PV){location.href="valley/next.html";return}
var el=$(d.d);W.__atharQuietTap=Date.now()+600;if(el)el.click()}
W.AtharLand={open:open};
if(DOCK)D.getElementById("homeWorld").addEventListener("click",function(e){var b=e.target.closest("[data-k]");if(b)open(b.getAttribute("data-k"))});
land.querySelector(".jl-in").addEventListener("click",enter);land.querySelector(".jl-bk").addEventListener("click",close);
})();
