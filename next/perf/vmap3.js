const {chromium}=require('playwright');
const FPS=`new Promise(res=>{const d=[];let last=0,t0=performance.now();function f(t){if(last)d.push(t-last);last=t;if(performance.now()-t0<5000)requestAnimationFrame(f);else{const s=d.slice().sort((a,b)=>a-b);res({fps:d.length/(d.reduce((a,b)=>a+b,0)/1000),p95:s[Math.floor(d.length*.95)]})}}requestAnimationFrame(f)})`;
const med=a=>a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)];
const groupStars=()=>{const NS='http://www.w3.org/2000/svg';const stars=[...document.querySelectorAll('.star')];const groups=[0,1,2].map(i=>{const g=document.createElementNS(NS,'g');g.style.animation='twinkle '+(3+i*.7)+'s ease-in-out infinite';g.style.animationDelay=(-i*1.1)+'s';return g});stars.forEach((s,i)=>{s.style.animation='none';const par=s.parentNode;const g=groups[i%3];if(!g.parentNode)par.appendChild(g);g.appendChild(s)})};
const tufts4=()=>document.querySelectorAll('.tuft').forEach((e,i)=>{if(i%4)e.style.animation='none'});
const kill=()=>document.getAnimations().forEach(a=>{if(['flow','boyBreathe','breathe','blinkA','vxlan'].includes(a.animationName))a.cancel()});
const V={
 'stars grouped + tufts 16->4':`(${groupStars})();(${tufts4})()`,
 'stars grouped + tufts4 + flow/char/vxLan off':`(${groupStars})();(${tufts4})();(${kill})()`,
 'ALL anims off (floor)':'document.getAnimations().forEach(a=>a.cancel())',
};
(async()=>{
 const b=await chromium.launch();
 for(const [k,fn] of Object.entries(V)){const r=[],pp=[];
  for(let i=0;i<4;i++){
   const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
   const p=await c.newPage();const cdp=await c.newCDPSession(p);
   await p.goto('http://localhost:8099/valley/next.html',{waitUntil:'load'});await p.waitForTimeout(2000);await p.click('#enter');await p.waitForTimeout(2000);
   for(let j=0;j<3;j++){await p.click('.ibtn').catch(()=>{});await p.waitForTimeout(1200)}await p.waitForTimeout(2500);
   await p.evaluate(fn);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await p.waitForTimeout(600);
   const x=await p.evaluate(FPS);r.push(x.fps);pp.push(x.p95);await c.close();
  }
  console.log(k.padEnd(46),'runs',r.map(x=>x.toFixed(0)).join('/'),'median',med(r).toFixed(0),'fps');
 }
 await b.close()})();
