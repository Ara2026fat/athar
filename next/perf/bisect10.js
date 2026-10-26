const {chromium}=require('playwright');const {m}=require('./perf.js');
const V={
 'none (all off)':()=>{document.getElementById('gate').style.display='none';document.getAnimations().forEach(a=>a.cancel())},
 'only twinkle':()=>{document.getElementById('gate').style.display='none';document.getAnimations().forEach(a=>{if(a.animationName!=='twinkle')a.cancel()})},
 'only swayT':()=>{document.getElementById('gate').style.display='none';document.getAnimations().forEach(a=>{if(a.animationName!=='swayT')a.cancel()})},
 'only vxdrift':()=>{document.getElementById('gate').style.display='none';document.getAnimations().forEach(a=>{if(a.animationName!=='vxdrift')a.cancel()})},
 'only drift':()=>{document.getElementById('gate').style.display='none';document.getAnimations().forEach(a=>{if(a.animationName!=='drift')a.cancel()})},
 'only flow':()=>{document.getElementById('gate').style.display='none';document.getAnimations().forEach(a=>{if(a.animationName!=='flow')a.cancel()})},
 'only pulse':()=>{document.getElementById('gate').style.display='none';document.getAnimations().forEach(a=>{if(a.animationName!=='pulse')a.cancel()})},
 'only rustle':()=>{document.getElementById('gate').style.display='none';document.getAnimations().forEach(a=>{if(a.animationName!=='rustle')a.cancel()})},
 'only sway':()=>{document.getElementById('gate').style.display='none';document.getAnimations().forEach(a=>{if(a.animationName!=='sway')a.cancel()})},
 'only boyBreathe':()=>{document.getElementById('gate').style.display='none';document.getAnimations().forEach(a=>{if(a.animationName!=='boyBreathe')a.cancel()})},
 'only vxlan':()=>{document.getElementById('gate').style.display='none';document.getAnimations().forEach(a=>{if(a.animationName!=='vxlan')a.cancel()})},
 'only breathe':()=>{document.getElementById('gate').style.display='none';document.getAnimations().forEach(a=>{if(a.animationName!=='breathe')a.cancel()})},
 'only blinkA':()=>{document.getElementById('gate').style.display='none';document.getAnimations().forEach(a=>{if(a.animationName!=='blinkA')a.cancel()})},
 'only beckon':()=>{document.getElementById('gate').style.display='none';document.getAnimations().forEach(a=>{if(a.animationName!=='beckon')a.cancel()})},
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
