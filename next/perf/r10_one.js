const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});const p=await c.newPage();const cdp=await c.newCDPSession(p);await cdp.send('Performance.enable');
await p.goto('http://localhost:8099/home-next.html?t=day&first=0');await p.waitForTimeout(2000);
await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await p.waitForTimeout(500);
const m=async()=>{const r=await cdp.send('Performance.getMetrics');const o={};r.metrics.forEach(x=>o[x.name]=x.value);return o};
const a=await m();await p.waitForTimeout(2500);const z=await m();console.log((((z.TaskDuration-a.TaskDuration)/2.5)*100).toFixed(1));await b.close()})();
