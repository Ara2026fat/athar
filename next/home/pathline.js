/* معاينة مسار أثر: أثر يمشي على الطريق المتعرج بين الأبواب (home-path.html فقط) */
(function(){var D=document,NS="http://www.w3.org/2000/svg";
var OFF=0; /* فرق إحداثيات العالم عن الشاشة */
var W_=[[195,705,null],[207,630,["math","quiz"]],[185,570,null],[207,505,["lib","adhkar"]],[185,445,null],[205,385,["noor","hifz"]],[195,322,"valley"]];
var DOOR={math:[76,628],quiz:[314,618],lib:[76,508],adhkar:[314,498],noor:[76,388],hifz:[314,378],valley:[195,262]};
var w,ath,path,len,stops={},busy=false,cur=0,AH=152;
function dsc(y){return Math.max(.4,Math.min(1,.4+.6*((y-250)/452)))}
function build(){
 var SEG=[],pts=W_.map(function(p){return[p[0],p[1]]}),d="M"+pts[0][0]+" "+pts[0][1];
 for(var i=0;i<pts.length-1;i++){var p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;
  var c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[1]+(p2[1]-p0[1])/6,c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[1]-(p3[1]-p1[1])/6;
  SEG.push([p1[0],p1[1],c1x,c1y,c2x,c2y,p2[0],p2[1]]);
  d+=" C"+c1x+" "+c1y+" "+c2x+" "+c2y+" "+p2[0]+" "+p2[1]}
 var s=D.createElementNS(NS,"svg");s.id="wPath";s.setAttribute("viewBox","0 0 390 780");
 s.setAttribute("style","position:absolute;left:0;top:0;width:390px;height:780px;z-index:2;pointer-events:none");
 s.innerHTML='<path id="wPathP" d="'+d+'" fill="none" stroke="rgba(110,72,30,.40)" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/><path d="'+d+'" fill="none" stroke="rgba(255,232,170,.6)" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/><path d="'+d+'" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="3" stroke-dasharray="2 11" stroke-linecap="round"/>';
 var wb=w.querySelector(".wb");wb.parentNode.insertBefore(s,wb);path=D.getElementById("wPathP");len=path.getTotalLength();
 /* عيّنات من منحنيات بيزييه في JS (بدل مئات استدعاءات getPointAtLength البطيئة) */
 var SP=[],acc=0,px=null,py=null;
 SEG.forEach(function(g){for(var k=0;k<=40;k++){var t=k/40,u=1-t,x=u*u*u*g[0]+3*u*u*t*g[2]+3*u*t*t*g[4]+t*t*t*g[6],y=u*u*u*g[1]+3*u*u*t*g[3]+3*u*t*t*g[5]+t*t*t*g[7];
  if(px!==null)acc+=Math.sqrt((x-px)*(x-px)+(y-py)*(y-py));px=x;py=y;SP.push([x,y,acc])}});
 var kf=acc?len/acc:1;
 W_.forEach(function(p){if(!p[2])return;var nm=Array.isArray(p[2])?p[2]:[p[2]];var best=0,bd=1e9;for(var i=0;i<SP.length;i++){var q=SP[i],dd=Math.abs(q[0]-p[0])+Math.abs(q[1]-p[1]);if(dd<bd){bd=dd;best=q[2]*kf}}nm.forEach(function(n){stops[n]=best})})}
function place(){Object.keys(DOOR).forEach(function(k){var el=D.getElementById("wb-"+k);if(!el)return;var c=DOOR[k],ew=el.offsetWidth||112,eh=el.offsetHeight||90;el.style.left=Math.round(c[0]-ew/2)+"px";el.style.top=Math.round(c[1]-eh/2+OFF)+"px"})}
function at(l){var q=path.getPointAtLength(Math.max(0,Math.min(len,l)));return q}
function setA(l,dir){var q=at(l),sc=dsc(q.y);ath.classList.add("nm");ath.style.transform="translate("+(q.x-50)+"px,"+(q.y-AH)+"px) scale("+sc.toFixed(3)+")";
 var j=ath.querySelector(".ath-j,.ath-b");}
function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
function wpose(cat,flip){var ps=ath.querySelectorAll(".p"),i,t="wk"+cat;for(i=0;i<ps.length;i++){var on=ps[i].getAttribute("data-p")===t;ps[i].classList.toggle("on",on);ps[i].classList.toggle("fl",on&&flip)}}
var vcat=null;
function walk(k,done){var to=stops[k],from=cur,dist=Math.abs(to-from);if(dist<4){setTimeout(done,0);return}  /* click() المتداخل داخل معالج النقر نفسه يُتجاهَل: نؤجّله لنقرة جديدة */
 var prev=ath.querySelector(".p.on"),prevK=prev&&prev.getAttribute("data-p");vcat=null;
 var dur=Math.min(2.6,Math.max(.9,dist/170))*1000,t0=performance.now();busy=true;ath.classList.add("walk");
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
