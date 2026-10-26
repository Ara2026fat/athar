const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await c.newPage();
await p.goto('http://localhost:'+process.argv[2]+'/offline-home.html');await p.waitForFunction(()=>navigator.serviceWorker.controller,null,{timeout:20000}).catch(()=>{});await p.waitForTimeout(3000);
console.log((await p.evaluate(async()=>{const o=[];for(const k of await caches.keys()){const c=await caches.open(k);for(const r of await c.keys())o.push(k+' '+r.url.replace(location.origin,''))}return o})).join('\n'));await b.close()})();
