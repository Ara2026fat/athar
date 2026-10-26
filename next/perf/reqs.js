const {chromium}=require('playwright');
const base=process.argv[2]||'http://localhost:8099/';
(async()=>{
 const b=await chromium.launch();const urls=new Map();
 for(const q of ['home-next.html?t=day&first=0','home-next.html?t=night&first=0','home-next.html?t=evening&first=1']){
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
  const p=await c.newPage();
  p.on('response',async r=>{try{const u=r.url();const buf=await r.body().catch(()=>null);if(!urls.has(u))urls.set(u,{status:r.status(),size:buf?buf.length:0,type:r.headers()['content-type']})}catch(e){}});
  p.on('requestfailed',r=>{if(!urls.has(r.url()))urls.set(r.url(),{status:'FAILED',size:0})});
  await p.goto(base+q);await p.waitForTimeout(2500);
  for(const k of ['quiz','math','lib','adhkar','hifz','noor']){
    await p.evaluate(k=>{const e=document.querySelector('#wb-'+k);e&&e.click()},k);await p.waitForTimeout(900);
    await p.evaluate(()=>{const bk=document.querySelector('.view.active .back-btn,.view.active [data-back],.view.active .back');bk&&bk.click()});await p.waitForTimeout(500);
  }
  await p.touchscreen.tap(195,640);await p.waitForTimeout(800);
  await c.close();
 }
 await b.close();
 let tot=0;const rows=[...urls.entries()].map(([u,v])=>[u.replace(base,'/'),v]);
 rows.forEach(([u,v])=>{if(!u.startsWith('data:'))console.log(String(v.status).padEnd(7),String(v.size).padStart(9),u.slice(0,110));tot+=v.size});
 console.log('total',tot);
})();
