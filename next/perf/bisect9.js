const {chromium}=require('playwright');const {m}=require('./perf.js');
const V={
 base:()=>{},
 'gate display:none':()=>{document.getElementById('gate').style.display='none'},
 'gate anims cancel':()=>{document.getAnimations().forEach(a=>{const t=a.effect.target;if(t&&t.closest&&t.closest('#gate'))a.cancel()})},
 'gate none + twinkle off':()=>{document.getElementById('gate').style.display='none';document.getAnimations().forEach(a=>{if(a.animationName==='twinkle')a.cancel()})},
 'gate none + swayT off':()=>{document.getElementById('gate').style.display='none';document.getAnimations().forEach(a=>{if(a.animationName==='swayT')a.cancel()})},
 'gate none + stars+tufts off':()=>{document.getElementById('gate').style.display='none';document.getAnimations().forEach(a=>{if(['twinkle','swayT'].includes(a.animationName))a.cancel()})},
 'gate none + all svg anims off':()=>{document.getElementById('gate').style.display='none';document.getAnimations().forEach(a=>{const t=a.effect.target;if(t&&t.closest&&t.closest('svg'))a.cancel()})},
 'everything off':()=>{document.getAnimations().forEach(a=>a.cancel())},
};
(async()=>{
 const b=await chromium.launch();
 for(const [k,fn] of Object.entries(V)){
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
  const p=await c.newPage();const cdp=await c.newCDPSession(p);
  await cdp.send('Performance.enable');
  await p.goto('http://localhost:8099/valley/next.html',{waitUntil:'load'});await p.waitForTimeout(2000);await p.click('#enter');await p.waitForTimeout(3500);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await p.evaluate(fn);await p.waitForTimeout(800);
  const m0=await m(cdp);await p.waitForTimeout(5000);const m1=await m(cdp);
  const f=n=>+((m1[n]-m0[n])/5*100).toFixed(1);
  console.log(k.padEnd(30),'task%',f('TaskDuration'),'layout%',f('LayoutDuration'),'style%',f('RecalcStyleDuration'),'script%',f('ScriptDuration'));
  await c.close();
 }
 await b.close();
})();
