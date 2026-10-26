const {chromium}=require('playwright');
const base='http://localhost:8099/';
(async()=>{
 const b=await chromium.launch();const urls=new Map();
 const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
 const p=await c.newPage();
 p.on('response',async r=>{try{const u=r.url();const buf=await r.body().catch(()=>null);if(!urls.has(u))urls.set(u,{status:r.status(),size:buf?buf.length:0})}catch(e){}});
 p.on('requestfailed',r=>{if(!urls.has(r.url()))urls.set(r.url(),{status:'FAILED',size:0})});
 await p.goto(base+'valley/next.html');await p.waitForTimeout(2500);
 await p.click('#enter');await p.waitForTimeout(2000);
 for(let i=0;i<3;i++){await p.click('.ibtn').catch(()=>{});await p.waitForTimeout(1200)}
 await p.waitForTimeout(1500);
 // try to tap places
 const places=await p.$$('.place,.plabel');console.log('places',places.length);
 for(const pl of places.slice(0,6)){await pl.click({timeout:2000,force:true}).catch(()=>{});await p.waitForTimeout(1500);await p.screenshot({path:'/dev/null'}).catch(()=>{})}
 await p.waitForTimeout(2000);
 await b.close();
 let tot=0;[...urls.entries()].forEach(([u,v])=>{const s=u.replace(base,'/');console.log(String(v.status).padEnd(7),String(v.size).padStart(9),s.slice(0,110));tot+=v.size});console.log('total',tot);
})();
