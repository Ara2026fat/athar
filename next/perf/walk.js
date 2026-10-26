const {chromium}=require('playwright');
const FR=`new Promise(res=>{const d=[];let last=0,t0=performance.now();function f(t){if(last)d.push(t-last);last=t;if(performance.now()-t0<1300)requestAnimationFrame(f);else{const s=d.slice().sort((a,b)=>a-b);res({n:d.length,fps:d.length/(d.reduce((a,b)=>a+b,0)/1000),p95:s[Math.floor(d.length*.95)],max:s[s.length-1]})}}requestAnimationFrame(f)})`;
(async()=>{
 const b=await chromium.launch();
 for(const cpu of [1,4,6]){const rs=[];
  for(let i=0;i<3;i++){
   const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
   const p=await c.newPage();const cdp=await c.newCDPSession(p);
   await p.goto('http://localhost:8099/home-next.html?t=day&first=0');await p.waitForTimeout(3000);
   await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpu});await p.waitForTimeout(400);
   const fp=p.evaluate(FR);
   await p.evaluate(()=>document.querySelector('#wb-math').click());   // walk to door
   rs.push(await fp);await c.close();
  }
  console.log('walk to door cpu'+cpu,rs.map(r=>r.fps.toFixed(0)+'fps(p95 '+r.p95.toFixed(0)+'ms,max '+r.max.toFixed(0)+')').join(' | '));
 }
 await b.close()})();
