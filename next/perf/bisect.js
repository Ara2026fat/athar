const {chromium}=require('playwright');const {m}=require('./perf.js');
const URL=process.argv[2]||'home-next.html?t=day&first=0';
const variants=JSON.parse(process.argv[3]||'null')||{
 base:{},
 noCssAnim:{css:'*,*::before,*::after{animation:none!important;transition:none!important}'},
 noSMIL:{js:"document.querySelectorAll('svg').forEach(s=>s.pauseAnimations&&s.pauseAnimations())"},
 noSky:{js:"try{document.getElementById('wSky').style.display='none'}catch(e){}"},
 noWorld:{js:"try{document.getElementById('view-home').style.display='none'}catch(e){}"},
};
(async()=>{
 const b=await chromium.launch();
 for(const [k,v] of Object.entries(variants)){
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
  const p=await c.newPage();const cdp=await c.newCDPSession(p);
  await cdp.send('Performance.enable');await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await p.goto('http://localhost:8099/'+URL,{waitUntil:'load'});await p.waitForTimeout(2500);
  if(v.css)await p.addStyleTag({content:v.css});if(v.js)await p.evaluate(v.js);
  await p.waitForTimeout(800);
  const m0=await m(cdp);await p.waitForTimeout(5000);const m1=await m(cdp);
  const f=n=>+((m1[n]-m0[n])/5*100).toFixed(1);
  console.log(k.padEnd(10),'task%',f('TaskDuration'),'layout%',f('LayoutDuration'),'style%',f('RecalcStyleDuration'),'script%',f('ScriptDuration'),'layouts/s',((m1.LayoutCount-m0.LayoutCount)/5).toFixed(0),'recalc/s',((m1.RecalcStyleCount-m0.RecalcStyleCount)/5).toFixed(0));
  await c.close();
 }
 await b.close();
})();
