const {chromium}=require('playwright');const {spawn}=require('child_process');
(async()=>{
 const port=8085;const srv=spawn('python3',['-m','http.server',String(port)],{cwd:'/home/claude/athar',stdio:'ignore'});await new Promise(r=>setTimeout(r,1200));
 const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await c.newPage();
 await p.goto('http://localhost:'+port+'/');await p.waitForFunction(()=>navigator.serviceWorker.controller,null,{timeout:30000}).catch(()=>{});await p.waitForTimeout(6000);
 const keys=await p.evaluate(async()=>{const o=[];for(const k of await caches.keys()){if(!k.startsWith('athar-quran-u'))continue;const c=await caches.open(k);for(const r of await c.keys())if(!/\.(mp3|json|bin)$/.test(r.url))o.push(r.url.replace(location.origin,''))}return o});
 console.log('non-audio/json cache keys after 1st session:',keys.join(' '));
 srv.kill();await new Promise(r=>setTimeout(r,800));
 for(const u of ['/','/index.html']){const q=await c.newPage();let ok=true;try{await q.goto('http://localhost:'+port+u,{timeout:8000});await q.waitForTimeout(1000);console.log('offline',u,'->',await q.title())}catch(e){console.log('offline',u,'-> FAIL',e.message.split('\n')[0])}await q.close()}
 await b.close()})();
