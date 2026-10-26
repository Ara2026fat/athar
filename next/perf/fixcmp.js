const {chromium}=require('playwright');const {m}=require('./perf.js');
const FIX=`document.querySelectorAll('animateTransform').forEach(a=>{const g=a.parentNode;const d=a.getAttribute('dur');a.remove();g.style.cssText='transform-box:fill-box;transform-origin:50% 0;animation:lw '+d+' ease-in-out infinite alternate'});const st=document.createElement('style');st.textContent='@keyframes lw{from{transform:rotate(-6deg)}to{transform:rotate(6deg)}}@keyframes wchalkO{0%,4%{opacity:0}24%,84%{opacity:1}94%,100%{opacity:0}}.wb .chk{stroke-dasharray:none!important;stroke-dashoffset:0!important;animation:wchalkO 10s ease-in-out infinite!important}';document.head.appendChild(st);`;
const FPS=`new Promise(res=>{const d=[];let last=0,t0=performance.now();function f(t){if(last)d.push(t-last);last=t;if(performance.now()-t0<5000)requestAnimationFrame(f);else{const s=d.slice().sort((a,b)=>a-b);res({fps:+(d.length/(d.reduce((a,b)=>a+b,0)/1000)).toFixed(1),p95:+s[Math.floor(d.length*.95)].toFixed(1),over50:d.filter(x=>x>50).length})}}requestAnimationFrame(f)})`;
(async()=>{
 const b=await chromium.launch();
 for(const cpu of [1,4,6])for(const fix of [0,1]){
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
  const p=await c.newPage();const cdp=await c.newCDPSession(p);await cdp.send('Performance.enable');
  await p.goto('http://localhost:8099/home-next.html?t=day&first=0',{waitUntil:'load'});await p.waitForTimeout(2500);
  if(fix)await p.evaluate(FIX);await p.waitForTimeout(600);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpu});
  const m0=await m(cdp);const r=await p.evaluate(FPS);const m1=await m(cdp);
  console.log('home cpu'+cpu,fix?'FIXED ':'current',JSON.stringify(r),'task%',((m1.TaskDuration-m0.TaskDuration)/5*100).toFixed(1),'layout%',((m1.LayoutDuration-m0.LayoutDuration)/5*100).toFixed(1));
  await c.close();
 }
 await b.close()})();
