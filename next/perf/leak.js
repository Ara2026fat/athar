const INIT=`
(()=>{
 window.__raf={sched:0,cancel:0,live:new Set(),calls:0,perCb:new Map()};
 const R=window.requestAnimationFrame.bind(window),C=window.cancelAnimationFrame.bind(window);
 window.requestAnimationFrame=function(cb){window.__raf.sched++;const id=R(function(t){window.__raf.live.delete(id);window.__raf.calls++;cb(t)});window.__raf.live.add(id);return id};
 window.cancelAnimationFrame=function(id){window.__raf.cancel++;window.__raf.live.delete(id);return C(id)};
 window.__lt=[];window.__fcp=null;window.__lcp=null;
 try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lt.push([Math.round(e.startTime),Math.round(e.duration)])}).observe({type:'longtask',buffered:true})}catch(e){}
 try{new PerformanceObserver(l=>{for(const e of l.getEntries())if(e.name==='first-contentful-paint')window.__fcp=e.startTime}).observe({type:'paint',buffered:true})}catch(e){}
 try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true})}catch(e){}
 window.__fps=function(ms){return new Promise(res=>{const d=[];let last=0,t0=performance.now();function f(t){if(last)d.push(t-last);last=t;if(performance.now()-t0<ms)R(f);else{const n=d.length;const tot=d.reduce((a,b)=>a+b,0);const s=d.slice().sort((a,b)=>a-b);res({frames:n,fps:+(n/(tot/1000)).toFixed(1),p95ms:+s[Math.floor(n*.95)].toFixed(1),maxms:+s[n-1].toFixed(1),over50:d.filter(x=>x>50).length})}}R(f)})};
})();`;
const {chromium}=require('playwright');const {m}=require('./perf.js');
(async()=>{
 const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
 const p=await c.newPage();await p.addInitScript(INIT);const cdp=await c.newCDPSession(p);await cdp.send('Performance.enable');
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:8099/home-next.html?t=day&first=0');await p.waitForTimeout(3000);
 const snap=async(l)=>{const a=await p.evaluate(()=>({calls:__raf.calls,live:__raf.live.size,sched:__raf.sched}));await p.waitForTimeout(3000);const z=await p.evaluate(()=>({calls:__raf.calls,live:__raf.live.size,sched:__raf.sched}));
  const m0=await m(cdp);await p.waitForTimeout(3000);const m1=await m(cdp);
  console.log(l.padEnd(22),'rAF calls/s',((z.calls-a.calls)/3).toFixed(1),'live',z.live,'| task%',((m1.TaskDuration-m0.TaskDuration)/3*100).toFixed(1),'layouts/s',((m1.LayoutCount-m0.LayoutCount)/3).toFixed(0),'recalc/s',((m1.RecalcStyleCount-m0.RecalcStyleCount)/3).toFixed(0),'heapMB',(m1.JSHeapUsedSize/1048576).toFixed(1),'nodes',m1.Nodes,'listeners',m1.JSEventListeners)};
 await snap('home idle');
 // touch interaction: drag world a bit (tilt) and tap the boy to see rAF runs and settles
 await p.touchscreen.tap(195,600);await p.waitForTimeout(1500);await snap('home after tap');
 for(const door of ['quiz','math','lib','adhkar','hifz','noor']){
   const id='#wb-'+door;const ok=await p.$(id);if(!ok){console.log('no',id);continue}
   await p.evaluate(id=>document.querySelector(id).click(),id);await p.waitForTimeout(1500);
   const act=await p.evaluate(()=>[...document.querySelectorAll('.view.active')].map(v=>v.id).join());
   await snap('in '+door+' ('+act+')');
   // back
   await p.evaluate(()=>{const bk=document.querySelector('.view.active .back-btn,.view.active [data-back],.view.active .back');if(bk)bk.click();else if(window.showView)showView('home')});await p.waitForTimeout(1200);
   const act2=await p.evaluate(()=>[...document.querySelectorAll('.view.active')].map(v=>v.id).join());
   console.log('  back ->',act2);
 }
 await snap('home after all');
 // visibility hidden
 await p.evaluate(()=>{Object.defineProperty(document,'hidden',{get:()=>true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))});await p.waitForTimeout(500);await snap('hidden tab');
 console.log('errs',errs);
 await b.close()})();
