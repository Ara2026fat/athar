const {chromium}=require('playwright');
const SLOW={offline:false,latency:150,downloadThroughput:1.6*1024*1024/8,uploadThroughput:750*1024/8};
(async()=>{
 const b=await chromium.launch();
 for(const [name,url,cpu] of [['home CURRENT (google link blocked)','http://localhost:8099/home-next.html',4],['valley CURRENT','http://localhost:8099/valley/next.html',4]]){
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
  const p=await c.newPage();const cdp=await c.newCDPSession(p);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpu});await cdp.send('Network.emulateNetworkConditions',{...SLOW,connectionType:'cellular4g'});
  const ext=[];const fontReq=[];p.on('request',r=>{const u=r.url();if(!u.startsWith('http://localhost')&&!u.startsWith('data:'))ext.push(u.slice(0,60));if(/\.woff2/.test(u))fontReq.push([u.split('/').pop(),Date.now()])});
  await p.addInitScript(()=>{window.__cls=0;window.__fcp=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(e.name==='first-contentful-paint')window.__fcp=e.startTime}).observe({type:'paint',buffered:true})});
  const t0=Date.now();await p.goto(url,{waitUntil:'load',timeout:120000});const tl=Date.now()-t0;await p.waitForTimeout(3000);
  const r=await p.evaluate(()=>({fcp:Math.round(__fcp),cls:+__cls.toFixed(4),loaded:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+' '+f.weight),unloaded:[...document.fonts].filter(f=>f.status!=='loaded').map(f=>f.family+' '+f.weight+' '+f.status)}));
  console.log(name,'cpu'+cpu,'loadMs',tl,JSON.stringify(r),'externalReqs',ext.length,'fontReqs',fontReq.map(x=>x[0]).join(','));
  await c.close();
 }
 await b.close()})();
