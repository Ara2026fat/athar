const {chromium}=require('playwright');const {m}=require('./perf.js');
const URL='home-next.html?t=day&first=0';
const V={
 'all-but-wchalk&SMIL(removed)':()=>{document.querySelectorAll('animateTransform').forEach(a=>a.remove());document.getAnimations().forEach(a=>{if(a.animationName==='wchalk')a.cancel()})},
 'wchalk-only':()=>{document.querySelectorAll('animateTransform').forEach(a=>a.remove());document.getAnimations().forEach(a=>{if(a.animationName!=='wchalk')a.cancel()})},
 'SMIL-only':()=>{document.getAnimations().forEach(a=>a.cancel())},
 'wchalk+SMIL':()=>{document.getAnimations().forEach(a=>{if(a.animationName!=='wchalk')a.cancel()})},
 'all-but-wchalk(SMIL on)':()=>{document.getAnimations().forEach(a=>{if(a.animationName==='wchalk')a.cancel()})},
};
(async()=>{
 const b=await chromium.launch();
 for(const [k,fn] of Object.entries(V)){
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
  const p=await c.newPage();const cdp=await c.newCDPSession(p);
  await cdp.send('Performance.enable');await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await p.goto('http://localhost:8099/'+URL,{waitUntil:'load'});await p.waitForTimeout(2500);
  await p.evaluate(fn);await p.waitForTimeout(800);
  const m0=await m(cdp);await p.waitForTimeout(4000);const m1=await m(cdp);
  const f=n=>+((m1[n]-m0[n])/4*100).toFixed(1);
  console.log(k.padEnd(30),'task%',f('TaskDuration'),'layout%',f('LayoutDuration'));
  await c.close();
 }
 await b.close();
})();
