const {chromium}=require('playwright');const {m}=require('./perf.js');
const URL='home-next.html?t=day&first=0';
const V={
 noSMIL_swayOff:()=>{document.querySelectorAll('animateTransform').forEach(a=>a.remove());document.querySelectorAll('.wb .sw').forEach(g=>g.style.animation='none')},
 proposal:()=>{const lan=[...document.querySelectorAll('animateTransform')].map(a=>a.parentNode);document.querySelectorAll('animateTransform').forEach(a=>a.remove());const t=[...document.querySelectorAll('.wb .sw')];t.forEach(g=>g.style.animation='none');
  const st=document.createElement('style');st.textContent='@keyframes lw{0%,100%{transform:rotate(0)}30%{transform:rotate(7deg)}70%{transform:rotate(-7deg)}}.lw{transform-box:fill-box;transform-origin:50% 0;animation:lw 1.4s ease-in-out 1}';document.head.appendChild(st);
  const all=[...t,...lan];let i=0;setInterval(()=>{const g=all[i++%all.length];g.style.animation='none';void g.getBBox();g.style.animation='';g.classList.remove('lw');void g.getBoundingClientRect();g.classList.add('lw');if(g.classList.contains('sw'))g.style.animation='wsway .6s ease-in-out 2 alternate'},2500)},
};
(async()=>{
 const b=await chromium.launch();
 for(const [k,fn] of Object.entries(V)){
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
  const p=await c.newPage();const cdp=await c.newCDPSession(p);
  await cdp.send('Performance.enable');await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await p.goto('http://localhost:8099/'+URL,{waitUntil:'load'});await p.waitForTimeout(2500);
  await p.evaluate(fn);await p.waitForTimeout(800);
  const m0=await m(cdp);await p.waitForTimeout(8000);const m1=await m(cdp);
  const f=n=>+((m1[n]-m0[n])/8*100).toFixed(1);
  console.log(k.padEnd(16),'task%',f('TaskDuration'),'layout%',f('LayoutDuration'),'style%',f('RecalcStyleDuration'));
  await c.close();
 }
 await b.close();
})();
