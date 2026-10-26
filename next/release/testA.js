const {chromium}=require('playwright');
const BASE=process.env.BASE||'http://localhost:8977/';
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const res={ext:[],bad:[],pageerr:[],doors:[],nr:[]};
const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
await c.route('**/*',r=>{const u=r.request().url();if(u.startsWith(BASE)||u.startsWith('data:')||u.startsWith('blob:'))return r.continue();
  if(/everyayah\.com/.test(u))return r.abort();   // مسموح بالاسم لكن لا شبكة هنا
  res.ext.push(u.slice(0,100));return r.abort();});
await c.addInitScript(()=>{if(/\/valley\//.test(location.pathname)){try{localStorage.setItem('athar.world.v2',JSON.stringify({intro:true}))}catch(e){}}});
const p=await c.newPage();
p.on('pageerror',e=>res.pageerr.push(e.message.slice(0,150)));
p.on('response',r=>{const u=r.url();if(u.startsWith(BASE)&&r.status()>=400)res.bad.push(r.status()+' '+u.replace(BASE,'/'));if(/\/nr\//.test(u))res.nr.push(r.status()+' '+u.replace(BASE,'/'))});
p.on('requestfailed',r=>{const u=r.url();if(u.startsWith(BASE))res.bad.push('FAILED '+u.replace(BASE,'/'))});
await p.goto(BASE+'index.html?first=0&t=day');await p.waitForTimeout(3500);
res.world=await p.evaluate(()=>({world:!!document.getElementById('homeWorld'),doors:document.querySelectorAll('#homeWorld .wb').length,active:document.querySelector('.view.active')?.id,fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+' '+f.weight)}));
await p.screenshot({path:'shots/A_home.png'});
const act=()=>p.evaluate(()=>document.querySelector('.view.active')?.id);
for(const k of ['hifz','noor','lib','math','quiz','adhkar']){
  await p.tap('#wb-'+k);
  await p.waitForFunction(()=>document.querySelector('.view.active')?.id!=='view-home',null,{timeout:4000}).catch(()=>{});
  const a=await act();
  if(k==='noor'){await p.waitForTimeout(800);const pb=await p.$('.view.active .pill-btn');if(pb){await pb.tap();await p.waitForTimeout(1500);const lt=await p.$('.view.active .letter-tile');if(lt){await lt.tap();await p.waitForTimeout(1500)}}}
  await p.waitForTimeout(500);
  await p.screenshot({path:'shots/A_door_'+k+'.png'});
  // back (may take 2 taps if nested)
  for(let i=0;i<3&&(await act())!=='view-home';i++){const bk=await p.$('.view.active .back-btn[data-go="home"]')||await p.$('.view.active .back-btn');if(bk){await bk.tap();await p.waitForTimeout(500)}}
  res.doors.push(k+' -> '+a+' back='+await act());
}
// الوادي
await p.waitForTimeout(500);
const nav=p.waitForURL(/valley\//,{timeout:8000}).catch(e=>null);
await p.tap('#wb-valley');await nav;await p.waitForTimeout(3500);
res.valleyUrl=p.url();
res.valleyState=await p.evaluate(()=>({gate:document.getElementById('gate')?.className,enter:!!document.getElementById('enter'),home:document.getElementById('vhome')?.getAttribute('href')}));
await p.screenshot({path:'shots/A_valley_arrive.png'});
await p.click('#enter').catch(()=>{});await p.waitForTimeout(2500);
await p.screenshot({path:'shots/A_valley_map.png'});
const nav2=p.waitForURL(/index\.html|\/$/,{timeout:6000}).catch(()=>null);
await p.click('#vhome').catch(e=>res.pageerr.push('vhome click '+e.message.slice(0,80)));
await nav2;await p.waitForTimeout(2500);
res.backUrl=p.url();res.backWorld=await p.evaluate(()=>!!document.getElementById('homeWorld'));
console.log(JSON.stringify(res,null,1));await b.close()})();
