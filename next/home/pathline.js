(function(){var D=document;function go(){var w=D.getElementById("homeWorld");if(!w||D.getElementById("wPath"))return;
var P=[[292,712],[160,665],[75,618],[70,520],[195,540],[312,515],[330,430],[312,385],[195,430],[78,415]];
var d="M"+P[0][0]+" "+P[0][1];for(var i=1;i<P.length;i++){var a=P[i-1],b=P[i],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;d+=" Q"+a[0]+" "+a[1]+" "+mx+" "+my}d+=" T"+P[P.length-1][0]+" "+P[P.length-1][1];
var s=D.createElementNS("http://www.w3.org/2000/svg","svg");s.id="wPath";s.setAttribute("viewBox","0 0 390 780");
s.setAttribute("style","position:absolute;left:0;top:0;width:390px;height:780px;z-index:2;pointer-events:none");
s.innerHTML='<path d="'+d+'" fill="none" stroke="rgba(110,72,30,.38)" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/><path d="'+d+'" fill="none" stroke="rgba(255,232,170,.55)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/><path d="'+d+'" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="3" stroke-dasharray="2 11" stroke-linecap="round"/>';
var wb=w.querySelector(".wb");wb.parentNode.insertBefore(s,wb)}
var n=0,t=setInterval(function(){if(D.querySelector("#homeWorld .wb")||++n>40){clearInterval(t);go()}},150)})();
