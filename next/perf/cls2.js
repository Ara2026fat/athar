const {chromium}=require('playwright');
const SLOW={offline:false,latency:150,downloadThroughput:1.6*1024*1024/8,uploadThroughput:750*1024/8};
(async()=>{
 const b=await chromium.launch();
 for(const [n,u] of [['current (tags at end of body)','home-next.html?t=day&first=0'],['tags moved to <head>','__home-headmove.html?t=day&first=0']])for(const cpu of [4]){
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
  const p=await c.newPage();const cdp=await c.newCDPSession(p);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await cdp.send('Network.emulateNetworkConditions',{...SLOW,connectionType:'cellular4g'});await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpu});
  await p.addInitScript(()=>{window.__cls=0;window.__fcp=0;window.__w=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(e.name==='first-contentful-paint')window.__fcp=e.startTime}).observe({type:'paint',buffered:true});const t=setInterval(()=>{if(document.querySelector('.wb')){window.__w=performance.now();clearInterval(t)}},20)});
  await p.goto('http://localhost:8093/'+u,{waitUntil:'load'});await p.waitForTimeout(2500);
  console.log(n.padEnd(32),'cpu'+cpu,JSON.stringify(await p.evaluate(()=>({FCP:Math.round(__fcp),worldVisibleMs:Math.round(__w),CLS:+__cls.toFixed(3)}))));
  await c.close();
 }
 await b.close()})();
