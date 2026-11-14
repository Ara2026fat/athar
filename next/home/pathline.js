/* معاينة مسار أثر: أثر يمشي على الطريق المتعرج بين الأبواب (home-path.html فقط) */
(function(){var D=document,NS="http://www.w3.org/2000/svg";
var OFF=0; /* فرق إحداثيات العالم عن الشاشة */
var W_=[[195,684,null],[148,650,"math"],[244,614,"quiz"],[148,564,"lib"],[244,526,"adhkar"],[148,476,"noor"],[244,438,"hifz"],[195,394,"valley"]];
var DOOR={math:[70,634],quiz:[320,618],lib:[70,544],adhkar:[320,528],noor:[70,454],hifz:[320,438],valley:[195,338]};
var w,ath,path,len,stops={},busy=false,cur=0,AH=152;
function dsc(y){return Math.max(.4,Math.min(1,.4+.6*((y-250)/452)))}
function build(){
 var pts=W_.map(function(p){return[p[0],p[1]]}),d="M"+pts[0][0]+" "+pts[0][1];
 for(var i=0;i<pts.length-1;i++){var p1=pts[i],p2=pts[i+1],my=(p2[1]-p1[1])/2;
  /* منحنى على شكل S بمماسّ رأسي عند كل باب: الارتفاع (y) يتناقص دائمًا فلا يعود أثر للخلف */
  d+=" C"+p1[0]+" "+(p1[1]+my)+" "+p2[0]+" "+(p2[1]-my)+" "+p2[0]+" "+p2[1]}
 var s=D.createElementNS(NS,"svg");s.id="wPath";s.setAttribute("viewBox","0 0 390 780");
 s.setAttribute("style","position:absolute;left:0;top:0;width:390px;height:780px;z-index:2;pointer-events:none");
 s.innerHTML='<path id="wPathP" d="'+d+'" fill="none" stroke="rgba(110,72,30,.40)" stroke-width="36" stroke-linecap="round" stroke-linejoin="round"/><path d="'+d+'" fill="none" stroke="rgba(255,232,170,.6)" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/><path d="'+d+'" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="3" stroke-dasharray="2 11" stroke-linecap="round"/>';
 var wb=w.querySelector(".wb");wb.parentNode.insertBefore(s,wb);path=D.getElementById("wPathP");len=path.getTotalLength();
 W_.forEach(function(p){if(!p[2])return;var best=0,bd=1e9;for(var l=0;l<=len;l+=2){var q=path.getPointAtLength(l),dd=Math.abs(q.x-p[0])+Math.abs(q.y-p[1]);if(dd<bd){bd=dd;best=l}}stops[p[2]]=best})}
function place(){Object.keys(DOOR).forEach(function(k){var el=D.getElementById("wb-"+k);if(!el)return;var c=DOOR[k],ew=el.offsetWidth||112,eh=el.offsetHeight||90;el.style.left=Math.round(c[0]-ew/2)+"px";el.style.top=Math.round(c[1]-eh/2+OFF)+"px"})}
function at(l){var q=path.getPointAtLength(Math.max(0,Math.min(len,l)));return q}
function setA(l,dir){var q=at(l),sc=dsc(q.y);ath.classList.add("nm");ath.style.transform="translate("+(q.x-50)+"px,"+(q.y-AH)+"px) scale("+sc.toFixed(3)+")";
 var j=ath.querySelector(".ath-j,.ath-b");}
function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
function wpose(cat,flip){var ps=ath.querySelectorAll(".p"),i,t="wk"+cat;for(i=0;i<ps.length;i++){var on=ps[i].getAttribute("data-p")===t;ps[i].classList.toggle("on",on);ps[i].classList.toggle("fl",on&&flip)}}
var vcat=null;
function walk(k,done){var to=stops[k],from=cur,dist=Math.abs(to-from);if(dist<4){done();return}
 var prev=ath.querySelector(".p.on"),prevK=prev&&prev.getAttribute("data-p");vcat=null;
 var dur=Math.min(5.2,Math.max(2,dist/90))*1000,t0=performance.now();busy=true;ath.classList.add("walk");
 var HA=window.HomeAudio;try{if(HA){HA.say(k);HA.steps(dur)}}catch(e){}
 (function f(now){var t=Math.min(1,(now-t0)/dur);cur=from+(to-from)*ease(t);setA(cur);
  try{var q1=at(cur),q2=at(cur+(to>from?4:-4)),dx=q2.x-q1.x,dy=q2.y-q1.y,ax=Math.abs(dx),ay=Math.abs(dy),vert=ay>ax*(vcat==="b"||vcat==="f"?0.8:1.25),c=vert?(dy<0?"b":"f"):"s";vcat=c;wpose(c,c==="s"&&dx<0)}catch(e){}
  if(t<1)requestAnimationFrame(f);else{ath.classList.remove("walk");try{var ps=ath.querySelectorAll(".p"),i;for(i=0;i<ps.length;i++){ps[i].classList.remove("fl");ps[i].classList.toggle("on",ps[i].getAttribute("data-p")===(prevK||"idle"))}}catch(e){}busy=false;done()}})(t0)}
function hook(){D.querySelectorAll("#homeWorld .wb").forEach(function(el){
 el.addEventListener("click",function(e){if(el.__go)return;var k=el.id.replace("wb-","");if(!(k in stops))return;e.stopImmediatePropagation();e.preventDefault();if(busy)return;
  walk(k,function(){el.__go=1;el.click();setTimeout(function(){el.__go=0},400)})},true)})}
function lanterns(){var L=D.getElementById("wLanterns");if(!L)return;var t=L.querySelector(".al-ln.today .al-tx");if(!t||t.querySelector(".al-hj"))return;
 var hj="";try{hj=new Date().toLocaleDateString("ar-SA-u-ca-islamic-umalqura",{day:"numeric",month:"long"})}catch(e){}
 var s=D.createElementNS(NS,"tspan");s.setAttribute("x","0");s.setAttribute("dy","16");s.setAttribute("class","al-dt al-hj");s.textContent=hj+" هـ";
 var g=t.querySelector(".al-dt");if(g)t.insertBefore(s,g);else t.appendChild(s)}
function go(){w=D.getElementById("homeWorld");ath=w&&w.querySelector(".ath");if(!w||!ath||!w.querySelector(".wb")||D.getElementById("wPath"))return false;
 build();place();hook();lanterns();cur=0;setA(0);
 var n=0,iv=setInterval(function(){place();lanterns();if(!busy&&cur===0)setA(0);if(++n>12)clearInterval(iv)},400);return true}
var n=0,t=setInterval(function(){if(go()||++n>60)clearInterval(t)},150)})();
