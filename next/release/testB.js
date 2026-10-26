const {chromium}=require('playwright');const {spawn}=require('child_process');
const PORT=8977,BASE='http://localhost:'+PORT+'/';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let srv=null;
const start=async()=>{srv=spawn('python3',['-m','http.server',String(PORT),'--bind','127.0.0.1'],{cwd:'/tmp/rc',stdio:'ignore'});await sleep(1200)};
const stop=async()=>{srv.kill('SIGKILL');await sleep(800)};
const L=m=>console.log(new Date().toISOString().slice(14,19),m);
(async()=>{const R={};await start();
const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const c=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
await c.route('**/*',r=>{const u=r.request().url();if(u.startsWith(BASE)||u.startsWith('data:')||u.startsWith('blob:'))return r.continue();(R.ext=R.ext||[]).push(u.slice(0,90));return r.abort()});
await c.addInitScript(()=>{if(/\/valley\//.test(location.pathname)){try{localStorage.setItem('athar.world.v2',JSON.stringify({intro:true}))}catch(e){}}});
await c.addInitScript(()=>{Date.prototype.getHours=function(){return 12}});
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,120)));
const bad=[];p.on('requestfailed',r=>{if(r.url().startsWith(BASE))bad.push('F '+r.url().replace(BASE,'/'))});p.on('response',r=>{if(r.url().startsWith(BASE)&&r.status()>=400)bad.push(r.status()+' '+r.url().replace(BASE,'/'))});
L('---- مرحلة 1: تثبيت');
// ---- مرحلة 1: تثبيت
await p.goto(BASE+'index.html');await p.waitForTimeout(3000);
await Promise.race([p.evaluate(()=>navigator.serviceWorker.ready.then(()=>1)),new Promise(r=>setTimeout(r,15000))]);await p.waitForTimeout(6000);
R.rootSW=await p.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();const ks=await caches.keys();const o={};for(const k of ks){o[k]=(await (await caches.open(k)).keys()).length}return {scope:r&&r.scope,state:r&&r.active&&r.active.state,caches:o,ctl:!!navigator.serviceWorker.controller}});
L('أبواب الرئيسية لجمع الأصول الديناميكية');
// أبواب الرئيسية لجمع الأصول الديناميكية
await p.goto(BASE+'index.html?first=0');await p.waitForTimeout(2500);
for(const k of ['quiz','math','lib','adhkar','noor','hifz']){await p.tap('#wb-'+k,{timeout:5000}).catch(()=>{});await p.waitForTimeout(900);for(let i=0;i<3&&(await p.evaluate(()=>document.querySelector('.view.active')?.id))!=='view-home';i++){const bk=await p.$('.view.active .back-btn');if(bk){await bk.tap();await p.waitForTimeout(400)}}}
await p.goto(BASE+'index.html');await p.waitForTimeout(2500);
R.p1bad=bad.splice(0);R.p1err=errs.splice(0);
L('الوادي');
// الوادي
await p.goto(BASE+'valley/');await p.waitForTimeout(3000);
await Promise.race([p.evaluate(()=>navigator.serviceWorker.ready.then(()=>1)),new Promise(r=>setTimeout(r,15000))]);await p.waitForTimeout(6000);
R.valleySW=await p.evaluate(async()=>{const regs=await navigator.serviceWorker.getRegistrations();const ks=await caches.keys();const o={};for(const k of ks){o[k]=(await (await caches.open(k)).keys()).length}return {scopes:regs.map(r=>r.scope),caches:o}});
await p.reload();await p.waitForTimeout(2500);
await p.click('#enter').catch(()=>{});await p.waitForTimeout(2500);
R.v1bad=bad.splice(0);R.v1err=errs.splice(0);
L('---- مرحلة 2: دون خادم');
// ---- مرحلة 2: دون خادم
await stop();
const q=await c.newPage();const e2=[],f2=[];q.on('pageerror',e=>e2.push(e.message.slice(0,120)));q.on('requestfailed',r=>{if(r.url().startsWith(BASE))f2.push('F '+r.url().replace(BASE,'/'))});q.on('response',r=>{if(r.url().startsWith(BASE)&&r.status()>=400)f2.push(r.status()+' '+r.url().replace(BASE,'/'))});
await q.goto(BASE+'index.html');await q.waitForTimeout(3500);
R.off_root=await q.evaluate(()=>({world:!!document.getElementById('homeWorld'),doors:document.querySelectorAll('#homeWorld .wb').length,sky:!!document.querySelector('#homeWorld canvas'),imgs:[...document.querySelectorAll('#homeWorld img.p')].map(i=>i.naturalWidth),fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+' '+f.weight)}));
await q.screenshot({path:'shots/B_off_root.png'});
R.off_doors=[];
for(const k of ['quiz','math','lib','adhkar','noor','hifz']){await q.tap('#wb-'+k,{timeout:5000}).catch(()=>{});await q.waitForFunction(()=>document.querySelector('.view.active')?.id!=='view-home',null,{timeout:6000}).catch(()=>{});await q.waitForTimeout(500);R.off_doors.push(k+':'+await q.evaluate(()=>document.querySelector('.view.active')?.id));for(let i=0;i<3&&(await q.evaluate(()=>document.querySelector('.view.active')?.id))!=='view-home';i++){const bk=await q.$('.view.active .back-btn');if(bk){await bk.tap();await q.waitForTimeout(400)}}}
R.off_rootbad=f2.splice(0);R.off_rooterr=e2.splice(0);
L('بدون كلمة المرور: الوادي');
// بدون كلمة المرور: الوادي
await q.goto(BASE+'valley/');await q.waitForTimeout(3500);
R.off_valley=await q.evaluate(()=>({gate:document.getElementById('gate')?.className,hello:(()=>{const i=document.querySelector('#gath');return i?i.naturalWidth||i.getAttribute('href')||'x':null})(),fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family),sky:!!document.getElementById('vxSky')}));
await q.screenshot({path:'shots/B_off_valley_gate.png'});
await q.click('#enter').catch(()=>{});await q.waitForTimeout(3000);
R.off_valley_map=await q.evaluate(()=>({app:!!window.App,places:window.App&&App.places.length,rings:document.querySelectorAll('.vxPr').length,cls:document.getElementById('app')?.className}));
await q.screenshot({path:'shots/B_off_valley_map.png'});
R.off_valleybad=f2.splice(0);R.off_valleyerr=e2.splice(0);
// الدخول إلى درس دون اتصال عبر نقر مكان
await q.evaluate(()=>{try{const p=App.places.find(x=>1);}catch(e){}});
L('---- مرحلة 3: عودة الخادم');
// ---- مرحلة 3: عودة الخادم
await start();
await q.goto(BASE+'index.html');await q.waitForTimeout(3000);
R.back_root=await q.evaluate(()=>!!document.getElementById('homeWorld'));
await q.goto(BASE+'valley/');await q.waitForTimeout(3000);
R.back_valley=await q.evaluate(()=>!!document.getElementById('gate'));
R.errs_after=e2.slice();
await stop();await b.close();
console.log(JSON.stringify(R,null,1));process.exit(0)})().catch(e=>{console.error(e);try{srv.kill('SIGKILL')}catch(_){};process.exit(1)});
