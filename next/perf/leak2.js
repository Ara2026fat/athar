const {chromium}=require('playwright');const {m}=require('./perf.js');
(async()=>{
 const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
 const p=await c.newPage();const cdp=await c.newCDPSession(p);await cdp.send('Performance.enable');await cdp.send('HeapProfiler.enable');
 await p.goto('http://localhost:8099/home-next.html?t=day&first=0');await p.waitForTimeout(2500);
 for(let i=0;i<8;i++){
  await p.evaluate(()=>document.querySelector('#wb-quiz').click());await p.waitForTimeout(500);
  await p.evaluate(()=>{const bk=document.querySelector('.view.active .back-btn,.view.active [data-back],.view.active .back');bk&&bk.click()});await p.waitForTimeout(500);
  await cdp.send('HeapProfiler.collectGarbage');const mm=await m(cdp);
  console.log(i,'heapMB',(mm.JSHeapUsedSize/1048576).toFixed(2),'nodes',mm.Nodes,'listeners',mm.JSEventListeners,'docs',mm.Documents);
 }
 await b.close()})();
