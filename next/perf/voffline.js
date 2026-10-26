const {chromium}=require('playwright');const {spawn}=require('child_process');
const sw=process.argv[2];const label=process.argv[3];const port=8070+Math.floor(Math.random()*9);
(async()=>{
 const srv=spawn('python3',['/home/claude/athar/next/perf/srv.py',String(port),sw],{stdio:'ignore'});await new Promise(r=>setTimeout(r,1200));
 const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:'+port+'/valley/next-offline.html');
 await p.waitForFunction(()=>navigator.serviceWorker.controller,null,{timeout:20000}).catch(()=>{});await p.waitForTimeout(5000);
 console.log(label,'controlled',await p.evaluate(()=>!!navigator.serviceWorker.controller),JSON.stringify(await p.evaluate(async()=>{const o={};for(const k of await caches.keys()){o[k]=(await (await caches.open(k)).keys()).length}return o})));
 srv.kill();await new Promise(r=>setTimeout(r,800));
 const failed=[];p.on('requestfailed',r=>failed.push(r.url().replace('http://localhost:'+port,'')));
 await p.reload({waitUntil:'load'}).catch(e=>console.log('reload err',e.message.split('\n')[0]));await p.waitForTimeout(3500);
 const st=await p.evaluate(()=>({gate:!!document.getElementById('gate'),helloImg:(document.getElementById('gath')||{}).naturalWidth,rubik:document.fonts.check('16px Rubik'),vxSky:!!document.getElementById('vxSky'),vxCss:getComputedStyle(document.body).fontFamily.slice(0,20)}));
 console.log(label,'offline',JSON.stringify(st),'failed',JSON.stringify(failed),'errs',errs.length?errs:'none');
 await p.screenshot({path:'/tmp/next/shots/r4_voffline_'+label+'.png'});
 await b.close();srv.kill()})();
