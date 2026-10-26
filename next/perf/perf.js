const {chromium}=require('playwright');
const fs=require('fs');
const BASE='http://localhost:8099/';
const SLOW4G={offline:false,latency:150,downloadThroughput:1.6*1024*1024/8,uploadThroughput:750*1024/8,connectionType:'cellular4g'};
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
async function m(cdp){const r=await cdp.send('Performance.getMetrics');const o={};r.metrics.forEach(x=>o[x.name]=x.value);return o}
async function run(name,url,w,h,cpu,net,opts={}){
 const b=await chromium.launch();
 const c=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
 const p=await c.newPage();await p.addInitScript(INIT);
 const cdp=await c.newCDPSession(p);
 await cdp.send('Performance.enable');await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 if(cpu>1)await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpu});
 if(net)await cdp.send('Network.emulateNetworkConditions',net);
 let bytes=0,reqs=0;cdp.on('Network.loadingFinished',e=>{bytes+=e.encodedDataLength;reqs++});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 const t0=Date.now();
 await p.goto(BASE+url,{waitUntil:'load',timeout:180000});
 const tLoad=Date.now()-t0;
 const o={name,cpu,net:!!net,loadMs:tLoad,bytesKB:Math.round(bytes/1024),reqs,errs};
 await p.waitForFunction(()=>window.__fcp!=null,null,{timeout:60000}).catch(()=>{});
 if(opts.ready){await p.waitForSelector(opts.ready,{timeout:90000,state:'attached'}).catch(()=>{});}
 const nav=await p.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return {dcl:Math.round(n.domContentLoadedEventEnd),load:Math.round(n.loadEventEnd),ttfb:Math.round(n.responseStart)}});
 Object.assign(o,nav);
 await p.waitForTimeout(opts.settle||2500);
 o.fcp=await p.evaluate(()=>Math.round(window.__fcp||-1));o.lcp=await p.evaluate(()=>Math.round(window.__lcp||-1));
 o.longtasks=await p.evaluate(()=>window.__lt);
 o.ltTotal=o.longtasks.reduce((a,x)=>a+x[1],0);o.ltBlocking=o.longtasks.reduce((a,x)=>a+Math.max(0,x[1]-50),0);
 // idle window
 const m0=await m(cdp);const ltN=o.longtasks.length;
 const fps=await p.evaluate(()=>window.__fps(6000));
 const m1=await m(cdp);
 o.fps=fps;
 const d=k=>+((m1[k]-m0[k])*1000/6000/1000*100).toFixed(1); // % of wall
 o.idle={taskPct:+((m1.TaskDuration-m0.TaskDuration)/6*100).toFixed(1),scriptPct:+((m1.ScriptDuration-m0.ScriptDuration)/6*100).toFixed(1),layoutPct:+((m1.LayoutDuration-m0.LayoutDuration)/6*100).toFixed(1),stylePct:+((m1.RecalcStyleDuration-m0.RecalcStyleDuration)/6*100).toFixed(1)};
 o.ltIdle=(await p.evaluate(()=>window.__lt.length))-ltN;
 const mm=await m(cdp);
 o.nodes=mm.Nodes;o.heapMB=+(mm.JSHeapUsedSize/1048576).toFixed(1);o.heapTotMB=+(mm.JSHeapTotalSize/1048576).toFixed(1);o.listeners=mm.JSEventListeners;
 o.domCount=await p.evaluate(()=>({all:document.getElementsByTagName('*').length,svg:document.querySelectorAll('svg *').length,anim:document.querySelectorAll('animate,animateTransform,animateMotion,set').length,filters:document.querySelectorAll('filter').length,imgs:document.images.length}));
 o.raf=await p.evaluate(()=>({sched:__raf.sched,calls:__raf.calls,live:__raf.live.size}));
 if(opts.after){o.after=await opts.after(p,cdp)}
 await b.close();return o;
}
module.exports={run,SLOW4G,m};
if(require.main===module){(async()=>{
 const which=process.argv[2];const out=[];
 const cfg=[[1,null],[4,SLOW4G],[6,SLOW4G],[4,null],[6,null]];
 const pages={home:['home-next.html?t=day&first=0',390,844,'#wSky'],valley:['valley/next.html',390,844,'#gate']};
 for(const [cpu,net] of cfg){
  const [u,w,h,rd]=pages[which];
  const r=await run(which,u,w,h,cpu,net,{ready:rd});
  console.log(JSON.stringify(r));out.push(r);
 }
 fs.writeFileSync('/home/claude/athar/next/perf/res_'+which+'.json',JSON.stringify(out,null,1));
})()}
