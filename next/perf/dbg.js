const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await c.newPage();
p.on('console',m=>console.log('console',m.text().slice(0,200)));p.on('pageerror',e=>console.log('err',e.message));
await p.goto('http://localhost:8098/offline-home.html');await p.waitForTimeout(5000);
console.log(await p.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistrations();return JSON.stringify(r.map(x=>({scope:x.scope,a:x.active&&x.active.state,i:x.installing&&x.installing.state,w:x.waiting&&x.waiting.state})))}));
await b.close()})();
