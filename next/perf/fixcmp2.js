const {chromium}=require('playwright');const {m}=require('./perf.js');
const src=require('fs').readFileSync('fixcmp.js','utf8');const FIX=eval(src.match(/const FIX=(`[\s\S]*?`);/)[1]);
(async()=>{
 const b=await chromium.launch();
 for(const mode of ['noRaf','rafLoop'])for(const fix of [0,1]){
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
  const p=await c.newPage();const cdp=await c.newCDPSession(p);await cdp.send('Performance.enable');
  await p.goto('http://localhost:8099/home-next.html?t=day&first=0',{waitUntil:'load'});await p.waitForTimeout(2500);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  if(fix)await p.evaluate(FIX);
  if(mode==='rafLoop')await p.evaluate(()=>{(function f(){requestAnimationFrame(f)})()});
  await p.waitForTimeout(1000);
  const m0=await m(cdp);await p.waitForTimeout(6000);const m1=await m(cdp);
  const f=n=>((m1[n]-m0[n])/6*100).toFixed(1);
  console.log(mode.padEnd(8),fix?'FIXED ':'current','task%',f('TaskDuration'),'layout%',f('LayoutDuration'),'style%',f('RecalcStyleDuration'),'layouts/s',((m1.LayoutCount-m0.LayoutCount)/6).toFixed(0));
  await c.close();
 }
 await b.close()})();
