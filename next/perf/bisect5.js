const {chromium}=require('playwright');const {m}=require('./perf.js');
const URL='home-next.html?t=day&first=0';
const V={
 base:()=>{},
 removeSmilOnly:()=>{document.querySelectorAll('animateTransform').forEach(a=>a.remove())},
 removeSmil_andSky_ok:()=>{document.querySelectorAll('animateTransform').forEach(a=>a.remove())},
 smilCssLantern:()=>{document.querySelectorAll('animateTransform').forEach(a=>{const g=a.parentNode;a.remove();g.style.cssText='transform-box:fill-box;transform-origin:50% 0;animation:lw 4s ease-in-out infinite alternate';});const st=document.createElement('style');st.textContent='@keyframes lw{from{transform:rotate(-6deg)}to{transform:rotate(6deg)}}';document.head.appendChild(st)},
 pauseOnlyWhenIdle:()=>{},
};
(async()=>{
 const b=await chromium.launch();
 for(const [k,fn] of Object.entries(V)){
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
  const p=await c.newPage();const cdp=await c.newCDPSession(p);
  await cdp.send('Performance.enable');await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await p.goto('http://localhost:8099/'+URL,{waitUntil:'load'});await p.waitForTimeout(2500);
  await p.evaluate(fn);await p.waitForTimeout(800);
  const m0=await m(cdp);await p.waitForTimeout(5000);const m1=await m(cdp);
  const f=n=>+((m1[n]-m0[n])/5*100).toFixed(1);
  console.log(k.padEnd(16),'task%',f('TaskDuration'),'layout%',f('LayoutDuration'),'style%',f('RecalcStyleDuration'));
  await c.close();
 }
 await b.close();
})();
