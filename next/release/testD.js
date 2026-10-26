const {chromium}=require('playwright');const fs=require('fs');
const BASE='http://localhost:8977/';
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const out={};
async function run(name,fn){
 const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
 await c.addInitScript(()=>{if(/\/valley\//.test(location.pathname)){try{localStorage.setItem('athar.world.v2',JSON.stringify({intro:true}))}catch(e){}}});
 await c.route('**/*',r=>{const u=r.request().url();if(u.startsWith(BASE)||u.startsWith('data:')||u.startsWith('blob:'))return r.continue();return r.abort()});
 const p=await c.newPage();const U=new Map();
 p.on('response',r=>{const u=r.url();if(u.startsWith(BASE))U.set(u.replace(BASE,'/'),r.status())});
 p.on('requestfailed',r=>{if(r.url().startsWith(BASE))U.set(r.url().replace(BASE,'/'),'FAILED')});
 await fn(p);out[name]=[...U.entries()];await c.close();}
await run('root',async p=>{
 for(const q of ['?first=0&t=day','?first=0&t=evening','?first=0&t=night&h=22']){
  await p.goto(BASE+'index.html'+q);await p.waitForTimeout(2500);
  for(const k of ['quiz','math','lib','adhkar','noor','hifz']){await p.tap('#wb-'+k,{timeout:5000}).catch(()=>{});await p.waitForFunction(()=>document.querySelector('.view.active')?.id!=='view-home',null,{timeout:6000}).catch(()=>{});await p.waitForTimeout(400);
   if(k==='noor'){const pb=await p.$('.view.active .pill-btn');if(pb){await pb.tap();await p.waitForTimeout(1200);const lt=await p.$('.view.active .letter-tile');if(lt){await lt.tap();await p.waitForTimeout(800)}}}
   for(let i=0;i<3&&(await p.evaluate(()=>document.querySelector('.view.active')?.id))!=='view-home';i++){const bk=await p.$('.view.active .back-btn');if(bk){await bk.tap();await p.waitForTimeout(400)}}}
 }});
await run('valley',async p=>{await p.goto(BASE+'valley/');await p.waitForTimeout(3500);await p.click('#enter').catch(()=>{});await p.waitForTimeout(5000);
 await p.evaluate(()=>{const pl=App.places[0];App.open&&0});await p.waitForTimeout(8000)});
fs.writeFileSync('D.json',JSON.stringify(out,null,1));await b.close();
// مقارنة
const sw=fs.readFileSync('/tmp/rc/sw.js','utf8');const core=new Set([...sw.matchAll(/'\.\/([^']+)'/g)].map(m=>'/'+m[1]));
const vsw=fs.readFileSync('/tmp/rc/valley/sw.js','utf8');const pm=vsw.match(/const PRECACHE = \[([\s\S]*?)\];/)[1];
const vpre=new Set([...pm.matchAll(/"([^"]+)"/g)].map(m=>{const x=m[1];return '/'+require('path').normalize('valley/'+x).replace(/\\/g,'/')}));
const bad=[];const miss=[];
for(const [u,s] of out.root){const path=u.split('?')[0];if(s!==200&&s!==304&&s!==206)bad.push('root '+s+' '+u);
  if(!core.has(path)&&path!=='/'&&!/\/nr\/|\/t\d+\.mp3/.test(path)&&!/\.(html)$/.test(path))miss.push('root '+path)}
for(const [u,s] of out.valley){const path=u.split('?')[0];if(s!==200&&s!==304&&s!==206)bad.push('valley '+s+' '+u)}
console.log('root urls',out.root.length,'valley urls',out.valley.length);
console.log('BAD',bad);console.log('root not in CORE_ASSETS (excl html/audio):',miss);
const vn=out.valley.map(([u])=>u.split('?')[0]).filter(p=>/\/next\/|\/valley\/(img|fonts)/.test(p));
console.log('valley local asset requests:',vn.length);console.log('valley not in PRECACHE:',vn.filter(p=>!vpre.has(p)));
console.log('valley precache items:',vpre.size)})();
