const {chromium}=require('playwright');const {m}=require('./perf.js');
const cpu=+(process.argv[2]||4);const mode=process.argv[3]||'list';
(async()=>{
 const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
 const p=await c.newPage();const cdp=await c.newCDPSession(p);await cdp.send('Performance.enable');
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:8099/valley/next.html');await p.waitForTimeout(2500);
 await p.click('#enter');await p.waitForTimeout(6000);
 await p.screenshot({path:'/tmp/next/shots/r4_valley_after_enter.png'});
 const st=await p.evaluate(()=>({gate:document.getElementById('gate').className,vis:[...document.querySelectorAll('[id]')].filter(e=>e.getBoundingClientRect().width>300&&e.getBoundingClientRect().height>400).map(e=>e.tagName+'#'+e.id+' '+getComputedStyle(e).display+'/'+getComputedStyle(e).visibility).slice(0,20)}));
 console.log(JSON.stringify(st),errs);
 if(cpu>1)await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpu});
 const map={};await p.evaluate(()=>0);
 const r=await p.evaluate(()=>{const map={};document.getAnimations().forEach(a=>{const e=a.effect,t=e.target;if(!t)return;const n=a.animationName||'?';const o=map[n]||(map[n]={n:0,st:a.playState,s:t.tagName+'#'+t.id+'.'+(t.getAttribute&&t.getAttribute('class')||''),props:Object.keys(e.getKeyframes()[0]||{}).filter(x=>!['offset','easing','composite','computedOffset'].includes(x)).join(',')});o.n++});return map});
 Object.entries(r).sort((a,b)=>b[1].n-a[1].n).forEach(([k,v])=>console.log(k,JSON.stringify(v)));
 await p.waitForTimeout(500);
 const m0=await m(cdp);const fps=await p.evaluate(()=>new Promise(res=>{let n=0,t0=performance.now();function f(){n++;if(performance.now()-t0<4000)requestAnimationFrame(f);else res(n/4)}requestAnimationFrame(f)}));const m1=await m(cdp);
 console.log('after-enter cpu'+cpu,'fps',fps,'task%',((m1.TaskDuration-m0.TaskDuration)/4*100).toFixed(1),'layout%',((m1.LayoutDuration-m0.LayoutDuration)/4*100).toFixed(1),'style%',((m1.RecalcStyleDuration-m0.RecalcStyleDuration)/4*100).toFixed(1),'nodes',m1.Nodes);
 await b.close()})();
