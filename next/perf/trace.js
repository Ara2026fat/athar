const {chromium}=require('playwright');
const URL=process.argv[2];const css=process.argv[3]||'';const cpu=+(process.argv[4]||4);
(async()=>{
 const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
 const p=await c.newPage();const cdp=await c.newCDPSession(p);
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpu});
 await p.goto('http://localhost:8099/'+URL,{waitUntil:'load'});await p.waitForTimeout(3000);
 if(css)await p.addStyleTag({content:css});await p.waitForTimeout(500);
 const ev=[];cdp.on('Tracing.dataCollected',e=>ev.push(...e.value));
 await cdp.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline',transferMode:'ReportEvents'});
 await p.waitForTimeout(4000);
 const done=new Promise(r=>cdp.once('Tracing.tracingComplete',r));await cdp.send('Tracing.end');await done;
 const agg={};let span=4000;
 for(const e of ev){if(e.ph!=='X'||!e.dur)continue;const a=agg[e.name]||(agg[e.name]={n:0,ms:0});a.n++;a.ms+=e.dur/1000}
 const top=Object.entries(agg).sort((a,b)=>b[1].ms-a[1].ms).slice(0,16);
 top.forEach(([k,v])=>console.log(k.padEnd(34),String(v.n).padStart(6),(v.ms/4).toFixed(0).padStart(7),'ms/s'));
 const fr=ev.filter(e=>e.name==='DrawFrame'||e.name==='BeginFrame').length;console.log('frames',fr);
 await b.close();})();
