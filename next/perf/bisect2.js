const {chromium}=require('playwright');const {m}=require('./perf.js');
const URL=process.argv[2]||'home-next.html?t=day&first=0';
const names=process.argv[3].split(',');
(async()=>{
 const b=await chromium.launch();
 for(const k of ['base',...names,'ALL']){
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
  const p=await c.newPage();const cdp=await c.newCDPSession(p);
  await cdp.send('Performance.enable');await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await p.goto('http://localhost:8099/'+URL,{waitUntil:'load'});await p.waitForTimeout(2500);
  if(k!=='base')await p.evaluate(([k,names])=>{document.getAnimations().forEach(a=>{if(k==='ALL'?names.includes(a.animationName):a.animationName===k)a.cancel()})},[k,names]);
  await p.waitForTimeout(800);
  const m0=await m(cdp);await p.waitForTimeout(5000);const m1=await m(cdp);
  const f=n=>+((m1[n]-m0[n])/5*100).toFixed(1);
  console.log(k.padEnd(12),'task%',f('TaskDuration'),'layout%',f('LayoutDuration'),'style%',f('RecalcStyleDuration'),'layouts/s',((m1.LayoutCount-m0.LayoutCount)/5).toFixed(0));
  await c.close();
 }
 await b.close();
})();
