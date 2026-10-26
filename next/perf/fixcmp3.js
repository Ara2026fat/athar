const {chromium}=require('playwright');const {m}=require('./perf.js');
const src=require('fs').readFileSync('fixcmp.js','utf8');const FIX=eval(src.match(/const FIX=(`[\s\S]*?`);/)[1]);
(async()=>{
 const b=await chromium.launch();
 for(const [mode,fix,extra] of [['rafLoop',1,'swayOff'],['rafLoop',1,'noFillBoxAll'],['rafLoop',1,'noFillBox+origins'],['rafLoop',1,'swayOff+others-svg-off']]){
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
  const p=await c.newPage();const cdp=await c.newCDPSession(p);await cdp.send('Performance.enable');
  await p.goto('http://localhost:8099/home-next.html?t=day&first=0',{waitUntil:'load'});await p.waitForTimeout(2500);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  if(fix)await p.evaluate(FIX);if(extra==='swayOff')await p.evaluate(()=>document.querySelectorAll('.wb .sw').forEach(g=>g.style.animation='none'));if(extra==='noFillBoxAll')await p.evaluate(()=>{const st=document.createElement('style');st.textContent='.wb .sw,.wb .spk,.wb .fin{transform-box:view-box!important}';document.head.appendChild(st)});if(extra==='noFillBox+origins')await p.evaluate(()=>{document.querySelectorAll('.wb [style*="transform-box"]').forEach(g=>{});const st=document.createElement('style');st.textContent='.wb .sw{transform-box:view-box!important;transform-origin:60px 86px!important}.wb .spk,.wb .fin{transform-box:view-box!important;transform-origin:60px 60px!important}';document.head.appendChild(st)});if(extra.includes('others'))await p.evaluate(()=>document.getAnimations().forEach(a=>{const t=a.effect.target;if(t&&t.closest&&t.closest('svg'))a.cancel()}));
  if(mode==='rafLoop')await p.evaluate(()=>{(function f(){requestAnimationFrame(f)})()});
  await p.waitForTimeout(1000);
  const m0=await m(cdp);await p.waitForTimeout(6000);const m1=await m(cdp);
  const f=n=>((m1[n]-m0[n])/6*100).toFixed(1);
  console.log(extra.padEnd(26),'task%',f('TaskDuration'),'layout%',f('LayoutDuration'),'style%',f('RecalcStyleDuration'),'layouts/s',((m1.LayoutCount-m0.LayoutCount)/6).toFixed(0));
  await c.close();
 }
 await b.close()})();
