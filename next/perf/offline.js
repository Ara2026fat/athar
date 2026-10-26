const {chromium}=require('playwright');const {spawn}=require('child_process');
const sw=process.argv[2];const label=process.argv[3];const port=8090+Math.floor(Math.random()*9);
(async()=>{
 const srv=spawn('python3',['/home/claude/athar/next/perf/srv.py',String(port),sw],{stdio:'ignore'});await new Promise(r=>setTimeout(r,1200));
 const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});
 const p=await c.newPage();await p.addInitScript(()=>{try{localStorage.setItem('athar_home_w_v1_p1','{"seen":1}')}catch(e){}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:'+port+'/offline-home.html');
 await p.waitForFunction(()=>navigator.serviceWorker&&navigator.serviceWorker.controller,null,{timeout:20000}).catch(()=>{});
 await p.waitForTimeout(4000);
 const ctl=await p.evaluate(()=>!!navigator.serviceWorker.controller);
 const keys=await p.evaluate(async()=>{const o={};for(const k of await caches.keys()){const c=await caches.open(k);o[k]=(await c.keys()).length}return o});
 console.log(label,'controlled',ctl,'caches',JSON.stringify(keys));
 srv.kill();await new Promise(r=>setTimeout(r,800));
 const failed=[];p.on('requestfailed',r=>failed.push(r.url().replace('http://localhost:'+port,'')+' '+(r.failure()||{}).errorText));
 await p.reload({waitUntil:'load'}).catch(e=>console.log('reload error',e.message.split('\n')[0]));
 await p.waitForTimeout(3500);
 const st=await p.evaluate(()=>({title:document.title,doors:document.querySelectorAll('.wb').length,sky:!!document.querySelector('#wSky canvas,#wSky .sk-cv'),imgs:[...document.querySelectorAll('img.p')].map(i=>i.naturalWidth>0),fonts:['Baloo Bhaijan 2','Tajawal'].map(f=>document.fonts.check('16px "'+f+'"')),fl:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+' '+f.weight),worldCss:!!getComputedStyle(document.getElementById('view-home')).backgroundImage,hw:document.getElementById('app')&&document.getElementById('app').className}));
 console.log(label,'offline state',JSON.stringify(st));console.log(label,'failed offline requests',JSON.stringify(failed));
 await p.screenshot({path:'/tmp/next/shots/r4_offline_'+label+'.png'});
 // open doors offline
 for(const k of ['quiz','math','lib','adhkar','hifz','noor']){await p.evaluate(k=>{const e=document.querySelector('#wb-'+k);e&&e.click()},k);await p.waitForTimeout(700);console.log(label,'door',k,'->',await p.evaluate(()=>[...document.querySelectorAll('.view.active')].map(v=>v.id).join()));await p.evaluate(()=>{const bk=document.querySelector('.view.active .back-btn,.view.active [data-back],.view.active .back');bk&&bk.click()});await p.waitForTimeout(400)}
 console.log(label,'errs',errs.length?errs:'none');
 await b.close();srv.kill()})();
