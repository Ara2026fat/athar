const {chromium}=require('playwright');
const {SLOW4G}=require('./perf.js');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
const p=await c.newPage();await p.addInitScript(`window.__ls=[];new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__ls.push([Math.round(e.startTime),+e.value.toFixed(3),(e.sources||[]).map(s=>{const n=s.node;return n?(n.id?'#'+n.id:(n.className&&n.className.baseVal!==undefined?n.className.baseVal:n.className)||n.nodeName):'?'}).join(',')])}).observe({type:'layout-shift',buffered:true})`);
const cdp=await c.newCDPSession(p);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('Network.emulateNetworkConditions',SLOW4G);
await p.goto('http://localhost:8093/home-next.html?t=day&first=0',{waitUntil:'load'});await p.waitForTimeout(4000);
console.log(JSON.stringify(await p.evaluate(()=>window.__ls)));await b.close()})();
