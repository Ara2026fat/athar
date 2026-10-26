const {chromium}=require('playwright');
const SLOW={offline:false,latency:150,downloadThroughput:1.6*1024*1024/8,uploadThroughput:750*1024/8};
(async()=>{
 const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
 const p=await c.newPage();const cdp=await c.newCDPSession(p);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await cdp.send('Network.emulateNetworkConditions',{...SLOW,connectionType:'cellular4g'});
 await p.addInitScript(()=>{window.__ls=[];new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__ls.push({t:Math.round(e.startTime),v:+e.value.toFixed(3),s:(e.sources||[]).map(s=>{const n=s.node;return n?(n.nodeName+(n.id?'#'+n.id:'')+(n.className&&n.className.baseVal===undefined?'.'+String(n.className).split(' ')[0]:'')):'?'}).slice(0,3).join(',')})}).observe({type:'layout-shift',buffered:true})});
 await p.goto('http://localhost:8093/home-next.html?t=day&first=0',{waitUntil:'load'});await p.waitForTimeout(2500);
 const ls=await p.evaluate(()=>window.__ls);console.log(JSON.stringify(ls));
 await p.screenshot({path:'/tmp/next/shots/r4_home_slow_final.png'});
 await b.close()})();
