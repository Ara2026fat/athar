(function(){var D=document;function go(){var w=D.getElementById("homeWorld");if(!w||D.getElementById("wScene")){return}
var f=D.createElement("div");f.id="wScene";var h="";
h+='<div class="ray" style="--r:-24deg;margin-left:-60px"></div><div class="ray" style="--r:-8deg;width:110px;animation-delay:-3s"></div><div class="ray" style="--r:12deg;margin-left:-20px;width:90px;animation-delay:-6s"></div>';
for(var i=0;i<4;i++)h+='<div class="cl" style="top:'+(70+i*45)+'px;width:'+(110+i*30)+'px;animation-duration:'+(55+i*18)+'s;animation-delay:-'+(i*17)+'s"></div>';
var night=/night|evening/.test(w.className);
for(i=0;i<7;i++)h+='<div class="gl" style="left:'+(185+Math.random()*95|0)+'px;top:'+(262+Math.random()*40|0)+'px;animation-delay:-'+(Math.random()*3).toFixed(1)+'s"></div>';
for(i=0;i<(night?16:9);i++)h+='<div class="ff" style="left:'+(Math.random()*370|0)+'px;top:'+(260+Math.random()*420|0)+'px;--x:'+(Math.random()*50-25|0)+'px;--y:'+(-Math.random()*50|0)+'px;--d:'+(7+Math.random()*7).toFixed(1)+'s;animation-delay:-'+(Math.random()*8).toFixed(1)+'s"></div>';
h+='<div class="vg"></div>';f.innerHTML=h;w.insertBefore(f,w.firstChild.nextSibling||null);
var m=w.querySelector(".w-map");
function mv(x,y){if(!m)return;m.style.transform="translate("+(-x*10).toFixed(1)+"px,"+(-y*8).toFixed(1)+"px) scale(1.04)"}
w.addEventListener("pointermove",function(e){var r=w.getBoundingClientRect();mv((e.clientX-r.left)/r.width-.5,(e.clientY-r.top)/r.height-.5)});
window.addEventListener("deviceorientation",function(e){if(e.gamma==null)return;mv(Math.max(-.5,Math.min(.5,e.gamma/60)),Math.max(-.5,Math.min(.5,(e.beta-45)/90)))})}
var n=0,t=setInterval(function(){if(D.getElementById("homeWorld")||++n>40){clearInterval(t);go()}},150)})();
